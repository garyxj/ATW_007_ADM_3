import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { getShowcases } from '@/shared/models/showcase';
import {
  CTA as CTAType,
  Showcases as ShowcasesType,
} from '@/shared/types/blocks/landing';

export const generateMetadata = getMetadata({
  metadataKey: 'showcases.metadata',
  canonicalUrl: '/showcases',
});

/**
 * Showcases 页面
 * 从数据库加载职业展示；无图时使用通用占位图
 */
export default async function ShowcasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // load landing data
  const tl = await getTranslations('landing');

  // load showcases i18n (仅用于标题/描述)
  const t = await getTranslations('showcases');

  // load page component
  const Page = await getThemePage('showcases');

  // build sections
  const showcasesI18n: ShowcasesType = t.raw('showcases');
  let showcases: ShowcasesType = showcasesI18n;
  try {
    const rows = await getShowcases({ locale, status: 'active', page: 1, limit: 100 });
    const filtered = rows.filter((r) => r.slug?.endsWith('-kids-chibi'));
    showcases = {
      ...showcasesI18n,
      items: filtered.map((r) => ({
        image: { src: r.imageUrl || '/placeholder.svg', alt: r.title },
        title: r.title,
        description: r.summary || '',
        url: `/showcases/${r.slug}`,
      })),
    };
  } catch {
    showcases = showcasesI18n;
  }
  const cta: CTAType = tl.raw('cta');

  return <div className="mt-8 md:mt-12"><Page locale={locale} showcases={showcases} cta={cta} /></div>;
}
