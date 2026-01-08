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
    explanation: "React is a JavaScript library for building user interfaces.",
    topic: "React",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "What is TypeScript?",
    options: { A: "JavaScript", B: "Superset", C: "Framework", D: "Tool" },
    correctAnswer: "B",
    explanation: "TypeScript is a superset of JavaScript that adds static typing.",
    topic: "TypeScript",
    difficulty: "easy"
  }
];

describe('QuizScreen - Show Explanation Feature', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('should render "Show Explanation" button when an option is selected', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Button should always be visible
    expect(screen.getByText(/Show Explanation/i)).toBeInTheDocument();

    // Select an option
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    // Button should still be visible
    expect(screen.getByText(/Show Explanation/i)).toBeInTheDocument();
  });

  it('should render "Show Explanation" button even when no option is selected', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Button is always visible
    expect(screen.getByText(/Show Explanation/i)).toBeInTheDocument();
  });

  it('should show explanation when "Show Explanation" button is clicked', () => {
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

    // Click "Show Explanation"
    const showExplanationButton = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton);

    // Explanation should be visible
    expect(screen.getByText(/React is a JavaScript library for building user interfaces/i)).toBeInTheDocument();
  });

  it('should hide explanation when button is clicked again', () => {
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

    // Show explanation
    const showExplanationButton = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton);

    expect(screen.getByText(/React is a JavaScript library for building user interfaces/i)).toBeInTheDocument();

    // Hide explanation
    const hideExplanationButton = screen.getByText(/Hide Explanation/i);
    fireEvent.click(hideExplanationButton);

    expect(screen.queryByText(/React is a JavaScript library for building user interfaces/i)).not.toBeInTheDocument();
  });

  it('should show correct answer hint when explanation is visible', () => {
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
    fireEvent.click(optionButtons[1]); // Select wrong answer

    // Show explanation
    const showExplanationButton = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton);

    // Correct answer hint should be visible with specific class
    const correctAnswerHint = document.querySelector('.correct-answer-hint');
    expect(correctAnswerHint).toBeInTheDocument();
    expect(correctAnswerHint?.textContent).toContain('Correct Answer:');
    expect(correctAnswerHint?.textContent).toContain('Library');
  });

  it('should display correct answer with its letter (A, B, C, or D)', () => {
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

    // Show explanation
    const showExplanationButton = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton);

    // Should show correct answer with letter
    // The correct answer is A: Library
    expect(screen.getByText(/Correct Answer:/i)).toBeInTheDocument();
  });

  it('should toggle explanation using Space key', () => {
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
    fireEvent.keyDown(document, { key: '1' });

    // Press Space to show explanation
    fireEvent.keyDown(document, { key: ' ' });

    expect(screen.getByText(/React is a JavaScript library for building user interfaces/i)).toBeInTheDocument();

    // Press Space again to hide explanation
    fireEvent.keyDown(document, { key: ' ' });

    expect(screen.queryByText(/React is a JavaScript library for building user interfaces/i)).not.toBeInTheDocument();
  });

  it('should reset explanation state when moving to next question', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Select an option and show explanation
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    const showExplanationButton = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton);

    expect(screen.getByText(/React is a JavaScript library for building user interfaces/i)).toBeInTheDocument();

    // Move to next question
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Explanation should be hidden on new question (explanation resets)
    expect(screen.queryByText(/React is a JavaScript library for building user interfaces/i)).not.toBeInTheDocument();

    // Button is still visible but explanation should be hidden
    expect(screen.getByText(/Show Explanation/i)).toBeInTheDocument();
  });

  it('should show different explanations for different questions', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Question 1
    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons[0]);

    const showExplanationButton = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton);

    expect(screen.getByText(/React is a JavaScript library for building user interfaces/i)).toBeInTheDocument();

    // Move to question 2
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Select option and show explanation
    const optionButtons2 = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );
    fireEvent.click(optionButtons2[1]);

    const showExplanationButton2 = screen.getByText(/Show Explanation/i);
    fireEvent.click(showExplanationButton2);

    // Should show different explanation
    expect(screen.getByText(/TypeScript is a superset of JavaScript that adds static typing/i)).toBeInTheDocument();
    expect(screen.queryByText(/React is a JavaScript library for building user interfaces/i)).not.toBeInTheDocument();
  });
});
