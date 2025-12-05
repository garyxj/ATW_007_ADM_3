import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
import postgres from 'postgres'

function sql(strings: TemplateStringsArray, ...values: any[]) {
  return String.raw({ raw: strings }, ...values)
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is missing')
    process.exit(1)
  }
  const db = postgres(url, { ssl: 'require' as any })

  const statements = [
    // user
    sql`CREATE TABLE IF NOT EXISTS public."user" (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      email_verified boolean NOT NULL DEFAULT false,
      image text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_user_name ON public."user"(name);`,
    sql`CREATE INDEX IF NOT EXISTS idx_user_created_at ON public."user"(created_at);`,

    // session
    sql`CREATE TABLE IF NOT EXISTS public.session (
      id text PRIMARY KEY,
      expires_at timestamptz NOT NULL,
      token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      ip_address text,
      user_agent text,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_session_user_expires ON public.session(user_id, expires_at);`,

    // account
    sql`CREATE TABLE IF NOT EXISTS public.account (
      id text PRIMARY KEY,
      account_id text NOT NULL,
      provider_id text NOT NULL,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      access_token text,
      refresh_token text,
      id_token text,
      access_token_expires_at timestamptz,
      refresh_token_expires_at timestamptz,
      scope text,
      password text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_account_user_id ON public.account(user_id);`,
    sql`CREATE INDEX IF NOT EXISTS idx_account_provider_account ON public.account(provider_id, account_id);`,

    // verification
    sql`CREATE TABLE IF NOT EXISTS public.verification (
      id text PRIMARY KEY,
      identifier text NOT NULL,
      value text NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public.verification(identifier);`,

    // config
    sql`CREATE TABLE IF NOT EXISTS public.config (
      name text UNIQUE NOT NULL,
      value text
    );`,

    // taxonomy
    sql`CREATE TABLE IF NOT EXISTS public.taxonomy (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      parent_id text,
      slug text UNIQUE NOT NULL,
      type text NOT NULL,
      title text NOT NULL,
      description text,
      image text,
      icon text,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      sort integer NOT NULL DEFAULT 0
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_taxonomy_type_status ON public.taxonomy(type, status);`,

    // post
    sql`CREATE TABLE IF NOT EXISTS public.post (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      parent_id text,
      slug text UNIQUE NOT NULL,
      type text NOT NULL,
      title text,
      description text,
      image text,
      content text,
      categories text,
      tags text,
      author_name text,
      author_image text,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      sort integer NOT NULL DEFAULT 0
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_post_type_status ON public.post(type, status);`,

    // order
    sql`CREATE TABLE IF NOT EXISTS public."order" (
      id text PRIMARY KEY,
      order_no text UNIQUE NOT NULL,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      user_email text,
      status text NOT NULL,
      amount integer NOT NULL,
      currency text NOT NULL,
      product_id text,
      payment_type text,
      payment_interval text,
      payment_provider text NOT NULL,
      payment_session_id text,
      checkout_info text NOT NULL,
      checkout_result text,
      payment_result text,
      discount_code text,
      discount_amount integer,
      discount_currency text,
      payment_email text,
      payment_amount integer,
      payment_currency text,
      paid_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      description text,
      product_name text,
      subscription_id text,
      subscription_result text,
      checkout_url text,
      callback_url text,
      credits_amount integer,
      credits_valid_days integer,
      plan_name text,
      payment_product_id text,
      invoice_id text,
      invoice_url text,
      subscription_no text,
      transaction_id text,
      payment_user_name text,
      payment_user_id text
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_order_user_status_payment_type ON public."order"(user_id, status, payment_type);`,
    sql`CREATE INDEX IF NOT EXISTS idx_order_transaction_provider ON public."order"(transaction_id, payment_provider);`,
    sql`CREATE INDEX IF NOT EXISTS idx_order_created_at ON public."order"(created_at);`,

    // subscription
    sql`CREATE TABLE IF NOT EXISTS public.subscription (
      id text PRIMARY KEY,
      subscription_no text UNIQUE NOT NULL,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      user_email text,
      status text NOT NULL,
      payment_provider text NOT NULL,
      subscription_id text NOT NULL,
      subscription_result text,
      product_id text,
      description text,
      amount integer,
      currency text,
      interval text,
      interval_count integer,
      trial_period_days integer,
      current_period_start timestamptz,
      current_period_end timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      plan_name text,
      billing_url text,
      product_name text,
      credits_amount integer,
      credits_valid_days integer,
      payment_product_id text,
      payment_user_id text,
      canceled_at timestamptz,
      canceled_end_at timestamptz,
      canceled_reason text,
      canceled_reason_type text
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_subscription_user_status_interval ON public.subscription(user_id, status, interval);`,
    sql`CREATE INDEX IF NOT EXISTS idx_subscription_provider_id ON public.subscription(subscription_id, payment_provider);`,
    sql`CREATE INDEX IF NOT EXISTS idx_subscription_created_at ON public.subscription(created_at);`,

    // credit
    sql`CREATE TABLE IF NOT EXISTS public.credit (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      user_email text,
      order_no text,
      subscription_no text,
      transaction_no text UNIQUE NOT NULL,
      transaction_type text NOT NULL,
      transaction_scene text,
      credits integer NOT NULL,
      remaining_credits integer NOT NULL DEFAULT 0,
      description text,
      expires_at timestamptz,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      consumed_detail text,
      metadata text
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_credit_consume_fifo ON public.credit(user_id, status, transaction_type, remaining_credits, expires_at);`,
    sql`CREATE INDEX IF NOT EXISTS idx_credit_order_no ON public.credit(order_no);`,
    sql`CREATE INDEX IF NOT EXISTS idx_credit_subscription_no ON public.credit(subscription_no);`,

    // apikey
    sql`CREATE TABLE IF NOT EXISTS public.apikey (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      key text NOT NULL,
      title text NOT NULL,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_apikey_user_status ON public.apikey(user_id, status);`,
    sql`CREATE INDEX IF NOT EXISTS idx_apikey_key_status ON public.apikey(key, status);`,

    // role
    sql`CREATE TABLE IF NOT EXISTS public.role (
      id text PRIMARY KEY,
      name text NOT NULL UNIQUE,
      title text NOT NULL,
      description text,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      sort integer NOT NULL DEFAULT 0
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_role_status ON public.role(status);`,

    // permission
    sql`CREATE TABLE IF NOT EXISTS public.permission (
      id text PRIMARY KEY,
      code text NOT NULL UNIQUE,
      resource text NOT NULL,
      action text NOT NULL,
      title text NOT NULL,
      description text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_permission_resource_action ON public.permission(resource, action);`,

    // role_permission
    sql`CREATE TABLE IF NOT EXISTS public.role_permission (
      id text PRIMARY KEY,
      role_id text NOT NULL REFERENCES public.role(id) ON DELETE CASCADE,
      permission_id text NOT NULL REFERENCES public.permission(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_role_permission_role_permission ON public.role_permission(role_id, permission_id);`,

    // user_role
    sql`CREATE TABLE IF NOT EXISTS public.user_role (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      role_id text NOT NULL REFERENCES public.role(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_user_role_user_expires ON public.user_role(user_id, expires_at);`,

    // ai_task
    sql`CREATE TABLE IF NOT EXISTS public.ai_task (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      media_type text NOT NULL,
      provider text NOT NULL,
      model text NOT NULL,
      prompt text NOT NULL,
      options text,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      task_id text,
      task_info text,
      task_result text,
      cost_credits integer NOT NULL DEFAULT 0,
      scene text NOT NULL DEFAULT '',
      credit_id text
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_ai_task_user_media_type ON public.ai_task(user_id, media_type);`,
    sql`CREATE INDEX IF NOT EXISTS idx_ai_task_media_type_status ON public.ai_task(media_type, status);`,

    // chat
    sql`CREATE TABLE IF NOT EXISTS public.chat (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      model text NOT NULL,
      provider text NOT NULL,
      title text NOT NULL DEFAULT '',
      parts text NOT NULL,
      metadata text,
      content text
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_chat_user_status ON public.chat(user_id, status);`,

    // chat_message
    sql`CREATE TABLE IF NOT EXISTS public.chat_message (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
      chat_id text NOT NULL REFERENCES public.chat(id) ON DELETE CASCADE,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      role text NOT NULL,
      parts text NOT NULL,
      metadata text,
      model text NOT NULL,
      provider text NOT NULL
    );`,
    sql`CREATE INDEX IF NOT EXISTS idx_chat_message_chat_id ON public.chat_message(chat_id, status);`,
    sql`CREATE INDEX IF NOT EXISTS idx_chat_message_user_id ON public.chat_message(user_id, status);`,
  ]

  for (const stmt of statements) {
    await db.unsafe(stmt)
  }

  await db.end({ timeout: 2 })
  console.log('Supabase schema merged (create-if-not-exists) successfully')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
