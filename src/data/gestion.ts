import { desc, eq, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { commandesGestion, distributionsGestion, operations, situationsGestion } from "@/db/schema";
import { calculerScenario, repartirCentimes, scenariosDemo, type ScenarioDemo } from "@/src/economie/demo";
import { lireReglesDemo, verifierCompte, type Compte } from "./registre";
import { uuidPreparation } from "./formulaire-participation";

export class ErreurGestion extends Error {
  constructor(public code: "saisie" | "conflit" | "introuvable" | "interdit" | "plafond", message: string, public status = 400) {
    super(message);
    this.name = "ErreurGestion";
  }
}
export type TypeOperationGestion = "recette" | "encaissement" | "depense" | "valorisation" | "incident";
export type SaisieOperationGestion = { id: string; situationId: string; revision: number; type: TypeOperationGestion; montant: string; libelle: string; pieceTexte: string };
export type SituationResume = Pick<typeof situationsGestion.$inferSelect, "id" | "titre" | "scenarioId" | "revision" | "statut" | "date">;
export type SituationDetail = typeof situationsGestion.$inferSelect & {
  bilan: ReturnType<typeof calculerScenario>;
  operations: { id: string; type: TypeOperationGestion; libelle: string; montantCentimes: number; pieceTexte: string; date: string }[];
  distribution: Pick<typeof distributionsGestion.$inferSelect, "id" | "totalCentimes" | "investisseursCentimes" | "operateurCentimes" | "date"> | null;
  tresorerieApresCentimes: number;
};
const projetSlug = "atelier-lavage";

/** Prépare le SQL paramétré puis utilise le batch transactionnel natif D1. */
async function ecrireLot(requetes: SQL[]) {
  const db = getDb();
  const instructions = requetes.map(requete => {
    const query = db.run(requete).getQuery();
    return db.$client.prepare(query.sql).bind(...query.params);
  });
  await db.$client.batch(instructions);
}

async function autoriser(compte: Compte, admin = false) {
  try { return await verifierCompte(compte, admin); }
  catch { throw new ErreurGestion("interdit", "Accès à la gestion refusé.", 403); }
}
function verifierId(id: string) {
  if (typeof id !== "string" || !uuidPreparation.test(id)) throw new ErreurGestion("saisie", "Référence UUID de démonstration invalide.");
}
function verifierRevision(revision: number) {
  if (!Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER) throw new ErreurGestion("saisie", "Révision invalide.");
}
function texte(valeur: string, maximum: number) {
  if (typeof valeur !== "string" || !valeur.trim() || valeur.length > maximum) throw new ErreurGestion("saisie", `Texte obligatoire, limité à ${maximum} caractères.`);
  return valeur.trim();
}
function montantExact(valeur: string) {
  if (typeof valeur !== "string" || valeur.length > 18 || !/^[0-9]+(?:[.,][0-9]{1,2})?$/.test(valeur)) throw new ErreurGestion("saisie", "Montant EUR exact requis, avec deux décimales au maximum.");
  const [euros, fraction = ""] = valeur.replace(",", ".").split(".");
  const centimes = BigInt(euros) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  if (centimes > BigInt(Number.MAX_SAFE_INTEGER)) throw new ErreurGestion("saisie", "Montant trop élevé.");
  return Number(centimes);
}
function bilan(situation: typeof situationsGestion.$inferSelect) {
  try { return calculerScenario({ ...situation.initial, ...situation }, situation.regles); }
  catch (erreur) { throw new ErreurGestion("saisie", erreur instanceof Error ? erreur.message : "Situation économique invalide."); }
}
async function detail(id: string): Promise<SituationDetail | null> {
  const db = getDb();
  const [situations, mouvements, distributions] = await db.batch([
    db.select().from(situationsGestion).where(eq(situationsGestion.id, id)),
    db.select({ id: operations.id, type: operations.type, libelle: operations.libelle, montantCentimes: operations.montantCentimes, pieceTexte: operations.pieceTexte, date: operations.date }).from(operations).where(eq(operations.situationId, id)).orderBy(operations.date, operations.id),
    db.select({ id: distributionsGestion.id, totalCentimes: distributionsGestion.totalCentimes, investisseursCentimes: distributionsGestion.investisseursCentimes, operateurCentimes: distributionsGestion.operateurCentimes, date: distributionsGestion.date }).from(distributionsGestion).where(eq(distributionsGestion.situationId, id)),
  ]);
  const situation = situations[0];
  if (!situation) return null;
  const distribution = distributions[0];
  const resultat = bilan(situation);
  return { ...situation, bilan: resultat, operations: mouvements.map((m) => ({ ...m, type: m.type as TypeOperationGestion, pieceTexte: m.pieceTexte ?? "", date: m.date ?? situation.date })), distribution: distribution ?? null, tresorerieApresCentimes: resultat.tresorerieCentimes - (distribution?.totalCentimes ?? 0) };
}
async function reprise(id: string, payload: string) {
  const commande = await getDb().select().from(commandesGestion).where(eq(commandesGestion.id, id)).get();
  if (!commande) return null;
  if (commande.payload !== payload) throw new ErreurGestion("conflit", "Cette clé de commande a déjà un autre contenu.", 409);
  return detail(commande.situationId);
}
async function terminer(id: string, payload: string): Promise<SituationDetail> {
  const resultat = await reprise(id, payload);
  if (!resultat) throw new ErreurGestion("conflit", "La situation a changé. Rechargez son état avant de réessayer.", 409);
  return resultat;
}
export async function listerSituations(compte: Compte): Promise<SituationResume[]> {
  await autoriser(compte);
  return getDb().select({ id: situationsGestion.id, titre: situationsGestion.titre, scenarioId: situationsGestion.scenarioId, revision: situationsGestion.revision, statut: situationsGestion.statut, date: situationsGestion.date }).from(situationsGestion).orderBy(desc(situationsGestion.date));
}
export async function lireSituation(compte: Compte, id: string): Promise<SituationDetail | null> {
  await autoriser(compte); verifierId(id); return detail(id);
}
export async function creerSituation(compte: Compte, saisie: { id: string; scenarioId: string }): Promise<SituationDetail> {
  await autoriser(compte, true); verifierId(saisie.id);
  const scenario = scenariosDemo.find((s) => s.id === saisie.scenarioId);
  if (!scenario) throw new ErreurGestion("saisie", "Scénario de démonstration invalide.");
  const payload = JSON.stringify({ action: "creation", id: saisie.id, scenarioId: scenario.id });
  const existante = await reprise(saisie.id, payload); if (existante) return existante;
  const regles = await lireReglesDemo();
  calculerScenario(scenario, regles);
  const date = new Date().toISOString();
  await ecrireLot([
    sql`INSERT INTO situations_gestion (id,projet_slug,scenario_id,titre,regles_id,regles,initial,loyers_dus_centimes,loyers_encaisses_centimes,charges_exploitation_centimes,valeur_machines_centimes,revision,statut,date,derniere_commande)
      SELECT ${saisie.id},${projetSlug},${scenario.id},${scenario.titre},${regles.identifiant},${JSON.stringify(regles)},${JSON.stringify(scenario)},${scenario.loyersDusCentimes},${scenario.loyersEncaissesCentimes},${scenario.chargesExploitationCentimes},${scenario.valeurMachinesCentimes},0,'ouverte',${date},${saisie.id}
      WHERE NOT EXISTS (SELECT 1 FROM commandes_gestion WHERE id=${saisie.id}) ON CONFLICT(id) DO NOTHING`,
    sql`INSERT INTO commandes_gestion (id,situation_id,payload) SELECT ${saisie.id},id,${payload} FROM situations_gestion WHERE id=${saisie.id} AND derniere_commande=${saisie.id} AND revision=0 ON CONFLICT(id) DO NOTHING`,
    sql`INSERT INTO historique (id,projet_slug,libelle,date) SELECT ${`gestion:${saisie.id}`},${projetSlug},'Situation de gestion fictive créée',${date} FROM commandes_gestion WHERE id=${saisie.id} AND payload=${payload} ON CONFLICT(id) DO NOTHING`,
  ]);
  return terminer(saisie.id, payload);
}
export async function ajouterOperation(compte: Compte, saisie: SaisieOperationGestion): Promise<SituationDetail> {
  await autoriser(compte, true); verifierId(saisie.id); verifierId(saisie.situationId); verifierRevision(saisie.revision);
  if (!["recette", "encaissement", "depense", "valorisation", "incident"].includes(saisie.type)) throw new ErreurGestion("saisie", "Type d’opération invalide.");
  const libelle = texte(saisie.libelle, 160), pieceTexte = texte(saisie.pieceTexte, 1200);
  const montantCentimes = saisie.type === "incident" ? 0 : montantExact(saisie.montant);
  if (saisie.type === "incident" && saisie.montant !== "") throw new ErreurGestion("saisie", "Un incident doit être saisi sans montant.");
  if (saisie.type !== "incident" && saisie.type !== "valorisation" && montantCentimes === 0) throw new ErreurGestion("saisie", "Un montant strictement positif est requis.");
  const payload = JSON.stringify({ action: "operation", id: saisie.id, situationId: saisie.situationId, revision: saisie.revision, type: saisie.type, montant: saisie.montant, libelle, pieceTexte });
  const existante = await reprise(saisie.id, payload); if (existante) return existante;
  const situation = await detail(saisie.situationId);
  if (!situation) throw new ErreurGestion("introuvable", "Situation introuvable.", 404);
  if (situation.statut !== "ouverte" || situation.revision !== saisie.revision) return terminer(saisie.id, payload);
  const etat: ScenarioDemo = { ...situation.initial, loyersDusCentimes: situation.loyersDusCentimes + (saisie.type === "recette" ? montantCentimes : 0), loyersEncaissesCentimes: situation.loyersEncaissesCentimes + (["recette", "encaissement"].includes(saisie.type) ? montantCentimes : 0), chargesExploitationCentimes: situation.chargesExploitationCentimes + (saisie.type === "depense" ? montantCentimes : 0), valeurMachinesCentimes: saisie.type === "valorisation" ? montantCentimes : situation.valeurMachinesCentimes };
  bilan({ ...situation, ...etat });
  const date = new Date().toISOString();
  const revision = saisie.revision + 1;
  const condition = sql`id=${saisie.situationId} AND derniere_commande=${saisie.id} AND revision=${revision} AND statut='ouverte' AND NOT EXISTS (SELECT 1 FROM commandes_gestion WHERE id=${saisie.id} AND payload<>${payload})`;
  await ecrireLot([
    sql`UPDATE situations_gestion SET loyers_dus_centimes=${etat.loyersDusCentimes},loyers_encaisses_centimes=${etat.loyersEncaissesCentimes},charges_exploitation_centimes=${etat.chargesExploitationCentimes},valeur_machines_centimes=${etat.valeurMachinesCentimes},revision=${revision},derniere_commande=${saisie.id} WHERE id=${saisie.situationId} AND revision=${saisie.revision} AND statut='ouverte' AND NOT EXISTS (SELECT 1 FROM commandes_gestion WHERE id=${saisie.id})`,
    sql`INSERT INTO operations (id,regles_id,projet_slug,situation_id,type,libelle,montant_centimes,piece_texte,date) SELECT ${saisie.id},regles_id,projet_slug,id,${saisie.type},${libelle},${montantCentimes},${pieceTexte},${date} FROM situations_gestion WHERE ${condition} ON CONFLICT(id) DO NOTHING`,
    sql`INSERT INTO commandes_gestion (id,situation_id,payload) SELECT ${saisie.id},id,${payload} FROM situations_gestion WHERE ${condition} ON CONFLICT(id) DO NOTHING`,
    sql`INSERT INTO historique (id,projet_slug,operation_id,libelle,date) SELECT ${`gestion:${saisie.id}`},${projetSlug},${saisie.id},${`Opération fictive • ${libelle}`},${date} FROM situations_gestion WHERE ${condition} ON CONFLICT(id) DO NOTHING`,
  ]);
  return terminer(saisie.id, payload);
}
export async function distribuerSituation(compte: Compte, saisie: { id: string; situationId: string; revision: number }): Promise<SituationDetail> {
  await autoriser(compte, true); verifierId(saisie.id); verifierId(saisie.situationId); verifierRevision(saisie.revision);
  const payload = JSON.stringify({ action: "distribution", id: saisie.id, situationId: saisie.situationId, revision: saisie.revision });
  const existante = await reprise(saisie.id, payload); if (existante) return existante;
  const situation = await detail(saisie.situationId);
  if (!situation) throw new ErreurGestion("introuvable", "Situation introuvable.", 404);
  if (situation.statut !== "ouverte" || situation.revision !== saisie.revision) return terminer(saisie.id, payload);
  const total = situation.bilan.plafondIllustratifCentimes;
  if (total === 0) throw new ErreurGestion("plafond", "Le plafond de distribution fictive est nul.");
  const parts = repartirCentimes(total, situation.regles.partsBeneficesInvestisseursPourcent);
  const date = new Date().toISOString();
  const revision = saisie.revision + 1;
  const condition = sql`id=${saisie.situationId} AND derniere_commande=${saisie.id} AND revision=${revision} AND statut='distribuee' AND NOT EXISTS (SELECT 1 FROM commandes_gestion WHERE id=${saisie.id} AND payload<>${payload})`;
  await ecrireLot([
    sql`UPDATE situations_gestion SET statut='distribuee',revision=${revision},derniere_commande=${saisie.id} WHERE id=${saisie.situationId} AND revision=${saisie.revision} AND statut='ouverte' AND NOT EXISTS (SELECT 1 FROM commandes_gestion WHERE id=${saisie.id})`,
    sql`INSERT INTO distributions_gestion (id,situation_id,total_centimes,investisseurs_centimes,operateur_centimes,bilan_avant,date) SELECT ${saisie.id},id,${total},${parts.investisseursCentimes},${parts.operateurCentimes},${JSON.stringify(situation.bilan)},${date} FROM situations_gestion WHERE ${condition} ON CONFLICT(id) DO NOTHING`,
    sql`INSERT INTO commandes_gestion (id,situation_id,payload) SELECT ${saisie.id},id,${payload} FROM situations_gestion WHERE ${condition} ON CONFLICT(id) DO NOTHING`,
    sql`INSERT INTO historique (id,projet_slug,libelle,date) SELECT ${`gestion:${saisie.id}`},${projetSlug},'Distribution fictive simulée — aucun paiement',${date} FROM situations_gestion WHERE ${condition} ON CONFLICT(id) DO NOTHING`,
  ]);
  return terminer(saisie.id, payload);
}
