module.exports = async function handler(req, res) {
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const r = await fetch("https://api.openai.com/v1/audio/speech", {
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
    });

    if (!r.ok) {
      const err = await r.text();
      console.error("OpenAI error:", err);
      return res.status(500).send(err);
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/wav");
    res.send(buffer);

  } catch (e: any) {
    console.error("TTS crash:", e);
    res.status(500).json({ error: e.message });
  }
}
