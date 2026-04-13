import { useState, useEffect } from 'react';
import { StoredStats } from '../hooks/useStats';
import { ContinentProgress } from '../hooks/useStats';
import { Language } from '../types';

interface Props {
  username: string;
  stats: StoredStats;
  sessionStartTime: number;
  getProgress: (continent: 'africa' | 'americas' | 'asia' | 'europe' | 'all') => ContinentProgress;
  onClose: () => void;
  lang: Language;
}

export function StatsModal({ stats, sessionStartTime, getProgress, onClose, lang }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const totalLetters = stats.greenCount + stats.yellowCount + stats.redCount;
  const totalAttempts = totalLetters + stats.hintsUsed + stats.revealsUsed * 3;
  const accuracy = totalAttempts > 0 ? Math.round((stats.greenCount / totalAttempts) * 100) : 0;
  const avgScore = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;

  const liveSeconds = stats.playTimeSeconds + Math.round((Date.now() - sessionStartTime) / 1000);
  const hours = Math.floor(liveSeconds / 3600);
  const minutes = Math.floor((liveSeconds % 3600) / 60);
  const seconds = liveSeconds % 60;
  const timeStr = hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m ${seconds}s`;

  void tick; // used only to trigger re-render

  const continents: Array<{ id: 'africa' | 'americas' | 'asia' | 'europe' | 'all'; emoji: string; label: string }> = [
    { id: 'all',      emoji: '🌐', label: lang === 'he' ? 'כל העולם' : 'All' },
    { id: 'africa',   emoji: '🌍', label: lang === 'he' ? 'אפריקה' : 'Africa' },
    { id: 'americas', emoji: '🌎', label: lang === 'he' ? 'אמריקה' : 'Americas' },
    { id: 'asia',     emoji: '🌏', label: lang === 'he' ? 'אסיה' : 'Asia' },
    { id: 'europe',   emoji: '🌍', label: lang === 'he' ? 'אירופה' : 'Europe' },
  ];

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={e => e.stopPropagation()} dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <div className="stats-modal-header">
          <h2 className="stats-modal-title">📊 {lang === 'he' ? 'הסטטיסטיקות שלי' : 'My Stats'}</h2>
          <button className="stats-close" onClick={onClose}>✕</button>
        </div>

        {/* Flags per category */}
        <section className="stats-section">
          <h3 className="stats-section-title">🏳️ {lang === 'he' ? 'דגלים לפי קטגוריה' : 'Flags by Category'}</h3>
          <div className="stats-continent-grid">
            {continents.map(c => {
              const { done, total } = getProgress(c.id);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={c.id} className="stats-continent-item">
                  <span className="stats-continent-emoji">{c.emoji}</span>
                  <span className="stats-continent-label">{c.label}</span>
                  <span className="stats-continent-count">{done}/{total}</span>
                  <div className="stats-bar-bg">
                    <div className="stats-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Letter feedback */}
        <section className="stats-section">
          <h3 className="stats-section-title">🔤 {lang === 'he' ? 'אותיות' : 'Letters'}</h3>
          <div className="stats-row-grid">
            <div className="stats-cell stats-cell--green">
              <span className="stats-cell-val">{stats.greenCount}</span>
              <span className="stats-cell-lbl">🟩 {lang === 'he' ? 'ירוק' : 'Green'}</span>
            </div>
            <div className="stats-cell stats-cell--yellow">
              <span className="stats-cell-val">{stats.yellowCount}</span>
              <span className="stats-cell-lbl">🟨 {lang === 'he' ? 'צהוב' : 'Yellow'}</span>
            </div>
            <div className="stats-cell stats-cell--red">
              <span className="stats-cell-val">{stats.redCount}</span>
              <span className="stats-cell-lbl">🟥 {lang === 'he' ? 'אדום' : 'Red'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{accuracy}%</span>
              <span className="stats-cell-lbl">🎯 {lang === 'he' ? 'דיוק' : 'Accuracy'}</span>
            </div>
          </div>
        </section>

        {/* Game stats */}
        <section className="stats-section">
          <h3 className="stats-section-title">🎮 {lang === 'he' ? 'משחקים' : 'Games'}</h3>
          <div className="stats-row-grid">
            <div className="stats-cell">
              <span className="stats-cell-val">{stats.gamesPlayed}</span>
              <span className="stats-cell-lbl">🎮 {lang === 'he' ? 'משחקים' : 'Played'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{stats.bestScore}</span>
              <span className="stats-cell-lbl">🏆 {lang === 'he' ? 'שיא' : 'Best'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{avgScore}</span>
              <span className="stats-cell-lbl">⭐ {lang === 'he' ? 'ממוצע' : 'Avg'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{timeStr}</span>
              <span className="stats-cell-lbl">⏱️ {lang === 'he' ? 'זמן' : 'Time'}</span>
            </div>
          </div>
        </section>

        {/* Actions used */}
        <section className="stats-section">
          <h3 className="stats-section-title">🛠️ {lang === 'he' ? 'פעולות' : 'Actions'}</h3>
          <div className="stats-row-grid">
            <div className="stats-cell">
              <span className="stats-cell-val">{stats.hintsUsed}</span>
              <span className="stats-cell-lbl">🔍 {lang === 'he' ? 'רמזים' : 'Hints'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{stats.revealsUsed}</span>
              <span className="stats-cell-lbl">🪄 {lang === 'he' ? 'גילויים' : 'Reveals'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{stats.skipsCount}</span>
              <span className="stats-cell-lbl">🚀 {lang === 'he' ? 'דילוגים' : 'Skips'}</span>
            </div>
            <div className="stats-cell">
              <span className="stats-cell-val">{stats.totalScore}</span>
              <span className="stats-cell-lbl">⭐ {lang === 'he' ? 'סה"כ' : 'Total'}</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
