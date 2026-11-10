CREATE TABLE `commandes_assistance` (
	`id` text PRIMARY KEY NOT NULL,
	`demande_id` text NOT NULL,
	`utilisateur_id` text NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`demande_id`) REFERENCES `demandes_assistance`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `demandes_assistance` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text NOT NULL,
	`categorie` text NOT NULL,
	`description` text NOT NULL,
	`statut` text DEFAULT 'ouverte' NOT NULL,
	`reponse` text,
	`date` text NOT NULL,
	`date_cloture` text,
	`derniere_commande` text NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "assistance_categorie" CHECK("demandes_assistance"."categorie" IN ('compte','participation','suivi','autre')),
	CONSTRAINT "assistance_description" CHECK(length("demandes_assistance"."description") BETWEEN 1 AND 1200),
	CONSTRAINT "assistance_etat" CHECK(("demandes_assistance"."statut" = 'ouverte' AND "demandes_assistance"."reponse" IS NULL AND "demandes_assistance"."date_cloture" IS NULL) OR ("demandes_assistance"."statut" = 'cloturee' AND "demandes_assistance"."reponse" IS NOT NULL AND length("demandes_assistance"."reponse") BETWEEN 1 AND 1200 AND "demandes_assistance"."date_cloture" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `assistance_titulaire_date` ON `demandes_assistance` (`utilisateur_id`,`date`);