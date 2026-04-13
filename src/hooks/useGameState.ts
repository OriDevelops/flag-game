import { useReducer, useCallback } from 'react';
import { Company, CompanyCategory, Continent, GameMode, GameState, Language, SavedRoundState, SlotStatus, TileStatus } from '../types';
import { Country } from '../types';
import {
  selectRandomCountries,
  getItemName,
  getLettersOnly,
  buildLetterPool,
  checkSubmission,
  calculateRoundScore,
  shuffle,
  MAX_LIVES,
  FLAGS_PER_GAME,
} from '../utils/gameUtils';
import { COMPANIES } from '../data/companies';

const HINT_COST = 5;
const REVEAL_COST = 15;

type Action =
  | { type: 'START_GAME'; continent: Continent | 'all'; language: Language; mode: GameMode; companyCategory?: CompanyCategory | 'all'; completedFlags: string[]; completedCompanies: string[]; totalScore: number }
  | { type: 'SELECT_LETTER'; tileId: string }
  | { type: 'REMOVE_LAST_LETTER' }
  | { type: 'USE_HINT' }
  | { type: 'REVEAL_WORD' }
  | { type: 'SKIP_ROUND' }
  | { type: 'GO_BACK' }
  | { type: 'ACKNOWLEDGE_FEEDBACK' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART_GAME' }
  | { type: 'RETURN_TO_START' };

function createInitialState(): GameState {
  return {
    phase: 'start',
    countries: [],
    currentIndex: 0,
    selectedContinent: 'all',
    selectedCompanyCategory: 'all',
    language: 'en',
    mode: 'countries',
    slotValues: [],
    slotTileIds: [],
    slotStatus: [],
    letterPool: [],
    lives: MAX_LIVES,
    score: 0,
    bankScore: 0,
    roundResult: null,
    feedbackVisible: false,
    feedbackResult: [],
    completedThisGame: [],
    completedFlagsBefore: [],
    completedCompaniesBefore: [],
    skippedIndices: [],
    sessionGreens: 0,
    sessionYellows: 0,
    sessionReds: 0,
    sessionHints: 0,
    sessionReveals: 0,
    sessionSkips: 0,
    gameStartTime: Date.now(),
    savedRounds: {},
    goBackReturnIndex: null,
  };
}

function initRound(state: GameState, index: number): Partial<GameState> {
  const item = state.countries[index];
  const name = getItemName(item, state.language);
  const letters = getLettersOnly(name, state.language);
  return {
    currentIndex: index,
    slotValues: new Array(letters.length).fill(null),
    slotTileIds: new Array(letters.length).fill(null),
    slotStatus: new Array(letters.length).fill('empty') as SlotStatus[],
    letterPool: buildLetterPool(name, state.language),
    lives: MAX_LIVES,
    roundResult: null,
    feedbackVisible: false,
    feedbackResult: [],
  };
}

function pickCompanies(category: CompanyCategory | 'all', exclude: Set<string>): Array<Country | Company> {
  const pool = category !== 'all' ? COMPANIES.filter(c => c.category === category) : COMPANIES;
  const filtered = pool.filter(c => !exclude.has(c.domain));
  const source = filtered.length > 0 ? filtered : pool; // reset if all done
  return shuffle(source).slice(0, Math.min(FLAGS_PER_GAME, source.length));
}

function pickCountries(continent: Continent | 'all', lang: Language, exclude: Set<string>): Array<Country | Company> {
  return selectRandomCountries(continent, FLAGS_PER_GAME, lang, exclude);
}

/** Get the unique identifier for an item (code for Country, domain for Company) */
function getItemId(item: Country | Company): string {
  if ('domain' in item) return (item as Company).domain;
  return (item as Country).code;
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const excludeFlags = new Set(action.completedFlags);
      const excludeCompanies = new Set(action.completedCompanies);
      let items: Array<Country | Company>;
      if (action.mode === 'companies') {
        items = pickCompanies(action.companyCategory ?? 'all', excludeCompanies);
        items = items.sort((a, b) =>
          getLettersOnly((a as Company).name, action.language).length -
          getLettersOnly((b as Company).name, action.language).length
        );
      } else {
        items = pickCountries(action.continent, action.language, excludeFlags);
      }
      const base: GameState = {
        ...state,
        countries: items,
        score: 0,
        bankScore: action.totalScore,
        selectedContinent: action.continent,
        selectedCompanyCategory: action.companyCategory ?? 'all',
        language: action.language,
        mode: action.mode,
        completedThisGame: [],
        completedFlagsBefore: action.completedFlags,
        completedCompaniesBefore: action.completedCompanies,
        skippedIndices: [],
        savedRounds: {},
        goBackReturnIndex: null,
        sessionGreens: 0,
        sessionYellows: 0,
        sessionReds: 0,
        sessionHints: 0,
        sessionReveals: 0,
        sessionSkips: 0,
        gameStartTime: Date.now(),
      };
      return { ...base, ...initRound(base, 0), phase: 'game' };
    }

    case 'SELECT_LETTER': {
      if (state.phase !== 'game' || state.feedbackVisible) return state;

      const tile = state.letterPool.find(t => t.id === action.tileId);
      if (!tile || (tile.status !== 'available' && tile.status !== 'hint-yellow')) return state;

      const nextSlot = state.slotValues.findIndex(
        (v, i) => v === null && state.slotStatus[i] !== 'correct'
      );
      if (nextSlot === -1) return state;

      const newSlotValues = [...state.slotValues];
      const newSlotTileIds = [...state.slotTileIds];
      newSlotValues[nextSlot] = tile.letter;
      newSlotTileIds[nextSlot] = tile.id;

      // Remember the tile's status before placing so backspace can restore it
      const newPool = state.letterPool.map(t =>
        t.id === tile.id ? { ...t, placedFrom: t.status, status: 'placed' as TileStatus } : t
      );

      const allFilled = newSlotValues.every(v => v !== null);
      if (!allFilled) {
        return { ...state, slotValues: newSlotValues, slotTileIds: newSlotTileIds, letterPool: newPool };
      }

      // All slots filled → auto-submit
      const item = state.countries[state.currentIndex];
      const correctLetters = getLettersOnly(getItemName(item, state.language), state.language);
      const feedback = checkSubmission(newSlotValues as string[], correctLetters);
      const allCorrect = feedback.every(f => f === 'correct');

      const greens = feedback.filter(f => f === 'correct').length;
      const yellows = feedback.filter(f => f === 'wrong-pos').length;
      const reds = feedback.filter(f => f === 'wrong').length;

      if (allCorrect) {
        const finalPool = newPool.map(t =>
          newSlotTileIds.includes(t.id) ? { ...t, status: 'locked' as TileStatus } : t
        );
        const itemId = getItemId(state.countries[state.currentIndex]);
        return {
          ...state,
          slotValues: newSlotValues,
          slotTileIds: newSlotTileIds,
          slotStatus: new Array(correctLetters.length).fill('correct') as SlotStatus[],
          letterPool: finalPool,
          score: state.score + calculateRoundScore(state.lives),
          roundResult: 'correct',
          feedbackVisible: true,
          feedbackResult: feedback,
          phase: 'roundOver',
          completedThisGame: [...state.completedThisGame, itemId],
          sessionGreens: state.sessionGreens + greens,
          sessionYellows: state.sessionYellows + yellows,
          sessionReds: state.sessionReds + reds,
        };
      }

      const newLives = state.lives - 1;
      const failed = newLives <= 0;
      return {
        ...state,
        slotValues: newSlotValues,
        slotTileIds: newSlotTileIds,
        letterPool: newPool,
        lives: newLives,
        roundResult: failed ? 'failed' : null,
        feedbackVisible: true,
        feedbackResult: feedback,
        phase: failed ? 'roundOver' : 'game',
        sessionGreens: state.sessionGreens + greens,
        sessionYellows: state.sessionYellows + yellows,
        sessionReds: state.sessionReds + reds,
      };
    }

    case 'REMOVE_LAST_LETTER': {
      if (state.phase !== 'game' || state.feedbackVisible) return state;

      // Find the last non-locked filled slot
      let idx = -1;
      for (let i = state.slotValues.length - 1; i >= 0; i--) {
        if (state.slotValues[i] !== null && state.slotStatus[i] !== 'correct') {
          idx = i;
          break;
        }
      }
      if (idx === -1) return state;

      const tileId = state.slotTileIds[idx];
      const newSlotValues  = [...state.slotValues];
      const newSlotTileIds = [...state.slotTileIds];
      newSlotValues[idx]  = null;
      newSlotTileIds[idx] = null;

      // Restore the tile to its pre-placement status
      const newPool = state.letterPool.map(t =>
        t.id === tileId
          ? { ...t, status: (t.placedFrom ?? 'available') as TileStatus, placedFrom: null }
          : t
      );

      return { ...state, slotValues: newSlotValues, slotTileIds: newSlotTileIds, letterPool: newPool };
    }

    case 'USE_HINT': {
      if (state.feedbackVisible || state.roundResult !== null) return state;
      if (state.bankScore + state.score < HINT_COST) return state; // not enough points

      const item = state.countries[state.currentIndex];
      const correctLetters = getLettersOnly(getItemName(item, state.language), state.language);

      // Find all slot indices that are not yet locked
      const unlockedIndices = state.slotStatus
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s !== 'correct')
        .map(({ i }) => i);

      if (unlockedIndices.length === 0) return state;

      // Pick a random unlocked slot
      const idx = unlockedIndices[Math.floor(Math.random() * unlockedIndices.length)];
      const correctLetter = correctLetters[idx];

      let newPool = [...state.letterPool];
      const newSlotValues = [...state.slotValues];
      const newSlotTileIds = [...state.slotTileIds];
      const newSlotStatus = [...state.slotStatus] as SlotStatus[];

      // If the slot already has a tile placed in it, return that tile to available
      const existingTileId = state.slotTileIds[idx];
      if (existingTileId) {
        newPool = newPool.map(t =>
          t.id === existingTileId ? { ...t, status: 'available' as TileStatus } : t
        );
        newSlotValues[idx] = null;
        newSlotTileIds[idx] = null;
      }

      // Find a matching tile from the pool to consume
      const matchingTile = newPool.find(
        t => t.letter === correctLetter && t.status !== 'locked' && t.status !== 'placed'
      );

      if (matchingTile) {
        newPool = newPool.map(t =>
          t.id === matchingTile.id ? { ...t, status: 'locked' as TileStatus } : t
        );
        newSlotTileIds[idx] = matchingTile.id;
      }

      newSlotValues[idx] = correctLetter;
      newSlotStatus[idx] = 'correct';

      return {
        ...state,
        slotValues: newSlotValues,
        slotTileIds: newSlotTileIds,
        slotStatus: newSlotStatus,
        letterPool: newPool,
        score: state.score - HINT_COST,
        sessionHints: state.sessionHints + 1,
      };
    }

    case 'REVEAL_WORD': {
      if (state.feedbackVisible || state.roundResult !== null) return state;
      if (state.bankScore + state.score < REVEAL_COST) return state;

      const item = state.countries[state.currentIndex];
      const correctLetters = getLettersOnly(getItemName(item, state.language), state.language);

      const newSlotValues = [...correctLetters] as string[];
      const newSlotStatus = new Array(correctLetters.length).fill('correct') as SlotStatus[];

      // Lock all correct tiles, mark the rest as consumed
      let pool = [...state.letterPool];
      const newSlotTileIds: (string | null)[] = new Array(correctLetters.length).fill(null);

      correctLetters.forEach((letter, idx) => {
        if (state.slotStatus[idx] === 'correct') {
          newSlotTileIds[idx] = state.slotTileIds[idx];
          return;
        }
        const tile = pool.find(t => t.letter === letter && t.status !== 'locked' && t.status !== 'placed');
        if (tile) {
          pool = pool.map(t => t.id === tile.id ? { ...t, status: 'locked' as TileStatus } : t);
          newSlotTileIds[idx] = tile.id;
        }
      });

      const itemId = getItemId(state.countries[state.currentIndex]);
      return {
        ...state,
        slotValues: newSlotValues,
        slotTileIds: newSlotTileIds,
        slotStatus: newSlotStatus,
        letterPool: pool,
        score: state.score - REVEAL_COST,
        roundResult: 'revealed',
        feedbackVisible: true,
        feedbackResult: new Array(correctLetters.length).fill('correct'),
        phase: 'roundOver',
        completedThisGame: [...state.completedThisGame, itemId],
        sessionReveals: state.sessionReveals + 1,
      };
    }

    case 'SKIP_ROUND': {
      if (state.feedbackVisible || state.roundResult !== null) return state;
      const snapshot: SavedRoundState = {
        slotValues: state.slotValues,
        slotTileIds: state.slotTileIds,
        slotStatus: state.slotStatus,
        letterPool: state.letterPool,
        lives: state.lives,
        feedbackResult: state.feedbackResult,
      };
      const newSkippedIndices = [...state.skippedIndices, state.currentIndex];
      const newSavedRounds = { ...state.savedRounds, [state.currentIndex]: snapshot };
      const next = state.currentIndex + 1;
      if (next >= state.countries.length) {
        return { ...state, skippedIndices: newSkippedIndices, savedRounds: newSavedRounds, roundResult: 'skipped', feedbackVisible: false, phase: 'results', sessionSkips: state.sessionSkips + 1 };
      }
      const base: GameState = { ...state, skippedIndices: newSkippedIndices, savedRounds: newSavedRounds, roundResult: null, feedbackVisible: false, sessionSkips: state.sessionSkips + 1 };
      return { ...base, ...initRound(base, next), phase: 'game' };
    }

    case 'GO_BACK': {
      const prevSkipped = state.skippedIndices.filter(i => i < state.currentIndex);
      if (prevSkipped.length === 0) return state;
      const targetIndex = Math.max(...prevSkipped);
      const newSkipped = state.skippedIndices.filter(i => i !== targetIndex);
      const saved = state.savedRounds[targetIndex];
      const { [targetIndex]: _removed, ...remainingSaved } = state.savedRounds;
      const base: GameState = { ...state, skippedIndices: newSkipped, savedRounds: remainingSaved, goBackReturnIndex: state.currentIndex };
      if (saved) {
        return {
          ...base,
          currentIndex: targetIndex,
          slotValues: saved.slotValues,
          slotTileIds: saved.slotTileIds,
          slotStatus: saved.slotStatus,
          letterPool: saved.letterPool,
          lives: saved.lives,
          feedbackResult: saved.feedbackResult,
          roundResult: null,
          feedbackVisible: false,
          phase: 'game',
        };
      }
      return { ...base, ...initRound(base, targetIndex), phase: 'game' };
    }

    case 'ACKNOWLEDGE_FEEDBACK': {
      if (!state.feedbackVisible) return state;

      if (state.roundResult !== null) {
        return { ...state, feedbackVisible: false };
      }

      // Game continues: lock correct slots, return wrong/yellow tiles to pool
      const newSlotValues = [...state.slotValues];
      const newSlotTileIds = [...state.slotTileIds];
      const newSlotStatus = [...state.slotStatus] as SlotStatus[];
      const tileUpdates = new Map<string, TileStatus>();

      state.feedbackResult.forEach((f, i) => {
        const tileId = state.slotTileIds[i];
        if (!tileId) return;
        if (f === 'correct') {
          newSlotStatus[i] = 'correct';
          tileUpdates.set(tileId, 'locked');
        } else {
          newSlotValues[i] = null;
          newSlotTileIds[i] = null;
          tileUpdates.set(tileId, f === 'wrong-pos' ? 'hint-yellow' : 'hint-red');
        }
      });

      const newPool = state.letterPool.map(t => {
        const updated = tileUpdates.get(t.id);
        return updated !== undefined ? { ...t, status: updated } : t;
      });

      return {
        ...state,
        slotValues: newSlotValues,
        slotTileIds: newSlotTileIds,
        slotStatus: newSlotStatus,
        letterPool: newPool,
        feedbackVisible: false,
        feedbackResult: [],
      };
    }

    case 'NEXT_ROUND': {
      const next = state.goBackReturnIndex !== null
        ? state.goBackReturnIndex
        : state.currentIndex + 1;
      const newState = { ...state, goBackReturnIndex: null };
      if (next >= state.countries.length) return { ...newState, phase: 'results' };
      return { ...newState, ...initRound(newState, next), phase: 'game' };
    }

    case 'RESTART_GAME': {
      const excludeFlags = new Set([...state.completedFlagsBefore, ...state.completedThisGame]);
      const excludeCompanies = new Set([...state.completedCompaniesBefore, ...state.completedThisGame]);
      let items: Array<Country | Company>;
      if (state.mode === 'companies') {
        items = pickCompanies(state.selectedCompanyCategory, excludeCompanies);
        items = items.sort((a, b) =>
          getLettersOnly((a as Company).name, state.language).length -
          getLettersOnly((b as Company).name, state.language).length
        );
      } else {
        items = pickCountries(state.selectedContinent, state.language, excludeFlags);
      }
      const base: GameState = {
        ...state,
        countries: items,
        score: 0,
        completedThisGame: [],
        completedFlagsBefore: [...state.completedFlagsBefore, ...state.completedThisGame],
        completedCompaniesBefore: [...state.completedCompaniesBefore, ...state.completedThisGame],
        skippedIndices: [],
        savedRounds: {},
        goBackReturnIndex: null,
        sessionGreens: 0,
        sessionYellows: 0,
        sessionReds: 0,
        sessionHints: 0,
        sessionReveals: 0,
        sessionSkips: 0,
        gameStartTime: Date.now(),
      };
      return { ...base, ...initRound(base, 0), phase: 'game' };
    }

    case 'RETURN_TO_START':
      return { ...createInitialState() };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const startGame = useCallback((continent: Continent | 'all', language: Language = 'en', mode: GameMode = 'countries', companyCategory?: CompanyCategory | 'all', completedFlags: string[] = [], completedCompanies: string[] = [], totalScore: number = 0) =>
    dispatch({ type: 'START_GAME', continent, language, mode, companyCategory, completedFlags, completedCompanies, totalScore }), []);
  const selectLetter = useCallback((tileId: string) =>
    dispatch({ type: 'SELECT_LETTER', tileId }), []);
  const removeLetter = useCallback(() =>
    dispatch({ type: 'REMOVE_LAST_LETTER' }), []);
  const useHint = useCallback(() =>
    dispatch({ type: 'USE_HINT' }), []);
  const revealWord = useCallback(() =>
    dispatch({ type: 'REVEAL_WORD' }), []);
  const skipRound = useCallback(() =>
    dispatch({ type: 'SKIP_ROUND' }), []);
  const goBack = useCallback(() =>
    dispatch({ type: 'GO_BACK' }), []);
  const acknowledgeFeedback = useCallback(() =>
    dispatch({ type: 'ACKNOWLEDGE_FEEDBACK' }), []);
  const nextRound = useCallback(() =>
    dispatch({ type: 'NEXT_ROUND' }), []);
  const restartGame = useCallback(() =>
    dispatch({ type: 'RESTART_GAME' }), []);
  const returnToStart = useCallback(() =>
    dispatch({ type: 'RETURN_TO_START' }), []);

  return { state, startGame, selectLetter, removeLetter, useHint, revealWord, skipRound, goBack, acknowledgeFeedback, nextRound, restartGame, returnToStart };
}
