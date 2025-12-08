import { CAREER_PRESETS } from "../src/shared/prompt/career-presets";
import { buildCareerHeadshotPrompt } from "../src/shared/prompt/builder";

function run() {
  const ids = Object.keys(CAREER_PRESETS).slice(0, 10);
  for (const id of ids) {
    const prompt = buildCareerHeadshotPrompt({ careerId: id, customText: CAREER_PRESETS[id].shortZh, locale: "mix" });
    console.log("-----", id);
    console.log(prompt);
  }
}

run();
