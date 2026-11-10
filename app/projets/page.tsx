import { fichePath, lireProjet } from "@/src/data/lecture";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Lien, Planche } from "@/src/ui/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Les projets" };

export default async function Projets() {
  const projet = await lireProjet();
  return <Cadre active="/projets">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Projets</div>
    <section className="intro">
      <h1>Les projets</h1><p className="lead">Un dossier fictif à explorer pour comprendre comment une activité de location se traduit en loyers, en frais et en résultats.</p>
    </section>
    <article className="project-listing">
      <Planche projet={projet} />
      <div><p className="project-ref">{projet.reference} · Location de matériel</p>
        <h2>{projet.nom}</h2>
        <p>{projet.quantite} lave-linge professionnels destinés à des résidences collectives. Le lot coûterait {formatEuros(projet.quantite * projet.prixUnitaireCentimes)} à l’achat, avant installation et entretien.</p>
        <p className="source">Projet de démonstration · Prix fictifs · Opérateur à sélectionner</p>
        <div className="actions"><Lien href={fichePath}>Ouvrir la fiche projet</Lien><a href={fichePath + "#risques"}>Examiner les risques</a></div>
      </div>
    </article>
    <aside className="help-band"><div><h2>Préparer une candidature</h2><p>Essayez le dépôt et le suivi d’un dossier fictif de location de matériel.</p></div><Lien href="/proposer-projet">Proposer un projet</Lien></aside>
  </Cadre>;
}
