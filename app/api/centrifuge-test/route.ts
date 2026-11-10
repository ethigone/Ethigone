import { lirePoolTest } from "@/src/blockchain/centrifuge-test";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    return Response.json(await lirePoolTest(), { headers });
  } catch (error) {
    console.error("ETHIGONE testnet read", error instanceof Error ? { name: error.name, message: error.message } : { name: "Unknown" });
    return Response.json({
      erreur: "Lecture indisponible. La source ne répond pas ou le dossier de test a changé. Réessayez plus tard.",
    }, { status: 502, headers });
  }
}
