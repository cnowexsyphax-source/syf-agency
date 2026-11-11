import type { ServiceArt as Kind } from '../data/site';

/** One distinct animated illustration per service (pure SVG + CSS, very light). */
export default function ServiceArt({ kind }: { kind: Kind }) {
  const stroke = 'currentColor';
  switch (kind) {
    case 'web':
      return (
        <svg viewBox="0 0 240 160" className="art art-web" aria-hidden="true">
          <rect x="10" y="10" width="220" height="140" rx="10" fill="none" stroke={stroke} strokeOpacity=".35" />
          <line x1="10" y1="34" x2="230" y2="34" stroke={stroke} strokeOpacity=".35" />
          {[24, 36, 48].map((x) => <circle key={x} cx={x} cy="22" r="3.5" fill={stroke} fillOpacity=".5" />)}
          <g>
            <rect className="row" x="28" y="54" width="120" height="12" rx="3" fill={stroke} />
            <rect className="row" x="28" y="76" width="170" height="6" rx="3" fill={stroke} fillOpacity=".45" />
            <rect className="row" x="28" y="90" width="140" height="6" rx="3" fill={stroke} fillOpacity=".45" />
          </g>
          <rect x="28" y="112" width="56" height="20" rx="10" fill="#287BFF" />
          <rect className="cursor-blink" x="152" y="54" width="3" height="12" fill="#287BFF" />
        </svg>
      );
    case 'commerce':
      return (
        <svg viewBox="0 0 240 160" className="art art-commerce" aria-hidden="true">
          <g>
            {[0, 1, 2, 3].map((i) => (
              <g key={i} className="tile">
                <rect x={14 + i * 56} y="30" width="48" height="64" rx="6" fill="none" stroke={stroke} strokeOpacity=".4" />
                <rect x={20 + i * 56} y="36" width="36" height="32" rx="4" fill={i === 1 ? '#287BFF' : stroke} fillOpacity={i === 1 ? 1 : 0.18} />
                <rect x={20 + i * 56} y="74" width="24" height="4" rx="2" fill={stroke} fillOpacity=".6" />
                <rect x={20 + i * 56} y="82" width="14" height="4" rx="2" fill={stroke} fillOpacity=".35" />
              </g>
            ))}
          </g>
          <path d="M84 118h10l8 22h44l8-16h-56" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="108" cy="148" r="4" fill={stroke} /><circle cx="140" cy="148" r="4" fill={stroke} />
        </svg>
      );
    case 'marketing':
      return (
        <svg viewBox="0 0 240 160" className="art art-marketing" aria-hidden="true">
          {[40, 80, 120].map((y) => <line key={y} x1="14" y1={y} x2="226" y2={y} stroke={stroke} strokeOpacity=".12" />)}
          <path className="wave" d="M14 128 C 50 120, 60 96, 92 100 S 140 70, 160 64 S 200 30, 222 26" fill="none" stroke="#0750B5" strokeWidth="3" strokeLinecap="round" />
          <circle className="pulse" cx="222" cy="26" r="8" fill="#0750B5" fillOpacity=".35" />
          <circle cx="222" cy="26" r="5" fill="#0750B5" />
          <g fill={stroke} fillOpacity=".75">
            <path d="M24 30h34l14-10v40l-14-10H24z" fillOpacity=".9" />
          </g>
        </svg>
      );
    case 'brand':
      return (
        <svg viewBox="0 0 240 160" className="art art-brand" aria-hidden="true">
          <g className="spin">
            <circle cx="120" cy="80" r="62" fill="none" stroke={stroke} strokeOpacity=".3" strokeDasharray="2 6" />
          </g>
          <g className="spin-r">
            <rect x="78" y="38" width="84" height="84" fill="none" stroke={stroke} strokeOpacity=".35" transform="rotate(45 120 80)" />
          </g>
          <circle cx="120" cy="80" r="36" fill="none" stroke="#287BFF" strokeWidth="2" />
          <path d="M120 14v132M54 80h132" stroke={stroke} strokeOpacity=".2" />
          <path d="M120 54l7 19 19 7-19 7-7 19-7-19-19-7 19-7z" fill={stroke} />
        </svg>
      );
    case 'content':
      return (
        <svg viewBox="0 0 240 160" className="art art-content" aria-hidden="true">
          <g>
            <rect className="frame" x="58" y="22" width="76" height="116" rx="10" fill={stroke} fillOpacity=".12" stroke={stroke} strokeOpacity=".3" />
            <rect className="frame" x="82" y="18" width="76" height="120" rx="10" fill={stroke} fillOpacity=".18" stroke={stroke} strokeOpacity=".4" />
            <rect className="frame" x="106" y="14" width="76" height="124" rx="10" fill="#0750B5" stroke={stroke} strokeOpacity=".5" />
          </g>
          <path d="M136 62v28l22-14z" fill="#fff" />
          <rect x="116" y="112" width="40" height="4" rx="2" fill="#fff" fillOpacity=".7" />
          <rect x="116" y="120" width="26" height="4" rx="2" fill="#fff" fillOpacity=".4" />
        </svg>
      );
    case 'strategy':
      return (
        <svg viewBox="0 0 240 160" className="art art-strategy" aria-hidden="true">
          <g stroke={stroke} strokeOpacity=".45" fill="none">
            <path className="edge" d="M40 120 L100 60 L160 96 L206 34" />
            <path className="edge" d="M100 60 L120 130 M160 96 L206 132" />
          </g>
          {[[40, 120], [100, 60], [160, 96], [120, 130], [206, 132]].map(([x, y], i) => (
            <circle key={i} className="node" cx={x} cy={y} r="6" fill={stroke} />
          ))}
          <circle cx="206" cy="34" r="10" fill="none" stroke="#287BFF" strokeWidth="2" />
          <circle cx="206" cy="34" r="4" fill="#287BFF" />
        </svg>
      );
  }
}
