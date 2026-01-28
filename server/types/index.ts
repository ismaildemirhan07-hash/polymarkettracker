// Crypto Types
export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdate: Date;
  source: 'coingecko' | 'binance';
  stale?: boolean;
  warning?: string;
}

export interface CryptoHistoryPoint {
  timestamp: Date;
  price: number;
}

export interface CryptoHistory {
  symbol: string;
  data: CryptoHistoryPoint[];
  source: 'coingecko' | 'binance';
}

// Weather Types
export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  forecast24h: Array<{ time: string; temp: number }>;
  lastUpdate: Date;
  source: 'open-meteo' | 'openweather';
  stale?: boolean;
  warning?: string;
}

export interface CityCoordinates {
  lat: number;
  lon: number;
}

// Stock Types
export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  lastUpdate: Date;
  source: 'yahoo' | 'finnhub';
  stale?: boolean;
  warning?: string;
}

export interface StockHistory {
  symbol: string;
  data: Array<{ timestamp: Date; price: number; volume?: number }>;
  source: 'yahoo' | 'finnhub';
}

// Sports Types
export interface GameScore {
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL';
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  quarter?: string;
  timeRemaining?: string;
  lastUpdate: Date;
}

// Bet Types
export interface ParsedBet {
  type: 'crypto' | 'stock' | 'weather' | 'sports';
  asset: string;
  threshold: number;
  thresholdUnit: string;
  position: 'YES' | 'NO';
  resolveDate: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface BetStatus {
  betId: string;
  currentValue: number;
  distanceValue: number;
  distancePercent: number;
  isWinning: boolean;
  status: 'winning' | 'losing';
  lastUpdate: Date;
}

export interface DistanceResult {
  distanceValue: number;
  distancePercent: number;
  isWinning: boolean;
}

export interface PnLResult {
  currentValue: number;
  unrealizedPnL: number;
  potentialPayout: number;
  roi: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp: Date;
}

// Portfolio Analytics
export interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  unrealizedPnL: number;
  winningBets: number;
  losingBets: number;
  totalBets: number;
  winRate: number;
}

// API Usage Stats
export interface ApiUsageStats {
  service: string;
  endpoint: string;
  callsToday: number;
  dailyLimit: number;
  percentUsed: number;
  lastReset: Date;
}

// WebSocket Events
export interface PriceUpdateEvent {
  type: 'crypto' | 'stock' | 'weather';
  symbol: string;
  price: number;
  change?: number;
  timestamp: Date;
}

export interface BetUpdateEvent {
  betId: string;
  status: BetStatus;
}
