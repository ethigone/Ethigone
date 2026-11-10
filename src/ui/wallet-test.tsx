"use client";

import { useEffect, useRef, useState } from "react";
import { createWalletController, initialWalletState, injectedProvider, shortAddress } from "../blockchain/wallet";

export default function WalletTest() {
  const [state, setState] = useState(initialWalletState);
  const controller = useRef<ReturnType<typeof createWalletController> | null>(null);
  useEffect(() => {
    const instance = createWalletController(setState);
    controller.current = instance;
    return () => { instance.dispose(); controller.current = null; };
  }, []);
  function connect() {
    const ethereum = (window as Window & { ethereum?: unknown }).ethereum;
    void controller.current?.connect(injectedProvider(ethereum));
  }
  return <section className="wallet-panel" aria-labelledby="wallet-title">
    <h2 id="wallet-title">Tester la connexion à Sepolia</h2>
    <p>Dans votre extension Ethereum, ouvrez le sélecteur de réseau, affichez les réseaux de test si nécessaire et choisissez Ethereum Sepolia. Revenez ensuite ici pour connecter l’affichage.</p>
    <p className="source">Réseau requis · Ethereum Sepolia · identifiant 11155111 (0xaa36a7)</p>
    <div className="wallet-status" role="status" aria-live="polite" aria-atomic="true" aria-busy={state.status === "loading"}>
      <p>{state.message}</p>
      {state.status === "error" && <p><a href="/participer">Continuer avec un essai en euros fictifs</a> ou <a href="/faq#validations">consulter l’aide sur le wallet</a>.</p>}
      {state.address && <dl className="wallet-details facts">
        <div><dt>Adresse</dt><dd>{shortAddress(state.address)}</dd></div>
        <div><dt>Réseau</dt><dd>Ethereum Sepolia</dd></div>
      </dl>}
    </div>
    <div className="wallet-actions actions">
      <button type="button" className="action primary" disabled={state.status === "loading" || state.status === "connected"} onClick={connect}>{state.status === "loading" ? "Connexion en cours…" : state.status === "connected" ? "Affichage connecté" : "Connecter mon portefeuille"}</button>
      {(state.status === "connected" || state.status === "loading") && <button type="button" className="action" onClick={() => controller.current?.disconnect()}>Déconnecter l’affichage</button>}
    </div>
    <p className="source">L’adresse reste en mémoire dans cette page pendant la connexion. Déconnecter l’affichage efface cet état et arrête les écouteurs. Pour retirer l’autorisation du site, utilisez les réglages de votre extension.</p>
  </section>;
}
