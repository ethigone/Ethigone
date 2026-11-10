// Worker construit, identités simulées et base jetable. Aucune requête vers le Site hébergé.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { Miniflare } = require(require.resolve("miniflare", { paths: [require.resolve("wrangler")] }));
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("wrangler")] }));
const racine = path.resolve("dist/server");
const config = JSON.parse(await readFile(path.join(racine, "wrangler.json"), "utf8"));
const modules = (await readdir(racine, { recursive: true })).filter(f => f.endsWith(".js") && f !== config.main);
const temp = await mkdtemp(path.resolve(".sites-runtime/gestion-j6-"));
const origine = "https://ethigone.test";
const comptes = Object.fromEntries(["alice", "bilal", "proprietaire"].map(n => [n, {
  "oai-authenticated-user-id": "gestion-test-" + n, "oai-authenticated-user-email": n + "@example.invalid",
}]));
const controles = [];
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
async function poster(donnees, utilisateur = "proprietaire", route = "/api/gestion", origin = origine) {
  return appeler(route, utilisateur, { method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded" }, body: typeof donnees === "string" ? donnees : new URLSearchParams(donnees).toString() });
}
function destination(rep) {
  assert.equal(rep.status, 303, rep.corps.slice(0, 160));
  assert.ok(rep.cache?.includes("no-store"));
  return new URL(rep.lieu, origine);
}
function succes(rep, id) {
  const url = destination(rep);
  assert.equal(url.pathname, "/administration/gestion");
  assert.equal(url.searchParams.get("id"), id);
  assert.equal(url.searchParams.get("erreur"), null, rep.lieu);
}
function erreur(rep, code) { assert.equal(destination(rep).searchParams.get("erreur"), code); }
const champ = (html, nom) => [...html.matchAll(/<input\b[^>]*>/g)].find(m => m[0].includes('name="' + nom + '"'))?.[0].match(/value="([^"]*)"/)?.[1];
const texte = rep => rep.corps.replace(/<[^>]*>/g, "").replace(/\s/g, "");
const row = (table, id) => db.prepare("SELECT * FROM " + table + " WHERE id=?").bind(id).first();
const nombre = table => db.prepare("SELECT count(*) n FROM " + table).first("n");
const mouvement = (situationId, revision, type, montant, extras = {}) => ({ action: "operation", id: crypto.randomUUID(), situationId, revision: String(revision), type, montant, libelle: "Mouvement fictif " + type, pieceTexte: "Pièce fictive de vérification J6.", ...extras });
const distribution = (situationId, revision, extras = {}) => ({ action: "distribuer", id: crypto.randomUUID(), situationId, revision: String(revision), confirme: "oui", ...extras });
async function creer(scenarioId) {
  const saisie = { action: "creer", id: crypto.randomUUID(), scenarioId };
  succes(await poster(saisie), saisie.id);
  return saisie.id;
}
async function migration(nom) {
  const contenu = await readFile("drizzle/" + nom, "utf8");
  for (const sql of contenu.split("--> statement-breakpoint")) await db.prepare(sql.trim()).run();
}
async function essai(utilisateur, montant) {
  const page = await appeler("/participer", utilisateur);
  assert.equal(page.status, 200, page.corps.slice(0, 300));
  const id = champ(page.corps, "id");
  assert.ok(id);
  destination(await poster({ id, reglesId: "EQ-001-J3", montant, accepte: "oui" }, utilisateur, "/api/participations/preparer"));
  destination(await poster({ id, confirme: "oui" }, utilisateur, "/api/participations/confirmer"));
  return id;
}
try {
  db = await mf.getD1Database("DB");
  const migrations = (await readdir("drizzle")).filter(f => f.endsWith(".sql")).sort();
  for (const fichier of migrations.slice(0, 3)) await migration(fichier);
  await esbuild.build({ stdin: { contents: 'export { reglesDemo } from "./src/economie/demo"; export { projeterEssai } from "./src/economie/projection";', resolveDir: process.cwd() }, bundle: true, platform: "node", format: "cjs", outfile: path.join(temp, "economie.cjs") });
  const { reglesDemo, projeterEssai } = require(path.join(temp, "economie.cjs"));
  const projet = JSON.parse(await readFile("src/data/projet.json", "utf8"));
  // État hérité créé avec le schéma J5. Le nouveau Worker démarre après sa migration, comme en ligne.
  await db.batch([
    db.prepare("INSERT INTO projets (slug,reference,nom,materiel,quantite,prix_unitaire_centimes,devise,fictif,couts,risques,etapes) VALUES (?,?,?,?,?,?,?,1,?,?,?)").bind(projet.slug, projet.reference, projet.nom, projet.materiel, projet.quantite, projet.prixUnitaireCentimes, projet.devise, JSON.stringify(projet.couts), JSON.stringify(projet.risques), JSON.stringify(projet.etapes)),
    db.prepare("INSERT INTO versions_regles (id,projet_slug,contenu) VALUES ('EQ-001-J3','atelier-lavage',?)").bind(JSON.stringify(reglesDemo)),
    db.prepare("INSERT INTO utilisateurs (id,identite_fictive,libelle,role) VALUES ('demo-investisseur-a','synthetique-a','Investisseur synthétique A','investisseur')"),
    db.prepare("INSERT INTO participations (id,utilisateur_id,projet_slug,regles_id,libelle,montant_centimes) VALUES ('demo-participation-a','demo-investisseur-a','atelier-lavage','EQ-001-J3','Exemple fictif A',100000)"),
    db.prepare("INSERT INTO documents (id,utilisateur_id,participation_id,titre,contenu) VALUES ('demo-document-a','demo-investisseur-a','demo-participation-a','Note privée fictive A','Pièce héritée J4')"),
    db.prepare("INSERT INTO operations (id,projet_slug,regles_id,libelle,montant_centimes) VALUES ('demo-operation','atelier-lavage','EQ-001-J3','Entretien fictif hérité',10000)"),
    db.prepare("INSERT INTO preparations_participation (id,utilisateur_id,projet_slug,regles_id,montant_centimes,date) VALUES ('ancienne-preparation','demo-investisseur-a','atelier-lavage','EQ-001-J3',100000,'2026-11-04T08:00:00Z')"),
  ]);
  const heritees = ["participations", "documents", "preparations_participation"];
  for (const fichier of migrations.slice(3)) await migration(fichier);
  for (const table of heritees) assert.equal(await nombre(table), 1);
  assert.equal((await row("documents", "demo-document-a")).contenu, "Pièce héritée J4");
  assert.equal((await row("operations", "demo-operation")).situation_id, null);
  assert.equal((await row("operations", "demo-operation")).montant_centimes, 10000);
  const alice = await essai("alice", "1234,56");
  const bilal = await essai("bilal", "987,65");
  const avant = { participations: await nombre("participations"), documents: await nombre("documents"), preparations_participation: await nombre("preparations_participation") };
  for (const [table, n] of Object.entries(avant)) assert.equal(await nombre(table), n);
  assert.equal((await row("operations", "demo-operation")).situation_id, null);
  controles.push("Migration depuis le schéma J5 avec participation, préparation, pièce et entretien hérités préservés. Deux essais personnels créés ensuite par le parcours normal. Entretien J4 non rattaché aux situations.");

  for (const route of ["/administration/gestion", "/suivi-projet", "/suivi-projet?id=" + crypto.randomUUID()]) {
    const rep = await appeler(route);
    assert.equal(rep.status, 307);
    assert.equal(new URL(rep.lieu, origine).searchParams.get("return_to"), route);
  }
  assert.equal((await appeler("/api/gestion", undefined, { method: "POST", headers: { origin: origine } })).status, 401);
  assert.equal((await poster({ action: "creer" }, "alice")).status, 403);
  assert.equal((await appeler("/administration/gestion", "alice")).status, 307);
  assert.equal((await poster({}, "proprietaire", "/api/gestion", "https://autre.test")).status, 403);
  assert.equal((await appeler("/api/gestion", "proprietaire", { method: "POST" })).status, 403);
  assert.equal((await appeler("/api/gestion", "proprietaire")).status, 405);
  erreur(await poster("action=creer&action=operation"), "formulaire");
  erreur(await poster("action=" + "x".repeat(25000)), "formulaire");
  erreur(await poster({ action: "creer", id: "bad", scenarioId: "benefice" }), "saisie");
  erreur(await poster({ action: "creer", id: crypto.randomUUID(), scenarioId: "autre" }), "saisie");
  assert.equal(await nombre("situations_gestion"), 0);
  controles.push("Accès authentifié, rôle administrateur, origine, méthode, corps borné et champs uniques vérifiés. Les investisseurs peuvent lire sans écrire.");

  const accueil = await appeler("/administration/gestion", "proprietaire");
  assert.equal(accueil.status, 200);
  assert.ok(accueil.cache?.includes("no-store"));
  const formulaire = [...accueil.corps.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].find(m => m[0].includes('value="benefice"'))[0];
  const creation = { action: "creer", id: champ(formulaire, "id"), scenarioId: "benefice" };
  for (const rep of await Promise.all([poster(creation), poster(creation)])) succes(rep, creation.id);
  const benefice = creation.id;
  const perte = await creer("perte");
  const retard = await creer("retard");
  assert.equal(await nombre("situations_gestion"), 3);
  erreur(await poster({ ...creation, scenarioId: "perte" }), "conflit");
  for (const [id, chiffres] of [[benefice, ["2700€", "11700€", "15000€"]], [perte, ["7300€", "2700€", "14000€"]], [retard, ["2700€", "9000€", "15000€"]]]) {
    const page = await appeler("/suivi-projet?id=" + id, "alice");
    assert.equal(page.status, 200, page.corps.slice(0, 200));
    assert.ok(page.cache?.includes("no-store"));
    for (const montant of chiffres) assert.ok(texte(page).includes(montant), montant);
    assert.equal((page.corps.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok(page.corps.includes("Démo privée"));
    assert.ok(!page.corps.includes('action="/api/gestion"'));
  }
  erreur(await poster(distribution(perte, 0)), "plafond");
  erreur(await poster(distribution(retard, 0)), "plafond");
  assert.equal(await nombre("distributions_gestion"), 0);
  const valeursAvant = JSON.stringify(await row("situations_gestion", retard));
  const invalides = [
    mouvement(retard, 0, "encaissement", "9000.01"), mouvement(retard, 0, "depense", "2700.01"),
    mouvement(retard, 0, "valorisation", "18000.01"), mouvement(retard, 0, "recette", "1.001"),
    mouvement(retard, 0, "recette", "90071992547409.92"), mouvement(retard, 0, "recette", "-1"),
    mouvement(retard, 0, "recette", "0"), mouvement(retard, 0, "incident", "1"), mouvement(retard, 0, "inconnu", "1"),
    mouvement(retard, 0, "incident", "", { pieceTexte: " " }), mouvement(retard, 0, "incident", "", { libelle: "x".repeat(161) }),
    mouvement(retard, 0, "incident", "", { pieceTexte: "x".repeat(1201) }), mouvement(retard, 0, "incident", "", { revision: "0e0" }),
  ];
  for (const donnees of invalides) erreur(await poster(donnees), "saisie");
  assert.equal(JSON.stringify(await row("situations_gestion", retard)), valeursAvant);
  controles.push("Bénéfice, perte et retard affichent les montants J3 exacts. Distribution bloquée en perte/retard. Dépassements de cash, créance, valeur d’achat, centimes et données manquantes refusés sans écriture.");

  const encaissement = mouvement(retard, 0, "encaissement", "9000", { utilisateurId: "fraude", reglesId: "autre" });
  for (const rep of await Promise.all([poster(encaissement), poster(encaissement)])) succes(rep, retard);
  let etat = await row("situations_gestion", retard);
  assert.equal(etat.loyers_dus_centimes, 1000000);
  assert.equal(etat.loyers_encaisses_centimes, 1000000);
  assert.equal(etat.revision, 1);
  assert.equal(etat.regles_id, "EQ-001-J3");
  assert.equal((await row("operations", encaissement.id)).montant_centimes, 900000);
  erreur(await poster({ ...encaissement, montant: "1" }), "conflit");
  erreur(await poster(mouvement(retard, 0, "depense", "1")), "conflit");
  const depense = mouvement(retard, 1, "depense", "1,01");
  succes(await poster(depense), retard);
  const recette = mouvement(retard, 2, "recette", "120.11");
  succes(await poster(recette), retard);
  const valorisation = mouvement(retard, 3, "valorisation", "14999.99");
  succes(await poster(valorisation), retard);
  const incident = mouvement(retard, 4, "incident", "", { libelle: "Panne fictive <script>alert(1)</script>", pieceTexte: "Équipement à vérifier. " + "é".repeat(580) });
  succes(await poster(incident), retard);
  etat = await row("situations_gestion", retard);
  assert.equal(etat.revision, 5);
  assert.equal(etat.loyers_dus_centimes, 1012011);
  assert.equal(etat.loyers_encaisses_centimes, 1012011);
  assert.equal(etat.charges_exploitation_centimes, 400101);
  assert.equal(etat.valeur_machines_centimes, 1499999);
  assert.equal((await row("operations", incident.id)).montant_centimes, 0);
  succes(await poster(encaissement), retard);
  succes(await poster(creation), benefice);
  const avecPieces = await appeler("/suivi-projet?id=" + retard, "alice");
  assert.ok(avecPieces.corps.includes("&lt;script&gt;"));
  assert.ok(!avecPieces.corps.includes("<script>alert(1)</script>"));
  assert.ok(texte(avecPieces).includes("2819,09€"));
  assert.ok(texte(avecPieces).includes("11819,10€"));
  assert.ok(texte(avecPieces).includes("300€"));
  controles.push("Recette, encaissement, dépense, valorisation et incident persistants avec leurs pièces. Encaisser la créance ne double pas le revenu, incident sans effet monétaire, frais de 300 € uniques. Reprises après progression et textes échappés contrôlés.");

  const tablesGestion = ["situations_gestion", "operations", "commandes_gestion", "distributions_gestion", "historique"];
  const avantPanne = Object.fromEntries(await Promise.all(tablesGestion.map(async t => [t, await nombre(t)])));
  const avantPanneEtat = JSON.stringify(await row("situations_gestion", benefice));
  await db.prepare("CREATE TRIGGER panne_j6 BEFORE INSERT ON historique WHEN NEW.id LIKE 'gestion:%' BEGIN SELECT RAISE(ABORT,'Panne J6'); END").run();
  const opInterrompue = mouvement(benefice, 0, "depense", "1");
  erreur(await poster(opInterrompue), "indisponible");
  const versement = distribution(benefice, 0, { montant: "0.01", investisseursCentimes: "1" });
  erreur(await poster(versement), "indisponible");
  for (const [table, n] of Object.entries(avantPanne)) assert.equal(await nombre(table), n);
  assert.equal(JSON.stringify(await row("situations_gestion", benefice)), avantPanneEtat);
  await db.prepare("DROP TRIGGER panne_j6").run();
  erreur(await poster({ ...versement, confirme: "non" }), "saisie");
  for (const rep of await Promise.all([poster(versement), poster(versement)])) succes(rep, benefice);
  const versementStocke = await row("distributions_gestion", versement.id);
  assert.equal(versementStocke.total_centimes, 270000);
  assert.equal(versementStocke.investisseurs_centimes, 216000);
  assert.equal(versementStocke.operateur_centimes, 54000);
  assert.equal(JSON.parse(versementStocke.bilan_avant).resultatEconomiqueCentimes, 270000);
  assert.equal((await row("situations_gestion", benefice)).statut, "distribuee");
  erreur(await poster(distribution(benefice, 1)), "conflit");
  erreur(await poster(mouvement(benefice, 1, "recette", "1")), "conflit");
  const cloture = await appeler("/suivi-projet?id=" + benefice, "alice");
  assert.ok(texte(cloture).includes("9000€"));
  assert.ok(texte(cloture).includes("2700€"));
  assert.ok(texte(cloture).includes("138,88€"));
  assert.ok(texte(cloture).includes("1234,56€"));
  assert.ok(!texte(cloture).includes("987,65€"));
  assert.ok(!cloture.corps.includes(bilal.slice(0, 8)));
  const voisin = await appeler("/suivi-projet.rsc?id=" + benefice, "bilal", { headers: { RSC: "1" } });
  assert.equal(voisin.status, 200);
  assert.ok(!voisin.corps.includes("123456") && !voisin.corps.includes(alice.slice(0, 8)));
  const admin = await appeler("/administration/gestion?id=" + benefice, "proprietaire");
  assert.ok(texte(admin).includes("9000€"));
  assert.ok(admin.corps.includes("Situation clôturée"));
  assert.ok(!admin.corps.includes('name="situationId"'));
  controles.push("Panne au dernier enregistrement annule tout mouvement/distribution. Double confirmation concurrente produit une seule distribution 2 700 € répartie 2 160/540 €, clôture stable et cash de 9 000 €. Résultat conservé. Projections personnelles isolées en HTML/RSC.");

  const distribRetard = distribution(retard, 5);
  succes(await poster(distribRetard), retard);
  const arrondi = await row("distributions_gestion", distribRetard.id);
  assert.equal(arrondi.total_centimes, 281909);
  assert.equal(arrondi.investisseurs_centimes, 225527);
  assert.equal(arrondi.operateur_centimes, 56382);
  const pageArrondie = await appeler("/suivi-projet?id=" + retard, "alice");
  assert.ok(texte(pageArrondie).includes("9000,01€"));
  const course = await creer("benefice");
  const candidats = [mouvement(course, 0, "depense", "1"), distribution(course, 0)];
  const reponses = await Promise.all(candidats.map(c => poster(c)));
  assert.equal(reponses.filter(r => !destination(r).searchParams.has("erreur")).length, 1);
  assert.equal((await row("situations_gestion", course)).revision, 1);
  assert.equal(Number(!!await row("operations", candidats[0].id)) + Number(!!await row("distributions_gestion", candidats[1].id)), 1);
  const courseCle = await creer("benefice");
  const cle = crypto.randomUUID();
  const memesCles = [mouvement(courseCle, 0, "depense", "2", { id: cle }), distribution(courseCle, 0, { id: cle })];
  const reponsesCle = await Promise.all(memesCles.map(c => poster(c)));
  assert.equal(reponsesCle.filter(r => !destination(r).searchParams.has("erreur")).length, 1);
  assert.equal(Number(!!await row("operations", cle)) + Number(!!await row("distributions_gestion", cle)), 1);
  const perteTotaleMachines = await creer("perte");
  succes(await poster(mouvement(perteTotaleMachines, 0, "valorisation", "0")), perteTotaleMachines);
  erreur(await poster(distribution(perteTotaleMachines, 1)), "plafond");
  controles.push("Répartition au centime avec résidu exact, équipement valorisé à zéro, concurrence opération/distribution et réutilisation concurrente d’une même clé pour deux actions contrôlées.");

  const regles = JSON.parse((await row("situations_gestion", benefice)).regles);
  assert.deepEqual(projeterEssai(123456, regles, 216000, 216000), { resultatCentimes: 13888, distributionCentimes: 13888, capitalInvestisseursCentimes: 1920000 });
  assert.equal(projeterEssai(123456, regles, -584000, 0).resultatCentimes, -37551);
  assert.equal(projeterEssai(1920000, regles, 216000, 216000).distributionCentimes, 216000);
  assert.equal(projeterEssai(1, regles, 216000, 216000).distributionCentimes, 0);
  assert.throws(() => projeterEssai(1920001, regles, 216000, 216000));
  assert.throws(() => projeterEssai(0.1, regles, 216000, 216000));
  controles.push("Projections BigInt en centimes aux bornes 0,01/19 200 €, bénéfice/perte et troncature vers zéro. Aucune somme des essais personnels.");

  for (const [table, n] of Object.entries(avant)) assert.equal(await nombre(table), n);
  const distributionAvant = JSON.stringify(await row("distributions_gestion", versement.id));
  const pieceAvant = JSON.stringify(await row("operations", incident.id));
  await mf.dispose();
  mf = demarrer();
  db = await mf.getD1Database("DB");
  const reprise = await appeler("/suivi-projet?id=" + benefice, "alice");
  assert.equal(reprise.status, 200);
  assert.ok(texte(reprise).includes("138,88€"));
  succes(await poster(versement), benefice);
  assert.equal(JSON.stringify(await row("distributions_gestion", versement.id)), distributionAvant);
  assert.equal(JSON.stringify(await row("operations", incident.id)), pieceAvant);
  assert.equal((await appeler("/administration/gestion?id=" + retard, "proprietaire")).status, 200);
  controles.push("Redémarrage D1/Worker et reconnexion simulée conservent mêmes pièces, date et distribution. Les tables de participations/reçus J5 restent inchangées.");
  console.log(JSON.stringify({ verification: "OK", controles, environnement: "Worker compilé et D1 locale jetable, identités simulées", date: new Date().toISOString() }, null, 2));
} finally {
  await mf.dispose();
  await rm(temp, { recursive: true, force: true });
}
