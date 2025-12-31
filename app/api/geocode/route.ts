
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing latitude or longitude' }, { status: 400 });
    }

    if (!apiKey) {
        return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
    }

    try {
        const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`OpenWeatherMap API error: ${res.statusText}`);
        }

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            const place = data[0];
            const city = place.name;
            const state = place.state || '';
            const country = place.country;

            // Format: "City, State, Country"
            const address = [city, state, country].filter(Boolean).join(', ');

            return NextResponse.json({ address });
        } else {
            return NextResponse.json({ error: 'No location found for these coordinates' }, { status: 404 });
        }

    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
    }
}
