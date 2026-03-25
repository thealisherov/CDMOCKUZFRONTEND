/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
    // Optimize image quality and formats
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
    // Enable optimized package imports for common libraries
    optimizePackageImports: ['lucide-react', '@tanstack/react-query', 'date-fns'],
  },
  // Enable gzip/brotli compression
  compress: true,
  // Reduce powered-by header
  poweredByHeader: false,
  // Strict React mode for better performance
  reactStrictMode: true,
};

export default nextConfig;
