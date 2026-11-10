const dateFr = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
});

export function Journal({ lignes }: { lignes: readonly { libelle: string; date: string; titulaire?: string }[] }) {
  if (!lignes.length) return <p className="espace-vide">Aucun événement enregistré.</p>;
  return <ol className="journal">{lignes.map((ligne, index) => <li key={index}>
    <time dateTime={ligne.date}>{dateFr.format(new Date(ligne.date))}</time>
    <div><strong>{ligne.libelle}</strong>{ligne.titulaire && <small>{ligne.titulaire}</small>}</div>
  </li>)}</ol>;
}
