import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, spiral } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Gunblade",
  "description": "A Final Fantasy gunblade: a long single-edged silver sword with a revolver built into its hilt, a barrel along the spine, a cylinder at the root, a trigger, a hammer and a lion pendant. It stands upright with its point on the floor."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  bladeSteel: "#cfd8e6",
  bladeEdge: "#f4f8ff",
  bladeShade: "#8d9bb3",
  fuller: "#5a6a86",
  engrave: "#3a465e",
  gold: "#d9a93a",
  goldDark: "#9a6f1f",
  gunMetal: "#3c4150",
  gunDark: "#1f222c",
  gunLight: "#6c7488",
  screw: "#a4acbd",
  leather: "#5a3a28",
  leatherDark: "#33201a",
  glowBlue: "#4fd8ff",
  glowCore: "#d8fbff",
  lionSilver: "#e6e9f0",
  black: "#14151b",
  ruby: "#d8344a",
};
const M = {
  bladeTip: [0, 0, 0.01] as [number, number, number],
  bladeRoot: [0, 0.9, 0] as [number, number, number],
  spineLineZ: [0, 0.5, -0.05] as [number, number, number],
  edgeLineZ: [0, 0.5, 0.075] as [number, number, number],
  barrelAxis: [0, 0.6, -0.075] as [number, number, number],
  muzzle: [0, 0.34, -0.075] as [number, number, number],
  cylinderCenter: [0, 0.97, -0.075] as [number, number, number],
  frameTop: [0, 1.06, 0] as [number, number, number],
  guardCenter: [0, 1.09, 0] as [number, number, number],
  gripCenter: [0, 1.24, 0] as [number, number, number],
  triggerPivot: [0, 1.12, 0.1] as [number, number, number],
  hammerPivot: [0, 1.12, -0.13] as [number, number, number],
  pommelBase: [0, 1.36, 0] as [number, number, number],
  charmAnchor: [0.05, 1.42, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // blade
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, number[]>;
};

function buildBlade({ b, P }: Ctx) {
  const HALF = 0.015; // half thickness of the blade body (x)
  const sides = [1, -1];

  // ---------- helpers ----------
  type Pt = [number, number] | [number, number, "sharp"];

  // overlay outline (z, y absolute) lying on the face of side s, `lift` proud of the face
  const lay = (s: number, outline: Pt[], color: string, lift: number) => {
    const t = lift + 0.002;
    return b.extrude(outline, {
      at: [s * (HALF + lift - t / 2), 0, 0],
      x: [0, 0, 1],
      thickness: t,
      color,
    });
  };

  const rect = (z0: number, z1: number, y0: number, y1: number): Pt[] => [
    [z0, y0],
    [z1, y0],
    [z1, y1],
    [z0, y1],
  ];

  const chamfer = (z0: number, z1: number, y0: number, y1: number, c: number): Pt[] => [
    [z0 + c, y0],
    [z1 - c, y0],
    [z1, y0 + c],
    [z1, y1 - c],
    [z1 - c, y1],
    [z0 + c, y1],
    [z0, y1 - c],
    [z0, y0 + c],
  ];

  const diamond = (z: number, y: number, w: number, h: number): Pt[] => [
    [z, y - h / 2],
    [z + w / 2, y],
    [z, y + h / 2],
    [z - w / 2, y],
  ];

  const star = (z: number, y: number, rOut: number, rIn: number, n: number): Pt[] => {
    const out: Pt[] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2 / n;
      const r = i % 2 === 0 ? rOut : rIn;
      out.push([z + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    return out;
  };

  const rivet = (s: number, z: number, y: number, lift: number) =>
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), P.screw, {
      at: [s * (HALF + lift + 0.0008), y, z],
    });

  // ---------- blade body ----------
  const body: Pt[] = [
    [0.01, 0, "sharp"],
    [0.045, 0.06],
    [0.065, 0.16],
    [0.075, 0.32],
    [0.075, 0.93, "sharp"],
    [-0.05, 0.93, "sharp"],
    [-0.05, 0.14, "sharp"],
  ];
  b.extrude(body, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    thickness: HALF * 2,
    bevel: 0.003,
    color: P.bladeSteel,
    name: "blade.body",
  });

  // bright cutting edge running the full length of the edge
  b.extrude(
    [
      [0.0128, 0.006, "sharp"],
      [0.0455, 0.06],
      [0.0655, 0.16],
      [0.0756, 0.32],
      [0.0756, 0.9, "sharp"],
      [0.0716, 0.9, "sharp"],
      [0.0716, 0.32],
      [0.0615, 0.16],
      [0.0415, 0.06],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.026, color: P.bladeEdge, name: "blade.edgeLine" },
  );

  // ---------- spine band with stepped notches ----------
  b.part(new THREE.BoxGeometry(0.037, 0.78, 0.017), P.bladeShade, {
    at: [0, 0.53, -0.0425],
    name: "blade.spineBand",
  });
  // notches cutting the back of the band (below the barrel)
  for (let i = 0; i < 6; i++) {
    const wide = i % 2 === 0;
    b.part(new THREE.BoxGeometry(0.039, 0.006, wide ? 0.009 : 0.006), P.engrave, {
      at: [0, 0.17 + i * 0.03, wide ? -0.0465 : -0.048],
      name: "blade.notchLow",
    });
  }
  // notches stepping along the face of the band (visible above the barrel too)
  for (let i = 0; i < 14; i++) {
    b.part(new THREE.BoxGeometry(0.038, 0.005, 0.006), P.engrave, {
      at: [0, 0.2 + i * 0.047, -0.039],
      name: "blade.notchFace",
    });
  }

  // ---------- per-face decoration ----------
  for (const s of sides) {
    // false-edge bevel on the swept point
    lay(s, [[-0.046, 0.14], [-0.026, 0.14], [0.014, 0.05], [0.002, 0.03]], P.bladeShade, 0.0012);

    // bright edge bevel
    lay(
      s,
      [
        [0.043, 0.07],
        [0.063, 0.17],
        [0.073, 0.32],
        [0.073, 0.76],
        [0.047, 0.76],
        [0.047, 0.32],
        [0.042, 0.17],
        [0.028, 0.085],
      ],
      P.bladeEdge,
      0.0016,
    );

    // lower bevel (shade)
    lay(
      s,
      [
        [0.04, 0.2],
        [0.046, 0.32],
        [0.046, 0.76],
        [0.028, 0.76],
        [0.028, 0.3],
      ],
      P.bladeShade,
      0.0012,
    );

    // fuller groove
    lay(
      s,
      [
        [-0.02, 0.7],
        [-0.02, 0.17],
        [-0.007, 0.1],
        [0.006, 0.17],
        [0.006, 0.7],
      ],
      P.fuller,
      0.0012,
    );
    // fuller rims
    lay(s, rect(-0.0218, -0.0198, 0.17, 0.7), P.bladeEdge, 0.0018);
    lay(s, rect(0.0058, 0.0078, 0.17, 0.7), P.bladeShade, 0.0018);

    // glowing blue inlay inside the fuller
    glow(
      lay(
        s,
        [
          [-0.0095, 0.68],
          [-0.0095, 0.2],
          [-0.007, 0.14],
          [-0.0045, 0.2],
          [-0.0045, 0.68],
        ],
        P.glowBlue,
        0.0026,
      ),
      1.6,
    );
    // bright core line in the inlay
    glow(lay(s, rect(-0.0075, -0.0065, 0.22, 0.66), P.glowCore, 0.0034), 1.8);

    // engraved diamonds between spine band and fuller
    for (let i = 0; i < 10; i++) {
      lay(s, diamond(-0.027, 0.2 + i * 0.05, 0.008, 0.016), P.engrave, 0.0014);
    }

    // ---------- ricasso panels ----------
    // upper (lion emblem) panel
    lay(s, chamfer(-0.035, 0.047, 0.772, 0.843, 0.007), P.goldDark, 0.0012);
    lay(s, chamfer(-0.032, 0.044, 0.775, 0.84, 0.006), P.engrave, 0.0022);
    // lower (filigree) panel
    lay(s, chamfer(-0.035, 0.047, 0.712, 0.768, 0.006), P.goldDark, 0.0012);
    lay(s, chamfer(-0.032, 0.044, 0.715, 0.765, 0.005), P.engrave, 0.0022);

    // lion head emblem (mane star, face, snout, eyes, nose)
    const lz = 0.006;
    const ly = 0.8075;
    lay(s, star(lz, ly, 0.028, 0.019, 8), P.gold, 0.0032);
    lay(s, star(lz, ly, 0.0205, 0.0165, 8), P.goldDark, 0.0038);
    lay(
      s,
      [
        [lz - 0.006, ly - 0.015],
        [lz + 0.006, ly - 0.015],
        [lz + 0.014, ly - 0.005],
        [lz + 0.014, ly + 0.007],
        [lz + 0.007, ly + 0.014],
        [lz - 0.007, ly + 0.014],
        [lz - 0.014, ly + 0.007],
        [lz - 0.014, ly - 0.005],
      ],
      P.lionSilver,
      0.0046,
    );
    lay(s, rect(lz - 0.005, lz + 0.005, ly - 0.0135, ly - 0.0035), P.bladeEdge, 0.0054);
    lay(s, rect(lz - 0.009, lz - 0.004, ly + 0.002, ly + 0.0055), P.black, 0.0062);
    lay(s, rect(lz + 0.004, lz + 0.009, ly + 0.002, ly + 0.0055), P.black, 0.0062);
    lay(s, [[lz - 0.0035, ly - 0.002], [lz + 0.0035, ly - 0.002], [lz, ly - 0.0065]], P.black, 0.0062);
    // brow ridge and mouth line
    lay(s, rect(lz - 0.01, lz + 0.01, ly + 0.0075, ly + 0.0095), P.bladeShade, 0.0054);
    lay(s, rect(lz - 0.0015, lz + 0.0015, ly - 0.0125, ly - 0.0065), P.engrave, 0.0062);

    // rivets at panel corners
    for (const z of [-0.026, 0.038]) {
      for (const y of [0.781, 0.834, 0.721, 0.759]) rivet(s, z, y, 0.0022);
    }

    // filigree on the lower panel: two interlaced gold waves
    for (let k = 0; k < 2; k++) {
      const pts: number[][] = [];
      for (let i = 0; i <= 8; i++) {
        const u = i / 8;
        const z = -0.026 + u * 0.062;
        const y = 0.74 + (k === 0 ? 1 : -1) * 0.0095 * Math.sin(u * Math.PI * 2);
        pts.push([s * (HALF + 0.0029), y, z]);
      }
      b.sweep(catmull(pts), 0.0013, { color: P.gold, sides: 4, name: "blade.filigree" });
    }
    // gold dots at the end of the filigree
    for (const z of [-0.0285, 0.0385]) {
      b.part(new THREE.SphereGeometry(0.0028, 5, 4), P.gold, {
        at: [s * (HALF + 0.0028), 0.74, z],
      });
    }
  }

  // ---------- gold collar rings at the root ----------
  b.part(new THREE.BoxGeometry(0.038, 0.012, 0.135), P.gold, { at: [0, 0.876, 0.0125], name: "blade.collarTop" });
  b.part(new THREE.BoxGeometry(0.042, 0.012, 0.142), P.goldDark, { at: [0, 0.864, 0.0125], name: "blade.collarMid" });
  b.part(new THREE.BoxGeometry(0.038, 0.008, 0.135), P.gold, { at: [0, 0.852, 0.0125], name: "blade.collarLow" });
  // collar studs
  for (const s of sides) {
    for (const z of [-0.04, 0.0125, 0.065]) {
      b.part(new THREE.SphereGeometry(0.0035, 6, 4), P.goldDark, {
        at: [s * 0.0215, 0.876, z],
      });
    }
  }
}
    return buildBlade;
  })(),
  // revolver
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildRevolver({ b, P }: Ctx) {
  // ---------- helpers ----------
  type V3 = [number, number, number];
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const zdisc = (r: number, h: number, seg = 8) => new THREE.CylinderGeometry(r, r, h, seg).rotateX(Math.PI / 2);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  const add = (geo: THREE.BufferGeometry, color: string, at: V3, rotation?: V3, scale?: V3) => {
    const o: any = { at, flat: true };
    if (rotation) o.rotation = rotation;
    if (scale) o.scale = scale;
    return b.part(geo, color, o);
  };

  // Drum / barrel placement constants
  const CX = 0;
  const CZ = -0.075;
  const DRUM_Y = 0.975;
  const DRUM_R = 0.0568; // 12-gon vertex radius, rotated so flats sit at 0, 30, 60 ...
  const DRUM_ROT: V3 = [0, 15, 0];
  const BARREL_ROT: V3 = [0, 22.5, 0];

  // Part standing on the drum's side at angle a (deg, 0 = +Z, 90 = +X); geometry's local +Z points outward.
  const radial = (geo: THREE.BufferGeometry, color: string, a: number, r: number, y: number) => {
    const rad = (a * Math.PI) / 180;
    return add(geo, color, [CX + Math.sin(rad) * r, y, CZ + Math.cos(rad) * r], [0, a, 0]);
  };

  const gl = <T,>(part: T, strength = 1.5): T => glow(part as any, strength) as T;

  // ---------- barrel ----------
  const barrelBottom = 0.34;
  const barrelTop = 0.9;
  add(cyl(0.0325, 0.0325, barrelTop - barrelBottom, 8), P.gunMetal, [0, (barrelBottom + barrelTop) / 2, CZ], BARREL_ROT);

  // muzzle: dark bore, gunLight lip, tapered gold ring, gunLight band behind it
  add(cyl(0.019, 0.019, 0.004, 10), P.gunDark, [0, 0.338, CZ]);
  add(cyl(0.025, 0.025, 0.0022, 10), P.gunLight, [0, 0.3385, CZ]);
  add(cyl(0.0345, 0.0375, 0.03, 8), P.gold, [0, 0.355, CZ], BARREL_ROT);
  add(cyl(0.0372, 0.0372, 0.006, 8), P.goldDark, [0, 0.3445, CZ], BARREL_ROT);
  add(cyl(0.0358, 0.0358, 0.008, 8), P.gunLight, [0, 0.378, CZ], BARREL_ROT);

  // top rib with serrations
  add(box(0.012, 0.49, 0.008), P.gunLight, [0, 0.63, -0.1095]);
  for (let i = 0; i < 12; i++) add(box(0.0145, 0.0025, 0.002), P.gunDark, [0, 0.41 + i * 0.04, -0.1138]);

  // front sight
  add(box(0.014, 0.026, 0.02), P.goldDark, [0, 0.375, -0.1135]);
  add(box(0.006, 0.02, 0.008), P.gunDark, [0, 0.397, -0.1195]);
  add(new THREE.SphereGeometry(0.0045, 6, 4), P.ruby, [0, 0.409, -0.1195]);

  // clamp bands joining barrel to blade spine
  const bands: [number, string, string][] = [
    [0.46, P.gold, P.gunLight],
    [0.58, P.gunLight, P.gold],
    [0.7, P.gold, P.gunLight],
    [0.82, P.gunLight, P.gold],
  ];
  for (const [y, c1, c2] of bands) {
    add(cyl(0.0352, 0.0352, 0.02, 8), c1, [0, y, CZ], BARREL_ROT);
    add(cyl(0.0362, 0.0362, 0.004, 8), P.goldDark, [0, y + 0.0105, CZ], BARREL_ROT);
    add(cyl(0.0362, 0.0362, 0.004, 8), P.goldDark, [0, y - 0.0105, CZ], BARREL_ROT);
    for (const s of [1, -1]) {
      add(box(0.008, 0.018, 0.05), c1, [s * 0.0195, y, -0.035]);
      add(zdisc(0.0036, 0.003, 6), c2, [s * 0.0195, y, -0.0095], [0, 0, 0]).mesh.rotateY((s * Math.PI) / 2);
    }
  }

  // glowBlue energy slits on both sides of the barrel
  const slits: [number, number][] = [
    [0.42, 0.04],
    [0.515, 0.07],
    [0.64, 0.08],
    [0.76, 0.08],
    [0.8625, 0.025],
  ];
  for (const [yc, h] of slits)
    for (const s of [1, -1]) {
      gl(add(box(0.004, h, 0.008), P.glowBlue, [s * 0.0297, yc, CZ]), 1.6);
      gl(add(box(0.0046, Math.max(0.006, h - 0.012), 0.003), P.glowCore, [s * 0.0298, yc, CZ]), 2);
    }

  // barrel-to-frame flare
  add(cyl(0.0345, 0.0405, 0.016, 8), P.goldDark, [0, 0.872, CZ], BARREL_ROT);

  // ---------- ejector rod ----------
  add(cyl(0.006, 0.006, 0.18, 8), P.screw, [0.04, 0.79, CZ]);
  add(cyl(0.011, 0.011, 0.022, 8), P.gunLight, [0.04, 0.705, CZ], [0, 22.5, 0]);
  add(cyl(0.0095, 0.0095, 0.006, 8), P.gold, [0.04, 0.83, CZ], [0, 22.5, 0]);
  add(box(0.018, 0.014, 0.018), P.gunMetal, [0.036, 0.78, CZ]);

  // ---------- frame ----------
  // core, recess, front strap, top cap
  add(box(0.062, 0.168, 0.108), P.gunDark, [0, 0.969, 0.034]);
  add(box(0.036, 0.007, 0.135), P.gunDark, [0, 0.8825, 0.011]);
  add(box(0.02, 0.13, 0.003), P.gold, [0, 0.975, 0.0895]);
  add(box(0.012, 0.012, 0.004), P.gunLight, [0, 0.93, 0.0905]);
  add(box(0.012, 0.012, 0.004), P.gunLight, [0, 1.02, 0.0905]);
  add(box(0.066, 0.006, 0.105), P.gunLight, [0, 1.057, 0.035]);

  // rear strap with trim
  add(box(0.05, 0.17, 0.012), P.gunMetal, [0, 0.97, -0.134]);
  add(box(0.008, 0.14, 0.002), P.gold, [0, 0.97, -0.1405]);
  for (const y of [0.91, 1.03]) {
    const sc = add(zdisc(0.005, 0.003, 6), P.screw, [0, y, -0.1415]);
    sc.mesh.rotateY(Math.PI);
  }
  for (const s of [1, -1]) add(box(0.002, 0.14, 0.006), P.gold, [s * 0.0255, 0.97, -0.134]);

  // collars top and bottom of the drum
  add(cyl(0.0605, 0.0605, 0.02, 12), P.gunMetal, [CX, 0.89, CZ], DRUM_ROT);
  add(cyl(0.0615, 0.0615, 0.004, 12), P.gunLight, [CX, 0.881, CZ], DRUM_ROT);
  add(cyl(0.0605, 0.0605, 0.01, 12), P.gunLight, [CX, 1.055, CZ], DRUM_ROT);
  for (let i = 0; i < 6; i++) {
    const a = 30 + i * 60;
    if (a > 90 && a < 270 && false) continue;
    const rad = (a * Math.PI) / 180;
    add(zdisc(0.0045, 0.003, 6), P.screw, [CX + Math.sin(rad) * 0.0585, 0.89, CZ + Math.cos(rad) * 0.0585], [0, a, 0]);
  }

  // side plates with trim, engraved panel, glow gem and screws
  const plateOutline: [number, number][] = [
    [-0.02, 0.905],
    [-0.005, 0.885],
    [0.07, 0.885],
    [0.09, 0.905],
    [0.09, 1.035],
    [0.072, 1.055],
    [-0.005, 1.055],
    [-0.02, 1.04],
  ];
  for (const s of [1, -1]) {
    b.extrude(plateOutline, {
      at: [s * 0.0375, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.015,
      bevel: 0.002,
      color: P.gunMetal,
    });
    const xo = s * 0.0455;
    // trim lines
    add(box(0.002, 0.003, 0.07), P.gold, [xo, 0.915, 0.035]);
    add(box(0.002, 0.003, 0.07), P.gold, [xo, 1.04, 0.03]);
    add(box(0.002, 0.11, 0.003), P.gold, [xo, 0.975, 0.08]);
    // engraved panel with gold border
    add(box(0.002, 0.06, 0.04), P.gunDark, [s * 0.0452, 0.975, 0.04]);
    add(box(0.0022, 0.002, 0.044), P.goldDark, [s * 0.0455, 1.006, 0.04]);
    add(box(0.0022, 0.002, 0.044), P.goldDark, [s * 0.0455, 0.944, 0.04]);
    add(box(0.0022, 0.062, 0.002), P.goldDark, [s * 0.0455, 0.975, 0.019]);
    add(box(0.0022, 0.062, 0.002), P.goldDark, [s * 0.0455, 0.975, 0.061]);
    // glow gem in the panel
    gl(
      add(new THREE.OctahedronGeometry(0.009, 0), P.glowBlue, [s * 0.0465, 0.975, 0.04], undefined, [0.35, 1.3, 1]),
      1.8,
    );
    gl(
      add(new THREE.OctahedronGeometry(0.0045, 0), P.glowCore, [s * 0.0472, 0.975, 0.04], undefined, [0.3, 1.3, 1]),
      2,
    );
    // screws with slots
    const screws: [number, number][] = [
      [0.0, 0.94],
      [0.0, 1.012],
      [0.066, 0.925],
      [0.066, 1.025],
    ];
    for (const [z, y] of screws) {
      const sc = add(zdisc(0.0055, 0.004, 8), P.screw, [s * 0.0466, y, z]);
      sc.mesh.rotateY((s * Math.PI) / 2);
      add(box(0.0016, 0.0085, 0.0014), P.gunDark, [s * 0.0489, y, z]);
    }
  }

  // ---------- cylinder ----------
  add(cyl(DRUM_R, DRUM_R, 0.15, 12), P.gunMetal, [CX, DRUM_Y, CZ], DRUM_ROT);
  // gold rims
  add(cyl(0.0595, 0.0595, 0.012, 12), P.gold, [CX, 0.906, CZ], DRUM_ROT);
  add(cyl(0.0595, 0.0595, 0.012, 12), P.gold, [CX, 1.044, CZ], DRUM_ROT);
  add(cyl(0.0602, 0.0602, 0.003, 12), P.goldDark, [CX, 0.9135, CZ], DRUM_ROT);
  add(cyl(0.0602, 0.0602, 0.003, 12), P.goldDark, [CX, 1.0365, CZ], DRUM_ROT);
  // glow core rings
  gl(add(cyl(0.0585, 0.0585, 0.006, 12), P.glowBlue, [CX, 0.928, CZ], DRUM_ROT), 1.6);
  gl(add(cyl(0.0585, 0.0585, 0.006, 12), P.glowBlue, [CX, 1.022, CZ], DRUM_ROT), 1.6);

  // six fluted chambers: gold ring, gunDark hole, glow strip
  for (let i = 0; i < 6; i++) {
    const a = 30 + i * 60;
    radial(box(0.028, 0.088, 0.003), P.gold, a, 0.0553, DRUM_Y);
    radial(box(0.021, 0.08, 0.004), P.gunDark, a, 0.0555, DRUM_Y);
    gl(radial(box(0.0036, 0.05, 0.003), P.glowBlue, a, 0.0572, DRUM_Y), 1.4);
  }

  // between the chambers: stop slots and studs
  for (const a of [60, 120, 240, 300]) {
    radial(box(0.011, 0.018, 0.003), P.gunDark, a, 0.0552, 0.945);
    radial(zdisc(0.0046, 0.003, 6), P.gold, a, 0.0556, 0.995);
  }
  // bolt notch and ruby gem at the back
  radial(box(0.016, 0.022, 0.004), P.gunLight, 180, 0.0553, 0.945);
  radial(box(0.008, 0.014, 0.0045), P.gunDark, 180, 0.0556, 0.945);
  radial(zdisc(0.0098, 0.004, 6), P.gold, 180, 0.0552, 0.996);
  const ruby = radial(new THREE.OctahedronGeometry(0.0068, 0), P.ruby, 180, 0.0583, 0.996);
  ruby.mesh.scale.set(1, 1.3, 0.8);
}
    return buildRevolver;
  })(),
  // hilt
  (() => {
type Pt = [number, number, number];
type Outline = ([number, number] | [number, number, "sharp"])[];

function buildHilt({ b, P, M }: Ctx) {
  const GRIP_Y0 = 1.12;
  const GRIP_Y1 = 1.36;
  const gripX = M.gripCenter[0];
  const gripZ = M.gripCenter[2];

  // ---------- helpers ----------
  const box = (size: Pt, color: string, at: Pt, rotation: Pt = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: string,
    at: Pt,
    opts: { rotation?: Pt; dir?: Pt; scale?: Pt } = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...opts });
  const ball = (r: number, color: string, at: Pt, w = 6, h = 4) =>
    b.part(new THREE.SphereGeometry(r, w, h), color, { at });

  // ---------- winged guard ----------
  const gy = 1.088;
  const wingOutline = (dy: number): Outline => [
    [0.035, -0.02 + dy],
    [0.11, -0.022 + dy],
    [0.15, 0.0 + dy],
    [0.168, 0.06 + dy, "sharp"],
    [0.135, 0.035 + dy],
    [0.09, 0.03 + dy],
    [0.035, 0.03 + dy],
  ];
  const featherOutline: Outline = [
    [0.09, 0],
    [0.12, 0.003],
    [0.145, 0.025],
    [0.155, 0.065, "sharp"],
    [0.13, 0.047],
    [0.105, 0.03],
    [0.09, 0.026],
  ];

  for (const s of [1, -1]) {
    // dark underside slab, then the gold wing on top of it
    b.extrude(wingOutline(-0.007), {
      at: [0, gy, 0],
      x: [s, 0, 0],
      thickness: 0.064,
      bevel: 0.003,
      color: P.goldDark,
    });
    b.extrude(wingOutline(0), {
      at: [0, gy, 0],
      x: [s, 0, 0],
      thickness: 0.058,
      bevel: 0.004,
      color: P.gold,
    });
    // upper feather blade
    b.extrude(featherOutline, {
      at: [0, gy + 0.03, 0],
      x: [s, 0, 0],
      thickness: 0.03,
      bevel: 0.003,
      color: P.gold,
    });
    b.extrude(featherOutline.map(([x, y, k]) => (k ? [x, y * 0.7 - 0.004, k] : [x, y * 0.7 - 0.004])) as Outline, {
      at: [0, gy + 0.03, 0],
      x: [s, 0, 0],
      thickness: 0.034,
      color: P.goldDark,
    });

    // filigree ridges on the wing top
    for (const z of [-0.022, 0.022]) {
      b.rod([s * 0.045, gy + 0.033, z], [s * 0.13, gy + 0.0355, z], 0.0028, { color: P.goldDark });
      ball(0.0042, P.gold, [s * 0.047, gy + 0.033, z]);
      ball(0.0042, P.gold, [s * 0.128, gy + 0.0355, z]);
    }
    // engraved trim lines on the wing's front and back faces
    for (const z of [-0.0293, 0.0293]) {
      b.sweep(
        catmull([
          [s * 0.05, gy + 0.005, z],
          [s * 0.12, gy + 0.002, z],
          [s * 0.15, gy + 0.02, z],
          [s * 0.162, gy + 0.05, z],
        ]),
        0.0022,
        { color: P.goldDark, sides: 4, caps: "flat" },
      );
    }
    // ruby stud in a gold seat
    cyl(0.0125, 0.0145, 0.006, 8, P.goldDark, [s * 0.07, gy + 0.033, 0]);
    ball(0.0105, P.ruby, [s * 0.07, gy + 0.037, 0], 8, 5);
    // glowing tip gem
    glow(ball(0.0095, P.glowBlue, [s * 0.16, gy + 0.05, 0], 6, 4), 1.4);
    // feather tip stud
    ball(0.006, P.glowCore, [s * 0.1535, gy + 0.092, 0], 5, 4);
    // screws on the underside edge
    for (const z of [-0.029, 0.029]) {
      ball(0.0045, P.screw, [s * 0.095, gy - 0.004, z * 1.02], 6, 4);
    }
  }

  // central boss
  const bossC: Pt = [0, gy, -0.005];
  const bz = 1.25;
  cyl(0.052, 0.054, 0.05, 8, P.gunMetal, bossC, { scale: [1, 1, bz] });
  cyl(0.058, 0.058, 0.007, 8, P.gold, [0, gy - 0.026, -0.005], { scale: [1, 1, bz] });
  cyl(0.058, 0.058, 0.007, 8, P.gold, [0, gy + 0.026, -0.005], { scale: [1, 1, bz] });
  cyl(0.06, 0.06, 0.003, 8, P.goldDark, [0, gy - 0.0325, -0.005], { scale: [1, 1, bz] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = 0.0525;
    const rz = 0.0525 * bz;
    const pos: Pt = [Math.sin(a) * rx, gy, bossC[2] + Math.cos(a) * rz];
    const n: Pt = [Math.sin(a), 0, Math.cos(a) / bz];
    // screw heads at the corners
    cyl(0.0055, 0.0055, 0.006, 6, P.screw, pos, { dir: n });
    // glowing slits between them
    const a2 = a + Math.PI / 8;
    const p2: Pt = [Math.sin(a2) * rx, gy, bossC[2] + Math.cos(a2) * rz];
    const n2: Pt = [Math.sin(a2), 0, Math.cos(a2) / bz];
    glow(
      b.part(new THREE.BoxGeometry(0.004, 0.02, 0.005), P.glowBlue, { at: p2, dir: n2, axis: "z" }),
      1.2,
    );
  }

  // ---------- trigger guard loop (+Z) ----------
  const lp = (z: number, y: number, x = 0): Pt => [x, y, z];
  const loopPts = (x: number) => [
    lp(0.035, 1.07, x),
    lp(0.1, 1.062, x),
    lp(0.165, 1.075, x),
    lp(0.198, 1.12, x),
    lp(0.18, 1.17, x),
    lp(0.12, 1.2, x),
    lp(0.05, 1.2, x),
    lp(0.022, 1.19, x),
  ];
  b.sweep(catmull(loopPts(0)), () => [0.0115, 0.0072], { color: P.gold, sides: 8 });
  for (const sx of [-1, 1]) {
    b.sweep(catmull(loopPts(sx * 0.0105)), 0.0028, { color: P.gunDark, sides: 4, caps: "flat" });
  }
  // bracket where the loop meets the guard
  box([0.03, 0.022, 0.05], P.gold, [0, 1.073, 0.05]);
  box([0.032, 0.006, 0.052], P.goldDark, [0, 1.061, 0.05]);
  ball(0.005, P.screw, [0.0165, 1.075, 0.07]);
  ball(0.005, P.screw, [-0.0165, 1.075, 0.07]);
  // front stud on the loop's belly
  ball(0.009, P.gunDark, [0, 1.12, 0.2], 6, 4);
  glow(ball(0.0055, P.glowBlue, [0, 1.12, 0.205], 5, 4), 1.2);
  // joint cap at the grip
  box([0.03, 0.018, 0.022], P.gold, [0, 1.195, 0.035]);

  // curved trigger inside the loop
  b.sweep(
    catmull([lp(0.09, 1.198), lp(0.092, 1.16), lp(0.103, 1.125), lp(0.122, 1.093)]),
    (t) => [0.0055, 0.0085 - 0.005 * t],
    { color: P.gunLight, sides: 6 },
  );
  for (const sx of [-1, 1]) {
    cyl(0.0065, 0.0065, 0.004, 6, P.screw, [sx * 0.0125, 1.195, 0.09], { rotation: [0, 0, 90] });
  }

  // ---------- hammer (-Z) ----------
  box([0.034, 0.03, 0.045], P.gunMetal, [0, 1.075, -0.115]);
  box([0.036, 0.004, 0.047], P.gunDark, [0, 1.06, -0.115]);
  const hammer = [
    [0, 1.085, -0.115],
    [0, 1.105, -0.14],
    [0, 1.135, -0.17],
    [0, 1.16, -0.2],
  ] as Pt[];
  b.sweep(catmull(hammer), (t) => [0.012, 0.016 - 0.006 * t], { color: P.gunMetal, sides: 8 });
  // pivot pin and screw heads
  cyl(0.006, 0.006, 0.046, 6, P.gold, [0, 1.105, -0.14], { rotation: [0, 0, 90] });
  for (const sx of [-1, 1]) {
    cyl(0.009, 0.009, 0.006, 8, P.screw, [sx * 0.0195, 1.105, -0.14], { rotation: [0, 0, 90] });
    box([0.0065, 0.002, 0.016], P.gunDark, [sx * 0.0225, 1.105, -0.14], [0, 0, 0]);
  }
  // knurled spur
  const tn = new THREE.Vector3(0, Math.sin((40 * Math.PI) / 180), -Math.cos((40 * Math.PI) / 180));
  const nn = new THREE.Vector3(0, Math.cos((40 * Math.PI) / 180), Math.sin((40 * Math.PI) / 180));
  const end = new THREE.Vector3(...hammer[3]);
  const padC = end.clone().addScaledVector(nn, 0.009).addScaledVector(tn, -0.005);
  box([0.03, 0.008, 0.045], P.gunLight, [padC.x, padC.y, padC.z], [40, 0, 0]);
  for (let k = -3; k <= 3; k++) {
    const c = padC.clone().addScaledVector(tn, k * 0.006).addScaledVector(nn, 0.0042);
    box([0.032, 0.0035, 0.0035], P.gunDark, [c.x, c.y, c.z], [40, 0, 0]);
  }

  // ---------- grip ----------
  const gh = GRIP_Y1 - GRIP_Y0;
  // gunDark core visible between ferrule and leather
  cyl(0.026, 0.026, gh, 8, P.gunDark, [gripX, GRIP_Y0 + gh / 2, gripZ]);
  // bottom ferrule
  cyl(0.037, 0.039, 0.014, 8, P.gold, [gripX, GRIP_Y0 + 0.007, gripZ], { rotation: [0, 22.5, 0] });
  cyl(0.04, 0.04, 0.003, 8, P.goldDark, [gripX, GRIP_Y0 + 0.0015, gripZ], { rotation: [0, 22.5, 0] });
  cyl(0.032, 0.032, 0.007, 8, P.gunDark, [gripX, GRIP_Y0 + 0.0175, gripZ], { rotation: [0, 22.5, 0] });
  // top ferrule
  cyl(0.039, 0.037, 0.014, 8, P.gold, [gripX, GRIP_Y1 - 0.007, gripZ], { rotation: [0, 22.5, 0] });
  cyl(0.04, 0.04, 0.003, 8, P.goldDark, [gripX, GRIP_Y1 - 0.0015, gripZ], { rotation: [0, 22.5, 0] });
  cyl(0.032, 0.032, 0.007, 8, P.gunDark, [gripX, GRIP_Y1 - 0.0175, gripZ], { rotation: [0, 22.5, 0] });
  // leather sleeve
  const lt0 = GRIP_Y0 + 0.021;
  const lt1 = GRIP_Y1 - 0.021;
  const lh = lt1 - lt0;
  cyl(0.031, 0.0325, lh, 8, P.leather, [gripX, lt0 + lh / 2, gripZ], { rotation: [0, 22.5, 0] });
  // diagonal wrap bands
  b.sweep(
    spiral([gripX, lt0 + 0.004, gripZ], [gripX + 0.0315, lt0 + 0.004, gripZ], [0, 1, 0], {
      turns: 6,
      pitch: (lh - 0.008) / 6,
    }),
    0.0034,
    { color: P.leatherDark, sides: 4, caps: "flat" },
  );
  // cross-wrap highlight cords
  b.sweep(
    spiral([gripX, lt0 + 0.015, gripZ], [gripX + 0.0318, lt0 + 0.015, gripZ], [0, 1, 0], {
      turns: -6,
      pitch: (lh - 0.03) / 6,
    }),
    0.0012,
    { color: P.leatherDark, sides: 4, caps: "flat" },
  );
  // gold rivets down the front and back
  for (const sz of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const y = lt0 + 0.025 + (i * (lh - 0.05)) / 4;
      ball(0.0042, P.gold, [gripX, y, gripZ + sz * 0.0305], 6, 4);
    }
  }
  // rivet rings just inside the ferrules
  for (const y of [GRIP_Y0 + 0.0215, GRIP_Y1 - 0.0215]) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ball(0.0032, P.gold, [gripX + Math.sin(a) * 0.0335, y, gripZ + Math.cos(a) * 0.0335], 5, 3);
    }
  }
  // gold studs on the ferrules
  for (const y of [GRIP_Y0 + 0.007, GRIP_Y1 - 0.007]) {
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      const n: Pt = [Math.sin(a), 0, Math.cos(a)];
      cyl(0.0035, 0.0035, 0.004, 5, P.goldDark, [gripX + n[0] * 0.039, y, gripZ + n[2] * 0.039], { dir: n });
    }
  }
}
    return buildHilt;
  })(),
  // pommelCharm
  (() => {
function buildPommelCharm({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const DEG = Math.PI / 180;

  // ---- helpers -----------------------------------------------------------------------------
  type V = [number, number, number];
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V,
    o: { rot?: V; sc?: V; quat?: THREE.Quaternion } = {},
  ) => {
    if (o.sc) geo.scale(o.sc[0], o.sc[1], o.sc[2]);
    return b.part(geo, color, { at, rotation: o.rot, quat: o.quat, flat: true });
  };
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: V, rot?: V) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { rot });
  const box = (w: number, h: number, d: number, color: string, at: V, rot?: V) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, { rot });

  // ---- lion head relief / pendant -------------------------------------------------------------
  // Faces +Z when f = 1, -Z when f = -1. s is the scale of the head (mane radius ~ s).
  const lionHead = (cx: number, cy: number, cz: number, s: number, f: number, ruby: boolean) => {
    const at = (x: number, y: number, z: number): V => [cx + x * s, cy + y * s, cz + f * z * s];
    // mane back disc and back layer of spikes (shade)
    put(new THREE.CylinderGeometry(0.55 * s, 0.55 * s, 0.14 * s, 10), P.bladeShade, at(0, 0, -0.04), {
      rot: [90, 0, 0],
    });
    for (let i = 0; i < 12; i++) {
      const a = i * 30 + 15;
      const r = 0.62;
      put(
        new THREE.ConeGeometry(0.15 * s, 0.42 * s, 4),
        P.bladeShade,
        at(-Math.sin(a * DEG) * r, Math.cos(a * DEG) * r, -0.06),
        { rot: [0, 0, a] },
      );
    }
    // front layer of mane spikes
    for (let i = 0; i < 12; i++) {
      const a = i * 30;
      const r = 0.72;
      put(
        new THREE.ConeGeometry(0.2 * s, 0.52 * s, 4),
        P.lionSilver,
        at(-Math.sin(a * DEG) * r, Math.cos(a * DEG) * r, 0.0),
        { rot: [0, 0, a] },
      );
    }
    // face
    put(new THREE.SphereGeometry(0.42 * s, 8, 6), P.lionSilver, at(0, 0, 0.02), { sc: [1, 1, 0.75] });
    // snout
    put(new THREE.BoxGeometry(0.22 * s, 0.17 * s, 0.2 * s), P.bladeEdge, at(0, -0.12, 0.3));
    put(new THREE.BoxGeometry(0.09 * s, 0.06 * s, 0.05 * s), P.black, at(0, -0.04, 0.41));
    put(new THREE.BoxGeometry(0.16 * s, 0.018 * s, 0.03 * s), P.engrave, at(0, -0.2, 0.39));
    for (const sx of [1, -1]) {
      // fangs
      put(new THREE.ConeGeometry(0.025 * s, 0.09 * s, 4), P.bladeEdge, at(sx * 0.055, -0.27, 0.36), {
        rot: [180, 0, 0],
      });
      // eyes + brows
      put(new THREE.SphereGeometry(0.06 * s, 5, 4), P.black, at(sx * 0.16, 0.06, 0.27));
      box(0.2 * s, 0.04 * s, 0.04 * s, P.engrave, [cx + sx * 0.17 * s, cy + 0.15 * s, cz + f * 0.27 * s], [
        0,
        0,
        sx * f * -22,
      ]);
      // cheek tufts
      put(new THREE.ConeGeometry(0.08 * s, 0.2 * s, 4), P.lionSilver, at(sx * 0.36, -0.12, 0.1), {
        rot: [0, 0, sx * -70],
      });
    }
    if (ruby) put(new THREE.OctahedronGeometry(0.085 * s), P.ruby, at(0, 0.3, 0.22));
  };

  // ---- pommel ----------------------------------------------------------------------------
  const R: V = [0, 22.5, 0]; // flats face the axes
  cyl(0.04, 0.04, 0.012, 8, P.goldDark, [0, 1.366, 0], R); // collar
  cyl(0.0345, 0.04, 0.006, 8, P.gold, [0, 1.3735, 0], R); // collar lip
  cyl(0.046, 0.033, 0.03, 8, P.gold, [0, 1.391, 0], R); // lower body
  cyl(0.0475, 0.0475, 0.006, 8, P.goldDark, [0, 1.407, 0], R); // widest band
  cyl(0.031, 0.046, 0.024, 8, P.gold, [0, 1.422, 0], R); // upper body
  cyl(0.033, 0.033, 0.006, 8, P.goldDark, [0, 1.436, 0], R); // top ring
  cyl(0.024, 0.03, 0.01, 8, P.gold, [0, 1.444, 0], R); // gem seat

  // studs and diamonds on the diagonal flats
  for (let k = 0; k < 4; k++) {
    const a = 45 + k * 90;
    const sx = Math.sin(a * DEG);
    const cz = Math.cos(a * DEG);
    put(new THREE.SphereGeometry(0.0055, 5, 4), P.gold, [sx * 0.046, 1.407, cz * 0.046]);
    put(new THREE.OctahedronGeometry(0.006), P.goldDark, [sx * 0.0385, 1.386, cz * 0.0385], {
      sc: [1, 1.4, 1],
      rot: [0, a, 0],
    });
    put(new THREE.OctahedronGeometry(0.005), P.goldDark, [sx * 0.032, 1.424, cz * 0.032], {
      sc: [1, 1.4, 1],
      rot: [0, a, 0],
    });
  }

  // crowning gem with prongs
  glow(put(new THREE.OctahedronGeometry(0.014), P.glowBlue, [0, 1.452, 0], { sc: [1, 1.3, 1] }), 1.6);
  glow(put(new THREE.OctahedronGeometry(0.0075), P.glowCore, [0, 1.452, 0], { sc: [1, 1.3, 1] }), 2);
  for (let k = 0; k < 4; k++) {
    const a = k * 90 + 45;
    put(new THREE.ConeGeometry(0.0045, 0.02, 4), P.gold, [Math.sin(a * DEG) * 0.019, 1.456, Math.cos(a * DEG) * 0.019]);
  }

  // lion emblems front and back
  for (const f of [1, -1]) {
    put(new THREE.CylinderGeometry(0.027, 0.027, 0.008, 10), P.goldDark, [0, 1.405, f * 0.0415], {
      rot: [90, 0, 0],
    });
    put(new THREE.TorusGeometry(0.0265, 0.0024, 4, 12), P.gold, [0, 1.405, f * 0.0455]);
    lionHead(0, 1.405, f * 0.0455, 0.021, f, false);
  }

  // ---- side lug, ring and clasp ------------------------------------------------------------
  const ringC: V = [0.065, 1.412, 0];
  box(0.014, 0.01, 0.012, P.goldDark, [0.047, 1.412, 0]);
  put(new THREE.TorusGeometry(0.011, 0.0034, 5, 10), P.gold, ringC);
  cyl(0.0045, 0.0045, 0.014, 6, P.gold, [0.066, 1.397, 0]); // clasp
  put(new THREE.SphereGeometry(0.0055, 5, 4), P.goldDark, [0.066, 1.4045, 0]);
  box(0.011, 0.004, 0.011, P.goldDark, [0.0665, 1.3895, 0]);

  // ---- chain ------------------------------------------------------------------------------
  const n = 9;
  const top: V = [0.066, 1.387, 0];
  const bot: V = [0.09, 1.325, 0];
  const dx = bot[0] - top[0];
  const dy = bot[1] - top[1];
  const tilt = Math.atan2(-dx, -dy) + Math.PI; // +Y toward the downward direction
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.atan2(-dx, dy * -1) * 0 + Math.atan2(dx, -dy) * -1 + 0);
    void tilt;
    if (i % 2) qz.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
    put(new THREE.TorusGeometry(0.0055, 0.0018, 5, 8), i % 2 ? P.goldDark : P.gold, [
      top[0] + dx * t,
      top[1] + dy * t,
      0,
    ], { sc: [1, 1.45, 1], quat: qz });
  }

  // ---- Griever pendant ----------------------------------------------------------------------
  const PX = 0.09;
  const PY = 1.265;
  put(new THREE.TorusGeometry(0.0065, 0.002, 5, 8), P.gold, [PX, 1.3195, 0]); // bail
  box(0.008, 0.008, 0.006, P.goldDark, [PX, 1.3095, 0]);
  lionHead(PX, PY, 0, 0.045, 1, true);
  // back plate so the reverse reads as a silver medallion with a gold boss
  put(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 8), P.lionSilver, [PX, PY, -0.012], { rot: [90, 0, 0] });
  put(new THREE.SphereGeometry(0.007, 5, 4), P.gold, [PX, PY, -0.016]);
  // gold ring around the face for trim
  put(new THREE.TorusGeometry(0.0175, 0.0014, 4, 12), P.gold, [PX, PY, 0.003]);
  // tiny gems in the mane crown
  for (const sx of [1, -1]) {
    put(new THREE.OctahedronGeometry(0.0028), P.glowBlue, [PX + sx * 0.026, PY + 0.014 + rand() * 0.0, 0.008]);
  }
}
    return buildPommelCharm;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
