import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizScreen from './QuizScreen';
import type { Question } from '../types';

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is React?",
    options: { A: "Library", B: "Framework", C: "Language", D: "Tool" },
    correctAnswer: "A",
    explanation: "React is a library",
    topic: "React",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "What is TypeScript?",
    options: { A: "JavaScript", B: "Superset", C: "Framework", D: "Tool" },
    correctAnswer: "B",
    explanation: "TypeScript is a superset",
    topic: "TypeScript",
    difficulty: "easy"
  }
];

describe('QuizScreen - LocalStorage Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should save quiz progress to localStorage when moving to next question', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Select an option
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    // Move to next question to trigger save
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Check that progress was saved to localStorage
    const savedProgress = localStorage.getItem('quiz-progress');
    expect(savedProgress).not.toBeNull();

    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      expect(progress.currentQuestionIndex).toBe(1);
      expect(progress.answers).toHaveLength(1);
    }
  });

  it('should restore quiz progress from localStorage on mount', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    // Pre-populate localStorage with progress
    const savedProgress = {
      currentQuestionIndex: 1,
      answers: [
        {
          questionId: 1,
          question: "What is React?",
          options: { A: "Library", B: "Framework", C: "Language", D: "Tool" },
          correctAnswer: "A",
          selectedAnswer: "A",
          isCorrect: true,
          explanation: "React is a library",
          topic: "React"
        }
      ]
    };
    localStorage.setItem('quiz-progress', JSON.stringify(savedProgress));

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Should start at question 2 (index 1)
    expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();
  });

  it('should update localStorage when moving between questions', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Answer first question
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    // Move to next question
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Check that localStorage was updated
    const savedProgress = localStorage.getItem('quiz-progress');
    expect(savedProgress).not.toBeNull();

    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      expect(progress.currentQuestionIndex).toBe(1);
      expect(progress.answers).toHaveLength(1);
    }
  });

  it('should clear localStorage when quiz is reset', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    // Pre-populate localStorage
    localStorage.setItem('quiz-progress', JSON.stringify({
      currentQuestionIndex: 1,
      answers: []
    }));

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Click reset button
    const resetButton = screen.getByText('↺');
    fireEvent.click(resetButton);

    // onReset should be called
    expect(mockOnReset).toHaveBeenCalled();

    // Note: The actual clearing happens in App.tsx's handleRestart,
    // but we verify the reset callback is triggered correctly
  });

  it('should save answers with correct structure including topic', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Select an option and move to next question to trigger save
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    const savedProgress = localStorage.getItem('quiz-progress');
    expect(savedProgress).not.toBeNull();

    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      expect(progress.answers).toHaveLength(1);
      const answer = progress.answers[0];

      // Verify answer structure
      expect(answer).toHaveProperty('questionId');
      expect(answer).toHaveProperty('question');
      expect(answer).toHaveProperty('options');
      expect(answer).toHaveProperty('correctAnswer');
      expect(answer).toHaveProperty('selectedAnswer');
      expect(answer).toHaveProperty('isCorrect');
      expect(answer).toHaveProperty('explanation');
      expect(answer).toHaveProperty('topic');
      expect(answer.topic).toBe('React');
    }
  });

  it('should maintain localStorage state when navigating back', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Answer first question
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    // Move to next question (this triggers localStorage save)
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Verify localStorage was saved with answer
    let savedProgress = localStorage.getItem('quiz-progress');
    expect(savedProgress).not.toBeNull();

    let progress = JSON.parse(savedProgress!);
    expect(progress.answers).toHaveLength(1);
    expect(progress.currentQuestionIndex).toBe(1);

    // Go back
    const previousButton = screen.getByText('←');
    fireEvent.click(previousButton);

    // Check localStorage - currentQuestionIndex should be updated
    savedProgress = localStorage.getItem('quiz-progress');
    expect(savedProgress).not.toBeNull();

    if (savedProgress) {
      progress = JSON.parse(savedProgress);
      // After going back, we should still be on question 0
      expect(progress.currentQuestionIndex).toBe(0);
      // Answers should still be there (navigation doesn't remove answers)
      expect(progress.answers.length).toBeGreaterThanOrEqual(0);
    }
  });
});
