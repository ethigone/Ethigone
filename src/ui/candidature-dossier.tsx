import type { lireCandidature } from "@/src/data/candidatures";
import { champsDossier, criteres, libellesCritere, statutsCandidature, type Dossier } from "@/src/data/candidatures-formulaire";
export function ContenuCandidature({ contenu }: { contenu: Dossier }) {
  return <dl className="candidature-grille">{Object.entries(champsDossier).map(([cle, libelle]) => <div key={cle}><dt>{libelle}</dt><dd>{contenu[cle as keyof Dossier] || "À renseigner"}</dd></div>)}
    <div><dt>Budget fictif EUR</dt><dd>{contenu.budget ? Number(contenu.budget).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : "À renseigner"}</dd></div></dl>;
}
export function HistoriqueCandidature({ historique }: { historique: NonNullable<Awaited<ReturnType<typeof lireCandidature>>>["historique"] }) {
  const versions = historique.map(entree => ({ ...entree, version: JSON.parse(entree.instantane) as { revision: number; statut: string; action: string; note: string; checklist: Record<string, keyof typeof libellesCritere>; contenu: Dossier } })).sort((a, b) => b.version.revision - a.version.revision);
  const actions: Record<string, string> = { creer: "Création du brouillon", sauvegarder: "Sauvegarde", soumettre: "Soumission", revoir: "Préexamen" };
  return <section className="candidature-historique"><h2>Historique des versions</h2>{versions.map(entree => <details key={entree.id}>
    <summary>Version {entree.version.revision} — {actions[entree.version.action]} — {statutsCandidature[entree.version.statut]}</summary>
    <p>{entree.date} · Référence {entree.id}</p>
    {entree.version.note && <p>Motif du préexamen · {entree.version.note}</p>}
    {Object.entries(entree.version.checklist).length > 0 && <ul>{Object.entries(entree.version.checklist).map(([cle, etat]) => <li key={cle}>{criteres[cle as keyof typeof criteres]} · {libellesCritere[etat]}</li>)}</ul>}
    <ContenuCandidature contenu={entree.version.contenu} />
  </details>)}</section>;
}
export function AvertissementCandidature() {
  return <p className="source">Le préexamen est un exercice fictif. « À approfondir » demande un travail ultérieur et ne constitue aucun accord. Des avis professionnels charia et juridiques restent toujours à obtenir. Ce parcours ne publie aucun projet et ne sélectionne aucun opérateur. Aucun paiement, transaction ou courriel n’est déclenché.</p>;
}
