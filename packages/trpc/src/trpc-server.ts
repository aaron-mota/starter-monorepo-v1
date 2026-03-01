import 'server-only';

import { verifyToken } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@starter/db';

export const createContext = async (req: NextRequest) => {
  const { db } = await connectToDatabase();
  let clerkId: string | null = null;

  // 1. Cookie-based auth (web)
  try {
    const { userId } = await auth();
    clerkId = userId;
  } catch {
    // auth() can throw outside full Next.js request context (e.g. mobile Bearer flow)
  }

  // 2. Bearer token fallback (mobile)
  if (!clerkId) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await verifyToken(authHeader.slice(7), {
          secretKey: process.env.CLERK_SECRET_KEY!,
        });
        clerkId = payload.sub ?? null;
      } catch {
        // Invalid or expired token — remain unauthenticated
      }
    }
  }

  return { db, clerkId };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clerkId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});
