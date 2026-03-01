import { resolve } from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@starter/shared', '@starter/db', '@starter/trpc', '@starter/api', '@starter/ui'],
  outputFileTracingRoot: resolve(__dirname, '../../'),
};

export default nextConfig;
