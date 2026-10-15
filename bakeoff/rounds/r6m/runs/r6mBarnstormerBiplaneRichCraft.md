```ts
import * as THREE from "three";
import { createBuilder, frame, rng, mix, noise, paint, grain, stripes, svg, lerp } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A whimsical red-and-teal barnstorming biplane, 'Loop-de-Lou', with a grinning engine cowl, a waving goggled pilot, streaming scarf, wingtip streamers and a little grass airfield with a ride-sign, hay and fuel drums.",
};

// ---------------------------------------------------------------- palette
const RED = "#e2492f";
const RED_D = "#a82a24";
const TEAL = "#2fa7a0";
const TEAL_D = "#1d6f78";
const MUSTARD = "#f2b632";
const CREAM = "#fff0cf";
const CREAM_D = "#e3cfa0";
const NAVY = "#22304f";
const INKC = "#2a1d33";
const LEATHER = "#9a5a2c";
const LEATHER_D = "#6b3a1e";
const TIRE = "#2b2830";
const SKIN = "#f2b48c";
const GRASS_A = "#6fbf4a";
const GRASS_B = "#4f9f3c";
const GRASS_D = "#2f7a2e";
const DIRT = "#b98a56";
const DIRT_L = "#d3a974";
const WOOD_L = "#d49a56";
const WOOD_D = "#9c6230";
const HAY_A = "#f0cf62";
const HAY_B = "#c99a3a";

const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

// ---------------------------------------------------------------- textures
const STAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${INKC}"/>
  <circle cx="50" cy="50" r="44" fill="${NAVY}"/>
  <circle cx="50" cy="50" r="35" fill="${CREAM}"/>
  <circle cx="50" cy="50" r="27" fill="${RED}"/>
  <polygon points="${starPts(50, 52, 24, 10)}" fill="${CREAM}" stroke="${INKC}" stroke-width="2" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const NAME = svg(
  `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="42" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="38" fill="${CREAM}" stroke="${INKC}" stroke-width="7" stroke-linejoin="round" paint-order="stroke">Loop-de-Lou</text>
  <path d="M20 52 Q60 60 100 52 T180 52" stroke="${MUSTARD}" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 512 },
);

const FACE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="30" rx="16" ry="18" fill="#fff" stroke="${INKC}" stroke-width="4"/>
  <ellipse cx="70" cy="30" rx="16" ry="18" fill="#fff" stroke="${INKC}" stroke-width="4"/>
  <circle cx="34" cy="34" r="7.5" fill="${INKC}"/><circle cx="66" cy="34" r="7.5" fill="${INKC}"/>
  <circle cx="36.5" cy="31" r="2.5" fill="#fff"/><circle cx="68.5" cy="31" r="2.5" fill="#fff"/>
  <path d="M12 12 Q28 3 44 11" stroke="${INKC}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M56 11 Q72 3 88 12" stroke="${INKC}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="14" cy="58" r="7" fill="#ff8d8d"/><circle cx="86" cy="58" r="7" fill="#ff8d8d"/>
  <path d="M18 70 Q50 100 82 70 Q50 78 18 70Z" fill="${INKC}" stroke="${INKC}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 74 L36 80 L42 77 L42 73Z M46 77 L54 81 L58 77 L58 74Z M60 73 L66 80 L72 75Z" fill="#fff"/>
</svg>`,
  { size: 256 },
);

const GOGGLES = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="14" width="100" height="10" fill="${LEATHER_D}"/>
  <circle cx="28" cy="20" r="17" fill="#b8892a" stroke="${INKC}" stroke-width="3"/>
  <circle cx="72" cy="20" r="17" fill="#b8892a" stroke="${INKC}" stroke-width="3"/>
  <circle cx="28" cy="20" r="12" fill="#7fe0e0"/><circle cx="72" cy="20" r="12" fill="#7fe0e0"/>
  <circle cx="30" cy="22" r="5" fill="${INKC}"/><circle cx="70" cy="22" r="5" fill="${INKC}"/>
  <circle cx="23" cy="15" r="3.5" fill="#fff"/><circle cx="67" cy="15" r="3.5" fill="#fff"/>
  <rect x="44" y="17" width="12" height="6" fill="#b8892a"/>
  <path d="M50 38 Q36 33 24 38 Q14 42 10 33 Q22 50 50 42 Q78 50 90 33 Q86 42 76 38 Q64 33 50 38Z" fill="#8a4a1c" stroke="${INKC}" stroke-width="2" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const WHEEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${CREAM}" stroke="${INKC}" stroke-width="3"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#c8962e" stroke-width="5"/>
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<line x1="${50 + 9 * Math.cos(a)}" y1="${50 + 9 * Math.sin(a)}" x2="${50 + 40 * Math.cos(a)}" y2="${50 + 40 * Math.sin(a)}" stroke="${INKC}" stroke-width="2"/>`;
  }).join("")}
  <circle cx="50" cy="50" r="10" fill="${RED}" stroke="${INKC}" stroke-width="3"/>
  <circle cx="50" cy="50" r="3" fill="${MUSTARD}"/>
</svg>`,
  { size: 192 },
);

const SIGN = svg(
  `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="156" height="86" rx="8" fill="#e9c27a" stroke="${INKC}" stroke-width="4"/>
  <path d="M8 22 H152 M8 66 H152" stroke="#c99a50" stroke-width="2"/>
  <text x="80" y="36" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="22" fill="${RED_D}" stroke="${INKC}" stroke-width="1">BARNSTORM</text>
  <text x="80" y="62" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="${NAVY}">LOOPS 5&#162;</text>
  <polygon points="${starPts(18, 76, 7, 3)}" fill="${RED}"/><polygon points="${starPts(142, 76, 7, 3)}" fill="${RED}"/>
  <text x="80" y="80" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="11" fill="${INKC}">hold onto your hat!</text>
</svg>`,
  { size: 384 },
);

const TUFT = svg(
  `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 50 Q8 24 2 6 Q16 20 15 50Z" fill="${GRASS_B}" stroke="${GRASS_D}" stroke-width="1.5"/>
  <path d="M14 50 Q18 22 20 2 Q27 22 27 50Z" fill="${GRASS_A}" stroke="${GRASS_D}" stroke-width="1.5"/>
  <path d="M25 50 Q28 26 38 10 Q36 30 34 50Z" fill="${GRASS_B}" stroke="${GRASS_D}" stroke-width="1.5"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- paints
const fusPaint = paint((p, n) => {
  const rear = p.z < -1.9;
  let c: any = rear ? TEAL : RED;
  if (n.y < -0.4) c = rear ? TEAL_D : CREAM;
  if (Math.abs(p.y - 0.98) < 0.035 && p.z > -2.2 && p.z < 1.0) c = MUSTARD;
  const st = Math.abs((((p.z / 0.5) % 1) + 1) % 1 - 0.5);
  if (st > 0.475 && n.y > -0.4) c = mix(c, INKC, 0.35);
  if (n.y > 0.7) c = mix(c, "#ffffff", 0.14);
  return c;
});

function wingPaint(zc: number, chord: number, half: number) {
  const tip = half - 0.75;
  return paint((p, n) => {
    const ax = Math.abs(p.x);
    if (ax > tip) return n.y < -0.5 ? TEAL_D : TEAL;
    if (p.z > zc + chord / 2 - 0.15) return MUSTARD;
    if (p.z < zc - chord / 2 + 0.09) return RED;
    const rib = Math.abs(((ax / 0.45) % 1) - 0.5) > 0.475;
    if (rib) return CREAM_D;
    if (n.y < -0.5) return mix(CREAM, "#8aa0b8", 0.28);
    return mix(CREAM, "#ffffff", 0.2 * noise(p, 0.4, 3));
  });
}

const COWL = metal("brass", { verdigris: 0.12, polish: 0.5 });
const IRON = metal("iron");
const STEEL = metal("steel");
const WOOD = paint((p) => mix(WOOD_L, WOOD_D, 0.5 + 0.5 * Math.sin(p.y * 30 + noise(p, 0.1, 2) * 4)));
const PROP = paint((p) => (Math.abs(p.y - 1.2) > 0.8 ? MUSTARD : WOOD_D));
const HAY = grain(HAY_A, HAY_B, { size: 0.03, axis: "x", seed: 4 });
const GROUND = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  if (n.y < 0.5) return DIRT;
  if (r > 4.45) return mix(DIRT, DIRT_L, noise(p, 0.3, 2));
  if (Math.abs(p.x + (noise(p, 0.9, 5) - 0.5) * 0.6) < 1.5)
    return mix(DIRT_L, DIRT, noise(p, 0.18, 6));
  return mix(GRASS_A, GRASS_B, noise(p, 0.5, 3));
});

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "barnstormer" });
  const fus = b.joint("fuselage", { at: [0, 1.2, 0], role: "spine" });
  const prop = b.joint("prop", { parent: fus, at: [0, 1.2, 1.95], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: fus, at: [0, 1.3, -2.5], dir: [0, 1, 0], role: "hinge" });
  const elevator = b.joint("elevator", { parent: fus, at: [0, 1.3, -2.75], dir: [1, 0, 0], role: "hinge" });
  const ail: Record<string, any> = {};
  for (const s of [1, -1])
    ail[s] = b.joint(s > 0 ? "aileronL" : "aileronR", {
      parent: fus,
      at: [s * 2.85, 2.25, -0.28],
      dir: [s, 0, 0],
      role: "hinge",
    });

  const put = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: fus, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const rod = (a: any, c: any, r: number, color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone: fus, sides: 6, ...o });
  const ball = (r: number, color: any, at: number[], o: any = {}) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, o);

  // ---- fuselage
  const body = b.loft(
    [
      { at: [0, 1.35, -3.1], w: 0.08, h: 0.12 },
      { at: [0, 1.3, -2.2], w: 0.28, h: 0.38 },
      { at: [0, 1.22, -1.0], w: 0.62, h: 0.78 },
      { at: [0, 1.2, 0.2], w: 0.78, h: 0.86 },
      { at: [0, 1.2, 1.1], w: 0.86, h: 0.9 },
    ],
    { bone: fus, color: fusPaint },
  );

  // name lettering and roundels on the flanks
  for (const s of [1, -1]) {
    b.decal(body, NAME, { at: [s * 0.3, 1.18, -0.95], dir: [s, 0, 0], size: [0.95, 0.285], bone: fus });
    b.decal(body, STAR, { at: [s * 0.2, 1.22, -1.85], dir: [s, 0, 0], size: [0.3, 0.3], bone: fus });
  }

  // ---- engine cowl
  const cowl = b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.56, 0.12],
      [0.56, 0.7],
      [0.5, 0.88],
      [0.46, 0.92],
      [0, 0.92],
    ],
    { at: [0, 1.2, 0.9], axis: [0, 0, 1], segments: 14, color: COWL, bone: fus },
  );
  put(new THREE.CircleGeometry(0.44, 20), "#ffffff", [0, 1.2, 1.826], {
    dir: [0, 0, 1],
    axis: "z",
    texture: FACE,
    flat: false,
  });
  b.ring(frame([0, 1.2, 1.35], [0, 0, 1]), { count: 9, radius: 0.52 }, (it: any) =>
    b.stick(new THREE.CylinderGeometry(0.075, 0.085, 0.16, 6), IRON, it, { bone: fus }),
  );
  // exhaust pipes
  for (const s of [1, -1])
    b.sweep(
      [
        [s * 0.5, 1.05, 1.5],
        [s * 0.6, 0.98, 1.1],
        [s * 0.55, 0.95, 0.55],
        [s * 0.46, 1.0, 0.25],
      ],
      [0.055, 0.04],
      { color: IRON, bone: fus, sides: 6 },
    );

  // ---- propeller
  const a = 0.35;
  const tipPts = [
    [0.07, 1.05], [0.16, 0.82], [0.12, 0.2], [0.12, -0.2], [0.16, -0.82], [0.07, -1.05],
    [-0.07, -1.05], [-0.16, -0.82], [-0.12, -0.2], [-0.12, 0.2], [-0.16, 0.82], [-0.07, 1.05],
  ] as [number, number][];
  b.extrude(tipPts, {
    at: [0, 1.2, 1.95],
    x: [Math.cos(a), Math.sin(a), 0],
    y: [-Math.sin(a), Math.cos(a), 0],
    thickness: 0.04,
    bevel: 0.01,
    color: PROP,
    bone: prop,
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8), STEEL, { bone: prop, at: [0, 1.2, 1.89], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.17, 0.34, 10), RED, { bone: prop, at: [0, 1.2, 2.1], dir: [0, 0, 1], flat: true });
  b.part(new THREE.TorusGeometry(0.17, 0.02, 5, 12), MUSTARD, { bone: prop, at: [0, 1.2, 1.96], axis: "z", dir: [0, 0, 1] });

  // ---- wings
  const wing = (y: number, zc: number, half: number, chord: number, name: string) => {
    const c = chord / 2;
    const r = 0.35;
    b.extrude(
      [
        [-half + r, -c], [half - r, -c], [half, -c + r * 0.8], [half, c - r * 0.8],
        [half - r, c], [-half + r, c], [-half, c - r * 0.8], [-half, -c + r * 0.8],
      ],
      {
        at: [0, y, zc], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.03, smoothing: 1,
        color: wingPaint(zc, chord, half), bone: fus, name,
      },
    );
  };
  wing(2.25, 0.35, 3.85, 1.3, "wingUpper");
  wing(0.95, 0.1, 3.4, 1.15, "wingLower");

  for (const s of [1, -1]) {
    // roundels on wings
    put(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", [s * 2.3, 2.314, 0.35], {
      dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: STAR, flat: false,
    });
    put(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", [s * 2.2, 0.884, 0.1], {
      dir: [0, -1, 0], axis: "z", up: [0, 0, 1], texture: STAR, flat: false,
    });
    // ailerons
    b.extrude(
      [[-0.7, 0.02], [0.7, 0.02], [0.7, -0.26], [0.55, -0.34], [-0.7, -0.34]],
      { at: ail[s].at, x: [1, 0, 0], y: [0, 0, 1], thickness: 0.09, bevel: 0.02, color: RED, bone: ail[s] },
    );
    // nav lights (left red, right green)
    glow(ball(0.06, s > 0 ? "#ff3b3b" : "#3bff7a", [s * 3.88, 2.25, 0.35], { flat: false }), 1.6);
    // wingtip streamers
    b.sweep(
      [
        [s * 3.85, 2.25, 0.0], [s * 4.05, 2.32, -0.5], [s * 3.9, 2.2, -1.0],
        [s * 4.1, 2.3, -1.5], [s * 3.95, 2.2, -2.0],
      ],
      (t: number) => [0.045 * (1 - 0.6 * t), 0.01],
      { section: "box", color: stripes(MUSTARD, RED, { size: 0.12, axis: "z" }), caps: "point", bone: fus, up: [1, 0, 0] },
    );
  }

  // ---- struts and wires
  const WIRE = INKC;
  for (const s of [1, -1]) {
    for (const x of [1.4, 3.0]) {
      rod([s * x, 1.0, 0.45], [s * x, 2.22, 0.7], 0.04, WOOD);
      rod([s * x, 1.0, -0.2], [s * x, 2.22, 0.05], 0.04, WOOD);
    }
    for (const [zl, zu] of [[0.45, 0.7], [-0.2, 0.05]]) {
      rod([s * 1.4, 1.0, zl], [s * 3.0, 2.22, zu], 0.009, WIRE, { sides: 4 });
      rod([s * 3.0, 1.0, zl], [s * 1.4, 2.22, zu], 0.009, WIRE, { sides: 4 });
    }
    rod([s * 0.2, 1.0, 0.3], [s * 1.4, 2.2, 0.55], 0.009, WIRE, { sides: 4 });
    // cabane
    rod([s * 0.22, 1.5, 0.35], [s * 0.55, 2.22, 0.6], 0.04, WOOD);
    rod([s * 0.22, 1.5, -0.1], [s * 0.55, 2.22, 0.1], 0.04, WOOD);
  }

  // ---- tail
  b.extrude([[-1.85, 0], [-2.5, 0], [-2.5, 0.95], [-2.2, 0.95], [-1.9, 0.4]], {
    at: [0, 1.3, 0], thickness: 0.07, bevel: 0.015, color: TEAL, bone: fus, name: "fin",
  });
  b.extrude([[0, -0.1], [-0.45, -0.1], [-0.65, 0.15], [-0.62, 0.75], [-0.4, 1.0], [0, 0.95]], {
    at: [0, 1.3, -2.5], thickness: 0.06, bevel: 0.012, smoothing: 1, color: RED, bone: rudder,
  });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: rudder, at: [s * 0.036, 1.75, -2.8], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: STAR,
    });
  b.extrude([[-1.25, -0.3], [1.25, -0.3], [1.55, 0], [1.25, 0.3], [-1.25, 0.3], [-1.55, 0]], {
    at: [0, 1.3, -2.45], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.015, color: TEAL, bone: fus,
  });
  b.extrude([[-1.3, 0], [1.3, 0], [1.45, -0.2], [1.3, -0.4], [-1.3, -0.4], [-1.45, -0.2]], {
    at: [0, 1.3, -2.75], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.06, bevel: 0.012, color: RED, bone: elevator,
  });
  rod([0, 1.15, -2.5], [0, 0.14, -3.05], 0.035, IRON);
  ball(0.07, IRON, [0, 0.1, -3.07], { flat: false });
  // tail bracing wires
  for (const s of [1, -1]) rod([0, 2.2, -2.3], [s * 1.2, 1.32, -2.5], 0.008, WIRE, { sides: 4 });

  // ---- landing gear
  rod([-0.98, 0.45, 0.62], [0.98, 0.45, 0.62], 0.035, IRON);
  for (const s of [1, -1]) {
    const wx = s * 0.98, wy = 0.45, wz = 0.62;
    put(new THREE.TorusGeometry(0.3, 0.15, 8, 14), TIRE, [wx, wy, wz], { dir: [1, 0, 0], axis: "z" });
    put(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 12), CREAM_D, [wx, wy, wz], { dir: [1, 0, 0] });
    put(new THREE.PlaneGeometry(0.52, 0.52), "#ffffff", [wx + s * 0.135, wy, wz], {
      dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: WHEEL, flat: false,
    });
    const end = [s * 0.9, 0.45, 0.62];
    for (const [sx, sz] of [[0.3, 0.15], [0.3, 1.0]]) {
      const top = [s * sx, 0.88, sz];
      rod(top, end, 0.04, WOOD);
      rod(lerp(top as any, end as any, 0.35), lerp(top as any, end as any, 0.6), 0.058, MUSTARD);
    }
  }

  // ---- cockpit
  box(0.42, 0.05, 0.75, INKC, [0, 1.62, -0.55]);
  for (const s of [1, -1]) box(0.05, 0.08, 0.86, LEATHER_D, [s * 0.25, 1.64, -0.55]);
  box(0.55, 0.08, 0.05, LEATHER_D, [0, 1.64, -0.98]);
  box(0.55, 0.08, 0.05, LEATHER_D, [0, 1.64, -0.12]);
  box(0.5, 0.24, 0.03, "#9fe3e6", [0, 1.74, 0.1], { rotation: [-25, 0, 0] });
  box(0.56, 0.03, 0.04, STEEL, [0, 1.62, 0.1]);
  rod([0, 1.52, -0.3], [0, 1.74, -0.36], 0.018, IRON);
  ball(0.04, RED, [0, 1.76, -0.37], { flat: false });

  // ---- pilot
  b.capsule([0, 1.5, -0.55], [0, 1.76, -0.5], 0.2, LEATHER, { bone: fus, sides: 8 });
  const head = put(new THREE.SphereGeometry(0.22, 10, 8), SKIN, [0, 1.93, -0.46], { flat: false });
  b.decal(head, GOGGLES, { at: [0, 1.89, -0.24], dir: [0, 0, 1], size: [0.34, 0.17], bone: fus });
  ball(0.045, "#ee9a78", [0, 1.87, -0.235], { flat: false });
  put(new THREE.SphereGeometry(0.24, 10, 6, 0, Math.PI * 2, 0, 1.2), LEATHER_D, [0, 1.93, -0.46]);
  for (const s of [1, -1]) box(0.05, 0.14, 0.14, LEATHER_D, [s * 0.225, 1.9, -0.46]);
  box(0.03, 0.03, 0.4, LEATHER, [0, 2.16, -0.46]);
  put(new THREE.TorusGeometry(0.17, 0.05, 5, 10), MUSTARD, [0, 1.74, -0.5], { rotation: [90, 0, 0] });
  // scarf
  b.sweep(
    [[0, 1.8, -0.7], [0.12, 1.86, -1.0], [0.22, 1.82, -1.4], [0.4, 1.9, -1.8], [0.55, 1.84, -2.2]],
    (t: number) => [0.09 * (1 - 0.3 * t), 0.012],
    { section: "box", color: stripes(MUSTARD, RED, { size: 0.12, axis: "z" }), caps: "point", bone: fus, up: [1, 0, 0] },
  );
  b.sweep(
    [[0, 1.78, -0.68], [-0.1, 1.74, -0.95], [-0.25, 1.8, -1.25]],
    (t: number) => [0.08 * (1 - 0.3 * t), 0.012],
    { section: "box", color: stripes(RED, MUSTARD, { size: 0.1, axis: "z" }), caps: "point", bone: fus, up: [1, 0, 0] },
  );
  // arms: one waving, one on the stick
  b.capsule([0.2, 1.74, -0.55], [0.42, 1.98, -0.6], 0.075, LEATHER, { bone: fus, sides: 6 });
  b.capsule([0.42, 1.98, -0.6], [0.52, 2.2, -0.55], 0.065, LEATHER, { bone: fus, sides: 6 });
  ball(0.095, "#f3e2c2", [0.53, 2.26, -0.55], { flat: false });
  b.capsule([-0.2, 1.72, -0.55], [-0.12, 1.6, -0.33], 0.07, LEATHER, { bone: fus, sides: 6 });
  ball(0.08, "#f3e2c2", [-0.04, 1.65, -0.35], { flat: false });

  // ---- base
  b.lathe(
    [[0, 0], [4.7, 0], [4.85, 0.02], [4.8, 0.04], [0, 0.04]],
    { at: [0, 0, 0], segments: 28, color: GROUND, bone: fus, name: "ground" },
  );
  const r = rng(11);
  const tufts: any[] = [];
  while (tufts.length < 70) {
    const ang = r() * Math.PI * 2;
    const rad = 1.2 + r() * 3.5;
    const x = Math.sin(ang) * rad, z = Math.cos(ang) * rad;
    if (Math.abs(x) < 1.55) continue;
    tufts.push(frame([x, 0.04, z], [0, 1, 0]));
  }
  b.cards(tufts, TUFT, { size: [0.2, 0.24], vary: 0.3, rng: rng(5), cross: true, bone: fus });
  const bloomCols = ["#ff6fa0", "#ffe05a", "#ffffff", "#b58cff"];
  for (let i = 0; i < 12; i++) {
    const ang = r() * Math.PI * 2;
    const rad = 3.6 + r() * 0.8;
    const x = Math.sin(ang) * rad, z = Math.cos(ang) * rad;
    rod([x, 0.04, z], [x, 0.26, z], 0.012, GRASS_D, { sides: 4 });
    ball(0.055, bloomCols[i % 4], [x, 0.28, z], { flat: false });
    ball(0.02, MUSTARD, [x, 0.31, z], { flat: false });
  }

  // sign
  const yaw = -0.35;
  const sdir = [Math.sin(yaw), 0, Math.cos(yaw)];
  const tang = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const sp = [3.4, 0, 2.6];
  for (const k of [-0.65, 0.65])
    rod([sp[0] + tang[0] * k, 0.04, sp[2] + tang[2] * k], [sp[0] + tang[0] * k, 1.95, sp[2] + tang[2] * k], 0.05, WOOD);
  put(new THREE.BoxGeometry(1.5, 0.84, 0.06), WOOD, [sp[0], 1.45, sp[2]], { dir: sdir, axis: "z", up: [0, 1, 0] });
  put(new THREE.PlaneGeometry(1.4, 0.79), "#ffffff", [sp[0] + sdir[0] * 0.035, 1.45, sp[2] + sdir[2] * 0.035], {
    dir: sdir, axis: "z", up: [0, 1, 0], texture: SIGN, flat: false,
  });
  for (const k of [-0.65, 0.65]) ball(0.07, MUSTARD, [sp[0] + tang[0] * k, 1.99, sp[2] + tang[2] * k], { flat: false });
  // hanging lantern
  const lx = sp[0] + tang[0] * 0.65 + sdir[0] * 0.3, lz = sp[2] + tang[2] * 0.65 + sdir[2] * 0.3;
  rod([sp[0] + tang[0] * 0.65, 1.9, sp[2] + tang[2] * 0.65], [lx, 1.9, lz], 0.02, IRON, { sides: 4 });
  rod([lx, 1.9, lz], [lx, 1.78, lz], 0.01, IRON, { sides: 4 });
  glow(put(new THREE.SphereGeometry(0.1, 8, 6), "#ffcf5a", [lx, 1.68, lz]), 1.5);
  box(0.16, 0.03, 0.16, IRON, [lx, 1.79, lz]);

  // windsock
  rod([-3.5, 0.04, 2.7], [-3.5, 2.2, 2.7], 0.04, IRON);
  ball(0.07, RED, [-3.5, 2.24, 2.7], { flat: false });
  const wd = new THREE.Vector3(1, -0.12, -0.3).normalize();
  b.lathe([[0.22, 0], [0.06, 1.0], [0.045, 1.0], [0.205, 0]], {
    at: [-3.5, 2.1, 2.7], axis: [wd.x, wd.y, wd.z], segments: 10, bone: fus,
    color: stripes(CREAM, RED, { size: 0.2, axis: [wd.x, wd.y, wd.z], width: 0.5, wobble: 0 }),
  });

  // hay stack
  const hay = (x: number, y: number, z: number, rot: number) => {
    box(0.9, 0.45, 0.5, HAY, [x, y, z], { rotation: [0, rot, 0], flat: true });
    for (const k of [-0.2, 0.2])
      box(0.02 + 0.0, 0.47, 0.52, INKC, [x + Math.cos((rot * Math.PI) / 180) * k, y, z - Math.sin((rot * Math.PI) / 180) * k], {
        rotation: [0, rot, 0],
      });
  };
  hay(3.4, 0.265, -2.2, 12);
  hay(3.3, 0.265, -2.85, -8);
  hay(3.38, 0.715, -2.5, 4);

  // fuel drums
  for (const [x, z] of [[-3.3, -2.1], [-3.75, -1.6]]) {
    put(new THREE.CylinderGeometry(0.27, 0.27, 0.64, 10), RED_D, [x, 0.36, z]);
    for (const dy of [-0.2, 0.2]) put(new THREE.CylinderGeometry(0.285, 0.285, 0.05, 10), IRON, [x, 0.36 + dy, z]);
    put(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), MUSTARD, [x, 0.69, z]);
  }
  // little fuel can
  box(0.22, 0.3, 0.12, MUSTARD, [-2.9, 0.19, -2.4]);
  box(0.08, 0.06, 0.08, IRON, [-2.9, 0.37, -2.4]);

  // wheel chocks
  for (const s of [1, -1])
    b.extrude([[0, 0], [0.3, 0], [0, 0.14]], { at: [s * 0.98, 0.04, 1.15], thickness: 0.14, color: WOOD, bone: fus });

  return b.root;
}
```