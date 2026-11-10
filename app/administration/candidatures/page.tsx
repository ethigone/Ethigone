import { redirect } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { listerCandidatures } from "@/src/data/candidatures";
import { statutsCandidature } from "@/src/data/candidatures-formulaire";
import { Cadre, Lien } from "@/src/ui/site";
import { AvertissementCandidature } from "@/src/ui/candidature-dossier";
export const dynamic = "force-dynamic";
export const metadata = { title: "Préexamen des candidatures" };
export default async function AdministrationCandidatures() {
  const compte = await exigerCompte("/administration/candidatures");
  if (compte.role !== "administrateur") redirect("/mon-espace?acces=reserve");
  const { dossiers, indisponibles } = await listerCandidatures(compte, true);
  return <Cadre active="/administration/candidatures"><section className="intro"><h1>Préexaminer les candidatures fictives</h1><p className="lead">Ouvrez un dossier transmis, renseignez les cinq critères et motivez la suite proposée. Les versions déjà soumises restent consultables après un retour à compléter.</p><AvertissementCandidature /><Lien href="/administration" discret>Administration</Lien></section>
    {indisponibles > 0 && <p role="alert" className="formulaire-erreur">Certaines candidatures sont indisponibles. Leur historique de soumission doit être vérifié.</p>}
    <section><h2>Dossiers transmis</h2>{dossiers.length === 0 ? <p>Aucune candidature consultable.</p> : dossiers.map(dossier => <article className="candidature-card" key={dossier.id}><h3><a href={"/candidatures/" + dossier.id}>{dossier.contenu.titre}</a></h3><p>{statutsCandidature[dossier.statut]}</p><p>Référence {dossier.id}</p></article>)}</section>
  </Cadre>;
}
