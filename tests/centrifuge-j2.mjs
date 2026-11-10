// Contrôles sur réponses enregistrées et erreurs simulées. La preuve réseau est séparée.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("wrangler")] }));
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/api-j2-"));
const originalFetch = globalThis.fetch;
try {
  const file = path.join(temp, "reader.cjs");
  await esbuild.build({
    stdin: {
      contents: 'export * from "./src/blockchain/centrifuge-test"; export { GET } from "./app/api/centrifuge-test/route";',
      resolveDir: process.cwd(),
    },
    outfile: file, bundle: true, platform: "node", format: "cjs", external: ["zod"],
  });
  const lib = require(file);
  const preuve = JSON.parse(await readFile("public/preuves/centrifuge-j2.json", "utf8"));
  assert.equal(preuve.requete.url, lib.TESTNET_API);
  assert.equal(preuve.requete.query, lib.TEST_QUERY);
  const valid = preuve.reponse;
  const fetcher = async (url, options) => {
    assert.equal(url, "https://api-v3-test.cfg.embrio.tech");
    assert.equal(options.method, "POST");
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    assert.deepEqual(JSON.parse(options.body), { query: lib.TEST_QUERY });
    assert.ok(options.signal);
    return Response.json(valid);
  };
  const lecture = await lib.lirePoolTest(fetcher);
  assert.equal(lecture.pool.id, lib.TEST_POOL_ID);
  assert.equal(lecture.coffre.adresse, lib.TEST_VAULT);
  assert.equal(lecture.environnement, "testnet");

  const invalides = [
    body => { body.errors = [{ message: "incomplete" }]; },
    body => { body.data.pools.items = []; },
    body => { body.data.pools.items[0].id = "281474976710662"; },
    body => { body.data.pools.items[0].centrifugeId = "2"; },
    body => { body.data.pools.items[0].tokens.items = []; },
    body => { body.data.vaults.items = []; },
    body => { body.data.vaults.items[0].assetAddress = "0x" + "11".repeat(20); },
    body => { body.data.vaults.items[0].tokenId = "inattendu"; },
    body => { body.data.vaults.items[0].centrifugeId = "2"; },
  ];
  for (const modifier of invalides) {
    const body = structuredClone(valid);
    modifier(body);
    await assert.rejects(lib.lirePoolTest(async () => Response.json(body)));
  }
  for (const status of [301, 302, 307, 308, 403, 429, 500]) {
    await assert.rejects(lib.lirePoolTest(async () => new Response("Indisponible", { status })));
  }
  await assert.rejects(lib.lirePoolTest(async () => new Response("Page HTML")));
  await assert.rejects(lib.lirePoolTest(async () => { throw new Error("Réseau coupé"); }));

  globalThis.fetch = fetcher;
  const ok = await lib.GET();
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Cache-Control"), "no-store");
  assert.equal((await ok.json()).pool.id, lib.TEST_POOL_ID);
  globalThis.fetch = async () => { throw new Error("Détail interne à ne pas exposer"); };
  const erreur = await lib.GET();
  assert.equal(erreur.status, 502);
  assert.equal(erreur.headers.get("Cache-Control"), "no-store");
  const corps = await erreur.json();
  assert.ok(corps.erreur);
  assert.equal(corps.pool, undefined);
  assert.doesNotMatch(corps.erreur, /Détail interne/);

  await assert.rejects(lib.lirePoolTest(async (_url, options) =>
    new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("Délai dépassé")), { once: true }))
  ));
  console.log("J2 API OK — réponse testnet enregistrée, 9 incohérences, redirections refusées, erreurs HTTP/JSON/réseau, expiration 8 s, route 200/502 sans cache.");
} finally {
  globalThis.fetch = originalFetch;
  await rm(temp, { recursive: true, force: true });
}
