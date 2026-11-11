import { lazy, Suspense, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { ScrollTrigger, scrollToTarget, stopScroll } from '../lib/motion';
import type { Phase } from '../lib/experience';
import type { Experience } from '../components/three/DeviceScene';
import SiteExperience from '../components/SiteExperience';
import { getCaps, isTouch } from '../lib/device';
import { projects, type Project } from '../data/site';
import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';
import Picture from '../components/Picture';
import { ArrowUpRight } from '../components/Icons';

const DeviceScene = lazy(() => import('../components/three/DeviceScene'));

/** Static composition: used without WebGL (or while the 3D chunk loads). Same proportions as the 3D scene. */
function StaticDevices({ project }: { project: Project }) {
  const img = project.images!;
  return (
    <div className="laptop-stage absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div className="relative w-[64%] max-w-[820px] max-md:mb-[16%] max-md:mr-[12%] max-md:w-[78%]">
        <div className="laptop mx-auto" style={{ transform: 'rotateX(8deg)' }}>
          <div className="laptop-lid">
            <div className="laptop-lid-front">
              <div className="laptop-screen">
                <span className="laptop-notch" />
                <Picture base={img.desktop} widths={[960, 1600]} sizes="(min-width: 1200px) 900px, 80vw" width={2880} height={1800} alt="" className="absolute left-0 top-[3.4%] h-auto w-full" />
              </div>
            </div>
          </div>
          <div className="laptop-base" />
          <div className="laptop-shadow" />
        </div>
        <div className="phone absolute bottom-[-8%] right-[-9%] w-[17%] max-md:bottom-[-26%] max-md:right-[-16%] max-md:w-[30%]" style={{ transform: 'rotate(-3deg)' }}>
          <div className="phone-screen">
            <span className="phone-island" />
            <Picture base={img.mobile} widths={[400, 780]} sizes="200px" width={1170} height={2532} alt="" className="absolute left-0 top-[6.2%] h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Devices({ project }: { project: Project }) {
  const stage = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [caps] = useState(() => getCaps());
  const img = project.images!;

  // ---- interactive "enter the website" experience ----
  const [phase, setPhase] = useState<Phase>('idle');
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);
  const iframeWrap = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLButtonElement | null>(null);
  const staticBtn = useRef<HTMLButtonElement>(null);
  const [touch] = useState(() => isTouch());
  // Camera flight only on large pointer screens; phones/tablets get a dedicated full-screen sheet.
  const [zoom] = useState(() => caps.webgl && !touch && window.innerWidth >= 900);
  const embeddable = !!project.embeddable;

  const preload = () => {
    if (embeddable) setMounted(true);
  };
  const enter = () => {
    if (phase !== 'idle') return;
    if (!embeddable) window.open(project.url, '_blank', 'noopener,noreferrer'); // user gesture: new tab
    setMounted(true);
    stopScroll(true);
    setPhase('entering');
  };
  const exit = () => {
    if (phase === 'inside') setPhase('exiting');
  };
  const onEntered = () => setPhase('inside');
  const onExited = () => {
    setPhase('idle');
    setMounted(false);
    stopScroll(false);
    (labelRef.current ?? staticBtn.current)?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      end: 'center 55%',
      onUpdate: (self) => (progress.current = self.progress),
      onRefresh: (self) => (progress.current = self.progress),
    });
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!isTouch()) window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      st.kill();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const experience: Experience = {
    phase,
    zoom,
    touch,
    paused: phase === 'inside' && loaded,
    iframeWrap,
    loaded: loadedRef,
    labelRef,
    onEnter: enter,
    onPreload: preload,
    onEntered,
    onExited,
  };

  return (
    <figure ref={stage} className="relative mx-auto w-full max-w-[1280px]">
      {/* ambient glow behind the devices */}
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/40 blur-[110px]" aria-hidden="true" />
      <div ref={slot} className="relative aspect-[1/1.05] w-full sm:aspect-[5/4] md:aspect-[16/10.5]">
        {caps.webgl ? (
          <Suspense fallback={<StaticDevices project={project} />}>
            <DeviceScene
              desktopSrc={`${img.desktop}-${caps.quality === 'high' ? 2400 : 1600}.webp`}
              mobileSrc={`${img.mobile}-780.webp`}
              progress={progress}
              pointer={pointer}
              reduced={caps.reduced}
              quality={caps.quality}
              experience={experience}
            />
          </Suspense>
        ) : (
          <>
            <StaticDevices project={project} />
            <button
              ref={staticBtn}
              type="button"
              onClick={enter}
              onPointerEnter={preload}
              className="group absolute inset-0 z-10 flex items-end justify-center pb-4"
              aria-label="Explorer le site The Gourmet en direct, en plein écran"
            >
              <span className="device-label">
                <span className="device-label-dot" aria-hidden="true" />
                {touch ? 'Tap to explore' : 'Click to explore'}
              </span>
            </button>
          </>
        )}
      </div>
      <figcaption className="sr-only">
        Le site {project.name} présenté sur un MacBook Pro (version ordinateur) et sur un smartphone (version mobile). Activez « Click to explore » pour ouvrir le site en direct.
      </figcaption>

      <SiteExperience
        url={project.url!}
        title={project.name}
        embeddable={embeddable}
        phase={phase}
        mode={zoom ? '3d' : 'sheet'}
        mounted={mounted}
        wrapRef={iframeWrap}
        loadedRef={loadedRef}
        onLoadedChange={setLoaded}
        originRect={() => slot.current?.getBoundingClientRect() ?? null}
        onEntered={onEntered}
        onExited={onExited}
        onExit={exit}
      />
    </figure>
  );
}

function FeaturedProject({ project }: { project: Project }) {
  return (
    <article className="relative" aria-labelledby={`p-${project.id}`}>
      <Devices project={project} />

      <div className="mt-10 grid gap-10 border-t border-white/10 pt-10 md:mt-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow text-blue-bright">Project {project.id}</p>
          <h3 id={`p-${project.id}`} className="mt-4 font-display text-[clamp(2.6rem,6vw,5.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
            {project.name}
          </h3>
        </div>
        <div className="md:col-span-7">
          <Reveal>
            <p className="text-lg leading-relaxed text-white/75 md:text-xl">{project.description}</p>
          </Reveal>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
            {[
              ['Secteur', project.sector],
              ['Catégorie', project.type],
              ['Année', project.year],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-white/10 pt-4">
                <dt className="eyebrow text-white/40">{k}</dt>
                <dd className="mt-2 text-[15px] text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-10" data-cursor-label="Visit">
            Visit website <ArrowUpRight className="btn-arrow h-4 w-4" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </div>
      </div>
    </article>
  );
}

function SlotCard({ project }: { project: Project }) {
  const go = (e: MouseEvent) => {
    e.preventDefault();
    scrollToTarget('#contact');
  };
  return (
    <a
      href="#contact"
      onClick={go}
      data-tilt="5"
      data-cursor-label="Contact"
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[24px] border border-dashed border-white/20 p-7 transition-colors duration-500 hover:border-blue-bright hover:bg-blue/10 md:min-h-[320px] md:p-9"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow text-white/40">Project {project.id}</span>
        <span className="eyebrow rounded-full border border-white/15 px-3 py-1.5 text-white/60">Slot disponible</span>
      </div>
      <div>
        <p className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em] text-white/85">{project.name}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/55 transition-colors group-hover:text-white">
          Votre projet pourrait être le prochain <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
        </p>
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-4 font-display text-[10rem] font-bold leading-none text-white/[0.03]">{project.id}</span>
    </a>
  );
}

export default function Work() {
  const live = projects.filter((p) => p.status === 'live');
  const slots = projects.filter((p) => p.status === 'slot');
  return (
    <section id="work" className="atmo-work hairline-top relative overflow-hidden py-24 md:py-40" aria-labelledby="work-title">
      <div className="pointer-events-none absolute left-1/2 top-[30%] h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-blue/20 blur-[160px]" aria-hidden="true" />
      <div className="container-x relative">
        <div className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-white/50">
              <span className="h-px w-8 bg-blue-bright" /> (03) — Portfolio
            </p>
            <Reveal split className="mt-8">
              <SplitText id="work-title" as="h2" by="lines" text={'Selected\nwork.'} className="display-lg" />
            </Reveal>
          </div>
          <p className="max-w-xs text-white/55">Nos réalisations, présentées telles qu’elles sont en ligne. Le portfolio s’agrandit projet après projet.</p>
        </div>

        {live.map((p) => <FeaturedProject key={p.id} project={p} />)}

        {slots.length > 0 && (
          <div className="mt-24 md:mt-36">
            <p className="eyebrow mb-6 text-white/40">Upcoming</p>
            <div className="grid gap-4 md:grid-cols-2">
              {slots.map((p) => <SlotCard key={p.id} project={p} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
