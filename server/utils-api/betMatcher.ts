import { ParsedBet } from '../types';

const CRYPTO_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ethereum: 'ETH',
  eth: 'ETH',
  solana: 'SOL',
  sol: 'SOL',
  polygon: 'MATIC',
  matic: 'MATIC',
  dogecoin: 'DOGE',
  doge: 'DOGE',
  cardano: 'ADA',
  ada: 'ADA',
  chainlink: 'LINK',
  link: 'LINK',
  avalanche: 'AVAX',
  avax: 'AVAX',
  polkadot: 'DOT',
  dot: 'DOT',
  ripple: 'XRP',
  xrp: 'XRP',
};

const STOCK_SYMBOLS = [
  'GOOGL', 'GOOG', 'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META',
  'NFLX', 'AMD', 'INTC', 'COIN', 'PYPL', 'SQ', 'SHOP', 'UBER',
  'LYFT', 'ABNB', 'SNAP', 'TWTR', 'PINS', 'ROKU', 'ZM', 'DOCU',
  'CRM', 'ORCL', 'IBM', 'CSCO', 'ADBE', 'NOW', 'SNOW', 'PLTR',
  'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO',
];

const CITIES: Record<string, { lat: number; lon: number }> = {
  'new york': { lat: 40.7128, lon: -74.006 },
  'nyc': { lat: 40.7128, lon: -74.006 },
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  'la': { lat: 34.0522, lon: -118.2437 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'miami': { lat: 25.7617, lon: -80.1918 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'phoenix': { lat: 33.4484, lon: -112.074 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'san antonio': { lat: 29.4241, lon: -98.4936 },
  'san diego': { lat: 32.7157, lon: -117.1611 },
  'dallas': { lat: 32.7767, lon: -96.797 },
  'san jose': { lat: 37.3382, lon: -121.8863 },
  'austin': { lat: 30.2672, lon: -97.7431 },
  'jacksonville': { lat: 30.3322, lon: -81.6557 },
  'fort worth': { lat: 32.7555, lon: -97.3308 },
  'columbus': { lat: 39.9612, lon: -82.9988 },
  'charlotte': { lat: 35.2271, lon: -80.8431 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'sf': { lat: 37.7749, lon: -122.4194 },
  'indianapolis': { lat: 39.7684, lon: -86.1581 },
  'seattle': { lat: 47.6062, lon: -122.3321 },
  'denver': { lat: 39.7392, lon: -104.9903 },
  'washington': { lat: 38.9072, lon: -77.0369 },
  'dc': { lat: 38.9072, lon: -77.0369 },
  'boston': { lat: 42.3601, lon: -71.0589 },
  'nashville': { lat: 36.1627, lon: -86.7816 },
  'detroit': { lat: 42.3314, lon: -83.0458 },
  'portland': { lat: 45.5152, lon: -122.6784 },
  'las vegas': { lat: 36.1699, lon: -115.1398 },
  'vegas': { lat: 36.1699, lon: -115.1398 },
  'atlanta': { lat: 33.749, lon: -84.388 },
};

export function parseBetText(market: string): ParsedBet | null {
  const lowerMarket = market.toLowerCase();
  
  // Try to detect type and extract data
  let type: 'crypto' | 'stock' | 'weather' | 'sports' | null = null;
  let asset: string | null = null;
  let threshold: number | null = null;
  let thresholdUnit = 'USD';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Check for crypto
  for (const [keyword, symbol] of Object.entries(CRYPTO_SYMBOLS)) {
    if (lowerMarket.includes(keyword)) {
      type = 'crypto';
      asset = symbol;
      confidence = 'high';
      break;
    }
  }

  // Check for stocks
  if (!type) {
    for (const symbol of STOCK_SYMBOLS) {
      const regex = new RegExp(`\\b${symbol}\\b`, 'i');
      if (regex.test(market)) {
        type = 'stock';
        asset = symbol.toUpperCase();
        confidence = 'high';
        break;
      }
    }
  }

  // Check for weather
  if (!type) {
    const weatherKeywords = ['temperature', 'temp', 'weather', '°f', '°c', 'fahrenheit', 'celsius'];
    if (weatherKeywords.some(kw => lowerMarket.includes(kw))) {
      type = 'weather';
      
      // Find city
      for (const [cityName] of Object.entries(CITIES)) {
        if (lowerMarket.includes(cityName)) {
          asset = cityName.toUpperCase().replace(/\s+/g, '_');
          if (asset === 'NYC' || asset === 'NEW_YORK') asset = 'NYC';
          if (asset === 'LA' || asset === 'LOS_ANGELES') asset = 'LA';
          if (asset === 'SF' || asset === 'SAN_FRANCISCO') asset = 'SF';
          confidence = 'high';
          break;
        }
      }
      
      thresholdUnit = 'F';
    }
  }

  // Check for sports
  if (!type) {
    const sportsKeywords = ['lakers', 'warriors', 'celtics', 'bulls', 'heat', 'nets', 
      'knicks', 'suns', 'bucks', 'sixers', 'mavericks', 'clippers',
      'nba', 'nfl', 'mlb', 'nhl', 'beat', 'win', 'score'];
    if (sportsKeywords.some(kw => lowerMarket.includes(kw))) {
      type = 'sports';
      confidence = 'medium';
    }
  }

  // Extract price/threshold
  const pricePatterns = [
    /\$\s*([\d,]+(?:\.\d+)?)\s*[kK]/,
    /\$\s*([\d,]+(?:\.\d+)?)/,
    /([\d,]+(?:\.\d+)?)\s*[kK]\s*(?:dollars?|usd)?/i,
    /([\d,]+(?:\.\d+)?)\s*°?\s*[fF]/,
    /([\d,]+(?:\.\d+)?)\s*(?:dollars?|usd)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = market.match(pattern);
    if (match?.[1]) {
      let value = parseFloat(match[1].replace(/,/g, ''));
      
      // Handle 'k' suffix
      if (/[kK]/.test(match[0])) {
        value *= 1000;
      }
      
      threshold = value;
      break;
    }
  }

  // Extract date
  let resolveDate = new Date();
  resolveDate.setMonth(resolveDate.getMonth() + 1);

  const datePatterns = [
    /(?:before|by|on)\s+(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i,
    /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i,
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/,
  ];

  const months: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11,
  };

  for (const pattern of datePatterns) {
    const match = market.match(pattern);
    if (match) {
      if (match[1] && isNaN(parseInt(match[1]))) {
        const monthName = match[1].toLowerCase();
        const month = months[monthName];
        if (month !== undefined) {
          const day = parseInt(match[2]);
          const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
          resolveDate = new Date(year < 100 ? 2000 + year : year, month, day);
        }
      } else if (match[1] && match[2]) {
        const month = parseInt(match[1]) - 1;
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        resolveDate = new Date(year < 100 ? 2000 + year : year, month, day);
      }
      break;
    }
  }

  // Determine position from context
  let position: 'YES' | 'NO' = 'YES';
  if (lowerMarket.includes('below') || lowerMarket.includes('under') || 
      lowerMarket.includes('less than') || lowerMarket.includes('won\'t') ||
      lowerMarket.includes('will not') || lowerMarket.includes('fail')) {
    position = 'NO';
  }

  // Validate we have minimum required data
  if (!type || !asset || threshold === null) {
    return null;
  }

  return {
    type,
    asset,
    threshold,
    thresholdUnit,
    position,
    resolveDate,
    confidence,
  };
}

export function getCityCoordinates(city: string): { lat: number; lon: number } | null {
  const normalizedCity = city.toLowerCase().replace(/_/g, ' ');
  return CITIES[normalizedCity] || null;
}

export function getSupportedCities(): string[] {
  return Object.keys(CITIES).map(city => 
    city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
}

export function isSupportedCrypto(symbol: string): boolean {
  return Object.values(CRYPTO_SYMBOLS).includes(symbol.toUpperCase());
}

export function isSupportedStock(symbol: string): boolean {
  return STOCK_SYMBOLS.includes(symbol.toUpperCase());
}

export function normalizeSymbol(input: string): string {
  const lower = input.toLowerCase();
  return CRYPTO_SYMBOLS[lower] || input.toUpperCase();
}
