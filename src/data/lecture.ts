import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projets } from "@/db/schema";
import exemple from "./projet.json";
import { initialiserRegistre } from "./registre";

export const fichePath = "/projets/" + exemple.slug;

export async function lireProjet() {
  await initialiserRegistre();
  const projet = await getDb().select().from(projets).where(eq(projets.slug, exemple.slug)).get();
  if (!projet) throw new Error("Le dossier fictif est indisponible.");
  return projet;
}
