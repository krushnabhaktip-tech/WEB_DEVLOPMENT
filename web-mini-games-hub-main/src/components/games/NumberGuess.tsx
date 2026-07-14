import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { playSfx } from '../../lib/sound';
import { generateHints, hintCost, rangeRewards } from '../../lib/numberGuessLogic';
import { ArrowLeft, RotateCcw, Lightbulb, Coins } from 'lucide-react';

const ranges = [50, 100, 500, 1000];

export default function NumberGuess({ onBack }: { onBack: () => void }) {
  const { profile, addCoins, recordGameResult, unlockAchievement, recordDailyTaskProgress } = useAuth();
  const [range, setRange] = useState(100);
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'high' | 'low' | 'correct' | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [allHints, setAllHints] = useState<string[]>([]);
  const [guessHistory, setGuessHistory] = useState<{ value: number; type: string }[]>([]);

  const startGame = (selectedRange: number) => {
    const newTarget = Math.floor(Math.random() * selectedRange) + 1;
    setRange(selectedRange);
    setTarget(newTarget);
    setAttempts(0);
    setHintsUsed(0);
    setGuess('');
    setFeedback('');
    setFeedbackType(null);
    setGameActive(true);
    setGameOver(false);
    setRevealedHints([]);
    setAllHints(generateHints(newTarget, selectedRange));
    setGuessHistory([]);
    playSfx('select');
  };

  const handleGuess = useCallback(async () => {
    const value = parseInt(guess, 10);
    if (isNaN(value) || value < 1 || value > range) {
      playSfx('error');
      setFeedback(`Please enter a number between 1 and ${range}`);
      setFeedbackType(null);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    playSfx('tick');

    if (value === target) {
      setFeedback(`🎉 Correct! The number was ${target}!`);
      setFeedbackType('correct');
      setGameOver(true);
      setGameActive(false);
      playSfx('win');
      const reward = rangeRewards[range];
      await addCoins(reward);
      await unlockAchievement('num_first_win');
      if (hintsUsed === 0) await unlockAchievement('num_no_hints');
      if (range === 1000) await unlockAchievement('num_range_1000');
      await recordGameResult('numberguess', 'win', newAttempts);
      await recordDailyTaskProgress('numberguess', true);
      setGuessHistory((prev) => [...prev, { value, type: 'correct' }]);
    } else if (value < target) {
      setFeedback(`${value} is too low! Try higher.`);
      setFeedbackType('low');
      playSfx('nomatch');
      setGuessHistory((prev) => [...prev, { value, type: 'low' }]);
    } else {
      setFeedback(`${value} is too high! Try lower.`);
      setFeedbackType('high');
      playSfx('nomatch');
      setGuessHistory((prev) => [...prev, { value, type: 'high' }]);
    }
    setGuess('');
  }, [guess, target, range, attempts, hintsUsed, addCoins, unlockAchievement, recordGameResult, recordDailyTaskProgress]);

  const buyHint = async () => {
    if (!gameActive || revealedHints.length >= allHints.length) return;
    if (profile && profile.coins < hintCost) {
      playSfx('error');
      setFeedback('Not enough coins for a hint!');
      return;
    }
    await addCoins(-hintCost);
    playSfx('coin');
    setRevealedHints((prev) => [...prev, allHints[prev.length]]);
    setHintsUsed((h) => h + 1);
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => { playSfx('click'); onBack(); }} className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">🔢 Number Guessing</h1>
      </div>

      {!gameActive && !gameOver ? (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 mb-3">Select Range</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => startGame(r)}
                  className="px-4 py-4 rounded-xl font-medium transition-all border bg-slate-800/60 border-slate-700 hover:border-rose-500/50 hover:bg-slate-700/50 text-center"
                >
                  <div className="text-lg font-bold">1–{r}</div>
                  <div className="text-xs text-amber-400 mt-1">Win: +{rangeRewards[r]} 🪙</div>
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-slate-400 bg-slate-800/30 rounded-xl p-4">
            <p className="font-semibold text-slate-300 mb-1">How to play:</p>
            <p>Guess the secret number within the selected range. Use coins to buy hints (even/odd, prime, divisibility, etc.). Fewer attempts = more skill!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm">
              Range: <span className="font-bold text-sky-400">1–{range}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm">
              Attempts: <span className="font-bold text-amber-400">{attempts}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-400">{profile?.coins || 0}</span>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`text-center text-xl font-bold rounded-xl py-3 ${
              feedbackType === 'correct'
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 pop-in'
                : feedbackType === 'high'
                ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                : feedbackType === 'low'
                ? 'text-sky-400 bg-sky-500/10 border border-sky-500/30'
                : 'text-amber-400 bg-amber-500/10 border border-amber-500/30 shake'
            }`}>
              {feedback}
            </div>
          )}

          {/* Guess input */}
          {gameActive && (
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder={`1–${range}`}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 outline-none text-center text-lg"
              />
              <button
                onClick={handleGuess}
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold transition-colors"
              >
                Guess
              </button>
            </div>
          )}

          {/* Hints */}
          {gameActive && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" /> Hints
                </h3>
                <button
                  onClick={buyHint}
                  disabled={revealedHints.length >= allHints.length}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                >
                  Buy Hint ({hintCost} 🪙)
                </button>
              </div>
              {revealedHints.length === 0 ? (
                <p className="text-sm text-slate-500">No hints used yet. Spend {hintCost} coins to reveal a clue about the number.</p>
              ) : (
                <ul className="space-y-1.5">
                  {revealedHints.map((h, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 pop-in">
                      <span className="text-amber-400">•</span>
                      <span className="text-slate-300">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Guess history */}
          {guessHistory.length > 0 && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <h3 className="font-semibold text-sm mb-2">Guess History</h3>
              <div className="flex flex-wrap gap-2">
                {guessHistory.map((g, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                      g.type === 'correct' ? 'bg-emerald-500/20 text-emerald-400' :
                      g.type === 'low' ? 'bg-sky-500/15 text-sky-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {g.value} {g.type === 'low' ? '↑' : g.type === 'high' ? '↓' : '✓'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => startGame(range)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> New Game
            </button>
            <button
              onClick={() => { setGameActive(false); setGameOver(false); playSfx('click'); }}
              className="px-5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 font-medium transition-colors"
            >
              Change Range
            </button>
          </div>
        </>
      )}
    </div>
  );
}
