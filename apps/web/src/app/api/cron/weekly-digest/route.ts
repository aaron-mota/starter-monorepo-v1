import { NextResponse } from 'next/server';
import { getDb } from '@app/db';
import { type ObjectId } from 'mongodb';
import type { NextRequest } from 'next/server';
import { getResend } from '@/lib/services/email/resend';
import { buildWeeklyDigestHtml } from '@/lib/services/email/weekly-digest-template';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const resend = getResend();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000';

    // Find Pro users with digest enabled
    const users = await db
      .collection('User')
      .find({
        plan: 'pro',
        emailDigestEnabled: true,
        email: { $exists: true, $ne: '' },
      })
      .toArray();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    let sent = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Get user's tags
        const userTags = await db
          .collection('Tag')
          .find({ ownerId: user._id }, { projection: { _id: 1, name: 1 } })
          .toArray();

        if (userTags.length === 0) continue;

        const tagIds = userTags.map((t) => t._id as ObjectId);
        const tagNameMap = new Map(userTags.map((t) => [t._id.toHexString(), t.name as string]));

        // Aggregate scan stats for the week
        const scanStats = await db
          .collection('Scan')
          .aggregate([
            {
              $match: {
                tagId: { $in: tagIds },
                scannedAt: { $gte: weekAgo },
              },
            },
            {
              $group: {
                _id: '$tagId',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ])
          .toArray();

        const totalScans = scanStats.reduce((sum, s) => sum + (s.count as number), 0);
        const uniqueTags = scanStats.length;

        if (totalScans === 0) continue;

        const topTags = scanStats.slice(0, 3).map((s) => ({
          name: tagNameMap.get((s._id as ObjectId).toHexString()) || 'Unknown',
          count: s.count as number,
        }));

        const mostActiveTag = topTags[0]?.name || null;

        const html = buildWeeklyDigestHtml({
          userName: (user.name as string) || (user.first as string) || 'there',
          totalScans,
          uniqueTags,
          mostActiveTag,
          topTags,
          appUrl,
        });

        await resend.emails.send({
          from: 'Starter App <digest@example.com>',
          to: user.email as string,
          subject: `Your Weekly Summary — ${totalScans} events this week`,
          html,
        });

        // Update lastDigestSentAt
        await db.collection('User').updateOne({ _id: user._id }, { $set: { lastDigestSentAt: new Date() } });

        sent++;
      } catch (err) {
        console.error(`Failed to send digest to user ${user._id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      ok: true,
      processed: users.length,
      sent,
      errors,
    });
  } catch (error) {
    console.error('Weekly digest cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
