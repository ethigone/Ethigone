import { and, desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { candidatures, commandesCandidatures } from "@/db/schema";
import { verifierCompte, type Compte } from "./registre";
import { uuidPreparation } from "./formulaire-participation";
import { champsDossier, criteres, dossierVide, etatsCritere, type Dossier } from "./candidatures-formulaire";

export class ErreurCandidature extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}
export async function listerCandidatures(compte: Compte, administration = false) {
  await verifierCompte(compte, administration);
  const lignes = await getDb().select().from(candidatures)
    .where(administration ? ne(candidatures.statut, "brouillon") : eq(candidatures.utilisateurId, compte.id))
    .orderBy(desc(candidatures.date), candidatures.id);
  if (!administration) return { dossiers: lignes, indisponibles: 0 };
  const partagees = await Promise.all(lignes.map(async ligne => {
    const lecture = await lireCandidature(compte, ligne.id);
    return lecture?.dossier ?? null;
  }));
  const dossiers = partagees.filter(dossier => dossier !== null);
  dossiers.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  return { dossiers, indisponibles: lignes.length - dossiers.length };
}
export async function lireCandidature(compte: Compte, id: string) {
  await verifierCompte(compte);
  if (!uuidPreparation.test(id)) return null;
  const dossier = await getDb().select().from(candidatures).where(and(eq(candidatures.id, id),
    compte.role === "administrateur" ? ne(candidatures.statut, "brouillon") : eq(candidatures.utilisateurId, compte.id))).get();
  // Un administrateur conserve aussi l'accès à ses propres brouillons.
  const propre = dossier || await getDb().select().from(candidatures).where(and(eq(candidatures.id, id), eq(candidatures.utilisateurId, compte.id))).get();
  if (!propre) return null;
  const historique = await getDb().select().from(commandesCandidatures).where(eq(commandesCandidatures.candidatureId, id)).orderBy(commandesCandidatures.date, commandesCandidatures.id);
  if (compte.role === "administrateur" && propre.utilisateurId !== compte.id) {
    const partage = historique.filter(entree => {
      const instantane = JSON.parse(entree.instantane);
      return instantane.action === "soumettre" || instantane.action === "revoir";
    });
    partage.sort((a, b) => JSON.parse(a.instantane).revision - JSON.parse(b.instantane).revision);
    const soumis = [...partage].reverse().find(entree => JSON.parse(entree.instantane).action === "soumettre");
    if (!soumis) return null;
    return { dossier: { ...propre, contenu: JSON.parse(soumis.instantane).contenu as Dossier, revision: JSON.parse(soumis.instantane).revision as number, date: soumis.date }, historique: partage };
  }
  return { dossier: propre, historique };
}
function texte(valeur: string) {
  const valeurNettoyee = valeur.replace(/\r\n?/g, "\n").trim();
  if (valeurNettoyee.length > 1200 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(valeurNettoyee)) throw new ErreurCandidature("saisie");
  return valeurNettoyee;
}
export async function commanderCandidature(compte: Compte, form: URLSearchParams) {
  const action = form.get("action") || "";
  const id = form.get("id") || "";
  const dossierId = action === "creer" ? id : form.get("dossierId") || "";
  const revue = action === "revoir";
  await verifierCompte(compte, revue);
  if (!uuidPreparation.test(id) || !uuidPreparation.test(dossierId) || !["creer", "sauvegarder", "soumettre", "revoir"].includes(action)) throw new ErreurCandidature("saisie");
  const revisionTexte = form.get("revision") || "0";
  if (!/^\d{1,15}$/.test(revisionTexte)) throw new ErreurCandidature("saisie");
  const revision = Number(revisionTexte);
  const contenu: Dossier = { ...dossierVide };
  if (action === "sauvegarder" || action === "soumettre") {
    for (const cle of Object.keys(champsDossier) as (keyof typeof champsDossier)[]) contenu[cle] = texte(form.get(cle) || "");
    if (contenu.titre.length > 160) throw new ErreurCandidature("saisie");
    contenu.budget = (form.get("budget") || "").trim().replace(",", ".");
    if (contenu.budget && (!/^\d{1,7}(\.\d{1,2})?$/.test(contenu.budget) || Number(contenu.budget) < 0.01 || Number(contenu.budget) > 1000000)) throw new ErreurCandidature("saisie");
    if (contenu.budget) {
      const [euros, decimales = ""] = contenu.budget.split(".");
      const centimes = Number(euros) * 100 + Number(decimales.padEnd(2, "0"));
      contenu.budget = String(Math.floor(centimes / 100)) + "." + String(centimes % 100).padStart(2, "0");
    }
    if (action === "soumettre" && (Object.values(contenu).some(v => !v) || form.get("fictif") !== "oui")) throw new ErreurCandidature("incomplet");
  }
  const note = revue ? texte(form.get("note") || "") : "";
  const checklist: Record<string, string> = {};
  const statut = revue ? form.get("statut") || "" : action === "soumettre" ? "soumis" : "brouillon";
  if (revue) {
    for (const cle of Object.keys(criteres)) {
      const etat = form.get("critere_" + cle) || "";
      if (!etatsCritere.includes(etat as typeof etatsCritere[number])) throw new ErreurCandidature("revue");
      checklist[cle] = etat;
    }
    if (!note || !["a_completer", "a_approfondir", "non_retenu"].includes(statut) || form.get("confirme") !== "oui") throw new ErreurCandidature("revue");
  }
  const payload = JSON.stringify({ action, dossierId, revision, contenu, note, checklist, statut });
  const db = getDb();
  async function identique() {
    const commande = await db.select().from(commandesCandidatures).where(eq(commandesCandidatures.id, id)).get();
    if (!commande) return false;
    if (commande.utilisateurId !== compte.id || commande.payload !== payload || commande.candidatureId !== dossierId) throw new ErreurCandidature("conflit", 409);
    return true;
  }
  if (await identique()) return dossierId;
  const date = new Date().toISOString();
  const mutation = action === "creer"
    ? sql`INSERT INTO candidatures (id, utilisateur_id, contenu, statut, revision, date, derniere_commande)
      SELECT ${dossierId}, ${compte.id}, ${JSON.stringify(contenu)}, 'brouillon', 0, ${date}, ${id}
      WHERE NOT EXISTS (SELECT 1 FROM commandes_candidatures WHERE id = ${id}) ON CONFLICT(id) DO NOTHING`
    : revue
      ? sql`UPDATE candidatures SET statut = ${statut}, revision = revision + 1, date = ${date}, derniere_commande = ${id}
        WHERE id = ${dossierId} AND revision = ${revision} AND statut = 'soumis'
        AND NOT EXISTS (SELECT 1 FROM commandes_candidatures WHERE id = ${id})`
      : sql`UPDATE candidatures SET contenu = ${JSON.stringify(contenu)}, statut = CASE WHEN ${action} = 'soumettre' THEN 'soumis' ELSE statut END,
        revision = revision + 1, date = ${date}, derniere_commande = ${id}
        WHERE id = ${dossierId} AND utilisateur_id = ${compte.id} AND revision = ${revision} AND statut IN ('brouillon','a_completer')
        AND NOT EXISTS (SELECT 1 FROM commandes_candidatures WHERE id = ${id})`;
  const journal = sql`INSERT INTO commandes_candidatures (id, candidature_id, utilisateur_id, payload, instantane, date)
    SELECT ${id}, id, ${compte.id}, ${payload}, json_object('contenu', json(contenu), 'statut', statut, 'revision', revision, 'action', ${action}, 'note', ${note}, 'checklist', json(${JSON.stringify(checklist)})), ${date}
    FROM candidatures WHERE id = ${dossierId} AND derniere_commande = ${id} ON CONFLICT(id) DO NOTHING`;
  const requetes = [mutation, journal].map(requete => {
    const { sql: requeteSql, params } = db.run(requete).getQuery();
    return db.$client.prepare(requeteSql).bind(...params);
  });
  await db.$client.batch(requetes);
  if (!await identique()) throw new ErreurCandidature("conflit", 409);
  return dossierId;
}
