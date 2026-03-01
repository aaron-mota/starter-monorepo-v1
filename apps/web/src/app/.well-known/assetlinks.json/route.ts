import { NextResponse } from 'next/server';

const PACKAGE_NAME = process.env.ANDROID_PACKAGE_NAME ?? 'com.starter.app';
const SHA256_FINGERPRINT = process.env.ANDROID_SHA256_FINGERPRINT ?? '';

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: [SHA256_FINGERPRINT],
        },
      },
    ],
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
