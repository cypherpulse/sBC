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

export function TransferForm() {
  const { address } = useWallet();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleTransfer = async () => {
    if (!amount || !recipient || !address) {
      setStatus("error");
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setStatus("loading");
      const parsedAmount = parseTokenAmount(amount);
      const memoArg = memo
        ? Cl.some(Cl.buffer(new TextEncoder().encode(memo.slice(0, 34))))
        : Cl.none();

      const response = await request("stx_callContract", {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: "transfer",
        functionArgs: [
          Cl.uint(BigInt(parsedAmount)),
          Cl.principal(address),
          Cl.principal(recipient),
          memoArg,
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
        setMessage(e.message || "Transfer failed.");
      }
    }
  };

  return (
    <div className="max-w-lg p-6 rounded-xl bg-card border border-border card-shadow">
      <h2 className="text-xl font-semibold mb-1">Transfer sBC</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Send sBC tokens to another Stacks address.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="transfer-amount">Amount (sBC)</Label>
          <Input
            id="transfer-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.000001"
          />
        </div>

        <div>
          <Label htmlFor="transfer-sender">Sender</Label>
          <Input id="transfer-sender" value={address || ""} disabled className="font-mono text-xs" />
        </div>

        <div>
          <Label htmlFor="transfer-recipient">Recipient Address</Label>
          <Input
            id="transfer-recipient"
            placeholder="SP..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="transfer-memo">Memo (optional, max 34 chars)</Label>
          <Input
            id="transfer-memo"
            placeholder="Optional memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 34))}
            maxLength={34}
          />
        </div>

        <Button
          variant="glow"
          className="w-full"
          onClick={handleTransfer}
          disabled={status === "loading"}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Tokens
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
