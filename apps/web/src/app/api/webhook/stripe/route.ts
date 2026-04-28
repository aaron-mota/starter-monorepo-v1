import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSubscriptionTier } from '../../stripe/_lib/constants';
import { getDb } from '@app/db';
import { getStripe } from '@/lib/services/stripe/stripe';

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  return secret;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 });
    }

    let event;
    try {
      event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret());
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const db = await getDb();

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer as string;
      const subscriptionItem = subscription.items.data[0];
      const priceInCents = subscriptionItem?.price?.unit_amount ?? 0;
      const tier = getSubscriptionTier(priceInCents / 100);

      await db.collection('SubscriptionUser').updateOne(
        { stripeCustomerId },
        {
          $set: {
            stripeSubscriptionId: subscription.id,
            tier,
            updatedAt: new Date(),
          },
        }
      );

      // Also update User.plan
      const subUser = await db.collection('SubscriptionUser').findOne({ stripeCustomerId });
      if (subUser) {
        await db.collection('User').updateOne({ _id: subUser.userId }, { $set: { plan: tier, updatedAt: new Date() } });
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const stripeSubscriptionId = subscription.id;
      const subscriptionItem = subscription.items.data[0];
      const priceInCents = subscriptionItem?.price?.unit_amount ?? 0;
      const tier = getSubscriptionTier(priceInCents / 100);
      const isActive = ['active', 'trialing'].includes(subscription.status);

      const result = await db.collection('SubscriptionUser').findOneAndUpdate(
        { stripeSubscriptionId },
        {
          $set: {
            tier: isActive ? tier : 'free',
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (result) {
        await db
          .collection('User')
          .updateOne({ _id: result.userId }, { $set: { plan: isActive ? tier : 'free', updatedAt: new Date() } });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;

      const result = await db.collection('SubscriptionUser').findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          $set: {
            tier: 'free',
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (result) {
        await db
          .collection('User')
          .updateOne({ _id: result.userId }, { $set: { plan: 'free', updatedAt: new Date() } });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
