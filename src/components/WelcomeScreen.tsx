import { useState } from "react";
import quizData from "../quiz.json";
import type { QuizMode } from "../types";

interface WelcomeScreenProps {
  onStartQuiz: (mode: QuizMode, topic?: string) => void;
}

export default function WelcomeScreen({ onStartQuiz }: WelcomeScreenProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Get unique topic prefixes (part before " - " or full name if no dash)
  const topicPrefixes = Array.from(
    new Set(
      quizData.quiz.map((q) => {
        const dashIndex = q.topic.indexOf(" - ");
        return dashIndex !== -1 ? q.topic.substring(0, dashIndex) : q.topic;
      })
    )
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
          {topicPrefixes.map((prefix) => (
            <option key={prefix} value={prefix}>
              {prefix}
            </option>
          ))}
        </select>
      </div>

      <div className="quiz-modes">
        <button
          className="mode-button"
          onClick={() =>
            onStartQuiz(
              "all",
              selectedTopic === "all" ? undefined : selectedTopic
            )
          }
        >
          All Questions
          <span className="mode-description">
            {selectedTopic === "all"
              ? "All questions"
              : `All questions from ${selectedTopic}`}
          </span>
        </button>

        <button className="mode-button" onClick={() => onStartQuiz("random")}>
          Random Questions
          <span className="mode-description">25 random questions</span>
        </button>
      </div>
    </div>
  );
}
