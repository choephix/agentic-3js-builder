```ts
import * as THREE from "three";
import { createBuilder, svg, paint, mottle, polyline } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description: "Alien (1979) style spaceship galley: grimy panelled bulkhead, steel counter, stove, hood, overhead lockers, bolted mess table, wall monitor, pipes and a cold locker.",
};

const BEIGE = "#c9c1aa", GREY = "#7d8083", DARK = "#26282b", ORANGE = "#d9742a", AMBER = "#ffb24a";
const GREEN = "#6dff9a", YELLOW = "#e0b92a", CREAM = "#e8e2cf", RED = "#b3342a", PIPE = "#9a9588";

const WALL = panelled(mottle("#cdc5ae", "#a39a82", { size: 0.25, seed: 3 }), { size: 0.5, aspect: 0.8, rivets: 0.06 });
const STEEL = panelled(metal("steel", { tarnish: 0.35 }), { size: 0.6, rivets: 0 });
const IRON = metal("iron");
const LOCKER = panelled(mottle("#d6cfba", "#b5ac92", { size: 0.2, seed: 8 }), { size: 0.45, rivets: 0.05 });
const FLOOR = paint((p) => {
  const gx = Math.abs(((p.x * 4) % 1 + 1) % 1 - 0.5), gz = Math.abs(((p.z * 4) % 1 + 1) % 1 - 0.5);
  return gx > 0.47 || gz > 0.47 ? "#15161a" : (Math.floor(p.x * 4) + Math.floor(p.z * 4)) % 2 ? "#3a3d42" : "#34373c";
});

const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e0b92a"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 16 - 8} 16 l8 -16 h8 l-8 16z" fill="#1a1a1a"/>`).join("")}<rect width="64" height="16" fill="none" stroke="#1a1a1a" stroke-width="2"/></svg>`, { size: 256 });
const SIGN = svg(`<svg viewBox="0 0 120 60"><rect width="120" height="60" rx="4" fill="#d9d2bc" stroke="#222" stroke-width="3"/><text x="60" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#222">GALLEY</text><text x="60" y="44" text-anchor="middle" font-family="monospace" font-size="9" fill="#a33">NOSTROMO 180924609</text><rect x="8" y="50" width="104" height="3" fill="#d9742a"/></svg>`, { size: 256 });
const SCREEN = svg(`<svg viewBox="0 0 80 60"><rect width="80" height="60" fill="#04140a"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="6" y="${8 + i * 8}" width="${20 + ((i * 23) % 44)}" height="3" fill="#6dff9a"/>`).join("")}<text x="6" y="56" font-family="monospace" font-size="6" fill="#6dff9a">MOTHER &gt; _</text></svg>`, { size: 256 });
const LABEL = svg(`<svg viewBox="0 0 60 24"><rect width="60" height="24" fill="#e8e2cf"/><rect width="60" height="6" fill="#d9742a"/><text x="30" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#222">RATIONS</text></svg>`, { size: 128 });
const VENT = svg(`<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#2a2b2e" stroke="#111" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="4" y="${4 + i * 4.3}" width="32" height="2" fill="#0a0a0b"/>`).join("")}</svg>`, { size: 128 });
const NUM = svg(`<svg viewBox="0 0 60 30"><text x="30" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#2a2a2a">C-07</text></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "galley" });
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: any, x: number, y: number, z: number, seg = 10, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], dir });
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir: [0, 0, 1], axis: "z", texture: tex });
  const bolts = (x0: number, y0: number, x1: number, y1: number, z: number) => {
    for (const x of [x0, x1]) for (const y of [y0, y1]) cyl(0.012, 0.012, 0.01, "#55575a", x, y, z, 6, [0, 0, 1]);
  };

  // floor and walls
  b.part(new THREE.BoxGeometry(3.3, 0.04, 2.1), FLOOR, { at: [0, 0.02, 0.1] });
  box(3.1, 2.4, 0.08, WALL, 0, 1.2, -0.84);
  box(0.08, 2.4, 1.6, WALL, -1.55, 1.2, 0.0);
  box(3.3, 0.1, 0.5, DARK, 0, 2.38, -0.6);
  // skirting hazard
  b.part(new THREE.BoxGeometry(3.0, 0.1, 0.01), HAZARD, { at: [0, 0.09, -0.795], texture: HAZARD });
  plane(0.9, 0.45, SIGN, -1.2, 2.05, -0.795 + 0.0);
  plane(0.4, 0.2, NUM, 0.72, 2.1, -0.795);

  // ceiling pipes and lights
  const pipePath = (pts: number[][]) => b.sweep(polyline(pts), 0.04, { color: PIPE, sides: 8, caps: "flat" });
  pipePath([[-1.5, 2.2, -0.74], [1.5, 2.2, -0.74]]);
  pipePath([[-1.5, 2.1, -0.72], [0.3, 2.1, -0.72], [0.3, 1.5, -0.72]]);
  for (let i = 0; i < 6; i++) cyl(0.055, 0.055, 0.03, "#5a5850", -1.2 + i * 0.5, 2.2, -0.74, 8, [1, 0, 0]);
  for (const x of [-0.8, 0.5]) {
    box(0.9, 0.06, 0.2, "#33353a", x, 2.33, 0.3);
    glow(box(0.8, 0.02, 0.14, "#fff4d8", x, 2.29, 0.3), 1.4);
  }

  // base counter
  box(1.8, 0.1, 0.56, DARK, -0.4, 0.05 + 0.02, -0.5);
  box(1.8, 0.8, 0.56, LOCKER, -0.4, 0.5, -0.5);
  box(1.86, 0.045, 0.62, STEEL, -0.4, 0.92, -0.49);
  box(1.86, 0.05, 0.02, ORANGE, -0.4, 0.93, -0.18);
  for (let i = 0; i < 4; i++) {
    const x = -1.08 + i * 0.44;
    box(0.4, 0.68, 0.02, "#bdb49a", x, 0.5, -0.215);
    box(0.34, 0.6, 0.012, "#a39a80", x, 0.5, -0.205);
    box(0.02, 0.2, 0.03, ORANGE, x + 0.15, 0.62, -0.19);
    bolts(x - 0.17, 0.2, x + 0.17, 0.78, -0.2);
  }

  // sink
  box(0.5, 0.02, 0.4, DARK, -1.0, 0.945, -0.5);
  box(0.44, 0.015, 0.34, "#111214", -1.0, 0.955, -0.5);
  cyl(0.018, 0.018, 0.3, "#b8bcc2", -1.0, 1.1, -0.72);
  b.sweep(polyline([[-1.0, 1.24, -0.72], [-1.0, 1.26, -0.6], [-1.0, 1.18, -0.56]]), 0.016, { color: "#b8bcc2", sides: 8 });
  cyl(0.025, 0.025, 0.03, RED, -1.07, 0.97, -0.72, 8);
  cyl(0.025, 0.025, 0.03, "#2a62a8", -0.93, 0.97, -0.72, 8);

  // stove
  box(0.7, 0.03, 0.5, "#1a1b1e", 0.15, 0.96, -0.5);
  for (const [x, z] of [[-0.05, -0.62], [0.35, -0.62], [-0.05, -0.4], [0.35, -0.4]]) {
    cyl(0.08, 0.08, 0.02, DARK, 0.15 + x - 0.15 + 0.0, 0.985, z, 12);
    glow(cyl(0.06, 0.06, 0.008, "#ff5a1c", x, 0.998, z, 12), 1.2);
  }
  for (let i = 0; i < 4; i++) cyl(0.022, 0.022, 0.03, i % 2 ? AMBER : ORANGE, -0.0 + i * 0.15, 0.97, -0.2, 8, [0, 0, 1]);
  // pots
  const pot = [[0, 0], [0.11, 0], [0.12, 0.14], [0.105, 0.14], [0.1, 0.02], [0, 0.02]] as [number, number][];
  b.lathe(pot, { at: [-0.05, 0.975, -0.62], segments: 12, color: IRON });
  box(0.14, 0.015, 0.03, "#111", -0.2, 1.1, -0.62);
  b.lathe(pot.map(([x, y]) => [x * 1.3, y * 0.6] as [number, number]), { at: [0.35, 0.975, -0.4], segments: 12, color: STEEL });
  box(0.2, 0.015, 0.03, "#111", 0.55, 1.0, -0.4);

  // hood
  b.part(new THREE.CylinderGeometry(0.3, 0.42, 0.28, 4, 1, false), "#8b8d8f", { at: [0.15, 1.55, -0.55], rotation: [0, 45, 0], scale: [1, 1, 0.7], flat: true });
  box(0.3, 0.5, 0.3, "#6b6d70", 0.15, 1.95, -0.62);
  glow(box(0.5, 0.02, 0.2, AMBER, 0.15, 1.4, -0.55), 1.2);

  // overhead lockers
  for (let i = 0; i < 3; i++) {
    const x = -1.1 + i * 0.4;
    box(0.4, 0.55, 0.36, LOCKER, x, 1.78, -0.6);
    box(0.34, 0.46, 0.012, "#bdb49a", x, 1.78, -0.41);
    box(0.03, 0.1, 0.03, ORANGE, x + 0.12, 1.7, -0.4);
    bolts(x - 0.15, 1.58, x + 0.15, 1.98, -0.405);
  }
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.01), LABEL, { at: [-0.7, 1.9, -0.4], texture: LABEL });

  // coffee machine & small items
  box(0.22, 0.34, 0.24, "#3a3d42", -0.5, 1.12, -0.62);
  box(0.24, 0.05, 0.26, ORANGE, -0.5, 1.3, -0.62);
  cyl(0.04, 0.04, 0.05, CREAM, -0.5, 1.0, -0.5, 10);
  glow(box(0.04, 0.02, 0.01, GREEN, -0.43, 1.2, -0.495), 1.5);
  for (let i = 0; i < 3; i++) cyl(0.04, 0.035, 0.09, CREAM, -0.3 + i * 0.001, 0.99 + i * 0.09, -0.7, 10);
  box(0.3, 0.012, 0.2, "#6b6d70", -0.3, 1.2, -0.7);

  // wall monitor
  box(0.34, 0.28, 0.12, "#2a2b2e", 0.68, 1.5, -0.74);
  b.part(new THREE.PlaneGeometry(0.28, 0.21), "#ffffff", { at: [0.68, 1.51, -0.678], dir: [0, 0, 1], axis: "z", texture: SCREEN });
  glow(b.part(new THREE.PlaneGeometry(0.28, 0.21), "#ffffff", { at: [0.68, 1.51, -0.677], dir: [0, 0, 1], axis: "z", texture: SCREEN }), 1.2);
  box(0.04, 0.12, 0.04, "#444", 0.68, 1.3, -0.77);
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.01), VENT, { at: [0.72, 0.5, -0.795], texture: VENT });

  // cold locker
  box(0.62, 1.95, 0.56, LOCKER, 1.2, 0.975 + 0.02, -0.5);
  box(0.56, 0.9, 0.02, "#bdb49a", 1.2, 1.4, -0.215);
  box(0.56, 0.9, 0.02, "#bdb49a", 1.2, 0.5, -0.215);
  b.part(new THREE.BoxGeometry(0.5, 0.12, 0.01), HAZARD, { at: [1.2, 1.78, -0.2], texture: HAZARD });
  for (const y of [1.3, 0.7]) box(0.03, 0.3, 0.04, ORANGE, 1.42, y, -0.19);
  glow(box(0.04, 0.04, 0.01, RED, 1.0, 1.0, -0.2), 1.5);
  glow(box(0.04, 0.04, 0.01, GREEN, 1.07, 1.0, -0.2), 1.5);
  box(0.62, 0.04, 0.56, DARK, 1.2, 1.98, -0.5);

  // mess table bolted to floor
  box(1.5, 0.05, 0.75, STEEL, 0.3, 0.76, 0.7);
  box(1.54, 0.025, 0.79, DARK, 0.3, 0.73, 0.7);
  for (const x of [-0.25, 0.85]) {
    cyl(0.05, 0.05, 0.7, GREY, x, 0.38, 0.7, 10);
    cyl(0.16, 0.18, 0.04, DARK, x, 0.06, 0.7, 12);
    for (let k = 0; k < 4; k++) cyl(0.012, 0.012, 0.012, "#777", x + Math.cos(k * 1.57) * 0.13, 0.085, 0.7 + Math.sin(k * 1.57) * 0.13, 6);
  }
  for (const z of [0.2, 1.2]) {
    box(1.4, 0.1, 0.3, ORANGE, 0.3, 0.45, z);
    box(1.4, 0.03, 0.3, "#8a4a1e", 0.3, 0.4, z);
    for (const x of [-0.3, 0.9]) box(0.06, 0.4, 0.28, DARK, x, 0.22, z);
  }
  // table items
  box(0.4, 0.02, 0.28, "#aeb2b6", 0.1, 0.795, 0.7);
  box(0.38, 0.02, 0.26, "#3a3d42", 0.1, 0.81, 0.7);
  for (const [x, z] of [[0.55, 0.55], [0.7, 0.8], [0.55, 0.9]]) {
    cyl(0.04, 0.035, 0.09, CREAM, x, 0.845, z, 10);
    box(0.02, 0.05, 0.01, CREAM, x + 0.05, 0.845, z);
  }
  b.lathe([[0, 0], [0.07, 0], [0.1, 0.05], [0.09, 0.05], [0.06, 0.012], [0, 0.012]], { at: [0.3, 0.785, 0.9], segments: 12, color: "#c9ccd0" });
  b.lathe([[0, 0], [0.06, 0], [0.07, 0.04], [0.06, 0.04], [0, 0.01]], { at: [0.75, 0.785, 0.55], segments: 10, color: RED });
  cyl(0.03, 0.03, 0.22, "#b8bcc2", 0.95, 0.9, 0.5, 8);
  cyl(0.032, 0.032, 0.03, ORANGE, 0.95, 1.0, 0.5, 8);

  return b.root;
}
```