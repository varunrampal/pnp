import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const plants = require('../src/json/PlantsList.json');

const SITE_URL = 'https://peelsnativeplants.com';
const SITEMAP_PATH = new URL('../public/sitemap.xml', import.meta.url);
const LASTMOD = process.env.SITEMAP_LASTMOD || new Date().toISOString().slice(0, 10);

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.00' },
  { path: '/plants', changefreq: 'daily', priority: '0.90' },
  { path: '/plant-advisor', changefreq: 'monthly', priority: '0.75' },
  { path: '/satellite-site-analysis', changefreq: 'monthly', priority: '0.75' },
  { path: '/climate-resilience-selector', changefreq: 'monthly', priority: '0.75' },
  { path: '/sales/information', changefreq: 'monthly', priority: '0.65' },
  { path: '/quote', changefreq: 'monthly', priority: '0.65' },
  { path: '/faq', changefreq: 'monthly', priority: '0.60' },
  { path: '/about', changefreq: 'yearly', priority: '0.55' },
  { path: '/contact', changefreq: 'yearly', priority: '0.55' },
];

const normalizePath = (path) => {
  if (path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}`.toLowerCase();
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const uniquePlantPages = Array.from(
  plants.reduce((pages, plant) => {
    if (plant.slug) {
      pages.set(normalizePath(`/plant/${plant.slug}`), {
        path: normalizePath(`/plant/${plant.slug}`),
        changefreq: 'monthly',
        priority: '0.55',
      });
    }

    return pages;
  }, new Map()).values()
);

const entries = [...staticPages, ...uniquePlantPages];

const urlXml = ({ path, changefreq, priority }) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${path === '/' ? '/' : path}`)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlXml).join('\n')}
</urlset>
`;

await writeFile(SITEMAP_PATH, sitemap, 'utf8');

console.log(`Wrote ${entries.length} URLs to ${SITEMAP_PATH.pathname}`);
