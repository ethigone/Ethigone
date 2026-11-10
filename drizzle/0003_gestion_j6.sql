CREATE TABLE `commandes_gestion` (
	`id` text PRIMARY KEY NOT NULL,
	`situation_id` text NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`situation_id`) REFERENCES `situations_gestion`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `distributions_gestion` (
	`id` text PRIMARY KEY NOT NULL,
	`situation_id` text NOT NULL,
	`total_centimes` integer NOT NULL,
	`investisseurs_centimes` integer NOT NULL,
	`operateur_centimes` integer NOT NULL,
	`bilan_avant` text NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`situation_id`) REFERENCES `situations_gestion`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "distribution_entiers_surs" CHECK(typeof("distributions_gestion"."total_centimes") = 'integer' AND "distributions_gestion"."total_centimes" BETWEEN 1 AND 9007199254740991
    AND typeof("distributions_gestion"."investisseurs_centimes") = 'integer' AND "distributions_gestion"."investisseurs_centimes" BETWEEN 0 AND 9007199254740991
    AND typeof("distributions_gestion"."operateur_centimes") = 'integer' AND "distributions_gestion"."operateur_centimes" BETWEEN 0 AND 9007199254740991),
	CONSTRAINT "distribution_positive" CHECK("distributions_gestion"."total_centimes" > 0 AND "distributions_gestion"."investisseurs_centimes" >= 0 AND "distributions_gestion"."operateur_centimes" >= 0 AND "distributions_gestion"."total_centimes" = "distributions_gestion"."investisseurs_centimes" + "distributions_gestion"."operateur_centimes")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `distributions_gestion_situation_id_unique` ON `distributions_gestion` (`situation_id`);--> statement-breakpoint
CREATE TABLE `situations_gestion` (
	`id` text PRIMARY KEY NOT NULL,
	`projet_slug` text NOT NULL,
	`scenario_id` text NOT NULL,
	`titre` text NOT NULL,
	`regles_id` text NOT NULL,
	`regles` text NOT NULL,
	`initial` text NOT NULL,
	`loyers_dus_centimes` integer NOT NULL,
	`loyers_encaisses_centimes` integer NOT NULL,
	`charges_exploitation_centimes` integer NOT NULL,
	`valeur_machines_centimes` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`statut` text DEFAULT 'ouverte' NOT NULL,
	`date` text NOT NULL,
	`derniere_commande` text NOT NULL,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`regles_id`,`projet_slug`) REFERENCES `versions_regles`(`id`,`projet_slug`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "situation_entiers_surs" CHECK(typeof("situations_gestion"."revision") = 'integer' AND "situations_gestion"."revision" BETWEEN 0 AND 9007199254740991
    AND typeof("situations_gestion"."loyers_dus_centimes") = 'integer' AND "situations_gestion"."loyers_dus_centimes" BETWEEN 0 AND 9007199254740991
    AND typeof("situations_gestion"."loyers_encaisses_centimes") = 'integer' AND "situations_gestion"."loyers_encaisses_centimes" BETWEEN 0 AND 9007199254740991
    AND typeof("situations_gestion"."charges_exploitation_centimes") = 'integer' AND "situations_gestion"."charges_exploitation_centimes" BETWEEN 0 AND 9007199254740991
    AND typeof("situations_gestion"."valeur_machines_centimes") = 'integer' AND "situations_gestion"."valeur_machines_centimes" BETWEEN 0 AND 9007199254740991),
	CONSTRAINT "situation_etat" CHECK("situations_gestion"."revision" >= 0 AND "situations_gestion"."statut" IN ('ouverte','distribuee') AND "situations_gestion"."loyers_dus_centimes" >= "situations_gestion"."loyers_encaisses_centimes" AND "situations_gestion"."loyers_encaisses_centimes" >= 0 AND "situations_gestion"."charges_exploitation_centimes" >= 0 AND "situations_gestion"."valeur_machines_centimes" >= 0)
);
--> statement-breakpoint
ALTER TABLE `operations` ADD `situation_id` text REFERENCES situations_gestion(id);--> statement-breakpoint
ALTER TABLE `operations` ADD `type` text DEFAULT 'exemple' NOT NULL;--> statement-breakpoint
ALTER TABLE `operations` ADD `piece_texte` text;--> statement-breakpoint
ALTER TABLE `operations` ADD `date` text;