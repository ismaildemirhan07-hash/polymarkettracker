import { DistanceResult, PnLResult } from '../types';

export function calculateDistance(
  current: number,
  threshold: number,
  position: 'YES' | 'NO'
): DistanceResult {
  if (position === 'YES') {
    const distanceValue = current - threshold;
    const distancePercent = (distanceValue / threshold) * 100;
    return {
      distanceValue,
      distancePercent,
      isWinning: current > threshold,
    };
  } else {
    const distanceValue = threshold - current;
    const distancePercent = (distanceValue / threshold) * 100;
    return {
      distanceValue,
      distancePercent,
      isWinning: current < threshold,
    };
  }
}

export function calculatePnL(
  shares: number,
  currentOdds: number,
  invested: number
): PnLResult {
  const currentValue = shares * currentOdds;
  const unrealizedPnL = currentValue - invested;
  const potentialPayout = shares * 1;
  const roi = invested > 0 ? (unrealizedPnL / invested) * 100 : 0;

  return {
    currentValue,
    unrealizedPnL,
    potentialPayout,
    roi,
  };
}

export function determineStatus(
  current: number,
  threshold: number,
  position: 'YES' | 'NO'
): 'winning' | 'losing' {
  if (position === 'YES') {
    return current > threshold ? 'winning' : 'losing';
  } else {
    return current < threshold ? 'winning' : 'losing';
  }
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°F`;
}

export function calculateOddsFromProbability(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    return probability;
  }
  return probability;
}

export function calculateImpliedProbability(odds: number): number {
  return odds;
}

export function isMarketHours(): boolean {
  const now = new Date();
  const etOffset = -5;
  const utcHours = now.getUTCHours();
  const etHours = (utcHours + etOffset + 24) % 24;
  const day = now.getUTCDay();

  const isWeekday = day >= 1 && day <= 5;
  const isMarketOpen = etHours >= 9.5 && etHours < 16;

  return isWeekday && isMarketOpen;
}

export function getMarketStatus(): 'open' | 'closed' | 'pre-market' | 'after-hours' {
  const now = new Date();
  const etOffset = -5;
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const etTime = utcHours + etOffset + utcMinutes / 60;
  const etHours = ((etTime % 24) + 24) % 24;
  const day = now.getUTCDay();

  const isWeekday = day >= 1 && day <= 5;

  if (!isWeekday) {
    return 'closed';
  }

  if (etHours >= 4 && etHours < 9.5) {
    return 'pre-market';
  }

  if (etHours >= 9.5 && etHours < 16) {
    return 'open';
  }

  if (etHours >= 16 && etHours < 20) {
    return 'after-hours';
  }

  return 'closed';
}
