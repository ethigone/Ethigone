import { Cadre, Lien } from "@/src/ui/site";
import { dateRechercheOperateurs, pistesOperateurs, preuvesPreselection } from "@/src/data/recherche-operateurs";

export const metadata = { title: "Trouver et présélectionner un opérateur" };

export default function RechercheOperateurs() {
  return <Cadre active="/recherche-operateurs">
    <div className="crumb"><a href="/proposer-projet">Proposer un projet</a><span aria-hidden="true">/</span>Recherche d’opérateurs</div>
    <section className="intro">
      <h1>Du premier nom<br />au dossier à examiner.</h1>
      <p className="lead">Pour Atelier Lavage, chercher une entreprise capable de louer un parc de machines, de l’entretenir et de justifier ses résultats.</p>
      <p className="paragraph-gap">Cette méthode prépare une future recherche. Les ressources françaises servent d’exemple documentaire. La zone du pilote reste à choisir.</p>
      <div className="actions"><Lien href="/proposer-projet">Essayer le dossier fictif</Lien><a href="#criteres">Voir les critères</a></div>
    </section>
    <nav className="chapter" aria-label="Étapes de recherche"><a href="#profil">Qui chercher</a><a href="#sources">Où chercher</a><a href="#criteres">Quoi vérifier</a><a href="#suite">Comment avancer</a></nav>
    <section className="split" id="profil">
      <div><h2>Un opérateur déjà actif</h2><p>Partir de son métier et de son besoin d’équipement.</p></div>
      <div>
        <p>Le profil à explorer serait un loueur, un installateur-mainteneur ou un exploitant ayant une activité de location documentée. Il devrait pouvoir suivre chaque machine, gérer les contrats et produire des comptes réguliers.</p>
        <dl className="facts">
          <div><dt>Zone</dt><dd>Une zone où l’entretien et la récupération des machines peuvent être organisés.</dd></div>
          <div><dt>Besoin</dt><dd>Un lot identifiable, lié à une demande locative et à un budget justifié.</dd></div>
          <div><dt>Responsable</dt><dd>Une personne habilitée à engager l’entreprise, puis des responsables opérationnels et comptables identifiés.</dd></div>
        </dl>
      </div>
    </section>
    <section className="reading" id="sources">
      <h2>Où ouvrir la recherche</h2>
      <p className="paragraph-gap">Commencer par les informations publiques, les recouper et noter les inconnues. Les organismes ci-dessous sont des sources documentaires.</p>
      <div className="source-cards pistes-operateurs">{pistesOperateurs.map(p => <article key={p.id} id={"piste-" + p.id}>
        <h3>{p.titre}</h3><p>{p.usage}</p><p>{p.approche}</p>
        <p className="source">{p.limite}</p><a className="action text-action" href={p.url}>{p.lien}</a>
      </article>)}</div>
      <p className="source">Références consultées le {dateRechercheOperateurs}. Aucun opérateur sélectionné ni partenariat conclu dans cette recherche.</p>
    </section>
    <section className="reading criteres-recherche" id="criteres">
      <h2>Présélectionner avec des preuves</h2>
      <p className="paragraph-gap">Pour chaque point, distinguer ce qui est documenté, ce qui reste à vérifier et ce qui constitue un obstacle. Chaque décision de la démo conserve son motif.</p>
      <div className="criteres-liste">{preuvesPreselection.map(([titre, question, preuve]) => <article key={titre}>
        <h3>{titre}</h3><div><p>{question}</p><p className="source">{preuve}</p></div>
      </article>)}</div>
      <div className="review-note"><strong>Existence légale et capacité financière</strong>
        <p>Un registre aide à identifier l’entreprise. Pour apprécier sa capacité réelle, il faudra examiner ses comptes, ses engagements, ses références et ses moyens d’exploitation. Certaines données financières peuvent rester confidentielles.</p>
        <a className="action text-action" href="https://annuaire-entreprises.data.gouv.fr/faq/donnees-financieres">Comprendre les données financières disponibles</a>
      </div>
    </section>
    <section className="split" id="suite">
      <div><h2>Comment avancer ensuite</h2><p>Le sprint actuel s’arrête à la démonstration du dossier et de son traitement.</p></div>
      <ol className="etapes guide-etapes">
        <li><div><h3>Définir la recherche</h3><p>Fixer une zone et un type de lot, puis repérer les entreprises déjà actives. Garder la source et la date de chaque information.</p></div></li>
        <li><div><h3>Comparer les éléments publics</h3><p>Vérifier l’identité, le service proposé et les références d’exploitation. Inscrire les preuves manquantes dans la candidature.</p></div></li>
        <li><div><h3>Préparer une qualification future</h3><p>Après autorisation de M. EthiMan, demander qui exploiterait le lot, quels clients le loueraient, quels seraient les coûts et quelles pièces pourraient être fournies. Cette étape de contact reste à organiser.</p></div></li>
        <li><div><h3>Faire examiner le dossier complet</h3><p>Un dossier « À approfondir » demande encore l’examen de l’activité, des contrats, des frais et du stablecoin par les professionnels compétents. Les statuts du logiciel servent au suivi du travail.</p><a href="/charia#examens">Pièces et avis charia et juridiques attendus</a></div></li>
      </ol>
    </section>
    <aside className="help-band"><div><h2>Tester cette présélection</h2><p>Préparez une candidature avec les données fictives d’Atelier Lavage.</p></div><Lien href="/proposer-projet">Proposer un projet fictif</Lien></aside>
  </Cadre>;
}
