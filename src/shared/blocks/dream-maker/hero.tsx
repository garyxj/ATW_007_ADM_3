"use client"

import { useEffect, useState } from "react";
import { Sparkles, Star, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DreamMakerHero() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("dreammaker");

  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-secondary/30 rounded-full blur-3xl" />
      </div>
      {mounted && (
        <>
          <div className="absolute top-32 right-[15%] animate-float hidden sm:block" style={{ animationDelay: "0.5s" }}>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center backdrop-blur-sm">
              <Star className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="absolute top-48 left-[12%] animate-float hidden sm:block" style={{ animationDelay: "1.5s" }}>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center backdrop-blur-sm">
              <Wand2 className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="absolute bottom-32 right-[20%] animate-float hidden sm:block" style={{ animationDelay: "2s" }}>
            <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-primary">{t("hero_badge")}</span>
        </div>

        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="text-foreground">{t("hero_title_prefix")}</span>
          <br />
          <span className="text-primary relative">
            {t("hero_title_highlight")}
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10C50 4 100 2 150 4C200 6 250 8 298 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
            </svg>
          </span>
        </h1>

        <p className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {t("hero_sub_1")}
          <br className="hidden sm:block" />
          {t("hero_sub_2")}
        </p>

        <div className={`flex flex-wrap items-center justify-center gap-6 sm:gap-12 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{t("stat_1_value")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t("stat_1_label")}</div>
          </div>
          <div className="w-px h-8 sm:h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{t("stat_2_value")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t("stat_2_label")}</div>
          </div>
          <div className="w-px h-8 sm:h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{t("stat_3_value")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t("stat_3_label")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

