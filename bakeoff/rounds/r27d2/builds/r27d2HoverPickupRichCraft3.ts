import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Pickup",
  description: "Militarized pickup truck converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const body = b.joint("body", { at: [0, 0.7, 0], role: "spine" });
  const R = rng(5);

  const OLIVE = "#4b5a3a", DARK = "#16181f", STEEL = "#6d7480", NEON = "#19f0ff", PINK = "#ff2d9a", AMBER = "#ffb02e";

  const hull = paint((p, n) => {
    const base = mix("#4b5a3a", "#5d6e47", noise(p, 0.3, 2));
    const wear = smoothstep(0.55, 0.8, noise(p, 0.08, 7));
    const c = mix(base, "#2a3020", wear * 0.5);
    return mix(c, "#7c8a66", smoothstep(0.5, 1, n.y) * 0.3);
  });
  const metalP = paint((p) => mix("#555c68", "#8a919c", noise(p, 0.05, 3)));

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, rotation: rot });

  // chassis
  box(1.9, 0.18, 4.3, DARK, [0, 0.0, 0]);
  box(1.8, 0.4, 4.2, hull, [0, 0.3, 0]);
  // hood
  b.frustumBox([0, 0.55, 1.1], [0, 0.62, 2.1], [1.75, 0.35], [1.6, 0.25], { bone: body, color: hull });
  // cab
  b.frustumBox([0, 0.85, 0.1], [0, 0.9, 1.1], [1.75, 0.85], [1.65, 0.7], { bone: body, color: hull });
  // roof
  box(1.6, 0.1, 1.0, hull, [0, 1.3, 0.55]);
  // windshield & windows
  b.part(new THREE.BoxGeometry(1.5, 0.5, 0.05), "#0b2a3a", { bone: body, at: [0, 1.02, 1.12], rotation: [-25, 0, 0] });
  for (const s of [1, -1]) box(0.05, 0.4, 0.8, "#0b2a3a", [s * 0.88, 1.03, 0.6]);
  // bed
  box(1.8, 0.1, 1.9, DARK, [0, 0.52, -1.35]);
  for (const s of [1, -1]) box(0.1, 0.4, 1.9, hull, [s * 0.9, 0.72, -1.35]);
  box(1.8, 0.4, 0.1, hull, [0, 0.72, -2.3]);
  box(1.8, 0.45, 0.1, hull, [0, 0.75, -0.4]);
  // armor plates
  for (const s of [1, -1]) {
    box(0.08, 0.35, 1.4, metalP, [s * 0.94, 0.35, 0.3], [0, 0, 0]);
    box(0.06, 0.2, 1.2, STEEL, [s * 0.95, 0.65, -1.35]);
  }
  // bull bar
  box(1.7, 0.12, 0.15, STEEL, [0, 0.35, 2.3]);
  for (const s of [1, -1]) box(0.1, 0.5, 0.12, STEEL, [s * 0.6, 0.45, 2.25]);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.35, 0.12, 0.05, AMBER, [s * 0.6, 0.62, 2.12]), 1.6);
    glow(box(0.5, 0.04, 0.05, NEON, [s * 0.55, 0.45, 2.3]), 1.5);
    glow(box(0.2, 0.08, 0.05, "#ff2020", [s * 0.7, 0.75, -2.36]), 1.5);
  }
  // roof turret and gun
  box(0.5, 0.18, 0.5, DARK, [0, 1.45, 0.4]);
  box(0.35, 0.22, 0.4, hull, [0, 1.65, 0.4]);
  b.rod([0, 1.67, 0.6], [0, 1.67, 1.6], 0.05, STEEL, { bone: body });
  b.rod([0.1, 1.67, 0.6], [0.1, 1.67, 1.3], 0.035, DARK, { bone: body });
  // roof light bar
  glow(box(1.2, 0.07, 0.12, PINK, [0, 1.38, 0.95]), 1.6);
  // antenna
  b.rod([-0.7, 1.35, 0.1], [-0.8, 2.1, -0.1], 0.015, DARK, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: body, at: [-0.8, 2.12, -0.1] }), 2);
  // rear rockets
  for (const s of [1, -1]) {
    b.rod([s * 0.45, 0.85, -1.9], [s * 0.45, 0.85, -2.5], 0.1, DARK, { bone: body });
    glow(b.part(new THREE.CircleGeometry(0.08, 8), NEON, { bone: body, at: [s * 0.45, 0.85, -2.51], dir: [0, 0, -1], axis: "z" }), 1.5);
  }
  // neon underglow strips
  for (const s of [1, -1]) glow(box(0.06, 0.05, 3.6, NEON, [s * 0.93, 0.12, 0]), 1.6);

  // decal: emblem on doors
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#19f0ff" stroke-width="5"/><path d="M32 12 L44 46 L32 38 L20 46Z" fill="#ff2d9a"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: body, at: [s * 0.955, 0.6, 0.0], dir: [s, 0, 0], axis: "z", texture: emblem }), 1.2);

  // hover thrusters
  const pods: [number, number][] = [[1.15, 1.5], [-1.15, 1.5], [1.15, -1.5], [-1.15, -1.5]];
  pods.forEach(([x, z], i) => {
    const id = `pod${i}`;
    const j = b.joint(id, { parent: body, at: [x, 0.35, z], dir: [0, -1, 0], role: "hinge" });
    b.rod([x * 0.8, 0.35, z], [x, 0.35, z], 0.07, STEEL, { bone: j });
    b.part(new THREE.CylinderGeometry(0.4, 0.34, 0.3, 8), metalP, { bone: j, at: [x, 0.3, z] });
    b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.06, 8), DARK, { bone: j, at: [x, 0.16, z] });
    glow(b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 8), NEON, { bone: j, at: [x, 0.12, z] }), 2);
    glow(b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 8), PINK, { bone: j, at: [x, 0.46, z], rotation: [90, 0, 0] }), 1.6);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      box(0.06, 0.2, 0.06, STEEL, [x + Math.cos(a) * 0.3, 0.45, z + Math.sin(a) * 0.3]);
    }
  });

  // floor-clearing tiny details: hex panel bolts
  for (let i = 0; i < 10; i++) {
    const s = R() > 0.5 ? 1 : -1;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL, {
      bone: body, at: [s * 0.96, 0.3 + R() * 0.3, -0.5 + R() * 2], dir: [s, 0, 0],
    });
  }

  // lift whole truck so pods rest at y=0
  body.object.position.y += 0.0;
  return b.root;
}
