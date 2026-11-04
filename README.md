# Portaldot NodeWatch

A web dashboard that monitors Portaldot Network V3.0 testnet health in real time,
plus a small on-chain registry where users can register nodes to watch.

Built for **Portaldot Hacker House 2026** on DoraHacks — Track 3, "Node Operations
& Tooling". Submission deadline: **Nov 6, 2026, 11:00 +07**.

## Problem

Portaldot node operators have no simple public place to see testnet health
(latest block, block time, peers, gas) and no shared registry of nodes worth
watching. NodeWatch puts both in one page: live chain stats plus a community
registry of watched nodes, stored on-chain so anyone can read it without a wallet.

## Why Portaldot

The dashboard reads the public Portaldot V3.0 testnet EVM endpoint directly
(Chain ID 420420777) and the registry contract is designed to deploy on that
same testnet, so the whole demo runs on the chain the hackathon is about.

## Architecture (text diagram)

```
Browser (frontend/index.html, no build step)
  │  fetch (JSON-RPC, polling every ~6s = testnet block time)
  ▼
Portaldot V3.0 testnet EVM RPC  https://test-evm-rpc-v3.portaldot.dev
  │  eth_chainId / eth_blockNumber / eth_getBlockByNumber / eth_gasPrice / net_peerCount
  ▼
Live stats: chain id, latest block, block time, gas price, peers, latest miner

Browser + wallet (MetaMask, Portaldot testnet)
  │  ethers v6 + frontend/abi.json
  ▼
NodeWatchRegistry (Solidity, contracts/NodeWatchRegistry.sol)
  registerNode(name, endpoint) → NodeRegistered event
  removeNode(id)               → NodeRemoved event (owner only)
  listNodes() / getNode(id) / nodeCount() / listNodesByOwner(owner)
```

Notes:

- WebSocket endpoint `wss://test-node-v3.portaldot.dev` accepts connections but
  answers `eth_subscribe` with "Method not found", so the dashboard polls over
  HTTP instead of subscribing. See BUILD-STATUS.md.
- Reads need no wallet. Writes (register/remove) need a wallet connected to the
  Portaldot testnet.

## Run locally

```bash
# Static dashboard (reads work immediately, no build):
python3 -m http.server 8000 --directory frontend
# open http://localhost:8000 — stats load from the public testnet RPC.

# Compile the contract (solc 0.8.28 via npx):
npx -y -p solc@0.8.28 solcjs --bin --abi contracts/NodeWatchRegistry.sol -o build/
```

## Testnet deployment — TODO (blocked on test tokens)

1. Get Portaldot testnet tokens to a deployer wallet (see BUILD-STATUS.md).
2. `cd scripts && npm install`
3. `RPC_URL=https://test-evm-rpc-v3.portaldot.dev PRIVATE_KEY=0x... node deploy.js`
   (the script refuses to run on any chain other than 420420777, and refuses
   with a zero balance — the key is read from the environment only, never saved).
4. Paste the deployed address into `frontend/index.html` as `CONTRACT_ADDRESS`.
5. Do one end-to-end demo transaction: register a node through the dashboard UI,
   record the tx hash, and check it on https://node-console.portaldot.dev/.

## Submission checklist (DoraHacks)

- [x] Project skeleton, compiling contract, working read-path dashboard
- [ ] Testnet deployment: contract address + demo tx hash
- [ ] Public GitHub repo (min 3 commits during Oct 14 – Nov 6, 2026)
- [ ] Demo video (≤ 3 min)
- [ ] Pitch deck
- [ ] DoraHacks BUIDL submission before Nov 6, 2026, 11:00 +07
