import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import { useShoes, computeResults } from "./hooks/useMatching";
import "./App.css";

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
          D<span className="accent">I</span>MES
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
