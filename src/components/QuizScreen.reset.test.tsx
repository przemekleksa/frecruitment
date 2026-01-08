import { describe, it, expect, vi } from 'vitest';
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

describe('QuizScreen - Reset Button', () => {
  it('should render reset button in the progress bar area', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('↺');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveClass('reset-button-small');
  });

  it('should call onReset when reset button is clicked', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('↺');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should reset button be positioned to the right of progress bar', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    const progressContainer = screen.getByText('↺').closest('.progress-bar-container');
    expect(progressContainer).toBeInTheDocument();

    // Reset button should be the last child in the container
    const resetButton = screen.getByText('↺');
    expect(resetButton.parentElement).toBe(progressContainer);
  });

  it('should not lose quiz progress when reset is not clicked', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    const { rerender } = render(
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

    // Verify we're on question 2
    expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();

    // Rerender without clicking reset
    rerender(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // onReset should not have been called
    expect(mockOnReset).not.toHaveBeenCalled();
  });
});
