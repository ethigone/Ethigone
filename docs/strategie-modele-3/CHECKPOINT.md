# État de reprise — Modèle 3

Date : **15 novembre 2026**. J4, prévu le 14, réalisé. [Programme](PLAN_7_JOURS.md) inchangé, fin le **17 novembre**, sans prolongation automatique.

## Terminé

- **J1** : six niches comparées. N01 filtration standard non critique, N02 emballages simples sur commande et N03 PC reconditionnés commandés restent PROPOSITIONS ; aucune niche adoptée.
- **J2** : 17 fiches après regroupement de 18 entrées, répartition 6/6/5. Ecubel E16 fusionnée sous E17/ITJustGood/Digitalea, groupe ATF déclaré. Besoin, commande, intérêt et marge non vérifiés.
- **J3** : dix points d’entrée, 38 sources primaires et deux voies PROPOSITIONS conditionnelles : EthisX pour opérations commerciales et Lita pour actions d’entreprise ciblée. Zéro voie ETHIGONE entièrement validée. Aucun accord, capital ou véhicule acquis. Les limites d’accès, barèmes contradictoires et archives restent documentés dans les fichiers J3, préservés.
- **J4** : [trois simulations anonymisées](J4_ECONOMIE.md), [tableur modifiable](modele-economique-j4.xlsx), [règles de calcul](MODELE_CALCULS_J4.md), 12 résultats de scénarios, 18 variantes et trois comparateurs. Entrées, résultats et expressions JSON sauvegardés pour J7. Toutes les valeurs économiques du modèle sont HYPOTHÈSES, sans attribution aux entreprises J2.

## Résultats J4 à conserver

Au ticket indicatif de 500 EUR, les besoins investisseurs sont 22 440 / 32 950 / 35 450 EUR. Le résultat des lots est 6 120 / 9 450 / 6 150 EUR avant impôt ; ETHIGONE perd 1 132,50 / 1 121,25 / 1 740 EUR après coûts complets. Ce bénéfice de lot n’est ni une marge constatée ni une garantie.

Tickets moyens économiques calculés : 2 040 / 1 029,69 / 1 865,79 EUR, soit au maximum 11 / 32 / 19 participants. Aucun ticket adopté. La répartition au centime distingue souscription régulière et dernier ajustement. Au seuil, la marge ETHIGONE reste seulement 15 / 26,25 / 15 EUR par lot, sous hypothèse de six opérations abouties mensuelles. Au ticket testé de 500 EUR, la contribution avant charges fixes est négative : aucun volume fini n’équilibre ces coûts inchangés.

Perte : prix −10 % et défaut de 15 % du solde TTC rendent les trois lots déficitaires. Retard : encaissement partiel réellement décalé de J60 à J120, frais de stockage/gestion et de suivi supplémentaires, aucun intérêt. Sous-collecte 80 % : pas d’achat, pas d’acompte client ; remboursement du capital EUR reçu hors cash du lot, frais irrécouvrables à financer par ETHIGONE dont la trésorerie disponible n’est pas prouvée. Les frais de conversion restent perdus pour l’investisseur.

Le crédit fournisseur payé J45 ne réduit pas le pic avant encaissement client J60. Payé J90, il réduit fortement le besoin et peut le supprimer dans l’exemple N02. Acompte 40 %, apport opérateur doublé et accès direct à plateforme sont comparés sans accès ni conformité présumés. Il reste à prouver pourquoi ETHIGONE serait préférable.

TVA à 20 %, déductibilité et dates sont des conventions séparées, pas un régime validé ; PC d’occasion notamment à examiner. Achats en EUR, aucun import imposé. Stablecoin USD converti avant collecte : change/décote/unités et provisions de frais explicites, aucune chaîne ou voie native validée. Les résultats investisseurs en EUR ne chiffrent pas la variation patrimoniale d’un solde de stablecoins antérieur.

Lita France : deux pages primaires relues le 15. Barème seulement comparateur séparé, aucun cumul automatique avec ETHIGONE ; frais investisseurs ajoutés TTC, entreprise HT, ligne holding exclue. EthisX et devis externes restent inconnus, sans remplacement par un coût réel nul. Les prestations, partage de bénéfice et pertes exigent une revue juridique/charia du contrat et de la chaîne complète.

## Contrôles réalisés

[verifier_j4.py](verifier_j4.py) est le contrôle courant. [Preuve générale](preuves/j4-verification.json), [calculs](preuves/j4-calculs.json), [tableur](preuves/j4-tableur.json). 177 contrôles du moteur, 15 valeurs de référence indépendantes ; 1 596 comparaisons dans le moteur XLSX, changement de cas et d’entrée, champ manquant actif/inactif. Quatre scénarios recalculés par LibreOffice Calc : 1 368 valeurs concordantes. Six plages des quatre feuilles rendues et relues ; aucune erreur de formule dans l’état livré. Aucun test visuel de navigateur revendiqué.

Un agent **gpt-6.1-sol** effectivement appelé pour logique et contre-calculs, sans sous-délégation. Le coordinateur a intégré les corrections : pic financé au centime supérieur, cible et collecte comparées en centimes. Aucun ancien agent relancé, aucun Astra. Ces contrôles ne valent ni avis professionnel ni certification. Les scripts et preuves J1–J3 restent historiques et ne sont pas réécrits.

## Prochain passage et fin

**J5 prochain**, parcours et responsabilités : candidature, sélection, information, éligibilité, contrats, flux, suivi, incident et sortie. J5 et J6 restent à faire. Le décalage d’un passage est explicite. **Le 17 novembre, J7 doit livrer les HTML hors ligne avec l’état réel, même si J5/J6 restent incomplets, puis arrêter.** Ne pas retarder J7 au-delà de cette fin ni déclarer un lot réalisé sur la seule base de sa date.

## Sauvegarde et périmètre

Source durable : `ethigone/Ethigone`, branche `main`, dossier `docs/strategie-modele-3`. Base distante J4 : `34fad62efc1f42798aa0e40017aedcb13452c48e`, arbre `16b8f20463c4af9d0bdf80d149428ae1f5e4e2ce`. Les 26 fichiers du dossier à cette base ont été rapprochés de leurs blobs distants avant copie isolée. Le commit contenant ce checkpoint est identifiable dans l’historique ; vérifier la tête et les empreintes après publication.

Aucun contact, compte créé, collecte, transaction, wallet, achat ou service payant. Aucun changement de l’application, du Site, des anciens sprints, du déploiement ou de l’hébergement ; aucun GitHub Pages activé. Aucun document confidentiel, coordonnée personnelle, secret ou identifiant privé publié. Préserver les autres fichiers et toute modification parallèle ; aucune mise à jour forcée.
