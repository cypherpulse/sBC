import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getContractMetrics,
  getTokenHolders,
  formatTokenAmount,
  shortenAddress,
  EXPLORER_URL,
  type ContractMetrics,
  type TokenHolder,
} from "@/utils/stacks";
import {
  Activity,
  Users,
  ArrowUpDown,
  Coins,
  TrendingUp,
  DollarSign,
  Crown,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DeployerDashboardProps {
  decimals: number;
}

// ABI Functions for reference
const contractFunctions = {
  public: [
    {
      name: "mint",
      args: [
        { name: "amount", type: "uint128" },
        { name: "recipient", type: "principal" },
      ],
      description: "Mint new sBC tokens to a recipient (owner only)",
    },
    {
      name: "transfer",
      args: [
        { name: "amount", type: "uint128" },
        { name: "sender", type: "principal" },
        { name: "recipient", type: "principal" },
        { name: "memo", type: "optional buffer(34)" },
      ],
      description: "Transfer tokens between addresses with optional memo",
    },
  ],
  readOnly: [
    { name: "get-balance", args: [{ name: "who", type: "principal" }], description: "Get token balance for an address" },
    { name: "get-name", args: [], description: "Get token name" },
    { name: "get-symbol", args: [], description: "Get token symbol" },
    { name: "get-decimals", args: [], description: "Get token decimals" },
    { name: "get-total-supply", args: [], description: "Get total token supply" },
    { name: "get-token-uri", args: [], description: "Get token metadata URI" },
  ],
};

const contractConstants = [
  { name: "CONTRACT_OWNER", type: "principal", description: "The deployer/owner address" },
  { name: "MAX_SUPPLY_UNITS", type: "uint128", description: "Maximum token supply" },
  { name: "MINT_PRICE_PER_UNIT", type: "uint128", description: "Cost to mint tokens" },
  { name: "TOKEN_DECIMALS", type: "uint128", description: "Token decimal places" },
  { name: "TOKEN_NAME", type: "string", description: "Token name constant" },
  { name: "TOKEN_SYMBOL", type: "string", description: "Token symbol constant" },
  { name: "TOKEN_URI", type: "string", description: "Token metadata URI" },
];

const errorCodes = [
  { name: "ERR_OWNER_ONLY", description: "Caller is not the contract owner" },
  { name: "ERR_NOT_TOKEN_OWNER", description: "Caller doesn't own the tokens" },
  { name: "ERR_INVALID_AMOUNT", description: "Invalid token amount specified" },
  { name: "ERR_MAX_SUPPLY_REACHED", description: "Maximum supply has been reached" },
  { name: "ERR_PAYMENT_FAILED", description: "STX payment failed" },
];

export function DeployerDashboard({ decimals }: DeployerDashboardProps) {
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [metricsData, holdersData] = await Promise.all([
        getContractMetrics(),
        getTokenHolders(),
      ]);
      setMetrics(metricsData);
      setHolders(holdersData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metricCards = [
    {
      label: "Total Transactions",
      value: metrics?.totalTransactions.toString() || "0",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      label: "Mint Transactions",
      value: metrics?.mintCount.toString() || "0",
      icon: Coins,
      color: "text-green-500",
    },
    {
      label: "Transfer Transactions",
      value: metrics?.transferCount.toString() || "0",
      icon: ArrowUpDown,
      color: "text-purple-500",
    },
    {
      label: "Unique Holders",
      value: metrics?.uniqueHolders.toString() || "0",
      icon: Users,
      color: "text-orange-500",
    },
    {
      label: "Average Fee",
      value: metrics?.averageFee || "0 STX",
      icon: TrendingUp,
      color: "text-cyan-500",
    },
    {
      label: "Total Fees Collected",
      value: metrics?.totalFees || "0 STX",
      icon: DollarSign,
      color: "text-yellow-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-8"
    >
      {/* Deployer Badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-orange-500/10 border border-primary/30">
        <Crown className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-primary">Contract Owner Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            You have access to all administrative features and contract metrics
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Contract Metrics
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card border border-border card-shadow hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Token Holders */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Token Holders
        </h3>
        {holders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 bg-card rounded-xl border border-border">
            No holders data available yet
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border card-shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">#</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Address</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Balance</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((holder, i) => (
                  <motion.tr
                    key={holder.address}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 text-muted-foreground">{i + 1}</td>
                    <td className="p-4 font-mono">
                      <a
                        href={`${EXPLORER_URL}/address/${holder.address}?chain=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {shortenAddress(holder.address)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatTokenAmount(holder.balance, decimals)} sBC
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract ABI Reference */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Contract Functions & ABI
        </h3>
        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="public" className="border border-border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-secondary/50">
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                  public
                </span>
                Public Functions (2)
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {contractFunctions.public.map((fn) => (
                  <div key={fn.name} className="p-3 rounded-lg bg-secondary/50">
                    <code className="text-primary font-semibold">{fn.name}</code>
                    <p className="text-sm text-muted-foreground mt-1">{fn.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fn.args.map((arg) => (
                        <span
                          key={arg.name}
                          className="px-2 py-1 rounded bg-secondary text-xs font-mono"
                        >
                          {arg.name}: <span className="text-primary">{arg.type}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="readonly" className="border border-border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-secondary/50">
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-medium">
                  read-only
                </span>
                Read-Only Functions (6)
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {contractFunctions.readOnly.map((fn) => (
                  <div key={fn.name} className="p-3 rounded-lg bg-secondary/50">
                    <code className="text-primary font-semibold">{fn.name}</code>
                    <p className="text-sm text-muted-foreground mt-1">{fn.description}</p>
                    {fn.args.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {fn.args.map((arg) => (
                          <span
                            key={arg.name}
                            className="px-2 py-1 rounded bg-secondary text-xs font-mono"
                          >
                            {arg.name}: <span className="text-primary">{arg.type}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="constants" className="border border-border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-secondary/50">
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-500 text-xs font-medium">
                  constant
                </span>
                Contract Constants (7)
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {contractConstants.map((c) => (
                  <div key={c.name} className="p-3 rounded-lg bg-secondary/50 flex justify-between items-start">
                    <div>
                      <code className="text-purple-400 font-semibold">{c.name}</code>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-secondary text-xs font-mono text-muted-foreground">
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="errors" className="border border-border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-secondary/50">
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs font-medium">
                  error
                </span>
                Error Codes (5)
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {errorCodes.map((err) => (
                  <div key={err.name} className="p-3 rounded-lg bg-secondary/50">
                    <code className="text-red-400 font-semibold">{err.name}</code>
                    <p className="text-sm text-muted-foreground mt-1">{err.description}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  );
}
