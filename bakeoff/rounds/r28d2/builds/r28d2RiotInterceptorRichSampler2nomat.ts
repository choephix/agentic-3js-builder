import * as THREE from "three";
import { createBuilder, rng, catmull, polyline, paint, mix, noise, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "riot interceptor",
  description: "Corporate riot-control interceptor: armoured 6-wheel hull, roof water cannon, neon light bars, cyberpunk livery.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);

  const NAVY = "#14182b", STEEL = "#3a4156", DARK = "#0d0f1a", TYRE = "#181a22";
  const CYAN = "#19f3ff", PINK = "#ff2d95", YEL = "#ffe600", AMBER = "#ffae2a";

  const hullPaint = paint((p, n) => {
    let c = mix(NAVY, "#2a3150", smoothstep(0.3, 0.8, noise(p, 0.4, 3)) * 0.6);
    if (Math.abs(p.y - 1.15) < 0.012) c = mix(c, PINK, 0.9);
    if (n.y > 0.6) c = mix(c, "#4a5578", 0.35);
    if (p.y < 0.75) c = mix(c, "#07080d", 0.5);
    return c;
  });
  const plateTex = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#10142a"/>
    <path d="M0 64 L30 0 H50 L20 64Z M60 64 L90 0 H110 L80 64Z" fill="${YEL}"/>
    <rect x="4" y="4" width="120" height="56" fill="none" stroke="${CYAN}" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const logoTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#0b0d18" stroke="${PINK}" stroke-width="6"/>
    <path d="M26 66 L50 22 L74 66 L50 54Z" fill="${CYAN}"/><rect x="44" y="60" width="12" height="14" fill="${YEL}"/></svg>`,
    { size: 128 },
  );
  const textTex = svg(
    `<svg viewBox="0 0 200 50"><rect width="200" height="50" fill="#0b0d18"/>
    <text x="100" y="36" font-family="monospace" font-weight="bold" font-size="30" text-anchor="middle" fill="${YEL}">RIOT CTRL</text></svg>`,
    { size: 256 },
  );

  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at: at as any, ...o });

  // hull
  P(box(2.1, 0.5, 5.6), hullPaint, [0, 0.75, 0]);
  b.frustumBox([0, 1.05, 0.2], [0, 1.0, 2.9], [2.1, 0.5], [1.9, 0.3], { bone: chassis, color: hullPaint });
  P(box(2.0, 0.7, 2.2), hullPaint, [0, 1.35, -0.4]); // cab
  P(box(1.96, 0.06, 2.3), STEEL, [0, 1.72, -0.4]);
  // raked windscreen & side glass
  P(box(1.8, 0.45, 0.05), "#1b3c4d", [0, 1.4, 0.75], { rotation: [-30, 0, 0] });
  for (const s of [1, -1]) {
    P(box(0.04, 0.3, 1.5), "#1b3c4d", [s * 1.0, 1.45, -0.4]);
    P(box(0.12, 0.5, 5.0), STEEL, [s * 1.06, 0.65, 0]); // skirt armour
    P(box(0.02, 0.08, 4.6), PINK, [s * 1.13, 0.72, 0]);
    glow(P(box(0.02, 0.04, 4.4), PINK, [s * 1.13, 0.72, 0]), 1.5);
    // wheels: 3 axles
    for (const z of [-1.9, 0, 1.9]) {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${z}`.replace(/[.-]/g, "_"), { parent: chassis, at: [s * 0.95, 0.45, z], dir: [s, 0, 0], role: "hinge" });
      b.part(cyl(0.45, 0.4, 14), TYRE, { bone: w, at: [s * 0.95, 0.45, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.26, 0.42, 10), STEEL, { bone: w, at: [s * 0.95, 0.45, z], rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.025, 0.05, 6), CYAN, { bone: w, at: [s * 1.17, 0.45 + 0.17 * Math.cos(a), z + 0.17 * Math.sin(a)], rotation: [0, 0, 90] });
      }
      P(box(0.3, 0.1, 0.8), DARK, [s * 0.95, 0.98, z]); // arch
    }
    // headlights
    glow(P(box(0.5, 0.08, 0.04), YEL, [s * 0.6, 1.0, 2.92]), 2);
    P(box(0.6, 0.14, 0.05), DARK, [s * 0.6, 1.0, 2.9]);
    // mirrors
    P(box(0.06, 0.2, 0.14), DARK, [s * 1.15, 1.55, 0.7]);
    // door
    P(box(0.03, 0.55, 1.1), STEEL, [s * 1.02, 1.2, -0.3]);
    P(box(0.04, 0.04, 0.2), CYAN, [s * 1.05, 1.3, -0.7]);
  }
  // ram bumper
  P(box(2.3, 0.4, 0.3), STEEL, [0, 0.62, 3.0]);
  for (let i = -4; i <= 4; i++) P(box(0.12, 0.3, 0.1), DARK, [i * 0.25, 0.62, 3.2]);
  glow(P(box(2.1, 0.04, 0.04), CYAN, [0, 0.82, 3.17]), 2);
  // front grille plate
  b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", { bone: chassis, at: [0, 0.97, 2.64], dir: [0, 0, 1], axis: "z", texture: plateTex });
  // side logos and text
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: chassis, at: [s * 1.065, 0.95, -0.9], dir: [s, 0, 0], axis: "z", texture: logoTex });
    b.part(new THREE.PlaneGeometry(1.4, 0.35), "#ffffff", { bone: chassis, at: [s * 1.065, 0.95, 0.9], dir: [s, 0, 0], axis: "z", texture: textTex });
  }
  // rear
  P(box(2.0, 0.6, 0.2), STEEL, [0, 0.9, -2.8]);
  glow(P(box(1.8, 0.06, 0.04), PINK, [0, 1.1, -2.92]), 2);
  for (const s of [1, -1]) {
    b.part(cyl(0.12, 0.3, 10), DARK, { bone: chassis, at: [s * 0.6, 0.6, -2.9], rotation: [90, 0, 0] });
    glow(b.part(cyl(0.08, 0.04, 10), AMBER, { bone: chassis, at: [s * 0.6, 0.6, -3.06], rotation: [90, 0, 0] }), 1.5);
  }

  // roof neon light bars
  P(box(1.7, 0.08, 0.22), DARK, [0, 1.82, 0.5]);
  for (let i = 0; i < 8; i++)
    glow(P(box(0.19, 0.08, 0.2), i % 2 ? CYAN : PINK, [-0.75 + i * 0.215, 1.9, 0.5]), 2.5);
  P(box(1.7, 0.08, 0.22), DARK, [0, 1.82, -1.5]);
  for (let i = 0; i < 8; i++)
    glow(P(box(0.19, 0.08, 0.2), i % 2 ? PINK : CYAN, [-0.75 + i * 0.215, 1.9, -1.5]), 2.5);
  for (const s of [1, -1]) {
    P(box(0.06, 0.08, 1.9), DARK, [s * 0.9, 1.78, -0.5]);
    glow(P(box(0.04, 0.05, 1.8), CYAN, [s * 0.9, 1.84, -0.5]), 2);
  }

  // water tank & cannon turret
  P(cyl(0.55, 1.4, 14), STEEL, [0, 2.0, -1.5], { rotation: [0, 0, 90], flat: true });
  glow(P(box(0.9, 0.05, 0.04), "#4dd0ff", [0, 2.0, -0.82]), 2);
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 1.78, -0.5], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.35, 0.14, 12), STEEL, { bone: yaw, at: [0, 1.82, -0.5], flat: true });
  b.part(cyl(0.25, 0.25, 10), NAVY, { bone: yaw, at: [0, 2.0, -0.5], flat: true });
  const pitch = b.joint("cannonPitch", { parent: yaw, at: [0, 2.15, -0.5], dir: [0, 0, 1], role: "hinge" });
  b.part(box(0.4, 0.28, 0.5), STEEL, { bone: pitch, at: [0, 2.15, -0.35] });
  b.rod([0, 2.15, -0.2], [0, 2.18, 1.2], 0.1, STEEL, { bone: pitch, sides: 10 });
  b.rod([0, 2.18, 1.2], [0, 2.18, 1.55], 0.13, DARK, { bone: pitch, sides: 10 });
  glow(b.part(cyl(0.07, 0.03, 10), "#6fe3ff", { bone: pitch, at: [0, 2.18, 1.56], rotation: [90, 0, 0] }), 2.5);
  for (const z of [0.2, 0.6, 1.0]) b.part(cyl(0.125, 0.05, 10), CYAN, { bone: pitch, at: [0, 2.17, z], rotation: [90, 0, 0] });
  for (const s of [1, -1]) b.rod([s * 0.2, 2.1, -0.3], [s * 0.2, 1.88, 0.0], 0.03, DARK, { bone: pitch, sides: 6 });
  // feed hose
  b.sweep(catmull([[0.2, 1.7, -1.5], [0.35, 2.2, -1.0], [0.1, 2.2, -0.6]]), 0.04, TYRE, { bone: chassis, sides: 6 });

  // antennas
  b.spike([-0.85, 1.75, -1.9], [0, 1, 0], 1.0, 0.02, DARK, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: chassis, at: [-0.85, 2.78, -1.9] }), 3);
  // shield racks on rear sides
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      P(box(0.04, 0.5, 0.35), "#2d3a58", [s * 1.02, 1.0 + 0, -2.0 + i * 0.4].map((v, k) => (k === 1 ? 1.35 : v)));
      glow(P(box(0.05, 0.4, 0.04), AMBER, [s * 1.04, 1.35, -1.85 + i * 0.4]), 1.2);
    }
  void R;
  void polyline;
  return b.root;
}
