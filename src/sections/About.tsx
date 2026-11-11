import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import { pillars } from '../data/site';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';

/** Three pillars drawn as circles that converge on scroll — their intersection is SYF. */
function Convergence() {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 45%', scrub: 1 } });
      tl.from('[data-c="0"]', { x: -70, y: -40 }, 0)
        .from('[data-c="1"]', { x: 70, y: -40 }, 0)
        .from('[data-c="2"]', { y: 80 }, 0)
        .from('[data-core]', { scale: 0, transformOrigin: '50% 50%', ease: 'back.out(2)' }, 0.5)
        .from('[data-lbl]', { opacity: 0, stagger: 0.1 }, 0.3);
      gsap.to('[data-orbit]', { rotate: 360, transformOrigin: '50% 50%', duration: 40, repeat: -1, ease: 'none' });
    }, el);
    return () => ctx.revert();
  }, []);

  const c = [
    { cx: 200, cy: 170, label: 'Creativity', lx: 120, ly: 120 },
    { cx: 300, cy: 170, label: 'Technology', lx: 380, ly: 120 },
    { cx: 250, cy: 255, label: 'Strategy', lx: 250, ly: 345 },
  ];
  return (
    <svg ref={ref} viewBox="0 0 500 420" className="h-auto w-full" role="img" aria-label="Créativité, technologie et stratégie se rejoignent au centre : SYF AGENCY">
      <g data-orbit>
        <circle cx="250" cy="210" r="200" fill="none" stroke="#fff" strokeOpacity=".08" strokeDasharray="1 7" />
        <circle cx="250" cy="10" r="4" fill="#287BFF" />
      </g>
      {c.map((k, i) => (
        <g key={i} data-c={i}>
          <circle cx={k.cx} cy={k.cy} r="105" fill={i === 0 ? '#0750B5' : '#fff'} fillOpacity={i === 0 ? 0.55 : 0.04} stroke="#fff" strokeOpacity=".35" />
        </g>
      ))}
      <g data-core>
        <circle cx="250" cy="200" r="30" fill="#fff" />
        <text x="250" y="206" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="17" fill="#06152E" letterSpacing="-0.5">SYF</text>
      </g>
      {c.map((k) => (
        <text key={k.label} data-lbl x={k.lx} y={k.ly} textAnchor="middle" fontFamily="Space Grotesk" fontWeight="600" fontSize="13" letterSpacing="3" fill="#fff" fillOpacity=".8">
          {k.label.toUpperCase()}
        </text>
      ))}
    </svg>
  );
}

export default function About() {
  return (
    <section id="about" className="atmo-deep hairline-top relative overflow-hidden py-24 md:py-40" aria-labelledby="about-title">
      <div className="pattern-zellige pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="container-x relative">
        <p className="eyebrow flex items-center gap-3 text-white/50">
          <span className="h-px w-8 bg-blue-bright" /> (04) — About SYF AGENCY
        </p>

        <div className="mt-10 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal split>
              <SplitText id="about-title" as="h2" by="lines" text={'Our vision.\nOur mission.'} className="display-lg" />
            </Reveal>
            <Reveal className="mt-12 max-w-xl space-y-5 text-lg leading-relaxed text-white/70" delay={0.1}>
              <p className="font-display text-2xl font-medium leading-snug text-white md:text-3xl">
                Nous pensons que chaque entreprise mérite une présence digitale à la hauteur de ses ambitions.
              </p>
              <p>
                Chez SYF AGENCY, nous ne voulons pas simplement créer des sites web. Nous voulons construire des expériences qui donnent de la valeur aux marques.
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Convergence />
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <p className="eyebrow mb-6 text-white/40">Notre approche repose sur trois piliers</p>
          <ol className="grid border-t border-white/10 md:grid-cols-3">
            {pillars.map((p) => (
              <li key={p.id} className="group relative border-b border-white/10 py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0">
                <Reveal>
                  <span className="font-display text-sm font-semibold text-blue-bright">{p.id} —</span>
                  <h3 className="mt-6 font-display text-4xl font-bold uppercase tracking-[-0.04em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-2 md:text-5xl">{p.title}</h3>
                  <p className="mt-4 max-w-xs leading-relaxed text-white/60">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
