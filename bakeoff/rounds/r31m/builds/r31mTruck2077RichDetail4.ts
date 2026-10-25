import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, cells, smoothstep, svg, arc, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Nexus Wraith MK-77",
  description:
    "A 2077 militarized cyberpunk pickup: armoured wedge cab with bar-armoured glass, neon trims, roof railgun turret, bed rocket pods, radar, generator cells, rear thrusters and run-flat beadlock wheels.",
};

// ---------- palette
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb21a";
const RED = "#ff2a3c";
const LAMP = "#d8fbff";
const DARK = "#12151a";
const DARK2 = "#1d222a";
const RUBBER = "#0d0e11";
const GLASS = "#0f3a4c";
const WARN = "#ffc400";
const STEELF = "#7b8591";

// ---------- paints
const CAMO = paint((p, n) => {
  const c = cells(p, 0.22, 3);
  const pal = ["#262d35", "#1e242b", "#2f3943", "#352b42"];
  let out = mix(pal[Math.floor(c.id * pal.length) % pal.length], "#5d7080", smoothstep(0.6, 1, n.y) * 0.25);
  out = mix(out, "#3b3326", smoothstep(0.85, 0.4, p.y) * 0.5 * noise(p, 0.2, 4));
  const edge = smoothstep(0.07, 0.0, c.d2 - c.d1);
  out = mix(out, c.id > 0.9 ? CYAN : "#090b0e", 0.55 * edge);
  return out;
});
const HULL = panelled(CAMO, { size: 0.5, aspect: 0.55, rivets: 0.07, seam: "#05070a" });
const BUMP = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.05 });
const STEEL = metal("steel", { tarnish: 0.35 });
const IRON = metal("iron");
const GUN = metal("blued");

// ---------- textures
const HAZARD = (() => {
  let s = `<rect width="96" height="16" fill="${WARN}"/>`;
  for (let i = -1; i < 10; i++) s += `<polygon points="${i * 12},16 ${i * 12 + 6},16 ${i * 12 + 14},0 ${i * 12 + 8},0" fill="#111"/>`;
  return svg(`<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg">${s}<rect x="0" y="0" width="96" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`, { size: 192 });
})();
const EMBLEM = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <polygon points="64,4 118,34 118,94 64,124 10,94 10,34" fill="#0a0d12" stroke="${CYAN}" stroke-width="5"/>
  <polygon points="64,16 106,40 106,88 64,112 22,88 22,40" fill="none" stroke="${MAG}" stroke-width="2.5"/>
  <path d="M64 30 L92 62 L78 62 L64 48 L50 62 L36 62 Z" fill="${CYAN}"/>
  <path d="M40 72 L64 100 L88 72 L76 72 L64 86 L52 72 Z" fill="${MAG}"/>
  <circle cx="64" cy="64" r="7" fill="#0a0d12" stroke="#fff" stroke-width="2"/>
  <path d="M14 56 H30 M98 56 H114 M14 72 H30 M98 72 H114" stroke="${AMBER}" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="94" height="30" rx="4" fill="#e9e6c8" stroke="#111" stroke-width="2"/>
  <rect x="4" y="4" width="88" height="5" fill="#1b2f8a"/><text x="48" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#111">NX-2077</text></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 96 40" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="40" fill="#04121a"/>
  <rect x="1" y="1" width="94" height="38" fill="none" stroke="${CYAN}" stroke-width="1.5"/>
  <circle cx="22" cy="21" r="14" fill="none" stroke="${CYAN}" stroke-width="1.2"/><circle cx="22" cy="21" r="7" fill="none" stroke="${CYAN}" stroke-width="0.8"/>
  <path d="M22 21 L33 12" stroke="${CYAN}" stroke-width="1.5"/><circle cx="29" cy="25" r="1.8" fill="${RED}"/><circle cx="15" cy="15" r="1.5" fill="${AMBER}"/>
  <polyline points="44,30 52,22 58,26 66,12 74,20 90,8" fill="none" stroke="${MAG}" stroke-width="1.6"/>
  <rect x="44" y="33" width="20" height="3" fill="${CYAN}"/><rect x="68" y="33" width="10" height="3" fill="${AMBER}"/><rect x="81" y="33" width="8" height="3" fill="${RED}"/>
  <rect x="44" y="5" width="22" height="2.5" fill="${CYAN}"/><rect x="44" y="10" width="14" height="2.5" fill="${CYAN}"/></svg>`,
  { size: 384 },
);
const CRATE = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#3b4a2f"/><rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="#1d2616" stroke-width="2"/>
  <polygon points="16,5 26,22 6,22" fill="${WARN}" stroke="#111" stroke-width="1.5"/><rect x="15" y="10" width="2" height="6" fill="#111"/><rect x="15" y="18" width="2" height="2" fill="#111"/>
  <text x="16" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="5" fill="#e8e8d0">AMMO-HE</text></svg>`,
  { size: 192 },
);
const NUM = svg(
  `<svg viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg"><text x="48" y="54" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="62" fill="${CYAN}" stroke="#05070a" stroke-width="4" paint-order="stroke">07</text>
  <rect x="6" y="4" width="84" height="4" fill="${MAG}"/></svg>`,
  { size: 256 },
);

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cylg = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);

export default function build() {
  const b = createBuilder({ name: "nexus_wraith_2077" });
  const R = rng(7);
  const ch = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });

  const add = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: ch, at, flat: true, ...o });
  const bx = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) => add(box(w, h, d), col, at, o);
  const cy = (r: number, h: number, col: any, at: number[], axis: "x" | "y" | "z" = "y", n = 8, o: any = {}) =>
    add(cylg(r, h, n), col, at, { rotation: axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0], ...o });
  const rod = (a: number[], c: number[], r: number, col: any, o: any = {}) =>
    b.rod(a, c, r, col, { bone: ch, sides: 6, ...o });
  const gl = (p: any, k = 1.3) => glow(p, k);
  const tex = (t: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: ch, at, dir, axis: "z", texture: t, ...o });

  // ============ hull ============
  b.extrude(
    [[-0.9, 0.55], [2.6, 0.55], [2.74, 0.85], [2.55, 1.1], [1.35, 1.26], [0.72, 1.98], [0.55, 2.1], [-0.75, 2.1], [-0.9, 1.95]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.7, bevel: 0.05, color: HULL, bone: ch },
  );
  // lower rear body and bed
  bx(1.7, 0.3, 1.75, HULL, [0, 0.7, -1.8]);
  bx(1.7, 0.08, 1.7, DARK2, [0, 0.8, -1.8]);
  for (let i = -3; i <= 3; i++) bx(0.07, 0.03, 1.6, DARK, [i * 0.22, 0.86, -1.8]);
  for (const s of [1, -1]) {
    bx(0.1, 0.42, 1.78, HULL, [s * 0.9, 1.1, -1.8]);
    bx(0.18, 0.06, 1.84, STEEL, [s * 0.9, 1.33, -1.8]);
    rod([s * 0.97, 1.28, -2.6], [s * 0.97, 1.28, -0.98], 0.016, s > 0 ? CYAN : MAG);
    for (const z of [-2.5, -1.8, -1.1]) bx(0.05, 0.4, 0.06, DARK, [s * 0.96, 1.1, z]);
    tex(NUM, 0.55, 0.37, [s * 0.955, 1.1, -1.8], [s, 0, 0]);
    // wall light pods
    for (const z of [-2.3, -1.3]) gl(cy(0.03, 0.03, AMBER, [s * 0.96, 0.98, z], "x", 6));
  }
  bx(1.7, 0.45, 0.08, HULL, [0, 1.08, -0.98]); // headboard
  bx(1.6, 0.06, 0.12, STEEL, [0, 1.33, -0.98]);

  // tailgate
  const gate = b.joint("tailgate", { parent: ch, at: [0, 0.86, -2.66], dir: [1, 0, 0], role: "hinge" });
  b.part(box(1.7, 0.5, 0.08), HULL, { bone: gate, at: [0, 1.12, -2.66], flat: true });
  b.part(box(1.5, 0.05, 0.03), RED, { bone: gate, at: [0, 1.3, -2.71], flat: true });
  glow(b.part(box(1.5, 0.05, 0.03), RED, { bone: gate, at: [0, 1.3, -2.705], flat: true }), 1.6);
  b.part(new THREE.PlaneGeometry(0.5, 0.17), "#ffffff", { bone: gate, at: [0, 1.05, -2.705], dir: [0, 0, -1], axis: "z", texture: PLATE });
  b.part(box(0.35, 0.04, 0.04), STEELF, { bone: gate, at: [0, 1.25, -2.71], flat: true });
  for (const s of [1, -1]) b.part(cylg(0.03, 0.12, 6), STEEL, { bone: gate, at: [s * 0.8, 0.9, -2.66], rotation: [0, 0, 90], flat: true });

  // ============ cab details ============
  // windshield and bars
  b.part(box(1.62, 0.9, 0.03), GLASS, { bone: ch, at: [0, 1.63, 1.05], rotation: [-41.7, 0, 0], flat: true });
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.15;
    const z = 1.35 - 0.63 * t + 0.03, y = 1.26 + 0.72 * t + 0.02;
    rod([-0.82, y, z], [0.82, y, z], 0.014, DARK, { sides: 4 });
  }
  for (const s of [1, -1]) rod([s * 0.82, 1.28, 1.38], [s * 0.82, 1.98, 0.74], 0.03, STEEL, { section: { ngon: 4 } });
  // side windows, slats, doors
  for (const s of [1, -1]) {
    b.extrude([[-0.62, 1.5], [0.95, 1.5], [0.66, 1.93], [-0.62, 1.93]], { at: [s * 0.865, 0, 0], x: [0, 0, 1], thickness: 0.03, color: GLASS, bone: ch });
    for (const y of [1.58, 1.68, 1.78, 1.88]) rod([s * 0.9, y, -0.6], [s * 0.9, y, 0.9 - (y - 1.5) * 0.7], 0.012, DARK, { sides: 4 });
    for (const z of [-0.62, 0.95]) bx(0.014, 1.3, 0.018, DARK, [s * 0.857, 1.2, z]);
    bx(0.014, 0.018, 1.58, DARK, [s * 0.857, 1.5, 0.16]);
    bx(0.014, 0.018, 1.58, DARK, [s * 0.857, 0.72, 0.16]);
    gl(bx(0.03, 0.04, 0.22, s > 0 ? CYAN : MAG, [s * 0.865, 1.38, -0.4]));
    tex(EMBLEM, 0.5, 0.5, [s * 0.866, 1.02, 0.2], [s, 0, 0]);
    rod([s * 0.9, 0.6, 0.0], [s * 0.9, 0.6, 1.0], 0.015, s > 0 ? CYAN : MAG);
    // mirror camera pods
    rod([s * 0.9, 1.55, 1.0], [s * 1.12, 1.62, 1.08], 0.02, STEEL);
    bx(0.12, 0.15, 0.1, DARK2, [s * 1.16, 1.62, 1.08]);
    gl(cy(0.03, 0.03, CYAN, [s * 1.16, 1.62, 1.14], "z", 6));
    // vents behind door
    for (let i = 0; i < 4; i++) bx(0.02, 0.05, 0.25, DARK, [s * 0.86, 0.9 + i * 0.09, -0.42]);
  }
  // roof
  bx(1.55, 0.06, 1.35, STEEL, [0, 2.12, -0.06]);
  for (const z of [-0.5, -0.1, 0.3]) bx(1.6, 0.04, 0.05, DARK, [0, 2.16, z]);
  // roof light bar
  bx(1.3, 0.09, 0.11, DARK, [0, 2.19, 0.58]);
  for (let i = 0; i < 8; i++) gl(bx(0.14, 0.06, 0.02, i % 2 ? MAG : CYAN, [-0.56 + i * 0.16, 2.19, 0.64]));
  for (const s of [1, -1]) bx(0.05, 0.08, 0.1, STEELF, [s * 0.6, 2.15, 0.58]);
  // hatch
  const hatch = b.joint("hatch", { parent: ch, at: [-0.5, 2.15, -0.02], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.2, 0.025, 5, 12), IRON, { bone: ch, at: [-0.5, 2.16, 0.1], rotation: [90, 0, 0], flat: true });
  b.part(cylg(0.19, 0.04, 12), BUMP, { bone: hatch, at: [-0.5, 2.19, 0.1], flat: true });
  b.part(box(0.1, 0.03, 0.03), STEELF, { bone: hatch, at: [-0.5, 2.22, 0.1], flat: true });
  // lidar on spin joint
  const lidar = b.joint("lidar", { parent: ch, at: [0.55, 2.15, 0.15], dir: [0, 1, 0], role: "hinge" });
  cy(0.12, 0.05, DARK, [0.55, 2.17, 0.15], "y", 10);
  b.part(cylg(0.09, 0.14, 10), DARK2, { bone: lidar, at: [0.55, 2.27, 0.15], flat: true });
  gl(b.part(cylg(0.092, 0.02, 10), CYAN, { bone: lidar, at: [0.55, 2.27, 0.15], flat: true }));
  b.part(cylg(0.04, 0.06, 6), STEELF, { bone: lidar, at: [0.55, 2.37, 0.15], flat: true });
  // sensor dome
  add(new THREE.SphereGeometry(0.14, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [-0.5, 2.15, 0.48]);
  cy(0.05, 0.12, DARK, [-0.5, 2.18, 0.48]);
  // antennas
  for (const s of [1, -1]) {
    cy(0.06, 0.05, DARK, [s * 0.72, 2.17, -0.8]);
    for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.035, 0.01, 4, 8), STEELF, [s * 0.72, 2.2 + i * 0.03, -0.8], { rotation: [90, 0, 0] });
    b.spike([s * 0.72, 2.28, -0.8], [0, 1, s * 0.04], s > 0 ? 1.4 : 1.0, 0.016, STEEL, { bone: ch, sides: 5 });
  }
  gl(add(new THREE.SphereGeometry(0.03, 6, 4), RED, [0.72, 3.7, -0.9]), 2);
  for (const x of [-0.36, 0, 0.36]) rod([x, 2.18, -0.78], [x, 2.55, -0.78], 0.01, DARK, { sides: 4 });
  rod([-0.45, 2.55, -0.78], [0.45, 2.55, -0.78], 0.012, DARK, { sides: 4 });
  // cab rear screen & stacks
  bx(1.5, 0.52, 0.07, DARK, [0, 1.75, -0.94]);
  gl(tex(SCREEN, 1.4, 0.58, [0, 1.75, -0.98], [0, 0, -1]), 1.2);
  for (const s of [1, -1]) {
    rod([s * 0.78, 1.3, -1.03], [s * 0.78, 2.3, -1.03], 0.06, STEEL, { sides: 8 });
    for (let i = 0; i < 4; i++) cy(0.078, 0.04, DARK, [s * 0.78, 1.5 + i * 0.22, -1.03], "y", 8);
    cy(0.1, 0.05, DARK2, [s * 0.78, 2.32, -1.03], "y", 8);
    gl(cy(0.06, 0.02, AMBER, [s * 0.78, 2.36, -1.03], "y", 8));
    bx(0.05, 0.5, 0.14, IRON, [s * 0.78, 1.65, -1.12]);
  }

  // ============ hood & front ============
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) gl(bx(0.04, 0.02, 0.34, s > 0 ? CYAN : MAG, [s * (0.45 + i * 0.09), 1.17 + 0.02 * (3 - i) * 0.0, 2.0 - 0.0]), 1.0).mesh.rotation.x = 0;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        bx(0.2, 0.06, 0.14, STEEL, [s * (0.42 + j * 0.22), 1.22 - i * 0.03, 1.55 + i * 0.26], { rotation: [7.4, 0, 0] });
  }
  bx(0.5, 0.14, 0.75, BUMP, [0, 1.26, 1.9], { rotation: [7.4, 0, 0] });
  gl(bx(0.4, 0.05, 0.03, MAG, [0, 1.25, 2.3]));
  for (let i = 0; i < 3; i++) bx(0.46, 0.015, 0.06, DARK, [0, 1.335, 1.75 + i * 0.16], { rotation: [7.4, 0, 0] });
  // headlights (slits) + grille
  for (const s of [1, -1]) {
    bx(0.55, 0.12, 0.05, DARK, [s * 0.58, 1.0, 2.66], { rotation: [-37, 0, 0] });
    gl(bx(0.48, 0.045, 0.03, LAMP, [s * 0.58, 1.02, 2.69], { rotation: [-37, 0, 0] }), 1.6);
    gl(bx(0.48, 0.02, 0.03, MAG, [s * 0.58, 0.93, 2.7], { rotation: [-37, 0, 0] }), 1.2);
  }
  bx(0.6, 0.34, 0.04, DARK, [0, 0.98, 2.66], { rotation: [-37, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const t = i / 4, y = 0.86 + 0.24 * t, z = 2.73 - 0.19 * t + 0.03;
    rod([-0.27, y, z], [0.27, y, z], 0.014, i % 2 ? STEELF : MAG, { sides: 5 });
  }
  // bumper wedge
  b.extrude([[2.5, 0.42], [2.98, 0.46], [3.02, 0.66], [2.85, 0.82], [2.5, 0.82]], { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.03, color: BUMP, bone: ch });
  tex(HAZARD, 1.5, 0.16, [0, 0.58, 3.03], [0, 0, 1]);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.5, 3.0], [0, 0, 1], 0.16, 0.04, STEEL, { bone: ch, sides: 4 });
  for (const s of [1, -1]) {
    gl(cy(0.06, 0.03, AMBER, [s * 0.88, 0.64, 3.0], "z", 8));
    add(new THREE.TorusGeometry(0.075, 0.015, 4, 8), STEEL, [s * 0.88, 0.64, 3.0]);
    add(new THREE.TorusGeometry(0.06, 0.015, 4, 8, Math.PI * 1.5), STEELF, [s * 0.4, 0.4, 2.95]);
    bx(0.14, 0.05, 0.3, DARK, [s * 0.4, 0.5, 2.7]);
  }
  cy(0.07, 0.4, DARK2, [0, 0.64, 2.97], "x", 10);
  gl(bx(0.3, 0.03, 0.05, CYAN, [0, 0.74, 3.0]));

  // ============ rear ============
  bx(2.0, 0.28, 0.2, BUMP, [0, 0.55, -2.74]);
  tex(HAZARD, 1.4, 0.15, [0, 0.55, -2.845], [0, 0, -1]);
  for (const s of [1, -1]) {
    const x = s * 0.62, z = -2.8;
    b.lathe([[0, 0], [0.2, 0], [0.17, 0.1], [0.3, 0.45], [0.26, 0.45], [0.13, 0.12], [0, 0.14]], { at: [x, 0.92, z], axis: [0, 0, -1], segments: 10, bone: ch, color: STEEL });
    gl(add(cylg(0.1, 0.03, 10), CYAN, [x, 0.92, z - 0.08], { rotation: [90, 0, 0] }), 1.8);
    add(new THREE.TorusGeometry(0.22, 0.02, 5, 10), DARK, [x, 0.92, z - 0.25]);
    for (const a of [90, 210, 330]) {
      const r = (a * Math.PI) / 180;
      rod([x + 0.16 * Math.cos(r), 0.92 + 0.16 * Math.sin(r), z - 0.02], [x + 0.28 * Math.cos(r), 0.92 + 0.28 * Math.sin(r), z - 0.4], 0.012, DARK, { sides: 4 });
    }
  }
  gl(cy(0.06, 0.03, MAG, [0, 0.9, -2.82], "z", 8), 1.4);

  // ============ skirts, flares, underbody ============
  for (const s of [1, -1]) {
    b.extrude([[-1.05, 0.45], [1.05, 0.45], [0.95, 0.78], [-0.95, 0.78]], { at: [s * 0.93, 0, 0], x: [0, 0, 1], thickness: 0.08, bevel: 0.015, color: BUMP, bone: ch });
    rod([s * 0.985, 0.46, -1.0], [s * 0.985, 0.46, 1.0], 0.02, s > 0 ? CYAN : MAG, { sides: 5 });
    for (let i = 0; i < 5; i++) cy(0.014, 0.03, STEELF, [s * 0.98, 0.7, -0.8 + i * 0.4], "x", 6);
    for (const z of [-1.5, 1.5]) {
      const c: number[] = [s * 1.0, 0.42, z];
      b.sweep(arc(c, [c[0], c[1], z - 0.55], [1, 0, 0], 180), () => [0.2, 0.035], { bone: ch, section: "box", caps: "flat", color: IRON });
      b.sweep(arc([s * 1.2, 0.42, z], [s * 1.2, 0.42, z - 0.55], [1, 0, 0], 180), 0.012, CYAN, { bone: ch, sides: 5, caps: "flat" });
      for (let i = 0; i < 3; i++) cy(0.016, 0.04, STEELF, [s * 1.12, 0.42 + 0.55 * Math.sin(0.5 + i * 0.7), z - 0.55 * Math.cos(0.5 + i * 0.7)], "x", 6);
    }
    // underglow
    rod([s * 0.55, 0.5, -2.4], [s * 0.55, 0.5, 2.4], 0.015, MAG, { sides: 4 });
  }
  bx(0.6, 0.2, 1.6, DARK2, [0, 0.42, 0]);
  for (const z of [-0.5, 0, 0.5]) gl(bx(0.62, 0.03, 0.12, CYAN, [0, 0.42, z]), 0.9);
  rod([0, 0.4, 1.5], [0, 0.4, -1.5], 0.04, STEEL, { sides: 8 });

  // ============ wheels & suspension ============
  const wheel = (spin: any, mount: any, s: number, z: number) => {
    const x = s * 1.0, y = 0.42;
    const p = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: spin, at, flat: true, ...o });
    p(cylg(0.38, 0.34, 14), RUBBER, [x, y, z], { rotation: [0, 0, 90] });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      p(box(0.3, 0.05, 0.13), "#17181c", [x + (i % 2 ? 0.04 : -0.04), y + 0.395 * Math.cos(a), z + 0.395 * Math.sin(a)], { rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    p(cylg(0.27, 0.35, 10), DARK2, [x, y, z], { rotation: [0, 0, 90] });
    p(new THREE.TorusGeometry(0.34, 0.035, 5, 14), IRON, [x + s * 0.17, y, z], { rotation: [0, 90, 0] });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      p(cylg(0.014, 0.03, 6), STEELF, [x + s * 0.19, y + 0.34 * Math.cos(a), z + 0.34 * Math.sin(a)], { rotation: [0, 0, 90] });
    }
    p(cylg(0.26, 0.03, 12), STEEL, [x + s * 0.17, y, z], { rotation: [0, 0, 90] });
    glow(p(new THREE.TorusGeometry(0.235, 0.02, 5, 16), CYAN, [x + s * 0.2, y, z], { rotation: [0, 90, 0] }), 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      p(box(0.05, 0.2, 0.05), IRON, [x + s * 0.2, y + 0.14 * Math.cos(a), z + 0.14 * Math.sin(a)], { rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    p(cylg(0.09, 0.1, 8), STEELF, [x + s * 0.22, y, z], { rotation: [0, 0, 90] });
    glow(p(cylg(0.04, 0.03, 8), MAG, [x + s * 0.275, y, z], { rotation: [0, 0, 90] }), 1.6);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      p(cylg(0.012, 0.03, 6), DARK, [x + s * 0.255, y + 0.065 * Math.cos(a), z + 0.065 * Math.sin(a)], { rotation: [0, 0, 90] });
    }
    b.part(cylg(0.22, 0.03, 12), STEELF, { bone: mount, at: [x - s * 0.1, y, z], rotation: [0, 0, 90], flat: true });
    b.part(box(0.07, 0.1, 0.16), "#b0172b", { bone: mount, at: [x - s * 0.1, y + 0.2, z + 0.02], flat: true });
  };
  for (const [k, s, z] of [["FL", 1, 1.6], ["FR", -1, 1.6], ["RL", 1, -1.6], ["RR", -1, -1.6]] as const) {
    const hub = [s * 1.0, 0.42, z];
    const steer = z > 0 ? b.joint("steer" + k, { parent: ch, at: hub, dir: [0, 1, 0], role: "hinge" }) : ch;
    const spin = b.joint("wheel" + k, { parent: steer, at: hub, dir: [s, 0, 0], role: "hinge" });
    wheel(spin, steer, s, z);
    rod([s * 0.5, 0.38, z - 0.25], [s * 0.82, 0.4, z], 0.022, STEEL);
    rod([s * 0.5, 0.38, z + 0.25], [s * 0.82, 0.4, z], 0.022, STEEL);
    rod([s * 0.7, 0.3, z], [s * 0.82, 0.55, z + 0.08], 0.03, MAG, { sides: 5 });
  }
  for (const z of [-1.6, 1.6]) {
    rod([-0.82, 0.42, z], [0.82, 0.42, z], 0.06, IRON, { sides: 8 });
    add(new THREE.SphereGeometry(0.15, 8, 6), DARK2, [0, 0.42, z]);
  }

  // ============ roof turret (railgun) ============
  const yaw = b.joint("yaw", { parent: ch, at: [0, 2.12, -0.4], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.5, -0.4], dir: [0, 0, 1], role: "hinge" });
  const Y = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: yaw, at, flat: true, ...o });
  const Pt = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: pitch, at, flat: true, ...o });
  add(new THREE.TorusGeometry(0.42, 0.035, 6, 16), IRON, [0, 2.15, -0.4], { rotation: [90, 0, 0] });
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; cy(0.02, 0.03, STEELF, [0.42 * Math.cos(a), 2.18, -0.4 + 0.42 * Math.sin(a)], "y", 6); }
  Y(cylg(0.34, 0.16, 12), BUMP, [0, 2.22, -0.4]);
  gl(Y(new THREE.TorusGeometry(0.34, 0.012, 4, 14), MAG, [0, 2.15, -0.4], { rotation: [90, 0, 0] }), 1.3);
  for (const s of [1, -1]) {
    Y(box(0.07, 0.36, 0.46), BUMP, [s * 0.24, 2.42, -0.4]);
    Y(box(0.26, 0.3, 0.42), "#3b4a2f", [s * 0.5, 2.35, -0.45]);
    Y(box(0.28, 0.04, 0.2), WARN, [s * 0.5, 2.51, -0.45]);
    gl(Y(box(0.07, 0.05, 0.02), CYAN, [s * 0.24, 2.52, -0.18]), 1.5);
  }
  Pt(cylg(0.04, 0.6, 8), STEELF, [0, 2.5, -0.4], { rotation: [0, 0, 90] });
  Pt(box(0.3, 0.3, 0.5), GUN, [0, 2.5, -0.55]);
  for (const s of [1, -1]) {
    Pt(box(0.05, 0.13, 1.9), GUN, [s * 0.065, 2.5, 0.55]);
    for (let i = 0; i < 3; i++) Pt(cylg(0.07, 0.38, 8), DARK2, [s * 0.22, 2.46, -0.5 + i * 0.3], { rotation: [90, 0, 0] });
    Pt(box(0.05, 0.1, 0.2), IRON, [s * 0.1, 2.5, 1.55]);
  }
  gl(Pt(box(0.07, 0.03, 1.8), CYAN, [0, 2.5, 0.55]), 1.8);
  for (let i = 0; i < 6; i++) gl(Pt(new THREE.TorusGeometry(0.15 - i * 0.005, 0.015, 5, 10), MAG, [0, 2.5, -0.1 + i * 0.28]), 1.4);
  for (let i = 0; i < 4; i++) Pt(box(0.34, 0.06, 0.02), STEELF, [0, 2.5, 0.1 + i * 0.4]);
  Pt(box(0.24, 0.22, 0.12), DARK, [0, 2.5, 1.55]);
  Pt(box(0.3, 0.04, 0.16), IRON, [0, 2.64, 1.5]);

  // ============ bed gear: pods, battery, crates, radar ============
  for (const s of [1, -1]) {
    const o = new THREE.Vector3(s * 0.68, 1.65, -1.6);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.4, 0, 0));
    const qz = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
    const Lc = (l: number[]) => new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(q).add(o);
    const P = (g: THREE.BufferGeometry, c: any, l: number[], qq = q) => add(g, c, Lc(l).toArray(), { quat: qq });
    P(box(0.44, 0.42, 0.95), BUMP, [0, 0, 0.1]);
    P(box(0.48, 0.05, 0.3), WARN, [0, 0.215, 0.35]);
    P(box(0.1, 0.18, 0.8), DARK, [0, -0.28, 0.1]);
    for (const dx of [-0.1, 0.1])
      for (const dy of [-0.1, 0.1]) {
        P(cylg(0.085, 0.08, 10), DARK, [dx, dy, 0.58], qz);
        b.spike(Lc([dx, dy, 0.5]), new THREE.Vector3(0, 0, 1).applyQuaternion(q), 0.24, 0.065, RED, { bone: ch, sides: 8 });
      }
    gl(P(box(0.3, 0.03, 0.02), AMBER, [0, 0.19, -0.38]), 1.4);
    rod([s * 0.68, 1.3, -1.9], [s * 0.68, 1.5, -1.9], 0.03, STEEL);
    rod([s * 0.68, 1.3, -1.3], [s * 0.68, 1.45, -1.3], 0.03, STEEL);
  }
  // generator cells
  bx(0.7, 0.05, 0.42, DARK, [-0.4, 0.87, -1.3]);
  for (let i = 0; i < 3; i++) {
    gl(cy(0.09, 0.5, i === 1 ? MAG : CYAN, [-0.6 + i * 0.2, 1.14, -1.3], "y", 8), 1.4);
    cy(0.1, 0.04, STEELF, [-0.6 + i * 0.2, 1.4, -1.3], "y", 8);
  }
  for (const y of [0.92, 1.38]) bx(0.76, 0.03, 0.1, STEEL, [-0.4, y, -1.3]);
  // crates
  for (const [x, y, z, r] of [[0.4, 1.03, -2.1, 0], [0.4, 1.03, -1.55, 6], [0.4, 1.38, -1.8, 14]] as const) {
    b.part(new THREE.BoxGeometry(0.55, 0.35, 0.48), "#ffffff", { bone: ch, at: [x, y, z], rotation: [0, r, 0], texture: CRATE });
    for (const dz of [-0.15, 0.15]) bx(0.57, 0.37, 0.03, DARK, [x, y, z + dz], { rotation: [0, r, 0] });
  }
  rod([0.1, 0.9, -1.3], [0.7, 1.55, -1.7], 0.01, WARN, { sides: 4 });
  // radar
  const radar = b.joint("radar", { parent: ch, at: [-0.5, 1.4, -2.25], dir: [0, 1, 0], role: "hinge" });
  cy(0.05, 0.45, STEEL, [-0.5, 1.1, -2.25]);
  cy(0.14, 0.06, DARK2, [-0.5, 0.88, -2.25], "y", 8);
  b.lathe([[0, 0], [0.3, 0.1], [0.3, 0.12], [0, 0.03]], { at: [-0.5, 1.45, -2.25], axis: [0, 0.8, -0.6], segments: 12, bone: radar, color: BUMP });
  b.part(cylg(0.05, 0.08, 8), DARK, { bone: radar, at: [-0.5, 1.47, -2.25], rotation: [-37, 0, 0], flat: true });
  rod([-0.5, 1.5, -2.27], [-0.5, 1.78, -2.5], 0.012, STEELF, { bone: radar, sides: 4 });
  gl(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: radar, at: [-0.5, 1.78, -2.5], flat: true }), 2);

  // ============ cables ============
  for (let i = 0; i < 3; i++) {
    const dx = (i - 1) * 0.03;
    b.sweep(catmull([[0.2 + dx, 2.2, -0.45], [0.35 + dx, 2.0, -0.8 - R() * 0.05], [0.7 + dx, 1.42, -0.98]]), 0.013, i === 1 ? MAG : DARK, { bone: ch, sides: 5 });
  }
  b.sweep(catmull([[-0.7, 1.3, -1.0], [-0.8, 1.0, -1.15], [-0.6, 0.9, -1.3]]), 0.02, DARK2, { bone: ch, sides: 6 });

  return b.root;
}
