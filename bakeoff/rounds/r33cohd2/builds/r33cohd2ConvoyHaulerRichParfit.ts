import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  "name": "Convoy Hauler Mk-IV",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a roof gun, escorting a sealed glowing cargo pod on its flatbed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3b4250",
  hullDark: "#22262f",
  plate: "#566074",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  glass: "#0e2a3a",
  tire: "#15161a",
  rim: "#8a93a6",
  podShell: "#d8dde6",
  podDark: "#2b303b",
  lightWhite: "#fff6d0",
  red: "#d6283a",
  metal: "#7b8496",
};
const M = {
  deckTop: [0, 1.3, -1] as [number, number, number],
  cabRoof: [0, 2.35, 2.5] as [number, number, number],
  turretRing: [0, 2.4, 2.1] as [number, number, number],
  frontAxle: [0, 0.55, 2.7] as [number, number, number],
  rearAxle1: [0, 0.55, -1.6] as [number, number, number],
  rearAxle2: [0, 0.55, -3] as [number, number, number],
  podCradle: [0, 1.3, -1] as [number, number, number],
  cabFront: [0, 1.2, 3.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at: [x, y, z], ...extra });
  const cyl = (r: number, h: number, seg: number, c: any, x: number, y: number, z: number, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone: body, at: [x, y, z], rotation: rot, flat: true });

  const deck = panelled(paint((p: any, n: any) => {
    const t = noise(p, 0.3, 4);
    return mix(P.plate, P.hull, smoothstep(0.3, 0.7, t) * 0.7);
  }), { size: 0.5, aspect: 1, rivets: 0.12 });

  // deck plate
  box(2.5, 0.1, 5.1, deck, 0, 1.25, -1.05);
  // hazard edge trim
  const HAZ = svg(`<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/><path d="M0 8L8 0H16L8 8ZM16 8L24 0H32L24 8ZM32 8L40 0H48L40 8ZM48 8L56 0H64L56 8Z" fill="#22262f"/></svg>`, { size: 256 });
  for (const s of [1, -1]) {
    box(0.1, 0.14, 5.1, P.trim, s * 1.27, 1.25, -1.05);
    b.part(new THREE.PlaneGeometry(5.0, 0.12), "#ffffff", {
      bone: body, at: [s * 1.325, 1.25, -1.05], dir: [s, 0, 0], axis: "z", up: [0, 0, 1], texture: HAZ,
    });
  }
  box(2.5, 0.14, 0.1, P.trim, 0, 1.25, -3.65);
  box(2.5, 0.14, 0.1, P.trim, 0, 1.25, 1.55);

  // ladder rails
  for (const s of [1, -1]) {
    box(0.16, 0.34, 5.2, P.hullDark, s * 0.8, 1.0, -1.05);
    box(0.28, 0.06, 5.2, P.hull, s * 0.8, 1.17, -1.05);
    box(0.28, 0.06, 5.2, P.hull, s * 0.8, 0.83, -1.05);
  }
  // cross-members
  for (let i = 0; i < 9; i++) {
    const z = -3.5 + i * 0.6;
    box(1.6, 0.14, 0.12, P.hullDark, 0, 1.05, z);
  }
  // under details: diff housings
  for (const z of [-1.6, -3.0]) {
    box(1.7, 0.16, 0.16, P.hullDark, 0, 0.85, z);
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.metal, { bone: body, at: [0, 0.85, z], flat: true });
  }

  // rear bumper
  box(2.6, 0.3, 0.22, P.hullDark, 0, 0.95, -3.58);
  box(2.4, 0.06, 0.04, P.trim, 0, 1.08, -3.7);
  const neon = box(2.2, 0.05, 0.04, P.neonMagenta, 0, 0.9, -3.7);
  glow(neon, 1.6);
  for (const s of [1, -1]) {
    box(0.36, 0.22, 0.04, P.hullDark, s * 0.95, 0.98, -3.67);
    glow(box(0.3, 0.16, 0.06, P.red, s * 0.95, 0.98, -3.7), 1.4);
    // mud flaps
    box(0.5, 0.3, 0.04, P.tire, s * 1.1, 0.9, -3.66);
    box(0.5, 0.06, 0.05, P.trim, s * 1.1, 1.04, -3.67);
  }

  // side boxes (fuel / battery)
  for (const s of [1, -1]) {
    const x = s * 1.12;
    box(0.42, 0.42, 1.3, P.hull, x, 0.95, -0.2, { scale: [1, 1, 1] });
    box(0.44, 0.06, 1.34, P.plate, x, 1.18, -0.2);
    box(0.02, 0.2, 1.0, P.hullDark, s * 1.34, 0.95, -0.2);
    for (const z of [-0.65, -0.2, 0.25]) box(0.06, 0.46, 0.08, P.metal, s * 1.15, 0.95, z + 0.0);
    glow(box(0.02, 0.05, 0.8, P.neonCyan, s * 1.345, 1.08, -0.2), 1.3);
    // cylinder tank
    cyl(0.2, 1.1, 8, metal("steel"), s * 1.12, 0.95, -2.35, [90, 0, 0]);
    box(0.06, 0.4, 0.1, P.trim, s * 1.12, 0.95, -2.0);
    box(0.06, 0.4, 0.1, P.trim, s * 1.12, 0.95, -2.7);
    // exhaust stacks at cab rear
    cyl(0.07, 1.4, 6, metal("blued"), s * 1.0, 1.95, 1.52);
    cyl(0.09, 0.08, 6, P.hullDark, s * 1.0, 2.65, 1.52);
    box(0.1, 0.1, 0.12, P.hullDark, s * 1.0, 1.0, 1.5);
  }
  // front crossbar & coupling
  box(2.2, 0.2, 0.2, P.hullDark, 0, 1.0, 1.5);
  // cable conduit with cyan glow
  glow(box(0.05, 0.05, 4.8, P.neonCyan, 0, 1.33, -1.05), 1.4);
  for (const s of [1, -1]) glow(box(0.04, 0.04, 4.8, P.neonMagenta, s * 1.2, 1.33, -1.05), 1.2);
}
    return buildChassis;
  })(),
  // wheelsFront
  (() => {
function buildWheelsFront({ b, J, P, M }: Ctx) {
  const R = 0.55; // tyre radius
  const W = 0.4; // tyre width
  const AX = M.frontAxle;

  const tireP = paint((p, n, s) => {
    const k = noise(p as any, 0.12, 3);
    const c = mix("#101114", "#1f2026", k);
    return c;
  });
  const hullP = paint((p, n) => {
    const k = noise(p as any, 0.2, 5);
    const c = mix(P.hull, P.plate, smoothstep(0.3, 0.8, k) * 0.6);
    return mix(c, "#22262f", smoothstep(0.2, -0.8, n.y) * 0.5);
  });

  const bolts = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#6b7386" stroke="#22262f" stroke-width="3"/>` +
      [0, 1, 2, 3, 4, 5]
        .map((i) => {
          const a = (i * Math.PI) / 3;
          return `<circle cx="${32 + Math.cos(a) * 20}" cy="${32 + Math.sin(a) * 20}" r="3.5" fill="#cfd5e2" stroke="#22262f" stroke-width="1.5"/>`;
        })
        .join("") +
      `<circle cx="32" cy="32" r="9" fill="#22262f"/></svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const wj = s > 0 ? J.wheelFL : J.wheelFR;
    const x = 1.15 * s;
    const c: [number, number, number] = [x, AX[1], AX[2]];
    const alongX: [number, number, number] = [s, 0, 0];

    // Tyre: faceted cylinder
    b.part(new THREE.CylinderGeometry(R, R, W, 12), tireP, { bone: wj, at: c, dir: alongX, flat: true });
    // sidewall shoulders
    for (const t of [-1, 1])
      b.part(new THREE.CylinderGeometry(R * 0.92, R * 0.98, 0.05, 12), P.tire, {
        bone: wj,
        at: [x + s * t * (W / 2), c[1], c[2]],
        dir: alongX,
        flat: true,
      });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      b.part(new THREE.BoxGeometry(W * 0.9, 0.09, 0.2), P.tire, {
        bone: wj,
        at: [x, c[1] + Math.sin(a) * (R + 0.03), c[2] + Math.cos(a) * (R + 0.03)],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // rim
    b.part(new THREE.CylinderGeometry(0.34, 0.34, W + 0.06, 12), P.rim, { bone: wj, at: c, dir: alongX, flat: true });
    // bolt-ring face on outside
    b.part(new THREE.CircleGeometry(0.33, 12), "#ffffff", {
      bone: wj,
      at: [x + s * (W / 2 + 0.035), c[1], c[2]],
      dir: alongX,
      axis: "z",
      texture: bolts,
    });
    // glowing hub cap
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.09, 8), P.neonCyan, {
        bone: wj,
        at: [x + s * (W / 2 + 0.07), c[1], c[2]],
        dir: alongX,
        flat: true,
      }),
      1.6,
    );

    // suspension spring (coil) above axle
    const sx = 0.8 * s;
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8), P.metal, {
      bone: J.body, at: [sx, 0.75, AX[2] + 0.1], flat: true,
    });
    for (let i = 0; i < 6; i++)
      b.part(new THREE.TorusGeometry(0.1, 0.022, 5, 8), P.metal, {
        bone: J.body,
        at: [sx, 0.8 + i * 0.07, AX[2] + 0.1],
        rotation: [90, 0, 0],
      });
    // damper
    b.rod([sx - 0.15 * s, 0.7, AX[2] - 0.12], [sx - 0.15 * s, 1.15, AX[2] - 0.12], 0.035, P.hullDark, { bone: J.body });

    // Fender: angular arch built from slabs
    const fx = 1.2 * s;
    b.part(new THREE.BoxGeometry(0.62, 0.1, 1.3), hullP, { bone: J.body, at: [fx, 1.2, AX[2]], flat: true });
    b.part(new THREE.BoxGeometry(0.62, 0.1, 0.3), hullP, {
      bone: J.body, at: [fx, 1.14, AX[2] + 0.52], rotation: [-30, 0, 0], flat: true,
    });
    b.part(new THREE.BoxGeometry(0.62, 0.1, 0.3), hullP, {
      bone: J.body, at: [fx, 1.14, AX[2] - 0.52], rotation: [30, 0, 0], flat: true,
    });
    // outer lip and inner wall
    b.part(new THREE.BoxGeometry(0.08, 0.34, 1.3), hullP, { bone: J.body, at: [fx + s * 0.28, 1.0, AX[2]], flat: true });
    b.part(new THREE.BoxGeometry(0.06, 0.3, 1.3), P.hullDark, { bone: J.body, at: [fx - s * 0.28, 1.03, AX[2]], flat: true });
    // yellow trim on edges
    b.part(new THREE.BoxGeometry(0.1, 0.05, 1.32), P.trim, { bone: J.body, at: [fx + s * 0.28, 0.82, AX[2]], flat: true });
    b.part(new THREE.BoxGeometry(0.64, 0.04, 0.06), P.trim, { bone: J.body, at: [fx, 1.26, AX[2] + 0.66], flat: true });
    b.part(new THREE.BoxGeometry(0.64, 0.04, 0.06), P.trim, { bone: J.body, at: [fx, 1.26, AX[2] - 0.66], flat: true });
    // chevrons
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.12), P.trim, {
        bone: J.body, at: [fx + s * 0.1 * (i % 2 ? 1 : -1), 1.26, AX[2] - 0.3 + i * 0.2], flat: true,
      });
    // reflective neon strip
    glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 0.9), P.neonMagenta, {
      bone: J.body, at: [fx + s * 0.33, 1.0, AX[2]], flat: true,
    }), 1.4);
    // rivets
    for (let i = 0; i < 4; i++)
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.rim, {
        bone: J.body, at: [fx + s * 0.33, 1.1, AX[2] - 0.45 + i * 0.3], dir: alongX, flat: true,
      });
    // mud flap
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.3), P.tire, {
      bone: J.body, at: [fx + s * 0.1, 0.8, AX[2] - 0.55], flat: true,
    });
    // steering link / stub axle
    b.rod([x - s * 0.2, c[1], c[2]], [0, c[1], c[2]], 0.05, P.hullDark, { bone: J.body });
    b.rod([x - s * 0.15, c[1] - 0.15, c[2] + 0.1], [0, c[1] - 0.15, c[2] + 0.1], 0.025, P.metal, { bone: J.body });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), P.metal, {
      bone: J.body, at: [x - s * 0.22, c[1], c[2]], dir: alongX, flat: true,
    });
  }

  // axle beam & differential
  b.rod([-1.0, AX[1], AX[2]], [1.0, AX[1], AX[2]], 0.09, P.hullDark, { bone: J.body });
  b.part(new THREE.SphereGeometry(0.22, 8, 6), P.hull, { bone: J.body, at: [0, AX[1], AX[2]], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), P.trim, {
    bone: J.body, at: [0, AX[1], AX[2] + 0.2], dir: [0, 0, 1], flat: true,
  });
}
    return buildWheelsFront;
  })(),
  // wheelsRear
  (() => {
function buildWheelsRear({ b, J, P, M }: any) {
  const TIRE_R = 0.55;
  const TIRE_W = 0.5;

  const tireTex = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const v = noise(p, 0.12, 3);
    return mix("#15161a", "#2a2c33", smoothstep(0.5, 0.9, v) * 0.6 + Math.max(0, n.y) * 0.1);
  });
  const fenderPaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base = mix(P.hull, P.plate, noise(p, 0.3, 5) * 0.6 + Math.max(0, n.y) * 0.3);
    const k = Math.floor((p.z + p.y) / 0.12) % 2 === 0;
    if (Math.abs(n.x) > 0.7 && p.y < 0.95 && p.y > 0.85) return k ? P.trim : P.hullDark;
    return base;
  });
  const reflect = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffffff" stroke="#d6283a" stroke-width="2"/><path d="M0 16L16 0H32L16 16ZM32 16L48 0H64L48 16Z" fill="#d6283a"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelML", 1, -1.6],
    ["wheelMR", -1, -1.6],
    ["wheelBL", 1, -3],
    ["wheelBR", -1, -3],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const x = s * 1.15;
    const ax: [number, number, number] = [s, 0, 0];
    // tyre: octagonal-ish low-poly
    b.part(new THREE.CylinderGeometry(TIRE_R, TIRE_R, TIRE_W, 14), tireTex, { bone: j, at: [x, 0.55, z], dir: ax, flat: true });
    // tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(TIRE_W * 0.9, 0.07, 0.14), P.tire, {
        bone: j,
        at: [x, 0.55 + Math.sin(a) * (TIRE_R + 0.02), z + Math.cos(a) * (TIRE_R + 0.02)],
        rotation: [(-a * 180) / Math.PI + 90 * 0, 0, 0],
      });
    }
    // rim
    const out = x + s * (TIRE_W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 10), P.rim, { bone: j, at: [out, 0.55, z], dir: ax, flat: true });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 8), P.hullDark, { bone: j, at: [out + s * 0.04, 0.55, z], dir: ax, flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 8), P.neonCyan, { bone: j, at: [out + s * 0.08, 0.55, z], dir: ax }), 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 5), P.metal, {
        bone: j,
        at: [out + s * 0.05, 0.55 + Math.sin(a) * 0.27, z + Math.cos(a) * 0.27],
        dir: ax,
      });
    }
  }

  // axle beams, leaf springs, reflectors
  for (const z of [-1.6, -3]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 2.3, 8), P.hullDark, { bone: J.body, at: [0, 0.55, z], dir: [1, 0, 0] });
    b.part(new THREE.BoxGeometry(0.4, 0.2, 0.3), P.metal, { bone: J.body, at: [0, 0.6, z] });
    for (const s of [1, -1]) {
      for (let k = 0; k < 4; k++) {
        b.part(new THREE.BoxGeometry(0.14, 0.035, 0.9 - k * 0.15), k % 2 ? P.hullDark : P.metal, {
          bone: J.body,
          at: [s * 0.8, 0.82 + k * 0.04, z],
        });
      }
      b.part(new THREE.BoxGeometry(0.1, 0.12, 0.12), P.plate, { bone: J.body, at: [s * 0.8, 0.8, z] });
    }
  }

  // tandem link beam
  b.part(new THREE.BoxGeometry(0.2, 0.12, 1.6), P.hullDark, { bone: J.body, at: [0, 0.72, -2.3] });

  // fenders
  for (const s of [1, -1]) {
    const fx = s * 1.12;
    b.part(new THREE.BoxGeometry(0.6, 0.1, 2.9), fenderPaint, { bone: J.body, at: [fx, 1.2, -2.3] });
    for (const e of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.6, 0.35, 0.1), fenderPaint, { bone: J.body, at: [fx, 1.05, -2.3 + e * 1.4], rotation: [e * 20, 0, 0] });
    }
    b.part(new THREE.BoxGeometry(0.08, 0.35, 2.8), fenderPaint, { bone: J.body, at: [s * 1.44 - s * 0.04, 1.02, -2.3] });
    // hazard strip
    b.part(new THREE.BoxGeometry(0.62, 0.04, 2.9), P.trim, { bone: J.body, at: [fx, 1.26, -2.3] });
    // reflective strips
    for (const z of [-1.5, -3.1]) {
      b.part(new THREE.PlaneGeometry(0.7, 0.18), "#ffffff", {
        bone: J.body,
        at: [s * 1.485, 1.0, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: reflect,
      });
    }
    // mud flap
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.04), P.hullDark, { bone: J.body, at: [fx, 0.85, -3.7] });
    // neon edge
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 2.7), P.neonMagenta, { bone: J.body, at: [s * 1.46, 0.86, -2.3] }), 1.4);
  }
}
    return buildWheelsRear;
  })(),
  // cabShell
  (() => {
function buildCabShell({ b, J, P, M }: any) {
  const bone = J.body;
  const GLASS = P.glass;
  const hullPaint = paint((p: any, n: any) => {
    const v = noise(p, 0.3, 4);
    const base = mix(P.hull, P.plate, v * 0.6 + (n.y > 0.5 ? 0.25 : 0));
    return base;
  });
  const HULL = panelled(hullPaint, { size: 0.35, rivets: 0.07 });
  const DARK = panelled(P.hullDark, { size: 0.3, rivets: 0 });

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true, name });

  // main lower cab body
  b.loft(
    [
      { at: [0, 1.65, 1.55], w: 2.6, h: 0.95 },
      { at: [0, 1.7, 2.3], w: 2.6, h: 1.05 },
      { at: [0, 1.65, 2.95], w: 2.5, h: 0.9 },
    ],
    { bone, color: HULL, sides: 4, caps: "flat" },
  );
  // sloped upper cabin (greenhouse)
  b.loft(
    [
      { at: [0, 2.12, 1.6], w: 2.4, h: 0.5 },
      { at: [0, 2.15, 2.2], w: 2.3, h: 0.55 },
      { at: [0, 2.05, 2.85], w: 2.0, h: 0.35 },
    ],
    { bone, color: HULL, sides: 4, caps: "flat" },
  );
  // roof plate
  b.extrude(
    [[-1.0, 0], [1.0, 0], [0.85, 1.25], [-0.85, 1.25]],
    { at: [0, 2.3, 1.65], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, color: DARK, bone },
  );
  // ribs on roof
  for (const z of [1.9, 2.4, 2.8])
    box(1.7, 0.04, 0.06, P.plate, [0, 2.36, z]);
  // roof lights
  for (const s of [1, -1]) {
    glow(box(0.2, 0.06, 0.14, P.lightWhite, [s * 0.7, 2.37, 2.75]), 1.5);
    box(0.26, 0.04, 0.2, P.hullDark, [s * 0.7, 2.33, 2.75]);
  }
  // antenna cluster
  for (const [x, z, h] of [[-0.8, 1.75, 0.07], [-0.65, 1.7, 0.05], [0.8, 1.75, 0.06]]) {
    b.rod([x, 2.33, z], [x, 2.33 + h, z], 0.012, P.metal, { bone });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.red, { bone, at: [x, 2.35 + h, z] });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), P.metal, { bone, at: [0.5, 2.34, 1.75] });
  glow(b.part(new THREE.ConeGeometry(0.1, 0.06, 8), P.neonCyan, { bone, at: [0.5, 2.37, 1.75] }), 1.2);

  const slit = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0e2a3a"/><path d="M0 28L64 6V0H0Z" fill="#1d5a76" opacity=".6"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#e7b814" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#22262f" stroke="#e7b814" stroke-width="4"/><path d="M32 12L50 46H14Z" fill="none" stroke="#ff2fa8" stroke-width="5"/><circle cx="32" cy="36" r="5" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const stripTex = svg(`<svg viewBox="0 0 8 8"><rect width="8" height="8" fill="#e7b814"/><path d="M0 8L8 0M-4 4L4 -4M4 12L12 4" stroke="#22262f" stroke-width="2"/></svg>`, { size: 64 });

  for (const s of [1, -1]) {
    const x = s * 1.31;
    // door panel
    box(0.06, 0.8, 1.0, DARK, [x, 1.75, 2.15]);
    // window slit
    b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", {
      bone, at: [s * 1.2, 2.2, 2.2], dir: [s, 0, 0], axis: "z", texture: slit,
    });
    // (mirrors kept inside the box)
    // handle
    box(0.07, 0.05, 0.2, P.metal, [x + s * 0.04, 1.85, 1.8]);
    // neon strip
    glow(box(0.04, 0.04, 1.4, P.neonCyan, [x + s * 0.02, 1.38, 2.25]), 1.4);
    glow(box(0.04, 0.03, 1.4, P.neonMagenta, [x + s * 0.02, 1.32, 2.25]), 1.4);
    // hazard trim
    b.part(new THREE.BoxGeometry(0.05, 0.1, 1.4), "#ffffff", {
      bone, at: [x + s * 0.01, 1.5, 2.25], texture: stripTex, flat: true,
    });
    // emblem
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      bone, at: [x + s * 0.045, 1.95, 2.62], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
    // wing mirror
    b.rod([s * 1.3, 2.1, 2.7], [s * 1.33, 2.15, 2.75], 0.018, P.metal, { bone });
    box(0.04, 0.26, 0.2, P.hullDark, [s * 1.33, 2.15, 2.8]);
    b.part(new THREE.PlaneGeometry(0.16, 0.22), P.glass, {
      bone, at: [s * 1.33, 2.15, 2.9 + 0.001], dir: [0, 0, 1], axis: "z",
    });
    // side armour skirts angled
    box(0.1, 0.4, 0.5, P.plate, [s * 1.28, 2.1, 1.75], [0, 0, s * 10]);
    // rear pillars
    box(0.12, 0.7, 0.12, P.hullDark, [s * 1.1, 2.0, 1.55]);
  }

  // rear cab wall
  box(2.2, 0.9, 0.08, DARK, [0, 1.8, 1.52]);
  // ladder
  for (const s of [1, -1]) b.rod([s * 0.4, 1.35, 1.46], [s * 0.4, 2.35, 1.46], 0.025, P.metal, { bone });
  for (let i = 0; i < 7; i++) b.rod([-0.4, 1.45 + i * 0.14, 1.46], [0.4, 1.45 + i * 0.14, 1.46], 0.018, P.metal, { bone });
  // rear window light
  glow(box(0.5, 0.06, 0.04, P.red, [0, 2.2, 1.47]), 1.2);

  // cab front-top transition plate (windshield base)
  b.part(new THREE.PlaneGeometry(2.0, 0.34), "#ffffff", {
    bone, at: [0, 2.2, 2.92], dir: [0, 0.5, 1], axis: "z", texture: slit,
  });
  box(2.3, 0.08, 0.1, P.trim, [0, 2.4, 2.9]);
  // turret ring seat at cabRoof
  b.part(new THREE.CylinderGeometry(0.42, 0.46, 0.08, 10), P.hullDark, { bone, at: [M.turretRing[0], 2.36, M.turretRing[2]], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), P.metal, {
      bone, at: [Math.sin(a) * 0.38, 2.38, 2.1 + Math.cos(a) * 0.38],
    });
  }
}
    return buildCabShell;
  })(),
  // cabFront
  (() => {
function buildCabFront({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const Y = "#e7b814";
  const box = (w: number, h: number, d: number, c: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, ...extra });

  const plating = paint((p, n) => {
    const base = n.y > 0.5 ? mix(P.hull, P.plate, 0.5) : P.hull;
    const k = noise(p, 0.18, 4);
    return mix(base, P.hullDark, smoothstep(0.55, 0.85, k) * 0.6);
  });

  // Hood: sloped wedge via extrude (side profile drawn z forward, y up)
  b.extrude(
    [[0, 0], [0.72, 0], [0.72, 0.28], [0.5, 0.42], [0, 0.78]],
    { at: [0, 1.25, 3.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, color: plating, bone, name: "hood" },
  );
  // Windshield slope with glowing visor
  b.extrude(
    [[0, 0], [0.5, 0], [0, 0.6]],
    { at: [0, 1.6, 3.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: P.hullDark, bone, name: "windshield" },
  );
  glow(box(2.0, 0.1, 0.05, P.neonCyan, [0, 2.0, 3.2], [-52, 0, 0]), 1.4);
  box(2.1, 0.06, 0.06, P.glass, [0, 1.93, 3.26], [-52, 0, 0]);

  // Front fascia plate
  box(2.6, 0.9, 0.12, plating, [0, 1.0, 3.68], undefined, { name: "fascia" });
  box(2.7, 0.08, 0.2, Y, [0, 1.47, 3.66]);

  // Grille with SVG slats
  let slats = "";
  for (let i = 0; i < 9; i++) slats += `<rect x="4" y="${6 + i * 10}" width="88" height="5" fill="#101820"/><rect x="4" y="${11 + i * 10}" width="88" height="2" fill="#2ff3ff"/>`;
  const grille = svg(`<svg viewBox="0 0 96 96"><rect width="96" height="96" fill="#1a2028"/>${slats}<rect x="1" y="1" width="94" height="94" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`, { size: 192 });
  glow(b.part(new THREE.PlaneGeometry(1.3, 0.7), "#ffffff", { bone, at: [0, 1.0, 3.75], dir: [0, 0, 1], axis: "z", texture: grille }), 0.7);

  // Headlights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 6), P.lightWhite, { bone, at: [s * 0.97, 1.2, 3.74], dir: [0, 0, 1] }), 1.8);
    box(0.5, 0.06, 0.1, P.hullDark, [s * 0.97, 1.42, 3.74]);
    glow(box(0.4, 0.05, 0.05, P.neonMagenta, [s * 0.97, 0.8, 3.75]), 1.3);
  }

  // Light bar on roof edge of hood
  box(1.6, 0.14, 0.14, P.hullDark, [0, 2.1, 3.08]);
  for (let i = 0; i < 5; i++) glow(box(0.24, 0.1, 0.05, P.lightWhite, [-0.64 + i * 0.32, 2.1, 3.16]), 1.6);

  // Bull-bar bumper
  box(2.8, 0.34, 0.24, P.hullDark, [0, 0.62, 3.6]);
  const chev = svg(`<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 20 + 4} 0 L${i * 20 + 14} 0 L${i * 20 + 24} 20 L${i * 20 + 14} 20Z" fill="#15161a"/>`).join("")}</svg>`, { size: 192 });
  b.part(new THREE.PlaneGeometry(2.6, 0.2), "#ffffff", { bone, at: [0, 0.62, 3.73], dir: [0, 0, 1], axis: "z", texture: chev });
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 0.7, 3.6], [s * 1.0, 1.1, 3.62], 0.06, P.metal, { bone });
    b.rod([s * 0.5, 0.8, 3.64], [s * 0.5, 0.45, 3.64], 0.05, P.metal, { bone });
    // tow hook
    b.sweep([[s * 0.6, 0.55, 3.55], [s * 0.6, 0.55, 3.64], [s * 0.6, 0.48, 3.66]], 0.03, { color: P.metal, bone, sides: 6 });
  }
  b.rod([0, 0.95, 3.6], [0, 0.45, 3.6], 0.04, P.metal, { bone });

  // Winch drum
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), P.metal, { bone, at: [0, 0.62, 3.6], dir: [1, 0, 0] });
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), P.hullDark, { bone, at: [s * 0.47, 0.62, 3.6], dir: [1, 0, 0] });

  // Front plate
  const plate = svg(`<svg viewBox="0 0 80 28"><rect width="80" height="28" fill="#eee"/><text x="40" y="21" font-size="17" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#222">K9-4417</text></svg>`, { size: 160 });
  b.part(new THREE.PlaneGeometry(0.5, 0.18), "#ffffff", { bone, at: [0, 0.98, 3.745], dir: [0, 0, 1], axis: "z", texture: plate });

  // Fender-side hazard trim and neon
  for (const s of [1, -1]) {
    box(0.08, 0.1, 0.7, Y, [s * 1.3, 1.55, 3.35]);
    glow(box(0.04, 0.05, 0.6, P.neonCyan, [s * 1.31, 1.35, 3.35]), 1.2);
  }
}
    return buildCabFront;
  })(),
  // turretGun
  (() => {
function buildTurretGun({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const AMBER = "#ff3b2f";
  const plateP = paint((p, n) => {
    const t = noise(p, 0.12, 4);
    const base = mix(P.plate, P.hull, t * 0.7);
    return n.y > 0.5 ? mix(base, "#7a869c", 0.3) : base;
  });
  const hullP = paint((p) => mix(P.hullDark, P.hull, noise(p, 0.1, 9)));

  // Base ring (on yaw)
  b.part(new THREE.CylinderGeometry(0.46, 0.5, 0.1, 12), hullP, { bone: yaw, at: [0, 2.4, 2.1], flat: true });
  b.part(new THREE.CylinderGeometry(0.4, 0.44, 0.08, 12), P.trim, { bone: yaw, at: [0, 2.48, 2.1], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.06), P.metal, {
      bone: yaw, at: [Math.sin(a) * 0.47, 2.43, 2.1 + Math.cos(a) * 0.47],
    });
  }
  // Hex housing
  b.part(new THREE.CylinderGeometry(0.36, 0.4, 0.3, 6), plateP, { bone: yaw, at: [0, 2.67, 2.1], flat: true });
  b.part(new THREE.CylinderGeometry(0.3, 0.36, 0.08, 6), hullP, { bone: yaw, at: [0, 2.86, 2.1], flat: true });
  // Side cheeks holding the pitch axis
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.3, 0.34), plateP, { bone: yaw, at: [s * 0.3, 2.75, 2.3] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), P.metal, { bone: yaw, at: [s * 0.36, 2.75, 2.3], rotation: [0, 0, 90] });
  }
  // Ammo box on the left
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.3), P.hullDark, { bone: yaw, at: [0.46, 2.62, 2.0] });
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.32), P.trim, { bone: yaw, at: [0.46, 2.73, 2.0] });
  b.part(new THREE.BoxGeometry(0.04, 0.06, 0.1), P.metal, { bone: yaw, at: [0.57, 2.65, 2.0] });

  // Shield plate with hazard decal
  const shield = b.extrude(
    [[-0.36, 0], [0.36, 0], [0.3, 0.38], [0, 0.46, "sharp"], [-0.3, 0.38]],
    { at: [0, 2.5, 2.52], x: [1, 0, 0], thickness: 0.05, bevel: 0.01, color: plateP, bone: yaw },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#e7b814"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 16 - 20} 40 L${i * 16 - 4} 0 L${i * 16 + 4} 0 L${i * 16 - 12} 40Z" fill="#15161a"/>`).join("") +
      `<rect x="1" y="1" width="62" height="38" fill="none" stroke="#15161a" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.14), "#ffffff", {
    bone: yaw, at: [0, 2.6, 2.552], dir: [0, 0, 1], axis: "z", texture: hazard,
  });

  // Sensor eye
  b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.08, 8), P.hullDark, { bone: yaw, at: [-0.3, 2.9, 2.2] });
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), AMBER, { bone: yaw, at: [-0.3, 2.93, 2.24] }), 2);
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 5), P.metal, { bone: yaw, at: [-0.15, 2.97, 2.1] });

  // Gun (on pitch)
  const gy = 2.75;
  b.part(new THREE.BoxGeometry(0.4, 0.26, 0.4), hullP, { bone: pitch, at: [0, gy, 2.35] });
  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.3), P.trim, { bone: pitch, at: [0, gy + 0.15, 2.35] });
  for (const s of [1, -1]) {
    const x = s * 0.1;
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.7, 8), P.plate, { bone: pitch, at: [x, gy, 2.85], rotation: [90, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 6), P.metal, { bone: pitch, at: [x, gy, 3.2], rotation: [90, 0, 0] });
    // cooling fins
    for (let i = 0; i < 4; i++)
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 8), P.hullDark, { bone: pitch, at: [x, gy, 2.65 + i * 0.1], rotation: [90, 0, 0] });
    // muzzle brake
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.hullDark, { bone: pitch, at: [x, gy, 3.36] });
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.04), P.metal, { bone: pitch, at: [x, gy, 3.36] });
    glow(b.part(new THREE.CircleGeometry(0.02, 6), P.neonCyan, { bone: pitch, at: [x, gy, 3.425], dir: [0, 0, 1], axis: "z" }), 1.2);
  }
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.5), P.hullDark, { bone: pitch, at: [0, gy, 2.95] });
  // ammo feed belt
  b.part(new THREE.BoxGeometry(0.04, 0.04, 0.3), P.trim, { bone: pitch, at: [0.24, gy - 0.05, 2.25] });
}
    return buildTurretGun;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P }: any) {
  const body = J.body;
  const hatch = J.podHatch;
  const R = rng(5);
  const Y0 = 2.1; // pod axis height
  const Z0 = -1.1; // pod centre z
  const L = 4.4; // shell length
  const RAD = 0.78;

  const shellPaint = paint((p, n) => {
    const t = noise(p, 0.3, 3);
    const base = mix(P.podShell, "#aab3c2", n.y < 0 ? 0.5 : 0.1 + 0.15 * t);
    // hazard bands
    const bands = [-1.7, 1.5];
    for (const z of bands) {
      const dz = p.z - (Z0 + z);
      if (Math.abs(dz) < 0.22) return (Math.floor((p.x + p.y + dz) / 0.12) % 2 ? P.trim : P.podDark);
    }
    // cyan seams
    const dz = p.z - Z0;
    if (Math.abs(dz) < 0.015 || Math.abs(Math.abs(dz) - 0.8) < 0.012) return P.neonCyan;
    return base;
  });

  // main shell: faceted hex-ish capsule along z
  const shell = b.part(new THREE.CylinderGeometry(RAD, RAD, L, 10, 1), shellPaint, {
    bone: body, at: [0, Y0, Z0], dir: [0, 0, 1], flat: true, scale: [1.5 / 1.0 * 0.8, 1, 1],
  });
  // scale applies to local x,z of cylinder (radial) - fine: widened a bit
  void shell;
  // end caps (dark, faceted)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(RAD * 1.0, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.podDark, {
      bone: body, at: [0, Y0, Z0 + s * (L / 2)], dir: [0, 0, s], flat: true, scale: [1.2, 0.55, 1.0],
    });
    b.part(new THREE.CylinderGeometry(RAD * 1.05, RAD * 1.05, 0.12, 10), P.plate, {
      bone: body, at: [0, Y0, Z0 + s * (L / 2 - 0.06)], dir: [0, 0, 1], flat: true, scale: [1.2, 1, 1],
    });
  }
  // end lights (magenta)
  for (const s of [1, -1])
    for (const x of [-0.5, 0.5])
      glow(b.part(new THREE.BoxGeometry(0.18, 0.1, 0.06), P.neonMagenta, {
        bone: body, at: [x, Y0 + 0.3, Z0 + s * (L / 2 + 0.28)],
      }), 1.6);

  // glyph + serial decals on both flanks
  const glyph = svg(`<svg viewBox="0 0 100 60"><rect x="2" y="2" width="96" height="56" rx="6" fill="#2b303b" stroke="#e7b814" stroke-width="3"/>
    <path d="M30 48 L50 10 L70 48Z" fill="#e7b814" stroke="#22262f" stroke-width="3"/><rect x="48" y="22" width="4" height="14" fill="#22262f"/><circle cx="50" cy="42" r="2.6" fill="#22262f"/>
    <text x="50" y="57" font-size="8" text-anchor="middle" fill="#2ff3ff" font-family="monospace">CP-4471-X</text></svg>`, { size: 256 });
  const serial = svg(`<svg viewBox="0 0 120 30"><rect width="120" height="30" fill="#22262f"/><text x="60" y="21" font-size="16" text-anchor="middle" fill="#ff2fa8" font-family="monospace" font-weight="bold">SEALED // 0X7F</text></svg>`, { size: 256 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.54), "#ffffff", {
      bone: body, at: [s * 1.215, Y0 + 0.1, Z0 + 0.3], dir: [s, 0, 0], axis: "z", texture: glyph,
    });
    b.part(new THREE.PlaneGeometry(1.0, 0.25), "#ffffff", {
      bone: body, at: [s * 1.215, Y0 - 0.25, Z0 - 0.9], dir: [s, 0, 0], axis: "z", texture: serial,
    });
  }
  // side neon strips
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 3.4), P.neonCyan, {
      bone: body, at: [s * 1.2, Y0 - 0.55, Z0],
    }), 1.5);

  // cradle frames + straps
  for (const z of [-2.5, -1.1, 0.3]) {
    const zc = Z0 + (z - Z0);
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.14, 0.7, 0.16), P.hullDark, { bone: body, at: [s * 1.0, 1.65, zc] });
      b.part(new THREE.BoxGeometry(0.4, 0.1, 0.22), P.plate, { bone: body, at: [s * 1.1, 1.33, zc], flat: true });
      // corner clamps
      b.part(new THREE.BoxGeometry(0.2, 0.2, 0.26), P.trim, { bone: body, at: [s * 1.12, 1.42, zc] });
    }
    // base beam
    b.part(new THREE.BoxGeometry(2.2, 0.12, 0.18), P.hullDark, { bone: body, at: [0, 1.4, zc] });
    // strap over the top
    const strapPts: number[][] = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (i / 12);
      strapPts.push([Math.cos(a) * 1.22, Y0 - 0.25 + Math.sin(a) * 0.98, zc + 0.12]);
    }
    strapPts.reverse();
    // path as polyline wide strap
    for (let i = 0; i < 12; i++) {
      const a = strapPts[i], c = strapPts[i + 1];
      b.rod(a, c, 0.035, P.hullDark, { bone: body, sides: 4 });
    }
    // buckle + ratchet
    b.part(new THREE.BoxGeometry(0.16, 0.12, 0.1), P.metal, { bone: body, at: [0.55, Y0 + 0.85, zc + 0.14], flat: true });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), P.trim, {
      bone: body, at: [-0.55, Y0 + 0.85, zc + 0.14], dir: [1, 0, 0],
    });
  }

  // hatch on podHatch joint
  const hy = Y0 + RAD * 0.95;
  b.part(new THREE.CylinderGeometry(0.5, 0.55, 0.1, 8), P.plate, {
    bone: hatch, at: [0, hy, Z0 + 0.1], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8), P.podDark, { bone: hatch, at: [0, hy + 0.07, Z0 + 0.1], flat: true });
  // lock wheel
  b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 10), P.trim, {
    bone: hatch, at: [0, hy + 0.14, Z0 + 0.1], dir: [0, 1, 0], axis: "z", flat: true,
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    b.part(new THREE.BoxGeometry(0.4, 0.03, 0.03), P.trim, {
      bone: hatch, at: [0, hy + 0.14, Z0 + 0.1], rotation: [0, a * 180 / Math.PI, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6), P.metal, { bone: hatch, at: [0, hy + 0.1, Z0 + 0.1] });
  // indicator
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonMagenta, {
    bone: hatch, at: [0.38, hy + 0.12, Z0 + 0.35],
  }), 2);
  glow(b.part(new THREE.BoxGeometry(0.5, 0.02, 0.05), P.neonCyan, {
    bone: hatch, at: [0, hy + 0.1, Z0 - 0.35],
  }), 1.6);
  // hatch hinge
  b.part(new THREE.BoxGeometry(0.4, 0.06, 0.08), P.hullDark, { bone: hatch, at: [0, hy + 0.04, Z0 - 0.45] });

  // magenta warning lights on shell top row
  for (let i = 0; i < 4; i++)
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonMagenta, {
      bone: body, at: [0.0 + (i % 2 ? 0.45 : -0.45), Y0 + 0.75, Z0 + (i < 2 ? 1.6 : -1.8)],
    }), 1.8);
  void R;
}
    return buildCargoPod;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.55,2.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.55,2.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.15,0.55,-1.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.15,0.55,-1.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelBL"] = b.joint("wheelBL", { parent: J["body"], at: [1.15,0.55,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelBR"] = b.joint("wheelBR", { parent: J["body"], at: [-1.15,0.55,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.4,2.1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,2.75,2.2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["podHatch"] = b.joint("podHatch", { parent: J["body"], at: [0,2.75,-1], dir: [0,0,1], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
