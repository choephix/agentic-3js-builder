import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { countershade, gradient, grain, mottle } from "../src/paint";
import type { Fill } from "../src/context";
import { bezier, catmull } from "../src/path";
import { gaugeTexture, gearTrain, metal, panelled } from "../kits/clockwork";
import { svg } from "../src/texture";

// Dieselpunk War Elephant: a 3.5 m shoulder-height armoured war elephant.
// Riveted olive-drab plating over the barrel body, armoured trunk rings,
// steel-capped tusks, plate-flapped ears, a howdah with a swivel turret,
// smokestacks, gauges, gears and ammunition crates strapped to the flanks.

const OLIVE = mottle("#62663a", "#484b28", { size: 0.22, seed: 11 });
const HULL = panelled(countershade(OLIVE, "#33341f", { level: -0.2 }), { size: 0.3, aspect: 0.62 });
const IRON = metal("iron", { tarnish: 0.55, size: 0.09 });
const STEEL = metal("steel", { tarnish: 0.25 });
const BRASS = metal("brass", { tarnish: 0.45 });
const LEATHER = mottle("#5c3f24", "#402a15", { size: 0.07, seed: 5 });
const CANVAS = mottle("#9c9170", "#7e7458", { size: 0.09, seed: 8 });
const WOOD = grain("#7a5730", "#4c3319", { size: 0.025, axis: "y", seed: 3 });
const IVORY = mottle("#ded3b6", "#bfb191", { size: 0.05, seed: 21 });
const SOOT = mottle("#23211c", "#0d0c0a", { size: 0.06, seed: 9 });
const EYE_RED = "#8a1f14";
const DARK = "#141210";

/** Smooth width/height profile through [t, rx, ry] keys with cosine interpolation. */
function prof(keys: Array<[number, number, number]>) {
  return (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, a0, b0] = keys[i - 1];
        const [t1, a1, b1] = keys[i];
        const k = (t - t0) / (t1 - t0);
        const s = 0.5 - 0.5 * Math.cos(k * Math.PI);
        return [a0 + (a1 - a0) * s, b0 + (b1 - b0) * s];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };
}

const insignia = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="#ddd6bd" stroke-width="6"/>` +
    `<path d="M32 12 L38.5 26 L53 26.5 L41.5 35.5 L45.5 50 L32 41.5 L18.5 50 L22.5 35.5 L11 26.5 L25.5 26 Z" fill="#ddd6bd"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "dieselpunkWarElephant" });

  // ---- Skeleton: pelvis root, spine chain, head, jaw, trunk, ears, legs, tail, turret ----
  const pelvis = b.joint("pelvis", { at: [0, 2.5, -0.9], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.5, -0.9],
      [0, 2.55, -0.2],
      [0, 2.6, 0.5],
      [0, 2.65, 1.0],
    ]),
    { parent: pelvis, count: 3, role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  const chest = spine.joints[2];
  const head = b.joint("head", { parent: chest, at: [0, 2.72, 1.42], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.42, 0.95], dir: [0, -0.25, 1], role: "jaw" });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.5, 1.8],
      [0, 1.95, 1.98],
      [0, 1.4, 1.94],
      [0, 0.98, 2.08],
    ]),
    {
      parent: head,
      count: 5,
      role: "tentacle",
      names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
    },
  );

  const ears = [];
  for (const s of [1, -1]) {
    ears.push(
      b.joint(s > 0 ? "earL" : "earR", {
        parent: head,
        at: [s * 0.6, 2.82, 1.1],
        dir: [s, 0.15, -0.25],
        role: "hinge",
      }),
    );
  }

  // Legs: two-bone IK planted on the floor, elephant feet ~0.3 m radius.
  const legDefs = [
    { key: "FL", root: [0.62, 2.0, 0.75] as const, foot: [0.72, 0.3, 0.85] as const, bend: [0, 0, 1] as const },
    { key: "FR", root: [-0.62, 2.0, 0.75] as const, foot: [-0.72, 0.3, 0.85] as const, bend: [0, 0, 1] as const },
    { key: "HL", root: [0.68, 2.05, -0.95] as const, foot: [0.78, 0.3, -1.05] as const, bend: [0, 0, 1] as const },
    { key: "HR", root: [-0.68, 2.05, -0.95] as const, foot: [-0.78, 0.3, -1.05] as const, bend: [0, 0, 1] as const },
  ];
  const legs = legDefs.map((d) => {
    const front = d.key[0] === "F";
    const pts = limb(
      [d.root[0], d.root[1], d.root[2]],
      [d.foot[0], d.foot[1], d.foot[2]],
      front ? [0.9, 0.85] : [0.95, 0.9],
      [d.bend[0], d.bend[1], d.bend[2]],
    );
    if (pts[pts.length - 1].distanceTo(new THREE.Vector3(d.foot[0], d.foot[1], d.foot[2])) > 1e-3)
      throw new Error(`leg ${d.key} too short for its foot`);
    return b.chain(`leg${d.key}`, pts, {
      parent: front ? chest : pelvis,
      names: [`hip${d.key}`, `knee${d.key}`, `foot${d.key}`],
      role: "leg",
      contact: [d.foot[0], 0, d.foot[2]],
    });
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -1.45],
      [0, 2.1, -1.65],
      [0, 1.6, -1.7],
      [0, 1.25, -1.6],
    ]),
    { parent: pelvis, count: 3, role: "tail", names: ["tail1", "tail2", "tailTip"] },
  );

  const turret = b.joint("turret", { parent: chest, at: [0, 3.72, 0.08], dir: [0, 1, 0], role: "hinge" });
  const cannon = b.joint("cannon", { parent: turret, at: [0, 4.0, 0.28], dir: [0, 0.06, 1], role: "hinge" });

  // ---- Barrel body: riveted olive plating, belly hung below the spine line ----
  const bodySweep = b.sweep(
    catmull([
      [0, 2.55, -1.45],
      [0, 2.5, -0.5],
      [0, 2.55, 0.3],
      [0, 2.62, 1.1],
    ]),
    prof([
      [0, 0.62, 0.7],
      [0.35, 0.88, 0.98],
      [0.7, 0.92, 1.0],
      [1, 0.68, 0.75],
    ]),
    {
      bone: [pelvis, spine],
      color: HULL,
      shift: () => [0, -0.12] as [number, number],
      caps: { start: "round", end: "flat" },
    },
  );

  // ---- Head: armoured skull, brow plates, eyes, rivet row ----
  b.part(new THREE.SphereGeometry(0.55, b.segments(20), b.segments(14)), HULL, {
    bone: head,
    at: [0, 2.72, 1.42],
    scale: [0.94, 1.0, 0.98],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.07, b.segments(10), b.segments(8)), EYE_RED, {
      bone: head,
      at: [s * 0.44, 2.95, 1.68],
    });
    b.part(new THREE.TorusGeometry(0.078, 0.018, 6, 12), BRASS, { bone: head, at: [s * 0.44, 2.95, 1.68] });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.14), IRON, { bone: head, at: [s * 0.44, 3.06, 1.64] });
    b.part(new THREE.BoxGeometry(0.06, 0.32, 0.44), HULL, { bone: head, at: [s * 0.56, 2.62, 1.42] });
  }
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.18, 0.3],
      [0, 0.38],
      [-0.18, 0.3],
    ],
    { at: [0, 2.82, 1.95], x: [1, 0, 0], thickness: 0.06, smoothing: 1, color: IRON, bone: head },
  );
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.1;
    const z = 1.42 + Math.sqrt(Math.max(0.01, 0.55 * 0.55 - x * x - 0.33 * 0.33)) + 0.005;
    rivets.push(new THREE.SphereGeometry(0.022, 6, 5).translate(x, 3.05, z));
  }
  b.part(mergeGeometries(rivets)!, BRASS, { bone: head, at: [0, 0, 0] });

  // ---- Jaw: separate lower jaw with chin plate ----
  b.frustumBox([0, 2.36, 1.0], [0, 2.14, 1.62], [0.34, 0.22], [0.28, 0.15], { bone: jaw, color: HULL });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.3), IRON, { bone: jaw, at: [0, 2.1, 1.5] });

  // ---- Trunk: armoured rings down the chain, dark nostrils at the tip ----
  const trunkBands: Array<[number, Fill]> = [
    [0.1, HULL],
    [0.15, IRON],
    [0.28, HULL],
    [0.33, IRON],
    [0.46, HULL],
    [0.51, IRON],
    [0.63, HULL],
    [0.68, IRON],
    [0.8, HULL],
    [0.85, IRON],
    [1, HULL],
  ];
  b.sweep(trunk, (t) => 0.3 * (1 - t) + 0.1, {
    color: HULL,
    bands: trunkBands,
    caps: { start: "flat", end: "round" },
  });
  const studs: THREE.BufferGeometry[] = [];
  for (const t of [0.15, 0.33, 0.51, 0.68, 0.85]) {
    const c = trunk.at(t);
    const r = 0.3 * (1 - t) + 0.1;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const px = c.at.x + Math.cos(a) * r;
      const py = c.at.y + Math.sin(a) * r * 0.9;
      studs.push(new THREE.SphereGeometry(0.02, 6, 5).translate(px, c.at.y + (py - c.at.y), c.at.z));
    }
  }
  b.part(mergeGeometries(studs)!, BRASS, { bone: trunk.joints[2], at: [0, 0, 0] });
  const trunkTip = trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.04, 8), DARK, {
      bone: trunkTip,
      at: [s * 0.05, 0.98, 2.14],
      dir: [s * 0.2, -0.3, 1],
    });
  }

  // ---- Tusks: ivory sweeping up from the mouth corners, capped with steel ----
  for (const s of [1, -1]) {
    b.rod([s * 0.26, 2.28, 1.66], [s * 0.28, 2.28, 1.78], 0.1, { bone: head, color: IVORY });
    b.sweep(
      bezier([s * 0.28, 2.26, 1.76], [s * 0.52, 1.98, 1.98], [s * 0.6, 2.02, 2.25], [s * 0.5, 2.45, 2.42]),
      [0.12, 0.015],
      {
        bone: head,
        color: IVORY,
        bands: [
          [0.72, IVORY],
          [1, STEEL],
        ],
        caps: { start: "flat", end: "point" },
      },
    );
  }

  // ---- Ears: leather fans with steel plate flaps, one hinge each ----
  const earOutline = [
    [-0.4, -0.15],
    [0.4, -0.25],
    [0.68, 0.3],
    [0.38, 0.8],
    [-0.25, 0.72],
    [-0.55, 0.2],
  ];
  const flapOutline = [
    [-0.24, 0.02],
    [0.3, -0.08],
    [0.44, 0.26],
    [0.18, 0.54],
    [-0.18, 0.48],
  ];
  for (const s of [1, -1]) {
    const ear = s > 0 ? ears[0] : ears[1];
    b.extrude(earOutline, {
      at: [s * 0.62, 2.6, 1.02],
      thickness: 0.06,
      smoothing: 1,
      color: LEATHER,
      bone: ear,
    });
    b.extrude(flapOutline, {
      at: [s * 0.7, 2.58, 1.02],
      thickness: 0.025,
      smoothing: 1,
      color: IRON,
      bone: ear,
    });
  }

  // ---- Legs: plated columns with iron knee rings, soot toward the feet ----
  legDefs.forEach((d, i) => {
    const legGrad = gradient(HULL, SOOT, [d.foot[0], 1.7, d.foot[2]], [d.foot[0], 0.3, d.foot[2]]);
    b.sweep(legs[i], [0.3, 0.22], {
      color: legGrad,
      bands: [
        [0.45, legGrad],
        [0.55, IRON],
        [0.65, legGrad],
      ],
    });
    b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.35, b.segments(14)), IRON, {
      bone: legs[i].joints[2],
      at: [d.foot[0], 0.175, d.foot[2]],
    });
    const nails: THREE.BufferGeometry[] = [];
    for (const a of [-0.5, 0, 0.5]) {
      const g = new THREE.ConeGeometry(0.06, 0.14, 8);
      g.rotateX(Math.PI / 2 + 0.25);
      g.rotateY(a);
      g.translate(d.foot[0] + Math.sin(a) * 0.2, 0.12, d.foot[2] + 0.28 + Math.cos(a) * 0.02);
      nails.push(g);
    }
    b.part(mergeGeometries(nails)!, BRASS, { bone: legs[i].joints[2], at: [0, 0, 0] });
  });

  // ---- Shoulder plates with insignia decals ----
  const skirts = [];
  for (const s of [1, -1]) {
    skirts.push(
      b.extrude(
        [
          [-0.35, -0.25],
          [0.35, -0.25],
          [0.35, 0.25],
          [-0.35, 0.25],
        ],
        { at: [s * 0.95, 2.6, 0.75], thickness: 0.05, smoothing: 0, color: HULL, bone: chest },
      ),
    );
    b.decal(skirts[skirts.length - 1], insignia, {
      at: [s * 0.985, 2.6, 0.75],
      dir: [-s, 0, 0],
      size: [0.34, 0.34],
    });
  }

  // ---- Girth straps round the barrel ----
  const skin = b.surface(bodySweep);
  for (const z of [0.55, -0.75]) {
    b.sweep(skin.loop(frame([0, 2.55, z], [0, 0, 1]), { lift: 0.02 }), 0.035, { color: LEATHER });
  }

  // ---- Ammunition crates strapped to the flanks ----
  for (const s of [1, -1]) {
    const crate = b.part(new THREE.BoxGeometry(0.5, 0.42, 0.65), WOOD, {
      bone: spine.joints[1],
      at: [s * 1.0, 2.25, -0.35],
    });
    b.part(new THREE.BoxGeometry(0.54, 0.1, 0.69), IRON, { bone: spine.joints[1], at: [s * 1.0, 2.42, -0.35] });
    b.sweep(b.surface(crate).loop(crate, { lift: 0.015 }), 0.02, { color: LEATHER });
  }

  // ---- Howdah: platform, rails, canvas panels, gauges, gears, smokestacks ----
  b.part(new THREE.BoxGeometry(1.3, 0.3, 1.35), LEATHER, { bone: chest, at: [0, 3.42, -0.25] });
  b.part(new THREE.BoxGeometry(1.5, 0.1, 1.5), WOOD, { bone: chest, at: [0, 3.62, -0.25] });
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      b.rod([sx * 0.7, 3.63, -0.25 + sz * 0.7], [sx * 0.7, 4.25, -0.25 + sz * 0.7], 0.025, {
        color: IRON,
        bone: chest,
      });
    }
    b.rod([sx * 0.7, 4.25, -0.95], [sx * 0.7, 4.25, 0.45], 0.02, { color: BRASS, bone: chest });
    b.part(new THREE.BoxGeometry(0.05, 0.45, 1.4), CANVAS, { bone: chest, at: [sx * 0.72, 3.9, -0.25] });
  }
  b.rod([-0.7, 4.25, 0.45], [0.7, 4.25, 0.45], 0.02, { color: BRASS, bone: chest });
  b.rod([-0.7, 4.25, -0.95], [0.7, 4.25, -0.95], 0.02, { color: BRASS, bone: chest });

  // Gauge board on the howdah front with two brass-rimmed pressure gauges.
  b.part(new THREE.BoxGeometry(0.9, 0.28, 0.05), WOOD, { bone: chest, at: [0, 3.95, 0.48] });
  const needles = [-35, 55];
  needles.forEach((needle, i) => {
    const x = i === 0 ? -0.22 : 0.22;
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 16), BRASS, {
      bone: chest,
      at: [x, 3.95, 0.5],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CircleGeometry(0.088, 20), "#ffffff", {
      bone: chest,
      at: [x, 3.95, 0.517],
      dir: [0, 0, 1],
      axis: "z",
      texture: gaugeTexture({ needle, label: "PSI" }),
    });
  });

  // Meshing gear pair on the left howdah panel.
  gearTrain(b, {
    at: [0.78, 3.85, -0.3],
    axis: [1, 0, 0],
    module: 0.022,
    style: "flat",
    bone: chest,
    gears: [
      { teeth: 18, spokes: 4 },
      { teeth: 12, angle: 90 },
    ],
  });

  // Smokestacks with brass rims at the rear of the howdah.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.085, 0.1, 0.8, 12), IRON, {
      bone: chest,
      at: [s * 0.4, 4.0, -0.8],
    });
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.07, 12), BRASS, {
      bone: chest,
      at: [s * 0.4, 4.42, -0.8],
    });
    b.part(new THREE.CircleGeometry(0.08, 12), DARK, {
      bone: chest,
      at: [s * 0.4, 4.46, -0.8],
      dir: [0, 1, 0],
      axis: "z",
      rotation: [90, 0, 0],
    });
  }

  // Deck crates behind the turret.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.4, 0.3, 0.4), WOOD, { bone: chest, at: [s * 0.45, 3.78, -0.62] });
  }

  // ---- Turret: lathe dome, hatch, stubby cannon with brass muzzle ----
  b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.46, 0.08],
      [0.32, 0.34],
      [0.16, 0.46],
      [0, 0.48],
    ],
    { at: [0, 3.67, 0.08], bone: turret, smoothing: 1, color: HULL },
  );
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10), IRON, { bone: turret, at: [0, 4.16, 0.03] });
  b.frustumBox([0, 3.97, 0.28], [0, 4.03, 0.5], [0.3, 0.28], [0.24, 0.22], { bone: cannon, color: IRON });
  b.part(new THREE.CylinderGeometry(0.095, 0.115, 0.95, 12), STEEL, {
    bone: cannon,
    at: [0, 4.06, 0.92],
    dir: [0, 0.06, 1],
  });
  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.14, 12), BRASS, {
    bone: cannon,
    at: [0, 4.094, 1.32],
    dir: [0, 0.06, 1],
  });
  b.part(new THREE.SphereGeometry(0.15, b.segments(12), b.segments(8)), IRON, {
    bone: cannon,
    at: [0, 4.0, 0.32],
  });

  // ---- Tail with a dark tuft ----
  b.sweep(tail, [0.085, 0.035], { color: HULL });
  b.spike(tail.at(1), [0, -1, -0.15], 0.3, 0.04, { color: SOOT });

  return b.root;
}

export const meta = {
  name: "Dieselpunk War Elephant",
  description:
    "A 1920s-dieselpunk armoured war elephant: riveted olive plating, trunk armour, steel-capped tusks, howdah turret, stacks and flank crates.",
};
