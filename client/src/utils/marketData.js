/**
 * Market data utilities for the dashboard
 * Contains consistent data for market indices and chart visualization
 */

// Seeded random number generator for consistent chart data
class SeededRandom {
  constructor(seed = 42) {
    this.seed = seed;
  }
  
  // Simple LCG random number generator
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Get random number in a range
  nextRange(min, max) {
    return min + this.next() * (max - min);
  }
}

// Generate 1-day intraday data points for a market index (9:15 AM to 3:30 PM) with consistent patterns
export const generateIndexDayData = (baseValue, volatility, trend = 'neutral', seed = 42) => {
  const data = [];
  // Trading hours: 9:15 AM to 3:30 PM
  const startHour = 9;
  const startMin = 15;
  const endHour = 15;
  const endMin = 30;
  
  // Use seeded random for consistency
  const random = new SeededRandom(seed);
  
  // Generate data points for every 5 minutes
  let currentValue = baseValue;
  
  // Adjust trend factor based on trend direction
  let trendFactor = 1;
  if (trend === 'bullish') trendFactor = 1.5;
  if (trend === 'bearish') trendFactor = 0.5;
  
  // Calculate total minutes in trading day
  const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  const intervals = totalMinutes / 5; // 5-minute intervals
  
  // Create realistic market patterns
  // Morning session (9:15 AM - 11:30 AM): Higher volatility as market reacts to overnight news
  // Mid-day session (11:30 AM - 1:30 PM): Lower volatility, sideways movement
  // Closing session (1:30 PM - 3:30 PM): Higher volatility as traders close positions
  
  for (let i = 0; i <= intervals; i++) {
    const minutes = i * 5;
    const hour = Math.floor((startHour * 60 + startMin + minutes) / 60);
    const minute = (startMin + minutes) % 60;
    
    // Format time as HH:MM
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Determine session volatility multiplier
    let sessionVolatility = 1.0;
    const totalMinutesElapsed = (hour * 60 + minute) - (startHour * 60 + startMin);
    
    if (totalMinutesElapsed < 135) { // Morning session (first 2:15 hours)
      sessionVolatility = 1.2;
    } else if (totalMinutesElapsed < 255) { // Mid-day session (next 2 hours)
      sessionVolatility = 0.7;
    } else { // Closing session (remaining time)
      sessionVolatility = 1.3;
    }
    
    // Apply trend pattern - more natural movement
    let trendComponent;
    
    // Market pattern based on time of day
    if (trend === 'bullish') {
      // Bullish: Starts positive, little dip mid-day, strong close
      if (totalMinutesElapsed < 120) {
        trendComponent = (totalMinutesElapsed / 120) * volatility * 0.5;
      } else if (totalMinutesElapsed < 240) {
        trendComponent = ((240 - totalMinutesElapsed) / 120) * volatility * 0.3 * -1; 
      } else {
        trendComponent = ((totalMinutesElapsed - 240) / 80) * volatility * 0.8;
      }
    } else if (trend === 'bearish') {
      // Bearish: Starts with selling, small rebound mid-day, further selling into close
      if (totalMinutesElapsed < 120) {
        trendComponent = (totalMinutesElapsed / 120) * volatility * -0.6;
      } else if (totalMinutesElapsed < 240) {
        trendComponent = ((totalMinutesElapsed - 120) / 120) * volatility * 0.4;
      } else {
        trendComponent = ((totalMinutesElapsed - 240) / 80) * volatility * -0.7;
      }
    } else { // neutral
      // Neutral: Small movements around the base value
      const phase = (totalMinutesElapsed / totalMinutes) * Math.PI * 2; 
      trendComponent = Math.sin(phase) * volatility * 0.3;
    }
    
    // Apply random noise within session volatility parameters
    const randomComponent = (random.next() - 0.5) * volatility * 0.2 * sessionVolatility;
    
    // Combine components for final price movement
    currentValue += trendComponent + randomComponent;
    
    // Ensure value doesn't go below a reasonable floor
    if (currentValue < baseValue * 0.9) {
      currentValue = baseValue * 0.9 + random.next() * baseValue * 0.01;
    }
    
    // Add to data points
    data.push({
      time: timeString,
      value: parseFloat(currentValue.toFixed(2))
    });
  }
  
  return data;
};

// Index data with base values and volatility
export const marketIndices = {
  nifty50: {
    id: 'nifty50',
    name: 'NIFTY 50',
    value: 22350.45, 
    change: 120.35, 
    percentChange: 0.54,
    high: 22400.20,
    low: 22250.10,
    open: 22280.30,
    prevClose: 22230.10,
    volume: '125.4M',
    baseValue: 22350,
    volatility: 30,
    trend: 'bullish',
    seed: 42,
    data: [] // Will be populated with generateIndexDayData
  },
  sensex: {
    id: 'sensex',
    name: 'SENSEX',
    value: 73100.20, 
    change: 380.75, 
    percentChange: 0.52,
    high: 73200.50,
    low: 72950.75,
    open: 73000.25,
    prevClose: 72719.45,
    volume: '85.7M',
    baseValue: 73100,
    volatility: 100,
    trend: 'bullish',
    seed: 91,
    data: []
  },
  niftyBank: {
    id: 'niftyBank',
    name: 'NIFTY BANK',
    value: 47250.30, 
    change: 220.45, 
    percentChange: 0.47,
    high: 47320.80,
    low: 47110.20,
    open: 47150.60,
    prevClose: 47029.85,
    volume: '45.2M',
    baseValue: 47250,
    volatility: 50,
    trend: 'neutral',
    seed: 123,
    data: []
  },
  midcapNifty: {
    id: 'midcapNifty',
    name: 'NIFTY MIDCAP',
    value: 12875.60,
    change: 95.30, 
    percentChange: 0.75,
    high: 12900.40,
    low: 12810.25,
    open: 12830.15,
    prevClose: 12780.30,
    volume: '32.8M',
    baseValue: 12875,
    volatility: 20,
    trend: 'bullish',
    seed: 56,
    data: []
  },
  niftyIT: {
    id: 'niftyIT',
    name: 'NIFTY IT',
    value: 34800.75,
    change: -150.25, 
    percentChange: -0.43,
    high: 34950.20,
    low: 34750.40,
    open: 34920.10,
    prevClose: 34951.00,
    volume: '18.5M',
    baseValue: 34800,
    volatility: 40,
    trend: 'bearish',
    seed: 78,
    data: []
  },
  bankex: {
    id: 'bankex',
    name: 'BANKEX',
    value: 51250.80,
    change: 275.45, 
    percentChange: 0.54,
    high: 51300.25,
    low: 51125.60,
    open: 51150.75,
    prevClose: 50975.35,
    volume: '28.3M',
    baseValue: 51250,
    volatility: 60,
    trend: 'bullish',
    seed: 103,
    data: []
  },
  niftyPharma: {
    id: 'niftyPharma',
    name: 'NIFTY PHARMA',
    value: 18450.40,
    change: -75.30, 
    percentChange: -0.41,
    high: 18525.70,
    low: 18400.20,
    open: 18510.45,
    prevClose: 18525.70,
    volume: '14.7M',
    baseValue: 18450,
    volatility: 25,
    trend: 'bearish',
    seed: 217,
    data: []
  },
  niftyAuto: {
    id: 'niftyAuto',
    name: 'NIFTY AUTO',
    value: 21325.60,
    change: 185.75, 
    percentChange: 0.88,
    high: 21350.25,
    low: 21240.30,
    open: 21260.80,
    prevClose: 21139.85,
    volume: '22.1M',
    baseValue: 21325,
    volatility: 30,
    trend: 'bullish',
    seed: 183,
    data: []
  }
};

// Generate consistent day data for all indices (only once)
// We now use the cached data property to store pre-generated data
let dataGenerated = false;
if (!dataGenerated) {
  Object.keys(marketIndices).forEach(key => {
    const index = marketIndices[key];
    index.data = generateIndexDayData(
      index.baseValue, 
      index.volatility, 
      index.trend, 
      index.seed
    );
  });
  dataGenerated = true;
}

// Get all market indices with their day data
export const getAllMarketIndices = () => {
  return Object.values(marketIndices);
};

// Get specific index data by ID
export const getMarketIndexById = (id) => {
  return marketIndices[id] || null;
};

// Get chart data for specific index
export const getChartDataForIndex = (indexId) => {
  const index = marketIndices[indexId];
  return index ? index.data : [];
};

// Export data for market movers (top gainers and losers)
export const marketMovers = {
  gainers: {
    large: [
      { symbol: 'BAJFINANCE', price: 7250.80, change: 298.35, percentChange: 4.29 },
      { symbol: 'TECHM', price: 1430.50, change: 48.75, percentChange: 3.53 },
      { symbol: 'HDFCBANK', price: 1675.30, change: 45.60, percentChange: 2.80 },
      { symbol: 'RELIANCE', price: 2950.75, change: 65.35, percentChange: 2.27 },
      { symbol: 'SBIN', price: 762.40, change: 15.80, percentChange: 2.12 }
    ],
    mid: [
      { symbol: 'FEDERALBNK', price: 152.80, change: 8.75, percentChange: 6.08 },
      { symbol: 'ABCAPITAL', price: 212.40, change: 10.35, percentChange: 5.12 },
      { symbol: 'TATACOMM', price: 1945.25, change: 85.75, percentChange: 4.61 },
      { symbol: 'CONCOR', price: 845.90, change: 32.25, percentChange: 3.96 },
      { symbol: 'LTTS', price: 5120.40, change: 187.65, percentChange: 3.80 }
    ],
    small: [
      { symbol: 'TEJASNET', price: 112.25, change: 10.75, percentChange: 10.60 },
      { symbol: 'OLECTRA', price: 1524.75, change: 138.60, percentChange: 10.00 },
      { symbol: 'RAILVIKAS', price: 178.50, change: 15.25, percentChange: 9.34 },
      { symbol: 'FIBERWEB', price: 42.75, change: 3.50, percentChange: 8.92 },
      { symbol: 'ORIENTELEC', price: 387.25, change: 28.40, percentChange: 7.92 }
    ]
  },
  losers: {
    large: [
      { symbol: 'INFY', price: 1450.25, change: -45.75, percentChange: -3.06 },
      { symbol: 'TCS', price: 3725.60, change: -85.40, percentChange: -2.24 },
      { symbol: 'WIPRO', price: 475.25, change: -8.50, percentChange: -1.76 },
      { symbol: 'DRREDDY', price: 7850.30, change: -125.65, percentChange: -1.57 },
      { symbol: 'HCLTECH', price: 1325.45, change: -18.70, percentChange: -1.39 }
    ],
    mid: [
      { symbol: 'PEL', price: 842.50, change: -34.75, percentChange: -3.96 },
      { symbol: 'NMDC', price: 224.80, change: -8.35, percentChange: -3.58 },
      { symbol: 'MPHASIS', price: 2350.75, change: -85.25, percentChange: -3.50 },
      { symbol: 'CROMPTON', price: 325.40, change: -10.75, percentChange: -3.20 },
      { symbol: 'JUBLFOOD', price: 585.60, change: -17.80, percentChange: -2.95 }
    ],
    small: [
      { symbol: 'OPTOCIRCUI', price: 285.75, change: -28.50, percentChange: -9.07 },
      { symbol: 'MAHASTEEL', price: 24.35, change: -2.15, percentChange: -8.12 },
      { symbol: 'KHAICHEM', price: 112.80, change: -9.45, percentChange: -7.73 },
      { symbol: 'SEQUENT', price: 76.50, change: -5.80, percentChange: -7.05 },
      { symbol: 'GESHIP', price: 840.25, change: -58.50, percentChange: -6.51 }
    ]
  }
};

// Export helper functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    notation: 'compact'
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number);
};
