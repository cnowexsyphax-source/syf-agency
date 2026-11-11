import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Environment, Html, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { rectToQuadMatrix3d, smoothstep, type Phase } from '../../lib/experience';

/* ------------------------------------------------------------------------------------------------
 * Product presentation of THE GOURMET: procedural MacBook Pro + smartphone (no model downloads).
 * Screens use genuine captures of https://le-gourmet-orcin.vercel.app (desktop 1440×900, mobile 390×844).
 * ---------------------------------------------------------------------------------------------- */

type Props = {
  desktopSrc: string;
  mobileSrc: string;
  progress: MutableRefObject<number>; // 0 → 1 scroll entrance
  pointer: MutableRefObject<{ x: number; y: number }>;
  reduced: boolean;
  quality: 'high' | 'mid';
  experience: Experience;
};

export type Experience = {
  phase: Phase;
  /** true: click flies the camera into the screen. false: parent shows the sheet experience. */
  zoom: boolean;
  touch: boolean;
  paused: boolean;
  iframeWrap: RefObject<HTMLDivElement>;
  loaded: MutableRefObject<boolean>;
  labelRef: MutableRefObject<HTMLButtonElement | null>;
  onEnter: () => void;
  onPreload: () => void;
  onEntered: () => void;
  onExited: () => void;
};

/** Mutable state shared between the composition and the camera rig. */
type Shared = {
  screen: MutableRefObject<THREE.Mesh>;
  phoneOut: MutableRefObject<number>;
  hover: MutableRefObject<boolean>;
  ready: MutableRefObject<boolean>;
  flight: MutableRefObject<number>;
  glare: MutableRefObject<THREE.MeshBasicMaterial>;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const { lerp, damp } = THREE.MathUtils;

/* ---------- geometry helpers ---------- */

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Flat rounded rectangle with UVs normalised to 0–1 (so textures map edge to edge, clipped by the corners). */
function roundedPlane(w: number, h: number, r: number, seg = 10) {
  const g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), seg);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return g;
}

/* ---------- screen textures ---------- */

type Decorate = (ctx: CanvasRenderingContext2D, W: number, H: number, top: number) => void;

/**
 * Draws the screenshot into a canvas with the exact screen aspect ratio.
 * `inset` reserves a strip at the top (MacBook notch / phone status bar) so no UI hides the site;
 * the image keeps its ratio (never stretched) and only the bottom edge is trimmed by that strip.
 */
function useScreenTexture(src: string, aspect: number, inset: number, decorate?: Decorate) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    img.onload = () => {
      if (!alive) return;
      const W = img.naturalWidth;
      const H = Math.round(W / aspect);
      const top = Math.round(H * inset);
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, top, W, (W * img.naturalHeight) / img.naturalWidth);
      decorate?.(ctx, W, H, top);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      setTex(t);
      invalidate();
    };
    return () => {
      alive = false;
    };
  }, [src, aspect, inset, decorate, gl, invalidate]);

  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

/** iOS-style status bar drawn on the canvas, coloured from the site's own top pixels. */
const drawStatusBar: Decorate = (ctx, W, _H, top) => {
  const [r, g, b] = ctx.getImageData(Math.round(W / 2), top + 4, 1, 1).data;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, W, top);
  ctx.fillStyle = '#fff';
  const fs = top * 0.36;
  ctx.font = `600 ${fs}px -apple-system, "SF Pro Text", Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const cy = top * 0.56;
  ctx.fillText('9:41', W * 0.1, cy);
  // signal bars
  const bx = W * 0.71, bw = W * 0.011, gap = W * 0.006;
  for (let i = 0; i < 4; i++) {
    const h = fs * (0.35 + i * 0.2);
    ctx.fillRect(bx + i * (bw + gap), cy + fs * 0.42 - h, bw, h);
  }
  // wifi
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = fs * 0.13;
  ctx.lineCap = 'round';
  const wx = W * 0.8, wy = cy + fs * 0.38;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(wx, wy, fs * 0.27 * i, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  // battery
  const ex = W * 0.845, ew = W * 0.062, eh = fs * 0.62;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = fs * 0.07;
  ctx.strokeRect(ex, cy - eh / 2, ew, eh);
  ctx.fillRect(ex + ew + fs * 0.06, cy - eh * 0.2, fs * 0.08, eh * 0.4);
  ctx.globalAlpha = 1;
  ctx.fillRect(ex + fs * 0.1, cy - eh / 2 + fs * 0.1, ew * 0.78, eh - fs * 0.2);
};

/** Diagonal glare used as a subtle glass reflection over screens. */
function useGlareTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 256, 256);
    g.addColorStop(0, 'rgba(255,255,255,0.0)');
    g.addColorStop(0.38, 'rgba(255,255,255,0.0)');
    g.addColorStop(0.46, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function ScreenMaterial({ map }: { map: THREE.Texture | null }) {
  // Emissive display (true colours, unaffected by tone mapping) + clearcoat for real glass reflections.
  return (
    <meshPhysicalMaterial
      key={map ? map.uuid : 'off'}
      color="#000000"
      emissive="#ffffff"
      emissiveMap={map}
      emissiveIntensity={map ? 1 : 0}
      roughness={0.25}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.04}
      envMapIntensity={0.55}
      toneMapped={false}
    />
  );
}

/* ---------- MacBook Pro ---------- */

const MB = { w: 3.2, d: 2.2, baseH: 0.08, lidH: 2.1, lidT: 0.03, screenW: 3.04, screenH: 1.9 };

function Keyboard() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number }[] = [];
    const unit = 0.175, gap = 0.025, totalW = 14 * unit + 13 * gap;
    const x0 = -totalW / 2;
    const row = (z: number, widths: number[], d = 0.15) => {
      const sum = widths.reduce((a, b) => a + b, 0);
      const scale = (totalW - gap * (widths.length - 1)) / sum;
      let x = x0;
      widths.forEach((wu) => {
        const w = wu * scale;
        out.push({ x: x + w / 2, z, w, d });
        x += w + gap;
      });
    };
    const ones = (n: number) => Array(n).fill(1);
    row(-0.93, ones(14), 0.08); // function row
    row(-0.78, [...ones(13), 1.5]);
    row(-0.605, [1.5, ...ones(13)]);
    row(-0.43, [1.8, ...ones(11), 1.8]);
    row(-0.255, [2.3, ...ones(10), 2.3]);
    row(-0.08, [1, 1, 1, 1.25, 5.2, 1.25, 1, 1, 1]);
    return out;
  }, []);

  useEffect(() => {
    const m = new THREE.Matrix4();
    keys.forEach((k, i) => {
      m.compose(new THREE.Vector3(k.x, 0, k.z), new THREE.Quaternion(), new THREE.Vector3(k.w, 1, k.d));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [keys]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, keys.length]} position={[0, MB.baseH + 0.006, 0]}>
      <boxGeometry args={[1, 0.012, 1]} />
      <meshStandardMaterial color="#141519" roughness={0.55} metalness={0.2} />
    </instancedMesh>
  );
}

/** Soft rounded-rectangle halo (drawn once) used as the interactive screen glow. */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 360;
    const ctx = c.getContext('2d')!;
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.shadowBlur = 70;
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath();
    ctx.roundRect(90, 80, 332, 200, 24);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

type ScreenHandlers = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
};

function MacBook({
  lid,
  screen,
  glare,
  screenRef,
  glowRef,
  handlers,
  label,
  glareRef,
}: {
  lid: MutableRefObject<THREE.Group>;
  screen: THREE.Texture | null;
  glare: THREE.Texture;
  screenRef: MutableRefObject<THREE.Mesh>;
  glowRef: MutableRefObject<THREE.MeshBasicMaterial>;
  handlers: ScreenHandlers;
  label: React.ReactNode;
  glareRef: MutableRefObject<THREE.MeshBasicMaterial>;
}) {
  const bezel = useMemo(() => roundedPlane(MB.w - 0.03, MB.lidH - 0.03, 0.07), []);
  const display = useMemo(() => roundedPlane(MB.screenW, MB.screenH, 0.035), []);
  const notch = useMemo(() => roundedPlane(0.25, 0.075, 0.03), []);
  const glow = useGlowTexture();
  const screenY = MB.lidH / 2 + 0.02;

  return (
    <group>
      {/* Base */}
      <RoundedBox args={[MB.w, MB.baseH, MB.d]} radius={0.035} smoothness={4} position={[0, MB.baseH / 2, 0]}>
        <meshStandardMaterial color="#d3d7dd" metalness={0.9} roughness={0.36} envMapIntensity={0.9} />
      </RoundedBox>
      {/* keyboard well + speaker grilles */}
      <mesh position={[0, MB.baseH + 0.0005, -0.5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.86, 1.0]} />
        <meshStandardMaterial color="#3a3d43" metalness={0.5} roughness={0.55} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, MB.baseH + 0.0005, -0.5]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.12, 0.95]} />
          <meshStandardMaterial color="#8d9299" metalness={0.8} roughness={0.6} />
        </mesh>
      ))}
      <Keyboard />
      {/* Trackpad */}
      <RoundedBox args={[1.4, 0.004, 0.86]} radius={0.002} smoothness={2} position={[0, MB.baseH, 0.55]}>
        <meshStandardMaterial color="#c6cad0" metalness={0.85} roughness={0.28} envMapIntensity={0.8} />
      </RoundedBox>
      {/* front thumb notch */}
      <mesh position={[0, MB.baseH * 0.62, MB.d / 2 + 0.001]}>
        <planeGeometry args={[0.42, 0.03]} />
        <meshStandardMaterial color="#6d727a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Hinge */}
      <mesh position={[0, MB.baseH, -MB.d / 2 + 0.02]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.028, 0.028, 2.7, 24]} />
        <meshStandardMaterial color="#1d2025" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Lid — pivots on the hinge */}
      <group ref={lid} position={[0, MB.baseH, -MB.d / 2 + 0.02]}>
        <RoundedBox args={[MB.w, MB.lidH, MB.lidT]} radius={0.014} smoothness={4} position={[0, MB.lidH / 2, 0]}>
          <meshStandardMaterial color="#d3d7dd" metalness={0.9} roughness={0.32} envMapIntensity={0.9} />
        </RoundedBox>
        {/* interactive halo behind the lid, visible around its edges */}
        <mesh position={[0, MB.lidH / 2, -MB.lidT / 2 - 0.03]} scale={[MB.w * 1.55, MB.lidH * 1.75, 1]}>
          <planeGeometry />
          <meshBasicMaterial ref={glowRef} map={glow} color="#287BFF" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh geometry={bezel} position={[0, MB.lidH / 2, MB.lidT / 2 + 0.0008]} {...handlers}>
          <meshPhysicalMaterial color="#050608" roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
        </mesh>
        <mesh ref={screenRef} geometry={display} position={[0, screenY, MB.lidT / 2 + 0.0014]} {...handlers}>
          <ScreenMaterial map={screen} />
        </mesh>
        <group position={[0, MB.lidH + 0.24, 0]}>{label}</group>
        <mesh geometry={notch} position={[0, screenY + MB.screenH / 2 - 0.0375, MB.lidT / 2 + 0.002]}>
          <meshBasicMaterial color="#000" />
        </mesh>
        <mesh geometry={display} position={[0, screenY, MB.lidT / 2 + 0.0024]}>
          <meshBasicMaterial ref={glareRef} map={glare} transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Smartphone ---------- */

const PH = { w: 0.76, h: 1.56, r: 0.115, depth: 0.05, bevel: 0.012, screenW: 0.705, screenH: 1.525 };

function Phone({ screen, glare }: { screen: THREE.Texture | null; glare: THREE.Texture }) {
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRectShape(PH.w, PH.h, PH.r), {
      depth: PH.depth,
      bevelEnabled: true,
      bevelThickness: PH.bevel,
      bevelSize: PH.bevel,
      bevelSegments: 5,
      curveSegments: 24,
    });
    g.translate(0, 0, -PH.depth / 2);
    return g;
  }, []);
  const glass = useMemo(() => roundedPlane(PH.w + 0.014, PH.h + 0.014, PH.r + 0.006, 16), []);
  const display = useMemo(() => roundedPlane(PH.screenW, PH.screenH, 0.092, 16), []);
  const island = useMemo(() => roundedPlane(0.2, 0.058, 0.029, 10), []);
  const front = PH.depth / 2 + PH.bevel;
  const side = PH.w / 2 + PH.bevel;

  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color="#3d4048" metalness={1} roughness={0.24} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, front + 0.0004]}>
        <meshPhysicalMaterial color="#020203" roughness={0.1} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      <mesh geometry={display} position={[0, 0, front + 0.0008]}>
        <ScreenMaterial map={screen} />
      </mesh>
      <mesh geometry={island} position={[0, PH.screenH / 2 - 0.058, front + 0.0012]}>
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh geometry={display} position={[0, 0, front + 0.0016]}>
        <meshBasicMaterial map={glare} transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* side buttons */}
      {[
        { x: -side, y: 0.5, l: 0.07 },
        { x: -side, y: 0.34, l: 0.13 },
        { x: -side, y: 0.18, l: 0.13 },
        { x: side, y: 0.3, l: 0.21 },
      ].map((b, i) => (
        <RoundedBox key={i} args={[0.014, b.l, 0.028]} radius={0.006} smoothness={3} position={[b.x, b.y, 0]}>
          <meshStandardMaterial color="#4a4e57" metalness={1} roughness={0.22} />
        </RoundedBox>
      ))}
    </group>
  );
}

/** Radial blob used as the floating phone's floor shadow (cheaper and softer than another shadow pass). */
function useBlobTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,4,13,0.9)');
    g.addColorStop(0.5, 'rgba(0,4,13,0.35)');
    g.addColorStop(1, 'rgba(0,4,13,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

/* ---------- Composition ---------- */

type Layout = {
  scale: number;
  laptop: [number, number, number];
  laptopScale: number;
  laptopRotY: number;
  phone: [number, number, number];
  phoneRot: [number, number, number];
  phoneScale: number;
};

function useLayout(): Layout {
  const { width, height } = useThree((s) => s.size);
  const aspect = width / height;
  if (aspect >= 1.2) {
    // Desktop / tablet: large laptop centred, phone foreground right, overlapping the screen edge.
    const k = Math.min(1, aspect / 1.62);
    return { scale: k, laptop: [-0.04, 0, 0], laptopScale: 1, laptopRotY: 0.14, phone: [1.3, 0.98, 1.15], phoneRot: [-0.05, -0.42, 0.045], phoneScale: 0.8 };
  }
  // Portrait / phones: dedicated composition, smaller laptop behind, phone fully visible in front.
  const k = Math.min(1, aspect / 0.95);
  return { scale: k, laptop: [-0.2, 0.6, -0.6], laptopScale: 0.7, laptopRotY: 0.18, phone: [0.95, 0.42, 1.0], phoneRot: [-0.05, -0.36, 0.04], phoneScale: 0.9 };
}

function Composition({ desktopSrc, mobileSrc, progress, pointer, reduced, quality, experience: ex, shared }: Props & { shared: Shared }) {
  const live = useLayout();
  // Freeze the layout while the experience is open (the canvas is resized to the viewport).
  const locked = useRef<Layout | null>(null);
  if (ex.phase === 'idle') locked.current = null;
  else if (!locked.current) locked.current = live;
  const L = locked.current ?? live;

  const root = useRef<THREE.Group>(null!);
  const laptop = useRef<THREE.Group>(null!);
  const lid = useRef<THREE.Group>(null!);
  const phone = useRef<THREE.Group>(null!);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!);
  const state = useRef({ p: reduced ? 1 : 0, px: 0, py: 0, glow: 0 });
  const glare = useGlareTexture();
  const blob = useBlobTexture();
  const phoneShadow = useRef<THREE.Mesh>(null!);
  const host = useThree((s) => s.gl.domElement.parentElement);
  const invalidate = useThree((s) => s.invalidate);

  const desktopTex = useScreenTexture(desktopSrc, MB.screenW / MB.screenH, 0.034);
  const mobileTex = useScreenTexture(mobileSrc, PH.screenW / PH.screenH, 0.062, drawStatusBar);

  const canEnter = () => ex.phase === 'idle' && shared.ready.current;
  const handlers: ScreenHandlers = {
    onPointerOver: (e) => {
      e.stopPropagation();
      if (!canEnter()) return;
      shared.hover.current = true;
      if (host) {
        host.style.cursor = 'pointer';
        host.dataset.cursorLabel = 'Explore';
      }
      ex.labelRef.current?.classList.add('is-hover');
      ex.onPreload();
      invalidate();
    },
    onPointerOut: () => {
      shared.hover.current = false;
      if (host) {
        host.style.cursor = '';
        delete host.dataset.cursorLabel;
      }
      ex.labelRef.current?.classList.remove('is-hover');
      invalidate();
    },
    onClick: (e) => {
      e.stopPropagation();
      if (!canEnter()) return;
      shared.hover.current = false;
      if (host) {
        host.style.cursor = '';
        delete host.dataset.cursorLabel;
      }
      ex.onEnter();
    },
  };
  // the phone sits in front of the screen: it must not let clicks through
  const block = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

  useFrame(({ clock }, dt) => {
    const s = state.current;
    const idle = ex.phase === 'idle';
    const target = reduced ? 1 : progress.current;
    s.p = damp(s.p, target, 4, dt);
    s.px = damp(s.px, reduced || !idle ? 0 : pointer.current.x, 3, dt);
    s.py = damp(s.py, reduced || !idle ? 0 : pointer.current.y, 3, dt);
    const t = reduced ? 0 : clock.elapsedTime;

    const e1 = easeOut(clamp01(s.p * 1.15));
    const e2 = easeOut(clamp01((s.p - 0.3) / 0.7));
    shared.ready.current = e1 > 0.92;

    root.current.scale.setScalar(L.scale);

    // Laptop is frozen while the camera flies in/out so the screen stays where the rig aimed.
    if (idle) {
      lid.current.rotation.x = lerp(Math.PI / 2 - 0.035, -0.3, e1);
      laptop.current.position.set(L.laptop[0], lerp(L.laptop[1] - 0.6, L.laptop[1], e1) + Math.sin(t * 0.6) * 0.008, L.laptop[2]);
      laptop.current.scale.setScalar(L.laptopScale);
      laptop.current.rotation.y = lerp(L.laptopRotY + 0.5, L.laptopRotY, e1) + s.px * 0.05;
      laptop.current.rotation.x = s.py * 0.025;
    }

    // Phone: slides in later, floats, reacts more to the pointer; slides away when entering the site.
    const out = shared.phoneOut.current;
    phone.current.position.set(
      lerp(L.phone[0] + 1.6, L.phone[0], e2) + s.px * 0.07 + out * 2.6,
      lerp(L.phone[1] - 0.9, L.phone[1], e2) + Math.sin(t * 1.1) * 0.03 - s.py * 0.04 - out * 0.9,
      L.phone[2] + out * 0.8,
    );
    phone.current.rotation.set(
      L.phoneRot[0] + s.py * 0.12 + Math.sin(t * 0.8) * 0.015,
      lerp(L.phoneRot[1] - 1.1, L.phoneRot[1], e2) + s.px * 0.16 - out * 0.9,
      L.phoneRot[2] + Math.sin(t * 0.6) * 0.012 - out * 0.3,
    );
    phone.current.scale.setScalar(L.phoneScale);
    phone.current.visible = out < 0.999;
    const ps = phoneShadow.current;
    ps.position.set(phone.current.position.x + 0.05, L.laptop[1] + 0.001, phone.current.position.z - 0.15);
    (ps.material as THREE.MeshBasicMaterial).opacity = 0.55 * e2 * (1 - out) * (1 - Math.sin(t * 1.1) * 0.15);

    // Interactive glow: soft breathing when ready, stronger on hover, off during the flight.
    const g = !idle ? 0 : shared.hover.current ? 0.95 : shared.ready.current ? 0.38 + Math.sin(t * 1.6) * 0.1 : 0;
    s.glow = damp(s.glow, g, 6, dt);
    glowMat.current.opacity = s.glow;

    // Glass reflections fade out as the camera gets close, so the website reads cleanly.
    const fl = shared.flight.current;
    if (shared.glare.current) shared.glare.current.opacity = 0.07 * (1 - smoothstep(0.05, 0.6, fl));
    const sm = shared.screen.current?.material as THREE.MeshPhysicalMaterial | undefined;
    if (sm) {
      sm.envMapIntensity = 0.55 * (1 - smoothstep(0.05, 0.6, fl));
      sm.clearcoat = 1 - smoothstep(0.05, 0.6, fl);
    }

    // Label follows readiness
    const lbl = ex.labelRef.current;
    if (lbl) {
      const show = idle && shared.ready.current;
      lbl.style.opacity = show ? '1' : '0';
      lbl.style.pointerEvents = show ? 'auto' : 'none';
      lbl.tabIndex = show ? 0 : -1;
    }
  });

  const label = (
    <Html center zIndexRange={[40, 0]} wrapperClass="device-label-wrap">
      <button
        ref={ex.labelRef}
        type="button"
        onClick={() => canEnter() && ex.onEnter()}
        onPointerEnter={ex.onPreload}
        onFocus={ex.onPreload}
        className="device-label"
        aria-label="Explorer le site The Gourmet en direct, en plein écran"
        style={{ opacity: 0 }}
      >
        <span className="device-label-dot" aria-hidden="true" />
        {ex.touch ? 'Tap to explore' : 'Click to explore'}
      </button>
    </Html>
  );

  return (
    <group ref={root}>
      <group ref={laptop}>
        <MacBook lid={lid} screen={desktopTex} glare={glare} screenRef={shared.screen} glowRef={glowMat} handlers={handlers} label={label} glareRef={shared.glare} />
      </group>
      <group ref={phone} onPointerOver={block} onClick={block}>
        <Phone screen={mobileTex} glare={glare} />
      </group>
      <mesh ref={phoneShadow} rotation-x={-Math.PI / 2} scale={[1.3 * L.phoneScale, 0.7 * L.phoneScale, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={blob} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* soft depth shadow + tight contact occlusion under the laptop */}
      <group position={L.laptop} rotation-y={L.laptopRotY} scale={L.laptopScale}>
        <ContactShadows position={[0, -0.002, 0.1]} scale={[7, 5]} blur={3.2} far={0.1} opacity={0.85} resolution={quality === 'high' ? 1024 : 512} color="#00040d" />
        <ContactShadows position={[0, -0.001, 0]} scale={[4, 3]} blur={0.6} far={0.12} opacity={0.65} resolution={512} color="#000000" />
      </group>
    </group>
  );
}

/* ---------- Camera rig: fly into the screen and back ---------- */

type Rect = { x: number; y: number; w: number; h: number };
const toRect = (r: DOMRect): Rect => ({ x: r.left, y: r.top, w: r.width, h: r.height });
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

const NOTCH_INSET = 0.034; // top strip of the screen texture reserved for the notch

/**
 * Region of the screen (local coords) that ends up covering the whole viewport:
 * the website area below the notch strip, cropped to the viewport aspect, top-aligned.
 */
function viewportCrop(aspect: number) {
  const top = MB.screenH / 2 - MB.screenH * NOTCH_INSET;
  const cw0 = MB.screenW, ch0 = MB.screenH * (1 - NOTCH_INSET);
  let w = cw0, h = cw0 / aspect;
  if (h > ch0) {
    h = ch0;
    w = ch0 * aspect;
  }
  return { cx: 0, cy: top - h / 2, w, h };
}

function Rig({ ex, shared, host, reduced }: { ex: Experience; shared: Shared; host: RefObject<HTMLDivElement>; reduced: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const anim = useRef({ t: 0 });
  const frame = useRef<{ from: Rect } | null>(null);
  const settle = useRef(0);
  const rest = useRef<{ pos: THREE.Vector3; quat: THREE.Quaternion } | null>(null);
  const target = useRef({ pos: new THREE.Vector3(), quat: new THREE.Quaternion() });
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), n: new THREE.Vector3() }), []);

  const computeTarget = () => {
    const screen = shared.screen.current;
    screen.updateWorldMatrix(true, false);
    const aspect = window.innerWidth / window.innerHeight;
    const c = viewportCrop(aspect);
    screen.matrixWorld.decompose(tmp.v, tmp.q, tmp.s);
    const centre = new THREE.Vector3(c.cx, c.cy, 0).applyMatrix4(screen.matrixWorld);
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(tmp.q);
    const d = (c.h * tmp.s.y) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    target.current.pos.copy(centre).addScaledVector(normal, d);
    target.current.quat.copy(tmp.q);
  };

  const pinHost = (pin: boolean) => {
    const el = host.current!;
    Object.assign(el.style, pin
      ? { position: 'fixed', left: '0px', top: '0px', width: '100vw', height: '100vh', zIndex: '70' }
      : { position: '', left: '', top: '', width: '', height: '', zIndex: '' });
  };

  // project the screen crop → pin the DOM iframe onto it with a homography
  const placeIframe = (t: number) => {
    const el = ex.iframeWrap.current;
    if (!el) return;
    const W = window.innerWidth, H = window.innerHeight;
    const c = viewportCrop(W / H);
    const C = gl.domElement.getBoundingClientRect();
    const m = shared.screen.current.matrixWorld;
    const q: number[] = [];
    for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      tmp.v.set(c.cx + (sx * c.w) / 2, c.cy + (sy * c.h) / 2, 0).applyMatrix4(m).project(camera);
      q.push(C.left + ((tmp.v.x + 1) / 2) * C.width, C.top + ((1 - tmp.v.y) / 2) * C.height);
    }
    el.style.transition = 'none';
    el.style.transform = rectToQuadMatrix3d(W, H, q);
    el.style.opacity = ex.loaded.current ? String(smoothstep(0.62, 0.97, t)) : '0';
  };

  useEffect(() => {
    if (!ex.zoom) return;
    const dur = reduced ? 0.01 : 1;
    if (ex.phase === 'entering') {
      const from = toRect(host.current!.getBoundingClientRect());
      if (!frame.current) rest.current = { pos: camera.position.clone(), quat: camera.quaternion.clone() };
      computeTarget();
      frame.current = { from };
      pinHost(true);
      const tw = gsap.to(anim.current, { t: 1, duration: 2.1 * dur, ease: 'power3.inOut', onComplete: ex.onEntered });
      return () => {
        tw.kill();
      };
    }
    if (ex.phase === 'exiting') {
      computeTarget(); // viewport may have changed while inside
      frame.current = { from: toRect(host.current!.parentElement!.getBoundingClientRect()) };
      const tw = gsap.to(anim.current, {
        t: 0,
        duration: 1.7 * dur,
        ease: 'power3.inOut',
        onComplete: () => {
          pinHost(false);
          settle.current = 3; // keep the (identity) offset a few frames while the canvas resizes back
          ex.onExited();
        },
      });
      return () => {
        tw.kill();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.phase, ex.zoom]);

  // keep the final framing exact if the window is resized while inside
  useEffect(() => {
    if (ex.phase === 'inside' && ex.zoom) computeTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useFrame(() => {
    const f = frame.current;
    if (!f || !rest.current) return;
    const t = anim.current.t;
    const W = window.innerWidth, H = window.innerHeight;
    const F = lerpRect(f.from, { x: 0, y: 0, w: W, h: H }, smoothstep(0, 0.75, t));

    camera.position.lerpVectors(rest.current.pos, target.current.pos, t);
    camera.quaternion.slerpQuaternions(rest.current.quat, target.current.quat, t);
    const C = gl.domElement.getBoundingClientRect();
    camera.aspect = F.w / F.h;
    camera.setViewOffset(F.w, F.h, C.left - F.x, C.top - F.y, C.width, C.height);
    camera.updateProjectionMatrix();

    shared.phoneOut.current = smoothstep(0, 0.4, t);
    shared.flight.current = t;

    if (ex.phase === 'entering' || ex.phase === 'exiting') placeIframe(t);

    if (ex.phase === 'idle' && settle.current > 0 && --settle.current === 0) {
      frame.current = null;
      camera.clearViewOffset();
      camera.aspect = C.width / C.height;
      camera.position.copy(rest.current.pos);
      camera.quaternion.copy(rest.current.quat);
      camera.updateProjectionMatrix();
      shared.phoneOut.current = 0;
      shared.flight.current = 0;
    }
  });

  return null;
}

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#0a0f1a']} />
      <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
      <Lightformer form="rect" intensity={4} color="#ffffff" position={[-5, 2, 3]} rotation-y={Math.PI / 3} scale={[1.2, 8, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#f2f5fa" position={[0, 1.5, 8]} rotation-y={Math.PI} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#287BFF" position={[6, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 5, 1]} />
      <Lightformer form="rect" intensity={1.5} color="#dfe6f2" position={[0, 4, -6]} rotation-x={Math.PI / 8} scale={[14, 5, 1]} />
      <Lightformer form="rect" intensity={0.9} color="#0750B5" position={[-6, 0.5, -2]} rotation-y={Math.PI / 2} scale={[5, 3, 1]} />
    </Environment>
  );
}

export default function DeviceScene({ quality, reduced, experience, ...rest }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dpr = Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5);
  const shared: Shared = {
    screen: useRef<THREE.Mesh>(null!),
    phoneOut: useRef(0),
    hover: useRef(false),
    ready: useRef(false),
    flight: useRef(0),
    glare: useRef<THREE.MeshBasicMaterial>(null!),
  };

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const { phase, paused } = experience;
  const frameloop = !visible || paused ? 'never' : reduced && phase === 'idle' ? 'demand' : 'always';

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={dpr}
        camera={{ position: [0.15, 1.95, 6.6], fov: 27, near: 0.05, far: 60 }}
        frameloop={frameloop}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => camera.lookAt(0.2, 0.86, 0)}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[-3, 6, 2]} intensity={0.7} />
        <Suspense fallback={null}>
          <Studio />
          <Composition reduced={reduced} quality={quality} experience={experience} shared={shared} {...rest} />
          <Rig ex={experience} shared={shared} host={wrap} reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
