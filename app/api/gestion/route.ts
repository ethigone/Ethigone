import { refuserFormulaire } from "@/src/data/refus-formulaire";
import { compteDeLaRequete } from "@/src/data/session";
import { ajouterOperation, creerSituation, distribuerSituation, ErreurGestion, type TypeOperationGestion } from "@/src/data/gestion";
import { lireFormulaire, originePermise, renvoyer, uuidPreparation } from "@/src/data/formulaire-participation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!originePermise(request)) return refuserFormulaire(request, "origine", "Ouvrez le formulaire depuis ETHIGONE.", "/administration/gestion");
  const compte = await compteDeLaRequete();
  if (!compte) return refuserFormulaire(request, "connexion", "Reconnectez-vous pour accéder à la gestion.", "/administration/gestion");
  if (compte.role !== "administrateur") return refuserFormulaire(request, "role", "Accès réservé à l’administration.", "/administration/gestion");
  let formulaire: URLSearchParams;
  try { formulaire = await lireFormulaire(request, 24576); }
  catch { return renvoyer("/administration/gestion?erreur=formulaire"); }
  const id = formulaire.get("id") ?? "";
  const situationId = formulaire.get("situationId") ?? "";
  try {
    const action = formulaire.get("action");
    let situation;
    if (action === "creer") {
      situation = await creerSituation(compte, { id, scenarioId: formulaire.get("scenarioId") ?? "" });
    } else {
      const revisionTexte = formulaire.get("revision") ?? "";
      if (!/^\d{1,16}$/.test(revisionTexte)) throw new ErreurGestion("saisie", "Révision invalide.");
      const revision = Number(revisionTexte);
      if (action === "operation") {
        situation = await ajouterOperation(compte, {
          id, situationId, revision, type: (formulaire.get("type") ?? "") as TypeOperationGestion,
          montant: formulaire.get("montant") ?? "", libelle: formulaire.get("libelle") ?? "", pieceTexte: formulaire.get("pieceTexte") ?? "",
        });
      } else if (action === "distribuer" && formulaire.get("confirme") === "oui") {
        situation = await distribuerSituation(compte, { id, situationId, revision });
      } else throw new ErreurGestion("saisie", "Action ou confirmation manquante.");
    }
    return renvoyer("/administration/gestion?id=" + encodeURIComponent(situation.id));
  } catch (error) {
    const code = error instanceof ErreurGestion ? error.code : "indisponible";
    if (!(error instanceof ErreurGestion)) console.error("Gestion indisponible", error instanceof Error ? error.name : "Erreur");
    const params = new URLSearchParams({ erreur: code });
    if (uuidPreparation.test(situationId)) params.set("id", situationId);
    return renvoyer("/administration/gestion?" + params);
  }
}
