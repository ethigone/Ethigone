import { categoriesAssistance } from "@/src/data/assistance-formulaire";
import type { demandesAssistance } from "@/db/schema";
import { AssistanceForm } from "./assistance-form";

const dates = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function HistoriqueAssistance({
  demandes,
  administration = false,
}: {
  demandes: (typeof demandesAssistance.$inferSelect)[];
  administration?: boolean;
}) {
  return (
    <section className="portefeuille-section" id="historique-assistance">
      <h2>{administration ? "Demandes enregistrées" : "Mon historique d’assistance"}</h2>
      {demandes.length === 0 && <p>Aucune demande fictive enregistrée.</p>}
      <div className="assistance-list">
        {demandes.map(d => (
          <article className="saisie-participation assistance-card" key={d.id}>
            <h3>{categoriesAssistance[d.categorie as keyof typeof categoriesAssistance]}</h3>
            <p className="source">Référence {d.id}</p>
            <p className="assistance-status">
              {d.statut === "ouverte" ? "Ouverte · en attente de traitement" : "Clôturée"}
            </p>
            <p className="source">
              Créée le <time dateTime={d.date}>{dates.format(new Date(d.date))}</time>
            </p>
            <p className="document-demo">
              {d.description}
            </p>
            {d.reponse && (
              <div className="assistance-response">
                <h4>Réponse fictive</h4>
                <p className="document-demo">
                  {d.reponse}
                </p>
                <p className="source">
                  Clôturée le {d.dateCloture && (
                    <time dateTime={d.dateCloture}>{dates.format(new Date(d.dateCloture))}</time>
                  )}
                </p>
              </div>
            )}
            {administration && d.statut === "ouverte" && (
              <AssistanceForm id={crypto.randomUUID()} demandeId={d.id} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
