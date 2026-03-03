import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTokenStats, getBalance, formatTokenAmount, type TokenStats } from "@/utils/stacks";
import { useWallet } from "@/contexts/WalletContext";
import { Loader2, Coins, Hash, Type, Link as LinkIcon, User } from "lucide-react";

export default function Stats() {
  const { isConnected, address } = useWallet();
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTokenStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      getBalance(address).then(setBalance);
    }
  }, [isConnected, address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center">
        <p className="text-destructive">Failed to load stats: {error}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Token Name", value: stats?.name || "—", icon: Type },
    { label: "Symbol", value: stats?.symbol || "—", icon: Hash },
    { label: "Decimals", value: stats?.decimals?.toString() || "—", icon: Coins },
    {
      label: "Total Supply",
      value: stats ? formatTokenAmount(stats.totalSupply, stats.decimals) + " sBC" : "—",
      icon: Coins,
    },
    {
      label: "Token URI",
      value: stats?.tokenUri || "—",
      icon: LinkIcon,
      isLink: !!stats?.tokenUri,
    },
  ];

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-8 gradient-text">Token Stats</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card border border-border card-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              {card.isLink ? (
                <a
                  href={card.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary hover:underline break-all"
                >
                  {card.value}
                </a>
              ) : (
                <p className="text-lg font-semibold break-all">{card.value}</p>
              )}
            </motion.div>
          ))}
        </div>

        {isConnected && address && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-primary/20 glow-orange"
          >
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Your Balance</span>
            </div>
            <p className="text-2xl font-bold">
              {balance !== null
                ? formatTokenAmount(balance, stats?.decimals || 6) + " sBC"
                : "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{address}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
