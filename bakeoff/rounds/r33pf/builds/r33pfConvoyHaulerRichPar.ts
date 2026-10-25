import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  "name": "Convoy Hauler MK-IV",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a slab-armoured cab, a roof gun turret and a sealed glowing cargo pod strapped to its flatbed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3b4250",
  hullDark: "#20242e",
  plate: "#586070",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb0",
  glass: "#0c3a46",
  rubber: "#15161b",
  rim: "#8a93a3",
  rust: "#7a4a2c",
  podShell: "#d9dde6",
  podCore: "#ff8a2f",
  gunmetal: "#2a2d36",
  white: "#f2f2f2",
};
const M = {
  chassisTop: [0, 1.2, 0] as [number, number, number],
  cabFloor: [0, 1.2, 3.05] as [number, number, number],
  turretRing: [0, 2.75, 2.7] as [number, number, number],
  podDeck: [0, 1.35, -1.3] as [number, number, number],
  axleFront: [0, 0.6, 2.9] as [number, number, number],
  axleMid: [0, 0.6, -0.4] as [number, number, number],
  axleRear: [0, 0.6, -2.6] as [number, number, number],
  bumperBack: [0, 0.75, 3.9] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, flat: true, ...extra });

  const hazard = paint((p, n) => {
    if (Math.abs(n.x) > 0.5 || Math.abs(n.z) > 0.5) {
      const k = Math.floor((p.z + p.y * 1.0) / 0.18) % 2 === 0;
      const base = mix(P.hullDark, P.trim, k ? 1 : 0);
      return base;
    }
    return mix(P.hull, P.plate, noise(p, 0.3, 4));
  });
  const deckPaint = panelled(P.hull, { size: 0.4, rivets: 0.08 });
  const darkPaint = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });

  // main frame rails and deck
  for (const s of [1, -1]) {
    box(0.22, 0.3, 7.8, darkPaint, [s * 0.75, 0.62, 0]);
    box(0.1, 0.34, 7.4, hazard, [s * 1.25, 0.6, 0]);
  }
  box(2.5, 0.12, 7.6, deckPaint, [0, 1.0, 0]);
  box(2.6, 0.1, 7.4, P.plate, [0, 1.14, -0.2]);
  // deck side plating with hazard stripes
  for (const s of [1, -1]) {
    box(0.08, 0.24, 6.2, hazard, [s * 1.3, 1.05, -0.8]);
    box(0.06, 0.06, 6.2, P.plate, [s * 1.31, 1.2, -0.8]);
  }
  // cross members
  for (let i = 0; i < 8; i++) box(2.0, 0.18, 0.14, P.gunmetal, [0, 0.78, -3.4 + i * 1.0]);
  // underbody
  box(1.5, 0.12, 6.8, P.hullDark, [0, 0.45, 0]);
  // axles + springs
  for (const z of [2.9, -0.4, -2.6]) {
    cyl(0.1, 0.1, 2.4, 8, P.gunmetal, [0, 0.6, z], { rotation: [0, 0, 90] });
    cyl(0.22, 0.22, 0.4, 8, P.hullDark, [0, 0.6, z], { rotation: [0, 0, 90] });
    for (const s of [1, -1]) {
      for (let k = 0; k < 4; k++)
        cyl(0.17, 0.17, 0.04, 8, P.rim, [s * 0.95, 0.78 + k * 0.07, z], { rotation: [0, k * 20, 0] });
      cyl(0.05, 0.05, 0.3, 6, P.rust, [s * 0.95, 0.88, z]);
      box(0.35, 0.05, 0.14, P.gunmetal, [s * 0.95, 0.74, z]);
    }
  }
  // fuel tanks
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.6, 8, metal("steel"), [s * 1.05, 0.62, 0.9], { rotation: [90, 0, 0] });
    for (const z of [0.3, 1.5]) box(0.06, 0.5, 0.1, P.trim, [s * 1.05, 0.62, z]);
    cyl(0.1, 0.1, 0.05, 6, P.neonCyan, [s * 1.05, 0.9, 0.9]);
    // side skirts
    box(0.06, 0.34, 1.7, darkPaint, [s * 1.36, 0.6, 0.9], {});
    box(0.07, 0.06, 1.7, P.trim, [s * 1.38, 0.78, 0.9]);
  }
  // underglow
  glow(box(2.0, 0.04, 6.2, P.neonCyan, [0, 0.38, 0]), 1.4);
  for (const s of [1, -1]) glow(box(0.04, 0.04, 5.6, P.neonCyan, [s * 1.32, 0.42, -0.8]), 1.3);

  // rear bumper
  box(2.7, 0.4, 0.3, hazard, [0, 0.62, -3.95]);
  box(2.5, 0.14, 0.36, P.gunmetal, [0, 0.9, -3.95]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.14, 0.06, "#ff2a2a", [s * 0.95, 0.9, -4.0]), 1.5);
    glow(box(0.2, 0.06, 0.04, P.neonMagenta, [s * 0.5, 0.62, -4.03]), 1.2);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.rim, { bone, at: [s * 0.6, 0.45, -4.0], flat: true });
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.rim, { bone, at: [s * 0.6, 0.4, 3.98], flat: true });
  }
  // plate with kanji
  const plate = svg(
    `<svg viewBox="0 0 80 40"><rect x="1" y="1" width="78" height="38" rx="3" fill="#f2f2f2" stroke="#20242e" stroke-width="2"/><text x="40" y="29" font-size="24" text-anchor="middle" fill="#20242e" font-family="sans-serif">輸送 04</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", { bone, at: [0, 0.66, -4.11], dir: [0, 0, -1], axis: "z", texture: plate });

  // front wedge bumper
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 2.6, 3), hazard, {
    bone, at: [0, 0.62, 3.95], rotation: [0, 0, 90], scale: [0.7, 1, 0.9], flat: true,
  });
  box(2.6, 0.35, 0.3, P.gunmetal, [0, 0.7, 4.0]);
  // plough blade
  box(2.7, 0.3, 0.12, P.plate, [0, 0.45, 4.25], { rotation: [-25, 0, 0] });
  for (const s of [1, -1]) box(0.14, 0.4, 0.3, P.trim, [s * 1.3, 0.5, 4.15]);
  // light bar
  glow(box(2.2, 0.08, 0.06, P.neonCyan, [0, 0.92, 4.13]), 1.6);
  glow(box(0.9, 0.05, 0.05, P.neonMagenta, [0, 0.55, 4.28]), 1.2);
  // mounts for cab/pod
  box(1.6, 0.06, 1.8, P.gunmetal, [0, 1.2, 3.05]);
  box(1.8, 0.06, 5.0, P.hullDark, [0, 1.2, -1.4]);
  for (const z of [-3.3, 0.6]) for (const s of [1, -1]) cyl(0.07, 0.07, 0.1, 6, P.trim, [s * 1.05, 1.24, z]);
}
    return buildChassis;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.6;
  const W = 0.42;
  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="6"/><circle cx="32" cy="32" r="10" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const tyre = paint((p, n) => {
    const k = noise(p, 0.08, 3);
    return mix("#101116", "#1d1e25", k * 0.8 + 0.1 * smoothstep(-0.5, 1, n.y));
  });
  const metalP = paint((p, n) => mix("#6d7585", "#9aa3b3", noise(p, 0.05, 5) * 0.7 + 0.3 * smoothstep(0, 1, n.y)));
  const mud = paint((p) => mix("#20242e", "#7a4a2c", smoothstep(0.1, 0.0, p.y) * 0.8 + noise(p, 0.1, 2) * 0.2));

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleMid[2]],
    ["wheelMR", -1, M.axleMid[2]],
    ["wheelRL", 1, M.axleRear[2]],
    ["wheelRR", -1, M.axleRear[2]],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.2;
    const cy = M.axleFront[1];
    const ctr: [number, number, number] = [cx, cy, z];
    const axis: [number, number, number] = [1, 0, 0];
    // tyre octagon (flat face on floor: rotate 22.5deg)
    const tg = new THREE.CylinderGeometry(R / Math.cos(Math.PI / 8), R / Math.cos(Math.PI / 8), W, 8);
    tg.rotateY(Math.PI / 8);
    b.part(tg, tyre, { bone: j, at: ctr, dir: axis, flat: true });
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = R + 0.02;
      const y = cy + Math.cos(a) * rr;
      const zz = z + Math.sin(a) * rr;
      b.part(new THREE.BoxGeometry(W * 0.9, 0.06, 0.2), P.rubber, {
        bone: j,
        at: [cx, y, zz],
        rotation: [(-a * 180) / Math.PI + 90 - 90, 0, 0],
      });
    }
    // rim
    const out = cx + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 8), metalP, {
      bone: j,
      at: [out, cy, z],
      dir: axis,
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 8), P.rim, {
      bone: j,
      at: [out + s * 0.04, cy, z],
      dir: axis,
    });
    // glowing hub ring
    glow(
      b.part(new THREE.CircleGeometry(0.3, 16), "#ffffff", {
        bone: j,
        at: [out + s * 0.075, cy, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: hubTex,
      }),
      1.4,
    );
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.gunmetal, {
        bone: j,
        at: [out + s * 0.09, cy + Math.cos(a) * 0.14, z + Math.sin(a) * 0.14],
        dir: axis,
      });
    }
    // fender: angular arch from three slabs
    const fx = cx;
    const fw = W + 0.18;
    b.part(new THREE.BoxGeometry(fw, 0.08, 1.2), P.hullDark, { bone: J.body, at: [fx, cy + R + 0.2, z] });
    b.part(new THREE.BoxGeometry(fw, 0.08, 0.5), P.hull, {
      bone: J.body,
      at: [fx, cy + R + 0.08, z + 0.62],
      rotation: [-35, 0, 0],
    });
    b.part(new THREE.BoxGeometry(fw, 0.08, 0.5), P.hull, {
      bone: J.body,
      at: [fx, cy + R + 0.08, z - 0.62],
      rotation: [35, 0, 0],
    });
    // hazard trim on fender edge
    b.part(new THREE.BoxGeometry(0.04, 0.05, 1.1), P.trim, {
      bone: J.body,
      at: [fx + s * (fw / 2), cy + R + 0.22, z],
    });
    // mud flap behind
    b.part(new THREE.BoxGeometry(fw - 0.06, 0.45, 0.04), mud, {
      bone: J.body,
      at: [fx, cy + 0.02, z - 0.78],
    });
    b.part(new THREE.BoxGeometry(fw - 0.2, 0.06, 0.05), P.trim, {
      bone: J.body,
      at: [fx, cy - 0.15, z - 0.8],
    });
  }
}
    return buildWheels;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const Z0 = 3.05;
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });

  const HULL = panelled(P.hull, { size: 0.3, rivets: 0.06 });
  const PLATE = panelled(P.plate, { size: 0.25, rivets: 0.05 });
  const DARK = paint((p, n) => {
    const t = noise(p, 0.2, 3);
    return mix(P.hullDark, P.gunmetal, t * 0.6 + 0.2 * Math.max(n.y, 0));
  });

  // main hull: stacked slabs
  box(2.6, 0.5, 1.7, DARK, [0, 1.45, 3.05]);
  box(2.5, 0.7, 1.6, HULL, [0, 1.95, 3.0]);
  box(2.3, 0.45, 1.3, PLATE, [0, 2.5, 2.85]);
  // sloped windshield wedge
  const wedge = b.extrude(
    [[0, 0], [0.7, 0], [0.45, 0.75], [0, 0.75]],
    { at: [-1.1, 2.0, 3.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: HULL, bone: body },
  );
  void wedge;
  // hood
  box(2.4, 0.45, 0.7, HULL, [0, 1.65, 3.55]);
  box(2.2, 0.12, 0.6, PLATE, [0, 1.93, 3.55]);

  // glowing slit windshield
  const slit = b.part(new THREE.BoxGeometry(1.9, 0.2, 0.05), P.neonCyan, {
    bone: body, at: [0, 2.3, 3.72], rotation: [-25, 0, 0],
  });
  glow(slit, 1.4);
  for (const s of [1, -1]) {
    glow(box(0.04, 0.22, 0.6, P.glass, [s * 1.27, 2.3, 2.95]), 0.8);
    // wipers
    b.rod([s * 0.5, 2.18, 3.73], [s * 0.1, 2.3, 3.7], 0.012, P.hullDark, { bone: body });
  }

  // grille with magenta strips
  box(1.6, 0.5, 0.08, P.hullDark, [0, 1.5, 3.92]);
  for (let i = 0; i < 4; i++) glow(box(1.4, 0.03, 0.03, P.neonMagenta, [0, 1.36 + i * 0.12, 3.96]), 1.5);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.16, 0.06, "#ffffff", [s * 1.0, 1.65, 3.92]), 1.8);
    box(0.36, 0.22, 0.04, P.hullDark, [s * 1.0, 1.65, 3.89]);
  }

  // side armour plates with hazard trim
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#20242e"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#20242e"/><path d="M32 6 L58 32 L32 58 L6 32Z" fill="none" stroke="#2ff3ff" stroke-width="4"/><path d="M20 24h24M20 32h24M32 20v26" stroke="#ff2fb0" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/><text x="32" y="23" font-size="20" text-anchor="middle" font-weight="bold" fill="#20242e">警告</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    box(0.1, 0.9, 1.4, PLATE, [s * 1.3, 1.95, 3.0]);
    b.part(new THREE.PlaneGeometry(1.3, 0.14), "#ffffff", {
      bone: body, at: [s * 1.356, 1.58, 3.0], dir: [s, 0, 0], axis: "z", texture: hazard,
    });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: body, at: [s * 1.356, 2.1, 3.3], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
    b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
      bone: body, at: [s * 1.356, 2.1, 2.6], dir: [s, 0, 0], axis: "z", texture: warn,
    });
    // door outline
    for (const [w, h, d, y, z] of [[0.03, 0.8, 0.03, 1.95, 3.3], [0.03, 0.8, 0.03, 1.95, 2.7], [0.03, 0.03, 0.62, 2.35, 3.0], [0.03, 0.03, 0.62, 1.58, 3.0]] as number[][])
      box(w, h, d, P.hullDark, [s * 1.37, y, z]);
    box(0.04, 0.05, 0.2, P.trim, [s * 1.38, 2.0, 2.75]);
    // mirror drone
    b.rod([s * 1.3, 2.3, 3.6], [s * 1.55, 2.35, 3.65], 0.02, P.gunmetal, { bone: body });
    box(0.18, 0.2, 0.12, P.hullDark, [s * 1.6, 2.35, 3.65]);
    glow(box(0.1, 0.04, 0.02, P.neonCyan, [s * 1.6, 2.38, 3.72]), 1.4);
    // exhaust stacks behind cab
    b.rod([s * 1.0, 1.3, 2.28], [s * 1.0, 3.0, 2.28], 0.1, P.gunmetal, { bone: body });
    b.rod([s * 1.0, 2.9, 2.28], [s * 1.0, 3.05, 2.28], 0.12, P.trim, { bone: body });
    box(0.3, 0.5, 0.1, P.trim, [s * 1.0, 1.75, 2.2], { scale: [1, 1, 1] });
  }
  // roof: ring, vents, antennas
  b.lathe([[0, 0], [0.55, 0], [0.5, 0.08], [0, 0.08]], {
    at: [0, 2.72, 2.7], color: P.trim, bone: body, segments: 12,
  });
  for (let i = 0; i < 4; i++) box(0.4, 0.06, 0.05, P.hullDark, [0.75, 2.76, 3.3 - i * 0.1 - 0.2]);
  box(0.5, 0.1, 0.4, P.gunmetal, [-0.7, 2.78, 3.3]);
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 2.72, 2.5], [s * 1.15, 3.7, 2.4], 0.012, P.gunmetal, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: body, at: [s * 1.15, 3.72, 2.4] }), 2);
  }
  // roof neon edge
  glow(box(2.3, 0.03, 0.03, P.neonCyan, [0, 2.74, 3.5]), 1.3);
  // bumper-back seam to meet bumper
  box(2.6, 0.3, 0.1, P.plate, [0, 1.35, 3.85]);
  // cab rear panel + floor
  box(2.5, 1.4, 0.1, DARK, [0, 1.95, 2.25]);
  box(2.6, 0.12, 1.7, P.hullDark, [0, 1.25, 3.05]);
}
    return buildCab;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const ring = M.turretRing;
  const HULL = panelled(P.hull, { size: 0.22, rivets: 0.05 });
  const DARK = panelled(P.hullDark, { size: 0.18, rivets: 0 });

  // Ring base (static on body, seated on cab roof)
  b.part(new THREE.CylinderGeometry(0.62, 0.68, 0.1, 8), DARK, { bone: J.body, at: [0, 2.8, ring[2]], flat: true });
  b.part(new THREE.CylinderGeometry(0.56, 0.56, 0.04, 8), P.trim, { bone: J.body, at: [0, 2.86, ring[2]], flat: true });
  // hazard-ish ticks around ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.06), P.gunmetal, {
      bone: J.body,
      at: [Math.sin(a) * 0.63, 2.82, ring[2] + Math.cos(a) * 0.63],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }

  // Housing on yaw
  const hz = 2.8;
  b.part(new THREE.CylinderGeometry(0.46, 0.52, 0.2, 8), HULL, { bone: yaw, at: [0, 2.95, 2.7], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.26, 0.8), HULL, { bone: yaw, at: [0, 3.0, hz - 0.05] });
  // sloped front armour wedge
  b.part(new THREE.BoxGeometry(0.7, 0.2, 0.3), P.plate, { bone: yaw, at: [0, 3.02, 3.25], rotation: [-25, 0, 0] });
  // side armour plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.22, 0.7), P.plate, { bone: yaw, at: [s * 0.44, 3.0, hz - 0.05], rotation: [0, 0, s * 8] });
    b.part(new THREE.BoxGeometry(0.1, 0.04, 0.5), P.trim, { bone: yaw, at: [s * 0.45, 3.1, hz - 0.05] });
    // ammo box + belt feed
    b.part(new THREE.BoxGeometry(0.22, 0.24, 0.34), P.gunmetal, { bone: yaw, at: [s * 0.58, 2.98, hz - 0.15] });
    b.part(new THREE.BoxGeometry(0.24, 0.05, 0.36), P.trim, { bone: yaw, at: [s * 0.58, 3.12, hz - 0.15] });
    const belt = b.sweep(
      [[s * 0.5, 3.02, hz + 0.05], [s * 0.38, 3.08, hz + 0.18], [s * 0.2, 3.04, hz + 0.3]],
      0.018, { color: P.trim, bone: yaw },
    );
  }

  // sensor eye (magenta)
  const eye = b.part(new THREE.SphereGeometry(0.09, 8, 6), P.neonMagenta, { bone: yaw, at: [0, 3.08, 3.32] });
  glowKit(eye, 1.6);
  b.part(new THREE.TorusGeometry(0.1, 0.02, 5, 8), P.hullDark, { bone: yaw, at: [0, 3.08, 3.3] });

  // antenna dish + whip
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), P.gunmetal, { bone: yaw, at: [-0.3, 3.2, 2.45] });
  b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.rim, {
    bone: yaw, at: [-0.3, 3.34, 2.45], rotation: [60, 0, 0], flat: true,
  });
  b.part(new THREE.SphereGeometry(0.025, 5, 4), P.neonCyan, { bone: yaw, at: [-0.3, 3.4, 2.5] });
  glowKit(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonCyan, { bone: yaw, at: [0.3, 3.16, 2.5] }), 1.5);
  // laser light
  glowKit(b.part(new THREE.BoxGeometry(0.05, 0.05, 0.09), P.neonCyan, { bone: yaw, at: [0.3, 3.05, 3.3] }), 1.5);

  // Guns on pitch
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.2), P.hullDark, { bone: pitch, at: [0, 3.0, 3.3] });
  for (const s of [1, -1]) {
    b.rod([s * 0.14, 3.0, 3.35], [s * 0.14, 3.0, 3.85], 0.045, P.gunmetal, { bone: pitch, sides: 6 });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.hullDark, { bone: pitch, at: [s * 0.14, 3.0, 3.66] });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.1), P.trim, { bone: pitch, at: [s * 0.14, 3.06, 3.66] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.neonMagenta, {
      bone: pitch, at: [s * 0.14, 3.0, 3.7], dir: [0, 0, 1],
    });
  }
  const tex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#e7b814"/><path d="M4 28 L16 4 L28 28Z" fill="none" stroke="#20242e" stroke-width="3"/><rect x="14.5" y="12" width="3" height="9" fill="#20242e"/></svg>`,
    { size: 64 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: yaw, at: [0.401, 3.0, 2.7], dir: [1, 0, 0], axis: "z", texture: tex,
  });
}
    return buildTurret;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(5);
  const X0 = 1.15, Y0 = 1.4, Y1 = 2.92, Z0 = -3.85, Z1 = 1.15;
  const cx = 0, cy = (Y0 + Y1) / 2, cz = (Z0 + Z1) / 2;
  const W = X0 * 2, H = Y1 - Y0, L = Z1 - Z0;

  const SHELL = panelled(P.podShell, { size: 0.5, aspect: 0.6, rivets: 0.07 });
  const OWN = { red: "#c8321e", dark: "#14161c", cable: "#3a3f4c" };

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...extra });

  // main shell: faceted core + chamfered top
  box(W, H * 0.8, L, SHELL, [cx, Y0 + H * 0.4, cz]);
  box(W * 0.84, H * 0.3, L, SHELL, [cx, Y1 - H * 0.16, cz]);
  box(W * 0.94, H * 0.9, L * 0.98, SHELL, [cx, cy - 0.02, cz]);
  // end caps (octagonal feel)
  for (const [z, s] of [[Z1, 1], [Z0, -1]] as [number, number][]) {
    b.part(new THREE.CylinderGeometry(0.62, 0.78, 0.12, 8), P.plate, {
      bone, at: [0, cy, z + s * 0.02], dir: [0, 0, s], flat: true,
    });
  }

  // hazard bands
  const HAZ = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${
    [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#14161c"/>`).join("")}</svg>`, { size: 128 });
  for (const z of [0.7, -0.5, -1.7, -2.9]) {
    for (const s of [1, -1]) {
      b.part(new THREE.PlaneGeometry(0.34, H * 0.9), "#ffffff", {
        bone, at: [s * (X0 + 0.003), cy, z], dir: [s, 0, 0], axis: "z", texture: HAZ,
      });
    }
    box(W + 0.02, 0.05, 0.34, P.trim, [0, Y1 + 0.005, z]);
  }

  // straps with buckles and chains
  for (const z of [0.1, -1.1, -2.3, -3.3]) {
    box(W + 0.08, 0.1, 0.16, P.hullDark, [0, Y1 + 0.02, z]);
    for (const s of [1, -1]) {
      box(0.08, H + 0.1, 0.16, P.hullDark, [s * (X0 + 0.04), cy, z]);
      box(0.14, 0.14, 0.2, P.rim, [s * (X0 + 0.08), cy + 0.25, z]);
      for (let i = 0; i < 4; i++) {
        b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 6), P.rim, {
          bone, at: [s * (X0 + 0.1 + i * 0.01), Y0 - 0.02 - i * 0.045, z],
          rotation: [0, i % 2 ? 90 : 0, 0], flat: true,
        });
      }
    }
  }

  // magenta neon seams
  for (const s of [1, -1]) {
    glow(box(0.03, 0.04, L * 0.96, P.neonMagenta, [s * (X0 + 0.012), Y0 + 0.12, cz]), 1.6);
    glow(box(0.03, 0.04, L * 0.96, P.neonMagenta, [s * (X0 - 0.12), Y1 - 0.05, cz]), 1.6);
  }

  // glowing core window with label
  const CORE = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#14161c"/><rect x="4" y="4" width="56" height="24" rx="3" fill="#ff8a2f"/><rect x="4" y="4" width="56" height="9" rx="3" fill="#ffc46a"/><path d="M20 4V28M32 4V28M44 4V28" stroke="#7a3a10" stroke-width="2"/></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(1.5, 0.62), "#ffffff", {
      bone, at: [s * (X0 + 0.012), cy + 0.12, -1.0 + 0.0], dir: [s, 0, 0], axis: "z", texture: CORE,
    }), 1.4);
  }

  // decals: biohazard + serial
  const BIO = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7b814" stroke="#14161c" stroke-width="4"/><g fill="none" stroke="#14161c" stroke-width="5"><circle cx="32" cy="32" r="5"/><circle cx="32" cy="17" r="9"/><circle cx="19" cy="40" r="9"/><circle cx="45" cy="40" r="9"/></g></svg>`, { size: 128 });
  const SERIAL = svg(`<svg viewBox="0 0 96 24"><rect width="96" height="24" fill="#f2f2f2"/><text x="48" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#14161c">CP-4471 危険</text></svg>`, { size: 192 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone, at: [s * (X0 + 0.014), cy - 0.35, 0.6], dir: [s, 0, 0], axis: "z", texture: BIO });
    b.part(new THREE.PlaneGeometry(0.7, 0.18), "#ffffff", { bone, at: [s * (X0 + 0.014), cy - 0.35, -2.4], dir: [s, 0, 0], axis: "z", texture: SERIAL });
  }

  // corner locking clamps
  for (const sx of [1, -1]) for (const z of [Z1 - 0.1, Z0 + 0.1]) for (const y of [Y0 + 0.08, Y1 - 0.08]) {
    box(0.22, 0.2, 0.22, P.gunmetal, [sx * (X0 - 0.02), y, z]);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.rim, { bone, at: [sx * (X0 + 0.1), y, z], flat: true });
  }

  // top hatches with seals
  for (const z of [0.4, -2.0]) {
    box(0.9, 0.06, 0.9, P.hullDark, [0, Y1 + 0.03, z]);
    box(0.7, 0.05, 0.7, P.plate, [0, Y1 + 0.08, z]);
    b.part(new THREE.TorusGeometry(0.12, 0.025, 4, 8), P.trim, { bone, at: [0, Y1 + 0.13, z], rotation: [90, 0, 0], flat: true });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [0.3, Y1 + 0.12, z + 0.3] }), 2);
  }

  // rear door with wheel lock
  box(1.7, 1.2, 0.08, P.plate, [0, cy - 0.05, Z0 - 0.03]);
  box(1.8, 0.06, 0.1, P.hullDark, [0, cy - 0.05, Z0 - 0.04]);
  box(0.06, 1.2, 0.1, P.hullDark, [0, cy - 0.05, Z0 - 0.04]);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), P.trim, { bone, at: [0, cy - 0.05, Z0 - 0.11], dir: [0, 0, -1], flat: true });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    b.rod([Math.sin(a) * 0.04, cy - 0.05 + Math.cos(a) * 0.04, Z0 - 0.13], [Math.sin(a) * 0.22, cy - 0.05 + Math.cos(a) * 0.22, Z0 - 0.13], 0.02, P.rim, { bone });
  }
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), P.rim, { bone, at: [0, cy - 0.05, Z0 - 0.15], dir: [0, 0, -1], flat: true });

  // front face: sensor lights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? P.neonCyan : P.neonMagenta, { bone, at: [s * 0.6, Y1 - 0.15, Z1 + 0.04] }), 2);
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.neonMagenta, { bone, at: [s * 0.95, Y0 + 0.15, Z0 - 0.08] }), 2);
  }
  box(1.4, 0.3, 0.05, OWN.dark, [0, cy, Z1 + 0.02]);
  glow(box(1.2, 0.05, 0.03, P.neonCyan, [0, cy, Z1 + 0.05]), 1.5);

  // cable conduits on top
  for (const s of [1, -1]) {
    b.sweep([[s * 0.8, Y1 + 0.05, Z1 - 0.1], [s * 0.8, Y1 + 0.1, -0.8], [s * 0.6, Y1 + 0.1, -2.4], [s * 0.6, Y1 + 0.05, Z0 + 0.15]], 0.035, { bone, color: OWN.cable, sides: 6 });
  }
  // antenna / beacon
  b.rod([-0.8, Y1, -3.3], [-0.8, Y1 + 0.35, -3.3], 0.015, P.rim, { bone });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), OWN.red, { bone, at: [-0.8, Y1 + 0.37, -3.3] }), 2);
  void R; void M;
}
    return buildCargoPod;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.75,2.7], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,3,2.8], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.6,2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.6,2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.6,-0.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.6,-0.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.6,-2.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.6,-2.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
