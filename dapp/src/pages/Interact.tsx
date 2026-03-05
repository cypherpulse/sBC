import { useState } from "react";
import { motion } from "framer-motion";
import { MintForm } from "@/components/MintForm";
import { TransferForm } from "@/components/TransferForm";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet, Send, Coins, ArrowRightLeft } from "lucide-react";
import { SbcLogo } from "@/components/Logo";

export default function Interact() {
  const { isConnected, connect } = useWallet();

  if (!isConnected) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-md w-full p-8 rounded-2xl bg-card border border-border card-shadow relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 border border-border">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Connect your Stacks wallet to mint new sBC tokens or transfer existing assets securely.
            </p>
            <Button variant="glow" size="lg" onClick={connect} className="w-full">
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6 relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <SbcLogo size={80} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-500">Token Management</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Manage your Bradley Coin ecosystem. Mint new tokens to grow your balance or transfer value instantly to anyone on Stacks.
          </p>
        </div>

        {/* Dual Card Layout */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Mint Section - Left */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-6 left-6 z-10 bg-card border border-border p-2 rounded-xl shadow-lg flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold pr-2">Mint Tokens</span>
            </div>
            <div className="h-full">
              <MintForm />
            </div>
          </motion.div>

          {/* Transfer Section - Right */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -top-6 left-6 z-10 bg-card border border-border p-2 rounded-xl shadow-lg flex items-center gap-2">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Send className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-semibold pr-2">Transfer Assets</span>
            </div>
            <div className="h-full">
              <TransferForm />
            </div>
          </motion.div>

        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-xs text-muted-foreground">
            <ArrowRightLeft className="h-3 w-3" />
            <span>All transactions are secured by the Stacks blockchain</span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
