import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, historique, operateurs, operations, participations, projets, suivis, utilisateurs, versionsRegles } from "@/db/schema";
import { reglesDemo } from "@/src/economie/demo";
import exemple from "./projet.json";

export type Compte = { id: string; role: "investisseur" | "administrateur" };

/** D1 batch est transactionnel. Toutes les clés de démonstration sont stables et les reprises ajoutent uniquement les absents. */
export async function initialiserRegistre() {
  const db = getDb();
  const termine = await db.select({ id: historique.id }).from(historique).where(eq(historique.id, "demo-historique-operation")).get();
  if (termine) return;
  const dateInitiale = new Date().toISOString();
  await db.batch([
    db.insert(projets).values(exemple).onConflictDoNothing(),
    db.insert(operateurs).values({ id: "demo-operateur", projetSlug: exemple.slug, libelle: "Opérateur synthétique — démonstration" }).onConflictDoNothing(),
    db.insert(versionsRegles).values({ id: reglesDemo.identifiant, projetSlug: exemple.slug, contenu: reglesDemo }).onConflictDoNothing(),
    db.insert(utilisateurs).values([
      { id: "demo-investisseur-a", identiteFictive: "synthetique-a", 
        libelle: "Investisseur synthétique A", role: "investisseur"
      },
      { id: "demo-investisseur-b", identiteFictive: "synthetique-b", 
        libelle: "Investisseur synthétique B", role: "investisseur"
      },
    ]).onConflictDoNothing(),
    db.insert(participations).values([
      { id: "demo-participation-a", utilisateurId: "demo-investisseur-a", 
        projetSlug: exemple.slug, reglesId: reglesDemo.identifiant, 
        libelle: "Exemple fictif A", montantCentimes: 100_000
      },
      { id: "demo-participation-b", utilisateurId: "demo-investisseur-b", 
        projetSlug: exemple.slug, reglesId: reglesDemo.identifiant, 
        libelle: "Exemple fictif B", montantCentimes: 200_000
      },
    ]).onConflictDoNothing(),
    db.insert(documents).values([
      { id: "demo-document-a", utilisateurId: "demo-investisseur-a", participationId: "demo-participation-a", 
        titre: "Note privée fictive A", 
        contenu: "Document pédagogique privé de l’investisseur synthétique A. Participation illustrative de 1 000 EUR. Aucun versement autorisé."
      },
      { id: "demo-document-b", utilisateurId: "demo-investisseur-b", participationId: "demo-participation-b", 
        titre: "Note privée fictive B", 
        contenu: "Document pédagogique privé de l’investisseur synthétique B. Participation illustrative de 2 000 EUR. Aucun versement autorisé."
      },
    ]).onConflictDoNothing(),
    db.insert(operations).values({ id: "demo-operation", reglesId: reglesDemo.identifiant, projetSlug: exemple.slug, libelle: "Exemple administratif fictif — entretien", montantCentimes: 10_000 }).onConflictDoNothing(),
    db.insert(historique).values([
      { id: "demo-historique-a", utilisateurId: "demo-investisseur-a", 
        projetSlug: exemple.slug, participationId: "demo-participation-a", documentId: "demo-document-a", 
        libelle: "Création de l’exemple privé fictif A", date: dateInitiale
      },
      { id: "demo-historique-b", utilisateurId: "demo-investisseur-b", 
        projetSlug: exemple.slug, participationId: "demo-participation-b", documentId: "demo-document-b", 
        libelle: "Création de l’exemple privé fictif B", date: dateInitiale
      },
      { id: "demo-historique-operation", 
        projetSlug: exemple.slug, operationId: "demo-operation", 
        libelle: "Enregistrement de l’entretien fictif", date: dateInitiale
      },
    ]).onConflictDoNothing(),
  ]);
}

export async function lireReglesDemo() {
  await initialiserRegistre();
  const archive = await getDb().select({ contenu: versionsRegles.contenu })
    .from(versionsRegles)
    .where(and(eq(versionsRegles.projetSlug, exemple.slug), eq(versionsRegles.id, reglesDemo.identifiant)))
    .get();
  if (!archive) throw new Error("Version des règles indisponible.");
  return archive.contenu;
}

export async function ouvrirCompte(identiteSites: string, autoriserAmorcageAdmin: boolean): Promise<Compte> {
  if (!identiteSites.trim()) throw new Error("Identité Sites requise.");
  await initialiserRegistre();
  const db = getDb();
  // L'appelant serveur fournit exclusivement une identité authentifiée et une preuve administrateur vérifiée.
  const chercher = () => db.select({ id: utilisateurs.id, role: utilisateurs.role })
    .from(utilisateurs).where(eq(utilisateurs.identiteSites, identiteSites)).get();
  const existant = await chercher();
  if (existant && (!autoriserAmorcageAdmin || existant.role === "administrateur")) return existant;
  if (!existant) {
    await db.insert(utilisateurs).values({
      id: crypto.randomUUID(), identiteSites,
      libelle: `Compte • ${crypto.randomUUID().slice(0, 8)}`, role: "investisseur",
    }).onConflictDoNothing({ target: utilisateurs.identiteSites });
  }
  if (autoriserAmorcageAdmin) {
    // Le verrou unique persistant protège également les amorçages concurrents.
    await db.run(sql`UPDATE OR IGNORE utilisateurs SET role = 'administrateur', liaison_admin = 1 WHERE identite_sites = ${identiteSites} AND identite_fictive IS NULL`);
  }
  const compte = await chercher();
  if (!compte) throw new Error("Compte indisponible.");
  return compte;
}

export async function verifierCompte(compte: Compte, admin = false) {
  const reel = await getDb().select({ id: utilisateurs.id, role: utilisateurs.role })
      .from(utilisateurs)
      .where(and(eq(utilisateurs.id, compte.id), isNotNull(utilisateurs.identiteSites))).get();
  if (!reel || (admin && reel.role !== "administrateur")) throw new Error("Accès refusé.");
  return reel;
}

const champsParticipation = {
  libelle: participations.libelle,
  regles: participations.reglesId,
  montantCentimes: participations.montantCentimes,
};
const champsDocument = { titre: documents.titre, contenu: documents.contenu };
const champsHistorique = { libelle: historique.libelle, date: historique.date };

export async function lireEspace(compte: Compte) {
  const reel = await verifierCompte(compte);
  const db = getDb();
  const [projet, mesParticipations, mesDocuments, monHistorique, suivi] = await Promise.all([
    db.select({ nom: projets.nom, reference: projets.reference })
      .from(projets)
      .where(eq(projets.slug, exemple.slug)).get(),
    db.select(champsParticipation).from(participations).where(eq(participations.utilisateurId, reel.id)),
    db.select(champsDocument)
      .from(documents)
      .innerJoin(participations, eq(documents.participationId, participations.id))
      .where(and(eq(documents.utilisateurId, reel.id), eq(participations.utilisateurId, reel.id))),
    db.select(champsHistorique)
      .from(historique)
      .where(eq(historique.utilisateurId, reel.id))
      .orderBy(desc(historique.date)),
    db.select({ id: suivis.id })
      .from(suivis)
      .where(and(eq(suivis.utilisateurId, reel.id), eq(suivis.projetSlug, exemple.slug))).get(),
  ]);
  if (!projet) throw new Error("Projet de démonstration introuvable.");
  return { projet, participations: mesParticipations, documents: mesDocuments, historique: monHistorique, suivi: !!suivi };
}

export async function suivreProjet(compte: Compte): Promise<void> {
  const reel = await verifierCompte(compte);
  const db = getDb();
  const id = `suivi:${reel.id}:${exemple.slug}`;
  await db.batch([
    db.insert(suivis).values({ id, utilisateurId: reel.id, projetSlug: exemple.slug }).onConflictDoNothing(),
    db.insert(historique).values({ id, utilisateurId: reel.id, projetSlug: exemple.slug, libelle: "Projet fictif ajouté au suivi personnel", date: new Date().toISOString() }).onConflictDoNothing(),
  ]);
}

export async function lireAdministration(compte: Compte) {
  await verifierCompte(compte, true);
  const db = getDb();
  const [comptes, toutesParticipations, toutesOperations, tousDocuments, toutHistorique, dossiers] = await Promise.all([
    db.select({ libelle: utilisateurs.libelle, role: utilisateurs.role, fictif: sql<boolean>`${utilisateurs.identiteFictive} IS NOT NULL`.mapWith(Boolean) })
      .from(utilisateurs),
    db.select({ titulaire: utilisateurs.libelle, ...champsParticipation })
      .from(participations)
      .innerJoin(utilisateurs, eq(participations.utilisateurId, utilisateurs.id)),
    db.select({ libelle: operations.libelle, regles: operations.reglesId, montantCentimes: operations.montantCentimes })
      .from(operations),
    db.select({ titulaire: utilisateurs.libelle, ...champsDocument })
      .from(documents)
      .innerJoin(utilisateurs, eq(documents.utilisateurId, utilisateurs.id)),
    db.select({ titulaire: sql<string>`coalesce(${utilisateurs.libelle}, 'Projet')`, ...champsHistorique })
      .from(historique)
      .leftJoin(utilisateurs, eq(historique.utilisateurId, utilisateurs.id))
      .orderBy(desc(historique.date)),
    db.select({ projet: projets.nom, operateur: operateurs.libelle, regles: versionsRegles.id })
      .from(operateurs)
      .innerJoin(projets, eq(projets.slug, operateurs.projetSlug))
      .innerJoin(versionsRegles, eq(operateurs.projetSlug, versionsRegles.projetSlug)),
  ]);
  return { comptes, participations: toutesParticipations, operations: toutesOperations, documents: tousDocuments, historique: toutHistorique, dossiers };
}
