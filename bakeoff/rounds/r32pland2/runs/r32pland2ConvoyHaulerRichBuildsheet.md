```ts
/*
BUILD SHEET: ARMOURED CONVOY HAULER (low-poly cyberpunk)
Proportions: ~9.2 m long (z -4.4..4.8), 3.2 m wide over the wheels, 3.9 m tall (antennas to 4.3).
Faces +Z. Static model, no joints. Wheels are 1.24 m diameter and sit on y = 0.
Parts (approx. sizes):
- Chassis rail 2.2x0.4x8.6, underglow plank 0.6x6, battery boxes 0.5x0.5x1.6
- Cab: extruded side profile 3.0 long x 1.8 tall x 2.5 wide, with sloped hood/windshield
- Door armour plates (extrudes) with unit decals, side windows, mirror pods
- Ram bumper 2.4x0.7x0.45 with hazard top plate and grille decal, cyan headlight bars
- Sealed pod: 16-sided lathe capsule 5.2 m long, radius 1.25, at y 2.55; straps, ribs, saddles
- Pod seal strip, rear hatch with keypad emblem, side emblem decals
- 8 wheels (tire 12-gon, steel rim, glowing hub, 6 lug nuts), 4 axles, fenders
- Roof: light bars, hex turret with twin barrels, dish, antennas, exhaust stacks
Palette:
 #27304a hull navy, #14161f grime, #5a6a9a edge light, #c9d2e0 pod shell, #15161c tires,
 #8ea0d2 steel rims, #7ff6ff cyan glow (lights, hubs, lens), #ff2bd6 magenta glow (hubs, underglow),
 #ffb020 amber glow (seal, beacons), #ff3050 red tail lights, #f2c200 / #111 hazard stripes,
 #2f6f86 teal armour plates.
Signature features:
- Glowing amber seal strip and rings on a pale sealed pod, with a lock emblem decal on both sides and a
  keypad hatch at the rear.
- Slanted neon HUD windshield, cyan headlight bars, magenta underglow and hubs.
- Armoured cab with door plates, a roof turret on a hex base and a ram bumper with hazard stripes.
- Paints: riveted panelling over grimy navy hull and pale pod, wear toward the lower body.
*/
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, stripes, svg } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler guarding a sealed cargo pod.",
};

const CYAN = "#7ff6ff", MAG = "#ff2bd6", AMBER = "#ffb020", RED = "#ff3050";
const TIRE = "#15161c", STEEL = "#8ea0d2", PLATE = "#2f6f86", DARK = "#101320";

const HULL = panelled(
  paint((p, n) => {
    let c = mix("#27304a", "#3a4670", noise(p, 0.6, 3) * 0.8);
    if (n.y > 0.6) c = mix(c, "#5a6a9a", 0.3);
    return mix(c, "#14161f", smoothstep(1.6, 0.9, p.y) * 0.6);
  }),
  { size: 0.5, aspect: 0.8, rivets: 0.1 },
);
const POD = panelled(
  paint((p, n) => {
    let c = mix("#c9d2e0", "#aab8cc", noise(p, 0.5, 8));
    if (n.y < -0.3) c = mix(c, "#5d6c86", 0.5);
    return mix(c, "#3a4256", smoothstep(1.9, 1.3, p.y) * 0.6);
  }),
  { size: 0.9, aspect: 0.8, rivets: 0.15 },
);
const HAZARD = stripes("#f2c200", "#111111", { size: 0.14, axis: [1, 0, 1], width: 0.5, wobble: 0 });
const IRON = metal("iron");
const STEELP = metal("steel");

// ---------- textures ----------
const WINDSHIELD = svg(
  `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a3a"/><stop offset="0.6" stop-color="#1a1044"/><stop offset="1" stop-color="#3a0f4a"/></linearGradient></defs>
  <rect x="2" y="2" width="196" height="86" rx="8" fill="url(#g)" stroke="#05060c" stroke-width="4"/>
  <path d="M20 88 L70 2 L95 2 L45 88Z" fill="#7ff6ff" opacity="0.18"/>
  <path d="M110 88 L150 2 L162 2 L122 88Z" fill="#ff2bd6" opacity="0.14"/>
  <path d="M14 70 H60 M14 76 H44" stroke="#7ff6ff" stroke-width="2" opacity="0.8"/>
  <text x="140" y="76" font-family="monospace" font-size="11" fill="#7ff6ff">VEL 062</text>
  <circle cx="170" cy="22" r="9" fill="none" stroke="#ffb020" stroke-width="2"/>
  <path d="M170 14 V30 M162 22 H178" stroke="#ffb020" stroke-width="1.5"/>
  </svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="46" rx="6" fill="#0c1a2e" stroke="#05060c" stroke-width="4"/>
  <path d="M10 46 L40 4 L58 4 L28 46Z" fill="#7ff6ff" opacity="0.2"/>
  <path d="M70 46 L95 4 L104 4 L79 46Z" fill="#ff2bd6" opacity="0.18"/>
  </svg>`,
  { size: 192 },
);
const DOOR = svg(
  `<svg viewBox="0 0 100 34" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="32" rx="3" fill="#0a0d18" stroke="#ff2bd6" stroke-width="2"/>
  <path d="M6 28 L18 6 H26 L14 28Z M20 28 L32 6 H40 L28 28Z" fill="#ffb020"/>
  <text x="48" y="22" font-family="monospace" font-weight="bold" font-size="15" fill="#7ff6ff">CV-07</text>
  </svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="156" height="96" rx="8" fill="#10152a" stroke="#ff2bd6" stroke-width="3"/>
  <path d="M40 14 L64 14 L76 34 L64 54 L40 54 L28 34Z" fill="#1c2748" stroke="#7ff6ff" stroke-width="3"/>
  <rect x="38" y="30" width="28" height="18" rx="2" fill="#ffb020"/>
  <path d="M43 30 V24 a9 9 0 0 1 18 0 V30" fill="none" stroke="#ffb020" stroke-width="4"/>
  <circle cx="52" cy="39" r="3" fill="#10152a"/>
  <text x="86" y="32" font-family="monospace" font-weight="bold" font-size="17" fill="#7ff6ff">SEALED</text>
  <text x="86" y="50" font-family="monospace" font-size="9" fill="#ff2bd6">CLASS-9 CARGO</text>
  <path d="M10 70 H150" stroke="#ffb020" stroke-width="4" stroke-dasharray="10 6"/>
  <text x="12" y="90" font-family="monospace" font-size="9" fill="#c9d2e0">NO ENTRY // BIOLOCK ACTIVE</text>
  </svg>`,
  { size: 384 },
);
const HATCH = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#141a30" stroke="#05060c" stroke-width="3"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="#7ff6ff" stroke-width="2" stroke-dasharray="8 5"/>
  <path d="M50 12 V28 M50 72 V88 M12 50 H28 M72 50 H88" stroke="#ffb020" stroke-width="5"/>
  <rect x="38" y="38" width="24" height="24" rx="3" fill="#0a0d18" stroke="#7ff6ff" stroke-width="2"/>
  <path d="M42 44 H58 M42 50 H58 M42 56 H58" stroke="#ffb020" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 180 56" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="176" height="52" rx="4" fill="#07090f" stroke="#2f6f86" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="12" y="${8 + i * 7.5}" width="156" height="3.5" fill="#1d2a3a"/>`).join("")}
  <rect x="12" y="25" width="156" height="3" fill="#7ff6ff" opacity="0.8"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r: number, len: number, seg: number, color: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, ...o });
  const lamp = (w: number, h: number, d: number, color: string, at: number[], s = 1.3) =>
    glow(box(w, h, d, color, at), s);
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], s = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
    return s ? glow(p, s) : p;
  };

  // ---------- chassis ----------
  box(2.2, 0.4, 8.6, IRON, [0, 1.05, -0.1]);
  box(0.6, 0.04, 6.2, MAG, [0, 0.82, -0.3]);
  glow(b.root.children.length ? box(0.6, 0.03, 6.0, MAG, [0, 0.8, -0.3]) : box(0.6, 0.03, 6.0, MAG, [0, 0.8, -0.3]), 1.4);
  for (const s of [1, -1]) {
    box(0.55, 0.5, 1.7, "#1b2236", [s * 1.15, 0.95, 0.1]); // battery
    lamp(0.04, 0.08, 1.2, CYAN, [s * 1.43, 1.05, 0.1]);
    box(0.08, 0.32, 1.4, PLATE, [s * 1.4, 0.85, 0.1 - 0.0 + 0.0 + 0.0]);
  }

  // ---------- wheels ----------
  const axles: [number, string][] = [[3.3, CYAN], [2.1, CYAN], [-1.8, MAG], [-3.2, MAG]];
  for (const [z, hub] of axles) {
    cyl(0.07, 2.8, 6, STEELP, [0, 0.62, z], [1, 0, 0]);
    for (const s of [1, -1]) {
      const x = s * 1.3;
      cyl(0.62, 0.55, 12, TIRE, [x, 0.62, z], [1, 0, 0]);
      cyl(0.4, 0.58, 8, STEELP, [x, 0.62, z], [1, 0, 0]);
      glow(cyl(0.2, 0.64, 8, hub, [x, 0.62, z], [1, 0, 0]), 1.5);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.1, 0.07, 0.07), "#c8ccd8", {
          at: [s * 1.62, 0.62 + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3],
        });
      }
      box(0.72, 0.1, 1.5, PLATE, [x, 1.36, z]); // fender
      box(0.72, 0.28, 0.1, HULL, [x, 1.2, z - 0.72]);
      box(0.72, 0.28, 0.1, HULL, [x, 1.2, z + 0.72]);
    }
  }

  // ---------- cab ----------
  b.extrude(
    [[1.4, 1.3], [4.4, 1.3], [4.4, 2.0], [3.7, 2.25], [2.9, 3.1], [1.4, 3.1]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, bevel: 0.05, color: HULL },
  );
  for (const s of [1, -1]) {
    b.extrude([[1.6, 1.4], [3.8, 1.4], [3.8, 1.95], [3.1, 2.2], [1.6, 2.2]], {
      at: [s * 1.26, 0, 0], x: [0, 0, 1], thickness: 0.1, bevel: 0.02, color: PLATE,
    });
    plane(1.3, 0.45, DOOR, [s * 1.325, 1.75, 2.4], [s, 0, 0]);
    plane(1.3, 0.55, SIDEWIN, [s * 1.262, 2.7, 2.1], [s, 0, 0], 0.5);
    // mirror pod
    box(0.1, 0.3, 0.2, DARK, [s * 1.5, 2.45, 3.45]);
    box(0.28, 0.04, 0.04, STEELP, [s * 1.37, 2.55, 3.45]);
    lamp(0.04, 0.2, 0.12, CYAN, [s * 1.56, 2.45, 3.45], 1.2);
    // neon edge
    lamp(0.04, 0.04, 3.0, MAG, [s * 1.27, 1.33, 2.9]);
  }
  plane(2.1, 1.0, WINDSHIELD, [0, 2.675 + 0.0, 3.3].map((v, i) => v + [0, 0.686, 0.728][i] * 0.03), [0, 0.686, 0.728], 0.5);
  // roof: light bars
  lamp(0.7, 0.1, 0.22, CYAN, [-0.6, 3.17, 2.7], 1.5);
  lamp(0.7, 0.1, 0.22, MAG, [0.6, 3.17, 2.7], 1.5);
  box(1.8, 0.06, 0.34, DARK, [0, 3.12, 2.7]);
  // headlights, ram
  lamp(0.8, 0.14, 0.06, CYAN, [-0.75, 1.75, 4.42], 1.8);
  lamp(0.8, 0.14, 0.06, CYAN, [0.75, 1.75, 4.42], 1.8);
  box(2.4, 0.7, 0.45, IRON, [0, 0.95, 4.575]);
  box(2.45, 0.06, 0.5, HAZARD, [0, 1.31, 4.575]);
  plane(1.9, 0.5, GRILLE, [0, 0.95, 4.805], [0, 0, 1]);
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.35, 0], [0.35, 0.55], [0, 0.35]], {
      at: [s * 1.2, 0.6, 4.4], x: [0, 0, 1], thickness: 0.16, color: PLATE,
    });
    lamp(0.1, 0.1, 0.06, AMBER, [s * 1.15, 1.05, 4.81]);
  }

  // ---------- exhausts ----------
  for (const s of [1, -1]) {
    cyl(0.12, 2.4, 8, STEELP, [s * 1.1, 2.5, 1.25], [0, 1, 0]);
    cyl(0.15, 0.12, 8, IRON, [s * 1.1, 3.7, 1.25], [0, 1, 0]);
    glow(cyl(0.09, 0.05, 8, AMBER, [s * 1.1, 3.77, 1.25], [0, 1, 0]), 1.4);
    box(0.08, 0.1, 0.3, IRON, [s * 1.1, 1.8, 1.35]);
  }

  // ---------- turret ----------
  b.lathe([[0, 0], [0.42, 0], [0.38, 0.2], [0, 0.2]], { at: [0, 3.12, 1.95], segments: 6, color: IRON });
  box(0.8, 0.3, 0.9, HULL, [0, 3.47, 2.0]);
  box(0.84, 0.08, 0.5, PLATE, [0, 3.66, 1.9]);
  lamp(0.34, 0.1, 0.05, CYAN, [0, 3.5, 2.47], 1.8);
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 3.45, 2.4], [s * 0.22, 3.45, 3.4], 0.055, STEELP);
    box(0.14, 0.14, 0.2, DARK, [s * 0.22, 3.45, 3.4]);
    lamp(0.07, 0.07, 0.03, MAG, [s * 0.22, 3.45, 3.51], 1.6);
  }

  // ---------- dish & antennas ----------
  b.rod([-0.8, 3.1, 1.6], [-0.8, 3.5, 1.6], 0.05, STEELP);
  b.lathe([[0, 0], [0.3, 0.14], [0.3, 0.17], [0, 0.05]], { at: [-0.8, 3.55, 1.6], axis: [0, 0.8, 0.6], segments: 8, color: "#d5dbe8" });
  for (const [x, h] of [[1.0, 1.2], [-1.15, 0.9]] as number[][]) {
    b.rod([x, 3.1, 1.55], [x, 3.1 + h, 1.55], 0.02, STEELP);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [x, 3.1 + h + 0.04, 1.55] }), 1.8);
  }

  // ---------- cargo pod ----------
  const podZ = -1.6;
  const pod = b.lathe(
    [[0, -2.6], [0.8, -2.6], [1.15, -2.3], [1.25, -1.9], [1.25, 1.9], [1.15, 2.3], [0.8, 2.6], [0, 2.6]],
    { at: [0, 2.55, podZ], axis: [0, 0, 1], segments: 16, color: POD },
  );
  const ring = (z: number, hw: number, r: number, color: any, s = 0) => {
    const p = b.lathe([[r - 0.1, -hw], [r, -hw + 0.03], [r, hw - 0.03], [r - 0.1, hw]], {
      at: [0, 2.55, z], axis: [0, 0, 1], segments: 16, color,
    });
    return s ? glow(p, s) : p;
  };
  ring(-3.55, 0.17, 1.35, DARK);
  ring(0.3, 0.17, 1.35, DARK);
  ring(-3.55, 0.03, 1.38, AMBER, 1.4);
  ring(0.3, 0.03, 1.38, AMBER, 1.4);
  ring(-4.0, 0.06, 1.1, IRON);
  ring(0.75, 0.06, 1.15, IRON);
  for (const z of [-3.55, 0.3]) box(1.7, 0.2, 0.5, IRON, [0, 1.37, z]);
  glow(box(0.35, 0.06, 3.6, AMBER, [0, 3.84, podZ]), 1.5);
  for (const z of [-3.4, -2.8, -0.5, 0.1]) {
    box(0.5, 0.12, 0.12, DARK, [0, 3.82, z]); // latch clamps
  }
  for (const s of [1, -1]) {
    b.decal(pod, EMBLEM, { at: [s * 1.3, 2.7, -1.6], dir: [s, 0, 0], size: [2.3, 1.45], segments: 14 });
    lamp(0.04, 0.12, 0.9, CYAN, [s * 1.18, 1.62, -1.6].map((v, i) => (i === 0 ? v + s * 0.1 : v)), 1.4);
  }

  // rear hatch
  b.lathe([[0, 0], [0.72, 0], [0.72, -0.08], [0, -0.08]], { at: [0, 2.55, -4.2], axis: [0, 0, 1], segments: 12, color: IRON });
  const hatch = b.part(new THREE.CircleGeometry(0.64, 16), "#ffffff", { at: [0, 2.55, -4.295], dir: [0, 0, -1], axis: "z", texture: HATCH });
  glow(hatch, 0.8);
  for (const s of [1, -1]) box(0.12, 0.6, 0.14, STEELP, [s * 0.85, 2.55, -4.15]);

  // ---------- rear ----------
  box(2.4, 0.3, 0.3, HAZARD, [0, 1.0, -4.4]);
  for (const s of [1, -1]) {
    lamp(0.5, 0.14, 0.06, RED, [s * 0.8, 1.35, -4.42], 1.8);
    box(0.7, 0.4, 0.3, PLATE, [s * 0.8, 1.4, -4.3]);
    lamp(0.5, 0.14, 0.06, RED, [s * 0.8, 1.38, -4.46], 1.8);
  }
  // mud flaps
  for (const s of [1, -1]) box(0.6, 0.45, 0.05, DARK, [s * 1.3, 0.55, -3.9]);

  return b.root;
}
```