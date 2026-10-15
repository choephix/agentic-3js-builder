import * as THREE from "three";
import { createBuilder, catmull, gradient, grain, spiral, svg } from "../../../../src/index";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A Freljord-style two-sided battle axe: a crescent blade with jagged ice teeth and glowing frost veins, a swept-back pick, hex ice crystals, a fur-cuffed leather grip and a bone-fang charm, planted in a snow mound.",
};

// Palette
const NAVY = "#17304f";
const STEEL = "#3c6e9e";
const ICE = "#9fdcf5";
const FROST = "#e8f9ff";
const GLOW = "#58e6ff";
const IRON = "#252e3d";
const BRONZE = "#a9824a";
const LEATHER = "#4d3629";
const LEATHER_LIGHT = "#7a5a40";
const FUR = "#f1f4f6";
const FUR_SHADE = "#b7c5cf";
const BONE = "#dcd2b8";
const SNOW = "#dfeef6";

type P3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("axe", { at: [0, 0.7, 0] });

  // ---------- helpers ----------
  const crystal = (base: P3, dir: P3, len: number, r: number, color = ICE) => {
    const d = new THREE.Vector3(...dir).normalize();
    const bv = new THREE.Vector3(...base);
    const mid = bv.clone().addScaledVector(d, len * 0.62).toArray() as P3;
    const tip = bv.clone().addScaledVector(d, len).toArray() as P3;
    b.rod(base, mid, r, color, { section: { ngon: 6 } });
    b.spike(mid, tip, null, r, color, { section: { ngon: 6 } });
  };

  // ---------- snow mound with ice shards ----------
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.25, 0.04],
      [0.17, 0.1],
      [0.08, 0.15],
      [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 9, color: SNOW },
  );
  b.ring(frame0([0, 0.05, 0]), { count: 7, radius: 0.17, tilt: 50 }, (item) =>
    b.spike(item, item, 0.12 + 0.05 * (item.i % 3), 0.032, item.i % 2 ? ICE : FROST, { section: { ngon: 5 } }),
  );

  // ---------- haft ----------
  b.rod([0, 0.12, 0], [0, 1.42, 0], [0.026, 0.03], {
    color: grain("#3a4b60", "#26334a", { size: 0.02 }),
    sides: 8,
  });

  // butt cap
  b.spike([0, 0.22, 0], [0, 0, 0], null, 0.045, IRON, { section: { ngon: 6 } });
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.057, 0.03],
      [0.057, 0.07],
      [0.04, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.2, 0], segments: 8, color: IRON },
  );
  torus(b, 0.2 + 0.1, 0.06, 0.008, GLOW);

  // grip: leather core + spiral wrap + bronze end rings
  b.rod([0, 0.33, 0], [0, 0.86, 0], 0.035, LEATHER, { sides: 8, caps: "flat" });
  b.sweep(spiral([0, 0.33, 0], [0.037, 0.33, 0], [0, 1, 0], { turns: 9.5, r1: 0.037, pitch: 0.056 }), 0.0075, LEATHER_LIGHT, {
    sides: 5,
  });
  torus(b, 0.33, 0.04, 0.01, BRONZE);
  torus(b, 0.86, 0.04, 0.01, BRONZE);

  // fur cuff
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.05, 0.05],
      [0.045, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.88, 0], segments: 8, color: FUR_SHADE },
  );
  b.ring(frame0([0, 0.96, 0]), { count: 9, radius: 0.04, tilt: -42 }, (item) =>
    b.spike(item, item, 0.14, 0.03, FUR, { section: { ngon: 5 } }),
  );
  b.ring(frame0([0, 0.92, 0]), { count: 8, radius: 0.045, fromDeg: 22.5, toDeg: 337.5, tilt: -60 }, (item) =>
    b.spike(item, item, 0.15, 0.028, FUR_SHADE, { section: { ngon: 5 } }),
  );
  b.ring(frame0([0, 0.98, 0]), { count: 7, radius: 0.04, tilt: -5 }, (item) =>
    b.spike(item, item, 0.08, 0.026, FUR, { section: { ngon: 5 } }),
  );

  // ---------- head socket ----------
  b.lathe(
    [
      [0, -0.18],
      [0.06, -0.18],
      [0.078, -0.15],
      [0.052, -0.12],
      [0.052, 0.12],
      [0.078, 0.15],
      [0.06, 0.18],
      [0, 0.18],
    ],
    { at: [0, 1.3, 0], segments: 8, color: IRON },
  );
  torus(b, 1.3, 0.056, 0.009, GLOW);
  torus(b, 1.17, 0.07, 0.008, BRONZE);
  torus(b, 1.43, 0.07, 0.008, BRONZE);
  // iron prongs running down the haft
  b.ring(frame0([0, 1.14, 0]), { count: 4, radius: 0.04, fromDeg: 45, toDeg: 315 }, (item) =>
    b.spike(item, [0, -1, 0], 0.2, 0.016, IRON, { section: { ngon: 4 } }),
  );
  // front/back gems
  for (const s of [1, -1]) {
    b.part(new THREE.OctahedronGeometry(0.028), GLOW, {
      at: [0, 1.3, s * 0.062],
      scale: [1, 1.5, 0.7],
    });
  }

  // top spear point
  b.rod([0, 1.45, 0], [0, 1.52, 0], 0.036, BRONZE, { section: { ngon: 4 } });
  b.spike([0, 1.52, 0], [0, 1.86, 0], null, 0.048, ICE, { section: { ngon: 4 } });

  // ---------- main blade ----------
  const bladeOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0.04, 0.17, "sharp"],
    [0.13, 0.31, "sharp"],
    [0.19, 0.22, "sharp"],
    [0.31, 0.43, "sharp"],
    [0.36, 0.3, "sharp"],
    [0.52, 0.54, "sharp"],
    [0.6, 0.34],
    [0.65, 0.1],
    [0.63, -0.14],
    [0.55, -0.32],
    [0.45, -0.46, "sharp"],
    [0.33, -0.3, "sharp"],
    [0.27, -0.38, "sharp"],
    [0.19, -0.22, "sharp"],
    [0.11, -0.3, "sharp"],
    [0.04, -0.14, "sharp"],
  ];
  const bladePaint = gradient(
    gradient(NAVY, STEEL, [0.05, 1.3, 0], [0.32, 1.3, 0]),
    FROST,
    [0.4, 1.3, 0],
    [0.68, 1.3, 0],
  );
  b.extrude(bladeOutline, {
    at: [0, 1.3, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.008,
    smoothing: 1,
    color: bladePaint,
  });

  // snowflake emblem + frost veins on both faces
  const flake = svg(snowflakeSvg(), { size: 256 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
      at: [0.37, 1.3, s * 0.0235],
      dir: [0, 0, s],
      axis: "z",
      up: [0, 1, 0],
      texture: flake,
    });
    b.sweep(
      catmull([
        [0.54, 1.6, s * 0.021],
        [0.6, 1.38, s * 0.021],
        [0.59, 1.17, s * 0.021],
        [0.5, 1.0, s * 0.021],
      ]),
      [0.004, 0.009],
      GLOW,
      { sides: 5 },
    );
  }

  // ---------- pick (rear) ----------
  b.extrude(
    [
      [0.04, 0.12],
      [0.22, 0.15],
      [0.4, 0.22],
      [0.58, 0.34, "sharp"],
      [0.42, 0.06],
      [0.24, -0.04],
      [0.04, -0.09],
    ],
    {
      at: [0, 1.3, 0],
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.05, 0.014],
      bevel: 0.007,
      smoothing: 1,
      color: gradient(gradient(NAVY, STEEL, [-0.05, 1.3, 0], [-0.25, 1.3, 0]), FROST, [-0.3, 1.3, 0], [-0.58, 1.3, 0]),
    },
  );

  // ---------- ice crystal clusters ----------
  crystal([-0.1, 1.38, 0], [-0.35, 1, 0], 0.3, 0.04);
  crystal([-0.08, 1.37, 0.03], [-0.3, 0.7, 0.8], 0.2, 0.03, FROST);
  crystal([-0.08, 1.37, -0.03], [-0.3, 0.7, -0.8], 0.22, 0.03, FROST);
  for (const s of [1, -1]) {
    crystal([0.1, 1.2, s * 0.02], [0.25, -0.35, s * 1], 0.17, 0.026, ICE);
    crystal([0.14, 1.42, s * 0.02], [0.2, 0.5, s * 1], 0.14, 0.022, FROST);
    crystal([0.22, 1.18, s * 0.02], [0.5, -0.2, s * 1], 0.1, 0.018, ICE);
  }

  // ---------- hanging cords with bone fangs ----------
  for (const s of [1, -1]) {
    const cord = catmull([
      [s * 0.05, 1.11, 0.045],
      [s * 0.08, 1.02, 0.075],
      [s * 0.07, 0.92, 0.065],
    ]);
    b.sweep(cord, 0.006, LEATHER, { sides: 5 });
    b.spike([s * 0.07, 0.93, 0.065], [0, -1, 0], 0.11, 0.02, BONE, { section: { ngon: 5 } });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRONZE, { at: [s * 0.075, 0.99, 0.073] });
  }

  return b.root;

  function frame0(at: P3) {
    return { at, axis: [0, 1, 0] as P3 } as any;
  }
}

function torus(b: ReturnType<typeof createBuilder>, y: number, R: number, r: number, color: string) {
  b.part(new THREE.TorusGeometry(R, r, 5, 12), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z" });
}

function snowflakeSvg() {
  const arm = `<line x1="50" y1="50" x2="50" y2="8"/><polyline points="39,19 50,30 61,19"/><polyline points="42,35 50,42 58,35"/>`;
  const arms = [0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a} 50 50)">${arm}</g>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="#6fefff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">${arms}<circle cx="50" cy="50" r="7"/></g></svg>`;
}
