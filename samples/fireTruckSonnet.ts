import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { aim, DEG, rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import type { PartOptions } from "../src/parts";
import { gradient, mottle, paint, stripes } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Vintage Fire Truck",
  description:
    "A chubby 1920s hook-and-ladder fire engine: smiling brass grille, goggle-eyed headlamps, a firefighter with a handlebar moustache, a dalmatian co-pilot and a cat waiting at the top of the ladder.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------------
const RED = "#d92b1e";
const RED_L = "#ef4d2c";
const RED_D = "#9f1a14";
const CREAM = "#f6e8c0";
const GOLD = "#f4b92e";
const BRASS = "#d79a34";
const BRASS_D = "#9b6a24";
const BLACK = "#2a2322";
const CHAR = "#463d3b";
const STEEL = "#8a8583";
const STEEL_L = "#c9c4be";
const TIRE = "#3a3231";
const TREAD = "#2a2322"
const FENDER = "#b81f17";
const WOOD = "#dba556";
const WOOD_D = "#a8702f";
const LEATHER = "#8b4f2b";
const LEATHER_D = "#6a3a20";
const LAMP = "#fff0a0";
const REDLAMP = "#e82413";
const SKIN = "#f4bd9a";
const PINK = "#f08a85";
const NAVY = "#2c3b6e";
const YEL = "#ffd23a";
const WHITE = "#fbf6ec";
const ORANGE = "#f09a3a";
const ORANGE_D = "#c2681f";
const GREENEYE = "#8fe06b";
const HOSE = "#e9d9a8";
const SUCTION = "#b9873f";
const MOUSTACHE = "#6d3f22";

type P3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "fireTruck", paintSize: 1024 });

  // ---- skeleton -----------------------------------------------------------------------------------------------
  const WX = 0.95; // wheel centre x
  const FZ = 1.7; // front axle z
  const RZ = -1.4; // rear axle z
  const WR = 0.54; // wheel radius
  const chassis = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });

  const side = (s: number) => (s > 0 ? "L" : "R");
  const kingpin: Record<string, Joint> = {};
  const wheelF: Record<string, Joint> = {};
  const wheelR: Record<string, Joint> = {};
  const door: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const n = side(s);
    kingpin[n] = b.joint(`kingpin${n}`, { parent: chassis, at: [s * WX, WR, FZ], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
    wheelF[n] = b.joint(`wheelF${n}`, { parent: kingpin[n], at: [s * WX, WR, FZ], dir: [0, 1, 0], role: "hinge" });
    wheelR[n] = b.joint(`wheelR${n}`, { parent: chassis, at: [s * WX, WR, RZ], dir: [0, 1, 0], role: "hinge" });
    door[n] = b.joint(`door${n}`, { parent: chassis, at: [s * 0.9, 1.0, 0.97], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
  }
  const COL_BASE: P3 = [0.38, 1.22, 1.12];
  const WHEEL_C: P3 = [0.38, 1.58, 0.9];
  const colDir: P3 = [WHEEL_C[0] - COL_BASE[0], WHEEL_C[1] - COL_BASE[1], WHEEL_C[2] - COL_BASE[2]];
  const steering = b.joint("steeringWheel", { parent: chassis, at: WHEEL_C, dir: colDir });
  const bell = b.joint("bell", { parent: chassis, at: [0, 2.27, 1.55], dir: [0, -1, 0], role: "hinge" });

  // ladder: turntable (yaw), lift (pitch), fly section (slides)
  const LA = 8 * DEG; // rest elevation
  const PIV: P3 = [0, 2.3, -1.55];
  const W = new THREE.Vector3(0, Math.sin(LA), Math.cos(LA));
  const V = new THREE.Vector3(0, Math.cos(LA), -Math.sin(LA));
  const Lp = (u: number, v: number, w: number): P3 => [
    PIV[0] + u,
    PIV[1] + V.y * v + W.y * w,
    PIV[2] + V.z * v + W.z * w,
  ];
  const turntable = b.joint("turntable", { parent: chassis, at: [0, 2.14, -1.55], dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
  const ladderLift = b.joint("ladderLift", { parent: turntable, at: PIV, dir: [0, W.y, W.z], role: "hinge" });
  const ladderFly = b.joint("ladderFly", { parent: ladderLift, at: Lp(0, 0.18, 1.4), dir: [0, W.y, W.z], role: "hinge" });

  // ---- helpers ------------------------------------------------------------------------------------------------
  const rb = (w: number, h: number, d: number, r = 0.04, seg = r > 0.07 ? 2 : 1) =>
    new RoundedBoxGeometry(w, h, d, seg, Math.max(0.002, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)));
  const put = (geo: THREE.BufferGeometry, color: Fill, at: P3, o: Partial<PartOptions> = {}) =>
    b.part(geo, color, { bone: chassis, at, ...o });
  const cyl = (a: P3, c: P3, r0: number, r1 = r0, seg = 8) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1);
    g.applyQuaternion(aim(d));
    g.translate((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2);
    return g;
  };
  const bags = new Map<string, { bone: Joint; color: string; geos: THREE.BufferGeometry[] }>();
  const bag = (bone: Joint, color: string, g: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    let e = bags.get(key);
    if (!e) bags.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(g.index ? g.toNonIndexed() : g);
  };
  const bbox = (bone: Joint, color: string, size: P3, at: P3, rot: P3 = [0, 0, 0], r = 0) => {
    const g = r > 0 ? rb(size[0], size[1], size[2], r, 1) : new THREE.BoxGeometry(size[0], size[1], size[2]);
    g.rotateX(rot[0] * DEG).rotateY(rot[1] * DEG).rotateZ(rot[2] * DEG);
    bag(bone, color, g.translate(at[0], at[1], at[2]));
  };
  const bball = (bone: Joint, color: string, r: number, at: P3, seg = 8, sc: P3 = [1, 1, 1]) => {
    const g = new THREE.SphereGeometry(r, seg, Math.max(3, Math.round(seg * 0.6)));
    g.scale(sc[0], sc[1], sc[2]);
    bag(bone, color, g.translate(at[0], at[1], at[2]));
  };
  const decal = (tex: THREE.Texture, at: P3, dir: P3, w: number, h: number, bone: Joint = chassis) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---- paints & drawings --------------------------------------------------------------------------------------
  const BODY = gradient(RED_D, mottle(RED, RED_L, { size: 0.55, contrast: 0.6, seed: 4 }), [0, 0.85, 0], [0, 1.55, 0]);
  const TREADBOARD = paint((p) => (Math.floor((p.z + 5) / 0.06) % 2 ? "#3b3331" : "#262020"));
  const FLOORBOARD = paint((p) => (Math.floor((p.x + 5) / 0.14) % 2 ? WOOD_D : "#94621f"));

  const hoodSide = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
      <rect x="3" y="3" width="194" height="94" rx="16" fill="none" stroke="#f4b92e" stroke-width="4"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${102 + i * 10}" y1="22" x2="${102 + i * 10}" y2="78" stroke="#7d130f" stroke-width="5" stroke-linecap="round"/>`).join("")}
      <path d="M20 66 C22 30 62 24 72 46 C78 62 56 72 50 56 C46 46 58 40 62 48" fill="none" stroke="#f4b92e" stroke-width="4" stroke-linecap="round"/>
      <circle cx="26" cy="72" r="5" fill="#f4b92e"/>
    </svg>`,
    { size: 256 },
  );
  const roundel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#f4b92e"/>
      <circle cx="50" cy="50" r="39" fill="#f6e8c0"/>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#d92b1e" stroke-width="3"/>
      <text x="50" y="68" font-size="52" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#d92b1e">7</text>
    </svg>`,
    { size: 128 },
  );
  const flame = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#9f1a14"/>
      <circle cx="50" cy="50" r="42" fill="#f4b92e"/>
      <path d="M50 12 C58 30 78 38 75 60 C73 78 60 88 50 88 C38 88 25 78 27 60 C28 50 36 46 40 36 C44 42 47 44 50 47 C52 36 47 24 50 12 Z" fill="#d92b1e"/>
      <path d="M50 44 C56 54 66 58 64 68 C63 77 56 82 50 82 C43 82 37 77 37 68 C37 62 44 58 46 52 C48 54 49 55 50 56 Z" fill="#ffd23a"/>
    </svg>`,
    { size: 128 },
  );
  const shutter = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#e9dcc0"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="0" y="${i * 4 + 3}" width="64" height="1.6" fill="#b9a77f"/>`).join("")}
      <rect x="0" y="0" width="4" height="64" fill="#c9b78f"/><rect x="60" y="0" width="4" height="64" fill="#c9b78f"/>
      <rect x="0" y="55" width="64" height="9" fill="#d79a34"/>
      <rect x="20" y="58" width="24" height="3.5" rx="1.7" fill="#7a521b"/>
    </svg>`,
    { size: 128 },
  );
  const gauges = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 56">
      <rect width="150" height="56" rx="6" fill="#6a3a20"/>
      ${[28, 75, 122].map((cx, i) => `<circle cx="${cx}" cy="28" r="20" fill="#d79a34"/><circle cx="${cx}" cy="28" r="16" fill="#f6e8c0"/><line x1="${cx}" y1="28" x2="${cx + [8, -5, 11][i]}" y2="${[18, 15, 24][i]}" stroke="#9f1a14" stroke-width="2.4" stroke-linecap="round"/><circle cx="${cx}" cy="28" r="2.6" fill="#2a2322"/>`).join("")}
    </svg>`,
    { size: 192 },
  );
  const pumpPanel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <rect width="160" height="100" rx="8" fill="#d79a34"/>
      <rect x="5" y="5" width="150" height="90" rx="6" fill="#9b6a24"/>
      ${[42, 118].map((cx) => `<circle cx="${cx}" cy="38" r="26" fill="#f4b92e"/><circle cx="${cx}" cy="38" r="21" fill="#f6e8c0"/><path d="M${cx - 15} 44 A17 17 0 0 1 ${cx + 15} 44" fill="none" stroke="#d92b1e" stroke-width="3"/><line x1="${cx}" y1="38" x2="${cx + (cx < 80 ? 10 : -9)}" y2="25" stroke="#2a2322" stroke-width="2.6" stroke-linecap="round"/><circle cx="${cx}" cy="38" r="3" fill="#2a2322"/>`).join("")}
      <circle cx="80" cy="30" r="9" fill="#d92b1e"/><rect x="77" y="22" width="6" height="16" rx="2" fill="#f6e8c0"/>
      <text x="80" y="88" font-size="15" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#f6e8c0">PUMP</text>
    </svg>`,
    { size: 256 },
  );
  const wheelFace = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#d92b1e"/>
      <circle cx="50" cy="50" r="43" fill="#f6e8c0"/>
      ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 50 50)"><rect x="46.5" y="10" width="7" height="28" rx="3" fill="#dba556" stroke="#a8702f" stroke-width="1.5"/></g>`).join("")}
      <circle cx="50" cy="50" r="41" fill="none" stroke="#a8702f" stroke-width="2"/>
      <circle cx="50" cy="50" r="15" fill="#f4b92e"/>
      ${Array.from({ length: 6 }, (_, i) => `<circle cx="${50 + 10 * Math.cos(i * 1.047)}" cy="${50 + 10 * Math.sin(i * 1.047)}" r="2" fill="#9b6a24"/>`).join("")}
    </svg>`,
    { size: 192 },
  );
  const glint = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
      <rect width="100" height="40" fill="#bfe9ef"/>
      <polygon points="14,40 30,0 40,0 24,40" fill="#ffffff" opacity="0.85"/>
      <polygon points="46,40 56,0 60,0 50,40" fill="#ffffff" opacity="0.85"/>
    </svg>`,
    { size: 128 },
  );
  const plate = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40">
      <rect width="80" height="40" rx="5" fill="#f6e8c0"/><rect x="3" y="3" width="74" height="34" rx="3" fill="none" stroke="#d92b1e" stroke-width="2"/>
      <text x="40" y="27" font-size="19" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#d92b1e">FIRE 7</text>
    </svg>`,
    { size: 128 },
  );
  const name = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
      <text x="100" y="29" font-size="27" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#f4b92e" stroke="#9f1a14" stroke-width="0.8">ENGINE CO. 7</text>
    </svg>`,
    { size: 384 },
  );

  // ---- chassis ------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    bbox(chassis, BLACK, [0.13, 0.2, 5.3], [s * 0.5, 0.72, -0.1], [0, 0, 0], 0.03);
    bbox(chassis, CHAR, [0.03, 0.1, 5.0], [s * 0.57, 0.73, -0.1]);
  }
  for (const z of [-2.55, -1.4, -0.3, 0.6, 1.3, 2.2]) bbox(chassis, BLACK, [1.0, 0.1, 0.12], [0, 0.72, z]);
  // springs
  for (const s of [1, -1])
    for (const z of [FZ, RZ])
      for (let i = 0; i < 4; i++) {
        const len = 1.2 - i * 0.22;
        bbox(chassis, i % 2 ? CHAR : BLACK, [0.1, 0.028, len], [s * 0.8, 0.64 - i * 0.03 + 0.09, z]);
      }
  // axles, differential, driveshaft
  bag(chassis, STEEL, cyl([-WX, WR, FZ], [WX, WR, FZ], 0.05, 0.05, 8));
  bag(chassis, STEEL, cyl([-WX, WR, RZ], [WX, WR, RZ], 0.06, 0.06, 8));
  bball(chassis, STEEL, 0.2, [0, WR, RZ], 10);
  bag(chassis, CHAR, cyl([0, 0.66, RZ + 0.1], [0, 0.66, 1.0], 0.04, 0.04, 6));
  // muffler & exhaust on the right
  bag(chassis, STEEL, cyl([-0.66, 0.5, 0.8], [-0.66, 0.5, -0.4], 0.11, 0.11, 10));
  bag(chassis, BRASS_D, cyl([-0.66, 0.5, 0.8], [-0.66, 0.5, 0.74], 0.125, 0.125, 10));
  bag(chassis, BRASS_D, cyl([-0.66, 0.5, -0.4], [-0.66, 0.5, -0.46], 0.125, 0.125, 10));
  bag(chassis, STEEL, cyl([-0.66, 0.55, 0.8], [-0.66, 0.6, 1.4], 0.04, 0.04, 6));
  bag(chassis, STEEL, cyl([-0.66, 0.5, -0.46], [-0.66, 0.46, -0.75], 0.05, 0.035, 6));
  // gas tank under the seat
  put(rb(0.9, 0.3, 0.7, 0.1), CHAR, [0.1, 0.62, 0.0]);

  // ---- wheels -------------------------------------------------------------------------------------------------
  const wheel = (s: number, bone: Joint, cz: number) => {
    const cx = s * WX;
    const cy = WR;
    const tirePaint = paint((p) => {
      const ax = Math.abs(p.x - cx);
      const rho = Math.hypot(p.y - cy, p.z - cz);
      return ax > 0.075 && rho > 0.27 && rho < 0.39 ? CREAM : TIRE;
    });
    const tire = new THREE.TorusGeometry(0.4, 0.14, 8, 20).rotateY(Math.PI / 2).translate(cx, cy, cz);
    b.part(tire, tirePaint, { bone, at: [0, 0, 0] });
    for (let i = 0; i < 20; i++) {
      const th = (i / 20) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.24, 0.05, 0.11);
      g.rotateX(Math.PI / 2 - th);
      bag(bone, TREAD, g.translate(cx, cy + Math.sin(th) * 0.525, cz + Math.cos(th) * 0.525));
    }
    bag(bone, CREAM, new THREE.CylinderGeometry(0.3, 0.3, 0.26, 16).rotateZ(Math.PI / 2).translate(cx, cy, cz));
    b.part(new THREE.CircleGeometry(0.3, 18), "#ffffff", { bone, at: [cx + s * 0.132, cy, cz], dir: [s, 0, 0], axis: "z", texture: wheelFace });
    b.part(new THREE.SphereGeometry(0.075, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), BRASS, { bone, at: [cx + s * 0.14, cy, cz], dir: [s, 0, 0] });
    bag(bone, BRASS_D, new THREE.CylinderGeometry(0.095, 0.095, 0.02, 10).rotateZ(Math.PI / 2).translate(cx + s * 0.135, cy, cz));
  };
  for (const s of [1, -1]) {
    wheel(s, wheelF[side(s)], FZ);
    wheel(s, wheelR[side(s)], RZ);
  }

  // ---- fenders, running boards, aprons --------------------------------------------------------------------------
  const fender = (s: number, cz: number, a0: number, a1: number, width: number) => {
    const pts: OutlinePoint[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * DEG;
      pts.push([Math.cos(a) * 0.68, Math.sin(a) * 0.68]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (a0 + ((a1 - a0) * i) / n) * DEG;
      pts.push([Math.cos(a) * 0.6, Math.sin(a) * 0.6]);
    }
    b.extrude(pts, { at: [s * WX, WR, cz], x: [0, 0, 1], y: [0, 1, 0], thickness: width, bevel: 0.04, detail: 0.7, color: FENDER, bone: chassis });
  };
  for (const s of [1, -1]) {
    fender(s, FZ, -30, 215, 0.4);
    fender(s, RZ, -28, 208, 0.36);
    // fender gold piping
    const pipe = (cz: number, a0: number, a1: number, w: number) => {
      const pts: P3[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = (a0 + ((a1 - a0) * i) / 12) * DEG;
        pts.push([s * WX + s * (w / 2 + 0.005), WR + Math.sin(a) * 0.645, cz + Math.cos(a) * 0.645]);
      }
      b.sweep(catmull(pts), 0.016, { color: GOLD, bone: chassis, sides: 5, caps: "round" });
    };
    pipe(FZ, -26, 210, 0.4);
    pipe(RZ, -24, 204, 0.36);
    // running board + tread
    put(rb(0.42, 0.07, 1.05, 0.025), TREADBOARD, [s * 1.03, 0.76, 0.55]);
    put(rb(0.04, 0.12, 1.05, 0.015), BRASS, [s * 1.255, 0.76, 0.55]);
    // front apron between hood and fender
    put(rb(0.4, 0.07, 1.25, 0.03), BLACK, [s * 0.68, 0.9, 1.78]);
    put(rb(0.08, 0.3, 1.2, 0.03), BLACK, [s * 0.56, 0.82, 1.78]);
    // fender braces
    bag(chassis, BLACK, cyl([s * 0.7, 1.0, 2.0], [s * 0.92, 1.12, 2.2], 0.02, 0.02, 5));
    bag(chassis, BLACK, cyl([s * 0.7, 1.0, 1.5], [s * 0.92, 1.18, 1.7], 0.02, 0.02, 5));
    // mud flaps
    put(rb(0.34, 0.26, 0.03, 0.01), BLACK, [s * WX, 0.32, RZ - 0.66]);
    put(rb(0.1, 0.1, 0.035, 0.01), GOLD, [s * WX, 0.37, RZ - 0.66]);
  }

  // ---- hood, radiator, grille ---------------------------------------------------------------------------------------
  put(rb(1.2, 0.92, 1.22, 0.24, 4), BODY, [0, 1.42, 1.79], { name: "hood" });
  for (const s of [1, -1]) {
    decal(hoodSide, [s * 0.607, 1.42, 1.79], [s, 0, 0], 0.78, 0.4);
  }
  b.rod([0, 1.89, 1.3], [0, 1.89, 2.25], 0.018, { color: BRASS, bone: chassis, sides: 5 });
  // hood hinge strap tabs
  for (let i = 0; i < 4; i++) bbox(chassis, BRASS, [0.06, 0.02, 0.06], [0, 1.885, 1.45 + i * 0.25]);
  // radiator shell
  const shell: OutlinePoint[] = [
    [-0.55, 0.95],
    [0.55, 0.95],
    [0.58, 1.55],
    [0.4, 1.9],
    [0, 2.0],
    [-0.4, 1.9],
    [-0.58, 1.55],
  ];
  b.extrude(shell, { at: [0, 0, 2.37], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.16, bevel: 0.05, smoothing: 2, color: BRASS, bone: chassis, name: "radiatorShell" });
  const core: OutlinePoint[] = shell.map(([x, y]) => [x * 0.78, 0.98 + (y - 0.95) * 0.86] as OutlinePoint);
  const grillePaint = paint((_p, n, s) => {
    if (n.z < 0.5) return BRASS_D;
    const slat = Math.floor((s[0] + 5) / 0.055) % 2;
    return slat ? "#ffd86a" : "#7a1510";
  });
  b.extrude(core, { at: [0, 0, 2.455], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, smoothing: 2, color: grillePaint, bone: chassis, name: "grille" });
  bbox(chassis, BRASS, [0.92, 0.035, 0.03], [0, 1.42, 2.485], [0, 0, 0], 0.01);
  decal(flame, [0, 1.42, 2.5], [0, 0, 1], 0.26, 0.26);
  // radiator cap & motometer
  put(new THREE.CylinderGeometry(0.05, 0.07, 0.07, 8), BRASS_D, [0, 2.02, 2.37]);
  put(new THREE.SphereGeometry(0.09, 8, 6), BRASS, [0, 2.12, 2.37]);
  put(new THREE.SphereGeometry(0.05, 8, 5), REDLAMP, [0, 2.2, 2.37], { scale: [1, 1.1, 1] });
  for (const s of [1, -1])
    put(new THREE.BoxGeometry(0.16, 0.012, 0.07), BRASS, [s * 0.13, 2.14, 2.37], { rotation: [0, 0, -s * 25] });

  // headlamps (the eyes)
  for (const s of [1, -1]) {
    const c: P3 = [s * 0.83, 1.58, 2.27];
    put(new THREE.SphereGeometry(0.21, 10, 8), BRASS, c, { scale: [1, 1, 0.8] });
    put(new THREE.TorusGeometry(0.17, 0.028, 5, 12), BRASS_D, [c[0], c[1], c[2] + 0.145]);
    glow(put(new THREE.SphereGeometry(0.165, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), LAMP, [c[0], c[1], c[2] + 0.13], { dir: [0, 0, 1], scale: [1, 0.55, 1] }), 1.3);
    put(new THREE.SphereGeometry(0.035, 6, 4), WHITE, [c[0] - s * 0.04, c[1] + 0.05, c[2] + 0.2]);
    put(new THREE.SphereGeometry(0.02, 6, 4), WHITE, [c[0] + s * 0.02, c[1] - 0.035, c[2] + 0.2]);
    // bracket & stalk
    b.rod([s * 0.55, 1.5, 2.33], [s * 0.66, 1.55, 2.3], 0.03, { color: BRASS_D, bone: chassis, sides: 6 });
    b.rod([s * 0.83, 1.4, 2.25], [s * 0.85, 0.9, 2.2], 0.04, { color: BRASS_D, bone: chassis, sides: 6 });
  }

  // bumper (the smile)
  const smile = catmull([
    [-1.0, 0.86, 2.55],
    [-0.62, 0.66, 2.7],
    [0, 0.6, 2.75],
    [0.62, 0.66, 2.7],
    [1.0, 0.86, 2.55],
  ]);
  b.sweep(smile, 0.065, { color: BRASS, bone: chassis, sides: 8, caps: "round", name: "bumper" });
  for (const x of [-1.0, 1.0]) put(new THREE.SphereGeometry(0.1, 8, 6), GOLD, [x, 0.87, 2.55]);
  for (const s of [1, -1]) b.rod([s * 0.4, 0.7, 2.25], [s * 0.45, 0.66, 2.66], 0.035, { color: BRASS_D, bone: chassis, sides: 6 });
  // crank handle
  b.rod([0, 0.78, 2.4], [0, 0.74, 2.78], 0.025, { color: STEEL, bone: chassis, sides: 6 });
  put(new THREE.SphereGeometry(0.05, 6, 4), WOOD, [0, 0.74, 2.8]);
  decal(plate, [0, 0.85, 2.46], [0, 0, 1], 0.3, 0.15);
  // brass klaxon horn on the hood
  b.sweep(
    catmull([
      [-0.4, 1.84, 1.38],
      [-0.4, 2.08, 1.36],
      [-0.4, 2.2, 1.56],
      [-0.4, 2.13, 1.8],
    ]),
    [0.03, 0.04],
    { color: BRASS, bone: chassis, sides: 8, caps: "flat", name: "horn" },
  );
  bag(chassis, BRASS, cyl([-0.4, 2.13, 1.8], [-0.4, 2.1, 2.1], 0.04, 0.15, 10));
  bag(chassis, BRASS_D, cyl([-0.4, 2.1, 2.1], [-0.4, 2.1, 2.12], 0.16, 0.16, 10));
  put(new THREE.SphereGeometry(0.06, 6, 5), BLACK, [-0.4, 1.86, 1.38]);

  // ---- cab ----------------------------------------------------------------------------------------------------
  put(rb(1.74, 0.06, 1.2, 0.02), FLOORBOARD, [0, 0.9, 0.6]);
  put(rb(1.76, 0.72, 0.16, 0.08), BODY, [0, 1.31, 1.2], { name: "cowl" });
  bbox(chassis, BRASS, [1.7, 0.04, 0.05], [0, 1.68, 1.28], [0, 0, 0], 0.015);
  decal(gauges, [0, 1.31, 1.115], [0, 0, -1], 0.76, 0.28);
  for (const s of [1, -1]) {
    put(rb(0.07, 0.6, 1.2, 0.03), BODY, [s * 0.855, 1.22, 0.6], { name: "cabWall" });
    b.rod([s * 0.865, 1.54, 0.0], [s * 0.865, 1.54, 1.2], 0.032, { color: BRASS, bone: chassis, sides: 6 });
    put(rb(0.5, 0.05, 0.04, 0.015), BRASS_D, [s * 0.5, 1.45, 0.03]);
    // door
    const dn = side(s);
    const dj = door[dn];
    b.part(rb(0.05, 0.5, 0.78, 0.02), BODY, { bone: dj, at: [s * 0.9, 1.22, 0.58], name: `door${dn}Panel` });
    b.part(rb(0.015, 0.46, 0.012, 0.004), GOLD, { bone: dj, at: [s * 0.926, 1.22, 0.2] });
    b.part(rb(0.015, 0.46, 0.012, 0.004), GOLD, { bone: dj, at: [s * 0.926, 1.22, 0.96] });
    b.part(rb(0.015, 0.012, 0.74, 0.004), GOLD, { bone: dj, at: [s * 0.926, 1.0, 0.58] });
    b.part(rb(0.015, 0.012, 0.74, 0.004), GOLD, { bone: dj, at: [s * 0.926, 1.44, 0.58] });
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: dj, at: [s * 0.9285, 1.22, 0.62], dir: [s, 0, 0], axis: "z", texture: roundel });
    b.part(new THREE.CapsuleGeometry(0.018, 0.1, 3, 6), BRASS, { bone: dj, at: [s * 0.95, 1.32, 0.24], rotation: [90, 0, 0] });
    for (const z of [0.2, 0.3]) b.part(new THREE.SphereGeometry(0.02, 5, 4), BRASS_D, { bone: dj, at: [s * 0.935, 1.32, z] });
    // door sill step light
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), REDLAMP, { bone: chassis, at: [s * 0.9, 0.93, 0.05], rotation: [0, 0, 90] });
  }
  // bench seat
  put(rb(1.5, 0.17, 0.62, 0.07), LEATHER, [0, 1.06, 0.36], { name: "seatCushion" });
  put(rb(1.5, 0.52, 0.14, 0.06), LEATHER, [0, 1.4, 0.1], { name: "seatBack" });
  put(rb(0.04, 0.5, 0.6, 0.015), LEATHER_D, [0.77, 1.0, 0.36]);
  put(rb(0.04, 0.5, 0.6, 0.015), LEATHER_D, [-0.77, 1.0, 0.36]);
  for (let ix = -3; ix <= 3; ix++)
    for (const y of [1.3, 1.5]) bball(chassis, BRASS_D, 0.016, [ix * 0.2, y, 0.18], 5);
  bbox(chassis, BRASS_D, [1.5, 0.018, 0.018], [0, 1.15, 0.67]);
  // steering column + wheel
  b.rod(COL_BASE, WHEEL_C, 0.03, { color: BLACK, bone: chassis, sides: 6 });
  const swGeo: THREE.BufferGeometry[] = [new THREE.TorusGeometry(0.19, 0.027, 6, 16)];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    swGeo.push(cyl([0, 0, 0], [Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0], 0.016, 0.016, 5));
  }
  b.part(mergeGeometries(swGeo)!, BLACK, { bone: steering, at: WHEEL_C, dir: colDir, axis: "z", name: "steeringRim" });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), BRASS, { bone: steering, at: WHEEL_C, dir: colDir, axis: "y" });
  // gear lever and handbrake
  b.rod([-0.1, 0.95, 0.75], [-0.14, 1.28, 0.82], 0.016, { color: STEEL, bone: chassis, sides: 5 });
  put(new THREE.SphereGeometry(0.04, 6, 4), BLACK, [-0.14, 1.3, 0.82]);
  b.rod([0.72, 0.95, 0.75], [0.72, 1.28, 0.85], 0.016, { color: STEEL, bone: chassis, sides: 5 });
  put(new THREE.SphereGeometry(0.035, 6, 4), RED, [0.72, 1.3, 0.86]);

  // windshield (folds forward on its bottom hinge) and wipers
  const windshield = b.joint("windshield", { parent: chassis, at: [0, 1.7, 1.14], dir: [0, 0.97, -0.24], role: "hinge" });
  for (const s of [1, -1]) {
    b.rod([s * 0.79, 1.68, 1.14], [s * 0.79, 2.12, 1.03], 0.026, { color: BRASS, bone: windshield, sides: 6 });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), GOLD, { bone: windshield, at: [s * 0.79, 2.14, 1.025] });
  }
  b.rod([-0.79, 2.12, 1.03], [0.79, 2.12, 1.03], 0.022, { color: BRASS, bone: windshield, sides: 6 });
  b.rod([-0.79, 1.7, 1.14], [0.79, 1.7, 1.14], 0.022, { color: BRASS, bone: windshield, sides: 6 });
  b.rod([0, 1.7, 1.14], [0, 2.12, 1.03], 0.015, { color: BRASS, bone: windshield, sides: 5 });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.78, 0.42, 0.02), "#ffffff", { bone: windshield, at: [s * 0.4, 1.91, 1.085], rotation: [-14, 0, 0], texture: glint, name: "glass" });
  for (const s of [1, -1]) {
    const px = s * 0.3;
    const wiper = b.joint(`wiper${side(s)}`, { parent: windshield, at: [px, 1.76, 1.17], dir: [0, 0.24, 0.97] });
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), BRASS_D, { bone: wiper, at: [px, 1.76, 1.17], dir: [0, 0.24, 0.97] });
    const tip: P3 = [px + s * 0.1, 2.08, 1.095];
    b.rod([px, 1.765, 1.165], tip, 0.008, { color: BLACK, bone: wiper, sides: 4 });
    b.rod([px + s * 0.035, 1.87, 1.135], tip, 0.014, { color: BLACK, bone: wiper, sides: 4 });
  }
  // side lamps and spotlight
  {
    const s = -1;
    put(new THREE.CylinderGeometry(0.05, 0.06, 0.05, 8), BRASS_D, [s * 0.88, 1.74, 1.22]);
    glow(put(new THREE.CylinderGeometry(0.055, 0.045, 0.1, 8), LAMP, [s * 0.88, 1.81, 1.22]), 1.2);
    put(new THREE.ConeGeometry(0.075, 0.07, 8), BRASS_D, [s * 0.88, 1.89, 1.22]);
  }
  b.rod([0.9, 1.74, 1.26], [0.9, 1.9, 1.3], 0.022, { color: STEEL, bone: chassis, sides: 5 });
  put(new THREE.CylinderGeometry(0.09, 0.1, 0.24, 10), RED_D, [0.9, 1.98, 1.36], { dir: [0, 0.25, 1] });
  put(new THREE.TorusGeometry(0.1, 0.014, 5, 10), BRASS, [0.9, 2.02, 1.48], { dir: [0, 0.25, 1], axis: "z" });
  glow(put(new THREE.CircleGeometry(0.09, 10), LAMP, [0.9, 2.02, 1.485], { dir: [0, 0.25, 1], axis: "z" }), 1.3);
  // pennant flag on left post
  b.rod([0.79, 2.14, 1.025], [0.79, 2.55, 1.0], 0.012, { color: BRASS_D, bone: chassis, sides: 5 });
  b.extrude(
    [
      [0, 0],
      [0.42, 0.1],
      [0.28, 0.17],
      [0.45, 0.24],
      [0, 0.3],
    ],
    { at: [0.79, 2.24, 1.0], x: [0, 0.12, -1], y: [0, 1, 0], thickness: 0.012, color: RED, bone: chassis, name: "pennant" },
  );
  put(new THREE.SphereGeometry(0.03, 6, 4), GOLD, [0.79, 2.57, 1.0]);

  // bell
  for (const s of [1, -1]) b.rod([s * 0.2, 1.86, 1.55], [s * 0.2, 2.28, 1.55], 0.025, { color: BRASS_D, bone: chassis, sides: 6 });
  b.rod([-0.22, 2.28, 1.55], [0.22, 2.28, 1.55], 0.03, { color: BRASS_D, bone: chassis, sides: 6 });
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.17, 0.03],
      [0.13, 0.12],
      [0.08, 0.2],
      [0.05, 0.25],
      [0, 0.27],
    ],
    { at: [0, 1.98, 1.55], bone: bell, color: BRASS, segments: 10, smoothing: 0, name: "bellBody" },
  );
  b.part(new THREE.SphereGeometry(0.045, 6, 4), BRASS_D, { bone: bell, at: [0, 1.96, 1.55] });
  b.part(new THREE.TorusGeometry(0.045, 0.012, 4, 8), STEEL, { bone: bell, at: [0, 2.27, 1.55], rotation: [0, 90, 0] });

  // ---- rear body ----------------------------------------------------------------------------------------------
  put(rb(1.5, 0.5, 2.35, 0.09), BODY, [0, 1.12, -1.2], { name: "bodyLower" });
  put(rb(1.84, 0.8, 2.35, 0.12, 3), BODY, [0, 1.72, -1.2], { name: "bodyUpper" });
  put(rb(1.8, 0.05, 2.3, 0.02), paint((p) => ((Math.floor((p.x + 9) / 0.09) + Math.floor((p.z + 9) / 0.09)) % 2 ? "#921b15" : "#7d1611")), [0, 2.12, -1.2]);
  // cream trim band and gold pinstripes
  for (const s of [1, -1]) {
    put(rb(0.03, 0.05, 2.2, 0.012), CREAM, [s * 0.93, 1.36, -1.2]);
    put(rb(0.03, 0.02, 2.2, 0.008), GOLD, [s * 0.935, 1.31, -1.2]);
    put(rb(0.03, 0.02, 2.2, 0.008), GOLD, [s * 0.935, 2.03, -1.2]);
    decal(name, [s * 0.938, 1.95, -1.2], [s, 0, 0], 0.9, 0.18);
    for (const z of [-2.0, -1.2, -0.4]) {
      put(rb(0.04, 0.5, 0.76, 0.02), GOLD, [s * 0.93, 1.63, z]);
      b.part(new THREE.PlaneGeometry(0.68, 0.42), "#ffffff", { bone: chassis, at: [s * 0.952, 1.63, z], dir: [s, 0, 0], axis: "z", texture: shutter });
      put(new THREE.CapsuleGeometry(0.014, 0.14, 3, 5), BRASS_D, [s * 0.965, 1.46, z], { rotation: [90, 0, 0] });
    }
    // suction hose on the top edge
    const hz0 = -2.25;
    const hz1 = -0.15;
    b.rod([s * 0.94, 2.19, hz0], [s * 0.94, 2.19, hz1], 0.075, { color: SUCTION, bone: chassis, sides: 8, name: "suctionHose" });
    for (const z of [hz0 + 0.04, hz1 - 0.04]) b.rod([s * 0.94, 2.19, z - 0.05], [s * 0.94, 2.19, z + 0.05], 0.092, { color: BRASS, bone: chassis, sides: 8 });
    for (let i = 0; i < 12; i++) bbox(chassis, BRASS_D, [0.16, 0.16, 0.012], [s * 0.94, 2.19, hz0 + 0.2 + i * 0.17], [0, 0, 0]);
    for (const z of [-1.8, -1.2, -0.6]) bbox(chassis, BLACK, [0.04, 0.12, 0.05], [s * 0.93, 2.12, z]);
    // axes on the lower body sides
    const ax = (z: number) => {
      put(new THREE.CylinderGeometry(0.014, 0.014, 0.52, 5), WOOD, [s * 0.775, 1.19, z], { rotation: [90, 0, 0] });
      b.extrude(
        [
          [0, 0],
          [0.07, 0.01],
          [0.09, 0.06],
          [0.07, 0.14],
          [0, 0.1],
        ],
        { at: [s * 0.775, 1.15, z - 0.27], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.018, color: STEEL_L, bone: chassis, name: "axeHead" },
      );
    };
    ax(-1.55);
    // pike pole on lower body, tucked under the upper body edge
  }
  // pump panel + couplings on the rear face
  decal(pumpPanel, [0, 1.62, -2.378], [0, 0, -1], 1.3, 0.8);
  for (const s of [1, -1]) {
    b.rod([s * 0.55, 1.18, -2.37], [s * 0.55, 1.18, -2.5], 0.07, { color: BRASS, bone: chassis, sides: 8 });
    b.rod([s * 0.55, 1.18, -2.5], [s * 0.55, 1.18, -2.54], 0.085, { color: BRASS_D, bone: chassis, sides: 8 });
    put(new THREE.SphereGeometry(0.04, 5, 4), BRASS_D, [s * 0.55, 1.18, -2.56]);
    b.rod([s * 0.3, 1.18, -2.37], [s * 0.3, 1.18, -2.45], 0.05, { color: STEEL, bone: chassis, sides: 6 });
    put(new THREE.SphereGeometry(0.05, 6, 4), REDLAMP, [s * 0.88, 1.9, -2.38]);
    glow(put(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 10), REDLAMP, [s * 0.8, 1.97, -2.38], { rotation: [90, 0, 0] }), 0.7);
  }
  decal(plate, [0, 0.99, -2.378], [0, 0, -1], 0.36, 0.18);
  for (const s of [1, -1]) glow(put(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 8), LAMP, [s * 0.24, 1.02, -2.385], { rotation: [90, 0, 0] }), 0.7);
  // rear step and handrails
  put(rb(1.5, 0.06, 0.4, 0.025), TREADBOARD, [0, 0.9, -2.58]);
  for (const s of [1, -1]) {
    bbox(chassis, BLACK, [0.05, 0.2, 0.05], [s * 0.6, 0.78, -2.45]);
    b.sweep(
      catmull([
        [s * 0.8, 0.95, -2.4],
        [s * 0.84, 1.3, -2.45],
        [s * 0.84, 1.8, -2.45],
        [s * 0.8, 2.1, -2.3],
      ]),
      0.022,
      { color: BRASS, bone: chassis, sides: 6, caps: "round" },
    );
  }
  put(rb(0.9, 0.12, 0.08, 0.03), BRASS, [0, 0.78, -2.8]);
  put(new THREE.SphereGeometry(0.05, 6, 4), BRASS_D, [0, 0.78, -2.85]);

  // hose coils on the roof deck
  for (const s of [1, -1])
    for (const z of [-0.65, -2.1]) {
      const c: P3 = [s * 0.62, 2.19, z];
      const coil = spiral(c, [c[0] + 0.26, c[1], c[2]], [0, 1, 0], { turns: 2.6, r1: 0.09, pitch: 0.0 });
      b.sweep(coil, 0.048, { color: paint((_p, _n, st) => (Math.abs(Math.sin(st[1] * DEG)) > 0.55 ? "#bf9f5e" : Math.floor(st[0] * 26) % 2 ? HOSE : "#e0cd96")), bone: chassis, sides: 8, name: "hoseCoil" });
      put(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), BRASS, [c[0] + 0.26, c[1], c[2]], { rotation: [0, 0, 90] });
      put(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), BRASS_D, [c[0] + 0.1 * s, c[1] + 0.01, c[2]], { rotation: [0, 0, 90] });
    }

  // ---- turntable, ladder, rams --------------------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.46, 0.5, 0.1, 16), GOLD, { bone: turntable, at: [0, 2.19, -1.55], name: "turntableRing" });
  b.part(new THREE.CylinderGeometry(0.4, 0.46, 0.06, 16), RED_D, { bone: turntable, at: [0, 2.27, -1.55] });
  for (const s of [1, -1]) {
    b.part(rb(0.06, 0.3, 0.3, 0.025), BRASS_D, { bone: turntable, at: [s * 0.37, 2.42, -1.55] });
    b.part(new THREE.SphereGeometry(0.035, 5, 4), GOLD, { bone: turntable, at: [s * 0.4, 2.46, -1.55] });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), STEEL_L, { bone: ladderLift, at: PIV, rotation: [0, 0, 90] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.022, 4, 3), GOLD, { bone: turntable, at: [Math.cos(a) * 0.42, 2.245, -1.55 + Math.sin(a) * 0.42] });
  }
  // lift rams
  for (const s of [1, -1]) {
    const base: P3 = [s * 0.22, 2.33, -1.05];
    const top = Lp(s * 0.22, -0.1, 1.5);
    const dx = new THREE.Vector3(top[0] - base[0], top[1] - base[1], top[2] - base[2]);
    const m1: P3 = [base[0] + dx.x * 0.55, base[1] + dx.y * 0.55, base[2] + dx.z * 0.55];
    b.rod(base, m1, 0.05, { color: RED_D, bone: turntable, sides: 8 });
    b.rod(m1, top, 0.032, { color: STEEL_L, bone: ladderLift, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), GOLD, { bone: turntable, at: m1, aim: top });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), BRASS_D, { bone: turntable, at: base });
  }

  // ladder sections
  const ladder = (bone: Joint, u: number, v0: number, v1: number, w0: number, w1: number, rungGap: number, chord: string) => {
    for (const s of [1, -1]) {
      for (const v of [v0, v1]) {
        bag(bone, chord, cyl(Lp(s * u, v, w0), Lp(s * u, v, w1), 0.024, 0.024, 6));
      }
      // zigzag web
      const n = Math.round((w1 - w0) / 0.18);
      for (let i = 0; i < n; i++) {
        const a = w0 + ((w1 - w0) * i) / n;
        const c = w0 + ((w1 - w0) * (i + 1)) / n;
        bag(bone, chord, cyl(Lp(s * u, i % 2 ? v1 : v0, a), Lp(s * u, i % 2 ? v0 : v1, c), 0.011, 0.011, 4));
      }
      // gold bands on the chords
      for (let w = w0 + 0.3; w < w1 - 0.1; w += 0.9) bag(bone, GOLD, cyl(Lp(s * u, v1, w), Lp(s * u, v1, w + 0.05), 0.033, 0.033, 6));
    }
    for (let w = w0 + 0.12; w < w1 - 0.05; w += rungGap) {
      bag(bone, WOOD, cyl(Lp(-u, v1, w), Lp(u, v1, w), 0.02, 0.02, 6));
    }
    for (let w = w0 + 0.4; w < w1 - 0.2; w += 0.8) bag(bone, chord, cyl(Lp(-u, v0, w), Lp(u, v0, w), 0.012, 0.012, 4));
  };
  ladder(ladderLift, 0.3, -0.07, 0.07, -0.4, 4.0, 0.3, CREAM);
  ladder(ladderFly, 0.22, 0.14, 0.26, 1.4, 5.0, 0.3, CREAM);
  // fly guide blocks + end caps
  for (const s of [1, -1]) {
    for (const w of [1.6, 3.7]) {
      const p = Lp(s * 0.26, 0.105, w);
      bbox(ladderLift, BRASS_D, [0.09, 0.08, 0.14], p, [-12, 0, 0]);
    }
    bball(ladderFly, GOLD, 0.04, Lp(s * 0.22, 0.2, 5.02), 6);
    bball(ladderLift, GOLD, 0.045, Lp(s * 0.3, 0, -0.42), 6);
  }

  // ---- driver ---------------------------------------------------------------------------------------------------
  const DX = 0.38;
  put(new THREE.CapsuleGeometry(0.22, 0.32, 4, 10), NAVY, [DX, 1.46, 0.4], { name: "driverTorso" });
  put(new THREE.CylinderGeometry(0.235, 0.235, 0.06, 10), YEL, [DX, 1.36, 0.4]);
  put(new THREE.BoxGeometry(0.05, 0.4, 0.02), YEL, [DX, 1.5, 0.61], { rotation: [0, 0, 0] });
  for (let i = 0; i < 4; i++) put(new THREE.SphereGeometry(0.02, 5, 4), BRASS, [DX + 0.05, 1.66 - i * 0.1, 0.61]);
  for (const s of [1, -1]) {
    const sh: P3 = [DX + s * 0.23, 1.6, 0.42];
    b.capsule(sh, [DX + s * 0.17, 1.55, 0.86], 0.07, { color: NAVY, bone: chassis, sides: 7 });
    put(new THREE.SphereGeometry(0.085, 7, 5), WHITE, [DX + s * 0.17, 1.55, 0.88]);
    // legs
    const hip: P3 = [DX + s * 0.11, 1.2, 0.36];
    const knee: P3 = [DX + s * 0.11, 1.24, 0.8];
    b.capsule(hip, knee, 0.095, { color: "#3a3f5c", bone: chassis, sides: 7 });
    b.capsule(knee, [DX + s * 0.11, 1.0, 0.92], 0.08, { color: "#3a3f5c", bone: chassis, sides: 7 });
    put(rb(0.15, 0.13, 0.28, 0.05), BLACK, [DX + s * 0.11, 0.99, 1.0]);
  }
  // head
  const HC: P3 = [DX, 1.95, 0.42];
  put(new THREE.SphereGeometry(0.19, 10, 8), SKIN, HC, { name: "driverHead" });
  put(new THREE.SphereGeometry(0.05, 6, 5), "#f4a283", [DX, 1.93, 0.6]);
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.03, 6, 5), BLACK, [DX + s * 0.07, 2.0, 0.59], { scale: [1, 1.3, 0.6] });
    put(new THREE.SphereGeometry(0.01, 4, 3), WHITE, [DX + s * 0.07 - s * 0.008, 2.012, 0.61]);
    put(new THREE.SphereGeometry(0.04, 6, 4), PINK, [DX + s * 0.12, 1.9, 0.56], { scale: [1, 0.7, 0.4] });
    put(new THREE.SphereGeometry(0.045, 6, 4), SKIN, [DX + s * 0.19, 1.95, 0.42], { scale: [0.5, 1, 0.8] });
    b.sweep(catmull([[DX + s * 0.03, 2.065, 0.595], [DX + s * 0.075, 2.08, 0.585], [DX + s * 0.115, 2.055, 0.565]]), 0.012, { color: MOUSTACHE, bone: chassis, sides: 4 });
    // handlebar moustache
    b.sweep(
      catmull([
        [DX, 1.87, 0.6],
        [DX + s * 0.08, 1.85, 0.595],
        [DX + s * 0.15, 1.87, 0.56],
        [DX + s * 0.2, 1.93, 0.52],
        [DX + s * 0.18, 1.99, 0.52],
      ]),
      [0.035, 0.012],
      { color: MOUSTACHE, bone: chassis, sides: 6 },
    );
  }
  put(new THREE.SphereGeometry(0.045, 6, 4), PINK, [DX, 1.82, 0.58], { scale: [1.4, 0.5, 0.6] });
  // helmet
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.255, 0.015],
      [0.22, 0.035],
      [0.2, 0.11],
      [0.14, 0.2],
      [0.05, 0.24],
      [0, 0.245],
    ],
    { at: [DX, 2.05, 0.42], bone: chassis, color: RED, segments: 12, smoothing: 0, name: "helmet" },
  );
  b.extrude(
    [
      [-0.05, 0.0],
      [-0.27, -0.09],
      [-0.34, -0.03],
      [-0.15, 0.06],
    ],
    { at: [DX, 2.06, 0.42], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.3, bevel: 0.02, color: RED, bone: chassis, name: "helmetTail" },
  );
  b.rod([DX, 2.28, 0.28], [DX, 2.28, 0.56], 0.025, { color: BRASS, bone: chassis, sides: 5 });
  b.extrude(
    [
      [-0.09, 0.1],
      [0.09, 0.1],
      [0.09, 0],
      [0, -0.12],
      [-0.09, 0],
    ],
    { at: [DX, 2.18, 0.62], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, smoothing: 1, color: GOLD, bone: chassis, name: "helmetShield" },
  );
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", { bone: chassis, at: [DX, 2.2, 0.642], dir: [0, 0.1, 1], axis: "z", texture: roundel });

  // ---- dalmatian ------------------------------------------------------------------------------------------------
  const DGX = -0.34;
  const dogBody = b.capsule([DGX, 1.2, 0.3], [DGX, 1.52, 0.36], 0.15, { color: WHITE, bone: chassis, sides: 8, name: "dogBody" });
  const dogHaunch = put(new THREE.SphereGeometry(0.17, 8, 6), WHITE, [DGX, 1.2, 0.3], { scale: [1.15, 0.9, 1.2] });
  for (const s of [1, -1]) {
    b.capsule([DGX + s * 0.08, 1.4, 0.45], [DGX + s * 0.08, 1.1, 0.56], 0.045, { color: WHITE, bone: chassis, sides: 6 });
    put(new THREE.SphereGeometry(0.058, 6, 4), WHITE, [DGX + s * 0.08, 1.12, 0.6], { scale: [1, 0.7, 1.4] });
    put(new THREE.SphereGeometry(0.1, 6, 5), WHITE, [DGX + s * 0.17, 1.15, 0.38], { scale: [0.5, 0.8, 1.2] });
  }
  const dogHead = put(new THREE.SphereGeometry(0.15, 8, 6), WHITE, [DGX, 1.74, 0.4], { name: "dogHead" });
  const spotRng = rng(11);
  for (const hit of b.surface([dogBody, dogHaunch]).scatter(16, { rng: spotRng, minDist: 0.08, filter: (h) => h.n.y > -0.4 && h.at.x < DGX + 0.2 && h.at.x > DGX - 0.2 }))
    b.stick(new THREE.SphereGeometry(0.03 + 0.02 * spotRng(), 6, 4), BLACK, hit, { embed: 0.55, scale: [1, 0.6, 1.2] });
  for (const hit of b.surface(dogHead).scatter(6, { rng: spotRng, minDist: 0.1, filter: (h) => h.n.y > 0.1 && h.n.z < 0.5 }))
    b.stick(new THREE.SphereGeometry(0.03 + 0.015 * spotRng(), 6, 4), BLACK, hit, { embed: 0.55, scale: [1, 0.6, 1.2] });
  put(new THREE.SphereGeometry(0.085, 7, 5), WHITE, [DGX, 1.7, 0.53], { scale: [0.95, 0.8, 1.2] });
  put(new THREE.SphereGeometry(0.035, 6, 4), BLACK, [DGX, 1.74, 0.63], { scale: [1.3, 0.9, 1] });
  put(new THREE.SphereGeometry(0.03, 5, 4), PINK, [DGX, 1.64, 0.6], { scale: [1, 0.35, 1.7] });
  put(new THREE.TorusGeometry(0.15, 0.025, 5, 12), REDLAMP, [DGX, 1.58, 0.38], { rotation: [90, 0, 0] });
  put(new THREE.SphereGeometry(0.025, 5, 4), GOLD, [DGX, 1.52, 0.5]);
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.03, 6, 5), BLACK, [DGX + s * 0.065, 1.79, 0.52], { scale: [1, 1.3, 0.6] });
    put(new THREE.SphereGeometry(0.01, 4, 3), WHITE, [DGX + s * 0.065 - s * 0.007, 1.8, 0.54]);
    put(new THREE.SphereGeometry(0.075, 6, 5), BLACK, [DGX + s * 0.14, 1.78, 0.38], { scale: [0.3, 1.3, 0.8], rotation: [0, 0, -s * 15] });
  }
  // tiny helmet on the pup
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.12, 0.012],
      [0.1, 0.025],
      [0.085, 0.07],
      [0.04, 0.115],
      [0, 0.12],
    ],
    { at: [DGX, 1.87, 0.4], bone: chassis, color: RED, segments: 10, smoothing: 0, name: "dogHelmet" },
  );
  put(new THREE.SphereGeometry(0.022, 5, 4), GOLD, [DGX, 1.95, 0.5]);

  // ---- cat on the ladder ------------------------------------------------------------------------------------------
  const CAT = stripes(ORANGE, ORANGE_D, { size: 0.06, axis: "y", width: 0.3, seed: 2 });
  const cw = 4.5;
  const cat = (u: number, v: number, w: number): P3 => Lp(u, 0.26 + v, w + cw - 4.5);
  const cb = ladderFly;
  b.part(new THREE.SphereGeometry(0.11, 8, 6), CAT, { bone: cb, at: cat(0, 0.13, cw), scale: [1, 1.25, 1], name: "catBody" });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), CAT, { bone: cb, at: cat(0, 0.33, cw + 0.03), name: "catHead" });
  b.part(new THREE.SphereGeometry(0.055, 6, 4), CREAM, { bone: cb, at: cat(0, 0.3, cw + 0.09), scale: [1.1, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.014, 4, 3), PINK, { bone: cb, at: cat(0, 0.325, cw + 0.135) });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.06, 4), ORANGE_D, { bone: cb, at: cat(s * 0.055, 0.42, cw + 0.03) });
    b.part(new THREE.SphereGeometry(0.026, 6, 5), GREENEYE, { bone: cb, at: cat(s * 0.04, 0.35, cw + 0.09), scale: [1, 1.2, 0.5] });
    b.part(new THREE.SphereGeometry(0.012, 4, 3), BLACK, { bone: cb, at: cat(s * 0.04, 0.35, cw + 0.108), scale: [0.6, 1.4, 0.5] });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), CREAM, { bone: cb, at: cat(s * 0.06, 0.02, cw + 0.09), scale: [1, 0.6, 1.5] });
  }
  b.sweep(
    catmull([cat(0, 0.04, cw - 0.1), cat(0.1, 0.0, cw - 0.2), cat(0.17, 0.12, cw - 0.2), cat(0.14, 0.26, cw - 0.17)]),
    [0.03, 0.02],
    { color: CAT, bone: cb, sides: 6, caps: "round" },
  );

  // ---- small extras -------------------------------------------------------------------------------------------
  // rivets round the radiator shell
  const rim = catmull(
    shell.map(([x, y]) => [x * 0.9, 1.45 + (y - 1.45) * 0.93, 2.452] as P3),
    { closed: true },
  );
  for (let i = 0; i < 26; i++) bball(chassis, GOLD, 0.014, rim.at(i / 26).toArray() as P3, 5);
  // rivets on the locker frames and cab rail brackets
  for (const s of [1, -1])
    for (const z of [-2.0, -1.2, -0.4])
      for (const dz of [-0.34, 0.34])
        for (const y of [1.4, 1.86]) bball(chassis, BRASS_D, 0.013, [s * 0.952, y, z + dz], 5);
  // fire extinguisher on the right running board
  put(new THREE.CylinderGeometry(0.065, 0.065, 0.36, 8), RED, [-1.08, 1.0, 0.18]);
  put(new THREE.SphereGeometry(0.065, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), RED, [-1.08, 1.18, 0.18]);
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), BRASS, [-1.08, 1.27, 0.18]);
  b.sweep(catmull([[-1.08, 1.27, 0.18], [-1.02, 1.3, 0.12], [-0.98, 1.1, 0.08]]), 0.012, { color: BLACK, bone: chassis, sides: 4 });
  for (const y of [0.9, 1.1]) put(new THREE.TorusGeometry(0.068, 0.012, 4, 10), BRASS_D, [-1.08, y, 0.18], { rotation: [90, 0, 0] });
  b.rod([-1.04, 1.1, 0.15], [-0.9, 1.1, 0.15], 0.012, { color: BRASS_D, bone: chassis, sides: 4 });
  // side mirrors
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.95, 1.1], [s * 1.02, 2.0, 1.15], 0.012, { color: BRASS, bone: chassis, sides: 5 });
    put(new THREE.TorusGeometry(0.065, 0.013, 5, 10), BRASS, [s * 1.04, 2.0, 1.16], { rotation: [0, 90, 0] });
    put(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 10), STEEL_L, [s * 1.04, 2.0, 1.16], { rotation: [0, 0, 90] });
  }
  // steam puff from the radiator cap
  put(new THREE.SphereGeometry(0.055, 7, 5), WHITE, [0.07, 2.3, 2.37]);
  put(new THREE.SphereGeometry(0.07, 7, 5), WHITE, [0.12, 2.4, 2.35]);
  put(new THREE.SphereGeometry(0.05, 7, 5), WHITE, [0.2, 2.48, 2.32]);

  // lower valance under the radiator, with a gold stripe
  put(rb(1.1, 0.14, 0.16, 0.05), BODY, [0, 0.87, 2.34], { name: "valance" });
  put(rb(1.0, 0.016, 0.02, 0.006), GOLD, [0, 0.87, 2.425]);
  // a yellow chick watching from the bell yoke
  put(new THREE.SphereGeometry(0.06, 8, 6), YEL, [0.13, 2.36, 1.55], { scale: [1, 0.9, 1.1] });
  put(new THREE.SphereGeometry(0.045, 8, 6), YEL, [0.13, 2.43, 1.585]);
  put(new THREE.ConeGeometry(0.014, 0.04, 5), ORANGE, [0.13, 2.425, 1.64], { dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.009, 4, 3), BLACK, [0.13 + s * 0.022, 2.445, 1.62]);
    put(new THREE.SphereGeometry(0.03, 5, 4), ORANGE_D, [0.13 + s * 0.06, 2.36, 1.55], { scale: [0.4, 0.8, 1.1] });
  }
  put(new THREE.ConeGeometry(0.012, 0.035, 4), ORANGE_D, [0.13, 2.47, 1.58], { dir: [0, 1, -0.3] });

  // ---- flush merged geometry -----------------------------------------------------------------------------------
  for (const e of bags.values()) b.part(mergeGeometries(e.geos)!, e.color, { bone: e.bone, at: [0, 0, 0], name: `merged_${e.bone.name}_${e.color.slice(1)}` });

  return b.root;
}
