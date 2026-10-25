import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "hover_pickup",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk with neon trim, roof turret and rear ducted fans.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hoverPickup" });
  const NEON = "#19f2ff";
  const PINK = "#ff2d95";
  const AMBER = "#ffb02e";
  const GLASS = "#0d2a3a";
  const DARK = "#14161d";
  const STEEL = metal("steel", { tarnish: 0.4 });
  const IRON = metal("iron");

  const BODY = paint((p, n) => {
    const base = mix("#3d4a3c", "#566650", noise(p, 0.5, 3));
    const w = smoothstep(0.4, 0.8, noise(p, 0.12, 9)) * 0.35;
    const c = mix(base, "#1b1d1a", w);
    const shade = 0.8 + 0.2 * smoothstep(-0.8, 0.6, n.y);
    return [c[0] * shade, c[1] * shade, c[2] * shade];
  });
  const PANEL = panelled(BODY, { size: 0.5, rivets: 0.06 });

  const chassis = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, col: any, at: number[], o: any = {}) =>
    b.part(g, col, { bone: chassis, at, ...o });

  // hull floor and skid plate
  P(box(1.7, 0.18, 5.2), DARK, [0, 0.72, 0]);
  P(box(1.4, 0.06, 4.6), IRON, [0, 0.6, 0]);
  // cab
  P(box(1.9, 0.6, 1.6), PANEL, [0, 1.1, 0.5]);
  P(box(1.8, 0.1, 1.5), PANEL, [0, 1.75, 0.35]);
  P(box(1.6, 0.4, 1.3), PANEL, [0, 1.15, 1.5]); // hood
  P(box(1.64, 0.08, 1.3), PANEL, [0, 1.38, 1.5]);
  P(box(1.8, 0.5, 0.06), GLASS, [0, 1.52, 1.1], { rotation: [-30, 0, 0] });
  P(box(1.7, 0.4, 0.05), GLASS, [0, 1.52, -0.32]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.4, 1.2), GLASS, [s * 0.96, 1.52, 0.5]);
    P(box(0.08, 0.5, 1.7), PANEL, [s * 0.95, 0.95, 0.6]);
    // side skirt with neon
    P(box(0.12, 0.2, 3.4), IRON, [s * 0.98, 0.78, 0]);
    glow(P(box(0.04, 0.04, 3.2), NEON, [s * 1.05, 0.78, 0]), 1.4);
    // hover pod outboard
    for (const z of [1.55, -1.55]) {
      P(box(0.5, 0.22, 0.9), STEEL, [s * 1.2, 0.8, z]);
      P(cyl(0.34, 0.18, 10), DARK, [s * 1.2, 0.62, z], { flat: true });
      glow(P(cyl(0.26, 0.04, 10), NEON, [s * 1.2, 0.52, z], { flat: true }), 1.8);
      P(new THREE.TorusGeometry(0.34, 0.04, 5, 10), AMBER, [s * 1.2, 0.54, z], { rotation: [90, 0, 0] });
      P(box(0.6, 0.06, 0.12), IRON, [s * 1.0, 0.8, z]);
    }
    // headlight slit
    glow(P(box(0.4, 0.07, 0.04), AMBER, [s * 0.55, 1.2, 2.17]), 1.5);
    // mirror
    P(box(0.05, 0.2, 0.14), DARK, [s * 1.1, 1.55, 1.0]);
    // bed wall
    P(box(0.08, 0.55, 2.4), PANEL, [s * 0.95, 1.1, -1.6]);
    P(box(0.14, 0.05, 2.4), IRON, [s * 0.95, 1.4, -1.6]);
  }
  // front bumper ram
  P(box(2.0, 0.3, 0.2), IRON, [0, 0.85, 2.2]);
  for (let i = -4; i <= 4; i++) P(box(0.1, 0.1, 0.1), AMBER, [i * 0.22, 0.85, 2.33]);
  // grille
  P(box(1.0, 0.3, 0.05), DARK, [0, 1.1, 2.17]);
  for (let i = 0; i < 4; i++) glow(P(box(0.9, 0.02, 0.02), PINK, [0, 1.0 + i * 0.07, 2.2]), 1.2);
  // bed
  P(box(1.9, 0.08, 2.4), DARK, [0, 0.9, -1.6]);
  P(box(1.9, 0.55, 0.08), PANEL, [0, 1.1, -0.4]);
  P(box(1.9, 0.5, 0.08), PANEL, [0, 1.1, -2.8]);
  // rear ducted thrusters
  for (const s of [1, -1]) {
    P(cyl(0.45, 0.8, 12), IRON, [s * 0.62, 1.3, -3.0], { rotation: [90, 0, 0], flat: true });
    P(cyl(0.38, 0.1, 12), DARK, [s * 0.62, 1.3, -3.42], { rotation: [90, 0, 0] });
    glow(P(cyl(0.3, 0.04, 12), NEON, [s * 0.62, 1.3, -3.4], { rotation: [90, 0, 0] }), 2);
    const fan = b.joint(`fan${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 0.62, 1.3, -3.38], dir: [0, 0, -1], role: "hinge" });
    for (let i = 0; i < 6; i++)
      b.part(box(0.05, 0.28, 0.02), STEEL, { bone: fan, at: [s * 0.62, 1.3, -3.36], rotation: [0, 0, i * 60] });
    P(cyl(0.08, 0.1, 8), AMBER, [s * 0.62, 1.3, -3.37], { rotation: [90, 0, 0] });
  }
  // roof turret
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.82, 0.3], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.1, 0.3], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.36, 0.14, 12), IRON, { bone: yaw, at: [0, 1.9, 0.3], flat: true });
  b.part(box(0.5, 0.26, 0.5), PANEL, { bone: yaw, at: [0, 2.05, 0.3] });
  b.part(box(0.3, 0.2, 0.4), DARK, { bone: pitch, at: [0, 2.12, 0.5] });
  for (const s of [1, -1]) {
    b.rod([s * 0.08, 2.12, 0.6], [s * 0.08, 2.12, 1.5], 0.035, STEEL, { bone: pitch, sides: 8 });
    b.part(box(0.1, 0.1, 0.12), IRON, { bone: pitch, at: [s * 0.08, 2.12, 1.5] });
  }
  glow(b.part(box(0.06, 0.04, 0.02), PINK, { bone: pitch, at: [0, 2.16, 0.72] }), 2);
  // roof light bar and antenna
  P(box(1.2, 0.07, 0.12), DARK, [0, 1.84, 0.95]);
  glow(P(box(1.1, 0.03, 0.02), PINK, [0, 1.85, 1.02]), 2);
  b.spike([-0.8, 1.8, -0.2], [0, 1, 0], 1.1, 0.015, STEEL, { bone: chassis, sides: 5 });
  // neon sign decal on tailgate
  const sign = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a0a14"/><path d="M4 26 L16 6 L28 26 M34 6 H58 M34 16 H54 M34 26 H58" stroke="#ff2d95" stroke-width="3" fill="none"/></svg>`,
    { size: 256 },
  );
  glow(P(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", [0, 1.12, -2.86], { dir: [0, 0, -1], axis: "z", texture: sign }), 1.3);
  // spare cells on bed
  const r = rng(5);
  for (let i = 0; i < 4; i++) {
    P(cyl(0.16, 0.5, 8), IRON, [-0.5 + i * 0.33, 1.2, -1.5 + (r() - 0.5) * 0.4], { flat: true });
    glow(P(cyl(0.12, 0.04, 8), NEON, [-0.5 + i * 0.33, 1.46, -1.5], { flat: true }), 1.5);
  }
  // undercarriage glow
  glow(P(box(1.2, 0.03, 3.6), NEON, [0, 0.55, 0]), 1.2);

  return b.root;
}
