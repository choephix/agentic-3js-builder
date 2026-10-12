```ts
import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, limb, mottle, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "crab",
  description:
    "A stylised red crab: a domed carapace with lateral spines, eyes on stalks, raised black-tipped pincers and four pairs of jointed walking legs.",
};

type V3 = [number, number, number];

const SHELL = "#d8442a";
const SHELL_LIGHT = "#f47a3f";
const SHELL_DEEP = "#7b1c14";
const CREAM = "#f7dfb0";
const EYE = "#fff8ea";
const INK = "#1c1412";

// An ellipsoid: a unit sphere stretched to half-sizes rx, ry, rz (metres).
// Few segments on purpose, the low-poly facets are part of the look.
const ellipsoid = (rx: number, ry: number, rz: number, seg = 10) =>
  new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)).scale(rx, ry, rz);

// Walking legs, front to back, on the left side (x > 0). Roots sit at the carapace
// edge; feet rest on the floor (y = 0.008 is the foot's round-cap radius).
const WALK: { root: V3; foot: V3 }[] = [
  { root: [0.15, 0.13, 0.0], foot: [0.38, 0.008, 0.08] },
  { root: [0.14, 0.13, -0.06], foot: [0.4, 0.008, -0.14] },
  { root: [0.095, 0.125, -0.11], foot: [0.33, 0.008, -0.24] },
  { root: [0.05, 0.12, -0.13], foot: [0.2, 0.008, -0.3] },
];

export default function build() {
  const b = createBuilder({ name: "crab" });

  // Mottled red carapace with darker spots, cream where it faces down.
  const shell = countershade(
    spots(mottle(SHELL, SHELL_LIGHT, { size: 0.16, seed: 4 }), SHELL_DEEP, { size: 0.06, amount: 0.25, seed: 9 }),
    CREAM,
    { level: 0 },
  );
  const legPaint = countershade(SHELL, CREAM, { level: 0.1 });

  // Skeleton root: the carapace.
  const body = b.joint("body", { at: [0, 0.14, 0], role: "spine" });
  const carapace = b.part(ellipsoid(0.17, 0.068, 0.14, 12), shell, {
    bone: body,
    at: [0, 0.14, 0],
    flat: true,
  });

  // Tucked abdomen flap and a short mouth plate, both cream.
  b.part(ellipsoid(0.09, 0.03, 0.07, 9), CREAM, { bone: body, at: [0, 0.085, -0.1], flat: true });
  b.part(new THREE.BoxGeometry(0.1, 0.035, 0.035), CREAM, { bone: body, at: [0, 0.108, 0.14] });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eye stalk: a short curved neck ending in a ball eye.
    const stalk = b.chain(
      `eyeStalk${side}`,
      catmull([
        [s * 0.07, 0.165, 0.1],
        [s * 0.075, 0.22, 0.12],
        [s * 0.075, 0.26, 0.13],
      ]),
      { parent: body, names: [`stalk${side}`, `stalkTip${side}`, `eye${side}`], role: "neck" },
    );
    b.sweep(stalk, (t: number) => 0.014 - 0.004 * t, { color: SHELL_LIGHT });
    const eyeTip = stalk.tip!;
    b.part(new THREE.SphereGeometry(0.03, 10, 7), EYE, {
      bone: eyeTip,
      at: [s * 0.075, 0.28, 0.14],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), INK, {
      bone: eyeTip,
      at: [s * 0.075, 0.282, 0.164],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), EYE, {
      bone: eyeTip,
      at: [s * 0.08, 0.288, 0.175],
    });

    // Raised cheliped: shoulder, elbow, wrist, then the hand as the tip joint.
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.12, 0.135, 0.085],
        [s * 0.2, 0.17, 0.2],
        [s * 0.2, 0.2, 0.31],
        [s * 0.14, 0.2, 0.39],
      ]),
      { parent: body, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, (t: number) => 0.03 - 0.01 * t, { color: shell });

    // Palm on the hand joint.
    const hand = arm.tip!;
    b.part(ellipsoid(0.042, 0.034, 0.048, 9), shell, {
      bone: hand,
      at: [s * 0.14, 0.2, 0.395],
      flat: true,
    });

    // Fixed finger: a tapering, hooked blade with a black tip.
    b.sweep(
      bezier([s * 0.13, 0.2, 0.42], [s * 0.12, 0.196, 0.5], [s * 0.04, 0.19, 0.57]),
      (t: number) => 0.021 - 0.018 * t,
      {
        bone: hand,
        color: SHELL,
        bands: [
          [0.7, SHELL],
          [1, INK],
        ],
        caps: { start: "round", end: "point" },
      },
    );

    // Moving finger: a joint hinged on the palm, held open.
    const dactyl = b.joint(`dactyl${side}`, { parent: hand, at: [s * 0.17, 0.2, 0.4], role: "digit" });
    b.sweep(
      bezier([s * 0.17, 0.2, 0.4], [s * 0.19, 0.196, 0.5], [s * 0.1, 0.19, 0.6]),
      (t: number) => 0.018 - 0.015 * t,
      {
        bone: dactyl,
        color: SHELL,
        bands: [
          [0.7, SHELL],
          [1, INK],
        ],
        caps: { start: "round", end: "point" },
      },
    );
    b.part(new THREE.SphereGeometry(0.02, 8, 6), SHELL_DEEP, {
      bone: dactyl,
      at: [s * 0.17, 0.2, 0.4],
      flat: true,
    });
  }

  // Four pairs of walking legs, each a three-segment limb landing on the floor.
  WALK.forEach((w, i) => {
    const n = i + 1;
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const mirrored = (p: V3): V3 => [s * p[0], p[1], p[2]];
      const pts = limb(mirrored(w.root), mirrored(w.foot), [0.14, 0.13, 0.12], [
        [0, 1, 0],
        [0, 1, 0],
      ]);
      const walker = b.chain(`leg${n}${side}`, pts, {
        parent: body,
        names: [`hip${n}${side}`, `knee${n}${side}`, `ankle${n}${side}`, `foot${n}${side}`],
        role: "leg",
      });
      b.sweep(walker, (t: number) => 0.02 - 0.012 * t, {
        color: legPaint,
        caps: "round",
      });
      // Knuckles at the knee and ankle.
      b.part(new THREE.SphereGeometry(0.018, 7, 5), SHELL_DEEP, { at: pts[1], flat: true });
      b.part(new THREE.SphereGeometry(0.013, 6, 4), SHELL_DEEP, { at: pts[2], flat: true });
    }
  });

  // Surface detail on the carapace.
  const shellSurf = b.surface(carapace);

  // Cream tubercles scattered over the top of the shell.
  for (const h of shellSurf.scatter(36, { rng: rng(12), minDist: 0.035, filter: (h) => h.n.y > 0.25 })) {
    b.stick(new THREE.SphereGeometry(0.007, 5, 4), CREAM, h, { embed: 0.35, flat: true });
  }

  // Lateral spines along each side edge of the shell.
  const lateral: [number, number][] = [
    [46, 24],
    [66, 14],
    [88, 4],
  ];
  for (const s of [1, -1]) {
    for (const [az, el] of lateral) {
      const hit = shellSurf.around([0, 0.14, 0]).at(s * az, el);
      if (hit) b.stick(new THREE.ConeGeometry(0.017, 0.055, 6), SHELL_DEEP, hit, { flat: true });
    }
  }

  // Forward rostrum between the eye stalks.
  const rostrum = shellSurf.around([0, 0.14, 0]).at(0, 12);
  if (rostrum) b.stick(new THREE.ConeGeometry(0.02, 0.07, 6), SHELL_DEEP, rostrum, { flat: true });

  return b.root;
}
```