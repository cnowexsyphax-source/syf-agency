import { useEffect, useRef } from 'react';
import { isTouch, prefersReducedMotion } from '../lib/device';

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const el = dot.current!;
    el.style.display = 'block';
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      // contextual label, e.g. data-cursor-label="Explore" (read on move so canvas hit-areas can update it)
      const l = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor-label]')?.dataset.cursorLabel;
      el.classList.toggle('has-label', !!l);
      if (l && label.current && label.current.textContent !== l) label.current.textContent = l;
    };
    const over = (e: Event) => {
      const t = (e.target as HTMLElement).closest('a,button,[data-cursor]');
      el.classList.toggle('is-hover', !!t);
    };
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); };
  }, []);
  return (
    <div ref={dot} className="cursor-dot" style={{ display: 'none' }} aria-hidden="true">
      <span ref={label} className="cursor-label" />
    </div>
  );
}
