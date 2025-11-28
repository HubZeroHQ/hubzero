/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hubzero.in',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin'],

  // ❌ REMOVE outDir (it breaks App Router)
  // outDir: './public',

  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin'] },
    ],
  },
};
