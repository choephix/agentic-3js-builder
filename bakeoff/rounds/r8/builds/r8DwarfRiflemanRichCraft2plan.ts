import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, mix, noise, paint, mottle, scales, grain, svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A squat Warcraft-style dwarf rifleman with a forked braided beard, tilted feathered hat, riveted pauldrons and a brass-belled blunderbuss, standing on a mossy cobble plinth with a powder keg, shot sacks and a clan banner.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Scale constants and small helpers
const FLOOR = 0.06; // top of the plinth: the dwarf's boots stand here
const D = (x: number, y: number, z: number): V3 => [x, y + FLOOR, z];
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const V = (p: ArrayLike<number>) => new THREE.Vector3(p[0], p[1], p[2]);
const tup = (q: THREE.Vector3): V3 => [q.x, q.y, q.z];
const perp = (a: THREE.Vector3, u: THREE.Vector3) => a.clone().sub(u.clone().multiplyScalar(a.dot(u))).normalize();

const H = 1.0; // head scale
const HAND = 1.15; // fist scale
const HC = D(0, 1.08, 0.04); // head centre
const SX = 0.17 * H;
const SY = 0.15 * H;
const SZ = 0.16 * H;
/** A point on the skull ellipsoid at (x, y) from its centre, pushed out by `lift`. */
const skullPt = (x: number, y: number, lift = 0): V3 => [
  HC[0] + x,
  HC[1] + y,
  HC[2] + SZ * Math.sqrt(Math.max(0, 1 - (x / SX) ** 2 - (y / SY) ** 2)) + lift,
];

const basis = (axis: THREE.Vector3) => {
  const a = axis.clone().normalize();
  const ref = Math.abs(a.y) < 0.9 ? v(0, 1, 0) : v(1, 0, 0);
  const u = ref.clone().cross(a).normalize();
  const w = a.clone().cross(u).normalize();
  return { a, u, w };
};
const circlePts = (c: THREE.Vector3, axis: THREE.Vector3, r: number, n: number, off = 0) => {
  const { u, w } = basis(axis);
  return Array.from({ length: n }, (_, i) => {
    const t = off + (i / n) * Math.PI * 2;
    return c.clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(w, Math.sin(t) * r);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const SKIN = mottle("#e09a7c", "#cf8668", { size: 0.06, seed: 2 });
const NOSE = mottle("#ea8f7c", "#cc6c5e", { size: 0.04, seed: 3 });
const BEARD = grain("#8c4c1e", "#bd6e2e", { size: 0.012, axis: "y", seed: 4 });
const LEATHER = grain("#6e4626", "#4c2d17", { size: 0.015, axis: "y", seed: 5 });
const BOOT = grain("#4a2f1c", "#33200f", { size: 0.014, axis: "y", seed: 6 });
const GLOVE = grain("#7b5330", "#5a3a20", { size: 0.012, axis: "y", seed: 7 });
const WOODG = grain("#85512a", "#52301a", { size: 0.01, axis: "y", seed: 8 });
const TROUSER = mottle("#5a4632", "#46352a", { size: 0.05, seed: 9 });
const FELT = mottle("#22346a", "#2d4684", { size: 0.05, seed: 10 });
const STEEL = metal("steel");
const PLATE = panelled(metal("steel", { tarnish: 0.15 }), { size: 0.09, rivets: 0.025 });
const BRASS = metal("brass");
const GILT = metal("gilt");
const SACK = mottle("#bfa06a", "#a68648", { size: 0.04, seed: 11 });
const BEDROLL = mottle("#8a3a2a", "#6e2c20", { size: 0.05, seed: 12 });
const MOSS = mottle("#5a7a2c", "#8aa63c", { size: 0.05, seed: 13 });
const COBBLE = scales(["#7a7d88", "#8b8e99", "#6a6d78"], "#2e3038", { size: 0.085, width: 0.16, seed: 14 });
const STONE = paint((p, n) => (n.y > 0.7 && noise(p, 0.12, 4) > 0.55 ? MOSS : COBBLE));

const tartanFn = (u: number, w: number): string => {
  const f = (x: number) => x - Math.floor(x);
  const a = f(u / 0.08);
  const c = f(w / 0.08);
  const band = (x: number) => (x < 0.1 ? 2 : x > 0.45 && x < 0.55 ? 1 : 0);
  const bu = band(a);
  const bv = band(c);
  if (bu === 2 || bv === 2) return "#d9a93e";
  if (bu === 1 || bv === 1) return "#a02c2c";
  return a < 0.3 !== c < 0.3 ? "#1d3a78" : "#2a4f9a";
};
const TUNIC = paint((p, n) => tartanFn(Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x, p.y));
const FLAGP = paint((_p, _n, s) => tartanFn(s[0], s[1]));

const BLADE_PAL: [string, string, string] = ["#5c3216", "#bb6a2b", "#ecc88c"];
const bladeCache = new Map<string, ReturnType<typeof paint>>();
function bladePaint(L: number) {
  const key = L.toFixed(3);
  let p = bladeCache.get(key);
  if (!p) {
    p = paint((_p, _n, s) => {
      const t = Math.min(Math.max(s[1] / L, 0), 1);
      return t < 0.5 ? mix(BLADE_PAL[0], BLADE_PAL[1], t * 2) : mix(BLADE_PAL[1], BLADE_PAL[2], (t - 0.5) * 2);
    });
    bladeCache.set(key, p);
  }
  return p;
}

// ---------------------------------------------------------------------------------------------------------------
// Beard silhouette: y, z, full width, full depth
const BS = [
  [0.99, 0.17, 0.3, 0.14],
  [0.88, 0.25, 0.36, 0.16],
  [0.76, 0.27, 0.34, 0.15],
  [0.66, 0.26, 0.24, 0.12],
  [0.59, 0.25, 0.08, 0.06],
];
const beardAt = (y: number) => {
  const yy = Math.min(Math.max(y, BS[BS.length - 1][0]), BS[0][0]);
  for (let i = 0; i < BS.length - 1; i++) {
    const a = BS[i];
    const c = BS[i + 1];
    if (yy <= a[0] && yy >= c[0]) {
      const t = (a[0] - yy) / (a[0] - c[0]);
      return { z: a[1] + (c[1] - a[1]) * t, w: a[2] + (c[2] - a[2]) * t, h: a[3] + (c[3] - a[3]) * t };
    }
  }
  return { z: BS[0][1], w: BS[0][2], h: BS[0][3] };
};
const frontZ = (x: number, y: number) => {
  const s = beardAt(y);
  return s.z + (s.h / 2) * Math.sqrt(Math.max(0, 1 - (x / (s.w / 2)) ** 2));
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarf_rifleman" });
  type Bone = ReturnType<typeof b.joint>;
  type PartOpts = Partial<NonNullable<Parameters<typeof b.part>[2]>>;
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
  const part = (geo: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], bone: Bone, at: V3, o: PartOpts = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const torus = (bone: Bone, at: V3, dir: V3, R: number, tube: number, color: Parameters<typeof b.part>[1], seg = 14) =>
    b.part(new THREE.TorusGeometry(R, tube, 5, seg), color, { bone, at, dir, axis: "z" });

  // ---------------------------------------------------------------------------------------------------------------
  // Drawings
  const EYE = svg(
    `<svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><path d="M4 30 Q40 -6 76 30 Q40 58 4 30Z"/></clipPath></defs>
      <path d="M4 30 Q40 -6 76 30 Q40 58 4 30Z" fill="#f2e8cf"/>
      <g clip-path="url(#c)">
        <circle cx="42" cy="29" r="15" fill="#3f6f9a"/>
        <circle cx="42" cy="38" r="14" fill="#7db2d6" opacity="0.6"/>
        <circle cx="42" cy="29" r="15" fill="none" stroke="#1d3350" stroke-width="3"/>
        <circle cx="42" cy="29" r="7" fill="#0c0a10"/>
        <circle cx="36" cy="23" r="4.2" fill="#ffffff"/>
        <circle cx="49" cy="35" r="2" fill="#ffffff"/>
        <path d="M0 14 L80 14 L80 0 L0 0Z" fill="#c98466" opacity="0.35"/>
      </g>
      <path d="M4 30 Q40 -8 76 30" fill="none" stroke="#1a0f08" stroke-width="7" stroke-linecap="round"/>
      <path d="M8 34 Q40 56 72 34" fill="none" stroke="#1a0f08" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  let gearTeeth = "";
  for (let i = 0; i < 12; i++)
    gearTeeth += `<rect x="44" y="5" width="12" height="17" fill="#e6b648" stroke="#4a3010" stroke-width="2" transform="rotate(${i * 30} 50 50)"/>`;
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${gearTeeth}
      <circle cx="50" cy="50" r="36" fill="#e6b648" stroke="#4a3010" stroke-width="3"/>
      <circle cx="50" cy="50" r="28" fill="#1f3d7f" stroke="#4a3010" stroke-width="2"/>
      <g transform="rotate(42 50 50)"><rect x="46" y="16" width="8" height="68" rx="3" fill="#2a1a10" stroke="#e6b648" stroke-width="1.5"/><rect x="43" y="68" width="14" height="14" rx="3" fill="#7a4a24"/></g>
      <g transform="rotate(-42 50 50)"><rect x="46" y="16" width="8" height="68" rx="3" fill="#2a1a10" stroke="#e6b648" stroke-width="1.5"/><rect x="43" y="68" width="14" height="14" rx="3" fill="#7a4a24"/></g>
      <circle cx="50" cy="50" r="7" fill="#e6b648" stroke="#4a3010" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6 V94 M15 20 L26 30 M15 40 L4 50 M15 56 L26 66 M15 76 L4 86" stroke="#f2cf6a" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <circle cx="15" cy="6" r="4" fill="#f2cf6a"/><circle cx="15" cy="94" r="4" fill="#f2cf6a"/>
    </svg>`,
    { size: 256 },
  );
  const FEATHER = svg(
    `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 118 C0 90 2 40 20 2 C38 40 40 90 20 118Z" fill="#b8322a" stroke="#5a1410" stroke-width="2.5"/>
      <path d="M20 112 C10 90 10 50 20 10 C30 50 30 90 20 112Z" fill="#e35a3c"/>
      <path d="M20 118 L20 4" stroke="#f3e4c0" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M20 40 L9 28 M20 58 L7 44 M20 76 L8 62 M20 40 L31 28 M20 58 L33 44 M20 76 L32 62" stroke="#5a1410" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const STRAND = svg(
    `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0 L20 6 L22 62 L16 64 L12 58 L8 64 L2 62 L4 6Z" fill="#d9a444" stroke="#5a3a10" stroke-width="2"/>
      <path d="M8 8 V56 M12 8 V52 M16 8 V56" stroke="#8a5a1c" stroke-width="2" stroke-linecap="round"/>
      <rect x="3" y="2" width="18" height="7" rx="2" fill="#f2cf6a" stroke="#5a3a10" stroke-width="1.5"/>
    </svg>`,
    { size: 192 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="56" rx="6" fill="#e8d8a8" stroke="#3a2412" stroke-width="3"/>
      <text x="40" y="24" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#3a2412">POWDER</text>
      <circle cx="40" cy="42" r="9" fill="#2a2a30" stroke="#3a2412" stroke-width="2"/>
      <path d="M45 34 L50 28" stroke="#3a2412" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="51" cy="27" r="2.5" fill="#e0782a"/>
    </svg>`,
    { size: 256 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 48 Q6 24 2 6 Q12 22 14 48Z M12 48 Q14 20 16 0 Q22 22 20 48Z M18 48 Q24 26 30 8 Q28 30 26 48Z" fill="#5f8a2e" stroke="#2c4a14" stroke-width="1.5"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: D(0, 0.58, 0) });
  const spine = b.chain("spine", catmull([D(0, 0.58, 0), D(0, 0.76, 0.02), D(0, 0.95, 0.03)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: D(0, 1.0, 0.04), dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: D(0, 1.03, 0.04), dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [HC[0], HC[1] - 0.05, HC[2] - 0.08],
    aim: [HC[0], HC[1] - 0.11, HC[2] + 0.12],
    role: "jaw",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Torso and clothes
  const torso = b.loft(
    [
      { at: D(0, 0.46, 0), w: 0.44, h: 0.32 },
      { at: D(0, 0.6, 0.01), w: 0.46, h: 0.34 },
      { at: D(0, 0.78, 0.02), w: 0.6, h: 0.38 },
      { at: D(0, 0.95, 0.03), w: 0.64, h: 0.36 },
      { at: D(0, 1.02, 0.03), w: 0.46, h: 0.3 },
    ],
    { bone: [hips, spine], color: TUNIC },
  );
  const skin = b.surface(torso);

  // Kilt skirt and trim
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.255, 0.012],
      [0.215, 0.17],
      [0, 0.17],
    ],
    { at: D(0, 0.36, 0), bone: hips, color: TUNIC, segments: 12 },
  );
  torus(hips, D(0, 0.375, 0), [0, 1, 0], 0.252, 0.008, GILT, 18);

  // Belt: three tubes on the torso surface, studs between them
  for (const y of [0.5, 0.53, 0.56]) b.sweep(skin.loop(D(0, y, 0), { lift: 0.012 }), 0.021, { color: LEATHER });
  b.along(skin.loop(D(0, 0.53, 0), { lift: 0.032 }), 20, (at) => b.part(new THREE.SphereGeometry(0.011, 5, 4), GILT, { at }));
  const buckle = part(new THREE.BoxGeometry(0.095, 0.08, 0.016), GILT, hips, D(0, 0.53, 0.2));
  part(new THREE.BoxGeometry(0.06, 0.05, 0.018), "#2a1a10", hips, D(0, 0.53, 0.202));
  b.decal(buckle, EMBLEM, { at: D(0, 0.53, 0.21), dir: [0, 0, 1], size: [0.058, 0.058] });

  // Pouches, powder horn, canteen and lantern on the belt
  const pouchSkin = skin;
  for (const s of [1, -1]) {
    const hit = pouchSkin.around(D(0, 0.55, 0.02)).at(s * 42, 0);
    if (!hit) continue;
    b.stick(new THREE.BoxGeometry(0.09, 0.05, 0.11), LEATHER, hit, { embed: 0.25, flow: [0, 1, 0], bone: hips });
    b.stick(new THREE.BoxGeometry(0.096, 0.014, 0.05), BOOT, hit.moved([0, 0.03, 0.03]), { embed: 0.2, flow: [0, 1, 0], bone: hips });
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), GILT, hit.moved([0, 0.044, 0.025]), { embed: 0.3, bone: hips });
  }
  // powder horn on the left hip
  b.sweep(catmull([D(0.27, 0.58, -0.07), D(0.3, 0.46, -0.06), D(0.28, 0.38, 0.0), D(0.24, 0.35, 0.1)]), [0.034, 0.008], {
    bone: hips,
    color: "#e9dcb8",
    caps: { start: "flat", end: "point" },
    sides: 7,
  });
  part(new THREE.CylinderGeometry(0.037, 0.034, 0.03, 7), BRASS, hips, D(0.27, 0.575, -0.07), { dir: [0.1, 1, 0] });
  torus(hips, D(0.285, 0.5, -0.065), [0, 0, 1], 0.036, 0.005, LEATHER, 8);
  // canteen on the back-right
  part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10), STEEL, hips, D(-0.2, 0.52, -0.2), { dir: [0, 0.3, 1] });
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), BRASS, hips, D(-0.2, 0.6, -0.2));
  torus(hips, D(-0.2, 0.52, -0.2), [0, 0.3, 1], 0.07, 0.007, LEATHER, 12);
  // lantern on the back-left
  part(new THREE.CylinderGeometry(0.036, 0.04, 0.012, 6), BRASS, hips, D(0.2, 0.46, -0.21));
  glow(part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 6), "#ffc060", hips, D(0.2, 0.505, -0.21)), 1.6);
  part(new THREE.CylinderGeometry(0.036, 0.034, 0.012, 6), BRASS, hips, D(0.2, 0.545, -0.21));
  torus(hips, D(0.2, 0.575, -0.21), [0, 0, 1], 0.022, 0.004, BRASS, 8);
  b.rod(D(0.2, 0.552, -0.21), D(0.2, 0.585, -0.205), 0.005, BRASS, { bone: hips });

  // Bedroll across the back
  const rollA = V(D(0.27, 0.97, -0.24));
  const rollB = V(D(-0.27, 0.92, -0.24));
  const rollDir = rollB.clone().sub(rollA).normalize();
  b.rod(tup(rollA), tup(rollB), 0.06, BEDROLL, { bone: chest });
  for (const e of [rollA, rollB])
    part(new THREE.CylinderGeometry(0.056, 0.056, 0.008, 10), "#d8c49a", chest, tup(e.clone().addScaledVector(rollDir, e === rollA ? 0.002 : -0.002)), { dir: tup(rollDir) });
  for (const t of [0.3, 0.7]) torus(chest, tup(rollA.clone().lerp(rollB, t)), tup(rollDir), 0.064, 0.008, LEATHER, 10);

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(D(s * 0.12, 0.58, 0), D(s * 0.135, 0.19, 0), [0.2, 0.2], [0, 0, 1]);
    const leg = b.chain("leg" + side, pts, {
      parent: hips,
      names: ["hip" + side, "knee" + side, "ankle" + side],
      role: "leg",
    });
    const ankle = leg.tip!;
    const knee = leg.joints[1];
    b.sweep(leg, (t: number) => 0.088 - 0.016 * t, { color: TROUSER });
    const kp = pts[1];
    part(sph(8, 6), PLATE, knee, [kp.x, kp.y, kp.z + 0.072], { scale: [0.066, 0.06, 0.036] });
    // boot
    part(new THREE.CylinderGeometry(0.088, 0.1, 0.2, 8), BOOT, ankle, D(s * 0.135, 0.185, 0.0));
    part(new THREE.CylinderGeometry(0.108, 0.108, 0.05, 8), LEATHER, ankle, D(s * 0.135, 0.275, 0.0));
    part(new THREE.BoxGeometry(0.17, 0.1, 0.25), BOOT, ankle, D(s * 0.135, 0.055, 0.05));
    part(sph(8, 6), BOOT, ankle, D(s * 0.135, 0.058, 0.155), { scale: [0.085, 0.052, 0.07] });
    part(new THREE.BoxGeometry(0.18, 0.02, 0.27), "#241a14", ankle, D(s * 0.135, 0.01, 0.05));
    part(new THREE.BoxGeometry(0.18, 0.03, 0.05), "#241a14", ankle, D(s * 0.135, 0.03, -0.06));
    part(new THREE.BoxGeometry(0.05, 0.04, 0.012), GILT, ankle, D(s * 0.135, 0.255, 0.108));
    part(new THREE.BoxGeometry(0.025, 0.03, 0.012), GILT, ankle, D(s * 0.135, 0.11, 0.1));
    b.joint("toe" + side, { parent: ankle, at: D(s * 0.135, 0.05, 0.12), dir: [0, 0, 1] });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Blunderbuss frame (held right of the body, butt near the plinth)
  const BUTT = V(D(-0.4, 0.04, 0.1));
  const MUZ = V(D(-0.6, 0.98, 0.24));
  const U = MUZ.clone().sub(BUTT).normalize();
  const Fv = perp(v(0, 0, 1), U);
  const Sv = perp(v(-1, 0, 0), U);
  const G = (t: number) => BUTT.clone().lerp(MUZ, t);
  const P = (t: number, f = 0, s = 0) => G(t).addScaledVector(Fv, f).addScaledVector(Sv, s);

  // ---------------------------------------------------------------------------------------------------------------
  // Arms
  const armPts: Record<string, THREE.Vector3[]> = {
    L: limb(D(0.32, 0.93, 0.02), D(0.33, 0.65, 0.1), [0.25, 0.24], [1, 0, -0.7]),
    R: limb(D(-0.32, 0.93, 0.02), tup(P(0.64, -0.035, 0)), [0.26, 0.24], [-1, -0.2, -0.8]),
  };
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const side of ["L", "R"]) {
    const arm = b.chain("arm" + side, armPts[side], {
      parent: chest,
      names: ["shoulder" + side, "elbow" + side, "hand" + side],
      role: "arm",
    });
    arms[side] = arm;
    b.sweep(arm, (t: number) => 0.08 - 0.014 * t, { color: TUNIC });
    b.sweep(arm, 0.077, { from: 0.8, to: 1, color: LEATHER, caps: "flat" });
    torus(arm.joints[1], tup(armPts[side][1]), tup(armPts[side][2].clone().sub(armPts[side][1])), 0.08, 0.01, GILT, 12);
  }
  const handL = arms.L.tip!;
  const handR = arms.R.tip!;

  // fists: palm block, four knuckle fingers, thumb
  function fist(bone: Bone, C: THREE.Vector3, u: THREE.Vector3, f: THREE.Vector3, sd: THREE.Vector3) {
    part(new THREE.BoxGeometry(0.085 * HAND, 0.085 * HAND, 0.075 * HAND), GLOVE, bone, tup(C), { dir: tup(u), up: tup(f) });
    for (let k = 0; k < 4; k++) {
      const pos = C.clone().addScaledVector(f, 0.05 * HAND).addScaledVector(u, (k - 1.5) * 0.024 * HAND);
      part(new THREE.CylinderGeometry(0.0125 * HAND, 0.0125 * HAND, 0.078 * HAND, 6), GLOVE, bone, tup(pos), { dir: tup(sd) });
    }
    part(sph(6, 5), GLOVE, bone, tup(C.clone().addScaledVector(u, 0.05 * HAND).addScaledVector(f, 0.028 * HAND)), {
      scale: [0.02 * HAND, 0.028 * HAND, 0.02 * HAND],
    });
  }
  const CR = G(0.6);
  fist(handR, CR, U, Fv, Sv);
  fist(handL, V(D(0.335, 0.6, 0.12)), v(0, 1, 0), v(0, 0, 1), v(1, 0, 0));

  // ---------------------------------------------------------------------------------------------------------------
  // Pauldrons
  const dome = (r: number, h: number): [number, number][] => [
    [0, 0],
    [r, 0],
    [r, 0.014],
    [r * 0.82, h * 0.6],
    [r * 0.45, h * 0.92],
    [0, h],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sj = arms[side].joints[0];
    const Cp = V(D(s * 0.33, 0.99, 0.02));
    const A = v(s * 0.55, 1, 0).normalize();
    const radii = [0.18, 0.15, 0.115];
    const hs = [0.07, 0.06, 0.05];
    const offs = [0, 0.035, 0.07];
    let top: ReturnType<typeof b.lathe> | null = null;
    for (let k = 0; k < 3; k++) {
      top = b.lathe(dome(radii[k], hs[k]), {
        at: tup(Cp.clone().addScaledVector(A, offs[k])),
        axis: tup(A),
        bone: sj,
        color: PLATE,
        segments: 10,
      });
    }
    torus(sj, tup(Cp.clone().addScaledVector(A, 0.008)), tup(A), 0.18, 0.008, GILT, 16);
    torus(sj, tup(Cp.clone().addScaledVector(A, 0.04)), tup(A), 0.15, 0.006, GILT, 14);
    for (const pt of circlePts(Cp.clone().addScaledVector(A, 0.02), A, 0.16, 8, 0.2))
      part(new THREE.SphereGeometry(0.011, 5, 4), GILT, sj, tup(pt));
    if (top)
      b.decal(top, EMBLEM, { at: tup(Cp.clone().addScaledVector(A, 0.12)), dir: tup(A), up: [0, 0, 1], size: [0.1, 0.1] });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head: skull, jaw, nose, eyes, brows, ears
  const skull = part(sph(14, 10), SKIN, head, HC, { scale: [SX, SY, SZ] });
  part(sph(10, 7), SKIN, jaw, [HC[0], HC[1] - 0.105, HC[2] + 0.035], { scale: [0.125 * H, 0.065 * H, 0.12 * H] });
  part(sph(8, 6), BEARD, jaw, [HC[0], HC[1] - 0.14, HC[2] + 0.09], { scale: [0.125, 0.085, 0.11] });
  part(sph(8, 5), "#4a1a18", head, skullPt(0, -0.092, 0.012), { scale: [0.045, 0.01, 0.018] });
  // nose
  const nc = skullPt(0, -0.035, 0.03);
  part(sph(9, 7), NOSE, head, nc, { scale: [0.047 * H, 0.043 * H, 0.052 * H] });
  for (const s of [1, -1]) part(sph(5, 4), "#4a1a18", head, [nc[0] + s * 0.019, nc[1] - 0.03, nc[2] + 0.034], { scale: [0.009, 0.007, 0.007] });
  // eyes
  for (const s of [1, -1])
    b.decal(skull, EYE, { at: skullPt(s * 0.085, 0.025), dir: [0, 0, 1], size: [0.065, 0.046], mirror: s > 0 });
  // brows: heavy bushy wedges, inner ends low
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.115, 0.03, 0.045), "#a85a22", head, skullPt(s * 0.088, 0.07, 0.012), { rotation: [-8, 0, s * 18] });
    part(new THREE.BoxGeometry(0.07, 0.024, 0.04), "#c8742a", head, skullPt(s * 0.108, 0.082, 0.015), { rotation: [-8, 0, s * 18] });
    part(new THREE.BoxGeometry(0.04, 0.022, 0.034), "#8a4818", head, skullPt(s * 0.05, 0.056, 0.012), { rotation: [-8, 0, s * 22] });
  }
  // cheeks
  for (const s of [1, -1]) part(sph(7, 5), NOSE, head, skullPt(s * 0.1, -0.03, 0.0), { scale: [0.04, 0.03, 0.025] });
  // ears + earring
  for (const s of [1, -1])
    b.extrude(
      [
        [0.03, -0.04],
        [-0.025, -0.045],
        [-0.07, 0.055, "sharp"],
        [-0.01, 0.035],
        [0.025, 0.02],
      ],
      { at: [s * 0.162, HC[1] - 0.015, HC[2] - 0.005], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: SKIN, bone: head },
    );
  torus(head, [-0.176, HC[1] - 0.06, HC[2] - 0.012], [-1, 0, 0], 0.017, 0.004, GILT, 10);
  // moustache: two swept curls
  for (const s of [1, -1])
    b.sweep(catmull([skullPt(s * 0.012, -0.065, 0.045), skullPt(s * 0.065, -0.072, 0.042), skullPt(s * 0.12, -0.068, 0.032), skullPt(s * 0.15, -0.04, 0.038)]), [0.032, 0.006], {
      bone: head,
      color: BEARD,
      caps: { start: "round", end: "point" },
      sides: 7,
    });
  // back and side hair under the hat
  for (let i = 0; i < 9; i++) {
    const az = ((72 + i * 27) * Math.PI) / 180;
    const el = (8 * Math.PI) / 180;
    const pos: V3 = [HC[0] + SX * Math.sin(az) * Math.cos(el), HC[1] + SY * Math.sin(el) - 0.01, HC[2] + SZ * Math.cos(az) * Math.cos(el)];
    const L = 0.13;
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.034, 0.07],
        [0, L, "sharp"],
        [-0.034, 0.07],
      ],
      {
        at: pos,
        x: tup(new THREE.Vector3(0, 0, 1).cross(v(Math.sin(az) * 0.5, -1, Math.cos(az) * 0.5).normalize()).normalize()),
        y: tup(v(Math.sin(az) * 0.5, -1, Math.cos(az) * 0.5).normalize()),
        thickness: 0.016,
        color: bladePaint(L),
        bone: head,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hat (own joint so the whole hat tilts)
  const hat = b.joint("hat", { parent: head, at: D(0, 1.17, 0), dir: [0, 1, 0] });
  b.lathe(
    [
      [0, 0],
      [0.2, -0.005],
      [0.28, 0.03],
      [0.28, 0.042],
      [0.2, 0.02],
      [0.14, 0.035],
      [0.135, 0.15],
      [0.1, 0.17],
      [0, 0.17],
    ],
    { at: D(0, 1.17, 0), bone: hat, color: FELT, segments: 12 },
  );
  torus(hat, D(0, 1.23, 0), [0, 1, 0], 0.139, 0.013, LEATHER, 14);
  part(new THREE.BoxGeometry(0.056, 0.05, 0.014), GILT, hat, D(0, 1.232, 0.14));
  part(new THREE.BoxGeometry(0.03, 0.026, 0.016), "#2a1a10", hat, D(0, 1.232, 0.141));
  // cocked brim cuffs
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.02, 0.012, 0.14), GILT, hat, D(s * 0.265, 1.205, 0.0), { rotation: [0, 0, s * -18] });
  }
  b.cards([frame(D(-0.125, 1.235, -0.03), [-0.5, 1, -0.45])], FEATHER, { size: [0.1, 0.32], bend: 35, flow: [-0.2, -0.2, -1], bone: hat });
  b.cards([frame(D(-0.128, 1.232, 0.03), [-0.7, 1, -0.1])], FEATHER, { size: [0.09, 0.28], bend: 30, flow: [-0.3, -0.2, -1], bone: hat });
  b.pose(hat, { axis: [1, 0, 0], deg: -12 });

  // ---------------------------------------------------------------------------------------------------------------
  // Beard: solid core, three shingled rows of blades, braids, tassels
  b.loft(
    BS.map(([y, z, w, h]) => ({ at: D(0, y, z), w, h })),
    { bone: chest, color: BEARD },
  );
  const rows = [
    { y: 0.95, n: 7, len: 0.26, wid: 0.085, lift: 0.032 },
    { y: 0.83, n: 7, len: 0.27, wid: 0.085, lift: 0.024 },
    { y: 0.72, n: 5, len: 0.17, wid: 0.08, lift: 0.016 },
    { y: 0.66, n: 3, len: 0.12, wid: 0.06, lift: 0.01 },
  ];
  for (const r of rows) {
    const span = (beardAt(r.y).w / 2) * 0.85;
    for (let i = 0; i < r.n; i++) {
      const x = r.n === 1 ? 0 : (i / (r.n - 1) - 0.5) * 2 * span;
      const y = v(-x * 1.0, -1, 0.12).normalize();
      const xd = new THREE.Vector3(0, 0, 1).cross(y).normalize();
      const w = r.wid;
      const L = r.len;
      b.extrude(
        [
          [-0.45 * w, 0],
          [0.45 * w, 0],
          [0.52 * w, 0.3 * L],
          [0.34 * w, 0.65 * L],
          [0, L, "sharp"],
          [-0.34 * w, 0.65 * L],
          [-0.52 * w, 0.3 * L],
        ],
        { at: D(x, r.y, frontZ(x, r.y) + r.lift), x: tup(xd), y: tup(y), thickness: 0.014, color: bladePaint(L), bone: chest },
      );
    }
  }
  // braids
  for (const s of [1, -1]) {
    const x0 = s * 0.125;
    torus(chest, D(x0, 0.885, frontZ(x0, 0.885) + 0.04), [0, 1, 0], 0.034, 0.007, GILT, 10);
    for (let j = 0; j < 6; j++) {
      const y = 0.86 - j * 0.05;
      const off = (j % 2 ? 1 : -1) * 0.01;
      const x = x0 + off;
      part(sph(7, 5), j % 2 ? "#b9672a" : "#7a3e18", chest, D(x, y, frontZ(x, y) + 0.04), { scale: [0.036, 0.028, 0.032] });
    }
    torus(chest, D(x0, 0.598, frontZ(x0, 0.6) + 0.04), [0, 1, 0], 0.03, 0.007, GILT, 10);
    b.cards([frame(D(x0, 0.592, frontZ(x0, 0.6) + 0.04), [0, 1, 0])], STRAND, { size: [0.07, 0.11], lean: 180, flow: [0, 0, 1], bone: chest });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Blunderbuss
  const gun = b.joint("gun", { parent: handR, at: tup(G(0.6)), dir: tup(U) });
  // stock
  b.loft(
    [
      { at: tup(P(0.0, -0.045)), w: 0.07, h: 0.11 },
      { at: tup(P(0.08, -0.04)), w: 0.062, h: 0.095 },
      { at: tup(P(0.2, -0.02)), w: 0.055, h: 0.07 },
      { at: tup(P(0.34, 0.0)), w: 0.05, h: 0.055 },
    ],
    { bone: gun, color: WOODG },
  );
  part(new THREE.BoxGeometry(0.072, 0.012, 0.12), BRASS, gun, tup(P(-0.005, -0.048)), { dir: tup(U), up: tup(Fv) });
  // barrel, forend, bands, bell
  const barrel = b.rod(tup(P(0.34)), tup(P(0.9)), [0.027, 0.033], STEEL, { bone: gun });
  b.rod(tup(P(0.34, 0.03)), tup(P(0.58, 0.03)), 0.021, WOODG, { bone: gun });
  for (const t of [0.38, 0.47, 0.74]) part(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 10), BRASS, gun, tup(P(t)), { dir: tup(U) });
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.05, 0.05],
      [0.078, 0.12],
      [0.078, 0.128],
      [0.064, 0.128],
      [0.04, 0.07],
      [0, 0.07],
    ],
    { at: tup(P(0.9)), axis: tup(U), bone: gun, color: BRASS, segments: 10 },
  );
  torus(gun, tup(P(0.9 + 0.128 / 0.98)), tup(U), 0.074, 0.005, GILT, 12);
  b.decal(barrel, RUNE, { at: tup(P(0.79, 0, 0.03)), dir: tup(Sv), up: tup(U), size: [0.026, 0.09] });
  // ramrod
  b.rod(tup(P(0.36, 0.05)), tup(P(0.86, 0.05)), 0.006, WOODG, { bone: gun });
  part(new THREE.SphereGeometry(0.01, 5, 4), BRASS, gun, tup(P(0.86, 0.05)));
  // lock
  part(new THREE.BoxGeometry(0.012, 0.13, 0.05), BRASS, gun, tup(P(0.4, 0.005, 0.034)), { dir: tup(U), up: tup(Fv) });
  part(new THREE.BoxGeometry(0.016, 0.03, 0.03), STEEL, gun, tup(P(0.46, 0.02, 0.04)), { dir: tup(U), up: tup(Fv) });
  b.sweep(catmull([tup(P(0.43, 0.005, 0.045)), tup(P(0.46, -0.022, 0.05)), tup(P(0.5, -0.032, 0.042))]), [0.011, 0.007], {
    bone: gun,
    color: STEEL,
    sides: 5,
  });
  // trigger guard and trigger
  b.sweep(catmull([tup(P(0.26, 0.03)), tup(P(0.285, 0.075)), tup(P(0.335, 0.075)), tup(P(0.36, 0.03))]), 0.006, {
    bone: gun,
    color: BRASS,
    sides: 5,
  });
  b.spike(tup(P(0.31, 0.03)), tup(Fv.clone().multiplyScalar(0.4).addScaledVector(U, -0.9).normalize()), 0.035, 0.007, { bone: gun, color: STEEL });
  // sling
  b.sweep(catmull([tup(P(0.27, 0.058)), tup(P(0.4, 0.1)), tup(P(0.62, 0.095)), tup(P(0.8, 0.06))]), 0.007, {
    bone: gun,
    color: LEATHER,
    sides: 5,
  });
  for (const t of [0.27, 0.8]) part(new THREE.SphereGeometry(0.011, 5, 4), GILT, gun, tup(P(t, t < 0.5 ? 0.058 : 0.06)));

  // ---------------------------------------------------------------------------------------------------------------
  // Plinth and setting
  const base = b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.56, 0.03],
      [0.53, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0, 0], bone: root, color: STONE, segments: 20 },
  );
  torus(root, [0, 0.052, 0], [0, 1, 0], 0.54, 0.01, GILT, 24);
  const gh = b.surface(base).scatter(14, {
    rng: rng(5),
    minDist: 0.1,
    filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 0.4,
  });
  b.cards(gh, GRASS, { size: [0.05, 0.08], lean: 20, bend: 20, vary: 0.3, rng: rng(6), cross: true, bone: root });

  // powder keg with glowing fuse
  const K = { x: 0.28, z: -0.3 };
  const kegR = (y: number) => 0.09 + 0.025 * Math.sin((Math.min(Math.max(y, 0), 0.22) / 0.22) * Math.PI);
  const keg = b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.105, 0.05],
      [0.115, 0.11],
      [0.105, 0.17],
      [0.09, 0.22],
      [0, 0.22],
    ],
    { at: [K.x, FLOOR, K.z], bone: root, color: WOODG, segments: 12 },
  );
  for (const y of [0.04, 0.11, 0.18]) torus(root, [K.x, FLOOR + y, K.z], [0, 1, 0], kegR(y) + 0.006, 0.007, BRASS, 14);
  part(new THREE.CylinderGeometry(0.088, 0.088, 0.01, 10), "#3a2412", root, [K.x, FLOOR + 0.222, K.z]);
  b.decal(keg, LABEL, { at: [K.x + 0.03, FLOOR + 0.11, K.z + 0.113], dir: [0.25, 0, 1], size: [0.11, 0.085] });
  b.sweep(catmull([[K.x, FLOOR + 0.228, K.z], [K.x + 0.02, FLOOR + 0.27, K.z + 0.01], [K.x + 0.05, FLOOR + 0.285, K.z + 0.03]]), 0.004, {
    bone: root,
    color: "#d8c8a0",
    sides: 4,
  });
  glow(part(new THREE.SphereGeometry(0.014, 6, 4), "#ff9a30", root, [K.x + 0.054, FLOOR + 0.287, K.z + 0.032]), 2.2);
  glow(part(new THREE.SphereGeometry(0.007, 5, 4), "#fff0a0", root, [K.x + 0.056, FLOOR + 0.292, K.z + 0.034]), 2.5);

  // shot sacks and lead balls
  const sackAt = (x: number, y: number, z: number, r: number) => {
    part(sph(9, 7), SACK, root, [x, y, z], { scale: [r, r * 0.85, r * 0.95] });
    part(new THREE.CylinderGeometry(r * 0.3, r * 0.45, r * 0.5, 7), SACK, root, [x, y + r * 0.85, z]);
    torus(root, [x, y + r * 0.7, z], [0, 1, 0], r * 0.38, 0.006, "#7a5a30", 8);
  };
  sackAt(0.4, FLOOR + 0.075, 0.1, 0.09);
  sackAt(0.395, FLOOR + 0.195, 0.1, 0.07);
  for (const [bx, bz] of [[0.34, 0.24], [0.38, 0.21], [0.31, 0.2], [0.36, 0.27]])
    part(new THREE.SphereGeometry(0.014, 6, 4), "#5a5e68", root, [bx, FLOOR + 0.014, bz]);

  // clan banner behind the right shoulder
  const PX = -0.22;
  const PZ = -0.36;
  b.rod([PX, FLOOR, PZ], [PX, FLOOR + 1.1, PZ], 0.014, WOODG, { bone: root });
  part(new THREE.SphereGeometry(0.026, 7, 5), GILT, root, [PX, FLOOR + 1.12, PZ]);
  b.spike([PX, FLOOR + 1.1, PZ], [0, 1, 0], 0.07, 0.014, { bone: root, color: BRASS });
  const flag = b.extrude(
    [
      [0, 0],
      [0.28, 0],
      [0.21, 0.11],
      [0.28, 0.22],
      [0, 0.22],
    ],
    { at: [PX, FLOOR + 0.85, PZ], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: FLAGP, bone: root },
  );
  b.rod([PX, FLOOR + 1.07, PZ], [PX - 0.3, FLOOR + 1.07, PZ], 0.007, BRASS, { bone: root });
  b.decal(flag, EMBLEM, { at: [PX - 0.1, FLOOR + 0.96, PZ + 0.004], dir: [0, 0, 1], size: [0.11, 0.11] });
  b.decal(flag, EMBLEM, { at: [PX - 0.1, FLOOR + 0.96, PZ - 0.004], dir: [0, 0, -1], size: [0.11, 0.11], mirror: true });

  return b.root;
}
