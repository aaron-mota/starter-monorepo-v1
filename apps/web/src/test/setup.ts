import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock('next/link', async () => {
  const React = await import('react');
  return {
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
      return React.createElement('a', { href, ...props }, children);
    },
  };
});

// Mock @clerk/nextjs
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'clerk_test_123', primaryEmailAddress: { emailAddress: 'test@example.com' } },
    isLoaded: true,
    isSignedIn: true,
  }),
  UserButton: () => null,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));
