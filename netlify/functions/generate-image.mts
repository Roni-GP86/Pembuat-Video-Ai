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
    const { prompt, style, aspectRatio } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: corsHeaders });
    }

    let base64Image = "";
    const activeKey = customKey || process.env.GEMINI_API_KEY;

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);
        let apiAspectRatio: any = "16:9";
        if (aspectRatio === "9:16" || aspectRatio === "portrait") {
          apiAspectRatio = "9:16";
        } else if (aspectRatio === "1:1" || aspectRatio === "square") {
          apiAspectRatio = "1:1";
        }

        const fullPrompt = `${prompt}. Art style: ${style || "Realistic"}. High fidelity, cinematic lighting, 8k resolution, masterwork composition.`;

        const imageResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp-image-generation",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          config: {
            responseModalities: ["IMAGE"],
          },
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

    // High-quality Unsplash fallback based on prompt keywords
    const promptLower = prompt.toLowerCase();
    let keywords = style ? style.toLowerCase() : "cinematic";

    if (promptLower.includes("free fire") || promptLower.includes("battle royale")) {
      keywords = "cyberpunk warrior shooter battle royale";
    } else if (promptLower.includes("bear") || promptLower.includes("super bear")) {
      keywords = "cute brown bear wilderness adventure";
    } else if (promptLower.includes("minecraft") || promptLower.includes("voxel")) {
      keywords = "minecraft blocky voxel landscape";
    } else if (promptLower.includes("kupu") || promptLower.includes("butterfly")) {
      keywords = "butterfly nature garden";
    } else if (promptLower.includes("danau") || promptLower.includes("lake")) {
      keywords = "beautiful lake mountain nature";
    } else if (promptLower.includes("ninja") || promptLower.includes("naruto")) {
      keywords = "japanese warrior anime action";
    } else if (promptLower.includes("bromo") || promptLower.includes("volcano")) {
      keywords = "indonesia volcano sunrise landscape";
    } else if (promptLower.includes("bali") || promptLower.includes("temple")) {
      keywords = "bali temple indonesia traditional";
    } else {
      // Extract meaningful words
      const words = prompt.split(/\s+/).filter((w: string) => w.length > 4).slice(0, 3);
      if (words.length > 0) {
        keywords = words.join(" ") + (style ? ` ${style.toLowerCase()}` : "");
      }
    }

    const isPortrait = aspectRatio === "9:16" || aspectRatio === "portrait";
    const dimension = isPortrait ? "720x1280" : "1200x675";
    const fallbackUrl = `https://images.unsplash.com/featured/${dimension}/?${encodeURIComponent(keywords.replace(/[^a-zA-Z0-9\s]/g, ""))}&sig=${Date.now()}`;

    return new Response(
      JSON.stringify({ image: fallbackUrl, isFallback: true, keywordsUsed: keywords }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error in generate-image:", error);
    const isPortrait = false;
    const fallbackUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
    return new Response(JSON.stringify({ image: fallbackUrl, isFallback: true }), { headers: corsHeaders });
  }
};

export const config = { path: "/api/generate-image" };
