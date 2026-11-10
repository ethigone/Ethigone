import { compteDeLaRequete } from "@/src/data/session";
import { commanderAssistance, ErreurAssistance } from "@/src/data/assistance";
import {
  lireFormulaire,
  originePermise,
  renvoyer,
  reponsePrivee,
} from "@/src/data/formulaire-participation";
import { refuserFormulaire } from "@/src/data/refus-formulaire";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json = request.headers.get("accept") === "application/json";
  let retour = "/assistance";
  function erreur(code: string, status: number) {
    return json
      ? Response.json({ erreur: code }, { status, headers: reponsePrivee })
      : renvoyer(retour + "?erreur=" + code);
  }
  if (!originePermise(request)) {
    return refuserFormulaire(request, "origine", "origine", "/assistance");
  }
  const compte = await compteDeLaRequete();
  if (!compte) {
    return refuserFormulaire(request, "connexion", "connexion", "/assistance");
  }
  let formulaire: URLSearchParams;
  try {
    formulaire = await lireFormulaire(request, 18000);
  } catch {
    return erreur("formulaire", 400);
  }
  const action = formulaire.get("action") ?? "";
  if (action === "cloturer") {
    if (compte.role !== "administrateur") {
      return refuserFormulaire(request, "role", "interdit", "/assistance");
    }
    retour = "/administration/assistance";
    if (formulaire.get("confirme") !== "oui") return erreur("confirmation", 400);
  }
  try {
    const id = await commanderAssistance(compte, {
      id: formulaire.get("id") ?? "",
      action,
      demandeId: formulaire.get("demandeId") ?? "",
      categorie: formulaire.get("categorie") ?? "",
      description: formulaire.get("description") ?? "",
      reponse: formulaire.get("reponse") ?? "",
    });
    const chemin = retour + "?succes=" + id;
    return json
      ? Response.json({ chemin }, { headers: reponsePrivee })
      : renvoyer(chemin);
  } catch (e) {
    return erreur(
      e instanceof ErreurAssistance ? e.code : "indisponible",
      e instanceof ErreurAssistance ? e.status : 503,
    );
  }
}
