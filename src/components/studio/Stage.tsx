import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { renderScene, type RenderAssets } from '../../studio/render';
import {
  elementLabel,
  replaceElement,
  sceneFormat,
  type Scene,
  type SceneElement,
} from '../../studio/scene';
import type { MeasureText } from '../../studio/text';
import {
  handlesFor,
  moveElement,
  nudgeDistance,
  resizeElement,
  type HandleId,
} from '../../studio/transform';

interface StageProps {
  scene: Scene;
  assets: RenderAssets;
  measure: MeasureText;
  fontsReady: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCommit: (next: Scene, key?: string) => void;
  onDraft: (next: Scene | null) => void;
  onRemove: (id: string) => void;
}

interface DragState {
  mode: 'move' | HandleId;
  pointerId: number;
  startX: number;
  startY: number;
  origin: SceneElement;
  base: Scene;
  latest: Scene | null;
}

const HANDLE_POSITIONS: Record<HandleId, string> = {
  'top-left': 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
  'top-right': 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
  'bottom-left': 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
  'bottom-right': 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
  left: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  right: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
};

const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export const Stage = ({
  scene,
  assets,
  measure,
  fontsReady,
  selectedId,
  onSelect,
  onCommit,
  onDraft,
  onRemove,
}: StageProps) => {
  const format = sceneFormat(scene);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hintId = useId();
  const [available, setAvailable] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => setAvailable({ width: frame.clientWidth, height: frame.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const displayScale =
    available.width && available.height
      ? Math.min(available.width / format.width, available.height / format.height)
      : 0;
  const displayWidth = format.width * displayScale;
  const displayHeight = format.height * displayScale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !displayScale) return;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(displayWidth * pixelRatio));
    canvas.height = Math.max(1, Math.round(displayHeight * pixelRatio));
    const context = canvas.getContext('2d');
    if (!context) return;
    renderScene(context, scene, assets, { measure, scale: displayScale * pixelRatio });
  }, [scene, assets, measure, displayScale, displayWidth, displayHeight, fontsReady]);

  const startDrag = (
    event: PointerEvent<HTMLElement>,
    element: SceneElement,
    mode: DragState['mode'],
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onSelect(element.id);
    itemRefs.current[element.id]?.focus({ preventScroll: true });
    if (element.locked) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: element,
      base: scene,
      latest: null,
    };
  };

  const continueDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !displayScale) return;
    const deltaX = (event.clientX - drag.startX) / displayScale;
    const deltaY = (event.clientY - drag.startY) / displayScale;
    const next =
      drag.mode === 'move'
        ? moveElement(drag.origin, deltaX, deltaY, format)
        : resizeElement(drag.origin, drag.mode, deltaX, deltaY, format, measure);
    drag.latest = replaceElement(drag.base, next);
    onDraft(drag.latest);
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.latest) onCommit(drag.latest);
    onDraft(null);
  };

  const handleItemKeyDown = (event: KeyboardEvent<HTMLDivElement>, element: SceneElement) => {
    const arrow = ARROW_DELTAS[event.key];
    if (arrow) {
      event.preventDefault();
      if (element.locked) return;
      const distance = nudgeDistance(format, event.shiftKey);
      const moved = moveElement(element, arrow[0] * distance, arrow[1] * distance, format);
      onCommit(replaceElement(scene, moved), `nudge-${element.id}`);
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if (!element.locked) onRemove(element.id);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onSelect(null);
    }
  };

  const visible = scene.elements.filter((element) => !element.hidden);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div
        ref={frameRef}
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onSelect(null);
        }}
      >
        <div
          role="group"
          aria-label={`Canvas, ${format.name}, ${format.width} by ${format.height} pixels`}
          aria-describedby={hintId}
          className="relative shadow-[var(--shadow-float)]"
          style={{ width: displayWidth, height: displayHeight }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) onSelect(null);
          }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 block h-full w-full"
            data-studio-canvas
          />
          {visible.map((element) => {
            const isSelected = element.id === selectedId;
            return (
              <div
                key={element.id}
                ref={(node) => {
                  itemRefs.current[element.id] = node;
                }}
                role="button"
                tabIndex={0}
                aria-label={`${elementLabel(element)}${element.locked ? ', locked' : ''}`}
                aria-pressed={isSelected}
                data-element-id={element.id}
                className={`absolute touch-none select-none outline-none focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-color)] ${element.locked ? 'cursor-default' : 'cursor-move'}`}
                style={{
                  left: element.left * displayScale,
                  top: element.top * displayScale,
                  width: element.width * displayScale,
                  height: element.height * displayScale,
                  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                }}
                onFocus={() => onSelect(element.id)}
                onPointerDown={(event) => startDrag(event, element, 'move')}
                onPointerMove={continueDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={(event) => handleItemKeyDown(event, element)}
              >
                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-px border-2 border-solid border-[var(--tint)] shadow-[0_0_0_1px_var(--bg)]"
                  />
                ) : null}
                {isSelected && !element.locked
                  ? handlesFor(element).map((handle) => (
                      <span
                        key={handle}
                        aria-hidden="true"
                        data-handle={handle}
                        className={`absolute h-3 w-3 touch-none rounded-[var(--corner-sm)] border-2 border-solid border-[var(--tint)] bg-[var(--bg)] ${HANDLE_POSITIONS[handle]}`}
                        onPointerDown={(event) => startDrag(event, element, handle)}
                        onPointerMove={continueDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                      />
                    ))
                  : null}
              </div>
            );
          })}
        </div>
      </div>
      <p
        id={hintId}
        className="m-0 text-center text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]"
      >
        Click or tab to an item to select it. Drag to move, or use the arrow keys (Shift moves
        further). Delete removes it.
      </p>
    </div>
  );
};
