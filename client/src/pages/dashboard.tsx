import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { BetCard } from "@/components/dashboard/BetCard";
import { WalletConnectDialog } from "@/components/dashboard/WalletConnectDialog";
import { useRealTimeData } from "@/lib/mockData";
import { DollarSign, Activity, PieChart, Trophy, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { bets, liveValues, refreshData, isRefreshing } = useRealTimeData();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null); // TODO: Get from user profile

  // Calculate totals
  const totalInvested = bets.reduce((acc, bet) => acc + bet.amount, 0);
  const totalPnL = bets.reduce((acc, bet) => acc + bet.pnl, 0);
  const activePositions = bets.length;
  const winRate = 65; 

  // Filter bets
  const filteredBets = activeFilter === "All" 
    ? bets 
    : bets.filter(bet => bet.category === activeFilter);

  const categories = ["All", "Crypto", "Weather", "Sports", "Stocks"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              Live Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your positions and market data in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
             {walletAddress && (
               <span className="text-xs text-muted-foreground hidden md:inline-block">
                 Auto-refreshing in 55s
               </span>
             )}
             <Button 
               onClick={() => walletAddress ? refreshData() : setShowWalletDialog(true)} 
               variant={walletAddress ? "outline" : "default"}
               className="gap-2"
               disabled={isRefreshing}
             >
               {walletAddress ? (
                 <>
                   <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                   {isRefreshing ? 'Syncing...' : 'Sync Now'}
                 </>
               ) : (
                 <>
                   <Wallet className="size-4" />
                   Connect Account
                 </>
               )}
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Invested" 
            value={`$${totalInvested.toLocaleString()}`} 
            icon={<DollarSign className="size-5" />} 
            trend="+12%"
            trendDirection="up"
            delay={0}
          />
          <StatCard 
            title="Unrealized P&L" 
            value={`${totalPnL > 0 ? '+' : ''}$${totalPnL.toFixed(2)}`} 
            icon={<Activity className="size-5" />}
            trend="+8.2%"
            trendDirection="up"
            delay={0.1}
          />
          <StatCard 
            title="Active Positions" 
            value={activePositions.toString()} 
            icon={<PieChart className="size-5" />}
            delay={0.2}
          />
          <StatCard 
            title="Win Rate" 
            value={`${winRate}%`} 
            icon={<Trophy className="size-5" />}
            trend="-2%"
            trendDirection="down"
            delay={0.3}
          />
        </div>

        {/* Main Content Area */}
        <Tabs defaultValue="active" className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger 
                value="active" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-2 h-auto font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Active Bets
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-2 h-auto font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="watchlist" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-2 h-auto font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Watchlist
              </TabsTrigger>
            </TabsList>
            
            {/* Filter Placeholder */}
            <div className="hidden md:flex gap-2">
               <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Filter by: All</Button>
            </div>
          </div>

          <TabsContent value="active" className="space-y-6">
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all border",
                    activeFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBets.map((bet, index) => (
                <BetCard 
                  key={bet.id} 
                  bet={bet} 
                  liveData={liveValues[bet.id]} 
                  onRefresh={refreshData}
                  isRefreshing={isRefreshing}
                  index={index}
                />
              ))}
              {filteredBets.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                  No active positions found for {activeFilter}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-xl bg-card">
              <p>No closed bets in history.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onWalletConnected={(address) => {
          setWalletAddress(address);
          refreshData();
        }}
      />
    </div>
  );
}
