# J4 — règles de calcul et mode d’emploi

Date de production : **15 novembre 2026**. Jalon nominal : 14 novembre. Statut des paramètres et résultats : **HYPOTHÈSE**. Ces trois opérations anonymisées ne proviennent d’aucune entreprise du répertoire J2. Aucun tarif, ticket, contrat, pays, véhicule ou partenariat n’est adopté.

Le [tableur modifiable](modele-economique-j4.xlsx), les [entrées JSON](data/operations-j4.json), les [résultats](data/resultats-j4.json) et le [moteur](calculer_j4.mjs) décrivent le même modèle. Les [expressions](data/formules-j4.json) sont communes aux formules XLSX et au calcul JavaScript. Le tableur est autonome après téléchargement. Il n’a ni macro, ni liaison à un autre classeur, ni appel réseau.

## Modifier et interpréter

Dans `Hypotheses!D4`, choisir 1 Base, 2 Perte, 3 Retard ou 4 Collecte. Les cellules jaunes sont modifiables. Les paramètres actifs de chaque scénario se trouvent au-dessus de ses quatre jeux d’entrées. Un seul calcul alimente `Synthese` et `Calculs`. Les erreurs d’entrée restent visibles ; elles ne deviennent pas des frais nuls. Le comparateur Lita est séparé du modèle principal.

Les jours J0 à J150 sont **relatifs à une opération fictive**, pas les dates du programme. Les trois colonnes représentent les trois lots, pas trois offres d’investissement. Les résultats sont avant impôt sur les bénéfices et avant fiscalité personnelle. Ce ne sont pas des marges nettes constatées.

| Cas | Hypothèse appliquée |
| --- | --- |
| Base | Prix budgété réalisé, client payé à J60, collecte complète. |
| Perte | Prix −10 %, perte définitive de 15 % du solde client TTC ; aucune récupération de TVA sur cette perte. Change EUR/USD −10 %, décote du stablecoin de 5 % à la conversion. |
| Retard | 40 % du solde recouvrable payé à J60, 60 % à J120. Soixante jours de stockage/gestion et de suivi ETHIGONE supplémentaires. Change −5 %, décote stablecoin 2 %. Aucun intérêt de retard. |
| Collecte | 80 % du capital EUR cible reçu ; aucun achat, vente ou acompte client exécuté. Capital reçu remboursé dans la simulation. Frais de conversion non remboursés. |

Les tableaux publiés dans les Markdown et le JSON sont des résultats datés de ces entrées, pas une deuxième feuille de prévision. Après modification, le XLSX recalcule ; pour mettre à jour le JSON, modifier les entrées JSON puis exécuter le générateur décrit plus bas.

## Quatre comptes séparés

**Opération.** Ventes HT moins achats consommés, logistique, contrôles, SAV payé, prestations opérateur, honoraires ETHIGONE, frais externes, TVA non déductible et pertes clients. Les frais externes sont des enveloppes hypothétiques **décaissées**, même lorsqu’on les appelle provisions pour devis : ce ne sont pas des provisions comptables sans paiement. Tous les biens sont livrés dans les quatre cas. Les invendus, dépréciations de stock et obligations SAV au-delà du budget ne sont pas chiffrés ici ; leur absence n’est pas une preuve de risque nul.

**Opérateur.** Résultat de sa prestation facturée moins son coût interne, plus sa part de bénéfice ou moins sa perte en capital. Son apport reste distinct du revenu de prestation. Le coût interne de la prestation n’est pas déduit une deuxième fois du résultat du lot. Les frais opérateur perdus en cas d’abandon sont montrés séparément.

**Investisseurs.** Capital souscrit, part de bénéfice ou perte de capital, frais personnels de conversion/réseau payés en plus. Le taux affiché dans le détail est un résultat simulé rapporté à la mise et aux frais, **non annualisé**. Le capital restitué n’est pas un revenu.

**ETHIGONE.** Honoraires HT facturés à l’opération moins instruction, refus, service investisseurs, abandons imputés, suivi du retard et quote-part des charges fixes. La facture ETHIGONE est une charge du lot et une recette d’ETHIGONE : on ne peut pas additionner tous les résultats sans éliminer cette relation et distinguer coûts internes/externes. Les encaissements TTC de prestations ne sont pas du bénéfice disponible ; les propres échéances fiscales et réserves de trésorerie des prestataires ne sont pas validées par ce modèle.

## Trésorerie, TVA et actifs

Le pic de financement est l’opposé du minimum des flux cumulés **hors capitaux**. L’apport opérateur est supposé disponible dès J0. Le besoin investisseurs est le pic moins cet apport, avec plancher zéro et arrondi au centime supérieur. Le capital reçu est comparé à la cible en centimes. Le scénario de perte ou de retard ne crée pas automatiquement une nouvelle souscription : tout dépassement du capital nominal apparaît en besoin complémentaire non financé et bloque la distribution simulée.

| Date relative | Flux et état |
| --- | --- |
| J0 | Capitaux, acompte client, achats et services initiaux payés ; la part fournisseur différée reste une dette. Le stock HT constitue un actif. |
| J30 | Livraison et facturation. Stock final nul par construction ; créance client à encaisser. |
| J45 | Paiement du solde TVA positif et de la dette fournisseur standard. |
| J60 | Encaissement de la fraction du solde client prévue au cas choisi. Créance brute et perte estimée sont distinctes. |
| J90 | Paiement fournisseur si l’alternative de délai après encaissement nominal a été sélectionnée. |
| J120 | Encaissement retardé et paiement des coûts du retard. |
| J150 | Remboursement hypothétique des crédits TVA puis clôture avant partage. |

TVA : taux biens, services et ventes séparés, récupération modifiable. Les valeurs de 20 %, la déductibilité et les dates de paiement/remboursement sont **des conventions**, pas une position fiscale. La TVA sur marge des biens d’occasion, les acomptes, les prestations financières exonérées ou taxées et les régimes applicables aux opérateurs restent **À VÉRIFIER**. Le crédit TVA n’est encaissé qu’à J150. Une fraction non récupérable devient une charge. Le modèle ne déduit pas un régime français applicable d’un taux choisi pour le calcul.

Les achats sont tous libellés en EUR. Aucun import ni droit de douane n’est présumé. Une opération réelle en devise ou à l’import imposerait d’ajouter ses devis logistiques, droits et calendrier fiscal avant validation.

À la clôture, `cash final = capitaux engagés + résultat opération`. En cas de perte supérieure au capital, un passif non couvert apparaît. À J60, le cash et la créance nette estimée sont affichés séparément. Une créance n’autorise pas une sortie en espèces. La valeur de recouvrement reste hypothétique.

## Partage et arrondis

La simulation affecte 60 % du bénéfice positif aux investisseurs et le reliquat à l’opérateur. Les pertes ordinaires en capital sont réparties au prorata des apports ; les arrondis résiduels sont affectés à l’opérateur. Les pertes ne sont jamais ajoutées une deuxième fois après avoir réduit le résultat. Les capitaux restituables sont limités au solde économique, et les versements sont bloqués si un manque de cash subsiste.

**À VÉRIFIER :** nature du contrat, propriété effective des biens, risque supporté, mandat, rémunération de prestation avec participation au bénéfice, responsabilité pour faute, droits des souscripteurs, recouvrement et traitement fiscal. Cette règle pédagogique n’est ni un contrat signé ni une certification charia. Aucun remboursement, rendement ou délai de sortie n’est garanti.

Pour compter les participants, `N = plafond(capital cible / ticket indicatif)`. Le capital est ensuite réparti en souscriptions presque égales : montant au centime inférieur pour N−1 participants et ajustement sur le dernier. Le ticket indicatif sert au calcul du nombre ; ce n’est pas un minimum individuel. Le seuil présenté est un **ticket moyen économique arrondi au centime supérieur**, sous cette convention. Il ne constitue pas une règle commerciale d’admission.

## Coût des refus, abandons et seuils

Avec acceptation `a = 40 %`, le modèle impute `(1−a)/a = 1,5` refus par accepté, soit 225 EUR à 150 EUR par refus. Instruction accepté : 600 EUR. Service par investisseur : 12 EUR d’entrée et 18 EUR de suivi. Avec succès de collecte `q = 80 %`, il faut imputer 0,25 abandon par collecte aboutie.

Coût d’un abandon : `600 + 225 + 250 + N × (12 + 3)`. Les 250 EUR et 3 EUR par participant sont des frais externes irrécouvrables ; ils sont **déjà inclus** dans ce coût. Les coûts des cohortes abandonnées utilisent par hypothèse le même nombre cible de participants ; ce n’est pas un nombre observé.

En base, coût ETHIGONE par opération aboutie : `1 593,75 + 33,75 × N`, dont 500 EUR de charges fixes mensuelles réparties sur six opérations. D’où :

- `Nmax = plancher((honoraires − coût hors participants) / coût marginal complet)`, avec plancher zéro ;
- ticket moyen minimum = capital cible / Nmax, arrondi vers le haut ; si Nmax < 1, aucun seuil fini ;
- honoraires d’équilibre = coûts directs + refus + abandons imputés + charges fixes réparties ;
- opérations mensuelles d’équilibre = plafond(charges fixes / contribution avant charges fixes), seulement si cette contribution est positive.

Ces seuils décrivent une **opération aboutie** même quand le sélecteur affiche un abandon. Ils ne rendent pas une collecte abandonnée rentable. Les cas sans aucun dossier accepté ou sans aucune collecte aboutie rendent le coût par succès indéfini : `a=0` et `q=0` sont refusés, sans transformer leurs dépenses de période en zéro. Aucun portefeuille complet sans succès n’est chiffré ici.

Le seuil de prix de vente conserve les frais au montant du budget contractuel hypothétique. Il tient compte de la perte TTC sur le solde après acompte. Il ne réévalue pas automatiquement les honoraires en fonction de ce nouveau prix. À coefficient de recouvrement non positif, le seuil est indisponible.

## Sous-collecte et stablecoins

Les sommes EUR reçues avant exécution restent dans un **compte de collecte distinct modélisé**, pas dans le cash du lot. Aucun prestataire, compte ou mécanisme de ségrégation réel n’est acquis. À 80 %, elles ne financent pas l’achat. Le remboursement intégral du montant EUR reçu suppose que les frais d’abandon soient payés par une trésorerie ETHIGONE séparée, **dont l’existence n’est pas prouvée**. Les frais de conversion déjà payés par les investisseurs restent perdus. Le modèle ne promet pas une conversion inverse en stablecoins.

La moitié du capital est supposée arriver après conversion d’un stablecoin USD vers EUR. La provision de conversion est 0,8 % du brut, plus 2 EUR par conversion. Le nombre de conversions est estimé par plafond de N × 50 %, sous hypothèse de tickets homogènes. Change, décote et frais sont séparés. Une baisse du change ou un décrochage augmente le nombre d’unités nécessaires pour fournir le capital EUR demandé ; sans complément, il faut tester la collecte insuffisante. Ni stablecoin, ni chaîne, ni prestataire, ni frais exacts, ni accès retail n’est validé. Le coût réseau seul ne représente pas le coût du service.

Le résultat investisseurs est mesuré en EUR après conversion d’entrée. Il n’inclut pas la variation patrimoniale d’un solde de stablecoins détenu auparavant : cette exposition est montrée par les unités nécessaires, pas ajoutée arbitrairement au résultat du lot. Une mesure du résultat dans la devise d’origine exigerait les dates et coûts réels d’entrée et de sortie.

## Reproduire et transmettre à J7

Avec Node.js, depuis ce dossier :

```sh
node generer_resultats_j4.mjs
node test_calculs_j4.mjs
python verifier_xlsx_j4.py
python verifier_j4.py
```

Le générateur écrit 12 résultats de scénarios, 18 variantes et trois comparateurs. `calculer_j4.mjs` est pur, sans entrée/sortie réseau. Pour les HTML J7, embarquer les données et les expressions dans les fichiers, avec le même évaluateur ; ne pas remplacer cela par un `fetch`, un import distant ou des valeurs codées indépendamment. Les exemples de tests servent de références de calcul.

Le [constructeur XLSX](construire_tableur_j4.mjs) utilise `@oai/artifact-tool` : lui passer ce dossier puis un dossier de sortie. Cette dépendance est requise pour reconstruire le fichier, pas pour l’ouvrir ou utiliser les données/moteur autonomes. Les [preuves du tableur](preuves/j4-tableur.json) distinguent contrôle des formules, rendu statique et recalcul par LibreOffice. Aucune revue d’agent ne remplace l’avis d’un professionnel.
