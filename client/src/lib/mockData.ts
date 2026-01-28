import { useState, useEffect } from 'react';

export interface Bet {
  id: string;
  market: string;
  type: 'crypto' | 'weather' | 'sports' | 'stocks';
  position: 'YES' | 'NO';
  amount: number;
  shares: number;
  currentOdds: number;
  entryOdds: number;
  threshold: number;
  resolveDate: string;
  category: string;
  dataSource: string;
  status: 'winning' | 'losing' | 'neutral';
  pnl: number;
}

export interface LiveData {
  value: number;
  lastUpdated: Date;
  change24h?: number;
}

const MOCK_BETS: Bet[] = [
  {
    id: '1',
    market: 'Will Bitcoin hit $110k before Feb 1?',
    type: 'crypto',
    position: 'NO',
    category: 'Crypto',
    amount: 500,
    shares: 850,
    currentOdds: 0.65,
    entryOdds: 0.45,
    threshold: 110000,
    resolveDate: '2025-02-01T00:00:00Z',
    dataSource: 'CoinGecko',
    status: 'winning',
    pnl: 145.50
  },
  {
    id: '2',
    market: 'Temperature in NYC > 40°F on Jan 25?',
    type: 'weather',
    position: 'YES',
    category: 'Weather',
    amount: 200,
    shares: 400,
    currentOdds: 0.30,
    entryOdds: 0.50,
    threshold: 40,
    resolveDate: '2025-01-25T12:00:00Z',
    dataSource: 'Open-Meteo',
    status: 'losing',
    pnl: -80.00
  },
  {
    id: '3',
    market: 'NVIDIA Stock > $140 at close?',
    type: 'stocks',
    position: 'YES',
    category: 'Stocks',
    amount: 1000,
    shares: 1200,
    currentOdds: 0.85,
    entryOdds: 0.70,
    threshold: 140,
    resolveDate: '2025-01-24T21:00:00Z',
    dataSource: 'Yahoo Finance',
    status: 'winning',
    pnl: 320.00
  },
  {
    id: '4',
    market: 'Lakers beat Warriors (Jan 24)?',
    type: 'sports',
    position: 'NO',
    category: 'Sports',
    amount: 300,
    shares: 300,
    currentOdds: 0.40,
    entryOdds: 0.40,
    threshold: 0, // Boolean outcome
    resolveDate: '2025-01-24T23:00:00Z',
    dataSource: 'API-SPORTS',
    status: 'neutral',
    pnl: 0
  }
];

// Initial mock values for live tracking
const INITIAL_LIVE_VALUES: Record<string, number> = {
  '1': 104250, // BTC Price
  '2': 36.5,   // NYC Temp
  '3': 142.15, // NVDA Price
  '4': 0,      // Sports Score (0-0 placeholder)
};

export const useRealTimeData = () => {
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [liveValues, setLiveValues] = useState<Record<string, LiveData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate initial data load
  useEffect(() => {
    const initialData: Record<string, LiveData> = {};
    MOCK_BETS.forEach(bet => {
      initialData[bet.id] = {
        value: INITIAL_LIVE_VALUES[bet.id],
        lastUpdated: new Date(),
        change24h: bet.type === 'crypto' ? -2.3 : bet.type === 'stocks' ? 1.5 : undefined
      };
    });
    setLiveValues(initialData);
  }, []);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveValues(prev => {
        const next = { ...prev };
        
        // Randomly update Bitcoin
        if (next['1']) {
          const volatility = (Math.random() - 0.5) * 100;
          next['1'] = {
            ...next['1'],
            value: next['1'].value + volatility,
            lastUpdated: new Date()
          };
        }

        // Randomly update Temp slightly
        if (next['2']) {
          const change = (Math.random() - 0.5) * 0.2;
          next['2'] = {
            ...next['2'],
            value: next['2'].value + change,
            lastUpdated: new Date()
          };
        }

        // Update Stock
        if (next['3']) {
           const change = (Math.random() - 0.5) * 0.1;
           next['3'] = {
             ...next['3'],
             value: next['3'].value + change,
             lastUpdated: new Date()
           };
        }

        return next;
      });
    }, 2000); // Fast updates for demo effect

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return { bets, liveValues, refreshData, isRefreshing };
};
