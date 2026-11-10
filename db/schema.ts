import type { ReglesDemo } from "../src/economie/demo";
import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

type Rubrique = { titre: string; detail: string };

export const projets = sqliteTable("projets", {
  slug: text("slug").primaryKey(),
  reference: text("reference").notNull().unique(),
  nom: text("nom").notNull(),
  materiel: text("materiel").notNull(),
  quantite: integer("quantite").notNull(),
  prixUnitaireCentimes: integer("prix_unitaire_centimes").notNull(),
  devise: text("devise").notNull(),
  fictif: integer("fictif", { mode: "boolean" }).notNull(),
  couts: text("couts", { mode: "json" }).$type<string[]>().notNull(),
  risques: text("risques", { mode: "json" }).$type<Rubrique[]>().notNull(),
  etapes: text("etapes", { mode: "json" }).$type<Rubrique[]>().notNull(),
}, (t) => [
  check("quantite_positive", sql`${t.quantite} > 0`),
  check("prix_positif", sql`${t.prixUnitaireCentimes} > 0`),
  check("demo_uniquement", sql`${t.fictif} = 1`),
]);

export type Projet = typeof projets.$inferSelect;

export const utilisateurs = sqliteTable("utilisateurs", {
  id: text("id").primaryKey(),
  identiteSites: text("identite_sites").unique(),
  identiteFictive: text("identite_fictive").unique(),
  libelle: text("libelle").notNull(),
  role: text("role", { enum: ["investisseur", "administrateur"] }).notNull(),
  liaisonAdmin: integer("liaison_admin").unique(),
}, (t) => [
  check("identite_disjointe", sql`(${t.identiteSites} IS NOT NULL AND ${t.identiteFictive} IS NULL) OR (${t.identiteSites} IS NULL AND ${t.identiteFictive} IS NOT NULL)`),
  check("role_valide", sql`${t.role} IN ('investisseur','administrateur')`),
  check("admin_reel_unique", sql`(${t.role} = 'administrateur' AND ${t.identiteSites} IS NOT NULL AND ${t.liaisonAdmin} IS NOT NULL AND ${t.liaisonAdmin} = 1) OR (${t.role} = 'investisseur' AND ${t.liaisonAdmin} IS NULL)`),
]);

export const operateurs = sqliteTable("operateurs", {
  id: text("id").primaryKey(),
  projetSlug: text("projet_slug").notNull().unique().references(() => projets.slug),
  libelle: text("libelle").notNull(),
  fictif: integer("fictif").notNull().default(1),
}, (t) => [check("operateur_fictif", sql`${t.fictif} = 1`)]);

export const versionsRegles = sqliteTable("versions_regles", {
  id: text("id").primaryKey(),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
  contenu: text("contenu", { mode: "json" }).$type<ReglesDemo>().notNull(),
}, (t) => [uniqueIndex("version_projet_unique").on(t.id, t.projetSlug)]);

export const preparationsParticipation = sqliteTable("preparations_participation", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
  reglesId: text("regles_id").notNull(),
  montantCentimes: integer("montant_centimes").notNull(),
  date: text("date").notNull(),
}, (t) => [
  foreignKey({ columns: [t.reglesId, t.projetSlug], foreignColumns: [versionsRegles.id, versionsRegles.projetSlug] }),
  check("preparation_demo_j5", sql`${t.projetSlug} = 'atelier-lavage'
    AND typeof(${t.montantCentimes}) = 'integer' AND ${t.montantCentimes} BETWEEN 1 AND 1920000`),
]);

export const participations = sqliteTable("participations", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
  reglesId: text("regles_id").notNull(),
  libelle: text("libelle").notNull(),
  montantCentimes: integer("montant_centimes").notNull(),
  devise: text("devise").notNull().default("EUR"),
  fictif: integer("fictif").notNull().default(1),
}, (t) => [
  uniqueIndex("participation_proprietaire_unique").on(t.id, t.utilisateurId),
  foreignKey({ columns: [t.reglesId, t.projetSlug], foreignColumns: [versionsRegles.id, versionsRegles.projetSlug] }),
  check("participation_demo", sql`
    ${t.fictif} = 1 AND ${t.devise} = 'EUR' AND typeof(${t.montantCentimes}) = 'integer'
    AND ${t.montantCentimes} BETWEEN 1 AND 9007199254740991
  `),
]);

export const situationsGestion = sqliteTable("situations_gestion", {
  id: text("id").primaryKey(),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
  scenarioId: text("scenario_id").notNull(),
  titre: text("titre").notNull(),
  reglesId: text("regles_id").notNull(),
  regles: text("regles", { mode: "json" }).$type<ReglesDemo>().notNull(),
  initial: text("initial", { mode: "json" }).$type<import("../src/economie/demo").ScenarioDemo>().notNull(),
  loyersDusCentimes: integer("loyers_dus_centimes").notNull(),
  loyersEncaissesCentimes: integer("loyers_encaisses_centimes").notNull(),
  chargesExploitationCentimes: integer("charges_exploitation_centimes").notNull(),
  valeurMachinesCentimes: integer("valeur_machines_centimes").notNull(),
  revision: integer("revision").notNull().default(0),
  statut: text("statut", { enum: ["ouverte", "distribuee"] }).notNull().default("ouverte"),
  date: text("date").notNull(),
  derniereCommande: text("derniere_commande").notNull(),
}, (t) => [
  foreignKey({ columns: [t.reglesId, t.projetSlug], foreignColumns: [versionsRegles.id, versionsRegles.projetSlug] }),
  check("situation_entiers_surs", sql`typeof(${t.revision}) = 'integer' AND ${t.revision} BETWEEN 0 AND 9007199254740991
    AND typeof(${t.loyersDusCentimes}) = 'integer' AND ${t.loyersDusCentimes} BETWEEN 0 AND 9007199254740991
    AND typeof(${t.loyersEncaissesCentimes}) = 'integer' AND ${t.loyersEncaissesCentimes} BETWEEN 0 AND 9007199254740991
    AND typeof(${t.chargesExploitationCentimes}) = 'integer' AND ${t.chargesExploitationCentimes} BETWEEN 0 AND 9007199254740991
    AND typeof(${t.valeurMachinesCentimes}) = 'integer' AND ${t.valeurMachinesCentimes} BETWEEN 0 AND 9007199254740991`),
  check("situation_etat", sql`${t.revision} >= 0 AND ${t.statut} IN ('ouverte','distribuee') AND ${t.loyersDusCentimes} >= ${t.loyersEncaissesCentimes} AND ${t.loyersEncaissesCentimes} >= 0 AND ${t.chargesExploitationCentimes} >= 0 AND ${t.valeurMachinesCentimes} >= 0`),
]);

export const commandesGestion = sqliteTable("commandes_gestion", {
  id: text("id").primaryKey(),
  situationId: text("situation_id").notNull().references(() => situationsGestion.id),
  payload: text("payload").notNull(),
});

export const distributionsGestion = sqliteTable("distributions_gestion", {
  id: text("id").primaryKey(),
  situationId: text("situation_id").notNull().unique().references(() => situationsGestion.id),
  totalCentimes: integer("total_centimes").notNull(),
  investisseursCentimes: integer("investisseurs_centimes").notNull(),
  operateurCentimes: integer("operateur_centimes").notNull(),
  bilanAvant: text("bilan_avant", { mode: "json" }).$type<ReturnType<typeof import("../src/economie/demo").calculerScenario>>().notNull(),
  date: text("date").notNull(),
}, (t) => [
  check("distribution_entiers_surs", sql`typeof(${t.totalCentimes}) = 'integer' AND ${t.totalCentimes} BETWEEN 1 AND 9007199254740991
    AND typeof(${t.investisseursCentimes}) = 'integer' AND ${t.investisseursCentimes} BETWEEN 0 AND 9007199254740991
    AND typeof(${t.operateurCentimes}) = 'integer' AND ${t.operateurCentimes} BETWEEN 0 AND 9007199254740991`),
  check("distribution_positive", sql`${t.totalCentimes} > 0 AND ${t.investisseursCentimes} >= 0 AND ${t.operateurCentimes} >= 0 AND ${t.totalCentimes} = ${t.investisseursCentimes} + ${t.operateurCentimes}`)]);

export const operations = sqliteTable("operations", {
  situationId: text("situation_id").references(() => situationsGestion.id),
  type: text("type", { enum: ["exemple", "recette", "encaissement", "depense", "valorisation", "incident"] }).notNull().default("exemple"),
  pieceTexte: text("piece_texte"),
  date: text("date"),
  reglesId: text("regles_id").notNull(),
  id: text("id").primaryKey(),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
  libelle: text("libelle").notNull(),
  montantCentimes: integer("montant_centimes").notNull(),
  devise: text("devise").notNull().default("EUR"),
  fictif: integer("fictif").notNull().default(1),
}, (t) => [
  foreignKey({ columns: [t.reglesId, t.projetSlug], foreignColumns: [versionsRegles.id, versionsRegles.projetSlug] }),
  check("operation_demo", sql`
    ${t.fictif} = 1 AND ${t.devise} = 'EUR' AND typeof(${t.montantCentimes}) = 'integer'
    AND ${t.montantCentimes} BETWEEN 0 AND 9007199254740991
  `),
]);

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  participationId: text("participation_id").notNull().references(() => participations.id),
  titre: text("titre").notNull(),
  contenu: text("contenu").notNull(),
}, (t) => [
  uniqueIndex("document_proprietaire_unique").on(t.id, t.utilisateurId),
  foreignKey({ columns: [t.participationId, t.utilisateurId], foreignColumns: [participations.id, participations.utilisateurId] }),
]);

export const suivis = sqliteTable("suivis", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
}, (t) => [uniqueIndex("suivi_personnel_unique").on(t.utilisateurId, t.projetSlug)]);

export const historique = sqliteTable("historique", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").references(() => utilisateurs.id),
  projetSlug: text("projet_slug").notNull().references(() => projets.slug),
  participationId: text("participation_id").references(() => participations.id),
  operationId: text("operation_id").references(() => operations.id),
  documentId: text("document_id").references(() => documents.id),
  libelle: text("libelle").notNull(),
  date: text("date").notNull(),
}, (t) => [
  check("historique_proprietaire", sql`(${t.participationId} IS NULL AND ${t.documentId} IS NULL) OR ${t.utilisateurId} IS NOT NULL`),
  foreignKey({ columns: [t.documentId, t.utilisateurId], foreignColumns: [documents.id, documents.utilisateurId] }),
  foreignKey({ columns: [t.participationId, t.utilisateurId], foreignColumns: [participations.id, participations.utilisateurId] }),
]);

export const demandesAssistance = sqliteTable("demandes_assistance", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  categorie: text("categorie").notNull(),
  description: text("description").notNull(),
  statut: text("statut").notNull().default("ouverte"),
  reponse: text("reponse"),
  date: text("date").notNull(),
  dateCloture: text("date_cloture"),
  derniereCommande: text("derniere_commande").notNull(),
}, (t) => [
  index("assistance_titulaire_date").on(t.utilisateurId, t.date),
  check("assistance_categorie", sql`${t.categorie} IN ('compte','participation','suivi','autre')`),
  check("assistance_description", sql`length(${t.description}) BETWEEN 1 AND 1200`),
  check("assistance_etat", sql`(${t.statut} = 'ouverte' AND ${t.reponse} IS NULL AND ${t.dateCloture} IS NULL) OR (${t.statut} = 'cloturee' AND ${t.reponse} IS NOT NULL AND length(${t.reponse}) BETWEEN 1 AND 1200 AND ${t.dateCloture} IS NOT NULL)`),
]);
export const commandesAssistance = sqliteTable("commandes_assistance", {
  id: text("id").primaryKey(),
  demandeId: text("demande_id").notNull().references(() => demandesAssistance.id),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  payload: text("payload").notNull(),
});

export const candidatures = sqliteTable("candidatures", {
  id: text("id").primaryKey(),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  contenu: text("contenu", { mode: "json" }).$type<import("../src/data/candidatures-formulaire").Dossier>().notNull(),
  statut: text("statut").notNull().default("brouillon"),
  revision: integer("revision").notNull().default(0),
  date: text("date").notNull(),
  derniereCommande: text("derniere_commande").notNull(),
}, (t) => [
  index("candidatures_titulaire_date").on(t.utilisateurId, t.date),
  check("candidature_etat", sql`${t.statut} IN ('brouillon','soumis','a_completer','a_approfondir','non_retenu')`),
  check("candidature_revision", sql`typeof(${t.revision}) = 'integer' AND ${t.revision} BETWEEN 0 AND 9007199254740991`),
]);

export const commandesCandidatures = sqliteTable("commandes_candidatures", {
  id: text("id").primaryKey(),
  candidatureId: text("candidature_id").notNull().references(() => candidatures.id),
  utilisateurId: text("utilisateur_id").notNull().references(() => utilisateurs.id),
  payload: text("payload").notNull(),
  instantane: text("instantane").notNull(),
  date: text("date").notNull(),
});
