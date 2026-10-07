import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  smoothstep,
  noise,
  cells,
  mottle,
  scales,
  svg,
  catmull,
} from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin Parent & Chick",
  description:
    "A proud emperor penguin with a glossy blue-black back, white belly fading to golden chest and ear patches, a long beak with an orange-pink stripe, stubby flippers held out and big scaly black feet, with a fluffy grey chick tucked under its belly fold, on a small patch of snow.",
};

type C3 = readonly [number, number, number];

export default function build() {
  const b = createBuilder({ name: "emperorPenguin", paintSize: 1024 });
  b.ctx.paintMaterial().roughness = 0.42;

  const BACK = "#10141f";
  const SHEEN = "#2c3b5c";
  const WHITE = "#f4f3ee";
  const PALE = "#f8e3a0";
  const GOLD = "#f2a523";

  const segDist = (x: number, y: number, z: number, a: number[], c: number[]) => {
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const L2 = dx * dx + dy * dy + dz * dz;
    let t = ((x - a[0]) * dx + (y - a[1]) * dy + (z - a[2]) * dz) / L2;
    t = Math.max(0, Math.min(1, t));
    return [Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t, z - a[2] - dz * t), t];
  };
  const EA = [0.066, 0.985, -0.035];
  const EB = [0.088, 0.86, 0.045];

  const plumage = paint((p, n) => {
    const ce = cells(p, 0.022, 4);
    const feather = 0.86 + 0.14 * smoothstep(0, 0.12, ce.d2 - ce.d1);
    let c: C3 = mix(BACK, SHEEN, 0.55 * smoothstep(-0.1, 0.9, n.y) + 0.3 * noise(p, 0.1, 3));
    c = [c[0] * feather, c[1] * feather, c[2] * feather];
    const front = smoothstep(-0.25, 0.1, n.z) * smoothstep(0.87, 0.8, p.y);
    if (front > 0) {
      const belly = mix(mix(WHITE, "#fffdf6", noise(p, 0.05, 8)), PALE, smoothstep(0.6, 0.82, p.y));
      c = mix(c, belly, front);
    }
    const [d, t] = segDist(Math.abs(p.x), p.y, p.z, EA, EB);
    const r = 0.032 - 0.012 * t;
    const ear = smoothstep(r, r - 0.014, d) * smoothstep(0.1, 0.4, Math.abs(n.x));
    if (ear > 0) c = mix(c, mix(GOLD, "#ffd45e", t), ear);
    return c;
  });

  const flipperPaint = paint((p, n) => {
    const inward = -Math.sign(p.x) * n.x;
    const under = smoothstep(0.25, 0.55, inward) * smoothstep(0.42, 0.48, p.y);
    return mix(plumage.at(p, n), "#ecebe6", under);
  });

  const footPaint = scales(["#2a2a30", "#1d1d22", "#25252b"], "#0b0b0e", { size: 0.012 });
  const snowPaint = mottle("#f3f7fb", "#d2e2f0", { size: 0.15, seed: 2 });

  // ---------------- skeleton: parent ----------------
  b.joint("root", { at: [0, 0.28, 0] });
  const spine = b.chain("spine", [[0, 0.28, 0], [0, 0.52, 0], [0, 0.76, 0]], {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2"],
  });
  const neck = b.chain("neck", [[0, 0.76, 0], [0, 0.92, 0.02]], { parent: "spine2", role: "neck", names: ["neck"] });
  b.joint("head", { parent: "neck", at: [0, 0.93, 0.0], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.975, 0.095], aim: [0, 0.955, 0.25], role: "jaw" });

  // ---------------- snow base ----------------
  b.lathe(
    [
      [0, 0],
      [0.55, 0],
      [0.52, 0.012],
      [0.3, 0.015],
      [0, 0.015],
    ],
    { color: snowPaint, at: [0, -0.015, 0], segments: 10, bone: "root", name: "snow" },
  );
  const r = rng(11);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5 + r() * 0.4;
    const rad = 0.025 + r() * 0.025;
    const d = 0.4 + r() * 0.1;
    b.part(new THREE.DodecahedronGeometry(rad, 0), i % 2 ? "#cfe6f7" : "#e6f2fb", {
      at: [Math.sin(a) * d, rad - 0.018, Math.cos(a) * d],
      rotation: [r() * 90, r() * 90, r() * 90],
      bone: "root",
      flat: true,
    });
  }

  // ---------------- body ----------------
  b.loft(
    [
      { at: [0, 0.04, 0], w: 0.2, h: 0.18 },
      { at: [0, 0.13, 0], w: 0.4, h: 0.36 },
      { at: [0, 0.32, 0.01], w: 0.46, h: 0.42 },
      { at: [0, 0.55, 0], w: 0.4, h: 0.34 },
      { at: [0, 0.75, -0.005], w: 0.28, h: 0.25 },
      { at: [0, 0.92, 0.0], w: 0.17, h: 0.17 },
    ],
    { color: plumage, bone: [spine, neck], caps: { start: "flat", end: "round" }, name: "body" },
  );

  // brood-pouch fold over the chick
  b.sweep(catmull([[-0.17, 0.2, 0.13], [0, 0.23, 0.205], [0.17, 0.2, 0.13]]), {
    radius: (t: number) => 0.022 + 0.02 * Math.sin(Math.PI * t),
    color: plumage,
    bone: "spine1",
    name: "broodFold",
  });

  // tail
  const tail = b.chain("tail", [[0, 0.15, -0.12], [0, 0.02, -0.26]], {
    parent: "root",
    role: "tail",
    names: ["tail1", "tailTip"],
  });
  b.sweep(tail, { radius: (t: number) => [0.05 * (1 - 0.5 * t), 0.014], color: plumage });

  // ---------------- head ----------------
  const headLoft = b.loft(
    [
      { at: [0, 0.995, -0.075], w: 0.09, h: 0.09 },
      { at: [0, 1.0, -0.03], w: 0.17, h: 0.165 },
      { at: [0, 0.995, 0.03], w: 0.15, h: 0.14 },
      { at: [0, 0.985, 0.085], w: 0.075, h: 0.075 },
    ],
    { color: plumage, bone: "head", name: "head" },
  );
  // beak
  b.sweep(catmull([[0, 0.993, 0.085], [0, 0.986, 0.18], [0, 0.966, 0.272]]), {
    radius: (t: number) => [0.017 * (1 - t) + 0.003, 0.014 * (1 - t) + 0.0028],
    color: "#121218",
    bone: "head",
    caps: { start: "flat", end: "round" },
    name: "beakUpper",
  });
  b.sweep(catmull([[0, 0.975, 0.095], [0, 0.969, 0.18], [0, 0.962, 0.255]]), {
    radius: (t: number) => [0.015 * (1 - t) + 0.0025, 0.009 * (1 - t) + 0.002],
    bands: [
      [0.72, "#f2846a"],
      [1, "#1a1a20"],
    ],
    bone: "jaw",
    caps: { start: "flat", end: "round" },
    name: "beakLower",
  });
  const headSurf = b.surface(headLoft);
  for (const s of [1, -1]) {
    const hit = headSurf.ray([s * 0.4, 1.012, 0.035], [-s, 0, 0]);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.011, 10, 8), "#0a0a0d", hit, { embed: 0.45, bone: "head" });
    const hl = hit.at.clone().addScaledVector(hit.n, 0.008).add(new THREE.Vector3(0, 0.004, 0.004));
    b.part(new THREE.SphereGeometry(0.0032, 6, 4), "#ffffff", { at: hl, bone: "head" });
  }

  // ---------------- flippers, legs, feet ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fl = b.chain(`flipper${side}`, catmull([[s * 0.15, 0.7, 0], [s * 0.24, 0.56, 0.01], [s * 0.29, 0.42, 0.03]]), {
      parent: "spine2",
      up: [0, 0, 1],
      role: "wing",
      names: [`shoulder${side}`, `elbow${side}`, `flipperTip${side}`],
    });
    b.sweep(fl, {
      radius: (t: number) => [0.016 - 0.008 * t, 0.052 * (1 - 0.5 * t)],
      color: flipperPaint,
      extend: [0.03, 0],
    });

    const leg = b.chain(`leg${side}`, [[s * 0.09, 0.13, 0], [s * 0.095, 0.035, 0.05]], {
      parent: "root",
      role: "leg",
      names: [`hip${side}`, `ankle${side}`],
    });
    b.sweep(leg, { radius: 0.03, color: "#15151a" });

    const ankle = `ankle${side}`;
    const heel = new THREE.Vector3(s * 0.095, 0.022, 0.045);
    const tips = [
      new THREE.Vector3(s * 0.05, 0.012, 0.2),
      new THREE.Vector3(s * 0.11, 0.012, 0.215),
      new THREE.Vector3(s * 0.165, 0.012, 0.18),
    ];
    for (const tip of tips) {
      b.capsule(heel, tip, [0.022, 0.013], { color: footPaint, bone: ankle });
      const dir = tip.clone().sub(heel).setY(0).normalize().add(new THREE.Vector3(0, -0.35, 0)).normalize();
      b.spike(tip.clone().addScaledVector(dir, 0.006), dir, 0.026, 0.0075, { color: "#3d3a3a", bone: ankle });
    }
    b.slab(
      [
        [s * 0.07, 0.01, 0.07],
        [s * 0.05, 0.01, 0.18],
        [s * 0.11, 0.01, 0.195],
        [s * 0.162, 0.01, 0.16],
        [s * 0.125, 0.01, 0.06],
      ],
      { color: "#1b1b20", thickness: 0.012, bone: ankle },
    );
  }

  // ---------------- chick ----------------
  b.joint("chickRoot", { parent: "root", at: [0, 0.08, 0.22] });
  const cSpine = b.chain("chickSpine", [[0, 0.08, 0.22], [0, 0.2, 0.225], [0, 0.3, 0.24]], {
    parent: "chickRoot",
    role: "spine",
    names: ["chickSpine1", "chickSpine2"],
  });
  b.joint("chickHead", { parent: "chickSpine2", at: [0, 0.3, 0.24], dir: [0, 0, 1], role: "head" });
  b.joint("chickJaw", { parent: "chickHead", at: [0, 0.333, 0.31], aim: [0, 0.327, 0.345], role: "jaw" });

  const chickBody = b.loft(
    [
      { at: [0, 0.03, 0.215], w: 0.14, h: 0.13 },
      { at: [0, 0.1, 0.22], w: 0.22, h: 0.2 },
      { at: [0, 0.2, 0.225], w: 0.2, h: 0.18 },
      { at: [0, 0.28, 0.235], w: 0.13, h: 0.12 },
    ],
    { color: "#a3a8b0", bone: [cSpine], caps: { start: "flat", end: "round" }, name: "chickBody" },
  );

  const chickHeadPaint = paint((p, n) => {
    const dy = p.y - 0.34;
    const cap = dy > 0.012 || n.z < -0.35 ? 1 : smoothstep(0.004, 0.012, dy);
    return mix(mix("#f6f6f2", "#e4e6ea", noise(p, 0.03, 4)), "#16161b", cap);
  });
  const chickHead = b.loft(
    [
      { at: [0, 0.335, 0.195], w: 0.08, h: 0.08 },
      { at: [0, 0.34, 0.23], w: 0.135, h: 0.125 },
      { at: [0, 0.335, 0.28], w: 0.12, h: 0.11 },
      { at: [0, 0.33, 0.31], w: 0.06, h: 0.06 },
    ],
    { color: chickHeadPaint, bone: "chickHead", name: "chickHeadShape" },
  );
  b.sweep([[0, 0.34, 0.305], [0, 0.333, 0.345]], {
    radius: (t: number) => [0.009 * (1 - t) + 0.002, 0.007 * (1 - t) + 0.0015],
    color: "#15151a",
    bone: "chickHead",
    caps: { start: "flat", end: "round" },
  });
  b.sweep([[0, 0.333, 0.31], [0, 0.327, 0.34]], {
    radius: (t: number) => [0.007 * (1 - t) + 0.0015, 0.004 * (1 - t) + 0.0012],
    color: "#2a2a30",
    bone: "chickJaw",
    caps: { start: "flat", end: "round" },
  });
  const chickHeadSurf = b.surface(chickHead);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = chickHeadSurf.ray([s * 0.3, 0.343, 0.265], [-s, 0, 0]);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.009, 10, 8), "#0a0a0d", hit, { embed: 0.45, bone: "chickHead" });
      const hl = hit.at.clone().addScaledVector(hit.n, 0.006).add(new THREE.Vector3(0, 0.003, 0.003));
      b.part(new THREE.SphereGeometry(0.0025, 6, 4), "#ffffff", { at: hl, bone: "chickHead" });
    }
    const cf = b.chain(`chickFlipper${side}`, [[s * 0.09, 0.2, 0.23], [s * 0.13, 0.12, 0.25]], {
      parent: "chickSpine1",
      up: [0, 0, 1],
      role: "wing",
      names: [`chickFlipper${side}`, `chickFlipperTip${side}`],
    });
    b.sweep(cf, { radius: (t: number) => [0.01, 0.028 * (1 - 0.5 * t)], color: "#8f949c", extend: [0.02, 0] });
    b.capsule([s * 0.035, 0.035, 0.27], [s * 0.04, 0.03, 0.3], [0.012, 0.009], {
      color: "#4a4a52",
      bone: "chickRoot",
    });
  }

  // fluffy down
  const fluff = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="5">
      <path d="M32 64 C30 44 22 30 14 16"/><path d="M32 64 C32 42 34 24 32 4"/><path d="M32 64 C36 44 44 32 52 18"/>
      <path d="M32 64 C28 52 16 46 7 38"/><path d="M32 64 C38 52 50 48 58 40"/></g></svg>`,
    { size: 128 },
  );
  const bodySurf = b.surface(chickBody);
  const lightHits = bodySurf.scatter(120, { rng: rng(5), minDist: 0.012, filter: (h) => h.at.y < 0.29 });
  b.cards(lightHits, fluff, {
    size: [0.035, 0.042],
    lean: 55,
    flow: [0, -1, 0],
    bend: 25,
    vary: 0.35,
    spin: 25,
    rng: rng(9),
    color: "#d3d6dc",
    name: "chickFluffLight",
  });
  const darkHits = bodySurf.scatter(70, { rng: rng(17), minDist: 0.015, filter: (h) => h.at.y < 0.29 });
  b.cards(darkHits, fluff, {
    size: [0.03, 0.036],
    lean: 50,
    flow: [0, -1, 0],
    bend: 20,
    vary: 0.3,
    spin: 30,
    rng: rng(23),
    color: "#9097a1",
    name: "chickFluffDark",
  });
  const capHits = chickHeadSurf.scatter(24, { rng: rng(31), minDist: 0.01, filter: (h) => h.n.y > 0.45 });
  b.cards(capHits, fluff, {
    size: [0.03, 0.035],
    lean: 25,
    flow: [0, 0, -1],
    bend: 20,
    vary: 0.3,
    spin: 40,
    rng: rng(41),
    color: "#2a2b31",
    name: "chickCapTuft",
  });

  return b.root;
}
