import { useLayoutEffect, useRef, type ReactNode, type ElementType, createElement } from 'react';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** animate `.split-inner` children (for SplitText) instead of the element itself */
  split?: boolean;
  delay?: number;
  y?: number;
  stagger?: number;
  start?: string;
};

export default function Reveal({ children, as = 'div', className = '', split, delay = 0, y = 40, stagger = 0.06, start = 'top 85%' }: Props) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const targets = split ? el.querySelectorAll('.split-inner') : el;
      gsap.from(targets, {
        yPercent: split ? 110 : 0,
        y: split ? 0 : y,
        opacity: split ? 1 : 0,
        duration: split ? 1.1 : 1,
        ease: 'expo.out',
        delay,
        stagger: split ? stagger : 0,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [split, delay, y, stagger, start]);
  return createElement(as, { ref, className }, children);
}
