import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng, countershade, mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled, gearGeometry } from "../../../../kits/clockwork";

export const meta = {
  "name": "Warhound MX-77 Armored Truck",
  "description": "A low-poly cyberpunk 2077 militarized 6x6 truck with angular armor plating, neon underglow, a roof-mounted railgun turret and an armored cargo bed with missile racks."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2f3540",
  hullDark: "#1a1e26",
  hullLight: "#566074",
  trim: "#e7b814",
  rubber: "#15161a",
  steel: "#8c95a6",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb8",
  warnRed: "#ff3a2a",
  amber: "#ffab2e",
  glass: "#0b2a3a",
  camo: "#4a5a45",
  white: "#f1f4f8",
};
const M = {
  chassisTop: [0, 1.2, 0] as [number, number, number],
  frontAxle: [0, 0.62, 2.6] as [number, number, number],
  midAxle: [0, 0.62, -1.4] as [number, number, number],
  rearAxle: [0, 0.62, -2.9] as [number, number, number],
  cabFloor: [0, 1.2, 1.5] as [number, number, number],
  cabBack: [0, 1.2, 0.2] as [number, number, number],
  cargoFloor: [0, 1.2, -0.2] as [number, number, number],
  turretRing: [0, 2.55, -0.1] as [number, number, number],
  hoodTop: [0, 1.75, 2.9] as [number, number, number],
  rearBumper: [0, 0.85, -4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);
  const DARKMETAL = "#23262e"; // own colour 1
  const OIL = "#0d0e11"; // own colour 2

  // ---------- paints ----------
  const iron = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base: [number, number, number] = [0.14, 0.15, 0.18];
    const g = noise(p, 0.25, 3);
    let c = mix(base, [0.26, 0.28, 0.33], g * 0.6);
    // grease near axle z positions
    const dz = Math.min(Math.abs(p.z - 2.6), Math.abs(p.z + 1.4), Math.abs(p.z + 2.9));
    c = mix(c, [0.04, 0.035, 0.03], 0.7 * smoothstep(0.5, 0.1, dz) * noise(p, 0.12, 8));
    // rivet rows
    const rv = (Math.abs(((p.z * 12) % 1)) < 0.12 && Math.abs(((p.y * 14) % 1)) < 0.12) ? 0.25 : 0;
    return mix(c, [0.7, 0.72, 0.78], rv) as any;
  });
  const hazard = paint((p: THREE.Vector3) => {
    const k = ((p.z * 3.2 + p.y * 3.2) % 1 + 1) % 1;
    return k < 0.5 ? P.trim : "#16171a";
  });
  const steelP = paint((p: THREE.Vector3) => mix(P.steel, "#5d6575", noise(p, 0.2, 5)) as any);

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], dir: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone: body, at, dir, ...extra });

  // ---------- ladder rails + cross-members ----------
  for (const s of [1, -1]) {
    box(0.16, 0.3, 8.2, iron, [s * 0.7, 0.78, 0.1]);
    box(0.05, 0.26, 8.0, steelP, [s * 0.79, 0.78, 0.1]);
    box(0.34, 0.06, 8.2, iron, [s * 0.7, 0.95, 0.1]); // top flange
    box(0.34, 0.06, 8.2, iron, [s * 0.7, 0.62, 0.1]); // bottom flange
  }
  for (let i = 0; i < 9; i++) {
    const z = -3.6 + i * 0.95;
    box(1.4, 0.14, 0.16, iron, [0, 0.8, z]);
    for (const s of [1, -1]) box(0.06, 0.06, 0.06, P.steel, [s * 0.5, 0.88, z + 0.1]);
  }
  // deck plate carrying cab / cargo
  box(2.3, 0.1, 8.2, P.hullDark, [0, 1.15, 0.1]);
  box(2.4, 0.04, 8.3, iron, [0, 1.21, 0.1]);

  // ---------- axles ----------
  const axles = [2.6, -1.4, -2.9];
  axles.forEach((z, ai) => {
    cyl(0.1, 0.1, 2.5, 8, steelP, [0, 0.62, z], [1, 0, 0]);
    // differential pod
    b.part(new THREE.SphereGeometry(0.3, 8, 6), iron, { bone: body, at: [0, 0.6, z + (ai === 0 ? 0.0 : 0.0)], scale: [1, 0.85, 1.05] });
    cyl(0.14, 0.14, 0.2, 8, P.steel, [0, 0.6, z + 0.3], [0, 0, 1]);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      box(0.04, 0.04, 0.04, P.steel, [Math.cos(a) * 0.22, 0.6 + Math.sin(a) * 0.2, z + 0.31]);
    }
    for (const s of [1, -1]) {
      // leaf springs
      for (let l = 0; l < 4; l++) {
        box(0.12, 0.025, 1.3 - l * 0.22, DARKMETAL, [s * 0.78, 0.5 - l * 0.03 + 0.05, z]);
      }
      // U bolts
      box(0.2, 0.05, 0.05, P.steel, [s * 0.78, 0.43, z + 0.12]);
      // shock absorbers
      cyl(0.035, 0.035, 0.5, 6, P.trim, [s * 0.98, 0.78, z + 0.22], [s * 0.15, 1, 0]);
      cyl(0.02, 0.02, 0.3, 6, P.steel, [s * 0.98, 0.95, z + 0.22], [s * 0.15, 1, 0]);
      // axle end hub stub
      cyl(0.13, 0.13, 0.12, 8, DARKMETAL, [s * 1.12, 0.62, z], [1, 0, 0]);
    }
  });

  // ---------- fuel tanks (left) and exhaust (right) ----------
  box(0.05, 0.05, 0.05, P.steel, [0, 0, 0], { visible: false } as any);
  const tank = new THREE.CylinderGeometry(0.28, 0.28, 1.9, 8);
  b.part(tank, hazard, { bone: body, at: [1.05, 0.62, -0.1], dir: [0, 0, 1] });
  for (const z of [-0.8, 0.6]) b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), P.steel, { bone: body, at: [1.05, 0.62, z], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 6), P.amber, { bone: body, at: [1.05, 0.9, -0.1] });
  glow(box(0.1, 0.03, 0.2, P.amber, [1.0, 0.92, 0.5]), 1);
  // right: pipes
  for (const [dx, r] of [[-1.0, 0.07], [-1.18, 0.05]] as number[][]) {
    cyl(r, r, 3.4, 6, P.steel, [dx, 0.55, -0.5], [0, 0, 1]);
    for (let i = 0; i < 6; i++) cyl(r + 0.02, r + 0.02, 0.06, 6, DARKMETAL, [dx, 0.55, -2 + i * 0.6], [0, 0, 1]);
  }
  cyl(0.11, 0.09, 0.3, 8, OIL, [-1.0, 0.55, -2.35], [0, 0, 1]);
  glow(cyl(0.06, 0.06, 0.05, 8, P.amber, [-1.0, 0.55, -2.52], [0, 0, 1]), 1.2);
  // right-side battery box
  box(0.4, 0.34, 1.0, iron, [-1.05, 0.7, 0.9]);
  box(0.42, 0.06, 1.02, P.trim, [-1.05, 0.9, 0.9]);

  // ---------- side skirts with chevrons ----------
  for (const s of [1, -1]) {
    for (const [z0, z1] of [[1.0, 1.9], [-0.5, 0.7], [-1.0 - 0.0, -0.6]] as number[][]) {
      const len = z1 - z0;
      const skirt = new THREE.BoxGeometry(0.1, 0.36, len);
      b.part(skirt, hazard, { bone: body, at: [s * 1.27, 0.55, (z0 + z1) / 2] });
      box(0.04, 0.04, len + 0.02, P.hullLight, [s * 1.33, 0.74, (z0 + z1) / 2]);
    }
    // longer skirt between mid and rear
    box(0.1, 0.34, 0.9, hazard, [s * 1.27, 0.55, -2.15]);
    // chevron decal texture on skirt
  }
  const chev = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#16171a"/><g fill="#e7b814"><path d="M0 24L12 0H24L12 24Z"/><path d="M24 24L36 0H48L36 24Z"/><path d="M48 24L60 0H72L60 24Z"/></g></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone: body, at: [s * 1.325, 0.55, 0.2], dir: [s, 0, 0], axis: "z", texture: chev });

  // ---------- mud flaps ----------
  for (const s of [1, -1]) for (const z of [-3.35, -1.85]) {
    box(0.04, 0.4, 0.5, OIL, [s * 1.15, 0.35, z]);
    box(0.045, 0.06, 0.5, P.trim, [s * 1.15, 0.52, z]);
  }

  // ---------- skid plates ----------
  box(1.3, 0.05, 1.3, P.hullDark, [0, 0.33, 1.6], { rotation: [4, 0, 0] });
  box(1.0, 0.05, 1.2, P.hullDark, [0, 0.33, -0.2]);
  box(1.2, 0.05, 0.8, P.hullDark, [0, 0.33, -2.1]);
  for (const x of [-0.45, 0.45]) for (const z of [1.2, 2.0]) box(0.05, 0.03, 0.05, P.steel, [x, 0.36, z]);

  // ---------- underglow ----------
  glow(box(0.05, 0.04, 6.0, P.neonCyan, [1.2, 0.3, -0.1]), 1.6);
  glow(box(0.05, 0.04, 6.0, P.neonMagenta, [-1.2, 0.3, -0.1]), 1.6);
  glow(box(0.05, 0.04, 6.0, P.neonCyan, [0.9, 0.35, -0.1]), 0.8);
  glow(box(0.05, 0.04, 6.0, P.neonMagenta, [-0.9, 0.35, -0.1]), 0.8);
  box(0.1, 0.06, 6.1, DARKMETAL, [1.2, 0.34, -0.1]);
  box(0.1, 0.06, 6.1, DARKMETAL, [-1.2, 0.34, -0.1]);

  // ---------- front bumper block ----------
  box(2.5, 0.5, 0.5, iron, [0, 0.72, 4.05]);
  box(2.5, 0.08, 0.52, P.trim, [0, 0.98, 4.05]);
  box(2.2, 0.3, 0.2, P.hullDark, [0, 0.55, 4.25], { rotation: [-12, 0, 0] });
  for (const s of [1, -1]) {
    box(0.4, 0.3, 0.3, P.hull, [s * 1.1, 0.72, 4.2], { rotation: [0, s * 20, 0] });
    // tow hooks
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8, Math.PI * 1.5), P.trim, { bone: body, at: [s * 0.85, 0.6, 4.33], rotation: [0, 0, 90] });
    box(0.06, 0.1, 0.12, P.steel, [s * 0.85, 0.7, 4.28]);
    glow(box(0.14, 0.06, 0.04, P.amber, [s * 1.1, 0.82, 4.33]), 1.3);
  }
  // winch drum + cable
  cyl(0.14, 0.14, 1.0, 8, steelP, [0, 0.55, 4.28], [1, 0, 0]);
  for (const s of [1, -1]) cyl(0.2, 0.2, 0.05, 8, P.trim, [s * 0.52, 0.55, 4.28], [1, 0, 0]);
  cyl(0.16, 0.16, 0.5, 8, OIL, [0, 0.55, 4.28], [1, 0, 0]);
  b.part(new THREE.TorusGeometry(0.11, 0.02, 4, 8, Math.PI), P.steel, { bone: body, at: [0, 0.4, 4.38], rotation: [0, 0, 180] });
  box(0.04, 0.2, 0.04, OIL, [0, 0.45, 4.3]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.steel, { bone: body, at: [0, 0.34, 4.3] });
  // winch motor
  box(0.3, 0.26, 0.28, P.hullDark, [-0.7, 0.55, 4.0]);
  // warning label
  const warn = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/><path d="M8 28L22 4L36 28Z" fill="none" stroke="#111" stroke-width="3"/><rect x="21" y="12" width="2.6" height="8" fill="#111"/><rect x="21" y="22" width="2.6" height="2.6" fill="#111"/><text x="40" y="22" font-size="13" font-family="monospace" font-weight="bold" fill="#111">WINCH</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone: body, at: [0.7, 0.75, 4.311], dir: [0, 0, 1], axis: "z", texture: warn });

  // ---------- rear bumper beam ----------
  box(2.6, 0.4, 0.4, iron, [0, 0.85, -4.0]);
  box(2.6, 0.07, 0.42, hazard, [0, 1.06, -4.0]);
  box(2.0, 0.12, 0.3, P.hullDark, [0, 0.58, -3.95], { rotation: [15, 0, 0] });
  for (const s of [1, -1]) {
    box(0.4, 0.26, 0.08, DARKMETAL, [s * 1.0, 0.85, -4.22]);
    glow(box(0.34, 0.2, 0.05, P.amber, [s * 1.0, 0.85, -4.25]), 1.5);
    glow(box(0.34, 0.04, 0.05, P.warnRed, [s * 1.0, 0.7, -4.25]), 1.5);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.08, 0.022, 5, 8, Math.PI * 1.5), P.trim, { bone: body, at: [s * 0.55, 0.65, -4.22], rotation: [0, 0, 90] });
    for (const y of [0.74, 0.96]) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone: body, at: [s * 0.3, y, -4.22] });
  }
  // licence plate
  const plate = svg(`<svg viewBox="0 0 64 32"><rect x="1" y="1" width="62" height="30" rx="3" fill="#f1f4f8" stroke="#222" stroke-width="2"/><rect x="3" y="3" width="58" height="6" fill="#2ff3ff"/><text x="32" y="27" text-anchor="middle" font-size="17" font-family="monospace" font-weight="bold" fill="#111">MX-77</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: body, at: [0, 0.86, -4.222], dir: [0, 0, -1], axis: "z", texture: plate });
  box(0.56, 0.31, 0.03, OIL, [0, 0.86, -4.21]);
  glow(box(0.4, 0.02, 0.03, P.white, [0, 1.03, -4.23]), 1);

  // rivet strips on front/rear bumpers
  for (let i = 0; i < 10; i++) {
    const x = -1.1 + i * 0.245;
    b.part(new THREE.SphereGeometry(0.022, 5, 4), P.steel, { bone: body, at: [x, 0.85, 4.31] });
    b.part(new THREE.SphereGeometry(0.022, 5, 4), P.steel, { bone: body, at: [x, 0.97, -4.21 - 0.0] });
  }
  // transfer case / driveshaft
  cyl(0.06, 0.06, 4.2, 6, steelP, [0, 0.55, 0.5], [0, 0, 1]);
  for (const z of [2.0, 0.0, -1.0, -2.2]) b.part(new THREE.SphereGeometry(0.1, 6, 4), P.steel, { bone: body, at: [0, 0.55, z] });
  box(0.6, 0.35, 0.8, iron, [0, 0.55, -0.4]);
}
    return buildChassis;
  })(),
  // wheelsAndFenders
  (() => {
function buildWheelsAndFenders({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.5;
  const rand = rng(77);

  // ---------- paints ----------
  const RUBBER = paint((p, n) => {
    const v = noise(p, 0.08, 3);
    const lo = n.y < -0.5 ? 0.7 : 1;
    const c = 0.07 + v * 0.05;
    return [c * lo, c * lo, c * lo + 0.01];
  });
  const RIM = metal("steel", { tarnish: 0.3, size: 0.1 });
  const ARMOR = panelled(
    paint((p, n) => mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.6 + noise(p, 0.12, 5) * 0.2)),
    { size: 0.22, rivets: 0.06 },
  );
  const DISC = metal("iron", { polish: 0.5 });

  // ---------- textures ----------
  const chevron = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 8} 0 L${i * 8 + 8} 0 L${i * 8 + 16} 16 L${i * 8 + 8} 16Z" fill="#15161a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const hubTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#2a2f3a" stroke="#0b0d12" stroke-width="4"/>` +
      Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return `<path d="M50 50 L${50 + Math.cos(a - 0.2) * 42} ${50 + Math.sin(a - 0.2) * 42} L${50 + Math.cos(a + 0.2) * 42} ${50 + Math.sin(a + 0.2) * 42}Z" fill="#8c95a6" stroke="#0b0d12" stroke-width="2"/>`;
      }).join("") +
      `<circle cx="50" cy="50" r="10" fill="#e7b814" stroke="#0b0d12" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  // ---------- wheels ----------
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.frontAxle[2]],
    ["wheelFR", -1, M.frontAxle[2]],
    ["wheelML", 1, M.midAxle[2]],
    ["wheelMR", -1, M.midAxle[2]],
    ["wheelRL", 1, M.rearAxle[2]],
    ["wheelRR", -1, M.rearAxle[2]],
  ];
  const axisX = new THREE.Vector3(1, 0, 0);

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.2;
    const cy = M.frontAxle[1];
    const at = (x: number, y: number, zz: number) => [cx + x, cy + y, z + zz] as [number, number, number];
    // tyre body (16 sided), axis X
    b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.93, W, 16), RUBBER, {
      bone: j, at: [cx, cy, z], dir: [1, 0, 0], flat: true,
    });
    // sidewall bulge rings
    for (const o of [-1, 1])
      b.part(new THREE.CylinderGeometry(R * 0.88, R * 0.8, 0.05, 16), "#15161a", {
        bone: j, at: at(o * (W / 2), 0, 0), dir: [1, 0, 0], flat: true,
      });
    // tread blocks
    const N = 16;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + 0.2;
      const y = Math.sin(a) * (R - 0.03);
      const zz = Math.cos(a) * (R - 0.03);
      for (const o of [-1, 1]) {
        const blk = b.part(new THREE.BoxGeometry(W * 0.46, 0.09, 0.17), "#15161a", {
          bone: j, at: at(o * W * 0.25, y, zz), rotation: [(-a * 180) / Math.PI + 180, 0, 0],
        });
        blk.mesh.rotation.x = a;
      }
    }
    // outer-facing side (away from body)
    const out = s;
    const faceX = out * (W / 2 + 0.02);
    // steel rim
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 12), RIM, {
      bone: j, at: at(faceX * 1, 0, 0), dir: [1, 0, 0], flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12), "#566074", {
      bone: j, at: at(faceX * 0.9, 0, 0), dir: [1, 0, 0], flat: true,
    });
    // hub plate textured
    b.part(new THREE.CircleGeometry(0.34, 12), "#ffffff", {
      bone: j, at: at(out * (W / 2 + 0.075), 0, 0), dir: [out, 0, 0], axis: "z", texture: hubTex,
    });
    // neon hub ring
    glow(
      b.part(new THREE.TorusGeometry(0.27, 0.025, 4, 16), P.neonCyan, {
        bone: j, at: at(out * (W / 2 + 0.085), 0, 0), dir: [out, 0, 0], axis: "z",
      }),
      1.6,
    );
    glow(
      b.part(new THREE.TorusGeometry(0.39, 0.018, 4, 16), P.neonCyan, {
        bone: j, at: at(out * (W / 2 + 0.07), 0, 0), dir: [out, 0, 0], axis: "z",
      }),
      1.2,
    );
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 6), P.steel, {
        bone: j, at: at(out * (W / 2 + 0.1), Math.sin(a) * 0.14, Math.cos(a) * 0.14), dir: [out, 0, 0],
      });
    }
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 8), P.trim, {
      bone: j, at: at(out * (W / 2 + 0.11), 0, 0), dir: [out, 0, 0],
    });
    // brake disc (inner side) and caliper
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 14), DISC, {
      bone: j, at: at(-out * (W / 2 - 0.04), 0, 0), dir: [1, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.14), P.warnRed, {
      bone: j, at: at(-out * (W / 2 - 0.04), 0.22, 0.17),
    });
  }

  // ---------- fenders ----------
  for (const [name, s, z] of wheels) {
    const cx = s * 1.2;
    const cy = 0.62;
    const half = 0.38;
    // arch built as segments around the top of the wheel
    const segs = 7;
    for (let i = 0; i < segs; i++) {
      const a0 = -Math.PI * 0.5 + (i / segs) * Math.PI + 0.0;
      const a1 = -Math.PI * 0.5 + ((i + 1) / segs) * Math.PI;
      const am = (a0 + a1) / 2;
      const r = R + 0.14;
      const y = cy + Math.cos(am) * r * 1.0;
      const zz = z + Math.sin(am) * r * 1.1;
      const len = 2 * r * Math.sin((a1 - a0) / 2) * 1.2;
      const plate = b.part(new THREE.BoxGeometry(half * 2, 0.08, len), ARMOR, {
        bone: J.body, at: [cx, Math.min(y, 1.3), zz],
      });
      plate.mesh.rotation.x = -am;
      // yellow edge trim, outer
      const trim = b.part(new THREE.BoxGeometry(0.05, 0.05, len * 0.98), P.trim, {
        bone: J.body, at: [cx + s * (half + 0.01), Math.min(y + 0.02, 1.3), zz],
      });
      trim.mesh.rotation.x = -am;
      const trimIn = b.part(new THREE.BoxGeometry(0.04, 0.05, len * 0.98), "#b38d0c", {
        bone: J.body, at: [cx - s * (half + 0.01), Math.min(y + 0.02, 1.3), zz],
      });
      trimIn.mesh.rotation.x = -am;
    }
    // stacked armor blocks on top / flanks
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.BoxGeometry(0.34 - k * 0.06, 0.1, 0.5 - k * 0.1), ARMOR, {
        bone: J.body, at: [cx + s * 0.04, 1.2 + k * 0.05 + 0.02, z + (k - 1) * 0.02], flat: true,
      });
    }
    // chunky outer flare wedge
    const wedge = b.part(new THREE.BoxGeometry(0.1, 0.22, 1.0), ARMOR, {
      bone: J.body, at: [cx + s * (half + 0.08), 1.08, z],
    });
    wedge.mesh.rotation.z = s * 0.35;
    // chevron decal strip on flare
    b.part(new THREE.PlaneGeometry(0.9, 0.14), "#ffffff", {
      bone: J.body, at: [cx + s * (half + 0.17), 1.07, z], dir: [s, 0, 0], axis: "z", texture: chevron,
    });
    // rivet bolts
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.steel, {
        bone: J.body, at: [cx + s * (half + 0.05), 1.26, z - 0.3 + i * 0.2],
      });
    }
    // amber marker light on front/rear of arch
    glow(
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.05), P.amber, {
        bone: J.body, at: [cx + s * (half + 0.06), 1.0, z + (z > 0 ? 0.55 : -0.55) * (rand() > 2 ? 0 : 1)],
      }),
      1.4,
    );
  }

  // mud flaps behind rear wheels
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.4, 0.04), P.rubber, {
      bone: J.body, at: [s * 1.2, 0.5, -3.58],
    });
}
    return buildWheelsAndFenders;
  })(),
  // cabAndHood
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildCabAndHood({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(77);
  const AMBER2 = "#ffd36a";
  const DEEP = "#0a0c10";
  const RED2 = "#c81e14";

  // ---------- helpers ----------
  const box = (size: number[], at: number[], color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: body, at, flat: true, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], color: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, flat: true, ...opts });
  const slab = (pts: number[][], thick: number, color: any, opts: any = {}) =>
    b.extrude(pts, { thickness: thick, color, bone: body, ...opts });
  const G = (p: any, s = 1) => glow(p, s);

  // ---------- paints ----------
  const HULLP = panelled(
    paint((p, n) => {
      const base = mix(P.hullDark, P.hull, smoothstep(-0.6, 0.8, n.y));
      return mix(base, P.hullLight, 0.25 * smoothstep(0.5, 0.8, noise(p, 0.3, 4)));
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.1 },
  );
  const HULLS = panelled(P.hull, { size: 0.4, aspect: 0.7, rivets: 0.08 });
  const CAMO = paint((p, n) => {
    const v = noise(p, 0.35, 11);
    const base = v < 0.4 ? "#3a4634" : v < 0.65 ? P.camo : "#2a3026";
    return mix(base, "#6a7a60", 0.25 * smoothstep(0.6, 1, n.y));
  });
  const STEEL = metal("steel", { tarnish: 0.3 });
  const IRON = metal("iron");
  const HAZ = paint((p) => ((Math.floor((p.x + p.y * 1.0 + p.z) / 0.12) & 1) ? P.trim : DEEP));

  // ---------- textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14181f" stroke="#f1f4f8" stroke-width="5"/>
    <path d="M50 14 L82 34 L82 66 L50 86 L18 66 L18 34Z" fill="none" stroke="#f1f4f8" stroke-width="4"/>
    <path d="M30 62 L42 36 L50 52 L58 36 L70 62 L58 56 L50 70 L42 56Z" fill="#e7b814"/>
    <circle cx="50" cy="50" r="5" fill="#ff3a2a"/></svg>`,
    { size: 192 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 200 50"><text x="100" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#f1f4f8" letter-spacing="4">WH-MX77</text>
    <rect x="10" y="42" width="180" height="3" fill="#e7b814"/></svg>`,
    { size: 256 },
  );
  const GLASSTEX = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#0b2a3a"/>
    <path d="M10 40 L35 0 L48 0 L23 40Z" fill="#2ff3ff" opacity="0.22"/><path d="M52 40 L77 0 L84 0 L59 40Z" fill="#2ff3ff" opacity="0.15"/>
    <rect y="30" width="100" height="10" fill="#07161f" opacity="0.6"/></svg>`,
    { size: 192 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#062a30"/>
    <path d="M4 30 L14 22 L24 26 L36 12 L48 18 L60 6" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <circle cx="48" cy="26" r="7" fill="none" stroke="#2ff3ff" stroke-width="2"/><rect x="4" y="34" width="30" height="3" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#2a0a0a"/><circle cx="20" cy="20" r="11" fill="#ff3a2a"/><circle cx="16" cy="16" r="4" fill="#ffd0c8"/></svg>`,
    { size: 64 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 60 60"><path d="M30 4 L58 54 L2 54Z" fill="#e7b814" stroke="#111" stroke-width="4"/><rect x="27" y="20" width="6" height="19" fill="#111"/><circle cx="30" cy="45" r="3.5" fill="#111"/></svg>`,
    { size: 96 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 80 30"><rect width="80" height="30" fill="#0a0c10"/>${[0, 1, 2, 3, 4]
      .map((i) => `<rect x="4" y="${3 + i * 5.4}" width="72" height="3" fill="#2ff3ff"/>`)
      .join("")}</svg>`,
    { size: 160 },
  );
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], opts: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: tex, ...opts });

  // ---------- HOOD: sloped wedge z 2.0..4.3 ----------
  // wedge profile in (z,y) side view, extruded across x
  const hoodProfile: any = [
    [0, 0],
    [2.3, 0],
    [2.3, 0.28],
    [2.05, 0.52],
    [0.2, 0.78],
    [0, 0.78],
  ];
  // x runs along +z (front), y up; thickness across X
  slab(hoodProfile, 2.4, HULLP, { at: [0, 1.2 + 0, 2.0], x: [0, 0, 1], y: [0, 1, 0], bevel: 0.03 });
  // hood top plate raised, chamfer layers
  box([2.0, 0.08, 1.9], [0, 2.02, 2.95], P.hullLight, { rotation: [-7, 0, 0] });
  box([0.9, 0.06, 1.2], [0, 2.1, 2.85], HULLS, { rotation: [-7, 0, 0] });
  // vents on hood
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      box([0.4, 0.03, 0.05], [s * 0.7, 2.1 - i * 0.012, 2.4 + i * 0.16], DEEP, { rotation: [-7, 0, 0] });
      G(box([0.34, 0.012, 0.02], [s * 0.7, 2.125 - i * 0.012, 2.4 + i * 0.16], P.neonCyan, { rotation: [-7, 0, 0] }), 1.2);
    }
  // hazard stripe along hood front edge
  box([2.2, 0.1, 0.1], [0, 1.74, 4.3], HAZ);
  // nose face + grille
  box([2.3, 0.5, 0.1], [0, 1.58, 4.28], P.hullDark);
  plane(1.5, 0.4, GRILLE, [0, 1.6, 4.345], [0, 0, 1]);
  const grille = b.part(new THREE.PlaneGeometry(1.5, 0.4), "#ffffff", { bone: body, at: [0, 1.6, 4.346], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  G(grille, 1.3);
  // fender flares on hood sides
  for (const s of [1, -1]) {
    box([0.35, 0.55, 2.3], [s * 1.2, 1.55, 3.15], P.hull, { rotation: [0, 0, s * -6] });
    box([0.2, 0.08, 2.3], [s * 1.28, 1.88, 3.15], P.hullLight);
  }

  // ---------- BULL BAR / PLOW ----------
  box([2.7, 0.14, 0.16], [0, 1.28, 4.5], P.trim);
  box([2.7, 0.14, 0.16], [0, 1.72, 4.45], P.hullDark);
  for (const s of [1, -1]) {
    box([0.16, 0.7, 0.18], [s * 1.3, 1.5, 4.47], P.hullDark);
    box([0.14, 0.7, 0.14], [s * 0.45, 1.5, 4.5], P.hull, { rotation: [0, 0, s * 10] });
    // plow wing
    b.extrude([[0, 0], [0.7, 0.1], [0.7, 0.55], [0, 0.6]], { at: [s * 1.3, 1.2, 4.5], x: [s, 0, 0.15], y: [0, 1, 0], thickness: 0.06, color: IRON, bone: body });
  }
  box([2.2, 0.55, 0.1], [0, 1.0, 4.55], IRON, { rotation: [12, 0, 0] });
  box([2.3, 0.12, 0.14], [0, 0.72, 4.6], HAZ);
  G(box([1.9, 0.07, 0.07], [0, 1.52, 4.58], P.neonMagenta), 1.6);
  // winch hook / tow
  for (const s of [1, -1]) cyl(0.05, 0.05, 0.2, 6, [s * 0.6, 0.95, 4.55], STEEL, { rotation: [90, 0, 0] });

  // quad headlights
  for (const s of [1, -1])
    for (const k of [0, 1]) {
      const x = s * (0.85 + k * 0.28);
      box([0.26, 0.22, 0.12], [x, 1.84, 4.3], P.hullDark);
      G(cyl(0.085, 0.1, 0.1, 8, [x, 1.84, 4.37], k ? P.amber : AMBER2, { rotation: [90, 0, 0] }), 1.8);
    }

  // sensor masts on hood
  for (const s of [1, -1]) {
    cyl(0.03, 0.04, 0.5, 6, [s * 0.65, 2.3, 3.5], STEEL);
    cyl(0.07, 0.07, 0.06, 8, [s * 0.65, 2.1, 3.5], P.hullDark);
    box([0.12, 0.1, 0.12], [s * 0.65, 2.58, 3.5], P.hullDark);
    G(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone: body, at: [s * 0.65, 2.58, 3.58], flat: true }), 2);
    b.rod([s * 0.65, 2.45, 3.5], [s * 0.45, 2.1, 3.1], 0.012, P.neonCyan, { bone: body });
  }

  // ---------- CAB ----------
  // main lower cab block
  box([2.7, 0.9, 2.0], [0, 1.65, 1.15], HULLP);
  // sloped roof wedge/upper cab
  const cabUpper: any = [
    [0, 0],
    [2.0, 0],
    [1.55, 0.78],
    [0.25, 0.78],
  ];
  slab(cabUpper, 2.5, HULLS, { at: [0, 2.1, 0.2], x: [0, 0, 1], y: [0, 1, 0], bevel: 0.03 });
  // roof plate camo
  box([2.4, 0.08, 1.3], [0, 2.9 - 0.1, 0.9], CAMO);
  box([2.5, 0.05, 1.45], [0, 2.82, 0.88], P.hullDark);
  // chamfer rails
  for (const s of [1, -1]) {
    box([0.12, 0.12, 1.9], [s * 1.3, 2.12, 1.15], P.trim);
    box([0.1, 0.1, 1.6], [s * 1.18, 2.9, 0.85], P.hullLight, { rotation: [0, 0, s * 12] });
  }

  // raked slit windscreen
  const wsAt = [0, 2.5, 2.05];
  box([2.3, 0.5, 0.08], wsAt, P.hullDark, { rotation: [-32, 0, 0] });
  b.part(new THREE.PlaneGeometry(2.1, 0.3), "#ffffff", { bone: body, at: [0, 2.51, 2.1], dir: [0, 0.55, 0.84], axis: "z", texture: GLASSTEX });
  // pillars
  for (const s of [1, -1]) box([0.1, 0.62, 0.12], [s * 1.12, 2.47, 2.0], P.hullLight, { rotation: [-32, 0, 0] });
  // side windows (slit)
  for (const s of [1, -1]) {
    box([0.05, 0.38, 1.35], [s * 1.36, 2.38, 1.05], P.hullDark);
    b.part(new THREE.PlaneGeometry(1.25, 0.28), "#ffffff", { bone: body, at: [s * 1.4, 2.38, 1.05], dir: [s, 0, 0], axis: "z", texture: GLASSTEX });
    // roll-cage frame
    box([0.07, 0.07, 1.4], [s * 1.38, 2.6, 1.05], P.trim);
    box([0.07, 0.07, 1.4], [s * 1.38, 2.17, 1.05], P.trim);
    for (const z of [0.4, 1.05, 1.7]) box([0.08, 0.5, 0.08], [s * 1.38, 2.4, z], P.trim);
  }

  // door panels + emblem + stencil + hazard
  for (const s of [1, -1]) {
    box([0.06, 0.55, 1.2], [s * 1.37, 1.7, 1.1], HULLP);
    box([0.04, 0.14, 1.25], [s * 1.4, 1.38, 1.1], HAZ);
    plane(0.5, 0.5, EMBLEM, [s * 1.405, 1.75, 1.45], [s, 0, 0]);
    plane(0.8, 0.2, STENCIL, [s * 1.405, 1.75, 0.8], [s, 0, 0]);
    plane(0.16, 0.16, WARN, [s * 1.405, 1.55, 0.55], [s, 0, 0]);
    // grab handles
    b.rod([s * 1.42, 1.9, 0.55], [s * 1.42, 1.5, 0.55], 0.02, STEEL, { bone: body });
    box([0.08, 0.04, 0.08], [s * 1.4, 1.9, 0.55], STEEL);
    box([0.08, 0.04, 0.08], [s * 1.4, 1.5, 0.55], STEEL);
    // door seam
    box([0.02, 0.6, 0.02], [s * 1.41, 1.7, 0.5], DEEP);
    // step plates
    box([0.2, 0.05, 1.0], [s * 1.35, 1.25, 1.1], P.steel);
    // amber side lights
    for (let i = 0; i < 3; i++) G(box([0.04, 0.05, 0.1], [s * 1.4, 1.52, 1.9 - i * 0.2], P.amber), 1.5);
  }

  // side mirror camera pods
  for (const s of [1, -1]) {
    b.rod([s * 1.38, 2.2, 1.9], [s * 1.7, 2.3, 2.05], 0.03, P.hullDark, { bone: body });
    b.rod([s * 1.38, 1.95, 1.9], [s * 1.68, 2.2, 2.05], 0.025, P.hullDark, { bone: body });
    cyl(0.12, 0.14, 0.3, 8, [s * 1.72, 2.3, 2.05], P.hullDark, { rotation: [90, 0, 0] });
    G(b.part(new THREE.CircleGeometry(0.09, 8), "#ffffff", { bone: body, at: [s * 1.72, 2.3, 2.21], dir: [0, 0, 1], axis: "z", texture: EYE }), 1.8);
    box([0.1, 0.03, 0.2], [s * 1.72, 2.46, 2.02], P.hullLight);
  }

  // interior: dash, seats, screens (visible through glass)
  box([2.0, 0.18, 0.4], [0, 2.14, 1.85], P.hullDark);
  for (const s of [1, -1]) {
    box([0.6, 0.4, 0.5], [s * 0.5, 2.1, 1.05], "#232830");
    box([0.6, 0.55, 0.12], [s * 0.5, 2.35, 0.75], "#232830");
    G(b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone: body, at: [s * 0.5, 2.31, 1.65], dir: [0, 0.4, 1], axis: "z", texture: SCREEN }), 1.6);
  }
  G(box([0.5, 0.03, 0.04], [0, 2.26, 1.7], P.neonCyan), 1.5);

  // ---------- ROOF: antennas, radar, light bar ----------
  // light bar
  box([1.5, 0.1, 0.22], [0, 2.95, 1.55], P.hullDark);
  for (let i = 0; i < 6; i++)
    G(box([0.22, 0.09, 0.2], [-0.62 + i * 0.25, 3.02, 1.55], i < 3 ? P.warnRed : "#3a6bff"), 2);
  // radar dish
  cyl(0.06, 0.1, 0.25, 6, [0.6, 3.0, 0.45], P.hullDark);
  const dish = b.lathe([[0, 0], [0.12, 0.03], [0.3, 0.14], [0.28, 0.16], [0.1, 0.06], [0, 0.05]], {
    at: [0.6, 3.15, 0.5], axis: [0, 0.6, 0.8], color: P.white, bone: body, segments: 10,
  });
  b.rod([0.6, 3.15, 0.5], [0.6, 3.3, 0.65], 0.012, STEEL, { bone: body });
  G(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, { bone: body, at: [0.6, 3.3, 0.66], flat: true }), 2);
  // antenna array
  for (let i = 0; i < 4; i++) {
    const x = -0.9 + i * 0.12;
    const h = 0.5 + R() * 0.7;
    cyl(0.012, 0.02, h, 5, [x, 2.9 + h / 2, 0.45 - i * 0.05], STEEL);
    if (i % 2) G(b.part(new THREE.SphereGeometry(0.022, 5, 3), P.warnRed, { bone: body, at: [x, 2.9 + h, 0.45 - i * 0.05], flat: true }), 2);
  }
  box([0.5, 0.06, 0.4], [-0.7, 2.93, 0.55], P.hullLight);
  // roof cyan strip at back
  G(box([2.2, 0.04, 0.05], [0, 2.9, 0.28], P.neonCyan), 1.4);
  // roof camo patch cards of hazard
  box([0.4, 0.03, 0.4], [0.5, 2.92, 1.05], HAZ);

  // ---------- back wall + exhaust stacks ----------
  box([2.7, 1.4, 0.1], [0, 1.9, 0.25], P.hullDark);
  G(box([1.9, 0.04, 0.03], [0, 1.45, 0.32], P.neonCyan), 1.2);
  for (const s of [1, -1]) {
    cyl(0.1, 0.11, 1.9, 8, [s * 1.1, 2.2, 0.38], STEEL);
    for (const y of [1.5, 2.0, 2.5]) cyl(0.125, 0.125, 0.05, 8, [s * 1.1, y, 0.38], P.hullDark);
    cyl(0.13, 0.1, 0.12, 8, [s * 1.1, 3.17, 0.38], P.hullDark);
    box([0.1, 0.15, 0.06], [s * 1.1, 1.4, 0.38], P.hullLight);
    G(cyl(0.07, 0.07, 0.02, 8, [s * 1.1, 3.24, 0.38], P.amber), 1.4);
  }
  // armor bolts on roof corners
  for (const sx of [1, -1])
    for (const z of [0.4, 1.6]) cyl(0.04, 0.04, 0.04, 6, [sx * 1.1, 2.88, z], P.steel);
  // neon underline cab
  for (const s of [1, -1]) G(box([0.04, 0.04, 2.0], [s * 1.38, 1.3, 1.1], P.neonCyan), 1.3);
}
    return buildCabAndHood;
  })(),
  // cargoBay
  (() => {
function buildCargoBay({ b, J, P, M }: Ctx) {
  const body = J.body;
  const ramp = J.rampRear;
  const R = rng(77);

  // ---------- textures ----------
  const bio = svg(`<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#e7b814" stroke="#1a1e26" stroke-width="4"/><g fill="none" stroke="#1a1e26" stroke-width="5"><circle cx="32" cy="34" r="5" fill="#1a1e26"/><circle cx="32" cy="20" r="9"/><circle cx="20" cy="42" r="9"/><circle cx="44" cy="42" r="9"/></g></svg>`, { size: 128 });
  const ammo = svg(`<svg viewBox="0 0 96 48"><rect x="1" y="1" width="94" height="46" fill="#1a1e26" stroke="#e7b814" stroke-width="3"/><text x="48" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#e7b814">AMMO</text><path d="M6 6h14M6 42h14" stroke="#ff3a2a" stroke-width="3"/></svg>`, { size: 192 });
  const serial = svg(`<svg viewBox="0 0 160 40"><text x="80" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#f1f4f8">WH-MX77-04</text></svg>`, { size: 256 });
  const chevron = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1e26"/><path d="M0 22L32 4L64 22V38L32 20L0 38Z M0 54L32 36L64 54V64L32 64L0 64Z" fill="#e7b814"/></svg>`, { size: 128 });
  const warnTri = svg(`<svg viewBox="0 0 64 64"><path d="M32 4L61 58H3Z" fill="#e7b814" stroke="#1a1e26" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="20" fill="#1a1e26"/><rect x="29" y="46" width="6" height="6" fill="#1a1e26"/></svg>`, { size: 128 });

  // ---------- paints ----------
  const HULL = panelled(
    paint((p, n) => mix(mix(P.hullDark, P.hull, smoothstep(0.1, 0.9, noise(p, 0.5, 3))), P.hullLight, 0.35 * smoothstep(0.5, 1, n.y))),
    { size: 0.55, aspect: 0.8, rivets: 0.07 }
  );
  const PLATE = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.4, rivets: 0.05 });
  const CAMO = paint((p) => (noise(p, 0.45, 9) > 0.55 ? P.hullDark : noise(p, 0.3, 4) > 0.5 ? P.camo : "#39452f"));
  const HAZ = paint((p, _n, s) => (((p.x + p.y + p.z * 1.0) / 0.14) % 2 + 2) % 2 < 1 ? P.trim : P.hullDark);

  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...o });

  // decal plane helper
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff", bone: any = body) =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir, axis: "z", texture: tex });

  // ---------- main container (chamfered via lathe-free extrude of cross-section) ----------
  // cross-section in XY (width x, height y), extruded along Z
  const sec: [number, number][] = [
    [-1.4, 1.35], [-1.4, 2.35], [-1.25, 2.55], [1.25, 2.55], [1.4, 2.35], [1.4, 1.35], [1.25, 1.2], [-1.25, 1.2],
  ];
  b.extrude(sec, { at: [0, 0, 0.18], x: [1, 0, 0], y: [0, 1, 0], thickness: 4.28, color: HULL, bone: body, name: "container" });
  // the extrude thickness axis is x*y = +Z, centred on the drawing: recentre
  // (container spans z 0.18-2.14 .. 0.18+2.14) handled by offsetting below
  // Note: centred at z=0.18 -> spans -1.96..2.32; fix by dedicated shell instead
  // Replace with exact boxes to guarantee fit:
  // (the extrude above is hidden inside the shell boxes below only if it overlaps; keep box shell as the true silhouette)

  // ---------- armor layers ----------
  for (const s of [1, -1]) {
    // side armor slabs, layered
    box(0.1, 0.95, 4.0, PLATE, [s * 1.43, 1.85, -1.9]);
    box(0.08, 0.5, 3.5, HULL, [s * 1.49, 2.05, -1.9]);
    // lower sloped skirt plate
    b.part(new THREE.BoxGeometry(0.08, 0.3, 4.0), P.hullDark, { bone: body, at: [s * 1.42, 1.3, -1.9], rotation: [0, 0, s * 20], flat: true });
    // roof edge chamfer plate
    b.part(new THREE.BoxGeometry(0.5, 0.08, 4.1), PLATE, { bone: body, at: [s * 1.1, 2.6, -1.95], rotation: [0, 0, -s * 12], flat: true });
    // hazard trim bands
    box(0.04, 0.12, 4.15, HAZ, [s * 1.52, 1.5, -1.9]);
    box(0.04, 0.12, 4.15, HAZ, [s * 1.52, 2.4, -1.9]);
    // neon cyan roof edge strips
    glow(box(0.05, 0.05, 4.2, P.neonCyan, [s * 1.3, 2.6, -1.95]), 1.6);
    glow(box(0.04, 0.04, 4.1, P.neonCyan, [s * 1.52, 1.95, -1.95]), 1.2);
    // vertical ribs
    for (let i = 0; i < 7; i++) box(0.07, 0.9, 0.09, P.hullLight, [s * 1.47, 1.85, -3.8 + i * 0.6]);
  }
  // roof plate
  box(2.5, 0.06, 4.1, PLATE, [0, 2.58, -1.95]);
  // front wall armour
  box(2.8, 1.3, 0.1, PLATE, [0, 1.9, 0.18]);
  box(2.4, 0.08, 0.14, HAZ, [0, 2.45, 0.2]);
  // rear wall frame
  box(2.8, 0.14, 0.12, PLATE, [0, 2.5, -4.05]);
  for (const s of [1, -1]) box(0.14, 1.3, 0.12, PLATE, [s * 1.38, 1.85, -4.05]);
  box(2.8, 0.14, 0.12, PLATE, [0, 1.3, -4.05]);

  // ---------- turret mounting deck (front roof) ----------
  b.part(new THREE.CylinderGeometry(0.95, 1.05, 0.1, 12), HULL, { bone: body, at: [0, 2.63, -0.1], flat: true });
  b.part(new THREE.CylinderGeometry(0.78, 0.82, 0.06, 12), P.hullDark, { bone: body, at: [0, 2.7, -0.1], flat: true });
  b.ring({ at: [0, 2.7, -0.1], axis: [0, 1, 0] } as any, { count: 12, radius: 0.9 }, (it: any) =>
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, { bone: body, at: it.at, flat: true })
  );
  box(2.6, 0.04, 0.5, P.trim, [0, 2.62, 0.0], { });

  // ---------- roof hatches ----------
  for (const z of [-1.5, -2.7]) {
    box(0.8, 0.07, 0.8, PLATE, [-0.5, 2.62, z]);
    box(0.6, 0.04, 0.6, P.hullDark, [-0.5, 2.67, z]);
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.steel, { bone: body, at: [-0.5, 2.71, z], flat: true });
    glow(box(0.04, 0.03, 0.5, P.amber, [-0.84, 2.67, z]), 1.5);
  }
  // vents with magenta slits
  box(0.8, 0.06, 1.0, P.hullDark, [0.6, 2.62, -2.1]);
  for (let i = 0; i < 6; i++) glow(box(0.6, 0.02, 0.05, P.neonMagenta, [0.6, 2.66, -1.75 - i * 0.14]), 1.8);
  // tie-down rails
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 2.7, -3.9], [s * 1.1, 2.7, -3.0], 0.02, P.steel, { bone: body });
    for (const z of [-3.9, -3.0]) b.rod([s * 1.1, 2.62, z], [s * 1.1, 2.7, z], 0.02, P.steel, { bone: body });
  }

  // ---------- side utility lockers ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const z = -0.9 - i * 1.5;
      box(0.12, 0.7, 1.2, PLATE, [s * 1.55, 1.85, z]);
      box(0.05, 0.6, 1.1, P.hullDark, [s * 1.62, 1.85, z]);
      box(0.06, 0.08, 0.3, P.steel, [s * 1.66, 1.85, z + 0.35]);
      glow(box(0.06, 0.07, 0.07, P.amber, [s * 1.66, 2.1, z - 0.4]), 2);
      glow(box(0.06, 0.07, 0.07, P.amber, [s * 1.66, 1.6, z - 0.4]), 2);
      box(0.05, 0.04, 1.1, HAZ, [s * 1.65, 1.5, z]);
    }
    // labels
    plane(0.5, 0.5, bio, [s * 1.69, 1.95, -0.9], [s, 0, 0]);
    plane(0.7, 0.35, ammo, [s * 1.69, 1.9, -2.4], [s, 0, 0]);
    plane(1.1, 0.28, serial, [s * 1.51, 2.3, -1.9], [s, 0, 0]);
    plane(0.3, 0.3, warnTri, [s * 1.51, 1.7, -3.55], [s, 0, 0]);
  }

  // ---------- missile rack (rear, 4 tubes per side) ----------
  box(2.9, 0.12, 0.7, PLATE, [0, 2.7, -4.35]);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (0.3 + i * 0.28 - (i > 1 ? 0 : 0));
      const y = 2.8;
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), P.hullDark, { bone: body, at: [x, y, -4.4], dir: [0, 0, 1], flat: true });
      b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 8), P.trim, { bone: body, at: [x, y, -4.72], dir: [0, 0, 1], flat: true });
      b.part(new THREE.ConeGeometry(0.085, 0.3, 8), P.warnRed, { bone: body, at: [x, y, -4.55], dir: [0, 0, -1], flat: true });
      glow(b.part(new THREE.CircleGeometry(0.06, 8), P.warnRed, { bone: body, at: [x, y, -4.76], dir: [0, 0, -1], axis: "z" }), 1.3);
    }
  }
  for (const z of [-4.2, -4.6]) box(2.6, 0.06, 0.08, P.steel, [0, 2.62, z]);

  // ---------- rear ramp door ----------
  const rampT = new THREE.BoxGeometry(2.5, 1.1, 0.1);
  b.part(rampT, HULL, { bone: ramp, at: [0, 1.6, -4.1], flat: true });
  b.part(new THREE.BoxGeometry(2.2, 0.9, 0.04), PLATE, { bone: ramp, at: [0, 1.6, -4.17], flat: true });
  plane(2.0, 0.7, chevron, [0, 1.55, -4.2], [0, 0, -1], "#ffffff", ramp);
  box(2.5, 0.08, 0.14, P.trim, [0, 1.05, -4.1], { bone: ramp });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), P.steel, { bone: ramp, at: [s * 1.2, 1.0, -4.1], dir: [1, 0, 0], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 8), P.warnRed, { bone: ramp, at: [s * 0.9, 2.12, -4.16], dir: [0, 0, -1], flat: true }), 2);
  }
  glow(b.part(new THREE.CylinderGeometry(0.16, 0.18, 0.2, 8), P.amber, { bone: ramp, at: [0, 2.17, -4.18], dir: [0, 0, -1], flat: true }), 2.2);
  // rivet row
  for (let i = 0; i < 9; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone: ramp, at: [-1.0 + i * 0.25, 1.15, -4.2] });

  // ---------- camo panel on roof rear & misc ----------
  box(1.0, 0.03, 1.2, CAMO, [-0.55, 2.61, -3.4]);
  // cable conduits front
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 1.4, 0.1], [s * 1.2, 2.5, 0.1], 0.04, P.hullDark, { bone: body });
    glow(box(0.04, 1.0, 0.04, P.neonCyan, [s * 1.36, 1.95, 0.22]), 1.5);
  }
  void R;
}
    return buildCargoBay;
  })(),
  // turretGun
  (() => {
function buildTurretGun({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const body = J.body;
  const ring = M.turretRing as [number, number, number];

  // ---------- paints ----------
  const HULL = panelled(
    paint((p, n) => mix(P.hull, P.hullLight, 0.5 * smoothstep(0.3, 1, n.y) + 0.25 * noise(p, 0.2, 3))),
    { size: 0.2, rivets: 0.05 },
  );
  const CAMO = mottle(P.camo, P.hull, { size: 0.18, seed: 4, contrast: 1.5 });
  const GEAR = metal("iron", { tarnish: 0.5, seed: 2 });
  const STEEL = metal("steel", { polish: 0.6 });
  const BLUED = metal("blued");

  // ---------- textures ----------
  const SKULL = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="none" stroke="#f1f4f8" stroke-width="3.5"/>
      <path d="M32 1 V12 M32 52 V63 M1 32 H12 M52 32 H63" stroke="#f1f4f8" stroke-width="3.5"/>
      <path d="M32 14 C21 14 17 22 18 29 C18 33 20 35 22 37 V43 H42 V37 C44 35 46 33 46 29 C47 22 43 14 32 14Z" fill="#f1f4f8" stroke="#1a1e26" stroke-width="1.5"/>
      <ellipse cx="26" cy="29" rx="4" ry="4.5" fill="#1a1e26"/><ellipse cx="38" cy="29" rx="4" ry="4.5" fill="#1a1e26"/>
      <path d="M32 33 L29.5 38 H34.5Z" fill="#1a1e26"/>
      <path d="M26 43 V48 M30 43 V48 M34 43 V48 M38 43 V48" stroke="#1a1e26" stroke-width="2"/>
    </svg>`,
    { size: 192 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
      <path d="M0 16 L8 0 H16 L8 16Z M16 16 L24 0 H32 L24 16Z M32 16 L40 0 H48 L40 16Z M48 16 L56 0 H64 L56 16Z" fill="#15161a"/></svg>`,
    { size: 128 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 48 24"><rect width="48" height="24" rx="2" fill="#e7b814"/>
      <text x="24" y="16" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#15161a">RG-77</text></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (size: number[], color: any, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, ...opts });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], bone: any) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------- base ring (fixed on body) ----------
  b.part(gearGeometry({ teeth: 48, module: 0.03, thickness: 0.06, toothDepth: 0.8 }), GEAR, {
    bone: body,
    at: [ring[0], 2.54, ring[2]],
  });
  cyl(0.62, 0.66, 0.05, 16, BLUED, [ring[0], 2.595, ring[2]], body);
  // bolts on the ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cyl(0.025, 0.025, 0.03, 6, P.steel, [Math.sin(a) * 0.54, 2.63, ring[2] + Math.cos(a) * 0.54], body);
  }
  // amber ring lights
  for (const s of [1, -1])
    glow(box([0.08, 0.025, 0.04], P.amber, [s * 0.7, 2.545, ring[2] + 0.1], body), 1.2);

  // ---------- housing (on yaw) ----------
  const hy = 2.79;
  box([1.0, 0.34, 1.1], HULL, [0, hy, -0.1], yaw);
  // chamfered sloped top plates
  box([0.9, 0.06, 1.0], CAMO, [0, hy + 0.19, -0.1], yaw);
  for (const s of [1, -1]) {
    box([0.16, 0.06, 1.0], CAMO, [s * 0.46, hy + 0.15, -0.1], yaw, { rotation: [0, 0, s * 35] });
    box([0.1, 0.3, 0.9], P.hullDark, [s * 0.52, hy - 0.02, -0.12], yaw, { rotation: [0, 0, -s * 8] });
  }
  // rear bustle
  box([0.8, 0.3, 0.2], P.hullDark, [0, hy, -0.72], yaw, { rotation: [-12, 0, 0] });
  // cooling fins at the rear
  for (let i = 0; i < 5; i++) box([0.6, 0.02, 0.14], P.steel, [0, hy - 0.1 + i * 0.055, -0.88 + i * 0.01], yaw);
  glow(box([0.5, 0.015, 0.02], P.neonMagenta, [0, hy + 0.17, -0.8], yaw), 1.4);
  // front mantlet (rides yaw, gun inside)
  box([0.62, 0.36, 0.2], P.hullDark, [0, 2.96, 0.5], yaw);
  box([0.5, 0.26, 0.06], HULL, [0, 2.96, 0.62], yaw, { rotation: [8, 0, 0] });
  // hazard stripe
  for (const s of [1, -1]) {
    plane(0.9, 0.06, HAZARD, [s * 0.512, hy + 0.1, -0.1], [s, 0, 0], yaw);
  }
  box([0.98, 0.02, 0.04], P.trim, [0, hy + 0.17, 0.46], yaw);

  // side shields + decals
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.6, -0.15],
        [0.5, -0.15],
        [0.5, 0.1],
        [0.3, 0.2],
        [-0.5, 0.2],
      ],
      { at: [s * 0.54, 2.76, -0.1], x: [0, 0, 1], thickness: 0.04, bevel: 0.01, color: CAMO, bone: yaw },
    );
    plane(0.3, 0.3, SKULL, [s * 0.566, 2.78, 0.05], [s, 0, 0], yaw);
    plane(0.2, 0.1, LABEL, [s * 0.566, 2.74, -0.4], [s, 0, 0], yaw);
    // shield bolts
    for (const z of [-0.6, 0.35]) cyl(0.018, 0.018, 0.02, 6, P.steel, [s * 0.565, 2.68, z], yaw, { rotation: [0, 0, 90] });
  }

  // sensor eye cluster on a mast
  box([0.3, 0.14, 0.2], P.hullDark, [0.28, 3.03, 0.1], yaw);
  box([0.28, 0.02, 0.18], P.trim, [0.28, 3.105, 0.1], yaw);
  for (let i = 0; i < 3; i++) {
    const g = b.part(new THREE.SphereGeometry(0.032, 6, 4), P.warnRed, {
      bone: yaw,
      at: [0.2 + i * 0.08, 3.03, 0.205],
    });
    glow(g, 2);
  }
  glow(box([0.24, 0.015, 0.01], P.warnRed, [0.28, 2.99, 0.2], yaw), 1.5);

  // ammo box + belt
  box([0.26, 0.3, 0.42], P.hullDark, [-0.67, 2.76, -0.1], yaw);
  box([0.28, 0.04, 0.44], P.trim, [-0.67, 2.93, -0.1], yaw);
  plane(0.18, 0.09, LABEL, [-0.805, 2.77, -0.1], [-1, 0, 0], yaw);
  const belt = [
    [-0.66, 2.93, 0.1],
    [-0.62, 3.0, 0.3],
    [-0.4, 3.0, 0.48],
    [-0.15, 2.97, 0.58],
  ];
  b.along(
    b.sweep(belt, 0.012, { color: P.steel, bone: yaw, caps: "none" }),
    10,
    (at: any) => b.part(new THREE.BoxGeometry(0.05, 0.035, 0.035), P.amber, { bone: yaw, at }),
  );

  // smoke grenade launchers (twin)
  for (const s of [1, -1]) {
    for (let k = 0; k < 2; k++) {
      const x = s * (0.34 + k * 0.1);
      b.rod([x, 2.96, -0.5], [x + s * 0.02, 3.07, -0.2], 0.03, P.hullLight, { bone: yaw, sides: 6 });
      b.part(new THREE.CircleGeometry(0.022, 6), "#050608", { bone: yaw, at: [x + s * 0.02, 3.07, -0.2], dir: [s * 0.07, 0.11, 0.3], axis: "z" });
    }
    box([0.24, 0.05, 0.14], P.hullDark, [s * 0.38, 2.96, -0.5], yaw);
  }

  // antenna
  b.rod([-0.38, 2.97, -0.65], [-0.44, 3.1, -0.7], 0.008, P.steel, { bone: yaw, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.015, 5, 4), P.warnRed, { bone: yaw, at: [-0.44, 3.105, -0.7] }), 2);

  // ---------- railgun (on gunPitch) ----------
  const gy = 2.95;
  box([0.3, 0.2, 0.34], P.hullDark, [0, gy, 0.55], pitch);
  for (const s of [1, -1]) {
    b.rod([s * 0.075, gy, 0.5], [s * 0.075, gy, 1.85], 0.035, STEEL, { bone: pitch, sides: 6 });
    box([0.03, 0.05, 1.2], P.hullLight, [s * 0.14, gy - 0.02, 1.2], pitch);
  }
  box([0.1, 0.1, 1.3], P.hullDark, [0, gy - 0.03, 1.2], pitch);
  // coil rings
  [0.85, 1.05, 1.25, 1.45, 1.65].forEach((z, i) => {
    glow(
      b.part(new THREE.TorusGeometry(0.155, 0.022, 4, 8), P.neonCyan, { bone: pitch, at: [0, gy, z] }),
      1.6,
    );
    box([0.34, 0.04, 0.05], i % 2 ? P.hullLight : P.hullDark, [0, gy + 0.17, z], pitch);
    box([0.34, 0.04, 0.05], P.hullDark, [0, gy - 0.17, z], pitch);
  });
  // muzzle brake
  box([0.34, 0.22, 0.16], P.hullDark, [0, gy, 1.82], pitch);
  box([0.38, 0.04, 0.2], P.trim, [0, gy + 0.13, 1.82], pitch);
  for (const s of [1, -1]) box([0.03, 0.2, 0.12], P.steel, [s * 0.18, gy, 1.82], pitch);
  glow(box([0.3, 0.16, 0.05], P.neonMagenta, [0, gy, 1.92], pitch), 2.2);
  // cable runs
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.25, 2.82, -0.1],
        [s * 0.22, 2.9, 0.4],
        [s * 0.17, 2.99, 0.75],
        [s * 0.16, 3.0, 1.3],
      ],
      0.012,
      { color: P.hullDark, bone: pitch, caps: "round", sides: 5 },
    );
  }
  // yellow barrel stripe
  box([0.12, 0.012, 0.3], P.trim, [0, gy + 0.065, 0.62], pitch);
}
    return buildTurretGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhoundTruck2077" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.2,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.62,2.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.62,2.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.62,-1.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.62,-1.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.62,-2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.62,-2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.55,-0.1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,2.95,0.3], dir: [0,0,1], role: "hinge", group: "turret" });
  J["rampRear"] = b.joint("rampRear", { parent: J["body"], at: [0,1,-4], dir: [0,-1,0], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
