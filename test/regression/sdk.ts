import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import * as path from "path";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_SCRIPT = path.join(__dirname, "sdk.py");

export async function openTrade(
  privateKey: string,
  assetPair: string,
  collateral: string,
  leverage: string
): Promise<any> {
  const { stdout, stderr } = await execAsync(
    `python3 ${PYTHON_SCRIPT} open https://mainnet.base.org ${privateKey} ${assetPair} ${collateral} ${leverage}`
  );
  if (stderr) {
    console.error(`Python stderr: ${stderr}`);
  }
  const lines = stdout.trim().split("\n");
  const jsonLine = lines.find((line) => line.trim().startsWith("{"));
  if (!jsonLine) {
    throw new Error(`No JSON output found. Output: ${stdout}`);
  }
  return JSON.parse(jsonLine.trim());
}

export async function closeTrade(
  privateKey: string,
  tradeIndex: number,
  pairIndex: number
): Promise<any> {
  const { stdout, stderr } = await execAsync(
    `python3 ${PYTHON_SCRIPT} close https://mainnet.base.org ${privateKey} ${tradeIndex} ${pairIndex}`
  );
  if (stderr) {
    console.error(`Python stderr: ${stderr}`);
  }
  const lines = stdout.trim().split("\n");
  const jsonLine = lines.find((line) => line.trim().startsWith("{"));
  if (!jsonLine) {
    throw new Error(`No JSON output found. Output: ${stdout}`);
  }
  return JSON.parse(jsonLine.trim());
}

export async function getTrades(privateKey: string): Promise<any> {
  const { stdout, stderr } = await execAsync(
    `python3 ${PYTHON_SCRIPT} trades https://mainnet.base.org ${privateKey}`
  );
  if (stderr) {
    console.error(`Python stderr: ${stderr}`);
  }
  const lines = stdout.trim().split("\n");
  const jsonLine = lines.find((line) => line.trim().startsWith("{"));
  if (!jsonLine) {
    throw new Error(`No JSON output found. Output: ${stdout}`);
  }
  return JSON.parse(jsonLine.trim());
}
