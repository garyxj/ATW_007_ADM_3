import postgres from 'postgres';
import dotenv from 'dotenv';

/**
 * 修复 career_showcase 约束：移除 slug 唯一约束，改为 (slug, locale) 唯一索引
 * 运行：npx tsx scripts/fix-showcase-constraints.ts
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

  await sql`ALTER TABLE career_showcase DROP CONSTRAINT IF EXISTS career_showcase_slug_key;`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS uq_career_showcase_slug_locale ON career_showcase (slug, locale);`;

  await sql.end();
  console.log('Fixed career_showcase unique constraints.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

