import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { playSfx } from '../../lib/sound';
import type { Cell, Board } from '../../lib/tictactoeLogic';
import { checkWinner, isBoardFull, bestMove, checkUltimateWinner } from '../../lib/tictactoeLogic';
import { ArrowLeft, RotateCcw } from 'lucide-react';

type Mode = 'classic' | 'disappearing' | 'ultimate';

export default function TicTacToe({ onBack }: { onBack: () => void }) {
  const { recordGameResult, unlockAchievement, recordDailyTaskProgress, addCoins } = useAuth();
  const [mode, setMode] = useState<Mode>('classic');
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [winLine, setWinLine] = useState<number[]>([]);
  const [moveHistory, setMoveHistory] = useState<{ index: number; player: Cell }[]>([]);

  // Ultimate state
  const [boards, setBoards] = useState<Board[]>(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [subWinners, setSubWinners] = useState<Cell[]>(Array(9).fill(null));
  const [activeSubBoard, setActiveSubBoard] = useState<number>(-1); // -1 = any
  const [ultimateWinLine, setUltimateWinLine] = useState<number[]>([]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setBoards(Array(9).fill(null).map(() => Array(9).fill(null)));
    setSubWinners(Array(9).fill(null));
    setActiveSubBoard(-1);
    setGameOver(false);
    setResult(null);
    setWinLine([]);
    setUltimateWinLine([]);
    setMoveHistory([]);
    setIsPlayerTurn(true);
  }, []);

  const handleGameEnd = useCallback(async (res: 'win' | 'lose' | 'draw') => {
    setGameOver(true);
    setResult(res);
    if (res === 'win') {
      playSfx('win');
      await addCoins(15);
      await unlockAchievement('ttt_first_win');
      if (mode === 'disappearing') await unlockAchievement('ttt_disappear_win');
      if (mode === 'ultimate') await unlockAchievement('ttt_ultimate_win');
    } else if (res === 'lose') {
      playSfx('lose');
    } else {
      playSfx('draw');
    }
    await recordGameResult('tictactoe', res);
    await recordDailyTaskProgress('tictactoe', res === 'win');
  }, [mode, addCoins, unlockAchievement, recordGameResult, recordDailyTaskProgress]);

  // --- Classic / Disappearing logic ---
  const handleClassicMove = useCallback((index: number) => {
    if (board[index] || gameOver || !isPlayerTurn) return;
    playSfx('select');
    const newBoard = [...board];
    newBoard[index] = 'X';

    // Disappearing mode: remove oldest X move if player has 3+ on board
    let newHistory = [...moveHistory, { index, player: 'X' as Cell }];
    if (mode === 'disappearing') {
      const xMoves = newHistory.filter((m) => m.player === 'X');
      if (xMoves.length > 3) {
        const oldest = xMoves[0];
        newBoard[oldest.index] = null;
        newHistory = newHistory.filter((m) => m !== oldest);
      }
    }

    const win = checkWinner(newBoard);
    if (win) {
      setBoard(newBoard);
      setMoveHistory(newHistory);
      setWinLine(win.line);
      handleGameEnd('win');
      return;
    }
    if (isBoardFull(newBoard)) {
      setBoard(newBoard);
      setMoveHistory(newHistory);
      handleGameEnd('draw');
      return;
    }

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setIsPlayerTurn(false);
  }, [board, gameOver, isPlayerTurn, mode, moveHistory, handleGameEnd]);

  // AI move for classic
  useEffect(() => {
    if (mode === 'ultimate' || isPlayerTurn || gameOver) return;
    const timer = setTimeout(() => {
      const newBoard = [...board];
      const move = bestMove(newBoard, 'O');
      if (move === -1) return;
      newBoard[move] = 'O';
      playSfx('flip');

      let newHistory = [...moveHistory, { index: move, player: 'O' as Cell }];
      if (mode === 'disappearing') {
        const oMoves = newHistory.filter((m) => m.player === 'O');
        if (oMoves.length > 3) {
          const oldest = oMoves[0];
          newBoard[oldest.index] = null;
          newHistory = newHistory.filter((m) => m !== oldest);
        }
      }

      const win = checkWinner(newBoard);
      if (win) {
        setBoard(newBoard);
        setMoveHistory(newHistory);
        setWinLine(win.line);
        handleGameEnd('lose');
        return;
      }
      if (isBoardFull(newBoard)) {
        setBoard(newBoard);
        setMoveHistory(newHistory);
        handleGameEnd('draw');
        return;
      }
      setBoard(newBoard);
      setMoveHistory(newHistory);
      setIsPlayerTurn(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board, mode, moveHistory, handleGameEnd]);

  // --- Ultimate logic ---
  const handleUltimateMove = useCallback((subBoard: number, cell: number) => {
    if (gameOver || !isPlayerTurn) return;
    if (subWinners[subBoard] !== null) return;
    if (activeSubBoard !== -1 && subBoard !== activeSubBoard) return;
    if (boards[subBoard][cell] !== null) return;

    playSfx('select');
    const newBoards = boards.map((b) => [...b]);
    newBoards[subBoard][cell] = 'X';

    // Check sub-board winner
    const newSubWinners = [...subWinners];
    const subWin = checkWinner(newBoards[subBoard]);
    if (subWin) {
      newSubWinners[subBoard] = 'X';
      playSfx('match');
    }

    // Check ultimate winner
    const ultWin = checkUltimateWinner(newSubWinners);
    if (ultWin) {
      setBoards(newBoards);
      setSubWinners(newSubWinners);
      setUltimateWinLine(ultWin.line);
      handleGameEnd('win');
      return;
    }

    // Determine next active sub-board
    const nextActive = newSubWinners[cell] !== null || isBoardFull(newBoards[cell]) ? -1 : cell;
    setBoards(newBoards);
    setSubWinners(newSubWinners);
    setActiveSubBoard(nextActive);
    setIsPlayerTurn(false);
  }, [boards, subWinners, activeSubBoard, gameOver, isPlayerTurn, handleGameEnd]);

  // AI move for ultimate
  useEffect(() => {
    if (mode !== 'ultimate' || isPlayerTurn || gameOver) return;
    const timer = setTimeout(() => {
      const validSubs = activeSubBoard === -1
        ? boards.map((_b, i) => i).filter((i) => subWinners[i] === null && !isBoardFull(boards[i]))
        : [activeSubBoard];
      if (validSubs.length === 0) return;

      // Simple AI: pick a random valid sub-board, then a strategic cell
      const sub = validSubs[Math.floor(Math.random() * validSubs.length)];
      const newBoards = boards.map((b) => [...b]);
      const move = bestMove(newBoards[sub], 'O');
      if (move === -1) return;
      newBoards[sub][move] = 'O';
      playSfx('flip');

      const newSubWinners = [...subWinners];
      const subWin = checkWinner(newBoards[sub]);
      if (subWin) {
        newSubWinners[sub] = 'O';
      }

      const ultWin = checkUltimateWinner(newSubWinners);
      if (ultWin) {
        setBoards(newBoards);
        setSubWinners(newSubWinners);
        setUltimateWinLine(ultWin.line);
        handleGameEnd('lose');
        return;
      }

      const nextActive = newSubWinners[move] !== null || isBoardFull(newBoards[move]) ? -1 : move;
      setBoards(newBoards);
      setSubWinners(newSubWinners);
      setActiveSubBoard(nextActive);
      setIsPlayerTurn(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [mode, isPlayerTurn, gameOver, boards, subWinners, activeSubBoard, handleGameEnd]);

  const handleCellClick = (index: number) => {
    if (mode === 'ultimate') return;
    handleClassicMove(index);
  };

  const handleUltimateCellClick = (subBoard: number, cell: number) => {
    handleUltimateMove(subBoard, cell);
  };

  const modes: { id: Mode; label: string; desc: string }[] = [
    { id: 'classic', label: 'Classic', desc: 'Standard 3x3' },
    { id: 'disappearing', label: 'Disappearing', desc: 'Old moves vanish after 3' },
    { id: 'ultimate', label: 'Ultimate', desc: '9 boards in a grid' },
  ];

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => { playSfx('click'); onBack(); }} className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">⭕ Tic Tac Toe</h1>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); resetGame(); playSfx('click'); }}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all border ${
              mode === m.id ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="text-sm">{m.label}</div>
            <div className="text-xs opacity-70">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="text-center">
        {gameOver ? (
          <div className={`text-2xl font-bold ${result === 'win' ? 'text-emerald-400' : result === 'lose' ? 'text-rose-400' : 'text-amber-400'}`}>
            {result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😢 You Lose' : '🤝 Draw!'}
          </div>
        ) : (
          <div className="text-lg text-slate-400">
            {isPlayerTurn ? "Your turn (X)" : "Computer thinking... (O)"}
            {mode === 'ultimate' && activeSubBoard !== -1 && (
              <span className="ml-2 text-sky-400">→ Board {activeSubBoard + 1}</span>
            )}
          </div>
        )}
      </div>

      {/* Game board */}
      {mode === 'ultimate' ? (
        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
          {boards.map((subBoard, sbIdx) => {
            const subWon = subWinners[sbIdx];
            const isActive = activeSubBoard === -1 ? !subWon && !isBoardFull(subBoard) : sbIdx === activeSubBoard;
            return (
              <div
                key={sbIdx}
                className={`rounded-lg p-1.5 border-2 transition-all ${
                  ultimateWinLine.includes(sbIdx)
                    ? 'border-amber-500 bg-amber-500/10'
                    : isActive && !gameOver
                    ? 'border-sky-500/50 bg-sky-500/5'
                    : 'border-slate-700/50'
                }`}
              >
                {subWon ? (
                  <div className="aspect-square flex items-center justify-center text-4xl font-bold h-full min-h-[80px]">
                    {subWon === 'X' ? '⭕' : '❌'}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {subBoard.map((cell: Cell, cellIdx: number) => (
                      <button
                        key={cellIdx}
                        onClick={() => handleUltimateCellClick(sbIdx, cellIdx)}
                        disabled={!isActive || cell !== null || gameOver || !isPlayerTurn}
                        className={`aspect-square rounded text-xl font-bold flex items-center justify-center transition-all ${
                          cell === 'X' ? 'text-sky-400' : cell === 'O' ? 'text-rose-400' : 'hover:bg-slate-700/50'
                        } ${isActive && !cell && !gameOver ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {cell === 'X' ? '×' : cell === 'O' ? '○' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {board.map((cell: Cell, index: number) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={cell !== null || gameOver || !isPlayerTurn}
              className={`aspect-square rounded-xl border-2 text-4xl font-bold flex items-center justify-center transition-all ${
                winLine.includes(index)
                  ? 'border-amber-500 bg-amber-500/20'
                  : cell
                  ? 'border-slate-700 bg-slate-800/40'
                  : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 hover:border-sky-500/30'
              } ${cell === 'X' ? 'text-sky-400' : cell === 'O' ? 'text-rose-400' : ''}`}
            >
              {cell === 'X' ? '×' : cell === 'O' ? '○' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => { resetGame(); playSfx('click'); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> New Game
        </button>
      </div>

      {mode === 'disappearing' && (
        <div className="text-center text-sm text-slate-500">
          In Disappearing mode, each player can only have 3 marks on the board — the oldest one vanishes!
        </div>
      )}
    </div>
  );
}
