import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { renvoyer, reponsePrivee, uuidPreparation } from "./formulaire-participation";

type Motif = "connexion" | "origine" | "role";

/** Conserve le statut JSON de l’API. Un formulaire de navigateur revient dans le parcours. */
export function refuserFormulaire(request: Request, motif: Motif, erreur: string, retour: string) {
  if (!request.headers.get("accept")?.includes("text/html")) {
    return Response.json({ erreur }, { status: motif === "connexion" ? 401 : 403, headers: reponsePrivee });
  }
  if (motif === "origine") return renvoyer("/faq?acces=origine#reprendre");
  if (motif === "role") return renvoyer("/mon-espace?acces=reserve");
  // Seul le récapitulatif ou la situation déjà affichée peut compléter le chemin fixe.
  // La page de retour vérifie à nouveau le compte. La connexion ne rejoue aucun POST.
  let chemin = retour;
  const referent = URL.parse(request.headers.get("referer") ?? "");
  if (["/participer/confirmation", "/administration/gestion"].includes(retour) && referent?.origin === new URL(request.url).origin && referent.pathname === retour) {
    const id = referent.searchParams.get("id");
    if (id && uuidPreparation.test(id)) chemin += "?id=" + encodeURIComponent(id);
  }
  if (chemin === "/participer/confirmation") chemin = "/participer";
  return renvoyer(chatGPTSignInPath(chemin));
}
