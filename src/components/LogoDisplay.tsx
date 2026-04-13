import { useState } from 'react';
import { Company } from '../types';

interface Props {
  company: Company;
  revealed: boolean;
}

function getSources(domain: string): string[] {
  return [
    `https://cdn.brandfetch.io/${domain}/w/400/h/400/logo`,
    `https://logo.clearbit.com/${domain}?size=200`,
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`,
  ];
}

export function LogoDisplay({ company, revealed }: Props) {
  const [srcIndex, setSrcIndex] = useState(0);

  const sources = getSources(company.domain);
  const allFailed = srcIndex >= sources.length;
  const src = allFailed ? undefined : sources[srcIndex];
  const initial = company.name.charAt(0).toUpperCase();

  return (
    <div className="flag-container">
      <div className="logo-wrapper">
        {allFailed ? (
          <div className="company-logo-fallback">
            <span className="company-logo-initial">{initial}</span>
          </div>
        ) : (
          <img
            key={src}
            className="company-logo"
            src={src}
            alt={revealed ? company.name : '?'}
            onError={() => setSrcIndex(i => i + 1)}
          />
        )}

        {!revealed && !allFailed && (
          <div className="logo-blur-half" />
        )}

        {revealed && (
          <div className="flag-reveal-overlay">
            <span className="flag-reveal-name">{company.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
