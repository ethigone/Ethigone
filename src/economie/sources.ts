// Références consultées le 2 novembre 2026. Elles ne valident pas ETHIGONE.
export const dateRevue = "2 novembre 2026";
export const sourcesJ3 = [
  {
    id: "bnm", titre: "Bank Negara Malaysia · Musyarakah (20 avril 2015)",
    url: "https://www.bnm.gov.my/documents/20124/938039/Musyarakah.pdf/e99baaa9-d7cd-a61f-8d0a-9c9f2521dd4d?t=1592218252160",
    repere: "§§ 4, 14.2–14.5, 15.14–15.15, 16.2–16.11 et 17.1–17.3",
    lecture: "Bénéfice selon une méthode convenue, pertes selon les apports, traitement distinct des fautes et contrat de gestion séparé. Une valorisation provisoire exige un ajustement final. Référence institutionnelle malaisienne avec exclusions de périmètre ; son application à ETHIGONE ne peut pas être présumée.",
    acces: "Document officiel consulté ; toujours référencé dans le catalogue BNM à la date de vérification.",
  },
  {
    id: "psfp", titre: "AMF · Exercer une activité de PSFP en France (10 juin 2026)",
    url: "https://www.amf-france.org/fr/espace-professionnels/fintech/mes-relations-avec-lamf/exercer-une-activite-de-prestataire-de-services-de-financement-participatif-psfp-en-france",
    repere: "Contexte et agrément unique",
    lecture: "Le régime dépend des services et instruments proposés. Le plafond de 5 millions d’euros sur douze mois délimite son champ ; il ne dispense pas de l’agrément requis pour les activités couvertes.",
    acces: "Contenu officiel consulté via son résultat de recherche ; ouverture directe refusée par le site (403).",
  },
  {
    id: "fia", titre: "AMF · Notions essentielles des FIA, DOC-2013-16",
    url: "https://www.amf-france.org/fr/reglementation/doctrine/doc-2013-16",
    repere: "Résumé de la position ; orientations ESMA/2013/611",
    lecture: "La qualification examine notamment la levée de capitaux, la pluralité d’investisseurs et la politique d’investissement. Un pool agrégé exige cette analyse ; nous ne le qualifions pas automatiquement de fonds.",
    acces: "Résumé officiel consulté via la recherche ; aucune lecture intégrale de l’annexe revendiquée.",
  },
  {
    id: "mica", titre: "ESMA · MiCA, article 2",
    url: "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-2-scope",
    repere: "Article 2, paragraphe 4(a)",
    lecture: "Les crypto-actifs qualifiés d’instruments financiers sont exclus du champ de MiCA. Le statut du stablecoin, celui des droits du projet et les services de la plateforme sont trois examens distincts.",
    acces: "Texte officiel consulté.",
  },
] as const;

export const examensJ3 = [
  { titre: "Activité et propriété", responsable: "Opérateur + conseil juridique + réviseur charia", piece: "Identité, apports prouvés, devis, titres de propriété, contrats de location, assurance et entretien.", statut: "Aucun opérateur sélectionné" },
  { titre: "Résultat, frais et conflits", responsable: "Comptable + conseil juridique + réviseur charia", piece: "Méthode de valorisation, impayés, fiscalité, ajustement final, contrat de services ETHIGONE et règles de partage.", statut: "Hypothèses de calcul uniquement" },
  { titre: "Droits et accès", responsable: "Conseil juridique compétent pour les pays concernés", piece: "Pays des parties et clients, droits attachés aux parts, qualification de l’offre et des services, autorisations, identification et protection des données.", statut: "Qualification non réalisée" },
  { titre: "Wallet et stablecoin", responsable: "Équipe technique + conseils juridique et charia", piece: "Actif retenu, émission et réserves, conversion en euros, garde, flux, frais réseau, contrôles d’accès et traitement des incidents.", statut: "USDC et montage non certifiés" },
  { titre: "Durée et sortie", responsable: "Opérateur + conseils juridique et charia", piece: "Fin de collecte, modalités de cession, valorisation, délais, frais et procédure en cas de pertes ou de litige.", statut: "Aucun engagement de rachat" },
] as const;
