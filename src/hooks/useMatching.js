import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { fallbackShoes, nbaArchetypes } from "../data/shoes";

// Normalize a shoe row from Supabase into the shape the app expects
function normalizeShoe(row) {
  return {
    id:       row.id,
    name:     row.name,
    brand:    row.brand,
    price:    row.price,
    tags:     row.tags     || [],
    styles:   row.styles   || [],
    surface:  row.surface  || [],
    bestFor:  row.best_for || "",
    overview: row.overview || "",
    imageUrl: row.image_url || null,
    scores: {
      traction:  row.traction   || 5,
      cushion:   row.cushion    || 5,
      weight:    row.weight     || 5,
      support:   row.support    || 5,
      courtFeel: row.court_feel || 5,
      durability:row.durability || 5,
    },
  };
}

export function useShoes() {
  const [shoes, setShoes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchShoes() {
      try {
        const { data, error: err } = await supabase
          .from("shoes")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;

        // If Supabase table is empty, fall back to hardcoded data
        if (data && data.length > 0) {
          setShoes(data.map(normalizeShoe));
        } else {
          setShoes(fallbackShoes);
        }
      } catch (e) {
        console.warn("Supabase fetch failed, using fallback data:", e.message);
        setShoes(fallbackShoes);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchShoes();
  }, []);

  return { shoes, loading, error };
}

export function computeResults(answers, shoes) {
  const { position, height, weight, playStyle, cushionPref, surface, weightPref, injury } = answers;

  // NBA archetype match using new playstyles
  let bestArchetype = nbaArchetypes[0];
  let bestScore = -1;
  nbaArchetypes.forEach((a) => {
    let s = 0;
    if (a.positions.includes(position))    s += 3;
    if (a.playstyles.includes(playStyle))  s += 3;
    if (s > bestScore) { bestScore = s; bestArchetype = a; }
  });

  // Body size impact load (height + weight combined → 2–8 scale)
  const heightLoad = { short: 1, medium: 2, tall: 3, xtall: 4 }[height]  ?? 2;
  const weightLoad = { light: 1, average: 2, heavy: 3, xheavy: 4 }[weight] ?? 2;
  const impactLoad = heightLoad + weightLoad; // 2 = tiny/light, 8 = very tall/heavy

  // Playstyle DNA (for display)
  const dna = {
    quickness:     position === "pg" ? 9 : position === "sg" ? 7 : position === "sf" ? 6 : position === "pf" ? 4 : 3,
    explosiveness: playStyle === "slasher" ? 9 : playStyle === "playmaker" ? 7 : playStyle === "twoway" ? 6 : playStyle === "power" ? 5 : 4,
    lateralCuts:   playStyle === "slasher" ? 9 : playStyle === "twoway" ? 6 : playStyle === "playmaker" ? 5 : 4,
    impactLoad,
    courtFeel:     cushionPref === "court" ? 9 : cushionPref === "balanced" ? 6 : 4,
    stabilityNeed: injury === "ankle" ? 9 : injury === "knee" ? 8 : injury === "plantar" ? 7 : position === "c" || position === "pf" ? 6 : 5,
  };

  // Score each shoe
  function scoreShoe(shoe) {
    let s = 0;

    // --- PLAY STYLE ---
    if (playStyle === "slasher" || playStyle === "playmaker") {
      if (shoe.scores.traction  >= 9) s += 4;
      if (shoe.scores.courtFeel >= 8) s += 2;
      if (shoe.scores.weight    >= 8) s += 2;
    }
    if (playStyle === "shooter") {
      if (shoe.scores.cushion   >= 8) s += 3;
      if (shoe.scores.traction  >= 8) s += 2;
      if (shoe.scores.courtFeel >= 7) s += 2;
    }
    if (playStyle === "power") {
      if (shoe.scores.cushion    >= 9) s += 4;
      if (shoe.scores.support    >= 8) s += 3;
      if (shoe.scores.durability >= 8) s += 2;
    }
    if (playStyle === "twoway") {
      // Reward well-rounded shoes
      const avg = (shoe.scores.traction + shoe.scores.cushion + shoe.scores.support) / 3;
      s += Math.round(avg * 0.8);
    }

    // --- HEIGHT + WEIGHT → CUSHION & SUPPORT NEEDS ---
    if (impactLoad >= 6) {
      // Tall and/or heavy — need max cushion and support
      if (shoe.scores.cushion  >= 9) s += 4;
      if (shoe.scores.support  >= 8) s += 3;
      if (shoe.scores.weight   <= 5) s -= 2; // penalize ultra-light — not enough structure
    } else if (impactLoad >= 4) {
      // Average build — balanced needs
      if (shoe.scores.cushion  >= 7) s += 2;
      if (shoe.scores.support  >= 7) s += 1;
    } else {
      // Light and/or short — reward lightweight, court feel
      if (shoe.scores.weight    >= 8) s += 3;
      if (shoe.scores.courtFeel >= 8) s += 2;
    }

    // --- CUSHION PREFERENCE ---
    if (cushionPref === "court"   && shoe.scores.courtFeel >= 8) s += 3;
    if (cushionPref === "cushion" && shoe.scores.cushion   >= 8) s += 3;
    if (cushionPref === "balanced") {
      if (shoe.scores.cushion >= 7 && shoe.scores.courtFeel >= 6) s += 3;
    }

    // --- SURFACE ---
    if (surface === "outdoor" && shoe.scores.durability >= 8) s += 3;
    if (surface === "dusty"   && shoe.scores.traction   >= 9) s += 3;
    if (surface === "indoor")                                   s += 1;

    // --- INJURY ---
    if (injury === "knee"    && shoe.scores.cushion >= 9)                               s += 3;
    if (injury === "ankle"   && shoe.scores.support >= 9)                               s += 3;
    if (injury === "plantar" && shoe.scores.support >= 8 && shoe.scores.cushion >= 8)   s += 3;

    // --- SHOE WEIGHT PREFERENCE ---
    if (weightPref === "ultralight" && shoe.scores.weight >= 8)                           s += 2;
    if (weightPref === "balanced"   && shoe.scores.weight >= 6 && shoe.scores.weight <= 8) s += 2;
    if (weightPref === "heavy"      && shoe.scores.weight <= 5)                           s += 2;

    // --- BASELINE TRACTION (always matters) ---
    s += shoe.scores.traction * 0.4;

    return Math.round(s);
  }

  const MAX = 32;
  const ranked = [...shoes]
    .map((shoe) => ({ ...shoe, matchScore: scoreShoe(shoe) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((shoe) => ({
      ...shoe,
      matchPct: Math.min(99, Math.round((shoe.matchScore / MAX) * 100)),
    }));

  return { archetype: bestArchetype, dna, ranked };
}
