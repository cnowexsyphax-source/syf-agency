import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Logo from './Logo';
import { nav, links } from '../data/site';
import { scrollToTarget, stopScroll } from '../lib/motion';
import { ArrowUpRight, InstagramIcon, WhatsAppIcon } from './Icons';

export default function Navbar({ onHome = true }: { onHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 600 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    if (!onHome) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    nav.forEach((n) => {
      const el = document.querySelector(n.href);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [onHome]);

  useEffect(() => {
    if (menuRef.current) (menuRef.current as HTMLElement & { inert: boolean }).inert = !open;
    stopScroll(open);
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>('a,button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && menuRef.current) {
        const f = [...menuRef.current.querySelectorAll<HTMLElement>('a,button')];
        const firstEl = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => (e: MouseEvent) => {
    if (!onHome) return;
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollToTarget(href), open ? 350 : 0);
    history.replaceState(null, '', href);
  };
  const href = (h: string) => (onHome ? h : `/${h}`);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,backdrop-filter] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled && !open ? 'border-b border-white/[0.07] bg-ink/55 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent'}`}
      >
        <nav aria-label="Navigation principale" className="container-x flex h-[72px] items-center justify-between gap-6 md:h-[84px]">
          <a href={href('#home')} onClick={go('#home')} className="relative z-10 shrink-0" aria-label="SYF AGENCY — accueil" data-nav-logo>
            <Logo eager className="w-[92px] md:w-[108px]" />
          </a>

          <ul className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md lg:flex">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={href(n.href)}
                  onClick={go(n.href)}
                  aria-current={onHome && active === n.href ? 'true' : undefined}
                  className={`relative block rounded-full px-4 py-2 font-display text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    onHome && active === n.href ? 'bg-white text-ink' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href={href('#contact')} onClick={go('#contact')} className="btn btn-primary hidden !py-3 !text-[12px] sm:inline-flex">
              Let's talk <ArrowUpRight className="btn-arrow h-4 w-4" />
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-ink/40 backdrop-blur-md lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={`absolute h-[1.5px] w-5 bg-white transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
              <span className={`absolute h-[1.5px] w-5 bg-white transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-night transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] lg:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div className="pattern-zellige absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-x relative flex flex-1 flex-col justify-between pb-10 pt-28">
          <ul className="space-y-1">
            {nav.map((n, i) => (
              <li key={n.href} className="overflow-hidden">
                <a
                  href={href(n.href)}
                  onClick={go(n.href)}
                  className={`flex items-baseline gap-4 py-1 font-display text-[clamp(2.4rem,12vw,4.5rem)] font-bold uppercase leading-none tracking-[-0.04em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                    open ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: open ? `${120 + i * 55}ms` : '0ms' }}
                >
                  <span className="font-sans text-xs font-medium tracking-normal text-blue-bright">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-1 text-sm text-white/60">
              <p className="eyebrow text-white/40">Contact</p>
              <a href={links.email} className="block text-white">syphax.fdl@gmail.com</a>
              <p>Alger, Algérie</p>
            </div>
            <div className="flex gap-3">
              <a href={links.instagramAgency} target="_blank" rel="noopener noreferrer" aria-label="Instagram SYF AGENCY (nouvel onglet)" className="grid h-12 w-12 place-items-center rounded-full border border-white/20">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp (nouvel onglet)" className="grid h-12 w-12 place-items-center rounded-full bg-blue">
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
