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
  },
  {
    id: 3,
    question: "What is JavaScript?",
    options: { A: "Language", B: "Framework", C: "Library", D: "Tool" },
    correctAnswer: "A",
    explanation: "JavaScript is a language",
    topic: "JavaScript",
    difficulty: "easy"
  }
];

describe('QuizScreen - Previous Button Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('should render previous button that is disabled on first question', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    const previousButton = screen.getByText('←');
    expect(previousButton).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  });

  it('should enable previous button after moving to second question', () => {
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

    // Previous button should now be enabled
    const previousButton = screen.getByText('←');
    expect(previousButton).not.toBeDisabled();
  });

  it('should navigate back to previous question when previous button is clicked', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Verify we're on question 1
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();

    // Answer first question and move to next
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Verify we're on question 2
    expect(screen.getByText(/Question 2 of 3/i)).toBeInTheDocument();

    // Click previous button
    const previousButton = screen.getByText('←');
    fireEvent.click(previousButton);

    // Verify we're back on question 1
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });

  it('should preserve previous answer when navigating back', () => {
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
    const firstOptionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(firstOptionButtons[0]);

    // Move to next question
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Go back
    const previousButton = screen.getByText('←');
    fireEvent.click(previousButton);

    // Check that the selected answer is still selected
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    const selectedButton = optionButtons.find(btn => btn.className.includes('selected'));
    expect(selectedButton).toBeDefined();
  });

  it('should respond to Backspace keyboard shortcut', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Answer first question and move to next
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    expect(screen.getByText(/Question 2 of 3/i)).toBeInTheDocument();

    // Press Backspace
    fireEvent.keyDown(document, { key: 'Backspace' });

    // Should navigate back to question 1
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });

  it('should not allow navigation before first question', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();

    // Try to press Backspace on first question
    fireEvent.keyDown(document, { key: 'Backspace' });

    // Should still be on question 1
    expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
  });
});
