import React, { useState, useEffect } from "react";
import { getAICoachAdvice } from "../services/aiCoach";

const DNA_LABELS = {
  quickness:     "Quickness",
  explosiveness: "Explosiveness",
  lateralCuts:   "Lateral cuts",
  impactLoad:    "Impact load",
  courtFeel:     "Court feel",
  stabilityNeed: "Stability need",
};

function DnaStat({ label, value, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(value * 10), delay); }, [value, delay]);
  return (
    <div className="dna-stat">
      <div className="dna-stat-header">
        <span className="dna-label">{label}</span>
        <span className="dna-value">{value}<span className="dna-max">/10</span></span>
      </div>
      <div className="dna-track">
        <div className="dna-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ShoeCard({ shoe, rank }) {
  const isTop = rank === 1;
  return (
    <div className={`shoe-card ${isTop ? "shoe-card--top" : ""}`}>
      {isTop && <div className="shoe-top-badge">Best Match</div>}
      <div className="shoe-card-inner">
        <div className={`shoe-rank-circle ${isTop ? "shoe-rank-circle--top" : ""}`}>
          <span className="shoe-rank">{rank}</span>
        </div>
        <div className="shoe-info">
          <div className="shoe-brand">{shoe.brand}</div>
          <div className="shoe-name">{shoe.name}</div>
          <p className="shoe-bestfor">{shoe.bestFor}</p>
          <div className="shoe-tags">
            {shoe.tags.map((t) => (
              <span key={t} className={`shoe-tag ${isTop ? "shoe-tag--top" : ""}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="shoe-match">
          <span className={`shoe-match-pct ${isTop ? "shoe-match-pct--top" : ""}`}>{shoe.matchPct}%</span>
          <span className="shoe-match-label">match</span>
        </div>
      </div>
      {isTop && <p className="shoe-overview">{shoe.overview}</p>}
      <div className="shoe-scores">
        {["traction", "cushion", "weight", "support"].map((attr) => (
          <div key={attr} className="shoe-score-item">
            <span className="shoe-score-label">{attr}</span>
            <div className="shoe-score-track">
              <div className={`shoe-score-fill ${isTop ? "shoe-score-fill--top" : ""}`} style={{ width: `${shoe.scores[attr] * 10}%` }} />
            </div>
            <span className="shoe-score-val">{shoe.scores[attr]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsScreen({ results, answers, onRestart }) {
  const { archetype, dna, ranked } = results;
  const top5 = ranked.slice(0, 5);
  const topShoe = ranked[0];
  const [coachAdvice, setCoachAdvice] = useState("");
  const [coachLoading, setCoachLoading] = useState(true);
  const [coachError, setCoachError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    getAICoachAdvice({ answers, archetype, topShoe })
      .then((text) => { setCoachAdvice(text); setCoachLoading(false); })
      .catch((err) => { setCoachError(err.message); setCoachLoading(false); });
  }, []);

  return (
    <div className={`results-screen ${visible ? "results-visible" : ""}`}>
      <div className="results-hero">
        <div className="results-hero-glow" />
        <div className="results-hero-content">
          <div className="archetype-badge">{archetype.badge}</div>
          <h2 className="archetype-name">{archetype.archetype}</h2>
          <div className="archetype-nba-row">
            <span className="archetype-nba-label">Plays like</span>
            <span className="archetype-nba-name">{archetype.name}</span>
          </div>
          <p className="archetype-desc">{archetype.description}</p>
        </div>
        <div className="results-hero-shoe-label">
          <span className="hero-shoe-eyebrow">Your #1 match</span>
          <span className="hero-shoe-name">{topShoe.brand} {topShoe.name}</span>
          <span className="hero-shoe-pct">{topShoe.matchPct}% fit</span>
        </div>
      </div>

      <section className="results-section">
        <div className="section-header">
          <h3 className="section-title">AI Coach</h3>
          <span className="ai-pill">Powered by Claude</span>
        </div>
        <div className="coach-card">
          {coachLoading && (
            <div className="coach-loading">
              <div className="coach-dots">
                <span className="coach-dot" /><span className="coach-dot" /><span className="coach-dot" />
              </div>
              <span className="coach-loading-text">Analyzing your game...</span>
            </div>
          )}
          {coachError && <p className="coach-error">{coachError}</p>}
          {coachAdvice && (
            <div className="coach-advice">
              <div className="coach-quote-mark">"</div>
              <p className="coach-text">{coachAdvice}</p>
            </div>
          )}
        </div>
      </section>

      <section className="results-section">
        <div className="section-header">
          <h3 className="section-title">Playstyle DNA</h3>
        </div>
        <div className="dna-grid">
          {Object.entries(dna).map(([key, val], i) => (
            <DnaStat key={key} label={DNA_LABELS[key]} value={val} delay={i * 80} />
          ))}
        </div>
      </section>

      <section className="results-section">
        <div className="section-header">
          <h3 className="section-title">Your Top Matches</h3>
          <span className="section-sub">Ranked for your profile</span>
        </div>
        <div className="shoe-list">
          {top5.map((shoe, i) => (
            <ShoeCard key={shoe.id} shoe={shoe} rank={i + 1} />
          ))}
        </div>
      </section>

      <div className="results-footer">
        <button className="btn-restart" onClick={onRestart}>← Retake quiz</button>
      </div>
    </div>
  );
}
