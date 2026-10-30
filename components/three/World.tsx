"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Outlines } from "@react-three/drei";
import {
  TRACK_W, samples, SAMPLES, ribbon, wall, cornerRuns, groundHeight, nearest, rng,
} from "./track";
import { toon, roadTexture, kerbTexture, checkerTexture, bannerTexture } from "./materials";

const HALF = TRACK_W / 2;
const INK = "#111111";

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(760, 760, 160, 160);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const light = new THREE.Color("#7cc45a"), mid = new THREE.Color("#5fae4a"), verge = new THREE.Color("#8fd16a");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) - 40, z = pos.getZ(i) - 10;
      pos.setX(i, x); pos.setZ(i, z);
      const near = nearest(x, z);
      pos.setY(i, groundHeight(x, z, near));
      const { d } = near;
      const patch = Math.sin(x * 0.08) * Math.cos(z * 0.07) > 0.25;
      c.copy(d < HALF + 5 ? verge : patch ? mid : light);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={toon("#ffffff", { vertexColors: true })} />;
}

function Road() {
  const { road, line, kerbs, rails, check } = useMemo(() => {
    const road = ribbon(-HALF, HALF, 0.02, 24);
    const lineL = ribbon(-HALF + 0.5, -HALF + 0.85, 0.04, 10);
    const lineR = ribbon(HALF - 0.5, HALF - 0.85, 0.04, 10);
    const kerbs: THREE.BufferGeometry[] = [];
    for (const [a, b] of cornerRuns()) {
      kerbs.push(ribbon(HALF - 0.3, HALF + 1.7, 0.09, 4, a, b));
      kerbs.push(ribbon(-HALF + 0.3, -HALF - 1.7, 0.09, 4, a, b));
    }
    const rails = [wall(HALF + 7, 0.45, 1.15), wall(-HALF - 7, 0.45, 1.15)];
    const check = ribbon(-HALF, HALF, 0.05, 1, 0, 4);
    return { road, line: [lineL, lineR], kerbs, rails, check };
  }, []);
  const mats = useMemo(() => ({
    road: toon("#ffffff", { map: roadTexture() }),
    kerb: toon("#ffffff", { map: kerbTexture() }),
    check: toon("#ffffff", { map: checkerTexture() }),
  }), []);
  const posts = useRef<THREE.InstancedMesh>(null);
  const postCount = Math.floor(SAMPLES / 6) * 2;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let n = 0;
    for (let i = 0; i < SAMPLES; i += 6) for (const s of [1, -1]) {
      const p = samples[i];
      m.makeTranslation(p.p.x + p.side.x * (HALF + 7.15) * s, p.p.y + 0.6, p.p.z + p.side.z * (HALF + 7.15) * s);
      posts.current!.setMatrixAt(n++, m);
    }
    posts.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <mesh geometry={road} material={mats.road} />
      {line.map((g, i) => <mesh key={i} geometry={g} material={toon("#fffaf0")} />)}
      {kerbs.map((g, i) => <mesh key={i} geometry={g} material={mats.kerb} />)}
      {rails.map((g, i) => <mesh key={i} geometry={g} material={toon("#c9ced6", { side: THREE.DoubleSide })} />)}
      <mesh geometry={check} material={mats.check} />
      <instancedMesh ref={posts} args={[undefined, undefined, postCount]} material={toon("#7d838c")}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
      </instancedMesh>
    </group>
  );
}

function Forest({ count }: { count: number }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const BLOBS = 3;
  useLayoutEffect(() => {
    const r = rng(42);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3();
    const greens = ["#2f7d3a", "#3f9b46", "#276b33", "#4fae4c", "#1f5e2c"].map(c => new THREE.Color(c));
    let placed = 0, tries = 0;
    while (placed < count && tries < count * 6) {
      tries++;
      const s = samples[Math.floor(r() * SAMPLES)];
      const dist = HALF + 9 + Math.pow(r(), 1.8) * 70;
      const side = r() > 0.5 ? 1 : -1;
      const x = s.p.x + s.side.x * dist * side + (r() - 0.5) * 6;
      const z = s.p.z + s.side.z * dist * side + (r() - 0.5) * 6;
      const near = nearest(x, z);
      if (near.d < HALF + 8.5) continue;
      const y = groundHeight(x, z, near);
      const size = 0.8 + r() * 0.7;
      m.compose(v.set(x, y + 1.6 * size, z), q.identity(), sc.set(size, size, size));
      trunks.current!.setMatrixAt(placed, m);
      const g = greens[Math.floor(r() * greens.length)];
      for (let b = 0; b < BLOBS; b++) {
        const bs = size * (2.6 - b * 0.55);
        q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0));
        m.compose(v.set(x + (r() - 0.5) * size * 1.4, y + size * (4 + b * 2.1), z + (r() - 0.5) * size * 1.4), q, sc.set(bs, bs * 0.9, bs));
        crowns.current!.setMatrixAt(placed * BLOBS + b, m);
        crowns.current!.setColorAt(placed * BLOBS + b, g);
      }
      placed++;
    }
    trunks.current!.count = placed;
    crowns.current!.count = placed * BLOBS;
    trunks.current!.instanceMatrix.needsUpdate = true;
    crowns.current!.instanceMatrix.needsUpdate = true;
    if (crowns.current!.instanceColor) crowns.current!.instanceColor.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]} material={toon("#6b4426")}>
        <cylinderGeometry args={[0.3, 0.45, 3.2, 6]} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, count * BLOBS]} material={toon("#ffffff")}>
        <icosahedronGeometry args={[1, 1]} />
        <Outlines thickness={2.2} color={INK} angle={Math.PI} />
      </instancedMesh>
    </group>
  );
}

const puffGeo = new THREE.SphereGeometry(1, 14, 10);
export { puffGeo };

function Clouds() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const CLOUDS = 16, PUFFS = 5;
  useLayoutEffect(() => {
    const r = rng(9), m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
    for (let c = 0; c < CLOUDS; c++) {
      const cx = (r() - 0.5) * 520 - 40, cz = (r() - 0.5) * 520, cy = 60 + r() * 30;
      for (let p = 0; p < PUFFS; p++) {
        const k = 6 + r() * 7;
        m.compose(v.set(cx + (p - 2) * 7 + r() * 3, cy + r() * 4 - (Math.abs(p - 2) * 1.5), cz + r() * 6), q, s.set(k, k * 0.75, k));
        ref.current!.setMatrixAt(c * PUFFS + p, m);
      }
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[puffGeo, toon("#ffffff"), CLOUDS * PUFFS]}>
      <Outlines thickness={2.5} color="#2a3a44" />
    </instancedMesh>
  );
}

function useFontReady(font: string) {
  const [ok, setOk] = useState(false);
  useEffect(() => { document.fonts.load(font).finally(() => setOk(true)); }, [font]);
  return ok;
}

// a banner on two posts, facing the track
function Billboard({ at, text, side, bg, fg, w = 12 }: { at: number; text: string; side: 1 | -1; bg?: string; fg?: string; w?: number }) {
  const s = samples[Math.floor(at * SAMPLES)];
  const off = (HALF + 10) * side;
  const pos: [number, number, number] = [s.p.x + s.side.x * off, s.p.y, s.p.z + s.side.z * off];
  const tex = useMemo(() => bannerTexture(text, bg, fg), [text, bg, fg]);
  // face back toward the track centre line
  const rotY = Math.atan2(-s.side.x * side, -s.side.z * side);
  const h = w / 4;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {[-1, 1].map(i => (
        <mesh key={i} position={[i * w * 0.4, 2.2, -0.2]} material={toon("#3a3f47")}>
          <boxGeometry args={[0.4, 4.4, 0.4]} />
        </mesh>
      ))}
      <mesh position={[0, 4.4 + h / 2 - 0.6, 0]} material={toon("#ffffff", { map: tex })}>
        <boxGeometry args={[w, h, 0.3]} />
        <Outlines thickness={3} color={INK} />
      </mesh>
    </group>
  );
}

function Gantry() {
  const s = samples[2];
  const tex = useMemo(() => bannerTexture("SHANKARI GP · #60", "#111", "#ffcc1a", 1024, 160), []);
  return (
    <group position={s.p} rotation={[0, s.heading, 0]}>
      {[-1, 1].map(i => (
        <mesh key={i} position={[i * (HALF + 1.5), 4, 0]} material={toon("#e3262b")}>
          <boxGeometry args={[0.9, 8, 0.9]} />
          <Outlines thickness={3} color={INK} />
        </mesh>
      ))}
      <mesh position={[0, 8.4, 0]} rotation={[0, Math.PI, 0]} material={toon("#ffffff", { map: tex })}>
        <boxGeometry args={[TRACK_W + 4.5, 1.8, 0.8]} />
        <Outlines thickness={3} color={INK} />
      </mesh>
      {/* the five lights */}
      {[-2, -1, 0, 1, 2].map(i => (
        <mesh key={i} position={[i * 1.1, 7.1, 0]} material={toon("#e3262b", { emissive: "#e3262b", emissiveIntensity: 0.6 })}>
          <sphereGeometry args={[0.38, 12, 8]} />
          <Outlines thickness={2} color={INK} />
        </mesh>
      ))}
    </group>
  );
}

const boards: { at: number; text: string; side: 1 | -1; bg?: string; fg?: string }[] = [
  { at: 0.07, text: "60+ WEBSITES SHIPPED", side: -1, bg: "#ffcc1a" },
  { at: 0.17, text: "EAU ROUGE? EASY.", side: 1 },
  { at: 0.3, text: "REACT · NEXT.JS · TS", side: -1, bg: "#19d3c5" },
  { at: 0.42, text: "BOX BOX BOX!", side: 1, bg: "#e3262b", fg: "#fffaf0" },
  { at: 0.56, text: "NO BUGS PAST THIS POINT", side: -1 },
  { at: 0.7, text: "HIRE THE #60 →", side: 1, bg: "#ffcc1a" },
  { at: 0.84, text: "DEPLOY ON FRIDAY? NO.", side: -1, bg: "#19d3c5" },
];

export default function World({ trees }: { trees: number }) {
  const fonts = useFontReady("40px Bangers");
  return (
    <group>
      <Terrain />
      <Road />
      <Forest count={trees} />
      <Clouds />
      {fonts && (
        <>
          <Gantry />
          {boards.map(b => <Billboard key={b.text} {...b} />)}
        </>
      )}
    </group>
  );
}
