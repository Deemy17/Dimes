import React, { useState } from "react";
import { questions } from "../data/questions";

const TOTAL = questions.length + 1;

export default function QuizScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const isFinalQuestion = currentIndex === questions.length;
  const [favShoe, setFavShoe] = useState("");
  const question = !isFinalQuestion ? questions[currentIndex] : null;
  const progress = (currentIndex / TOTAL) * 100;

  function handleSelect(value) {
    if (animating) return;
    setSelected(value);
    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setAnimating(false);
      }, 250);
    }, 300);
  }

  function handleFinalSubmit() {
    if (!favShoe.trim()) return;
    onComplete({ ...answers, favoriteShoe: favShoe.trim() });
  }

  return (
    <div className={`screen quiz-screen ${animating ? "fade-out" : "fade-in"}`}>
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-label">{currentIndex + 1} / {TOTAL}</span>
      </div>

      {!isFinalQuestion ? (
        <>
          <div className="q-eyebrow">Question {currentIndex + 1}</div>
          <h2 className="q-text">{question.text}</h2>
          <p className="q-subtitle">{question.subtitle}</p>
          <div className="options-list">
            {question.options.map((opt) => (
              <button key={opt.value} className={`opt-btn ${selected === opt.value ? "selected" : ""}`} onClick={() => handleSelect(opt.value)}>
                <span className="opt-emoji">{opt.emoji}</span>
                <span className="opt-content">
                  <span className="opt-label">{opt.label}</span>
                  <span className="opt-desc">{opt.desc}</span>
                </span>
                <span className="opt-check">{selected === opt.value ? "✓" : ""}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="q-eyebrow">Last Question</div>
          <h2 className="q-text">What's your favorite basketball shoe — and why?</h2>
          <p className="q-subtitle">Tell us what you love about it. No wrong answers.</p>
          <textarea className="fav-shoe-input" placeholder="e.g. Nike Kobe 6 — the traction is insane and they feel locked in on any court..." value={favShoe} onChange={(e) => setFavShoe(e.target.value)} rows={5} />
          <button className={`btn-submit ${favShoe.trim() ? "btn-submit--active" : ""}`} onClick={handleFinalSubmit} disabled={!favShoe.trim()}>
            <span>See My Results</span>
            <span className="btn-arrow">→</span>
          </button>
        </>
      )}
    </div>
  );
}
