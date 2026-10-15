import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, noise, paint, smoothstep, grain } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant bull in a faceted low-poly style: slab-sided barrel body, huge swept-back ears, ridged trunk, curved ivory tusks, dusty pillar legs with toenails, tufted tail, all skinned on a full rest-pose skeleton.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Palette: warm greys, dust, ivory, a little pink.
const SKIN = "#8a8581";
const SKIN_D = "#6c6865";
const SKIN_L = "#a39e98";
const CRACK = "#55514f";
const DUST = "#a98b6c";
const PINK = "#c49a93";
const PINK_D = "#a4736f";
const IVORY = "#f0e5c6";
const IVORY_D = "#cdb98c";
const IVORY_TIP = "#a8916a";
const NAIL = "#cfc3a6";
const AMBER = "#8a5420";
const EYE = "#1d120d";
const HAIR = "#2b2623";
const NOSTRIL = "#3a2c2a";
const MOUTH = "#8d4a48";

const SIDES = [
  { s: 1, k: "L" },
  { s: -1, k: "R" },
];

// ---- paints -----------------------------------------------------------------------------------------------------
// One hide paint for everything: mottled grey, cell-border wrinkle cracks, pale belly, dust on the legs, pink blotches
// on the face and ears.
const hide = (opts: { pink?: number; dust?: number } = {}) =>
  paint((p, n) => {
    const big = noise(p, 0.8, 3);
    let c = mix(SKIN_D, SKIN, smoothstep(0.25, 0.75, big));
    const cell = cells(p, 0.22, 5);
    const border = 1 - smoothstep(0.0, 0.06, cell.d2 - cell.d1);
    c = mix(c, CRACK, border * 0.4);
    c = mix(c, SKIN_L, smoothstep(0.1, -0.8, n.y) * 0.45);
    const dust = smoothstep(1.5, 0.05, p.y) * (0.55 + 0.45 * noise(p, 0.35, 9)) * (opts.dust ?? 1);
    c = mix(c, DUST, dust * 0.85);
    if (opts.pink) {
      const blot = smoothstep(0.55, 0.68, noise(p, 0.2, 21)) * smoothstep(1.9, 2.4, p.z);
      c = mix(c, PINK, blot * opts.pink);
    }
    return c;
  });

const BODY_HIDE = hide();
const HEAD_HIDE = hide({ pink: 0.65 });
const LEG_HIDE = hide({ dust: 1.25 });

// Trunk: ring ridges are in the geometry; the paint darkens the grooves and pinkens the underside and tip.
const TRUNK_RINGS = 20;
const trunkPaint = paint((p, n, s) => {
  const base = HEAD_HIDE.at(p, n, s);
  const f = (s[0] * TRUNK_RINGS) % 1;
  const groove = 1 - smoothstep(0.1, 0.22, Math.min(f, 1 - f));
  let c = mix(base, CRACK, groove * 0.55);
  c = mix(c, PINK, smoothstep(-0.2, -0.8, n.y) * 0.35 + smoothstep(0.82, 1, s[0]) * 0.25);
  return c;
});

const IVORY_PAINT = grain(IVORY, IVORY_D, { size: 0.025, axis: [0, 0.3, 1], seed: 4 });

const bristle = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32"><g fill="none" stroke="${HAIR}" stroke-width="1.5" stroke-linecap="round"><path d="M3 32 Q3 16 1 4"/><path d="M8 32 Q9 14 9 1"/><path d="M13 32 Q12 18 15 6"/></g></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "africanElephant" });
  const rand = rng(2024);

  // ---- skeleton: spine, neck, head ----------------------------------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 2.15, -1.25], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.15, -1.25],
      [0, 2.1, -0.3],
      [0, 2.15, 0.6],
      [0, 2.25, 1.45],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.25, 1.45],
      [0, 2.35, 1.75],
      [0, 2.45, 2.0],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.45, 2.0], dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 2.2], aim: [0, 1.93, 2.72], role: "jaw" });

  // ---- barrel body --------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 2.3, -1.65], w: 1.0, h: 1.15 },
      { at: [0, 2.15, -1.3], w: 1.5, h: 1.65 },
      { at: [0, 2.0, -0.6], w: 1.68, h: 1.9 },
      { at: [0, 2.05, 0.3], w: 1.68, h: 2.0 },
      { at: [0, 2.2, 1.0], w: 1.62, h: 2.15 },
      { at: [0, 2.2, 1.55], w: 1.28, h: 1.85 },
      { at: [0, 2.4, 2.0], w: 0.95, h: 1.3 },
    ],
    { bone: [pelvis, spine, neck], color: BODY_HIDE, sides: 10, smooth: false, name: "body" },
  );
  const bodySurf = b.surface(body);

  // Skin folds: tapering wrinkle arcs on the flanks and around the shoulder / hip.
  for (const z of [-1.45, -1.05, -0.65, -0.25, 0.15, 0.55, 0.95, 1.35]) {
    const ring = bodySurf.loop(frame([0, 2.1, z], [0, 0, 1]), { lift: -0.004 });
    const a = 0.1 + rand() * 0.06;
    const len = 0.17 + rand() * 0.1;
    b.sweep(ring.slice(a, a + len), [0.002, 0.016, 0.002], { color: CRACK, sides: 4, caps: "point", bone: spine });
    const c = 0.64 + rand() * 0.06;
    b.sweep(ring.slice(c, c + len), [0.002, 0.016, 0.002], { color: CRACK, sides: 4, caps: "point", bone: spine });
    // belly crease
    b.sweep(ring.slice(0.44, 0.56), [0.002, 0.014, 0.002], { color: CRACK, sides: 4, caps: "point", bone: spine });
  }

  // Sparse body bristles.
  const bodyHits = bodySurf.scatter(70, { rng: rng(31), minDist: 0.2, filter: (h) => h.n.y > 0.1 });
  b.cards(bodyHits, bristle, { size: [0.035, 0.085], lean: 55, bend: 20, vary: 0.3, rng: rng(32), flow: [0, 0, -1] });

  // ---- head ---------------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 2.6, 1.9], w: 0.95, h: 1.25 },
      { at: [0, 2.6, 2.3], w: 0.95, h: 1.25 },
      { at: [0, 2.4, 2.65], w: 0.7, h: 0.95 },
      { at: [0, 2.3, 2.85], w: 0.5, h: 0.7 },
    ],
    { bone: head, color: HEAD_HIDE, sides: 10, smooth: false, name: "skull", caps: { start: "none", end: "flat" } },
  );
  const skullS = b.surface(skull);

  for (const { s } of SIDES) {
    // twin forehead domes, cheeks, brow
    b.part(new THREE.IcosahedronGeometry(0.28, 1), HEAD_HIDE, {
      bone: head,
      at: [s * 0.2, 3.0, 2.1],
      scale: [1, 0.78, 1.1],
      flat: true,
      name: "dome",
    });
    b.part(new THREE.IcosahedronGeometry(0.2, 1), HEAD_HIDE, {
      bone: head,
      at: [s * 0.38, 2.28, 2.4],
      scale: [0.9, 1, 1.2],
      flat: true,
      name: "cheek",
    });
    b.part(new THREE.IcosahedronGeometry(0.14, 0), SKIN_D, {
      bone: head,
      at: [s * 0.34, 2.72, 2.52],
      scale: [1.3, 0.7, 1.1],
      flat: true,
      name: "brow",
    });

    // eye: lid mound, amber ball, pupil, highlight, lashes
    const eh = skullS.around([0, 2.55, 2.3]).at(s * 78, 0);
    if (!eh) throw new Error("no eye hit");
    b.stick(new THREE.SphereGeometry(0.075, 7, 5), SKIN_D, eh, { embed: 0.5, scale: [1, 0.6, 1], name: "eyelid" });
    b.stick(new THREE.SphereGeometry(0.042, 6, 4), AMBER, eh.moved([0, 0.02, 0]), { embed: 0.2, name: "eyeball" });
    b.stick(new THREE.SphereGeometry(0.024, 5, 4), EYE, eh.moved([0, 0.045, 0]), { embed: 0.2, name: "pupil" });
    b.stick(new THREE.SphereGeometry(0.008, 4, 3), "#ffffff", eh.moved([0.012, 0.062, 0.012]), { embed: 0.2, name: "glint" });
    b.ring(
      eh.moved([0, 0.03, 0]),
      { count: 8, radius: 0.052, fromDeg: -85, toDeg: 85, tilt: 35 },
      (lash) => b.spike(lash, lash, 0.075, 0.007, { color: HAIR, sides: 4 }),
    );
    // temporal gland streak
    const tg = skullS.around([0, 2.5, 2.2]).at(s * 100, -6);
    if (tg) {
      b.stick(new THREE.SphereGeometry(0.05, 6, 4), PINK_D, tg, { embed: 0.5, scale: [1, 0.4, 1.4], name: "gland" });
      const tgEnd = offset(tg, [0, -1, 0.1], 0.2);
      b.sweep([tg.moved([0, 0.004, 0]), tgEnd], [0.02, 0.005], { color: "#6a5148", sides: 4, caps: "point", bone: head });
    }
  }

  // bristles on crown and forehead
  const crown = skullS.scatter(60, { rng: rng(11), minDist: 0.075, filter: (h) => h.n.y > 0.35 });
  b.cards(crown, bristle, {
    size: [0.045, 0.1],
    lean: 50,
    bend: 25,
    vary: 0.35,
    rng: rng(12),
    flow: [0, 0, -1],
    cross: true,
  });

  // ---- ears: big Africa-shaped flaps swung back and out ------------------------------------------------------------
  const earOutline: OutlinePoint[] = [
    [0, 0.25],
    [0.3, 0.62],
    [0.75, 0.7],
    [1.1, 0.45],
    [1.3, 0.0],
    [1.28, -0.42],
    [1.05, -0.88],
    [0.75, -1.28],
    [0.5, -1.55, "sharp"],
    [0.28, -1.1],
    [0.1, -0.6],
    [0, -0.3],
  ];
  const earSwing = 50 * DEG;
  for (const { s, k } of SIDES) {
    const x = [s * Math.cos(earSwing), 0, -Math.sin(earSwing)];
    const y = [s * 0.2, 1, 0];
    const thick = new THREE.Vector3(...x).cross(new THREE.Vector3(...y)).normalize();
    const ear = b.joint(`ear${k}`, { parent: head, at: [s * 0.46, 3.0, 1.95], dir: x, role: "hinge" });
    const earPaint = paint((p, n, sc) => {
      if (Math.abs(n.dot(thick)) < 0.5) return mix(SKIN_D, CRACK, 0.4);
      if (n.z > 0) {
        // inner (front) face: pink with a vein network
        const cell = cells(p, 0.3, 17);
        const vein = 1 - smoothstep(0.0, 0.05, cell.d2 - cell.d1);
        let c = mix(PINK, SKIN_L, 0.25 + 0.4 * noise(p, 0.5, 8));
        c = mix(c, PINK_D, vein * 0.7);
        c = mix(c, SKIN, smoothstep(0.1, 0.0, sc[0]) * 0.8);
        return c;
      }
      return BODY_HIDE.at(p, n, sc);
    });
    b.extrude(earOutline, {
      at: ear,
      x,
      y,
      thickness: [0.03, 0.065],
      bevel: 0.012,
      smoothing: 1,
      color: earPaint,
      bone: ear,
      name: `earPlate${k}`,
    });
    // rim thickening along the top edge
    b.sweep(
      [
        offset(ear, x, 0.06),
        offset(ear, x, 0.4).add(new THREE.Vector3(0, 0.62, 0)),
        offset(ear, x, 0.85).add(new THREE.Vector3(0, 0.7, 0)),
        offset(ear, x, 1.15).add(new THREE.Vector3(0, 0.45, 0)),
        offset(ear, x, 1.33).add(new THREE.Vector3(0, 0.0, 0)),
      ],
      [0.025, 0.02, 0.02, 0.018, 0.012],
      { color: SKIN_D, sides: 5, bone: ear, caps: "round", name: `earRim${k}` },
    );
  }

  // ---- trunk --------------------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 2.35, 2.7],
    [0, 1.95, 3.0],
    [0, 1.35, 3.15],
    [0, 0.85, 3.15],
    [0, 0.5, 3.2],
    [0, 0.33, 3.42],
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 8, role: "tentacle" });
  const trunkR = [0.3, 0.26, 0.2, 0.15, 0.115, 0.09];
  const trunkBase = (t: number) => {
    const f = t * (trunkR.length - 1);
    const i = Math.min(Math.floor(f), trunkR.length - 2);
    return trunkR[i] + (trunkR[i + 1] - trunkR[i]) * (f - i);
  };
  const trunkTube = b.sweep(
    trunk,
    (t) => {
      const f = (t * TRUNK_RINGS) % 1;
      const tri = 1 - Math.abs(2 * f - 1);
      const r = trunkBase(t) * (1 + 0.055 * (tri * 2 - 1));
      return [r * 1.08, r];
    },
    { color: trunkPaint, sides: 8, smooth: false, caps: { start: "none", end: "flat" }, name: "trunk" },
  );
  const tipAt = trunk.at(1);
  const tipDir = tipAt.tangent.clone().normalize();
  const tipRight = new THREE.Vector3(1, 0, 0);
  for (const sx of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.026, 6), NOSTRIL, {
      bone: trunk.joints[trunk.joints.length - 1],
      at: offset(tipAt.at, tipDir, 0.004).addScaledVector(tipRight, sx * 0.03),
      dir: tipDir,
      axis: "z",
      name: "nostril",
    });
  }
  // the "finger": dorsal lip at the trunk tip
  b.spike(offset(tipAt.at, tipDir, -0.02).add(new THREE.Vector3(0, 0.06, 0)), tipDir, 0.1, 0.045, {
    color: PINK,
    sides: 5,
    bone: trunk.joints[trunk.joints.length - 1],
    name: "trunkFinger",
  });
  // trunk bristles along the sides and top near the base
  const trunkHits = b
    .surface(trunkTube)
    .scatter(40, { rng: rng(41), minDist: 0.08, filter: (h) => h.n.y > -0.1 });
  b.cards(trunkHits, bristle, { size: [0.03, 0.07], lean: 60, vary: 0.3, rng: rng(42), flow: [0, -0.5, 1] });

  // ---- tusks ----------------------------------------------------------------------------------------------------------
  for (const { s, k } of SIDES) {
    const path = catmull([
      [s * 0.27, 2.05, 2.72],
      [s * 0.38, 1.75, 3.1],
      [s * 0.44, 1.5, 3.6],
      [s * 0.4, 1.5, 4.05],
      [s * 0.34, 1.7, 4.35],
    ]);
    b.sweep(path, [0.088, 0.014], {
      bone: head,
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "point" },
      color: IVORY_PAINT,
      bands: [
        [0.1, SKIN_L],
        [0.94, IVORY_PAINT],
        [1, IVORY_TIP],
      ],
      name: `tusk${k}`,
    });
    // fleshy lip around the tusk root
    b.part(new THREE.IcosahedronGeometry(0.115, 0), SKIN_L, {
      bone: head,
      at: [s * 0.29, 2.04, 2.76],
      scale: [1, 1, 0.9],
      flat: true,
      name: "tuskLip",
    });
  }

  // ---- lower jaw ------------------------------------------------------------------------------------------------------
  b.frustumBox([0, 1.9, 2.2], [0, 1.86, 2.72], [0.62, 0.3], [0.36, 0.22], { bone: jaw, color: SKIN_L, name: "jaw" });
  for (const { s } of SIDES)
    b.rod([s * 0.2, 2.0, 2.3], [s * 0.1, 2.0, 2.74], 0.014, { color: MOUTH, sides: 4, bone: jaw, name: "lip" });
  const chin = [
    [0.12, 1.82, 2.7],
    [-0.12, 1.82, 2.7],
  ];
  b.cards(
    chin.map((p) => frame(p, [0, -0.4, 1])),
    bristle,
    { size: [0.04, 0.08], lean: 50, flow: [0, -1, 0.4], bone: jaw },
  );

  // ---- legs -----------------------------------------------------------------------------------------------------------
  const legRadius = [0.43, 0.36, 0.31, 0.29, 0.3];
  const footGeo = () => new THREE.CylinderGeometry(0.3, 0.345, 0.27, 8, 1);
  const makeLeg = (
    prefix: string,
    names: [string, string, string],
    s: number,
    k: string,
    root: [number, number, number],
    foot: [number, number, number],
    seg: number,
    bend: [number, number, number],
    parent: Parameters<typeof b.chain>[2] extends infer O ? (O extends { parent?: infer P } ? P : never) : never,
    nails: number[],
    toeSolid: number,
  ) => {
    const pts = limb(root, foot, [seg, seg], bend);
    const chain = b.chain(
      `${prefix}${k}`,
      pts,
      { parent, names: [names[0] + k, names[1] + k, names[2] + k], role: "leg", contact: [foot[0], 0, foot[2]] },
    );
    const tube = b.sweep(chain, legRadius, {
      sides: 8,
      smooth: false,
      color: LEG_HIDE,
      caps: { start: "round", end: "flat" },
      name: `${prefix}${k}Tube`,
    });
    const wrist = chain.joints[chain.joints.length - 1];
    b.part(footGeo(), LEG_HIDE, { bone: wrist, at: [foot[0], 0.105, foot[2]], flat: true, name: `${prefix}${k}Foot` });
    b.part(new THREE.TorusGeometry(0.3, 0.04, 4, 9), SKIN_D, {
      bone: wrist,
      at: [foot[0], 0.265, foot[2]],
      rotation: [90, 0, 0],
      flat: true,
      name: `${prefix}${k}Ankle`,
    });
    // creases around the leg
    const surf = b.surface(tube);
    for (const t of [0.3, 0.52, 0.78]) {
      const loop = surf.loop(chain.at(t), { lift: -0.004 });
      b.sweep(loop, 0.014, { color: CRACK, sides: 4, name: `${prefix}${k}Crease` });
    }
    // toes + nails
    const toe = b.joint(`toes${prefix.slice(-1)}${k}`, {
      parent: wrist,
      at: [foot[0], 0.1, foot[2] + 0.18],
      aim: [foot[0], 0.1, foot[2] + 0.4],
      role: "digit",
    });
    const R = 0.335;
    nails.forEach((deg) => {
      const a = deg * DEG;
      const out: [number, number, number] = [Math.sin(a), 0.12, Math.cos(a)];
      b.part(new THREE.CylinderGeometry(0.038, 0.058, 0.085, 5), NAIL, {
        bone: toe,
        at: [foot[0] + R * Math.sin(a) * 0.97, 0.085, foot[2] + R * Math.cos(a) * 0.97],
        dir: out,
        flat: true,
        name: "nail",
      });
    });
    void toeSolid;
    void s;
    return chain;
  };

  for (const { s, k } of SIDES) {
    makeLeg(
      "legF",
      ["shoulder", "elbow", "wrist"],
      s,
      k,
      [s * 0.58, 1.95, 1.0],
      [s * 0.58, 0.2, 1.05],
      0.89,
      [0, 0, -1],
      spine.joints[2],
      [-42, -14, 14, 42],
      0,
    );
    const hind = makeLeg(
      "legH",
      ["hip", "knee", "ankle"],
      s,
      k,
      [s * 0.6, 1.95, -1.25],
      [s * 0.6, 0.2, -1.3],
      0.92,
      [0, 0, 1],
      pelvis,
      [-26, 0, 26],
      0,
    );
    // knee cap
    const kn = hind.joints[1];
    b.part(new THREE.IcosahedronGeometry(0.15, 0), SKIN_D, {
      bone: kn,
      at: [s * 0.6, kn.at.y + 0.02, kn.at.z + 0.2],
      scale: [1, 1.1, 0.8],
      flat: true,
      name: "kneecap",
    });
  }

  // ---- tail -----------------------------------------------------------------------------------------------------------
  const rump = bodySurf.around([0, 2.3, -1.6]).at(180, 8);
  if (!rump) throw new Error("no rump hit");
  const tailPath = catmull([
    rump.at,
    [0, rump.at.y - 0.3, rump.at.z - 0.18],
    [0, rump.at.y - 0.85, rump.at.z - 0.27],
    [0, rump.at.y - 1.35, rump.at.z - 0.24],
    [0, rump.at.y - 1.7, rump.at.z - 0.18],
  ]);
  const tail = b.sprout("tail", rump, tailPath, [0.075, 0.032], {
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
    color: BODY_HIDE,
    sides: 6,
    caps: { end: "round" },
    name: "tail",
  });
  if (tail.chain) {
    const tipPoint = tail.chain.at(1);
    const down = tipPoint.tangent.clone().normalize();
    b.ring(tipPoint, { count: 10, radius: 0.02 }, (h) => {
      const out = h.axis.clone();
      const m = offset(h, out, 0.05).addScaledVector(down, 0.16);
      const e = offset(m, out, 0.05).addScaledVector(down, 0.2);
      b.sweep(bezier(h, m, e), [0.012, 0.0], { color: HAIR, sides: 4, caps: "point", name: "tailHair" });
    });
    // inner tuft spikes
    b.ring(tipPoint, { count: 5, radius: 0.005 }, (h) => {
      const e = offset(h, down, 0.4).addScaledVector(h.axis, 0.03);
      b.sweep([h, e], [0.014, 0.0], { color: "#1a1613", sides: 4, caps: "point", name: "tailHair" });
    });
    // tail wrinkles
    b.along(tail.sweep, 5, (at) =>
      b.part(new THREE.TorusGeometry(0.05, 0.012, 3, 6), SKIN_D, {
        frame: at,
        flat: true,
        name: "tailRing",
      }),
    );
  }

  return b.root;
}
