import { exigerCompte } from "@/src/data/session";
import { lireEspace } from "@/src/data/registre";
import { lirePreparation } from "@/src/data/participation";
import { uuidPreparation } from "@/src/data/formulaire-participation";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { AccesCentrifuge, EtapesParticipation } from "@/src/ui/parcours-participation";
import { Journal } from "@/src/ui/journal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portefeuille de démonstration" };

export default async function Portefeuille({ searchParams }: { searchParams: Promise<{ confirmation?: string }> }) {
  const params = await searchParams;
  const confirmation = typeof params.confirmation === "string" && uuidPreparation.test(params.confirmation) ? params.confirmation : null;
  return <ContenuPortefeuille confirmation={confirmation} />;
}

async function ContenuPortefeuille({ confirmation }: { confirmation: string | null }) {
  const retour = "/portefeuille" + (confirmation ? "?confirmation=" + encodeURIComponent(confirmation) : "");
  const compte = await exigerCompte(retour);
  const [espace, preparation] = await Promise.all([
    lireEspace(compte), confirmation ? lirePreparation(compte, confirmation) : Promise.resolve(null),
  ]);
  return <Cadre active="/portefeuille">
    <div className="crumb"><a href="/mon-espace">Mon espace</a><span aria-hidden="true">/</span>Portefeuille</div>
    <section className="intro">
      <Rubrique numero="DÉMO">Mes essais enregistrés</Rubrique><h1>Mon portefeuille</h1>
      <p className="lead">Retrouvez vos simulations et leurs reçus. Chaque essai conserve son montant et la version de ses règles.</p>
      <div className="tags"><span>{espace.participations.length} essai{espace.participations.length > 1 ? "s" : ""} enregistré{espace.participations.length > 1 ? "s" : ""}</span><span>Versements réels de 0 €</span></div>
    </section>
    <EtapesParticipation etape={4} />
    {preparation?.confirme && <div className="confirmation-enregistree" role="status">
      <strong>Simulation enregistrée</strong><p>{formatEuros(preparation.montantCentimes)} fictifs pour {preparation.projetNom} · Règles {preparation.reglesId}</p>
      <small>Référence {preparation.id}</small>
    </div>}
    {preparation && !preparation.confirme && <p className="scenario-status">Cette préparation attend votre confirmation. <a href={"/participer/confirmation?id=" + encodeURIComponent(preparation.id)}>Revoir le récapitulatif</a></p>}
    <section className="portefeuille-section">
      <h2>Mes participations de démonstration</h2>
      <p className="source">Ces essais indépendants ne représentent ni une collecte ni une valeur de portefeuille réelle.</p>
      {espace.participations.length ? <ul className="cartes-participations">{espace.participations.map((p, i) => <li key={i}>
        <span className="etiquette-demo">Simulation</span><h3>{p.libelle}</h3><p className="montant-recap">{formatEuros(p.montantCentimes)}</p>
        <p>Montant fictif · {espace.projet.nom}</p><p className="source">Règles {p.regles}</p>
      </li>)}</ul> : <div className="registre-cadre portefeuille-vide"><p>Aucune participation enregistrée. Commencez par lire les hypothèses et choisir un montant fictif.</p></div>}
      <div className="actions"><Lien href="/participer">Préparer un nouvel essai</Lien><Lien href="/suivi-projet" discret>Suivre l’activité et les résultats</Lien><a href="/mon-espace">Retour à mon espace</a>
        {compte.role === "administrateur" && <a href="/administration">Consulter l’administration</a>}
      </div>
    </section>
    <section className="portefeuille-section" id="recus">
      <h2>Mes reçus et documents</h2>
      {espace.documents.length ? <div className="risques recus-demo">{espace.documents.map((doc, i) => <details key={i}>
        <summary>{doc.titre}</summary><p>{doc.contenu}</p>
      </details>)}</div> : <p className="espace-vide">Le reçu apparaîtra ici après votre première confirmation.</p>}
    </section>
    <section className="split"><div><Rubrique numero="SUIVI">Événements personnels</Rubrique><h2>Historique</h2></div><Journal lignes={espace.historique} /></section>
    <AccesCentrifuge />
  </Cadre>;
}
