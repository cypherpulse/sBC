import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getRecentTransactions,
  shortenAddress,
  EXPLORER_URL,
  type Transaction,
} from "@/utils/stacks";
import { Loader2, ExternalLink } from "lucide-react";

export default function Transactions() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentTransactions()
      .then(setTxs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-8 gradient-text">Transactions</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : txs.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border card-shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Tx ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Function</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">From</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => (
                  <motion.tr
                    key={tx.tx_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 font-mono">
                      <a
                        href={`${EXPLORER_URL}/txid/${tx.tx_id}?chain=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {shortenAddress(tx.tx_id)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {tx.contract_call?.function_name || "—"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {shortenAddress(tx.sender_address)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          tx.tx_status === "success"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.tx_status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {tx.burn_block_time_iso
                        ? new Date(tx.burn_block_time_iso).toLocaleString()
                        : "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
