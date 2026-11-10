CREATE TABLE `candidatures` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text NOT NULL,
	`contenu` text NOT NULL,
	`statut` text DEFAULT 'brouillon' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`date` text NOT NULL,
	`derniere_commande` text NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "candidature_etat" CHECK("candidatures"."statut" IN ('brouillon','soumis','a_completer','a_approfondir','non_retenu')),
	CONSTRAINT "candidature_revision" CHECK(typeof("candidatures"."revision") = 'integer' AND "candidatures"."revision" BETWEEN 0 AND 9007199254740991)
);
--> statement-breakpoint
CREATE INDEX `candidatures_titulaire_date` ON `candidatures` (`utilisateur_id`,`date`);--> statement-breakpoint
CREATE TABLE `commandes_candidatures` (
	`id` text PRIMARY KEY NOT NULL,
	`candidature_id` text NOT NULL,
	`utilisateur_id` text NOT NULL,
	`payload` text NOT NULL,
	`instantane` text NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`candidature_id`) REFERENCES `candidatures`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action
);
