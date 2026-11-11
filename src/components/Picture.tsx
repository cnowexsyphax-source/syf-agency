type Props = {
  base: string; // e.g. /images/gourmet-desktop (files: base-<w>.avif/.webp)
  widths: number[];
  sizes: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
};

export default function Picture({ base, widths, sizes, alt, width, height, className = '', eager }: Props) {
  const set = (ext: string) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`${base}-${widths[widths.length - 1]}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
