import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng, stripes, metal } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "Convoy Hauler Mk-IV",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a hardened cab, gun turret and a sealed glowing cargo pod strapped on its flatbed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3b4250",
  hullDark: "#20242e",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2e9a",
  glass: "#0c1a2a",
  tire: "#15161a",
  rim: "#8a93a3",
  podShell: "#d9dde3",
  podDark: "#4a5262",
  lamp: "#fff1b0",
  rust: "#7a4a2c",
};
const M = {
  chassisTop: [0, 1.2, 0] as [number, number, number],
  cabFloor: [0, 1.2, 2.75] as [number, number, number],
  flatbedDeck: [0, 1.45, -1.3] as [number, number, number],
  turretRing: [0, 2.75, 2.4] as [number, number, number],
  axleFront: [0, 0.55, 2.6] as [number, number, number],
  axleRear1: [0, 0.55, -1.2] as [number, number, number],
  axleRear2: [0, 0.55, -2.7] as [number, number, number],
  podBase: [0, 1.45, -1.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, at: number[], color: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const grime = paint((p, n) => {
    const wheelZ = [2.6, -1.2, -2.7];
    let d = 9;
    for (const z of wheelZ) d = Math.min(d, Math.hypot(p.z - z, p.y - 0.55));
    const t = smoothstep(1.1, 0.5, d) * (0.5 + 0.5 * noise(p, 0.3, 3));
    let c = mix(P.hullDark, P.rust, t * 0.8);
    const lo = smoothstep(0.9, 0.4, p.y) * 0.4;
    c = mix(c, "#0a0a0c", lo);
    return c;
  });
  const skirtPaint = paint((p, n) => {
    const u = Math.abs(n.x) > 0.5 ? p.z : p.x;
    const seam = Math.abs(((u / 0.6) % 1 + 1) % 1 - 0.5) > 0.47 || Math.abs(((p.y / 0.3) % 1 + 1) % 1 - 0.5) > 0.48;
    const base = mix(P.hull, P.hullDark, 0.3 * noise(p, 0.4, 5));
    return seam ? P.hullDark : base;
  });

  // ladder frame rails and cross members
  for (const s of [1, -1]) {
    box(0.18, 0.22, 7.0, [s * 0.65, 0.78, -0.4], P.hullDark);
    box(0.06, 0.2, 6.9, [s * 0.75, 0.8, -0.4], grime);
    // side skirts, chamfered
    b.part(new THREE.BoxGeometry(0.14, 0.42, 5.6), skirtPaint, { bone, at: [s * 1.42, 0.82, -0.6] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 5.6), P.trim, { bone, at: [s * 1.45, 1.06, -0.6] });
    // underglow
    glow(box(0.05, 0.04, 4.4, [s * 1.38, 0.52, -0.6], P.neonCyan), 1.6);
    // fuel tanks
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 8), P.rim, { bone, at: [s * 1.1, 0.7, 0.55], rotation: [90, 0, 0], flat: true });
    for (const z of [-0.1, 1.2]) box(0.62, 0.06, 0.1, [s * 1.1, 0.7, z], P.hullDark);
    // mudguards over each wheel
    for (const z of [2.6, -1.2, -2.7]) {
      b.part(new THREE.CylinderGeometry(0.75, 0.75, 0.55, 8, 1, false, 0, Math.PI), grime, { bone, at: [s * 1.2, 0.55, z], rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.77, 0.77, 0.08, 8, 1, false, 0, Math.PI), P.trim, { bone, at: [s * 1.2 + s * 0.28, 0.55, z], rotation: [0, 0, 90], flat: true });
    }
    // tail lights
    glow(box(0.35, 0.16, 0.06, [s * 1.1, 0.95, -4.02], P.neonMagenta), 2);
  }
  for (let i = 0; i < 8; i++) box(2.4, 0.14, 0.14, [0, 0.8, -3.7 + i * 0.95], P.hullDark);

  // underbody plate
  box(1.3, 0.1, 6.4, [0, 0.55, -0.3], grime);

  // axles and differentials
  for (const z of [2.6, -1.2, -2.7]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 8), P.rim, { bone, at: [0, 0.55, z], rotation: [0, 0, 90], flat: true });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), P.hullDark, { bone, at: [0, 0.55, z], flat: true });
    glow(box(0.2, 0.05, 0.05, [0, 0.55, z + 0.3], P.neonCyan), 1.5);
  }

  // rear bumper
  box(2.9, 0.34, 0.3, [0, 0.8, -3.9], P.hullDark);
  const chev = svg(`<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/><path d="M0 8L8 0H16L8 8ZM16 8L24 0H32L24 8ZM32 8L40 0H48L40 8ZM48 8L56 0H64L56 8Z" fill="#15161a"/></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(2.8, 0.2), "#ffffff", { bone, at: [0, 0.8, -4.06], dir: [0, 0, -1], axis: "z", texture: chev });

  // flatbed deck plate
  box(2.9, 0.12, 5.2, [0, 1.39, -1.3], P.hull);
  box(2.9, 0.13, 5.2, [0, 1.38, -1.3], skirtPaint);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.2, 5.2), "#ffffff", { bone, at: [s * 1.3, 1.452, -1.3], dir: [0, 1, 0], axis: "z", texture: svg(`<svg viewBox="0 0 8 64"><rect width="8" height="64" fill="#e7b814"/><path d="M0 0L8 8V16L0 8ZM0 16L8 24V32L0 24ZM0 32L8 40V48L0 40ZM0 48L8 56V64L0 56Z" fill="#15161a"/></svg>`, { size: 256 }) });
  }
  // cleats
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = -3.4 + i * 1.5;
      box(0.16, 0.12, 0.2, [s * 1.42, 1.5, z], P.trim);
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), P.rim, { bone, at: [s * 1.42, 1.58, z], flat: true });
    }
  // front crossmember
  box(2.6, 0.3, 0.3, [0, 0.9, 3.1], P.hullDark);
  glow(box(2.0, 0.04, 0.04, [0, 0.5, 3.0], P.neonMagenta), 1.4);
}
    return buildChassis;
  })(),
  // wheels
  (() => {
type Ctx = any;

function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const treadPaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const k = noise(p, 0.12, 4);
    const base: [number, number, number] = [0.08, 0.085, 0.1];
    const grime = mix(base, "#4a3a2c", smoothstep(0.55, 0.9, k) * 0.5 * (1 - Math.max(n.y, 0)));
    return grime;
  });
  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0b4a55"/><circle cx="32" cy="32" r="22" fill="none" stroke="#2ff3ff" stroke-width="4"/><path d="M32 12V52M12 32H52" stroke="#2ff3ff" stroke-width="4"/><circle cx="32" cy="32" r="8" fill="#c8ffff"/></svg>`,
    { size: 128 },
  );
  const rimPaint = paint((p: THREE.Vector3) => mix(P.rim, "#5a6272", noise(p, 0.1, 9)));

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleRear1[2]],
    ["wheelMR", -1, M.axleRear1[2]],
    ["wheelBL", 1, M.axleRear2[2]],
    ["wheelBR", -1, M.axleRear2[2]],
  ];

  const unitsAt = (s: number, dual: boolean) => (dual ? [0.0, 0.0] : [0.0]);

  for (const [name, s, z] of wheels) {
    const joint = J[name];
    const dual = z < 0;
    const cx = s * 1.2;
    // wheel layers: along x; dual rear gets two tyres
    const layers = dual ? [s * -0.0, s * 0.0] : [0];
    const offs = dual ? [-0.2, 0.2] : [0];
    void layers;
    void unitsAt;
    const width = dual ? 0.32 : 0.46;
    for (const o of offs) {
      const x = cx + s * o;
      // tyre: octagonal-ish cylinder
      b.part(new THREE.CylinderGeometry(R, R, width, 12), treadPaint, {
        bone: joint,
        at: [x, R, z],
        dir: [1, 0, 0],
        flat: true,
      });
      // tread ribs
      const ribs: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
        const g = new THREE.BoxGeometry(width * 1.02, 0.07, 0.16);
        g.rotateX(-a);
        g.translate(0, Math.cos(a) * R, Math.sin(a) * R);
        ribs.push(g);
      }
      for (const g of ribs) {
        g.translate(x, R, z);
        b.part(g, P.tire, { bone: joint, at: [0, 0, 0] });
      }
      // sidewall plate (outer face rim)
      const out = s * (width / 2 + 0.01);
      b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 10), rimPaint, {
        bone: joint,
        at: [x + out, R, z],
        dir: [1, 0, 0],
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 12), P.hullDark, {
        bone: joint,
        at: [x + out * 0.97, R, z],
        dir: [1, 0, 0],
        flat: true,
      });
    }
    // outer extent for hub features
    const outer = cx + s * ((dual ? 0.2 : 0) + (width / 2 + 0.04));
    // lug nuts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.trim, {
        bone: joint,
        at: [outer + s * 0.02, R + Math.cos(a) * 0.26, z + Math.sin(a) * 0.26],
        dir: [1, 0, 0],
        flat: true,
      });
    }
    // hub cap glowing
    const hub = b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", {
      bone: joint,
      at: [outer + s * 0.03, R, z],
      dir: [s, 0, 0],
      axis: "z",
      texture: hubTex,
    });
    glowKit(hub, 1.4);
    // hub boss ring
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), P.rim, {
      bone: joint,
      at: [outer + s * 0.005, R, z],
      dir: [1, 0, 0],
      flat: true,
    });
    // axle stub inside
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), P.hullDark, {
      bone: joint,
      at: [s * 0.95, R, z],
      dir: [1, 0, 0],
    });
  }
}
    return buildWheels;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const HULL = paint((p, n) => {
    const t = noise(p, 0.3, 4);
    const base = mix(P.hullDark, P.hull, 0.5 + 0.5 * smoothstep(-0.3, 0.9, n.y));
    return mix(base, P.hullDark, 0.25 * t);
  });
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true, ...extra });

  // Texture drawings
  const GLASS = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0c1a2a"/><path d="M4 28 L20 4 M16 28 L32 4 M28 28 L44 4" stroke="#2ff3ff" stroke-opacity="0.55" stroke-width="3"/></svg>`, { size: 128 });
  const INSIGNIA = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e7b814" stroke-width="4"/><path d="M32 10 L50 44 L32 36 L14 44Z" fill="#2ff3ff"/><text x="32" y="60" font-size="12" text-anchor="middle" fill="#e7b814" font-family="monospace" font-weight="bold">MK-IV</text></svg>`, { size: 128 });
  const NUM = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/><text x="32" y="25" font-size="24" text-anchor="middle" fill="#20242e" font-family="monospace" font-weight="bold">07</text></svg>`, { size: 128 });
  const CHEV = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#20242e"/><path d="M0 16 L8 0 L20 0 L12 16Z M24 16 L32 0 L44 0 L36 16Z M48 16 L56 0 L68 0 L60 16Z" fill="#e7b814"/></svg>`, { size: 128 });
  const GRILLE = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#20242e"/><g fill="#ff2e9a"><rect x="4" y="5" width="56" height="4"/><rect x="4" y="14" width="56" height="4"/><rect x="4" y="23" width="56" height="4"/></g></svg>`, { size: 128 });

  const tex = (w: number, h: number, t: any, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: t });

  // Main cab body: lower block
  box(2.7, 0.9, 2.4, HULL, [0, 1.65, 2.75]);
  // Upper wedge: sloped roof section
  box(2.4, 0.7, 1.5, HULL, [0, 2.4, 2.35]);
  // Sloped windscreen plate (tilted)
  box(2.3, 0.08, 0.95, HULL, [0, 2.2, 3.4], [-40, 0, 0]);
  box(2.0, 0.5, 0.06, P.glass, [0, 2.2, 3.5], [-40, 0, 0]);
  tex(1.9, 0.12, GLASS, [0, 2.22, 3.54], [0, 0.76, 0.64]);
  // Hood wedge
  box(2.6, 0.5, 1.0, HULL, [0, 1.95, 3.45], [18, 0, 0]);
  box(2.5, 0.12, 0.2, P.hullDark, [0, 2.12, 3.1]);
  // Front face & grille
  box(2.6, 0.8, 0.12, P.hullDark, [0, 1.7, 3.95]);
  glow(tex(1.7, 0.5, GRILLE, [0, 1.72, 4.02], [0, 0, 1]), 1.1);
  // Plough bumper
  box(2.9, 0.4, 0.3, P.hullDark, [0, 1.35, 3.95]);
  box(2.9, 0.22, 0.12, "#ffffff", [0, 1.35, 4.12], undefined, { texture: CHEV });
  b.part(new THREE.ConeGeometry(1.45, 0.5, 4), P.hull, { bone, at: [0, 1.3, 4.1], rotation: [90, 45, 0], scale: [1, 0.35, 0.5], flat: true });
  // Headlight bar
  glow(box(2.2, 0.1, 0.06, P.lamp, [0, 2.07, 4.02]), 1.6);
  for (const s of [1, -1]) {
    glow(box(0.28, 0.2, 0.08, P.lamp, [s * 1.12, 1.62, 3.99]), 1.5);
    // Fenders & side
    box(0.12, 0.7, 2.3, P.hullDark, [s * 1.35, 1.6, 2.75]);
    box(0.1, 0.06, 2.2, P.neonMagenta, [s * 1.4, 1.38, 2.75]);
    glow(b.part(new THREE.BoxGeometry(0.06, 0.05, 2.1), P.neonMagenta, { bone, at: [s * 1.41, 1.38, 2.75] }), 1.3);
    // Side windows
    box(0.06, 0.4, 1.1, P.glass, [s * 1.2, 2.45, 2.7]);
    tex(1.0, 0.34, GLASS, [s * 1.235, 2.45, 2.7], [s, 0, 0], [0, 1, 0]);
    // Door panels
    box(0.05, 0.6, 1.0, P.hullDark, [s * 1.37, 1.85, 2.7]);
    tex(0.4, 0.4, INSIGNIA, [s * 1.4, 1.95, 2.9], [s, 0, 0]);
    tex(0.32, 0.16, NUM, [s * 1.4, 1.65, 2.5], [s, 0, 0]);
    // Step plates
    box(0.3, 0.05, 0.6, P.trim, [s * 1.45, 1.1, 2.7]);
    box(0.3, 0.05, 0.4, P.hullDark, [s * 1.45, 1.2, 2.7]);
    // Mirrors
    b.rod([s * 1.35, 2.3, 3.3], [s * 1.7, 2.35, 3.35], 0.02, P.hullDark, { bone });
    box(0.08, 0.3, 0.18, P.hullDark, [s * 1.74, 2.35, 3.35]);
    glow(box(0.02, 0.24, 0.12, P.neonCyan, [s * 1.78, 2.35, 3.35]), 0.8);
    // Exhaust stacks behind cab
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 1.5, 8), P.rim, { bone, at: [s * 1.25, 2.2, 1.65], flat: true });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 8), P.hullDark, { bone, at: [s * 1.25, 2.98, 1.65], flat: true });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.1, 8), P.rust, { bone, at: [s * 1.25, 1.75, 1.65], flat: true });
    // Chamfer ribs
    box(0.08, 0.5, 0.08, P.trim, [s * 1.3, 2.05, 3.95]);
    // Antennas
    b.rod([s * 1.0, 2.75, 1.8], [s * 1.05, 3.5, 1.7], [0.015, 0.006], P.hullDark, { bone });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone, at: [s * 1.05, 3.5, 1.7] }), 1.5);
  }
  // Roof plates
  box(2.2, 0.08, 1.4, P.hull, [0, 2.78, 2.35]);
  box(1.0, 0.06, 0.9, P.hullDark, [0, 2.84, 2.4]);
  // Turret ring seat
  b.part(new THREE.CylinderGeometry(0.55, 0.62, 0.1, 10), P.hullDark, { bone, at: [M.turretRing[0], M.turretRing[1] - 0.02, M.turretRing[2]], flat: true });
  // Roof light bar
  box(1.6, 0.1, 0.14, P.hullDark, [0, 2.9, 3.15]);
  glow(box(0.7, 0.07, 0.1, P.neonCyan, [-0.4, 2.93, 3.16]), 1.4);
  glow(box(0.7, 0.07, 0.1, P.neonMagenta, [0.4, 2.93, 3.16]), 1.4);
  // Rear wall of cab
  box(2.6, 1.3, 0.1, P.hullDark, [0, 2.0, 1.55]);
  glow(box(2.0, 0.04, 0.04, P.neonCyan, [0, 2.6, 1.52]), 1.2);
  // Hazard trim along lower edge
  box(2.62, 0.08, 2.42, P.trim, [0, 1.24, 2.75]);
  // Armour ribs on roof
  for (let i = 0; i < 4; i++) box(2.3, 0.04, 0.05, P.trim, [0, 2.83, 1.9 + i * 0.3]);
}
    return buildCab;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const cx = M.turretRing[0], cy = M.turretRing[1], cz = M.turretRing[2];

  const HULL = paint((p, n) => {
    const t = n.y > 0.5 ? 1.12 : n.y < -0.3 ? 0.8 : 1;
    const c = new THREE.Color(P.hull).multiplyScalar(t);
    return [c.r, c.g, c.b];
  });
  const HAZ = stripes(P.trim, P.hullDark, { size: 0.08, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const STEEL = paint((p, n) => {
    const c = new THREE.Color(P.hullDark).lerp(new THREE.Color(P.rim), n.y > 0.5 ? 0.25 : 0.08);
    return [c.r, c.g, c.b];
  });

  const eyeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14061a"/><circle cx="32" cy="32" r="22" fill="#ff2e9a"/><circle cx="32" cy="32" r="12" fill="#ffd0ee"/><circle cx="32" cy="32" r="5" fill="#3a0020"/><circle cx="25" cy="25" r="3" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const badge = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#20242e"/><path d="M4 28 L16 4 L28 28Z M36 28 L48 4 L60 28Z" fill="#e7b814"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#2ff3ff" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // base ring (hazard) + collar
  b.part(new THREE.CylinderGeometry(0.5, 0.55, 0.1, 12), HAZ, { bone: yaw, at: [cx, cy + 0.05, cz], flat: true });
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.1, 12), STEEL, { bone: yaw, at: [cx, cy + 0.15, cz], flat: true });
  glow(b.part(new THREE.TorusGeometry(0.52, 0.012, 4, 24), P.neonCyan, {
    bone: yaw, at: [cx, cy + 0.1, cz], dir: [0, 1, 0], axis: "z",
  }), 1.5);

  // turret body: chamfered via lathe-like stacked boxes
  const by = cy + 0.38;
  b.part(new THREE.BoxGeometry(0.8, 0.3, 0.9), HULL, { bone: yaw, at: [cx, by, cz - 0.05], flat: true });
  b.part(new THREE.BoxGeometry(0.66, 0.1, 0.8), STEEL, { bone: yaw, at: [cx, by + 0.2, cz - 0.05], flat: true });
  // sloped front mantlet
  b.part(new THREE.CylinderGeometry(0.2, 0.34, 0.3, 4), HULL, {
    bone: yaw, at: [cx, by, cz + 0.5], rotation: [90, 45, 0], flat: true,
  });
  // chamfer wedges on sides
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.28, 0.8), HULL, {
      bone: yaw, at: [cx + s * 0.44, by - 0.02, cz - 0.05], rotation: [0, 0, s * 12], flat: true,
    });
    glow(b.part(new THREE.BoxGeometry(0.012, 0.03, 0.6), P.neonCyan, {
      bone: yaw, at: [cx + s * 0.485, by + 0.05, cz - 0.05],
    }), 1.5);
    // badge on side
    b.part(new THREE.PlaneGeometry(0.28, 0.14), "#ffffff", {
      bone: yaw, at: [cx + s * 0.491, by - 0.05, cz - 0.1], dir: [s, 0, 0], axis: "z", texture: badge,
    });
  }
  // ammo box on back
  b.part(new THREE.BoxGeometry(0.4, 0.22, 0.28), P.rust, { bone: yaw, at: [cx, by - 0.02, cz - 0.62], flat: true });
  b.part(new THREE.BoxGeometry(0.42, 0.04, 0.3), P.trim, { bone: yaw, at: [cx, by + 0.1, cz - 0.62], flat: true });
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.03), P.hullDark, { bone: yaw, at: [cx, by + 0.14, cz - 0.78] });

  // antenna
  b.rod([cx - 0.3, by + 0.25, cz - 0.3], [cx - 0.3, by + 0.65, cz - 0.3], 0.008, P.rim, { bone: yaw });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.neonMagenta, { bone: yaw, at: [cx - 0.3, by + 0.66, cz - 0.3] }), 2);

  // sensor eye on top
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), P.hullDark, { bone: yaw, at: [cx + 0.2, by + 0.3, cz + 0.15], flat: true });
  glow(b.part(new THREE.CircleGeometry(0.075, 12), "#ffffff", {
    bone: yaw, at: [cx + 0.2, by + 0.3, cz + 0.2], dir: [0, 0.3, 1], axis: "z", texture: eyeTex,
  }), 1.8);
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8, 1, true, 0, Math.PI), P.hullDark, {
    bone: yaw, at: [cx + 0.2, by + 0.37, cz + 0.17], rotation: [60, 0, 90], flat: true,
  });

  // gun cradle on pitch joint
  const gy = pitch.at.y, gz = pitch.at.z;
  b.part(new THREE.BoxGeometry(0.7, 0.2, 0.3), STEEL, { bone: pitch, at: [cx, gy - 0.12, gz + 0.35], flat: true });
  for (const s of [1, -1]) {
    const x = cx + s * 0.2;
    const y = gy - 0.12;
    b.rod([x, y, gz + 0.45], [x, y, cz + 1.3], 0.045, P.hullDark, { bone: pitch, sides: 8 });
    // heat sleeve
    b.rod([x, y, gz + 0.55], [x, y, cz + 1.0], 0.075, STEEL, { bone: pitch, sides: 8 });
    for (let i = 0; i < 4; i++) {
      const z = gz + 0.6 + i * 0.1;
      b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.015, 8), P.trim, {
        bone: pitch, at: [x, y, z], dir: [0, 0, 1],
      });
    }
    // muzzle brake
    b.rod([x, y, cz + 1.3], [x, y, cz + 1.42], 0.08, P.hullDark, { bone: pitch, sides: 6 });
    glow(b.part(new THREE.BoxGeometry(0.1, 0.012, 0.02), P.neonMagenta, { bone: pitch, at: [x, y + 0.04, cz + 1.36] }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.012, 0.1, 0.02), P.neonMagenta, { bone: pitch, at: [x + s * 0.04, y, cz + 1.36] }), 1.5);
  }
}
    return buildTurret;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const CY = 2.27, CZ = -1.32, W = 2.6, H = 1.5, L = 4.7;
  const HAZ = "#e7b814";

  const shellPaint = paint((p, n) => {
    const base = mix(P.podShell, "#b9c0cb", 1 - smoothstep(-0.6, 0.8, n.y));
    const seamZ = Math.abs(((p.z + 10) % 1.1) - 0.55) < 0.012;
    const seamY = Math.abs(p.y - CY) < 0.012;
    const grime = smoothstep(0.55, 0.8, noise(p, 0.3, 4)) * 0.25;
    const c = mix(base, "#5a5348", grime);
    return seamZ || seamY ? mix(c, P.podDark, 0.8) : c;
  });

  // main shell: chamfered by stacking boxes
  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  part(new THREE.BoxGeometry(W, H - 0.3, L), shellPaint, [0, CY, CZ]);
  part(new THREE.BoxGeometry(W - 0.3, H, L), shellPaint, [0, CY, CZ]);
  part(new THREE.BoxGeometry(W - 0.5, H + 0.12, L - 0.1), shellPaint, [0, CY + 0.02, CZ]);
  // end caps
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(W - 0.2, H - 0.2, 0.2), P.podDark, [0, CY, CZ + s * (L / 2 + 0.08)]);
    part(new THREE.CylinderGeometry(0.62, 0.7, 0.1, 8), P.hullDark, [0, CY, CZ + s * (L / 2 + 0.22)], { rotation: [90, 0, 0] });
  }

  // hazard bands
  const hazTex = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${HAZ}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#15161a"/>`).join("")}</svg>`, { size: 128 });
  for (const z of [CZ + L / 2 - 0.35, CZ - L / 2 + 0.35]) {
    for (const s of [1, -1])
      part(new THREE.BoxGeometry(0.03, 0.4, 0.5), "#ffffff", [s * (W / 2 + 0.01), CY - 0.1, z], { texture: hazTex });
    part(new THREE.BoxGeometry(W - 0.6, 0.03, 0.5), "#ffffff", [0, CY + H / 2 + 0.07, z], { texture: hazTex });
  }

  // strap bands, buckles, tie-downs
  for (const z of [0.5, -1.3, -3.1]) {
    part(new THREE.BoxGeometry(W + 0.04, H + 0.16, 0.16), P.hullDark, [0, CY + 0.04, z]);
    for (const s of [1, -1]) {
      part(new THREE.BoxGeometry(0.1, 0.2, 0.22), P.rim, [s * (W / 2 + 0.04), CY - 0.1, z]);
      part(new THREE.BoxGeometry(0.12, 0.5, 0.2), P.hullDark, [s * (W / 2 + 0.03), 1.7, z]);
      part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.rim, [s * (W / 2 + 0.1), 1.58, z], { rotation: [0, 90, 0] });
    }
    glow(part(new THREE.BoxGeometry(W + 0.08, 0.03, 0.04), P.neonCyan, [0, CY + 0.2, z + 0.1]), 1.3);
  }

  // neon seam lines along the sides
  for (const s of [1, -1]) {
    glow(part(new THREE.BoxGeometry(0.03, 0.04, L - 0.4), P.neonCyan, [s * (W / 2 - 0.1), CY + 0.35, CZ]), 1.5);
    glow(part(new THREE.BoxGeometry(0.03, 0.04, L - 0.4), P.neonCyan, [s * (W / 2 - 0.1), CY - 0.45, CZ]), 1.5);
  }
  glow(part(new THREE.BoxGeometry(0.04, 0.04, L - 0.4), P.neonCyan, [0, CY + H / 2 + 0.1, CZ]), 1.5);

  // logos
  const bio = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#15161a"/><g fill="none" stroke="${HAZ}" stroke-width="5"><circle cx="32" cy="22" r="10"/><circle cx="23" cy="38" r="10"/><circle cx="41" cy="38" r="10"/></g><circle cx="32" cy="32" r="4" fill="${HAZ}"/></svg>`, { size: 128 });
  const corp = svg(`<svg viewBox="0 0 96 32"><rect width="96" height="32" rx="4" fill="#15161a"/><path d="M6 26 L16 6 L26 26Z" fill="#ff2e9a"/><text x="32" y="23" font-family="sans-serif" font-weight="bold" font-size="16" fill="#2ff3ff">NOVACORP</text></svg>`, { size: 192 });
  for (const s of [1, -1]) {
    part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", [s * (W / 2 + 0.01), CY + 0.05, CZ - 0.9], { texture: bio, dir: [s, 0, 0], axis: "z" });
    part(new THREE.PlaneGeometry(1.2, 0.4), "#ffffff", [s * (W / 2 + 0.01), CY - 0.3, CZ + 1.5], { texture: corp, dir: [s, 0, 0], axis: "z" });
  }

  // rear lock plate with keypad
  const zr = CZ - L / 2 - 0.34;
  part(new THREE.BoxGeometry(1.1, 0.9, 0.08), P.hullDark, [0, CY, zr + 0.04]);
  const lock = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ff2e9a"/><rect x="6" y="5" width="52" height="14" fill="#2a0a1c"/><text x="32" y="16" text-anchor="middle" font-family="monospace" font-size="11" fill="#2ff3ff">LOCKED</text>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${10 + c * 16}" y="${24 + r * 9}" width="12" height="6" fill="#ffd0ea" stroke="#2a0a1c"/>`).join("")).join("")}</svg>`, { size: 128 });
  glow(part(new THREE.PlaneGeometry(0.85, 0.85), "#ffffff", [0, CY, zr - 0.01], { texture: lock, dir: [0, 0, -1], axis: "z" }), 1.4);
  // status display
  const stat = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#052a30"/><path d="M2 18 L12 10 L22 15 L34 5 L46 12 L62 6" stroke="#2ff3ff" stroke-width="2" fill="none"/></svg>`, { size: 128 });
  glow(part(new THREE.PlaneGeometry(0.7, 0.26), "#ffffff", [0, CY + 0.62, zr - 0.01], { texture: stat, dir: [0, 0, -1], axis: "z" }), 1.2);

  // vents on top
  const rr = rng0();
  for (let i = 0; i < 2; i++) {
    const x = (i ? 1 : -1) * 0.5, z = CZ + 1.0;
    part(new THREE.BoxGeometry(0.6, 0.1, 0.7), P.hullDark, [x, CY + H / 2 + 0.1, z]);
    for (let k = 0; k < 5; k++) part(new THREE.BoxGeometry(0.54, 0.04, 0.04), P.trim, [x, CY + H / 2 + 0.17, z - 0.28 + k * 0.14]);
  }
  // antenna
  b.rod([0.9, CY + H / 2 + 0.1, CZ - 1.8], [0.9, 3.05, CZ - 1.8], 0.02, P.rim, { bone });
  glow(part(new THREE.SphereGeometry(0.05, 6, 4), P.neonMagenta, [0.9, 3.08, CZ - 1.8]), 2);
  void rr;

  function rng0() { return 0; }
}
    return buildCargoPod;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.75,2.4], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,3,2.5], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.55,2.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.55,2.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.55,-1.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.55,-1.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelBL"] = b.joint("wheelBL", { parent: J["body"], at: [1.2,0.55,-2.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelBR"] = b.joint("wheelBR", { parent: J["body"], at: [-1.2,0.55,-2.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
