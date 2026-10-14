import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  limb,
  countershade,
  mottle,
  gradient,
  grain,
  stripes,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Fennec Kit on a Dusk Dune",
  description:
    "A fennec fox kit standing alert on a little sand dune at dusk: enormous satin ears lined in peach, cream-to-gold fur, a fluffy black-smudged tail, big sparkly eyes, oversized paws and a woven leather collar with a brass bell.",
};

export default function build() {
  const b = createBuilder({ name: "fennecKit" });

  // ---------- palette ----------
  const CREAM = "#f6e6cc";
  const CREAM_L = "#fcf3e4";
  const SAND = "#e6bd80";
  const GOLD = "#d39a52";
  const PAW = "#f4e3c7";
  const TOE = "#fbefdc";
  const EAR_OUT = "#e9c28c";
  const EAR_TIP = "#c88a52";
  const PEACH = "#f4b39b";
  const PEACH_L = "#fbd6c4";
  const TAILTIP = "#2b1d18";
  const NOSE = "#1d1411";
  const WHISK = "#4a372c";
  const LEATHER = "#8a4826";
  const LEATHER_L = "#a65d33";
  const LEATHER_D = "#5a2c17";
  const BRASS = "#d9a93c";
  const BRASS_D = "#94691f";
  const DUNE_L = "#f3bf8c";
  const DUNE_D = "#d98a5c";
  const RIPPLE = "#c0744a";

  const coat = countershade(mottle(GOLD, SAND, { size: 0.05, contrast: 0.6, seed: 3 }), CREAM, { level: -0.1 });
  const legP = gradient(coat, CREAM, [0, 0.15, 0], [0, 0.1, 0]);

  // ---------- textures ----------
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C4 50 5 30 11 3 C14 24 15 30 17 12 C19 30 23 38 23 6 C30 30 28 52 16 64 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
      <path d="M60 84 Q74 110 68 138 L80 136 Q88 106 76 82 Z" fill="#5a3a26"/>
      <circle cx="50" cy="50" r="45" fill="#1b100c"/>
      <circle cx="50" cy="54" r="36" fill="#4a2a19"/>
      <circle cx="50" cy="56" r="25" fill="#0c0705"/>
      <ellipse cx="35" cy="33" rx="12" ry="10" fill="#ffffff"/>
      <circle cx="65" cy="68" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M30 64 L20 4 L35 64 Z M34 64 L45 10 L40 64 Z M27 64 L5 20 L31 64 Z M37 64 L59 26 L36 64 Z" fill="#e0e0e0"/></svg>`,
    { size: 128 },
  );
  const printTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="32" cy="44" rx="13" ry="10" fill="#666"/><circle cx="17" cy="26" r="6" fill="#666"/><circle cx="27" cy="16" r="6" fill="#666"/><circle cx="38" cy="16" r="6" fill="#666"/><circle cx="47" cy="26" r="6" fill="#666"/></svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.185, -0.07], aim: [0, 0.19, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.19, 0],
      [0, 0.197, 0.04],
      [0, 0.205, 0.075],
    ]),
    { parent: hips, count: 2, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.205, 0.075],
      [0, 0.265, 0.115],
    ],
    { parent: spine.joints[1], names: ["neck"], role: "neck" },
  );
  const neckJ = neck.joints[0];
  const head = b.joint("head", { parent: neckJ, at: [0, 0.265, 0.115], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.025 }),
    aim: head.local({ forward: 0.09, down: 0.033 }),
    role: "jaw",
  });

  // ---------- dune ----------
  const dune = b.lathe(
    [
      [0, 0],
      [0.44, 0],
      [0.4, 0.012],
      [0.33, 0.032],
      [0.24, 0.052],
      [0.15, 0.061],
      [0, 0.064],
    ],
    {
      at: [0, 0, 0],
      segments: 20,
      bone: root,
      name: "dune",
      color: stripes(gradient(DUNE_D, DUNE_L, [0, 0, 0], [0, 0.065, 0]), RIPPLE, {
        size: 0.05,
        axis: "x",
        width: 0.18,
        wobble: 0.5,
        seed: 2,
      }),
    },
  );
  const duneSurf = b.surface(dune);
  const onDune = (x: number, z: number) => duneSurf.ray([x, 1, z], [0, -1, 0]);

  // paw prints trailing back
  const prints: any[] = [];
  for (const [x, z] of [
    [0.05, -0.2],
    [-0.01, -0.25],
    [0.06, -0.3],
    [0.0, -0.35],
  ]) {
    const h = onDune(x, z);
    if (h) prints.push(h);
  }
  b.cards(prints, printTex, { size: 0.026, lean: 90, flow: [0, 0, 1], mirror: true, color: "#b56c40", bone: root, sink: 0 });

  // pebbles
  const prng = rng(21);
  for (const [x, z] of [
    [0.22, 0.12],
    [0.25, 0.16],
    [-0.2, 0.2],
    [-0.27, -0.1],
  ]) {
    const h = onDune(x, z);
    if (h)
      b.stick(new THREE.DodecahedronGeometry(0.011, 0), prng() > 0.5 ? "#9c7b62" : "#b8977a", h, {
        embed: 0.4,
        scale: [1.3, 0.7, 1],
        spin: prng() * 180,
        bone: root,
        flat: true,
      });
  }
  // dry grass tufts
  const grassHits: any[] = [];
  for (const [x, z] of [
    [-0.24, 0.05],
    [-0.21, 0.09],
    [0.2, -0.2],
    [0.27, -0.15],
  ]) {
    const h = onDune(x, z);
    if (h) grassHits.push(frame(h.at, [0, 1, 0]));
  }
  b.cards(grassHits, grassTex, {
    size: [0.06, 0.07],
    cross: true,
    vary: 0.3,
    spin: 40,
    rng: rng(8),
    bend: 15,
    color: "#b89a5c",
    bone: root,
  });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.19, -0.115], w: 0.06, h: 0.06 },
      { at: [0, 0.188, -0.075], w: 0.095, h: 0.092 },
      { at: [0, 0.19, 0], w: 0.088, h: 0.088 },
      { at: [0, 0.2, 0.055], w: 0.095, h: 0.1 },
      { at: [0, 0.218, 0.095], w: 0.072, h: 0.08 },
      { at: [0, 0.25, 0.115], w: 0.058, h: 0.058 },
    ],
    { bone: [hips, spine, neck], color: coat, name: "body" },
  );
  const bodySurf = b.surface(body);

  // chest fluff
  const chestHits = bodySurf.scatter(60, {
    rng: rng(5),
    minDist: 0.011,
    filter: (h) => h.at.z > 0.055 && h.n.z > 0.25 && h.at.y < 0.235,
  });
  b.cards(chestHits, tuft, {
    size: [0.02, 0.03],
    lean: 50,
    bend: 25,
    flow: [0, -1, 0.15],
    vary: 0.3,
    rng: rng(6),
    color: CREAM_L,
  });

  // ---------- legs ----------
  const pawAt = (tip: any, F: THREE.Vector3) => {
    b.part(new THREE.SphereGeometry(0.021, 10, 7), PAW, {
      bone: tip,
      at: [F.x, F.y, F.z + 0.008],
      scale: [1, 0.58, 1.3],
    });
    for (const dx of [-0.011, 0, 0.011])
      b.part(new THREE.SphereGeometry(0.0075, 6, 5), TOE, {
        bone: tip,
        at: [F.x + dx, F.y - 0.004, F.z + 0.03],
        scale: [1, 0.8, 1.1],
      });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fp = limb([s * 0.03, 0.178, 0.062], [s * 0.034, 0.074, 0.075], [0.058, 0.056], [0, 0, -1]);
    const fl = b.chain(`front${S}`, fp, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
    });
    b.sweep(fl, [0.019, 0.013, 0.012], { color: legP });
    pawAt(fl.tip ?? fl.joints[fl.joints.length - 1], fp[fp.length - 1]);

    const hp = limb(
      [s * 0.034, 0.178, -0.078],
      [s * 0.036, 0.074, -0.082],
      [0.046, 0.044, 0.036],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`hind${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(hl, [0.028, 0.02, 0.013, 0.012], { color: legP });
    pawAt(hl.tip ?? hl.joints[hl.joints.length - 1], hp[hp.length - 1]);
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 0.192, -0.115],
    [0, 0.18, -0.17],
    [0, 0.165, -0.225],
    [0, 0.172, -0.285],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 4, role: "tail" });
  const tailP = gradient(coat, TAILTIP, tailPath.at(0.72), tailPath.at(1));
  const tailTube = b.sweep(tail, [0.016, 0.026, 0.034, 0.034, 0.022], { color: tailP, name: "tail" });
  const tailHits = b.surface(tailTube).scatter(70, { rng: rng(11), minDist: 0.011 });
  b.cards(tailHits, tuft, {
    size: [0.028, 0.042],
    lean: 60,
    bend: 25,
    vary: 0.3,
    rng: rng(12),
    color: tailP,
  });

  // ---------- head ----------
  const headCenter = head.local({ forward: 0.015, up: 0.008 });
  const headPart = b.part(new THREE.SphereGeometry(0.055, 12, 9), coat, {
    bone: head,
    at: headCenter,
    scale: [1.15, 0.95, 1.0],
    name: "skull",
  });
  // upper muzzle
  b.sweep(
    [head.local({ forward: 0.035, down: 0.006 }), head.local({ forward: 0.098, down: 0.012 })],
    (t: number) => [0.03 * (1 - t) + 0.007, 0.022 * (1 - t) + 0.006],
    { bone: head, color: coat, caps: { start: "flat", end: "round" }, name: "muzzle" },
  );
  // lower jaw
  b.sweep([jaw.at, jaw.local([0, 0.048, 0])], (t: number) => [0.021 * (1 - t) + 0.005, 0.009 * (1 - t) + 0.004], {
    bone: jaw,
    color: CREAM,
    caps: { start: "flat", end: "round" },
    name: "lowerJaw",
  });
  // nose
  b.part(new THREE.SphereGeometry(0.0085, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.104, down: 0.009 }),
    scale: [1.25, 0.85, 1],
  });
  b.part(new THREE.SphereGeometry(0.002, 5, 4), "#8a7a72", {
    bone: head,
    at: head.local({ forward: 0.108, down: 0.005, left: 0.003 }),
  });

  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // eyes
    b.decal(headPart, eyeTex, {
      at: head.local({ left: s * 0.031, up: 0.015, forward: 0.06 }),
      dir: [s * 0.5, 0.15, 0.85],
      size: [0.038, 0.0532],
      mirror: s > 0,
      bone: head,
    });
    // whiskers
    for (let j = 0; j < 3; j++)
      b.spike(
        head.local({ left: s * 0.019, forward: 0.084, down: 0.012 + j * 0.003 }),
        [s * 1, 0.25 - j * 0.2, -0.25],
        0.055,
        0.0009,
        { bone: head, color: WHISK, sides: 4 },
      );
    // cheek fluff
    const cheek: any[] = [];
    for (const [az, el] of [
      [80, -20],
      [95, -5],
      [70, -38],
      [100, -30],
      [110, -12],
    ]) {
      const h = headSurf.around(headCenter).at(s * az, el);
      if (h) cheek.push(h);
    }
    b.cards(cheek, tuft, {
      size: [0.028, 0.036],
      lean: 55,
      bend: 20,
      flow: [s * 0.3, -0.5, -1],
      vary: 0.2,
      rng: rng(30 + s),
      color: CREAM_L,
    });

    // enormous satin ears
    const d = new THREE.Vector3(s * 0.55, 1, -0.12).normalize();
    const a = new THREE.Vector3(d.y, -d.x, 0).normalize();
    const f = new THREE.Vector3().crossVectors(a, d).normalize();
    const earJ = b.joint(`ear${S}`, {
      parent: head,
      at: head.local({ left: s * 0.03, up: 0.04, back: 0.003 }),
      dir: [d.x, d.y, d.z],
      role: "hinge",
    });
    const base = offset(earJ, d, -0.014);
    b.extrude(
      [
        [-0.04, 0],
        [0.04, 0],
        [0.036, 0.045],
        [0.019, 0.095],
        [0, 0.13, "sharp"],
        [-0.019, 0.095],
        [-0.036, 0.045],
      ],
      {
        at: base,
        x: [a.x, a.y, a.z],
        y: [d.x, d.y, d.z],
        thickness: 0.011,
        bevel: 0.003,
        smoothing: 1,
        color: gradient(EAR_OUT, EAR_TIP, base, offset(base, d, 0.14)),
        bone: earJ,
        name: `earOuter${S}`,
      },
    );
    const innerAt = base.clone().addScaledVector(f, 0.0065).addScaledVector(d, 0.012);
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.027, 0.04],
        [0.013, 0.085],
        [0, 0.108, "sharp"],
        [-0.013, 0.085],
        [-0.027, 0.04],
      ],
      {
        at: innerAt,
        x: [a.x, a.y, a.z],
        y: [d.x, d.y, d.z],
        thickness: 0.003,
        bevel: 0.001,
        smoothing: 1,
        color: grain(PEACH, PEACH_L, { size: 0.008, axis: [d.x, d.y, d.z], seed: 4 }),
        bone: earJ,
        name: `earInner${S}`,
      },
    );
    // ear-base fluff
    const earFluff = [
      [-0.02, 0.006],
      [0.02, 0.006],
      [-0.013, 0.026],
      [0.013, 0.026],
      [0, 0.014],
      [0, 0.004],
    ].map(([u, v]) =>
      frame(innerAt.clone().addScaledVector(a, u).addScaledVector(d, v).addScaledVector(f, 0.0016), [f.x, f.y, f.z]),
    );
    b.cards(earFluff, tuft, {
      size: [0.016, 0.03],
      lean: 50,
      bend: 15,
      flow: [d.x, d.y, d.z],
      vary: 0.25,
      rng: rng(40 + s),
      color: "#fff8ee",
      bone: earJ,
    });
  }

  // ---------- woven collar & bell ----------
  const neckPt = neck.at(0.45);
  const A = new THREE.Vector3().copy(neckPt.tangent).normalize();
  const collar = bodySurf.loop(neckPt, { lift: 0.003 });
  b.sweep(collar, 0.0042, { color: LEATHER_D, bone: neckJ, sides: 6, name: "collarCore" });
  let k = 0;
  for (const row of [1, -1]) {
    b.along(collar, 24, (at) => {
      const dir = new THREE.Vector3().copy(at.axis).addScaledVector(A, row * 0.75).normalize();
      b.part(new THREE.SphereGeometry(0.0048, 6, 4), k++ % 2 ? LEATHER : LEATHER_L, {
        bone: neckJ,
        at: offset(at, A, row * 0.0032),
        dir: [dir.x, dir.y, dir.z],
        scale: [1.15, 1.9, 0.85],
        group: "collar",
      });
    });
  }
  const B = collar.at(0.5);
  const C = new THREE.Vector3(B.x, B.y - 0.016, B.z + 0.014);
  b.part(new THREE.TorusGeometry(0.0045, 0.0014, 5, 10), BRASS_D, {
    bone: neckJ,
    at: [B.x, B.y - 0.005, B.z + 0.008],
    group: "bell",
  });
  b.part(new THREE.SphereGeometry(0.0115, 10, 8), BRASS, { bone: neckJ, at: C, flat: true, group: "bell" });
  b.part(new THREE.TorusGeometry(0.0117, 0.0013, 4, 16), BRASS_D, {
    bone: neckJ,
    at: C,
    rotation: [90, 0, 0],
    group: "bell",
  });
  b.part(new THREE.BoxGeometry(0.013, 0.0022, 0.006), "#3a2a12", {
    bone: neckJ,
    at: [C.x, C.y - 0.006, C.z + 0.008],
    rotation: [-40, 0, 0],
    group: "bell",
  });
  for (const sx of [1, -1])
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), "#3a2a12", {
      bone: neckJ,
      at: [C.x + sx * 0.0065, C.y - 0.0058, C.z + 0.0082],
      group: "bell",
    });
  b.part(new THREE.SphereGeometry(0.0022, 5, 4), "#fff1b8", {
    bone: neckJ,
    at: [C.x - 0.004, C.y + 0.006, C.z + 0.008],
    group: "bell",
  });

  return b.root;
}
