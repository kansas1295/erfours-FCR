import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Gemini Recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { history, currentStatus } = req.body;

      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: "Data sejarah tidak valid" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "Kunci API Gemini belum dikonfigurasi di server." });
      }

      // Generate feed recommendations based on history data and currentStatus using Gemini 3.5 Flash
      const prompt = `
Anda adalah seorang konsultan ahli peternakan ayam broiler profesional dengan pengalaman puluhan tahun. Berikan rekomendasi manajemen pakan harian berdasarkan data historis performa ayam berikut.

### Informasi Status Saat Ini:
- Umur Saat Ini: ${currentStatus?.age || 'Tidak diketahui'} hari
- Rata-rata Bobot Saat Ini: ${currentStatus?.avgWeight || 'Tidak diketahui'} kg
- Estimasi FCR Saat Ini: ${currentStatus?.fcr || 'Tidak diketahui'}
- Total Kematian: ${currentStatus?.totalMortality || 0} ekor

### Data Historis Harian (FCR, Umur, Bobot, Pakan):
${history.map((h: any) => `- Hari ${h.age}: Bobot=${h.totalWeight && h.currentPop ? (h.totalWeight / h.currentPop).toFixed(3) : 'N/A'} kg, Kumulatif Pakan=${h.totalFeed || 0} kg, FCR=${h.fcr ? h.fcr.toFixed(2) : 'N/A'}, Harian FCR=${h.dailyFcr ? h.dailyFcr.toFixed(2) : 'N/A'}, Mati=${h.mortality || 0} ekor, IP=${h.ip ? Math.round(h.ip) : 'N/A'}`).join('\n')}

Format rekomendasi Anda dalam Bahasa Indonesia yang profesional, ramah, dan sangat aplikatif. Strukturkan ke dalam 4 bagian utama menggunakan format markdown yang sangat bersih dan mudah dibaca:
1. **Analisis Tren Performa Saat Ini**: Evaluasi FCR harian vs FCR kumulatif, tren pertumbuhan bobot badan, mortalitas, dan Indeks Performa (IP).
2. **Rekomendasi Manajemen Pakan Spesifik**: Kebutuhan pakan standar untuk umur saat ini, teknik & frekuensi pemberian pakan (misal: pakan sedikit tapi sering, manajemen tinggi tempat pakan, teknik pencahayaan/feed restriction), jenis pakan yang tepat (Pre-starter/Starter/Finisher), dan target asupan harian (Feed Intake/FI).
3. **Tindakan Korektif & Biosekuriti Lapangan**: Tindakan konkret lapangan untuk mengatasi isu yang terdeteksi (seperti FCR bengkak, bobot tertinggal, atau tingkat kematian naik). Bahas manajemen suhu, ventilasi kandang (kipas/inlet), kebersihan tempat pakan/air minum, serta asupan suplemen/vitamin.
4. **Target Performa 3 Hari ke Depan**: Target bobot badan berikutnya, batas atas FCR kumulatif yang dapat ditoleransi, dan proyeksi Indeks Performa (IP).

Buat analisis yang tajam, taktis, dan mudah dipraktikkan langsung oleh peternak di kandang. Jangan menyertakan disclaimer AI atau kalimat pengantar berlebihan. Langsung saja ke hasil analisis dan saran konkret.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ recommendation: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Gagal mendapatkan rekomendasi dari Gemini AI." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
