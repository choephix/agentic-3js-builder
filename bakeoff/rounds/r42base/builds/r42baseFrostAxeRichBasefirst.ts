import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // bladeHeads
  (() => {
function buildBladeHeads(b: Builder) {
  const STEEL = "#8fb4cc";
  const STEEL_DK = "#5d83a0";
  const EDGE = "#e8f8ff";
  const INLAY = "#4fd0ff";
  const RUNE = "#2a78b8";
  const SHARD = "#bff0ff";
  const cy = 1.72; // head centre height
  const T = 0.07;

  for (const s of [1, -1]) {
    // Crescent outline: u = outward from head face, v = up/down from centre.
    const outline: [number, number, ("sharp")?][] = [
      [0, 0.06],
      [0.12, 0.12],
      [0.3, 0.2],
      [0.44, 0.28],
      [0.5, 0.3, "sharp"],
      [0.46, 0.15],
      [0.43, 0.0],
      [0.46, -0.15],
      [0.5, -0.3, "sharp"],
      [0.44, -0.28],
      [0.3, -0.2],
      [0.12, -0.12],
      [0, -0.06],
    ].map((p) => p as [number, number, ("sharp")?]);
    const origin: [number, number, number] = [s * 0.12, cy, 0];
    const xdir: [number, number, number] = [s, 0, 0];
    const plate = b.extrude(outline as any, {
      at: origin,
      x: xdir,
      y: [0, 1, 0],
      thickness: T,
      bevel: 0.012,
      smoothing: 1,
      color: STEEL,
      bone: "head",
      name: `bladeHeads.plate${s}`,
    });

    // Bright cutting edge: thin strip along the outer rim.
    for (const v of [1, -1]) {
      b.extrude(
        [
          [0.44, v * 0.27],
          [0.5, v * 0.3, "sharp"],
          [0.47, v * 0.15],
          [0.45, v * 0.0],
          [0.42, v * 0.0],
          [0.43, v * 0.15],
        ] as any,
        {
          at: [s * 0.12, cy, 0],
          x: xdir,
          y: [0, 1, 0],
          thickness: T * 0.6,
          color: EDGE,
          bone: "head",
          name: `bladeHeads.edge${s}${v}`,
        },
      );
    }

    // Inlay lines on both faces.
    for (const f of [1, -1]) {
      const z = f * (T / 2 + 0.002);
      for (const v of [0.07, -0.07]) {
        b.rod(
          [s * 0.17, cy + v, z],
          [s * 0.4, cy + v * 2.2, z],
          0.006,
          INLAY,
          { bone: "head", sides: 4 } as any,
        );
      }
      // Rune ticks.
      for (let i = 0; i < 3; i++) {
        const u = 0.2 + i * 0.07;
        b.part(new THREE.BoxGeometry(0.012, 0.045, 0.004), RUNE, {
          at: [s * (0.12 + u), cy + (i % 2 ? 0.02 : -0.02), z],
          bone: "head",
        });
        b.part(new THREE.BoxGeometry(0.03, 0.01, 0.004), RUNE, {
          at: [s * (0.12 + u), cy + (i % 2 ? 0.02 : -0.02), z],
          bone: "head",
        });
      }
    }

    // Notches (dark) and ice-shard serrations along the rim.
    for (let i = 0; i < 5; i++) {
      const v = -0.26 + i * 0.13;
      const u = 0.47 - Math.abs(v) * 0.1;
      b.part(new THREE.BoxGeometry(0.025, 0.02, T * 1.1), STEEL_DK, {
        at: [s * (0.12 + u - 0.01), cy + v * 0.95, 0],
        bone: "head",
      });
      b.part(new THREE.ConeGeometry(0.018, 0.07, 4), SHARD, {
        at: [s * (0.12 + u + 0.04), cy + v, 0],
        rotation: [0, 0, -s * 90],
        bone: "head",
      });
    }
  }
}
    return buildBladeHeads;
  })(),
  // crownSpike
  (() => {
function buildCrownSpike(b: Builder) {
  const STEEL = "#a9cbe0";
  const STEEL_D = "#5d86a6";
  const ICE = "#d8f4ff";
  const CORE = "#6fe8ff";
  const NAVY = "#1d3350";
  const Y0 = 1.98;
  const bone = "head";

  const put = (g: THREE.BufferGeometry, color: string, at: [number, number, number], opt: any = {}) =>
    b.part(g, color, { bone, at, flat: true, ...opt });

  // base collar plate (octagonal)
  put(new THREE.CylinderGeometry(0.17, 0.19, 0.04, 8), NAVY, [0, Y0 + 0.02, 0]);
  put(new THREE.CylinderGeometry(0.13, 0.16, 0.03, 8), STEEL_D, [0, Y0 + 0.055, 0]);

  // glowing core gem ring: 8 gems around the spike base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.115;
    const z = Math.cos(a) * 0.115;
    const gem = put(new THREE.OctahedronGeometry(0.026, 0), CORE, [x, Y0 + 0.095, z], {
      scale: [1, 1.5, 1],
    });
    const m = gem.mesh.material as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color(CORE);
    m.emissiveIntensity = 1;
  }

  // central core band
  put(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 8), NAVY, [0, Y0 + 0.1, 0]);

  // main spike: faceted 4-sided spear
  put(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 4), STEEL, [0, Y0 + 0.17, 0], { rotation: [0, 45, 0] });
  put(new THREE.CylinderGeometry(0.0, 0.06, 0.3, 4), STEEL, [0, Y0 + 0.37, 0], { rotation: [0, 45, 0] });
  // bright ridge edges
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.006, 0.28, 0.006), ICE, [s * 0.02, Y0 + 0.36, 0], { rotation: [0, 0, -s * 8] });
    put(new THREE.BoxGeometry(0.006, 0.28, 0.006), ICE, [0, Y0 + 0.36, s * 0.02], { rotation: [s * 8, 0, 0] });
  }

  // winged guard fins on both sides
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.1, 0.02],
        [0.18, 0.14, "sharp"],
        [0.11, 0.1],
        [0.06, 0.2],
        [0, 0.26, "sharp"],
      ],
      { at: [s * 0.04, Y0 + 0.08, 0], x: [s, 0, 0], thickness: 0.02, color: STEEL_D, bone },
    );
    b.extrude(
      [
        [0, 0.02],
        [0.07, 0.05],
        [0.12, 0.13, "sharp"],
        [0.05, 0.14],
        [0.02, 0.2],
      ],
      { at: [s * 0.045, Y0 + 0.09, 0], x: [s, 0, 0], thickness: 0.026, color: ICE, bone },
    );
    // front/back small fins
    b.extrude(
      [
        [0, 0],
        [0.08, 0.03],
        [0.06, 0.16, "sharp"],
        [0, 0.12],
      ],
      { at: [0, Y0 + 0.08, s * 0.04], x: [0, 0, s], thickness: 0.018, color: STEEL_D, bone },
    );
  }

  // crystal shards cluster around the base
  const shards: [number, number, number, number][] = [
    [0.12, 0.12, 0.22, 14],
    [-0.13, 0.1, 0.18, -16],
    [0.1, -0.13, 0.2, 12],
    [-0.1, -0.12, 0.24, -12],
    [0.0, 0.15, 0.15, 20],
    [0.0, -0.16, 0.14, -20],
  ];
  for (const [x, z, h, t] of shards) {
    const dir = new THREE.Vector3(x, 0, z).normalize();
    put(new THREE.ConeGeometry(0.03, h, 5), ICE, [x, Y0 + 0.06 + h / 2, z], {
      rotation: [dir.z * t, 0, -dir.x * t],
    });
    put(new THREE.ConeGeometry(0.016, h * 0.6, 5), CORE, [x * 0.8, Y0 + 0.06 + h * 0.3, z * 0.8], {
      rotation: [dir.z * t, 0, -dir.x * t],
    });
  }

  // top tip gem
  const tip = put(new THREE.OctahedronGeometry(0.02, 0), CORE, [0, Y0 + 0.45, 0], { scale: [1, 1.6, 1] });
  const tm = tip.mesh.material as THREE.MeshStandardMaterial;
  tm.emissive = new THREE.Color(CORE);
  tm.emissiveIntensity = 1;
}
    return buildCrownSpike;
  })(),
  // haftDetails
  (() => {
function buildHaftDetails(b: Builder) {
  const R = 0.032; // assumed haft radius
  const bone = "haft";
  const STEEL = "#8d9bb0", DARK = "#4a5568", LEATHER = "#5b3a29", LEATHER2 = "#7a4e34";
  const RUNE = "#7fe8ff", RIME = "#e6f6ff", CORD = "#c9b48a", CORD2 = "#8a7650";

  const cyl = (r: number, h: number, seg = 10) => new THREE.CylinderGeometry(r, r, h, seg);

  // Leather grip wraps: stacked slightly-tilted rings with alternating tones
  const wrap = (y0: number, y1: number) => {
    const n = Math.round((y1 - y0) / 0.028);
    for (let i = 0; i < n; i++) {
      const y = y0 + (i + 0.5) * ((y1 - y0) / n);
      b.part(cyl(R + 0.004, 0.03, 10), i % 2 ? LEATHER : LEATHER2, {
        at: [0, y, 0], bone, rotation: [i % 2 ? 6 : -6, i * 40, 0],
      });
    }
  };
  wrap(0.34, 0.74);
  wrap(1.12, 1.3);

  // Steel bands with dark trim and studs
  const band = (y: number, h = 0.04) => {
    b.part(cyl(R + 0.009, h, 12), STEEL, { at: [0, y, 0], bone });
    for (const d of [-1, 1])
      b.part(cyl(R + 0.012, 0.007, 12), DARK, { at: [0, y + d * (h / 2), 0], bone });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.006, 5, 4), RIME, {
        at: [Math.sin(a) * (R + 0.01), y, Math.cos(a) * (R + 0.01)], bone,
      });
    }
  };
  [0.31, 0.77, 1.09, 1.33, 1.38].forEach((y, i) => band(y, i === 4 ? 0.025 : 0.04));

  // Rune plates: front and back, glowing rune strokes
  for (const s of [1, -1]) {
    const z = s * (R + 0.006);
    b.part(new THREE.BoxGeometry(0.04, 0.2, 0.01), DARK, { at: [0, 0.93, z], bone });
    b.part(new THREE.BoxGeometry(0.046, 0.012, 0.012), STEEL, { at: [0, 1.035, z], bone });
    b.part(new THREE.BoxGeometry(0.046, 0.012, 0.012), STEEL, { at: [0, 0.825, z], bone });
    const zr = s * (R + 0.013);
    b.part(new THREE.BoxGeometry(0.006, 0.14, 0.004), RUNE, { at: [0, 0.93, zr], bone });
    for (const [dy, rot] of [[0.04, 35], [-0.01, -35], [-0.055, 35]] as const)
      b.part(new THREE.BoxGeometry(0.006, 0.04, 0.004), RUNE, {
        at: [0.011, 0.93 + dy, zr], bone, rotation: [0, 0, rot],
      });
    b.part(new THREE.BoxGeometry(0.006, 0.04, 0.004), RUNE, {
      at: [-0.011, 0.975, zr], bone, rotation: [0, 0, -40],
    });
  }

  // Frost rime patches clinging to the haft
  const rime: [number, number, number, number][] = [
    [0.8, 0.9, 0.9, 0.7], [0.82, 1.2, 1.6, 0.9], [-0.7, 1.26, 2.4, 0.8],
    [0.7, 0.55, 3.6, 1.0], [0.6, 0.45, 5.0, 0.8], [0.5, 1.05, 4.2, 0.6],
  ].map(([_, y, a, sc]) => [0, y, a, sc]) as [number, number, number, number][];
  rime.forEach(([_, y, a, sc], i) => {
    const px = Math.sin(a) * (R + 0.006), pz = Math.cos(a) * (R + 0.006);
    b.part(new THREE.OctahedronGeometry(0.014 * sc, 0), RIME, {
      at: [px, y, pz], bone, scale: [1, 1.5, 0.6], rotation: [0, (a * 180) / Math.PI, i * 20],
    });
    b.part(new THREE.ConeGeometry(0.006 * sc, 0.03 * sc, 5), RIME, {
      at: [Math.sin(a + 0.3) * (R + 0.005), y - 0.02 * sc, Math.cos(a + 0.3) * (R + 0.005)],
      bone, rotation: [180, 0, 0],
    });
  });

  // Braided cord: spiral of beads along the haft between the grips
  const cy0 = 0.8, cy1 = 1.07, n = 36;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), y = cy0 + t * (cy1 - cy0);
    for (const ph of [0, Math.PI]) {
      const a = t * Math.PI * 2 * 4 + ph;
      b.part(new THREE.SphereGeometry(0.006, 5, 4), ph ? CORD2 : CORD, {
        at: [Math.sin(a) * (R + 0.003), y, Math.cos(a) * (R + 0.003)], bone, scale: [1, 1.2, 1],
      });
    }
  }
  // Cord tassel hanging from the top band
  for (const [x, len] of [[-0.012, 0.07], [0.012, 0.05]] as const) {
    b.part(cyl(0.003, len, 5), CORD, { at: [x, 1.31 - len / 2 + 0.0, R + 0.012], bone });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), CORD2, { at: [x, 1.31 - len, R + 0.012], bone });
  }
  void frame;
}
    return buildHaftDetails;
  })(),
  // pommel
  (() => {
function buildPommel(b: Builder) {
  const STEEL = "#9fb8d0";
  const DARK = "#3d5470";
  const ICE = "#bff0ff";
  const GLOW = "#e8fbff";
  const TRIM = "#6f8fb0";
  const bone = "haft";

  const add = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], opts: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...opts });

  // Spike pointing down: cone tip at y=0
  add(new THREE.ConeGeometry(0.035, 0.12, 6), STEEL, [0, 0.06, 0], { rotation: [180, 0, 0] });
  // Counterweight body (faceted hex)
  add(new THREE.CylinderGeometry(0.075, 0.05, 0.09, 6), STEEL, [0, 0.165, 0]);
  add(new THREE.CylinderGeometry(0.05, 0.035, 0.03, 6), DARK, [0, 0.105, 0]);
  // Ring collars
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.016, 8), TRIM, [0, 0.235, 0]);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 8), DARK, [0, 0.256, 0]);
  add(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 8), TRIM, [0, 0.275, 0]);
  // Cap meeting haft at y=0.3
  add(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 8), STEEL, [0, 0.288, 0]);
  add(new THREE.CylinderGeometry(0.036, 0.04, 0.012, 8), DARK, [0, 0.306, 0]);

  // Crystal inset: four faceted ice gems around the weight, plus a front one
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const x = Math.sin(a) * 0.066, z = Math.cos(a) * 0.066;
    add(new THREE.OctahedronGeometry(0.02), ICE, [x, 0.17, z], { scale: [0.7, 1.4, 0.7] });
    add(new THREE.OctahedronGeometry(0.008), GLOW, [x * 1.1, 0.178, z * 1.1]);
  }
  add(new THREE.OctahedronGeometry(0.03), ICE, [0, 0.2, 0.072], { scale: [0.8, 1.5, 0.6] });
  add(new THREE.OctahedronGeometry(0.01), GLOW, [0, 0.21, 0.082]);

  // Frost tassel: loop eyelet then hanging cords with beads
  add(new THREE.TorusGeometry(0.02, 0.005, 5, 8), TRIM, [0.075, 0.2, 0], { rotation: [0, 90, 0] });
  const cx = 0.085;
  const cords = [
    { dz: -0.02, len: 0.12 },
    { dz: 0, len: 0.16 },
    { dz: 0.02, len: 0.11 },
  ];
  add(new THREE.SphereGeometry(0.012, 6, 4), ICE, [cx, 0.18, 0]);
  for (const c of cords) {
    const top = 0.175;
    add(new THREE.CylinderGeometry(0.003, 0.003, c.len, 4), TRIM, [cx, top - c.len / 2, c.dz]);
    const n = Math.floor(c.len / 0.04);
    for (let k = 1; k <= n; k++) {
      add(new THREE.SphereGeometry(0.008, 6, 4), k % 2 ? ICE : GLOW, [cx, top - k * 0.035, c.dz]);
    }
    add(new THREE.ConeGeometry(0.009, 0.025, 5), ICE, [cx, top - c.len - 0.008, c.dz], { rotation: [180, 0, 0] });
  }
}
    return buildPommel;
  })(),
  // headCore
  (() => {
function buildHeadCore(b: Builder) {
  const bone = "head";
  const CY = 1.7;
  const ICE = "#9fe8ff";
  const ICE_L = "#e8fbff";
  const ICE_D = "#2e7fb0";
  const STEEL = "#3a4a63";
  const DARK = "#17202f";
  const GOLD = "#d9b45a";

  for (const s of [1, -1]) {
    const zf = s * 0.1;
    const z = (d: number) => zf + s * d;

    // backing disc and rim
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 6), DARK, { bone, at: [0, CY, z(0.006)], dir: [0, 0, 1], axis: "y" });
    b.part(new THREE.CylinderGeometry(0.128, 0.128, 0.014, 6), STEEL, { bone, at: [0, CY, z(0.01)], dir: [0, 0, 1], axis: "y" });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.016, 6), ICE_D, { bone, at: [0, CY, z(0.014)], dir: [0, 0, 1], axis: "y" });

    // snowflake arms
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const dx = Math.sin(a), dy = Math.cos(a);
      const arm = new THREE.BoxGeometry(0.014, 0.1, 0.012);
      b.part(arm, ICE, {
        bone,
        at: [dx * 0.05, CY + dy * 0.05, z(0.024)],
        rotation: [0, 0, (-a * 180) / Math.PI],
      });
      b.part(new THREE.SphereGeometry(0.012, 6, 4), ICE_L, { bone, at: [dx * 0.1, CY + dy * 0.1, z(0.026)] });
      for (const k of [-1, 1]) {
        const ba = a + k * 0.6;
        b.part(new THREE.BoxGeometry(0.01, 0.04, 0.01), ICE_L, {
          bone,
          at: [Math.sin(a) * 0.075 + Math.sin(ba) * 0.018, CY + Math.cos(a) * 0.075 + Math.cos(ba) * 0.018, z(0.026)],
          rotation: [0, 0, (-ba * 180) / Math.PI],
        });
      }
    }

    // core crystal
    b.part(new THREE.OctahedronGeometry(0.04, 0), ICE_L, {
      bone, at: [0, CY, z(0.04)], scale: [1, 1.5, 0.8],
    });
    b.part(new THREE.OctahedronGeometry(0.022, 0), "#ffffff", {
      bone, at: [0, CY, z(0.05)], scale: [1, 1.5, 0.8],
    });

    // rivets
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, {
        bone, at: [Math.sin(a) * 0.14, CY + Math.cos(a) * 0.14, z(0.008)],
      });
    }

    // engraved trim at edges
    const tz = z(0.006);
    b.part(new THREE.BoxGeometry(0.38, 0.016, 0.012), DARK, { bone, at: [0, 1.43, tz] });
    b.part(new THREE.BoxGeometry(0.38, 0.016, 0.012), DARK, { bone, at: [0, 1.97, tz] });
    for (const x of [-0.18, 0.18]) {
      b.part(new THREE.BoxGeometry(0.016, 0.54, 0.012), DARK, { bone, at: [x, CY, tz] });
    }
    b.part(new THREE.BoxGeometry(0.34, 0.006, 0.014), ICE, { bone, at: [0, 1.455, z(0.008)] });
    b.part(new THREE.BoxGeometry(0.34, 0.006, 0.014), ICE, { bone, at: [0, 1.945, z(0.008)] });
  }
}
    return buildHeadCore;
  })(),
];

export const BASE_PARTS = [
  {
    id: "bladeHeads",
    builds: "the double-bitted crescent axe blades on both sides of the head: curved steel-ice crescent plates, bevelled cutting edges, frost-blue inlay lines, rune etchings, notched edge details and small ice-shard serrations",
    box: [
      [-0.62, 1.42, -0.12],
      [0.62, 2.02, 0.12],
    ],
    attaches: "the left and right faces of the central head block (x = +-0.12) on the head joint",
    joints: ["head"],
    floor: false,
    budget: 260,
  },
  {
    id: "crownSpike",
    builds: "the top spear spike and frost crown: a faceted ice-steel spike, winged guard fins, crystal shards and a glowing core gem ring around the spike base",
    box: [
      [-0.2, 1.98, -0.2],
      [0.2, 2.45, 0.2],
    ],
    attaches: "the top cap of the head block at y = 1.98 on the head joint",
    joints: ["head"],
    floor: false,
    budget: 150,
  },
  {
    id: "haftDetails",
    builds: "shaft fittings: leather grip wraps, steel bands, rune plates, frost rime patches, and braided cord along the haft",
    box: [
      [-0.07, 0.3, -0.07],
      [0.07, 1.4, 0.07],
    ],
    attaches: "the outer surface of the long haft cylinder, from y = 0.3 to y = 1.4",
    joints: ["haft"],
    floor: false,
    budget: 150,
  },
  {
    id: "pommel",
    builds: "the butt end: an icy steel counterweight spike, ring collars, crystal inset and a hanging frost tassel with beads",
    box: [
      [-0.12, 0, -0.12],
      [0.12, 0.34, 0.12],
    ],
    attaches: "the bottom of the haft where the pommel cap sits at y = 0.3",
    joints: ["haft"],
    floor: true,
    budget: 140,
  },
  {
    id: "headCore",
    builds: "the central head decoration: a glowing frost emblem on the front and back faces, a core crystal, rivets, and engraved trim around the head block",
    box: [
      [-0.2, 1.4, -0.16],
      [0.2, 2.0, 0.16],
    ],
    attaches: "the front (+Z) and back (-Z) faces of the central head block at z = +-0.1",
    joints: ["head"],
    floor: false,
    budget: 180,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const haft = b.joint("haft", { at: [0, 0.3, 0], role: "spine" });
  const head = b.joint("head", { parent: haft, at: [0, 1.7, 0], dir: [0, 1, 0] });

  const WOOD = "#3a4658";
  const STEEL = "#8fa6bd";
  const DARK = "#26303f";

  // Long haft
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 1.45, 8), WOOD, { bone: haft, at: [0, 0.95, 0] });
  // Pommel cap
  b.part(new THREE.CylinderGeometry(0.06, 0.045, 0.1, 8), STEEL, { bone: haft, at: [0, 0.3, 0] });
  b.part(new THREE.ConeGeometry(0.045, 0.14, 8), STEEL, { bone: haft, at: [0, 0.18, 0], rotation: [180, 0, 0] });
  // Collar under head
  b.part(new THREE.CylinderGeometry(0.075, 0.06, 0.1, 8), DARK, { bone: head, at: [0, 1.4, 0] });
  // Central head block
  b.part(new THREE.BoxGeometry(0.24, 0.5, 0.2), STEEL, { bone: head, at: [0, 1.7, 0] });
  b.part(new THREE.BoxGeometry(0.28, 0.08, 0.24), DARK, { bone: head, at: [0, 1.96, 0] });
  b.part(new THREE.BoxGeometry(0.28, 0.08, 0.24), DARK, { bone: head, at: [0, 1.44, 0] });
  // Blade root stubs
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.3, 0.07), STEEL, { bone: head, at: [s * 0.2, 1.7, 0] });
  }

    for (const add of PARTS) add(b);
  return b.root;
}
