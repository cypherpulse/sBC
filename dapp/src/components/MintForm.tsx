import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  parseTokenAmount,
} from "@/utils/stacks";
import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function MintForm() {
  const { address } = useWallet();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleMint = async () => {
    if (!amount || !recipient) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setStatus("loading");
      const parsedAmount = parseTokenAmount(amount);

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "mint",
        functionArgs: [
          Cl.uint(BigInt(parsedAmount)),
          Cl.principal(recipient),
        ],
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
        Only the contract owner can mint new sBC tokens.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="mint-amount">Amount (sBC)</Label>
          <Input
            id="mint-amount"
            type="number"
            placeholder="0.00"
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

        <Button
          variant="glow"
          className="w-full"
          onClick={handleMint}
          disabled={status === "loading"}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Mint Tokens
        </Button>

        {status === "error" && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {message}
          </div>
        )}
        {status === "success" && (
          <div className="flex items-start gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
