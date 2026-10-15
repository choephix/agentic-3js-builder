import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { DEG, rng } from "../../../../src/math";
import { countershade, gradient, mottle, paint, scales, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A kraken rising from a swirl of sea, eight tentacles spread wide plus two long feeders, in polished Overwatch-style sci-fi colour blocking: deep navy body, white panel trims, one strong orange accent and glowing cyan bio-lights.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: navy body, teal mid, white trim, orange accent, cyan glow
const NAVY = "#1b2a52";
const NAVY_D = "#111a38";
const BLUE = "#2f4a8f";
const TEAL = "#2aa6b8";
const WHITE = "#eef4fa";
const CREAM = "#cfe0ee";
const ORANGE = "#ff7a1a";
const ORANGE_D = "#c9500a";
const CYAN = "#46f2ff";
const STEEL = "#7d8ea8";
const DARK = "#0b1020";
const WATER = "#1d6f9e";
const WATER_D = "#154f78";
const FOAM = "#e8f6ff";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "kraken", detail: 1, paintSize: 2048 });
  const R = rng(7);

  // ---------- Textures ----------
  const ring = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#ffffff"/><circle cx="32" cy="32" r="17" fill="#8a8a8a"/><circle cx="32" cy="32" r="8" fill="#3a3a3a"/></svg>`,
    { size: 64 },
  );
  const panel = svg(
    `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="8" fill="#eef4fa" stroke="#1b2a52" stroke-width="4"/><path d="M12 32 H44 M84 32 H116" stroke="#ff7a1a" stroke-width="5"/><circle cx="64" cy="32" r="12" fill="none" stroke="#46f2ff" stroke-width="5"/><path d="M58 32 H70 M64 26 V38" stroke="#1b2a52" stroke-width="4"/></svg>`,
    { size: 256 },
  );
  const rune = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#46f2ff" stroke-width="5" stroke-linecap="round"><path d="M32 6 L32 58"/><path d="M14 20 L32 34 L50 20"/><path d="M18 46 L32 34 L46 46"/></g></svg>`,
    { size: 128 },
  );
  const glowEye = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffd36a"/><circle cx="32" cy="32" r="24" fill="#ff7a1a"/><ellipse cx="32" cy="32" rx="6" ry="20" fill="#1b0a05"/><ellipse cx="22" cy="20" rx="6" ry="4" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const wave = svg(
    `<svg viewBox="0 0 64 24"><path d="M2 20 Q10 2 22 12 Q30 18 36 8 Q46 -2 62 18" fill="none" stroke="#e8f6ff" stroke-width="5" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const fleck = svg(
    `<svg viewBox="0 0 16 32"><path d="M8 2 Q15 14 8 30 Q1 14 8 2Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );

  // ---------- Paints ----------
  const bodyPaint = paint((p, n, s) => {
    void s;
    // top navy with lighter blue band, belly cream
    if (n.y < -0.35) return CREAM;
    const g = Math.max(0, Math.min(1, (p.y - 0.8) / 1.6));
    return g > 0.55 ? BLUE : NAVY;
  });
  const mantlePaint = paint((p, n) => {
    const stripe = Math.abs(((p.x * 5.2 + p.z * 1.2) % 1) - 0.5) < 0.06 && n.y > 0.1;
    if (stripe) return ORANGE;
    const dot = (Math.sin(p.x * 16) + Math.cos(p.y * 14 + p.z * 9)) > 1.55;
    if (dot) return TEAL;
    return mottle(NAVY, BLUE, { size: 0.22, contrast: 0.7, seed: 3 }).at(p, n);
  });
  const tentPaint = (seed: number) =>
    paint((p, n, s) => {
      const t = s[0];
      const deg = s[1];
      // belly cream-ish stripe
      const belly = Math.abs(((deg + 180) % 360) - 180) > 130 || deg < -130;
      if (belly) return CREAM;
      // orange bands near tips
      const band = Math.floor(t * 14) % 4 === 0 && t > 0.15;
      if (band) return ORANGE;
      const mot = mottle(NAVY, BLUE, { size: 0.18, contrast: 0.8, seed }).at(p, n);
      return mot;
    });
  const waterPaint = paint((p, n) => {
    const r = Math.hypot(p.x, p.z);
    const ang = Math.atan2(p.z, p.x);
    const swirl = Math.sin(r * 5.5 - ang * 2.0) > 0.78;
    const ripple = Math.sin(r * 10 + Math.sin(ang * 3) * 2) > 0.93;
    if (swirl || ripple) return FOAM;
    return mottle(WATER, WATER_D, { size: 0.5, contrast: 0.8, seed: 9 }).at(p, n);
  });
  const finPaint = stripes(ORANGE, ORANGE_D, { size: 0.12, axis: "y", width: 0.35, seed: 4 });
  const plate = scales([NAVY, BLUE], WHITE, { size: 0.16, width: 0.08, seed: 6 });
  const beakPaint = gradient(STEEL, DARK, [0, 1.65, 1.35], [0, 1.35, 1.55]);
  void countershade;

  // ---------- Water base ----------
  b.lathe(
    [
      [0, 0],
      [2.7, 0],
      [2.85, 0.12],
      [2.55, 0.2],
      [2.0, 0.36],
      [1.35, 0.55],
      [0.95, 0.72],
      [0.0, 0.8],
    ],
    { at: [0, -0.01, 0], color: waterPaint, segments: 28, smoothing: 1, axis: undefined },
  );
  // foam rings around the base
  for (let i = 0; i < 3; i++) {
    const rr = 2.2 + i * 0.28;
    const path = catmull(
      Array.from({ length: 16 }, (_, k) => {
        const a = (k / 16) * Math.PI * 2;
        const wob = 1 + 0.04 * Math.sin(a * 5 + i);
        return [Math.cos(a) * rr * wob, 0.18 - i * 0.04, Math.sin(a) * rr * wob];
      }),
      { closed: true },
    );
    b.sweep(path, 0.045, FOAM, { sides: 4, detail: 0.7 });
  }
  // wave crest cards ring
  {
    const frames = [] as ReturnType<typeof b.surface> extends never ? never : any[];
    void frames;
  }
  const waveFrames: any[] = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const r0 = 1.5 + 0.9 * R();
    const x = Math.cos(a) * r0;
    const z = Math.sin(a) * r0;
    const y = 0.5 - (r0 - 1.0) * 0.18;
    waveFrames.push({ at: new THREE.Vector3(x, y, z), axis: new THREE.Vector3(0, 1, 0) });
  }
  b.cards(
    waveFrames.map((f) => ({ at: f.at, axis: f.axis }) as never),
    wave,
    { size: [0.5, 0.2], lean: 80, flow: [1, 0, 0], rng: R, vary: 0.3, spin: 180, color: FOAM },
  );

  // ---------- Mantle (head sac) ----------
  const mantle = b.loft(
    [
      { at: [0, 1.0, -0.15], w: 0.9, h: 0.8 },
      { at: [0, 1.5, -0.3], w: 1.35, h: 1.15 },
      { at: [0, 2.1, -0.45], w: 1.45, h: 1.3 },
      { at: [0, 2.75, -0.55], w: 1.15, h: 1.15 },
      { at: [0, 3.3, -0.5], w: 0.6, h: 0.65 },
      { at: [0, 3.55, -0.42], w: 0.08, h: 0.1 },
    ],
    { color: mantlePaint, sides: 12 },
  );
  // armored mantle ridge panels
  const mSurf = b.surface(mantle.meshes);
  const plateHits = mSurf.scatter(34, { rng: rng(21), minDist: 0.34, filter: (h) => h.n.y > 0.2 && h.at.y > 1.5 });
  for (const h of plateHits) {
    b.stick(new THREE.BoxGeometry(0.2, 0.025, 0.14), plate, h, {});
  }
  // mantle spine ridge
  const ridgePath = catmull([
    [0, 1.15, -1.0],
    [0, 1.9, -1.25],
    [0, 2.6, -1.2],
    [0, 3.2, -0.95],
    [0, 3.55, -0.45],
  ]);
  b.sweep(ridgePath, [0.1, 0.03], WHITE, { section: { ngon: 4 }, caps: "round" });
  b.along(ridgePath, 9, (at) => {
    b.stick(new THREE.SphereGeometry(0.06, 6, 4), ORANGE, at as never);
  });

  // fins (extruded crest fins, left and right)
  const finOutline: [number, number][] = [
    [0, 0],
    [0.6, 0.05],
    [1.15, 0.45],
    [1.35, 1.0],
    [1.05, 1.0],
    [0.7, 0.75],
    [0.25, 0.5],
  ];
  for (const s of [1, -1]) {
    const fin = b.extrude(finOutline, {
      at: [s * 0.9, 1.9, -0.75],
      x: [s * 0.8, 0.0, -0.6],
      y: [0, 1, 0],
      thickness: [0.1, 0.02],
      bevel: 0.02,
      smoothing: 1,
      color: finPaint,
    });
    // fin ribs
    for (let k = 0; k < 4; k++) {
      const u = 0.35 + k * 0.2;
      b.rod(fin.local([u, 0.12 + k * 0.1, 0.07]), fin.local([u + 0.12, 0.7 + k * 0.1, 0.05]), 0.02, WHITE, { sides: 5 });
    }
    // lower fin
    b.extrude(
      [
        [0, 0],
        [0.7, -0.2],
        [1.2, -0.05],
        [1.0, 0.25],
        [0.4, 0.3],
      ],
      {
        at: [s * 0.95, 1.3, -0.35],
        x: [s, 0, -0.55],
        thickness: [0.08, 0.02],
        bevel: 0.015,
        smoothing: 1,
        color: TEAL,
      },
    );
  }

  // ---------- Head / collar ----------
  const head = b.loft(
    [
      { at: [0, 0.85, 0.25], w: 1.35, h: 0.9 },
      { at: [0, 1.15, 0.45], w: 1.55, h: 1.0 },
      { at: [0, 1.45, 0.5], w: 1.45, h: 1.0 },
      { at: [0, 1.75, 0.35], w: 1.1, h: 0.8 },
    ],
    { color: bodyPaint, sides: 12 },
  );
  // white collar band with orange trim
  b.sweep(
    catmull(
      Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        return [Math.cos(a) * 0.82, 1.78, 0.35 + Math.sin(a) * 0.62];
      }),
      { closed: true },
    ),
    0.07,
    WHITE,
    { sides: 6 },
  );
  b.sweep(
    catmull(
      Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        return [Math.cos(a) * 0.86, 1.7, 0.35 + Math.sin(a) * 0.66];
      }),
      { closed: true },
    ),
    0.04,
    ORANGE,
    { sides: 5 },
  );
  // brow ridges
  for (const s of [1, -1]) {
    b.capsule([s * 0.2, 1.62, 0.95], [s * 0.78, 1.52, 0.62], [0.07, 0.09], NAVY_D, { sides: 6 });
    b.capsule([s * 0.2, 1.64, 0.97], [s * 0.74, 1.58, 0.66], 0.025, WHITE, { sides: 5 });
  }
  // eyes: glowing orange slit eyes on discs
  for (const s of [1, -1]) {
    const socket = b.part(new THREE.SphereGeometry(0.22, 10, 8), DARK, { at: [s * 0.52, 1.35, 0.82], scale: [1, 1, 0.65] });
    void socket;
    const eyePart = b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", {
      at: [s * 0.55, 1.36, 0.95],
      dir: [s * 0.35, 0.05, 1],
      axis: "z",
      texture: glowEye,
    });
    glow(eyePart, 1.6);
    // eye rim
    b.sweep(
      catmull(
        Array.from({ length: 10 }, (_, k) => {
          const a = (k / 10) * Math.PI * 2;
          return [s * 0.545 + Math.cos(a) * 0.19, 1.36 + Math.sin(a) * 0.19, 0.935 + s * Math.cos(a) * 0.0];
        }),
        { closed: true },
      ),
      0.025,
      STEEL,
      { sides: 4, detail: 0.6 },
    );
  }
  // glowing bio-light strip across the head
  const lightLine = catmull([
    [-0.9, 1.1, 0.8],
    [-0.45, 0.98, 1.05],
    [0, 0.94, 1.12],
    [0.45, 0.98, 1.05],
    [0.9, 1.1, 0.8],
  ]);
  glow(b.sweep(lightLine, 0.028, CYAN, { sides: 5 }), 1.4);
  b.along(lightLine, 7, (at) => {
    glow(b.stick(new THREE.SphereGeometry(0.045, 6, 4), CYAN, at as never), 1.5);
  });
  // panel decal on forehead
  b.decal(head.meshes, panel, { at: [0, 1.55, 0.88], dir: [0, 0.15, 1], size: [0.46, 0.23] });
  // glowing runes on mantle sides
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
        at: [s * 0.78, 2.35, -0.05],
        dir: [s, 0.1, 0.35],
        axis: "z",
        texture: rune,
      }),
      1.4,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
        at: [s * 0.62, 2.95, -0.1],
        dir: [s, 0.2, 0.3],
        axis: "z",
        texture: rune,
      }),
      1.4,
    );
  }

  // ---------- Beak ----------
  b.part(new THREE.SphereGeometry(0.32, 10, 8), NAVY_D, { at: [0, 0.95, 1.0], scale: [1.2, 0.8, 0.9] });
  b.spike([0, 1.05, 1.15], [0, -0.2, 0.3], 0.38, 0.17, beakPaint, { sides: 6, caps: "point" });
  b.spike([0, 0.85, 1.12], [0, 0.2, 0.2], 0.28, 0.12, DARK, { sides: 6, caps: "point" });
  // mouth ring teeth
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const cx = Math.cos(a) * 0.24;
    const cy = 0.92 + Math.sin(a) * 0.17;
    b.spike([cx, cy, 1.12], [cx * 0.6, (cy - 0.92) * 0.6, 1], 0.15, 0.03, WHITE, { sides: 4, caps: "point" });
  }

  // ---------- Tentacles ----------
  // 8 spread arms. Roots on a ring under the head, sweeping out, up and curling.
  type Arm = { az: number; reach: number; lift: number; curl: number; thick: number; seed: number };
  const arms: Arm[] = [
    { az: 20, reach: 3.0, lift: 1.9, curl: 1, thick: 0.3, seed: 1 },
    { az: -20, reach: 3.0, lift: 2.1, curl: -1, thick: 0.3, seed: 2 },
    { az: 65, reach: 3.2, lift: 1.3, curl: -1, thick: 0.31, seed: 3 },
    { az: -65, reach: 3.2, lift: 1.5, curl: 1, thick: 0.31, seed: 4 },
    { az: 110, reach: 3.3, lift: 2.3, curl: 1, thick: 0.31, seed: 5 },
    { az: -110, reach: 3.3, lift: 2.0, curl: -1, thick: 0.31, seed: 6 },
    { az: 155, reach: 3.1, lift: 1.5, curl: -1, thick: 0.3, seed: 7 },
    { az: -155, reach: 3.1, lift: 1.7, curl: 1, thick: 0.3, seed: 8 },
  ];
  const allArms: ReturnType<typeof b.sweep>[] = [];
  arms.forEach((arm, idx) => {
    const a = arm.az * DEG;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = -dz; // perpendicular for curl
    const pz = dx;
    const rootR = 0.6;
    const root: [number, number, number] = [dx * rootR, 1.05, dz * rootR + 0.1];
    const p1: [number, number, number] = [dx * (rootR + 0.9), 0.75, dz * (rootR + 0.9) + 0.1];
    const p2: [number, number, number] = [dx * (arm.reach * 0.6) + px * 0.5 * arm.curl, 0.5, dz * (arm.reach * 0.6) + pz * 0.5 * arm.curl];
    const p3: [number, number, number] = [dx * arm.reach + px * 1.0 * arm.curl, 0.55 + arm.lift * 0.2, dz * arm.reach + pz * 1.0 * arm.curl];
    const p4: [number, number, number] = [
      dx * (arm.reach * 1.12) + px * 1.45 * arm.curl,
      0.55 + arm.lift * 0.6,
      dz * (arm.reach * 1.12) + pz * 1.45 * arm.curl,
    ];
    const p5: [number, number, number] = [
      dx * (arm.reach * 0.95) + px * 1.9 * arm.curl,
      0.55 + arm.lift * 0.95,
      dz * (arm.reach * 0.95) + pz * 1.9 * arm.curl,
    ];
    const path = catmull([root, p1, p2, p3, p4, p5]);
    const sw = b.sweep(path, [arm.thick, 0.02], {
      color: tentPaint(arm.seed),
      sides: 8,
      detail: 0.8,
      caps: "point",
    });
    allArms.push(sw);
    // sucker row along the underside
    const surf = b.surface(sw.meshes);
    const hits = surf.scatter(22, { rng: rng(40 + idx), minDist: 0.17, filter: (h) => h.n.y < -0.1 && h.at.y < 2.4 });
    for (const h of hits) {
      const rad = Math.max(0.03, 0.09 * (1 - path.closestT(h.at) * 0.8));
      b.stick(new THREE.CylinderGeometry(rad, rad * 1.1, 0.04, 8), ORANGE, h, {});
      b.stick(new THREE.CylinderGeometry(rad * 0.55, rad * 0.55, 0.05, 6), ORANGE_D, h, {});
    }
    // white trim cuffs
    for (const t of [0.12, 0.3]) {
      const r0 = arm.thick * (1 - t) + 0.02 * t;
      b.sweep(
        sw.line === undefined
          ? path
          : catmull(
              Array.from({ length: 8 }, (_, k) => {
                const at = path.at(t);
                const tan = path.tangentAt(t);
                const u = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
                const v = tan.clone().cross(u).normalize();
                const ang = (k / 8) * Math.PI * 2;
                return at
                  .clone()
                  .addScaledVector(u, Math.cos(ang) * r0 * 1.12)
                  .addScaledVector(v, Math.sin(ang) * r0 * 1.12)
                  .toArray();
              }),
              { closed: true },
            ),
        0.035,
        WHITE,
        { sides: 4, detail: 0.6 },
      );
    }
    // glowing tip bulb
    glow(b.part(new THREE.IcosahedronGeometry(0.07, 0), CYAN, { at: path.at(0.995) }), 1.6);
    // bio-light dots along back
    b.along(path.slice(0.2, 0.9), 5, (at) => {
      const dir = new THREE.Vector3(0, 1, 0);
      glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { at: new THREE.Vector3().copy((at as any).at ?? (at as any).position ?? path.at(0.5)).addScaledVector(dir, 0.12) }), 1.3);
    });
  });
  void allArms;

  // two long feeder tentacles raised high with club ends
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.55, 1.3, -0.35],
      [s * 1.1, 1.6, -0.7],
      [s * 1.8, 2.6, -0.8],
      [s * 2.1, 3.7, -0.4],
      [s * 1.6, 4.5, 0.2],
      [s * 1.0, 4.85, 0.6],
    ]);
    const sw = b.sweep(path, [0.2, 0.07], {
      color: tentPaint(11 + (s > 0 ? 0 : 1)),
      sides: 8,
      detail: 0.8,
      caps: "round",
    });
    void sw;
    // club end
    const end = path.at(1);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), ORANGE, { at: end, scale: [1, 1.4, 1] });
    const hits = b.surface(sw.meshes).scatter(16, { rng: rng(60 + s), minDist: 0.2, filter: (h) => h.n.y < 0.1 });
    for (const h of hits) b.stick(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 8), ORANGE, h, {});
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.spike(
        [end.x + Math.cos(a) * 0.17, end.y + 0.1, end.z + Math.sin(a) * 0.17],
        [Math.cos(a), 0.6, Math.sin(a)],
        0.2,
        0.035,
        WHITE,
        { sides: 4, caps: "point" },
      );
    }
    glow(b.part(new THREE.IcosahedronGeometry(0.1, 0), CYAN, { at: [end.x, end.y + 0.3, end.z] }), 1.6);
  }

  // ---------- Armour on head: shoulder pauldron-like plates where arms join ----------
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.34, 8, 6), STEEL, { at: [s * 0.95, 1.4, 0.35], scale: [1, 0.7, 1.1] });
    b.part(new THREE.TorusGeometry(0.3, 0.04, 5, 10), WHITE, { at: [s * 0.95, 1.4, 0.35], rotation: [90, 0, 0] });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [s * 1.0, 1.55, 0.55] }), 1.5);
  }

  // ---------- Spray cards ----------
  const sprayFrames: any[] = [];
  for (let i = 0; i < 30; i++) {
    const a = R() * Math.PI * 2;
    const r0 = 0.8 + R() * 2.2;
    sprayFrames.push({ at: new THREE.Vector3(Math.cos(a) * r0, 0.45 + R() * 0.25, Math.sin(a) * r0), axis: new THREE.Vector3(0, 1, 0) });
  }
  b.cards(sprayFrames as never, fleck, { size: [0.08, 0.28], lean: 20, flow: [0, 0, 1], rng: R, vary: 0.4, spin: 180, color: FOAM, cross: true });
  void ring;
  void polyline;
  void NAVY_D;

  return b.root;
}
