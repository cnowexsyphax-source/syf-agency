import { reasons } from '../data/site';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';

export default function Why() {
  return (
    <section id="why" className="atmo-midnight hairline-top relative overflow-hidden pb-24 md:pb-40" aria-labelledby="why-title">
      <div className="container-x">
        <div className="pt-24 md:pt-32">
          <div className="grid gap-10 md:grid-cols-12">
            <p className="eyebrow flex items-center gap-3 text-white/50 md:col-span-4">
              <span className="h-px w-8 bg-blue-bright" /> (07) — Why SYF
            </p>
            <Reveal split className="md:col-span-8">
              <SplitText id="why-title" as="h2" by="lines" text={'Why work\nwith us?'} className="display-lg" />
            </Reveal>
          </div>

          <ul className="mt-16 md:mt-24">
            {reasons.map((r) => (
              <li key={r.id} className="group relative border-t border-white/10 last:border-b">
                <div aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-blue transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                <Reveal className="relative grid items-center gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-12">
                  <span className="font-display text-sm font-semibold text-blue-bright transition-colors group-hover:text-white md:col-span-1">{r.id}</span>
                  <h3 className="font-display text-[clamp(1.8rem,4vw,3.6rem)] font-bold uppercase leading-[0.95] tracking-[-0.045em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3 md:col-span-6">
                    {r.title}
                  </h3>
                  <p className="max-w-md text-white/60 transition-colors group-hover:text-white md:col-span-5 md:justify-self-end md:text-right">{r.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
