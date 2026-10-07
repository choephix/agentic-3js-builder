// Elven ranger archer: a slender elf about 1.87 m tall in a high-fantasy anime style. Cel-shaded with the toon kit,
// gold filigree trims, a teal cloak with leaf cards on its hem, a runed longbow held out in the left hand and drawn
// to the anchor by the right, and glowing emerald and rune accents from the glow kit.
// Skeleton: hips root, spine, neck, head with a jaw, a hair tail, two arms (shoulder, elbow, wrist, hand tip) solved
// by IK onto the bow grip and the drawing fist, and two legs solved onto the ankles.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset } from "../src/math";
import type { V3 } from "../src/math";
import { catmull, polyline } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A slender elf ranger about 1.87 m tall: teal cloak with leaf-card hem, gold filigree trims, a runed longbow " +
    "drawn to the anchor with a magic arrowhead, and an emerald brow gem. Cel-shaded, anime eyes.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// Palette: one cel per surface colour (lit tone, hue-shifted shadow tone).
const SKIN = cel("#ffe2cf", "#f2b0a4");
const HAIR = cel("#f4f1ff", "#a2aee6");
const HAIR_TIP = cel("#cdd6f5", "#7f8fd0");
const TUNIC = cel("#34b68c", "#1d7371");
const CREAM = cel("#fff4df", "#e3c39c");
const LEATHER = cel("#b97844", "#7b4130");
const LEATHER_DARK = cel("#7c4b2d", "#4b2a1f");
const TROUSER = cel("#2f5f72", "#1d3b57");
const BOOT = cel("#6f4730", "#3d2318");
const GOLD = cel("#ffd86e", "#e39a3e");
// Trousers with a gold piping seam down the outside of each leg (s[1] is the dorsal angle, 90 = the outer side).
const TROUSER_PIPED = paint((_p, _n, s) => (Math.abs(s[1] - 90) < 4 ? GOLD : TROUSER));
// Cloak: a two-tone chevron weave across the membrane (s = [along, across], 0..1 from the shoulder edge).
const CAPE_A = cel("#2e8fab", "#1f6485");
const CAPE_B = cel("#247c98", "#17526d");
const CAPE = paint((_p, _n, s) => (Math.floor(s[1] * 6 + Math.abs(s[0] - 0.5) * 3) % 2 === 0 ? CAPE_A : CAPE_B));
const WOOD = cel("#d6955a", "#8b4f2c");
const STRING = cel("#fff8e8", "#cdbf9c");
const SHAFT = cel("#f8ecd2", "#cfb68c");
const FLETCH = cel("#ff7d5e", "#c24b37");
// The tunic / trouser seam is a zig-zag hem at y = 0.99 m.
const TORSO = furEdge(TUNIC, TROUSER, { by: "position", level: 0.99, teeth: 0.022, period: 0.03, along: [1, 0, 0], ink: INK, inkWidth: 0.004 });
// Self-lit accents (glow kit): flat colours so they show at full brightness.
const EMERALD = "#6dffd8";
const RUNE = "#9af8ff";
const EYE = animeEye({ iris: "#2fc9b4", blush: "#ff9fb4" });
const LEAF = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 2 C29 16 30 46 16 62 C2 46 3 16 16 2 Z" fill="#8ff5c4"/><path d="M16 8 L16 56" stroke="#2a8c74" stroke-width="2" fill="none"/></svg>',
  { size: 128 },
);

const HEAD_C: V3 = [0, 1.74, -0.005];
const HAIR_C = [0, 1.745, -0.01] as const;
const NOCK: readonly [number, number, number] = [-0.04, 1.66, 0.17];
const GRIP: readonly [number, number, number] = [0, 1.2, 0.38];

// The last joint of a chain: its hand, foot or tip.
function tipJoint<T>(c: { joints: readonly T[] }): T {
  return c.joints[c.joints.length - 1];
}

// A point on the hair cap, theta from the crown (0) down, phi from the front (+Z) toward the creature's left (+X).
function capPoint(theta: number, phi: number): number[] {
  const k = 1.03;
  return [
    0.112 * k * Math.sin(theta) * Math.sin(phi),
    HAIR_C[1] + 0.124 * k * Math.cos(theta),
    HAIR_C[2] + 0.116 * k * Math.sin(theta) * Math.cos(phi),
  ];
}

// A row across the cloak at fraction f from its shoulder edge (0) to its hem (1), a little off the surface.
function capeRow(f: number): number[][] {
  const top: number[][] = [[-0.2, 1.46, -0.05], [-0.1, 1.42, -0.115], [0, 1.4, -0.13], [0.1, 1.42, -0.115], [0.2, 1.46, -0.05]];
  const hem: number[][] = [[-0.24, 0.42, -0.16], [-0.12, 0.24, -0.2], [0, 0.2, -0.22], [0.12, 0.24, -0.2], [0.24, 0.42, -0.16]];
  return top.map((p, i) => [0, 1, 2].map((k) => p[k] * (1 - f) + hem[i][k] * f));
}

export default function build() {
  const b = createBuilder({ name: "elvenArcher" });

  // Skeleton ------------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.95, 0], [0, 1.12, 0.005], [0, 1.3, 0.01], [0, 1.46, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.42, 0], [0, 1.53, 0.005], [0, 1.62, 0.02]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.62, 0.02], dir: [0, 1, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, -0.01], dir: [0, -0.3, 1], role: "jaw" });
  const hairTail = b.chain(
    "hairTail",
    catmull([[0, 1.8, -0.02], [0, 1.68, -0.1], [0, 1.5, -0.13], [0, 1.3, -0.14], [0, 1.12, -0.13]]),
    { parent: head, names: ["hairA", "hairB", "hairC", "hairD"], role: "tail" },
  );

  // Arms: s = 1 is the creature's left (+X). The left hand holds the bow grip, the right fist draws the string.
  const arms = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const shoulder: V3 = [s * 0.19, 1.44, 0];
    const hand: V3 = s > 0 ? [GRIP[0], GRIP[1], GRIP[2] - 0.03] : [NOCK[0] - 0.01, NOCK[1] - 0.02, NOCK[2] - 0.04];
    const elbowBend: V3 = s > 0 ? [0.7, -0.6, 0.1] : [-0.7, -0.6, -0.2];
    const wristBend: V3 = s > 0 ? [0, 0.3, 1] : [0, 0.2, -1];
    const pts = limb(shoulder, hand, [0.29, 0.27, 0.12], [elbowBend, wristBend]);
    const chain = b.chain(`arm${side}`, pts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    return { s, side, chain, hand };
  });

  // Legs: ankles at x = ±0.11, planted on the floor.
  const legs = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.11;
    const pts = limb([x, 0.92, 0], [x, 0.1, 0], [0.45, 0.42], [[0, 0, 1]]);
    const chain = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, 0, 0.03],
    });
    return { s, side, x, chain };
  });

  // Torso: tunic loft from the hips to the neck, a zig-zag hem to the trousers at the waist-level seam.
  b.loft(
    [
      { at: [0, 0.9, 0], w: 0.26, h: 0.16 },
      { at: [0, 1.02, 0.005], w: 0.23, h: 0.15 },
      { at: [0, 1.14, 0.008], w: 0.245, h: 0.16 },
      { at: [0, 1.28, 0.01], w: 0.3, h: 0.18 },
      { at: [0, 1.4, 0.005], w: 0.33, h: 0.19 },
      { at: [0, 1.48, 0], w: 0.16, h: 0.13 },
    ],
    { bone: [hips, spine], color: TORSO, name: "torso" },
  );

  // Cream shirt front in the V between the vest lapels.
  b.extrude(
    [[-0.045, 0.23], [0.045, 0.23], [0.0, 0.0, "sharp"]],
    { at: [0, 1.2, 0.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CREAM, bone: spine.joints[1] },
  );
  // Leather vest: two lapel panels over the chest, edged in gold, a gem clasp between them.
  for (const s of [1, -1]) {
    b.extrude(
      [[0.012, 0.0], [0.12, -0.02], [0.13, 0.16], [0.085, 0.24, "sharp"], [0.015, 0.2]],
      { at: [0, 1.2, 0.1], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, color: LEATHER, bone: spine.joints[1] },
    );
    b.sweep(
      catmull([[s * 0.12, 1.2, 0.108], [s * 0.13, 1.36, 0.106], [s * 0.085, 1.44, 0.104]]),
      0.0045,
      { color: GOLD, bone: spine.joints[1] },
    );
  }
  glow(b.part(new THREE.OctahedronGeometry(0.018), EMERALD, { bone: spine.joints[1], at: [0, 1.31, 0.114], scale: [1, 1.2, 0.6] }), 1.4);
  b.sweep(
    catmull(Array.from({ length: 10 }, (_, k) => {
      const a = (k / 10) * Math.PI * 2;
      return [0.024 * Math.cos(a), 1.31 + 0.024 * Math.sin(a), 0.112];
    }), { closed: true }),
    0.0048,
    { color: GOLD, bone: spine.joints[1] },
  );

  // Belt with gold buckle and a pouch on the left hip.
  const beltRing = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return [0.125 * Math.sin(a), 1.04, 0.088 * Math.cos(a)];
  });
  b.sweep(catmull(beltRing, { closed: true }), 0.011, { color: LEATHER_DARK, bone: spine.joints[0] });
  b.part(new THREE.BoxGeometry(0.04, 0.034, 0.012), GOLD, { bone: spine.joints[0], at: [0, 1.04, 0.1] });
  b.part(new THREE.BoxGeometry(0.024, 0.018, 0.006), LEATHER_DARK, { bone: spine.joints[0], at: [0, 1.04, 0.107] });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.04), LEATHER_DARK, { bone: spine.joints[0], at: [0.13, 0.99, 0.04] });
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.042), GOLD, { bone: spine.joints[0], at: [0.13, 1.02, 0.04] });

  // Quiver on the right hip, its arrows standing out of the top, and a strap across the chest.
  b.sweep(
    catmull([[-0.15, 1.2, 0.0], [-0.14, 1.42, -0.05], [-0.12, 1.6, -0.08]]),
    [0.05, 0.047],
    { color: LEATHER_DARK, caps: { start: "round", end: "flat" }, bone: spine.joints[2] },
  );
  const quiverArrows: [number, number, number][] = [
    [-0.02, 0.012, 1.84],
    [0.012, -0.01, 1.86],
    [0.02, 0.016, 1.82],
    [-0.008, -0.02, 1.85],
  ];
  for (const [dx, dz, top] of quiverArrows) {
    const base: V3 = [-0.12 + dx, 1.42, -0.08 + dz];
    const tip: V3 = [-0.12 + dx * 1.2, top, -0.08 + dz * 1.2];
    b.rod(base, tip, 0.0055, { color: SHAFT, bone: spine.joints[2] });
    b.rod(offset(tip, [0, -1, 0], 0.07), tip, 0.0062, { color: FLETCH, bone: spine.joints[2] });
  }
  b.sweep(
    catmull([[-0.16, 1.52, -0.05], [-0.1, 1.36, 0.07], [0, 1.22, 0.1], [0.1, 1.08, 0.1], [0.13, 1.0, 0.07]]),
    0.0105,
    { color: LEATHER_DARK, bone: spine.joints[1] },
  );

  // Neck, head, hair ---------------------------------------------------------------------------------------------
  b.sweep(neck, [0.05, 0.04], { color: SKIN });
  const headPart = b.part(new THREE.SphereGeometry(1, 20, 14), SKIN, {
    bone: head,
    at: HEAD_C,
    scale: [0.098, 0.12, 0.104],
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, { bone: jaw, at: [0, 1.648, 0.045], scale: [0.042, 0.03, 0.04] });
  // Hair cap over the crown, a hair tail down the back with an emerald ribbon, and side locks framing the face.
  b.part(new THREE.SphereGeometry(1, 22, 14, 0, Math.PI * 2, 0, 1.55), HAIR, {
    bone: head,
    at: [...HAIR_C],
    scale: [0.112, 0.124, 0.116],
  });
  b.sweep(hairTail, (t) => 0.072 - 0.02 * t, { sides: 10, bands: [[0.55, HAIR], [1, HAIR_TIP]] });
  b.sweep(hairTail, (t) => 0.066 - 0.02 * t, { from: 0.8, to: 0.9, sides: 10, color: TUNIC });
  for (const s of [1, -1]) {
    // Side-swept fringe: three strands per side, sweeping from the crown down over the temple.
    for (let j = 0; j < 3; j++) {
      const theta0 = 0.28 + 0.12 * j;
      const pts = Array.from({ length: 5 }, (_, k) => {
        const t = k / 4;
        return capPoint(theta0 + (1.3 - theta0) * t, s * ((0.1 + 0.2 * j) * (1 - t) + (0.85 + 0.05 * j) * t));
      });
      b.sweep(catmull(pts), [0.015, 0.009], { sides: 6, bands: [[0.7, HAIR], [1, HAIR_TIP]], bone: head });
    }
    b.sweep(
      catmull([[s * 0.112, 1.76, 0.0], [s * 0.124, 1.66, 0.02], [s * 0.13, 1.48, 0.04], [s * 0.125, 1.3, 0.05]]),
      [0.022, 0.014],
      { color: HAIR, bone: [head, neck, spine] },
    );
    // Pointed ear, flat in the YZ plane, sweeping back and up from the head.
    b.extrude(
      [[0.03, 0.02], [0.0, 0.06], [-0.05, 0.11, "sharp"], [-0.07, 0.03], [-0.04, -0.02]],
      { at: [s * 0.122, 1.725, -0.01], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: SKIN, bone: head },
    );
  }
  // Emerald brow gem on the forehead, set just above the fringe.
  glow(b.part(new THREE.OctahedronGeometry(0.011), EMERALD, { bone: head, at: capPoint(0.9, 0), scale: [1, 1.2, 0.6] }), 1.5);

  // Anime eyes: decals on the head sphere, mirrored for the other side.
  const skin = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 22, -20);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.042, 0.056], mirror: s > 0 });
  }

  // Arms, pauldrons and hands -------------------------------------------------------------------------------------
  for (const { s, chain, hand } of arms) {
    b.sweep(chain, [0.05, 0.04, 0.03, 0.028], {
      bands: [[0.4, TUNIC], [0.8, LEATHER], [0.83, GOLD], [1, SKIN]],
      sides: 8,
    });
    b.along(chain, 3, (at) => b.part(new THREE.SphereGeometry(0.006, 6, 4), GOLD, { at: offset(at, [0, 0, 1], 0.035) }), {
      from: 0.5,
      to: 0.76,
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: tipJoint(chain), at: hand, scale: [0.03, 0.035, 0.03] });
    // Leather pauldron with a gold rim over each shoulder.
    b.part(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER, {
      bone: spine.joints[2],
      at: [s * 0.2, 1.44, 0],
      scale: [0.095, 0.075, 0.105],
    });
    b.sweep(
      catmull(Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2;
        return [s * 0.2 + 0.098 * Math.cos(a), 1.44, 0.106 * Math.sin(a)];
      }), { closed: true }),
      0.0055,
      { color: GOLD, bone: spine.joints[2] },
    );
  }

  // Legs, boots and cuffs -----------------------------------------------------------------------------------------
  for (const { x, chain } of legs) {
    b.sweep(chain, [0.058, 0.044, 0.036], { color: TROUSER_PIPED });
    b.sweep(
      catmull([[x, 0.22, -0.02], [x, 0.14, 0.0], [x, 0.07, 0.08], [x, 0.036, 0.19]]),
      (t) => 0.046 - 0.006 * t,
      { color: BOOT, sides: 8, bone: tipJoint(chain) },
    );
    b.sweep(
      catmull(Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return [x + 0.046 * Math.sin(a), 0.216, -0.02 + 0.044 * Math.cos(a)];
      }), { closed: true }),
      0.0065,
      { color: GOLD, bone: tipJoint(chain) },
    );
  }

  // Cloak across the shoulders and down the back: a membrane, gold filigree rows, a gold hem, leaf cards on the hem.
  const capeTop = catmull(capeRow(0));
  const capeHem = catmull(capeRow(1));
  b.membrane(capeTop, capeHem, { color: CAPE, thickness: 0.012, bone: spine, rows: 8, cols: 6 });
  for (const f of [0.35, 0.62]) {
    b.sweep(catmull(capeRow(f).map((p) => [p[0], p[1], p[2] - 0.008])), 0.0045, { color: GOLD, bone: spine });
  }
  b.sweep(catmull(capeRow(1).map((p) => [p[0], p[1], p[2] - 0.008])), 0.0075, { color: GOLD, bone: spine });
  const hemPts = capeRow(1);
  b.cards(
    hemPts.map((p) => frame(p, [0, -0.2, -1])),
    LEAF,
    { size: [0.05, 0.1], lean: 50, sink: 0.05 },
  );

  // Longbow: held in the left hand, limbs in the YZ plane, with the string drawn back to the right fist.
  const bowPath = catmull([[0, 1.84, 0.27], [0, 1.6, 0.33], [...GRIP], [0, 0.8, 0.33], [0, 0.56, 0.27]]);
  b.sweep(bowPath, (t) => 0.008 + 0.014 * Math.pow(1 - Math.abs(t - 0.5) * 2, 0.6), {
    bands: [[0.14, GOLD], [0.36, WOOD], [0.64, LEATHER_DARK], [0.86, WOOD], [1, GOLD]],
    sides: 8,
    bone: tipJoint(arms[0].chain),
  });
  b.along(bowPath, 5, (at) => glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), RUNE, { at: offset(at, [0, 0, 1], 0.016) }), 1.2), {
    from: 0.15,
    to: 0.85,
  });
  b.sweep(polyline([[0, 1.84, 0.27], NOCK, [0, 0.56, 0.27]]), 0.0035, { color: STRING, bone: tipJoint(arms[1].chain) });

  // Arrow nocked on the string, with three feathers and a glowing magic head.
  const d = new THREE.Vector3(-0.22, 0.03, 1).normalize();
  const headBase = offset(NOCK, d, 0.6);
  b.rod(NOCK, headBase, 0.0062, { color: SHAFT, bone: tipJoint(arms[1].chain) });
  glow(b.spike(headBase, offset(NOCK, d, 0.72), null, 0.011, { color: RUNE, bone: tipJoint(arms[1].chain) }), 1.6);
  const up: V3 = [0, 1, 0];
  for (const a of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
    const u = new THREE.Vector3(...up).multiplyScalar(Math.cos(a)).add(new THREE.Vector3(1, 0, 0).multiplyScalar(Math.sin(a)));
    const f0 = offset(NOCK, d, 0.03);
    const f2 = offset(NOCK, d, 0.12);
    const f1 = offset(offset(NOCK, d, 0.08), u, 0.024);
    b.slab([f0, f1, f2], { color: FLETCH, thickness: 0.002, bone: tipJoint(arms[1].chain) });
  }

  return b.root;
}
