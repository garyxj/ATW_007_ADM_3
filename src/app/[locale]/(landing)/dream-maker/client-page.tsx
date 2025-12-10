"use client";

import { useState } from "react";
import PhotoUpload from "@/shared/blocks/dream-maker/photo-upload";
import DreamMakerHero from "@/shared/blocks/dream-maker/hero";
import DreamInput from "@/shared/blocks/dream-maker/dream-input";
import ImageGeneration from "@/shared/blocks/dream-maker/image-generation";
import ResultDisplay from "@/shared/blocks/dream-maker/result-display";

export type AppStep = "upload" | "dream" | "generate" | "result";

export interface DreamData {
  photo: string | null;
  photoFile: File | null;
  dream: string;
  career: string;
  generatedImage: string | null;
}

export default function ClientPage({ locale }: { locale?: string }) {
  const [currentStep, setCurrentStep] = useState<AppStep>("upload");
  const [dreamData, setDreamData] = useState<DreamData>({
    photo: null,
    photoFile: null,
    dream: "",
    career: "",
    generatedImage: null,
  });

  function handlePhotoUpload(photo: string, file: File) {
    setDreamData((prev) => ({ ...prev, photo, photoFile: file }));
    setCurrentStep("dream");
  }

  function handleDreamSubmit(dream: string, career: string) {
    setDreamData((prev) => ({ ...prev, dream, career }));
    setCurrentStep("generate");
  }

  function handleImageGenerated(imageUrl: string) {
    setDreamData((prev) => ({ ...prev, generatedImage: imageUrl }));
    setCurrentStep("result");
  }

  function handleReset() {
    setDreamData({
      photo: null,
      photoFile: null,
      dream: "",
      career: "",
      generatedImage: null,
    });
    setCurrentStep("upload");
  }

  return (
    <main className="min-h-screen bg-background">
      <DreamMakerHero />
      {currentStep === "upload" && (
        <PhotoUpload onPhotoUpload={handlePhotoUpload} />
      )}
      {currentStep === "dream" && (
        <DreamInput
          photo={dreamData.photo}
          onSubmit={handleDreamSubmit}
          onBack={() => setCurrentStep("upload")}
        />
      )}
      {currentStep === "generate" && (
        <ImageGeneration
          dreamData={dreamData}
          onImageGenerated={handleImageGenerated}
          onBack={() => setCurrentStep("dream")}
        />
      )}
      {currentStep === "result" && (
        <ResultDisplay dreamData={dreamData} onReset={handleReset} />
      )}
    </main>
  );
}

