import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { 
  getTokenHolders, 
  getContractMetrics,
  getRecentTransactions, 
  formatTokenAmount, 
  type TokenHolder, 
  type Transaction 
} from "@/utils/stacks";
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Activity, 
  Zap, 
  Globe, 
  Target 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#FF6600', '#00CC66', '#3b82f6', '#a855f7', '#eab308'];

export default function Analysis() {
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);

  // Metrics
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [holderDistribution, setHolderDistribution] = useState<any[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<any[]>([]);
  const [networkHealth, setNetworkHealth] = useState("Good");
  const [txCount, setTxCount] = useState(0);
  const [transferCount, setTransferCount] = useState(0);
  const [txs24h, setTxs24h] = useState(0);
  const [fees24h, setFees24h] = useState("0 STX");
  const [avgTxs24h, setAvgTxs24h] = useState("0");
  const [failedTxCount, setFailedTxCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch extended data
        const [holdersData, metricsData, recentTxs] = await Promise.all([
          getTokenHolders(),
          getContractMetrics(),
          getRecentTransactions() 
        ]);
        
        setHolders(holdersData);
        setTxCount(metricsData.totalTransactions);
        setTransferCount(metricsData.transferCount);
        setTxs24h(metricsData.txsLast24h);
        setFees24h(metricsData.feesLast24h);
        
        // Calculate average transactions per hour for the last 24h
        // If we have data for less than 24h, this might be skewed, but simple avg is fine for now
        const avgPerHour = metricsData.txsLast24h / 24;
        setAvgTxs24h(avgPerHour.toFixed(1));
        
        // Calculate failed transactions from the metrics fetch if available or estimate
        const failedInRecent = recentTxs.filter(tx => tx.tx_status !== "success").length;
        setFailedTxCount(failedInRecent);

        // 1. Holder Distribution (Real Data)
        const topHolders = holdersData.slice(0, 4);
        const otherHoldersBalance = holdersData.slice(4).reduce((acc, h) => acc + BigInt(h.balance), 0n);
        
        const distData = topHolders.map(h => ({
          name: h.address.slice(0, 6) + '...',
          value: Number(BigInt(h.balance) / 1_000_000n) // in full tokens
        }));
        
        if (otherHoldersBalance > 0n) {
          distData.push({ name: 'Others', value: Number(otherHoldersBalance / 1_000_000n) });
        }
        setHolderDistribution(distData);

        // 2. Transaction Volume History (Real Data from metrics fetch if possible, or fallback to recent)
        // Since we don't have full history API easily, we'll map recent transactions by date
        // Note: For a real deep history, we'd need an indexer. This shows "Recent Activity Trend".
        const txsByDate = new Map<string, number>();
        // Initialize last 7 days with 0
        for (let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          txsByDate.set(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 0);
        }

        // We use recentTxs for this quick view. Ideally, getContractMetrics would return time-series.
        // For this demo, let's assume we want to visualize the *shape* of activity we can see.
        recentTxs.forEach(tx => {
          const date = new Date(tx.burn_block_time_iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (txsByDate.has(date)) {
            txsByDate.set(date, (txsByDate.get(date) || 0) + 1);
          }
        });

        const volData = Array.from(txsByDate.entries()).map(([date, count]) => ({ date, value: count }));
        setVolumeData(volData);

        // 3. Activity Heatmap (Real Data - Last 24h by Hour)
        const activityByHour = new Array(24).fill(0);
        recentTxs.forEach(tx => {
          const txDate = new Date(tx.burn_block_time_iso);
          // Check if within last 24h
          if (Date.now() - txDate.getTime() < 24 * 60 * 60 * 1000) {
            activityByHour[txDate.getHours()]++;
          }
        });
        
        const heatmap = activityByHour.map((count, i) => ({
          hour: `${i}:00`,
          count: count
        }));
        setActivityHeatmap(heatmap);

        // 4. Network/Token Health
        setNetworkHealth(metricsData.totalTransactions > 0 ? "Active" : "Quiet");

      } catch (error) {
        console.error("Failed to fetch analysis data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container py-12 space-y-12">
      
      {/* Header with Background Image */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center border border-white/10 shadow-2xl group"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dg5rr4ntw/image/upload/v1772739178/photo_2026-03-05_22-32-31_urdzf5.jpg" 
            alt="Analysis Background" 
            className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-7xl font-bold text-orange-500 drop-shadow-lg">
            Deep Dive Analytics
          </h1>
          <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
            Real-time insights into the sBC ecosystem. Track volume, distribution, and network health.
          </p>
        </div>
      </motion.div>

      {/* KPI Grid - Pro Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Network Status", value: networkHealth, icon: Activity, color: "text-green-500", dotColor: "bg-green-500", sub: "Operational", bg: "bg-green-500/10" },
          { label: "Total Transactions", value: txCount.toLocaleString(), icon: Globe, color: "text-blue-500", dotColor: "bg-blue-500", sub: "Lifetime Volume", bg: "bg-blue-500/10" },
          { label: "Holder Count", value: holders.length.toLocaleString(), icon: Target, color: "text-orange-500", dotColor: "bg-orange-500", sub: "Unique Wallets", bg: "bg-orange-500/10" },
          { label: "Total Transfers", value: transferCount.toLocaleString(), icon: TrendingUp, color: "text-purple-500", dotColor: "bg-purple-500", sub: "Token Movements", bg: "bg-purple-500/10" },
          { label: "Activity (24h)", value: txs24h.toString(), icon: Zap, color: "text-yellow-500", dotColor: "bg-yellow-500", sub: "Transactions Today", bg: "bg-yellow-500/10" },
          { label: "Avg Txs / Hour", value: avgTxs24h, icon: Activity, color: "text-cyan-500", dotColor: "bg-cyan-500", sub: "Based on last 24h", bg: "bg-cyan-500/10" },
          { label: "Fees Generated (24h)", value: fees24h, icon: Target, color: "text-emerald-500", dotColor: "bg-emerald-500", sub: "Network Fees", bg: "bg-emerald-500/10" },
          { label: "Failed Tx (Recent)", value: failedTxCount.toString(), icon: Activity, color: "text-red-500", dotColor: "bg-red-500", sub: "Errors Detected", bg: "bg-red-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all card-shadow group relative overflow-hidden`}
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className={`text-xs font-mono px-2 py-1 rounded bg-secondary/50 text-muted-foreground flex items-center gap-2`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stat.dotColor}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${stat.dotColor}`}></span>
                </span>
                Live
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-bold mb-1 tracking-tight truncate flex items-center h-9" title={stat.value}>
                {loading ? (
                  <Skeleton className="h-8 w-24 bg-background/30" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                {stat.sub}
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Volume Chart - Large Area */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-b from-card to-background border border-border shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Transaction Volume</h3>
              <p className="text-sm text-muted-foreground">7-Day Activity Trend</p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FF6600" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution Chart - Pie */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl bg-card border border-border shadow-xl flex flex-col relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 rounded-lg bg-green-500/10">
              <PieChartIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Token Distribution</h3>
              <p className="text-sm text-muted-foreground">Top Holders vs Public</p>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={holderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {holderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {loading ? (
                <Skeleton className="h-10 w-16 mb-1 rounded-lg" />
              ) : (
                <span className="text-3xl font-bold">{holders.length}</span>
              )}
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Holders</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Heatmap - Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-3xl bg-secondary/20 border border-white/5"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold">24h Activity Heatmap</h3>
            <p className="text-sm text-muted-foreground">Transaction density by hour</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</span>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityHeatmap}>
              <XAxis dataKey="hour" stroke="#666" tickLine={false} axisLine={false} interval={2} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
