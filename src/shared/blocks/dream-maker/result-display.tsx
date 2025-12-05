"use client"

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Download, Share2, RefreshCw, Sparkles, Twitter, Facebook, Link2, Check, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import type { DreamData } from "@/app/[locale]/(v0)/dream-maker/page";

export default function ResultDisplay({ dreamData, onReset }: { dreamData: DreamData; onReset: () => void; }) {
  const t = useTranslations("dreammaker");
  const [customText, setCustomText] = useState(`My dream is to become a ${dreamData.career}`);
  const [selectedDecoration, setSelectedDecoration] = useState("sparkles");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { setMounted(true); }, []);

  async function handleDownload() {
    if (!dreamData.generatedImage) return;
    setIsDownloading(true);
    try {
      if (dreamData.generatedImage.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = dreamData.generatedImage;
        link.download = `dream-maker-${dreamData.career}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch("/api/ai/seedream/download", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: dreamData.generatedImage }) });
        if (!response.ok) throw new Error("Failed to download image");
        const { dataUrl } = await response.json();
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `dream-maker-${dreamData.career}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      window.open(dreamData.generatedImage, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare(platform: string) {
    const shareText = t("share_text", { career: dreamData.career });
    const shareUrl = window.location.href;
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
        break;
    }
  }

  function getDecorationEmoji() {
    const DECORATIONS = [
      { id: "none", icon: "✨" },
      { id: "stars", icon: "⭐" },
      { id: "hearts", icon: "💖" },
      { id: "sparkles", icon: "✨" },
      { id: "rainbow", icon: "🌈" },
    ];
    const decoration = DECORATIONS.find((d) => d.id === selectedDecoration);
    return decoration?.icon || "";
  }

  return (
    <section className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
            <span className="text-sm sm:text-base font-medium text-primary">{t("dream_realized")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t("your_future", { career: dreamData.career })}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t("save_and_share")}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <Card className="p-3 sm:p-4 overflow-hidden">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                {dreamData.generatedImage ? (
                  <img src={dreamData.generatedImage || "/placeholder.svg"} alt={`${dreamData.career} image`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-12 h-12 text-muted-foreground" /></div>
                )}
                {selectedDecoration !== "none" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-4 left-4 text-2xl sm:text-3xl animate-float">{getDecorationEmoji()}</span>
                    <span className="absolute top-8 right-6 text-xl sm:text-2xl animate-float" style={{ animationDelay: "0.5s" }}>{getDecorationEmoji()}</span>
                    <span className="absolute bottom-12 left-8 text-xl sm:text-2xl animate-float" style={{ animationDelay: "1s" }}>{getDecorationEmoji()}</span>
                    <span className="absolute bottom-6 right-4 text-2xl sm:text-3xl animate-float" style={{ animationDelay: "1.5s" }}>{getDecorationEmoji()}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-foreground/80 to-transparent">
                  <p className="text-card text-sm sm:text-lg font-medium text-center">{customText}</p>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </Card>
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
              <Button onClick={handleDownload} disabled={isDownloading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-5 sm:py-6 gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                {isDownloading ? (<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />) : (<Download className="w-4 h-4 sm:w-5 sm:h-5" />)}
                <span className="text-sm sm:text-base">{isDownloading ? t("downloading") : t("download")}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 rounded-full py-5 sm:py-6 gap-2 bg-transparent">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{t("share")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleShare("twitter")}><Twitter className="w-4 h-4 mr-2" />{t("share_twitter")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("facebook")}><Facebook className="w-4 h-4 mr-2" />{t("share_facebook")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")}>
                    {copied ? (<><Check className="w-4 h-4 mr-2 text-primary" />{t("copied")}</>) : (<><Link2 className="w-4 h-4 mr-2" />{t("copy_link")}</>)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <Card className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-medium text-foreground">{t("custom_text")}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-1.5 text-xs sm:text-sm">
                    <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {isEditing ? t("done") : t("edit")}
                  </Button>
                </div>
                {isEditing ? (
                  <Input value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter custom text..." className="rounded-xl text-sm sm:text-base" />
                ) : (
                  <p className="text-sm sm:text-base text-muted-foreground p-3 bg-secondary rounded-xl">{customText}</p>
                )}
              </div>
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">{t("decorations")}</h3>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[{ id: "none", label: "None", icon: "✨" }, { id: "stars", label: "Stars", icon: "⭐" }, { id: "hearts", label: "Hearts", icon: "💖" }, { id: "sparkles", label: "Sparkles", icon: "✨" }, { id: "rainbow", label: "Rainbow", icon: "🌈" }].map((d) => (
                    <button key={d.id} onClick={() => setSelectedDecoration(d.id)} className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${selectedDecoration === d.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                      <span className="text-lg sm:text-xl">{d.icon}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">{t("before_after")}</h3>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary mb-2">
                      {dreamData.photo && (<img src={dreamData.photo || "/placeholder.svg"} alt="Original" className="w-full h-full object-cover" />)}
                    </div>
                    <p className="text-[10px] sm:text-xs text-center text-muted-foreground">{t("original_photo")}</p>
                  </div>
                  <div className="flex items-center"><Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div>
                  <div className="flex-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary mb-2">
                      {dreamData.generatedImage && (<img src={dreamData.generatedImage || "/placeholder.svg"} alt={dreamData.career} className="w-full h-full object-cover" />)}
                    </div>
                    <p className="text-[10px] sm:text-xs text-center text-muted-foreground">{dreamData.career}</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={onReset} className="w-full rounded-full py-4 sm:py-5 gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm sm:text-base">{t("create_new_dream")}</span>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
