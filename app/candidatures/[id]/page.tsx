import { notFound } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { lireCandidature } from "@/src/data/candidatures";
import { messageCandidature, statutsCandidature } from "@/src/data/candidatures-formulaire";
import { Cadre, Lien } from "@/src/ui/site";
import { CandidatureEdition, CandidatureRevue } from "@/src/ui/candidature-form";
import { AvertissementCandidature, ContenuCandidature, HistoriqueCandidature } from "@/src/ui/candidature-dossier";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dossier de candidature fictive" };
export default async function Candidature({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ succes?: string; erreur?: string }> }) {
  const { id } = await params;
  return <DossierPage id={id} searchParams={searchParams} />;
}
async function DossierPage({ id, searchParams }: { id: string; searchParams: Promise<{ succes?: string; erreur?: string }> }) {
  const compte = await exigerCompte("/candidatures/" + id);
  const lecture = await lireCandidature(compte, id);
  if (!lecture) notFound();
  const { dossier, historique } = lecture;
  const recherche = await searchParams;
  const editable = dossier.utilisateurId === compte.id && ["brouillon", "a_completer"].includes(dossier.statut);
  return <Cadre active="/proposer-projet"><section className="intro"><h1 className="candidature-title">{dossier.contenu.titre || "Mon dossier fictif"}</h1>
    <p className="candidature-etat">{statutsCandidature[dossier.statut]} · Version {dossier.revision}</p><p>Référence {dossier.id}</p>
    <div className="actions"><Lien href="/proposer-projet" discret>Mes candidatures</Lien>{compte.role === "administrateur" && <Lien href="/administration/candidatures" discret>Préexamen</Lien>}</div>
    <AvertissementCandidature /></section>
    {historique.some(entree => entree.id === recherche.succes && entree.utilisateurId === compte.id) && <p role="status" className="confirmation-enregistree">Commande enregistrée. Consultez la version et son historique ci-dessous.</p>}
    {recherche.erreur && <p role="alert" className="formulaire-erreur">{messageCandidature(recherche.erreur)}</p>}
    <section className="saisie-participation"><h2>{editable ? "Compléter mon dossier" : "Dossier transmis"}</h2>
      {editable ? <CandidatureEdition id={crypto.randomUUID()} dossierId={id} revision={dossier.revision} initial={dossier.contenu} /> : <ContenuCandidature contenu={dossier.contenu} />}
    </section>
    {compte.role === "administrateur" && dossier.statut === "soumis" && <section className="saisie-participation"><h2>Préexamen motivé</h2><p>Évaluez les informations fictives et indiquez les preuves manquantes. Un critère documenté concerne uniquement cet exemple.</p><CandidatureRevue id={crypto.randomUUID()} dossierId={id} revision={dossier.revision} /></section>}
    <HistoriqueCandidature historique={historique} />
  </Cadre>;
}
