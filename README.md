# ETHIGONE

**Comprendre une activité réelle, envisager d’y participer et suivre ses résultats.**

ETHIGONE vise d’abord une personne qui possède des stablecoins. Le parcours envisagé est simple : découvrir un projet compréhensible, examiner ses conditions et ses risques, connecter son wallet, participer à un pool puis suivre sa part des résultats.

Ce dépôt contient le **prototype de démonstration construit jusqu’au 9 novembre 2026**. Il utilise un seul projet fictif de location de matériel, **Atelier Lavage — EQ-001**. Les participations et les distributions de la démonstration sont exprimées en euros fictifs. Aucun investissement réel n’est proposé par cette application.

## Les trois documents de référence

| Document | Utilité |
| --- | --- |
| [README.md](README.md) | Comprendre ETHIGONE, son objectif, ses principes et l’exemple présenté. |
| [README_SITE.md](README_SITE.md) | Comprendre le site, ses écrans, son code, sa base de données et ses vérifications. |
| [README_PISTES.md](README_PISTES.md) | Voir le travail restant, les blocages et les pistes avant un pilote réel. |

Les tests reproductibles sont dans [tests](tests/). Les références documentaires publiques sont dans [preuves](preuves/). Les journaux internes et les informations du déploiement privé sont conservés séparément par le propriétaire.

## Le problème étudié

Un investisseur doit pouvoir comprendre ce qui est financé, qui exploite les actifs, comment les recettes et les coûts sont établis, quelles pertes sont possibles et dans quelles conditions une sortie peut être envisagée.

ETHIGONE cherche à rendre ces éléments lisibles et traçables. La demande des investisseurs, le besoin d’un opérateur réel et la viabilité du montage restent à démontrer sur un dossier concret. La construction du prototype ne constitue pas une validation commerciale.

L’import/export fait partie de l’historique du projet. Le sprint a retenu la location de matériel comme exemple de démonstration ; ce choix ne valide pas un marché ni un opérateur pour le pilote.

## Les rôles envisagés

| Acteur | Rôle à examiner sur un dossier réel |
| --- | --- |
| Investisseur | Examiner le dossier et ses risques, puis participer selon les conditions applicables. |
| Opérateur | Exploiter l’activité, entretenir les équipements, justifier les flux et signaler les incidents. |
| ETHIGONE | Présenter le dossier, organiser le parcours et le suivi. Ses responsabilités et son statut restent à définir. |
| Infrastructure crypto | Fournir les fonctions techniques retenues pour le pool. Centrifuge est une piste technique étudiée. |
| Professionnels externes | Examiner l’activité, les contrats, la comptabilité, le cadre juridique et la conformité charia. |

**Aucun accord avec Centrifuge, Anemoy ou un opérateur n’est acquis.** HomeCycle est une piste historique, pas un partenaire validé. Un test technique ne crée aucun partenariat.

## L’exemple fictif Atelier Lavage

Le dossier représente la location de douze lave-linge. Ses hypothèses pédagogiques sont archivées sous la version `EQ-001-J3`.

| Hypothèse | Valeur fictive |
| --- | ---: |
| Machines | 12 × 1 500 € = 18 000 € |
| Trésorerie initiale | 6 000 € |
| Capital de référence | 24 000 € |
| Apport de référence des investisseurs | 19 200 € |
| Apport de référence de l’opérateur | 4 800 € |
| Partage illustratif du bénéfice | 80 % investisseurs / 20 % opérateur |
| Frais ETHIGONE sur les douze mois illustrés | 300 €, comptés une seule fois |
| Horizon indicatif | 36 mois, sans sortie garantie |

La perte ordinaire est répartie dans le modèle selon les apports. Les responsabilités en cas de faute, négligence ou manquement demandent des contrats et un examen professionnel. Ces ratios et frais ne sont pas des conditions commerciales adoptées pour un produit réel.

Trois scénarios distinguent résultat économique et argent disponible :

| Situation initiale | Résultat | Trésorerie | Créances | Plafond de distribution simulée |
| --- | ---: | ---: | ---: | ---: |
| Bénéfice | +2 700 € | 11 700 € | 0 € | 2 700 € |
| Perte | −7 300 € | 2 700 € | 0 € | 0 € |
| Retard | +2 700 € | 2 700 € | 9 000 € | 0 € |

Les chiffres proviennent du [moteur économique partagé](src/economie/demo.ts). Le versement réel autorisé par la démonstration reste **zéro**.

## Principes non négociables

- La conformité charia doit être examinée sur l’ensemble de l’activité et des contrats. La Musharaka est une base de conception à étudier, pas une certification acquise.
- Aucun rendement, remboursement du capital ou délai de sortie n’est garanti.
- L’USDC envisagé, les ratios et la chaîne complète ne sont pas certifiés.
- Les données fictives, les hypothèses, les preuves techniques et les décisions restent identifiables.
- Les revues d’agents sont préparatoires et ne remplacent aucun avis professionnel.

## Ce que le prototype permet de montrer

Découverte du projet, conditions, participation fictive, confirmation, reçu, portefeuille, suivi, administration des opérations et distributions simulées, assistance et candidatures. Les données applicatives sont persistantes côté serveur et les espaces utilisent la même base.

La page `/presentation` fournit un scénario de cinq minutes. L’accès au Site existant reste privé ; disposer des sources ne donne pas accès aux données de ses comptes.

La branche Centrifuge lit un **pool testnet externe**, distinct d’Atelier Lavage. Le prototype n’a pas démontré une participation blockchain réelle. Les contrôles wallet utilisent un fournisseur simulé.

## État et suite

Le sprint de dix passages est terminé. La prochaine étape utile consiste à traiter les vérifications ouvertes et à qualifier un dossier opérationnel réel avant une nouvelle phase technique. Les priorités et preuves attendues figurent dans [README_PISTES.md](README_PISTES.md).

## Licence

Les contributions propres à ETHIGONE sont couvertes par une [notice de droits réservés](LICENSE). Ce choix n’accorde pas une licence open source. Les composants tiers conservent leurs licences : voir [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
