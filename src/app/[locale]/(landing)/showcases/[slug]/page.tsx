import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { getShowcaseBySlug } from '@/shared/models/showcase'
import { LazyImage } from '@/shared/blocks/common/lazy-image'

/**
 * 展示职业案例详情页
 */
export default async function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const isZh = locale?.startsWith('zh')
  const labels = {
    summary: isZh ? '概述' : 'Summary',
    significance: isZh ? '社会价值' : 'Significance',
    responsibilities: isZh ? '职责' : 'Responsibilities',
    how: isZh ? '如何成为' : 'How to Become',
  }

  const item = await getShowcaseBySlug(slug, locale)
  if (!item) {
    notFound()
  }

  return (
    <section className="container max-w-4xl mt-12 md:mt-16 py-10">
      <div className="flex items-center gap-6">
        {item.imageUrl ? (
          <LazyImage
            src={item.imageUrl}
            alt={item.title || ''}
            className="h-40 w-40 rounded-xl border bg-card object-cover"
          />
        ) : null}
        <div>
          <h1 className="text-3xl font-semibold">{item.title}</h1>
          {item.subtitle ? (
            <p className="text-muted-foreground mt-2">{item.subtitle}</p>
          ) : null}
        </div>
      </div>

      {item.summary ? (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{labels.summary}</h2>
          <p className="text-muted-foreground leading-7">{item.summary}</p>
        </div>
      ) : null}

      {item.significance ? (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{labels.significance}</h2>
          <p className="text-muted-foreground leading-7 whitespace-pre-line">
            {item.significance}
          </p>
        </div>
      ) : null}

      {item.responsibilities ? (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{labels.responsibilities}</h2>
          <p className="text-muted-foreground leading-7 whitespace-pre-line">
            {item.responsibilities}
          </p>
        </div>
      ) : null}

      {item.howToBecome ? (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{labels.how}</h2>
          <p className="text-muted-foreground leading-7 whitespace-pre-line">
            {item.howToBecome}
          </p>
        </div>
      ) : null}
    </section>
  )
}
