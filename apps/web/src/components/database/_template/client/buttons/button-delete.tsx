'use client';

/**
 * TEMPLATE — Delete-with-confirmation button for a single entity document.
 *
 * Real implementation should:
 *   1. Open an AlertDialog before deleting (use `@/components/ui/dialog`).
 *   2. Call `useMutations({ delete: { onSuccess: ... } }).mutationDelete.mutateAsync({ id })`.
 *   3. Invalidate the entity's query cache via `trpc[TYPE.router].invalidate()` on success.
 */
import { TYPE } from '../_config';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  onDelete?: (id: string) => void;
  disabled?: boolean;
}

export function ButtonDelete({ id, onDelete, disabled }: Props) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onDelete?.(id)}
      disabled={disabled}
      aria-label={`Delete ${TYPE.display.singular.toLowerCase()}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
