/** Jeu pédagogique autonome et fictif : aucun contrat, aucune autorisation de versement. */
export type ReglesDemo = Readonly<{
  identifiant: string;
  capitalCentimes: number;
  achatCentimes: number;
  tresorerieInitialeCentimes: number;
  partsCapitalInvestisseursPourcent: number;
  partsCapitalOperateurPourcent: number;
  partsBeneficesInvestisseursPourcent: number;
  partsBeneficesOperateurPourcent: number;
  fraisEthigoneCentimes: number;
  montantAConserverCentimes: number;
  periodeMois: number;
  horizonIndicatifMois: number;
}>;

export const reglesDemo: ReglesDemo = Object.freeze({
  identifiant: "EQ-001-J3",
  capitalCentimes: 2_400_000,
  achatCentimes: 1_800_000,
  tresorerieInitialeCentimes: 600_000,
  partsCapitalInvestisseursPourcent: 80,
  partsCapitalOperateurPourcent: 20,
  partsBeneficesInvestisseursPourcent: 80,
  partsBeneficesOperateurPourcent: 20,
  fraisEthigoneCentimes: 30_000,
  montantAConserverCentimes: 600_000,
  periodeMois: 12,
  horizonIndicatifMois: 36,
});

export type ScenarioDemo = Readonly<{
  id: string;
  titre: string;
  description: string;
  loyersDusCentimes: number;
  loyersEncaissesCentimes: number;
  chargesExploitationCentimes: number;
  valeurMachinesCentimes: number;
}>;

export const scenariosDemo: readonly ScenarioDemo[] = Object.freeze([
  Object.freeze({ id: "benefice", titre: "Bénéfice", description: "Les loyers fictifs sont intégralement encaissés ; le résultat tient compte de la baisse de valeur des machines.", loyersDusCentimes: 1_000_000, loyersEncaissesCentimes: 1_000_000, chargesExploitationCentimes: 400_000, valeurMachinesCentimes: 1_500_000 }),
  Object.freeze({ id: "perte", titre: "Perte", description: "Les loyers fictifs ne compensent ni les charges ni la baisse de valeur des machines ; le capital subit une perte.", loyersDusCentimes: 400_000, loyersEncaissesCentimes: 400_000, chargesExploitationCentimes: 700_000, valeurMachinesCentimes: 1_400_000 }),
  Object.freeze({ id: "retard", titre: "Retard de paiement", description: "Une partie des loyers reste à recevoir. Un résultat positif ne signifie pas que l’argent est disponible.", loyersDusCentimes: 1_000_000, loyersEncaissesCentimes: 100_000, chargesExploitationCentimes: 400_000, valeurMachinesCentimes: 1_500_000 }),
]);

function entierNonNegatif(nom: string, valeur: number) {
  if (!Number.isSafeInteger(valeur) || valeur < 0) throw new RangeError(`${nom} doit être un entier positif ou nul sûr.`);
}
function nombreSur(valeur: bigint) {
  const nombre = Number(valeur);
  if (!Number.isSafeInteger(nombre)) throw new RangeError("Le calcul dépasse la précision sûre des centimes.");
  return nombre;
}

/** Résidu de division attribué à l’opérateur, y compris pour une perte. */
export function repartirCentimes(montant: number, investisseursPourcent: number) {
  if (!Number.isSafeInteger(montant)) throw new RangeError("Le montant doit être un entier sûr.");
  entierNonNegatif("Part investisseurs", investisseursPourcent);
  if (investisseursPourcent > 100) throw new RangeError("La part doit être comprise entre 0 et 100.");
  const investisseursCentimes = nombreSur(BigInt(montant) * BigInt(investisseursPourcent) / BigInt(100));
  return { investisseursCentimes, operateurCentimes: montant - investisseursCentimes };
}

/** Aucun emprunt ni dette restante : une trésorerie négative est hors de ce modèle. */
export function calculerScenario(scenario: ScenarioDemo, regles: ReglesDemo = reglesDemo) {
  for (const nom of ["capitalCentimes", "achatCentimes", "tresorerieInitialeCentimes", "partsCapitalInvestisseursPourcent", "partsCapitalOperateurPourcent", "partsBeneficesInvestisseursPourcent", "partsBeneficesOperateurPourcent", "fraisEthigoneCentimes", "montantAConserverCentimes", "periodeMois", "horizonIndicatifMois"] as const) entierNonNegatif(nom, regles[nom]);
  for (const nom of ["loyersDusCentimes", "loyersEncaissesCentimes", "chargesExploitationCentimes", "valeurMachinesCentimes"] as const) entierNonNegatif(nom, scenario[nom]);
  for (const nom of ["capitalCentimes", "periodeMois", "horizonIndicatifMois"] as const) {
    if (regles[nom] === 0) throw new RangeError(`${nom} doit être strictement positif.`);
  }
  if (BigInt(regles.achatCentimes) + BigInt(regles.tresorerieInitialeCentimes) !== BigInt(regles.capitalCentimes)) throw new RangeError("Le capital doit couvrir exactement l’achat et la trésorerie initiale.");
  if (regles.montantAConserverCentimes > regles.capitalCentimes) throw new RangeError("La réserve cible dépasse le capital.");
  if (regles.partsCapitalInvestisseursPourcent + regles.partsCapitalOperateurPourcent !== 100 || regles.partsBeneficesInvestisseursPourcent + regles.partsBeneficesOperateurPourcent !== 100) throw new RangeError("Les parts doivent totaliser 100 %.");
  if (scenario.loyersEncaissesCentimes > scenario.loyersDusCentimes) throw new RangeError("Les encaissements dépassent les loyers dus.");
  if (scenario.valeurMachinesCentimes > regles.achatCentimes) throw new RangeError("La valeur des machines ne peut dépasser leur coût d’achat dans cette démonstration.");

  const tresorerieCentimes = nombreSur(BigInt(regles.capitalCentimes) - BigInt(regles.achatCentimes) + BigInt(scenario.loyersEncaissesCentimes) - BigInt(scenario.chargesExploitationCentimes) - BigInt(regles.fraisEthigoneCentimes));
  if (tresorerieCentimes < 0) throw new RangeError("Une trésorerie négative nécessiterait un financement absent du modèle.");
  const creancesCentimes = scenario.loyersDusCentimes - scenario.loyersEncaissesCentimes;
  const actifNetCentimes = nombreSur(BigInt(tresorerieCentimes) + BigInt(creancesCentimes) + BigInt(scenario.valeurMachinesCentimes));
  const resultatEconomiqueCentimes = nombreSur(BigInt(actifNetCentimes) - BigInt(regles.capitalCentimes));
  if (resultatEconomiqueCentimes < -regles.capitalCentimes) throw new RangeError("La perte dépasse le capital, hors du modèle.");
  const cashConserveCentimes = Math.min(tresorerieCentimes, regles.montantAConserverCentimes);
  const cashMobilisableCentimes = Math.max(0, tresorerieCentimes - regles.montantAConserverCentimes);
  const plafondIllustratifCentimes = Math.min(Math.max(0, resultatEconomiqueCentimes), cashMobilisableCentimes);
  const partsResultat = repartirCentimes(resultatEconomiqueCentimes, resultatEconomiqueCentimes < 0 ? regles.partsCapitalInvestisseursPourcent : regles.partsBeneficesInvestisseursPourcent);
  return Object.freeze({ tresorerieCentimes, creancesCentimes, actifNetCentimes, resultatEconomiqueCentimes, cashConserveCentimes, cashMobilisableCentimes, plafondIllustratifCentimes, ...partsResultat, versementAutoriseCentimes: 0 as const });
}

export function formatEuros(centimes: number) {
  if (!Number.isSafeInteger(centimes)) throw new RangeError("Montant en centimes invalide.");
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: centimes % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(centimes / 100);
}
