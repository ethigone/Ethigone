import { fichePath, lireProjet } from "@/src/data/lecture";
import { Cadre, Chiffres, Lien, Planche, Rubrique } from "@/src/ui/site";

export const dynamic = "force-dynamic";

export default async function Accueil() {
  const projet = await lireProjet();
  return <Cadre active="/">
    <section className="hero">
      <div className="hero-copy">
        <Rubrique numero="01">Parcours investisseur</Rubrique>
        <h1>Des machines <em>aux loyers.</em></h1>
        <p className="lead">Entrez dans les comptes d’Atelier Lavage. Ce projet fictif montre ce qu’un pool de stablecoins pourrait financer et comment les loyers, les frais et les pannes changent le résultat.</p>
        <div className="actions"><Lien href={fichePath}>Ouvrir la fiche projet</Lien><a className="plain-link" href="/fonctionnement">Comment ça marche&nbsp;?</a></div>
        <p className="quiet-note"><span aria-hidden="true">◌</span> Projet fictif · Aucun versement possible</p>
      </div>
      <Planche projet={projet} />
    </section>
    <section className="lot-band" aria-labelledby="titre-lot">
      <div className="lot-heading"><Rubrique numero="02">Le lot en chiffres</Rubrique><h2 id="titre-lot">{projet.nom}</h2></div>
      <div><Chiffres projet={projet} /><p className="source">Hypothèses de démonstration en euros. Transport, installation et entretien en supplément.</p></div>
    </section>
    <section className="reading">
      <Rubrique numero="03">Lecture du dossier</Rubrique><h2>Trois questions avant de participer</h2>
      <div className="reading-links">
        <a href={fichePath + "#activite"}><small>LE MATÉRIEL</small><strong>D’où viendraient les loyers&nbsp;?</strong><span aria-hidden="true">↗</span></a>
        <a href={fichePath + "#risques"}><small>LES RISQUES</small><strong>Que se passe-t-il si une machine tombe en panne&nbsp;?</strong><span aria-hidden="true">↗</span></a>
        <a href="/regles#scenarios"><small>LE RÉSULTAT</small><strong>Un bénéfice peut-il rester indisponible&nbsp;?</strong><span aria-hidden="true">↗</span></a>
      </div>
      <div className="actions"><Lien href="/charia" discret>Consulter le statut des examens charia</Lien><a href="/faq">Questions fréquentes</a></div>
    </section>
  </Cadre>;
}
