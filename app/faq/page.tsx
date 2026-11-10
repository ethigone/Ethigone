import { lireReglesDemo } from "@/src/data/registre";
import { fichePath } from "@/src/data/lecture";
import { calculerScenario, formatEuros, scenariosDemo } from "@/src/economie/demo";
import { Cadre, Lien } from "@/src/ui/site";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Questions fréquentes" };

function Question({ titre, children }: { titre: string; children: ReactNode }) {
  return <details><summary>{titre}</summary><div className="faq-answer">{children}</div></details>;
}

export default async function Faq({ searchParams }: { searchParams: Promise<{ acces?: string }> }) {
  const [r, params] = await Promise.all([lireReglesDemo(), searchParams]);
  const retard = calculerScenario(scenariosDemo.find(s => s.id === "retard")!, r);
  return <Cadre active="/faq">
    <div className="crumb"><a href="/">Accueil</a><span aria-hidden="true">/</span>FAQ</div>
    <section className="intro"><h1>Questions fréquentes</h1>
      <p className="lead">Retrouvez un reçu, comprenez les frais ou vérifiez ce qui se passe quand un loyer tarde à arriver.</p>
    </section>
    {params.acces === "origine" && <div className="formulaire-erreur" role="alert" id="reprendre">
      <strong>Le formulaire doit être ouvert depuis ETHIGONE.</strong>
      <p>Votre saisie n’a pas été enregistrée. <a href="/mon-espace">Retournez dans votre espace</a> pour rouvrir le formulaire.</p>
    </div>}
    <nav className="chapter" aria-label="Sujets de la FAQ">
      <a href="#participation">Participation et accès</a><a href="#argent">Frais, pertes et sortie</a>
      <a href="#suivi">Suivi du projet</a><a href="#validations">Wallet et charia</a>
    </nav>
    <section className="split faq-section" id="participation">
      <h2>Participation et accès</h2><div className="risques">
        <Question titre="Dois-je connecter un wallet pour essayer ?">
          <p>Votre compte donne accès à la simulation. Choisissez un montant en euros fictifs, relisez le récapitulatif puis confirmez. Vous pouvez suivre tout le parcours sans transférer de stablecoins.</p>
          <a href="/participer">Essayer une participation fictive</a>
        </Question>
        <Question titre="Où retrouver ma participation et son reçu ?">
          <p>Ouvrez votre portefeuille avec le compte utilisé pour confirmer l’essai. Le montant figure dans vos participations et le reçu dans la rubrique « Mes reçus et documents ». Un montant seulement saisi ou un dossier seulement suivi n’y apparaît pas.</p>
          <a href="/portefeuille#recus">Ouvrir mes reçus</a>
        </Question>
        <Question titre="La connexion a expiré ou mon espace semble vide. Que faire ?">
          <p>Rouvrez « Mon espace » avec le même compte. Consultez votre portefeuille avant de recommencer un essai. L’administration de cette démo est réservée au propriétaire.</p>
          <a href="/mon-espace">Revenir à mon espace</a>
        </Question>
      </div>
    </section>
    <section className="split faq-section" id="argent">
      <h2>Frais, pertes et sortie</h2><div className="risques">
        <Question titre="Qui supporte les frais ETHIGONE ?">
          <p>Le projet fictif paie {formatEuros(r.fraisEthigoneCentimes)} pour les {r.periodeMois} mois illustrés. Cette charge entre une seule fois dans le calcul du résultat, même en cas de perte. Préparer plusieurs essais personnels ne la multiplie pas.</p>
          <a href="/regles#partage">Voir les frais et le partage du résultat</a>
        </Question>
        <Question titre="Comment une perte se répercute-t-elle sur mon essai ?">
          <p>Dans cet exemple, les investisseurs supportent ensemble {r.partsCapitalInvestisseursPourcent} % d’une perte ordinaire et l’opérateur {r.partsCapitalOperateurPourcent} %, selon leurs apports. Le suivi calcule ensuite votre fraction du groupe pour chaque essai. Une panne, un impayé ou une revente à bas prix peuvent entamer le capital.</p>
          <a href={fichePath + "#risques"}>Examiner les risques du lot</a>
        </Question>
        <Question titre="Puis-je sortir à une date précise ?">
          <p>Les {r.horizonIndicatifMois} mois sont un horizon de travail. La sortie dépendrait des contrats, d’un acheteur et des fonds disponibles. Le montant récupéré peut être inférieur à l’apport. La démo propose uniquement des essais fictifs.</p>
          <a href="/regles#sortie">Lire les hypothèses de sortie</a>
        </Question>
      </div>
    </section>
    <section className="split faq-section" id="suivi">
      <h2>Suivi du projet</h2><div className="risques">
        <Question titre="Pourquoi un bénéfice peut-il donner zéro distribution ?">
          <p>Dans le scénario de retard, il reste {formatEuros(retard.creancesCentimes)} de loyers à encaisser. Le résultat atteint {formatEuros(retard.resultatEconomiqueCentimes)}, mais la trésorerie de {formatEuros(retard.tresorerieCentimes)} est inférieure aux {formatEuros(r.montantAConserverCentimes)} à conserver. Le plafond de distribution fictive est donc de {formatEuros(retard.plafondIllustratifCentimes)}.</p>
          <a href="/regles#scenarios">Comparer les trois scénarios</a>
        </Question>
        <Question titre="Où voir les dépenses, les pièces et les incidents ?">
          <p>Dans « Activité du projet », choisissez une situation, puis ouvrez ses mouvements et justificatifs. Si la liste est vide, le propriétaire peut ouvrir une première situation depuis « Mon espace », puis « Ouvrir l’administration » et « Gérer le projet fictif ».</p>
          <a href="/suivi-projet">Ouvrir le suivi du projet</a>
        </Question>
      </div>
    </section>
    <section className="split faq-section" id="validations">
      <h2>Wallet et charia</h2><div className="risques">
        <Question titre="À quoi sert le test Centrifuge ?">
          <p>La page de test permet de lire un pool externe et d’essayer la connexion d’un wallet sur Sepolia. Atelier Lavage utilise son propre registre fictif en euros. Le test du wallet ne crée aucune participation dans le projet.</p>
          <a href="/connexion-test">Ouvrir la connexion de test</a>
        </Question>
        <Question titre="Le projet a-t-il reçu une validation charia ?">
          <p>L’examen reste à mener. La Musharaka sert d’hypothèse de travail. Des professionnels qualifiés doivent notamment examiner les contrats de location et d’association, le partage des pertes, les frais et le stablecoin envisagé.</p>
          <a href="/charia#examens">Consulter les pièces et avis attendus</a>
        </Question>
      </div>
    </section>
    <aside className="help-band"><div><h2>Besoin d’aide sur un essai&nbsp;?</h2><p>Décrivez un cas fictif et retrouvez la réponse dans votre espace privé.</p></div>
      <Lien href="/assistance">Ouvrir l’assistance</Lien>
    </aside>
  </Cadre>;
}
