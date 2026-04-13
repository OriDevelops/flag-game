import { useState } from 'react';
import { CompanyCategory, Continent, GameMode, Language } from '../types';
import { CONTINENT_COUNTS, TOTAL_COUNTRIES } from '../data/countries';
import { ContinentProgress, StoredStats } from '../hooks/useStats';
import { StatsModal } from './StatsModal';
import { LeaderboardModal } from './LeaderboardModal';
import { AchievementsModal } from './AchievementsModal';
import { Translations } from '../i18n';

interface Props {
  onStart: (continent: Continent | 'all', mode: GameMode, companyCategory?: CompanyCategory | 'all') => void;
  totalScore: number;
  getProgress: (continent: Continent | 'all') => ContinentProgress;
  getCompanyProgress: (category: CompanyCategory | 'all') => ContinentProgress;
  currentUser: string;
  onLogout: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
  fullStats: StoredStats;
  sessionStartTime: number;
  initialMode?: GameMode;
}

interface ContinentCard {
  id: Continent | 'all';
  emoji: string;
  total: number;
  color: string;
}

interface CategoryCard {
  id: CompanyCategory | 'all';
  emoji: string;
  color: string;
}

const CONTINENT_CARDS: ContinentCard[] = [
  { id: 'all',      emoji: '🌐', total: TOTAL_COUNTRIES,           color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'africa',   emoji: '🌍', total: CONTINENT_COUNTS.africa,   color: 'linear-gradient(135deg,#f97316,#dc2626)' },
  { id: 'americas', emoji: '🌎', total: CONTINENT_COUNTS.americas, color: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  { id: 'asia',     emoji: '🌏', total: CONTINENT_COUNTS.asia,     color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { id: 'europe',   emoji: '🌍', total: CONTINENT_COUNTS.europe,   color: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
];

const CATEGORY_CARDS: CategoryCard[] = [
  { id: 'all',        emoji: '🏢', color: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
  { id: 'tech',       emoji: '💻', color: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
  { id: 'auto',       emoji: '🚗', color: 'linear-gradient(135deg,#64748b,#475569)' },
  { id: 'food',       emoji: '🍔', color: 'linear-gradient(135deg,#f97316,#ea580c)' },
  { id: 'fashion',    emoji: '👗', color: 'linear-gradient(135deg,#ec4899,#db2777)' },
  { id: 'finance',    emoji: '💳', color: 'linear-gradient(135deg,#10b981,#059669)' },
  { id: 'media',      emoji: '🎬', color: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  { id: 'retail',     emoji: '🛒', color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { id: 'energy',     emoji: '⚡', color: 'linear-gradient(135deg,#84cc16,#65a30d)' },
  { id: 'pharma',     emoji: '💊', color: 'linear-gradient(135deg,#14b8a6,#0d9488)' },
  { id: 'transport',  emoji: '✈️', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
];

export function StartScreen({ onStart, totalScore, getProgress, getCompanyProgress, currentUser, onLogout, lang, setLang, t, fullStats, sessionStartTime, initialMode }: Props) {
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode ?? 'countries');

  function getLabel(id: Continent | 'all'): string {
    if (id === 'all') return t.allCountries;
    return t[id];
  }

  function getCategoryLabel(id: CompanyCategory | 'all'): string {
    const map: Record<CompanyCategory | 'all', keyof typeof t> = {
      all: 'catAll', tech: 'catTech', auto: 'catAuto', food: 'catFood',
      fashion: 'catFashion', finance: 'catFinance', media: 'catMedia',
      retail: 'catRetail', energy: 'catEnergy', pharma: 'catPharma',
      transport: 'catTransport',
    };
    return t[map[id]] as string;
  }

  return (
    <div className="screen start-screen" dir={lang === 'he' ? 'rtl' : 'ltr'}>

      <div className="start-header">
        <div className="start-top-bar">
          <button className="start-username-btn" onClick={() => setShowStats(true)}>👤 {currentUser}</button>
          <button className="btn-leaderboard" onClick={() => setShowLeaderboard(true)}>🏆</button>
          <button className="btn-leaderboard" onClick={() => setShowAchievements(true)}>🏅</button>
          <div className="start-top-actions">
            <div className="lang-toggle">
              <button
                className={`lang-btn ${lang === 'en' ? 'lang-btn--active' : ''}`}
                onClick={() => setLang('en')}
              >EN</button>
              <button
                className={`lang-btn ${lang === 'he' ? 'lang-btn--active' : ''}`}
                onClick={() => setLang('he')}
              >עב</button>
            </div>
            <button className="btn-logout" onClick={onLogout}>{t.logout}</button>
          </div>
        </div>
        <div className="start-emoji">{selectedMode === 'companies' ? '🏢' : '🌍'}</div>
        <h1 className="start-title">{selectedMode === 'companies' ? t.appNameCompanies : t.appName}</h1>

        {/* Total score banner */}
        <div className="start-score-banner">
          <span className="start-score-label">{t.totalScore}</span>
          <span className="start-score-value">⭐ {totalScore}</span>
          {(fullStats.streak ?? 0) >= 2 && (
            <span className="start-streak-badge">🔥 {fullStats.streak}</span>
          )}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-toggle-btn ${selectedMode === 'countries' ? 'mode-toggle-btn--active' : ''}`}
          onClick={() => setSelectedMode('countries')}
        >
          🌍 {t.modeCountries}
        </button>
        <button
          className={`mode-toggle-btn ${selectedMode === 'companies' ? 'mode-toggle-btn--active' : ''}`}
          onClick={() => setSelectedMode('companies')}
        >
          🏢 {t.modeCompanies}
        </button>
      </div>

      <p className="start-choose">
        {selectedMode === 'companies' ? t.chooseCategory : t.chooseRegion}
      </p>

      {selectedMode === 'countries' ? (
        /* Continent cards */
        <div className="continent-grid">
          {CONTINENT_CARDS.map(card => {
            const { done, total } = getProgress(card.id);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <button
                key={card.id}
                className="continent-card"
                style={{ background: card.color }}
                onClick={() => onStart(card.id, 'countries')}
              >
                {/* Progress bar across the top of the card */}
                <div className="card-progress-bar">
                  <div className="card-progress-fill" style={{ width: `${pct}%` }} />
                </div>

                <span className="continent-card-emoji">{card.emoji}</span>
                <span className="continent-card-label">{getLabel(card.id)}</span>

                {/* Completed / total */}
                <span className="continent-card-progress">
                  {done === total && total > 0 ? `✓ ${t.completed}` : `${done} / ${total} ${t.flagsLabel}`}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Company category cards */
        <div className="continent-grid">
          {CATEGORY_CARDS.map(card => {
            const { done, total } = getCompanyProgress(card.id);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isCompleted = done === total && total > 0;
            return (
              <button
                key={card.id}
                className={`continent-card${isCompleted ? ' continent-card--completed' : ''}`}
                style={{ background: card.color }}
                onClick={() => !isCompleted && onStart('all', 'companies', card.id)}
                disabled={isCompleted}
              >
                <div className="card-progress-bar">
                  <div className="card-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="continent-card-emoji">{card.emoji}</span>
                <span className="continent-card-label">{getCategoryLabel(card.id)}</span>
                <span className="continent-card-progress">
                  {done === total && total > 0 ? `✓ ${t.completed}` : `${done} / ${total} ${t.companiesCount}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="start-rules">
        <ul>
          <li>🔤 {t.rule1}</li>
          <li>🟩 {t.rule2}</li>
          <li>🟨 {t.rule3}</li>
          <li>🟥 {t.rule4}</li>
          <li>❤️ {t.rule5}</li>
        </ul>
      </div>


      {showStats && (
        <StatsModal
          username={currentUser}
          stats={fullStats}
          sessionStartTime={sessionStartTime}
          getProgress={getProgress}
          onClose={() => setShowStats(false)}
          lang={lang}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          lang={lang}
          currentUser={currentUser}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          stats={fullStats}
          onClose={() => setShowAchievements(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
