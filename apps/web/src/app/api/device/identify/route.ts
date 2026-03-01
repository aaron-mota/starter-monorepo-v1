import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const deviceId = req.cookies.get('starter-device-id')?.value ?? null;
  return NextResponse.json({ deviceId });
}
