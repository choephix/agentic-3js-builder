import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { DEG, rng } from "../../../../src/math";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A towering kraken surfacing from a ripple of sea, nine tentacles spread wide, glowing amber eyes and bioluminescent seams on a deep indigo hull in a polished Overwatch-style look.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: indigo hull, pale-blue belly, ONE accent colour (hot amber).
const BODY = "#34408f";
const SHADOW = "#1b2152";
const HIGH = "#6384d8";
const BELLY = "#a9c6ec";
const BELLY_SH = "#6f8ec8";
const ORANGE = "#ff8a1e";
const ORANGE_DIM = "#e8741a";
const PLATE = "#3a3f5c";
const PLATE_LIGHT = "#5a6290";
const HORN = "#efe0bd";
const HORN_DARK = "#9a7650";
const FOAM = "#cfeaf2";
const LIP = "#2a2250";
const CREAM = "#f4dcc8";
const PIT = "#4b2a66";
const DARK = "#14111f";

const hash = (x: number) => {
  const v = Math.sin(x * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

const shade = (p: THREE.Vector3, n: THREE.Vector3) => {
  const cl = cells(p, 0.3, 3);
  if (hash(cl.id) > 0.92 && cl.d1 < 0.055 && n.y > -0.2) return ORANGE_DIM;
  let c = mix(SHADOW, BODY, smoothstep(-0.6, 0.45, n.y));
  c = mix(c, HIGH, smoothstep(0.45, 1, n.y) * 0.55);
  if (cl.d2 - cl.d1 < 0.03) c = mix(c, SHADOW, 0.6);
  else c = mix(c, SHADOW, noise(p, 0.7, 5) * 0.35);
  return c;
};

const SKIN = paint((p, n) => shade(p, n));

const armPaint = (L: number) =>
  paint((p, n, s) => {
    const belly = Math.cos(s[1] * DEG) < -0.4;
    if (belly) return n.y < -0.6 ? BELLY_SH : BELLY;
    if (s[0] > 0.3 && (s[0] * L) % 1.1 < 0.09) return ORANGE_DIM;
    return shade(p, n);
  });

const FIN = paint((p, n, s) => {
  const ang = Math.atan2(s[1] + 1.1, s[0] + 0.05);
  if (s[0] > 1.55) return mix(ORANGE_DIM, BODY, smoothstep(1.55, 2.1, s[0]) * 0.4);
  if (Math.abs(Math.sin(ang * 14)) > 0.88) return mix(SHADOW, BODY, 0.4);
  return shade(p, n);
});

const MANTLE: OutlinePoint[] = [
  [0, 0],
  [1.1, 0.05],
  [1.55, 0.7],
  [1.7, 1.7],
  [1.45, 2.7],
  [0.95, 3.4],
  [0.45, 3.8],
  [0, 3.95],
];
const prof = (h: number) => {
  for (let i = 1; i < MANTLE.length; i++) {
    const a = MANTLE[i - 1]!;
    const b = MANTLE[i]!;
    if (h <= b[1]) return a[0] + ((b[0] - a[0]) * (h - a[1])) / (b[1] - a[1]);
  }
  return 0;
};

// Mantle leans back 12 degrees about its base.
const MANTLE_AT = new THREE.Vector3(0, 1.4, -0.4);
const SIN12 = Math.sin(12 * DEG);
const COS12 = Math.cos(12 * DEG);
const mc = (h: number) => new THREE.Vector3(0, MANTLE_AT.y + COS12 * h, MANTLE_AT.z - SIN12 * h);

type Arm = { a: number; L: number; rise: number; curl: number; tip: number };
const ARMS: Arm[] = [
  { a: -20, L: 4.4, rise: 0.4, curl: 22, tip: 1.0 },
  { a: 25, L: 5.2, rise: 0.8, curl: -26, tip: 1.2 },
  { a: 65, L: 5.8, rise: 3.0, curl: 34, tip: 2.0 },
  { a: 100, L: 6.2, rise: 0.3, curl: -30, tip: 0.7 },
  { a: 145, L: 5.4, rise: 1.0, curl: 38, tip: 1.5 },
  { a: 185, L: 5.8, rise: 3.8, curl: -30, tip: 2.2 },
  { a: 230, L: 5.4, rise: 0.5, curl: 30, tip: 0.8 },
  { a: 275, L: 6.2, rise: 0.4, curl: -28, tip: 0.7 },
  { a: 320, L: 5.6, rise: 2.7, curl: 34, tip: 2.0 },
];
const rad = (u: number) => 0.62 * Math.pow(1 - u, 0.85) + 0.07;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "kraken" });
  const rand = rng(11);
  const up = new THREE.Vector3(0, 1, 0);

  // ---- body, mantle, head ----
  b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { at: [0, 1.15, 0.3], scale: [2.0, 1.15, 1.9] });
  const mantle = b.lathe(MANTLE, { at: MANTLE_AT, rotation: [-12, 0, 0], segments: 14, smoothing: 1, color: SKIN });
  b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { at: [0, 1.75, 1.15], scale: [1.55, 1.2, 1.35] });

  // mantle armour bands
  for (const [h, r, col] of [
    [1.2, 0.1, PLATE],
    [2.3, 0.07, PLATE_LIGHT],
    [3.0, 0.07, PLATE],
  ] as Array<[number, number, string]>) {
    const loop = b.surface(mantle).loop(mc(h), { dir: [0, COS12, -SIN12], lift: 0.02 });
    b.sweep(loop, r, { color: col, sides: 6 });
  }

  // bioluminescent seam dots along the mantle
  const skinSurf = b.surface(mantle);
  const centre = mc(2.0);
  for (let az = 0; az < 360; az += 45) {
    for (let k = 0; k < 7; k++) {
      const el = 15 + k * 9;
      const front = Math.abs(((az + 180) % 360) - 180) < 50;
      if (front && el < 45) continue;
      const hit = skinSurf.around(centre).at(az, el);
      if (!hit) continue;
      const sz = 0.085 - k * 0.007;
      glow(b.stick(new THREE.SphereGeometry(sz, 6, 4), ORANGE, hit), 1.2);
    }
  }

  // dorsal spines
  for (let i = 0; i < 7; i++) {
    const h = 0.9 + i * 0.4;
    const base = mc(h).add(new THREE.Vector3(0, -0.208, -0.978).multiplyScalar(prof(h) * 0.96));
    b.spike(base, [0, 0.55, -0.85], 0.8 - i * 0.07, 0.15, PLATE, { bands: [[0.45, PLATE_LIGHT]], sides: 6 });
  }

  // fins
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -1.0],
        [1.3, -0.6],
        [2.1, 0.4],
        [1.5, 1.2],
        [0.2, 1.0],
      ],
      { at: [s * 1.0, 3.4, -0.9], x: [s, 0, 0], thickness: [0.14, 0.05], bevel: 0.04, smoothing: 1, color: FIN },
    );
  }

  // ---- face ----
  for (const s of [1, -1]) {
    const c = new THREE.Vector3(s * 0.82, 2.05, 2.05);
    const dir = new THREE.Vector3(s * 0.35, 0.05, 1).normalize();
    glow(b.part(new THREE.SphereGeometry(0.4, 12, 8), "#ffae2b", { at: c }), 1.3);
    b.part(new THREE.BoxGeometry(0.12, 0.5, 0.06), DARK, { at: c.clone().addScaledVector(dir, 0.385), dir, axis: "z", up: [0, 1, 0] });
    b.part(new THREE.SphereGeometry(0.44, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), PLATE, {
      at: c,
      rotation: [0, 0, s * 20],
    });
    b.part(new THREE.TorusGeometry(0.42, 0.04, 5, 14), LIP, { at: c.clone().addScaledVector(dir, 0.12), dir, axis: "z" });
    // horn
    b.spike([s * 0.8, 2.7, 1.0], [s * 0.45, 0.6, -0.5], 1.3, 0.2, HORN, { bands: [[0.3, HORN_DARK]], sides: 7 });
    // cheek armour plate with rivets
    b.extrude(
      [
        [0, 0],
        [0.5, 0.3],
        [0.9, 0.1],
        [0.8, -0.4],
        [0.1, -0.5],
      ],
      { at: [s * 1.5, 1.75, 0.95], x: [0, 0, 1], thickness: 0.1, bevel: 0.03, color: PLATE },
    );
    for (const [dz, dy] of [
      [0.15, 0.0],
      [0.55, 0.05],
      [0.45, -0.25],
    ]) {
      glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), ORANGE, { at: [s * 1.57, 1.75 + dy!, 0.95 + dz!] }), 1.1);
    }
  }

  // mouth: lip ring, beak, feeding tendrils
  const lip: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    lip.push([0.5 * Math.cos(t), 1.0 + 0.45 * Math.sin(t), 2.05]);
  }
  b.sweep(catmull(lip, { closed: true }), 0.09, { color: LIP, sides: 6 });
  b.spike([0, 1.2, 1.95], [0, -0.45, 1], 0.7, 0.22, HORN, { sides: 6 });
  b.spike([0, 0.8, 1.95], [0, 0.4, 1], 0.55, 0.18, HORN_DARK, { sides: 6 });
  for (let i = 0; i < 8; i++) {
    const t = (i / 8) * Math.PI * 2;
    const cx = Math.cos(t);
    const sy = Math.sin(t);
    const base = [0.5 * cx, 1.0 + 0.45 * sy, 2.05];
    const mid = [0.75 * cx, Math.max(0.35, 1.0 + 0.5 * sy), 2.5];
    const end = [1.05 * cx, Math.max(0.3, 1.0 + 0.35 * sy + 0.1), 2.95];
    b.sweep(catmull([base, mid, end]), [0.1, 0.1, 0.02], { color: armPaint(1.2), sides: 6 });
  }

  // ---- tentacles ----
  for (const arm of ARMS) {
    const pts: number[][] = [];
    const keys: number[] = [];
    const N = 10;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const d = 1.0 + arm.L * u;
      const ang = (arm.a + arm.curl * u * u) * DEG;
      const tipLift = arm.tip * Math.pow(Math.max(0, (u - 0.7) / 0.3), 2);
      const y = rad(u) + arm.rise * Math.pow(u, 2.2) + tipLift;
      pts.push([Math.sin(ang) * d, y, Math.cos(ang) * d]);
      keys.push(rad(u));
    }
    const path = catmull(pts);
    b.sweep(path, keys, { color: armPaint(arm.L), sides: 8 });
    const n = Math.round(arm.L * 1.8);
    for (let i = 0; i < n; i++) {
      const t = 0.12 + (0.74 * i) / (n - 1);
      const p = path.at(t);
      const tan = path.tangentAt(t);
      let side = new THREE.Vector3().crossVectors(tan, up);
      if (side.length() < 0.2) side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(1, 0, 0));
      side.normalize();
      const r = rad(t);
      const rr = Math.max(0.035, r * 0.3);
      for (const s of [1, -1]) {
        const dir = side.clone().multiplyScalar(s * 0.85).add(new THREE.Vector3(0, -0.5, 0)).normalize();
        const pos = p.clone().addScaledVector(dir, r * 0.92);
        b.part(new THREE.CylinderGeometry(rr, rr * 1.1, rr * 0.5, 8, 1), CREAM, { at: pos, dir });
        b.part(new THREE.CylinderGeometry(rr * 0.55, rr * 0.55, rr * 0.5, 6, 1), PIT, {
          at: pos.clone().addScaledVector(dir, rr * 0.12),
          dir,
        });
      }
    }
    const tip = path.at(1);
    glow(b.part(new THREE.SphereGeometry(0.11, 7, 5), ORANGE, { at: [tip.x, tip.y + 0.04, tip.z] }), 1.3);
  }

  // ---- sea: ripple rings and spray ----
  for (const R of [2.7, 4.1, 5.6]) {
    const ring: number[][] = [];
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * Math.PI * 2;
      const rr = R + (rand() - 0.5) * 0.3;
      ring.push([Math.sin(t) * rr, 0.07, Math.cos(t) * rr]);
    }
    b.sweep(catmull(ring, { closed: true }), 0.07, { color: FOAM, sides: 6 });
  }
  for (let i = 0; i < 28; i++) {
    const a = rand() * Math.PI * 2;
    const d = 2.2 + rand() * 1.4;
    const r = 0.05 + rand() * 0.09;
    b.part(new THREE.SphereGeometry(r, 6, 4), FOAM, { at: [Math.sin(a) * d, 0.2 + rand() * 1.0, Math.cos(a) * d] });
  }

  return b.root;
}
