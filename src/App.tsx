import { useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats, loadStatsPublic } from './hooks/useStats';
import { useAuth } from './hooks/useAuth';
import { useLang } from './hooks/useLang';
import { AuthScreen } from './components/AuthScreen';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { AdminScreen } from './components/AdminScreen';
import { AchievementToast } from './components/AchievementToast';
import { COUNTRIES, CONTINENT_COUNTS, TOTAL_COUNTRIES } from './data/countries';
import { Company, Continent, Language } from './types';
import { Translations } from './i18n';

export default function App() {
  const { currentUser, register, login, logout, loginAs } = useAuth();
  const { lang, setLang, t } = useLang();

  if (!currentUser) {
    return <AuthScreen onRegister={register} onLogin={login} lang={lang} setLang={setLang} t={t} />;
  }

  if (currentUser === 'ori') {
    return <AdminScreen onBack={logout} onLoginAs={loginAs} />;
  }

  return <GameApp currentUser={currentUser} onLogout={logout} lang={lang} setLang={setLang} t={t} />;
}

function GameApp({
  currentUser, onLogout, lang, setLang, t,
}: {
  currentUser: string;
  onLogout: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}) {
  const {
    state,
    startGame, selectLetter, removeLetter, useHint, revealWord, skipRound, goBack,
    acknowledgeFeedback, nextRound, restartGame, returnToStart,
  } = useGameState();

  const { totalScore, completedFlagsSet, getProgress, getCompanyProgress, commitGame, checkScoreAchievements, addPlayTime, fullStats, pendingAchievements, clearPendingAchievements } = useStats(currentUser);

  const {
    phase, countries, currentIndex,
    slotValues, slotStatus, letterPool,
    lives, score, roundResult,
    feedbackVisible, feedbackResult,
    completedThisGame, skippedIndices,
    sessionGreens, sessionYellows, sessionReds,
    sessionHints, sessionReveals, sessionSkips,
    mode,
  } = state;

  function buildSession() {
    return {
      greens: sessionGreens,
      yellows: sessionYellows,
      reds: sessionReds,
      hints: sessionHints,
      reveals: sessionReveals,
      skips: sessionSkips,
    };
  }

  const sessionStart = useRef(Date.now());

  useEffect(() => {
    const saveTime = () => {
      const secs = Math.round((Date.now() - sessionStart.current) / 1000);
      addPlayTime(secs);
      sessionStart.current = Date.now();
    };
    const onVisibility = () => {
      if (document.hidden) saveTime();
      else sessionStart.current = Date.now();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', saveTime);
    return () => {
      saveTime();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', saveTime);
    };
  }, []);

  useEffect(() => {
    if (phase === 'game' || phase === 'roundOver') {
      checkScoreAchievements(totalScore + score);
    }
  }, [score, phase]);

  useEffect(() => {
    if (phase === 'results') {
      commitGame(score, completedThisGame, buildSession(), mode);
      restartGame();
    }
  }, [phase]);

  function handleReturnToStart() {
    commitGame(score, completedThisGame, buildSession(), mode);
    returnToStart();
  }

  function getLiveProgress(continent: Continent | 'all'): { done: number; total: number } {
    const live = new Set(completedFlagsSet);
    state.completedThisGame.forEach(code => live.add(code));
    if (continent === 'all') return { done: live.size, total: TOTAL_COUNTRIES };
    const inContinent = COUNTRIES.filter(c => c.continent === continent);
    return {
      done: inContinent.filter(c => live.has(c.code)).length,
      total: CONTINENT_COUNTS[continent],
    };
  }

  const toast = pendingAchievements.length > 0 ? (
    <AchievementToast
      key={pendingAchievements[0]}
      achievementId={pendingAchievements[0]}
      lang={lang}
      onDone={clearPendingAchievements}
    />
  ) : null;

  if (phase === 'start') {
    return (
      <>
        <StartScreen
          onStart={(continent, startMode, companyCategory) => {
            const fresh = loadStatsPublic(currentUser);
            startGame(continent, lang, startMode, companyCategory, fresh.completedFlags, fresh.completedCompanies ?? [], fresh.totalScore);
          }}
          totalScore={totalScore}
          getProgress={getProgress}
          getCompanyProgress={getCompanyProgress}
          currentUser={currentUser}
          onLogout={onLogout}
          lang={lang}
          setLang={setLang}
          t={t}
          fullStats={fullStats}
          sessionStartTime={sessionStart.current}
          initialMode={mode}
        />
        {toast}
      </>
    );
  }

  if (phase === 'game' || phase === 'roundOver') {
    const currentItem = countries[currentIndex];
    const isCompany = 'domain' in currentItem;
    const { done, total } = mode === 'companies'
      ? { done: 0, total: 0 }
      : getLiveProgress(state.selectedContinent);

    return (
      <>
        <GameScreen
          item={currentItem}
          currentIndex={currentIndex}
          totalFlags={countries.length}
          continentDone={done}
          continentTotal={total}
          slotValues={slotValues}
          slotStatus={slotStatus}
          letterPool={letterPool}
          lives={lives}
          score={score}
          totalScore={totalScore}
          roundResult={roundResult}
          feedbackVisible={feedbackVisible}
          feedbackResult={feedbackResult}
          onSelectLetter={selectLetter}
          onRemoveLetter={removeLetter}
          onUseHint={useHint}
          onRevealWord={revealWord}
          onSkipRound={skipRound}
          canGoBack={skippedIndices.some(i => i < currentIndex)}
          onGoBack={goBack}
          onAcknowledgeFeedback={acknowledgeFeedback}
          onNextRound={nextRound}
          onReturnToStart={handleReturnToStart}
          lang={lang}
          t={t}
          mode={mode}
          isCompany={isCompany}
          currentCompany={isCompany ? currentItem as Company : undefined}
        />
        {toast}
      </>
    );
  }

  return <>{toast}</>;
}
