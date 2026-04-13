import { useEffect } from 'react';
import { Company, Country, FeedbackResult, GameMode, Language, LetterTile, RoundResult, SlotStatus } from '../types';
import { Translations } from '../i18n';
import { getItemName, MAX_LIVES } from '../utils/gameUtils';
import { FlagDisplay } from './FlagDisplay';
import { LogoDisplay } from './LogoDisplay';
import { WordDisplay } from './WordDisplay';
import { LetterPool } from './LetterPool';
import { LivesDisplay } from './LivesDisplay';
import { ProgressIndicator } from './ProgressIndicator';

interface Props {
  item: Country | Company;
  currentIndex: number;
  totalFlags: number;
  continentDone: number;
  continentTotal: number;
  slotValues: (string | null)[];
  slotStatus: SlotStatus[];
  letterPool: LetterTile[];
  lives: number;
  score: number;
  totalScore: number;
  roundResult: RoundResult;
  feedbackVisible: boolean;
  feedbackResult: FeedbackResult[];
  onSelectLetter: (tileId: string) => void;
  onRemoveLetter: () => void;
  onUseHint: () => void;
  onRevealWord: () => void;
  onSkipRound: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
  onAcknowledgeFeedback: () => void;
  onNextRound: () => void;
  onReturnToStart: () => void;
  lang: Language;
  t: Translations;
  mode: GameMode;
  isCompany: boolean;
  currentCompany?: Company;
}

export function GameScreen({
  item, currentIndex, totalFlags, continentDone, continentTotal, slotValues, slotStatus, letterPool,
  lives, score, totalScore, roundResult, feedbackVisible, feedbackResult,
  onSelectLetter, onRemoveLetter, onUseHint, onRevealWord, onSkipRound, canGoBack, onGoBack, onAcknowledgeFeedback, onNextRound, onReturnToStart,
  lang, t, mode, isCompany, currentCompany,
}: Props) {
  const isRoundOver = roundResult !== null;
  const hasUnlockedSlots = slotStatus.some(s => s !== 'correct');

  // Whether there's anything placed (non-locked) to remove
  const hasPlacedLetter = slotValues.some((v, i) => v !== null && slotStatus[i] !== 'correct');

  const effectiveScore = totalScore + score;

  const itemName = getItemName(item, lang);

  // ── Keyboard support ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ESC — return to start screen
      if (e.key === 'Escape') {
        e.preventDefault();
        onReturnToStart();
        return;
      }

      // ENTER — advance when feedback overlay is showing
      if (e.key === 'Enter' && feedbackVisible) {
        e.preventDefault();
        onAcknowledgeFeedback();
        if (roundResult !== null) onNextRound();
        return;
      }

      // Arrow keys — navigate between items
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSkipRound();
        return;
      }
      if (e.key === 'ArrowLeft' && canGoBack) {
        e.preventDefault();
        onGoBack();
        return;
      }

      if (feedbackVisible || isRoundOver) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        onRemoveLetter();
        return;
      }

      const letter = lang === 'he' ? e.key : e.key.toUpperCase();
      const isValidLetter = lang === 'he'
        ? /^[\u05D0-\u05EA]$/.test(letter)
        : /^[A-Z]$/.test(letter);
      if (!isValidLetter) return;

      // Find the first available tile matching this key
      const tile = letterPool.find(
        t => t.letter === letter && (t.status === 'available' || t.status === 'hint-yellow')
      );
      if (tile) onSelectLetter(tile.id);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [letterPool, feedbackVisible, isRoundOver, roundResult, canGoBack, onSelectLetter, onRemoveLetter, onSkipRound, onGoBack, onReturnToStart, onAcknowledgeFeedback, onNextRound, lang]);

  const correctCount  = feedbackResult.filter(f => f === 'correct').length;
  const wrongPosCount = feedbackResult.filter(f => f === 'wrong-pos').length;
  const wrongCount    = feedbackResult.filter(f => f === 'wrong').length;

  const overlayVariant =
    roundResult === 'correct'  ? 'correct'  :
    roundResult === 'revealed' ? 'correct'  :
    roundResult === 'failed'   ? 'failed'   :
    roundResult === 'skipped'  ? 'skipped'  :
    'try-again';

  function handleNextOrResults() {
    onAcknowledgeFeedback();
    onNextRound();
  }

  const showProgress = mode === 'countries';

  return (
    <div className="screen game-screen" dir={lang === 'he' ? 'rtl' : 'ltr'}>

      {/* ── Top bar ── */}
      <div className="game-topbar">
        <button className="btn-home" onClick={onReturnToStart} title={t.home}>
          {t.home}
        </button>
        {showProgress && (
          <ProgressIndicator
            continentDone={continentDone}
            continentTotal={continentTotal}
            t={t}
          />
        )}
        {!showProgress && <div />}
        <div className="game-score">⭐ {effectiveScore}</div>
      </div>

      <LivesDisplay lives={lives} maxLives={MAX_LIVES} />

      {/* ── Flag or Logo image ── */}
      {isCompany && currentCompany ? (
        <LogoDisplay key={currentCompany.domain} company={currentCompany} revealed={isRoundOver && !feedbackVisible} />
      ) : (
        <FlagDisplay country={item as Country} revealed={isRoundOver && !feedbackVisible} lang={lang} />
      )}

      {/* ── Word blanks + backspace ── */}
      <div className="word-row">
        <WordDisplay
          name={itemName}
          slotValues={slotValues}
          slotStatus={slotStatus}
          feedbackVisible={feedbackVisible}
          feedbackResult={feedbackResult}
          roundResult={roundResult}
          rtl={lang === 'he'}
        />
        {!feedbackVisible && !isRoundOver && (
          <button
            className="btn-backspace"
            onClick={onRemoveLetter}
            disabled={!hasPlacedLetter}
            title="Remove last letter (Backspace)"
            aria-label="Remove last letter"
          >
            ⌫
          </button>
        )}
      </div>

      {/* ── Letter pool ── */}
      <LetterPool
        tiles={letterPool}
        onSelect={onSelectLetter}
        disabled={feedbackVisible || isRoundOver}
      />

      {/* ── Hint & Skip action bar ── */}
      {!feedbackVisible && !isRoundOver && (
        <div className="game-actions">
          <button
            className="btn btn--hint"
            onClick={onUseHint}
            disabled={!hasUnlockedSlots || effectiveScore < 5}
            title={effectiveScore < 5 ? t.needPts : undefined}
          >
            🔍 {t.hint} <span className="btn-cost">{t.hintCost}</span>
          </button>
          <button
            className="btn btn--reveal"
            onClick={onRevealWord}
            disabled={!hasUnlockedSlots || effectiveScore < 15}
            title={effectiveScore < 15 ? t.needPts : undefined}
          >
            🪄 {t.revealWord} <span className="btn-cost">{t.revealCost}</span>
          </button>
          <button
            className="btn btn--skip"
            onClick={onSkipRound}
          >
            🚀 {t.skip}
          </button>
          <button
            className="btn btn--back-flag"
            onClick={onGoBack}
            disabled={!canGoBack}
            style={{ visibility: canGoBack ? 'visible' : 'hidden' }}
          >
            🔄 {t.goBack}
          </button>
        </div>
      )}

      {/* ── Feedback / result overlay ── */}
      {feedbackVisible && (
        <div className={`round-result round-result--${overlayVariant}`}>
          <div className="round-result-content">

            {roundResult === 'correct' && (
              <>
                <span className="round-result-emoji">🎉</span>
                <p className="round-result-text">
                  {t.correctMsg(lives)}
                </p>
                <button className="btn btn--primary" onClick={handleNextOrResults}>
                  {currentIndex + 1 < totalFlags ? (mode === 'companies' ? t.nextCompany : t.nextFlag) : t.seeResults}
                </button>
              </>
            )}

            {roundResult === 'revealed' && (
              <>
                <span className="round-result-emoji">🪄</span>
                <button className="btn btn--primary" onClick={handleNextOrResults}>
                  {currentIndex + 1 < totalFlags ? (mode === 'companies' ? t.nextCompany : t.nextFlag) : t.seeResults}
                </button>
              </>
            )}

            {roundResult === 'failed' && (
              <>
                <span className="round-result-emoji">💔</span>
                <p className="round-result-text">
                  {t.answerWas} <strong>{itemName}</strong>
                </p>
                <button className="btn btn--primary" onClick={handleNextOrResults}>
                  {currentIndex + 1 < totalFlags ? (mode === 'companies' ? t.nextCompany : t.nextFlag) : t.seeResults}
                </button>
              </>
            )}

            {roundResult === 'skipped' && (
              <>
                <span className="round-result-emoji">⏭️</span>
                <p className="round-result-text">
                  {t.skippedMsg} <strong>{itemName}</strong>
                </p>
                <button className="btn btn--primary" onClick={handleNextOrResults}>
                  {currentIndex + 1 < totalFlags ? (mode === 'companies' ? t.nextCompany : t.nextFlag) : t.seeResults}
                </button>
              </>
            )}

            {roundResult === null && (
              <>
                <span className="round-result-emoji">🔍</span>
                <div className="feedback-legend">
                  {correctCount > 0 && (
                    <span className="feedback-badge feedback-badge--correct">
                      🟩 {correctCount} {t.correctLabel}
                    </span>
                  )}
                  {wrongPosCount > 0 && (
                    <span className="feedback-badge feedback-badge--yellow">
                      🟨 {wrongPosCount} {t.wrongPos}
                    </span>
                  )}
                  {wrongCount > 0 && (
                    <span className="feedback-badge feedback-badge--red">
                      🟥 {wrongCount} {t.notInWord}
                    </span>
                  )}
                </div>
                <p className="feedback-lives">
                  ❤️ {t.livesLeft(lives)}
                </p>
                <button className="btn btn--primary" onClick={onAcknowledgeFeedback}>
                  {t.tryAgain}
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
