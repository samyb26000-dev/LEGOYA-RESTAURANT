/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Bloquer les fichiers sensibles courants
      { source: '/.env', destination: '/404', permanent: true },
      { source: '/.git/:path*', destination: '/404', permanent: true },
      { source: '/wp-admin/:path*', destination: '/404', permanent: true },
      { source: '/wp-login.php', destination: '/404', permanent: true },
      { source: '/phpinfo.php', destination: '/404', permanent: true },
      { source: '/config/:path*', destination: '/404', permanent: true },
    ]
  },
}

export default nextConfig
