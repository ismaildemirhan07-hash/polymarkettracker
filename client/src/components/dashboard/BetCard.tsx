import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bet, LiveData } from "@/lib/mockData";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BetCardProps {
  bet: Bet;
  liveData?: LiveData;
  onRefresh: () => void;
  isRefreshing: boolean;
  index?: number;
}

export function BetCard({ bet, liveData, onRefresh, isRefreshing, index = 0 }: BetCardProps) {
  const [percentToTarget, setPercentToTarget] = useState(0);
  const [distanceInfo, setDistanceInfo] = useState({ label: '', color: '' });
  const [cryptoPrice, setCryptoPrice] = useState<number | null>(null);
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [stockPrice, setStockPrice] = useState<number | null>(null);

  const isWinning = bet.status === 'winning';
  const isLosing = bet.status === 'losing';

  // Fetch live data based on bet type
  useEffect(() => {
    const fetchLiveData = async () => {
      if (bet.dataSource !== 'Polymarket') return;

      const title = bet.market.toLowerCase();

      // Fetch Bitcoin price
      if (title.includes('bitcoin') || title.includes('btc')) {
        try {
          const response = await fetch('/api/crypto/price/BTC');
          const data = await response.json();
          if (data.success && data.data) {
            setCryptoPrice(data.data.price);
          }
        } catch (error) {
          console.error('Failed to fetch BTC price:', error);
        }
      }

      // Fetch weather temperature
      if (title.includes('temperature') || title.includes('weather')) {
        const cities = ['new york', 'nyc', 'chicago', 'miami', 'los angeles'];
        const city = cities.find(c => title.includes(c));
        if (city) {
          try {
            const response = await fetch(`/api/weather/temperature/${city}`);
            const data = await response.json();
            if (data.success && data.data) {
              setWeatherTemp(data.data.temperature);
            }
          } catch (error) {
            console.error('Failed to fetch temperature:', error);
          }
        }
      }

      // Fetch stock price
      const stockSymbols = ['nvda', 'nvidia', 'aapl', 'apple', 'tsla', 'tesla', 'msft', 'microsoft'];
      const stock = stockSymbols.find(s => title.includes(s));
      if (stock) {
        const symbol = stock.includes('nvidia') ? 'NVDA' : 
                      stock.includes('apple') ? 'AAPL' : 
                      stock.includes('tesla') ? 'TSLA' : 
                      stock.includes('microsoft') ? 'MSFT' : stock.toUpperCase();
        try {
          const response = await fetch(`/api/stocks/price/${symbol}`);
          const data = await response.json();
          if (data.success && data.data) {
            setStockPrice(data.data.price);
          }
        } catch (error) {
          console.error('Failed to fetch stock price:', error);
        }
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [bet.market, bet.dataSource]);

  // Calculate progress relative to threshold
  useEffect(() => {
    if (!liveData) return;
    
    // Normalize logic for progress bar
    const range = bet.threshold * 0.2 || 10;
    const start = bet.threshold - range;
    const end = bet.threshold + range;
    
    let pct = ((liveData.value - start) / (end - start)) * 100;
    pct = Math.min(Math.max(pct, 0), 100);
    
    setPercentToTarget(pct);

    // Calculate distance text
    const diff = liveData.value - bet.threshold;
    const percentDiff = (diff / bet.threshold) * 100;
    
    if (bet.type === 'crypto' || bet.type === 'stocks') {
       const isAbove = diff > 0;
       setDistanceInfo({
         label: `${isAbove ? '+' : ''}${percentDiff.toFixed(2)}% ${isAbove ? 'above' : 'below'} target`,
         color: isAbove === (bet.position === 'YES') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
       });
    } else {
       setDistanceInfo({
         label: `${Math.abs(diff).toFixed(1)} units away`,
         color: 'text-muted-foreground'
       });
    }

  }, [liveData, bet.threshold, bet.position, bet.type]);

  
  // Format numbers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={cn(
        "glass-card border-l-4 transition-all duration-300",
        isWinning ? "border-l-emerald-500" : 
        isLosing ? "border-l-rose-500" : 
        "border-l-slate-400 dark:border-l-slate-600"
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn(
                  "uppercase text-[10px] tracking-wider font-bold border-0 bg-opacity-10",
                  bet.category === 'Crypto' ? "text-orange-600 dark:text-orange-300 bg-orange-500/10" :
                  bet.category === 'Weather' ? "text-blue-600 dark:text-blue-300 bg-blue-500/10" :
                  bet.category === 'Stocks' ? "text-purple-600 dark:text-purple-300 bg-purple-500/10" :
                  "text-emerald-600 dark:text-emerald-300 bg-emerald-500/10"
                )}>
                  {bet.category}
                </Badge>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600 dark:bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-wider">LIVE</span>
                </div>
              </div>
              <CardTitle className="text-base font-semibold leading-tight text-foreground">
                {bet.market}
              </CardTitle>
            </div>
            
            <Badge className={cn(
              "text-sm font-bold px-3 py-1 border-0 shadow-none",
              bet.position === 'YES' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
            )}>
              {bet.position}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Main Live Data Display - Polymarket Format */}
          <div className="mb-6 relative group">
            {bet.dataSource === 'Polymarket' ? (
              <>
                {/* Show Live Bitcoin Price */}
                {cryptoPrice && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Live Bitcoin Price</span>
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        ${formatNumber(cryptoPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Show Live Weather Temperature */}
                {weatherTemp && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Live Temperature</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {weatherTemp.toFixed(1)}°F
                      </span>
                    </div>
                  </div>
                )}

                {/* Show Live Stock Price */}
                {stockPrice && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Live Stock Price</span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        ${formatNumber(stockPrice)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Odds</span>
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-3xl font-bold tracking-tight",
                        isWinning ? "text-emerald-600 dark:text-emerald-400" : isLosing ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      )}>
                        {bet.currentValue ? `${(bet.currentValue * 100).toFixed(1)}%` : '...'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entry Odds</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight text-foreground/70">
                        {(bet.entryOdds * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Show Starting Price vs Current Price for Bitcoin Up/Down bets */}
                {bet.threshold > 0 && cryptoPrice && (
                  <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold">Starting Price</span>
                        <div className="text-2xl font-bold text-foreground/70">
                          ${formatNumber(bet.threshold)}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold">Current Price</span>
                        <div className={cn(
                          "text-2xl font-bold",
                          cryptoPrice > bet.threshold ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          ${formatNumber(cryptoPrice)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar for Up/Down */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-medium">Movement</span>
                        <span className={cn(
                          "font-bold",
                          cryptoPrice > bet.threshold ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {cryptoPrice > bet.threshold ? '↑' : '↓'} ${Math.abs(cryptoPrice - bet.threshold).toFixed(0)} ({((Math.abs(cryptoPrice - bet.threshold) / bet.threshold) * 100).toFixed(2)}%)
                        </span>
                      </div>
                      <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                        <div className="absolute inset-0 flex justify-between px-2">
                          <div className="w-px h-full bg-border" />
                          <div className="w-px h-full bg-border" />
                          <div className="w-px h-full bg-border" />
                        </div>
                        <div 
                          className={cn(
                            "absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out",
                            cryptoPrice > bet.threshold ? "bg-emerald-500" : "bg-rose-500"
                          )}
                          style={{ 
                            width: `${Math.min(Math.max(((cryptoPrice - bet.threshold) / (bet.threshold * 0.1) * 50) + 50, 0), 100)}%`
                          }}
                        />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 left-1/2 z-10"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
                        <span>Down</span>
                        <span className="text-foreground/70 font-bold">Start</span>
                        <span>Up</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-sm bg-secondary/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Shares</span>
                    <span className="font-semibold text-foreground">{bet.shares.toFixed(2)}</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Invested</span>
                    <span className="font-semibold text-foreground">{formatCurrency(bet.amount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <span className={cn(
                    "text-4xl font-bold tracking-tight transition-all duration-300",
                    isWinning ? "text-emerald-600 dark:text-emerald-400" : isLosing ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                  )}>
                    {liveData?.value !== undefined 
                      ? bet.type === 'crypto' || bet.type === 'stocks' ? `$${formatNumber(liveData.value)}` : liveData.value.toFixed(1) 
                      : "..."}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current</span>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm bg-secondary/50 p-2 rounded-lg w-fit">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Target</span>
                    <span className="font-semibold text-foreground">
                      {bet.type === 'crypto' || bet.type === 'stocks' ? `$${formatNumber(bet.threshold)}` : bet.threshold}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  {liveData?.change24h && (
                    <div className={cn(
                      "flex items-center gap-1 font-semibold text-xs",
                      liveData.change24h > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {liveData.change24h > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(liveData.change24h).toFixed(2)}% (24h)
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Progress Bar - Only for non-Polymarket bets */}
          {bet.dataSource !== 'Polymarket' && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground font-medium">Proximity</span>
                <span className={cn("font-bold", distanceInfo.color)}>
                  {distanceInfo.label}
                </span>
              </div>
              <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                {/* Background markers */}
                <div className="absolute inset-0 flex justify-between px-2">
                     <div className="w-px h-full bg-border" />
                     <div className="w-px h-full bg-border" />
                     <div className="w-px h-full bg-border" />
                </div>

                <div 
                  className={cn(
                      "absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out",
                      isWinning ? "bg-emerald-500" : "bg-rose-500"
                  )}
                  style={{ width: `${percentToTarget}%` }}
                />
                {/* Threshold Marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 left-1/2 z-10"></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
                 <span>Low</span>
                 <span className="text-foreground/70 font-bold">Target</span>
                 <span>High</span>
              </div>
            </div>
          )}

          {/* Footer Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="bg-secondary/30 rounded-lg p-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-semibold">Unrealized P&L</p>
              <p className={cn(
                "text-sm font-bold",
                bet.pnl > 0 ? "text-emerald-600 dark:text-emerald-400" : bet.pnl < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
              )}>
                {bet.pnl > 0 ? '+' : ''}{formatCurrency(bet.pnl)}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-semibold">Resolution</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(bet.resolveDate), 'MMM d')}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              <span>Source: {bet.dataSource}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-secondary rounded-full"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
