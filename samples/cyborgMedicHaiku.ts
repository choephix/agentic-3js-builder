import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { limb } from "../src/ik";
import { bezier, catmull } from "../src/path";
import { grain, paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cyborg Medic with Healing Staff",
  description:
    "A support-hero cyborg medic in white plated armour and a charcoal suit, with one teal accent: a visor slit, a chest reactor, a backpack core and a tall healing staff with a crystal emitter. The left arm is cybernetic, the right is human.",
  style: "Overwatch",
  commit: "b816db2",
};

type Vec = [number, number, number];

const WHITE = "#eef2f5";
const SHADE = "#b4bfca";
const CHAR = "#2d3845";
const INK = "#12171e";
const TEAL = "#34ead0";
const SKIN = "#d9a48a";
const SEAM = "#6f7d8b";

// Overwatch-style plating: dark panel seams on a grid laid over the dominant face, with a light bevel beside each seam.
function plating(base: string, size: number) {
  return paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const u = ax >= ay && ax >= az ? p.z : p.x;
    const v = ay >= ax && ay >= az ? p.z : p.y;
    const fu = u / size - Math.floor(u / size);
    const fv = v / size - Math.floor(v / size);
    const d = Math.min(fu, 1 - fu, fv, 1 - fv) * size;
    return d < 0.0035 ? SEAM : d < 0.0065 ? "#ffffff" : base;
  });
}
const ARMOUR = plating(WHITE, 0.2);
const SHELL = plating(SHADE, 0.16);
// Charcoal suit with a fine woven streak so the large dark areas aren't flat.
const SUIT = grain(CHAR, "#262f3b", { size: 0.04, axis: "y" });

const visor = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="160" height="40" rx="6" fill="#0c1216"/><rect x="8" y="12" width="144" height="16" rx="8" fill="${TEAL}"/><rect x="56" y="16" width="48" height="8" rx="4" fill="#e6fffa"/></svg>`,
  { size: 256 },
);
const pulse = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60"><path d="M4 30 H44 L54 30 L62 12 L74 50 L84 22 L92 30 H156" fill="none" stroke="${TEAL}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedicHaiku", paintSize: 2048 });

  // Large pieces keep two bevel segments; small ones take one (a chamfer) so they stay low-poly.
  const box = (w: number, h: number, d: number, r: number, at: Vec, bone: Joint, color: string | Paint) =>
    b.part(new RoundedBoxGeometry(w, h, d, Math.min(w, h, d) > 0.08 ? 2 : 1, r), color, { bone, at });

  const digit = (name: string, pts: Vec[], parent: Joint, color: string | Paint, radius: [number, number]) => {
    const chain = b.chain(name, catmull(pts), {
      parent,
      names: [1, 2, 3].map((k) => `${name}${k}`),
      role: "digit",
    });
    b.sweep(chain, radius, { color });
  };

  // ---- skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.16, 0],
      [0, 1.31, 0],
      [0, 1.44, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const [spine1, spine2, spine3, chest] = spine.joints;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.44, 0],
      [0, 1.54, 0.01],
      [0, 1.62, 0.02],
    ]),
    { parent: chest, names: ["neck", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.64, 0.03], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 0.075], dir: [0, -1, 0.3], role: "jaw" });

  // Left arm: cybernetic. Right arm: human, reaching up to grip the staff.
  const armL = b.chain(
    "armL",
    catmull([
      [0.2, 1.37, 0],
      [0.27, 1.13, 0.05],
      [0.31, 0.92, 0.1],
    ]),
    { parent: chest, names: ["upperArmL", "forearmL", "handL"], role: "arm" },
  );
  const armRPts = limb([-0.2, 1.37, 0], [-0.35, 1.05, 0.12], [0.245, 0.235], [-0.2, -0.25, -1]);
  const armR = b.chain("armR", catmull(armRPts), {
    parent: chest,
    names: ["upperArmR", "forearmR", "handR"],
    role: "arm",
  });
  const [, , handL] = armL.joints;
  const [, , handR] = armR.joints;

  // Legs: hip to ankle, knee bent forward, feet on the floor.
  const legs = [1, -1].map((s) => {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.11, 0.97, 0], [s * 0.12, 0.1, -0.01], [0.46, 0.44], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, catmull(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    return { s, pts, leg };
  });

  // ---- hips and legs ------------------------------------------------------------------------------------------
  box(0.27, 0.13, 0.18, 0.04, [0, 0.95, 0], hips, SUIT);
  box(0.27, 0.055, 0.19, 0.02, [0, 1.03, 0], spine1, INK);
  glow(box(0.06, 0.04, 0.016, 0.008, [0, 1.03, 0.1], spine1, TEAL));
  for (const s of [1, -1]) box(0.075, 0.13, 0.16, 0.03, [s * 0.155, 0.97, 0], hips, ARMOUR);
  // Medic pouch on the model's right hip, with a strap.
  box(0.1, 0.11, 0.07, 0.02, [-0.15, 0.97, 0.12], hips, SHELL);
  box(0.11, 0.014, 0.08, 0.004, [-0.15, 1.03, 0.12], hips, INK);

  for (const { s, pts, leg } of legs) {
    b.sweep(leg, [0.072, 0.058, 0.05], {
      bands: [
        [0.48, SUIT],
        [0.56, INK],
        [1, ARMOUR],
      ],
    });
    const knee = pts[1];
    box(0.1, 0.085, 0.05, 0.02, [knee.x, knee.y, knee.z + 0.05], leg.joints[1], ARMOUR);
    const ankle = leg.joints[2];
    box(0.12, 0.1, 0.25, 0.035, [s * 0.12, 0.075, 0.04], ankle, ARMOUR);
    box(0.13, 0.035, 0.27, 0.012, [s * 0.12, 0.02, 0.04], ankle, INK);
    box(0.1, 0.03, 0.05, 0.01, [s * 0.12, 0.085, 0.14], ankle, SHELL);
    box(0.11, 0.05, 0.07, 0.02, [s * 0.12, 0.065, 0.165], ankle, SHELL);
  }

  // ---- torso --------------------------------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 1.0, 0], w: 0.24, h: 0.15 },
      { at: [0, 1.16, 0], w: 0.22, h: 0.14 },
      { at: [0, 1.31, 0], w: 0.3, h: 0.18 },
      { at: [0, 1.43, 0], w: 0.28, h: 0.15 },
    ],
    { bone: spine, color: SUIT },
  );
  const chestPlate = box(0.3, 0.26, 0.1, 0.04, [0, 1.34, 0.07], spine3, ARMOUR);
  glow(
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 14), TEAL, {
      bone: spine3,
      at: [0, 1.36, 0.125],
      dir: [0, 0, 1],
    }),
  );
  b.part(new THREE.TorusGeometry(0.042, 0.008, 6, 14), INK, {
    bone: spine3,
    at: [0, 1.36, 0.124],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.decal(chestPlate, pulse, { at: [0, 1.285, 0.12], dir: [0, 0, 1], size: [0.14, 0.05] });
  for (let k = 0; k < 3; k++) box(0.16, 0.012, 0.02, 0.004, [0, 1.12 + k * 0.022, 0.08], spine2, INK);

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), s > 0 ? ARMOUR : SHELL, {
      bone: chest,
      at: [s * 0.2, 1.36, 0],
      scale: [1, 0.7, 1.05],
    });
    b.part(new THREE.SphereGeometry(0.05, 10, 8), INK, {
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
      at: [s * 0.2, 1.37, 0],
    });
  }

  box(0.17, 0.05, 0.15, 0.02, [0, 1.47, 0], chest, SHELL);

  // Backpack medic unit with a teal core.
  box(0.26, 0.36, 0.13, 0.04, [0, 1.27, -0.135], spine2, SHELL);
  glow(
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.016, 12), TEAL, {
      bone: spine2,
      at: [0, 1.3, -0.207],
      dir: [0, 0, -1],
    }),
  );
  b.part(new THREE.TorusGeometry(0.042, 0.007, 6, 14), INK, {
    bone: spine2,
    at: [0, 1.3, -0.206],
    dir: [0, 0, -1],
    axis: "z",
  });
  for (let k = 0; k < 3; k++) box(0.16, 0.01, 0.012, 0.003, [0, 1.2 + k * 0.025, -0.205], spine2, INK);
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.09, 1.14, -0.2],
        [s * 0.13, 1.08, -0.14],
        [s * 0.15, 1.0, -0.05],
      ]),
      0.008,
      { bone: spine2, color: INK },
    );

  // Neck and head.
  b.sweep(neck, [0.058, 0.05], { color: SUIT });

  box(0.2, 0.23, 0.21, 0.04, [0, 1.745, 0.02], head, ARMOUR);
  box(0.17, 0.022, 0.03, 0.008, [0, 1.78, 0.13], head, CHAR);
  box(0.03, 0.022, 0.18, 0.008, [0, 1.857, 0], head, CHAR);
  for (const s of [1, -1]) box(0.012, 0.09, 0.05, 0.004, [s * 0.1, 1.75, -0.04], head, INK);
  b.extrude(
    [
      [-0.14, -0.06],
      [0, -0.02],
      [0.02, 0.04],
      [-0.02, 0.12, "sharp"],
      [-0.1, 0.1],
      [-0.16, 0],
    ],
    {
      at: [0, 1.74, -0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 0,
      color: CHAR,
      bone: head,
    },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.035), "#ffffff", {
      bone: head,
      at: [0, 1.765, 0.13],
      dir: [0, 0, 1],
      axis: "z",
      texture: visor,
    }),
  );
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.024, 10), SHELL, {
      bone: head,
      at: [s * 0.105, 1.7, 0],
      dir: [s, 0, 0],
    });
    glow(b.part(new THREE.SphereGeometry(0.007, 8, 6), TEAL, { bone: head, at: [s * 0.119, 1.7, 0] }));
    glow(b.part(new THREE.SphereGeometry(0.01, 8, 6), TEAL, { bone: head, at: [s * 0.099, 1.72, 0.06] }));
  }

  box(0.13, 0.085, 0.1, 0.03, [0, 1.665, 0.085], jaw, SKIN);
  box(0.12, 0.05, 0.03, 0.014, [0, 1.672, 0.145], jaw, INK);
  for (const dy of [-0.012, 0, 0.012]) box(0.08, 0.005, 0.01, 0.002, [0, 1.672 + dy, 0.163], jaw, SHELL);

  // ---- arms ---------------------------------------------------------------------------------------------------
  b.sweep(armL, [0.058, 0.05, 0.04], {
    bands: [
      [0.42, ARMOUR],
      [0.5, INK],
      [1, ARMOUR],
    ],
    sectors: [[-8, 8, TEAL, 0.56, 0.96]],
  });
  b.part(new THREE.TorusGeometry(0.04, 0.008, 6, 14), INK, {
    bone: handL,
    at: [0.31, 0.93, 0.095],
    dir: [0.15, -0.9, 0.2],
    axis: "z",
  });
  box(0.08, 0.09, 0.035, 0.012, [0.31, 0.845, 0.12], handL, ARMOUR);
  digit("thumbL", [[0.335, 0.865, 0.11], [0.35, 0.82, 0.135], [0.34, 0.78, 0.15]], handL, INK, [0.011, 0.009]);
  [-0.027, -0.009, 0.009, 0.027].forEach((dx, i) => {
    const name = ["index", "middle", "ring", "pinky"][i] + "L";
    digit(
      name,
      [
        [0.31 + dx, 0.8, 0.125],
        [0.31 + dx * 1.05, 0.755, 0.148],
        [0.31 + dx, 0.715, 0.16],
      ],
      handL,
      INK,
      [0.0105, 0.0085],
    );
  });

  b.sweep(armR, [0.06, 0.05, 0.042], {
    bands: [
      [0.5, SUIT],
      [0.56, INK],
      [0.9, SUIT],
      [1, ARMOUR],
    ],
  });
  box(0.085, 0.095, 0.075, 0.025, [-0.35, 0.985, 0.1], handR, SKIN);
  digit("thumbR", [[-0.318, 1.03, 0.1], [-0.345, 1.05, 0.122], [-0.375, 1.035, 0.112]], handR, SKIN, [0.011, 0.009]);
  [1.012, 0.994, 0.976, 0.958].forEach((y, i) => {
    const name = ["index", "middle", "ring", "pinky"][i] + "R";
    digit(
      name,
      [
        [-0.318, y, 0.115],
        [-0.35, y - 0.003, 0.13],
        [-0.382, y, 0.115],
      ],
      handR,
      SKIN,
      [0.0105, 0.0095],
    );
  });

  // ---- healing staff, rigid in the right hand -----------------------------------------------------------------
  const B: Vec = [-0.4, 0.01, 0.16];
  const T: Vec = [-0.3, 1.95, 0.02];
  b.sweep([B, T], [0.021, 0.016], {
    bone: handR,
    caps: "flat",
    bands: [
      [0.035, INK],
      [0.1, WHITE],
      [0.11, INK],
      [0.12, WHITE],
      [0.44, WHITE],
      [0.46, INK],
      [0.54, CHAR],
      [0.56, INK],
      [0.9, WHITE],
      [0.915, TEAL],
      [1, WHITE],
    ],
  });
  glow(
    b.lathe(
      [
        [0, 0],
        [0.03, 0.02],
        [0.05, 0.07],
        [0.036, 0.13],
        [0, 0.17],
      ],
      { at: T, axis: [0, 1, 0], segments: 8, color: TEAL, bone: handR },
    ),
  );
  b.part(new THREE.TorusGeometry(0.036, 0.007, 6, 12), INK, {
    bone: handR,
    at: [T[0], T[1] + 0.012, T[2]],
    dir: [0, 1, 0],
    axis: "z",
  });
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + Math.PI / 6;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const at = (dr: number, dy: number): Vec => [T[0] + c * dr, T[1] + dy, T[2] + sn * dr];
    b.sweep(bezier(T, [T[0], T[1] + 0.05, T[2]], at(0.075, 0.12), at(0.03, 0.19)), [0.011, 0.006], {
      bone: handR,
      color: WHITE,
    });
  }

  return b.root;
}
