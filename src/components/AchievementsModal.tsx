import { StoredStats } from '../hooks/useStats';
import { Language } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { TOTAL_COUNTRIES } from '../data/countries';
import { COMPANIES } from '../data/companies';

interface Props {
  stats: StoredStats;
  onClose: () => void;
  lang: Language;
}

function getProgress(id: string, stats: StoredStats): { current: number; goal: number } {
  const flags = (stats.completedFlags ?? []).length;
  const companies = (stats.completedCompanies ?? []).length;
  const score = stats.totalScore;
  const streak = stats.streak ?? 0;

  switch (id) {
    case 'first_correct': return { current: Math.min(score, 1),    goal: 1 };
    case 'score_50':      return { current: Math.min(score, 50),   goal: 50 };
    case 'score_200':     return { current: Math.min(score, 200),  goal: 200 };
    case 'score_1000':    return { current: Math.min(score, 1000), goal: 1000 };
    case 'streak_3':      return { current: Math.min(streak, 3),   goal: 3 };
    case 'streak_7':      return { current: Math.min(streak, 7),   goal: 7 };
    case 'flags_50':      return { current: Math.min(flags, 50),   goal: 50 };
    case 'flags_all':     return { current: flags,                 goal: TOTAL_COUNTRIES };
    case 'companies_50':  return { current: Math.min(companies, 50), goal: 50 };
    case 'companies_all': return { current: companies,             goal: COMPANIES.length };
    default:              return { current: 0, goal: 1 };
  }
}

export function AchievementsModal({ stats, onClose, lang }: Props) {
  const he = lang === 'he';
  const unlocked = new Set(stats.unlockedAchievements ?? []);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={e => e.stopPropagation()} dir={he ? 'rtl' : 'ltr'}>
        <div className="stats-modal-header">
          <h2 className="stats-modal-title">🏅 {he ? 'הישגים' : 'Achievements'}</h2>
          <button className="stats-close" onClick={onClose}>✕</button>
        </div>

        <div className="achievement-list">
          {ACHIEVEMENTS.map(a => {
            const isUnlocked = unlocked.has(a.id);
            const { current, goal } = getProgress(a.id, stats);
            const pct = Math.min(100, Math.round((current / goal) * 100));

            return (
              <div key={a.id} className={`achievement-row${isUnlocked ? ' achievement-row--unlocked' : ''}`}>
                <span className="achievement-row-emoji">{isUnlocked ? a.emoji : '🔒'}</span>
                <div className="achievement-row-body">
                  <div className="achievement-row-header">
                    <span className="achievement-row-name">
                      {isUnlocked ? (he ? a.nameHe : a.nameEn) : (he ? a.descHe : a.descEn)}
                    </span>
                    <span className="achievement-row-fraction">{current} / {goal}</span>
                  </div>
                  <div className="achievement-progress-bar">
                    <div className="achievement-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="achievements-summary">
          {unlocked.size} / {ACHIEVEMENTS.length} {he ? 'הושגו' : 'unlocked'}
        </p>
      </div>
    </div>
  );
}
