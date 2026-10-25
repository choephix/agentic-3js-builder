import * as THREE from "three";
import { createBuilder, frame, rng, svg, paint, noise, smoothstep, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Armoured low-poly cyberpunk hauler guarding a sealed glowing cargo pod, with roof turret and neon.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.8, 0] });

  const HULL = paint((p, n) => {
    const base = mix("#2b3038", "#4a525e", noise(p, 0.3, 3));
    return mix(base, "#6d7684", smoothstep(0.6, 1, n.y) * 0.4);
  });
  const DARK = "#14161b", STEEL = "#7a8392", NEON = "#19f0ff", PINK = "#ff2d95", AMBER = "#ffb02e", GLASS = "#2fd8e8";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });

  // frame rails and floor
  P(box(1.7, 0.25, 5.4), DARK, [0, 0.62, 0]);
  // wheels with spin joints
  const wheelX = 1.0;
  for (const s of [1, -1])
    for (const z of [-1.9, -0.6, 1.7]) {
      const j = b.joint(`wheel${s > 0 ? "L" : "R"}${z}`.replace(".", "_").replace("-", "n"), {
        parent: chassis, at: [s * wheelX, 0.5, z], dir: [s, 0, 0], role: "leg",
      });
      P(cyl(0.5, 0.45, 10), DARK, [s * wheelX, 0.5, z], { bone: j, dir: [1, 0, 0] });
      P(cyl(0.27, 0.5, 8), STEEL, [s * (wheelX + 0.02), 0.5, z], { bone: j, dir: [1, 0, 0] });
      glow(P(new THREE.TorusGeometry(0.34, 0.025, 4, 12), NEON, [s * (wheelX + 0.26), 0.5, z], { bone: j, dir: [1, 0, 0], axis: "z" }), 1.2);
      // fender
      P(box(0.55, 0.12, 1.15), HULL, [s * 1.0, 1.03, z]);
    }

  // armoured cab
  P(box(2.0, 0.9, 1.5), HULL, [0, 1.35, 1.9]);
  P(box(1.9, 0.5, 1.1), HULL, [0, 1.15, 2.95]); // hood
  P(b.extrude ? box(1.8, 0.25, 0.9) : box(1, 1, 1), HULL, [0, 1.5, 2.95], { rotation: [-14, 0, 0] });
  P(box(1.8, 0.4, 0.9), HULL, [0, 1.95, 1.7], { rotation: [-8, 0, 0] }); // roof
  glow(P(box(1.7, 0.3, 0.05), GLASS, [0, 1.75, 2.6], { rotation: [-25, 0, 0] }), 0.8); // windscreen slit
  for (const s of [1, -1]) {
    glow(P(box(0.05, 0.28, 0.7), GLASS, [s * 1.02, 1.7, 1.9]), 0.6);
    glow(P(box(0.35, 0.12, 0.06), AMBER, [s * 0.65, 1.12, 3.52]), 1.6);
    P(box(0.3, 0.3, 0.08), STEEL, [s * 0.4, 1.0, 3.55]);
    P(box(0.4, 0.5, 0.7), DARK, [s * 1.1, 1.05, 3.15]);
  }
  // front ram bumper + grille
  P(box(2.2, 0.35, 0.3), DARK, [0, 0.75, 3.62]);
  for (let i = -4; i <= 4; i++) P(new THREE.ConeGeometry(0.08, 0.25, 4), STEEL, [i * 0.25, 0.62, 3.8], { rotation: [90, 0, 0] });
  for (let i = 0; i < 5; i++) P(box(0.9, 0.04, 0.04), STEEL, [0, 0.95 + i * 0.07, 3.58]);

  // cargo pod cradle
  P(box(2.05, 0.2, 2.9), DARK, [0, 0.85, -1.4]);
  for (const z of [-0.4, -2.4]) for (const s of [1, -1]) P(box(0.15, 0.7, 0.2), STEEL, [s * 0.95, 1.2, z]);
  // sealed pod: capsule with bands
  const POD = paint((p, n) => mix("#d9dde4", "#8a93a3", noise(p, 0.25, 7) * 0.6 + (n.y < 0 ? 0.3 : 0)));
  b.sweep([[0, 1.75, -0.1], [0, 1.75, -2.8]], 0.78, { bone: chassis, color: POD, sides: 10, caps: "round" } as any);
  for (const z of [-0.5, -1.45, -2.4]) {
    P(cyl(0.82, 0.12, 10), DARK, [0, 1.75, z], { dir: [0, 0, 1] });
    glow(P(cyl(0.835, 0.04, 10), PINK, [0, 1.75, z + 0.08], { dir: [0, 0, 1] }), 1.5);
  }
  // pod hazard seal plate with emblem
  const SEAL = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#ff2d95"/><circle cx="32" cy="32" r="22" fill="#111"/><path d="M32 14 L50 46 L14 46Z" fill="none" stroke="#ffb02e" stroke-width="4"/><rect x="30" y="26" width="4" height="12" fill="#ffb02e"/><rect x="30" y="41" width="4" height="4" fill="#ffb02e"/></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: chassis, at: [s * 0.8, 1.8, -1.45], dir: [s, 0, 0], axis: "z", texture: SEAL });

  // side armour plates and neon strips
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) P(box(0.1, 0.4, 0.9), HULL, [s * 1.1, 0.8, -2.4 + i * 1.3 + (i > 1 ? 0.5 : 0)], { rotation: [0, 0, s * 12] });
    glow(P(box(0.05, 0.05, 5.0), s > 0 ? NEON : PINK, [s * 1.0, 0.55, 0]), 1.5);
  }

  // roof turret with yaw / pitch joints
  P(cyl(0.38, 0.12, 10), DARK, [0, 2.2, 1.6]);
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.28, 1.6], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.5, 1.6], dir: [0, 0, 1], role: "hinge" });
  P(box(0.5, 0.3, 0.6), HULL, [0, 2.45, 1.6], { bone: yaw });
  P(box(0.4, 0.22, 0.7), STEEL, [0, 2.5, 1.85], { bone: pitch });
  for (const s of [1, -1]) {
    P(cyl(0.035, 1.1, 6), DARK, [s * 0.1, 2.5, 2.5], { bone: pitch, dir: [0, 0, 1] });
    glow(P(new THREE.SphereGeometry(0.04, 5, 4), NEON, [s * 0.1, 2.5, 3.07], { bone: pitch }), 2);
  }
  // roof light bar and antenna
  glow(P(box(1.4, 0.08, 0.1), AMBER, [0, 2.2, 2.4]), 1.6);
  P(cyl(0.015, 1.0, 4), STEEL, [-0.8, 2.6, 1.0]);
  glow(P(new THREE.SphereGeometry(0.05, 5, 4), PINK, [-0.8, 3.1, 1.0]), 2);
  // exhaust stacks
  for (const s of [1, -1]) P(cyl(0.07, 1.0, 6), STEEL, [s * 1.0, 1.9, 1.1]);
  // tail light bar
  glow(P(box(1.6, 0.1, 0.05), "#ff1a1a", [0, 0.85, -2.85]), 1.6);

  // lift body so wheels touch floor
  chassis.position.y += 0;
  return b.root;
}
