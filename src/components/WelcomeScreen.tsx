import { useState } from "react";
import type { QuizMode } from "../types";
import quizData from "../quiz.json";

interface WelcomeScreenProps {
  onStartQuiz: (mode: QuizMode, topic?: string) => void;
}

export default function WelcomeScreen({ onStartQuiz }: WelcomeScreenProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Get unique topics from quiz data
  const topics = Array.from(
    new Set(quizData.quiz.map((q) => q.topic))
  ).sort();

  return (
    <div className="welcome-screen">
      <h1>Frontend Engineer Quiz</h1>
      <p>Test your knowledge on React, JavaScript, TypeScript and more!</p>

      <div className="topic-selector">
        <label htmlFor="topic-select">Filter by Topic:</label>
        <select
          id="topic-select"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="topic-dropdown"
        >
          <option value="all">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="quiz-modes">
        <button
          className="mode-button"
          onClick={() =>
            onStartQuiz("all", selectedTopic === "all" ? undefined : selectedTopic)
          }
        >
          All Questions
          <span className="mode-description">
            {selectedTopic === "all"
              ? "All questions"
              : `All questions from ${selectedTopic}`}
          </span>
        </button>

        <button
          className="mode-button"
          onClick={() => onStartQuiz("random")}
        >
          Random Questions
          <span className="mode-description">25 random questions</span>
        </button>
      </div>
    </div>
  );
}
