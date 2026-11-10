import type { ReactNode } from "react";
import type { Projet } from "@/db/schema";
import { fichePath } from "@/src/data/lecture";

const rubriques = [
  { titre: "Découvrir", pages: [
    ["/", "Accueil"], ["/projets", "Les projets"], [fichePath, "Atelier Lavage"],
    ["/fonctionnement", "Fonctionnement"], ["/presentation", "Présentation en cinq minutes"], ["/charia", "Charia et validations"],
  ] },
  { titre: "Essayer et suivre", pages: [
    ["/regles", "Règles, frais et scénarios"], ["/participer", "Participation fictive"],
    ["/portefeuille", "Mon portefeuille"], ["/suivi-projet", "Activité du projet"],
    ["/connexion-test", "Test du wallet et de Centrifuge"],
  ] },
  { titre: "Mon compte", pages: [
    ["/mon-espace", "Mon espace"], ["/faq", "Questions fréquentes"],
    ["/assistance", "Mes demandes d’assistance"],
    ["/proposer-projet", "Proposer un projet"], ["/recherche-operateurs", "Recherche d’opérateurs"],
  ] },
];

export function Fleche() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 12h16m-6-7 7 7-7 7" /></svg>;
}

export function Lien({ href, children, discret = false }: { href: string; children: ReactNode; discret?: boolean }) {
  return <a className={discret ? "action text-action" : "action primary"} href={href}>{children}<Fleche /></a>;
}

export function Cadre({ active, children }: { active: string; children: ReactNode }) {
  return <>
    <a className="skip" href="#contenu">Aller au contenu</a>
    <header className="masthead"><div className="wrap head-inner">
      <div className="head-row">
        <a className="brand" href="/" aria-label="ETHIGONE, accueil de la démo privée">
          <img src="/favicon.svg" width="38" height="38" alt="" />
          <span>ETHIGONE<small>Démo privée</small></span>
        </a>
        <nav className="quick-nav" aria-label="Accès directs">
          {[
            ["/projets", "Projets"], ["/fonctionnement", "Fonctionnement"], ["/regles", "Règles et frais"],
            ["/charia", "Charia"], ["/faq", "FAQ"], ["/mon-espace", "Mon espace"],
          ].map(([href, label]) => <a key={href} href={href} aria-current={active === href ? "page" : undefined}>{label}</a>)}
        </nav>
      </div>
      <details className="site-menu">
        <summary><span className="menu-ouvrir">Menu</span><span className="menu-fermer">Fermer</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
        </summary>
        <nav className="directory" aria-label="Toutes les rubriques">{rubriques.map(({ titre, pages }) => <div key={titre}>
          <p>{titre}</p>
          <ul>{pages.map(([href, label]) => <li key={href}><a href={href} aria-current={active === href ? "page" : undefined}>{label}</a></li>)}</ul>
        </div>)}</nav>
      </details>
    </div></header>
    <main className="wrap" id="contenu" tabIndex={-1}>{children}</main>
    <footer><div className="wrap foot-inner"><div><span className="foot-brand">ETHIGONE</span><p>Démonstration privée · Données fictives</p></div>
      <nav aria-label="Liens de pied de page"><a href="/charia#statut">Statut des validations</a><a href="/faq">FAQ</a><a href="/assistance">Assistance</a></nav>
    </div></footer>
  </>;
}

export function Planche({ projet }: { projet: Projet }) {
  return <figure className="planche">
    <div className="plate-head"><span>FIG. 01 <b>/</b> ÉQUIPEMENT</span><span>{projet.reference}</span></div>
    <img className="schema" src="/plan-laverie.svg" width="640" height="435" alt="Schéma en trois quarts d’un lave-linge professionnel avec son hublot, son panneau de commande et sa grille de ventilation." />
    <figcaption><strong>{projet.nom}</strong><span>Illustration du lot fictif</span></figcaption>
  </figure>;
}

export function Chiffres({ projet }: { projet: Projet }) {
  const euros = (centimes: number) => new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: projet.devise, minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
  }).format(centimes / 100);
  const lignes = [
    ["Machines dans le lot", String(projet.quantite)],
    ["Prix d’une machine", euros(projet.prixUnitaireCentimes)],
    ["Coût d’achat du lot", euros(projet.quantite * projet.prixUnitaireCentimes)],
  ];
  return <dl className="metrics">{lignes.map(([label, valeur]) => <div key={label}><dt>{label}</dt><dd>{valeur}</dd></div>)}</dl>;
}

export function Rubrique({ numero, children }: { numero: string; children: ReactNode }) {
  return <div className="kicker"><span>{numero}</span><i aria-hidden="true" />{children}</div>;
}
