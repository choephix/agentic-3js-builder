```ts
import * as THREE from "three";
import { createBuilder, rng, frame, limb, catmull, paint, mix, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A 4.3 m walking tree guardian: a gnarled bark body with a moss mantle, root feet, branch fingers, a glowing amber heart-rune and eyes, a mossy beard and a leafy antler crown.",
};

const BARK = "#6b4a2e";
const BARK_D = "#3a261a";
const BARK_L = "#8d6a42";
const MOSS = "#5f8a2e";
const MOSS_D = "#3d5f22";
const AMBER = "#ffb23a";
const LEAVES = ["#4f9a34", "#6dbb3c", "#3a7a2c", "#8fc94a", "#c9a23a"];
const SHROOM = "#d9622b";
const CREAM = "#f1dfb4";
const ROOTC = "#4a3220";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const BARKP = paint((p, n) => {
  const g = noise(new THREE.Vector3(p.x * 5, p.y * 0.5, p.z * 5), 0.25, 3);
  const crack = noise(new THREE.Vector3(p.x * 4, p.y * 0.4, p.z * 4), 0.12, 7);
  let c = mix(BARK_D, BARK, 0.25 + g * 0.8);
  if (crack > 0.66) c = mix(c, "#1e120a", 0.8);
  else if (crack < 0.3) c = mix(c, BARK_L, 0.35);
  if (n.y > 0.3 && noise(p, 0.28, 5) > 0.42) c = mix(c, MOSS, 0.85);
  else if (n.y > 0.0 && noise(p, 0.18, 9) > 0.62) c = mix(c, MOSS_D, 0.7);
  if (p.y < 0.5) c = mix(c, "#2c1f14", 0.4);
  return c;
});
const ROOTP = paint((p, n) => {
  const g = noise(new THREE.Vector3(p.x * 4, p.y, p.z * 4), 0.2, 11);
  const c = mix(ROOTC, BARK, g * 0.7);
  return n.y > 0.5 && noise(p, 0.2, 4) > 0.5 ? mix(c, MOSS_D, 0.7) : c;
});

const LEAF = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f6a24"/><stop offset="1" stop-color="#8fd04a"/></linearGradient></defs>
  <path d="M20 63 C2 46 2 18 20 1 C38 18 38 46 20 63Z" fill="url(#g)" stroke="#264f1c" stroke-width="2"/>
  <path d="M20 60 L20 8 M20 44 L10 34 M20 34 L30 24 M20 24 L11 16" stroke="#c6ef8a" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const MOSSCARD = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0 C24 14 31 40 27 64 L5 64 C1 40 8 14 16 0Z" fill="#5f8a2e"/>
  <path d="M16 6 C18 26 19 44 16 64 M9 26 C10 42 10 54 9 64 M23 28 C22 44 22 54 23 64" stroke="#9cc455" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="e" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#fff4c0"/><stop offset="0.5" stop-color="#ffb23a"/><stop offset="1" stop-color="#c4600f"/></radialGradient></defs>
  <path d="M2 24 Q32 -6 62 14 Q36 40 2 24Z" fill="url(#e)" stroke="#2a1608" stroke-width="3"/>
  <ellipse cx="34" cy="19" rx="4" ry="9" fill="#3a1a05"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="#2a1406" stroke="#ffb23a" stroke-width="4"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#ffd37a" stroke-width="2"/>
  <path d="M32 10 L32 54 M32 24 L18 14 M32 24 L46 14 M32 38 L20 30 M32 38 L44 30 M32 48 L24 54 M32 48 L40 54" stroke="#ffb23a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="4" fill="#fff4c0"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "treant", paintSize: 2048 });
  const R = rng(7);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.9, 0], role: "spine" });
  const spine = b.chain("spine", catmull([V(0, 1.9, 0), V(0, 2.3, 0.04), V(0, 2.7, 0.1), V(0, 3.05, 0.12)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 3.05, 0.12], aim: [0, 3.2, 0.25], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.2, 0.25], aim: [0, 3.5, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.38, 0.3], aim: [0, 3.3, 0.7], role: "jaw" });

  const legs: any[] = [];
  const arms: any[] = [];
  const wrists: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const lp = limb([s * 0.38, 1.85, 0], [s * 0.45, 0.3, 0.1], [0.95, 0.9], [0, 0, 1]);
    legs.push(
      b.chain(`leg${L}`, catmull(lp), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" }),
    );
    const ap = limb([s * 0.8, 2.95, 0], [s * 1.3, 1.4, 0.5], [1.0, 0.95], [0, 0, -1]);
    wrists.push(ap[2]);
    arms.push(
      b.chain(`arm${L}`, catmull(ap), {
        parent: chest,
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
        role: "arm",
      }),
    );
  }

  // ---------------- torso
  const torso = b.sweep(spine, (t) => [0.52 + 0.2 * Math.sin(Math.min(1, t * 1.1) * 2.4) + 0.08 * t, 0.44 + 0.1 * t], {
    color: BARKP,
    sides: 10,
    caps: "round",
  });
  const tsurf = b.surface(torso);
  // hip girdle of root knots
  b.sweep(catmull(ringPts(V(0, 2.0, 0), 0.62, 12), { closed: true } as any), 0.1, { bone: hips, color: ROOTP, sides: 6 });
  // heart rune
  const hit = tsurf.ray([0, 2.55, 3], [0, 0, -1]);
  const rp = hit ? hit.at.clone().addScaledVector(hit.n, 0.02) : V(0, 2.55, 0.6);
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), BARK_D, { bone: chest, at: rp.clone().add(V(0, 0, -0.01)), dir: [0, 0, 1] });
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", {
      bone: chest,
      at: rp.clone().add(V(0, 0, 0.035)),
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.4,
  );
  // moss mantle cards on torso top
  b.cards(tsurf.scatter(70, { rng: R, minDist: 0.1, filter: (h) => h.n.y > 0.2 || h.at.y > 2.9 }), MOSSCARD, {
    size: [0.12, 0.22],
    lean: 70,
    bend: 20,
    flow: [0, -0.4, 1],
    vary: 0.3,
    rng: R,
    bone: chest,
  });
  // bark plates on belly
  for (let i = 0; i < 5; i++) {
    const a = ((i - 2) * 0.5);
    b.part(new THREE.BoxGeometry(0.4, 0.3, 0.1), BARK_L, {
      bone: spine.joints[1],
      at: [Math.sin(a) * 0.62, 2.2 + (i % 2) * 0.15, Math.cos(a) * 0.5],
      rotation: [0, (a * 180) / Math.PI, 0],
      flat: true,
    });
  }
  // back hump with branches
  b.part(new THREE.SphereGeometry(0.55, 9, 7), BARKP, { bone: chest, at: [0, 3.0, -0.35], scale: [1.1, 0.7, 0.9] });

  // neck
  b.sweep(catmull([V(0, 3.0, 0.1), V(0, 3.15, 0.2), V(0, 3.3, 0.28)]), 0.3, { bone: neck, color: BARKP, sides: 8 });

  // ---------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BARKP, { bone: head, at: [0, 3.5, 0.3], scale: [0.4, 0.42, 0.4] });
  // brow and cheek ridges
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), BARK_D, {
      bone: head,
      at: [s * 0.17, 3.67, 0.55],
      scale: [0.2, 0.07, 0.15],
      rotation: [0, 0, -s * 14],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BARKP, { bone: head, at: [s * 0.3, 3.4, 0.45], scale: [0.14, 0.16, 0.14] });
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.125), "#ffffff", {
        bone: head,
        at: [s * 0.165, 3.55, 0.665],
        dir: [s * 0.25, -0.04, 1],
        axis: "z",
        texture: EYE,
      }),
      1.6,
    );
    // ear knot
    b.part(new THREE.ConeGeometry(0.1, 0.25, 6), BARK, { bone: head, at: [s * 0.42, 3.55, 0.25], rotation: [0, 0, -s * 70] });
  }
  // long root nose
  b.part(new THREE.ConeGeometry(0.1, 0.4, 6), BARK, { bone: head, at: [0, 3.42, 0.72], rotation: [105, 0, 0] });
  // upper lip / mouth cavity
  b.part(new THREE.BoxGeometry(0.4, 0.07, 0.22), "#1a0e07", { bone: head, at: [0, 3.3, 0.58] });
  // jaw
  b.part(new THREE.SphereGeometry(1, 10, 7), BARKP, { bone: jaw, at: [0, 3.2, 0.48], scale: [0.3, 0.13, 0.27] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.04, 0.16, 5), CREAM, { bone: jaw, at: [s * 0.14, 3.34, 0.66] });
    b.part(new THREE.ConeGeometry(0.035, 0.12, 5), CREAM, { bone: head, at: [s * 0.11, 3.26, 0.64], rotation: [180, 0, 0] });
  }
  const jawBall = b.part(new THREE.SphereGeometry(0.28, 8, 6), MOSS_D, { bone: jaw, at: [0, 3.1, 0.45], scale: [0.9, 0.7, 0.9] });
  b.cards(b.surface(jawBall).scatter(34, { rng: R, minDist: 0.05, filter: (h) => h.n.y < 0.3 }), MOSSCARD, {
    size: [0.1, 0.34],
    lean: 150,
    flow: [0, -1, 0.3],
    vary: 0.3,
    rng: R,
    bone: jaw,
  });
  // moss on skull top
  b.cards(b.surface(skull).scatter(30, { rng: R, minDist: 0.08, filter: (h) => h.n.y > 0.4 }), MOSSCARD, {
    size: [0.1, 0.2],
    lean: 60,
    flow: [0, 0.2, -1],
    rng: R,
    bone: head,
  });

  // ---------------- crown of branches
  const clump = (c: THREE.Vector3, r: number, bone: any, ci: number) => {
    const pt = b.part(new THREE.IcosahedronGeometry(r, 0), LEAVES[ci % LEAVES.length], { bone, at: c, flat: true });
    b.part(new THREE.IcosahedronGeometry(r * 0.7, 0), LEAVES[(ci + 2) % LEAVES.length], {
      bone,
      at: c.clone().add(V(r * 0.5, r * 0.4, -r * 0.3)),
      flat: true,
    });
    b.cards(b.surface(pt).scatter(10, { rng: R, minDist: r * 0.5, filter: (h) => h.n.y > -0.4 }), LEAF, {
      size: [r * 0.9, r * 1.2],
      lean: 55,
      flow: [0, -0.2, 1],
      vary: 0.3,
      rng: R,
      bone,
    });
  };
  const branch = (name: string, pts: THREE.Vector3[], parent: any, r0: number, leafy: number) => {
    const ch = b.chain(name, catmull(pts), { parent, count: 3, names: (k: number) => `${name}${k + 1}`, role: "tentacle" });
    b.sweep(ch, (t) => r0 * (1 - 0.8 * t) + 0.02, { color: BARKP, sides: 6, caps: { end: "round" } as any });
    const e = pts[pts.length - 1];
    if (leafy) clump(e, 0.2 + leafy * 0.06, ch.joints[2], Math.floor(R() * 5));
    return ch;
  };
  let bi = 0;
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const top = branch(`antler${L}1`, [V(s * 0.2, 3.8, 0.25), V(s * 0.4, 4.1, 0.15), V(s * 0.65, 4.35, 0.05), V(s * 0.85, 4.65, -0.05)], head, 0.11, 2);
    branch(`antler${L}2`, [V(s * 0.38, 4.1, 0.15), V(s * 0.6, 4.2, 0.35), V(s * 0.85, 4.25, 0.5), V(s * 1.0, 4.4, 0.55)], top.joints[0], 0.07, 1);
    branch(`antler${L}3`, [V(s * 0.5, 4.25, 0.1), V(s * 0.8, 4.45, -0.1), V(s * 1.05, 4.6, -0.25), V(s * 1.25, 4.85, -0.3)], top.joints[1], 0.06, 2);
    branch(`shoulderBranch${L}`, [V(s * 1.0, 3.2, -0.1), V(s * 1.3, 3.6, -0.2), V(s * 1.6, 3.8, -0.3), V(s * 1.85, 4.1, -0.35)], chest, 0.14, 3);
    branch(`backBranch${L}`, [V(s * 0.3, 3.1, -0.55), V(s * 0.5, 3.7, -0.7), V(s * 0.6, 4.2, -0.75), V(s * 0.55, 4.6, -0.7)], chest, 0.15, 3);
    bi++;
    // pauldron
    const pd = b.part(new THREE.SphereGeometry(1, 9, 7), BARKP, { bone: chest, at: [s * 0.88, 3.0, 0], scale: [0.5, 0.34, 0.46] });
    b.cards(b.surface(pd).scatter(26, { rng: R, minDist: 0.08, filter: (h) => h.n.y > 0.1 }), MOSSCARD, {
      size: [0.1, 0.2],
      lean: 70,
      flow: [s, -0.3, 0.2],
      vary: 0.3,
      rng: R,
      bone: chest,
    });
    // shelf mushrooms
    for (const [k, y] of [[0, 3.12], [1, 2.95]] as const) {
      b.part(new THREE.CylinderGeometry(0.2 - k * 0.05, 0.14 - k * 0.04, 0.06, 8), SHROOM, {
        bone: chest,
        at: [s * (1.12 + k * 0.08), y, 0.12 + k * 0.1],
        rotation: [0, 0, -s * 25],
      });
      b.part(new THREE.CylinderGeometry(0.16 - k * 0.05, 0.1, 0.02, 8), CREAM, {
        bone: chest,
        at: [s * (1.13 + k * 0.08), y - 0.04, 0.12 + k * 0.1],
        rotation: [0, 0, -s * 25],
      });
    }
  }
  branch("crownTop", [V(0, 3.9, 0.0), V(0, 4.2, -0.1), V(0.05, 4.5, -0.2), V(0, 4.75, -0.2)], head, 0.1, 3);

  // ---------------- legs
  for (const [i, ch] of legs.entries()) {
    const s = i === 0 ? 1 : -1;
    const L = s > 0 ? "L" : "R";
    b.sweep(ch, (t) => 0.36 - 0.14 * t + 0.04 * Math.sin(t * 9), { color: BARKP, sides: 9, caps: "round" });
    const ankle = ch.joints[2];
    // knee burl and root bands
    const kp = ch.at(0.5).at;
    b.part(new THREE.SphereGeometry(0.28, 8, 6), BARKP, { bone: ch.joints[1], at: [kp.x, kp.y, kp.z + 0.12], scale: [1, 0.9, 0.8] });
    // foot mass
    b.part(new THREE.SphereGeometry(0.38, 9, 6), ROOTP, { bone: ankle, at: [s * 0.45, 0.17, 0.12], scale: [1, 0.46, 1.25] });
    // root toes
    for (const [j, dx] of [-0.3, 0, 0.3].entries()) {
      const x0 = s * 0.45;
      const toe = b.chain(
        `toe${L}${j + 1}`,
        catmull([V(x0 + dx * 0.3, 0.14, 0.25), V(x0 + dx * 0.9, 0.11, 0.55), V(x0 + dx * 1.5, 0.08, 0.85)]),
        { parent: ankle, names: [`toe${L}${j + 1}a`, `toe${L}${j + 1}b`, `toe${L}${j + 1}c`], role: "digit" },
      );
      b.sweep(toe, (t) => 0.12 - 0.07 * t, { color: ROOTP, sides: 6, caps: { end: "point" } as any });
    }
    // heel root
    b.sweep(catmull([V(s * 0.45, 0.2, -0.2), V(s * 0.5, 0.12, -0.55), V(s * 0.55, 0.06, -0.8)]), [0.14, 0.04], {
      bone: ankle,
      color: ROOTP,
      sides: 6,
      caps: { end: "point" } as any,
    });
  }

  // ---------------- arms and branch hands
  for (const [i, ch] of arms.entries()) {
    const s = i === 0 ? 1 : -1;
    const L = s > 0 ? "L" : "R";
    b.sweep(ch, (t) => 0.3 - 0.1 * t + 0.05 * Math.sin(t * 7), { color: BARKP, sides: 9, caps: "round" });
    const wr = wrists[i];
    const wj = ch.joints[2];
    b.part(new THREE.SphereGeometry(0.26, 8, 6), BARKP, { bone: ch.joints[1], at: ch.at(0.5).at, scale: [1, 0.9, 1] });
    b.part(new THREE.SphereGeometry(0.22, 8, 6), BARKP, { bone: wj, at: [wr.x, wr.y - 0.1, wr.z + 0.05], scale: [1, 0.8, 0.8] });
    // moss on forearm
    b.cards(b.surface(b.part(new THREE.SphereGeometry(0.2, 7, 5), MOSS_D, { bone: ch.joints[1], at: ch.at(0.25).at, scale: [1.1, 0.6, 1.1] })).scatter(10, { rng: R, minDist: 0.08 }), MOSSCARD, {
      size: [0.08, 0.16],
      lean: 70,
      flow: [0, -1, 0],
      rng: R,
      bone: ch.joints[1],
    });
    for (const [j, dx] of [-0.15, -0.05, 0.05, 0.15].entries()) {
      const fx = wr.x + dx * s * 1.2;
      const f = b.chain(
        `finger${L}${j + 1}`,
        catmull([V(fx, wr.y - 0.18, wr.z + 0.05), V(fx + dx * s * 0.8, wr.y - 0.5, wr.z + 0.16), V(fx + dx * s * 1.6, wr.y - 0.78, wr.z + 0.3)]),
        { parent: wj, names: [`finger${L}${j + 1}a`, `finger${L}${j + 1}b`, `finger${L}${j + 1}c`], role: "digit" },
      );
      b.sweep(f, (t) => 0.075 - 0.05 * t, { color: BARKP, sides: 6, caps: { end: "point" } as any });
    }
    const th = b.chain(
      `thumb${L}`,
      catmull([V(wr.x - s * 0.15, wr.y - 0.12, wr.z + 0.12), V(wr.x - s * 0.3, wr.y - 0.28, wr.z + 0.25), V(wr.x - s * 0.36, wr.y - 0.45, wr.z + 0.4)]),
      { parent: wj, names: [`thumb${L}a`, `thumb${L}b`, `thumb${L}c`], role: "digit" },
    );
    b.sweep(th, (t) => 0.08 - 0.05 * t, { color: BARKP, sides: 6, caps: { end: "point" } as any });
  }
  // small branch growing from left forearm with fireflies
  const fl = arms[0];
  const fp = fl.at(0.6).at;
  branch("forearmTwig", [V(fp.x + 0.15, fp.y, fp.z), V(fp.x + 0.4, fp.y + 0.15, fp.z - 0.1), V(fp.x + 0.6, fp.y + 0.4, fp.z - 0.1)], fl.joints[1], 0.07, 1);
  for (const p of [V(1.7, 2.3, 0.4), V(0.9, 4.0, 0.7), V(-1.5, 3.4, 0.5), V(-1.0, 2.0, 0.7), V(1.3, 3.6, 0.4)]) {
    glow(b.part(new THREE.OctahedronGeometry(0.035, 0), AMBER, { bone: chest, at: p, flat: true }), 1.6);
  }

  // dangling roots at waist
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const x = Math.sin(a) * 0.6;
    const z = Math.cos(a) * 0.5;
    b.sweep(catmull([V(x, 1.95, z), V(x * 1.25, 1.55, z * 1.25), V(x * 1.4, 1.2 + (i % 3) * 0.1, z * 1.35)]), [0.07, 0.015], {
      bone: hips,
      color: ROOTP,
      sides: 5,
      caps: { end: "point" } as any,
    });
  }

  return b.root;
}

function ringPts(c: THREE.Vector3, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return V(c.x + Math.sin(a) * r, c.y, c.z + Math.cos(a) * r * 0.82);
  });
}
```