export const reponsePrivee = { "Cache-Control": "private, no-store" };
export const uuidPreparation = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function originePermise(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

/** Les formulaires natifs utilisent un petit corps URL-encoded, sans fichier. */
export async function lireFormulaire(request: Request, tailleMaximale = 4096) {
  const type = request.headers.get("content-type")?.split(";")[0].trim();
  if (type !== "application/x-www-form-urlencoded") throw new Error("Format de formulaire invalide.");
  const lecteur = request.body?.getReader();
  if (!lecteur) throw new Error("Formulaire vide.");
  const morceaux: Uint8Array[] = [];
  let taille = 0;
  try {
    while (true) {
      const { done, value } = await lecteur.read();
      if (done) break;
      taille += value.byteLength;
      if (taille > tailleMaximale) {
        await lecteur.cancel();
        throw new Error("Formulaire trop volumineux.");
      }
      morceaux.push(value);
    }
  } finally {
    lecteur.releaseLock();
  }
  const octets = new Uint8Array(taille);
  let position = 0;
  for (const morceau of morceaux) {
    octets.set(morceau, position);
    position += morceau.byteLength;
  }
  const donnees = new URLSearchParams(new TextDecoder().decode(octets));
  for (const cle of donnees.keys()) {
    if (donnees.getAll(cle).length !== 1) throw new Error("Champ répété.");
  }
  return donnees;
}

export function renvoyer(chemin: string) {
  return new Response(null, { status: 303, headers: { ...reponsePrivee, Location: chemin } });
}
