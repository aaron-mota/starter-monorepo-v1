import { NextResponse } from 'next/server';
import { ensureSubscriptionUser } from '../_lib/ensure-subscription-user';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@starter/db';
import { getStripe } from '@/lib/services/stripe/stripe';

export async function POST() {
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
    if (!subscription.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing record found. Please subscribe first.' }, { status: 404 });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId as string,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
