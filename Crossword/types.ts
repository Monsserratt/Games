
export interface Clue {
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  number: number;
}

export interface PuzzleData {
  gridSize: number;
  clues: Clue[];
}

export type UserAnswers = { [key: string]: string };
export type CheckedAnswers = { [key: string]: 'correct' | 'incorrect' };
