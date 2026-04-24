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
  const { position, attack, cushionPref, surface, injury, weightPref } = answers;

  // NBA archetype match
  let bestArchetype = nbaArchetypes[0];
  let bestScore = -1;
  nbaArchetypes.forEach((a) => {
    let s = 0;
    if (a.positions.includes(position)) s += 3;
    if (a.attacks.includes(attack))     s += 3;
    if (s > bestScore) { bestScore = s; bestArchetype = a; }
  });

  // Playstyle DNA
  const dna = {
    quickness:     position === "pg" ? 9 : position === "sg" ? 7 : position === "sf" ? 5 : 3,
    explosiveness: attack === "explosive" ? 9 : attack === "cuts" ? 7 : attack === "power" ? 6 : 4,
    lateralCuts:   attack === "cuts" ? 9 : attack === "explosive" ? 6 : 4,
    impactLoad:    attack === "power" ? 9 : attack === "explosive" ? 8 : position === "c" ? 7 : 5,
    courtFeel:     cushionPref === "court" ? 9 : 4,
    stabilityNeed: injury === "ankle" ? 9 : position === "c" ? 8 : 5,
  };

  // Score each shoe
  function scoreShoe(shoe) {
    let s = 0;
    if (shoe.styles.includes(position))    s += 4;
    if (shoe.styles.includes(attack))      s += 4;
    if (cushionPref === "court"   && shoe.scores.courtFeel >= 8) s += 3;
    if (cushionPref === "cushion" && shoe.scores.cushion   >= 8) s += 3;
    if (shoe.surface.includes(surface))    s += 3;
    if (injury === "knee"  && shoe.scores.cushion  >= 9) s += 3;
    if (injury === "ankle" && shoe.scores.support  >= 9) s += 3;
    if (weightPref === "ultralight" && shoe.scores.weight >= 8) s += 2;
    if (weightPref === "balanced"   && shoe.scores.weight >= 6 && shoe.scores.weight <= 8) s += 2;
    if (weightPref === "heavy"      && shoe.scores.weight <= 5) s += 2;
    s += shoe.scores.traction * 0.5;
    return Math.round(s);
  }

  const MAX = 22;
  const ranked = [...shoes]
    .map((shoe) => ({ ...shoe, matchScore: scoreShoe(shoe) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((shoe) => ({
      ...shoe,
      matchPct: Math.min(99, Math.round((shoe.matchScore / MAX) * 100)),
    }));

  return { archetype: bestArchetype, dna, ranked };
}
