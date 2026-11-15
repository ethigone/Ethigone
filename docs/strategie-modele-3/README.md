# ETHIGONE — Modèle économique et recherche d'opérateurs

**Décision du 11 novembre 2026 : modèle 3, entreprises et opérations ciblées, participation accessible aux particuliers éligibles, notamment détenteurs de stablecoins.**

Ce dossier contient un travail de recherche et des simulations. Il ne présente aucune offre d'investissement. Les laveries étaient l'exemple fictif du prototype ; ni ce secteur ni l'importation ne constituent une spécialisation décidée.

## Programme autorisé

Sept passages bornés, du 11 au 17 novembre 2026 : [plan détaillé](PLAN_7_JOURS.md). Le premier passage est exécuté lors du lancement, les six suivants sont prévus le matin. La date indique un jalon ; seul le [checkpoint](CHECKPOINT.md) indique le travail réellement vérifié.

| Document | Utilité |
| --- | --- |
| [J4_ECONOMIE.md](J4_ECONOMIE.md) | Trois opérations, scénarios, économie des trois parties et seuils conditionnels. |
| [modele-economique-j4.xlsx](modele-economique-j4.xlsx) | Tableur modifiable, quatre scénarios, formules et comparateur distinct. |
| [MODELE_CALCULS_J4.md](MODELE_CALCULS_J4.md) | Hypothèses, cash/TVA/actifs, partage, coûts des refus et mode d’emploi. |
| [SOURCES_J4.md](SOURCES_J4.md) | Deux pages primaires relues et registre des hypothèses ; [JSON](data/sources-j4.json). |
| [data/operations-j4.json](data/operations-j4.json) | Entrées réutilisables ; [résultats](data/resultats-j4.json) et [expressions](data/formules-j4.json). |
| [calculer_j4.mjs](calculer_j4.mjs) | Moteur autonome pour J7, sans réseau ; [générateur](generer_resultats_j4.mjs) et [tests](test_calculs_j4.mjs). |
| [preuves/j4-verification.json](preuves/j4-verification.json) | Contrôle courant via [verifier_j4.py](verifier_j4.py), [preuves calculs](preuves/j4-calculs.json) et [tableur](preuves/j4-tableur.json). |
| [J3_ACCES_INVESTISSEURS.md](J3_ACCES_INVESTISSEURS.md) | Dix points d’entrée, deux voies conditionnelles et obstacles d’accès réels. |
| [REPERTOIRE_INVESTISSEURS.md](REPERTOIRE_INVESTISSEURS.md) | Rôles et points d’entrée; fiches pays/tickets/frais dans [data/investisseurs.json](data/investisseurs.json). |
| [SOURCES_J3.md](SOURCES_J3.md) | Sources primaires, dates et limites; registre [JSON](data/sources-j3.json). |
| [data/voies-investisseurs.json](data/voies-investisseurs.json) | V01 EthisX, V02 Lita: conditions, critères d’arrêt, coûts à transmettre à J4. |
| [preuves/j3-verification.json](preuves/j3-verification.json) | Contrôles historiques J3 via [verifier_j3.py](verifier_j3.py). |
| [J2_ENTREPRISES.md](J2_ENTREPRISES.md) | Synthèse J2: 17 fiches après regroupement, chemins de repérage, priorités documentaires et alternatives. |
| [REPERTOIRE_ENTREPRISES.md](REPERTOIRE_ENTREPRISES.md) | Identité à rapprocher, opération hypothétique, risques et pièces manquantes par fiche. |
| [data/entreprises.json](data/entreprises.json) | Données dédoublonnées réutilisables dans les HTML J7. |
| [SOURCES_J2.md](SOURCES_J2.md) | 45 références datées avec limites; registre [JSON](data/sources-j2.json). |
| [data/reperage.json](data/reperage.json) | Six chemins de recherche, rapprochements et exclusions documentaires. |
| [preuves/j2-verification.json](preuves/j2-verification.json) | Contrôles du lot J2 via [verifier_j2.py](verifier_j2.py). |
| [J1_DOMAINES.md](J1_DOMAINES.md) | Comparaison des niches et présélection pour investigation, sans décision de financement. |
| [data/niches.json](data/niches.json) | Fiches structurées réutilisables pour les comparaisons interactives de J7. |
| [METHODE_VALIDATION.md](METHODE_VALIDATION.md) | Preuves attendues, alternatives à comparer et critères d'arrêt. |
| [data/sources-transversales.json](data/sources-transversales.json) | Sources primaires et limites des constats généraux. |
| [data/sprint.json](data/sprint.json) | Dates et état vérifié des lots. |
| [preuves/j1-verification.json](preuves/j1-verification.json) | Contrôles de cohérence et de publication documentaire de J1. |

J1 à J4 sont livrés; les livrables de J5 et J6 restent à produire. À J7, un sous-dossier `html/` rassemblera un index de navigation, la comparaison des niches, le répertoire sourcé, les voies d'accès aux investisseurs, le simulateur économique et le parcours opérationnel. Ces HTML devront fonctionner localement sans dépendance à un serveur ni envoi de données à un tiers. Ils ne sont pas encore livrés à J4. Le retard ne prolonge pas le programme au-delà du 17 novembre.

## Lire les conclusions correctement

- **DÉCIDÉ** : le modèle 3 et ce programme de sept passages.
- **CONFIRMÉ** : un fait étayé, dans les limites et à la date de sa source.
- **HYPOTHÈSE** : besoin de financement, préférence client ou donnée de simulation non prouvés.
- **PROPOSITION** : choix recommandé mais non adopté.
- **RISQUE / À VÉRIFIER** : obstacle ou information qui exige un contrôle complémentaire.
- **REJETÉ** : option abandonnée par décision explicite. Une piste mise en réserve pour ce sprint n'est pas automatiquement rejetée.

Les entreprises citées servent au repérage ou à la comparaison. Elles ne sont ni partenaires, ni demandeuses de financement confirmées. Aucun contact, achat, collecte, transfert d'actifs ou avis professionnel n'est inclus dans ce travail. La charia est non négociable ; aucun contrat, ratio, stablecoin ou montage n'est certifié par ces documents.

Le dépôt est public : seules les sources publiques, les hypothèses et les simulations destinées à être partagées y sont conservées. Les coordonnées personnelles, documents commerciaux confidentiels, accès techniques et identifiants du Site privé en sont exclus.
