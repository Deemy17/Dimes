export async function getAICoachAdvice({ answers, archetype, topShoe }) {
  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, archetype, topShoe }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${response.status}`);
  }

  const data = await response.json();
  return data.advice || "";
}
