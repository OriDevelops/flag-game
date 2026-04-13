import { useEffect } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { Language } from '../types';

interface Props {
  achievementId: string;
  onDone: () => void;
  lang: Language;
}

export function AchievementToast({ achievementId, onDone, lang }: Props) {
  const a = ACHIEVEMENTS.find(x => x.id === achievementId);

  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [achievementId, onDone]);

  if (!a) return null;
  const he = lang === 'he';

  return (
    <div className="achievement-toast" dir={he ? 'rtl' : 'ltr'} onClick={onDone}>
      <span className="achievement-toast-emoji">{a.emoji}</span>
      <div className="achievement-toast-text">
        <span className="achievement-toast-congrats">{he ? '!כל הכבוד' : 'Well done!'}</span>
        <span className="achievement-toast-name">{he ? a.nameHe : a.nameEn}</span>
        <span className="achievement-toast-desc">{he ? a.descHe : a.descEn}</span>
      </div>
    </div>
  );
}
