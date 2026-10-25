```ts
import * as THREE from "three";
import { createBuilder, patches, countershade, metal as _unused, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 railgun carrier, deployed on four hydraulic stabiliser outriggers and a rear spade, with a turret-mounted twin-rail gun with glowing capacitor coils.",
};

// ---------- palette ----------
const OLIVE = "#59623f";
const DARK = "#3a4130";
const TAN = "#8a7d58";
const STEEL = "#8a93a0";
const GUNMETAL = "#3b414b";
const BLACK = "#16181c";
const RUBBER = "#1d1f22";
const LUG = "#2b2d30";
const HAZARD = "#e6b800";
const CYAN = "#58f2ff";
const RED = "#ff3b2f";
const AMBER = "#ffb23a";
const WHITE = "#f4f4ea";

// ---------- paints ----------
const camoTop = patches(OLIVE, [OLIVE, DARK, TAN, OLIVE], { size: 1.4, gap: 0.0, seed: 4 });
const CAMO = countershade(camoTop, DARK, { level: -0.55, soft: 0.3 });
const worn = paint((p, n) => {
  const base = camoTop.at(p, n);
  const dirt = smoothstep(0.9, 0.0, p.y) * 0.55 + smoothstep(0.55, 0.8, noise(p, 0.5, 11)) * 0.18;
  const c = mix(base, "#4a4132", dirt);
  const k = 0.75 + 0.25 * smoothstep(-0.9, 0.5, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});
const RAIL = paint((p, n) => {
  const t = noise(p, 0.6, 3);
  const c = mix("#6c7480", "#b9c1cc", t);
  const k = 0.8 + 0.2 * smoothstep(-0.8, 0.8, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});
const tirePaint = (zc: number) =>
  paint((p, n) => {
    if (Math.abs(n.x) > 0.6) return RUBBER;
    const a = Math.atan2(p.y - 0.8, p.z - zc);
    const f = (((a / (Math.PI * 2)) * 24) % 1 + 1) % 1;
    return f < 0.55 ? LUG : RUBBER;
  });

// ---------- textures ----------
const GLASS = svg(
  `<svg viewBox="0 0 64 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0e8"/><stop offset="1" stop-color="#1b3a52"/></linearGradient></defs>
  <rect x="1" y="1" width="62" height="30" rx="3" fill="#0e1218"/><rect x="3" y="3" width="26" height="26" rx="2" fill="url(#g)"/><rect x="32" y="3" width="29" height="26" rx="2" fill="url(#g)"/>
  <path d="M8 27 L18 5 L22 5 L12 27Z" fill="#ffffff" opacity="0.35"/><path d="M38 27 L48 5 L51 5 L41 27Z" fill="#ffffff" opacity="0.3"/></svg>`,
  { size: 192 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 48 24"><rect x="1" y="1" width="46" height="22" rx="3" fill="#0e1218"/><rect x="3" y="3" width="42" height="18" rx="2" fill="#2c5a78"/><path d="M6 20 L16 4 L21 4 L11 20Z" fill="#fff" opacity="0.3"/></svg>`,
  { size: 128 },
);
const HAZ = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${HAZARD}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15161a"/>`)
    .join("")}<rect x="0" y="0" width="64" height="16" fill="none" stroke="#15161a" stroke-width="2"/></svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 3 L58 12 V34 Q58 52 32 61 Q6 52 6 34 V12Z" fill="#14171c" stroke="#e8e2c8" stroke-width="3"/>
  <path d="M14 42 L50 22" stroke="#e8e2c8" stroke-width="4"/><path d="M14 48 L50 28" stroke="#58f2ff" stroke-width="3"/>
  <path d="M32 10 L35 18 H29Z" fill="#e6b800"/><circle cx="46" cy="21" r="4" fill="#ff3b2f"/></svg>`,
  { size: 192 },
);
const LABEL = svg(
  `<svg viewBox="0 0 160 40"><text x="6" y="24" font-family="monospace" font-weight="bold" font-size="22" fill="#eee9d2">RG-6</text>
  <text x="70" y="24" font-family="monospace" font-weight="bold" font-size="14" fill="#eee9d2">LONGSPEAR</text>
  <rect x="6" y="30" width="148" height="3" fill="#e6b800"/><text x="6" y="39" font-family="monospace" font-size="7" fill="#eee9d2">HEAVY KINETIC STRIKE - 07</text></svg>`,
  { size: 384 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#1a1d22"/>${[0, 1, 2, 3, 4, 5, 6]
    .map((i) => `<rect x="4" y="${4 + i * 5}" width="56" height="3" fill="#0a0b0d"/><rect x="4" y="${3 + i * 5}" width="56" height="1" fill="#555d68"/>`)
    .join("")}<rect x="1" y="1" width="62" height="38" fill="none" stroke="#7a828e" stroke-width="2"/></svg>`,
  { size: 192 },
);
const BOLT = svg(
  `<svg viewBox="0 0 48 48"><path d="M24 3 L46 43 H2Z" fill="${HAZARD}" stroke="#15161a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M27 14 L18 28 H25 L21 38 L31 23 H24Z" fill="#15161a"/></svg>`,
  { size: 96 },
);

// ---------- builder ----------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "railgun_carrier" });

  const hull = b.joint("hull", { at: [0, 1.8, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 2.5, -1.4], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.4, -0.3], dir: [0, 0, 1] });

  type J = ReturnType<typeof b.joint>;
  const P = (geo: THREE.BufferGeometry, color: any, at: number[], bone: J = hull, o: any = {}) =>
    b.part(geo, color, { at, bone, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], bone: J = hull, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, bone, o);
  const cyl = (r: number, h: number, color: any, at: number[], dir: number[], seg = 10, bone: J = hull, o: any = {}) =>
    P(new THREE.CylinderGeometry(r, r, h, seg), color, at, bone, { dir, flat: true, ...o });

  // ---------- main hull ----------
  b.extrude(
    [
      [-4.9, 1.1],
      [4.6, 1.1],
      [5.0, 1.4],
      [3.9, 2.5],
      [-4.9, 2.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, bevel: 0.07, color: worn, bone: hull },
  );
  // hull belly plate + bumper
  box(2.4, 0.2, 8.6, GUNMETAL, [0, 1.05, 0]);
  box(2.7, 0.35, 0.4, GUNMETAL, [0, 1.25, 4.85]);
  // deck armour strakes
  for (const s of [1, -1]) {
    box(0.18, 0.12, 8.0, DARK, [s * 1.1, 2.55, -0.6]);
    box(0.35, 0.3, 0.18, BLACK, [s * 0.9, 1.7, 4.62]);
  }
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.34, 0.2, 0.12, "#fff4c8", [s * 0.9, 1.75, 4.72], hull, { rotation: [-30, 0, 0] }), 1.4);
  }

  // ---------- fenders, wheels ----------
  const wz = [3.3, 0, -3.3];
  for (const s of [1, -1]) {
    wz.forEach((z, i) => {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: hull, at: [s * 1.9, 0.8, z], dir: [s, 0, 0] });
      cyl(0.8, 0.55, tirePaint(z), [s * 1.9, 0.8, z], [1, 0, 0], 12, w);
      cyl(0.52, 0.6, metal2(), [s * 1.9, 0.8, z], [1, 0, 0], 10, w);
      cyl(0.42, 0.12, STEEL, [s * 2.22, 0.8, z], [1, 0, 0], 10, w);
      cyl(0.18, 0.12, GUNMETAL, [s * 2.29, 0.8, z], [1, 0, 0], 8, w);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.04, 0.08, BLACK, [s * 2.27, 0.8 + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3], [1, 0, 0], 6, w);
      }
      // fender
      box(0.9, 0.1, 2.0, CAMO, [s * 1.95, 1.75, z]);
      box(0.9, 0.1, 0.5, CAMO, [s * 1.95, 1.62, z + (z >= 0 ? 1.1 : -1.1)], hull, { rotation: [z >= 0 ? 30 : -30, 0, 0] });
      box(0.1, 0.3, 1.9, DARK, [s * 2.37, 1.62, z]);
    });
  }
  for (const z of wz) cyl(0.15, 3.6, GUNMETAL, [0, 0.8, z], [1, 0, 0], 8);

  function metal2() {
    return RAIL;
  }

  // ---------- cab ----------
  b.extrude(
    [
      [-0.9, 0],
      [1.1, 0],
      [0.5, 1.0],
      [-0.9, 1.0],
    ],
    { at: [0, 2.5, 2.5], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: CAMO, bone: hull },
  );
  b.part(new THREE.PlaneGeometry(1.95, 0.9), "#ffffff", {
    bone: hull,
    at: [0, 3.0 + 0.006, 3.3 + 0.01],
    dir: [0, 0.514, 0.857],
    axis: "z",
    texture: GLASS,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.2, 0.5), "#ffffff", {
      bone: hull,
      at: [s * 1.112, 3.02, 2.5],
      dir: [s, 0, 0],
      axis: "z",
      texture: SIDEWIN,
    });
    box(0.12, 0.25, 0.5, BLACK, [s * 1.15, 3.35, 3.0]); // mirror
    glow(box(0.1, 0.1, 0.1, AMBER, [s * 1.1, 3.55, 3.0]), 1.5);
  }
  box(2.3, 0.1, 1.7, DARK, [0, 3.52, 2.2]);
  glow(box(1.4, 0.08, 0.1, RED, [0, 3.62, 2.9], hull), 1.2);
  // roof sensor
  cyl(0.14, 0.25, GUNMETAL, [0.6, 3.68, 1.9], [0, 1, 0], 8);
  glow(P(new THREE.SphereGeometry(0.1, 6, 4), CYAN, [0.6, 3.85, 1.97]), 1.5);

  // ---------- rear deck ----------
  box(1.5, 0.9, 0.8, CAMO, [0, 2.95, -4.35]);
  b.part(new THREE.PlaneGeometry(1.3, 0.78), "#ffffff", { bone: hull, at: [0, 2.95, -4.756], dir: [0, 0, -1], axis: "z", texture: GRILLE });
  for (const s of [1, -1]) {
    cyl(0.17, 1.0, GUNMETAL, [s * 1.05, 3.0, -4.5], [0, 1, 0], 8);
    cyl(0.21, 0.1, BLACK, [s * 1.05, 3.52, -4.5], [0, 1, 0], 8);
    box(0.5, 0.35, 0.9, DARK, [s * 1.0, 2.7, -3.9]);
  }
  // hull side graphics
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.7, 0.42), "#ffffff", { bone: hull, at: [s * 1.312, 2.15, 1.7], dir: [s, 0, 0], axis: "z", texture: LABEL });
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", { bone: hull, at: [s * 1.312, 2.1, -1.9], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
  }

  // ---------- turret ----------
  b.extrude(
    [
      [-2.2, 0],
      [1.7, 0],
      [1.7, 0.9],
      [1.0, 1.35],
      [-1.6, 1.35],
      [-2.2, 0.9],
    ],
    { at: [0, 2.5, -1.4], x: [0, 0, 1], thickness: 2.5, bevel: 0.08, color: CAMO, bone: turret },
  );
  cyl(1.45, 0.14, GUNMETAL, [0, 2.55, -1.4], [0, 1, 0], 14, turret);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", { bone: turret, at: [s * 1.262, 3.25, -2.3], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    cyl(0.42, 0.28, GUNMETAL, [s * 1.38, 3.4, -0.3], [1, 0, 0], 10, turret);
    cyl(0.2, 0.1, STEEL, [s * 1.55, 3.4, -0.3], [1, 0, 0], 8, turret);
    for (let k = 0; k < 3; k++)
      cyl(0.08, 0.38, BLACK, [s * 1.3, 3.2 + k * 0.0, -1.7 - k * 0.3 + 0.0], [s * 0.7, 0.5, 0.2], 6, turret);
    box(0.12, 0.5, 1.4, DARK, [s * 1.31, 3.0, -2.9], turret);
  }
  // roof furniture
  cyl(0.42, 0.22, DARK, [-0.6, 3.95, -2.2], [0, 1, 0], 10, turret);
  cyl(0.34, 0.06, GUNMETAL, [-0.6, 4.08, -2.2], [0, 1, 0], 10, turret);
  glow(box(0.3, 0.07, 0.1, CYAN, [-0.6, 4.0, -1.8], turret), 1.3);
  box(0.9, 0.18, 0.9, GUNMETAL, [0.6, 3.9, -2.6], turret);
  b.part(new THREE.PlaneGeometry(0.35, 0.35), "#ffffff", { bone: turret, at: [0.6, 4.0, -2.6], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: BOLT });
  // radar mast
  cyl(0.05, 0.9, GUNMETAL, [0.9, 4.2, -3.2], [0, 1, 0], 6, turret);
  box(1.0, 0.18, 0.08, STEEL, [0.9, 4.7, -3.2], turret);
  glow(P(new THREE.SphereGeometry(0.06, 6, 4), RED, [0.9, 4.72, -3.2], turret), 1.5);
  b.rod([-1.0, 3.85, -3.4], [-1.0, 6.2, -3.6], 0.025, STEEL, { bone: turret });
  glow(P(new THREE.SphereGeometry(0.05, 6, 4), RED, [-1.0, 6.22, -3.6], turret), 1.5);
  // rear ammo / capacitor bank
  box(1.9, 0.9, 0.7, DARK, [0, 3.05, -3.75], turret);
  for (let k = -1; k <= 1; k++) {
    glow(cyl(0.2, 0.74, "#4cc9d6", [k * 0.6, 3.05, -4.12], [0, 0, 1], 8, turret), 0.8);
    cyl(0.23, 0.12, BLACK, [k * 0.6, 3.05, -4.0], [0, 0, 1], 8, turret);
  }

  // ---------- railgun ----------
  const gy = 3.4;
  box(1.5, 1.1, 1.8, GUNMETAL, [0, gy, -0.9], gun);
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.28, 0.55, 8.6), RAIL, [s * 0.4, gy, 3.7], gun);
    glow(P(new THREE.BoxGeometry(0.03, 0.32, 8.2), CYAN, [s * 0.255, gy, 3.8], gun), 1.6);
    // muzzle flare
    box(0.34, 0.75, 0.5, STEEL, [s * 0.43, gy, 7.95], gun, { rotation: [0, 0, 0] });
    box(0.1, 0.5, 0.5, GUNMETAL, [s * 0.62, gy, 7.7], gun);
  }
  for (let z = 1.4; z <= 7.6; z += 1.2) box(0.56, 0.36, 0.28, BLACK, [0, gy, z], gun);
  box(1.1, 0.12, 0.2, GUNMETAL, [0, gy + 0.3, 8.0], gun);
  box(1.1, 0.12, 0.2, GUNMETAL, [0, gy - 0.3, 8.0], gun);
  // capacitor coils
  for (let k = 0; k < 5; k++) {
    const z = 0.7 + k * 0.62;
    cyl(0.74, 0.3, GUNMETAL, [0, gy, z], [0, 0, 1], 12, gun);
    glow(cyl(0.77, 0.08, CYAN, [0, gy, z + 0.2], [0, 0, 1], 12, gun), 1.6);
  }
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: gun, at: [0, gy + 0.745, 1.8], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: BOLT });
  // under-barrel support strut
  b.rod([0, gy - 0.55, 0.8], [0, gy - 0.9, -0.4], 0.12, GUNMETAL, { bone: gun });
  // pose gun up
  // (done at the end)

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    for (const [tag, z] of [["F", 1.65], ["R", -1.65]] as [string, number][]) {
      const nm = `stabiliser${s > 0 ? "L" : "R"}${tag}`;
      const leg = b.joint(nm, { parent: hull, at: [s * 1.3, 1.5, z], dir: [s, -0.3, 0] });
      const ex = s * 2.85;
      box(1.7, 0.4, 0.5, DARK, [s * 2.15, 1.5, z], leg);
      b.part(new THREE.PlaneGeometry(1.4, 0.3), "#ffffff", { bone: leg, at: [s * 2.1, 1.706, z], dir: [0, 1, 0], axis: "z", up: [1, 0, 0], texture: HAZ });
      cyl(0.23, 0.8, GUNMETAL, [ex, 1.4, z], [0, 1, 0], 8, leg);
      cyl(0.13, 1.15, STEEL, [ex, 0.68, z], [0, 1, 0], 8, leg);
      P(new THREE.SphereGeometry(0.2, 6, 5), BLACK, [ex, 0.32, z], leg, { flat: true });
      cyl(0.58, 0.2, DARK, [ex, 0.1, z], [0, 1, 0], 10, leg);
      cyl(0.62, 0.05, BLACK, [ex, 0.03, z], [0, 1, 0], 10, leg);
      b.rod([s * 1.3, 1.2, z], [ex, 0.95, z], 0.07, STEEL, { bone: leg });
      glow(P(new THREE.SphereGeometry(0.06, 6, 4), AMBER, [s * 1.6, 1.78, z], leg), 1.4);
    }
  }
  // rear spade
  const spade = b.joint("spade", { parent: hull, at: [0, 1.4, -4.9], dir: [0, -1, 0] });
  b.extrude(
    [
      [0, 0],
      [-0.9, 0],
      [-0.5, 1.2],
      [0.1, 1.3],
    ],
    { at: [0, 0, -4.9], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: DARK, bone: spade },
  );
  for (const s of [1, -1]) b.rod([s * 0.7, 1.9, -4.8], [s * 0.7, 0.7, -5.5], 0.1, STEEL, { bone: spade });

  b.pose(gun, { axis: [1, 0, 0], deg: -12 });
  return b.root;
}
```