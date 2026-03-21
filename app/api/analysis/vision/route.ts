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
      3. Provide a "Visual Reasoning" sentence to build trust with the farmer.
      4. Rate the confidence of your visual assessment (1-100).

      Return ONLY a JSON object:
      {
        "visualStatus": "Dry" | "Moist" | "Wet" | "Critical",
        "matchesDigitalData": true | false,
        "reasoning": "string",
        "confidence": number,
        "observations": ["crack detection", "discoloration", "foliage health"]
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
