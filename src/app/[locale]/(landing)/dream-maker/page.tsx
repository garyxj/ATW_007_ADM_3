import { envConfigs } from "@/config";
import ClientPage from "./client-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const title = "AI Future Self Generator | Inspire Kids’ Future Careers";
  const description =
    "Turn a child’s photo into inspiring, realistic future-career portraits in minutes. Safe, fast, and mobile-friendly—start creating future career images today.";

  const canonicalUrl =
    locale && locale !== envConfigs.locale
      ? `${envConfigs.app_url}/${locale}/dream-maker`
      : `${envConfigs.app_url}/dream-maker`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ClientPage locale={locale} />;
}
