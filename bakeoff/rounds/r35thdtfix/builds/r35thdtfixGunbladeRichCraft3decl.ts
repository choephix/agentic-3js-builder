import * as THREE from "three";
import {
  countershade,
  createBuilder,
  grain,
  mottle,
  spiral,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Aether Gunblade",
  description:
    "A Final Fantasy-inspired gunblade: a broad rune-etched sword fused to a side-mounted firearm, with ornate gold fittings, a wrapped grip, crystals, vents, rivets, and a heavy muzzle.",
};

const STEEL = countershade(
  mottle("#b9c9df", "#53647f", { size: 0.11, contrast: 1.2, seed: 4 }),
  "#37445e",
  { level: -0.16, soft: 0.28 },
);

const DARK_STEEL = grain("#182238", "#526785", {
  size: 0.035,
  axis: [0, 1, 0],
  seed: 17,
});

const BLUE_STEEL = countershade(
  mottle("#334da0", "#14215b", { size: 0.075, contrast: 1.4, seed: 8 }),
  "#101a43",
  { level: -0.05, soft: 0.22 },
);

const GOLD = countershade(
  mottle("#f2c866", "#8d501b", { size: 0.055, contrast: 1.35, seed: 12 }),
  "#5e3212",
  { level: 0.02, soft: 0.3 },
);

const DARK_GOLD = mottle("#9b5a1d", "#45200f", {
  size: 0.045,
  contrast: 1.3,
  seed: 29,
});

const LEATHER = grain("#321e2a", "#120d18", {
  size: 0.023,
  axis: [0, 1, 0],
  seed: 33,
});

const RUBBER = mottle("#171522", "#05060b", {
  size: 0.035,
  contrast: 1.5,
  seed: 39,
});

const INK = "#110d1c";
const IVORY = "#f3e6c1";
const RED = "#c92848";
const RED_DARK = "#5e1027";
const CYAN = "#52d8ff";
const CYAN_DARK = "#155a9d";

const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300">
    <defs>
      <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff4aa"/>
        <stop offset=".42" stop-color="#d9a83d"/>
        <stop offset="1" stop-color="#7e2b9d"/>
      </linearGradient>
      <filter id="g"><feGaussianBlur stdDeviation="1.6"/></filter>
    </defs>
    <path d="M50 8 L61 55 L92 78 L63 91 L77 140 L50 123 L23 140 L37 91 L8 78 L39 55 Z"
      fill="none" stroke="#73d9ff" stroke-width="7" opacity=".36" filter="url(#g)"/>
    <path d="M50 8 L61 55 L92 78 L63 91 L77 140 L50 123 L23 140 L37 91 L8 78 L39 55 Z"
      fill="none" stroke="url(#r)" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 145 L50 285 M27 177 L50 198 L73 177 M30 231 L50 250 L70 231"
      fill="none" stroke="#e9c967" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="78" r="7" fill="#fff6bf"/>
    <circle cx="50" cy="78" r="13" fill="none" stroke="#64ddff" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const CREST = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <defs>
      <radialGradient id="c"><stop stop-color="#ffeaa0"/><stop offset=".46" stop-color="#d38b27"/><stop offset="1" stop-color="#6d2d1a"/></radialGradient>
    </defs>
    <path d="M80 8 L96 47 L143 52 L108 83 L118 132 L80 108 L42 132 L52 83 L17 52 L64 47 Z"
      fill="#1a1733" stroke="#f5c75b" stroke-width="7" stroke-linejoin="round"/>
    <path d="M80 28 L91 57 L122 60 L99 80 L106 110 L80 94 L54 110 L61 80 L38 60 L69 57 Z"
      fill="url(#c)" stroke="#fff0aa" stroke-width="3"/>
    <circle cx="80" cy="69" r="13" fill="#4fe2ff" stroke="#132a68" stroke-width="5"/>
    <path d="M80 55 L84 67 L97 69 L86 77 L89 90 L80 83 L71 90 L74 77 L63 69 L76 67 Z"
      fill="#ffffff" opacity=".85"/>
  </svg>`,
  { size: 256 },
);

const WRAP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <rect width="64" height="128" fill="#24182a"/>
    <path d="M-12 18 L76 2 M-12 45 L76 29 M-12 72 L76 56 M-12 99 L76 83 M-12 126 L76 110"
      stroke="#b57a38" stroke-width="9"/>
    <path d="M-12 18 L76 2 M-12 45 L76 29 M-12 72 L76 56 M-12 99 L76 83 M-12 126 L76 110"
      stroke="#f1c05b" stroke-width="2"/>
    <path d="M0 8 L64 -4 M0 35 L64 23 M0 62 L64 50 M0 89 L64 77 M0 116 L64 104"
      stroke="#4d2d53" stroke-width="2" opacity=".9"/>
  </svg>`,
  { size: 128 },
);

const LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90">
    <rect x="4" y="4" width="232" height="82" rx="12" fill="#16132c" stroke="#e5b84e" stroke-width="6"/>
    <path d="M24 64 L42 22 L60 64 M31 50 H53 M180 64 L198 22 L216 64 M187 50 H209"
      fill="none" stroke="#56d8ff" stroke-width="5" stroke-linecap="round"/>
    <text x="120" y="59" text-anchor="middle" font-family="serif" font-size=" thirty" font-weight="bold"
      fill="#f3d271" font-size="30" letter-spacing="4">AETHER</text>
  </svg>`,
  { size: 256 },
);

const WARNING = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 64">
    <path d="M8 56 L32 8 L56 56 Z" fill="#e1aa32" stroke="#1a1525" stroke-width="6"/>
    <path d="M32 22 V40 M32 47 V49" stroke="#191321" stroke-width="6" stroke-linecap="round"/>
    <text x="72" y="39" font-family="sans-serif" font-size="24" font-weight="bold"
      fill="#f5c960">LIMIT BREAK</text>
  </svg>`,
  { size: 256 },
);

const EDGE_GLYPH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 260">
    <path d="M40 5 L63 48 L40 78 L57 117 L40 151 L22 117 L40 78 L17 48 Z"
      fill="none" stroke="#69e8ff" stroke-width="5"/>
    <path d="M40 158 V250 M24 188 L40 205 L56 188" fill="none"
      stroke="#f5c95a" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({
    name: "aether-gunblade",
    detail: 1,
    paintSize: 2048,
  });

  const box = (
    name: string,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: any,
    rotation?: readonly [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  function sphere(
    name: string,
    radiusOrAt: number | readonly [number, number, number],
    atOrRadius: readonly [number, number, number] | number,
    color: any,
    scale?: readonly [number, number, number],
  ) {
    const radius = typeof radiusOrAt === "number" ? radiusOrAt : atOrRadius as number;
    const at = (typeof radiusOrAt === "number"
      ? atOrRadius
      : radiusOrAt) as readonly [number, number, number];

    return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      scale,
      name,
      flat: true,
    });
  }

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: readonly [number, number, number],
    color: any,
    dir: readonly [number, number, number] = [0, 1, 0],
    segments = 10,
    axis: "x" | "y" | "z" = "y",
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      axis,
      name,
      flat: true,
    });

  const torus = (
    name: string,
    major: number,
    minor: number,
    at: readonly [number, number, number],
    color: any,
    dir: readonly [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 14), color, {
      at,
      dir,
      axis: "z",
      name,
      flat: true,
    });

  const rod = (
    name: string,
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius: number,
    color: any,
  ) =>
    b.rod(a, c, radius, color, {
      name,
      section: { ngon: 6 },
      caps: "round",
    });

  const spike = (
    name: string,
    at: readonly [number, number, number],
    dir: readonly [number, number, number],
    length: number,
    radius: number,
    color: any,
  ) =>
    b.spike(at, dir, length, radius, color, {
      name,
      section: { ngon: 6 },
      caps: "point",
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Hero blade: a broad, slightly gothic profile with a dark fuller and raised edge rails.

  const blade = b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.17, 0.14],
      [0.165, 0.66],
      [0.115, 1.08],
      [0.055, 1.29],
      [0, 1.43],
      [-0.055, 1.29],
      [-0.115, 1.08],
      [-0.165, 0.66],
      [-0.17, 0.14],
    ],
    {
      at: [0, 0.66, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      smoothing: 1,
      color: STEEL,
      name: "blade.core",
      group: "blade",
    },
  );

  b.extrude(
    [
      [-0.057, 0.08],
      [0.057, 0.08],
      [0.076, 0.62],
      [0.042, 0.98],
      [0, 1.28],
      [-0.042, 0.98],
      [-0.076, 0.62],
    ],
    {
      at: [0, 0.67, 0.027],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: DARK_STEEL,
      name: "blade.fuller",
      group: "blade",
    },
  );

  b.extrude(
    [
      [-0.031, 0.11],
      [0.031, 0.11],
      [0.031, 0.55],
      [0, 0.88],
      [-0.031, 0.55],
    ],
    {
      at: [0, 0.68, 0.039],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: BLUE_STEEL,
      name: "blade.inner.inlay",
      group: "blade",
    },
  );

  rod("blade.edgeL.lower", [-0.13, 0.67, 0.033], [-0.17, 1.32, 0.033], 0.012, IVORY);
  rod("blade.edgeL.tip", [-0.17, 1.32, 0.033], [0, 2.09, 0.033], 0.012, IVORY);
  rod("blade.edgeR.lower", [0.13, 0.67, 0.033], [0.17, 1.32, 0.033], 0.012, IVORY);
  rod("blade.edgeR.tip", [0.17, 1.32, 0.033], [0, 2.09, 0.033], 0.012, IVORY);

  rod("blade.rear.spine", [0, 0.67, -0.034], [0, 2.06, -0.034], 0.016, DARK_STEEL);
  rod("blade.spine.highlight", [0.012, 0.74, -0.04], [0.012, 1.92, -0.04], 0.005, GOLD);

  for (const y of [1.02, 1.22, 1.42]) {
    spike(`blade.serration.${y}`, [0.156, y, -0.008], [1, 0, 0], 0.075, 0.017, GOLD);
    sphere(`blade.rivet.${y}`, [0.154, y - 0.025, 0.043] as any, 0.014, DARK_GOLD);
  }

  // Rune decal and a narrow edge glyph make the blade read as an heirloom weapon rather than a plain sword.
  b.decal(blade, RUNE, {
    at: [0, 1.42, 0.035],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.105, 0.54],
    segments: [4, 12],
    lift: 0.004,
    name: "blade.rune",
    group: "blade",
  });

  b.part(new THREE.PlaneGeometry(0.042, 0.32), "#ffffff", {
    at: [-0.105, 1.36, 0.039],
    dir: [0, 0, 1],
    axis: "z",
    texture: EDGE_GLYPH,
    name: "blade.edge.glyph",
    group: "blade",
  });

  // Small diamond windows inset into the blade's shoulders.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0.0],
        [0.038, 0.04],
        [0, 0.085],
        [-0.038, 0.04],
      ],
      {
        at: [s * 0.103, 0.93, 0.041],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        color: CYAN_DARK,
        name: `blade.window.${s}`,
        group: "blade",
      },
    );
    sphere(`blade.window.gem.${s}`, [s * 0.103, 0.97, 0.051], 0.011, CYAN);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Crossguard: a heavy gold wing with blue inlay, hooked ends, and a central crystal socket.

  const guard = b.extrude(
    [
      [-0.54, -0.035],
      [-0.43, -0.09],
      [-0.22, -0.074],
      [-0.115, -0.045],
      [0.115, -0.045],
      [0.22, -0.074],
      [0.43, -0.09],
      [0.54, -0.035],
      [0.49, 0.052],
      [0.31, 0.092],
      [0.16, 0.067],
      [-0.16, 0.067],
      [-0.31, 0.092],
      [-0.49, 0.052],
    ],
    {
      at: [0, 0.65, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.07,
      bevel: 0.014,
      smoothing: 1,
      color: GOLD,
      name: "crossguard.gold",
      group: "guard",
    },
  );

  b.extrude(
    [
      [-0.39, -0.012],
      [-0.2, -0.035],
      [-0.08, -0.018],
      [0.08, -0.018],
      [0.2, -0.035],
      [0.39, -0.012],
      [0.34, 0.028],
      [0.12, 0.042],
      [-0.12, 0.042],
      [-0.34, 0.028],
    ],
    {
      at: [0, 0.65, 0.038],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      color: BLUE_STEEL,
      name: "crossguard.blue.inlay",
      group: "guard",
    },
  );

  for (const s of [-1, 1]) {
    spike(`guard.hook.${s}`, [s * 0.46, 0.66, 0], [s, 0.1, 0], 0.16, 0.054, GOLD);
    sphere(`guard.end.gem.${s}`, [s * 0.47, 0.675, 0.055], 0.028, RED);
    torus(`guard.end.ring.${s}`, 0.047, 0.008, [s * 0.47, 0.675, 0.01], DARK_GOLD);
  }

  cylinder("guard.central.socket", 0.083, 0.07, [0, 0.65, 0.04], DARK_GOLD, [0, 0, 1], 10);
  sphere("guard.central.crystal", [0, 0.65, 0.102], 0.057, RED, [0.72, 1.3, 0.72]);
  sphere("guard.central.crystal.highlight", [-0.017, 0.676, 0.145], 0.012, IVORY);

  for (const x of [-0.29, -0.17, 0.17, 0.29]) {
    cylinder(`guard.rivet.front.${x}`, 0.014, 0.012, [x, 0.65, 0.052], GOLD, [0, 0, 1], 8);
  }

  // Decorative side fins behind the guard.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, -0.03],
        [0.07, -0.02],
        [0.17, 0.035],
        [0.12, 0.105],
        [0.045, 0.12],
        [0, 0.075],
      ],
      {
        at: [s * 0.39, 0.65, -0.035],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.006,
        color: DARK_GOLD,
        name: `guard.rear.fin.${s}`,
        group: "guard",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Grip and pommel: chunky leather, bright binding rings, and a faceted bottom jewel.

  b.capsule([0, 0.105, 0], [0, 0.545, 0], 0.079, LEATHER, {
    name: "grip.leather",
    section: { ngon: 8 },
    caps: "round",
  });

  const wrapPath = spiral(
    [0, 0.115, 0],
    [0.081, 0.115, 0],
    [0, 0.43, 0],
    { turns: 5.5, pitch: 0.078 },
  );
  b.sweep(wrapPath, 0.008, {
    color: GOLD,
    name: "grip.wrapped.binding",
    section: { ngon: 6 },
    caps: "round",
  });

  b.part(new THREE.PlaneGeometry(0.115, 0.33), "#ffffff", {
    at: [0, 0.31, 0.082],
    dir: [0, 0, 1],
    axis: "z",
    texture: WRAP,
    name: "grip.wrap.texture",
    group: "grip",
  });

  for (const y of [0.13, 0.225, 0.32, 0.415, 0.51]) {
    torus(`grip.gold.band.${y}`, 0.079, 0.009, [0, y, 0], GOLD);
  }

  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.092, 0.025],
      [0.108, 0.065],
      [0.093, 0.105],
      [0.065, 0.137],
      [0, 0.157],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: DARK_STEEL,
      name: "pommel.core",
      group: "pommel",
    },
  );

  torus("pommel.gold.rim", 0.091, 0.012, [0, 0.064, 0], GOLD);
  torus("pommel.gold.neck", 0.067, 0.009, [0, 0.132, 0], GOLD);
  sphere("pommel.crystal", [0, 0.054, 0.058], 0.041, RED, [0.8, 1.15, 0.8]);
  sphere("pommel.crystal.glint", [-0.012, 0.073, 0.089], 0.009, IVORY);

  // ---------------------------------------------------------------------------------------------------------------
  // Side-mounted gun: receiver, barrel, muzzle, vents, trigger cage, and a decorated cheek plate.

  box("gun.receiver.main", [0.34, 0.19, 0.23], [0.205, 0.78, 0.015], DARK_STEEL);
  box("gun.receiver.lower", [0.27, 0.11, 0.27], [0.22, 0.675, 0.015], RUBBER);
  box("gun.receiver.top.rail", [0.23, 0.052, 0.18], [0.205, 0.895, 0.015], BLUE_STEEL);
  box("gun.receiver.rear.block", [0.095, 0.23, 0.24], [0.045, 0.78, 0.015], BLUE_STEEL);

  b.extrude(
    [
      [0.035, -0.09],
      [0.29, -0.09],
      [0.35, -0.02],
      [0.31, 0.085],
      [0.08, 0.105],
      [0.025, 0.04],
    ],
    {
      at: [0.2, 0.78, 0.14],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: GOLD,
      name: "gun.cheek.plate",
      group: "gun",
    },
  );

  b.part(new THREE.PlaneGeometry(0.22, 0.105), "#ffffff", {
    at: [0.2, 0.78, 0.157],
    dir: [0, 0, 1],
    axis: "z",
    texture: CREST,
    name: "gun.cheek.crest",
    group: "gun",
  });

  b.part(new THREE.PlaneGeometry(0.145, 0.046), "#ffffff", {
    at: [0.2, 0.793, 0.171],
    dir: [0, 0, 1],
    axis: "z",
    texture: LABEL,
    name: "gun.aether.label",
    group: "gun",
  });

  b.rod([0.2, 0.79, 0.09], [0.2, 0.79, 0.455], 0.061, STEEL);
  cylinder("gun.barrel.base", 0.09, 0.075, [0.2, 0.79, 0.11], GOLD, [0, 0, 1], 10);
  cylinder("gun.barrel.sleeve", 0.075, 0.095, [0.2, 0.79, 0.32], BLUE_STEEL, [0, 0, 1], 10);
  cylinder("gun.muzzle.outer", 0.084, 0.087, [0.2, 0.79, 0.46], GOLD, [0, 0, 1], 10);
  cylinder("gun.muzzle.dark.face", 0.058, 0.091, [0.2, 0.79, 0.462], DARK_STEEL, [0, 0, 1], 10);
  cylinder("gun.muzzle.bore", 0.034, 0.096, [0.2, 0.79, 0.466], INK, [0, 0, 1], 10);

  torus("gun.barrel.ring.base", 0.067, 0.012, [0.2, 0.79, 0.145], GOLD, [0, 0, 1]);
  torus("gun.barrel.ring.mid", 0.064, 0.009, [0.2, 0.79, 0.305], DARK_GOLD, [0, 0, 1]);
  torus("gun.barrel.ring.muzzle", 0.082, 0.012, [0.2, 0.79, 0.435], GOLD, [0, 0, 1]);

  // Barrel side rails and four vent slits.
  for (const s of [-1, 1]) {
    rod(
      `gun.barrel.rail.${s}`,
      [0.2 + s * 0.065, 0.79, 0.15],
      [0.2 + s * 0.065, 0.79, 0.405],
      0.008,
      DARK_GOLD,
    );
  }

  for (const z of [0.69, 0.745, 0.80, 0.855]) {
    box(`gun.vent.${z}`, [0.07, 0.018, 0.012], [0.32, z, 0.137], INK, [0, 0, -0.28]);
    sphere(`gun.vent.rivet.${z}`, [0.276, z, 0.145], 0.009, GOLD);
  }

  // Trigger guard and trigger.
  rod("gun.trigger.guard.front", [0.24, 0.72, 0.153], [0.335, 0.69, 0.153], 0.014, GOLD);
  rod("gun.trigger.guard.drop", [0.335, 0.69, 0.153], [0.335, 0.595, 0.153], 0.014, GOLD);
  rod("gun.trigger.guard.back", [0.335, 0.595, 0.153], [0.245, 0.585, 0.153], 0.014, GOLD);
  rod("gun.trigger", [0.275, 0.687, 0.164], [0.295, 0.625, 0.164], 0.012, RED);

  // Small mechanical teeth under the receiver.
  for (const x of [0.09, 0.145, 0.20, 0.255, 0.31]) {
    spike(`gun.lower.tooth.${x}`, [x, 0.617, -0.02], [0, -1, 0], 0.047, 0.013, DARK_GOLD);
  }

  // Rivets and screw heads.
  for (const [i, p] of [
    [0, [0.075, 0.85, 0.143]],
    [1, [0.13, 0.86, 0.148]],
    [2, [0.28, 0.86, 0.148]],
    [3, [0.335, 0.82, 0.145]],
    [4, [0.075, 0.72, 0.144]],
    [5, [0.29, 0.72, 0.148]],
    [6, [0.115, 0.70, 0.159]],
    [7, [0.24, 0.70, 0.159]],
  ] as Array<[number, readonly [number, number, number]]>) {
    cylinder(`gun.rivet.${i}`, 0.014, 0.012, p, GOLD, [0, 0, 1], 8);
    sphere(`gun.rivet.cap.${i}`, [p[0], p[1], p[2] + 0.009], 0.007, IVORY);
  }

  // A dark rear charging handle and a tiny red status crystal.
  rod("gun.charging.handle", [0.022, 0.86, 0.13], [-0.02, 0.86, 0.22], 0.012, GOLD);
  box("gun.charging.pad", [0.055, 0.035, 0.04], [-0.03, 0.86, 0.22], RED_DARK);
  sphere("gun.status.crystal", [0.07, 0.915, 0.142], 0.018, CYAN);

  // ---------------------------------------------------------------------------------------------------------------
  // A secondary rifle-like spine mounted behind the blade, visually fusing the firearm to the sword.

  rod("spine.gun.rail", [0.145, 0.72, -0.055], [0.145, 1.94, -0.055], 0.027, DARK_STEEL);
  for (const y of [0.91, 1.13, 1.35, 1.57]) {
    box(`spine.gun.clamp.${y}`, [0.075, 0.032, 0.065], [0.145, y, -0.055], GOLD);
    sphere(`spine.gun.clamp.rivet.${y}`, [0.145, y, -0.091], 0.009, IVORY);
  }

  // Blade-root collar and locking bolts.
  torus("blade.root.collar", 0.125, 0.018, [0, 0.69, 0], GOLD);
  box("blade.root.lock", [0.16, 0.07, 0.09], [0, 0.735, -0.055], BLUE_STEEL);
  for (const s of [-1, 1]) {
    cylinder(`blade.root.bolt.${s}`, 0.018, 0.014, [s * 0.078, 0.735, 0.0], GOLD, [0, 0, 1], 8);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // A few oversized ornamental fins and a warning plate complete the Final Fantasy silhouette.

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.06, 0.01],
        [0.13, 0.055],
        [0.11, 0.14],
        [0.055, 0.21],
        [0, 0.16],
      ],
      {
        at: [s * 0.22, 0.91, -0.075],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.022,
        bevel: 0.005,
        color: GOLD,
        name: `gun.ornament.fin.${s}`,
        group: "ornament",
      },
    );
    sphere(`gun.ornament.gem.${s}`, [s * 0.285, 1.02, -0.065], 0.024, RED);
  }

  b.part(new THREE.PlaneGeometry(0.17, 0.06), "#ffffff", {
    at: [0.20, 0.60, 0.148],
    dir: [0, 0, 1],
    axis: "z",
    texture: WARNING,
    name: "gun.warning.label",
    group: "gun",
  });

  // Final bright bevel beads along the guard and around the pommel.
  for (const x of [-0.42, -0.31, -0.2, 0.2, 0.31, 0.42]) {
    sphere(`guard.bevel.bead.${x}`, [x, 0.706, 0.048], 0.012, IVORY);
  }

  for (const angle of [0, 60, 120, 180, 240, 300]) {
    const a = (angle * Math.PI) / 180;
    sphere(
      `pommel.star.${angle}`,
      [Math.sin(a) * 0.073, 0.088, Math.cos(a) * 0.073],
      0.009,
      GOLD,
    );
  }

  return b.root;
}
