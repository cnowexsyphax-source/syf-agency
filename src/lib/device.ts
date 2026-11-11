export type Tier = 'high' | 'mid' | 'none';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

/** Decides how much 3D a device gets. 'none' → static, lightweight fallback. */
export function getTier(): Tier {
  if (typeof window === 'undefined') return 'none';
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (prefersReducedMotion() || nav.connection?.saveData) return 'none';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'none';
  } catch {
    return 'none';
  }
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? 4;
  if (cores <= 2 || mem <= 2) return 'none';
  if (isTouch() || cores <= 4 || window.innerWidth < 900) return 'mid';
  return 'high';
}

export type Caps = { webgl: boolean; reduced: boolean; quality: 'high' | 'mid' };

/** Capabilities for secondary 3D scenes: reduced motion still gets a static 3D render. */
export function getCaps(): Caps {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl = false;
  try {
    const c = document.createElement('canvas');
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    webgl = false;
  }
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? 4;
  if (nav.connection?.saveData || cores <= 2 || mem <= 2) webgl = false;
  const quality = isTouch() || cores <= 4 || window.innerWidth < 900 ? 'mid' : 'high';
  return { webgl, reduced: prefersReducedMotion(), quality };
}
