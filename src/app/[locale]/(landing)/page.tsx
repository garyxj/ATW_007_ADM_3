import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { getThemePage } from '@/core/theme';
import { Landing } from '@/shared/types/blocks/landing';

/**
 * 将首页重定向到 DreamMaker
 * 根据当前语言 locale，重定向到 `/${locale}/dream-maker`
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect(`/${locale}/dream-maker`);
}
