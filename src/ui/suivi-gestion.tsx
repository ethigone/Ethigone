import type { SituationDetail, SituationResume, TypeOperationGestion } from "@/src/data/gestion";
import { formatEuros } from "@/src/economie/demo";

export const typesOperation: Record<TypeOperationGestion, string> = {
  recette: "Nouvelle location encaissée", encaissement: "Encaissement d’une créance", depense: "Dépense payée",
  valorisation: "Nouvelle valeur des machines", incident: "Incident sans mouvement d’argent",
};

export function ListeSituations({ situations, chemin, selection }: { situations: SituationResume[]; chemin: string; selection?: string }) {
  return <nav className="situations-liste" aria-label="Situations de gestion">
    {situations.map(s => <a key={s.id} href={chemin + "?id=" + s.id} aria-current={s.id === selection ? "page" : undefined}>
      <strong>{s.titre}</strong><span>{s.statut === "distribuee" ? "Distribution fictive enregistrée" : "Simulation ouverte"} · révision {s.revision}</span>
      <small>Référence {s.id.slice(0, 8)}</small>
    </a>)}
  </nav>;
}

export function BilanGestion({ situation: s }: { situation: SituationDetail }) {
  const b = s.bilan;
  return <section className="bilan-gestion">
    <div className="gestion-titre"><div><span className="etiquette-demo">Situation fictive · {s.id.slice(0, 8)}</span><h2>{s.titre}</h2></div>
      <span className="review-status">{s.statut === "distribuee" ? "Situation clôturée" : "Révision " + s.revision}</span></div>
    <p>État pédagogique sur {s.regles.periodeMois} mois, construit depuis « {s.initial.titre} ». Règles archivées {s.reglesId}.</p>
    <dl className="scenario-key-figures gestion-chiffres">
      <div><dt>Valeur restante des machines</dt><dd>{formatEuros(s.valeurMachinesCentimes)}</dd></div>
      <div><dt>Résultat économique</dt><dd>{formatEuros(b.resultatEconomiqueCentimes)}</dd></div>
      <div><dt>Liquidités après simulation</dt><dd>{formatEuros(s.tresorerieApresCentimes)}</dd></div>
    </dl>
    <div className="registre-cadre"><table className="scenario-table"><caption>Détail du calcul en euros fictifs</caption><tbody>
      <tr><th scope="row">Capital de référence</th><td>{formatEuros(s.regles.capitalCentimes)}</td></tr>
      <tr><th scope="row">Loyers acquis</th><td>{formatEuros(s.loyersDusCentimes)}</td></tr>
      <tr><th scope="row">Loyers encaissés</th><td>{formatEuros(s.loyersEncaissesCentimes)}</td></tr>
      <tr><th scope="row">Créances supposées recouvrables</th><td>{formatEuros(b.creancesCentimes)}</td></tr>
      <tr><th scope="row">Charges d’exploitation payées</th><td>{formatEuros(s.chargesExploitationCentimes)}</td></tr>
      <tr><th scope="row">Charge ETHIGONE, une fois sur cette période</th><td>{formatEuros(s.regles.fraisEthigoneCentimes)}</td></tr>
      <tr><th scope="row">Trésorerie avant distribution fictive</th><td>{formatEuros(b.tresorerieCentimes)}</td></tr>
      <tr><th scope="row">Cible de trésorerie conservée</th><td>{formatEuros(s.regles.montantAConserverCentimes)}</td></tr>
      <tr><th scope="row">Plafond calculé avant distribution</th><td>{formatEuros(b.plafondIllustratifCentimes)}</td></tr>
      <tr><th scope="row">Distribution fictive enregistrée</th><td>{formatEuros(s.distribution?.totalCentimes ?? 0)}</td></tr>
      <tr><th scope="row">Versement réel autorisé</th><td>{formatEuros(b.versementAutoriseCentimes)}</td></tr>
    </tbody></table></div>
    <p className="source">Le résultat simplifié est la trésorerie avant distribution + les créances + la valeur des machines − le capital. Le plafond retient le plus petit montant entre bénéfice positif et cash au-delà de la cible. Une distribution réduit les liquidités, le résultat économique affiché conserve sa valeur avant distribution.</p>
    {s.distribution && <div className="confirmation-enregistree">
      <strong>Distribution fictive enregistrée</strong><p>{formatEuros(s.distribution.investisseursCentimes)} pour l’ensemble des investisseurs de référence et {formatEuros(s.distribution.operateurCentimes)} pour l’opérateur fictif.</p>
      <small>{new Date(s.distribution.date).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · Référence {s.distribution.id}</small>
      <p>Cette situation est clôturée après son unique distribution simulée. Aucun paiement ni crédit de compte n’a lieu.</p>
    </div>}
    <details className="method-note"><summary>Provenance et limites des chiffres</summary>
      <p>Le scénario initial « {s.initial.titre} » est une hypothèse pédagogique J3. Il comprend {formatEuros(s.initial.loyersDusCentimes)} de loyers acquis, {formatEuros(s.initial.loyersEncaissesCentimes)} encaissés, {formatEuros(s.initial.chargesExploitationCentimes)} de charges et {formatEuros(s.initial.valeurMachinesCentimes)} de machines. Les mouvements ci-dessous font évoluer cette base.</p>
      <p>Les {formatEuros(s.regles.tresorerieInitialeCentimes)} de trésorerie initiale proviennent du capital. L’entretien d’exemple J4 est conservé dans le registre et exclu de ces situations. Chaque situation est indépendante et concerne le même projet fictif.</p>
      <p>Calcul avant fiscalité, sans dette, change, frais de réseau ni liquidation. Les pièces sont des textes fictifs saisis pour la démonstration. <a href="/regles">Règles et hypothèses</a> · <a href="/charia">Examens charia et juridiques nécessaires</a>.</p>
    </details>
  </section>;
}

export function PiecesGestion({ situation }: { situation: SituationDetail }) {
  return <section className="portefeuille-section"><h2>Mouvements et justificatifs fictifs</h2>
    {situation.operations.length ? <div className="risques">{situation.operations.map(op => <details key={op.id}>
      <summary>{op.libelle} · {op.type === "incident" ? "Incident" : formatEuros(op.montantCentimes)}</summary>
      <p>{typesOperation[op.type]} · {new Date(op.date).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
      <p className="document-demo">{op.pieceTexte}</p><small className="source">Pièce texte fictive · Référence {op.id}</small>
    </details>)}</div> : <p className="espace-vide">La situation reprend uniquement les hypothèses initiales. Aucun mouvement complémentaire enregistré.</p>}
  </section>;
}
