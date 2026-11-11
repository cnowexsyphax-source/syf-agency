type Props = { items: string[]; className?: string; reverse?: boolean };

export default function Marquee({ items, className = '', reverse }: Props) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 md:px-10">{t}</span>
          <svg viewBox="0 0 24 24" className="h-[0.5em] w-[0.5em] text-blue-bright" aria-hidden="true">
            <path fill="currentColor" d="M12 0l3.1 8.9L24 12l-8.9 3.1L12 24l-3.1-8.9L0 12l8.9-3.1z" />
          </svg>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`marquee ${reverse ? 'marquee-reverse' : ''}`}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
