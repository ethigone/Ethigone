import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { lireReglesDemo } from "@/src/data/registre";
import { formatEuros } from "@/src/economie/demo";
import { ScenariosDemo } from "@/src/ui/scenarios-demo";

export const metadata = { title: "Règles et scénarios" };

export const dynamic = "force-dynamic";

export default async function Regles() {
  const r = await lireReglesDemo();
  return <Cadre active="/regles">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Règles et scénarios</div>
    <section className="intro"><Rubrique numero="EQ-001">Atelier Lavage · Hypothèses du 2 novembre 2026</Rubrique>
      <h1>Comprendre le résultat<br />avant de participer.</h1>
      <p className="lead">Un même lot, trois situations. Voyez pourquoi les loyers, la valeur du matériel et l’argent disponible ne racontent pas la même chose.</p>
      <div className="tags"><span>Exemple fictif</span><span>Contrats non établis</span><span>Aucun versement</span><span>Version {r.identifiant}</span></div>
    </section>
    <nav className="chapter" aria-label="Sommaire des règles"><a href="#apports">01 · Apports</a><a href="#partage">02 · Partage et frais</a><a href="#scenarios">03 · Scénarios</a><a href="#sortie">04 · Durée et sortie</a></nav>
    <section className="split" id="apports"><div><Rubrique numero="01">Capital fictif</Rubrique><h2>Ce qui serait financé</h2><p>Ce jeu pédagogique fixe complète le prix d’achat du lot. Ce n’est ni un budget approuvé, ni une collecte ouverte.</p></div><div>
      <dl className="facts">
        <div><dt>Investisseurs réunis · {r.partsCapitalInvestisseursPourcent} %</dt><dd>{formatEuros(r.capitalCentimes * r.partsCapitalInvestisseursPourcent / 100)}</dd></div>
        <div><dt>Opérateur · {r.partsCapitalOperateurPourcent} %</dt><dd>{formatEuros(r.capitalCentimes * r.partsCapitalOperateurPourcent / 100)}</dd></div>
        <div><dt>Capital total de l’exemple</dt><dd>{formatEuros(r.capitalCentimes)}</dd></div>
        <div><dt>Achat des 12 machines</dt><dd>{formatEuros(r.achatCentimes)} · 1 500 € par machine</dd></div>
        <div><dt>Trésorerie initiale</dt><dd>{formatEuros(r.tresorerieInitialeCentimes)} pour les dépenses à venir. C’est du capital, pas un bénéfice.</dd></div>
      </dl>
      <p className="source">Tous les chiffres sont inventés pour tester les règles. Aucun apport d’opérateur n’est acquis. Les montants en euros ne sont pas convertis en USDC : aucun taux de change ou équivalence 1 € = 1 USDC n’est supposé.</p>
    </div></section>
    <section className="split" id="partage"><div><Rubrique numero="02">Répartition envisagée</Rubrique><h2>Partager le résultat,<br />supporter les pertes</h2><p>La Musharaka reste une hypothèse à examiner. Les règles ci-dessous sont celles de la démonstration, pas des conditions d’investissement acceptables en l’état.</p></div><div>
      <dl className="facts">
        <div><dt>Bénéfice</dt><dd>{r.partsBeneficesInvestisseursPourcent} % pour les investisseurs réunis et {r.partsBeneficesOperateurPourcent} % pour l’opérateur dans cet exemple. Ce choix fictif n’est pas une règle universelle ni un taux de rendement.</dd></div>
        <div><dt>Perte ordinaire</dt><dd>Répartition selon les apports au capital, ici {r.partsCapitalInvestisseursPourcent}/{r.partsCapitalOperateurPourcent}. Une faute, une négligence ou une violation contractuelle exige un examen distinct des responsabilités.</dd></div>
        <div><dt>Service ETHIGONE</dt><dd>{formatEuros(r.fraisEthigoneCentimes)} au titre de l’unique période de {r.periodeMois} mois illustrée, payés par le projet à ETHIGONE pour la présentation du dossier, le rapprochement des justificatifs et le reporting. Charge déduite une seule fois avant le résultat, même en cas de perte.</dd></div>
        <div><dt>Frais à valider</dt><dd>Le contrat de services, les conflits d’intérêts et sa rémunération doivent être examinés séparément. Le montant de 300 € ne prouve pas la viabilité d’ETHIGONE. Ni tarif commercial ni rémunération charia validée.</dd></div>
        <div><dt>À l’intérieur du groupe investisseur</dt><dd>La part de chacun serait calculée selon son apport dans ce groupe. Les règles d’arrondi, les dates d’entrée et les droits exacts devront figurer au contrat.</dd></div>
      </dl>
      <Lien href="/charia" discret>Voir les examens et pièces manquantes</Lien>
    </div></section>
    <section className="reading" id="scenarios"><Rubrique numero="03">Explorer les conséquences</Rubrique><h2>Et si l’activité change&nbsp;?</h2>
      <p className="paragraph-gap">Instantané après {r.periodeMois} mois, avant toute distribution. Les charges de l’exemple sont entièrement payées, sans dette restante ni distribution antérieure. Le résultat est une variation d’actif net simplifiée, avant fiscalité ; il ne vaut pas bénéfice distribuable validé.</p>
      <ScenariosDemo regles={r} />
      <details className="method-note"><summary>Comment lire ce calcul&nbsp;?</summary>
        <ul className="simple-list"><li>Trésorerie = capital initial − achat des machines + loyers encaissés − dépenses − frais ETHIGONE.</li><li>Créances = loyers dus − loyers encaissés. Leur recouvrement est supposé pour l’exemple ; un impayé définitif réduirait le résultat.</li><li>Résultat économique illustratif = trésorerie + créances + valeur restante des machines − capital initial. La baisse de valeur est donc déjà prise en compte.</li><li>Le plafond illustratif ne dépasse ni ce résultat positif ni la trésorerie au-delà des {formatEuros(r.montantAConserverCentimes)} à conserver par hypothèse. Ce seuil n’est pas une charge supplémentaire.</li></ul>
        <p className="paragraph-gap">Fiscalité, coûts de conversion, coûts réseau et coûts de liquidation ne sont pas chiffrés. Les valeurs restantes sont des hypothèses, pas des expertises. Leur méthode et les régularisations finales restent à faire valider. Ce calcul n’autorise aucune distribution.</p>
      </details>
    </section>
    <section className="split" id="sortie"><div><Rubrique numero="04">Temps et liquidité</Rubrique><h2>Quand récupérer<br />son argent&nbsp;?</h2><p>Ni l’application ni Centrifuge ne créent un acheteur pour les machines ou les parts.</p></div><div>
      <dl className="facts">
        <div><dt>Collecte de démonstration</dt><dd>Règle à implémenter : fenêtre fictive de 30 jours, activation uniquement si les apports investisseurs et opérateur sont complets. Aucun achat avant activation.</dd></div>
        <div><dt>Objectif non atteint</dt><dd>Annulation du scénario et restitution intégrale des participations fictives, sans frais de service. Cette restitution n’est pas encore implémentée. Les modalités et frais d’un éventuel remboursement réel restent à contractualiser.</dd></div>
        <div><dt>Horizon indicatif</dt><dd>{r.horizonIndicatifMois} mois dans l’hypothèse de travail. Les scénarios ci-dessus illustrent seulement les {r.periodeMois} premiers mois. Cet horizon ne crée aucune échéance de remboursement garantie.</dd></div>
        <div><dt>Sortie anticipée</dt><dd>Aucun marché secondaire ni rachat promis. Toute cession demanderait un acquéreur admissible, une valorisation et des conditions contractuelles validées.</dd></div>
        <div><dt>À la fin de l’activité</dt><dd>Vendre les équipements, recouvrer les sommes dues, payer les charges et établir les comptes avant la répartition finale. Le délai et le montant peuvent être inférieurs aux attentes ; une perte reste possible.</dd></div>
      </dl><Lien href="/projets/atelier-lavage" discret>Revenir à la fiche projet</Lien>
    </div></section>
  </Cadre>;
}
