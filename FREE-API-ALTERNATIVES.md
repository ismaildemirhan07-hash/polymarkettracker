# FREE API Alternatives

## ✅ Completely Free Options (No Key Required)

### 1. **Polymarket APIs** ✅
- **Cost**: FREE
- **Rate Limit**: Public endpoints, reasonable limits
- **No API Key Needed**
```
Data API: https://data-api.polymarket.com
Gamma API: https://gamma-api.polymarket.com
CLOB API: https://clob.polymarket.com
```

### 2. **Crypto Prices - CoinGecko Free Tier** ✅
- **Cost**: FREE
- **Rate Limit**: 10-50 calls/minute (plenty for your use case)
- **API Key**: Optional (higher limits with free key)
- **Endpoint**: `https://api.coingecko.com/api/v3`
```bash
# No key needed for basic usage
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
```

### 3. **Crypto Prices - Binance Public API** ✅
- **Cost**: FREE
- **Rate Limit**: 1200 requests/minute (weight-based)
- **No API Key Needed** for public endpoints
- **Endpoint**: `https://api.binance.com/api/v3`
```bash
curl "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
```

### 4. **Weather - Open-Meteo** ✅ RECOMMENDED
- **Cost**: FREE
- **Rate Limit**: 10,000 requests/day
- **No API Key Required**
- **Endpoint**: `https://api.open-meteo.com/v1`
```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true"
```

### 5. **Weather - WeatherAPI Free Tier** ✅
- **Cost**: FREE up to 1M calls/month
- **API Key**: Required but FREE
- **Sign up**: https://www.weatherapi.com/signup.aspx
```bash
curl "http://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=New York"
```

### 6. **Stock Prices - Yahoo Finance (Unofficial)** ✅
- **Cost**: FREE
- **No API Key Needed**
- **Note**: Unofficial but widely used
- **Package**: `yahoo-finance2` (npm)
```javascript
import yahooFinance from 'yahoo-finance2';
const quote = await yahooFinance.quote('AAPL');
```

### 7. **Stock Prices - Alpha Vantage Free Tier** ✅
- **Cost**: FREE
- **Rate Limit**: 25 requests/day (25 API calls per day)
- **API Key**: Free registration
- **Sign up**: https://www.alphavantage.co/support/#api-key
```bash
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo"
```

---

## 📊 Recommended Free Setup

### Option A: Completely Free (No Keys)
```env
# Crypto
CRYPTO_SOURCE=binance  # No key needed

# Weather  
WEATHER_SOURCE=open-meteo  # No key needed

# Stocks
STOCK_SOURCE=yahoo-finance  # No key needed (via npm package)

# Polymarket
POLYMARKET_SOURCE=data-api  # No key needed
```

### Option B: Free with Registration (Better Limits)
```env
# Crypto
COINGECKO_API_KEY=your_free_key  # Optional, increases limits

# Weather
WEATHERAPI_KEY=your_free_key  # 1M calls/month

# Stocks
ALPHAVANTAGE_API_KEY=your_free_key  # 25/day (limited but free)

# Polymarket
# No key needed
```

---

## 🔧 Implementation

### Update Environment Variables

**For Completely Free Setup (`.env`):**
```bash
# No API keys needed!

# Crypto - Binance Public API
BINANCE_API_ENABLED=true

# Weather - Open-Meteo
OPENMETEO_API_ENABLED=true

# Stocks - Yahoo Finance
YAHOO_FINANCE_ENABLED=true

# Polymarket (already working)
POLYMARKET_DATA_API=https://data-api.polymarket.com
```

### Code Changes Needed

**1. Update Crypto Service** (`server/services/crypto/crypto.service.ts`)
```typescript
// Use Binance instead of paid APIs
const BINANCE_BASE = 'https://api.binance.com/api/v3';

async function getBitcoinPrice() {
  const response = await axios.get(`${BINANCE_BASE}/ticker/price`, {
    params: { symbol: 'BTCUSDT' }
  });
  return parseFloat(response.data.price);
}
```

**2. Update Weather Service** (`server/services/weather/weather.service.ts`)
```typescript
// Use Open-Meteo instead of OpenWeatherMap
const OPENMETEO_BASE = 'https://api.open-meteo.com/v1';

async function getWeather(lat: number, lon: number) {
  const response = await axios.get(`${OPENMETEO_BASE}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true
    }
  });
  return response.data.current_weather;
}
```

**3. Update Stocks Service** (`server/services/stocks/stocks.service.ts`)
```typescript
// Use Yahoo Finance via npm package
import yahooFinance from 'yahoo-finance2';

async function getStockPrice(symbol: string) {
  const quote = await yahooFinance.quote(symbol);
  return quote.regularMarketPrice;
}
```

---

## 📦 NPM Packages to Install

```bash
npm install yahoo-finance2
```

That's it! Everything else uses standard HTTP requests.

---

## 💰 Cost Comparison

| Service | Paid Option | Free Option | Limits |
|---------|-------------|-------------|--------|
| **Polymarket** | N/A | ✅ FREE | Public API |
| **Crypto Prices** | $50/mo | ✅ Binance Free | 1200/min |
| **Weather** | $40/mo | ✅ Open-Meteo | 10k/day |
| **Stocks** | $50/mo | ✅ Yahoo Finance | Unlimited |

**Total Saved: ~$140/month**

---

## ⚡ Rate Limits - Will It Be Enough?

### Your App Usage (Estimated):
- **Active users**: 100
- **Bets per user**: 5 average
- **Sync frequency**: Every 5 minutes
- **Daily API calls**: ~28,800 (very rough estimate)

### Free Tier Limits:
- **Binance**: 1.7M calls/day ✅
- **Open-Meteo**: 10k calls/day ✅ (may need optimization)
- **Yahoo Finance**: Unlimited ✅
- **Polymarket**: Reasonable limits ✅

**Conclusion**: Free tiers are PLENTY for early stage. Only upgrade if you hit 1000+ users.

---

## 🎯 Implementation Priority

1. ✅ **Polymarket** - Already working, no changes needed
2. 🔧 **Crypto** - Switch to Binance public API (1 hour)
3. 🔧 **Weather** - Switch to Open-Meteo (1 hour)  
4. 🔧 **Stocks** - Use yahoo-finance2 package (1 hour)

**Total Time**: ~3 hours to convert everything to free APIs

---

## 🚀 Next Steps

1. Update service files to use free APIs
2. Remove paid API key requirements from `.env`
3. Test with real data
4. Deploy

**You can start with 100% free infrastructure and upgrade later if needed!**
