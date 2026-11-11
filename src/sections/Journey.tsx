import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import { journey } from '../data/site';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';

export default function Journey() {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-tl]', start: 'top 70%', end: 'bottom 60%', scrub: true } });
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((s) => {
        gsap.from(s, { opacity: 0, x: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 78%', once: true } });
        gsap.fromTo(s.querySelector('[data-dot]'), { scale: 0 }, { scale: 1, ease: 'back.out(3)', duration: 0.6, scrollTrigger: { trigger: s, start: 'top 65%', once: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" ref={root} className="atmo-obsidian relative overflow-hidden py-24 md:py-40" aria-labelledby="journey-title">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow flex items-center gap-3 text-white/50">
              <span className="h-px w-8 bg-blue-bright" /> (06) — Timeline
            </p>
            <Reveal split className="mt-8">
              <SplitText id="journey-title" as="h2" by="lines" text={'My\njourney.'} className="display-lg" />
            </Reveal>
            <p className="mt-8 max-w-sm text-white/55">Les premières étapes d’une histoire qui ne fait que commencer.</p>
          </div>
        </div>

        <ol data-tl className="relative lg:col-span-7">
          <span className="absolute bottom-0 left-[7px] top-2 w-px bg-white/10" aria-hidden="true" />
          <span data-line className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-blue-bright to-blue" aria-hidden="true" />
          {journey.map((j, i) => (
            <li key={i} data-step className="relative pb-16 pl-12 last:pb-0 md:pl-16">
              <span data-dot className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-[3px] border-ink bg-blue-bright shadow-[0_0_0_1px_rgba(40,123,255,.6),0_0_24px_rgba(40,123,255,.6)]" aria-hidden="true" />
              <p className="font-display text-sm font-semibold tabular-nums text-blue-bright">{j.year} — 0{i + 1}</p>
              <h3 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.8rem)] font-bold uppercase leading-[0.95] tracking-[-0.045em]">{j.title}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/60">{j.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
