import { Cadre, Lien, Rubrique } from "@/src/ui/site";

export default function Introuvable() {
  return <Cadre active=""><section className="intro"><Rubrique numero="404">Navigation</Rubrique><h1>Page introuvable</h1>
    <p className="lead">Vérifiez le lien. Pour retrouver un essai ou un document, ouvrez le portefeuille du compte qui l’a enregistré.</p>
    <div className="actions"><Lien href="/portefeuille">Ouvrir mon portefeuille</Lien><a href="/">Retrouver l’accueil</a><a href="/assistance">Ouvrir l’assistance</a></div>
  </section></Cadre>;
}
