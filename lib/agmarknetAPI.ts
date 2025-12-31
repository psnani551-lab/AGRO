// AGMARKNET API Integration for Real-Time Market Prices
// Government of India - Agricultural Marketing Information Network

export interface AgmarknetPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceDate: string;
}

export interface AgmarknetResponse {
  success: boolean;
  data: AgmarknetPrice[];
  source: 'api' | 'database';
  reliability: number;
  lastUpdated: string;
}

// Crop name mapping (our system → AGMARKNET)
const CROP_MAPPING: Record<string, string> = {
  rice: 'Rice',
  wheat: 'Wheat',
  cotton: 'Cotton',
  corn: 'Maize',
  soybean: 'Soybean',
  sugarcane: 'Sugarcane',
  potato: 'Potato',
  tomato: 'Tomato',
  paddy: 'Rice',
};

/**
 * Fetch real-time market prices from AGMARKNET API
 */
export async function fetchAgmarknetPrices(
  cropId?: string,
  location?: { state?: string; district?: string }
): Promise<AgmarknetResponse> {
  const apiKey = process.env.AGMARKNET_API_KEY || process.env.DATA_GOV_IN_API_KEY;

  // If no API key, return database fallback
  if (!apiKey || apiKey === 'demo') {
    console.log('No AGMARKNET API key found, using database prices');
    return {
      success: false,
      data: [],
      source: 'database',
      reliability: 90,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const commodity = cropId ? (CROP_MAPPING[cropId.toLowerCase()] || cropId) : undefined;

    // AGMARKNET API endpoint (via data.gov.in)
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`;
    const params = new URLSearchParams({
      'api-key': apiKey,
      'format': 'json',
      'limit': '100', // Increased limit for regional queries
    });

    if (commodity) {
      params.append('filters[commodity]', commodity);
    }

    if (location?.state) {
      params.append('filters[state]', location.state);
    }

    if (location?.district) {
      params.append('filters[district]', location.district);
    }

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    // Parse AGMARKNET response
    const prices: AgmarknetPrice[] = (result.records || []).map((record: any) => ({
      state: record.state || '',
      district: record.district || '',
      market: record.market || '',
      commodity: record.commodity || '',
      variety: record.variety || '',
      minPrice: parseFloat(record.min_price || record.arrival_price || '0'),
      maxPrice: parseFloat(record.max_price || record.arrival_price || '0'),
      modalPrice: parseFloat(record.modal_price || record.arrival_price || '0'),
      priceDate: record.price_date || record.arrival_date || new Date().toISOString().split('T')[0],
    }));

    return {
      success: true,
      data: prices,
      source: 'api',
      reliability: 98,
      lastUpdated: new Date().toISOString(),
    };

  } catch (error) {
    console.error('AGMARKNET API Error:', error);
    return {
      success: false,
      data: [],
      source: 'database',
      reliability: 90,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Calculate average prices from AGMARKNET data
 */
export function calculateAveragePrices(prices: AgmarknetPrice[]): {
  min: number;
  max: number;
  modal: number;
  markets: string[];
} {
  if (prices.length === 0) {
    return { min: 0, max: 0, modal: 0, markets: [] };
  }

  const minPrices = prices.map(p => p.minPrice).filter(p => p > 0);
  const maxPrices = prices.map(p => p.maxPrice).filter(p => p > 0);
  const modalPrices = prices.map(p => p.modalPrice).filter(p => p > 0);
  const markets = [...new Set(prices.map(p => `${p.market} (${p.state})`))];

  return {
    min: minPrices.length > 0 ? Math.min(...minPrices) : 0,
    max: maxPrices.length > 0 ? Math.max(...maxPrices) : 0,
    modal: modalPrices.length > 0
      ? Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length)
      : 0,
    markets: markets.slice(0, 5), // Top 5 markets
  };
}

/**
 * Get market prices with API fallback to database
 */
export async function getMarketPricesWithAPI(cropId: string): Promise<{
  currentPrice: {
    min: number;
    max: number;
    modal: number;
    lastUpdated: string;
  };
  markets: string[];
  source: 'api' | 'database';
  reliability: number;
}> {
  // Try API first
  const apiResult = await fetchAgmarknetPrices(cropId);

  if (apiResult.success && apiResult.data.length > 0) {
    const avgPrices = calculateAveragePrices(apiResult.data);

    return {
      currentPrice: {
        min: avgPrices.min,
        max: avgPrices.max,
        modal: avgPrices.modal,
        lastUpdated: apiResult.lastUpdated,
      },
      markets: avgPrices.markets,
      source: 'api',
      reliability: 98,
    };
  }

  // Fallback to database
  const { getMarketPrice } = await import('./marketPriceDatabase');
  const dbPrice = getMarketPrice(cropId);

  if (!dbPrice) {
    throw new Error('Crop not found in database');
  }

  return {
    currentPrice: dbPrice.currentPrice,
    markets: dbPrice.marketInfo.majorMarkets,
    source: 'database',
    reliability: 90,
  };
}

/**
 * Check if API key is configured
 */
export function isAPIConfigured(): boolean {
  const apiKey = process.env.AGMARKNET_API_KEY || process.env.DATA_GOV_IN_API_KEY;
  return !!(apiKey && apiKey !== 'demo');
}

/**
 * Get API status
 */
export function getAPIStatus(): {
  configured: boolean;
  source: string;
  reliability: number;
  message: string;
} {
  const configured = isAPIConfigured();

  if (configured) {
    return {
      configured: true,
      source: 'AGMARKNET API (Real-time)',
      reliability: 98,
      message: 'Using real-time market data from Government of India',
    };
  }

  return {
    configured: false,
    source: 'Database (Static)',
    reliability: 90,
    message: 'Add AGMARKNET_API_KEY to .env.local for real-time prices',
  };
}
