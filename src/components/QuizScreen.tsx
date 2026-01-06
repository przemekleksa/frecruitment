import { useCallback, useEffect, useMemo, useState } from "react";
import type { Question, UserAnswer } from "../types";

interface QuizScreenProps {
  questions: Question[];
  onQuizComplete: (answers: UserAnswer[]) => void;
}

const QUIZ_PROGRESS_KEY = "quiz-progress";

interface QuizProgress {
  currentQuestionIndex: number;
  answers: UserAnswer[];
  selectedAnswer: string | null;
}

type OptionKey = "A" | "B" | "C" | "D";

export default function QuizScreen({
  questions,
  onQuizComplete,
}: QuizScreenProps) {
  // Load saved progress
  const loadProgress = (): QuizProgress | null => {
    try {
      const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedProgress = loadProgress();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    savedProgress?.currentQuestionIndex || 0
  );
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(
    (savedProgress?.selectedAnswer as OptionKey) || null
  );
  const [answers, setAnswers] = useState<UserAnswer[]>(
    savedProgress?.answers || []
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Shuffle options for current question
  const shuffledOptions = useMemo(() => {
    const optionKeys: OptionKey[] = ["A", "B", "C", "D"];
    // eslint-disable-next-line react-hooks/purity
    const shuffled = [...optionKeys].sort(() => Math.random() - 0.5);
    return shuffled;
  }, []);

  const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
    setSelectedAnswer(answer);
  };

  const handleNext = useCallback(() => {
    if (!selectedAnswer) return;

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      options: currentQuestion.options,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
    };

    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers, newAnswer];

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        onQuizComplete(updatedAnswers);
      }

      return updatedAnswers;
    });
  }, [
    selectedAnswer,
    currentQuestion,
    currentQuestionIndex,
    questions.length,
    onQuizComplete,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);

      // Restore previous answer if exists
      setAnswers((prevAnswers) => {
        if (prevAnswers.length > 0) {
          const previousAnswer = prevAnswers[prevAnswers.length - 1];
          setSelectedAnswer(previousAnswer.selectedAnswer);
          return prevAnswers.slice(0, -1); // Remove last answer
        }
        setSelectedAnswer(null);
        return prevAnswers;
      });
    }
  }, [currentQuestionIndex]);

  // Save progress to localStorage
  useEffect(() => {
    const progress: QuizProgress = {
      currentQuestionIndex,
      answers,
      selectedAnswer,
    };
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
  }, [currentQuestionIndex, answers, selectedAnswer]);

  // Clear progress when quiz completes
  useEffect(() => {
    return () => {
      if (
        currentQuestionIndex === questions.length - 1 &&
        answers.length === questions.length
      ) {
        localStorage.removeItem(QUIZ_PROGRESS_KEY);
      }
    };
  }, [currentQuestionIndex, answers.length, questions.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // A, B, C, D or 1, 2, 3, 4 to select answer based on screen position
      if (key === "a" || key === "1") {
        setSelectedAnswer(shuffledOptions[0]); // First option on screen
      } else if (key === "b" || key === "2") {
        setSelectedAnswer(shuffledOptions[1]); // Second option on screen
      } else if (key === "c" || key === "3") {
        setSelectedAnswer(shuffledOptions[2]); // Third option on screen
      } else if (key === "d" || key === "4") {
        setSelectedAnswer(shuffledOptions[3]); // Fourth option on screen
      }
      // Enter to go to next question
      else if (key === "enter") {
        handleNext();
      }
      // Space to toggle explanation
      else if (key === " ") {
        event.preventDefault(); // Prevent page scroll
        setShowExplanation((prev) => !prev);
      }
      // Backspace to go to previous question
      else if (key === "backspace") {
        event.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious, shuffledOptions]);

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <div className="progress-bar-container">
          <button
            className="previous-button-small"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            title="Previous question (Backspace)"
          >
            ←
          </button>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <p className="question-counter">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="question-container">
        <h2 className="question-text">{currentQuestion.question}</h2>
        <p className="question-topic">{currentQuestion.topic}</p>

        <div className="options">
          {shuffledOptions.map((key) => (
            <button
              key={key}
              className={`option-button ${
                selectedAnswer === key ? "selected" : ""
              }`}
              onClick={() => handleAnswerSelect(key)}
            >
              <span className="option-text">
                {currentQuestion.options[key]}
              </span>
            </button>
          ))}
        </div>

        <button
          className="next-button"
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {currentQuestionIndex < questions.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </button>

        {showExplanation && (
          <div className="correct-answer-hint">
            <strong>Correct Answer:</strong>{" "}
            {currentQuestion.options[currentQuestion.correctAnswer]}
          </div>
        )}

        <button
          className="show-explanation-button"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? "Hide Explanation" : "Show Explanation"}
        </button>

        {showExplanation && (
          <div className="explanation-box">
            <p className="explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
