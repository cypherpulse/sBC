import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getTokenStats,
  getBalance,
  formatTokenAmount,
  isDeployer,
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  EXPLORER_URL,
  type TokenStats,
} from "@/utils/stacks";
import { useWallet } from "@/contexts/WalletContext";
import { DeployerDashboard } from "@/components/DeployerDashboard";
import {
  Loader2,
  Coins,
  Hash,
  Type,
  Link as LinkIcon,
  User,
  ExternalLink,
  FileCode,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Stats() {
  const { isConnected, address, connect } = useWallet();
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = isDeployer(address);

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
  ];

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold gradient-text">Token Stats</h1>
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <FileCode className="h-4 w-4" />
            View Contract on Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Contract Info Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-8 rounded-xl bg-secondary/50 border border-border"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Contract: </span>
              <code className="text-primary font-mono">{CONTRACT_NAME}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Address: </span>
              <code className="text-xs font-mono">{CONTRACT_ADDRESS}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Standard: </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                SIP-010
              </span>
            </div>
          </div>
        </motion.div>

        {/* Token Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card border border-border card-shadow hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-xl font-semibold break-all">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Token URI Card */}
        {stats?.tokenUri && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-xl bg-card border border-border card-shadow mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Token URI (Metadata)</span>
            </div>
            <a
              href={stats.tokenUri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all inline-flex items-center gap-1"
            >
              {stats.tokenUri}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </motion.div>
        )}

        {/* User Balance Section */}
        {isConnected && address ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-primary/20 glow-orange mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Your Balance</span>
              {isOwner && (
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                  Contract Owner
                </span>
              )}
            </div>
            <p className="text-3xl font-bold">
              {balance !== null
                ? formatTokenAmount(balance, stats?.decimals || 6) + " sBC"
                : "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-2">{address}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-border text-center mb-8"
          >
            <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your balance
            </p>
            <Button variant="glow" onClick={connect}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </motion.div>
        )}

        {/* Deployer Dashboard - Only shown for contract owner */}
        {isOwner && <DeployerDashboard decimals={stats?.decimals || 6} />}
      </motion.div>
    </div>
  );
}
