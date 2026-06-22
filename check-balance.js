const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, ".env.local");
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
  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet address:", wallet.address);
  console.log("Balance (wei):", balance.toString());
  console.log("Balance (eth):", ethers.formatEther(balance));
}

main().catch(console.error);
