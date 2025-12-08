import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { getPostsAndCategories, getPostSlug, getPostDate } from '@/shared/models/post';
import { postsSource } from '@/core/docs/source';
import {
  Blog as BlogType,
  Category as CategoryType,
  Post as PostType,
} from '@/shared/types/blocks/blog';

export const generateMetadata = getMetadata({
  metadataKey: 'blog.metadata',
  canonicalUrl: '/blog',
});

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // load blog data
  const t = await getTranslations('blog');

  let posts: PostType[] = [];
  let categories: CategoryType[] = [];

  // current category data
  const currentCategory: CategoryType = {
    id: 'all',
    slug: 'all',
    title: t('page.all'),
    url: `/blog`,
  };

  try {
    const { page: pageNum, pageSize } = await searchParams;
    const page = pageNum || 1;
    const limit = pageSize || 30;

    const { posts: allPosts, categories: allCategories } = await getPostsAndCategories({
      locale,
      page,
      limit,
    });

    // Always use local MDX posts for blog list rendering (authoritative content)
    const preferredSlugs = [
      'career-focused-pbl-edutopia',
      'learning-job-skills-elementary-edutopia',
      'middle-school-career-exploration-edutopia',
      'k5-career-awareness-ncda',
      'elementary-career-exploration-eric',
    ];

    const builtPosts = preferredSlugs
      .map((slug) => postsSource.getPage([slug], locale))
      .filter((p) => !!p)
      .map((p) => {
        const frontmatter = (p as any).data as any;
        const slug = getPostSlug({ url: (p as any).url, locale, prefix: '/blog/' });
        return {
          id: (p as any).path,
          slug,
          title: (p as any).data.title || '',
          description: (p as any).data.description || '',
          author_name: frontmatter.author_name || '',
          author_image: frontmatter.author_image || '',
          created_at: frontmatter.created_at
            ? getPostDate({ created_at: String(frontmatter.created_at), locale })
            : '',
          image: frontmatter.image || '',
          url: `/blog/${slug}`,
        };
      });

    // If preferred set produces content, use it; otherwise fallback to all local pages
    if (builtPosts && builtPosts.length > 0) {
      posts = builtPosts;
    } else {
      const localPosts = postsSource.getPages(locale);
      posts = (localPosts || []).map((p) => {
        const frontmatter = p.data as any;
        const slug = getPostSlug({ url: p.url, locale, prefix: '/blog/' });
        return {
          id: p.path,
          slug,
          title: p.data.title || '',
          description: p.data.description || '',
          author_name: frontmatter.author_name || '',
          author_image: frontmatter.author_image || '',
          created_at: frontmatter.created_at
            ? getPostDate({ created_at: String(frontmatter.created_at), locale })
            : '',
          image: frontmatter.image || '',
          url: `/blog/${slug}`,
        };
      });
    }

    categories = allCategories;
    categories.unshift(currentCategory);
  } catch (error) {
    console.log('getting posts failed:', error);
  }

  // build blog data
  const blog: BlogType = {
    ...t.raw('blog'),
    categories,
    currentCategory,
    posts,
  };

  // load page component
  const Page = await getThemePage('blog');

  return <Page locale={locale} blog={blog} />;
}
