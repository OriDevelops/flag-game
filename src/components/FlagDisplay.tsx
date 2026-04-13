import { Country, Language } from '../types';
import { getCountryName } from '../utils/gameUtils';

interface Props {
  country: Country;
  revealed: boolean; // show country name overlay after round
  lang?: Language;
}

/** Displays the flag image for the current country */
export function FlagDisplay({ country, revealed, lang = 'en' }: Props) {
  const displayName = getCountryName(country, lang);
  return (
    <div className="flag-container">
      <img
        className="flag-image"
        src={`https://flagcdn.com/w320/${country.code}.png`}
        srcSet={`https://flagcdn.com/w640/${country.code}.png 2x`}
        alt={revealed ? `Flag of ${country.name}` : 'Country flag — guess the name!'}
        loading="eager"
      />
      {revealed && (
        <div className="flag-revealed-overlay">
          <span>{displayName}</span>
        </div>
      )}
    </div>
  );
}
