import { db } from '@/core/db';
import { post, user } from '@/config/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

type BlogSeed = { slug: string; title: string; summary: string; content: string; cover?: string };

const seeds: BlogSeed[] = [
  {
    slug: 'cultivate-career-interest-at-home',
    title: '在家庭中培养孩子的职业兴趣：可行方法与活动建议',
    summary: '从日常生活出发，提供简单可执行的亲子活动，帮助孩子认识职业、形成兴趣。',
    content:
      '职业兴趣的培养源于好奇与体验。父母可通过职业角色扮演、职业访谈、亲子阅读、纪录片共赏、社区参观与志愿活动等方式，让孩子接触真实世界。关键在于尊重孩子选择、提供安全的尝试空间，并将兴趣延展为长期的探索路径。',
    cover: '/images/blog/career-interest-1.jpg',
  },
  {
    slug: 'school-and-community-resources',
    title: '善用学校与社区资源：拓展孩子的职业视野',
    summary: '结合学校社团、社区科普中心与公共图书馆的活动，丰富孩子的职业体验。',
    content:
      '学校的社团、科技节、职业讲座与社区的科普中心、图书馆活动是职业启蒙的最佳场所。建议家长按季度制定“职业体验计划”，围绕孩子的兴趣参与项目，记录每次体验的收获与困惑，逐步形成个性化的探索地图。',
    cover: '/images/blog/career-interest-2.jpg',
  },
  {
    slug: 'interest-to-path',
    title: '从兴趣到路径：如何将孩子的职业兴趣落到行动',
    summary: '把兴趣转化为成长路径：目标、能力与实践三要素的组合。',
    content:
      '将兴趣转化为路径，需要明确阶段目标（短期与长期）、能力清单（知识、技能、品格），以及实践安排（每周/每月的项目与活动）。父母应提供稳定的支持、适当的挑战与反馈，帮助孩子在探索中建立自信与耐力。',
    cover: '/images/blog/career-interest-3.jpg',
  },
];

/**
 * 运行脚本：
 * npx tsx scripts/seed-blog-career-interest.ts
 * 将专题文章写入现有 post 表（type=blog，status=active）
 */
async function main() {
  const [author] = await db().select({ id: user.id }).from(user).where(eq(user.email, 'info@futureselfgenerator.com'));
  if (!author?.id) {
    throw new Error('Author user not found: please ensure info@futureselfgenerator.com exists');
  }

  for (const s of seeds) {
    const data: typeof post.$inferInsert = {
      id: crypto.randomUUID(),
      userId: author.id,
      slug: s.slug,
      type: 'article',
      title: s.title,
      description: s.summary,
      image: s.cover,
      content: s.content,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db()
      .insert(post)
      .values(data)
      .onConflictDoUpdate({
        target: post.slug,
        set: {
          type: 'article',
          title: s.title,
          description: s.summary,
          content: s.content,
          image: s.cover,
          status: 'published',
          updatedAt: new Date(),
        },
      });
  }
  console.log('Seeded blog career interest posts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
