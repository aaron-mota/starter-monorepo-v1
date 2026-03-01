import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@starter/db';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection('User').findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { endpoint, keys, notifyOnTagScan, notifyOnFamilyScan } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    await db.collection('PushSubscription').updateOne(
      { endpoint },
      {
        $set: {
          userId: user._id,
          endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
          notifyOnTagScan: notifyOnTagScan ?? true,
          notifyOnFamilyScan: notifyOnFamilyScan ?? false,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection('User').findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { endpoint, notifyOnTagScan, notifyOnFamilyScan } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof notifyOnTagScan === 'boolean') update.notifyOnTagScan = notifyOnTagScan;
    if (typeof notifyOnFamilyScan === 'boolean') update.notifyOnFamilyScan = notifyOnFamilyScan;

    await db.collection('PushSubscription').updateOne({ endpoint, userId: user._id }, { $set: update });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push subscribe PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
