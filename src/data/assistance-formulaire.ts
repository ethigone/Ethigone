export const categoriesAssistance = {
  compte: "Compte et accès",
  participation: "Participation fictive",
  suivi: "Suivi du projet",
  autre: "Autre question",
};

const messages: Record<string, string> = {
  saisie: "Vérifiez les champs du formulaire et utilisez entre 1 et 1 200 caractères pour votre texte fictif.",
  confirmation: "Cochez la confirmation de clôture avant d’enregistrer votre réponse.",
  conflit: "La demande a changé ou ce formulaire a déjà servi. Consultez son statut dans l’historique avant de recommencer.",
  formulaire: "Rouvrez le formulaire et limitez le texte à 1 200 caractères.",
  connexion: "Votre session a expiré. Rouvrez votre espace avec le même compte.",
  interdit: "Seul le propriétaire peut répondre aux demandes.",
  origine: "Rouvrez le formulaire depuis la page Assistance d’ETHIGONE.",
  indisponible: "L’enregistrement n’a pas pu être confirmé. Vérifiez l’historique avant de réessayer.",
};

export function messageAssistance(code: unknown) {
  return typeof code === "string" && Object.hasOwn(messages, code) ? messages[code] : messages.indisponible;
}
