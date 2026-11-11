import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import type { Phase } from '../lib/experience';
import { ArrowUpRight } from './Icons';

type Props = {
  url: string;
  title: string;
  embeddable: boolean;
  phase: Phase;
  /** '3d': the WebGL camera drives the iframe geometry. 'sheet': CSS expansion (mobile / no WebGL). */
  mode: '3d' | 'sheet';
  mounted: boolean;
  wrapRef: RefObject<HTMLDivElement>;
  loadedRef: MutableRefObject<boolean>;
  onLoadedChange: (loaded: boolean) => void;
  originRect: () => DOMRect | null;
  onEntered: () => void;
  onExited: () => void;
  onExit: () => void;
};

const LOAD_TIMEOUT = 15000;

/**
 * Full-viewport live website layer: iframe, loading state, error handling,
 * "Exit experience" control and Escape support.
 */
export default function SiteExperience(p: Props) {
  const { phase, mode, mounted, wrapRef, loadedRef } = p;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const exitBtn = useRef<HTMLButtonElement>(null);
  const iframeSrc = p.url;

  // reset load state whenever the iframe (re)mounts
  useEffect(() => {
    loadedRef.current = false;
    setLoaded(false);
    setFailed(false);
    p.onLoadedChange(false);
    if (!mounted || !p.embeddable) return;
    if (!navigator.onLine) {
      setFailed(true);
      return;
    }
    const t = window.setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, LOAD_TIMEOUT);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, attempt]);

  const onLoad = () => {
    loadedRef.current = true;
    setLoaded(true);
    setFailed(false);
    p.onLoadedChange(true);
  };

  // Page chrome while the experience is open: hide nav/cursor, lock page scroll.
  useEffect(() => {
    const open = phase !== 'idle';
    document.documentElement.classList.toggle('is-experience', open);
    return () => document.documentElement.classList.remove('is-experience');
  }, [phase]);

  // Escape to exit (works while focus is in the portfolio; inside the cross-origin site the button is used).
  useEffect(() => {
    if (phase !== 'inside') return;
    exitBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && p.onExit();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Iframe layer state (3D mode geometry is written by the WebGL rig during transitions).
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (phase === 'idle') {
      el.style.transition = '';
      el.style.opacity = '0';
      el.style.transform = '';
      el.style.clipPath = '';
    }
    if (phase === 'inside') {
      el.style.transform = 'none';
      el.style.clipPath = '';
      el.style.transition = 'opacity .5s ease';
      el.style.opacity = mode === 'sheet' || loaded ? '1' : '0';
    }
  }, [phase, loaded, mode, wrapRef]);

  // Sheet mode (mobile / static fallback): expand from the showcase to full screen and back.
  useLayoutEffect(() => {
    if (mode !== 'sheet' || (phase !== 'entering' && phase !== 'exiting')) return;
    const el = wrapRef.current!;
    const r = p.originRect();
    const W = window.innerWidth, H = window.innerHeight;
    const from = r
      ? `inset(${Math.max(0, r.top)}px ${Math.max(0, W - r.right)}px ${Math.max(0, H - r.bottom)}px ${Math.max(0, r.left)}px round 24px)`
      : 'inset(40% 10% 40% 10% round 24px)';
    const full = 'inset(0px 0px 0px 0px round 0px)';
    const d = prefersReducedMotion() ? 0.01 : 0.85;
    el.style.transition = '';
    el.style.transform = 'none';
    const tw =
      phase === 'entering'
        ? gsap.fromTo(el, { clipPath: from, opacity: 1 }, { clipPath: full, duration: d, ease: 'expo.inOut', onComplete: p.onEntered })
        : gsap.fromTo(el, { clipPath: full }, { clipPath: from, opacity: 0, duration: d * 0.9, ease: 'expo.inOut', onComplete: p.onExited });
    return () => {
      tw.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode]);

  const busy = phase === 'entering' || phase === 'exiting';
  const showLoader = p.embeddable && mounted && !loaded && !failed && (phase === 'inside' || (mode === 'sheet' && phase === 'entering'));
  const showError = p.embeddable && failed && phase === 'inside';
  const showExternal = !p.embeddable && phase === 'inside';
  const host = new URL(p.url).host;

  return createPortal(
    <>
      {/* Live website layer */}
      <div
        ref={wrapRef}
        className={`fixed left-0 top-0 z-[75] h-[100vh] w-[100vw] origin-top-left opacity-0 ${mode === 'sheet' ? 'bg-ink' : ''} ${
          phase === 'inside' ? '' : 'pointer-events-none'
        }`}
        style={{ visibility: phase === 'idle' ? 'hidden' : 'visible' }}
        aria-hidden={phase !== 'inside'}
      >
        {mounted && p.embeddable && (
          <iframe
            key={attempt}
            src={iframeSrc}
            title={`${p.title} — site en direct`}
            onLoad={onLoad}
            className={`block w-full border-0 bg-transparent transition-opacity duration-500 ${mode === 'sheet' ? 'absolute inset-x-0 bottom-0 top-[56px] h-[calc(100%-56px)]' : 'h-full'} ${loaded ? 'opacity-100' : 'opacity-0'}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="fullscreen"
            tabIndex={phase === 'inside' ? 0 : -1}
          />
        )}
      </div>

      {/* Blocks accidental clicks during transitions */}
      {busy && <div className="fixed inset-0 z-[88] cursor-progress" aria-hidden="true" />}

      {/* Controls */}
      <div
        className={`fixed inset-x-0 z-[86] flex items-center justify-between gap-3 transition-[opacity,transform] duration-500 ${
          mode === 'sheet' ? 'top-0 h-[56px] border-b border-white/10 bg-ink px-3' : `pointer-events-none bottom-0 p-5 ${phase === 'inside' ? '[&>*]:pointer-events-auto' : ''}`
        } ${phase === 'inside' ? 'translate-y-0 opacity-100' : `pointer-events-none opacity-0 ${mode === 'sheet' ? '-translate-y-4' : 'translate-y-4'}`}`}
      >
        <button
          ref={exitBtn}
          type="button"
          onClick={p.onExit}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink/80 px-4 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(0,0,0,.4)] backdrop-blur-md transition-colors hover:bg-blue sm:px-5"
          tabIndex={phase === 'inside' ? 0 : -1}
        >
          <span aria-hidden="true">←</span> Exit experience
        </button>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink/80 px-4 py-2.5 text-[12px] text-white/80 shadow-[0_10px_30px_rgba(0,0,0,.4)] backdrop-blur-md transition-colors hover:text-white"
          tabIndex={phase === 'inside' ? 0 : -1}
        >
          <span className="hidden sm:inline">{host}</span>
          <span className="sm:hidden">Nouvel onglet</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span className="sr-only">(ouvrir dans un nouvel onglet)</span>
        </a>
      </div>

      {/* Loading */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[86] -translate-x-1/2 transition-opacity duration-300 ${showLoader ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {showLoader && (
          <span className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-ink/85 px-5 py-3 text-[13px] text-white/85 backdrop-blur-md">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-blue-bright" aria-hidden="true" />
            Chargement de {p.title}…
          </span>
        )}
      </div>

      {/* Error / not embeddable */}
      {(showError || showExternal) && (
        <div className="fixed inset-0 z-[85] grid place-items-center bg-ink/70 p-6 backdrop-blur-sm">
          <div role="alert" className="max-w-md rounded-3xl border border-white/10 bg-night p-7 text-center shadow-2xl">
            <p className="eyebrow text-blue-bright">{p.title}</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-tight">
              {showExternal ? 'Le site s’est ouvert dans un nouvel onglet.' : 'Le site ne répond pas pour le moment.'}
            </p>
            <p className="mt-3 text-sm text-white/60">
              {showExternal
                ? 'Ce site ne peut pas être affiché à l’intérieur du portfolio.'
                : 'Vérifiez votre connexion ou ouvrez-le directement dans un nouvel onglet.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {showError && (
                <button type="button" className="btn btn-ghost !py-3 !text-[11px]" onClick={() => setAttempt((a) => a + 1)}>
                  Réessayer
                </button>
              )}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary !py-3 !text-[11px]">
                Ouvrir le site <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
