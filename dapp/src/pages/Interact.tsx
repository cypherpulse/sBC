import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MintForm } from "@/components/MintForm";
import { TransferForm } from "@/components/TransferForm";
import { AdvancedInteract } from "@/components/AdvancedInteract";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function Interact() {
  const { isConnected, connect } = useWallet();

  if (!isConnected) {
    return (
      <div className="container py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <Wallet className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            You need to connect a Stacks wallet to interact with the Bradley Coin contract.
          </p>
          <Button variant="glow" size="lg" onClick={connect}>
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-8 gradient-text">Interact</h1>

        <Tabs defaultValue="transfer" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer">
            <TransferForm />
          </TabsContent>
          <TabsContent value="mint">
            <MintForm />
          </TabsContent>
          <TabsContent value="advanced">
            <AdvancedInteract />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
