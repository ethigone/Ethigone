// Contre-vérification indépendante locale J9. Aucun Worker, réseau ou migration.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import path from "node:path";
const require = createRequire(import.meta.url);
const ts = require("typescript");
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/verification-j9-"));
try {
  await writeFile(path.join(temp, "package.json"), '{"type":"commonjs"}');
  for (const [source, destination] of [
    ["src/economie/demo.ts", "demo.js"],
    ["src/economie/projection.ts", "projection.js"],
    ["src/data/formulaire-participation.ts", "formulaire.js"],
  ]) {
    const contenu = await readFile(source, "utf8");
    const resultat = ts.transpileModule(contenu, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
    await writeFile(path.join(temp, destination), resultat.outputText);
  }
  const { repartirCentimes, reglesDemo } = require(path.join(temp, "demo.js"));
  const { projeterEssai } = require(path.join(temp, "projection.js"));
  const { lireFormulaire, originePermise } = require(path.join(temp, "formulaire.js"));
  // Échantillonnage déterministe complémentaire aux quelques bornes des tests J6.
  let graine = 20261108;
  const suivant = maximum => {
    graine = (Math.imul(graine, 1664525) + 1013904223) >>> 0;
    return graine % maximum;
  };
  for (let i = 0; i < 2000; i++) {
    const montant = 1 + suivant(1920000);
    const resultat = suivant(10000000) - 5000000;
    const distribution = suivant(5000000);
    const projection = projeterEssai(montant, reglesDemo, resultat, distribution);
    assert.equal(projection.capitalInvestisseursCentimes, 1920000);
    // Inégalité caractéristique de la troncature vers zéro, sans recalcul du quotient.
    for (const [valeur, sortie] of [[resultat, projection.resultatCentimes], [distribution, projection.distributionCentimes]]) {
      const reste = BigInt(valeur) * BigInt(montant) - BigInt(sortie) * 1920000n;
      assert.ok(reste > -1920000n && reste < 1920000n);
      assert.ok(reste === 0n || (reste > 0n) === (valeur > 0));
      assert.ok(Number.isSafeInteger(sortie));
      assert.ok(Math.abs(sortie) <= Math.abs(valeur));
    }
    const parts = repartirCentimes(resultat, suivant(101));
    assert.equal(parts.investisseursCentimes + parts.operateurCentimes, resultat);
  }
  const request = body => new Request("https://ethigone.test/api/candidatures", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body,
    ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
  });
  // Le contrôle des champs doit porter sur le nom décodé, y compris entre fragments.
  await assert.rejects(lireFormulaire(request("action=creer&%61ction=soumettre")), /répété/);
  await assert.rejects(lireFormulaire(request("id=a&i%64=b")), /répété/);
  assert.equal((await lireFormulaire(request("texte=%E2%82%AC"), 15)).get("texte"), "€");
  await assert.rejects(lireFormulaire(request("texte=%E2%82%AC"), 14), /volumineux/);
  let annule = false;
  const tropLong = new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode("id=12345")); },
    cancel() { annule = true; },
  });
  await assert.rejects(lireFormulaire(request(tropLong), 7), /volumineux/);
  assert.equal(annule, true);
  const interruption = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("action=creer&id="));
      controller.error(new Error("coupure locale J9"));
    },
  });
  await assert.rejects(lireFormulaire(request(interruption)), /coupure locale J9/);
  for (const origin of [null, "null", "https://ethigone.test.evil.invalid", "http://ethigone.test", "https://ethigone.test:444"]) {
    const headers = origin === null ? {} : { origin };
    assert.equal(originePermise(new Request("https://ethigone.test/api/candidatures", { headers })), false);
  }
  assert.equal(originePermise(new Request("https://ethigone.test/api/candidatures", { headers: { origin: "https://ethigone.test" } })), true);
  console.log("J9 indépendant OK — 2 000 projections/repartitions, noms encodés répétés, limite octets, flux interrompu, annulation et origine exacte. Sans Worker ni réseau.");
} finally {
  await rm(temp, { recursive: true, force: true });
}

// Mode explicite après compilation du Worker final, avec D1 locale jetable.
if (process.argv.includes("--worker")) {
  const { readdir } = await import("node:fs/promises");
  const { Miniflare } = require(require.resolve("miniflare", { paths: [require.resolve("wrangler")] }));
  const racine = path.resolve("dist/server");
  const config = JSON.parse(await readFile(path.join(racine, "wrangler.json"), "utf8"));
  const modules = (await readdir(racine, { recursive: true })).filter(f => f.endsWith(".js") && f !== config.main);
  const local = await mkdtemp(path.resolve(".sites-runtime/verification-j9-worker-"));
  const mf = new Miniflare({
    cf: false, compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
    modulesRoot: racine, modules: [config.main, ...modules].map(f => ({ type: "ESModule", path: path.join(racine, f) })),
    d1Databases: ["DB"], d1Persist: local,
    bindings: { ETHIGONE_ADMIN_BOOTSTRAP_EMAIL: "admin-j9@example.invalid" },
  });
  const origine = "https://ethigone.test";
  async function appeler(route, compte = "alice", donnees) {
    const headers = {
      "oai-authenticated-user-id": "verification-j9-" + compte,
      "oai-authenticated-user-email": compte + "-j9@example.invalid",
      ...(donnees ? { origin: origine, accept: "application/json", "content-type": "application/x-www-form-urlencoded" } : {}),
      ...(route.includes(".rsc") ? { RSC: "1" } : {}),
    };
    const rep = await mf.dispatchFetch(origine + route, {
      method: donnees ? "POST" : "GET", headers, redirect: "manual",
      ...(donnees ? { body: new URLSearchParams(donnees).toString() } : {}),
    });
    return { status: rep.status, type: rep.headers.get("content-type"), corps: await rep.text() };
  }
  try {
    const db = await mf.getD1Database("DB");
    for (const fichier of (await readdir("drizzle")).filter(f => f.endsWith(".sql")).sort()) {
      for (const sql of (await readFile("drizzle/" + fichier, "utf8")).split("--> statement-breakpoint")) {
        if (sql.trim()) await db.prepare(sql.trim()).run();
      }
    }
    assert.equal((await appeler("/proposer-projet")).status, 200);
    assert.equal((await appeler("/administration/candidatures", "admin")).status, 200);
    const dossierId = crypto.randomUUID();
    const creation = { action: "creer", id: dossierId };
    assert.equal((await appeler("/api/candidatures", "alice", creation)).status, 200);
    const volCle = await appeler("/api/candidatures", "bilal", creation);
    assert.equal(volCle.status, 409);
    const fields = ["titre", "operateur", "activite", "equipements", "clients", "recettes", "depenses", "besoin", "risques", "references"];
    const champs = Object.fromEntries(fields.map(f => [f, "EXEMPLE-J9-" + f]));
    const soumettre = { ...champs, action: "soumettre", id: crypto.randomUUID(), dossierId, revision: "0", budget: "0.01", fictif: "oui" };
    assert.equal((await appeler("/api/candidatures", "alice", soumettre)).status, 200);
    // Le compte voisin ne lit aucune donnée, quel que soit le transport de rendu.
    for (const suffixe of ["", ".rsc"]) {
      const rep = await appeler("/candidatures/" + dossierId + suffixe, "bilal");
      assert.equal(rep.status, suffixe ? 200 : 404);
      assert.ok(!rep.corps.includes("EXEMPLE-J9-titre"));
    }
    assert.equal((await appeler("/candidatures/" + dossierId, "admin")).status, 200);
    for (const compte of ["alice", "admin"]) {
      const autorise = await appeler("/candidatures/" + dossierId + ".rsc", compte);
      assert.equal(autorise.status, 200);
      assert.match(autorise.type || "", /text\/x-component/);
      assert.ok(autorise.corps.includes("EXEMPLE-J9-titre"));
      assert.ok(autorise.corps.includes(dossierId));
    }
    const sainId = crypto.randomUUID();
    assert.equal((await appeler("/api/candidatures", "alice", { action: "creer", id: sainId })).status, 200);
    assert.equal((await appeler("/api/candidatures", "alice", {
      ...soumettre, id: crypto.randomUUID(), dossierId: sainId, titre: "DOSSIER-SAIN-J9",
    })).status, 200);
    // Corruption contrôlée hors API pour observer une donnée manquante.
    // Les écritures métier atomiques ne produisent pas cet état.
    await db.prepare("DELETE FROM commandes_candidatures WHERE id=?").bind(soumettre.id).run();
    const detail = await appeler("/candidatures/" + dossierId, "admin");
    assert.equal(detail.status, 404);
    const liste = await appeler("/administration/candidatures", "admin");
    assert.equal(liste.status, 200);
    assert.ok(liste.corps.includes("Certaines candidatures sont indisponibles. Leur historique de soumission doit être vérifié."));
    assert.ok(liste.corps.includes("DOSSIER-SAIN-J9"));
    assert.ok(!liste.corps.includes("EXEMPLE-J9-titre"));
    const listeRsc = await appeler("/administration/candidatures.rsc", "admin");
    assert.equal(listeRsc.status, 200);
    assert.match(listeRsc.type || "", /text\/x-component/);
    assert.ok(listeRsc.corps.includes("DOSSIER-SAIN-J9"));
    assert.ok(listeRsc.corps.includes("Certaines candidatures sont indisponibles."));
    assert.ok(!listeRsc.corps.includes("EXEMPLE-J9-titre"));
    console.log(JSON.stringify({
      verification: "J9 Worker local",
      invariant: "Clé intercompte refusée et dossier isolé HTML/RSC",
      donneeManquante: { detail: detail.status, liste: liste.status },
      constat: "Liste HTML/RSC disponible avec alerte, dossier sain visible et contenu indisponible masqué.",
      limite: "Journal supprimé directement dans D1 de test. État extérieur aux commandes applicatives atomiques.",
    }, null, 2));
  } finally {
    await mf.dispose();
    await rm(local, { recursive: true, force: true });
  }
}
