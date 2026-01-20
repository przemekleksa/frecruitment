import { useEffect, useState } from "react";
import "./App.css";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import quizData from "./quiz.json";
import type { Question, QuizMode, Screen, UserAnswer } from "./types";

const STORAGE_KEY = "quiz-state";

interface SavedState {
  currentScreen: Screen;
  quizMode: QuizMode | null;
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  answers: UserAnswer[];
  shuffledQuestions?: Question[];
}

function App() {
  // Load saved state from localStorage
  const loadSavedState = (): Partial<SavedState> | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedState = loadSavedState();

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    savedState?.currentScreen || "welcome"
  );
  const [quizMode, setQuizMode] = useState<QuizMode | null>(
    savedState?.quizMode || null
  );
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(
    savedState?.userAnswers || []
  );
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(
    savedState?.shuffledQuestions || []
  );

  const quizQuestions = shuffledQuestions;

  const handleStartQuiz = (mode: QuizMode, topic?: string) => {
    setQuizMode(mode);
    setCurrentScreen("quiz");
    setUserAnswers([]);

    // Filter questions based on mode and topic
    const filtered =
      mode === "random"
        ? quizData.quiz
        : topic
        ? quizData.quiz.filter((q) => q.topic.startsWith(topic))
        : quizData.quiz;

    // Fisher-Yates shuffle algorithm - stable and unbiased
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Set shuffled questions (only happens once when quiz starts)
    const finalQuestions = mode === "random" ? shuffled.slice(0, 25) : shuffled;
    setShuffledQuestions(finalQuestions as Question[]);

    // Clear any previous quiz progress
    localStorage.removeItem("quiz-progress");
  };

  const handleQuizComplete = (answers: UserAnswer[]) => {
    setUserAnswers(answers);
    setCurrentScreen("results");
  };

  const handleRestart = () => {
    setCurrentScreen("welcome");
    setQuizMode(null);
    setUserAnswers([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentScreen !== "welcome") {
      const stateToSave: Partial<SavedState> = {
        currentScreen,
        quizMode,
        userAnswers,
        shuffledQuestions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [currentScreen, quizMode, userAnswers, shuffledQuestions]);

  return (
    <div className="app">
      {currentScreen === "welcome" && (
        <WelcomeScreen onStartQuiz={handleStartQuiz} />
      )}

      {currentScreen === "quiz" && (
        <QuizScreen
          questions={quizQuestions as Question[]}
          onQuizComplete={handleQuizComplete}
          onReset={handleRestart}
        />
      )}

      {currentScreen === "results" && (
        <ResultsScreen
          answers={userAnswers}
          onRestart={handleRestart}
          isRandomMode={quizMode === "random"}
        />
      )}
    </div>
  );
}

export default App;
