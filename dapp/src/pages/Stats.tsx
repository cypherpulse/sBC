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
import { useToast } from "@/hooks/use-toast";
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
  Info,
  Tag,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Stats() {
  const { isConnected, address, connect } = useWallet();
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const isOwner = isDeployer(address);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      label: "Current Supply",
      value: stats ? formatTokenAmount(stats.totalSupply, stats.decimals) + " sBC" : "—",
      icon: Coins,
    },
    {
      label: "Max Supply",
      value: "210,000,000,000 sBC",
      icon: Coins,
    },
  ];

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Token Stats</h1>
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
          className="p-4 mb-8 rounded-xl bg-secondary/50 border border-border overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-x-8 text-sm">
            <div className="flex flex-col sm:block">
              <span className="text-muted-foreground mr-2">Contract:</span>
              <code className="text-primary font-mono bg-background/50 px-2 py-1 rounded">{CONTRACT_NAME}</code>
            </div>
            <div className="flex flex-col sm:block w-full sm:w-auto overflow-hidden">
              <span className="text-muted-foreground mr-2">Address:</span>
              <code className="text-xs font-mono bg-background/50 px-2 py-1 rounded block sm:inline truncate">
                {CONTRACT_ADDRESS}
              </code>
            </div>
            <div className="flex flex-col sm:block">
              <span className="text-muted-foreground mr-2">Standard:</span>
              <span className="inline-flex px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium w-fit">
                SIP-010
              </span>
            </div>
          </div>
        </motion.div>

        {/* Token Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

        {/* Token Metadata Card */}
        {stats?.metadata && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card border border-border card-shadow mb-8 overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {stats.metadata.image && (
                <div className="w-full max-w-sm mx-auto lg:w-1/3 flex-shrink-0">
                  <div className="aspect-square relative rounded-xl overflow-hidden bg-secondary/30 border border-border shadow-sm">
                    <img
                      src={stats.metadata.image}
                      alt={stats.metadata.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {stats.metadata.name}
                    <span className="text-sm font-normal px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {stats.symbol}
                    </span>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {stats.metadata.description}
                  </p>
                </div>

                {stats.metadata.attributes && stats.metadata.attributes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      Attributes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stats.metadata.attributes.map((attr, i) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <span className="text-xs text-muted-foreground block mb-1">
                            {attr.trait_type}
                          </span>
                          <span className="font-medium">
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.tokenUri && (
                  <div className="pt-4 border-t border-border">
                    <a
                      href={stats.tokenUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="h-3 w-3" />
                      View Raw Metadata
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* User Balance Section */}
        {isConnected && address ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-primary/20 glow-orange mb-8 overflow-hidden"
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
            <p className="text-3xl font-bold truncate">
              {balance !== null
                ? formatTokenAmount(balance, stats?.decimals || 6) + " sBC"
                : "Loading..."}
            </p>
            <div className="flex items-center gap-2 mt-2 max-w-full">
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[calc(100%-2rem)]">
                {address}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={copyAddress}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
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
