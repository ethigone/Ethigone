# J4 — trois opérations et économie des trois parties

**15 novembre 2026 — J4 réalisé, jalon nominal du 14.** Modèle 3 DÉCIDÉ, aucune niche adoptée. Trois opérations anonymisées, quatre scénarios et un [tableur modifiable](modele-economique-j4.xlsx) sont livrés. [Méthode et formules](MODELE_CALCULS_J4.md), [sources](SOURCES_J4.md), [données et résultats réutilisables](data/resultats-j4.json).

**Découverte utile : avec un ticket indicatif de 500 EUR, les trois lots sont bénéficiaires dans le cas de base, mais ETHIGONE est déficitaire après coûts complets.** Augmenter simplement le nombre de petits dossiers ne corrige pas une contribution négative. Les seuils ci-dessous découlent des hypothèses ; ils ne sont ni des prix adoptés ni une preuve de demande.

## Base : tout chiffre est une HYPOTHÈSE

Les prix d’achat, prix de vente, frais, commandes, acomptes et apports sont inventés pour tester le modèle. Ils ne décrivent aucune entreprise J2. Les résultats sont avant impôt sur les bénéfices et fiscalité personnelle. Montants EUR.

| Indicateur | N01 Filtration | N02 Emballages | N03 PC reconditionnés |
| --- | ---: | ---: | ---: |
| Ventes HT | 36 000,00 | 60 000,00 | 45 000,00 |
| Coûts du lot, honoraires compris | 29 880,00 | 50 550,00 | 38 850,00 |
| Résultat du lot avant partage | 6 120,00 | 9 450,00 | 6 150,00 |
| Pic de financement total | 28 440,00 | 40 950,00 | 42 450,00 |
| Capital investisseurs cible, après apport opérateur | 22 440,00 | 32 950,00 | 35 450,00 |
| Résultat opérateur, prestation et capital | 2 748,00 | 4 180,00 | 2 860,00 |
| Résultat investisseurs après frais de conversion | 3 535,52 | 5 471,14 | 3 475,06 |
| Résultat ETHIGONE avec coûts complets | -1 132,50 | -1 121,25 | -1 740,00 |
| Ticket moyen économique minimum calculé | 2 040,00 | 1 029,69 | 1 865,79 |
| Honoraires HT nécessaires au ticket testé de 500 EUR | 3 112,50 | 3 821,25 | 3 990,00 |

Les résultats des trois parties ne doivent pas être additionnés au résultat du lot : le bénéfice du lot est déjà partagé, et les prestations opérateur/ETHIGONE sont déjà des charges du lot. Le capital remboursé n’est pas un bénéfice.

Le ticket indicatif de 500 EUR conduit à **45 / 66 / 71 participants**. Les seuils économiques correspondent à **11 / 32 / 19 participants maximum**, avec une répartition presque égale et un dernier ajustement au centime. Au seuil, ETHIGONE conserve seulement **15 / 26,25 / 15 EUR par opération**, après quote-part de charges fixes. Sous ces hypothèses, six opérations abouties par mois couvrent 3 000 EUR de charges fixes. Au ticket testé de 500 EUR, aucun volume fini n’équilibre le modèle à coûts unitaires inchangés. Aucune de ces cadences n’est validée commercialement.

**RISQUE :** le seuil n’offre pratiquement aucune marge d’erreur. Dans le scénario de retard, il monte à 5 610 / 1 318 / 2 954,17 EUR. Les coûts de dossier et de distribution doivent être chiffrés réellement avant toute conclusion. Le seuil plus bas de N02 dans cette simulation ne choisit pas la niche.

## Pertes, retard et collecte insuffisante

| Cas et mesure EUR | N01 | N02 | N03 |
| --- | ---: | ---: | ---: |
| Perte : résultat du lot | -2 016,00 | -3 030,00 | -4 830,00 |
| Perte : résultat investisseurs après conversion | -1 727,16 | -2 636,92 | -4 248,47 |
| Retard : résultat du lot | 5 400,00 | 8 370,00 | 4 950,00 |
| Retard : créance nette à J60, non encaissée | 20 736,00 | 30 240,00 | 29 160,00 |
| Collecte 80 % : capital EUR reçu à restituer | 17 952,00 | 26 360,00 | 28 360,00 |
| Collecte 80 % : résultat ETHIGONE | -2 250,00 | -2 565,00 | -2 640,00 |
| Collecte 80 % : frais externes à financer hors capital | 385,00 | 448,00 | 463,00 |

La baisse de prix de 10 % et la perte de 15 % du solde client TTC effacent le bénéfice des trois lots. Aucun bénéfice n’est distribué dans ces cas. Les pertes en capital sont réparties selon la règle hypothétique détaillée dans la méthode, sans validation contractuelle ou charia.

Le retard conserve une créance, ajoute du stockage/gestion et du suivi investisseurs, et décale réellement les encaissements. Une valeur de créance n’est pas du cash disponible. Les capitaux initiaux ne sont pas augmentés automatiquement si un incident crée un besoin supplémentaire.

À 80 % de collecte, l’opération ne part pas. Le capital EUR reçu reste hors du compte du lot et est remboursé dans la simulation ; les coûts irrécouvrables sont portés par ETHIGONE, avec une réserve de trésorerie **non prouvée**. Les frais externes de la dernière ligne sont inclus dans la perte ETHIGONE, pas à déduire une seconde fois. La conversion préalable peut laisser l’investisseur en perte même sans exécution. Aucun remboursement réel ou en stablecoin n’est promis.

## Alternatives : raison de préférer ETHIGONE encore à prouver

Montant du capital investisseurs nécessaire, en conservant les autres coûts du modèle pour isoler l’effet du financement :

| Variante HYPOTHÈSE | N01 EUR | N02 EUR | N03 EUR |
| --- | ---: | ---: | ---: |
| Base | 22 440,00 | 32 950,00 | 35 450,00 |
| Acompte client 40 % | 13 800,00 | 25 750,00 | 19 250,00 |
| 75 % achat différé, fournisseur payé J45 | 22 440,00 | 32 950,00 | 35 450,00 |
| 75 % achat différé, fournisseur payé J90 | 840,00 | 0,00 | 8 450,00 |
| Apport opérateur doublé | 16 440,00 | 24 950,00 | 28 450,00 |

Un crédit fournisseur réglé avant le client ne réduit pas le pic. Après le client, il le réduit fortement ; dans N02 il peut supprimer le besoin d’investisseurs sous les seules hypothèses retenues. Aucun de ces délais, acomptes ou apports n’est accessible ou conforme à la charia par défaut. Le cas sans investisseur conserve artificiellement les mêmes honoraires pour comparer les besoins : son résultat ETHIGONE ne justifie pas de facturer une collecte devenue inutile.

L’accès direct à une plateforme constitue aussi une alternative à tester. Le [comparateur Lita](SOURCES_J4.md) reste séparé : frais entreprise de 3 795,20–4 795,20 EUR HT, 4 636–5 636 EUR HT et 4 836–5 836 EUR HT pour les trois bases de collecte. Il ne s’ajoute pas automatiquement aux frais ETHIGONE et ne transforme pas une levée en actions en contrat court sur un lot. EthisX reste sans barème complet vérifié.

**PROPOSITION pour les vérifications futures :** ETHIGONE ne se justifie que si un opérateur dispose d’une commande prouvée et d’un bénéfice après tous les frais, n’obtient pas une solution ordinaire plus pertinente, et valorise une sélection/documentation/suivi que les investisseurs sont disposés à financer. Ni ce besoin ni cette volonté de payer ne sont démontrés. Abaisser les coûts par des dossiers homogènes et un service réellement chiffré doit être comparé à augmenter le ticket, sans présumer l’une ou l’autre solution.

## Vérifications et suite

Les [tests](preuves/j4-calculs.json) comprennent 177 contrôles et 15 valeurs de référence calculées indépendamment. Le [contrôle du tableur](preuves/j4-tableur.json) rapproche 1 596 valeurs/formules dans le moteur de création, teste les changements d’entrées et les cellules manquantes, puis 1 368 valeurs après recalcul des quatre scénarios dans LibreOffice Calc. Six plages des quatre feuilles ont été rendues et relues. Aucune erreur de formule détectée dans l’état livré ; aucun test visuel de navigateur n’est revendiqué pour J4.

Un agent gpt-6.1-sol a effectivement relu la logique et réalisé des contre-calculs, sans sous-délégation. Le coordinateur a intégré et testé les corrections d’arrondis et de comparaison en centimes. Cette revue ne vaut pas avis professionnel.

**À VÉRIFIER :** devis opérateurs et prestataires, besoin et commande, pays/éligibilité, instrument et contrats, propriété/risque, régime TVA et fiscalité, revue charia complète, accès effectif aux investisseurs et chaîne stablecoins. Aucun partenariat, financement ou conformité acquis.

**Prochain lot J5 :** parcours, responsabilités et questions contractuelles précises. J6 reste à faire. Fin inchangée au 17 novembre : J7 doit produire les HTML hors ligne avec les données réellement obtenues et signaler tout manque, puis arrêter. Aucun contact ni mouvement d’argent effectué.
