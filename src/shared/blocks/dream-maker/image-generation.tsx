"use client"

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import type { DreamData } from "@/app/[locale]/(landing)/dream-maker/page";
import { buildCareerHeadshotPrompt } from "@/shared/prompt/builder";

function useGenSteps(t: (k: string) => string) {
  return [t("gen_step_1"), t("gen_step_2"), t("gen_step_3"), t("gen_step_4"), t("gen_step_5")];
}

function generateEnhancedPrompt(career: string, customDream: string): string {
  const legacy = typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_USE_LEGACY_PROMPT === "1" || process.env?.NEXT_PUBLIC_USE_LEGACY_PROMPT === "true");
  if (legacy) {
    const careerDesc = career ? `Professional adult ${career} image` : "Professional adult portrait";
    const basePrompt = `Transform the child in the photo into an adult professional image.

Keep identical facial features from the original photo; same identity; same face shape and proportions; same skin tone; same eyes, nose and lips; adult bone structure and mature facial features.

Target age: 30-year-old adult (approximately late 20s to early 30s).

Career image: ${careerDesc}. ${customDream ? `Additional details: ${customDream}` : ""}

Image quality: professional headshot, upper body, centered composition, neutral gray background, 85mm lens, f/2.8, soft studio lighting, crisp focus, minimal shadows.

Negative: no text overlay, no watermark, no cartoon, no distortion, no double exposure, no multiple faces, no extreme makeup.`;
    return basePrompt;
  }
  return buildCareerHeadshotPrompt({ careerId: career, customText: customDream, locale: "mix", qualityPreset: "studio", safetyLevel: "strict", useChineseAppend: true });
}

async function compressImage(base64Data: string, maxWidth = 1024, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = base64Data;
  });
}

export default function ImageGeneration({ dreamData, onImageGenerated, onBack }: { dreamData: DreamData; onImageGenerated: (imageUrl: string) => void; onBack: () => void; }) {
  const t = useTranslations("dreammaker");
  const GENERATION_STEPS = useGenSteps(t);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const generateImage = useCallback(async () => {
    if (!dreamData.photo || !dreamData.dream) return;
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStep(0);
    try {
      let imageData = dreamData.photo;
      if (!imageData.startsWith("data:")) {
        imageData = `data:image/jpeg;base64,${imageData}`;
      }
      try {
        imageData = await compressImage(imageData, 1024, 0.85);
      } catch {}
      const enhancedPrompt = generateEnhancedPrompt(dreamData.career, dreamData.dream);
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 8;
          if (next >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          setCurrentStep(Math.min(Math.floor(next / 20), 4));
          return next;
        });
      }, 500);
      const response = await fetch("/api/ai/seedream/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageData, prompt: enhancedPrompt }),
      });
      clearInterval(progressInterval);
      const text = await response.text();
      let responseData: any;
      try { responseData = JSON.parse(text); } catch { responseData = { error: text }; }
      if (!response.ok) throw new Error(responseData.error || "Generation failed");
      if (responseData.status === "SUCCEEDED" && responseData.imageUrl) {
        setProgress(100);
        setCurrentStep(4);
        await new Promise((r) => setTimeout(r, 500));
        onImageGenerated(responseData.imageUrl);
      } else {
        throw new Error(responseData.error || "Image generation failed");
      }
    } catch (err: any) {
      setError(err?.message || "Generation failed, please try again");
      setIsGenerating(false);
    }
  }, [dreamData, onImageGenerated]);

  useEffect(() => { generateImage(); }, []);

  function handleRetry() { generateImage(); }

  return (
    <section className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {!isGenerating && (
          <Button variant="ghost" onClick={onBack} className="mb-6 sm:mb-8 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            {t("go_back")}
          </Button>
        )}
        <Card className="p-6 sm:p-10">
          <div className="text-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-full h-full bg-primary rounded-full flex items-center justify-center animate-pulse-glow">
                {isGenerating ? (
                  <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground animate-spin" />
                ) : error ? (
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                ) : (
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                )}
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">{error ? t("gen_failed") : isGenerating ? t("gen_processing") : t("gen_complete")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">{error || GENERATION_STEPS[currentStep]}</p>
            {isGenerating && (
              <div className="mb-6 sm:mb-8">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
              </div>
            )}
            <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary">
                  {dreamData.photo && (<img src={dreamData.photo || "/placeholder.svg"} alt="Original" className="w-full h-full object-cover" />)}
                </div>
                <span className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs bg-card px-2 py-0.5 rounded-full border border-border text-muted-foreground">{t("original")}</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 sm:w-12 h-0.5 bg-border" />
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-1 sm:mx-2" />
                <div className="w-8 sm:w-12 h-0.5 bg-border" />
              </div>
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
                  {isGenerating ? (<div className="animate-shimmer w-full h-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />) : (<Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />)}
                </div>
                <span className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs bg-card px-2 py-0.5 rounded-full border border-border text-muted-foreground">{dreamData.career}</span>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-secondary/50 rounded-xl mb-6 sm:mb-0">
              <p className="text-xs sm:text-sm text-secondary-foreground"><span className="font-medium">{t("dream_desc")}</span>{dreamData.dream}</p>
            </div>
            {error && (
              <Button onClick={handleRetry} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 sm:px-8 gap-2">
                <RefreshCw className="w-4 h-4" />
                {t("try_again")}
              </Button>
            )}
          </div>
        </Card>
        {isGenerating && (<div className="mt-6 sm:mt-8 text-center"><p className="text-xs sm:text-sm text-muted-foreground">AI is working hard, expected to take 30-60 seconds...</p></div>)}
      </div>
    </section>
  );
}
