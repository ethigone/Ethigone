import { fichePath, lireProjet } from "@/src/data/lecture";
import { Cadre, Chiffres, Lien, Planche, Rubrique } from "@/src/ui/site";
import { lireReglesDemo } from "@/src/data/registre";
import { formatEuros } from "@/src/economie/demo";

export const metadata = { title: "Atelier Lavage · Fiche projet" };
export const dynamic = "force-dynamic";

export default async function FicheProjet() {
  const [p, r] = await Promise.all([lireProjet(), lireReglesDemo()]);
  return <Cadre active={fichePath}>
    <div className="crumb"><a href="/projets">Projets</a><span aria-hidden="true">/</span>{p.nom}</div>
    <section className="detail-head">
      <div><Rubrique numero={p.reference}>Dossier de démonstration</Rubrique>
        <h1>{p.nom}</h1>
        <p className="lead">Un parc de {p.quantite} lave-linge professionnels destinés à la location auprès de résidences collectives.</p>
        <div className="tags"><span>Projet fictif</span><span>Location de matériel</span></div>
      </div><Planche projet={p} />
    </section>
    <nav className="chapter" aria-label="Sommaire du dossier"><a href="#budget">01 · Budget</a><a href="#activite">02 · Exploitation</a><a href="#risques">03 · Risques</a><a href="#conditions">04 · Participation</a></nav>
    <section className="split" id="budget"><div><Rubrique numero="01">Hypothèses</Rubrique><h2>Budget du lot</h2></div><div>
      <Chiffres projet={p} /><p className="source">Prix fictifs définis pour la démonstration. Le total couvre uniquement l’achat des machines. Aucun devis fournisseur.</p>
      <p className="paragraph-gap">Le jeu de scénarios ajoute {formatEuros(r.tresorerieInitialeCentimes)} de trésorerie initiale aux {formatEuros(r.achatCentimes)} d’achat : {formatEuros(r.capitalCentimes)} de capital fictif au total. Les coûts réels restent à documenter.</p>
      <Lien href="/regles#apports" discret>Voir les apports et emplois du capital</Lien>
      <h3>Coûts à documenter séparément</h3><ul className="simple-list">{p.couts.map(c => <li key={c}>{c}</li>)}</ul>
    </div></section>
    <section className="split" id="activite"><div><Rubrique numero="02">Exploitation</Rubrique><h2>Du matériel aux loyers</h2><p>Dans ce scénario, un opérateur achèterait et entretiendrait les machines. Les résidences verseraient un loyer pour les utiliser.</p></div><ol className="etapes">
      {p.etapes.map(e => <li key={e.titre}><div><h3>{e.titre}</h3><p>{e.detail}</p></div></li>)}
    </ol></section>
    <section className="split" id="risques"><div><Rubrique numero="03">Points de vigilance</Rubrique><h2>Ce qui peut mal se passer</h2></div><div className="risques">
      {p.risques.map((r,i) => <details key={r.titre} open={i===0}><summary>{r.titre}</summary><p>{r.detail}</p></details>)}
    </div></section>
    <section className="split" id="conditions"><div><Rubrique numero="04">Participation</Rubrique><h2>Hypothèses de démonstration</h2></div><div>
      <p className="section-lead">Le dossier se consulte librement dans cet espace privé. Il ne permet aucun versement.</p>
      <dl className="facts">
        <div><dt>Opérateur</dt><dd>À sélectionner. Aucun contrat signé.</dd></div>
        <div><dt>Frais et partage du résultat</dt><dd>Exemple : {r.partsBeneficesInvestisseursPourcent}/{r.partsBeneficesOperateurPourcent} entre investisseurs réunis et opérateur ; {formatEuros(r.fraisEthigoneCentimes)} de service ETHIGONE à la charge du projet sur la période illustrée de {r.periodeMois} mois. Aucun tarif ou contrat validé.</dd></div>
        <div><dt>Durée et sortie</dt><dd>Horizon fictif de {r.horizonIndicatifMois} mois. Aucune échéance garantie ni rachat automatique. Le délai réel dépendrait notamment de la vente des équipements.</dd></div>
        <div><dt>Capital et bénéfices</dt><dd>Une perte est possible. Aucun capital, rendement ou délai de sortie garanti.</dd></div>
        <div><dt>Conformité charia</dt><dd>Examen professionnel requis avant tout pilote réel.</dd></div>
      </dl><div className="actions"><Lien href="/participer">Essayer une participation fictive</Lien><a href="/regles">Comprendre les règles et les scénarios</a></div><Lien href="/fonctionnement#roles" discret>Voir le rôle de chaque intervenant</Lien>
    </div></section>
  </Cadre>;
}
