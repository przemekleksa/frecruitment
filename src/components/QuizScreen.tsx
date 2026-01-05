import { useState, useMemo } from "react";
import type { Question, UserAnswer } from "../types";

interface QuizScreenProps {
  questions: Question[];
  onQuizComplete: (answers: UserAnswer[]) => void;
}

type OptionKey = "A" | "B" | "C" | "D";

export default function QuizScreen({
  questions,
  onQuizComplete,
}: QuizScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Shuffle options for current question
  const shuffledOptions = useMemo(() => {
    const optionKeys: OptionKey[] = ["A", "B", "C", "D"];
    const shuffled = [...optionKeys].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
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

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      onQuizComplete(updatedAnswers);
    }
  };

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
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
              <span className="option-text">{currentQuestion.options[key]}</span>
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
            <strong>Correct Answer:</strong> {currentQuestion.options[currentQuestion.correctAnswer]}
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
