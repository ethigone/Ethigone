import { exigerCompte } from "@/src/data/session";
import { lireReglesDemo } from "@/src/data/registre";
import { lireProjet, fichePath } from "@/src/data/lecture";
import { uuidPreparation } from "@/src/data/formulaire-participation";
import { formatEuros } from "@/src/economie/demo";
import { Cadre, Rubrique } from "@/src/ui/site";
import { AccesCentrifuge, EtapesParticipation, HypothesesParticipation } from "@/src/ui/parcours-participation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Participer en démonstration" };

const erreurs: Record<string, string> = {
  montant: "Vérifiez le montant. Pour mille euros et cinquante centimes, saisissez 1000,50. Utilisez la plage indiquée sous le champ.",
  conditions: "Cochez la lecture des hypothèses pour préparer votre récapitulatif.",
  version: "La version des règles a changé. Relisez les hypothèses affichées avant de poursuivre.",
  conflit: "Cette préparation est déjà associée à un autre essai. Recommencez une nouvelle simulation.",
  introuvable: "La préparation demandée est indisponible dans votre compte.",
  formulaire: "Le formulaire est incomplet ou invalide. Saisissez à nouveau votre essai.",
  indisponible: "La préparation n’a pas pu être confirmée. Réessayez avec le même montant.",
};

export default async function Participer({ searchParams }: { searchParams: Promise<{ erreur?: string; montant?: string; id?: string }> }) {
  await exigerCompte("/participer");
  const [projet, regles, params] = await Promise.all([lireProjet(), lireReglesDemo(), searchParams]);
  const id = params.id && uuidPreparation.test(params.id) && params.erreur !== "conflit" ? params.id : crypto.randomUUID();
  const montantMaximum = regles.capitalCentimes * regles.partsCapitalInvestisseursPourcent / 100;
  const erreur = params.erreur && Object.hasOwn(erreurs, params.erreur) ? erreurs[params.erreur] : null;
  return <Cadre active="/participer">
    <div className="crumb"><a href={fichePath}>Le projet</a><span aria-hidden="true">/</span>Participer en démo</div>
    <section className="intro">
      <Rubrique numero={projet.reference}>Essai sans fonds</Rubrique><h1>Votre participation fictive</h1>
      <p className="lead">Choisissez un montant pour {projet.nom}. Vous pourrez le vérifier avant de l’enregistrer dans votre portefeuille de démonstration.</p>
      <div className="tags"><span>Euros fictifs</span><span>Essais indépendants</span><span>Versement réel de 0 €</span></div>
    </section>
    <EtapesParticipation etape={2} />
    <div className="participation-grille">
      <section className="participation-hypotheses">
        <Rubrique numero="01">À lire</Rubrique><h2>Les hypothèses de cet essai</h2>
        <HypothesesParticipation regles={regles} />
        <p className="paragraph-gap"><a href="/regles">Lire les règles et les trois scénarios</a> · <a href="/charia">Voir le statut des validations</a></p>
        <p className="source">Chaque essai est indépendant et ne réserve aucune part du projet. Les euros saisis ne sont pas convertis en USDC.</p>
      </section>
      <section className="saisie-participation">
        <Rubrique numero="02">Montant fictif</Rubrique><h2>Préparer mon essai</h2>
        {erreur && <p className="formulaire-erreur" id="erreur-essai" role="alert">{erreur} <a href="/faq#participation">Aide à la participation</a></p>}
        <form action="/api/participations/preparer" method="post">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="reglesId" value={regles.identifiant} />
          <label htmlFor="montant">Montant en euros fictifs</label>
          <div className="montant-saisie"><input id="montant" name="montant" inputMode="decimal" type="text" required maxLength={12} defaultValue={typeof params.montant === "string" ? params.montant.slice(0, 12) : ""} placeholder="Ex. 1000,50" aria-invalid={params.erreur === "montant" || undefined} aria-describedby={params.erreur === "montant" ? "erreur-essai borne-montant" : "borne-montant"} /><span aria-hidden="true">€</span></div>
          <p id="borne-montant" className="source">Plage de saisie de la démo de 0,01 € à {formatEuros(montantMaximum)}. Point ou virgule, sans séparateur de milliers.</p>
          <label className="accord-simulation"><input type="checkbox" name="accepte" value="oui" required aria-invalid={params.erreur === "conditions" || undefined} aria-describedby={params.erreur === "conditions" ? "erreur-essai" : undefined} /><span>J’ai lu les hypothèses et compris que cet essai enregistre des données fictives, sans engager de fonds.</span></label>
          <button className="action primary" type="submit">Vérifier mon essai</button>
        </form>
        <a className="text-action action" href="/portefeuille">Retrouver mes essais enregistrés</a>
      </section>
    </div>
    <AccesCentrifuge />
  </Cadre>;
}
