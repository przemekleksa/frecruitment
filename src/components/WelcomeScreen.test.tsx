import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeScreen from './WelcomeScreen';

describe('WelcomeScreen - Topic Filtering', () => {
  it('should render topic dropdown with all available topics', () => {
    const mockOnStartQuiz = vi.fn();
    render(<WelcomeScreen onStartQuiz={mockOnStartQuiz} />);

    const dropdown = screen.getByLabelText(/Filter by Topic/i);
    expect(dropdown).toBeInTheDocument();

    // Check if "All Topics" option exists
    const allTopicsOption = screen.getByRole('option', { name: /All Topics/i });
    expect(allTopicsOption).toBeInTheDocument();
  });

  it('should pass undefined topic to "All Questions" mode when "All Topics" is selected', () => {
    const mockOnStartQuiz = vi.fn();
    render(<WelcomeScreen onStartQuiz={mockOnStartQuiz} />);

    const dropdown = screen.getByLabelText(/Filter by Topic/i) as HTMLSelectElement;
    fireEvent.change(dropdown, { target: { value: 'all' } });

    const allButtons = screen.getAllByRole('button');
    const allQuestionsButton = allButtons.find(btn =>
      btn.textContent?.includes('All Questions') && btn.className.includes('mode-button')
    );
    if (allQuestionsButton) {
      fireEvent.click(allQuestionsButton);
    }

    expect(mockOnStartQuiz).toHaveBeenCalledWith('all', undefined);
  });

  it('should pass selected topic to "All Questions" mode when specific topic is selected', () => {
    const mockOnStartQuiz = vi.fn();
    render(<WelcomeScreen onStartQuiz={mockOnStartQuiz} />);

    const dropdown = screen.getByLabelText(/Filter by Topic/i) as HTMLSelectElement;

    // Get the first non-"all" option
    const options = Array.from(dropdown.options).filter(opt => opt.value !== 'all');
    if (options.length > 0) {
      const testTopic = options[0].value;
      fireEvent.change(dropdown, { target: { value: testTopic } });

      const allButtons = screen.getAllByRole('button');
      const allQuestionsButton = allButtons.find(btn =>
        btn.textContent?.includes('All Questions') && btn.className.includes('mode-button')
      );
      if (allQuestionsButton) {
        fireEvent.click(allQuestionsButton);
      }

      expect(mockOnStartQuiz).toHaveBeenCalledWith('all', testTopic);
    }
  });

  it('should NOT pass topic to "Random Questions" mode regardless of topic selection', () => {
    const mockOnStartQuiz = vi.fn();
    render(<WelcomeScreen onStartQuiz={mockOnStartQuiz} />);

    const dropdown = screen.getByLabelText(/Filter by Topic/i) as HTMLSelectElement;

    // Select a specific topic
    const options = Array.from(dropdown.options).filter(opt => opt.value !== 'all');
    if (options.length > 0) {
      const testTopic = options[0].value;
      fireEvent.change(dropdown, { target: { value: testTopic } });
    }

    const allButtons = screen.getAllByRole('button');
    const randomButton = allButtons.find(btn =>
      btn.textContent?.includes('Random Questions') && btn.className.includes('mode-button')
    );
    if (randomButton) {
      fireEvent.click(randomButton);
    }

    // Random mode should always be called without a topic parameter
    expect(mockOnStartQuiz).toHaveBeenCalledWith('random');
  });

  it('should update mode description when topic is selected for All Questions', () => {
    const mockOnStartQuiz = vi.fn();
    render(<WelcomeScreen onStartQuiz={mockOnStartQuiz} />);

    const dropdown = screen.getByLabelText(/Filter by Topic/i) as HTMLSelectElement;

    // Initially should show "All questions" in mode description
    const allQuestions = screen.getAllByText(/All questions/i);
    expect(allQuestions.length).toBeGreaterThan(0);

    // Select a specific topic
    const options = Array.from(dropdown.options).filter(opt => opt.value !== 'all');
    if (options.length > 0) {
      const testTopic = options[0].value;
      fireEvent.change(dropdown, { target: { value: testTopic } });

      // Should update to show "All questions from [topic]"
      expect(screen.getByText(new RegExp(`All questions from ${testTopic}`, 'i'))).toBeInTheDocument();
    }
  });
});
