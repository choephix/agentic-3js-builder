import * as THREE from "three";
import { createBuilder, catmull, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A whimsical open-cockpit barnstormer biplane with a smiling googly-eyed radial cowling, a waving moustachioed pilot with a streaming scarf, a goggled dog passenger, pennants and bracing wires.",
};

const RED = "#d63a2c";
const CREAM = "#f6e8c6";
const RIB = "#dccb9c";
const YELLOW = "#f4b92e";
const TEAL = "#23867f";
const DARK = "#2a2733";
const METAL = "#8f99a4";
const WOOD = "#b87a3c";
const LEATHER = "#7b4a2b";
const SKIN = "#f0b890";
const TAN = "#d9a05b";
const BROWN = "#6b4126";
const PINK = "#ef7f93";
const GLASS = "#a6dcec";
const WHITE = "#fbf8ef";
const BLACK = "#17151b";
const NAVY = "#2b4a8c";
const MOUST = "#4a2c1b";

type P2 = [number, number];

const ROUNDEL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="48" fill="${NAVY}"/><circle cx="50" cy="50" r="35" fill="#ffffff"/>
<circle cx="50" cy="50" r="22" fill="${RED}"/><circle cx="50" cy="50" r="8" fill="${YELLOW}"/></svg>`;
const BADGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="46" fill="${YELLOW}" stroke="${DARK}" stroke-width="5"/>
<circle cx="50" cy="50" r="36" fill="none" stroke="${RED}" stroke-width="4"/>
<text x="50" y="73" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="68" text-anchor="middle" fill="${DARK}">7</text></svg>`;

function wingOutline(half: number): P2[] {
  return [
    [-half + 0.35, -0.7],
    [half - 0.35, -0.7],
    [half, -0.3],
    [half, 0.3],
    [half - 0.35, 0.75],
    [-half + 0.35, 0.75],
    [-half, 0.3],
    [-half, -0.3],
  ];
}

function onSphere(c: number[], r: number, dx: number, dy: number, lift: number): number[] {
  return [c[0] + dx, c[1] + dy, c[2] + Math.sqrt(Math.max(0, r * r - dx * dx - dy * dy)) + lift];
}

export default function build() {
  const b = createBuilder({ name: "barnstormer" });

  // ---------------- skeleton ----------------
  const fus = b.joint("fuselage", { at: [0, 1.4, 0.3] });
  const prop = b.joint("prop", { parent: fus, at: [0, 1.35, 2.4], dir: [0, 0, 1], role: "fan" });
  const rudder = b.joint("rudder", { parent: fus, at: [0, 1.5, -4.0], dir: [0, 1, 0], role: "hinge" });
  const tailwheel = b.joint("tailwheel", { parent: fus, at: [0, 0.15, -3.95], dir: [1, 0, 0] });
  const elev: Record<string, ReturnType<typeof b.joint>> = {};
  const ail: Record<string, ReturnType<typeof b.joint>> = {};
  const wheel: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    elev[k] = b.joint(`elevator${k}`, { parent: fus, at: [s * 0.08, 1.55, -3.9], dir: [s, 0, 0], role: "hinge" });
    ail[k] = b.joint(`aileron${k}`, { parent: fus, at: [s * 2.3, 2.55, -0.15], dir: [s, 0, 0], role: "hinge" });
    wheel[k] = b.joint(`wheel${k}`, { parent: fus, at: [s * 1.15, 0.53, 1.6], dir: [s, 0, 0] });
  }

  // ---------------- fuselage ----------------
  const bodyPaint = paint((p, n) => {
    if (p.z < -2.0 && p.z > -2.4) return YELLOW;
    if (p.z < -2.4 && p.z > -2.5) return TEAL;
    if (n.y < -0.5) return CREAM;
    return RED;
  });
  const body = b.loft(
    [
      { at: [0, 1.35, 2.0], w: 0.9, h: 0.95 },
      { at: [0, 1.4, 1.0], w: 0.85, h: 1.0 },
      { at: [0, 1.42, -0.4], w: 0.75, h: 0.95 },
      { at: [0, 1.45, -1.6], w: 0.55, h: 0.7 },
      { at: [0, 1.5, -3.0], w: 0.32, h: 0.5 },
      { at: [0, 1.58, -4.3], w: 0.1, h: 0.3 },
    ],
    { color: bodyPaint, bone: fus },
  );
  const skin = b.surface(body);
  const topAt = (z: number) => {
    const h = skin.ray([0, 3, z], [0, -1, 0]);
    return h ? h.at.y : 1.85;
  };

  // cowling
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.62, 0.15],
      [0.65, 0.55],
      [0.62, 0.9],
      [0.55, 1.12],
      [0.46, 1.2],
      [0, 1.2],
    ],
    { at: [0, 1.35, 1.1], axis: [0, 0, 1], bone: fus, color: YELLOW, segments: 14 },
  );
  // dark lip ring behind cowling
  b.lathe(
    [
      [0.6, 0],
      [0.67, 0],
      [0.67, 0.07],
      [0.6, 0.07],
    ],
    { at: [0, 1.35, 1.12], axis: [0, 0, 1], bone: fus, color: TEAL, segments: 14 },
  );

  // the cheerful face on the cowling
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.11, 10, 8), WHITE, { bone: fus, at: [s * 0.24, 1.5, 2.31] });
    b.part(new THREE.SphereGeometry(0.055, 8, 6), BLACK, { bone: fus, at: [s * 0.25, 1.52, 2.405] });
    b.part(new THREE.SphereGeometry(0.018, 5, 4), WHITE, { bone: fus, at: [s * 0.265, 1.545, 2.455] });
    b.capsule([s * 0.12, 1.66, 2.31], [s * 0.28, 1.69, 2.31], 0.022, { color: DARK, bone: fus });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), PINK, {
      bone: fus,
      at: [s * 0.33, 1.25, 2.305],
      dir: [0, 0, 1],
    });
  }
  b.sweep(
    catmull([
      [-0.3, 1.1, 2.315],
      [-0.17, 1.03, 2.315],
      [0, 1.0, 2.315],
      [0.17, 1.03, 2.315],
      [0.3, 1.1, 2.315],
    ]),
    0.022,
    { color: DARK, bone: fus, sides: 6 },
  );

  // spinner and propeller
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.17, 0.1],
      [0.1, 0.2],
      [0, 0.3],
    ],
    { at: [0, 1.35, 2.34], axis: [0, 0, 1], bone: prop, color: TEAL, segments: 10 },
  );
  const propPaint = paint((_p, _n, s) => (Math.abs(s[0]) > 1.02 ? YELLOW : WOOD));
  b.extrude(
    [
      [-1.3, -0.06],
      [-1.2, -0.16],
      [-0.7, -0.14],
      [-0.2, -0.07],
      [0.2, -0.07],
      [0.7, -0.14],
      [1.2, -0.16],
      [1.3, -0.06],
      [1.3, 0.06],
      [1.2, 0.16],
      [0.7, 0.14],
      [0.2, 0.07],
      [-0.2, 0.07],
      [-0.7, 0.14],
      [-1.2, 0.16],
      [-1.3, 0.06],
    ] as P2[],
    {
      at: [0, 1.35, 2.5],
      x: [0.94, 0.34, 0],
      y: [-0.34, 0.94, 0],
      thickness: 0.05,
      bevel: 0.015,
      color: propPaint,
      bone: prop,
    },
  );

  // exhaust pipes
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.55, 1.22, 1.7],
        [s * 0.72, 1.2, 1.45],
        [s * 0.7, 1.28, 1.0],
        [s * 0.62, 1.32, 0.6],
      ]),
      [0.07, 0.05],
      { color: METAL, bone: fus, caps: "flat", sides: 8 },
    );
  }

  // ---------------- wings ----------------
  const wingPaint = (tipX: number) =>
    paint((p) => {
      const ax = Math.abs(p.x);
      if (ax > tipX) return RED;
      if (ax > tipX - 0.12) return YELLOW;
      return ax % 0.45 < 0.03 ? RIB : CREAM;
    });
  const upper = b.extrude(wingOutline(3.95), {
    at: [0, 2.55, 0.55],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.12,
    bevel: 0.03,
    color: wingPaint(3.35),
    bone: fus,
  });
  const lower = b.extrude(wingOutline(3.6), {
    at: [0, 1.0, 0.3],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.12,
    bevel: 0.03,
    color: wingPaint(3.0),
    bone: fus,
  });

  // gravity tank on the top wing
  b.part(new THREE.SphereGeometry(0.3, 10, 8), YELLOW, { bone: fus, at: [0, 2.72, 0.6], scale: [1.4, 0.55, 1.1] });

  // ailerons, pennants, struts, wires
  const aileronOutline: P2[] = [
    [0, 0],
    [1.3, 0],
    [1.65, 0.4],
    [0, 0.4],
  ];
  const strutCol = TEAL;
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    b.extrude(aileronOutline, {
      at: [s * 2.3, 2.55, -0.15],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.15,
      bevel: 0.025,
      color: RED,
      bone: ail[k],
    });

    // interplane struts
    const x = s * 2.6;
    b.rod([x, 1.02, 0.6], [x, 2.5, 0.85], 0.05, { color: strutCol, bone: fus });
    b.rod([x, 1.02, 0.0], [x, 2.5, 0.25], 0.05, { color: strutCol, bone: fus });
    // cabane
    b.rod([s * 0.25, 1.8, 0.9], [s * 0.7, 2.5, 0.85], 0.05, { color: strutCol, bone: fus });
    b.rod([s * 0.25, 1.8, 0.2], [s * 0.6, 2.5, 0.25], 0.05, { color: strutCol, bone: fus });
    // bracing wires
    const wire = (a: number[], c: number[]) => b.rod(a, c, 0.011, { color: METAL, bone: fus, sides: 4 });
    wire([x, 1.05, 0.6], [x, 2.48, 0.25]);
    wire([x, 1.05, 0.0], [x, 2.48, 0.85]);
    wire([s * 0.3, 1.0, 0.7], [x, 2.48, 0.85]);
    wire([s * 0.7, 2.48, 0.85], [x, 1.05, 0.6]);

    // wingtip pennants
    const mx = s * 3.6;
    b.rod([mx, 2.6, 0.55], [mx, 3.22, 0.55], 0.016, { color: DARK, bone: fus, sides: 5 });
    b.extrude(
      [
        [0, 0],
        [0.55, 0.05],
        [0, 0.2],
      ] as P2[],
      { at: [mx, 3.0, 0.55], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: s > 0 ? RED : TEAL, bone: fus },
    );
  }

  // ---------------- tail ----------------
  b.extrude(
    [
      [-2.9, 0],
      [-3.0, 0.45],
      [-3.4, 0.85],
      [-4.0, 0.92],
      [-4.0, 0],
    ] as P2[],
    { at: [0, 1.5, 0], thickness: 0.09, bevel: 0.02, color: RED, bone: fus },
  );
  const rudderPaint = paint((_p, _n, s) => (Math.floor(s[1] / 0.25) % 2 ? YELLOW : TEAL));
  b.extrude(
    [
      [0, 0],
      [0, 0.92],
      [-0.2, 1.05],
      [-0.5, 0.95],
      [-0.62, 0.5],
      [-0.5, 0],
    ] as P2[],
    { at: [0, 1.5, -4.0], thickness: 0.08, bevel: 0.02, color: rudderPaint, bone: rudder },
  );
  b.extrude(
    [
      [-1.1, -3.88],
      [1.1, -3.88],
      [1.2, -3.5],
      [0.9, -3.0],
      [-0.9, -3.0],
      [-1.2, -3.5],
    ] as P2[],
    { at: [0, 1.55, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.015, color: RED, bone: fus },
  );
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0, 0],
        [1.05, 0],
        [1.15, -0.3],
        [0.95, -0.62],
        [0, -0.62],
      ] as P2[],
      {
        at: [s * 0.08, 1.55, -3.9],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.07,
        bevel: 0.015,
        color: YELLOW,
        bone: elev[k],
      },
    );
    b.rod([s * 1.0, 1.58, -3.4], [0, 2.15, -3.45], 0.011, { color: METAL, bone: fus, sides: 4 });
  }

  // ---------------- landing gear ----------------
  const tire: P2[] = [
    [0, -0.1],
    [0.3, -0.1],
    [0.44, -0.14],
    [0.52, -0.1],
    [0.55, -0.05],
    [0.55, 0.05],
    [0.52, 0.1],
    [0.44, 0.14],
    [0.3, 0.1],
    [0, 0.1],
  ];
  const hubcap: P2[] = [
    [0, -0.16],
    [0.24, -0.15],
    [0.26, -0.1],
    [0.26, 0.1],
    [0.24, 0.15],
    [0, 0.16],
  ];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const hub = [s * 1.15, 0.53, 1.6];
    b.lathe(tire, { at: hub, axis: [1, 0, 0], bone: wheel[k], color: DARK, segments: 16 });
    b.lathe(hubcap, { at: hub, axis: [1, 0, 0], bone: wheel[k], color: YELLOW, segments: 8 });
    b.rod([s * 0.3, 0.98, 1.35], [s * 1.12, 0.58, 1.6], 0.055, { color: METAL, bone: fus });
    b.rod([s * 0.3, 0.96, 0.85], [s * 1.12, 0.56, 1.6], 0.055, { color: METAL, bone: fus });
  }
  b.rod([-1.15, 0.53, 1.6], [1.15, 0.53, 1.6], 0.04, { color: DARK, bone: fus, sides: 6 });
  // tail skid wheel
  b.rod([0, 1.32, -3.3], [0, 0.26, -3.95], 0.04, { color: METAL, bone: fus, sides: 6 });
  b.lathe(
    [
      [0, -0.06],
      [0.13, -0.06],
      [0.16, -0.03],
      [0.16, 0.03],
      [0.13, 0.06],
      [0, 0.06],
    ] as P2[],
    { at: [0, 0.15, -3.95], axis: [1, 0, 0], bone: tailwheel, color: DARK, segments: 10 },
  );

  // ---------------- cockpits ----------------
  const zp = -1.45; // pilot
  const zd = -0.55; // dog
  const Yp = topAt(zp);
  const Yd = topAt(zd);

  const cockpit = (z: number, y: number) => {
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 14), LEATHER, { bone: fus, at: [0, y - 0.1, z], scale: [1, 1, 1.3] });
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 14), DARK, { bone: fus, at: [0, y + 0.052, z], scale: [1, 1, 1.3] });
    b.extrude(
      [
        [-0.3, -0.2],
        [0.3, -0.2],
        [0.28, 0.2],
        [-0.28, 0.2],
      ] as P2[],
      { at: [0, y + 0.05, z + 0.45], y: [0, 1, -0.5], thickness: 0.025, bevel: 0.006, color: GLASS, bone: fus },
    );
  };
  cockpit(zp, Yp);
  cockpit(zd, Yd);
  // headrest fairing behind the pilot
  b.part(new THREE.SphereGeometry(0.3, 10, 8), RED, { bone: fus, at: [0, Yp - 0.03, zp - 0.75], scale: [0.85, 0.75, 2.0] });

  // --- pilot ---
  const hc = [0, Yp + 0.66, zp];
  const hr = 0.21;
  b.capsule([0, Yp - 0.15, zp], [0, Yp + 0.3, zp], 0.2, { color: LEATHER, bone: fus });
  b.part(new THREE.SphereGeometry(hr, 10, 8), SKIN, { bone: fus, at: hc });
  b.part(new THREE.SphereGeometry(hr + 0.015, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45), LEATHER, {
    bone: fus,
    at: [hc[0], hc[1] + 0.05, hc[2]],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 6, 5), LEATHER, { bone: fus, at: [s * 0.21, hc[1] + 0.0, hc[2]] });
    const gp = onSphere(hc, hr, s * 0.09, 0.045, 0.0);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8), METAL, { bone: fus, at: gp, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.05, 8), GLASS, {
      bone: fus,
      at: [gp[0], gp[1], gp[2] + 0.012],
      dir: [0, 0, 1],
    });
    // moustache
    const m = (dx: number, dy: number) => onSphere(hc, hr, s * dx, dy, 0.02);
    b.sweep(catmull([m(0.005, -0.075), m(0.07, -0.095), m(0.14, -0.08), m(0.185, -0.03)]), [0.028, 0.012], {
      color: MOUST,
      bone: fus,
      sides: 5,
    });
    // arms
    const sh = [s * 0.22, Yp + 0.32, zp];
    if (s > 0) {
      const el = [0.46, Yp + 0.46, zp + 0.05];
      const hand = [0.58, Yp + 0.98, zp + 0.05];
      b.capsule(sh, el, 0.07, { color: LEATHER, bone: fus });
      b.capsule(el, hand, 0.065, { color: LEATHER, bone: fus });
      b.part(new THREE.SphereGeometry(0.095, 8, 6), BROWN, { bone: fus, at: [hand[0], hand[1] + 0.05, hand[2]] });
      b.capsule([hand[0] - 0.05, hand[1] + 0.05, hand[2]], [hand[0] - 0.13, hand[1] + 0.12, hand[2]], 0.03, {
        color: BROWN,
        bone: fus,
      });
    } else {
      const el = [-0.32, Yp + 0.12, zp + 0.15];
      const hand = [-0.2, Yp + 0.08, zp + 0.5];
      b.capsule(sh, el, 0.07, { color: LEATHER, bone: fus });
      b.capsule(el, hand, 0.065, { color: LEATHER, bone: fus });
      b.part(new THREE.SphereGeometry(0.085, 8, 6), BROWN, { bone: fus, at: hand });
    }
  }
  b.part(new THREE.SphereGeometry(0.045, 6, 5), SKIN, { bone: fus, at: onSphere(hc, hr, 0, -0.015, 0.015) });
  // scarf: knot ring and long streamer
  b.part(new THREE.TorusGeometry(0.17, 0.06, 6, 12), RED, { bone: fus, at: [0, Yp + 0.46, zp], dir: [0, 1, 0], axis: "z" });
  b.sweep(
    catmull([
      [0, Yp + 0.46, zp - 0.12],
      [0, Yp + 0.52, zp - 0.5],
      [0.1, Yp + 0.64, zp - 1.0],
      [-0.07, Yp + 0.6, zp - 1.5],
    ]),
    (t) => [0.06 + 0.07 * t, 0.012],
    { color: (t) => (Math.floor(t * 8) % 2 ? RED : WHITE), bone: fus, sides: 6 },
  );

  // --- dog passenger ---
  const dc = [0, Yd + 0.3, zd];
  const dr = 0.2;
  b.capsule([0, Yd - 0.1, zd - 0.1], [0, Yd + 0.12, zd - 0.05], 0.19, { color: TAN, bone: fus });
  b.part(new THREE.SphereGeometry(dr, 10, 8), TAN, { bone: fus, at: dc });
  b.part(new THREE.BoxGeometry(0.15, 0.12, 0.22), CREAM, { bone: fus, at: [0, dc[1] - 0.05, zd + 0.2] });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), BLACK, { bone: fus, at: [0, dc[1] - 0.02, zd + 0.315] });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.09), PINK, {
    bone: fus,
    at: [0, dc[1] - 0.115, zd + 0.27],
    rotation: [20, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 10), LEATHER, { bone: fus, at: [0, dc[1] + 0.13, zd], scale: [1, 1, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 8, 6), BROWN, {
      bone: fus,
      at: [s * 0.21, dc[1] - 0.04, zd - 0.04],
      scale: [0.5, 1.3, 0.85],
      rotation: [0, 0, -s * 22],
    });
    const gp = onSphere(dc, dr, s * 0.085, 0.07, 0.0);
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.045, 8), METAL, { bone: fus, at: gp, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.045, 8), GLASS, {
      bone: fus,
      at: [gp[0], gp[1], gp[2] + 0.012],
      dir: [0, 0, 1],
    });
    // paws on the coaming
    b.capsule([s * 0.12, Yd + 0.1, zd], [s * 0.12, Yd + 0.06, zd + 0.34], 0.05, { color: TAN, bone: fus });
    b.part(new THREE.SphereGeometry(0.065, 6, 5), CREAM, { bone: fus, at: [s * 0.12, Yd + 0.06, zd + 0.36] });
  }
  b.part(new THREE.TorusGeometry(dr + 0.005, 0.014, 5, 14), LEATHER, {
    bone: fus,
    at: [dc[0], dc[1] + 0.07, dc[2]],
    dir: [0, 1, 0],
    axis: "z",
  });

  // ---------------- emblems ----------------
  const roundel = svg(ROUNDEL, { size: 128 });
  const badge = svg(BADGE, { size: 128 });
  for (const s of [1, -1]) {
    b.decal(body, badge, { at: [s * 0.4, 1.45, 0.2], dir: [s, 0, 0], size: [0.55, 0.55] });
    b.decal(upper, roundel, { at: [s * 2.75, 2.62, 0.55], dir: [0, 1, 0], up: [0, 0, 1], size: [0.95, 0.95] });
    b.decal(lower, roundel, { at: [s * 2.35, 0.94, 0.3], dir: [0, -1, 0], up: [0, 0, 1], size: [0.9, 0.9] });
  }

  return b.root;
}
