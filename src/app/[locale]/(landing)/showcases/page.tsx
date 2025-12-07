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
    showcases = {
      ...showcasesI18n,
      items: rows.map((r) => ({
        image: { src: r.imageUrl || '/images/placeholder.png', alt: r.title },
        title: r.title,
        description: r.summary || '',
        url: `/showcases/${r.slug}`,
      })),
    };
  } catch {
    showcases = showcasesI18n;
  }
  const cta: CTAType = tl.raw('cta');

  return <Page locale={locale} showcases={showcases} cta={cta} />;
}
