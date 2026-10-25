import * as THREE from "three";
import { createBuilder, frame, catmull, svg, stripes, paint, noise, mix, rng } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot-Control Interceptor",
  description: "Corporate armored riot-control truck with roof water cannon and neon light bars, cyberpunk style.",
};

const NAVY = "#161b2b";
const HULL = panelled(paint((p) => mix("#1b2236", "#2a3350", noise(p, 0.5, 3))), { size: 0.5, rivets: 0.12 });
const DARK = "#0b0d14";
const GUN = "#2b2f3d";
const TYRE = "#101014";
const YEL = "#ffc400";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const RED = "#ff2244";
const BLUE = "#2a5cff";
const WHITE = "#e8f4ff";

const LOGO = svg(
  `<svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="96" rx="6" fill="#0a0d16" stroke="${CYAN}" stroke-width="3"/>
  <polygon points="40,12 66,26 66,56 40,70 14,56 14,26" fill="none" stroke="${MAG}" stroke-width="5"/>
  <path d="M28 30 L40 24 L52 30 L52 52 L40 58 L28 52Z M40 24 V58" fill="none" stroke="${CYAN}" stroke-width="3"/>
  <text x="84" y="40" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffffff">KANGTAO</text>
  <text x="84" y="64" font-family="sans-serif" font-weight="bold" font-size="16" fill="${MAG}">RIOT SUPPRESSION</text>
  <rect x="84" y="72" width="150" height="5" fill="${YEL}"/>
  <path d="M84 72 l10 0 l-8 5 l-10 0z M110 72 l10 0 l-8 5 l-10 0z M136 72 l10 0 l-8 5 l-10 0z" fill="#000"/>
</svg>`,
  { size: 512 },
);
const VISOR = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="80" fill="#05121a"/>
  <rect width="200" height="80" fill="${CYAN}" opacity="0.18"/>
  <path d="M0 60 L60 20 L200 14" stroke="${CYAN}" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M10 70 H70 M130 8 H190 M150 70 H190" stroke="${MAG}" stroke-width="3"/>
  <circle cx="160" cy="40" r="14" fill="none" stroke="${CYAN}" stroke-width="2"/>
  <path d="M160 22 V58 M142 40 H178" stroke="${CYAN}" stroke-width="1.5"/>
  <text x="14" y="36" font-family="monospace" font-size="11" fill="${CYAN}">TGT LOCK 03</text>
</svg>`,
  { size: 400 },
);
const NUM = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="60" fill="${YEL}"/>
  <text x="60" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="#000">RC-77</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir });
  const lit = (p: any, s = 1.6) => glow(p, s);

  // ---- main hull: side profile extruded across the width
  const prof: [number, number][] = [
    [-2.7, 0.6], [-2.75, 2.2], [-2.5, 2.45], [0.9, 2.5], [1.65, 1.7],
    [2.7, 1.5], [2.85, 1.1], [2.8, 0.7], [2.5, 0.55],
  ];
  b.extrude(prof, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.06, color: HULL });

  // undercarriage + skirts
  box(2.0, 0.3, 5.2, DARK, 0, 0.55, 0);
  for (const s of [1, -1]) {
    box(0.12, 0.35, 1.4, GUN, s * 1.16, 0.75, 0);
    box(0.1, 0.5, 0.9, GUN, s * 1.16, 1.0, -2.2);
    // side armor ribs
    for (let i = 0; i < 5; i++) box(0.1, 0.9, 0.08, GUN, s * 1.13, 1.45, -2.4 + i * 0.28);
    // flank logo panel
    b.part(new THREE.PlaneGeometry(1.5, 0.56), "#ffffff", {
      at: [s * 1.113, 1.7, 0.1], dir: [s, 0, 0], axis: "z", texture: LOGO,
    });
    // fender arches
    for (const z of [1.75, -1.65]) {
      box(0.22, 0.12, 1.45, GUN, s * 1.12, 1.18, z);
      box(0.2, 0.5, 0.12, GUN, s * 1.12, 0.95, z + 0.76);
      box(0.2, 0.5, 0.12, GUN, s * 1.12, 0.95, z - 0.76);
    }
    // neon flank strips
    lit(box(0.04, 0.05, 3.4, MAG, s * 1.125, 0.78, 0.0), 1.8);
    lit(box(0.04, 0.04, 1.8, CYAN, s * 1.125, 2.28, -1.7), 1.6);
    // door seam + handle + mirror
    box(0.03, 0.9, 0.03, DARK, s * 1.112, 1.9, 0.5);
    box(0.03, 0.9, 0.03, DARK, s * 1.112, 1.9, 1.15);
    box(0.05, 0.05, 0.22, YEL, s * 1.12, 1.75, 0.58);
    box(0.28, 0.2, 0.06, GUN, s * 1.3, 2.1, 1.35);
    lit(box(0.2, 0.12, 0.02, CYAN, s * 1.3, 2.1, 1.39), 1.2);
    box(0.05, 0.05, 0.2, GUN, s * 1.2, 2.05, 1.3);
    // window slit
    box(0.03, 0.3, 0.75, "#07131c", s * 1.114, 2.15, 0.82);
    // headlights
    lit(box(0.45, 0.1, 0.06, WHITE, s * 0.75, 1.15, 2.86), 2);
    lit(box(0.15, 0.1, 0.06, CYAN, s * 0.45, 1.15, 2.86), 2);
    // taillights
    lit(box(0.5, 0.12, 0.05, RED, s * 0.8, 2.0, -2.78), 2);
    box(0.55, 0.04, 0.07, DARK, s * 0.8, 1.9, -2.78);
    // bull bar uprights
    box(0.08, 0.7, 0.08, GUN, s * 0.9, 0.95, 3.0);
    box(0.12, 0.14, 0.4, GUN, s * 0.9, 1.3, 2.95);
  }
  // bull bar cross rails
  box(2.1, 0.08, 0.08, GUN, 0, 1.28, 3.0);
  box(2.1, 0.08, 0.08, GUN, 0, 0.98, 3.0);
  box(2.1, 0.08, 0.08, GUN, 0, 0.68, 3.0);
  for (let i = -3; i <= 3; i++) box(0.05, 0.6, 0.05, GUN, i * 0.3, 0.98, 3.0);
  // bumper with hazard stripes
  b.part(new THREE.BoxGeometry(2.3, 0.3, 0.3), stripes(YEL, "#000000", { size: 0.2, axis: "x", width: 0.5, wobble: 0.05 }), {
    at: [0, 0.6, 2.88],
  });
  // plate
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { at: [0, 0.9, 2.87], dir: [0, 0, 1], axis: "z", texture: NUM });
  // grille vents
  for (let i = 0; i < 5; i++) box(1.3, 0.04, 0.04, DARK, 0, 1.25 - i * 0.07, 2.87 + 0.02);
  // hood details
  box(1.2, 0.08, 0.8, GUN, 0, 1.55, 2.2);
  lit(box(1.1, 0.03, 0.04, MAG, 0, 1.6, 2.65), 1.8);

  // windshield
  b.part(new THREE.PlaneGeometry(1.95, 0.88), "#ffffff", {
    at: [0, 2.06, 1.29], dir: [0, 0.66, 0.75], axis: "z", texture: VISOR,
  });
  // wiper
  b.part(new THREE.BoxGeometry(0.9, 0.03, 0.03), DARK, { at: [0.2, 1.75, 1.5], dir: [0.3, 0.0, 0.0] });
  // windshield cage bars
  for (const x of [-0.7, 0, 0.7]) b.rod([x, 1.75, 1.6], [x, 2.45, 0.95], 0.025, GUN);

  // roof
  box(2.1, 0.08, 3.2, GUN, 0, 2.52, -1.1);
  for (let i = 0; i < 6; i++) box(2.14, 0.05, 0.06, DARK, 0, 2.58, -2.5 + i * 0.5);
  // roof light bar (red/blue segments)
  box(1.9, 0.12, 0.25, DARK, 0, 2.64, 0.55);
  for (let i = 0; i < 8; i++) lit(box(0.22, 0.1, 0.27, i < 4 ? RED : BLUE, -0.85 + i * 0.243, 2.66, 0.55), 2.2);
  // front under-windshield cyan bar
  lit(box(1.9, 0.06, 0.06, CYAN, 0, 1.68, 1.82), 2.2);
  // rear light bar
  lit(box(1.7, 0.06, 0.06, RED, 0, 2.35, -2.8), 2);
  lit(box(1.7, 0.04, 0.05, MAG, 0, 0.7, -2.8), 1.8);

  // rear doors
  box(0.03, 1.5, 0.03, DARK, 0, 1.45, -2.77);
  box(0.12, 0.08, 0.06, YEL, 0.1, 1.4, -2.78);
  box(0.12, 0.08, 0.06, YEL, -0.1, 1.4, -2.78);
  b.part(new THREE.PlaneGeometry(1.0, 0.4), "#ffffff", { at: [0, 1.0, -2.78], dir: [0, 0, -1], axis: "z", texture: LOGO });

  // antennas + camera dome + speakers
  b.rod([-0.9, 2.55, -2.3], [-0.95, 3.6, -2.4], [0.02, 0.01], GUN);
  lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [-0.95, 3.62, -2.4] }), 2);
  b.rod([0.9, 2.55, -2.3], [0.85, 3.2, -2.35], [0.02, 0.01], GUN);
  b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, 6.3, 0, 1.6), GUN, { at: [0.6, 2.58, 0.1] });
  lit(b.part(new THREE.SphereGeometry(0.05, 6, 4), CYAN, { at: [0.6, 2.68, 0.25] }), 2);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.2, 0.3, 8), GUN, { at: [s * 0.8, 2.72, 0.05], dir: [0, 0.3, 1] });
    lit(b.part(new THREE.CircleGeometry(0.09, 8), CYAN, { at: [s * 0.8, 2.76, 0.2], dir: [0, 0.3, 1], axis: "z" }), 1);
  }

  // ---- water tanks (rear roof)
  for (const s of [1, -1]) {
    cyl(0.36, 0.36, 1.6, 12, metal("steel"), [s * 0.55, 2.98, -1.9], [0, 0, 1]);
    for (const z of [-1.4, -1.9, -2.4]) cyl(0.375, 0.375, 0.06, 12, YEL, [s * 0.55, 2.98, z], [0, 0, 1]);
    lit(box(0.04, 0.5, 0.9, "#2ab8ff", s * 0.55 + s * 0.35, 3.0, -1.9), 1.2);
  }
  // hoses to turret
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.55, 3.2, -1.15], [s * 0.4, 3.45, -0.8], [s * 0.18, 3.1, -0.45], [s * 0.1, 2.95, -0.25]]), 0.04, {
      color: DARK,
    });

  // ---- water cannon turret
  const TZ = -0.3;
  cyl(0.55, 0.62, 0.12, 14, GUN, [0, 2.62, TZ], [0, 1, 0]);
  lit(b.part(new THREE.TorusGeometry(0.58, 0.02, 4, 20), MAG, { at: [0, 2.7, TZ], dir: [0, 1, 0], axis: "z" }), 2);
  cyl(0.38, 0.45, 0.4, 10, "#2b3045", [0, 2.9, TZ], [0, 1, 0]);
  box(0.9, 0.5, 0.7, "#242a3c", 0, 3.3, TZ + 0.05);
  for (const s of [1, -1]) {
    box(0.08, 0.5, 0.6, GUN, s * 0.48, 3.3, TZ + 0.05);
    lit(box(0.03, 0.2, 0.3, CYAN, s * 0.53, 3.3, TZ + 0.05), 1.5);
  }
  const dir = [0, 0.1, 1];
  cyl(0.17, 0.17, 1.7, 10, metal("steel"), [0, 3.4, TZ + 1.1], dir);
  for (let i = 0; i < 3; i++) cyl(0.2, 0.2, 0.08, 10, YEL, [0, 3.38 + i * 0.03, TZ + 0.6 + i * 0.5], dir);
  cyl(0.25, 0.14, 0.35, 10, "#444b60", [0, 3.47, TZ + 2.0], dir);
  lit(b.part(new THREE.CircleGeometry(0.1, 10), "#7fd8ff", { at: [0, 3.48, TZ + 2.18], dir, axis: "z" }), 1.8);
  // elevation piston
  b.rod([0, 2.95, TZ + 0.35], [0, 3.3, TZ + 0.8], 0.04, metal("steel"));
  // camera eye on turret
  lit(box(0.3, 0.1, 0.04, RED, 0, 3.4, TZ + 0.42), 2);

  // ---- wheels
  for (const s of [1, -1])
    for (const z of [1.75, -1.65]) {
      const x = s * 1.12;
      cyl(0.58, 0.58, 0.46, 16, TYRE, [x, 0.58, z], [1, 0, 0]);
      const ringF = frame([x, 0.58, z], [s, 0, 0]);
      b.ring(ringF, { count: 16, radius: 0.58 }, (it: any) =>
        b.stick(new THREE.BoxGeometry(0.14, 0.05, 0.4), "#1c1c22", it, { embed: 0.5 }),
      );
      cyl(0.36, 0.36, 0.48, 10, metal("steel"), [x + s * 0.02, 0.58, z], [1, 0, 0]);
      cyl(0.15, 0.15, 0.5, 8, GUN, [x + s * 0.03, 0.58, z], [1, 0, 0]);
      lit(b.part(new THREE.TorusGeometry(0.3, 0.02, 4, 18), MAG, { at: [x + s * 0.26, 0.58, z], dir: [s, 0, 0], axis: "z" }), 2);
      b.ring(frame([x + s * 0.27, 0.58, z], [s, 0, 0]), { count: 6, radius: 0.2 }, (it: any) =>
        cyl(0.035, 0.035, 0.05, 6, YEL, [it.at.x, it.at.y, it.at.z], [s, 0, 0]),
      );
      // brake disc glow
      cyl(0.2, 0.2, 0.03, 10, "#ff7a2b", [x - s * 0.15, 0.58, z], [1, 0, 0]);
    }
  // axles
  cyl(0.09, 0.09, 2.3, 8, DARK, [0, 0.58, 1.75], [1, 0, 0]);
  cyl(0.09, 0.09, 2.3, 8, DARK, [0, 0.58, -1.65], [1, 0, 0]);

  // scuffs: a few worn plates
  for (let i = 0; i < 8; i++)
    box(0.15 + R() * 0.2, 0.01, 0.15 + R() * 0.2, "#3a4256", (R() - 0.5) * 1.6, 2.575, -2.6 + R() * 2.2);

  return b.root;
}
