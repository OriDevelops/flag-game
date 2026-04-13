import { useState } from 'react';
import { TOTAL_COUNTRIES } from '../data/countries';
import { StoredStats } from '../hooks/useStats';

const USERS_KEY = 'flag-guesser-users-v1';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function loadAllUsers(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}'); }
  catch { return {}; }
}

function statsKey(username: string) {
  return `flag-guesser-stats-v1-${username}`;
}

function loadStats(username: string): StoredStats {
  try {
    const raw = localStorage.getItem(statsKey(username));
    if (raw) return JSON.parse(raw) as StoredStats;
  } catch { /* ignore */ }
  return { totalScore: 0, completedFlags: [], completedCompanies: [], greenCount: 0, yellowCount: 0, redCount: 0, hintsUsed: 0, revealsUsed: 0, skipsCount: 0, gamesPlayed: 0, playTimeSeconds: 0, bestScore: 0, streak: 0, lastPlayDate: '', unlockedAchievements: [] };
}

function saveStats(username: string, s: StoredStats): void {
  localStorage.setItem(statsKey(username), JSON.stringify(s));
}

interface Props {
  onBack: () => void;
  onLoginAs: (username: string) => void;
}

export function AdminScreen({ onBack, onLoginAs }: Props) {
  const [users, setUsers] = useState<Record<string, string>>(loadAllUsers);
  const [addPoints, setAddPoints] = useState<Record<string, string>>({});
  const [setStreak, setSetStreak] = useState<Record<string, string>>({});
  const [savedMsg, setSavedMsg] = useState<Record<string, boolean>>({});

  function handleDeleteUser(username: string) {
    if (!confirm(`Delete user "${username}"?`)) return;
    const updated = { ...loadAllUsers() };
    delete updated[username];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.removeItem(statsKey(username));
    setUsers(updated);
  }

  function handleSetStreak(username: string) {
    const val = parseInt(setStreak[username] ?? '0', 10);
    if (isNaN(val) || val < 0) return;
    const stats = loadStats(username);
    const today = new Date().toISOString().slice(0, 10);
    stats.streak = val;
    stats.lastPlayDate = today;
    saveStats(username, stats);
    setSavedMsg(prev => ({ ...prev, [username]: true }));
    setSetStreak(prev => ({ ...prev, [username]: '' }));
    setTimeout(() => setSavedMsg(prev => ({ ...prev, [username]: false })), 1500);
    setUsers({ ...loadAllUsers() });
  }

  function handleAddPoints(username: string) {
    const delta = parseInt(addPoints[username] ?? '0', 10);
    if (isNaN(delta)) return;
    const stats = loadStats(username);
    stats.totalScore = Math.max(0, stats.totalScore + delta);
    saveStats(username, stats);
    setSavedMsg(prev => ({ ...prev, [username]: true }));
    setAddPoints(prev => ({ ...prev, [username]: '' }));
    setTimeout(() => setSavedMsg(prev => ({ ...prev, [username]: false })), 1500);
    setUsers({ ...loadAllUsers() }); // re-render
  }

  const userList = Object.keys(users);

  return (
    <div className="screen admin-screen">
      <div className="admin-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1 className="admin-title">🔐 Admin Panel</h1>
      </div>

      {userList.length === 0 ? (
        <p className="admin-empty">No registered users yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Score</th>
                <th>Flags</th>
                <th>Streak</th>
                <th>Time</th>
                <th>Add Points</th>
                <th>Set Streak</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userList.map(username => {
                const stats = loadStats(username);
                const flagsDone = stats.completedFlags.length;
                return (
                  <tr key={username}>
                    <td className="admin-cell-user">{username}</td>
                    <td className="admin-cell-pass">{users[username]}</td>
                    <td className="admin-cell-score">⭐ {stats.totalScore}</td>
                    <td className="admin-cell-flags">
                      {flagsDone} / {TOTAL_COUNTRIES}
                    </td>
                    <td className="admin-cell-score">
                      🔥 {stats.streak ?? 0}
                    </td>
                    <td className="admin-cell-time">
                      ⏱️ {formatTime(stats.playTimeSeconds ?? 0)}
                    </td>
                    <td className="admin-cell-add">
                      <div className="admin-add-row">
                        <input
                          className="admin-pts-input"
                          type="number"
                          placeholder="±pts"
                          value={addPoints[username] ?? ''}
                          onChange={e => setAddPoints(prev => ({ ...prev, [username]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddPoints(username)}
                        />
                        <button
                          className="btn btn--primary admin-add-btn"
                          onClick={() => handleAddPoints(username)}
                        >
                          ✓
                        </button>
                        {savedMsg[username] && (
                          <span className="admin-saved">✓ Saved</span>
                        )}
                      </div>
                    </td>
                    <td className="admin-cell-add">
                      <div className="admin-add-row">
                        <input
                          className="admin-pts-input"
                          type="number"
                          placeholder="days"
                          value={setStreak[username] ?? ''}
                          onChange={e => setSetStreak(prev => ({ ...prev, [username]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleSetStreak(username)}
                        />
                        <button
                          className="btn btn--primary admin-add-btn"
                          onClick={() => handleSetStreak(username)}
                        >
                          ✓
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn--primary admin-del-btn"
                        onClick={() => onLoginAs(username)}
                      >
                        🔑
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn--danger admin-del-btn"
                        onClick={() => handleDeleteUser(username)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
