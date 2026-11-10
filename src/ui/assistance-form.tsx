"use client";

import { useState, type FormEvent } from "react";
import { categoriesAssistance, messageAssistance } from "@/src/data/assistance-formulaire";

export function AssistanceForm({ id, demandeId }: { id: string; demandeId?: string }) {
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enCours) return;
    const body = new URLSearchParams();
    new FormData(event.currentTarget).forEach((valeur, cle) => body.set(cle, String(valeur)));
    setEnCours(true);
    setErreur("");
    try {
      const reponse = await fetch("/api/assistance", { method: "POST", headers: { accept: "application/json" }, body });
      const resultat = await reponse.json() as { chemin?: string; erreur?: string };
      if (reponse.ok && resultat.chemin) {
        window.location.assign(resultat.chemin);
        return;
      }
      setErreur(resultat.erreur || "indisponible");
    } catch {
      setErreur("indisponible");
    }
    setEnCours(false);
  }

  return <form action="/api/assistance" method="post" className="gestion-form" onSubmit={envoyer} aria-busy={enCours}>
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="action" value={demandeId ? "cloturer" : "creer"} />
    {demandeId ? <input type="hidden" name="demandeId" value={demandeId} /> : <>
      <label htmlFor="categorie-assistance">Catégorie</label>
      <select id="categorie-assistance" name="categorie" required>
        {Object.entries(categoriesAssistance).map(([valeur, libelle]) => <option key={valeur} value={valeur}>{libelle}</option>)}
      </select>
    </>}
    <label htmlFor={"texte-" + id}>{demandeId ? "Réponse fictive de clôture" : "Description fictive"}</label>
    <textarea id={"texte-" + id} name={demandeId ? "reponse" : "description"} required maxLength={1200}
      rows={4} aria-describedby={"aide-" + id} placeholder={demandeId ? undefined : "Ex. Où retrouver le reçu de mon essai de 100 € ?"} />
    <p className="source" id={"aide-" + id}>Utilisez uniquement des données fictives. Gardez vos coordonnées, clés et mots de passe privés. 1 200 caractères maximum.</p>
    {demandeId && <label className="accord-simulation">
      <input type="checkbox" required name="confirme" value="oui" />
      <span>Je confirme ma réponse fictive et la clôture de cette demande.</span>
    </label>}
    {erreur && <p role="alert" className="formulaire-erreur">
      {messageAssistance(erreur)} {erreur === "connexion" && <a href={demandeId ? "/administration/assistance" : "/assistance"}>Rouvrir mon espace</a>}
    </p>}
    <button type="submit" disabled={enCours} className="action primary">
      {enCours ? "Enregistrement…" : demandeId ? "Répondre et clôturer" : "Créer la demande fictive"}
    </button>
  </form>;
}
