import * as THREE from "three";
import { createBuilder, limb, catmull, polyline, svg, grain, mottle, countershade } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Dwarf rifleman",
  description: "Stocky dwarf in a green coat and steel helm, braided red beard, holding a brass-banded blunderbuss.",
};

// Scale constants. The head is the hero: one number places every head part.
const H = 1.0;
const HEAD_Y = 1.14;

// Palette. Warcraft reads from bold colour blocks: ruddy skin, red beard, forest coat, steel and brass.
const SKIN = "#d99a6c";
const SKIN_DARK = "#b87450";
const BEARD = grain("#7a2c12", "#d8602a", { size: 0.03, axis: "y" });
const BRAID = grain("#c98a2a", "#f5c060", { size: 0.025, axis: "y" });
const COAT = countershade(mottle("#2e5c46", "#1f4030", { size: 0.25 }), "#6a5a34", { level: -0.2 });
const LEATHER = "#5a3a22";
const TROUSER = "#3c3026";
const BOOT = "#2a1a10";
const PLUME = "#b8261c";
const WOOD = grain("#6a3a1c", "#a86a36", { size: 0.02, axis: "z" });
const STEEL = metal("steel");
const HELM = metal("steel", { tarnish: 0.2 });
const BRASS = metal("brass", { verdigris: 0.1 });
const IRON = metal("iron");

// Painted drawings: a heavy-browed eye (the creature's right, mirrored for the left) and a tabard emblem.
const EYE = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="26" rx="27" ry="19" fill="#f4efe0" stroke="#2a1a10" stroke-width="4"/>
    <circle cx="34" cy="26" r="12" fill="#3a6fb0"/>
    <circle cx="34" cy="26" r="5.5" fill="#111018"/>
    <circle cx="38.5" cy="20" r="3" fill="#ffffff"/>
    <path d="M4 13 Q32 0 60 11" stroke="#4a2008" stroke-width="7" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 6 H54 V34 Q54 54 32 60 Q10 54 10 34Z" fill="#e0a83a" stroke="#2a1608" stroke-width="4"/>
    <path d="M22 18 H42 V27 H37 V46 H27 V27 H22Z" fill="#8a1e18" stroke="#2a1608" stroke-width="2.5"/>
  </svg>`,
  { size: 192 },
);

const b = createBuilder({ name: "dwarf-rifleman" });

// ---------------------------------------------------------------------------------------------------------------
// Skeleton: hips, a two-joint spine, head with jaw, legs and arms.

const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
const spine = b.chain(
  "spine",
  catmull([
    [0, 0.6, 0],
    [0, 0.82, 0.02],
    [0, 1.0, 0.02],
  ]),
  { parent: hips, names: ["spine", "chest"], role: "spine" },
);
const chest = spine.joints[1];

const head = b.joint("head", { parent: chest, at: [0, HEAD_Y, 0.03], dir: [0, 1, 0], role: "head" });
const jaw = b.joint("jaw", { parent: head, at: head.local({ up: -0.05, forward: 0.09 }), role: "jaw" });

// Legs: knees forward, boots on the floor.
const legs = [1, -1].map((s) => {
  const side = s > 0 ? "L" : "R";
  const pts = limb([s * 0.12, 0.6, 0], [s * 0.13, 0.07, 0.05], [0.3, 0.3], [0, 0, 1]);
  const leg = b.chain(`leg${side}`, pts, {
    parent: hips,
    names: [`hip${side}`, `knee${side}`, `ankle${side}`],
    role: "leg",
  });
  b.sweep(leg, [0.085, 0.055], { color: TROUSER });
  b.part(new THREE.BoxGeometry(0.13, 0.12, 0.24), BOOT, { bone: leg.tip!, at: [s * 0.13, 0.06, 0.1] });
  b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), BRASS, { bone: leg.tip!, at: [s * 0.13, 0.13, 0.02] });
  return leg;
});

// Arms: the left hand carries the barrel, the right grips the stock.
const arms = [1, -1].map((s) => {
  const side = s > 0 ? "L" : "R";
  const shoulder = [s * 0.2, 0.98, 0.02];
  const target = s > 0 ? [-0.13, 0.97, 0.46] : [-0.2, 0.92, 0.3];
  const bend = s > 0 ? [0, -1, 0] : [-1, -0.3, 0];
  const pts = limb(shoulder, target, [0.3, 0.28], [bend as [number, number, number]]);
  const arm = b.chain(`arm${side}`, pts, {
    parent: chest,
    names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    role: "arm",
  });
  b.sweep(arm, [0.055, 0.045], { color: COAT });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), SKIN, { bone: arm.tip!, at: pts[2] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), LEATHER, { bone: arm.tip!, at: pts[2] });
  return arm;
});

// ---------------------------------------------------------------------------------------------------------------
// Torso: a broad loft, a leather belt and a tabard emblem.

const torso = b.loft(
  [
    { at: [0, 0.6, 0], w: 0.34, h: 0.28 },
    { at: [0, 0.82, 0.02], w: 0.42, h: 0.34 },
    { at: [0, 1.0, 0.02], w: 0.38, h: 0.3 },
  ],
  { bone: [hips, spine], color: COAT },
);
const torsoSurf = b.surface(torso);

for (const s of [1, -1]) {
  const hit = torsoSurf.around([s * 0.2, 1.0, 0.02]).at(s * 90, 40);
  if (hit) b.stick(new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, hit, { embed: 0.25 });
}

const emblemHit = torsoSurf.around([0, 0.9, 0.02]).at(0, 10);
if (emblemHit) b.decal(torsoSurf, EMBLEM, { at: emblemHit, size: [0.2, 0.2] });

b.sweep(torsoSurf.loop(hips, { lift: 0.025 }), 0.03, { color: LEATHER });
const buckleHit = torsoSurf.around([0, 0.6, 0]).at(0, 0);
if (buckleHit) b.stick(new THREE.BoxGeometry(0.06, 0.05, 0.012), BRASS, buckleHit, { embed: 0.3 });

// ---------------------------------------------------------------------------------------------------------------
// Head: skin, nose, eyes, helm, plume.

const headPart = b.part(
  new THREE.SphereGeometry(0.15, 12, 9).scale(1, 1.02, 1.08),
  SKIN,
  { bone: head, at: head.local({ up: 0 }) },
);
const headSurf = b.surface(headPart);
const HC = head.local({ up: 0 });

const noseHit = headSurf.around(HC).at(0, 0);
if (noseHit) b.stick(new THREE.SphereGeometry(0.045, 8, 6).scale(1, 1.1, 1.3), SKIN_DARK, noseHit, { embed: 0.35 });

for (const s of [1, -1]) {
  const hit = headSurf.around(HC).at(s * 30, 12);
  if (hit) b.decal(headSurf, EYE, { at: hit, size: [0.055, 0.04], mirror: s > 0 });
}

// Jaw lip under the moustache, on the jaw joint.
b.part(new THREE.BoxGeometry(0.1, 0.03, 0.04), "#8a4a2a", { bone: jaw, at: jaw.at });

// Helm: steel bowl, brass band at its brim, a red plume over the crown.
const helmAt = head.local({ up: 0.06 });
b.lathe(
  [
    [0, 0],
    [0.17, 0],
    [0.165, 0.06],
    [0.13, 0.14],
    [0.07, 0.19],
    [0, 0.2],
  ],
  { at: helmAt, bone: head, color: HELM, smoothing: 1 },
);
b.lathe(
  [
    [0.165, 0],
    [0.18, 0],
    [0.18, 0.025],
    [0.165, 0.025],
  ],
  { at: helmAt, bone: head, color: BRASS },
);
b.extrude(
  [
    [-0.16, 0],
    [0.12, 0],
    [0.09, 0.1],
    [0.03, 0.2, "sharp"],
    [-0.08, 0.14],
  ],
  { at: head.local({ up: 0.18, forward: -0.02 }), x: [0, 0, 1], thickness: 0.012, bevel: 0.003, color: PLUME, bone: head },
);

// ---------------------------------------------------------------------------------------------------------------
// Braided beard: a tapering core, three braided strands wound round it, brass bands and a bead at the tip.

const beardR = (t: number) => 0.085 * (1 - t) + 0.03;
const beardC = (t: number): [number, number, number] => [0, 1.05 - 0.22 * t, 0.12 + 0.05 * Math.sin(Math.PI * t)];
const beardPts = [0, 0.25, 0.5, 0.75, 1].map((t) => beardC(t));

b.sweep(catmull(beardPts), (t: number) => beardR(t), {
  bone: head,
  color: BEARD,
  caps: { start: "flat", end: "point" },
});

for (let k = 0; k < 3; k++) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 36; i++) {
    const t = 0.08 + (0.84 * i) / 36;
    const c = beardC(t);
    const r = beardR(t) * 0.8;
    const phi = t * Math.PI * 2 * 4 + (k * Math.PI * 2) / 3;
    pts.push([c[0] + r * Math.cos(phi), c[1], c[2] + r * Math.sin(phi)]);
  }
  b.sweep(catmull(pts), 0.016, { bone: head, color: k % 2 ? BRAID : BEARD });
}

b.along(catmull(beardPts), 4, (at) => {
  b.part(new THREE.TorusGeometry(beardR(at.t) + 0.004, 0.009, 5, 10), BRASS, {
    at,
    dir: at.axis,
    axis: "z",
  });
});
b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { bone: head, at: beardC(1) });

// ---------------------------------------------------------------------------------------------------------------
// Blunderbuss: a wooden stock, an iron barrel with brass bands, a flared bell muzzle.

const BUTT: [number, number, number] = [-0.22, 1.0, -0.1];
const BREECH: [number, number, number] = [-0.16, 0.98, 0.14];
const MUZZLE: [number, number, number] = [-0.14, 0.96, 0.86];

b.capsule(BUTT, BREECH, [0.045, 0.03], { color: WOOD });
b.capsule(BREECH, MUZZLE, [0.03, 0.028], { color: IRON });
b.lathe(
  [
    [0, 0],
    [0.036, 0],
    [0.03, 0.05],
    [0.058, 0.12],
    [0, 0.12],
  ],
  { at: [MUZZLE[0], MUZZLE[1], MUZZLE[2] - 0.12], axis: [0, 0, 1], color: IRON, smoothing: 1 },
);
b.along(polyline([BREECH, MUZZLE]), 3, (at) => {
  b.part(new THREE.TorusGeometry(0.038, 0.008, 5, 10), BRASS, { at, dir: at.axis, axis: "z" });
});

export default function build() {
  return b.root;
}
