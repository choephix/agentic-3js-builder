```ts
import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, polyline, limb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle with folded bat wings, horns, claws and a spade tail, perched on a carved, mossy cathedral ledge with quatrefoil reliefs.",
};

// ---------- palette ----------
const STONE = "#8b8a84";
const LIGHT = "#a9a79d";
const DARK = "#5a5b5c";
const DEEP = "#3b3c40";
const HORN = "#6c6b66";
const CLAW = "#34343a";
const WING = "#74766f";
const WING_RIB = "#9a998e";
const TONGUE = "#7b3a3a";
const EYE = "#ffb02e";
const MOSS = "#5d7a3a";
const MOSS_D = "#41602c";
const SEAM = "#4b4c4f";
const STAIN = "#55585a";

const L = 0.23; // ledge top height

const ico = (r: number, d = 1) => new THREE.IcosahedronGeometry(r, d);
const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const r = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, L + 0.42, -0.25], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, L + 0.45, -0.25],
      [0, L + 0.62, -0.02],
      [0, L + 0.8, 0.18],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, L + 0.8, 0.18],
      [0, L + 0.93, 0.3],
      [0, L + 0.95, 0.43],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1),
    dir: [0, -0.12, 1],
    role: "head",
  });

  // head-local helper: left / up / forward in meters
  const fwd = new THREE.Vector3(...head.axis.toArray()).normalize();
  const upv = new THREE.Vector3(0, 1, 0).addScaledVector(fwd, -fwd.y).normalize();
  const leftv = upv.clone().cross(fwd).normalize();
  const hp = (l: number, u: number, f: number) =>
    head.at.clone().addScaledVector(leftv, l).addScaledVector(upv, u).addScaledVector(fwd, f);

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.07, 0.08),
    aim: hp(0, -0.08, 0.4),
    role: "jaw",
  });

  const tailPath = catmull([
    [0, L + 0.38, -0.4],
    [0, L + 0.18, -0.72],
    [0.12, L + 0.09, -0.98],
    [0.3, L + 0.07, -1.14],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // ---------- body ----------
  const torso = b.sweep(
    spine,
    (t) => {
      const w = 0.2 + 0.06 * Math.sin(t * Math.PI * 0.9 + 0.2);
      return [w, w * 1.08];
    },
    {
      color: STONE,
      sectors: [
        [-60, 60, LIGHT],
        [130, 230, DARK],
      ],
    },
  );
  const neckTube = b.sweep(neck, [0.14, 0.11], {
    color: STONE,
    sectors: [
      [-60, 60, LIGHT],
      [130, 230, DARK],
    ],
  });
  const tailTube = b.sweep(tail, [0.09, 0.02], {
    color: STONE,
    caps: "point",
    sectors: [[130, 230, DARK]],
  });

  // rump and shoulders
  b.part(ico(0.2, 1), STONE, { bone: hips, at: [0, L + 0.43, -0.28], scale: [1.1, 0.95, 1.1], flat: true });
  b.part(ico(0.16, 1), LIGHT, { bone: chest, at: [0, L + 0.8, 0.0], scale: [1.35, 0.8, 1], flat: true });

  // dorsal spikes
  b.along(torso, 4, (at) => b.spike(at, at, 0.11, 0.035, { color: HORN }));
  b.along(neckTube, 2, (at) => b.spike(at, at, 0.08, 0.03, { color: HORN }));
  b.along(tailTube, 4, (at) => b.spike(at, at, 0.07, 0.025, { color: HORN }));

  // tail spade
  const tailEnd = tailPath.at(1);
  b.extrude(
    [
      [-0.05, 0],
      [0.05, 0],
      [0.1, 0.08],
      [0, 0.25, "sharp"],
      [-0.1, 0.08],
    ],
    {
      at: tailEnd,
      x: [0.7, 0, 0.7],
      y: [0.7, 0, -0.7],
      thickness: 0.035,
      bevel: 0.006,
      color: HORN,
      bone: tail.joints[2],
    },
  );

  // ---------- quatrefoil relief helper ----------
  const quatrefoil = (c: THREE.Vector3, n: THREE.Vector3, rad: number, col: string, ctr: string, bone: any, lit = false) => {
    let u = new THREE.Vector3(0, 1, 0).cross(n);
    if (u.lengthSq() < 1e-4) u = new THREE.Vector3(1, 0, 0);
    u.normalize();
    const v = n.clone().cross(u).normalize();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const p = c.clone().addScaledVector(u, Math.cos(a) * rad * 0.55).addScaledVector(v, Math.sin(a) * rad * 0.55);
      b.part(new THREE.CylinderGeometry(rad * 0.5, rad * 0.5, 0.02, 8), col, { bone, at: p, dir: n.toArray() as [number, number, number] });
    }
    const mid = b.part(new THREE.CylinderGeometry(rad * 0.32, rad * 0.32, 0.028, 8), ctr, {
      bone,
      at: c,
      dir: n.toArray() as [number, number, number],
    });
    if (lit) glow(mid, 1.2);
  };

  // chest emblem
  const chestHit = b.surface(torso).ray([0, L + 0.7, 1.2], [0, 0, -1]);
  if (chestHit) {
    quatrefoil(chestHit.at.clone(), chestHit.n.clone(), 0.075, DARK, EYE, chest, true);
  }

  // moss on upward faces
  const skin = b.surface(torso);
  for (const hit of skin.scatter(16, { rng: rng(7), minDist: 0.1, filter: (h) => h.n.y > 0.5 })) {
    b.stick(new THREE.SphereGeometry(0.045, 6, 4), r() > 0.5 ? MOSS : MOSS_D, hit, { embed: 0.5, scale: [1, 0.4, 1] });
  }

  // ---------- head ----------
  const hb = (
    w: number, h: number, d: number,
    l: number, u: number, f: number,
    col: string,
    opt: { bone?: any; up?: [number, number, number] } = {},
  ) =>
    b.part(bx(w, h, d), col, {
      bone: opt.bone ?? head,
      at: hp(l, u, f),
      dir: head.axis.toArray() as [number, number, number],
      axis: "z",
      ...(opt.up ? { up: opt.up } : {}),
    });

  hb(0.32, 0.26, 0.32, 0, 0.02, 0.1, STONE);
  hb(0.1, 0.05, 0.28, 0, 0.16, 0.08, LIGHT);
  hb(0.2, 0.12, 0.22, 0, -0.05, 0.34, STONE);
  hb(0.12, 0.04, 0.1, 0, 0.03, 0.4, LIGHT);
  hb(0.1, 0.03, 0.2, 0, -0.1, 0.34, DARK);
  for (const s of [1, -1]) {
    hb(0.06, 0.1, 0.16, s * 0.16, -0.04, 0.1, STONE);
    // brow ridge, angry slant
    hb(0.16, 0.05, 0.1, s * 0.09, 0.14, 0.21, DARK, { up: [-s * 0.35, 1, 0] });
    // eye socket, glowing eye, slit pupil
    hb(0.09, 0.07, 0.03, s * 0.1, 0.07, 0.262, DEEP);
    glow(b.part(new THREE.SphereGeometry(0.032, 8, 6), EYE, { bone: head, at: hp(s * 0.1, 0.07, 0.275) }), 1.4);
    hb(0.008, 0.045, 0.01, s * 0.1, 0.07, 0.31, DEEP);
    // nostrils
    hb(0.03, 0.025, 0.02, s * 0.05, 0.0, 0.455, DEEP);
    // cheek spikes
    b.spike(hp(s * 0.18, -0.05, 0.06), hp(s * 0.3, -0.1, -0.1).sub(hp(s * 0.18, -0.05, 0.06)).normalize().toArray() as [number, number, number], 0.12, 0.03, {
      color: HORN,
      bone: head,
    });
    // upper fangs
    b.spike(hp(s * 0.075, -0.1, 0.42), [0, -1, 0.1], 0.09, 0.02, { color: LIGHT, bone: head });
    // lower fangs
    b.spike(hp(s * 0.065, -0.12, 0.4), [0, 1, 0.15], 0.085, 0.018, { color: LIGHT, bone: jaw });
    // horn
    b.sweep(bezier(hp(s * 0.1, 0.13, 0.0), hp(s * 0.2, 0.3, -0.1), hp(s * 0.25, 0.36, -0.34)), [0.055, 0], {
      bone: head,
      color: HORN,
      caps: { start: "flat", end: "point" },
    });
    b.spike(hp(s * 0.115, 0.17, -0.0), [s * 0.4, 1, -0.5], 0.0001, 0.0001, { color: HORN, bone: head });
    // pointed ear
    b.extrude(
      [
        [0, -0.04],
        [0.1, 0.0],
        [0.16, 0.13, "sharp"],
        [0.03, 0.09],
      ],
      {
        at: hp(s * 0.16, 0.06, -0.04),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.005,
        color: STONE,
        bone: head,
      },
    );
  }
  // incisors
  for (let i = 0; i < 4; i++) {
    const x = -0.045 + i * 0.03;
    b.spike(hp(x, -0.11, 0.455), [0, -1, 0.1], 0.04, 0.01, { color: LIGHT, bone: head });
    b.spike(hp(x, -0.12, 0.43), [0, 1, 0.1], 0.035, 0.01, { color: LIGHT, bone: jaw });
  }
  // lower jaw
  hb(0.18, 0.05, 0.24, 0, -0.145, 0.32, STONE, { bone: jaw });
  hb(0.12, 0.05, 0.08, 0, -0.16, 0.44, DARK, { bone: jaw });
  hb(0.1, 0.015, 0.18, 0, -0.12, 0.3, TONGUE, { bone: jaw });
  b.spike(hp(0, -0.17, 0.4), [0, -1, 0.4], 0.13, 0.035, { color: HORN, bone: jaw });
  // crown spikes
  for (const f of [0.0, 0.1, 0.2]) b.spike(hp(0, 0.18, f), [0, 1, -0.4], 0.07, 0.025, { color: HORN, bone: head });

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.22, L + 0.7, 0.1];
    const target: [number, number, number] = [s * 0.27, L + 0.06, 0.42];
    const pts = limb(shoulder, target, [0.4, 0.4], [[s * 0.6, 0.3, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.1, 0.07, 0.065], { color: STONE, sectors: [[130, 230, DARK]] });
    b.part(ico(0.13, 1), LIGHT, { bone: arm.joints[0], at: [s * 0.27, L + 0.72, 0.1], scale: [1, 1.1, 1.1], flat: true });
    b.spike(pts[1], [s * 0.8, 0.2, -1], 0.13, 0.035, { color: HORN, bone: arm.joints[1] });
    const hand = arm.tip!;
    b.part(bx(0.13, 0.07, 0.16), STONE, { bone: hand, at: [s * 0.27, L + 0.035, 0.46] });
    for (const dx of [-0.045, 0, 0.045]) {
      b.part(ico(0.028, 0), LIGHT, { bone: hand, at: [s * 0.27 + dx, L + 0.06, 0.53], flat: true });
      b.spike([s * 0.27 + dx, L + 0.035, 0.53], [0, -0.15, 1], 0.12, 0.022, { color: CLAW, bone: hand });
    }
  }

  // ---------- hind legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.24, L + 0.44, -0.26], [s * 0.25, L + 0.06, -0.1], [0.34, 0.34], [[0, 0.3, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.25, 0, -0.05],
    });
    b.sweep(leg, [0.14, 0.085, 0.06], { color: STONE, sectors: [[130, 230, DARK]] });
    b.part(ico(0.17, 1), LIGHT, { bone: leg.joints[0], at: [s * 0.27, L + 0.4, -0.28], scale: [0.8, 1.05, 1.2], flat: true });
    b.spike(pts[1], [s * 0.5, 0.3, 1], 0.1, 0.035, { color: HORN, bone: leg.joints[1] });
    b.spike(pts[2], [0, 0.3, -1], 0.1, 0.03, { color: HORN, bone: leg.joints[1] });
    const foot = leg.tip!;
    b.part(bx(0.14, 0.07, 0.22), STONE, { bone: foot, at: [s * 0.25, L + 0.035, -0.02] });
    for (const dx of [-0.045, 0, 0.045]) {
      b.spike([s * 0.25 + dx, L + 0.035, 0.08], [0, -0.1, 1], 0.1, 0.022, { color: CLAW, bone: foot });
    }
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.2, L + 0.8, -0.05];
    const el: [number, number, number] = [s * 0.42, L + 1.12, -0.3];
    const wr: [number, number, number] = [s * 0.62, L + 1.32, -0.28];
    const wing = b.chain(`wing${S}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.06, 0.04, 0.035], { color: STONE });
    b.part(ico(0.09, 1), LIGHT, { bone: wing.joints[0], at: sh, flat: true });
    b.spike(wr, [s * 0.3, 1, 0.3], 0.14, 0.032, { color: HORN, bone: wing.joints[1] });

    const tips: [number, number, number][] = [
      [s * 1.0, L + 1.62, -0.5],
      [s * 1.0, L + 1.25, -0.75],
      [s * 0.78, L + 0.86, -0.8],
    ];
    const fingers = tips.map((tp, i) => {
      const f = b.chain(`wingFinger${i + 1}${S}`, polyline([wr, tp]), {
        parent: wing.tip!,
        names: [`wf${i + 1}${S}`, `wf${i + 1}${S}Tip`],
        role: "digit",
      });
      b.sweep(f, [0.032, 0.01], { color: WING_RIB, caps: "point" });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.025, scallop: 0.15 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.025, scallop: 0.15 });
    b.membrane(fingers[2], [wr, [s * 0.42, L + 0.75, -0.55], [s * 0.2, L + 0.55, -0.45]], {
      color: WING,
      thickness: 0.025,
      scallop: 0.12,
      bone: chest,
    });
  }

  // ---------- ledge ----------
  b.part(bx(1.5, 0.16, 2.0), STONE, { bone: hips, at: [0, 0.08, -0.2] });
  b.part(bx(1.62, 0.07, 2.12), LIGHT, { bone: hips, at: [0, 0.195, -0.2] });
  b.part(bx(1.3, 0.03, 1.8), DARK, { bone: hips, at: [0, 0.015, -0.2] });
  // block seams
  for (const x of [-0.5, 0.0, 0.5]) b.part(bx(0.012, 0.16, 0.01), SEAM, { bone: hips, at: [x, 0.08, 0.802] });
  for (const z of [-0.8, -0.3, 0.2, 0.6]) {
    b.part(bx(0.01, 0.16, 0.012), SEAM, { bone: hips, at: [0.752, 0.08, z] });
    b.part(bx(0.01, 0.16, 0.012), SEAM, { bone: hips, at: [-0.752, 0.08, z] });
  }
  for (const z of [-0.8, -0.3, 0.2, 0.6]) b.part(bx(1.62, 0.004, 0.01), SEAM, { bone: hips, at: [0, L + 0.001, z] });
  // quatrefoils on the front face
  for (const x of [-0.5, 0, 0.5]) {
    quatrefoil(new THREE.Vector3(x, 0.08, 0.8), new THREE.Vector3(0, 0, 1), 0.055, DARK, DEEP, hips);
  }
  // drip stains
  for (const x of [-0.65, -0.2, 0.3, 0.68]) {
    b.part(bx(0.04, 0.12 + r() * 0.05, 0.01), STAIN, { bone: hips, at: [x, 0.1, 0.806] });
  }
  // moss on the ledge
  for (let i = 0; i < 10; i++) {
    const x = (r() - 0.5) * 1.5;
    const z = -1.1 + r() * 1.9;
    b.part(new THREE.SphereGeometry(0.06 + r() * 0.06, 6, 4), i % 2 ? MOSS : MOSS_D, {
      bone: hips,
      at: [x, L - 0.004, z],
      scale: [1, 0.3, 1],
    });
  }
  for (const x of [-0.7, 0.55]) {
    b.part(new THREE.SphereGeometry(0.08, 6, 4), MOSS_D, { bone: hips, at: [x, 0.2, 0.84], scale: [1.4, 0.7, 0.5] });
  }

  // ---------- rest pose ----------
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
```