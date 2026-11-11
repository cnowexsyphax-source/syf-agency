import { lazy, Suspense, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { gsap } from '../lib/motion';
import { getTier, prefersReducedMotion, type Tier } from '../lib/device';
import { scrollToTarget } from '../lib/motion';
import { agency } from '../data/site';
import { ArrowRight, ArrowUpRight } from '../components/Icons';

const HeroScene = lazy(() => import('../components/three/HeroScene'));

function Fallback() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center md:items-start md:justify-end md:pr-[6vw] md:pt-[16vh]" aria-hidden="true">
      <div className="orb mt-[22vh] h-[62vw] w-[62vw] max-h-[520px] max-w-[520px] md:mt-0 md:h-[30vw] md:w-[30vw]" />
    </div>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [tier] = useState<Tier>(() => getTier());

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.set('[data-h-line] .split-inner', { yPercent: 115 });
      gsap.set('[data-h-fade]', { opacity: 0, y: 24 });
      gsap.set('[data-h-rule]', { scaleX: 0 });
    }, el);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !ready || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to('[data-h-line] .split-inner', { yPercent: 0, duration: 1.5, stagger: 0.12 }, 0.15)
        .to('[data-h-rule]', { scaleX: 1, duration: 1.4 }, 0.4)
        .to('[data-h-fade]', { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.6);

      // Parallax on scroll: title drifts up slower than the page, content fades
      gsap.to('[data-h-title]', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-h-content]', {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: el, start: '30% top', end: '80% top', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [ready]);

  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <section id="home" ref={root} className="atmo-hero relative flex min-h-[100svh] flex-col overflow-hidden" aria-labelledby="hero-title">
      {/* Background composition */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="atmo-beam absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,208,224,.05)_1px,transparent_1px)] bg-[size:calc(100%/6)_100%] [mask-image:linear-gradient(180deg,transparent,black_30%,black_70%,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* 3D */}
      <div className="absolute inset-0">
        {tier === 'none' ? (
          <Fallback />
        ) : (
          <Suspense fallback={<Fallback />}>
            <HeroScene tier={tier} ready={ready} />
          </Suspense>
        )}
      </div>

      <div data-h-content className="container-x relative z-10 flex flex-1 flex-col pb-8 pt-28 md:pb-10 md:pt-36">
        <div className="flex items-start justify-between gap-6">
          <p data-h-fade className="eyebrow max-w-[240px] leading-relaxed text-white/70">
            Independent digital agency
            <br />
            based in Algiers, Algeria.
          </p>
          <p data-h-fade className="eyebrow hidden text-right leading-relaxed text-white/40 sm:block">
            {agency.coords}
            <br />
            <span lang="ar" className="font-sans text-sm tracking-normal">الجزائر</span>
          </p>
        </div>

        <div className="mt-auto">
          <h1 id="hero-title" data-h-title className="display-xl" aria-label="We create digital impact.">
            <span data-h-line className="split-line" aria-hidden="true">
              <span className="split-inner">We create</span>
            </span>
            <span data-h-line className="split-line" aria-hidden="true">
              <span className="split-inner">
                Digital <span className="font-serif font-normal normal-case italic tracking-[-0.02em] text-blue-bright">impact.</span>
              </span>
            </span>
          </h1>

          <div data-h-rule className="mt-8 h-px origin-left bg-white/15 md:mt-10" />

          <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-12 md:items-end">
            <p data-h-fade className="max-w-md text-base leading-relaxed text-white/70 md:col-span-5 md:text-lg">
              We transform ambitious ideas into powerful digital experiences through creativity, technology and strategy.
            </p>
            <div data-h-fade className="flex flex-col gap-3 xs:flex-row md:col-span-7 md:justify-end">
              <a href="#work" onClick={go('#work')} className="btn btn-primary">
                Explore our work <ArrowRight className="btn-arrow h-4 w-4" />
              </a>
              <a href="#contact" onClick={go('#contact')} className="btn btn-ghost">
                Start a project <ArrowUpRight className="btn-arrow h-4 w-4" />
              </a>
            </div>
          </div>

          <div data-h-fade className="mt-8 flex items-center justify-between md:mt-10">
            <a href="#intro" onClick={go('#intro')} className="eyebrow group inline-flex items-center gap-3 text-white/60 hover:text-white">
              Scroll to explore
              <span className="relative block h-8 w-px overflow-hidden bg-white/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-white" />
              </span>
              <span aria-hidden="true">↓</span>
            </a>
            <p className="eyebrow hidden text-white/40 md:block">{agency.tagline}</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
