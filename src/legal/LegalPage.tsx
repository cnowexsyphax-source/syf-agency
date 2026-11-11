import { useEffect, type ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';
import { agency, links } from '../data/site';
import { openConsentSettings } from '../lib/consent';

type Page = 'privacy' | 'cookies' | 'legal';

const TODO = ({ children }: { children: ReactNode }) => (
  <mark className="rounded bg-blue/25 px-1.5 py-0.5 text-white">[À compléter : {children}]</mark>
);

const UPDATED = '10 novembre 2026';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 py-10">
      <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.03em] md:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-white/70 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white">
        {children}
      </div>
    </section>
  );
}

const content: Record<Page, { title: string; intro: string; body: ReactNode }> = {
  legal: {
    title: 'Mentions légales',
    intro: 'Informations relatives à l’éditeur et à l’hébergement du site SYF AGENCY.',
    body: (
      <>
        <Section title="Éditeur du site">
          <p><strong>{agency.name}</strong> — agence de marketing digital et de création web.</p>
          <ul>
            <li>Responsable de la publication : Syphax Fodil, Founder & CEO</li>
            <li>Forme juridique / statut : <TODO>statut juridique</TODO></li>
            <li>Numéro d’immatriculation (RC / NIF / NIS) : <TODO>numéros officiels</TODO></li>
            <li>Adresse professionnelle : <TODO>adresse</TODO> — Alger, Algérie</li>
            <li>Email : <a href={links.email}>{agency.email}</a></li>
            <li>Téléphone / WhatsApp : {agency.phoneDisplay}</li>
          </ul>
        </Section>
        <Section title="Hébergement">
          <p>Hébergeur : <TODO>nom, adresse et contact de l’hébergeur (ex. Vercel Inc. si le site y est déployé)</TODO></p>
        </Section>
        <Section title="Propriété intellectuelle">
          <p>
            L’ensemble des contenus de ce site (textes, logo SYF AGENCY, éléments graphiques, mise en page) est la propriété de SYF AGENCY, sauf mention contraire. Toute reproduction sans autorisation préalable est interdite.
          </p>
          <p>
            Les captures du site THE GOURMET présentées dans le portfolio illustrent une réalisation de SYF AGENCY.
          </p>
        </Section>
        <Section title="Liens externes">
          <p>Le site contient des liens vers des services tiers (Instagram, WhatsApp, sites réalisés). SYF AGENCY n’est pas responsable du contenu de ces sites externes.</p>
        </Section>
      </>
    ),
  },
  privacy: {
    title: 'Politique de confidentialité',
    intro: 'Comment SYF AGENCY traite les données personnelles transmises via ce site.',
    body: (
      <>
        <Section title="Responsable du traitement">
          <p>SYF AGENCY, représentée par Syphax Fodil — <a href={links.email}>{agency.email}</a>. Adresse : <TODO>adresse professionnelle</TODO>.</p>
        </Section>
        <Section title="Données collectées">
          <p>Le site ne crée pas de compte utilisateur et n’utilise aucun outil de mesure d’audience à ce jour.</p>
          <p>
            <strong>Formulaire de contact :</strong> les informations saisies (nom, email, entreprise, type de projet, budget indicatif, description) servent à composer un email dans votre propre messagerie. Elles ne sont pas enregistrées sur nos serveurs ; nous les recevons uniquement si vous envoyez cet email.
          </p>
          <p><strong>WhatsApp et Instagram :</strong> si vous nous contactez via ces services, leurs propres politiques de confidentialité s’appliquent.</p>
        </Section>
        <Section title="Finalité et durée de conservation">
          <p>Les données reçues sont utilisées uniquement pour répondre à votre demande et, le cas échéant, établir une proposition commerciale. Durée de conservation : <TODO>durée choisie, ex. 3 ans après le dernier contact</TODO>.</p>
        </Section>
        <Section title="Vos droits">
          <p>
            Conformément à la loi algérienne n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel, vous disposez d’un droit d’accès, de rectification et d’opposition. Pour l’exercer : <a href={links.email}>{agency.email}</a>.
          </p>
          <p><TODO>vérifier les obligations déclaratives applicables auprès de l’autorité nationale compétente</TODO></p>
        </Section>
        <Section title="Mise à jour">
          <p>Dernière mise à jour : {UPDATED}.</p>
        </Section>
      </>
    ),
  },
  cookies: {
    title: 'Politique de cookies',
    intro: 'Les traceurs utilisés sur ce site et la manière de gérer vos préférences.',
    body: (
      <>
        <Section title="Ce que nous utilisons aujourd’hui">
          <p>
            Ce site n’utilise <strong>aucun cookie publicitaire ni outil de mesure d’audience</strong> à ce jour. Seul un élément strictement nécessaire est enregistré dans le stockage local de votre navigateur :
          </p>
          <ul>
            <li><strong>syf-consent</strong> (stockage local) — mémorise vos choix de consentement. Conservé jusqu’à modification ou suppression par vos soins.</li>
          </ul>
          <p>Les polices de caractères sont chargées depuis Google Fonts, ce qui implique une connexion aux serveurs de Google.</p>
        </Section>
        <Section title="Catégories soumises à consentement">
          <ul>
            <li><strong>Mesure d’audience</strong> — statistiques de fréquentation. Non activée sans votre accord.</li>
            <li><strong>Marketing</strong> — mesure des campagnes publicitaires (ex. Meta Pixel). Non activée sans votre accord.</li>
          </ul>
          <p>Si de tels outils sont ajoutés, ils ne seront chargés qu’après acceptation et cette page sera mise à jour avec leur liste.</p>
        </Section>
        <Section title="Gérer vos préférences">
          <p>Vous pouvez modifier votre choix à tout moment.</p>
          <button type="button" onClick={openConsentSettings} className="btn btn-primary mt-2">Gérer les cookies</button>
        </Section>
        <Section title="Mise à jour">
          <p>Dernière mise à jour : {UPDATED}.</p>
        </Section>
      </>
    ),
  },
};

export default function LegalPage({ page }: { page: Page }) {
  const c = content[page];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Navbar onHome={false} />
      <main id="main" className="relative">
        <div className="pattern-zellige pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
        <div className="container-x relative max-w-4xl pb-24 pt-36 md:pt-48">
          <a href="/" className="eyebrow text-white/50 hover:text-white">← Retour à l’accueil</a>
          <h1 className="mt-8 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">{c.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-white/60">{c.intro}</p>
          <div className="mt-14">{c.body}</div>
        </div>
      </main>
      <Footer onHome={false} />
      <CookieConsent delay={600} />
    </>
  );
}
