export type RPSChoice = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock' | 'fire' | 'water';

export const classicChoices: RPSChoice[] = ['rock', 'paper', 'scissors'];
export const extendedChoices: RPSChoice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock', 'fire', 'water'];

// Extended rules: key beats each value
const rules: Record<RPSChoice, RPSChoice[]> = {
  rock: ['scissors', 'lizard', 'fire'],
  paper: ['rock', 'spock', 'water'],
  scissors: ['paper', 'lizard'],
  lizard: ['spock', 'paper', 'water'],
  spock: ['scissors', 'rock', 'fire'],
  fire: ['paper', 'scissors', 'lizard'],
  water: ['rock', 'fire', 'spock'],
};

export const choiceLabels: Record<RPSChoice, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
  lizard: 'Lizard',
  spock: 'Spock',
  fire: 'Fire',
  water: 'Water',
};

export const choiceEmojis: Record<RPSChoice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
  lizard: '🦎',
  spock: '🖖',
  fire: '🔥',
  water: '💧',
};

export function rpsResult(player: RPSChoice, computer: RPSChoice): 'win' | 'lose' | 'draw' {
  if (player === computer) return 'draw';
  return rules[player].includes(computer) ? 'win' : 'lose';
}

export function randomChoice(choices: RPSChoice[]): RPSChoice {
  return choices[Math.floor(Math.random() * choices.length)];
}
