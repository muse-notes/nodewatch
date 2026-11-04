// Deploy script for NodeWatchRegistry on Portaldot Network V3.0 testnet.
// READY BUT NOT RUN: it needs testnet tokens and a deployer key.
// Usage:
//   RPC_URL=https://test-evm-rpc-v3.portaldot.dev \
//   PRIVATE_KEY=0x... node scripts/deploy.js
// The key is read ONLY from the environment and is never written anywhere.
// Requires: npm install ethers (see scripts/package.json)
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const EXPECTED_CHAIN_ID = 420420777n;

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://test-evm-rpc-v3.portaldot.dev";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY env var is required (deployer key with testnet funds).");
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  if (network.chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(
      `Wrong chain: got ${network.chainId}, expected ${EXPECTED_CHAIN_ID}. Aborting.`
    );
  }
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer:", wallet.address);
  console.log("Balance (wei):", balance.toString());
  if (balance === 0n) {
    throw new Error("Deployer has no testnet funds. Get test tokens first, then rerun.");
  }
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "build", "contracts_NodeWatchRegistry_sol_NodeWatchRegistry.abi"),
      "utf8"
    )
  );
  const bin = fs
    .readFileSync(
      path.join(__dirname, "..", "build", "contracts_NodeWatchRegistry_sol_NodeWatchRegistry.bin"),
      "utf8"
    )
    .trim();
  const factory = new ethers.ContractFactory(artifact, bin, wallet);
  const contract = await factory.deploy();
  console.log("Deploy tx:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("NodeWatchRegistry deployed at:", address);
  console.log("Explorer:", `https://node-console.portaldot.dev/`);
  console.log("Next: paste this address into frontend/index.html as CONTRACT_ADDRESS.");
}

main().catch((e) => {
  console.error("Deploy failed:", e.message);
  process.exit(1);
});
