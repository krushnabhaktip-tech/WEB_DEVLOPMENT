import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { playSfx } from '../../lib/sound';
import { ArrowLeft, RotateCcw, Eye, Clock } from 'lucide-react';

type Mode = 'classic' | 'advanced';
type GridSize = 4 | 5;

interface CardData {
  id: number;
  emoji: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

const emojis = ['🎮', '🚀', '🌟', '🎨', '🎵', '🍕', '🌈', '⚡', '🔥', '🎯', '🎲', '🦊', '🌙', '💎', '🎈', '🦄', '🐲', '🌸', '🎸', '🏆', '🍿', '🧁', '🍨', '🪐', '🤖', '👾', '🍀', '🐳', '🦉', '🦋'];

function createDeck(size: GridSize): CardData[] {
  const total = size * size;
  const pairs = Math.floor(total / 2);
  const hasExtra = total % 2 === 1;
  const selected = [...emojis].sort(() => Math.random() - 0.5).slice(0, pairs);
  const deck: CardData[] = [];
  selected.forEach((emoji, i) => {
    deck.push({ id: i * 2, emoji, pairId: i, flipped: false, matched: false });
    deck.push({ id: i * 2 + 1, emoji, pairId: i, flipped: false, matched: false });
  });
  if (hasExtra) {
    // Add a bonus wild card that auto-matches when flipped
    deck.push({ id: 999, emoji: '🎁', pairId: -1, flipped: false, matched: false });
  }
  return deck.sort(() => Math.random() - 0.5);
}

export default function Memory({ onBack }: { onBack: () => void }) {
  const { addCoins, recordGameResult, unlockAchievement, recordDailyTaskProgress } = useAuth();
  const [mode, setMode] = useState<Mode>('classic');
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showPreviewOption, setShowPreviewOption] = useState(false);
  const [shuffleCountdown, setShuffleCountdown] = useState(10);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const lockRef = useRef(false);

  const totalPairs = Math.floor((gridSize * gridSize) / 2) + (gridSize * gridSize) % 2;

  const initGame = useCallback(() => {
    const deck = createDeck(gridSize);
    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMistakes(0);
    setGameOver(false);
    setGameStarted(true);
    setMatchedPairs(0);
    setHasShuffled(false);
    setShuffleCountdown(10);
    if (showPreviewOption) {
      setPreview(true);
      setPreviewTime(3);
    } else {
      setPreview(false);
    }
  }, [gridSize, showPreviewOption]);

  // Preview countdown
  useEffect(() => {
    if (!preview || previewTime <= 0) return;
    const t = setTimeout(() => {
      setPreviewTime((p) => p - 1);
      playSfx('tick');
      if (previewTime <= 1) setPreview(false);
    }, 1000);
    return () => clearTimeout(t);
  }, [preview, previewTime]);

  // Advanced mode shuffle countdown
  useEffect(() => {
    if (mode !== 'advanced' || !gameStarted || gameOver || hasShuffled) return;
    if (preview) return;
    if (shuffleCountdown <= 0) {
      // Shuffle unmatched cards
      setCards((prev) => {
        const matched = prev.filter((c) => c.matched);
        const unmatched = prev.filter((c) => !c.matched);
        const shuffled = [...unmatched].sort(() => Math.random() - 0.5);
        playSfx('shuffle');
        return [...matched, ...shuffled];
      });
      setHasShuffled(true);
      return;
    }
    const t = setTimeout(() => setShuffleCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, gameStarted, gameOver, hasShuffled, shuffleCountdown, preview]);

  const handleGameEnd = useCallback(async (won: boolean) => {
    setGameOver(true);
    if (won) {
      playSfx('win');
      const reward = mode === 'advanced' ? 25 : gridSize === 5 ? 20 : 15;
      await addCoins(reward);
      await unlockAchievement('mem_first_win');
      if (gridSize === 5) await unlockAchievement('mem_5x5_win');
      if (mode === 'advanced') await unlockAchievement('mem_advanced_win');
      if (mistakes === 0) await unlockAchievement('mem_perfect');
    }
    await recordGameResult('memory', won ? 'win' : 'lose');
    await recordDailyTaskProgress('memory', won);
  }, [mode, gridSize, mistakes, addCoins, unlockAchievement, recordGameResult, recordDailyTaskProgress]);

  // Check for match when two cards flipped
  useEffect(() => {
    if (flippedIndices.length !== 2) return;
    lockRef.current = true;
    const [a, b] = flippedIndices;
    const cardA = cards[a];
    const cardB = cards[b];

    if (cardA.pairId === cardB.pairId) {
      // Match!
      setTimeout(() => {
        setCards((prev) => prev.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c
        ));
        setFlippedIndices([]);
        setMatchedPairs((p) => p + 1);
        playSfx('match');
        lockRef.current = false;
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        setCards((prev) => prev.map((c, i) =>
          i === a || i === b ? { ...c, flipped: false } : c
        ));
        setFlippedIndices([]);
        setMistakes((m) => m + 1);
        playSfx('nomatch');
        lockRef.current = false;
      }, 900);
    }
  }, [flippedIndices, cards]);

  // Check win
  useEffect(() => {
    if (gameStarted && !gameOver && matchedPairs >= totalPairs) {
      handleGameEnd(true);
    }
  }, [matchedPairs, totalPairs, gameStarted, gameOver, handleGameEnd]);

  const handleCardClick = (index: number) => {
    if (lockRef.current || preview || gameOver) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;
    playSfx('flip');

    // Wild card (bonus) auto-matches
    if (card.pairId === -1) {
      setCards((prev) => prev.map((c, i) => i === index ? { ...c, flipped: true, matched: true } : c));
      setMatchedPairs((p) => p + 1);
      playSfx('match');
      return;
    }

    setCards((prev) => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
    setFlippedIndices((prev) => [...prev, index]);
    if (flippedIndices.length === 1) setMoves((m) => m + 1);
  };

  const modes = [
    { id: 'classic' as Mode, label: 'Classic', desc: 'Standard memory' },
    { id: 'advanced' as Mode, label: 'Advanced', desc: 'Cards shuffle after 10s' },
  ];

  const gridCols = gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5';
  const cardSize = gridSize === 4 ? 'sm:text-3xl text-2xl' : 'sm:text-2xl text-xl';

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => { playSfx('click'); onBack(); }} className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">🧠 Memory Cards</h1>
      </div>

      {!gameStarted ? (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 mb-3">Game Mode</h2>
            <div className="flex gap-2 flex-wrap">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); playSfx('click'); }}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all border ${
                    mode === m.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm">{m.label}</div>
                  <div className="text-xs opacity-70">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-400 mb-3">Grid Size</h2>
            <div className="flex gap-2">
              {([4, 5] as GridSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setGridSize(s); playSfx('click'); }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
                    gridSize === s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
          </div>

          {mode === 'classic' && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPreviewOption}
                  onChange={(e) => setShowPreviewOption(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" /> Show cards for 3 seconds before hiding
                </span>
              </label>
            </div>
          )}

          <button
            onClick={() => { initGame(); playSfx('select'); }}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm">
              Moves: <span className="font-bold text-sky-400">{moves}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm">
              Pairs: <span className="font-bold text-emerald-400">{matchedPairs}/{totalPairs}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-sm">
              Mistakes: <span className="font-bold text-rose-400">{mistakes}</span>
            </div>
            {mode === 'advanced' && !hasShuffled && !preview && (
              <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Shuffle in: <span className="font-bold text-amber-400">{shuffleCountdown}s</span>
              </div>
            )}
          </div>

          {preview && (
            <div className="text-center text-amber-400 font-semibold animate-pulse">
              Memorize the cards! {previewTime}s...
            </div>
          )}

          {gameOver && (
            <div className="text-center text-2xl font-bold text-emerald-400 pop-in">
              🎉 You matched all pairs in {moves} moves!
            </div>
          )}

          {/* Card grid */}
          <div className={`grid ${gridCols} gap-2 max-w-md mx-auto`}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`flip-card aspect-square cursor-pointer ${cardSize}`}
              >
                <div className={`flip-card-inner relative w-full h-full ${card.flipped || card.matched || preview ? 'flipped' : ''}`}>
                  <div className="flip-card-front absolute inset-0 rounded-xl bg-slate-800/60 border-2 border-slate-700/50 flex items-center justify-center hover:border-emerald-500/30 transition-colors">
                    <span className="text-2xl opacity-30">?</span>
                  </div>
                  <div className={`flip-card-back absolute inset-0 rounded-xl border-2 flex items-center justify-center ${
                    card.matched ? 'border-emerald-500/50 bg-emerald-500/15' : 'border-slate-600 bg-slate-700/50'
                  }`}>
                    <span>{card.emoji}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => { initGame(); playSfx('click'); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> New Game
            </button>
            <button
              onClick={() => { setGameStarted(false); playSfx('click'); }}
              className="px-5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 font-medium transition-colors"
            >
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}
