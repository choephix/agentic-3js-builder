import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, mix, noise, smoothstep, catmull } from "../../../../src/index";
import { metal, panelled, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Warhound MX-77 Militarized Truck",
  "description": "A low-poly cyberpunk 2077 armored 6x6 military truck with angular plated hull, neon underglow, roof turret, sensor mast and a cargo bed with missile pods."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a414d",
  hullDark: "#1f242c",
  plate: "#566070",
  trim: "#e7b814",
  rubber: "#16171b",
  steel: "#8a94a3",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  glass: "#0e3a4a",
  warnRed: "#d8262f",
  olive: "#4b5a3a",
  white: "#e9edf2",
  ember: "#ff7a1a",
};
const M = {
  chassisTop: [0, 1.35, 0] as [number, number, number],
  cabFloor: [0, 1.35, 1.4] as [number, number, number],
  cabRoof: [0, 2.55, 1.4] as [number, number, number],
  turretRing: [0, 2.6, 0.9] as [number, number, number],
  bedFloor: [0, 1.35, -1.6] as [number, number, number],
  axleFront: [0, 0.62, 2.5] as [number, number, number],
  axleMid: [0, 0.62, -1.1] as [number, number, number],
  axleRear: [0, 0.62, -2.9] as [number, number, number],
  hoodFront: [0, 1.5, 3.5] as [number, number, number],
  bumperFront: [0, 0.8, 3.7] as [number, number, number],
  mastBase: [-0.9, 1.35, -3.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(77);
  const IRON = panelled(metal("iron"), { size: 0.3, rivets: 0.06 });
  const HULLP = panelled(P.hull, { size: 0.35, aspect: 0.6, rivets: 0.07 });
  const PLATEP = panelled(P.plate, { size: 0.25, rivets: 0.05 });
  const grime = paint((p, n) => {
    const t = noise(p, 0.3, 4);
    const base = mix(P.hullDark, P.hull, 0.35 + 0.4 * smoothstep(-0.5, 1, n.y));
    return mix(base, "#14110c", smoothstep(0.55, 0.8, t) * 0.6 * smoothstep(0.6, 0.0, p.y - 0.3));
  });

  // helper: box part
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...o });

  // textures
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#16171b"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  const chevron = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 11} 0 L${i * 11 + 6} 8 L${i * 11} 16 L${i * 11 + 4} 16 L${i * 11 + 10} 8 L${i * 11 + 4} 0Z" fill="#16171b"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  const numTex = (txt: string, sub: string) =>
    svg(
      `<svg viewBox="0 0 96 48"><rect x="1" y="1" width="94" height="46" rx="3" fill="#1f242c" stroke="#e9edf2" stroke-width="2"/>
      <text x="48" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e9edf2">${txt}</text>
      <text x="48" y="43" text-anchor="middle" font-family="monospace" font-size="8" fill="#2ff3ff">${sub}</text></svg>`,
      { size: 192 },
    );
  const warn = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 4 L46 43 H2Z" fill="#e7b814" stroke="#16171b" stroke-width="3" stroke-linejoin="round"/>
    <rect x="22" y="16" width="4" height="15" fill="#16171b"/><rect x="22" y="34" width="4" height="4" fill="#16171b"/></svg>`,
    { size: 96 },
  );
  const kanji = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="none"/>
    <text x="32" y="26" text-anchor="middle" font-size="26" font-weight="bold" fill="#ff2fb4">猟犬</text></svg>`,
    { size: 192 },
  );

  const decal = (tex: any, w: number, h: number, x: number, y: number, z: number, s: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: body,
      at: [x + s * 0.004, y, z],
      dir: [s, 0, 0],
      axis: "z",
      texture: tex,
    });

  // ---- side rails
  for (const s of [1, -1]) {
    box(0.16, 0.32, 6.6, IRON, s * 0.55, 0.78, -0.35);
    box(0.2, 0.06, 6.6, P.steel, s * 0.55, 0.96, -0.35);
    box(0.2, 0.06, 6.6, P.steel, s * 0.55, 0.6, -0.35);
    // rail greeble holes
    for (let i = 0; i < 8; i++) box(0.18, 0.1, 0.12, P.hullDark, s * 0.55, 0.78, -3.2 + i * 0.8);
  }
  // cross members
  for (let i = 0; i < 9; i++) {
    const z = -3.4 + i * 0.75;
    box(1.1, 0.12, 0.14, P.hullDark, 0, 0.7, z);
    box(1.0, 0.04, 0.2, P.steel, 0, 0.77, z);
  }

  // ---- deck / floor plate (top of chassis y=1.35)
  box(2.4, 0.12, 6.6, HULLP, 0, 1.29, -0.35);
  box(2.5, 0.05, 6.5, PLATEP, 0, 1.35, -0.35);
  // ---- belly plate
  box(1.5, 0.08, 5.8, grime, 0, 0.5, -0.3);
  for (let i = 0; i < 6; i++) box(1.5, 0.04, 0.05, P.steel, 0, 0.45, -2.8 + i * 1.0);
  // underglow
  for (const s of [1, -1]) {
    glow(box(0.06, 0.04, 5.4, P.neonMagenta, s * 0.8, 0.44, -0.3), 1.6);
    glow(box(0.06, 0.04, 5.4, P.neonCyan, s * 0.68, 0.44, -0.3), 1.4);
  }
  glow(box(1.0, 0.03, 0.06, P.neonCyan, 0, 0.45, 2.7), 1.4);
  glow(box(1.0, 0.03, 0.06, P.neonMagenta, 0, 0.45, -3.4), 1.4);

  // ---- skirt armor panels between wheel arches
  const segs: [number, number][] = [
    [1.55, 0.75],
    [0.2, 1.1],
    [-2.0, 1.1],
    [-3.3, 0.5],
  ];
  for (const s of [1, -1]) {
    for (const [z, len] of segs) {
      // sloped wedge: bottom inset
      const g = new THREE.CylinderGeometry(0.5, 0.5, len, 4, 1);
      g.rotateX(Math.PI / 2);
      g.rotateZ(Math.PI / 4);
      b.part(new THREE.BoxGeometry(0.14, 0.5, len), HULLP, { bone: body, at: [s * 1.26, 0.95, z] });
      b.part(new THREE.BoxGeometry(0.1, 0.16, len * 0.96), PLATEP, {
        bone: body,
        at: [s * 1.31, 0.62, z],
        rotation: [0, 0, s * 18],
      });
      // top lip
      box(0.2, 0.05, len, P.steel, s * 1.27, 1.22, z);
      // hazard chevron strip
      b.part(new THREE.PlaneGeometry(len * 0.9, 0.1), "#ffffff", {
        bone: body,
        at: [s * 1.335, 1.1, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: R() > 0.5 ? hazard : chevron,
      });
      // neon strips
      glow(box(0.03, 0.035, len * 0.9, P.neonMagenta, s * 1.335, 0.86, z), 1.8);
      glow(box(0.03, 0.035, len * 0.9, P.neonCyan, s * 1.335, 0.78, z), 1.6);
      // rivet greeble
      for (let k = 0; k < 3; k++) box(0.05, 0.06, 0.08, P.steel, s * 1.34, 0.98, z - len * 0.3 + k * len * 0.3);
    }
    // unit markings
    decal(numTex("MX-77", "WARHOUND"), 0.5, 0.25, s * 1.33, 0.95, 0.2, s);
    decal(numTex(s > 0 ? "06" : "07", "UNIT"), 0.4, 0.2, s * 1.33, 0.95, -2.0, s);
    decal(warn, 0.2, 0.2, s * 1.34, 0.95, 1.55, s);
    decal(kanji, 0.5, 0.25, s * 1.34, 1.0, -3.3, s);
  }

  // ---- fender flares (faceted wedges) over six wheels
  const axles = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  for (const z of axles) {
    for (const s of [1, -1]) {
      const x = s * 1.17;
      // arch top
      box(0.5, 0.1, 1.5, HULLP, x, 1.27, z);
      // sloped front/rear wedges
      for (const d of [1, -1]) {
        b.part(new THREE.BoxGeometry(0.5, 0.1, 0.5), HULLP, {
          bone: body,
          at: [x, 1.15, z + d * 0.7],
          rotation: [d * -35, 0, 0],
        });
        b.part(new THREE.BoxGeometry(0.5, 0.08, 0.3), P.plate, {
          bone: body,
          at: [x, 0.93, z + d * 0.9],
          rotation: [d * -55, 0, 0],
        });
      }
      // outer lip
      box(0.08, 0.14, 1.5, P.plate, s * 1.43, 1.2, z);
      box(0.06, 0.04, 1.4, P.trim, s * 1.47, 1.24, z);
      // mud flap behind wheel
      box(0.04, 0.4, 0.44, P.rubber, s * 1.3, 0.55, z - 0.82);
      box(0.05, 0.06, 0.4, P.trim, s * 1.3, 0.76, z - 0.82);
    }
  }

  // ---- front end: bumper support, tow hooks
  box(2.3, 0.35, 0.3, HULLP, 0, 0.8, 2.85);
  box(2.0, 0.2, 0.1, P.hullDark, 0, 0.55, 2.98);
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone: body, at: [s * 0.55, 0.62, 3.03] });
    box(0.14, 0.1, 0.12, P.trim, s * 0.55, 0.74, 2.96);
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone: body, at: [s * 0.65, 0.65, -3.83] });
  }
  // front lower neon
  glow(box(1.8, 0.04, 0.04, P.neonMagenta, 0, 0.9, 3.01), 1.6);

  // ---- rear bumper
  box(2.5, 0.4, 0.3, HULLP, 0, 0.8, -3.65);
  box(2.5, 0.08, 0.34, P.trim, 0, 1.02, -3.66);
  b.part(new THREE.PlaneGeometry(2.3, 0.14), "#ffffff", {
    bone: body,
    at: [0, 0.68, -3.806],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazard,
  });
  for (const s of [1, -1]) {
    glow(box(0.5, 0.1, 0.05, P.warnRed, s * 0.85, 0.85, -3.82), 2);
    box(0.56, 0.16, 0.04, P.hullDark, s * 0.85, 0.85, -3.79);
    glow(box(0.2, 0.06, 0.05, P.neonCyan, s * 0.35, 0.85, -3.82), 1.2);
  }
  // hitch
  box(0.3, 0.2, 0.5, P.steel, 0, 0.62, -3.95);
  cyl(0.1, 0.1, 0.12, 8, P.hullDark, [0, 0.74, -4.05]);
  cyl(0.04, 0.04, 0.2, 6, P.warnRed, [0, 0.78, -4.05]);
  box(0.4, 0.06, 0.2, P.steel, 0, 0.52, -3.8);
  // ---- fuel tanks
  for (const s of [1, -1]) {
    const tank = cyl(0.28, 0.28, 1.3, 8, HULLP, [s * 0.82, 0.62, -1.95], { rotation: [90, 0, 0] });
    for (const z of [-1.5, -2.4]) {
      box(0.04, 0.3, 0.7, P.trim, s * 0.82, 0.42, z + 0.0, { scale: [1, 1, 0.1] });
      box(0.7, 0.04, 0.06, P.rubber, s * 0.82, 0.62, z);
    }
    cyl(0.1, 0.1, 0.06, 6, P.steel, [s * 0.82, 0.62, -1.28], { rotation: [90, 0, 0] });
    glow(box(0.04, 0.04, 0.2, P.ember, s * 0.82, 0.92, -1.6), 1.5);
  }
  // ---- exhaust stacks behind cab
  for (const s of [1, -1]) {
    const x = s * 1.0;
    cyl(0.1, 0.12, 1.5, 6, P.steel, [x, 2.0, 0.35]);
    cyl(0.13, 0.13, 0.08, 6, P.hullDark, [x, 2.78, 0.35]);
    glow(cyl(0.07, 0.07, 0.02, 6, P.ember, [x, 2.8, 0.35]), 1.6);
    for (const y of [1.45, 1.8, 2.15, 2.5]) cyl(0.145, 0.145, 0.06, 6, P.trim, [x, y, 0.35]);
    box(0.2, 0.6, 0.2, P.hull, x, 1.55, 0.35);
    // heat shield
    box(0.04, 1.0, 0.3, P.plate, s * 1.12, 1.9, 0.35);
  }
  // ---- cab/bed mount frames (hidden support)
  box(2.2, 0.1, 0.2, P.hullDark, 0, 1.4, 0.45);
  box(2.2, 0.1, 0.2, P.hullDark, 0, 1.4, 3.0 - 0.5);
  // ---- hazard on deck edge front/rear
  b.part(new THREE.PlaneGeometry(2.2, 0.1), "#ffffff", {
    bone: body,
    at: [0, 1.22, 2.99],
    dir: [0, 0, 1],
    axis: "z",
    texture: chevron,
  });
}
    return buildChassis;
  })(),
  // wheelsAndSuspension
  (() => {
function buildWheelsAndSuspension({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.48;
  const rand = rng(77);
  const body = J.body;

  const TIRE = paint((p, n) => {
    const k = noise(p, 0.08, 3);
    const c = mix(P.rubber, "#2a2b31", k * 0.6 + (n.y > 0.5 ? 0.15 : 0));
    return c;
  });
  const STEEL = metal("steel", { tarnish: 0.3, size: 0.1 });
  const IRON = metal("iron", { tarnish: 0.5 });
  const AXLE = panelled(metal("iron"), { size: 0.18, rivets: 0.05 });
  const SPRING = metal("blued");

  const bolt = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#c8ced8" stroke="#111" stroke-width="3"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="#333" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return `<circle cx="${32 + Math.cos(a) * 24}" cy="${32 + Math.sin(a) * 24}" r="3.2" fill="#555" stroke="#111" stroke-width="1"/>`;
      })
      .join("")}
    <circle cx="32" cy="32" r="8" fill="#e7b814" stroke="#111" stroke-width="2"/>
    <path d="M26 32h12M32 26v12" stroke="#111" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.5],
    ["wheelFR", -1, 2.5],
    ["wheelML", 1, -1.1],
    ["wheelMR", -1, -1.1],
    ["wheelRL", 1, -2.9],
    ["wheelRR", -1, -2.9],
  ];

  for (const [name, s, z] of wheels) {
    const j = (J as any)[name];
    const cx = s * 1.15;
    const cy = 0.62;
    const ax: [number, number, number] = [s, 0, 0];
    // tyre (10-sided cylinder, axis along x)
    const tyre = new THREE.CylinderGeometry(R * 0.93, R * 0.93, W, 10);
    b.part(tyre, TIRE, { bone: j, at: [cx, cy, z], dir: ax, flat: true });
    // sidewall bulge rings
    for (const o of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.82, R * 0.9, 0.05, 10), P.rubber, {
        bone: j,
        at: [cx + s * o * (W / 2 - 0.01) * 1, cy, z],
        dir: ax,
        flat: true,
      });
    }
    // lug blocks
    const lugs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const g = new THREE.BoxGeometry(W * 0.9, 0.09, 0.1);
      g.rotateX(a);
      g.translate(0, Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98);
      lugs.push(g);
    }
    const merged = mergeLugs(lugs);
    if (merged) b.part(merged, "#0c0d10", { bone: j, at: [cx, cy, z], dir: [s, 0, 0], axis: "x" as any });
    // rim face
    const outX = cx + s * (W / 2 + 0.005);
    b.part(new THREE.CylinderGeometry(R * 0.6, R * 0.6, 0.06, 10), STEEL, {
      bone: j,
      at: [cx + s * (W / 2 - 0.02), cy, z],
      dir: ax,
      flat: true,
    });
    b.part(new THREE.CircleGeometry(R * 0.56, 16), "#ffffff", {
      bone: j,
      at: [outX + s * 0.025, cy, z],
      dir: ax,
      axis: "z",
      texture: bolt,
    });
    // glowing cyan hub ring
    glow(
      b.part(new THREE.TorusGeometry(R * 0.33, 0.025, 5, 12), P.neonCyan, {
        bone: j,
        at: [outX + s * 0.04, cy, z],
        dir: ax,
        axis: "z",
      }),
      1.6,
    );
    // hub cap
    b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 8), P.trim, {
      bone: j,
      at: [outX + s * 0.07, cy, z],
      dir: ax,
      flat: true,
    });
    // inner cyan ring (inside face)
    glow(
      b.part(new THREE.TorusGeometry(R * 0.4, 0.02, 4, 12), P.neonCyan, {
        bone: j,
        at: [cx - s * (W / 2 + 0.01), cy, z],
        dir: ax,
        axis: "z",
      }),
      1.2,
    );
    // brake disc and caliper
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.035, 12), metal("steel", { polish: 0.8 }), {
      bone: j,
      at: [cx - s * 0.2, cy, z],
      dir: ax,
    });
    b.part(new THREE.BoxGeometry(0.12, 0.22, 0.16), P.warnRed, {
      bone: j,
      at: [cx - s * 0.2, cy + R * 0.42, z],
    });
  }

  // axles, differentials, springs, shocks
  const axles: [number, boolean][] = [
    [2.5, true],
    [-1.1, false],
    [-2.9, false],
  ];
  for (const [z, front] of axles) {
    b.rod([-1.0, 0.62, z], [1.0, 0.62, z], 0.07, AXLE, { bone: body, sides: 8 } as any);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 2.1, 8), AXLE, { bone: body, at: [0, 0.62, z], dir: [1, 0, 0] });
    // pumpkin
    b.part(new THREE.SphereGeometry(0.27, 8, 6), IRON, {
      bone: body,
      at: [0, 0.62, z + (front ? 0.05 : -0.04)],
      scale: [1, 0.95, 0.9],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.28, 0.28, 0.1), P.hullDark, { bone: body, at: [0, 0.62, z + (front ? -0.28 : 0.28)] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6), STEEL, {
      bone: body,
      at: [0, 0.7, z + (front ? 0.3 : -0.3)],
      dir: [0, 0.2, front ? 1 : -1],
    });
    for (const s of [1, -1]) {
      const x = s * 0.82;
      // leaf spring pack
      for (let k = 0; k < 5; k++) {
        const len = 1.15 - k * 0.15;
        b.part(new THREE.BoxGeometry(0.1, 0.025, len), k % 2 ? P.hullDark : P.plate, {
          bone: body,
          at: [x, 0.78 - k * 0.0 + 0.0 + (4 - k) * 0.0, z],
          position: undefined,
        } as any);
      }
      for (let k = 0; k < 4; k++)
        b.part(new THREE.BoxGeometry(0.1, 0.028, 1.1 - k * 0.2), k % 2 ? P.hullDark : P.plate, {
          bone: body,
          at: [x, 0.8 + k * 0.03, z],
        });
      // clamp u-bolts
      b.part(new THREE.BoxGeometry(0.16, 0.2, 0.14), P.hullDark, { bone: body, at: [x, 0.82, z] });
      // spring eyes
      for (const e of [1, -1])
        b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 6), STEEL, {
          bone: body,
          at: [x, 0.84, z + e * 0.57],
          dir: [1, 0, 0],
        });
      // shock absorber with coil spring
      const lo: [number, number, number] = [s * 0.62, 0.7, z + 0.14];
      const hi: [number, number, number] = [s * 0.62, 1.28, z + 0.14];
      b.rod(lo, hi, 0.035, STEEL, { bone: body, sides: 6 } as any);
      b.sweep(coil([lo[0], lo[1] + 0.08, lo[2]], [hi[0], hi[1] - 0.08, hi[2]], 0.07, 7), 0.013, {
        bone: body,
        color: SPRING,
        sides: 5,
      } as any);
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), P.trim, { bone: body, at: [lo[0], lo[1] - 0.02, lo[2]] });
      b.part(new THREE.BoxGeometry(0.12, 0.05, 0.12), P.trim, { bone: body, at: [hi[0], hi[1] + 0.02, hi[2]] });
    }
  }

  // steering links on front axle
  b.rod([-1.0, 0.5, 2.28], [1.0, 0.5, 2.28], 0.03, STEEL, { bone: body, sides: 6 } as any);
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 0.5, 2.28], [s * 1.0, 0.62, 2.5], 0.03, STEEL, { bone: body, sides: 6 } as any);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.trim, { bone: body, at: [s * 1.0, 0.5, 2.28] });
  }
  b.rod([0, 0.62, 2.5], [0, 0.5, 2.28], 0.04, STEEL, { bone: body, sides: 6 } as any);

  // drive shafts along the centre
  b.rod([0, 0.64, 2.2], [0, 0.64, -1.3], 0.06, IRON, { bone: body, sides: 8 } as any);
  b.rod([0, 0.64, -1.0], [0, 0.64, -2.7], 0.06, IRON, { bone: body, sides: 8 } as any);
  for (const z of [1.2, -0.2, -1.8])
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6), P.trim, { bone: body, at: [0, 0.64, z], dir: [0, 0, 1] });
  // underglow hints on axles
  glow(b.part(new THREE.BoxGeometry(0.4, 0.02, 0.04), P.neonMagenta, { bone: body, at: [0, 0.45, -1.1] }), 1.4);

  function mergeLugs(list: THREE.BufferGeometry[]) {
    let pos: number[] = [];
    let nor: number[] = [];
    let uv: number[] = [];
    let idx: number[] = [];
    let off = 0;
    for (const g of list) {
      const p = g.getAttribute("position");
      const n = g.getAttribute("normal");
      const u = g.getAttribute("uv");
      for (let i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
        uv.push(u.getX(i), u.getY(i));
      }
      const ix = g.getIndex()!;
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    m.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    m.setIndex(idx);
    // lug axis: local x is axle; geometry already built around x
    m.rotateZ(-Math.PI / 2);
    return m;
  }
}
    return buildWheelsAndSuspension;
  })(),
  // cabAndFront
  (() => {
function buildCabAndFront({ b, J, P }: Ctx) {
  const HULL = panelled(P.hull, { size: 0.32, rivets: 0.07 });
  const PLATE = panelled(P.plate, { size: 0.22, rivets: 0.05 });
  const body = J.body;

  // ---------- helpers ----------
  const box = (sz: number[], col: any, at: number[], rot?: number[], bone?: any) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), col, {
      bone: bone ?? body,
      at,
      ...(rot ? { rotation: rot } : {}),
    });
  const cylZ = (r: number, len: number, seg: number, col: any, at: number[], bone?: any) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), col, { bone: bone ?? body, at, rotation: [90, 0, 0] });
  const cylX = (r: number, len: number, seg: number, col: any, at: number[], bone?: any) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), col, { bone: bone ?? body, at, rotation: [0, 0, 90] });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], bone?: any) =>
    b.part(new THREE.PlaneGeometry(w, h), P.white, { bone: bone ?? body, at, dir, axis: "z", texture: tex });
  const lamp = (sz: number[], col: string, at: number[], s = 1.2, rot?: number[]) =>
    glow(box(sz, col, at, rot), s);

  // ---------- textures ----------
  let chev = "";
  for (let i = 0; i < 9; i++)
    chev += `<polygon points="${i * 8 - 4},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8 + 4},0" fill="#16171b"/>`;
  const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${chev}</svg>`, { size: 256 });

  const WIND = svg(
    `<svg viewBox="0 0 100 22">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14566b"/><stop offset="1" stop-color="#06202a"/></linearGradient></defs>
    <rect width="100" height="22" rx="2" fill="url(#g)"/>
    <rect x="0" y="15" width="100" height="7" fill="#0d1218"/>
    <rect x="14" y="16" width="26" height="4.5" rx="1" fill="#2ff3ff" opacity="0.85"/>
    <path d="M16 19 h6 l2 -2 l3 3 l3 -4 l4 3 h5" stroke="#06202a" stroke-width="0.8" fill="none"/>
    <rect x="58" y="16" width="22" height="4.5" rx="1" fill="#ff2fb4" opacity="0.85"/>
    <rect x="61" y="17.5" width="8" height="1.2" fill="#fff" opacity="0.7"/>
    <rect x="20" y="3" width="9" height="13" rx="3" fill="#161c24"/><circle cx="24.5" cy="6" r="3" fill="#232b36"/>
    <rect x="64" y="3" width="9" height="13" rx="3" fill="#161c24"/>
    <polygon points="8,0 22,0 10,22 0,22" fill="#fff" opacity="0.14"/>
    <polygon points="40,0 46,0 34,22 28,22" fill="#fff" opacity="0.1"/>
    <polygon points="78,0 92,0 80,22 70,22" fill="#fff" opacity="0.12"/>
    <path d="M84 4 h8 M88 2 v6" stroke="#2ff3ff" stroke-width="0.8"/><circle cx="88" cy="5" r="2.4" fill="none" stroke="#2ff3ff" stroke-width="0.6"/>
    <text x="48" y="8" font-family="monospace" font-size="3.2" fill="#2ff3ff">HUD 077 // SYS OK</text>
    <rect x="0" y="0" width="100" height="1" fill="#2ff3ff" opacity="0.7"/>
  </svg>`,
    { size: 512 },
  );

  const SIDEWIN = svg(
    `<svg viewBox="0 0 60 28">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14566b"/><stop offset="1" stop-color="#06202a"/></linearGradient></defs>
    <rect width="60" height="28" rx="3" fill="url(#g)"/>
    <rect x="34" y="8" width="9" height="20" rx="3" fill="#161c24"/><circle cx="38.5" cy="9" r="4" fill="#232b36"/>
    <rect x="10" y="20" width="14" height="8" fill="#0d1218"/><rect x="12" y="22" width="8" height="3" fill="#2ff3ff" opacity="0.8"/>
    <polygon points="6,0 18,0 8,28 0,28" fill="#fff" opacity="0.15"/>
    <polygon points="30,0 36,0 26,28 20,28" fill="#fff" opacity="0.1"/>
  </svg>`,
    { size: 256 },
  );

  const DOORTEX = svg(
    `<svg viewBox="0 0 100 50">
    <text x="4" y="30" font-family="monospace" font-weight="bold" font-size="24" fill="#e9edf2" stroke="#16171b" stroke-width="1.2">MX-77</text>
    <polygon points="79,4 94,12 94,30 79,38 64,30 64,12" fill="#1f242c" stroke="#e7b814" stroke-width="2.4"/>
    <polygon points="68,14 72,8 76,15 82,15 86,8 90,14 88,26 79,32 70,26" fill="#ff2fb4"/>
    <circle cx="75" cy="20" r="1.6" fill="#2ff3ff"/><circle cx="83" cy="20" r="1.6" fill="#2ff3ff"/>
    <rect x="4" y="38" width="38" height="9" fill="#d8262f"/>
    <text x="6" y="45.5" font-family="monospace" font-weight="bold" font-size="7" fill="#e9edf2">WARNING ARMED</text>
    <text x="50" y="47" font-family="sans-serif" font-size="8" fill="#e9edf2">警戒 07</text>
  </svg>`,
    { size: 512 },
  );

  const MIRROR = svg(
    `<svg viewBox="0 0 16 16"><rect width="16" height="16" fill="#06202a"/>
    <path d="M2 13 L8 3 L14 13" stroke="#2ff3ff" stroke-width="1.4" fill="none"/>
    <rect x="1" y="14" width="14" height="1.2" fill="#ff2fb4"/></svg>`,
    { size: 64 },
  );

  // ---------- cab hull ----------
  b.extrude(
    [[0.5, 1.35], [2.3, 1.35], [2.3, 1.9], [1.85, 2.55], [0.65, 2.55], [0.5, 2.4]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: HULL, bone: body, bevel: 0.03, name: "cabHull" },
  );
  // roof chamfer plates and rear lip
  for (const s of [1, -1]) {
    box([0.34, 0.07, 1.2], PLATE, [s * 1.07, 2.54, 1.25], [0, 0, -22 * s]);
    box([0.08, 0.9, 0.3], PLATE, [s * 1.225, 1.9, 0.68]);
    lamp([0.02, 0.6, 0.04], P.neonCyan, [s * 1.255, 1.9, 0.68]);
    // front shoulder plates
    box([0.22, 0.6, 0.1], PLATE, [s * 1.1, 1.65, 2.3], [-12, 0, 0]);
    lamp([0.08, 0.05, 0.03], P.ember, [s * 1.1, 1.97, 2.34]);
  }
  box([2.5, 0.08, 0.3], PLATE, [0, 2.57, 0.65]);
  // rear wall ribs
  for (let i = -2; i <= 2; i++) box([0.08, 1.0, 0.05], P.hullDark, [i * 0.45, 1.9, 0.52]);

  // ---------- windshield ----------
  const N = [0, 0.57, 0.82];
  plane(1.8, 0.45, WIND, [0, 2.232 + 0.005, 2.085 + 0.008], N);
  box([2.0, 0.05, 0.14], P.hullDark, [0, 2.54, 1.93], [55, 0, 0]);
  box([1.9, 0.05, 0.07], P.hullDark, [0, 1.98, 2.27], [55, 0, 0]);
  for (const s of [1, -1]) box([0.09, 0.05, 0.84], P.hullDark, [s * 0.96, 2.24, 2.1], [55, 0, 0]);
  for (const x of [-0.5, 0.5]) box([0.04, 0.04, 0.8], P.steel, [x, 2.26, 2.12], [55, 0, 0]);

  // ---------- hood ----------
  b.extrude([[2.2, 1.35], [3.5, 1.35], [3.5, 1.65], [2.3, 1.95]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, color: PLATE, bone: body, bevel: 0.025, name: "hood",
  });
  box([0.5, 0.05, 1.0], HULL, [0, 1.84, 2.9], [14, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const z = 2.55 + i * 0.13;
    const y = 1.95 - 0.25 * (z - 2.3) + 0.03;
    for (const s of [1, -1]) box([0.5, 0.025, 0.05], P.hullDark, [s * 0.65, y, z], [14, 0, 0]);
  }
  // hood light bar
  const zb = 2.5, yb = 1.95 - 0.25 * 0.2 + 0.07;
  box([1.5, 0.07, 0.12], P.hullDark, [0, yb, zb], [14, 0, 0]);
  for (let i = 0; i < 6; i++)
    lamp([0.2, 0.05, 0.08], i % 2 ? P.neonMagenta : P.neonCyan, [-0.6 + i * 0.24, yb + 0.05, zb], 1.6, [14, 0, 0]);
  box([0.06, 0.1, 0.1], P.steel, [-0.7, yb - 0.04, zb]);
  box([0.06, 0.1, 0.1], P.steel, [0.7, yb - 0.04, zb]);
  // grille
  box([1.0, 0.34, 0.05], P.hullDark, [0, 1.5, 3.505]);
  for (let i = -3; i <= 3; i++) lamp([0.07, 0.26, 0.03], P.neonCyan, [i * 0.14, 1.5, 3.53], 1.5);
  // hood side trim
  for (const s of [1, -1]) {
    plane(1.0, 0.1, HAZARD, [s * 1.006, 1.58, 2.9], [s, 0, 0]);
    lamp([0.02, 0.03, 1.1], P.neonMagenta, [s * 1.008, 1.4, 2.85], 1.3);
    // big headlights
    box([0.3, 0.24, 0.1], P.hullDark, [s * 0.82, 1.5, 3.51]);
    lamp([0.22, 0.16, 0.04], P.white, [s * 0.82, 1.5, 3.55], 2);
  }

  // ---------- bumper, blade, winch ----------
  b.extrude([[3.4, 0.9], [3.68, 0.92], [3.7, 1.2], [3.55, 1.32], [3.4, 1.32]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: PLATE, bone: body, bevel: 0.02, name: "bumper",
  });
  b.extrude([[3.5, 0.55], [3.7, 0.55], [3.7, 0.82], [3.5, 0.82]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, color: P.steel, bone: body, bevel: 0.02, name: "plow",
  });
  for (const s of [1, -1]) {
    box([0.12, 0.3, 0.2], P.hullDark, [s * 1.3, 0.68, 3.55], [0, 18 * s, 0]);
    box([0.06, 0.28, 0.2], P.hull, [s * 0.6, 0.68, 3.65]);
  }
  plane(1.5, 0.16, HAZARD, [0, 1.04, 3.704], [0, 0, 1]);
  lamp([1.5, 0.03, 0.02], P.neonMagenta, [0, 1.2, 3.705], 1.6);
  for (const s of [1, -1]) {
    box([0.24, 0.18, 0.08], P.hullDark, [s * 1.0, 1.1, 3.69]);
    lamp([0.18, 0.12, 0.03], P.white, [s * 1.0, 1.1, 3.73], 2);
    box([0.06, 0.28, 0.08], P.steel, [s * 0.8, 1.06, 3.72]);
  }
  lamp([2.2, 0.03, 0.12], P.neonMagenta, [0, 0.58, 3.45], 1.4);
  // winch
  cylX(0.05, 0.9, 8, P.steel, [0, 0.87, 3.6]);
  for (const s of [1, -1]) cylX(0.085, 0.04, 8, P.hullDark, [s * 0.46, 0.87, 3.6]);
  b.sweep(catmull([[0, 0.92, 3.62], [0.05, 0.9, 3.7], [0.1, 0.86, 3.71], [0.12, 0.8, 3.71]]), 0.012, {
    color: P.rubber, bone: body, caps: "round",
  });
  box([0.07, 0.07, 0.04], P.warnRed, [0.12, 0.77, 3.7]);

  // ---------- doors ----------
  for (const s of [1, -1]) {
    const dj = s > 0 ? J.doorL : J.doorR;
    const xo = s * 1.28;
    box([0.07, 1.0, 1.1], HULL, [s * 1.245, 1.95, 1.4], undefined, dj);
    plane(0.8, 0.36, SIDEWIN, [xo + s * 0.003, 2.18, 1.4], [s, 0, 0], dj);
    // window frame + shutter
    box([0.02, 0.05, 0.9], P.hullDark, [s * 1.295, 2.4, 1.4], undefined, dj);
    box([0.02, 0.04, 0.9], P.hullDark, [s * 1.295, 1.97, 1.4], undefined, dj);
    for (const z of [0.97, 1.83]) box([0.02, 0.4, 0.05], P.hullDark, [s * 1.295, 2.18, z], undefined, dj);
    for (let i = 0; i < 4; i++) box([0.03, 0.025, 0.7], P.steel, [s * 1.3, 2.46 + 0.0, 1.4 + (i - 1.5) * 0.0], undefined, dj);
    plane(1.0, 0.5, DOORTEX, [xo + s * 0.004, 1.65, 1.4], [s, 0, 0], dj);
    box([0.03, 0.05, 0.16], P.steel, [s * 1.295, 2.0 - 0.0, 0.95], undefined, dj);
    box([0.04, 0.02, 0.2], P.hullDark, [s * 1.29, 1.5, 1.4], undefined, dj);
    glow(box([0.02, 0.02, 1.0], P.neonMagenta, [s * 1.288, 1.47, 1.4], undefined, dj), 1.4);
  }
  for (const s of [1, -1]) {
    plane(1.5, 0.1, HAZARD, [s * 1.206, 1.4, 1.4], [s, 0, 0]);
    // step rails
    box([0.1, 0.05, 1.3], P.steel, [s * 1.26, 0.72, 1.4]);
    box([0.1, 0.03, 1.2], P.hullDark, [s * 1.26, 0.75, 1.4]);
    for (const z of [0.9, 1.9]) box([0.05, 0.4, 0.05], P.hullDark, [s * 1.22, 0.95, z]);
    lamp([0.03, 0.03, 1.2], P.neonCyan, [s * 1.31 - s * 0.03, 0.69, 1.4], 1.4);
    // grab handles
    for (const y of [1.6, 2.25]) box([0.04, 0.05, 0.05], P.steel, [s * 1.225, y, 2.12]);
    b.rod([s * 1.255, 1.6, 2.12], [s * 1.255, 2.25, 2.12], 0.018, P.steel, { bone: body });
    // mirror
    b.rod([s * 1.2, 1.95, 2.26], [s * 1.26, 2.02, 2.15], 0.014, P.hullDark, { bone: body });
    box([0.07, 0.24, 0.18], P.hullDark, [s * 1.26, 2.05, 2.12]);
    glow(plane(0.15, 0.2, MIRROR, [s * 1.26, 2.05, 2.12 - 0.095], [0, 0, -1]), 1);
  }

  // ---------- roof rack, lights, antennas, intake ----------
  for (const s of [1, -1]) {
    b.rod([s * 1.05, 2.66, 0.9], [s * 1.05, 2.66, 1.8], 0.02, P.steel, { bone: body });
    for (const z of [0.9, 1.8]) box([0.05, 0.1, 0.05], P.steel, [s * 1.05, 2.6, z]);
    cylZ(0.08, 0.22, 8, P.hullDark, [s * 0.98, 2.66, 1.62]);
    lamp([0.12, 0.12, 0.03], P.white, [s * 0.98, 2.66, 1.74], 2);
    box([0.1, 0.06, 0.1], P.steel, [s * 0.98, 2.58, 1.6]);
    b.spike([s * 1.1, 2.57, 0.7], [0, 1, 0], 0.4, 0.014, { color: P.steel, bone: body });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.warnRed, { bone: body, at: [s * 1.1, 2.98, 0.7] }), 2);
  }
  for (const z of [0.9, 1.35, 1.8]) b.rod([-1.05, 2.66, z], [1.05, 2.66, z], 0.016, P.steel, { bone: body });
  box([0.7, 0.03, 0.02], P.steel, [-0.7, 2.7, 1.35]);
  b.extrude([[1.2, 2.55], [1.75, 2.55], [1.75, 2.66], [1.4, 2.66]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 0.6, color: P.hullDark, bone: body, name: "intake",
  });
  for (let i = 0; i < 4; i++) box([0.5, 0.02, 0.04], P.steel, [0, 2.68, 1.42 + i * 0.1]);
  glow(box([0.04, 0.04, 0.02], P.warnRed, [0.3, 2.62, 1.76]), 1.6);
}
    return buildCabAndFront;
  })(),
  // turretAndRoofWeapons
  (() => {
function buildTurretAndRoofWeapons({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const gun = J.turretGun;
  const body = J.body;
  const TX = 0, TY = 2.6, TZ = 0.9;

  const ARMOR = panelled(P.hull, { size: 0.22, rivets: 0.05 });
  const DARKP = panelled(P.hullDark, { size: 0.2, rivets: 0.05 });
  const STEEL = metal("steel", { tarnish: 0.3 });
  const GUN = metal("iron", { polish: 0.5 });

  const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${i*16-6} 16 L${i*16+2} 0 L${i*16+10} 0 L${i*16+2} 16Z" fill="#111"/>`).join("")}</svg>`, { size: 128 });
  const iff = svg(`<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#10161c" stroke="${P.trim}" stroke-width="3"/><text x="8" y="22" font-size="14" font-family="monospace" font-weight="bold" fill="${P.neonCyan}">IFF</text><text x="8" y="40" font-size="12" font-family="monospace" fill="${P.neonMagenta}">MX-77</text><path d="M46 8 L58 8 L52 20Z" fill="${P.warnRed}"/></svg>`, { size: 128 });
  const warn = svg(`<svg viewBox="0 0 64 64"><path d="M32 4 L61 58 L3 58Z" fill="${P.trim}" stroke="#111" stroke-width="5" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="19" fill="#111"/><rect x="29" y="46" width="6" height="6" fill="#111"/></svg>`, { size: 96 });
  const lens = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#06141a"/><circle cx="32" cy="32" r="22" fill="${P.neonCyan}"/><circle cx="32" cy="32" r="11" fill="#06141a"/><circle cx="26" cy="26" r="4" fill="#fff"/></svg>`, { size: 96 });

  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, s: number, c: any, at: number[], bone: any, dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, s), c, { bone, at, dir, flat: true });

  // base ring (lathe) + collar
  b.lathe([[0, 0], [0.5, 0], [0.5, 0.04], [0.44, 0.07], [0.4, 0.07], [0, 0.07]], { at: [TX, 2.55, TZ], bone: body, segments: 12, color: DARKP });
  b.lathe([[0.3, 0], [0.42, 0], [0.42, 0.06], [0.36, 0.1], [0.3, 0.1]], { at: [TX, 2.62, TZ], bone: yaw, segments: 12, color: STEEL });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.015, 5, 4), P.steel, { bone: body, at: [Math.sin(a) * 0.47, 2.6, TZ + Math.cos(a) * 0.47] });
  }

  // turret housing
  const hz = TZ + 0.05;
  b.frustumBox([0, 2.72, hz], [0, 2.72, hz], [0, 0], [0, 0], { bone: yaw, color: ARMOR }).meshes;
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.26, 8), ARMOR, { bone: yaw, at: [0, 2.78, hz], flat: true, rotation: [0, 22.5, 0] });
  // sloped front plate
  b.extrude([[-0.38, 0], [0.38, 0], [0.3, 0.2], [-0.3, 0.2]], { at: [0, 2.7, hz + 0.34], x: [1, 0, 0], y: [0, 0.4, 1], thickness: 0.05, bevel: 0.01, color: DARKP, bone: yaw });
  // side plates
  for (const s of [1, -1]) {
    b.extrude([[-0.35, 0], [0.4, 0], [0.3, 0.26], [-0.28, 0.3]], { at: [s * 0.46, 2.68, hz], x: [0, 0, 1], y: [s * 0.35, 1, 0], thickness: 0.05, bevel: 0.01, color: ARMOR, bone: yaw });
    // trim stripe
    b.part(new THREE.BoxGeometry(0.01, 0.07, 0.5), P.trim, { bone: yaw, at: [s * 0.52, 2.74, hz - 0.02], texture: hazard, rotation: [0, 0, 0] });
    // smoke launchers: 4 tubes each side
    for (let k = 0; k < 4; k++) {
      cyl(0.034, 0.034, 0.22, 6, P.hullDark, [s * 0.55, 2.8 + (k % 2) * 0.07, hz - 0.2 + Math.floor(k / 2) * 0.09 - 0.05 + (k % 2) * 0.0], yaw, [s * 0.4, 0.3, 1]);
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 6), P.ember, { bone: yaw, at: [s * 0.6, 2.84 + (k % 2) * 0.07 - 0.04, hz - 0.15 + Math.floor(k / 2) * 0.09], dir: [s * 0.4, 0.3, 1] });
    }
    box(0.1, 0.18, 0.28, P.hullDark, [s * 0.52, 2.78, hz - 0.1], yaw);
  }
  // roof hatch
  box(0.34, 0.03, 0.3, P.plate, [-0.05, 2.93, hz - 0.12], yaw);
  box(0.2, 0.04, 0.2, P.hullDark, [-0.05, 2.955, hz - 0.12], yaw);
  // IFF panel
  b.part(new THREE.PlaneGeometry(0.2, 0.15), "#ffffff", { bone: yaw, at: [0.2, 2.84, hz - 0.31], dir: [0, 0, -1], axis: "z", texture: iff });
  box(0.24, 0.19, 0.03, P.hullDark, [0.2, 2.84, hz - 0.325], yaw);
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { bone: yaw, at: [-0.2, 2.82, hz - 0.31], dir: [0, 0, -1], axis: "z", texture: warn });
  // status LEDs
  for (let i = 0; i < 4; i++) glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), i % 2 ? P.warnRed : P.neonCyan, { bone: yaw, at: [-0.05 + i * 0.05, 2.9, hz - 0.32] }), 2);
  // antenna
  cyl(0.008, 0.012, 0.35, 5, P.steel, [-0.33, 3.0 - 0.0 - 0.02, hz - 0.2], yaw);
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.warnRed, { bone: yaw, at: [-0.33, 3.0, hz - 0.2] }), 2);

  // sensor ball camera
  cyl(0.04, 0.06, 0.08, 6, P.hullDark, [0.3, 2.95, hz + 0.05], yaw);
  b.part(new THREE.SphereGeometry(0.075, 8, 6), STEEL, { bone: yaw, at: [0.3, 3.0 - 0.0, hz + 0.08], flat: true });
  glow(b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", { bone: yaw, at: [0.3, 3.0, hz + 0.155], dir: [0, 0, 1], axis: "z", texture: lens }), 1.8);

  // ammo box + belt feed
  box(0.26, 0.2, 0.3, P.olive, [-0.44, 2.72, hz + 0.3], yaw);
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.2), P.trim, { bone: yaw, at: [-0.44, 2.825, hz + 0.3], texture: hazard });
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.04), P.trim, { bone: yaw, at: [-0.4 + t * 0.2, 2.68 + t * 0.1 - Math.sin(t * 3.1) * 0.06, hz + 0.5 + t * 0.12] });
  }

  // elevation cradle on gun joint
  const gy = 2.95;
  box(0.9, 0.04, 0.3, P.plate, [0, gy - 0.18, 1.45], gun);
  for (const s of [1, -1]) {
    b.extrude([[-0.15, 0], [0.15, 0], [0.12, 0.28], [-0.12, 0.28]], { at: [s * 0.4, gy - 0.18, 1.35], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, color: ARMOR, bone: gun });
    cyl(0.07, 0.07, 0.06, 8, STEEL, [s * 0.4, gy - 0.05, 1.35], gun, [1, 0, 0]);
  }
  box(0.7, 0.2, 0.3, ARMOR, [0, gy - 0.05, 1.3], gun);
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.3), P.trim, { bone: gun, at: [0, gy + 0.06, 1.3], texture: hazard });

  // twin autocannons
  for (const s of [1, -1]) {
    const x = s * 0.2;
    b.rod([x, gy - 0.05, 1.45], [x, gy - 0.05, 2.28], 0.045, GUN, { bone: gun, sides: 8 });
    cyl(0.06, 0.06, 0.34, 8, DARKP, [x, gy - 0.05, 1.7], gun, [0, 0, 1]);
    // heat sink fins
    for (let k = 0; k < 6; k++) cyl(0.07, 0.07, 0.016, 8, P.steel, [x, gy - 0.05, 1.55 + k * 0.045], gun, [0, 0, 1]);
    for (let k = 0; k < 5; k++) cyl(0.062, 0.062, 0.018, 6, P.hullDark, [x, gy - 0.05, 1.95 + k * 0.05], gun, [0, 0, 1]);
    // muzzle brake
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 6), P.hullDark, { bone: gun, at: [x, gy - 0.05, 2.33], dir: [0, 0, 1], flat: true });
    box(0.17, 0.03, 0.06, P.steel, [x, gy - 0.05, 2.33], gun);
    box(0.03, 0.17, 0.06, P.steel, [x, gy - 0.05, 2.33], gun);
    glow(b.part(new THREE.CircleGeometry(0.03, 6), P.ember, { bone: gun, at: [x, gy - 0.05, 2.405], dir: [0, 0, 1], axis: "z" }), 1.5);
    // magazine glow stripe
    glow(box(0.012, 0.012, 0.3, P.neonMagenta, [x + s * 0.07, gy - 0.05, 1.6], gun), 1.5);
  }
  glow(box(0.5, 0.012, 0.012, P.neonCyan, [0, gy + 0.045, 1.45], gun), 1.5);
}
    return buildTurretAndRoofWeapons;
  })(),
  // cargoBedAndRear
  (() => {
function buildCargoBedAndRear({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(77);
  const BASE = M.bedFloor[1]; // 1.35
  const CAMO = "#3d4a2e";
  const CAMO2 = "#5a6a43";
  const CRATE = "#5c6648";
  const CRATE2 = "#2e3524";
  const BELT = "#2a2d33";

  const hullPanel = panelled(metal("iron"), { size: 0.3, rivets: 0.07 });
  const plateP = panelled(P.plate, { size: 0.25, rivets: 0.06 });
  const camoP = paint((p, _n) => {
    const a = noise(p, 0.35, 3);
    const c = noise(p, 0.15, 9);
    return a > 0.6 ? mix(CAMO, "#2b3320", smoothstep(0.5, 0.8, c)) : a > 0.4 ? CAMO2 : CAMO;
  });

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, flat: true, ...opts });

  // textures
  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#111"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const stencil = (txt: string, col: string) =>
    svg(
      `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="${CRATE}"/><rect x="2" y="2" width="60" height="36" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="6 2"/><text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="${col}">${txt}</text><path d="M4 4 L12 4 L4 12Z" fill="${P.warnRed}"/></svg>`,
      { size: 128 },
    );
  const crateTexA = stencil("AMMO", P.white);
  const crateTexB = stencil("爆 77", P.trim);
  const warnTex = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 3 L46 44 H2Z" fill="${P.trim}" stroke="#111" stroke-width="3"/><rect x="22" y="16" width="4" height="15" fill="#111"/><rect x="22" y="35" width="4" height="4" fill="#111"/></svg>`,
    { size: 96 },
  );
  const unitTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#1f242c"/><text x="32" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="${P.neonCyan}">MX-77</text></svg>`,
    { size: 128 },
  );
  const screenTex = svg(
    `<svg viewBox="0 0 32 24"><rect width="32" height="24" fill="#021a20"/><path d="M0 12 H8 L11 4 L15 20 L19 8 L22 12 H32" stroke="${P.neonCyan}" stroke-width="1.5" fill="none"/><circle cx="26" cy="5" r="2" fill="${P.neonMagenta}"/></svg>`,
    { size: 96 },
  );
  const dishTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#cfd5dd"/>${[8, 16, 24]
      .map((r) => `<circle cx="32" cy="32" r="${r}" fill="none" stroke="#7d8794" stroke-width="2"/>`)
      .join("")}<circle cx="32" cy="32" r="4" fill="${P.warnRed}"/></svg>`,
    { size: 128 },
  );

  const flatTex = (tex: any, w: number, h: number, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", up, texture: tex });

  // ---------- floor deck ----------
  box(2.3, 0.1, 3.9, hullPanel, [0, BASE + 0.05, -1.75]);
  box(2.0, 0.04, 3.6, P.hullDark, [0, BASE + 0.12, -1.75]);
  for (let i = 0; i < 7; i++) box(2.1, 0.03, 0.05, P.plate, [0, BASE + 0.15, -3.4 + i * 0.52]); // deck ribs

  // ---------- side walls (angled, flaring out) ----------
  for (const s of [1, -1]) {
    const wall = b.frustumBox(
      [s * 1.15, BASE + 0.1, -1.75 - 0, ].map((v, i) => (i === 2 ? -1.75 : v)) as any,
      [s * 1.2, BASE + 0.1, -1.75] as any,
      [0.1, 0.1],
      [0.1, 0.1],
      { bone: body, color: P.hull },
    );
    void wall;
    // main wall slab, leaning outward
    const w = b.part(new THREE.BoxGeometry(0.1, 0.62, 3.7), plateP, {
      bone: body,
      at: [s * 1.2, BASE + 0.4, -1.75],
      rotation: [0, 0, -s * 8],
      flat: true,
    });
    void w;
    // top rail
    box(0.16, 0.08, 3.74, P.hullDark, [s * 1.25, BASE + 0.73, -1.75]);
    // hazard strip on wall
    flatTex(stripeTex, 3.4, 0.1, [s * 1.275, BASE + 0.58, -1.75], [s, 0, 0], [0, 1, 0]).mesh.rotation.z += 0;
    // ribs
    for (let i = 0; i < 6; i++) box(0.05, 0.56, 0.08, P.plate, [s * 1.26, BASE + 0.38, -3.4 + i * 0.64], { rotation: [0, 0, -s * 8] });
    // rivet studs
    const rv: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++)
      rv.push(new THREE.SphereGeometry(0.018, 5, 3).translate(s * 1.3, BASE + 0.22, -3.5 + i * 0.26));
    // tie-down rings
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), P.steel, {
        bone: body,
        at: [s * 1.3, BASE + 0.58, -3.2 + i * 0.9],
        rotation: [0, 90, 0],
      });
    }
    // neon strip under rail
    glow(box(0.03, 0.03, 3.5, s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.31, BASE + 0.67, -1.75]), 1.5);
    // floodlight on rail
    box(0.14, 0.12, 0.14, P.hullDark, [s * 1.25, BASE + 0.84, -0.2]);
    glow(box(0.1, 0.08, 0.04, P.white, [s * 1.25, BASE + 0.85, -0.12]), 1.8);
  }
  // front wall (cab rear side)
  box(2.4, 0.9, 0.12, plateP, [0, BASE + 0.55, 0.4]);
  box(2.2, 0.08, 0.2, P.trim, [0, BASE + 1.03, 0.38]);
  flatTex(unitTex, 0.5, 0.25, [0, BASE + 0.62, 0.3], [0, 0, -1]);
  flatTex(warnTex, 0.22, 0.22, [0.8, BASE + 0.6, 0.3], [0, 0, -1]);
  flatTex(screenTex, 0.3, 0.22, [-0.8, BASE + 0.6, 0.3], [0, 0, -1]);

  // ---------- tailgate (folded down) ----------
  box(2.4, 0.08, 0.7, plateP, [0, BASE + 0.1, -4.05 + 0.34], { rotation: [0, 0, 0] });
  b.part(new THREE.PlaneGeometry(2.2, 0.16), "#ffffff", {
    bone: body, at: [0, BASE + 0.15, -3.9], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: stripeTex,
  });
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 0.14, 6, P.steel, [s * 1.15, BASE + 0.12, -3.72], { rotation: [0, 0, 90] }); // hinge
    box(0.12, 0.1, 0.1, P.trim, [s * 0.6, BASE + 0.18, -4.0]); // latch
    box(0.06, 0.06, 0.12, P.steel, [s * 0.6, BASE + 0.24, -4.0]);
  }
  // rear taillight upright rails
  for (const s of [1, -1]) box(0.12, 0.7, 0.1, P.hullDark, [s * 1.2, BASE + 0.4, -3.65]);

  // ---------- rocket pod rack ----------
  const launcherZ = -0.7;
  const podY = BASE + 0.95;
  box(2.0, 0.1, 1.5, P.hullDark, [0, BASE + 0.2, launcherZ]); // base
  cyl(0.07, 0.07, 0.6, 6, P.steel, [0.6, BASE + 0.45, launcherZ + 0.1], { rotation: [-22, 0, 0] }); // hydraulics
  cyl(0.07, 0.07, 0.6, 6, P.steel, [-0.6, BASE + 0.45, launcherZ + 0.1], { rotation: [-22, 0, 0] });
  cyl(0.04, 0.04, 0.5, 6, P.neonCyan, [0.6, BASE + 0.5, launcherZ + 0.1], { rotation: [-22, 0, 0] });
  glow(cyl(0.035, 0.035, 0.5, 6, P.neonCyan, [-0.6, BASE + 0.5, launcherZ + 0.1], { rotation: [-22, 0, 0] }), 1.4);
  for (const s of [1, -1]) {
    box(0.08, 0.6, 0.1, P.plate, [s * 0.95, BASE + 0.5, launcherZ + 0.55]);
    box(0.08, 0.6, 0.1, P.plate, [s * 0.95, BASE + 0.5, launcherZ - 0.55]);
  }
  box(2.05, 0.08, 0.1, P.steel, [0, BASE + 0.8, launcherZ + 0.6]);
  const tilt = -14;
  for (const s of [1, -1]) {
    const px = s * 0.5;
    box(0.9, 0.9, 1.4, hullPanel, [px, podY, launcherZ], { rotation: [tilt, 0, 0] });
    // front/back bands
    for (const zz of [-0.45, 0.2]) box(0.94, 0.94, 0.08, P.warnRed, [px, podY, launcherZ + zz], { rotation: [tilt, 0, 0] });
    box(0.94, 0.05, 1.42, P.trim, [px, podY + 0.45, launcherZ], { rotation: [tilt, 0, 0] });
    // missiles 3x3 (nose cones visible at the rear-facing tilt? pods fire backward toward -Z)
    const dirv = new THREE.Vector3(0, Math.sin((-tilt * Math.PI) / 180), -Math.cos((tilt * Math.PI) / 180)).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3(1, 0, 0);
    const upv = new THREE.Vector3().crossVectors(right, dirv).normalize();
    void up;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const o = new THREE.Vector3(px, podY, launcherZ)
          .addScaledVector(right, (i - 1) * 0.28)
          .addScaledVector(upv, (j - 1) * 0.28)
          .addScaledVector(dirv, 0.72);
        const tip = o.clone().addScaledVector(dirv, 0.06);
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.hullDark, { bone: body, at: o.toArray(), dir: dirv.toArray(), flat: true });
        b.part(new THREE.ConeGeometry(0.075, 0.18, 6), (i + j) % 2 ? P.olive : P.white, {
          bone: body, at: tip.toArray(), dir: dirv.toArray(), flat: true,
        });
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 5), P.warnRed, {
          bone: body, at: o.clone().addScaledVector(dirv, 0.1).toArray(), dir: dirv.toArray(),
        });
      }
    flatTex(warnTex, 0.25, 0.25, [px, podY + 0.1, launcherZ + 0.74], [0, 0.2, 1]);
  }

  // ---------- ammo crates ----------
  const crateDefs: [number, number, number, number, any][] = [
    [0.85, BASE + 0.35, -2.05, 0, crateTexA],
    [0.85, BASE + 0.35, -2.6, 8, crateTexB],
    [0.85, BASE + 0.85, -2.3, -6, crateTexA],
    [0.2, BASE + 0.35, -2.4, 3, crateTexB],
  ];
  for (const [x, y, z, ry, tex] of crateDefs) {
    box(0.7, 0.5, 0.5, CRATE, [x, y, z], { rotation: [0, ry, 0] });
    box(0.72, 0.06, 0.52, CRATE2, [x, y + 0.2, z], { rotation: [0, ry, 0] });
    b.part(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", {
      bone: body, at: [x + 0.0, y, z + 0.256], dir: [0, 0, 1], axis: "z", texture: tex, rotation: undefined,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", {
      bone: body, at: [x, y, z - 0.256], dir: [0, 0, -1], axis: "z", texture: tex,
    });
    box(0.08, 0.04, 0.3, P.steel, [x, y + 0.27, z], { rotation: [0, ry, 0] }); // handle
  }

  // ---------- tarp cargo (camo) ----------
  const tarp = b.loft(
    [
      { at: [-0.85, BASE + 0.4, -1.3 - 1.5], w: 0.5, h: 0.5 },
      { at: [-0.85, BASE + 0.62, -2.15 - 0.2], w: 0.6, h: 0.9 },
      { at: [-0.85, BASE + 0.45, -3.3], w: 0.5, h: 0.5 },
    ].map((s) => ({ ...s, at: [-0.7, s.at[1], s.at[2] - 0.0] })),
    { bone: body, color: camoP, section: "box" } as any,
  );
  void tarp;
  box(0.9, 0.5, 1.0, camoP, [-0.65, BASE + 0.4, -3.15]);
  box(0.8, 0.12, 0.9, CAMO2, [-0.65, BASE + 0.7, -3.15], { rotation: [0, 5, 3] });
  for (const z of [-2.95, -3.35]) box(0.95, 0.54, 0.05, BELT, [-0.65, BASE + 0.4, z]);

  // ---------- cable roll ----------
  cyl(0.28, 0.28, 0.4, 10, "#202228", [0.6, BASE + 0.4, -3.35], { rotation: [0, 0, 90] });
  cyl(0.15, 0.15, 0.44, 8, P.steel, [0.6, BASE + 0.4, -3.35], { rotation: [0, 0, 90] });
  cyl(0.3, 0.3, 0.04, 10, P.trim, [0.4, BASE + 0.4, -3.35], { rotation: [0, 0, 90] });
  cyl(0.3, 0.3, 0.04, 10, P.trim, [0.8, BASE + 0.4, -3.35], { rotation: [0, 0, 90] });
  // jerrycans
  for (let i = 0; i < 3; i++) {
    const x = 0.2 + i * 0.0, z = -3.5 + 0.0;
    void x; void z;
  }
  for (let i = 0; i < 3; i++) {
    const jx = 0.95 - i * 0.05, jz = -2.7 - i * 0.0;
    void jx; void jz;
  }
  const jcs = [[0.35, -3.5], [0.35, -3.0]];
  jcs.forEach(([jx, jz], i) => {
    box(0.32, 0.5, 0.18, i ? P.olive : P.warnRed, [jx, BASE + 0.35, jz], { rotation: [0, 90, 0] });
    box(0.1, 0.08, 0.08, P.steel, [jx, BASE + 0.63, jz]);
    box(0.34, 0.04, 0.2, BELT, [jx, BASE + 0.35, jz], { rotation: [0, 90, 0] });
  });

  // ---------- sensor mast ----------
  const mb = M.mastBase;
  cyl(0.18, 0.22, 0.12, 8, P.hullDark, [mb[0], mb[1] + 0.06, mb[2]]);
  const mast = b.rod([mb[0], mb[1] + 0.1, mb[2]], [mb[0], 2.85, mb[2]], [0.06, 0.035], { bone: body, color: P.steel, sides: 6 } as any);
  void mast;
  for (let i = 0; i < 4; i++) cyl(0.075, 0.075, 0.04, 6, P.trim, [mb[0], 1.8 + i * 0.28, mb[2]]);
  for (const [a, y] of [[0, 2.2], [120, 2.5], [240, 2.7]] as number[][]) {
    const r = (a * Math.PI) / 180;
    b.rod([mb[0], y, mb[2]], [mb[0] + Math.sin(r) * 0.22, y + 0.02, mb[2] + Math.cos(r) * 0.22], 0.012, P.steel, { bone: body });
  }
  // dish
  const dishAt = [mb[0], 2.4, mb[2] - 0.08];
  b.part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.2), P.white, {
    bone: body, at: dishAt, dir: [0.2, 0.3, -1], axis: "y", rotation: undefined, flat: true,
  });
  b.part(new THREE.CircleGeometry(0.27, 8), "#ffffff", {
    bone: body, at: [dishAt[0], dishAt[1] + 0.0, dishAt[2] - 0.0], dir: [0, 0.1, 1], axis: "z", texture: dishTex,
  });
  b.rod([dishAt[0], dishAt[1], dishAt[2] + 0.02], [dishAt[0], dishAt[1] + 0.05, dishAt[2] + 0.36], 0.01, P.steel, { bone: body });
  box(0.05, 0.05, 0.05, P.steel, [dishAt[0], dishAt[1] + 0.05, dishAt[2] + 0.38]);
  // beacon + lights
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), P.warnRed, { bone: body, at: [mb[0], 2.93, mb[2]], flat: true }), 2);
  glow(cyl(0.09, 0.09, 0.05, 6, P.neonMagenta, [mb[0], 2.1, mb[2]]), 1.8);
  glow(cyl(0.09, 0.09, 0.05, 6, P.neonMagenta, [mb[0], 1.6, mb[2]]), 1.8);

  // ---------- big radar dish on pole (right side, rear) ----------
  const rp = [0.85, BASE, -2.0];
  cyl(0.08, 0.1, 0.9, 6, P.steel, [rp[0], rp[1] + 0.45 + 0.1, rp[2]]);
  cyl(0.15, 0.17, 0.1, 6, P.hullDark, [rp[0], rp[1] + 0.12, rp[2]]);
  box(0.26, 0.14, 0.2, P.hullDark, [rp[0], rp[1] + 1.0, rp[2]]);
  cyl(0.03, 0.03, 0.4, 6, P.steel, [rp[0], rp[1] + 1.15, rp[2]], { rotation: [0, 0, 90] });
  b.part(new THREE.SphereGeometry(0.4, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), P.plate, {
    bone: body, at: [rp[0], rp[1] + 1.25, rp[2]], dir: [0.3, 0.5, 1], axis: "y", flat: true,
  });
  b.part(new THREE.CircleGeometry(0.36, 10), "#ffffff", {
    bone: body, at: [rp[0] + 0.03, rp[1] + 1.3, rp[2] + 0.06], dir: [0.3, 0.45, 1], axis: "z", texture: dishTex,
  });
  glow(box(0.05, 0.05, 0.05, P.neonCyan, [rp[0] + 0.12, rp[1] + 1.52, rp[2] + 0.4]), 1.8);

  // ---------- rear rack with spare wheel ----------
  const rz = -3.62;
  for (const s of [1, -1]) {
    b.rod([s * 0.8, BASE + 0.1, rz], [s * 0.8, BASE + 1.25, rz], 0.04, P.steel, { bone: body });
    b.rod([s * 0.8, BASE + 1.25, rz], [s * 0.8, BASE + 1.25, rz + 0.25], 0.03, P.steel, { bone: body });
  }
  b.rod([-0.8, BASE + 1.25, rz], [0.8, BASE + 1.25, rz], 0.035, P.steel, { bone: body });
  b.rod([-0.8, BASE + 0.7, rz], [0.8, BASE + 0.7, rz], 0.03, P.steel, { bone: body });
  const wheelC = [0, BASE + 0.82, rz - 0.04];
  cyl(0.38, 0.38, 0.26, 10, P.rubber, wheelC, { rotation: [90, 0, 0] });
  cyl(0.22, 0.22, 0.28, 8, P.steel, wheelC, { rotation: [90, 0, 0] });
  glow(cyl(0.1, 0.1, 0.3, 8, P.neonCyan, wheelC, { rotation: [90, 0, 0] }), 1.4);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    box(0.06, 0.08, 0.28, "#0c0c0f", [wheelC[0] + Math.sin(a) * 0.38, wheelC[1] + Math.cos(a) * 0.38, wheelC[2]], {
      rotation: [0, 0, -(a * 180) / Math.PI],
    });
  }
  // rear lights bar and beacon strip
  glow(box(1.9, 0.05, 0.04, P.neonMagenta, [0, BASE + 0.02, -3.74]), 1.6);
  for (const s of [1, -1]) {
    box(0.22, 0.12, 0.1, P.hullDark, [s * 1.1, BASE + 0.8, -3.7]);
    glow(box(0.16, 0.07, 0.04, P.warnRed, [s * 1.1, BASE + 0.8, -3.76]), 1.6);
    box(0.2, 0.16, 0.2, P.hullDark, [s * 1.0, BASE + 1.0, -3.55]); // floodlight housing
    glow(box(0.14, 0.1, 0.04, P.white, [s * 1.0, BASE + 1.0, -3.66]), 1.8);
  }
  // roof-less rack top: tiny greeble plates
  for (let i = 0; i < 6; i++) box(0.2, 0.03, 0.14, P.plate, [-0.6 + i * 0.24, BASE + 1.28, rz]);
}
    return buildCargoBedAndRear;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhoundTruck2077" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.62,2.5], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.62,2.5], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.15,0.62,-1.1], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.15,0.62,-1.1], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.62,-2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.62,-2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.6,0.9], dir: [0,1,0], role: "hinge", group: "turret" });
  J["turretGun"] = b.joint("turretGun", { parent: J["turretYaw"], at: [0,2.95,1], dir: [0,0,1], role: "hinge", group: "turret" });
  J["doorL"] = b.joint("doorL", { parent: J["body"], at: [1.05,1.6,1.9], dir: [0,1,0], role: "hinge", group: "cab" });
  J["doorR"] = b.joint("doorR", { parent: J["body"], at: [-1.05,1.6,1.9], dir: [0,1,0], role: "hinge", group: "cab" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
