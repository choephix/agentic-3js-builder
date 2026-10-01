// Orc Berserker · Ox — a 2.1 m green-skinned orc berserker on a humanoid skeleton: heavy brow, small glowing
// eyes, pointed ears, a hinged jaw with up-curving tusks, topknot and braids, war paint, a bare muscled torso
// with belts, bandolier and fur loincloth, studded bracers, a spiked pauldron and a planted two-handed axe.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { offset, rng, vec } from "../src/math";
import type { V3 } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { countershade, grain, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Orc Berserker · Ox",
  description:
    "A 2.1 m orc berserker: heavy brow over small glowing eyes, pointed ears, a hinged jaw with up-curving tusks, topknot with braids, red war paint, a bare muscled torso with belts, a bandolier and a fur loincloth, studded bracers, a spiked pauldron and a two-handed axe planted head-down under one fist.",
  builtBy: "Orc Berserker Ox",
};

// ----- palette -----
const IVORY = "#ece0c2";
const HAIR = "#2b241c";
const BRASS = "#c99e4e";
const STEEL = "#8d959e";
const STEEL_DARK = "#4c545e";
const STEEL_EDGE = "#d6dbe0";
const LEATHER = "#6b4a2e";
const LEATHER_DARK = "#46311f";
const MOUTH = "#38120f";
const FUR_TINT = "#7d5b38";
const WAR = "#b23a28";

// Hide: mottled green skin, lighter belly. War paint is keyed on model-space position so it runs on across
// every skin part built from this one paint.
const hide = countershade(
  mottle("#6f9c4b", "#517a36", { size: 0.13, seed: 9, contrast: 0.6 }),
  mottle("#8cb265", "#6d9450", { size: 0.13, seed: 9, contrast: 0.5 }),
  { level: -0.3, soft: 0.55 },
);

const segDist = (x: number, y: number, a: readonly number[], c: readonly number[]) => {
  const ax = c[0] - a[0];
  const ay = c[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * ax + (y - a[1]) * ay) / (ax * ax + ay * ay)));
  return Math.hypot(x - (a[0] + ax * t), y - (a[1] + ay * t));
};
// The four fingers of a great red handprint smeared across the left of the chest.
const FINGERS = [
  [[0.102, 1.555], [0.074, 1.635]],
  [[0.134, 1.558], [0.121, 1.642]],
  [[0.166, 1.555], [0.168, 1.64]],
  [[0.198, 1.548], [0.214, 1.628]],
] as const;

const skin = paint((p) => {
  const { x, y, z } = p;
  if (z > 0.1 && y > 1.36 && y < 1.68) {
    if (((x - 0.155) / 0.08) ** 2 + ((y - 1.48) / 0.098) ** 2 < 1) return WAR;
    for (const f of FINGERS) if (segDist(x, y, f[0], f[1]) < 0.0155) return WAR;
  }
  if (z > 0.12 && y > 1.985 && y < 2.062 && Math.abs(Math.abs(x) - 0.052) < 0.017) return WAR;
  if (z > 0.19 && y > 1.925 && y < 1.972) return WAR;
  if (z < -0.12 && y > 1.32 && y < 1.62 && Math.abs(Math.abs(x) - 0.06) < 0.018) return WAR;
  if (z > 0.14 && x > 0.015 && y > 1.828 && y < 1.94) {
    const d = Math.abs((x - 0.088) * 0.8 - (y - 1.884) * 0.6);
    if (d < 0.014 || Math.abs(d - 0.04) < 0.013) return WAR;
  }
  return hide;
});

const wood = grain("#7c5738", "#5c3f26", { size: 0.055, seed: 4 });
const bladeSteel = paint((_p, _n, s) => (s[0] > 0.245 ? STEEL_EDGE : s[0] < 0.05 ? STEEL_DARK : STEEL));

// Shaggy fur strands for the loincloth, drawn in greys and tinted brown on the cards.
const FUR = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">` +
    `<polygon points="1,48 7,48 6,20 4,12 2,22" fill="#cfcfcf"/>` +
    `<polygon points="6,48 12,48 11,30 9,22 7,32" fill="#b3b3b3"/>` +
    `<polygon points="11,48 17,48 16,16 14,8 12,18" fill="#e2e2e2"/>` +
    `<polygon points="16,48 22,48 21,34 19,26 17,36" fill="#c6c6c6"/>` +
    `<polygon points="21,48 27,48 26,14 24,6 22,16" fill="#d8d8d8"/>` +
    `<polygon points="26,48 31,48 30,28 28,20 26,30" fill="#bdbdbd"/>` +
    `</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "orcBerserkerOx" });

  // ----------------------------------------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine", group: "torso" });
  const spine = b.chain("spine", catmull([[0, 1.06, 0.01], [0, 1.24, 0.05], [0, 1.47, 0.09]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.66, 0.09], aim: [0, 1.86, 0.14], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.87, 0.15], dir: [0, 0.5, 0.86], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.815, 0.04], aim: [0, 1.8, 0.3], role: "jaw", group: "head" });
  const ears = [1, -1].map((s) => ({
    s,
    side: s > 0 ? "L" : "R",
    joint: b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: [s * 0.145, 1.89, 0.0],
      aim: [s, 0.25, -0.3],
      role: "hinge",
      group: "head",
    }),
  }));

  const armDefs = [
    { s: 1, side: "L", shoulder: [0.3, 1.63, 0.05], elbow: [0.44, 1.31, 0.09], wrist: [0.46, 1.05, 0.12], hand: [0.462, 0.96, 0.125] },
    { s: -1, side: "R", shoulder: [-0.3, 1.63, 0.05], elbow: [-0.43, 1.36, 0.08], wrist: [-0.448, 1.16, 0.13], hand: [-0.45, 1.1, 0.14] },
  ] as const;
  const arms = armDefs.map(({ s, side, shoulder, elbow, wrist, hand }) => {
    const chain = b.chain(`arm${side}`, polyline([shoulder, elbow, wrist, hand]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    return { s, side, chain, shoulderJoint: chain.joints[0], elbowJoint: chain.joints[1], tip: chain.joints[3], shoulder, elbow, wrist, hand };
  });

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const hip: V3 = [s * 0.18, 1.0, -0.01];
    const ball: V3 = [s * 0.21, 0.06, 0.17];
    const pts = limb(hip, ball, [0.48, 0.44, 0.2], [[0, 0, 1], [0, 0, -1]], { sole: [0, -0.25, 1] });
    const leg = b.chain(`leg${side}`, polyline([pts[0], pts[1], pts[2], ball]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.21, 0, 0.17],
      group: `leg${side}`,
    });
    b.sweep(leg, [0.135, 0.128, 0.104, 0.062], { to: 0.92 / 1.12, color: skin, group: `leg${side}` });
    b.frustumBox([s * 0.21, 0.072, -0.06], [s * 0.21, 0.048, 0.2], [0.13, 0.144], [0.105, 0.096], {
      color: skin,
      bone: leg.joints[2],
      group: `leg${side}`,
    });
    const toes: THREE.BufferGeometry[] = [];
    for (const dx of [-0.034, 0.004, 0.04]) {
      toes.push(new THREE.BoxGeometry(0.05, 0.052, 0.055).translate(s * 0.21 + dx, 0.026, 0.228));
      b.spike([s * 0.21 + dx, 0.03, 0.252], [0, -0.25, 1], 0.034, 0.013, {
        color: IVORY,
        bone: leg.joints[2],
        sides: 5,
        group: `leg${side}`,
      });
    }
    b.part(mergeGeometries(toes)!, skin, { bone: leg.joints[2], at: [0, 0, 0], group: `leg${side}` });
  }

  // Braids hang from the topknot: three little chains so they swing.
  const braidDefs = [
    { side: "C", path: catmull([[0, 2.06, -0.03], [0, 2.0, -0.1], [0, 1.9, -0.14], [0, 1.78, -0.12], [0, 1.68, -0.06]]), r: 0.033 },
    { side: "L", path: catmull([[0.1, 2.06, -0.02], [0.18, 1.94, -0.07], [0.24, 1.78, -0.03], [0.27, 1.62, 0.06]]), r: 0.03 },
    { side: "R", path: catmull([[-0.1, 2.06, -0.02], [-0.18, 1.94, -0.07], [-0.24, 1.78, -0.03], [-0.27, 1.62, 0.06]]), r: 0.03 },
  ] as const;
  for (const { side, path, r } of braidDefs) {
    const chain = b.chain(`braid${side}`, path, { parent: head, count: 3, names: (i) => `braid${side}${i + 1}`, group: "hair" });
    b.sweep(chain, [r, r * 0.48], { color: HAIR, sides: 6, caps: "round", group: "hair" });
    b.along(chain, 2, (at) => b.stick(new THREE.CylinderGeometry(0.037, 0.037, 0.015, 7), BRASS, at, { embed: 0.4, group: "hair" }), {
      from: 0.3,
      to: 0.75,
    });
  }

  // ----------------------------------------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 1.02, 0.0], w: 0.38, h: 0.32 },
      { at: [0, 1.26, 0.05], w: 0.46, h: 0.4 },
      { at: [0, 1.48, 0.095], w: 0.58, h: 0.5 },
      { at: [0, 1.66, 0.08], w: 0.52, h: 0.36 },
    ],
    { bone: [hips, spine], color: skin, sides: 12, caps: { start: "round", end: "flat" }, group: "torso" },
  );

  const pecs = [1, -1].map((s) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), skin, {
      bone: chest,
      at: [s * 0.14, 1.52, 0.29],
      scale: [0.12, 0.09, 0.075],
      rotation: [-12, 0, -6 * s],
      flat: true,
      group: "torso",
    }),
  );
  for (const row of [0, 1, 2] as const)
    for (const s of [1, -1] as const)
      b.part(new THREE.BoxGeometry(0.095, 0.058, 0.04), skin, {
        bone: spine.joints[1],
        at: [s * 0.052, 1.265 + row * 0.07, [0.25, 0.285, 0.315][row]],
        rotation: [-22, 0, 0],
        group: "torso",
      });

  b.rod([0, 1.62, 0.07], [0, 1.85, 0.13], [0.135, 0.11], { color: skin, bone: neck, sides: 9, group: "head" });
  for (const s of [1, -1] as const)
    b.rod([s * 0.05, 1.7, 0.09], [s * 0.27, 1.62, 0.05], [0.095, 0.12], { color: skin, bone: chest, sides: 7, group: "torso" });
  for (const arm of arms)
    b.part(new THREE.SphereGeometry(1, 10, 8), skin, {
      bone: arm.shoulderJoint,
      at: arm.shoulder,
      scale: arm.s > 0 ? [0.1365, 0.088, 0.13] : [0.1365, 0.104, 0.13],
      flat: true,
      group: `arm${arm.side}`,
    });

  // ----------------------------------------------------------------------------------------------- head
  b.frustumBox([0, 1.84, 0.1], [0, 2.06, 0.12], [0.28, 0.23], [0.24, 0.15], { color: skin, bone: head, group: "head" });
  b.part(new THREE.BoxGeometry(0.29, 0.07, 0.11), skin, {
    bone: head,
    at: [0, 1.965, 0.2],
    rotation: [9, 0, 0],
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.088, 0.05, 0.05), "#5f8a3e", {
    bone: head,
    at: [0, 1.865, 0.225],
    rotation: [-6, 0, 0],
    group: "head",
  });
  for (const s of [1, -1] as const)
    b.part(new THREE.BoxGeometry(0.02, 0.014, 0.012), "#232d1b", {
      bone: head,
      at: [s * 0.021, 1.85, 0.249],
      rotation: [-18, 0, 0],
      group: "head",
    });
  for (const s of [1, -1] as const)
    glow(b.part(new THREE.SphereGeometry(0.036, 6, 5), "#c01008", { bone: head, at: [s * 0.078, 1.888, 0.22], group: "head" }), 0.9);
  b.part(new THREE.BoxGeometry(0.13, 0.035, 0.08), MOUTH, { bone: head, at: [0, 1.822, 0.17], group: "head" });
  for (const x of [-0.058, -0.022, 0.022, 0.058])
    b.spike([x, 1.843, 0.21], [0, -1, 0], 0.045, 0.012, { color: IVORY, bone: head, sides: 5, group: "head" });

  // Lower jaw: its own hinged piece, teeth up, tusks curving past the cheeks.
  b.frustumBox([0, 1.75, 0.09], [0, 1.73, 0.21], [0.21, 0.15], [0.17, 0.11], { color: skin, bone: jaw, group: "head" });
  for (const x of [-0.05, -0.018, 0.018, 0.05])
    b.spike([x, 1.786, 0.2], [0, 1, 0], 0.027, 0.01, { color: IVORY, bone: jaw, sides: 5, group: "head" });
  for (const s of [1, -1] as const)
    b.sweep(bezier([s * 0.06, 1.775, 0.215], [s * 0.105, 1.93, 0.23], [s * 0.09, 2.055, 0.255]), [0.03, 0.006], {
      color: IVORY,
      bone: jaw,
      sides: 6,
      caps: "round",
      group: "head",
    });

  for (const { s, joint } of ears)
    b.extrude(
      [
        [0, -0.055],
        [0.07, -0.05],
        [0.145, 0.02, "sharp"],
        [0.055, 0.035],
        [-0.005, -0.008],
      ],
      { at: [s * 0.128, 1.89, 0.0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.007, smoothing: 1, color: skin, bone: joint, group: "head" },
    );

  // Topknot: a swept tuft on the crown; the braids hang from under it.
  b.sweep(catmull([[0, 2.05, 0.06], [0, 2.13, 0.01], [0, 2.11, -0.05]]), [0.075, 0.045, 0.038], {
    color: HAIR,
    bone: head,
    sides: 7,
    caps: "round",
    group: "hair",
  });

  // ----------------------------------------------------------------------------------------------- arms
  for (const arm of arms) {
    const { s, side } = arm;
    b.sweep(arm.chain, [0.115, 0.098, 0.075, 0.058], { color: skin, group: `arm${side}` });
    const dir = new THREE.Vector3(...arm.wrist).sub(new THREE.Vector3(...arm.elbow)).normalize();
    b.rod(offset(arm.elbow, dir, 0.015), offset(arm.wrist, dir, -0.008), [0.096, 0.074], {
      color: LEATHER_DARK,
      bone: arm.elbowJoint,
      sides: 7,
      group: "gear",
    });
    const studs: THREE.BufferGeometry[] = [];
    const span = vec(arm.elbow).distanceTo(vec(arm.wrist));
    for (const t of [0.28, 0.62]) {
      const dist = t * span - 0.015;
      const c = new THREE.Vector3(...arm.elbow).addScaledVector(dir, dist);
      const r = 0.096 - 0.022 * (dist / (span - 0.023));
      b.ring(frame(c, dir), { count: 5, radius: r }, (item) =>
        studs.push(new THREE.SphereGeometry(0.015, 5, 4).translate(item.at.x, item.at.y, item.at.z)),
      );
    }
    b.part(mergeGeometries(studs)!, BRASS, { bone: arm.elbowJoint, at: [0, 0, 0], group: "gear" });

    const fist = arm.hand;
    b.part(new THREE.BoxGeometry(0.11, 0.13, 0.12), skin, { bone: arm.tip, at: fist, group: `arm${side}` });
    const grip: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++)
      grip.push(new THREE.BoxGeometry(0.1, 0.02, 0.055).translate(fist[0], fist[1] + 0.045 - i * 0.024, fist[2] + 0.062));
    grip.push(new THREE.BoxGeometry(0.05, 0.075, 0.05).translate(fist[0] - 0.062 * s, fist[1] + 0.01, fist[2]));
    b.part(mergeGeometries(grip)!, skin, { bone: arm.tip, at: [0, 0, 0], group: `arm${side}` });
  }

  // ----------------------------------------------------------------------------------------------- gear
  const body = b.surface(torso);
  const waistLoop = body.loop(spine.joints[1], { lift: 0.012 });
  b.sweep(waistLoop, 0.02, { color: LEATHER_DARK, group: "gear" });
  const hipLoop = body.loop(frame([0, 1.16, 0.045], [0, 1, 0]), { lift: 0.014 });
  b.sweep(hipLoop, 0.024, { color: LEATHER, group: "gear" });

  const waistStuds: THREE.BufferGeometry[] = [];
  b.along(waistLoop, 9, (at) => {
    const d = new THREE.Vector3(at.at.x, 0, at.at.z - 0.05).normalize();
    const p = at.at.clone().addScaledVector(d, 0.024);
    waistStuds.push(new THREE.SphereGeometry(0.016, 5, 4).translate(p.x, p.y, p.z));
  });
  b.part(mergeGeometries(waistStuds)!, BRASS, { bone: spine.joints[1], at: [0, 0, 0], group: "gear" });
  const hipStuds: THREE.BufferGeometry[] = [];
  b.along(hipLoop, 9, (at) => {
    const d = new THREE.Vector3(at.at.x, 0, at.at.z - 0.045).normalize();
    const p = at.at.clone().addScaledVector(d, 0.028);
    hipStuds.push(new THREE.SphereGeometry(0.016, 5, 4).translate(p.x, p.y, p.z));
  });
  b.part(mergeGeometries(hipStuds)!, BRASS, { bone: spine.joints[0], at: [0, 0, 0], group: "gear" });

  // Fur loincloth: shaggy cards hanging from the hip belt, draping out over the thighs.
  const skirt: Frame[] = [];
  b.along(hipLoop, 24, (at) => {
    const d = new THREE.Vector3(at.at.x, 0, at.at.z - 0.045).normalize();
    skirt.push(frame(at.at, [d.x, 0.12, d.z]));
  });
  b.cards(skirt, FUR, {
    size: [0.085, 0.22],
    lean: 88,
    flow: (f) => {
      const d = new THREE.Vector3(f.at.x, 0, f.at.z - 0.045).normalize();
      return [d.x * 0.55, -1, d.z * 0.55];
    },
    vary: 0.35,
    spin: 12,
    rng: rng(21),
    bend: 10,
    color: FUR_TINT,
    sink: 0.06,
    group: "gear",
  });

  // Bandolier: over the right shoulder, across the chest, down to the left hip.
  const chestSurface = b.surface([torso, pecs[0], pecs[1]]);
  const strap = chestSurface.drape(
    catmull([[-0.24, 1.58, -0.14], [-0.27, 1.66, 0.02], [-0.22, 1.6, 0.18], [-0.08, 1.47, 0.3], [0.08, 1.33, 0.3], [0.2, 1.16, 0.22], [0.26, 1.06, 0.1]]),
    { lift: 0.01 },
  );
  b.sweep(strap, 0.032, { color: LEATHER_DARK, group: "gear" });
  b.along(strap, 7, (at) => b.stick(new THREE.CylinderGeometry(0.016, 0.016, 0.017, 6), BRASS, at, { embed: 0.35, group: "gear" }));
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.075), LEATHER, { bone: spine.joints[1], at: [0.13, 1.24, 0.29], rotation: [-10, 0, 0], group: "gear" });
  b.part(new THREE.BoxGeometry(0.145, 0.05, 0.08), LEATHER_DARK, { bone: spine.joints[1], at: [0.13, 1.295, 0.3], rotation: [-10, 0, 0], group: "gear" });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), BRASS, { bone: spine.joints[1], at: [0.13, 1.262, 0.335], group: "gear" });

  // ----------------------------------------------------------------------------------------------- spiked pauldron (left)
  const armL = arms[0];
  const axis = new THREE.Vector3(0.45, 1, 0).normalize();
  const dome = b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.15, 0.02],
      [0.135, 0.055],
      [0.105, 0.088],
      [0.05, 0.112],
      [0, 0.12],
    ],
    { at: [0.3, 1.63, 0.05], axis: [0.45, 1, 0], segments: 9, color: STEEL_DARK, bone: armL.shoulderJoint, group: "pauldron" },
  );
  const domeStuds: THREE.BufferGeometry[] = [];
  b.ring(frame([0.3, 1.63, 0.05], [0.45, 1, 0]), { count: 7, radius: 0.152 }, (item) => {
    const p = item.at.clone().addScaledVector(axis, -0.012);
    domeStuds.push(new THREE.SphereGeometry(0.016, 5, 4).translate(p.x, p.y, p.z));
  });
  b.part(mergeGeometries(domeStuds)!, BRASS, { bone: armL.shoulderJoint, at: [0, 0, 0], group: "pauldron" });
  const domeSkin = b.surface(dome);
  for (const [az, el] of [[-40, 60], [0, 70], [40, 70], [80, 60]] as const) {
    const hit = domeSkin.around([0.3, 1.67, 0.05]).at(az, el);
    if (hit) b.spike(hit, hit, 0.13, 0.022, { color: STEEL, sides: 6, group: "pauldron" });
  }
  b.rod([0.39, 1.6, 0.12], [0.36, 1.42, 0.09], 0.013, { color: LEATHER_DARK, bone: armL.shoulderJoint, sides: 5, group: "pauldron" });
  b.rod([0.39, 1.6, -0.02], [0.36, 1.42, 0.01], 0.013, { color: LEATHER_DARK, bone: armL.shoulderJoint, sides: 5, group: "pauldron" });

  // ----------------------------------------------------------------------------------------------- two-handed axe (right hand)
  const handR = arms[1].tip;
  b.rod([-0.45, 0.035, 0.14], [-0.45, 1.14, 0.14], 0.03, { color: wood, bone: handR, sides: 7, group: "weapon" });
  b.rod([-0.45, 0.035, 0.14], [-0.45, 0.1, 0.14], 0.036, { color: STEEL_DARK, bone: handR, sides: 7, group: "weapon" });
  b.rod([-0.45, 0.86, 0.14], [-0.45, 1.13, 0.14], 0.037, { color: LEATHER_DARK, bone: handR, sides: 7, group: "weapon" });
  b.part(new THREE.BoxGeometry(0.11, 0.19, 0.16), STEEL_DARK, { bone: handR, at: [-0.45, 0.26, 0.14], group: "weapon" });
  const BLADE: OutlinePoint[] = [
    [0.015, -0.09],
    [0.09, -0.14],
    [0.2, -0.155],
    [0.29, -0.105, "sharp"],
    [0.335, 0.01],
    [0.29, 0.13, "sharp"],
    [0.16, 0.15],
    [0.04, 0.12],
  ];
  b.extrude(BLADE, { at: [-0.45, 0.26, 0.205], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.024, bevel: 0.006, smoothing: 1, color: bladeSteel, bone: handR, group: "weapon" });
  b.extrude(BLADE, { at: [-0.45, 0.26, 0.075], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.024, bevel: 0.006, smoothing: 1, color: bladeSteel, bone: handR, group: "weapon" });

  // Snarl: the jaw opens a little in the rest pose so tusks and teeth read.
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}