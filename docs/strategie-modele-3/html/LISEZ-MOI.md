# ETHIGONE — dossier interactif hors ligne

Livraison du 18 novembre 2026. Étude documentaire, pas offre d’investissement.

## Ouvrir le dossier

1. Sur le dépôt GitHub, utiliser **Code → Download ZIP** (télécharger le dépôt).
2. Décompresser le ZIP : ne pas ouvrir les pages à l’intérieur de l’archive.
3. Ouvrir `docs/strategie-modele-3/html/index.html` dans un navigateur récent.
4. Garder les pages, le dossier `assets/` et les documents parents ensemble pour conserver tous les liens.

GitHub affiche le code HTML, pas le dossier comme un site. Aucun GitHub Pages ni hébergement n’a été activé. Les sept pages fonctionnent sans serveur, sans compte et sans internet. Les liens de sources externes nécessitent une connexion seulement si vous les cliquez.

## Utilisation

- **Synthèse** : conclusion courte, limites et textes J6 complets.
- **Domaines / Entreprises / Accès investisseurs** : recherche et filtre combinés ; ouvrir les fiches détaillées. « Non vérifié » ne signifie pas « inexistant ».
- **Simulateur** : base O2 à ticket indicatif 500 EUR ; trois lots, quatre scénarios. Ouvrir les groupes de paramètres pour modifier toutes les entrées. Les ratios sont des fractions (0,20 = 20 %). Le ticket 2 500 et le stress J6 sont des choix explicites, aucun minimum adopté.
- **Fonctionnement** : étapes, propriété, responsabilités, contrats et questions professionnelles ; contrôleur d’exemples fictifs.
- **Sources** : dates historiques et limites, y compris accès échoués. Pas de vérification web nouvelle au 18 novembre.
- **Export JSON** : télécharge seulement les fiches filtrées ou la simulation active. Aucune saisie n’est envoyée ni conservée automatiquement. Ne saisir que des hypothèses anonymisées.
- **Impression** : le bouton ouvre les détails pour imprimer la vue ; les fiches masquées par filtre restent masquées. Sans JavaScript, ouvrir manuellement les détails souhaités puis imprimer avec le navigateur.
- **Clavier** : Tab pour parcourir liens et commandes, Entrée/Espace pour ouvrir les détails, flèches pour les menus natifs. Le lien « Aller au contenu » apparaît au focus.

Le contenu statique reste lisible sans JavaScript ; seuls filtres, exports et recalculs sont désactivés. La mise en page prévoit mobile et impression.

## Limites des contrôles

Calculs, données, interactions simulées en Node/VM, liens et structure HTML vérifiés. **Aucun rendu visuel ni test dans un navigateur réel n’a pu être validé** : lancement local indisponible et ouverture des fichiers locaux refusée par le navigateur disponible. Mobile, clavier et impression sont prévus dans le code, sans certification d’accessibilité ni contrôle visuel revendiqué.

Aucun marché, besoin, partenaire, contrat, conformité charia, chaîne stablecoin ou rentabilité n’est validé. Les simulations C01 ne s’appliquent pas automatiquement à C02/C03. Aucune collecte ni opération financière possible ici.

## Reproduction

Depuis le dossier parent, avec Python 3, pandoc et Node.js : `python construire_html_j8.py`, puis `python verifier_html_j8.py` et `node verifier_j8.mjs`. Les moteurs historiques sont assemblés sans réécriture des formules. Les scripts de J1–J7 restent des contrôles datés, pas un état courant du programme.
