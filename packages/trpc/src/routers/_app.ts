import { publicProcedure, router } from '../trpc-server';
import { router as routerDeviceRegistration } from './device-registration';
import { router as routerItem } from './item';
import { router as routerUser } from './user';
import { z } from 'zod';

export const appRouter = router({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return { greeting: `Hello ${input.text}` };
  }),

  user: routerUser,
  item: routerItem,
  deviceRegistration: routerDeviceRegistration,
});

export type AppRouter = typeof appRouter;
