```ts
import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, polyline, limb, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Fruit bat with fig",
  description:
    "Golden-brown flying fox with wings spread on long finger bones, hooked thumb claws, fox-like face, clutching a half-eaten fig in its feet.",
};

const GOLD = "#c88a3a";
const GOLD2 = "#e3a850";
const TAN = "#e6c58c";
const FACE = "#a8702f";
const EARC = "#7a4a22";
const PINK = "#d9998e";
const BLACK = "#0f0c0d";
const BONE = "#4a4048";
const CLAW = "#2a2326";
const FEET = "#5a3a22";
const WHITE = "#ffffff";
const FLESH = "#b3314a";
const SEED = "#f0dca0";
const STEM = "#5a6b36";

export default function build() {
  const b = createBuilder({ name: "fruitBat" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.45, -0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.45, -0.1],
      [0, 0.47, -0.01],
      [0, 0.5, 0.09],
      [0, 0.54, 0.17],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];
  const head = b.joint("head", { parent: chest, at: spine.at(1), dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.035 }),
    aim: head.local({ forward: 0.12, down: 0.04 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(spine, [0.055, 0.085, 0.095, 0.07], {
    color: countershade(GOLD, TAN, { level: -0.1 }),
    sides: 10,
  });
  const skin = b.surface(body);
  for (const hit of skin.scatter(90, { rng: rng(11), minDist: 0.028, filter: (h) => h.n.y > -0.7 })) {
    b.stick(new THREE.ConeGeometry(0.018, 0.055, 5), GOLD2, hit, { embed: 0.3 });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.056, 10, 8), FACE, { bone: head, at: head.local({ forward: 0.03 }) });
  b.capsule(head.local({ forward: 0.05 }), head.local({ forward: 0.135, down: 0.005 }), [0.042, 0.026], {
    bone: head,
    color: FACE,
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(0.019, 8, 6).scale(1.25, 0.85, 1), BLACK, {
    bone: head,
    at: head.local({ forward: 0.153, up: 0.004 }),
  });
  // lower jaw
  b.capsule(jaw.at, head.local({ forward: 0.125, down: 0.042 }), [0.028, 0.016], {
    bone: jaw,
    color: TAN,
    sides: 8,
  });
  for (const s of [1, -1]) {
    // fangs
    b.spike(head.local({ left: s * 0.014, forward: 0.12, down: 0.018 }), [0, -1, 0], 0.018, 0.005, {
      bone: head,
      color: SEED,
      sides: 5,
    });
    // eyes
    const ePos = head.local({ left: s * 0.038, forward: 0.07, up: 0.02 });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), BLACK, { bone: head, at: ePos });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.046, forward: 0.085, up: 0.033 }),
    });
    // ears
    const earBase = head.local({ left: s * 0.04, up: 0.045, forward: -0.005 });
    b.spike(earBase, [s * 0.35, 1, -0.25], 0.085, 0.03, { bone: head, color: EARC, sides: 6 });
    b.spike(head.local({ left: s * 0.04, up: 0.045, forward: 0.006 }), [s * 0.33, 1, -0.2], 0.065, 0.02, {
      bone: head,
      color: PINK,
      sides: 6,
    });
    // cheek fluff
    for (let i = 0; i < 3; i++) {
      b.spike(head.local({ left: s * 0.045, forward: 0.0 + i * 0.02, down: 0.02 }), [s * 1, -0.3, -0.2 + i * 0.3], 0.04, 0.012, {
        bone: head,
        color: GOLD2,
        sides: 5,
      });
    }
  }

  // ---------- wings ----------
  const WING = mottle("#43434d", "#2c2c34", { size: 0.07, contrast: 0.6 });
  const tips = [
    [0.68, 0.64, 0.15],
    [0.78, 0.58, -0.05],
    [0.7, 0.5, -0.28],
    [0.55, 0.42, -0.42],
  ];
  for (const s of [1, -1]) {
    const sf = s > 0 ? "L" : "R";
    const wrist: [number, number, number] = [s * 0.4, 0.62, 0.03];
    const arm = b.chain(
      `arm${sf}`,
      catmull([[s * 0.07, 0.5, 0.06], [s * 0.22, 0.55, -0.03], wrist]),
      { parent: chest, names: [`shoulder${sf}`, `elbow${sf}`, `wrist${sf}`], role: "arm" },
    );
    b.sweep(arm, [0.024, 0.014, 0.01], { color: BONE, sides: 6 });
    const wristJ = arm.joints[arm.joints.length - 1];

    // thumb and hooked claw
    const thumbTip = V(wrist[0], 0.63, 0.075);
    const thumb = b.chain(`thumb${sf}`, polyline([wrist, thumbTip]), {
      parent: wristJ,
      names: [`thumb${sf}`],
      role: "digit",
    });
    b.sweep(thumb, [0.012, 0.008], { color: BONE, sides: 6 });
    b.sweep(
      bezier(thumbTip, thumbTip.clone().add(V(0, 0.03, 0.025)), thumbTip.clone().add(V(0, -0.005, 0.048))),
      [0.008, 0],
      { bone: thumb.joints[0], color: CLAW, sides: 6, caps: "point" },
    );

    // fingers
    const fingers = tips.map((t, i) => {
      const tip = V(s * t[0], t[1], t[2]);
      const w = V(...wrist);
      const mid = w.clone().lerp(tip, 0.5).add(V(0, 0.025, 0));
      const n = i + 2;
      const f = b.chain(`finger${n}${sf}`, catmull([w, mid, tip]), {
        parent: wristJ,
        names: [`finger${n}${sf}1`, `finger${n}${sf}2`, `finger${n}${sf}3`],
        role: "digit",
      });
      b.sweep(f, [0.011, 0.0035], { color: BONE, sides: 5 });
      return f;
    });

    // membranes
    b.membrane(
      arm,
      [[s * 0.06, 0.53, 0.13], [s * 0.24, 0.62, 0.09], [s * 0.4, 0.63, 0.075]],
      { color: WING, thickness: 0.004 },
    );
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.004, scallop: 0.1 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.004, scallop: 0.14 });
    b.membrane(fingers[2], fingers[3], { color: WING, thickness: 0.004, scallop: 0.14 });
    b.membrane(
      fingers[3],
      [wrist, [s * 0.25, 0.5, -0.08], [s * 0.07, 0.45, -0.12]],
      { color: WING, thickness: 0.004, scallop: 0.1 },
    );
  }

  // ---------- fig ----------
  const FC = V(0, 0.092, -0.09);
  const figPaint = mottle("#5a2d5e", "#3a1d48", { size: 0.04, contrast: 0.7 });
  const figR = 0.092;
  b.part(
    new THREE.SphereGeometry(figR, 12, 9, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8),
    figPaint,
    { bone: hips, at: FC },
  );
  b.part(new THREE.SphereGeometry(0.087, 10, 8), FLESH, { bone: hips, at: FC });
  const seedRng = rng(5);
  for (let i = 0; i < 12; i++) {
    const phi = Math.PI / 2 + (seedRng() - 0.5) * 1.3;
    const th = 0.7 + seedRng() * 1.6;
    const p = V(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th))
      .multiplyScalar(0.088)
      .add(FC);
    b.part(new THREE.SphereGeometry(0.005, 4, 3), SEED, { bone: hips, at: p });
  }
  b.spike(FC.clone().add(V(0, 0.06, -0.07)), [0, 0.6, -0.8], 0.04, 0.014, { bone: hips, color: STEM, sides: 6 });

  // ---------- legs & clutching toes ----------
  for (const s of [1, -1]) {
    const sf = s > 0 ? "L" : "R";
    const hip = V(s * 0.045, 0.44, -0.11);
    const foot = V(s * 0.035, 0.195, -0.09);
    const pts = limb(hip, foot, [0.14, 0.14], [[0, 0, -1]]);
    const leg = b.chain(`leg${sf}`, pts, {
      parent: hips,
      names: [`hip${sf}`, `knee${sf}`, `ankle${sf}`],
      role: "leg",
      contact: [foot.x, foot.y, foot.z],
    });
    b.sweep(leg, [0.026, 0.012], { color: GOLD, sides: 6 });
    const ankle = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.014, 6, 5), FEET, { bone: ankle, at: foot });
    for (let i = 0; i < 4; i++) {
      const dz = (i - 1.5) * 0.012;
      const start = V(foot.x, foot.y - 0.003, foot.z + dz);
      const dir = V(s * 0.75, 0.7, (i - 1.5) * 0.4).normalize();
      const tip = FC.clone().add(dir.multiplyScalar(figR + 0.002));
      const ctrl = start.clone().lerp(tip, 0.5).add(V(s * 0.012, 0.02, 0));
      b.sweep(bezier(start, ctrl, tip), [0.0085, 0.004], {
        bone: ankle,
        color: i % 2 ? FEET : FACE,
        sides: 5,
        caps: "point",
      });
    }
  }

  return b.root;
}
```