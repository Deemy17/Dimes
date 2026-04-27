import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import { useShoes, computeResults } from "./hooks/useMatching";
import "./App.css";

function DimesLogo() {
  return (
    <span className="dimes-logo">
      D
      <span className="logo-i-group">
        <svg className="dime-coin" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="coinBase" cx="38%" cy="32%" r="70%">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="25%"  stopColor="#e4e4e4"/>
              <stop offset="60%"  stopColor="#b8b8b8"/>
              <stop offset="100%" stopColor="#787878"/>
            </radialGradient>
            <radialGradient id="coinShine" cx="30%" cy="20%" r="55%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.85)"/>
              <stop offset="60%"  stopColor="rgba(255,255,255,0.1)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
            <radialGradient id="coinEdge" cx="50%" cy="50%" r="50%">
              <stop offset="80%"  stopColor="rgba(0,0,0,0)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.25)"/>
            </radialGradient>
          </defs>
          {/* Base coin */}
          <circle cx="10" cy="10" r="9.5" fill="url(#coinBase)"/>
          {/* Edge shadow */}
          <circle cx="10" cy="10" r="9.5" fill="url(#coinEdge)"/>
          {/* Shine overlay */}
          <circle cx="10" cy="10" r="9.5" fill="url(#coinShine)"/>
          {/* Rim */}
          <circle cx="10" cy="10" r="9.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6"/>
        </svg>
        {/* dotless i */}
        &#305;
      </span>
      mes
    </span>
  );
}

const SCREENS = { HOME: "home", QUIZ: "quiz", RESULTS: "results" };

// API key is stored securely in Vercel environment variables
export default function App() {
  const [screen, setScreen]         = useState(SCREENS.HOME);
  const [results, setResults]       = useState(null);
  const [lastAnswers, setLastAnswers] = useState(null);

  // Fetch shoes from Supabase (falls back to hardcoded if empty)
  const { shoes, loading } = useShoes();

  function handleStart() { setScreen(SCREENS.QUIZ); }

  function handleQuizComplete(answers) {
    const r = computeResults(answers, shoes);
    setResults(r);
    setLastAnswers(answers);
    setScreen(SCREENS.RESULTS);
  }

  function handleRestart() {
    setResults(null);
    setLastAnswers(null);
    setScreen(SCREENS.HOME);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="header-logo" onClick={handleRestart}>
          <DimesLogo />
        </span>
        {screen !== SCREENS.HOME && (
          <button className="header-back" onClick={handleRestart}>Home</button>
        )}
      </header>

      <main className="app-main">
        {screen === SCREENS.HOME && <HomeScreen onStart={handleStart} />}
        {screen === SCREENS.QUIZ && <QuizScreen onComplete={handleQuizComplete} />}
        {screen === SCREENS.RESULTS && results && (
          <ResultsScreen
            results={results}
            answers={lastAnswers}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}
