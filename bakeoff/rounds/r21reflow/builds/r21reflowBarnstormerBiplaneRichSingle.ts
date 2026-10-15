import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A plump, cheerful open-cockpit barnstormer biplane in red, butter-yellow and cream: scalloped cowl, goggled pilot with a streaming scarf, wooden prop and struts, rigging wires, spoked-and-painted wheels and working hinges.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = "#e0302c";
const YELLOW = "#ffc83a";
const CREAM = "#fff0c8";
const GOLD = "#f2b134";
const WOOD = "#b8641e";
const WOODD = "#7a3f1c";
const DARK = "#33261f";
const STEEL = "#8d949c";
const TIRE = "#2b2326";
const WIRE = "#4d5258";
const LEATHER = "#6b3a1e";
const SKIN = "#f2b996";
const LENS = "#9fe3f5";
const GLASS = "#c6eefa";

function wingOutline(hs: number, hc: number, rx: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let k = 0; k <= 6; k++) {
    const a = ((-90 + 30 * k) * Math.PI) / 180;
    pts.push([hs - rx + rx * Math.cos(a), hc * Math.sin(a)]);
  }
  for (let k = 0; k <= 6; k++) {
    const a = ((90 + 30 * k) * Math.PI) / 180;
    pts.push([-hs + rx + rx * Math.cos(a), hc * Math.sin(a)]);
  }
  return pts;
}

function wingPaint(hs: number, hc: number) {
  return cel(
    paint((_p, n, s) => {
      const ax = Math.abs(s[0]);
      const ay = Math.abs(s[1]);
      const edge = Math.max(ay / hc, ax / hs);
      if (Math.abs(n.y) < 0.6 || ay > hc - 0.13 || ax > hs - 0.15) return RED;
      if (ay > hc - 0.17 || ax > hs - 0.19) return GOLD;
      const f = (((s[0] / 0.45) % 1) + 1) % 1;
      if ((f < 0.035 || f > 0.965) && edge < 1) return "#f0a81e";
      return YELLOW;
    }),
  );
}

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });

  // ---------- skeleton ----------
  const body = b.joint("fuselage", { at: [0, 1.4, 0], role: "spine" });
  const prop = b.joint("prop", { parent: body, at: [0, 1.4, 2.85], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.55, -2.75], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.165, -2.95], dir: [1, 0, 0], role: "hinge" });
  const sides = [1, -1];
  const nm = (s: number) => (s > 0 ? "L" : "R");
  const wheels: Record<string, ReturnType<typeof b.joint>> = {};
  const elevators: Record<string, ReturnType<typeof b.joint>> = {};
  const ailerons: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of sides) {
    wheels[nm(s)] = b.joint(`wheel${nm(s)}`, {
      parent: body,
      at: [s * 0.95, 0.44, 1.3],
      dir: [s, 0, 0],
      role: "hinge",
    });
    elevators[nm(s)] = b.joint(`elevator${nm(s)}`, {
      parent: body,
      at: [s * 0.05, 1.5, -2.95],
      dir: [s, 0, 0],
      role: "hinge",
    });
    ailerons[nm(s)] = b.joint(`aileron${nm(s)}`, {
      parent: body,
      at: [s * 2.4, 2.56, 0.2],
      dir: [s, 0, 0],
      role: "hinge",
    });
  }

  const box = (w: number, h: number, d: number, color: string, at: number[], opts: object = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });
  const ball = (r: number, color: string, at: number[], bone: any = body, scale: number | number[] = 1) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, scale });
  const rodB = (a: number[], c: number[], r: number, color: string, bone: any = body) =>
    b.rod(a, c, r, color, { bone, sides: 6 });

  // ---------- fuselage ----------
  const fusePaint = cel(
    paint((p, n) => {
      const z = p.z;
      if (Math.abs(n.x) > 0.35 && z > -2.5 && z < 1.9) {
        const k = Math.min(1, (z + 2.5) / 3.2);
        const half = 0.04 + 0.14 * k;
        const d = Math.abs(p.y - 1.42);
        if (d < half) return RED;
        if (d < half + 0.035) return GOLD;
      }
      const pf = ((z / 0.55) % 1 + 1) % 1;
      if (pf < 0.014 || pf > 0.986) return "#e6d3a0";
      return CREAM;
    }),
  );
  const fuse = b.loft(
    [
      { at: [0, 1.5, -3.25], w: 0.08, h: 0.12 },
      { at: [0, 1.5, -2.6], w: 0.28, h: 0.42 },
      { at: [0, 1.47, -1.6], w: 0.55, h: 0.75 },
      { at: [0, 1.42, -0.5], w: 0.85, h: 1.0 },
      { at: [0, 1.4, 0.5], w: 1.0, h: 1.12 },
      { at: [0, 1.4, 1.5], w: 1.18, h: 1.2 },
      { at: [0, 1.4, 2.2], w: 1.24, h: 1.24 },
    ],
    { bone: body, color: fusePaint, sides: 10 },
  );

  // star roundel
  const star: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = (Math.PI * k) / 5 - Math.PI / 2;
    const r = k % 2 === 0 ? 23 : 9.5;
    star.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  const ROUNDEL = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e0302c"/><circle cx="50" cy="50" r="38" fill="#fff0c8"/><circle cx="50" cy="50" r="30" fill="#2f5fb0"/><polygon points="${star.join(" ")}" fill="#ffc83a"/></svg>`,
    { size: 128 },
  );
  for (const s of sides) {
    b.decal(fuse, ROUNDEL, {
      at: [s * 0.3, 1.5, -1.4],
      dir: [s, 0, 0],
      size: [0.42, 0.42],
      segments: 6,
      mirror: s < 0,
    });
  }

  // ---------- cowl, engine, prop ----------
  const cowlPaint = cel(
    paint((_p, _n, s) => {
      const edge = 0.4 + 0.05 * zigzag(s[1] / 24);
      if (Math.abs(s[0] - edge) < 0.022) return GOLD;
      return s[0] > edge ? RED : CREAM;
    }),
  );
  b.lathe(
    [
      [0.45, 0.02],
      [0.64, 0],
      [0.66, 0.6],
      [0.58, 0.76],
      [0.46, 0.74],
    ],
    { at: [0, 1.4, 2.05], axis: [0, 0, 1], segments: 14, bone: body, color: cowlPaint },
  );
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 14), DARK, { bone: body, at: [0, 1.4, 2.3], dir: [0, 0, 1] });
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.32, 6), "#4a4f57", {
      bone: body,
      at: [dx * 0.28, 1.4 + dy * 0.28, 2.5],
      dir: [dx, dy, 0],
    });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 6), STEEL, {
      bone: body,
      at: [dx * 0.45, 1.4 + dy * 0.45, 2.5],
      dir: [dx, dy, 0],
    });
    ball(0.02, GOLD, [Math.sin(a + 0.2) * 0.66, 1.4 + Math.cos(a + 0.2) * 0.66, 2.12]);
    ball(0.02, GOLD, [Math.sin(a + 0.2 + Math.PI / 7) * 0.66, 1.4 + Math.cos(a + 0.2 + Math.PI / 7) * 0.66, 2.12]);
  }
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 10), STEEL, { bone: body, at: [0, 1.4, 2.5], dir: [0, 0, 1] });

  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.19, 0.18],
      [0.09, 0.36],
      [0, 0.42],
    ],
    { at: [0, 1.4, 2.82], axis: [0, 0, 1], segments: 10, bone: prop, color: RED },
  );
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), STEEL, { bone: prop, at: [0, 1.4, 2.84], dir: [0, 0, 1] });
  const bladeOutline: [number, number][] = [
    [-0.07, 0.1],
    [0.07, 0.1],
    [0.13, 0.55],
    [0.11, 1.15],
    [0, 1.25],
    [-0.1, 1.15],
    [-0.13, 0.55],
  ];
  const bladePaint = cel(
    paint((_p, _n, s) => (s[1] > 1.04 ? YELLOW : s[1] > 0.96 ? RED : s[1] > 0.9 ? YELLOW : WOODD)),
  );
  b.extrude(bladeOutline, {
    at: [0, 1.4, 2.86],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.01,
    bone: prop,
    color: bladePaint,
  });
  b.extrude(bladeOutline, {
    at: [0, 1.4, 2.86],
    x: [-1, 0, 0],
    y: [0, -1, 0],
    thickness: 0.05,
    bevel: 0.01,
    bone: prop,
    color: bladePaint,
  });
  ball(0.045, STEEL, [0, 1.4, 3.26], prop);

  // exhaust pipes
  for (const s of sides) {
    rodB([s * 0.62, 1.1, 1.75], [s * 0.7, 1.05, 0.95], 0.045, STEEL);
    ball(0.055, "#3d4047", [s * 0.7, 1.05, 0.93]);
  }

  // ---------- cockpit & pilot ----------
  b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.04, 12), "#3a2214", { bone: body, at: [0, 1.9, -0.45] });
  b.part(new THREE.TorusGeometry(0.3, 0.05, 6, 14), LEATHER, { bone: body, at: [0, 1.92, -0.45], dir: [0, 1, 0], axis: "z" });
  ball(0.22, RED, [0, 1.95, -0.47], body, [1, 0.9, 0.8]); // jacket
  ball(0.17, SKIN, [0, 2.14, -0.45]);
  b.part(new THREE.SphereGeometry(0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), LEATHER, {
    bone: body,
    at: [0, 2.15, -0.46],
  });
  ball(0.03, "#e9a07f", [0, 2.12, -0.28]);
  for (const s of sides) {
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 8), GOLD, {
      bone: body,
      at: [s * 0.08, 2.19, -0.3],
      dir: [0, 0.2, 1],
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 8), LENS, {
      bone: body,
      at: [s * 0.08, 2.19, -0.285],
      dir: [0, 0.2, 1],
    });
    ball(0.05, LEATHER, [s * 0.18, 2.1, -0.46], body, [0.5, 1, 1]); // ear flap
    rodB([s * 0.2, 1.9, -0.4], [s * 0.34, 1.82, -0.25], 0.045, RED); // arms
  }
  b.part(new THREE.TorusGeometry(0.17, 0.018, 4, 12, Math.PI * 1.2), DARK, {
    bone: body,
    at: [0, 2.2, -0.46],
    dir: [0, 1, 0],
    axis: "z",
  });
  ball(0.3, RED, [0, 1.98, -0.98], body, [0.9, 0.7, 1.4]); // headrest
  b.sweep(
    catmull([
      [0, 2.02, -0.6],
      [0.05, 2.08, -1.0],
      [-0.08, 2.08, -1.5],
      [0.05, 2.14, -2.1],
    ]),
    { radius: [0.07, 0.07], section: "box", bone: body, color: "#ffffff", caps: "flat" },
  );
  b.part(new THREE.BoxGeometry(0.55, 0.22, 0.02), GLASS, { bone: body, at: [0, 2.08, 0.1], rotation: [-35, 0, 0] });
  for (const s of sides) rodB([s * 0.28, 1.92, 0.12], [s * 0.28, 2.02, 0.07], 0.015, STEEL);

  // ---------- wings ----------
  const upperPaint = wingPaint(3.6, 0.55);
  const lowerPaint = wingPaint(3.3, 0.5);
  b.extrude(wingOutline(3.6, 0.55, 0.65), {
    at: [0, 2.55, 0.7],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.15,
    bevel: 0.04,
    bone: body,
    color: upperPaint,
  });
  b.extrude(wingOutline(3.3, 0.5, 0.6), {
    at: [0, 1.0, 0.75],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.13,
    bevel: 0.035,
    bone: body,
    color: lowerPaint,
  });
  const ROUND2 = ROUNDEL;
  for (const s of sides) {
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
      bone: body,
      at: [s * 2.0, 2.633, 0.7],
      dir: [0, 1, 0],
      axis: "z",
      texture: ROUND2,
    });
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
      bone: body,
      at: [s * 2.0, 0.93, 0.75],
      dir: [0, -1, 0],
      axis: "z",
      texture: ROUND2,
    });
    // ailerons
    b.part(new THREE.BoxGeometry(1.5, 0.05, 0.26), CREAM, { bone: ailerons[nm(s)], at: [s * 2.4, 2.58, 0.1] });
    b.part(new THREE.BoxGeometry(1.5, 0.056, 0.05), RED, { bone: ailerons[nm(s)], at: [s * 2.4, 2.58, -0.03] });
    // wing-tip lights
    ball(0.06, s > 0 ? "#ff5a4a" : "#55d97a", [s * 3.62, 2.56, 0.7]);
  }

  // struts and wires
  for (const s of sides) {
    for (const x of [1.35, 2.75]) {
      for (const z of [1.05, 0.35]) {
        rodB([s * x, 1.05, z], [s * x, 2.52, z], 0.04, WOOD);
        box(0.1, 0.1, 0.12, STEEL, [s * x, 1.07, z]);
        box(0.1, 0.1, 0.12, STEEL, [s * x, 2.48, z]);
      }
      for (const z of [1.05, 0.35]) {
        const x2 = x === 1.35 ? 2.75 : 1.35;
        rodB([s * x, 1.07, z], [s * x2, 2.5, z], 0.008, WIRE);
      }
    }
    rodB([s * 2.75, 2.5, 1.05], [s * 2.75, 1.07, 0.35], 0.008, WIRE);
    rodB([s * 2.75, 2.5, 0.35], [s * 2.75, 1.07, 1.05], 0.008, WIRE);
    for (const z of [1.05, 0.35]) {
      rodB([s * 0.3, 1.85, z], [s * 0.55, 2.52, z], 0.035, WOOD);
      box(0.08, 0.08, 0.1, STEEL, [s * 0.55, 2.48, z]);
    }
  }
  // pennant on the left outer strut
  rodB([2.75, 2.6, 1.05], [2.75, 2.98, 1.05], 0.012, STEEL);
  b.extrude(
    [
      [0, 0],
      [0.5, 0.06],
      [0, 0.16],
    ],
    { at: [2.75, 2.8, 1.05], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: RED, bone: body },
  );

  // ---------- tail ----------
  const finPaint = cel(paint((_p, _n, s) => (s[0] > 0.34 + 0.05 * Math.sin(s[1] * 16) ? RED : CREAM)));
  b.extrude(
    [
      [0, 0],
      [0.55, 0],
      [0.55, 0.95],
      [0.35, 0.9],
      [0, 0.2],
    ],
    { at: [0, 1.55, -2.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, bevel: 0.015, bone: body, color: finPaint },
  );
  const rudPaint = cel(paint((_p, _n, s) => (s[0] > 0.34 + 0.05 * Math.sin(s[1] * 16) ? RED : YELLOW)));
  b.extrude(
    [
      [0, 0],
      [0.55, 0],
      [0.55, 0.5],
      [0.35, 0.95],
      [0.05, 1.0],
      [0, 0.95],
    ],
    { at: [0, 1.55, -2.75], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, bevel: 0.012, smoothing: 1, bone: rudder, color: rudPaint },
  );
  b.extrude(wingOutline(1.3, 0.32, 0.4), {
    at: [0, 1.5, -2.65],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.08,
    bevel: 0.02,
    bone: body,
    color: wingPaint(1.3, 0.32),
  });
  const elevPaint = cel(paint((_p, _n, s) => (s[0] > 1.05 ? RED : YELLOW)));
  for (const s of sides) {
    b.extrude(
      [
        [0, 0],
        [1.3, 0],
        [1.25, -0.3],
        [1.0, -0.42],
        [0.1, -0.45],
      ],
      {
        at: [s * 0.05, 1.5, -2.95],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.06,
        bevel: 0.012,
        bone: elevators[nm(s)],
        color: elevPaint,
      },
    );
    rodB([s * 0.4, 1.46, -2.5], [s * 0.9, 1.5, -2.5], 0.01, WIRE);
    rodB([s * 0.7, 1.9, -2.5], [s * 0.7, 1.5, -2.5], 0.01, WIRE);
  }
  rodB([0, 1.38, -2.5], [0, 0.2, -2.95], 0.03, STEEL);
  b.part(new THREE.TorusGeometry(0.11, 0.055, 6, 10), TIRE, { bone: tailWheel, at: [0, 0.165, -2.95], dir: [1, 0, 0], axis: "z", flat: true });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), RED, { bone: tailWheel, at: [0, 0.165, -2.95], dir: [1, 0, 0] });

  // ---------- landing gear ----------
  rodB([-0.95, 0.44, 1.3], [0.95, 0.44, 1.3], 0.035, WOOD);
  for (const s of sides) {
    const w = wheels[nm(s)];
    b.part(new THREE.TorusGeometry(0.36, 0.09, 6, 14), TIRE, { bone: w, at: [s * 0.95, 0.44, 1.3], dir: [1, 0, 0], axis: "z", flat: true });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12), RED, { bone: w, at: [s * 0.95, 0.44, 1.3], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.17, 10), CREAM, { bone: w, at: [s * 0.95, 0.44, 1.3], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 6), STEEL, { bone: w, at: [s * 0.95, 0.44, 1.3], dir: [1, 0, 0] });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.018, 5, 4), GOLD, {
        bone: w,
        at: [s * 1.03, 0.44 + 0.23 * Math.sin(a), 1.3 + 0.23 * Math.cos(a)],
      });
    }
    rodB([s * 0.38, 1.05, 1.65], [s * 0.95, 0.5, 1.3], 0.045, RED);
    rodB([s * 0.38, 1.05, 0.95], [s * 0.95, 0.5, 1.3], 0.045, RED);
    box(0.1, 0.1, 0.1, STEEL, [s * 0.95, 0.52, 1.3]);
  }

  // headlamp / bonnet badge touches
  ball(0.04, GOLD, [0, 1.4, 2.0 + 0.77]);

  return b.root;
}
