// Kraken rising from the sea, tentacles spread. Overwatch style: polished stylized sci-fi creature, clean bold
// shapes (hex armour plates, shield, bevelled fins), crisp colour blocking with panel seams, and one strong
// accent colour (orange) used for glowing seams, suckers, eyes and tips.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A towering armoured kraken rising from the sea: hex-plated mantle with bevelled fins, glowing orange seams, big slit-pupil eyes, hooked beak, eight spread arms with sucker rows and two club-tipped feeding tentacles.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const C = {
  NAVY: "#1b2a63",
  NAVY_B: "#243879",
  FLANK: "#3f73cc",
  FLANK_L: "#5a92e6",
  BELLY: "#f4e4c6",
  SEAM: "#0c1230",
  TEAL: "#46c9dc",
  TEAL_D: "#2a8db8",
  ORANGE: "#ff7a1a",
  GLOW: "#ffa43a",
  CREAM: "#f7ecd3",
  BEAK: "#1a1d3c",
  MOUTH: "#4a1238",
  SCLERA: "#f3d9a4",
  SEA_DEEP: "#1c78ab",
  SEA: "#2a9bc9",
  SEA_LIGHT: "#46c1de",
  FOAM: "#e9fbff",
};

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Body colour blocking, read by surface normal: cream head front, blue flanks, deep navy back, orange flank pinstripe.
const BODY = paint((_p, n, s) => {
  const t = s[0];
  const k = t * 15;
  const f = k - Math.floor(k);
  const az = Math.atan2(Math.abs(n.x), n.z) / DEG; // 0 front .. 90 side .. 180 back
  if (t > 0.04 && t < 0.97 && f < 0.03) return C.SEAM;
  if (Math.abs(az - 50) < 2 || Math.abs(az - 122) < 2) return C.SEAM;
  if (Math.abs(az - 86) < 1.5) return C.ORANGE;
  const alt = Math.floor(k) % 2 === 0;
  if (az < 50) return k < 5 ? C.BELLY : alt ? C.FLANK : C.FLANK_L;
  if (az < 122) return k < 5 ? C.FLANK : alt ? C.NAVY_B : C.NAVY;
  return alt ? C.NAVY : C.NAVY_B;
});

// Arm colouring on the tube clock: teal dorsal ridge, navy flanks, cream belly, seam rings, orange tip.
function armPaint(len: number, tipT: number) {
  return paint((_p, _n, s) => {
    const t = s[0];
    const a = s[1] > 180 ? 360 - s[1] : s[1];
    if (t > tipT) return C.ORANGE;
    const k = (t * len) / 0.5;
    const f = k - Math.floor(k);
    if (f < 0.07) return C.SEAM;
    if (Math.abs(a - 104) < 2.5 || Math.abs(a - 24) < 1.6) return C.SEAM;
    if (a > 104) return C.BELLY;
    if (a < 24) return Math.floor(k) % 2 ? C.TEAL : C.TEAL_D;
    return Math.floor(k) % 2 ? C.NAVY : C.NAVY_B;
  });
}

// Fin: teal ribs radiating from the root, orange leading tip.
const FIN = paint((_p, _n, s) => {
  const [x, y] = s;
  if (x > 2.3) return C.ORANGE;
  const rib = Math.atan2(y - 0.1, x + 0.6) / 0.14;
  const f = rib - Math.floor(rib);
  return f < 0.14 ? C.TEAL_D : C.TEAL;
});

const FIN_OUTLINE: OutlinePoint[] = [
  [0, -1.5],
  [1.3, -1.4],
  [3.1, 0, "sharp"],
  [1.6, 1.2],
  [0, 0.9],
];

const MOUND: OutlinePoint[] = [
  [0, -0.1, "sharp"],
  [2.9, -0.1, "sharp"],
  [2.9, 0.06],
  [2.3, 0.2],
  [1.8, 0.55],
  [1.3, 0.95],
  [0, 0.95, "sharp"],
];

type Arm = {
  name: string;
  phi: number;
  reach: number;
  peak: number;
  tipY: number;
  sway: number;
  hook: number;
  rootY: number;
  rootR: number;
  feeder: boolean;
};

const ARMS: Arm[] = [
  { name: "arm1", phi: 0, reach: 7.0, peak: 2.0, tipY: 0.1, sway: 1.2, hook: 0, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm2", phi: 45, reach: 7.4, peak: 4.6, tipY: 3.0, sway: -0.8, hook: 1.6, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm3", phi: 90, reach: 6.8, peak: 2.4, tipY: 0.1, sway: 1.0, hook: 0, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm4", phi: 135, reach: 6.0, peak: 3.6, tipY: 1.2, sway: -1.0, hook: 1.0, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm5", phi: 180, reach: 5.6, peak: 2.2, tipY: 0.1, sway: 0.9, hook: 0, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm6", phi: 225, reach: 6.4, peak: 5.0, tipY: 3.4, sway: 1.0, hook: 1.8, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm7", phi: 270, reach: 7.0, peak: 2.6, tipY: 0.1, sway: -1.1, hook: 0, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "arm8", phi: 315, reach: 6.6, peak: 3.8, tipY: 0.8, sway: 0.9, hook: 0.8, rootY: 0.95, rootR: 0.5, feeder: false },
  { name: "feedL", phi: 32, reach: 6.5, peak: 6.0, tipY: 4.2, sway: 1.6, hook: 1.5, rootY: 1.7, rootR: 0.6, feeder: true },
  { name: "feedR", phi: -32, reach: 6.5, peak: 6.0, tipY: 4.2, sway: -1.6, hook: 1.5, rootY: 1.7, rootR: 0.6, feeder: true },
];

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });

  // ---------------------------------------------------------------- skeleton and body
  const hips = b.joint("hips", { at: [0, 0.7, 0.2], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.7, 0.2],
      [0, 1.7, 0.2],
      [0, 2.9, 0],
      [0, 4.2, -0.5],
      [0, 5.5, -1.2],
      [0, 6.5, -1.9],
    ]),
    { parent: hips, count: 6, role: "spine" },
  );
  const head = spine.joints[2];
  const body = b.sweep(spine, [0.8, 1.15, 1.3, 1.15, 1.15, 0.9, 0.35], { color: BODY, name: "mantle" });
  const skin = b.surface(body);

  // ---------------------------------------------------------------- sea
  const disc = (r0: number, r1: number, top: number, color: string) =>
    b.lathe(
      [
        [r0, -0.1],
        [r1, -0.1],
        [r1, top],
        [r0, top],
      ],
      { at: [0, 0, 0], bone: hips, color, segments: 28 },
    );
  disc(5.6, 9.4, 0.0, C.SEA_DEEP);
  disc(2.6, 5.7, 0.012, C.SEA);
  b.lathe(MOUND, { at: [0, 0, 0], bone: hips, color: C.SEA_LIGHT, segments: 20, smoothing: 1 });
  const foam = (R: number, tube: number, y: number) =>
    b.part(new THREE.TorusGeometry(R, tube, 4, 40).rotateX(Math.PI / 2), C.FOAM, { at: [0, y, 0], bone: hips });
  foam(3.05, 0.09, 0.03);
  foam(5.65, 0.06, 0.03);
  foam(7.4, 0.05, 0.01);

  // ---------------------------------------------------------------- eyes
  const EYE = svg(
    `<svg viewBox="0 0 100 100">
    <defs><radialGradient id="g" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="#ffe9a8"/><stop offset="0.55" stop-color="#ff9a2a"/><stop offset="1" stop-color="#e2540c"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="#3a0f2c"/>
    <circle cx="50" cy="50" r="43" fill="url(#g)"/>
    <path d="${Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8;
      return `M${50 + Math.cos(a) * 20} ${50 + Math.sin(a) * 20} L${50 + Math.cos(a) * 41} ${50 + Math.sin(a) * 41}`;
    }).join(" ")}" stroke="#c8480a" stroke-width="1.8" fill="none" opacity="0.75"/>
    <rect x="16" y="39" width="68" height="22" rx="11" fill="#14061c"/>
    <ellipse cx="34" cy="30" rx="9" ry="6" fill="#ffffff" transform="rotate(-25 34 30)"/>
    <circle cx="67" cy="68" r="3.4" fill="#ffffff"/>
  </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const hit = skin.around([0, 2.75, 0.1]).at(s * 58, 8);
    if (!hit) continue;
    const c = offset(hit, hit.n, 0.06);
    const eyeball = b.part(new THREE.SphereGeometry(0.52, 12, 8), C.SCLERA, { at: c, bone: head });
    const eyeSkin = b.surface(eyeball);
    const front = eyeSkin.nearest(offset(c, hit.n, 0.9));
    glow(b.decal(eyeSkin, EYE, { at: front, size: [0.86, 0.86], lift: 0.006, bone: head, segments: 8 }), 1);
    b.part(new THREE.TorusGeometry(0.53, 0.1, 6, 18), C.TEAL_D, {
      at: offset(c, hit.n, -0.04),
      dir: hit.n,
      axis: "z",
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.6, 0.1, 5, 10, Math.PI), C.TEAL, {
      at: offset(c, hit.n, -0.1).add(V(0, 0.05, 0)),
      dir: hit.n,
      axis: "z",
      bone: head,
    });
  }

  // ---------------------------------------------------------------- forehead shield
  const F = skin.ray([0, 3.0, 4], [0, 0, -1])?.at ?? V(0, 3.0, 1.3);
  b.extrude(
    [
      [-0.4, 0.5],
      [0.4, 0.5],
      [0.46, -0.05],
      [0, -0.55, "sharp"],
      [-0.46, -0.05],
    ],
    { at: V(F.x, F.y + 0.05, F.z - 0.07), x: [1, 0, 0], thickness: 0.14, bevel: 0.04, color: C.TEAL, bone: head },
  );
  glow(
    b.extrude(
      [
        [-0.28, 0.22],
        [0, 0.0],
        [0.28, 0.22],
        [0.28, 0.1],
        [0, -0.12],
        [-0.28, 0.1],
      ],
      { at: V(F.x, F.y + 0.12, F.z - 0.02), x: [1, 0, 0], thickness: 0.1, bevel: 0.015, color: C.ORANGE, bone: head },
    ),
    1.2,
  );

  // ---------------------------------------------------------------- mouth, beak and jaw
  const M = skin.ray([0, 2.1, 4], [0, 0, -1])?.at ?? V(0, 2.1, 1.35);
  const mouth = (dx: number, dy: number, dz: number) => V(M.x + dx, M.y + dy, M.z + dz);
  const jaw = b.joint("jaw", { parent: head, at: mouth(0, -0.1, -0.25), aim: mouth(0, -0.1, 0.6), role: "jaw" });
  b.part(new THREE.SphereGeometry(0.5, 10, 6), C.MOUTH, { at: mouth(0, -0.12, -0.05), scale: [1.15, 0.75, 0.9], bone: head });
  b.part(new THREE.TorusGeometry(0.6, 0.11, 6, 16), C.TEAL_D, {
    at: mouth(0, -0.1, -0.12),
    dir: [0, 0, 1],
    axis: "z",
    bone: head,
  });
  b.ring(frame(mouth(0, -0.12, -0.1), [0, 0, 1]), { count: 10, radius: 0.47 }, (it) =>
    b.spike(it, [0, 0, 1], 0.16, 0.045, { color: C.CREAM }),
  );
  b.sweep(
    catmull([mouth(0, 0.18, -0.35), mouth(0, 0.12, 0.25), mouth(0, -0.1, 0.7), mouth(0, -0.42, 0.78)]),
    (t) => [0.34 * (1 - 0.8 * t), 0.22 * (1 - 0.9 * t)],
    {
      bone: head,
      bands: [
        [0.72, C.BEAK],
        [1, C.CREAM],
      ],
      caps: { start: "flat", end: "point" },
      name: "beakUpper",
    },
  );
  b.sweep(
    catmull([mouth(0, -0.2, -0.2), mouth(0, -0.25, 0.35), mouth(0, -0.1, 0.65)]),
    (t) => [0.27 * (1 - 0.8 * t), 0.2 * (1 - t)],
    {
      bone: jaw,
      bands: [
        [0.7, C.BEAK],
        [1, C.CREAM],
      ],
      caps: { start: "flat", end: "point" },
      name: "beakLower",
    },
  );

  // ---------------------------------------------------------------- mantle armour
  const backAt = (t: number) => {
    const a = body.at(t, 0);
    const d = body.at(t, 180);
    return a.n.z < d.n.z ? a : d;
  };
  const HEX = new THREE.CylinderGeometry(0.32, 0.4, 0.2, 6);
  const HEXIN = new THREE.CylinderGeometry(0.16, 0.2, 0.2, 6);
  for (let i = 0; i < 10; i++) {
    const pt = backAt(0.2 + i * 0.08);
    const k = 1.15 - 0.65 * (i / 9);
    b.stick(HEX, C.TEAL, pt, { scale: k, embed: 0.1 });
    glow(b.stick(HEXIN, C.ORANGE, pt.moved([0, 0.1 * k, 0]), { scale: k, embed: 0.1 }), 1);
  }

  // fins
  const finAt = spine.at(0.8);
  for (const s of [1, -1])
    b.extrude(FIN_OUTLINE, {
      at: finAt,
      x: [s, 0, 0],
      y: [0, 0.82, -0.57],
      thickness: [0.14, 0.05],
      bevel: 0.03,
      color: FIN,
      bone: spine.joints[4],
      name: s > 0 ? "finL" : "finR",
    });
  b.spike(spine.at(1), spine.at(1), 0.55, 0.3, { color: C.TEAL });

  // glowing seam rings
  for (const k of [1, 5])
    glow(b.sweep(skin.loop(spine.joints[k], { lift: 0.02 }), 0.05, { color: C.ORANGE, name: `band${k}` }), 1.2);

  // photophore beads along the flank pinstripe
  const DOT = new THREE.SphereGeometry(0.09, 6, 4);
  for (let k = 6; k <= 12; k++)
    for (const deg of [90, 270]) glow(b.stick(DOT, C.GLOW, body.at((k + 0.5) / 15, deg), { embed: 0.4 }), 1);

  // glowing chevrons on the mantle front
  const CHEV = svg(
    `<svg viewBox="0 0 60 120">${[0, 1, 2, 3, 4]
      .map(
        (i) =>
          `<path d="M6 ${28 + i * 20} L30 ${10 + i * 20} L54 ${28 + i * 20}" fill="none" stroke="#ff7a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<path d="M12 ${27 + i * 20} L30 ${13 + i * 20} L48 ${27 + i * 20}" fill="none" stroke="#ffd27a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      .join("")}</svg>`,
    { size: 256 },
  );
  const chest = skin.ray([0, 6.2, 1.85], [0, -0.5, -0.85]);
  if (chest) glow(b.decal(skin, CHEV, { at: chest, size: [1.2, 2.4], lift: 0.01, segments: 12 }), 1);

  // ---------------------------------------------------------------- arms and feeding tentacles
  const SUCKER = new THREE.TorusGeometry(1, 0.4, 4, 8).rotateX(Math.PI / 2);
  for (const a of ARMS) {
    const phi = a.phi * DEG;
    const out = V(Math.sin(phi), 0, Math.cos(phi));
    const side = V(Math.cos(phi), 0, -Math.sin(phi));
    const rad = a.feeder
      ? (u: number) =>
          0.17 * (1 - 0.55 * u) + 0.2 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.76) / 0.24))), 0.8)
      : (u: number) => 0.06 + 0.5 * Math.pow(1 - u, 1.4);
    const uk = 0.4;
    const pts = [0, 0.1, 0.2, 0.32, 0.45, 0.58, 0.72, 0.86, 1].map((u) => {
      const r = a.rootR + (a.reach - a.rootR) * u - a.hook * Math.pow(Math.max(0, (u - 0.68) / 0.32), 2);
      let y: number;
      if (u <= uk) {
        const s = Math.sin(((Math.PI / 2) * u) / uk);
        y = a.rootY + (a.peak - a.rootY) * s * s;
      } else {
        const s = (u - uk) / (1 - uk);
        y = a.peak + (a.tipY - a.peak) * s * s * (3 - 2 * s);
      }
      if (!a.feeder) y = Math.max(y, rad(u) - 0.02);
      const lat = a.sway * Math.sin(u * Math.PI * 1.3);
      return V(0, 0, 0).addScaledVector(out, r).addScaledVector(side, lat).setY(y);
    });
    const chain = b.chain(a.name, catmull(pts), {
      parent: hips,
      count: 6,
      role: "tentacle",
      names: (i: number) => `${a.name}_${i + 1}`,
    });
    const tube = b.sweep(chain, rad, { color: armPaint(chain.length, a.feeder ? 1.1 : 0.9), name: `${a.name}Tube` });

    // sucker rows on the underside flanks
    const rows = a.feeder ? [150, 180, 210] : [125, 235];
    const [t0, t1, count] = a.feeder ? [0.8, 0.97, 6] : [0.2, 0.93, 9];
    for (const deg of rows)
      for (let i = 0; i < count; i++) {
        const pt = tube.at(t0 + ((t1 - t0) * (i + 0.5)) / count, deg);
        b.stick(SUCKER, C.ORANGE, pt, { scale: pt.radius * 0.3, embed: 0.35 });
      }

    // dorsal bone spikes
    if (!a.feeder)
      for (const t of [0.12, 0.22, 0.32, 0.42, 0.52]) {
        const pt = tube.at(t, 0);
        b.spike(pt, pt, pt.radius, pt.radius * 0.3, { color: C.CREAM });
      }

    // glowing cuffs
    const armSkin = b.surface(tube);
    for (const k of [1, 3])
      glow(b.sweep(armSkin.loop(chain.joints[k], { lift: 0.015 }), 0.04, { color: C.ORANGE, name: `${a.name}Cuff${k}` }), 1.1);

    // lure at the end of a feeding tentacle
    if (a.feeder)
      glow(
        b.part(new THREE.SphereGeometry(0.11, 8, 6), C.GLOW, { at: chain.at(1).at, bone: chain.joints[5] }),
        1.4,
      );
  }

  return b.root;
}
