import { CAREER_PRESETS, getCareerById } from "./career-presets";

export type HeadshotOptions = {
  careerId?: string;
  customText?: string;
  locale?: "zh" | "en" | "mix";
  stylePreset?: "business" | "magazine" | "campus";
  qualityPreset?: "studio" | "outdoor";
  safetyLevel?: "standard" | "strict";
  useChineseAppend?: boolean;
};

function sanitize(text?: string, maxLen = 200): string {
  if (!text) return "";
  let t = text.replace(/https?:\/\/\S+/gi, "");
  t = t.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, "");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length > maxLen) t = t.slice(0, maxLen);
  return t;
}

function buildCareerDetail(id?: string): string {
  const c = getCareerById(id);
  if (!c) return "Professional adult portrait";
  const attire = c.attire.join(", ");
  const scene = c.scene.join(", ");
  const props = c.props.join(", ");
  return `Professional adult ${c.nameEn} image, wearing ${attire}, in ${scene}${props ? ", with " + props : ""}`;
}

function photographyPreset(p: HeadshotOptions): string {
  const studio = `professional headshot, upper body, centered composition, neutral gray background, 85mm lens, f/2.8, soft studio lighting, crisp focus, minimal shadows`;
  const outdoor = `professional portrait, upper body, centered composition, natural background, 85mm lens, f/2.8, soft daylight, shallow depth of field, crisp focus`;
  return p.qualityPreset === "outdoor" ? outdoor : studio;
}

function negativePreset(p: HeadshotOptions): string {
  const base = [
    "no text overlay",
    "no watermark",
    "no cartoon",
    "no distortion",
    "no double exposure",
    "no multiple faces",
    "no extreme makeup",
  ];
  if (p.safetyLevel === "strict") {
    base.push("no child appearance", "no teen appearance");
  }
  return base.join(", ");
}

export function buildCareerHeadshotPrompt(options: HeadshotOptions): string {
  const defaults: HeadshotOptions = { locale: "mix", qualityPreset: "studio", safetyLevel: "strict", useChineseAppend: true };
  const o: HeadshotOptions = { ...defaults, ...options };
  const detail = buildCareerDetail(o.careerId);
  const extra = sanitize(o.customText);
  const quality = photographyPreset(o);
  const negative = negativePreset(o);
  const zhAppend = o.useChineseAppend && o.locale !== "en" && extra ? `附加说明：${extra}` : "";
  const enAppend = extra ? `Additional details: ${extra}` : "";
  const lines = [
    "Transform the child in the photo into an adult professional image.",
    "Keep identical facial features from the original photo; same identity; same face shape and proportions; same skin tone; same eyes, nose and lips.",
    "Target age: 26 years old adult.",
    `Career image: ${detail}.`,
    enAppend,
    `Image quality: ${quality}.`,
    `Negative: ${negative}.`,
    zhAppend,
  ].filter(Boolean);
  return lines.join("\n\n");
}
