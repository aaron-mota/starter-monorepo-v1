import { NextResponse } from 'next/server';
import { ensureSubscriptionUser } from '../_lib/ensure-subscription-user';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@starter/db';
import { getStripe } from '@/lib/services/stripe/stripe';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = (await req.json()) as { priceId: string };
    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection('User').findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = await ensureSubscriptionUser(db, user);

    // If no Stripe customer exists, create one
    let stripeCustomerId = subscription.stripeCustomerId as string | null;
    if (!stripeCustomerId) {
      const customer = await getStripe().customers.create({
        email: user.email as string,
        metadata: { userId: user._id.toHexString(), clerkId },
      });
      stripeCustomerId = customer.id;
      await db
        .collection('SubscriptionUser')
        .updateOne({ _id: subscription._id }, { $set: { stripeCustomerId, updatedAt: new Date() } });
    }

    const session = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
