export const champsDossier = {
  titre: "Titre fictif",
  operateur: "Opérateur et expérience fictifs",
  activite: "Activité et location du matériel",
  equipements: "Équipements et pièces attendues",
  clients: "Clients et utilisation prévus",
  recettes: "Hypothèses de recettes",
  depenses: "Hypothèses de dépenses",
  besoin: "Besoin de financement fictif",
  risques: "Risques identifiés",
  references: "Références textuelles fictives des pièces",
};
export type Dossier = Record<keyof typeof champsDossier, string> & { budget: string };
export const criteres = {
  activite: "Activité et location",
  equipements: "Équipements et pièces",
  demande: "Demande locative",
  cash: "Cash et charges",
  operateur: "Opérateur et capacité à vérifier",
};
export const etatsCritere = ["a_verifier", "documente", "obstacle"] as const;
export const libellesCritere = { a_verifier: "À vérifier", documente: "Documenté dans l’exemple", obstacle: "Obstacle" };
export const statutsCandidature: Record<string, string> = {
  brouillon: "Brouillon privé", soumis: "Soumis au préexamen", a_completer: "À compléter",
  a_approfondir: "À approfondir", non_retenu: "Non retenu",
};
export const dossierVide: Dossier = {
  titre: "", operateur: "", activite: "", equipements: "", clients: "", recettes: "", depenses: "", besoin: "", risques: "", references: "", budget: "",
};
export const exempleLavage: Dossier = {
  titre: "Atelier Lavage — candidature fictive", operateur: "Équipe fictive A, expérience à vérifier",
  activite: "Location de machines de lavage dans des résidences collectives fictives.", equipements: "12 machines pour 18 000 EUR et réserve de 6 000 EUR. Devis fictif et inventaire manquants.",
  clients: "Résidences collectives fictives, demande locative à vérifier.", recettes: "Hypothèse de loyers fictifs de 10 000 EUR sur les 12 mois illustrés du scénario bénéfice, sans garantie.",
  depenses: "Charges d’exploitation fictives de 4 000 EUR et frais ETHIGONE de 300 EUR, comptés une fois. Entretien, installation et rôles restent à justifier.", besoin: "Acquisition fictive des équipements, financement à étudier.",
  risques: "Pannes, impayés, demande insuffisante, disponibilité de l’opérateur.", references: "DEVIS-DEMO-01 et INVENTAIRE-DEMO-01, références fictives sans fichier.", budget: "24000.00",
};
export function messageCandidature(code: string) {
  const messages: Record<string, string> = {
    saisie: "Vérifiez le titre (160 caractères maximum), les autres textes (1 200 caractères maximum) et le budget EUR (0,01 à 1 000 000,00, deux décimales maximum).",
    incomplet: "Complétez tous les champs et reconnaissez le caractère fictif avant de soumettre.",
    revue: "Renseignez les cinq critères, une note motivée et confirmez le préexamen fictif.",
    conflit: "La version a changé ou cette commande a déjà servi. Rouvrez le dossier pour consulter la version enregistrée avant de reprendre.",
    connexion: "Rouvrez votre espace avec le même compte.", interdit: "Ce dossier est réservé à son auteur et à l’administration après soumission.",
    origine: "Rouvrez le formulaire depuis ETHIGONE.", formulaire: "Le formulaire est invalide ou trop volumineux.",
    indisponible: "Enregistrement non confirmé. Gardez votre saisie et réessayez la même commande, ou consultez le dossier.",
  };
  return Object.hasOwn(messages, code) ? messages[code] : messages.indisponible;
}
