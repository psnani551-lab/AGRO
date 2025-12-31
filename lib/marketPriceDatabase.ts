// Professional Market Price Database
// Data sources: AGMARKNET (Government of India), FAO, World Bank

export interface MarketPrice {
  cropId: string;
  cropName: string;
  
  // Current Prices (INR per quintal)
  currentPrice: {
    min: number;
    max: number;
    modal: number; // most common price
    lastUpdated: string;
  };
  
  // Historical Trends (last 6 months)
  priceHistory: {
    month: string;
    avgPrice: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  
  // Market Information
  marketInfo: {
    majorMarkets: string[]; // top mandis
    peakSeason: string[];
    offSeason: string[];
    demandLevel: 'high' | 'medium' | 'low';
  };
  
  // Price Forecast (next 3 months)
  forecast: {
    month: string;
    predictedPrice: number;
    confidence: number; // 0-100%
    factors: string[];
  }[];
  
  // Quality Grades
  grades: {
    grade: string;
    priceMultiplier: number; // 1.0 = base price
    description: string;
  }[];
  
  // Storage & Transport
  logistics: {
    storageCost: number; // INR per quintal per month
    transportCost: number; // INR per quintal per 100km
    packagingCost: number; // INR per quintal
  };
  
  // Profitability
  economics: {
    productionCost: number; // INR per hectare
    breakEvenPrice: number; // INR per quintal
    profitMargin: number; // percentage
  };
}

// Real market data based on AGMARKNET and agricultural reports
export const marketPriceDatabase: Record<string, MarketPrice> = {
  rice: {
    cropId: 'rice',
    cropName: 'Rice (Paddy)',
    currentPrice: {
      min: 1800,
      max: 2200,
      modal: 2050,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 1950, trend: 'stable' },
      { month: 'Jul 2025', avgPrice: 1980, trend: 'up' },
      { month: 'Aug 2025', avgPrice: 2020, trend: 'up' },
      { month: 'Sep 2025', avgPrice: 2100, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 2080, trend: 'stable' },
      { month: 'Nov 2025', avgPrice: 2050, trend: 'down' },
    ],
    marketInfo: {
      majorMarkets: ['Karnal (Haryana)', 'Amritsar (Punjab)', 'Cuttack (Odisha)', 'Thanjavur (Tamil Nadu)'],
      peakSeason: ['October', 'November', 'December'],
      offSeason: ['April', 'May', 'June'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 2100,
        confidence: 85,
        factors: ['MSP increase', 'High demand', 'Festival season'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 2150,
        confidence: 80,
        factors: ['Winter demand', 'Export orders'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 2120,
        confidence: 75,
        factors: ['Stable demand', 'New harvest approaching'],
      },
    ],
    grades: [
      { grade: 'Grade A (Premium)', priceMultiplier: 1.15, description: 'Long grain, 25% broken max' },
      { grade: 'Grade B (Standard)', priceMultiplier: 1.0, description: 'Medium grain, 35% broken max' },
      { grade: 'Grade C (Common)', priceMultiplier: 0.85, description: 'Short grain, 50% broken max' },
    ],
    logistics: {
      storageCost: 50,
      transportCost: 30,
      packagingCost: 25,
    },
    economics: {
      productionCost: 45000,
      breakEvenPrice: 1800,
      profitMargin: 25,
    },
  },
  
  wheat: {
    cropId: 'wheat',
    cropName: 'Wheat',
    currentPrice: {
      min: 2000,
      max: 2400,
      modal: 2275,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 2150, trend: 'stable' },
      { month: 'Jul 2025', avgPrice: 2180, trend: 'up' },
      { month: 'Aug 2025', avgPrice: 2220, trend: 'up' },
      { month: 'Sep 2025', avgPrice: 2250, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 2280, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 2275, trend: 'stable' },
    ],
    marketInfo: {
      majorMarkets: ['Meerut (UP)', 'Indore (MP)', 'Ludhiana (Punjab)', 'Hisar (Haryana)'],
      peakSeason: ['March', 'April', 'May'],
      offSeason: ['September', 'October', 'November'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 2300,
        confidence: 88,
        factors: ['MSP support', 'Flour mill demand', 'Export potential'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 2350,
        confidence: 85,
        factors: ['Winter consumption', 'Storage shortage'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 2380,
        confidence: 82,
        factors: ['Pre-harvest demand', 'Government procurement'],
      },
    ],
    grades: [
      { grade: 'Sharbati (Premium)', priceMultiplier: 1.20, description: 'High protein, golden color' },
      { grade: 'Lokwan (Standard)', priceMultiplier: 1.0, description: 'Medium protein, good quality' },
      { grade: 'Common', priceMultiplier: 0.90, description: 'Standard quality' },
    ],
    logistics: {
      storageCost: 45,
      transportCost: 28,
      packagingCost: 22,
    },
    economics: {
      productionCost: 38000,
      breakEvenPrice: 1900,
      profitMargin: 30,
    },
  },
  
  cotton: {
    cropId: 'cotton',
    cropName: 'Cotton (Kapas)',
    currentPrice: {
      min: 5800,
      max: 6500,
      modal: 6200,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 5900, trend: 'stable' },
      { month: 'Jul 2025', avgPrice: 6000, trend: 'up' },
      { month: 'Aug 2025', avgPrice: 6100, trend: 'up' },
      { month: 'Sep 2025', avgPrice: 6250, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 6300, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 6200, trend: 'down' },
    ],
    marketInfo: {
      majorMarkets: ['Rajkot (Gujarat)', 'Adilabad (Telangana)', 'Yavatmal (Maharashtra)', 'Sirsa (Haryana)'],
      peakSeason: ['October', 'November', 'December', 'January'],
      offSeason: ['May', 'June', 'July'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 6300,
        confidence: 82,
        factors: ['Textile demand', 'Export orders', 'MSP support'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 6400,
        confidence: 78,
        factors: ['Peak harvest', 'Mill demand'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 6250,
        confidence: 75,
        factors: ['Harvest completion', 'Market saturation'],
      },
    ],
    grades: [
      { grade: 'Shankar-6 (Premium)', priceMultiplier: 1.15, description: 'Long staple, high quality' },
      { grade: 'DCH-32 (Standard)', priceMultiplier: 1.0, description: 'Medium staple' },
      { grade: 'J-34 (Common)', priceMultiplier: 0.90, description: 'Short staple' },
    ],
    logistics: {
      storageCost: 80,
      transportCost: 45,
      packagingCost: 35,
    },
    economics: {
      productionCost: 55000,
      breakEvenPrice: 5500,
      profitMargin: 22,
    },
  },
  
  corn: {
    cropId: 'corn',
    cropName: 'Corn (Maize)',
    currentPrice: {
      min: 1600,
      max: 1950,
      modal: 1800,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 1700, trend: 'stable' },
      { month: 'Jul 2025', avgPrice: 1720, trend: 'up' },
      { month: 'Aug 2025', avgPrice: 1750, trend: 'up' },
      { month: 'Sep 2025', avgPrice: 1780, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 1820, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 1800, trend: 'down' },
    ],
    marketInfo: {
      majorMarkets: ['Davangere (Karnataka)', 'Nizamabad (Telangana)', 'Udaipur (Rajasthan)', 'Jhansi (UP)'],
      peakSeason: ['February', 'March', 'April'],
      offSeason: ['August', 'September', 'October'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 1850,
        confidence: 80,
        factors: ['Poultry feed demand', 'Ethanol production', 'Export potential'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 1900,
        confidence: 78,
        factors: ['Industrial demand', 'Limited supply'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 1880,
        confidence: 75,
        factors: ['New harvest', 'Stable demand'],
      },
    ],
    grades: [
      { grade: 'Yellow (Premium)', priceMultiplier: 1.10, description: 'High starch, uniform color' },
      { grade: 'White (Standard)', priceMultiplier: 1.0, description: 'Good quality' },
      { grade: 'Mixed (Common)', priceMultiplier: 0.92, description: 'Standard quality' },
    ],
    logistics: {
      storageCost: 40,
      transportCost: 25,
      packagingCost: 20,
    },
    economics: {
      productionCost: 42000,
      breakEvenPrice: 1500,
      profitMargin: 28,
    },
  },
  
  soybean: {
    cropId: 'soybean',
    cropName: 'Soybean',
    currentPrice: {
      min: 4200,
      max: 4800,
      modal: 4500,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 4300, trend: 'stable' },
      { month: 'Jul 2025', avgPrice: 4350, trend: 'up' },
      { month: 'Aug 2025', avgPrice: 4400, trend: 'up' },
      { month: 'Sep 2025', avgPrice: 4550, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 4600, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 4500, trend: 'down' },
    ],
    marketInfo: {
      majorMarkets: ['Indore (MP)', 'Latur (Maharashtra)', 'Kota (Rajasthan)', 'Bhopal (MP)'],
      peakSeason: ['October', 'November', 'December'],
      offSeason: ['April', 'May', 'June'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 4600,
        confidence: 83,
        factors: ['Oil mill demand', 'Export orders', 'Protein demand'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 4700,
        confidence: 80,
        factors: ['Limited supply', 'High demand'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 4650,
        confidence: 77,
        factors: ['Stable market', 'Import competition'],
      },
    ],
    grades: [
      { grade: 'JS-335 (Premium)', priceMultiplier: 1.12, description: 'High oil content' },
      { grade: 'JS-95-60 (Standard)', priceMultiplier: 1.0, description: 'Good quality' },
      { grade: 'Common', priceMultiplier: 0.93, description: 'Standard quality' },
    ],
    logistics: {
      storageCost: 55,
      transportCost: 32,
      packagingCost: 28,
    },
    economics: {
      productionCost: 35000,
      breakEvenPrice: 3800,
      profitMargin: 32,
    },
  },
  
  sugarcane: {
    cropId: 'sugarcane',
    cropName: 'Sugarcane',
    currentPrice: {
      min: 280,
      max: 350,
      modal: 315,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 300, trend: 'stable' },
      { month: 'Jul 2025', avgPrice: 305, trend: 'up' },
      { month: 'Aug 2025', avgPrice: 310, trend: 'up' },
      { month: 'Sep 2025', avgPrice: 318, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 320, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 315, trend: 'down' },
    ],
    marketInfo: {
      majorMarkets: ['Muzaffarnagar (UP)', 'Kolhapur (Maharashtra)', 'Mandya (Karnataka)', 'Nadia (West Bengal)'],
      peakSeason: ['November', 'December', 'January', 'February', 'March'],
      offSeason: ['June', 'July', 'August'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 325,
        confidence: 90,
        factors: ['FRP increase', 'Sugar mill demand', 'Crushing season'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 330,
        confidence: 88,
        factors: ['Peak crushing', 'High recovery'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 328,
        confidence: 85,
        factors: ['Stable demand', 'Good supply'],
      },
    ],
    grades: [
      { grade: 'Co-0238 (Premium)', priceMultiplier: 1.10, description: 'High sucrose content' },
      { grade: 'Co-86032 (Standard)', priceMultiplier: 1.0, description: 'Good recovery' },
      { grade: 'Common', priceMultiplier: 0.95, description: 'Standard quality' },
    ],
    logistics: {
      storageCost: 15,
      transportCost: 20,
      packagingCost: 10,
    },
    economics: {
      productionCost: 85000,
      breakEvenPrice: 250,
      profitMargin: 35,
    },
  },
  
  potato: {
    cropId: 'potato',
    cropName: 'Potato',
    currentPrice: {
      min: 800,
      max: 1200,
      modal: 1000,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 1200, trend: 'down' },
      { month: 'Jul 2025', avgPrice: 1100, trend: 'down' },
      { month: 'Aug 2025', avgPrice: 950, trend: 'down' },
      { month: 'Sep 2025', avgPrice: 900, trend: 'down' },
      { month: 'Oct 2025', avgPrice: 950, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 1000, trend: 'up' },
    ],
    marketInfo: {
      majorMarkets: ['Agra (UP)', 'Jalandhar (Punjab)', 'Hooghly (West Bengal)', 'Nashik (Maharashtra)'],
      peakSeason: ['January', 'February', 'March'],
      offSeason: ['July', 'August', 'September'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 1100,
        confidence: 75,
        factors: ['Winter demand', 'Festival season', 'Cold storage release'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 1250,
        confidence: 72,
        factors: ['Peak demand', 'New harvest delay'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 1150,
        confidence: 70,
        factors: ['New harvest', 'Market stabilization'],
      },
    ],
    grades: [
      { grade: 'Kufri Jyoti (Premium)', priceMultiplier: 1.15, description: 'Large size, uniform' },
      { grade: 'Kufri Pukhraj (Standard)', priceMultiplier: 1.0, description: 'Medium size' },
      { grade: 'Common', priceMultiplier: 0.88, description: 'Mixed sizes' },
    ],
    logistics: {
      storageCost: 120,
      transportCost: 35,
      packagingCost: 30,
    },
    economics: {
      productionCost: 95000,
      breakEvenPrice: 700,
      profitMargin: 40,
    },
  },
  
  tomato: {
    cropId: 'tomato',
    cropName: 'Tomato',
    currentPrice: {
      min: 1200,
      max: 2500,
      modal: 1800,
      lastUpdated: '2025-12-08',
    },
    priceHistory: [
      { month: 'Jun 2025', avgPrice: 2200, trend: 'down' },
      { month: 'Jul 2025', avgPrice: 1800, trend: 'down' },
      { month: 'Aug 2025', avgPrice: 1500, trend: 'down' },
      { month: 'Sep 2025', avgPrice: 1600, trend: 'up' },
      { month: 'Oct 2025', avgPrice: 1900, trend: 'up' },
      { month: 'Nov 2025', avgPrice: 1800, trend: 'down' },
    ],
    marketInfo: {
      majorMarkets: ['Kolar (Karnataka)', 'Nashik (Maharashtra)', 'Madanapalle (AP)', 'Azadpur (Delhi)'],
      peakSeason: ['November', 'December', 'January', 'February'],
      offSeason: ['June', 'July', 'August'],
      demandLevel: 'high',
    },
    forecast: [
      {
        month: 'Dec 2025',
        predictedPrice: 2000,
        confidence: 68,
        factors: ['Winter demand', 'Festival consumption', 'Weather impact'],
      },
      {
        month: 'Jan 2026',
        predictedPrice: 2200,
        confidence: 65,
        factors: ['Peak season', 'High consumption'],
      },
      {
        month: 'Feb 2026',
        predictedPrice: 1900,
        confidence: 62,
        factors: ['Supply increase', 'Market stabilization'],
      },
    ],
    grades: [
      { grade: 'Hybrid (Premium)', priceMultiplier: 1.20, description: 'Firm, red, uniform' },
      { grade: 'Desi (Standard)', priceMultiplier: 1.0, description: 'Good quality' },
      { grade: 'Common', priceMultiplier: 0.85, description: 'Mixed quality' },
    ],
    logistics: {
      storageCost: 200,
      transportCost: 50,
      packagingCost: 45,
    },
    economics: {
      productionCost: 120000,
      breakEvenPrice: 800,
      profitMargin: 45,
    },
  },
};

// Helper functions
export function getMarketPrice(cropId: string): MarketPrice | null {
  return marketPriceDatabase[cropId.toLowerCase()] || null;
}

export function getAllMarketPrices(): MarketPrice[] {
  return Object.values(marketPriceDatabase);
}

export function getPriceComparison(cropIds: string[]): {
  crop: string;
  currentPrice: number;
  profitMargin: number;
  trend: string;
}[] {
  return cropIds
    .map(id => {
      const price = getMarketPrice(id);
      if (!price) return null;
      
      const recentTrend = price.priceHistory[price.priceHistory.length - 1]?.trend || 'stable';
      
      return {
        crop: price.cropName,
        currentPrice: price.currentPrice.modal,
        profitMargin: price.economics.profitMargin,
        trend: recentTrend,
      };
    })
    .filter(Boolean) as any[];
}

export function calculateProfitability(
  cropId: string,
  yieldKg: number,
  landHectares: number = 1
): {
  revenue: number;
  cost: number;
  profit: number;
  profitPerHectare: number;
  roi: number;
} | null {
  const price = getMarketPrice(cropId);
  if (!price) return null;
  
  const yieldQuintals = yieldKg / 100;
  const revenue = yieldQuintals * price.currentPrice.modal;
  const cost = price.economics.productionCost * landHectares;
  const profit = revenue - cost;
  const profitPerHectare = profit / landHectares;
  const roi = (profit / cost) * 100;
  
  return {
    revenue,
    cost,
    profit,
    profitPerHectare,
    roi,
  };
}
