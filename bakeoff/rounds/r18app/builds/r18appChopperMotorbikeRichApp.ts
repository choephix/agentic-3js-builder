// Custom chopper motorbike, Overwatch style: polished sci-fi hardware, clean bold shapes with bevels and panel lines,
// pearl / graphite colour blocking with one strong orange accent, self-lit orange light strips and lenses.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { aim, DEG } from "../../../../src/math";
import { arc, catmull, polyline } from "../../../../src/path";
import { countershade, grain, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "Raked-fork custom chopper with a pearl teardrop tank, orange billet accents, a belt-drive fat rear tyre, drag pipes and glowing light strips.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];
const v3 = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);

// ---------------------------------------------------------------------------------------------------------------
// Palette: pearl + graphite + steel, one orange accent, warm-white and red lights.
const PEARL = "#e9eef4";
const PEARL_SH = "#b9c4d2";
const GRAPH = "#2b3340";
const GRAPH2 = "#181d25";
const GRAPH3 = "#3a4352";
const STEEL = "#b4bfcc";
const STEELD = "#7c8898";
const ORANGE = "#ff8a1a";
const ORANGE_D = "#c9560a";
const RUBBER = "#15181d";
const TREAD = "#1f242c";
const SEAT = "#252b35";
const LAMP = "#fff3d4";
const RED = "#ff3b2a";
const GLASS = "#9fd0e8";

const PEARL_P = countershade(PEARL, PEARL_SH, { level: -0.1, soft: 0.7 });
const CHROME = countershade("#f2f6fb", "#7b8899", { level: 0.05, soft: 0.65 });
const BRUSHED = grain(STEEL, "#8d99a8", { size: 0.01, axis: "z" });
const GRAPH_P = countershade(GRAPH3, GRAPH, { level: 0, soft: 0.6 });

// ---------------------------------------------------------------------------------------------------------------
// Geometry layout (meters). Model faces +Z, left is +X.
const RAKE = 40 * DEG;
const UP: V = [0, Math.cos(RAKE), -Math.sin(RAKE)]; // along the fork, axle -> head
const FRT = 0.32; // front tyre radius
const RRT = 0.34; // rear tyre radius
const FA: V = [0, FRT - 0.004, 1.12]; // front axle
const RA: V = [0, RRT - 0.004, -0.92]; // rear axle
const fpt = (d: number, x = 0): V => [x, FA[1] + UP[1] * d, FA[2] + UP[2] * d];
const HEAD = fpt(0.82);

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const frameJ = b.joint("frame", { at: [0, 0.5, 0] });
  const steer = b.joint("steer", { parent: frameJ, at: HEAD, dir: UP, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: FA, dir: [0, 1, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: RA, dir: [0, 1, 0], role: "hinge" });
  const kick = b.joint("kickstand", {
    parent: frameJ,
    at: [0.18, 0.3, -0.42],
    dir: [0.09, -0.03, -0.22],
    up: [0, 1, 0],
    role: "hinge",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Merged-detail batches: many small static pieces of one colour on one bone become one part.
  const batches = new Map<string, { bone: Joint; color: string; list: THREE.BufferGeometry[] }>();
  function put(bone: Joint, color: string, geo: THREE.BufferGeometry, at: V, dir: V = [0, 1, 0], scale: V = [1, 1, 1]) {
    geo.applyMatrix4(new THREE.Matrix4().compose(v3(at), aim(dir), v3(scale)));
    const key = bone.name + color;
    let g = batches.get(key);
    if (!g) batches.set(key, (g = { bone, color, list: [] }));
    g.list.push(geo);
  }
  /** A hex bolt head sitting on a surface point, facing `dir`. */
  function bolt(bone: Joint, p: V, dir: V, r = 0.008, color = STEELD) {
    const g = new THREE.CylinderGeometry(r, r, r * 0.7, 6);
    g.translate(0, r * 0.25, 0);
    put(bone, color, g, p, dir);
  }
  function flush() {
    for (const g of batches.values()) {
      const merged = mergeGeometries(g.list);
      if (merged) b.part(merged, g.color, { bone: g.bone, at: [0, 0, 0], flat: true });
    }
  }
  const tube = (pts: V[], r: number | number[] | ((t: number) => number), color: string | ReturnType<typeof paint>, bone: Joint, sides = 8) =>
    b.sweep(catmull(pts), r, { color, bone, sides });
  const rod = (a: V, c: V, r: number, color: string | ReturnType<typeof paint>, bone: Joint) =>
    b.rod(a, c, r, color, { bone, sides: 8 });
  const torus = (bone: Joint, at: V, dir: V, R: number, r: number, color: string, segs = 16) =>
    b.part(new THREE.TorusGeometry(R, r, 5, segs), color, { bone, at, dir, axis: "z", flat: true });

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const hexPath = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => `${(cx + r * Math.cos(i * 60 * DEG)).toFixed(1)},${(cy + r * Math.sin(i * 60 * DEG)).toFixed(1)}`).join(" ");
  const hexCells: string[] = [];
  for (let row = 0; row < 7; row++)
    for (let col = 0; col < 7; col++) {
      const cx = 12 + col * 13.5;
      const cy = 12 + row * 15.6 + (col % 2 ? 7.8 : 0);
      hexCells.push(`<polygon points="${hexPath(cx, cy, 6.2)}" fill="${GRAPH2}" stroke="#ffb25a" stroke-width="0.9"/>`);
    }
  const HEX = svg(
    `<svg viewBox="0 0 100 100"><defs><clipPath id="c"><ellipse cx="50" cy="50" rx="47" ry="47"/></clipPath></defs>
     <g clip-path="url(#c)">${hexCells.join("")}</g>
     <circle cx="50" cy="50" r="47" fill="none" stroke="${GRAPH2}" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const tickMarks: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (135 + i * 27) * DEG;
    const x1 = 50 + 38 * Math.cos(a);
    const y1 = 50 + 38 * Math.sin(a);
    const x2 = 50 + 45 * Math.cos(a);
    const y2 = 50 + 45 * Math.sin(a);
    tickMarks.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i > 7 ? "#ff8a1a" : "#e9eef4"}" stroke-width="3" stroke-linecap="round"/>`);
  }
  const GAUGE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#0e131a"/>
     <circle cx="50" cy="50" r="46" fill="none" stroke="#ff8a1a" stroke-width="2.5"/>${tickMarks.join("")}
     <line x1="50" y1="50" x2="30" y2="72" stroke="#ff8a1a" stroke-width="4" stroke-linecap="round"/>
     <circle cx="50" cy="50" r="6" fill="#e9eef4"/>
     <rect x="34" y="64" width="32" height="13" rx="3" fill="#1a222d" stroke="#ff8a1a" stroke-width="1.2"/>
     <text x="50" y="74.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#ffb25a">076</text></svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 120 60"><rect width="120" height="60" rx="7" fill="#f2f5f9"/>
     <rect x="3.5" y="3.5" width="113" height="53" rx="5" fill="none" stroke="#ff8a1a" stroke-width="3"/>
     <rect x="8" y="9" width="104" height="9" fill="#2b3340"/>
     <text x="60" y="46" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-size="30" font-weight="900" fill="#1c222b">CHP-076</text></svg>`,
    { size: 256 },
  );
  const TANK_ART = svg(
    `<svg viewBox="0 0 260 120">
     <g fill="#ff8a1a">
       <polygon points="6,20 38,20 68,60 38,100 6,100 36,60"/>
       <polygon points="48,20 80,20 110,60 80,100 48,100 78,60"/>
       <polygon points="90,20 122,20 152,60 122,100 90,100 120,60"/>
     </g>
     <text x="136" y="98" font-family="Impact,Arial Black,sans-serif" font-size="100" font-weight="900" font-style="italic" fill="#1c222b" stroke="#1c222b" stroke-width="12" stroke-linejoin="round">76</text>
     <text x="136" y="98" font-family="Impact,Arial Black,sans-serif" font-size="100" font-weight="900" font-style="italic" fill="#ffffff">76</text>
     <rect x="6" y="108" width="248" height="5" fill="#2b3340"/></svg>`,
    { size: 512 },
  );
  const HUD = svg(
    `<svg viewBox="0 0 120 44"><rect width="120" height="44" rx="8" fill="#0e131a"/>
     <rect x="3" y="3" width="114" height="38" rx="6" fill="none" stroke="#ff8a1a" stroke-width="2"/>
     <rect x="10" y="10" width="46" height="8" rx="2" fill="#ff8a1a"/><rect x="10" y="22" width="30" height="5" rx="2" fill="#ffb25a"/>
     <rect x="10" y="31" width="38" height="4" rx="2" fill="#ff8a1a"/>
     <path d="M70 34 L82 12 L94 34 L106 12" stroke="#ffb25a" stroke-width="4" fill="none" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );

  // =============================================================================================================
  // WHEELS
  const rotor = (bone: Joint, c: V, x: number, rO: number, rI: number) => {
    const holes = paint((p) => {
      const dy = p.y - c[1];
      const dz = p.z - c[2];
      const rad = Math.hypot(dy, dz);
      if (rad < rI + 0.03) return GRAPH3;
      const ang = Math.atan2(dz, dy) / DEG;
      const f = ((ang % 14) + 14) % 14;
      const rr = ((rad * 1000) % 15) / 15;
      return f < 6 && rr > 0.2 && rr < 0.8 && rad > rI + 0.045 && rad < rO - 0.012 ? GRAPH2 : STEEL;
    });
    b.lathe(
      [
        [rI, x - 0.0035],
        [rO, x - 0.0035],
        [rO, x + 0.0035],
        [rI, x + 0.0035],
      ],
      { at: c, axis: [1, 0, 0], segments: 32, bone, color: holes },
    );
    b.lathe(
      [
        [0.03, x - 0.006],
        [rI + 0.02, x - 0.006],
        [rI + 0.02, x + 0.006],
        [0.03, x + 0.006],
      ],
      { at: c, axis: [1, 0, 0], segments: 12, bone, color: GRAPH3 },
    );
  };

  function wheel(o: { bone: Joint; c: V; rT: number; tw: number; rR: number; hw: number; spokes: number; spokeW: number; spokeT: number }) {
    const { bone, c, rT, tw, rR, hw, spokes, spokeW, spokeT } = o;
    const rIn = rR - 0.004;
    const th = rT - rIn;
    // Tyre
    const tirePaint = paint((p, n, s) => {
      const rad = Math.hypot(p.y - c[1], p.z - c[2]);
      const dx = Math.abs(p.x - c[0]);
      if (Math.abs(n.x) < 0.6) {
        if (dx < 0.006) return GRAPH2;
        const f = (((s[1] + dx * 240) % 12) + 12) % 12;
        return f < 3.2 ? GRAPH2 : TREAD;
      }
      const k = (rad - rIn) / th;
      if (k > 0.2 && k < 0.27) return ORANGE;
      if (k > 0.3 && k < 0.34) return PEARL;
      if (k > 0.5 && k < 0.7 && ((s[1] % 16) + 16) % 16 < 9) return "#454e5d";
      return RUBBER;
    });
    b.lathe(
      [
        [rIn, -tw * 0.8],
        [rIn + th * 0.3, -tw * 0.98],
        [rIn + th * 0.75, -tw * 0.94],
        [rT - th * 0.06, -tw * 0.62],
        [rT, -tw * 0.34],
        [rT, tw * 0.34],
        [rT - th * 0.06, tw * 0.62],
        [rIn + th * 0.75, tw * 0.94],
        [rIn + th * 0.3, tw * 0.98],
        [rIn, tw * 0.8],
      ],
      { at: c, axis: [1, 0, 0], segments: 36, bone, color: tirePaint, name: "tyre" },
    );
    // Rim barrel, orange anodised lips, black back-plate
    b.lathe(
      [
        [rR - 0.04, -hw],
        [rR + 0.004, -hw],
        [rR + 0.004, hw],
        [rR - 0.04, hw],
      ],
      { at: c, axis: [1, 0, 0], segments: 32, bone, color: CHROME },
    );
    for (const s of [1, -1])
      b.lathe(
        [
          [rR - 0.036, s * hw - 0.006],
          [rR + 0.006, s * hw - 0.006],
          [rR + 0.006, s * hw + 0.006],
          [rR - 0.036, s * hw + 0.006],
        ],
        { at: c, axis: [1, 0, 0], segments: 32, bone, color: ORANGE },
      );
    b.lathe(
      [
        [0.04, -0.008],
        [rR - 0.035, -0.008],
        [rR - 0.035, 0.008],
        [0.04, 0.008],
      ],
      { at: c, axis: [1, 0, 0], segments: 32, bone, color: GRAPH2 },
    );
    // Spokes: blades with an orange inlay down the middle
    const spokePaint = paint((_p, n, s) => (Math.abs(n.x) > 0.7 && Math.abs(s[0]) < spokeW * 0.16 ? ORANGE : GRAPH_P));
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + 0.2;
      b.extrude(
        [
          [-spokeW * 0.45, 0.05],
          [spokeW * 0.45, 0.05],
          [spokeW * 0.7, 0.11],
          [spokeW * 1.0, rR - 0.04],
          [-spokeW * 1.0, rR - 0.04],
          [-spokeW * 0.7, 0.11],
        ],
        {
          at: c,
          x: [0, -Math.sin(a), Math.cos(a)],
          y: [0, Math.cos(a), Math.sin(a)],
          thickness: spokeT,
          bevel: 0.007,
          bone,
          color: spokePaint,
          name: "spoke",
        },
      );
    }
    // Hub with glowing orange caps and an axle
    b.lathe(
      [
        [0, -0.09],
        [0.035, -0.09],
        [0.052, -0.06],
        [0.052, 0.06],
        [0.035, 0.09],
        [0, 0.09],
      ],
      { at: c, axis: [1, 0, 0], segments: 14, bone, color: BRUSHED },
    );
    for (const s of [1, -1]) {
      glow(
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 12), ORANGE, {
          bone,
          at: [c[0] + s * 0.095, c[1], c[2]],
          dir: [1, 0, 0],
          flat: true,
        }),
        1.3,
      );
      // glowing rim ring on both faces
      glow(torus(bone, [c[0] + s * (hw + 0.012), c[1], c[2]], [1, 0, 0], rR - 0.052, 0.0045, ORANGE, 40), 1.4);
    }
    rod([c[0] - 0.2, c[1], c[2]], [c[0] + 0.2, c[1], c[2]], 0.012, BRUSHED, bone);
  }

  wheel({ bone: wheelF, c: FA, rT: FRT, tw: 0.065, rR: 0.245, hw: 0.042, spokes: 6, spokeW: 0.026, spokeT: 0.045 });
  wheel({ bone: wheelR, c: RA, rT: RRT, tw: 0.15, rR: 0.215, hw: 0.085, spokes: 6, spokeW: 0.032, spokeT: 0.06 });
  rotor(wheelF, FA, -0.05, 0.155, 0.085);
  rotor(wheelR, RA, -0.1, 0.165, 0.09);

  // =============================================================================================================
  // FRONT END (all on the steering bone)
  const FORK_X = 0.095;
  for (const s of [1, -1]) {
    const x = s * FORK_X;
    // lower slider, orange lug rings, axle clamp
    rod(fpt(-0.01, x), fpt(0.36, x), 0.029, GRAPH_P, steer);
    torus(steer, fpt(0.3, x), UP, 0.031, 0.006, ORANGE);
    torus(steer, fpt(0.03, x), UP, 0.031, 0.005, ORANGE);
    b.part(new THREE.BoxGeometry(0.05, 0.055, 0.05), GRAPH, { bone: steer, at: fpt(0.0, x), dir: UP, flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 10), ORANGE, { bone: steer, at: fpt(0.0, s * 0.125), dir: [1, 0, 0], flat: true }), 1.2);
    // chrome stanchion
    rod(fpt(0.34, x), fpt(0.99, x), 0.019, CHROME, steer);
    // pleated gaiter
    const pleats: [number, number][] = [[0, 0], [0.026, 0]];
    const len = 0.27;
    const nP = 9;
    for (let i = 0; i < nP; i++) {
      pleats.push([0.034, (i + 0.5) * (len / nP)], [0.025, (i + 1) * (len / nP)]);
    }
    pleats.push([0, len]);
    b.lathe(pleats, { at: fpt(0.36, x), axis: UP, segments: 8, bone: steer, color: RUBBER });
    // caps on stanchion tops
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 8), BRUSHED, { bone: steer, at: fpt(1.0, x), dir: UP, flat: true });
  }
  // fork brace
  rod(fpt(0.4, -FORK_X), fpt(0.4, FORK_X), 0.012, STEEL, steer);
  rod(fpt(0.44, -FORK_X), fpt(0.44, FORK_X), 0.008, STEEL, steer);

  // triple trees
  for (const [d, h] of [
    [0.74, 0.05],
    [0.97, 0.055],
  ] as [number, number][]) {
    b.part(new THREE.BoxGeometry(0.27, h, 0.085), GRAPH_P, { bone: steer, at: fpt(d), dir: UP, flat: true });
    for (const s of [1, -1]) {
      bolt(steer, fpt(d + h / 2, s * 0.1), UP, 0.01, ORANGE);
      bolt(steer, fpt(d + h / 2, s * 0.055), UP, 0.008);
    }
  }
  // head tube and cups
  rod(fpt(0.74), fpt(0.93), 0.038, GRAPH_P, steer);
  torus(steer, fpt(0.755), UP, 0.04, 0.008, ORANGE);
  torus(steer, fpt(0.915), UP, 0.04, 0.008, ORANGE);
  rod(fpt(0.93), fpt(0.97), 0.025, BRUSHED, steer);

  // front fender
  const ffPath = arc([0, FA[1], FA[2]], [0, FA[1] + 0.362 * Math.cos(-38 * DEG), FA[2] + 0.362 * Math.sin(-38 * DEG)], [1, 0, 0], 125);
  const fenderPaintF = paint((p, n) => {
    const rad = Math.hypot(p.y - FA[1], p.z - FA[2]);
    if (Math.abs(n.x) > 0.5) return ORANGE;
    if (rad < 0.362) return GRAPH2;
    if (Math.abs(Math.abs(p.x) - 0.034) < 0.0035) return GRAPH;
    return PEARL_P;
  });
  b.sweep(ffPath, [0.078, 0.011], { section: "box", color: fenderPaintF, bone: steer, name: "fenderF" });
  for (const s of [1, -1]) {
    const e = ffPath.at(0.12);
    rod([s * 0.07, e.y, e.z], fpt(0.4, s * FORK_X), 0.008, STEEL, steer);
    const m = ffPath.at(0.9);
    rod([s * 0.07, m.y, m.z], [s * 0.095, m.y - 0.02, m.z - 0.06], 0.007, STEEL, steer);
  }
  glow(b.part(new THREE.BoxGeometry(0.075, 0.006, 0.02), ORANGE, { bone: steer, at: [0, ffPath.at(0.98).y + 0.012, ffPath.at(0.98).z - 0.01], flat: true }), 1.3);

  // brake caliper (right) and hose
  {
    const cp = fpt(0.14, -0.048);
    b.part(new THREE.BoxGeometry(0.044, 0.075, 0.05), ORANGE, { bone: steer, at: cp, dir: UP, flat: true });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.035), GRAPH, { bone: steer, at: fpt(0.2, -0.048), dir: UP, flat: true });
    for (const dz of [-0.014, 0.014]) bolt(steer, [cp[0] - 0.023, cp[1] + 0.02 + dz * 0.4, cp[2] + dz], [-1, 0, 0], 0.007, GRAPH2);
    tube(
      [
        [-0.31, 1.235, 0.4],
        [-0.2, 1.17, 0.47],
        fpt(0.99, -0.125),
        fpt(0.7, -0.128),
        fpt(0.4, -0.125),
        fpt(0.2, -0.062),
      ],
      0.0055,
      ORANGE,
      steer,
      6,
    );
  }

  // headlight: pearl shell, steel bezel, glowing lens, DRL ring
  {
    const HC: V = [0, 0.82, 0.86];
    b.lathe(
      [
        [0, -0.09],
        [0.05, -0.088],
        [0.085, -0.055],
        [0.096, 0.0],
        [0.095, 0.05],
        [0.098, 0.07],
        [0, 0.07],
      ],
      { at: HC, axis: [0, 0, 1], segments: 16, bone: steer, color: PEARL_P, smoothing: 0 },
    );
    b.lathe(
      [
        [0.078, 0.068],
        [0.104, 0.068],
        [0.104, 0.085],
        [0.078, 0.085],
      ],
      { at: HC, axis: [0, 0, 1], segments: 20, bone: steer, color: BRUSHED },
    );
    glow(b.part(new THREE.CylinderGeometry(0.076, 0.07, 0.014, 18), LAMP, { bone: steer, at: [HC[0], HC[1], HC[2] + 0.08], dir: [0, 0, 1], flat: true }), 1.6);
    glow(torus(steer, [HC[0], HC[1], HC[2] + 0.089], [0, 0, 1], 0.09, 0.0045, ORANGE, 28), 1.4);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), ORANGE, { bone: steer, at: [HC[0], HC[1] + 0.0, HC[2] + 0.095], dir: [0, 0, 1], flat: true });
    for (const s of [1, -1]) {
      rod([s * 0.095, 0.82, 0.72], [s * 0.088, HC[1], HC[2] - 0.02], 0.011, STEEL, steer);
      bolt(steer, [s * 0.097, 0.82, 0.8], [s, 0, 0], 0.009, ORANGE);
      // turn signal pods under the lamp
      const ts: V = [s * 0.14, 0.7, 0.8];
      rod([s * 0.09, 0.74, 0.74], ts, 0.007, STEEL, steer);
      glow(b.part(new THREE.SphereGeometry(0.024, 8, 6), ORANGE, { bone: steer, at: ts, flat: true }), 1.3);
    }
  }

  // handlebars (ape hangers), grips, levers, mirrors
  const barPts = (s: number): V[] => [
    [s * 0.05, 1.075, 0.49],
    [s * 0.07, 1.15, 0.475],
    [s * 0.17, 1.23, 0.45],
    [s * 0.31, 1.255, 0.41],
    [s * 0.39, 1.23, 0.31],
    [s * 0.405, 1.19, 0.2],
  ];
  const throttle = b.joint("throttle", { parent: steer, at: catmull(barPts(-1)).at(0.78), aim: barPts(-1)[5] });
  for (const s of [1, -1]) {
    const path = catmull(barPts(s));
    b.sweep(path.slice(0, 0.8), 0.0125, { color: CHROME, bone: steer, sides: 8 });
    const grip = path.slice(0.78, 1);
    b.sweep(grip, 0.0195, { color: RUBBER, bone: s < 0 ? throttle : steer, sides: 8, caps: { start: "flat", end: "round" } });
    b.sweep(path.slice(0.9, 0.97), 0.0215, { color: GRAPH3, bone: s < 0 ? throttle : steer, sides: 8, caps: "none" });
    // risers clamps
    b.part(new THREE.BoxGeometry(0.05, 0.035, 0.05), GRAPH_P, { bone: steer, at: [s * 0.05, 1.07, 0.485], flat: true });
    bolt(steer, [s * 0.05, 1.09, 0.485], [0, 1, 0], 0.009, ORANGE);
    // perch + lever
    const pc = path.at(0.74);
    b.part(new THREE.BoxGeometry(0.04, 0.034, 0.05), GRAPH, { bone: steer, at: [pc.x, pc.y, pc.z + 0.0], flat: true });
    const lj = b.joint(s > 0 ? "clutchLever" : "brakeLever", {
      parent: steer,
      at: [pc.x, pc.y - 0.015, pc.z - 0.01],
      aim: [s * 0.37, 1.185, 0.24],
      up: [1, 0, 0],
      role: "hinge",
    });
    b.sweep(polyline([[pc.x, pc.y - 0.015, pc.z - 0.01], [s * 0.385, 1.17, 0.265]]), [0.0095, 0.006], { color: ORANGE, bone: lj, sides: 6, caps: { end: "round" } });
    put(lj, ORANGE, new THREE.SphereGeometry(0.0115, 6, 4), [s * 0.385, 1.17, 0.265]);
    // mirror
    const mp = path.at(0.62);
    const mTop: V = [s * 0.31, 1.255 + 0.1, 0.41 - 0.01];
    rod([mp.x, mp.y, mp.z], mTop, 0.007, STEEL, steer);
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.016, 12), GRAPH, { bone: steer, at: [mTop[0], mTop[1] + 0.02, mTop[2] - 0.004], dir: [0, 0.25, -1], flat: true });
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.004, 12), GLASS, { bone: steer, at: [mTop[0], mTop[1] + 0.0225, mTop[2] - 0.012], dir: [0, 0.25, -1], flat: true });
    // cable from lever
    if (s > 0)
      tube([[pc.x, pc.y - 0.02, pc.z - 0.0], [0.2, 1.17, 0.45], [0.13, 1.0, 0.55], fpt(0.78, 0.04), [0.12, 0.6, 0.45]], 0.0045, GRAPH2, steer, 6);
  }

  // gauge pod with a glowing dial
  {
    const gd: V = [0, 0.45, -0.89];
    const gc: V = [0, 1.125, 0.47];
    rod(fpt(0.97), [0, 1.1, 0.475], 0.014, STEEL, steer);
    b.lathe(
      [
        [0, -0.045],
        [0.052, -0.045],
        [0.058, -0.03],
        [0.058, 0.01],
        [0.052, 0.025],
        [0, 0.025],
      ],
      { at: gc, axis: gd, segments: 14, bone: steer, color: GRAPH_P },
    );
    glow(b.part(new THREE.CircleGeometry(0.047, 20), "#ffffff", { bone: steer, at: [gc[0], gc[1] + 0.0114, gc[2] - 0.0224], dir: gd, axis: "z", texture: GAUGE }), 1.2);
    torus(steer, [gc[0], gc[1] + 0.0108, gc[2] - 0.0214], gd, 0.05, 0.004, STEEL, 20);
  }

  // =============================================================================================================
  // FRAME (graphite tubes), engine mounts
  const FR = 0.021;
  // backbone: neck -> seat -> rear loop
  tube(
    [
      HEAD,
      [0, 0.875, 0.45],
      [0, 0.8, 0.25],
      [0, 0.7, -0.05],
      [0, 0.62, -0.22],
      [0, 0.58, -0.4],
      [0, 0.58, -0.52],
    ],
    [0.03, 0.022],
    GRAPH_P,
    frameJ,
  );
  for (const s of [1, -1]) {
    // double down-tube cradle: neck -> engine front -> lower rails -> rear dropouts
    tube(
      [
        [s * 0.025, 0.895, 0.6],
        [s * 0.07, 0.72, 0.56],
        [s * 0.125, 0.45, 0.5],
        [s * 0.14, 0.23, 0.43],
        [s * 0.15, 0.22, 0.1],
        [s * 0.15, 0.22, -0.28],
        [s * 0.19, 0.28, -0.56],
        [s * 0.225, RA[1], RA[2]],
      ],
      FR,
      GRAPH_P,
      frameJ,
    );
    // seat tubes backbone -> rails
    tube([[0, 0.76, -0.1], [s * 0.05, 0.5, -0.26], [s * 0.15, 0.24, -0.3]], 0.019, GRAPH_P, frameJ);
    // upper stays crossbar -> dropouts
    tube([[s * 0.19, 0.6, -0.5], [s * 0.205, 0.46, -0.76], [s * 0.225, RA[1], RA[2]]], 0.0185, GRAPH_P, frameJ);
    // dropout plates
    b.extrude(
      [
        [-0.05, -0.06],
        [0.05, -0.06],
        [0.06, 0.07],
        [0, 0.1],
        [-0.06, 0.07],
      ],
      { at: [s * 0.228, RA[1] + 0.005, RA[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, color: ORANGE, bone: frameJ, name: "dropout" },
    );
    for (const dz of [-0.03, 0.03]) bolt(frameJ, [s * 0.236, RA[1] + 0.06, RA[2] + dz], [s, 0, 0], 0.008, GRAPH2);
    bolt(frameJ, [s * 0.236, RA[1], RA[2]], [s, 0, 0], 0.016, GRAPH2);
    // highway guard bar
    tube(
      [
        [s * 0.06, 0.8, 0.61],
        [s * 0.2, 0.68, 0.63],
        [s * 0.3, 0.46, 0.6],
        [s * 0.3, 0.34, 0.53],
        [s * 0.17, 0.23, 0.44],
      ],
      0.0125,
      CHROME,
      frameJ,
    );
    // foot peg
    rod([s * 0.29, 0.345, 0.53], [s * 0.46, 0.345, 0.53], 0.011, BRUSHED, frameJ);
    rod([s * 0.34, 0.345, 0.53], [s * 0.44, 0.345, 0.53], 0.0185, RUBBER, frameJ);
    put(frameJ, ORANGE, new THREE.SphereGeometry(0.0125, 6, 4), [s * 0.465, 0.345, 0.53]);
  }
  rod([-0.19, 0.6, -0.5], [0.19, 0.6, -0.5], 0.0185, GRAPH_P, frameJ);
  rod([-0.15, 0.22, 0.43], [0.15, 0.22, 0.43], 0.015, GRAPH_P, frameJ);
  rod([-0.15, 0.22, -0.29], [0.15, 0.22, -0.29], 0.015, GRAPH_P, frameJ);
  // neck gusset plates
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.17, -0.12],
        [0.14, -0.15],
        [-0.02, -0.05],
      ],
      { at: [s * 0.03, 0.93, 0.62], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: GRAPH3, bone: frameJ, name: "gusset" },
    );

  // underglow strips
  for (const s of [1, -1]) glow(rod([s * 0.075, 0.238, 0.46], [s * 0.075, 0.238, -0.2], 0.0065, ORANGE, frameJ), 1.5);
  glow(rod([-0.075, 0.238, 0.46], [0.075, 0.238, 0.46], 0.0065, ORANGE, frameJ), 1.5);

  // =============================================================================================================
  // ENGINE
  const crank = b.extrude(
    [
      [-0.22, 0.31],
      [-0.22, 0.5],
      [-0.04, 0.53],
      [0.18, 0.505],
      [0.44, 0.505],
      [0.5, 0.42],
      [0.46, 0.3],
      [0.3, 0.25],
      [0.1, 0.25],
      [-0.1, 0.27],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.23, bevel: 0.012, smoothing: 1, color: GRAPH_P, bone: frameJ, name: "crankcase" },
  );
  void crank;
  // primary cover (left): orange billet with hex vents
  const primary = b.extrude(
    [
      [-0.18, 0.3],
      [-0.12, 0.265],
      [0.2, 0.26],
      [0.44, 0.3],
      [0.47, 0.4],
      [0.44, 0.5],
      [0.2, 0.535],
      [-0.1, 0.525],
      [-0.18, 0.46],
    ],
    {
      at: [0.1375, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      smoothing: 1,
      color: paint((_p, n, s) => {
        if (Math.abs(n.x) > 0.6) {
          const d = Math.hypot(s[0] - 0.14, s[1] - 0.4);
          if (d > 0.145 && d < 0.157) return GRAPH2;
          if (d > 0.168 && d < 0.173) return PEARL;
          if (s[0] > 0.34 && s[0] < 0.36) return GRAPH2;
          return ORANGE;
        }
        return ORANGE_D;
      }),
      bone: frameJ,
      name: "primary",
    },
  );
  void primary;
  b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", { bone: frameJ, at: [0.1605, 0.4, 0.14], dir: [1, 0, 0], axis: "z", texture: HEX, up: [0, 1, 0] });
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.045, 0.012],
      [0.03, 0.02],
      [0, 0.02],
    ],
    { at: [0.1595, 0.4, 0.34], axis: [1, 0, 0], segments: 12, bone: frameJ, color: BRUSHED },
  );
  glow(b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), ORANGE, { bone: frameJ, at: [0.18, 0.4, 0.34], dir: [1, 0, 0], flat: true }), 1.3);
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * DEG;
    bolt(frameJ, [0.16, 0.4 + 0.1 * Math.cos(a) * 0.9, 0.14 + 0.1 * Math.sin(a)], [1, 0, 0], 0.0075, STEEL);
  }
  for (const [z, y] of [
    [-0.12, 0.31],
    [0.38, 0.29],
    [0.4, 0.48],
    [-0.1, 0.49],
    [0.12, 0.275],
  ] as [number, number][])
    bolt(frameJ, [0.16, y, z], [1, 0, 0], 0.011, STEEL);
  // right side cover
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.115, 0.012],
      [0.1, 0.03],
      [0.05, 0.034],
      [0, 0.034],
    ],
    { at: [-0.115, 0.4, 0.3], axis: [-1, 0, 0], segments: 18, bone: frameJ, color: GRAPH_P },
  );
  torus(frameJ, [-0.147, 0.4, 0.3], [-1, 0, 0], 0.08, 0.005, ORANGE, 24);
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * DEG;
    bolt(frameJ, [-0.15, 0.4 + 0.095 * Math.cos(a), 0.3 + 0.095 * Math.sin(a)], [-1, 0, 0], 0.008, STEEL);
  }
  // oil pan + drain plug
  b.part(new THREE.BoxGeometry(0.16, 0.025, 0.3), GRAPH, { bone: frameJ, at: [0, 0.245, 0.22], flat: true });
  bolt(frameJ, [0, 0.232, 0.28], [0, -1, 0], 0.012, ORANGE);

  // cylinders
  const finOutline: [number, number][] = [[0, 0], [0.066, 0], [0.066, 0.03]];
  for (let i = 0; i < 7; i++) {
    const y0 = 0.03 + i * 0.0245;
    finOutline.push([0.068, y0 + 0.002], [0.092, y0 + 0.004], [0.092, y0 + 0.014], [0.068, y0 + 0.017]);
  }
  finOutline.push([0.066, 0.21], [0, 0.21]);
  type Cyl = { base: V; dir: V; side: number };
  const cyls: Cyl[] = [
    { base: [0, 0.45, 0.33], dir: [0, 0.866, 0.5], side: 1 },
    { base: [0, 0.45, 0.25], dir: [0, 0.866, -0.5], side: -1 },
  ];
  const along = (c: Cyl, d: number): V => [c.base[0], c.base[1] + c.dir[1] * d, c.base[2] + c.dir[2] * d];
  for (const c of cyls) {
    const axisV = v3(c.dir).normalize();
    const finPaint = paint((_p, n) => (Math.abs(n.dot(axisV)) < 0.35 ? STEEL : GRAPH_P));
    b.lathe(finOutline, { at: c.base, axis: c.dir, segments: 14, bone: frameJ, color: finPaint, name: "cylinder" });
    // head, rocker cover, bolts
    const hc = along(c, 0.265);
    b.part(new THREE.BoxGeometry(0.165, 0.1, 0.15), GRAPH_P, { bone: frameJ, at: hc, dir: c.dir, flat: true });
    const rk = along(c, 0.33);
    const rockerPaint = paint((_p, n) => (n.dot(axisV) > 0.7 ? ORANGE : ORANGE_D));
    b.part(new THREE.BoxGeometry(0.175, 0.034, 0.105), rockerPaint, { bone: frameJ, at: rk, dir: c.dir, flat: true });
    glow(b.part(new THREE.BoxGeometry(0.1, 0.005, 0.014), ORANGE, { bone: frameJ, at: along(c, 0.349), dir: c.dir, flat: true }), 1.5);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const q = along(c, 0.348);
        const perp = v3([0, -c.dir[2], c.dir[1]]).normalize();
        bolt(frameJ, [q[0] + sx * 0.068, q[1] + perp.y * sz * 0.04, q[2] + perp.z * sz * 0.04], c.dir, 0.009, STEEL);
      }
    // head side bolts
    for (const sx of [-1, 1])
      for (const k of [-1, 1]) {
        const q = along(c, 0.265);
        const perp = v3([0, -c.dir[2], c.dir[1]]).normalize();
        bolt(frameJ, [q[0] + sx * 0.0825, q[1] + perp.y * k * 0.04, q[2] + perp.z * k * 0.04], [sx, 0, 0], 0.01, STEELD);
      }
    // pushrod tubes (right side)
    rod(along(c, 0.03).map((v, i) => (i === 0 ? -0.07 : v)) as V, along(c, 0.24).map((v, i) => (i === 0 ? -0.07 : v)) as V, 0.007, CHROME, frameJ);
    // spark plug + wire
    const perpF = v3([0, -c.dir[2], c.dir[1]]).normalize().multiplyScalar(c.side * 0.04);
    const plug: V = [0.05, hc[1] + perpF.y + 0.04, hc[2] + perpF.z * 1.2];
    b.part(new THREE.CylinderGeometry(0.01, 0.012, 0.045, 6), "#eef0f2", { bone: frameJ, at: plug, dir: [0.4, 1, 0.0], flat: true });
    tube([[plug[0] + 0.02, plug[1] + 0.03, plug[2]], [0.1, plug[1] + 0.07, plug[2] - c.side * 0.04], [0.12, 0.62, 0.3], [0.1, 0.5, 0.3]], 0.0045, GRAPH2, frameJ, 6);
  }
  // intake: carb + air cleaner (right) with hex vent
  rod([0, 0.605, 0.3], [-0.11, 0.605, 0.3], 0.036, BRUSHED, frameJ);
  b.lathe(
    [
      [0, 0],
      [0.105, 0],
      [0.118, 0.015],
      [0.118, 0.05],
      [0.105, 0.062],
      [0, 0.062],
    ],
    { at: [-0.12, 0.605, 0.3], axis: [-1, 0, 0], segments: 20, bone: frameJ, color: paint((_p, n) => (Math.abs(n.x) > 0.8 ? GRAPH_P : CHROME)) },
  );
  b.part(new THREE.CircleGeometry(0.1, 24), "#ffffff", { bone: frameJ, at: [-0.1825, 0.605, 0.3], dir: [-1, 0, 0], axis: "z", texture: HEX });
  torus(frameJ, [-0.183, 0.605, 0.3], [-1, 0, 0], 0.108, 0.0055, ORANGE, 24);

  // =============================================================================================================
  // EXHAUST (right side drag pipes)
  const pipeFront = catmull([
    [-0.04, 0.595, 0.51],
    [-0.12, 0.585, 0.565],
    [-0.18, 0.52, 0.55],
    [-0.19, 0.42, 0.47],
    [-0.19, 0.36, 0.3],
    [-0.19, 0.355, 0.0],
    [-0.19, 0.355, -0.4],
    [-0.19, 0.36, -0.72],
  ]);
  const pipeRear = catmull([
    [-0.04, 0.595, 0.075],
    [-0.12, 0.57, 0.03],
    [-0.21, 0.5, -0.02],
    [-0.275, 0.4, -0.05],
    [-0.28, 0.3, -0.12],
    [-0.28, 0.285, -0.3],
    [-0.28, 0.285, -0.6],
    [-0.28, 0.29, -0.8],
  ]);
  const pipes: [typeof pipeFront, number][] = [
    [pipeFront, 0.027],
    [pipeRear, 0.03],
  ];
  for (const [p, r] of pipes) {
    b.sweep(p, [r, r * 1.2], { color: CHROME, bone: frameJ, sides: 10, caps: { start: "flat", end: "flat" } });
    const end = p.at(1);
    const tan = p.tangentAt(1);
    torus(frameJ, [end.x, end.y, end.z], [tan.x, tan.y, tan.z], r * 1.2, 0.006, STEEL, 12);
    b.part(new THREE.CylinderGeometry(r * 1.0, r * 1.0, 0.004, 10), GRAPH2, { bone: frameJ, at: [end.x + tan.x * 0.003, end.y + tan.y * 0.003, end.z + tan.z * 0.003], dir: [tan.x, tan.y, tan.z], flat: true });
    // exhaust flange at head
    const st = p.at(0);
    torus(frameJ, [st.x, st.y, st.z], [p.tangentAt(0).x, p.tangentAt(0).y, p.tangentAt(0).z], r * 1.25, 0.007, ORANGE, 10);
    // clamps
    for (const t of [0.3, 0.55, 0.78]) {
      const q = p.at(t);
      const tg = p.tangentAt(t);
      torus(frameJ, [q.x, q.y, q.z], [tg.x, tg.y, tg.z], r * (1 + 0.2 * t) + 0.0075, 0.006, ORANGE, 10);
    }
  }
  // perforated heat shields
  const shield = paint((_p, _n, s) => {
    const a = ((s[1] % 36) + 36) % 36;
    const along = (s[0] * 70) % 1;
    return a < 14 && along > 0.2 && along < 0.65 ? GRAPH2 : GRAPH_P;
  });
  b.sweep(pipeFront.slice(0.4, 0.72), 0.036, { color: shield, bone: frameJ, sides: 10, caps: "flat" });
  b.sweep(pipeRear.slice(0.5, 0.82), 0.04, { color: shield, bone: frameJ, sides: 10, caps: "flat" });

  // =============================================================================================================
  // FUEL TANK (pearl teardrop with orange stripe)
  const tankPath = catmull([
    [0, 0.935, 0.47],
    [0, 0.935, 0.36],
    [0, 0.915, 0.15],
    [0, 0.875, -0.05],
    [0, 0.84, -0.16],
  ]);
  const tankPaint = paint((p, n, s) => {
    const ax = Math.abs(p.x);
    if (n.y < -0.35) return GRAPH2;
    if (s[0] < 0.07) return ORANGE;
    if (s[0] > 0.92) return GRAPH;
    if (ax < 0.016 && n.y > 0.4) return ORANGE;
    if (ax > 0.024 && ax < 0.03 && n.y > 0.3) return GRAPH;
    if (s[0] > 0.12 && s[0] < 0.125) return GRAPH;
    if (s[0] > 0.84 && s[0] < 0.845) return ORANGE;
    return PEARL_P;
  });
  const tank = b.sweep(tankPath, (t) => {
    const k = Math.sin(Math.PI * Math.pow(t, 0.72));
    return [0.04 + 0.13 * k, 0.04 + 0.085 * k];
  }, { color: tankPaint, bone: frameJ, sides: 16, name: "tank" });
  void tank;
  const tankSurf = b.surface(tank);
  for (const s of [1, -1]) {
    const tc = tank.at(0.43).at;
    b.decal(tankSurf, TANK_ART, { at: [s * 0.2, tc.y - 0.03, tc.z], dir: [s, 0, 0], size: [0.24, 0.11], segments: [14, 8], bone: frameJ, lift: 0.002 });
  }
  const hudAt = tank.at(0.7).at;
  glow(b.decal(tankSurf, HUD, { at: [hudAt.x, hudAt.y + 0.05, hudAt.z], dir: [0, 1, 0], up: [0, 0, 1], size: [0.1, 0.037], segments: [8, 4], bone: frameJ, lift: 0.002 }), 1.1);
  // fuel cap on a hinge
  {
    const cp = tank.at(0.3).at;
    const capJ = b.joint("tankCap", { parent: frameJ, at: [cp.x, cp.y + 0.005, cp.z - 0.035], dir: [0, 0, 1], role: "hinge" });
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.016, 12), BRUSHED, { bone: capJ, at: [cp.x, cp.y + 0.012, cp.z], flat: true });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 10), ORANGE, { bone: capJ, at: [cp.x, cp.y + 0.02, cp.z], flat: true });
    b.part(new THREE.BoxGeometry(0.012, 0.012, 0.02), STEELD, { bone: capJ, at: [cp.x, cp.y + 0.027, cp.z - 0.02], flat: true });
  }
  // tank mounting straps
  for (const t of [0.22, 0.68]) {
    const p = tank.at(t);
    const loop = tankSurf.loop(p, { dir: p.tangent, lift: 0.002 });
    b.sweep(loop, [0.011, 0.0035], { section: "box", color: GRAPH, bone: frameJ });
  }
  // tank emblem studs
  for (const s of [1, -1]) {
    const q = tank.at(0.12).at;
    bolt(frameJ, [s * 0.075, q.y - 0.012, q.z], [s, 0.2, 0], 0.01, ORANGE);
  }

  // =============================================================================================================
  // SEAT
  const seatPath = catmull([
    [0, 0.69, -0.1],
    [0, 0.678, -0.28],
    [0, 0.7, -0.5],
  ]);
  const seatPaint = paint((p, n, s) => {
    const a = Math.abs((((s[1] + 180) % 360) + 360) % 360 - 180);
    if (Math.abs(a - 66) < 3 && ((s[0] * 90) % 1) < 0.6) return ORANGE;
    if (n.y > 0.4 && Math.abs(a - 20) > 0) {
      const u = (p.x * 22 + p.z * 22) % 1;
      const v = (p.x * 22 - p.z * 22) % 1;
      if (Math.abs(u) < 0.07 || Math.abs(v) < 0.07) return GRAPH3;
    }
    return SEAT;
  });
  b.sweep(seatPath, (t) => [0.075 + 0.075 * Math.sin(Math.PI * (0.25 + 0.6 * t)), 0.042], { color: seatPaint, bone: frameJ, sides: 12, name: "seat" });
  b.extrude(
    [
      [-0.07, 0],
      [0.07, 0],
      [0.15, -0.14],
      [0.15, -0.38],
      [0.1, -0.45],
      [-0.1, -0.45],
      [-0.15, -0.38],
      [-0.15, -0.14],
    ],
    { at: [0, 0.645, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, bevel: 0.003, smoothing: 1, color: GRAPH, bone: frameJ, name: "seatPan" },
  );
  // seat springs
  for (const s of [1, -1]) {
    const coil = catmull(
      Array.from({ length: 29 }, (_, i): V => {
        const a = (i / 28) * Math.PI * 2 * 3.5;
        return [s * 0.07 + 0.022 * Math.cos(a), 0.62 + (i / 28) * 0.045, -0.12 + 0.022 * Math.sin(a)];
      }),
    );
    b.sweep(coil, 0.0035, { color: CHROME, bone: frameJ, sides: 5 });
  }
  // battery box (left) + oil tank (right)
  b.part(new THREE.BoxGeometry(0.11, 0.15, 0.2), GRAPH_P, { bone: frameJ, at: [0.115, 0.5, -0.32], flat: true });
  b.part(new THREE.BoxGeometry(0.004, 0.1, 0.14), ORANGE, { bone: frameJ, at: [0.171, 0.5, -0.32], flat: true });
  b.lathe(
    [
      [0, -0.1],
      [0.06, -0.1],
      [0.07, -0.08],
      [0.07, 0.08],
      [0.06, 0.1],
      [0, 0.1],
    ],
    { at: [-0.125, 0.5, -0.32], axis: [0, 0, 1], segments: 12, bone: frameJ, color: CHROME },
  );
  torus(frameJ, [-0.125, 0.5, -0.24], [0, 0, 1], 0.07, 0.006, ORANGE, 12);
  torus(frameJ, [-0.125, 0.5, -0.4], [0, 0, 1], 0.07, 0.006, ORANGE, 12);

  // =============================================================================================================
  // REAR FENDER, struts, lights, plate, sissy bar
  const RF = 0.38;
  const rfPath = arc([0, RA[1], RA[2]], [0, RA[1] + RF * Math.cos(-80 * DEG), RA[2] + RF * Math.sin(-80 * DEG)], [1, 0, 0], 118);
  const fenderPaintR = paint((p, n) => {
    const rad = Math.hypot(p.y - RA[1], p.z - RA[2]);
    if (Math.abs(n.x) > 0.5) return ORANGE;
    if (rad < RF) return GRAPH2;
    const ax = Math.abs(p.x);
    if (ax < 0.022) return ORANGE;
    if (ax > 0.032 && ax < 0.038) return GRAPH;
    if (ax > 0.15 && ax < 0.157) return GRAPH;
    return PEARL_P;
  });
  b.sweep(rfPath, [0.195, 0.013], { section: "box", color: fenderPaintR, bone: frameJ, name: "fenderR" });
  for (const s of [1, -1]) {
    const a = rfPath.at(0.12);
    rod([s * 0.19, a.y, a.z], [s * 0.225, RA[1] + 0.02, RA[2] - 0.02], 0.0115, GRAPH_P, frameJ);
    const m = rfPath.at(0.5);
    rod([s * 0.19, m.y, m.z], [s * 0.225, RA[1] + 0.03, RA[2]], 0.0115, GRAPH_P, frameJ);
    bolt(frameJ, [s * 0.195, rfPath.at(0.3).y, rfPath.at(0.3).z], [s, 0, 0], 0.008, ORANGE);
  }
  {
    const f = rfPath.at(1);
    rod([0, f.y - 0.01, f.z + 0.02], [0, 0.6, -0.52], 0.01, GRAPH_P, frameJ);
    const e = rfPath.at(0.0);
    glow(rod([-0.13, e.y - 0.002, e.z - 0.004], [0.13, e.y - 0.002, e.z - 0.004], 0.0125, RED, frameJ), 1.6);
    for (const s of [1, -1]) {
      put(frameJ, GRAPH2, new THREE.BoxGeometry(0.03, 0.03, 0.03), [s * 0.14, e.y - 0.002, e.z - 0.003], [0, 1, 0]);
      glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), ORANGE, { bone: frameJ, at: [s * 0.17, e.y + 0.012, e.z + 0.012], flat: true }), 1.3);
    }
    // plate
    const pc: V = [0, 0.3, -1.345];
    rod([0, e.y - 0.015, e.z - 0.01], [0, pc[1] + 0.07, pc[2] + 0.008], 0.008, GRAPH_P, frameJ);
    b.part(new THREE.BoxGeometry(0.215, 0.115, 0.01), GRAPH, { bone: frameJ, at: [0, pc[1], pc[2] + 0.007], dir: [0, 1, -0.15], flat: true });
    b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { bone: frameJ, at: [0, pc[1], pc[2] - 0.0005], dir: [0, 0.12, -1], axis: "z", texture: PLATE });
    for (const s of [1, -1]) bolt(frameJ, [s * 0.1, pc[1] + 0.045, pc[2] - 0.003], [0, 0.1, -1], 0.006, STEEL);
  }
  // sissy bar
  {
    const sb = catmull([
      [-0.19, 0.6, -0.5],
      [-0.18, 0.84, -0.6],
      [-0.12, 1.0, -0.66],
      [0, 1.045, -0.675],
      [0.12, 1.0, -0.66],
      [0.18, 0.84, -0.6],
      [0.19, 0.6, -0.5],
    ]);
    b.sweep(sb, 0.0125, { color: CHROME, bone: frameJ, sides: 8 });
    b.part(new THREE.BoxGeometry(0.2, 0.13, 0.05), SEAT, { bone: frameJ, at: [0, 0.915, -0.65], dir: [0, 1, 0.12], flat: true });
    b.part(new THREE.BoxGeometry(0.2, 0.012, 0.052), ORANGE, { bone: frameJ, at: [0, 0.975, -0.652], dir: [0, 1, 0.12], flat: true });
  }

  // =============================================================================================================
  // BELT DRIVE (left): pulleys, belt, guard
  {
    const X = 0.178;
    const P1: V = [X, RA[1], RA[2]];
    const P2: V = [X, 0.34, -0.2];
    const r1 = 0.105;
    const r2 = 0.045;
    const pts: V[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI;
      pts.push([X, P1[1] + r1 * Math.cos(a), P1[2] - r1 * Math.sin(a)]);
    }
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      pts.push([X, P2[1] + r2 * Math.cos(a), P2[2] - r2 * Math.sin(a)]);
    }
    const beltPaint = paint((_p, _n, s) => (Math.floor(s[0] * 340) % 2 ? "#2d333d" : GRAPH2));
    b.sweep(catmull(pts, { closed: true }), [0.017, 0.005], { section: "box", color: beltPaint, bone: frameJ, name: "belt" });
    const pulley = paint((_p, n, s) => (Math.abs(n.x) > 0.6 ? (Math.floor(s[1] / 15) % 2 ? STEEL : GRAPH3) : STEELD));
    for (const [c, r, w] of [
      [P1, r1, 0.022],
      [P2, r2, 0.022],
    ] as [V, number, number][])
      b.lathe(
        [
          [0, -w],
          [r + 0.004, -w],
          [r + 0.004, w],
          [0, w],
        ],
        { at: c, axis: [1, 0, 0], segments: 24, bone: c === P1 ? wheelR : frameJ, color: pulley },
      );
    // pulley spoke face + hub glow
    glow(b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.006, 12), ORANGE, { bone: wheelR, at: [X + 0.024, P1[1], P1[2]], dir: [1, 0, 0], flat: true }), 1.2);
    glow(b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 10), ORANGE, { bone: frameJ, at: [X + 0.024, P2[1], P2[2]], dir: [1, 0, 0], flat: true }), 1.2);
    // belt guard arcs (orange)
    const g1 = arc([X, P1[1], P1[2]], [X, P1[1] + 0.128, P1[2]], [1, 0, 0], -80);
    b.sweep(g1, [0.024, 0.0055], { section: "box", color: ORANGE, bone: frameJ, name: "beltGuard" });
    const g2 = arc([X, P2[1], P2[2]], [X, P2[1] + 0.07, P2[2]], [1, 0, 0], 75);
    b.sweep(g2, [0.024, 0.0055], { section: "box", color: ORANGE, bone: frameJ, name: "beltGuard2" });
  }

  // gear shifter (left): linkage + pedal
  rod([0.17, 0.3, -0.16], [0.18, 0.29, 0.3], 0.007, STEEL, frameJ);
  rod([0.18, 0.29, 0.3], [0.31, 0.29, 0.4], 0.009, STEEL, frameJ);
  b.part(new THREE.BoxGeometry(0.075, 0.016, 0.03), RUBBER, { bone: frameJ, at: [0.34, 0.29, 0.4], flat: true });
  put(frameJ, ORANGE, new THREE.SphereGeometry(0.011, 6, 4), [0.18, 0.29, 0.3]);

  // =============================================================================================================
  // KICKSTAND (stowed)
  {
    const pv: V = [0.18, 0.3, -0.42];
    const ft: V = [0.27, 0.27, -0.64];
    rod(pv, ft, 0.011, GRAPH_P, kick);
    b.part(new THREE.BoxGeometry(0.06, 0.012, 0.045), GRAPH2, { bone: kick, at: [ft[0] + 0.01, ft[1] - 0.004, ft[2] - 0.01], flat: true });
    put(kick, ORANGE, new THREE.SphereGeometry(0.014, 6, 4), pv);
  }

  flush();
  return b.root;
}
