import { Link, useLocation } from "react-router-dom";
import { SbcLogo } from "./Logo";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "./ui/button";
import { shortenAddress } from "@/utils/stacks";
import { Menu, X, Wallet, LogOut } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Stats", path: "/stats" },
  { label: "Transactions", path: "/transactions" },
  { label: "Interact", path: "/interact" },
];

export function Header() {
  const { isConnected, address, connect, disconnect } = useWallet();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <SbcLogo size={36} />
          <span className="text-lg font-bold gradient-text hidden sm:inline">Bradley Coin</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm font-mono text-muted-foreground">
                {shortenAddress(address || "")}
              </span>
              <Button variant="outline" size="sm" onClick={disconnect}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button variant="glow" size="sm" onClick={connect}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
