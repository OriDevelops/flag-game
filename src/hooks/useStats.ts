import { useState, useEffect, useCallback } from 'react';
import { CompanyCategory, Continent } from '../types';
import { COUNTRIES, CONTINENT_COUNTS, TOTAL_COUNTRIES } from '../data/countries';
import { COMPANIES, COMPANY_CATEGORY_COUNTS } from '../data/companies';
import { ACHIEVEMENTS } from '../data/achievements';

// ── Storage ───────────────────────────────────────────────────────────────────

export interface StoredStats {
  totalScore: number;
  /** Country codes the player has ever correctly guessed */
  completedFlags: string[];
  /** Company domains the player has ever correctly guessed */
  completedCompanies: string[];
  greenCount: number;
  yellowCount: number;
  redCount: number;
  hintsUsed: number;
  revealsUsed: number;
  skipsCount: number;
  gamesPlayed: number;
  playTimeSeconds: number;
  bestScore: number;
  streak: number;
  lastPlayDate: string;
  unlockedAchievements: string[];
}

function storageKey(username: string) {
  return `flag-guesser-stats-v1-${username}`;
}

export function loadStatsPublic(username: string): StoredStats {
  return loadStats(username);
}

function loadStats(username: string): StoredStats {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (raw) return JSON.parse(raw) as StoredStats;
  } catch { /* ignore */ }
  return { totalScore: 0, completedFlags: [], completedCompanies: [], greenCount: 0, yellowCount: 0, redCount: 0, hintsUsed: 0, revealsUsed: 0, skipsCount: 0, gamesPlayed: 0, playTimeSeconds: 0, bestScore: 0, streak: 0, lastPlayDate: '', unlockedAchievements: [] };
}

function saveStats(username: string, s: StoredStats): void {
  try { localStorage.setItem(storageKey(username), JSON.stringify(s)); } catch { /* ignore */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface ContinentProgress {
  done: number;
  total: number;
}

export function useStats(username: string) {
  const [stats, setStats] = useState<StoredStats>(() => loadStats(username));
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([]);

  // Reload stats whenever the logged-in user changes
  useEffect(() => {
    setStats(loadStats(username));
  }, [username]);

  /**
   * Call after a game (or when leaving mid-game) to persist results.
   * @param score    Points earned this session
   * @param newCodes Country codes correctly guessed this session
   * @param session  Per-session counters
   */
  const commitGame = useCallback((
    score: number,
    newCodes: string[],
    session: { greens: number; yellows: number; reds: number; hints: number; reveals: number; skips: number },
    mode: 'countries' | 'companies' = 'countries'
  ) => {
    setStats(prev => {
      const completedFlags = new Set(prev.completedFlags);
      const completedCompanies = new Set(prev.completedCompanies ?? []);
      if (mode === 'companies') {
        newCodes.forEach(c => completedCompanies.add(c));
      } else {
        newCodes.forEach(c => completedFlags.add(c));
      }
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = prev.lastPlayDate === yesterday ? (prev.streak ?? 0) + 1
                      : prev.lastPlayDate === today ? (prev.streak ?? 1)
                      : 1;
      const next: StoredStats = {
        totalScore: prev.totalScore + score,
        completedFlags: [...completedFlags],
        completedCompanies: [...completedCompanies],
        greenCount: prev.greenCount + session.greens,
        yellowCount: prev.yellowCount + session.yellows,
        redCount: prev.redCount + session.reds,
        hintsUsed: prev.hintsUsed + session.hints,
        revealsUsed: prev.revealsUsed + session.reveals,
        skipsCount: prev.skipsCount + session.skips,
        gamesPlayed: prev.gamesPlayed + 1,
        playTimeSeconds: prev.playTimeSeconds,
        bestScore: Math.max(prev.bestScore, score),
        streak: newStreak,
        lastPlayDate: today,
        unlockedAchievements: prev.unlockedAchievements ?? [],
      };
      const alreadyUnlocked = new Set(prev.unlockedAchievements ?? []);
      const newlyUnlocked: string[] = [];
      function unlock(id: string, condition: boolean) {
        if (condition && !alreadyUnlocked.has(id)) {
          alreadyUnlocked.add(id);
          newlyUnlocked.push(id);
        }
      }
      unlock('first_correct', next.totalScore > 0);
      unlock('score_50',      next.totalScore >= 50);
      unlock('score_200',     next.totalScore >= 200);
      unlock('score_1000',    next.totalScore >= 1000);
      unlock('streak_3',      newStreak >= 3);
      unlock('streak_7',      newStreak >= 7);
      unlock('flags_50',      completedFlags.size >= 50);
      unlock('flags_all',     completedFlags.size >= TOTAL_COUNTRIES);
      unlock('companies_50',  completedCompanies.size >= 50);
      unlock('companies_all', completedCompanies.size >= COMPANIES.length);
      next.unlockedAchievements = [...alreadyUnlocked];
      if (newlyUnlocked.length > 0) setPendingAchievements(p => [...p, ...newlyUnlocked]);
      // Suppress unused import warning — ACHIEVEMENTS is used to validate ids conceptually
      void ACHIEVEMENTS;
      saveStats(username, next);
      return next;
    });
  }, [username]);

  /** Check score-based achievements in real time during gameplay */
  const checkScoreAchievements = useCallback((liveScore: number) => {
    setStats(prev => {
      const alreadyUnlocked = new Set(prev.unlockedAchievements ?? []);
      const newlyUnlocked: string[] = [];
      function unlock(id: string, condition: boolean) {
        if (condition && !alreadyUnlocked.has(id)) {
          alreadyUnlocked.add(id);
          newlyUnlocked.push(id);
        }
      }
      unlock('first_correct', liveScore > 0);
      unlock('score_50',      liveScore >= 50);
      unlock('score_200',     liveScore >= 200);
      unlock('score_1000',    liveScore >= 1000);
      if (newlyUnlocked.length === 0) return prev;
      const next = { ...prev, unlockedAchievements: [...alreadyUnlocked] };
      saveStats(username, next);
      setPendingAchievements(p => [...p, ...newlyUnlocked]);
      return next;
    });
  }, [username]);

  const addPlayTime = useCallback((seconds: number) => {
    if (seconds <= 0) return;
    // Read directly from localStorage so this works even during unmount
    const current = loadStats(username);
    const next = { ...current, playTimeSeconds: current.playTimeSeconds + seconds };
    saveStats(username, next);
    setStats(next);
  }, [username]);

  /** How many flags in this continent (or all) have ever been correctly guessed */
  function getProgress(continent: Continent | 'all'): ContinentProgress {
    const completed = new Set(stats.completedFlags);
    if (continent === 'all') {
      return { done: completed.size, total: TOTAL_COUNTRIES };
    }
    const inContinent = COUNTRIES.filter(c => c.continent === continent);
    return {
      done: inContinent.filter(c => completed.has(c.code)).length,
      total: CONTINENT_COUNTS[continent],
    };
  }

  /** How many companies in this category (or all) have ever been correctly guessed */
  function getCompanyProgress(category: CompanyCategory | 'all'): ContinentProgress {
    const completed = new Set(stats.completedCompanies ?? []);
    if (category === 'all') {
      return { done: completed.size, total: COMPANIES.length };
    }
    const inCategory = COMPANIES.filter(c => c.category === category);
    return {
      done: inCategory.filter(c => completed.has(c.domain)).length,
      total: COMPANY_CATEGORY_COUNTS[category],
    };
  }

  /** Raw set of country codes ever completed (localStorage only, not current session) */
  const completedFlagsSet = new Set(stats.completedFlags);

  const clearPendingAchievements = useCallback(() => setPendingAchievements([]), []);

  return { totalScore: stats.totalScore, completedFlagsSet, getProgress, getCompanyProgress, commitGame, checkScoreAchievements, addPlayTime, fullStats: stats, pendingAchievements, clearPendingAchievements };
}
