import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { prompt, style, aspectRatio, duration } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: corsHeaders });
    }

    let enhancedPrompt = "";
    const activeKey = customKey || process.env.GEMINI_API_KEY;
    const animDuration = duration || 15;

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);
        const systemInstruction = `You are an expert AI Video prompt engineer. Take the user's basic vision, style, and output form, and refine it into an exceptionally descriptive visual scene descriptor suited for high-fidelity AI video generation models (like Veo or Imagen).

CRITICAL MANDATES:
1. THE ENHANCED PROMPT MUST BE EXTREMELY DETAILED, COMPLETE, METICULOUS, AND COMPREHENSIVE.
2. DURATION ADAPTATION: Explicitly specify the animation duration of exactly "${animDuration} seconds" within the prompt text. Describe the speed, fluid pacing, and gradual slow evolution of actions over this duration of ${animDuration} seconds.

INDONESIAN CULTURE RULE:
If the vision involves Indonesian subjects:
- Indonesian students: wearing red-and-white ('merah-putih') public elementary school uniform with red tie, or the brown 'Pramuka' scout uniform with red-and-white triangular neckerchief ('kacu').
- Indonesian teachers: wearing blue-and-white PGRI batik patterned shirts or neat civil servant uniforms.
- Indonesian farmers: wearing rustic bamboo 'caping' hats, simple shirts, in misty terraced emerald-green rice fields ('terasering padi').
- Indonesian culture: traditional clothing ('pakaian adat'), local foods (tumpeng, rendang), dramatic landscapes (Mount Bromo, Raja Ampat).

Include details on:
- Detailed subject action, physical features, facial expressions.
- Environment setting, textures, materials, clothing.
- Lighting (volumetric gold rays, magical glows, sunset rim light, cinematic shadows).
- Cinematic camera motion mapped to ${animDuration}-second duration (slow panning, sweeping tracking, soft zoom, subtle parallax).
- Micro atmosphere (floating dust motes, gentle rain, golden ember sparks).
- Specific artistic style nuances.
Keep the enhanced prompt highly creative, atmospheric, complete, under 180 words. Return ONLY the final enhanced description string in English, NO introductory text, NO quotes, NO codeblocks.`;

        const userMessage = `Refine this vision: "${prompt}" in a "${style || "Realistic"}" art style with "${aspectRatio || "16:9"}" aspect ratio, designed to fit an animation duration of ${animDuration} seconds.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userMessage,
          config: {
            systemInstruction,
            temperature: 1.0,
          },
        });

        enhancedPrompt = response.text?.trim() || "";
      } catch (geminiError: any) {
        console.warn("Gemini enhancement failed, using local fallback:", geminiError.message);
      }
    }

    if (!enhancedPrompt) {
      const isFreeFire = prompt.toLowerCase().includes("free fire") || style === "Free Fire";
      const isBear = prompt.toLowerCase().includes("bear") || style === "Super Bear Adventure";
      const isMinecraft = prompt.toLowerCase().includes("minecraft") || style === "Minecraft";

      if (isFreeFire) {
        enhancedPrompt = `Epic action cinematic of ${prompt}. Dynamic combat stance, glowing neon tactical gear, orange sparks falling, volumetric dark fog, slow panning camera, intense battle royale masterpiece, ultra-detailed textures. ${animDuration} seconds duration.`;
      } else if (isBear) {
        enhancedPrompt = `Adorable 3D cartoon of ${prompt}. Cheerful cute brown bear leaping over grass, floating magical golden stars, soft ambient cartoon lighting, vibrant sky, joyful Pixar-like animation. ${animDuration} seconds duration.`;
      } else if (isMinecraft) {
        enhancedPrompt = `Immersive voxel 3D pixel universe of ${prompt}. Blocky wooden cabins, reflective voxel river, warm volumetric sun beams radiating, serene scenic landscape, high-fidelity shaders. ${animDuration} seconds duration.`;
      } else {
        enhancedPrompt = `${prompt}. Beautiful artistic rendition, art style of ${style || "Realistic"}, dramatic cinematic lighting, slow sweeping camera motion, highly detailed and atmosphere-rich, ${animDuration} seconds duration.`;
      }
    }

    return new Response(JSON.stringify({ enhancedPrompt }), { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error in enhance-prompt:", error);
    return new Response(JSON.stringify({ enhancedPrompt: "", error: error.message }), { status: 500, headers: corsHeaders });
  }
};

export const config = { path: "/api/enhance-prompt" };
