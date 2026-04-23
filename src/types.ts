export interface Question {
  id: string;
  type: 'comparative' | 'superlative';
  baseWord: string;
  sentence: string; // "This car is ___ than that one."
  options: string[];
  correctAnswer: string;
  explanation: string; // PT-BR explanation
}

export interface GameState {
  p1Score: number;
  p2Score: number;
  level: number;
  health: number;
  enemyHealth: number;
  streak: number;
  p2Errors: number;
  currentQuestionIndex: number; // This will now serve as an index to the shuffled array
  shuffledQuestionIndices: number[];
  status: 'start' | 'playing' | 'gameover' | 'victory' | 'onboarding' | 'lesson';
  turnPhase: 'intro' | 'question' | 'result';
  activePlayer: 'p1' | 'p2';
  questionsPlayed: number;
  isTiebreaker: boolean;
  showTiebreakerAnnounce: boolean;
  winner: 'p1' | 'p2' | 'tie' | null;
}

export type Language = 'en' | 'pt';

export interface UIStrings {
  title: string;
  startBtn: string;
  howToPlay: string;
  health: string;
  score: string;
  streak: string;
  level: string;
  correct: string;
  wrong: string;
  next: string;
  victoryTitle: string;
  gameoverTitle: string;
  playAgain: string;
  onboardingText: string;
}
