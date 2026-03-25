import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Get IP from headers (works on Vercel and other proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || '127.0.0.1';
    
    return NextResponse.json({ ip });
}
