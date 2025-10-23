export interface Prng {
  next: () => number;
  nextRange: (min: number, max: number) => number;
  nextInt: (min: number, max: number) => number;
  nextBoolean: () => boolean;
  reset: () => void;
}

const MAX_UINT32 = 0xffffffff;

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / (MAX_UINT32 + 1);
  };
}

function hashSeed(input: string | number): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input >>> 0;
  }

  const str = String(input);
  let hash = 2166136261 ^ str.length;

  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createPrng(seed: string | number): Prng {
  const initialSeed = hashSeed(seed);
  let generator = mulberry32(initialSeed);

  return {
    next: () => generator(),
    nextRange: (min: number, max: number) => {
      if (min > max) {
        throw new Error('min must not be greater than max');
      }
      const span = max - min;
      return min + generator() * span;
    },
    nextInt: (min: number, max: number) => {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      if (low > high) {
        throw new Error('min must not be greater than max');
      }
      return Math.floor(low + generator() * (high - low + 1));
    },
    nextBoolean: () => generator() >= 0.5,
    reset: () => {
      generator = mulberry32(initialSeed);
    },
  };
}
