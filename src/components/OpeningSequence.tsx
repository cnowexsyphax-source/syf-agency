import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from '../lib/motion';
import { getTier, isTouch } from '../lib/device';
import type { IntroValues } from './three/IntroScene';

const IntroScene = lazy(() => import('./three/IntroScene'));

/** Never let a WebGL problem block the site: the DOM sequence keeps running without the canvas. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Props = {
  /** called when the homepage starts to be revealed (hero entrance can begin) */
  onReveal: () => void;
  /** called when the overlay is gone */
  onDone: () => void;
};

const LOGO = '/logo/syf-mark-white';
const SIGNATURE = 'DIGITAL MARKETING & CREATIVE STUDIO';
const TAGLINE = ['Young vision.', 'Bold ideas.', 'Digital impact.'];

/**
 * Cinematic opening (~4.8 s): the void → energy formation → logo reveal → brand signature → iris into the site.
 */
export default function OpeningSequence({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const v = useRef<IntroValues>({ atmosphere: 0, emerge: 0, recede: 0, exit: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const [tier] = useState(() => getTier());
  const tl = useRef<gsap.core.Timeline | null>(null);
  const exiting = useRef(false);
  const revealed = useRef(false);
  const finished = useRef(false);

  const reveal = () => {
    if (revealed.current) return;
    revealed.current = true;
    onReveal();
  };
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    reveal();
    onDone();
  };

  /** Scene 5 — logo lifts away, light expands, iris opens onto the homepage. */
  const runExit = (fast = false) => {
    if (exiting.current || !root.current) return;
    exiting.current = true;
    tl.current?.kill();
    const el = root.current;
    const k = fast ? 0.6 : 1;
    const r = { v: -16 };
    const setR = () => {
      el.style.setProperty('--r', `${r.v}vmax`);
      flash.current?.style.setProperty('--r', `${r.v}vmax`);
    };
    el.classList.add('is-exiting');
    setR();
    gsap
      .timeline({ onComplete: finish })
      .to('[data-i-logo]', { yPercent: -18, scale: 0.94, opacity: 0, filter: 'blur(6px)', duration: 0.8 * k, ease: 'power3.in' }, 0)
      .to('[data-i-text]', { opacity: 0, y: -12, duration: 0.5 * k, ease: 'power2.in', stagger: 0.04 }, 0)
      .to(v.current, { exit: 1, recede: 1, duration: 1.15 * k, ease: 'power3.in' }, 0.05)
      .to('[data-i-core]', { scale: 2.6, opacity: 1, duration: 0.9 * k, ease: 'power2.in' }, 0)
      .add(reveal, 0.35 * k)
      .to(r, { v: 160, duration: 1.05 * k, ease: 'power3.inOut', onUpdate: setR }, 0.35 * k)
      .to(flash.current, { opacity: 0, duration: 0.4 * k }, 1.0 * k);
  };

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => runExit() });
      tl.current = t;
      // SCENE 1 — the void: midnight atmosphere, a light emerges, particles drift in
      t.fromTo('[data-i-atmo]', { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .fromTo('[data-i-core]', { opacity: 0, scale: 0.25 }, { opacity: 0.9, scale: 1, duration: 1.8, ease: 'power3.out' }, 0.15)
        .to(v.current, { atmosphere: 1, duration: 1.6, ease: 'power2.out' }, 0.1)
        .fromTo('[data-i-rays]', { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.4)
        // SCENE 2 — energy formation: the chrome sculpture forms and turns
        .to(v.current, { emerge: 1, duration: 1.9 }, 0.45)
        // SCENE 3 — logo reveal: from darkness, metallic edges, light sweep, settles large
        .to(v.current, { recede: 1, duration: 1.1, ease: 'power2.inOut' }, 1.55)
        .fromTo(
          '[data-i-logo]',
          { opacity: 0, scale: 0.84, filter: 'blur(14px) brightness(0.2)' },
          { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', duration: 1.3 },
          1.6,
        )
        .fromTo(el, { '--glow': 0 }, { '--glow': 1, duration: 0.8, ease: 'power2.out' }, 1.8)
        .fromTo(el, { '--sweep': '140%' }, { '--sweep': '-40%', duration: 1.1, ease: 'power2.inOut' }, 2.05)
        .to('[data-i-metal]', { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 2.55)
        .to(el, { '--glow': 0.35, duration: 0.8, ease: 'power2.inOut' }, 2.7)
        // SCENE 4 — brand signature with a tracking animation
        .fromTo('[data-i-sig]', { opacity: 0, letterSpacing: '0.75em' }, { opacity: 1, letterSpacing: '0.34em', duration: 1.2, ease: 'power3.out' }, 2.55)
        .fromTo('[data-i-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 2.7)
        .fromTo('[data-i-word]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 2.95)
        .to({}, { duration: 0.35 }); // short hold before the transition (~3.95 s) → exit ≈ 4.9 s total
      // lightweight CSS sculpture when WebGL is not used
      if (el.querySelector('[data-i-ring]'))
        t.fromTo('[data-i-ring]', { opacity: 0, scale: 0.6, rotate: -40 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.8 }, 0.5).to('[data-i-ring]', { scale: 1.25, opacity: 0.45, duration: 1.1, ease: 'power2.inOut' }, 1.55);
    }, el);

    // subtle mouse parallax (DOM layers + camera)
    const qx = gsap.quickTo('[data-i-logo-wrap]', 'x', { duration: 1.2, ease: 'power3.out' });
    const qy = gsap.quickTo('[data-i-logo-wrap]', 'y', { duration: 1.2, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1;
      qx(pointer.current.x * -10);
      qy(pointer.current.y * -6);
    };
    if (!isTouch()) window.addEventListener('pointermove', onMove, { passive: true });
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || e.key === 'Enter') && runExit(true);
    window.addEventListener('keydown', onKey);
    // safety net: never keep the site locked behind the intro
    const safety = window.setTimeout(finish, 9000);
    return () => {
      ctx.revert();
      tl.current?.kill();
      clearTimeout(safety);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>('[data-i-skip]')?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <div ref={root} className="intro" role="dialog" aria-modal="true" aria-label="Introduction SYF AGENCY">
        {/* layered atmosphere */}
        <div className="intro-layer intro-atmo" data-i-atmo aria-hidden="true" />
        <div className="intro-layer intro-rays" data-i-rays aria-hidden="true" />
        <div className="intro-core" data-i-core aria-hidden="true" />
        {tier !== 'none' ? (
          <SceneBoundary>
            <Suspense fallback={null}>
              <IntroScene v={v} pointer={pointer} quality={tier === 'high' ? 'high' : 'mid'} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <div className="intro-ring" data-i-ring aria-hidden="true" />
        )}
        <div className="intro-layer intro-vignette" aria-hidden="true" />

        {/* logo + signature */}
        <div className="intro-content">
          <div data-i-logo-wrap className="flex flex-col items-center">
            <div className="intro-logo" data-i-logo>
              <picture>
                <source srcSet={`${LOGO}.webp`} type="image/webp" />
                <img src={`${LOGO}.png`} width={985} height={399} alt="SYF AGENCY" draggable={false} />
              </picture>
              <span className="intro-logo-metal" data-i-metal aria-hidden="true" />
              <span className="intro-logo-sweep" aria-hidden="true" />
            </div>
            <p className="intro-sig" data-i-sig data-i-text>
              {SIGNATURE}
            </p>
            <span className="intro-rule" data-i-rule data-i-text aria-hidden="true" />
            <p className="intro-tagline" data-i-text>
              {TAGLINE.map((w) => (
                <span key={w} data-i-word className="inline-block">
                  {w}&nbsp;
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="intro-footer" data-i-text>
          <span className="eyebrow text-silver/60">Algiers — 36°45′N · 3°03′E</span>
          <button type="button" data-i-skip onClick={() => runExit(true)} className="intro-skip">
            Skip intro <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div ref={flash} className="intro-flash" aria-hidden="true" />
    </>
  );
}
