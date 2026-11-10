import { refuserFormulaire } from "@/src/data/refus-formulaire";
import { compteDeLaRequete } from "@/src/data/session";
import { ErreurParticipation, preparerParticipation } from "@/src/data/participation";
import { lireFormulaire, originePermise, renvoyer, uuidPreparation } from "@/src/data/formulaire-participation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!originePermise(request)) {
    return refuserFormulaire(request, "origine", "Ouvrez le formulaire depuis ETHIGONE.", "/participer");
  }
  const compte = await compteDeLaRequete();
  if (!compte) return refuserFormulaire(request, "connexion", "Reconnectez-vous pour préparer cet essai.", "/participer");
  let formulaire: URLSearchParams;
  try {
    formulaire = await lireFormulaire(request);
  } catch {
    return renvoyer("/participer?erreur=formulaire");
  }
  const id = formulaire.get("id") ?? "";
  try {
    const preparation = await preparerParticipation(compte, {
      id, montant: formulaire.get("montant") ?? "",
      reglesId: formulaire.get("reglesId") ?? "", accepte: formulaire.get("accepte") === "oui",
    });
    return renvoyer("/participer/confirmation?id=" + encodeURIComponent(preparation.id));
  } catch (error) {
    const code = error instanceof ErreurParticipation ? error.code : "indisponible";
    if (!(error instanceof ErreurParticipation)) console.error("Préparation indisponible", error instanceof Error ? error.name : "Erreur");
    const params = new URLSearchParams({ erreur: code, montant: (formulaire.get("montant") ?? "").slice(0, 12) });
    if (uuidPreparation.test(id)) params.set("id", id);
    return renvoyer("/participer?" + params);
  }
}
