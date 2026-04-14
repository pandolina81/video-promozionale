import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", async (req, res) => {
  const { product, target, channel } = req.body;
  if (!product) {
    return res.status(400).json({ error: "Nome prodotto obbligatorio." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemPrompt = `Sei un esperto di Video Marketing Digitale specializzato in campagne ad alto tasso di conversione.
Quando l'utente fornisce un prodotto e un target, devi rispondere con un report strutturato in 3 sezioni:

**SEZIONE 1 – ANALISI PAIN POINTS**
Identifica 3-5 pain points principali del target e come il prodotto li risolve.

**SEZIONE 2 – SCRIPT AIDA (15-30 secondi)**
Scrivi lo script per il video seguendo il framework:
- 🔴 ATTENZIONE (0-3s): frase d'apertura che cattura
- 💛 INTERESSE (3-10s): pain point + empatia
- 🟢 DESIDERIO (10-22s): soluzione + benefici concreti
- 🔵 AZIONE (22-30s): CTA chiara e urgente

Includi anche i testi per le eventuali scritte a schermo (overlay).

**SEZIONE 3 – VISUAL CONCEPT (Prompt per AI Video)**
Genera un prompt dettagliato in inglese per tool di generazione video AI (come Runway, Sora, Kling) con:
- Descrizione delle scene (una per ogni beat AIDA)
- Stile visivo, palette colori, mood
- Indicazioni su testo overlay, transizioni
- Formato e aspect ratio consigliati`;

  const userMessage = `Prodotto: ${product}
Target Audience: ${target || "Generico, adulti 25-45 anni"}
Canale: ${channel || "Instagram Reels / TikTok"}`;

  try {
    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Video Marketing AI → http://localhost:${PORT}`);
});
