/**
 * Sitemap generator
 * - Creates sitemap index + pages + posts sitemaps under /public
 * - Designed for post-build execution: `pnpm tsx scripts/generate-sitemap.ts`
 *
 * Requirements (from prompt6_script_sitemap_gen.md):
 * 1) Generate sitemap.xml index in /public
 * 2) Generate sitemap-pages.xml by scanning static pages (exclude privacy/terms/refund)
 * 3) Generate sitemap-posts.xml by fetching CMS posts: https://[Your-CMS-API]/api/posts
 * 4) Index links both pages/posts sitemaps
 */
import fs from 'fs/promises';
import path from 'path';

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
  'https://futureselfgenerator.com';
const CMS_API_URL =
  process.env.CMS_API_URL?.replace(/\/$/, '') || 'https://[Your-CMS-API]';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const APP_DIR = path.join(process.cwd(), 'src', 'app');

const EXCLUDE_PATHS = new Set([
  '/privacy-policy',
  '/terms-of-service',
  '/refund-policy',
]);

const EXCLUDE_PREFIXES = [
  '/admin',
  '/settings',
  '/activity',
  '/chat',
  '/ai-',
  '/sign-in',
  '/sign-up',
  '/no-permission',
];

type UrlEntry = {
  loc: string;
  lastmod?: string;
};

async function ensurePublicDir() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
}

function toRouteFromAppPath(filePath: string) {
  // Convert .../src/app/[locale]/(landing)/dream-maker/page.tsx -> /dream-maker
  const relative = path.relative(APP_DIR, path.dirname(filePath));
  const segments = relative
    .split(path.sep)
    .filter(Boolean)
    .filter((seg) => !seg.startsWith('(') && !seg.includes('[locale]'))
    .filter((seg) => !seg.startsWith('api')) // ignore API routes
    .filter((seg) => !seg.startsWith('_')); // ignore system folders

  // Skip dynamic routes like [slug]
  if (segments.some((seg) => seg.startsWith('[') && seg.endsWith(']'))) {
    return null;
  }

  const route = '/' + segments.join('/');
  return route === '/' ? '/' : route.replace(/\/+/g, '/');
}

async function walkPages(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkPages(fullPath)));
    } else if (
      entry.isFile() &&
      (entry.name === 'page.tsx' ||
        entry.name === 'page.ts' ||
        entry.name === 'page.jsx' ||
        entry.name === 'page.js')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

async function generatePagesSitemap(): Promise<UrlEntry[]> {
  const pageFiles = await walkPages(APP_DIR);
  const routes = new Set<string>();

  for (const file of pageFiles) {
    const route = toRouteFromAppPath(file);
    if (!route) continue;
    if (EXCLUDE_PATHS.has(route)) continue;
    if (EXCLUDE_PREFIXES.some((prefix) => route.startsWith(prefix))) continue;
    routes.add(route);
  }

  return Array.from(routes).map((loc) => ({
    loc: `${BASE_URL}${loc}`,
    lastmod: new Date().toISOString(),
  }));
}

async function generatePostsSitemap(): Promise<UrlEntry[]> {
  const url = `${CMS_API_URL}/api/posts`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`fetch posts failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = (await res.json()) as any[];
    return (data || [])
      .map((item) => {
        const slug = item.slug || item.id;
        if (!slug) return null;
        const updated =
          item.updatedAt ||
          item.updated_at ||
          item.publishedAt ||
          item.published_at;
        return {
          loc: `${BASE_URL}/blog/${slug}`,
          lastmod: updated ? new Date(updated).toISOString() : undefined,
        } as UrlEntry;
      })
      .filter(Boolean) as UrlEntry[];
  } catch (error) {
    console.warn('fetch posts error:', error);
    return [];
  }
}

function buildUrlSet(urls: UrlEntry[]) {
  const items = urls
    .map(
      (u) =>
        `<url><loc>${u.loc}</loc>${
          u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''
        }</url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

async function writeSitemap(filename: string, content: string) {
  const filePath = path.join(PUBLIC_DIR, filename);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`wrote ${filename}`);
}

async function main() {
  await ensurePublicDir();

  const [pageUrls, postUrls] = await Promise.all([
    generatePagesSitemap(),
    generatePostsSitemap(),
  ]);

  await writeSitemap('sitemap-pages.xml', buildUrlSet(pageUrls));
  await writeSitemap('sitemap-posts.xml', buildUrlSet(postUrls));

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-posts.xml</loc>
  </sitemap>
</sitemapindex>`;

  await writeSitemap('sitemap.xml', index);
}

main().catch((err) => {
  console.error('sitemap generation failed', err);
  process.exit(1);
});

