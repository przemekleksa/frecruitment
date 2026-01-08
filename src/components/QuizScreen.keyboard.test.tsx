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

describe('QuizScreen - Keyboard Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('should select first option on screen when pressing "1" or "a"', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Press "1"
    fireEvent.keyDown(document, { key: '1' });

    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );

    // First option should be selected
    expect(optionButtons[0].className).toContain('selected');
  });

  it('should select second option on screen when pressing "2" or "b"', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Press "b"
    fireEvent.keyDown(document, { key: 'b' });

    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );

    // Second option should be selected
    expect(optionButtons[1].className).toContain('selected');
  });

  it('should select third option on screen when pressing "3" or "c"', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Press "3"
    fireEvent.keyDown(document, { key: '3' });

    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );

    // Third option should be selected
    expect(optionButtons[2].className).toContain('selected');
  });

  it('should select fourth option on screen when pressing "4" or "d"', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Press "d"
    fireEvent.keyDown(document, { key: 'd' });

    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );

    // Fourth option should be selected
    expect(optionButtons[3].className).toContain('selected');
  });

  it('should work with both lowercase and uppercase letters', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Press "A" (uppercase)
    fireEvent.keyDown(document, { key: 'A' });

    const optionButtons = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('option-button')
    );

    // First option should be selected
    expect(optionButtons[0].className).toContain('selected');
  });

  it('should move to next question when pressing Enter', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();

    // Select an option first
    fireEvent.keyDown(document, { key: '1' });

    // Press Enter
    fireEvent.keyDown(document, { key: 'Enter' });

    // Should move to question 2
    expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();
  });

  it('should not move to next question when Enter is pressed without selecting an option', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();

    // Press Enter without selecting
    fireEvent.keyDown(document, { key: 'Enter' });

    // Should still be on question 1
    expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();
  });

  it('should toggle explanation when pressing Space', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Select an option first
    fireEvent.keyDown(document, { key: '1' });

    // Initially, explanation should not be visible
    expect(screen.queryByText(/React is a library/i)).not.toBeInTheDocument();

    // Press Space to show explanation
    fireEvent.keyDown(document, { key: ' ' });

    // Explanation should be visible
    expect(screen.getByText(/React is a library/i)).toBeInTheDocument();

    // Press Space again to hide explanation
    fireEvent.keyDown(document, { key: ' ' });

    // Explanation should be hidden
    expect(screen.queryByText(/React is a library/i)).not.toBeInTheDocument();
  });

  it('should toggle explanation with Space even when no option is selected', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Explanation initially not visible
    expect(screen.queryByText(/React is a library/i)).not.toBeInTheDocument();

    // Press Space to toggle explanation
    fireEvent.keyDown(document, { key: ' ' });

    // Explanation should now be visible (button works even without selection)
    expect(screen.getByText(/React is a library/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation across multiple questions', () => {
    const mockOnComplete = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <QuizScreen
        questions={mockQuestions}
        onQuizComplete={mockOnComplete}
        onReset={mockOnReset}
      />
    );

    // Question 1: Select with "a" and press Enter
    fireEvent.keyDown(document, { key: 'a' });
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();

    // Question 2: Select with "2" and press Enter
    fireEvent.keyDown(document, { key: '2' });
    fireEvent.keyDown(document, { key: 'Enter' });

    // Should complete quiz
    expect(mockOnComplete).toHaveBeenCalled();
  });
});
