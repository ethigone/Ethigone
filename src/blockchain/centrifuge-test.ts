import { z } from "zod";

// Configuration testnet documentée, vérifiée le 1 novembre 2026.
// https://bd.docs.centrifuge.io/JTRSY-integration-guide.html#testnet
export const TESTNET_API = "https://api-v3-test.cfg.embrio.tech";
export const TEST_POOL_ID = "281474976720670";
export const TEST_SHARE_ID = "0x000100000000271e0000000000000001";
export const TEST_VAULT = "0x3e14f2fbb5e0de284598b08b04cf1e4f6fbf40f7";
export const TEST_ASSET = "0x3aaaa86458d576bafcb1b7ed290434f0696da65c";

export const TEST_QUERY = `{
  pools(where: { id: "${TEST_POOL_ID}" }, limit: 1) {
    items { id name centrifugeId isActive tokens { items { id name symbol } } }
  }
  vaults(where: { poolId: "${TEST_POOL_ID}", centrifugeId: "1" }, limit: 10) {
    items { id poolId tokenId assetAddress centrifugeId isActive }
  }
}`;

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/).transform(s => s.toLowerCase());
const tokenSchema = z.object({ id: z.string(), name: z.string().nullable(), symbol: z.string().nullable() });
const responseSchema = z.object({
  errors: z.array(z.unknown()).optional(),
  data: z.object({
    pools: z.object({ items: z.array(z.object({
      id: z.literal(TEST_POOL_ID), name: z.string().nullable(), centrifugeId: z.literal("1"),
      isActive: z.boolean(), tokens: z.object({ items: z.array(tokenSchema) }),
    })).length(1) }),
    vaults: z.object({ items: z.array(z.object({
      id: address, poolId: z.literal(TEST_POOL_ID), tokenId: z.string(), assetAddress: address,
      centrifugeId: z.literal("1"), isActive: z.boolean(),
    })).min(1).max(10) }),
  }),
});

export type PoolObservation = {
  observeLe: string;
  source: typeof TESTNET_API;
  environnement: "testnet";
  pool: { id: string; nom: string | null; actif: boolean };
  part: { id: string; nom: string | null; symbole: string | null };
  coffre: { adresse: string; actif: boolean; actifDepot: string };
};

export async function lirePoolTest(fetcher: typeof fetch = fetch): Promise<PoolObservation> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(TESTNET_API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: TEST_QUERY }), signal: controller.signal,
      redirect: "manual", cache: "no-store",
    });
    if (!response.ok) throw new Error(`La source testnet est indisponible (HTTP ${response.status}).`);
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success || parsed.data.errors?.length) throw new Error("Réponse testnet non conforme.");
    const { pools, vaults } = parsed.data.data;
    const pool = pools.items[0];
    const part = pool.tokens.items.find(t => t.id === TEST_SHARE_ID);
    const coffre = vaults.items.find(v => v.id === TEST_VAULT && v.tokenId === TEST_SHARE_ID && v.assetAddress === TEST_ASSET);
    if (!part || !coffre) throw new Error("Le pool ou ses contrats de test ont changé.");
    return {
      observeLe: new Date().toISOString(), source: TESTNET_API, environnement: "testnet",
      pool: { id: pool.id, nom: pool.name, actif: pool.isActive },
      part: { id: part.id, nom: part.name, symbole: part.symbol },
      coffre: { adresse: coffre.id, actif: coffre.isActive, actifDepot: coffre.assetAddress },
    };
  } finally {
    clearTimeout(timeout);
  }
}
