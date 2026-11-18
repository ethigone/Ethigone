# J8 — dossier HTML interactif livré

18 novembre 2026. **Dernier lot documentaire.** Aucune nouvelle décision de niche, aucun lancement commercial ou financier.

## Ouvrir

[Mode d’emploi](html/LISEZ-MOI.md) · [Index local](html/index.html).

Depuis GitHub, **Code → Download ZIP**, décompresser puis ouvrir `docs/strategie-modele-3/html/index.html`. Conserver `assets/` et le dossier parent. GitHub montre le code ; aucune publication de site ni GitHub Pages n’est activée.

| Page | Contenu |
| --- | --- |
| [Synthèse](html/index.html) | Conclusion courte, conditions de passage, textes J6 complets et datés. |
| [Domaines](html/niches.html) | Six fiches, risques et preuves, filtres par position J6. |
| [Entreprises](html/entreprises.html) | 17 fiches, recherche et filtres, six canaux de repérage, preuves manquantes. |
| [Accès investisseurs](html/investisseurs.html) | Dix points d’entrée, V01/V02 distincts, rôles, frais, pays, processus, alternatives. |
| [Simulateur](html/simulateur.html) | Trois lots et quatre scénarios, toutes entrées modifiables, résultats des quatre périmètres, cash/actifs, seuils, 21 sensibilités, 18 alternatives et trois comparateurs Lita. |
| [Fonctionnement](html/parcours.html) | Douze étapes/rôles, trois contrats, flux, vingt questions et contrôleur de cas fictifs. |
| [Sources](html/sources.html) | 124 notices, filtres, dates historiques, limites et liens ; pas 124 confirmations indépendantes. |

## Utilité et résultats

La lecture converge vers une question : **ETHIGONE apporte-t-il un service utile et payant après les solutions ordinaires ?** Un crédit fournisseur adapté peut supprimer le besoin de financement du lot ; relever les tickets ne suffit pas à assurer la rentabilité d’ETHIGONE.

Base publiée par défaut : O2, ticket indicatif 500 EUR, résultat ETHIGONE −1 121,25 EUR. Variante explicite à 2 500 : +633,75 EUR. Stress trois opérations mensuelles et acceptation 20 % : −335 EUR. Tous paramètres restent HYPOTHÈSES, pas devis, tarifs ni tickets adoptés. La répartition régulière et le dernier ajustement sont affichés au centime ; les exports conservent les valeurs numériques brutes.

N02 en priorité d’enquête pour achat/revente de lots finis, N01 repli, N03 réserve. Les fabricants repérés ne sont pas automatiquement des revendeurs ou des demandeurs de financement. EthisX reste conditionnel ; Lita actions n’est pas une substitution au lot court ; Centrifuge ne fournit pas une distribution acquise. Aucun contrat, charia ou circuit stablecoins validé.

## Vérifications effectivement réalisées

[Preuve HTML](preuves/j8-html.json) · [Preuve moteurs et interactions simulées](preuves/j8-verification.json).

- 7 pages, 749 liens/ressources locaux et 636 références d’ancres vérifiés. Aucun import réseau à l’ouverture, aucun formulaire distant ou stockage de saisie.
- 5 219 comparaisons numériques ; douze scénarios et 21 sensibilités rapprochés des résultats publiés et du moteur source.
- Filtres combinés, absence de résultats, exports JSON, saisie modifiée, saisie vide effaçant les résultats, reset, variantes J6 et cas de parcours testés avec un **DOM minimal simulé Node/VM**.
- 177 contrôles J4, 49 cas J5 et 21 sensibilités J6 réexécutés en copie temporaire, sans réécrire les preuves historiques.
- Contenu statique substantiel sans JavaScript. Styles mobile, focus clavier et impression ; ouverture/restauration des détails d’impression testée en simulation.

**Limite : aucun rendu ni interaction dans un navigateur réel validé.** Le lancement local échoue ; l’extension est indisponible et le navigateur disponible interdit les fichiers locaux. Pas de contournement. Le rendu mobile, la navigation clavier et l’impression réelle restent donc à vérifier par ouverture locale. Les tests Node ne certifient pas l’accessibilité.

Pas de nouvelles consultations web. Les dates de sources restent historiques ; divergence d’URL E09 et échec J6 conservés. Les contrôles techniques ne valent aucun avis professionnel ni certification.

## Construction et périmètre

`python construire_html_j8.py` avec Python 3, pandoc et Node.js construit les pages depuis les JSON et Markdown. `assembler_html_j8.mjs` appelle le préparateur J7 puis crée le manifest courant et le bundle classique. Formules des deux moteurs inchangées. Le template du simulateur est dans `templates/` ; toutes les pages de `html/` sont complètes.

Un agent **gpt-6.1-sol** a effectivement construit le simulateur ; intégration et contrôles par le coordinateur. Pas de sous-délégation, d’Astra ou de second audit J6 revendiqué.

Travail limité à ce dossier ; fichiers existants et preuves historiques préservés hors état courant et README. Publication sur tête courante sans force, puis relecture du commit et des empreintes à confirmer après écriture. Aucun contact, collecte, wallet, paiement, hébergement ou application modifié.

**Programme terminé le 18 novembre. Aucun prochain lot automatique.** La prochaine étape utile serait une validation terrain, après autorisation distincte de contacts ; ce dossier ne l’effectue pas.
