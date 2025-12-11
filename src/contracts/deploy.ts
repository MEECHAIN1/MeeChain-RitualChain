import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const Stake = await ethers.getContractFactory("MeeStake");
  const stake = await Stake.deploy();
  await stake.waitForDeployment();

  const address = await stake.getAddress();
  console.log("MeeStake deployed at:", address);

  // เขียนลง .env.local (Vite จะโหลดไฟล์นี้ใน runtime)
  const envLocal = `VITE_CONTRACT_ADDRESS=${address}
VITE_CHAIN_ID=1337
VITE_RPC_URL=${process.env.ETH_RPC_URL ?? "http://localhost:8545"}
`;
  fs.writeFileSync(path.resolve(process.cwd(), ".env.local"), envLocal, { encoding: "utf8" });
  console.log(".env.local written");

  // สร้างโฟลเดอร์ artifacts ถ้ายังไม่มี และเขียน artifact สำหรับ UI อ่าน
  const artifactsDir = path.resolve(process.cwd(), "artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const deployArtifactPath = path.join(artifactsDir, "deploy.json");
  fs.writeFileSync(deployArtifactPath, JSON.stringify({ address }, null, 2), { encoding: "utf8" });
  console.log(`Wrote deploy artifact -> ${deployArtifactPath}`);

  console.log("Deployment complete. .env.local and artifacts/deploy.json created.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
