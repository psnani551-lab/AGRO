import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, language_code } = await req.json();

    if (!text) {
        return NextResponse.json({ error: "No text provided for synthesis" }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    if (!sarvamApiKey) {
        // Mock TTS output if no key is provided
        console.warn("⚠️ No SARVAM_API_KEY found. Running in MOCK TTS mode.");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Return a tiny silent placeholder base64 audio or just an error asking to add the key
        // We'll throw an error so the UI handles it gracefully instead of playing white noise.
        return NextResponse.json({ error: "Sarvam API Key missing. Mock TTS requires a real key to generate audio." }, { status: 501 });
    }

    // Sarvam's unified TTS pipeline uses 'meera' as the universal female voice across all Indic languages.
    // Providing unknown speaker IDs (like 'pallavi') strictly causes 400 Bad Requests.
    const targetLangCode = language_code || 'hi-IN';

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey,
      },
      body: JSON.stringify({
        inputs: [text.substring(0, 500)],
        target_language_code: targetLangCode,
        speaker: 'meera',
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 8000,
        enable_preprocessing: true
        // model: Omitted. Sarvam auto-detects the latest model version for new Developer Keys
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Sarvam TTS Exception:", errText);
        // We pass the RAW error text to the frontend so we don't guess what went wrong.
        return NextResponse.json({ error: `API ${response.status}: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Extracted payload contains base64 string
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
        throw new Error("No audio returned from Sarvam");
    }

    return NextResponse.json({ audioBase64 });

  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
