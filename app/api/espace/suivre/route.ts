import { refuserFormulaire } from "@/src/data/refus-formulaire";
import { compteDeLaRequete } from "@/src/data/session";
import { suivreProjet } from "@/src/data/registre";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return refuserFormulaire(request, "origine", "Ouvrez votre espace pour suivre le projet.", "/mon-espace");
  }
  try {
    const compte = await compteDeLaRequete();
    if (!compte) return refuserFormulaire(request, "connexion", "Reconnectez-vous pour enregistrer votre suivi.", "/mon-espace");
    // Le compte et le dossier sont déterminés côté serveur. Aucun paramètre du client n'est utilisé.
    await suivreProjet(compte);
    return new Response(null, { status: 303, headers: { ...headers, Location: "/mon-espace#dossier" } });
  } catch (error) {
    console.error("Écriture du suivi indisponible", error instanceof Error ? error.name : "Erreur");
    return new Response(null, { status: 303, headers: { ...headers, Location: "/mon-espace?suivi=indisponible#dossier" } });
  }
}
