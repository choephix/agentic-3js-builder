```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler Aegis-7",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler: slab-plated cab, roof turret, neon trim, and a sealed glowing cargo pod on a cradle.",
};

const NEON = "#2ff0ff";
const PINK = "#ff2fb0";
const AMBER = "#ffb62a";
const DARK = "#14161f";
const STEEL = "#59607a";
const TYRE = "#1b1c22";
const GLASS = "#0c1a2a";

const HULL = paint((p, n) => {
  const base = mix("#3a4256", "#5a647c", noise(p, 0.5, 3));
  const scuff = smoothstep(0.62, 0.8, noise(p, 0.08, 7));
  const grime = smoothstep(0.7, -0.5, n.y) * 0.5 * (1 - smoothstep(0.2, 1.2, p.y));
  let c = mix(base, "#9aa3ba", scuff * 0.5);
  c = mix(c, "#101118", grime);
  return mix(c, "#7f8ba8", smoothstep(0.6, 1, n.y) * 0.25);
});
const POD = paint((p, n) => {
  const seam = Math.abs(((p.z * 1.4) % 1) - 0.5) < 0.012 ? 0.5 : 0;
  const c = mix("#e8ecf2", "#9aa3b6", noise(p, 0.3, 5) * 0.6 + smoothstep(0.5, -0.8, n.y) * 0.4);
  return mix(c, "#222", seam);
});

const HAZARD = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#ffc21a"/>${[-32, -16, 0, 16, 32, 48]
    .map((x) => `<polygon points="${x},32 ${x + 8},32 ${x + 24},0 ${x + 16},0" fill="#15151a"/>`)
    .join("")}<rect width="64" height="32" fill="none" stroke="#15151a" stroke-width="3"/></svg>`,
  { size: 128 },
);
const VISOR = svg(
  `<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="#07131f"/><rect x="3" y="3" width="94" height="24" fill="#0e3550"/>
  <path d="M5 8H95M5 14H70M5 20H85" stroke="#2ff0ff" stroke-width="2.4" opacity=".8"/><rect x="72" y="10" width="22" height="3" fill="#ff2fb0"/>
  <path d="M0 0L30 0L10 30L0 30Z" fill="#ffffff" opacity=".12"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#10121a" stroke="#2ff0ff" stroke-width="5"/>
  <path d="M50 14L80 30V56C80 72 65 82 50 88C35 82 20 72 20 56V30Z" fill="none" stroke="#ff2fb0" stroke-width="5"/>
  <path d="M50 28V72M34 46H66" stroke="#2ff0ff" stroke-width="6"/><circle cx="50" cy="46" r="7" fill="#ffb62a"/>
  <path d="M10 50H0M100 50H90" stroke="#2ff0ff" stroke-width="4"/></svg>`,
  { size: 256 },
);
const GLYPHS = svg(
  `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#0b0d14"/><g fill="none" stroke="#2ff0ff" stroke-width="3">
  <path d="M8 8H24V20H12V32H28M36 8V32M36 8H52M60 8L72 32L84 8M92 8H112M102 8V32"/></g><rect x="4" y="35" width="112" height="3" fill="#ff2fb0"/></svg>`,
  { size: 256 },
);

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.95, 0], role: "spine" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const P = (g: THREE.BufferGeometry, c: any, at: V3, o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });
  const bolt = (at: V3, dir: V3, r = 0.04) => P(cyl(r, 0.04, 6), STEEL, at, { dir });

  // ---- frame
  for (const s of [1, -1]) {
    P(box(0.22, 0.28, 8.4), DARK, [s * 0.75, 0.85, -0.4]);
    P(box(0.06, 0.2, 8.0), STEEL, [s * 0.88, 0.85, -0.4]);
  }
  for (const z of [3.2, 1.2, -0.6, -1.9, -3.2, -4.4]) P(box(1.7, 0.2, 0.2), DARK, [0, 0.82, z]);
  b.rod([0, 0.7, 2.5], [0, 0.7, -3.5], 0.08, STEEL, { bone: chassis, sides: 6 });
  P(box(2.5, 0.12, 8.0), "#23262f", [0, 1.1, -0.3]); // deck

  // ---- wheels
  const axles = [2.45, -1.35, -2.85];
  const R = 0.57;
  for (const s of [1, -1])
    axles.forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const w = b.joint(`wheel${side}${i}`, { parent: chassis, at: [s * 1.3, R, z], dir: [1, 0, 0], role: "hinge" });
      const at: V3 = [s * 1.3, R, z];
      const W = (g: THREE.BufferGeometry, c: any, dx = 0, o: any = {}) =>
        b.part(g, c, { bone: w, at: [at[0] + s * dx, at[1], at[2]], rotation: [0, 0, 90], flat: true, ...o });
      W(cyl(0.5, 0.52, 12), TYRE);
      W(cyl(0.34, 0.54, 12), "#2c303c");
      W(cyl(0.24, 0.1, 10), STEEL, 0.28);
      W(cyl(0.1, 0.14, 8), DARK, 0.33);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        b.part(box(0.5, 0.07, 0.15), TYRE, {
          bone: w,
          at: [at[0], at[1] + 0.52 * Math.cos(a), at[2] + 0.52 * Math.sin(a)],
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        b.part(cyl(0.025, 0.05, 6), AMBER, {
          bone: w,
          at: [at[0] + s * 0.3, at[1] + 0.17 * Math.cos(a), at[2] + 0.17 * Math.sin(a)],
          rotation: [0, 0, 90],
        });
      }
      glow(b.part(new THREE.TorusGeometry(0.4, 0.02, 4, 12), NEON, { bone: w, at: [at[0] + s * 0.27, at[1], at[2]], rotation: [0, 90, 0] }), 1.3);
      // fender
      P(box(0.4, 0.1, 1.5), HULL, [s * 1.3, 1.3, z], { flat: true });
      P(box(0.08, 0.4, 1.5), HULL, [s * 1.5, 1.1, z]);
      P(box(0.45, 0.04, 0.3), TYRE, [s * 1.3, 0.85, z - 0.8]); // mud flap
      // leaf spring + axle
      P(box(0.1, 0.05, 1.2), STEEL, [s * 0.9, 0.7, z]);
    });
  for (const z of axles) b.rod([-1.3, R, z], [1.3, R, z], 0.1, DARK, { bone: chassis, sides: 6 });

  // ---- cab
  P(box(2.5, 0.95, 2.2), HULL, [0, 1.62, 1.75], { flat: true });
  P(box(2.3, 0.95, 1.7), HULL, [0, 2.55, 1.45], { flat: true });
  b.frustumBox([0, 1.6, 2.8], [0, 1.45, 3.85], [2.4, 0.9], [2.1, 0.55], { bone: chassis, color: HULL }); // nose
  P(box(2.5, 0.07, 1.4), STEEL, [0, 2.06, 1.7]); // roof lip front
  P(box(2.2, 0.12, 1.8), "#2a2f3d", [0, 3.06, 1.45]); // roof plate
  // windscreen
  glow(b.part(new THREE.PlaneGeometry(2.0, 0.6), "#ffffff", { bone: chassis, at: [0, 2.6, 2.32], dir: [0, 0.35, 1], axis: "z", texture: VISOR }), 0.9);
  P(box(2.2, 0.08, 0.1), DARK, [0, 2.92, 2.32], { rotation: [-20, 0, 0] });
  P(box(2.2, 0.08, 0.1), DARK, [0, 2.28, 2.3], { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) {
    P(box(0.06, 0.35, 1.0), GLASS, [s * 1.17, 2.62, 1.45]); // side window
    glow(P(box(0.02, 0.03, 1.0), NEON, [s * 1.2, 2.82, 1.45]), 1.3);
    P(box(0.12, 0.8, 0.6), HULL, [s * 1.2, 1.7, 2.05], { rotation: [0, 0, s * -12] }); // door armour
    P(box(0.08, 0.04, 1.1), DARK, [s * 1.27, 1.2, 1.7]);
    P(box(0.08, 0.7, 0.04), DARK, [s * 1.27, 1.65, 1.2]); // door seam
    P(box(0.1, 0.1, 0.3), STEEL, [s * 1.3, 1.85, 1.35]); // handle
    P(box(0.12, 0.9, 0.9), HULL, [s * 1.22, 1.85, 2.75], { rotation: [0, s * 15, 0] }); // fender plate
    for (const [dy, dz] of [[2.1, 2.5], [1.6, 3.0], [1.6, 2.5], [2.1, 3.0]]) bolt([s * 1.29, dy - 0.2, dz - 0.1], [s, 0, 0]);
    // mirror
    b.rod([s * 1.3, 2.6, 2.1], [s * 1.7, 2.7, 2.4], 0.03, STEEL, { bone: chassis, sides: 5 });
    P(box(0.08, 0.35, 0.2), DARK, [s * 1.72, 2.7, 2.45]);
    glow(P(box(0.02, 0.28, 0.14), PINK, [s * 1.68, 2.7, 2.45]), 1.2);
    // headlights
    glow(P(box(0.5, 0.12, 0.08), "#f6fbff", [s * 0.75, 1.55, 3.75]), 1.5);
    glow(P(box(0.3, 0.08, 0.06), AMBER, [s * 1.1, 1.8, 2.0], { dir: [0, 0, 1] }), 1.2);
    // exhaust stacks
    b.rod([s * 1.1, 1.3, 0.55], [s * 1.1, 3.4, 0.55], 0.1, STEEL, { bone: chassis, sides: 6 });
    P(cyl(0.14, 0.4, 6), DARK, [s * 1.1, 2.0, 0.55]);
    P(cyl(0.14, 0.06, 6), DARK, [s * 1.1, 3.4, 0.55]);
    glow(P(cyl(0.07, 0.03, 6), AMBER, [s * 1.1, 3.43, 0.55]), 1.2);
  }
  // grille & ram bumper
  P(box(1.6, 0.5, 0.1), DARK, [0, 1.5, 3.9]);
  for (let i = 0; i < 6; i++) glow(P(box(1.5, 0.03, 0.04), i % 2 ? PINK : NEON, [0, 1.3 + i * 0.08, 3.95]), 1.1);
  P(box(2.7, 0.4, 0.4), "#2a2f3d", [0, 0.9, 3.8], { flat: true });
  for (let i = 0; i < 7; i++) b.spike([-1.2 + i * 0.4, 0.85, 4.0], [0, 0, 1], 0.28, 0.07, STEEL, { bone: chassis, sides: 4 });
  b.part(new THREE.PlaneGeometry(2.6, 0.22), "#ffffff", { bone: chassis, at: [0, 1.05, 4.01], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  // hood vents
  for (let i = 0; i < 4; i++) P(box(0.9, 0.03, 0.08), DARK, [0, 1.9 - i * 0.02, 3.0 + i * 0.18]);

  // ---- roof gear: light bar, antennas, turret
  P(box(1.8, 0.1, 0.2), DARK, [0, 3.2, 1.95]);
  for (let i = 0; i < 6; i++) glow(P(box(0.26, 0.08, 0.08), i % 2 ? PINK : NEON, [-0.72 + i * 0.288, 3.22, 2.06]), 1.6);
  b.spike([-0.9, 3.12, 0.8], [0, 1, 0], 1.4, 0.03, STEEL, { bone: chassis, sides: 5 });
  glow(P(new THREE.SphereGeometry(0.05, 6, 4), PINK, [-0.9, 4.5, 0.8]), 1.6);
  b.spike([0.9, 3.12, 0.8], [0, 1, 0.1], 0.9, 0.025, STEEL, { bone: chassis, sides: 5 });
  P(new THREE.SphereGeometry(0.25, 8, 4, 0, 6.28, 0, 1.57), STEEL, [0.9, 3.12, 1.6], { flat: true }); // sensor dome
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.15, 0.95], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.38, 0.12, 10), STEEL, { bone: chassis, at: [0, 3.17, 0.95], flat: true });
  b.part(cyl(0.3, 0.25, 8), HULL, { bone: yaw, at: [0, 3.35, 0.95], flat: true });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.5, 0.95], dir: [0, 0, 1], role: "hinge" });
  b.part(box(0.5, 0.3, 0.5), HULL, { bone: pitch, at: [0, 3.55, 1.1], flat: true });
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 3.55, 1.3], [s * 0.13, 3.55, 2.2], 0.05, DARK, { bone: pitch, sides: 6 });
    b.part(cyl(0.08, 0.15, 6), STEEL, { bone: pitch, at: [s * 0.13, 3.55, 2.2], rotation: [90, 0, 0] });
    b.part(box(0.2, 0.2, 0.3), "#2a2f3d", { bone: pitch, at: [s * 0.4, 3.5, 0.95] });
  }
  glow(b.part(box(0.2, 0.06, 0.03), PINK, { bone: pitch, at: [0, 3.62, 1.36] }), 1.5);

  // ---- cargo pod and cradle
  const podZ0 = -4.65;
  const podC = 2.2;
  for (const z of [-4.1, -2.5, -0.9]) {
    P(box(2.3, 0.35, 0.3), "#2a2f3d", [0, 1.28, z]);
    for (const s of [1, -1]) {
      P(box(0.14, 1.0, 0.3), HULL, [s * 1.02, 1.7, z], { rotation: [0, 0, s * 25] });
      P(box(0.22, 0.08, 0.34), STEEL, [s * 1.15, 2.12, z]);
    }
  }
  const pod = b.lathe(
    [[0, 0], [0.65, 0], [0.98, 0.35], [1.04, 0.8], [1.04, 3.2], [0.98, 3.65], [0.65, 4.0], [0, 4.0]],
    { at: [0, podC, podZ0], axis: [0, 0, 1], segments: 10, bone: chassis, color: POD },
  );
  const ringZ = [0.8, 1.6, 2.4, 3.2];
  for (const k of ringZ) {
    const z = podZ0 + k;
    P(new THREE.TorusGeometry(1.07, 0.07, 4, 10), "#222633", [0, podC, z], { flat: true });
    glow(P(new THREE.TorusGeometry(1.1, 0.025, 4, 10), NEON, [0, podC, z + 0.08]), 1.4);
  }
  for (const k of [1.2, 2.8]) { // latches
    for (const s of [1, -1]) {
      P(box(0.14, 0.22, 0.34), STEEL, [s * 1.08, podC + 0.3, podZ0 + k]);
      glow(P(box(0.03, 0.05, 0.1), AMBER, [s * 1.16, podC + 0.3, podZ0 + k]), 1.4);
    }
  }
  // top hatch & seal
  P(cyl(0.4, 0.1, 8), "#2a2f3d", [0, podC + 1.02, podZ0 + 2.0], { flat: true });
  glow(P(new THREE.TorusGeometry(0.3, 0.03, 4, 8), PINK, [0, podC + 1.08, podZ0 + 2.0], { rotation: [90, 0, 0] }), 1.4);
  P(box(0.1, 0.1, 0.5), STEEL, [0, podC + 1.1, podZ0 + 2.0]);
  // pod end caps: seal light and vent
  glow(P(cyl(0.25, 0.04, 8), PINK, [0, podC, podZ0 - 0.02], { rotation: [90, 0, 0] }), 1.5);
  for (const s of [1, -1]) {
    P(box(0.5, 0.35, 0.2), DARK, [s * 0.8, 1.55, podZ0 - 0.05]);
    glow(P(box(0.4, 0.05, 0.03), s > 0 ? "#ff3030" : "#ff3030", [s * 0.8, 1.55, podZ0 - 0.17]), 1.5);
    b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { bone: chassis, at: [s * 0.8, 1.9, podZ0 - 0.1], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  }
  // emblem decals and label
  for (const s of [1, -1]) {
    b.decal(pod, EMBLEM, { at: [s * 1.04, podC, podZ0 + 2.0], dir: [s, 0, 0], size: [1.3, 1.3], mirror: s < 0 });
    b.decal(pod, GLYPHS, { at: [s * 1.0, podC - 0.75, podZ0 + 2.0], dir: [s * 0.8, -0.5, 0], size: [1.4, 0.45], mirror: s < 0 });
  }
  // pod hoses & cable
  b.sweep(
    [[0.3, podC + 1.0, -1.0], [0.3, 3.45, -0.5], [0.4, 3.4, 0.3], [0.5, 3.15, 0.9]] as V3[],
    0.04, DARK, { bone: chassis, sides: 5 },
  );

  // ---- armour skirts, side plates, underglow, rear
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.3 - i * 1.0 - (i > 1 ? 0.3 : 0);
      P(box(0.08, 0.5, 0.9), HULL, [s * 1.38, 0.95, z]);
      bolt([s * 1.43, 1.1, z + 0.3], [s, 0, 0]);
      bolt([s * 1.43, 1.1, z - 0.3], [s, 0, 0]);
    }
    b.part(new THREE.PlaneGeometry(0.9, 0.2), "#ffffff", { bone: chassis, at: [s * 1.43, 0.85, -1.4], dir: [s, 0, 0], axis: "z", texture: HAZARD });
    glow(b.rod([s * 1.0, 0.62, 3.2], [s * 1.0, 0.62, -4.5], 0.03, NEON, { bone: chassis, sides: 4 }), 1.5);
    glow(P(box(0.5, 0.18, 0.06), "#ff2020", [s * 0.9, 1.0, -4.82]), 1.6); // tail light
  }
  P(box(2.5, 0.3, 0.2), "#2a2f3d", [0, 0.95, -4.7], { flat: true });
  P(box(2.2, 0.06, 0.1), PINK, [0, 1.12, -4.82]);
  glow(P(box(1.0, 0.06, 0.04), PINK, [0, 1.12, -4.88]), 1.5);
  b.part(new THREE.PlaneGeometry(1.0, 0.33), "#ffffff", { bone: chassis, at: [0, 0.9, -4.82], dir: [0, 0, -1], axis: "z", texture: GLYPHS });
  // fuel tank & battery boxes under deck
  for (const s of [1, -1]) {
    P(cyl(0.28, 1.4, 8), STEEL, [s * 0.95, 0.55, -0.1], { rotation: [90, 0, 0], flat: true });
    P(box(0.3, 0.3, 0.7), DARK, [s * 0.95, 0.62, -3.6]);
    glow(P(box(0.2, 0.04, 0.4), NEON, [s * 0.95, 0.78, -3.6]), 1.2);
  }
  // step & grab rail
  for (const s of [1, -1]) b.rod([s * 1.35, 1.0, 1.0], [s * 1.35, 2.2, 1.0], 0.03, AMBER, { bone: chassis, sides: 5 });

  return b.root;
}
```