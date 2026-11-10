import { redirect } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { lireAdministration } from "@/src/data/registre";
import { fichePath } from "@/src/data/lecture";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import { Journal } from "@/src/ui/journal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administration" };

export default async function Administration() {
  const compte = await exigerCompte("/administration");
  if (compte.role !== "administrateur") redirect("/mon-espace?acces=reserve");
  const registre = await lireAdministration(compte);
  return <Cadre active="/mon-espace">
    <div className="crumb"><a href="/mon-espace">Mon espace</a><span aria-hidden="true">/</span>Administration</div>
    <section className="intro">
      <Rubrique numero="ADM">Administration privée</Rubrique><h1>Registre du projet</h1>
      <p className="lead">Consultez les inscriptions, les pièces et les événements associés au dossier. Les montants illustrent des écritures fictives en euros.</p>
      <div className="actions"><Lien href="/administration/gestion">Gérer le projet fictif</Lien><Lien href="/administration/candidatures" discret>Examiner les candidatures</Lien><Lien href="/administration/assistance" discret>Traiter les demandes d’assistance</Lien></div>
    </section>
    <nav className="chapter" aria-label="Sections du registre">
      <a href="#projet">Dossier</a><a href="#participations">Participations</a><a href="#pieces">Opérations et pièces</a><a href="#comptes">Comptes</a><a href="#historique">Historique</a>
    </nav>
    <div className="admin-sections">
      <section id="projet"><Rubrique numero="01">Dossier enregistré</Rubrique>
        {registre.dossiers.map(d => <div className="dossier-suivi" key={d.regles}>
          <div><h2>{d.projet}</h2><p>{d.operateur}</p><a className="text-action action" href={fichePath}>Ouvrir la fiche</a></div>
          <div className="suivi-controle"><strong>Règles de démonstration</strong><p>{d.regles}</p><a href="/regles">Consulter les hypothèses</a></div>
        </div>)}
      </section>
      <section id="participations"><Rubrique numero="02">Écritures en euros</Rubrique><h2>Participations de démonstration</h2>
        <p>Les inscriptions des investisseurs synthétiques A et B proviennent du jeu d’exemple. Aucun montant n’a été collecté.</p>
        <div className="registre-cadre registre-table" role="region" aria-label="Participations de démonstration" tabIndex={0}><table>
          <thead><tr><th scope="col">Titulaire</th><th scope="col">Inscription</th><th scope="col">Montant fictif</th><th scope="col">Règles appliquées</th></tr></thead>
          <tbody>{registre.participations.map((p, i) => <tr key={i}><td>{p.titulaire}</td><td>{p.libelle}</td><td className="chiffre">{formatEuros(p.montantCentimes)}</td><td>{p.regles}</td></tr>)}</tbody>
        </table></div>
      </section>
      <div id="pieces" className="admin-grille">
        <section><h2>Opérations du projet</h2><p className="espace-vide">Registre commun des exemples et mouvements fictifs. Chaque situation conserve son propre calcul. <a href="/administration/gestion">Ouvrir la gestion et ses pièces</a>.</p>
          <ul className="registre-liste">{registre.operations.map((op, i) => <li key={i}><strong>{op.libelle}</strong><span>{formatEuros(op.montantCentimes)} fictifs · {op.regles}</span></li>)}</ul>
        </section>
        <section><h2>Documents enregistrés</h2>
          <div className="risques">{registre.documents.map((doc, i) => <details key={i}>
            <summary>{doc.titre}</summary><p><strong>{doc.titulaire}</strong></p><p className="document-demo">{doc.contenu}</p>
          </details>)}</div>
        </section>
      </div>
      <section id="comptes"><Rubrique numero="03">Accès</Rubrique><h2>Comptes et rôles</h2>
        <div className="registre-cadre"><ul className="registre-liste">{registre.comptes.map((c, i) => <li key={i}><strong>{c.libelle}</strong><span>
          {c.role === "administrateur" ? "Administrateur" : "Investisseur"} · {c.fictif ? "Profil fictif de présentation" : "Compte connecté"}
        </span></li>)}</ul></div>
      </section>
      <section id="historique"><Rubrique numero="04">Historique</Rubrique><h2>Journal du projet</h2>
        <div className="registre-cadre"><Journal lignes={registre.historique}/></div>
      </section>
    </div>
  </Cadre>;
}
