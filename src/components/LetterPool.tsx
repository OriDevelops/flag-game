import { LetterTile } from '../types';

interface Props {
  tiles: LetterTile[];
  onSelect: (tileId: string) => void;
  disabled: boolean;
}

/**
 * Renders the pool of letter tiles.
 *
 * Tile appearances by status:
 * - 'available'   → normal key style, clickable
 * - 'hint-yellow' → yellow background, clickable (letter exists but placed in wrong position)
 * - 'hint-red'    → red background, NOT clickable (letter not in word)
 * - 'placed'      → invisible placeholder (tile is in a slot)
 * - 'locked'      → invisible placeholder (tile permanently consumed)
 */
export function LetterPool({ tiles, onSelect, disabled }: Props) {
  return (
    <div className="letter-pool" role="group" aria-label="Letter tiles">
      {tiles.map(tile => {
        const clickable = !disabled && (tile.status === 'available' || tile.status === 'hint-yellow');
        const invisible = tile.status === 'placed' || tile.status === 'locked';

        return (
          <button
            key={tile.id}
            className={`letter-tile letter-tile--${tile.status}`}
            onClick={() => clickable && onSelect(tile.id)}
            disabled={!clickable}
            aria-label={`Letter ${tile.letter}`}
            // Keep the slot in the layout so tiles don't jump around
            style={invisible ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
          >
            {tile.letter}
          </button>
        );
      })}
    </div>
  );
}
