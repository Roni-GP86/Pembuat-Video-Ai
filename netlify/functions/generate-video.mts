import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
}

/**
 * Build an optimized video prompt.
 * - If narration/dialogue is present, embed it so Veo 3 can generate matching audio.
 * - Adds cinematic quality keywords for better visual fidelity.
 */
function buildVideoPrompt(prompt: string, style: string, narration?: string): string {
  // Clean and enrich the base prompt
  let videoPrompt = `${prompt.trim()}. Cinematic art style: ${style || "Realistic"}. `
    + `Fluid natural motion, smooth transitions, high-definition 4K render, `
    + `professional lighting, camera movement matches the narrative pacing.`;

  // Inject narration/dialogue for Veo 3 audio generation
  if (narration && narration.trim().length > 0) {
    videoPrompt += ` SPOKEN NARRATION (generate clear Indonesian audio matching video): "${narration.trim()}"`;
  }

  return videoPrompt;
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
    const { prompt, style, aspectRatio, duration, image, narration } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;
    const activeKey = customKey || process.env.GEMINI_API_KEY;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), { status: 400, headers: corsHeaders });
    }

    if (activeKey) {
      const ai = getGeminiClient(customKey);

      let veoAspectRatio: "16:9" | "9:16" = "16:9";
      if (aspectRatio === "9:16" || aspectRatio === "portrait") {
        veoAspectRatio = "9:16";
      }

      const videoPrompt = buildVideoPrompt(prompt, style, narration);
      const durationSeconds = Math.min(Math.max(duration || 8, 5), 8); // Veo: 5-8 seconds per clip

      const config: any = {
        numberOfVideos: 1,
        durationSeconds,
        aspectRatio: veoAspectRatio,
      };

      // Try Veo 3.0 first (supports audio/narration generation),
      // then Veo 2.0 as fallback (video only)
      const modelsToTry = [
        "veo-3.0-generate-preview",   // Veo 3 — generates audio + video
        "veo-2.0-generate-001",        // Veo 2 — generates video only
      ];

      let lastError = "";

      for (const modelName of modelsToTry) {
        try {
          let operation;

          if (image && !image.includes("unsplash.com") && image.startsWith("data:")) {
            const match = image.match(/^data:([^;]+);base64,(.+)$/);
            const mimeType = match ? match[1] : "image/png";
            const imageBytes = match ? match[2] : image;

            operation = await ai.models.generateVideos({
              model: modelName,
              prompt: videoPrompt,
              image: { imageBytes, mimeType },
              config,
            });
          } else {
            operation = await ai.models.generateVideos({
              model: modelName,
              prompt: videoPrompt,
              config,
            });
          }

          console.log(`✅ Veo model ${modelName} started. Operation: ${operation.name}`);
          return new Response(
            JSON.stringify({
              operationName: operation.name,
              modelUsed: modelName,
              hasAudio: modelName.includes("3.0"),
            }),
            { headers: corsHeaders }
          );
        } catch (modelErr: any) {
          lastError = modelErr.message || "Unknown error";
          console.warn(`⚠️ Veo model ${modelName} failed: ${lastError}`);
        }
      }

      // All Veo models failed — return simulation with detailed error
      console.error("❌ All Veo models failed. Last error:", lastError);
      const simulatedOpName = `simulation_${style || "Realistic"}_${Date.now()}`;
      return new Response(
        JSON.stringify({
          operationName: simulatedOpName,
          isSimulated: true,
          veoError: lastError,
          message: "Veo API tidak dapat diakses dengan key ini. Menampilkan Demo Sinematik sebagai alternatif.",
        }),
        { headers: corsHeaders }
      );
    }

    // No API key at all
    const simulatedOpName = `simulation_${style || "Realistic"}_${Date.now()}`;
    return new Response(
      JSON.stringify({ operationName: simulatedOpName, isSimulated: true }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Critical error in generate-video:", error);
    const simulatedOpName = `simulation_Realistic_${Date.now()}`;
    return new Response(
      JSON.stringify({ operationName: simulatedOpName, isSimulated: true, error: error.message }),
      { headers: corsHeaders }
    );
  }
};

export const config = { path: "/api/generate-video" };
