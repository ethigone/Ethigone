# J7 — contrôle de cohérence et préparation des HTML

17 novembre 2026. **J6 était bien publié ; il n'a pas été refait. Le contrôle J7 est terminé. Les HTML restent à produire le 18 novembre (J8).**

## Conclusion en langage simple

La recommandation demeure : examiner d'abord les emballages B2B en réassort, par achat/revente de lots finis déjà commandés ; filtration non critique en repli. C'est un ordre d'enquête proposé, pas une niche adoptée ou une rentabilité prouvée. Les entreprises repérées n'ont confirmé ni besoin ni volonté de payer. Aucun accès aux investisseurs, contrat, circuit stablecoin ou conformité charia n'est validé.

Les chiffres publiés concordent. Pour l'exemple fictif emballages, le résultat ETHIGONE est **−1 121,25 EUR** dans la base à ticket indicatif de 500 EUR, **+633,75 EUR** dans la variante à 2 500 EUR, puis **−335 EUR** si l'on réduit aussi la cadence à trois opérations mensuelles et le taux d'acceptation à 20 %. Ce sont des hypothèses ; aucune tarification ni participation minimale n'est adoptée.

## Ce qui a été effectivement vérifié

- Lecture des trois fichiers de reprise sur `main`, puis récupération de 65 fichiers du dossier à la tête `d81bdcc8ec0553694010ec65c70690117da057ff`. Leurs contenus ont été rapprochés de leurs empreintes Git avant travail isolé.
- Cohérence entre la recommandation J6, les données de décision, les entreprises, les voies investisseurs, le parcours et les calculs J4/J6.
- Références et décomptes : six niches comparées, 17 fiches d'entreprises (6/6/5), dix points d'entrée, deux voies documentaires conditionnelles et zéro voie pleinement validée. E16 reste fusionnée sous E17.
- Douze scénarios J4, 18 alternatives et 21 sensibilités J6 rapprochés. Le script classique préparé pour l'embarquement reproduit les mêmes calculs et rejette les entrées invalides.
- **5 416 comparaisons numériques** dans le contrôleur J7 ; tests historiques rejoués dans une copie temporaire : 177 contrôles J4, 49 cas J5 et 21 sensibilités J6. Les preuves historiques et moteurs n'ont pas été réécrits.
- 124 notices de provenance et 695 références internes résolues. Les notices comprennent mandats, hypothèses et tentatives échouées ; ce ne sont pas 124 sources indépendantes confirmant le projet.

Preuve reproductible : [preuves/j7-verification.json](preuves/j7-verification.json), via [verifier_j7.mjs](verifier_j7.mjs).

## Clarifications intégrées aux données de présentation

| Point | Traitement pour J8 |
| --- | --- |
| J1/J2 envisageaient aussi matière ou fabrication ; J6 resserre sur achat/revente de lots finis. | Superposer la recommandation J6, en conservant les observations historiques. Aucun fabricant automatiquement qualifié comme revendeur. |
| Les cinq opérateurs N02 à qualifier ne représentent pas les six fiches N02. | E07–E11 sont à qualifier ; E12 est fournisseur comparatif. Aucun besoin confirmé. |
| J3 mentionne deux voies prioritaires ; J6 distingue leurs instruments. | V01 EthisX reste à instruire pour un lot. V02 Lita concerne des actions, sans équivalence avec un lot court. Centrifuge demeure une piste technique dont distribution et droits restent à établir. |
| Les anciens textes J4/J5 gardent l'ancien calendrier et parfois « J6 non réalisé ». | L'état actuel vient de `sprint.json` et du premier bloc du checkpoint. Les preuves anciennes restent datées. Les libellés du README courant sont harmonisés vers J8. |
| E09 Besset Boudot a deux variantes d'URL dans les documents J2/J6. | Divergence signalée dans les données de présentation ; tentative J6 échouée, aucun lien actif reconfirmé le 17. Ne pas transformer cet échec en disparition d'entreprise. |
| `independent_profit` et décimales binaires peuvent induire en erreur. | Libellé « contre-calcul arithmétique distinct », pas audit indépendant ; montants EUR affichés au centime, valeurs brutes conservées. |
| Certains flux J5 utilisent des groupes de rôles ou des acteurs externes en texte libre. | Correspondances explicites pour le rendu ; aucune partie ni responsabilité nouvelle inventée. |

Les précautions sont enregistrées dans [data/presentation-j8.json](data/presentation-j8.json). Les cinq sources J6 sont transcrites à l'identique depuis leur tableau dans [data/sources-j6.json](data/sources-j6.json), avec dates et échec d'accès conservés. **Aucune nouvelle consultation web n'est revendiquée le 17 novembre.**

## Préparation utilisable, pas seulement un plan

[preparer_j8.mjs](preparer_j8.mjs) assemble 22 jeux de données, cinq documents explicatifs et les deux moteurs existants. [data/manifest-j8.json](data/manifest-j8.json) recense leurs chemins et empreintes. Il génère un script classique contenant données et calculs : aucune requête réseau ni import à l'ouverture du futur HTML. Les seuls mots-clés d'export des moteurs sont retirés pour les encapsuler ; les formules ne sont pas réécrites.

```sh
node preparer_j8.mjs --manifest
node verifier_j7.mjs
# À J8, pour produire le script à intégrer aux pages :
node preparer_j8.mjs --out html/assets/donnees-et-moteurs.js
```

L'objet `ETHIGONE_J8` contient `datasets`, `documents`, `sources`, `manifest`, `economics.calculate` et `workflow.evaluateDossier`. Les sources sont conservées avec leurs schémas et dates d'origine. Le registre unifié relie chaque notice à son fichier ; il ne fusionne pas deux consultations du même site. Les textes JSON sont échappés pour leur insertion dans un élément script.

À J8, utiliser ces données pour les six vues, filtres et exports ; afficher les limites près des chiffres. La base publiée à 500 EUR reste le défaut du simulateur : ne pas sélectionner silencieusement la variante plus favorable à 2 500 EUR. Un changement vers C02/C03 ne peut pas réutiliser le partage C01. Les exemples J5 sont fictifs et évalués à leur date déclarée ; même cohérents, ils conservent `financial_execution_authorized=false`.

## Limites et prochain lot

Contrôle logiciel sous Node.js et VM JavaScript, **sans contrôle visuel de navigateur ni HTML livré à J7**. Un agent gpt-6.1-sol a effectivement contribué à la revue éditoriale J7 ; le coordinateur a intégré ses constats et exécuté les contrôles. Aucun sous-agent supplémentaire ni sous-délégation. La contre-revue J6 historique reste celle du coordinateur seul ; aucune certification ou consultation professionnelle.

Le **18 novembre — J8** : construire les documents HTML complets dans `html/`, avec navigation, filtres, simulateur, export local, mobile, clavier, impression et lecture utile sans JavaScript. Vérifier fonctionnement local, calculs, liens et rendu si navigateur disponible, puis publication et contenu distants. Présenter l'état atteint et arrêter cette tâche sans prolongation automatique.

Aucun contact, collecte, wallet, transaction, achat, hébergement ni application de démonstration modifié. La publication de la recherche n'ouvre pas un service financier.
