import { FeedbackResult, SlotStatus, RoundResult } from '../types';

interface Props {
  name: string;
  slotValues: (string | null)[];
  slotStatus: SlotStatus[];
  feedbackVisible: boolean;
  feedbackResult: FeedbackResult[];
  roundResult: RoundResult;
  rtl?: boolean;
}

/**
 * Renders the word as a row of tiles.
 * Supports RTL (Hebrew) layout via the rtl prop.
 */
export function WordDisplay({ name, slotValues, slotStatus, feedbackVisible, feedbackResult, roundResult, rtl }: Props) {
  let letterIdx = 0;

  // Hebrew letter range
  const isLetter = (c: string) => rtl ? /[\u05D0-\u05EA]/.test(c) : /[A-Z]/.test(c);
  const normalized = rtl ? name : name.toUpperCase();

  // Index of next slot the player must fill
  const nextSlotIdx = slotValues.findIndex(
    (v, i) => v === null && slotStatus[i] !== 'correct'
  );

  const tiles = [...normalized].map((char, i) => {
    if (!isLetter(char)) {
      return (
        <span key={i} className="word-separator">
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    }

    const idx = letterIdx++;
    const value = slotValues[idx];
    const locked = slotStatus[idx] === 'correct';
    const feedback = feedbackResult[idx];

    let modifier: string;
    if (locked) {
      modifier = 'word-tile--correct';
    } else if (feedbackVisible && value !== null) {
      if (feedback === 'correct') modifier = 'word-tile--correct';
      else if (feedback === 'wrong-pos') modifier = 'word-tile--wrong-pos';
      else modifier = 'word-tile--wrong';
    } else if (value !== null) {
      modifier = 'word-tile--filled';
    } else if (idx === nextSlotIdx) {
      modifier = 'word-tile--next';
    } else {
      modifier = 'word-tile--empty';
    }

    return (
      <span key={i} className={`word-tile ${modifier}`}>
        {value ?? '_'}
      </span>
    );
  });

  const letterCount = [...normalized].filter(c => isLetter(c)).length;
  const spaceIdx = [...normalized].indexOf(' ');
  const multiLine = spaceIdx !== -1 && letterCount > 8;

  const classes = [
    'word-display',
    rtl ? 'word-display--rtl' : '',
    roundResult === 'correct' ? 'word-display--correct' : '',
    roundResult === 'failed' ? 'word-display--failed' : '',
  ].join(' ');

  if (multiLine) {
    const firstRow = tiles.slice(0, spaceIdx);
    const secondRow = tiles.slice(spaceIdx + 1);
    return (
      <div className={classes + ' word-display--multiline'}>
        <div className="word-display-row">{firstRow}</div>
        <div className="word-display-row">{secondRow}</div>
      </div>
    );
  }

  return <div className={classes}>{tiles}</div>;
}
