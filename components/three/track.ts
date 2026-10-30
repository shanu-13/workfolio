import * as THREE from "three";

// The circuit: a closed spline with an Eau Rouge-style climb. Units are roughly metres.
export const TRACK_W = 11;
const HALF = TRACK_W / 2;

const ctrl: [number, number, number][] = [
  [0, 0, 80], [0, 0, 20], [-10, 1, -20], [10, 4, -45], [0, 7, -75], [-30, 8, -110],
  [-80, 7, -115], [-110, 5, -85], [-100, 3, -40], [-70, 1, -10], [-85, 0, 30],
  [-70, 0, 75], [-35, 0, 105], [-5, 0, 105],
];

export const curve = new THREE.CatmullRomCurve3(ctrl.map(p => new THREE.Vector3(...p)), true, "centripetal");
export const LEN = curve.getLength();

export type Sample = { p: THREE.Vector3; side: THREE.Vector3; heading: number; k: number; d: number };

const N = 900;
export const samples: Sample[] = [];
for (let i = 0; i < N; i++) {
  const t = i / N;
  const p = curve.getPointAt(t);
  const tan = curve.getTangentAt(t);
  const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize(); // points to the car's right
  samples.push({ p, side, heading: Math.atan2(tan.x, tan.z), k: 0, d: t * LEN });
}
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
for (let i = 0; i < N; i++) {
  const a = samples[(i - 2 + N) % N].heading, b = samples[(i + 2) % N].heading;
  samples[i].k = wrap(b - a) / ((4 * LEN) / N); // signed curvature, + = turning left
}

export const sampleAt = (dist: number) => samples[Math.floor((((dist % LEN) + LEN) % LEN) / LEN * N) % N];

// nearest centre-line point (coarse) — used for terrain and scenery placement
export function nearest(x: number, z: number) {
  let best = Infinity, bi = 0;
  for (let i = 0; i < N; i += 3) {
    const s = samples[i].p, dx = s.x - x, dz = s.z - z, d = dx * dx + dz * dz;
    if (d < best) { best = d; bi = i; }
  }
  return { d: Math.sqrt(best), s: samples[bi] };
}

// cheap smooth noise for rolling hills
const hill = (x: number, z: number) =>
  Math.sin(x * 0.021) * Math.cos(z * 0.017) * 7 + Math.sin(x * 0.053 + z * 0.041) * 2.5 + Math.cos(z * 0.09 - x * 0.03) * 1.2;

export function groundHeight(x: number, z: number, near = nearest(x, z)) {
  const { d, s } = near;
  const base = s.p.y - 0.35;
  const f = THREE.MathUtils.smoothstep(d, HALF + 3, HALF + 45);
  return base + f * (hill(x, z) + 4 + d * 0.04);
}

/** Strip that follows the track between two lateral offsets. u runs a→b, v runs along the track. */
export function ribbon(a: number, b: number, lift: number, vLen: number, from = 0, to = N) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const count = to - from;
  for (let j = 0; j <= count; j++) {
    const s = samples[(from + j) % N];
    for (const [off, u] of [[a, 0], [b, 1]] as const) {
      pos.push(s.p.x + s.side.x * off, s.p.y + lift, s.p.z + s.side.z * off);
      uv.push(u, (j * LEN) / N / vLen);
    }
  }
  const flip = b < a;
  for (let j = 0; j < count; j++) {
    const i = j * 2;
    if (flip) idx.push(i, i + 2, i + 1, i + 1, i + 2, i + 3);
    else idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Vertical strip (guardrail) at a lateral offset. */
export function wall(off: number, y0: number, y1: number) {
  const pos: number[] = [], idx: number[] = [];
  for (let j = 0; j <= N; j++) {
    const s = samples[j % N];
    const x = s.p.x + s.side.x * off, z = s.p.z + s.side.z * off;
    pos.push(x, s.p.y + y0, z, x, s.p.y + y1, z);
  }
  for (let j = 0; j < N; j++) { const i = j * 2; idx.push(i, i + 2, i + 1, i + 1, i + 2, i + 3); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Index ranges where the track bends enough to deserve kerbs. */
export function cornerRuns(threshold = 0.022, pad = 14) {
  const on = samples.map(s => Math.abs(s.k) > threshold);
  const grown = on.map((_, i) => { for (let o = -pad; o <= pad; o++) if (on[(i + o + N) % N]) return true; return false; });
  const runs: [number, number][] = [];
  let start = -1;
  for (let i = 0; i < N; i++) {
    if (grown[i] && start < 0) start = i;
    if (!grown[i] && start >= 0) { runs.push([start, i]); start = -1; }
  }
  if (start >= 0) runs.push([start, N]);
  return runs;
}

export const SAMPLES = N;

// seeded random so the forest looks the same on every visit
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
