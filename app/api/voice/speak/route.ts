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

    // Default to meera (Hindi Female) or dynamically assign based on code
    let speaker = 'meera';
    const lang = (language_code || '').toLowerCase();
    if (lang.startsWith('te')) speaker = 'pallavi'; // Telugu
    if (lang.startsWith('ta')) speaker = 'anbhu';   // Tamil
    if (lang.startsWith('ml')) speaker = 'ammu';    // Malayalam
    if (lang.startsWith('mr')) speaker = 'swara';   // Marathi
    if (lang.startsWith('bn')) speaker = 'sushma';  // Bengali
    if (lang.startsWith('gu')) speaker = 'diya';    // Gujarati
    if (lang.startsWith('kn')) speaker = 'pavithra';// Kannada
    if (lang.startsWith('pa')) speaker = 'divjot';  // Punjabi
    if (lang.startsWith('or')) speaker = 'sujata';  // Odia
    if (lang.startsWith('en')) speaker = 'meera';   // Fallback to meera for English-Indic

    const targetLangCode = language_code || 'hi-IN';

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey,
      },
      body: JSON.stringify({
        inputs: [text.substring(0, 500)], // Sarvam allows up to 500 chars per input array item
        target_language_code: targetLangCode,
        speaker: speaker,
        pitch: 0,
        pace: 1.0,
        loudness: 1.2,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: 'indic-tts'
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Sarvam TTS Exception:", errText);
        throw new Error(`Sarvam TTS API Error: ${response.status}`);
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
