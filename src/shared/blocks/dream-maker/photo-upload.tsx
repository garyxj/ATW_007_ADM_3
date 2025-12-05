"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Upload, Camera, ImagePlus, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

export default function PhotoUpload({ onPhotoUpload }: { onPhotoUpload: (photo: string, file: File) => void }) {
  const t = useTranslations("dreammaker");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFile = useRef<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function validateFile(file: File): string | null {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      return "Please upload JPG or PNG format images";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "Image size cannot exceed 5MB";
    }
    return null;
  }

  const processFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsValidating(true);
    currentFile.current = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);

      setTimeout(() => {
        setIsValidating(false);
        setIsValid(true);
      }, 1500);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleConfirm() {
    if (preview && currentFile.current) {
      onPhotoUpload(preview, currentFile.current);
    }
  }

  function handleRemove() {
    setPreview(null);
    setIsValid(false);
    setError(null);
    currentFile.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t("step_one")}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t("upload_title")}</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">{t("upload_tip")}</p>
        </div>

        <Card className={cn("relative overflow-hidden transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", isDragging && "ring-2 ring-primary ring-offset-2", preview ? "p-4 sm:p-6" : "p-6 sm:p-12")}>          
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn("flex flex-col items-center justify-center gap-4 sm:gap-6 py-8 sm:py-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group", isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50")}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300", isDragging ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105")}>                
                <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-medium text-foreground mb-1 sm:mb-2">{t("drag_click")}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("supports_formats")}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  className="rounded-full px-4 sm:px-6 gap-2 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {t("choose_file")}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="relative aspect-[3/4] sm:aspect-square max-w-xs sm:max-w-sm mx-auto rounded-2xl overflow-hidden bg-secondary">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                {isValidating && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <div className="text-center text-card">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-card border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm sm:text-base font-medium">Detecting face...</p>
                    </div>
                  </div>
                )}
                {isValid && !isValidating && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Verified
                  </div>
                )}
                <button onClick={handleRemove} className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 rounded-full bg-foreground/50 hover:bg-foreground/70 text-card flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {isValid && (
                <div className="flex justify-center">
                  <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Confirm & Continue
                  </Button>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </Card>
        <div className={`mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {[
            { icon: "👤", title: "Front Facing", desc: "No face obstructions" },
            { icon: "💡", title: "Even Lighting", desc: "Avoid over/underexposure" },
            { icon: "🎯", title: "Centered", desc: "Face in the center" },
          ].map((tip, index) => (
            <div key={index} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="text-xl sm:text-2xl">{tip.icon}</span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-foreground">{tip.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
