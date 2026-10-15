import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint, grain } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "Custom extended-fork chopper: fat rear tyre, V-twin, drag pipes, belt drive, ape-hanger bars; white/orange colour-blocked tank and panels on gunmetal in a polished Overwatch look.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const GUN = "#2b3140";
const GUN2 = "#3a4254";
const STEEL = "#8d97a8";
const CHROME = "#d3dbe8";
const WHITE = "#eef2f7";
const ORANGE = "#ff7a1a";
const BLACK = "#14171d";
const LAMP = "#fff1c2";
const TAIL = "#ff4a1a";

type P = [number, number, number];

const TANK_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <polygon points="0,62 200,18 200,40 0,84" fill="#eef2f7"/>
  <polygon points="0,86 200,42 200,50 0,94" fill="#14171d"/>
  <polygon points="30,70 62,60 62,70 30,80" fill="#ff7a1a"/>
  <polygon points="150,26 172,22 172,30 150,34" fill="#14171d"/>
  <circle cx="100" cy="46" r="9" fill="#14171d"/>
  <polygon points="100,38 107,42 107,50 100,54 93,50 93,42" fill="#ff7a1a"/>
  <rect x="6" y="14" width="40" height="5" fill="#eef2f7"/>
  <rect x="6" y="23" width="26" height="5" fill="#ff7a1a"/>
</svg>`,
  { size: 512 },
);

const COVER_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
  <polygon points="0,100 70,0 100,0 30,100" fill="#eef2f7"/>
  <polygon points="40,100 110,0 120,0 50,100" fill="#14171d"/>
  <polygon points="130,100 130,60 160,60 160,100" fill="#14171d"/>
  <polygon points="145,66 154,71 154,82 145,87 136,82 136,71" fill="#ff7a1a"/>
  <circle cx="22" cy="20" r="6" fill="#14171d"/>
  <circle cx="22" cy="20" r="3" fill="#eef2f7"/>
</svg>`,
  { size: 256 },
);

const GAUGE_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#14171d"/>
  <path d="M 16 74 A 40 40 0 1 1 84 74" fill="none" stroke="#ff7a1a" stroke-width="7"/>
  <path d="M 16 74 A 40 40 0 0 1 22 40" fill="none" stroke="#eef2f7" stroke-width="7"/>
  <line x1="50" y1="52" x2="68" y2="30" stroke="#eef2f7" stroke-width="5"/>
  <circle cx="50" cy="52" r="6" fill="#d3dbe8"/>
  <rect x="38" y="68" width="24" height="9" fill="#2b3140"/>
</svg>`,
  { size: 128 },
);

const PLATE_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
  <rect x="1" y="1" width="118" height="58" rx="8" fill="#eef2f7" stroke="#14171d" stroke-width="3"/>
  <rect x="6" y="6" width="108" height="10" fill="#ff7a1a"/>
  <text x="60" y="48" font-size="30" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#14171d">CH-0P</text>
</svg>`,
  { size: 256 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "chopperMotorbike" });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- paints ----------
  const tankPaint = paint((_p, n) => (n.y > 0.55 ? WHITE : n.y < -0.35 ? GUN : ORANGE));
  const seatPaint = grain("#3b2a24", "#4d362c", { size: 0.012, axis: "z", seed: 3 });
  const rearTire = paint((_p, _n, s) => {
    const v = s[1];
    if (Math.abs(v - 0.25) < 0.02 || Math.abs(v - 0.75) < 0.02) return ORANGE;
    if (v < 0.14 || v > 0.86) return Math.floor(s[0] * 44) % 2 ? "#15171c" : "#262a32";
    return "#1c1f26";
  });
  const frontTire = paint((_p, _n, s) => {
    const v = s[1];
    if (Math.abs(v - 0.25) < 0.03 || Math.abs(v - 0.75) < 0.03) return WHITE;
    if (v < 0.14 || v > 0.86) return Math.floor(s[0] * 36) % 2 ? "#15171c" : "#262a32";
    return "#1c1f26";
  });

  // ---------- fork geometry ----------
  const AX: P = [0, 0.34, 1.1];
  const U = V(0, 0.68, -0.73).normalize();
  const fp = (x: number, k: number): P => [x, AX[1] + U.y * k, AX[2] + U.z * k];

  // ---------- wheel ----------
  const wheel = (cy: number, cz: number, tube: number, wScale: number, rimR: number, rimHalf: number, tire: any, spokes: number) => {
    b.part(new THREE.TorusGeometry(0.27, tube, 10, 28), tire, { at: [0, cy, cz], rotation: [0, 90, 0], scale: [1, 1, wScale] });
    b.part(new THREE.CylinderGeometry(rimR, rimR, rimHalf * 2, 18), STEEL, { at: [0, cy, cz], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, rimHalf * 2 + 0.07, 10), CHROME, { at: [0, cy, cz], rotation: [0, 0, 90] });
    for (const s of [1, -1]) {
      const x = s * (rimHalf + 0.003);
      b.part(new THREE.CylinderGeometry(rimR, rimR, 0.012, 18), WHITE, { at: [x, cy, cz], rotation: [0, 0, 90] });
      b.part(new THREE.TorusGeometry(rimR * 0.86, 0.008, 5, 22), ORANGE, { at: [x + s * 0.005, cy, cz], rotation: [0, 90, 0] });
      b.part(new THREE.TorusGeometry(rimR * 0.5, 0.006, 5, 16), GUN, { at: [x + s * 0.005, cy, cz], rotation: [0, 90, 0] });
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2 + 0.2;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        b.rod([x + s * 0.008, cy + c * 0.05, cz + sn * 0.05], [x + s * 0.008, cy + c * rimR * 0.82, cz + sn * rimR * 0.82], 0.013, GUN, { sides: 4 });
      }
      glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), ORANGE, { at: [s * (rimHalf + 0.036), cy, cz], rotation: [0, 0, 90] }), 1.5);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.006, 5, 4), CHROME, { at: [s * (rimHalf + 0.03), cy + Math.cos(a) * 0.04, cz + Math.sin(a) * 0.04] });
      }
    }
  };
  wheel(0.38, -0.85, 0.11, 1.5, 0.185, 0.085, rearTire, 6);
  wheel(0.34, 1.1, 0.07, 1.2, 0.2, 0.07, frontTire, 5);

  // axles
  b.rod([-0.3, 0.38, -0.85], [0.3, 0.38, -0.85], 0.022, CHROME);
  b.rod([-0.13, AX[1], AX[2]], [0.13, AX[1], AX[2]], 0.02, CHROME);

  // ---------- fenders ----------
  b.part(new THREE.TorusGeometry(0.43, 0.03, 5, 16, (160 * Math.PI) / 180), WHITE, {
    at: [0, 0.34, 1.1],
    rotation: [0, 90, 15],
    scale: [1, 1, 3.4],
  });
  b.part(new THREE.TorusGeometry(0.46, 0.025, 5, 14, (100 * Math.PI) / 180), ORANGE, {
    at: [0, 0.38, -0.85],
    rotation: [0, 90, 15],
    scale: [1, 1, 6],
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.19, 0.38, -0.85], [s * 0.1, 0.78, -1.08], 0.014, GUN2);
    b.rod([s * 0.115, AX[1] + 0.02, AX[2]], [s * 0.1, 0.5, AX[2] + 0.34], 0.012, GUN2);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), CHROME, { at: [s * 0.1, 0.78, -1.08] });
  }

  // ---------- frame ----------
  b.sweep(catmull([[0, 1.0, 0.42], [0, 0.9, 0.1], [0, 0.82, -0.35]]), 0.03, GUN, { sides: 8 });
  b.sweep(catmull([[0, 0.9, 0.5], [0, 0.55, 0.2], [0, 0.37, -0.1], [0, 0.36, -0.5]]), 0.03, GUN, { sides: 8 });
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.1, 0.8, -0.35], [s * 0.15, 0.6, -0.65], [s * 0.19, 0.4, -0.85]]), 0.022, GUN, { sides: 8 });
    b.sweep(catmull([[s * 0.04, 0.36, -0.5], [s * 0.14, 0.37, -0.7], [s * 0.19, 0.38, -0.85]]), 0.02, GUN, { sides: 8 });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), ORANGE, { at: [s * 0.19, 0.38, -0.85], rotation: [0, 0, 90] });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), CHROME, { at: [s * 0.3, 0.38, -0.85] });
    b.part(new THREE.SphereGeometry(0.026, 6, 5), CHROME, { at: [s * 0.13, AX[1], AX[2]] });
  }
  b.rod([0, 0.88, -0.35], [0, 0.4, -0.5], 0.02, GUN);
  b.rod([-0.1, 0.8, -0.35], [0.1, 0.8, -0.35], 0.022, GUN);

  // ---------- fork & front end ----------
  b.rod(fp(0, 0.74), fp(0, 1.02), 0.042, GUN);
  for (const k of [0.78, 1.0]) b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), ORANGE, { at: fp(0, k), dir: [0, U.y, U.z] });
  b.rod(fp(-0.13, 0.76), fp(0.13, 0.76), 0.028, GUN2);
  b.rod(fp(-0.13, 1.1), fp(0.13, 1.1), 0.026, CHROME);
  for (const s of [1, -1]) {
    b.rod(fp(s * 0.11, 0), fp(s * 0.11, 0.48), 0.034, WHITE);
    b.rod(fp(s * 0.11, 0.46), fp(s * 0.11, 1.1), 0.022, CHROME);
    b.rod(fp(s * 0.11, 0.62), fp(s * 0.11, 0.92), 0.033, BLACK);
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.016, 8), ORANGE, { at: fp(s * 0.11, 0.48), dir: [0, U.y, U.z] });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), CHROME, { at: fp(s * 0.13, 1.1) });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), CHROME, { at: fp(s * 0.13, 0.76) });
  }
  // front brake
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 18), STEEL, { at: [-0.096, AX[1], AX[2]], rotation: [0, 0, 90] });
  b.part(new THREE.TorusGeometry(0.1, 0.006, 4, 16), GUN, { at: [-0.1, AX[1], AX[2]], rotation: [0, 90, 0] });
  b.part(new THREE.BoxGeometry(0.035, 0.09, 0.07), ORANGE, { at: fp(-0.125, 0.3), dir: [0, U.y, U.z] });

  // headlight
  b.part(new THREE.SphereGeometry(1, 12, 8), CHROME, { at: [0, 0.98, 0.66], scale: [0.1, 0.1, 0.09] });
  b.part(new THREE.TorusGeometry(0.088, 0.011, 5, 16), BLACK, { at: [0, 0.98, 0.735] });
  glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 14), LAMP, { at: [0, 0.98, 0.735], rotation: [90, 0, 0] }), 1.4);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), ORANGE, { at: [0, 1.075, 0.66] });
  for (const s of [1, -1]) {
    b.rod([s * 0.09, 0.98, 0.62], fp(s * 0.11, 0.97), 0.012, GUN2);
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), ORANGE, { at: [s * 0.14, 0.9, 0.5] }), 1.5);
    b.rod([s * 0.11, 0.93, 0.47], [s * 0.14, 0.9, 0.5], 0.008, BLACK);
  }

  // handlebars (ape hangers)
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.05, 1.12, 0.28], [s * 0.2, 1.16, 0.27], [s * 0.3, 1.28, 0.22], [s * 0.34, 1.4, 0.14], [s * 0.38, 1.43, 0.05]]),
      0.014,
      CHROME,
      { sides: 8 },
    );
    b.rod([s * 0.37, 1.43, 0.08], [s * 0.45, 1.44, -0.06], 0.022, BLACK, { sides: 8 });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), CHROME, { at: [s * 0.45, 1.44, -0.06] });
    b.rod([s * 0.36, 1.43, 0.1], [s * 0.31, 1.4, -0.02], 0.007, CHROME);
    b.part(new THREE.BoxGeometry(0.04, 0.035, 0.04), GUN, { at: [s * 0.34, 1.4, 0.13] });
    b.part(new THREE.BoxGeometry(0.05, 0.035, 0.05), GUN2, { at: [s * 0.06, 1.12, 0.28] });
    glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), ORANGE, { at: [s * 0.455, 1.445, -0.075] }), 1.4);
  }
  b.sweep(catmull([[-0.34, 1.4, 0.12], [-0.3, 1.2, 0.22], [-0.16, 1.0, 0.35], [-0.13, 0.75, 0.65], [-0.125, 0.62, 0.83]]), 0.007, BLACK, { sides: 5 });
  b.sweep(catmull([[0.33, 1.4, 0.12], [0.1, 1.2, 0.26], [0.04, 1.0, 0.4], [0.05, 0.9, 0.48]]), 0.005, BLACK, { sides: 5 });

  // gauge
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), STEEL, { at: [0, 1.17, 0.28], dir: [0, 0.37, -0.93] });
  b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", { at: [0, 1.179, 0.259], dir: [0, 0.37, -0.93], axis: "z", texture: GAUGE_ART });
  b.rod([0, 1.12, 0.28], [0, 1.15, 0.28], 0.012, GUN);

  // ---------- tank ----------
  const tank = b.part(new THREE.SphereGeometry(1, 16, 10), tankPaint, { at: [0, 0.98, 0.2], scale: [0.17, 0.15, 0.34] });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), CHROME, { at: [0, 1.125, 0.3] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), BLACK, { at: [0, 1.14, 0.3] });
  for (const s of [1, -1]) {
    b.decal(tank, TANK_ART, { at: [s * 0.17, 0.98, 0.2], dir: [s, 0, 0], size: [0.42, 0.2] });
  }
  b.rod([0, 0.86, 0.38], [0, 0.95, 0.42], 0.015, CHROME);
  b.rod([0, 0.84, -0.05], [0, 0.82, -0.1], 0.015, CHROME);
  b.rod([-0.06, 0.9, 0.3], [0.06, 0.9, 0.3], 0.01, ORANGE);

  // ---------- seat ----------
  b.loft(
    [
      { at: [0, 0.85, -0.62], w: 0.2, h: 0.08 },
      { at: [0, 0.855, -0.4], w: 0.3, h: 0.09 },
      { at: [0, 0.84, -0.15], w: 0.32, h: 0.09 },
      { at: [0, 0.85, 0.05], w: 0.14, h: 0.06 },
    ],
    { color: seatPaint },
  );
  b.part(new THREE.BoxGeometry(0.22, 0.015, 0.55), GUN, { at: [0, 0.795, -0.33] });
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.885, -0.58], [s * 0.15, 0.89, -0.15], 0.004, ORANGE);
    b.rod([s * 0.1, 0.72, -0.52], [s * 0.1, 0.8, -0.52], 0.012, CHROME);
    b.rod([s * 0.1, 0.72, -0.2], [s * 0.1, 0.8, -0.2], 0.012, CHROME);
  }

  // side covers and battery box
  b.part(new THREE.BoxGeometry(0.16, 0.2, 0.3), GUN, { at: [0, 0.64, -0.28] });
  for (const s of [1, -1]) {
    const cover = b.extrude(
      [[-0.45, 0.55], [-0.1, 0.55], [-0.05, 0.72], [-0.2, 0.78], [-0.45, 0.72]],
      { at: [s * 0.13, 0, 0], x: [0, 0, 1], thickness: 0.03, bevel: 0.006, smoothing: 1, color: ORANGE },
    );
    b.decal(cover, COVER_ART, { at: [s * 0.15, 0.66, -0.28], dir: [s, 0, 0], size: [0.3, 0.19] });
  }

  // ---------- engine ----------
  b.part(new THREE.BoxGeometry(0.3, 0.28, 0.34), GUN, { at: [0, 0.45, 0.02] });
  b.part(new THREE.BoxGeometry(0.24, 0.24, 0.22), GUN2, { at: [0, 0.4, -0.25] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 14), STEEL, { at: [s * 0.16, 0.46, 0.02], rotation: [0, 0, 90] });
    b.part(new THREE.TorusGeometry(0.07, 0.01, 5, 14), ORANGE, { at: [s * 0.175, 0.46, 0.02], rotation: [0, 90, 0] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), CHROME, { at: [s * 0.175, 0.46, 0.02], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), STEEL, { at: [s * 0.125, 0.4, -0.25], rotation: [0, 0, 90] });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), CHROME, { at: [s * 0.126, 0.36, -0.2] });
  }
  const base = V(0, 0.52, 0.02);
  for (const dz of [0.57, -0.57]) {
    const d = V(0, 0.82, dz).normalize();
    b.rod(base, base.clone().addScaledVector(d, 0.26), 0.065, GUN, { sides: 8 });
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.012, 10), STEEL, {
        at: base.clone().addScaledVector(d, 0.07 + i * 0.036),
        dir: d,
      });
    }
    const hc = base.clone().addScaledVector(d, 0.31);
    b.part(new THREE.BoxGeometry(0.2, 0.09, 0.2), ORANGE, { at: hc, dir: d });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), CHROME, { at: base.clone().addScaledVector(d, 0.37), dir: d });
    b.rod(hc.clone().addScaledVector(d, 0.05), hc.clone().addScaledVector(d, 0.14), 0.01, CHROME);
    for (const s of [1, -1]) {
      b.rod(base.clone().addScaledVector(d, 0.05).add(V(s * 0.1, 0, 0)), hc.clone().add(V(s * 0.09, 0, 0)), 0.008, CHROME);
    }
  }
  // air cleaner and intake
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 14), CHROME, { at: [-0.19, 0.62, 0.05], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 14), ORANGE, { at: [-0.235, 0.62, 0.05], rotation: [0, 0, 90] });
  b.part(new THREE.TorusGeometry(0.085, 0.008, 5, 14), STEEL, { at: [-0.225, 0.62, 0.05], rotation: [0, 90, 0] });
  b.sweep(catmull([[-0.03, 0.74, 0.02], [-0.1, 0.68, 0.04], [-0.16, 0.62, 0.05]]), 0.028, STEEL, { sides: 8 });
  b.rod([0, 0.15, 0.0], [0, 0.34, 0.0], 0.01, GUN);

  // ---------- exhaust ----------
  for (const s of [1, -1]) {
    const pipe = catmull([
      [s * 0.1, 0.74, 0.24],
      [s * 0.16, 0.68, 0.34],
      [s * 0.24, 0.5, 0.34],
      [s * 0.27, 0.34, 0.15],
      [s * 0.28, 0.25, -0.4],
      [s * 0.3, 0.27, -1.0],
    ]);
    b.sweep(pipe, [0.03, 0.055], CHROME, { sides: 8 });
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), ORANGE, { at: pipe.at(1), dir: pipe.tangentAt(1) }), 1.2);
    for (const t of [0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9]) {
      const r = 0.03 + 0.025 * t;
      b.part(new THREE.TorusGeometry(r + 0.004, 0.009, 4, 12), t % 0.16 < 0.08 ? BLACK : ORANGE, {
        at: pipe.at(t),
        dir: pipe.tangentAt(t),
        axis: "z",
      });
    }
    b.rod([s * 0.12, 0.45, 0.14], [s * 0.2, 0.46, 0.14], 0.01, GUN2);
    b.part(new THREE.TorusGeometry(0.05, 0.01, 4, 10), STEEL, { at: pipe.at(0.04), dir: pipe.tangentAt(0.04), axis: "z" });
  }

  // ---------- belt drive ----------
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), STEEL, { at: [0.235, 0.38, -0.85], rotation: [0, 0, 90] });
  b.part(new THREE.TorusGeometry(0.07, 0.008, 4, 14), ORANGE, { at: [0.247, 0.38, -0.85], rotation: [0, 90, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), STEEL, { at: [0.215, 0.42, -0.1], rotation: [0, 0, 90] });
  b.rod([0.235, 0.48, -0.85], [0.215, 0.47, -0.1], 0.009, BLACK, { section: "box" });
  b.rod([0.235, 0.28, -0.85], [0.215, 0.37, -0.1], 0.009, BLACK, { section: "box" });
  // rear brake
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.008, 18), STEEL, { at: [-0.235, 0.38, -0.85], rotation: [0, 0, 90] });
  b.part(new THREE.TorusGeometry(0.08, 0.006, 4, 16), GUN, { at: [-0.24, 0.38, -0.85], rotation: [0, 90, 0] });
  b.part(new THREE.BoxGeometry(0.04, 0.1, 0.06), ORANGE, { at: [-0.235, 0.46, -0.96] });

  // ---------- foot controls & stand ----------
  for (const s of [1, -1]) {
    b.rod([0, 0.52, 0.17], [s * 0.3, 0.45, 0.5], 0.016, GUN2);
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.055), BLACK, { at: [s * 0.34, 0.45, 0.5] });
    b.part(new THREE.BoxGeometry(0.02, 0.03, 0.06), ORANGE, { at: [s * 0.4, 0.45, 0.5] });
  }
  b.rod([-0.17, 0.42, -0.15], [-0.28, 0.04, -0.12], 0.014, GUN2);
  b.part(new THREE.BoxGeometry(0.07, 0.02, 0.09), GUN, { at: [-0.29, 0.02, -0.12] });

  // ---------- tail ----------
  glow(b.part(new THREE.BoxGeometry(0.09, 0.04, 0.03), TAIL, { at: [0, 0.53, -1.3] }), 1.5);
  b.rod([0, 0.5, -1.28], [0, 0.42, -1.29], 0.01, GUN);
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { at: [0, 0.4, -1.3], dir: [0, 0, -1], axis: "z", texture: PLATE_ART });

  return b.root;
}
