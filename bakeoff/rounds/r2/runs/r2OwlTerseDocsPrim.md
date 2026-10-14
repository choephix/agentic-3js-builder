```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull, paint, mottle, stripes, rng } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description: "A stylized upright owl with ear tufts, facial discs, folded wings, barred tail and taloned feet, rigged for posing.",
};

const BROWN = "#8a6a45";
const DARK = "#43301f";
const CREAM = "#e6d5b0";
const TAN = "#c29a5c";
const DISC = "#dcc79f";
const EYE = "#f0b414";
const BLACK = "#0e0e0e";
const BEAK = "#3a362f";
const TALON = "#2a2623";

export default function build() {
  const b = createBuilder({ name: "owl" });
  const rand = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.1, -0.025], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.1, -0.025], [0, 0.2, -0.005], [0, 0.3, 0.01]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const head = b.joint("head", { parent: chest, at: [0, 0.34, 0.015], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.085, up: -0.03 }),
    aim: head.local({ forward: 0.12, up: -0.032 }),
    role: "jaw",
  });
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.1, -0.07], dir: [0, -0.35, -1], role: "tail" });

  // ---------- paints ----------
  const backPaint = mottle(BROWN, DARK, { size: 0.035, contrast: 0.7, seed: 3 });
  const chestPaint = stripes(CREAM, TAN, { size: 0.03, axis: "y", width: 0.35, wobble: 0.4, seed: 2 });
  const bodyPaint = paint((_p, n) => (n.z > 0.1 ? chestPaint : backPaint));
  const wingPaint = stripes(BROWN, DARK, { size: 0.045, axis: "y", width: 0.3, wobble: 0.3, seed: 5 });
  const tailPaint = paint((_p, _n, s) => (Math.floor(s[1] / 0.035) % 2 === 0 ? BROWN : DARK));

  // ---------- body ----------
  const body = b.sweep(spine, [0.07, 0.1, 0.098, 0.075], { color: bodyPaint, sides: 10 });
  const skin = b.surface(body);
  for (const hit of skin.scatter(46, { rng: rand, minDist: 0.028, filter: (h) => h.n.z > 0.45 && h.at.y > 0.09 })) {
    b.stick(new THREE.SphereGeometry(0.012, 5, 4), DARK, hit, { embed: 0.3, scale: [1, 0.35, 1.5] });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.085, 10, 8), backPaint, { bone: head, at: head.at, scale: [1.18, 0.86, 0.95] });
  b.part(new THREE.TorusGeometry(0.078, 0.014, 5, 12), DISC, {
    bone: head,
    at: head.local({ down: 0.05, forward: 0.005 }),
    rotation: [90, 0, 0],
  });
  for (const s of [1, -1]) {
    const c = head.local({ left: s * 0.045, forward: 0.055, up: -0.002 });
    b.part(new THREE.SphereGeometry(0.06, 10, 8), DISC, { bone: head, at: c, scale: [1, 1.05, 0.4] });
    b.part(new THREE.TorusGeometry(0.058, 0.006, 4, 14), DARK, {
      bone: head,
      at: head.local({ left: s * 0.045, forward: 0.07, up: -0.002 }),
      scale: [1, 1.05, 1],
    });
    // eye
    const ec = head.local({ left: s * 0.04, forward: 0.083, up: 0.008 });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BLACK, { bone: head, at: ec, scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.025, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.04, forward: 0.09, up: 0.008 }),
      scale: [1, 1, 0.7],
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.04, forward: 0.104, up: 0.008 }),
    });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.035, forward: 0.11, up: 0.016 }),
    });
    // brow
    b.rod(
      head.local({ left: s * 0.075, forward: 0.065, up: 0.04 }),
      head.local({ left: s * 0.012, forward: 0.09, up: 0.034 }),
      0.011,
      { bone: head, color: DARK },
    );
    // ear tuft
    b.spike(head.local({ left: s * 0.05, forward: 0.0, up: 0.055 }), [s * 0.3, 1, -0.15], 0.085, 0.016, {
      bone: head,
      color: DARK,
    });
    b.spike(head.local({ left: s * 0.05, forward: 0.012, up: 0.058 }), [s * 0.28, 1, -0.1], 0.05, 0.01, {
      bone: head,
      color: TAN,
    });
  }
  // beak
  b.part(new THREE.ConeGeometry(0.018, 0.048, 6), BEAK, {
    bone: head,
    at: head.local({ forward: 0.1, up: -0.01 }),
    dir: [0, -0.55, 1],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.008, 0.03), BEAK, {
    bone: jaw,
    at: head.local({ forward: 0.1, up: -0.034 }),
    dir: [0, -0.1, 1],
    axis: "z",
  });

  // ---------- wings ----------
  const wingOutline: [number, number][] = [
    [0, 0], [0.05, 0.02], [0.11, -0.04], [0.17, -0.12], [0.2, -0.2],
    [0.15, -0.205], [0.1, -0.17], [0.04, -0.12], [-0.01, -0.07], [-0.015, -0.02],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.092, 0.27, 0.04];
    const wing = b.chain(
      `wing${S}`,
      polyline([sh, [s * 0.1, 0.19, -0.03], [s * 0.1, 0.09, -0.15]]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `wrist${S}`], role: "wing" },
    );
    b.extrude(wingOutline, {
      at: sh,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: wingPaint,
      bone: wing.joints[0],
    });
    // pale shoulder covert
    b.part(new THREE.SphereGeometry(0.03, 6, 5), CREAM, {
      bone: wing.joints[0],
      at: [s * 0.104, 0.245, 0.01],
      scale: [0.5, 1, 1.4],
    });
  }

  // ---------- tail ----------
  const tailOutline: [number, number][] = [
    [-0.04, 0], [0.04, 0], [0.058, 0.1], [0.05, 0.17], [0, 0.185], [-0.05, 0.17], [-0.058, 0.1],
  ];
  b.extrude(tailOutline, {
    at: tail.at,
    x: [1, 0, 0],
    y: [0, -0.3, -1],
    thickness: 0.014,
    bevel: 0.003,
    smoothing: 1,
    color: tailPaint,
    bone: tail,
  });

  // ---------- legs and feet ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.05;
    const leg = b.chain(`leg${S}`, polyline([[x, 0.1, 0.0], [x, 0.035, 0.022]]), {
      parent: hips,
      names: [`hip${S}`, `ankle${S}`],
      role: "leg",
      contact: [x, 0, 0.05],
    });
    b.sweep(leg, [0.036, 0.027], { color: stripes(CREAM, TAN, { size: 0.02, axis: "y", width: 0.3 }), sides: 8 });
    const ankle = leg.tip!;
    const ankleP: [number, number, number] = [x, 0.035, 0.022];
    const toes: [number, number, number][] = [
      [x - 0.024, 0.01, 0.085],
      [x, 0.01, 0.095],
      [x + 0.024, 0.01, 0.085],
      [x, 0.01, -0.03],
    ];
    toes.forEach((tip, i) => {
      const toe = b.joint(`toe${S}${i + 1}`, { parent: ankle, at: ankleP, aim: tip, role: "digit" });
      b.rod(ankleP, tip, [0.011, 0.008], { bone: toe, color: TAN, sides: 6 });
      const fwd = i < 3 ? 1 : -1;
      b.spike(tip, [0, -0.55, fwd], 0.03, 0.008, { bone: toe, color: TALON, sides: 5 });
    });
  }

  return b.root;
}
```