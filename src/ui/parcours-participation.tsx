import type { ReglesDemo } from "@/src/economie/demo";
import { formatEuros } from "@/src/economie/demo";

export function EtapesParticipation({ etape }: { etape: 2 | 3 | 4 }) {
  const labels = ["Projet", "Conditions et montant", "Récapitulatif", "Portefeuille"];
  return <ol className="participation-etapes" aria-label="Étapes de participation">
    {labels.map((label, index) => <li key={label} aria-current={index + 1 === etape ? "step" : undefined}>
      <span>{String(index + 1).padStart(2, "0")}</span>{label}
    </li>)}
  </ol>;
}

export function HypothesesParticipation({ regles }: { regles: ReglesDemo }) {
  return <dl className="facts">
    <div><dt>Version conservée</dt><dd>{regles.identifiant}</dd></div>
    <div><dt>Capital du scénario</dt><dd>{formatEuros(regles.capitalCentimes)}, dont {regles.partsCapitalInvestisseursPourcent} % apportés par les investisseurs réunis.</dd></div>
    <div><dt>Résultat et pertes</dt><dd>Partage illustratif du bénéfice {regles.partsBeneficesInvestisseursPourcent}/{regles.partsBeneficesOperateurPourcent} entre investisseurs réunis et opérateur. Les pertes ordinaires suivent les apports. Capital, rendement et sortie sans garantie.</dd></div>
    <div><dt>Frais du projet</dt><dd>{formatEuros(regles.fraisEthigoneCentimes)} pour ETHIGONE, comptés une fois dans les {regles.periodeMois} mois illustrés.</dd></div>
    <div><dt>Durée et validations</dt><dd>Horizon indicatif de {regles.horizonIndicatifMois} mois. Contrats, fiscalité et examens charia et juridique à valider avant un pilote réel.</dd></div>
  </dl>;
}

export function AccesCentrifuge() {
  return <aside className="test-separe">
    <h2>Explorer Centrifuge sur Sepolia</h2>
    <p>Un autre écran permet de lire le pool externe RWAt et d’essayer la connexion d’un wallet de test. La simulation Atelier Lavage est enregistrée dans ETHIGONE. Elle reste indépendante de ce pool.</p>
    <a className="action text-action" href="/connexion-test">Ouvrir la connexion de test</a>
  </aside>;
}
