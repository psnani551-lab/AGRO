import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with separate Vision Key if available
const apiKey = process.env.GEMINI_VISION_API_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const { image, sensorMoisture, satelliteNdvi, cropName } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Initialize Gemini 3.0 Flash (Latest generation model)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an expert Agronomist. Analyze this photo of a farm field (Soil and Crop).
      Current Digital Data:
      - Sensor Moisture: ${sensorMoisture}%
      - Satellite NDVI: ${satelliteNdvi}
      - Crop: ${cropName}

      TASK:
      1. Inspect soil texture, color, and signs of moisture (cracks, dampness, dust).
      2. Identify if the visual state MATCHES the digital data.
      3. Provide a brief, farmer-friendly "Visual Reality Check" that explains what the photo shows in simple terms. Use local Indian context if appropriate (e.g., mention specific soil types like Black Cotton soil or Alluvial if detected).
      4. Suggest 3 specific, actionable steps to IMPROVE CROP YIELD based on the visual and digital data.
      5. Rate the confidence of your assessment (1-100).

      Return ONLY a JSON object:
      {
        "visualStatus": "Excellent" | "Good" | "Stable" | "Warning" | "Critical",
        "matchesDigitalData": true | false,
        "farmerFriendlyInsights": "A clear, simple 2-sentence explanation of what you see in the photo compared to the data.",
        "yieldSuggestions": [
          { "title": "Succinct title", "action": "Specific instruction for the farmer", "impact": "High" | "Medium" | "Low" }
        ],
        "confidence": number,
        "soilHealth": "Short description of soil state",
        "cropHealth": "Short description of crop state"
      }
    `;

    // Convert base64 to parts for Gemini
    const imageData = image.split(',')[1];
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanText));

  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze ground reality' }, { status: 500 });
  }
}
