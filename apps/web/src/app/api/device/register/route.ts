import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { NextRequest } from 'next/server';

const bodySchema = z.object({
  deviceId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid deviceId' }, { status: 400 });
    }

    const { deviceId } = parsed.data;
    const TWO_YEARS_SECONDS = 2 * 365 * 24 * 60 * 60;

    const response = NextResponse.json({ ok: true });
    response.cookies.set('starter-device-id', deviceId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: TWO_YEARS_SECONDS,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
