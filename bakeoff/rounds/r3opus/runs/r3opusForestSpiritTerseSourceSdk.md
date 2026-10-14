```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, mottle, grain, noise, mix, spots, frame } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small woodland spirit: birch-pale mask head with glowing eyes, branching antlers tipped with leaves, a mossy bark body cloaked in leaves, twig fingers, root feet, mushrooms and a flowering vine belt.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- textures
  const leafA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><path d="M32 2 C60 30 60 82 32 126 C4 82 4 30 32 2Z" fill="#5f9e3a"/><path d="M32 20 C46 40 48 80 32 118 C40 80 40 44 32 20Z" fill="#7dbb4c"/><path d="M32 10 L32 124" stroke="#2c5419" stroke-width="3"/><path d="M32 42 L48 28 M32 64 L50 50 M32 86 L47 75 M32 42 L16 28 M32 64 L14 50 M32 86 L17 75" stroke="#3a6b22" stroke-width="2" fill="none"/></svg>`,
  );
  const leafB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><path d="M32 4 C54 24 62 70 32 126 C2 70 10 24 32 4Z" fill="#a7c548"/><path d="M32 30 C44 50 44 86 32 116 C26 86 24 52 32 30Z" fill="#c9d965"/><path d="M32 10 L32 124" stroke="#56701f" stroke-width="3"/><path d="M32 50 L46 38 M32 76 L46 64 M32 50 L18 38 M32 76 L18 64" stroke="#6b8a26" stroke-width="2" fill="none"/></svg>`,
  );
  const grass = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 64 C12 40 8 22 4 6 C16 24 20 44 22 64Z" fill="#4f8a2c"/><path d="M24 64 C28 36 30 18 34 2 C36 22 36 44 38 64Z" fill="#6aa83a"/><path d="M40 64 C44 44 52 26 60 12 C56 30 52 48 52 64Z" fill="#3f7424"/></svg>`,
  );
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 6 C46 18 48 36 32 58 C16 36 18 18 32 6Z" fill="none" stroke="#5fc24a" stroke-width="5"/><path d="M32 14 L32 54" stroke="#9cf06a" stroke-width="4"/><circle cx="32" cy="34" r="5" fill="#d8ff8a"/></svg>`,
  );

  // ---------------------------------------------------------------- paints
  const moss = mottle("#74a03e", "#3d6a27", { size: 0.035, seed: 2 });
  const bark = grain("#77512e", "#4a2f1a", { size: 0.012, axis: "y", seed: 1 });
  const barkX = grain("#77512e", "#4a2f1a", { size: 0.012, axis: "x", seed: 3 });
  const bodyPaint = paint((p, n) => (n.y + (noise(p, 0.07, 5) - 0.5) * 0.9 > 0.35 ? moss : bark));
  const legPaint = paint((p) => (p.y < 0.13 + 0.1 * (noise(p, 0.05, 4) - 0.5) ? moss : bark));
  const birch = paint((p, n) => {
    const m = noise(p, 0.05, 3);
    if (n.y > 0.55 + (m - 0.5) * 0.5) return moss;
    const q = new THREE.Vector3(p.x, p.y * 4, p.z);
    if (noise(q, 0.06, 7) > 0.74) return "#4d3e30";
    return mix("#f1e9d2", "#d6c6a2", noise(p, 0.04, 1));
  });
  const capSpots = spots("#c8452c", "#f6ead0", { size: 0.012, amount: 0.45, seed: 9 });

  // ---------------------------------------------------------------- skeleton & body
  const root = b.joint("root", { at: [0, 0.44, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.44, 0],
      [0, 0.6, 0.012],
      [0, 0.76, 0],
      [0, 0.9, -0.012],
    ],
    { parent: root, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const keyed = (arr: number[], t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
    const i = Math.min(Math.floor(x), arr.length - 2);
    return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
  };
  const torso = b.sweep(
    spine,
    (t: number) => {
      const r = keyed([0.13, 0.165, 0.158, 0.13, 0.075], t);
      return [r, r * 0.86] as [number, number];
    },
    { color: bodyPaint, sides: 12, name: "torso" },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.88, -0.01],
      [0, 1.0, 0],
    ],
    { parent: "chest", names: ["neck"], role: "neck" },
  );
  b.sweep(neck, 0.05, { color: bark, sides: 8 });

  b.joint("head", { at: [0, 1.0, 0], parent: "neck", dir: [0, 1, 0], role: "head" });
  const headC = V(0, 1.14, 0);
  const cranium = b.part(new THREE.SphereGeometry(0.16, 16, 12), birch, {
    at: headC,
    bone: "head",
    scale: [1.08, 0.92, 1.0],
    name: "cranium",
  });
  b.joint("jaw", { at: [0, 1.05, 0.02], parent: "head", dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.SphereGeometry(0.1, 12, 8), birch, {
    at: [0, 1.03, 0.055],
    bone: "jaw",
    scale: [1, 0.42, 0.75],
    name: "jaw",
  });

  const headSurf = b.surface(cranium);
  const look = headSurf.around(headC);

  // mouth
  const mouth = look.at(0, -20);
  if (mouth) b.stick(new THREE.BoxGeometry(0.075, 0.02, 0.014), "#1c140c", mouth, { embed: 0.6, bone: "head" });

  // forehead rune
  const brow = look.at(0, 34);
  if (brow) b.decal(cranium, rune, { at: brow, size: [0.075, 0.075], bone: "head" });

  // head grass tufts
  const tufts = headSurf.scatter(40, { rng: rng(21), minDist: 0.022, filter: (h) => h.n.y > 0.6 });
  b.cards(tufts, grass, { size: [0.045, 0.05], cross: true, lean: 10, vary: 0.35, spin: 180, rng: rng(22) });

  // mushroom helper
  const mushroom = (at: THREE.Vector3, n: THREE.Vector3, size: number, cap: Fill, stem: string, bone: string) => {
    const dir = n.clone().normalize().add(V(0, 0.8, 0)).normalize();
    const base = at.clone().addScaledVector(n, -0.004);
    const top = at.clone().addScaledVector(dir, 0.035 * size);
    b.capsule(base, top, [0.007 * size, 0.006 * size], { color: stem, bone, sides: 6 });
    b.lathe(
      [
        [0, 0],
        [0.026 * size, 0],
        [0.031 * size, 0.008 * size],
        [0.02 * size, 0.021 * size],
        [0, 0.025 * size],
      ],
      { color: cap, at: top.clone().addScaledVector(dir, -0.004 * size), axis: dir, bone, segments: 10 },
    );
  };
  const m1 = look.at(-62, 42);
  if (m1) mushroom(m1.at, m1.n, 1.2, capSpots, "#efe6cc", "head");
  const m2 = look.at(-80, 24);
  if (m2) mushroom(m2.at, m2.n, 0.75, capSpots, "#efe6cc", "head");

  // ---------------------------------------------------------------- sides
  const side = (s: 1 | -1) => {
    const L = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number) => [s * x, y, z];

    // eyes
    const eye = look.at(s * 30, 3);
    if (eye) {
      const socket = new THREE.SphereGeometry(1, 12, 8);
      socket.scale(0.034, 0.014, 0.046);
      b.stick(socket, "#120f0a", eye, { embed: 0.5, bone: "head" });
      const glow = new THREE.SphereGeometry(1, 10, 6);
      glow.scale(0.016, 0.01, 0.024);
      b.stick(glow, "#e3ff86", eye.moved([0, 0.004, 0]), { embed: 0.3, bone: "head" });
      const spark = new THREE.SphereGeometry(0.005, 6, 4);
      b.stick(spark, "#ffffff", eye.moved([s * -0.006, 0.008, 0.01]), { embed: 0.3, bone: "head" });
    }
    // cheeks
    const cheek = look.at(s * 52, -14);
    if (cheek) {
      const blush = new THREE.SphereGeometry(1, 10, 6);
      blush.scale(0.026, 0.006, 0.018);
      b.stick(blush, "#e39e7a", cheek, { embed: 0.5, bone: "head" });
    }
    // leaf ears
    const ear = look.at(s * 90, 12);
    if (ear) {
      const out = V(s, 0.55, -0.1);
      b.cards([frame(ear, out), frame(ear, V(s, 0.25, 0.1))], [leafA, leafB], {
        size: [0.07, 0.14],
        bone: "head",
        sink: 0.15,
        bend: 25,
        flow: [0, 1, 0],
        rng: rng(s > 0 ? 31 : 32),
      });
    }

    // antlers
    const p0 = V(...(P(0.07, 1.25, -0.01) as [number, number, number]));
    const p1 = V(...(P(0.13, 1.36, -0.03) as [number, number, number]));
    const p2 = V(...(P(0.17, 1.48, -0.02) as [number, number, number]));
    const p3 = V(...(P(0.19, 1.58, 0.01) as [number, number, number]));
    const b1 = V(...(P(0.25, 1.42, 0.0) as [number, number, number]));
    const b2 = V(...(P(0.31, 1.47, 0.03) as [number, number, number]));
    const t1 = V(...(P(0.12, 1.56, 0.04) as [number, number, number]));
    const antler = "#5a3d26";
    b.capsule(p0, p1, [0.022, 0.018], { color: antler, bone: "head", sides: 7 });
    b.capsule(p1, p2, [0.018, 0.013], { color: antler, bone: "head", sides: 7 });
    b.capsule(p2, p3, [0.013, 0.007], { color: antler, bone: "head", sides: 6 });
    b.capsule(p1, b1, [0.013, 0.009], { color: antler, bone: "head", sides: 6 });
    b.capsule(b1, b2, [0.009, 0.005], { color: antler, bone: "head", sides: 6 });
    b.capsule(p2, t1, [0.01, 0.005], { color: antler, bone: "head", sides: 6 });
    const tipLeaves = [
      frame(p3, V(s * 0.3, 1, 0.1)),
      frame(p3, V(s * 0.8, 0.7, -0.2)),
      frame(p3, V(-s * 0.2, 0.9, -0.3)),
      frame(b2, V(s * 1, 0.5, 0.2)),
      frame(b2, V(s * 0.6, 0.9, -0.2)),
      frame(t1, V(-s * 0.3, 1, 0.4)),
      frame(t1, V(s * 0.2, 0.8, 0.6)),
    ];
    b.cards(tipLeaves, [leafA, leafA, leafB], {
      size: [0.045, 0.075],
      bone: "head",
      spin: 40,
      vary: 0.25,
      bend: 20,
      rng: rng(s > 0 ? 41 : 42),
    });

    // legs
    const leg = b.chain(`leg${L}`, [P(0.085, 0.47, 0), P(0.1, 0.27, 0.035), P(0.1, 0.08, 0)], {
      parent: "root",
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: P(0.105, 0, 0.06),
    });
    b.sweep(leg, (t: number) => 0.05 - 0.017 * t, { color: legPaint, sides: 9 });
    b.part(new THREE.SphereGeometry(0.034, 8, 6), bark, { at: P(0.1, 0.27, 0.05), bone: `knee${L}` });
    const foot = b.chain(`foot${L}`, [P(0.1, 0.08, 0), P(0.105, 0.03, 0.07), P(0.11, 0.018, 0.13)], {
      parent: `ankle${L}`,
      names: [`foot${L}`, `toe${L}`],
      role: "digit",
    });
    b.sweep(foot, [0.042, 0.03, 0.016], { color: legPaint, sides: 8 });
    const fb = `foot${L}`;
    b.capsule(P(0.1, 0.05, 0.02), P(0.17, 0.014, 0.05), [0.018, 0.007], { color: legPaint, bone: fb, sides: 6 });
    b.capsule(P(0.1, 0.05, 0.02), P(0.045, 0.014, 0.07), [0.016, 0.007], { color: legPaint, bone: fb, sides: 6 });
    b.capsule(P(0.1, 0.06, -0.01), P(0.11, 0.014, -0.08), [0.02, 0.008], { color: legPaint, bone: fb, sides: 6 });

    // arms (T-pose)
    const arm = b.chain(`arm${L}`, [P(0.1, 0.86, 0), P(0.3, 0.865, 0), P(0.47, 0.86, 0)], {
      parent: "chest",
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, (t: number) => 0.04 - 0.014 * t, { color: barkX, sides: 8 });
    b.part(new THREE.SphereGeometry(0.05, 10, 8), bodyPaint, { at: P(0.13, 0.875, 0), bone: `shoulder${L}` });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), bark, { at: P(0.3, 0.865, -0.012), bone: `elbow${L}` });
    b.part(new THREE.TorusGeometry(0.032, 0.007, 6, 14), "#4f7d2e", {
      at: P(0.445, 0.86, 0),
      bone: `elbow${L}`,
      rotation: [0, 90, 0],
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#f2c53d", { at: P(0.445, 0.895, 0.012), bone: `elbow${L}` });
    b.cards([frame(V(s * 0.3, 0.885, 0), V(s * 0.2, 1, -0.2)), frame(V(s * 0.32, 0.885, 0), V(-s * 0.1, 1, 0.3))], leafA, {
      size: [0.04, 0.07],
      bone: `elbow${L}`,
      bend: 20,
      rng: rng(s > 0 ? 51 : 52),
    });
    // hand
    b.part(new THREE.SphereGeometry(0.032, 10, 8), barkX, {
      at: P(0.495, 0.86, 0),
      bone: `wrist${L}`,
      scale: [1.2, 0.7, 1],
    });
    [-0.024, 0, 0.024].forEach((z, i) => {
      const f = b.chain(`finger${L}${i + 1}`, [P(0.515, 0.86, z), P(0.565, 0.858, z * 1.5), P(0.605, 0.85, z * 2)], {
        parent: `wrist${L}`,
        names: [`finger${L}${i + 1}a`, `finger${L}${i + 1}b`],
        role: "digit",
      });
      b.sweep(f, [0.011, 0.008, 0.005], { color: "#5a3b22", sides: 6 });
      b.part(new THREE.SphereGeometry(0.007, 6, 4), "#8fd14f", { at: P(0.607, 0.85, z * 2), bone: `finger${L}${i + 1}b` });
    });
    const thumb = b.chain(`thumb${L}`, [P(0.49, 0.86, 0.028), P(0.51, 0.862, 0.06), P(0.53, 0.86, 0.085)], {
      parent: `wrist${L}`,
      names: [`thumb${L}a`, `thumb${L}b`],
      role: "digit",
    });
    b.sweep(thumb, [0.011, 0.008, 0.005], { color: "#5a3b22", sides: 6 });
  };
  side(1);
  side(-1);

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    [
      [0, 0.5, -0.11],
      [0, 0.46, -0.24],
      [0, 0.5, -0.35],
      [0, 0.59, -0.42],
    ],
    { parent: "root", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.034, 0.024, 0.014, 0.007], { color: bark, sides: 7 });
  b.cards(
    [
      frame(V(0, 0.59, -0.42), V(0, 1, -0.4)),
      frame(V(0, 0.59, -0.42), V(0.5, 0.8, -0.5)),
      frame(V(0, 0.59, -0.42), V(-0.5, 0.8, -0.5)),
      frame(V(0, 0.59, -0.42), V(0, 0.4, -1)),
    ],
    [leafA, leafB],
    { size: [0.05, 0.09], bone: "tail3", bend: 25, vary: 0.2, rng: rng(61) },
  );

  // ---------------------------------------------------------------- torso dressing
  const torsoSurf = b.surface(torso);

  // leaf cloak over shoulders and back
  const cloak = torsoSurf.scatter(85, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.at.y > 0.72 || (h.n.z < -0.2 && h.at.y > 0.52),
  });
  b.cards(cloak, [leafA, leafA, leafB], {
    size: [0.075, 0.12],
    lean: 62,
    flow: (f) => [f.at.x * 2, -1, f.at.z * 2],
    bend: 25,
    vary: 0.25,
    spin: 20,
    rng: rng(12),
  });

  // flowering vine belt
  const belt = torsoSurf.loop([0, 0.56, 0], { lift: 0.006 });
  b.sweep(belt, 0.011, { color: "#3d6a26", sides: 6 });
  const petal = new THREE.SphereGeometry(0.01, 6, 4);
  petal.scale(0.6, 1, 0.35);
  b.along(belt, 7, (pt) => {
    const out = new THREE.Vector3(pt.at.x, 0, pt.at.z).normalize();
    const pos = pt.at.clone().addScaledVector(out, 0.008);
    const col = pt.t * 7 < 3.5 ? "#f6efd9" : "#f4c6d0";
    b.part(new THREE.SphereGeometry(0.006, 6, 4), "#f2c53d", { at: pos.clone().addScaledVector(out, 0.003), bone: "spine1" });
    b.ring(frame(pos, out), { count: 5, radius: 0.011 }, (item) => {
      b.part(petal, col, { frame: item, at: item.at, bone: "spine1" });
    });
  });

  // glowing heart seed
  const heart = torsoSurf.around(V(0, 0.72, 0)).at(0, 8);
  if (heart) {
    b.stick(new THREE.CylinderGeometry(0.042, 0.05, 0.014, 10), "#2a1c10", heart, { embed: 0.6, bone: "spine2" });
    b.stick(new THREE.OctahedronGeometry(0.028, 0), "#b9ff6e", heart.moved([0, 0.006, 0]), {
      embed: 0.35,
      bone: "spine2",
      flat: true,
      scale: [1, 1.3, 1],
    });
  }

  // glowing mushrooms on the back
  const back = torsoSurf.around(V(0, 0.62, 0));
  (
    [
      [170, -5, 1.0],
      [195, 4, 0.7],
      [182, -18, 0.55],
    ] as const
  ).forEach(([az, el, size]) => {
    const h = back.at(az, el);
    if (h) mushroom(h.at, h.n, size, "#86f2d4", "#e8f0d8", "spine2");
  });

  return b.root;
}
```