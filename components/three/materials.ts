import * as THREE from "three";
import { rng } from "./track";

// 3-step light ramp = flat comic-book shading
let ramp: THREE.DataTexture | null = null;
function gradient() {
  if (ramp) return ramp;
  ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

const cache = new Map<string, THREE.MeshToonMaterial>();
export function toon(color: string, opts: THREE.MeshToonMaterialParameters = {}) {
  const key = color + JSON.stringify(Object.keys(opts));
  if (!opts.map && cache.has(key)) return cache.get(key)!;
  const m = new THREE.MeshToonMaterial({ color, gradientMap: gradient(), ...opts });
  if (!opts.map) cache.set(key, m);
  return m;
}

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat = false) {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// asphalt with swooshy cartoon streaks, like the brush marks in a comic panel
export const roadTexture = () => canvasTex(256, 512, c => {
  c.fillStyle = "#565a63"; c.fillRect(0, 0, 256, 512);
  const r = rng(7);
  c.lineCap = "round";
  for (let i = 0; i < 46; i++) {
    const x = 20 + r() * 216, y = r() * 512, len = 60 + r() * 160, bend = (r() - 0.5) * 40;
    c.strokeStyle = r() > 0.45 ? "rgba(120,126,138,.55)" : "rgba(52,55,62,.55)";
    c.lineWidth = 1.5 + r() * 3;
    for (const dy of [0, 512, -512]) {
      c.beginPath(); c.moveTo(x, y + dy); c.quadraticCurveTo(x + bend, y + dy + len / 2, x + bend * 0.3, y + dy + len); c.stroke();
    }
  }
  // dark racing line rubber down the middle
  const g = c.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0.3, "rgba(30,30,34,0)"); g.addColorStop(0.5, "rgba(30,30,34,.35)"); g.addColorStop(0.7, "rgba(30,30,34,0)");
  c.fillStyle = g; c.fillRect(0, 0, 256, 512);
}, true);

// red / yellow kerb blocks with a white lip on the track side
export const kerbTexture = () => canvasTex(64, 128, c => {
  c.fillStyle = "#e3262b"; c.fillRect(0, 0, 64, 64);
  c.fillStyle = "#ffcc1a"; c.fillRect(0, 64, 64, 64);
  c.fillStyle = "#fffaf0"; c.fillRect(0, 0, 12, 128);
  c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(0, 62, 64, 4); c.fillRect(0, 126, 64, 2);
}, true);

export const checkerTexture = () => canvasTex(128, 32, c => {
  for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) {
    c.fillStyle = (x + y) % 2 ? "#111" : "#fffaf0"; c.fillRect(x * 8, y * 8, 8, 8);
  }
});

/** Comic-style banner: cream panel, thick ink border, bold display text. */
export const bannerTexture = (text: string, bg = "#fffaf0", fg = "#111", w = 1024, h = 256) => canvasTex(w, h, c => {
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.lineWidth = 18; c.strokeStyle = "#111"; c.strokeRect(9, 9, w - 18, h - 18);
  c.font = `${Math.round(h * 0.5)}px Bangers, Impact, sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = "#111"; c.fillText(text, w / 2 + 8, h / 2 + 10);
  c.fillStyle = fg; c.fillText(text, w / 2, h / 2 + 4);
});
