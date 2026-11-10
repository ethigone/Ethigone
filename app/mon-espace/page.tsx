import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { exigerCompte } from "@/src/data/session";
import { lireEspace } from "@/src/data/registre";
import { fichePath } from "@/src/data/lecture";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { Journal } from "@/src/ui/journal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon espace" };

export default async function MonEspace({ searchParams }: { searchParams: Promise<{ acces?: string; suivi?: string }> }) {
  const compte = await exigerCompte("/mon-espace");
  const espace = await lireEspace(compte);
  const params = await searchParams;
  return <Cadre active="/mon-espace">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Mon espace</div>
    <section className="intro">
      <Rubrique numero="01">Espace personnel</Rubrique><h1>Mon espace</h1>
      <p className="lead">Retrouvez les dossiers que vous suivez, vos participations de démonstration et vos documents.</p>
      <div className="compte-actions">
        {compte.role === "administrateur" && <Lien href="/administration" discret>Ouvrir l’administration</Lien>}
        <Lien href="/portefeuille" discret>Ouvrir mon portefeuille</Lien>
        <Lien href="/assistance" discret>Mes demandes d’assistance</Lien>
        <Lien href="/proposer-projet" discret>Mes candidatures</Lien>
        <a className="plain-link" href={chatGPTSignOutPath()} target="_top">Se déconnecter</a>
      </div>
      {params.acces === "reserve" && <p className="scenario-status" role="status">L’administration est réservée au propriétaire. Vous êtes dans votre espace personnel.</p>}
    </section>
    <section className="dossier-suivi" id="dossier">
      <div><Rubrique numero={espace.projet.reference}>Dossier fictif</Rubrique><h2>{espace.projet.nom}</h2>
        <p>Location de lave-linge professionnels. Suivre ce dossier permet de le retrouver à votre prochaine connexion.</p>
        <a className="text-action action" href={fichePath}>Consulter la fiche projet</a>
      </div>
      <div className="suivi-controle">
        {espace.suivi ? <p className="suivi-enregistre"><span aria-hidden="true">✓</span> Dossier suivi</p> : <>
          <form method="post" action="/api/espace/suivre"><button className="action primary" type="submit">Suivre {espace.projet.nom}</button></form>
          {params.suivi === "indisponible" && <p className="scenario-status" role="alert">Le suivi n’a pas pu être confirmé. Vous pouvez réessayer.</p>}
        </>}
        <p className="source">{espace.suivi ? "Enregistré dans votre espace personnel." : "Aucun engagement ni versement."}</p>
      </div>
    </section>
    <div className="test-grid">
      <section className="wallet-panel"><Rubrique numero="02">Mes participations</Rubrique><h2>Participations de démo</h2>
        {espace.participations.length ? <ul className="registre-liste">{espace.participations.map((p, i) => <li key={i}><strong>{p.libelle}</strong>
          <span>{formatEuros(p.montantCentimes)} fictifs · Règles {p.regles}</span></li>)}</ul> :
        <p className="espace-vide">Aucune participation enregistrée sur votre compte. Suivre un dossier ne crée pas de participation.</p>}
        <Lien href="/participer" discret>Préparer une participation fictive</Lien>
      </section>
      <section className="wallet-panel"><Rubrique numero="03">Mes documents</Rubrique><h2>Pièces du dossier</h2>
        {espace.documents.length ? <div className="risques">{espace.documents.map((doc, i) => <details key={i}><summary>{doc.titre}</summary><p className="document-demo">{doc.contenu}</p></details>)}</div> :
        <p className="espace-vide">Aucun document personnel pour le moment.</p>}
      </section>
    </div>
    <section className="split">
      <div><Rubrique numero="04">Historique personnel</Rubrique><h2>Votre activité</h2></div>
      <Journal lignes={espace.historique} />
    </section>
  </Cadre>;
}
