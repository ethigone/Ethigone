"use client";

import { useState } from "react";
import { calculerScenario, formatEuros, type ReglesDemo, scenariosDemo } from "../economie/demo";

export function ScenariosDemo({ regles }: { regles: ReglesDemo }) {
  const [selection, setSelection] = useState(scenariosDemo[0].id);
  const scenario = scenariosDemo.find(item => item.id === selection) ?? scenariosDemo[0];
  const resultat = calculerScenario(scenario, regles);
  const lignes: [string, number][] = [
    ["Capital initial", regles.capitalCentimes],
    ["Achat des machines", regles.achatCentimes],
    ["Trésorerie initiale après achat", regles.tresorerieInitialeCentimes],
    ["Loyers dus sur la période", scenario.loyersDusCentimes],
    ["Loyers encaissés", scenario.loyersEncaissesCentimes],
    ["Charges d’exploitation", scenario.chargesExploitationCentimes],
    ["Frais ETHIGONE, une seule fois sur la période", regles.fraisEthigoneCentimes],
    ["Trésorerie en fin de période", resultat.tresorerieCentimes],
    ["Créances de loyers supposées recouvrables (hors cash)", resultat.creancesCentimes],
    ["Valeur restante des machines (hors cash)", scenario.valeurMachinesCentimes],
    ["Actif net : trésorerie + créances + machines", resultat.actifNetCentimes],
    ["Résultat économique : actif net − capital", resultat.resultatEconomiqueCentimes],
    ["Cash conservé dans la trésorerie", resultat.cashConserveCentimes],
    ["Cash mobilisable après réserve cible", resultat.cashMobilisableCentimes],
    ["Plafond illustratif, non autorisé", resultat.plafondIllustratifCentimes],
    ["Part du résultat des investisseurs", resultat.investisseursCentimes],
    ["Part du résultat de l’opérateur", resultat.operateurCentimes],
  ];
  return <section className="scenario-demo" aria-labelledby="scenarios-titre">
    <h2 id="scenarios-titre">Trois scénarios fictifs sur {regles.periodeMois} mois</h2>
    <p className="scenario-caption">Jeu pédagogique {regles.identifiant} : budget fixe de {formatEuros(regles.capitalCentimes)}. Aucune donnée d’exploitation réelle. Ces chiffres ne sont ni des résultats réalisés ni un rendement projeté.</p>
    <div className="scenario-controls" role="group" aria-label="Choisir un scénario fictif">
      {scenariosDemo.map(item => <button key={item.id} type="button" aria-pressed={scenario.id === item.id} aria-controls="scenario-resultats" onClick={() => setSelection(item.id)}>{item.titre}</button>)}
    </div>
    <div className="scenario-panel" id="scenario-resultats" role="region" aria-labelledby="scenario-titre" aria-live="polite" aria-atomic="true">
      <h3 id="scenario-titre">{scenario.titre} · exemple fictif</h3>
      <p>{scenario.description}</p>
      <dl className="scenario-key-figures">
        <div><dt>Résultat illustratif</dt><dd>{formatEuros(resultat.resultatEconomiqueCentimes)}</dd></div>
        <div><dt>Trésorerie restante</dt><dd>{formatEuros(resultat.tresorerieCentimes)}</dd></div>
        <div><dt>Versement autorisé</dt><dd>{formatEuros(resultat.versementAutoriseCentimes)}</dd></div>
      </dl>
      <div className="scenario-table-wrap">
        <table className="scenario-table">
          <caption>Calcul en euros à la fin des {regles.periodeMois} mois — {scenario.titre.toLowerCase()}</caption>
          <thead><tr><th scope="col">Poste</th><th scope="col">Montant fictif</th></tr></thead>
          <tbody>{lignes.map(([libelle, montant]) => <tr key={libelle}><th scope="row">{libelle}</th><td>{formatEuros(montant)}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="scenario-status"><strong>Versement autorisé : 0 € — revues et contrats absents</strong></p>
      <p className="scenario-warning">Risque de perte partielle ou totale du capital. {resultat.resultatEconomiqueCentimes < 0 ? "La perte de cet exemple est supportée selon les apports au capital." : "Le gain de cet exemple est fictif et ne constitue pas un rendement projeté."} Les créances et les machines ne sont pas du cash. Les créances sont supposées recouvrables pour ce calcul : un impayé impose de les déprécier et réduit le résultat.</p>
    </div>
    <p className="scenario-caption">Apports au capital : investisseurs {regles.partsCapitalInvestisseursPourcent} %, opérateur {regles.partsCapitalOperateurPourcent} % ; pertes selon ces apports. Bénéfices : hypothèse de démonstration {regles.partsBeneficesInvestisseursPourcent}/{regles.partsBeneficesOperateurPourcent}, sans valeur contractuelle. Arrondi au centime, résidu attribué à l’opérateur. Les parts portent sur le résultat économique, sans autorisation de distribution.</p>
    <p className="scenario-caption">Les frais de {formatEuros(regles.fraisEthigoneCentimes)} couvrent la présentation, le rapprochement des justificatifs et le reporting ; ils sont une charge du projet avant résultat, comptée une seule fois sur {regles.periodeMois} mois. La baisse de valeur des machines est déjà comprise dans l’actif net. Aucun emprunt ni dette restante dans cet exemple. Réserve cible : {formatEuros(regles.montantAConserverCentimes)} ; le cash conservé est limité à la trésorerie disponible.</p>
    <p className="scenario-caption">Plafond illustratif = minimum du résultat positif et du cash mobilisable ; cash mobilisable = maximum de zéro et de la trésorerie diminuée de la réserve cible. Ce calcul pédagogique ne vaut pas décision de versement.</p>
  </section>;
}
