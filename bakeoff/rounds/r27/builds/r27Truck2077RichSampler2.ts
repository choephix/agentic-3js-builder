import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Warden-77 Siege Hauler",
  description:
    "Low-poly cyberpunk 2077 militarized six-wheel truck: camo plate hull, armoured cargo module, railgun turret, missile pods, neon underglow, screens and decals.",
};

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "warden77" });

  // ------------------------------------------------------------ palette
  const NEON_M = "#ff2bd6";
  const NEON_C = "#2bf0ff";
  const HAZ = "#ff8a1c";
  const DARK = "#101216";
  const TYRE = "#17191c";
  const GLASS = "#12323f";
  const RED = "#ff2030";

  const camo = paint((p) => {
    const v = noise(p, 0.7, 4);
    if (p.y < 1.0) return "#14181c";
    return v < 0.38 ? "#222b33" : v < 0.65 ? "#2f3b45" : "#3b4b54";
  });
  const HULL = panelled(camo, { size: 0.45, aspect: 0.7, rivets: 0.07, seam: "#0a0c0f" });
  const HULL2 = panelled(
    paint((p) => (noise(p, 0.5, 9) < 0.5 ? "#2a343c" : "#35424b")),
    { size: 0.55, aspect: 0.6, rivets: 0.08, seam: "#0a0c0f" },
  );
  const CHEV = paint((p) => (((((p.x + p.y) / 0.14) % 1) + 1) % 1 < 0.5 ? HAZ : "#15161a"));
  const STEEL = metal("steel", { tarnish: 0.4 });
  const IRON = metal("iron");
  const BLUED = metal("blued");
  const MUD = paint((p) => {
    const m = smoothstep(0.55, 0.0, p.y + (noise(p, 0.15, 2) - 0.5) * 0.3);
    return mix("#17191c", "#3a3126", m * 0.8);
  });

  // ------------------------------------------------------------ textures
  const FONT = 'font-family="Arial Black, Arial, sans-serif" font-weight="900"';
  const TEX_NUM = svg(
    `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="#0c0e11" stroke="#2bf0ff" stroke-width="4"/><text x="64" y="52" ${FONT} font-size="42" fill="#2bf0ff" text-anchor="middle">W-77</text><rect x="12" y="10" width="30" height="4" fill="#ff2bd6"/></svg>`,
    { size: 256 },
  );
  const TEX_WARN = svg(
    `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`,
    { size: 192 },
  );
  const TEX_BRAND = svg(
    `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15161a" stroke="#ff2bd6" stroke-width="4"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#2bf0ff" stroke-width="9"/><polyline points="32,76 48,56 64,76" fill="none" stroke="#f2f2f2" stroke-width="7"/></svg>`,
    { size: 192 },
  );
  const TEX_HUD = svg(
    `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a" stroke-width="1">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20, 40, 60, 80].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><line x1="46" y1="50" x2="114" y2="50" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="44" height="6" fill="#2bf0ff"/><rect x="8" y="88" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="88" width="22" height="6" fill="#ff2bd6"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">ARMED</text></svg>`,
    { size: 320 },
  );
  const TEX_MAP = svg(
    `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#14061a"/><g fill="none" stroke="#a21b8c" stroke-width="2"><path d="M10 80 C 40 60, 60 90, 90 60 S 140 40, 155 20"/><path d="M5 50 C 30 30, 70 70, 100 30 S 130 10, 158 40"/></g><circle cx="96" cy="46" r="5" fill="#ff2bd6"/><circle cx="96" cy="46" r="12" fill="none" stroke="#ff2bd6" stroke-width="2"/><text x="8" y="16" font-family="monospace" font-size="11" fill="#ff7be8">NEO-SECTOR 9</text></svg>`,
    { size: 320 },
  );
  const TEX_SLIT = svg(
    `<svg viewBox="0 0 100 24"><polygon points="2,4 98,10 90,20 8,20" fill="#bffcff"/><polygon points="2,4 98,10 96,13 6,10" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  const TEX_CHEV = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#15161a"/>${[0, 16, 32, 48].map((x) => `<polygon points="${x},16 ${x + 8},0 ${x + 16},0 ${x + 8},16" fill="#ff8a1c"/>`).join("")}</svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------ skeleton
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  const bx = (w: number, h: number, d: number, color: any, at: V3, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: o.bone ?? chassis, at, rotation: o.rot });
  const cyZ = (r: number, len: number, color: any, at: V3, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, o.sides ?? 8), color, { bone: o.bone ?? chassis, at, rotation: [90, 0, 0], flat: true });
  const cyY = (r: number, len: number, color: any, at: V3, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, o.sides ?? 8), color, { bone: o.bone ?? chassis, at, flat: true });
  const cyX = (r: number, len: number, color: any, at: V3, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, o.sides ?? 8), color, { bone: o.bone ?? chassis, at, rotation: [0, 0, 90], flat: true });
  const rod = (a: V3, c: V3, r: number, color: any, bone: any = chassis, sides = 6) =>
    b.rod(a, c, r, color, { bone, sides });
  const decal = (tex: THREE.Texture, at: V3, dir: V3, w: number, h: number, g = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex });
    if (g) glow(p, g);
    return p;
  };

  // ------------------------------------------------------------ hull & cab
  b.extrude(
    [
      [-2.9, 0.85],
      [2.5, 0.85],
      [3.0, 1.05],
      [3.05, 1.5],
      [2.5, 1.78],
      [-2.9, 1.78],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.04, color: HULL, bone: chassis },
  );
  b.extrude(
    [
      [-0.4, 1.7],
      [-0.4, 2.55],
      [0.8, 2.62],
      [1.85, 2.0],
      [2.05, 1.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.04, color: HULL, bone: chassis },
  );
  // cargo module
  b.extrude(
    [
      [-2.85, 1.7],
      [-0.55, 1.7],
      [-0.55, 2.55],
      [-0.9, 2.75],
      [-2.5, 2.75],
      [-2.85, 2.45],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.04, color: HULL2, bone: chassis },
  );

  // windscreen
  bx(1.7, 0.05, 1.18, GLASS, [0, 2.33, 1.33], { rot: [31, 0, 0] });
  glow(bx(1.5, 0.02, 0.07, NEON_C, [0, 2.35, 1.25], { rot: [31, 0, 0] }), 0.8);
  bx(1.8, 0.07, 0.07, DARK, [0, 2.6, 0.8]);
  bx(1.74, 0.07, 0.07, DARK, [0, 2.0, 1.84], { rot: [31, 0, 0] });
  for (const s of [1, -1]) {
    // side windows, door seams
    bx(0.04, 0.38, 1.15, GLASS, [s * 1.0, 2.15, 0.65]);
    glow(bx(0.045, 0.03, 0.9, NEON_C, [s * 1.005, 2.0, 0.65]), 0.7);
    for (const z of [0.0, 1.25]) bx(0.05, 0.85, 0.04, DARK, [s * 1.0, 2.1, z]);
    bx(0.05, 0.04, 1.3, DARK, [s * 1.0, 1.8, 0.62]);
    bx(0.06, 0.05, 0.22, STEEL, [s * 1.03, 1.95, 0.15]);
    // hazard door plate
    bx(0.04, 0.22, 1.1, CHEV, [s * 1.01, 1.85, 0.65]);
    // mirrors
    rod([s * 1.0, 2.2, 1.55], [s * 1.35, 2.25, 1.6], 0.025, STEEL);
    rod([s * 1.0, 2.0, 1.55], [s * 1.35, 2.15, 1.6], 0.025, STEEL);
    bx(0.08, 0.34, 0.22, DARK, [s * 1.38, 2.2, 1.62]);
    glow(bx(0.02, 0.28, 0.17, NEON_C, [s * 1.425, 2.2, 1.62]), 0.6);
    // step bars
    bx(0.25, 0.05, 1.2, STEEL, [s * 1.25, 1.2, 0.65]);
    rod([s * 1.15, 1.2, 0.2], [s * 1.15, 1.65, 0.2], 0.03, STEEL);
    rod([s * 1.15, 1.2, 1.1], [s * 1.15, 1.65, 1.1], 0.03, STEEL);
  }

  // roof furniture
  bx(1.4, 0.1, 0.22, DARK, [0, 2.72, 0.55]);
  for (let i = 0; i < 6; i++) {
    glow(bx(0.2, 0.08, 0.06, i % 2 ? NEON_M : NEON_C, [-0.55 + i * 0.22, 2.74, 0.68]), 1.6);
  }
  b.part(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: chassis, at: [0.55, 2.62, 0.1], flat: true });
  cyY(0.22, 0.05, STEEL, [0.55, 2.62, 0.1], { sides: 10 });
  glow(cyY(0.07, 0.06, NEON_M, [0.55, 2.7, 0.1]), 1.5);
  // cables
  b.sweep(catmull([[0.3, 2.62, -0.4], [0.35, 3.0, -0.65], [0.3, 2.78, -0.95]]), 0.03, { color: DARK, bone: chassis, sides: 5 });
  b.sweep(catmull([[-0.3, 2.6, -0.4], [-0.38, 2.98, -0.65], [-0.3, 2.78, -0.95]]), 0.03, { color: DARK, bone: chassis, sides: 5 });

  // ------------------------------------------------------------ nose
  bx(2.5, 0.3, 0.3, CHEV, [0, 0.98, 3.12]);
  for (let i = 0; i < 7; i++) b.spike([-1.05 + i * 0.35, 0.95, 3.24], [0, 0, 1], 0.32, 0.07, STEEL, { bone: chassis, sides: 4 });
  for (const s of [1, -1]) {
    bx(0.14, 0.42, 0.42, IRON, [s * 1.3, 1.0, 3.0]);
    bx(0.7, 0.2, 0.08, DARK, [s * 0.8, 1.38, 3.05]);
    decal(TEX_SLIT, [s * 0.8, 1.38, 3.1], [0, 0, 1], 0.64, 0.16, 1.8);
    bx(0.72, 0.05, 0.14, STEEL, [s * 0.8, 1.52, 3.07], { rot: [-10, 0, 0] });
    cyZ(0.07, 0.12, DARK, [s * 1.05, 1.1, 3.05]);
    glow(cyZ(0.05, 0.03, HAZ, [s * 1.05, 1.1, 3.12]), 1.4);
  }
  bx(0.95, 0.52, 0.06, DARK, [0, 1.3, 3.04]);
  for (let i = 0; i < 5; i++) glow(rod([-0.44, 1.12 + i * 0.1, 3.08], [0.44, 1.12 + i * 0.1, 3.08], 0.014, NEON_M), 1.2);
  bx(1.1, 0.04, 1.0, DARK, [0, 1.81, 2.55]);
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) glow(bx(0.34, 0.015, 0.05, NEON_C, [s * 0.3, 1.835, 2.2 + i * 0.2]), 1.0);
  // hood armor plates
  bx(1.4, 0.06, 0.5, CHEV, [0, 1.8, 2.95], { rot: [-8, 0, 0] });

  // ------------------------------------------------------------ cargo module details
  const ribs = [-0.8, -1.3, -1.8, -2.3];
  for (const s of [1, -1]) {
    for (const z of ribs) bx(0.06, 0.95, 0.1, DARK, [s * 1.12, 2.22, z]);
    bx(0.07, 0.07, 2.3, STEEL, [s * 1.12, 1.75, -1.7]);
    bx(0.07, 0.07, 2.2, STEEL, [s * 1.12, 2.68, -1.7]);
    // vents
    for (let i = 0; i < 5; i++) glow(bx(0.03, 0.03, 0.34, NEON_M, [s * 1.115, 2.55 - i * 0.05 * 0, -2.15 + 0.0]), 0);
  }
  for (const s of [1, -1]) {
    const d = s * 1.12;
    decal(TEX_NUM, [d, 2.28, -1.05], [s, 0, 0], 0.9, 0.5, 0.5);
    decal(TEX_MAP, [d, 2.32, -2.0], [s, 0, 0], 0.7, 0.44, 1.2);
    decal(TEX_WARN, [d, 2.0, -2.5], [s, 0, 0], 0.3, 0.3);
    decal(TEX_BRAND, [s * 1.16, 1.4, 2.65], [s, 0, 0], 0.4, 0.4, 0.6);
    // fenders & skirts
    bx(0.12, 0.45, 1.3, HULL2, [s * 1.18, 1.18, 0.6]);
    glow(bx(0.03, 0.04, 1.2, NEON_M, [s * 1.25, 0.95, 0.6]), 1.6);
    // exhaust stacks
    rod([s * 1.24, 1.6, -0.72], [s * 1.24, 3.0, -0.72], 0.07, STEEL, chassis, 8);
    cyY(0.11, 0.5, BLUED, [s * 1.24, 2.3, -0.72], { sides: 8 });
    cyY(0.09, 0.05, DARK, [s * 1.24, 3.03, -0.72]);
    bx(0.1, 0.9, 0.14, IRON, [s * 1.18, 2.1, -0.72]);
    // roof pods
    bx(0.5, 0.42, 0.9, IRON, [s * 0.85, 2.97, -2.2]);
    for (const dx of [-0.1, 0.1]) for (const dy of [-0.1, 0.1]) {
      cyZ(0.08, 0.05, DARK, [s * 0.85 + dx, 2.97 + dy, -1.74]);
      b.spike([s * 0.85 + dx, 2.97 + dy, -1.76], [0, 0, 1], 0.14, 0.06, HAZ, { bone: chassis, sides: 6 });
    }
    // tail light
    glow(bx(0.35, 0.09, 0.04, RED, [s * 0.9, 1.6, -2.93]), 1.6);
    // thrusters
    cyZ(0.25, 0.45, IRON, [s * 0.65, 1.2, -3.1], { sides: 10 });
    cyZ(0.2, 0.05, DARK, [s * 0.65, 1.2, -3.34], { sides: 10 });
    glow(cyZ(0.15, 0.03, NEON_C, [s * 0.65, 1.2, -3.37], { sides: 10 }), 1.8);
    b.part(new THREE.TorusGeometry(0.26, 0.025, 5, 10), STEEL, { bone: chassis, at: [s * 0.65, 1.2, -3.0] });
    // antenna whips
    b.spike([s * 1.0, 2.75, -2.7], [s * 0.1, 1, -0.1], 1.3, 0.02, STEEL, { bone: chassis, sides: 4 });
    // energy cells
    cyY(0.1, 0.4, "#9dff3a", [s * 0.45, 2.95, -0.85], { sides: 6 });
  }
  for (const s of [1, -1]) glow(cyY(0.07, 0.38, "#9dff3a", [s * 0.45, 2.95, -0.85], { sides: 6 }), 1.4);
  // underglow
  for (const s of [1, -1]) glow(rod([s * 0.95, 0.83, -2.6], [s * 0.95, 0.83, 2.7], 0.025, NEON_M, chassis), 1.8);
  glow(rod([-0.95, 0.83, 2.7], [0.95, 0.83, 2.7], 0.025, NEON_C, chassis), 1.8);
  glow(rod([-0.95, 0.83, -2.6], [0.95, 0.83, -2.6], 0.025, NEON_C, chassis), 1.8);
  // dish antenna
  b.lathe(
    [[0, 0], [0.3, 0.12], [0.3, 0.14], [0, 0.03]],
    { at: [0.0, 2.8, -2.55], axis: [0, 0.8, -0.5], segments: 10, color: STEEL, bone: chassis },
  );
  rod([0, 2.78, -2.55], [0, 2.95, -2.7], 0.015, STEEL);

  // rear ramp door
  const ramp = b.joint("ramp", { parent: chassis, at: [0, 1.8, -2.92], dir: [1, 0, 0], role: "hinge" });
  bx(2.0, 0.65, 0.06, HULL2, [0, 2.13, -2.91], { bone: ramp });
  bx(2.05, 0.06, 0.1, STEEL, [0, 2.48, -2.92], { bone: ramp });
  b.part(new THREE.PlaneGeometry(0.9, 0.5), "#ffffff", { bone: ramp, at: [-0.4, 2.12, -2.95], dir: [0, 0, -1], axis: "z", texture: TEX_HUD });
  decal(TEX_BRAND, [0.55, 2.12, -2.95], [0, 0, -1], 0.4, 0.4);
  glow(b.part(new THREE.PlaneGeometry(0.9, 0.5), "#ffffff", { bone: ramp, at: [-0.4, 2.12, -2.955], dir: [0, 0, -1], axis: "z", texture: TEX_HUD }), 1.3);

  // ------------------------------------------------------------ turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.78, -1.7], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.25, -1.5], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.6, 0.04, 6, 14), STEEL, { bone: chassis, at: [0, 2.8, -1.7], rotation: [90, 0, 0] });
  cyY(0.55, 0.2, IRON, [0, 2.88, -1.7], { bone: yaw, sides: 12 });
  bx(1.0, 0.45, 1.0, HULL2, [0, 3.12, -1.75], { bone: yaw });
  for (const s of [1, -1]) {
    bx(0.07, 0.4, 0.8, HULL, [s * 0.42, 3.3, -1.5], { bone: yaw });
    bx(0.22, 0.28, 0.34, DARK, [s * 0.62, 3.2, -1.8], { bone: yaw });
    cyZ(0.07, 1.4, STEEL, [s * 0.34, 3.12, -0.3], { bone: pitch });
    glow(cyZ(0.04, 1.0, NEON_M, [s * 0.34, 3.12, -0.3], { bone: pitch }), 1.4);
  }
  rod([-0.45, 3.25, -1.5], [0.45, 3.25, -1.5], 0.04, STEEL, pitch);
  bx(0.5, 0.36, 0.7, IRON, [0, 3.25, -1.9], { bone: pitch });
  for (const s of [1, -1]) bx(0.07, 0.14, 3.0, STEEL, [s * 0.12, 3.25, -0.1], { bone: pitch });
  glow(bx(0.1, 0.03, 2.8, NEON_C, [0, 3.25, 0.0], { bone: pitch }), 2.0);
  for (let i = 0; i < 8; i++) {
    const r = 0.26 - i * 0.012;
    cyZ(r, 0.1, HULL, [0, 3.25, -1.2 + i * 0.3], { bone: pitch, sides: 8 });
    glow(b.part(new THREE.TorusGeometry(r - 0.03, 0.015, 5, 10), NEON_C, { bone: pitch, at: [0, 3.25, -1.14 + i * 0.3] }), 1.6);
  }
  bx(0.2, 0.2, 0.14, DARK, [0, 3.25, 1.5], { bone: pitch });
  b.spike([0, 3.25, 1.55], [0, 0, 1], 0.3, 0.05, STEEL, { bone: pitch, sides: 5 });

  // ------------------------------------------------------------ undercarriage & wheels
  for (const z of [1.8, -0.6, -1.9]) {
    rod([-1.3, 0.5, z], [1.3, 0.5, z], 0.09, DARK, chassis, 8);
    b.part(new THREE.SphereGeometry(0.2, 7, 5), IRON, { bone: chassis, at: [0, 0.5, z], flat: true });
    for (const s of [1, -1]) {
      bx(0.7, 0.07, 1.3, HULL2, [s * 1.3, 1.1, z]);
      bx(0.06, 0.35, 1.3, HULL, [s * 1.62, 0.95, z]);
      glow(bx(0.04, 0.03, 1.0, HAZ, [s * 1.66, 1.1, z]), 1.0);
    }
  }
  bx(0.3, 0.2, 5.4, DARK, [0, 0.8, 0]);
  rod([0, 0.6, -2], [0, 0.6, 2.4], 0.06, STEEL);

  const wheel = (name: string, x: number, z: number) => {
    const s = x > 0 ? 1 : -1;
    const j = b.joint(name, { parent: chassis, at: [x, 0.5, z], dir: [s, 0, 0], role: "hinge" });
    b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.42, 12), MUD, { bone: j, at: [x, 0.5, z], rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.44, 0.09, 0.15), TYRE, {
        bone: j,
        at: [x, 0.5 + 0.485 * Math.cos(a), z + 0.485 * Math.sin(a)],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.46, 8), STEEL, { bone: j, at: [x, 0.5, z], rotation: [0, 0, 90], flat: true });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), DARK, { bone: j, at: [x + s * 0.02, 0.5, z], rotation: [0, 0, 90], flat: true });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.02, 5, 14), NEON_M, { bone: j, at: [x + s * 0.23, 0.5, z], rotation: [0, 90, 0] }), 1.8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), HAZ, {
        bone: j,
        at: [x + s * 0.26, 0.5 + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)],
        rotation: [0, 0, 90],
      });
    }
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), BLUED, { bone: j, at: [x + s * 0.27, 0.5, z], rotation: [0, 0, 90] });
  };
  let n = 0;
  for (const z of [1.8, -0.6, -1.9]) for (const s of [1, -1]) wheel(`wheel${s > 0 ? "L" : "R"}${n++ % 3}`, s * 1.3, z);

  return b.root;
}
