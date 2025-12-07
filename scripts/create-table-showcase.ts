import postgres from 'postgres';
import dotenv from 'dotenv';

/**
 * 创建 career_showcase 表（若不存在）及索引
 * 运行：npx tsx scripts/create-table-showcase.ts
 */
async function main() {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const sql = postgres(url, { ssl: 'require' as any });

  await sql`CREATE TABLE IF NOT EXISTS career_showcase (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    locale TEXT NOT NULL DEFAULT 'en',
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    summary TEXT,
    responsibilities TEXT,
    significance TEXT,
    how_to_become TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
  );`;

  await sql`CREATE INDEX IF NOT EXISTS idx_career_showcase_slug ON career_showcase (slug);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_career_showcase_locale_status ON career_showcase (locale, status);`;

  await sql.end();
  console.log('career_showcase table ensured.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

