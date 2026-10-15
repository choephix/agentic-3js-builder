import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { countershade, scales } from "../../../../src/paint";
import { bezier, catmull, spiral } from "../../../../src/path";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled hooved chimera with golden antlers, a swirling cloud mane and a cloud-puff tail, dressed in gold scrollwork and jade pendants.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Palette: every surface is a cel paint (lit tone + hue-shifted shadow tone).
const JADESC = cel(scales(["#4f9d7b", "#5aa985", "#48906f"], "#2b6753", { size: 0.055, width: 0.14 }));
const CREAMSC = cel(scales(["#fff3d6", "#fbe9c4"], "#e2cc9c", { size: 0.06, width: 0.1 }));
const DARKSC = cel(scales(["#2c5c63", "#336a70"], "#1a3a42", { size: 0.05, width: 0.14 }));
const BODY = countershade(JADESC, CREAMSC, { level: -0.35, soft: 0.2 });
const GOLDP = cel("#f2c24f", "#b8802a");
const CREAMP = cel("#fff2d4");
const GREENP = cel("#5aa98a");
const TEALP = cel("#245560");
const HEADP = furEdge(cel("#5aa98a"), cel("#fff0cf"), {
  axis: [0, 1, 0],
  level: -0.15,
  teeth: 0.3,
  period: 0.035,
  along: [1, 0, 0],
});

const SWIRL = (stroke: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><path d="M32 33 C30 29 37 27 39 32 C42 40 30 45 26 38 C20 28 30 17 40 20 C52 24 52 42 42 48" stroke="${stroke}" stroke-width="4.5" stroke-linecap="round" fill="none"/></svg>`,
    { size: 256 },
  );

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const SW_C = SWIRL("#d9c08c");
  const SW_G = SWIRL("#2e6b57");

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.4],
      [0, 1.02, -0.05],
      [0, 1.04, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.04, 0.3],
      [0, 1.2, 0.45],
      [0, 1.42, 0.58],
      [0, 1.62, 0.68],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3", "neck4"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.path.at(1), dir: [0, -0.18, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.045 }),
    aim: head.local({ forward: 0.3, down: 0.09 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.58],
      [0, 1.1, -0.8],
      [0, 1.24, -1.0],
      [0, 1.36, -1.16],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------------------------------------------------------------- body
  const keys = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const rxs = [0.1, 0.15, 0.19, 0.2, 0.2, 0.17];
  const rys = [0.13, 0.2, 0.24, 0.255, 0.25, 0.2];
  const bodyS = b.sweep(
    catmull([
      [0, 0.98, -0.58],
      [0, 1.0, -0.4],
      [0, 1.02, -0.05],
      [0, 1.04, 0.28],
      [0, 1.0, 0.4],
    ]),
    (t) => [interpolate(keys, rxs, t), interpolate(keys, rys, t)],
    { color: BODY, bone: [hips, spine], sides: 10, name: "body" },
  );
  const neckS = b.sweep(neck, (t) => [0.115 - 0.05 * t, 0.13 - 0.055 * t], {
    color: CREAMSC,
    sectors: [[-95, 95, JADESC]],
    sides: 8,
    name: "neck",
  });
  b.sweep(tail, [0.06, 0.03], { color: JADESC, sides: 6, name: "tailStem" });

  // ---------------------------------------------------------------- cloud puffs
  const puff = (c: THREE.Vector3, r: number, kind: "cream" | "green", squash = 1) => {
    const p = b.part(new THREE.SphereGeometry(1, 10, 7), kind === "cream" ? CREAMP : GREENP, {
      at: c,
      scale: [r, r * squash, r],
    });
    const sk = b.surface(p);
    for (const s of [1, -1])
      b.decal(sk, kind === "cream" ? SW_C : SW_G, {
        at: V(c.x + s * r, c.y, c.z),
        dir: [s, 0, 0],
        size: [r * 1.4, r * 1.4],
        segments: 6,
        mirror: s < 0,
      });
  };
  const tuft = (p: THREE.Vector3, r: number) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAMP, { at: p, scale: [r, r * 1.5, r * 0.8] });

  // mane down the neck
  for (let i = 0; i < 9; i++) {
    const t = 0.05 + i * 0.1;
    const cn = neck.path.at(t);
    const rn = 0.13 - 0.055 * t;
    const r = 0.105 - 0.03 * t;
    puff(cn.clone().add(V(0, rn * 0.55 + r * 0.45, -0.045)), r, i % 2 ? "green" : "cream");
    if (i % 2 === 0)
      for (const s of [1, -1])
        puff(cn.clone().add(V(s * (rn + 0.01), rn * 0.2, -0.06)), r * 0.7, i % 4 ? "cream" : "green");
  }
  // withers and back puffs
  for (const [z, y, r, k] of [
    [0.22, 1.3, 0.07, "green"],
    [0.05, 1.28, 0.055, "cream"],
    [-0.15, 1.27, 0.05, "green"],
    [-0.35, 1.25, 0.055, "cream"],
  ] as const)
    puff(V(0, y, z), r, k);
  // chest ruff
  for (const s of [1, -1]) puff(V(s * 0.1, 0.9, 0.48), 0.065, "cream");
  // cloud tail
  for (const [x, y, z, r, k] of [
    [0, 1.42, -1.2, 0.15, "cream"],
    [0.12, 1.55, -1.32, 0.14, "green"],
    [-0.12, 1.55, -1.32, 0.14, "green"],
    [0, 1.62, -1.38, 0.17, "cream"],
    [0.18, 1.4, -1.4, 0.13, "cream"],
    [-0.18, 1.4, -1.4, 0.13, "cream"],
    [0, 1.38, -1.5, 0.14, "green"],
    [0.1, 1.75, -1.35, 0.12, "cream"],
    [-0.1, 1.75, -1.35, 0.11, "green"],
    [0, 1.52, -1.55, 0.15, "cream"],
  ] as const)
    puff(V(x, y, z), r, k);

  // ---------------------------------------------------------------- legs
  const cuff = (a: THREE.Vector3, c: THREE.Vector3, t: number, r: number) =>
    b.part(new THREE.CylinderGeometry(r * 1.1, r * 1.18, 0.045, 8), GOLDP, {
      at: a.clone().lerp(c, t),
      dir: c.clone().sub(a),
    });

  const leg = (s: number, front: boolean) => {
    const S = s > 0 ? "L" : "R";
    const root = front ? [s * 0.15, 0.95, 0.28] : [s * 0.15, 0.98, -0.42];
    const target = front ? [s * 0.15, 0.09, 0.31] : [s * 0.15, 0.09, -0.5];
    const lens = front ? [0.36, 0.34, 0.28] : [0.4, 0.38, 0.3];
    const bends = front
      ? [
          [0, 0, -1],
          [0, 0, 1],
        ]
      : [
          [0, 0, 1],
          [0, 0, -1],
        ];
    const pts = limb(root, target, lens, bends);
    const names = front
      ? [`shoulder${S}`, `elbow${S}`, `carpus${S}`, `hoofF${S}`]
      : [`hip${S}`, `stifle${S}`, `hock${S}`, `hoofH${S}`];
    const ch = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
      parent: front ? spine : hips,
      names,
      role: "leg",
    });
    b.sweep(ch, front ? [0.1, 0.075, 0.055, 0.045, 0.04] : [0.115, 0.09, 0.06, 0.045, 0.04], {
      color: DARKSC,
      bands: [[0.55, JADESC]],
      sides: 8,
    });
    const tip = ch.joints[ch.joints.length - 1];
    const foot = pts[3];
    for (const k of [1, -1])
      b.part(new THREE.CylinderGeometry(0.03, 0.042, 0.1, 6), GOLDP, {
        at: V(foot.x + k * 0.026, foot.y - 0.045, foot.z + 0.012),
        scale: [1, 1, 1.4],
        bone: tip,
      });
    cuff(pts[2], pts[3], 0.08, 0.05);
    cuff(pts[2], pts[3], 0.85, 0.044);
    // gold greave diamond on the cannon
    b.part(new THREE.OctahedronGeometry(1, 0), GOLDP, {
      at: pts[2].clone().lerp(pts[3], 0.45).add(V(0, 0, 0.042)),
      scale: [0.02, 0.06, 0.012],
    });
    tuft(foot.clone().add(V(0, 0.03, -0.04)), 0.04);
    if (front) tuft(pts[1].clone().add(V(0, -0.02, -0.07)), 0.06);
    else tuft(pts[2].clone().add(V(0, 0.02, -0.06)), 0.05);
    return ch;
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, {
    at: head.local({ forward: 0.06 }),
    scale: [0.085, 0.09, 0.11],
    bone: head,
  });
  const muzzleA = head.local({ forward: 0.1 });
  const muzzleB = head.local({ forward: 0.32, down: 0.03 });
  b.sweep([muzzleA, muzzleB], (t) => [0.065 - 0.025 * t, 0.06 - 0.027 * t], {
    color: CREAMP,
    sectors: [[-75, 75, GREENP]],
    bone: head,
    sides: 8,
    name: "muzzle",
  });
  b.sweep([jaw.at, jaw.local({ forward: 0.25, down: 0.02 })], (t) => [0.04 - 0.012 * t, 0.028 - 0.008 * t], {
    color: CREAMP,
    bone: jaw,
    sides: 8,
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#46323f", {
    at: muzzleB.clone().add(V(0, 0.005, 0.01)),
    scale: [0.035, 0.026, 0.028],
    bone: head,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#241628", {
      at: head.local({ forward: 0.345, left: s * 0.022, up: 0.012 }),
      bone: head,
    });
  // beard
  b.spike(jaw.local({ forward: 0.2, down: 0.02 }), [0, -1, -0.3], 0.09, 0.02, { color: CREAMP, bone: jaw });

  // eyes
  const EYE = animeEye({ iris: "#d99a2e" });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 50, 6)!;
    b.decal(skin, EYE, { at: hit, size: [0.062, 0.085], mirror: s > 0 });
  }

  // ears and cheek fins
  const ear = [
    [-0.035, 0],
    [-0.045, 0.07],
    [0, 0.19, "sharp"],
    [0.045, 0.07],
    [0.035, 0],
  ] as Array<[number, number] | [number, number, "sharp"]>;
  const earIn = [
    [-0.022, 0.015],
    [-0.028, 0.07],
    [0, 0.15],
    [0.028, 0.07],
    [0.022, 0.015],
  ] as Array<[number, number]>;
  const fin = [
    [0, -0.03],
    [0.09, -0.05],
    [0.16, 0, "sharp"],
    [0.08, 0.045],
    [0, 0.03],
  ] as Array<[number, number] | [number, number, "sharp"]>;
  for (const s of [1, -1]) {
    const at = head.local({ left: s * 0.075, up: 0.06, forward: -0.03 });
    b.extrude(ear, { at, x: [0, 0, 1], y: [s * 0.8, 1, 0], thickness: 0.008, color: GREENP, bone: head });
    b.extrude(earIn, { at, x: [0, 0, 1], y: [s * 0.8, 1, 0], thickness: 0.013, color: cel("#e59a86"), bone: head });
    b.extrude(fin, {
      at: head.local({ left: s * 0.075, forward: -0.02 }),
      x: [s * 0.5, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      color: GREENP,
      bone: head,
    });
    puff(head.local({ left: s * 0.1, down: 0.03, forward: -0.01 }), 0.045, "cream");
    puff(head.local({ left: s * 0.085, up: 0.1, forward: -0.06 }), 0.04, "green");
    // whiskers
    b.sweep(
      bezier(
        head.local({ forward: 0.3, left: s * 0.035, down: 0.01 }),
        head.local({ forward: 0.38, left: s * 0.14, down: 0.08 }),
        head.local({ forward: 0.2, left: s * 0.26, down: 0.0 }),
      ),
      [0.008, 0.002],
      { color: GOLDP, bone: head, sides: 5, caps: "point" },
    );
  }
  puff(head.local({ up: 0.1, forward: -0.02 }), 0.05, "cream");

  // forehead gem
  const gemAt = head.local({ forward: 0.1, up: 0.082 });
  b.part(new THREE.TorusGeometry(0.024, 0.006, 5, 10), GOLDP, { at: gemAt, dir: [0, 1, 0.2], axis: "z", bone: head });
  glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), "#7ff0c8", { at: gemAt, bone: head }), 1);

  // ---------------------------------------------------------------- antlers
  const antler = (s: number) => {
    const L = (l: number, u: number, f: number) => head.local({ left: s * l, up: u, forward: f });
    const path = catmull([L(0.04, 0.08, -0.01), L(0.06, 0.2, -0.07), L(0.09, 0.32, -0.05), L(0.075, 0.43, 0.04)]);
    b.sweep(path, [0.03, 0.01], { color: GOLDP, bone: head, sides: 6, caps: { start: "flat", end: "point" } });
    const tine = (t: number, dx: number, dy: number, dz: number, r: number) => {
      const a = path.at(t);
      const tip = a.clone().add(V(s * dx, dy, dz));
      const m = a.clone().lerp(tip, 0.5).add(V(s * dx * 0.2, dy * 0.2, dz * 0.2));
      b.sweep(bezier(a, m, tip), [r, 0.003], { color: GOLDP, bone: head, sides: 5, caps: "point" });
    };
    tine(0.28, 0.03, 0.12, 0.12, 0.02);
    tine(0.55, 0.09, 0.09, -0.12, 0.018);
    tine(0.78, 0.04, 0.1, 0.1, 0.014);
    for (const t of [0.08, 0.2])
      b.part(new THREE.CylinderGeometry(0.036 - t * 0.05, 0.04 - t * 0.05, 0.028, 6), GOLDP, {
        at: path.at(t),
        dir: path.tangentAt(t),
        bone: head,
      });
  };
  antler(1);
  antler(-1);

  // ---------------------------------------------------------------- trim and pendants
  const neckLoop = b.surface(neckS).loop(frame(neck.path.at(0.1), neck.path.tangentAt(0.1)), { lift: 0.01 });
  b.sweep(neckLoop, 0.014, { color: GOLDP, sides: 6 });

  const girth = b.surface(bodyS).loop(frame([0, 1.0, 0.0], [0, 0, 1]), { lift: 0.012 });
  b.sweep(girth, 0.016, { color: GOLDP, sides: 6 });
  b.along(girth, 14, (at) => b.part(new THREE.SphereGeometry(0.015, 6, 4), GOLDP, { at }));

  const bodySkin = b.surface(bodyS);
  for (const s of [1, -1]) {
    const sash = bodySkin.drape(
      catmull([
        [s * 0.2, 1.27, 0.14],
        [s * 0.2, 1.12, 0.4],
        [s * 0.1, 0.95, 0.52],
        [0, 0.88, 0.54],
      ]),
      { lift: 0.012 },
    );
    b.sweep(sash, (t) => [0.028 - 0.01 * t, 0.01], { color: GOLDP, section: "box" });

    // shoulder and haunch scrolls
    for (const [cz, cy, rr] of [
      [0.22, 1.0, 0.12],
      [-0.3, 1.08, 0.1],
    ]) {
      const coil = spiral(V(s * 0.215, cy, cz), V(s * 0.215, cy + rr, cz), [s, 0, 0], {
        turns: -s * 1.1,
        r1: 0.035,
        pitch: 0,
      });
      b.sweep(coil, [0.016, 0.008], { color: GOLDP, sides: 6 });
    }
  }

  const tassel = (p: THREE.Vector3) => {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLDP, { at: p });
    b.part(new THREE.CylinderGeometry(0.012, 0.026, 0.12, 6), TEALP, { at: p.clone().add(V(0, -0.075, 0)) });
    b.part(new THREE.CylinderGeometry(0.027, 0.028, 0.012, 6), GOLDP, { at: p.clone().add(V(0, -0.135, 0)) });
  };
  const pendant = (at: THREE.Vector3, n: THREE.Vector3, r: number, tassels: number[]) => {
    const o = at.clone().addScaledVector(n, 0.012);
    b.part(new THREE.TorusGeometry(r, r * 0.2, 5, 14), GOLDP, { at: o, dir: n, axis: "z" });
    glow(b.part(new THREE.CylinderGeometry(r * 0.85, r * 0.85, 0.012, 12), "#4fb391", { at: o, dir: n }), 0.5);
    b.part(new THREE.SphereGeometry(r * 0.3, 6, 4), GOLDP, { at: o.clone().addScaledVector(n, 0.01) });
    for (const k of tassels) tassel(o.clone().add(V(k, -(r + 0.02), 0)).addScaledVector(n, 0.01));
  };
  const chest = bodySkin.ray([0, 0.85, 1.2], [0, 0, -1]);
  pendant(chest ? chest.at : V(0, 0.85, 0.55), chest ? chest.n : V(0, 0, 1), 0.05, [0]);
  for (const s of [1, -1]) {
    const flank = bodySkin.ray([s * 1, 0.92, -0.12], [-s, 0, 0]);
    pendant(flank ? flank.at : V(s * 0.2, 0.92, -0.12), flank ? flank.n : V(s, 0, 0), 0.045, [-0.02, 0.02]);
  }

  return b.root;
}
