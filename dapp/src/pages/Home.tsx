import { motion } from "framer-motion";
import { SbcLogo } from "@/components/Logo";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, BarChart3, Send, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { isConnected, connect } = useWallet();

  const features = [
    { icon: Send, title: "Transfer", desc: "Send sBC tokens to any Stacks address", link: "/interact" },
    { icon: BarChart3, title: "Live Stats", desc: "View total supply, balances, and metadata", link: "/stats" },
    { icon: Shield, title: "SIP-010", desc: "Fully compliant fungible token standard", link: "/stats" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(24_100%_50%/0.08),transparent_70%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SbcLogo size={100} />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="gradient-text">Bradley Coin</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              A fungible token on the Stacks blockchain. Transfer, mint, and manage your sBC tokens with this decentralized application.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {!isConnected ? (
                <Button variant="glow" size="lg" onClick={connect}>
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </Button>
              ) : (
                <Button variant="glow" size="lg" asChild>
                  <Link to="/interact">
                    Start Interacting
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link to="/stats">View Stats</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link
                  to={f.link}
                  className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all card-shadow group"
                >
                  <f.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
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
