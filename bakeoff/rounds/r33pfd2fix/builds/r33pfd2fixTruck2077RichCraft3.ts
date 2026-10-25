import * as THREE from "three";
import { createBuilder, patches, stripes, countershade, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sentinel-77 Armored Truck",
  description: "Low-poly cyberpunk militarized 6x6 truck from 2077 with a missile pod, roof turret, neon trim and sensors.",
};

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  // ---------- palette ----------
  const CYAN = "#19f3ff";
  const MAG = "#ff2bd6";
  const AMBER = "#ffb020";
  const RED = "#ff2a3a";
  const DARK = "#0d1016";
  const GUN = "#2a323c";
  const TIRE = "#14151a";

  const HULL = countershade(patches("#1e2a33", "#2b3d46", { size: 0.55, gap: 0.03, seed: 4 }), "#11161c", {
    level: -0.2,
  });
  const PLATE = panelled(metal("iron", { polish: 0.15, tarnish: 0.3 }), { size: 0.42, aspect: 0.8, rivets: 0.07 });
  const STEEL = metal("steel", { polish: 0.2, tarnish: 0.5 });
  const BLUED = metal("blued");
  const HAZ = stripes("#f2b800", "#14110a", { size: 0.14, axis: [1, 0, 1], width: 0.5, wobble: 0.05 });

  // ---------- textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><path d="M50 4 L90 24 L90 62 L50 96 L10 62 L10 24Z" fill="#0b1118" stroke="#19f3ff" stroke-width="5"/>
     <path d="M50 18 L76 31 L76 58 L50 80 L24 58 L24 31Z" fill="none" stroke="#ff2bd6" stroke-width="4"/>
     <path d="M32 42 L50 30 L68 42 L50 70Z" fill="#19f3ff"/><circle cx="50" cy="46" r="7" fill="#0b1118"/><circle cx="50" cy="46" r="3" fill="#ff2bd6"/>
     <path d="M30 88 L50 78 L70 88" stroke="#ffb020" stroke-width="4" fill="none"/></svg>`,
    { size: 192 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 240 64"><rect x="2" y="2" width="236" height="60" rx="6" fill="#05080d" stroke="#19f3ff" stroke-width="3"/>
     <text x="16" y="42" font-family="monospace" font-weight="bold" font-size="32" fill="#19f3ff">SENTINEL-77</text>
     <rect x="188" y="14" width="40" height="8" fill="#ff2bd6"/><rect x="188" y="28" width="28" height="8" fill="#ffb020"/><rect x="188" y="42" width="34" height="8" fill="#19f3ff"/></svg>`,
    { size: 384 },
  );
  const HUD = svg(
    `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a4a5a"/><stop offset="1" stop-color="#03121a"/></linearGradient></defs>
     <rect width="100" height="50" fill="url(#g)"/>
     ${Array.from({ length: 10 }, (_, i) => `<rect x="0" y="${i * 5 + 2}" width="100" height="0.8" fill="#19f3ff" opacity="0.28"/>`).join("")}
     <path d="M10 40 L50 8 L90 40" stroke="#19f3ff" stroke-width="1.5" fill="none" opacity="0.8"/>
     <circle cx="70" cy="22" r="5" fill="none" stroke="#ff2bd6" stroke-width="1.2"/></svg>`,
    { size: 256 },
  );
  const PODLABEL = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#10151b"/><text x="8" y="28" font-family="monospace" font-weight="bold" font-size="24" fill="#ff2a3a">ARC-M12</text></svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const P = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(g, color, { at, ...o });
  const box = (w: number, h: number, d: number, at: number[], color: any, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r1: number, r2: number, h: number, seg: number, at: number[], color: any, dir: number[] = [0, 1, 0], o: any = {}) =>
    P(new THREE.CylinderGeometry(r1, r2, h, seg), color, at, { dir, ...o });
  const lit = (p: any, s = 1) => glow(p, s);
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], s = 0) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex });

  // ---------- chassis ----------
  box(1.95, 0.14, 7.0, [0, 0.82, 0], DARK);
  for (const s of [1, -1]) {
    box(0.2, 0.32, 7.2, [s * 0.65, 0.98, 0], GUN);
    box(0.04, 0.04, 5.6, [s * 1.0, 0.72, 0.2], CYAN);

  }
  // glow underglow strips (re-built explicitly so they glow)
  for (const s of [1, -1]) lit(box(0.05, 0.05, 5.6, [s * 1.0, 0.72, 0.2], CYAN), 1.4);
  for (let i = 0; i < 6; i++) box(1.9, 0.12, 0.14, [0, 0.98, -3.2 + i * 1.2], DARK);
  // drivetrain: differentials and driveshaft
  for (const z of [2.3, -0.7, -2.3]) {
    cyl(0.2, 0.2, 1.8, 8, [0, 0.62, z], BLUED, [1, 0, 0]);
    P(new THREE.SphereGeometry(0.28, 7, 5), STEEL, [0, 0.62, z]);
  }
  cyl(0.07, 0.07, 5.0, 6, [0, 0.72, -0.3], STEEL, [0, 0, 1]);

  // ---------- wheels ----------
  const rg = rng(11);
  for (const z of [2.3, -0.7, -2.3]) {
    for (const s of [1, -1]) {
      const X = s * 1.2;
      const Y = 0.61;
      cyl(0.62, 0.62, 0.52, 10, [X, Y, z], TIRE, [1, 0, 0], { flat: true });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.2;
        box(0.54, 0.07, 0.14, [X, Y + Math.cos(a) * 0.62, z + Math.sin(a) * 0.62], "#0a0b0e", {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      cyl(0.38, 0.38, 0.56, 8, [X, Y, z], STEEL, [1, 0, 0]);
      lit(P(new THREE.TorusGeometry(0.42, 0.03, 4, 12), CYAN, [X + s * 0.29, Y, z], { dir: [s, 0, 0], axis: "z" }), 1.5);
      cyl(0.14, 0.14, 0.62, 6, [X, Y, z], BLUED, [1, 0, 0]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.05, 5, [X + s * 0.3, Y + Math.cos(a) * 0.24, z + Math.sin(a) * 0.24], GUN, [1, 0, 0]);
      }
      // fender and flare
      box(0.7, 0.1, 1.7, [X, 1.34, z], PLATE);
      box(0.1, 0.22, 1.7, [X + s * 0.35, 1.25, z], HULL);
      box(0.7, 0.1, 0.3, [X, 1.28, z + 0.95], PLATE, { rotation: [-25, 0, 0] });
      box(0.7, 0.1, 0.3, [X, 1.28, z - 0.95], PLATE, { rotation: [25, 0, 0] });
    }
  }

  // ---------- cab ----------
  const cabOutline: [number, number][] = [
    [3.4, 1.0],
    [3.4, 1.85],
    [3.0, 2.2],
    [2.3, 2.45],
    [1.75, 3.3],
    [0.9, 3.4],
    [0.9, 1.0],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.05, color: HULL });
  // lower armored sill
  box(2.5, 0.3, 2.6, [0, 1.15, 2.1], PLATE);
  // windshield
  lit(P(new THREE.BoxGeometry(2.1, 0.05, 1.0), "#ffffff", [0, 2.88, 2.03], { dir: [0, 0.543, 0.84], texture: HUD }), 0.7);
  // wipers/frame
  box(2.2, 0.08, 0.08, [0, 3.36, 1.75], DARK);
  for (const s of [1, -1]) {
    box(0.08, 0.1, 1.05, [s * 1.07, 2.88, 2.03], DARK, { rotation: [-57, 0, 0] });
    // side windows & doors
    box(0.05, 0.6, 0.9, [s * 1.2, 2.85, 1.55], "#0a2530");
    box(0.05, 0.05, 0.9, [s * 1.21, 3.17, 1.55], CYAN);
    box(0.03, 1.5, 0.03, [s * 1.205, 2.2, 1.95], DARK);
    box(0.03, 1.5, 0.03, [s * 1.205, 2.2, 1.05], DARK);
    box(0.06, 0.05, 0.22, [s * 1.215, 2.2, 1.85], STEEL);
    decal(EMBLEM, 0.7, 0.7, [s * 1.212, 2.1, 1.5], [s, 0, 0]);
    // armor side plates (angled)
    box(0.12, 0.8, 1.2, [s * 1.22, 1.6, 1.5], PLATE);
    // headlights
    lit(box(0.62, 0.14, 0.05, [s * 0.85, 1.62, 3.42], "#e8ffff"), 1.6);
    lit(box(0.62, 0.05, 0.05, [s * 0.85, 1.78, 3.43], CYAN), 1.6);
    box(0.7, 0.28, 0.1, [s * 0.85, 1.7, 3.4], DARK);
    // mirrors
    box(0.04, 0.04, 0.3, [s * 1.3, 2.8, 2.0], GUN);
    box(0.08, 0.38, 0.22, [s * 1.45, 2.75, 2.15], DARK);
    lit(box(0.02, 0.3, 0.16, [s * 1.45, 2.75, 2.28], CYAN), 1);
    // front tow hooks
    box(0.1, 0.1, 0.3, [s * 0.9, 0.85, 3.7], STEEL);
    // exhaust stacks
    cyl(0.13, 0.11, 2.4, 6, [s * 1.3, 2.3, 0.72], STEEL);
    lit(cyl(0.1, 0.1, 0.05, 6, [s * 1.3, 3.5, 0.72], AMBER), 1.6);
    cyl(0.17, 0.17, 0.12, 6, [s * 1.3, 2.6, 0.72], DARK);
    cyl(0.17, 0.17, 0.12, 6, [s * 1.3, 3.0, 0.72], DARK);
  }
  // grille and bumper
  box(2.0, 0.85, 0.06, [0, 1.43, 3.4], DARK);
  for (let i = -3; i <= 3; i++) lit(box(0.07, 0.6, 0.04, [i * 0.22, 1.42, 3.44], i % 2 ? CYAN : MAG), 1.2);
  box(2.7, 0.5, 0.5, [0, 0.92, 3.58], PLATE, { flat: true });
  box(2.6, 0.15, 0.4, [0, 1.22, 3.65], HAZ, { rotation: [-25, 0, 0] });
  lit(box(2.3, 0.05, 0.05, [0, 0.78, 3.86], MAG), 1.5);
  // bull bar
  for (const x of [-0.9, -0.3, 0.3, 0.9]) box(0.1, 0.9, 0.1, [x, 1.2, 3.92], GUN);
  box(2.1, 0.12, 0.12, [0, 1.65, 3.92], GUN);
  box(2.1, 0.12, 0.12, [0, 0.8, 3.92], GUN);
  // winch
  cyl(0.12, 0.12, 0.6, 8, [0, 0.95, 3.88], STEEL, [1, 0, 0]);
  // hood vents
  for (const z of [2.5, 2.65, 2.8]) {
    const y = 2.45 - (z - 2.3) * (0.25 / 0.7) + 0.03;
    lit(box(0.9, 0.04, 0.07, [-0.55, y, z], AMBER), 1.2);
    lit(box(0.9, 0.04, 0.07, [0.55, y, z], AMBER), 1.2);
  }
  box(0.14, 0.05, 0.9, [0, 2.4, 2.65], DARK, { rotation: [19.6, 0, 0] });
  // roof
  box(2.2, 0.12, 0.9, [0, 3.45, 1.35], PLATE);
  const barCols = [MAG, CYAN, AMBER, CYAN, MAG];
  barCols.forEach((c, i) => lit(box(0.32, 0.12, 0.18, [(i - 2) * 0.36, 3.58, 1.7], c), 1.8));
  // roof turret (left)
  cyl(0.36, 0.4, 0.14, 8, [0.6, 3.58, 1.1], STEEL);
  box(0.55, 0.32, 0.55, [0.6, 3.8, 1.1], HULL);
  box(0.62, 0.1, 0.4, [0.6, 3.98, 1.05], PLATE);
  for (const s of [1, -1]) {
    b.rod([0.6 + s * 0.12, 3.8, 1.3], [0.6 + s * 0.12, 3.8, 2.1], 0.045, STEEL);
    cyl(0.07, 0.07, 0.18, 6, [0.6 + s * 0.12, 3.8, 2.13], DARK, [0, 0, 1]);
  }
  lit(P(new THREE.SphereGeometry(0.08, 6, 4), RED, [0.6, 3.82, 1.4]), 2);
  // radar dish (right)
  cyl(0.06, 0.06, 0.5, 6, [-0.6, 3.75, 1.0], STEEL);
  b.lathe(
    [
      [0, 0],
      [0.12, 0.01],
      [0.38, 0.14],
      [0.38, 0.16],
      [0.12, 0.04],
      [0, 0.04],
    ],
    { at: [-0.6, 4.0, 1.0], axis: [0, 0.7, 0.7], color: BLUED, segments: 8 },
  );
  lit(P(new THREE.SphereGeometry(0.045, 5, 4), CYAN, [-0.6, 4.2, 1.28]), 2);
  // antennas
  for (const [x, h] of [[-1.0, 1.6], [1.0, 1.9], [-0.2, 1.2]] as number[][]) {
    b.rod([x, 3.5, 1.0], [x, 3.5 + h, 0.95], 0.015, GUN);
    lit(P(new THREE.SphereGeometry(0.04, 5, 4), x > 0 ? MAG : CYAN, [x, 3.5 + h, 0.95]), 2);
  }
  // roof sensor dome
  P(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), BLUED, [0, 3.51, 1.0]);

  // ---------- skirts & cargo bed ----------
  for (const s of [1, -1]) {
    box(0.12, 0.5, 1.7, [s * 1.3, 1.1, 0.8], PLATE);
    lit(box(0.02, 0.05, 1.55, [s * 1.37, 0.92, 0.8], CYAN), 1.4);
    box(0.14, 0.2, 1.5, [s * 1.3, 1.35, 0.8], HAZ);
    // bed rails
    box(0.1, 0.5, 4.4, [s * 1.2, 1.6, -1.4], HULL);
    box(0.14, 0.08, 4.4, [s * 1.2, 1.88, -1.4], PLATE);
    decal(SIGN, 1.8, 0.5, [s * 1.262, 1.6, -1.8], [s, 0, 0]);
    lit(
      P(new THREE.PlaneGeometry(1.8, 0.5), "#ffffff", [s * 1.264, 1.6, -1.8], { dir: [s, 0, 0], axis: "z", texture: SIGN }),
      1.0,
    );
    // tool lockers
    box(0.3, 0.45, 1.0, [s * 1.38, 1.62, -0.55], GUN);
    lit(box(0.02, 0.05, 0.8, [s * 1.54, 1.7, -0.55], AMBER), 1.2);
    // tail lights
    lit(box(0.4, 0.2, 0.05, [s * 0.85, 1.55, -3.63], MAG), 1.6);
    box(0.2, 0.15, 0.3, [s * 0.9, 0.9, -3.75], STEEL);
  }
  box(2.5, 0.14, 4.4, [0, 1.3, -1.4], PLATE);
  box(2.5, 0.5, 0.12, [0, 1.6, 0.8], HULL); // bulkhead
  box(2.5, 0.5, 0.1, [0, 1.6, -3.6], HULL);
  box(2.6, 0.3, 0.3, [0, 0.95, -3.7], PLATE);
  lit(box(2.2, 0.06, 0.05, [0, 1.45, -3.67], MAG), 1.4);
  // rear drive camera
  box(0.2, 0.15, 0.1, [0, 1.95, -3.62], DARK);
  lit(P(new THREE.SphereGeometry(0.045, 5, 4), RED, [0, 1.95, -3.7]), 2);

  // ---------- missile pod ----------
  const E = new THREE.Euler((-22 * Math.PI) / 180, 0, 0);
  const C = new THREE.Vector3(0, 2.35, -1.7);
  const L = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyEuler(E).add(C).toArray();
  const D = new THREE.Vector3(0, 0, 1).applyEuler(E).toArray();
  const rot = [-22, 0, 0];
  box(1.8, 0.9, 3.3, C.toArray(), PLATE, { rotation: rot });
  box(1.84, 0.1, 3.0, L(0, 0.48, 0), HAZ, { rotation: rot });
  box(1.5, 0.35, 0.05, L(0, 0.2, -1.66), HULL, { rotation: rot });
  P(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", L(0.92, 0, 0.3), { dir: [1, 0, 0], axis: "z", texture: PODLABEL });
  for (const x of [-0.55, 0, 0.55])
    for (const y of [-0.2, 0.2]) {
      cyl(0.19, 0.19, 0.35, 8, L(x, y, 1.65), DARK, D);
      lit(P(new THREE.TorusGeometry(0.2, 0.025, 4, 8), RED, L(x, y, 1.84), { dir: D, axis: "z" }), 1.6);
      P(new THREE.ConeGeometry(0.13, 0.35, 6), "#c9d2dc", L(x, y, 1.7), { dir: D });
    }
  // hinge and hydraulic ram
  cyl(0.12, 0.12, 2.2, 8, [0, 1.62, -3.0], STEEL, [1, 0, 0]);
  for (const s of [1, -1]) {
    box(0.14, 0.7, 0.14, [s * 0.9, 1.7, -3.0], GUN);
    b.rod([s * 0.7, 1.45, -1.6], L(s * 0.7, -0.45, -0.8), 0.07, STEEL);
    b.rod([s * 0.7, 1.45, -1.6], [s * 0.7, 1.75, -1.2], 0.1, GUN);
    box(0.1, 0.35, 0.1, [s * 0.9, 1.55, -0.4], GUN);
  }

  // ---------- cable and detail clutter ----------
  const rc = rng(5);
  for (let i = 0; i < 8; i++) {
    const x = (rc() - 0.5) * 2.0;
    const z = -3.3 + rc() * 3.6;
    cyl(0.04, 0.04, 0.5 + rc() * 0.4, 5, [x, 1.5, z], [GUN, STEEL, DARK][i % 3], [0, 1, 0]);
  }
  for (let i = 0; i < 5; i++) lit(box(0.09, 0.05, 0.05, [-0.55 + i * 0.28, 1.4, 0.7], [CYAN, MAG, AMBER, CYAN, MAG][i]), 1.5);
  // cab roof hazard bar and hood decal
  box(1.5, 0.04, 0.1, [0, 3.52, 0.95], HAZ);
  decal(EMBLEM, 0.5, 0.5, [0, 1.45, 3.48], [0, 0, 1]);

  return b.root;
}
