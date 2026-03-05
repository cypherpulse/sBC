import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRecentTransactions, shortenAddress, EXPLORER_URL, type Transaction } from "@/utils/stacks";
import { ArrowRight, Clock, ExternalLink, Activity } from "lucide-react";

export function LiveTransactionTicker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleTx, setVisibleTx] = useState<Transaction | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const loadTx = async () => {
      const txs = await getRecentTransactions();
      if (txs.length > 0) {
        setTransactions(txs);
        setVisibleTx(txs[0]);
      }
    };
    
    loadTx();
    // Refresh every 30 seconds
    const refreshInterval = setInterval(loadTx, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (transactions.length === 0) return;

    // Rotate transactions every 4 seconds
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % transactions.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      setVisibleTx(transactions[index]);
    }
  }, [index, transactions]);

  if (!visibleTx) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-12 mb-8">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Activity</span>
      </div>
      
      <div className="relative h-20 overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={visibleTx.tx_id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${visibleTx.tx_status === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {visibleTx.contract_call?.function_name || "Transaction"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {shortenAddress(visibleTx.sender_address)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  {new Date(visibleTx.burn_block_time_iso).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <a 
              href={`${EXPLORER_URL}/txid/${visibleTx.tx_id}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
