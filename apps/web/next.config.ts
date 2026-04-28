import { resolve } from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@app/shared', '@app/db', '@app/trpc', '@app/api', '@app/ui'],
  outputFileTracingRoot: resolve(__dirname, '../../'),
};

export default nextConfig;
