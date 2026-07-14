export type Cell = 'X' | 'O' | null;
export type Board = Cell[];

export const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board: Board): { winner: Cell; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((c) => c !== null);
}

// Minimax AI for the computer opponent. Returns best move index.
export function bestMove(board: Board, aiPlayer: 'X' | 'O'): number {
  const human: 'X' | 'O' = aiPlayer === 'X' ? 'O' : 'X';

  function minimax(b: Board, depth: number, isMax: boolean): number {
    const result = checkWinner(b);
    if (result?.winner === aiPlayer) return 10 - depth;
    if (result?.winner === human) return depth - 10;
    if (isBoardFull(b)) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = aiPlayer;
          best = Math.max(best, minimax(b, depth + 1, false));
          b[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = human;
          best = Math.min(best, minimax(b, depth + 1, true));
          b[i] = null;
        }
      }
      return best;
    }
  }

  let best = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > best) {
        best = score;
        move = i;
      }
    }
  }
  return move;
}

// For Ultimate Tic Tac Toe: check which sub-boards are won
export function checkUltimateWinner(subWinners: Cell[]): { winner: Cell; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (subWinners[a] && subWinners[a] === subWinners[b] && subWinners[a] === subWinners[c]) {
      return { winner: subWinners[a], line };
    }
  }
  return null;
}

// Get valid sub-board indices for Ultimate TTT
export function getValidSubBoards(boards: Board[], subWinners: Cell[], _lastMoveSubBoard: number, lastMoveCell: number): number[] {
  const targetSub = lastMoveCell;
  const valid = (i: number) => subWinners[i] === null && !isBoardFull(boards[i]);
  if (subWinners[targetSub] !== null) {
    return boards.map((_, i) => i).filter(valid);
  }
  if (isBoardFull(boards[targetSub])) {
    return boards.map((_, i) => i).filter(valid);
  }
  return [targetSub];
}
