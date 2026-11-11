export type Phase = 'idle' | 'entering' | 'inside' | 'exiting';

/* --------------------------------------------------------------------------------------------
 * 2D projective transform (homography) → CSS matrix3d.
 * Maps the rectangle (0,0)-(w,h) of an element onto any quad, so a DOM iframe can be pinned
 * exactly onto a 3D screen projected by the camera.
 * ------------------------------------------------------------------------------------------ */
type M3 = number[];

const adj = (m: M3): M3 => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
];
const mulMM = (a: M3, b: M3): M3 => {
  const c: M3 = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j];
      c[3 * i + j] = s;
    }
  return c;
};
const mulMV = (m: M3, v: number[]) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];
const basis = (p: number[]): M3 => {
  const m = [p[0], p[2], p[4], p[1], p[3], p[5], 1, 1, 1];
  const v = mulMV(adj(m), [p[6], p[7], 1]);
  return mulMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};

/** quad = [tlx, tly, trx, try, blx, bly, brx, bry] in viewport px. */
export function rectToQuadMatrix3d(w: number, h: number, quad: number[]) {
  const t = mulMM(basis(quad), adj(basis([0, 0, w, 0, 0, h, w, h])));
  for (let i = 0; i < 9; i++) t[i] /= t[8];
  return `matrix3d(${t[0]},${t[3]},0,${t[6]},${t[1]},${t[4]},0,${t[7]},0,0,1,0,${t[2]},${t[5]},0,${t[8]})`;
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
