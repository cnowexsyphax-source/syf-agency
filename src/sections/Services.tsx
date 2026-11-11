import { useLayoutEffect, useRef } from 'react';
import { Code2, ShoppingBag, Megaphone, PenTool, Clapperboard, Compass, type LucideIcon } from 'lucide-react';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import { services, type ServiceArt as Kind } from '../data/site';
import ServiceArt from '../components/ServiceArt';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';

const icons: Record<Kind, LucideIcon> = {
  web: Code2,
  commerce: ShoppingBag,
  marketing: Megaphone,
  brand: PenTool,
  content: Clapperboard,
  strategy: Compass,
};

const tones = {
  blue: 'bg-blue text-white',
  night: 'bg-night text-white ring-1 ring-inset ring-white/10',
  mist: 'bg-mist text-night',
  ink: 'bg-[#0c1222] text-white ring-1 ring-inset ring-white/10',
} as const;

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      // subtle per-card tilt while travelling
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
        gsap.fromTo(
          card.querySelector('[data-art]'),
          { xPercent: 12, rotate: 4 },
          { xPercent: -12, rotate: -4, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="services" ref={root} className="atmo-obsidian hairline-top relative overflow-hidden lg:h-screen" aria-labelledby="services-title">
      <div ref={track} className="flex flex-col gap-4 px-[var(--gutter)] py-24 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-5 lg:py-0">
        {/* Intro panel */}
        <div className="flex shrink-0 flex-col justify-between pb-10 lg:h-[78vh] lg:w-[38vw] lg:pb-0 lg:pr-16">
          <p className="eyebrow flex items-center gap-3 text-white/50">
            <span className="h-px w-8 bg-blue-bright" /> (02) — Services
          </p>
          <div className="mt-10 lg:mt-0">
            <Reveal split>
              <SplitText id="services-title" as="h2" by="lines" text={'What\nwe do.'} className="display-lg" />
            </Reveal>
            <Reveal className="mt-8 max-w-sm text-lg leading-relaxed text-white/60" delay={0.2}>
              <p>Six expertises pour construire, faire grandir et rendre visible votre marque en ligne.</p>
            </Reveal>
          </div>
          <p className="eyebrow mt-10 hidden items-center gap-3 text-white/40 lg:flex">
            Scroll <span className="h-px w-16 bg-white/30" /> →
          </p>
        </div>

        {services.map((s, i) => {
          const Icon = icons[s.art];
          return (
            <article
              key={s.id}
              data-card
              className={`group relative flex shrink-0 flex-col overflow-hidden rounded-[28px] p-7 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] sm:p-9 max-lg:sticky max-lg:top-[var(--stack)] lg:h-[78vh] lg:w-[min(34vw,560px)] ${tones[s.tone]}`}
              data-tilt="5"
              style={{ ['--stack' as string]: `calc(88px + ${i * 14}px)` }}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-sm font-semibold tabular-nums opacity-60">{s.id} / 06</span>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-current/20 transition-transform duration-700 group-hover:rotate-[360deg]" style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}>
                  <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                </span>
              </div>

              <div data-art className="my-8 aspect-[3/2] w-full max-w-[420px] self-center transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06] lg:my-auto">
                <ServiceArt kind={s.art} />
              </div>

              <div>
                <h3 className="font-display text-[clamp(1.9rem,3vw,2.9rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em]">{s.title}</h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed opacity-75">{s.description}</p>
                {s.items.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.items.map((it) => (
                      <li key={it} className="rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ background: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
                        {it}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
        <div className="hidden w-[8vw] shrink-0 lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}
