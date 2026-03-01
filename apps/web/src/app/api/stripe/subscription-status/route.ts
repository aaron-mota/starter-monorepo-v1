import { NextResponse } from 'next/server';
import { ensureSubscriptionUser } from '../_lib/ensure-subscription-user';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@starter/db';
import { getStripe } from '@/lib/services/stripe/stripe';

export async function GET() {
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

    const subscription = await ensureSubscriptionUser(db, user);

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json({ plan: 'free', subscription: null });
    }

    const stripeSubscription = await getStripe().subscriptions.retrieve(subscription.stripeSubscriptionId as string);

    const item = stripeSubscription.items.data[0];
    const price = item?.price;

    return NextResponse.json({
      plan: subscription.tier || 'free',
      subscription: {
        status: stripeSubscription.status,
        interval: price?.recurring?.interval ?? null,
        amount: price?.unit_amount ? price.unit_amount / 100 : null,
        currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
