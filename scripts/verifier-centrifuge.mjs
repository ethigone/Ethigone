// Lecture réelle du testnet. Aucun wallet, secret, signature ou transaction.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("wrangler")] }));
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/centrifuge-live-"));
try {
  const file = path.join(temp, "reader.cjs");
  await esbuild.build({ entryPoints: ["src/blockchain/centrifuge-test.ts"], outfile: file,
    bundle: true, platform: "node", format: "cjs", external: ["zod"] });
  const reader = require(file);
  let response;
  const observation = await reader.lirePoolTest(async (...args) => {
    const result = await fetch(...args);
    response = await result.clone().json();
    return result;
  });
  const preuve = {
    portee: "Lecture réelle de l’indexeur Centrifuge testnet. Aucune lecture RPC indépendante du bloc, connexion wallet ou participation établie par cette preuve.",
    requete: { url: reader.TESTNET_API, methode: "POST", query: reader.TEST_QUERY },
    observation,
    reponse: response,
  };
  await writeFile("public/preuves/centrifuge-j2.json", JSON.stringify(preuve, null, 2) + "\n");
  console.log(JSON.stringify(observation, null, 2));
} finally { await rm(temp, { recursive: true, force: true }); }
