```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, mottle, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "KX-7 Suppressor",
  description:
    "Kandrax corporate riot-control interceptor: six-wheel armoured hull, roof water cannon with tanks, hazard ram bumper and neon light bars, in a Cyberpunk 2077 style.",
};

type V = [number, number, number];

// ---------- palette ----------
const DARK = "#0d0f15";
const STEEL = "#6c7588";
const YEL = "#f2d20a";
const CYAN = "#19f0ff";
const MAG = "#ff2a8a";
const GLASS = "#0f3646";
const WHITE = "#e8ecf2";

// ---------- paints ----------
const HULL = paint((p, n) => {
  let c = mix("#1a2030", "#2b3550", noise(p, 0.5, 1));
  const ax = Math.abs(n.x);
  const az = Math.abs(n.z);
  const u = ax > az ? p.z : p.x;
  const fu = u / 0.7 - Math.floor(u / 0.7);
  const fv = p.y / 0.5 - Math.floor(p.y / 0.5);
  const seam = Math.min(fu * 0.7, (1 - fu) * 0.7, fv * 0.5, (1 - fv) * 0.5);
  if (seam < 0.004) c = mix(c, "#06070b", 0.85);
  else if (seam < 0.009) c = mix(c, "#5a6a8c", 0.25);
  c = mix(c, "#4a5878", smoothstep(0.6, 1, n.y) * 0.3);
  if (Math.abs(n.y) < 0.5 && p.y > 0.7 && p.y < 0.78) c = mix(c, YEL, 0.9);
  c = mix(c, "#2b2620", smoothstep(1.0, 0.55, p.y) * 0.6 * smoothstep(0.3, 0.7, noise(p, 0.2, 5)));
  return c;
});
const HAZ = paint((p) => {
  const u = (p.x + p.y * 1.4) / 0.28;
  const f = u - Math.floor(u);
  const c = f < 0.5 ? YEL : "#15161b";
  return mix(c, "#0a0a0c", smoothstep(0.55, 0.9, noise(p, 0.15, 3)) * 0.5);
});
const STEELP = paint((p) => mix("#434d62", "#8c97ae", noise(p, 0.12, 2)));
const TANK = paint((p, n) => mix(mix("#14323f", "#1f5668", noise(p, 0.3, 7)), "#3b8aa0", smoothstep(0.7, 1, n.y) * 0.4));
const TYRE = mottle("#0c0c10", "#1d1d26", { size: 0.1, seed: 4 });

// ---------- textures ----------
const hexPath = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

const LOGO = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="${hexPath(50, 50, 46)}" fill="#0d0f15" stroke="#f2d20a" stroke-width="6"/>
  <polygon points="${hexPath(50, 50, 34)}" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
  <path d="M34 28 H44 V46 L58 28 H70 L52 50 L71 72 H58 L44 54 V72 H34Z" fill="#f2d20a"/>
  <rect x="66" y="26" width="6" height="6" fill="#ff2a8a"/>
</svg>`,
  { size: 256 },
);

const SIDE = svg(
  `<svg viewBox="0 0 400 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="90" fill="none"/>
  <text x="6" y="46" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#0d0f15" stroke="#0d0f15" stroke-width="6">KANDRAX</text>
  <text x="6" y="46" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#f2d20a">KANDRAX</text>
  <text x="8" y="80" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#e8ecf2" letter-spacing="3">RIOT SUPPRESSION UNIT</text>
  <rect x="240" y="12" width="150" height="5" fill="#19f0ff"/>
  <rect x="240" y="22" width="110" height="3" fill="#ff2a8a"/>
  <text x="392" y="60" text-anchor="end" font-family="monospace" font-weight="bold" font-size="30" fill="#19f0ff">RC-07</text>
</svg>`,
  { size: 1024 },
);

const HUD = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 20 V6 H20 M180 6 H194 V20 M194 80 V94 H180 M20 94 H6 V80" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
  <text x="14" y="30" font-family="monospace" font-size="9" fill="#19f0ff">TGT 042 // CROWD DENS 0.8</text>
  <text x="14" y="88" font-family="monospace" font-size="9" fill="#ff2a8a">WATER 82%  PSI 340</text>
  <circle cx="150" cy="55" r="16" fill="none" stroke="#19f0ff" stroke-width="1.5"/>
  <path d="M150 33 V77 M128 55 H172" stroke="#19f0ff" stroke-width="1"/>
  <rect x="14" y="44" width="40" height="3" fill="#f2d20a"/>
</svg>`,
  { size: 512 },
);

const LED = svg(
  `<svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="80" fill="#07080c"/>
  <text x="200" y="38" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="#ff2a8a">DISPERSE NOW</text>
  <text x="200" y="68" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#19f0ff">&gt;&gt; COMPLY OR BE SOAKED &lt;&lt;</text>
  <rect x="0" y="0" width="400" height="4" fill="#f2d20a"/><rect x="0" y="76" width="400" height="4" fill="#f2d20a"/>
</svg>`,
  { size: 768 },
);

const PLATE = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="56" rx="6" fill="#e8ecf2" stroke="#0d0f15" stroke-width="3"/>
  <rect x="2" y="2" width="116" height="14" rx="6" fill="#f2d20a"/>
  <text x="60" y="13" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="10" fill="#0d0f15">KANDRAX CORP</text>
  <text x="60" y="48" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#0d0f15">KX-0451</text>
</svg>`,
  { size: 256 },
);

const GAUGE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#0d0f15" stroke="#8c97ae" stroke-width="4"/>
  <path d="M20 78 A42 42 0 1 1 80 78" fill="none" stroke="#19f0ff" stroke-width="3" stroke-dasharray="3 5"/>
  <path d="M68 74 A42 42 0 0 0 80 78" fill="none" stroke="#ff2a8a" stroke-width="5"/>
  <path d="M50 50 L68 30" stroke="#f2d20a" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="5" fill="#e8ecf2"/>
  <text x="50" y="84" text-anchor="middle" font-family="monospace" font-size="10" fill="#19f0ff">PSI</text>
</svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at, ...o });
  const ROT = { x: [0, 0, 90], y: [0, 0, 0], z: [90, 0, 0] } as Record<string, V>;
  const cyl = (r: number, h: number, sides: number, color: any, at: V, axis: "x" | "y" | "z" = "y", o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, {
      bone: chassis,
      at,
      rotation: ROT[axis],
      flat: true,
      ...o,
    });
  const rod = (a: V, c: V, r: number, color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const neon = (w: number, h: number, d: number, color: string, at: V, o: any = {}, k = 1.3) =>
    glow(box(w, h, d, color, at, o), k);
  const ring = (r: number, t: number, color: any, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 14), color, { bone: chassis, at, dir, axis: "z", ...o });
  const decal = (tex: any, w: number, h: number, at: V, dir: V, o: any = {}, g = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: chassis,
      at,
      dir,
      axis: "z",
      texture: tex,
      ...o,
    });
    if (g) glow(p, g);
    return p;
  };

  // ---------- hull ----------
  box(1.7, 0.3, 5.4, DARK, [0, 0.65, 0]); // skid plate
  box(2.2, 0.8, 4.7, HULL, [0, 1.0, -0.45]); // lower hull
  box(2.12, 0.7, 3.0, HULL, [0, 1.75, -1.3]); // cargo box
  box(2.2, 0.08, 3.0, HULL, [0, 2.14, -1.3]); // roof
  box(2.2, 0.06, 3.02, DARK, [0, 1.42, -1.3]); // belt line
  b.frustumBox([0, 1.2, 1.9], [0, 1.1, 2.75], [2.15, 0.55], [2.05, 0.4], { bone: chassis, color: HULL }); // hood
  box(2.1, 0.5, 0.1, DARK, [0, 1.05, 2.78]); // fascia
  box(2.2, 0.35, 0.35, HAZ, [0, 0.775, 2.92]); // ram bumper
  box(2.3, 0.06, 0.4, STEEL, [0, 0.97, 2.92]);
  box(2.2, 0.35, 0.3, HAZ, [0, 0.775, -2.98]); // rear bumper
  box(2.0, 0.08, 0.8, DARK, [0, 0.7, -2.1]);

  // cab
  box(2.1, 0.08, 1.0, HULL, [0, 2.1, 0.7]);
  box(1.9, 0.7, 1.0, "#07090d", [0, 1.75, 0.7]); // interior
  for (const s of [1, -1]) {
    box(0.1, 0.7, 0.1, HULL, [s * 1.0, 1.75, 0.2]);
    rod([s * 1.0, 1.4, 1.9], [s * 1.0, 2.1, 1.2], 0.055, HULL);
    box(0.12, 0.28, 1.0, DARK, [s * 1.0, 1.5, 0.7]);
    box(0.3, 0.14, 0.4, "#1c212e", [s * 0.5, 1.6, 0.7]); // headrests
  }
  box(1.95, 1.0, 0.05, GLASS, [0, 1.75, 1.55], { rotation: [-45, 0, 0] }); // windscreen
  decal(HUD, 1.7, 0.85, [0, 1.75 + 0.032, 1.55 + 0.032], [0, 0.707, 0.707], {}, 0.9);
  box(1.95, 0.06, 0.08, DARK, [0, 2.12, 1.2]);
  for (const x of [-0.5, 0.3]) rod([x, 1.45, 1.86], [x + 0.5, 1.9, 1.5], 0.012, DARK, { sides: 4 }); // wipers

  // doors (front)
  for (const s of [1, -1]) {
    const door = b.joint(`door${s > 0 ? "L" : "R"}`, {
      parent: chassis,
      at: [s * 1.1, 1.4, 1.2],
      dir: [0, 1, 0],
      role: "hinge",
    });
    box(0.07, 0.55, 1.0, HULL, [s * 1.13, 1.12, 0.7], { bone: door });
    box(0.05, 0.4, 0.8, GLASS, [s * 1.07, 1.85, 0.7], { bone: door });
    box(0.07, 0.05, 0.9, DARK, [s * 1.1, 2.07, 0.7], { bone: door });
    box(0.07, 0.05, 0.9, DARK, [s * 1.1, 1.64, 0.7], { bone: door });
    for (const z of [0.3, 0.7, 1.1]) rod([s * 1.12, 1.65, z], [s * 1.12, 2.06, z], 0.012, STEEL, { bone: door, sides: 4 });
    box(0.05, 0.05, 0.22, STEEL, [s * 1.18, 1.3, 0.35], { bone: door });
    box(0.075, 0.1, 1.0, HAZ, [s * 1.13, 0.9, 0.7], { bone: door });
    decal(LOGO, 0.42, 0.42, [s * 1.172, 1.14, 0.78], [s, 0, 0], { bone: door });
  }

  // flank text and neon
  for (const s of [1, -1]) {
    decal(SIDE, 2.7, 0.6, [s * 1.07, 1.78, -1.3], [s, 0, 0]);
    neon(0.03, 0.04, 2.8, MAG, [s * 1.11, 1.46, -1.3]);
    neon(0.03, 0.03, 4.4, CYAN, [s * 1.12, 0.92, -0.4]);
    neon(0.06, 0.05, 4.8, CYAN, [s * 0.92, 0.6, 0], {}, 1.6); // underglow
    box(0.06, 0.3, 1.3, HULL, [s * 1.14, 0.8, 0.65]); // skirt
    box(0.06, 0.3, 0.3, HULL, [s * 1.14, 0.8, -1.3]);
    for (const z of [0.2, 0.65, 1.1]) cyl(0.025, 0.04, 6, STEEL, [s * 1.18, 0.82, z], "x");
    // step bars + ladder
    rod([s * 1.2, 0.72, 1.3], [s * 1.2, 0.72, 0.0], 0.04, STEEL);
    // mirrors
    rod([s * 1.08, 1.85, 1.45], [s * 1.4, 1.9, 1.38], 0.02, STEEL);
    box(0.06, 0.3, 0.18, DARK, [s * 1.42, 1.9, 1.35]);
    box(0.03, 0.24, 0.14, GLASS, [s * 1.45, 1.9, 1.35]);
    // spotlights on A-pillars
    cyl(0.07, 0.1, 8, DARK, [s * 1.02, 2.0, 1.4], "z");
    glow(cyl(0.055, 0.02, 8, WHITE, [s * 1.02, 2.0, 1.46], "z"), 1.5);
    // gas launcher banks
    for (let i = 0; i < 3; i++) {
      cyl(0.045, 0.34, 8, STEELP, [s * (0.75 + i * 0.1), 2.27, 0.35], "y", { rotation: [50, 0, 0] });
      cyl(0.03, 0.02, 6, DARK, [s * (0.75 + i * 0.1), 2.4, 0.48], "y", { rotation: [50, 0, 0] });
    }
    box(0.4, 0.06, 0.25, DARK, [s * 0.85, 2.17, 0.32]);
  }

  // front end
  box(0.55, 0.3, 0.04, "#050608", [0, 1.1, 2.835]);
  decal(LOGO, 0.26, 0.26, [0, 1.1, 2.86], [0, 0, 1]);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) neon(0.12, 0.012, 0.03, CYAN, [s * 0.18, 0.99 + i * 0.07, 2.86]);
    box(0.7, 0.22, 0.06, DARK, [s * 0.7, 1.18, 2.77]);
    neon(0.62, 0.07, 0.05, CYAN, [s * 0.7, 1.22, 2.795], {}, 1.6);
    neon(0.62, 0.03, 0.05, MAG, [s * 0.7, 1.13, 2.795]);
    // bull bar
    rod([s * 0.85, 0.95, 3.0], [s * 0.85, 1.5, 2.9], 0.045, YEL);
    rod([s * 0.85, 1.5, 2.9], [s * 0.85, 1.55, 2.4], 0.04, YEL);
    cyl(0.05, 0.12, 6, STEEL, [s * 0.45, 0.62, 3.1], "z"); // tow hook posts
  }
  rod([-0.85, 1.5, 2.9], [0.85, 1.5, 2.9], 0.045, YEL);
  rod([0, 1.0, 3.0], [0, 1.5, 2.9], 0.035, YEL);
  glow(cyl(0.05, 0.05, 8, CYAN, [0, 1.58, 2.9], "z"), 1.4); // lidar puck
  cyl(0.07, 0.08, 8, DARK, [0, 1.56, 2.9], "z");
  decal(PLATE, 0.5, 0.25, [0, 0.74, 3.1], [0, 0, 1]);

  // rear
  for (const s of [1, -1]) {
    const rd = b.joint(`rearDoor${s > 0 ? "L" : "R"}`, {
      parent: chassis,
      at: [s * 1.06, 1.4, -2.84],
      dir: [0, 1, 0],
      role: "hinge",
    });
    box(1.0, 1.1, 0.08, HULL, [s * 0.55, 1.5, -2.88], { bone: rd });
    box(0.5, 0.25, 0.03, GLASS, [s * 0.55, 1.85, -2.93], { bone: rd });
    for (const dx of [-0.15, 0, 0.15]) rod([s * 0.55 + dx, 1.72, -2.95], [s * 0.55 + dx, 1.98, -2.95], 0.012, STEEL, { bone: rd, sides: 4 });
    box(0.98, 0.1, 0.09, HAZ, [s * 0.55, 1.02, -2.89], { bone: rd });
    box(0.05, 0.3, 0.06, STEEL, [s * 0.12, 1.45, -2.95], { bone: rd });
    decal(LOGO, 0.5, 0.5, [s * 0.55, 1.38, -2.93], [0, 0, -1], { bone: rd });
    for (const y of [1.1, 1.9]) cyl(0.03, 0.12, 6, STEEL, [s * 1.05, y, -2.86], "y", { bone: rd });
    neon(0.1, 0.8, 0.06, MAG, [s * 1.1, 1.35, -2.83], {}, 1.6); // tail lights
    neon(0.1, 0.06, 0.06, CYAN, [s * 1.1, 1.82, -2.83]);
  }
  decal(PLATE, 0.5, 0.25, [0, 0.78, -3.135], [0, 0, -1]);
  neon(1.8, 0.03, 0.03, CYAN, [0, 0.62, -3.0]);

  // ---------- wheels ----------
  for (const s of [1, -1])
    for (const z of [1.9, -0.6, -2.0]) {
      const tag = `${z > 1 ? "F" : z > -1 ? "M" : "R"}${s > 0 ? "L" : "R"}`;
      const hx = s * 1.12;
      const hub: V = [hx, 0.55, z];
      const w = b.joint(`wheel${tag}`, { parent: chassis, at: hub, dir: [s, 0, 0], role: "hinge" });
      const o = { bone: w };
      cyl(0.53, 0.42, 14, TYRE, hub, "x", o);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box(0.42, 0.09, 0.17, TYRE, [hx, 0.55 + 0.55 * Math.cos(a), z + 0.55 * Math.sin(a)], {
          bone: w,
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      cyl(0.34, 0.44, 12, "#1c2230", hub, "x", o);
      cyl(0.3, 0.06, 12, STEELP, [hx + s * 0.22, 0.55, z], "x", o);
      b.part(new THREE.TorusGeometry(0.25, 0.022, 5, 16), CYAN, {
        bone: w,
        at: [hx + s * 0.255, 0.55, z],
        rotation: [0, 90, 0],
      });
      glow(b.part(new THREE.TorusGeometry(0.25, 0.022, 5, 16), CYAN, { bone: w, at: [hx + s * 0.26, 0.55, z], rotation: [0, 90, 0] }), 1.5);
      cyl(0.08, 0.1, 6, DARK, [hx + s * 0.27, 0.55, z], "x", o);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cyl(0.022, 0.04, 6, STEEL, [hx + s * 0.255, 0.55 + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)], "x", o);
      }
      // fender arch + mud flap
      box(0.58, 0.07, 1.3, HULL, [hx, 1.2, z]);
      box(0.58, 0.18, 0.06, DARK, [hx, 1.1, z + 0.62]);
      box(0.4, 0.4, 0.04, DARK, [hx, 0.4, z - 0.68]);
      neon(0.5, 0.025, 0.03, YEL, [hx, 1.24, z + 0.66], {}, 1);
    }
  // axles
  for (const z of [1.9, -0.6, -2.0]) cyl(0.07, 1.8, 8, DARK, [0, 0.55, z], "x");

  // ---------- roof: light bar ----------
  box(2.0, 0.12, 0.26, DARK, [0, 2.22, 0.95]);
  box(2.04, 0.04, 0.3, STEEL, [0, 2.29, 0.95]);
  for (let i = 0; i < 8; i++) {
    const x = -0.87 + i * 0.249;
    const c = i % 2 ? MAG : CYAN;
    neon(0.22, 0.09, 0.05, c, [x, 2.23, 1.1], {}, 1.8);
    neon(0.22, 0.09, 0.05, c, [x, 2.23, 0.8], {}, 1.8);
  }
  for (const s of [1, -1]) {
    neon(0.05, 0.08, 0.24, i2(s), [s * 1.01, 2.23, 0.95], {}, 1.6);
    box(0.14, 0.1, 0.2, DARK, [s * 0.7, 2.18, 0.95]);
  }
  function i2(s: number) {
    return s > 0 ? CYAN : MAG;
  }
  // sensor dome
  b.part(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, {
    bone: chassis,
    at: [0, 2.18, 0.45],
    flat: true,
  });
  glow(cyl(0.035, 0.03, 8, MAG, [0, 2.26, 0.58], "z"), 1.8);
  // roof rails
  for (const s of [1, -1]) {
    rod([s * 1.0, 2.2, -2.7], [s * 1.0, 2.2, -0.2], 0.025, STEEL);
    for (const z of [-2.6, -1.8, -1.0, -0.3]) cyl(0.02, 0.1, 6, DARK, [s * 1.0, 2.17, z]);
  }

  // ---------- tanks ----------
  for (const s of [1, -1]) {
    const x = s * 0.55;
    cyl(0.32, 1.1, 12, TANK, [x, 2.5, -2.1], "z");
    b.part(new THREE.SphereGeometry(0.32, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), TANK, { bone: chassis, at: [x, 2.5, -1.55], rotation: [90, 0, 0], flat: true });
    b.part(new THREE.SphereGeometry(0.32, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), TANK, { bone: chassis, at: [x, 2.5, -2.65], rotation: [-90, 0, 0], flat: true });
    for (const z of [-1.75, -2.1, -2.45]) glow(ring(0.325, 0.02, CYAN, [x, 2.5, z], [0, 0, 1]), 1.3);
    for (const z of [-1.8, -2.4]) box(0.5, 0.2, 0.12, DARK, [x, 2.24, z]);
    cyl(0.05, 0.14, 8, STEEL, [x, 2.86, -2.1]); // filler cap
    decal(GAUGE, 0.2, 0.2, [x, 2.48, -1.565], [0, 0, 1]);
    rod([x, 2.3, -1.6], [s * 0.1, 2.4, -1.0], 0.04, STEEL); // feed pipe
  }

  // ---------- water cannon ----------
  const TZ = -0.7;
  const yaw = b.joint("cannonYaw", { parent: chassis, at: [0, 2.18, TZ], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("cannonPitch", { parent: yaw, at: [0, 2.65, TZ], dir: [0, 0, 1], role: "hinge" });
  const nozzle = b.joint("nozzle", { parent: pitch, at: [0, 2.65, 0.85], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.45, 0.04, 6, 18), STEEL, { bone: chassis, at: [0, 2.2, TZ], rotation: [90, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.025, 0.04, 6, DARK, [0.45 * Math.cos(a), 2.24, TZ + 0.45 * Math.sin(a)]);
  }
  cyl(0.38, 0.2, 12, HULL, [0, 2.3, TZ], "y", { bone: yaw });
  box(0.8, 0.12, 0.7, DARK, [0, 2.45, TZ], { bone: yaw });
  for (const s of [1, -1]) {
    box(0.08, 0.4, 0.5, HULL, [s * 0.3, 2.65, TZ], { bone: yaw });
    cyl(0.07, 0.1, 8, STEEL, [s * 0.36, 2.65, TZ], "x", { bone: yaw });
    box(0.12, 0.1, 0.1, DARK, [s * 0.34, 2.45, TZ - 0.28], { bone: yaw });
    glow(box(0.02, 0.06, 0.2, CYAN, [s * 0.345, 2.55, TZ], { bone: yaw }), 1.4);
  }
  box(0.44, 0.44, 0.8, STEELP, [0, 2.65, TZ - 0.3], { bone: pitch }); // breech
  box(0.3, 0.3, 0.12, DARK, [0, 2.65, TZ - 0.75], { bone: pitch });
  b.rod([0, 2.65, TZ - 0.1], [0, 2.65, 0.85], [0.21, 0.15], STEELP, { bone: pitch, sides: 10 });
  for (const z of [-0.2, 0.15, 0.5]) {
    ring(0.2 - (z + 0.2) * 0.07, 0.025, DARK, [0, 2.65, z], [0, 0, 1], { bone: pitch });
    glow(ring(0.205 - (z + 0.2) * 0.07, 0.012, CYAN, [0, 2.65, z + 0.05], [0, 0, 1], { bone: pitch }), 1.5);
  }
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.2, 0.1],
      [0.26, 0.32],
      [0.15, 0.34],
      [0, 0.3],
    ],
    { at: [0, 2.65, 0.85], axis: [0, 0, 1], segments: 10, bone: nozzle, color: STEELP },
  );
  glow(cyl(0.14, 0.02, 10, CYAN, [0, 2.65, 1.19], "z", { bone: nozzle }), 1.8);
  ring(0.265, 0.02, YEL, [0, 2.65, 1.14], [0, 0, 1], { bone: nozzle });
  for (const s of [1, -1]) {
    rod([s * 0.2, 2.45, TZ - 0.1], [s * 0.2, 2.5, 0.2], 0.035, STEEL, { bone: pitch }); // ram cylinders
    box(0.14, 0.2, 0.3, DARK, [s * 0.28, 2.82, TZ - 0.3], { bone: pitch });
    glow(box(0.1, 0.02, 0.2, MAG, [s * 0.28, 2.93, TZ - 0.3], { bone: pitch }), 1.6);
  }
  // hose
  b.sweep(
    catmull([[0.55, 2.3, -1.58] as V, [0.5, 2.1, -1.2] as V, [0.2, 2.25, -0.95] as V, [0.05, 2.45, -0.85] as V]),
    0.04,
    "#15171e",
    { bone: chassis, sides: 6 },
  );

  // ---------- billboard + antennas ----------
  for (const s of [1, -1]) rod([s * 0.97, 2.18, -2.82], [s * 0.97, 2.78, -2.82], 0.03, STEEL);
  box(2.04, 0.44, 0.08, DARK, [0, 2.5, -2.82]);
  decal(LED, 1.92, 0.36, [0, 2.5, -2.867], [0, 0, -1], {}, 1.2);
  decal(LED, 1.92, 0.36, [0, 2.5, -2.777], [0, 0, 1], {}, 0); 
  neon(2.04, 0.03, 0.06, MAG, [0, 2.76, -2.82], {}, 1.6);
  rod([-0.95, 2.18, -2.5], [-1.0, 3.3, -2.55], 0.012, STEEL, { sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), MAG, { bone: chassis, at: [-1.0, 3.3, -2.55] }), 2);
  cyl(0.04, 0.15, 6, DARK, [-0.95, 2.22, -2.5]);
  rod([0.95, 2.18, -0.3], [0.95, 2.7, -0.3], 0.02, STEEL, { sides: 5 });
  rod([0.65, 2.7, -0.3], [1.25, 2.7, -0.3], 0.015, STEEL, { sides: 4 });
  for (const x of [0.7, 0.95, 1.2]) rod([x, 2.7, -0.3], [x, 2.95, -0.3], 0.01, STEEL, { sides: 4 });

  return b.root;
}
```