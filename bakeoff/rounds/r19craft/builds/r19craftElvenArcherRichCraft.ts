// Elven ranger archer: high-fantasy anime. Cel-shaded paints (kits/toon), gold filigree trims, emerald cloak, a long
// ivory recurve bow held at the side with a wrapped fist, glowing cyan runes and gems (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import type { PointInput } from "../../../../src/math";
import { gradient, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { Chain, Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A tall elven ranger in cream tunic, emerald corset, half-cloak and petal pauldrons, long platinum hair with a gold circlet, a wrapped-fist grip on an ivory recurve bow with glowing runes, hip quiver and dagger.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Col = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour is a lit tone and one hue-shifted shadow tone.
const SKIN = cel("#ffe1cf", "#f0b2b2");
const SKIN_PINK = cel("#f7a3a9", "#d6788f");
const HAIR = cel(gradient("#fdfdff", "#c5d0f0", [0, 1.84, 0], [0, 1.1, 0]), "#8f9fd6");
const TUNIC = cel("#f9f2dc", "#c4c3dc");
const EMERALD = cel("#2fa365", "#1b6b66");
const EMERALD_D = cel("#1f7650", "#16475a");
const LINING = cel("#bfeacd", "#7fb6b8");
const GOLD = cel("#ffd86b", "#d98e3a");
const LEATHER = cel("#aa7342", "#6f3f3c");
const LEATHER_D = cel("#6b4328", "#43283a");
const TROUSER = cel("#39664f", "#25404f");
const IVORY = cel("#f4e8c4", "#c9a98d");
const ARROW = cel("#e2c58d", "#a97f68");
const GLOW_C = "#7dfff0";
const GLOW_G = "#b7ff9a";
const STRING = "#fff4d6";
const LIP = "#c96c7c";
const MARK = "#2fd9b0";

// ---------------------------------------------------------------------------------------------------------------
// Numbers that several parts share.
const G = new THREE.Vector3(0.421, 0.9, 0.126); // the bow grip, inside the left fist

function table(keys: ReadonlyArray<readonly [number, number]>) {
  return (x: number): number => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (x <= keys[i][0]) {
        const [x0, y0] = keys[i - 1];
        const [x1, y1] = keys[i];
        return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
      }
    }
    return keys[keys.length - 1][1];
  };
}

// Torso half-width and half-depth along the spine chain (t 0 = pelvis y 0.98, t 1 = neck base y 1.46).
const rxT = table([
  [0, 0.098],
  [0.2, 0.088],
  [0.5, 0.108],
  [0.78, 0.122],
  [1, 0.105],
]);
const ryT = table([
  [0, 0.075],
  [0.2, 0.066],
  [0.5, 0.078],
  [0.78, 0.082],
  [1, 0.07],
]);
const tAtY = (y: number) => Math.min(Math.max((y - 0.98) / 0.48, 0), 1);

// Bow: centre line offset (du along the limb, dz toward the string side) from the grip.
const bowTable: Array<[number, number]> = [
  [0, 0],
  [0.14, -0.018],
  [0.3, -0.068],
  [0.48, -0.12],
  [0.62, -0.138],
  [0.7, -0.118],
  [0.745, -0.085],
];
const zAt = table(bowTable);
const bowR = table([
  [0, 0.02],
  [0.15, 0.017],
  [0.5, 0.014],
  [0.85, 0.0095],
  [1, 0.006],
]);

// Paints that place wear and trim by position.
const TORSO = paint((p, n) => {
  if (n.z > 0.1 && p.y > 1.33) {
    const d = Math.abs(p.x) - (p.y - 1.33) * 0.55;
    if (d < 0) return SKIN;
    if (d < 0.012) return GOLD;
  }
  if (p.y < 1.295 && p.y > 1.0) {
    if (Math.abs(p.y - 1.295) < 0.007) return GOLD;
    if (n.z > 0.2 && Math.abs(p.x) < 0.006) return GOLD;
    return EMERALD;
  }
  return TUNIC;
});
const SKIRT = paint((p) => {
  if (p.y < 0.69) return GOLD;
  if (p.y < 0.725) return EMERALD;
  if (p.y < 0.735) return GOLD;
  return TUNIC;
});
const CAPE = paint((p, n, s) => {
  if (n.z > 0.3) return LINING;
  if (s[0] < 0.012 || s[0] > 0.988 || s[1] > 0.955) return GOLD;
  if (s[1] > 0.915) return EMERALD_D;
  const u = p.x / 0.07;
  const v = p.y / 0.08 + (Math.floor(u) % 2 ? 0.5 : 0);
  const fu = u - Math.floor(u) - 0.5;
  const fv = v - Math.floor(v) - 0.5;
  if (s[1] > 0.5 && fu * fu + fv * fv < 0.012) return GOLD;
  return s[1] > 0.7 ? EMERALD_D : EMERALD;
});
const BOW = paint((p, n) => {
  const du = Math.abs(p.y - G.y);
  if (du > 0.72) return GOLD;
  if ((du > 0.655 && du < 0.675) || (du > 0.585 && du < 0.595)) return GOLD;
  if (du < 0.075) return LEATHER_D;
  if (du < 0.085) return GOLD;
  if (n.x > 0.72 && du < 0.65) return EMERALD_D;
  return IVORY;
});

// Where the skull surface sits in front of (x, y), for hair that lies on the head.
const skullZ = (x: number, y: number) =>
  0.005 + 0.098 * Math.sqrt(Math.max(0.03, 1 - (x / 0.092) ** 2 - ((y - 1.69) / 0.106) ** 2));

const feather = (main: string, rib: string) =>
  svg(
    `<svg viewBox="0 0 32 96"><path d="M16 94 C2 70 2 30 16 2 C30 30 30 70 16 94Z" fill="${main}"/><path d="M16 94 L16 6" stroke="${rib}" stroke-width="3" fill="none"/><path d="M16 80 L6 60 M16 62 L5 40 M16 44 L8 24 M16 80 L26 60 M16 62 L27 40 M16 44 L24 24" stroke="${rib}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.6"/></svg>`,
    { size: 192 },
  );

const EMBLEM = svg(
  `<svg viewBox="0 0 64 128"><g fill="#ffd86b" stroke="#ffd86b" stroke-linecap="round">
    <path d="M32 10 L32 120" stroke-width="3.4" fill="none"/>
    <path d="M32 34 Q12 32 6 14 Q26 14 32 34Z"/><path d="M32 34 Q52 32 58 14 Q38 14 32 34Z"/>
    <path d="M32 62 Q10 60 3 40 Q26 40 32 62Z"/><path d="M32 62 Q54 60 61 40 Q38 40 32 62Z"/>
    <path d="M32 92 Q12 92 6 74 Q28 72 32 92Z"/><path d="M32 92 Q52 92 58 74 Q36 72 32 92Z"/>
    <path d="M32 4 Q38 12 32 20 Q26 12 32 4Z"/>
    </g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "elvenArcher", paintSize: 2048 });
  const rand = rng(21);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sideName = (s: number) => (s > 0 ? "L" : "R");

  const place = (geo: THREE.BufferGeometry, color: Col, bone: Joint, at: PointInput, o: PartOptions = {}) =>
    b.part(geo, color, { ...o, bone, at });
  const ell = (color: Col, bone: Joint, at: PointInput, r: [number, number, number], o: PartOptions = {}) =>
    place(new THREE.SphereGeometry(1, 12, 8), color, bone, at, { ...o, scale: r });

  // A flat leaf-shaped plate lying along L, thick along the (flattened) normal N.
  const leaf = (
    at: THREE.Vector3,
    L: THREE.Vector3,
    N: THREE.Vector3,
    len: number,
    wid: number,
    th: number,
    color: Col,
    bone: Joint,
  ) => {
    const Ln = L.clone().normalize();
    const Np = N.clone().addScaledVector(Ln, -N.dot(Ln)).normalize();
    const Y = Np.clone().cross(Ln).normalize();
    const outline: OutlinePoint[] = [
      [0, -wid * 0.6],
      [len * 0.3, -wid],
      [len * 0.7, -wid * 0.7],
      [len, 0, "sharp"],
      [len * 0.7, wid * 0.7],
      [len * 0.3, wid],
      [0, wid * 0.6],
    ];
    return b.extrude(outline, { at, x: Ln, y: Y, thickness: th, bevel: th * 0.3, smoothing: 1, color, bone });
  };

  // A tapering hair blade along a curve. `flip` makes it wide front-to-back instead of side-to-side.
  const lock = (pts: number[][], w: number, th: number, bone: Joint | Chain, flip = false) =>
    b.sweep(
      catmull(pts),
      (t): [number, number] => {
        const wide = w * (1 - 0.85 * t * t) + 0.0015;
        const thin = th * (1 - 0.4 * t) + 0.001;
        return flip ? [thin, wide] : [wide, thin];
      },
      { color: HAIR, bone, caps: { start: "flat", end: "point" }, sides: 6 },
    );

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.1, 0.004],
      [0, 1.28, 0.008],
      [0, 1.46, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.455, 0],
      [0, 1.52, 0.012],
      [0, 1.585, 0.025],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.585, 0.025], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.655, 0], aim: [0, 1.61, 0.09], role: "jaw" });

  const earDir = (s: number) => V(s * 0.86, 0.22, -0.42).normalize();
  const ears = new Map<number, Joint>();
  for (const s of [1, -1])
    ears.set(
      s,
      b.joint(`ear${sideName(s)}`, { parent: head, at: [s * 0.082, 1.7, -0.004], dir: earDir(s), role: "hinge" }),
    );

  const arms = new Map<number, Chain>();
  const legs = new Map<number, Chain>();
  const feet = new Map<number, Chain>();
  for (const s of [1, -1]) {
    const sd = sideName(s);
    arms.set(
      s,
      b.chain(
        `arm${sd}`,
        catmull([
          [s * 0.2, 1.43, 0],
          [s * 0.347, 1.18, 0],
          [s * 0.4145, 0.942, 0.108],
        ]),
        { parent: chest, names: [`shoulder${sd}`, `elbow${sd}`, `hand${sd}`], role: "arm" },
      ),
    );
    const lp = limb([s * 0.085, 0.92, 0], [s * 0.1, 0.085, 0], [0.425, 0.425], [0, 0, 1]);
    const leg = b.chain(`leg${sd}`, lp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.05],
    });
    legs.set(s, leg);
    feet.set(
      s,
      b.chain(
        `foot${sd}`,
        [
          [s * 0.1, 0.085, 0],
          [s * 0.1, 0.052, 0.115],
          [s * 0.1, 0.033, 0.2],
        ],
        { parent: leg.joints[2], names: [`foot${sd}`, `toe${sd}`], role: "digit" },
      ),
    );
  }

  const capeChain = b.chain(
    "cape",
    catmull([
      [0, 1.47, -0.11],
      [0.02, 1.1, -0.17],
      [0.05, 0.82, -0.22],
      [0.08, 0.58, -0.25],
    ]),
    { parent: chest, names: ["cape1", "cape2", "cape3"], role: "tail" },
  );

  const hairPts: number[][] = [
    [0, 1.745, -0.095],
    [0, 1.7, -0.175],
    [0.012, 1.55, -0.215],
    [-0.015, 1.36, -0.225],
    [0.01, 1.16, -0.235],
  ];
  const hairChain = b.chain("hairTail", hairPts, {
    parent: head,
    names: ["hairA", "hairB", "hairC", "hairD"],
    role: "tail",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Legs: trousers, knee-high boots with folded cuffs, soles and gold toe caps.
  const thighR = table([
    [0, 0.078],
    [0.15, 0.074],
    [0.4, 0.056],
    [0.52, 0.05],
    [0.62, 0.05],
  ]);
  const bootR = table([
    [0.56, 0.058],
    [0.65, 0.054],
    [0.8, 0.045],
    [1, 0.041],
  ]);
  const rxF = table([
    [0, 0.043],
    [0.5, 0.047],
    [1, 0.034],
  ]);
  const ryF = table([
    [0, 0.058],
    [0.5, 0.036],
    [1, 0.02],
  ]);
  for (const s of [1, -1]) {
    const leg = legs.get(s)!;
    const foot = feet.get(s)!;
    b.sweep(leg, thighR, { to: 0.62, color: TROUSER, sides: 10, caps: { start: "round", end: "flat" } });
    b.sweep(leg, bootR, { from: 0.56, color: LEATHER, caps: { start: "flat", end: "round" } });
    b.sweep(leg, (t) => bootR(t) + 0.008, { from: 0.56, to: 0.6, color: LEATHER_D, caps: "flat" });
    b.sweep(leg, (t) => bootR(t) + 0.011, { from: 0.598, to: 0.608, color: GOLD, caps: "flat" });
    b.sweep(leg, (t) => bootR(t) + 0.006, { from: 0.74, to: 0.75, color: GOLD, caps: "flat" });
    b.sweep(foot, (t): [number, number] => [rxF(t), ryF(t)], {
      color: LEATHER,
      extend: [0.04, 0],
      sides: 10,
    });
    const sole: OutlinePoint[] = [
      [-0.045, -0.05],
      [0.045, -0.05],
      [0.052, 0.05],
      [0.05, 0.15],
      [0.03, 0.215, "sharp"],
      [-0.03, 0.215, "sharp"],
      [-0.05, 0.15],
      [-0.052, 0.05],
    ];
    b.extrude(sole, {
      at: [s * 0.1, 0.011, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.022,
      smoothing: 1,
      color: LEATHER_D,
      bone: foot.joints[0],
    });
    ell(GOLD, foot.joints[1], [s * 0.1, 0.038, 0.2], [0.028, 0.018, 0.03]);
    // Lacing across the instep.
    for (let k = 0; k < 3; k++)
      b.rod([s * 0.075, 0.12 - k * 0.0, -0.01 + k * 0.0], [s * 0.125, 0.12, -0.01], 0.003, IVORY, {
        bone: foot.joints[0],
        sides: 4,
      });
  }

  // Pelvis and the flared tunic skirt with gold hem, tabard panels and hanging gold leaves.
  ell(TROUSER, hips, [0, 0.97, 0], [0.122, 0.095, 0.092]);
  const skirtOutline: OutlinePoint[] = [
    [0.108, 1.075],
    [0.15, 1.0],
    [0.19, 0.9],
    [0.235, 0.78],
    [0.272, 0.665],
    [0.258, 0.665],
    [0.222, 0.78],
    [0.178, 0.9],
    [0.138, 1.0],
    [0.096, 1.07],
  ];
  b.lathe(skirtOutline, { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: SKIRT, bone: hips });

  for (const sg of [1, -1]) {
    const up = V(0, 0.928, -0.371 * sg).normalize();
    const nrm = V(0, 0.371, 0.928 * sg).normalize();
    const origin = V(0, 1.075, sg * 0.11);
    const border: OutlinePoint[] = [
      [-0.062, 0],
      [0.062, 0],
      [0.07, -0.24],
      [0.062, -0.4],
      [0, -0.465, "sharp"],
      [-0.062, -0.4],
      [-0.07, -0.24],
    ];
    const inner: OutlinePoint[] = [
      [-0.05, -0.012],
      [0.05, -0.012],
      [0.058, -0.24],
      [0.05, -0.395],
      [0, -0.445, "sharp"],
      [-0.05, -0.395],
      [-0.058, -0.24],
    ];
    b.extrude(border, { at: origin, x: [1, 0, 0], y: up, thickness: 0.01, smoothing: 1, color: GOLD, bone: hips });
    b.extrude(inner, {
      at: origin.clone().addScaledVector(nrm, 0.002),
      x: [1, 0, 0],
      y: up,
      thickness: 0.014,
      smoothing: 1,
      color: EMERALD,
      bone: hips,
    });
    if (sg > 0) {
      const centre = origin.clone().addScaledVector(up, -0.23).addScaledVector(nrm, 0.011);
      place(new THREE.PlaneGeometry(0.07, 0.14), "#ffffff", hips, centre, {
        dir: nrm,
        axis: "z",
        up,
        texture: EMBLEM,
      });
    }
  }
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36 + 18) * Math.PI) / 180;
    const at = V(0.266 * Math.sin(a), 0.675, 0.266 * Math.cos(a));
    leaf(
      at,
      V(0.12 * Math.sin(a), -1, 0.12 * Math.cos(a)),
      V(Math.sin(a), 0.1, Math.cos(a)),
      0.062,
      0.024,
      0.008,
      i % 2 ? GOLD : EMERALD,
      hips,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Torso: cream blouse with an emerald corset, V neck, gold edging, belt and lacing.
  const torso = b.sweep(spine, (t): [number, number] => [rxT(t), ryT(t)], {
    color: TORSO,
    sides: 12,
    caps: { start: "round", end: "flat" },
  });
  ell(TUNIC, chest, [0, 1.435, 0], [0.2, 0.05, 0.085]);
  b.sweep(neck, [0.036, 0.032], { color: SKIN, sides: 8 });

  const waist = spine.joints[0];
  const beltT = tAtY(1.04);
  const belt = place(
    new THREE.CylinderGeometry(1, 1, 0.045, 12, 1, true),
    LEATHER_D,
    waist,
    [0, 1.04, 0],
    { scale: [rxT(beltT) + 0.014, 1, ryT(beltT) + 0.014] },
  );
  void belt;
  const beltZ = ryT(beltT) + 0.016;
  place(new THREE.BoxGeometry(0.058, 0.05, 0.014), GOLD, waist, [0, 1.04, beltZ + 0.004]);
  glow(ell(GLOW_C, waist, [0, 1.04, beltZ + 0.013], [0.011, 0.014, 0.006]), 1.4);
  for (const s of [1, -1]) place(new THREE.BoxGeometry(0.02, 0.052, 0.012), GOLD, waist, [s * 0.047, 1.04, beltZ - 0.004]);

  // Corset lacing.
  for (let k = 0; k < 6; k++) {
    const y = 1.1 + k * 0.03;
    const z = ryT(tAtY(y)) + 0.003;
    for (const s of [1, -1]) place(new THREE.SphereGeometry(0.0055, 6, 4), GOLD, spine.joints[1], [s * 0.014, y, z]);
    if (k < 5)
      b.rod([-0.014, y, z + 0.001], [0.014, y + 0.03, z + 0.001], 0.0024, IVORY, {
        bone: spine.joints[1],
        sides: 4,
      });
  }

  // Bandolier strap draped over the chest with studs.
  const skinT = b.surface(torso);
  const strapPath = skinT.drape(
    catmull([
      [0.115, 1.465, 0.01],
      [0.07, 1.38, 0.085],
      [-0.01, 1.27, 0.105],
      [-0.075, 1.13, 0.085],
      [-0.108, 1.07, 0.01],
    ]),
    { lift: 0.012 },
  );
  b.sweep(strapPath, 0.014, LEATHER, { sides: 6 });
  b.along(strapPath, 6, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at }));

  // Rolled collar over the shoulders, with a gold lip and a clasp chain across the chest.
  const collar = (kx: number, kz: number, dy: number) => {
    const pts: number[][] = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const x = 0.155 * Math.sin(a);
      const z = 0.088 * Math.cos(a);
      const h = 1.44 + 0.05 * Math.sqrt(Math.max(0, 1 - (x / 0.2) ** 2 - (z / 0.085) ** 2));
      pts.push([x * kx, h + dy, z * kz]);
    }
    return catmull(pts, { closed: true });
  };
  b.sweep(collar(1, 1, 0.014), 0.026, EMERALD, { bone: chest, sides: 8 });
  b.sweep(collar(1.1, 1.1, -0.012), 0.007, GOLD, { bone: chest, sides: 6 });
  const neckRing: number[][] = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    neckRing.push([0.045 * Math.sin(a), 1.5, 0.045 * Math.cos(a) + 0.01]);
  }
  b.sweep(catmull(neckRing, { closed: true }), 0.006, GOLD, { bone: neck.joints[0], sides: 6 });
  for (const s of [1, -1]) {
    place(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8), GOLD, chest, [s * 0.115, 1.475, 0.075], {
      dir: [s * 0.3, 0.3, 1],
    });
    glow(ell(GLOW_G, chest, [s * 0.117, 1.478, 0.082], [0.008, 0.008, 0.008]), 1.4);
  }
  b.sweep(
    catmull([
      [0.115, 1.47, 0.07],
      [0.06, 1.425, 0.1],
      [0, 1.41, 0.105],
      [-0.06, 1.425, 0.1],
      [-0.115, 1.47, 0.07],
    ]),
    0.004,
    GOLD,
    { bone: chest, sides: 5 },
  );
  glow(place(new THREE.OctahedronGeometry(0.014, 0), GLOW_C, chest, [0, 1.397, 0.106]), 1.5);

  // -------------------------------------------------------------------------------------------------------------
  // Arms: flared cream sleeves, skin forearms, emerald bracers with gold bands, petal pauldrons.
  const armR = table([
    [0, 0.048],
    [0.2, 0.043],
    [0.5, 0.034],
    [0.75, 0.03],
    [1, 0.026],
  ]);
  for (const s of [1, -1]) {
    const arm = arms.get(s)!;
    const shoulder = arm.joints[0];
    const sd = sideName(s);
    b.sweep(arm, armR, {
      bands: [
        [0.5, TUNIC],
        [1, SKIN],
      ],
      sides: 10,
    });
    ell(TUNIC, shoulder, [s * 0.2, 1.43, 0], [0.052, 0.052, 0.052]);
    b.sweep(arm, (t) => armR(t) + 0.012, { from: 0.42, to: 0.52, color: TUNIC, caps: "flat", sides: 10 });
    b.sweep(arm, (t) => armR(t) + 0.014, { from: 0.51, to: 0.535, color: GOLD, caps: "flat", sides: 10 });
    b.sweep(arm, (t) => armR(t) + 0.007, { from: 0.62, to: 0.97, color: EMERALD_D, caps: "flat", sides: 8 });
    b.sweep(arm, (t) => armR(t) + 0.009, { from: 0.62, to: 0.645, color: GOLD, caps: "flat", sides: 8 });
    b.sweep(arm, (t) => armR(t) + 0.009, { from: 0.945, to: 0.97, color: GOLD, caps: "flat", sides: 8 });
    b.sweep(arm, (t) => armR(t) + 0.009, { from: 0.78, to: 0.8, color: GOLD, caps: "flat", sides: 8 });
    const gemAt = arm.at(0.71);
    glow(
      b.part(new THREE.OctahedronGeometry(0.0115, 0), GLOW_G, {
        bone: arm.joints[1],
        at: gemAt.at.clone().add(V(s * 0.012, 0.006, 0.02)),
      }),
      1.4,
    );
    // Petal pauldron: gold underlay and emerald plate, fanned over the shoulder.
    for (const [zr, zf, len] of [
      [0.035, 0.4, 0.15],
      [0, 0, 0.17],
      [-0.035, -0.4, 0.15],
    ] as const) {
      const L = V(s * 0.55, -0.83, zf);
      const N = V(s * 0.83, 0.55, 0);
      const at = V(s * 0.17, 1.512, zr);
      leaf(at, L, N, len + 0.012, 0.04, 0.008, GOLD, shoulder);
      leaf(at.clone().add(V(0, 0.003, 0)), L, N, len, 0.031, 0.013, EMERALD, shoulder);
    }
    glow(ell(GLOW_C, shoulder, [s * 0.185, 1.497, 0.0], [0.009, 0.009, 0.009]), 1.3);
    void sd;
  }

  // Digits: a helper that curls a chain of segments toward a palm normal.
  const digit = (
    name: string,
    parent: Joint,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    n: THREE.Vector3,
    lens: number[],
    curl0: number,
    curl: number,
    rad: [number, number],
  ) => {
    const pts: THREE.Vector3[] = [base.clone()];
    const d = dir.clone().normalize();
    let a = curl0 * DEG;
    let cur = base.clone();
    for (const len of lens) {
      const dd = d.clone().multiplyScalar(Math.cos(a)).addScaledVector(n, Math.sin(a)).normalize();
      cur = cur.clone().addScaledVector(dd, len);
      pts.push(cur);
      a += curl * DEG;
    }
    const ch = b.chain(name, pts, { parent, names: lens.map((_, i) => `${name}${i + 1}`), role: "digit" });
    b.sweep(ch, rad, { color: SKIN, sides: 6 });
    return ch;
  };

  // Right hand: relaxed and open.
  {
    const hand = arms.get(-1)!.joints[2];
    const W = V(-0.4145, 0.942, 0.108);
    const dirH = V(-0.15, -0.92, 0.35).normalize();
    const nrm = V(1, 0, 0);
    const lat = V(0, dirH.z, -dirH.y).normalize();
    ell(SKIN, hand, W.clone().addScaledVector(dirH, 0.043), [0.016, 0.047, 0.038], { dir: dirH });
    const fingers: Array<[string, number, number[]]> = [
      ["fingerIndexR", 0.025, [0.034, 0.024, 0.02]],
      ["fingerMiddleR", 0.0085, [0.036, 0.026, 0.021]],
      ["fingerRingR", -0.0085, [0.033, 0.024, 0.019]],
      ["fingerPinkyR", -0.025, [0.026, 0.019, 0.016]],
    ];
    for (const [name, off, lens] of fingers)
      digit(
        name,
        hand,
        W.clone().addScaledVector(dirH, 0.082).addScaledVector(lat, off),
        dirH,
        nrm,
        lens,
        6,
        16,
        [0.0085, 0.0065],
      );
    digit(
      "thumbR",
      hand,
      W.clone().addScaledVector(dirH, 0.03).addScaledVector(lat, 0.036),
      dirH.clone().multiplyScalar(0.75).addScaledVector(lat, 0.55).addScaledVector(nrm, 0.15),
      nrm,
      [0.032, 0.028, 0.024],
      10,
      14,
      [0.0098, 0.0072],
    );
  }

  // Left hand: a fist wrapped round the bow grip.
  const handL = arms.get(1)!.joints[2];
  ell(SKIN, handL, [G.x - 0.016, G.y, G.z - 0.016], [0.03, 0.05, 0.03]);
  const wrapAngles: number[][] = [
    [185, 140, 95, 50],
    [185, 143, 100, 58],
    [185, 146, 106, 66],
    [185, 150, 115, 80],
  ];
  const wrapY = [0.036, 0.012, -0.012, -0.036];
  wrapAngles.forEach((angs, i) => {
    const pts = angs.map((deg) => [
      G.x + 0.0275 * Math.cos(deg * DEG),
      G.y + wrapY[i],
      G.z + 0.0275 * Math.sin(deg * DEG),
    ]);
    const ch = b.chain(`finger${i + 1}L`, pts, {
      parent: handL,
      names: [`finger${i + 1}L1`, `finger${i + 1}L2`, `finger${i + 1}L3`],
      role: "digit",
    });
    b.sweep(ch, [0.0088, 0.0068], { color: SKIN, sides: 6 });
  });
  {
    const thumb = b.chain(
      "thumbL",
      [
        [G.x - 0.013, G.y + 0.04, G.z - 0.012],
        [G.x + 0.002, G.y + 0.058, G.z + 0.012],
        [G.x + 0.022, G.y + 0.054, G.z + 0.036],
      ],
      { parent: handL, names: ["thumbL1", "thumbL2"], role: "digit" },
    );
    b.sweep(thumb, [0.01, 0.0075], { color: SKIN, sides: 6 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Bow: ivory recurve with emerald inlay, gold fittings, glowing runes, string and a tassel.
  const bowPts: number[][] = [
    ...bowTable
      .slice(1)
      .reverse()
      .map(([du, dz]) => [G.x, G.y - du, G.z + dz]),
    [G.x, G.y, G.z],
    ...bowTable.slice(1).map(([du, dz]) => [G.x, G.y + du, G.z + dz]),
  ];
  b.sweep(catmull(bowPts), (t) => bowR(Math.abs(t - 0.5) * 2), { color: BOW, bone: handL, caps: "round" });
  b.rod([G.x, G.y - 0.07, G.z], [G.x, G.y + 0.07, G.z], 0.0205, LEATHER_D, { bone: handL, sides: 8 });
  for (const dy of [-0.07, 0.07])
    b.rod([G.x, G.y + dy - 0.004, G.z], [G.x, G.y + dy + 0.004, G.z], 0.0225, GOLD, { bone: handL, sides: 8 });
  for (const sg of [1, -1]) {
    for (const du of [0.2, 0.32, 0.44, 0.54]) {
      glow(
        place(
          new THREE.BoxGeometry(0.0035, 0.026, 0.006),
          GLOW_C,
          handL,
          [G.x + bowR(du) + 0.0004, G.y + sg * du, G.z + zAt(du)],
        ),
        1.4,
      );
    }
    const tip = V(G.x, G.y + sg * 0.745, G.z + zAt(0.745));
    glow(ell(GLOW_G, handL, tip.clone().add(V(0, 0, 0.004)), [0.0095, 0.0095, 0.0095]), 1.5);
    b.spike(tip, [0, sg, 0.5], 0.05, 0.012, GOLD, { bone: handL, sides: 6 });
  }
  const nockHi = [G.x, G.y + 0.73, G.z + zAt(0.73) - 0.012];
  const nockLo = [G.x, G.y - 0.73, G.z + zAt(0.73) - 0.012];
  b.rod(nockLo, nockHi, 0.0025, STRING, { bone: handL, sides: 4 });
  b.rod([G.x, G.y + 0.1, nockHi[2]], [G.x, G.y + 0.14, nockHi[2]], 0.0042, GOLD, { bone: handL, sides: 6 });
  // Tassel under the grip.
  b.sweep(
    catmull([
      [G.x + 0.012, G.y - 0.07, G.z - 0.005],
      [G.x + 0.03, G.y - 0.11, G.z + 0.01],
      [G.x + 0.034, G.y - 0.15, G.z + 0.012],
    ]),
    0.0035,
    EMERALD,
    { bone: handL, sides: 5 },
  );
  glow(ell(GLOW_C, handL, [G.x + 0.034, G.y - 0.158, G.z + 0.012], [0.009, 0.011, 0.009]), 1.3);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.spike(
      [G.x + 0.034 + 0.005 * Math.cos(a), G.y - 0.165, G.z + 0.012 + 0.005 * Math.sin(a)],
      [0.2 * Math.cos(a), -1, 0.2 * Math.sin(a)],
      0.085,
      0.0045,
      k % 2 ? EMERALD : GOLD,
      { bone: handL, sides: 5 },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: skull, narrow face, jaw, nose, mouth, anime eyes and cheek marks.
  const skull = ell(SKIN, head, [0, 1.69, 0.005], [0.092, 0.106, 0.098], { segments: undefined } as PartOptions);
  const face = ell(SKIN, head, [0, 1.645, 0.035], [0.077, 0.078, 0.075]);
  const chin = ell(SKIN, jaw, [0, 1.618, 0.048], [0.058, 0.044, 0.056]);
  const faceSkin = b.surface([skull, face, chin]);

  const noseHit = faceSkin.nearest([0, 1.655, 0.13]);
  b.part(new THREE.SphereGeometry(1, 6, 4), SKIN, {
    bone: head,
    at: noseHit.moved([0, 0.003, 0]),
    scale: [0.0105, 0.013, 0.014],
  });
  b.sweep(
    faceSkin.drape(
      catmull([
        [-0.018, 1.623, 0.112],
        [-0.006, 1.619, 0.115],
        [0.006, 1.619, 0.115],
        [0.018, 1.623, 0.112],
      ]),
      { lift: 0.0012 },
    ),
    0.0022,
    LIP,
    { sides: 5 },
  );
  const EYE = animeEye({ iris: "#2fd9a4", irisLight: "#b6ffe0", brow: true });
  for (const s of [1, -1]) {
    const hit = faceSkin.nearest([s * 0.047, 1.678, 0.12]);
    b.decal(faceSkin, EYE, {
      at: hit.at,
      dir: [s * 0.22, 0, 1],
      size: [0.052, 0.071],
      mirror: s > 0,
    });
    b.sweep(
      faceSkin.drape(
        catmull([
          [s * 0.05, 1.662, 0.105],
          [s * 0.057, 1.652, 0.102],
          [s * 0.064, 1.64, 0.098],
        ]),
        { lift: 0.001 },
      ),
      0.0018,
      MARK,
      { sides: 4 },
    );
  }

  // Ears: long, swept back and up, with pink inner, gold stud and a glowing drop.
  const earOuter: OutlinePoint[] = [
    [0, -0.02],
    [0.04, -0.03],
    [0.1, -0.012],
    [0.19, 0.045, "sharp"],
    [0.1, 0.035],
    [0.04, 0.04],
    [0, 0.025],
  ];
  const earInner: OutlinePoint[] = [
    [0.02, -0.01],
    [0.06, -0.018],
    [0.11, -0.004],
    [0.155, 0.037, "sharp"],
    [0.1, 0.024],
    [0.055, 0.026],
    [0.02, 0.015],
  ];
  for (const s of [1, -1]) {
    const X = earDir(s);
    const Y = V(0, 1, 0).addScaledVector(X, -X.y).normalize();
    const at0 = V(s * 0.082, 1.7, -0.004);
    const earJ = ears.get(s)!;
    b.extrude(earOuter, { at: at0, x: X, y: Y, thickness: 0.008, bevel: 0.002, smoothing: 1, color: SKIN, bone: earJ });
    b.extrude(earInner, {
      at: at0.clone().addScaledVector(X, 0.008),
      x: X,
      y: Y,
      thickness: 0.0105,
      smoothing: 1,
      color: SKIN_PINK,
      bone: earJ,
    });
    const lobe = at0.clone().addScaledVector(X, 0.035).addScaledVector(Y, -0.032);
    place(new THREE.SphereGeometry(0.0055, 6, 4), GOLD, earJ, lobe);
    glow(ell(GLOW_C, earJ, lobe.clone().add(V(0, -0.016, 0)), [0.006, 0.0105, 0.006]), 1.4);
    b.rod(lobe, lobe.clone().add(V(0, -0.008, 0)), 0.0016, GOLD, { bone: earJ, sides: 4 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Hair: cap, back volume, bangs, long face-framing locks and a ponytail with ribbons.
  ell(HAIR, head, [0, 1.712, -0.014], [0.099, 0.104, 0.108]);
  ell(HAIR, head, [0, 1.7, -0.095], [0.07, 0.09, 0.06]);
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.02;
    const tipX = Math.max(-0.082, Math.min(0.082, x * 1.5 + (i === 0 ? 0.008 : 0)));
    const midX = x * 1.15;
    lock(
      [
        [x * 0.6, 1.792, 0.045],
        [midX, 1.762, skullZ(midX, 1.762) + 0.012],
        [tipX, 1.726 + Math.abs(i) * 0.003, skullZ(tipX, 1.726) + 0.012],
      ],
      0.017,
      0.012,
      head,
    );
  }
  for (const s of [1, -1]) {
    lock(
      [
        [s * 0.075, 1.775, 0.035],
        [s * 0.092, 1.7, 0.06],
        [s * 0.086, 1.6, 0.07],
        [s * 0.08, 1.5, 0.08],
      ],
      0.02,
      0.009,
      head,
      true,
    );
    lock(
      [
        [s * 0.06, 1.78, 0.02],
        [s * 0.098, 1.72, 0.03],
        [s * 0.1, 1.62, 0.04],
        [s * 0.095, 1.54, 0.048],
      ],
      0.016,
      0.008,
      head,
      true,
    );
  }
  b.sweep(
    hairChain,
    (t): [number, number] => {
      const k = table([
        [0, 0.03],
        [0.2, 0.045],
        [0.45, 0.05],
        [0.75, 0.036],
        [1, 0.006],
      ])(t);
      return [k, k * 0.7];
    },
    { color: HAIR, caps: { start: "round", end: "point" }, sides: 8 },
  );
  for (const off of [-0.035, -0.012, 0.014, 0.036]) {
    lock(
      hairPts.map((p, i) => [p[0] + off * (i / 4), p[1] - (i === 4 ? Math.abs(off) * 2 : 0), p[2] + 0.004 * i]),
      0.02,
      0.012,
      hairChain,
    );
  }
  place(new THREE.TorusGeometry(0.034, 0.009, 6, 10), GOLD, head, [0, 1.738, -0.108], { dir: [0, -0.5, -0.85], axis: "z" });
  glow(ell(GLOW_G, head, [0, 1.737, -0.14], [0.011, 0.011, 0.011]), 1.4);
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [0, 1.74, -0.11],
        [s * 0.04, 1.65, -0.2],
        [s * 0.07, 1.52, -0.23],
        [s * 0.09, 1.38, -0.2],
      ]),
      (t): [number, number] => [0.012 * (1 - 0.3 * t), 0.003],
      { color: EMERALD, bone: hairChain, caps: { start: "flat", end: "point" }, sides: 4 },
    );

  // Circlet with a forehead gem and leaf wings.
  const circlet: number[][] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    circlet.push([0.098 * Math.sin(a), 1.765 - 0.014 * Math.max(0, Math.cos(a)), -0.012 + 0.1 * Math.cos(a)]);
  }
  b.sweep(catmull(circlet, { closed: true }), 0.0065, GOLD, { bone: head, sides: 6 });
  const drop: OutlinePoint[] = [
    [-0.012, 0],
    [0, 0.02],
    [0.012, 0],
    [0, -0.026, "sharp"],
  ];
  b.extrude(drop, { at: [0, 1.752, 0.094], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, smoothing: 1, color: GOLD, bone: head });
  glow(place(new THREE.OctahedronGeometry(0.0115, 0), GLOW_C, head, [0, 1.752, 0.1]), 1.6);
  for (const s of [1, -1])
    leaf(V(s * 0.014, 1.758, 0.093), V(s * 0.9, 0.05, -0.3), V(0, 1, 0), 0.06, 0.012, 0.006, GOLD, head);

  // -------------------------------------------------------------------------------------------------------------
  // Half-cloak on the back, hanging from the left shoulder, with gold trim and a diamond pattern.
  const capeTop = catmull([
    [0.19, 1.435, -0.04],
    [0.15, 1.468, -0.075],
    [0.09, 1.478, -0.1],
    [0, 1.48, -0.112],
    [-0.07, 1.475, -0.105],
    [-0.125, 1.46, -0.075],
    [-0.155, 1.44, -0.03],
  ]);
  const capeHem = catmull([
    [0.33, 0.62, -0.1],
    [0.29, 0.57, -0.16],
    [0.2, 0.55, -0.21],
    [0.06, 0.6, -0.245],
    [-0.04, 0.8, -0.22],
    [-0.11, 1.05, -0.165],
    [-0.145, 1.34, -0.085],
  ]);
  b.membrane(capeTop, capeHem, { color: CAPE, thickness: 0.008, rows: 6, bone: capeChain });

  // -------------------------------------------------------------------------------------------------------------
  // Hip gear: pouch, dagger and the quiver with fletched arrows.
  {
    const a = (60 * Math.PI) / 180;
    const at = V(0.185 * Math.sin(a), 0.95, 0.185 * Math.cos(a));
    place(new THREE.BoxGeometry(0.066, 0.08, 0.042), LEATHER, hips, at, { rotation: [0, 60, 0] });
    place(new THREE.BoxGeometry(0.07, 0.034, 0.046), LEATHER_D, hips, at.clone().add(V(0, 0.026, 0)), {
      rotation: [0, 60, 0],
    });
    glow(
      ell(GLOW_G, hips, at.clone().add(V(0.023 * Math.sin(a), 0.014, 0.023 * Math.cos(a))), [0.007, 0.007, 0.007]),
      1.3,
    );
  }
  // Dagger on the right hip.
  b.rod([-0.158, 1.0, 0.092], [-0.185, 0.82, 0.05], [0.016, 0.009], LEATHER_D, { bone: hips, sides: 6 });
  b.rod([-0.158, 1.0, 0.092], [-0.16, 0.985, 0.09], 0.019, GOLD, { bone: hips, sides: 6 });
  b.rod([-0.185, 0.83, 0.05], [-0.187, 0.81, 0.046], 0.011, GOLD, { bone: hips, sides: 6 });
  b.rod([-0.152, 1.012, 0.098], [-0.148, 1.07, 0.106], 0.0095, LEATHER, { bone: hips, sides: 6 });
  place(new THREE.BoxGeometry(0.05, 0.008, 0.012), GOLD, hips, [-0.153, 1.008, 0.097], { rotation: [0, 20, 0] });
  glow(place(new THREE.OctahedronGeometry(0.011, 0), GLOW_C, hips, [-0.147, 1.082, 0.108]), 1.5);

  // Quiver: tilted lathe body, gold bands, arrows with fletching cards and glowing nocks.
  const qB = V(-0.23, 0.78, -0.095);
  const qD = V(0.18, 0.95, -0.25).normalize();
  const qT = qB.clone().addScaledVector(qD, 0.5);
  const quiverOutline: OutlinePoint[] = [
    [0, 0],
    [0.036, 0],
    [0.046, 0.04],
    [0.05, 0.18],
    [0.053, 0.36],
    [0.058, 0.385],
    [0.058, 0.5],
    [0.052, 0.5],
    [0, 0.5],
  ];
  const QUIVER = paint((_p, n, s) => {
    if (n.dot(qD) > 0.9) return cel("#2a1730", "#1a0f22");
    if (s[0] > 0.47 || s[0] < 0.035) return GOLD;
    if (s[0] > 0.385) return LEATHER_D;
    if (s[0] > 0.25 && s[0] < 0.27) return GOLD;
    return (((s[1] / 45) % 1) + 1) % 1 < 0.08 ? LEATHER_D : LEATHER;
  });
  b.lathe(quiverOutline, { at: qB, axis: qD, segments: 10, color: QUIVER, bone: hips });
  b.rod([-0.19, 0.99, -0.115], [-0.095, 1.045, -0.06], 0.008, LEATHER_D, { bone: hips, sides: 5 });
  const qu = qD.clone().cross(V(0, 0, 1)).normalize();
  const qv = qD.clone().cross(qu).normalize();
  const splay: Array<[number, number]> = [
    [0, 0],
    [0.025, 0.01],
    [-0.025, 0.01],
    [0.012, -0.025],
    [-0.012, -0.025],
    [0, 0.03],
  ];
  const fletchFrames = splay.map(([a, c]) => {
    const p0 = qT.clone().addScaledVector(qu, a).addScaledVector(qv, c);
    const d = qD.clone().addScaledVector(qu, a * 1.2 + (rand() - 0.5) * 0.04).addScaledVector(qv, c * 1.2).normalize();
    b.rod(p0.clone().addScaledVector(d, -0.03), p0.clone().addScaledVector(d, 0.2), 0.0045, ARROW, {
      bone: hips,
      sides: 5,
    });
    glow(ell(GLOW_C, hips, p0.clone().addScaledVector(d, 0.205), [0.0055, 0.0055, 0.0055]), 1.3);
    return frame(p0.clone().addScaledVector(d, 0.085), d);
  });
  b.cards(fletchFrames, [feather("#8ee8b0", "#2a8a66"), feather("#fff2d0", "#c9a870")], {
    size: [0.03, 0.095],
    cross: true,
    rng: rng(5),
    vary: 0.1,
    bone: hips,
  });

  return b.root;
}
