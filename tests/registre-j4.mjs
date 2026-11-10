// Intégration locale du Worker de production avec une base D1 jetable.
// Les en-têtes d'identité simulent exclusivement le frontal Sites dans cet environnement.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { Miniflare } = require(require.resolve("miniflare", { paths: [require.resolve("wrangler")] }));
const racine = path.resolve("dist/server");
const config = JSON.parse(await readFile(path.join(racine, "wrangler.json"), "utf8"));
const autresModules = (await readdir(racine, { recursive: true })).filter(f => f.endsWith(".js") && f !== config.main);
const temp = await mkdtemp(path.resolve(".sites-runtime/registre-j4-"));
const origine = "https://ethigone.test";
const proprietaire = "proprietaire@example.invalid";
const identites = {
  alice: { "oai-authenticated-user-id": "sujet-test-alice", "oai-authenticated-user-email": "alice@example.invalid" },
  bilal: { "oai-authenticated-user-id": "sujet-test-bilal", "oai-authenticated-user-email": "bilal@example.invalid" },
  responsable: { "oai-authenticated-user-id": "sujet-test-responsable", "oai-authenticated-user-email": proprietaire },
};
const preuve = { date: null, environnement: "Worker compilé, D1 locale jetable, identités Sites simulées", controles: [] };
function demarrer() {
  return new Miniflare({
    cf: false, compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
    modulesRoot: racine, modules: [config.main, ...autresModules].map(f => ({ type: "ESModule", path: path.join(racine, f) })),
    d1Databases: ["DB"], d1Persist: temp, bindings: { ETHIGONE_ADMIN_BOOTSTRAP_EMAIL: proprietaire },
  });
}

let mf = demarrer();
let db;
async function appeler(route, identite, options = {}) {
  const response = await mf.dispatchFetch(origine + route, {
    ...options, headers: { ...identite, ...options.headers }, redirect: "manual",
  });
  return { status: response.status, lieu: response.headers.get("location"), cache: response.headers.get("cache-control"), corps: await response.text() };
}
function redirection(response, code, lieu) {
  assert.equal(response.status, code);
  assert.equal(new URL(response.lieu, origine).href, new URL(lieu, origine).href);
  assert.ok(!response.corps.includes("Note privée fictive"));
}
function contient(corps, libelles, attendu = true) {
  for (const mot of libelles) assert.equal(corps.includes(mot), attendu, "Visibilité inattendue de " + mot);
}
function verifierEspace(response, propre, autre) {
  assert.equal(response.status, 200);
  assert.ok(response.cache?.includes("no-store"));
  contient(response.corps, [propre + "-participation", propre + "-note", propre + "-contenu", propre + "-historique"]);
  contient(response.corps, [autre + "-participation", autre + "-note", autre + "-contenu", autre + "-historique",
    "Note privée fictive A", "Ouvrir l’administration", "sujet-test-", "@example.invalid"], false);
}
async function appliquer(fichier) {
  const migration = await readFile("drizzle/" + fichier, "utf8");
  for (const stmt of migration.split("--> statement-breakpoint")) await db.prepare(stmt.trim()).run();
}
async function nombre(sql, ...parametres) {
  return db.prepare(sql).bind(...parametres).first("n");
}
async function alimenterCompte(pseudo) {
  const userId = await db.prepare("SELECT id FROM utilisateurs WHERE identite_sites = ?").bind(identites[pseudo]["oai-authenticated-user-id"]).first("id");
  assert.ok(userId);
  // Données réservées à la copie de test : aucune attribution aux vrais comptes en ligne.
  const date = "2026-11-03T07:00:00Z";
  await db.batch([
    db.prepare("INSERT INTO participations (id, utilisateur_id, projet_slug, regles_id, libelle, montant_centimes) VALUES (?, ?, 'atelier-lavage', 'EQ-001-J3', ?, ?)").bind("p-" + pseudo, userId, pseudo + "-participation", 10_000),
    db.prepare("INSERT INTO documents (id, utilisateur_id, participation_id, titre, contenu) VALUES (?, ?, ?, ?, ?)").bind("d-" + pseudo, userId, "p-" + pseudo, pseudo + "-note", pseudo + "-contenu"),
    db.prepare("INSERT INTO historique (id, utilisateur_id, projet_slug, participation_id, document_id, libelle, date) VALUES (?, ?, 'atelier-lavage', ?, ?, ?, ?)").bind("h-" + pseudo, userId, "p-" + pseudo, "d-" + pseudo, pseudo + "-historique", date),
  ]);
  return userId;
}
const poster = (identite, origin = origine) => appeler("/api/espace/suivre", identite, { method: "POST", headers: { origin } });
try {
  db = await mf.getD1Database("DB");
  const migrations = (await readdir("drizzle")).filter(n => n.endsWith(".sql")).sort();
  await appliquer(migrations[0]);
  const projetV5 = JSON.parse(await readFile("src/data/projet.json", "utf8"));
  await db.prepare("INSERT INTO projets (slug,reference,nom,materiel,quantite,prix_unitaire_centimes,devise,fictif,couts,risques,etapes) VALUES (?,?,?,?,?,?,?,1,?,?,?)")
    .bind(projetV5.slug, projetV5.reference, "Atelier conservé", projetV5.materiel, projetV5.quantite, projetV5.prixUnitaireCentimes, projetV5.devise,
      JSON.stringify(projetV5.couts), JSON.stringify(projetV5.risques), JSON.stringify(projetV5.etapes)).run();
  for (const fichier of migrations.slice(1)) await appliquer(fichier);
  const fiches = await Promise.all([appeler("/projets/atelier-lavage"), appeler("/")]);
  for (const reponse of fiches) {
    assert.equal(reponse.status, 200);
    contient(reponse.corps, ["Atelier conservé"]);
    contient(reponse.corps, ["Note privée fictive A", "sujet-test-"], false);
  }
  assert.equal(await nombre("SELECT count(*) n FROM projets"), 1);
  assert.equal(await nombre("SELECT count(*) n FROM utilisateurs"), 2);
  assert.equal(await nombre("SELECT count(*) n FROM participations"), 2);
  assert.equal(await nombre("SELECT count(*) n FROM operations"), 1);
  assert.equal(await nombre("SELECT count(*) n FROM historique"), 3);
  assert.equal(await nombre("SELECT count(*) n FROM versions_regles"), 1);
  preuve.controles.push("Migration depuis V5, ancien dossier conservé, amorçage concurrent sans doublon et sans affichage privé sur la fiche.");

  for (const route of ["/mon-espace", "/administration"]) {
    redirection(await appeler(route), 307, "/signin-with-chatgpt?return_to=" + encodeURIComponent(route));
  }
  assert.equal((await poster({})).status, 401);
  assert.equal((await poster(identites.alice, "https://autre.test")).status, 403);
  assert.equal((await appeler("/api/espace/suivre", identites.alice, { method: "POST" })).status, 403);
  assert.equal((await appeler("/api/espace/suivre", identites.alice)).status, 405);
  redirection(await appeler("/administration?role=administrateur", identites.alice), 307, "/mon-espace?acces=reserve");
  assert.equal(await nombre("SELECT count(*) n FROM utilisateurs WHERE role = 'administrateur'"), 0);
  const admin = await appeler("/administration", identites.responsable);
  assert.equal(admin.status, 200);
  assert.ok(admin.cache?.includes("no-store"));
  contient(admin.corps, ["Registre du projet", "Investisseur synthétique A", "Note privée fictive B", "EQ-001-J3", "entretien", "Atelier conservé"]);
  contient(admin.corps, ["@example.invalid", "sujet-test-"], false);
  const persoAdmin = await appeler("/mon-espace", identites.responsable);
  contient(persoAdmin.corps, ["Ouvrir l’administration", "Aucune participation enregistrée"]);
  contient(persoAdmin.corps, ["Exemple fictif A", "Note privée fictive B"], false);
  redirection(await appeler("/administration", { ...identites.responsable, "oai-authenticated-user-id": "nouveau-sujet" }), 307, "/mon-espace?acces=reserve");
  assert.equal(await nombre("SELECT count(*) n FROM utilisateurs WHERE role='administrateur'"), 1);
  const homonyme = await appeler("/mon-espace", { ...identites.bilal, "oai-authenticated-user-id": "demo-investisseur-a" });
  contient(homonyme.corps, ["Aucune participation enregistrée"]);
  contient(homonyme.corps, ["Note privée fictive A"], false);
  preuve.controles.push("Identité absente refusée, rôle navigateur inopérant, premier investisseur sans privilège, un seul administrateur lié au sujet stable, profils de présentation non connectables.");

  await appeler("/mon-espace", identites.bilal);
  const a = await alimenterCompte("alice");
  const b = await alimenterCompte("bilal");
  assert.notEqual(a, b);
  await assert.rejects(db.prepare("INSERT INTO documents (id,utilisateur_id,participation_id,titre,contenu) VALUES ('erreur',?,'p-alice','x','x')").bind(b).run(), /FOREIGN KEY/);
  for (const montant of [0, -1, 0.5, 2 ** 53]) {
    await assert.rejects(db.prepare("INSERT INTO participations (id, utilisateur_id, projet_slug, regles_id, libelle, montant_centimes) VALUES ('invalide', ?, 'atelier-lavage', 'EQ-001-J3', 'test', ?)")
      .bind(a, montant).run(), /CHECK/);
  }
  const vues = await Promise.all([
    appeler("/mon-espace?utilisateur_id=" + b, identites.alice),
    appeler("/mon-espace?role=administrateur&utilisateur_id=" + a, identites.bilal),
    appeler("/mon-espace.rsc", identites.alice, { headers: { RSC: "1" } }),
  ]);
  verifierEspace(vues[0], "alice", "bilal");
  verifierEspace(vues[1], "bilal", "alice");
  verifierEspace(vues[2], "alice", "bilal");
  preuve.controles.push("Deux investisseurs avec participations, documents et historiques distincts. Isolation vérifiée sur HTML et réponse RSC, identifiant étranger ignoré et document croisé rejeté par D1.");

  const confirmations = await Promise.all([poster(identites.alice), appeler("/api/espace/suivre?utilisateur_id=" + b, identites.alice, {
    method: "POST", headers: { origin: origine, "content-type": "application/json" }, body: JSON.stringify({ role: "administrateur", utilisateur_id: b }),
  })]);
  for (const rep of confirmations) redirection(rep, 303, "/mon-espace#dossier");
  assert.equal(await nombre("SELECT count(*) n FROM suivis WHERE utilisateur_id=?", a), 1);
  assert.equal(await nombre("SELECT count(*) n FROM suivis WHERE utilisateur_id=?", b), 0);
  assert.equal(await nombre("SELECT count(*) n FROM historique WHERE utilisateur_id=? AND participation_id IS NULL", a), 1);
  // Injecter une panne sur la deuxième écriture dans la seule base jetable.
  await db.prepare("CREATE TRIGGER test_interruption BEFORE INSERT ON historique BEGIN SELECT RAISE(ABORT,'interruption J4 de test'); END").run();
  redirection(await poster(identites.bilal), 303, "/mon-espace?suivi=indisponible#dossier");
  assert.equal(await nombre("SELECT count(*) n FROM suivis WHERE utilisateur_id=?", b), 0);
  await db.prepare("DROP TRIGGER test_interruption").run();
  preuve.controles.push("POST protégé contre les origines tierces. Deux envois simultanés créent un suivi et un événement pour le seul titulaire. Une panne injectée annule les deux écritures.");

  await mf.dispose();
  mf = demarrer();
  db = await mf.getD1Database("DB");
  const retour = await appeler("/mon-espace", identites.alice);
  verifierEspace(retour, "alice", "bilal");
  contient(retour.corps, ["Dossier suivi", "Projet fictif ajouté au suivi personnel", "Atelier conservé"]);
  const voisin = await appeler("/mon-espace", identites.bilal);
  verifierEspace(voisin, "bilal", "alice");
  contient(voisin.corps, ["Dossier suivi"], false);
  redirection(await poster(identites.bilal), 303, "/mon-espace#dossier");
  const adminRetour = await appeler("/administration", { ...identites.responsable, "oai-authenticated-user-email": "adresse-modifiee@example.invalid" });
  assert.equal(adminRetour.status, 200);
  contient(adminRetour.corps, ["alice-participation", "bilal-note", "Projet fictif ajouté au suivi personnel"]);
  assert.equal(await nombre("SELECT count(*) n FROM participations"), 4);
  assert.equal(await nombre("SELECT count(*) n FROM operations"), 1);
  const regles = JSON.parse(await db.prepare("SELECT contenu FROM versions_regles WHERE id='EQ-001-J3'").first("contenu"));
  assert.equal(regles.capitalCentimes, 2_400_000);
  assert.equal(regles.fraisEthigoneCentimes, 30_000);
  const pageRegles = await appeler("/regles");
  assert.equal(pageRegles.status, 200);
  contient(pageRegles.corps, ["EQ-001-J3", "Versement autorisé"]);
  assert.equal((await db.prepare("PRAGMA foreign_key_check").all()).results.length, 0);
  preuve.controles.push("Réouverture du Worker et du même stockage D1 : suivi relu, voisin isolé, rôle conservé, écriture visible en administration, nouvelle tentative possible, participations et opérations inchangées.");
  preuve.date = new Date().toISOString();
  console.log(JSON.stringify({ ...preuve, resultat: "OK" }, null, 2));
} finally {
  await mf.dispose();
  await rm(temp, { recursive: true, force: true });
}
