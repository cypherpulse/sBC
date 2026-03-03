import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  callReadOnly,
  principalCV,
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  formatTokenAmount,
} from "@/utils/stacks";
import { Loader2, AlertCircle, CheckCircle2, Terminal } from "lucide-react";

const readOnlyFunctions = [
  { name: "get-name", args: [], label: "Get Name" },
  { name: "get-symbol", args: [], label: "Get Symbol" },
  { name: "get-decimals", args: [], label: "Get Decimals" },
  { name: "get-total-supply", args: [], label: "Get Total Supply" },
  { name: "get-token-uri", args: [], label: "Get Token URI" },
  {
    name: "get-balance",
    args: [{ name: "who", type: "principal" }],
    label: "Get Balance",
  },
];

export function AdvancedInteract() {
  const [selectedFn, setSelectedFn] = useState(readOnlyFunctions[0].name);
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const currentFn = readOnlyFunctions.find((f) => f.name === selectedFn)!;

  const handleCall = async () => {
    try {
      setStatus("loading");
      setResult(null);

      const args = currentFn.args.map((arg) => {
        const val = argValues[arg.name] || "";
        if (arg.type === "principal") return principalCV(val);
        throw new Error(`Unsupported arg type: ${arg.type}`);
      });

      const res = await callReadOnly(currentFn.name, args);
      setResult(JSON.stringify(res, null, 2));
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message);
    }
  };

  return (
    <div className="max-w-2xl p-6 rounded-xl bg-card border border-border card-shadow">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Advanced — Read-Only Functions</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Select Function</Label>
          <Select value={selectedFn} onValueChange={(v) => { setSelectedFn(v); setResult(null); setStatus("idle"); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {readOnlyFunctions.map((fn) => (
                <SelectItem key={fn.name} value={fn.name}>
                  {fn.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentFn.args.map((arg) => (
          <div key={arg.name}>
            <Label>{arg.name} ({arg.type})</Label>
            <Input
              placeholder={`Enter ${arg.type}`}
              value={argValues[arg.name] || ""}
              onChange={(e) =>
                setArgValues((prev) => ({ ...prev, [arg.name]: e.target.value }))
              }
            />
          </div>
        ))}

        <Button variant="glow" className="w-full" onClick={handleCall} disabled={status === "loading"}>
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Call Function
        </Button>

        {status === "error" && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <Label className="mb-2 block">Result</Label>
            <pre className="p-4 rounded-lg bg-secondary text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
