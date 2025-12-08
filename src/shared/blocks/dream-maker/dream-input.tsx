"use client"

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mic, MicOff, Sparkles, ArrowLeft, ArrowRight, Volume2, Rocket, Stethoscope, FlaskConical, Plane, ChefHat, Palette, Dumbbell, Music, BookOpen, Flame, Shield, Laptop, type LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { CAREER_PRESETS } from "@/shared/prompt/career-presets";

const CAREER_ICONS: Record<string, LucideIcon> = {
  astronaut: Rocket,
  doctor: Stethoscope,
  scientist: FlaskConical,
  pilot: Plane,
  chef: ChefHat,
  artist: Palette,
  athlete: Dumbbell,
  musician: Music,
  teacher: BookOpen,
  firefighter: Flame,
  police: Shield,
  programmer: Laptop,
};

export default function DreamInput({ photo, onSubmit, onBack }: { photo: string | null; onSubmit: (dream: string, career: string) => void; onBack: () => void; }) {
  const t = useTranslations("dreammaker");
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [customDream, setCustomDream] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mounted, setMounted] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
        setCustomDream(transcript);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice recognition");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  function handleSubmit() {
    const presets = CAREER_PRESETS;
    const selected = selectedCareer ? presets[selectedCareer] : undefined;
    const dreamText = customDream || selected?.shortZh || "";
    const careerLabel = selected?.nameEn || "Custom Career";
    if (dreamText) onSubmit(dreamText, careerLabel);
  }

  const isValid = selectedCareer || customDream.trim().length > 0;

  return (
    <section className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6 sm:mb-8 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          {t("go_back")}
        </Button>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <Card className="p-4 sm:p-6 h-full">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-4">
                {photo && <img src={photo || "/placeholder.svg"} alt="Your photo" className="w-full h-full object-cover" />}
              </div>
              <p className="text-center text-sm text-muted-foreground">Your photo is ready, let's start dreaming!</p>
            </Card>
          </div>
          <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t("step_two")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">{t("share_title")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{t("share_tip")}</p>
            </div>
            <div className="mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-3 sm:mb-4">{t("popular_careers")}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {Object.values(CAREER_PRESETS).map((career) => (
                  <button
                    key={career.id}
                    onClick={() => {
                      setSelectedCareer(career.id === selectedCareer ? null : career.id);
                      if (career.id !== selectedCareer) setCustomDream("");
                    }}
                    className={cn("flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-300", selectedCareer === career.id ? "border-primary bg-primary/10 scale-105" : "border-border hover:border-primary/50 hover:bg-secondary")}
                  >
                    {(() => {
                      const Icon = CAREER_ICONS[career.id] || Sparkles;
                      return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />;
                    })()}
                    <span className="text-[10px] sm:text-xs font-medium text-foreground">{career.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm font-medium text-foreground">{t("describe_freely")}</p>
                <Button variant="outline" size="sm" onClick={toggleRecording} className={cn("gap-1.5 sm:gap-2 rounded-full text-xs sm:text-sm", isRecording && "bg-destructive text-destructive-foreground border-destructive")}>                  
                  {isRecording ? (<><MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{t("stop_recording")}</>) : (<><Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{t("voice_input")}</>)}
                </Button>
              </div>
              <div className="relative">
                <Textarea value={customDream} onChange={(e) => { setCustomDream(e.target.value); if (e.target.value) setSelectedCareer(null);} } placeholder={t("dream_placeholder")} className="min-h-[100px] sm:min-h-[120px] resize-none rounded-xl text-sm sm:text-base" />
                {isRecording && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 text-destructive text-xs sm:text-sm">
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                    {t("listening")}
                  </div>
                )}
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={!isValid} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-5 sm:py-6 text-base sm:text-lg gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
              {t("start_generating")}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
