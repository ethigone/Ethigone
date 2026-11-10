import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { dateRevue, examensJ3, sourcesJ3 } from "@/src/economie/sources";

export const metadata = { title: "Charia et cadre juridique" };

export default function Charia() {
  return <Cadre active="/charia">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Charia et cadre juridique</div>
    <section className="intro"><Rubrique numero="REVUE">Dossier du {dateRevue}</Rubrique><h1>Où en est la revue charia&nbsp;?</h1><p className="lead">La conformité charia est une condition du projet. L’activité de location, les contrats et les mouvements d’argent doivent encore être examinés par des professionnels qualifiés.</p></section>
    <section className="split" id="statut"><div><Rubrique numero="01">Statut réel</Rubrique><h2>Travail préparatoire</h2></div><div>
      <div className="review-note"><strong>Aucune certification · Aucun avis juridique obtenu</strong><p>Les vérifications documentaires et les relectures d’agents préparent un dossier. Elles ne remplacent ni l’avis d’un professionnel qualifié ni les autorisations nécessaires. La démonstration ne reçoit aucun fonds.</p></div>
      <p>La Musharaka est la base envisagée, à confirmer sur l’opération exacte. Ni le ratio de l’exemple, ni USDC, ni les frais ETHIGONE ne sont certifiés. Aucun partenaire, opérateur ou réviseur externe n’est engagé.</p>
      <Lien href="/regles#partage" discret>Lire les hypothèses de partage</Lien>
    </div></section>
    <section className="split" id="examens"><div><Rubrique numero="02">Avant un pilote réel</Rubrique><h2>Pièces et avis attendus</h2><p>Pour chaque point, le dossier indique la pièce à produire, le professionnel compétent et l’état de l’examen.</p></div>
      <div className="review-items">{examensJ3.map(e => <article key={e.titre}><h3>{e.titre}</h3><p>{e.piece}</p><p className="source">Examen attendu : {e.responsable}</p><span className="review-status">{e.statut}</span></article>)}</div>
    </section>
    <section className="split" id="juridique"><div><Rubrique numero="03">Périmètre juridique</Rubrique><h2>Qualifier avant<br />de proposer</h2><p>France et Union européenne : grille de questions conditionnelle, pas choix d’implantation. Aucun fonds, holding ou véhicule n’est décidé ici.</p></div><div>
      <p>Les pays concernés, les droits représentés par les parts et les services rendus doivent être déterminés avant de conclure au régime applicable. La tokenisation ne répond pas à ces questions.</p>
      <dl className="facts"><div><dt>Le stablecoin</dt><dd>Moyen envisagé pour les flux. Son émission, sa garde et sa conversion doivent être examinées.</dd></div><div><dt>La part du projet</dt><dd>Droits économiques et juridiques à définir. Elle ne devient pas un simple stablecoin parce qu’on y souscrit avec USDC.</dd></div><div><dt>La plateforme</dt><dd>Sélection, présentation, transmission, gestion ou distribution : les activités effectivement fournies déterminent les obligations à examiner.</dd></div></dl>
      <p className="paragraph-gap">Notre conclusion de conception : faire qualifier le pool, l’offre et les services ensemble, puis fixer les pays et publics admissibles. Aucune admission réelle n’est ouverte dans cette version.</p>
    </div></section>
    <section className="reading" id="sources"><Rubrique numero="04">Références primaires</Rubrique><h2>Ce qui fonde les questions</h2><p>Sources vérifiées le {dateRevue}. Elles éclairent les examens ; aucune ne certifie ce projet.</p>
      <div className="source-cards">{sourcesJ3.map(s => <article key={s.id} id={"source-" + s.id}><h3><a href={s.url}>{s.titre}</a></h3><p className="source">{s.repere}</p><p>{s.lecture}</p><small>{s.acces}</small></article>)}</div>
      <Lien href="/fonctionnement" discret>Voir les responsabilités des intervenants</Lien>
    </section>
  </Cadre>;
}
