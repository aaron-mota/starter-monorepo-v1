import { NextResponse } from 'next/server';
import { ensureSubscriptionUser } from '../_lib/ensure-subscription-user';
import { getDb } from '@app/db';
import { auth } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/services/stripe/stripe';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, priceId } = (await req.json()) as {
      action: 'cancel' | 'switch';
      priceId?: string;
    };

    const db = await getDb();
    const user = await db.collection('User').findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = await ensureSubscriptionUser(db, user);

    // Cancel (downgrade to free)
    if (action === 'cancel') {
      if (subscription.stripeSubscriptionId) {
        await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId as string);
      }
      await db.collection('SubscriptionUser').updateOne(
        { _id: subscription._id },
        {
          $set: {
            tier: 'free',
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          },
        }
      );
      await db.collection('User').updateOne({ _id: user._id }, { $set: { plan: 'free', updatedAt: new Date() } });
      return NextResponse.json({ message: 'Subscription canceled.' });
    }

    // Switch interval (monthly ↔ annual)
    if (action === 'switch' && priceId) {
      if (!subscription.stripeSubscriptionId) {
        return NextResponse.json({ error: 'No active subscription to switch' }, { status: 400 });
      }

      const stripeSubscription = await getStripe().subscriptions.retrieve(subscription.stripeSubscriptionId as string, {
        expand: ['items.data'],
      });

      const subscriptionItem = stripeSubscription.items.data[0];
      if (!subscriptionItem) {
        return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
      }

      const updatedSubscription = await getStripe().subscriptions.update(stripeSubscription.id, {
        proration_behavior: 'create_prorations',
        items: [{ id: subscriptionItem.id, price: priceId }],
      });

      return NextResponse.json({ subscription: updatedSubscription });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
