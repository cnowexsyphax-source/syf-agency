import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import OpeningSequence from './components/OpeningSequence';
import Interactions from './components/Interactions';
import { prefersReducedMotion } from './lib/device';
import { INTRO_KEY, REPLAY_EVENT } from './lib/intro';
import Cursor from './components/Cursor';
import CookieConsent from './components/CookieConsent';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import Intro from './sections/Intro';
import Services from './sections/Services';
import Work from './sections/Work';
import About from './sections/About';
import Founder from './sections/Founder';
import Journey from './sections/Journey';
import Why from './sections/Why';
import Contact from './sections/Contact';
import { initSmoothScroll, scrollToTarget, scrollToTop, stopScroll, ScrollTrigger } from './lib/motion';

/** The cinematic intro plays once per session (replayable from the footer), never with reduced motion. */
function shouldPlayIntro() {
  if (prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState<number | null>(() => (shouldPlayIntro() ? 1 : null));

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (intro) window.scrollTo(0, 0);
    initSmoothScroll();
    if (intro) stopScroll(true);
    else requestAnimationFrame(() => onRevealed());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRevealed = useCallback(() => {
    stopScroll(false);
    setReady(true);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (location.hash && document.querySelector(location.hash)) scrollToTarget(location.hash);
    });
  }, []);

  const onIntroDone = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* storage unavailable */
    }
    setIntro(null);
  }, []);

  // Replay from the footer
  useEffect(() => {
    const replay = () => {
      if (prefersReducedMotion()) return;
      scrollToTop();
      stopScroll(true);
      setIntro((n) => (n ?? 0) + 1);
    };
    window.addEventListener(REPLAY_EVENT, replay);
    return () => window.removeEventListener(REPLAY_EVENT, replay);
  }, []);

  // Recalculate pinned sections once fonts/images settle
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <>
      {intro !== null && <OpeningSequence key={intro} onReveal={onRevealed} onDone={onIntroDone} />}
      <Cursor />
      <Interactions />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main id="main">
        <Hero ready={ready} />
        <Intro />
        <Services />
        <Work />
        <About />
        <Founder />
        <Journey />
        <Why />
        <Contact />
      </main>
      <Footer />
      {ready && <CookieConsent delay={1200} />}
    </>
  );
}
