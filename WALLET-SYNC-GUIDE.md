# Polymarket Wallet Sync Guide

## Overview

The app now syncs bets directly from your Polymarket wallet instead of manual entry.

## How It Works

1. **User enters their wallet address** (Ethereum/Polygon address)
2. **System fetches positions** from Polymarket Data API
3. **Bets are synced** to database automatically
4. **Package limits** determine how many bets are visible

---

## Package Tiers & Bet Limits

### Basic (Free)
- **3 bets visible** - Rest are blurred
- Manual wallet sync

### Pro ($19/month)
- **Unlimited bets**
- Auto-sync every 5 minutes
- Priority updates

### Enterprise ($99/month)
- **Unlimited bets**
- Real-time WebSocket updates
- Custom alerts

---

## API Endpoints

### Sync Wallet
```bash
POST /api/wallet/sync
Content-Type: application/json

{
  "walletAddress": "0x1234...",
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "syncedPositions": 12,
    "walletAddress": "0x1234..."
  }
}
```

### Get Positions
```bash
GET /api/wallet/positions/0x1234...
```

### Get Portfolio Value
```bash
GET /api/wallet/value/0x1234...
```

---

## Database Schema Updates

Added to `Bet` model:
```prisma
currentValue  Float?
pnl           Float?
status        String   @default("ACTIVE")

// Polymarket fields
polymarketConditionId String?  @unique
polymarketSlug        String?
polymarketEventSlug   String?
```

---

## What Data Gets Synced

From Polymarket API:
- ✅ Market question (`title`)
- ✅ Position (YES/NO)
- ✅ Entry price (`avgPrice`)
- ✅ Current price (`curPrice`)
- ✅ Shares (`size`)
- ✅ Investment amount (`initialValue`)
- ✅ Profit/Loss (`cashPnl`)
- ✅ End date (`endDate`)
- ✅ Market status

---

## Frontend Implementation Needed

### 1. Wallet Connect Button
Add to dashboard header:
```tsx
<WalletConnectButton 
  onConnect={(address) => syncWallet(address)}
/>
```

### 2. Package-Based Blur
```tsx
const userPackage = 'basic'; // from user profile
const betLimit = userPackage === 'basic' ? 3 : Infinity;

{bets.map((bet, index) => (
  <BetCard 
    bet={bet}
    isBlurred={index >= betLimit}
  />
))}
```

### 3. Upgrade Prompt
```tsx
{bets.length > betLimit && (
  <UpgradePrompt 
    message={`Upgrade to Pro to see all ${bets.length} bets`}
  />
)}
```

---

## External API Keys Needed

### Required APIs:

**1. CoinGecko (Crypto Prices)**
- Free tier: 10-50 calls/minute
- Get key: https://www.coingecko.com/api
- Set in `.env`: `COINGECKO_API_KEY=your_key`

**2. OpenWeatherMap (Weather Data)**  
- Free tier: 60 calls/minute
- Get key: https://openweathermap.org/api
- Set in `.env`: `OPENWEATHER_API_KEY=your_key`

**3. Finnhub (Stock Prices)**
- Free tier: 60 calls/minute
- Get key: https://finnhub.io/
- Set in `.env`: `FINNHUB_API_KEY=your_key`

**4. Binance API (Optional - Crypto)**
- Free, no key needed for public endpoints
- Higher rate limits with API key

### Polymarket APIs:
- ✅ **No API key needed** - All public endpoints
- Data API: `https://data-api.polymarket.com`
- Gamma API: `https://gamma-api.polymarket.com`
- CLOB API: `https://clob.polymarket.com`

---

## Environment Variables

Update `.env`:
```bash
# Polymarket (No key needed)
POLYMARKET_DATA_API=https://data-api.polymarket.com
POLYMARKET_GAMMA_API=https://gamma-api.polymarket.com

# External APIs (Keys required)
COINGECKO_API_KEY=your_coingecko_key
OPENWEATHER_API_KEY=your_openweather_key
FINNHUB_API_KEY=your_finnhub_key

# Optional
BINANCE_API_KEY=your_binance_key
BINANCE_API_SECRET=your_binance_secret
```

---

## Migration Steps

### 1. Run Prisma Migration
```bash
cd /root/polymarkettracker
npx prisma migrate dev --name add_polymarket_fields
```

### 2. Update Dependencies
```bash
npm install  # Already has axios, prisma, etc.
```

### 3. Deploy
```bash
npm run build
pm2 restart polymarket-tracker
```

---

## Testing

### Test Wallet Sync
```bash
curl -X POST http://YOUR_IP:5000/api/wallet/sync \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "userId": "test-user"
  }'
```

### Test Get Positions
```bash
curl http://YOUR_IP:5000/api/wallet/positions/0x56687bf447db6ffa42ffe2204a05edaa20f55839
```

---

## Files Modified

### Backend:
- ✨ `server/services/polymarket/wallet-sync.service.ts` - NEW
- ✨ `server/api-routes/wallet.routes.ts` - NEW
- 📝 `server/api-routes/index.ts` - Added wallet routes
- 📝 `prisma/schema.prisma` - Added Polymarket fields
- 📝 `server/services/polymarket/polymarket.service.ts` - Fixed cache

### Frontend:
- 📝 `client/src/pages/dashboard.tsx` - Removed Add Bet button
- 🗑️ `client/src/components/dashboard/AddBetDialog.tsx` - Can be deleted

---

## Next Steps

1. **Get API Keys** (CoinGecko, OpenWeather, Finnhub)
2. **Add to .env** on VPS
3. **Run database migration**
4. **Build frontend wallet connect UI**
5. **Implement package-based filtering**
6. **Test with real wallet address**

---

## Security Notes

⚠️ **Important:**
- Wallet addresses are public - safe to use
- Never ask for private keys
- Polymarket API is read-only - safe
- Cache wallet data for 5 minutes to reduce API calls
- Rate limit wallet sync endpoint (max 1/minute per user)
