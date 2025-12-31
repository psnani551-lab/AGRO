import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getScientificWeatherData } from '@/lib/weatherSimulation';
import { getMarketPrice } from '@/lib/marketPriceDatabase';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  pageContext: z.string().min(1).max(100),
  locale: z.enum(['en', 'hi', 'te', 'mr', 'ta']).optional(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  farmProfile: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { message, pageContext, locale, location, farmProfile } = validation.data;

    // --- 1. GATHER CONTEXT DATA ---
    const getSafeLocationString = (loc: any) => {
      if (!loc) return 'Unknown Location';
      if (typeof loc === 'string') return loc;
      if (typeof loc === 'object') {
        if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
          return `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`;
        }
        return 'Custom Coordinates';
      }
      return 'Unknown Location';
    };

    let contextData = {
      weather: null as any,
      market: null as any,
      crop: farmProfile?.crop || 'Unknown Crop',
      soil: farmProfile?.soilType || 'Unknown Soil',
      locationName: getSafeLocationString(farmProfile?.location)
    };

    // A. Weather Context
    if (farmProfile?.location) {
      // Use the simulation logic available on server
      try {
        const locationStr = typeof farmProfile.location === 'string'
          ? farmProfile.location
          : JSON.stringify(farmProfile.location);

        const simulatedWeather = getScientificWeatherData(locationStr);
        contextData.weather = simulatedWeather;
      } catch (e) {
        console.error("Failed to fetch simulated weather for chat", e);
      }
    }

    // B. Market Context
    if (farmProfile?.crop) {
      try {
        const marketInfo = getMarketPrice(farmProfile.crop);
        contextData.market = marketInfo;
      } catch (e) {
        console.error("Failed to fetch market data for chat", e);
      }
    }

    // --- 2. PREPARE AI REQUEST ---
    const apiKey = process.env.GEMINI_API_KEY;

    // --- SYSTEM PROMPT CONSTRUCTION ---
    const systemPrompt = `
IDENTITY:
You are "Ceres", an advanced AI Agronomist and the soul of this AGRO Application. 
Your goal is to maximize the farmer's yield, profit, and sustainability.
You have access to the application's real-time data spine.

USER CONTEXT:
- Name/Farm: ${farmProfile?.name || 'Farmer'}
- Location: ${contextData.locationName}
- Crop: ${contextData.crop}
- Soil: ${contextData.soil}
- Irrigation Type: ${farmProfile?.irrigationType || 'Not set'}
- Farm Size: ${farmProfile?.size || 'Not set'} acres

LIVE APPLICATION DATA (Use this to answer):
1. WEATHER SIMULATION: 
   ${contextData.weather ? JSON.stringify(contextData.weather.current, null, 2) : 'Data unavailable'}
   (Season: ${contextData.weather?.season || 'Unknown'})

2. MARKET INTELLIGENCE:
   ${contextData.market ? JSON.stringify(contextData.market, null, 2) : 'Data unavailable'}

3. CURRENT PAGE: ${pageContext}

INSTRUCTIONS:
- Answer as "Ceres". Be professional, encouraging, and data-driven.
- If the user asks "How is my crop?", analyze the Weather + Market data above.
- If Weather Rain > 0, mention it.
- If Market Price is high, congratulate them.
- Provide actionable advice based on the Soil Type (${contextData.soil}).
- Keep responses concise (under 3-4 sentences unless detailed analysis is asked).
`;

    if (!apiKey) {
      return NextResponse.json({
        reply: `(Mock Ceres): I see you are growing ${contextData.crop} in ${contextData.locationName}. My diagnosis: The simulated weather shows ${contextData.weather?.current?.temp_c || 25}°C. Market price is ₹${contextData.market?.currentPrice?.modal || '---'}/quintal. \n\n*System Note: Real AI responses require an API Key.*`,
      });
    }

    // Real AI integration (Google Gemini API)
    try {
      // Use standard, reliable models
      // Use working model aliases (Verified via API)
      const models = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-2.0-flash'];
      let lastError = null;
      let success = false;

      for (const model of models) {
        try {
          console.log(`[AskAPI] Trying Model: ${model}`);

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nUSER QUERY: ${message}` }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
            }),
          }
          );

          if (response.ok) {
            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) return NextResponse.json({ reply });
          }

          const errorText = await response.text();
          console.error(`[AskAPI] Model ${model} failed. Status: ${response.status}. Body: ${errorText}`);

          lastError = new Error(`Gemini ${model} Error ${response.status}: ${errorText}`);

          // If quota exceeded (429), try next model immediately.
          if (response.status === 429) continue;
        } catch (modelError) {
          console.error(`[AskAPI] Network error for ${model}:`, modelError);
          lastError = modelError;
          continue;
        }
      }

      throw lastError || new Error('All Gemini models failed to respond.');

    } catch (aiError: any) {
      console.error('AI API Error:', aiError);

      // FALLBACK TO MOCK RESPONSES IF AI FAILS (Graceful degradation)
      const mockReply = `(Offline Mode): I'm having trouble connecting to the AI brain right now. \n\nHowever, for **${contextData.crop}** in **${contextData.locationName}**, I can tell you that the simulated weather is **${contextData.weather?.current?.condition?.text || 'Standard'}** with a temp of **${contextData.weather?.current?.temp_c || 25}°C**.`;

      return NextResponse.json({ reply: mockReply });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
