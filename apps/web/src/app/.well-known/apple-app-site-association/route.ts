import { NextResponse } from 'next/server';

const TEAM_ID = process.env.APPLE_TEAM_ID ?? '';
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID ?? 'com.starter.app';

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${TEAM_ID}.${BUNDLE_ID}`],
            components: [
              {
                '/': '/dashboard/*',
              },
            ],
          },
        ],
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
