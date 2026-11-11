import { useEffect, useRef, useState } from 'react';
import { OPEN_EVENT, readConsent, saveConsent } from '../lib/consent';

export default function CookieConsent({ delay = 0 }: { delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { if (!readConsent()) setVisible(true); }, delay);
    const open = () => {
      const c = readConsent();
      setAnalytics(!!c?.analytics);
      setMarketing(!!c?.marketing);
      setCustom(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => { clearTimeout(t); window.removeEventListener(OPEN_EVENT, open); };
  }, [delay]);

  useEffect(() => {
    if (visible && custom) panel.current?.querySelector<HTMLElement>('input,button')?.focus();
  }, [visible, custom]);

  const decide = (a: boolean, m: boolean) => {
    saveConsent({ analytics: a, marketing: m });
    setVisible(false);
    setCustom(false);
  };

  if (!visible) return null;

  const Toggle = ({ id, label, desc, checked, onChange, disabled }: { id: string; label: string; desc: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) => (
    <div className="flex items-start justify-between gap-4 border-t border-white/10 py-4">
      <div>
        <label htmlFor={id} className="font-display text-sm font-semibold">{label}</label>
        <p className="mt-1 text-[13px] leading-relaxed text-white/55">{desc}</p>
      </div>
      <span className="relative mt-1 inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-white/15 transition-colors peer-checked:bg-blue peer-disabled:opacity-60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-bright" />
        <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </div>
  );

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-[560px] rounded-2xl border border-white/10 bg-night/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,.6)] backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:p-6"
    >
      <p id="cookie-title" className="eyebrow text-blue-bright">Cookies & confidentialité</p>
      <p className="mt-3 text-sm leading-relaxed text-white/75">
        Nous utilisons uniquement le stockage nécessaire au fonctionnement du site. Les outils de mesure d’audience ou marketing ne seront activés qu’avec votre accord.{' '}
        <a href="/cookies.html" className="text-white underline underline-offset-4">Politique de cookies</a>
      </p>

      {custom && (
        <div className="mt-4">
          <Toggle id="c-nec" label="Nécessaires" desc="Mémorisation de vos préférences de consentement. Toujours actifs." checked disabled />
          <Toggle id="c-ana" label="Mesure d’audience" desc="Statistiques de visite anonymisées. Aucun outil n’est installé à ce jour." checked={analytics} onChange={setAnalytics} />
          <Toggle id="c-mkt" label="Marketing" desc="Mesure des campagnes publicitaires. Aucun outil n’est installé à ce jour." checked={marketing} onChange={setMarketing} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {custom ? (
          <button type="button" className="btn btn-primary flex-1 !py-3 !text-[11px]" onClick={() => decide(analytics, marketing)}>Enregistrer</button>
        ) : (
          <button type="button" className="btn btn-ghost flex-1 !py-3 !text-[11px]" onClick={() => setCustom(true)}>Customize</button>
        )}
        <button type="button" className="btn btn-ghost flex-1 !py-3 !text-[11px]" onClick={() => decide(false, false)}>Reject all</button>
        <button type="button" className="btn btn-primary flex-1 !py-3 !text-[11px]" onClick={() => decide(true, true)}>Accept all</button>
      </div>
    </div>
  );
}
