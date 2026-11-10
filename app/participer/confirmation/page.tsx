import { notFound } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { lirePreparation } from "@/src/data/participation";
import { uuidPreparation } from "@/src/data/formulaire-participation";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { AccesCentrifuge, EtapesParticipation, HypothesesParticipation } from "@/src/ui/parcours-participation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vérifier ma simulation" };

export default async function Confirmation({ searchParams }: { searchParams: Promise<{ id?: string; erreur?: string }> }) {
  const params = await searchParams;
  const id = typeof params.id === "string" && uuidPreparation.test(params.id) ? params.id : null;
  return <ContenuConfirmation id={id} erreur={typeof params.erreur === "string" ? params.erreur : undefined} />;
}

async function ContenuConfirmation({ id, erreur }: { id: string | null; erreur?: string }) {
  const retour = id ? "/participer/confirmation?id=" + encodeURIComponent(id) : "/participer";
  const compte = await exigerCompte(retour);
  if (!id) notFound();
  const preparation = await lirePreparation(compte, id);
  if (!preparation) notFound();
  return <Cadre active="/mon-espace">
    <div className="crumb"><a href="/participer">Participer en démo</a><span aria-hidden="true">/</span>Récapitulatif</div>
    <section className="intro">
      <Rubrique numero="VÉRIFICATION">Essai indépendant</Rubrique><h1>{preparation.confirme ? "Simulation déjà enregistrée" : "Vérifiez votre simulation"}</h1>
      <p className="lead">Le montant et les règles ci-dessous sont ceux conservés dans votre préparation.</p>
    </section>
    <EtapesParticipation etape={3} />
    <div className="participation-grille">
      <section className="participation-hypotheses">
        <h2>{preparation.projetNom}</h2><HypothesesParticipation regles={preparation.regles} />
        <p className="source">Référence de l’essai {preparation.id}</p>
      </section>
      <section className="saisie-participation">
        <h2>Montant de votre essai</h2>
        <p className="montant-recap">{formatEuros(preparation.montantCentimes)}</p>
        <p>Euros fictifs · Versement réel de 0 €</p>
        <p className="paragraph-gap">L’enregistrement ajoute une simulation, un reçu et un événement dans votre espace. Il ne réserve aucune part d’Atelier Lavage.</p>
        {preparation.confirme ? <>
          <p className="suivi-enregistre" role="status">Cette simulation figure déjà dans votre portefeuille.</p>
          <Lien href={"/portefeuille?confirmation=" + encodeURIComponent(id)}>Voir mon portefeuille</Lien>
        </> : <>
          {erreur && <p className="formulaire-erreur" role="alert">{erreur === "conditions" ? "Utilisez le bouton de confirmation pour enregistrer cet essai." : "L’enregistrement n’a pas pu être confirmé. Réessayez avec ce même récapitulatif pour éviter un doublon."}</p>}
          <form method="post" action="/api/participations/confirmer">
            <input type="hidden" name="id" value={id} />
            <button type="submit" name="confirme" value="oui" className="action primary">Enregistrer cette simulation</button>
          </form>
          <a className="text-action action" href="/participer">Recommencer avec un autre montant</a>
          <p className="source">Recommencer ouvre une nouvelle préparation. Seuls les essais que vous confirmez entrent dans le portefeuille.</p>
        </>}
      </section>
    </div>
    <AccesCentrifuge />
  </Cadre>;
}
