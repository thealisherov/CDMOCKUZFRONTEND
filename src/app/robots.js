export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://megaielts.uz';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/dashboard/', '/test-demo'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
