export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { answers, archetype, topShoe } = req.body;
  if (!answers || !archetype || !topShoe) return res.status(400).json({ error: "Missing fields" });

  const positionLabels  = { pg: "point guard", sg: "shooting guard", sf: "small forward", c: "center/big" };
  const attackLabels    = { cuts: "quick cuts and change of direction", explosive: "explosive first step", midrange: "mid-range pull-ups and step-backs", power: "power moves to the rim" };
  const surfaceLabels   = { indoor: "clean indoor hardwood", dusty: "dusty or dirty courts", outdoor: "outdoor asphalt/concrete" };
  const injuryLabels    = { ankle: "ankle concerns", knee: "knee concerns", none: "no injury concerns" };
  const weightLabels    = { ultralight: "ultra lightweight", balanced: "balanced weight", heavy: "stability over weight" };
  const cushionLabels   = { court: "court feel and control", cushion: "impact protection and cushioning" };

  const { position, attack, cushionPref, surface, injury, weightPref } = answers;

  const prompt = `You are an expert basketball shoe coach. A player just completed a shoe finder quiz. Write them a short, personalized 2-3 sentence coaching note explaining why their top shoe match fits their game. Be specific, direct, and sound like a knowledgeable coach — not a salesperson.

Player profile:
- Position: ${positionLabels[position]}
- Attack style: ${attackLabels[attack]}
- Prefers: ${cushionLabels[cushionPref]}
- Plays on: ${surfaceLabels[surface]}
- Injury concerns: ${injuryLabels[injury]}
- Weight preference: ${weightLabels[weightPref]}
- NBA archetype match: ${archetype.name} (${archetype.archetype})
- Top shoe recommendation: ${topShoe.brand} ${topShoe.name}

Write 2-3 sentences only. Start with "Your game..." or "As a [position type]..." Be specific about why this shoe fits their style. No fluff.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || "Anthropic API error" });
    }

    const data = await response.json();
    return res.status(200).json({ advice: data.content?.[0]?.text || "" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
