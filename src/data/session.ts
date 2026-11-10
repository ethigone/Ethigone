import { env } from "cloudflare:workers";
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";
import { ouvrirCompte } from "./registre";

// Seul Sites fournit l'identité. L'adresse vérifiée sert à l'amorçage unique,
// puis le rôle reste attaché au sujet stable enregistré dans D1.
function comptePour(visiteur: ChatGPTUser) {
  const autorisee = env.ETHIGONE_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const estProprietaire = Boolean(autorisee && visiteur.email.trim().toLowerCase() === autorisee);
  return ouvrirCompte(visiteur.userId, estProprietaire);
}

export async function compteDeLaRequete() {
  const visiteur = await getChatGPTUser();
  return visiteur ? comptePour(visiteur) : null;
}

export async function exigerCompte(chemin: string) {
  return comptePour(await requireChatGPTUser(chemin));
}
