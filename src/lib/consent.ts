// Cookie / storage consent. Non-essential scripts must be registered with `whenConsented`
// so they are only loaded after the visitor explicitly opts in.

export type ConsentCategory = 'analytics' | 'marketing';
export type Consent = { v: number; necessary: true; analytics: boolean; marketing: boolean; date: string };

const KEY = 'syf-consent';
const VERSION = 1;
const EVENT = 'syf:consent';
export const OPEN_EVENT = 'syf:consent-open';

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; marketing: boolean }) {
  const c: Consent = { v: VERSION, necessary: true, ...choice, date: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable: choice applies to this visit only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: c }));
  return c;
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Runs `load` once the given category is accepted (now or later). */
export function whenConsented(category: ConsentCategory, load: () => void) {
  let done = false;
  const run = (c: Consent | null) => {
    if (!done && c && c[category]) {
      done = true;
      load();
    }
  };
  run(readConsent());
  window.addEventListener(EVENT, (e) => run((e as CustomEvent<Consent>).detail));
}
