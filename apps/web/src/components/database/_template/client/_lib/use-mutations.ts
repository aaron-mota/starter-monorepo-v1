/**
 * TEMPLATE — Entity-specific mutation wrappers.
 *
 * Real implementation should:
 *   1. Import the typed tRPC client: `import { trpc } from '@/lib/hooks'`.
 *   2. Wire up `trpc[TYPE.router].create.useMutation(...)`, `.update.useMutation(...)`, etc.,
 *      passing through the callbacks from MutationArgs.
 *   3. Call `utils.invalidate()` from `trpc.useUtils()` on success.
 *
 * This stub returns no-op mutations so the template compiles before the entity has a router.
 */

import type { MutationArgs } from '@/components/database/_lib/use-mutations';
import type { TDoc } from '../_config';

const noopMutation = {
  mutate: () => {},
  mutateAsync: async () => undefined,
  isPending: false,
};

export function useMutations(_args: MutationArgs<TDoc> = {}) {
  // TODO: replace with real `trpc[TYPE.router].<op>.useMutation(...)` calls once the entity router exists.
  return {
    mutationCreate: noopMutation,
    mutationUpdate: noopMutation,
    mutationDelete: noopMutation,
  };
}
