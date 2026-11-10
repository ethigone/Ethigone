// Démonstration économique fictive, sans réseau ni transaction.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("wrangler")] }));
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/economie-j3-"));
try {
  const moteur = path.join(temp, "demo.cjs");
  await esbuild.build({ entryPoints: ["src/economie/demo.ts"], outfile: moteur, bundle: true, platform: "node", format: "cjs" });
  const { reglesDemo, scenariosDemo, calculerScenario, repartirCentimes, formatEuros } = require(moteur);
  assert.equal(reglesDemo.identifiant, "EQ-001-J3");
  assert.ok(Object.isFrozen(reglesDemo));
  assert.ok(Object.isFrozen(scenariosDemo));
  const attendus = [
    { tresorerieCentimes: 1_170_000, creancesCentimes: 0, actifNetCentimes: 2_670_000, resultatEconomiqueCentimes: 270_000, cashConserveCentimes: 600_000, cashMobilisableCentimes: 570_000, plafondIllustratifCentimes: 270_000, investisseursCentimes: 216_000, operateurCentimes: 54_000, versementAutoriseCentimes: 0 },
    { tresorerieCentimes: 270_000, creancesCentimes: 0, actifNetCentimes: 1_670_000, resultatEconomiqueCentimes: -730_000, cashConserveCentimes: 270_000, cashMobilisableCentimes: 0, plafondIllustratifCentimes: 0, investisseursCentimes: -584_000, operateurCentimes: -146_000, versementAutoriseCentimes: 0 },
    { tresorerieCentimes: 270_000, creancesCentimes: 900_000, actifNetCentimes: 2_670_000, resultatEconomiqueCentimes: 270_000, cashConserveCentimes: 270_000, cashMobilisableCentimes: 0, plafondIllustratifCentimes: 0, investisseursCentimes: 216_000, operateurCentimes: 54_000, versementAutoriseCentimes: 0 },
  ];
  scenariosDemo.forEach((scenario, index) => assert.deepEqual(calculerScenario(scenario), attendus[index]));
  // Le retard conserve le résultat seulement sous l’hypothèse explicite de recouvrabilité.
  assert.equal(attendus[0].resultatEconomiqueCentimes, attendus[2].resultatEconomiqueCentimes);
  assert.equal(attendus[2].plafondIllustratifCentimes, 0);
  // Comptabilisation des frais une fois, aucune double déduction de la dépréciation.
  assert.equal(calculerScenario(scenariosDemo[0], { ...reglesDemo, fraisEthigoneCentimes: 0 }).resultatEconomiqueCentimes, 300_000);
  assert.equal(calculerScenario({ ...scenariosDemo[0], valeurMachinesCentimes: reglesDemo.achatCentimes }).resultatEconomiqueCentimes, 570_000);
  for (const montant of [-730_001, -101, -3, -1, 0, 1, 3, 101, 270_001, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER]) {
    for (const part of [0, 1, 20, 33, 80, 99, 100]) {
      const r = repartirCentimes(montant, part);
      assert.equal(r.investisseursCentimes + r.operateurCentimes, montant);
      assert.ok(Number.isSafeInteger(r.investisseursCentimes));
      assert.ok(Number.isSafeInteger(r.operateurCentimes));
    }
  }
  assert.deepEqual(repartirCentimes(3, 80), { investisseursCentimes: 2, operateurCentimes: 1 });
  assert.deepEqual(repartirCentimes(-3, 80), { investisseursCentimes: -2, operateurCentimes: -1 });
  for (const scenario of scenariosDemo) {
    for (const field of ["loyersDusCentimes", "loyersEncaissesCentimes", "chargesExploitationCentimes", "valeurMachinesCentimes"]) {
      for (const invalid of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "100", null, undefined, true]) assert.throws(() => calculerScenario({ ...scenario, [field]: invalid }));
    }
  }
  for (const field of Object.keys(reglesDemo).filter(field => typeof reglesDemo[field] === "number")) {
    for (const invalid of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "100", null, undefined, true]) assert.throws(() => calculerScenario(scenariosDemo[0], { ...reglesDemo, [field]: invalid }));
  }
  assert.throws(() => calculerScenario({ ...scenariosDemo[0], loyersEncaissesCentimes: 1_000_001 }));
  assert.throws(() => calculerScenario({ ...scenariosDemo[0], valeurMachinesCentimes: 1_800_001 }));
  assert.throws(() => calculerScenario({ ...scenariosDemo[0], chargesExploitationCentimes: 3_000_000 }));
  assert.throws(() => calculerScenario(scenariosDemo[0], { ...reglesDemo, partsCapitalOperateurPourcent: 21 }));
  assert.throws(() => calculerScenario(scenariosDemo[0], { ...reglesDemo, partsBeneficesInvestisseursPourcent: 79 }));
  assert.throws(() => calculerScenario(scenariosDemo[0], { ...reglesDemo, tresorerieInitialeCentimes: 600_001 }));
  assert.throws(() => calculerScenario(scenariosDemo[0], { ...reglesDemo, montantAConserverCentimes: 2_400_001 }));
  for (const field of ["capitalCentimes", "periodeMois", "horizonIndicatifMois"]) assert.throws(() => calculerScenario(scenariosDemo[0], { ...reglesDemo, [field]: 0 }));
  assert.throws(() => calculerScenario({ ...scenariosDemo[0], loyersDusCentimes: Number.MAX_SAFE_INTEGER, loyersEncaissesCentimes: Number.MAX_SAFE_INTEGER }));
  const totalPerdu = calculerScenario({ ...scenariosDemo[0], loyersDusCentimes: 0, loyersEncaissesCentimes: 0, chargesExploitationCentimes: 570_000, valeurMachinesCentimes: 0 });
  assert.equal(totalPerdu.resultatEconomiqueCentimes, -reglesDemo.capitalCentimes);
  assert.equal(totalPerdu.plafondIllustratifCentimes, 0);
  // Invariants sur 81 variantes valides, tous calculs en centimes.
  for (const dus of [0, 500_000, 1_000_001]) for (const encaisses of [0, Math.floor(dus / 2), dus]) for (const charges of [0, 100_003, 500_000]) for (const valeur of [0, 1_400_001, 1_800_000]) {
    const r = calculerScenario({ ...scenariosDemo[0], loyersDusCentimes: dus, loyersEncaissesCentimes: encaisses, chargesExploitationCentimes: charges, valeurMachinesCentimes: valeur });
    for (const montant of Object.values(r)) assert.ok(Number.isSafeInteger(montant));
    assert.equal(r.investisseursCentimes + r.operateurCentimes, r.resultatEconomiqueCentimes);
    assert.equal(r.actifNetCentimes, r.tresorerieCentimes + r.creancesCentimes + valeur);
    assert.equal(r.cashConserveCentimes + r.cashMobilisableCentimes, r.tresorerieCentimes);
    assert.ok(r.plafondIllustratifCentimes >= 0 && r.plafondIllustratifCentimes <= r.cashMobilisableCentimes);
    assert.ok(r.plafondIllustratifCentimes <= Math.max(0, r.resultatEconomiqueCentimes));
    assert.ok(r.resultatEconomiqueCentimes >= -reglesDemo.capitalCentimes);
    assert.equal(r.versementAutoriseCentimes, 0);
  }
  assert.match(formatEuros(101), /1,01/);
  assert.match(formatEuros(-101), /-1,01/);
  assert.throws(() => formatEuros(0.1));
  const composant = path.join(temp, "scenarios.cjs");
  await esbuild.build({ entryPoints: ["src/ui/scenarios-demo.tsx"], outfile: composant, bundle: true, platform: "node", format: "cjs", jsx: "automatic", external: ["react", "react-dom", "react/jsx-runtime"] });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { ScenariosDemo } = require(composant);
  const html = renderToStaticMarkup(React.createElement(ScenariosDemo, { regles: reglesDemo }));
  assert.equal((html.match(/type="button"/g) || []).length, 3);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 2);
  assert.match(html, /Plafond illustratif, non autorisé/);
  assert.match(html, /Versement autorisé : 0 € — revues et contrats absents/);
  assert.match(html, /scope="row"/);
  assert.match(html, /supposées recouvrables/);
  assert.match(html, /sans valeur contractuelle/);
  console.log("J3 économie OK — trois scénarios exacts, invariants, entrées invalides, arrondis et rendu accessible ; aucun réseau ni versement.");
} finally { await rm(temp, { recursive: true, force: true }); }
