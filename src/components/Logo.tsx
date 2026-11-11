type Props = {
  variant?: 'mark' | 'full';
  tone?: 'white' | 'night';
  className?: string;
  eager?: boolean;
};

// Official SYF AGENCY logo (derived from the original file, proportions untouched).
const SIZES = { mark: [985, 399], full: [985, 482] } as const;

export default function Logo({ variant = 'mark', tone = 'white', className = '', eager }: Props) {
  const base = `/logo/syf-${variant}-${tone}`;
  const [w, h] = SIZES[variant];
  return (
    <picture>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.png`}
        width={w}
        height={h}
        alt="SYF AGENCY"
        className={`block h-auto select-none ${className}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}
