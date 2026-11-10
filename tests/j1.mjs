// Contrôle de la première version. Exécuter depuis le dépôt, après le build Sites.
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { getPlatformProxy } from "wrangler";

const require = createRequire(import.meta.url);
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("wrangler")] }));
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/j1-test-"));
const fichier = path.join(temp, "pages.cjs");
const options = {
  configPath: "dist/server/wrangler.json", persist: { path: temp }, envFiles: [], remoteBindings: false,
};

let runtime;
try {
  await esbuild.build({
    stdin: {
      contents: [
        'export { default as presentation } from "./app/presentation/page";',
        'export { default as recherche } from "./app/recherche-operateurs/page";',
        'export { default as catalogue } from "./app/projets/page";',
        'export { default as faq } from "./app/faq/page";',
        'export { default as accueil } from "./app/page";',
        'export { default as fiche } from "./app/projets/atelier-lavage/page";',
        'export { default as guide } from "./app/fonctionnement/page";',
        'export { default as connexion } from "./app/connexion-test/page";',
        'export { default as regles } from "./app/regles/page";',
        'export { default as charia } from "./app/charia/page";',
        'export { fichePath } from "./src/data/lecture";',
      ].join("\n"),
      resolveDir: process.cwd(),
    },
    outfile: fichier, bundle: true, platform: "node", format: "cjs",
    external: ["react", "react/*", "drizzle-orm", "drizzle-orm/*"],
    plugins: [{
      name: "liaison-D1-locale",
      setup(build) {
        build.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: "d1", namespace: "test" }));
        build.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents: "export const env = { get DB() { return globalThis.__ethigoneD1; } };",
        }));
      },
    }],
  });

  const app = require(fichier);
  runtime = await getPlatformProxy(options);
  const db = runtime.env.DB;
  globalThis.__ethigoneD1 = db;
  for (const fichier of (await readdir("drizzle")).filter(n => n.endsWith(".sql")).sort()) {
    const migration = await readFile(path.join("drizzle", fichier), "utf8");
    for (const sql of migration.split("--> statement-breakpoint")) await db.prepare(sql.trim()).run();
  }
  const routes = { "/": app.accueil, [app.fichePath]: app.fiche, "/fonctionnement": app.guide, "/connexion-test": app.connexion, "/regles": app.regles, "/charia": app.charia, "/projets": app.catalogue, "/faq": app.faq, "/recherche-operateurs": app.recherche, "/presentation": app.presentation };
  const pages = Object.fromEntries(await Promise.all(Object.entries(routes).map(async ([url, page]) =>
    [url, renderToStaticMarkup(await page({ searchParams: Promise.resolve({}) }))]
  )));
  const count = await db.prepare("SELECT count(*) AS n FROM projets").first("n");
  assert.equal(count, 1, "Une seule ligne après deux premières lectures concurrentes");
  const budget = await db.prepare("SELECT quantite * prix_unitaire_centimes AS total FROM projets").first("total");
  assert.equal(budget, 1800000);
  for (const url of ["/", app.fichePath]) assert.match(pages[url].replace(/\s/g, ""), /18000€/);
  let liens = 0;
  for (const [url, html] of Object.entries(pages)) {
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(html, /aria-current="page"/);
    assert.match(html, /Démo privée/);
    assert.doesNotMatch(html, /<form[\s>]/);
    for (const [, href] of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
      const cible = new URL(href, "https://test.invalid" + url);
      if (cible.origin !== "https://test.invalid") {
        assert.ok(["https://bd.docs.centrifuge.io", "https://docs.centrifuge.io", "https://www.bnm.gov.my", "https://www.amf-france.org", "https://www.esma.europa.eu", "https://www.service-public.gouv.fr", "https://www.cci.fr", "https://www.ffpb.fr", "https://www.geist.fr", "https://annuaire-entreprises.data.gouv.fr"].includes(cible.origin));
        liens++;
        continue;
      }
      if (cible.pathname.startsWith("/preuves/")) {
        await access("public" + cible.pathname);
        liens++;
        continue;
      }
      if (["/mon-espace", "/participer", "/portefeuille", "/suivi-projet", "/assistance", "/proposer-projet", "/administration", "/administration/gestion", "/administration/candidatures"].includes(cible.pathname)) {
        // Le test HTTP navigation-j7 résout aussi les ancres des pages protégées.
        await access("app" + cible.pathname + "/page.tsx");
        liens++;
        continue;
      }
      assert.ok(pages[cible.pathname], "Route absente : " + href);
      if (cible.hash) assert.ok(pages[cible.pathname].includes('id="' + cible.hash.slice(1) + '"'), "Ancre absente : " + href);
      liens++;
    }
  }

  const reglesTexte = pages["/regles"].replace(/<[^>]+>/g, "").replace(/\s/g, "");
  for (const chiffre of ["19200€", "4800€", "24000€", "18000€", "6000€", "2700€"]) assert.ok(reglesTexte.includes(chiffre), "Montant J3 absent : " + chiffre);
  assert.match(pages["/regles"], /Versement autorisé : 0 €/);
  assert.match(pages["/regles"], /avant fiscalité/);
  assert.match(pages["/charia"], /Aucune certification/);
  assert.match(pages["/charia"], /2 novembre 2026/);

  // Modifier seulement la copie jetable. Vérifier que la réouverture ne la réinitialise pas.
  await db.prepare("UPDATE projets SET prix_unitaire_centimes = ? WHERE slug = ?").bind(149999, "atelier-lavage").run();
  await runtime.dispose();
  runtime = undefined;
  runtime = await getPlatformProxy(options);
  globalThis.__ethigoneD1 = runtime.env.DB;
  for (const page of [app.accueil, app.fiche]) {
    const html = renderToStaticMarkup(await page());
    assert.match(html.replace(/\s/g, ""), /17999,88€/);
  }
  console.log(JSON.stringify({ routes: Object.keys(pages), liensVerifies: liens, lignes: count,
    budgetEnCentimes: budget, persistanceApresReouverture: true, verification: "OK" }, null, 2));
} finally {
  if (runtime) await runtime.dispose();
  delete globalThis.__ethigoneD1;
  await rm(temp, { recursive: true, force: true });
}
