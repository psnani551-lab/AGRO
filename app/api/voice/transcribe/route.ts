import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Call Sarvam API
    const sarvamApiKey = process.env.SARVAM_API_KEY;
    
    // Fallback/Mock Mode if API key is missing (for local dev testing before key is provided)
    if (!sarvamApiKey) {
      console.warn("⚠️ No SARVAM_API_KEY found. Running in MOCK STT mode.");
      // 2-second artificial latency
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json({ 
        transcript: "పంటకు ఎంత ఎరువు వేయాలి?", // "How much fertilizer for the crop?" in Telugu
        language_code: "te-IN" 
      });
    }

    const sarvamFormData = new FormData();
    sarvamFormData.append('file', audioFile);

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamApiKey,
      },
      body: sarvamFormData
    });

    if (!response.ok) {
        throw new Error(`Sarvam STT Failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract transcript and language_code
    return NextResponse.json({
      transcript: data.transcript || "Hello",
      language_code: data.language_code || "en-IN"
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
