import { redirect } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { listerAssistance } from "@/src/data/assistance";
import { messageAssistance } from "@/src/data/assistance-formulaire";
import { Cadre, Lien } from "@/src/ui/site";
import { HistoriqueAssistance } from "@/src/ui/assistance-historique";

export const dynamic = "force-dynamic";
export const metadata = { title: "Traitement de l’assistance" };

export default async function AdministrationAssistance({ searchParams }: { searchParams: Promise<{ succes?: string; erreur?: string }> }) {
  const compte = await exigerCompte("/administration/assistance");
  if (compte.role !== "administrateur") redirect("/mon-espace?acces=reserve");
  const demandes = await listerAssistance(compte, true);
  const params = await searchParams;
  const succes = demandes.find(d => d.id === params.succes && d.statut === "cloturee");
  return <Cadre active="/administration/assistance">
    <div className="crumb"><a href="/administration">Administration</a><span aria-hidden="true">/</span>Assistance</div>
    <section className="intro">
      <h1>Traiter les demandes fictives</h1>
      <p className="lead">Répondez à une demande ouverte, puis confirmez sa clôture. Son auteur retrouve la réponse dans son espace privé. Les échanges restent dans ETHIGONE.</p>
      <Lien href="/assistance" discret>Ouvrir mon assistance personnelle</Lien>
    </section>
    {succes && <p role="status" className="confirmation-enregistree">Réponse fictive enregistrée et demande {succes.id} clôturée. <a href="#historique-assistance">Consulter l’historique</a></p>}
    {params.erreur && <p role="alert" className="formulaire-erreur">{messageAssistance(params.erreur)}</p>}
    <HistoriqueAssistance demandes={demandes} administration />
  </Cadre>;
}
