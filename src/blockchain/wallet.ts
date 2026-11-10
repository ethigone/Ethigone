export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const SEPOLIA_CHAIN_NUMBER = 11155111;
export type WalletMethod = "eth_chainId" | "eth_requestAccounts";
export type WalletEvent = "accountsChanged" | "chainChanged" | "disconnect";
export interface InjectedProvider {
  request(args: { method: WalletMethod }): Promise<unknown>;
  on(event: WalletEvent, listener: (value: unknown) => void): void;
  removeListener(event: WalletEvent, listener: (value: unknown) => void): void;
}
export type WalletState = {
  status: "idle" | "loading" | "connected" | "error";
  message: string;
  address?: string;
};
export const initialWalletState: WalletState = { status: "idle", message: "Affichage déconnecté." };
export function isSepolia(value: unknown): boolean {
  return typeof value === "string" && /^0x[0-9a-f]+$/i.test(value) && BigInt(value) === BigInt(SEPOLIA_CHAIN_NUMBER);
}
export function accountFrom(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0 || !value.every(account => typeof account === "string" && /^0x[0-9a-f]{40}$/i.test(account))) return undefined;
  return value[0];
}
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
export function injectedProvider(value: unknown): InjectedProvider | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<InjectedProvider>;
  return typeof candidate.request === "function" && typeof candidate.on === "function" && typeof candidate.removeListener === "function" ? candidate as InjectedProvider : undefined;
}
function errorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === 4001) return "Connexion refusée dans le portefeuille. Vous pouvez réessayer.";
  if (code === -32002) return "Une demande est déjà ouverte dans votre portefeuille. Traitez-la avant de réessayer.";
  return "La connexion au portefeuille a échoué. Vérifiez votre extension puis réessayez.";
}

// Le contrôleur ne conserve l’adresse qu’en mémoire et limite les méthodes RPC.
export function createWalletController(publish: (state: WalletState) => void) {
  let generation = 0;
  let busy = false;
  let connected = false;
  let cleanup = () => {};
  function reset(state: WalletState) {
    generation++;
    busy = false;
    connected = false;
    cleanup();
    cleanup = () => {};
    publish(state);
  }
  return {
    disconnect() { reset(initialWalletState); },
    dispose() {
      generation++;
      busy = false;
      connected = false;
      cleanup();
      cleanup = () => {};
    },
    async connect(provider: InjectedProvider | undefined) {
      if (busy || connected) return;
      if (!provider) {
        reset({ status: "error", message: "Aucun portefeuille injecté compatible détecté. Ouvrez cette page dans un navigateur équipé d’une extension Ethereum compatible." });
        return;
      }
      reset({ status: "loading", message: "Vérification de Sepolia puis demande d’accès aux comptes…" });
      busy = true;
      const attempt = generation;
      const current = () => attempt === generation;
      let changedAccounts: unknown;
      const listeners: [WalletEvent, (value: unknown) => void][] = [
        ["chainChanged", () => reset({ status: "error", message: "Le réseau a changé. Sélectionnez Sepolia dans votre portefeuille puis reconnectez l’affichage." })],
        ["disconnect", () => reset({ status: "idle", message: "Le portefeuille s’est déconnecté. Vous pouvez reconnecter l’affichage." })],
        ["accountsChanged", accounts => {
          const address = accountFrom(accounts);
          if (!address) {
            reset({ status: "idle", message: "Aucun compte valide accessible. Reconnectez l’affichage." });
            return;
          }
          if (!connected) {
            changedAccounts = accounts;
            return;
          }
          publish({ status: "connected", message: "Affichage connecté à Sepolia.", address });
        }],
      ];
      cleanup = () => { for (const [event, listener] of listeners) provider.removeListener(event, listener); };
      try {
        for (const [event, listener] of listeners) provider.on(event, listener);
        const chainBefore = await provider.request({ method: "eth_chainId" });
        if (!current()) return;
        if (!isSepolia(chainBefore)) {
          reset({ status: "error", message: "Réseau incompatible ou invalide. Sélectionnez Ethereum Sepolia dans votre portefeuille puis réessayez." });
          return;
        }
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (!current()) return;
        const chainAfter = await provider.request({ method: "eth_chainId" });
        if (!current()) return;
        if (!isSepolia(chainAfter)) {
          reset({ status: "error", message: "Le réseau vérifié après autorisation n’est pas Sepolia. Sélectionnez Sepolia puis réessayez." });
          return;
        }
        const address = accountFrom(accounts);
        if (changedAccounts && accountFrom(changedAccounts)?.toLowerCase() !== address?.toLowerCase()) {
          reset({ status: "error", message: "Le compte a changé pendant l’autorisation. Reconnectez l’affichage pour vérifier le compte actif." });
          return;
        }
        if (!address) {
          reset({ status: "error", message: "Le portefeuille n’a fourni aucun compte Ethereum valide." });
          return;
        }
        busy = false;
        connected = true;
        publish({ status: "connected", message: "Affichage connecté à Sepolia.", address });
      } catch (error) {
        if (current()) reset({ status: "error", message: errorMessage(error) });
      }
    },
  };
}
