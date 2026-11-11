# État de reprise — Modèle 3

Date : **11 novembre 2026**. Programme autorisé : [sept passages](PLAN_7_JOURS.md), fin le 17 novembre sans prolongation automatique.

## Terminé

**J1 : comparaison documentaire de six niches**, présélection de trois pistes pour investigation J2. Le dossier contient méthode, alternatives, critères d'acceptation/refus, pièces à rechercher, tests d'invalidation, sources et limites. Les valeurs financières inconnues restent absentes (`null`), et aucun besoin de financement n'est déclaré vérifié.

Présélection **PROPOSITION**, sans niche adoptée :

- N01 : consommables de filtration standards non critiques, sur commande documentable.
- N02 : emballages industriels simples, référence déjà maîtrisée et commande documentable.
- N03 : lots de PC professionnels reconditionnés, opérateur existant et commande documentable.

N04 cuisine professionnelle reconditionnée, N05 location de matériels productifs et N06 maintenance/installation restent en réserve. Leur réouverture a des conditions explicites. La présence des PC parmi les pistes reflète la qualité des documents trouvés, pas une rentabilité supérieure démontrée.

Un agent **gpt-6.1-sol** a été effectivement appelé pour comparer les niches et structurer les données, sans sous-délégation. Le coordinateur a intégré les résultats, corrigé le périmètre J2/J3 et relu cinq sources primaires déterminantes. Aucune contre-revue Astra à J1.

## Vérifications

Voir [preuves/j1-verification.json](preuves/j1-verification.json) et le script [verifier.py](verifier.py). Contrôles de structure JSON, références de sources, trois pistes au maximum, marges inconnues, absence de besoin attribué sans preuve, liens Markdown locaux, calendrier et absence de marqueurs privés dans les fichiers préparés. Aucune modification de l'application, aucun test visuel ou financier réel revendiqué.

Sources évolutives : la page SEPEM dont l'URL contient `angers-2025` affiche maintenant une liste Angers 2027 arrêtée au 5 novembre 2026. La fiche Vesto reste un repérage au contenu partiellement accessible. La DAE décrit un marché informatique déjà attribué, pas une commande disponible pour ETHIGONE.

## Prochain lot

**J2 — 12 novembre :** répertoire d'environ 18 entreprises sur les trois pistes, avec URLs, identité/activité à rapprocher, territoire, type d'opération, signal public, preuve manquante et raison d'étudier ou d'écarter. Ne pas remplir artificiellement un quota. Aucune entreprise n'est présentée comme demandeuse de financement ou partenaire sans preuve.

J3 voies d'accès aux investisseurs ; J4 économie ; J5 parcours/contrats ; J6 décision et contre-revue ; J7 HTML interactifs locaux dans `html/`, avec état réellement atteint et sources.

## Limites et sauvegarde

Aucun contact, dépense, transfert ou collecte. Aucun opérateur, investisseur, partenariat, contrat, marge ou certification acquis. Recherche France/UE initiale ; pays d'exploitation et d'investissement non choisis. Le dépôt public conserve uniquement données publiques et simulations.

Ce dossier est repris depuis `ethigone/Ethigone`, branche `main`, chemin `docs/strategie-modele-3`. L'historique Git fournit la version de ces fichiers. Base du dépôt avant ce passage : `c41c48a04bcfc13d657102270373f0739ce1c81c`. Le commit de publication doit être confirmé séparément avant d'annoncer la sauvegarde distante.

Ne pas reprendre les anciens sprints automatiques, modifier le Site privé, lancer GitHub Pages, changer d'hébergeur ou traiter une autre tâche.
