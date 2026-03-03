import {
  cvToJSON,
  uintCV,
  principalCV,
  bufferCV,
  someCV,
  noneCV,
  PostConditionMode,
  FungibleConditionCode,
  deserializeCV,
  serializeCV,
  type ClarityValue,
} from "@stacks/transactions";

export const CONTRACT_ADDRESS = "SPGDS0Y17973EN5TCHNHGJJ9B31XWQ5YX8A36C9B";
export const CONTRACT_NAME = "bradley-coin";
export const NETWORK_URL = "https://stacks-node-api.mainnet.stacks.co";
export const EXPLORER_URL = "https://explorer.hiro.so";

export interface TokenStats {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  tokenUri: string | null;
}

function hexFromBytes(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function bytesFromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return arr;
}

function parseCvHex(hex: string): any {
  const bytes = bytesFromHex(hex);
  const cv = cvToJSON(deserializeCV(bytes));
  return cv.value?.value ?? cv.value;
}

export async function callReadOnly(functionName: string, args: ClarityValue[] = []) {
  const serializedArgs = args.map((a) => {
    const serialized = serializeCV(a);
    if (typeof serialized === "string") return serialized;
    return "0x" + hexFromBytes(serialized as unknown as Uint8Array);
  });
  const response = await fetch(`${NETWORK_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: CONTRACT_ADDRESS,
      arguments: serializedArgs,
    }),
  });
  const data = await response.json();
  if (!data.okay) throw new Error(data.cause || "Read-only call failed");
  return data;
}

export async function getTokenStats(): Promise<TokenStats> {
  const [nameRes, symbolRes, decimalsRes, supplyRes, uriRes] = await Promise.all([
    callReadOnly("get-name"),
    callReadOnly("get-symbol"),
    callReadOnly("get-decimals"),
    callReadOnly("get-total-supply"),
    callReadOnly("get-token-uri"),
  ]);

  return {
    name: parseCvHex(nameRes.result) || "bradley coin",
    symbol: parseCvHex(symbolRes.result) || "sBC",
    decimals: parseInt(parseCvHex(decimalsRes.result) || "6"),
    totalSupply: parseCvHex(supplyRes.result) || "0",
    tokenUri: parseCvHex(uriRes.result) || null,
  };
}

export async function getBalance(address: string): Promise<string> {
  try {
    const res = await callReadOnly("get-balance", [principalCV(address)]);
    return parseCvHex(res.result) || "0";
  } catch {
    return "0";
  }
}

export function formatTokenAmount(amount: string, decimals: number = 6): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;
  const remainderStr = remainder.toString().padStart(decimals, "0").replace(/0+$/, "");
  return remainderStr ? `${whole}.${remainderStr}` : whole.toString();
}

export function parseTokenAmount(amount: string, decimals: number = 6): string {
  const parts = amount.split(".");
  const whole = parts[0] || "0";
  const frac = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);
  return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(frac)).toString();
}

export interface Transaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
  burn_block_time_iso: string;
  sender_address: string;
  contract_call?: {
    function_name: string;
    function_args?: Array<{ repr: string; name: string }>;
  };
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(
      `${NETWORK_URL}/extended/v1/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/transactions?limit=20`
    );
    const data = await res.json();
    return (data.results || []).filter((tx: any) => tx.tx_type === "contract_call");
  } catch {
    return [];
  }
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export { uintCV, principalCV, bufferCV, someCV, noneCV, PostConditionMode, FungibleConditionCode };
