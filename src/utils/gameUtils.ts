import { Company, Continent, Country, FeedbackResult, Language, LetterTile } from '../types';
import { COUNTRIES } from '../data/countries';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת';
const FLAGS_PER_GAME = 10;
const MAX_LIVES = 3;
const EXTRA_LETTERS = 5;

/** Fisher-Yates shuffle */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random countries, optionally filtered by continent, sorted easiest→hardest by name length */
export function selectRandomCountries(continent: Continent | 'all' = 'all', count = FLAGS_PER_GAME, lang: Language = 'en', exclude: Set<string> = new Set()): Country[] {
  const pool = continent === 'all' ? COUNTRIES : COUNTRIES.filter(c => c.continent === continent);
  const filtered = pool.filter(c => !exclude.has(c.code));
  const source = filtered.length > 0 ? filtered : pool; // reset if all done
  const selected = shuffle(source).slice(0, Math.min(count, source.length));
  return selected.sort((a, b) =>
    getLettersOnly(getCountryName(a, lang), lang).length -
    getLettersOnly(getCountryName(b, lang), lang).length
  );
}

/** Return the country name in the given language */
export function getCountryName(country: Country, lang: Language): string {
  return lang === 'he' ? country.nameHe : country.name;
}

/** Return the display name for either a Country or a Company */
export function getItemName(item: Country | Company, lang: Language): string {
  if ('domain' in item) return lang === 'he' ? (item as Company).nameHe : item.name;
  return getCountryName(item as Country, lang);
}

/** Extract only letters from a country name (A-Z for English, Hebrew letters for Hebrew) */
export function getLettersOnly(name: string, lang: Language = 'en'): string[] {
  if (lang === 'he') {
    return name.split('').filter(c => /[\u05D0-\u05EA]/.test(c));
  }
  return name.toUpperCase().split('').filter(c => /[A-Z]/.test(c));
}

/**
 * Build the letter pool for a country:
 * - One tile per letter occurrence in the name (correct tiles)
 * - Plus EXTRA_LETTERS random decoy letters not in the name
 * - All shuffled
 */
export function buildLetterPool(name: string, lang: Language = 'en'): LetterTile[] {
  const letters = getLettersOnly(name, lang);
  const nameLetterSet = new Set(letters);

  const correctTiles: LetterTile[] = letters.map((letter, i) => ({
    id: `correct-${i}-${letter}`,
    letter,
    isCorrect: true,
    status: 'available',
    placedFrom: null,
  }));

  const alphabet = lang === 'he' ? HEBREW_ALPHABET : ALPHABET;
  const decoyLetters = shuffle(alphabet.split('').filter(c => !nameLetterSet.has(c)));
  const decoyTiles: LetterTile[] = decoyLetters.slice(0, EXTRA_LETTERS).map((letter, i) => ({
    id: `decoy-${i}-${letter}`,
    letter,
    isCorrect: false,
    status: 'available',
    placedFrom: null,
  }));

  return shuffle([...correctTiles, ...decoyTiles]);
}

/**
 * Wordle-style submission check.
 * Compares placed letters against the correct letters and returns per-slot feedback.
 * - 'correct'   → right letter, right position (green)
 * - 'wrong-pos' → letter exists in word but wrong position (yellow)
 * - 'wrong'     → letter not in the word at all (red)
 */
export function checkSubmission(placed: string[], correct: string[]): FeedbackResult[] {
  const result: FeedbackResult[] = new Array(correct.length).fill('wrong');
  const remaining = [...correct];

  // Pass 1: exact matches
  for (let i = 0; i < correct.length; i++) {
    if (placed[i] === correct[i]) {
      result[i] = 'correct';
      remaining[i] = ''; // consumed
    }
  }

  // Pass 2: wrong-position matches
  for (let i = 0; i < correct.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = remaining.findIndex(c => c === placed[i] && c !== '');
    if (idx >= 0) {
      result[i] = 'wrong-pos';
      remaining[idx] = '';
    }
  }

  return result;
}

/** Points earned for a correct round = lives remaining (max 3) */
export function calculateRoundScore(livesRemaining: number): number {
  return Math.max(0, livesRemaining);
}

export { MAX_LIVES, FLAGS_PER_GAME };
export type { Company };
