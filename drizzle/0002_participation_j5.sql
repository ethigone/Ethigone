CREATE TABLE `preparations_participation` (
	`id` text PRIMARY KEY NOT NULL,
	`utilisateur_id` text NOT NULL,
	`projet_slug` text NOT NULL,
	`regles_id` text NOT NULL,
	`montant_centimes` integer NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`projet_slug`) REFERENCES `projets`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`regles_id`,`projet_slug`) REFERENCES `versions_regles`(`id`,`projet_slug`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "preparation_demo_j5" CHECK("preparations_participation"."projet_slug" = 'atelier-lavage'
    AND typeof("preparations_participation"."montant_centimes") = 'integer' AND "preparations_participation"."montant_centimes" BETWEEN 1 AND 1920000)
);
