import { compteDeLaRequete } from "@/src/data/session";
import { commanderCandidature, ErreurCandidature } from "@/src/data/candidatures";
import { lireFormulaire, originePermise, renvoyer, reponsePrivee, uuidPreparation } from "@/src/data/formulaire-participation";
import { refuserFormulaire } from "@/src/data/refus-formulaire";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const json = request.headers.get("accept") === "application/json";
  let retour = "/proposer-projet";
  function erreur(code: string, status: number) {
    return json ? Response.json({ erreur: code }, { status, headers: reponsePrivee }) : renvoyer(retour + "?erreur=" + code);
  }
  if (!originePermise(request)) return refuserFormulaire(request, "origine", "origine", retour);
  const compte = await compteDeLaRequete();
  if (!compte) return refuserFormulaire(request, "connexion", "connexion", retour);
  let formulaire: URLSearchParams;
  try { formulaire = await lireFormulaire(request, 120000); }
  catch { return erreur("formulaire", 400); }
  const dossierId = formulaire.get("dossierId") || "";
  if (uuidPreparation.test(dossierId)) retour = "/candidatures/" + dossierId;
  if (formulaire.get("action") === "revoir" && compte.role !== "administrateur") return refuserFormulaire(request, "role", "interdit", "/proposer-projet");
  try {
    const id = await commanderCandidature(compte, formulaire);
    const chemin = "/candidatures/" + id + "?succes=" + formulaire.get("id");
    return json ? Response.json({ chemin }, { headers: reponsePrivee }) : renvoyer(chemin);
  } catch (e) {
    return erreur(e instanceof ErreurCandidature ? e.code : "indisponible", e instanceof ErreurCandidature ? e.status : 503);
  }
}
