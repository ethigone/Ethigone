CREATE TABLE `projets` (
	`slug` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`nom` text NOT NULL,
	`materiel` text NOT NULL,
	`quantite` integer NOT NULL,
	`prix_unitaire_centimes` integer NOT NULL,
	`devise` text NOT NULL,
	`fictif` integer NOT NULL,
	`couts` text NOT NULL,
	`risques` text NOT NULL,
	`etapes` text NOT NULL,
	CONSTRAINT "quantite_positive" CHECK("projets"."quantite" > 0),
	CONSTRAINT "prix_positif" CHECK("projets"."prix_unitaire_centimes" > 0),
	CONSTRAINT "demo_uniquement" CHECK("projets"."fictif" = 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projets_reference_unique` ON `projets` (`reference`);