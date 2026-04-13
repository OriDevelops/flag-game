import { Translations } from '../i18n';

interface Props {
  continentDone: number;
  continentTotal: number;
  t: Translations;
}

export function ProgressIndicator({ continentDone, continentTotal, t }: Props) {
  const pct = (continentDone / continentTotal) * 100;
  return (
    <div className="progress-indicator">
      <span className="progress-label">
        {continentDone} / {continentTotal} {t.completed}
      </span>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
