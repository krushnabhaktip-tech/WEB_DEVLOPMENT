// Number Guessing Game hint generators
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export function generateHints(target: number, range: number): string[] {
  const hints: string[] = [];
  hints.push(target % 2 === 0 ? 'The number is even' : 'The number is odd');
  hints.push(
    target % 3 === 0 ? 'Divisible by 3' :
    target % 5 === 0 ? 'Divisible by 5' :
    target % 7 === 0 ? 'Divisible by 7' :
    'Not divisible by 3, 5, or 7'
  );
  if (isPrime(target)) {
    hints.push('The number is prime');
  } else {
    hints.push('The number is not prime');
  }
  const sqrt = Math.sqrt(target);
  hints.push(
    Number.isInteger(sqrt) ? 'The number is a perfect square' : 'Not a perfect square'
  );
  const lower = Math.floor(range / 3);
  const upper = Math.floor((range * 2) / 3);
  if (target <= lower) hints.push(`The number is in the lower third (1–${lower})`);
  else if (target >= upper) hints.push(`The number is in the upper third (${upper}–${range})`);
  else hints.push(`The number is in the middle third (${lower + 1}–${upper - 1})`);
  hints.push(target % 10 === 0 ? 'Ends in 0' : `Last digit is ${target % 10}`);
  return hints;
}

export const hintCost = 5;

export const rangeRewards: Record<number, number> = {
  50: 20,
  100: 30,
  500: 50,
  1000: 80,
};
