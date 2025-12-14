// /api/tts.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("POST only");
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: text,
          format: "wav",
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return res.status(500).send(err);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/wav");
    res.send(buffer);

  } catch (e) {
    console.error("TTS crash:", e);
    res.status(500).send("TTS server error");
  }
}

