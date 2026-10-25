import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, countershade, stripes, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler KV-7",
  description:
    "Low-poly cyberpunk armoured convoy hauler: six-wheel armoured tractor with roof turret, neon trim and a sealed, glowing cargo pod on the bed.",
};

type V = [number, number, number];

// ---------- palette ----------
const NEON_C = "#19f2ff";
const NEON_M = "#ff2bd6";
const AMBER = "#ffb02e";
const RED = "#ff2a3c";
const WHITE_L = "#fff6d8";
const DARK = "#12141b";
const STEEL = "#4a5566";
const RUBBER = "#17181d";

// ---------- paints ----------
const HULL = paint((p, n) => {
  const base = mix("#2e3745", "#566379", smoothstep(-0.4, 0.9, n.y));
  const dust = smoothstep(1.3, 0.55, p.y) * 0.55;
  const scratch = smoothstep(0.62, 0.8, noise(p, 0.09, 4)) * 0.3;
  let c = mix(base, "#6b5a45", dust * smoothstep(0.35, 0.7, noise(p, 0.3, 2)));
  c = mix(c, "#9aa6b8", scratch);
  return c;
});
const PODP = paint((p, n) => {
  const base = mix("#222a36", "#3e4a5c", smoothstep(-0.5, 0.9, n.y));
  const seamZ = Math.abs(((p.z + 40) % 0.95) - 0.475) > 0.455 ? 0.7 : 0;
  const grime = smoothstep(0.5, 0.8, noise(p, 0.25, 8)) * 0.35;
  let c = mix(base, "#0a0d12", seamZ);
  c = mix(c, "#6b5a45", grime * smoothstep(3.0, 1.4, p.y));
  return c;
});
const HAZARD = stripes("#15171c", "#f2c21a", { size: 0.2, axis: [0.7, 0, 0.7], width: 0.5, wobble: 0 });
const TIRE = paint((p) => mix("#1a1b20", "#2b2c33", noise(p, 0.12, 3)));
const METAL = countershade("#8b97ab", "#3b4352");
const ARMOR = paint((p, n) => mix(mix("#252c38", "#3b4658", n.y * 0.5 + 0.5), "#c9d3e3", smoothstep(0.7, 0.85, noise(p, 0.07, 6)) * 0.25));

// ---------- textures ----------
const WINDSHIELD = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b5e78"/><stop offset="1" stop-color="#06121c"/></linearGradient></defs>
  <rect width="100" height="40" fill="#0a0f16"/><rect x="2" y="2" width="96" height="36" fill="url(#g)"/>
  <path d="M10 38 L30 2 L40 2 L20 38Z M52 38 L72 2 L78 2 L58 38Z" fill="#7fe8ff" opacity="0.18"/>
  <path d="M6 30 H30 M70 8 H94 M70 12 H88" stroke="#19f2ff" stroke-width="0.8" opacity="0.8"/>
  <circle cx="82" cy="28" r="6" fill="none" stroke="#ff2bd6" stroke-width="0.8"/><path d="M82 22v12M76 28h12" stroke="#ff2bd6" stroke-width="0.5"/>
  <rect x="49" y="2" width="2" height="36" fill="#0a0f16"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="50" rx="4" fill="#0a0f16"/>
  <rect x="3" y="3" width="94" height="44" rx="3" fill="#124a62"/><path d="M10 47 L35 3 H48 L23 47Z" fill="#8ff0ff" opacity="0.2"/>
  <path d="M60 10 H92" stroke="#19f2ff" stroke-width="1.4" opacity="0.6"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="#0b0d12"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="6" y="${4 + i * 6}" width="88" height="3.2" fill="#2d3646"/><rect x="6" y="${4 + i * 6}" width="88" height="0.9" fill="#5b6a85"/>`).join("")}
  <path d="M50 4 L58 20 L50 36 L42 20Z" fill="#0b0d12" stroke="#ff2bd6" stroke-width="1.6"/><circle cx="50" cy="20" r="3" fill="#ff2bd6"/>
  <rect x="6" y="37" width="88" height="1.6" fill="#19f2ff"/></svg>`,
  { size: 256 },
);
const CABLOGO = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0H120V6H0Z M0 34H120V40H0Z" fill="#f2c21a"/>
  <path d="M12 8 L28 8 L36 20 L28 32 L12 32 L4 20Z" fill="none" stroke="#19f2ff" stroke-width="2.4"/><path d="M14 20 H26 M20 14 V26" stroke="#ff2bd6" stroke-width="2.4"/>
  <text x="44" y="20" font-family="monospace" font-weight="bold" font-size="12" fill="#e9f3ff">CONVOY</text>
  <text x="44" y="32" font-family="monospace" font-weight="bold" font-size="11" fill="#ffb02e">UNIT 07</text></svg>`,
  { size: 256 },
);
const PODLOGO = svg(
  `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="216" height="96" rx="6" fill="none" stroke="#19f2ff" stroke-width="3"/>
  <path d="M2 2H70L50 14H2Z M218 98H150L170 86H218Z" fill="#f2c21a"/>
  <path d="M52 22 L84 22 L100 50 L84 78 L52 78 L36 50Z" fill="#0a0d12" stroke="#19f2ff" stroke-width="4"/>
  <path d="M60 36 L76 36 L84 50 L76 64 L60 64 L52 50Z" fill="#ff2bd6"/><circle cx="68" cy="50" r="6" fill="#0a0d12"/>
  <text x="112" y="46" font-family="monospace" font-weight="bold" font-size="22" fill="#e9f3ff">KURO·VAULT</text>
  <text x="112" y="64" font-family="monospace" font-size="11" fill="#19f2ff">SEALED // CLASS-9 BIO</text>
  <text x="112" y="80" font-family="monospace" font-size="10" fill="#ff2a3c">DO NOT BREACH</text>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${150 + i * 4}" y="86" width="${i % 3 ? 1.5 : 2.6}" height="8" fill="#e9f3ff"/>`).join("")}
  </svg>`,
  { size: 512 },
);
const PODDOOR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#10141c" stroke="#f2c21a" stroke-width="5"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="#19f2ff" stroke-width="3"/>
  ${[0, 60, 120].map((a) => `<rect x="47" y="14" width="6" height="72" fill="#5b6a85" transform="rotate(${a} 50 50)"/>`).join("")}
  <circle cx="50" cy="50" r="8" fill="#ff2a3c"/>
  <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#ff2bd6" stroke-width="1.5" stroke-dasharray="3 3"/></svg>`,
  { size: 256 },
);
const TAIL = svg(
  `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="20" fill="#3a0008"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${3 + i * 19.5}" y="3" width="15" height="14" fill="#ff2a3c"/>`).join("")}</svg>`,
  { size: 128 },
);

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const box = (size: V, color: any, at: V, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, flat: true, ...extra });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, str = 0, extra: any = {}) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...extra });
    if (str > 0) glow(part, str);
    return part;
  };

  // ---------- chassis ----------
  box([2.4, 0.35, 8.2], ARMOR, [0, 0.95, -0.2]);
  box([2.0, 0.2, 7.8], DARK, [0, 0.72, -0.2]);
  for (const z of [2.5, -1.2, -2.7]) cyl(0.12, 0.12, 3.2, 8, METAL, [0, 0.72, z], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    glow(box([0.05, 0.05, 7.2], NEON_M, [s * 0.95, 0.7, -0.2]), 1.4);
  }

  // ---------- wheels ----------
  const R = 0.68;
  const wheel = (x: number, z: number) => {
    const s = Math.sign(x);
    cyl(R, R, 0.55, 12, paint(TIRE.at.bind(TIRE) as any) && TIRE, [x, 0.72, z], { rotation: [0, 0, 90] });
    cyl(0.44, 0.44, 0.6, 8, METAL, [x, 0.72, z], { rotation: [0, 0, 90] });
    glow(cyl(0.24, 0.24, 0.05, 10, NEON_C, [x + s * 0.31, 0.72, z], { rotation: [0, 0, 90] }), 1.3);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.03, 0.03, 0.06, 5, "#d8e0ee", [x + s * 0.31, 0.72 + Math.sin(a) * 0.35, z + Math.cos(a) * 0.35], {
        rotation: [0, 0, 90],
      });
    }
    // tread cleats
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      box([0.58, 0.1, 0.2], RUBBER, [x, 0.72 + Math.sin(a) * (R + 0.01), z + Math.cos(a) * (R + 0.01)], {
        rotation: [90 - (a * 180) / Math.PI, 0, 0],
      });
    }
  };
  for (const s of [1, -1]) for (const z of [2.5, -1.2, -2.7]) wheel(s * 1.4, z);

  // fenders over rear wheels
  for (const s of [1, -1])
    for (const z of [-1.2, -2.7]) {
      box([0.85, 0.1, 1.6], HULL, [s * 1.4, 1.58, z]);
      box([0.85, 0.1, 0.5], HULL, [s * 1.4, 1.42, z + 0.95], { rotation: [-30, 0, 0] });
      box([0.85, 0.1, 0.5], HULL, [s * 1.4, 1.42, z - 0.95], { rotation: [30, 0, 0] });
      glow(box([0.04, 0.04, 1.6], NEON_C, [s * 1.82, 1.6, z]), 1.2);
      box([0.04, 0.2, 1.6], HULL, [s * 1.82, 1.5, z]);
    }
  // front fender flares
  for (const s of [1, -1]) box([0.5, 0.12, 1.6], HULL, [s * 1.66, 1.5, 2.5]);

  // armour skirts and mud flaps
  for (const s of [1, -1]) {
    box([0.12, 0.75, 2.1], ARMOR, [s * 1.3, 1.05, 0.65]);
    box([0.04, 0.5, 1.7], HAZARD, [s * 1.37, 1.05, 0.65]);
    glow(box([0.04, 0.04, 2.1], NEON_C, [s * 1.38, 0.7, 0.65]), 1.4);
    box([0.1, 0.6, 0.7], RUBBER, [s * 1.4, 0.85, -3.55]);
  }

  // ---------- cab ----------
  b.extrude(
    [[-1.1, 0], [1.1, 0], [1.1, 0.7], [0.6, 1.5], [-0.8, 1.5], [-1.1, 1.2]],
    { at: [0, 1.2, 3.1], x: [0, 0, 1], thickness: 2.4, bevel: 0.05, color: HULL },
  );
  plane(2.2, 0.94, WINDSHIELD, [0, 2.325, 3.966], [0, 0.848, 0.53], 0.7);
  for (const s of [1, -1]) {
    plane(1.0, 0.5, SIDEWIN, [s * 1.215, 2.3, 3.25], [s, 0, 0], 0.5);
    plane(1.2, 0.4, CABLOGO, [s * 1.215, 1.7, 3.0], [s, 0, 0], 0.35);
    // door handle and step
    box([0.05, 0.05, 0.3], "#d8e0ee", [s * 1.22, 1.95, 2.55]);
    box([0.3, 0.06, 0.9], STEEL, [s * 1.3, 1.05, 3.4]);
  }
  // cab front: grille + headlights + armour brow
  plane(1.5, 0.6, GRILLE, [0, 1.55, 4.215], [0, 0, 1], 0.2);
  for (const s of [1, -1]) {
    glow(box([0.5, 0.2, 0.06], WHITE_L, [s * 0.98, 1.6, 4.22]), 1.8);
    glow(box([0.5, 0.04, 0.06], AMBER, [s * 0.98, 1.43, 4.22]), 1.5);
    box([0.6, 0.06, 0.1], DARK, [s * 0.98, 1.74, 4.24]);
  }
  box([2.5, 0.12, 0.2], ARMOR, [0, 1.95, 4.2]);
  // bumper / plow
  b.frustumBox([0, 0.95, 4.2], [0, 0.9, 4.8], [2.7, 0.7], [2.1, 0.4], { color: HAZARD });
  for (let i = -3; i <= 3; i++) b.spike([i * 0.32, 0.95, 4.78], [0, 0, 1], 0.2, 0.06, { color: STEEL });
  glow(box([1.6, 0.04, 0.04], NEON_M, [0, 0.65, 4.7]), 1.6);

  // roof: light bar, antennas, dish, exhausts
  box([1.7, 0.1, 0.35], DARK, [0, 2.78, 3.55]);
  for (let i = 0; i < 6; i++)
    glow(box([0.24, 0.12, 0.3], i < 3 ? RED : NEON_C, [-0.72 + i * 0.29, 2.88, 3.55]), 1.8);
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 2.7, 2.35], [s * 1.0 + s * 0.05, 4.1 - (s > 0 ? 0 : 0.4), 2.35], 0.02, "#c8d2e4");
    glow(cyl(0.05, 0.05, 0.1, 6, s > 0 ? RED : NEON_M, [s * 1.05, s > 0 ? 4.15 : 3.75, 2.35]), 2);
    // exhaust stack behind cab
    cyl(0.14, 0.14, 1.9, 8, METAL, [s * 1.12, 2.65, 1.85]);
    cyl(0.18, 0.18, 0.12, 8, DARK, [s * 1.12, 3.62, 1.85]);
    box([0.05, 0.6, 0.05], STEEL, [s * 1.12, 2.0, 1.95]);
  }
  b.lathe([[0, 0], [0.34, 0.0], [0.3, 0.06], [0.0, 0.14]], {
    at: [0.5, 2.8, 2.5], axis: [0.2, 0.7, 0.6], color: "#c8d2e4", segments: 8,
  });
  b.rod([0.5, 2.78, 2.5], [0.55, 2.98, 2.65], 0.02, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), NEON_C, { at: [0.57, 3.02, 2.7] }), 2);

  // ---------- turret ----------
  const turret = (at: V, sc: number, d: 1 | -1) => {
    const [x, y, z] = at;
    cyl(0.4 * sc, 0.46 * sc, 0.2 * sc, 8, ARMOR, [x, y + 0.1 * sc, z]);
    box([0.75 * sc, 0.4 * sc, 0.8 * sc], HULL, [x, y + 0.4 * sc, z]);
    box([0.9 * sc, 0.14 * sc, 0.5 * sc], ARMOR, [x, y + 0.65 * sc, z - d * 0.05 * sc]);
    for (const s of [1, -1]) {
      b.rod([x + s * 0.2 * sc, y + 0.4 * sc, z + d * 0.4 * sc], [x + s * 0.2 * sc, y + 0.4 * sc, z + d * 1.3 * sc], 0.06 * sc, STEEL);
      cyl(0.09 * sc, 0.09 * sc, 0.22 * sc, 6, DARK, [x + s * 0.2 * sc, y + 0.4 * sc, z + d * 0.75 * sc], { rotation: [90, 0, 0] });
      glow(cyl(0.05 * sc, 0.05 * sc, 0.04, 6, NEON_M, [x + s * 0.2 * sc, y + 0.4 * sc, z + d * 1.31 * sc], { rotation: [90, 0, 0] }), 1.8);
    }
    glow(box([0.2 * sc, 0.08 * sc, 0.06], RED, [x, y + 0.5 * sc, z + d * 0.41 * sc]), 2);
  };
  turret([0, 2.7, 2.7], 1.0, 1);
  turret([0, 3.5, -3.4], 0.8, -1);

  // ---------- bed + cargo pod ----------
  box([2.5, 0.2, 4.6], ARMOR, [0, 1.25, -2.0]);
  box([2.5, 0.06, 4.6], HAZARD, [0, 1.13, -2.0]);
  for (const s of [1, -1]) {
    box([0.12, 0.35, 4.6], ARMOR, [s * 1.22, 1.45, -2.0]);
    for (let i = 0; i < 3; i++) glow(box([0.04, 0.08, 0.3], AMBER, [s * 1.29, 1.5, -0.6 - i * 1.4]), 1.4);
  }
  for (const z of [-0.5, -1.9, -3.3])
    for (const s of [1, -1]) box([0.2, 0.7, 0.45], ARMOR, [s * 0.95, 1.65, z], { rotation: [0, 0, -s * 35] });

  const PC: V = [0, 2.5, -1.9];
  const pod = b.lathe(
    [[0, -2.3], [0.85, -2.3], [1.15, -1.9], [1.15, 1.9], [0.85, 2.3], [0, 2.3]],
    { at: PC, axis: [0, 0, 1], segments: 12, color: PODP },
  );
  for (const dz of [-1.4, 0, 1.4])
    b.lathe([[1.1, -0.1], [1.26, -0.1], [1.26, 0.1], [1.1, 0.1]], {
      at: [0, PC[1], PC[2] + dz], axis: [0, 0, 1], segments: 12, color: METAL,
    });
  const skin = b.surface(pod);
  const strips: [number, number][] = [[0, 90], [90, 55], [-90, 55], [90, -55], [-90, -55]];
  for (const [az, el] of strips) {
    const h = skin.around(PC).at(az, el);
    if (h) glow(b.stick(new THREE.BoxGeometry(0.09, 0.04, 3.5), NEON_C, h, { flow: [0, 0, 1], embed: 0.3 }), 1.5);
  }
  for (const s of [1, -1]) {
    b.decal(skin, PODLOGO, { at: [s * 1.12, PC[1], PC[2] + 0.1], dir: [s, 0, 0], size: [2.4, 1.1], mirror: false });
  }
  b.decal(skin, PODDOOR, { at: [0, PC[1], -4.2], dir: [0, 0, -1], size: [1.2, 1.2] });
  // top beacon and lock boxes
  glow(cyl(0.12, 0.16, 0.18, 8, NEON_M, [0, 3.7, -0.5]), 2);
  box([0.5, 0.1, 0.5], DARK, [0, 3.62, -0.5]);
  for (const z of [-3.2, -2.6]) box([0.4, 0.14, 0.3], ARMOR, [0, 3.66, z]);
  // pod rear lock lamps
  for (const s of [1, -1]) glow(box([0.12, 0.12, 0.05], RED, [s * 0.65, PC[1] + 0.5, -4.22]), 2);

  // ---------- rear ----------
  box([2.5, 0.35, 0.3], HAZARD, [0, 1.0, -4.35]);
  plane(2.2, 0.22, TAIL, [0, 1.2, -4.52], [0, 0, -1], 1.2);
  box([0.5, 0.5, 0.5], DARK, [0.6, 0.78, -4.45]);
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 0.5, 6, STEEL, [s * 1.0, 0.95, -4.5], { rotation: [90, 0, 0] });
    glow(box([0.2, 0.12, 0.04], AMBER, [s * 1.15, 1.35, -4.35]), 1.5);
  }

  return b.root;
}
