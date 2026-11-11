# ETHIGONE — Travail restant et pistes

[Projet](README.md) · [Fonctionnement du site](README_SITE.md)

**État au 9 novembre 2026 :** prototype privé construit, sprint terminé. Les conditions d’un pilote réel restent à établir. Cette liste ne lance aucune automatisation, prise de contact ou dépense.

**Actualisation du 11 novembre 2026 :** le modèle 3 est adopté comme orientation : entreprises/opérations ciblées et particuliers éligibles, notamment détenteurs de stablecoins. Le [programme autorisé de sept passages](docs/strategie-modele-3/PLAN_7_JOURS.md) succède au sprint technique et fixe les priorités du 11 au 17 novembre ; son [état réel](docs/strategie-modele-3/CHECKPOINT.md) est suivi séparément. La liste ci-dessous conserve les limites techniques et les pistes connues au 9 novembre. Le choix d'une niche, les frais, le montage et l'accès effectif aux investisseurs restent à établir. Les documents HTML interactifs sont prévus à J7 ; aucune offre financière publique n'est ouverte.

## Lire les statuts

| Statut | Sens |
| --- | --- |
| CONFIRMÉ | Élément établi dans le périmètre de sa preuve. |
| DÉCIDÉ | Choix explicitement adopté pour le périmètre concerné. |
| HYPOTHÈSE | Élément supposé, sans validation suffisante. |
| RISQUE | Élément pouvant compromettre le fonctionnement ou le pilote. |
| À VÉRIFIER | Contrôle, information ou avis nécessaire. |
| PROPOSITION | Action recommandée, sans adoption automatique. |
| REJETÉ | Proposition abandonnée ; aucun nouveau rejet n’est prononcé ici. |

## État atteint

| Sujet | Statut | Preuve ou portée |
| --- | --- | --- |
| Application persistante | CONFIRMÉ | Code, migrations D1 et tests locaux J4 à J9. |
| Participation et reçu fictifs | CONFIRMÉ | Parcours J5, montants, répétitions et isolation. Aucun versement. |
| Gestion bénéfice/perte/retard | CONFIRMÉ | Moteur partagé, opérations et distributions simulées J6. |
| Assistance et candidatures | CONFIRMÉ | Écritures, permissions et versions transmises vérifiées localement. |
| Site réservé au propriétaire | CONFIRMÉ | Audience et publication V11 relues le 9 novembre. |
| Guide de présentation | CONFIRMÉ | Route `/presentation`, six étapes pour cinq minutes. |
| Un seul projet fictif de location | DÉCIDÉ | Périmètre du sprint, sans opérateur partenaire. |
| Conformité charia exigée | DÉCIDÉ | Condition du projet ; certification absente. |
| Modèle commercial et demande | HYPOTHÈSE | Aucun pilote ni validation commerciale déduits de la démonstration. |

## Priorités avant une nouvelle phase

| Priorité | Travail | Preuve attendue |
| --- | --- | --- |
| 1 | Vérifier la démo avec la connexion réelle du propriétaire et sur les appareils de présentation. | Connexion, saisie, confirmation, reçu, reprise et gestes mobiles observés. |
| 2 | Choisir une activité et une zone d’étude, puis qualifier le besoin de l’opérateur et des investisseurs. | Besoin, alternatives, activité, actifs, flux et raisons d’accepter ou refuser documentés. |
| 3 | Examiner ce dossier avec des professionnels charia, juridiques et comptables. | Avis sur l’activité, les contrats précis, les responsabilités et conditions à remplir. |
| 4 | Vérifier l’exécution et l’économie réelles. | Pièces sur propriété, exploitation, encaissement, charges, frais externes, incidents, pertes et sorties. |
| 5 | Tester l’infrastructure crypto sans fonds réels. | Wallet réel, autorisations et transaction testnet prouvés, puis rapprochement applicatif. |
| 6 | Construire les seules fonctions nécessaires au pilote validé. | Critères d’acceptation et autorisations explicites avant toute opération réelle. |

**PROPOSITION :** après qualification de la présentation, consacrer la suite à un dossier opérateur concret et aux conditions d’exécution. Une nouvelle version graphique seule ne lève pas ces inconnues.

## Vérifications ouvertes sur la démonstration

- [ ] Connexion interactive réelle du propriétaire et rôle administrateur.
- [ ] Affichage et gestes sur téléphone : menu, champs, erreurs, confirmation et portefeuille.
- [ ] Préremplissage JavaScript des candidatures, sauvegarde, compléments et resoumission observés dans un navigateur.
- [ ] Installation locale sur une machine extérieure à l’environnement du sprint.
- [ ] Données historiques malformées ou corrompues : le journal de soumission absent est couvert, la corruption arbitraire ne l’est pas.

## Centrifuge et wallet

CONFIRMÉ dans les preuves historiques : lecture d’un pool testnet externe et code d’accès à l’indexeur. Dernière lecture réseau réelle connue : 4 novembre 2026 à 08:01:58.203Z. Les tests wallet emploient un fournisseur EIP-1193 simulé.

À VÉRIFIER : disponibilité actuelle de l’indexeur, cohérence indépendante avec le réseau, extension wallet réelle, autorisation des adresses, jetons de test et participation testnet. Aucune participation blockchain réelle n’est démontrée.

Atelier Lavage n’a pas de pool blockchain déployé. Aucun accord Centrifuge, Anemoy ou opérateur ne résulte du test. Aucun fonds réel ni clé personnelle n’est nécessaire pour les essais autorisés.

## Fonctions à concevoir avant un produit réel

| Sujet | Limite actuelle |
| --- | --- |
| Collecte globale | Essais indépendants, sans réservation ni total collecté. |
| Activation et restitution | Non implémentées. La fenêtre pédagogique de collecte ne les rend pas opérationnelles. |
| Monnaies et conversion | EUR fictifs ; aucune conversion EUR/USDC. |
| Paiements | Aucun paiement opérateur, versement investisseur ni crédit de compte. |
| Documents | Pièces textuelles fictives ; dépôt et conservation de véritables fichiers à concevoir. |
| Préparations | Archivées sans expiration ou suppression dans le lot livré. |
| Comptabilité | Calculs pédagogiques ; traitement réel et rapprochements à instruire. |
| Accès réglementaires | Connexion technique Sites ; aucun KYC/AML ou droit de commercialisation validé. |
| Exploitation | Sauvegarde/restauration, incidents, support, rétention et suivi de sécurité à qualifier. |

## Charia, droit et responsabilités

La Musharaka reste une base à examiner avec l’activité et les contrats. Partage du bénéfice, pertes, frais, droits sur les actifs, responsabilités, trésorerie et sortie doivent former un ensemble cohérent. L’USDC envisagé demande aussi un examen.

Aucun pays, véhicule, fonds, holding ou SPV n’est imposé ici. Les références France/UE forment une grille conditionnelle. Les revues d’agents et sources conservées ne sont ni un avis professionnel actualisé ni une certification.

Les 60 000 USD historiques étaient une hypothèse de charges, pas un minimum de lancement. Le budget du pilote doit partir de besoins et prestations réellement identifiés.

## Où, auprès de qui et comment chercher des opérateurs

Ces pistes préparent une recherche ultérieure. Aucun nom n’est présenté comme partenaire ; aucun démarchage n’a été effectué.

| Où chercher | Qui identifier | Ce qu’il faudra vérifier |
| --- | --- | --- |
| Annuaires et registres officiels | Entreprises actives dans le secteur retenu. | Existence, activité, dirigeants et pièces. L’existence légale ne prouve pas la solidité financière. |
| Réseaux sectoriels et chambres consulaires | Exploitants connaissant leur marché. | Ancienneté, clientèle, capacité et besoin précis. |
| Fournisseurs de matériel | Entreprises équipées ou ayant un besoin documentable. | Devis, maintenance, garanties et délais ; qualification indépendante de l’opérateur. |
| Entreprises en exploitation | Opérateurs ayant des flux observables. | Comptes, encaissements, dettes, incidents et justificatifs. |

Annuaire via Service Public, CCI, FFPB et GEIST sont les exemples documentaires français du sprint. Ils ne désignent ni un partenaire ni le pays du pilote. Provenance et limites : [preuves/j8-sources.json](preuves/j8-sources.json), [src/data/recherche-operateurs.ts](src/data/recherche-operateurs.ts).

Méthode proposée : définir profil et critères, constituer une liste documentée sans collecte excessive de données personnelles, vérifier les informations publiques, puis préparer une grille de questions. Tout contact demande une autorisation distincte. Le dossier fictif du prototype permet d’éprouver la grille ; « À approfondir » n’est ni un agrément ni un engagement financier.

## Hébergement : chantier distinct

GitHub prépare la reprise du code. Le choix Hostinger/Vercel sera étudié ensuite, à partir de l’offre exacte, de l’exécution serveur, de D1, de l’authentification et des secrets. Aucune compatibilité prête à déployer n’est annoncée ici ; aucun hébergement n’a été modifié.

## Conditions d’une suite autorisée

Le sprint a autorisé la démo privée, les données fictives et les essais sans valeur réelle. Il n’a autorisé ni ouverture publique du service, collecte, achat, contact commercial ni opération financière réelle. Une phase de pilote demandera un périmètre et une autorisation distincts.
