/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Fix caching issues when running with workers
  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },
  // Turbopack configuration for Next.js 16
  turbopack: {
    // Set the workspace root to avoid warnings about multiple lockfiles
    root: __dirname,
  },
  webpack: (config, { isServer, dev }) => {
    // Fix for canvas and other node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Fix caching issues in development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // Disable webpack cache in development to prevent conflicts
      config.cache = false;
    }

    return config;
  },
};

module.exports = nextConfig;
