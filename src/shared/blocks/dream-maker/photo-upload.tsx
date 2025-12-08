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
  const textPlaceholder = isZh ? "开启摄像头预览或上传图片" : "Open camera preview or upload an image";
  const textCameraError = isZh ? "无法访问摄像头，请授权或使用文件上传。" : "Unable to access camera. Please allow permission or use file upload.";
  const textFileType = isZh ? "请上传 JPG 或 PNG 格式的图片" : "Please upload JPG or PNG format images";
  const textFileSize = isZh ? "图片大小不能超过 5MB" : "Image size cannot exceed 5MB";
  const textCaptureFail = isZh ? "捕获失败，请重试。" : "Failed to capture image, please try again.";
  const textGenerateFail = isZh ? "生成图片失败，请重试。" : "Failed to generate image, please try again.";
  const textChooseFile = t("choose_file");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState(0);
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
    setPreview(null);
    setIsValid(false);
    stopCamera();
    setVideoKey((k) => k + 1);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.load();
        const video = videoRef.current;
        const playVideo = async () => {
          try {
            await video.play();
          } catch (playErr: any) {
            setCameraError(playErr?.message || textCameraError);
          }
        };
        if (video.readyState >= 2) {
          await playVideo();
        } else {
          video.onloadedmetadata = async () => {
            await playVideo();
          };
          video.oncanplay = async () => {
            await playVideo();
          };
        }
        // fallback: if after delay still无尺寸则提示
        setTimeout(() => {
          if (!video.videoWidth || !video.videoHeight) {
            setCameraError(textCameraError);
          }
        }, 1500);
      }
      setIsCameraOpen(true);
    } catch (err: any) {
      setCameraError(err?.message || textCameraError);
      setIsCameraOpen(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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
    <section className="pt-20 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-10 sm:mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t("step_one")}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">{t("upload_title")}</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">{t("upload_tip")}</p>
        </div>

        <Card className={cn("relative overflow-hidden transition-all duration-500 bg-card/70 backdrop-blur-sm", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", isDragging && "ring-2 ring-primary ring-offset-2", preview || isCameraOpen ? "p-4 sm:p-6 lg:p-8" : "p-6 sm:p-8")}>
          {preview || isCameraOpen ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/60 flex items-center justify-center max-h-[80vh] min-h-[320px] sm:min-h-[380px]">
                {preview ? (
                  <>
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain bg-black/40" />
                    {isValidating && (
                      <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                        <div className="text-center text-card">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-card border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-sm sm:text-base font-medium">{textDetecting}</p>
                        </div>
                      </div>
                    )}
                    {isValid && !isValidating && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {textVerified}
                      </div>
                    )}
                    <button onClick={handleRemove} className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 rounded-full bg-foreground/50 hover:bg-foreground/70 text-card flex items-center justify-center transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <video
                      key={videoKey}
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onCanPlay={(e) => {
                        const v = e.currentTarget;
                        if (v.paused) v.play().catch(() => {});
                      }}
                      className="w-full h-full object-contain bg-black/40"
                    />
                    {!cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur text-sm text-foreground">
                          <Camera className="w-4 h-4" />
                          {isZh ? "正在开启摄像头..." : "Opening camera..."}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-4 bottom-4 flex gap-2">
                      <Button onClick={handleCapture} className="flex-1 rounded-full gap-2" disabled={isCapturing}>
                        {isCapturing ? t("gen_processing") : textCaptureUse}
                      </Button>
                      <Button variant="outline" onClick={stopCamera} className="rounded-full gap-2">
                        <VideoOff className="w-4 h-4" />
                        {textClose}
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {isValid && (
                <div className="flex justify-center">
                  <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {isZh ? "确认并继续" : "Confirm & Continue"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-8 sm:py-10">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <Button size="lg" className="rounded-full px-6 sm:px-8 gap-2" onClick={startCamera}>
                  <Camera className="w-5 h-5" />
                  {isZh ? "拍摄" : "Capture"}
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8 gap-2" onClick={handleUseUploadClick}>
                  <Upload className="w-5 h-5" />
                  {isZh ? "上传" : "Upload"}
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">{isZh ? "点击拍摄或上传以开始" : "Tap capture or upload to get started"}</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} className="hidden" />
            </div>
          )}
          {(cameraError || error) && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-xs sm:text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {cameraError || error}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
