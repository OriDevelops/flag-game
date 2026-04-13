import { useState } from 'react';
import { Language } from '../types';
import { StoredStats } from '../hooks/useStats';

const USERS_KEY = 'flag-guesser-users-v1';

function loadAllUsers(): string[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return Object.keys(JSON.parse(raw));
  } catch { return []; }
}

function loadStats(username: string): StoredStats {
  try {
    const raw = localStorage.getItem(`flag-guesser-stats-v1-${username}`);
    if (raw) return JSON.parse(raw) as StoredStats;
  } catch { /* ignore */ }
  return { totalScore: 0, completedFlags: [], completedCompanies: [], greenCount: 0, yellowCount: 0, redCount: 0, hintsUsed: 0, revealsUsed: 0, skipsCount: 0, gamesPlayed: 0, playTimeSeconds: 0, bestScore: 0, streak: 0, lastPlayDate: '', unlockedAchievements: [] };
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type Tab = 'score' | 'items' | 'time' | 'streak';

interface Props {
  onClose: () => void;
  lang: Language;
  currentUser: string;
}

export function LeaderboardModal({ onClose, lang, currentUser }: Props) {
  const [tab, setTab] = useState<Tab>('score');
  const he = lang === 'he';

  const users = loadAllUsers();
  const data = users.map(username => {
    const s = loadStats(username);
    return {
      username,
      score: s.totalScore,
      items: s.completedFlags.length + (s.completedCompanies ?? []).length,
      time: s.playTimeSeconds ?? 0,
      streak: s.streak ?? 0,
    };
  });

  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
  const rowClass = (i: number) => i === 0 ? 'leaderboard-row--gold' : i === 1 ? 'leaderboard-row--silver' : i === 2 ? 'leaderboard-row--bronze' : '';

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'score',  emoji: '⭐', label: he ? 'ניקוד'   : 'Score' },
    { id: 'items',  emoji: '🏳️', label: he ? 'השלמות' : 'Completed' },
    { id: 'time',   emoji: '⏱️', label: he ? 'זמן'    : 'Time' },
    { id: 'streak', emoji: '🔥', label: he ? 'רצף'    : 'Streak' },
  ];

  const sorted = (
    tab === 'score'  ? [...data].sort((a, b) => b.score  - a.score)  :
    tab === 'items'  ? [...data].sort((a, b) => b.items  - a.items)  :
    tab === 'streak' ? [...data].sort((a, b) => b.streak - a.streak) :
                       [...data].sort((a, b) => b.time   - a.time)
  ).slice(0, 5);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={e => e.stopPropagation()} dir={he ? 'rtl' : 'ltr'}>
        <div className="stats-modal-header">
          <h2 className="stats-modal-title">🏆 {he ? 'טבלת מובילים' : 'Leaderboard'}</h2>
          <button className="stats-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab switcher */}
        <div className="leaderboard-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`leaderboard-tab${tab === t.id ? ' leaderboard-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.7, padding: '1rem' }}>
            {he ? 'אין משתמשים עדיין' : 'No users yet'}
          </p>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{he ? 'שם' : 'User'}</th>
                  <th>
                    {tab === 'score'  && `⭐ ${he ? 'ניקוד' : 'Score'}`}
                    {tab === 'items'  && `🏳️ ${he ? 'דגלים+סמלים' : 'Flags+Logos'}`}
                    {tab === 'time'   && `⏱️ ${he ? 'זמן' : 'Time'}`}
                    {tab === 'streak' && `🔥 ${he ? 'ימי רצף' : 'Streak'}`}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={row.username} className={`${rowClass(i)}${row.username === currentUser ? ' leaderboard-row--me' : ''}`}>
                    <td className="leaderboard-rank">{medal(i)}</td>
                    <td className="leaderboard-username">{row.username}</td>
                    <td className="leaderboard-score">
                      {tab === 'score'  && row.score}
                      {tab === 'items'  && row.items}
                      {tab === 'time'   && formatTime(row.time)}
                      {tab === 'streak' && `${row.streak} 🔥`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
