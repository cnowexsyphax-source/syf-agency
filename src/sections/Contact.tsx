import { useState, type FormEvent } from 'react';
import { agency, links, projectTypes } from '../data/site';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';
import { ArrowUpRight, InstagramIcon, WhatsAppIcon } from '../components/Icons';

// Optional backend: set VITE_FORM_ENDPOINT (e.g. a Formspree / Getform URL) in .env.
// Without it, the form composes an email in the visitor's mail app (mailto) — no fake confirmation.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;

type Status = { kind: 'idle' | 'sending' | 'sent' | 'mailto' | 'error'; msg?: string };

export default function Contact() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (d.website) return; // honeypot

    if (ENDPOINT) {
      setStatus({ kind: 'sending' });
      try {
        const res = await fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
        if (!res.ok) throw new Error(String(res.status));
        setStatus({ kind: 'sent' });
        form.reset();
      } catch {
        setStatus({ kind: 'error', msg: `L’envoi a échoué. Écrivez-nous directement à ${agency.email} ou sur WhatsApp.` });
      }
      return;
    }

    const subject = `Nouveau projet — ${d.name}${d.company ? ` (${d.company})` : ''}`;
    const body = [
      `Nom : ${d.name}`,
      `Email : ${d.email}`,
      `Entreprise : ${d.company || '—'}`,
      `Type de projet : ${d.type}`,
      `Budget indicatif : ${d.budget || 'Non précisé'}`,
      '',
      'Description du projet :',
      d.message,
    ].join('\n');
    window.location.href = `mailto:${agency.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus({ kind: 'mailto' });
  };

  return (
    <section id="contact" className="hairline-top relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_80%_0%,#287BFF_0%,transparent_60%),linear-gradient(180deg,#0750B5,#053A85)] py-24 md:py-36" aria-labelledby="contact-title">
      <div className="pattern-zellige pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-[20%] -top-[30%] h-[80vh] w-[80vh] rounded-full bg-blue-bright/40 blur-[140px]" aria-hidden="true" />
      <div className="container-x relative">
        <p className="eyebrow flex items-center gap-3 text-white/75">
          <span className="h-px w-8 bg-white" /> (08) — Contact
        </p>
        <Reveal split className="mt-8">
          <SplitText id="contact-title" as="h2" by="lines" text={'Let’s build\nsomething great.'} className="display-xl !text-[clamp(2.8rem,9vw,9.5rem)]" />
        </Reveal>

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-2xl font-medium leading-snug md:text-3xl">
              Have an idea, a business or a project in mind?
              <br />
              <span className="font-serif text-[1.15em] italic">Let’s talk about it.</span>
            </p>

            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-10 w-full !py-5 sm:w-auto">
              <WhatsAppIcon className="h-5 w-5" /> Discuter sur WhatsApp
              <span className="sr-only">(nouvel onglet)</span>
            </a>

            <dl className="mt-12 space-y-6 border-t border-white/25 pt-8">
              <div>
                <dt className="eyebrow text-white/70">Email</dt>
                <dd className="mt-2"><a href={links.email} className="link-underline font-display text-xl font-medium md:text-2xl">{agency.email}</a></dd>
              </div>
              <div>
                <dt className="eyebrow text-white/70">WhatsApp / Téléphone</dt>
                <dd className="mt-2 flex flex-wrap gap-x-4">
                  <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="link-underline font-display text-xl font-medium md:text-2xl">{agency.phoneDisplay}</a>
                  <a href={`tel:${agency.phoneIntl}`} className="link-underline self-end text-sm text-white/75">Appeler</a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-white/70">Instagram</dt>
                <dd className="mt-2 flex flex-wrap gap-3">
                  <a href={links.instagramAgency} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm transition-colors hover:bg-white hover:text-blue">
                    <InstagramIcon className="h-4 w-4" /> @syf_agency6 <span className="sr-only">(nouvel onglet)</span>
                  </a>
                  <a href={links.instagramPersonal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm transition-colors hover:bg-white hover:text-blue">
                    <InstagramIcon className="h-4 w-4" /> @3yph4.x <span className="sr-only">(nouvel onglet)</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-white/70">Localisation</dt>
                <dd className="mt-2 text-lg">Alger, Algérie</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={onSubmit} noValidate className="rounded-[28px] bg-night p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,.6)] sm:p-10" aria-describedby="form-note">
              <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-name" className="field-label">Nom *</label>
                  <input id="f-name" name="name" required autoComplete="name" className="field" placeholder="Votre nom" />
                </div>
                <div>
                  <label htmlFor="f-email" className="field-label">Email *</label>
                  <input id="f-email" name="email" type="email" required autoComplete="email" className="field" placeholder="vous@entreprise.com" />
                </div>
                <div>
                  <label htmlFor="f-company" className="field-label">Entreprise</label>
                  <input id="f-company" name="company" autoComplete="organization" className="field" placeholder="Nom de l’entreprise" />
                </div>
                <div>
                  <label htmlFor="f-type" className="field-label">Type de projet *</label>
                  <select id="f-type" name="type" required defaultValue="" className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_center] bg-no-repeat pr-6">
                    <option value="" disabled>Choisir…</option>
                    {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-budget" className="field-label">Budget indicatif (facultatif)</label>
                  <input id="f-budget" name="budget" className="field" placeholder="Ex. une fourchette en DA" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-msg" className="field-label">Description du projet *</label>
                  <textarea id="f-msg" name="message" required rows={4} minLength={10} className="field resize-y" placeholder="Parlez-nous de votre idée, vos objectifs, vos délais…" />
                </div>
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="f-website">Ne pas remplir</label>
                  <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <p id="form-note" className="max-w-xs text-[13px] leading-relaxed text-white/50">
                  {ENDPOINT
                    ? 'Vos informations servent uniquement à répondre à votre demande.'
                    : 'L’envoi ouvre votre messagerie avec votre message prérempli. Vos données ne sont pas stockées sur ce site.'}{' '}
                  <a href="/privacy.html" className="underline underline-offset-2 hover:text-white">Confidentialité</a>
                </p>
                <button type="submit" disabled={status.kind === 'sending'} className="btn btn-primary shrink-0 disabled:opacity-60">
                  {status.kind === 'sending' ? 'Envoi…' : 'Envoyer la demande'} <ArrowUpRight className="btn-arrow h-4 w-4" />
                </button>
              </div>

              <div role="status" aria-live="polite" className="mt-6 text-sm empty:hidden">
                {status.kind === 'sent' && <p className="rounded-xl bg-blue/30 p-4">Message envoyé. Nous revenons vers vous rapidement.</p>}
                {status.kind === 'mailto' && (
                  <p className="rounded-xl bg-white/5 p-4 text-white/80">
                    Votre application email devrait s’ouvrir avec votre message. Pensez à cliquer sur « Envoyer » dans votre messagerie. Rien ne s’est ouvert ? Écrivez-nous à{' '}
                    <a href={links.email} className="underline">{agency.email}</a> ou sur{' '}
                    <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>.
                  </p>
                )}
                {status.kind === 'error' && <p className="rounded-xl bg-red-500/15 p-4 text-red-100">{status.msg}</p>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
