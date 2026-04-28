'use client';

/**
 * TEMPLATE — Default tabular view for an entity's documents.
 *
 * Real implementation should:
 *   1. Fetch via `trpc[TYPE.router].getMany.useQuery()` from `@/lib/hooks` (replace TYPE.router
 *      with the real router key, e.g. `trpc.item.getMany.useQuery()`).
 *   2. Handle the four states (loading / error / empty / success).
 *   3. Compose with @tanstack/react-table for sorting/filtering when columns grow.
 */
import { TYPE } from '../_config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TDoc } from '../_config';

interface Props {
  docs?: TDoc[];
  isLoading?: boolean;
}

export function TableDocsDefault({ docs, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{TYPE.display.plural}</CardTitle>
      </CardHeader>
      <CardContent>
        {!docs || docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {TYPE.display.plural.toLowerCase()} yet.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li key={doc.id} className="text-sm">
                {doc.id}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
