import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { mix, noise, paint, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description: "A heroic, chunky gray wolf standing alert, hand-painted fur with ruff cards, oversized paws and amber eyes.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const LIGHT = "#b9bcc2";
const MID = "#7d8189";
const DARK = "#3b3e48";
const TAN = "#a58a63";
const CREAM = "#eadfc6";
const INKC = "#17161c";
const AMBER = "#ffb81e";
const BONE = "#f2ead8";
const PAD = "#2a2025";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "grayWolf" });

  // Hand-painted coat: warm light on top, cool shadow under, cream belly, tan lower legs.
  const coat = paint((p, n) => {
    let c = mix(LIGHT, MID, noise(p, 0.08, 3));
    c = mix(c, DARK, smoothstep(0.25, 0.95, n.y) * (0.45 + 0.4 * noise(p, 0.05, 9)));
    if (n.y > 0.75) c = mix(c, "#cfd2d6", (n.y - 0.75) * 1.2 * noise(p, 0.1, 5));
    c = mix(c, TAN, smoothstep(0.38, 0.12, p.y) * 0.55);
    c = mix(c, CREAM, smoothstep(-0.15, -0.55, n.y));
    c = mix(c, "#2d303a", smoothstep(-0.3, -1, n.y) * smoothstep(0.55, 0.3, p.y) * 0.0);
    return c;
  });
  const headPaint = paint((p, n) => {
    let c = coat.at(p, n, [0, 0]);
    // dark muzzle bridge, cream lips and cheeks
    if (p.z > 0.72 && n.y > 0.3 && Math.abs(p.x) < 0.045) c = mix(c, DARK, 0.7);
    c = mix(c, CREAM, smoothstep(0.02, -0.25, n.y) * smoothstep(0.65, 0.75, p.z));
    c = mix(c, CREAM, smoothstep(0.07, 0.11, Math.abs(p.x)) * smoothstep(1.0, 0.95, p.y) * 0.8);
    return c;
  });
  const tailPaint = paint((p, n) => {
    let c = coat.at(p, n, [0, 0]);
    c = mix(c, DARK, smoothstep(0.35, 0.1, p.y) * 0.9 + 0.2 * smoothstep(-0.7, -0.9, p.z));
    return c;
  });

  // Fur tuft card
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="0.6" stop-color="#f0f0f0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M3 64 Q8 34 16 0 Q25 34 29 64 Z" fill="url(#g)"/><path d="M14 60 Q16 34 16 12" stroke="#777" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );

  // ---- Torso, neck, tail
  const body = b.sweep(catmull([[0, 0.66, -0.58], [0, 0.67, -0.12], [0, 0.69, 0.32]]), {
    radius: (t: number) => [0.17 + 0.05 * t, 0.17 + 0.05 * t * t],
    color: coat,
    sides: 10,
  });
  const neck = b.sweep(catmull([[0, 0.76, 0.28], [0, 0.88, 0.42], [0, 0.98, 0.54]]), {
    radius: [0.19, 0.155, 0.12],
    color: coat,
    sides: 8,
  });
  const tail = b.sweep(catmull([[0, 0.7, -0.55], [0, 0.63, -0.8], [0, 0.42, -0.98], [0, 0.22, -1.02]]), {
    radius: [0.06, 0.09, 0.085, 0.05, 0.012],
    color: tailPaint,
    sides: 8,
    caps: "point",
  });
  // chest and hip masses
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { at: [0, 0.64, 0.3], scale: [0.2, 0.2, 0.2] });
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { at: [0, 0.69, -0.5], scale: [0.2, 0.2, 0.2] });
  // cream bib
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { at: [0, 0.74, 0.42], scale: [0.1, 0.16, 0.08] });

  // ---- Legs
  const paw = (x: number, z: number, big: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [x, 0.05, z], scale: [0.075 * big, 0.05, 0.115 * big] });
    for (const k of [-1, 0, 1]) {
      const tx = x + k * 0.04 * big;
      b.part(new THREE.SphereGeometry(0.03 * big, 6, 4), coat, { at: [tx, 0.03, z + 0.095 * big - Math.abs(k) * 0.012] });
      b.spike([tx, 0.022, z + 0.12 * big - Math.abs(k) * 0.012], [0, -0.25, 1], 0.055, 0.012, INKC, { sides: 5, caps: "none" });
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 4), PAD, { at: [x, 0.012, z + 0.03], scale: [1.4, 0.3, 1.8] });
  };
  const furCards: Array<{ s: ReturnType<typeof b.surface>; n: number; seed: number; size: [number, number]; lean: number; filter?: (h: { n: THREE.Vector3 }) => boolean }> = [];
  for (const s of [1, -1]) {
    const fl = b.sweep(catmull([[s * 0.14, 0.66, 0.28], [s * 0.13, 0.42, 0.32], [s * 0.12, 0.24, 0.34], [s * 0.12, 0.09, 0.37]]), {
      radius: [0.075, 0.055, 0.046, 0.058],
      color: coat,
      sides: 8,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [s * 0.17, 0.67, 0.28], scale: [0.095, 0.16, 0.15] });
    b.part(new THREE.SphereGeometry(0.052, 6, 5), coat, { at: [s * 0.13, 0.4, 0.29] });
    paw(s * 0.12, 0.4, 1.0);
    furCards.push({ s: b.surface(fl), n: 14, seed: 20 + s, size: [0.03, 0.08], lean: 70, filter: (h) => h.n.z < 0.3 });

    const hl = b.sweep(catmull([[s * 0.16, 0.7, -0.48], [s * 0.19, 0.46, -0.36], [s * 0.14, 0.28, -0.54], [s * 0.13, 0.1, -0.48]]), {
      radius: [0.08, 0.06, 0.044, 0.05],
      color: coat,
      sides: 8,
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { at: [s * 0.19, 0.6, -0.42], scale: [0.1, 0.17, 0.16] });
    b.part(new THREE.SphereGeometry(0.048, 6, 5), coat, { at: [s * 0.14, 0.29, -0.55] });
    paw(s * 0.13, -0.42, 0.95);
    furCards.push({ s: b.surface(hl), n: 12, seed: 40 + s, size: [0.03, 0.09], lean: 70 });
    // dark front-leg stripe
    b.rod([s * 0.135, 0.5, 0.375], [s * 0.125, 0.14, 0.4], 0.012, DARK, { sides: 5 });
  }

  // ---- Head
  const C: [number, number, number] = [0, 1.02, 0.62];
  const h = (x: number, y: number, z: number): [number, number, number] => [C[0] + x, C[1] + y, C[2] + z];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, { at: C, scale: [0.12, 0.11, 0.14] });
  b.capsule(h(0, -0.02, 0.08), h(0, -0.05, 0.27), [0.075, 0.045], headPaint, { sides: 8 });
  b.capsule(h(0, -0.075, 0.1), h(0, -0.085, 0.25), [0.05, 0.033], headPaint, { sides: 8 });
  b.part(new THREE.SphereGeometry(0.032, 8, 6), "#17161c", { at: h(0, -0.04, 0.315), scale: [1.1, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), "#6b7080", { at: h(0.01, -0.025, 0.338) });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), CREAM, { at: h(0, -0.06, 0.02), scale: [0.8, 0.5, 1.0] });
  b.part(new THREE.SphereGeometry(0.1, 6, 5), headPaint, { at: h(0, 0.045, 0.1), scale: [0.55, 0.45, 0.95] });
  for (const s of [1, -1]) {
    // ears
    b.spike(h(s * 0.07, 0.085, -0.05), [s * 0.3, 1, -0.25], 0.18, 0.052, coat, { sides: 4 });
    b.spike(h(s * 0.072, 0.09, -0.03), [s * 0.3, 1, -0.2], 0.13, 0.034, DARK, { sides: 4 });
    b.spike(h(s * 0.07, 0.085, -0.03), [s * 0.28, 1, -0.22], 0.1, 0.03, CREAM, { sides: 4 });
    // eyes
    glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), AMBER, { at: h(s * 0.072, 0.045, 0.1), scale: [0.8, 0.8, 0.9] }), 1.2);
    b.part(new THREE.SphereGeometry(0.009, 5, 4), INKC, { at: h(s * 0.082, 0.045, 0.108) });
    b.rod(h(s * 0.042, 0.078, 0.12), h(s * 0.105, 0.056, 0.085), 0.011, INKC, { sides: 5 });
    b.rod(h(s * 0.044, 0.026, 0.125), h(s * 0.1, 0.034, 0.088), 0.007, INKC, { sides: 5 });
    b.rod(h(s * 0.05, 0.1, 0.1), h(s * 0.1, 0.085, 0.06), 0.012, DARK, { sides: 5 });
    // mouth line and fangs
    b.rod(h(s * 0.056, -0.055, 0.12), h(s * 0.04, -0.07, 0.3), 0.005, INKC, { sides: 4 });
    b.spike(h(s * 0.03, -0.06, 0.28), [0, -1, 0.1], 0.04, 0.011, BONE, { sides: 5 });
    b.spike(h(s * 0.03, -0.085, 0.25), [0, 1, 0.1], 0.03, 0.009, BONE, { sides: 5 });
    // cheek ruff blades
    for (let k = 0; k < 3; k++) {
      b.spike(h(s * 0.1, -0.02 - k * 0.025, 0.0 - k * 0.02), [s * 0.5, -0.5, -1], 0.12 - k * 0.012, 0.045, k % 2 ? CREAM : LIGHT, { sides: 5 });
    }
    // whisker spots
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.SphereGeometry(0.005, 4, 3), INKC, { at: h(s * (0.05 + k * 0.01), -0.03 - k * 0.012, 0.22 + k * 0.01) });
    }
  }

  // ---- Fur cards
  const place = (surf: ReturnType<typeof b.surface>, n: number, seed: number, size: [number, number], lean: number, filter?: (hh: { n: THREE.Vector3 }) => boolean) => {
    const hits = surf.scatter(n, { rng: rng(seed), minDist: 0.022, filter: filter ?? ((hh) => hh.n.y > -0.3) });
    b.cards(hits, tuft, { size, lean, bend: 25, vary: 0.3, spin: 15, rng: rng(seed + 100), color: coat, cross: true });
  };
  place(b.surface(neck), 90, 1, [0.045, 0.12], 55);
  place(b.surface(body), 120, 2, [0.04, 0.1], 65);
  place(b.surface(tail), 70, 3, [0.045, 0.12], 55, () => true);
  place(b.surface(skull), 30, 4, [0.03, 0.07], 75, (hh) => hh.n.z < 0.1 && hh.n.y > -0.2);
  for (const f of furCards) place(f.s, f.n, f.seed, f.size, f.lean, f.filter);
  // chest ruff
  {
    const chest = b.surface(neck);
    const hits = chest.scatter(40, { rng: rng(7), minDist: 0.025, filter: (hh) => hh.n.z > 0.1 && hh.n.y < 0.5 });
    b.cards(hits, tuft, { size: [0.045, 0.13], lean: 75, bend: 20, vary: 0.25, rng: rng(8), color: CREAM, flow: [0, -1, -0.2] });
  }
  // dorsal dark ridge
  b.along(catmull([[0, 0.89, 0.3], [0, 0.86, 0.0], [0, 0.82, -0.3], [0, 0.78, -0.55]]), 7, (at) => {
    b.spike(at, [0, 1, -0.5], 0.06, 0.03, DARK, { sides: 4 });
  });

  return b.root;
}
