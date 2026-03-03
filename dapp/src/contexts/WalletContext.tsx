import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { connect as stacksConnect, disconnect as stacksDisconnect, isConnected as stacksIsConnected, getLocalStorage } from "@stacks/connect";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  const loadAddress = useCallback(() => {
    if (stacksIsConnected()) {
      const data = getLocalStorage();
      // Find the STX address from stored data
      const stxAddr = data?.addresses?.stx?.[0]?.address || null;
      setAddress(stxAddr);
    } else {
      setAddress(null);
    }
  }, []);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  const connect = useCallback(async () => {
    try {
      await stacksConnect();
      loadAddress();
    } catch (e) {
      console.error("Failed to connect wallet:", e);
    }
  }, [loadAddress]);

  const disconnect = useCallback(() => {
    stacksDisconnect();
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected: !!address, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
