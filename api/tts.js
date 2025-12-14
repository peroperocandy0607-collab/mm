export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("POST only");
  }

  const { text } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
      const t = await r.text();
      return res.status(500).send(t);
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/wav");
    res.send(buffer);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "tts failed" });
  }
}
