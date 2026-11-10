import { fichePath } from "@/src/data/lecture";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";

export const metadata = { title: "Fonctionnement" };

const roles = [
  ["Investisseur", "Examiner le lot, les coûts et les risques. Dans le service envisagé, il choisirait sa participation depuis son wallet et suivrait sa part du résultat."],
  ["Opérateur", "Acheter les machines, les louer, assurer leur entretien et justifier les loyers encaissés et les dépenses."],
  ["ETHIGONE", "Sélectionner un dossier, organiser les vérifications et présenter les chiffres avec leurs justificatifs. Le suivi doit distinguer l’argent encaissé de la valeur estimée des machines."],
  ["Centrifuge", "Infrastructure envisagée pour enregistrer les parts d’un pool et traiter les demandes de participation ou de sortie. Une première lecture du pool testnet est disponible dans l’espace de connexion de test."],
  ["Professionnels externes", "Examiner les contrats, la qualification juridique, la méthode comptable et la conformité charia. Aucun professionnel n’a encore validé ce dossier. Le logiciel n’attribue pas lui-même ces validations."],
];

export default function Fonctionnement() {
  return <Cadre active="/fonctionnement">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Fonctionnement</div>
    <section className="intro"><h1>Comment fonctionne ETHIGONE&nbsp;?</h1>
      <p className="lead">Suivez Atelier Lavage de l’achat des machines au partage du résultat. Vous pouvez essayer les trois étapes avec votre compte, en euros fictifs, sans wallet.</p>
    </section>
    <section className="split" id="parcours"><h2>Essayer le parcours</h2><ol className="etapes guide-etapes">
      <li><div><h3><a href={fichePath}>Examiner le projet</a></h3><p>Regardez le prix des machines, les loyers attendus et les risques. Les <a href="/regles#partage">frais du projet</a> sont déduits avant de partager le résultat.</p></div></li>
      <li><div><h3><a href="/participer">Préparer une participation fictive</a></h3><p>Choisissez un montant, relisez le récapitulatif et confirmez. Votre reçu apparaît dans <a href="/portefeuille#recus">votre portefeuille</a>.</p></div></li>
      <li><div><h3><a href="/suivi-projet">Suivre l’activité et ses résultats</a></h3><p>Ouvrez une situation pour consulter ses recettes, ses dépenses, ses justificatifs et leur effet sur votre essai. Le propriétaire crée les situations dans son espace d’administration.</p></div></li>
    </ol></section>
    <section className="split" id="roles"><div><h2>Qui fait quoi&nbsp;?</h2><p>Ces rôles décrivent le service envisagé. Aucun opérateur ou prestataire blockchain n’a conclu d’accord pour ce dossier.</p></div>
      <dl className="roles">{roles.map(([nom, role]) => <div key={nom}><dt>{nom}</dt><dd>{role}</dd></div>)}</dl>
    </section>
    <section className="split" id="revues"><div><Rubrique numero="02">Examen du montage</Rubrique><h2>Charia et contrats</h2></div><div>
      <div className="review-note"><strong>Statut · À examiner</strong><p>La Musharaka, une forme de participation associée au partage du résultat, est une piste de conception. Des professionnels qualifiés doivent examiner l’activité, les contrats, les frais, les pertes et le stablecoin retenu. ETHIGONE ne dispose d’aucune certification pour ce montage.</p></div>
      <p>Une revue juridique distincte doit préciser à qui appartiennent les machines, les droits de l’investisseur et les conditions d’entrée et de sortie.</p>
      <Lien href="/regles" discret>Explorer bénéfice, perte et retard</Lien><br /><Lien href="/charia#examens" discret>Consulter les pièces et avis attendus</Lien><br />
      <Lien href="/connexion-test" discret>Ouvrir l’essai Centrifuge</Lien><br /><Lien href="/faq" discret>Consulter les questions fréquentes</Lien>
    </div></section>
  </Cadre>;
}
