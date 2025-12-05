import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

async function upsert(db: postgres.Sql, name: string, value: string) {
  await db`
    INSERT INTO public.config(name, value)
    VALUES (${name}, ${value})
    ON CONFLICT(name) DO UPDATE SET value = EXCLUDED.value
  `
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  const db = postgres(url, { ssl: 'require' as any })

  const GOOGLE_CLIENT_ID = process.env.google_client_id || '1087874272538-5ebc1n2rh7ajsg01amd0p4uah98lfsqk.apps.googleusercontent.com'
  const GOOGLE_CLIENT_SECRET = process.env.google_client_secret || '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'

  await upsert(db, 'google_client_id', GOOGLE_CLIENT_ID)
  await upsert(db, 'google_client_secret', GOOGLE_CLIENT_SECRET)
  await upsert(db, 'google_auth_enabled', 'true')
  await upsert(db, 'google_one_tap_enabled', 'false')

  await db.end({ timeout: 2 })
  console.log('Google auth configs upserted')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

