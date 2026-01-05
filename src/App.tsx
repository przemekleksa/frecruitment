import { useMemo, useState } from "react";
import "./App.css";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import quizData from "./quiz.json";
import type { Question, QuizMode, Screen, UserAnswer } from "./types";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const quizQuestions = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const shuffled = [...quizData.quiz].sort(() => Math.random() - 0.5);

    if (quizMode === "random") {
      return shuffled.slice(0, 25);
    }
    return shuffled;
  }, [quizMode]);

  const handleStartQuiz = (mode: QuizMode) => {
    setQuizMode(mode);
    setCurrentScreen("quiz");
    setUserAnswers([]);
  };

  const handleQuizComplete = (answers: UserAnswer[]) => {
    setUserAnswers(answers);
    setCurrentScreen("results");
  };

  const handleRestart = () => {
    setCurrentScreen("welcome");
    setQuizMode(null);
    setUserAnswers([]);
  };

  return (
    <div className="app">
      {currentScreen === "welcome" && (
        <WelcomeScreen onStartQuiz={handleStartQuiz} />
      )}

      {currentScreen === "quiz" && (
        <QuizScreen
          questions={quizQuestions as Question[]}
          onQuizComplete={handleQuizComplete}
        />
      )}

      {currentScreen === "results" && (
        <ResultsScreen answers={userAnswers} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
