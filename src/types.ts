export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
  difficulty: string;
}

export interface QuizData {
  quiz: Question[];
}

export interface UserAnswer {
  questionId: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  isCorrect: boolean;
}

export type QuizMode = 'all' | 'random';

export type Screen = 'welcome' | 'quiz' | 'results';
