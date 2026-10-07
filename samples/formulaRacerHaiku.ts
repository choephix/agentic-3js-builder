import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

type V = [number, number, number];

export const meta = {
  name: "Open-wheel formula racer",
  description:
    "A low-poly open-wheel single-seater at real size (5.7 m long, 2.0 m wide, 0.98 m tall): red faceted monocoque with a white nose tip and race numbers, sidepods with bargeboards, vents and pinstripes, a halo over a gold-visored helmet, an airbox and shark fin, a three-element front wing and a DRS-equipped rear wing, steered front wheels with compound rings, and glowing exhaust and rear light.",
  style: "low-poly",
  commit: "b816db2",
};

const RED = "#d72f22";
const DEEP = "#8c1a14";
const WHITE = "#f3f1ea";
const CARBON = "#1b1d23";
const CARBON2 = "#2f323b";
const BLACK = "#0d0e11";
const GUN = "#60666f";
const SILVER = "#cfd5de";
const TYRE = "#131316";
const GOLD = "#e8ad2e";
const YELLOW = "#f5cc3a";
const GLOW_ORANGE = "#ff9d3a";
const GLOW_RED = "#ff2b2b";

// Model-space geometry helpers. Every piece is built where it sits, then put on a joint.
const cylG = (r: number, h: number, sides: number, at: V, axis: "x" | "z") => {
  const g = new THREE.CylinderGeometry(r, r, h, sides);
  if (axis === "x") g.rotateZ(Math.PI / 2);
  else g.rotateX(Math.PI / 2);
  return g.translate(at[0], at[1], at[2]);
};
const boxG = (size: V, at: V) => new THREE.BoxGeometry(size[0], size[1], size[2]).translate(at[0], at[1], at[2]);

// Paints: crisp colour blocking, no gradients.
const nosePaint = paint((p) => (p.z > 2.0 ? WHITE : RED));
const sidepodPaint = paint((p) => (p.y < 0.2 ? DEEP : RED));
const coverPaint = paint((p, n) => (n.y > 0.6 && Math.abs(p.x) < 0.03 ? WHITE : RED));

export default function build() {
  const b = createBuilder({ name: "formulaRacerHaiku" });

  const put = (g: THREE.BufferGeometry, color: Fill, bone: Joint) =>
    b.part(g, color, { bone, at: [0, 0, 0], flat: true });
  const rod = (p0: V, p1: V, r: number, bone: Joint, color: string) =>
    b.rod(p0, p1, r, { bone, color, sides: 5 });

  // Skeleton: a chassis root, steered front uprights with spinning wheels, spinning rear wheels,
  // a steering wheel, two front-wing flaps and the DRS flap.
  const chassis = b.joint("chassis", { at: [0, 0.4, 0], role: "spine" });
  const steerFL = b.joint("steerFL", { parent: chassis, at: [0.74, 0.33, 1.85], role: "hinge" });
  const steerFR = b.joint("steerFR", { parent: chassis, at: [-0.74, 0.33, 1.85], role: "hinge" });
  const wheelFL = b.joint("wheelFL", { parent: steerFL, at: [0.74, 0.33, 1.85], role: "hinge" });
  const wheelFR = b.joint("wheelFR", { parent: steerFR, at: [-0.74, 0.33, 1.85], role: "hinge" });
  const wheelRL = b.joint("wheelRL", { parent: chassis, at: [0.74, 0.36, -1.75], role: "hinge" });
  const wheelRR = b.joint("wheelRR", { parent: chassis, at: [-0.74, 0.36, -1.75], role: "hinge" });
  const steeringWheel = b.joint("steeringWheel", { parent: chassis, at: [0, 0.5, 0.4], role: "hinge" });
  const frontFlapLow = b.joint("frontFlapLow", { parent: chassis, at: [0, 0.2, 2.85], role: "hinge" });
  const frontFlapHigh = b.joint("frontFlapHigh", { parent: chassis, at: [0, 0.26, 2.85], role: "hinge" });
  const drsFlap = b.joint("drsFlap", { parent: chassis, at: [0, 0.92, -2.4], role: "hinge" });

  // Wheels: faceted tyre, compound ring on the outer face, five-spoke rim, lug nuts.
  const wheel = (s: 1 | -1, front: boolean, joint: Joint) => {
    const r = front ? 0.33 : 0.36;
    const w = front ? 0.36 : 0.42;
    const cx = s * 0.74;
    const cy = r;
    const cz = front ? 1.85 : -1.75;
    const face = cx + s * (w / 2);
    put(cylG(r, w, 10, [cx, cy, cz], "x"), TYRE, joint);
    put(
      new THREE.RingGeometry(0.2, r - 0.02, 10)
        .rotateY((s * Math.PI) / 2)
        .translate(face + s * 0.002, cy, cz),
      front ? RED : YELLOW,
      joint,
    );
    put(cylG(0.19, 0.016, 10, [face + s * 0.008, cy, cz], "x"), SILVER, joint);
    for (let k = 0; k < 5; k++) {
      const a = (k * 2 * Math.PI) / 5;
      put(
        new THREE.BoxGeometry(0.02, 0.15, 0.05)
          .translate(0, 0.12, 0)
          .rotateX(a)
          .translate(face + s * 0.026, cy, cz),
        SILVER,
        joint,
      );
      const lug = a + Math.PI / 5;
      put(
        cylG(0.018, 0.03, 6, [face + s * 0.035, cy + 0.1 * Math.cos(lug), cz + 0.1 * Math.sin(lug)], "x"),
        GOLD,
        joint,
      );
    }
    put(cylG(0.055, 0.03, 8, [face + s * 0.03, cy, cz], "x"), CARBON2, joint);
  };
  for (const s of [1, -1] as const) {
    wheel(s, true, s > 0 ? wheelFL : wheelFR);
    wheel(s, false, s > 0 ? wheelRL : wheelRR);
  }

  // Monocoque tub, cockpit rim and driver.
  b.loft(
    [
      { at: [0, 0.3, 1.2], w: 0.34, h: 0.26 },
      { at: [0, 0.34, 0.6], w: 0.46, h: 0.36 },
      { at: [0, 0.36, -0.1], w: 0.46, h: 0.34 },
      { at: [0, 0.36, -0.7], w: 0.36, h: 0.3 },
    ],
    { bone: chassis, color: RED, section: "box", smooth: false },
  );
  for (const s of [1, -1]) {
    put(boxG([0.02, 0.06, 0.6], [s * 0.235, 0.42, 0.1]), BLACK, chassis);
  }
  put(boxG([0.32, 0.02, 0.8], [0, 0.535, 0.12]), BLACK, chassis); // cockpit opening
  put(boxG([0.2, 0.12, 0.07], [0, 0.6, -0.1]), CARBON2, chassis); // seat headrest
  put(new THREE.SphereGeometry(0.11, 8, 6).translate(0, 0.6, 0.05), WHITE, chassis); // helmet
  put(boxG([0.19, 0.05, 0.05], [0, 0.62, 0.14]), GOLD, chassis); // gold visor
  put(boxG([0.03, 0.02, 0.2], [0, 0.7, 0.05]), RED, chassis); // helmet stripe
  put(cylG(0.014, 0.2, 6, [0, 0.47, 0.3], "z"), GUN, chassis); // steering column

  // Steering wheel: a hinge about its column axis (z), so the plate spins in its own plane.
  put(boxG([0.22, 0.12, 0.035], [0, 0.5, 0.4]), CARBON, steeringWheel);
  for (const s of [1, -1]) {
    put(boxG([0.03, 0.12, 0.03], [s * 0.11, 0.5, 0.4]), CARBON2, steeringWheel);
    put(cylG(0.012, 0.02, 6, [s * 0.09, 0.53, 0.378], "z"), GOLD, steeringWheel);
  }
  put(boxG([0.06, 0.03, 0.01], [0, 0.5, 0.378]), YELLOW, steeringWheel);

  // Nose, pylon and front wing.
  const nose = b.loft(
    [
      { at: [0, 0.29, 1.1], w: 0.34, h: 0.28 },
      { at: [0, 0.25, 1.7], w: 0.26, h: 0.2 },
      { at: [0, 0.2, 2.1], w: 0.14, h: 0.12 },
      { at: [0, 0.17, 2.3], w: 0.04, h: 0.04 },
    ],
    { bone: chassis, color: nosePaint, sides: 6, smooth: false, caps: "point" },
  );
  const numberDisc = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${WHITE}"/><text x="32" y="46" font-family="Arial, sans-serif" font-weight="900" font-size="44" text-anchor="middle" fill="${CARBON}">7</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) b.decal(nose, numberDisc, { at: [s * 0.14, 0.25, 1.5], dir: [s, 0, 0], size: [0.13, 0.13] });
  put(boxG([0.05, 0.09, 0.22], [0, 0.16, 2.38]), CARBON, chassis);

  b.extrude(
    [
      [-0.98, 2.85],
      [0.98, 2.85],
      [0.98, 2.5],
      [0.15, 2.45],
      [-0.15, 2.45],
      [-0.98, 2.5],
    ],
    { at: [0, 0.13, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.025, bone: chassis, color: CARBON },
  );
  b.extrude(
    [
      [-0.9, 2.84],
      [0.9, 2.84],
      [0.9, 2.56],
      [-0.9, 2.56],
    ],
    { at: [0, 0.2, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.014, bone: frontFlapLow, color: RED },
  );
  b.extrude(
    [
      [-0.88, 2.82],
      [0.88, 2.82],
      [0.88, 2.6],
      [-0.88, 2.6],
    ],
    { at: [0, 0.26, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, bone: frontFlapHigh, color: WHITE },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [2.85, 0.0],
        [2.85, 0.3],
        [2.5, 0.28],
        [2.36, 0.14],
        [2.36, 0.0],
      ],
      { at: [s * 0.98, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, bone: chassis, color: WHITE },
    );
    b.extrude(
      [
        [2.78, 0.05],
        [2.78, 0.22],
        [2.52, 0.2],
        [2.42, 0.12],
        [2.42, 0.05],
      ],
      { at: [s * 0.995, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bone: chassis, color: CARBON },
    );
    for (const [z, y] of [
      [2.72, 0.17],
      [2.6, 0.12],
      [2.5, 0.09],
    ]) {
      put(cylG(0.012, 0.01, 6, [s * 1.003, y, z], "x"), SILVER, chassis);
    }
  }
  for (const s of [1, -1]) put(boxG([0.012, 0.07, 0.3], [s * 0.5, 0.165, 2.66]), BLACK, chassis); // wing fences

  // Sidepods with dark inlets, bargeboards, vents, pinstripe and race number.
  for (const s of [1, -1]) {
    const pod = b.loft(
      [
        { at: [s * 0.36, 0.3, 1.05], w: 0.24, h: 0.26 },
        { at: [s * 0.36, 0.33, 0.4], w: 0.26, h: 0.3 },
        { at: [s * 0.36, 0.33, -0.4], w: 0.22, h: 0.26 },
        { at: [s * 0.36, 0.3, -1.1], w: 0.14, h: 0.18 },
      ],
      { bone: chassis, color: sidepodPaint, section: "box", smooth: false },
    );
    put(boxG([0.2, 0.2, 0.05], [s * 0.36, 0.31, 1.08]), BLACK, chassis);
    b.extrude(
      [
        [0.85, 0.27],
        [0.85, 0.3],
        [-0.7, 0.3],
        [-0.7, 0.27],
      ],
      { at: [s * 0.485, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bone: chassis, color: WHITE },
    );
    for (const z of [-0.65, -0.8]) put(boxG([0.01, 0.06, 0.1], [s * 0.492, 0.38, z]), BLACK, chassis);
    b.decal(pod, numberDisc, { at: [s * 0.48, 0.38, 0.05], dir: [s, 0, 0], size: [0.18, 0.18] });
    b.extrude(
      [
        [1.3, 0.18],
        [1.3, 0.36],
        [0.95, 0.3],
        [0.95, 0.18],
      ],
      { at: [s * 0.22, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bone: chassis, color: CARBON },
    );
  }

  // Engine cover, airbox, shark fin, rear light and exhausts.
  b.loft(
    [
      { at: [0, 0.56, -0.5], w: 0.26, h: 0.36 },
      { at: [0, 0.56, -1.1], w: 0.2, h: 0.3 },
      { at: [0, 0.5, -1.7], w: 0.14, h: 0.24 },
      { at: [0, 0.44, -2.15], w: 0.08, h: 0.16 },
    ],
    { bone: chassis, color: coverPaint, section: "box", smooth: false },
  );
  b.loft(
    [
      { at: [0, 0.8, -0.12], w: 0.16, h: 0.12 },
      { at: [0, 0.8, -0.5], w: 0.2, h: 0.16 },
      { at: [0, 0.74, -0.9], w: 0.16, h: 0.14 },
    ],
    { bone: chassis, color: CARBON, section: "box", smooth: false },
  );
  put(boxG([0.12, 0.08, 0.02], [0, 0.82, -0.135]), BLACK, chassis);
  b.extrude(
    [
      [-0.95, 0.66],
      [-1.25, 0.79],
      [-1.65, 0.6],
      [-1.65, 0.5],
      [-0.95, 0.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, bone: chassis, color: CARBON },
  );
  glow(put(boxG([0.1, 0.02, 0.03], [0, 0.515, -2.19]), GLOW_RED, chassis), 1.6);
  for (const s of [1, -1]) {
    for (const z of [-0.95, -1.15, -1.35]) put(boxG([0.01, 0.12, 0.03], [s * 0.105, 0.56, z]), BLACK, chassis);
  }
  const halo = catmull([
    [-0.2, 0.5, 0.38],
    [-0.2, 0.74, 0.25],
    [-0.17, 0.88, 0.05],
    [0, 0.93, -0.05],
    [0.17, 0.88, 0.05],
    [0.2, 0.74, 0.25],
    [0.2, 0.5, 0.38],
  ]);
  b.sweep(halo, 0.018, { bone: chassis, color: GUN, sides: 6, smooth: false });
  for (const s of [1, -1]) {
    rod([s * 0.04, 0.44, -2.0], [s * 0.06, 0.5, -2.25], 0.018, chassis, GUN);
    glow(put(cylG(0.02, 0.05, 6, [s * 0.06, 0.5, -2.265], "z"), GLOW_ORANGE, chassis), 1.4);
  }

  // Suspension arms, static on the chassis.
  for (const s of [1, -1]) {
    rod([s * 0.32, 0.45, 1.4], [s * 0.7, 0.36, 1.84], 0.014, chassis, GUN);
    rod([s * 0.3, 0.2, 1.5], [s * 0.72, 0.31, 1.8], 0.014, chassis, GUN);
    rod([s * 0.2, 0.55, 1.2], [s * 0.7, 0.4, 1.8], 0.01, chassis, GUN);
    rod([s * 0.3, 0.55, -1.5], [s * 0.7, 0.5, -1.75], 0.014, chassis, GUN);
    rod([s * 0.3, 0.26, -1.45], [s * 0.7, 0.3, -1.75], 0.014, chassis, GUN);
  }

  // Floor, diffuser and strakes.
  put(boxG([0.46, 0.03, 3.1], [0, 0.1, 0.2]), CARBON, chassis);
  b.extrude(
    [
      [-0.46, -1.4],
      [0.46, -1.4],
      [0.46, -2.1],
      [-0.46, -2.1],
    ],
    { at: [0, 0.1, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, bone: chassis, color: CARBON2 },
  );
  for (const x of [-0.3, -0.1, 0.1, 0.3]) {
    b.extrude(
      [
        [-1.45, 0.1],
        [-2.05, 0.1],
        [-2.05, 0.26],
        [-1.45, 0.2],
      ],
      { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, bone: chassis, color: CARBON },
    );
  }

  // Rear wing: red main plane, white DRS flap on a hinge, carbon endplates, pylon, gurney.
  b.extrude(
    [
      [-0.5, -2.4],
      [0.5, -2.4],
      [0.5, -2.8],
      [-0.5, -2.8],
    ],
    { at: [0, 0.86, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.022, bone: chassis, color: RED },
  );
  b.extrude(
    [
      [-0.48, -2.42],
      [0.48, -2.42],
      [0.48, -2.76],
      [-0.48, -2.76],
    ],
    { at: [0, 0.92, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.014, bone: drsFlap, color: WHITE },
  );
  for (const x of [-0.3, 0.3]) put(boxG([0.02, 0.05, 0.04], [x, 0.89, -2.5]), GUN, drsFlap);
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-2.36, 0.56],
        [-2.36, 0.98],
        [-2.84, 0.98],
        [-2.84, 0.62],
        [-2.72, 0.56],
      ],
      { at: [s * 0.5, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, bone: chassis, color: CARBON },
    );
    b.extrude(
      [
        [-2.4, 0.62],
        [-2.4, 0.92],
        [-2.76, 0.92],
        [-2.76, 0.66],
      ],
      { at: [s * 0.508, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008, bone: chassis, color: RED },
    );
  }
  put(boxG([0.08, 0.36, 0.16], [0, 0.66, -2.2]), CARBON, chassis);
  put(boxG([0.26, 0.2, 0.46], [0, 0.34, -1.85]), CARBON2, chassis); // rear gearbox casing
  put(boxG([0.96, 0.02, 0.02], [0, 0.875, -2.8]), WHITE, chassis);
  return b.root;
}
