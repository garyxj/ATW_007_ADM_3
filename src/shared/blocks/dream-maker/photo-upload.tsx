"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Camera, ImagePlus, AlertCircle, CheckCircle2, X, VideoOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

export default function PhotoUpload({ onPhotoUpload }: { onPhotoUpload: (photo: string, file: File) => void }) {
  const t = useTranslations("dreammaker");
  const locale = useLocale();
  const isZh = locale?.startsWith("zh");
  const textCaptureUse = isZh ? "拍照并使用" : "Capture & Use";
  const textClose = isZh ? "关闭" : "Close";
  const textCameraHint = isZh ? "开启摄像头拍摄原图像" : "Open camera to capture a photo";
  const textUploadHint = isZh ? "或选择本地文件上传" : "Or choose a local file to upload";
  const textDetecting = isZh ? "正在检测人脸..." : "Detecting face...";
  const textVerified = isZh ? "已通过检测" : "Verified";
  const textCameraError = isZh ? "无法访问摄像头，请授权或使用文件上传。" : "Unable to access camera, please allow permission or use file upload.";
  const textFileType = isZh ? "请上传 JPG 或 PNG 格式的图片" : "Please upload JPG or PNG format images";
  const textFileSize = isZh ? "图片大小不能超过 5MB" : "Image size cannot exceed 5MB";
  const textCaptureFail = isZh ? "捕获失败，请重试。" : "Failed to capture image, please try again.";
  const textGenerateFail = isZh ? "生成图片失败，请重试。" : "Failed to generate image, please try again.";
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentFile = useRef<File | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      stopCamera();
    };
  }, []);

  function validateFile(file: File): string | null {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      return textFileType;
    }
    if (file.size > 5 * 1024 * 1024) {
      return textFileSize;
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
    setCameraError(null);
    currentFile.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    stopCamera();
  }

  async function startCamera() {
    setCameraError(null);
    setIsDragging(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setCameraError(err?.message || "Unable to access camera, please allow permission or use file upload.");
      setIsCameraOpen(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }

  const handleCapture = useCallback(async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 720;
    const height = video.videoHeight || 960;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError(textCaptureFail);
      return;
    }
    ctx.drawImage(video, 0, 0, width, height);
    setIsCapturing(true);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    setIsCapturing(false);
    if (!blob) {
      setCameraError(textGenerateFail);
      return;
    }
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    processFile(file);
    stopCamera();
  }, [processFile]);

  function handleUseUploadClick(e: React.MouseEvent) {
    e.stopPropagation();
    fileInputRef.current?.click();
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

        <Card
          onClick={() => {
            if (!preview && !isCameraOpen) startCamera();
          }}
          className={cn("relative overflow-hidden transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", isDragging && "ring-2 ring-primary ring-offset-2", preview ? "p-4 sm:p-6" : "p-6 sm:p-12")}
        >
          {!preview ? (
            <div className="flex flex-col gap-6 sm:gap-8">
              <div
                className={cn("flex flex-col items-center justify-center gap-4 sm:gap-5 py-8 sm:py-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group", isCameraOpen ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50")}
                onClick={startCamera}
              >
                <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300", isCameraOpen ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105")}>
                  <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-base sm:text-lg font-medium text-foreground">{t("drag_click")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{textCameraHint}</p>
                </div>
              </div>

              {isCameraOpen && (
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-border bg-secondary">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-x-3 bottom-3 flex gap-2">
                      <Button onClick={handleCapture} className="flex-1 rounded-full gap-2" disabled={isCapturing}>
                        {isCapturing ? t("gen_processing") : textCaptureUse}
                      </Button>
                      <Button variant="outline" onClick={stopCamera} className="rounded-full gap-2">
                        <VideoOff className="w-4 h-4" />
                        {textClose}
                      </Button>
                    </div>
                  </div>
                  {cameraError && (
                    <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {cameraError}
                    </div>
                  )}
                </div>
              )}

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
                className={cn("flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 border border-dashed rounded-2xl transition-all duration-300 cursor-pointer group", isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50")}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                <div className="flex items-center gap-2 text-sm sm:text-base text-foreground">
                  <Upload className="w-4 h-4" />
                  <span>{textUploadHint}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("supports_formats")}</p>
                <Button variant="outline" size="sm" className="rounded-full px-4 gap-2" onClick={handleUseUploadClick}>
                  <ImagePlus className="w-4 h-4" />
                  {t("choose_file")}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} className="hidden" />
              </div>
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
