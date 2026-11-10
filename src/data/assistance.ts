import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { commandesAssistance, demandesAssistance } from "@/db/schema";
import { categoriesAssistance } from "./assistance-formulaire";
import { uuidPreparation } from "./formulaire-participation";
import { verifierCompte, type Compte } from "./registre";

export class ErreurAssistance extends Error {
  constructor(public code: "saisie" | "conflit", public status = 400) {
    super(code);
  }
}

export async function listerAssistance(compte: Compte, administration = false) {
  await verifierCompte(compte, administration);
  return getDb().select().from(demandesAssistance)
    .where(administration ? undefined : eq(demandesAssistance.utilisateurId, compte.id))
    .orderBy(desc(demandesAssistance.date), demandesAssistance.id);
}

type Saisie = {
  id: string;
  action: string;
  demandeId: string;
  categorie: string;
  description: string;
  reponse: string;
};

export async function commanderAssistance(compte: Compte, saisie: Saisie) {
  const fermer = saisie.action === "cloturer";
  await verifierCompte(compte, fermer);
  if (!["creer", "cloturer"].includes(saisie.action) || !uuidPreparation.test(saisie.id)) {
    throw new ErreurAssistance("saisie");
  }
  if (fermer ? !uuidPreparation.test(saisie.demandeId) : !Object.hasOwn(categoriesAssistance, saisie.categorie)) {
    throw new ErreurAssistance("saisie");
  }
  // Un formulaire natif transmet CRLF, le client JavaScript transmet LF.
  const contenu = (fermer ? saisie.reponse : saisie.description).replace(/\r\n?/g, "\n").trim();
  if (!contenu || contenu.length > 1200 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(contenu)) {
    throw new ErreurAssistance("saisie");
  }

  const demandeId = fermer ? saisie.demandeId : saisie.id;
  const payload = JSON.stringify(fermer
    ? { action: saisie.action, demandeId, contenu }
    : { action: saisie.action, categorie: saisie.categorie, contenu });
  const db = getDb();

  async function commandeIdentique() {
    const commande = await db.select().from(commandesAssistance)
      .where(eq(commandesAssistance.id, saisie.id)).get();
    if (!commande) return false;
    if (commande.utilisateurId !== compte.id || commande.payload !== payload || commande.demandeId !== demandeId) {
      throw new ErreurAssistance("conflit", 409);
    }
    return true;
  }

  if (await commandeIdentique()) return demandeId;
  const date = new Date().toISOString();
  const mutation = fermer
    ? sql`UPDATE demandes_assistance
          SET statut = 'cloturee', reponse = ${contenu}, date_cloture = ${date}, derniere_commande = ${saisie.id}
          WHERE id = ${demandeId} AND statut = 'ouverte'
            AND NOT EXISTS (SELECT 1 FROM commandes_assistance WHERE id = ${saisie.id})`
    : sql`INSERT INTO demandes_assistance (id, utilisateur_id, categorie, description, statut, date, derniere_commande)
          SELECT ${demandeId}, ${compte.id}, ${saisie.categorie}, ${contenu}, 'ouverte', ${date}, ${saisie.id}
          WHERE NOT EXISTS (SELECT 1 FROM commandes_assistance WHERE id = ${saisie.id})
          ON CONFLICT(id) DO NOTHING`;
  // Seule la mutation acceptée peut écrire le journal dans ce même lot atomique.
  const journal = sql`INSERT INTO commandes_assistance (id, demande_id, utilisateur_id, payload)
                      SELECT ${saisie.id}, id, ${compte.id}, ${payload} FROM demandes_assistance
                      WHERE id = ${demandeId} AND derniere_commande = ${saisie.id}
                      ON CONFLICT(id) DO NOTHING`;
  const requetes = [mutation, journal].map(requete => {
    const { sql: texte, params } = db.run(requete).getQuery();
    return db.$client.prepare(texte).bind(...params);
  });
  await db.$client.batch(requetes);
  if (!await commandeIdentique()) throw new ErreurAssistance("conflit", 409);
  return demandeId;
}
