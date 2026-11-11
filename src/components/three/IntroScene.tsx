import { Suspense, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------------------------------------
 * SYF AGENCY opening sequence — WebGL layer.
 * A chrome ring around a liquid-metal core, a volumetric cobalt light cone, layered particles.
 * Every value is driven by the GSAP timeline in OpeningSequence through `v` (0 → 1 channels).
 * ---------------------------------------------------------------------------------------------- */

export type IntroValues = {
  atmosphere: number; // particles + glow presence
  emerge: number; // sculpture appears
  recede: number; // sculpture steps back behind the logo
  exit: number; // camera pushes through the ring
};

type Props = {
  v: MutableRefObject<IntroValues>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  quality: 'high' | 'mid';
};

const { lerp, damp } = THREE.MathUtils;

/* ---------- particles ---------- */

const particleVert = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixel;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aPhase * 6.2831) * 0.35;
    p.x += cos(uTime * 0.18 + aPhase * 4.0) * 0.25;
    p.z = mod(p.z + uTime * 0.6 + 22.0, 28.0) - 22.0; // slow drift toward the camera
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (14.0 / -mv.z);
    vAlpha = smoothstep(-22.0, -14.0, p.z) * (1.0 - smoothstep(2.0, 5.5, p.z));
  }
`;
const particleFrag = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.35, 0.5 - d));
    gl_FragColor = vec4(col, a * a * vAlpha * uOpacity);
  }
`;

function Particles({ v, count }: { v: Props['v']; count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = Math.random() * -28 + 6;
      size[i] = Math.random() < 0.06 ? 3.5 + Math.random() * 3 : 0.8 + Math.random() * 1.6;
      phase[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPixel: { value: Math.min(window.devicePixelRatio, 2) },
      uColorA: { value: new THREE.Color('#287BFF') },
      uColorB: { value: new THREE.Color('#F5F7FF') },
    }),
    [],
  );
  useFrame(({ clock }) => {
    mat.current.uniforms.uTime.value = clock.elapsedTime;
    mat.current.uniforms.uOpacity.value = v.current.atmosphere;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={particleVert} fragmentShader={particleFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ---------- volumetric light ---------- */

const beamVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const beamFrag = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    float facing = pow(abs(dot(normalize(vN), normalize(vView))), 1.6);
    float along = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
    gl_FragColor = vec4(uColor, facing * along * uIntensity);
  }
`;

function Beam({ v }: { v: Props['v'] }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uIntensity: { value: 0 }, uColor: { value: new THREE.Color('#287BFF') } }), []);
  useFrame(({ clock }) => {
    const { atmosphere, exit } = v.current;
    mat.current.uniforms.uIntensity.value = (0.12 + Math.sin(clock.elapsedTime * 0.8) * 0.02) * atmosphere * (1 - exit);
  });
  return (
    <mesh position={[0, 3.2, -3]} rotation={[0, 0, 0]}>
      <coneGeometry args={[4.2, 12, 64, 1, true]} />
      <shaderMaterial ref={mat} vertexShader={beamVert} fragmentShader={beamFrag} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
}

/* ---------- sculpture ---------- */

function Sculpture({ v, quality }: { v: Props['v']; quality: Props['quality'] }) {
  const group = useRef<THREE.Group>(null!);
  const outer = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.MeshBasicMaterial>(null!);
  const glowTex = useGlowTexture();
  const seg = quality === 'high' ? 220 : 120;
  const size = useThree((st) => st.size);
  const fit = Math.min(1, Math.max(0.55, (size.width / size.height) * 1.35)); // keep rings inside portrait screens

  useFrame(({ clock }) => {
    const { emerge, recede, atmosphere } = v.current;
    const t = clock.elapsedTime;
    // forms, then opens up into a halo that frames the logo
    group.current.scale.setScalar(lerp(0.001, 1, emerge) * (1 + recede * 0.12) * fit);
    group.current.position.z = lerp(-3, 0, emerge) - recede * 1.9;
    // gyroscope: two chrome rings on different axes, aligning to face the camera on recede
    outer.current.rotation.set(lerp(1.05 + Math.sin(t * 0.35) * 0.12, 0.08, recede), lerp(t * 0.3, 0, recede), 0);
    inner.current.rotation.set(lerp(-0.5 + Math.cos(t * 0.4) * 0.2, 0.0, recede), lerp(1.2 - t * 0.45, 0.12, recede), lerp(t * 0.2, 0, recede));
    halo.current.rotation.set(lerp(1.25, 0, recede), 0, -t * 0.12);
    glow.current.opacity = 0.26 * atmosphere;
  });

  return (
    <group ref={group}>
      {/* soft backlight */}
      <mesh position={[0, 0, -2.5]} scale={7}>
        <planeGeometry />
        <meshBasicMaterial ref={glow} map={glowTex} color="#0750B5" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[1.75, 0.12, 48, seg]} />
        <meshPhysicalMaterial color="#C5D0E0" metalness={1} roughness={0.14} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.2} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[1.38, 0.05, 32, seg]} />
        <meshPhysicalMaterial color="#F5F7FF" metalness={1} roughness={0.1} clearcoat={1} envMapIntensity={1.3} />
      </mesh>
      <mesh ref={halo}>
        <torusGeometry args={[2.3, 0.008, 12, 220]} />
        <meshStandardMaterial color="#F5F7FF" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ---------- camera ---------- */

function CameraRig({ v, pointer }: Pick<Props, 'v' | 'pointer'>) {
  const p = useRef({ x: 0, y: 0 });
  useFrame(({ camera, clock }, dt) => {
    const { emerge, exit } = v.current;
    p.current.x = damp(p.current.x, pointer.current.x, 2.5, dt);
    p.current.y = damp(p.current.y, pointer.current.y, 2.5, dt);
    const t = clock.elapsedTime;
    // slow dolly-in, subtle orbit, then a push straight through the ring
    const z = lerp(11, 7.2, emerge) - exit * 7.6;
    camera.position.set(Math.sin(t * 0.2) * 0.35 + p.current.x * 0.45, Math.cos(t * 0.17) * 0.18 - p.current.y * 0.3, z);
    camera.lookAt(0, 0, -2);
  });
  return null;
}

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#070A12']} />
      <Lightformer form="rect" intensity={4} color="#ffffff" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={6} color="#ffffff" position={[-4, 0, 3]} rotation-y={Math.PI / 3} scale={[0.6, 9, 1]} />
      <Lightformer form="rect" intensity={2.6} color="#287BFF" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#0750B5" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[12, 6, 1]} />
      <Lightformer form="ring" intensity={2} color="#F5F7FF" position={[2, 2, 6]} scale={2} />
    </Environment>
  );
}

export default function IntroScene({ v, pointer, quality }: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={Math.min(window.devicePixelRatio, quality === 'high' ? 1.75 : 1.25)}
      camera={{ position: [0, 0, 11], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 2.5, 2]} intensity={6} color="#287BFF" distance={12} />
      <Suspense fallback={null}>
        <Studio />
        <Sculpture v={v} quality={quality} />
      </Suspense>
      <Beam v={v} />
      <Particles v={v} count={quality === 'high' ? 1400 : 520} />
      <CameraRig v={v} pointer={pointer} />
    </Canvas>
  );
}
