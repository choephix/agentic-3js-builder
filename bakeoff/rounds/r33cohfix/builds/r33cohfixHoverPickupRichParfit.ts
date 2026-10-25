import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, aim, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to ride on four ducted hover thrusters, in low-poly cyberpunk style with neon underglow and armour plating."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2f3540",
  hullLight: "#4a5361",
  armor: "#1d2128",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  glass: "#14304a",
  rubber: "#101114",
  metal: "#8a929e",
  rust: "#7a4a2a",
  lamp: "#fff4c0",
  thrustCore: "#bff9ff",
};
const M = {
  bodyCenter: [0, 1, 0] as [number, number, number],
  chassisTop: [0, 1, 0] as [number, number, number],
  hoodFront: [0, 1, 2.7] as [number, number, number],
  cabFloor: [0, 1, 0.3] as [number, number, number],
  bedFloor: [0, 1, -1.7] as [number, number, number],
  gunPintle: [0, 1.35, -1.6] as [number, number, number],
  podFL: [0.95, 0.5, 1.7] as [number, number, number],
  podFR: [-0.95, 0.5, 1.7] as [number, number, number],
  podRL: [0.95, 0.5, -1.6] as [number, number, number],
  podRR: [-0.95, 0.5, -1.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Hazard stripe paint for sills
  const HAZ = paint((p) => {
    const k = Math.floor((p.z + p.y * 0.5) / 0.12) % 2;
    return k ? P.trim : P.armor;
  });
  const GRIME = paint((p, n) => {
    const g = noise(p, 0.18, 4);
    const base = mix(P.hull, P.armor, smoothstep(0.35, 0.8, g) * 0.8);
    return mix(base, P.rust, smoothstep(0.7, 0.9, noise(p, 0.1, 9)) * 0.5 * smoothstep(0.2, -0.6, n.y));
  });
  const BELLY = paint((p, n) => {
    const seam = Math.abs(((p.z / 0.5) % 1) - 0.5) > 0.47 || Math.abs(((p.x / 0.4) % 1) - 0.5) > 0.48;
    return seam ? P.rubber : mix(P.armor, P.hull, noise(p, 0.2, 2) * 0.5);
  });

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...extra });

  // Main frame slab (faceted: tapered front and rear)
  b.frustumBox([0, 0.78, -2.3], [0, 0.78, 2.3], [2.0, 0.3], [2.0, 0.3], { bone: body, color: GRIME });
  box(1.5, 0.12, 4.9, BELLY, [0, 0.58, 0]); // belly plate
  // chamfered nose/tail wedges
  box(1.7, 0.2, 0.3, P.armor, [0, 0.64, 2.45], { rotation: [-18, 0, 0] });
  box(1.7, 0.2, 0.3, P.armor, [0, 0.64, -2.45], { rotation: [18, 0, 0] });

  // Side sills with hazard paint and bolt rows
  for (const s of [1, -1]) {
    box(0.22, 0.26, 4.4, HAZ, [s * 1.05, 0.72, 0]);
    box(0.06, 0.3, 4.5, P.armor, [s * 1.17, 0.78, 0]);
    for (let i = 0; i < 12; i++)
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.metal, {
        bone: body, at: [s * 1.2, 0.84, -2 + i * 0.37], dir: [s, 0, 0],
      });
    // underglow magenta strips
    glow(box(0.05, 0.04, 4.0, P.neonMagenta, [s * 0.95, 0.5, 0]), 1.6);
    // battery packs
    for (const z of [-0.9, 0.1, 1.1]) {
      box(0.5, 0.18, 0.85, P.hullLight, [s * 0.55, 0.6, z]);
      box(0.4, 0.04, 0.7, P.neonCyan, [s * 0.55, 0.5, z]);
    }
  }
  glow(box(0.04, 0.04, 4.2, P.neonCyan, [0, 0.5, 0]), 1.2);

  // Crossmembers
  for (const z of [-2.3, -1.2, -0.3, 0.8, 1.9, 2.4])
    box(2.3, 0.14, 0.14, P.armor, [0, 0.62, z]);
  // Top deck rails
  for (const s of [1, -1]) b.rod([s * 0.8, 1.0, -2.4], [s * 0.8, 1.0, 2.4], 0.05, P.hullLight, { bone: body });

  // Cyan conduit pipes
  for (const s of [1, -1]) {
    b.sweep([[s * 0.3, 0.55, -2.3], [s * 0.3, 0.55, 0], [s * 0.2, 0.55, 2.3]], 0.03, { bone: body, color: P.neonCyan });
    for (let i = 0; i < 6; i++)
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 6), P.metal, {
        bone: body, at: [s * 0.28, 0.55, -2 + i * 0.8], dir: [0, 0, 1],
      });
  }

  // Pylon arms to pods
  const pods = [M.podFL, M.podFR, M.podRL, M.podRR];
  for (const m of pods) {
    const s = Math.sign(m[0]);
    const start = V(s * 0.85, 0.82, m[2]);
    const end = V(m[0], m[1] + 0.05, m[2]);
    b.rod(start, end, [0.1, 0.08], P.hull, { bone: body, sides: 6 });
    b.rod(V(s * 0.8, 0.65, m[2] + 0.2), V(m[0], m[1] - 0.05, m[2] + 0.1), 0.05, P.armor, { bone: body });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8), P.trim, {
      bone: body, at: [m[0] - s * 0.08, m[1] + 0.05, m[2]], dir: [1, 0, 0],
    });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [s * 0.88, 0.7, m[2]] }), 1.5);
  }

  // Decal: stencil label on sill
  const stencil = svg(`<svg viewBox="0 0 64 16"><text x="32" y="13" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#e7b814">HT-07</text></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
      bone: body, at: [s * 1.205, 0.92, 0.0], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: stencil,
    });
}
    return buildChassis;
  })(),
  // podsFront
  (() => {
function buildPodsFront({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const fanTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#0b3a48"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M32 32 L${32 + 30 * Math.cos((i * 40 * Math.PI) / 180)} ${32 + 30 * Math.sin((i * 40 * Math.PI) / 180)} L${32 + 30 * Math.cos(((i * 40 + 22) * Math.PI) / 180)} ${32 + 30 * Math.sin(((i * 40 + 22) * Math.PI) / 180)}Z" fill="#7ff8ff" stroke="#e8ffff" stroke-width="1"/>`).join("") +
      `<circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const glowTex = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2ff3ff" stop-opacity="0"/><stop offset="1" stop-color="#bff9ff"/></linearGradient></defs><path d="M2 0 L30 0 L22 62 L10 62Z" fill="url(#g)"/></svg>`,
    { size: 64 },
  );
  const hazard = paint((_p, _n, s) => (((s[0] * 40 + s[1] / 20) % 2 + 2) % 2 < 1 ? P.trim : P.armor));
  const shroud = paint((p, n) => {
    const t = n.y > 0.5 ? 1.1 : 0.85;
    const c = new THREE.Color(P.hull).multiplyScalar(t);
    return [c.r, c.g, c.b] as const;
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "FL" : "FR";
    const j = J["pod" + side];
    const at = (x: number, y: number, z: number): [number, number, number] => [M["pod" + side][0] + s * x, y, M["pod" + side][2] + z];
    const cx = M["pod" + side][0] - s * 0.25;
    const cz = M["pod" + side][2];
    const cy = 0.37;
    // drum
    b.part(new THREE.CylinderGeometry(0.46, 0.4, 0.74, 10), shroud, { bone: j, at: [cx, cy, cz], flat: true });
    // hazard band
    b.part(new THREE.CylinderGeometry(0.475, 0.475, 0.1, 10, 1, true), hazard, { bone: j, at: [cx, 0.5, cz], flat: true });
    // bottom lip ring
    b.part(new THREE.TorusGeometry(0.4, 0.04, 5, 10), P.armor, { bone: j, at: [cx, 0.04, cz], rotation: [90, 0, 0], flat: true });
    // inner dark well
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 10), P.rubber, { bone: j, at: [cx, 0.08, cz] });
    // fan disc facing down
    glow(
      b.part(new THREE.CircleGeometry(0.33, 12), "#ffffff", { bone: j, at: [cx, 0.06, cz], dir: [0, -1, 0], axis: "z", texture: fanTex }),
      1.6,
    );
    // hub
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), P.thrustCore, { bone: j, at: [cx, 0.04, cz] }), 2);
    // thrust glow cards (hover gap)
    glow(
      b.part(new THREE.PlaneGeometry(0.6, 0.06), "#ffffff", { bone: j, at: [cx, 0.01, cz], dir: [0, 1, 0], axis: "z", texture: glowTex }),
      1,
    );
    // intake grille on top
    b.part(new THREE.CylinderGeometry(0.36, 0.4, 0.06, 10), P.armor, { bone: j, at: [cx, 0.76, cz], flat: true });
    for (let i = -2; i <= 2; i++)
      b.part(new THREE.BoxGeometry(0.7, 0.04, 0.035), P.metal, { bone: j, at: [cx, 0.8, cz + i * 0.12] });
    b.part(new THREE.BoxGeometry(0.035, 0.04, 0.7), P.metal, { bone: j, at: [cx, 0.81, cz] });
    // collar
    b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.1, 8), P.armor, { bone: j, at: [cx, 0.72, cz], flat: true });
    // magenta ring accent
    glow(b.part(new THREE.TorusGeometry(0.46, 0.012, 4, 10), P.neonMagenta, { bone: j, at: [cx, 0.62, cz], rotation: [90, 0, 0] }), 1.5);
    // stabiliser fins
    for (const f of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.03, 0.34, 0.3), P.hullLight, {
        bone: j, at: [cx + s * 0.42, 0.3, cz + f * 0.12], rotation: [0, 0, -s * 14], flat: true,
      });
    }
    b.part(new THREE.BoxGeometry(0.34, 0.3, 0.03), P.hullLight, { bone: j, at: [cx - s * 0.02, 0.3, cz + 0.48], flat: true });
    // rivets
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + R() * 0.1;
      b.part(new THREE.SphereGeometry(0.02, 4, 3), P.metal, { bone: j, at: [cx + Math.cos(a) * 0.45, 0.66, cz + Math.sin(a) * 0.45] });
    }
  }
}
    return buildPodsFront;
  })(),
  // podsRear
  (() => {
function buildPodsRear({ b, J, P, M }: Ctx) {
  const fanTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0b3a44"/>${Array.from({ length: 9 }, (_, i) => {
      const a = (i * 40 * Math.PI) / 180;
      const x1 = 50 + Math.cos(a) * 46, y1 = 50 + Math.sin(a) * 46;
      const x2 = 50 + Math.cos(a + 0.7) * 46, y2 = 50 + Math.sin(a + 0.7) * 46;
      return `<path d="M50 50 L${x1} ${y1} L${x2} ${y2}Z" fill="#2ff3ff" stroke="#bff9ff" stroke-width="1.5"/>`;
    }).join("")}<circle cx="50" cy="50" r="9" fill="#bff9ff"/></svg>`,
    { size: 128 },
  );
  const glowTex = svg(
    `<svg viewBox="0 0 64 128"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2ff3ff" stop-opacity="0.9"/><stop offset="1" stop-color="#2ff3ff" stop-opacity="0"/></linearGradient></defs><path d="M10 0H54L62 128H2Z" fill="url(#g)"/></svg>`,
    { size: 64 },
  );
  const hazard = paint((p) => (Math.floor((p.x + p.z) / 0.06) % 2 ? P.trim : P.armor));
  const shell = paint((p, n) => {
    const c = mix(P.hull, P.hullLight, noise(p, 0.15, 3) * 0.6 + n.y * 0.2);
    return mix(c, P.rubber, 0.5 * smoothstep(0.6, 0.9, noise(p, 0.05, 8)) * (1 - smoothstep(0.1, 0.4, p.y)));
  });

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.podRL : J.podRR;
    const cx = s * 0.95, cz = -1.6;
    const R = 0.5;
    // drum
    b.part(new THREE.CylinderGeometry(R, R * 0.92, 0.6, 10), shell, { bone, at: [cx, 0.38, cz], flat: true });
    // hazard band
    b.part(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.09, 10, 1, true), hazard, { bone, at: [cx, 0.5, cz] });
    // bottom lip ring (lowest points at y=0)
    b.part(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.06, 10), P.armor, { bone, at: [cx, 0.03, cz], flat: true });
    // fan disc facing down
    glow(
      b.part(new THREE.CircleGeometry(R * 0.82, 16), "#ffffff", {
        bone, at: [cx, 0.07, cz], dir: [0, -1, 0], axis: "z", texture: fanTex,
      }),
      1.4,
    );
    glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), P.thrustCore, { bone, at: [cx, 0.075, cz] }), 1.6);
    // inner ring magenta
    glow(b.part(new THREE.TorusGeometry(R * 0.86, 0.02, 4, 16), P.neonMagenta, { bone, at: [cx, 0.09, cz], dir: [0, 1, 0], axis: "z" }), 1.3);
    glow(b.part(new THREE.TorusGeometry(R + 0.02, 0.018, 4, 16), P.neonMagenta, { bone, at: [cx, 0.28, cz], dir: [0, 1, 0], axis: "z" }), 1.3);
    // top cap and grille
    b.part(new THREE.CylinderGeometry(R * 0.85, R, 0.1, 10), P.armor, { bone, at: [cx, 0.72, cz], flat: true });
    for (let i = -2; i <= 2; i++)
      b.part(new THREE.BoxGeometry(0.8, 0.03, 0.04), P.metal, { bone, at: [cx, 0.78, cz + i * 0.14] });
    // collar
    b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 8), P.hullLight, { bone, at: [cx - s * 0.1, 0.72, cz], flat: true });
    // rear vents
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.34, 0.03, 0.03), P.armor, { bone, at: [cx, 0.22 + i * 0.1, cz - R + 0.005] });
      glow(b.part(new THREE.BoxGeometry(0.28, 0.012, 0.02), P.neonCyan, { bone, at: [cx, 0.235 + i * 0.1, cz - R - 0.008] }), 1.2);
    }
    // stabiliser fins
    for (const dz of [0.5, -0.5])
      b.extrude([[0, 0], [0.22, 0], [0.04, 0.3]], {
        at: [cx + s * (R - 0.02), 0.2, cz + dz * 0.8], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.03, color: P.armor, bone,
      });
    // rivets
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.02, 4, 3), P.metal, { bone, at: [cx + Math.cos(a) * R * 0.97, 0.62, cz + Math.sin(a) * R * 0.97] });
    }
    // thrust glow cone card (hangs down, faint, within floor)

    b.part(new THREE.PlaneGeometry(0.7, 0.06), "#ffffff", { bone, at: [cx, 0.01, cz], dir: [0, 1, 0], axis: "z", texture: glowTex });
  }
}
    return buildPodsRear;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const HULL = paint((p, n) => {
    const g = noise(p, 0.15, 3);
    let c = mix(P.hull, P.hullLight, n.y > 0.5 ? 0.5 : g * 0.3);
    const seam = Math.abs(((p.z * 4) % 1)) < 0.015 || Math.abs(((p.y * 5) % 1)) < 0.012;
    if (seam) c = mix(c, P.armor, 0.8);
    if (p.y < 1.25) c = mix(c, P.rust, 0.25 * smoothstep(0.4, 0.8, noise(p, 0.1, 9)));
    return c;
  });
  const ARM = paint((p) => mix(P.armor, P.hull, noise(p, 0.2, 5) * 0.4));
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true, ...opt });

  // lower body
  box(2.1, 0.55, 2.0, HULL, [0, 1.3, 0.1]);
  // cabin upper block
  box(1.9, 0.6, 1.5, HULL, [0, 1.85, -0.1]);
  // sloped roof
  box(1.85, 0.08, 1.3, ARM, [0, 2.1, -0.15]);
  // sloped windshield frame (raked)
  box(1.9, 0.08, 0.7, HULL, [0, 1.85, 0.72], [-38, 0, 0]);
  // rear wall
  box(2.0, 0.9, 0.1, ARM, [0, 1.75, -0.88]);

  // glass
  const streak = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#14304a"/><path d="M8 64 L28 0 L38 0 L18 64Z" fill="#5aa8d8" opacity="0.5"/><path d="M40 64 L52 0 L56 0 L44 64Z" fill="#8fd8ff" opacity="0.4"/></svg>`,
    { size: 128 },
  );
  const glass = (w: number, h: number, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: streak });
  glass(1.5, 0.48, [0, 1.9, 0.92], [0, 0.6, 0.8], [0, 0.8, -0.6]);
  glass(1.3, 0.4, [0, 1.85, -0.94], [0, 0, -1], [0, 1, 0]);
  for (const s of [1, -1]) {
    glass(1.15, 0.4, [s * 0.96, 1.87, 0.0], [s, 0, 0], [0, 1, 0]);
    // shutters half raised
    box(0.05, 0.16, 1.2, ARM, [s * 0.97, 2.05, 0.0]);
    // door panels
    box(0.06, 0.5, 0.95, ARM, [s * 1.06, 1.3, 0.55]);
    box(0.06, 0.5, 0.9, ARM, [s * 1.06, 1.3, -0.4]);
    // handles
    for (const z of [0.2, -0.7]) box(0.05, 0.04, 0.18, P.metal, [s * 1.1, 1.45, z]);
    // yellow trim stripe
    box(0.07, 0.05, 1.95, P.trim, [s * 1.07, 1.1, 0.1]);
    // pillars
    box(0.1, 0.65, 0.1, ARM, [s * 0.93, 1.85, 0.5], [-35, 0, 0]);
    box(0.12, 0.65, 0.14, ARM, [s * 0.95, 1.85, -0.85]);
    // mirrors
    box(0.06, 0.2, 0.14, ARM, [s * 1.2, 1.78, 0.6]);
    glow(box(0.02, 0.18, 0.02, P.neonCyan, [s * 1.24, 1.78, 0.6]), 1.5);
    b.rod([s * 1.04, 1.72, 0.55], [s * 1.18, 1.76, 0.6], 0.015, P.metal, { bone });
    // faction emblem decal
    const emb = svg(
      `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#e7b814" stroke-width="3"/><path d="M16 6 L24 24 L8 24Z" fill="#ff2fa8"/></svg>`,
      { size: 96 },
    );
    b.part(new THREE.PlaneGeometry(0.36, 0.36), "#ffffff", {
      bone, at: [s * 1.095, 1.3, 0.55], dir: [s, 0, 0], axis: "z", texture: emb,
    });
  }

  // roof rack
  for (const s of [1, -1]) b.rod([s * 0.7, 2.2, 0.4], [s * 0.7, 2.2, -0.6], 0.025, P.metal, { bone });
  for (const z of [0.4, 0, -0.6]) b.rod([-0.7, 2.2, z], [0.7, 2.2, z], 0.02, P.metal, { bone });
  for (const s of [1, -1]) for (const z of [0.4, -0.6]) b.rod([s * 0.7, 2.14, z], [s * 0.7, 2.2, z], 0.02, P.armor, { bone });
  // antenna
  b.spike([-0.6, 2.0, -0.6], [0, 1, 0], 0.08, 0.015, { bone, color: P.metal });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.neonMagenta, { bone, at: [-0.6, 2.08, -0.6] }), 2);

  // interior
  box(1.6, 0.14, 0.3, P.rubber, [0, 1.62, 0.75]); // dash
  glow(box(0.3, 0.02, 0.1, P.neonCyan, [0.3, 1.7, 0.74]), 1.2);
  b.part(new THREE.TorusGeometry(0.13, 0.02, 5, 10), P.rubber, { bone, at: [0.38, 1.72, 0.45], rotation: [-60, 0, 0] });
  for (const s of [1, -1]) {
    box(0.45, 0.1, 0.45, P.rubber, [s * 0.4, 1.58, 0.0]);
    box(0.45, 0.5, 0.1, P.rubber, [s * 0.4, 1.85, -0.3], [-8, 0, 0]);
    box(0.2, 0.15, 0.08, P.rubber, [s * 0.4, 2.15, -0.32]);
  }
  // rear wall lamp strip
  glow(box(1.6, 0.03, 0.03, P.neonMagenta, [0, 2.06, -0.94]), 1.5);
  // roof edge neon
  glow(box(1.7, 0.02, 0.03, P.neonCyan, [0, 2.07, 0.5]), 1.3);
  // roof hazard ribs
  for (const z of [0.2, -0.3]) box(1.7, 0.03, 0.05, P.trim, [0, 2.15, z]);
}
    return buildCab;
  })(),
  // hoodFront
  (() => {
function buildHoodFront({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const BLACK = "#0a0a0c";
  const PINK_D = "#7a1050";
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true });

  const hullPaint = paint((p, n) => {
    const g = noise(p, 0.12, 3);
    const base = mix(P.hull, P.hullLight, n.y > 0.5 ? 0.5 * smoothstep(0.3, 0.8, g) : 0.1);
    const grime = smoothstep(0.55, 0.85, noise(p, 0.05, 9)) * (p.y < 1.0 ? 0.6 : 0.25);
    const seam = Math.abs(((p.x * 3.3) % 1)) < 0.015 && n.y > 0.5 ? 0.5 : 0;
    return mix(mix(base, P.rust, grime * 0.5), BLACK, seam);
  });

  // hood: sloped slab via extruded side profile
  const prof: [number, number][] = [[1.1, 1.0], [2.5, 1.0], [2.65, 1.2], [2.3, 1.45], [1.1, 1.6]];
  b.extrude(prof, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bone, color: hullPaint });

  // front fascia
  box(2.2, 0.5, 0.12, P.armor, [0, 1.12, 2.62]);
  // hood centre scoop
  box(0.7, 0.14, 0.7, P.armor, [0, 1.52, 1.75], [-9, 0, 0]);
  box(0.5, 0.05, 0.5, BLACK, [0, 1.6, 1.78], [-9, 0, 0]);
  // vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      box(0.3, 0.02, 0.05, BLACK, [s * 0.7, 1.5 - i * 0.012, 1.4 + i * 0.12], [-12, 0, 0]);
      box(0.3, 0.015, 0.02, P.trim, [s * 0.7, 1.505, 1.46 + i * 0.12], [-12, 0, 0]);
    }

  // grille
  box(1.1, 0.4, 0.06, BLACK, [0, 1.12, 2.68]);
  for (let i = 0; i < 6; i++) glow(box(0.95, 0.025, 0.02, P.neonCyan, [0, 0.98 + i * 0.065, 2.715]), 1.4);
  box(1.14, 0.03, 0.08, P.metal, [0, 1.33, 2.69]);
  box(1.14, 0.03, 0.08, P.metal, [0, 0.91, 2.69]);

  // magenta light bar
  glow(box(2.0, 0.07, 0.07, P.neonMagenta, [0, 1.38, 2.7]), 1.8);
  box(2.1, 0.03, 0.09, P.armor, [0, 1.43, 2.69]);

  // headlamps
  for (const s of [1, -1]) {
    box(0.4, 0.24, 0.1, P.armor, [s * 0.8, 1.13, 2.66]);
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 8), P.lamp, { bone, at: [s * 0.8, 1.13, 2.73], rotation: [90, 0, 0], flat: true }), 1.6);
    glow(box(0.3, 0.025, 0.02, P.neonCyan, [s * 0.8, 1.01, 2.72]), 1.2);
  }

  // bumper ram, hazard striped
  const hazard = paint((p, n) => {
    const k = Math.floor((p.x + p.y) / 0.12) % 2 === 0;
    return k ? P.trim : BLACK;
  });
  box(2.3, 0.22, 0.28, hazard, [0, 0.86, 2.6]);
  box(2.0, 0.1, 0.3, P.armor, [0, 0.76, 2.56]);
  for (const s of [1, -1]) {
    // bull bar
    b.rod([s * 0.75, 0.9, 2.65], [s * 0.75, 1.42, 2.68], 0.04, P.metal, { bone });
    b.rod([s * 0.2, 0.9, 2.68], [s * 0.2, 1.3, 2.7], 0.03, P.metal, { bone });
    // tow hooks
    b.rod([s * 1.0, 0.82, 2.6], [s * 1.0, 0.82, 2.66], 0.03, P.trim, { bone });
    box(0.08, 0.1, 0.06, P.trim, [s * 1.0, 0.82, 2.67]);
  }
  // bull bar top rail
  b.rod([-0.78, 1.42, 2.7], [0.78, 1.42, 2.7], 0.035, P.metal, { bone });

  // winch
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), P.metal, { bone, at: [0, 0.78, 2.66], rotation: [0, 0, 90], flat: true });
  box(0.5, 0.05, 0.1, P.armor, [0, 0.72, 2.66]);

  // plate decal
  const plate = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#e8e8d8" stroke="#111" stroke-width="2"/><text x="32" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#111">HVR-77</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", { bone, at: [0, 0.86, 2.755], dir: [0, 0, 1], axis: "z", texture: plate });

  // fender flares over pods
  for (const s of [1, -1]) {
    box(0.4, 0.42, 1.2, P.armor, [s * 1.0, 1.05, 1.7]);
    box(0.12, 0.1, 1.3, P.hullLight, [s * 1.14, 1.28, 1.7], [0, 0, s * -15]);
    box(0.5, 0.06, 1.1, hazard, [s * 1.06, 0.82, 1.7]);
    glow(box(0.04, 0.04, 1.1, P.neonCyan, [s * 1.2, 0.9, 1.7]), 1.2);
    // rivets
    for (let i = 0; i < 5; i++)
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.metal, { bone, at: [s * 1.21, 1.1, 1.2 + i * 0.25] });
  }
  // side panel lines on hood edge
  for (const s of [1, -1]) box(0.04, 0.3, 1.5, P.armor, [s * 0.98, 1.2, 1.85]);
}
    return buildHoodFront;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });

  const panel = (base: string, line: string) =>
    paint((p, n) => {
      const ax = Math.abs(n.x) > 0.5;
      const u = ax ? p.z : p.x;
      const v = p.y;
      const du = Math.abs(((u / 0.45) % 1 + 1) % 1 - 0.5);
      const dv = Math.abs(((v / 0.3) % 1 + 1) % 1 - 0.5);
      const grime = Math.max(0, 0.3 - p.y + 0.8) * 0.3;
      if (du > 0.48 || dv > 0.47) return line;
      return grime > 0.1 ? P.armor : base;
    });
  const HULLP = panel(P.hull, P.armor);
  const FLOOR = paint((p, _n) => (Math.abs(((p.z / 0.12) % 1 + 1) % 1 - 0.5) > 0.4 ? P.armor : P.hullLight));
  const HAZ = paint((p) => (Math.floor((p.x + p.z) / 0.14) % 2 === 0 ? P.trim : P.rubber));

  // floor deck and ribs
  box(2.2, 0.08, 1.7, FLOOR, [0, 0.98, -1.75]);
  // side walls
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.8, HULLP, [s * 1.1, 1.3, -1.8]);
    box(0.14, 0.06, 1.84, P.hullLight, [s * 1.1, 1.58, -1.8]);
    box(0.12, 0.08, 1.6, HAZ, [s * 1.1, 1.12, -1.8]);
    // rear fender flares above pods
    box(0.3, 0.1, 0.95, P.armor, [s * 1.18, 1.52, -1.6], { rotation: [0, 0, s * -12] });
    box(0.06, 0.4, 0.95, P.armor, [s * 1.14, 1.3, -1.6]);
    // tail light bars
    b.part(new THREE.BoxGeometry(0.4, 0.1, 0.05), P.neonMagenta, { bone, at: [s * 0.8, 1.35, -2.66], flat: true });
  }
  // tailgate
  box(2.2, 0.5, 0.1, HULLP, [0, 1.3, -2.62]);
  box(2.0, 0.06, 0.06, P.neonMagenta, [0, 1.5, -2.69]);
  // bumper
  box(2.4, 0.2, 0.2, HAZ, [0, 0.9, -2.65]);
  // front wall
  box(2.2, 0.55, 0.1, HULLP, [0, 1.3, -0.95]);
  // roll bar
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 1.05, -1.0], [s * 0.95, 1.85, -1.0], 0.04, P.metal, { bone });
  }
  b.rod([0.95, 1.85, -1.0], [-0.95, 1.85, -1.0], 0.04, P.metal, { bone });
  b.rod([0.95, 1.5, -1.0], [-0.95, 1.5, -1.0], 0.03, P.trim, { bone });

  // gun base plate
  b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 4), P.armor, { bone, at: [0, 1.06, -1.6], rotation: [0, 45, 0], flat: true });
  for (const [x, z] of [[0.18, 0.18], [-0.18, 0.18], [0.18, -0.18], [-0.18, -0.18]])
    b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [x, 1.11, -1.6 + z] });

  // tie-down rings
  for (const s of [1, -1])
    for (const z of [-1.3, -2.2])
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, { bone, at: [s * 1.03, 1.1, z], rotation: [90, 0, 0] });

  // ammo crates
  box(0.45, 0.28, 0.35, P.rust, [0.7, 1.16, -1.2]);
  box(0.4, 0.26, 0.32, P.hullLight, [0.7, 1.43, -1.2], { rotation: [0, 8, 0] });
  box(0.45, 0.28, 0.35, P.trim, [0.15, 1.16, -1.15]);
  box(0.46, 0.04, 0.1, P.rubber, [0.7, 1.31, -1.2]);
  // fuel drum
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 10), P.rust, { bone, at: [-0.7, 1.3, -1.25] });
  for (const y of [1.15, 1.45])
    b.part(new THREE.CylinderGeometry(0.225, 0.225, 0.04, 10), P.metal, { bone, at: [-0.7, y, -1.25] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6), P.trim, { bone, at: [-0.7, 1.59, -1.25] });
}
    return buildCargoBed;
  })(),
  // gun
  (() => {
function buildGun({ b, J, P, M }: Ctx) {
  const mount = J.gunMount;
  const barrel = J.gunBarrel;
  const BRASS = "#c8903a";
  const DARK = "#14161b";

  const worn = (base: string, dirt: string) =>
    paint((p, n) => {
      const g = noise(p, 0.08, 3);
      const c = mix(base, dirt, smoothstep(0.55, 0.85, g) * 0.6);
      const k = 0.85 + 0.15 * n.y;
      return [c[0] * k, c[1] * k, c[2] * k];
    });
  const HULL = worn(P.hull, P.armor);
  const ARMOR = worn(P.armor, P.rust);
  const METAL = worn(P.metal, P.rust);

  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], bone: any, opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, ...opt });

  const X = 0, Y = 1.35, Z = -1.6;
  // Pedestal and turntable
  cyl(0.2, 0.26, 0.06, 8, ARMOR, [X, Y + 0.03, Z], mount);
  cyl(0.09, 0.12, 0.3, 8, METAL, [X, Y + 0.2, Z], mount);
  cyl(0.22, 0.22, 0.06, 10, HULL, [X, Y + 0.38, Z], mount);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.015, 0.015, 0.02, 5, P.trim, [X + Math.cos(a) * 0.19, Y + 0.42, Z + Math.sin(a) * 0.19], mount);
  }
  // hazard stripe band on turntable
  const haz = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#111"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.CylinderGeometry(0.225, 0.225, 0.03, 10, 1, true), "#ffffff", {
    bone: mount, at: [X, Y + 0.38, Z], texture: haz,
  });

  // Cradle (on barrel joint, which sits at y=1.75)
  const cy = 1.75;
  for (const s of [1, -1]) {
    box(0.05, 0.3, 0.5, ARMOR, [X + s * 0.17, cy - 0.1, Z], mount);
    box(0.06, 0.06, 0.1, METAL, [X + s * 0.2, cy, Z], mount);
    // handles
    b.rod([X + s * 0.14, cy + 0.02, Z - 0.3], [X + s * 0.2, cy - 0.1, Z - 0.42], 0.015, DARK, { bone: barrel });
  }
  box(0.4, 0.04, 0.2, ARMOR, [X, cy - 0.28, Z], mount);
  // spade grip
  b.rod([X - 0.1, cy + 0.04, Z - 0.46], [X + 0.1, cy + 0.04, Z - 0.46], 0.014, DARK, { bone: barrel });
  box(0.12, 0.1, 0.03, METAL, [X, cy + 0.04, Z - 0.46], barrel);

  // Receiver
  box(0.26, 0.24, 0.5, HULL, [X, cy, Z - 0.02], barrel);
  box(0.2, 0.05, 0.4, ARMOR, [X, cy + 0.145, Z - 0.02], barrel);
  box(0.02, 0.14, 0.3, P.trim, [X + 0.135, cy, Z], barrel);
  // ammo box on left (+X)
  box(0.16, 0.2, 0.26, ARMOR, [X + 0.25, cy - 0.12, Z - 0.02], barrel);
  box(0.17, 0.03, 0.27, P.trim, [X + 0.25, cy - 0.01, Z - 0.02], barrel);
  // brass belt
  const rr = rng(5);
  const belt: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const g = new THREE.CylinderGeometry(0.014, 0.014, 0.07, 6);
    g.rotateZ(Math.PI / 2 + (rr() - 0.5) * 0.2);
    g.translate(X + 0.25 - t * 0.14, cy - 0.01 - Math.sin(t * Math.PI) * 0.06 - t * 0.02, Z - 0.02 + (rr() - 0.5) * 0.14);
    belt.push(g);
  }
  for (const g of belt) b.part(g, BRASS, { bone: barrel, at: [0, 0, 0] });

  // Shield plate with viewport
  const shield = b.extrude(
    [[-0.34, 0], [0.34, 0], [0.4, 0.34, "sharp"], [0.2, 0.42, "sharp"], [-0.2, 0.42, "sharp"], [-0.4, 0.34, "sharp"]],
    { at: [X, cy - 0.2, Z + 0.3], x: [1, 0, 0], thickness: 0.035, bevel: 0.008, color: ARMOR, bone: barrel },
  );
  box(0.22, 0.06, 0.04, P.glass, [X, cy + 0.12, Z + 0.32], barrel);
  box(0.26, 0.015, 0.045, P.trim, [X, cy + 0.17, Z + 0.325], barrel);
  box(0.26, 0.015, 0.045, P.trim, [X, cy + 0.07, Z + 0.325], barrel);
  for (const s of [1, -1]) for (const y of [-0.12, 0.2])
    cyl(0.012, 0.012, 0.02, 5, P.metal, [X + s * 0.3, cy + y, Z + 0.325], barrel, { rotation: [90, 0, 0] });

  // Barrel
  const bz0 = Z + 0.24;
  b.rod([X, cy, bz0], [X, cy, bz0 + 1.1], 0.032, METAL, { bone: barrel, sides: 8 });
  // shroud
  const shroud = b.rod([X, cy, bz0 + 0.04], [X, cy, bz0 + 0.62], 0.065, HULL, { bone: barrel, sides: 8, caps: "flat" });
  for (let i = 0; i < 4; i++)
    cyl(0.075, 0.075, 0.015, 8, P.trim, [X, cy, bz0 + 0.1 + i * 0.15], barrel, { dir: [0, 0, 1] });
  // cyan heat strips
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    glow(
      b.rod([X + Math.cos(a) * 0.066, cy + Math.sin(a) * 0.066, bz0 + 0.14],
        [X + Math.cos(a) * 0.066, cy + Math.sin(a) * 0.066, bz0 + 0.56], 0.007, P.neonCyan, { bone: barrel, sides: 4 }),
      1.5,
    );
  }
  // muzzle brake
  cyl(0.05, 0.05, 0.14, 8, ARMOR, [X, cy, bz0 + 1.12], barrel, { dir: [0, 0, 1] });
  for (const s of [1, -1]) box(0.02, 0.05, 0.08, DARK, [X + s * 0.05, cy, bz0 + 1.12], barrel);
  glow(cyl(0.028, 0.028, 0.02, 6, P.neonCyan, [X, cy, bz0 + 0.0], barrel, { dir: [0, 0, 1] }), 1.2);

  // ring sight
  b.sweep(
    [[X, cy + 0.15, Z + 0.1], [X + 0.04, cy + 0.2, Z + 0.1], [X, cy + 0.25, Z + 0.1], [X - 0.04, cy + 0.2, Z + 0.1]].map((p) => p),
    0.006, { color: DARK, bone: barrel, section: { ngon: 4 } },
  );
  b.torus ? null : null;
  b.part(new THREE.TorusGeometry(0.045, 0.007, 4, 10), DARK, { bone: barrel, at: [X, cy + 0.26, Z + 0.1] });
  b.rod([X, cy + 0.12, Z + 0.1], [X, cy + 0.22, Z + 0.1], 0.008, DARK, { bone: barrel });
}
    return buildGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["podFL"] = b.joint("podFL", { parent: J["body"], at: [0.95,0.5,1.7], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["podFR"] = b.joint("podFR", { parent: J["body"], at: [-0.95,0.5,1.7], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["podRL"] = b.joint("podRL", { parent: J["body"], at: [0.95,0.5,-1.6], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["podRR"] = b.joint("podRR", { parent: J["body"], at: [-0.95,0.5,-1.6], dir: [0,-1,0], role: "hinge", group: "pods" });
  J["gunMount"] = b.joint("gunMount", { parent: J["body"], at: [0,1.35,-1.6], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunBarrel"] = b.joint("gunBarrel", { parent: J["gunMount"], at: [0,1.75,-1.6], dir: [0,0,1], role: "hinge", group: "gun" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
