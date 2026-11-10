import { repartirCentimes, type ReglesDemo } from "./demo";

/** Chaque essai est une projection indépendante sur le capital investisseurs de référence. */
export function projeterEssai(montantCentimes: number, regles: ReglesDemo, resultatInvestisseursCentimes: number, distributionInvestisseursCentimes: number) {
  const capitalInvestisseurs = repartirCentimes(regles.capitalCentimes, regles.partsCapitalInvestisseursPourcent).investisseursCentimes;
  for (const montant of [montantCentimes, resultatInvestisseursCentimes, distributionInvestisseursCentimes]) {
    if (!Number.isSafeInteger(montant)) throw new RangeError("Centimes exacts requis.");
  }
  if (capitalInvestisseurs <= 0 || montantCentimes <= 0 || montantCentimes > capitalInvestisseurs || distributionInvestisseursCentimes < 0) throw new RangeError("Projection hors du capital de référence.");
  const part = (centimes: number) => Number(BigInt(centimes) * BigInt(montantCentimes) / BigInt(capitalInvestisseurs));
  return { resultatCentimes: part(resultatInvestisseursCentimes), distributionCentimes: part(distributionInvestisseursCentimes), capitalInvestisseursCentimes: capitalInvestisseurs };
}
