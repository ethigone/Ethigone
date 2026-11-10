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
const temp = await mkdtemp(path.resolve(".sites-runtime/assistance-j7-"));
const origine = "https://ethigone.test";
const comptes = Object.fromEntries(["alice", "bilal", "proprietaire"].map(n => [n, {
  "oai-authenticated-user-id": "assistance-test-" + n, "oai-authenticated-user-email": n + "@example.invalid",
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
async function poster(donnees, utilisateur = "proprietaire", route = "/api/assistance", origin = origine) {
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
function formulaireVisible(html, demandeId) {
  const formulaires = [...html.matchAll(/<form\b[^>]*action="\/api\/assistance"[^>]*>([\s\S]*?)<\/form>/g)];
  const formulaire = formulaires.find(m => !demandeId || m[1].includes('value="' + demandeId + '"'));
  assert.ok(formulaire, "Formulaire natif rendu");
  assert.ok(formulaire[0].includes('method="post"'));
  const donnees = {};
  for (const [balise] of formulaire[1].matchAll(/<input\b[^>]*>/g)) {
    const nom = balise.match(/name="([^"]+)"/)?.[1];
    const valeur = balise.match(/value="([^"]*)"/)?.[1];
    if (nom && valeur) donnees[nom] = valeur;
  }
  const categorie = formulaire[1].match(/<option value="([^"]+)"/);
  if (categorie) donnees.categorie = categorie[1];
  const texte = formulaire[1].match(/<textarea\b[^>]*name="([^"]+)"/);
  assert.ok(texte);
  donnees[texte[1]] = "Scénario inventé J7 <script>alert(1)</script>";
  return donnees;
}
async function posterNavigateur(donnees, utilisateur) {
  return appeler("/api/assistance", utilisateur, {
    method: "POST",
    headers: { origin: origine, accept: "text/html", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(donnees).toString(),
  });
}
const demande = (extras = {}) => ({ action: "creer", id: crypto.randomUUID(), categorie: "compte", description: "Scénario inventé J7 <script>alert(1)</script>", ...extras });
const cloture = (demandeId, extras = {}) => ({ action: "cloturer", id: crypto.randomUUID(), demandeId, reponse: "Réponse inventée J7", confirme: "oui", ...extras });
function reussite(rep, id, admin = false) {
  const url = destination(rep);
  assert.equal(url.pathname, admin ? "/administration/assistance" : "/assistance");
  assert.equal(url.searchParams.get("succes"), id, rep.lieu);
  assert.ok(!rep.lieu.includes("script"));
}
async function posterJson(donnees, utilisateur) {
  return appeler("/api/assistance", utilisateur, { method: "POST", headers: { origin: origine, accept: "application/json", "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(donnees).toString() });
}
try {
  db = await mf.getD1Database("DB");
  const migrations = (await readdir("drizzle")).filter(f => f.endsWith(".sql")).sort();
  const ajoutAssistance = migrations.indexOf("0004_silent_talisman.sql");
  assert.ok(ajoutAssistance >= 0);
  for (const fichier of migrations.slice(0, ajoutAssistance)) await migration(fichier);
  await db.prepare("INSERT INTO utilisateurs (id,identite_fictive,libelle,role) VALUES ('heritage-j7','synthetique-j7','Compte synthétique hérité','investisseur')").run();
  for (const fichier of migrations.slice(ajoutAssistance)) await migration(fichier);
  assert.equal((await row("utilisateurs", "heritage-j7")).libelle, "Compte synthétique hérité");
  for (const route of ["/assistance", "/administration/assistance"]) assert.equal((await appeler(route)).status, 307);
  for (const nom of Object.keys(comptes)) assert.equal((await appeler("/assistance", nom)).status, 200);
  const avant = await nombre("participations");
  assert.equal((await appeler("/administration/assistance", "alice")).status, 307);
  assert.equal((await appeler("/api/assistance", undefined, { method: "POST", headers: { origin: origine } })).status, 401);
  assert.equal((await poster({}, "alice", "/api/assistance", "https://autre.test")).status, 403);
  assert.equal((await appeler("/api/assistance", "alice", { method: "POST" })).status, 403);
  assert.equal((await appeler("/api/assistance", "alice")).status, 405);
  erreur(await poster("action=creer&action=creer", "alice"), "formulaire");
  erreur(await poster("description=" + "a".repeat(19000), "alice"), "formulaire");
  erreur(await poster(demande({ categorie: "inconnue" }), "alice"), "saisie");
  erreur(await poster(demande({ description: " " }), "alice"), "saisie");
  erreur(await poster(demande({ description: "a".repeat(1201) }), "alice"), "saisie");
  const pageSaisie = await appeler("/assistance", "alice");
  const a = formulaireVisible(pageSaisie.corps);
  reussite(await posterNavigateur(a, "alice"), a.id);
  const doublons = await Promise.all([poster(a, "alice"), poster(a, "alice")]);
  for (const rep of doublons) reussite(rep, a.id);
  assert.equal(await nombre("demandes_assistance"), 1);
  assert.equal(await nombre("commandes_assistance"), 1);
  erreur(await poster({ ...a, description: "Autre texte inventé" }, "alice"), "conflit");
  erreur(await poster(a, "bilal"), "conflit");
  const b = demande({ description: "Cas inventé Bilal uniquement" });
  reussite(await poster(b, "bilal"), b.id);
  for (const headers of [{}, { RSC: "1" }]) {
    const titulaireRoute = headers.RSC ? "/assistance.rsc" : "/assistance";
    const administrationRoute = headers.RSC ? "/administration/assistance.rsc" : "/administration/assistance";
    const alice = await appeler(titulaireRoute, "alice", { headers });
    assert.equal(alice.status, 200);
    assert.ok(alice.corps.includes(a.id));
    assert.ok(!alice.corps.includes(b.id));
    assert.ok(!alice.corps.includes("Cas inventé Bilal uniquement"));
    const fauxSucces = await appeler(titulaireRoute + "?succes=" + b.id, "alice", { headers });
    assert.ok(!fauxSucces.corps.includes("Demande fictive enregistrée. Référence"));
    if (!headers.RSC) assert.ok(!alice.corps.includes("<script>alert(1)</script>"));
    const bilal = await appeler(titulaireRoute, "bilal", { headers });
    assert.ok(!bilal.corps.includes(a.id));
    const admin = await appeler(administrationRoute, "proprietaire", { headers });
    assert.equal(admin.status, 200);
    assert.ok(admin.corps.includes(a.id) && admin.corps.includes(b.id));
    const refuse = await appeler(administrationRoute, "alice", { headers });
    assert.ok(!refuse.corps.includes(b.description));
  }
  const pageTraitement = await appeler("/administration/assistance", "proprietaire");
  const fermeture = formulaireVisible(pageTraitement.corps, a.id);
  fermeture.reponse = "Réponse inventée J7";
  assert.equal((await poster(fermeture, "alice")).status, 403);
  erreur(await poster({ ...fermeture, confirme: "" }), "confirmation");
  const conflit = cloture(a.id, { reponse: "Réponse concurrente inventée" });
  const resultats = await Promise.all([poster(fermeture), poster(conflit)]);
  assert.equal(resultats.filter(r => destination(r).searchParams.has("succes")).length, 1);
  assert.equal(resultats.filter(r => destination(r).searchParams.get("erreur") === "conflit").length, 1);
  const gagne = resultats[0].lieu.includes("succes=") ? fermeture : conflit;
  reussite(await posterNavigateur(gagne, "proprietaire"), a.id, true);
  erreur(await poster(cloture(a.id)), "conflit");
  const etat = JSON.stringify(await row("demandes_assistance", a.id));
  assert.equal((await row("demandes_assistance", a.id)).statut, "cloturee");
  assert.equal(await nombre("commandes_assistance"), 3);
  const invalid = await posterJson(demande({ description: "" }), "alice");
  assert.equal(invalid.status, 400);
  assert.ok(invalid.cache.includes("no-store"));
  assert.deepEqual(JSON.parse(invalid.corps), { erreur: "saisie" });
  assert.ok((await appeler("/administration/assistance?erreur=conflit", "proprietaire")).corps.includes('role="alert"'));
  assert.equal(await nombre("participations"), avant);
  await mf.dispose(); mf = demarrer(); db = await mf.getD1Database("DB");
  assert.equal(JSON.stringify(await row("demandes_assistance", a.id)), etat);
  reussite(await poster(gagne), a.id, true);
  assert.ok((await appeler("/assistance", "alice")).corps.includes(gagne.reponse));
  // Simule une panne du journal après la mutation, puis reprend le même formulaire.
  const incident = demande({ description: "Question fictive\r\nsur le reçu" });
  const interdireJournal = () => db.prepare(
    "CREATE TRIGGER panne_j7 BEFORE INSERT ON commandes_assistance BEGIN SELECT RAISE(ABORT, 'panne de test'); END"
  ).run();
  const retablirJournal = () => db.prepare("DROP TRIGGER panne_j7").run();
  await interdireJournal();
  erreur(await poster(incident, "alice"), "indisponible");
  assert.equal(await row("demandes_assistance", incident.id), null);
  await retablirJournal();
  reussite(await poster(incident, "alice"), incident.id);
  // La même description multiligne conserve son identité depuis le formulaire natif et JavaScript.
  const repriseJs = await posterJson({ ...incident, description: incident.description.replace("\r\n", "\n") }, "alice");
  assert.equal(repriseJs.status, 200);
  const clotureReprise = cloture(incident.id);
  await interdireJournal();
  erreur(await poster(clotureReprise), "indisponible");
  assert.equal((await row("demandes_assistance", incident.id)).statut, "ouverte");
  await retablirJournal();
  reussite(await poster(clotureReprise), incident.id, true);
  // Contraintes D1 vérifiées indépendamment des formulaires.
  await assert.rejects(() => db.prepare("UPDATE demandes_assistance SET reponse=NULL WHERE id=?").bind(a.id).run());
  await assert.rejects(() => db.prepare("UPDATE demandes_assistance SET categorie='inconnue' WHERE id=?").bind(a.id).run());
  console.log(JSON.stringify({ verification: "OK", controles: ["migration additive et registre préservé", "HTTP origine, compte, rôle et corps borné", "historiques HTML/RSC privés et texte échappé", "double commande, contenu conflictuel et concurrence", "clôture unique, confirmation serveur et reprise après redémarrage", "formulaires natifs relus, reprise multiligne et réponse JSON", "échec du journal : création et clôture annulées puis reprises", "contraintes D1 et erreurs accessibles"], environnement: "Worker compilé, D1 jetable, comptes synthétiques" }, null, 2));
} finally { await mf.dispose(); await rm(temp, { recursive: true, force: true }); }
