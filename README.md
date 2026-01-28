# Polymarket Tracker - Full Stack Application

A unified full-stack application for tracking Polymarket bets with real-time crypto, weather, and stock data.

## Features

### Backend API
- **Crypto Prices**: Real-time data from CoinGecko (primary) and Binance (fallback)
- **Weather Data**: Open-Meteo (free, no API key) with OpenWeather fallback
- **Stock Quotes**: Yahoo Finance (primary) with Finnhub fallback
- **Bet Management**: Create, track, and analyze betting positions
- **Real-time Updates**: WebSocket support for live price updates
- **Smart Caching**: Redis-based caching with intelligent TTL
- **Rate Limiting**: Built-in API rate limit tracking

### Frontend
- Modern React UI with TypeScript
- TailwindCSS + shadcn/ui components
- Real-time data visualization with Recharts
- Responsive design
- Dark/Light theme support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js + Vite
- **Frontend**: React 19, TypeScript, TailwindCSS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (with in-memory fallback)
- **WebSocket**: Socket.io
- **Validation**: Zod

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (optional, has in-memory fallback)

### Installation

```bash
# Clone the repository
git clone https://github.com/ismaildemirhan07-hash/polymarkettracker.git
cd polymarkettracker

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/polymarket_tracker

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed sample data (optional)
npm run prisma:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

```bash
# Application
NODE_ENV=development
PORT=5000

# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/polymarket_tracker

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# API Keys (all optional - free tiers available)
FINNHUB_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here

# Cache & Rate Limits
CRYPTO_CACHE_TTL=60
WEATHER_CACHE_TTL=300
STOCK_CACHE_TTL=60
ENABLE_WEBSOCKET=true
```

## API Endpoints

All API endpoints are prefixed with `/api`

### Crypto
- `GET /api/crypto/prices?symbols=BTC,ETH` - Get multiple crypto prices
- `GET /api/crypto/price/:symbol` - Get single crypto price
- `GET /api/crypto/history/:symbol?days=7` - Get price history
- `GET /api/crypto/supported` - Get supported cryptocurrencies

### Weather
- `GET /api/weather/current?city=New York` - Get current weather
- `GET /api/weather/forecast?city=New York&hours=24` - Get forecast
- `GET /api/weather/cities` - Get supported cities

### Stocks
- `GET /api/stocks/quote?symbols=GOOGL,AAPL` - Get stock quotes
- `GET /api/stocks/quote/:symbol` - Get single stock quote
- `GET /api/stocks/history/:symbol?days=7` - Get stock history
- `GET /api/stocks/market-status` - Get market status

### Bets
- `GET /api/bets` - List all bets
- `GET /api/bets/:id` - Get bet by ID
- `POST /api/bets` - Create new bet
- `PUT /api/bets/:id` - Update bet
- `DELETE /api/bets/:id` - Delete bet
- `GET /api/bets/:id/status` - Get bet status with current data

### Analytics
- `GET /api/analytics/portfolio` - Portfolio overview
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/api-usage` - API usage statistics

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run check            # Type check
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed sample data
```

## Project Structure

```
polymarkettracker/
├── client/                 # React frontend
│   └── src/
│       ├── components/    # UI components
│       ├── pages/        # Page components
│       └── lib/          # Utilities
├── server/                # Express backend
│   ├── api-routes/       # API route handlers
│   ├── services/         # Business logic & API integrations
│   ├── middleware/       # Express middleware
│   ├── config/          # Configuration files
│   ├── utils-api/       # Helper functions
│   ├── types/           # TypeScript types
│   └── websocket/       # WebSocket server
├── prisma/               # Database schema & migrations
├── shared/               # Shared types/utilities
└── package.json
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive DigitalOcean VPS deployment instructions.

### Production Build

```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Health Check

Access the health endpoint to verify the application is running:

```
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-29T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

## WebSocket Events

Connect to WebSocket at `ws://localhost:5000`

Events:
- `crypto:update` - Real-time crypto price updates
- `stock:update` - Real-time stock price updates
- `bet:status` - Bet status changes

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-01-29T00:00:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
