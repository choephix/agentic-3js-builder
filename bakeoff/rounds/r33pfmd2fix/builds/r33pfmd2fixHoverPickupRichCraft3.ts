import * as THREE from "three";
import { createBuilder, mix, noise, paint, patches, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup truck converted to four ducted hover thrusters, with camo armor, a roof-mounted twin gun, a bed rocket launcher and neon underglow, in a low-poly cyberpunk style.",
};

// ---------- palette ----------
const CYAN = "#25f0ff";
const MAGENTA = "#ff2e88";
const YELLOW = "#f5c400";
const DARK = "#14161c";
const STEEL = "#2a2e38";
const PLATE = "#3b4250";
const RED = "#ff3350";
const WHITE_HOT = "#bff8ff";

// ---------- textures ----------
const WINDOW = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b2a3c"/><stop offset="1" stop-color="#06101c"/></linearGradient></defs>
  <polygon points="8,0 92,0 100,40 0,40" fill="url(#g)" stroke="#05080d" stroke-width="3"/>
  <polygon points="20,2 34,2 18,38 4,38" fill="#25f0ff" opacity="0.28"/>
  <polygon points="40,2 46,2 30,38 24,38" fill="#25f0ff" opacity="0.18"/>
  <path d="M60 30 H90 M60 25 H80" stroke="#ff2e88" stroke-width="1.6" opacity="0.8"/>
  <rect x="55" y="0" width="3" height="40" fill="#05080d"/>
</svg>`,
  { size: 256 },
);

const HAZARD = svg(
  `<svg viewBox="0 0 64 4" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="4" fill="#17171a"/>
  ${Array.from({ length: 16 }, (_, i) => `<polygon points="${i * 4},4 ${i * 4 + 2},4 ${i * 4 + 4},0 ${i * 4 + 2},0" fill="#f5c400"/>`).join("")}
</svg>`,
  { size: 512 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#0d1017" stroke="#ff2e88" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="#25f0ff" stroke-width="2.5"/>
  <path d="M30 40 L50 28 L70 40 L70 52 L50 74 L30 52 Z" fill="#ff2e88"/>
  <rect x="36" y="42" width="10" height="8" fill="#0d1017"/><rect x="54" y="42" width="10" height="8" fill="#0d1017"/>
  <path d="M44 62 H56 M47 58 V66 M53 58 V66" stroke="#0d1017" stroke-width="3"/>
  <path d="M12 50 H22 M78 50 H88" stroke="#f5c400" stroke-width="4"/>
</svg>`,
  { size: 256 },
);

const DOORTAG = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="96" height="56" rx="6" fill="#0d1017" stroke="#25f0ff" stroke-width="3"/>
  <text x="14" y="42" font-family="monospace" font-weight="bold" font-size="38" fill="#f5c400">07</text>
  <rect x="62" y="12" width="28" height="28" fill="none" stroke="#ff2e88" stroke-width="3"/>
  <path d="M66 20 H86 M66 26 H86 M76 14 V38 M66 34 H86" stroke="#ff2e88" stroke-width="2.5"/>
  <path d="M8 52 H92" stroke="#f5c400" stroke-width="2" stroke-dasharray="6 3"/>
</svg>`,
  { size: 256 },
);

const FAN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="c"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#25f0ff"/><stop offset="1" stop-color="#0a4a66"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#c)"/>
  ${Array.from({ length: 9 }, (_, i) => `<path transform="rotate(${i * 40} 50 50)" d="M50 50 Q64 30 56 3 Q42 26 50 50Z" fill="#06141c" opacity="0.85"/>`).join("")}
  <circle cx="50" cy="50" r="11" fill="#0a1a22" stroke="#bff8ff" stroke-width="2"/>
  <circle cx="50" cy="50" r="48" fill="none" stroke="#0a1a22" stroke-width="3"/>
</svg>`,
  { size: 256 },
);

const FANTOP = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="49" fill="#15181f"/>
  ${Array.from({ length: 9 }, (_, i) => `<path transform="rotate(${i * 40} 50 50)" d="M50 50 Q64 30 56 3 Q42 26 50 50Z" fill="#2c323e" stroke="#0a0c10" stroke-width="1.5"/>`).join("")}
  <circle cx="50" cy="50" r="12" fill="#3b4250" stroke="#ff2e88" stroke-width="3"/></svg>`,
  { size: 128 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="#0b0d12"/>
  ${[5, 13, 21, 29].map((y) => `<rect x="6" y="${y}" width="88" height="4" fill="#25f0ff" opacity="0.85"/>`).join("")}
  <rect x="46" y="0" width="8" height="40" fill="#14161c"/></svg>`,
  { size: 256 },
);

const WARNING = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="#14161c"/>
  <rect x="2" y="2" width="96" height="36" fill="none" stroke="#f5c400" stroke-width="2.5"/>
  <polygon points="14,8 26,30 2,30" transform="translate(6 0)" fill="#f5c400"/>
  <text x="38" y="19" font-family="monospace" font-weight="bold" font-size="10" fill="#f5c400">WARNING</text>
  <text x="38" y="31" font-family="monospace" font-size="7.5" fill="#ff2e88">PLASMA EXHAUST</text></svg>`,
  { size: 256 },
);

// ---------- paints ----------
const CAMO = patches("#2b3a36", ["#222a2c", "#3b4b3f", "#1a1f24", "#2f3b45"], { size: 0.42, gap: 0.02, seed: 3 });
const HULLP = paint((p, n) => {
  if (p.y < 0.72) return mix("#101217", "#2b2d33", noise(p, 0.14, 2));
  if (p.y < 0.95 && noise(p, 0.3, 8) > 0.55) return mix("#2a2a26", "#4a4538", noise(p, 0.1, 4));
  if (n.y > 0.8) return "#49594d";
  return CAMO;
});
const ARMOR = paint((p, n) => {
  const g = noise(p, 0.2, 11);
  const base = mix("#2a2e38", "#3d4554", g);
  return n.y > 0.7 ? mix(base, "#5a6577", 0.4) : base;
});

// ---------- builder ----------
const b = createBuilder({ name: "hoverTechnical" });

type V = [number, number, number];
const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
  b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
const cyl = (r: number, h: number, color: any, at: V, dir: V = [0, 1, 0], seg = 8) =>
  b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });
const plane = (w: number, h: number, tex: any, at: V, dir: V, up?: V) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

export default function build() {
  // ===== hull (side profile drawn in z,y) =====
  b.extrude(
    [
      [-2.8, 0.5],
      [2.6, 0.5],
      [2.95, 0.8],
      [2.9, 1.2],
      [1.3, 1.35],
      [-0.4, 1.35],
      [-0.4, 1.1],
      [-2.8, 1.1],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.05, color: HULLP },
  );
  // cab
  b.extrude(
    [
      [-0.4, 1.3],
      [1.35, 1.3],
      [0.75, 1.95],
      [-0.35, 1.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.85, bevel: 0.04, color: HULLP },
  );
  // roof plate and rails
  box(1.95, 0.06, 1.25, ARMOR, [0, 1.98, 0.12]);
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 2.03, -0.45], [s * 0.8, 2.03, 0.65], 0.025, STEEL);
    box(0.06, 0.08, 0.06, STEEL, [s * 0.8, 2.01, -0.45]);
    box(0.06, 0.08, 0.06, STEEL, [s * 0.8, 2.01, 0.65]);
  }

  // glass
  for (const s of [1, -1]) {
    plane(1.15, 0.46, WINDOW, [s * 0.935, 1.64, 0.4], [s, 0, 0]);
    // door armor + tag
    box(0.06, 0.62, 1.05, ARMOR, [s * 1.03, 0.95, 0.55]);
    plane(0.5, 0.3, DOORTAG, [s * 1.065, 0.98, 0.55], [s, 0, 0]);
    box(0.08, 0.12, 2.8, "#ffffff", [s * 1.03, 0.6, 0.15], { texture: HAZARD });
    // fender / skirt armor
    box(0.07, 0.34, 1.0, PLATE, [s * 1.03, 0.82, 1.95]);
    box(0.07, 0.34, 1.0, PLATE, [s * 1.03, 0.82, -1.65]);
    // mirrors
    b.rod([s * 0.96, 1.5, 1.0], [s * 1.2, 1.55, 1.05], 0.02, DARK);
    box(0.06, 0.2, 0.16, STEEL, [s * 1.22, 1.56, 1.05]);
    glow(box(0.02, 0.1, 0.1, CYAN, [s * 1.255, 1.56, 1.05]), 1.2);
  }
  // windshield
  plane(1.6, 0.6, WINDOW, [0, 1.625, 1.06], [0, 0.6, 0.65]);
  plane(1.2, 0.42, WINDOW, [0, 1.66, -0.36], [0, 0, -1]);
  // cab roof armor visor over windshield
  box(1.9, 0.05, 0.22, ARMOR, [0, 2.0, 0.78], { rotation: [-8, 0, 0] });

  // ===== hood =====
  plane(1.0, 1.0, EMBLEM, [0, 1.296, 2.0], [0, 1, 0.094], [0, 0, 1]);
  for (const s of [1, -1])
    for (const z of [1.55, 1.7, 1.85]) {
      glow(box(0.4, 0.02, 0.05, MAGENTA, [s * 0.58, 1.34 - 0.094 * (z - 1.3) + 0.0, z], { rotation: [5.4, 0, 0] }), 1.4);
    }
  box(0.12, 0.05, 1.5, ARMOR, [0, 1.35 - 0.094 * 0.9 + 0.02, 2.05], { rotation: [5.4, 0, 0] });

  // ===== front fascia =====
  box(1.5, 0.45, 0.06, "#ffffff", [0, 0.98, 2.96], { texture: GRILLE });
  for (const s of [1, -1]) {
    glow(box(0.42, 0.14, 0.07, WHITE_HOT, [s * 0.82, 1.05, 2.93]), 1.6);
    box(0.5, 0.05, 0.1, DARK, [s * 0.82, 1.15, 2.92]);
    glow(box(0.1, 0.1, 0.07, MAGENTA, [s * 0.58, 0.88, 2.97]), 1.3);
  }
  // bull bar / plow
  box(2.2, 0.3, 0.22, ARMOR, [0, 0.66, 3.03]);
  glow(box(1.9, 0.04, 0.05, MAGENTA, [0, 0.75, 3.15]), 1.5);
  for (let i = -3; i <= 3; i++)
    b.part(new THREE.ConeGeometry(0.07, 0.3, 5), PLATE, { at: [i * 0.28, 0.62, 3.25], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 0.55, 3.0], [s * 0.95, 1.1, 2.7], 0.05, STEEL);
  }

  // ===== rear =====
  plane(0.9, 0.36, WARNING, [0, 1.0, -2.83], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.12, 0.06, RED, [s * 0.75, 1.02, -2.82]), 1.4);
    // rear thruster bell
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.2, 0.35],
        [0.15, 0.35],
        [0, 0.15],
      ],
      { at: [s * 0.62, 0.78, -2.8], axis: [0, 0, -1], segments: 8, color: STEEL },
    );
    glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [s * 0.62, 0.78, -3.1] }), 2);
  }
  box(2.0, 0.1, 0.12, ARMOR, [0, 0.58, -2.85]);

  // ===== bed =====
  for (const s of [1, -1]) {
    box(0.1, 0.45, 2.4, ARMOR, [s * 0.95, 1.33, -1.6]);
    glow(box(0.04, 0.03, 2.4, CYAN, [s * 0.95, 1.575, -1.6]), 1.2);
    // headache rack posts
    b.rod([s * 0.85, 1.1, -0.55], [s * 0.85, 2.0, -0.55], 0.045, STEEL);
  }
  box(1.9, 0.45, 0.1, ARMOR, [0, 1.33, -2.75]);
  box(1.9, 0.5, 0.08, PLATE, [0, 1.35, -0.43]);
  b.rod([-0.85, 2.0, -0.55], [0.85, 2.0, -0.55], 0.045, STEEL);
  b.rod([-0.85, 1.55, -0.55], [0.85, 1.55, -0.55], 0.03, STEEL);
  // power cells
  for (const x of [-0.4, 0.4]) {
    cyl(0.17, 0.7, PLATE, [x, 1.35, -0.95], [1, 0, 0] as V, 8).mesh;
  }
  for (const z of [-0.95]) glow(box(0.72, 0.1, 0.1, CYAN, [0, 1.5, z + 0.17]), 1.4);
  // rocket launcher
  const D = new THREE.Vector3(0, 0.42, 0.9).normalize();
  const U = new THREE.Vector3(0, 0.9, -0.42).normalize();
  const C = new THREE.Vector3(0, 1.55, -1.95);
  box(0.98, 0.66, 0.9, ARMOR, C.clone().addScaledVector(D, -0.25).toArray() as V, { rotation: [-25, 0, 0] });
  for (let i = -1; i <= 1; i++)
    for (let j = 0; j <= 1; j++) {
      const c = C.clone().add(new THREE.Vector3(i * 0.28, 0, 0)).addScaledVector(U, (j - 0.5) * 0.28);
      b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 8), DARK, { at: c.clone().addScaledVector(D, 0.2).toArray() as V, dir: D.toArray() as V });
      b.part(new THREE.ConeGeometry(0.085, 0.22, 6), RED, { at: c.clone().addScaledVector(D, 0.42).toArray() as V, dir: D.toArray() as V });
    }
  for (const s of [1, -1]) b.rod([s * 0.4, 1.1, -2.1], [s * 0.4, 1.4, -1.85], 0.04, STEEL);

  // ===== roof turret =====
  b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.3, 0.08],
      [0.2, 0.12],
      [0, 0.12],
    ],
    { at: [0, 2.0, 0.15], segments: 10, color: STEEL },
  );
  cyl(0.14, 0.2, PLATE, [0, 2.2, 0.15], [0, 1, 0], 8);
  box(0.58, 0.34, 0.7, ARMOR, [0, 2.4, 0.15]);
  box(0.62, 0.06, 0.5, PLATE, [0, 2.6, 0.12]);
  for (const s of [1, -1]) {
    b.rod([s * 0.15, 2.4, 0.4], [s * 0.15, 2.4, 1.6], 0.05, DARK);
    b.rod([s * 0.15, 2.4, 1.4], [s * 0.15, 2.4, 1.78], 0.075, STEEL);
    glow(box(0.04, 0.04, 0.06, CYAN, [s * 0.15, 2.4, 1.8]), 2);
    cyl(0.14, 0.2, PLATE, [s * 0.4, 2.35, 0.0], [1, 0, 0], 8);
    box(0.1, 0.1, 0.5, STEEL, [s * 0.15, 2.4, 0.55]);
  }
  // gun shield
  b.extrude(
    [
      [-0.45, 0],
      [0.45, 0],
      [0.38, 0.5],
      [-0.38, 0.5],
    ],
    { at: [0, 2.15, 0.55], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: ARMOR },
  );

  box(0.4, 0.03, 0.1, "#ffffff", [0, 2.3, 0.58], { texture: HAZARD });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0, 2.6, 0.45] }), 2);

  // roof light bar + antennas + dome
  glow(box(0.7, 0.07, 0.1, MAGENTA, [-0.4, 2.05, -0.38]), 1.6);
  glow(box(0.7, 0.07, 0.1, CYAN, [0.4, 2.05, -0.38]), 1.6);
  for (const [s, h] of [[1, 0.95], [-1, 0.6]] as const) {
    b.rod([s * 0.8, 2.0, -0.2], [s * 0.85, 2.0 + h, -0.3], [0.025, 0.01], DARK);
    glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), s > 0 ? RED : CYAN, { at: [s * 0.85, 2.0 + h, -0.3] }), 2);
  }
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.19, 0.08],
      [0.1, 0.17],
      [0, 0.2],
    ],
    { at: [0, 2.01, -0.05], segments: 8, color: PLATE },
  );

  // ===== underglow & sills =====
  for (const s of [1, -1]) glow(box(0.05, 0.04, 3.3, MAGENTA, [s * 0.93, 0.49, 0]), 1.6);
  glow(box(1.8, 0.04, 0.05, MAGENTA, [0, 0.49, 2.5]), 1.6);
  glow(box(1.8, 0.04, 0.05, MAGENTA, [0, 0.49, -2.6]), 1.6);

  // ===== hover thrusters =====
  for (const sx of [1, -1])
    for (const z of [1.75, -1.7]) {
      const x = sx * 1.3;
      // struts
      b.rod([sx * 0.95, 0.62, z], [x, 0.3, z], 0.1, STEEL);
      b.rod([sx * 0.95, 0.56, z + 0.3], [x, 0.3, z + 0.1], 0.05, PLATE);
      b.rod([sx * 0.95, 0.56, z - 0.3], [x, 0.3, z - 0.1], 0.05, PLATE);
      // duct
      b.lathe(
        [
          [0.4, 0],
          [0.5, 0],
          [0.55, 0.2],
          [0.5, 0.45],
          [0.4, 0.45],
          [0.37, 0.22],
        ],
        { at: [x, 0, z], segments: 10, color: ARMOR },
      );
      // fans
      glow(plane(0.8, 0.8, FAN, [x, 0.12, z], [0, -1, 0], [0, 0, 1]), 1.3);
      plane(0.8, 0.8, FANTOP, [x, 0.44, z], [0, 1, 0], [0, 0, 1]);
      // glow rings
      glow(b.part(new THREE.TorusGeometry(0.5, 0.025, 4, 14), CYAN, { at: [x, 0.04, z], dir: [0, 1, 0], axis: "z" }), 1.6);
      glow(b.part(new THREE.TorusGeometry(0.52, 0.02, 4, 14), MAGENTA, { at: [x, 0.43, z], dir: [0, 1, 0], axis: "z" }), 1.4);
      // armor fins
      for (const dz of [-1, 1]) box(0.08, 0.2, 0.3, PLATE, [x + sx * 0.5, 0.25, z + dz * 0.2]);
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 6), DARK, { at: [x, 0.22, z] });
    }

  return b.root;
}
