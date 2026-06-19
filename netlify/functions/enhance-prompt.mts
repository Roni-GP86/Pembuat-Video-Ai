import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
}

// ─── Indonesian character & scene templates ───────────────────────────────────
const INDONESIAN_CHARACTER_RULES = `
WAJIB — KARAKTER INDONESIA ASLI:
Semua karakter HARUS tampak Indonesia: kulit sawo matang/cokelat hangat, rambut hitam lurus/ikal, hidung pesek mungil, mata sipit cokelat gelap, wajah bulat khas Jawa/Sunda/Batak/Melayu. JANGAN gunakan karakter Eropa/Barat.

SERAGAM MURID SD INDONESIA (WAJIB DETAIL PENUH bila tema pendidikan/sekolah):
- Kemeja putih bersih lengan pendek dengan kancing putih, kerah berdiri rapi
- Celana pendek merah untuk laki-laki (panjang di atas lutut) ATAU rok pendek merah untuk perempuan (panjang di atas lutut)
- Sabuk hitam mengkilap
- Sepatu hitam mengkilap + kaos kaki putih pendek
- Topi merah putih bundar saat upacara
- Tas ransel sekolah merah/hitam
- Lencana OSIS kecil di dada kiri

SERAGAM GURU SD INDONESIA:
- Kemeja batik PGRI biru-putih atau seragam dinas cokelat muda resmi
- Celana/rok gelap, sepatu formal hitam, ID card merah

SERAGAM PRAMUKA (bila ada kegiatan scout):
- Baju cokelat tua lengan pendek
- Celana cokelat pendek + kacu segitiga merah-putih diikat di leher
- Topi pramuka cokelat, lencana tunas kelapa di dada

LINGKUNGAN SD INDONESIA:
- Kelas dengan papan tulis hitam/hijau, bangku kayu, foto pahlawan di dinding
- Halaman sekolah dengan tiang bendera, lapangan tanah merah, pohon mangga/rambutan
- Kantin sekolah dengan makanan: nasi goreng, mie goreng, bakso, es teh
`;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { prompt, style, aspectRatio, duration, themeId } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: corsHeaders });
    }

    const activeKey = customKey || process.env.GEMINI_API_KEY;
    const animDuration = duration || 15;
    const isEducation = themeId === "pendidikan" || prompt.toLowerCase().includes("sekolah")
      || prompt.toLowerCase().includes("murid") || prompt.toLowerCase().includes("belajar")
      || prompt.toLowerCase().includes("guru") || prompt.toLowerCase().includes("sd");

    let enhancedPrompt = "";
    let indonesianNarration = "";

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);

        const systemInstruction = `Kamu adalah Prompt Engineer AI Video profesional kelas dunia, spesialis konten Indonesia.
Tugasmu: ubah visi sederhana pengguna menjadi prompt video AI yang SANGAT DETAIL, REALISTIS, dan LENGKAP untuk model Veo/Imagen.

${INDONESIAN_CHARACTER_RULES}

ATURAN PROMPT WAJIB:
1. SANGAT DETAIL: Deskripsikan SETIAP elemen visual — ekspresi wajah, tekstur kain, pantulan cahaya, bayangan, gerakan rambut, warna mata, detail pakaian sampai jahitan.
2. DURASI EKSPLISIT: Wajib sebutkan "durasi ${animDuration} detik" dan jelaskan pacing gerak kamera selama ${animDuration} detik itu.
3. KAMERA SINEMATIK: Sebutkan jenis shot (wide shot, medium shot, close-up), gerakan kamera (slow pan, tracking shot, dolly in, crane shot), dan lensa (telephoto bokeh, wide angle).
4. PENCAHAYAAN: Deskripsikan sumber cahaya (sinar matahari pagi, lampu kelas, obor api), warna cahaya, bayangan, dan mood.
5. ATMOSFER: Angin sepoi-sepoi, debu beterbangan, daun bergerak, suara keramaian sekolah.
6. KONSISTENSI KARAKTER: Ulangi deskripsi fisik karakter PERSIS SAMA di setiap prompt.

NARASI BAHASA INDONESIA:
Buat juga narasi singkat (2-3 kalimat) dalam BAHASA INDONESIA yang akan dibacakan sebagai voice-over video. Narasi harus hangat, edukatif, dan sesuai tema.

Kembalikan HANYA JSON valid:
{
  "enhancedPrompt": "prompt visual lengkap dalam bahasa Inggris",
  "indonesianNarration": "narasi 2-3 kalimat bahasa Indonesia untuk voice-over"
}`;

        const userMessage = `Buat prompt video AI untuk visi ini: "${prompt}"
Gaya seni: ${style || "Realistis"}
Rasio layar: ${aspectRatio || "16:9"}  
Durasi: ${animDuration} detik
Tema: ${isEducation ? "Pendidikan SD Indonesia" : themeId || "Umum"}
${isEducation ? "WAJIB: Gunakan murid SD Indonesia dengan seragam PUTIH + MERAH PENDEK yang sangat detail!" : ""}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userMessage,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.9,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        enhancedPrompt = parsed.enhancedPrompt || "";
        indonesianNarration = parsed.indonesianNarration || "";
      } catch (geminiError: any) {
        console.warn("Gemini enhancement failed:", geminiError.message);
      }
    }

    // ── Local fallback — still Indonesian-specific ──────────────────────────
    if (!enhancedPrompt) {
      const p = prompt.toLowerCase();
      const isFF = p.includes("free fire") || style === "Free Fire";
      const isBear = p.includes("bear") || style === "Super Bear Adventure";
      const isMC = p.includes("minecraft") || style === "Minecraft";

      if (isEducation) {
        enhancedPrompt = `Cinematic ${animDuration}-second scene: Indonesian elementary school boy aged 9-10, tan warm brown skin, short straight black hair, wearing crisp white short-sleeve shirt and RED SHORT pants (above knee), shiny black belt, black shoes with white socks, small OSIS badge on left chest. ${prompt}. Warm golden morning sunlight streaming through jalousie windows of Indonesian classroom, wooden desks, black chalkboard with colorful chalk drawings, Pancasila poster and hero photos on pastel yellow walls. Medium shot slowly tracking forward at eye level, gentle classroom ambient sound, dust motes floating in sunbeams. Art style: ${style || "Realistic"}. ${animDuration} seconds duration.`;
        indonesianNarration = `Di sebuah sekolah dasar Indonesia yang penuh semangat, seorang murid yang berdedikasi sedang ${prompt}. Inilah momen belajar yang menginspirasi bagi generasi masa depan bangsa.`;
      } else if (isFF) {
        enhancedPrompt = `Epic ${animDuration}-second cinematic battle royale sequence: Indonesian teenage warrior with tan skin, black hair, wearing neon-orange tactical vest over dark military fatigues, boots, running across war-torn tropical Indonesian jungle. Dramatic orange explosions in background, volumetric smoke, slow-motion sparks flying, neon tactical HUD elements, intense Free Fire game art style. Dynamic tracking shot from low angle, cinematic motion blur. ${animDuration} seconds duration.`;
        indonesianNarration = `Di medan pertempuran yang penuh ketegangan, sang pejuang muda menghadapi rintangan dengan keberanian luar biasa. Setiap langkah adalah perjuangan menuju kemenangan.`;
      } else if (isBear) {
        enhancedPrompt = `Adorable ${animDuration}-second 3D cartoon adventure: fluffy round brown bear cub with big sparkly eyes exploring colorful Indonesian forest with giant tropical flowers and butterflies. Warm soft Pixar-style lighting, floating magical golden star particles, vibrant emerald green grass, cheerful Pixar-style animation, wide establishing shot slowly zooming in. ${animDuration} seconds duration.`;
        indonesianNarration = `Si Beruang kecil memulai petualangan barunya yang menakjubkan di hutan tropis yang penuh warna dan keajaiban. Setiap sudut hutan menyimpan kejutan yang menunggu untuk ditemukan!`;
      } else if (isMC) {
        enhancedPrompt = `Immersive ${animDuration}-second voxel Minecraft world: blocky Indonesian village with wooden stilt houses, pixelated palm trees, reflective blocky river, warm volumetric golden sunbeams, green grassy hills with blocky flowers, high-fidelity RTX shaders with realistic reflections. Slow cinematic drone pan over landscape. ${animDuration} seconds duration.`;
        indonesianNarration = `Dunia Minecraft yang menakjubkan ini terinspirasi dari keindahan desa Indonesia yang asri. Mari jelajahi setiap sudut dunia voxel yang penuh kreativitas ini bersama-sama!`;
      } else {
        enhancedPrompt = `${animDuration}-second cinematic scene: ${prompt}. Indonesian setting with authentic local atmosphere. Art style: ${style || "Realistic"}. Dramatic cinematic lighting, slow sweeping camera motion, ultra-detailed textures and atmosphere. ${animDuration} seconds duration.`;
        indonesianNarration = `Sebuah momen yang indah dan menakjubkan terbentang di hadapan kita. ${prompt} — kisah yang akan selalu dikenang dalam ingatan.`;
      }
    }

    return new Response(JSON.stringify({ enhancedPrompt, indonesianNarration }), { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error in enhance-prompt:", error);
    return new Response(
      JSON.stringify({ enhancedPrompt: "", indonesianNarration: "", error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config = { path: "/api/enhance-prompt" };
