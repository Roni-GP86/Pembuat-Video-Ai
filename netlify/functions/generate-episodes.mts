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
    const { storyIdea, count, style, aspectRatio } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!storyIdea) {
      return new Response(JSON.stringify({ error: "Story idea is required" }), { status: 400, headers: corsHeaders });
    }

    const activeKey = customKey || process.env.GEMINI_API_KEY;
    const stepsCount = Math.min(count || 3, 6); // max 6 scenes
    let result: any = null;

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);

        const systemInstruction = `You are an expert cinematic director and storyboard artist specializing in Indonesian cultural narratives and highly consistent visual storytelling.
Generate ${stepsCount} sequential storyboard episodes from a single concept.

CRITICAL CHARACTER CONSISTENCY RULES:
1. ALL episodes MUST feature the EXACT same main character — same face, hair, body, clothing colors, and distinguishing markers throughout every scene.
2. DURATION: Each episode prompt MUST explicitly embed the duration target of "15 seconds" (e.g., "This 15-second wide shot slowly pans...").
3. INDONESIAN ELEMENTS — when applicable:
   - Students: wearing red-and-white ('merah-putih') elementary school uniform with red necktie and breast pocket badge, OR earthy brown 'Pramuka' scout uniform with red-and-white triangular neckerchief ('kacu').
   - Teachers: wearing blue-and-white PGRI batik shirts or official brown civil service uniforms.
   - Farmers: wearing woven bamboo 'caping' hats, working in terraced green paddy fields ('terasering padi').
   - Settings: Use Javanese blangkon, Balinese udeng, colorful kebaya, Javanese surjan. Feature Indonesian foods (tumpeng, rendang, sate) or landscapes (Mount Bromo, Raja Ampat, bamboo stilt homes).
4. In "characterDescription": state EXTREMELY detailed character physical descriptors (age, skin tone, hair, clothing colors, key distinguishing features).
5. REPEAT the character physical descriptors verbatim in EVERY single episode's "enhancedPrompt" — this guarantees character consistency across AI generators.
6. "title" fields MUST be in Bahasa Indonesia. "enhancedPrompt" MUST be in highly detailed visual English.

Respond ONLY in valid JSON matching this schema:
{
  "characterDescription": "extremely detailed description of recurring character (same face, exact hair, clothing, body, skin tone)",
  "episodes": [
    {
      "number": 1,
      "title": "Judul adegan dalam Bahasa Indonesia",
      "enhancedPrompt": "Highly descriptive English visual prompt with repeated character details and explicit 15 seconds duration pacing"
    }
  ]
}

Return ONLY valid raw JSON — no markdown, no codeblocks, no other text.`;

        const userMsg = `Generate ${stepsCount} consecutive storyboard scenes for: "${storyIdea}". Art style: ${style || "Realistic"}. Aspect ratio: ${aspectRatio || "16:9"}. Ensure the protagonist remains EXACTLY identical in appearance throughout ALL scenes.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userMsg,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        });

        const text = response.text?.trim() || "";
        try {
          result = JSON.parse(text);
        } catch {
          const cleanText = text.replace(/```json|```/gi, "").trim();
          result = JSON.parse(cleanText);
        }
      } catch (innerErr: any) {
        console.warn("Gemini storyboard generation failed, using local fallback:", innerErr.message);
      }
    }

    if (!result) {
      const mainChar = `A protagonist character in ${style || "Realistic"} visual style matching the story theme.`;
      result = {
        characterDescription: mainChar,
        episodes: Array.from({ length: stepsCount }, (_, idx) => {
          const stepNum = idx + 1;
          const titles = [
            "Permulaan Perjalanan",
            "Rintangan & Penelusuran",
            "Penemuan & Klimaks Cerita",
            "Puncak Ketegangan",
            "Resolusi & Kedamaian",
            "Epilog & Penutup",
          ];
          return {
            number: stepNum,
            title: `Adegan ${stepNum}: ${titles[idx] || `Episode ${stepNum}`}`,
            enhancedPrompt: `Storyboard step ${stepNum}/${stepsCount} of "${storyIdea}". Character: ${mainChar}. This 15-second cinematic shot features the character in a dramatic ${style || "Realistic"} environment, ${stepNum === 1 ? "beginning the journey with hope" : stepNum === stepsCount ? "triumphantly completing the quest" : "advancing through challenges"}. Slow cinematic camera panning, rich atmospheric lighting, ${aspectRatio || "16:9"} aspect ratio.`,
          };
        }),
      };
    }

    // Attach Unsplash thumbnail images to each episode
    if (result?.episodes) {
      const isPortrait = aspectRatio === "9:16";
      const dimension = isPortrait ? "720x1280" : "1200x675";

      result.episodes = result.episodes.map((ep: any, index: number) => {
        if (ep.imageUrl) return ep; // preserve if already set

        const text = `${ep.title || ""} ${ep.enhancedPrompt || ""}`.toLowerCase();
        let keywords = style || "cinematic";

        if (text.includes("butterfly") || text.includes("kupu")) keywords = "butterfly nature metamorphosis";
        else if (text.includes("bear")) keywords = "cute bear adventure forest";
        else if (text.includes("minecraft") || text.includes("voxel")) keywords = "minecraft blocky world";
        else if (text.includes("free fire") || text.includes("battle royale")) keywords = "epic warrior action";
        else if (text.includes("water") || text.includes("rain") || text.includes("hujan")) keywords = "rain water nature";
        else if (text.includes("school") || text.includes("sekolah") || text.includes("murid")) keywords = "school children indonesia village";
        else if (text.includes("ninja") || text.includes("naruto")) keywords = "japanese ninja warrior";
        else if (text.includes("space") || text.includes("galaxy") || text.includes("planet")) keywords = "outer space galaxy stars";
        else if (text.includes("village") || text.includes("desa")) keywords = "indonesia village nature";
        else if (text.includes("bromo") || text.includes("volcano")) keywords = "bromo volcano indonesia";
        else {
          const descriptive = ["gorgeous nature scenery", "mystical cinematic atmosphere", "vibrant fantasy adventure", "epic cinematic photography", "magical golden light", "dramatic landscape"];
          keywords = descriptive[index % descriptive.length];
        }

        const fallbackUrl = `https://images.unsplash.com/featured/${dimension}/?${encodeURIComponent(keywords.replace(/[^a-zA-Z0-9\s]/g, ""))}&sig=${Date.now() + index}`;
        return { ...ep, imageUrl: fallbackUrl };
      });
    }

    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error in generate-episodes:", error);
    return new Response(JSON.stringify({ error: "Failed to generate storyboard: " + error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const config = { path: "/api/generate-episodes" };
