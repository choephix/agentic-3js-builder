import * as THREE from "three";
import { createBuilder, arc, catmull, spiral, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Vintage Dutch city bicycle",
  description:
    "Mint-green step-through roadster with upright chrome bars, cream grips, a silver bell, a leather sprung saddle, chrome mudguards, a chain guard, a wicker basket of sunflowers and a baguette, and whitewall tyres.",
};

// Palette
const FRAME = "#9fd9b8"; // mint green
const CREAM = "#f4ead2";
const CHROME = "#d5dade";
const LEATHER = "#7b4a2b";
const TYRE = "#1d1d1f";
const WHITEWALL = "#f2ecdc";
const DARK = "#2a2a2a";
const WICKER_A = "#c9a25e";
const WICKER_B = "#9c7238";
const RIM = "#8a5a2b";
const STEM = "#5f8f3b";
const LEAF = "#4e9447";

// Sunflower drawing: 16 yellow petals round a brown centre, transparent background.
function sunflowerSvg(): string {
  let petals = "";
  for (let k = 0; k < 16; k++) {
    petals += `<ellipse cx="50" cy="24" rx="8" ry="16" fill="#f2b10d" stroke="#c98a00" stroke-width="1.5" transform="rotate(${k * 22.5} 50 50)"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${petals}<circle cx="50" cy="50" r="19" fill="#5a3314"/><circle cx="50" cy="50" r="12" fill="#3a1f0b"/></svg>`;
}

export default function build() {
  const b = createBuilder({ name: "dutch-bike" });

  // ---------- Frame (mint green), bottom bracket at (0, 0.30, 0) ----------
  b.rod([0, 0.30, 0], [0, 0.78, -0.16], 0.02, { color: FRAME }); // seat tube
  b.rod([0, 0.30, 0], [0, 0.72, 0.56], 0.022, { color: FRAME }); // down tube
  b.rod([0, 0.78, -0.16], [0, 0.98, 0.56], 0.02, { color: FRAME }); // top tube
  b.rod([0, 0.72, 0.56], [0, 0.98, 0.56], 0.026, { color: FRAME }); // head tube
  b.rod([0, 0.78, -0.16], [0, 0.82, -0.17], 0.014, { color: CHROME }); // seat post

  for (const s of [1, -1]) {
    b.rod([s * 0.02, 0.76, -0.16], [s * 0.045, 0.34, -0.35], 0.011, { color: FRAME }); // seat stays
    b.rod([s * 0.02, 0.30, 0], [s * 0.045, 0.34, -0.35], 0.011, { color: FRAME }); // chain stays
    b.rod([s * 0.03, 0.70, 0.56], [s * 0.045, 0.34, 0.72], 0.013, { color: FRAME }); // fork legs
  }

  // Kickstand
  b.rod([0.03, 0.3, -0.1], [0.07, 0.02, -0.22], 0.008, { color: CHROME });

  // ---------- Steering: stem, upright bars, cream grips, bell ----------
  b.rod([0, 0.98, 0.56], [0, 1.14, 0.44], 0.018, { color: CHROME });
  b.sweep(
    catmull([
      [-0.3, 1.2, 0.3],
      [-0.22, 1.15, 0.4],
      [0, 1.14, 0.44],
      [0.22, 1.15, 0.4],
      [0.3, 1.2, 0.3],
    ]),
    0.011,
    { color: CHROME },
  );
  for (const s of [1, -1]) {
    b.capsule([s * 0.3, 1.2, 0.28], [s * 0.31, 1.19, 0.13], 0.019, { color: CREAM });
  }
  // Silver bell on the right bar
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.042, 0.012],
      [0.03, 0.03],
      [0.012, 0.04],
      [0, 0.045],
    ],
    { at: [0.12, 1.14, 0.43], smoothing: 1, color: CHROME },
  );
  // Basket brackets from the bars
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 1.13, 0.43], [s * 0.14, 0.92, 0.78], 0.007, { color: CHROME });
  }

  // ---------- Saddle (brown leather) with a coil spring ----------
  b.extrude(
    [
      [-0.14, 0.04],
      [-0.06, 0.08],
      [0.06, 0.085],
      [0.13, 0.05],
      [0.14, 0.02],
      [0.1, 0.0],
      [-0.1, 0.0],
    ],
    { at: [0, 0.8, -0.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.09, bevel: 0.01, smoothing: 1, color: LEATHER },
  );
  b.sweep(spiral([0, 0.74, -0.24], [0.025, 0.74, -0.24], [0, 1, 0], { turns: 3, pitch: 0.02 }), 0.003, {
    color: CHROME,
  });

  // ---------- Wheels: whitewall tyres, chrome rims, spokes ----------
  const wheel = (z: number) => {
    const c = [0, 0.34, z];
    b.part(new THREE.TorusGeometry(0.3, 0.04, 8, 28), TYRE, { at: c, rotation: [0, 90, 0] });
    for (const s of [1, -1]) {
      b.part(new THREE.TorusGeometry(0.318, 0.011, 6, 28), WHITEWALL, {
        at: [s * 0.036, 0.34, z],
        rotation: [0, 90, 0],
      });
    }
    b.part(new THREE.TorusGeometry(0.265, 0.008, 6, 28), CHROME, { at: c, rotation: [0, 90, 0] });
    b.rod([-0.05, 0.34, z], [0.05, 0.34, z], 0.02, { color: CHROME }); // hub
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const rim = [0, 0.34 + 0.265 * Math.cos(a), z + 0.265 * Math.sin(a)];
      for (const s of [1, -1]) {
        const ha = a + 0.9;
        const hub = [s * 0.03, 0.34 + 0.03 * Math.cos(ha), z + 0.03 * Math.sin(ha)];
        b.rod(hub, rim, 0.0025, { color: CHROME });
      }
    }
  };
  wheel(0.72); // front
  wheel(-0.35); // rear

  // ---------- Chrome mudguards over each wheel ----------
  const fender = (z: number) => {
    const R = 0.38;
    const a0 = (-55 * Math.PI) / 180;
    const c = [0, 0.34, z];
    const from = [0, 0.34 + R * Math.cos(a0), z + R * Math.sin(a0)];
    b.sweep(arc(c, from, [1, 0, 0], 110), [0.028, 0.004], { section: "box", color: CHROME });
  };
  fender(0.72);
  fender(-0.35);

  // ---------- Drivetrain: chainring, guard, sprocket, chain, cranks ----------
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.006, 24), DARK, { at: [0.045, 0.3, 0], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 20), DARK, { at: [0.035, 0.34, -0.35], rotation: [0, 0, 90] });
  b.rod([0.045, 0.39, 0], [0.035, 0.39, -0.35], 0.005, { color: DARK }); // chain top run
  b.rod([0.045, 0.21, 0], [0.035, 0.29, -0.35], 0.005, { color: DARK }); // chain bottom run

  // Chain guard: a half-shell over the chainring, on the drive side
  const guard: [number, number][] = [];
  for (let k = 0; k <= 8; k++) {
    const a = (k * Math.PI) / 8;
    guard.push([0.13 * Math.cos(a), 0.13 * Math.sin(a)]);
  }
  b.extrude(guard, { at: [0.065, 0.3, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: FRAME });

  b.rod([0.09, 0.3, 0], [0.09, 0.19, 0.04], 0.01, { color: DARK });
  b.rod([-0.09, 0.3, 0], [-0.09, 0.41, -0.04], 0.01, { color: DARK });
  b.part(new THREE.BoxGeometry(0.11, 0.02, 0.06), DARK, { at: [0.09, 0.18, 0.05] });
  b.part(new THREE.BoxGeometry(0.11, 0.02, 0.06), DARK, { at: [-0.09, 0.42, -0.05] });

  // ---------- Handlebar grips and front wicker basket ----------
  const weave = paint((_p, _n, s) => ((Math.floor(s[0] * 28) + Math.floor(s[1] / 30)) % 2 === 0 ? WICKER_A : WICKER_B));
  b.frustumBox([0, 0.86, 0.86], [0, 1.04, 0.86], [0.26, 0.2], [0.3, 0.23], { color: weave });
  b.sweep(
    catmull(
      [
        [-0.15, 1.04, 0.745],
        [0.15, 1.04, 0.745],
        [0.15, 1.04, 0.975],
        [-0.15, 1.04, 0.975],
      ],
      { closed: true },
    ),
    0.011,
    { color: RIM },
  );

  // Baguette lying across the top of the basket
  const crust = paint((_p, _n, s) => ((s[0] * 9) % 1 < 0.6 ? "#d9a05b" : "#b87a3a"));
  b.sweep(
    catmull([
      [-0.14, 1.08, 0.8],
      [0, 1.09, 0.87],
      [0.14, 1.08, 0.95],
    ]),
    0.024,
    { color: crust, caps: "round" },
  );

  // Sunflowers: textured discs on stems, drawn on both faces
  const sun = svg(sunflowerSvg(), { size: 256 });
  const flowers = [
    { p: [-0.1, 1.22, 0.9], d: [-0.3, 0.6, 1] },
    { p: [0.02, 1.3, 0.92], d: [0, 0.5, 1] },
    { p: [0.11, 1.24, 0.88], d: [0.4, 0.5, 1] },
    { p: [-0.03, 1.17, 0.98], d: [0, 0.2, 1] },
    { p: [0.06, 1.16, 0.99], d: [0.2, 0.3, 1] },
  ];
  for (const { p, d } of flowers) {
    b.rod([p[0] * 0.4, 0.98, 0.86], p, 0.006, { color: STEM });
    b.part(new THREE.CircleGeometry(0.07, 20), "#ffffff", { at: p, dir: d, axis: "z", texture: sun });
    b.part(new THREE.CircleGeometry(0.07, 20), "#ffffff", {
      at: p,
      dir: [-d[0], -d[1], -d[2]],
      axis: "z",
      texture: sun,
    });
  }

  // Two leaves tucked at the basket rim
  const leaf: [number, number][] = [
    [0, 0],
    [0.04, 0.03],
    [0.1, 0.01],
    [0.04, -0.02],
  ];
  b.extrude(leaf, {
    at: [-0.08, 1.07, 0.92],
    x: [0.7071, 0, 0.7071],
    y: [0, 1, 0],
    thickness: 0.004,
    bevel: 0.002,
    smoothing: 2,
    color: LEAF,
  });
  b.extrude(leaf, {
    at: [0.1, 1.06, 0.8],
    x: [-0.7071, 0, 0.7071],
    y: [0, 1, 0],
    thickness: 0.004,
    bevel: 0.002,
    smoothing: 2,
    color: LEAF,
  });

  // Grips and pedals are placed; return the bike
  return b.root;
}
