import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: http://localhost:*",
              "font-src 'self' data:",
              // Allow API calls to local backend (dev) and any https origin (prod)
              "connect-src 'self' http://localhost:* ws://localhost:* https: https://*.mapmyindia.com https://*.mappls.com",
              "media-src 'self' blob: http://localhost:*",
              // Allow map embeds
              "frame-src 'self' https://*.google.com https://www.google.com https://*.openstreetmap.org https://*.mapmyindia.com https://*.mappls.com https://mapmyindia.com https://mappls.com https://*.maptiler.com",
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;
