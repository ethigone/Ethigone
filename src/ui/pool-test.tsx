"use client";

import { useEffect, useRef, useState } from "react";
import type { PoolObservation } from "@/src/blockchain/centrifuge-test";

export default function PoolTest() {
  const [observation, setObservation] = useState<PoolObservation | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function lire() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    setObservation(null);
    try {
      const response = await fetch("/api/centrifuge-test", { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Lecture indisponible. Réessayez dans quelques instants.");
      const data: PoolObservation = await response.json();
      if (!controller.signal.aborted) setObservation(data);
    } catch {
      if (!controller.signal.aborted) setError("Lecture indisponible. La source peut être interrompue ou avoir changé. Réessayez plus tard.");
    } finally {
      if (!controller.signal.aborted) setPending(false);
      request.current = null;
    }
  }

  return <section className="wallet-panel" aria-labelledby="pool-title">
    <h2 id="pool-title">Lire le pool Centrifuge</h2>
    <p>Interrogez l’indexeur officiel de test. Cette lecture est indépendante de la connexion du wallet.</p>
    <button type="button" className="action primary" disabled={pending} onClick={lire}>{pending ? "Lecture en cours…" : "Lire le pool de test"}</button>
    <div className="wallet-status" role="status" aria-live="polite" aria-atomic="true" aria-busy={pending}>
      {!observation && !error && <p>{pending ? "Requête en cours vers l’indexeur testnet…" : "Prêt à interroger la source."}</p>}
      {error && <p>{error} Vous pouvez aussi <a href="/preuves/centrifuge-j2.json">consulter le relevé archivé du 1er novembre</a>.</p>}
      {observation && <>
        <p className="read-success">Réponse de l’indexeur reçue</p>
        <dl className="facts chain-facts">
          <div><dt>Pool externe</dt><dd>{observation.pool.nom || "Nom non renseigné"}</dd></div>
          <div><dt>Identifiant</dt><dd><code>{observation.pool.id}</code></dd></div>
          <div><dt>Part de test</dt><dd>{observation.part.symbole || "Symbole non renseigné"}</dd></div>
          <div><dt>Coffre de test</dt><dd><code>{observation.coffre.adresse}</code></dd></div>
          <div><dt>État déclaré par l’API</dt><dd>Pool {observation.pool.actif ? "actif" : "inactif"}, coffre {observation.coffre.actif ? "actif" : "inactif"}</dd></div>
          <div><dt>Lecture effectuée</dt><dd><time dateTime={observation.observeLe}>{new Date(observation.observeLe).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · Paris</time></dd></div>
        </dl>
        <p className="source">L’heure correspond à la requête. La fraîcheur du dernier bloc indexé reste à vérifier. Un statut actif ne confirme aucune autorisation de participation.</p>
      </>}
    </div>
  </section>;
}
