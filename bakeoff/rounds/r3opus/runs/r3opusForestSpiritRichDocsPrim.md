```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  limb,
  paint,
  mottle,
  spots,
  grain,
  noise,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Mossback Forest Spirit",
  description:
    "A small deer-like forest spirit: a river-stone body under soft moss, slender wooden legs on little hooves, flowering twig antlers, a pale carved wooden mask with glowing green eyes, and fireflies circling its head.",
};

// palette
const STONE = "#8d9398";
const STONE_D = "#686e74";
const STONE_L = "#b4b8b9";
const QUARTZ = "#e9e6dc";
const LICHEN = "#c9cf8a";
const MOSS = "#4f8a2f";
const MOSS_L = "#8cc24a";
const MOSS_D = "#35602a";
const WOOD = "#7a5634";
const WOOD_D = "#4a321e";
const ANTLER = "#a37d55";
const MASK = "#f1e6cc";
const MASK_D = "#d8c7a2";
const HOOF = "#2c2622";
const EYE = "#7dff5e";
const EYE_CORE = "#eaffdc";
const FLOWER = "#ffffff";
const FLOWER_C = "#ffd84a";
const LEAF = "#7cc24e";
const LEAF_D = "#3f7a2c";
const VINE = "#3d6a2a";
const FIREFLY = "#fff27a";
const BUG = "#2b2418";
const CAP_RED = "#c9452f";
const STEM = "#efe6d2";

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });

  // local deterministic random
  let seed = 98765;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const add = (p: THREE.Vector3, d: number[]) => p.clone().add(new THREE.Vector3(d[0], d[1], d[2]));

  // ---------- paints ----------
  const stoneBase = mottle(STONE, STONE_D, { size: 0.07, seed: 2 });
  const lichen = spots(stoneBase, LICHEN, { size: 0.05, amount: 0.12, seed: 5 });
  const stone = paint((p) => (Math.abs(noise(p, 0.16, 4) - 0.5) < 0.018 ? QUARTZ : lichen));
  const moss = mottle(MOSS, MOSS_L, { size: 0.035, seed: 3 });
  const stoneMoss = paint((p, n) => {
    const v = n.y + (noise(p, 0.06, 9) - 0.5) * 0.8;
    return v > 0.38 ? moss : v > 0.3 ? MOSS_D : stone;
  });
  const woodPaint = grain(WOOD, WOOD_D, { size: 0.01, axis: "y" });
  const antlerPaint = grain(ANTLER, WOOD_D, { size: 0.008, axis: "y" });
  const maskPaint = grain(MASK, MASK_D, { size: 0.012, axis: "z" });
  const leafPaint = paint((_p, _n, s) => (s[1] < 0.009 ? LEAF_D : LEAF));
  const capPaint = spots(CAP_RED, "#fff4e6", { size: 0.012, amount: 0.35, seed: 11 });

  // ---------- textures ----------
  const tuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M1 32 L5 11 L9 32Z" fill="#cfcfcf"/>
      <path d="M6 32 L12 2 L16 32Z" fill="#ffffff"/>
      <path d="M13 32 L19 6 L22 32Z" fill="#e4e4e4"/>
      <path d="M19 32 L26 12 L28 32Z" fill="#bdbdbd"/>
      <path d="M24 32 L30 17 L31 32Z" fill="#d6d6d6"/>
    </svg>`,
    { size: 64 },
  );
  const sparkTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16 1 L18 14 L31 16 L18 18 L16 31 L14 18 L1 16 L14 14Z" fill="#fff6a0"/>
      <circle cx="16" cy="16" r="4.5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const browTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 58 C18 44 18 22 32 6 C46 22 46 44 32 58Z" fill="none" stroke="#3fae4c" stroke-width="4"/>
      <path d="M32 54 L32 12" stroke="#3fae4c" stroke-width="3.5"/>
      <path d="M32 40 L23 31 M32 40 L41 31 M32 28 L25 21 M32 28 L39 21" stroke="#3fae4c" stroke-width="3"/>
      <circle cx="32" cy="62" r="0.1" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const cheekTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M8 4 L8 40" stroke="#4fc95a" stroke-width="5" stroke-linecap="round"/>
      <path d="M17 4 L17 56" stroke="#4fc95a" stroke-width="5" stroke-linecap="round"/>
      <path d="M26 4 L26 34" stroke="#4fc95a" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  function flower(c: THREE.Vector3, d: THREE.Vector3, bone: any, r: number) {
    const n = d.clone().normalize();
    b.ring(frame(c, n), { count: 5, radius: r, tilt: 18 }, (it) => {
      b.part(new THREE.SphereGeometry(r, 6, 3).scale(0.62, 1, 0.28), FLOWER, {
        at: it.at,
        dir: it.outward,
        up: n,
        bone,
      });
    });
    b.part(new THREE.SphereGeometry(r * 0.55, 6, 4), FLOWER_C, { at: c.clone().addScaledVector(n, r * 0.25), bone });
  }

  function leaf(at: THREE.Vector3, dir: THREE.Vector3, sz: number, bone: any, roll: number) {
    const y = dir.clone().normalize();
    const ref = Math.abs(y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const x = new THREE.Vector3().crossVectors(y, ref).normalize();
    x.applyAxisAngle(y, roll);
    const outline: OutlinePoint[] = [
      [0, 0, "sharp"],
      [0.38 * sz, 0.35 * sz],
      [0, sz, "sharp"],
      [-0.38 * sz, 0.35 * sz],
    ];
    b.extrude(outline, { at, x, y, thickness: 0.003, smoothing: 2, color: leafPaint, bone });
  }

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.55, -0.22], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.55, -0.22],
      [0, 0.58, 0.01],
      [0, 0.61, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];

  const H = new THREE.Vector3(0, 0.875, 0.37);
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.61, 0.22],
      [0, 0.75, 0.31],
      [H.x, H.y, H.z],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: H, dir: [0, -0.2, 1], role: "head", group: "head" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.57, -0.3],
      [0, 0.62, -0.4],
      [0, 0.665, -0.445],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---------- body: mossy river stone ----------
  const bodyPath = catmull([
    [0, 0.545, -0.36],
    [0, 0.56, -0.15],
    [0, 0.585, 0.08],
    [0, 0.61, 0.3],
  ]);
  const body = b.sweep(
    bodyPath,
    (t: number): [number, number] => {
      const k = Math.pow(Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)), 0.55);
      return [0.055 + 0.125 * k, 0.045 + 0.1 * k];
    },
    { bone: spine, color: stoneMoss, sides: 12, name: "body" },
  );
  const neckSweep = b.sweep(neck, [0.075, 0.062, 0.052], { color: stoneMoss, sides: 10, name: "neck" });
  const tailSweep = b.sweep(tail, [0.045, 0.036, 0.02], { color: moss, sides: 8, name: "tail" });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    {
      const root = new THREE.Vector3(s * 0.08, 0.5, 0.17);
      const target = new THREE.Vector3(s * 0.08, 0.04, 0.2);
      const pts = limb(root, target, [0.17, 0.16, 0.15], [
        [0, 0, -1],
        [0, 0, 1],
      ]);
      const leg = b.chain(`legF${S}`, pts, {
        parent: chest,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hoofF${S}`],
        role: "leg",
        contact: [target.x, 0, target.z],
      });
      b.sweep(leg, [0.034, 0.024, 0.019, 0.016], { color: woodPaint, sides: 7, name: `legF${S}` });
      const tip = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.017, 0.023, 0.04, 7), HOOF, { bone: tip, at: [target.x, 0.02, target.z], flat: true });
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 7), WOOD_D, { bone: tip, at: [target.x, 0.043, target.z] });
      b.part(new THREE.SphereGeometry(0.022, 7, 5), woodPaint, { bone: leg.joints[1], at: leg.joints[1].at });
      b.part(new THREE.SphereGeometry(0.02, 7, 5), woodPaint, { bone: leg.joints[2], at: leg.joints[2].at });
      leaf(leg.joints[1].at.clone(), new THREE.Vector3(s * 0.8, 0.5, -0.2), 0.035, leg.joints[1], rand() * 2);
    }
    // hind
    {
      const root = new THREE.Vector3(s * 0.09, 0.49, -0.24);
      const target = new THREE.Vector3(s * 0.09, 0.04, -0.27);
      const pts = limb(root, target, [0.18, 0.17, 0.13], [
        [0, 0, 1],
        [0, 0, -1],
      ]);
      const leg = b.chain(`legH${S}`, pts, {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `hock${S}`, `hoofH${S}`],
        role: "leg",
        contact: [target.x, 0, target.z],
      });
      b.sweep(leg, [0.042, 0.026, 0.019, 0.016], { color: woodPaint, sides: 7, name: `legH${S}` });
      const tip = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.017, 0.023, 0.04, 7), HOOF, { bone: tip, at: [target.x, 0.02, target.z], flat: true });
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 7), WOOD_D, { bone: tip, at: [target.x, 0.043, target.z] });
      b.part(new THREE.SphereGeometry(0.023, 7, 5), woodPaint, { bone: leg.joints[1], at: leg.joints[1].at });
      b.part(new THREE.SphereGeometry(0.02, 7, 5), woodPaint, { bone: leg.joints[2], at: leg.joints[2].at });
      leaf(leg.joints[2].at.clone(), new THREE.Vector3(s * 0.7, 0.6, -0.3), 0.03, leg.joints[2], rand() * 2);
    }
  }

  // ---------- head ----------
  const C = head.local({ up: 0.015, back: 0.02 });
  const cranium = b.part(new THREE.SphereGeometry(0.085, 10, 8), stoneMoss, { bone: head, at: C, name: "cranium" });

  const mask = b.loft(
    [
      { at: head.local({ forward: 0.02, up: 0.005 }), w: 0.15, h: 0.14 },
      { at: head.local({ forward: 0.09, down: 0.025 }), w: 0.12, h: 0.1 },
      { at: head.local({ forward: 0.16, down: 0.055 }), w: 0.07, h: 0.06 },
    ],
    { bone: head, color: maskPaint, sides: 8, name: "mask" },
  );
  const maskSurf = b.surface(mask);

  // nose
  b.part(new THREE.SphereGeometry(0.014, 7, 5), "#3b2a20", { bone: head, at: head.local({ forward: 0.19, down: 0.05 }) });

  // jaw
  const jawTip = head.local({ forward: 0.16, down: 0.085 });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.03, down: 0.055 }), aim: jawTip, role: "jaw" });
  b.capsule(jaw.at, jawTip, [0.032, 0.02], { bone: jaw, color: maskPaint, sides: 7, name: "jawLower" });

  // decals
  b.decal(mask, browTex, {
    at: head.local({ forward: 0.05, up: 0.06 }),
    dir: [0, 0.8, 0.6],
    size: [0.06, 0.06],
    bone: head,
  });

  // eyes
  for (const s of [1, -1]) {
    const from = head.local({ left: s * 0.042, up: 0.02, forward: 0.3 });
    const hit = maskSurf.ray(from, [0, 0, -1]) ?? maskSurf.nearest(head.local({ left: s * 0.042, up: 0.02, forward: 0.07 }));
    b.stick(new THREE.CylinderGeometry(0.026, 0.03, 0.01, 8).scale(1.3, 1, 0.85), WOOD_D, hit, { embed: 0.5, bone: head });
    const eye = hit.moved([0, 0.004, 0]);
    b.stick(new THREE.SphereGeometry(0.02, 8, 6).scale(1.25, 0.55, 0.8), EYE, eye, { bone: head });
    b.stick(new THREE.SphereGeometry(0.009, 6, 4).scale(1.2, 0.6, 0.8), EYE_CORE, hit.moved([0, 0.009, 0]), { bone: head });
    b.stick(new THREE.SphereGeometry(0.004, 5, 3), "#ffffff", hit.moved([s * -0.006, 0.011, 0.005]), { bone: head });
    b.decal(mask, cheekTex, {
      at: head.local({ left: s * 0.045, down: 0.02, forward: 0.1 }),
      dir: [s * 0.5, 0, 1],
      size: [0.025, 0.045],
      mirror: s > 0,
      bone: head,
    });
  }

  // leaf ears
  const earOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.035, 0.03],
    [0.028, 0.075],
    [0, 0.11, "sharp"],
    [-0.03, 0.07],
    [-0.032, 0.025],
  ];
  const earPaint = paint((_p, _n, s) => (Math.abs(s[0]) < 0.003 && s[1] > 0.01 ? LEAF_D : s[1] < 0.025 ? MOSS_D : LEAF));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earAt = head.local({ left: s * 0.072, up: 0.03, back: 0.012 });
    const ey = new THREE.Vector3(s, 0.5, -0.2).normalize();
    const ex = new THREE.Vector3().crossVectors(ey, new THREE.Vector3(0, 0, 1)).normalize();
    const ear = b.joint(`ear${S}`, { parent: head, at: earAt, dir: ey, role: "hinge" });
    b.extrude(earOutline, { at: earAt, x: ex, y: ey, thickness: 0.008, bevel: 0.002, smoothing: 2, color: earPaint, bone: ear });
  }

  // antlers
  const crSurf = b.surface(cranium);
  for (const s of [1, -1]) {
    const base = add(C, [s * 0.03, 0.068, -0.005]);
    b.stick(new THREE.CylinderGeometry(0.019, 0.022, 0.012, 8), WOOD_D, crSurf.nearest(base), { bone: head });
    const beam = bezier(
      base,
      add(base, [s * 0.05, 0.09, -0.035]),
      add(base, [s * 0.12, 0.16, -0.02]),
      add(base, [s * 0.1, 0.27, 0.03]),
    );
    b.sweep(beam, [0.013, 0.004], { bone: head, color: antlerPaint, sides: 6, caps: { start: "flat", end: "round" } });
    const tines = [
      { t: 0.32, d: [s * 0.25, 0.55, 0.8], L: 0.075 },
      { t: 0.58, d: [s * 0.95, 0.45, -0.25], L: 0.07 },
      { t: 0.8, d: [-s * 0.35, 0.75, 0.45], L: 0.06 },
    ];
    tines.forEach((tn, i) => {
      const p0 = beam.at(tn.t);
      const dn = new THREE.Vector3(tn.d[0], tn.d[1], tn.d[2]).normalize();
      const mid = p0.clone().addScaledVector(dn, tn.L * 0.5).add(new THREE.Vector3(0, 0.008, 0));
      const end = p0.clone().addScaledVector(dn, tn.L).add(new THREE.Vector3(0, 0.018, 0));
      b.sweep(bezier(p0, mid, end), [0.0075, 0.0028], { bone: head, color: antlerPaint, sides: 5, caps: { start: "flat", end: "round" } });
      flower(end, end.clone().sub(mid), head, 0.0075);
      leaf(mid, new THREE.Vector3(s * 0.4, 0.3, i % 2 ? 0.8 : -0.8), 0.026, head, rand() * 2);
      if (i === 1) {
        const q0 = mid.clone();
        const q1 = add(q0, [s * 0.015, 0.035, 0.02]);
        b.sweep([q0, q1], [0.004, 0.002], { bone: head, color: antlerPaint, sides: 5 });
        b.part(new THREE.SphereGeometry(0.006, 6, 4), "#ffe3ec", { bone: head, at: q1 });
      }
    });
    const tip = beam.at(1);
    const tdir = beam.tangentAt(1);
    flower(tip.clone().addScaledVector(tdir, 0.004), tdir, head, 0.009);
    for (const tt of [0.15, 0.48]) {
      leaf(beam.at(tt), new THREE.Vector3(s * 0.6, 0.35, tt < 0.3 ? 0.7 : -0.7), 0.032, head, rand() * 2);
    }
    leaf(beam.at(0.93), new THREE.Vector3(s * 0.7, 0.4, -0.5), 0.024, head, rand() * 2);
    leaf(beam.at(0.9), new THREE.Vector3(-s * 0.3, 0.3, 0.8), 0.022, head, rand() * 2);
  }

  // ---------- neck garland ----------
  const nc = neck.at(0.5).at.clone();
  const vine = b.surface(neckSweep).loop(neck.at(0.5), { lift: 0.006 });
  b.sweep(vine, 0.006, { color: VINE, sides: 5, name: "garland" });
  let gi = 0;
  b.along(vine, 9, (at) => {
    const out = at.at.clone().sub(nc).normalize();
    out.y -= 0.7;
    const bone = at.bone ?? neck.joints[0];
    if (gi % 3 === 1) flower(at.at.clone(), at.at.clone().sub(nc), bone, 0.008);
    else leaf(at.at.clone(), out, 0.034, bone, rand() * 2);
    gi++;
  });

  // ---------- back details: mushrooms, pebbles, flowers ----------
  const shrooms: [number, number, number][] = [
    [0.27, 22, 1],
    [0.33, 2, 0.7],
    [0.62, -28, 0.8],
  ];
  for (const [t, deg, k] of shrooms) {
    const pt = body.at(t, deg);
    b.stick(new THREE.CylinderGeometry(0.006 * k, 0.008 * k, 0.03 * k, 6), STEM, pt);
    b.stick(new THREE.SphereGeometry(0.018 * k, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), capPaint, pt.moved([0, 0.022 * k, 0]), {
      embed: 0,
    });
  }
  for (const [t, deg] of [
    [0.45, 40],
    [0.18, -35],
    [0.75, 15],
  ]) {
    b.stick(new THREE.IcosahedronGeometry(0.02, 0).scale(1.2, 0.5, 1), STONE_L, body.at(t, deg), { flat: true, embed: 0.4 });
  }
  for (const [t, deg] of [
    [0.52, -45],
    [0.38, 55],
    [0.82, -50],
    [0.12, 30],
  ]) {
    const pt = body.at(t, deg);
    flower(pt.at.clone().addScaledVector(pt.n, 0.006), pt.n.clone(), pt.bone ?? spine.joints[0], 0.007);
  }

  // ---------- moss tufts ----------
  const mossy = b.surface([body, neckSweep, cranium, tailSweep]);
  const tuftHits = mossy.scatter(170, { rng: rng(7), minDist: 0.022, filter: (h) => h.n.y > 0.55 });
  b.cards(tuftHits, tuftTex, { size: [0.03, 0.03], lean: 20, bend: 15, vary: 0.35, rng: rng(4), color: moss, cross: true });

  // ---------- fireflies ----------
  const ff = b.joint("fireflies", { parent: head, at: head.local({ up: 0.1 }), dir: [0, 1, 0] });
  const sparkFrames = [];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + rand() * 0.5;
    const r = 0.2 + rand() * 0.07;
    const p = new THREE.Vector3(ff.at.x + Math.sin(ang) * r, ff.at.y - 0.06 + rand() * 0.2, ff.at.z + Math.cos(ang) * r);
    b.part(new THREE.SphereGeometry(0.006, 6, 4), BUG, { bone: ff, at: p });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), FIREFLY, { bone: ff, at: add(p, [0, -0.005, -0.006]) });
    b.part(new THREE.SphereGeometry(0.006, 5, 3).scale(1.4, 0.3, 0.8), "#e8f4ff", { bone: ff, at: add(p, [0.006, 0.005, 0]) });
    b.part(new THREE.SphereGeometry(0.006, 5, 3).scale(1.4, 0.3, 0.8), "#e8f4ff", { bone: ff, at: add(p, [-0.006, 0.005, 0]) });
    sparkFrames.push(frame(add(p, [0, -0.022, -0.006]), [0, 1, 0]));
  }
  b.cards(sparkFrames, sparkTex, { size: 0.045, cross: true, sink: 0, bone: ff });

  return b.root;
}
```