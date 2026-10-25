import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  "name": "Convoy Hauler Aegis-7",
  "description": "A low-poly cyberpunk six-wheeled armoured hauler with a bristling cab and a neon-lit sealed cargo pod strapped to its flatbed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2f3542",
  hullLight: "#4a5262",
  hullDark: "#161a22",
  trim: "#f2c10f",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  amber: "#ffb23a",
  glass: "#0b2a3a",
  rubber: "#15161a",
  rim: "#7b8494",
  podShell: "#d9dde6",
  podDark: "#3a3f4d",
  warnRed: "#e0323c",
  steel: "#8d95a5",
};
const M = {
  deckTop: [0, 1.2, -1.5] as [number, number, number],
  cabRoof: [0, 2.3, 2.2] as [number, number, number],
  turretRing: [0, 2.35, 1.9] as [number, number, number],
  frontAxle: [0, 0.55, 2.7] as [number, number, number],
  rearAxle1: [0, 0.55, -1.8] as [number, number, number],
  rearAxle2: [0, 0.55, -3.3] as [number, number, number],
  cabRear: [0, 1.2, 1.3] as [number, number, number],
  noseFace: [0, 1, 3] as [number, number, number],
  podFloor: [0, 1.3, -1.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const HULL = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.4, rivets: 0.08 });
  const GRIME = paint((p: any, n: any) => {
    const low = smoothstep(0.9, 0.35, p.y);
    const c = mix(P.hull, P.hullLight, noise(p, 0.3, 4) * 0.6 + 0.2 * Math.max(n.y, 0));
    return mix(c, "#2a2218", low * 0.6 * noise(p, 0.15, 9));
  });
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 10 }, (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 16Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );

  // side rails and cross members
  for (const s of [1, -1]) {
    box(0.22, 0.34, 5.6, HULL, [s * 0.95, 0.52, -1.4]);
    box(0.05, 0.12, 5.6, P.neonCyan, [s * 1.42, 0.5, -1.4], {}).mesh && 0;
  }
  const cross = [-4.0, -3.3, -2.5, -1.8, -1.0, -0.2, 0.6, 1.2];
  for (const z of cross) box(1.9, 0.2, 0.18, P.hullDark, [0, 0.5, z]);

  // deck plate
  box(2.9, 0.12, 5.5, GRIME, [0, 1.14, -1.5]);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.2, 5.4), "#ffffff", { bone, at: [s * 1.35, 1.205, -1.5], dir: [0, 1, 0], axis: "z", texture: HAZ, rotation: [-90, 0, 0] });
  }
  // deck edge trims
  for (const s of [1, -1]) box(0.08, 0.1, 5.5, P.trim, [s * 1.46, 1.16, -1.5]);
  box(2.9, 0.1, 0.1, P.trim, [0, 1.16, 1.25]);

  // side skirts with neon
  for (const s of [1, -1]) {
    box(0.1, 0.3, 4.8, P.hullDark, [s * 1.45, 0.75, -1.6]);
    glow(box(0.04, 0.04, 4.7, P.neonCyan, [s * 1.51, 0.62, -1.6]), 1.5);
  }

  // fuel tanks and tool lockers
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.3, 8), HULL, { bone, at: [s * 1.2, 0.72, 0.5], rotation: [90, 0, 0] });
    for (const z of [-0.1, 1.1]) box(0.08, 0.1, 0.1, P.trim, [s * 1.2, 0.99, z + (z < 0.5 ? 0 : 0)]);
    box(0.32, 0.4, 1.0, HULL, [s * 1.3, 0.8, -0.9]);
    box(0.02, 0.2, 0.7, P.trim, [s * 1.47, 0.8, -0.9]);
    box(0.04, 0.08, 0.14, P.steel, [s * 1.48, 0.8, -0.65]);
  }

  // drive shaft & axle housings
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 5.2, 6), P.steel, { bone, at: [0, 0.45, -1.2], rotation: [90, 0, 0] });
  for (const z of [M.rearAxle1[2], M.rearAxle2[2]]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 2.1, 8), P.hullDark, { bone, at: [0, 0.55, z], rotation: [0, 0, 90] });
    box(0.45, 0.3, 0.4, P.hullLight, [0, 0.55, z]);
  }

  // fenders and mud flaps
  const wz = [M.rearAxle1[2], M.rearAxle2[2]];
  for (const z of wz)
    for (const s of [1, -1]) {
      const arch = b.part(new THREE.BoxGeometry(0.5, 0.1, 1.1), HULL, { bone, at: [s * 1.28, 1.15, z] });
      box(0.5, 0.08, 0.1, P.trim, [s * 1.28, 1.2, z + 0.5]);
      box(0.5, 0.08, 0.1, P.trim, [s * 1.28, 1.2, z - 0.5]);
      box(0.5, 0.35, 0.1, P.hullDark, [s * 1.28, 0.97, z + 0.55], { rotation: [-15, 0, 0] });
      box(0.5, 0.35, 0.1, P.hullDark, [s * 1.28, 0.97, z - 0.55], { rotation: [15, 0, 0] });
    }
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.4, P.hullDark, [s * 1.32, 0.45, -4.1]);
    box(0.045, 0.1, 0.3, P.trim, [s * 1.32, 0.45, -4.1]);
  }

  // rear bumper
  box(2.9, 0.3, 0.3, HULL, [0, 0.55, -4.1]);
  box(2.9, 0.08, 0.32, P.trim, [0, 0.72, -4.1]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.14, 0.06, P.warnRed, [s * 1.0, 0.55, -4.27]), 1.6);
    box(0.5, 0.22, 0.04, P.hullDark, [s * 1.0, 0.55, -4.24]);
  }
  glow(box(1.5, 0.05, 0.05, P.neonMagenta, [0, 0.38, -4.27]), 1.6);
  glow(box(2.2, 0.03, 4.8, P.neonMagenta, [0, 0.33, -1.7]), 1.2);

  // cab-side transition plate
  box(2.9, 0.3, 0.2, P.hullLight, [0, 0.8, 1.3]);
  box(2.9, 0.06, 0.06, P.trim, [0, 0.97, 1.4]);
}
    return buildChassis;
  })(),
  // wheelsFront
  (() => {
function buildWheelsFront({ b, J, P, M }: Ctx) {
  const R = 0.55; // tyre radius
  const W = 0.4; // tyre width
  const r = rng(11);

  // Tyre paint: grime climbs from the ground, mud near the floor
  const tyre = paint((p, n) => {
    const base: [number, number, number] = [0.08, 0.085, 0.1];
    const mud = smoothstep(0.45, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.12, 3));
    const wear = noise(p, 0.05, 7) * 0.05;
    const c = mix([base[0] + wear, base[1] + wear, base[2] + wear], "#4a3a28", mud * 0.85);
    return c;
  });
  const rimPaint = paint((p, n) => {
    const m = noise(p, 0.08, 5);
    return mix("#7b8494", "#aab2c0", smoothstep(0.3, 0.8, m) * 0.6 + (n.y > 0.5 ? 0.15 : 0));
  });
  const discPaint = paint((p) => mix("#8d95a5", "#5a606e", noise(p, 0.04, 9)));

  const boltTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0b2a3a"/><circle cx="32" cy="32" r="24" fill="none" stroke="#2ff3ff" stroke-width="5"/><path d="M32 14 L38 32 L32 50 L26 32Z" fill="#2ff3ff"/><circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#f2c10f"/><path d="M-8 32 L8 0 L16 0 L0 32Z M8 32 L24 0 L32 0 L32 8 L16 32Z" fill="#161a22"/></svg>`,
    { size: 64 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.frontAxle[2]],
    ["wheelFR", -1, M.frontAxle[2]],
    ["wheelML", 1, M.rearAxle1[2]],
    ["wheelMR", -1, M.rearAxle1[2]],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.25;
    const cy = R;
    const outer = s; // outward direction
    const axis: [number, number, number] = [s, 0, 0];

    // Tyre: octagonal-ish faceted cylinder
    b.part(new THREE.CylinderGeometry(R, R, W, 12), tyre, {
      bone: j, at: [cx, cy, z], dir: axis, flat: true,
    });
    // Sidewall bevel rings (slightly narrower, bigger shoulders)
    for (const k of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.9, R * 0.97, 0.05, 12), "#15161a", {
        bone: j, at: [cx + outer * k * (W / 2 + 0.01), cy, z], dir: axis, flat: true,
      });
    }
    // Tread blocks
    const blocks = 12;
    for (let i = 0; i < blocks; i++) {
      const a = (i / blocks) * Math.PI * 2;
      const bx = cx;
      const by = cy + Math.sin(a) * (R + 0.015);
      const bz = z + Math.cos(a) * (R + 0.015);
      b.part(new THREE.BoxGeometry(W * 0.92, 0.05, 0.14), P.rubber, {
        bone: j, at: [bx, by, bz],
        quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2 - a),
      });
    }
    // Rim: steel disc on outer face
    const faceX = cx + outer * (W / 2 + 0.03);
    b.part(new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.06, 10), rimPaint, {
      bone: j, at: [faceX, cy, z], dir: axis, flat: true,
    });
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.62, 0.05, 10), P.hullDark, {
      bone: j, at: [faceX + outer * 0.04, cy, z], dir: axis, flat: true,
    });
    // Bolts ring
    const bolts = 6;
    for (let i = 0; i < bolts; i++) {
      const a = (i / bolts) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.steel, {
        bone: j,
        at: [faceX + outer * 0.09, cy + Math.sin(a) * R * 0.38, z + Math.cos(a) * R * 0.38],
        dir: axis, flat: true,
      });
    }
    // Glowing cyan hub cap (textured)
    glow(
      b.part(new THREE.CircleGeometry(R * 0.26, 10), "#ffffff", {
        bone: j, at: [faceX + outer * 0.125, cy, z], dir: axis, axis: "z", texture: boltTex,
      }),
      1.4,
    );
    b.part(new THREE.CylinderGeometry(R * 0.28, R * 0.3, 0.05, 8), P.hullDark, {
      bone: j, at: [faceX + outer * 0.1, cy, z], dir: axis, flat: true,
    });
    // Glow ring around hub
    glow(
      b.part(new THREE.TorusGeometry(R * 0.55, 0.014, 4, 16), P.neonCyan, {
        bone: j, at: [faceX + outer * 0.035, cy, z], dir: axis, axis: "z",
      }),
      1.2,
    );

    // Brake disc inside the wheel
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.03, 12), discPaint, {
      bone: j, at: [cx - outer * (W / 2 - 0.02), cy, z], dir: axis,
    });
    // Brake caliper
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.16), P.warnRed, {
      bone: j, at: [cx - outer * (W / 2 - 0.05), cy + R * 0.42, z + 0.05],
    });
    // Axle stub
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), P.hullDark, {
      bone: j, at: [s * 1.0, cy, z], dir: axis, flat: true,
    });
    // Suspension arms (upper and lower wishbones) to chassis
    const arm = (y0: number, y1: number, zz: number) =>
      b.rod([s * 0.75, y0, zz], [s * 1.02, y1, z], 0.04, P.hullLight, { bone: j });
    arm(cy + 0.32, cy + 0.12, z + 0.2);
    arm(cy + 0.32, cy + 0.12, z - 0.2);
    arm(cy - 0.05, cy - 0.12, z + 0.15);
    arm(cy - 0.05, cy - 0.12, z - 0.15);
    // Shock absorber with spring
    b.rod([s * 0.9, cy + 0.65, z + 0.05], [s * 1.0, cy + 0.15, z + 0.05], 0.035, P.amber, { bone: j });
    b.rod([s * 0.9, cy + 0.65, z + 0.05], [s * 0.96, cy + 0.4, z + 0.05], 0.06, P.hullDark, { bone: j });
    // Hazard-stripe tyre-guard stripe on outer sidewall
    b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
      bone: j, at: [cx + outer * (W / 2 + 0.036), cy + R * 0.8, z], dir: axis, axis: "z", texture: hazard,
    });
    void r;
  }
}
    return buildWheelsFront;
  })(),
  // wheelsRear
  (() => {
function buildWheelsRear({ b, J, P, M }: Ctx) {
  const R = rng(77);
  const WR = 0.55; // wheel radius
  const WW = 0.42; // tyre width
  const axleZ = M.rearAxle2[2];
  const TYRE = paint((p, n) => {
    const base: [number, number, number] = [0.08, 0.085, 0.1];
    const grime = smoothstep(0.55, 0.0, p.y) * 0.8 * (0.4 + noise(p, 0.18, 3));
    const dust = noise(p, 0.07, 9) * 0.1;
    const c = mix(base, [0.3, 0.24, 0.17], Math.min(grime * 0.55 + dust, 0.7));
    return c;
  });
  const GRIME_STEEL = paint((p, n) => mix(P.steel, "#3a3328", smoothstep(0.7, 0.1, p.y) * 0.5 + noise(p, 0.1, 4) * 0.2));
  const GUARD = paint((p, n) => mix(P.hull, "#2a2418", smoothstep(0.9, 0.3, p.y) * 0.6 * (0.5 + noise(p, 0.12, 5))));

  const hazard = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#f2c10f"/><path d="M0 16L8 0H16L8 16ZM16 16L24 0H32L24 16Z" fill="#161a22"/></svg>`,
    { size: 128 },
  );
  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ff2fa8"/><circle cx="32" cy="32" r="22" fill="none" stroke="#ffd0f0" stroke-width="4"/><path d="M32 12V52M12 32H52M18 18L46 46M46 18L18 46" stroke="#7a0f55" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="#fff"/></svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.wheelBL : J.wheelBR;
    const cx = s * 1.25;
    const outX = s * (1.25 + WW / 2);
    const ax: [number, number, number] = [s, 0, 0];

    // tyres: two chunky faceted halves for a bevelled profile
    b.part(new THREE.CylinderGeometry(WR, WR, WW * 0.7, 14), TYRE, { bone, at: [cx, WR, 0 + axleZ], dir: ax, name: `tyre${s}` });
    for (const k of [1, -1]) {
      b.part(new THREE.CylinderGeometry(WR * 0.9, WR, WW * 0.16, 14), TYRE, {
        bone, at: [cx + s * k * WW * 0.43, WR, axleZ], dir: ax,
      });
    }
    // tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const y = WR + Math.cos(a) * (WR + 0.02);
      const z = axleZ + Math.sin(a) * (WR + 0.02);
      b.part(new THREE.BoxGeometry(WW * 0.9, 0.07, 0.15), "#15161a", {
        bone, at: [cx, y, z], dir: [0, Math.cos(a), Math.sin(a)], axis: "y",
      });
    }
    // rim
    b.part(new THREE.CylinderGeometry(WR * 0.62, WR * 0.62, WW * 0.8, 10), GRIME_STEEL, { bone, at: [cx, WR, axleZ], dir: ax });
    b.part(new THREE.CylinderGeometry(WR * 0.5, WR * 0.58, 0.06, 10), P.hullLight, {
      bone, at: [outX + s * 0.01, WR, axleZ], dir: ax,
    });
    // bolt ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 6), P.hullDark, {
        bone, at: [outX + s * 0.04, WR + Math.cos(a) * 0.3, axleZ + Math.sin(a) * 0.3], dir: ax,
      });
    }
    // glowing hub cap
    glow(
      b.part(new THREE.CircleGeometry(0.2, 12), "#ffffff", {
        bone, at: [outX + s * 0.075, WR, axleZ], dir: ax, axis: "z", texture: hubTex,
      }),
      1.4,
    );
    b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.06, 12), P.hullDark, { bone, at: [outX + s * 0.05, WR, axleZ], dir: ax });
    // axle stub inside
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), P.steel, { bone, at: [s * 0.95, WR, axleZ], dir: ax });

    // mud guard: arch of angled plates over the wheel
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      const rr = 0.6;
      b.part(new THREE.BoxGeometry(0.5, 0.05, 0.22), GUARD, {
        bone: J.body,
        at: [cx, 0.45 + Math.cos(a) * rr, axleZ + Math.sin(a) * rr],
        dir: [0, Math.cos(a), Math.sin(a)],
      });
    }
    // guard hazard lip
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.1), "#ffffff", {
      bone: J.body, at: [cx, 0.95, axleZ + 0.62], texture: hazard,
    });
    // mud flap
    b.part(new THREE.BoxGeometry(0.46, 0.4, 0.04), P.rubber, { bone: J.body, at: [cx, 0.38, axleZ - 0.5] });
    b.part(new THREE.BoxGeometry(0.34, 0.07, 0.045), P.trim, { bone: J.body, at: [cx, 0.28, axleZ - 0.5] });

    // leaf spring pack
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.9 - i * 0.14), i % 2 ? P.hullDark : P.hullLight, {
        bone: J.body, at: [s * 1.02, 0.78 + i * 0.035, axleZ],
      });
    }
    b.part(new THREE.BoxGeometry(0.16, 0.08, 0.16), P.hullDark, { bone: J.body, at: [s * 1.02, 0.7, axleZ] });
    // spring ends hangers to chassis
    for (const z of [-0.45, 0.45]) {
      b.part(new THREE.BoxGeometry(0.08, 0.3, 0.1), P.hull, { bone: J.body, at: [s * 1.02, 0.95, axleZ + z] });
    }
    // shock absorber
    const sx = s * 0.82;
    b.rod([sx, 0.5, axleZ + 0.3], [sx, 0.95, axleZ + 0.18], 0.035, P.steel, { bone: J.body });
    b.rod([sx, 0.8, axleZ + 0.2], [sx, 1.05, axleZ + 0.15], 0.05, P.trim, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.hullDark, { bone: J.body, at: [sx, 0.5, axleZ + 0.3] });

    // brake disc inboard
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 12), P.rim, { bone, at: [s * 1.05, WR, axleZ], dir: ax });
    b.part(new THREE.BoxGeometry(0.06, 0.16, 0.12), P.warnRed, { bone: J.body, at: [s * 1.02, WR + 0.3, axleZ] });
  }

  // walking beam crossing under frame (tandem)
  b.part(new THREE.BoxGeometry(2.1, 0.14, 0.2), P.hullDark, { bone: J.body, at: [0, 0.62, axleZ + 0.1] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 8), P.steel, { bone: J.body, at: [0, WR, axleZ], dir: [1, 0, 0] });
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.3), P.hull, { bone: J.body, at: [0, 0.7, axleZ] });
}
    return buildWheelsRear;
  })(),
  // cabShell
  (() => {
function buildCabShell({ b, J, P }: Ctx) {
  const bone = J.body;

  // ---------- textures ----------
  let stripes = "";
  for (let i = -2; i < 16; i++)
    stripes += `<polygon points="${i * 8},8 ${i * 8 + 4},8 ${i * 8 + 8},0 ${i * 8 + 4},0" fill="#16141a"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 96 8" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="8" fill="${P.trim}"/>${stripes}</svg>`,
    { size: 512 },
  );

  const GLASS = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="3" fill="${P.glass}"/><rect x="0" y="37" width="100" height="3" fill="${P.glass}"/>
      <rect x="0" y="0" width="3" height="40" fill="${P.glass}"/><rect x="97" y="0" width="3" height="40" fill="${P.glass}"/>
      <polygon points="14,40 24,40 40,0 30,0" fill="${P.neonCyan}" opacity="0.9"/>
      <polygon points="30,40 34,40 50,0 46,0" fill="${P.neonCyan}" opacity="0.9"/>
      <polygon points="64,40 76,40 92,0 80,0" fill="${P.neonCyan}" opacity="0.9"/>
    </svg>`,
    { size: 400 },
  );

  const REAR_SCREEN = svg(
    `<svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg">
      <rect width="130" height="60" fill="#04222c"/>
      <rect x="2" y="2" width="126" height="56" fill="none" stroke="${P.neonCyan}" stroke-width="2"/>
      <path d="M6 44 L24 30 L40 38 L58 16 L78 30 L96 12 L124 24" fill="none" stroke="${P.neonCyan}" stroke-width="2.5"/>
      <rect x="8" y="8" width="40" height="5" fill="${P.neonMagenta}"/>
      <rect x="8" y="50" width="28" height="3" fill="${P.amber}"/><rect x="42" y="50" width="52" height="3" fill="${P.neonCyan}"/>
      <text x="100" y="54" font-family="monospace" font-size="7" fill="${P.neonMagenta}">AEG-7</text>
    </svg>`,
    { size: 512 },
  );

  const DASH = svg(
    `<svg viewBox="0 0 50 22" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="22" fill="#05303a"/>
      <circle cx="14" cy="11" r="8" fill="none" stroke="${P.neonCyan}" stroke-width="1.5"/>
      <path d="M14 11 L19 6" stroke="${P.amber}" stroke-width="1.5"/>
      <rect x="28" y="4" width="18" height="3" fill="${P.neonMagenta}"/><rect x="28" y="10" width="12" height="3" fill="${P.neonCyan}"/>
      <rect x="28" y="16" width="16" height="3" fill="${P.amber}"/>
    </svg>`,
    { size: 256 },
  );

  const SIDE_DECAL = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" fill="${P.hullDark}"/>
      <rect x="2" y="2" width="76" height="36" fill="none" stroke="${P.trim}" stroke-width="2"/>
      <polygon points="10,30 18,10 26,30 22,30 18,20 14,30" fill="${P.neonCyan}"/>
      <text x="32" y="22" font-family="monospace" font-weight="bold" font-size="12" fill="${P.trim}">AEGIS</text>
      <text x="32" y="33" font-family="monospace" font-size="9" fill="${P.neonMagenta}">CONVOY-07</text>
    </svg>`,
    { size: 320 },
  );

  const GRILLE = svg(
    `<svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="20" fill="${P.hullDark}"/>
    ${[3, 7, 11, 15].map((y) => `<rect x="2" y="${y}" width="36" height="2" fill="${P.steel}"/>`).join("")}</svg>`,
    { size: 200 },
  );

  // ---------- paints ----------
  const grimy = paint((p, n) => {
    let c = mix(P.hull, P.hullLight, 0.6 * smoothstep(0.2, 1, n.y));
    c = mix(c, "#1b1712", 0.65 * smoothstep(1.75, 1.2, p.y) * (0.5 + noise(p, 0.18, 4)));
    return c;
  });
  const HULL = panelled(grimy, { size: 0.46, aspect: 0.6, rivets: 0.09, seam: P.hullDark });
  const PLATE = panelled(P.hullLight, { size: 0.3, aspect: 0.8, rivets: 0.07, seam: P.hullDark });

  // ---------- helpers ----------
  const box = (sz: number[], at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, { bone, at, flat: true, ...o });
  const plane = (w: number, h: number, at: number[], dir: number[], texture: any, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { bone, at, dir, axis: "z", texture });
  const cyl = (r: number, h: number, at: number[], color: any, seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, flat: true, ...o });

  // ---------- main shell ----------
  box([2.8, 0.7, 2.4], [0, 1.55, 1.8], HULL); // lower body z 0.6..3.0, y 1.2..1.9
  // sleeper hump with angled front shoulder (side profile z,y)
  b.extrude(
    [
      [0.6, 1.9],
      [1.45, 1.9],
      [1.45, 2.3],
      [1.25, 2.4, "sharp"],
      [0.6, 2.4],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.7, bevel: 0.02, color: HULL, bone },
  );
  box([2.7, 0.08, 1.15], [0, 2.26, 2.02], PLATE); // roof slab z 1.45..2.6
  box([2.74, 0.04, 0.12], [0, 2.425, 0.78], HAZARD && "#ffffff", { texture: HAZARD });
  // lower armour skirt plate at front corners
  for (const s of [1, -1]) {
    box([0.06, 0.55, 0.5], [s * 1.43, 1.55, 2.78], P.hullLight);
    // neon edge line along body top edge
    glow(b.rod([s * 1.42, 1.885, 0.7], [s * 1.42, 1.885, 2.95], 0.018, P.neonCyan, { bone, sides: 4 }), 1.4);
    // hazard sill
    plane(2.3, 0.1, [s * 1.405, 1.27, 1.8], [s, 0, 0], HAZARD);
    // door
    box([0.04, 0.62, 1.2], [s * 1.415, 1.58, 2.1], P.hullLight, { name: "door" });
    for (const dz of [1.5, 2.7])
      box([0.05, 0.64, 0.025], [s * 1.42, 1.58, dz], P.hullDark);
    box([0.05, 0.025, 1.2], [s * 1.42, 1.9, 2.1], P.hullDark);
    box([0.06, 0.05, 0.22], [s * 1.45, 1.7, 1.68], P.steel); // handle
    box([0.06, 0.12, 0.04], [s * 1.45, 1.7, 1.58], P.steel);
    box([0.06, 0.12, 0.04], [s * 1.45, 1.7, 1.78], P.steel);
    // door emblem
    plane(0.5, 0.25, [s * 1.44, 1.45, 2.4], [s, 0, 0], SIDE_DECAL);
    // sleeper side armour plate + decal
    box([0.05, 0.42, 0.7], [s * 1.395, 2.14, 0.98], PLATE);
    box([0.07, 0.42, 0.04], [s * 1.395, 2.14, 1.34], P.trim);
    plane(0.56, 0.28, [s * 1.425, 2.14, 0.96], [s, 0, 0], SIDE_DECAL);
    // amber marker light
    glow(box([0.05, 0.08, 0.14], [s * 1.41, 1.78, 2.93], P.amber), 1.6);
    glow(box([0.05, 0.06, 0.12], [s * 1.41, 2.0, 0.66], P.warnRed), 1.4);

    // ---------- greenhouse ----------
    plane(1.05, 0.31, [s * 1.3, 2.06, 1.98], [s, 0, 0], GLASS);
    plane(1.05, 0.31, [s * 1.3, 2.06, 1.98], [-s, 0, 0], GLASS);
    b.rod([s * 1.33, 2.22, 2.55], [s * 1.33, 1.9, 3.0], 0.045, P.hullDark, { bone, sides: 4 });
    b.rod([s * 1.33, 1.9, 1.45], [s * 1.33, 2.26, 1.45], 0.04, P.hullDark, { bone, sides: 4 });
    box([0.05, 0.05, 1.1], [s * 1.33, 1.9, 2.0], P.hullDark);
    // pillar rear of windscreen
    // roof rails
    b.rod([s * 1.1, 2.42, 1.55], [s * 1.1, 2.42, 2.45], 0.025, P.steel, { bone, sides: 6 });
    for (const z of [1.55, 2.45]) b.rod([s * 1.1, 2.3, z], [s * 1.1, 2.42, z], 0.02, P.steel, { bone, sides: 4 });
    // antennas
    b.rod([s * 1.2, 2.4, 0.75], [s * 1.22, 2.49, 0.74], 0.014, P.steel, { bone, sides: 4 });
    box([0.09, 0.06, 0.09], [s * 1.2, 2.42, 0.75], P.hullDark);
    // exhaust stacks
    cyl(0.07, 1.1, [s * 1.3, 1.95, 0.9], P.hullDark, 8);
    cyl(0.09, 0.3, [s * 1.3, 1.5, 0.9], P.steel, 8);
    cyl(0.09, 0.3, [s * 1.3, 2.2, 0.9], P.steel, 8);
    cyl(0.085, 0.04, [s * 1.3, 2.48, 0.9], P.hullDark, 8);
    for (const y of [1.45, 2.3]) box([0.1, 0.08, 0.12], [s * 1.35, y, 0.9], P.steel);
    // interior seats
    box([0.5, 0.14, 0.5], [s * 0.5, 2.0, 1.85], P.podDark);
    box([0.5, 0.5, 0.1], [s * 0.5, 2.2, 1.62], P.podDark);
    box([0.3, 0.14, 0.08], [s * 0.5, 2.46 - 0.04, 1.62], P.hullLight);
    // dash screens
    glow(plane(0.55, 0.24, [s * 0.5, 2.15, 2.57], [0, 0.5, -0.85], DASH), 1.5);
  }

  // antenna tip + light
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, { bone, at: [1.22, 2.47, 0.74] }), 2);
  b.rod([0, 2.4, 0.7], [0, 2.49, 0.68], 0.012, P.steel, { bone, sides: 4 });

  // windscreen glass
  plane(2.5, 0.552, [0, 2.06, 2.78], [0, 0.82, 0.58], GLASS);
  // dashboard and console
  box([2.4, 0.2, 0.3], [0, 2.0, 2.62], P.hullDark);
  box([0.4, 0.3, 0.7], [0, 2.05, 2.0], P.hullDark);
  glow(plane(0.3, 0.14, [0, 2.21, 2.0], [0, 1, 0], DASH), 1.4);
  b.part(new THREE.TorusGeometry(0.12, 0.015, 4, 8), P.hullDark, {
    bone, at: [0.5, 2.12, 2.35], dir: [0, 0.6, 0.8], axis: "z",
  });
  b.rod([0.5, 2.0, 2.52], [0.5, 2.12, 2.36], 0.02, P.hullDark, { bone, sides: 4 });

  // ---------- spotlight bar ----------
  box([2.1, 0.1, 0.14], [0, 2.45, 1.36], P.hullDark);
  for (let i = -2; i <= 2; i++) {
    glow(box([0.26, 0.08, 0.05], [i * 0.4, 2.45, 1.45], P.amber), 1.8);
  }
  for (const s of [1, -1]) box([0.06, 0.1, 0.1], [s * 1.05, 2.45, 1.36], P.trim);

  // ---------- rear wall ----------
  box([1.5, 0.7, 0.04], [0, 1.72, 0.58], P.hullDark);
  glow(plane(1.38, 0.64, [0, 1.72, 0.595], [0, 0, -1], REAR_SCREEN), 1.5);
  for (let i = 0; i < 4; i++) box([1.2, 0.02, 0.03], [0, 1.32 + i * 0.045, 0.585], P.steel);
  for (const s of [1, -1]) {
    box([0.12, 0.45, 0.1], [s * 1.0, 2.15, 0.56], P.trim);
    glow(box([0.06, 0.3, 0.02], [s * 1.0, 2.15, 0.505], P.neonMagenta), 1.6);
  }
  glow(box([1.3, 0.025, 0.03], [0, 2.38, 0.585], P.neonCyan), 1.5);

  // ---------- front face accents (meets nose) ----------
  box([2.5, 0.06, 0.08], [0, 1.22, 2.97], P.hullDark);
  plane(0.9, 0.45, [0, 1.55, 3.005], [0, 0, 1], GRILLE);
  glow(box([2.7, 0.025, 0.03], [0, 1.9, 2.99], P.neonCyan), 1.4);
}
    return buildCabShell;
  })(),
  // cabFront
  (() => {
function buildCabFront({ b, J, P }: any) {
  const bone = J.body;
  const DARK = "#0a0d12";
  const BLACK = "#14141a";

  const box = (size: number[], at: number[], color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });

  const HULL = panelled(P.hull, { size: 0.35, aspect: 0.8, rivets: 0.07 });
  const PLATE = panelled(P.hullLight, { size: 0.28, aspect: 0.7, rivets: 0.06 });
  const STEEL = metal("steel", { tarnish: 0.35 });

  // ---------- textures ----------
  const hazard = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${P.trim}"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#14141a"/>`).join("")}
      <rect width="64" height="16" fill="none" stroke="#14141a" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );
  const hud = svg(
    `<svg viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="40" fill="#07202c"/>
      <rect width="220" height="40" fill="none" stroke="#2ff3ff" stroke-width="2"/>
      <path d="M0 30 L60 8 L160 8 L220 30" stroke="#2ff3ff" stroke-width="1.2" fill="none" opacity="0.6"/>
      <circle cx="110" cy="22" r="9" fill="none" stroke="#2ff3ff" stroke-width="1.5"/>
      <path d="M110 10v6M110 28v6M98 22h6M116 22h6" stroke="#2ff3ff" stroke-width="1.5"/>
      <g fill="#2ff3ff"><rect x="12" y="10" width="40" height="3"/><rect x="12" y="16" width="26" height="3"/><rect x="12" y="22" width="34" height="3"/>
      <rect x="168" y="10" width="38" height="3"/><rect x="176" y="16" width="30" height="3"/></g>
      <text x="168" y="34" font-family="monospace" font-size="8" fill="#ff2fa8">AEGIS-7 // LOCK</text>
      <path d="M0 0 L220 40" stroke="#ffffff" stroke-width="0.8" opacity="0.12"/>
    </svg>`,
    { size: 512 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4 L92 22 V54 Q92 82 50 97 Q8 82 8 54 V22Z" fill="#161a22" stroke="#f2c10f" stroke-width="5"/>
      <path d="M50 18 L78 30 V54 Q78 72 50 84 Q22 72 22 54 V30Z" fill="none" stroke="#2ff3ff" stroke-width="3"/>
      <path d="M50 30 L64 66 H56 L50 50 L44 66 H36Z" fill="#ff2fa8"/>
      <rect x="40" y="56" width="20" height="4" fill="#f2c10f"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- hood wedge ----------
  const hood = b.extrude(
    [
      [3.0, 0.7],
      [3.0, 1.95],
      [3.9, 1.62, "sharp"],
      [4.1, 1.4, "sharp"],
      [4.1, 0.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bone, color: HULL },
  );
  // chassis front frame beneath
  box([2.3, 0.28, 0.95], [0, 0.55, 3.5], P.hullDark);
  // sloped side armour plates
  for (const s of [1, -1]) {
    b.extrude(
      [
        [3.05, 0.75],
        [3.05, 1.85],
        [3.85, 1.55],
        [4.05, 1.38],
        [4.05, 0.75],
      ],
      { at: [s * 1.22, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bone, color: PLATE },
    );
    // neon edge line along the hood
    glow(b.rod([s * 1.15, 1.97, 3.02], [s * 1.15, 1.64, 3.9], 0.02, P.neonCyan, { bone, sides: 4 }), 1.4);
    glow(b.rod([s * 1.15, 1.64, 3.9], [s * 1.15, 1.42, 4.1], 0.02, P.neonCyan, { bone, sides: 4 }), 1.4);
    // hazard trim strip on hood flank
    b.part(new THREE.PlaneGeometry(0.95, 0.14), "#ffffff", {
      bone,
      at: [s * 1.231, 0.88, 3.55],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: hazard,
      rotation: undefined,
    });
  }
  // hood ridge and vents
  box([0.18, 0.08, 0.95], [0, 1.82, 3.5], P.hullLight, { rotation: [-17, 0, 0] });
  for (const s of [1, -1]) {
    box([0.5, 0.05, 0.4], [s * 0.6, 1.8, 3.55], DARK, { rotation: [-17, 0, 0] });
    for (let i = 0; i < 4; i++)
      box([0.46, 0.03, 0.03], [s * 0.6, 1.835 - i * 0.012, 3.4 + i * 0.1], P.steel, { rotation: [-17, 0, 0] });
  }

  // emblem decal on hood
  b.decal(hood, emblem, {
    at: [0, 1.7, 3.55],
    dir: [0, 1, 0.35],
    up: [0, 0, -1],
    size: [0.62, 0.62],
    lift: 0.004,
    bone,
  });

  // ---------- windscreen / visor ----------
  b.part(new THREE.PlaneGeometry(2.2, 0.4), "#ffffff", {
    bone,
    at: [0, 2.14, 3.06],
    dir: [0, 0.45, 1],
    axis: "z",
    texture: hud,
  });
  box([2.34, 0.06, 0.1], [0, 2.36, 3.05], P.hullDark);
  box([2.34, 0.06, 0.1], [0, 1.94, 3.07], P.hullDark);
  for (const s of [1, -1]) box([0.06, 0.46, 0.1], [s * 1.14, 2.15, 3.06], P.hullDark);
  glow(box([2.1, 0.02, 0.03], [0, 2.4, 3.1], P.neonCyan), 1.5);

  // ---------- grille ----------
  const gz = 4.1;
  box([1.7, 0.62, 0.08], [0, 1.05, gz + 0.02], DARK);
  for (let i = 0; i < 6; i++) box([1.5, 0.04, 0.05], [0, 0.82 + i * 0.09, gz + 0.07], i % 2 ? P.steel : P.hullLight);
  glow(box([1.8, 0.04, 0.05], [0, 1.38, gz + 0.06], P.neonCyan), 1.6);
  glow(box([1.8, 0.04, 0.05], [0, 0.72, gz + 0.06], P.neonCyan), 1.6);
  for (const s of [1, -1]) glow(box([0.04, 0.7, 0.05], [s * 0.9, 1.05, gz + 0.06], P.neonCyan), 1.6);
  box([0.05, 0.62, 0.04], [0, 1.05, gz + 0.1], P.hullLight);

  // ---------- headlights ----------
  for (const s of [1, -1]) {
    box([0.46, 0.34, 0.12], [s * 1.05, 1.1, gz + 0.0], P.hullDark);
    glow(box([0.34, 0.2, 0.06], [s * 1.05, 1.1, gz + 0.07], P.amber), 2);
    // brackets
    box([0.5, 0.05, 0.14], [s * 1.05, 1.3, gz - 0.02], P.hullLight);
    box([0.5, 0.05, 0.14], [s * 1.05, 0.9, gz - 0.02], P.hullLight);
    // fog light strips
    glow(box([0.5, 0.05, 0.04], [s * 0.5, 0.96, gz + 0.1], P.neonMagenta), 1.8);
    // turn lights
    glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.amber, { bone, at: [s * 1.38, 1.28, 4.03], dir: [s, 0, 0] }), 1.2);
  }

  // ---------- bull-bar bumper ----------
  box([2.9, 0.34, 0.28], [0, 0.62, 4.04], BLACK);
  box([2.5, 0.12, 0.3], [0, 0.82, 4.03], STEEL);
  b.part(new THREE.PlaneGeometry(2.7, 0.2), "#ffffff", {
    bone,
    at: [0, 0.6, 4.185],
    dir: [0, 0, 1],
    axis: "z",
    texture: hazard,
  });
  for (const s of [1, -1]) {
    // angled corner guards
    box([0.3, 0.34, 0.3], [s * 1.38, 0.62, 3.95], PLATE, { rotation: [0, s * 25, 0] });
    // bars
    b.rod([s * 0.55, 0.8, 4.12], [s * 0.45, 1.55, 4.14], 0.045, P.steel, { bone, sides: 6 });
    b.rod([s * 1.2, 0.8, 4.1], [s * 1.0, 1.4, 4.13], 0.04, P.steel, { bone, sides: 6 });
  }
  b.rod([-1.05, 1.5, 4.13], [1.05, 1.5, 4.13], 0.04, P.steel, { bone, sides: 6 });
  b.rod([-0.5, 1.55, 4.14], [0.5, 1.55, 4.14], 0.045, P.trim, { bone, sides: 6 });
  // tow hook
  b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), P.steel, { bone, at: [0, 0.58, 4.22], dir: [0, 0, 1], axis: "z" });
  box([0.1, 0.1, 0.1], [0, 0.6, 4.17], P.hullDark);
  // magenta underglow
  glow(box([2.4, 0.03, 0.2], [0, 0.44, 3.95], P.neonMagenta), 1.6);

  // ---------- fenders & mirrors ----------
  for (const s of [1, -1]) {
    box([0.4, 0.1, 0.85], [s * 1.25, 1.0, 3.35], PLATE, { rotation: [-8, 0, 0] });
    box([0.4, 0.3, 0.06], [s * 1.25, 0.8, 3.76], P.hullDark);
    b.rod([s * 1.18, 2.0, 3.08], [s * 1.38, 2.1, 3.22], 0.025, P.steel, { bone, sides: 5 });
    box([0.1, 0.3, 0.2], [s * 1.42, 2.12, 3.28], P.hullDark);
    glow(box([0.02, 0.22, 0.14], [s * 1.475, 2.12, 3.28], P.neonCyan), 0.9);
  }

  // hood hazard chevron at lip
  b.part(new THREE.PlaneGeometry(2.0, 0.12), "#ffffff", {
    bone,
    at: [0, 1.46, 4.105],
    dir: [0, 0.1, 1],
    axis: "z",
    texture: hazard,
  });
}
    return buildCabFront;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const base = M.turretRing;

  const HULLP = paint((p, n) => {
    const t = noise(p, 0.15, 3);
    const c = mix(P.hull, P.hullLight, smoothstep(0.3, 0.8, t) * 0.6 + Math.max(n.y, 0) * 0.3);
    return c;
  });
  const DARKP = paint((p) => mix(P.hullDark, P.hull, noise(p, 0.1, 5) * 0.6));

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#06202c" stroke="#2ff3ff" stroke-width="4"/><circle cx="32" cy="32" r="18" fill="#0b4a5e" stroke="#2ff3ff" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#2ff3ff"/><circle cx="26" cy="26" r="3" fill="#fff"/><path d="M32 2V10M32 54V62M2 32H10M54 32H62" stroke="#2ff3ff" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  // ring base (fixed on body)
  b.part(new THREE.CylinderGeometry(0.36, 0.39, 0.08, 12), DARKP, { bone: J.body, at: [0, base[1] + 0.04, base[2]] });
  b.part(new THREE.TorusGeometry(0.35, 0.02, 4, 16), P.trim, { bone: J.body, at: [0, base[1] + 0.09, base[2]], rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.steel, { bone: J.body, at: [Math.sin(a) * 0.36, base[1] + 0.1, base[2] + Math.cos(a) * 0.36] });
  }

  // rotating pedestal & housing
  const cz = base[2];
  b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.2, 8), HULLP, { bone: yaw, at: [0, 2.5, cz], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.34, 0.8), HULLP, { bone: yaw, at: [0, 2.77, cz + 0.05], flat: true });
  // sloped top
  b.part(new THREE.CylinderGeometry(0.3, 0.42, 0.14, 4, 1).rotateY(Math.PI / 4), HULLP, { bone: yaw, at: [0, 2.99, cz + 0.05], scale: [1.2, 1, 1.2], flat: true });
  // front mantlet
  b.part(new THREE.BoxGeometry(0.7, 0.3, 0.14), DARKP, { bone: yaw, at: [0, 2.77, cz + 0.5], flat: true });
  // side shield plates with hazard trim
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.4, 0.7), HULLP, { bone: yaw, at: [s * 0.44, 2.8, cz + 0.1], rotation: [0, 0, -s * 8], flat: true });
    b.part(new THREE.PlaneGeometry(0.62, 0.1), "#ffffff", { bone: yaw, at: [s * 0.472, 2.64, cz + 0.1], dir: [s, 0, 0], axis: "z", texture: HAZ });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.5), P.neonCyan, { bone: yaw, at: [s * 0.47, 2.95, cz + 0.1] });
  }
  glow(b.part(new THREE.BoxGeometry(0.1, 0.02, 0.5), P.neonCyan, { bone: yaw, at: [0.47, 2.95, cz + 0.1] }), 1.2);
  // rear panel hazard
  b.part(new THREE.PlaneGeometry(0.7, 0.12), "#ffffff", { bone: yaw, at: [0, 2.7, cz - 0.355], dir: [0, 0, -1], axis: "z", texture: HAZ });

  // ammo box with belt feed (left side)
  b.part(new THREE.BoxGeometry(0.22, 0.26, 0.34), P.hullDark, { bone: yaw, at: [0.5, 2.7, cz - 0.05], flat: true });
  b.part(new THREE.BoxGeometry(0.24, 0.04, 0.36), P.trim, { bone: yaw, at: [0.5, 2.84, cz - 0.05] });
  b.sweep(
    [
      [0.5, 2.72, cz + 0.12],
      [0.5, 2.62, cz + 0.28],
      [0.38, 2.68, cz + 0.42],
    ],
    0.022,
    { bone: yaw, color: P.amber, section: { ngon: 4 } },
  );

  // antenna & warning light
  b.rod([-0.3, 3.0, cz - 0.25], [-0.3, 3.08, cz - 0.25], 0.01, P.steel, { bone: yaw });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, { bone: yaw, at: [-0.3, 3.05, cz - 0.3] }), 1.6);
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.03, 6), P.hullDark, { bone: yaw, at: [-0.3, 3.0, cz - 0.28] });

  // gun cradle on pitch
  const gy = 2.78;
  const gz = cz + 0.5;
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.3), HULLP, { bone: pitch, at: [0, gy, gz + 0.05], flat: true });
  // sensor pod
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.26), P.hullDark, { bone: pitch, at: [0, gy + 0.2, gz], flat: true });
  glow(b.part(new THREE.CircleGeometry(0.075, 12), "#ffffff", { bone: pitch, at: [0, gy + 0.2, gz + 0.135], dir: [0, 0, 1], axis: "z", texture: LENS }), 1.3);
  glow(b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), P.neonCyan, { bone: pitch, at: [0, gy + 0.32, gz + 0.12] }), 1.4);

  // twin barrels
  for (const s of [1, -1]) {
    const x = s * 0.1;
    b.rod([x, gy, gz + 0.1], [x, gy, gz + 0.5], 0.032, P.steel, { bone: pitch, sides: 8 });
    // heat-vent sleeve
    b.rod([x, gy, gz + 0.15], [x, gy, gz + 0.38], 0.052, P.hullDark, { bone: pitch, sides: 8 });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.TorusGeometry(0.055, 0.008, 4, 8), P.trim, { bone: pitch, at: [x, gy, gz + 0.17 + i * 0.07] });
    // muzzle brake
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14), P.hullDark, { bone: pitch, at: [x, gy, gz + 0.5], flat: true });
    b.part(new THREE.BoxGeometry(0.11, 0.025, 0.02), P.amber, { bone: pitch, at: [x, gy, gz + 0.48] });
    b.part(new THREE.BoxGeometry(0.11, 0.025, 0.02), P.amber, { bone: pitch, at: [x, gy, gz + 0.53] });
  }
}
    return buildTurret;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P, M }: Ctx) {
  const body = J.body;
  const hatchJ = J.podHatch;
  const R = rng(11);
  const Z0 = -3.9, Z1 = 0.9, ZC = (Z0 + Z1) / 2, L = Z1 - Z0;
  const YC = 2.1, W = 2.5, H = 1.6;
  const YELLOW = P.trim, MAG = P.neonMagenta;

  // ---------- paints ----------
  const shell = paint((p, n) => {
    const base: [number, number, number] = [0.85, 0.87, 0.9];
    const g = noise(p, 0.5, 3);
    const low = smoothstep(2.0, 1.3, p.y);
    const dirt = 0.25 * smoothstep(0.5, 0.8, noise(p, 0.18, 7)) + 0.35 * low;
    const seamZ = Math.abs(((p.z - Z0) / 0.9) % 1 - 0.5) > 0.485 ? 0.35 : 0;
    const k = 0.9 + 0.15 * n.y + 0.08 * g;
    const c = mix([base[0] * k, base[1] * k, base[2] * k], [0.22, 0.2, 0.18], dirt);
    return mix(c, [0.1, 0.12, 0.16], seamZ);
  });
  const darkPaint = paint((p, n) => {
    const m = noise(p, 0.2, 5);
    const k = 0.8 + 0.3 * m + 0.1 * n.y;
    return [0.23 * k, 0.25 * k, 0.3 * k];
  });

  // ---------- textures ----------
  const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c10f"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#15161a"/>`).join("")}</svg>`, { size: 128 });
  const bioTex = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#f2c10f" stroke="#15161a" stroke-width="5"/>
    <g fill="none" stroke="#15161a" stroke-width="7"><circle cx="50" cy="50" r="7" fill="#15161a"/>
    <path d="M50 44 A18 18 0 0 1 68 26 M44 53 A18 18 0 0 1 20 62 M56 53 A18 18 0 0 1 56 80"/></g>
    <g fill="#15161a"><circle cx="68" cy="26" r="8"/><circle cx="20" cy="62" r="8"/><circle cx="56" cy="80" r="8"/></g></svg>`, { size: 128 });
  const serial = svg(`<svg viewBox="0 0 160 48"><rect width="160" height="48" rx="4" fill="#161a22" opacity="0.85"/>
    <text x="10" y="21" font-family="monospace" font-weight="bold" font-size="16" fill="#2ff3ff">AEGIS-7 / BIO</text>
    <text x="10" y="40" font-family="monospace" font-size="14" fill="#ff2fa8">SN 4471-X09-ΩK</text></svg>`, { size: 256 });
  const logo = svg(`<svg viewBox="0 0 120 60"><rect width="120" height="60" fill="none"/>
    <path d="M10 50 L40 8 L60 30 L80 8 L110 50 L88 50 L60 22 L32 50Z" fill="#e0323c" stroke="#15161a" stroke-width="3"/>
    <text x="60" y="58" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="10" fill="#15161a">NOVACORP</text></svg>`, { size: 192 });
  const status = svg(`<svg viewBox="0 0 80 48"><rect width="80" height="48" fill="#06141c"/>
    <rect x="4" y="4" width="72" height="40" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <text x="8" y="17" font-family="monospace" font-size="9" fill="#2ff3ff">SEAL: LOCKED</text>
    <text x="8" y="29" font-family="monospace" font-size="9" fill="#ff2fa8">TEMP -42C</text>
    <rect x="8" y="34" width="46" height="5" fill="#2ff3ff"/><rect x="54" y="34" width="18" height="5" fill="#123"/></svg>`, { size: 192 });
  const lockTex = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#ff2fa8"/>
    <rect x="8" y="8" width="48" height="48" rx="6" fill="none" stroke="#fff" stroke-width="3"/>
    <circle cx="32" cy="28" r="9" fill="none" stroke="#fff" stroke-width="4"/><rect x="21" y="30" width="22" height="16" fill="#fff"/></svg>`, { size: 128 });

  const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
  const decal = (geo: THREE.BufferGeometry, tex: THREE.Texture, at: number[], dir: number[], up = [0, 1, 0], g = false) => {
    const pt = b.part(geo, "#ffffff", { bone: body, at, dir, up, axis: "z", texture: tex });
    if (g) glow(pt, 1);
    return pt;
  };

  // ---------- main capsule: lofted rounded-faceted body ----------
  const st = [
    { at: [0, YC, Z0 + 0.15], w: 1.7, h: 1.1 },
    { at: [0, YC, Z0 + 0.5], w: W, h: H },
    { at: [0, YC, ZC], w: W, h: H },
    { at: [0, YC, Z1 - 0.5], w: W, h: H },
    { at: [0, YC, Z1 - 0.15], w: 1.7, h: 1.1 },
  ];
  b.part(new THREE.BoxGeometry(W, H, L - 0.7), shell, { bone: body, at: [0, YC, ZC] });
  for (const [z, s] of [[Z0 + 0.35, -1], [Z1 - 0.35, 1]] as const) {
    // chamfered end blocks (dark caps)
    b.part(new THREE.CylinderGeometry(0.82, 1.0, 0.7, 8, 1).rotateX(Math.PI / 2).rotateZ(Math.PI / 8).scale(1.3, 0.85, 1), darkPaint, {
      bone: body, at: [0, YC, z], flat: true });
    b.part(new THREE.BoxGeometry(2.0, 1.3, 0.12), P.podDark, { bone: body, at: [0, YC, z + s * 0.35] });
    // chamfer bars on shell corners
    for (const sx of [1, -1]) for (const sy of [1, -1])
      b.part(new THREE.BoxGeometry(0.22, 0.22, L - 0.5).rotateZ(Math.PI / 4), shell, { bone: body, at: [sx * 1.2, YC + sy * 0.76, ZC] });
  }
  // rounded roof shoulder panel
  b.part(new THREE.BoxGeometry(2.0, 0.12, L - 0.9), P.hullLight, { bone: body, at: [0, 2.93, ZC], flat: true });

  // ---------- magenta seal seams ----------
  const sealZ = [-3.0, -1.5, 0.0];
  for (const z of sealZ) {
    for (const sx of [1, -1]) glow(b.part(new THREE.BoxGeometry(0.04, H - 0.2, 0.05), MAG, { bone: body, at: [sx * (W / 2 + 0.005), YC, z] }), 1.6);
    glow(b.part(new THREE.BoxGeometry(W - 0.2, 0.04, 0.05), MAG, { bone: body, at: [0, YC + H / 2 + 0.005, z] }), 1.6);
  }
  glow(b.part(new THREE.BoxGeometry(0.03, 0.03, L - 0.6), MAG, { bone: body, at: [W / 2 + 0.01, YC + 0.45, ZC] }), 1.4);
  glow(b.part(new THREE.BoxGeometry(0.03, 0.03, L - 0.6), MAG, { bone: body, at: [-W / 2 - 0.01, YC + 0.45, ZC] }), 1.4);

  // ---------- straps with ratchets and chains ----------
  const strapZ = [-3.45, -2.25, -0.75, 0.45];
  for (const z of strapZ) {
    const sz = 0.3;
    b.part(new THREE.BoxGeometry(W + 0.08, 0.05, sz), hazard ? YELLOW : YELLOW, { bone: body, at: [0, YC + H / 2 + 0.03, z] });
    for (const sx of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.05, H + 0.06, sz), YELLOW, { bone: body, at: [sx * (W / 2 + 0.03), YC, z] });
      // hazard stripe overlay on side
      decal(plane(sz, 0.5), hazard, [sx * (W / 2 + 0.065), YC - 0.35, z], [sx, 0, 0], [0, 1, 0]);
      // ratchet
      b.part(new THREE.BoxGeometry(0.1, 0.2, 0.2), P.steel, { bone: body, at: [sx * (W / 2 + 0.1), YC - 0.65, z] });
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 6).rotateX(Math.PI / 2), P.hullDark, { bone: body, at: [sx * (W / 2 + 0.07), YC - 0.65, z] });
      // chain down to deck
      for (let i = 0; i < 4; i++)
        b.part(new THREE.TorusGeometry(0.04, 0.012, 4, 6).rotateY(i % 2 ? 0 : Math.PI / 2), P.steel, {
          bone: body, at: [sx * (W / 2 + 0.04), 1.5 - i * 0.065, z] });
      b.part(new THREE.BoxGeometry(0.12, 0.06, 0.2), P.hullDark, { bone: body, at: [sx * (W / 2 + 0.04), 1.3, z] });
    }
  }

  // ---------- corner brackets ----------
  for (const z of [Z0 + 0.3, Z1 - 0.3]) for (const sx of [1, -1]) for (const sy of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.34), P.podDark, { bone: body, at: [sx * (W / 2 + 0.03), YC + sy * 0.6, z] });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6).rotateZ(Math.PI / 2), P.steel, { bone: body, at: [sx * (W / 2 + 0.1), YC + sy * 0.6, z] });
  }
  // side handles
  for (const sx of [1, -1]) for (const z of [-2.65, -1.1]) {
    const x = sx * (W / 2 + 0.1);
    b.rod([x, 2.0, z - 0.25], [x, 2.0, z + 0.25], 0.025, P.steel, { bone: body });
    for (const dz of [-0.25, 0.25]) b.part(new THREE.BoxGeometry(0.1, 0.05, 0.05), P.steel, { bone: body, at: [sx * (W / 2 + 0.05), 2.0, z + dz] });
  }

  // ---------- decals ----------
  for (const sx of [1, -1]) {
    const x = sx * (W / 2 + 0.03);
    const up = [0, 1, 0];
    decal(plane(0.7, 0.7), bioTex, [x, 2.35, -2.65], [sx, 0, 0], up);
    decal(plane(1.0, 0.3), serial, [x, 2.65, -1.1 - 0.0], [sx, 0, 0], up, true);
    decal(plane(0.9, 0.45), logo, [x, 2.35, -0.55 - 0.0], [sx, 0, 0], up);
  }
  // rear (front-facing) end: lock plate + status
  glow(decal(plane(0.5, 0.5), lockTex, [0, 2.0, Z1 + 0.0 + 0.0], [0, 0, 1]), 1.5);
  b.part(new THREE.BoxGeometry(0.62, 0.62, 0.05), P.hullDark, { bone: body, at: [0, 2.0, Z1 - 0.02] });
  glow(decal(plane(0.5, 0.3), status, [0, 2.55, Z1 + 0.0 + 0.03], [0, 0, 1]), 1.3);
  decal(plane(0.9, 0.9), bioTex, [0, 2.0, Z0 - 0.0 - 0.02 - 0.0 + 0.0 - 0.0], [0, 0, -1]);
  // fix: back end plate sits at the dark cap
  b.part(new THREE.BoxGeometry(2.0, 1.3, 0.04), P.podDark, { bone: body, at: [0, YC, Z0 - 0.0] });
  decal(plane(0.9, 0.9), bioTex, [0, YC, Z0 - 0.03], [0, 0, -1]);
  glow(b.part(new THREE.BoxGeometry(1.6, 0.05, 0.03), P.warnRed, { bone: body, at: [0, YC - 0.5, Z0 - 0.04] }), 1.3);
  glow(b.part(new THREE.BoxGeometry(1.6, 0.05, 0.03), MAG, { bone: body, at: [0, YC + 0.5, Z0 - 0.04] }), 1.3);

  // ---------- roof conduits ----------
  for (const sx of [1, -1]) {
    const x = sx * 0.85;
    b.rod([x, 3.0, Z0 + 0.5], [x, 3.0, Z1 - 0.5], 0.05, P.hullDark, { bone: body, sides: 6 });
    for (let i = 0; i < 6; i++) {
      const z = Z0 + 0.7 + i * 0.75;
      b.part(new THREE.BoxGeometry(0.16, 0.1, 0.08), P.steel, { bone: body, at: [x, 3.0, z] });
    }
  }
  b.rod([-0.85, 3.0, -2.2], [0.85, 3.0, -2.2], 0.04, P.hullDark, { bone: body, sides: 6 });
  b.rod([-0.85, 3.0, -0.2], [0.85, 3.0, -0.2], 0.04, MAG, { bone: body, sides: 6 });
  // panel vents
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(2.0, 0.015, 0.05), P.hullDark, { bone: body, at: [0, 2.935, -3.4 + i * 0.12] });

  // ---------- hatch on podHatch ----------
  const hz = -1.0;
  b.part(new THREE.BoxGeometry(1.0, 0.1, 0.9), P.podDark, { bone: body, at: [0, 2.97, hz - 0.0], flat: true }); // seat frame
  const lid = b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.14, 8).scale(1, 1, 0.9), shell, { bone: hatchJ, at: [0, 3.06, hz + 0.0], flat: true });
  b.part(new THREE.BoxGeometry(0.9, 0.03, 0.12), YELLOW, { bone: hatchJ, at: [0, 3.14, hz + 0.0] });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.8), YELLOW, { bone: hatchJ, at: [0, 3.14, hz] });
  b.part(new THREE.BoxGeometry(0.14, 0.06, 0.14), P.steel, { bone: hatchJ, at: [0, 3.1, hz + 0.3] }); // handle
  // beacon
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 8), P.hullDark, { bone: hatchJ, at: [0, 3.08, hz - 0.28] });
  glow(b.part(new THREE.CylinderGeometry(0.06, 0.09, 0.05, 8), P.warnRed, { bone: hatchJ, at: [0, 3.11, hz - 0.28] }), 2);
  // hinges at rear edge
  for (const sx of [1, -1]) b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 6).rotateZ(Math.PI / 2), P.steel, { bone: body, at: [sx * 0.3, 3.0, hz - 0.5] });
  // hatch ring glow
  glow(b.part(new THREE.BoxGeometry(1.06, 0.015, 0.03), MAG, { bone: body, at: [0, 3.025, hz + 0.47] }), 1.5);
  glow(b.part(new THREE.BoxGeometry(1.06, 0.015, 0.03), MAG, { bone: body, at: [0, 3.025, hz - 0.47] }), 1.5);

  // deck base skirt under pod
  b.part(new THREE.BoxGeometry(2.3, 0.3, L - 0.3), P.hullDark, { bone: body, at: [0, 1.4, ZC] });
  glow(b.part(new THREE.BoxGeometry(2.34, 0.03, L - 0.5), MAG, { bone: body, at: [0, 1.28, ZC] }), 1.2);
  void R; void st; void lid;
}
    return buildCargoPod;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.25,0.55,2.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.25,0.55,2.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.25,0.55,-1.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.25,0.55,-1.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelBL"] = b.joint("wheelBL", { parent: J["body"], at: [1.25,0.55,-3.3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelBR"] = b.joint("wheelBR", { parent: J["body"], at: [-1.25,0.55,-3.3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.35,1.9], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,2.75,2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["podHatch"] = b.joint("podHatch", { parent: J["body"], at: [0,2.9,-1], dir: [0,0,-1], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
