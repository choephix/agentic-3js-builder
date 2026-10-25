import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, bezier } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hoverback Raider",
  "description": "A militarized pickup truck converted to ride on four ducted hover thrusters, low-poly cyberpunk with neon underglow, armor plates and a roof-mounted gun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3b4250",
  hullDark: "#20242e",
  hullLight: "#5a6475",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  glass: "#1b3a52",
  rubber: "#15161a",
  rust: "#8a4a2a",
  steel: "#9aa4b4",
  lampWhite: "#fff6d0",
  lampRed: "#ff2a3a",
  olive: "#4f5a3a",
};
const M = {
  chassisTop: [0, 1, 0] as [number, number, number],
  hoodFront: [0, 1, 2.8] as [number, number, number],
  cabFloor: [0, 1, 0.6] as [number, number, number],
  cabRear: [0, 1, -0.6] as [number, number, number],
  bedFloor: [0, 1.05, -1.6] as [number, number, number],
  bedFront: [0, 1.05, -0.65] as [number, number, number],
  roofTop: [0, 1.95, 0.2] as [number, number, number],
  gunMount: [0, 1.35, -1.9] as [number, number, number],
  thrusterFL: [1.05, 0.5, 1.9] as [number, number, number],
  thrusterFR: [-1.05, 0.5, 1.9] as [number, number, number],
  thrusterBL: [1.05, 0.5, -1.7] as [number, number, number],
  thrusterBR: [-1.05, 0.5, -1.7] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const scuff = (base: string) =>
    paint((p, n) => {
      let c = mix(base, "#ffffff", 0.08 * noise(p, 0.05, 3));
      const low = smoothstep(0.85, 0.5, p.y);
      c = mix(c, P.rust, low * smoothstep(0.45, 0.7, noise(p, 0.12, 9)) * 0.8);
      return c;
    });
  const HULL = panelled(scuff(P.hull), { size: 0.4, rivets: 0.06 });
  const DARK = panelled(scuff(P.hullDark), { size: 0.3, rivets: 0.05 });
  const STEEL = metal("steel", { tarnish: 0.4 });

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true, ...extra });

  // underbody slab and skid plate
  box(2.0, 0.28, 5.2, DARK, [0, 0.62, 0]);
  box(1.5, 0.08, 4.4, STEEL, [0, 0.45, 0]);
  box(2.3, 0.2, 5.4, HULL, [0, 0.88, 0]);
  // skirts and sills
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#15161a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const kanji = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#20242e"/><text x="32" y="13" text-anchor="middle" font-size="13" font-weight="bold" fill="#e7b814">装甲 07</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    box(0.12, 0.32, 3.2, HULL, [s * 1.18, 0.72, 0]);
    box(0.1, 0.1, 3.0, P.trim, [s * 1.2, 0.9, 0]);
    // hazard decal on skirt
    b.part(new THREE.PlaneGeometry(2.6, 0.12), "#ffffff", {
      bone,
      at: [s * 1.245, 0.72, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: hazard,
    });
    b.part(new THREE.PlaneGeometry(0.9, 0.12), "#ffffff", {
      bone,
      at: [s * 1.246, 0.58, 0.9],
      dir: [s, 0, 0],
      axis: "z",
      texture: kanji,
    });
    // underglow strips
    glow(box(0.06, 0.05, 3.4, s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.0, 0.44, 0]), 1.6);
    glow(box(0.06, 0.05, 3.4, s > 0 ? P.neonMagenta : P.neonCyan, [s * 0.6, 0.44, 0]), 1.2);
    // vents on the side
    for (let i = 0; i < 5; i++) box(0.04, 0.16, 0.05, P.rubber, [s * 1.215, 0.98, -1.6 + i * 0.12]);
    // struts to thrusters (bridges)
    for (const z of [1.9, -1.7]) {
      b.rod([s * 1.0, 0.8, z], [s * 0.85, 0.62, z], 0.1, P.hullDark, { bone, sides: 6 });
      const sx = s * 1.05;
      b.rod([s * 0.85, 0.7, z], [sx, 0.62, z], 0.07, STEEL, { bone, sides: 6 });
      box(0.5, 0.1, 0.7, HULL, [s * 1.0, 0.92, z]);
      // fender-like arch brace
      box(0.12, 0.3, 0.8, DARK, [s * 1.08, 0.78, z]);
    }
    // tow hooks
    for (const z of [2.72, -2.72])
      b.part(new THREE.TorusGeometry(0.06, 0.018, 5, 8), STEEL, { bone, at: [s * 0.7, 0.62, z], rotation: [0, 0, 0] });
    // bull bar uprights
    box(0.08, 0.5, 0.08, STEEL, [s * 0.65, 0.7, 2.95]);
  }
  // front bumper, bull bar, plow wedge
  box(2.3, 0.3, 0.3, DARK, [0, 0.72, 2.72]);
  box(2.1, 0.07, 0.1, STEEL, [0, 0.95, 2.95]);
  box(2.1, 0.07, 0.1, STEEL, [0, 0.5, 2.95]);
  box(0.9, 0.1, 0.1, P.trim, [0, 0.72, 2.9]);
  b.extrude(
    [
      [-1.15, 0],
      [1.15, 0],
      [0.9, 0.22],
      [-0.9, 0.22],
    ],
    { at: [0, 0.4, 2.75], x: [1, 0, 0], y: [0, 0, 1], thickness: [0.02, 0.2], color: P.hullLight, bone },
  );
  // plow wedge (angled forward)
  box(2.0, 0.08, 0.5, P.hullLight, [0, 0.52, 3.0], [-25, 0, 0]);
  // rear bumper
  box(2.3, 0.28, 0.25, DARK, [0, 0.74, -2.7]);
  box(1.8, 0.08, 0.1, P.trim, [0, 0.88, -2.84]);
  glow(box(1.5, 0.05, 0.05, P.neonMagenta, [0, 0.56, -2.8]), 1.5);
  // exhaust vents rear
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.22, 8), P.rubber, { bone, at: [s * 0.6, 0.66, -2.72], rotation: [90, 0, 0] });
    glow(b.part(new THREE.CircleGeometry(0.08, 8), P.neonCyan, { bone, at: [s * 0.6, 0.66, -2.84], dir: [0, 0, -1], axis: "z" }), 1.4);
  }
  // heat vents under hood
  for (let i = 0; i < 6; i++) box(1.0, 0.03, 0.05, P.rubber, [0, 0.995, 1.2 + i * 0.12]);
  return;
}
    return buildChassis;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: Ctx) {
  const NOZZLE = "#bfeaff";

  // Scuffed gunmetal: cool underside, lighter top, rust near the bottom edge.
  const shroudPaint = paint((p, n) => {
    const base = mix(P.hullDark, P.hull, smoothstep(-0.4, 0.9, n.y) * 0.8 + noise(p, 0.12, 3) * 0.3);
    const rustAmt = smoothstep(0.2, 0.02, p.y) * smoothstep(0.4, 0.7, noise(p, 0.06, 8));
    return mix(base, P.rust, rustAmt * 0.8);
  });
  const armPaint = paint((p, n) =>
    mix(P.hullLight, P.hullDark, 0.3 + 0.4 * smoothstep(0.6, -0.6, n.y) + 0.2 * noise(p, 0.05, 5)),
  );

  // Concentric-ring drawing for the glowing core disc.
  const coreTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#2ff3ff"/>
     <circle cx="50" cy="50" r="38" fill="none" stroke="#e8ffff" stroke-width="3"/>
     <circle cx="50" cy="50" r="26" fill="none" stroke="#0b9fb8" stroke-width="3"/>
     <circle cx="50" cy="50" r="14" fill="#aafcff"/>
     <path d="M50 4V96M4 50H96" stroke="#0b9fb8" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  const shroudProfile: [number, number][] = [
    [0.35, 0.03], [0.45, 0.03], [0.48, 0.3], [0.45, 0.5], [0.36, 0.48], [0.34, 0.3],
  ];
  const ringProfile: [number, number][] = [
    [0.465, 0.27], [0.495, 0.27], [0.495, 0.31], [0.465, 0.31],
  ];

  const yawQ = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a);
  const rotZQ = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a);

  const pod = (id: string, s: number) => {
    const m = M["thruster" + id];
    const bone = J["thruster" + id];
    const cx = m[0];
    const cz = m[2];
    const at = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];

    // Octagonal ring shroud.
    b.lathe(shroudProfile, { at: at(0, 0, 0), segments: 8, spin: 22.5, color: shroudPaint, bone, name: "shroud" + id });
    glow(b.lathe(ringProfile, { at: at(0, 0, 0), segments: 8, spin: 22.5, color: P.neonMagenta, bone }), 1.4);

    // Glowing core disc.
    glow(
      b.part(new THREE.CircleGeometry(0.34, 16), "#ffffff", {
        bone, at: at(0, 0.24, 0), dir: [0, 1, 0], axis: "z", texture: coreTex,
      }),
      1.3,
    );

    // Stator hub + struts.
    b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.16, 8), P.steel, { bone, at: at(0, 0.28, 0) });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.34, 0.015, 0.035), P.hullLight, {
        bone, at: at(0, 0.2, 0), quat: yawQ((i * Math.PI) / 4),
      });
    }
    // Fan: 8 angled blades.
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const q = yawQ(a).multiply(rotZQ(0.45));
      b.part(new THREE.BoxGeometry(0.07, 0.012, 0.22), P.steel, {
        bone, at: at(Math.sin(a) * 0.19, 0.3, Math.cos(a) * 0.19), quat: q,
      });
    }
    // Intake grille bars across the top, clipped to the opening.
    for (let i = -2; i <= 2; i++) {
      const x = i * 0.13;
      const w = 2 * Math.sqrt(Math.max(0.37 * 0.37 - x * x, 0.01));
      b.part(new THREE.BoxGeometry(0.024, 0.03, w), P.hullDark, { bone, at: at(x, 0.49, 0) });
    }
    // Trim chevrons around the top rim.
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      b.part(new THREE.BoxGeometry(0.1, 0.014, 0.05), P.trim, {
        bone, at: at(Math.sin(a) * 0.405, 0.505, Math.cos(a) * 0.405),
        quat: yawQ(a + (i % 2 ? 0.5 : -0.5)),
      });
    }
    // Vent fins on the outside.
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      for (const dy of [0.14, 0.2]) {
        b.part(new THREE.BoxGeometry(0.1, 0.012, 0.035), P.hullDark, {
          bone, at: at(Math.sin(a) * 0.485, dy, Math.cos(a) * 0.485), quat: yawQ(a + Math.PI / 2),
        });
      }
    }
    // Downward cone nozzle, tip touches the floor.
    glow(
      b.part(new THREE.ConeGeometry(0.2, 0.17, 8), NOZZLE, { bone, at: at(0, 0.085, 0), rotation: [180, 0, 0] }),
      1.6,
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 8), P.neonCyan, { bone, at: at(0, 0.175, 0) }),
      1.2,
    );

    // Mount arm to the chassis strut end at x = ±0.85.
    const sx = Math.sign(cx);
    const inner: [number, number, number] = [cx - sx * 0.46, 0.4, cz];
    const end: [number, number, number] = [sx * 0.85, 0.62, cz];
    b.rod(inner, end, 0.05, armPaint, { bone, sides: 6 });
    b.rod([cx - sx * 0.46, 0.22, cz], [sx * 0.85, 0.52, cz + (cz > 0 ? -0.06 : 0.06)], 0.03, P.hullLight, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.14), P.trim, { bone, at: [cx - sx * 0.47, 0.4, cz] });
    b.part(new THREE.BoxGeometry(0.09, 0.12, 0.12), P.hullDark, { bone, at: end });
  };

  pod("FL", 1);
  pod("FR", -1);
  pod("BL", 1);
  pod("BR", -1);
}
    return buildThrusters;
  })(),
  // cab
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

function buildCab({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const scuff = (base: string) =>
    paint((p, n) => {
      let c: any = mix(base, P.hullLight, 0.25 * noise(p, 0.12, 3));
      c = mix(c, P.hullDark, 0.35 * smoothstep(0.55, 0.8, noise(p, 0.05, 8)));
      c = mix(c, P.rust, 0.7 * smoothstep(1.35, 1.0, p.y) * noise(p, 0.1, 5));
      c = mix(c, P.hullLight, 0.25 * smoothstep(0.6, 1, n.y));
      return c;
    });
  const HULL = panelled(scuff(P.hull), { size: 0.34, aspect: 0.8, rivets: 0.06 });
  const HULLD = panelled(scuff(P.hullDark), { size: 0.3, rivets: 0.07 });

  // ---------- textures ----------
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#15161a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const HUD = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#1b3a52"/>
    <path d="M0 40 L128 0 L128 8 L0 40Z" fill="#2ff3ff" opacity="0.15"/>
    <g stroke="#2ff3ff" stroke-width="1.2" fill="none"><path d="M10 30 H40 M88 12 H118 M60 20 H68 M64 16 V24"/><circle cx="64" cy="20" r="9"/><rect x="8" y="6" width="20" height="8"/></g>
    <g fill="#2ff3ff"><rect x="12" y="8" width="8" height="4"/><rect x="96" y="28" width="16" height="3"/></g>
    <path d="M0 0 L40 0 L0 20Z" fill="#fff" opacity="0.08"/></svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2fa8" stroke-width="4"/>
    <path d="M32 8 L50 40 L14 40Z" fill="#ff2fa8"/><path d="M32 22 L40 36 L24 36Z" fill="#20242e"/>
    <text x="32" y="58" text-anchor="middle" font-size="12" font-weight="bold" fill="#ff2fa8" font-family="sans-serif">雷</text></svg>`,
    { size: 128 },
  );
  const NUM = svg(
    `<svg viewBox="0 0 64 32"><rect x="1" y="1" width="62" height="30" fill="none" stroke="#e7b814" stroke-width="1.5" stroke-dasharray="6 2"/>
    <text x="32" y="25" text-anchor="middle" font-size="24" font-weight="bold" fill="#e7b814" font-family="monospace">07</text></svg>`,
    { size: 128 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 32 24"><rect width="32" height="24" fill="#052a30"/><path d="M2 18 L8 10 L14 15 L20 6 L30 12" stroke="#2ff3ff" stroke-width="2" fill="none"/></svg>`,
    { size: 64 },
  );
  const SLIT = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" rx="2" fill="#fff6d0"/></svg>`,
    { size: 64 },
  );
  const SHUT = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#20242e"/>${[2, 6, 10, 14]
      .map((y) => `<rect x="1" y="${y - 1}" width="30" height="1.6" fill="#5a6475"/>`)
      .join("")}</svg>`,
    { size: 64 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#0c0d10"/>${[1, 5, 9, 13]
      .map((y) => `<rect x="2" y="${y}" width="28" height="2" fill="#3b4250"/>`)
      .join("")}</svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...o });
  const tex = (w: number, h: number, t: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: t, ...o });
  const wedge = (pts: number[][], th: number, col: any, x: number, extra: any = {}) =>
    b.extrude(pts, { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: th, bone: body, color: col, ...extra });

  // ---------- main body shells (side profile in z,y) ----------
  // Hood: sloped wedge from cab front to nose.
  wedge(
    [[-0.1, 1.0], [2.8, 1.0], [2.8, 1.28], [2.3, 1.42], [0.9, 1.5], [0.8, 1.0]],
    2.3,
    HULL,
    0,
    { name: "hood" },
  );
  // Cab lower body (doors) z -0.65..0.9
  wedge([[-0.65, 1.0], [0.95, 1.0], [0.95, 1.5], [-0.65, 1.5]], 2.3, HULL, 0, { name: "cabLower" });
  // Cabin glasshouse tapering to roof
  wedge([[-0.65, 1.5], [0.95, 1.5], [0.75, 1.92], [-0.55, 1.92]], 2.0, HULLD, 0, { name: "cabUpper" });
  // roof plate
  box(1.9, 0.06, 1.2, HULL, [0, 1.95, 0.1]);
  // Rear wall of the cab
  box(2.3, 0.62, 0.08, HULLD, [0, 1.75, -0.66]);

  // hood centre scoop
  wedge([[1.0, 1.5], [2.0, 1.43], [2.15, 1.5], [2.05, 1.62], [1.15, 1.7]], 0.8, HULLD, 0, { name: "scoop" });
  for (const s of [1, -1]) {
    tex(0.32, 0.16, VENT, [s * 0.22, 1.725, 1.62], [0, 1, 0.12], { rotation: [-90, 0, 0] });
  }
  // hazard stripe along hood
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.16, 1.6), "#ffffff", {
      bone: body,
      at: [s * 0.52, 1.505, 1.65],
      dir: [0, 1, 0.12],
      axis: "z",
      texture: HAZ,
      rotation: [-90 - 7, 0, 90],
    });
  // hood side vents
  for (const s of [1, -1]) tex(0.5, 0.16, VENT, [s * 1.156, 1.3, 1.5], [s, 0, 0]);

  // ---------- front face ----------
  box(2.2, 0.34, 0.12, HULLD, [0, 1.17, 2.8]); // grille block
  for (const s of [1, -1]) {
    // headlights
    glow(box(0.4, 0.16, 0.06, P.lampWhite, [s * 0.8, 1.22, 2.87]), 1.8);
    box(0.46, 0.22, 0.04, P.trim, [s * 0.8, 1.22, 2.84]);
  }
  for (const i of [0, 1, 2]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.7, 0.06), "#ffffff", {
        bone: body, at: [0, 1.1 + i * 0.07, 2.866], dir: [0, 0, 1], axis: "z", texture: SLIT,
      }),
      1.5,
    );
  }
  // upper nose lip & magenta strip
  box(2.3, 0.07, 0.2, P.trim, [0, 1.44, 2.72]);
  glow(box(1.6, 0.03, 0.03, P.neonMagenta, [0, 1.0 + 0.08, 2.87]), 2);
  // front bull teeth
  for (const s of [-0.5, -0.25, 0, 0.25, 0.5])
    b.spike([s, 1.0, 2.86], [0, -1, 0.3], 0.1, 0.03, { color: P.steel, bone: body });

  // ---------- windshield ----------
  b.part(new THREE.PlaneGeometry(1.8, 0.5), "#ffffff", {
    bone: body, at: [0, 1.7, 0.905], dir: [0, 0.62, 0.78], axis: "z", texture: HUD,
  });
  glow(
    b.part(new THREE.PlaneGeometry(1.8, 0.5), "#ffffff", {
      bone: body, at: [0, 1.7, 0.9], dir: [0, 0.62, 0.78], axis: "z", texture: HUD,
    }),
    0.7,
  );
  // windshield frame
  for (const s of [1, -1]) {
    b.rod([s * 0.93, 1.49, 0.99], [s * 0.88, 1.93, 0.74], 0.04, P.hullDark, { bone: body });
  }
  b.rod([-0.92, 1.93, 0.74], [0.92, 1.93, 0.74], 0.04, P.hullDark, { bone: body });
  b.rod([-0.96, 1.5, 1.0], [0.96, 1.5, 1.0], 0.04, P.trim, { bone: body });
  // armour slits above windshield
  box(1.5, 0.05, 0.05, P.hullDark, [0, 1.9, 0.78], { rotation: [38, 0, 0] });

  // ---------- sides ----------
  for (const s of [1, -1]) {
    const X = s * 1.156;
    // door lines
    box(0.02, 0.5, 0.02, P.hullDark, [X, 1.25, 0.9]);
    box(0.02, 0.5, 0.02, P.hullDark, [X, 1.25, 0.3]);
    box(0.02, 0.5, 0.02, P.hullDark, [X, 1.25, -0.4]);
    box(0.02, 0.02, 1.3, P.hullDark, [X, 1.0, 0.25]);
    // sill trim
    box(0.06, 0.06, 1.55, P.trim, [s * 1.17, 1.04, 0.15]);
    // side window w/ shutter half open
    const gl = b.part(new THREE.PlaneGeometry(1.0, 0.34), P.glass, {
      bone: body, at: [s * 1.0 + s * 0.004, 1.7, 0.17], dir: [s * 1, 0, 0], axis: "z",
    });
    b.part(new THREE.PlaneGeometry(1.0, 0.16), "#ffffff", {
      bone: body, at: [s * 1.003, 1.8, 0.17], dir: [s, 0, 0], axis: "z", texture: SHUT,
    });
    // handles
    box(0.05, 0.04, 0.22, P.steel, [s * 1.19, 1.38, 0.55]);
    box(0.05, 0.04, 0.22, P.steel, [s * 1.19, 1.38, -0.1]);
    // emblem + number decals
    tex(0.36, 0.36, EMBLEM, [s * 1.162, 1.22, 0.55], [s, 0, 0]);
    tex(0.4, 0.2, NUM, [s * 1.162, 1.22, -0.1], [s, 0, 0]);
    // hazard rocker band
    b.part(new THREE.PlaneGeometry(1.5, 0.08), "#ffffff", {
      bone: body, at: [X + s * 0.006, 1.075, 0.2], dir: [s, 0, 0], axis: "z", texture: HAZ,
    });
    // wing mirror
    b.rod([s * 1.1, 1.58, 0.82], [s * 1.38, 1.62, 0.9], 0.02, P.hullDark, { bone: body });
    box(0.06, 0.2, 0.26, P.hullDark, [s * 1.42, 1.63, 0.92]);
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.15), "#ffffff", {
        bone: body, at: [s * 1.452, 1.63, 0.92], dir: [s, 0, 0], axis: "z", texture: SCREEN,
      }),
      1.5,
    );
    // fender flares over thrusters (arched wedge)
    wedge(
      [[1.4, 1.0], [1.55, 1.18], [1.9, 1.3], [2.3, 1.18], [2.45, 1.0], [2.25, 1.0], [1.9, 1.12], [1.6, 1.0]],
      0.16,
      HULLD,
      s * 1.2,
      { name: "flare" },
    );
    // side exhaust stacks behind cab
    b.rod([s * 1.2, 1.05, -0.4], [s * 1.2, 1.88, -0.4], 0.07, P.steel, { bone: body, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.1, 0.08, 0.08, 8), P.hullDark, { bone: body, at: [s * 1.2, 1.9, -0.4] });
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), P.neonCyan, { bone: body, at: [s * 1.2, 1.94, -0.4] }), 1.2);
    for (const z of [-0.2, 0.0]) b.rod([s * 1.2, 1.2, -0.4], [s * 1.2, 1.2, z], 0.0, P.steel, { bone: body });
    // A-pillar neon trim
    glow(b.rod([s * 0.93, 1.5, 1.0], [s * 0.88, 1.93, 0.76], 0.015, P.neonCyan, { bone: body }), 1.5);
    // wheel-arch neon
    glow(box(0.02, 0.02, 1.0, P.neonMagenta, [s * 1.19, 1.0, 1.9]), 1.6);
  }

  // ---------- roof ----------
  // rack rails
  for (const s of [1, -1]) box(0.04, 0.08, 1.0, P.steel, [s * 0.7, 2.03, 0.1]);
  for (const z of [-0.35, 0.1, 0.55]) box(1.46, 0.04, 0.05, P.steel, [0, 2.05, z]);
  // light bar
  box(1.5, 0.1, 0.12, P.hullDark, [0, 2.1, 0.62]);
  for (let i = 0; i < 6; i++) {
    glow(box(0.2, 0.06, 0.04, i % 2 ? P.neonMagenta : P.neonCyan, [-0.62 + i * 0.25, 2.1, 0.69]), 2);
  }
  // roof plate hazard
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    bone: body, at: [0, 1.985, -0.3], dir: [0, 1, 0], axis: "z", texture: NUM, rotation: [-90, 0, 0],
  });
  // antennas
  for (const s of [1, -1]) {
    const h = s > 0 ? 0.55 : 0.4;
    b.spike([s * 0.8, 1.97, -0.45], [s * 0.06, 1, -0.1], h, 0.012, { color: P.steel, bone: body });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: body, at: [s * 0.8 + s * 0.03, 1.97 + h, -0.45 - 0.05] });
  }
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonMagenta, { bone: body, at: [0.83, 2.52, -0.5] }), 2);

  // ---------- bed meeting face ----------
  for (const s of [-0.9, -0.3, 0.3, 0.9]) box(0.1, 0.5, 0.06, P.hull, [s, 1.35, -0.7]);
  box(2.3, 0.05, 0.1, P.trim, [0, 1.99, -0.62]);

  // ---------- rivet studs on hood ----------
  const dots: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 10; i++)
    for (const s of [-1, 1]) {
      const g = new THREE.SphereGeometry(0.018, 5, 3);
      g.translate(s * 1.05, 1.43 - i * 0.002, 0.95 + i * 0.17);
      dots.push(g);
    }
  for (const g of dots) b.part(g, P.steel, { bone: body, at: [0, 0, 0] });

  // grime scatter decals on lower door skin
  const skin = b.surface(b.root);
  void skin;
  void R;
}
    return buildCab;
  })(),
  // bed
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildBed({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...extra });

  const HULL = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.hullLight, smoothstep(0.4, 0.8, noise(p, 0.3, 3)) * 0.5);
      const rustAmt = smoothstep(1.35, 1.0, p.y) * smoothstep(0.45, 0.7, noise(p, 0.12, 5));
      return mix(base, P.rust, rustAmt * 0.8);
    }),
    { size: 0.28, rivets: 0.07 },
  );
  const DARK = metal("iron");

  // ribbed floor texture
  const RIB = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#3a3f4a"/>${Array.from({ length: 16 }, (_, i) => `<rect x="0" y="${i * 4}" width="64" height="2" fill="#20242e"/><rect x="0" y="${i * 4 + 2}" width="64" height="1" fill="#6a7486"/>`).join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 1.9), "#ffffff", { bone, at: [0, 1.131, -1.7], dir: [0, 1, 0], axis: "z", texture: RIB, up: [0, 0, 1] });
  box(2.1, 0.12, 2.0, HULL, [0, 1.07, -1.72]);

  // side walls with armor plates
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 16Z" fill="#15161a"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const KANJI = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8e8d8"/><rect x="1" y="1" width="62" height="30" fill="none" stroke="#15161a" stroke-width="2"/><text x="32" y="23" text-anchor="middle" font-size="18" font-family="sans-serif" font-weight="bold" fill="#15161a">襲撃 07</text></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 2 L30 16 L16 30 L2 16Z" fill="none" stroke="${P.neonMagenta}" stroke-width="3"/><circle cx="16" cy="16" r="4" fill="${P.neonMagenta}"/></svg>`,
    { size: 64 },
  );

  for (const s of [1, -1]) {
    box(0.1, 0.55, 2.0, HULL, [s * 1.12, 1.4, -1.72]);
    box(0.06, 0.1, 2.06, P.hullDark, [s * 1.12, 1.7, -1.72]);
    // armor plates
    for (const z of [-1.0, -1.72, -2.44]) {
      box(0.05, 0.38, 0.5, P.hullLight, [s * 1.18, 1.4, z]);
      for (const dz of [-0.18, 0.18]) for (const dy of [-0.13, 0.13])
        b.part(new THREE.SphereGeometry(0.018, 5, 3), P.steel, { bone, at: [s * 1.21, 1.4 + dy, z + dz] });
    }
    // tie-down slots
    for (const z of [-1.3, -2.1]) {
      box(0.04, 0.05, 0.16, P.rubber, [s * 1.175, 1.62, z]);
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.steel, { bone, at: [s * 1.18, 1.62, z], dir: [s, 0, 0], axis: "z" });
    }
    // hazard stripe on wall
    b.part(new THREE.PlaneGeometry(0.9, 0.12), "#ffffff", { bone, at: [s * 1.2, 1.2, -1.72], dir: [s, 0, 0], axis: "z", texture: HAZ });
    // emblem
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone, at: [s * 1.2, 1.45, -1.0 - 0.0], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 1.9), P.neonCyan, { bone, at: [s * 1.2, 1.76, -1.72] }), 1.5);
  }

  // front wall (against cab) w/ rear window frame
  box(2.3, 0.7, 0.1, HULL, [0, 1.4, -0.7]);
  box(2.2, 0.08, 0.12, P.trim, [0, 1.76, -0.7]);

  // tailgate (raised) with hazard stripes
  box(2.3, 0.62, 0.1, HULL, [0, 1.38, -2.74]);
  b.part(new THREE.PlaneGeometry(2.0, 0.16), "#ffffff", { bone, at: [0, 1.5, -2.795], dir: [0, 0, -1], axis: "z", texture: HAZ });
  box(0.9, 0.04, 0.5, P.hullDark, [0, 1.33, -2.8]); // ramp panel detail
  for (const s of [1, -1]) {
    cyl(0.025, 0.025, 0.2, 6, P.steel, [s * 1.1, 1.0 + 0.45, -2.78], { rotation: [0, 0, 90] });
  }
  // neon strip tailgate
  glow(box(2.1, 0.035, 0.03, P.neonMagenta, [0, 1.15, -2.82]), 1.6);
  // taillights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.14, 0.05, P.lampRed, [s * 0.9, 1.5, -2.8]), 1.6);
    box(0.34, 0.18, 0.03, P.hullDark, [s * 0.9, 1.5, -2.775]);
  }
  // license plate
  b.part(new THREE.PlaneGeometry(0.42, 0.21), "#ffffff", { bone, at: [0, 1.55, -2.795], dir: [0, 0, -1], axis: "z", texture: KANJI });

  // rear bumper
  box(2.4, 0.2, 0.22, P.hullDark, [0, 1.02, -2.9]);
  box(2.4, 0.04, 0.24, P.trim, [0, 1.1, -2.9]);
  for (const s of [1, -1]) box(0.14, 0.14, 0.1, P.steel, [s * 0.7, 1.0, -3.02]);

  // roll bar
  const hoop = (z: number) => {
    for (const s of [1, -1]) cyl(0.04, 0.04, 0.85, 6, P.hullDark, [s * 0.95, 1.45, z]);
    box(1.94, 0.08, 0.08, P.hullDark, [0, 1.9, z]);
  };
  hoop(-0.85);
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 6), P.trim, { bone, at: [0, 1.9, -0.85], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    box(0.05, 0.05, 1.0, P.hullDark, [s * 0.95, 1.85, -1.3]);
    cyl(0.06, 0.06, 0.12, 8, P.trim, [s * 0.95, 1.5, -0.85], {});
    // spotlights
    for (const dx of [-0.2, 0.2]) {
      const x = s * (0.5 + dx);
      cyl(0.07, 0.09, 0.14, 8, P.hullDark, [x, 1.99, -0.85], { dir: [0, 0.3, -1] });
      glow(b.part(new THREE.CircleGeometry(0.065, 8), P.lampWhite, { bone, at: [x, 1.99 + 0.02, -0.92], dir: [0, 0.3, -1], axis: "z" }), 1.6);
    }
  }
  box(0.08, 0.08, 0.08, P.neonCyan, [0, 1.99, -0.85]);

  // crates & canisters
  const crate = (x: number, z: number, w: number, d: number, h = 0.36) => {
    box(w, h, d, P.olive, [x, 1.13 + h / 2, z]);
    box(w + 0.02, 0.04, d + 0.02, P.trim, [x, 1.13 + h * 0.5, z]);
    box(0.04, h + 0.02, d + 0.02, P.hullDark, [x - w * 0.25, 1.13 + h / 2, z]);
    box(0.04, h + 0.02, d + 0.02, P.hullDark, [x + w * 0.25, 1.13 + h / 2, z]);
  };
  crate(0.65, -1.2, 0.6, 0.5);
  crate(0.7, -1.9, 0.5, 0.5, 0.3);
  crate(-0.7, -2.4, 0.55, 0.45, 0.4);
  for (let i = 0; i < 2; i++) {
    const x = -0.75, z = -1.1 - i * 0.32;
    cyl(0.13, 0.13, 0.42, 8, P.olive, [x, 1.34, z]);
    cyl(0.135, 0.135, 0.04, 8, P.trim, [x, 1.4, z]);
    cyl(0.05, 0.05, 0.06, 6, P.steel, [x, 1.58, z]);
  }
  // straps
  box(0.05, 0.02, 0.9, P.rubber, [-0.75, 1.55, -1.26], { rotation: [0, 0, 0] });
  box(0.03, 0.4, 0.55, P.rubber, [0.65, 1.33, -1.2]);

  // antenna whip with flag
  cyl(0.012, 0.006, 1.2, 5, P.steel, [-1.1, 2.35, -2.6], { rotation: [4, 0, -3] });
  b.part(new THREE.PlaneGeometry(0.22, 0.14), P.neonMagenta, { bone, at: [-1.17, 2.78, -2.64], dir: [-1, 0, 0], axis: "z", flat: true });
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonMagenta, { bone, at: [-1.12, 2.95, -2.62] }), 2);

  // rear thruster-vent cowl
  box(1.0, 0.1, 0.4, P.hullDark, [0, 1.17, -2.5]);
  for (let i = 0; i < 5; i++) box(0.9, 0.012, 0.03, P.rubber, [0, 1.225, -2.38 - i * 0.08]);
  glow(box(0.9, 0.012, 0.02, P.neonCyan, [0, 1.225, -2.7]), 1.3);

  // bed corner posts
  for (const s of [1, -1]) for (const z of [-0.72, -2.72])
    box(0.12, 0.62, 0.12, P.hullDark, [s * 1.14, 1.41, z]);

  void R;
}
    return buildBed;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const BRASS = "#c9a24a";
  const gm = M.gunMount;
  const GY = gm[1];
  const gz = gm[2];

  // Scuffed gunmetal paint, with rust creeping up from the lower edges
  const scuff = (base: string, seed: number) =>
    paint((p, n) => {
      const v = noise(p, 0.12, seed);
      let c = mix(base, P.hullLight, 0.25 * v * (0.5 + 0.5 * n.y));
      if (p.y < 1.7 && v > 0.62) c = mix(c, P.rust, 0.5);
      return c;
    });
  const HULL = scuff(P.hull, 3);
  const DARK = scuff(P.hullDark, 5);

  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---- Static base on body: swivel ring, pedestal, ammo drum footing ----
  b.lathe(
    [[0, 0], [0.34, 0], [0.34, 0.05], [0.27, 0.1], [0.27, 0.13], [0, 0.13]],
    { at: [0, 1.05, gz], bone: J.body, color: DARK, segments: 12 },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(cyl(0.015, 0.015, 0.02, 6), P.steel, {
      bone: J.body, at: [Math.sin(a) * 0.3, 1.18, gz + Math.cos(a) * 0.3],
    });
  }
  b.part(cyl(0.1, 0.15, 0.2, 8), HULL, { bone: J.body, at: [0, 1.25, gz] });
  b.part(cyl(0.17, 0.17, 0.03, 12), P.trim, { bone: J.body, at: [0, 1.19, gz] });
  // braces
  for (const s of [1, -1])
    for (const f of [1, -1])
      b.rod([s * 0.3, 1.1, gz + f * 0.3], [s * 0.09, 1.3, gz + f * 0.09], 0.02, P.steel, { bone: J.body });

  // ---- Rotating gun assembly on 'gun' joint ----
  const G = J.gun;
  b.part(cyl(0.22, 0.24, 0.06, 12), DARK, { bone: G, at: [0, 1.36, gz] });
  b.part(cyl(0.225, 0.225, 0.012, 12), P.trim, { bone: G, at: [0, 1.39, gz] });

  // yoke cheeks
  for (const s of [1, -1]) {
    b.part(box(0.05, 0.32, 0.32), HULL, { bone: G, at: [s * 0.16, 1.54, gz + 0.1] });
    b.part(cyl(0.04, 0.04, 0.03, 8), P.steel, { bone: G, at: [s * 0.19, 1.62, gz + 0.1], dir: [1, 0, 0] });
  }

  // receiver
  const RZ = gz + 0.2;
  b.part(box(0.26, 0.24, 0.7), HULL, { bone: G, at: [0, 1.63, RZ - 0.05] });
  b.part(box(0.28, 0.04, 0.5), P.trim, { bone: G, at: [0, 1.76, RZ - 0.05] });
  b.part(box(0.2, 0.1, 0.12), DARK, { bone: G, at: [0, 1.63, RZ - 0.43] });
  // ejection port + feed tray
  b.part(box(0.1, 0.08, 0.2), P.hullDark, { bone: G, at: [-0.14, 1.66, RZ] });
  b.part(box(0.1, 0.03, 0.22), P.steel, { bone: G, at: [0.17, 1.55, RZ - 0.05] });

  // twin barrels
  const BZ0 = RZ + 0.25;
  for (const s of [1, -1]) {
    const x = s * 0.085;
    b.rod([x, 1.64, BZ0 - 0.1], [x, 1.64, gz + 0.87], 0.026, P.steel, { bone: G });
    // cooling sleeve with vent rings
    b.part(cyl(0.05, 0.05, 0.36, 8), P.hullDark, { bone: G, at: [x, 1.64, BZ0 + 0.18], dir: [0, 0, 1] });
    for (let i = 0; i < 4; i++)
      b.part(cyl(0.056, 0.056, 0.02, 8), P.trim, { bone: G, at: [x, 1.64, BZ0 + 0.06 + i * 0.08], dir: [0, 0, 1] });
    // muzzle brake
    b.part(cyl(0.046, 0.046, 0.12, 8), P.hullDark, { bone: G, at: [x, 1.64, gz + 0.84], dir: [0, 0, 1] });
    for (const f of [-1, 1])
      b.part(box(0.1, 0.012, 0.03), P.steel, { bone: G, at: [x, 1.64 + f * 0.0, gz + 0.84 + f * 0.03] });
    b.part(box(0.012, 0.1, 0.03), P.steel, { bone: G, at: [x, 1.64, gz + 0.8] });
  }
  b.part(box(0.1, 0.1, 0.1), HULL, { bone: G, at: [0, 1.64, BZ0 - 0.05] });

  // ---- Armored shield ----
  const sy = 1.5;
  const shield = b.extrude(
    [[-0.46, 0], [0.46, 0], [0.43, 0.42], [0.3, 0.5], [-0.3, 0.5], [-0.43, 0.42]],
    { at: [0, sy, gz + 0.4], x: [1, 0, 0], thickness: 0.045, bevel: 0.01, bone: G, color: HULL },
  );
  void shield;
  const frontZ = gz + 0.4 + 0.026;
  // trim stripe frame
  b.part(box(0.9, 0.03, 0.02), P.trim, { bone: G, at: [0, sy + 0.03, frontZ] });
  for (const s of [1, -1]) b.part(box(0.025, 0.4, 0.02), P.trim, { bone: G, at: [s * 0.42, sy + 0.22, frontZ] });
  // hazard stripe decal
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#15161a"/>`)
      .join("")}<rect x="0" y="0" width="64" height="16" fill="none" stroke="#15161a" stroke-width="1.5"/></svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.76, 0.08), "#ffffff", {
    bone: G, at: [0, sy + 0.1, frontZ + 0.003], dir: [0, 0, 1], axis: "z", texture: HAZ,
  });
  // stencil emblem
  const EMB = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2fa8" stroke-width="5"/><path d="M32 10 L40 32 L32 54 L24 32Z" fill="#ff2fa8"/><text x="32" y="38" font-size="16" text-anchor="middle" fill="#15161a" font-family="sans-serif" font-weight="bold">砲</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    bone: G, at: [-0.28, sy + 0.17, frontZ + 0.003], dir: [0, 0, 1], axis: "z", texture: EMB,
  });
  // sight slit (cyan glow) with bezel
  b.part(box(0.34, 0.07, 0.012), P.hullDark, { bone: G, at: [0.1, sy + 0.34, frontZ + 0.002] });
  glow(b.part(box(0.3, 0.035, 0.014), P.neonCyan, { bone: G, at: [0.1, sy + 0.34, frontZ + 0.006] }), 1.6);
  // rivets
  for (const s of [-1, 1])
    for (const y of [0.05, 0.2, 0.38])
      b.part(new THREE.SphereGeometry(0.014, 5, 3), P.steel, { bone: G, at: [s * 0.38, sy + y, frontZ + 0.006] });
  // gun port cutout frame
  b.part(box(0.38, 0.1, 0.03), P.hullDark, { bone: G, at: [0, 1.64, gz + 0.4] });

  // ---- Ammo drum on the right side + belt ----
  const drum = b.part(cyl(0.12, 0.12, 0.2, 12), P.olive, { bone: G, at: [-0.3, 1.5, RZ - 0.1], dir: [0, 1, 0] });
  void drum;
  b.part(cyl(0.125, 0.125, 0.025, 12), P.trim, { bone: G, at: [-0.3, 1.5, RZ - 0.1] });
  b.part(box(0.2, 0.05, 0.1), P.trim, { bone: G, at: [-0.3, 1.62, RZ - 0.1] });
  const beltPath = bezier([-0.3, 1.64, RZ - 0.1], [-0.3, 1.82, RZ - 0.05], [-0.18, 1.7, RZ], [-0.14, 1.65, RZ]);
  b.along(beltPath, 14, (at) => {
    b.part(box(0.026, 0.03, 0.045), BRASS, { at: at.at, bone: G });
  });
  b.sweep(beltPath, 0.008, { color: P.rust, bone: G });

  // ---- Handles ----
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.6, RZ - 0.4], [s * 0.15, 1.72, RZ - 0.55], 0.014, P.steel, { bone: G });
    b.rod([s * 0.15, 1.72, RZ - 0.55], [s * 0.15, 1.58, RZ - 0.6], 0.016, P.rubber, { bone: G });
  }
  b.rod([-0.15, 1.7, RZ - 0.56], [0.15, 1.7, RZ - 0.56], 0.012, P.steel, { bone: G });

  // ---- Radar dish on shield top ----
  const topY = sy + 0.5;
  b.rod([-0.28, topY - 0.02, gz + 0.4], [-0.28, topY + 0.03, gz + 0.4], 0.012, P.steel, { bone: G });
  b.part(new THREE.SphereGeometry(0.065, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.steelLight ?? P.steel, {
    bone: G, at: [-0.28, topY + 0.04, gz + 0.4], dir: [0, 0.35, -1], flat: true,
  });
  b.rod([-0.28, topY + 0.04, gz + 0.4], [-0.28, topY + 0.07, gz + 0.46], 0.005, P.trim, { bone: G });
  b.part(new THREE.SphereGeometry(0.01, 5, 3), P.trim, { bone: G, at: [-0.28, topY + 0.07, gz + 0.46] });

  // ---- Targeting module with magenta eye ----
  b.part(box(0.16, 0.09, 0.12), P.hullDark, { bone: G, at: [0.2, topY + 0.03, gz + 0.4] });
  b.part(box(0.17, 0.015, 0.13), P.trim, { bone: G, at: [0.2, topY + 0.08, gz + 0.4] });
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), P.neonMagenta, { bone: G, at: [0.2, topY + 0.03, gz + 0.46] }), 2);
  b.part(cyl(0.038, 0.038, 0.02, 8), P.hullDark, { bone: G, at: [0.2, topY + 0.03, gz + 0.455], dir: [0, 0, 1] });

  // ---- Status light ----
  b.part(cyl(0.025, 0.03, 0.03, 6), P.hullDark, { bone: G, at: [0.4, topY - 0.005, gz + 0.4] });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonCyan, { bone: G, at: [0.4, topY + 0.025, gz + 0.4] }), 2);
  // side neon strip along receiver
  glow(b.part(box(0.01, 0.02, 0.4), P.neonMagenta, { bone: G, at: [0.135, 1.69, RZ - 0.05] }), 1.5);
}
    return buildTurret;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverPickup" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.05,0.5,1.9], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.05,0.5,1.9], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterBL"] = b.joint("thrusterBL", { parent: J["body"], at: [1.05,0.5,-1.7], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterBR"] = b.joint("thrusterBR", { parent: J["body"], at: [-1.05,0.5,-1.7], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["gun"] = b.joint("gun", { parent: J["body"], at: [0,1.35,-1.9], dir: [0,0,1], role: "hinge", group: "weapon" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
