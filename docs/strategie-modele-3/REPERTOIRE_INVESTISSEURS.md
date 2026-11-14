# Répertoire J3 — dix points d’entrée

Recherche des **13–14 novembre 2026**. [Données détaillées avec statuts et provenance](data/investisseurs.json) · [Sources](SOURCES_J3.md) · [Deux voies prioritaires](data/voies-investisseurs.json).

Ce répertoire distingue une possibilité technique, une campagne distribuée et une souscription effective. Dix entrées ne sont pas dix apporteurs de capitaux indépendants : Anemoy/Centrifuge et EthisX/Ethis Malaysia ont des liens. Aucun mandat, référencement ou capital ETHIGONE acquis.

| Point d’entrée | Rôle principal | Pays / clientèle utiles au tri | Orientation documentaire |
| --- | --- | --- | --- |
| A01 · Centrifuge | Infrastructure et interface directe | Éligibilité par produit; fondation Caïmans ≠ pays du placement | Réserve technique |
| A02 · Anemoy | Gestion/émission institutionnelles | Fonds BVI, professionnels non-US examinés | Produits étudiés écartés |
| A03 · Base/Coinbase | Infrastructure | Aucune admission ETHIGONE par pays | Réserve technique |
| A04 · Polygon | Infrastructure | Éligibilité financière non déduite du réseau | Réserve technique |
| A05 · HAQQ/Ethiq | Écosystème et programmes | Pays et retail financier non établis | Réserve réseau |
| A06 · Lita/1001PACT | PSFP/distribution | France, particuliers admissibles | V02 conditionnelle |
| A07 · EthisX | ECF/P2P | Oman; France/UE et retail à vérifier | V01 conditionnelle |
| A08 · Qardus | Agent/portefeuille QFL | PME UK; HNW/sophisticated | Écart modèle et clientèle |
| A09 · Ethis Malaysia | ECF | Émetteurs locaux; résidence contradictoire | Réserve Malaisie |
| A10 · Lendahand | PSFP/distribution | Retail EEE; entreprises marchés émergents | Prêts à intérêts exclus |

## Tickets et coûts : comparaison, pas tarification ETHIGONE

| Acteur | Ticket investisseur observé | Frais documentés ou information manquante |
| --- | --- | --- |
| Centrifuge | Dépend du produit | Aucun devis émission/distribution ETHIGONE obtenu |
| Anemoy | JTRSY: 500 000 USD dans l’index, à reconfirmer | Entrée/sortie annoncées nulles pour ce produit seulement; coût total et prestation sur mesure inconnus |
| Base/Coinbase | Sans objet pour le réseau | Exécution L2, publication L1 et éventuels frais opérateur; autres services distincts |
| Polygon | Sans objet pour le réseau | Gas en POL; devis services et distribution inconnus |
| HAQQ/Ethiq | Aucun ticket retail établi | Aides aux développeurs distinctes d’une souscription à un lot |
| Lita France | Dès 100 EUR pour la plupart des campagnes, hors frais | Investisseur: 3,5% TTC sous 15 000 EUR, 2,5% de 15 000 à moins de 30 000 EUR, 1,5% au-delà. Entreprise: 2 000–3 000 EUR HT + 8% HT si réalisation |
| EthisX | Inconnu | Barème et payeurs inconnus; aucune valeur zéro supposée |
| Qardus | 5 000 GBP pour les offres examinées | Mémorandum par opération; pas de zéro inconditionnel |
| Ethis Malaysia | Inconnu; plafonds retail ≠ minimum | Deux barèmes contradictoires: applicable inconnu |
| Lendahand | 10 EUR et multiples | FAQ USD: 0,30% et 0,4% au remboursement coexistent; taux applicable inconnu |

Lita indique aussi 5% de suivi **inclus dans la souscription si capital via holding dédiée**; cette structure n’est pas adoptée. Ne pas additionner automatiquement cette ligne aux actions directes envisagées. Les assiettes, taxes, conditions et références exactes figurent dans [data/investisseurs.json](data/investisseurs.json). Aucune sortie ni rentabilité n’est garantie.

## A01 — Centrifuge

**PROPOSITION :** Réserve technique; ne pas compter comme distribution acquise. Accès direct documenté mais admission d’un produit PME et réseau de souscripteurs à établir.

**Accès concret :** Wallet individuel vers application; autre voie possible par dépositaire/distributeur omnibus. Le gestionnaire approuve classe et réseau.

**Entrée fonctionnelle :** Équipe émission/origination via page Contact; gestionnaire du produit pour onboarding investisseurs.

**Point à examiner :** Examiner droits représentés, propriété et risques, négociabilité des créances, wrappers et usages de lending; outil technique non certificat.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-S01](https://docs.centrifuge.io/user/investor/) · [J3-S02](https://docs.centrifuge.io/user/manager/launching-a-product/) · [J3-S03](https://docs.centrifuge.io/user/concepts/access-permissions/) · [J3-S04](https://centrifuge.io/contact) · [J3-S05](https://centrifuge.io/imprint) · [J3-S06](https://centrifuge.io/derwa-tokens) · [J3-S07](https://centrifuge.io/blog/coinbase-centrifuge) · [J3-S09](https://www.anemoy.io/funds/jtrsy)

## A02 — Anemoy

**PROPOSITION :** Comparateur institutionnel; produits étudiés écartés du cas ETHIGONE. JTRSY/CLO ne financent pas les opérations ciblées et ne constituent pas une solution charia adoptable.

**Accès concret :** Bouton Get Access; onboarding auprès du gestionnaire puis wallet/produit Centrifuge. Service de distribution institutionnelle annoncé.

**Entrée fonctionnelle :** Équipe solutions institutionnelles/émission; onboarding du fonds pour investisseurs.

**Point à examiner :** JTRSY à intérêts et stratégie CLO écartés comme instruments pour ce projet; aucune qualification générale de l’acteur.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-S08](https://www.anemoy.io/) · [J3-S09](https://www.anemoy.io/funds/jtrsy) · [J3-S10](https://www.anemoy.io/funds/jaaa) · [J3-S11](https://app.centrifuge.io/pool/281474976710662)

## A03 — Base / Coinbase

**PROPOSITION :** Réserve infrastructure et paiement. Base ne constitue pas un distributeur d’opérations ETHIGONE.

**Accès concret :** L’annonce deSPXA exclut expressément le rôle distributeur, courtier ou émetteur de Coinbase/Base pour ces tokens.

**Entrée fonctionnelle :** Documentation et équipes intégration Base; qualification émetteur chez Centrifuge via entrée origination si cette pile est examinée.

**Point à examiner :** Stablecoin, réserves, conversion, garde et contrat d’investissement non validés; aucune validation déduite de Base.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-S04](https://centrifuge.io/contact) · [J3-S07](https://centrifuge.io/blog/coinbase-centrifuge) · [J3-S12](https://docs.base.org/specifications/transactions/network-fees)

## A04 — Polygon

**PROPOSITION :** Réserve infrastructure. Écosystème et outils accessibles, aucune distribution à ETHIGONE acquise.

**Accès concret :** Entrée Talk to sales pour intégration; distributeurs des produits cités sont à distinguer du réseau.

**Entrée fonctionnelle :** Équipe entreprise/tokenisation via Get in touch de la page officielle.

**Point à examiner :** Tokeniser ne garantit ni conformité ni liquidité; droits et actifs doivent être examinés indépendamment.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-S13](https://polygon.technology/tokenization) · [J3-S14](https://docs.polygon.technology/pos/concepts/tokens/pol)

## A05 — HAQQ / Ethiq

**PROPOSITION :** Réserve réseau et partenaires à qualifier. Programmes développeurs, pas guichet de financement des lots industriels.

**Accès concret :** Zetl et HaqqPad encore Planned DeFi; Ethiq L2 annoncé lancé le 9 janvier 2026. Ne pas réutiliser une ancienne offre L1 comme service actif identique.

**Entrée fonctionnelle :** Équipe Ecosystem/Partnerships et comité; autorité charia pour nouveaux produits, fonctions distinctes.

**Point à examiner :** L’avis historique exclut les nouveaux produits/contrats; aucun transfert automatique à Ethiq, stablecoins ou ETHIGONE.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-S15](https://www.haqq.network/ecosystem) · [J3-S16](https://www.haqq.network/shariah-compliance-en) · [J3-S17](https://www.haqq.network/ecosystem-fund) · [J3-S18](https://www.haqq.network/blog/ethiq-is-live-ethereum-l2-for-liquidity-and-economic-alignment)

## A06 — Lita / 1001PACT

**PROPOSITION :** Voie prioritaire V02: actions d’une entreprise ciblée. Accès retail France et barème documentés; hypothèse actions directes à confirmer, sans imposer de holding.

**Accès concret :** Lita distribue les campagnes sélectionnées; souscription directe ou indirecte selon offre. Le wallet Mangopay est de monnaie électronique.

**Entrée fonctionnelle :** Équipe financement/analystes pour dossier; conformité pour pays et instrument; service investisseurs pour admission.

**Point à examiner :** Actions: audit activité, ratios, dettes et revenus, pacte, préférences, propriété et sorties; label impact ne remplace pas revue charia.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-S19](https://lita.co/fr/cgu) · [J3-S20](https://lita.co/fr/prix) · [J3-S21](https://lita.co/fr/investir-avec-lita) · [J3-S22](https://support.lita.co/fr/comment-lita-s%C3%A9lectionne-les-entreprises) · [J3-S24](https://www.amf-france.org/sites/institutionnel/files/pdf/73125/fr/1001Pact.pdf?1757139348=)

## A07 — EthisX

**PROPOSITION :** Voie prioritaire V01: opération commerciale ciblée. Correspondance fonctionnelle avec commandes/factures; pays, retail et coûts encore bloquants.

**Accès concret :** Campagne EthisX auprès de sa communauté après acceptation; aucun accord d’apport d’affaires ETHIGONE.

**Entrée fonctionnelle :** Entrée publique Contact; fonction financement P2P et conformité pays à solliciter lors d’une phase séparément autorisée.

**Point à examiner :** Positionnement charia déclaré; contrat, flux de propriété, créances, retards et stablecoins propres à chaque dossier à faire examiner.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-P01](https://ethisx.co/how-it-works-issuers) · [J3-P03](https://fsa.gov.om/home/SearchNews/39?newsId=10727) · [J3-P05](https://ethisx.co/contact-us) · [J3-P06](https://ethisx.co/faqs) · [J3-S25](https://ethisx.co/how-it-works-investors)

## A08 — Qardus

**PROPOSITION :** Réserve: écart de périmètre et de clientèle. UK, SPV/portefeuille et accès restreint; ne pas imposer cette structure au modèle 3.

**Accès concret :** Membre approuvé, qualification/KYC puis participation à l’offre présentée aux membres; Qardus agent.

**Entrée fonctionnelle :** Équipes financement PME et admission investisseurs, rôles distincts.

**Point à examiner :** Certification revendiquée par la plateforme; clause 5.9 sur intérêts conservables et chaîne Commodity Murabahah à rapprocher de l’avis applicable.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-P07](https://www.qardus.com/investing) · [J3-P08](https://www.qardus.com/terms-and-conditions) · [J3-P09](https://www.qardus.com/)

## A09 — Ethis Malaysia / Ethis Ventures

**PROPOSITION :** Réserve géographique et documentaire. Local Malaisie; contradictions non résolues; aucun déplacement de pays imposé.

**Accès concret :** Membre puis KYC, Investment Agreement; fonds détenus par trustee; nominee possible.

**Entrée fonctionnelle :** Équipe émetteurs et conformité ECF pour rapprochement des conditions.

**Point à examiner :** Offres voulues charia; examiner contrats de nominee, fonds en attente et traitement des intérêts éventuels, sans transférer une certification.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-P10](https://my.ethis.co/disclosure-statement) · [J3-P11](https://my.ethis.co/terms-and-conditions) · [J3-P13](https://www.sc.com.my/development/digital/digital-initiatives)

## A10 — Lendahand / Hands-on B.V.

**PROPOSITION :** Comparateur; offre actuelle exclue. Intérêts explicites incompatibles avec la contrainte du programme; aucun contournement proposé.

**Accès concret :** Plateforme distribue projets choisis; inscription, vérification identité/banque puis paiement en EUR.

**Entrée fonctionnelle :** Équipe Investment pour admission des entreprises; support pour investisseurs.

**Point à examiner :** Prêts à intérêts exclus comme instrument pour ETHIGONE en l’état, malgré accès retail européen.

Pays émetteur/investisseur, instrument, ticket, frais, processus et décisionnaire sont conservés champ par champ dans le [JSON du répertoire](data/investisseurs.json).

[J3-P14](https://www.lendahand.com/en-EU/funding) · [J3-P15](https://www.lendahand.com/en-EU/faq) · [J3-P16](https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/listes-blanches/psfp/hands-bv)
