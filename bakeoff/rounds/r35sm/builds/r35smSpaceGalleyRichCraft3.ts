import * as THREE from "three";
import { createBuilder, svg, bezier, catmull, paint, mix, noise, smoothstep } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description:
    "Cutaway of the Nostromo's galley and mess: panelled bulkheads, steel counter with sink, hob and coffee maker, wall lockers, fridge, CRT, fire extinguisher, ceiling pipes, bolted mess table with benches and a cat bowl, in the used-future look of Alien (1979).",
};

// ---------------------------------------------------------------- palette
const BEIGE = "#aaa798";
const OLIVE = "#8d9086";
const DARKGREY = "#3b3e40";
const BLACK = "#1b1c1e";
const ORANGE = "#b8552d";
const RED = "#a8281f";
const YELLOW = "#e0b21c";
const CREAM = "#e7e0c8";
const AMBER = "#ffb23d";
const CYAN = "#bfe9ee";
const GREEN = "#6dff8a";
const GLASS = "#6b3b1c";

// ---------------------------------------------------------------- textures
const hazard = svg(
  `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#e0b21c"/>${Array.from(
    { length: 17 },
    (_, i) => `<polygon points="${i * 8 - 8},8 ${i * 8 - 4},8 ${i * 8},0 ${i * 8 - 4},0" fill="#1a1a1a"/>`,
  ).join("")}</svg>`,
  { size: 256 },
);

const screenTex = (lines: string[]) =>
  svg(
    `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#031a0a"/>
    <rect x="2" y="2" width="76" height="56" fill="none" stroke="#2bd65a" stroke-width="1"/>
    ${lines
      .map(
        (l, i) =>
          `<text x="6" y="${12 + i * 8}" font-family="monospace" font-weight="bold" font-size="6" fill="#4dff7c">${l}</text>`,
      )
      .join("")}
    <rect x="6" y="${12 + lines.length * 8}" width="4" height="6" fill="#4dff7c"/></svg>`,
    { size: 256 },
  );
const SCREEN = screenTex(["NOSTROMO 180924609", "GALLEY  TEMP 21C", "O2 20.9  PRESS 1.0", "RATIONS  OK", "MU-TH-UR READY"]);
const FRIDGE_SCR = screenTex(["COLD STORE", "-04 C", "STATUS NOMINAL"]);

const labelCache = new Map<string, THREE.Texture>();
const label = (text: string) => {
  let t = labelCache.get(text);
  if (!t) {
    t = svg(
      `<svg viewBox="0 0 60 16" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="58" height="14" rx="2" fill="#e5dfc4" stroke="#222" stroke-width="1.4"/>
      <text x="30" y="11.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#222">${text}</text></svg>`,
      { size: 192 },
    );
    labelCache.set(text, t);
  }
  return t;
};

const LOGO = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="40" fill="#d8d2b8" stroke="#222" stroke-width="2"/>
  <path d="M10 8 L20 28 L30 8 L40 28 L50 8" stroke="#222" stroke-width="3" fill="none"/>
  <text x="40" y="35" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="7" fill="#222">WEYLAND-YUTANI</text></svg>`,
  { size: 256 },
);

const DIALS = svg(
  `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="30" rx="3" fill="#2a2c2e" stroke="#777" stroke-width="1.5"/>
  ${[0, 1, 2, 3]
    .map(
      (i) =>
        `<circle cx="${18 + i * 28}" cy="14" r="8" fill="#bbb" stroke="#111" stroke-width="1.5"/><path d="M${18 + i * 28} 14 L${18 + i * 28 + 5 * Math.cos(i)} ${14 - 6 * Math.sin(i + 1)}" stroke="#111" stroke-width="2"/><circle cx="${18 + i * 28}" cy="26" r="1.8" fill="${i % 2 ? "#ff3b30" : "#ffb23d"}"/>`,
    )
    .join("")}</svg>`,
  { size: 256 },
);

const FIRE = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="3" fill="#b0221a" stroke="#fff" stroke-width="2"/>
  <path d="M20 6 C26 14 31 18 28 27 C26 33 14 33 12 27 C10 20 16 18 20 6Z" fill="#fff"/><path d="M20 16 C23 21 25 23 23 28 C21 30 17 29 17 26 C17 22 19 21 20 16Z" fill="#b0221a"/>
  <text x="20" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="5" fill="#fff">FIRE</text></svg>`,
  { size: 128 },
);

const TRAY = svg(
  `<svg viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg"><rect width="70" height="50" rx="4" fill="#9a9d9f" stroke="#444" stroke-width="2"/>
  <rect x="5" y="5" width="38" height="40" rx="3" fill="#7f8284" stroke="#555" stroke-width="1.5"/>
  <rect x="47" y="5" width="18" height="18" rx="3" fill="#7f8284" stroke="#555" stroke-width="1.5"/>
  <rect x="47" y="27" width="18" height="18" rx="3" fill="#7f8284" stroke="#555" stroke-width="1.5"/>
  <circle cx="24" cy="25" r="12" fill="#c98f4a"/><circle cx="56" cy="14" r="5" fill="#7a9a4a"/></svg>`,
  { size: 256 },
);

const CAN = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#c9302a"/><rect y="11" width="64" height="10" fill="#f1ead2"/>
  <text x="16" y="19" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="8" fill="#222">RATION</text>
  <rect x="34" y="4" width="26" height="3" fill="#f1ead2"/><rect x="34" y="25" width="26" height="3" fill="#f1ead2"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- paints
const STEEL = metal("steel", { tarnish: 0.3, polish: 0.5 });
const DARKSTEEL = metal("iron", { tarnish: 0.3 });
const WALL = panelled(
  paint((p, n) => {
    const c = mix(BEIGE, "#8f8c7c", smoothstep(0.35, 0.8, noise(p, 0.5, 4)) * 0.6);
    return mix(c, "#4a4638", smoothstep(0.62, 0.8, noise(p, 0.12, 8)) * 0.35 * (n.y > 0.9 ? 0 : 1));
  }),
  { size: 0.45, aspect: 0.8, rivets: 0.06 },
);
const CAB = panelled(
  paint((p) => mix(OLIVE, "#6c6f66", smoothstep(0.4, 0.8, noise(p, 0.3, 11)) * 0.7)),
  { size: 0.5, aspect: 1, rivets: 0, },
);
const FLOOR = panelled(
  paint((p, n) => mix("#4b4d4e", "#2b2c2d", smoothstep(0.4, 0.8, noise(p, 0.25, 2)) * 0.8 + (n.y < 0.5 ? 0.2 : 0))),
  { size: 0.4, aspect: 1, rivets: 0.08 },
);

// ---------------------------------------------------------------- builder & helpers
export default function build() {
  const b = createBuilder({ name: "nostromo_galley" });

  type Col = Parameters<typeof b.part>[1];
  const box = (w: number, h: number, d: number, c: Col, x: number, y: number, z: number, o: object = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, c: Col, x: number, y: number, z: number, seg = 10, o: object = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], ...o });
  const decal = (
    w: number,
    h: number,
    t: THREE.Texture,
    x: number,
    y: number,
    z: number,
    dir: [number, number, number] = [0, 0, 1],
    o: object = {},
  ) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: t, ...o });
  const rod = (a: [number, number, number], c: [number, number, number], r: number, col: Col) =>
    b.rod(a, c, r, { color: col as string });

  // ---------------- shell
  box(3.7, 0.05, 2.4, FLOOR, 0, 0.025, 0.2);
  box(3.7, 2.45, 0.1, WALL, 0, 1.275, -0.95); // back wall
  box(0.1, 2.45, 2.4, WALL, -1.85, 1.275, 0.2); // left bulkhead
  box(3.7, 0.05, 2.4, panelled("#7f8077", { size: 0.5, rivets: 0.06 }), 0, 2.525, 0.2); // ceiling
  // floor hazard stripe + amber kick lights
  decal(2.1, 0.12, hazard, -0.6, 0.052, -0.14, [0, 1, 0], { up: [0, 0, -1] });
  glow(box(2.1, 0.03, 0.02, AMBER, -0.6, 0.09, -0.255), 1.2);
  // vertical conduits and clamps on the back wall
  for (const x of [-1.75, 1.75]) {
    rod([x, 0.05, -0.86], [x, 2.5, -0.86], 0.04, DARKSTEEL);
    for (const y of [0.4, 1.2, 2.0]) box(0.12, 0.05, 0.05, STEEL, x, y, -0.86);
  }
  // ceiling pipes & duct
  rod([-1.8, 2.42, -0.78], [1.8, 2.42, -0.78], 0.05, STEEL);
  rod([-1.8, 2.34, -0.7], [1.8, 2.34, -0.7], 0.03, ORANGE);
  rod([-1.8, 2.3, -0.62], [1.8, 2.3, -0.62], 0.02, YELLOW);
  for (let i = 0; i < 7; i++) box(0.05, 0.14, 0.2, DARKSTEEL, -1.6 + i * 0.53, 2.38, -0.7);
  box(0.4, 0.25, 2.2, panelled(OLIVE, { size: 0.3, rivets: 0.05 }), 0.9, 2.37, 0.3);
  // ceiling lights
  for (const x of [-1.0, 0.0, 1.0]) {
    box(0.85, 0.03, 0.4, DARKSTEEL, x, 2.495, 0.55);
    glow(box(0.75, 0.02, 0.3, CYAN, x, 2.48, 0.55), 1.4);
  }

  // ---------------- left hatch
  b.part(new THREE.TorusGeometry(0.46, 0.05, 6, 16), STEEL, { at: [-1.78, 1.1, 0.4], dir: [1, 0, 0], axis: "z" });
  cyl(0.42, 0.42, 0.05, DARKSTEEL, -1.78, 1.1, 0.4, 16, { dir: [1, 0, 0] });
  cyl(0.1, 0.1, 0.07, STEEL, -1.74, 1.1, 0.4, 8, { dir: [1, 0, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.5;
    rod([-1.72, 1.1, 0.4], [-1.72, 1.1 + 0.2 * Math.sin(a), 0.4 + 0.2 * Math.cos(a)], 0.015, STEEL);
  }
  decal(0.5, 0.13, label("GALLEY"), -1.795, 1.8, 0.4, [1, 0, 0]);
  decal(0.7, 0.05, hazard, -1.795, 0.62, 0.4, [1, 0, 0]);
  decal(0.7, 0.05, hazard, -1.795, 1.58, 0.4, [1, 0, 0]);

  // ---------------- base counter
  const CX = -0.6;
  box(2.1, 0.85, 0.64, CAB, CX, 0.475, -0.58);
  box(2.14, 0.04, 0.68, STEEL, CX, 0.92, -0.58);
  box(2.16, 0.02, 0.02, DARKSTEEL, CX, 0.945, -0.25);
  const door = (x: number, y: number, z: number, w: number, h: number, col: Col, hv = false) => {
    box(w - 0.02, h, 0.025, col, x, y, z);
    box(w - 0.06, h - 0.04, 0.008, DARKSTEEL, x, y, z + 0.016);
    if (hv) rod([x + w / 2 - 0.05, y - 0.15, z + 0.045], [x + w / 2 - 0.05, y + 0.15, z + 0.045], 0.012, STEEL);
    else rod([x - 0.06, y + h / 2 - 0.07, z + 0.04], [x + 0.06, y + h / 2 - 0.07, z + 0.04], 0.012, STEEL);
    for (const sx of [-1, 1]) cyl(0.012, 0.012, 0.02, STEEL, x + sx * (w / 2 - 0.04), y + h / 2 - 0.05, z + 0.015, 6, { dir: [0, 0, 1] });
  };
  for (const x of [-1.475, -1.125, -0.075, 0.275]) door(x, 0.5, -0.25, 0.35, 0.74, CAB);
  // oven
  box(0.64, 0.74, 0.03, CAB, CX, 0.5, -0.25);
  box(0.5, 0.36, 0.01, BLACK, CX, 0.46, -0.23);
  glow(box(0.42, 0.28, 0.005, "#7a2a10", CX, 0.46, -0.223), 0.5);
  rod([-0.85, 0.74, -0.2], [-0.35, 0.74, -0.2], 0.015, STEEL);
  decal(0.28, 0.07, label("OVEN"), CX, 0.8, -0.232);
  decal(0.5, 0.05, hazard, -1.3, 0.1, -0.238);

  // sink
  box(0.58, 0.02, 0.42, DARKSTEEL, -1.3, 0.945, -0.58);
  box(0.64, 0.015, 0.05, STEEL, -1.3, 0.948, -0.33);
  b.sweep(
    bezier([-1.3, 0.94, -0.82], [-1.3, 1.25, -0.82], [-1.3, 1.3, -0.72], [-1.3, 1.16, -0.62]),
    0.016,
    { color: STEEL as unknown as string, caps: "round", sides: 6 },
  );
  for (const sx of [-1, 1]) cyl(0.015, 0.015, 0.07, STEEL, -1.3 + sx * 0.1, 0.98, -0.82, 6);

  // hob
  box(0.62, 0.015, 0.5, BLACK, CX, 0.947, -0.56);
  [[-0.15, -0.12], [0.15, -0.12], [-0.15, 0.12], [0.15, 0.12]].forEach(([dx, dz], i) => {
    const t = b.part(new THREE.TorusGeometry(0.075, 0.012, 5, 12), i === 3 ? RED : DARKSTEEL, {
      at: [CX + dx, 0.96, -0.56 + dz * 0.8],
      dir: [0, 1, 0],
      axis: "z",
    });
    if (i === 3) glow(t, 1.4);
  });
  // pot
  const potX = CX - 0.15, potZ = -0.65;
  cyl(0.1, 0.1, 0.15, STEEL, potX, 1.04, potZ, 12);
  cyl(0.105, 0.105, 0.015, DARKSTEEL, potX, 1.12, potZ, 12);
  cyl(0.02, 0.02, 0.02, BLACK, potX, 1.14, potZ, 6);
  for (const s of [-1, 1]) box(0.05, 0.02, 0.02, BLACK, potX + s * 0.125, 1.08, potZ);
  // pan
  cyl(0.11, 0.1, 0.035, DARKSTEEL, CX + 0.15, 0.98, -0.5, 12);
  rod([CX + 0.15, 0.99, -0.4], [CX + 0.15, 1.01, -0.2], 0.012, BLACK);
  // dials backsplash
  box(2.14, 0.4, 0.02, STEEL, CX, 1.15, -0.89);
  decal(0.5, 0.125, DIALS, CX, 1.1, -0.875);
  // utensil rail
  rod([-1.6, 1.28, -0.85], [0.3, 1.28, -0.85], 0.012, STEEL);
  for (const x of [-1.55, -0.65, 0.25]) box(0.03, 0.03, 0.06, STEEL, x, 1.28, -0.87);
  [-1.45, -1.3, -1.15, -0.95, -0.8].forEach((x, i) => {
    const y1 = 1.27;
    rod([x, y1, -0.84], [x, y1 - 0.22, -0.84], 0.008, STEEL);
    if (i % 2 === 0) {
      b.part(new THREE.SphereGeometry(0.035, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [x, y1 - 0.24, -0.84], rotation: [180, 0, 0] });
    } else box(0.06, 0.08, 0.008, DARKSTEEL, x, y1 - 0.26, -0.84);
  });
  // hanging mugs
  for (const x of [-0.45, -0.3, -0.15]) {
    rod([x, 1.28, -0.84], [x, 1.22, -0.84], 0.006, STEEL);
    cyl(0.032, 0.028, 0.07, CREAM, x, 1.17, -0.84, 8);
  }

  // coffee machine
  box(0.28, 0.03, 0.3, DARKSTEEL, 0.1, 0.96, -0.6);
  box(0.28, 0.4, 0.08, panelled("#9b9d94", { size: 0.2, rivets: 0 }), 0.1, 1.15, -0.78);
  box(0.28, 0.08, 0.28, DARKSTEEL, 0.1, 1.34, -0.66);
  cyl(0.015, 0.015, 0.05, STEEL, 0.1, 1.28, -0.58, 6);
  cyl(0.06, 0.07, 0.14, GLASS, 0.1, 1.04, -0.58, 8);
  box(0.02, 0.1, 0.03, BLACK, 0.18, 1.04, -0.58);
  glow(box(0.03, 0.03, 0.01, GREEN, 0.18, 1.18, -0.735), 1.5);
  glow(box(0.03, 0.03, 0.01, RED, 0.12, 1.18, -0.735), 1.5);

  // ---------------- wall lockers
  box(2.1, 0.7, 0.35, CAB, CX, 1.75, -0.725);
  box(2.14, 0.03, 0.4, STEEL, CX, 2.115, -0.72);
  ["RATIONS", "BEVERAGE", "UTENSILS", "MEDICAL"].forEach((t, i) => {
    const x = -1.3875 + i * 0.525;
    door(x, 1.75, -0.545, 0.525, 0.66, CAB, true);
    decal(0.2, 0.054, label(t), x, 1.93, -0.532);
    decal(0.44, 0.03, hazard, x, 1.46, -0.532);
  });
  glow(box(2.0, 0.015, 0.05, CYAN, CX, 1.385, -0.7), 1.2);

  // ---------------- fridge
  box(0.7, 1.85, 0.7, panelled(metal("steel", { tarnish: 0.35 }), { size: 0.35, aspect: 1.3, rivets: 0.04 }), 1.0, 0.975, -0.55);
  box(0.72, 0.01, 0.01, BLACK, 1.0, 1.35, -0.197);
  box(0.72, 0.02, 0.72, DARKSTEEL, 1.0, 1.9, -0.55);
  rod([1.28, 1.42, -0.17], [1.28, 1.75, -0.17], 0.014, DARKSTEEL);
  rod([1.28, 0.95, -0.17], [1.28, 1.28, -0.17], 0.014, DARKSTEEL);
  box(0.26, 0.2, 0.02, BLACK, 0.85, 1.6, -0.19);
  glow(decal(0.23, 0.17, FRIDGE_SCR, 0.85, 1.6, -0.178), 1.2);
  decal(0.3, 0.15, LOGO, 1.0, 0.8, -0.195);
  decal(0.5, 0.05, hazard, 1.0, 0.15, -0.195);

  // ---------------- monitor
  box(0.14, 0.14, 0.14, DARKSTEEL, 1.0, 1.98, -0.7);
  box(0.44, 0.34, 0.32, panelled("#8b8c80", { size: 0.2, rivets: 0.04 }), 1.0, 2.2, -0.72);
  box(0.4, 0.3, 0.04, BLACK, 1.0, 2.2, -0.56);
  glow(decal(0.33, 0.24, SCREEN, 1.0, 2.2, -0.536), 1.3);
  glow(box(0.02, 0.02, 0.01, RED, 1.2, 2.06, -0.556), 1.6);
  b.sweep(catmull([[1.0, 2.1, -0.88], [1.2, 1.7, -0.9], [1.4, 1.2, -0.88], [1.45, 0.6, -0.88]]), 0.012, { color: BLACK });

  // ---------------- extinguisher
  cyl(0.065, 0.065, 0.42, RED, 1.58, 1.0, -0.8, 10);
  cyl(0.065, 0.02, 0.06, RED, 1.58, 1.24, -0.8, 10);
  cyl(0.025, 0.025, 0.05, DARKSTEEL, 1.58, 1.29, -0.8, 6);
  box(0.1, 0.02, 0.05, BLACK, 1.58, 1.33, -0.8);
  for (const y of [0.9, 1.12]) box(0.16, 0.025, 0.04, DARKSTEEL, 1.58, y, -0.84);
  b.sweep(catmull([[1.62, 1.29, -0.8], [1.72, 1.1, -0.78], [1.68, 0.85, -0.78], [1.6, 0.8, -0.75]]), 0.012, { color: BLACK });
  decal(0.14, 0.14, FIRE, 1.58, 1.7, -0.89);
  decal(0.1, 0.09, label("CO2"), 1.58, 1.04, -0.735);

  // ---------------- mess table & benches
  const TX = -0.2, TZ = 0.6;
  box(1.5, 0.04, 0.75, panelled(STEEL, { size: 0.5, aspect: 0.8, rivets: 0 }), TX, 0.76, TZ);
  box(1.54, 0.03, 0.79, DARKSTEEL, TX, 0.735, TZ);
  for (const s of [-1, 1]) {
    cyl(0.06, 0.07, 0.7, DARKSTEEL, TX + s * 0.5, 0.4, TZ, 8);
    cyl(0.22, 0.22, 0.03, DARKSTEEL, TX + s * 0.5, 0.065, TZ, 8);
  }
  for (const bz of [0.0, 1.2]) {
    box(1.4, 0.06, 0.28, DARKSTEEL, TX, 0.43, bz);
    box(1.38, 0.05, 0.26, ORANGE, TX, 0.485, bz);
    for (const s of [-1, 1]) {
      box(0.06, 0.38, 0.22, DARKSTEEL, TX + s * 0.6, 0.24, bz);
      box(0.2, 0.025, 0.3, DARKSTEEL, TX + s * 0.6, 0.0625, bz);
    }
  }
  // table items
  const ty = 0.78;
  for (const [tx, tz, rot] of [[-0.45, 0.4, 0], [0.1, 0.8, 180]] as const) {
    box(0.4, 0.015, 0.28, DARKSTEEL, tx + TX, ty + 0.0075, tz, { rotation: [0, rot, 0] });
    decal(0.38, 0.27, TRAY, tx + TX, ty + 0.017, tz, [0, 1, 0], { up: [0, 0, -1], roll: rot });
  }
  for (const [cx, cz] of [[-0.1, 0.35], [0.05, 0.85], [-0.45, 0.85], [0.35, 0.55]] as const) {
    cyl(0.038, 0.032, 0.09, CREAM, TX + cx, ty + 0.065, TZ - 0.6 + cz + 0.6 - 0.6 + 0.6 - 0.0, 8);
  }
  // cat bowl
  b.part(new THREE.CylinderGeometry(0.09, 0.06, 0.05, 10), ORANGE, { at: [TX + 0.55, 0.075, 1.65 - 0.2] });
  cyl(0.07, 0.07, 0.01, "#d9cfa4", TX + 0.55, 0.1, 1.45, 10);
  // food cans
  for (let i = 0; i < 3; i++)
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), "#ffffff", {
      at: [TX + 0.3 + i * 0.09, ty + 0.06, 0.45 + (i % 2) * 0.06],
      texture: CAN,
    });
  // carafe + salt
  cyl(0.055, 0.065, 0.16, GLASS, TX - 0.1, ty + 0.1, 0.65, 8);
  cyl(0.02, 0.02, 0.07, CREAM, TX + 0.2, ty + 0.055, 0.7, 6);
  cyl(0.02, 0.02, 0.07, "#555", TX + 0.25, ty + 0.055, 0.7, 6);
  // table-side signal lamp
  glow(cyl(0.03, 0.03, 0.03, AMBER, 0.6, 2.25, -0.88, 8), 1.4);

  return b.root;
}
