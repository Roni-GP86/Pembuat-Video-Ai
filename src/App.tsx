import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Film, 
  Upload, 
  Tv, 
  Smartphone, 
  Clock, 
  Flame, 
  RotateCcw, 
  HelpCircle, 
  Trash2, 
  History, 
  Check, 
  Layers, 
  Image as ImageIcon, 
  Video, 
  Zap,
  BookOpen,
  Globe,
  Key,
  Plus,
  X,
  Mic2,
  BookText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import CinematicPlayer from "./components/CinematicPlayer";
import VeoPlayer from "./components/VeoPlayer";

interface HistoryItem {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  duration: number;
  imageUrl: string;
  mode: "text" | "image";
  timestamp: string;
}

const INSPIRED_PROMPTS = [
  {
    title: "Free Fire Cinematic",
    prompt: "An epic battle royale warrior with glowing yellow-orange cyber wings holding a glowing tactical rifle, neon sparks flying, dramatic military trailer scene, ultra extreme action style.",
    style: "Free Fire",
    aspectRatio: "16:9",
    duration: 15
  },
  {
    title: "Super Bear Valley",
    prompt: "A cute classic cartoon brown bear with a blue backpack happily leaping over floating golden star coins in a magical green grassy forest landscape, Super Bear Adventure 3D game aesthetic.",
    style: "Super Bear Adventure",
    aspectRatio: "16:9",
    duration: 25
  },
  {
    title: "Minecraft Cozy Woods",
    prompt: "A beautiful detailed wooden block cabin next to a clear reflective voxel river, gorgeous orange volumetric sun beams setting in the background, immersive Minecraft shaders look.",
    style: "Minecraft",
    aspectRatio: "16:9",
    duration: 20
  },
  {
    title: "Kucing Penyihir Pixar",
    prompt: "An adorable fluffy orange kitten wearing a golden wizard hat, reading a miniature glowing book of spells inside a fantasy library, Pixar 3D cute cartoon style.",
    style: "Pixar",
    aspectRatio: "9:16",
    duration: 15
  }
];

interface PresetSubtheme {
  id: string;
  title: string;
  emoji: string;
  description: string;
  promptText: string;
  storyIdeaText: string;
  recommendedStyle: string;
  recommendationReason: string;
}

interface PresetTheme {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  subthemes: PresetSubtheme[];
}

const THEMATIC_PRESETS: PresetTheme[] = [
  {
    id: "pendidikan",
    title: "Edukasi & Pembelajaran",
    icon: "BookOpen",
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/10 to-transparent",
    borderColor: "border-emerald-500/20",
    subthemes: [
      {
        id: "kupu-kupu",
        title: "Daur Hidup Kupu-kupu",
        emoji: "🦋",
        description: "Metamorfosis telur, ulat kecil imut, kepompong menggantung, hingga bersayap indah berkilau.",
        promptText: "Edukasi Biologi: Seekor ulat hijau gemuk berwajah lucu bertengger di daun hijau segar, bersiap membungkus dirinya menjadi kepompong sutra berkilauan emas, gaya animasi 3D Pixar yang lembut dengan pencahayaan matahari pagi menyelinap halus.",
        storyIdeaText: "Kisah metamorfosis 'Kiko' si ulat bulu ramah yang belajar menghadapi kepompong hingga bersayap indah. Episode 1: Kiko bertualang memakan daun hijau termanis di taman. Episode 2: Kiko merajut kantung kepompong pelindung yang bersinar keemasan. Episode 3: Kiko keluar sebagai kupu-kupu bersayap sutra pelangi terbang mengitari bunga matahari.",
        recommendedStyle: "Pixar",
        recommendationReason: "Gaya animasi Pixar 3D yang lembut dan hangat sangat ideal untuk sains anak-anak karena membuat serangga terasa menggemaskan, ramah lingkungan, dan ekspresif!"
      },
      {
        id: "siklus-air",
        title: "Siklus Air Hidrologi",
        emoji: "💧",
        description: "Perjalanan uap air melayang dari samudra biru hangat membentuk awan tebal hingga turun hujan.",
        promptText: "Sains Alam: Partikel tetesan air murni berbentuk karakter imut bermata bulat jernih melayang naik dari permukaan laut samudra menuju langit biru berawan tebal, berkilauan kristal keemasan ditiup angin lembut, gaya animasi Disney.",
        storyIdeaText: "Perjalanan ajaib 'Dippy' si tetesan air menembus siklus hidrologi bumi. Episode 1: Dippy menguap anggun dari laut biru karena kehangatan matahari keemasan. Episode 2: Dippy mengapung di langit berkumpul bersama membentuk awan awan mendung kelabu ceria. Episode 3: Dippy terjun bebas sebagai butiran air hujan menyegarkan padang rumput hijau.",
        recommendedStyle: "Disney",
        recommendationReason: "Estetika Disney yang magis dengan sapuan semi cat air dan visual partikel bercahaya memberikan nuansa dongeng pendidikan sains yang sangat inspiratif."
      },
      {
        id: "hewan",
        title: "Siklus Hewan Menyusui",
        emoji: "🐑",
        description: "Bagaimana mamalia melahirkan bayi bulu tebal yang langsung disayang induknya di peternakan.",
        promptText: "Edukasi Hewan: Induk domba bulu wol putih bersih sangat tebal dan halus sedang berbaring menyusui bayinya yang mungil di dalam kandang penuh jerami kering, sorot lampu lumbung hangat keemasan, gaya animasi 3D realistis lembut.",
        storyIdeaText: "Kehidupan 'Milo' si anak domba berbulu awan di lembah padang rumput. Episode 1: Milo lahir dengan selamat dilingkupi selimut wol hangat oleh induknya. Episode 2: Milo belajar menegakkan kakinya berjalan pertama kali di atas rumput berembun pagi. Episode 3: Milo bermain kejar-kejaran bersama kawanan bebek di samping kincir air kayu tua.",
        recommendedStyle: "Pixar",
        recommendationReason: "Rekomendasi 3D Pixar sangat tepat karena merender tekstur bulu wol mamalia (fur/hair) secara luar biasa halus, hidup, serta membangkitkan empati kasih sayang."
      },
      {
        id: "tata-surya",
        title: "Sistem Tata Surya",
        emoji: "🪐",
        description: "Menelusuri planet megah bertabur cincin meteor menggelari orbit matahari membara.",
        promptText: "Astronomi Angkasa: Planet Saturnus megah berputar anggun dengan cincin partikel es holografik yang berkilau warna neon biru-ungu fiksi ilmiah di tengah kegelapan kosmik gelap bertabur komet bercahaya.",
        storyIdeaText: "Perjalanan komet penjelajah 'Astro' dari tepian galaksi Bima Sakti. Episode 1: Astro meluncur kencang melewati kepulan debu merah Planet Mars. Episode 2: Astro menari indah melintasi celah cincin raksasa es Saturnus. Episode 3: Astro memberi salam pada matahari emas raksasa yang menyala menyebarkan kehangatan tata surya.",
        recommendedStyle: "Cyberpunk",
        recommendationReason: "Materi Astronomi sangat indah menggunakan gaya Cyberpunk karena kontras warna gelap pekat angkasa murni dengan pijaran cahaya neon sirkuit orbit yang futuristik!"
      }
    ]
  },
  {
    id: "humor",
    title: "Humor & Hiburan Gokil",
    icon: "Flame",
    color: "text-amber-400",
    bgGradient: "from-amber-500/10 to-transparent",
    borderColor: "border-amber-500/20",
    subthemes: [
      {
        id: "berita-kocak",
        title: "Berita UFO Curi Jemuran",
        emoji: "👽",
        description: "Laporan eksklusif nan heboh pembawa berita TV tentang piring terbang menculik jemuran warga.",
        promptText: "Komedi Berita: Reporter TV pria berjas formal memegang mikrofon dengan ekspresi panik luar biasa di studio siaran, sementara layar di belakangnya menampilkan UFO piring terbang hijau mengambil paksa jemuran baju milik warga.",
        storyIdeaText: "Investigasi gokil 'Operasi Jemuran Luar Angkasa'. Episode 1: Pembawa berita TV melaporkan hilangnya celana jins warga secara massal. Episode 2: Kamera warga menangkap alien hijau sedang asyik mencuci baju di atas atap genteng dengan joget disko. Episode 3: Alien menyerahkan tumpukan hanger bersih ke balaikota sebagai tanda perdamaian.",
        recommendedStyle: "Realistic",
        recommendationReason: "Tampilan gaya Realistic memperkuat kontras komedi—semakin nyata wajah pembawa berita yang panik, semakin lucu kejadian konyol fiksi ilmiah di belakangnya!"
      },
      {
        id: "mie-gokil",
        title: "Tutorial Memasak Mie Kungfu",
        emoji: "🍜",
        description: "Seorang koki mengolah mie instan menggunakan jurus bela diri bumbu terbang api naga.",
        promptText: "Kuliner Humor: Chef berutot kawat memutar panjangnya adonan mie instan yang melayang elastis berputar bagaikan naga emas, dikelilingi taburan bumbu cabai bersinar terang dan pusaran api kuali mistis membara.",
        storyIdeaText: "Pertempuran koki legendaris merebus mie instan paling sakti. Episode 1: Chef membuka segel kardus mie legendaris yang berdebu keemasan. Episode 2: Melempar bumbu penyedap dengan kecepatan kilat pemicu ledakan asap wangi ke sekeliling dapur. Episode 3: Menyajikan mie kuah istimewa berhias telur mata sapi bercahaya ilahi yang memicu tangis keharuan juri.",
        recommendedStyle: "Fantasy",
        recommendationReason: "Gaya Fantasy memberikan efek partikel kilatan magis, bumbu yang melayang layaknya sihir, dan wajan berapi yang menakjubkan bagi penonton!"
      },
      {
        id: "suami-takut",
        title: "Suami Takut Istri Sakti",
        emoji: "🧹",
        description: "Misi taktis suami menyapu lantai dengan senyap agar tidak memicu deteksi radar sang istri.",
        promptText: "Operasi Rumah Tangga: Seorang suami memakai kacamata hitam mengenakan rompi agen taktis antipeluru memegang sapu lidi, menyelinap melangkah super pelan bersiap menyapu sela sela kolong kulkas di dapur gelap.",
        storyIdeaText: "Misi intelijen 'Suami Berbakti' berupaya mengamankan sisa uang belanjaan. Episode 1: Suami merancang peta strategi sapu pel lantai di atas meja kecil. Episode 2: Gerakan melompat dinamis mengelap kaca jendela bagaikan akrobat sirkus tanpa bersuara. Episode 3: Istri melipat tangan mengangguk puas lalu mengeluarkan lembaran jajan merah dari tasnya.",
        recommendedStyle: "Pixar",
        recommendationReason: "Ekspresi kocak ala 3D Pixar sangat ampuh menceritakan komedi mimik wajah suami yang tegang melawan senyuman istri super detektif!"
      }
    ]
  },
  {
    id: "game",
    title: "Game & Arena Petualang",
    icon: "Gamepad",
    color: "text-red-400",
    bgGradient: "from-red-500/10 to-transparent",
    borderColor: "border-red-500/20",
    subthemes: [
      {
        id: "game-teka-teki",
        title: "Labirin Teka-teki Kuno",
        emoji: "🧩",
        description: "Mencari tuas tersembunyi demi mencocokkan ubin kuil kuno berpendar magis.",
        promptText: "Adventure Puzzle: Jalur ubin batu kuil kuno dengan obor piksel kuning bercahaya tenang melingkari tugu kristal kunci, dikelilingi retakan batu yang mengalirkan air terjun bening membara, gaya Minecraft voxel.",
        storyIdeaText: "Petualangan 'Raka' memecahkan misteri prasasti gema. Episode 1: Raka menemukan pintu gerbang batu kuno bergambar teka-teki geser. Episode 2: Menyusun kembali batu batu zamrud menyala memicu putaran roda gerigi besi rahasia. Episode 3: Gerbang terbuka memancarkan portal luar angkasa penuh rasi bintang bercahaya.",
        recommendedStyle: "Minecraft",
        recommendationReason: "Gaya Minecraft voxel blocky memberikan arsitektur teka-teki petualangan yang rapi, solid, dan sangat ikonik bagi pembuat konten game!"
      },
      {
        id: "freefire-cinematic",
        title: "Free Fire Akhir Zona Biru",
        emoji: "🔥",
        description: "Adu taktik meluncur bebas menggunakan surfboard di bawah kepungan lingkaran listrik badai siber.",
        promptText: "Pertempuran Taktis: Karakter pria militer modern memakai masker siber perak meluncur kencang di atas surfboard neon layang melewati tumpukan peti kargo logistik pelabuhan, berlatar langit badai zona biru terang bergemuruh petir.",
        storyIdeaText: "Aksi bertahan hidup 'Squad Booyah' di detik-detik kritis. Episode 1: Terjun bebas dari pesawat angon fiksi ilmiah menembus kumpulan awan senja. Episode 2: Berlari lari di antara bebatuan berlindung di balik dinding penghalang es (Gloo Wall) dari tembakan bazoka musuh. Episode 3: Melakukan tembakan lompatan legendaris meraih kemenangan mutlak tak terkalahkan.",
        recommendedStyle: "Free Fire",
        recommendationReason: "Preset khusus gaya Free Fire mereproduksi laras senapan mengkilat, armor siber taktis warna gelap neon, serta efek siber zona biru ikonik yang autentik."
      },
      {
        id: "naruto-shippuden",
        title: "Pertempuran Lembah Ninja",
        emoji: "🦊",
        description: "Aksi adu jurus bola energi biru melawan naga api merah membara yang menggetarkan jurang batuan.",
        promptText: "Aksi Ninja Jepang: Karakter ninja baju oranye melayang di tengah danau air jernih, tangan kanannya menghasilkan putaran bola pusaran energi biru menyala-nyala berdesis ditiup angin badai siber, gaya fantasi dramatis.",
        storyIdeaText: "Ujian kekuatan dua ninja sahabat selamanya. Episode 1: Berdiri tenang saling menatap tajam di dahan dahan pohon pinus tinggi diterangi bulan purnama bulat raksasa. Episode 2: Melompat cepat saling melempar kunai baja memicu percikan api di udara. Episode 3: Mengadu dua pukulan jurus energi raksasa hingga membentuk benturan cahaya biru-merah dahsyat.",
        recommendedStyle: "Fantasy",
        recommendationReason: "Gaya Fantasy memberikan interpretasi aura cakra mistis bercahaya, cipratan air danau yang dramatis, serta efek badai visual spiritual yang luar biasa megah!"
      },
      {
        id: "bear-adventure",
        title: "Super Bear Adventure",
        emoji: "🐻",
        description: "Beruang coklat lari mengitari pulau melayang mengejar madu bintang mengapung.",
        promptText: "Petualangan Kartun: Beruang coklat gemoy membawa tas ransel melompat ceria berpijak di atas bongkahan tanah melayang di lembah berumput hijau subur bertabur koin emas berkilauan.",
        storyIdeaText: "Pencarian madu bintang kristal legendaris oleh beruang periang. Episode 1: Mengitari gurun berpasir mengincar koin koin bintang yang melayang. Episode 2: Berteman dengan kura kura penjelajah menyeberangi danau air hangat beriak. Episode 3: Membuka kotak harta karun kuno berisi madu emas bercahaya di puncak mercusuar sabana.",
        recommendedStyle: "Super Bear Adventure",
        recommendationReason: "Preset khusus ini menghadirkan palet warna ceria, kontur tanah kartun yang melengkung indah, serta model beruang petualang ramah anak yang menghibur."
      }
    ]
  },
  {
    id: "budaya",
    title: "Budaya & Tradisi Nusantara",
    icon: "Globe",
    color: "text-amber-500",
    bgGradient: "from-amber-600/10 to-transparent",
    borderColor: "border-amber-500/20",
    subthemes: [
      {
        id: "danau-toba",
        title: "Legenda Danau Toba",
        emoji: "🏔️",
        description: "Dongeng rakyat Toba tentang anak ikan mas ajaib menjelma gadis Batak berbaju tenun ulos.",
        promptText: "Cerita Rakyat Indonesia: Seorang gadis cantik jelita dari Suku Batak mengenakan kain tenun tradisional Ulos berwarna merah-hitam-emas yang mewah, berdiri di pinggir tebing tinggi di atas Danau Toba yang biru jernih dengan latar belakang bukit-bukit hijau berkabut dinamis, gaya visual sinematik dengan sinar matahari senja menyinari wajahnya.",
        storyIdeaText: "Kisah pemuda Toba menemukan ikan mas ajaib jelmaan gadis ulos. Episode 1: Seorang pemuda desa bernama Toba menangkap ikan mas berkilauan sisik emas di sungai berair jernih. Episode 2: Ikan tersebut bertransformasi secara magis menjadi seorang gadis mengenakan busana tenun ikat ulos yang indah. Episode 3: Akibat pelanggaran janji, air memancar meluap dahsyat membentuk samudera luas Danau Toba yang memukau.",
        recommendedStyle: "Realistic",
        recommendationReason: "Gaya Realistic menonjolkan detail tenunan kain tradisional Ulos serta lanskap alam Danau Toba yang megah dan otentik layaknya film layar lebar nusantara."
      },
      {
        id: "ngaben-bali",
        title: "Upacara Ngaben Bali",
        emoji: "🛕",
        description: "Prosesi adat sakral Ngaben dengan menara bambu Bade megah bercorak ukiran emas khas Bali.",
        promptText: "Upacara Adat Bali: Kerumunan masyarakat Bali mengenakan busana adat putih-kuning lengkap dengan udeng kepala tradisional, menggotong menara bambu 'Bade' tumpang sembilan bercorak ukiran emas oranye megah di pinggir Pantai Sanur yang berpasir putih, diselimuti asap dupa membubung ke langit biru, gaya visual artistik.",
        storyIdeaText: "Prosesi sakral penghormatan leluhur lewat upacara Ngaben di Bali. Episode 1: Pengukir kayu di pedesaan Ubud menyusun patung lembu suci dari bambu tebal. Episode 2: Pria-pria berpakaian adat melangkah gagah memikul menara megah di bawah sapaan matahari Bali. Episode 3: Pembakaran suci yang melambangkan pelepasan sukma ke cakrawala diiringi alunan gending gamelan semar pegulingan.",
        recommendedStyle: "Fantasy",
        recommendationReason: "Gaya Fantasy memberikan kilauan magis pada ukiran emas tumpang Bade dan kepulan asap dupa mistis yang berputar, memberikan rasa hormat yang mendalam terhadap budaya Bali."
      },
      {
        id: "tumpeng-rendang",
        title: "Festival Rendang & Tumpeng",
        emoji: "🍛",
        description: "Para ibu berkebaya menyajikan nasi keemasan tumpeng dikelilingi rendang Minang di piring anyaman bambu.",
        promptText: "Kuliner Tradisional: Di sebuah ruang anyaman bambu tradisional, seorang ibu Indonesia paruh baya yang ramah dengan sanggul rapi mengenakan kebaya katun halus sedang menata nasi tumpeng kuning berbentuk kerucut tinggi, di sampingnya terdapat sepiring rendang daging sapi berwarna cokelat pekat gelap basah berminyak kelapa yang harum di atas meja kayu pedesaan, sorot sinar mentari pagi hangat dari sela jendela.",
        storyIdeaText: "Lomba menyajikan hidangan pusaka nusantara di hari kemerdekaan desa. Episode 1: Para warga bergotong royong menumbuk bumbu rendang jahe dilingkupi asap kayu bakar dapur tradisional. Episode 2: Mengukus beras ketan kuning menggunakan kukusan bambu kerucut tradisional hingga wangi pandan semerbak. Episode 3: Penyajian estetik nasi tumpeng berhias mawar cabai merah yang diserbu anak-anak desa berpakaian Pramuka dengan riang.",
        recommendedStyle: "Pixar",
        recommendationReason: "Gaya Pixar membuat makanan terlihat sangat lezat, menggiurkan, dan memberikan karikatur wajah ibu Indonesia yang penuh kasih dan ramah, mengundang kehangatan keluarga."
      },
      {
        id: "wisata-bromo",
        title: "Pesona Gunung Bromo",
        emoji: "🌋",
        description: "Penunggang kuda berbalut sarung tenun tradisional melintasi lautan pasir berlatar kawah berasap Bromo.",
        promptText: "Pemandangan Alam Indonesia: Seorang penunggang kuda suku Tengger mengenakan sarung tebal bermotif kotak-kotak jingga meluncur perlahan melintasi hamparan lautan pasir hitam vulkanis Bromo, dengan kawah Gunung Batok dan Gunung Bromo yang megah mengeluarkan kepun asap belerang putih tebal ditiup angin pagi dingin di bawah langit fajar berwarna jingga kemerahan.",
        storyIdeaText: "Petualangan penjelajah muda melintasi lautan pasir mistis Bromo. Episode 1: Seorang pemuda menyalakan api unggun di atas puncak Penanjakan sembari meminum kopi hangat dalam kabut pekat. Episode 2: Menunggangi kuda poni melintasi padang pasir hitam berbisik di kaki kawah aktif yang mengerang pelan. Episode 3: Matahari terbit keemasan merekah menyinari kawah Bromo yang agung.",
        recommendedStyle: "Realistic",
        recommendationReason: "Gaya Realistic adalah pilihan mutlak untuk merekam keindahan fajar Bromo yang legendaris, debu pasir kering yang berputar ditiup angin, dan corak sarung tradisional secara nyata."
      }
    ]
  }
];

export default function App() {
  // Input settings state
  const [activeTab, setActiveTab] = useState<"text" | "image" | "storyboard">("text");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Pixar");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(15);

  // Thematic Presets Selectors State
  const [selectedThemeId, setSelectedThemeId] = useState<string>("pendidikan");
  const [selectedSubthemeId, setSelectedSubthemeId] = useState<string | null>(null);
  const [appliedSubthemeFeedback, setAppliedSubthemeFeedback] = useState<string | null>(null);
  
  // Image reference states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGeneratingBaseImage, setIsGeneratingBaseImage] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Storyboard Episode states
  const [storyIdea, setStoryIdea] = useState("");
  const [sceneCount, setSceneCount] = useState<number>(4); // Default 4 scenes as user requested!
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storyboardOutput, setStoryboardOutput] = useState<{
    characterDescription: string;
    episodes: Array<{
      number: number;
      title: string;
      enhancedPrompt: string;
      imageUrl?: string;
    }>;
  } | null>(null);
  const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState<number | null>(null);

  // Active production states on player
  const [playerMode, setPlayerMode] = useState<"cinematic" | "veo">("cinematic");
  const [activeVisuals, setActiveVisuals] = useState<{
    prompt: string;
    style: string;
    aspectRatio: string;
    duration: number;
    imageUrl: string;
    scenes?: any[];
  } | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [infoPopup, setInfoPopup] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom API Key configuration states
  const [customApiKey, setCustomApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Custom Sub-tema state (manual additions per theme)
  const [customSubthemesByTheme, setCustomSubthemesByTheme] = useState<Record<string, PresetSubtheme[]>>({});
  const [showAddSubtheme, setShowAddSubtheme] = useState(false);
  const [newSubthemeTitle, setNewSubthemeTitle] = useState("");
  const [newSubthemeDesc, setNewSubthemeDesc] = useState("");
  const [newSubthemePrompt, setNewSubthemePrompt] = useState("");

  // Narration / Script state
  const [narrativeScript, setNarrativeScript] = useState<any | null>(null);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [showNarrationPanel, setShowNarrationPanel] = useState(false);
  const [activeNarrationScene, setActiveNarrationScene] = useState(0);

  // Load custom API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("custom_gemini_api_key");
    if (savedKey) setCustomApiKey(savedKey);
    const savedCustom = localStorage.getItem("custom_subthemes");
    if (savedCustom) {
      try { setCustomSubthemesByTheme(JSON.parse(savedCustom)); } catch {}
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("custom_gemini_api_key", key);
  };

  const handleAddCustomSubtheme = () => {
    if (!newSubthemeTitle.trim()) { alert("Judul sub-tema wajib diisi!"); return; }
    const newSub: PresetSubtheme = {
      id: `custom-${Date.now()}`,
      title: newSubthemeTitle.trim(),
      emoji: "📌",
      description: newSubthemeDesc.trim() || "Sub-tema kustom yang ditambahkan secara manual.",
      promptText: newSubthemePrompt.trim() || `Video tentang ${newSubthemeTitle.trim()}: Visualisasikan konsep ini dengan detail, pencahayaan sinematik, dan animasi yang menarik.`,
      storyIdeaText: `Buat seri episode tentang "${newSubthemeTitle.trim()}". Episode 1: Pengenalan konsep. Episode 2: Proses dan detail. Episode 3: Kesimpulan dan aplikasi nyata.`,
      recommendedStyle: style,
      recommendationReason: `Sub-tema ini ditambahkan secara manual. Gaya ${style} dipilih sesuai preferensi saat ini.`
    };
    const updated = {
      ...customSubthemesByTheme,
      [selectedThemeId]: [...(customSubthemesByTheme[selectedThemeId] || []), newSub]
    };
    setCustomSubthemesByTheme(updated);
    localStorage.setItem("custom_subthemes", JSON.stringify(updated));
    setNewSubthemeTitle(""); setNewSubthemeDesc(""); setNewSubthemePrompt("");
    setShowAddSubtheme(false);
    setSelectedSubthemeId(newSub.id);
  };

  const handleDeleteCustomSubtheme = (subId: string) => {
    const updated = {
      ...customSubthemesByTheme,
      [selectedThemeId]: (customSubthemesByTheme[selectedThemeId] || []).filter(s => s.id !== subId)
    };
    setCustomSubthemesByTheme(updated);
    localStorage.setItem("custom_subthemes", JSON.stringify(updated));
    if (selectedSubthemeId === subId) setSelectedSubthemeId(null);
  };

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai_video_studio_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed parsing animation history", e);
      }
    } else {
      // Seed initial history
      const initialSeed: HistoryItem[] = [
        {
          id: "seed-1",
          prompt: "Kota melayang megah di atas awan saat matahari terbenam keemasan, kastil kuno berpadu teknologi modern, Disney style",
          style: "Disney",
          aspectRatio: "16:9",
          duration: 15,
          imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
          mode: "text",
          timestamp: "18 Juni 2026, 12:40"
        }
      ];
      setHistory(initialSeed);
      localStorage.setItem("ai_video_studio_history", JSON.stringify(initialSeed));
    }
  }, []);

  // Pre-seed some visual fallback when app starts
  useEffect(() => {
    if (!activeVisuals) {
      setActiveVisuals({
        prompt: "Istana kastil terapung bernuansa magis dan awan berarak hangat",
        style: "Disney",
        aspectRatio: "16:9",
        duration: 20,
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
      });
    }
  }, [activeVisuals]);

  // Save history helper
  const saveToHistory = (item: HistoryItem) => {
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("ai_video_studio_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (confirm("Hapus semua riwayat kreasi video Anda?")) {
      setHistory([]);
      localStorage.removeItem("ai_video_studio_history");
    }
  };

  // Generate Educational Narrative Script
  const generateNarration = async (subthemeTopic: string) => {
    setIsGeneratingNarration(true);
    setNarrativeScript(null);
    try {
      const response = await fetch("/api/generate-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-custom-api-key": customApiKey },
        body: JSON.stringify({
          topic: THEMATIC_PRESETS.find(p => p.id === selectedThemeId)?.title || selectedThemeId,
          subTopic: subthemeTopic,
          themeId: selectedThemeId,
          style,
          duration
        })
      });
      if (!response.ok) throw new Error("Gagal menghubungi server narasi.");
      const data = await response.json();
      if (data.success && data.narration) {
        setNarrativeScript(data.narration);
        setShowNarrationPanel(true);
        setActiveNarrationScene(0);
        // Auto-fill the first scene's visual prompt into the main prompt field
        if (data.narration.scenes?.[0]?.visualPrompt) {
          setPrompt(data.narration.scenes[0].visualPrompt);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Gagal generate skrip narasi. Pastikan server berjalan.");
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  // Enhance prompt using AI with duration consideration
  const enhancePromptWithAI = async () => {
    if (!prompt.trim()) {
      alert("Silakan tulis ide atau deskripsi dasar terlebih dahulu!");
      return;
    }
    setIsEnhancingPrompt(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-custom-api-key": customApiKey 
        },
        body: JSON.stringify({ prompt, style, aspectRatio, duration }),
      });
      if (!response.ok) throw new Error("Gagal menyempurnakan teks deskripsi.");
      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (e: any) {
      console.error(e);
      alert("Koneksi sibuk. Prompt sasis dasar tetap akan digunakan.");
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Generate continuous story steps/episodes
  const generateStoryboardAI = async () => {
    if (!storyIdea.trim()) {
      alert("Tulis ide cerita utama atau sinopsis Anda terlebih dahulu!");
      return;
    }
    setIsGeneratingStory(true);
    setStoryboardOutput(null);
    setSelectedEpisodeIdx(null);
    try {
      const response = await fetch("/api/generate-episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": customApiKey
        },
        body: JSON.stringify({
          storyIdea,
          count: sceneCount, // Customizable dynamic scene count!
          style,
          aspectRatio
        })
      });

      if (!response.ok) {
        throw new Error("Gagal mengembangkan seri episode.");
      }

      const data = await response.json();
      setStoryboardOutput(data);
      
      // Auto select and fill prompt with first episode prompt
      if (data.episodes && data.episodes.length > 0) {
        setSelectedEpisodeIdx(0);
        setPrompt(data.episodes[0].enhancedPrompt);
      }
    } catch (e: any) {
      console.error(e);
      alert("Gagal men-generate storyboard episode. Silakan pastikan sambungan API aktif.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Generate Reference Image with AI (Fills Image to Video requirement beautifully)
  const generateBaseImageWithAI = async () => {
    if (!prompt.trim()) {
      alert("Tulis deskripsi atau ide visual terlebih dahulu agar AI tahu gambar apa yang ingin didevelop!");
      return;
    }
    setIsGeneratingBaseImage(true);
    setImageError(null);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-custom-api-key": customApiKey 
        },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });

      if (!response.ok) {
        throw new Error("Gagal memanggil model pembuat gambar.");
      }

      const data = await response.json();
      if (data.image) {
        setUploadedImage(data.image);
        if (data.isFallback) {
          console.log("Using gorgeous theme-specific backdrop as generator fallback:", data.errorInfo);
        }
      }
    } catch (e: any) {
      console.error(e);
      setImageError("Gagal men-generate gambar dasar. Silakan unggah gambar manual atau lanjutkan.");
    } finally {
      setIsGeneratingBaseImage(false);
    }
  };

  // File Upload Handlers (Drag and Drop / Clicks)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Silakan unggah jenis file gambar yang valid (PNG, JPG, WebP)!");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setImageError(null);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Pre-fill fields from Inspiration Tags
  const applyInspiration = (item: typeof INSPIRED_PROMPTS[0]) => {
    setPrompt(item.prompt);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio);
    setDuration(item.duration);
  };

  // Compile prompt and kickstart visualization renderer
  const handleCompileAndRender = async () => {
    if (!prompt.trim()) {
      alert("Tolong tuliskan detail deskripsi atau ide gerakan video Anda!");
      return;
    }

    let resolvedImage = uploadedImage;

    // If text only but needs an image placeholder for the gorgeous 2.5D fallback engine, we fetch a cinematic backdrop
    if (!resolvedImage) {
      setIsGeneratingBaseImage(true);
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-custom-api-key": customApiKey 
          },
          body: JSON.stringify({ prompt, style, aspectRatio }),
        });
        if (response.ok) {
          const data = await response.json();
          resolvedImage = data.image;
        }
      } catch (e) {
        console.error("Fallback image generation error:", e);
      } finally {
        setIsGeneratingBaseImage(false);
      }
    }

    // Still no image? Fallback to high quality design graphic
    if (!resolvedImage) {
      resolvedImage = aspectRatio === "9:16"
        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=675&h=1200&q=80"
        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
    }

    // Set Active Video Render target state
    const visualPayload = {
      prompt,
      style,
      aspectRatio,
      duration,
      imageUrl: resolvedImage
    };

    setActiveVisuals(visualPayload);

    // Create a new history entry
    const newHistory: HistoryItem = {
      id: "hist-" + Date.now(),
      prompt,
      style,
      aspectRatio,
      duration,
      imageUrl: resolvedImage,
      mode: activeTab,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " • " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    };

    saveToHistory(newHistory);
    
    // Jump scroll viewer down to the video player
    document.getElementById("stage-render-target")?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio);
    setDuration(item.duration);
    setUploadedImage(item.imageUrl);
    setActiveTab(item.mode);
    setActiveVisuals({
      prompt: item.prompt,
      style: item.style,
      aspectRatio: item.aspectRatio,
      duration: item.duration,
      imageUrl: item.imageUrl
    });
    document.getElementById("stage-render-target")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" id="main-studio">
      
      {/* Upper Glossy Cinematic Branding Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Custom Awesome App Icon for JO STUDIO */}
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-amber-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              <div className="relative w-11 h-11 rounded-xl bg-black border border-zinc-800 flex flex-col items-center justify-center shadow-2xl">
                <span className="text-[14px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-amber-400 font-mono leading-none">JO</span>
                <span className="text-[7px] font-bold text-zinc-500 tracking-widest uppercase -mt-0.5 font-mono">STUDIO</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 font-mono">
                  JO STUDIO
                </h1>
                <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-sky-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  V3.5 PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Penyempurnaan Deskripsi & Generator Video Sinematik Kelas Dunia</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                customApiKey 
                  ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/30" 
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:bg-zinc-800"
              }`}
              title="Masukkan Kunci API Pribadi Berbayar"
            >
              <Key className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{customApiKey ? "Kunci API Aktif" : "Bypass limit: Pasang API Key"}</span>
            </button>

            <span className="hidden lg:inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-500 border border-zinc-900 px-3 py-1.5 rounded-lg bg-zinc-900/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Dev Server Ready</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hasilkan Konten Dalam Hitungan Detik Premium Banner */}
      <div className="bg-gradient-to-r from-[#030e20] via-[#09153a] to-[#030e20] border-b border-indigo-950 px-6 py-3 px-4 sm:px-6 shadow-md select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div>
              <p className="text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-sky-400 font-mono">
                Hasilkan konten dalam hitungan detik.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-zinc-500 font-medium">
              Sistem Rendering Sinematik Terakselerasi Aktif
            </span>
            <div className="hidden md:flex items-center space-x-2 text-[9px] text-zinc-400 bg-zinc-950/80 border border-zinc-900 px-3 py-1 rounded-full font-mono">
              <span className="text-emerald-400 font-black">100% INSTAN</span>
              <span className="text-zinc-600">|</span>
              <span className="text-sky-400 font-black">VEO PRO HD INTEGRATION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom API Key input drawer panel */}
      {showKeyInput && (
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 border-b border-indigo-500/20 px-6 py-5">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-100 uppercase">
                  PENGATURAN KUNCI API USER (GEMINI / VEO AI)
                </h3>
              </div>
              <button 
                onClick={() => setShowKeyInput(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-bold"
              >
                Tutup &times;
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Jika Anda menghadapi error quota habis atau ingin menggunakan model video Google Veo HD dengan akun berbayar sendiri (seperti yang diawali dengan huruf <strong>AQ</strong> atau standar <strong>AIza</strong>), silakan tempel <strong>Kunci API Gemini</strong> Anda di bawah ini. Kunci API Anda akan langsung diproses langsung dengan aman (tersimpan hanya di dalam browser Anda, 100% aman).
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan API Key Anda disini (misal: AQ... atau AIza...)"
                value={customApiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-indigo-300 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => {
                  setShowKeyInput(false);
                  alert("Kunci API berhasil disimpan secara aman di browser!");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md shrink-0"
              >
                Simpan & Aktifkan
              </button>
            </div>

            {customApiKey && (
              <div className="flex items-center justify-between text-[11px] bg-zinc-950/60 p-3 rounded-xl border border-zinc-900">
                <p className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1"></span>
                  <span>Kunci API Anda telah aktif! Sistem akan memprioritaskan kunci ini untuk semua pemrosesan AI.</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveApiKey("");
                    alert("Kunci API telah dihapus. Sistem akan otomatis beralih ke kunci utama bawaan.");
                  }}
                  className="text-zinc-500 hover:text-red-400 font-semibold transition"
                >
                  Hapus API Key
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        
        {/* Kolom Kiri: Kontrol & Input */}
        <div className="lg:col-span-7 flex flex-col space-y-5 sm:space-y-6">
          
          {/* Creation Mode Toggle Cards (Balanced for Mobile Portrait) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {/* CARD 1: TEKS KE VIDEO */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("text");
                setUploadedImage(null);
              }}
              className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-center sm:text-left transition-all duration-300 relative overflow-hidden group flex flex-col items-center sm:items-start ${
                activeTab === "text"
                  ? "border-sky-500 bg-sky-950/20 text-white ring-2 ring-sky-500/10 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                  : "border-zinc-800 hover:border-sky-500/40 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2.5 space-y-1 sm:space-y-0 w-full">
                <div className={`p-1 sm:p-1.5 rounded-lg border-2 ${activeTab === "text" ? "border-sky-400 bg-sky-500/15" : "border-zinc-800 bg-zinc-900"} transition-colors`}>
                  <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                </div>
                <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono block sm:hidden">TEKS</span>
                <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono hidden sm:block">Teks ke Video</span>
              </div>
              <p className="hidden sm:block text-[10px] text-zinc-500 group-hover:text-zinc-400 leading-snug mt-1.5">Ubah teks imajinatif menjadi sasis animasi dinamis.</p>
              {activeTab === "text" && (
                <div className="absolute right-1 sm:right-2 top-1 sm:top-2 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
              )}
            </button>

            {/* CARD 2: GAMBAR KE VIDEO */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("image");
              }}
              className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-center sm:text-left transition-all duration-300 relative overflow-hidden group flex flex-col items-center sm:items-start ${
                activeTab === "image"
                  ? "border-violet-500 bg-violet-950/20 text-white ring-2 ring-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                  : "border-zinc-800 hover:border-violet-500/40 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2.5 space-y-1 sm:space-y-0 w-full">
                <div className={`p-1 sm:p-1.5 rounded-lg border-2 ${activeTab === "image" ? "border-violet-400 bg-violet-500/15" : "border-zinc-800 bg-zinc-900"} transition-colors`}>
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                </div>
                <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono block sm:hidden">GAMBAR</span>
                <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono hidden sm:block">Gambar ke Video</span>
              </div>
              <p className="hidden sm:block text-[10px] text-zinc-500 group-hover:text-zinc-400 leading-snug mt-1.5">Unggah visual kunci atau generate aset dasar dengan AI.</p>
              {activeTab === "image" && (
                <div className="absolute right-1 sm:right-2 top-1 sm:top-2 w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
              )}
            </button>

            {/* CARD 3: SERI EPISODE */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("storyboard");
                setUploadedImage(null);
              }}
              className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-center sm:text-left transition-all duration-300 relative overflow-hidden group flex flex-col items-center sm:items-start ${
                activeTab === "storyboard"
                  ? "border-emerald-500 bg-emerald-950/20 text-white ring-2 ring-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "border-zinc-800 hover:border-emerald-500/40 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2.5 space-y-1 sm:space-y-0 w-full">
                <div className={`p-1 sm:p-1.5 rounded-lg border-2 ${activeTab === "storyboard" ? "border-emerald-400 bg-emerald-500/15" : "border-zinc-800 bg-zinc-900"} transition-colors`}>
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono block sm:hidden">SERI</span>
                <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono hidden sm:block">Seri Episode</span>
              </div>
              <p className="hidden sm:block text-[10px] text-zinc-500 group-hover:text-zinc-400 leading-snug mt-1.5">Visualisasi konsisten multi-adegan untuk cerita penuh.</p>
              {activeTab === "storyboard" && (
                <div className="absolute right-1 sm:right-2 top-1 sm:top-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              )}
            </button>
          </div>

          {/* LANGKAH 1: ATUR DIMENSI & DURASI VIDEO (Ditempatkan di bagian atas) */}
          <div className="bg-[#03031e] p-4 sm:p-5 rounded-3xl border-2 border-yellow-400 space-y-5 shadow-[0_0_15px_rgba(250,204,21,0.12)]" id="langkah-1">
            <div className="flex items-center space-x-2 border-b border-zinc-850 pb-2.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Langkah 1: Tentukan Dimensi & Durasi Video Utama
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-0.5">
              
              {/* Aspect Ratio selector (Landscape & Portrait distinct borders and colors) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
                  Rasio Dimensi Layout
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* LANDSCAPE CARD WITH DISTINCT BLUE BORDER AND GLOW */}
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 transition duration-300 flex items-center space-x-2.5 sm:space-x-3.5 relative overflow-hidden text-left ${
                      aspectRatio === "16:9"
                        ? "border-sky-500 bg-sky-950/20 text-white shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                        : "border-sky-950/40 hover:border-sky-800/60 bg-zinc-950/40 text-zinc-400"
                    }`}
                  >
                    <div className={`p-1 sm:p-1.5 rounded-lg border-2 ${aspectRatio === "16:9" ? "border-sky-400 bg-sky-500/15" : "border-zinc-800 bg-zinc-900"}`}>
                      <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-black block leading-none font-mono">LANDSCAPE</span>
                      <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono">16:9 (Mendatar)</span>
                    </div>
                  </button>

                  {/* PORTRAIT CARD WITH DISTINCT EMERALD BORDER AND GLOW */}
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 transition duration-300 flex items-center space-x-2.5 sm:space-x-3.5 relative overflow-hidden text-left ${
                      aspectRatio === "9:16"
                        ? "border-emerald-500 bg-emerald-950/20 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "border-emerald-950/40 hover:border-emerald-800/60 bg-zinc-950/40 text-zinc-400"
                    }`}
                  >
                    <div className={`p-1 sm:p-1.5 rounded-lg border-2 ${aspectRatio === "9:16" ? "border-emerald-400 bg-emerald-500/15" : "border-zinc-800 bg-zinc-900"}`}>
                      <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-black block leading-none font-mono">PORTRAIT</span>
                      <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono">9:16 (Tegak)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Duration range selector (DISTINCT FUCHSIA CARD & BORDER) */}
              <div className="p-3 sm:p-3.5 rounded-2xl border-2 border-fuchsia-500/30 bg-fuchsia-950/10 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-fuchsia-500/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-fuchsia-300 uppercase tracking-widest font-mono block">
                    PANJANG DURASI ANIMASI
                  </label>
                  <span className="text-[10px] font-black text-fuchsia-300 font-mono bg-fuchsia-950/60 px-2 sm:px-2.5 py-0.5 rounded border border-fuchsia-500/40 leading-none shadow-sm">
                    {duration} Detik
                  </span>
                </div>
                <div className="pt-1.5">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-fuchsia-950 border border-fuchsia-500/20 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 hover:accent-fuchsia-400"
                  />
                  <div className="flex justify-between text-[8px] text-fuchsia-400/80 font-mono mt-1">
                    <span>10 Detik</span>
                    <span>45 Detik</span>
                    <span>90 Detik</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* LANGKAH 2: PILIH GAYA SINEMATIK VISUAL */}
          <div className="bg-[#03031e] p-4 sm:p-5 rounded-3xl border-2 border-yellow-400 space-y-3.5 shadow-[0_0_15px_rgba(250,204,21,0.12)]" id="langkah-2">
            <div className="flex items-center space-x-2 border-b border-zinc-800/60 pb-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-spin-slow" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                Langkah 2: Pilih Gaya Sinematik Visual
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[
                { name: "Pixar", desc: "Animasi 3D Lembut", color: "from-blue-600/20 via-sky-600/10 to-transparent" },
                { name: "Disney", desc: "Kartun Magis Indah", color: "from-violet-600/20 via-purple-650/10 to-transparent" },
                { name: "Cyberpunk", desc: "Neon & Masa Depan", color: "from-pink-600/20 via-rose-650/10 to-transparent" },
                { name: "Fantasy", desc: "Dunia Kuno Mistis", color: "from-emerald-600/20 via-teal-600/10 to-transparent" },
                { name: "Realistic", desc: "Film Sinematik Nyata", color: "from-zinc-600/20 via-neutral-650/10 to-transparent" },
                { name: "Free Fire", desc: "Game Battle Royale", color: "from-orange-600/25 via-red-650/15 to-transparent" },
                { name: "Super Bear Adventure", desc: "Game Kartun Lucu", color: "from-yellow-500/20 via-amber-600/10 to-transparent" },
                { name: "Minecraft", desc: "Voxel Blocky Pixel", color: "from-green-600/20 via-emerald-600/10 to-transparent" },
              ].map((st) => (
                <button
                  key={st.name}
                  type="button"
                  onClick={() => setStyle(st.name)}
                  className={`relative p-2.5 rounded-xl border text-left transition duration-200 overflow-hidden ${
                    style === st.name
                      ? "border-indigo-500 bg-zinc-900 shadow-md ring-1 ring-indigo-500/20"
                      : "border-zinc-800/65 hover:border-zinc-700 bg-zinc-950/40"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr ${st.color} opacity-40`} />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <span className="text-[9px] sm:text-xs font-bold text-zinc-100 line-clamp-2 leading-tight">
                      {st.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5 line-clamp-1 leading-none">
                      {st.desc}
                    </span>
                  </div>
                  {style === st.name && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* LANGKAH 3: FORMULASI IDE & PROMPT VIDEO (Sesuai mode aktif) */}
          {activeTab !== "storyboard" ? (
            /* Mode 1 & 2: Teks / Gambar tunggal */
            <div className="bg-[#03031e] p-4 sm:p-5 rounded-3xl border-2 border-yellow-400 space-y-4 shadow-[0_0_15px_rgba(250,204,21,0.12)]" id="langkah-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">
                    Langkah 3: Ide Cerita & Arahan Gerak Video
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={enhancePromptWithAI}
                  disabled={isEnhancingPrompt}
                  className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-violet-600/25 hover:bg-violet-600/35 text-violet-300 rounded-full border border-violet-500/20 hover:border-violet-500/40 transition flex items-center space-x-1 disabled:opacity-50 text-right shrink-0"
                  title="Sempurnakan rincian visual berdasarkan durasi dan gaya yang dipilih"
                >
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span>{isEnhancingPrompt ? "Menganalisis..." : "Sempurnakan Prompt"}</span>
                </button>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/25 to-indigo-500/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tuliskan deskripsi ide gerakan video Anda di sini... Contoh: Murid sekolah dasar berpakaian merah-putih bangga memegang piala di depan gapura sekolah desa Jawa yang asri."
                  rows={4}
                  maxLength={400}
                  className="relative w-full bg-[#020210]/95 border-2 border-indigo-950/40 hover:border-indigo-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 rounded-2xl p-4 text-xs font-semibold text-zinc-200 placeholder-zinc-700 transition duration-300 shadow-inner leading-relaxed resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Maksimal 400 karakter • Diselaraskan dengan durasi ({duration} detik)</span>
                <span>ID/EN</span>
              </div>
            </div>
          ) : (
            /* Mode 3: Storyboard Continuos Multi-Step / Episode */
            <div className="bg-[#03031e] p-4 sm:p-5 rounded-3xl border-2 border-yellow-400 space-y-4 shadow-[0_0_15px_rgba(250,204,21,0.12)]" id="langkah-3-storyboard">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">
                    Storyboard AI: Rangkaian Seri Episode Berkelanjutan
                  </label>
                </div>
              </div>

              {/* Dynamic Scene / Adegan count selector */}
              <div className="flex items-center justify-between bg-zinc-950/40 p-2.5 rounded-2xl border border-zinc-900">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-zinc-300 font-mono block">JUMLAH ADEGAN (SCENES):</span>
                  <p className="text-[9px] text-zinc-500">Membagi durasi video secara merata.</p>
                </div>
                <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSceneCount(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                        sceneCount === num
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-zinc-400">
                  Masukkan ide cerita utama atau premis dasar Anda. AI akan menyelaraskan <strong>{sceneCount} adegan berurutan</strong> dengan visual <strong>karakter protagonis yang dijamin konsisten sama</strong>:
                </p>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/25 to-teal-500/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500" />
                  <textarea
                    value={storyIdea}
                    onChange={(e) => setStoryIdea(e.target.value)}
                    placeholder="Contoh: Seorang anak laki-laki bernama Onel berkaos merah compang-camping tinggal di gubuk bambu kecil di pegunungan terpencil..."
                    rows={3}
                    className="relative w-full bg-[#020210]/95 border-2 border-indigo-950/40 hover:border-emerald-500 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 rounded-2xl p-4 text-xs font-semibold text-zinc-200 placeholder-zinc-700 transition duration-300 shadow-inner leading-normal resize-none focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={generateStoryboardAI}
                disabled={isGeneratingStory || !storyIdea.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {isGeneratingStory ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Mengonfigurasikan {sceneCount} Adegan Konsisten...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-250 animate-pulse" />
                    <span>Kembangkan {sceneCount} Adegan AI (Karakter Konsisten)</span>
                  </>
                )}
              </button>

              {/* Storyboard outcomes */}
              {storyboardOutput && (
                <div className="space-y-4 pt-3 border-t border-zinc-800/60 transition-all duration-300">
                  
                  {/* Character Description Block */}
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-[11px] text-emerald-300">
                    <p className="font-bold uppercase tracking-wider text-[9px] text-emerald-400 font-mono">
                      🔑 Deskripsi Karakter Utama Konsisten:
                    </p>
                    <p className="mt-1 leading-relaxed italic">
                      "{storyboardOutput.characterDescription}"
                    </p>
                  </div>

                  {/* Play Combined Film Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (storyboardOutput.episodes && storyboardOutput.episodes.length > 0) {
                        const scenesToPlay = storyboardOutput.episodes.map((ep, idx) => ({
                          number: ep.number,
                          title: ep.title,
                          enhancedPrompt: ep.enhancedPrompt,
                          imageUrl: ep.imageUrl || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80`
                        }));
                        setActiveVisuals({
                          prompt: `Film Seri: ${storyIdea}`,
                          style,
                          aspectRatio,
                          duration: Math.max(5, duration), // use duration slider per episode
                          imageUrl: scenesToPlay[0].imageUrl,
                          scenes: scenesToPlay
                        } as any);
                        setPlayerMode("cinematic");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-505 hover:to-emerald-505 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 border border-white/10"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Gabungkan Semua Adegan & Putar Film Penuh ({storyboardOutput.episodes.length} Adegan)</span>
                  </button>

                  {/* Carousel cards / timeline select */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                      Klik Adegan Untuk Membaca / Memilih Frame:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {storyboardOutput.episodes.map((ep, idx) => {
                        const isSelected = selectedEpisodeIdx === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedEpisodeIdx(idx);
                              setPrompt(ep.enhancedPrompt);
                              // Sync to player directly if user wants to play just this scene
                              if (ep.imageUrl) {
                                setActiveVisuals({
                                  prompt: ep.enhancedPrompt,
                                  style,
                                  aspectRatio,
                                  duration,
                                  imageUrl: ep.imageUrl
                                });
                              }
                            }}
                            className={`p-2 rounded-xl border text-left transition duration-150 ${
                              isSelected
                                ? "border-emerald-500 bg-zinc-900 text-emerald-300 ring-1 ring-emerald-500/20"
                                : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 text-zinc-400"
                            }`}
                          >
                            {ep.imageUrl && (
                              <img
                                src={ep.imageUrl}
                                alt={ep.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-12 object-cover rounded-lg mb-1.5 border border-zinc-800/80"
                              />
                            )}
                            <span className="text-[8px] font-mono font-bold block text-zinc-500">
                              ADEGAN 0{ep.number}
                            </span>
                            <span className="text-[10px] font-bold block truncate mt-0.5">
                              {ep.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic loaded prompt view */}
                  {selectedEpisodeIdx !== null && (
                    <div className=" bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-1">
                      <span className="text-[9px] font-bold text-zinc-500 font-mono block">PROMPT ADEGAN AKTIF:</span>
                      <p className="text-[10px] italic text-emerald-400 leading-relaxed font-mono">
                        "{prompt}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Kolom Kanan: Skenario (atas) + Stage Video (bawah) */}
        <div className="lg:col-span-5 flex flex-col space-y-6" id="stage-render-target">
          
          {/* Header information label */}
          <div className="bg-[#021424] p-5 rounded-3xl border-2 border-sky-400 space-y-4 shadow-[0_0_15px_rgba(56,189,248,0.12)]" id="kartu-stage">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-200 font-mono">
                  Stage Output Animasi
                </h2>
              </div>
              
              <div className="flex p-0.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setPlayerMode("cinematic")}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    playerMode === "cinematic"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Kamera Sinematik
                </button>
                <button
                  onClick={() => setPlayerMode("veo")}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    playerMode === "veo"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Veo AI Engine
                </button>
              </div>
            </div>

            {/* Mode descriptions */}
            <div className="text-[11px] text-zinc-400">
              {playerMode === "cinematic" ? (
                <p className="leading-relaxed">
                  💡 <strong>Kamera Sinematik (Instan):</strong> Demo interaktif berkecepatan tinggi yang merender visual, kedalaman, dan partikel Pixar/Disney secara real-time + audio suasana ambient!
                </p>
              ) : (
                <p className="leading-relaxed text-indigo-300">
                  ⚡ <strong>Google Veo HD (Render Sebenarnya):</strong> Alur kerja integrasi API asli ke model video premium Google. Memerlukan Kunci API Berbayar.
                </p>
              )}
            </div>

            {/* Stage Showcase Arena */}
            <div className="pt-2">
              {activeVisuals ? (
                playerMode === "cinematic" ? (
                  <CinematicPlayer
                    imageUrl={activeVisuals.imageUrl}
                    duration={activeVisuals.duration}
                    style={activeVisuals.style}
                    aspectRatio={aspectRatio}
                    prompt={activeVisuals.prompt}
                    scenes={activeVisuals.scenes}
                  />
                ) : (
                  <VeoPlayer
                    prompt={activeVisuals.prompt}
                    style={activeVisuals.style}
                    aspectRatio={aspectRatio}
                    duration={activeVisuals.duration}
                    uploadedImage={activeVisuals.imageUrl}
                    onFallbackToggle={() => setPlayerMode("cinematic")}
                    customApiKey={customApiKey}
                    themeId={selectedThemeId}
                  />
                )
              ) : (
                <div className={`transition-all duration-300 bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center p-6 text-center text-zinc-500 ${
                  aspectRatio === "9:16" 
                    ? "aspect-[9/16] w-full max-w-[340px] mx-auto rounded-3xl" 
                    : "aspect-[16/9] w-full rounded-2xl"
                }`}>
                  <Film className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
                  <p className="text-xs font-semibold text-zinc-400">Belum ada Visual Terpilih</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">
                    Tulis arahan cerita di bilah kiri lalu klik tombol peluncur untuk merender video.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* PILIHAN TEMA & REKOMENDASI SKENARIO AI */}
          <div className="bg-[#021815] p-4 sm:p-5 rounded-3xl border-2 border-emerald-500 space-y-4 shadow-[0_0_15px_rgba(16,185,129,0.12)] order-first" id="kartu-skenario">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Skenario Kreatif Berdasarkan Tema (Saran AI)
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 font-mono bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-500/20">
                Pendidikan • Humor • Game • Budaya
              </span>
            </div>

            {/* Theme Filter Buttons with Distinct Thick Frames & Unique Colors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {THEMATIC_PRESETS.map((t) => {
                const isActive = selectedThemeId === t.id;
                
                // Assign bold custom frames (borders) and distinct glowing backgrounds and colors per theme
                let themeBtnStyle = "";
                if (t.id === "pendidikan") {
                  themeBtnStyle = isActive
                    ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 ring-2 ring-emerald-500/15 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    : "border-emerald-950/40 hover:border-emerald-500/30 bg-zinc-950/20 text-zinc-400 hover:text-emerald-300";
                } else if (t.id === "humor") {
                  themeBtnStyle = isActive
                    ? "border-yellow-400 bg-yellow-950/20 text-yellow-300 ring-2 ring-yellow-400/15 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                    : "border-yellow-950/40 hover:border-yellow-400/30 bg-zinc-950/20 text-zinc-400 hover:text-yellow-300";
                } else if (t.id === "game") {
                  themeBtnStyle = isActive
                    ? "border-red-500 bg-red-950/20 text-red-300 ring-2 ring-red-500/15 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                    : "border-red-950/40 hover:border-red-500/30 bg-zinc-950/20 text-zinc-400 hover:text-red-300";
                } else if (t.id === "budaya") {
                  themeBtnStyle = isActive
                    ? "border-amber-500 bg-amber-950/20 text-amber-300 ring-2 ring-amber-500/15 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                    : "border-amber-950/40 hover:border-amber-500/30 bg-zinc-950/20 text-zinc-400 hover:text-amber-300";
                }

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeId(t.id);
                      setSelectedSubthemeId(null); // Reset subtheme selection
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition duration-300 flex flex-col items-center justify-center space-y-1 ${themeBtnStyle}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wider font-mono leading-none">{t.title.split(" ")[0]}</span>
                    <span className="text-[9px] text-zinc-500 font-sans block leading-none">Preset {t.title.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Subtheme Interactive Grid + Custom Subthemes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {/* Built-in subthemes */}
              {THEMATIC_PRESETS.find(p => p.id === selectedThemeId)?.subthemes.map((st) => {
                const isSelected = selectedSubthemeId === st.id;
                let subthemeStyle = "";
                if (selectedThemeId === "pendidikan") {
                  subthemeStyle = isSelected ? "border-emerald-500 bg-emerald-950/20 text-emerald-200 ring-2 ring-emerald-500/15 shadow-sm" : "border-emerald-950/40 hover:border-emerald-500/30 bg-zinc-950/40 text-zinc-300";
                } else if (selectedThemeId === "humor") {
                  subthemeStyle = isSelected ? "border-yellow-400 bg-yellow-950/20 text-yellow-200 ring-2 ring-yellow-400/15 shadow-sm" : "border-yellow-950/40 hover:border-yellow-400/30 bg-zinc-950/40 text-zinc-300";
                } else if (selectedThemeId === "game") {
                  subthemeStyle = isSelected ? "border-red-500 bg-red-950/20 text-red-200 ring-2 ring-red-500/15 shadow-sm" : "border-red-950/40 hover:border-red-500/30 bg-zinc-950/40 text-zinc-300";
                } else if (selectedThemeId === "budaya") {
                  subthemeStyle = isSelected ? "border-amber-500 bg-amber-950/20 text-amber-200 ring-2 ring-amber-500/15 shadow-sm" : "border-amber-950/40 hover:border-amber-500/30 bg-zinc-950/40 text-zinc-300";
                }
                return (
                  <button key={st.id} type="button" onClick={() => { setSelectedSubthemeId(st.id); setAppliedSubthemeFeedback(null); }} className={`p-3 rounded-2xl border-2 text-left transition duration-300 ${subthemeStyle}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-lg shrink-0 leading-none">{st.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">{st.title}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{st.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Custom subthemes (user-added) */}
              {(customSubthemesByTheme[selectedThemeId] || []).map((st) => {
                const isSelected = selectedSubthemeId === st.id;
                return (
                  <div key={st.id} className={`relative p-3 rounded-2xl border-2 text-left transition duration-300 ${
                    isSelected ? "border-violet-500 bg-violet-950/20 text-violet-200 ring-2 ring-violet-500/15" : "border-violet-950/40 hover:border-violet-500/30 bg-zinc-950/40 text-zinc-300"
                  }`}>
                    <button type="button" className="w-full text-left" onClick={() => { setSelectedSubthemeId(st.id); setAppliedSubthemeFeedback(null); }}>
                      <div className="flex items-start space-x-2 pr-5">
                        <span className="text-lg shrink-0 leading-none">{st.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">{st.title}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{st.description}</p>
                          <span className="text-[8px] text-violet-400 font-mono font-bold">KUSTOM</span>
                        </div>
                      </div>
                    </button>
                    <button type="button" onClick={() => handleDeleteCustomSubtheme(st.id)} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition" title="Hapus sub-tema ini">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Sub-tema Button */}
            <button
              type="button"
              onClick={() => setShowAddSubtheme(!showAddSubtheme)}
              className="mt-2 w-full py-2 border-2 border-dashed border-zinc-700 hover:border-violet-500/60 hover:bg-violet-950/10 text-zinc-500 hover:text-violet-400 rounded-2xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Sub-tema Manual untuk Tema Ini</span>
            </button>

            {/* Add Sub-tema Form */}
            {showAddSubtheme && (
              <div className="bg-zinc-950/80 border border-violet-500/30 rounded-2xl p-4 space-y-3">
                <p className="text-[11px] font-bold text-violet-300 uppercase tracking-wider font-mono">📌 Tambah Sub-tema Baru</p>
                <input
                  type="text" placeholder="Judul Sub-tema (wajib) — cth: Proses Fotosintesis"
                  value={newSubthemeTitle} onChange={e => setNewSubthemeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
                <input
                  type="text" placeholder="Deskripsi singkat (opsional)"
                  value={newSubthemeDesc} onChange={e => setNewSubthemeDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
                <textarea
                  placeholder="Prompt video dasar (opsional — AI bisa generate otomatis)"
                  value={newSubthemePrompt} onChange={e => setNewSubthemePrompt(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddCustomSubtheme} className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition">
                    Simpan Sub-tema
                  </button>
                  <button type="button" onClick={() => setShowAddSubtheme(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl transition">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations & Actions Box (Visible when a subtheme is selected) */}
            {selectedSubthemeId && (() => {
              const currentThemePreset = THEMATIC_PRESETS.find(p => p.id === selectedThemeId);
              const builtInSub = currentThemePreset?.subthemes.find(st => st.id === selectedSubthemeId);
              const customSub = (customSubthemesByTheme[selectedThemeId] || []).find(st => st.id === selectedSubthemeId);
              const currentSubtheme = builtInSub || customSub;
              if (!currentSubtheme) return null;

              const applyToSingle = () => {
                setPrompt(currentSubtheme.promptText);
                setStyle(currentSubtheme.recommendedStyle);
                setAppliedSubthemeFeedback(`✨ Prompt diterapkan! Gaya diubah ke '${currentSubtheme.recommendedStyle}'.`);
                setTimeout(() => setAppliedSubthemeFeedback(null), 4000);
              };

              const applyToStoryboard = () => {
                setStoryIdea(currentSubtheme.storyIdeaText);
                setStyle(currentSubtheme.recommendedStyle);
                setActiveTab("storyboard");
                setAppliedSubthemeFeedback(`✨ Skenario Seri diimpor! Klik 'Kembangkan Seri Episode AI' di bawah.`);
                setTimeout(() => setAppliedSubthemeFeedback(null), 5000);
              };

              return (
                <div className="mt-3 bg-indigo-950/20 border border-indigo-500/25 p-4 rounded-2xl space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-xs font-mono font-bold text-zinc-400 bg-indigo-500/20 px-2 py-0.5 rounded uppercase leading-none shrink-0 mt-0.5">Saran AI</span>
                    <p className="text-[11px] text-indigo-200 leading-relaxed">
                      <strong>Rekomendasi Gaya:</strong> <span className="text-amber-400 font-bold">{currentSubtheme.recommendedStyle}</span> — {currentSubtheme.recommendationReason}
                    </p>
                  </div>

                  {/* Narration Generator Button — prominent for Educational theme */}
                  {(selectedThemeId === "pendidikan" || customSub) && (
                    <button
                      type="button"
                      onClick={() => generateNarration(currentSubtheme.title)}
                      disabled={isGeneratingNarration}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                    >
                      {isGeneratingNarration ? (
                        <><div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" /><span>Membuat Skrip Narasi & Dialog...</span></>
                      ) : (
                        <><Mic2 className="w-3.5 h-3.5" /><span>🎬 Generate Skrip Narasi + Dialog Karakter</span></>
                      )}
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-indigo-500/10">
                    <button type="button" onClick={applyToSingle} className="flex-1 py-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 border border-violet-500/20 text-indigo-300 font-bold text-[10px] sm:text-xs rounded-xl tracking-wider uppercase transition">
                      Terapkan ke Video Tunggal
                    </button>
                    <button type="button" onClick={applyToStoryboard} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-xs rounded-xl tracking-wider uppercase transition text-center shadow-md">
                      Terapkan ke Seri Episode
                    </button>
                  </div>

                  {appliedSubthemeFeedback && (
                    <div className="p-2.5 bg-zinc-950/90 border border-zinc-800 text-[10px] font-medium text-emerald-400 rounded-xl leading-relaxed animate-pulse">
                      {appliedSubthemeFeedback}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Narration Script Panel */}
            {narrativeScript && (
              <div className="mt-4 bg-[#020e18] border-2 border-teal-500/40 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-teal-500/20 bg-teal-950/20">
                  <div className="flex items-center space-x-2">
                    <BookText className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">Skrip Narasi Edukasi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-teal-400 font-mono">{narrativeScript.scenes?.length || 0} Adegan</span>
                    <button type="button" onClick={() => setShowNarrationPanel(!showNarrationPanel)} className="text-zinc-500 hover:text-zinc-300 transition">
                      {showNarrationPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={() => setNarrativeScript(null)} className="text-zinc-600 hover:text-red-400 transition"><X className="w-4 h-4" /></button>
                  </div>
                </div>

                {showNarrationPanel && (
                  <div className="p-4 space-y-4">
                    {/* Title & Character */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-teal-200">{narrativeScript.title}</h4>
                      <p className="text-[10px] text-zinc-400"><span className="text-teal-400 font-bold">Karakter:</span> {narrativeScript.mainCharacter?.name} — {narrativeScript.mainCharacter?.personality}</p>
                      <p className="text-[10px] text-zinc-400"><span className="text-teal-400 font-bold">Tujuan:</span> {narrativeScript.educationalObjective}</p>
                    </div>

                    {/* Scene tabs */}
                    <div className="flex flex-wrap gap-1.5">
                      {(narrativeScript.scenes || []).map((_: any, i: number) => (
                        <button key={i} type="button" onClick={() => { setActiveNarrationScene(i); setPrompt(narrativeScript.scenes[i].visualPrompt || prompt); }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition ${
                            activeNarrationScene === i ? "bg-teal-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}>
                          Adegan {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active scene detail */}
                    {narrativeScript.scenes?.[activeNarrationScene] && (() => {
                      const scene = narrativeScript.scenes[activeNarrationScene];
                      return (
                        <div className="space-y-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-teal-300">{scene.name}</p>
                            <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">{scene.durationSeconds}s</span>
                          </div>

                          {/* Dialogue lines */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">💬 Dialog Percakapan:</p>
                            {(scene.dialogue || []).map((d: any, di: number) => (
                              <div key={di} className={`flex items-start space-x-2 p-2 rounded-lg ${
                                d.character === "NARATOR" ? "bg-indigo-950/30 border border-indigo-500/20" : "bg-emerald-950/30 border border-emerald-500/20"
                              }`}>
                                <span className={`text-[9px] font-black font-mono shrink-0 px-1.5 py-0.5 rounded ${
                                  d.character === "NARATOR" ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                                }`}>{d.character}</span>
                                <p className="text-[11px] text-zinc-300 leading-relaxed italic">"{d.text}"</p>
                              </div>
                            ))}
                          </div>

                          {/* Sound */}
                          <div className="text-[10px] text-amber-300/80 bg-amber-950/20 border border-amber-500/20 p-2 rounded-lg">
                            🎵 <span className="font-semibold">Audio:</span> {scene.soundAndMusic}
                          </div>

                          {/* Teaching point */}
                          <div className="text-[10px] text-sky-300/80 bg-sky-950/20 border border-sky-500/20 p-2 rounded-lg">
                            📚 <span className="font-semibold">Poin Belajar:</span> {scene.teachingPoint}
                          </div>

                          {/* Use this scene's prompt button */}
                          <button type="button" onClick={() => { setPrompt(scene.visualPrompt); setActiveTab("text"); }}
                            className="w-full py-1.5 bg-teal-700/30 hover:bg-teal-700/50 border border-teal-500/30 text-teal-300 text-[10px] font-bold rounded-lg transition">
                            ▶ Gunakan Visual Prompt Adegan Ini
                          </button>
                        </div>
                      );
                    })()}

                    {/* Discussion Questions */}
                    {narrativeScript.discussionQuestions?.length > 0 && (
                      <div className="bg-violet-950/20 border border-violet-500/20 p-3 rounded-xl">
                        <p className="text-[9px] font-bold text-violet-400 uppercase tracking-wider mb-2">❓ Pertanyaan Diskusi Siswa:</p>
                        <ol className="space-y-1">
                          {narrativeScript.discussionQuestions.map((q: string, qi: number) => (
                            <li key={qi} className="text-[10px] text-zinc-400 leading-relaxed">{qi + 1}. {q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Baris Bawah: Riwayat + Seputar — Seimbang Full Width */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 order-3">

          {/* Riwayat Kreasi */}
          <div className="bg-[#0c0d21] p-4 sm:p-5 rounded-3xl border-2 border-indigo-500 shadow-[0_0_15px_rgba(139,92,246,0.12)]" id="kartu-riwayat">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono">
                  Riwayat Kreasi Studio Anda ({history.length})
                </h3>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-[10px] text-zinc-500 hover:text-red-400 font-semibold flex items-center space-x-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Semua</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 bg-zinc-950/40 rounded-2xl border border-zinc-900">
                <p className="text-xs text-zinc-500">
                  Belum ada riwayat video. Buat video pertama Anda untuk melihatnya di sini!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="p-3 bg-zinc-950/60 hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-pointer transition flex items-center space-x-3 text-left group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                      <img src={item.imageUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-300 group-hover:text-indigo-400 transition truncate">
                        {item.prompt}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono line-clamp-1">
                        {item.style} • {item.aspectRatio} • {item.duration}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick FAQ / Detail explanation on the bottom corner */}
          <div className="bg-[#150d02] p-5 rounded-3xl border-2 border-amber-600 text-zinc-400 space-y-3.5 text-xs shadow-[0_0_15px_rgba(245,158,11,0.08)]" id="kartu-seputar">
            <h4 className="font-bold text-zinc-300 uppercase tracking-widest font-mono text-[10px]">
              Seputar Studio Animasi
            </h4>
            <div className="space-y-3 leading-relaxed text-[11px] text-zinc-400">
              <div>
                <p className="font-bold text-zinc-300 mb-0.5">Teks ke Video & Gambar ke Video:</p>
                <p>Aplikasi ini sepenuhnya fleksibel. Tanpa mengunggah gambar awal, Anda bisa langsung men-generate video murni dari teks kreatif Anda. Sebaliknya jika diunggah gambar, AI akan bernafas menghidupkan gambar acuan tersebut.</p>
              </div>
              <div className="border-t border-zinc-900 pt-3">
                <p className="font-bold text-zinc-300 mb-0.5">Durasi 10 sampai 90 Detik:</p>
                <p>Silakan sesuaikan panjang video hasil melalui slider durasi di sebelah kiri. Cocok untuk aneka output konten sinematik interaktif.</p>
              </div>
              <div className="border-t border-zinc-900 pt-3">
                <p className="font-bold text-zinc-300 mb-0.5">Filter Pencocokan Gaya:</p>
                <p>Sistem kami menterjemahkan dan mencocokkan partikel fajar Pixar yang lucu, pendaran magis Disney, cyberpunk neon berkabut, hingga tekstur nyata dari kamera 8k realistis.</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Cinematic Studio footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-6 text-center text-[11px] text-zinc-600">
        <p>© 2026 AI Studio Build • Dirender dengan Standar Keaslian Google Veo & Antigravity</p>
      </footer>

    </div>
  );
}
