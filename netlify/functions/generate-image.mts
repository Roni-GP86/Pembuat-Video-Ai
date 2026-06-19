import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
}

// ─── Konstanta aturan visual Indonesia ───────────────────────────────────────
const INDONESIAN_BASE =
  "Indonesian characters only: warm tan/brown skin tone (sawo matang), straight short black hair, "
  + "round Southeast Asian facial features, dark brown eyes, flat nose — NO Western/European appearance.";

const SD_UNIFORM_MALE =
  "Indonesian male elementary school student (SD), age 9-10, wearing: crisp WHITE short-sleeve shirt "
  + "with white buttons and neat collar, SHORT RED pants (above the knee, NOT long trousers), "
  + "shiny black belt, polished black shoes, short white socks, small OSIS badge pinned on left chest pocket.";

const SD_UNIFORM_FEMALE =
  "Indonesian female elementary school student (SD), age 9-10, wearing: crisp WHITE short-sleeve shirt "
  + "with white buttons and neat collar, SHORT RED skirt (pleated, above the knee), "
  + "shiny black shoes, short white socks, small OSIS badge pinned on left chest pocket, "
  + "hair neatly tied or braided.";

const SD_ENVIRONMENT =
  "Indonesian elementary school setting: pastel yellow classroom walls, black/green chalkboard with "
  + "colorful chalk writing, wooden student desks, Pancasila poster and national hero photos on wall, "
  + "jalousie windows with golden morning sunlight streaming in, school flag pole visible outside.";

/** Detect whether prompt/theme is education-related */
function isEducationTheme(prompt: string, themeId?: string): boolean {
  if (themeId === "pendidikan") return true;
  const p = prompt.toLowerCase();
  return p.includes("sekolah") || p.includes("murid") || p.includes("belajar")
    || p.includes("guru") || p.includes("sd") || p.includes("kelas")
    || p.includes("pelajaran") || p.includes("school") || p.includes("student")
    || p.includes("classroom") || p.includes("teacher") || p.includes("education");
}

/** Build enriched prompt — smart context-aware Indonesian rules */
function buildEnrichedPrompt(prompt: string, style: string, themeId?: string): string {
  const p = prompt.toLowerCase();
  const isEdu = isEducationTheme(prompt, themeId);

  // ── Deteksi isi cerita spesifik ────────────────────────────────────────────
  const isSchoolScene  = p.includes("sekolah") || p.includes("kelas") || p.includes("murid")
    || p.includes("guru") || p.includes("classroom") || p.includes("school");
  const isButterfly    = p.includes("kupu") || p.includes("butterfly") || p.includes("metamorfosis");
  const isWaterCycle   = p.includes("siklus air") || p.includes("hujan") || p.includes("water cycle") || p.includes("uap");
  const isSpace        = p.includes("planet") || p.includes("tata surya") || p.includes("space") || p.includes("galaxy") || p.includes("astronot");
  const isAnimal       = p.includes("hewan") || p.includes("animal") || p.includes("mamalia") || p.includes("reptil");
  const isPlant        = p.includes("tumbuhan") || p.includes("pohon") || p.includes("plant") || p.includes("fotosintesis");
  const isOcean        = p.includes("laut") || p.includes("ocean") || p.includes("ikan") || p.includes("terumbu");
  const isVolcano      = p.includes("gunung berapi") || p.includes("bromo") || p.includes("volcano");
  const isHuman        = p.includes("orang") || p.includes("anak") || p.includes("karakter") || isSchoolScene;
  const isFreeFire     = p.includes("free fire") || p.includes("battle royale") || style === "Free Fire";
  const isBear         = p.includes("bear") || p.includes("beruang") || style === "Super Bear Adventure";
  const isMinecraft    = p.includes("minecraft") || p.includes("voxel") || style === "Minecraft";

  const styleTag = `Art style: ${style || "Realistic"}. Highly detailed, cinematic lighting, 8K resolution, masterwork composition.`;

  // ── Game/cartoon styles — tidak pakai karakter Indonesia ──────────────────
  if (isFreeFire) {
    return `${prompt}. Epic battle royale action scene, neon tactical gear, tropical war-zone environment, dramatic orange explosions, volumetric smoke. ${styleTag}`;
  }
  if (isBear) {
    return `${prompt}. Adorable fluffy brown bear cub, colorful cartoon forest, magical golden light, Pixar-quality render. ${styleTag}`;
  }
  if (isMinecraft) {
    return `${prompt}. Blocky voxel world, Indonesian village-inspired Minecraft landscape, warm sunbeam, RTX shaders. ${styleTag}`;
  }

  // ── Edukasi: SERAGAM SD hanya jika isi cerita memang di sekolah/kelas ─────
  if (isEdu && isSchoolScene) {
    return `${prompt}. ${SD_UNIFORM_MALE} Also show ${SD_UNIFORM_FEMALE} `
      + `${SD_ENVIRONMENT} ${styleTag} ${INDONESIAN_BASE}`;
  }

  // ── Edukasi: isi cerita adalah fenomena alam/sains — tampilkan objeknya ───
  if (isEdu && !isHuman) {
    if (isButterfly)
      return `${prompt}. Macro close-up of colorful tropical butterfly in metamorphosis stages on lush green leaf, Indonesian jungle background, golden morning sunlight, ultra-detailed wings texture, photorealistic. ${styleTag}`;
    if (isWaterCycle)
      return `${prompt}. Beautiful natural water cycle illustration: fluffy clouds above misty Indonesian mountains, gentle rain falling on terraced rice fields, river flowing down, evaporation mist rising in golden light, photorealistic. ${styleTag}`;
    if (isSpace)
      return `${prompt}. Stunning photorealistic solar system visualization: planets with accurate textures, asteroid belt, deep space stars, dramatic side lighting, cosmic depth. ${styleTag}`;
    if (isAnimal)
      return `${prompt}. Stunning wildlife photograph of Indonesian animal in natural habitat, lush tropical rainforest background, golden hour lighting, National Geographic quality. ${styleTag}`;
    if (isPlant)
      return `${prompt}. Beautiful macro botanical photograph: Indonesian tropical plant with intricate leaf textures, dew drops, soft natural lighting, vivid green colors. ${styleTag}`;
    if (isOcean)
      return `${prompt}. Stunning underwater photograph of colorful coral reef, tropical fish, crystal clear blue water, sunbeams penetrating surface, Raja Ampat style. ${styleTag}`;
    if (isVolcano)
      return `${prompt}. Dramatic photograph of Indonesian volcano: misty caldera, glowing lava, dramatic clouds, powerful natural spectacle. ${styleTag}`;
    // Generic education phenomenon
    return `${prompt}. Vivid educational illustration of the concept, photorealistic, high detail, Indonesian tropical context, beautiful cinematic lighting. ${styleTag}`;
  }

  // ── Edukasi dengan karakter manusia tapi bukan di sekolah ─────────────────
  if (isEdu && isHuman) {
    return `${prompt}. Indonesian child aged 9-10 (${INDONESIAN_BASE}) exploring or observing the subject with curiosity and wonder, casual Indonesian clothing appropriate to the setting. ${styleTag}`;
  }

  // ── Konten umum non-edukasi — karakter Indonesia kontekstual ──────────────
  let characterRule = INDONESIAN_BASE;
  if (p.includes("petani") || p.includes("farmer"))
    characterRule += " Indonesian farmer: woven bamboo caping hat, simple indigo shirt, working in terraced rice fields.";
  else if (p.includes("pramuka") || p.includes("scout"))
    characterRule += " Indonesian boy scout: dark brown shirt, SHORT brown pants, red-white triangular kacu neckerchief, pramuka hat.";
  else if (p.includes("guru") || p.includes("teacher"))
    characterRule += " Indonesian teacher: blue-white PGRI batik shirt, formal dark trousers, holding chalk or book.";

  return `${prompt}. ${characterRule} ${styleTag}`;
}

/** Smart Unsplash keywords — based on actual content, not just theme */
function pickUnsplashKeywords(prompt: string, style: string, themeId?: string): string {
  const p = prompt.toLowerCase();
  const isEdu = isEducationTheme(prompt, themeId);

  // Game/cartoon
  if (p.includes("free fire") || p.includes("battle royale")) return "cyberpunk warrior action combat";
  if (p.includes("bear") || p.includes("beruang"))            return "cute brown bear forest adventure";
  if (p.includes("minecraft") || p.includes("voxel"))         return "minecraft voxel blocky landscape";

  // Education — keyword based on SUBJECT, not theme
  if (isEdu) {
    if (p.includes("kupu") || p.includes("butterfly") || p.includes("metamorfosis")) return "butterfly metamorphosis nature macro";
    if (p.includes("siklus air") || p.includes("hujan") || p.includes("water cycle")) return "water cycle rain clouds nature";
    if (p.includes("planet") || p.includes("tata surya") || p.includes("space"))      return "solar system planets space stars";
    if (p.includes("hewan") || p.includes("animal") || p.includes("mamalia"))         return "indonesian wildlife animal nature";
    if (p.includes("tumbuhan") || p.includes("pohon") || p.includes("fotosintesis"))  return "tropical plant leaf nature macro";
    if (p.includes("laut") || p.includes("ikan") || p.includes("terumbu"))            return "coral reef underwater ocean indonesia";
    if (p.includes("gunung berapi") || p.includes("bromo") || p.includes("volcano"))  return "volcano indonesia bromo eruption";
    if (p.includes("sekolah") || p.includes("kelas") || p.includes("murid"))          return "indonesian school children classroom";
    // Generic education — show the topic
    const words = prompt.split(/\s+/).filter((w: string) => w.length > 4).slice(0, 3);
    return words.length > 0 ? words.join(" ") + " indonesia education" : "indonesia education children";
  }

  // General content
  if (p.includes("bromo") || p.includes("volcano"))    return "bromo volcano indonesia sunrise";
  if (p.includes("bali") || p.includes("temple"))      return "bali temple indonesia traditional";
  if (p.includes("raja ampat") || p.includes("laut"))  return "raja ampat indonesia ocean turquoise";
  if (p.includes("hutan") || p.includes("forest"))     return "tropical rainforest indonesia";
  if (p.includes("desa") || p.includes("village"))     return "indonesia village rice field rural";
  if (p.includes("ninja") || p.includes("naruto"))     return "japanese warrior anime action";
  if (p.includes("space") || p.includes("galaxy"))     return "outer space galaxy stars";
  if (p.includes("naga") || p.includes("dragon"))      return "fantasy dragon fire epic";
  if (p.includes("kupu") || p.includes("butterfly"))   return "butterfly nature garden";

  const words = prompt.split(/\s+/).filter((w: string) => w.length > 4).slice(0, 3);
  return words.length > 0
    ? words.join(" ") + (style ? ` ${style.toLowerCase()}` : " cinematic")
    : `${style || "cinematic"} indonesia landscape`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { prompt, style, aspectRatio, themeId } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: corsHeaders });
    }

    const activeKey = customKey || process.env.GEMINI_API_KEY;
    let base64Image = "";

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);
        let apiAspectRatio: any = "16:9";
        if (aspectRatio === "9:16" || aspectRatio === "portrait") apiAspectRatio = "9:16";
        else if (aspectRatio === "1:1" || aspectRatio === "square") apiAspectRatio = "1:1";

        const fullPrompt = buildEnrichedPrompt(prompt, style, themeId);

        const imageResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp-image-generation",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          config: { responseModalities: ["IMAGE"] },
        });

        if (imageResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if ((part as any).inlineData) {
              const inlineData = (part as any).inlineData;
              base64Image = `data:${inlineData.mimeType || "image/png"};base64,${inlineData.data}`;
              break;
            }
          }
        }
      } catch (innerError: any) {
        console.warn("Gemini image generation failed, using Unsplash fallback:", innerError.message);
      }
    }

    if (base64Image) {
      return new Response(JSON.stringify({ image: base64Image }), { headers: corsHeaders });
    }

    // ── Unsplash fallback with smart Indonesian keyword matching ────────────
    const keywords = pickUnsplashKeywords(prompt, style, themeId);
    const isPortrait = aspectRatio === "9:16" || aspectRatio === "portrait";
    const dimension = isPortrait ? "720x1280" : "1200x675";
    const fallbackUrl = `https://images.unsplash.com/featured/${dimension}/?${encodeURIComponent(keywords.replace(/[^a-zA-Z0-9\s]/g, ""))}&sig=${Date.now()}`;

    return new Response(
      JSON.stringify({ image: fallbackUrl, isFallback: true, keywordsUsed: keywords }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error in generate-image:", error);
    const fallbackUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";
    return new Response(JSON.stringify({ image: fallbackUrl, isFallback: true }), { headers: corsHeaders });
  }
};

export const config = { path: "/api/generate-image" };
