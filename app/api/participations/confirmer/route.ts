import { refuserFormulaire } from "@/src/data/refus-formulaire";
import { compteDeLaRequete } from "@/src/data/session";
import { ErreurParticipation, confirmerParticipation } from "@/src/data/participation";
import { lireFormulaire, originePermise, renvoyer, uuidPreparation } from "@/src/data/formulaire-participation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!originePermise(request)) {
    return refuserFormulaire(request, "origine", "Ouvrez le récapitulatif depuis ETHIGONE.", "/participer/confirmation");
  }
  const compte = await compteDeLaRequete();
  if (!compte) return refuserFormulaire(request, "connexion", "Reconnectez-vous pour confirmer cet essai.", "/participer/confirmation");
  let formulaire: URLSearchParams;
  try {
    formulaire = await lireFormulaire(request);
  } catch {
    return renvoyer("/participer?erreur=formulaire");
  }
  const id = formulaire.get("id") ?? "";
  if (!uuidPreparation.test(id)) return renvoyer("/participer?erreur=introuvable");
  if (formulaire.get("confirme") !== "oui") {
    return renvoyer("/participer/confirmation?" + new URLSearchParams({ id, erreur: "conditions" }));
  }
  try {
    await confirmerParticipation(compte, id);
    return renvoyer("/portefeuille?confirmation=" + encodeURIComponent(id));
  } catch (error) {
    const code = error instanceof ErreurParticipation ? error.code : "indisponible";
    if (!(error instanceof ErreurParticipation)) console.error("Confirmation indisponible", error instanceof Error ? error.name : "Erreur");
    return renvoyer("/participer/confirmation?" + new URLSearchParams({ id, erreur: code }));
  }
}
