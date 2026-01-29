import { useState, useEffect } from 'react';

export interface Bet {
  id: string;
  market: string;
  type?: string;
  position: 'YES' | 'NO';
  amount: number;
  shares: number;
  entryOdds: number;
  currentValue?: number;
  pnl?: number;
  resolveDate: string;
  category: string;
  status: string;
  threshold?: number;
  dataSource?: string;
}

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('polymarket_wallet');
    if (saved) {
      setWalletAddress(saved);
      fetchBets(saved);
    }
  }, []);

  const fetchBets = async (address?: string) => {
    const addr = address || walletAddress;
    if (!addr) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/bets');
      const result = await response.json();
      
      if (result.success && result.data) {
        setBets(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (address: string) => {
    // Sync wallet first
    try {
      const response = await fetch('/api/wallet/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: address,
          userId: 'demo-user'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync wallet');
      }

      // Save to localStorage
      localStorage.setItem('polymarket_wallet', address);
      setWalletAddress(address);
      
      // Fetch bets
      await fetchBets(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('polymarket_wallet');
    setWalletAddress(null);
    setBets([]);
  };

  const refreshBets = async () => {
    if (walletAddress) {
      await connectWallet(walletAddress);
    }
  };

  return {
    walletAddress,
    bets,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBets
  };
};
