/** Represents a single country with its flag code */
export type Continent = 'africa' | 'americas' | 'asia' | 'europe';
export type Language = 'en' | 'he';

export interface Country {
  name: string;
  nameHe: string;
  /** ISO 3166-1 alpha-2 code in lowercase (used for flagcdn.com URL) */
  code: string;
  continent: Continent;
}

/** Status of a tile in the letter pool */
export type TileStatus =
  | 'available'    // in pool, clickable
  | 'placed'       // currently occupying a slot (hidden from pool)
  | 'locked'       // permanently consumed — correct position confirmed
  | 'hint-yellow'  // wrong position: returned to pool, still clickable
  | 'hint-red';    // not in word: returned to pool, not clickable

/** A single tile in the letter pool */
export interface LetterTile {
  id: string;
  letter: string;       // uppercase A-Z
  isCorrect: boolean;   // is this letter part of the correct answer?
  status: TileStatus;
  /** The status before the tile was placed (used to restore on backspace) */
  placedFrom: TileStatus | null;
}

/** Per-slot feedback after a submission attempt */
export type FeedbackResult = 'correct' | 'wrong-pos' | 'wrong';

/** Whether a slot is unlocked (empty/pending) or locked in place (green) */
export type SlotStatus = 'empty' | 'correct';

export type GamePhase = 'start' | 'game' | 'roundOver' | 'results';
export type RoundResult = 'correct' | 'revealed' | 'failed' | 'skipped' | null;

export interface GameState {
  phase: GamePhase;
  countries: Array<Country | Company>;
  currentIndex: number;
  selectedContinent: Continent | 'all';
  selectedCompanyCategory: CompanyCategory | 'all';
  language: Language;
  mode: GameMode;

  /** Letter placed in each slot (null = empty) */
  slotValues: (string | null)[];
  /** Which tile ID occupies each slot (null = empty) */
  slotTileIds: (string | null)[];
  /** 'correct' = locked green; 'empty' = still needs guessing */
  slotStatus: SlotStatus[];

  letterPool: LetterTile[];
  lives: number;
  score: number;
  /** Total score carried in from previous games (used for hint/reveal affordability) */
  bankScore: number;
  roundResult: RoundResult;

  /** True while the submission feedback overlay is showing */
  feedbackVisible: boolean;
  /** Per-slot color feedback from the last submission */
  feedbackResult: FeedbackResult[];
  /** Country codes correctly guessed in the current game session */
  completedThisGame: string[];
  /** Completed country codes from all previous games (for filtering) */
  completedFlagsBefore: string[];
  /** Completed company domains from all previous games (for filtering) */
  completedCompaniesBefore: string[];
  /** Indices of rounds that were skipped (eligible for go-back) */
  skippedIndices: number[];
  sessionGreens: number;
  sessionYellows: number;
  sessionReds: number;
  sessionHints: number;
  sessionReveals: number;
  sessionSkips: number;
  gameStartTime: number;
  /** Saved round state for each skipped index, to restore on go-back */
  savedRounds: Record<number, SavedRoundState>;
  /** When going back to a skipped flag, the index to return to after completing it */
  goBackReturnIndex: number | null;
}

/** Snapshot of a round's state at the moment it was skipped */
export interface SavedRoundState {
  slotValues: (string | null)[];
  slotTileIds: (string | null)[];
  slotStatus: SlotStatus[];
  letterPool: LetterTile[];
  lives: number;
  feedbackResult: FeedbackResult[];
}

export type CompanyCategory = 'tech' | 'auto' | 'retail' | 'food' | 'fashion' | 'finance' | 'media' | 'energy' | 'pharma' | 'transport';

export type GameMode = 'countries' | 'companies';

export interface Company {
  name: string;
  nameHe: string;
  domain: string;       // used for logo: https://logo.clearbit.com/{domain}
  category: CompanyCategory;
}
