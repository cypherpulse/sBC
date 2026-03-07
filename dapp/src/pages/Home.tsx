import { motion, useSpring, useTransform } from "framer-motion";
import { SbcLogo } from "@/components/Logo";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, BarChart3, Send, Shield, Coins, Users, Activity, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTokenStats, getContractMetrics, formatTokenAmount, type TokenStats, type ContractMetrics } from "@/utils/stacks";
import { LiveTransactionTicker } from "@/components/LiveTransactionTicker";

// Number Counter Component
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function Home() {
  const { isConnected, connect } = useWallet();
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, contractMetrics] = await Promise.all([
          getTokenStats(),
          getContractMetrics(),
        ]);
        setTokenStats(stats);
        setMetrics(contractMetrics);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    { icon: Send, title: "Mint & Transfer", desc: "Mint new tokens or send to others", link: "/interact" },
    { icon: BarChart3, title: "Live Stats", desc: "View total supply, balances, and metadata", link: "/stats" },
    { icon: Shield, title: "SIP-010", desc: "Fully compliant fungible token standard", link: "/stats" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(24_100%_50%/0.08),transparent_70%)]" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Branding & Actions */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-2xl p-8 lg:p-12 text-center lg:text-left border border-white/10 shadow-2xl group min-h-[500px] flex flex-col justify-center"
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://res.cloudinary.com/dg5rr4ntw/image/upload/v1772739178/photo_2026-03-05_22-32-31_urdzf5.jpg" 
                  alt="sBC Background" 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col items-center lg:items-start gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="bg-background/50 p-4 rounded-full border border-white/5 shadow-lg backdrop-blur-md"
                >
                  <SbcLogo size={80} />
                </motion.div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    <span className="text-orange-500">sBC</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                    A fungible token on the Stacks blockchain. Transfer, mint, and manage your sBC tokens with this decentralized application.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 w-full">
                  {!isConnected ? (
                    <Button variant="glow" size="lg" onClick={connect} className="w-full sm:w-auto">
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <Button className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 w-full sm:w-auto" size="lg" asChild>
                      <Link to="/interact">
                        Mint Tokens
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto bg-background/50 hover:bg-background/80">
                    <Link to="/stats">View Stats</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Live Stats Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Holders Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-xl bg-card border border-border card-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Holders</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {metrics ? (
                      <AnimatedNumber value={metrics.uniqueHolders} />
                    ) : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Unique addresses</div>
                </motion.div>

                {/* Supply Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-xl bg-card border border-border card-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Circulating Supply</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground truncate" title={tokenStats ? formatTokenAmount(tokenStats.totalSupply, tokenStats.decimals) : ""}>
                    {tokenStats ? formatTokenAmount(tokenStats.totalSupply, tokenStats.decimals) : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">sBC Minted</div>
                </motion.div>

                {/* Max Supply Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-xl bg-card border border-border card-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Database className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Max Supply</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    210B
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Total Cap</div>
                </motion.div>

                {/* Total Transactions Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-xl bg-card border border-border card-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Transactions</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {metrics ? (
                      <AnimatedNumber value={metrics.totalTransactions} />
                    ) : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Total interactions</div>
                </motion.div>

              </div>

              {/* Live Ticker Card */}
              <div className="bg-card border border-border rounded-xl p-1 shadow-sm">
                <LiveTransactionTicker />
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border bg-secondary/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why sBC?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on Stacks, secured by Bitcoin. Experience the future of decentralized finance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={f.link}
                  className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all card-shadow group h-full"
                >
                  <f.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
