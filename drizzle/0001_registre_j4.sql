CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text NOT NULL,
	`participation_id` text NOT NULL,
	`titre` text NOT NULL,
	`contenu` text NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participation_id`) REFERENCES `participations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participation_id`,`utilisateur_id`) REFERENCES `participations`(`id`,`utilisateur_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_proprietaire_unique` ON `documents` (`id`,`utilisateur_id`);--> statement-breakpoint
CREATE TABLE `historique` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text,
	`projet_slug` text NOT NULL,
	`participation_id` text,
	`operation_id` text,
	`document_id` text,
	`libelle` text NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participation_id`) REFERENCES `participations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`operation_id`) REFERENCES `operations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_id`,`utilisateur_id`) REFERENCES `documents`(`id`,`utilisateur_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participation_id`,`utilisateur_id`) REFERENCES `participations`(`id`,`utilisateur_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "historique_proprietaire" CHECK(("historique"."participation_id" IS NULL AND "historique"."document_id" IS NULL) OR "historique"."utilisateur_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE `operateurs` (
	`id` text PRIMARY KEY NOT NULL,
	`projet_slug` text NOT NULL,
	`libelle` text NOT NULL,
	`fictif` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "operateur_fictif" CHECK("operateurs"."fictif" = 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operateurs_projet_slug_unique` ON `operateurs` (`projet_slug`);--> statement-breakpoint
CREATE TABLE `operations` (
	`regles_id` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`projet_slug` text NOT NULL,
	`libelle` text NOT NULL,
	`montant_centimes` integer NOT NULL,
	`devise` text DEFAULT 'EUR' NOT NULL,
	`fictif` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`regles_id`,`projet_slug`) REFERENCES `versions_regles`(`id`,`projet_slug`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "operation_demo" CHECK(
    "operations"."fictif" = 1 AND "operations"."devise" = 'EUR' AND typeof("operations"."montant_centimes") = 'integer'
    AND "operations"."montant_centimes" BETWEEN 0 AND 9007199254740991
  )
);
--> statement-breakpoint
CREATE TABLE `participations` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text NOT NULL,
	`projet_slug` text NOT NULL,
	`regles_id` text NOT NULL,
	`libelle` text NOT NULL,
	`montant_centimes` integer NOT NULL,
	`devise` text DEFAULT 'EUR' NOT NULL,
	`fictif` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`regles_id`,`projet_slug`) REFERENCES `versions_regles`(`id`,`projet_slug`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "participation_demo" CHECK(
    "participations"."fictif" = 1 AND "participations"."devise" = 'EUR' AND typeof("participations"."montant_centimes") = 'integer'
    AND "participations"."montant_centimes" BETWEEN 1 AND 9007199254740991
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participation_proprietaire_unique` ON `participations` (`id`,`utilisateur_id`);--> statement-breakpoint
CREATE TABLE `suivis` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text NOT NULL,
	`projet_slug` text NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suivi_personnel_unique` ON `suivis` (`utilisateur_id`,`projet_slug`);--> statement-breakpoint
CREATE TABLE `utilisateurs` (
	`id` text PRIMARY KEY NOT NULL,
	`identite_sites` text,
	`identite_fictive` text,
	`libelle` text NOT NULL,
	`role` text NOT NULL,
	`liaison_admin` integer,
	CONSTRAINT "identite_disjointe" CHECK(("utilisateurs"."identite_sites" IS NOT NULL AND "utilisateurs"."identite_fictive" IS NULL) OR ("utilisateurs"."identite_sites" IS NULL AND "utilisateurs"."identite_fictive" IS NOT NULL)),
	CONSTRAINT "role_valide" CHECK("utilisateurs"."role" IN ('investisseur','administrateur')),
	CONSTRAINT "admin_reel_unique" CHECK(("utilisateurs"."role" = 'administrateur' AND "utilisateurs"."identite_sites" IS NOT NULL AND "utilisateurs"."liaison_admin" IS NOT NULL AND "utilisateurs"."liaison_admin" = 1) OR ("utilisateurs"."role" = 'investisseur' AND "utilisateurs"."liaison_admin" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `utilisateurs_identite_sites_unique` ON `utilisateurs` (`identite_sites`);--> statement-breakpoint
CREATE UNIQUE INDEX `utilisateurs_identite_fictive_unique` ON `utilisateurs` (`identite_fictive`);--> statement-breakpoint
CREATE UNIQUE INDEX `utilisateurs_liaison_admin_unique` ON `utilisateurs` (`liaison_admin`);--> statement-breakpoint
CREATE TABLE `versions_regles` (
	`id` text PRIMARY KEY NOT NULL,
	`projet_slug` text NOT NULL,
	`contenu` text NOT NULL,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `version_projet_unique` ON `versions_regles` (`id`,`projet_slug`);