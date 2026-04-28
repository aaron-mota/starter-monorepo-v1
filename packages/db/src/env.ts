import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().min(1, 'MONGODB_DB is required').default('starter'),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', z.treeifyError(result.error));
    throw new Error('Invalid environment variables');
  }
  return result.data;
}

export type Env = z.infer<typeof envSchema>;
