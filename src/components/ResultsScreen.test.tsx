import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsScreen from './ResultsScreen';
import type { UserAnswer } from '../types';

describe('ResultsScreen - Topics Needing Review', () => {
  const createMockAnswers = (correctCount: number, totalCount: number, topic: string): UserAnswer[] => {
    const answers: UserAnswer[] = [];
    for (let i = 0; i < totalCount; i++) {
      answers.push({
        questionId: i + 1,
        question: `Question ${i + 1}`,
        options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
        correctAnswer: "A",
        selectedAnswer: i < correctCount ? "A" : "B",
        isCorrect: i < correctCount,
        explanation: "Explanation",
        topic: topic
      });
    }
    return answers;
  };

  it('should show Topics Needing Review when in All Questions mode and topic has >20% wrong', () => {
    const mockOnRestart = vi.fn();

    // Create answers: 10 total, 6 wrong (60% wrong) for React topic
    const answers = createMockAnswers(4, 10, 'React');

    render(
      <ResultsScreen
        answers={answers}
        onRestart={mockOnRestart}
        isRandomMode={false}
      />
    );

    expect(screen.getByText(/Topics Needing Review/i)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText(/6\/10 wrong \(60%\)/i)).toBeInTheDocument();
  });

  it('should NOT show Topics Needing Review when in Random Questions mode', () => {
    const mockOnRestart = vi.fn();

    // Create answers: 10 total, 6 wrong (60% wrong) for React topic
    const answers = createMockAnswers(4, 10, 'React');

    render(
      <ResultsScreen
        answers={answers}
        onRestart={mockOnRestart}
        isRandomMode={true}
      />
    );

    expect(screen.queryByText(/Topics Needing Review/i)).not.toBeInTheDocument();
  });

  it('should NOT show Topics Needing Review when all topics have ≤20% wrong answers', () => {
    const mockOnRestart = vi.fn();

    // Create answers: 10 total, 2 wrong (20% wrong) - exactly at threshold
    const answers = createMockAnswers(8, 10, 'React');

    render(
      <ResultsScreen
        answers={answers}
        onRestart={mockOnRestart}
        isRandomMode={false}
      />
    );

    expect(screen.queryByText(/Topics Needing Review/i)).not.toBeInTheDocument();
  });

  it('should show multiple topics needing review sorted by wrong percentage', () => {
    const mockOnRestart = vi.fn();

    // React: 7/10 wrong (70%) - IDs 1-10
    const reactAnswers = createMockAnswers(3, 10, 'React');
    // TypeScript: 3/10 wrong (30%) - IDs 11-20 to avoid duplicate keys
    const tsAnswers = createMockAnswers(7, 10, 'TypeScript').map(answer => ({
      ...answer,
      questionId: answer.questionId + 10
    }));

    const allAnswers = [...reactAnswers, ...tsAnswers];

    render(
      <ResultsScreen
        answers={allAnswers}
        onRestart={mockOnRestart}
        isRandomMode={false}
      />
    );

    expect(screen.getByText(/Topics Needing Review/i)).toBeInTheDocument();

    // Both topics should appear
    const reactTopic = screen.getByText('React');
    const tsTopic = screen.getByText('TypeScript');

    expect(reactTopic).toBeInTheDocument();
    expect(tsTopic).toBeInTheDocument();

    // React should appear before TypeScript (higher percentage)
    const topicElements = screen.getAllByText(/React|TypeScript/);
    expect(topicElements[0].textContent).toBe('React');
  });

  it('should show progress bar with correct width for each topic', () => {
    const mockOnRestart = vi.fn();

    // React: 5/10 wrong (50%)
    const answers = createMockAnswers(5, 10, 'React');

    render(
      <ResultsScreen
        answers={answers}
        onRestart={mockOnRestart}
        isRandomMode={false}
      />
    );

    const progressBar = document.querySelector('.topic-progress-fill') as HTMLElement;
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.style.width).toBe('50%');
  });
});

describe('ResultsScreen - Export Wrong Answers', () => {
  const mockWrongAnswers: UserAnswer[] = [
    {
      questionId: 1,
      question: "What is React?",
      options: { A: "Library", B: "Framework", C: "Language", D: "Tool" },
      correctAnswer: "A",
      selectedAnswer: "B",
      isCorrect: false,
      explanation: "React is a library",
      topic: "React"
    },
    {
      questionId: 2,
      question: "What is TypeScript?",
      options: { A: "JavaScript", B: "Superset", C: "Framework", D: "Tool" },
      correctAnswer: "B",
      selectedAnswer: "A",
      isCorrect: false,
      explanation: "TypeScript is a superset",
      topic: "TypeScript"
    }
  ];

  it('should render export button when there are wrong answers', () => {
    const mockOnRestart = vi.fn();

    render(
      <ResultsScreen
        answers={mockWrongAnswers}
        onRestart={mockOnRestart}
      />
    );

    const exportButton = screen.getByText(/Export to Text File/i);
    expect(exportButton).toBeInTheDocument();
  });

  it('should NOT render export button when all answers are correct', () => {
    const mockOnRestart = vi.fn();
    const correctAnswers: UserAnswer[] = [
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
    ];

    render(
      <ResultsScreen
        answers={correctAnswers}
        onRestart={mockOnRestart}
      />
    );

    expect(screen.queryByText(/Export to Text File/i)).not.toBeInTheDocument();
  });

  it('should create downloadable file with correct format when export is clicked', () => {
    const mockOnRestart = vi.fn();

    // Mock URL methods if they don't exist
    global.URL.createObjectURL = global.URL.createObjectURL || vi.fn();
    global.URL.revokeObjectURL = global.URL.revokeObjectURL || vi.fn();

    // Mock DOM methods
    const createElementSpy = vi.spyOn(document, 'createElement');
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(
      <ResultsScreen
        answers={mockWrongAnswers}
        onRestart={mockOnRestart}
      />
    );

    const exportButton = screen.getByText(/Export to Text File/i);
    fireEvent.click(exportButton);

    // Verify Blob was created
    expect(createObjectURLSpy).toHaveBeenCalled();

    // Verify anchor element was created and clicked
    expect(createElementSpy).toHaveBeenCalledWith('a');

    // Verify cleanup
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

    // Restore mocks
    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should display wrong answer count in section header', () => {
    const mockOnRestart = vi.fn();

    render(
      <ResultsScreen
        answers={mockWrongAnswers}
        onRestart={mockOnRestart}
      />
    );

    expect(screen.getByText(/Review Incorrect Answers \(2\)/i)).toBeInTheDocument();
  });

  it('should show all wrong answers with their details', () => {
    const mockOnRestart = vi.fn();

    render(
      <ResultsScreen
        answers={mockWrongAnswers}
        onRestart={mockOnRestart}
      />
    );

    // Check that both questions are displayed
    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(screen.getByText("What is TypeScript?")).toBeInTheDocument();

    // Check that selected and correct answers are shown
    expect(screen.getByText(/Your Answer \(B\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct Answer \(A\):/i)).toBeInTheDocument();
  });
});
