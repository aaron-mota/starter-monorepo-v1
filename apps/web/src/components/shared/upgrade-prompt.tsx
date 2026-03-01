'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  message: string;
}

export function UpgradePrompt({ message }: UpgradePromptProps) {
  return (
    <Alert>
      <AlertDescription className="flex flex-col gap-3">
        <p>{message}</p>
        <Button asChild size="sm" className="w-fit">
          <Link href="/settings?tab=subscription">
            Upgrade to Pro
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Returns true if a tRPC error is a plan limit error (FORBIDDEN code).
 */
export function isPlanLimitError(error: { data?: { code?: string } | null } | null): boolean {
  return error?.data?.code === 'FORBIDDEN';
}
