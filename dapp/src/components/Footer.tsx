import { SbcLogo } from "./Logo";
import { Github, ExternalLink } from "lucide-react";
import { EXPLORER_URL, CONTRACT_ADDRESS, CONTRACT_NAME } from "@/utils/stacks";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SbcLogo size={28} />
            <span className="text-sm text-muted-foreground">
              Bradley Coin (sBC) — Built on Stacks
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/cypherpulse/sBC.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={`${EXPLORER_URL}/txid/${CONTRACT_ADDRESS}.${CONTRACT_NAME}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
