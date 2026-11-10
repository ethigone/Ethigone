import { Cadre, Lien, Rubrique } from "@/src/ui/site";
import WalletTest from "@/src/ui/wallet-test";
import PoolTest from "@/src/ui/pool-test";

export const metadata = { title: "Connexion de test · Centrifuge" };

export default function ConnexionTest() {
  return <Cadre active="/connexion-test">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Connexion de test</div>
    <section className="intro">
      <Rubrique numero="TESTNET">Essai technique</Rubrique>
      <h1>Tester un wallet et lire un pool</h1>
      <p className="lead">Essayez la lecture d’un pool de test et l’affichage d’un wallet sur Ethereum Sepolia.</p>
      <div className="tags"><span>Lecture seule</span><span>Ethereum Sepolia</span></div>
    </section>
    <div className="test-grid"><WalletTest /><PoolTest /></div>
    <section className="split">
      <div><Rubrique numero="01">Ce que l’essai établit</Rubrique><h2>Une première lecture réelle</h2></div>
      <div>
        <p>La requête lit un pool technique externe de Centrifuge et ses identifiants RWAt. Atelier Lavage reste notre scénario fictif, avec son propre dossier. Il n’a aucun pool blockchain déployé.</p>
        <p className="paragraph-gap">La lecture de l’indexeur a réussi le 1er novembre 2026. Le connecteur wallet a été testé avec un fournisseur simulé. La connexion à une extension réelle reste à vérifier dans le navigateur.</p>
        <Lien href="/preuves/centrifuge-j2.json" discret>Ouvrir la preuve technique enregistrée</Lien>
      </div>
    </section>
    <section className="split">
      <div><Rubrique numero="02">Prochaine étape technique</Rubrique><h2>Préparer l’essai de participation</h2></div>
      <div>
        <p>Pour le pool technique documenté, Centrifuge demande l’autorisation préalable des adresses de test et fournit les jetons de test sur demande. Ces accès restent à obtenir. Le traitement d’une participation demande ensuite l’intervention du gestionnaire du pool.</p>
        <p className="paragraph-gap">L’adaptation au partage des bénéfices et des pertes d’ETHIGONE doit être examinée avec les contrats et les règles du projet.</p>
        <p className="source">Documentation consultée le 1er novembre 2026.</p>
        <ul className="simple-list">
          <li><a href="https://bd.docs.centrifuge.io/centrifuge-integration-guide.html">Guide officiel des essais Centrifuge</a></li>
          <li><a href="https://bd.docs.centrifuge.io/JTRSY-integration-guide.html">Identifiants et API du déploiement Sepolia</a></li>
          <li><a href="https://docs.centrifuge.io/developer/centrifuge-api/">Interface GraphQL officielle</a></li>
        </ul>
      </div>
    </section>
  </Cadre>;
}
