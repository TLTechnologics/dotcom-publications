import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';

export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

const control = 'input, textarea, select, button, a, [contenteditable="true"], [data-native-scroll]';
export function useBookInput(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  step: (direction: number) => void,
  scrub?: (delta: number) => boolean,
) {
  const handlers = useRef({ step, scrub });
  handlers.current = { step, scrub };
  useEffect(() => {
    const area = ref.current;
    if (!area || !enabled) return;
    let total = 0,
      last = 0,
      used = false,
      scrubbing = false,
      start: { x: number; y: number; id: number } | null = null;
    const protectedTarget = (el: EventTarget | null) => el instanceof Element && !!el.closest(control);
    const editor = (target: EventTarget | null) =>
      target instanceof Element &&
      !!target.closest('form,input,textarea,select,[contenteditable="true"],[data-native-scroll]');
    let blockClickUntil = 0;
    let touchTurn: ReturnType<typeof setTimeout> | undefined;
    const click = (event: MouseEvent) => {
      if (performance.now() < blockClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const selecting = () => !!window.getSelection()?.toString();
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || editor(event.target) || selecting()) return;
      event.preventDefault();
      const delta =
        (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
      const now = performance.now();
      if (now - last > 175 || Math.sign(delta) !== Math.sign(total)) {
        total = 0;
        used = false;
        scrubbing = false;
      }
      last = now;
      total += delta;
      if (used) return;
      if (handlers.current.scrub?.(delta)) {
        scrubbing = true;
        return;
      }
      if (!scrubbing && Math.abs(total) >= 40) {
        used = true;
        handlers.current.step(Math.sign(delta));
      }
    };
    const key = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        editor(event.target) ||
        selecting()
      )
        return;
      const direction = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)
        ? 1
        : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)
          ? -1
          : 0;
      if (direction) {
        event.preventDefault();
        handlers.current.step(direction);
      }
    };
    const down = (event: PointerEvent) => {
      const touchBook =
        event.pointerType === 'touch' &&
        event.target instanceof Element &&
        !!event.target.closest('.tb-entry');
      if (!event.isPrimary || event.button !== 0 || (protectedTarget(event.target) && !touchBook)) return;
      const bounds = area.getBoundingClientRect();
      if (
        event.pointerType === 'mouse' &&
        Math.min(event.clientX - bounds.left, bounds.right - event.clientX) >
          Math.max(60, bounds.width * 0.12)
      )
        return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      if (event.pointerType === 'mouse') {
        event.preventDefault();
        area.setPointerCapture(event.pointerId);
      }
    };
    const touchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (
        start &&
        event.touches.length === 1 &&
        Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 14 &&
        !selecting() &&
        event.cancelable
      )
        event.preventDefault();
    };
    const up = (event: PointerEvent) => {
      if (!start || start.id !== event.pointerId) return;
      const dx = start.x - event.clientX,
        dy = start.y - event.clientY;
      start = null;
      const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      if (Math.abs(delta) > 38 && !selecting()) {
        blockClickUntil = performance.now() + 240;
        // Keep the tapped node mounted until the native touch sequence finishes.
        if (event.pointerType === 'touch')
          touchTurn = setTimeout(() => handlers.current.step(Math.sign(delta)), 20);
        else handlers.current.step(Math.sign(delta));
      }
    };
    const cancel = () => {
      start = null;
    };
    area.addEventListener('wheel', wheel, { passive: false });
    area.addEventListener('touchmove', touchMove, { passive: false });
    area.addEventListener('click', click, true);
    area.addEventListener('pointerdown', down);
    area.addEventListener('pointerup', up);
    area.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', key);
    return () => {
      clearTimeout(touchTurn);
      area.removeEventListener('wheel', wheel);
      area.removeEventListener('touchmove', touchMove);
      area.removeEventListener('click', click, true);
      area.removeEventListener('pointerdown', down);
      area.removeEventListener('pointerup', up);
      area.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', key);
    };
  }, [ref, enabled]);
}

export interface Turn {
  from: number;
  to: number;
  duration: number;
  serial: number;
}
export function useTurns(initial: number, stride: number, last: number, reduced: boolean) {
  const [at, setAt] = useState(initial);
  const [turn, setTurn] = useState<Turn | null>(null);
  const position = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const serial = useRef(0);
  const busy = useRef(false);
  const stop = () => {
    clearTimeout(timer.current);
    serial.current++;
    busy.current = false;
    setTurn(null);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const align = (value: number) => Math.floor(Math.min(last, Math.max(0, value)) / stride) * stride;
  const travel = (target: number, fast = false, instant = false) => {
    const dest = align(target);
    if (!fast && !instant && busy.current) return false;
    stop();
    const token = serial.current;
    const move = (next: number) => {
      position.current = next;
      setAt(next);
    };
    if (instant || reduced || position.current === dest) {
      move(dest);
      return true;
    }
    const direction = Math.sign(dest - position.current);
    const count = Math.max(1, Math.min(5, Math.ceil(Math.abs(dest - position.current) / stride)));
    const distance = Math.max(stride, Math.ceil(Math.abs(dest - position.current) / count / stride) * stride);
    busy.current = true;
    const nextTurn = () => {
      if (token !== serial.current) return;
      const from = position.current;
      if (from === dest) {
        setTurn(null);
        busy.current = false;
        return;
      }
      const to = align(direction > 0 ? Math.min(dest, from + distance) : Math.max(dest, from - distance));
      const duration = fast ? 138 : 730;
      setTurn({ from, to, duration, serial: ++sequence });
      move(to);
      timer.current = setTimeout(nextTurn, duration);
    };
    nextTurn();
    return true;
  };
  return { at, position, busy, turn, travel, stop };
}
let sequence = 0;

// Each strip bends slightly farther than its neighbour. Both printed faces move with the paper.
export function Leaves({
  at,
  single,
  turn,
  render,
}: {
  at: number;
  single: boolean;
  turn: Turn | null;
  render: (page: number) => ReactNode;
}) {
  const leaf = (n: number, side: string) => <div className={'tb-leaf ' + side}>{render(n)}</div>;
  const forward = !turn || turn.to > turn.from;
  // Attach each panel to the edge of its neighbour, so the printed sheet remains continuous as it curls.
  const segment = (i: number): ReactNode => {
    if (!turn || i === 4) return null;
    const front = forward ? i : 3 - i;
    return (
      <div className={'tb-segment' + (i === 0 ? ' first' : '')} style={{ '--i': i } as CSSProperties}>
        <div className="tb-slice front">
          <div className="tb-printed" style={{ left: -100 * front + '%' }}>
            {render(turn.from + (!single && forward ? 1 : 0))}
          </div>
        </div>
        {!single && (
          <div className="tb-slice back">
            <div className="tb-printed" style={{ left: -100 * (3 - front) + '%' }}>
              {render(turn.to + (!forward ? 1 : 0))}
            </div>
          </div>
        )}
        {segment(i + 1)}
      </div>
    );
  };
  return (
    <div className={'tb-leaves' + (single ? ' single' : '')}>
      {leaf(turn && !single && forward ? turn.from : at, 'left')}
      {!single && leaf(turn && !forward ? turn.from + 1 : at + 1, 'right')}
      {turn && (
        <div
          key={turn.serial}
          aria-hidden="true"
          inert
          className={'tb-flip ' + (forward ? 'forward' : 'backward')}
          style={{ '--turn-time': turn.duration + 'ms' } as CSSProperties}
        >
          <div className="tb-sheet">{segment(0)}</div>
        </div>
      )}
    </div>
  );
}

export function ProductCover({ src, title }: { src?: string | null; title: string }) {
  const [bad, setBad] = useState('');
  return src && bad !== src ? (
    <img
      className="tb-cover-image"
      src={src}
      alt={title + ' cover'}
      onError={() => setBad(src)}
      draggable={false}
    />
  ) : (
    <div className="tb-cover-placeholder" aria-label={'Cover unavailable for ' + title}>
      <span>{title}</span>
    </div>
  );
}
