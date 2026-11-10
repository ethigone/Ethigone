import { exigerCompte } from "@/src/data/session";
import { listerAssistance } from "@/src/data/assistance";
import { messageAssistance } from "@/src/data/assistance-formulaire";
import { Cadre, Lien } from "@/src/ui/site";
import { AssistanceForm } from "@/src/ui/assistance-form";
import { HistoriqueAssistance } from "@/src/ui/assistance-historique";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes demandes d’assistance" };

export default async function Assistance({ searchParams }: { searchParams: Promise<{ succes?: string; erreur?: string }> }) {
  const compte = await exigerCompte("/assistance");
  const demandes = await listerAssistance(compte);
  const params = await searchParams;
  const succes = demandes.find(d => d.id === params.succes);
  return <Cadre active="/assistance">
    <div className="crumb"><a href="/mon-espace">Mon espace</a><span aria-hidden="true">/</span>Assistance</div>
    <section className="intro">
      <h1>Mes demandes d’assistance</h1>
      <p className="lead">Posez une question sur un essai fictif. Le propriétaire peut y répondre dans la démo. Vous retrouverez sa réponse dans votre historique.</p>
      <div className="actions"><a href="/faq">Lire les questions fréquentes</a>
        {compte.role === "administrateur" && <Lien href="/administration/assistance" discret>Traiter les demandes d’assistance</Lien>}
      </div>
    </section>
    {succes && <p className="confirmation-enregistree" role="status">Demande fictive enregistrée. Référence {succes.id}. <a href="#historique-assistance">Consulter l’historique</a></p>}
    {params.erreur && <p role="alert" className="formulaire-erreur">{messageAssistance(params.erreur)}</p>}
    <section className="saisie-participation aide-saisie">
      <h2>Nouvelle demande fictive</h2><AssistanceForm id={crypto.randomUUID()} />
    </section>
    <HistoriqueAssistance demandes={demandes} />
  </Cadre>;
}
