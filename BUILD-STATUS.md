# BUILD STATUS — Portaldot NodeWatch (as of 2026-10-25)

## Done

- Project skeleton in `~/workspace/earning/portaldot-nodewatch/`:
  `contracts/NodeWatchRegistry.sol`, `frontend/index.html`, `frontend/abi.json`,
  `scripts/deploy.js`, `scripts/package.json`, `.gitignore`, `README.md`, this file.
- Contract compiles cleanly with solc 0.8.28 (via npx solcjs): bytecode
  11,294 bytes; ABI has 6 functions (`registerNode`, `removeNode`, `getNode`,
  `nodeCount`, `listNodes`, `listNodesByOwner`) and 2 events
  (`NodeRegistered`, `NodeRemoved`).
- Deploy script syntax-checked (`node --check` OK); it enforces chain
  420420777 and a non-zero deployer balance, and reads the key from env only.
- Frontend static checks OK: RPC URL wired, 6-second polling, contract-address
  placeholder present, script tags balanced.

## Verified live (against the real public testnet, 2026-10-25)

Endpoint: `https://test-evm-rpc-v3.portaldot.dev` (EVM RPC, Chain ID 420420777).

- `eth_chainId` → `0x190f1ca9` = **420420777** ✓ (matches the spec).
- `eth_blockNumber` → `0x2d448` → `0x2d449` → `0x2d44a` across consecutive
  calls: **the chain is live and producing blocks**.
- Latest block: 0 transactions, `gasUsed` 0, `gasLimit` 0xffffffffffffffff
  (testnet config quirk), miner `0x578f0a6155551b3b7c7ff255ea7dc2b08968e380`.
- Block time measured from three consecutive blocks: **6 seconds**
  (timestamps `0x6adda368` → `0x6adda36e` → `0x6adda374`).
- `eth_gasPrice` → `0x7ada` = 31,450 wei (tiny, as expected on a testnet).
- `net_peerCount` → `0x1` = 1 peer (thin network — worth showing on the dashboard).
- `eth_syncing` → `false`.
- WebSocket `wss://test-node-v3.portaldot.dev`: connection OPENS, but
  `eth_subscribe` returns error `-32601 "Method not found"` — **no pub/sub**,
  so the dashboard polls over HTTP. This is a real endpoint limitation, not a
  bug in the frontend.

## Assumed / not yet verified

- The dashboard's browser-side RPC reads: the same calls succeed from the VM
  (curl), but a browser fetch from `file://` or `localhost` may hit CORS on
  the RPC host. Not tested in a browser yet — serve via `python3 -m http.server`
  and confirm, or add a tiny proxy if CORS blocks it.
- The contract's write path (`registerNode` via MetaMask) is untested until
  deployment; the ABI matches the compiled contract, so the call shape is right.
- Explorer UX at `https://node-console.portaldot.dev/` (it returns HTTP 200,
  but no tx lookup was possible without a deployed contract/tx yet).

## Environment quirk found (worth knowing for later runs)

- The VM's egress proxy is flaky for this RPC host: the first probes timed
  out at 20–30 s, then the same calls answered in ~0.7–0.9 s. Direct
  connections (no proxy) fail because the host resolves to a proxied address.
  Retry, don't conclude the endpoint is down, if a probe times out once.

## Exact remaining steps (in order)

1. **Test tokens**: obtain Portaldot V3.0 testnet tokens for a deployer wallet
   (faucet / organizer distribution — the exact route is still TBD; do NOT
   buy anything, this is a testnet).
2. **Deploy**: `cd scripts && npm install`, then run `deploy.js` with
   `PRIVATE_KEY` from env only. Record contract address + deploy tx hash.
3. **Wire the frontend**: paste the address into `CONTRACT_ADDRESS` in
   `frontend/index.html`; verify `listNodes()` reads and one `registerNode`
   write end-to-end through the dashboard UI.
4. **CORS check**: open the dashboard in a browser and confirm live stats load.
5. **GitHub**: push to a public repo with ≥ 3 commits dated Oct 14 – Nov 6, 2026.
6. **Demo video** (≤ 3 min) + **pitch deck**.
7. **DoraHacks submission** before Nov 6, 2026, 11:00 +07, with contract
   address + example tx hash + repo + video + deck.

## Constraints honored

No deployment, no GitHub push, no wallets/credentials created, nothing spent,
nobody contacted. All work is local files only.
