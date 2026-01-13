import { useEffect, useMemo, useState } from "react";
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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(
    savedState?.userAnswers || []
  );

  const quizQuestions = useMemo(() => {
    // For "random" mode, always use all questions (ignore topic filter)
    // For "all" mode, filter by topic prefix if selected
    const filtered =
      quizMode === "random"
        ? quizData.quiz
        : selectedTopic
        ? quizData.quiz.filter((q) => q.topic.startsWith(selectedTopic))
        : quizData.quiz;

    // eslint-disable-next-line react-hooks/purity
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    if (quizMode === "random") {
      return shuffled.slice(0, 25);
    }
    return shuffled;
  }, [quizMode, selectedTopic]);

  const handleStartQuiz = (mode: QuizMode, topic?: string) => {
    setQuizMode(mode);
    setSelectedTopic(topic || null);
    setCurrentScreen("quiz");
    setUserAnswers([]);
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
    setSelectedTopic(null);
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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [currentScreen, quizMode, userAnswers]);

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
