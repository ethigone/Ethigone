import { notFound, redirect } from "next/navigation";
import { exigerCompte } from "@/src/data/session";
import { listerSituations, lireSituation } from "@/src/data/gestion";
import { uuidPreparation } from "@/src/data/formulaire-participation";
import { formatEuros, repartirCentimes, scenariosDemo } from "@/src/economie/demo";
import { Cadre, Rubrique } from "@/src/ui/site";
import { BilanGestion, ListeSituations, PiecesGestion, typesOperation } from "@/src/ui/suivi-gestion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion du projet fictif" };
const messages: Record<string, string> = {
  saisie: "Vérifiez le type, le montant et les textes requis. Les montants doivent conserver une trésorerie positive ou nulle, respecter les créances et la valeur d’achat des machines.",
  conflit: "La situation a changé ou cette clé a déjà été utilisée. L’état à jour est affiché. Vérifiez-le avant une nouvelle saisie.",
  introuvable: "Cette situation est introuvable. Sélectionnez un dossier enregistré.",
  interdit: "Cette action est réservée à l’administration.",
  plafond: "Le plafond est nul. Cette situation ne permet aucune distribution fictive.",
  formulaire: "Le formulaire est incomplet ou trop volumineux. Réduisez les textes et ressaisissez les champs.",
  indisponible: "L’enregistrement n’a pas pu être confirmé. Rechargez la situation et vérifiez ses mouvements avant de réessayer.",
};

export default async function Gestion({ searchParams }: { searchParams: Promise<{ id?: string; erreur?: string }> }) {
  const params = await searchParams;
  const id = typeof params.id === "string" && uuidPreparation.test(params.id) ? params.id : null;
  return <ContenuGestion id={id} erreur={typeof params.erreur === "string" ? params.erreur : ""} />;
}

async function ContenuGestion({ id, erreur }: { id: string | null; erreur: string }) {
  const compte = await exigerCompte("/administration/gestion" + (id ? "?id=" + id : ""));
  if (compte.role !== "administrateur") redirect("/mon-espace?acces=reserve");
  const [situations, situation] = await Promise.all([listerSituations(compte), id ? lireSituation(compte, id) : null]);
  if (id && !situation) notFound();
  const parts = situation ? repartirCentimes(situation.bilan.plafondIllustratifCentimes, situation.regles.partsBeneficesInvestisseursPourcent) : null;
  return <Cadre active="/mon-espace">
    <div className="crumb"><a href="/administration">Administration</a><span aria-hidden="true">/</span>Gestion</div>
    <section className="intro"><Rubrique numero="GESTION">Atelier Lavage · EUR fictifs</Rubrique><h1>Suivre l’activité</h1>
      <p className="lead">Enregistrez une recette, une dépense ou un incident, joignez une note et observez leurs effets sur le projet.</p>
      <p>Chaque situation part d’une hypothèse indépendante. Une distribution fictive clôture cette situation. Les inscriptions de démonstration restent des essais individuels.</p>
    </section>
    {Object.hasOwn(messages, erreur) && <div className="formulaire-erreur" role="alert">{messages[erreur]} <a href="/faq#suivi">Aide au suivi du projet</a></div>}
    <section className="portefeuille-section"><h2>Créer une situation de démonstration</h2>
      <div className="gestion-demarrages">{scenariosDemo.map(s => <form action="/api/gestion" method="post" key={s.id}>
        <input type="hidden" name="action" value="creer" /><input type="hidden" name="id" value={crypto.randomUUID()} />
        <input type="hidden" name="scenarioId" value={s.id} /><button type="submit" className="action primary">Ouvrir « {s.titre} »</button>
      </form>)}</div>
      <p className="source">La base de départ reprend les douze mois illustrés dans les règles. Ces montants proviennent exclusivement d’hypothèses fictives.</p>
    </section>
    <ListeSituations situations={situations} chemin="/administration/gestion" selection={id ?? undefined} />
    {situation ? <>
      <BilanGestion situation={situation} />
      <p><a href={"/suivi-projet?id=" + situation.id}>Voir la présentation investisseur de cette situation</a></p>
      {situation.statut === "ouverte" && <div className="participation-grille gestion-formulaires">
        <section className="saisie-participation"><Rubrique numero="01">Mouvement fictif</Rubrique><h2>Ajouter une opération</h2>
          <form action="/api/gestion" method="post" className="gestion-form">
            <input type="hidden" name="action" value="operation" /><input type="hidden" name="id" value={crypto.randomUUID()} />
            <input type="hidden" name="situationId" value={situation.id} /><input type="hidden" name="revision" value={situation.revision} />
            <label htmlFor="type-operation">Type d’opération</label><select id="type-operation" name="type" required aria-describedby="aide-operation">{Object.entries(typesOperation).map(([cle, titre]) => <option key={cle} value={cle}>{titre}</option>)}</select>
            <p id="aide-operation" className="source">Une nouvelle location ajoute un loyer acquis et encaissé. Un encaissement règle une créance existante. La valorisation remplace la valeur restante des machines.</p>
            <label htmlFor="montant-operation">Montant en euros fictifs</label><input id="montant-operation" name="montant" inputMode="decimal" maxLength={18} placeholder="Ex. 120,50" aria-describedby="aide-montant" />
            <p id="aide-montant" className="source">Deux décimales au maximum, sans espaces. Laissez vide pour un incident. Zéro est accepté pour la valeur des machines.</p>
            <label htmlFor="libelle-operation">Libellé</label><input id="libelle-operation" name="libelle" maxLength={160} required placeholder="Ex. Entretien fictif du lot" />
            <label htmlFor="piece-operation">Justificatif fictif en texte</label><textarea id="piece-operation" name="pieceTexte" rows={4} maxLength={600} required placeholder="Décrivez le motif, la date et la référence fictive de la pièce." />
            <p className="source">Note de démonstration visible aux comptes autorisés à suivre le projet. Utilisez uniquement des données fictives. 600 caractères maximum.</p>
            <button className="action primary" type="submit">Enregistrer l’opération fictive</button>
          </form>
        </section>
        <section className="saisie-participation"><Rubrique numero="02">Simulation unique</Rubrique><h2>Simuler la distribution</h2>
          <p className="montant-recap">{formatEuros(situation.bilan.plafondIllustratifCentimes)}</p>
          <p>Plafond recalculé sur cette révision. Part investisseurs {formatEuros(parts!.investisseursCentimes)}, part opérateur {formatEuros(parts!.operateurCentimes)}.</p>
          <p>Liquidités après simulation {formatEuros(situation.bilan.tresorerieCentimes - situation.bilan.plafondIllustratifCentimes)}.</p>
          {situation.bilan.plafondIllustratifCentimes > 0 ? <form action="/api/gestion" method="post">
            <input type="hidden" name="action" value="distribuer" /><input type="hidden" name="id" value={crypto.randomUUID()} />
            <input type="hidden" name="situationId" value={situation.id} /><input type="hidden" name="revision" value={situation.revision} />
            <label className="accord-simulation"><input type="checkbox" name="confirme" value="oui" required /><span>Je confirme cette distribution fictive et la clôture de la situation. Aucun paiement n’est effectué.</span></label>
            <button className="action primary" type="submit">Enregistrer la distribution fictive</button>
          </form> : <p className="scenario-status">Plafond nul. Le résultat ou les liquidités disponibles ne permettent aucune distribution fictive.</p>}
          <p className="source">Répartition en centimes, résidu attribué à l’opérateur. Versement réel autorisé de 0 €. Pour prolonger l’exercice, créez une autre situation indépendante.</p>
        </section>
      </div>}
      <PiecesGestion situation={situation} />
    </> : <p className="scenario-status">Choisissez une situation enregistrée ou ouvrez l’un des trois scénarios pour commencer.</p>}
  </Cadre>;
}
