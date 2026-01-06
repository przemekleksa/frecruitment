import type { QuizMode } from "../types";

interface WelcomeScreenProps {
  onStartQuiz: (mode: QuizMode) => void;
}

export default function WelcomeScreen({ onStartQuiz }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <h1>Frontend Engineer Quiz</h1>
      <p>Test your knowledge on React, JavaScript, TypeScript and more!</p>

      <div className="quiz-modes">
        <button className="mode-button" onClick={() => onStartQuiz("all")}>
          All Questions
          <span className="mode-description">All questions</span>
        </button>

        <button className="mode-button" onClick={() => onStartQuiz("random")}>
          Random Questions
          <span className="mode-description">25 random questions</span>
        </button>
      </div>
    </div>
  );
}
