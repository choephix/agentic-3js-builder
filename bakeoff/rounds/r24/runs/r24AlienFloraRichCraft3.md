```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, spiral, paint, noise, cells, mix, smoothstep, offset, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Lumen Bloom",
  description:
    "A bioluminescent Pandoran plant in the Avatar style: a fluted indigo trunk on buttress roots, spiralling neon veins, glowing seed pods, arching ruffled fronds with glowing rims and hanging lantern flowers, a crowning spire bloom with stamens, and small helicoradian spiral sprouts at the root tips.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CYAN = "#35f2e6";
const MINT = "#a6ffe0";
const MAG = "#ff4fd8";
const VIOLET = "#8a5cff";
const GOLD = "#ffd36b";
const DEEPVIO = "#3a2d86";
const COLLAR = "#2b2570";
const CALYX = "#1c2f63";
const TENDRIL = "#43379a";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BARKP = paint((p, n, s) => {
  const big = noise(p, 0.22, 3);
  let c = mix("#0d1d38", "#1c4260", big);
  const ridge = 0.5 + 0.5 * Math.sin(s[1] * DEG * 6 + noise(p, 0.3, 9) * 5);
  c = mix(c, "#060d1c", 0.4 * ridge);
  c = mix(c, "#2c8f93", 0.4 * smoothstep(0.3, 0.9, n.y) * noise(p, 0.12, 4));
  c = mix(c, "#2a1b5c", 0.5 * smoothstep(0.1, -0.8, n.y));
  const cc = cells(p, 0.075, 5);
  if (cc.d1 < 0.1 && cc.id > 0.5) c = mix(c, cc.id > 0.8 ? "#ff7be6" : "#5ff7e6", 0.9);
  return c;
});

const leafPaint = (lo: string, hi: string, vein: string, rim: string) =>
  paint((p, _n, s) => {
    const along = s[0];
    const across = s[1];
    const mid = Math.abs(across - 0.5);
    let c = mix(lo, hi, Math.min(1, along * 0.8 + noise(p, 0.18, 12) * 0.35));
    const chev = Math.abs(((along * 10 + mid * 6) % 1) - 0.5);
    if (mid < 0.03) c = mix(c, vein, 0.95);
    else if (chev < 0.07 * (1 - mid)) c = mix(c, vein, 0.75);
    if (mid > 0.44) c = mix(c, rim, 0.9);
    return c;
  });

const LEAF_TEAL = leafPaint("#103a66", "#2b9fb0", "#6dfbe8", "#35f2e6");
const LEAF_VIO = leafPaint("#2a1a66", "#7a45c8", "#ff8fe8", "#ff4fd8");
const LEAF_BLUE = leafPaint("#0f2a5e", "#2e63c4", "#8fe4ff", "#7fb4ff");

export default function build() {
  const b = createBuilder({ name: "lumen_bloom" });
  const R = rng(2025);
  const rr = (a: number, c: number) => a + (c - a) * R();

  const bead = (at: THREE.Vector3, r: number, color: string, k = 1.4, detail = 0) =>
    glow(b.part(new THREE.IcosahedronGeometry(r, detail), color, { at }), k);

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const LEAFLET = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 62 C4 48 2 26 16 2 C30 26 28 48 16 62Z" fill="#1d6f86" stroke="#0a2a45" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M16 60 L16 8" stroke="#7dfdf0" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 48 L7 38 M16 40 L9 30 M16 32 L11 23 M16 48 L25 38 M16 40 L23 30 M16 32 L21 23" stroke="#5eead8" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <circle cx="16" cy="6" r="3" fill="#ff6be0"/>
    </svg>`,
    { size: 128 },
  );
  const LANTERN = svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6fff1"/><stop offset="1" stop-color="#ff55d0"/></linearGradient></defs>
      <path d="M20 100 L20 56" stroke="#3a2f86" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M20 56 C2 56 4 22 8 12 C12 2 28 2 32 12 C36 22 38 56 20 56Z" fill="url(#g)" stroke="#1a1650" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="14" cy="22" rx="3.5" ry="7" fill="#ffffff"/>
      <path d="M12 46 Q20 52 28 46" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  let glyphDots = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    glyphDots += `<circle cx="${(32 + Math.sin(a) * 26).toFixed(1)}" cy="${(32 - Math.cos(a) * 26).toFixed(1)}" r="2.6" fill="#ff7be6"/>`;
  }
  const GLYPH = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" fill="none" stroke="#6dfff0" stroke-width="3"/>
      <path d="M32 32 a3 3 0 0 1 3 3 a6 6 0 0 1 -6 6 a9 9 0 0 1 -9 -9 a12 12 0 0 1 12 -12 a15 15 0 0 1 15 15" fill="none" stroke="#6dfff0" stroke-width="3" stroke-linecap="round"/>
      ${glyphDots}
    </svg>`,
    { size: 192 },
  );
  let podDots = "";
  for (let i = 0; i < 26; i++)
    podDots += `<circle cx="${(R() * 64).toFixed(1)}" cy="${(R() * 64).toFixed(1)}" r="${(1.2 + R() * 2).toFixed(1)}" fill="#fff0fb"/>`;
  let podLines = "";
  for (let i = 0; i < 8; i++) podLines += `<path d="M${i * 8} 0 L${i * 8} 64" stroke="#8a2fd0" stroke-width="1.4"/>`;
  const PODTEX = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7b4bff"/><stop offset="0.55" stop-color="#ff4fd8"/><stop offset="1" stop-color="#ffd0f5"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#g)"/>${podLines}${podDots}
    </svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Trunk
  const trunkPath = catmull([
    [0, 0, 0],
    [0.03, 0.5, 0.02],
    [0, 1.0, -0.04],
    [0.07, 1.5, 0.0],
    [0.12, 1.85, 0.06],
    [0.1, 2.03, 0.07],
  ]);
  const trunk = b.sweep(trunkPath, [0.25, 0.18, 0.14, 0.115, 0.095, 0.082, 0.1], {
    color: BARKP,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
  });
  const C = trunkPath.at(1).clone();
  const skin = b.surface(trunk);
  const skinHit = (t: number, azDeg: number) => {
    const c = trunkPath.at(t).clone();
    const a = azDeg * DEG;
    const d = V(Math.sin(a), 0, Math.cos(a));
    return skin.ray(c.clone().addScaledVector(d, 2), d.clone().negate());
  };

  // Collars and glowing rings
  for (const t of [0.18, 0.4, 0.62, 0.82]) {
    const c = trunkPath.at(t).clone();
    const r = trunk.at(t).radius;
    b.part(new THREE.TorusGeometry(r * 1.04, 0.02, 4, 10), COLLAR, { at: c, dir: trunkPath.tangentAt(t), axis: "z" });
  }
  for (const t of [0.3, 0.51, 0.72]) {
    const c = trunkPath.at(t).clone();
    const r = trunk.at(t).radius;
    glow(b.part(new THREE.TorusGeometry(r * 1.05, 0.008, 4, 10), MAG, { at: c, dir: trunkPath.tangentAt(t), axis: "z" }), 1.3);
  }

  // Spiralling neon veins
  for (const off of [0, 180]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 26; i++) {
      const t = 0.06 + (0.88 * i) / 26;
      pts.push(trunk.at(t, off + t * 620, 0.004).at.clone());
    }
    glow(
      b.sweep(catmull(pts), (t) => 0.005 + 0.004 * Math.abs(Math.sin(t * 50)), { color: off ? MAG : CYAN, sides: 4 }),
      1.2,
    );
  }

  // Glyph decals
  for (const [t, az] of [
    [0.18, 0],
    [0.45, -25],
    [0.68, 20],
  ]) {
    const hit = skinHit(t, az);
    if (hit) glow(b.decal(trunk, GLYPH, { at: hit.at, dir: hit.n, size: [0.1, 0.1], lift: 0.004 }), 1.2);
  }

  // Seed pods
  for (const [t, az] of [
    [0.3, 80],
    [0.4, -85],
    [0.55, 140],
    [0.62, -140],
    [0.74, 95],
    [0.82, -100],
  ]) {
    const hit = skinHit(t, az);
    if (!hit) continue;
    const n = hit.n.clone();
    const dir = n.clone().multiplyScalar(0.8).addScaledVector(UP, 0.6).normalize();
    b.part(new THREE.ConeGeometry(0.055, 0.08, 6), COLLAR, { at: hit.at.clone().addScaledVector(n, 0.02), dir });
    glow(
      b.part(new THREE.SphereGeometry(0.07, 8, 6), "#ffffff", {
        at: hit.at.clone().addScaledVector(n, 0.07).addScaledVector(dir, 0.06),
        dir,
        scale: [1, 1.5, 1],
        texture: PODTEX,
      }),
      0.9,
    );
  }

  // Glow nodules and leaflet fringe
  for (const hit of skin.scatter(22, { rng: rng(11), minDist: 0.15, filter: (h) => h.at.y > 0.35 && h.at.y < 1.9 }))
    glow(b.stick(new THREE.IcosahedronGeometry(0.026, 0), R() > 0.5 ? CYAN : MINT, hit, { embed: 0.4 }), 1.4);
  const leafHits = skin.scatter(60, {
    rng: rng(21),
    minDist: 0.07,
    filter: (h) => h.at.y > 0.5 && h.at.y < 1.95 && h.n.y > -0.4,
  });
  glow(b.cards(leafHits, LEAFLET, { size: [0.08, 0.16], lean: 55, bend: 20, vary: 0.3, rng: rng(22), sink: 0.15 }), 0.5);

  // -------------------------------------------------------------------------------------------------------------
  // Buttress roots
  const rootEnds: THREE.Vector3[] = [];
  for (let k = 0; k < 7; k++) {
    const az = k * (TAU / 7) + 0.25;
    const h = V(Math.sin(az), 0, Math.cos(az));
    const sd = V(Math.cos(az), 0, -Math.sin(az));
    const L = rr(0.85, 1.25);
    const wob = rr(-0.12, 0.12);
    const pt = (f: number, y: number, w: number) =>
      V(h.x * L * f + sd.x * wob * w, y, h.z * L * f + sd.z * wob * w);
    const end = pt(1, 0.03, 0.6);
    rootEnds.push(end);
    const root = b.sweep(catmull([pt(0.05, 0.55, 0), pt(0.25, 0.24, 0.4), pt(0.55, 0.09, 1), end]), [0.12, 0.085, 0.055, 0.03], {
      color: BARKP,
      sides: 6,
      smooth: false,
    });
    glow(b.sweep(root.line(0, 0.003).slice(0.25, 0.95), 0.006, { color: k % 2 ? CYAN : MAG, sides: 4 }), 1.2);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Fronds
  const hang: ReturnType<typeof frame>[] = [];
  function frond(
    base: THREE.Vector3,
    az: number,
    L: number,
    rise: number,
    droop: number,
    W: number,
    leafCol: typeof LEAF_TEAL,
    vein: string,
    rim: string,
    tendrils: number,
  ) {
    const h = V(Math.sin(az), 0, Math.cos(az));
    const side = V(Math.cos(az), 0, -Math.sin(az));
    const curl = rr(-0.15, 0.15) * L;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push(
        base
          .clone()
          .addScaledVector(h, L * Math.pow(t, 0.9))
          .addScaledVector(UP, rise * Math.sin(Math.PI * 0.8 * t) - droop * t * t)
          .addScaledVector(side, curl * Math.sin(Math.PI * t)),
      );
    }
    const mid = catmull(pts);
    b.sweep(mid, (t) => Math.max(0.018, 0.046 - 0.07 * t), { from: 0, to: 0.4, color: BARKP, sides: 6, smooth: false });

    const N = 11;
    const A: THREE.Vector3[] = [];
    const B: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const P = mid.at(0.3 + 0.7 * u).clone();
      const base_w = W * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.85);
      const wa = Math.max(0.01, base_w * (1 + 0.1 * Math.sin(u * 20)));
      const wb = Math.max(0.01, base_w * (1 + 0.1 * Math.sin(u * 20 + 2)));
      A.push(P.clone().addScaledVector(side, wa).addScaledVector(UP, 0.3 * wa));
      B.push(P.clone().addScaledVector(side, -wb).addScaledVector(UP, 0.3 * wb));
    }
    const pa = catmull(A);
    const pb = catmull(B);
    b.membrane(pa, pb, { color: leafCol, thickness: 0.012, rows: 4, cols: 12 });
    glow(b.sweep(mid.slice(0.3, 1), [0.012, 0.003], { color: vein, sides: 4 }), 1.1);
    glow(b.sweep(pa, 0.005, { color: rim, sides: 4 }), 1.2);
    glow(b.sweep(pb, 0.005, { color: rim, sides: 4 }), 1.2);
    bead(mid.at(1).clone().add(V(0, 0.01, 0)), 0.032, rim, 1.7);

    for (let j = 0; j < tendrils; j++) {
      const i = Math.round(rr(0.25, 0.85) * N);
      const s0 = (j % 2 ? A : B)[i].clone();
      const len = Math.min(rr(0.35, 0.8), s0.y - 0.15);
      if (len < 0.15) continue;
      const tp = [
        s0,
        s0.clone().add(V(rr(-0.04, 0.04), -len * 0.35, rr(-0.04, 0.04))),
        s0.clone().add(V(rr(-0.06, 0.06), -len * 0.7, rr(-0.06, 0.06))),
        s0.clone().add(V(rr(-0.04, 0.04), -len, rr(-0.04, 0.04))),
      ];
      const tpath = catmull(tp);
      b.sweep(tpath, [0.007, 0.002], { color: TENDRIL, sides: 4 });
      bead(tpath.at(1).clone(), 0.017, j % 2 ? CYAN : MAG, 1.5);
      bead(tpath.at(0.55).clone(), 0.01, MINT, 1.3);
    }
    for (const t of [0.12, 0.2, 0.3]) hang.push(frame(mid.at(t).clone().add(V(0, -0.02, 0)), [0, 1, 0]));
  }

  const crownBase = C.clone().add(V(0, -0.06, 0));
  for (let i = 0; i < 7; i++)
    frond(crownBase, (i * TAU) / 7 + 0.2 + rr(-0.1, 0.1), rr(1.15, 1.5), rr(0.65, 0.9), rr(0.55, 0.85), rr(0.2, 0.27), LEAF_TEAL, MINT, CYAN, 3);
  const midBase = trunkPath.at(0.8).clone();
  for (let i = 0; i < 5; i++)
    frond(midBase, (i * TAU) / 5 + 0.6 + rr(-0.1, 0.1), rr(0.9, 1.2), 0.35, 0.75, rr(0.17, 0.22), LEAF_VIO, "#ffb0f0", MAG, 3);
  const lowBase = trunkPath.at(0.5).clone();
  for (let i = 0; i < 4; i++)
    frond(lowBase, (i * TAU) / 4 + 1.0 + rr(-0.1, 0.1), rr(0.8, 1.0), 0.25, 0.8, rr(0.15, 0.19), LEAF_BLUE, "#b8f0ff", "#7fb4ff", 2);

  glow(b.cards(hang, LANTERN, { size: [0.07, 0.17], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(31) }), 1.2);

  // -------------------------------------------------------------------------------------------------------------
  // Crown bloom
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.17, 0.09],
      [0.15, 0.17],
      [0.12, 0.17],
      [0.13, 0.09],
      [0.09, 0.05],
      [0, 0.05],
    ],
    { at: C, color: CALYX, segments: 8, smoothing: 0 },
  );
  const orbC = C.clone().add(V(0, 0.16, 0));
  glow(b.part(new THREE.IcosahedronGeometry(0.075, 1), "#c9fff6", { at: orbC }), 2.2);

  const ringLine = frame(C.clone().add(V(0, 0.12, 0)), [0, 1, 0]);
  b.ring(ringLine, { count: 9, radius: 0.1, tilt: 38 }, (it) => {
    b.spike(it, it, 0.5, 0.055, { color: DEEPVIO, sides: 5 });
    bead(offset(it, it, 0.5), 0.028, MAG, 1.7);
  });
  b.ring(ringLine, { count: 7, radius: 0.05, tilt: 75 }, (it) => {
    glow(b.spike(it, it, 0.38, 0.04, { color: "#ff56d4", sides: 5 }), 0.9);
    bead(offset(it, it, 0.38), 0.02, MINT, 1.8);
  });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.3;
    const len = rr(0.35, 0.5);
    const hd = V(Math.cos(a), 0, Math.sin(a));
    const ctrl = orbC.clone().addScaledVector(UP, len * 0.8).addScaledVector(hd, len * 0.1);
    const tip = orbC.clone().addScaledVector(UP, len * 0.6).addScaledVector(hd, len * 0.7);
    b.sweep(bezier(orbC, ctrl, tip), [0.007, 0.002], { color: "#c8fff4", sides: 4 });
    bead(tip, 0.02, GOLD, 1.6);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Helicoradian sprouts at root tips
  function helico(start: THREE.Vector3, h: number, az: number) {
    const hd = V(Math.sin(az), 0, Math.cos(az));
    const top = start.clone().addScaledVector(hd, 0.12).add(V(0, h, 0));
    const stalkPts = [
      start.clone(),
      start.clone().addScaledVector(hd, 0.03).add(V(0, h * 0.35, 0)),
      start.clone().addScaledVector(hd, -0.04).add(V(0, h * 0.7, 0)),
      top,
    ];
    b.sweep(catmull(stalkPts), [0.032, 0.014], { color: BARKP, sides: 6, smooth: false });
    const c0 = top.clone().add(V(0, 0.02, 0));
    const sp = spiral(c0, c0.clone().add(V(0.17, 0, 0)), [0, 1, 0], { turns: 2.4, r1: 0.025, pitch: 0.06 });
    glow(b.sweep(sp, [0.02, 0.006], { color: CYAN, sides: 4 }), 1.3);
    bead(sp.at(1).clone(), 0.03, MINT, 1.8);
    b.ring(frame(c0, [0, 1, 0]), { count: 8, radius: 0.035, tilt: 55 }, (it) => {
      b.spike(it, it, 0.26, 0.03, { color: DEEPVIO, sides: 5 });
      bead(offset(it, it, 0.26), 0.016, MAG, 1.6);
    });
  }
  [0, 2, 4, 6].forEach((idx, j) => helico(rootEnds[idx], 0.6 + 0.12 * j, rr(0, TAU)));

  // -------------------------------------------------------------------------------------------------------------
  // Drifting spores
  for (let i = 0; i < 12; i++) {
    const a = R() * TAU;
    const rad = rr(0.4, 1.4);
    bead(V(Math.cos(a) * rad, rr(0.5, 2.6), Math.sin(a) * rad), rr(0.012, 0.022), [CYAN, MINT, GOLD, MAG][i % 4], 1.6);
  }

  return b.root;
}
```