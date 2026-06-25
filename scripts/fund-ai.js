const { createZGComputeNetworkBroker } = require("@0gfoundation/0g-compute-ts-sdk");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
const envFile = fs.readFileSync(envPath, "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const [key, ...values] = line.split("=");
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join("=").trim().replace(/"/g, "");
  }
});

async function main() {
  const privateKey = envVars.PRIVATE_KEY;
  const providerAddress = envVars.NEXT_PUBLIC_COMPUTE_PROVIDER_ADDRESS;

  if (!privateKey || !providerAddress) {
    console.error("Missing PRIVATE_KEY or NEXT_PUBLIC_COMPUTE_PROVIDER_ADDRESS in .env.local");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Wallet address:", wallet.address);

  const broker = await createZGComputeNetworkBroker(wallet);

  console.log(`Checking ledger account for ${wallet.address}...`);
  try {
    const transferAmount = ethers.parseEther("1.0"); // Ledger SDK expects `bigint` for transferFund (representing wei)
    console.log(`Transferring 1.0 A0GI from Ledger to Inference sub-account for provider ${providerAddress}...`);
    await broker.ledger.transferFund(providerAddress, "inference", transferAmount);
    console.log("Successfully transferred funds to Inference Provider sub-account! You can now use the AI Chat.");
  } catch (error) {
    console.error("Error setting up accounts:", error.reason || error.message || error);
  }
}

main().catch(console.error);
