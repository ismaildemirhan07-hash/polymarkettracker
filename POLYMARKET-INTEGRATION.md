# Polymarket Integration - Feature Summary

## What Was Added

### Backend (API)

**1. Polymarket Service** (`server/services/polymarket/polymarket.service.ts`)
- Connects to official Polymarket APIs (Gamma API & CLOB API)
- Fetches real market data from Polymarket
- Parses Polymarket URLs to extract market information
- Gets live YES/NO prices
- Caches results in Redis for performance

**Key Functions:**
- `extractMarketIdFromUrl()` - Parse Polymarket URL
- `searchMarkets()` - Search for markets by query
- `getMarketById()` - Get full market details with live prices
- `getMarketFromUrl()` - One-step URL → market data

**2. Polymarket API Routes** (`server/api-routes/polymarket.routes.ts`)
- `POST /api/polymarket/parse-url` - Parse a Polymarket URL
- `GET /api/polymarket/search?query=...` - Search markets
- `GET /api/polymarket/market/:id` - Get market by ID

**3. Updated Routes** (`server/api-routes/index.ts`)
- Registered `/api/polymarket` endpoints

---

### Frontend (UI)

**1. Add Bet Dialog Component** (`client/src/components/dashboard/AddBetDialog.tsx`)

**Features:**
- **Two tabs:**
  - **From Polymarket**: Paste URL → auto-fetch market data
  - **Manual Entry**: Enter bet details manually

**Polymarket Tab:**
- User pastes Polymarket URL (e.g., `https://polymarket.com/event/will-bitcoin-hit-110000`)
- Clicks "Parse" button
- System fetches market details automatically:
  - Market question
  - YES price (current odds)
  - NO price (current odds)
  - End date
- User selects position (YES/NO)
- Enters amount and shares
- Creates bet with one click

**Manual Tab:**
- Traditional form for non-Polymarket bets
- Market question, position, amount, shares, odds, date

**2. Floating Add Button** (Dashboard)
- Fixed position bottom-right corner
- Circular button with Plus icon
- Opens the Add Bet Dialog

**3. Updated Dashboard** (`client/src/pages/dashboard.tsx`)
- Added floating "Add Bet" button
- Integrated AddBetDialog component
- Refreshes data after bet is added

---

## How It Works

### User Flow:

1. **User clicks the floating "+" button** (bottom-right)
2. **Add Bet Dialog opens** with two options:
   - Import from Polymarket
   - Manual entry

### Option A: From Polymarket URL

```
User Action → System Response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Paste URL: 
   https://polymarket.com/event/bitcoin-110k
   
2. Click "Parse" →  Backend calls Polymarket APIs
                    ↓
                    Fetches market data
                    ↓
                    Returns: Question, YES/NO prices, end date

3. System shows:
   ┌─────────────────────────────────────┐
   │ Market: Will Bitcoin hit $110k?     │
   │ YES Price: 35¢   NO Price: 65¢      │
   │ Ends: Feb 1, 2026                   │
   └─────────────────────────────────────┘

4. User fills:
   - Position: YES or NO
   - Amount: $200
   - Shares: 571

5. Click "Create Bet" → Saved to database
                        ↓
                        Tracked in real-time
```

### Option B: Manual Entry

User enters all details manually:
- Market question
- Position (YES/NO)
- Amount invested
- Number of shares
- Entry odds
- Resolve date

---

## Technical Details

### Polymarket APIs Used

**Gamma API** (`https://gamma-api.polymarket.com`)
- Get market listings
- Search markets
- Get market details

**CLOB API** (`https://clob.polymarket.com`)
- Get real-time prices
- Get orderbook data

### Data Flow

```
Frontend                 Backend                 Polymarket
   │                        │                         │
   │  POST /api/polymarket  │                         │
   │  /parse-url            │                         │
   ├───────────────────────>│                         │
   │                        │  GET /markets (search)  │
   │                        ├────────────────────────>│
   │                        │<────────────────────────┤
   │                        │  Market ID              │
   │                        │                         │
   │                        │  GET /midpoint (prices) │
   │                        ├────────────────────────>│
   │                        │<────────────────────────┤
   │                        │  YES/NO prices          │
   │<───────────────────────┤                         │
   │  Market Data + Prices  │                         │
```

### Caching Strategy

- Market data cached for **60 seconds** in Redis
- Reduces API calls to Polymarket
- Faster response times
- Falls back to in-memory cache if Redis unavailable

---

## API Endpoints

### POST /api/polymarket/parse-url

**Request:**
```json
{
  "url": "https://polymarket.com/event/will-bitcoin-hit-110000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "marketId": "0x123...",
    "question": "Will Bitcoin hit $110,000 before Feb 1?",
    "endDate": "2026-02-01T00:00:00Z",
    "outcomes": ["Yes", "No"],
    "yesPrice": 0.35,
    "noPrice": 0.65
  }
}
```

### GET /api/polymarket/search?query=bitcoin

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0x123...",
      "question": "Will Bitcoin hit $110,000?",
      "outcomes": ["Yes", "No"],
      "tokens": [...]
    }
  ]
}
```

---

## UI Components

### AddBetDialog Props
```typescript
interface AddBetDialogProps {
  open: boolean;              // Show/hide dialog
  onOpenChange: (open: boolean) => void;  // Close handler
  onBetAdded?: () => void;    // Callback after bet created
}
```

### Floating Button Styling
- Position: Fixed bottom-right (bottom-8, right-8)
- Size: 56px × 56px
- Color: Primary theme color
- Hover: Scales to 110% with shadow
- Z-index: 50 (above content)

---

## Features Summary

✅ **Parse Polymarket URLs** - Auto-extract market details  
✅ **Real-time Prices** - Live YES/NO odds from CLOB  
✅ **Two Input Methods** - Polymarket URL or manual entry  
✅ **Beautiful UI** - Modern dialog with tabs  
✅ **Floating Button** - Easy access from dashboard  
✅ **Form Validation** - Proper error handling  
✅ **Toast Notifications** - Success/error feedback  
✅ **Caching** - Fast responses with Redis  
✅ **Responsive** - Works on mobile & desktop  

---

## Example Polymarket URLs

These URLs work with the system:

```
https://polymarket.com/event/will-bitcoin-hit-110000-before-feb-1
https://polymarket.com/event/us-presidential-election-2024
https://polymarket.com/market/ethereum-price-prediction
https://polymarket.com/event/fed-interest-rate-decision
```

---

## Next Steps to Deploy

1. **Commit changes to Git:**
   ```bash
   git add .
   git commit -m "Add Polymarket integration with Add Bet dialog"
   git push origin main
   ```

2. **Deploy to VPS:**
   ```bash
   # SSH to your droplet
   ssh root@YOUR_IP
   
   # Navigate to app
   cd /root/polymarkettracker
   
   # Pull changes
   git pull origin main
   
   # Rebuild
   npm run build
   
   # Restart
   pm2 restart polymarket-tracker
   ```

3. **Test:**
   - Go to `http://YOUR_IP:5000`
   - Click the floating "+" button
   - Paste a Polymarket URL
   - Watch it auto-fill the form!

---

## Files Modified/Created

### Backend
- ✨ `server/services/polymarket/polymarket.service.ts` - NEW
- ✨ `server/api-routes/polymarket.routes.ts` - NEW
- 📝 `server/api-routes/index.ts` - MODIFIED (added route)

### Frontend
- ✨ `client/src/components/dashboard/AddBetDialog.tsx` - NEW
- 📝 `client/src/pages/dashboard.tsx` - MODIFIED (added button + dialog)

### Documentation
- ✨ `POLYMARKET-INTEGRATION.md` - NEW (this file)

---

## Troubleshooting

**Error: "Market not found"**
- Check if URL is valid Polymarket URL
- Try a different market
- Markets might be closed/removed

**Error: "Failed to parse URL"**
- Ensure URL starts with `https://polymarket.com`
- Check URL structure

**Slow loading:**
- First request fetches from Polymarket API (slower)
- Subsequent requests use cache (faster)

---

## Future Enhancements

Possible improvements:
- [ ] Auto-refresh bet prices from Polymarket
- [ ] Link bet status to live Polymarket odds
- [ ] Show Polymarket chart in dialog
- [ ] Bulk import from Polymarket portfolio
- [ ] Webhook notifications when market resolves
- [ ] Historical odds tracking
