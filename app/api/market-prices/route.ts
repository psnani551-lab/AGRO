import { NextRequest, NextResponse } from 'next/server';
import { getMarketPrice, getAllMarketPrices, getPriceComparison, calculateProfitability } from '@/lib/marketPriceDatabase';
import { getMarketPricesWithAPI, getAPIStatus } from '@/lib/agmarknetAPI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yieldKg, landHectares, action } = body;
    // Normalize cropId to ensure case-insensitive matching (e.g. 'Rice' -> 'rice')
    const cropId = body.cropId ? body.cropId.toLowerCase() : null;

    // Action: Get single crop price
    if (action === 'single' && cropId) {
      // Try to get real-time API data first
      let priceData;
      let reliability = 90;
      let dataSource = 'Database (Static)';

      try {
        const apiResult = await getMarketPricesWithAPI(cropId);

        if (apiResult.source === 'api') {
          // Use API data
          const dbData = getMarketPrice(cropId);
          if (dbData) {
            priceData = {
              ...dbData,
              currentPrice: apiResult.currentPrice,
              marketInfo: {
                ...dbData.marketInfo,
                majorMarkets: apiResult.markets.length > 0 ? apiResult.markets : dbData.marketInfo.majorMarkets,
              },
            };
            reliability = apiResult.reliability;
            dataSource = 'AGMARKNET API (Real-time)';
          }
        } else {
          // Fallback to database
          priceData = getMarketPrice(cropId);
          dataSource = 'Database (Static)';
        }
      } catch (error) {
        // Fallback to database on error
        priceData = getMarketPrice(cropId);
        dataSource = 'Database (Static)';
      }

      if (!priceData) {
        return NextResponse.json(
          { error: 'Crop not found in market database' },
          { status: 404 }
        );
      }

      // Calculate profitability if yield provided
      let profitability = null;
      if (yieldKg) {
        profitability = calculateProfitability(cropId, yieldKg, landHectares || 1);
      }

      return NextResponse.json({
        success: true,
        data: priceData,
        profitability,
        reliability,
        dataSource,
        lastUpdated: priceData.currentPrice.lastUpdated,
      });
    }

    // Action: Get all prices
    if (action === 'all') {
      const allPrices = getAllMarketPrices();

      return NextResponse.json({
        success: true,
        data: allPrices,
        count: allPrices.length,
        reliability: 90,
        dataSource: 'AGMARKNET, FAO, Market Reports',
      });
    }

    // Action: Compare multiple crops
    if (action === 'compare' && Array.isArray(cropId)) {
      const comparison = getPriceComparison(cropId);

      return NextResponse.json({
        success: true,
        data: comparison,
        reliability: 90,
        dataSource: 'AGMARKNET, FAO, Market Reports',
      });
    }

    // Action: Get regional market prices
    if (action === 'regional') {
      const { state, district } = body;
      // In a real scenario, we might default to a state if not provided
      // For now, we'll try to fetch with whatever location data we have

      // If no API key or failure, we might want fallback data.
      // Importing fetchAgmarknetPrices dynamically or ensuring it's available
      const { fetchAgmarknetPrices } = await import('@/lib/agmarknetAPI'); // Ensure import

      const apiResult = await fetchAgmarknetPrices(undefined, { state, district });

      // If API fails or returns empty (e.g. no key), fallback to 'all' database prices but maybe filtered mock data?
      // precise fallback is hard without a large DB. Let's return what we have or "all" mock data.
      if (!apiResult.success || apiResult.data.length === 0) {
        // Fallback: Return known crops from the database to simulate a market connection
        // In a real app, this would query a secondary reliable DB. 
        // Here we return our high-quality static data effectively.
        const allPrices = getAllMarketPrices();
        // Filter or map to match the regional format if needed, but for now sending raw DB data is safer than random mocks.
        // We enhance it with the requested location to make it feel localized (Simulation).
        const simulatedRegionalData = [
          ...allPrices.slice(0, 5).map(p => ({
            commodity: p.cropName,
            variety: p.grades[0]?.grade || 'Standard',
            min_price: p.currentPrice.min,
            max_price: p.currentPrice.max,
            modal_price: p.currentPrice.modal,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Central Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          })),
          // Add Piece-rate items for demonstration (Coconut, Cauliflower)
          {
            commodity: 'Coconut',
            variety: 'Large',
            min_price: 2500, // per quintal (~25 rs/kg -> ~12 rs/pc)
            max_price: 3500,
            modal_price: 3000,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Coastal Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Cauliflower',
            variety: 'Snowball',
            min_price: 1500, // per quintal (~15 rs/kg -> ~10 rs/pc)
            max_price: 2500,
            modal_price: 2000,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Bottle Gourd',
            variety: 'Long',
            min_price: 1000,
            max_price: 1800,
            modal_price: 1400,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Bitter Gourd',
            variety: 'Desi',
            min_price: 2500,
            max_price: 3500,
            modal_price: 3000,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Pumpkin',
            variety: 'Orange',
            min_price: 800,
            max_price: 1200,
            modal_price: 1000,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Ridge Gourd',
            variety: 'Local',
            min_price: 1800,
            max_price: 2400,
            modal_price: 2100,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Radish',
            variety: 'White',
            min_price: 600,
            max_price: 1000,
            modal_price: 800,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Cucumber',
            variety: 'Desi',
            min_price: 1200,
            max_price: 1800,
            modal_price: 1500,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Local Veg Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          },
          {
            commodity: 'Sweet Corn',
            variety: 'Sugar 75',
            min_price: 1500,
            max_price: 2200,
            modal_price: 1800,
            market: (district && district !== 'India') ? `${district} Mandi` : 'Farmers Market',
            district: district,
            state: state,
            arrival_date: new Date().toISOString().split('T')[0]
          }
        ];

        return NextResponse.json({
          success: true,
          data: simulatedRegionalData,
          source: 'Agri-Database (Simulated Regional)',
          reliability: 85
        });
      }

      return NextResponse.json({
        success: true,
        data: apiResult.data,
        source: 'AGMARKNET API (Regional)',
        reliability: 95
      });
    }

    // Default: Return error
    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Market Prices API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market prices' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get('crop');

    if (cropId) {
      const priceData = getMarketPrice(cropId);

      if (!priceData) {
        return NextResponse.json(
          { error: 'Crop not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: priceData,
        reliability: 90,
      });
    }

    // Return all prices if no crop specified
    const allPrices = getAllMarketPrices();

    return NextResponse.json({
      success: true,
      data: allPrices,
      count: allPrices.length,
      reliability: 90,
    });

  } catch (error) {
    console.error('Market Prices API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market prices' },
      { status: 500 }
    );
  }
}
