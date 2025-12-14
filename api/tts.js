
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("POST only");

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "text is required" });

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
    const msg = await r.text();
    return res.status(500).json({ error: "OpenAI error", detail: msg });
  }

  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("Content-Type", "audio/wav");
  res.send(buf);
}
