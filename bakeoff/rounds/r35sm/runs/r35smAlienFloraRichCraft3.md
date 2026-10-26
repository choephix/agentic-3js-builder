```ts
import * as THREE from "three";
import { createBuilder, frame, rng, mix, paint, mottle, catmull, bezier, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Pandora Glowbloom",
  description:
    "A bioluminescent alien plant in the style of Avatar's Pandora: a tall stalk with drooping neon-edged fronds, glowing spore bulbs, spiral helicoradian coils and a luminous bloom.",
};

// Palette
const DEEP = "#0d1a3a";
const INDIGO = "#1b2e6b";
const TEAL = "#1fd6c4";
const CYAN = "#52f2ff";
const MAGENTA = "#ff4fd8";
const VIOLET = "#8a5cff";
const PALE = "#c9fff6";
const SOIL = "#1a1230";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Textures
const HALO = svg(
  `<svg viewBox="0 0 64 64"><defs><radialGradient id="g"><stop offset="0" stop-color="#9ffcff" stop-opacity="0.95"/><stop offset="0.45" stop-color="#2fd6ff" stop-opacity="0.45"/><stop offset="1" stop-color="#2fd6ff" stop-opacity="0"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>`,
  { size: 64 },
);
const HALO_PINK = svg(
  `<svg viewBox="0 0 64 64"><defs><radialGradient id="g"><stop offset="0" stop-color="#ffb0f0" stop-opacity="0.95"/><stop offset="0.45" stop-color="#ff4fd8" stop-opacity="0.45"/><stop offset="1" stop-color="#ff4fd8" stop-opacity="0"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>`,
  { size: 64 },
);
const BLADE = svg(
  `<svg viewBox="0 0 32 96"><defs><linearGradient id="l" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1b6bd6"/><stop offset="0.6" stop-color="#27e0d0"/><stop offset="1" stop-color="#c9fff6"/></linearGradient></defs><path d="M16 95 C4 60 6 30 16 2 C26 30 28 60 16 95Z" fill="url(#l)" stroke="#0d1a3a" stroke-width="1.5"/><path d="M16 90 L16 10" stroke="#e8ffff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const SPORE = svg(
  `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#52f2ff"/><circle cx="16" cy="16" r="8" fill="#e8ffff"/></svg>`,
  { size: 32 },
);

// Paints
const STALK = paint((p, n, s) => {
  const base = mix(INDIGO, "#2a4aa0", Math.min(1, s[0] * 1.2));
  const ring = 0.5 + 0.5 * Math.sin(p.y * 38);
  const lit = mix(base, "#2f6fd0", 0.25 * ring);
  return mix(lit, DEEP, Math.max(0, -n.y) * 0.4);
});
const stalkMottle = mottle(STALK, "#27408f", { size: 0.08, seed: 3, contrast: 0.7 });
const frondPaint = paint((_p, _n, s) => {
  const t = s[0];
  const c = mix(mix(DEEP, "#1a5fb4", Math.min(1, t * 2)), TEAL, Math.max(0, t - 0.5) * 1.3);
  return mix(c, "#2b8fd8", 0.15 * (0.5 + 0.5 * Math.sin(s[1] * 0.08)));
});
const petalPaint = paint((_p, _n, s) => mix(mix(VIOLET, MAGENTA, Math.min(1, s[0] * 4)), PALE, Math.max(0, s[0] * 4 - 2.4)));
const rootPaint = paint((p, n) => mix(SOIL, "#2b2a63", Math.max(0, n.y) * 0.6 + 0.2 * Math.sin(p.x * 30)));

export default function build() {
  const b = createBuilder({ name: "glowbloom" });
  const r = rng(11);

  // Stalk
  const stalkPath = catmull([
    [0, 0, 0],
    [0.04, 0.5, 0.03],
    [-0.04, 1.0, 0.0],
    [0.03, 1.5, 0.04],
    [0, 1.9, 0],
  ]);
  const stalk = b.sweep(stalkPath, (t) => 0.095 * (1 - t) + 0.035, {
    color: stalkMottle,
    caps: { start: "flat", end: "round" },
    detail: 1,
  });

  // Root mound
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.26, 0.05],
      [0.15, 0.1],
      [0.09, 0.2],
      [0, 0.2],
    ],
    { at: [0, 0, 0], color: rootPaint, segments: 8, smoothing: 0 },
  );
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const d = V(Math.sin(a), 0, Math.cos(a));
    const len = 0.45 + r() * 0.25;
    b.sweep(
      bezier(V(0, 0.16, 0).addScaledVector(d, 0.07), V(0, 0.3, 0).addScaledVector(d, len * 0.4), V(0, 0.1, 0).addScaledVector(d, len * 0.8), V(0, 0.03, 0).addScaledVector(d, len)),
      [0.05, 0.008],
      { color: rootPaint, sides: 6, caps: { start: "none", end: "point" } },
    );
    // glowing root tip nodule
    glow(
      b.part(new THREE.IcosahedronGeometry(0.018, 0), CYAN, {
        at: V(0, 0.03, 0).addScaledVector(d, len + 0.005),
      }),
      1.4,
    );
  }

  // Frond helper
  const frond = (t: number, az: number, L: number, w: number, droop: number, lift: number) => {
    const p = stalk.at(t).at.clone();
    const d = V(Math.sin(az), 0, Math.cos(az));
    const up = V(0, 1, 0);
    const path = bezier(
      p.clone(),
      p.clone().addScaledVector(d, L * 0.35).addScaledVector(up, lift),
      p.clone().addScaledVector(d, L * 0.75).addScaledVector(up, lift * 0.8),
      p.clone().addScaledVector(d, L).addScaledVector(up, -droop),
    );
    const blade = b.sweep(path, (u) => [w * Math.sin(Math.PI * Math.pow(Math.min(1, u + 0.02), 0.65)) + 0.006, 0.01], {
      color: frondPaint,
      up: [0, 1, 0],
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    glow(b.sweep(blade.line(90), 0.0055, { color: CYAN, sides: 4, caps: "point" }), 1.3);
    glow(b.sweep(blade.line(-90), 0.0055, { color: CYAN, sides: 4, caps: "point" }), 1.3);
    glow(b.sweep(blade.line(0, 0.006), 0.007, { color: PALE, sides: 4, caps: "point" }), 1.1);
    // Cross veins: tiny glowing ticks along the blade
    b.along(blade, 6, (at) => {
      const t0 = at.t;
      for (const sg of [1, -1]) {
        const a = blade.at(t0, sg * 90);
        const m = blade.at(t0, 0, 0.005);
        glow(b.rod(m.at, a.at, 0.0035, CYAN, { sides: 4 }), 1.0);
      }
    });
    // spore tip
    const tip = path.at(1);
    glow(b.part(new THREE.IcosahedronGeometry(0.022, 0), MAGENTA, { at: tip }), 1.6);
    return blade;
  };

  const fronds: [number, number, number, number, number, number][] = [
    [0.18, 0.2, 0.75, 0.13, 0.35, 0.3],
    [0.2, 2.3, 0.7, 0.12, 0.3, 0.28],
    [0.22, 4.4, 0.8, 0.13, 0.4, 0.3],
    [0.45, 1.2, 0.65, 0.11, 0.3, 0.3],
    [0.48, 3.3, 0.62, 0.11, 0.28, 0.3],
    [0.5, 5.4, 0.68, 0.12, 0.34, 0.3],
    [0.7, 0.3, 0.5, 0.09, 0.2, 0.25],
    [0.72, 2.6, 0.5, 0.09, 0.22, 0.25],
    [0.74, 4.7, 0.5, 0.09, 0.2, 0.25],
  ];
  for (const f of fronds) frond(...f);

  // Glowing spots on stalk
  const skin = b.surface(stalk);
  const hits = skin.scatter(26, { rng: r, minDist: 0.1, filter: (h) => h.at.y > 0.25 });
  for (const h of hits) {
    const rad = 0.012 + r() * 0.012;
    glow(b.stick(new THREE.IcosahedronGeometry(rad, 0), r() > 0.3 ? CYAN : MAGENTA, h, { embed: 0.4 }), 1.5);
  }
  // Glowing bands round the stalk
  for (const t of [0.3, 0.55, 0.8]) {
    const lp = skin.loop(stalk.at(t), { lift: 0.004 });
    glow(b.sweep(lp, 0.006, { color: TEAL, sides: 4 }), 1.0);
  }

  // Top bloom
  const top = stalk.at(1).at.clone();
  b.lathe(
    [
      [0, -0.02],
      [0.07, 0],
      [0.1, 0.07],
      [0.12, 0.1],
      [0.09, 0.09],
      [0.05, 0.03],
      [0, 0.02],
    ],
    { at: top.clone().add(V(0, -0.04, 0)), color: INDIGO, segments: 8 },
  );
  const PETAL: [number, number][] = [
    [0, 0.0],
    [0.08, 0.045],
    [0.2, 0.06],
    [0.32, 0.03],
    [0.38, 0],
    [0.32, -0.03],
    [0.2, -0.06],
    [0.08, -0.045],
  ];
  const nP = 9;
  for (let i = 0; i < nP; i++) {
    const a = (i / nP) * Math.PI * 2;
    const rad = V(Math.sin(a), 0, Math.cos(a));
    const tilt = (50 + (i % 2) * 15) * (Math.PI / 180);
    const up = V(0, 1, 0);
    const x = rad.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(up, Math.sin(tilt));
    const y = rad.clone().multiplyScalar(-Math.sin(tilt)).addScaledVector(up, Math.cos(tilt));
    // y points mostly up-and-inward; flip so width runs along tangent via a rotated outline basis
    const tangent = V(Math.cos(a), 0, -Math.sin(a));
    void y;
    b.extrude(PETAL, {
      at: top.clone().add(V(0, 0.02, 0)).addScaledVector(rad, 0.04),
      x: [x.x, x.y, x.z],
      y: [tangent.x, tangent.y, tangent.z],
      thickness: 0.008,
      smoothing: 1,
      color: petalPaint,
    });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.06, 1), PALE, { at: top.clone().add(V(0, 0.1, 0)) }), 2);
  b.cards([frame(top.clone().add(V(0, 0.0, 0)), [0, 1, 0])], HALO, { size: 0.55, cross: true, sink: 0 });
  // stamens
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const d = V(Math.sin(a) * 0.05, 0.28 + r() * 0.1, Math.cos(a) * 0.05);
    const s0 = top.clone().add(V(0, 0.08, 0));
    b.sweep(bezier(s0, s0.clone().add(V(d.x * 0.5, d.y * 0.5, d.z * 0.5)), s0.clone().add(d)), [0.006, 0.002], { color: PALE, sides: 4, caps: "point" });
    glow(b.part(new THREE.IcosahedronGeometry(0.014, 0), MAGENTA, { at: s0.clone().add(d) }), 1.8);
  }

  // Hanging spore tendrils
  const tendril = (t: number, az: number, out: number, hang: number) => {
    const p = stalk.at(t).at.clone();
    const d = V(Math.sin(az), 0, Math.cos(az));
    const end = p.clone().addScaledVector(d, out).add(V(0, -hang, 0));
    const path = bezier(p, p.clone().addScaledVector(d, out * 1.1).add(V(0, 0.08, 0)), end);
    b.sweep(path, [0.011, 0.005], { color: VIOLET, sides: 5, caps: { start: "none", end: "flat" } });
    const orb = glow(b.part(new THREE.IcosahedronGeometry(0.04, 1), CYAN, { at: end.clone().add(V(0, -0.03, 0)) }), 1.8);
    void orb;
    glow(b.cards([frame(end.clone().add(V(0, -0.15, 0)), [0, 1, 0])], HALO, { size: 0.28, cross: true, sink: 0 }), 1);
  };
  tendril(0.62, 1.0, 0.28, 0.3);
  tendril(0.78, 3.6, 0.3, 0.34);
  tendril(0.88, 5.5, 0.22, 0.28);
  tendril(0.55, 4.0, 0.35, 0.4);

  // Helicoradian spiral coils
  const helico = (x: number, z: number, h: number, dir: number) => {
    const c = V(x, 0.02, z);
    const from = c.clone().add(V(0.09, 0, 0));
    const sp = spiral(c, from, [0, 1, 0], { turns: dir * 2.2, r1: 0.02, pitch: h / 2.2 });
    b.sweep(sp, [0.014, 0.005], { color: TEAL, sides: 5, caps: { start: "flat", end: "round" } });
    const e = sp.at(1);
    glow(b.part(new THREE.IcosahedronGeometry(0.025, 0), PALE, { at: e }), 1.8);
    glow(b.cards([frame(e.clone().add(V(0, -0.1, 0)), [0, 1, 0])], HALO_PINK, { size: 0.2, cross: true, sink: 0 }), 1);
    glow(b.sweep(sp.slice(0.3, 0.95), 0.0035, { color: CYAN, sides: 4 }), 0.8);
  };
  helico(0.5, 0.25, 0.35, 1);
  helico(-0.45, 0.3, 0.28, -1);
  helico(0.2, -0.5, 0.4, 1);

  // Ground tuft glow-blades
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const rr = 0.2 + r() * 0.5;
    tufts.push(frame([Math.sin(a) * rr, 0, Math.cos(a) * rr], [0, 1, 0]));
  }
  glow(b.cards(tufts, BLADE, { size: [0.045, 0.16], lean: 12, vary: 0.4, spin: 180, rng: r, cross: true, sink: 0.05 }), 1.1);

  // Spore motes floating
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const rr = 0.2 + r() * 0.55;
    const pos = V(Math.sin(a) * rr, 0.5 + r() * 1.5, Math.cos(a) * rr);
    glow(b.part(new THREE.OctahedronGeometry(0.01 + r() * 0.01, 0), r() > 0.5 ? CYAN : PALE, { at: pos }), 1.8);
  }
  void SPORE;

  return b.root;
}
```