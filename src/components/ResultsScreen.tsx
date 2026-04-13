import { Company, Continent, Country, GameMode, Language } from '../types';
import { Translations } from '../i18n';
import { getItemName } from '../utils/gameUtils';

interface Props {
  score: number;
  maxScore: number;
  countries: Array<Country | Company>;
  completedThisGame: string[];
  sessionGreens: number;
  sessionYellows: number;
  sessionReds: number;
  sessionHints: number;
  sessionReveals: number;
  selectedContinent: Continent | 'all';
  mode: GameMode;
  allDone: boolean;
  onPlayAgain: () => void;
  onReturnToStart: () => void;
  lang: Language;
  t: Translations;
}

function getRatingLabel(flagsDone: number, totalFlags: number, t: Translations): { emoji: string; label: string } {
  const pct = totalFlags > 0 ? flagsDone / totalFlags : 0;
  if (pct >= 0.9) return { emoji: '🏆', label: t.ratingMaster };
  if (pct >= 0.7) return { emoji: '🌟', label: t.ratingExpert };
  if (pct >= 0.5) return { emoji: '👍', label: t.ratingGood };
  if (pct >= 0.3) return { emoji: '📚', label: t.ratingStudy };
  return { emoji: '🌱', label: t.ratingPractice };
}

export function ResultsScreen({ score, maxScore, countries, completedThisGame, selectedContinent, mode, allDone, onPlayAgain, onReturnToStart, lang, t }: Props) {
  // Accuracy: correct letters / (all letter attempts + hints used + reveals × avg penalty)
  const flagsDone = completedThisGame.length;
  const { emoji, label } = getRatingLabel(flagsDone, countries.length, t);

  function getContinentLabel(id: Continent | 'all'): string {
    if (id === 'all') return `🌐 ${t.allCountries}`;
    const emojis: Record<Continent, string> = { africa: '🌍', americas: '🌎', asia: '🌏', europe: '🌍' };
    return `${emojis[id]} ${t[id]}`;
  }

  const completedSet = new Set(completedThisGame);

  return (
    <div className="screen results-screen" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="results-card">
        <div className="results-emoji">{emoji}</div>
        <h1 className="results-title">{label}</h1>

        <div className="results-score">
          <span className="results-score-value">{score}</span>
          <span className="results-score-divider">/</span>
          <span className="results-score-max">{maxScore}</span>
          <span className="results-score-label">{t.points}</span>
        </div>

        <div className="results-stats-row">
          <span>{mode === 'companies' ? '🏢' : '🏳️'} {flagsDone}/{countries.length}</span>
          <span>⭐ {score}/{maxScore}</span>
        </div>
        <div className="results-progress">
          <div className="results-progress-fill" style={{ width: `${Math.round((flagsDone / countries.length) * 100)}%` }} />
        </div>

        {mode === 'countries' && (
          <p className="results-continent-tag">{getContinentLabel(selectedContinent)}</p>
        )}
        {mode === 'companies' && (
          <p className="results-continent-tag">🏢 {t.modeCompanies}</p>
        )}

        <div className="results-countries">
          <h2>{mode === 'companies' ? t.companiesRound : t.countriesRound}</h2>
          <ul>
            {countries.map((item) => {
              const isCompany = 'domain' in item;
              const itemId = isCompany ? (item as Company).domain : (item as Country).code;
              const done = completedSet.has(itemId);
              const name = getItemName(item, lang);
              return (
                <li key={itemId} style={{ opacity: done ? 1 : 0.5 }}>
                  {isCompany ? (
                    <img
                      className="results-flag-mini results-logo-mini"
                      src={`https://logo.clearbit.com/${(item as Company).domain}?size=40`}
                      alt={name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <img
                      className="results-flag-mini"
                      src={`https://flagcdn.com/w40/${(item as Country).code}.png`}
                      alt={`Flag of ${(item as Country).name}`}
                    />
                  )}
                  <span>{name}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="results-actions">
          {allDone ? (
            <button className="btn btn--primary btn--large" onClick={onReturnToStart}>
              {t.mainMenu}
            </button>
          ) : (
            <>
              <button className="btn btn--primary btn--large" onClick={onPlayAgain}>
                {t.playAgain}
              </button>
              <button className="btn btn--secondary btn--large" onClick={onReturnToStart}>
                {t.mainMenu}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
