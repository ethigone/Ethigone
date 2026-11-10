// Vérifie le HTML servi et les règles CSS compilées. Aucun moteur de rendu visuel.
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { parse } = require("next/dist/compiled/node-html-parser");
const { Miniflare } = require(require.resolve("miniflare", { paths: [require.resolve("wrangler")] }));
const postcss = require(require.resolve("postcss", { paths: [require.resolve("@tailwindcss/postcss")] }));
const base = "https://ethigone.test";
const serveur = path.resolve("dist/server");
const config = JSON.parse(await readFile(path.join(serveur, "wrangler.json"), "utf8"));
const modules = (await readdir(serveur, { recursive: true })).filter(f => f.endsWith(".js") && f !== config.main);
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/navigation-j7-"));
const email = "administration-test@example.invalid";
const identite = { "oai-authenticated-user-id": "navigation-j7", "oai-authenticated-user-email": email };
const mf = new Miniflare({
  cf: false, compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
  modulesRoot: serveur, modules: [config.main, ...modules].map(f => ({ type: "ESModule", path: path.join(serveur, f) })),
  d1Databases: ["DB"], d1Persist: temp, bindings: { ETHIGONE_ADMIN_BOOTSTRAP_EMAIL: email },
});
function demander(route, headers = identite, options = {}) {
  return mf.dispatchFetch(new URL(route, base).href, { ...options, headers, redirect: "manual" });
}
function poster(route, champs, headers = identite, extras = {}) {
  return demander(route, { ...headers, origin: base, accept: "text/html", "content-type": "application/x-www-form-urlencoded", ...extras }, {
    method: "POST", body: new URLSearchParams(champs).toString(),
  });
}
async function lire(route, statut = 200) {
  const rep = await demander(route);
  assert.equal(rep.status, statut, route);
  return parse(await rep.text());
}
const href = (e) => e.getAttribute("href");
const pages = new Map();
let liensInternes = 0, referencesAccessibles = 0;
const controlesFormulaires = [];
const largeurs = [320, 390, 768, 1280];
try {
  const db = await mf.getD1Database("DB");
  for (const f of (await readdir("drizzle")).filter(f => f.endsWith(".sql")).sort()) {
    for (const sql of (await readFile("drizzle/" + f, "utf8")).split("--> statement-breakpoint")) await db.prepare(sql.trim()).run();
  }
  // Deux références réelles de la base jetable, préparées par les formulaires du site.
  const formulaire = (await lire("/participer")).querySelector("form");
  const nom = (f, cle) => f.querySelector('input[name="' + cle + '"]').getAttribute("value");
  const preparation = await poster(formulaire.getAttribute("action"), {
    id: nom(formulaire, "id"), reglesId: nom(formulaire, "reglesId"), montant: "1000,50", accepte: "oui",
  });
  const creation = (await lire("/administration/gestion")).querySelector(".gestion-demarrages form");
  const situation = await poster(creation.getAttribute("action"), {
    action: nom(creation, "action"), id: nom(creation, "id"), scenarioId: nom(creation, "scenarioId"),
  });
  const formulaireCandidature = (await lire("/proposer-projet")).querySelector("form");
  const candidature = await poster(formulaireCandidature.getAttribute("action"), {
    action: nom(formulaireCandidature, "action"), id: nom(formulaireCandidature, "id"),
  });
  for (const rep of [preparation, situation, candidature]) assert.equal(rep.status, 303);
  const confirmation = new URL(preparation.headers.get("location"), base);
  const gestion = new URL(situation.headers.get("location"), base);
  assert.equal(confirmation.pathname, "/participer/confirmation");
  const file = new Set(["/", confirmation.pathname + confirmation.search, gestion.pathname + gestion.search,
    "/suivi-projet" + gestion.search, "/participer?erreur=montant&montant=abc", "/faq?acces=origine"]);
  const ancres = [];
  for (const route of file) {
    const doc = await lire(route);
    pages.set(route, doc);
    assert.equal(doc.querySelector("html").getAttribute("lang"), "fr", route);
    const viewport = doc.querySelector('meta[name="viewport"]').getAttribute("content");
    assert.match(viewport, /width=device-width/);
    assert.doesNotMatch(viewport, /maximum-scale|user-scalable\s*=\s*no/);
    assert.equal(doc.querySelectorAll("h1").length, 1, route);
    assert.ok(doc.querySelector("main#contenu"));
    const menu = doc.querySelector("header details.site-menu");
    assert.ok(menu && !menu.hasAttribute("open") && menu.querySelector("summary"));
    assert.ok(menu.querySelector('a[href="/faq"]') && menu.querySelector('a[href="/assistance"]'));
    const ids = doc.querySelectorAll("[id]").map(e => e.id);
    assert.equal(new Set(ids).size, ids.length, "Identifiant HTML répété dans " + route);
    for (const e of doc.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-controls], label[for]")) {
      for (const attr of ["aria-labelledby", "aria-describedby", "aria-controls", "for"]) {
        for (const id of (e.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean)) {
          assert.ok(ids.includes(id), route + " / référence absente : " + id);
          referencesAccessibles++;
        }
      }
    }
    for (const element of doc.querySelectorAll("a[href]")) {
      const cible = new URL(href(element), base + route);
      if (cible.origin !== base || ["/signin-with-chatgpt", "/signout-with-chatgpt"].includes(cible.pathname)) continue;
      if (cible.pathname.startsWith("/preuves/")) {
        await access("dist/client" + cible.pathname);
      } else {
        const chemin = cible.pathname + cible.search;
        file.add(chemin);
        if (cible.hash) ancres.push([chemin, decodeURIComponent(cible.hash.slice(1))]);
      }
      liensInternes++;
    }
    assert.ok(file.size < 50, "Parcours sans fin");
  }
  for (const [chemin, id] of ancres) assert.ok(pages.get(chemin).getElementById(id), chemin + "#" + id);
  for (const route of ["/projets", "/faq", "/assistance", "/administration/assistance", "/proposer-projet", "/administration/candidatures", "/recherche-operateurs", "/portefeuille", "/administration/gestion", "/suivi-projet", "/presentation"]) assert.ok(pages.has(route), route);
  const presentation = pages.get("/presentation");
  assert.equal(presentation.querySelectorAll("form").length, 0);
  const horaires = presentation.querySelectorAll(".presentation-time").map(e => e.text.trim());
  assert.deepEqual(horaires, ["0:00 → 0:45", "0:45 → 1:30", "1:30 → 2:30", "2:30 → 3:00", "3:00 → 4:15", "4:15 → 5:00"]);
  const textePresentation = presentation.querySelector("main").text.replace(/\s/g, "");
  for (const chiffre of ["24000€", "18000€", "6000€", "300€", "12mois", "36mois"]) assert.ok(textePresentation.includes(chiffre), chiffre);
  assert.match(presentation.querySelector("main").text, /pool technique externe sur Ethereum Sepolia/);
  assert.match(presentation.querySelector(".presentation-network").text, /4 novembre 2026/);
  assert.match(presentation.querySelector("#preparation").text, /hors chronomètre/);
  // La présentation relit le même dossier sans créer d'essai ou de commande.
  // Renommage de la seule copie jetable, après le contrôle des liens.
  const tablesObservees = ["preparations_participation", "participations", "situations_gestion", "commandes_gestion",
    "distributions_gestion", "demandes_assistance", "commandes_assistance", "candidatures", "commandes_candidatures", "historique"]
    .map(table => db.prepare("SELECT count(*) AS n FROM " + table));
  const compteursAvant = await db.batch(tablesObservees);
  await db.prepare("UPDATE projets SET nom = ? WHERE slug = ?").bind("Atelier fictif renommé J10", "atelier-lavage").run();
  const relue = await lire("/presentation");
  assert.match(relue.querySelector("main").text, /Atelier fictif renommé J10/);
  const compteursApres = await db.batch(tablesObservees);
  assert.deepEqual(compteursApres.map(r => r.results), compteursAvant.map(r => r.results));
  const faq = pages.get("/faq");
  assert.equal(faq.querySelectorAll(".faq-section details").length, 10);
  const texteFAQ = faq.querySelector("main").text.replace(/\s/g, "");
  for (const chiffre of ["300€", "36mois", "9000€", "2700€", "6000€", "0€"]) assert.ok(texteFAQ.includes(chiffre), chiffre);
  const invalide = pages.get("/participer?erreur=montant&montant=abc");
  assert.equal(invalide.querySelector('input[name="montant"]').getAttribute("aria-invalid"), "true");
  assert.equal(invalide.querySelector('input[name="montant"]').getAttribute("value"), "abc");
  const introuvable = await lire("/page-inconnue-j7", 404);
  assert.ok(introuvable.querySelector('main a[href="/portefeuille"]') && introuvable.querySelector('main a[href="/assistance"]'));
  for (const [route, attendu] of [
    ["/api/espace/suivre", "/mon-espace"], ["/api/participations/preparer", "/participer"],
    ["/api/participations/confirmer", confirmation.pathname + confirmation.search],
    ["/api/gestion", "/administration/gestion"], ["/api/assistance", "/assistance"],
    ["/api/candidatures", "/proposer-projet"],
  ]) {
    const expiration = await poster(route, {}, {}, { referer: confirmation.href });
    assert.equal(expiration.status, 303);
    const connexion = new URL(expiration.headers.get("location"), base);
    assert.equal(connexion.pathname, "/signin-with-chatgpt");
    assert.equal(connexion.searchParams.get("return_to"), attendu);
    const refus = await poster(route, {}, {}, { origin: "https://ailleurs.invalid" });
    assert.equal(refus.status, 303);
    assert.equal(refus.headers.get("location"), "/faq?acces=origine#reprendre");
    const api = await poster(route, {}, {}, { accept: "application/json" });
    assert.equal(api.status, 401);
    controlesFormulaires.push(route);
  }
  const etranger = await poster("/api/participations/confirmer", {}, {}, { referer: "https://ailleurs.invalid" + confirmation.pathname + confirmation.search });
  assert.equal(new URL(etranger.headers.get("location"), base).searchParams.get("return_to"), "/participer");
  const investisseur = { "oai-authenticated-user-id": "navigation-lecteur", "oai-authenticated-user-email": "lecture@example.invalid" };
  for (const [route, corps] of [["/api/gestion", {}], ["/api/assistance", { action: "cloturer" }], ["/api/candidatures", { action: "revoir" }]]) {
    const refus = await poster(route, corps, investisseur);
    assert.equal(refus.headers.get("location"), "/mon-espace?acces=reserve");
  }

  // Lit les déclarations de la feuille effectivement référencée par le HTML du Worker.
  // Vérifie les seuils et les dimensions déclarées, sans prétendre mesurer des pixels rendus.
  const feuille = href(faq.querySelector('link[rel="stylesheet"]'));
  const css = postcss.parse(await readFile("dist/client" + new URL(feuille, base).pathname, "utf8"));
  function declaration(selecteur, propriete, largeur) {
    let valeur;
    css.walkRules(regle => {
      if (!regle.selectors.includes(selecteur)) return;
      for (let parent = regle.parent; parent; parent = parent.parent) {
        if (parent.type !== "atrule" || parent.name !== "media") continue;
        const limite = /^\(max-width:\s*([\d.]+)(px|rem)\)$/.exec(parent.params);
        if (!limite || largeur > Number(limite[1]) * (limite[2] === "rem" ? 16 : 1)) return;
      }
      regle.walkDecls(propriete, d => { valeur = d.value; });
    });
    return valeur;
  }
  for (const largeur of largeurs) {
    assert.equal(declaration(".quick-nav", "display", largeur), largeur < 976 ? "none" : "flex");
    assert.equal(declaration(".site-menu summary", "min-height", largeur), "44px");
    assert.equal(declaration(".directory a", "min-height", largeur), "44px");
    assert.equal(declaration(".candidature-grille dd", "overflow-wrap", largeur), "anywhere");
    if (largeur <= 760) {
      assert.equal(declaration(".presentation-status-grid", "grid-template-columns", largeur), "minmax(0,1fr)");
      assert.equal(declaration(".presentation-steps>li", "grid-template-columns", largeur), "minmax(0,1fr)");
      assert.equal(declaration(".candidature-grille", "grid-template-columns", largeur), "minmax(0,1fr)");
      assert.equal(declaration(".candidature-form .actions button", "width", largeur), "100%");
    }
    assert.match(declaration(".directory", "grid-template-columns", largeur), largeur <= 660 ? /repeat\(2,/ : /repeat\(3,/);
    if (largeur < 421) {
      assert.equal(declaration(".facts>div", "grid-template-columns", largeur), "minmax(0,1fr)");
      assert.equal(declaration(".saisie-participation form>button", "width", largeur), "100%");
    }
  }
  console.log(JSON.stringify({
    date: new Date().toISOString(), ok: true, pagesEtEtats: pages.size, liensInternes, ancres: ancres.length,
    referencesAccessibles, questionsFAQ: 10, formulairesAvecReprise: controlesFormulaires,
    largeursCssVerifiees: largeurs, presentationMinutes: 5, etapesPresentation: horaires.length,
    presentationDossierD1: true, presentationSansEcritureMetier: true, verificationVisuelle: false,
  }, null, 2));
} finally {
  await mf.dispose();
  await rm(temp, { recursive: true, force: true });
}
