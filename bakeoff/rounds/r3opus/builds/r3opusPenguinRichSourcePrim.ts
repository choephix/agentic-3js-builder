import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  smoothstep,
  noise,
  scales,
  mottle,
  svg,
  rng,
  catmull,
} from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin & Chick",
  description:
    "A proud emperor penguin parent with a glossy blue-black back, white belly, golden ear patches and an orange-pink beak stripe, sheltering a fluffy grey chick between its big black feet.",
};

export default function build() {
  const b = createBuilder({ name: "emperorPenguin", paintSize: 1024 });

  // ---------- palette ----------
  const INK = "#0f121b";
  const STEEL = "#34476e";
  const GOLD = "#f4b62e";
  const ORANGE = "#f39019";
  const PALE = "#f8e7a8";
  const PINK = "#f2846a";
  const CLAW = "#2a2622";

  const sheen = (p: THREE.Vector3, n: THREE.Vector3) => {
    const g = 0.55 * smoothstep(-0.1, 0.95, n.y) + 0.35 * (noise(p, 0.07, 4) - 0.5);
    return mix(INK, STEEL, g);
  };
  const belly = scales(["#f7f5ef", "#efede6"], "#e0ded6", { size: 0.028, width: 0.1, seed: 2 });

  // One model-space paint for the parent's body, head, tail and brood fold.
  const P = paint((p, n) => {
    const h = Math.max(Math.hypot(n.x, n.z), 0.3);
    const front = Math.max(-1, Math.min(1, n.z / h));
    const th =
      p.y < 0.5
        ? -0.3
        : p.y < 0.85
          ? -0.3 + 0.75 * smoothstep(0.5, 0.85, p.y)
          : 0.45 + 1.0 * smoothstep(0.85, 0.95, p.y);
    const w = smoothstep(th - 0.1, th + 0.1, front);
    const gold = smoothstep(0.6, 0.82, p.y) * (1 - smoothstep(0.88, 0.95, p.y));
    const bel = belly.at(p, n);
    const whiteC = mix(bel, mix(PALE, GOLD, smoothstep(0.74, 0.9, p.y)), gold * 0.95);
    let c = mix(sheen(p, n), whiteC, w);
    const ex = (Math.abs(p.x) - 0.075) / 0.05;
    const ey = (p.y - 0.935) / 0.065;
    const ez = (p.z - 0.0) / 0.055;
    const e = ex * ex + ey * ey + ez * ez;
    const ear = smoothstep(1.15, 0.75, e);
    if (ear > 0) c = mix(c, mix(GOLD, ORANGE, smoothstep(0.8, 0.1, e)), ear);
    return c;
  });

  const flipperPaint = (side: number) =>
    paint((p, n) => {
      const out = smoothstep(-0.25, 0.15, n.x * side);
      return mix("#f3f1ea", sheen(p, n), out);
    });

  const FOOTP = scales(["#1c1b21", "#26252c"], "#0b0b0e", { size: 0.012, width: 0.15, seed: 7 });

  const chickMottle = mottle("#8e9198", "#b5b8be", { size: 0.025, seed: 5 });
  const chickP = paint((p, n) => mix(chickMottle.at(p, n), "#d6d8dc", 0.5 * smoothstep(0.2, 0.9, n.z)));
  const chickHeadP = paint((p) => {
    const qx = p.x;
    const qy = p.y - 0.228;
    const qz = p.z - 0.31;
    const m = (qx / 0.055) ** 2 + (qy / 0.026) ** 2;
    const mask = smoothstep(1.15, 0.85, m) * smoothstep(-0.005, 0.02, qz);
    return mix("#1b1c21", "#f4f4f2", mask);
  });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.12, 0.02] });
  const spine = b.chain("spine", [[0, 0.12, 0.02], [0, 0.42, 0.02], [0, 0.7, 0.0]], {
    parent: "root",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    up: [0, 0, 1],
  });
  const neck = b.chain("neck", [[0, 0.7, 0.0], [0, 0.86, -0.01], [0, 0.95, 0.0]], {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
    up: [0, 0, 1],
  });
  b.joint("head", { parent: "neck2", at: [0, 0.95, 0.0], dir: [0, 1, 0.15], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.99, 0.1], dir: [0, -0.15, 1], role: "jaw" });
  b.joint("tail1", { parent: "root", at: [0, 0.16, -0.1], aim: [0, 0.035, -0.3], role: "tail" });

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.12, 0.02], w: 0.2, h: 0.18 },
      { at: [0, 0.24, 0.03], w: 0.4, h: 0.36 },
      { at: [0, 0.42, 0.02], w: 0.46, h: 0.4 },
      { at: [0, 0.62, 0.0], w: 0.4, h: 0.34 },
      { at: [0, 0.8, -0.01], w: 0.26, h: 0.24 },
      { at: [0, 0.93, 0.0], w: 0.2, h: 0.2 },
    ],
    { color: P, bone: [spine, neck], sides: 16, name: "body" },
  );

  // brood-pouch fold over the chick
  b.part(new THREE.SphereGeometry(1, 14, 8), P, {
    at: [0, 0.3, 0.2],
    scale: [0.17, 0.07, 0.09],
    bone: "spine1",
    name: "broodFold",
  });

  // head
  b.part(new THREE.SphereGeometry(0.105, 16, 12), P, {
    at: [0, 1.0, 0.02],
    scale: [0.92, 1, 1.1],
    bone: "head",
    name: "head",
  });

  // eyes
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 10, 8), "#2b1810", {
      at: [0.072 * side, 1.03, 0.075],
      bone: "head",
      name: side > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), "#ffffff", {
      at: [0.08 * side, 1.036, 0.083],
      bone: "head",
    });
  }

  // beak: upper (black) and lower jaw with the orange-pink plate
  b.sweep(catmull([[0, 1.0, 0.1], [0, 0.996, 0.19], [0, 0.968, 0.27]]), (t: number) => [
    0.02 * (1 - 0.85 * t),
    0.017 * (1 - 0.8 * t),
  ], { color: INK, bone: "head", caps: { start: "round", end: "point" }, name: "beakUpper" });
  b.sweep(catmull([[0, 0.982, 0.1], [0, 0.978, 0.18], [0, 0.958, 0.255]]), (t: number) => [
    0.016 * (1 - 0.85 * t),
    0.009 * (1 - 0.7 * t),
  ], {
    bands: [
      [0.08, INK],
      [0.8, PINK],
      [1, INK],
    ],
    bone: "jaw",
    caps: { start: "round", end: "point" },
    name: "beakLower",
  });

  // tail
  b.sweep(catmull([[0, 0.16, -0.1], [0, 0.08, -0.24], [0, 0.04, -0.3]]), (t: number) => [
    0.05 * (1 - 0.6 * t),
    0.018 * (1 - 0.5 * t),
  ], { color: P, bone: "tail1", caps: { start: "round", end: "point" }, name: "tail" });

  // flippers, held slightly out
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const fl = b.chain(
      "flipper" + s,
      [[0.19 * side, 0.68, 0.0], [0.27 * side, 0.52, 0.02], [0.32 * side, 0.38, 0.05]],
      { parent: "chest", names: ["shoulder" + s, "elbow" + s, "wrist" + s], role: "wing", up: [0, 0, 1] },
    );
    b.sweep(fl, (t: number) => [0.016 * (1 - 0.35 * t), 0.058 * (1 - 0.6 * t * t)], {
      color: flipperPaint(side),
      name: "flipper" + s,
    });
  }

  // legs and big black feet
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const hx = 0.1 * side;
    const leg = b.chain("leg" + s, [[hx, 0.17, 0.03], [hx, 0.05, 0.06], [hx + 0.03 * side, 0.012, 0.2]], {
      parent: "root",
      names: ["hip" + s, "ankle" + s, "toe" + s],
      role: "leg",
    });
    b.sweep(leg, 0.042, { to: 0.45, color: FOOTP, name: "leg" + s });
    b.part(new THREE.SphereGeometry(1, 12, 6), FOOTP, {
      at: [hx + 0.01 * side, 0.024, 0.1],
      scale: [0.065, 0.022, 0.08],
      bone: "ankle" + s,
      name: "footPad" + s,
    });
    for (const k of [-1, 0, 1]) {
      const a = ((8 * side + k * 22) * Math.PI) / 180;
      const base: [number, number, number] = [hx + 0.012 * side + k * 0.025, 0.024, 0.11];
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const len = k === 0 ? 0.12 : 0.1;
      const tip: [number, number, number] = [base[0] + dx * len, 0.018, base[2] + dz * len];
      b.capsule(base, tip, [0.02, 0.015], { color: FOOTP, bone: "ankle" + s });
      b.spike(tip, [dx, -0.35, dz], 0.03, 0.008, { color: CLAW, bone: "ankle" + s });
    }
  }

  // ---------- chick ----------
  b.chain("chickSpine", [[0, 0.05, 0.28], [0, 0.18, 0.3]], {
    parent: "root",
    names: ["chickBody", "chickNeck"],
    role: "spine",
  });
  b.joint("chickHead", { parent: "chickNeck", at: [0, 0.18, 0.3], dir: [0, 1, 0.3], role: "head" });
  b.joint("chickJaw", { parent: "chickHead", at: [0, 0.218, 0.36], dir: [0, -0.2, 1], role: "jaw" });

  const chickBody = b.part(new THREE.SphereGeometry(0.085, 14, 10), chickP, {
    at: [0, 0.095, 0.28],
    scale: [1, 1.05, 0.95],
    bone: "chickBody",
    name: "chickBody",
  });
  const chickHead = b.part(new THREE.SphereGeometry(0.06, 14, 10), chickHeadP, {
    at: [0, 0.225, 0.31],
    bone: "chickHead",
    name: "chickHead",
  });

  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.01, 8, 6), "#0c0c10", {
      at: [0.024 * side, 0.233, 0.36],
      bone: "chickHead",
      name: "chickEye" + s,
    });
    b.part(new THREE.SphereGeometry(0.003, 6, 4), "#ffffff", {
      at: [0.027 * side, 0.237, 0.368],
      bone: "chickHead",
    });
    b.joint("chickFlipper" + s, {
      parent: "chickBody",
      at: [0.07 * side, 0.12, 0.28],
      aim: [0.115 * side, 0.075, 0.3],
      role: "wing",
    });
    b.capsule([0.07 * side, 0.12, 0.28], [0.115 * side, 0.075, 0.3], [0.017, 0.011], {
      color: chickP,
      bone: "chickFlipper" + s,
    });
    b.capsule([0.03 * side, 0.008, 0.33], [0.036 * side, 0.008, 0.362], 0.008, {
      color: "#2c2b30",
      bone: "chickBody",
    });
  }
  b.spike([0, 0.222, 0.358], [0, 0.215, 0.398], null, 0.009, { color: "#2a2a2e", bone: "chickHead" });
  b.spike([0, 0.214, 0.356], [0, 0.209, 0.388], null, 0.006, { color: "#3a3a40", bone: "chickJaw" });

  // fluffy down
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C10 50 4 40 6 20 C8 30 11 34 12 26 C13 14 16 6 16 0 C17 8 19 16 20 26 C21 34 24 30 26 20 C28 40 22 50 16 64Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(chickBody).scatter(80, { rng: rng(9), minDist: 0.011 });
  b.cards(bodyHits, tuft, {
    size: [0.028, 0.04],
    lean: 60,
    flow: [0, -1, 0.2],
    bend: 25,
    vary: 0.3,
    spin: 25,
    rng: rng(11),
    color: chickP,
    name: "chickDown",
  });
  const headHits = b
    .surface(chickHead)
    .scatter(16, { rng: rng(4), minDist: 0.012, filter: (h) => h.n.y > 0.35 && h.n.z < 0.6 });
  b.cards(headHits, tuft, {
    size: [0.02, 0.03],
    lean: 35,
    flow: [0, 0, -1],
    bend: 20,
    vary: 0.3,
    spin: 30,
    rng: rng(13),
    color: "#34353c",
    name: "chickCrown",
  });

  return b.root;
}
