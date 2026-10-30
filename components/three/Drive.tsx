"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Outlines, useGLTF } from "@react-three/drei";
import { curve, LEN, sampleAt } from "./track";
import { toon } from "./materials";
import { telemetry } from "@/lib/telemetry";
import { puffGeo } from "./World";

const CAR_URL = "/assets/models/racing-car.glb";
const CAR_SCALE = 1.25;


// recolour the CC0 model into the #60 livery: black body, teal accents
const LIVERY: Record<string, string> = {
  "Material.005": "#2a2f37", // body
  "Material.006": "#19d3c5", // wings, engine cover, helmet
  "Material.009": "#121418", // floor
  "Material.008": "#18191d", // tyres
  "Material.007": "#a3aab4", // suspension
};

function useCarParts() {
  const { scene } = useGLTF(CAR_URL);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const parts: { geo: THREE.BufferGeometry; color: string }[] = [];
    const box = new THREE.Box3();
    scene.traverse(o => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const geo = m.geometry.clone().applyMatrix4(m.matrixWorld);
      geo.computeBoundingBox();
      box.union(geo.boundingBox!);
      parts.push({ geo, color: LIVERY[(m.material as THREE.Material).name] ?? "#2a2f37" });
    });
    const c = box.getCenter(new THREE.Vector3());
    // the model's nose points down -x; turn it to face +z and sit it on the ground
    const fix = new THREE.Matrix4().makeRotationY(Math.PI / 2).multiply(new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z));
    parts.forEach(p => { p.geo.applyMatrix4(fix); p.geo.computeVertexNormals(); });
    const size = box.getSize(new THREE.Vector3());
    return { parts, length: size.x, width: size.z };
  }, [scene]);
}

function numberDecal() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#fffaf0"; c.beginPath(); c.arc(128, 128, 118, 0, Math.PI * 2); c.fill();
  c.lineWidth = 14; c.strokeStyle = "#111"; c.stroke();
  c.font = "150px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = "#e3262b"; c.fillText("60", 128, 140);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shadowTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(64, 64, 10, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

const PUFFS = 90;

/** Camera framings, blended by page scroll. Offsets are in the car's frame: +z ahead, +x to its left. */
const SHOTS: { at: number; off: [number, number, number]; look: [number, number, number] }[] = [
  { at: 0.0, off: [-8, 6.5, 14.5], look: [0, 0.6, 0] },   // the poster shot: car charging at you
  { at: 0.09, off: [-8, 6.5, 14.5], look: [0, 0.6, 0] },
  { at: 0.2, off: [0, 30, -24], look: [0, 0, 14] },       // helicopter
  { at: 0.34, off: [12, 2.8, 1], look: [0, 1, 2] },       // side tracking
  { at: 0.5, off: [0, 2.6, -9.5], look: [0, 1.2, 8] },    // onboard chase
  { at: 0.64, off: [-15, 16, 6], look: [0, 0, 4] },
  { at: 0.8, off: [0.5, 52, -4], look: [0, 0, 5] },       // top down
  { at: 0.93, off: [9, 5.5, 14], look: [0, 0.8, 0] },
  { at: 1.0, off: [9, 5.5, 14], look: [0, 0.8, 0] },
];

const ease = (x: number) => x * x * (3 - 2 * x);
function shotAt(p: number, off: THREE.Vector3, look: THREE.Vector3) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1].at) i++;
  const a = SHOTS[i], b = SHOTS[i + 1];
  const f = ease(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1));
  off.set(...a.off).lerp(new THREE.Vector3(...b.off), f);
  look.set(...a.look).lerp(new THREE.Vector3(...b.look), f);
}

export default function Drive({ reduced }: { reduced: boolean }) {
  const { parts, length, width } = useCarParts();
  const car = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const smoke = useRef<THREE.InstancedMesh>(null);
  const { camera, size } = useThree();
  const mats = useMemo(() => ({
    decal: new THREE.MeshBasicMaterial({ map: numberDecal(), transparent: true }),
    shadow: new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  }), []);

  const st = useRef({
    s: LEN * 0.955, frames: 0, boost: 0, drift: 0, lastY: 0, emit: 0, next: 0, wheel: 0, init: false,
    camPos: new THREE.Vector3(), camLook: new THREE.Vector3(),
    puffs: Array.from({ length: PUFFS }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), age: 1, life: 1, size: 1 })),
  });

  useLayoutEffect(() => {
    const m = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < PUFFS; i++) smoke.current!.setMatrixAt(i, m);
  }, []);

  const tmp = useMemo(() => ({
    off: new THREE.Vector3(), look: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
    m: new THREE.Matrix4(), q: new THREE.Quaternion(), sc: new THREE.Vector3(), v: new THREE.Vector3(),
    e: new THREE.Euler(0, 0, 0, "YXZ"),
  }), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const s = st.current;
    // tell the loader we're past shader compilation
    if (++s.frames === 3) {
      (window as Window & { __sceneReady?: boolean }).__sceneReady = true;
      dispatchEvent(new Event("sceneready"));
    }
    const g = car.current!;

    // scrolling is the throttle
    const y = window.scrollY;
    const vel = Math.abs(y - s.lastY) / Math.max(dt, 1e-3);
    s.lastY = y;
    s.boost = THREE.MathUtils.damp(s.boost, Math.min(vel * 0.02, 48), vel * 0.02 > s.boost ? 4 : 1.2, dt);
    const speed = (reduced ? 10 : 22) + s.boost;
    s.s += speed * dt;
    telemetry.kmh = Math.round(speed * 9.2);

    const t = ((s.s % LEN) + LEN) % LEN / LEN;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const heading = Math.atan2(tan.x, tan.z);
    const k = sampleAt(s.s + 6).k;
    s.drift = THREE.MathUtils.damp(s.drift, THREE.MathUtils.clamp(k * 13 * (speed / 22), -0.6, 0.6), 3, dt);

    g.position.copy(p);
    tmp.e.set(-Math.asin(tan.y), heading + s.drift, -s.drift * 0.12);
    g.rotation.copy(tmp.e);
    shadow.current!.position.set(p.x, p.y + 0.06, p.z);
    shadow.current!.rotation.set(-Math.PI / 2, 0, -(heading + s.drift));

    // tyre smoke from the rear wheels while sliding
    const slide = Math.abs(s.drift);
    s.emit += dt * (slide > 0.08 ? 26 + slide * 80 : 3 + s.boost * 0.3);
    while (s.emit > 1) {
      s.emit--;
      const pf = s.puffs[s.next];
      s.next = (s.next + 1) % PUFFS;
      s.wheel = -s.wheel || 1;
      tmp.v.set(s.wheel * width * 0.45 * CAR_SCALE, 0.45, -length * 0.42 * CAR_SCALE).applyEuler(g.rotation);
      pf.p.copy(p).add(tmp.v);
      pf.v.set((Math.random() - 0.5) * 2, 1 + Math.random() * 1.4, (Math.random() - 0.5) * 2);
      pf.age = 0;
      pf.life = 1.4 + Math.random() * 1.2;
      pf.size = (0.5 + Math.random() * 0.4) * (0.6 + Math.min(slide * 2, 1.1));
    }
    s.puffs.forEach((pf, i) => {
      if (pf.age >= pf.life) return;
      pf.age += dt;
      const f = Math.min(pf.age / pf.life, 1);
      pf.p.addScaledVector(pf.v, dt);
      const sc = f >= 1 ? 0 : pf.size * (0.35 + Math.sin(Math.PI * Math.pow(f, 0.55)) * 1.6);
      tmp.m.compose(pf.p, tmp.q.identity(), tmp.sc.set(sc, sc * 0.85, sc));
      smoke.current!.setMatrixAt(i, tmp.m);
    });
    smoke.current!.instanceMatrix.needsUpdate = true;
    smoke.current!.traverse(o => { o.frustumCulled = false; }); // puffs roam far from their bounding sphere

    // camera: blend between framings by page progress, plus a little pointer parallax
    const max = document.documentElement.scrollHeight - innerHeight;
    shotAt(max > 0 ? y / max : 0, tmp.off, tmp.look);
    const portrait = size.width < size.height;
    tmp.off.multiplyScalar(portrait ? 1.45 : 1);
    if (portrait) tmp.look.y += 3.5; // aim higher so the car sits below the hero text
    tmp.off.x += state.pointer.x * -2.2;
    tmp.off.y += state.pointer.y * 1.2;
    const rot = new THREE.Euler(0, heading, 0);
    const want = tmp.off.applyEuler(rot).add(p);
    const look = tmp.look.applyEuler(rot).add(p);
    if (!s.init) { s.camPos.copy(want); s.camLook.copy(look); s.init = true; }
    const a = 1 - Math.exp(-3.2 * dt);
    s.camPos.lerp(want, a);
    s.camLook.lerp(look, 1 - Math.exp(-6 * dt));
    camera.position.copy(s.camPos);
    if (s.boost > 12 && !reduced) {
      const j = (s.boost - 12) * 0.004;
      camera.position.x += (Math.random() - 0.5) * j;
      camera.position.y += (Math.random() - 0.5) * j;
    }
    camera.lookAt(s.camLook);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = 42 + s.boost * 0.32;
    if (Math.abs(cam.fov - fov) > 0.05) { cam.fov = THREE.MathUtils.damp(cam.fov, fov, 4, dt); cam.updateProjectionMatrix(); }
  });

  return (
    <>
      <group ref={car}>
        <group scale={CAR_SCALE}>
          {parts.map((p, i) => (
            <mesh key={i} geometry={p.geo} material={toon(p.color)}>
              <Outlines thickness={2.6} color="#0b0b0d" angle={Math.PI} />
            </mesh>
          ))}
          {/* #60 roundels on the engine cover */}
          {[1, -1].map(side => (
            <mesh key={side} position={[side * 0.36, 0.62, -0.75]} rotation={[0, side * Math.PI / 2, 0]} material={mats.decal}>
              <circleGeometry args={[0.26, 24]} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh ref={shadow} material={mats.shadow}>
        <planeGeometry args={[width * 2.2, length * 1.7]} />
      </mesh>
      <instancedMesh ref={smoke} args={[puffGeo, toon("#ffffff"), PUFFS]} frustumCulled={false}>
        <Outlines thickness={2.4} color="#5d6b75" />
      </instancedMesh>
    </>
  );
}

useGLTF.preload(CAR_URL);
