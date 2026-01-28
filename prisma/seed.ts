import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@polymarket.com' },
    update: {},
    create: {
      email: 'demo@polymarket.com',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      tier: 'pro',
    },
  });

  console.log('✅ Created demo user:', user.id);

  // Create sample bets
  const bets = [
    {
      userId: user.id,
      market: 'Will Bitcoin hit $110,000 before Feb 1?',
      type: 'crypto',
      position: 'NO',
      amount: 200,
      shares: 400,
      entryOdds: 0.35,
      asset: 'BTC',
      threshold: 110000,
      thresholdUnit: 'USD',
      resolveDate: new Date('2026-02-01'),
      category: 'Crypto',
      dataSource: 'coingecko',
    },
    {
      userId: user.id,
      market: 'Will Ethereum reach $5,000 by March 2026?',
      type: 'crypto',
      position: 'YES',
      amount: 150,
      shares: 300,
      entryOdds: 0.45,
      asset: 'ETH',
      threshold: 5000,
      thresholdUnit: 'USD',
      resolveDate: new Date('2026-03-01'),
      category: 'Crypto',
      dataSource: 'coingecko',
    },
    {
      userId: user.id,
      market: 'Will GOOGL close above $330 on Jan 30?',
      type: 'stock',
      position: 'YES',
      amount: 100,
      shares: 200,
      entryOdds: 0.52,
      asset: 'GOOGL',
      threshold: 330,
      thresholdUnit: 'USD',
      resolveDate: new Date('2026-01-30'),
      category: 'Stocks',
      dataSource: 'yahoo',
    },
    {
      userId: user.id,
      market: 'Will NYC temperature be above 40°F on Jan 28?',
      type: 'weather',
      position: 'YES',
      amount: 50,
      shares: 100,
      entryOdds: 0.65,
      asset: 'NYC',
      threshold: 40,
      thresholdUnit: 'F',
      resolveDate: new Date('2026-01-28'),
      category: 'Weather',
      dataSource: 'open-meteo',
    },
    {
      userId: user.id,
      market: 'Will Tesla stock exceed $400 by Feb 15?',
      type: 'stock',
      position: 'NO',
      amount: 75,
      shares: 150,
      entryOdds: 0.40,
      asset: 'TSLA',
      threshold: 400,
      thresholdUnit: 'USD',
      resolveDate: new Date('2026-02-15'),
      category: 'Stocks',
      dataSource: 'yahoo',
    },
    {
      userId: user.id,
      market: 'Will Solana reach $300 before April 2026?',
      type: 'crypto',
      position: 'YES',
      amount: 120,
      shares: 240,
      entryOdds: 0.30,
      asset: 'SOL',
      threshold: 300,
      thresholdUnit: 'USD',
      resolveDate: new Date('2026-04-01'),
      category: 'Crypto',
      dataSource: 'coingecko',
    },
  ];

  for (const bet of bets) {
    await prisma.bet.create({ data: bet });
  }

  console.log(`✅ Created ${bets.length} sample bets`);

  // Initialize API usage tracking
  const apiServices = [
    { service: 'coingecko', endpoint: 'prices' },
    { service: 'binance', endpoint: 'prices' },
    { service: 'open-meteo', endpoint: 'forecast' },
    { service: 'openweather', endpoint: 'weather' },
    { service: 'yahoo', endpoint: 'quote' },
    { service: 'finnhub', endpoint: 'quote' },
  ];

  for (const api of apiServices) {
    await prisma.apiUsage.upsert({
      where: { service_endpoint: { service: api.service, endpoint: api.endpoint } },
      update: {},
      create: {
        service: api.service,
        endpoint: api.endpoint,
        callsToday: 0,
        lastReset: new Date(),
      },
    });
  }

  console.log('✅ Initialized API usage tracking');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
