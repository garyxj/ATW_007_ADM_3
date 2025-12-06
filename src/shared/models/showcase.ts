import { and, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { careerShowcase } from '@/config/db/schema';

export interface ShowcaseInput {
  id?: string;
  slug: string;
  locale: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  summary?: string;
  responsibilities?: string;
  significance?: string;
  howToBecome?: string;
  status?: string;
}

/**
 * 获取指定语言的职业案例列表
 * 返回按创建时间倒序的 active 项
 */
export async function getShowcases({
  locale,
  status = 'active',
  page = 1,
  limit = 30,
}: {
  locale: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const result = await db()
    .select()
    .from(careerShowcase)
    .where(and(eq(careerShowcase.locale, locale), eq(careerShowcase.status, status)))
    .limit(limit)
    .offset((page - 1) * limit);
  return result;
}

/**
 * 根据 slug 获取单个职业案例
 */
export async function getShowcaseBySlug(slug: string, locale: string) {
  const [item] = await db()
    .select()
    .from(careerShowcase)
    .where(and(eq(careerShowcase.slug, slug), eq(careerShowcase.locale, locale)));
  return item || null;
}

/**
 * 创建或更新职业案例（按 slug+locale 唯一）
 */
export async function createOrUpdateShowcase(input: ShowcaseInput) {
  const [existing] = await db()
    .select({ id: careerShowcase.id })
    .from(careerShowcase)
    .where(and(eq(careerShowcase.slug, input.slug), eq(careerShowcase.locale, input.locale)));

  if (existing) {
    await db()
      .update(careerShowcase)
      .set({
        title: input.title,
        subtitle: input.subtitle,
        imageUrl: input.imageUrl,
        summary: input.summary,
        responsibilities: input.responsibilities,
        significance: input.significance,
        howToBecome: input.howToBecome,
        status: input.status || 'active',
      })
      .where(eq(careerShowcase.id, existing.id));
    return existing.id;
  }

  const [created] = await db()
    .insert(careerShowcase)
    .values({
      id: input.id || crypto.randomUUID(),
      slug: input.slug,
      locale: input.locale,
      title: input.title,
      subtitle: input.subtitle,
      imageUrl: input.imageUrl,
      summary: input.summary,
      responsibilities: input.responsibilities,
      significance: input.significance,
      howToBecome: input.howToBecome,
      status: input.status || 'active',
    })
    .returning();
  return created.id;
}

