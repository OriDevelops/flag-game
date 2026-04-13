interface Props {
  lives: number;
  maxLives: number;
}

/** Shows heart icons representing remaining lives */
export function LivesDisplay({ lives, maxLives }: Props) {
  return (
    <div className="lives-display" aria-label={`${lives} of ${maxLives} lives remaining`}>
      {Array.from({ length: maxLives }, (_, i) => (
        <span
          key={i}
          className={`heart ${i < lives ? 'heart--full' : 'heart--empty'}`}
          aria-hidden="true"
        >
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}
