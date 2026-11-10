"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { champsDossier, criteres, dossierVide, etatsCritere, exempleLavage, libellesCritere, messageCandidature, type Dossier } from "@/src/data/candidatures-formulaire";

function Formulaire({ children }: { children: ReactNode }) {
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enCours) return;
    const body = new URLSearchParams();
    new FormData(event.currentTarget).forEach((v, k) => body.set(k, String(v)));
    const bouton = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (bouton?.name) body.set(bouton.name, bouton.value);
    setEnCours(true);
    setErreur("");
    try {
      const reponse = await fetch("/api/candidatures", { method: "POST", headers: { accept: "application/json" }, body });
      const resultat = await reponse.json() as { chemin?: string; erreur?: string };
      if (reponse.ok && resultat.chemin) { window.location.assign(resultat.chemin); return; }
      setErreur(resultat.erreur || "indisponible");
    } catch { setErreur("indisponible"); }
    setEnCours(false);
  }
  return <form action="/api/candidatures" method="post" className="gestion-form candidature-form" onSubmit={envoyer} aria-busy={enCours}>
    <fieldset disabled={enCours}>{children}</fieldset>
    {erreur && <p role="alert" className="formulaire-erreur">{messageCandidature(erreur)}</p>}
    {enCours && <p role="status">Enregistrement…</p>}
  </form>;
}
export function CandidatureCreation({ id }: { id: string }) {
  return <Formulaire><input type="hidden" name="id" value={id} /><input type="hidden" name="action" value="creer" />
    <button className="action primary" type="submit">Créer mon brouillon fictif</button></Formulaire>;
}
export function CandidatureEdition({ id, dossierId, revision, initial = dossierVide }: { id: string; dossierId: string; revision: number; initial?: Dossier }) {
  const [contenu, setContenu] = useState(initial);
  return <Formulaire>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="dossierId" value={dossierId} /><input type="hidden" name="revision" value={revision} />
    <p id="aide-dossier">Données et références fictives uniquement, sans coordonnées ni fichier réel. Le titre est limité à 160 caractères et les autres textes à 1 200 caractères. Tous les champs sont nécessaires pour soumettre. La sauvegarde accepte un dossier incomplet.</p>
    <button type="button" className="action secondary" onClick={() => setContenu({ ...exempleLavage })}>Préremplir l’exemple Atelier Lavage</button>
    {Object.entries(champsDossier).map(([cle, libelle]) => <div key={cle}>
      <label htmlFor={cle}>{libelle}</label>{cle === "titre" ? <input id={cle} name={cle} maxLength={160} value={contenu.titre} onChange={event => setContenu({ ...contenu, titre: event.target.value })} /> : <textarea id={cle} name={cle} rows={3} maxLength={1200} aria-describedby="aide-dossier"
        value={contenu[cle as keyof Dossier]} onChange={event => setContenu({ ...contenu, [cle]: event.target.value })} />}
    </div>)}
    <label htmlFor="budget">Budget fictif en EUR</label>
    <input id="budget" name="budget" type="text" inputMode="decimal" maxLength={10} value={contenu.budget} onChange={event => setContenu({ ...contenu, budget: event.target.value })} aria-describedby="aide-budget" />
    <p id="aide-budget" className="source">Borne technique de 0,01 à 1 000 000,00 EUR, deux décimales maximum, sans minimum commercial. Exemple 24 000,00 EUR, dont 18 000,00 EUR pour 12 machines et 6 000,00 EUR de réserve. Les charges d’exploitation sont à décrire séparément.</p>
    <label className="accord-simulation"><input type="checkbox" name="fictif" value="oui" /><span>Je reconnais que ce dossier et ses références sont entièrement fictifs et je demande son préexamen.</span></label>
    <div className="actions"><button type="submit" name="action" value="sauvegarder" className="action secondary">Sauvegarder le brouillon</button>
      <button type="submit" name="action" value="soumettre" className="action primary">Soumettre explicitement au préexamen</button></div>
  </Formulaire>;
}
export function CandidatureRevue({ id, dossierId, revision }: { id: string; dossierId: string; revision: number }) {
  return <Formulaire>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="dossierId" value={dossierId} /><input type="hidden" name="revision" value={revision} /><input type="hidden" name="action" value="revoir" />
    {Object.entries(criteres).map(([cle, libelle]) => <div key={cle}><label htmlFor={"critere_" + cle}>{libelle}</label>
      <select id={"critere_" + cle} name={"critere_" + cle} required>{etatsCritere.map(etat => <option key={etat} value={etat}>{libellesCritere[etat]}</option>)}</select></div>)}
    <label htmlFor="note">Note motivée fictive</label><textarea id="note" name="note" required maxLength={1200} rows={4} />
    <label htmlFor="statut">Suite du préexamen</label><select id="statut" name="statut" required><option value="a_completer">À compléter</option><option value="a_approfondir">À approfondir</option><option value="non_retenu">Non retenu</option></select>
    <label className="accord-simulation"><input type="checkbox" name="confirme" value="oui" required /><span>Je confirme ce préexamen fictif et sa note motivée.</span></label>
    <button type="submit" className="action primary">Enregistrer le préexamen</button>
  </Formulaire>;
}
