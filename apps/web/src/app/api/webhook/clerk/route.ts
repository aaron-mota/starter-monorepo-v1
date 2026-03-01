import { NextResponse } from 'next/server';
import { getDb } from '@starter/db';
import { ObjectId } from 'mongodb';
import { Webhook } from 'svix';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Verify webhook signature
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const bodyText = await req.text();

  let payload: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(bodyText, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof payload;
  } catch (err) {
    console.error('Clerk webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const { type, data } = payload;

    if (type === 'user.created') {
      const db = await getDb();

      // Idempotency: check if user already exists
      const existingUser = await db.collection('User').findOne({ clerkId: data.id });
      if (existingUser) {
        return NextResponse.json({ ok: true, message: 'User already exists' });
      }

      const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined;
      const userId = new ObjectId();
      const subscriptionUserId = new ObjectId();

      // Create User document
      const userDoc = {
        _id: userId,
        clerkId: data.id,
        email: emailAddresses?.[0]?.email_address ?? '',
        first: (data.first_name as string) ?? '',
        last: (data.last_name as string) ?? '',
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || '',
        imageUrl: (data.image_url as string) ?? '',
        plan: 'free' as const,
        subscriptionUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create SubscriptionUser document
      const subscriptionUserDoc = {
        _id: subscriptionUserId,
        userId,
        tier: 'free' as const,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('User').insertOne(userDoc);
      await db.collection('SubscriptionUser').insertOne(subscriptionUserDoc);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
