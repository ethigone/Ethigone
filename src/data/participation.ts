import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, historique, participations, preparationsParticipation, projets, versionsRegles } from "@/db/schema";
import { reglesDemo, type ReglesDemo } from "@/src/economie/demo";
import { verifierCompte, type Compte } from "./registre";
import { uuidPreparation } from "./formulaire-participation";

export class ErreurParticipation extends Error {
  constructor(public code: "montant" | "conditions" | "version" | "conflit" | "introuvable", message: string, public status = 400) {
    super(message);
    this.name = "ErreurParticipation";
  }
}

export type PreparationParticipation = {
  id: string;
  montantCentimes: number;
  reglesId: string;
  date: string;
  confirme: boolean;
  projetNom: string;
  regles: ReglesDemo;
  recu?: { titre: string; contenu: string };
  dateConfirmation?: string;
};

const projetSlug = "atelier-lavage";

function verifierId(id: string) {
  if (typeof id !== "string" || !uuidPreparation.test(id)) {
    throw new ErreurParticipation("introuvable", "Préparation de démonstration introuvable.", 404);
  }
}

function convertirMontant(montant: string) {
  if (typeof montant !== "string" || montant.length > 12 || !/^[0-9]+(?:[.,][0-9]{1,2})?$/.test(montant)) {
    throw new ErreurParticipation("montant", "Saisissez un montant EUR exact avec deux décimales au maximum.");
  }
  const [euros, decimales = ""] = montant.replace(",", ".").split(".");
  const centimes = Number(euros) * 100 + Number(decimales.padEnd(2, "0"));
  if (!Number.isSafeInteger(centimes) || centimes < 1 || centimes > 1_920_000) {
    throw new ErreurParticipation("montant", "La plage technique de démonstration va de 0,01 € à 19 200 €.");
  }
  return centimes;
}

export async function preparerParticipation(compte: Compte, saisie: { id: string; montant: string; reglesId: string; accepte: boolean }): Promise<PreparationParticipation> {
  const reel = await verifierCompte(compte);
  verifierId(saisie.id);
  const montantCentimes = convertirMontant(saisie.montant);
  if (saisie.accepte !== true) throw new ErreurParticipation("conditions", "La reconnaissance du caractère de démonstration est requise.");
  if (saisie.reglesId !== reglesDemo.identifiant) throw new ErreurParticipation("version", "La version actuelle des règles est requise.");
  await getDb().insert(preparationsParticipation).values({
    id: saisie.id, utilisateurId: reel.id, projetSlug, reglesId: saisie.reglesId,
    montantCentimes, date: new Date().toISOString(),
  }).onConflictDoNothing({ target: preparationsParticipation.id });
  const preparation = await lirePreparation(reel, saisie.id);
  if (!preparation || preparation.montantCentimes !== montantCentimes || preparation.reglesId !== saisie.reglesId) {
    throw new ErreurParticipation("conflit", "Cette clé de préparation ne peut pas être utilisée.", 409);
  }
  return preparation;
}

export async function lirePreparation(compte: Compte, id: string): Promise<PreparationParticipation | null> {
  const reel = await verifierCompte(compte);
  verifierId(id);
  const db = getDb();
  const preparation = await db.select({
    id: preparationsParticipation.id, montantCentimes: preparationsParticipation.montantCentimes,
    reglesId: preparationsParticipation.reglesId, date: preparationsParticipation.date,
    projetNom: projets.nom, regles: versionsRegles.contenu,
  }).from(preparationsParticipation)
    .innerJoin(projets, eq(projets.slug, preparationsParticipation.projetSlug))
    .innerJoin(versionsRegles, and(eq(versionsRegles.id, preparationsParticipation.reglesId), eq(versionsRegles.projetSlug, preparationsParticipation.projetSlug)))
    .where(and(eq(preparationsParticipation.id, id), eq(preparationsParticipation.utilisateurId, reel.id))).get();
  if (!preparation) return null;
  const confirmation = await verifierConfirmation(reel.id, preparation);
  return { ...preparation, ...confirmation };
}

function objetsConfirmation(utilisateurId: string, preparation: Pick<PreparationParticipation, "id" | "montantCentimes" | "reglesId" | "date">) {
  const { id, montantCentimes, reglesId, date } = preparation;
  const essai = id.slice(0, 8);
  const titre = `Reçu de participation de démonstration • ${essai}`;
  const montant = `${Math.floor(montantCentimes / 100)},${String(montantCentimes % 100).padStart(2, "0")} EUR`;
  const participation = {
    id: `participation:${id}`, utilisateurId, projetSlug, reglesId,
    libelle: `Participation de démonstration • ${essai}`, montantCentimes, devise: "EUR", fictif: 1,
  };
  const document = {
    id: `recu:${id}`, utilisateurId, participationId: participation.id, titre,
    contenu: `${titre}\nRéférence ${id}\nProjet ${projetSlug}\nMontant fictif de ${montant}\nVersion des règles ${reglesId}\nPréparé le ${date}\nAucun fonds engagé. Aucun paiement ni transaction. Aucune réservation de parts. Essai indépendant de démonstration.`,
  };
  const entree = {
    id: `participation-confirmee:${id}`, utilisateurId, projetSlug, participationId: participation.id,
    documentId: document.id, operationId: null,
    libelle: "Participation de démonstration enregistrée — aucun paiement ni transaction",
  };
  return { participation, document, entree };
}

async function verifierConfirmation(utilisateurId: string, preparation: Pick<PreparationParticipation, "id" | "montantCentimes" | "reglesId" | "date">) {
  const db = getDb();
  const attendu = objetsConfirmation(utilisateurId, preparation);
  const [participation, document, entree] = await Promise.all([
    db.select().from(participations).where(eq(participations.id, attendu.participation.id)).get(),
    db.select().from(documents).where(eq(documents.id, attendu.document.id)).get(),
    db.select().from(historique).where(eq(historique.id, attendu.entree.id)).get(),
  ]);
  const identique = (objet: object, modele: object) => Object.entries(modele).every(([cle, valeur]) => objet[cle as keyof typeof objet] === valeur);
  const dateValide = entree && Number.isFinite(Date.parse(entree.date)) && new Date(entree.date).toISOString() === entree.date;
  if ((participation && !identique(participation, attendu.participation))
    || (document && !identique(document, attendu.document))
    || (entree && (!identique(entree, attendu.entree) || !dateValide))) {
    throw new ErreurParticipation("conflit", "Cette participation de démonstration ne peut pas être enregistrée.", 409);
  }
  const confirme = Boolean(participation && document && entree);
  return {
    confirme,
    ...(confirme && document && entree ? { recu: { titre: document.titre, contenu: document.contenu }, dateConfirmation: entree.date } : {}),
  };
}

/** Une modification du montant exige une nouvelle préparation. Seule la préparation sélectionnée est confirmée. */
export async function confirmerParticipation(compte: Compte, id: string): Promise<PreparationParticipation> {
  const reel = await verifierCompte(compte);
  const preparation = await lirePreparation(reel, id);
  if (!preparation) throw new ErreurParticipation("introuvable", "Préparation de démonstration introuvable.", 404);
  if (preparation.confirme) return preparation;
  const db = getDb();
  const attendu = objetsConfirmation(reel.id, preparation);
  // Les écritures autorisées sont immuables. Le contrôle préalable refuse les conflits existants.
  // Le batch D1 est atomique et les reprises concurrentes utilisent les mêmes objets.
  // Une modification externe concurrente de la base reste hors de cette garantie applicative.
  await db.batch([
    db.insert(participations).values(attendu.participation).onConflictDoNothing({ target: participations.id }),
    db.insert(documents).values(attendu.document).onConflictDoNothing({ target: documents.id }),
    db.insert(historique).values({ ...attendu.entree, date: new Date().toISOString() }).onConflictDoNothing({ target: historique.id }),
  ]);
  const confirmation = await verifierConfirmation(reel.id, preparation);
  if (!confirmation.confirme) throw new ErreurParticipation("conflit", "Cette participation de démonstration ne peut pas être enregistrée.", 409);
  return { ...preparation, ...confirmation };
}
