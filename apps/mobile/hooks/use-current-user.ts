import { useUser } from '@clerk/clerk-expo';
import { trpc } from '@/lib/trpc';

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const clerkId = clerkUser?.id;

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = trpc.user.getSingleWhere.useQuery({ clerkId: clerkId! }, { enabled: !!clerkId });

  const ownerId = user?.id;

  return {
    clerkUser,
    user,
    ownerId,
    isLoading: !isClerkLoaded || isUserLoading,
    error,
  };
}
