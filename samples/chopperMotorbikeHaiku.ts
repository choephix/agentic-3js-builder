import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "A long-raked custom chopper: peanut tank, solo seat, sissy bar, ape hanger bars, spoked disc wheels and a bevelled white enamel body with one orange accent, a cyan headlamp and red tail light. Built to the Overwatch look: clean bold shapes, bevelled panels, crisp colour blocking.",
  style: "Overwatch",
  commit: "b816db2",
};

const DEG = Math.PI / 180;
type V3 = [number, number, number];

// Colour blocking: white enamel body, graphite and engine black, one orange accent, chrome trim.
const ENAMEL = "#eef2f6";
const ACCENT = "#ff7a1f";
const GRAPHITE = "#2b313b";
const DEEP = "#1c2028";
const STEEL = "#3a414c";
const CHROME = "#d3dbe5";
const RIM = "#8f9aa8";
const TIRE = "#1b1d22";
const GRIP = "#101216";
const LENS = "#c4fbff";
const TAIL = "#ff4a1f";

// Tank: white enamel, an orange flash line along each side, graphite knee pads.
const TANK = paint((p, n) => {
  const side = Math.abs(n.x) > 0.5;
  if (side && Math.abs(p.y - 0.815) < 0.012) return ACCENT;
  if (side && p.z > -0.1 && p.z < 0.12 && p.y < 0.8) return GRAPHITE;
  return ENAMEL;
});

// Solo seat: graphite pad with a single orange centre stripe along its top.
const SEAT = paint((p, n) => (n.y > 0.5 && Math.abs(p.x) < 0.02 ? ACCENT : GRAPHITE));
const GLASS = "#7aa9c4";

// Left-side shroud: white enamel with a single orange pinstripe.
const PANEL = paint((p) => (Math.abs(p.y - 0.6) < 0.008 ? ACCENT : ENAMEL));

// Spoked disc wheel drawing: light spokes on a dark disc, tinted by the part colour.
const spoke = (deg: number) => {
  const a = deg * DEG;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const px = -uy;
  const py = ux;
  const q = (r: number, w: number) => `${(ux * r + px * w).toFixed(2)},${(uy * r + py * w).toFixed(2)}`;
  return `<polygon points="${q(12, 4.5)} ${q(47, 2.6)} ${q(47, -2.6)} ${q(12, -4.5)}" fill="#ffffff"/>`;
};
const WHEEL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">` +
    `<circle r="49" fill="#5d6570"/>` +
    [90, 162, 234, 306, 18].map(spoke).join("") +
    `<circle r="45" fill="none" stroke="#ffffff" stroke-width="2.5"/>` +
    `<circle r="11" fill="#ffffff"/>` +
    `</svg>`,
  { size: 256 },
);

// Orange chevron decal for the tank sides.
const chevron = (x: number) =>
  `<polygon points="${x},8 ${x + 10},8 ${x + 20},20 ${x + 10},32 ${x},32 ${x + 10},20" fill="${ACCENT}"/>`;
const CHEVRON = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 40">${[4, 30, 56].map(chevron).join("")}</svg>`,
  { size: 256 },
);

// A bevelled arch in the side profile (z forward, y up), for fenders.
const arch = (cz: number, cy: number, rOut: number, rIn: number, a0: number, a1: number, steps: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (a0 + ((a1 - a0) * i) / steps) * DEG;
    pts.push([cz + rOut * Math.cos(a), cy + rOut * Math.sin(a)]);
  }
  for (let i = steps; i >= 0; i--) {
    const a = (a0 + ((a1 - a0) * i) / steps) * DEG;
    pts.push([cz + rIn * Math.cos(a), cy + rIn * Math.sin(a)]);
  }
  return pts;
};

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  // Skeleton: frame root, steering head, front wheel and rear wheel.
  const AXF: V3 = [0, 0.28, 1.05];
  const AXR: V3 = [0, 0.32, -0.85];
  const HEAD: V3 = [0, 0.98, 0.52];
  const frame = b.joint("frame", { at: [0, 0.45, 0] });
  const steer = b.joint("steer", { parent: frame, at: HEAD, aim: AXF, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frame, at: AXR, dir: [1, 0, 0], role: "hinge" });

  // Wheels: a lathed tyre with bevelled tread, a textured spoked disc on each side, chrome hub and axle nuts.
  const wheel = (bone: typeof frame, c: V3, outer: number, hw: number, inner: number) => {
    b.lathe(
      [
        [inner, -hw],
        [outer - 0.025, -hw],
        [outer, -hw + 0.025],
        [outer, hw - 0.025],
        [outer - 0.025, hw],
        [inner, hw],
      ],
      { at: c, axis: [1, 0, 0], segments: 20, bone, color: TIRE },
    );
    for (const s of [1, -1]) {
      b.part(new THREE.CircleGeometry(inner - 0.006, 28), RIM, {
        bone,
        at: [s * 0.012, c[1], c[2]],
        dir: [s, 0, 0],
        axis: "z",
        texture: WHEEL_TEX,
      });
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 10), CHROME, {
        bone,
        at: [s * (hw + 0.012), c[1], c[2]],
        dir: [1, 0, 0],
      });
    }
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), CHROME, { bone, at: c, dir: [1, 0, 0] });
    b.rod([-hw - 0.03, c[1], c[2]], [hw + 0.03, c[1], c[2]], 0.011, { bone, color: CHROME });
  };
  wheel(wheelF, AXF, 0.28, 0.05, 0.19);
  wheel(wheelR, AXR, 0.32, 0.1, 0.2);
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 16), STEEL, {
    bone: wheelR,
    at: [-0.075, AXR[1], AXR[2]],
    dir: [1, 0, 0],
  });

  // Frame: square-section rails, a head tube and cross braces.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.08, 0.95, 0.44],
        [s * 0.08, 0.7, 0.12],
        [s * 0.07, 0.67, -0.4],
        [s * 0.07, 0.7, -0.86],
      ]),
      0.026,
      { section: "box", color: GRAPHITE, bone: frame },
    );
    b.sweep(
      catmull([
        [s * 0.08, 0.9, 0.44],
        [s * 0.13, 0.62, 0.12],
        [s * 0.13, 0.4, -0.3],
        [s * 0.13, 0.34, -0.85],
      ]),
      0.026,
      { section: "box", color: GRAPHITE, bone: frame },
    );
    b.rod([s * 0.07, 0.68, -0.7], [s * 0.175, 0.675, -0.7], 0.013, { color: GRAPHITE, bone: frame });
  }
  // Chrome bolt heads at the frame's bend points.
  for (const s of [1, -1]) {
    const bends: V3[] = [
      [s * 0.08, 0.7, 0.12],
      [s * 0.07, 0.67, -0.4],
      [s * 0.13, 0.62, 0.12],
      [s * 0.13, 0.4, -0.3],
    ];
    for (const p of bends) b.part(new THREE.SphereGeometry(0.016, 6, 4), CHROME, { bone: frame, at: p });
  }
  b.rod([-0.13, 0.6, -0.45], [0.13, 0.6, -0.45], 0.018, { color: GRAPHITE, bone: frame });
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.34, -0.85], [s * 0.11, 0.32, -0.85], 0.02, { color: GRAPHITE, bone: frame });
  }
  b.rod([-0.08, 0.66, 0.1], [0.08, 0.66, 0.1], 0.016, { color: GRAPHITE, bone: frame });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 12), GRAPHITE, {
    bone: frame,
    at: [0, 0.97, 0.47],
    dir: [0, 0.94, 0.34],
  });

  // Engine: side-profile crankcase, two angled V-twin barrels with cooling fins, chrome heads.
  b.extrude(
    [
      [-0.17, 0.4],
      [-0.13, 0.36],
      [0.08, 0.36],
      [0.15, 0.42],
      [0.16, 0.52],
      [0.1, 0.58],
      [-0.12, 0.58],
      [-0.18, 0.5],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 0.18, bevel: 0.02, color: DEEP, bone: frame },
  );
  // Crankcase side bolts, four a side.
  for (const s of [1, -1]) {
    for (const [y, z] of [
      [0.4, -0.1],
      [0.4, 0.1],
      [0.54, -0.1],
      [0.54, 0.1],
    ]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), CHROME, {
        bone: frame,
        at: [s * 0.1, y, z],
        dir: [s, 0, 0],
      });
    }
  }
  const barrel = (base: V3, dir: V3) => {
    const along = (t: number): V3 => [base[0] + dir[0] * t, base[1] + dir[1] * t, base[2] + dir[2] * t];
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.17, 12), STEEL, { bone: frame, at: along(0.085), dir });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.CylinderGeometry(0.076, 0.076, 0.011, 14), DEEP, {
        bone: frame,
        at: along(0.03 + i * 0.035),
        dir,
      });
    }
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.045, 14), CHROME, { bone: frame, at: along(0.18), dir });
  };
  barrel([0, 0.5, 0.1], [0, 0.924, 0.383]);
  barrel([0, 0.5, -0.1], [0, 0.924, -0.383]);
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 20), ENAMEL, {
    bone: frame,
    at: [-0.12, 0.44, -0.02],
    dir: [1, 0, 0],
  });

  // Fuel tank: a peanut loft in white enamel with the orange flash and knee pads from the paint.
  const tank = b.loft(
    [
      { at: [0, 0.8, -0.22], w: 0.12, h: 0.11 },
      { at: [0, 0.835, -0.14], w: 0.22, h: 0.15 },
      { at: [0, 0.85, -0.02], w: 0.26, h: 0.18 },
      { at: [0, 0.845, 0.12], w: 0.27, h: 0.2 },
      { at: [0, 0.82, 0.26], w: 0.22, h: 0.16 },
      { at: [0, 0.79, 0.34], w: 0.12, h: 0.1 },
    ],
    { bone: frame, color: TANK },
  );
  for (const s of [1, -1]) {
    b.decal(tank, CHEVRON, { at: [s * 0.12, 0.865, -0.1], dir: [s, 0, 0], size: [0.14, 0.06], mirror: s > 0 });
  }
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), CHROME, {
    bone: frame,
    at: [0, 0.94, -0.02],
  });

  // Left-side shroud: a bevelled enamel panel over the frame rails and engine, the exhaust is on the right.
  b.extrude(
    [
      [-0.45, 0.66],
      [-0.2, 0.7],
      [0, 0.74],
      [0.1, 0.7],
      [0.14, 0.6],
      [0.06, 0.5],
      [-0.2, 0.5],
      [-0.45, 0.52],
    ],
    { x: [0, 0, 1], at: [0.17, 0, 0], thickness: 0.02, bevel: 0.006, color: PANEL, bone: frame },
  );
  // Solo seat: bevelled graphite pad, and a tall sissy bar with a cross bar.
  b.extrude(
    [
      [-0.8, 0.8],
      [-0.62, 0.84],
      [-0.36, 0.87],
      [-0.27, 0.86],
      [-0.27, 0.8],
      [-0.4, 0.77],
      [-0.7, 0.76],
      [-0.8, 0.76],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 0.14, bevel: 0.03, smoothing: 1, color: SEAT, bone: frame },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.06, 0.78, -0.74],
        [s * 0.07, 1.0, -0.9],
        [s * 0.09, 1.22, -0.98],
      ]),
      0.017,
      { color: CHROME, bone: frame },
    );
  }
  b.sweep(
    catmull([
      [-0.09, 1.22, -0.98],
      [0, 1.26, -1.0],
      [0.09, 1.22, -0.98],
    ]),
    0.016,
    { color: CHROME, bone: frame },
  );
  b.rod([-0.07, 0.95, -0.9], [0.07, 0.95, -0.9], 0.012, { color: CHROME, bone: frame });

  // Ape hanger bars: chrome risers that sweep back, with grips on the tips.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.09, 1.08, 0.5],
        [s * 0.15, 1.2, 0.44],
        [s * 0.23, 1.33, 0.32],
        [s * 0.3, 1.37, 0.14],
      ]),
      0.02,
      { color: CHROME, bone: steer, bands: [[0.7, CHROME], [1, GRIP]] },
    );
  }

  // Chrome bar-end mirrors on stems, glass facing the rider.
  for (const s of [1, -1]) {
    b.rod([s * 0.25, 1.35, 0.26], [s * 0.24, 1.47, 0.24], 0.008, { color: CHROME, bone: steer });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 14), GLASS, {
      bone: steer,
      at: [s * 0.24, 1.49, 0.22],
      dir: [0, 0, -1],
    });
  }

  // Front end under the steering head: fork legs with dark sliders, orange top clamp, headlamp.
  const fork = (s: number, t: number): V3 => [s * 0.09, 1.04 + (0.28 - 1.04) * t, 0.5 + (1.05 - 0.5) * t];
  for (const s of [1, -1]) {
    b.rod(fork(s, 0), fork(s, 1), 0.022, { color: CHROME, bone: steer });
    b.rod(fork(s, 0.5), fork(s, 0.92), 0.03, { color: DEEP, bone: steer });
  }
  b.part(new THREE.BoxGeometry(0.26, 0.04, 0.14), ACCENT, { bone: steer, at: [0, 1.07, 0.5] });
  b.part(new THREE.BoxGeometry(0.2, 0.035, 0.12), GRAPHITE, { bone: steer, at: [0, 0.9, 0.52] });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), CHROME, {
    bone: steer,
    at: [0, 1.03, 0.64],
    dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 16), LENS, {
      bone: steer,
      at: [0, 1.03, 0.67],
      dir: [0, 0, 1],
    }),
    1.4,
  );
  b.rod([0, 1.03, 0.56], [0, 1.03, 0.62], 0.02, { color: CHROME, bone: steer });

  // Front fender: one bevelled arch over the front tyre.
  b.extrude(arch(1.05, 0.28, 0.345, 0.31, 15, 165, 12), {
    x: [0, 0, 1],
    at: [0, 0, 0],
    thickness: 0.03,
    bevel: 0.008,
    color: ENAMEL,
    bone: steer,
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.09, 0.547, 0.855], [s * 0.012, 0.547, 0.856], 0.012, { color: GRAPHITE, bone: steer });
  }

  // Rear fender: a bevelled arch on each side, rivets along it, and a tail light at its tip.
  for (const s of [1, -1]) {
    b.extrude(arch(-0.85, 0.32, 0.4, 0.37, 25, 155, 12), {
      x: [0, 0, 1],
      at: [s * 0.175, 0, 0],
      thickness: 0.03,
      bevel: 0.008,
      color: ENAMEL,
      bone: frame,
    });
    for (const deg of [40, 70, 100, 130]) {
      const a = deg * DEG;
      b.part(new THREE.SphereGeometry(0.007, 6, 4), CHROME, {
        bone: frame,
        at: [s * 0.195, 0.32 + 0.385 * Math.sin(a), -0.85 + 0.385 * Math.cos(a)],
      });
    }
  }
  glow(b.part(new THREE.BoxGeometry(0.08, 0.04, 0.03), TAIL, { bone: frame, at: [0, 0.47, -1.225] }), 1.2);

  // Exhaust: a chrome header down the right side into a finned muffler.
  b.sweep(
    catmull([
      [-0.1, 0.46, 0.16],
      [-0.17, 0.4, 0.12],
      [-0.18, 0.34, -0.1],
      [-0.17, 0.36, -0.45],
    ]),
    0.022,
    { color: CHROME, bone: frame },
  );
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.32, 14), CHROME, {
    bone: frame,
    at: [-0.175, 0.4, -0.64],
    dir: [0, 0, 1],
  });
  for (const z of [-0.48, -0.8]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 14), DEEP, {
      bone: frame,
      at: [-0.175, 0.4, z],
      dir: [0, 0, 1],
    });
  }

  // Kicked-out foot pegs.
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.42, 0.02], [s * 0.22, 0.36, 0.1], 0.012, { color: CHROME, bone: frame });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 10), GRIP, {
      bone: frame,
      at: [s * 0.22, 0.36, 0.1],
      dir: [s, 0, 0],
    });
  }

  return b.root;
}
