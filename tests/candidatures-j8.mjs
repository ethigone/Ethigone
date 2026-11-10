// Worker construit, identités simulées et base jetable. Aucune requête vers le Site hébergé.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { Miniflare } = require(require.resolve("miniflare", { paths: [require.resolve("wrangler")] }));
const racine = path.resolve("dist/server");
const config = JSON.parse(await readFile(path.join(racine, "wrangler.json"), "utf8"));
const modules = (await readdir(racine, { recursive: true })).filter(f => f.endsWith(".js") && f !== config.main);
const temp = await mkdtemp(path.resolve(".sites-runtime/candidatures-j8-"));
const origine = "https://ethigone.test";
const comptes = Object.fromEntries(["alice", "bilal", "proprietaire"].map(n => [n, {
  "oai-authenticated-user-id": "candidature-test-" + n, "oai-authenticated-user-email": n + "@example.invalid",
}]));
function demarrer() {
  return new Miniflare({
    cf: false, compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
    modulesRoot: racine, modules: [config.main, ...modules].map(f => ({ type: "ESModule", path: path.join(racine, f) })),
    d1Databases: ["DB"], d1Persist: temp, bindings: { ETHIGONE_ADMIN_BOOTSTRAP_EMAIL: "proprietaire@example.invalid" },
  });
}
let mf = demarrer();
let db;
async function appeler(route, utilisateur, options = {}) {
  const rep = await mf.dispatchFetch(origine + route, {
    ...options, headers: { ...comptes[utilisateur], ...options.headers }, redirect: "manual",
  });
  return { status: rep.status, lieu: rep.headers.get("location"), cache: rep.headers.get("cache-control"), corps: await rep.text() };
}
async function poster(donnees, utilisateur = "proprietaire", route = "/api/candidatures", origin = origine) {
  return appeler(route, utilisateur, { method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded" }, body: typeof donnees === "string" ? donnees : new URLSearchParams(donnees).toString() });
}
function destination(rep) {
  assert.equal(rep.status, 303, rep.corps.slice(0, 160));
  assert.ok(rep.cache?.includes("no-store"));
  return new URL(rep.lieu, origine);
}
function erreur(rep, code) { assert.equal(destination(rep).searchParams.get("erreur"), code); }
const row = (table, id) => db.prepare("SELECT * FROM " + table + " WHERE id=?").bind(id).first();
const nombre = table => db.prepare("SELECT count(*) n FROM " + table).first("n");
async function migration(nom) {
  const contenu = await readFile("drizzle/" + nom, "utf8");
  for (const sql of contenu.split("--> statement-breakpoint")) await db.prepare(sql.trim()).run();
}
function formulaire(html, action) {
  const formes = [...html.matchAll(/<form\b[^>]*action="\/api\/candidatures"[^>]*>([\s\S]*?)<\/form>/g)];
  const trouve = formes.find(m => m[1].includes('value="' + action + '"'));
  assert.ok(trouve, "Formulaire rendu pour " + action);
  assert.ok(trouve[0].includes('method="post"'));
  const valeurs = {};
  for (const [input] of trouve[1].matchAll(/<input\b[^>]*>/g)) {
    const nom = input.match(/name="([^"]+)"/)?.[1];
    const valeur = input.match(/value="([^"]*)"/)?.[1];
    if (nom && valeur && !input.includes('type="checkbox"')) valeurs[nom] = valeur;
  }
  valeurs.action = action;
  return valeurs;
}
const champs = ["titre", "operateur", "activite", "equipements", "clients", "recettes", "depenses", "besoin", "risques", "references"];
const complet = Object.fromEntries(champs.map(cle => [cle, "Fictif J8 " + cle]));
async function edition(chemin, action = "sauvegarder") {
  const rep = await appeler(chemin, "alice");
  assert.equal(rep.status, 200);
  return { ...formulaire(rep.corps, action), ...complet, budget: "24000.01" };
}
function ok(rep) {
  const url = destination(rep);
  assert.match(url.searchParams.get("succes") || "", /^[0-9a-f-]{36}$/i);
  assert.match(url.pathname, /^\/candidatures\//);
  return url.pathname;
}
try {
  db = await mf.getD1Database("DB");
  const fichiers = (await readdir("drizzle")).filter(f => f.endsWith(".sql")).sort();
  for (const fichier of fichiers.filter(f => !f.startsWith("0005"))) await migration(fichier);
  await db.prepare("INSERT INTO utilisateurs (id,identite_fictive,libelle,role) VALUES ('heritage-j8','heritage-j8','Ancêtre J8','investisseur')").run();
  for (const fichier of fichiers.filter(f => f.startsWith("0005"))) await migration(fichier);
  assert.equal((await row("utilisateurs", "heritage-j8")).libelle, "Ancêtre J8");
  assert.equal((await appeler("/proposer-projet")).status, 307);
  for (const nom of Object.keys(comptes)) assert.equal((await appeler("/proposer-projet", nom)).status, 200);
  const sansCompte = await appeler("/api/candidatures", undefined, { method: "POST", headers: { origin: origine } });
  assert.equal(sansCompte.status, 401);
  const projetsAvant = await nombre("projets");
  const operateursAvant = await nombre("operateurs");
  const creation = formulaire((await appeler("/proposer-projet", "alice")).corps, "creer");
  const chemin = ok(await poster(creation, "alice"));
  assert.ok(!(await appeler(chemin + "?succes=" + crypto.randomUUID(), "alice")).corps.includes("Commande enregistrée."));
  assert.ok((await appeler(chemin + "?succes=" + creation.id, "alice")).corps.includes("Commande enregistrée."));
  assert.equal(ok(await poster(creation, "alice")), chemin);
  assert.equal(await nombre("candidatures"), 1);
  assert.equal(await nombre("commandes_candidatures"), 1);
  assert.equal((await appeler(chemin, "bilal")).status, 404);
  assert.equal((await appeler(chemin, "proprietaire")).status, 404);
  assert.ok(!(await appeler("/administration/candidatures", "proprietaire")).corps.includes(creation.id));
  assert.equal((await appeler("/administration/candidatures", "bilal")).status, 307);
  const sauvegarde = await edition(chemin);
  sauvegarde.titre = "Texte fictif <script>alert(8)</script>";
  ok(await poster(sauvegarde, "alice"));
  ok(await poster(sauvegarde, "alice"));
  assert.equal((await row("candidatures", creation.id)).revision, 1);
  const echappe = await appeler(chemin, "alice");
  assert.ok(!echappe.corps.includes("<script>alert(8)</script>"));
  assert.ok(echappe.corps.includes("&lt;script&gt;"));
  erreur(await poster({ ...sauvegarde, id: crypto.randomUUID() }, "alice"), "conflit");
  erreur(await poster({ ...sauvegarde, id: crypto.randomUUID(), revision: "1" }, "bilal"), "conflit");
  const avantPanne = await row("candidatures", creation.id);
  const reprise = { ...await edition(chemin), titre: "Reprise après panne fictive" };
  await db.prepare("CREATE TRIGGER panne_j8 BEFORE INSERT ON commandes_candidatures BEGIN SELECT RAISE(ABORT, 'panne simulee J8'); END").run();
  erreur(await poster(reprise, "alice"), "indisponible");
  assert.equal((await row("candidatures", creation.id)).revision, avantPanne.revision);
  await db.prepare("DROP TRIGGER panne_j8").run();
  ok(await poster(reprise, "alice"));
  const concurrence = await edition(chemin);
  const concurrente = { ...concurrence, id: crypto.randomUUID(), titre: "Autre version concurrente fictive" };
  const reponses = await Promise.all([poster(concurrence, "alice"), poster(concurrente, "alice")]);
  assert.equal(reponses.filter(rep => new URL(rep.lieu, origine).searchParams.has("succes")).length, 1);
  assert.equal(reponses.filter(rep => new URL(rep.lieu, origine).searchParams.get("erreur") === "conflit").length, 1);
  const soumission = await edition(chemin, "soumettre");
  erreur(await poster(soumission, "alice"), "incomplet");
  erreur(await poster({ ...soumission, fictif: "oui", titre: "" }, "alice"), "incomplet");
  for (const budget of ["0", "-1", "1000000.01", "1e3", "0.001", "NaN"]) erreur(await poster({ ...soumission, budget, fictif: "oui" }, "alice"), "saisie");
  const soumise = { ...soumission, fictif: "oui", budget: "0,01" };
  ok(await poster(soumise, "alice"));
  ok(await poster(soumise, "alice"));
  const revisionSoumise = (await row("candidatures", creation.id)).revision;
  const admin = await appeler(chemin, "proprietaire");
  assert.equal(admin.status, 200);
  const revue = { ...formulaire(admin.corps, "revoir"), statut: "a_completer", note: "Pièces fictives manquantes", confirme: "oui" };
  for (const cle of ["activite", "equipements", "demande", "cash", "operateur"]) revue["critere_" + cle] = "a_verifier";
  assert.equal((await poster(revue, "bilal")).status, 403);
  erreur(await poster({ ...revue, note: "" }, "proprietaire"), "revue");
  ok(await poster(revue, "proprietaire"));
  ok(await poster(revue, "proprietaire"));
  const prive = { ...await edition(chemin), titre: "SECRET-BROUILLON-J8" };
  ok(await poster(prive, "alice"));
  for (const route of [chemin, "/administration/candidatures"]) {
    assert.ok(!(await appeler(route, "proprietaire")).corps.includes("SECRET-BROUILLON-J8"));
    const rsc = await appeler(route + ".rsc", "proprietaire", { headers: { RSC: "1" } });
    assert.ok(!rsc.corps.includes("SECRET-BROUILLON-J8"));
  }
  const vueAdmin = await appeler(chemin, "proprietaire");
  assert.match(vueAdmin.corps.replace(/<!--.*?-->/g, ""), new RegExp("Version " + revisionSoumise + "(?:<|\\s)"));
  assert.ok((await appeler(chemin, "alice")).corps.includes("SECRET-BROUILLON-J8"));
  for (const route of [chemin, chemin + ".rsc"]) assert.ok(!(await appeler(route, "bilal", { headers: { rsc: "1" } })).corps.includes("SECRET-BROUILLON-J8"));
  const relance = { ...await edition(chemin, "soumettre"), fictif: "oui", titre: "Version resoumise fictive" };
  ok(await poster(relance, "alice"));
  assert.ok((await appeler(chemin, "proprietaire")).corps.includes("Version resoumise fictive"));
  const nouvelleRevue = { ...revue, id: crypto.randomUUID(), revision: String((await row("candidatures", creation.id)).revision), statut: "a_approfondir" };
  const decisionConcurrente = { ...nouvelleRevue, id: crypto.randomUUID(), note: "Autre décision fictive motivée" };
  const decisions = await Promise.all([poster(nouvelleRevue, "proprietaire"), poster(decisionConcurrente, "proprietaire")]);
  assert.equal(decisions.filter(rep => new URL(rep.lieu, origine).searchParams.has("succes")).length, 1);
  assert.equal(decisions.filter(rep => new URL(rep.lieu, origine).searchParams.get("erreur") === "conflit").length, 1);
  const decisionAcceptee = new URL(decisions[0].lieu, origine).searchParams.has("succes") ? nouvelleRevue : decisionConcurrente;
  erreur(await poster({ ...nouvelleRevue, id: crypto.randomUUID() }, "proprietaire"), "conflit");
  assert.equal((await row("candidatures", creation.id)).statut, "a_approfondir");
  assert.ok(!(await appeler(chemin, "alice")).corps.includes('value="sauvegarder"'));
  const creationBilal = formulaire((await appeler("/proposer-projet", "bilal")).corps, "creer");
  const cheminBilal = ok(await poster(creationBilal, "bilal"));
  const haut = { ...formulaire((await appeler(cheminBilal, "bilal")).corps, "soumettre"), ...complet, budget: "1000000.00", fictif: "oui" };
  ok(await poster(haut, "bilal"));
  assert.equal(JSON.parse((await row("candidatures", creationBilal.id)).contenu).budget, "1000000.00");
  const rejeter = { ...revue, ...formulaire((await appeler(cheminBilal, "proprietaire")).corps, "revoir"), statut: "non_retenu", note: "Obstacle fictif motivé" };
  ok(await poster(rejeter, "proprietaire"));
  assert.equal((await row("candidatures", creationBilal.id)).statut, "non_retenu");
  const conflitJson = await appeler("/api/candidatures", "alice", {
    method: "POST", headers: { origin: origine, accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...nouvelleRevue, id: crypto.randomUUID(), action: "sauvegarder" }).toString(),
  });
  assert.equal(conflitJson.status, 409);
  assert.equal(JSON.parse(conflitJson.corps).erreur, "conflit");
  await mf.dispose();
  mf = demarrer();
  db = await mf.getD1Database("DB");
  ok(await poster(decisionAcceptee, "proprietaire"));
  assert.equal((await appeler(chemin, "alice")).status, 200);
  assert.equal(await nombre("projets"), projetsAvant);
  assert.equal(await nombre("operateurs"), operateursAvant);
  assert.equal((await poster({}, "alice", "/api/candidatures", "https://autre.test")).status, 403);
  erreur(await poster("action=creer&action=creer", "alice"), "formulaire");
  assert.equal((await appeler("/api/candidatures", "alice")).status, 405);
  console.log("J8 candidatures : formulaires, isolation, historique, idempotence, conflits et redémarrage vérifiés.");
} finally {
  await mf.dispose();
  await rm(temp, { recursive: true, force: true });
}
