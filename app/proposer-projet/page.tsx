import { exigerCompte } from "@/src/data/session";
import { listerCandidatures } from "@/src/data/candidatures";
import { messageCandidature, statutsCandidature } from "@/src/data/candidatures-formulaire";
import { Cadre, Lien } from "@/src/ui/site";
import { CandidatureCreation } from "@/src/ui/candidature-form";
import { AvertissementCandidature } from "@/src/ui/candidature-dossier";
export const dynamic = "force-dynamic";
export const metadata = { title: "Proposer un projet fictif" };
export default async function ProposerProjet({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const compte = await exigerCompte("/proposer-projet");
  const { dossiers } = await listerCandidatures(compte);
  const params = await searchParams;
  return <Cadre active="/proposer-projet"><section className="intro"><h1>Proposer un projet fictif</h1>
    <p className="lead">Créez un brouillon privé, décrivez l’activité de location et ses hypothèses, puis soumettez explicitement votre dossier au propriétaire pour un préexamen motivé.</p>
    <p>Les brouillons restent accessibles à leur auteur. Après soumission, l’administration consulte la version transmise. Vous pouvez compléter et resoumettre un dossier retourné « À compléter ».</p>
    <Lien href="/recherche-operateurs" discret>Comprendre la recherche d’opérateurs</Lien><AvertissementCandidature />
    {compte.role === "administrateur" && <Lien href="/administration/candidatures" discret>Préexaminer les candidatures</Lien>}
  </section>{params.erreur && <p role="alert" className="formulaire-erreur">{messageCandidature(params.erreur)}</p>}
    <section className="saisie-participation aide-saisie"><h2>Nouveau brouillon</h2><CandidatureCreation id={crypto.randomUUID()} /></section>
    <section className="portefeuille-section"><h2>Mes candidatures</h2>{dossiers.length === 0 ? <p>Vous n’avez pas encore de candidature.</p> : dossiers.map(dossier => <article className="candidature-card" key={dossier.id}><h3><a href={"/candidatures/" + dossier.id}>{dossier.contenu.titre || "Brouillon sans titre"}</a></h3><p className="candidature-etat">{statutsCandidature[dossier.statut]} · Version {dossier.revision}</p><p>Référence {dossier.id}</p></article>)}</section>
  </Cadre>;
}
