import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  parseTokenAmount,
  formatMicroStx,
  callReadOnly,
} from "@/utils/stacks";
import { request } from "@stacks/connect";
import { Cl, Pc } from "@stacks/transactions";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";

export function MintForm() {
  const { address } = useWallet();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mintPrice, setMintPrice] = useState<bigint | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

  // Fetch mint price from contract
  useEffect(() => {
    const fetchMintPrice = async () => {
      try {
        // Try to read MINT_PRICE_PER_UNIT from contract
        const res = await callReadOnly("get-mint-price");
        if (res.okay) {
          const priceHex = res.result;
          const price = BigInt(priceHex.replace(/^0x/, ""), 16);
          setMintPrice(price);
        } else {
          // Fallback: If 1 STX mints 1,000,000 units, then price per unit = 1 microSTX
          setMintPrice(1n);
        }
      } catch {
        // Fallback: If 1 STX mints 1,000,000 units, then price per unit = 1 microSTX
        setMintPrice(1n);
      }
    };
    fetchMintPrice();
  }, []);

  // Calculate estimated cost when amount changes
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount)) && mintPrice) {
      // Input amount is in full tokens with decimals (e.g., "0.1" = 0.1 tokens)
      // Convert to microtokens: fullTokens * 1,000,000
      const microtokenAmount = BigInt(parseTokenAmount(amount)); // Uses default 6 decimals
      const expectedFeeMicroStx = microtokenAmount * mintPrice;
      // Show range to account for potential price variations
      const maxFeeMicroStx = expectedFeeMicroStx + (expectedFeeMicroStx / 10n);
      setEstimatedCost(`${formatMicroStx(expectedFeeMicroStx.toString())} - ${formatMicroStx(maxFeeMicroStx.toString())}`);
    } else {
      setEstimatedCost(null);
    }
  }, [amount, mintPrice]);

  const handleMint = async () => {
    if (!amount || !recipient || !address || !mintPrice) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setStatus("loading");
      // Input amount is in full tokens with decimals, convert to microtokens for contract
      const microtokenAmount = BigInt(parseTokenAmount(amount));
      // Calculate exact fee: microtokens * price_per_unit (1 microSTX per unit)
      const expectedFeeMicroStx = microtokenAmount * mintPrice;

      // Create post-condition: user will send UP TO the calculated STX fee (allows for dynamic pricing)
      // Add 10% buffer for potential price variations based on mint amount
      const maxFeeMicroStx = expectedFeeMicroStx + (expectedFeeMicroStx / 10n);
      const stxPostCondition = Pc
        .principal(address)
        .willSendLte(Number(maxFeeMicroStx))
        .ustx();

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "mint",
        functionArgs: [
          Cl.uint(microtokenAmount),
          Cl.principal(recipient),
        ],
        postConditions: [stxPostCondition],
        network: "mainnet",
      });

      setStatus("success");
      setMessage(`Transaction submitted: ${response.txid}`);
    } catch (e: any) {
      if (e?.message?.includes("cancel") || e?.code === 4001) {
        setStatus("idle");
      } else {
        setStatus("error");
        setMessage(e.message || "Mint failed. Are you the contract owner?");
      }
    }
  };

  return (
    <div className="max-w-lg p-6 rounded-xl bg-card border border-border card-shadow">
      <h2 className="text-xl font-semibold mb-1">Mint Tokens</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Mint sBC tokens. Fee: 1 STX per token (varies by amount).
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="mint-amount">Amount (sBC tokens)</Label>
          <Input
            id="mint-amount"
            type="number"
            placeholder="1.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.000001"
          />
        </div>

        <div>
          <Label htmlFor="mint-recipient">Recipient Address</Label>
          <Input
            id="mint-recipient"
            placeholder="SP..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        {/* Cost Estimate */}
        {estimatedCost && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-primary">Estimated Mint Cost</p>
              <p className="text-lg font-bold text-primary mt-1">{estimatedCost}</p>
              <p className="text-xs text-muted-foreground mt-1">Price may vary based on amount</p>
            </div>
          </div>
        )}

        <Button
          variant="glow"
          className="w-full"
          onClick={handleMint}
          disabled={status === "loading" || !mintPrice}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Mint Tokens
        </Button>

        {/* Status Messages */}
        {status === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Mint Failed</p>
              <p className="text-sm opacity-90 mt-1">{message}</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20 text-success">
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Mint Successful!</p>
              <p className="text-sm opacity-90 mt-1 break-all font-mono">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
