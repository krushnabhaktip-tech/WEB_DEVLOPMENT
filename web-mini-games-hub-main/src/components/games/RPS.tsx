import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { playSfx } from '../../lib/sound';
import { classicChoices, extendedChoices, rpsResult, randomChoice, choiceLabels, choiceEmojis } from '../../lib/rpsLogic';
import type { RPSChoice } from '../../lib/rpsLogic';
import { ArrowLeft, RotateCcw } from 'lucide-react';

type Mode = 'classic' | 'extended';

export default function RPS({ onBack }: { onBack: () => void }) {
  const { addCoins, recordGameResult, unlockAchievement, recordDailyTaskProgress } = useAuth();
  const [mode, setMode] = useState<Mode>('classic');
  const [playerChoice, setPlayerChoice] = useState<RPSChoice | null>(null);
  const [computerChoice, setComputerChoice] = useState<RPSChoice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [reveal, setReveal] = useState(false);

  const choices = mode === 'classic' ? classicChoices : extendedChoices;

  const handleChoice = async (choice: RPSChoice) => {
    playSfx('select');
    setPlayerChoice(choice);
    setReveal(true);
    setComputerChoice(null);
    setResult(null);

    // Dramatic delay
    setTimeout(() => {
      const comp = randomChoice(choices);
      const res = rpsResult(choice, comp);
      setComputerChoice(comp);
      setResult(res);
      playSfx(res === 'win' ? 'win' : res === 'lose' ? 'lose' : 'draw');

      setScore((prev) => ({
        wins: prev.wins + (res === 'win' ? 1 : 0),
        losses: prev.losses + (res === 'lose' ? 1 : 0),
        draws: prev.draws + (res === 'draw' ? 1 : 0),
      }));

      if (res === 'win') {
        addCoins(5);
        unlockAchievement('rps_first_win');
        if (mode === 'extended') unlockAchievement('rps_extended_win');
      }
      recordGameResult('rps', res);
      recordDailyTaskProgress('rps', res === 'win');
    }, 800);
  };

  const reset = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setReveal(false);
    setScore({ wins: 0, losses: 0, draws: 0 });
    playSfx('click');
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => { playSfx('click'); onBack(); }} className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">✊ Rock Paper Scissors</h1>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 justify-center">
        {(['classic', 'extended'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
              mode === m ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {m === 'classic' ? 'Classic (3)' : 'Extended (7)'}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="flex justify-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm">
          Wins: <span className="font-bold text-emerald-400">{score.wins}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-sm">
          Losses: <span className="font-bold text-rose-400">{score.losses}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm">
          Draws: <span className="font-bold text-slate-300">{score.draws}</span>
        </div>
      </div>

      {/* Battle area */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8">
        <div className="flex items-center justify-around mb-8">
          {/* Player */}
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">You</div>
            <div className="text-6xl sm:text-7xl h-20 flex items-center justify-center">
              {playerChoice ? (
                <span className="pop-in">{choiceEmojis[playerChoice]}</span>
              ) : (
                <span className="opacity-20">?</span>
              )}
            </div>
            <div className="text-sm text-slate-300 mt-1">
              {playerChoice ? choiceLabels[playerChoice] : ''}
            </div>
          </div>

          {/* VS */}
          <div className="text-2xl font-bold text-slate-600">VS</div>

          {/* Computer */}
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">Computer</div>
            <div className="text-6xl sm:text-7xl h-20 flex items-center justify-center">
              {computerChoice ? (
                <span className="pop-in">{choiceEmojis[computerChoice]}</span>
              ) : reveal ? (
                <span className="animate-bounce">🎲</span>
              ) : (
                <span className="opacity-20">?</span>
              )}
            </div>
            <div className="text-sm text-slate-300 mt-1">
              {computerChoice ? choiceLabels[computerChoice] : ''}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`text-center text-2xl font-bold mb-6 pop-in ${
            result === 'win' ? 'text-emerald-400' : result === 'lose' ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😢 You Lose' : '🤝 Draw!'}
          </div>
        )}

        {/* Choices */}
        <div className="flex flex-wrap gap-2 justify-center">
          {choices.map((c: RPSChoice) => (
            <button
              key={c}
              onClick={() => handleChoice(c)}
              disabled={reveal}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all ${
                playerChoice === c
                  ? 'border-amber-500 bg-amber-500/15'
                  : 'border-slate-700 bg-slate-800/50 hover:border-amber-500/50 hover:bg-slate-700/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-3xl">{choiceEmojis[c]}</span>
              <span className="text-xs text-slate-400">{choiceLabels[c]}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === 'extended' && (
        <div className="text-center text-sm text-slate-500">
          Extended rules: Rock beats Scissors, Lizard, Fire · Paper beats Rock, Spock, Water · Scissors beats Paper, Lizard · Lizard beats Spock, Paper, Water · Spock beats Scissors, Rock, Fire · Fire beats Paper, Scissors, Lizard · Water beats Rock, Fire, Spock
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset Score
        </button>
      </div>
    </div>
  );
}
