import React, { useState } from "react";
import { questions } from "../data/questions";

const TOTAL = questions.length + 1;

function WeightInput({ onConfirm }) {
  const [lbs, setLbs] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const val = e.target.value.replace(/\D/g, "");
    setLbs(val);
    setError("");
  }

  function handleConfirm() {
    const num = parseInt(lbs, 10);
    if (!num || num < 50 || num > 500) {
      setError("Please enter a valid weight between 50 and 500 lbs.");
      return;
    }
    let category;
    if (num < 160)       category = "light";
    else if (num < 200)  category = "average";
    else if (num < 240)  category = "heavy";
    else                 category = "xheavy";
    onConfirm(category);
  }

  function handleKey(e) {
    if (e.key === "Enter") handleConfirm();
  }

  return (
    <div className="weight-input-wrap">
      <div className="weight-field">
        <input
          className="weight-input"
          type="text"
          inputMode="numeric"
          placeholder="000"
          value={lbs}
          onChange={handleChange}
          onKeyDown={handleKey}
          maxLength={3}
          autoFocus
        />
        <span className="weight-unit">lbs</span>
      </div>
      {error && <p className="weight-error">{error}</p>}
      <button
        className={`btn-submit ${lbs ? "btn-submit--active" : ""}`}
        onClick={handleConfirm}
        disabled={!lbs}
      >
        <span>Confirm Weight</span>
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}

function HeightPicker({ onConfirm }) {
  const [feet, setFeet] = useState(6);
  const [inches, setInches] = useState(0);

  const minFeet = 4; const maxFeet = 7;
  const minInches = 0; const maxInches = 11;

  function changeFeet(dir) {
    setFeet((f) => Math.min(maxFeet, Math.max(minFeet, f + dir)));
  }
  function changeInches(dir) {
    setInches((i) => Math.min(maxInches, Math.max(minInches, i + dir)));
  }

  return (
    <div className="height-picker">
      <div className="height-columns">
        {/* FEET */}
        <div className="height-col">
          <button className="height-arrow" onClick={() => changeFeet(1)}>▲</button>
          <div className="height-value">{feet}</div>
          <button className="height-arrow" onClick={() => changeFeet(-1)}>▼</button>
          <div className="height-unit">ft</div>
        </div>

        <div className="height-divider">′</div>

        {/* INCHES */}
        <div className="height-col">
          <button className="height-arrow" onClick={() => changeInches(1)}>▲</button>
          <div className="height-value">{inches}</div>
          <button className="height-arrow" onClick={() => changeInches(-1)}>▼</button>
          <div className="height-unit">in</div>
        </div>
      </div>

      <p className="height-display">{feet}′ {inches}″</p>

      <button className="btn-submit btn-submit--active height-confirm" onClick={() => onConfirm(feet * 12 + inches)}>
        <span>Confirm Height</span>
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}

export default function QuizScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const isFinalQuestion = currentIndex === questions.length;
  const [favShoe, setFavShoe] = useState("");
  const question = !isFinalQuestion ? questions[currentIndex] : null;
  const progress = (currentIndex / TOTAL) * 100;
  const isHeightQuestion  = question?.type === "height-picker";
  const isWeightQuestion  = question?.type === "weight-input";

  function advance(id, value) {
    if (animating) return;
    const newAnswers = { ...answers, [id]: value };
    setAnswers(newAnswers);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnimating(false);
    }, 250);
  }

  function handleSelect(value) {
    if (animating) return;
    setSelected(value);
    setTimeout(() => advance(question.id, value), 300);
  }

  function handleWeightConfirm(category) {
    advance(question.id, category);
  }

  function handleHeightConfirm(totalInches) {
    // Map total inches → height category for the matching algorithm
    let category;
    if (totalInches < 68)       category = "short";   // under 5'8"
    else if (totalInches < 73)  category = "medium";  // 5'8" – 6'1"
    else if (totalInches < 77)  category = "tall";    // 6'1" – 6'4"
    else                        category = "xtall";   // 6'5"+
    advance(question.id, category);
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

          {isHeightQuestion ? (
            <HeightPicker onConfirm={handleHeightConfirm} />
          ) : isWeightQuestion ? (
            <WeightInput onConfirm={handleWeightConfirm} />
          ) : (
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
          )}
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
