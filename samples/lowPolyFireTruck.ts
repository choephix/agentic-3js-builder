import * as THREE from "three";
import type { Texture } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { aim, DEG } from "../src/math";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Engine 42 Ladder Truck",
  description:
    "Low-poly American rear-mount aerial ladder truck, a game asset in flat colour: fire-engine red with a white cab top, chrome trim and gold-leaf lettering; light bar, Q-siren and air horns, roll-up compartments, pump panel with gauges and valves, crosslays, hose bed and booster reel, wooden ground ladders, axes, cones and extinguishers, rear chevrons, H-jack outriggers and a four-section aerial ladder on a turntable. Jointed wheels, steering, doors, compartment doors, outriggers, turntable, ladder pitch and extension.",
};

// ---------------------------------------------------------------- palette
const C = {
  RED_D: "#8a1a20",
  RED: "#d0252d",
  RED_L: "#ec4b3e",
  WHITE_D: "#c3c8d0",
  WHITE: "#eef0f3",
  STEEL_D: "#383f4b",
  STEEL: "#6c7786",
  CHROME: "#a9b3bf",
  CHROME_L: "#e0e6ed",
  BLACK: "#1b1d22",
  TIRE: "#2a2d33",
  RUBBER: "#43474f",
  GOLD_D: "#9a6716",
  GOLD: "#dca536",
  GLASS: "#22405f",
  GLASS_L: "#5d88b0",
  ORANGE: "#f5791e",
  YELLOW: "#f2c12e",
  BLUE: "#2f74c4",
  WOOD: "#c0813f",
  WOOD_D: "#8a5524",
  G_RED: "#ff2d2d",
  G_WHITE: "#fff5d8",
  G_AMBER: "#ffab1f",
  G_CYAN: "#5ee6ff",
} as const;

// ---------------------------------------------------------------- drawings
const doc = (vb: string, body: string, size: number) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`, { size });

const SERIF = `font-family="DejaVu Serif, Georgia, serif" font-weight="bold" text-anchor="middle"`;

/** Gold-leaf lettering: dark drop shadow, gold fill with a lighter upper half, dark gold outline. */
function goldLines(w: number, h: number, lines: [string, number, number][], size: number) {
  const body = lines
    .map(([text, y, fs], i) => {
      const cut = y - fs * 0.38;
      return `<clipPath id="c${i}"><rect x="0" y="0" width="${w}" height="${cut}"/></clipPath>
<text ${SERIF} x="${w / 2 + fs * 0.06}" y="${y + fs * 0.06}" font-size="${fs}" fill="#2a0b0d" stroke="#2a0b0d" stroke-width="${fs * 0.08}">${text}</text>
<text ${SERIF} x="${w / 2}" y="${y}" font-size="${fs}" fill="${C.GOLD}" stroke="${C.GOLD_D}" stroke-width="${fs * 0.05}" paint-order="stroke">${text}</text>
<text ${SERIF} x="${w / 2}" y="${y}" font-size="${fs}" fill="#f8db7c" clip-path="url(#c${i})">${text}</text>`;
    })
    .join("");
  return doc(`0 0 ${w} ${h}`, body, size);
}

function maltese() {
  const arm = `<path d="M100 100 L66 10 L100 32 L134 10 Z"/>`;
  const arms = (fill: string, stroke: string, sw: number) =>
    `<g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="miter">${[0, 90, 180, 270]
      .map((r) => `<g transform="rotate(${r} 100 100)">${arm}</g>`)
      .join("")}</g>`;
  return doc(
    "0 0 200 200",
    `${arms(C.GOLD_D, C.GOLD_D, 10)}${arms(C.GOLD, C.GOLD_D, 3)}
<g transform="rotate(45 100 100)"><rect x="60" y="60" width="80" height="80" fill="none"/></g>
<circle cx="100" cy="100" r="40" fill="${C.GOLD_D}"/><circle cx="100" cy="100" r="34" fill="${C.RED_D}"/>
<circle cx="100" cy="100" r="28" fill="#f2f2f2"/>
<text ${SERIF} x="100" y="114" font-size="40" fill="${C.RED}">42</text>
<text ${SERIF} x="100" y="58" font-size="12" fill="${C.RED_D}">F.D.</text>`,
    256,
  );
}

/** NFPA rear chevrons, red and lime, an inverted V meeting on the centre line. 240 × 160 cm. */
const CHEVRON_BODY = `<defs>
<pattern id="pl" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="34" height="34" fill="#d9e23a"/><rect width="17" height="34" fill="${C.RED}"/></pattern>
<pattern id="pr" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="34" height="34" fill="#d9e23a"/><rect width="17" height="34" fill="${C.RED}"/></pattern>
</defs>
<rect x="0" y="0" width="120" height="160" fill="url(#pl)"/><rect x="120" y="0" width="120" height="160" fill="url(#pr)"/>`;
const chevrons = (vb: string, size: number) => doc(vb, CHEVRON_BODY, size);

function diamondPlate(cols: number, rows: number) {
  let cells = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = c * 10 + 5;
      const y = r * 10 + 5;
      const rot = (r + c) % 2 ? 45 : -45;
      cells += `<rect x="${x - 3.5}" y="${y - 1.2}" width="7" height="2.4" transform="rotate(${rot} ${x} ${y})"/>`;
    }
  return doc(
    `0 0 ${cols * 10} ${rows * 10}`,
    `<rect width="${cols * 10}" height="${rows * 10}" fill="#8c96a2"/><g fill="#cfd6de">${cells}</g>`,
    Math.min(512, Math.max(cols, rows) * 16),
  );
}

function slats() {
  let lines = "";
  for (let y = 6; y < 112; y += 9) lines += `<rect x="0" y="${y}" width="100" height="2.5"/>`;
  return doc(
    "0 0 100 120",
    `<rect width="100" height="120" fill="#cfd5dd"/><g fill="#8f99a6">${lines}</g><rect x="0" y="0" width="100" height="4" fill="#7c8592"/>`,
    256,
  );
}

function gauge(face: string) {
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = (-135 + i * 27) * DEG;
    const r0 = i % 5 ? 21 : 17;
    ticks += `<line x1="${32 + r0 * Math.sin(a)}" y1="${32 - r0 * Math.cos(a)}" x2="${32 + 26 * Math.sin(a)}" y2="${32 - 26 * Math.cos(a)}"/>`;
  }
  return doc(
    "0 0 64 64",
    `<circle cx="32" cy="32" r="32" fill="${face}"/><path d="M32 32 L${32 + 27 * Math.sin(75 * DEG)} ${32 - 27 * Math.cos(75 * DEG)} A27 27 0 0 1 ${32 + 27 * Math.sin(135 * DEG)} ${32 - 27 * Math.cos(135 * DEG)} Z" fill="${C.RED}"/>
<circle cx="32" cy="32" r="22" fill="${face}"/><g stroke="#1b1d22" stroke-width="2.5">${ticks}</g>
<polygon points="30,34 34,34 46,14" fill="#1b1d22"/><circle cx="32" cy="32" r="4" fill="${C.RED}"/>`,
    128,
  );
}

function hazard(a: string, c: string) {
  let s = "";
  for (let i = -4; i < 8; i++)
    s += `<polygon points="${i * 16},0 ${i * 16 + 8},0 ${i * 16 + 72},64 ${i * 16 + 64},64" fill="${c}"/>`;
  return doc("0 0 64 64", `<rect width="64" height="64" fill="${a}"/>${s}`, 128);
}

/** Two rows of reflective checks along a strip `cols` wide. */
function checker(cols: number, a: string, c: string) {
  let s = "";
  for (let i = 0; i < cols; i++) s += `<rect x="${i * 10}" y="${i % 2 ? 0 : 10}" width="10" height="10"/>`;
  return doc(
    `0 0 ${cols * 10} 20`,
    `<rect width="${cols * 10}" height="20" fill="${a}"/><g fill="${c}">${s}</g>`,
    Math.min(1024, cols * 20),
  );
}

function roofNumber() {
  return doc(
    "0 0 120 100",
    `<text ${SERIF} transform="translate(120 0) scale(-1 1)" x="60" y="86" font-size="96" fill="${C.RED}" stroke="${C.BLACK}" stroke-width="5" paint-order="stroke">42</text>`,
    256,
  );
}

function plate() {
  return doc(
    "0 0 120 60",
    `<rect x="0" y="0" width="120" height="60" rx="6" fill="#f4f4ee"/><rect x="4" y="4" width="112" height="52" rx="4" fill="none" stroke="${C.BLUE}" stroke-width="3"/>
<text ${SERIF} x="60" y="18" font-size="11" fill="${C.RED}">FIRE DEPT</text><text ${SERIF} x="60" y="48" font-size="28" fill="${C.BLUE}">FD 42</text>`,
    256,
  );
}

// ---------------------------------------------------------------- geometry in model space
type V = [number, number, number];
type G = THREE.BufferGeometry;
const v3 = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
const euler = (r: V) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG));

function place(g: G, at: V, q?: THREE.Quaternion) {
  return g.applyMatrix4(new THREE.Matrix4().compose(v3(at), q ?? new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
}
const box = (c: V, s: V, r?: V) => place(new THREE.BoxGeometry(s[0], s[1], s[2]), c, r && euler(r));
function hull(points: V[], at: V = [0, 0, 0], r?: V) {
  return place(new ConvexGeometry(points.map(v3)), at, r && euler(r));
}
/** A box with chamfered edges. */
function cbox(c: V, s: V, ch: number, r?: V) {
  const [hx, hy, hz] = [s[0] / 2, s[1] / 2, s[2] / 2];
  const k = Math.min(ch, hx * 0.9, hy * 0.9, hz * 0.9);
  const pts: V[] = [];
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1])
        pts.push(
          [sx * hx, sy * (hy - k), sz * (hz - k)],
          [sx * (hx - k), sy * hy, sz * (hz - k)],
          [sx * (hx - k), sy * (hy - k), sz * hz],
        );
  return hull(pts, c, r);
}
/** A cylinder from a to b (radius r at a, r2 at b). */
function cyl(a: V, b: V, r: number, sides = 8, r2 = r) {
  const d = v3(b).sub(v3(a));
  const m = v3(a).add(v3(b)).multiplyScalar(0.5);
  return place(new THREE.CylinderGeometry(r2, r, d.length(), sides), [m.x, m.y, m.z], aim(d));
}
/** A box from a to b, `w` wide and `h` thick, its thickness leaning toward `up`. */
function bar(a: V, b: V, w: number, h: number, up: V) {
  const d = v3(b).sub(v3(a));
  const m = v3(a).add(v3(b)).multiplyScalar(0.5);
  return place(new THREE.BoxGeometry(w, h, d.length()), [m.x, m.y, m.z], aim(d, up, "z"));
}
function lathe(profile: [number, number][], segs: number, at: V, dir: V, phase = 0) {
  return place(
    new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r, y)),
      segs,
      phase * DEG,
    ),
    at,
    aim(dir),
  );
}
const plane = (at: V, dir: V, w: number, h: number, up: V = [0, 1, 0]) =>
  place(new THREE.PlaneGeometry(w, h), at, aim(dir, up, "z"));
const disc = (at: V, dir: V, r: number, up: V = [0, 1, 0], segs = 16) =>
  place(new THREE.CircleGeometry(r, segs), at, aim(dir, up, "z"));
const torus = (at: V, dir: V, R: number, r: number, radial = 4, tubular = 10, arc = Math.PI * 2) =>
  place(new THREE.TorusGeometry(R, r, radial, tubular, arc), at, aim(dir, undefined, "z"));
const ball = (at: V, r: number) => place(new THREE.IcosahedronGeometry(r, 0), at);
const add3 = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function norm(g: G) {
  const n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") n.deleteAttribute(k);
  if (!n.getAttribute("normal")) n.computeVertexNormals();
  if (!n.getAttribute("uv"))
    n.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n.getAttribute("position").count * 2), 2));
  n.clearGroups();
  return n;
}

const arcPts = (zc: number, yc: number, R: number, a0: number, a1: number, n: number): OutlinePoint[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (a0 + ((a1 - a0) * i) / n) * DEG;
    return [zc + R * Math.cos(a), yc + R * Math.sin(a)];
  });

// ---------------------------------------------------------------- dimensions
const WHEEL_Y = 0.56;
const FRONT_AXLE = 3.95;
const REAR_AXLES = [-2.45, -3.75];
const HALF = 1.25; // body half width

export default function build() {
  const b = createBuilder({ name: "lowPolyFireTruck" });

  // textures (created per build)
  const T = {
    emblem: maltese(),
    ladder42: goldLines(
      250,
      170,
      [
        ["LADDER", 52, 44],
        ["42", 150, 104],
      ],
      512,
    ),
    frontText: goldLines(400, 64, [["LADDER 42", 50, 50]], 1024),
    num42: goldLines(120, 100, [["42", 86, 92]], 256),
    chevron: chevrons("0 0 240 160", 1024),
    chevronDoor: chevrons("40 45 75 110", 512),
    slats: slats(),
    gaugeW: gauge("#f4f1e6"),
    gaugeY: gauge("#f6e7a8"),
    hazardRW: hazard(C.RED, C.WHITE),
    hazardYB: hazard(C.YELLOW, C.BLACK),
    plate: plate(),
    checkFront: checker(46, C.RED, C.WHITE),
    checkRear: checker(50, C.RED, C.WHITE),
    roof42: roofNumber(),
  };
  const plates = new Map<string, Texture>();
  const dplate = (cols: number, rows: number) => {
    const key = `${cols}x${rows}`;
    let t = plates.get(key);
    if (!t) plates.set(key, (t = diamondPlate(cols, rows)));
    return t;
  };

  // --------------------------------------------------------------- buckets: one part per bone, group, colour
  type Bucket = { joint: Joint; group: string; color: string; lit: number; texture?: Texture; geos: G[] };
  const buckets = new Map<string, Bucket>();
  const push = (joint: Joint, group: string, color: string, lit: number, texture: Texture | undefined, geos: G[]) => {
    const key = `${joint.name}|${group}|${color}|${lit}|${texture?.uuid ?? ""}`;
    let bk = buckets.get(key);
    if (!bk) {
      bk = { joint, group, color, lit, texture, geos: [] };
      buckets.set(key, bk);
    }
    for (const g of geos) bk.geos.push(norm(g));
  };
  const on = (joint: Joint, group: string) => ({
    add: (color: string, ...geos: G[]) => push(joint, group, color, 0, undefined, geos),
    lit: (color: string, strength: number, ...geos: G[]) => push(joint, group, color, strength, undefined, geos),
    tex: (texture: Texture, ...geos: G[]) => push(joint, group, "#ffffff", 0, texture, geos),
  });
  /** Diamond plate: a plane facing up over a steel box top, its texture sized to keep the diamonds square. */
  const tread = (joint: Joint, group: string, c: V, w: number, d: number) =>
    on(joint, group).tex(
      dplate(Math.max(1, Math.round(w / 0.05)), Math.max(1, Math.round(d / 0.05))),
      plane(c, [0, 1, 0], w, d, [0, 0, -1]),
    );

  // --------------------------------------------------------------- skeleton
  const root = b.joint("chassis", { at: [0, 1.0, 0] });
  const SIDES = [1, -1] as const;
  const sideName = (s: number) => (s > 0 ? "L" : "R");

  const steer: Record<string, Joint> = {};
  const wheels: Joint[] = [];
  for (const s of SIDES) {
    const at: V = [s * 1.04, WHEEL_Y, FRONT_AXLE];
    const st = b.joint(`steerF${sideName(s)}`, { parent: root, at, dir: [0, 1, 0] });
    steer[sideName(s)] = st;
    wheels.push(b.joint(`wheelF${sideName(s)}`, { parent: st, at, dir: [s, 0, 0] }));
  }
  const rearWheels: Joint[] = [];
  for (const s of SIDES)
    REAR_AXLES.forEach((z, i) =>
      rearWheels.push(
        b.joint(`wheelR${sideName(s)}${i + 1}`, { parent: root, at: [s * 0.92, WHEEL_Y, z], dir: [s, 0, 0] }),
      ),
    );

  // --------------------------------------------------------------- wheels
  function tire(j: Joint, cx: number, z: number, w: number) {
    const hw = w / 2;
    const p = on(j, "wheel");
    p.add(
      C.TIRE,
      lathe(
        [
          [0.33, -hw],
          [0.47, -hw],
          [0.53, -hw + 0.035],
          [0.545, -hw * 0.45],
          [0.545, hw * 0.45],
          [0.53, hw - 0.035],
          [0.47, hw],
          [0.33, hw],
        ],
        14,
        [cx, WHEEL_Y, z],
        [1, 0, 0],
      ),
    );
    const n = 16;
    for (let i = 0; i < n; i++)
      for (const row of [-1, 1]) {
        const a = ((i + (row > 0 ? 0.5 : 0)) / n) * 360;
        const r = 0.551;
        p.add(
          C.RUBBER,
          box(
            [cx + row * hw * 0.27, WHEEL_Y + r * Math.sin(a * DEG), z + r * Math.cos(a * DEG)],
            [w * 0.42, 0.03, 0.12],
            [90 - a, row * 14, 0],
          ),
        );
      }
  }
  function rimFace(j: Joint, cx: number, z: number, s: number, front: boolean) {
    const p = on(j, "wheel");
    const out = (d: number): V => [cx + s * d, WHEEL_Y, z];
    p.add(C.CHROME, cyl(out(-0.06), out(0.005), 0.345, 14));
    p.add(C.STEEL_D, cyl(out(0.0), out(0.012), 0.29, 14));
    p.add(
      C.CHROME_L,
      lathe(
        [
          [0.27, 0],
          [0.2, 0.03],
          [0.15, 0.035],
          [0, 0.035],
        ],
        14,
        out(0.012),
        [s, 0, 0],
      ),
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      p.add(
        C.STEEL_D,
        cyl(
          add3(out(0.03), [0, 0.235 * Math.sin(a), 0.235 * Math.cos(a)]),
          add3(out(0.05), [0, 0.235 * Math.sin(a), 0.235 * Math.cos(a)]),
          0.03,
          6,
        ),
      );
    }
    p.add(
      C.CHROME_L,
      lathe(
        front
          ? [
              [0.13, 0],
              [0.13, 0.03],
              [0.09, 0.09],
              [0.04, 0.13],
              [0, 0.135],
            ]
          : [
              [0.13, 0],
              [0.12, 0.05],
              [0.07, 0.07],
              [0, 0.07],
            ],
        10,
        out(0.045),
        [s, 0, 0],
      ),
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const q: V = [0, 0.165 * Math.sin(a), 0.165 * Math.cos(a)];
      p.add(C.CHROME, cyl(add3(out(0.045), q), add3(out(0.08), q), 0.02, 6));
    }
  }
  wheels.forEach((j, i) => {
    const s = i === 0 ? 1 : -1;
    tire(j, s * 1.04, FRONT_AXLE, 0.38);
    rimFace(j, s * 1.04, FRONT_AXLE, s, true);
    on(j, "wheel").add(C.STEEL_D, cyl([s * 0.84, WHEEL_Y, FRONT_AXLE], [s * 1.0, WHEEL_Y, FRONT_AXLE], 0.31, 12));
  });
  rearWheels.forEach((j, i) => {
    const s = i < 2 ? 1 : -1;
    const z = REAR_AXLES[i % 2];
    tire(j, s * 0.77, z, 0.29);
    tire(j, s * 1.08, z, 0.29);
    rimFace(j, s * 1.08, z, s, false);
    on(j, "wheel").add(C.STEEL_D, cyl([s * 0.72, WHEEL_Y, z], [s * 1.0, WHEEL_Y, z], 0.31, 12));
  });

  // --------------------------------------------------------------- chassis (under everything)
  {
    const p = on(root, "chassis");
    for (const s of SIDES) p.add(C.STEEL_D, box([s * 0.45, 0.72, 0], [0.12, 0.24, 10.2]));
    for (const z of [4.7, 2.7, 0.9, -1.2, -3.1, -4.95]) p.add(C.STEEL_D, box([0, 0.72, z], [0.8, 0.16, 0.12]));
    // front axle, springs, steering
    p.add(C.STEEL_D, box([0, 0.5, FRONT_AXLE], [1.8, 0.14, 0.14]));
    for (const s of SIDES) {
      for (let k = 0; k < 3; k++)
        p.add(C.BLACK, box([s * 0.45, 0.6 + k * 0.035, FRONT_AXLE], [0.1, 0.03, 1.3 - k * 0.3]));
      p.add(C.STEEL, cyl([s * 0.86, 0.5, FRONT_AXLE], [s * 0.86, 0.66, FRONT_AXLE], 0.07, 6));
    }
    p.add(C.STEEL, cyl([-0.86, 0.6, FRONT_AXLE - 0.2], [0.86, 0.6, FRONT_AXLE - 0.2], 0.025, 6));
    // rear axles, differentials, walking beams
    for (const z of REAR_AXLES) {
      p.add(C.STEEL_D, cyl([-0.76, WHEEL_Y, z], [0.76, WHEEL_Y, z], 0.085, 8));
      p.add(C.STEEL, place(new THREE.IcosahedronGeometry(0.2, 0), [0, WHEEL_Y, z]));
      p.add(C.STEEL_D, cyl([0, WHEEL_Y, z + 0.15], [0, WHEEL_Y + 0.02, z + 0.3], 0.09, 8));
    }
    for (const s of SIDES) {
      p.add(C.BLACK, box([s * 0.45, 0.62, -3.1], [0.12, 0.14, 1.7]));
      p.add(C.STEEL, cyl([s * 0.45, 0.62, -3.1], [s * 0.6, 0.62, -3.1], 0.08, 6));
    }
    // drive shafts
    p.add(C.STEEL, cyl([0, 0.6, 2.9], [0, 0.56, -2.15], 0.05, 6));
    p.add(C.STEEL, cyl([0, WHEEL_Y, -2.75], [0, WHEEL_Y, -3.45], 0.05, 6));
    // engine sump and transmission under the cab
    p.add(C.STEEL_D, cbox([0, 0.72, 4.5], [0.7, 0.32, 0.9], 0.06));
    p.add(C.STEEL_D, cbox([0, 0.68, 3.0], [0.5, 0.3, 0.6], 0.06));
    // pump transmission and pump body under the pump house
    p.add(C.STEEL, cbox([0, 0.62, 1.3], [0.7, 0.34, 0.5], 0.05));
    p.add(C.RED_D, cyl([-0.7, 0.64, 1.3], [0.7, 0.64, 1.3], 0.16, 8));
    // fuel tank (left) and air tanks (right)
    p.add(C.STEEL_D, cbox([0.82, 0.6, -0.9], [0.5, 0.38, 1.2], 0.08));
    for (const z of [-0.6, -1.2]) p.add(C.CHROME, box([0.82, 0.6, z], [0.52, 0.4, 0.04]));
    p.add(C.CHROME_L, cyl([1.07, 0.72, -0.4], [1.11, 0.72, -0.4], 0.05, 8));
    for (const y of [0.52, 0.72]) p.add(C.STEEL, cyl([-0.8, y, -0.2], [-0.8, y, -1.6], 0.1, 8));
    p.add(C.BLACK, cbox([-0.8, 0.62, 0.35], [0.4, 0.3, 0.6], 0.03));
    // exhaust out the right side ahead of the rear wheels
    p.add(C.CHROME, cyl([-0.5, 0.62, -0.9], [-0.95, 0.62, -1.6], 0.06, 8));
    p.add(C.CHROME, cyl([-0.95, 0.62, -1.6], [-1.15, 0.5, -1.72], 0.07, 8));
    p.add(C.BLACK, cyl([-1.15, 0.5, -1.72], [-1.18, 0.49, -1.74], 0.055, 8));
  }

  // --------------------------------------------------------------- cab
  {
    const p = on(root, "cab");
    b.extrude([[5.25, 0.88], [5.25, 2.3], [1.75, 2.3], [1.75, 0.88], ...arcPts(FRONT_AXLE, WHEEL_Y, 0.7, 153, 27, 6)], {
      at: [0, 0, 0],
      x: [0, 0, 1],
      thickness: HALF * 2,
      bevel: 0.05,
      detail: 0.34,
      color: C.RED,
      bone: root,
      name: "cab.shell",
      group: "cab",
    });
    b.extrude(
      [
        [5.25, 2.3],
        [5.12, 2.95],
        [1.75, 2.95],
        [1.75, 2.3],
      ],
      {
        at: [0, 0, 0],
        x: [0, 0, 1],
        thickness: HALF * 2,
        bevel: 0.06,
        detail: 0.34,
        color: C.WHITE,
        bone: root,
        name: "cab.top",
        group: "cab",
      },
    );
    // raked windscreen
    const rake = Math.atan2(0.13, 0.65) / DEG;
    const fz = (y: number) => 5.25 - ((y - 2.3) * 0.13) / 0.65;
    const n: V = [0, Math.sin(rake * DEG), Math.cos(rake * DEG)];
    const onFace = (x: number, y: number, d: number): V => [x, y + n[1] * d, fz(y) + n[2] * d];
    p.add(C.BLACK, box(onFace(0, 2.615, 0.004), [2.34, 0.6, 0.02], [-rake, 0, 0]));
    for (const s of SIDES) {
      p.add(C.GLASS, box(onFace(s * 0.58, 2.615, 0.014), [1.04, 0.5, 0.02], [-rake, 0, 0]));
      for (const [dx, w] of [
        [-0.25, 0.09],
        [-0.08, 0.04],
      ] as const)
        p.add(C.GLASS_L, box(onFace(s * 0.58 + dx * s, 2.64, 0.026), [w, 0.5, 0.005], [-rake, 0, s * -32]));
      // wipers
      p.add(C.BLACK, box(onFace(s * 0.55, 2.43, 0.032), [0.7, 0.02, 0.012], [-rake, 0, s * 12]));
    }
    // roof cap seam and gold belt line across the front
    p.add(C.CHROME, box([0, 2.3, 5.265], [2.44, 0.04, 0.03]));
    // grille
    p.add(C.CHROME, cbox([0, 1.42, 5.27], [1.04, 0.76, 0.06], 0.02));
    p.add(C.BLACK, box([0, 1.42, 5.29], [0.9, 0.62, 0.02]));
    for (let i = 0; i < 7; i++) p.add(C.CHROME_L, box([0, 1.16 + i * 0.087, 5.305], [0.88, 0.035, 0.03]));
    p.add(C.CHROME_L, box([0, 1.42, 5.31], [0.05, 0.62, 0.03]));
    on(root, "cab").tex(T.emblem, plane([0, 1.42, 5.33], [0, 0, 1], 0.46, 0.46));
    on(root, "cab").tex(T.frontText, plane([0, 2.08, 5.257], [0, 0, 1], 1.6, 0.256));
    for (const s of SIDES) {
      // headlights: chrome bezels, two square lamps and an amber turn signal
      p.add(C.BLACK, cbox([s * 0.84, 1.27, 5.27], [0.5, 0.3, 0.05], 0.015));
      for (const x of [0.68, 0.86]) {
        p.add(C.CHROME, box([s * x, 1.27, 5.29], [0.17, 0.2, 0.02]));
        p.lit(C.G_WHITE, 1.4, box([s * x, 1.27, 5.3], [0.13, 0.16, 0.02]));
      }
      p.add(C.CHROME, box([s * 1.01, 1.27, 5.29], [0.11, 0.2, 0.02]));
      p.lit(C.G_AMBER, 1.2, box([s * 1.01, 1.27, 5.3], [0.08, 0.16, 0.02]));
      // forward warning lights
      p.add(C.BLACK, cbox([s * 0.84, 1.63, 5.27], [0.5, 0.16, 0.05], 0.015));
      for (const x of [0.67, 0.84, 1.01]) p.lit(C.G_RED, 1.6, box([s * x, 1.63, 5.3], [0.13, 0.1, 0.02]));
      // side: quarter window, number, marker and intersection lights
      p.add(C.BLACK, box([s * 1.252, 2.6, 4.52], [0.02, 0.5, 1.22]));
      p.add(C.GLASS, box([s * 1.262, 2.6, 4.52], [0.02, 0.44, 1.14]));
      p.add(C.GLASS_L, box([s * 1.272, 2.6, 4.75], [0.005, 0.44, 0.08], [s * 30, 0, 0]));
      on(root, "cab").tex(T.num42, plane([s * 1.258, 1.72, 4.9], [s, 0, 0], 0.46, 0.38));
      p.add(C.BLACK, box([s * 1.256, 1.2, 5.05], [0.03, 0.14, 0.3]));
      p.lit(C.G_RED, 1.6, box([s * 1.27, 1.2, 5.05], [0.02, 0.1, 0.26]));
      p.lit(C.G_AMBER, 1.2, box([s * 1.262, 1.02, 4.85], [0.02, 0.06, 0.14]));
      // belt line chrome strip on the cab shell (between the doors it is on the doors)
      p.add(C.CHROME, box([s * 1.262, 2.3, 4.52], [0.03, 0.04, 1.46]));
      // front arch trim
      const arch = arcPts(FRONT_AXLE, WHEEL_Y, 0.72, 153, 27, 6);
      for (let i = 0; i < arch.length - 1; i++) {
        const a = arch[i];
        const c = arch[i + 1];
        const mz = (a[0] + c[0]) / 2 - FRONT_AXLE;
        const my = (a[1] + c[1]) / 2 - WHEEL_Y;
        p.add(C.CHROME, bar([s * 1.262, a[1], a[0]], [s * 1.262, c[1], c[0]], 0.035, 0.07, [0, my, mz]));
      }
      // step well under the front door, behind the wheel
      p.add(C.BLACK, box([s * 1.245, 1.08, 3.08], [0.03, 0.38, 0.42]));
      tread(root, "cab", [s * 1.17, 0.91, 3.08], 0.18, 0.42);
      p.add(C.CHROME, box([s * 1.17, 0.89, 3.08], [0.2, 0.04, 0.44]));
      // crew step under the crew door
      p.add(C.CHROME, box([s * 1.13, 0.5, 2.34], [0.32, 0.05, 0.8]));
      tread(root, "cab", [s * 1.13, 0.528, 2.34], 0.3, 0.76);
      for (const z of [2.0, 2.68]) p.add(C.STEEL_D, box([s * 1.13, 0.7, z], [0.06, 0.36, 0.05]));
      // grab rails beside the doors
      for (const [z, y0, y1] of [
        [3.84, 1.45, 2.25],
        [1.8, 1.0, 2.25],
      ] as const) {
        p.add(C.CHROME_L, cyl([s * 1.33, y0, z], [s * 1.33, y1, z], 0.022, 6));
        for (const y of [y0, y1]) p.add(C.CHROME, cyl([s * 1.25, y, z], [s * 1.34, y, z], 0.018, 6));
      }
      // west-coast mirrors
      p.add(C.CHROME, cyl([s * 1.25, 2.42, 5.0], [s * 1.56, 2.6, 5.04], 0.022, 6));
      p.add(C.CHROME, cyl([s * 1.25, 1.95, 5.0], [s * 1.56, 2.02, 5.04], 0.022, 6));
      p.add(C.CHROME, cyl([s * 1.56, 1.98, 5.04], [s * 1.56, 2.62, 5.04], 0.02, 6));
      p.add(C.BLACK, cbox([s * 1.6, 2.36, 5.04], [0.09, 0.44, 0.2], 0.02));
      p.add(C.GLASS_L, box([s * 1.6, 2.36, 4.935], [0.075, 0.38, 0.01]));
      p.add(C.BLACK, cyl([s * 1.6, 2.06, 5.06], [s * 1.6, 2.06, 4.98], 0.08, 8));
      p.add(C.GLASS_L, cyl([s * 1.6, 2.06, 4.98], [s * 1.6, 2.06, 4.975], 0.065, 8));
      // roof: rear beacons, scene lights, antennas
      p.add(C.STEEL_D, cyl([s * 1.08, 2.95, 1.92], [s * 1.08, 3.0, 1.92], 0.1, 8));
      p.lit(
        C.G_RED,
        1.6,
        lathe(
          [
            [0.085, 0],
            [0.085, 0.06],
            [0.05, 0.12],
            [0, 0.13],
          ],
          8,
          [s * 1.08, 3.0, 1.92],
          [0, 1, 0],
        ),
      );
      p.add(C.STEEL_D, cbox([s * 1.265, 2.86, 2.35], [0.06, 0.12, 0.5], 0.015));
      p.lit(C.G_WHITE, 1.3, box([s * 1.3, 2.86, 2.35], [0.01, 0.08, 0.44]));
      p.add(C.BLACK, cyl([s * 0.95, 2.95, 2.2], [s * 0.95, 3.3, 2.2], 0.012, 4));
      p.add(C.BLACK, cyl([s * 0.95, 2.95, 2.2], [s * 0.95, 2.99, 2.2], 0.04, 6));
      // remote spotlights at the front roof corners
      p.add(C.STEEL_D, cyl([s * 1.0, 2.95, 4.45], [s * 1.0, 3.02, 4.45], 0.06, 6));
      p.add(
        C.CHROME_L,
        lathe(
          [
            [0, -0.08],
            [0.07, -0.08],
            [0.09, 0.06],
            [0.08, 0.08],
            [0, 0.08],
          ],
          8,
          [s * 1.0, 3.1, 4.45],
          [0, 0, 1],
        ),
      );
      p.lit(C.G_WHITE, 1.4, disc([s * 1.0, 3.1, 4.535], [0, 0, 1], 0.075, [0, 1, 0], 8));
      // roof number for the helicopter view
      on(root, "cab").tex(T.roof42, plane([s * 0.92, 2.957, 3.3], [0, 1, 0], 0.5, 0.42, [0, 0, 1]));
    }
    // light bar
    p.add(C.STEEL_D, cbox([0, 2.98, 4.92], [2.2, 0.06, 0.34], 0.02));
    for (let i = 0; i < 8; i++) {
      const x = -0.945 + i * 0.27;
      p.lit(i % 2 ? C.G_WHITE : C.G_RED, 1.6, cbox([x, 3.07, 4.92], [0.25, 0.12, 0.3], 0.03));
    }
    for (const s of SIDES) p.add(C.CHROME, cbox([s * 1.1, 3.06, 4.92], [0.06, 0.14, 0.32], 0.02));
    for (const s of SIDES) p.add(C.STEEL_D, box([s * 0.7, 2.97, 4.92], [0.06, 0.06, 0.4]));
    // roof air conditioner
    p.add(C.WHITE_D, cbox([0, 3.0, 3.0], [1.0, 0.1, 0.8], 0.03));
    for (let i = 0; i < 6; i++) p.add(C.STEEL, box([0, 3.055, 2.75 + i * 0.1], [0.8, 0.012, 0.04]));
    // drip rails over the doors
    for (const s of SIDES) p.add(C.CHROME, box([s * 1.258, 2.915, 3.45], [0.02, 0.02, 3.3]));
    // chrome cab-rear trim
    p.add(C.CHROME, box([0, 2.95, 1.77], [2.46, 0.03, 0.04]));
  }

  // --------------------------------------------------------------- cab doors
  const doorSpec = [
    { name: "doorF", z0: 3.78, z1: 2.88, y0: 1.33, emblem: true },
    { name: "doorCrew", z0: 2.83, z1: 1.86, y0: 0.94, emblem: false },
  ];
  for (const s of SIDES)
    for (const d of doorSpec) {
      const x = s * (HALF + 0.02);
      const j = b.joint(`${d.name}${sideName(s)}`, {
        parent: root,
        at: [x, (d.y0 + 2.88) / 2, d.z0],
        dir: [0, 0, -1],
        up: [s, 0, 0],
        role: "hinge",
      });
      const p = on(j, "cabDoor");
      const zc = (d.z0 + d.z1) / 2;
      const len = d.z0 - d.z1;
      p.add(C.RED, cbox([x, (d.y0 + 2.3) / 2, zc], [0.04, 2.3 - d.y0, len], 0.015));
      p.add(C.WHITE, cbox([x, 2.59, zc], [0.04, 0.58, len], 0.015));
      p.add(C.CHROME, box([x + s * 0.022, 2.3, zc], [0.01, 0.04, len]));
      p.add(C.BLACK, box([x + s * 0.022, 2.6, zc], [0.01, 0.5, len - 0.1]));
      p.add(C.GLASS, box([x + s * 0.03, 2.6, zc], [0.01, 0.44, len - 0.16]));
      p.add(C.GLASS_L, box([x + s * 0.036, 2.62, zc + 0.15], [0.004, 0.44, 0.07], [s * 30, 0, 0]));
      // handle and hinges
      p.add(C.CHROME, cbox([x + s * 0.03, 2.12, d.z1 + 0.12], [0.03, 0.05, 0.18], 0.01));
      p.add(C.BLACK, box([x + s * 0.042, 2.11, d.z1 + 0.12], [0.01, 0.025, 0.12]));
      for (const y of [d.y0 + 0.2, 2.15])
        p.add(C.CHROME, cyl([x + s * 0.03, y - 0.06, d.z0 - 0.02], [x + s * 0.03, y + 0.06, d.z0 - 0.02], 0.018, 6));
      if (d.emblem) on(j, "cabDoor").tex(T.emblem, plane([x + s * 0.022, 1.82, zc], [s, 0, 0], 0.5, 0.5));
      else on(j, "cabDoor").tex(T.ladder42, plane([x + s * 0.022, 1.62, zc], [s, 0, 0], 0.86, 0.585));
    }

  // --------------------------------------------------------------- front bumper
  {
    const p = on(root, "bumper");
    p.add(C.CHROME, cbox([0, 0.75, 5.43], [2.44, 0.34, 0.36], 0.04));
    p.add(C.STEEL_D, box([0, 0.6, 5.42], [2.3, 0.06, 0.34]));
    on(root, "bumper").tex(T.checkFront, plane([0, 0.66, 5.613], [0, 0, 1], 2.3, 0.1));
    for (const s of SIDES) tread(root, "bumper", [s * 0.82, 0.922, 5.43], 0.76, 0.3);
    // jump-line hose tray in the middle
    p.add(C.STEEL_D, box([0, 0.9, 5.43], [0.84, 0.06, 0.32]));
    for (let i = 0; i < 4; i++) {
      p.add(C.YELLOW, box([0, 0.935 + i * 0.035, 5.43], [0.74, 0.03, 0.22]));
      p.add(
        C.YELLOW,
        cyl([i % 2 ? 0.37 : -0.37, 0.935 + i * 0.035, 5.32], [i % 2 ? 0.37 : -0.37, 0.935 + i * 0.035, 5.54], 0.017, 6),
      );
    }
    p.add(C.CHROME_L, cyl([0.2, 1.08, 5.43], [0.2, 1.08, 5.62], 0.03, 6, 0.018));
    p.add(C.BLACK, box([0.2, 1.06, 5.4], [0.06, 0.06, 0.1]));
    // Q-siren in the middle of the bumper face
    p.add(
      C.CHROME_L,
      lathe(
        [
          [0, -0.01],
          [0.15, -0.01],
          [0.17, 0.02],
          [0.17, 0.14],
          [0.15, 0.17],
          [0, 0.17],
        ],
        12,
        [0, 0.74, 5.6],
        [0, 0, 1],
      ),
    );
    p.add(C.BLACK, disc([0, 0.74, 5.774], [0, 0, 1], 0.13, [0, 1, 0], 12));
    for (let i = 0; i < 6; i++) p.add(C.CHROME, box([0, 0.74, 5.78], [0.24, 0.018, 0.01], [0, 0, i * 30]));
    p.add(C.CHROME_L, cyl([0, 0.74, 5.78], [0, 0.74, 5.8], 0.035, 8));
    // air horns
    for (const s of SIDES) {
      p.add(
        C.CHROME_L,
        lathe(
          [
            [0.04, 0],
            [0.045, 0.22],
            [0.07, 0.36],
            [0.11, 0.42],
            [0.1, 0.42],
            [0.03, 0.36],
          ],
          10,
          [s * 0.42, 0.75, 5.3],
          [0, 0, 1],
        ),
      );
      // speakers
      p.add(C.BLACK, cbox([s * 0.82, 0.75, 5.63], [0.3, 0.22, 0.06], 0.02));
      for (let i = 0; i < 4; i++) p.add(C.STEEL, box([s * 0.82, 0.68 + i * 0.045, 5.665], [0.26, 0.015, 0.01]));
      // corner warning lights
      p.add(C.BLACK, box([s * 1.17, 0.78, 5.6], [0.12, 0.16, 0.04]));
      p.lit(C.G_RED, 1.6, box([s * 1.17, 0.78, 5.625], [0.09, 0.12, 0.02]));
      // tow eyes
      p.add(C.YELLOW, torus([s * 0.65, 0.5, 5.48], [1, 0, 0], 0.07, 0.022, 4, 8));
      p.add(C.STEEL_D, box([s * 0.65, 0.58, 5.42], [0.06, 0.06, 0.16]));
      // face bolts along the top of the bumper
      for (let k = 0; k < 4; k++)
        p.add(C.CHROME_L, cyl([s * (0.32 + k * 0.24), 0.885, 5.6], [s * (0.32 + k * 0.24), 0.885, 5.625], 0.018, 6));
    }
    on(root, "bumper").tex(T.plate, plane([0.0, 0.48, 5.6], [0, 0, 1], 0.3, 0.15));
    p.add(C.STEEL_D, box([0, 0.48, 5.595], [0.32, 0.17, 0.01]));
  }

  // --------------------------------------------------------------- equipment body
  {
    const p = on(root, "body");
    b.extrude(
      [
        [1.65, 0.82],
        [1.65, 2.25],
        [-5.2, 2.25],
        [-5.2, 0.82],
        ...arcPts(-3.75, WHEEL_Y, 0.7, 158.2, 90, 3),
        ...arcPts(-2.45, WHEEL_Y, 0.7, 90, 21.8, 3),
      ],
      {
        at: [0, 0, 0],
        x: [0, 0, 1],
        thickness: HALF * 2,
        bevel: 0.05,
        detail: 0.34,
        color: C.RED,
        bone: root,
        name: "body.shell",
        group: "body",
      },
    );
    // upper side bands (the walls of the hose bed) and the pump-house front wall
    for (const s of SIDES) {
      p.add(C.RED, cbox([s * 1.1, 2.43, -2.1], [0.3, 0.36, 6.2], 0.03));
      tread(root, "body", [s * 1.1, 2.613, -2.1], 0.28, 6.18);
      p.add(C.GOLD, box([s * 1.252, 2.27, -2.1], [0.012, 0.03, 6.2]));
      // lighter cap on the top edge
      p.add(C.RED_L, box([s * 1.243, 2.598, -2.1], [0.03, 0.035, 6.2]));
    }
    p.add(C.RED, cbox([0, 2.43, 1.6], [2.5, 0.36, 0.1], 0.02));
    p.add(C.CHROME, box([0, 2.62, 1.6], [2.5, 0.03, 0.12]));
    // torque box deck at the rear
    p.add(C.RED, cbox([0, 2.43, -4.25], [1.95, 0.36, 1.9], 0.03));
    tread(root, "body", [0, 2.613, -4.25], 1.9, 1.86);
    // lower white reflective stripe with a gold pinstripe
    for (const s of SIDES)
      for (const [z0, z1] of [
        [1.62, -1.75],
        [-4.45, -5.17],
        [5.22, 4.6],
        [3.3, 1.78],
      ] as const) {
        p.add(C.WHITE, box([s * 1.255, 0.88, (z0 + z1) / 2], [0.012, 0.09, z0 - z1]));
        if (z0 < 4) p.add(C.GOLD, box([s * 1.255, 0.95, (z0 + z1) / 2], [0.012, 0.02, z0 - z1]));
      }
    // rear arch trim
    for (const s of SIDES) {
      const arch = [...arcPts(-3.75, WHEEL_Y, 0.72, 158.2, 90, 3), ...arcPts(-2.45, WHEEL_Y, 0.72, 90, 21.8, 3)];
      for (let i = 0; i < arch.length - 1; i++) {
        const a = arch[i];
        const c = arch[i + 1];
        const up: V =
          a[1] > 1.25 && c[1] > 1.25
            ? [0, 1, 0]
            : [0, (a[1] + c[1]) / 2 - WHEEL_Y, (a[0] + c[0]) / 2 - (i < 3 ? -3.75 : -2.45)];
        p.add(C.CHROME, bar([s * 1.262, a[1], a[0]], [s * 1.262, c[1], c[0]], 0.035, 0.07, up));
      }
      // mud flaps
      p.add(C.BLACK, box([s * 0.95, 0.47, -4.45], [0.5, 0.66, 0.025]));
      p.add(C.CHROME, box([s * 0.95, 0.16, -4.46], [0.5, 0.04, 0.03]));
    }
  }

  // --------------------------------------------------------------- compartments with roll-up doors
  const compartments = [
    { z0: 0.7, z1: -0.56, y0: 1.0, y1: 2.18 },
    { z0: -0.6, z1: -1.72, y0: 1.0, y1: 2.18 },
    { z0: -1.88, z1: -3.08, y0: 1.4, y1: 2.18 },
    { z0: -3.12, z1: -4.3, y0: 1.4, y1: 2.18 },
  ];
  for (const s of SIDES)
    compartments.forEach((c, i) => {
      const x = s * HALF;
      const zc = (c.z0 + c.z1) / 2;
      const len = c.z0 - c.z1;
      const hgt = c.y1 - c.y0;
      const p = on(root, "body");
      // frame, proud of the body side
      p.add(C.CHROME, box([x + s * 0.012, c.y1 - 0.025, zc], [0.024, 0.05, len]));
      p.add(C.CHROME, box([x + s * 0.012, c.y0 + 0.02, zc], [0.024, 0.04, len]));
      for (const z of [c.z0 - 0.025, c.z1 + 0.025])
        p.add(C.CHROME, box([x + s * 0.012, (c.y0 + c.y1) / 2, z], [0.024, hgt, 0.05]));
      p.add(C.STEEL_D, box([x + s * 0.004, (c.y0 + c.y1) / 2, zc], [0.01, hgt - 0.08, len - 0.08]));
      // the roll-up door hangs from a joint at its top
      const j = b.joint(`rollup${sideName(s)}${i + 1}`, {
        parent: root,
        at: [x + s * 0.02, c.y1 - 0.05, zc],
        dir: [0, -1, 0],
      });
      const d = on(j, "rollup");
      d.add(C.CHROME, box([x + s * 0.012, (c.y0 + c.y1) / 2 - 0.005, zc], [0.012, hgt - 0.09, len - 0.1]));
      d.tex(T.slats, plane([x + s * 0.0195, (c.y0 + c.y1) / 2 - 0.005, zc], [s, 0, 0], len - 0.1, hgt - 0.09));
      d.add(
        C.CHROME_L,
        cyl([x + s * 0.05, c.y0 + 0.12, c.z0 - 0.12], [x + s * 0.05, c.y0 + 0.12, c.z1 + 0.12], 0.016, 6),
      );
      for (const z of [c.z0 - 0.14, c.z1 + 0.14])
        d.add(C.CHROME, box([x + s * 0.035, c.y0 + 0.12, z], [0.03, 0.03, 0.03]));
      d.add(C.BLACK, box([x + s * 0.026, c.y0 + 0.055, zc], [0.012, 0.03, len - 0.1]));
    });

  // --------------------------------------------------------------- pump panel (both sides)
  for (const s of SIDES) {
    const p = on(root, "pump");
    const x = s * HALF;
    const o = (d: number) => x + s * d;
    p.add(C.CHROME, box([o(0.01), 1.6, 1.29], [0.02, 1.24, 0.64]));
    p.add(C.STEEL_D, box([o(0.02), 1.58, 1.29], [0.01, 1.14, 0.56]));
    // light hood with panel lamps
    p.add(C.RED_D, box([o(0.06), 2.17, 1.29], [0.1, 0.04, 0.62]));
    p.lit(C.G_WHITE, 1.2, box([o(0.06), 2.145, 1.29], [0.06, 0.012, 0.5]));
    // master gauges and small gauges
    for (const [y, z, r, face] of [
      [1.96, 1.42, 0.075, T.gaugeW],
      [1.96, 1.16, 0.075, T.gaugeY],
      [1.76, 1.47, 0.04, T.gaugeW],
      [1.76, 1.37, 0.04, T.gaugeW],
      [1.76, 1.21, 0.04, T.gaugeW],
      [1.76, 1.11, 0.04, T.gaugeW],
    ] as const) {
      p.add(C.CHROME_L, cyl([o(0.02), y, z], [o(0.045), y, z], r + 0.014, 10));
      on(root, "pump").tex(face, disc([o(0.047), y, z], [s, 0, 0], r, [0, 1, 0], 12));
    }
    // colour-coded valve handles with their tags
    const tags = [C.RED_L, C.YELLOW, C.BLUE, C.ORANGE];
    tags.forEach((tag, i) => {
      const z = 1.5 - i * 0.14;
      p.add(tag, box([o(0.027), 1.62, z], [0.008, 0.05, 0.1]));
      p.add(C.CHROME, cyl([o(0.02), 1.5, z], [o(0.14), 1.5, z], 0.014, 6));
      p.add(C.CHROME_L, box([o(0.14), 1.5, z], [0.025, 0.025, 0.12]));
      p.add(C.BLACK, cyl([o(0.12), 1.5, z - 0.07], [o(0.16), 1.5, z - 0.07], 0.022, 6));
    });
    // discharges with coloured caps
    [C.RED_L, C.BLUE].forEach((cap, i) => {
      const z = 1.44 - i * 0.3;
      const y = 1.3;
      p.add(C.CHROME, cyl([o(0.0), y, z], [o(0.12), y - 0.04, z], 0.045, 8));
      p.add(
        cap,
        lathe(
          [
            [0.06, 0],
            [0.06, 0.04],
            [0.04, 0.06],
            [0, 0.06],
          ],
          6,
          [o(0.12), y - 0.04, z],
          [s, -0.3, 0],
        ),
      );
    });
    // big steamer intake with its cap and chain
    p.add(C.CHROME, cyl([o(0), 1.08, 1.29], [o(0.12), 1.08, 1.29], 0.11, 8));
    p.add(
      C.CHROME_L,
      lathe(
        [
          [0.13, 0],
          [0.13, 0.05],
          [0.08, 0.08],
          [0, 0.08],
        ],
        6,
        [o(0.12), 1.08, 1.29],
        [s, 0, 0],
      ),
    );
    for (let k = 0; k < 4; k++) p.add(C.CHROME, torus([o(0.15), 0.98 - k * 0.04, 1.4], [0, 0, 1], 0.016, 0.005, 3, 6));
    // drain valves and the running board
    for (const z of [1.1, 1.48]) p.add(C.YELLOW, cyl([o(0.02), 1.12, z], [o(0.08), 1.12, z], 0.018, 6));
    p.add(C.CHROME, box([o(0.08), 0.84, 1.29], [0.22, 0.05, 0.66]));
    tread(root, "pump", [o(0.08), 0.868, 1.29], 0.2, 0.64);
    // crosslays: three transverse hose lanes over the pump panel, folds showing at both sides
    const lanes = [
      [1.48, C.BLUE],
      [1.28, C.YELLOW],
      [1.08, C.WHITE],
    ] as const;
    if (s > 0)
      lanes.forEach(([z, col], li) => {
        const h = on(root, "hose");
        for (let k = 0; k < 5; k++) {
          const y = 2.29 + k * 0.06;
          h.add(col, box([0, y, z], [2.34, 0.045, 0.16]));
          for (const e of SIDES)
            if ((k + li + (e > 0 ? 0 : 1)) % 2 === 0)
              h.add(col, cyl([e * 1.17, y + 0.03, z - 0.08], [e * 1.17, y + 0.03, z + 0.08], 0.032, 6));
        }
        // pre-connect nozzles hang at the ends of the top layer
        for (const e of SIDES) {
          h.add(C.CHROME_L, cyl([e * 1.2, 2.6, z], [e * 1.28, 2.55, z], 0.03, 6, 0.04));
          h.add(C.BLACK, box([e * 1.27, 2.5, z], [0.03, 0.08, 0.03]));
        }
      });
    for (const z of [1.38, 1.18, 0.98]) p.add(C.STEEL, box([0, 2.42, z], [2.44, 0.34, 0.02]));
  }

  // --------------------------------------------------------------- top deck: hose bed, suction hoses, rails
  {
    const h = on(root, "hose");
    const lanes = [
      [0.6, C.YELLOW],
      [0.0, C.WHITE],
      [-0.6, C.BLUE],
    ] as const;
    const zf = 0.38;
    const zr = -3.28;
    lanes.forEach(([x, col], li) => {
      for (let k = 0; k < 6; k++) {
        const y = 2.29 + k * 0.058;
        const top = k === 5;
        h.add(col, box([x, y, (zf + zr) / 2], [0.5, 0.05, zf - zr - 0.06]));
        const zEnd = (k + li) % 2 ? zf : zr;
        h.add(col, cyl([x - 0.25, y + 0.029, zEnd], [x + 0.25, y + 0.029, zEnd], 0.03, 6));
        if (top && li !== 1) {
          // pull loops lying on top
          h.add(col, torus([x, y + 0.04, zr + 0.35], [0, 1, 0], 0.16, 0.025, 4, 10));
        }
      }
    });
    for (const x of [0.3, -0.3]) on(root, "body").add(C.STEEL, box([x, 2.44, (zf + zr) / 2], [0.02, 0.36, zf - zr]));
    on(root, "body").add(C.STEEL_D, box([0, 2.26, (zf + zr) / 2], [1.9, 0.02, zf - zr]));
    // hard suction hoses on the band tops
    for (const s of SIDES) {
      const x = s * 1.02;
      h.add(C.BLACK, cyl([x, 2.69, 0.3], [x, 2.69, -2.9], 0.075, 8));
      for (let i = 0; i < 13; i++) {
        const z = 0.15 - i * 0.24;
        h.add(C.RUBBER, cyl([x, 2.69, z], [x, 2.69, z - 0.04], 0.082, 8));
      }
      for (const z of [0.3, -2.9]) h.add(C.CHROME_L, cyl([x, 2.69, z], [x, 2.69, z + (z > 0 ? 0.08 : -0.08)], 0.09, 6));
      for (const z of [-0.5, -2.1])
        on(root, "body").add(C.STEEL_D, torus([x, 2.69, z], [0, 0, 1], 0.085, 0.012, 3, 8, Math.PI));
      // top handrail
      const r = on(root, "body");
      r.add(C.CHROME_L, cyl([s * 1.2, 2.86, 0.85], [s * 1.2, 2.86, -3.3], 0.022, 6));
      for (const z of [0.85, -0.55, -1.95, -3.3]) r.add(C.CHROME, cyl([s * 1.2, 2.62, z], [s * 1.2, 2.86, z], 0.02, 6));
    }
  }

  // --------------------------------------------------------------- booster hose reel
  {
    const j = b.joint("hoseReel", { parent: root, at: [0, 2.84, 0.72], dir: [1, 0, 0] });
    const p = on(j, "reel");
    p.add(C.STEEL_D, cyl([-0.86, 2.84, 0.72], [0.86, 2.84, 0.72], 0.06, 6));
    p.add(C.STEEL_D, cyl([-0.72, 2.84, 0.72], [0.72, 2.84, 0.72], 0.13, 10));
    for (let i = 0; i < 9; i++) {
      const x = -0.64 + i * 0.16;
      p.add(C.RED_L, torus([x, 2.84, 0.72], [1, 0, 0], 0.17, 0.042, 3, 10));
      p.add(C.RED_L, torus([x + 0.08, 2.84, 0.72], [1, 0, 0], 0.22, 0.04, 3, 10));
    }
    for (const e of SIDES) {
      p.add(C.CHROME, cyl([e * 0.74, 2.84, 0.72], [e * 0.78, 2.84, 0.72], 0.29, 12));
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        p.add(
          C.STEEL_D,
          bar([e * 0.8, 2.84, 0.72], [e * 0.8, 2.84 + 0.27 * Math.sin(a), 0.72 + 0.27 * Math.cos(a)], 0.02, 0.04, [
            e,
            0,
            0,
          ]),
        );
      }
    }
    p.add(C.CHROME_L, cyl([0.86, 2.84, 0.72], [0.86, 2.98, 0.72], 0.015, 6));
    p.add(C.BLACK, cyl([0.86, 2.98, 0.72], [0.93, 2.98, 0.72], 0.025, 6));
    const f = on(root, "reel");
    for (const e of SIDES) {
      f.add(
        C.STEEL_D,
        hull([
          [e * 0.82, 2.6, 0.95],
          [e * 0.82, 2.6, 0.49],
          [e * 0.82, 2.86, 0.76],
          [e * 0.82, 2.86, 0.68],
          [e * 0.86, 2.6, 0.95],
          [e * 0.86, 2.6, 0.49],
          [e * 0.86, 2.86, 0.76],
          [e * 0.86, 2.86, 0.68],
        ]),
      );
      f.add(C.STEEL_D, box([e * 0.85, 2.44, 0.72], [0.06, 0.36, 0.5]));
    }
    // hose tail with a booster nozzle resting in a cradle
    f.add(C.RED_L, cyl([0.3, 2.62, 0.48], [0.3, 2.6, 0.18], 0.03, 6));
    f.add(C.CHROME_L, cyl([0.3, 2.6, 0.18], [0.3, 2.58, 0.02], 0.03, 6, 0.045));
    f.add(C.BLACK, box([0.3, 2.58, 0.06], [0.07, 0.04, 0.05]));
    // ladder cradle behind the cab
    for (const e of SIDES) {
      f.add(C.STEEL_D, box([e * 0.525, 2.88, 1.62], [0.08, 0.52, 0.08]));
      f.add(C.BLACK, box([e * 0.525, 3.14, 1.62], [0.14, 0.04, 0.16]));
    }
    f.add(C.STEEL_D, box([0, 2.85, 1.62], [1.0, 0.06, 0.06]));
  }

  // --------------------------------------------------------------- side tools: axes, halligan, ground ladders
  for (const s of SIDES) {
    const x = s * (HALF + 0.03);
    const p = on(root, "tools");
    // brackets
    for (const z of [0.75, 0.0, -0.75, -1.5]) p.add(C.STEEL_D, box([s * (HALF + 0.02), 2.43, z], [0.04, 0.3, 0.04]));
    // pick-head axe: handle forward, head toward the cab
    p.add(C.WOOD, cyl([x + s * 0.03, 2.4, -0.1], [x + s * 0.03, 2.4, 0.78], 0.022, 6));
    p.add(
      C.RED_L,
      hull(
        [
          [0, -0.03, -0.05],
          [0, 0.11, -0.04],
          [0, 0.11, 0.04],
          [0, -0.03, 0.05],
          [0, -0.14, 0],
        ].flatMap(([a, y, z]) => [[a - 0.018, y, z] as V, [a + 0.018, y, z] as V]),
        [x + s * 0.03, 2.4, 0.8],
      ),
    );
    p.add(
      C.CHROME_L,
      hull(
        [
          [0, 0.11, -0.04],
          [0, 0.11, 0.04],
          [0, 0.15, 0.06],
          [0, 0.15, -0.06],
        ].flatMap(([a, y, z]) => [[a - 0.01, y, z] as V, [a + 0.01, y, z] as V]),
        [x + s * 0.03, 2.4, 0.8],
      ),
    );
    p.add(C.STEEL, cyl([x + s * 0.03, 2.37, 0.8], [x + s * 0.03, 2.24, 0.8], 0.02, 4, 0));
    // flat-head axe
    p.add(C.WOOD, cyl([x + s * 0.03, 2.4, -0.95], [x + s * 0.03, 2.4, -0.15], 0.022, 6));
    p.add(C.RED_L, cbox([x + s * 0.03, 2.4, -1.0], [0.04, 0.2, 0.09], 0.01));
    p.add(
      C.CHROME_L,
      hull(
        [
          [0, 0.1, -0.04],
          [0, 0.1, 0.04],
          [0, 0.16, 0.06],
          [0, 0.16, -0.06],
        ].flatMap(([a, y, z]) => [[a - 0.01, y, z] as V, [a + 0.01, y, z] as V]),
        [x + s * 0.03, 2.4, -1.0],
      ),
    );
    // halligan bar
    p.add(C.STEEL, cyl([x + s * 0.03, 2.33, -1.08], [x + s * 0.03, 2.33, -1.7], 0.018, 6));
    p.add(C.STEEL, cyl([x + s * 0.03, 2.33, -1.08], [x + s * 0.03, 2.45, -1.02], 0.016, 4, 0.005));
    p.add(C.STEEL, cyl([x + s * 0.03, 2.33, -1.7], [x + s * 0.03, 2.38, -1.78], 0.02, 4, 0.006));
    // pike pole along the top of the band
    p.add(C.WOOD, cyl([x + s * 0.035, 2.55, -1.65], [x + s * 0.035, 2.55, 0.6], 0.018, 6));
    p.add(C.STEEL, cyl([x + s * 0.035, 2.55, 0.6], [x + s * 0.035, 2.55, 0.86], 0.02, 4, 0.004));
    p.add(C.STEEL, cyl([x + s * 0.035, 2.55, 0.7], [x + s * 0.035, 2.47, 0.64], 0.014, 4, 0.004));
    // straps
    for (const z of [0.45, -0.55, -1.4]) p.add(C.BLACK, box([x + s * 0.045, 2.4, z], [0.02, 0.12, 0.04]));
    // wooden roof ladder lying against the band, hooks at the front end
    const lx = x + s * 0.03;
    for (const y of [2.29, 2.56]) p.add(C.WOOD, cbox([lx, y, -3.25], [0.04, 0.05, 3.0], 0.01));
    for (let i = 0; i < 10; i++) p.add(C.WOOD_D, cyl([lx, 2.29, -1.9 - i * 0.3], [lx, 2.56, -1.9 - i * 0.3], 0.016, 6));
    for (const y of [2.29, 2.56]) {
      p.add(C.CHROME, box([lx, y, -1.76], [0.05, 0.06, 0.04]));
      p.add(C.CHROME, box([lx, y, -4.74], [0.05, 0.06, 0.04]));
      p.add(
        C.CHROME,
        hull([
          [lx - 0.01, y, -1.73],
          [lx + 0.01, y, -1.73],
          [lx - 0.01, y, -1.62],
          [lx + 0.01, y, -1.62],
          [lx - 0.01, y + 0.08, -1.64],
          [lx + 0.01, y + 0.08, -1.64],
        ]),
      );
    }
    for (const z of [-2.2, -3.6, -4.5]) p.add(C.STEEL_D, box([s * (HALF + 0.015), 2.425, z], [0.03, 0.34, 0.05]));
    // scene lights at the top corners of the body
    for (const z of [-4.95]) {
      p.add(C.STEEL_D, cbox([s * (HALF + 0.02), 2.43, z], [0.05, 0.14, 0.34], 0.015));
      p.lit(C.G_WHITE, 1.3, box([s * (HALF + 0.047), 2.43, z], [0.006, 0.1, 0.28]));
    }
    // side marker lights along the body
    for (const z of [0.6, -1.8, -4.4]) p.lit(C.G_AMBER, 1.2, box([s * (HALF + 0.01), 1.02, z], [0.02, 0.05, 0.1]));
  }

  // --------------------------------------------------------------- extinguisher and water can by the pump panels
  {
    const p = on(root, "tools");
    const ext = (c: V) => {
      p.add(
        C.RED_L,
        lathe(
          [
            [0, 0],
            [0.08, 0],
            [0.085, 0.02],
            [0.085, 0.38],
            [0.06, 0.44],
            [0.02, 0.46],
          ],
          8,
          c,
          [0, 1, 0],
        ),
      );
      p.add(C.BLACK, box(add3(c, [0, 0.47, 0]), [0.03, 0.04, 0.12]));
      p.add(C.CHROME_L, box(add3(c, [0, 0.5, -0.02]), [0.02, 0.02, 0.12]));
      p.add(C.BLACK, cyl(add3(c, [0, 0.47, 0.06]), add3(c, [0.06, 0.25, 0.09]), 0.012, 4));
      p.add(
        C.WHITE,
        lathe(
          [
            [0.087, 0],
            [0.087, 0.1],
            [0.0, 0.1],
          ],
          8,
          add3(c, [0, 0.16, 0]),
          [0, 1, 0],
        ),
      );
    };
    ext([1.38, 0.868, 1.12]);
    p.add(
      C.CHROME_L,
      lathe(
        [
          [0, 0],
          [0.1, 0],
          [0.1, 0.42],
          [0.04, 0.48],
          [0.03, 0.5],
          [0, 0.5],
        ],
        8,
        [-1.38, 0.868, 1.12],
        [0, 1, 0],
      ),
    );
    p.add(C.BLACK, box([-1.38, 1.39, 1.12], [0.12, 0.03, 0.03]));
  }

  // --------------------------------------------------------------- wheel chocks and rolled hoses
  {
    const p = on(root, "tools");
    for (const s of SIDES) {
      const x = s * 1.13;
      for (const dz of [0, -0.13]) {
        const z = -1.2 + dz;
        p.add(
          C.YELLOW,
          hull([
            [x - 0.08, 0.5, z + 0.05],
            [x + 0.08, 0.5, z + 0.05],
            [x - 0.08, 0.5, z - 0.05],
            [x + 0.08, 0.5, z - 0.05],
            [x - 0.08, 0.76, z + 0.05],
            [x + 0.08, 0.76, z + 0.05],
            [x - 0.08, 0.68, z - 0.05],
            [x + 0.08, 0.68, z - 0.05],
          ]),
        );
      }
      p.add(C.STEEL_D, box([x, 0.79, -1.265], [0.2, 0.04, 0.3]));
      p.add(C.BLACK, box([x + s * 0.09, 0.62, -1.265], [0.01, 0.04, 0.3]));
    }
    // two rolled hoses lying on the rear deck
    for (const s of SIDES) {
      const c: V = [s * 0.98, 2.615, -4.98];
      for (let k = 0; k < 4; k++) {
        const r0 = 0.05 + k * 0.035;
        p.add(
          k % 2 ? C.WHITE_D : C.WHITE,
          lathe(
            [
              [r0, 0],
              [r0 + 0.035, 0],
              [r0 + 0.035, 0.065],
              [r0, 0.065],
            ],
            10,
            c,
            [0, 1, 0],
          ),
        );
      }
      p.add(C.CHROME_L, cyl(add3(c, [0, 0, 0]), add3(c, [0, 0.07, 0]), 0.05, 6));
      p.add(C.CHROME, cyl(add3(c, [0.0, 0.035, 0.19]), add3(c, [0.0, 0.035, 0.27]), 0.04, 6));
    }
  }

  // --------------------------------------------------------------- rear
  {
    const p = on(root, "rear");
    on(root, "rear").tex(T.chevron, plane([0, 1.7, -5.207], [0, 0, -1], 2.4, 1.6));
    // tail light towers
    for (const s of SIDES) {
      p.add(C.CHROME, cbox([s * 1.1, 1.45, -5.225], [0.22, 1.02, 0.05], 0.015));
      [C.G_RED, C.G_RED, C.G_AMBER, C.G_WHITE].forEach((col, i) => {
        p.lit(col, 1.5, box([s * 1.1, 1.82 - i * 0.24, -5.255], [0.16, 0.18, 0.02]));
      });
      p.add(C.BLACK, box([s * 1.08, 2.42, -5.22], [0.22, 0.14, 0.04]));
      p.lit(C.G_RED, 1.6, box([s * 1.08, 2.42, -5.245], [0.18, 0.1, 0.02]));
    }
    // amber traffic arrow stick
    p.add(C.BLACK, cbox([0.25, 2.43, -5.225], [1.1, 0.12, 0.05], 0.015));
    for (let i = 0; i < 8; i++) p.lit(C.G_AMBER, 1.5, box([-0.22 + i * 0.134, 2.43, -5.25], [0.1, 0.08, 0.02]));
    // tailboard
    p.add(C.CHROME, cbox([0, 0.68, -5.38], [2.5, 0.14, 0.36], 0.02));
    tread(root, "rear", [0, 0.752, -5.38], 2.46, 0.34);
    p.add(C.BLACK, box([0, 0.58, -5.53], [2.3, 0.08, 0.06]));
    on(root, "rear").tex(T.checkRear, plane([0, 0.68, -5.562], [0, 0, -1], 2.5, 0.1));
    for (const s of SIDES) {
      p.add(C.STEEL_D, box([s * 0.6, 0.52, -5.3], [0.1, 0.1, 0.16]));
      p.add(C.CHROME, torus([s * 0.6, 0.44, -5.33], [1, 0, 0], 0.06, 0.02, 4, 8));
    }
    // rear access ladder up to the turntable
    for (const x of [-0.33, -0.77]) p.add(C.CHROME, box([x, 1.75, -5.25], [0.04, 1.7, 0.04]));
    for (let i = 0; i < 6; i++)
      p.add(C.CHROME_L, cyl([-0.33, 1.05 + i * 0.28, -5.27], [-0.77, 1.05 + i * 0.28, -5.27], 0.018, 6));
    for (const x of [-0.33, -0.77]) {
      p.add(C.CHROME_L, cyl([x, 2.6, -5.27], [x, 3.0, -5.1], 0.02, 6));
      p.add(C.CHROME_L, cyl([x, 3.0, -5.1], [x, 3.0, -4.95], 0.02, 6));
    }
    // cones on the tailboard
    for (const [x, n] of [
      [0.92, 2],
      [-1.0, 1],
    ] as const) {
      for (let k = 0; k < n; k++) {
        const y = 0.76 + k * 0.07;
        p.add(C.BLACK, box([x, y + 0.012, -5.38], [0.3, 0.025, 0.3]));
        p.add(
          C.ORANGE,
          lathe(
            [
              [0.12, 0],
              [0.025, 0.42],
              [0, 0.42],
            ],
            8,
            [x, y + 0.02, -5.38],
            [0, 1, 0],
            22.5,
          ),
        );
        p.add(
          C.WHITE,
          lathe(
            [
              [0.09, 0.0],
              [0.07, 0.09],
              [0.0, 0.09],
            ],
            8,
            [x, y + 0.155, -5.38],
            [0, 1, 0],
            22.5,
          ),
        );
      }
    }
    // extinguisher on the tailboard
    const c: V = [-0.12, 0.76, -5.36];
    p.add(
      C.RED_L,
      lathe(
        [
          [0, 0],
          [0.08, 0],
          [0.085, 0.02],
          [0.085, 0.38],
          [0.06, 0.44],
          [0.02, 0.46],
        ],
        8,
        c,
        [0, 1, 0],
      ),
    );
    p.add(C.BLACK, box(add3(c, [0, 0.47, 0]), [0.12, 0.04, 0.03]));
    p.add(C.CHROME_L, box(add3(c, [0.02, 0.5, 0]), [0.12, 0.02, 0.02]));
    p.add(
      C.WHITE,
      lathe(
        [
          [0.087, 0],
          [0.087, 0.1],
          [0.0, 0.1],
        ],
        8,
        add3(c, [0, 0.16, 0]),
        [0, 1, 0],
      ),
    );
    p.add(C.BLACK, cyl(add3(c, [0.05, 0.47, 0]), add3(c, [0.09, 0.2, -0.05]), 0.012, 4));
  }
  // rear compartment door, hinged on its outer edge
  {
    const j = b.joint("doorRear", {
      parent: root,
      at: [0.82, 1.5, -5.215],
      dir: [-1, 0, 0],
      up: [0, 0, -1],
      role: "hinge",
    });
    const p = on(j, "rearDoor");
    p.add(C.RED, cbox([0.43, 1.5, -5.225], [0.76, 1.1, 0.03], 0.01));
    on(j, "rearDoor").tex(T.chevronDoor, plane([0.43, 1.5, -5.242], [0, 0, -1], 0.7, 1.04));
    p.add(C.CHROME_L, box([0.12, 1.5, -5.26], [0.04, 0.2, 0.03]));
    for (const y of [1.1, 1.9]) p.add(C.CHROME, cyl([0.8, y - 0.06, -5.245], [0.8, y + 0.06, -5.245], 0.016, 6));
  }

  // --------------------------------------------------------------- outriggers (H-jacks)
  for (const [tag, z] of [
    ["F", 0.86],
    ["R", -4.6],
  ] as const)
    for (const s of SIDES) {
      const name = `${tag}${sideName(s)}`;
      const beam = b.joint(`outrigger${name}`, { parent: root, at: [s * 0.25, 0.7, z], dir: [s, 0, 0] });
      const p = on(beam, "outrigger");
      p.add(C.STEEL_D, box([s * 0.8, 0.7, z], [1.1, 0.16, 0.18]));
      p.add(C.RED, cbox([s * 1.36, 1.0, z], [0.18, 0.8, 0.22], 0.025));
      on(beam, "outrigger").tex(T.hazardRW, plane([s * 1.452, 1.0, z], [s, 0, 0], 0.18, 0.7));
      p.add(C.CHROME, box([s * 1.36, 1.41, z], [0.2, 0.03, 0.24]));
      p.add(C.STEEL_D, box([s * 1.36, 0.62, z], [0.2, 0.04, 0.24]));
      const jack = b.joint(`jack${name}`, { parent: beam, at: [s * 1.36, 0.6, z], dir: [0, -1, 0] });
      const q = on(jack, "outrigger");
      q.add(C.CHROME_L, cyl([s * 1.36, 0.62, z], [s * 1.36, 0.38, z], 0.06, 8));
      q.add(C.STEEL_D, cbox([s * 1.36, 0.34, z], [0.32, 0.05, 0.32], 0.015));
      q.add(C.YELLOW, box([s * 1.36, 0.37, z], [0.12, 0.02, 0.12]));
      on(root, "outrigger").add(C.STEEL_D, box([0, 0.7, z], [0.5, 0.2, 0.22]));
    }

  // --------------------------------------------------------------- turntable
  const TT: V = [0, 2.75, -4.0];
  {
    const p = on(root, "turntable");
    p.add(
      C.STEEL_D,
      lathe(
        [
          [0, 0],
          [0.95, 0],
          [0.95, 0.14],
          [0, 0.14],
        ],
        12,
        [0, 2.61, TT[2]],
        [0, 1, 0],
        15,
      ),
    );
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      p.add(
        C.STEEL,
        box([0.97 * Math.sin(a), 2.69, TT[2] + 0.97 * Math.cos(a)], [0.05, 0.08, 0.035], [0, a / DEG + 90, 0]),
      );
    }
  }
  const turntable = b.joint("turntable", { parent: root, at: TT, dir: [0, 1, 0] });
  {
    const p = on(turntable, "turntable");
    p.add(
      C.RED,
      lathe(
        [
          [0, 0],
          [1.12, 0],
          [1.12, 0.12],
          [1.08, 0.14],
          [0, 0.14],
        ],
        12,
        TT,
        [0, 1, 0],
        15,
      ),
    );
    on(turntable, "turntable").tex(dplate(20, 20), disc([0, 2.893, TT[2]], [0, 1, 0], 1.06, [0, 0, -1], 12));
    // bolt circle on the turntable deck
    for (let i = 0; i < 20; i++) {
      const a = ((i + 0.5) / 20) * Math.PI * 2;
      p.add(
        C.CHROME_L,
        cyl(
          [0.99 * Math.sin(a), 2.885, TT[2] + 0.99 * Math.cos(a)],
          [0.99 * Math.sin(a), 2.905, TT[2] + 0.99 * Math.cos(a)],
          0.022,
          6,
        ),
      );
    }
    // hazard rim
    for (let i = 0; i < 24; i++) {
      const a = ((i + 0.5) / 24) * Math.PI * 2;
      p.add(
        i % 2 ? C.YELLOW : C.BLACK,
        box([1.125 * Math.sin(a), 2.81, TT[2] + 1.125 * Math.cos(a)], [0.29, 0.06, 0.02], [0, a / DEG, 0]),
      );
    }
    // heel brackets
    for (const s of SIDES) {
      b.extrude(
        [
          [-4.95, 2.88],
          [-3.75, 2.88],
          [-4.05, 3.12],
          [-4.38, 3.36],
          [-4.62, 3.36],
          [-4.9, 3.1],
        ],
        {
          at: [s * 0.68, 0, 0],
          x: [0, 0, 1],
          thickness: 0.07,
          bevel: 0.015,
          detail: 0.34,
          color: C.RED,
          bone: turntable,
          name: `turntable.bracket${sideName(s)}`,
          group: "turntable",
        },
      );
      p.add(C.CHROME_L, cyl([s * 0.6, 3.22, -4.5], [s * 0.76, 3.22, -4.5], 0.07, 8));
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        p.add(
          C.STEEL_D,
          cyl(
            [s * 0.715, 3.22 + 0.11 * Math.sin(a), -4.5 + 0.11 * Math.cos(a)],
            [s * 0.735, 3.22 + 0.11 * Math.sin(a), -4.5 + 0.11 * Math.cos(a)],
            0.018,
            6,
          ),
        );
      }
      // lift-cylinder lower mounts
      p.add(C.STEEL_D, cbox([s * 0.36, 2.96, -3.12], [0.16, 0.16, 0.2], 0.02));
    }
    // operator console at the rear right
    p.add(C.STEEL_D, cbox([-0.72, 3.15, -4.62], [0.24, 0.52, 0.22], 0.03));
    p.add(C.STEEL_D, cbox([-0.72, 3.45, -4.66], [0.5, 0.1, 0.34], 0.025, [-28, 0, 0]));
    p.lit(C.G_CYAN, 1.2, box([-0.62, 3.505, -4.64], [0.18, 0.005, 0.14], [-28, 0, 0]));
    p.add(C.YELLOW, torus([-0.72, 3.5, -4.85], [0, 0, 1], 0.22, 0.018, 4, 8, Math.PI));
    for (const dx of [-0.84, -0.76]) {
      p.add(C.CHROME, cyl([dx, 3.48, -4.7], [dx, 3.6, -4.72], 0.01, 4));
      p.add(C.BLACK, ball([dx, 3.61, -4.72], 0.025));
    }
    p.lit(C.G_RED, 1.4, box([-0.88, 3.475, -4.58], [0.03, 0.01, 0.03], [-28, 0, 0]));
    p.lit(C.G_AMBER, 1.4, box([-0.84, 3.475, -4.58], [0.03, 0.01, 0.03], [-28, 0, 0]));
    // railings around the rear arc of the turntable
    const posts = [110, 135, 160, 200, 225, 250];
    const postAt = (deg: number, y: number): V => [1.04 * Math.sin(deg * DEG), y, TT[2] + 1.04 * Math.cos(deg * DEG)];
    for (const d of posts) p.add(C.CHROME, cyl(postAt(d, 2.89), postAt(d, 3.75), 0.022, 6));
    for (const [a0, a1] of [
      [110, 160],
      [200, 250],
    ])
      for (const y of [3.35, 3.75])
        for (let d = a0; d < a1; d += 25) p.add(C.CHROME_L, cyl(postAt(d, y), postAt(d + 25, y), 0.02, 6));
  }

  // --------------------------------------------------------------- aerial ladder
  const PIVOT: V = [0, 3.22, -4.5];
  const ladderBase = b.joint("ladderBase", { parent: turntable, at: PIVOT, dir: [0, 0, 1] });
  const secs = [0, 1, 2, 3].map((k) => ({
    k,
    yb: 3.22 + k * 0.07,
    h: 0.6 - k * 0.07,
    hw: 0.525 - k * 0.07,
    z0: -4.62 + k * 0.25,
    z1: 4.3 + k * 0.1,
  }));
  const ladderJoints: Joint[] = [ladderBase];
  for (let k = 1; k < 4; k++) {
    const s = secs[k];
    ladderJoints.push(b.joint(`ladderFly${k}`, { parent: ladderJoints[k - 1], at: [0, s.yb, s.z0], dir: [0, 0, 1] }));
  }
  for (const s of secs) {
    const j = ladderJoints[s.k];
    const p = on(j, "ladder");
    const L = s.z1 - s.z0;
    const zc = (s.z0 + s.z1) / 2;
    const railW = s.k === 0 ? 0.08 : 0.06;
    for (const e of SIDES) {
      const x = e * s.hw;
      p.add(C.WHITE, box([x, s.yb, zc], [railW, s.k === 0 ? 0.13 : 0.1, L]));
      p.add(C.WHITE, box([x, s.yb + s.h, zc], [0.05, 0.05, L]));
      const n = Math.round(L / 0.62);
      const zs = Array.from({ length: n + 1 }, (_, i) => s.z0 + 0.12 + (i * (L - 0.24)) / n);
      for (const z of zs) p.add(C.WHITE_D, box([x, s.yb + s.h / 2, z], [0.03, s.h, 0.03]));
      for (let i = 0; i < n; i++) {
        const up = i % 2 === 0;
        p.add(
          C.CHROME,
          cyl([x, s.yb + (up ? 0.03 : s.h - 0.03), zs[i]], [x, s.yb + (up ? s.h - 0.03 : 0.03), zs[i + 1]], 0.014, 4),
        );
      }
      // end caps
      p.add(C.RED_D, box([x, s.yb + s.h, s.z1 + 0.01], [0.055, 0.055, 0.03]));
    }
    const m = Math.round((L - 0.2) / 0.36);
    for (let i = 0; i <= m; i++) {
      const z = s.z0 + 0.1 + (i * (L - 0.2)) / m;
      p.add(C.CHROME_L, cyl([-s.hw, s.yb + 0.035, z], [s.hw, s.yb + 0.035, z], 0.022, 6));
    }
    // guide shoes at the heel of each fly
    if (s.k > 0) for (const e of SIDES) p.add(C.BLACK, box([e * (s.hw + 0.05), s.yb, s.z0 + 0.15], [0.04, 0.06, 0.2]));
  }
  {
    // base section: heel plates, waterway, lift-cylinder ears, gold number
    const base = secs[0];
    const p = on(ladderBase, "ladder");
    for (const e of SIDES) {
      p.add(
        C.RED,
        hull([
          [e * 0.52, 3.12, -4.62],
          [e * 0.52, 3.85, -4.62],
          [e * 0.52, 3.85, -4.1],
          [e * 0.52, 3.12, -3.4],
          [e * 0.57, 3.12, -4.62],
          [e * 0.57, 3.85, -4.62],
          [e * 0.57, 3.85, -4.1],
          [e * 0.57, 3.12, -3.4],
        ]),
      );
      p.add(C.CHROME, cyl([e * 0.52, 3.22, -4.5], [e * 0.6, 3.22, -4.5], 0.05, 8));
      // rivet rows along the heel plate edges
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        const y = 3.2 + t * 0.58;
        const z = -3.55 - t * 0.57;
        p.add(C.RED_D, cyl([e * 0.57, y, z], [e * 0.582, y, z], 0.016, 5));
      }
      for (let k = 0; k <= 4; k++)
        p.add(C.RED_D, cyl([e * 0.57, 3.79, -4.2 - k * 0.09], [e * 0.582, 3.79, -4.2 - k * 0.09], 0.016, 5));
      for (let k = 0; k <= 5; k++)
        p.add(C.RED_D, cyl([e * 0.57, 3.24 + k * 0.1, -4.57], [e * 0.582, 3.24 + k * 0.1, -4.57], 0.016, 5));
      on(ladderBase, "ladder").tex(T.num42, plane([e * 0.575, 3.5, -4.22], [e, 0, 0], 0.36, 0.3));
      p.add(C.STEEL_D, cbox([e * 0.36, 3.13, -1.5], [0.12, 0.14, 0.24], 0.02));
      // tip lights on the base section
      p.lit(C.G_WHITE, 1.3, box([e * base.hw, base.yb + base.h + 0.05, base.z1 - 0.1], [0.06, 0.04, 0.08]));
    }
    p.add(C.CHROME, cyl([0, 3.12, -4.4], [0, 3.12, 4.1], 0.06, 8));
    for (let i = 0; i < 6; i++) p.add(C.STEEL_D, torus([0, 3.12, -3.6 + i * 1.5], [0, 0, 1], 0.065, 0.015, 3, 8));
    // work lights along the base section
    for (const e of SIDES)
      for (const z of [0.6, -2.4]) {
        p.add(C.STEEL_D, cbox([e * (secs[0].hw + 0.06), 3.25, z], [0.05, 0.1, 0.22], 0.015));
        p.lit(C.G_WHITE, 1.3, box([e * (secs[0].hw + 0.087), 3.25, z], [0.006, 0.07, 0.18]));
      }
  }
  {
    // fly tip: tip guard, lights, waterway and monitor nozzle
    const tip = secs[3];
    const fly = ladderJoints[3];
    const p = on(fly, "ladder");
    p.add(C.RED, cbox([0, tip.yb + 0.02, tip.z1 + 0.04], [tip.hw * 2 + 0.08, 0.1, 0.08], 0.02));
    for (const e of SIDES) {
      p.add(C.RED, cbox([e * tip.hw, tip.yb + tip.h / 2, tip.z1 + 0.04], [0.06, tip.h + 0.08, 0.08], 0.015));
      p.lit(C.G_WHITE, 1.4, box([e * tip.hw, tip.yb + tip.h + 0.06, tip.z1 + 0.02], [0.07, 0.05, 0.06]));
      p.lit(C.G_RED, 1.4, box([e * (tip.hw + 0.035), tip.yb + tip.h / 2, tip.z1 + 0.04], [0.01, 0.08, 0.05]));
    }
    p.add(C.CHROME, cyl([0, tip.yb - 0.04, tip.z1 - 1.2], [0, tip.yb - 0.04, tip.z1 + 0.02], 0.05, 8));
    const nz = b.joint("nozzle", { parent: fly, at: [0, tip.yb + 0.1, tip.z1 + 0.12], dir: [0, 0, 1] });
    const q = on(nz, "nozzle");
    q.add(C.RED_L, cyl([0, tip.yb - 0.04, tip.z1 + 0.04], [0, tip.yb + 0.1, tip.z1 + 0.12], 0.055, 8));
    q.add(C.RED_L, ball([0, tip.yb + 0.1, tip.z1 + 0.12], 0.075));
    q.add(
      C.CHROME_L,
      lathe(
        [
          [0.06, 0],
          [0.055, 0.22],
          [0.035, 0.3],
          [0.045, 0.32],
          [0.045, 0.36],
          [0, 0.36],
        ],
        8,
        [0, tip.yb + 0.1, tip.z1 + 0.12],
        [0, -0.25, 1],
      ),
    );
    q.add(C.BLACK, cyl([0, tip.yb + 0.12, tip.z1 + 0.2], [0, tip.yb + 0.24, tip.z1 + 0.18], 0.012, 4));
  }
  // lift cylinders: barrels on their own joints, rods on the ladder base
  for (const e of SIDES) {
    const lo: V = [e * 0.36, 2.98, -3.12];
    const hi: V = [e * 0.36, 3.11, -1.5];
    const j = b.joint(`lift${sideName(e)}`, { parent: turntable, at: lo, aim: hi });
    const d = v3(hi).sub(v3(lo)).normalize();
    const along = (t: number): V => [lo[0] + d.x * t, lo[1] + d.y * t, lo[2] + d.z * t];
    on(j, "lift").add(C.STEEL_D, cyl(lo, along(0.95), 0.08, 8));
    on(j, "lift").add(C.CHROME, cyl(along(0.92), along(1.0), 0.09, 8));
    on(ladderBase, "lift").add(C.CHROME_L, cyl(along(0.9), hi, 0.04, 6));
  }

  // --------------------------------------------------------------- flush buckets into parts
  const colorNames = new Map<string, string>(Object.entries(C).map(([k, v]) => [v, k.toLowerCase()]));
  let ti = 0;
  for (const bk of buckets.values()) {
    const geo = mergeGeometries(bk.geos);
    if (!geo) throw new Error(`merge failed for ${bk.group} ${bk.color}`);
    const label = bk.texture ? `tex${ti++}` : (colorNames.get(bk.color) ?? bk.color);
    const name = `${bk.group}.${bk.joint.name}.${label}${bk.lit ? ".glow" : ""}`;
    const part = bk.texture
      ? b.part(geo, bk.color, { bone: bk.joint, at: [0, 0, 0], texture: bk.texture, group: bk.group, name })
      : b.part(geo, bk.color, { bone: bk.joint, at: [0, 0, 0], flat: true, group: bk.group, name });
    if (bk.lit) glow(part, bk.lit);
  }
  return b.root;
}
