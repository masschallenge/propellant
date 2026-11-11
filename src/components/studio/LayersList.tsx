import { Button } from '@masschallenge/propellant-web';
import { useId } from 'react';
import type { KeyboardEvent } from 'react';
import { elementLabel, type LayerDirection, type Scene } from '../../studio/scene';

interface LayersListProps {
  scene: Scene;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, direction: LayerDirection) => void;
  onToggle: (id: string, property: 'hidden' | 'locked') => void;
  onRemove: (id: string) => void;
}

export const LayersList = ({
  scene,
  selectedId,
  onSelect,
  onMove,
  onToggle,
  onRemove,
}: LayersListProps) => {
  const listId = useId();
  const layers = [...scene.elements].reverse();
  const selectedIndex = layers.findIndex((element) => element.id === selectedId);
  const selected = selectedIndex >= 0 ? layers[selectedIndex] : null;
  const optionId = (id: string) => `${listId}-${id}`;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!layers.length) return;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(selectedIndex + 1, layers.length - 1),
      ArrowUp: Math.max(selectedIndex - 1, 0),
      Home: 0,
      End: layers.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      const target = selectedIndex < 0 ? 0 : moves[event.key];
      if (event.altKey && selected) {
        if (event.key === 'ArrowUp') onMove(selected.id, 'up');
        if (event.key === 'ArrowDown') onMove(selected.id, 'down');
        return;
      }
      onSelect(layers[target].id);
      return;
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && selected && !selected.locked) {
      event.preventDefault();
      onRemove(selected.id);
    }
  };

  if (!layers.length) {
    return (
      <p className="m-0 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
        Nothing on the canvas yet. Add type, a logo, a photo or a shape.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="listbox"
        aria-label="Layers, top first"
        tabIndex={0}
        aria-activedescendant={selected ? optionId(selected.id) : undefined}
        onKeyDown={handleKeyDown}
        className="flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-[var(--corner-md)] bg-[var(--bg-secondary)] p-1 outline-none focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-[var(--focus-color)]"
      >
        {layers.map((element) => {
          const isSelected = element.id === selectedId;
          const states = [element.hidden ? 'Hidden' : null, element.locked ? 'Locked' : null]
            .filter(Boolean)
            .join(', ');
          return (
            <div
              key={element.id}
              id={optionId(element.id)}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(element.id)}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-[var(--corner-sm)] px-2 py-1.5 text-[length:var(--type-subheadline-size)] ${isSelected ? 'bg-[var(--tint-fill)] font-semibold text-[var(--label)]' : 'text-[var(--label)] hover:bg-[var(--fill-tertiary)]'}`}
            >
              <span
                className={`truncate ${element.hidden ? 'italic text-[var(--label-secondary)]' : ''}`}
              >
                {elementLabel(element)}
              </span>
              {states ? (
                <span className="shrink-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
                  {states}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
        Arrow keys choose a layer. Alt and an arrow key moves it.
      </p>
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Selected layer">
        <Button
          size="sm"
          variant="gray"
          disabled={!selected || selectedIndex === 0}
          onClick={() => selected && onMove(selected.id, 'up')}
        >
          Bring forward
        </Button>
        <Button
          size="sm"
          variant="gray"
          disabled={!selected || selectedIndex === layers.length - 1}
          onClick={() => selected && onMove(selected.id, 'down')}
        >
          Send backward
        </Button>
        <Button
          size="sm"
          variant="gray"
          disabled={!selected}
          onClick={() => selected && onToggle(selected.id, 'hidden')}
        >
          {selected?.hidden ? 'Show' : 'Hide'}
        </Button>
        <Button
          size="sm"
          variant="gray"
          disabled={!selected}
          onClick={() => selected && onToggle(selected.id, 'locked')}
        >
          {selected?.locked ? 'Unlock' : 'Lock'}
        </Button>
      </div>
    </div>
  );
};
