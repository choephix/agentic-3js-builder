import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame, spiral } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Gunblade of the Lion Knight",
  "description": "A Final Fantasy style gunblade: an oversized broad sword whose guard and ricasso hold a revolver chamber, trigger and grip, with gold filigree, a lion emblem and glowing cyan crystal accents."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  steel: "#c9d3de",
  steelEdge: "#f4fbff",
  steelDark: "#7c8896",
  gunmetal: "#2d313b",
  gunmetalLight: "#4b5160",
  gold: "#e2b53c",
  goldDark: "#9a6f1c",
  leather: "#1d2f63",
  leatherDark: "#101c3d",
  cloth: "#b3202c",
  gemRed: "#ff3b4a",
  runeCyan: "#35f2ff",
  brass: "#c58a2e",
  ink: "#15121c",
};
const M = {
  pommelBase: [0, 0, 0] as [number, number, number],
  gripBottom: [0, 0.1, 0] as [number, number, number],
  gripTop: [0, 0.34, 0] as [number, number, number],
  mechCenter: [0, 0.45, 0] as [number, number, number],
  guardCenter: [0, 0.56, 0] as [number, number, number],
  bladeRoot: [0, 0.56, 0] as [number, number, number],
  bladeTip: [0.03, 1.35, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // blade
  (() => {
type Pt = [number, number] | [number, number, "sharp"];

function buildBlade({ b, P }: Ctx) {
  const SIDES = [1, -1];
  const X0 = 0.0125; // fuller centre line
  const GROOVE = "#a9b6c4";
  const LIGHT_GOLD = "#f2d27a";
  const DEG = 180 / Math.PI;

  // ---- helpers -------------------------------------------------------------------------------------------
  // A flat slab drawn in the XY plane. Both faces use the same outline; s = -1 mirrors the thickness axis.
  const slab = (outline: Pt[], color: string, thickness: number, opts: { bevel?: number; at?: [number, number, number]; s?: number } = {}) =>
    b.extrude(outline, {
      at: opts.at ?? [0, 0, 0],
      x: [opts.s ?? 1, 0, 0],
      thickness,
      bevel: opts.bevel,
      detail: 0.34,
      color,
    });

  // A thin box strip between two points on one face of the blade (zSurface = height of the face it sits on).
  const seg = (x1: number, y1: number, x2: number, y2: number, w: number, zSurface: number, s: number, color: string, t = 0.0016) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ang = Math.atan2(y2 - y1, x2 - x1) * DEG;
    return b.part(new THREE.BoxGeometry(len, w, t), color, {
      at: [(x1 + x2) / 2, (y1 + y2) / 2, s * (zSurface + t / 2)],
      rotation: [0, 0, ang],
    });
  };

  const polygon = (r: number, n: number, rx = 1, ry = 1, rot = 0): Pt[] =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i / n) * Math.PI * 2;
      return [Math.cos(a) * r * rx, Math.sin(a) * r * ry] as Pt;
    });

  // ---- blade silhouette ----------------------------------------------------------------------------------
  // Spine at -X, edge at +X, a notch step near the tip and an angled clipped point at (0.03, 1.35).
  const outline: Pt[] = [
    [-0.09, 0.56, "sharp"],
    [0.1, 0.56, "sharp"],
    [0.1, 1.1, "sharp"],
    [0.085, 1.23, "sharp"],
    [0.03, 1.35, "sharp"],
    [-0.045, 1.29, "sharp"],
    [-0.045, 1.235, "sharp"],
    [-0.09, 1.2, "sharp"],
  ];

  // groove floor: the thin core slab that shows inside the fuller
  slab(outline, GROOVE, 0.022);

  // raised faces with a U-shaped slit open at the bottom (hidden under the guard) that forms the fuller
  const raised: Pt[] = [
    [-0.09, 0.56, "sharp"],
    [-0.02, 0.56, "sharp"],
    [-0.02, 1.16, "sharp"],
    [0.045, 1.2, "sharp"],
    [0.045, 0.56, "sharp"],
    [0.1, 0.56, "sharp"],
    [0.1, 1.1, "sharp"],
    [0.085, 1.23, "sharp"],
    [0.03, 1.35, "sharp"],
    [-0.045, 1.29, "sharp"],
    [-0.045, 1.235, "sharp"],
    [-0.09, 1.2, "sharp"],
  ];
  slab(raised, P.steel, 0.04, { bevel: 0.008 });

  // lighter bevelled edge strip along +X, following the clipped point
  slab(
    [
      [0.074, 0.56, "sharp"],
      [0.1, 0.56, "sharp"],
      [0.1, 1.1, "sharp"],
      [0.085, 1.23, "sharp"],
      [0.03, 1.35, "sharp"],
      [0.04, 1.28, "sharp"],
      [0.066, 1.2, "sharp"],
      [0.074, 1.1, "sharp"],
    ],
    P.steelEdge,
    0.042,
    { bevel: 0.006 },
  );

  // thick spine bar at -X
  slab(
    [
      [-0.09, 0.575, "sharp"],
      [-0.06, 0.575, "sharp"],
      [-0.06, 1.215, "sharp"],
      [-0.09, 1.19, "sharp"],
    ],
    P.steelDark,
    0.05,
    { bevel: 0.006 },
  );

  // ---- spine: gold inlay with dark outline lines, gold strip on the outer face ----------------------------
  for (const s of SIDES) {
    b.part(new THREE.BoxGeometry(0.005, 0.57, 0.001), P.gold, { at: [-0.075, 0.885, s * 0.025] });
    for (const x of [-0.0805, -0.0695])
      b.part(new THREE.BoxGeometry(0.002, 0.57, 0.001), P.ink, { at: [x, 0.885, s * 0.025] });
    // little gold dots at the ends of the inlay
    b.part(new THREE.SphereGeometry(0.004, 6, 4), P.gold, { at: [-0.075, 0.6, s * 0.025] });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), P.gold, { at: [-0.075, 1.18, s * 0.025] });
  }
  b.part(new THREE.BoxGeometry(0.0012, 0.58, 0.012), P.gold, { at: [-0.0897, 0.89, 0] });

  // ---- notch and point trim -------------------------------------------------------------------------------
  for (const s of SIDES) {
    seg(-0.062, 1.222, -0.049, 1.238, 0.004, 0.02, s, P.gold);
    seg(-0.0495, 1.24, -0.0495, 1.283, 0.004, 0.02, s, P.gold);
    seg(-0.04, 1.283, 0.027, 1.337, 0.003, 0.021, s, P.steelEdge);
    seg(-0.0415, 1.278, 0.0245, 1.331, 0.0015, 0.0213, s, P.ink, 0.0008);
    // ink line separating edge strip from the flat
    seg(0.0745, 0.78, 0.0745, 1.09, 0.0016, 0.021, s, P.ink, 0.0008);
    seg(0.0745, 1.09, 0.066, 1.2, 0.0016, 0.021, s, P.ink, 0.0008);
    seg(0.066, 1.2, 0.04, 1.28, 0.0016, 0.021, s, P.ink, 0.0008);
  }

  // ---- fuller outline and glowing runes -------------------------------------------------------------------
  const FL = 0.011; // groove floor height
  const templates: number[][][] = [
    [[0, -1, 0, 1], [-1, 0.4, 0, 0], [1, 0.4, 0, 0]],
    [[-0.8, -1, -0.8, 1], [0.8, -1, 0.8, 1], [-0.8, 0, 0.8, 0]],
    [[0, 1, 1, 0], [1, 0, 0, -1], [0, -1, -1, 0], [-1, 0, 0, 1]],
    [[-1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, -1], [-1, -1, 1, -1]],
    [[-1, 1, 1, 1], [0, 1, 0, -1], [-1, -0.2, 1, -0.2]],
    [[-1, 1, 1, -1], [1, 1, -1, -1], [-1, 0, 1, 0]],
  ];
  for (const s of SIDES) {
    seg(-0.0188, 0.77, -0.0188, 1.15, 0.002, FL, s, P.ink, 0.001);
    seg(0.0438, 0.77, 0.0438, 1.19, 0.002, FL, s, P.ink, 0.001);
    seg(-0.0195, 1.16, 0.0445, 1.2, 0.002, FL, s, P.ink, 0.001);
    glow(b.part(new THREE.BoxGeometry(0.002, 0.34, 0.0014), P.runeCyan, { at: [-0.0115, 0.96, s * (FL + 0.0007)] }), 1.2);
    glow(b.part(new THREE.BoxGeometry(0.002, 0.36, 0.0014), P.runeCyan, { at: [0.0365, 0.97, s * (FL + 0.0007)] }), 1.2);
    for (let i = 0; i < 7; i++) {
      const yc = 0.83 + i * 0.047;
      for (const [u1, v1, u2, v2] of templates[i % templates.length]) {
        const p = seg(X0 + u1 * 0.0105, yc + v1 * 0.015, X0 + u2 * 0.0105, yc + v2 * 0.015, 0.0028, FL, s, P.runeCyan, 0.0014);
        glow(p, 1.5);
      }
    }
    // glowing diamond at the head of the fuller
    glow(
      b.part(new THREE.OctahedronGeometry(0.01, 0), P.runeCyan, {
        at: [X0, 1.14, s * FL],
        scale: [0.8, 1.3, 0.35],
      }),
      1.8,
    );
  }

  // ---- gold lion emblem plate at the root -----------------------------------------------------------------
  const CY = 0.715;
  const shield: Pt[] = [
    [-0.056, 0.052, "sharp"],
    [-0.02, 0.046, "sharp"],
    [0, 0.056, "sharp"],
    [0.02, 0.046, "sharp"],
    [0.056, 0.052, "sharp"],
    [0.056, 0, "sharp"],
    [0.03, -0.035, "sharp"],
    [0, -0.056, "sharp"],
    [-0.03, -0.035, "sharp"],
    [-0.056, 0, "sharp"],
  ];
  const shieldIn: Pt[] = shield.map(([x, y]) => [x * 0.82, y * 0.82, "sharp"] as Pt);
  const star: Pt[] = Array.from({ length: 24 }, (_, k) => {
    const r = k % 2 === 0 ? 0.03 : 0.021;
    const a = (k * 15 * Math.PI) / 180;
    return [Math.sin(a) * r, Math.cos(a) * r, "sharp"] as Pt;
  });
  const nose: Pt[] = [
    [-0.004, 0.0015, "sharp"],
    [0.004, 0.0015, "sharp"],
    [0, -0.0035, "sharp"],
  ];

  for (const s of SIDES) {
    const layer = (o: Pt[], color: string, zb: number, t: number, dx = 0, dy = 0) =>
      slab(o, color, t, { at: [X0 + dx, CY + dy, s * (zb + t / 2)], s });
    const bx = (w: number, h: number, color: string, zb: number, t: number, dx: number, dy: number, rot = 0) =>
      b.part(new THREE.BoxGeometry(w, h, t), color, {
        at: [X0 + dx, CY + dy, s * (zb + t / 2)],
        rotation: [0, 0, rot],
      });

    layer(shield, P.goldDark, 0, 0.042 / 2, 0, 0); // placeholder replaced below
  }
  // (the placeholder above is overwritten by the real stack: build it properly)
  for (const s of SIDES) {
    const centre = (zb: number, t: number): [number, number, number] => [X0, CY, s * (zb + t / 2)];
    slab(shield, P.goldDark, 0.042, { at: [X0, CY, 0], s });
    slab(shieldIn, P.gold, 0.044, { at: [X0, CY, 0], s, bevel: 0.003 });

    // mane, face disc, ears
    slab(star, P.goldDark, 0.0012, { at: centre(0.022, 0.0012), s });
    slab(polygon(0.019, 10, 1, 1, Math.PI / 10), P.gold, 0.001, { at: centre(0.0232, 0.001), s });
    for (const ex of [-1, 1])
      slab(polygon(0.006, 6), P.gold, 0.001, { at: [X0 + ex * 0.016, CY + 0.019, s * (0.0232 + 0.0005)], s });
    // muzzle
    slab(polygon(1, 8, 0.009, 0.0065), LIGHT_GOLD, 0.0008, { at: [X0, CY - 0.007, s * (0.0242 + 0.0004)], s });
    // eyes and brows
    for (const ex of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.008, 0.0025, 0.0008), P.ink, {
        at: [X0 + ex * 0.0075, CY + 0.004, s * (0.0242 + 0.0004)],
        rotation: [0, 0, -ex * 18],
      });
      b.part(new THREE.BoxGeometry(0.011, 0.002, 0.0008), P.ink, {
        at: [X0 + ex * 0.008, CY + 0.0105, s * (0.0242 + 0.0004)],
        rotation: [0, 0, -ex * 14],
      });
    }
    // nose and mouth
    slab(nose, P.ink, 0.0006, { at: [X0, CY - 0.004, s * (0.025 + 0.0003)], s });
    b.part(new THREE.BoxGeometry(0.0015, 0.005, 0.0006), P.ink, { at: [X0, CY - 0.0105, s * (0.025 + 0.0003)] });
    for (const ex of [-1, 1])
      b.part(new THREE.BoxGeometry(0.0075, 0.0015, 0.0006), P.ink, {
        at: [X0 + ex * 0.0037, CY - 0.0132, s * (0.025 + 0.0003)],
        rotation: [0, 0, ex * 20],
      });
    // studs on the plate corners
    for (const ex of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.0035, 6, 4), P.brass, { at: [X0 + ex * 0.04, CY + 0.036, s * 0.0225] });
    }
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), P.brass, { at: [X0, CY - 0.043, s * 0.0225] });
  }
}
    return buildBlade;
  })(),
  // guard
  (() => {
function buildGuard({ b, J, P, M }: Ctx) {
  const gy = M.guardCenter[1]; // 0.56
  const CX = 0.005; // centre of the blade/block line
  const R = rng(11);

  const BLUE = P.leather;
  const GOLD = P.gold;
  const GOLD_D = P.goldDark;

  // placement helper: geometry at a model-space point, optional orientation
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], opts: any = {}) =>
    b.part(geo, color, { at, ...opts });
  const sph = (r: number, sx = 1, sy = 1, sz = 1) => {
    const g = new THREE.SphereGeometry(r, 8, 6);
    g.scale(sx, sy, sz);
    return g;
  };

  // ---------------------------------------------------------------- central block
  put(new THREE.BoxGeometry(0.15, 0.09, 0.08), GOLD, [CX, 0.565, 0]);
  // darker end plates, top and bottom of the block
  put(new THREE.BoxGeometry(0.156, 0.009, 0.082), GOLD_D, [CX, 0.5245, 0]);
  put(new THREE.BoxGeometry(0.156, 0.009, 0.082), GOLD_D, [CX, 0.6055, 0]);
  // thin brass trim strips just inside the plates (front and back)
  for (const zs of [1, -1]) {
    put(new THREE.BoxGeometry(0.15, 0.003, 0.003), P.brass, [CX, 0.532, zs * 0.0405]);
    put(new THREE.BoxGeometry(0.15, 0.003, 0.003), P.brass, [CX, 0.598, zs * 0.0405]);
  }

  // ---------------------------------------------------------------- ricasso collar
  put(new THREE.BoxGeometry(0.21, 0.03, 0.062), GOLD, [CX, 0.625, 0]);
  put(new THREE.BoxGeometry(0.216, 0.008, 0.066), GOLD_D, [CX, 0.636, 0]);
  put(new THREE.BoxGeometry(0.216, 0.005, 0.066), GOLD_D, [CX, 0.6125, 0]);
  for (const zs of [1, -1]) {
    for (const x of [-0.07, -0.035, CX, 0.045, 0.08]) {
      put(sph(0.0036), P.brass, [x, 0.6245, zs * 0.0315]);
    }
  }
  // shoulder wedges either side of the blade
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.012, 0.018, 0.05), GOLD_D, [CX + s * 0.111, 0.628, 0]);
  }

  // ---------------------------------------------------------------- sunburst / lion emblem
  const emblem = (zs: number) => {
    const cy = 0.565;
    put(new THREE.CylinderGeometry(0.037, 0.037, 0.007, 12), GOLD_D, [CX, cy, zs * 0.0405], { dir: [0, 0, zs] });
    put(new THREE.CylinderGeometry(0.027, 0.027, 0.004, 12), GOLD, [CX, cy, zs * 0.0435], { dir: [0, 0, zs] });
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const len = i % 2 ? 0.011 : 0.016;
      const rr = 0.025 + len / 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      put(new THREE.ConeGeometry(0.0065, len, 5), i % 2 ? P.brass : GOLD, [CX + dx * rr, cy + dy * rr, zs * 0.0445], {
        dir: [dx, dy, 0],
      });
    }
    return cy;
  };

  // front: the gem at the heart of the sunburst
  {
    const cy = emblem(1);
    put(new THREE.TorusGeometry(0.0225, 0.005, 6, 12), GOLD, [CX, cy, 0.0467]);
    put(new THREE.TorusGeometry(0.0155, 0.0022, 5, 10), GOLD_D, [CX, cy, 0.0475]);
    const gemGeo = new THREE.OctahedronGeometry(0.019);
    gemGeo.scale(1, 1.25, 0.6);
    glow(put(gemGeo, P.gemRed, [CX, cy, 0.0495]), 0.8);
    // facet glint
    put(sph(0.0035, 1, 1.3, 0.6), "#ffd0d4", [CX - 0.006, cy + 0.008, 0.0535]);
  }

  // back: a lion head relief in the sunburst
  {
    const cy = emblem(-1);
    const z = -0.0475;
    put(sph(1, 0.017, 0.019, 0.007), P.brass, [CX, cy, z]); // face
    for (const s of [1, -1]) {
      put(sph(0.006, 1, 1, 0.7), P.brass, [CX + s * 0.015, cy + 0.017, z]); // ears
      put(sph(0.0028, 1, 1, 0.7), P.goldDark, [CX + s * 0.015, cy + 0.017, z - 0.003]);
      put(sph(0.003), P.ink, [CX + s * 0.0065, cy + 0.003, -0.0535]); // eyes
      put(sph(0.0013), "#ffffff", [CX + s * 0.0058, cy + 0.0042, -0.0562]);
    }
    put(new THREE.BoxGeometry(0.026, 0.004, 0.004), GOLD_D, [CX, cy + 0.0075, -0.0505]); // brow
    put(sph(1, 0.011, 0.008, 0.006), GOLD, [CX, cy - 0.006, -0.0525]); // muzzle
    put(sph(1, 0.0045, 0.003, 0.002), P.ink, [CX, cy - 0.0025, -0.0583]); // nose
    put(new THREE.BoxGeometry(0.0018, 0.006, 0.002), P.ink, [CX, cy - 0.0085, -0.0585]); // mouth line
    put(new THREE.BoxGeometry(0.01, 0.0018, 0.002), P.ink, [CX, cy - 0.0115, -0.0585], { rotation: [0, 0, 8] });
  }

  // corner studs
  for (const zs of [1, -1])
    for (const [x, y] of [
      [-0.055, 0.537],
      [0.065, 0.537],
      [-0.055, 0.593],
      [0.065, 0.593],
    ]) {
      put(sph(0.0058), P.brass, [x, y, zs * 0.0405]);
    }

  // ---------------------------------------------------------------- wings
  // outline u runs outward from the wing root, v is height above the guard centre line
  const outerL: any[] = [
    [0, -0.05],
    [0.06, -0.055],
    [0.095, -0.03],
    [0.12, 0.02],
    [0.112, 0.075, "sharp"],
    [0.083, 0.035],
    [0.05, 0.01],
    [0, 0.03],
  ];
  const underL: any[] = [
    [0, -0.05],
    [0.06, -0.055],
    [0.095, -0.03],
    [0.12, 0.02],
    [0.113, 0.034],
    [0.092, -0.008],
    [0.06, -0.034],
    [0, -0.028],
  ];
  const innerL: any[] = [
    [0.02, -0.03],
    [0.07, -0.035],
    [0.095, -0.018],
    [0.108, 0.015],
    [0.098, 0.035],
    [0.075, 0.02],
    [0.05, 0.0],
    [0.02, 0.012],
  ];
  const outerR: any[] = [
    [0, -0.045],
    [0.05, -0.05],
    [0.08, -0.028],
    [0.1, 0.015],
    [0.092, 0.058, "sharp"],
    [0.068, 0.03],
    [0.04, 0.01],
    [0, 0.025],
  ];
  const underR: any[] = [
    [0, -0.045],
    [0.05, -0.05],
    [0.08, -0.028],
    [0.1, 0.015],
    [0.094, 0.028],
    [0.076, -0.008],
    [0.05, -0.032],
    [0, -0.025],
  ];
  const innerR: any[] = innerL.map(([u, v]) => [u * 0.83, v * 0.8]);

  const wingRoot = 0.05;
  for (const s of [1, -1]) {
    const L = s === 1;
    const at = [s * wingRoot, gy, 0];
    b.extrude(L ? underL : underR, { at, x: [s, 0, 0], thickness: 0.054, color: GOLD_D, smoothing: 1 });
    b.extrude(L ? outerL : outerR, { at, x: [s, 0, 0], thickness: 0.05, color: GOLD, smoothing: 1 });
    for (const zs of [1, -1]) {
      b.extrude(L ? innerL : innerR, {
        at: [s * wingRoot, gy, zs * 0.0265],
        x: [s, 0, 0],
        thickness: 0.004,
        color: GOLD_D,
      });
    }
    // studs and a cyan bead on each face of the wing
    const k = L ? 1 : 0.83;
    for (const zs of [1, -1]) {
      const wx = (u: number) => s * (wingRoot + u * k);
      put(sph(0.0048), GOLD, [wx(0.035), gy - 0.012 * (L ? 1 : 0.8), zs * 0.0285]);
      put(sph(0.0048), GOLD, [wx(0.062), gy - 0.018 * (L ? 1 : 0.8), zs * 0.0285]);
      const bead = new THREE.OctahedronGeometry(0.006);
      bead.scale(1, 1.2, 0.7);
      glow(put(bead, P.runeCyan, [wx(0.088), gy + 0.003, zs * 0.0292]), 1.2);
    }
    // tip cap: a small gold ball on the sharp tip
    const tipU = L ? 0.112 : 0.092;
    const tipV = L ? 0.075 : 0.058;
    put(sph(0.0045), GOLD, [s * (wingRoot + tipU), gy + tipV - 0.002, 0]);
  }

  // ---------------------------------------------------------------- blue cloth ribbons tied at the wing bases
  for (const s of [1, -1]) {
    const x = s * 0.1;
    put(new THREE.BoxGeometry(0.016, 0.068, 0.058), BLUE, [x, 0.544, 0]);
    put(new THREE.BoxGeometry(0.0175, 0.004, 0.06), GOLD, [x, 0.513, 0]);
    put(new THREE.BoxGeometry(0.0175, 0.004, 0.06), GOLD, [x, 0.575, 0]);
    for (const zs of [1, -1]) {
      // knot
      const knot = new THREE.OctahedronGeometry(0.0095);
      knot.scale(1, 1, 0.8);
      put(knot, BLUE, [x, 0.55, zs * 0.0325]);
      put(sph(0.0048), GOLD, [x, 0.5505, zs * 0.0395]);
      // two swallow-tail ribbons
      for (const t of [1, -1]) {
        const a = (t * 16 * Math.PI) / 180;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        const tail: any[] = [
          [-0.0085, 0],
          [-0.0105, -0.052, "sharp"],
          [0, -0.04, "sharp"],
          [0.0105, -0.052, "sharp"],
          [0.0085, 0],
        ];
        b.extrude(tail, {
          at: [x + t * 0.004, 0.545, zs * (0.0345 + (t > 0 ? 0 : 0.0015))],
          x: [c, sn, 0],
          y: [-sn, c, 0],
          thickness: 0.004,
          color: BLUE,
        });
        // gold hem at the ribbon tip
        put(new THREE.BoxGeometry(0.012, 0.0025, 0.0045), GOLD, [x + t * 0.004 + sn * -0.045 * -1 * 0 + t * 0.0105, 0.5, zs * (0.0345 + (t > 0 ? 0 : 0.0015))], {
          rotation: [0, 0, t * 16],
        });
      }
    }
  }

  // ---------------------------------------------------------------- jewelled bosses at the underside centre
  for (const zs of [1, -1]) {
    const g = new THREE.OctahedronGeometry(0.005);
    glow(put(g, P.runeCyan, [CX + 0.057, 0.563, zs * 0.0415]), 1.1);
    glow(put(g.clone(), P.runeCyan, [CX - 0.057, 0.563, zs * 0.0415]), 1.1);
  }
  void R;
  void J;
}
    return buildGuard;
  })(),
  // mechanism
  (() => {
function buildMechanism({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const CX = 0.0; // chamber / barrel axis (x)
  const FZ = [1, -1];

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot, flat: true });

  // cylinder with its axis along +Y (default) or along Z (axis "z")
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: string,
    at: [number, number, number],
    axis: "y" | "z" = "y",
  ) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, {
      at,
      dir: axis === "z" ? [0, 0, 1] : undefined,
      flat: true,
    });

  const ball = (r: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at, flat: true });

  // a screw head seated on a +Z / -Z face, with a slot
  const screw = (x: number, y: number, zFace: number, side: number, slotDeg: number) => {
    const z = zFace * side;
    cyl(0.0055, 0.0055, 0.004, 8, P.gold, [x, y, z + side * 0.0005], "z");
    b.part(new THREE.BoxGeometry(0.0085, 0.0016, 0.0014), P.ink, {
      at: [x, y, z + side * 0.0028],
      rotation: [0, 0, slotDeg],
    });
  };

  // ======================================================
  // LOWER FRAME BLOCK (y 0.338 - 0.40), meets the grip
  // ======================================================
  box(0.12, 0.062, 0.09, P.gunmetal, [0.005, 0.369, 0]);
  // gold collar where it meets the grip
  box(0.126, 0.008, 0.096, P.gold, [0.005, 0.342, 0]);
  box(0.126, 0.003, 0.096, P.goldDark, [0.005, 0.3485, 0]);
  // ledge under the cylinder
  box(0.112, 0.008, 0.082, P.gunmetalLight, [0.005, 0.400, 0]);
  // gold vertical corner trim
  for (const sx of [1, -1])
    for (const sz of FZ) {
      box(0.006, 0.05, 0.006, P.gold, [0.005 + sx * 0.0585, 0.372, sz * 0.0435]);
    }
  // dark recess lines at the top of the block
  for (const sz of FZ) box(0.1, 0.0025, 0.0016, P.ink, [0.005, 0.392, sz * 0.0455]);

  // screws
  for (const sz of FZ) {
    screw(0.04, 0.365, 0.045, sz, 35);
    screw(-0.03, 0.365, 0.045, sz, -50);
  }

  // cyan core lines on the block faces
  for (const sz of FZ) {
    glow(box(0.07, 0.004, 0.002, P.runeCyan, [0.005, 0.381, sz * 0.0452]), 1.4);
    for (const x of [-0.025, 0.005, 0.035])
      glow(box(0.004, 0.022, 0.002, P.runeCyan, [x, 0.36, sz * 0.0452]), 1.4);
  }

  // ======================================================
  // FRAME POSTS around the cylinder
  // ======================================================
  // front post (edge side, +X): solid
  box(0.016, 0.1, 0.07, P.gunmetalLight, [0.058, 0.455, 0]);
  box(0.004, 0.1, 0.07, P.gold, [0.0655, 0.455, 0]);
  // rear plates (spine side, -X) leaving a slot for the hammer
  for (const sz of FZ) {
    box(0.016, 0.1, 0.012, P.gunmetalLight, [-0.052, 0.455, sz * 0.032]);
    box(0.004, 0.1, 0.012, P.gold, [-0.0595, 0.455, sz * 0.032]);
  }
  // rivets on posts
  for (const sz of FZ) {
    ball(0.0032, P.gold, [0.058, 0.425, sz * 0.0355]);
    ball(0.0032, P.gold, [0.058, 0.485, sz * 0.0355]);
    ball(0.0032, P.gold, [-0.052, 0.425, sz * 0.0385]);
    ball(0.0032, P.gold, [-0.052, 0.485, sz * 0.0385]);
  }

  // ======================================================
  // SIX CHAMBER CYLINDER (axis +Y, y 0.40 - 0.482)
  // ======================================================
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.082, 12), P.gunmetalLight, { at: [CX, 0.441, 0], flat: true });
  // gold bands top and bottom
  b.part(new THREE.CylinderGeometry(0.0418, 0.0418, 0.007, 12), P.gold, { at: [CX, 0.4045, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.0418, 0.0418, 0.007, 12), P.gold, { at: [CX, 0.4785, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.0418, 0.0418, 0.002, 12), P.goldDark, { at: [CX, 0.4, 0], flat: true });
  // cyan glowing ring around the middle
  glow(
    b.part(new THREE.TorusGeometry(0.0408, 0.0022, 4, 12), P.runeCyan, {
      at: [CX, 0.441, 0],
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    }),
    1.5,
  );
  // flutes + brass bullets, one pair per chamber
  for (let k = 0; k < 6; k++) {
    const a = k * 60;
    const ar = (a * Math.PI) / 180;
    const s = Math.sin(ar);
    const c = Math.cos(ar);
    // flutes above and below the glow ring
    for (const [y, h] of [
      [0.4625, 0.026],
      [0.4195, 0.026],
    ] as const) {
      b.part(new THREE.BoxGeometry(0.013, h, 0.004), P.ink, {
        at: [CX + s * 0.0398, y, c * 0.0398],
        rotation: [0, a, 0],
        flat: true,
      });
    }
    // bullet casing + tip peeking out of the top
    const bx = CX + s * 0.027;
    const bz = c * 0.027;
    cyl(0.0088, 0.0088, 0.014, 8, P.brass, [bx, 0.489, bz]);
    b.part(new THREE.ConeGeometry(0.0088, 0.014, 8), P.gold, { at: [bx, 0.5, bz], flat: true });
    cyl(0.0094, 0.0094, 0.002, 8, P.goldDark, [bx, 0.4825, bz]);
    // small cyan lamp dot between chambers on the top ring
    const a2 = ((a + 30) * Math.PI) / 180;
    glow(cyl(0.0035, 0.0035, 0.002, 6, P.runeCyan, [CX + Math.sin(a2) * 0.032, 0.4835, Math.cos(a2) * 0.032]), 1.4);
  }
  // centre ejector rod
  cyl(0.008, 0.008, 0.026, 8, P.gold, [CX, 0.494, 0]);
  cyl(0.0105, 0.0105, 0.004, 8, P.goldDark, [CX, 0.483, 0]);

  // ======================================================
  // TOP YOKE + SHORT BARREL (to y 0.56)
  // ======================================================
  box(0.12, 0.026, 0.08, P.gunmetal, [0.005, 0.519, 0]);
  box(0.128, 0.004, 0.086, P.gold, [0.005, 0.5085, 0]);
  box(0.09, 0.008, 0.06, P.gunmetalLight, [0.005, 0.536, 0]);
  for (const sz of FZ) {
    // cyan strip and gold edge trim on yoke faces
    glow(box(0.085, 0.004, 0.002, P.runeCyan, [0.005, 0.519, sz * 0.0405]), 1.5);
    box(0.12, 0.003, 0.003, P.gold, [0.005, 0.5315, sz * 0.0405]);
    for (const x of [-0.045, 0.055]) ball(0.0034, P.gold, [x, 0.519, sz * 0.0408]);
  }

  // barrel
  b.part(new THREE.CylinderGeometry(0.0215, 0.0235, 0.027, 10), P.gunmetalLight, { at: [CX, 0.5465, 0], flat: true });
  // muzzle ring + bore
  b.part(new THREE.CylinderGeometry(0.0255, 0.0255, 0.008, 10), P.gold, { at: [CX, 0.5535, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.0255, 0.0255, 0.0015, 10), P.goldDark, { at: [CX, 0.5495, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.0016, 10), P.ink, { at: [CX, 0.5582, 0], flat: true });
  // barrel side ribs
  for (const sz of FZ) {
    box(0.012, 0.022, 0.006, P.gunmetal, [CX, 0.544, sz * 0.027]);
    glow(box(0.003, 0.016, 0.0016, P.runeCyan, [CX, 0.544, sz * 0.0305]), 1.4);
  }
  // front sight on the spine side of the muzzle
  box(0.006, 0.012, 0.004, P.gold, [-0.0285, 0.55, 0]);
  box(0.01, 0.003, 0.007, P.goldDark, [-0.0285, 0.5435, 0]);

  // rear sight: notched block on the yoke at the spine side
  box(0.012, 0.004, 0.026, P.gunmetalLight, [-0.049, 0.5405, 0]);
  for (const sz of FZ) box(0.01, 0.012, 0.007, P.gunmetal, [-0.049, 0.548, sz * 0.0095]);
  box(0.004, 0.003, 0.004, P.gemRed, [-0.049, 0.5445, 0]);

  // ======================================================
  // HAMMER on the spine side, pivoting between the rear plates
  // ======================================================
  const px = -0.046;
  const py = 0.455;
  const hammerOutline: [number, number, "sharp"?][] = [
    [0.014, -0.05],
    [0.014, 0.0],
    [0.004, 0.018],
    [-0.008, 0.026, "sharp"],
    [-0.016, 0.016, "sharp"],
    [-0.01, 0.008],
    [-0.008, -0.012],
    [-0.004, -0.03],
    [-0.002, -0.05],
  ];
  b.extrude(hammerOutline as any, {
    at: [px, py, 0],
    x: [1, 0, 0],
    thickness: 0.014,
    bevel: 0.002,
    color: P.steelDark,
  });
  // serrations on the spur
  for (let i = 0; i < 3; i++) box(0.012, 0.0014, 0.0155, P.ink, [px - 0.0105, py + 0.012 + i * 0.0045, 0], [0, 0, -20]);
  // pivot pin through the plates
  cyl(0.0045, 0.0045, 0.086, 8, P.gold, [px, py, 0], "z");
  for (const sz of FZ) cyl(0.0068, 0.0068, 0.004, 8, P.gold, [px, py, sz * 0.0415], "z");

  // ======================================================
  // TRIGGER GUARD LOOP + TRIGGER, +Z side of the edge
  // ======================================================
  const tgx = 0.058;
  b.sweep(
    [
      [tgx, 0.466, 0.028],
      [tgx, 0.46, 0.05],
      [tgx, 0.432, 0.06],
      [tgx, 0.395, 0.0585],
      [tgx, 0.372, 0.05],
      [tgx, 0.362, 0.04],
    ],
    0.0052,
    { color: P.gold, sides: 6, caps: "round" },
  );
  // gunmetal inner liner line along the loop
  b.sweep(
    [
      [tgx + 0.003, 0.455, 0.052],
      [tgx + 0.003, 0.432, 0.0612],
      [tgx + 0.003, 0.396, 0.0600],
      [tgx + 0.003, 0.376, 0.052],
    ],
    0.0016,
    { color: P.goldDark, sides: 4, caps: "none" },
  );
  // trigger
  b.extrude(
    [
      [0, 0],
      [0.012, 0],
      [0.016, -0.02],
      [0.022, -0.04],
      [0.014, -0.04],
      [0.006, -0.022],
      [0, -0.012],
    ],
    {
      at: [tgx, 0.452, 0.03],
      x: [0, 0, 1],
      thickness: 0.008,
      bevel: 0.0015,
      color: P.steelDark,
    },
  );
  ball(0.0042, P.gold, [tgx, 0.449, 0.033]);
  // guard stud rivets where the loop meets the frame
  ball(0.0035, P.goldDark, [tgx, 0.466, 0.03]);
  ball(0.0035, P.goldDark, [tgx, 0.363, 0.043]);

  // ======================================================
  // small extra detail: cyan core slit up the spine edge, gold side screws
  // ======================================================
  glow(box(0.003, 0.05, 0.022, P.runeCyan, [-0.0605, 0.455, 0]), 1.3);
  for (const sz of FZ) {
    // little gold lion-paw stud pair on top of the front post face
    ball(0.0045, P.gold, [0.0672, 0.43, sz * 0.02]);
    ball(0.0045, P.gold, [0.0672, 0.48, sz * 0.02]);
  }
  // tiny jitter rivets along the collar so it reads handmade
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = 0.005 + Math.cos(a) * 0.052;
    const z = Math.sin(a) * 0.0415;
    if (Math.abs(x - 0.005) > 0.058 || Math.abs(z) > 0.047) continue;
    ball(0.0028 + rand() * 0.0004, P.goldDark, [x, 0.3445, z]);
  }
}
    return buildMechanism;
  })(),
  // hilt
  (() => {
function buildHilt({ b, J, P, M }: Ctx) {
  const GOLD = P.gold;
  const GOLD_D = P.goldDark;
  const GOLD_HI = "#f6d77a";
  const CLOTH = P.cloth;
  const CLOTH_D = "#7e1220";
  const CRYSTAL = P.runeCyan;
  const CRYSTAL_HI = "#bffcff";
  const INK = P.ink;

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);

  // ---------------------------------------------------------------- pommel (faceted gold, tip on the floor)
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.04, 0.018, "sharp"],
      [0.044, 0.04, "sharp"],
      [0.038, 0.058, "sharp"],
      [0.026, 0.067, "sharp"],
      [0, 0.067],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 8, color: GOLD },
  );
  // dark gold belt round the widest facets
  b.part(cyl(0.0455, 0.0455, 0.0035, 8), GOLD_D, { at: [0, 0.04, 0] });
  // lower studs (skipping the front/back where the lion sits)
  for (const k of [1, 2, 3, 5, 6, 7]) {
    const a = (k * Math.PI) / 4;
    b.part(sph(0.003, 6, 4), GOLD_HI, { at: [Math.sin(a) * 0.0425, 0.027, Math.cos(a) * 0.0425] });
  }

  // ---------------------------------------------------------------- lion emblem
  const lion = (cx: number, cy: number, zf: number) => {
    const z = (d: number) => zf * d;
    b.part(cyl(0.021, 0.021, 0.006, 10), INK, { at: [cx, cy, z(0.0425)], dir: [0, 0, 1] });
    b.part(new THREE.TorusGeometry(0.0205, 0.0025, 5, 12), GOLD, { at: [cx, cy, z(0.0455)] });
    b.part(cyl(0.0105, 0.0105, 0.003, 8), GOLD_D, { at: [cx, cy, z(0.0465)], dir: [0, 0, 1] });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      b.part(new THREE.ConeGeometry(0.0036, 0.009, 4), i % 2 ? GOLD : GOLD_HI, {
        at: [cx + dx * 0.0125, cy + dy * 0.0125, z(0.0475)],
        dir: [dx, dy, 0],
      });
    }
    b.part(sph(0.0085), GOLD_HI, { at: [cx, cy, z(0.0485)], scale: [1, 1, 0.55] });
    for (const s of [1, -1]) {
      b.part(sph(0.003, 6, 4), GOLD, { at: [cx + s * 0.0065, cy + 0.0075, z(0.0485)] });
      b.part(sph(0.0013, 5, 4), INK, { at: [cx + s * 0.003, cy + 0.0018, z(0.0522)] });
      b.part(sph(0.0035, 6, 4), "#fff1c4", { at: [cx + s * 0.0018, cy - 0.0036, z(0.0508)], scale: [1, 1, 0.6] });
    }
    b.part(sph(0.0019, 5, 4), INK, { at: [cx, cy - 0.0016, z(0.0535)], scale: [1.2, 0.8, 0.7] });
  };
  lion(0, 0.042, 1);
  lion(0, 0.042, -1);

  // ---------------------------------------------------------------- crystal cap collar
  glow(
    b.part(new THREE.OctahedronGeometry(0.03), CRYSTAL, { at: [0, 0.083, 0], scale: [1, 1.15, 0.9] }),
    1.4,
  );
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    glow(
      b.part(new THREE.OctahedronGeometry(0.009), CRYSTAL_HI, {
        at: [Math.sin(a) * 0.034, 0.081, Math.cos(a) * 0.034],
        scale: [1, 1.6, 1],
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------- bottom ferrule
  b.lathe(
    [
      [0, 0.098],
      [0.036, 0.098],
      [0.036, 0.105, "sharp"],
      [0.03, 0.116, "sharp"],
      [0, 0.116],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: GOLD },
  );
  b.part(cyl(0.0375, 0.0375, 0.003, 10), GOLD_D, { at: [0, 0.1, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(sph(0.0026, 5, 4), GOLD_HI, { at: [Math.cos(a) * 0.0365, 0.1045, Math.sin(a) * 0.0365] });
  }

  // ---------------------------------------------------------------- grip with diagonal wraps
  b.part(cyl(0.0295, 0.0295, 0.215, 10), P.leatherDark, { at: [0, 0.2185, 0] });
  const y0 = 0.115;
  const turns = 5;
  const pitch = 0.21 / turns;
  for (const k of [0, 1]) {
    const a = k * Math.PI;
    const from = [Math.cos(a) * 0.0305, y0, Math.sin(a) * 0.0305];
    b.sweep(spiral([0, y0, 0], from, [0, 1, 0], { turns, pitch }), 0.0046, {
      color: P.leather,
      sides: 5,
    });
  }
  for (const k of [0, 1]) {
    const a = Math.PI / 2 + k * Math.PI;
    const from = [Math.cos(a) * 0.0315, y0, Math.sin(a) * 0.0315];
    b.sweep(spiral([0, y0, 0], from, [0, 1, 0], { turns, pitch }), 0.0016, {
      color: GOLD,
      sides: 4,
    });
  }

  // ---------------------------------------------------------------- top ferrule (meets the mechanism at 0.34)
  b.lathe(
    [
      [0, 0.32],
      [0.031, 0.32],
      [0.031, 0.326, "sharp"],
      [0.044, 0.334, "sharp"],
      [0.044, 0.34, "sharp"],
      [0, 0.34],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: GOLD },
  );
  b.part(cyl(0.0325, 0.0325, 0.0035, 10), GOLD_D, { at: [0, 0.3235, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(sph(0.0026, 5, 4), GOLD_HI, { at: [Math.cos(a) * 0.04, 0.3325, Math.sin(a) * 0.04] });
  }

  // ---------------------------------------------------------------- tassel
  const tx = -0.052;
  b.part(sph(0.004, 6, 4), GOLD, { at: [-0.036, 0.058, 0] });
  b.part(new THREE.TorusGeometry(0.008, 0.0019, 5, 10), GOLD, { at: [-0.047, 0.055, 0] });
  b.part(cyl(0.0012, 0.0012, 0.012, 4), CLOTH_D, { at: [tx, 0.044, 0] });
  b.part(sph(0.0065, 8, 6), GOLD, { at: [tx, 0.035, 0] });
  b.part(cyl(0.0012, 0.0012, 0.008, 4), CLOTH_D, { at: [tx, 0.029, 0] });
  b.part(cyl(0.0045, 0.0055, 0.004, 8), GOLD_D, { at: [tx, 0.0255, 0] });
  b.part(sph(0.0075, 8, 6), CLOTH, { at: [tx, 0.0205, 0] });
  b.part(cyl(0.0085, 0.0085, 0.0025, 8), GOLD, { at: [tx, 0.0155, 0] });
  const r = rng(11);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const len = 0.0135 + r() * 0.002;
    b.part(cyl(0.002, 0.0034, len, 4), i % 2 ? CLOTH : CLOTH_D, {
      at: [tx + cx * 0.0068, 0.0145 - len / 2 + 0.0005 + 0.0012 * 0, cz * 0.0068],
      dir: [-cx * 0.12, 1, -cz * 0.12],
    });
  }
}
    return buildHilt;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gunbladeLion" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
