```ts
import * as THREE from "three";
import { createBuilder, rng, limb, catmull, spots, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Feisty Rock Crab",
  description:
    "A brick-red speckled rock crab with knobbly shell, stalked eyes, eight pointed walking legs and one oversized raised claw, with a barnacle and seaweed on its back.",
};

const BRICK = "#b3321f";
const DEEP = "#7d2014";
const ORANGE = "#e8742a";
const CREAM = "#f2dcb4";
const BELLY = "#e6bd8c";
const DARK = "#2e100d";
const GREEN = "#3f7a3a";
const GREEN2 = "#2c5a2e";
const EYE = "#e9c64a";

export default function build() {
  const b = createBuilder({ name: "rockCrab" });
  const R = rng(11);

  const body = b.joint("body", { at: [0, 0.06, 0], role: "spine" });

  const coat = spots(spots(BRICK, ORANGE, { size: 0.018, amount: 0.38, seed: 1 }), CREAM, {
    size: 0.026,
    amount: 0.12,
    seed: 2,
  });
  const skin = countershade(coat, BELLY, { level: -0.25, soft: 0.3 });

  // ---- shell ----
  const shellC: [number, number, number] = [0, 0.067, 0];
  const shell = b.part(new THREE.SphereGeometry(1, 14, 9), skin, {
    at: shellC,
    bone: body,
    scale: [0.125, 0.05, 0.088],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), BELLY, {
    at: [0, 0.035, 0],
    bone: body,
    scale: [0.1, 0.024, 0.074],
  });
  const surf = b.surface(shell);

  // knobs
  const hits = surf.scatter(50, { rng: R, minDist: 0.022, filter: (h) => h.n.y > 0.25 });
  hits.forEach((h, i) => {
    const col = i % 5 === 0 ? CREAM : i % 3 === 0 ? ORANGE : DEEP;
    b.stick(new THREE.SphereGeometry(0.008 + R() * 0.004, 6, 4), col, h, { embed: 0.45, flat: true });
  });

  // edge spines
  for (const az of [28, 52, 76, 100, 124, 148, -28, -52, -76, -100, -124, -148]) {
    const h = surf.around(shellC).at(az, 6);
    if (h) b.stick(new THREE.ConeGeometry(0.009, 0.026, 5), DEEP, h, { embed: 0.25, flat: true });
  }
  // brow ridge between eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), DEEP, {
      at: [s * 0.03, 0.098, 0.068],
      bone: body,
      scale: [0.03, 0.012, 0.014],
    });
  }

  // ---- mouth ----
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.03), DEEP, { at: [0, 0.042, 0.085], bone: body });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.034, 0.075], dir: [0, -0.1, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.052, 0.01, 0.028), DARK, { at: [0, 0.03, 0.09], bone: jaw });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.008, 0.026), CREAM, { at: [s * 0.012, 0.03, 0.1], bone: jaw });
  }

  // ---- eyes on stalks ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base: [number, number, number] = [s * 0.034, 0.09, 0.07];
    const tip: [number, number, number] = [s * 0.05, 0.13, 0.095];
    const st = b.joint(`eyeStalk${S}`, { parent: body, at: base, aim: tip, role: "hinge" });
    b.rod(base, tip, 0.006, { bone: st, color: CREAM, sides: 6 });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), EYE, { at: tip, bone: st });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), DARK, {
      at: [s * 0.054, 0.132, 0.109],
      bone: st,
    });
  }

  // ---- walking legs ----
  const hipZ = [0.05, 0.015, -0.02, -0.055];
  const footZ = [0.13, 0.09, 0.02, -0.075];
  const footX = [0.2, 0.235, 0.235, 0.2];
  const lens = [
    [0.055, 0.07, 0.07],
    [0.06, 0.078, 0.08],
    [0.06, 0.078, 0.08],
    [0.055, 0.07, 0.07],
  ];
  const legSkin = countershade(coat, BELLY, { level: -0.4 });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const hip: [number, number, number] = [s * 0.085, 0.042, hipZ[i]];
      const foot: [number, number, number] = [s * footX[i], 0, footZ[i]];
      const pts = limb(hip, foot, lens[i], [
        [0, 1, 0],
        [0, 1, 0],
      ]);
      const leg = b.chain(`leg${i + 1}${S}`, pts, {
        parent: body,
        names: [`hip${i + 1}${S}`, `knee${i + 1}${S}`, `ankle${i + 1}${S}`, `foot${i + 1}${S}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, [0.0125, 0.0115, 0.009, 0.0055, 0], {
        sides: 6,
        bands: [
          [0.88, legSkin],
          [1, DARK],
        ],
      });
      // knee and ankle bulges
      for (let k = 1; k <= 2; k++) {
        b.part(new THREE.SphereGeometry(k === 1 ? 0.0145 : 0.011, 6, 5), k === 1 ? DEEP : BRICK, {
          at: pts[k],
          bone: leg.joints[k],
          flat: true,
        });
      }
    }
  }

  // ---- claws ----
  function claw(
    s: number,
    shoulder: number[],
    elbow: number[],
    wrist: number[],
    D: number[],
    k: number,
  ) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${S}`, catmull([shoulder, elbow, wrist]), {
      parent: body,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.008 * k + 0.009, 0.007 * k + 0.008], { sides: 7, color: skin });
    b.part(new THREE.SphereGeometry(0.008 * k + 0.012, 7, 5), DEEP, {
      at: elbow,
      bone: arm.joints[1],
      flat: true,
    });
    const hand = b.joint(`hand${S}`, { parent: arm.tip!, at: wrist, dir: D });
    const palm = b.part(new THREE.SphereGeometry(1, 10, 7), skin, {
      at: hand.local([0, 0.04 * k, 0]),
      quat: hand.quat,
      bone: hand,
      scale: [0.042 * k, 0.058 * k, 0.034 * k],
    });
    b.surface(palm)
      .scatter(Math.round(8 * k), { rng: R, minDist: 0.018 * k })
      .forEach((h, i) =>
        b.stick(new THREE.SphereGeometry(0.0065 * k + 0.002, 6, 4), i % 2 ? CREAM : DEEP, h, {
          embed: 0.4,
          flat: true,
        }),
      );
    // fixed finger
    b.rod(hand.local([0, 0.075 * k, -0.018 * k]), hand.local([0, 0.165 * k, -0.004 * k]), [0.02 * k, 0.003 * k], {
      bone: hand,
      color: BRICK,
      sides: 6,
      bands: [
        [0.6, BRICK],
        [1, DARK],
      ],
    });
    for (let j = 0; j < 4; j++) {
      const t = 0.3 + 0.17 * j;
      const y = 0.075 * k + 0.09 * k * t;
      const r = 0.02 * k * (1 - t) + 0.003 * k * t;
      const z = -0.018 * k + 0.014 * k * t + r * 0.85;
      b.part(new THREE.ConeGeometry(0.005 * k + 0.001, 0.014 * k, 5), CREAM, {
        at: hand.local([0, y, z]),
        dir: hand.dir([0, 0.3, 1]),
        bone: hand,
        flat: true,
      });
    }
    // movable finger (built open)
    const pin = b.joint(`pincer${S}`, {
      parent: hand,
      at: hand.local([0, 0.07 * k, 0.012 * k]),
      dir: hand.dir([0, 1, 0.5]),
      role: "hinge",
    });
    b.part(new THREE.SphereGeometry(0.017 * k, 7, 5), BRICK, { at: pin.at, bone: pin, flat: true });
    b.rod(pin.at, pin.local([0, 0.1 * k, 0]), [0.017 * k, 0.003 * k], {
      bone: pin,
      color: BRICK,
      sides: 6,
      bands: [
        [0.6, BRICK],
        [1, DARK],
      ],
    });
    for (let j = 0; j < 4; j++) {
      const t = 0.3 + 0.17 * j;
      const r = 0.017 * k * (1 - t) + 0.003 * k * t;
      b.part(new THREE.ConeGeometry(0.005 * k + 0.001, 0.014 * k, 5), CREAM, {
        at: pin.local([0, 0.1 * k * t, -r * 0.85]),
        dir: pin.dir([0, 0.3, -1]),
        bone: pin,
        flat: true,
      });
    }
  }
  // big raised claw (left)
  claw(1, [0.075, 0.055, 0.065], [0.14, 0.085, 0.11], [0.15, 0.15, 0.16], [0.05, 0.75, 0.65], 1.35);
  // small claw (right)
  claw(-1, [-0.07, 0.055, 0.07], [-0.115, 0.06, 0.125], [-0.085, 0.05, 0.17], [0.25, 0.1, 1], 0.62);

  // ---- barnacles ----
  const bar = (az: number, el: number, r: number, h: number) => {
    const hit = surf.around(shellC).at(az, el);
    if (!hit) return;
    b.stick(new THREE.CylinderGeometry(r * 0.7, r, h, 7), CREAM, hit, { embed: 0.3, flat: true });
    b.stick(new THREE.CylinderGeometry(r * 0.35, r * 0.35, h * 0.2, 6), DARK, hit.moved([0, h * 0.55, 0]), {
      embed: 0,
    });
  };
  bar(168, 52, 0.014, 0.022);
  bar(150, 55, 0.009, 0.014);
  bar(185, 48, 0.008, 0.012);

  // ---- seaweed ----
  const wh = surf.around(shellC).at(-150, 50);
  if (wh) {
    const hx = wh.at.x, hy = wh.at.y, hz = wh.at.z;
    const P = (dx: number, dy: number, dz: number) => [hx + dx, hy + dy, hz + dz];
    const strands = [
      [0.0, 0.0, GREEN],
      [-0.012, 0.01, GREEN2],
      [0.012, -0.008, GREEN],
    ];
    strands.forEach(([dx, dz, col], i) => {
      const pts = [P(0, -0.004, 0), P(dx * 2 - 0.01, 0.03, dz - 0.012), P(dx * 3 - 0.025, 0.04 - i * 0.004, dz - 0.05), P(dx * 3 - 0.035, 0.012, dz - 0.09)];
      b.sweep(catmull(pts), [0.005, 0.0015], {
        bone: body,
        color: col as string,
        sides: 4,
        caps: { start: "flat", end: "point" },
      });
      b.part(new THREE.SphereGeometry(0.006, 5, 4), GREEN2, {
        at: pts[2],
        bone: body,
        flat: true,
      });
    });
  }

  return b.root;
}
```