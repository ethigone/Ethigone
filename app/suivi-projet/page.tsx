import { notFound } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { lireEspace } from "@/src/data/registre";
import { lireSituation, listerSituations } from "@/src/data/gestion";
import { uuidPreparation } from "@/src/data/formulaire-participation";
import { formatEuros } from "@/src/economie/demo";
import { projeterEssai } from "@/src/economie/projection";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { BilanGestion, ListeSituations, PiecesGestion } from "@/src/ui/suivi-gestion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suivi du projet fictif" };

export default async function SuiviProjet({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const id = typeof params.id === "string" && uuidPreparation.test(params.id) ? params.id : null;
  return <ContenuSuivi id={id} />;
}

async function ContenuSuivi({ id }: { id: string | null }) {
  const compte = await exigerCompte("/suivi-projet" + (id ? "?id=" + id : ""));
  const [situations, espace, situation] = await Promise.all([listerSituations(compte), lireEspace(compte), id ? lireSituation(compte, id) : null]);
  if (id && !situation) notFound();
  return <Cadre active="/suivi-projet">
    <div className="crumb"><a href="/portefeuille">Portefeuille</a><span aria-hidden="true">/</span>Suivi du projet</div>
    <section className="intro"><Rubrique numero="SUIVI">Atelier Lavage · Démonstration</Rubrique><h1>L’activité et ses résultats</h1>
      <p className="lead">Consultez les situations fictives enregistrées par l’administration, leurs mouvements et leurs pièces.</p>
      <p>Chaque situation représente une simulation indépendante sur les douze mois illustrés. Les chiffres servent à éprouver les règles et le suivi.</p>
      {compte.role === "administrateur" && <Lien href="/administration/gestion" discret>Gérer les situations</Lien>}
    </section>
    <ListeSituations situations={situations} chemin="/suivi-projet" selection={id ?? undefined} />
    {situation ? <>
      <BilanGestion situation={situation} />
      <section className="portefeuille-section"><h2>Projection sur mes essais</h2>
        <p>Chaque montant personnel est rapporté séparément au capital investisseurs de référence. Les essais ne sont jamais additionnés pour constituer une collecte. Les quotes-parts ci-dessous restent indicatives, avec un versement réel de 0 €.</p>
        {espace.participations.length ? <ul className="cartes-participations">{espace.participations.map((p, i) => {
          if (p.regles !== situation.reglesId) return <li key={i}><h3>{p.libelle}</h3><p>Règles différentes. Projection indisponible pour cet essai.</p></li>;
          const projection = projeterEssai(p.montantCentimes, situation.regles, situation.bilan.investisseursCentimes, situation.distribution?.investisseursCentimes ?? 0);
          return <li key={i}><span className="etiquette-demo">Essai personnel indépendant</span><h3>{p.libelle}</h3><p className="montant-recap">{formatEuros(p.montantCentimes)}</p>
            <dl className="projection-chiffres"><div><dt>Quote-part du résultat</dt><dd>{formatEuros(projection.resultatCentimes)}</dd></div>
              <div><dt>Quote-part de distribution fictive</dt><dd>{formatEuros(projection.distributionCentimes)}</dd></div></dl>
            <p className="source">Base investisseurs {formatEuros(projection.capitalInvestisseursCentimes)} · Règles {p.regles}</p></li>;
        })}</ul> : <p className="scenario-status">Votre compte ne contient aucun essai. <a href="/participer">Préparer une participation de démonstration</a>.</p>}
        <p className="source">Calcul par essai = part du groupe investisseurs × montant de l’essai ÷ capital investisseurs. Troncature au centime vers zéro. Ces projections indépendantes ne constituent aucun crédit ni droit acquis.</p>
      </section>
      <PiecesGestion situation={situation} />
    </> : <p className="scenario-status">{situations.length ? "Sélectionnez une situation pour consulter son bilan et vos projections." : "L’administration n’a encore ouvert aucune situation de gestion. Les hypothèses restent consultables dans les règles."} <a href="/regles">Voir les scénarios pédagogiques</a>.</p>}
  </Cadre>;
}
