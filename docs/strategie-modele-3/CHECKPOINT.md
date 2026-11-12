# État de reprise — Modèle 3

Date : **12 novembre 2026**. Programme autorisé : [sept passages](PLAN_7_JOURS.md), fin le 17 novembre sans prolongation automatique.

## Terminé

- **J1** : comparaison de six niches; N01 filtration standard non critique, N02 emballages simples sur commande, N03 lots de PC reconditionnés déjà commandés restent des **PROPOSITIONS**, sans niche adoptée. Livrables J1 conservés.
- **J2** : [répertoire documenté](J2_ENTREPRISES.md), 18 entrées initiales ramenées à **17 fiches** après fusion Ecubel E16 sous E17 avec ITJustGood/Digitalea (groupe ATF déclaré). Répartition N01/N02/N03: **6/6/5**. Rôles proposés: **13 opérateurs à qualifier, trois fournisseurs/comparatifs, une réserve de périmètre**. Ni 17 demandes ni 17 contreparties indépendantes auditées.

Livrables: synthèse, fiches détaillées, 45 sources J2, données entreprises et six chemins de repérage. Sources primaires d’activité/identité, règles de regroupement, opérations hypothétiques, risques, alternatives et pièces manquantes sont explicites. Une immatriculation ne prouve pas la solidité. Besoin, intérêt ETHIGONE et commande restent non vérifiés; marges `null`.

Un agent **gpt-6.1-sol** a effectivement travaillé sur les PC, sans sous-délégation. Le coordinateur a recherché les deux autres niches, relu les six sites PC, les identités et les sources déterminantes, puis corrigé le regroupement ATF et confirmé l’existence de l’espace B2B Kiatoo. Aucune contre-revue Astra à J2.

## Découvertes et limites importantes

- Sofise est dans Pemflow; pas de double comptage des sociétés du groupe. FISA Filtration est distinct de FISA France ultrasons. Les chiffres légaux de l’hébergeur CGE ne sont pas attribués au fabricant.
- Les CGV Poutet distinguent propriété, risque et paiement, et comportent des clauses d’intérêts de retard: version réelle et compatibilité à examiner à J5, aucun contrat adopté.
- Les stocks d’emballages sur appel exigent un engagement ferme de volume et un calendrier; les collectes PC exigent de distinguer achat, don, cession et propriété.
- SEPEM: pagination et index discordants. Trois lectures de registre français non obtenues; rapprochements juridiques laissés ouverts. Quelques pages PC uniquement indexées; limites dans le registre de sources.
- Réseaux blockchain examinés en J2: HAQQ classe Zetl Planned DeFi; fiche ConsolFreight Centrifuge datée de 2020. Aucune entreprise N01–N03 supplémentaire qualifiée par ces voies. Pas d’accès aux dossiers ni de capitaux déduit de ces pages.

## Vérifications

Le contrôle courant est [verifier_j2.py](verifier_j2.py), résultat [preuves/j2-verification.json](preuves/j2-verification.json): JSON, provenance, 17 fiches/18 entrées, regroupements connus, statuts, inconnues financières, liens Markdown, calendrier, marqueurs privés et empreintes. Le script `verifier.py` est le contrôle historique de l’état J1; ne pas l’exécuter pour remplacer sa preuve historique après avancement du sprint.

Aucun test visuel, audit de société, contrôle de solvabilité, avis juridique ou certification charia revendiqué. Aucun contact, achat, mouvement d’argent, collecte, wallet ou modification de l’application.

## Prochain lot

**J3 — 13 novembre :** environ dix acteurs/points d’entrée vers les investisseurs; deux voies prioritaires documentées. Distinguer infrastructure, distributeur, financeur et décisionnaire. Vérifier pays, clientèle retail/professionnelle, instrument, ticket, frais et accès, sans réutiliser une archive comme offre active.

J4 utilisera trois simulations anonymisées sans attribuer de chiffres aux entreprises de J2. J5 parcours/contrats; J6 confrontation et contre-revue; J7 HTML interactifs hors ligne utilisant ces données et les mêmes statuts. J3–J7 restent à faire.

## Sauvegarde et périmètre

Source durable: `ethigone/Ethigone`, branche `main`, `docs/strategie-modele-3`. Base distante lue avant J2: `2b7af599fbd2e7b1ac4277a846702b7b9839c9a6`. Les dix fichiers locaux J1 ont été comparés aux empreintes Git distantes avant copie isolée. Aucun fichier hors de ce dossier n’est modifié par J2. Le commit contenant ce checkpoint est identifiable dans l’historique Git; la tête et les empreintes doivent être vérifiées après publication avant d’annoncer la sauvegarde distante.

Ne pas modifier le Site de démonstration, les anciens sprints, l’hébergement ou d’autres tâches. Pas d’activation GitHub Pages. Pays d’exploitation/investissement non choisis, aucun partenaire ni contrat acquis. Le dossier public conserve uniquement recherche publique, hypothèses et simulations; aucun document commercial confidentiel.
