import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @tms/shared ships raw TypeScript rather than a build step, so Next has to
  // compile it alongside the app.
  transpilePackages: ['@tms/shared'],
};

export default nextConfig;
