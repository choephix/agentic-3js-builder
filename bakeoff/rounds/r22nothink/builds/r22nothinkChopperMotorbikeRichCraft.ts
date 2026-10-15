import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "Custom chopper with a raked springer fork, fat rear tyre, teardrop tank and V-twin in polished sci-fi Overwatch colour blocking: graphite and cream with one orange accent and cyan energy strips.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: graphite + cream blocking, orange accent, cyan glow
const GRAPHITE = "#2b3140";
const DARK = "#161a24";
const CREAM = "#eef1f4";
const STEEL = "#aeb8c6";
const STEEL_D = "#6d7886";
const ORANGE = "#ff7a1a";
const ORANGE_D = "#c9520a";
const CYAN = "#37e6ff";
const RUBBER = "#14161b";
const LEATHER = "#4a2f22";
const LEATHER_L = "#6b4533";
const GOLD = "#d9b04a";
const RED = "#e23b3b";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "chopperMotorbike", paintSize: 1024 });
  const R = rng(7);

  // ---------- Layout (meters, +Z forward, +Y up) ----------
  const WHEEL_R = 0.36; // front
  const REAR_R = 0.4;
  const REAR_Z = -0.95;
  const FRONT_Z = 1.15;
  const REAR_Y = REAR_R;
  const FRONT_Y = WHEEL_R;

  const tireRing = (cz: number, cy: number, r: number, w: number, name: number) => {
    // tyre as torus, rotated so its axis is X
    const tyre = b.part(new THREE.TorusGeometry(r - w * 0.5, w * 0.5, 8, 28), RUBBER, {
      at: [0, cy, cz],
      rotation: [0, 90, 0],
    });
    void name;
    return tyre;
  };

  // ---------- Paints ----------
  const TANK = paint((p, n) => {
    if (n.y < -0.4) return GRAPHITE;
    // cream upper, orange lower stripe, graphite belly
    const h = p.y;
    if (h < 0.0) return GRAPHITE;
    return CREAM;
  });
  const carbon = stripes(GRAPHITE, DARK, { size: 0.03, axis: [1, 1, 0], width: 0.5, wobble: 0 });
  const fenderPaint = paint((p, n) => {
    const side = Math.abs(p.x);
    if (side < 0.012 && n.y > 0.3) return ORANGE;
    return CREAM;
  });

  // ---------- Wheels ----------
  for (const [cz, cy, r, w] of [
    [FRONT_Z, FRONT_Y, WHEEL_R, 0.13],
    [REAR_Z, REAR_Y, REAR_R, 0.24],
  ] as const) {
    tireRing(cz, cy, r, w, 0);
    // tread blocks
    const tg: THREE.BufferGeometry[] = [];
    const nT = cz === REAR_Z ? 30 : 24;
    for (let i = 0; i < nT; i++) {
      const a = (i / nT) * Math.PI * 2;
      const g = new THREE.BoxGeometry(w * 0.7, 0.018, 0.03);
      g.rotateX(a);
      g.translate(0, cy + Math.sin(a) * (r + 0.004), cz + Math.cos(a) * (r + 0.004));
      tg.push(g);
    }
    // merge treads manually into one part via individual parts is costly; use one lathe-like merge
    import_merge(b, tg, "#0c0d11");

    // rim: lathe disc
    b.lathe(
      [
        [0, -w * 0.28],
        [r - w - 0.03, -w * 0.28],
        [r - w, -w * 0.12],
        [r - w, w * 0.12],
        [r - w - 0.03, w * 0.28],
        [0, w * 0.28],
      ],
      { at: [0, cy, cz], axis: "x" as never, segments: 24, color: STEEL } as never,
    );
  }
  // (lathe above uses world Y axis unless rotated; replaced by explicit disc parts below)

  return finish(b, {
    R,
    TANK,
    carbon,
    fenderPaint,
    REAR_Z,
    REAR_Y,
    REAR_R,
    FRONT_Z,
    FRONT_Y,
    WHEEL_R,
  });
}

function import_merge(b: ReturnType<typeof createBuilder>, geos: THREE.BufferGeometry[], color: string) {
  // merge by hand: concatenate non-indexed geometry
  const pos: number[] = [];
  const nor: number[] = [];
  for (const g of geos) {
    const ng = g.index ? g.toNonIndexed() : g;
    ng.computeVertexNormals();
    pos.push(...Array.from(ng.attributes.position.array as ArrayLike<number>));
    nor.push(...Array.from(ng.attributes.normal.array as ArrayLike<number>));
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  b.part(m, color, { at: [0, 0, 0] });
}

function finish(
  b: ReturnType<typeof createBuilder>,
  k: {
    R: () => number;
    TANK: ReturnType<typeof paint>;
    carbon: ReturnType<typeof paint>;
    fenderPaint: ReturnType<typeof paint>;
    REAR_Z: number;
    REAR_Y: number;
    REAR_R: number;
    FRONT_Z: number;
    FRONT_Y: number;
    WHEEL_R: number;
  },
): THREE.Object3D {
  const { TANK, carbon, fenderPaint, REAR_Z, REAR_Y, REAR_R, FRONT_Z, FRONT_Y, WHEEL_R } = k;

  // ---------- Wheel hardware (rims, spokes, hubs, discs) ----------
  const wheels: Array<[number, number, number, number]> = [
    [FRONT_Z, FRONT_Y, WHEEL_R, 0.13],
    [REAR_Z, REAR_Y, REAR_R, 0.24],
  ];
  for (const [cz, cy, r, w] of wheels) {
    const rimR = r - w * 0.9;
    // rim ring (torus) in steel
    b.part(new THREE.TorusGeometry(rimR, 0.018, 6, 28), STEEL, { at: [0, cy, cz], rotation: [0, 90, 0] });
    // hub
    b.part(new THREE.CylinderGeometry(0.055, 0.055, w * 0.9 + 0.04, 10), STEEL_D, {
      at: [0, cy, cz],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, w * 0.9 + 0.12, 8), STEEL, {
      at: [0, cy, cz],
      rotation: [0, 0, 90],
    });
    // spokes: 10 flat blades
    const nS = 10;
    for (let i = 0; i < nS; i++) {
      const a = (i / nS) * Math.PI * 2;
      const y1 = cy + Math.sin(a) * rimR;
      const z1 = cz + Math.cos(a) * rimR;
      b.rod([0, cy, cz], [0, y1, z1], 0.011, i % 2 ? STEEL : STEEL_D);
    }
    // cream hub-cap discs both sides
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(rimR * 0.62, rimR * 0.62, 0.012, 20), CREAM, {
        at: [s * (w * 0.5 + 0.0), cy, cz],
        rotation: [0, 0, 90],
      });
      // orange ring on disc
      b.part(new THREE.TorusGeometry(rimR * 0.62, 0.008, 4, 24), ORANGE, {
        at: [s * (w * 0.5 + 0.007), cy, cz],
        rotation: [0, 90, 0],
      });
      // cyan glow ring on rim
      glow(
        b.part(new THREE.TorusGeometry(rimR * 0.92, 0.006, 4, 28), CYAN, {
          at: [s * (w * 0.5 + 0.004), cy, cz],
          rotation: [0, 90, 0],
        }),
        1.2,
      );
    }
  }
  // brake discs
  for (const [cz, cy, x] of [
    [FRONT_Z, FRONT_Y, 0.09],
    [REAR_Z, REAR_Y, -0.16],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 18), STEEL, { at: [x, cy, cz], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 10), DARK, { at: [x, cy, cz], rotation: [0, 0, 90] });
    // caliper
    b.part(new THREE.BoxGeometry(0.04, 0.07, 0.1), ORANGE, { at: [x, cy + 0.02, cz - 0.15] });
  }

  // ---------- Frame ----------
  const FRAME = GRAPHITE;
  const swingPivot: [number, number, number] = [0, 0.5, -0.45];
  // Rear swing arms
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        [s * 0.11, 0.52, -0.42],
        [s * 0.13, 0.46, -0.7],
        [s * 0.14, REAR_Y + 0.02, REAR_Z],
      ]),
      [0.03, 0.022],
      FRAME,
      { section: "box", caps: "flat" },
    );
    // lower stay
    b.rod([s * 0.12, 0.34, -0.38], [s * 0.14, REAR_Y - 0.01, REAR_Z + 0.02], 0.016, FRAME);
    // axle
    b.rod([s * 0.14, REAR_Y, REAR_Z], [s * 0.19, REAR_Y, REAR_Z], 0.022, STEEL);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), ORANGE, {
      at: [s * 0.2, REAR_Y, REAR_Z],
      rotation: [0, 0, 90],
    });
  }
  // Hardtail rails (rear loop over wheel)
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.08, 0.62, -0.2],
        [s * 0.1, 0.64, -0.55],
        [s * 0.11, 0.62, -0.85],
        [s * 0.13, 0.5, -REAR_Z * 0 - 0.95],
      ]),
      0.02,
      FRAME,
      { sides: 6 },
    );
  }
  // Backbone: from head tube sloping down to seat
  const headTop: [number, number, number] = [0, 0.98, 0.58];
  const headBot: [number, number, number] = [0, 0.82, 0.66];
  b.rod(headBot, headTop, 0.045, STEEL_D, { sides: 8 });
  // top tube
  b.sweep(
    catmull([
      [0, 0.94, 0.56],
      [0, 0.86, 0.2],
      [0, 0.74, -0.1],
      [0, 0.66, -0.4],
    ]),
    0.034,
    FRAME,
    { sides: 8 },
  );
  // down tube cradle
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 0.84, 0.62],
        [s * 0.07, 0.6, 0.45],
        [s * 0.11, 0.36, 0.2],
        [s * 0.11, 0.3, -0.1],
        [s * 0.1, 0.4, -0.4],
      ]),
      0.026,
      FRAME,
      { sides: 6 },
    );
  }
  // seat post / rear brace
  b.rod([0, 0.7, -0.3], [0, 0.44, -0.46], 0.028, FRAME);
  // engine mounting plates
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.34, 0],
        [0.4, 0.14],
        [0.3, 0.3],
        [0.04, 0.28],
      ],
      { at: [s * 0.125, 0.22, -0.05], x: [0, 0, 1], thickness: 0.016, bevel: 0.004, color: STEEL_D },
    );
  }

  // ---------- Springer front fork (raked) ----------
  const steerTop: [number, number, number] = [0, 1.02, 0.55];
  // Fork lower end at front axle
  const axle: [number, number, number] = [0, FRONT_Y, FRONT_Z];
  const forkTop: [number, number, number] = [0, 0.92, 0.68];
  // triple-tree upper
  b.rod([-0.12, 1.04, 0.55], [0.12, 1.04, 0.55], 0.024, STEEL_D);
  // lower tree
  b.rod([-0.1, 0.84, 0.68], [0.1, 0.84, 0.68], 0.024, STEEL_D);
  b.rod(steerTop, [0, 0.8, 0.7], 0.03, STEEL);
  for (const s of [1, -1]) {
    // outer fork leg: tube sleeves
    const topP: [number, number, number] = [s * 0.1, 0.84, 0.69];
    const botP: [number, number, number] = [s * 0.09, FRONT_Y + 0.02, FRONT_Z];
    b.rod(topP, botP, [0.03, 0.022], STEEL, { sides: 8 });
    // upper sleeve cream
    b.rod(topP, [s * 0.098, 0.64, 0.83], 0.036, CREAM, { sides: 8 });
    b.part(new THREE.TorusGeometry(0.036, 0.007, 4, 10), ORANGE, {
      at: [s * 0.098, 0.64, 0.83],
      dir: [0, -0.22, 1],
      axis: "z",
    });
    // springer rear stay
    b.rod([s * 0.1, 0.78, 0.66], [s * 0.1, FRONT_Y + 0.03, FRONT_Z - 0.1], 0.012, STEEL_D);
    // axle & cap
    b.rod([s * 0.09, FRONT_Y, FRONT_Z], [s * 0.15, FRONT_Y, FRONT_Z], 0.02, STEEL);
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 6), ORANGE, {
      at: [s * 0.15, FRONT_Y, FRONT_Z],
      rotation: [0, 0, 90],
    });
    // fork bolts
    for (const t of [0.15, 0.5, 0.85]) {
      b.part(new THREE.SphereGeometry(0.01, 5, 4), STEEL_D, {
        at: [s * (0.1 - 0.012 * t), 0.84 - 0.46 * t, 0.69 + 0.46 * t * 1.0],
      });
    }
  }

  // ---------- Handlebars (ape hangers) ----------
  const barY = 1.2;
  const barZ = 0.5;
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.04, 1.05, 0.55],
        [s * 0.17, 1.12, 0.52],
        [s * 0.3, 1.24, 0.46],
        [s * 0.37, 1.3, 0.38],
      ]),
      0.014,
      CREAM,
      { sides: 6 },
    );
    // grip
    b.rod([s * 0.37, 1.3, 0.38], [s * 0.37, 1.3, 0.27], 0.02, LEATHER, { sides: 8 });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), STEEL, { at: [s * 0.37, 1.3, 0.26] });
    // lever
    b.rod([s * 0.34, 1.3, 0.38], [s * 0.3, 1.28, 0.5], 0.005, STEEL);
    b.part(new THREE.SphereGeometry(0.01, 5, 4), ORANGE, { at: [s * 0.3, 1.28, 0.5] });
    // mirror
    b.rod([s * 0.34, 1.31, 0.36], [s * 0.4, 1.46, 0.34], 0.006, STEEL_D);
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 8), STEEL, {
      at: [s * 0.4, 1.48, 0.34],
      dir: [0, 0.3, -1],
      axis: "y",
    });
  }
  void barY;
  void barZ;
  // bar clamp
  b.part(new THREE.BoxGeometry(0.1, 0.04, 0.06), STEEL_D, { at: [0, 1.06, 0.55] });

  // ---------- Headlight ----------
  const hl: [number, number, number] = [0, 0.98, 0.84];
  b.part(new THREE.SphereGeometry(0.1, 12, 8), CREAM, { at: hl, scale: [1, 1, 0.8] });
  b.part(new THREE.TorusGeometry(0.095, 0.014, 5, 16), STEEL, { at: [0, 0.98, 0.9], dir: [0, 0, 1], axis: "z" });
  glow(b.part(new THREE.CircleGeometry(0.085, 14), "#fff6c8", { at: [0, 0.98, 0.915], dir: [0, 0, 1], axis: "z" }), 1.4);
  b.part(new THREE.TorusGeometry(0.055, 0.006, 4, 14), ORANGE, { at: [0, 0.98, 0.918], dir: [0, 0, 1], axis: "z" });
  b.rod([0, 0.9, 0.78], [0, 0.84, 0.72], 0.02, STEEL_D);
  // headlight brackets
  for (const s of [1, -1]) b.rod([s * 0.1, 0.9, 0.7], [s * 0.095, 0.98, 0.82], 0.01, STEEL_D);
  // cyan "brow" strip
  glow(b.rod([-0.08, 1.085, 0.88], [0.08, 1.085, 0.88], 0.006, CYAN), 1.3);

  // ---------- Front fender ----------
  const fenderPath = catmull([
    [0, FRONT_Y + 0.17, FRONT_Z + 0.3],
    [0, FRONT_Y + 0.32, FRONT_Z + 0.1],
    [0, FRONT_Y + 0.37, FRONT_Z - 0.1],
    [0, FRONT_Y + 0.3, FRONT_Z - 0.3],
  ]);
  b.sweep(fenderPath, 0.1, fenderPaint, {
    shift: [0, 0],
    radius: (t: number) => [0.07 + 0.03 * Math.sin(t * Math.PI), 0.012],
  } as never);
  // fender struts
  for (const s of [1, -1]) {
    b.rod([s * 0.075, FRONT_Y + 0.32, FRONT_Z + 0.08], [s * 0.095, FRONT_Y + 0.02, FRONT_Z], 0.008, STEEL_D);
  }

  // ---------- Fuel tank ----------
  const tank = b.loft(
    [
      { at: [0, 0.94, 0.5], w: 0.14, h: 0.1 },
      { at: [0, 1.0, 0.32], w: 0.26, h: 0.2 },
      { at: [0, 0.99, 0.08], w: 0.3, h: 0.24 },
      { at: [0, 0.94, -0.14], w: 0.24, h: 0.2 },
      { at: [0, 0.86, -0.3], w: 0.12, h: 0.1 },
    ],
    { color: TANK, caps: "round", sides: 12 },
  );
  void tank;
  // orange lower-edge pinstripe each side
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.07, 0.9, 0.46],
        [s * 0.13, 0.91, 0.3],
        [s * 0.15, 0.89, 0.08],
        [s * 0.12, 0.84, -0.14],
        [s * 0.06, 0.79, -0.28],
      ]),
      0.007,
      ORANGE,
      { sides: 4 },
    );
    // cyan glow inset line above
    glow(
      b.sweep(
        catmull([
          [s * 0.08, 0.99, 0.42],
          [s * 0.13, 1.04, 0.28],
          [s * 0.15, 1.04, 0.08],
          [s * 0.12, 1.0, -0.12],
        ]),
        0.005,
        CYAN,
        { sides: 4 },
      ),
      1.3,
    );
  }
  // filler cap
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), STEEL, { at: [0, 1.125, 0.2] });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.026, 8), ORANGE, { at: [0, 1.13, 0.2] });
  // tank emblem (original chevron decal)
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><path d="M8 52 L32 8 L56 52 L44 52 L32 30 L20 52Z" fill="#ff7a1a"/><path d="M22 56 L32 40 L42 56Z" fill="#2b3140"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      at: [s * 0.158, 0.98, 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
      up: [0, 0, 1],
    } as never);
  }
  // tank mounts / strap
  b.sweep(
    catmull([
      [-0.13, 0.9, 0.0],
      [0, 1.09, 0.0],
      [0.13, 0.9, 0.0],
    ]),
    0.012,
    LEATHER,
    { section: "box" },
  );
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), GOLD, { at: [0, 1.1, 0.0] });

  // ---------- Seat (solo bobber saddle) ----------
  const seatPaint = paint((p, n) => {
    if (n.y > 0.3 && Math.abs(p.x) < 0.01) return ORANGE;
    return n.y > 0.3 ? LEATHER_L : LEATHER;
  });
  b.loft(
    [
      { at: [0, 0.77, -0.2], w: 0.18, h: 0.04 },
      { at: [0, 0.72, -0.4], w: 0.3, h: 0.06 },
      { at: [0, 0.71, -0.6], w: 0.32, h: 0.06 },
      { at: [0, 0.74, -0.8], w: 0.2, h: 0.05 },
    ],
    { color: seatPaint, caps: "round", sides: 10 },
  );
  // seat pan + rivets
  b.part(new THREE.BoxGeometry(0.34, 0.012, 0.6), DARK, { at: [0, 0.678, -0.5] });
  for (let i = 0; i < 6; i++) {
    const z = -0.3 - i * 0.1;
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD, { at: [s * 0.16, 0.7, z] });
  }
  // seat springs
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        [s * 0.07, 0.68, -0.3],
        [s * 0.07, 0.6, -0.34],
        [s * 0.07, 0.66, -0.38],
        [s * 0.07, 0.58, -0.42],
        [s * 0.07, 0.64, -0.46],
      ]),
      0.005,
      STEEL_D,
      { sides: 4 },
    );
  }

  // ---------- Rear fender ----------
  const rf = catmull([
    [0, REAR_Y + 0.36, REAR_Z + 0.3],
    [0, REAR_Y + 0.43, REAR_Z + 0.05],
    [0, REAR_Y + 0.37, REAR_Z - 0.22],
    [0, REAR_Y + 0.2, REAR_Z - 0.42],
  ]);
  b.sweep(rf, 0.1, fenderPaint, {
    radius: (t: number) => [0.14 - 0.03 * t, 0.014],
  } as never);
  for (const s of [1, -1]) {
    b.rod([s * 0.13, REAR_Y + 0.36, REAR_Z + 0.2], [s * 0.15, REAR_Y + 0.02, REAR_Z], 0.009, STEEL_D);
  }
  // tail light
  glow(b.part(new THREE.BoxGeometry(0.08, 0.04, 0.03), RED, { at: [0, REAR_Y + 0.22, REAR_Z - 0.42], rotation: [-30, 0, 0] }), 1.4);
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.05), DARK, { at: [0, REAR_Y + 0.26, REAR_Z - 0.4], rotation: [-30, 0, 0] });
  // licence plate
  const PLATE = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#eef1f4"/><rect x="2" y="2" width="60" height="28" rx="2" fill="none" stroke="#2b3140" stroke-width="1.5"/><text x="32" y="22" font-size="16" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#2b3140">OW-77</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", {
    at: [0, REAR_Y + 0.12, REAR_Z - 0.465],
    dir: [0, -0.25, -1],
    axis: "z",
    texture: PLATE,
  });
  b.part(new THREE.BoxGeometry(0.17, 0.09, 0.008), DARK, { at: [0, REAR_Y + 0.12, REAR_Z - 0.458], rotation: [-14, 0, 0] });

  // ---------- V-twin engine ----------
  const ENG_Z = -0.02;
  const ENG_Y = 0.42;
  // crankcase
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.36), STEEL_D, { at: [0, ENG_Y - 0.05, ENG_Z] });
  b.part(new THREE.BoxGeometry(0.22, 0.12, 0.2), GRAPHITE, { at: [0, ENG_Y - 0.15, ENG_Z - 0.02] });
  // cylinders at +-V angle
  for (const [ang, zc] of [
    [28, 0.14],
    [-28, -0.12],
  ] as const) {
    const a = (ang * Math.PI) / 180;
    const cx = 0;
    const base: [number, number, number] = [cx, ENG_Y + 0.02, ENG_Z + zc * 0.5];
    const tip: [number, number, number] = [cx, base[1] + 0.3 * Math.cos(a), base[2] + 0.3 * Math.sin(a)];
    b.rod(base, tip, 0.075, GRAPHITE, { sides: 8 });
    // cooling fins
    for (let i = 0; i < 7; i++) {
      const t = 0.15 + i * 0.12;
      const c: [number, number, number] = [0, base[1] + (tip[1] - base[1]) * t, base[2] + (tip[2] - base[2]) * t];
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.01, 8), i % 2 ? STEEL : STEEL_D, {
        at: c,
        dir: [0, tip[1] - base[1], tip[2] - base[2]],
        axis: "y",
      });
    }
    // head cover
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8), ORANGE, {
      at: tip,
      dir: [0, tip[1] - base[1], tip[2] - base[2]],
      axis: "y",
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), STEEL, {
      at: [tip[0], tip[1] + 0.03 * Math.cos(a), tip[2] + 0.03 * Math.sin(a)],
      dir: [0, tip[1] - base[1], tip[2] - base[2]],
      axis: "y",
    });
    // side rocker covers
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.03, 0.06, 0.1), ORANGE_D, {
        at: [s * 0.095, tip[1] - 0.02, tip[2]],
        rotation: [ang, 0, 0],
      });
    }
  }
  // glowing energy core on engine sides
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 14), CREAM, {
      at: [s * 0.115, ENG_Y - 0.05, ENG_Z + 0.04],
      rotation: [0, 0, 90],
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.036, 12), CYAN, {
        at: [s * 0.118, ENG_Y - 0.05, ENG_Z + 0.04],
        rotation: [0, 0, 90],
      }),
      1.5,
    );
    b.part(new THREE.TorusGeometry(0.08, 0.008, 4, 16), ORANGE, {
      at: [s * 0.13, ENG_Y - 0.05, ENG_Z + 0.04],
      rotation: [0, 90, 0],
    });
    // bolts around cover
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.008, 5, 4), STEEL, {
        at: [s * 0.13, ENG_Y - 0.05 + Math.sin(a) * 0.065, ENG_Z + 0.04 + Math.cos(a) * 0.065],
      });
    }
  }
  // air intake / carburettor
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), STEEL, {
    at: [0.14, 0.7, 0.1],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), ORANGE, {
    at: [0.2, 0.7, 0.1],
    rotation: [0, 0, 90],
  });
  b.rod([0.1, 0.7, 0.1], [0.05, 0.64, 0.12], 0.025, STEEL_D);
  // oil tank (rear-left cylinder)
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 10), CREAM, { at: [-0.13, 0.52, -0.38], rotation: [75, 0, 0] });
  b.part(new THREE.TorusGeometry(0.06, 0.008, 4, 10), ORANGE, { at: [-0.13, 0.5, -0.27], dir: [0, -0.26, 0.97], axis: "z" });

  // ---------- Exhaust (side-swept pipes) ----------
  for (const [s, y0, z0] of [
    [1, 0.5, 0.2],
    [-1, 0.46, -0.1],
  ] as const) {
    b.sweep(
      catmull([
        [0, y0 + 0.1, z0],
        [s * 0.17, y0 - 0.05, z0],
        [s * 0.24, y0 - 0.1, z0 - 0.25],
        [s * 0.25, y0 - 0.06, z0 - 0.7],
        [s * 0.25, y0 - 0.02, z0 - 1.1],
      ]),
      [0.035, 0.05],
      STEEL,
      { sides: 8, caps: "flat" },
    );
    // heat shield stripes
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.014, 8), GRAPHITE, {
        at: [s * 0.25, y0 - 0.08 + i * 0.01, z0 - 0.45 - i * 0.14],
        rotation: [90, 0, 0],
      });
    }
    // tip
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.03, 10), ORANGE, {
      at: [s * 0.25, y0 - 0.02, z0 - 1.1],
      rotation: [90, 0, 0],
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.034, 10), CYAN, {
        at: [s * 0.25, y0 - 0.02, z0 - 1.105],
        rotation: [90, 0, 0],
      }),
      1.2,
    );
  }

  // ---------- Primary belt drive, chain ----------
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 14), STEEL_D, {
    at: [-0.12, 0.4, -0.12],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.036, 12), GRAPHITE, {
    at: [-0.12, REAR_Y, REAR_Z],
    rotation: [0, 0, 90],
  });
  b.rod([-0.12, 0.5, -0.12], [-0.12, REAR_Y + 0.06, REAR_Z], 0.008, DARK);
  b.rod([-0.12, 0.3, -0.12], [-0.12, REAR_Y - 0.06, REAR_Z], 0.008, DARK);

  // ---------- Foot pegs & kickstand ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 0.34, 0.12], [s * 0.3, 0.34, 0.12], 0.014, STEEL);
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 8), DARK, {
      at: [s * 0.32, 0.34, 0.12],
      rotation: [0, 0, 90],
    });
    // rear pegs
    b.rod([s * 0.14, 0.52, -0.62], [s * 0.26, 0.52, -0.62], 0.012, STEEL);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), DARK, {
      at: [s * 0.28, 0.52, -0.62],
      rotation: [0, 0, 90],
    });
  }
  // shift lever
  b.rod([-0.12, 0.34, 0.0], [-0.26, 0.3, 0.2], 0.008, STEEL);
  b.part(new THREE.SphereGeometry(0.014, 5, 4), ORANGE, { at: [-0.26, 0.3, 0.2] });
  // kickstand (down and resting)
  b.rod([-0.12, 0.34, -0.3], [-0.36, 0.01, -0.22], 0.012, STEEL_D);
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.05), STEEL_D, { at: [-0.37, 0.006, -0.22] });

  // ---------- Panel lines, bolts, decals ----------
  // Cream side panel under seat with orange chevron stripes
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.34, 0.02],
        [0.38, 0.12],
        [0.04, 0.14],
      ],
      { at: [s * 0.16, 0.56, -0.62], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, color: CREAM },
    );
    b.rod([s * 0.172, 0.6, -0.4], [s * 0.172, 0.58, -0.3], 0.005, ORANGE);
    glow(b.rod([s * 0.172, 0.65, -0.52], [s * 0.172, 0.65, -0.34], 0.004, CYAN), 1.2);
  }
  // fork lights (small cyan indicators)
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), CYAN, { at: [s * 0.16, 1.0, 0.8] }), 1.4);
    b.rod([s * 0.1, 0.95, 0.74], [s * 0.15, 1.0, 0.79], 0.006, STEEL_D);
  }
  // Wiring harness along neck
  b.sweep(
    catmull([
      [0.03, 1.0, 0.58],
      [0.06, 0.9, 0.5],
      [0.05, 0.8, 0.3],
      [0.08, 0.74, 0.1],
    ]),
    0.006,
    DARK,
    { sides: 4 },
  );
  // Speedo pod
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), DARK, { at: [0, 1.12, 0.5], rotation: [-30, 0, 0] });
  glow(b.part(new THREE.CircleGeometry(0.032, 10), CYAN, { at: [0, 1.128, 0.5 + 0.012], dir: [0, 0.5, 0.86], axis: "z" }), 1.1);

  return b.root;
}
