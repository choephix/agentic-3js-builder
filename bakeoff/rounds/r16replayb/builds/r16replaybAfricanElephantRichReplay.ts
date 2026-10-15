import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Low-poly adult African bush elephant: faceted dusty-grey hide with cracked-skin paint, huge Africa-shaped ears, ridged trunk, ivory tusks, bristle tufts. About 3.4 m tall.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SK_DARK = "#6f6a65";
const SK_MID = "#8c8680";
const SK_LIGHT = "#a8a199";
const PINK = "#b09a94";
const CREASE = "#4d4844";
const DUST = "#b08e6a";
const DUST_D = "#8f7152";
const IVORY = "#ece1c8";
const NAIL = "#cfc4b2";
const NAIL_D = "#a99d8b";
const AMBER = "#8a5a22";
const PUPIL = "#1d130d";
const LASH = "#2a211c";
const MOUTH = "#b86c6a";
const MOUTH_D = "#5a2a2a";
const RIM = "#6a655f";
const BRISTLE = "#2c2622";

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Cracked grey hide: plates split by creases, dust on the legs and back, a wet streak below each eye. */
const hide = paint((p, n) => {
  const big = noise(p, 0.9, 11);
  const plate = cells(p, 0.26, 3);
  const edge = plate.d2 - plate.d1;
  const tone = big * 0.6 + plate.id * 0.4;
  let c = mix(SK_DARK, SK_LIGHT, smoothstep(0.25, 0.75, tone));
  // paler, pinker underside
  c = mix(c, PINK, smoothstep(-0.1, -0.85, n.y) * 0.45);
  // dust: thick on the lower legs and belly, lighter dabs along the back
  const lowDust = smoothstep(1.55, 0.25, p.y) * (0.55 + 0.45 * noise(p, 0.4, 21));
  const topDust = smoothstep(0.55, 0.95, n.y) * smoothstep(0.55, 0.8, noise(p, 0.5, 31)) * 0.55;
  const dustAmt = clamp01(Math.max(lowDust, topDust));
  c = mix(c, noise(p, 0.3, 41) > 0.5 ? DUST : DUST_D, dustAmt * 0.75);
  // creases between plates
  const crease = 1 - smoothstep(0.015, 0.09, edge);
  c = mix(c, CREASE, crease * 0.55);
  // horizontal leg wrinkles
  if (p.y < 1.9 && Math.abs(p.x) > 0.2) {
    const w = Math.sin(p.y * 31 + noise(p, 0.5, 4) * 7);
    c = mix(c, CREASE, smoothstep(0.82, 0.98, w) * 0.4);
  }
  // temporal gland streak
  const ax = Math.abs(p.x);
  if (ax > 0.36 && p.y < 2.84 && p.y > 2.4 && p.z > 1.9 && p.z < 2.25) {
    const d = Math.abs(p.z - 2.06 - (2.84 - p.y) * 0.08);
    c = mix(c, CREASE, smoothstep(0.06, 0.01, d) * 0.7);
  }
  return c;
});

/** Trunk: hide with fine rings and a pale, pink underside. */
const trunkHide = paint((p, n, s) => {
  const deg = ((s[1] % 360) + 360) % 360;
  const under = smoothstep(95, 150, deg) * smoothstep(265, 210, deg);
  const ring = Math.cos(s[0] * Math.PI * 2 * 22);
  let c = mix(SK_DARK, SK_LIGHT, smoothstep(0.2, 0.8, noise(p, 0.5, 12) * 0.7 + 0.15));
  c = mix(c, PINK, under * 0.6);
  c = mix(c, CREASE, smoothstep(0.55, 1, ring) * 0.55);
  const dust = smoothstep(1.2, 0.3, p.y) * 0.5 * (1 - under);
  c = mix(c, DUST, dust * smoothstep(0.35, 0.7, noise(p, 0.3, 17)));
  const crack = cells(p, 0.14, 5);
  c = mix(c, CREASE, (1 - smoothstep(0.02, 0.08, crack.d2 - crack.d1)) * 0.25 * (n.y > -9 ? 1 : 0));
  return c;
});

/** Ear: dark rim, pale pink veined inside, grey outside. */
const earHide = paint((p, n, s) => {
  const front = n.z > 0.15;
  const veins = cells(p, 0.3, 9);
  const vein = 1 - smoothstep(0.02, 0.07, veins.d2 - veins.d1);
  const outerEdge = smoothstep(0.1, 0.0, 1.16 - Math.hypot(s[0] - 0.4, (s[1] + 0.5) * 0.7) * 1.1);
  if (front) {
    let c = mix(PINK, SK_LIGHT, smoothstep(0.3, 0.8, noise(p, 0.6, 14)) * 0.7);
    c = mix(c, "#8a6f72", vein * 0.5);
    c = mix(c, SK_DARK, smoothstep(0.55, 1.2, s[0]) * 0.4);
    return mix(c, DUST, smoothstep(-0.5, -1.4, s[1]) * 0.35);
  }
  let c = mix(SK_DARK, SK_MID, noise(p, 0.5, 15));
  c = mix(c, CREASE, vein * 0.35);
  c = mix(c, DUST, smoothstep(-0.2, -1.3, s[1]) * 0.4 * noise(p, 0.25, 19));
  return mix(c, SK_DARK, outerEdge * 0.2);
});

/** Ivory: stained yellow at the root, grooved, scuffed tip. */
const ivory = paint((_p, _n, s) => {
  const t = s[0];
  const groove = Math.sin((s[1] * Math.PI) / 15) * 0.5 + 0.5;
  let c = mix("#d6bb88", IVORY, smoothstep(0.05, 0.4, t));
  c = mix(c, "#f6efe0", smoothstep(0.65, 1, t) * 0.7);
  c = mix(c, "#b79c6b", groove * 0.12);
  return mix(c, "#cdb88c", smoothstep(0.93, 1, t) * 0.5);
});

// Bristle tuft drawing: a handful of curved hair strands.
const tuft = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
    <polygon points="4,80 7,80 10,30 9,2" fill="#fff"/>
    <polygon points="12,80 16,80 18,18 19,0" fill="#fff"/>
    <polygon points="19,80 23,80 22,10 21,0" fill="#ddd"/>
    <polygon points="25,80 29,80 25,22 29,6" fill="#fff"/>
    <polygon points="32,80 36,80 31,36 35,16" fill="#eee"/>
  </svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const R = rng(2024);
  const F = { smooth: false } as const;

  // ============================================================== skeleton
  const pelvis = b.joint("pelvis", { at: [0, 2.45, -1.25], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.45, -0.5],
      [0, 2.5, 0.2],
      [0, 2.55, 0.85],
      [0, 2.62, 1.3],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.62, 1.3],
      [0, 2.7, 1.5],
      [0, 2.78, 1.62],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.78, 1.62], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.22, 1.95],
    aim: [0, 2.08, 2.5],
    role: "jaw",
  });

  // ============================================================== body
  const body = b.loft(
    [
      { at: [0, 2.425, -1.85], w: 0.8, h: 0.95 },
      { at: [0, 2.3, -1.45], w: 1.28, h: 1.5 },
      { at: [0, 2.18, -0.9], w: 1.5, h: 1.8 },
      { at: [0, 2.12, -0.2], w: 1.52, h: 1.8 },
      { at: [0, 2.17, 0.5], w: 1.46, h: 1.75 },
      { at: [0, 2.37, 1.05], w: 1.28, h: 1.65 },
      { at: [0, 2.5, 1.5], w: 1.0, h: 1.3 },
    ],
    { bone: [pelvis, spine, neck], color: hide, sides: 10, ...F, name: "body" },
  );

  // muscle masses: shoulders, haunches, rump
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: [s * 0.58, 2.62, 0.95],
      scale: [0.3, 0.62, 0.55],
      bone: spine.joints[2],
      ...F,
      flat: true,
      name: "shoulderMass",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: [s * 0.62, 2.55, -1.25],
      scale: [0.3, 0.72, 0.62],
      bone: pelvis,
      flat: true,
      name: "haunch",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: [s * 0.26, 2.9, -1.55],
      scale: [0.32, 0.32, 0.4],
      bone: pelvis,
      flat: true,
      name: "rumpCheek",
    });
  }

  // skin folds round the barrel
  const skin = b.surface(body);
  for (const z of [-0.75, -0.35, 0.05, 0.45]) {
    b.sweep(skin.loop([0, 2.3, z], { dir: [0, 0, 1], lift: 0.0 }), 0.014, {
      color: CREASE,
      sides: 4,
      ...F,
      name: "barrelFold",
    });
  }

  // ============================================================== head
  const skull = b.loft(
    [
      { at: [0, 2.8, 1.35], w: 1.0, h: 1.2 },
      { at: [0, 2.88, 1.85], w: 1.0, h: 1.1 },
      { at: [0, 2.72, 2.3], w: 0.78, h: 0.95 },
      { at: [0, 2.5, 2.62], w: 0.55, h: 0.65 },
    ],
    { bone: head, color: hide, sides: 10, ...F, name: "skull" },
  );
  // twin forehead domes, cheeks, brow ridges
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: [s * 0.2, 3.3, 1.8],
      scale: [0.3, 0.2, 0.34],
      bone: head,
      flat: true,
      name: "foreheadDome",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: [s * 0.33, 2.38, 2.2],
      scale: [0.17, 0.24, 0.3],
      bone: head,
      flat: true,
      name: "cheek",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), hide, {
      at: [s * 0.36, 2.98, 2.05],
      scale: [0.12, 0.07, 0.2],
      bone: head,
      flat: true,
      name: "brow",
    });
  }

  // lower jaw
  b.loft(
    [
      { at: [0, 2.2, 1.95], w: 0.52, h: 0.26 },
      { at: [0, 2.12, 2.3], w: 0.42, h: 0.22 },
      { at: [0, 2.07, 2.52], w: 0.3, h: 0.18 },
    ],
    { bone: jaw, color: hide, sides: 8, ...F, name: "lowerJaw" },
  );
  // mouth: pink corners and a tongue slab behind the trunk root
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), MOUTH_D, {
      at: [s * 0.2, 2.25, 2.3],
      scale: [0.06, 0.05, 0.1],
      bone: head,
      flat: true,
      name: "mouthCorner",
    });
  }
  b.part(new THREE.BoxGeometry(0.28, 0.04, 0.34), MOUTH, { at: [0, 2.2, 2.33], bone: jaw, flat: true, name: "tongue" });

  // eyes
  for (const s of [1, -1]) {
    const hit = b.surface(skull).ray([s * 1.2, 2.84, 2.06], [-s, 0, 0]);
    if (!hit) throw new Error("eye ray missed");
    b.stick(new THREE.SphereGeometry(0.05, 8, 6), AMBER, hit, { embed: 0.55, scale: [1, 0.6, 1], name: "eyeball" });
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), PUPIL, hit.moved([0, 0.018, 0]), { embed: 0.4, name: "pupil" });
    b.stick(new THREE.TorusGeometry(0.06, 0.017, 4, 8).rotateX(Math.PI / 2), hide, hit, {
      embed: 0.2,
      flat: true,
      name: "eyelid",
    });
    b.ring(hit, { count: 7, radius: 0.058, fromDeg: -85, toDeg: 85, tilt: 40 }, (lash) =>
      b.spike(lash, lash, 0.075, 0.007, { color: LASH, sides: 4, name: "lash" }),
    );
  }

  // ============================================================== tusks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = [s * 0.21, 2.17, 2.28];
    const path = bezier(root, [s * 0.3, 1.7, 2.75], [s * 0.38, 1.5, 3.4], [s * 0.3, 1.78, 4.0]);
    b.sweep(path, [0.075, 0.0], { bone: head, color: ivory, sides: 8, caps: { start: "flat", end: "point" }, ...F, name: `tusk${side}` });
    // lip sheath at the tusk root
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: [s * 0.21, 2.15, 2.3],
      scale: [0.13, 0.12, 0.13],
      bone: head,
      flat: true,
      name: `tuskSheath${side}`,
    });
    // a scuffed notch band near the tip
    b.sweep(path.slice(0.8, 0.86), [0.02, 0.016], { bone: head, color: "#c8b690", sides: 6, ...F, name: `tuskScuff${side}` });
  }

  // ============================================================== trunk
  const trunkPts = [
    [0, 2.42, 2.4],
    [0, 2.05, 2.78],
    [0, 1.55, 3.0],
    [0, 1.05, 3.08],
    [0, 0.68, 3.18],
    [0, 0.45, 3.38],
  ];
  const trunkPath = catmull(trunkPts);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 8, role: "tentacle" });
  const trunkR = (t: number) => {
    const base = 0.075 + 0.205 * Math.pow(1 - t, 1.25);
    const ridge = 1 + 0.07 * Math.cos(t * Math.PI * 2 * 22) * smoothstep(0.02, 0.15, t);
    return base * ridge;
  };
  const trunkTube = b.sweep(trunk, trunkR, { color: trunkHide, sides: 8, caps: "flat", ...F, name: "trunk" });
  // nostril pad and finger lips on the tip
  const tipP = trunkPath.at(1);
  const T = trunkPath.tangentAt(1).normalize();
  const U = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
  const tipBone = trunk.joints[trunk.joints.length - 1];
  b.part(new THREE.CylinderGeometry(0.062, 0.066, 0.02, 8), "#6a5754", {
    at: offset(tipP, T, 0.004),
    dir: T,
    bone: tipBone,
    flat: true,
    name: "nostrilPad",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), PUPIL, {
      at: offset(offset(tipP, T, 0.016), [s * 1, 0, 0], 0.024),
      bone: tipBone,
      flat: true,
      name: "nostril",
    });
  }
  const fingerBase = offset(tipP, U, 0.05);
  b.capsule(offset(fingerBase, T, -0.02), offset(fingerBase, T, 0.09), [0.034, 0.018], {
    bone: tipBone,
    color: trunkHide,
    sides: 6,
    ...F,
    name: "trunkFinger",
  });
  const lowerLip = offset(tipP, U, -0.05);
  b.capsule(offset(lowerLip, T, -0.02), offset(lowerLip, T, 0.05), [0.03, 0.02], {
    bone: tipBone,
    color: trunkHide,
    sides: 6,
    ...F,
    name: "trunkLip",
  });
  // ring ridges (merged) at trunk root for the wrinkly base
  const trunkBristles = b
    .surface(trunkTube)
    .scatter(26, { rng: R, minDist: 0.1, filter: (h) => h.n.y < 0.5 });
  b.cards(trunkBristles, tuft, { size: [0.02, 0.07], lean: 70, bend: 20, vary: 0.3, rng: rng(5), color: BRISTLE, flow: [0, -0.3, 1] });

  // ============================================================== ears
  const earOutline: [number, number][] = [
    [0, 0.3],
    [0.3, 0.4],
    [0.62, 0.32],
    [0.92, 0.12],
    [1.12, -0.2],
    [1.17, -0.55],
    [1.06, -0.92],
    [0.86, -1.2],
    [0.62, -1.42],
    [0.42, -1.28],
    [0.3, -1.05],
    [0.14, -0.78],
    [0, -0.5],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const xdir: [number, number, number] = [s * 0.78, 0, -0.62];
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.42, 3.12, 1.5],
      dir: xdir,
      role: "hinge",
    });
    const earMesh = b.extrude(earOutline, {
      at: ear.at,
      x: xdir,
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: earHide,
      bone: ear,
      name: `ear${side}`,
    });
    // rolled rim
    const rimPts = earOutline.map(([u, v]) => earMesh.local([u, v, 0]));
    b.sweep(catmull(rimPts, { closed: true }), 0.022, { bone: ear, color: RIM, sides: 5, ...F, name: `earRim${side}` });
    // cartilage ridges fanning from the root
    for (const [u, v] of [
      [0.75, -0.2],
      [0.85, -0.65],
      [0.6, -0.95],
    ]) {
      b.rod(earMesh.local([0.05, -0.08, 0.03]), earMesh.local([u, v, 0.03]), [0.018, 0.008], {
        bone: ear,
        color: "#7c6e6d",
        sides: 4,
        ...F,
        name: `earRib${side}`,
      });
    }
    // fleshy root where the ear meets the skull
    b.part(new THREE.SphereGeometry(1, 8, 6), hide, {
      at: earMesh.local([0.05, -0.1, 0.0]),
      scale: [0.14, 0.34, 0.14],
      bone: ear,
      flat: true,
      name: `earRoot${side}`,
    });
  }

  // ============================================================== legs
  const mkLeg = (
    s: number,
    hind: boolean,
    root: [number, number, number],
    target: [number, number, number],
    lengths: number[],
    bends: [number, number, number][],
    radius: (t: number) => number,
    nails: number,
  ) => {
    const side = s > 0 ? "L" : "R";
    const kind = hind ? "H" : "F";
    const pts = limb(root, target, lengths, bends);
    const names = hind ? [`hip${kind}${side}`, `knee${kind}${side}`, `ankle${kind}${side}`, `foot${kind}${side}`] : [`shoulder${side}`, `elbow${side}`, `wrist${side}`];
    const chainPts = pts;
    const chain = b.chain(`leg${kind}${side}`, chainPts, {
      parent: hind ? pelvis : spine.joints[2],
      names,
      role: "leg",
      contact: [target[0], 0, target[2]],
    });
    b.sweep(chain, radius, { color: hide, sides: 8, caps: "round", ...F, name: `leg${kind}${side}` });
    const foot = chain.tip ?? chain.joints[chain.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.235, 0.29, 0.22, 8), hide, {
      at: [target[0], 0.105, target[2]],
      bone: foot,
      flat: true,
      name: `foot${kind}${side}`,
    });
    const half = nails === 4 ? 52 : 40;
    const nailGeo = new THREE.CylinderGeometry(0.052, 0.062, 0.07, 6);
    b.ring(
      line([target[0], 0.1, target[2]], [target[0], 1, target[2]]),
      { count: nails, radius: 0.27, fromDeg: -half, toDeg: half },
      (item) => b.stick(nailGeo, NAIL, item, { embed: 0.3, bone: foot, flat: true, name: `nail${kind}${side}` }),
    );
    b.part(new THREE.TorusGeometry(0.27, 0.02, 3, 12).rotateX(Math.PI / 2), NAIL_D, {
      at: [target[0], 0.2, target[2]],
      bone: foot,
      flat: true,
      name: `footCuff${kind}${side}`,
    });
    // skin folds at knee/elbow, ankle and thigh
    for (const t of hind ? [0.12, 0.4, 0.47, 0.8, 0.86, 0.92] : [0.1, 0.46, 0.53, 0.84, 0.9]) {
      const cp = chain.at(t);
      b.part(new THREE.TorusGeometry(radius(t) * 1.04, 0.02, 3, 9), CREASE, {
        frame: cp,
        dir: cp.tangent,
        axis: "z",
        flat: true,
        name: `legFold${kind}${side}`,
      });
    }
    return chain;
  };

  for (const s of [1, -1]) {
    mkLeg(
      s,
      false,
      [s * 0.5, 2.4, 0.9],
      [s * 0.5, 0.17, 0.95],
      [1.2, 1.1],
      [[0, 0, 1]],
      (t) => 0.32 - 0.09 * Math.min(t / 0.5, 1) - 0.02 * Math.max((t - 0.5) / 0.5, 0),
      4,
    );
    mkLeg(
      s,
      true,
      [s * 0.52, 2.5, -1.2],
      [s * 0.5, 0.17, -1.28],
      [1.2, 0.9, 0.45],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      (t) => 0.37 - 0.1 * Math.min(t / 0.45, 1) - 0.04 * Math.max((t - 0.45) / 0.55, 0),
      3,
    );
  }

  // ============================================================== tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.82, -1.7],
      [0, 2.55, -2.02],
      [0, 2.1, -2.12],
      [0, 1.7, -2.1],
      [0, 1.38, -2.12],
    ]),
    { parent: pelvis, count: 5, role: "tail" },
  );
  b.sweep(tail, [0.075, 0.03], { color: hide, sides: 6, caps: "round", ...F, name: "tail" });
  const tipCp = tail.at(1);
  const tuftFrames = b.ring(line(tipCp.at, [0, 1, 0]), { count: 14, radius: 0.025 }).items.map((it) => it);
  b.cards(
    tuftFrames.map((it) => frame(it.at, [0, 1, 0])),
    tuft,
    {
      size: [0.04, 0.32],
      lean: 160,
      bend: 12,
      flow: (_f, i) => [Math.cos(i * 0.9), 0, Math.sin(i * 0.9)],
      vary: 0.25,
      rng: rng(9),
      color: BRISTLE,
      bone: tail.joints[tail.joints.length - 1],
    },
  );
  b.part(new THREE.SphereGeometry(0.045, 6, 4), BRISTLE, { at: [0, 1.36, -2.12], bone: tail.joints[tail.joints.length - 1], flat: true, name: "tailKnot" });

  // ============================================================== bristles
  const crown = b
    .surface(skull)
    .scatter(34, { rng: rng(21), minDist: 0.11, filter: (h) => h.n.y > 0.45 && h.at.z > 1.45 });
  b.cards(crown, tuft, { size: [0.025, 0.09], lean: 35, bend: 25, vary: 0.35, rng: rng(22), color: BRISTLE, flow: [0, -0.2, -1], bone: head });
  const backHairs = b.surface(body).scatter(30, { rng: rng(23), minDist: 0.3, filter: (h) => h.n.y > 0.75 });
  b.cards(backHairs, tuft, { size: [0.025, 0.08], lean: 30, bend: 20, vary: 0.35, rng: rng(24), color: BRISTLE, flow: [0, -0.2, -1] });

  // scattered mud chips on the lower hide
  const chipGeos: THREE.BufferGeometry[] = [];
  const chipSkin = b.surface(body);
  for (const h of chipSkin.scatter(24, { rng: rng(31), minDist: 0.2, filter: (h) => h.at.y < 2.0 && Math.abs(h.n.x) > 0.4 })) {
    const g = new THREE.IcosahedronGeometry(0.035 + R() * 0.02, 0);
    g.translate(h.at.x + h.n.x * 0.01, h.at.y + h.n.y * 0.01, h.at.z + h.n.z * 0.01);
    chipGeos.push(g);
  }
  const chips = mergeGeometries(chipGeos);
  if (chips) b.part(chips, DUST_D, { bone: spine.joints[1], at: [0, 0, 0], flat: true, name: "mudChips" });

  return b.root;
}
