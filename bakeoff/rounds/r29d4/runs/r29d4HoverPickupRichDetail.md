```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to run on four hover thrusters: low-poly cyberpunk, with a turret, rocket pods, neon underglow and decals.",
};

const DARK = "#15171f";
const GUN = "#2a2e38";
const ARMOR = "#3b4332";
const TRIM = "#8a8f99";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb020";
const RED = "#ff2030";
const GLASS = "#0c3a4a";
const BONEW = "#d9dccf";

// Olive camo hull with a cool underside tint, magenta-lit rust at the bottom edges.
const HULL = paint((p, n) => {
  const a = noise(p, 0.55, 3);
  const c1: [number, number, number] = [0.22, 0.27, 0.19];
  const c2: [number, number, number] = [0.13, 0.17, 0.14];
  let c = mix(c1, c2, smoothstep(0.4, 0.6, a));
  const wear = smoothstep(0.62, 0.8, noise(p, 0.12, 9));
  c = mix(c, [0.45, 0.42, 0.34], wear * 0.35);
  c = mix(c, [0.55, 0.1, 0.55], smoothstep(1.0, 0.55, p.y) * 0.35);
  const l = 0.8 + 0.2 * smoothstep(-0.5, 0.9, n.y);
  return [c[0] * l, c[1] * l, c[2] * l];
});

const DOOR = svg(
  `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="6" fill="#0b0d14" stroke="${CYAN}" stroke-width="3"/>
  <text x="64" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="${MAG}" stroke="#000" stroke-width="1">K-07</text>
  <path d="M8 10 L40 10 M88 54 L120 54" stroke="${AMBER}" stroke-width="3"/></svg>`,
  { size: 256 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#111"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 16 - 8} 32 L${i * 16 + 4} 0 L${i * 16 + 14} 0 L${i * 16 + 2} 32Z" fill="${AMBER}"/>`).join("")}</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="#0b0d14" stroke="${CYAN}" stroke-width="3"/>
  <circle cx="32" cy="30" r="12" fill="none" stroke="${MAG}" stroke-width="4"/><path d="M32 8 V52 M12 30 H52" stroke="${MAG}" stroke-width="2.5"/>
  <circle cx="32" cy="30" r="4" fill="${AMBER}"/></svg>`,
  { size: 128 },
);
const NEON = svg(
  `<svg viewBox="0 0 128 48"><text x="64" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="${CYAN}" stroke="${CYAN}" stroke-width="1">凶 HOVR</text></svg>`,
  { size: 256 },
);
const FAN = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#06121a"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M32 32 L${32 + 28 * Math.cos(((a - 15) * Math.PI) / 180)} ${32 + 28 * Math.sin(((a - 15) * Math.PI) / 180)} L${32 + 28 * Math.cos(((a + 20) * Math.PI) / 180)} ${32 + 28 * Math.sin(((a + 20) * Math.PI) / 180)}Z" fill="${CYAN}"/>`).join("")}
  <circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  type V = [number, number, number];

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: any, x: number, y: number, z: number, rot?: V, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot, flat: true });
  const gbox = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, k = 1.5, rot?: V) =>
    glow(box(w, h, d, c, x, y, z, rot), k);
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
  const bolts = (pts: V[], r = 0.02, c = TRIM) =>
    pts.forEach((p) => b.part(new THREE.SphereGeometry(r, 5, 3), c, { at: p }));

  // ---- chassis / undertray
  box(1.8, 0.3, 5.1, DARK, 0, 0.72, 0);
  box(1.5, 0.12, 4.6, GUN, 0, 0.52, 0);
  for (const s of [1, -1]) {
    gbox(0.05, 0.05, 4.4, CYAN, s * 0.78, 0.44, 0, 2); // underglow strips
    box(0.2, 0.16, 4.2, GUN, s * 0.9, 0.9, 0); // rocker
  }
  gbox(1.3, 0.04, 0.05, MAG, 0, 0.45, 2.3, 2);
  gbox(1.3, 0.04, 0.05, MAG, 0, 0.45, -2.3, 2);

  // ---- main body: lower sills, hood, cab, bed
  b.part(new THREE.BoxGeometry(1.95, 0.5, 5.2), HULL, { at: [0, 1.2, 0] });
  // hood slope
  b.part(new THREE.BoxGeometry(1.85, 0.3, 1.7), HULL, { at: [0, 1.58, 1.75], rotation: [8, 0, 0] });
  box(1.2, 0.08, 0.7, GUN, 0, 1.76, 1.8); // scoop base
  box(1.0, 0.1, 0.5, DARK, 0, 1.8, 1.82);
  for (let i = 0; i < 5; i++) box(0.9, 0.03, 0.05, CYAN, 0, 1.86, 1.62 + i * 0.1);
  decal(EMBLEM, 0.5, 0.5, [0, 1.735, 1.25], [0, 1, 0]);
  // cab
  b.part(new THREE.BoxGeometry(1.85, 0.62, 1.5), HULL, { at: [0, 1.82, 0.2] });
  b.part(new THREE.BoxGeometry(1.7, 0.1, 1.35), ARMOR, { at: [0, 2.2, 0.15] }); // roof plate
  box(1.76, 0.5, 0.06, GLASS, 0, 1.97, 0.97, [-28, 0, 0]); // windshield
  glow(box(1.5, 0.03, 0.03, CYAN, 0, 2.26, 0.9), 1.2);
  box(1.76, 0.4, 0.06, GLASS, 0, 1.97, -0.58); // rear window
  box(1.7, 0.08, 0.04, GUN, 0, 1.78, -0.62);
  for (const s of [1, -1]) {
    box(0.04, 0.38, 1.1, GLASS, s * 0.93, 1.98, 0.28); // side window
    box(0.05, 0.4, 0.06, DARK, s * 0.94, 1.98, 0.28); // B pillar
    box(0.04, 0.5, 0.04, DARK, s * 0.94, 1.8, 0.8); // door seam
    box(0.04, 0.5, 0.04, DARK, s * 0.94, 1.8, -0.4);
    box(0.06, 0.05, 0.2, TRIM, s * 0.96, 1.7, 0.5); // handle
    decal(DOOR, 0.75, 0.38, [s * 0.985, 1.4, 0.2], [s, 0, 0]);
    // armor skirt plates
    box(0.08, 0.35, 1.5, ARMOR, s * 0.99, 1.15, 0.35);
    box(0.08, 0.3, 1.1, ARMOR, s * 0.99, 1.15, 1.8);
    bolts([[s * 1.04, 1.25, 0.0], [s * 1.04, 1.25, 0.7], [s * 1.04, 1.05, 0.0], [s * 1.04, 1.05, 0.7]]);
    // mirror
    box(0.04, 0.04, 0.2, DARK, s * 1.0, 1.95, 0.9);
    box(0.08, 0.2, 0.14, GUN, s * 1.12, 1.95, 0.95);
    gbox(0.01, 0.16, 0.1, CYAN, s * 1.165, 1.95, 0.95, 1.3);
    // fender flares around pods
    box(0.12, 0.1, 1.0, GUN, s * 1.0, 1.5, 1.7);
    // headlights
    gbox(0.4, 0.12, 0.05, "#e8fcff", s * 0.62, 1.4, 2.62, 2.2);
    gbox(0.15, 0.04, 0.05, AMBER, s * 0.9, 1.4, 2.62, 1.6);
    // tail lights
    gbox(0.3, 0.14, 0.05, RED, s * 0.75, 1.35, -2.62, 1.8);
    // stencils on rear bumper
    // side rocket pods in bed
    box(0.4, 0.4, 1.2, GUN, s * 0.68, 1.62, -1.5);
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        cyl(0.07, 0.07, 0.06, DARK, s * 0.68 + (i - 0.5) * 0.18, 1.62 + (j - 0.5) * 0.18, -0.88, [90, 0, 0], 8);
        cyl(0.04, 0.04, 0.03, AMBER, s * 0.68 + (i - 0.5) * 0.18, 1.62 + (j - 0.5) * 0.18, -0.9, [90, 0, 0], 6);
      }
    box(0.3, 0.05, 0.9, ARMOR, s * 0.68, 1.86, -1.5);
    // bed wall
    box(0.1, 0.35, 2.1, HULL, s * 0.93, 1.6, -1.6);
    decal(NEON, 0.9, 0.34, [s * 0.985, 1.62, -1.6], [s, 0, 0]);
    // struts to thrusters
    box(0.5, 0.18, 0.6, GUN, s * 1.15, 0.78, 1.7);
    box(0.5, 0.18, 0.6, GUN, s * 1.15, 0.78, -1.7);
  }
  // bed floor and interior
  box(1.7, 0.08, 2.2, DARK, 0, 1.47, -1.55);
  box(1.8, 0.4, 0.1, HULL, 0, 1.62, -2.6); // tailgate
  decal(HAZARD, 1.6, 0.14, [0, 1.5, -2.655], [0, 0, -1]);
  box(0.06, 0.4, 0.5, DARK, 0.4, 1.7, -0.7);
  // ammo box + jerry cans
  box(0.45, 0.28, 0.3, ARMOR, -0.45, 1.66, -2.2);
  box(0.4, 0.04, 0.26, AMBER, -0.45, 1.81, -2.2);
  for (let i = 0; i < 2; i++) {
    box(0.3, 0.38, 0.14, "#5a6a2a", 0.45, 1.7, -2.3 + i * 0.2);
    box(0.1, 0.05, 0.06, DARK, 0.45, 1.93, -2.3 + i * 0.2);
  }

  // ---- turret on roll bar
  for (const s of [1, -1]) box(0.07, 0.8, 0.07, GUN, s * 0.7, 1.95, -1.0, [-8, 0, 0]);
  box(1.5, 0.07, 0.07, GUN, 0, 2.35, -1.1);
  cyl(0.28, 0.32, 0.12, GUN, 0, 2.42, -1.1, undefined, 10);
  box(0.4, 0.28, 0.5, ARMOR, 0, 2.62, -1.1);
  box(0.46, 0.06, 0.56, GUN, 0, 2.78, -1.1);
  cyl(0.04, 0.04, 1.0, GUN, 0.1, 2.62, -0.5, [90, 0, 0], 6);
  cyl(0.04, 0.04, 1.0, GUN, -0.1, 2.62, -0.5, [90, 0, 0], 6);
  cyl(0.07, 0.07, 0.25, DARK, 0.1, 2.62, -0.05, [90, 0, 0], 8);
  cyl(0.07, 0.07, 0.25, DARK, -0.1, 2.62, -0.05, [90, 0, 0], 8);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0, 2.7, -0.82] }), 2);
  box(0.5, 0.3, 0.04, GLASS, 0, 2.66, -0.83);
  // roof gear
  box(1.4, 0.1, 0.18, GUN, 0, 2.3, 0.6); // light bar
  for (let i = 0; i < 6; i++) gbox(0.17, 0.06, 0.03, i % 2 ? MAG : CYAN, -0.58 + i * 0.23, 2.3, 0.7, 2);
  cyl(0.01, 0.01, 1.0, TRIM, -0.8, 2.75, -0.4, undefined, 4);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 3), RED, { at: [-0.8, 3.25, -0.4] }), 2);
  cyl(0.22, 0.05, 0.1, TRIM, 0.6, 2.32, 0.1, [-30, 0, 20], 10); // dish
  cyl(0.02, 0.02, 0.15, GUN, 0.6, 2.28, 0.1, undefined, 5);

  // ---- bull bar / bumper
  box(1.9, 0.3, 0.25, GUN, 0, 1.0, 2.7);
  decal(HAZARD, 1.5, 0.18, [0, 1.0, 2.83], [0, 0, 1]);
  for (let i = -2; i <= 2; i++) b.spike([i * 0.36, 1.1, 2.8], [0, 0.4, 1], 0.28, 0.05, { color: TRIM });
  box(1.6, 0.08, 0.1, ARMOR, 0, 1.55, 2.62);
  box(0.12, 0.5, 0.12, ARMOR, 0.7, 1.3, 2.75);
  box(0.12, 0.5, 0.12, ARMOR, -0.7, 1.3, 2.75);
  gbox(0.5, 0.05, 0.04, MAG, 0, 0.82, 2.84, 2);
  bolts([[0.8, 1.0, 2.85], [-0.8, 1.0, 2.85], [0.4, 1.0, 2.85], [-0.4, 1.0, 2.85]], 0.025);
  // rear bumper & central rear nozzle
  box(1.9, 0.25, 0.2, GUN, 0, 0.95, -2.62);
  cyl(0.2, 0.26, 0.4, GUN, 0, 1.1, -2.8, [90, 0, 0], 10);
  glow(b.part(new THREE.CircleGeometry(0.18, 10), CYAN, { at: [0, 1.1, -3.01], dir: [0, 0, -1], axis: "z" }), 2.5);
  for (const s of [1, -1]) cyl(0.08, 0.1, 0.3, GUN, s * 0.6, 1.0, -2.8, [90, 0, 0], 8);
  for (const s of [1, -1]) glow(b.part(new THREE.CircleGeometry(0.06, 8), AMBER, { at: [s * 0.6, 1.0, -2.96], dir: [0, 0, -1], axis: "z" }), 2);

  // ---- hover thrusters
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.15;
      const z = sz * 1.7;
      cyl(0.46, 0.4, 0.55, HULL, x, 0.275, z, undefined, 10); // shroud
      cyl(0.48, 0.48, 0.07, GUN, x, 0.58, z, undefined, 10); // top lip
      b.part(new THREE.TorusGeometry(0.43, 0.025, 4, 12), CYAN, { at: [x, 0.5, z], rotation: [90, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.43, 0.025, 4, 12), CYAN, { at: [x, 0.5, z], rotation: [90, 0, 0] }), 2.5);
      glow(b.part(new THREE.CircleGeometry(0.34, 12), "#ffffff", { at: [x, 0.625, z], dir: [0, 1, 0], axis: "z", texture: FAN }), 1.4);
      glow(b.part(new THREE.CircleGeometry(0.34, 10), CYAN, { at: [x, 0.02, z], dir: [0, -1, 0], axis: "z" }), 2.5);
      for (let i = 0; i < 3; i++) box(0.5, 0.04, 0.03, DARK, x, 0.35 + i * 0.07, z + sz * 0.44, undefined); // vents
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2 + Math.PI / 4;
        bolts([[x + Math.cos(a) * 0.45, 0.6, z + Math.sin(a) * 0.45]], 0.025);
      }
      box(0.04, 0.3, 0.04, TRIM, x + sx * 0.0, 0.2, z + sz * 0.47); // fin
    }

  // ---- hull panel lines and rivets
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) bolts([[s * 0.98, 1.42, -2.4 + i * 0.35]], 0.018);
    box(0.02, 0.03, 4.6, DARK, s * 0.985, 1.3, 0);
  }
  for (let i = 0; i < 6; i++) bolts([[-0.75 + i * 0.3, 1.68, 2.58]], 0.02);

  return b.root;
}
```