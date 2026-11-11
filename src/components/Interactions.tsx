import { useEffect } from 'react';
import { gsap } from '../lib/motion';
import { isTouch, prefersReducedMotion } from '../lib/device';

/**
 * Global, delegated micro-interactions (desktop pointer only, off with reduced motion):
 *  - magnetic buttons: `.btn` and `[data-magnetic]`
 *  - 3D tilt + light-follow highlight: `[data-tilt]`
 */
export default function Interactions() {
  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const release = (el: HTMLElement | null, kind: 'magnet' | 'tilt') => {
      if (!el) return;
      if (kind === 'magnet') gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      else gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' });
      if (kind === 'tilt') el.style.removeProperty('--tilt-o');
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const m = target.closest<HTMLElement>('.btn, [data-magnetic]');
      if (m !== magnet) {
        release(magnet, 'magnet');
        magnet = m;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(m, { x: dx * 0.22, y: dy * 0.3, duration: 0.5, ease: 'power3.out' });
      }

      const t = target.closest<HTMLElement>('[data-tilt]');
      if (t !== tilt) {
        release(tilt, 'tilt');
        tilt = t;
      }
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const max = Number(t.dataset.tilt) || 6;
        gsap.to(t, { rotateY: (px - 0.5) * max, rotateX: (0.5 - py) * max, transformPerspective: 1100, duration: 0.6, ease: 'power3.out' });
        t.style.setProperty('--mx', `${px * 100}%`);
        t.style.setProperty('--my', `${py * 100}%`);
        t.style.setProperty('--tilt-o', '1');
      }
    };
    const onLeave = () => {
      release(magnet, 'magnet');
      release(tilt, 'tilt');
      magnet = tilt = null;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return null;
}
