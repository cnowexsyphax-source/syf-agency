import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshDistortMaterial, PerformanceMonitor, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import type { Tier } from '../../lib/device';

type Props = { tier: Exclude<Tier, 'none'>; ready: boolean };

const BLUE = new THREE.Color('#0750B5');
const BRIGHT = new THREE.Color('#287BFF');

/** Shared intro value animated by GSAP, read every frame. */
function useIntro(ready: boolean) {
  const v = useRef({ t: 0 });
  useEffect(() => {
    if (!ready) return;
    gsap.to(v.current, { t: 1, duration: 2.4, ease: 'expo.out', delay: 0.15 });
  }, [ready]);
  return v;
}

function Sculpture({ tier, ready }: Props) {
  const group = useRef<THREE.Group>(null!);
  const blob = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const intro = useIntro(ready);
  const narrow = useThree((st) => st.size.width < st.size.height);
  const detail = tier === 'high' ? 96 : 40;

  useFrame((state, dt) => {
    const t = intro.current.t;
    const scroll = Math.min(1.2, window.scrollY / window.innerHeight);
    const { pointer, size } = state;
    const aspect = size.width / size.height;
    const isNarrow = aspect < 1;
    const fit = Math.min(1, Math.max(0.58, aspect * 1.25));
    const g = group.current;

    // entrance + scroll-out
    const s = THREE.MathUtils.lerp(0.001, 1, t) * (1 - scroll * 0.35) * fit;
    g.scale.setScalar(s);
    g.position.y = THREE.MathUtils.damp(g.position.y, scroll * 1.6 + (isNarrow ? 0.95 : 0.55), 6, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, (isNarrow ? 0 : 2.1) + pointer.x * 0.2, 3, dt);

    // mouse reaction
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.35 + scroll * 0.8, 3, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.5, 3, dt);

    blob.current.rotation.y += dt * 0.18;
    blob.current.rotation.z += dt * 0.05;
    ring.current.rotation.z += dt * 0.25;
    ring.current.rotation.x = 1.15 + Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
  });

  return (
    <group ref={group}>
      <mesh ref={blob}>
        <icosahedronGeometry args={[0.92, detail]} />
        <MeshDistortMaterial
          color="#e9eef8"
          metalness={1}
          roughness={0.16}
          distort={0.52}
          speed={1.6}
          envMapIntensity={1.7}
        />
      </mesh>

      <mesh ref={ring} rotation={[1.15, 0.2, 0]}>
        <torusGeometry args={[1.6, 0.008, 16, 200]} />
        <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.15} />
      </mesh>

      <Float speed={2} rotationIntensity={1.4} floatIntensity={1.6}>
        <mesh position={[-2.2, 0.9, -0.8]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color={BRIGHT} metalness={0.6} roughness={0.2} emissive={BLUE} emissiveIntensity={0.4} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={2} floatIntensity={1.2}>
        <mesh position={[1.45, 1.05, 0.6]} rotation={[0.5, 0.4, 0]}>
          <torusGeometry args={[0.26, 0.09, 24, 64]} />
          <meshStandardMaterial color="#e8edf5" metalness={1} roughness={0.08} />
        </mesh>
      </Float>
      {!narrow && (
      <Float speed={2.4} rotationIntensity={2.5} floatIntensity={2}>
        <mesh position={[0.5, -1.45, -0.4]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color={BLUE} metalness={0.9} roughness={0.12} />
        </mesh>
      </Float>
      )}
    </group>
  );
}

function Studio() {
  // Procedural studio lighting — no HDR download. Soft white key + SYF-blue side panels.
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#0b1733']} />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, -1]} rotation-x={Math.PI / 2.4} scale={[12, 5, 1]} />
      <Lightformer form="rect" intensity={6} color="#ffffff" position={[-4.5, 1, 3]} rotation-y={Math.PI / 3} scale={[0.6, 10, 1]} />
      <Lightformer form="rect" intensity={3} color="#287BFF" position={[-6, -1, -1]} rotation-y={Math.PI / 2} scale={[8, 8, 1]} />
      <Lightformer form="rect" intensity={4} color="#0750B5" position={[6, 0, 0]} rotation-y={-Math.PI / 2} scale={[8, 10, 1]} />
      {[-1.6, 0.2, 1.8].map((y, i) => (
        <Lightformer key={y} form="rect" intensity={[1.4, 2.6, 1][i]} color={i === 1 ? "#ffffff" : "#9fc0ff"} position={[0, y, 7]} rotation-y={Math.PI} scale={[12, 0.5 + i * 0.25, 1]} />
      ))}
      <Lightformer form="circle" intensity={1.2} color="#E8EDF5" position={[4, 3, 5]} scale={2} />
      <Lightformer form="rect" intensity={1.2} color="#9fc0ff" position={[0, -5, 2]} rotation-x={-Math.PI / 2} scale={[12, 6, 1]} />
    </Environment>
  );
}

export default function HeroScene({ tier, ready }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState<number>(() => Math.min(window.devicePixelRatio, tier === 'high' ? 1.8 : 1.4));

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const camera = useMemo(() => ({ position: [0, 0, 6.2] as [number, number, number], fov: 38 }), []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={camera}
        frameloop={visible ? 'always' : 'never'}
        gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <pointLight position={[-4, -2, 2]} intensity={8} color="#287BFF" />
        <Suspense fallback={null}>
          <Studio />
          <Sculpture tier={tier} ready={ready} />
          <Sparkles count={tier === 'high' ? 70 : 28} scale={[9, 6, 4]} size={1.6} speed={0.3} opacity={0.5} color="#9fc0ff" />
        </Suspense>
      </Canvas>
    </div>
  );
}
