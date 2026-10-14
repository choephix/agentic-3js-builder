```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, polyline, limb, gradient, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description:
    "Candy-pink flamingo wading in shallow water: S-curved neck, bent two-part beak with black tip, coral wings with black flight feathers, knobbly-kneed rose legs and webbed feet.",
};

const PINK = "#ff9fb8";
const PINK_L = "#ffbcce";
const CORAL = "#ff6f6a";
const CORAL_D = "#f4524f";
const CORAL_M = "#ff837c";
const BLACK = "#1b1519";
const LEG = "#e8758a";
const LEG_D = "#cf5870";
const WEB = "#f394a5";
const BEAK = "#ffd3d8";
const YELLOW = "#fff0a0";
const WATER = "#9ad6dc";
const RIPPLE = "#dff6f3";

type P3 = [number, number, number];
const lerp3 = (a: P3, b: P3, t: number): P3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "flamingo" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, -0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, -0.1],
      [0, 0.98, 0.08],
      [0, 1.02, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );

  // ---------- body ----------
  const bodyPaint = gradient(mottle(PINK, PINK_L, { size: 0.12 }), "#ff8a91", [0, 0.95, 0.1], [0, 0.9, -0.45]);
  const body = b.sweep(
    catmull([
      [0, 0.93, -0.4],
      [0, 0.95, -0.1],
      [0, 0.99, 0.1],
      [0, 1.03, 0.26],
    ]),
    (t) => {
      const e = t < 0.5 ? 0.35 + 0.65 * Math.sin((t / 0.5) * Math.PI * 0.5) : 1 - 0.35 * Math.pow((t - 0.5) / 0.5, 2);
      return [0.04 + 0.125 * e, 0.05 + 0.13 * e];
    },
    { bone: [spine, hips], color: bodyPaint },
  );

  // feather scallops over the body
  const featherGeo = new THREE.SphereGeometry(0.04, 6, 4).scale(1, 0.4, 1.5);
  const hits = b.surface(body).scatter(70, {
    rng: rng(5),
    minDist: 0.075,
    filter: (h) => Math.abs(h.n.x) < 0.75 && h.n.y > -0.1,
  });
  hits.forEach((h, i) => b.stick(featherGeo, i % 2 ? PINK_L : "#ffaec2", h, { embed: 0.3, flat: true }));

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.93, -0.25],
      [0, 0.9, -0.45],
      [0, 0.86, -0.6],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.06 * (1 - t) + 0.025, 0.03 - 0.014 * t], { color: CORAL_M, caps: "point" });

  // ---------- neck (S curve) ----------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.04, 0.18],
      [0, 1.14, 0.36],
      [0, 1.3, 0.4],
      [0, 1.46, 0.3],
      [0, 1.6, 0.22],
      [0, 1.72, 0.27],
    ]),
    { parent: spine.joints[1], role: "neck", count: 5 },
  );
  b.sweep(neck, [0.082, 0.06, 0.042, 0.031, 0.027, 0.03, 0.032], {
    color: mottle(PINK_L, PINK, { size: 0.08 }),
  });

  // ---------- head ----------
  const head = b.joint("head", { parent: neck, at: neck.at(1).at, dir: [0, -0.12, 1], role: "head" });
  const H = (f: number, d: number, side = 0) => head.local({ forward: f, down: d, left: side });
  b.part(new THREE.SphereGeometry(0.05, 10, 8).scale(0.9, 0.95, 1.25), PINK_L, { bone: head, at: H(0.025, 0) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 8, 6), YELLOW, { bone: head, at: head.local({ left: s * 0.037, up: 0.022, forward: 0.02 }) });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone: head, at: head.local({ left: s * 0.05, up: 0.022, forward: 0.022 }) });
  }

  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0.03, 0.02),
    aim: H(0.15, 0.03),
    role: "jaw",
  });

  // upper bill: bent down, black tip
  b.sweep(catmull([H(0.03, 0.005), H(0.1, 0.003), H(0.14, 0.03), H(0.155, 0.075)]),
    (t) => [0.03 - 0.018 * t, (0.024 - 0.014 * t) * (1 + 0.2 * Math.sin(Math.PI * t))],
    { bone: head, color: BEAK, bands: [[0.62, BEAK], [1, BLACK]], sides: 8 },
  );
  // lower bill
  b.sweep(catmull([H(0.03, 0.026), H(0.1, 0.022), H(0.138, 0.044), H(0.15, 0.07)]),
    (t) => [0.027 - 0.016 * t, 0.014 - 0.006 * t],
    { bone: jaw, color: BEAK, bands: [[0.64, BEAK], [1, BLACK]], sides: 8 },
  );

  // ---------- legs & feet ----------
  const water = b.part(new THREE.CylinderGeometry(0.8, 0.8, 0.02, 28), WATER, { bone: hips, at: [0, 0.01, 0] });
  void water;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.09;
    const F: P3 = [x, 0.03, 0.02];
    const pts = limb([x, 0.86, 0.0], F, [0.44, 0.44], [0, 0, -1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, 0.02, 0.1],
    });
    const hipJ = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.joints[2];

    b.part(new THREE.SphereGeometry(0.1, 8, 6).scale(0.8, 1.3, 1.1), PINK, { bone: hipJ, at: [s * 0.1, 0.83, 0.0] });
    b.sweep(leg, [0.03, 0.02, 0.03, 0.014, 0.011], { color: LEG });
    // knobbly knee
    b.part(new THREE.SphereGeometry(0.03, 6, 4), LEG_D, { bone: knee, at: knee.at, flat: true });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), LEG_D, { bone: knee, at: knee.local({ forward: 0.02, down: 0.015 }), flat: true });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), LEG_D, { bone: ankle, at: ankle.at, flat: true });

    // toes
    const tipOuter: P3 = [x + s * 0.1, 0.026, 0.19];
    const tipMid: P3 = [x, 0.026, 0.25];
    const tipInner: P3 = [x - s * 0.08, 0.026, 0.18];
    const toes: [string, P3][] = [
      ["Out", tipOuter],
      ["Mid", tipMid],
      ["In", tipInner],
    ];
    for (const [n, tip] of toes) {
      const toe = b.chain(`toe${n}${side}`, polyline([F, tip]), {
        parent: ankle,
        names: [`toe${n}${side}`],
        role: "digit",
      });
      b.sweep(toe, [0.014, 0.009], { color: LEG_D, bands: [[0.85, LEG_D], [1, "#5a2a36"]] });
    }
    const w1 = lerp3(lerp3(tipOuter, tipMid, 0.5), F, 0.4);
    const w2 = lerp3(lerp3(tipMid, tipInner, 0.5), F, 0.4);
    b.slab([F, tipOuter, w1, tipMid, w2, tipInner], { color: WEB, thickness: 0.006, bone: ankle });
    // hind toe
    b.rod(F, [x, 0.026, -0.06], [0.011, 0.007], { color: LEG_D, bone: ankle });

    // ripples
    b.part(new THREE.TorusGeometry(0.13, 0.004, 4, 20), RIPPLE, { bone: hips, at: [x, 0.021, 0.1], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.2, 0.003, 4, 24), RIPPLE, { bone: hips, at: [x, 0.021, 0.1], rotation: [90, 0, 0] });

    // ---------- wing ----------
    const wing = b.chain(
      `wing${side}`,
      polyline([
        [s * 0.16, 1.0, 0.14],
        [s * 0.17, 0.98, -0.12],
        [s * 0.15, 0.96, -0.45],
      ]),
      {
        parent: spine.joints[0],
        names: [`shoulder${side}`, `wingElbow${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    const wb = wing.joints[0];
    const ex = { x: [-s * 0.05, 0, -1] as P3, y: [0, 1, 0] as P3, bone: wb };
    b.extrude(
      [[0, 0.13], [0.14, 0.19], [0.3, 0.13], [0.44, 0.03], [0.5, -0.07], [0.4, -0.17], [0.22, -0.22], [0.06, -0.19], [-0.01, -0.07]],
      { at: [s * 0.165, 1.0, 0.14], ...ex, thickness: 0.03, bevel: 0.006, smoothing: 1,
        color: gradient(PINK_L, CORAL, [0, 1, 0.14], [0, 1, -0.3]) },
    );
    b.extrude(
      [[0.03, 0.12], [0.18, 0.17], [0.34, 0.12], [0.4, 0.04], [0.3, 0.0], [0.22, 0.04], [0.12, 0.0], [0.03, 0.02]],
      { at: [s * 0.167, 1.0, 0.14], ...ex, thickness: 0.034, bevel: 0.004, smoothing: 1, color: CORAL_M },
    );
    b.extrude(
      [[0.05, -0.02], [0.2, 0.0], [0.34, -0.04], [0.38, -0.12], [0.28, -0.16], [0.18, -0.13], [0.08, -0.15], [0.03, -0.08]],
      { at: [s * 0.171, 1.0, 0.14], ...ex, thickness: 0.034, bevel: 0.004, smoothing: 1, color: CORAL_D },
    );
    b.extrude(
      [[0.3, 0.07], [0.5, 0.02], [0.68, -0.08, "sharp"], [0.55, -0.1], [0.62, -0.17, "sharp"], [0.46, -0.15], [0.46, -0.23, "sharp"], [0.3, -0.19]],
      { at: [s * 0.172, 1.0, 0.14], ...ex, thickness: 0.036, color: BLACK },
    );
  }

  return b.root;
}
```