import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';
import Marquee from '../components/Marquee';

const paragraphs = [
  'SYF AGENCY est une agence digitale basée à Alger, spécialisée dans la création de solutions digitales modernes.',
  'Nous associons design, technologie et stratégie marketing pour accompagner les marques, entreprises et entrepreneurs dans leur développement numérique.',
];

export default function Intro() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // word-by-word ink reveal, scrubbed with scroll
      gsap.fromTo(
        '[data-ink] .w',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '[data-ink]', start: 'top 80%', end: 'bottom 45%', scrub: true } },
      );
      gsap.to('[data-badge]', { rotate: 220, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('[data-shape]', { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="intro" ref={root} className="relative overflow-hidden bg-mist text-night" aria-labelledby="intro-title">
      <Marquee
        items={['We build digital experiences', 'Young vision', 'Bold ideas', 'Digital impact', 'Made in Algiers']}
        className="border-b border-night/10 bg-blue py-5 font-display text-xl font-bold uppercase tracking-tight text-white md:py-7 md:text-4xl"
      />

      <div className="pattern-zellige-dark pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="container-x relative py-24 md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="eyebrow flex items-center gap-3 text-night/60">
              <span className="h-px w-8 bg-blue" /> (01) — The agency
            </p>
          </div>

          <div className="md:col-span-9">
            <Reveal split>
              <SplitText id="intro-title" as="h2" by="lines" text={'Not just\nanother agency.'} className="display-lg" />
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
          {/* Abstract composition */}
          <div className="relative hidden md:col-span-4 md:block" aria-hidden="true">
            <div data-shape className="relative mx-auto aspect-square w-[78%]">
              <div className="absolute inset-0 rounded-full border border-night/15" />
              <div className="absolute inset-[14%] rounded-full bg-blue" />
              <div className="absolute inset-[30%] rounded-full bg-mist" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-night/15" />
              <div className="absolute left-0 top-1/2 h-px w-full bg-night/15" />
              <svg data-badge viewBox="0 0 200 200" className="absolute -right-6 -top-6 h-28 w-28 text-night">
                <defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
                <text fontSize="15" fontFamily="Space Grotesk" fontWeight="600" letterSpacing="4" fill="currentColor">
                  <textPath href="#circ">SYF AGENCY · ALGIERS · DIGITAL IMPACT ·</textPath>
                </text>
              </svg>
            </div>
          </div>

          <div className="md:col-span-8">
            <p data-ink className="font-display text-[clamp(1.35rem,2.6vw,2.4rem)] font-medium leading-[1.25] tracking-[-0.02em]">
              {paragraphs.map((p, pi) => (
                <span key={pi} className="block [&:not(:first-child)]:mt-6">
                  {p.split(' ').map((w, i) => (
                    <span key={i} className="w">{w} </span>
                  ))}
                </span>
              ))}
            </p>
            <Reveal className="mt-14 flex flex-col gap-6 border-t border-night/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md text-lg leading-relaxed text-night/75">
                Notre ambition est de créer des expériences digitales <em className="font-serif text-2xl not-italic text-blue">qui ne passent pas inaperçues.</em>
              </p>
              <p className="eyebrow shrink-0 text-night/50">Design · Technologie · Stratégie</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
