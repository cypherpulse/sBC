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

// Contract configuration from environment variables
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME;
export const NETWORK_URL = import.meta.env.VITE_NETWORK_URL;
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL;
const HIRO_API_KEY = import.meta.env.VITE_HIRO_API_KEY;

// Helper to get headers with API key
function getHeaders(contentType = "application/json") {
  const headers: HeadersInit = { "Content-Type": contentType };
  if (HIRO_API_KEY) {
    headers["x-api-key"] = HIRO_API_KEY;
  }
  return headers;
}

// Deployer address for admin features
export const DEPLOYER_ADDRESS = CONTRACT_ADDRESS;

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  properties?: {
    category: string;
    creators: Array<{ address: string; share: number }>;
  };
}

export interface TokenStats {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  tokenUri: string | null;
  metadata?: TokenMetadata | null;
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
  
  // Recursive function to unwrap Clarity values
  const unwrap = (val: any): any => {
    // Handle Response (ok/err) and Optional (some)
    if (val?.type === 'success' || val?.type === 'ok' || val?.type === 'some') {
      return unwrap(val.value);
    }
    // Handle common value wrappers
    if (val?.value !== undefined && typeof val.value !== 'object') {
      return val.value;
    }
    // Handle nested value objects (like in some versions of cvToJSON)
    if (val?.value && typeof val.value === 'object') {
      return unwrap(val.value);
    }
    return val;
  };

  return unwrap(cv);
}

export async function callReadOnly(functionName: string, args: ClarityValue[] = []) {
  const serializedArgs = args.map((a) => {
    const serialized = serializeCV(a);
    if (typeof serialized === "string") return serialized;
    return "0x" + hexFromBytes(serialized as unknown as Uint8Array);
  });

  const url = `${NETWORK_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      sender: CONTRACT_ADDRESS,
      arguments: serializedArgs,
    }),
  });

  const data = await response.json();

  if (!data.okay) {
    // Only log if it's not an "UndefinedFunction" error (common for feature detection)
    if (!data.cause?.includes("UndefinedFunction")) {
      console.warn(`Read-only call failed for ${functionName}:`, data.cause);
    }
    throw new Error(data.cause || `Read-only call failed for ${functionName}`);
  }
  return data;
}

export async function getTokenStats(): Promise<TokenStats> {
  try {
    const [nameRes, symbolRes, decimalsRes, supplyRes, uriRes] = await Promise.all([
      callReadOnly("get-name"),
      callReadOnly("get-symbol"),
      callReadOnly("get-decimals"),
      callReadOnly("get-total-supply"),
      callReadOnly("get-token-uri"),
    ]);

    const stats: TokenStats = {
      name: parseCvHex(nameRes.result) || "bradley coin",
      symbol: parseCvHex(symbolRes.result) || "sBC",
      decimals: parseInt(parseCvHex(decimalsRes.result) || "6"),
      totalSupply: parseCvHex(supplyRes.result) || "0",
      tokenUri: parseCvHex(uriRes.result) || null,
      metadata: null,
    };

    if (stats.tokenUri) {
      try {
        const metadataRes = await fetch(stats.tokenUri); // Metadata usually public/IPFS, no API key needed unless hosted on Hiro
        if (metadataRes.ok) {
          stats.metadata = await metadataRes.json();
        }
      } catch (e) {
        console.warn("Failed to fetch token metadata:", e);
      }
    }

    return stats;
  } catch (error) {
    console.error("Failed to fetch token stats:", error);
    throw error;
  }
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
      `${NETWORK_URL}/extended/v1/tx/?contract_id=${CONTRACT_ADDRESS}.${CONTRACT_NAME}&limit=20`,
      { headers: getHeaders() }
    );

    const data = await res.json();

    const filteredTxs = (data.results || []).filter((tx: any) => tx.tx_type === "contract_call");

    return filteredTxs;
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    return [];
  }
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isDeployer(address: string | null): boolean {
  return address === DEPLOYER_ADDRESS;
}

export interface ContractMetrics {
  totalTransactions: number;
  mintCount: number;
  transferCount: number;
  uniqueHolders: number;
  averageFee: string;
  totalFees: string;
  totalMintRevenue: string;
}

export interface TokenHolder {
  address: string;
  balance: string;
}

export async function getContractMetrics(): Promise<ContractMetrics> {
  try {
    // Get all contract transactions
    const res = await fetch(
      `${NETWORK_URL}/extended/v1/tx/?contract_id=${CONTRACT_ADDRESS}.${CONTRACT_NAME}&limit=50`,
      { headers: getHeaders() }
    );
    const data = await res.json();
    const txs = (data.results || []).filter((tx: any) => tx.tx_type === "contract_call" && tx.tx_status === "success");
    
    let mintCount = 0;
    let transferCount = 0;
    let totalFees = BigInt(0); // Network fees
    let totalMintRevenue = BigInt(0); // STX collected from minting
    const holders = new Set<string>();
    
    for (const tx of txs) {
      const fnName = tx.contract_call?.function_name;
      const fee = BigInt(tx.fee_rate || 0);
      totalFees += fee;
      
      if (fnName === "mint") {
        mintCount++;
        // Extract recipient from function args
        const recipientArg = tx.contract_call?.function_args?.find((a: any) => a.name === "recipient");
        const amountArg = tx.contract_call?.function_args?.find((a: any) => a.name === "amount");
        
        if (recipientArg?.repr) {
          const addr = recipientArg.repr.replace(/^'/, "");
          holders.add(addr);
        }

        // Calculate revenue: amount (units) * 1 microSTX
        if (amountArg?.repr) {
          const amount = BigInt(amountArg.repr.replace(/^u/, ""));
          // Revenue = amount * 1 (assuming price is 1 microSTX per unit as per contract)
          totalMintRevenue += amount;
        }

      } else if (fnName === "transfer") {
        transferCount++;
        // Extract sender and recipient
        const senderArg = tx.contract_call?.function_args?.find((a: any) => a.name === "sender");
        const recipientArg = tx.contract_call?.function_args?.find((a: any) => a.name === "recipient");
        if (senderArg?.repr) holders.add(senderArg.repr.replace(/^'/, ""));
        if (recipientArg?.repr) holders.add(recipientArg.repr.replace(/^'/, ""));
      }
    }
    
    const avgFee = txs.length > 0 ? totalFees / BigInt(txs.length) : BigInt(0);
    
    return {
      totalTransactions: txs.length,
      mintCount,
      transferCount,
      uniqueHolders: holders.size,
      averageFee: formatMicroStx(avgFee.toString()),
      totalFees: formatMicroStx(totalFees.toString()),
      totalMintRevenue: formatMicroStx(totalMintRevenue.toString()),
    };
  } catch (e) {
    console.error("Failed to get contract metrics:", e);
    return {
      totalTransactions: 0,
      mintCount: 0,
      transferCount: 0,
      uniqueHolders: 0,
      averageFee: "0",
      totalFees: "0",
      totalMintRevenue: "0 STX",
    };
  }
}

export function formatMicroStx(microStx: string): string {
  const num = BigInt(microStx);
  const stx = Number(num) / 1_000_000;
  return stx.toFixed(6) + " STX";
}

export async function getTokenHolders(): Promise<TokenHolder[]> {
  try {
    // Try to get FT holders from the official API
    const res = await fetch(
      `${NETWORK_URL}/extended/v1/tokens/ft/${CONTRACT_ADDRESS}.${CONTRACT_NAME}::bradley-token/holders?limit=50`,
      { headers: getHeaders() }
    );
    
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map((h: any) => ({
        address: h.address,
        balance: h.balance || "0",
      }));
    }

    // Fallback: Fetch transactions to estimate holders (if official endpoint fails)
    const txRes = await fetch(
      `${NETWORK_URL}/extended/v1/tx/?contract_id=${CONTRACT_ADDRESS}.${CONTRACT_NAME}&limit=100`,
      { headers: getHeaders() }
    );
    const txData = await txRes.json();
    const txs = (txData.results || []).filter((tx: any) => tx.tx_type === "contract_call");
    
    const holders = new Map<string, bigint>();
    
    for (const tx of txs) {
      const fnName = tx.contract_call?.function_name;
      
      if (fnName === "mint") {
        const recipientArg = tx.contract_call?.function_args?.find((a: any) => a.name === "recipient");
        const amountArg = tx.contract_call?.function_args?.find((a: any) => a.name === "amount");
        if (recipientArg?.repr && amountArg?.repr) {
          const addr = recipientArg.repr.replace(/^'/, "");
          const amount = BigInt(amountArg.repr.replace(/^u/, ""));
          holders.set(addr, (holders.get(addr) || BigInt(0)) + amount);
        }
      } else if (fnName === "transfer") {
        const senderArg = tx.contract_call?.function_args?.find((a: any) => a.name === "sender");
        const recipientArg = tx.contract_call?.function_args?.find((a: any) => a.name === "recipient");
        const amountArg = tx.contract_call?.function_args?.find((a: any) => a.name === "amount");
        if (senderArg?.repr && recipientArg?.repr && amountArg?.repr) {
          const sender = senderArg.repr.replace(/^'/, "");
          const recipient = recipientArg.repr.replace(/^'/, "");
          const amount = BigInt(amountArg.repr.replace(/^u/, ""));
          holders.set(sender, (holders.get(sender) || BigInt(0)) - amount);
          holders.set(recipient, (holders.get(recipient) || BigInt(0)) + amount);
        }
      }
    }
    
    // Filter out zero balances and convert to array
    const result: TokenHolder[] = [];
    for (const [address, balance] of holders) {
      if (balance > 0) {
        result.push({ address, balance: balance.toString() });
      }
    }
    
    // Sort by balance descending
    result.sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)));
    
    return result;
  } catch (e) {
    console.error("Failed to get token holders:", e);
    return [];
  }
}

export { uintCV, principalCV, bufferCV, someCV, noneCV, PostConditionMode, FungibleConditionCode };
