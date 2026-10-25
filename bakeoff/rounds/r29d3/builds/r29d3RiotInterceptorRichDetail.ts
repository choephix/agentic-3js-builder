import * as THREE from "three";
import { createBuilder, rng, svg, paint, mix, noise } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Riot Interceptor R-9",
  description: "Corporate riot-control interceptor with roof water cannon, tanks and neon light bars, cyberpunk style.",
};

const HULL = "#1b1f2b", TRIM = "#2c3345", DARK = "#0b0d14", TYRE = "#101116";
const CYAN = "#19f3ff", MAGENTA = "#ff2bd6", RED = "#ff2a3a", BLUE = "#2a5bff", YELLOW = "#ffd21a";

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffd21a"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#111"/>`).join("")}<rect width="64" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`,
  { size: 256 },
);
const LOGO = svg(
  `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="6" fill="#0b0d14" stroke="#19f3ff" stroke-width="3"/><path d="M14 48 L30 14 L46 48 M22 34 H38" stroke="#ff2bd6" stroke-width="5" fill="none"/><text x="56" y="30" font-family="monospace" font-weight="bold" font-size="17" fill="#19f3ff">AEGIS</text><text x="56" y="50" font-family="monospace" font-size="11" fill="#ffd21a">RIOT CONTROL</text></svg>`,
  { size: 256 },
);
const GLASS = svg(
  `<svg viewBox="0 0 64 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a3a"/><stop offset="1" stop-color="#05060c"/></linearGradient></defs><rect width="64" height="32" fill="url(#g)"/><path d="M6 32 L22 0 H30 L14 32Z M34 32 L50 0 H54 L38 32Z" fill="#19f3ff" opacity="0.18"/></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#e8e8d8" stroke="#111" stroke-width="2"/><rect y="0" width="64" height="8" fill="#ff2bd6"/><text x="32" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#111">NC-4471</text></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 16"><path d="M0 8 L10 0 H54 L64 8 L54 16 H10Z" fill="#ff2a3a"/><rect x="12" y="6" width="40" height="4" fill="#fff"/></svg>`,
  { size: 128 },
);

const BODY = panelled(
  paint((p, n) => mix(mix("#1b1f2b", "#2a3042", noise(p, 0.5, 3)), "#3a4260", Math.max(0, n.y) * 0.5)),
  { size: 0.5, aspect: 0.8, rivets: 0.08, seam: "#05060a" },
);
const IRON = metal("iron", { tarnish: 0.5, size: 0.2 });

export default function build() {
  const b = createBuilder({ name: "riot-interceptor" });
  const R = rng(5);

  const box = (w: number, h: number, d: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r1: number, r2: number, len: number, at: number[], dir: number[], color: any, seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r2, len, seg), color, { at, dir, ...o });
  const decal = (w: number, h: number, at: number[], dir: number[], tex: any, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture: tex });

  // ---- main hull (side profile extrude, z forward)
  b.extrude(
    [
      [-2.4, 0.5], [2.4, 0.5], [2.45, 1.0], [2.3, 1.25, "sharp"], [1.6, 1.45, "sharp"],
      [0.9, 2.2, "sharp"], [-2.3, 2.2, "sharp"], [-2.4, 2.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.06, color: BODY },
  );
  // under-skirt & armour
  box(2.1, 0.22, 4.9, [0, 0.5, 0], IRON);
  box(2.06, 0.1, 1.8, [0, 1.1, -1.0], TRIM, { }); // placeholder
  for (const s of [1, -1]) {
    // wheel arches
    for (const z of [1.55, -1.55]) {
      cyl(0.66, 0.66, 0.1, [s * 1.01, 0.55, z], [1, 0, 0], DARK, 14);
      // wheel
      cyl(0.52, 0.52, 0.42, [s * 1.12, 0.52, z], [1, 0, 0], TYRE, 14);
      cyl(0.34, 0.34, 0.06, [s * 1.34, 0.52, z], [1, 0, 0], metal("steel"), 12);
      cyl(0.12, 0.12, 0.1, [s * 1.37, 0.52, z], [1, 0, 0], CYAN, 8, {});
      glow(b.part(new THREE.TorusGeometry(0.4, 0.015, 4, 16), CYAN, { at: [s * 1.345, 0.52, z], dir: [1, 0, 0], axis: "z" }), 1.5);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cyl(0.025, 0.025, 0.05, [s * 1.38, 0.52 + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2], [1, 0, 0], "#c8ccd8", 6);
      }
      // tread blocks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box(0.44, 0.06, 0.12, [s * 1.12, 0.52 + Math.sin(a) * 0.52, z + Math.cos(a) * 0.52], "#1c1d24", {
          rotation: [(-a * 180) / Math.PI + 90 - 90, 0, 0],
        });
      }
    }
    // side window + logo + underglow + hazard
    decal(1.9, 0.5, [s * 1.012, 1.85, -0.2], [s, 0, 0], GLASS);
    decal(0.9, 0.45, [s * 1.012, 1.1, -0.2], [s, 0, 0], LOGO);
    glow(box(0.04, 0.05, 4.2, [s * 1.03, 0.62, 0], CYAN), 1.6);
    glow(box(0.04, 0.03, 4.0, [s * 1.03, 0.95, 0.1], MAGENTA), 1.4);
    // armour side plates with bolts
    box(0.06, 0.4, 1.0, [s * 1.03, 1.4, 1.3], TRIM);
    for (let i = 0; i < 4; i++) cyl(0.025, 0.025, 0.03, [s * 1.07, 1.3 + (i % 2) * 0.2, 0.95 + Math.floor(i / 2) * 0.7], [s, 0, 0], "#aab", 6);
    // mirrors
    box(0.08, 0.18, 0.3, [s * 1.1, 1.8, 1.0], DARK);
    // door seam
    box(0.02, 0.9, 0.02, [s * 1.01, 1.55, 0.4], DARK);
    // headlights
    glow(box(0.5, 0.12, 0.06, [s * 0.68, 0.98, 2.43], "#e8fcff"), 2);
    glow(box(0.35, 0.05, 0.06, [s * 0.68, 0.84, 2.44], CYAN), 1.6);
    // tail lights
    glow(box(0.5, 0.14, 0.06, [s * 0.7, 1.5, -2.42], RED), 1.8);
    // roll bar posts
    box(0.08, 0.3, 0.08, [s * 0.75, 2.35, 0.7], TRIM);
  }
  // windshield
  decal(1.9, 1.03, [0, 1.83, 1.27], [0, 0.7, 0.75], GLASS);
  // visor eye on grille
  decal(1.5, 0.3, [0, 0.98, 2.465], [0, 0, 1], EYE);
  glow(box(1.9, 0.04, 0.05, [0, 1.15, 2.42], MAGENTA), 1.6);

  // front bumper / pushbar
  box(2.2, 0.35, 0.3, [0, 0.65, 2.45], TRIM);
  decal(2.0, 0.28, [0, 0.65, 2.605], [0, 0, 1], HAZARD);
  for (const x of [-0.9, -0.3, 0.3, 0.9]) box(0.1, 0.6, 0.12, [x, 0.9, 2.55], IRON);
  box(2.0, 0.08, 0.14, [0, 1.15, 2.6], IRON);
  // rear
  box(2.1, 0.3, 0.2, [0, 0.7, -2.5], TRIM);
  decal(0.5, 0.25, [0, 0.95, -2.42], [0, 0, -1], PLATE);
  glow(box(1.9, 0.05, 0.06, [0, 1.75, -2.42], MAGENTA), 1.8);
  decal(1.2, 0.6, [0, 1.4, -2.42], [0, 0, -1], LOGO);
  // exhaust stacks
  for (const s of [1, -1]) cyl(0.06, 0.07, 0.4, [s * 0.9, 0.55, -2.5], [0, 0, -1], "#555", 8);

  // roof light bar
  box(1.9, 0.1, 0.35, [0, 2.3, 0.7], DARK);
  glow(box(0.9, 0.12, 0.3, [0.46, 2.38, 0.7], BLUE), 2);
  glow(box(0.9, 0.12, 0.3, [-0.46, 2.38, 0.7], RED), 2);
  for (const s of [1, -1]) cyl(0.12, 0.12, 0.1, [s * 0.98, 2.38, 0.7], [1, 0, 0], YELLOW, 8);
  // antenna
  cyl(0.012, 0.012, 1.0, [0.85, 2.7, -0.5], [0, 1, 0], DARK, 4);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [0.85, 3.2, -0.5] }), 2);

  // water tanks
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.6, [s * 0.62, 2.45, -1.55], [0, 0, 1], metal("steel", { tarnish: 0.3 }), 10);
    for (const z of [-2.1, -1.55, -1.0]) cyl(0.3, 0.3, 0.08, [s * 0.62, 2.45, z], [0, 0, 1], YELLOW, 10);
    glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [s * 0.62, 2.72, -1.55] }), 1.5);
  }

  // water cannon turret
  cyl(0.42, 0.5, 0.18, [0, 2.3, -0.2], [0, 1, 0], IRON, 10);
  box(0.7, 0.32, 0.75, [0, 2.52, -0.2], TRIM);
  glow(box(0.5, 0.04, 0.04, [0, 2.6, 0.2], CYAN), 1.8);
  const d = new THREE.Vector3(0, 0.22, 1).normalize();
  const base = new THREE.Vector3(0, 2.62, 0.1);
  const at = (t: number) => base.clone().addScaledVector(d, t).toArray();
  cyl(0.15, 0.15, 1.3, at(0.65), d.toArray(), metal("steel"), 10);
  for (const t of [0.25, 0.65, 1.0]) cyl(0.19, 0.19, 0.08, at(t), d.toArray(), YELLOW, 10);
  cyl(0.24, 0.17, 0.35, at(1.4), d.toArray(), IRON, 10);
  glow(cyl(0.12, 0.12, 0.04, at(1.6), d.toArray(), CYAN, 10), 2);
  // hose
  b.sweep([[0.45, 2.45, -1.0], [0.4, 2.7, -0.7], [0.1, 2.65, -0.35]], 0.04, { color: DARK });
  // scuffs/rivet studs on roof
  for (let i = 0; i < 8; i++)
    cyl(0.03, 0.03, 0.02, [(R() - 0.5) * 1.6, 2.21, -2 + R() * 1.2], [0, 1, 0], "#778", 6);

  return b.root;
}
