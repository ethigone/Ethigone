import { fichePath, lireProjet } from "@/src/data/lecture";
import { lireReglesDemo } from "@/src/data/registre";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Lien, Rubrique } from "@/src/ui/site";

export const metadata = { title: "Présentation en cinq minutes" };
export const dynamic = "force-dynamic";

export default async function Presentation() {
  const [projet, r] = await Promise.all([lireProjet(), lireReglesDemo()]);
  return <Cadre active="/presentation">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>Présentation</div>
    <section className="intro">
      <Rubrique numero="J10">9 novembre 2026 · Fin du sprint</Rubrique>
      <h1>Présenter ETHIGONE<br />en cinq minutes.</h1>
      <p className="lead">Un projet fictif, un essai personnel et trois scénarios pour comprendre le parcours, ses risques et les étapes avant un pilote.</p>
      <p>L’objectif envisagé est une participation en stablecoins. Le parcours disponible utilise des euros fictifs. La branche de test Centrifuge lit un pool technique externe sur Ethereum Sepolia, distinct d’Atelier Lavage.</p>
      <div className="actions"><Lien href="#deroule">Commencer la présentation</Lien><Lien href="#bilan" discret>Lire le bilan du sprint</Lien></div>
    </section>

    <section className="split" id="preparation">
      <div><h2>Avant de lancer les cinq minutes</h2><p>Préparation du propriétaire, hors chronomètre.</p></div>
      <div>
        <ul className="simple-list">
          <li>Ouvrir le Site privé avec le compte Sites qui servira à la présentation. Vérifier l’accès à <a href="/mon-espace">Mon espace</a> et au <a href="/portefeuille">portefeuille</a>.</li>
          <li>Ouvrir la <a href={fichePath}>fiche du projet</a>, la <a href="/participer">participation fictive</a> et les <a href="/regles#scenarios">trois scénarios</a> dans des onglets prêts à consulter.</li>
          <li>Repérer les reçus déjà présents pour reconnaître le nouvel essai. Le montant proposé pendant la démonstration est de 1 000 € fictifs. Sa confirmation explicite enregistrera un essai personnel indépendant.</li>
          <li>Vérifier si une situation est déjà visible dans le <a href="/suivi-projet">suivi</a>. Si la liste est vide, présenter les scénarios dans les règles. La présentation fonctionne sans créer de situation.</li>
          <li>Prévoir un écran lisible et vérifier la navigation sur l’appareil utilisé. Le rendu visuel, les gestes mobiles et la connexion réelle du propriétaire restent à vérifier.</li>
        </ul>
        <p className="source">Cette page fournit un guide de lecture. Elle ne prépare ni participation ni situation. Les espaces personnels nécessitent un compte Sites connecté.</p>
      </div>
    </section>

    <section className="presentation-parcours" id="deroule">
      <Rubrique numero="5 MIN">Déroulé chronométré</Rubrique><h2>Du dossier au suivi</h2>
      <ol className="presentation-steps">
        <li><span className="presentation-time">0:00 → 0:45</span><div><h3>Poser l’objectif</h3><p>Depuis l’<a href="/">accueil</a>, expliquer le financement envisagé d’équipements exploités par un opérateur, avec un partage du résultat. Présenter {projet.nom} comme l’unique exemple fictif du sprint.</p></div></li>
        <li><span className="presentation-time">0:45 → 1:30</span><div><h3>Lire le dossier et ses risques</h3><p>Ouvrir la <a href={fichePath}>fiche</a>. Le capital de référence est de {formatEuros(r.capitalCentimes)}, dont {formatEuros(r.achatCentimes)} de machines et {formatEuros(r.tresorerieInitialeCentimes)} de trésorerie initiale. Les frais de {formatEuros(r.fraisEthigoneCentimes)} sont déduits une fois sur les {r.periodeMois} mois illustrés. L’horizon indicatif de {r.horizonIndicatifMois} mois comporte un risque de perte et de retard, sans garantie de remboursement ni de rendement.</p></div></li>
        <li><span className="presentation-time">1:30 → 2:30</span><div><h3>Essayer 1 000 € fictifs</h3><p>Ouvrir <a href="/participer">Participer</a>, saisir 1 000, lire les conditions et cocher l’accord demandé. Préparer l’essai, puis relire le montant et la version des règles sur la confirmation avant de confirmer explicitement.</p></div></li>
        <li><span className="presentation-time">2:30 → 3:00</span><div><h3>Retrouver la preuve de l’essai</h3><p>Ouvrir le <a href="/portefeuille#recus">portefeuille et ses reçus</a>. Montrer le montant enregistré et son reçu. Chaque essai reste indépendant. Aucun argent réel n’est versé et aucun droit financier n’est acquis.</p></div></li>
        <li><span className="presentation-time">3:00 → 4:15</span><div><h3>Comparer bénéfice, perte et retard</h3><p>Dans les <a href="/regles#scenarios">scénarios</a>, sélectionner successivement Bénéfice, Perte et Retard. Expliquer la différence entre résultat économique et trésorerie disponible. Dans le <a href="/suivi-projet">suivi</a>, ouvrir une situation existante pour montrer les mouvements, les pièces fictives et la projection personnelle. Si aucune situation n’existe, poursuivre avec les règles.</p></div></li>
        <li><span className="presentation-time">4:15 → 5:00</span><div><h3>Dire ce qui reste à obtenir</h3><p>Présenter le <a href="#bilan">bilan ci-dessous</a> et les <a href="/charia#examens">examens attendus</a>. La conformité charia est une condition non négociable du projet. Les professionnels doivent examiner l’activité, les contrats, l’USDC envisagé et les règles avant tout pilote.</p></div></li>
      </ol>
    </section>

    <section className="presentation-bilan" id="bilan">
      <Rubrique numero="BILAN">État au terme du sprint</Rubrique><h2>Ce que l’on peut montrer</h2>
      <div className="presentation-status-grid">
        <article><h3>Fonctionne dans la démo</h3><p>Navigation, dossier, règles et scénarios. Les parcours personnels enregistrent participation, reçu, suivi, assistance et candidature avec un compte Sites. Les rôles protègent l’administration. Les contrôles locaux HTML, HTTP, TypeScript et des calculs sont documentés dans le projet.</p><p>Ces fonctions ont été testées avec des identités simulées. Leur utilisation avec la connexion réelle du propriétaire reste à vérifier.</p></article>
        <article><h3>Simulé ou fictif</h3><p>Atelier Lavage, montants EUR, machines, loyers, justificatifs, résultats et distributions. Le connecteur wallet a été testé avec un fournisseur simulé. Le versement réel autorisé reste nul.</p><p>La collecte globale, son activation et sa restitution restent à implémenter. Les essais personnels ne constituent aucune collecte.</p></article>
        <article><h3>À vérifier avant un pilote</h3><p>Connexion réelle du propriétaire, rendu dans le navigateur et gestes mobiles. Connexion à une extension wallet réelle. Autorisation des adresses et obtention des jetons pour une participation blockchain de test.</p><p>Examens charia, juridique et comptable, contrats, droits sur les machines, frais, pertes, liquidité et stablecoin. Aucun accord opérateur ni certification charia ou juridique n’est acquis.</p></article>
      </div>
      <div className="review-note presentation-network"><strong>Centrifuge · Branche technique distincte</strong><p>Dernière lecture réelle connue le 4 novembre 2026. Cette preuve historique ne confirme pas la disponibilité actuelle de l’indexeur. Les tests rejoués utilisent une réponse enregistrée. Atelier Lavage possède son dossier fictif et aucun pool blockchain déployé.</p><Lien href="/connexion-test" discret>Consulter la connexion de test</Lien></div>
    </section>

    <section className="split" id="prolongements">
      <div><h2>Après les cinq minutes</h2><p>Parcours optionnels à montrer selon les questions. Le sprint se termine le 9 novembre.</p></div>
      <div><ul className="simple-list">
        <li><a href="/administration">Administration</a> et <a href="/administration/gestion">gestion</a>, avec le rôle administrateur, pour expliquer les situations, les justificatifs et la distribution fictive.</li>
        <li><a href="/proposer-projet">Candidature</a> et <a href="/administration/candidatures">préexamen administratif</a> pour présenter les versions et les décisions motivées.</li>
        <li><a href="/recherche-operateurs">Recherche d’opérateurs</a> pour consulter des pistes françaises à titre d’exemple. Aucun opérateur n’a été contacté. La zone d’un éventuel pilote reste à décider.</li>
        <li><a href="/faq">Questions fréquentes</a> et <a href="/assistance">assistance personnelle</a> pour retrouver une explication ou enregistrer un cas fictif.</li>
      </ul></div>
    </section>
  </Cadre>;
}
