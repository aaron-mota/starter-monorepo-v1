import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

import './globals.css';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { TRPCProvider } from '@/lib/hooks/trpc-provider';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Starter App',
  description: 'A modern full-stack starter template with dashboard, auth, and billing.',
};

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const isClerkConfigured = clerkPubKey.length > 15 && !clerkPubKey.includes('...');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );

  if (!isClerkConfigured) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
