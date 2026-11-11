import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import { founder, links } from '../data/site';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';
import Logo from '../components/Logo';
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from '../components/Icons';
import { GraduationCap } from 'lucide-react';

function Portrait() {
  if (founder.photo) {
    return (
      <img
        src={founder.photo}
        alt={`Portrait de ${founder.name}, fondateur de SYF AGENCY`}
        width={1200}
        height={1500}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    );
  }
  // Placeholder until the professional photo is provided — intentionally no generated face.
  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-night p-10 text-white md:p-14">
      <div className="pattern-zellige absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(7,80,181,.55),transparent_60%)]" aria-hidden="true" />
      <span />
      <div className="relative">
        <span aria-hidden="true" className="block font-display text-[clamp(6rem,16vw,13rem)] font-bold leading-[0.8] tracking-[-0.07em] text-white/90">SF</span>
        <p className="eyebrow mt-4 text-white/45">Photo officielle à venir</p>
      </div>
    </div>
  );
}

export default function Founder() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-portrait]', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '[data-portrait]', start: 'top 80%', once: true } });
      gsap.fromTo('[data-portrait-inner]', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-portrait]', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('[data-quote] .split-inner', { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '[data-quote]', start: 'top 80%', once: true } });
      gsap.fromTo('[data-name]', { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  const socials = [
    { label: 'Instagram personnel', href: links.instagramPersonal, Icon: InstagramIcon },
    { label: 'Instagram SYF AGENCY', href: links.instagramAgency, Icon: InstagramIcon },
    { label: 'WhatsApp', href: links.whatsapp, Icon: WhatsAppIcon },
  ];

  return (
    <section id="founder" ref={root} className="relative overflow-hidden bg-mist py-24 text-night md:py-40" aria-labelledby="founder-title">
      <div className="container-x relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-night/55">
              <span className="h-px w-8 bg-blue" /> (05) — Founder
            </p>
            <Reveal split className="mt-8">
              <SplitText id="founder-title" as="h2" by="lines" text={'The mind\nbehind SYF.'} className="display-lg" />
            </Reveal>
          </div>
        </div>
      </div>

      {/* Giant drifting name */}
      <p data-name aria-hidden="true" className="text-outline-dark pointer-events-none mt-10 select-none whitespace-nowrap font-display text-[clamp(5rem,17vw,17rem)] font-bold uppercase leading-none tracking-[-0.06em]">
        Syphax Fodil — Syphax Fodil
      </p>

      <div className="container-x relative mt-10 md:mt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Portrait */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div data-portrait className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-30px_rgba(6,21,46,.5)]">
                <div data-portrait-inner className="h-full w-full">
                  <Portrait />
                </div>
                {!founder.photo && (
                  <div className="pointer-events-none absolute inset-x-6 top-6 flex items-center justify-between md:inset-x-8 md:top-8" aria-hidden="true">
                    <span className="eyebrow text-white/50">Portrait</span>
                    <span className="eyebrow text-white/50">SF — 2026</span>
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <ul className="flex gap-2">
                  {socials.map(({ label, href, Icon }) => (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (nouvel onglet)`} className="grid h-12 w-12 place-items-center rounded-full border border-night/15 transition-colors duration-300 hover:border-blue hover:bg-blue hover:text-white">
                        <Icon className="h-5 w-5" />
                      </a>
                    </li>
                  ))}
                  <li>
                    {links.linkedin ? (
                      <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (nouvel onglet)" className="grid h-12 w-12 place-items-center rounded-full border border-night/15 transition-colors hover:bg-blue hover:text-white">
                        <LinkedInIcon className="h-4 w-4" />
                      </a>
                    ) : (
                      <span title="LinkedIn — bientôt disponible" aria-label="LinkedIn — bientôt disponible" className="grid h-12 w-12 cursor-not-allowed place-items-center rounded-full border border-dashed border-night/20 text-night/30">
                        <LinkedInIcon className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                </ul>
                <span className="eyebrow text-night/45">Algiers, DZ</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="lg:col-span-7">
            <Reveal>
              <h3 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">{founder.name}</h3>
              <p className="eyebrow mt-4 text-blue">{founder.role}</p>
              <p className="eyebrow mt-2 text-night/50">{founder.meta}</p>
            </Reveal>

            <Reveal className="mt-10">
              <div data-tilt="4" className="relative overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-7">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue/40 blur-2xl" aria-hidden="true" />
                <div className="relative flex items-start gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue">
                    <GraduationCap className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="eyebrow text-white/50">Formation</p>
                    <p className="mt-2 font-display text-2xl font-bold">{founder.school}</p>
                    <p className="mt-1 text-white/75">{founder.degree}</p>
                    <p className="text-white/75">{founder.major} · {founder.year}</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-12">
              <blockquote className="space-y-5 text-[17px] leading-[1.75] text-night/80">
                {founder.bio.map((p, i) => (
                  <p key={i} className={i === 0 ? 'font-display text-2xl font-medium leading-snug text-night md:text-[1.7rem]' : ''}>
                    {i === 0 && <span className="font-serif text-4xl leading-none text-blue">« </span>}
                    {p}
                    {i === founder.bio.length - 1 && <span className="font-serif text-2xl text-blue"> »</span>}
                  </p>
                ))}
              </blockquote>
            </Reveal>

            <Reveal className="mt-12 flex items-end justify-between gap-6 border-t border-night/15 pt-8">
              <div>
                <p className="font-serif text-4xl italic leading-none md:text-5xl">{founder.name}</p>
                <p className="eyebrow mt-3 text-night/55">Founder & CEO</p>
              </div>
              <Logo tone="night" className="w-[90px] opacity-80" />
            </Reveal>
          </div>
        </div>

        <div data-quote className="mt-24 border-t border-night/15 pt-14 md:mt-36 md:pt-20">
          <SplitText
            as="p"
            by="lines"
            text={'Age is just a number.\nVision is everything.'}
            className="font-display text-[clamp(2.2rem,7vw,7rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]"
          />
          <p className="eyebrow mt-6 text-night/50">— Syphax Fodil</p>
        </div>
      </div>
    </section>
  );
}
