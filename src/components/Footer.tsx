import Logo from './Logo';
import { links, nav } from '../data/site';
import { openConsentSettings } from '../lib/consent';
import { replayIntro } from '../lib/intro';
import { scrollToTarget } from '../lib/motion';
import type { MouseEvent } from 'react';

const socials = [
  { label: 'Instagram Personal', href: links.instagramPersonal, external: true },
  { label: 'Instagram Agency', href: links.instagramAgency, external: true },
  { label: 'WhatsApp', href: links.whatsapp, external: true },
  { label: 'Email', href: links.email, external: false },
];

export default function Footer({ onHome = true }: { onHome?: boolean }) {
  const go = (href: string) => (e: MouseEvent) => {
    if (!onHome) return;
    e.preventDefault();
    scrollToTarget(href);
  };
  return (
    <footer className="atmo-obsidian hairline-top relative overflow-hidden pt-20 md:pt-28">
      <div className="pattern-zellige pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo variant="full" className="w-[180px] md:w-[220px]" />
            <p className="mt-8 max-w-xs font-display text-2xl font-medium leading-tight">We build digital experiences.</p>
            <p className="eyebrow mt-4 text-white/45">Algiers, Algeria · <span lang="ar">الجزائر</span></p>
          </div>
          <nav aria-label="Navigation du pied de page" className="md:col-span-3">
            <p className="eyebrow text-white/40">Navigation</p>
            <ul className="mt-5 space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={onHome ? n.href : `/${n.href}`} onClick={go(n.href)} className="link-underline text-white/80 hover:text-white">{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="eyebrow text-white/40">Socials</p>
            <ul className="mt-5 space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="link-underline text-white/80 hover:text-white"
                  >
                    {s.label}{s.external && <span className="sr-only"> (nouvel onglet)</span>}
                  </a>
                </li>
              ))}
              {links.linkedin && (
                <li>
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline text-white/80 hover:text-white">LinkedIn</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 py-6 text-[13px] text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 SYF AGENCY. ALL RIGHTS RESERVED.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><a href="/legal.html" className="link-underline hover:text-white">Mentions légales</a></li>
            <li><a href="/privacy.html" className="link-underline hover:text-white">Confidentialité</a></li>
            <li><a href="/cookies.html" className="link-underline hover:text-white">Cookies</a></li>
            <li><button type="button" onClick={openConsentSettings} className="link-underline hover:text-white">Gérer les cookies</button></li>
            {onHome && (
              <li>
                <button type="button" onClick={replayIntro} className="link-underline inline-flex items-center gap-1.5 hover:text-white">
                  <span aria-hidden="true">↺</span> Replay intro
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <p aria-hidden="true" className="pointer-events-none relative -mb-[0.18em] select-none text-center font-display font-bold leading-[0.8] tracking-[-0.06em] text-white/[0.045]" style={{ fontSize: 'clamp(9rem, 38vw, 42rem)' }}>
        SYF
      </p>
    </footer>
  );
}
