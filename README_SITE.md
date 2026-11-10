# ETHIGONE — Le site et son fonctionnement technique

[Projet ETHIGONE](README.md) · [Travail restant et pistes](README_PISTES.md)

## Version de référence

Sources applicatives de la démonstration V11, état au 9 novembre 2026. Cette copie publique exclut les identifiants du déploiement privé et les journaux internes.

L’application utilise **React et TypeScript, Vinext/Vite, un Worker Cloudflare et une base D1**. Elle emploie la structure de routes App Router de Next.js, mais son serveur compilé cible Workers. Il ne s’agit pas d’un simple ensemble de pages HTML statiques.

Le dépôt conserve le code, les migrations, les jeux d’exemple fictifs et les tests. Les données des comptes du Site hébergé, les secrets et l’état d’exécution local ne font pas partie du transfert Git.

## Écrans disponibles

| Parcours | Routes principales | Fonction |
| --- | --- | --- |
| Découvrir | `/`, `/projets`, `/projets/atelier-lavage` | Accueil, catalogue et dossier du projet unique. |
| Comprendre | `/fonctionnement`, `/regles`, `/charia`, `/faq` | Hypothèses, scénarios, risques et examens attendus. |
| Présenter | `/presentation` | Guide de cinq minutes et bilan du prototype. |
| Participer | `/mon-espace`, `/participer`, `/participer/confirmation` | Suivi du dossier, préparation puis confirmation d’un essai personnel. |
| Suivre | `/portefeuille`, `/suivi-projet` | Reçus, situations de gestion et projections personnelles. |
| Assistance | `/assistance`, `/administration/assistance` | Demande privée, réponse et clôture ; aucun envoi externe. |
| Candidatures | `/proposer-projet`, `/candidatures/[id]`, `/administration/candidatures` | Brouillon privé, soumission, préexamen et historique. |
| Origination future | `/recherche-operateurs` | Méthode documentaire et critères pour rechercher des opérateurs. |
| Administration | `/administration`, `/administration/gestion` | Registre, recettes, dépenses, valorisation, incidents et distributions simulées. |
| Test crypto | `/connexion-test`, `/api/centrifuge-test` | Lecture d’un pool externe de test et interface wallet Sepolia. |

Sur le déploiement actuel, même les pages de découverte sont derrière l’accès privé du Site. Les espaces personnels exigent en plus une identité utilisateur reconnue par l’application.

## Organisation du code

| Répertoire ou fichier | Contenu |
| --- | --- |
| `app/` | Pages, routes API et styles globaux. |
| `src/data/` | Registre, participation, gestion, assistance, candidatures et contrôles de formulaire. |
| `src/economie/` | Calculs en centimes, règles pédagogiques et projections. |
| `src/blockchain/` | Lecture de l’indexeur Centrifuge et connecteur wallet. |
| `src/ui/` | Composants métier et formulaires. |
| `db/`, `drizzle/` | Schéma Drizzle, accès D1 et six migrations SQL additives. |
| `worker/` | Entrée serveur du Worker. |
| `public/` | Visuels SVG et preuves publiques de démonstration. |
| `tests/`, `preuves/` | Vérifications locales reproductibles et sources documentaires publiques. |
| `scripts/`, `vendor/`, `lib/` | Outillage et composants conservés du starter. |
| `.openai/hosting.json` | Configuration générique de la liaison `DB`, sans identifiant de Site ni secret. |

## Persistance et règles métier

La base possède dix-sept tables applicatives. Les migrations `0000` à `0005` installent le projet, le registre, les préparations, la gestion, l’assistance et les candidatures. Le code initialise les exemples fictifs avec des clés stables. Les lectures suivantes retrouvent les enregistrements existants.

Les règles historiques sont archivées. Une évolution des conditions doit créer une nouvelle version plutôt que réécrire celle déjà attachée aux essais et opérations.

### Participation

Le premier formulaire enregistre une préparation personnelle immuable : montant en centimes, règles et identifiant. La confirmation relit le montant côté serveur. Participation, reçu et historique sont écrits ensemble. La répétition d’une même commande retrouve la même écriture.

Chaque essai est indépendant. Il n’existe ni total de collecte, ni réservation de capital, ni conversion EUR/USDC. Les bornes sont 0,01 € à 19 200 € fictifs par essai.

### Gestion

L’administrateur crée une situation indépendante Bénéfice, Perte ou Retard. Les mouvements distinguent nouvelle recette encaissée, règlement d’une créance, dépense, valorisation et incident. Un règlement de créance ne double pas le revenu. La valeur des machines ne devient pas de l’argent disponible.

Une seule distribution simulée peut clore une situation. Le plafond est recalculé côté serveur. Les projections utilisent BigInt et la troncature au centime vers zéro. Aucun compte ne reçoit d’argent.

### Assistance et candidatures

L’assistance reste privée au titulaire et à l’administration. Une candidature commence comme brouillon privé. L’administration tierce voit la dernière version explicitement transmise, pas les modifications privées ultérieures. Une nouvelle soumission conserve les versions et décisions antérieures.

Les justificatifs sont actuellement des textes fictifs. Aucun stockage de fichiers métier dans R2 n’est implémenté.

## Identité, permissions et secrets

Le frontal Sites vérifie la connexion puis fournit l’identité au serveur. Le code associe le sujet stable à un compte D1. Le rôle ordinaire est investisseur ; les opérations administrateur revérifient le rôle enregistré.

`ETHIGONE_ADMIN_BOOTSTRAP_EMAIL` est un réglage serveur confidentiel d’amorçage du propriétaire. Sa valeur n’est pas dans ce dépôt. Aucun secret wallet ni phrase de récupération n’est nécessaire.

Un accès technique au Site privé ne représente pas un utilisateur. Les routes mutantes contrôlent notamment origine, identité, champs, UUID et, selon le parcours, révision attendue.

**La confiance dans les en-têtes d’identité dépend du frontal Sites.** Un hébergement différent devra fournir une authentification vérifiée et empêcher le client de forger ces en-têtes. La copie du code ne remplace pas ce contrôle.

Le starter prévoit une identité synthétique pour l’aperçu en boucle locale. Elle sert au développement et ne prouve pas une connexion réelle du propriétaire.

## Installation et vérifications locales

Prérequis déclarés : Node.js `>=22.13.0`, pnpm `11.25.0` et les dépendances du verrouillage. Conserver `pnpm-lock.yaml` ; un changement de gestionnaire demande une qualification.

Depuis la racine d’une copie de travail :

```sh
pnpm install --frozen-lockfile
pnpm build
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

La compilation produit `dist/server/index.js` et `dist/server/wrangler.json` sans publier le site. Le profil portable est sélectionné lorsqu’aucun profil local n’existe. Les scripts contiennent également le profil de l’environnement Sites utilisé pendant le sprint.

Tests économiques, wallet simulé, API contrôlée et formulaires :

```sh
node tests/economie-j3.mjs
node tests/wallet-j2.mjs
node tests/centrifuge-j2.mjs
node tests/verification-j9.mjs
```

Après compilation, les tests suivants appliquent les migrations sur des D1 locales jetables et utilisent des identités simulées :

```sh
node --import ./scripts/sites-env.mjs tests/j1.mjs
node --import ./scripts/sites-env.mjs tests/registre-j4.mjs
node --import ./scripts/sites-env.mjs tests/participation-j5.mjs
node --import ./scripts/sites-env.mjs tests/gestion-j6.mjs
node --import ./scripts/sites-env.mjs tests/assistance-j7.mjs
node --import ./scripts/sites-env.mjs tests/candidatures-j8.mjs
node --import ./scripts/sites-env.mjs tests/navigation-j7.mjs
node --import ./scripts/sites-env.mjs tests/verification-j9.mjs --worker
```

Les tests de l’API Centrifuge utilisent des réponses contrôlées ; leur succès ne prouve pas la disponibilité actuelle de l’indexeur.

### Aperçu interactif

`pnpm dev` démarre le serveur de développement. Les pages métier nécessitent une D1 locale contenant le schéma. Les tests jetables ci-dessus ne préparent pas la base de cet aperçu. Le démarrage du processus ne suffit donc pas à valider le parcours complet.

L’installation interactive sur une autre machine reste à qualifier. Ne pas utiliser une base hébergée pour les tests locaux ni modifier le Site existant pour amorcer un environnement de développement.

## Vérifications et limites

Les preuves du sprint couvrent calculs, arrondis, permissions, isolation, répétitions, concurrence, interruptions et persistance après redémarrage. Le 9 novembre, la validation de navigation comptait 26 pages ou états, 878 liens, 109 ancres et 43 références de champs/accessibilité.

Les contrôles hébergés de reprise du 9 novembre ont confirmé 26 réponses HTTP attendues : sept pages de découverte avec l’accès technique privé, douze pages personnelles redirigées sans identité, six POST refusés sans identité et la présentation refusée sans accès privé.

Rendu visuel réel, gestes mobiles, préremplissage JavaScript interactif et connexion réelle du propriétaire restent non vérifiés par l’agent. Les contrôles CSS à quatre largeurs ne remplacent pas une inspection visuelle.

## Hébergement actuel et maintenance

Le Worker, la liaison D1, l’authentification Sites, les secrets serveur et l’accès privé sont des dépendances à traiter avant tout changement d’hébergement. Les outils réservés au déploiement privé et ses identifiants sont exclus de cette copie publique. Le manifeste générique permet de conserver la liaison locale `DB` ; il ne désigne aucun Site à publier.

Le choix Hostinger/Vercel est **reporté à une étape distincte**. Aucune migration, activation de GitHub Pages ou publication publique n’est incluse dans ce transfert.

- Préserver les migrations, les versions de règles et les transactions D1 natives.
- Ajouter une migration additive quand le schéma change.
- Maintenir l’unicité des commandes et l’indépendance des essais fictifs.
- Vérifier les scénarios et parcours affectés avant une modification métier.

Les checkpoints et comptes rendus internes restent conservés séparément par le propriétaire. Les contrôles décrits ici portent sur un état daté ; ils ne prouvent pas la disponibilité actuelle d’un service externe.
