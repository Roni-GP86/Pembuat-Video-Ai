import type { Context } from "@netlify/functions";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

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
    const { prompt, style, aspectRatio, duration, image } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;
    const activeKey = customKey || process.env.GEMINI_API_KEY;

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);
        const modelName = "veo-2.0-generate-001"; // stable veo model
        let veoAspectRatio: "16:9" | "9:16" = "16:9";
        if (aspectRatio === "9:16" || aspectRatio === "portrait") {
          veoAspectRatio = "9:16";
        }

        const videoPrompt = `${prompt}. Art style: ${style || "Realistic"}. Majestic fluid motion, spectacular cinematic visual transitions, high-definition render, character appearance remains identical throughout.`;

        const config: any = {
          numberOfVideos: 1,
          durationSeconds: Math.min(duration || 8, 8), // Veo max 8 seconds per clip
          aspectRatio: veoAspectRatio,
        };

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

        return new Response(
          JSON.stringify({ operationName: operation.name }),
          { headers: corsHeaders }
        );
      } catch (innerError: any) {
        console.warn("Real Veo launch failed, switching to simulation mode:", innerError.message);
      }
    }

    // Graceful simulation fallback
    const simulatedOpName = `simulation_${style || "Realistic"}_${Date.now()}`;
    return new Response(
      JSON.stringify({ operationName: simulatedOpName, isSimulated: true }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error in generate-video:", error);
    const simulatedOpName = `simulation_Realistic_${Date.now()}`;
    return new Response(
      JSON.stringify({ operationName: simulatedOpName, isSimulated: true }),
      { headers: corsHeaders }
    );
  }
};

export const config = { path: "/api/generate-video" };
