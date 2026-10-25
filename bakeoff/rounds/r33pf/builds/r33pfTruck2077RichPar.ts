import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, mix, noise, smoothstep, glow as _unused } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Warhound 77 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 heavy truck from 2077 with angular armor, neon trim, a roof turret and a modular cargo bed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4250",
  hullDark: "#20252e",
  underframe: "#101216",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  glass: "#0f2a3a",
  tire: "#15161a",
  rim: "#8a93a3",
  steel: "#7b8494",
  red: "#d02a2a",
  lampWhite: "#fff6d0",
  olive: "#4d5a3c",
  orange: "#ff7a1a",
};
const M = {
  chassisTop: [0, 1.5, 0] as [number, number, number],
  cabFloor: [0, 1.5, 1.7] as [number, number, number],
  bedFloor: [0, 1.5, -2] as [number, number, number],
  turretRing: [0, 3, -0.2] as [number, number, number],
  axleFront: [0, 0.62, 3.2] as [number, number, number],
  axleMid: [0, 0.62, -1.4] as [number, number, number],
  axleRear: [0, 0.62, -3.4] as [number, number, number],
  hoodFront: [0, 1.9, 4.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });
  const cyl = (r: number, len: number, col: any, at: number[], axis: "x" | "y" | "z", seg = 8) => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
    return b.part(new THREE.CylinderGeometry(r, r, len, seg), col, { bone, at, dir });
  };
  const rod = (a: number[], c: number[], r: number, col: any) => b.rod(a, c, r, col, { bone });

  const FRAME = panelled(P.underframe, { size: 0.3, rivets: 0.06 });
  const ARMOR = panelled(P.hull, { size: 0.4, aspect: 0.6, rivets: 0.05 });
  const chevron = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 12} 0 L${i * 12 + 6} 0 L${i * 12 + 14} 8 L${i * 12 + 6} 16 L${i * 12} 16 L${i * 12 + 8} 8Z" fill="#15161a"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );
  const stripe = (w: number, h: number, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: chevron });

  // ladder rails & cross members
  for (const s of [1, -1]) {
    box(0.18, 0.34, 8.6, FRAME, [s * 0.7, 0.85, 0]);
    box(0.24, 0.06, 8.6, P.steel, [s * 0.7, 1.04, 0]);
  }
  for (let i = 0; i < 9; i++) box(1.4, 0.16, 0.14, P.hullDark, [0, 0.85, -4 + i], {});
  box(2.6, 0.12, 8.8, P.underframe, [0, 1.46, 0]);

  // transfer case, driveshafts
  box(0.7, 0.4, 0.8, P.hullDark, [0, 0.7, -0.2]);
  cyl(0.07, 4.4, P.steel, [0, 0.62, 1.4], "z");
  cyl(0.07, 3.4, P.steel, [0, 0.62, -2.6], "z");
  for (const z of [-4.2, -1.4, 3.2]) cyl(0.12, 0.3, P.steel, [0, 0.62, z], "z", 6);

  // axles, springs, shocks
  for (const z of [3.2, -1.4, -3.4]) {
    cyl(0.14, 2.7, P.hullDark, [0, 0.62, z], "x");
    box(0.5, 0.35, 0.5, P.hullDark, [0, 0.62, z]);
    for (const s of [1, -1]) {
      rod([s * 1.0, 0.7, z + 0.3], [s * 1.0, 1.3, z + 0.3], 0.07, P.steel);
      rod([s * 1.0, 0.7, z - 0.3], [s * 1.0, 1.3, z - 0.3], 0.04, P.orange);
      b.sweep(
        (() => {
          const pts: number[][] = [];
          for (let i = 0; i <= 24; i++) {
            const a = i * 0.9;
            pts.push([s * 0.85 + Math.cos(a) * 0.09, 0.72 + i * 0.024, z - 0.1 + Math.sin(a) * 0.09]);
          }
          return pts;
        })(),
        0.018,
        { bone, color: P.orange },
      );
      rod([s * 0.5, 0.9, z], [s * 1.1, 0.68, z], 0.05, P.hullDark);
    }
  }

  // fuel tanks and exhaust
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.32, 0.32, 1.8, 8), metal("steel"), { bone, at: [s * 1.1, 0.78, -0.2], dir: [0, 0, 1] });
    for (const z of [-0.8, 0.4]) cyl(0.34, 0.06, P.trim, [s * 1.1, 0.78, z], "z");
  }
  rod([-0.5, 0.55, -4.0], [-0.5, 0.55, -4.6], 0.1, P.steel);
  rod([0.5, 0.55, -4.2], [0.5, 0.55, -4.6], 0.1, P.steel);
  rod([0.5, 0.55, -4.2], [0.5, 0.55, -1.8], 0.07, P.steel);
  rod([-0.5, 0.55, -4.0], [-0.5, 0.55, -1.8], 0.07, P.steel);

  // side skirts
  for (const s of [1, -1]) {
    const dir = [s, 0, 0];
    box(0.14, 0.7, 4.0, ARMOR, [s * 1.43, 0.95, 0.6]);
    box(0.14, 0.7, 1.9, ARMOR, [s * 1.43, 0.95, -3.0]);
    stripe(1.2, 0.3, [s * 1.51, 0.85, 1.2], dir);
    stripe(1.2, 0.3, [s * 1.51, 0.85, -3.0], dir);
    for (const [z, l] of [[0.6, 3.9], [-3.0, 1.8]]) {
      glow(box(0.04, 0.05, l, P.neonCyan, [s * 1.51, 1.2, z]), 1.5);
      box(0.06, 0.06, l, P.hullDark, [s * 1.48, 0.58, z]);
    }
    // mud flaps
    for (const z of [-1.9, -4.0]) box(0.06, 0.5, 0.7, P.underframe, [s * 1.2, 0.55, z]);
    // tow hooks
    rod([s * 0.6, 0.8, 4.3], [s * 0.6, 0.8, 4.65], 0.06, P.red);
    box(0.2, 0.2, 0.08, P.red, [s * 0.6, 0.8, 4.68]);
  }

  // front bumper & bull-bar
  box(2.9, 0.5, 0.5, P.hullDark, [0, 0.95, 4.25]);
  stripe(2.6, 0.3, [0, 0.95, 4.51], [0, 0, 1]);
  for (const s of [1, -1]) {
    rod([s * 1.1, 0.7, 4.4], [s * 1.0, 1.7, 4.55], 0.07, P.steel);
    rod([s * 0.45, 0.7, 4.4], [s * 0.4, 1.7, 4.55], 0.06, P.steel);
  }
  rod([-1.0, 1.65, 4.55], [1.0, 1.65, 4.55], 0.07, P.steel);
  rod([-1.0, 1.15, 4.6], [1.0, 1.15, 4.6], 0.06, P.steel);
  box(0.55, 0.4, 0.3, P.steel, [0, 0.95, 4.65]);
  cyl(0.14, 0.4, P.orange, [0, 0.95, 4.82], "x");
  glow(box(2.4, 0.04, 0.04, P.neonMagenta, [0, 0.66, 4.52]), 1.5);

  // rear bumper
  box(2.9, 0.45, 0.45, P.hullDark, [0, 0.95, -4.3]);
  stripe(2.5, 0.28, [0, 0.95, -4.54], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.06, P.red, [s * 1.1, 1.25, -4.55]), 1.5);
    box(0.5, 0.1, 0.1, P.steel, [s * 0.6, 0.7, -4.5]);
  }
  rod([0, 0.8, -4.5], [0, 0.8, -4.9], 0.06, P.steel);

  // greebles: bolts and pipes
  for (let i = 0; i < 18; i++) {
    const s = i % 2 ? 1 : -1;
    const z = -4 + R() * 8;
    cyl(0.04, 0.1, P.rim, [s * (0.45 + R() * 0.2), 0.55, z], "y", 6);
  }
  rod([-0.3, 0.45, -3], [-0.3, 0.45, 3], 0.03, P.neonCyan);
  rod([0.3, 0.45, 3], [0.3, 0.45, -3], 0.03, P.orange);
}
    return buildChassis;
  })(),
  // wheels
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildWheels({ b, J, P }: Ctx) {
  const R = 0.62, W = 0.55;
  const rand = rng(77);

  const tirePaint = paint((p, n) => {
    const v = noise(p, 0.12, 3);
    return mix("#0d0e11", "#24262c", v * 0.8 + 0.2 * Math.max(0, n.y));
  });
  const rimPaint = paint((p, n) => mix("#5f6877", P.rim, noise(p, 0.05, 5) * 0.7 + 0.3 * Math.max(0, n.y)));
  const armorPaint = paint((p, n) => mix(P.hullDark, P.hull, noise(p, 0.15, 9) * 0.5 + 0.2 * Math.max(0, n.y)));

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0a3a44"/><circle cx="32" cy="32" r="22" fill="none" stroke="#2ff3ff" stroke-width="4"/><path d="M32 12 L36 32 L32 52 L28 32Z M12 32 L32 28 L52 32 L32 36Z" fill="#2ff3ff"/><circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const chevron = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 0 L16 0 L32 16 L16 16Z M32 0 L48 0 L64 16 L48 16Z" fill="#101216"/></svg>`,
    { size: 128 },
  );

  const sides: [string, number][] = [["FL", 1], ["FR", -1], ["ML", 1], ["MR", -1], ["RL", 1], ["RR", -1]];

  for (const [tag, s] of sides) {
    const j = J["wheel" + tag];
    const c = j.at;
    const X = (x: number, y = 0, z = 0) => [c.x + s * x, c.y + y, c.z + z] as [number, number, number];
    const axis: [number, number, number] = [s, 0, 0];

    // tire: 10-sided cylinder
    const tire = new THREE.CylinderGeometry(R, R, W, 10, 1);
    b.part(tire, tirePaint, { bone: j, at: X(0), dir: axis, flat: true });
    // sidewall shoulders
    for (const k of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.99, 0.05, 10), P.tire, { bone: j, at: X(k * (W / 2 - 0.01)), dir: axis, flat: true });
    }
    // tread blocks
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      const rr = R + 0.03;
      for (const k of [-1, 1]) {
        b.part(new THREE.BoxGeometry(0.22, 0.08, 0.2), P.tire, {
          bone: j,
          at: X(k * 0.14, Math.cos(a) * rr, Math.sin(a) * rr),
          rotation: [(-a * 180) / Math.PI + 90 + 0, 0, 0],
        });
      }
    }
    // rim
    const out = s * 1; // outward sign
    const faceX = W / 2 + 0.005;
    b.part(new THREE.CylinderGeometry(R * 0.62, R * 0.58, 0.1, 10), rimPaint, { bone: j, at: X(faceX - 0.05), dir: axis, flat: true });
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.06, 10), P.hullDark, { bone: j, at: X(faceX - 0.02), dir: axis, flat: true });
    // spokes
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const y = Math.cos(a) * R * 0.28, z = Math.sin(a) * R * 0.28;
      b.rod(X(faceX, 0, 0), X(faceX, Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55), 0.035, P.steel, { bone: j, sides: 4 });
      void y; void z;
    }
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.steel, {
        bone: j, at: X(faceX + 0.02, Math.cos(a) * R * 0.2, Math.sin(a) * R * 0.2), dir: axis,
      });
    }
    // glowing hub cap
    glow(
      b.part(new THREE.CircleGeometry(0.13, 10), "#ffffff", {
        bone: j, at: X(faceX + 0.045), dir: axis, axis: "z", texture: hubTex,
      }),
      1.4,
    );
    glow(b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 10), P.neonCyan, { bone: j, at: X(faceX + 0.015), dir: axis }), 1.2);
    // brake disc and caliper behind spokes
    b.part(new THREE.CylinderGeometry(R * 0.45, R * 0.45, 0.03, 12), P.steel, { bone: j, at: X(faceX - 0.14), dir: axis });
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.14), P.red, { bone: j, at: X(faceX - 0.14, R * 0.33, 0.0) });
    // inner side hub
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 8), P.hullDark, { bone: j, at: X(-W / 2 - 0.03), dir: axis });

    // wheel arch armor flare (attached to body, above wheel)
    const top = c.y + R + 0.1;
    const arch = b.extrude(
      [[-0.78, 0], [-0.62, 0.38], [0.62, 0.38], [0.78, 0], [0.7, 0], [0.56, 0.3], [-0.56, 0.3], [-0.7, 0]],
      { at: [c.x + s * 0.0, top - 0.05, c.z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.62, bevel: 0.02, color: armorPaint, bone: J.body },
    );
    void arch;
    // yellow edge trim
    for (const k of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.64, 0.035, 0.05), P.trim, { bone: J.body, at: [c.x, top + 0.33, c.z + k * 0.58], rotation: [0, 0, 0] });
      b.part(new THREE.BoxGeometry(0.66, 0.05, 0.05), P.trim, { bone: J.body, at: [c.x, top + 0.0, c.z + k * 0.77] });
    }
    // chevron decal on arch face
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
      bone: J.body, at: [c.x + s * 0.325, top + 0.2, c.z + 0.0], dir: [s, 0, 0], axis: "z", texture: chevron,
    });
    // arch rivets
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, {
        bone: J.body, at: [c.x + s * 0.33, top + 0.28, c.z - 0.4 + i * 0.2],
      });
    }
    void rand; void out;
  }
}
    return buildWheels;
  })(),
  // cabHood
  (() => {
function buildCabHood({ b, J, P, M }: Ctx) {
  const cab = J.cabHinge;
  const body = J.body;
  const R = rng(77);

  const plate = (base: string) =>
    paint((p, n) => {
      const nn = noise(p, 0.3, 4);
      const c = mix(base, "#5a6577", smoothstep(0.5, 0.9, n.y) * 0.5 + nn * 0.15);
      const gx = Math.abs(((p.z * 4) % 1)) < 0.03 || Math.abs(((p.y * 5) % 1)) < 0.03;
      return gx ? mix(c, "#101216", 0.7) : c;
    });
  const HULL = plate(P.hull);
  const DARK = plate(P.hullDark);

  // box helper
  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot });

  // ---- HOOD (body bone, rigid) ----
  b.extrude(
    [[0, 0], [1.9, 0], [1.9, 0.35], [0.4, 0.6], [0, 0.45]],
    { at: [-1.2, 1.5, 4.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 2.4, bevel: 0.03, color: HULL, bone: body },
  );
  // fix extrude orientation: thickness axis = x cross y; shift to be centred
  box(2.5, 0.12, 1.5, DARK, [0, 2.15, 3.5], body, [-8, 0, 0]);
  // vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      box(0.5, 0.03, 0.08, P.underframe, [s * 0.6, 2.24 - i * 0.03, 3.1 + i * 0.22], body, [-8, 0, 0]);
  // center hood ridge
  box(0.3, 0.1, 1.6, P.trim, [0, 2.24, 3.4], body, [-8, 0, 0]);
  // grille
  box(2.2, 0.55, 0.1, P.underframe, [0, 1.85, 4.45], body);
  for (let i = 0; i < 6; i++) box(2.1, 0.04, 0.12, P.steel, [0, 1.65 + i * 0.09, 4.5], body, [25, 0, 0]);
  glow(box(2.1, 0.05, 0.05, P.neonMagenta, [0, 1.58, 4.52], body), 1.6);
  // headlights with brows
  for (const s of [1, -1]) {
    box(0.55, 0.32, 0.3, P.hullDark, [s * 0.95, 1.95, 4.35], body);
    box(0.6, 0.08, 0.34, P.trim, [s * 0.95, 2.14, 4.36], body, [15, 0, 0]);
    glow(box(0.42, 0.18, 0.1, P.lampWhite, [s * 0.95, 1.93, 4.5], body), 1.8);
    glow(box(0.1, 0.1, 0.1, P.orange, [s * 1.3, 1.9, 4.4], body), 1.2);
  }
  // bumper hazard
  box(2.7, 0.14, 0.12, P.trim, [0, 1.52, 4.46], body);
  // snorkel
  b.rod([1.25, 1.7, 2.7], [1.25, 3.0, 2.7], 0.07, P.steel, { bone: body });
  box(0.2, 0.14, 0.2, P.hullDark, [1.25, 3.05, 2.7], body);

  // ---- CAB (cabHinge) ----
  box(2.8, 1.1, 1.8, HULL, [0, 2.1, 1.7], cab);
  // upper cab
  box(2.6, 0.5, 1.5, DARK, [0, 2.9, 1.6], cab);
  // windshield
  const HUD = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0f2a3a"/>
    <path d="M0 24 L24 0 L34 0 L10 24Z" fill="#2ff3ff" opacity="0.25"/>
    <path d="M40 24 L56 0 L60 0 L44 24Z" fill="#2ff3ff" opacity="0.18"/>
    <circle cx="32" cy="12" r="6" fill="none" stroke="#2ff3ff" stroke-width="0.8"/>
    <path d="M32 3v4M32 17v4M23 12h4M37 12h4" stroke="#2ff3ff" stroke-width="0.8"/>
    <text x="4" y="21" font-size="3" fill="#ff2fb4">WH-77 SYS OK</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.4, 0.8), "#ffffff", {
    bone: cab, at: [0, 2.85, 2.38], dir: [0, 0.55, 1], axis: "z", texture: HUD,
  });
  box(2.6, 0.08, 0.12, P.hullDark, [0, 3.25, 2.4], cab, [-35, 0, 0]);
  // visor brow
  box(2.7, 0.1, 0.35, P.trim, [0, 3.24, 2.45], cab, [-20, 0, 0]);
  // doors
  const NUM = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#e7b814"/><text x="16" y="24" font-size="22" font-weight="bold" text-anchor="middle" fill="#101216">77</text></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1]) {
    box(0.1, 0.9, 1.3, HULL, [s * 1.42, 2.1, 1.7], cab);
    box(0.06, 0.14, 0.7, P.glass, [s * 1.48, 2.5, 1.9], cab);
    box(0.04, 0.05, 0.3, P.steel, [s * 1.48, 2.2, 1.35], cab);
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: cab, at: [s * 1.48, 1.9, 1.9], dir: [s, 0, 0], axis: "z", texture: NUM,
    });
    // hazard stripes
    for (let i = 0; i < 5; i++) box(0.04, 0.1, 0.12, P.trim, [s * 1.47, 1.65, 1.2 + i * 0.25], cab, [0, 0, 0]);
    // mirror + camera
    b.rod([s * 1.45, 2.6, 2.3], [s * 1.8, 2.7, 2.35], 0.03, P.steel, { bone: cab });
    box(0.1, 0.3, 0.2, P.hullDark, [s * 1.85, 2.65, 2.35], cab);
    glow(box(0.06, 0.06, 0.06, P.neonCyan, [s * 1.85, 2.8, 2.46], cab), 1.5);
    // neon belt
    glow(box(0.03, 0.04, 1.7, P.neonCyan, [s * 1.43, 1.62, 1.7], cab), 1.4);
  }
  // light bar
  box(2.2, 0.14, 0.2, P.hullDark, [0, 3.4, 2.1], cab);
  for (let i = 0; i < 6; i++)
    glow(box(0.3, 0.1, 0.05, i % 2 ? P.neonMagenta : P.lampWhite, [-0.9 + i * 0.36, 3.4, 2.22], cab), 1.6);
  // roof rack
  for (const s of [1, -1]) box(0.05, 0.1, 1.2, P.steel, [s * 0.9, 3.2, 1.2], cab);
  for (let i = 0; i < 4; i++) box(1.8, 0.04, 0.05, P.steel, [0, 3.2, 0.8 + i * 0.35], cab);
  // sensor domes
  b.part(new THREE.SphereGeometry(0.15, 8, 5, 0, 6.3, 0, 1.6), P.hullDark, { bone: cab, at: [0.7, 3.15, 1.3] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.orange, { bone: cab, at: [0.7, 3.28, 1.3] }), 1.5);
  // antennas
  for (const [x, h] of [[-1.1, 1.2], [-0.9, 0.8]] as number[][]) {
    b.rod([x, 3.1, 0.8], [x + 0.05, 3.1 + h, 0.8], [0.02, 0.008], P.steel, { bone: cab });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.red, { bone: cab, at: [x + 0.05, 3.1 + h, 0.8] }), 1.5);
  }
  // rear wall & pipes
  box(2.8, 1.3, 0.1, DARK, [0, 2.2, 0.65], cab);
  b.rod([-1.3, 1.6, 0.8], [-1.3, 3.0, 0.8], 0.04, P.orange, { bone: cab });
  void R; void M;
}
    return buildCabHood;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(77);
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...o });

  const HULL = panelled(P.hull, { size: 0.5, rivets: 0.1 });
  const DARK = panelled(P.hullDark, { size: 0.4, rivets: 0.08 });
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#20252e" stroke="#e7b814" stroke-width="4"/><path d="M14 40 L24 16 L32 28 L40 16 L50 40 L32 34Z" fill="#2ff3ff"/><circle cx="32" cy="46" r="4" fill="#ff2fb4"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 16L16 0H32L16 16ZM32 16L48 0H64L48 16Z" fill="#101216"/></svg>`,
    { size: 128 },
  );

  // main container
  box(2.9, 1.3, 5.0, HULL, [0, 2.15, -1.95]);
  // roof plate and raised deck
  box(2.7, 0.12, 4.8, DARK, [0, 2.86, -1.95]);
  // lower rim
  box(3.0, 0.2, 5.1, P.hullDark, [0, 1.6, -1.95]);

  // neon edge strips (top edges and sides)
  for (const s of [1, -1]) {
    glow(box(0.06, 0.06, 5.0, P.neonCyan, [s * 1.46, 2.82, -1.95]));
    glow(box(0.04, 0.04, 4.8, P.neonMagenta, [s * 1.47, 1.82, -1.95]));
    glow(box(0.06, 1.0, 0.06, P.neonCyan, [s * 1.46, 2.25, 0.57]));
    glow(box(0.06, 1.0, 0.06, P.neonCyan, [s * 1.46, 2.25, -4.47]));
  }
  glow(box(2.8, 0.05, 0.05, P.neonCyan, [0, 2.84, 0.56]));
  glow(box(2.8, 0.04, 0.04, P.neonMagenta, [0, 1.85, -4.5]));

  // side lockers, latches, emblem
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.5 - i * 1.3;
      box(0.1, 0.7, 1.1, P.hullDark, [s * 1.48, 2.1, z]);
      box(0.04, 0.5, 0.9, P.steel, [s * 1.54, 2.1, z]);
      box(0.08, 0.14, 0.08, P.trim, [s * 1.57, 2.1, z + 0.35]);
      box(0.08, 0.14, 0.08, P.trim, [s * 1.57, 2.1, z - 0.35]);
    }
    b.part(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", {
      bone, at: [s * 1.505, 2.55, -3.9], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
    // jerry cans
    for (let i = 0; i < 3; i++) {
      box(0.22, 0.34, 0.3, P.olive, [s * 1.62, 1.85, -2.2 - i * 0.4]);
      box(0.1, 0.06, 0.1, P.orange, [s * 1.62, 2.05, -2.2 - i * 0.4]);
    }
    // crates + strap
    box(0.35, 0.4, 0.8, P.olive, [s * 1.65, 2.35, -3.6]);
    box(0.37, 0.05, 0.1, P.hullDark, [s * 1.65, 2.35, -3.6]);
    // beacon
    glow(cyl(0.1, 0.12, 0.18, 6, P.orange, [s * 1.3, 2.98, -4.2]), 1.5);
    cyl(0.13, 0.13, 0.04, 6, P.hullDark, [s * 1.3, 2.88, -4.2]);
  }

  // rear door, hazard stripe, tail lights
  box(2.5, 1.0, 0.1, P.steel, [0, 2.2, -4.5]);
  for (let i = 0; i < 6; i++) box(2.4, 0.03, 0.04, P.hullDark, [0, 1.8 + i * 0.16, -4.56]);
  b.part(new THREE.PlaneGeometry(2.6, 0.22), "#ffffff", {
    bone, at: [0, 2.78, -4.56], dir: [0, 0, -1], axis: "z", texture: hazard,
  });
  for (const s of [1, -1]) {
    glow(box(0.22, 0.26, 0.08, P.red, [s * 1.2, 1.75, -4.55]), 1.3);
    // ladder
    box(0.05, 1.1, 0.05, P.steel, [s * 0.3, 2.2, -4.6]);
  }
  for (let i = 0; i < 6; i++) box(0.65, 0.04, 0.04, P.steel, [0, 1.75 + i * 0.2, -4.6]);

  // roof hex vents
  for (let i = 0; i < 3; i++) {
    cyl(0.25, 0.3, 0.12, 6, P.hullDark, [0.7, 2.98, -1.8 - i * 0.9]);
    cyl(0.18, 0.18, 0.05, 6, P.underframe, [0.7, 3.05, -1.8 - i * 0.9]);
  }
  // hatch
  box(0.7, 0.08, 0.7, P.trim, [-0.7, 2.96, -3.6]);

  // pipes + cables on roof
  for (const x of [-1.2, 1.2]) cyl(0.05, 0.05, 4.4, 6, P.steel, [x, 2.97, -1.95], { rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) box(0.12, 0.12, 0.08, P.hullDark, [1.2, 2.97, -0.2 - i * 0.55]);
  glow(box(0.04, 0.04, 4.4, P.neonMagenta, [-0.95, 2.93, -1.95]));

  // turret ring base at turretRing
  cyl(0.85, 0.95, 0.12, 12, P.hullDark, [0, 2.98, -0.2]);
  cyl(0.7, 0.7, 0.08, 12, P.steel, [0, 3.05, -0.2]);
  glow(cyl(0.88, 0.88, 0.03, 12, P.neonCyan, [0, 3.0, -0.2]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.04, 0.04, 0.06, 6, P.trim, [Math.sin(a) * 0.78, 3.06, -0.2 + Math.cos(a) * 0.78]);
  }

  // antenna array
  for (let i = 0; i < 4; i++) {
    const x = -1.1 + i * 0.12, h = 0.8 + R() * 0.8;
    cyl(0.012, 0.02, h, 5, P.steel, [x, 3.0 + h / 2, -4.1]);
    if (i % 2) glow(cyl(0.03, 0.03, 0.05, 5, P.red, [x, 3.02 + h, -4.1]));
  }
  // satellite dish
  cyl(0.04, 0.05, 0.4, 6, P.steel, [-0.9, 3.2, -3.0]);
  b.part(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, 1.0), P.rim, {
    bone, at: [-0.9, 3.4, -3.0], rotation: [-120, 0, 0], flat: true,
  });
  cyl(0.015, 0.015, 0.35, 5, P.steel, [-0.9, 3.55, -3.15], { rotation: [60, 0, 0] });
  glow(box(0.06, 0.06, 0.06, P.neonCyan, [-0.9, 3.7, -3.3]));

  // front wall greebles meeting cab
  box(2.6, 0.2, 0.08, P.underframe, [0, 2.0, 0.58]);
  for (let i = 0; i < 5; i++) box(0.4, 0.05, 0.04, P.steel, [-1 + i * 0.5, 2.5, 0.6]);
}
    return buildCargoBed;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pit = J.gunPitch;
  const BASE_Y = M.turretRing[1];
  const PX = M.turretRing[0];
  const PZ = M.turretRing[2];

  const armor = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const t = n.y > 0.5 ? "#4a5464" : n.y < -0.3 ? "#1c2028" : P.hull;
    return t;
  });

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#101216"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const marking = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="none" stroke="#e7b814" stroke-width="4"/><path d="M32 10 L50 40 H14Z" fill="none" stroke="#2ff3ff" stroke-width="4"/><text x="32" y="58" font-size="14" text-anchor="middle" fill="#fff" font-family="monospace">W-77</text></svg>`,
    { size: 128 },
  );

  const at = (x: number, y: number, z: number): [number, number, number] => [PX + x, y, PZ + z];

  // base disc
  b.part(new THREE.CylinderGeometry(0.85, 0.95, 0.1, 10), P.hullDark, { bone: yaw, at: at(0, 3.05, 0), flat: true });
  b.part(new THREE.CylinderGeometry(0.97, 0.97, 0.03, 10), P.trim, { bone: yaw, at: at(0, 3.12, 0), flat: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), P.steel, { bone: yaw, at: at(Math.sin(a) * 0.9, 3.15, Math.cos(a) * 0.9) });
  }
  // pedestal
  b.part(new THREE.CylinderGeometry(0.5, 0.65, 0.14, 8), armor, { bone: yaw, at: at(0, 3.2, 0), flat: true });

  // shield housing
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.9), armor, { bone: yaw, at: at(0, 3.3, -0.05) });
  b.part(new THREE.BoxGeometry(0.7, 0.14, 0.5), armor, { bone: yaw, at: at(0, 3.45, 0.1), rotation: [-15, 0, 0] });
  b.part(new THREE.BoxGeometry(0.95, 0.04, 0.5), hazard as any ? "#ffffff" : P.trim, { bone: yaw, at: at(0, 3.4, 0.5), texture: hazard, rotation: [-12, 0, 0] });
  // sloped front shield wedge
  b.extrude([[-0.45, 0], [0.45, 0], [0.32, 0.28], [-0.32, 0.28]], {
    at: at(0, 3.17, 0.5), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, color: P.hullDark, bone: yaw,
  });
  // sensor eye
  glow(b.part(new THREE.SphereGeometry(0.09, 8, 6), P.neonCyan, { bone: yaw, at: at(0.28, 3.35, 0.53) }), 2);
  b.part(new THREE.TorusGeometry(0.1, 0.02, 5, 8), P.underframe, { bone: yaw, at: at(0.28, 3.35, 0.52) });

  // side panels with markings
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: yaw, at: at(s * 0.455, 3.32, -0.05), dir: [s, 0, 0], axis: "z", texture: marking,
    });
    // missile pods
    b.part(new THREE.BoxGeometry(0.28, 0.3, 0.7), P.hullDark, { bone: yaw, at: at(s * 0.7, 3.25, -0.05) });
    for (let i = 0; i < 4; i++) {
      const x = s * 0.7 + ((i % 2) - 0.5) * 0.12;
      const y = 3.25 + (Math.floor(i / 2) - 0.5) * 0.12;
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), P.underframe, { bone: yaw, at: at(x, y, 0.32), rotation: [90, 0, 0] });
      b.part(new THREE.ConeGeometry(0.04, 0.08, 6), P.red, { bone: yaw, at: at(x, y, 0.3), rotation: [90, 0, 0] });
    }
    b.part(new THREE.BoxGeometry(0.3, 0.03, 0.72), P.trim, { bone: yaw, at: at(s * 0.7, 3.41, -0.05) });
    // status lights
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonMagenta, { bone: yaw, at: at(s * 0.35, 3.47, -0.4) }), 2);
  }

  // ammo drum + belt
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), P.olive, { bone: yaw, at: at(-0.2, 3.3, -0.62), rotation: [0, 0, 90], flat: true });
  b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 10), P.trim, { bone: yaw, at: at(-0.2, 3.3, -0.62), rotation: [0, 0, 90] });
  b.rod([PX - 0.1, 3.3, PZ - 0.5], [PX - 0.05, 3.42, PZ + 0.15], 0.025, P.steel, { bone: yaw });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.04, 0.04, 0.05), P.trim, { bone: yaw, at: at(-0.1 + i * 0.01, 3.31 + i * 0.02, -0.45 + i * 0.13) });

  // radar + camera gimbal
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), P.steel, { bone: yaw, at: at(0.35, 3.52, -0.5) });
  b.part(new THREE.BoxGeometry(0.34, 0.14, 0.03), P.hullDark, { bone: yaw, at: at(0.35, 3.4 + 0.22, -0.5), rotation: [0, 0, 8] });
  b.part(new THREE.SphereGeometry(0.07, 6, 5), P.underframe, { bone: yaw, at: at(-0.35, 3.52, 0.0) });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone: yaw, at: at(-0.35, 3.54, 0.05) }), 2);

  // gun on pitch joint
  const gy = 3.35;
  b.part(new THREE.BoxGeometry(0.5, 0.22, 0.4), P.hullDark, { bone: pit, at: at(0, gy, 0.5) });
  for (const s of [1, -1]) {
    const x = s * 0.13;
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), P.steel, { bone: pit, at: at(x, gy, 1.0), rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 8), P.underframe, { bone: pit, at: at(x, gy, 0.75), rotation: [90, 0, 0] });
    for (let i = 0; i < 3; i++)
      b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.015, 8), P.orange, { bone: pit, at: at(x, gy, 0.6 + i * 0.12), rotation: [90, 0, 0] });
    b.part(new THREE.BoxGeometry(0.13, 0.13, 0.2), P.hullDark, { bone: pit, at: at(x, gy, 1.3) });
    b.part(new THREE.BoxGeometry(0.15, 0.03, 0.06), P.trim, { bone: pit, at: at(x, gy + 0.07, 1.3) });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: pit, at: at(x, gy + 0.13, 0.5) }), 2);
  }
}
    return buildTurret;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhound77" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.2,0], dir: [0,0,1], role: "spine" });
  J["cabHinge"] = b.joint("cabHinge", { parent: J["body"], at: [0,1.6,2.6], dir: [1,0,0], role: "hinge", group: "cab" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,3,-0.2], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,3.35,0], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.35,0.62,3.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.35,0.62,3.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.35,0.62,-1.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.35,0.62,-1.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.35,0.62,-3.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.35,0.62,-3.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
