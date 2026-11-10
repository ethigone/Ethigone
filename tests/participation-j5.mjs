// Parcours HTTP sur le Worker construit. Identités et panne injectée limitées à une D1 jetable.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { Miniflare } = require(require.resolve("miniflare", { paths: [require.resolve("wrangler")] }));
const racine = path.resolve("dist/server");
const config = JSON.parse(await readFile(path.join(racine, "wrangler.json"), "utf8"));
const modules = (await readdir(racine, { recursive: true })).filter(f => f.endsWith(".js") && f !== config.main);
const temp = await mkdtemp(path.resolve(".sites-runtime/participation-j5-"));
const origine = "https://ethigone.test";
const proprietaire = "proprietaire@example.invalid";
const comptes = Object.fromEntries(["alice", "bilal", "proprietaire"].map(n => [n, {
  "oai-authenticated-user-id": "sujet-test-" + n, "oai-authenticated-user-email": n + "@example.invalid",
}]));
const controles = [];
function demarrer() {
  return new Miniflare({
    cf: false, compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
    modulesRoot: racine, modules: [config.main, ...modules].map(f => ({ type: "ESModule", path: path.join(racine, f) })),
    d1Databases: ["DB"], d1Persist: temp, bindings: { ETHIGONE_ADMIN_BOOTSTRAP_EMAIL: proprietaire },
  });
}
let mf = demarrer();
let db;
async function appeler(route, utilisateur, options = {}) {
  const response = await mf.dispatchFetch(origine + route, {
    ...options, headers: { ...comptes[utilisateur], ...options.headers }, redirect: "manual",
  });
  return { status: response.status, lieu: response.headers.get("location"), cache: response.headers.get("cache-control"), corps: await response.text() };
}
const texte = rep => rep.corps.replace(/<[^>]*>/g, "").replace(/\s/g, "");
function champ(html, nom) {
  const input = [...html.matchAll(/<input\b[^>]*>/g)].map(m => m[0]).find(s => s.includes('name="' + nom + '"'));
  assert.ok(input, "Champ absent " + nom);
  const value = input.match(/value="([^"]*)"/)?.[1];
  assert.ok(value, "Valeur absente " + nom);
  return value;
}
function destination(rep, route) {
  assert.equal(rep.status, 303, rep.corps.slice(0, 180));
  assert.ok(rep.cache?.includes("no-store"));
  const url = new URL(rep.lieu, origine);
  assert.equal(url.pathname, route);
  return url;
}
async function nombre(table) {
  return db.prepare("SELECT count(*) n FROM " + table).first("n");
}
async function poster(route, utilisateur, donnees, origin = origine) {
  return appeler(route, utilisateur, {
    method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded" },
    body: typeof donnees === "string" ? donnees : new URLSearchParams(donnees).toString(),
  });
}
const preparer = (utilisateur, donnees, origin) => poster("/api/participations/preparer", utilisateur, donnees, origin);
const confirmer = (utilisateur, id, extras = {}) => poster("/api/participations/confirmer", utilisateur, { id, confirme: "oui", ...extras });
async function ancienneMigration(fichier) {
  const sql = await readFile("drizzle/" + fichier, "utf8");
  for (const statement of sql.split("--> statement-breakpoint")) await db.prepare(statement.trim()).run();
}
try {
  db = await mf.getD1Database("DB");
  const migrations = (await readdir("drizzle")).filter(f => f.endsWith(".sql")).sort();
  for (const f of migrations.slice(0, 2)) await ancienneMigration(f);
  // Le Worker courant utilise les colonnes J6. Son schéma doit être installé avant son démarrage.
  // La migration de participation J5 reste volontairement différée pour le contrôle ci-dessous.
  for (const f of migrations.slice(3)) await ancienneMigration(f);
  assert.equal((await appeler("/projets/atelier-lavage")).status, 200);
  await appeler("/mon-espace", "alice");
  assert.equal((await poster("/api/espace/suivre", "alice", {})).status, 303);
  const avant = { participations: await nombre("participations"), documents: await nombre("documents"), historique: await nombre("historique") };
  await ancienneMigration(migrations[2]);
  for (const [table, count] of Object.entries(avant)) assert.equal(await nombre(table), count);
  controles.push("Migration depuis J4 avec comptes, suivi, exemples et pièces existants conservés.");

  for (const route of ["/participer", "/portefeuille", "/participer/confirmation?id=" + crypto.randomUUID(), "/portefeuille?confirmation=" + crypto.randomUUID()]) {
    const r = await appeler(route);
    assert.equal(r.status, 307);
    assert.equal(new URL(r.lieu, origine).pathname, "/signin-with-chatgpt");
    assert.equal(new URL(r.lieu, origine).searchParams.get("return_to"), route);
  }
  for (const route of ["/api/participations/preparer", "/api/participations/confirmer"]) {
    assert.equal((await poster(route, undefined, {})).status, 401);
    assert.equal((await poster(route, "alice", {}, "https://autre.test")).status, 403);
    assert.equal((await appeler(route, "alice", { method: "POST" })).status, 403);
    assert.equal((await appeler(route, "alice")).status, 405);
  }
  const page = await appeler("/participer", "alice");
  assert.equal(page.status, 200);
  assert.ok(page.cache?.includes("no-store"));
  assert.ok(page.corps.includes('href="/connexion-test"'));
  const initial = { id: champ(page.corps, "id"), reglesId: champ(page.corps, "reglesId"), montant: "1234,56", accepte: "oui" };
  assert.equal(initial.reglesId, "EQ-001-J3");
  assert.equal(await nombre("preparations_participation"), 0);
  const invalides = ["", "0", "-1", "0.001", "1e3", "NaN", "Infinity", "1 000", "12,345", "1.23x", "19200.01", "999999999999", "0000000000001"];
  await Promise.all(invalides.map(async montant => {
    const r = await preparer("alice", { ...initial, montant, id: crypto.randomUUID() });
    assert.equal(destination(r, "/participer").searchParams.get("erreur"), "montant");
  }));
  assert.equal(destination(await preparer("alice", { ...initial, accepte: "non" }), "/participer").searchParams.get("erreur"), "conditions");
  assert.equal(destination(await preparer("alice", { ...initial, reglesId: "autres-regles" }), "/participer").searchParams.get("erreur"), "version");
  assert.equal(destination(await preparer("alice", new URLSearchParams(initial) + "&montant=10"), "/participer").searchParams.get("erreur"), "formulaire");
  assert.equal(destination(await preparer("alice", "montant=" + "1".repeat(5000)), "/participer").searchParams.get("erreur"), "formulaire");
  assert.equal(await nombre("preparations_participation"), 0);
  controles.push("Authentification et origine requises. Formats, centimes, bornes, accord, version, champs répétés et corps trop volumineux contrôlés côté serveur.");

  const preparations = await Promise.all([preparer("alice", initial), preparer("alice", initial)]);
  for (const r of preparations) assert.equal(destination(r, "/participer/confirmation").searchParams.get("id"), initial.id);
  assert.equal(await nombre("preparations_participation"), 1);
  assert.equal(await nombre("participations"), avant.participations);
  const resume = await appeler("/participer/confirmation?id=" + initial.id, "alice");
  assert.equal(resume.status, 200);
  assert.ok(texte(resume).includes("1234,56€"));
  assert.ok(resume.corps.includes('action="/api/participations/confirmer"'));
  assert.ok(!resume.corps.includes("Simulation déjà enregistrée"));
  assert.equal(destination(await preparer("alice", { ...initial, montant: "2000" }), "/participer").searchParams.get("erreur"), "conflit");
  assert.equal(destination(await preparer("bilal", initial), "/participer").searchParams.get("erreur"), "conflit");
  const intrus = await appeler("/participer/confirmation?id=" + initial.id, "bilal");
  assert.equal(intrus.status, 404);
  assert.ok(!texte(intrus).includes("1234,56€"));
  const refus = destination(await confirmer("bilal", initial.id), "/participer/confirmation");
  assert.equal(refus.searchParams.get("erreur"), "introuvable");
  const sansAccord = await poster("/api/participations/confirmer", "alice", { id: initial.id });
  assert.equal(destination(sansAccord, "/participer/confirmation").searchParams.get("erreur"), "conditions");
  assert.equal(await nombre("participations"), avant.participations);
  controles.push("Projet, conditions et montant conduisent à un récapitulatif immuable. Deux préparations identiques donnent la même clé. Modifier cette clé ou utiliser celle d’autrui est refusé.");

  // Le runtime ne conserve aucun effet partiel du batch de confirmation.
  await db.prepare("CREATE TRIGGER panne_j5 BEFORE INSERT ON historique WHEN NEW.id LIKE 'participation-confirmee:%' BEGIN SELECT RAISE(ABORT,'Panne de test J5'); END").run();
  assert.equal(destination(await confirmer("alice", initial.id), "/participer/confirmation").searchParams.get("erreur"), "indisponible");
  for (const [table, count] of Object.entries(avant)) assert.equal(await nombre(table), count);
  await db.prepare("DROP TRIGGER panne_j5").run();

  const confirmations = await Promise.all([
    confirmer("alice", initial.id, { montant: "0.01", reglesId: "fraude", utilisateur_id: "sujet-test-bilal" }),
    confirmer("alice", initial.id),
  ]);
  for (const r of confirmations) assert.equal(destination(r, "/portefeuille").searchParams.get("confirmation"), initial.id);
  for (const [table, count] of Object.entries(avant)) assert.equal(await nombre(table), count + 1);
  const inscription = await db.prepare("SELECT * FROM participations WHERE id=?").bind("participation:" + initial.id).first();
  assert.equal(inscription.montant_centimes, 123456);
  assert.equal(inscription.regles_id, initial.reglesId);
  const recu = await db.prepare("SELECT contenu FROM documents WHERE id=?").bind("recu:" + initial.id).first("contenu");
  assert.ok(recu.includes("1234,56 EUR"));
  const dateConfirmation = await db.prepare("SELECT date FROM historique WHERE id=?").bind("participation-confirmee:" + initial.id).first("date");
  const datePreparation = await db.prepare("SELECT date FROM preparations_participation WHERE id=?").bind(initial.id).first("date");
  assert.ok(Date.parse(dateConfirmation) >= Date.parse(datePreparation));
  controles.push("Panne injectée au troisième enregistrement : participation, reçu et historique annulés ensemble. Deux confirmations concurrentes après reprise ne produisent qu’une écriture, au montant préparé.");

  const retour = await appeler("/portefeuille?confirmation=" + initial.id, "alice");
  assert.equal(retour.status, 200);
  assert.ok(retour.cache?.includes("no-store"));
  assert.ok(texte(retour).includes("Simulationenregistrée"));
  assert.ok(texte(retour).includes("1234,56€"));
  assert.ok(retour.corps.includes(initial.id));
  assert.ok(retour.corps.includes('id="recus"'));
  const etranger = await appeler("/portefeuille?confirmation=" + initial.id, "bilal");
  assert.equal(etranger.status, 200);
  assert.ok(!texte(etranger).includes("1234,56€"));
  assert.ok(!texte(etranger).includes("Simulationenregistrée"));
  const rsc = await appeler("/portefeuille.rsc", "bilal", { headers: { RSC: "1" } });
  assert.equal(rsc.status, 200);
  assert.ok(!rsc.corps.includes("123456") && !rsc.corps.includes("recu:" + initial.id));
  const admin = await appeler("/administration", "proprietaire");
  assert.equal(admin.status, 200);
  assert.ok(texte(admin).includes("1234,56€"));
  assert.ok(admin.corps.includes(initial.id));
  assert.ok(!admin.corps.includes("sujet-test-") && !admin.corps.includes("@example.invalid"));
  assert.equal((await appeler("/administration", "alice")).status, 307);
  controles.push("Même montant et même reçu dans le portefeuille et l’administration. Le voisin ne lit ni confirmation, ni reçu, ni montant, y compris en RSC.");

  // Anciennes préparations relues après redémarrage. Le nom courant du projet ne modifie pas le reçu.
  await db.prepare("UPDATE projets SET nom='Atelier renommé' WHERE slug='atelier-lavage'").run();
  await mf.dispose();
  mf = demarrer();
  db = await mf.getD1Database("DB");
  assert.equal(destination(await confirmer("alice", initial.id), "/portefeuille").searchParams.get("confirmation"), initial.id);
  const confirme = await appeler("/participer/confirmation?id=" + initial.id, "alice");
  assert.equal(confirme.status, 200);
  assert.ok(confirme.corps.includes("Simulation déjà enregistrée"));
  assert.ok(!confirme.corps.includes('action="/api/participations/confirmer"'));
  const retrouve = await appeler("/mon-espace", "alice");
  assert.ok(texte(retrouve).includes("1234,56€"));
  assert.equal(await db.prepare("SELECT contenu FROM documents WHERE id=?").bind("recu:" + initial.id).first("contenu"), recu);
  assert.equal(await db.prepare("SELECT date FROM historique WHERE id=?").bind("participation-confirmee:" + initial.id).first("date"), dateConfirmation);
  for (const [table, count] of Object.entries(avant)) assert.equal(await nombre(table), count + 1);
  for (const montant of ["0.01", "19200"]) {
    const id = crypto.randomUUID();
    destination(await preparer("bilal", { ...initial, id, montant }), "/participer/confirmation");
    destination(await confirmer("bilal", id), "/portefeuille");
  }
  assert.equal(await nombre("operations"), 1);
  assert.equal((await db.prepare("PRAGMA foreign_key_check").all()).results.length, 0);
  controles.push("Réouverture de D1 et du Worker : compte, participation, reçu et date conservés. Réessai après renommage sans doublon. Bornes 0,01 € et 19 200 € acceptées. Aucune opération financière ajoutée.");
  console.log(JSON.stringify({ date: new Date().toISOString(), resultat: "OK", environnement: "Worker compilé, D1 locale jetable, identités Sites simulées", controles }, null, 2));
} finally {
  await mf.dispose();
  await rm(temp, { recursive: true, force: true });
}
