/**
 * Shared mutation-callback contract used by every entity's `useMutations` hook.
 *
 * Each entity's `_template/client/_lib/use-mutations.ts` re-exports this `MutationArgs<TDoc>`
 * shape and layers entity-specific tRPC calls on top, so all CRUD components in the system
 * accept the same hook prop signature.
 */

export interface MutationCallbacks<TDoc> {
  create?: {
    before?: (input: unknown) => void;
    onSuccess?: (doc: TDoc) => void;
    onError?: (error: Error) => void;
  };
  update?: {
    before?: (input: { id: string }) => void;
    onSuccess?: (doc: TDoc) => void;
    onError?: (error: Error) => void;
  };
  delete?: {
    before?: (input: { id: string }) => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  };
}

export type MutationArgs<TDoc> = MutationCallbacks<TDoc>;
