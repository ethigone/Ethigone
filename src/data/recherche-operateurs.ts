export const dateRechercheOperateurs = "7 novembre 2026";

export const pistesOperateurs = [
  {
    id: "annuaire",
    titre: "Annuaire des Entreprises",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R60912?lang=fr",
    lien: "Point d’entrée officiel",
    usage: "Retrouver l’identité d’une entreprise française, ses établissements et les données publiques disponibles.",
    approche: "Partir d’un nom ou d’une zone géographique. Relever l’activité déclarée et la date de chaque information, puis comparer avec le site de l’entreprise.",
    limite: "L’immatriculation établit une existence légale. La capacité à financer, exploiter et entretenir le lot demande un examen distinct.",
  },
  {
    id: "cci",
    titre: "Réseau des CCI",
    url: "https://www.cci.fr/ressources/booster-son-business/trouver-des-clients-partenaires-fournisseurs/annuaire-des-entreprises-de-france",
    lien: "Annuaire des entreprises de France",
    usage: "Repérer des entreprises déjà actives sur un territoire, puis consulter leur activité et leurs références.",
    approche: "Rechercher location de matériel, équipement de blanchisserie ou maintenance dans la zone envisagée. Vérifier ensuite les prestations réellement proposées.",
    limite: "Les données d’un annuaire servent à constituer une première liste. La sélection exige les preuves du dossier.",
  },
  {
    id: "ffpb",
    titre: "Réseaux de l’entretien textile",
    url: "https://www.ffpb.fr/",
    lien: "Fédération française des pressings et blanchisseries",
    usage: "Comprendre le secteur, ses métiers et son implantation régionale.",
    approche: "Repérer des exploitants qui connaissent les équipements et les besoins des utilisateurs. Vérifier leur expérience de location, leur zone d’intervention et leur capacité de suivi.",
    limite: "Une activité de pressing ou de blanchisserie doit encore être confrontée au rôle précis d’opérateur du parc.",
  },
  {
    id: "fournisseurs",
    titre: "Fabricants et fournisseurs",
    url: "https://www.geist.fr/ladhesion-au-geist/liste-des-adherents-associes/",
    lien: "Répertoire de fournisseurs du GEIST",
    usage: "Identifier des interlocuteurs techniques de la filière de location-entretien textile.",
    approche: "Depuis les sites officiels des fabricants, rechercher leurs installateurs et services de maintenance locaux. Documenter disponibilité des pièces, délais d’intervention et coût du cycle de vie.",
    limite: "Le répertoire couvre une filière voisine de notre exemple. Chaque entreprise doit encore être examinée pour la location de machines envisagée.",
  },
] as const;

export const preuvesPreselection = [
  ["L’activité et les flux", "Qui possède le matériel, qui le loue, qui encaisse et qui paie chaque charge.", "Schéma des flux et projet de contrats à examiner."],
  ["Le matériel", "Prix d’achat, installation, entretien, assurance, durée d’usage et revente.", "Devis daté, références des machines et plan de maintenance."],
  ["La demande locative", "Besoin concret, clients visés, loyers et risque de vacance ou d’impayé.", "Éléments de demande et références de contrats comparables."],
  ["La trésorerie", "Apports, loyers attendus, charges, délai de paiement et argent à conserver.", "Budget sourcé et scénarios bénéfice, perte et retard."],
  ["L’opérateur", "Expérience, moyens humains, capacité de suivi et situation financière.", "Identité vérifiée, références d’exploitation et comptes à examiner."],
] as const;
