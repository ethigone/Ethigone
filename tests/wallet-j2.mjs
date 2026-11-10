// Simulation explicite uniquement. Aucun portefeuille réel ni réseau utilisé.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("wrangler")] }));
await mkdir(".sites-runtime", { recursive: true });
const temp = await mkdtemp(path.resolve(".sites-runtime/wallet-j2-"));
try {
  const file = path.join(temp, "wallet.cjs");
  await esbuild.build({ entryPoints: ["src/blockchain/wallet.ts"], outfile: file, bundle: true, platform: "node", format: "cjs" });
  const { createWalletController, isSepolia, accountFrom, injectedProvider } = require(file);
  const address = "0x" + "12".repeat(20);
  const second = "0x" + "34".repeat(20);
  class SimulatedProvider {
    calls = [];
    listeners = new Map();
    chain = "0xaa36a7";
    accounts = [address];
    failure;
    pending;
    async request({ method }) {
      assert.ok(["eth_chainId", "eth_requestAccounts"].includes(method), `Méthode interdite ${method}`);
      this.calls.push(method);
      if (method === "eth_chainId") return this.chain;
      if (this.failure) throw this.failure;
      if (this.pending) return this.pending;
      return this.accounts;
    }
    on(event, listener) {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event).add(listener);
    }
    removeListener(event, listener) { this.listeners.get(event)?.delete(listener); }
    emit(event, value) { for (const listener of [...(this.listeners.get(event) || [])]) listener(value); }
    count() { return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0); }
  }
  function setup() {
    const states = [];
    const controller = createWalletController(state => states.push(state));
    const provider = new SimulatedProvider();
    return { controller, provider, states, last: () => states.at(-1) };
  }
  assert.equal(isSepolia("0xaa36a7"), true);
  for (const chain of [1, null, "11155111", "0x1", "invalid"]) assert.equal(isSepolia(chain), false);
  for (const accounts of [[], ["bad"], null, [address, 4]]) assert.equal(accountFrom(accounts), undefined);
  assert.equal(injectedProvider({ request() {} }), undefined);
  {
    const t = setup();
    await t.controller.connect(undefined);
    assert.equal(t.last().status, "error");
    assert.equal(t.provider.calls.length, 0);
  }
  for (const chain of ["0x1", null, "invalid"]) {
    const t = setup(); t.provider.chain = chain;
    await t.controller.connect(t.provider);
    assert.deepEqual(t.provider.calls, ["eth_chainId"]);
    assert.equal(t.last().status, "error"); assert.equal(t.provider.count(), 0);
  }
  {
    const t = setup(); await t.controller.connect(t.provider);
    assert.deepEqual(t.provider.calls, ["eth_chainId", "eth_requestAccounts", "eth_chainId"]);
    assert.equal(t.last().address, address);
    await t.controller.connect(t.provider);
    assert.equal(t.provider.calls.length, 3);
    t.provider.emit("accountsChanged", [second]); assert.equal(t.last().address, second);
    t.provider.emit("accountsChanged", []); assert.equal(t.last().address, undefined); assert.equal(t.provider.count(), 0);
  }
  for (const code of [4001, -32002, 999]) {
    const t = setup(); t.provider.failure = { code };
    await t.controller.connect(t.provider);
    assert.equal(t.last().status, "error"); assert.equal(t.provider.count(), 0);
    assert.match(t.last().message, code === 4001 ? /refusée/ : code === -32002 ? /déjà ouverte/ : /échoué/);
  }
  {
    const t = setup(); t.provider.accounts = ["invalid"];
    await t.controller.connect(t.provider); assert.equal(t.last().status, "error"); assert.equal(t.provider.count(), 0);
  }
  for (const event of ["chainChanged", "disconnect"]) {
    const t = setup(); await t.controller.connect(t.provider);
    t.provider.emit(event, "0x1"); assert.equal(t.last().address, undefined); assert.equal(t.provider.count(), 0);
  }
  for (const cancel of ["disconnect", "dispose", "chainChanged"]) {
    const t = setup(); let resolve;
    t.provider.pending = new Promise(done => { resolve = done; });
    const connecting = t.controller.connect(t.provider);
    await Promise.resolve();
    await t.controller.connect(t.provider);
    assert.deepEqual(t.provider.calls, ["eth_chainId", "eth_requestAccounts"]);
    if (cancel === "chainChanged" || cancel === "accountsChanged") t.provider.emit(cancel, cancel === "chainChanged" ? "0x1" : [second]);
    else t.controller[cancel]();
    const count = t.states.length;
    resolve([address]); await connecting;
    assert.equal(t.states.length, count); assert.equal(t.last().address, undefined); assert.equal(t.provider.count(), 0);
    assert.equal(t.provider.calls.length, 2);
  }
  {
    const t = setup();
    const original = t.provider.request.bind(t.provider);
    t.provider.request = async args => { const result = await original(args); if (args.method === "eth_requestAccounts") t.provider.emit("accountsChanged", [address]); return result; };
    await t.controller.connect(t.provider);
    assert.equal(t.last().address, address);
    t.controller.dispose();
  }
  for (const eventAccounts of [[second], [], ["invalid"]]) {
    const t = setup();
    const original = t.provider.request.bind(t.provider);
    t.provider.request = async args => { const result = await original(args); if (args.method === "eth_requestAccounts") t.provider.emit("accountsChanged", eventAccounts); return result; };
    await t.controller.connect(t.provider);
    assert.equal(t.last().address, undefined);
    assert.notEqual(t.last().status, "connected");
    assert.equal(t.provider.count(), 0);
  }
  {
    const t = setup();
    const original = t.provider.request.bind(t.provider);
    t.provider.request = async args => { const result = await original(args); if (args.method === "eth_requestAccounts") t.provider.chain = "0x1"; return result; };
    await t.controller.connect(t.provider);
    assert.equal(t.last().status, "error"); assert.equal(t.last().address, undefined); assert.equal(t.provider.count(), 0);
  }
  console.log("J2 wallet OK — provider explicitement simulé, aucun test avec portefeuille réel.");
} finally { await rm(temp, { recursive: true, force: true }); }
