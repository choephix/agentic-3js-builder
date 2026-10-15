import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { cells, grain, mix, mottle, noise, paint, smoothstep, stripes } from "../src/paint";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Safari Jeep",
  description:
    "A chunky, cheerful open-top safari jeep with big bubble fenders, bug-eyed headlights, a loaded roof rack and a sun-faced spare tyre.",
  style: "whimsical",
  commit: "88fc1f0",
};

type V = [number, number, number];

// ---- palette ----------------------------------------------------------------------------------------------------
const BODY = "#f6b83d"; // sunflower
const BODY2 = "#ec9a2c";
const MUD = "#8c5d3c";
const CREAM = "#fff0c8";
const CREAM2 = "#ecd49a";
const TEAL = "#1f9a93";
const TEAL2 = "#16756f";
const RED = "#d9472f";
const BROWN = "#8b5530";
const DARK = "#2a2631";
const CHROME = "#dfe7ec";
const STEEL = "#8a949c";
const RUBBER = "#2d2f3b";
const LUG = "#22232c";
const OLIVE = "#6f8f3f";
const WOOD = "#c58b4f";
const WOOD2 = "#a56d38";
const LAMP = "#fff3b0";
const AMBER = "#ffae2b";
const WICKER = "#d9a45a";
const WICKER2 = "#b9803c";

const D = Math.PI / 180;

// ---- textures ---------------------------------------------------------------------------------------------------
const sunRays = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const w = 0.17;
  const p = (r: number, da: number) => `${(50 + Math.cos(a + da) * r).toFixed(1)},${(50 + Math.sin(a + da) * r).toFixed(1)}`;
  return `<polygon points="${p(29, -w)} ${p(44, 0)} ${p(29, w)}" fill="#ff9d2e"/>`;
}).join("");

const SUN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#16756f"/>
  <circle cx="50" cy="50" r="45" fill="#fff0c8"/>
  ${sunRays}
  <circle cx="50" cy="50" r="27" fill="#ffd23f" stroke="#e0891f" stroke-width="2.5"/>
  <ellipse cx="41" cy="45" rx="3.2" ry="4.6" fill="#2a2631"/><ellipse cx="59" cy="45" rx="3.2" ry="4.6" fill="#2a2631"/>
  <circle cx="42" cy="43.5" r="1.2" fill="#fff"/><circle cx="60" cy="43.5" r="1.2" fill="#fff"/>
  <path d="M37 55 Q50 68 63 55" fill="none" stroke="#2a2631" stroke-width="3.2" stroke-linecap="round"/>
  <ellipse cx="34" cy="54" rx="4.5" ry="3" fill="#ff8f7a"/><ellipse cx="66" cy="54" rx="4.5" ry="3" fill="#ff8f7a"/>
</svg>`,
  { size: 384 },
);

const GRILLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 50">
  <rect x="1" y="1" width="60" height="48" rx="9" fill="#e9eef1"/>
  <rect x="5" y="5" width="52" height="40" rx="6" fill="#23202a"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${8 + i * 7.3}" y="7.5" width="4.4" height="35" rx="2.2" fill="#fff0c8"/>`).join("")}
  <rect x="5" y="23" width="52" height="3.4" fill="#e9eef1"/>
  <circle cx="31" cy="24.7" r="3.6" fill="#d9472f" stroke="#e9eef1" stroke-width="1.2"/>
</svg>`,
  { size: 248 },
);

const DIAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="19.5" fill="#dfe7ec"/>
  <circle cx="20" cy="20" r="16" fill="#fff4d6"/>
  ${Array.from({ length: 9 }, (_, i) => {
    const a = (-210 + i * 30) * (Math.PI / 180);
    return `<line x1="${20 + Math.cos(a) * 12.5}" y1="${20 + Math.sin(a) * 12.5}" x2="${20 + Math.cos(a) * 15}" y2="${20 + Math.sin(a) * 15}" stroke="#2a2631" stroke-width="1.6"/>`;
  }).join("")}
  <path d="M8 24 A12 12 0 0 1 12 12" fill="none" stroke="#d9472f" stroke-width="2"/>
  <line x1="20" y1="20" x2="28" y2="12" stroke="#d9472f" stroke-width="2" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="2.6" fill="#2a2631"/>
</svg>`,
  { size: 160 },
);

const ROUNDEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <circle cx="30" cy="30" r="29" fill="#1f9a93"/>
  <circle cx="30" cy="30" r="24" fill="#fff0c8"/>
  <circle cx="30" cy="30" r="21" fill="none" stroke="#d9472f" stroke-width="1.6" stroke-dasharray="3 2.4"/>
  <text x="30" y="41" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="31" text-anchor="middle" fill="#d9472f">7</text>
</svg>`,
  { size: 240 },
);

const PAW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <path d="M20 19 C28 19 31 27 29 31 C27 35 23 33 20 33 C17 33 13 35 11 31 C9 27 12 19 20 19Z" fill="#9a6238"/>
  <ellipse cx="9.5" cy="17" rx="3.6" ry="4.6" fill="#9a6238" transform="rotate(-18 9.5 17)"/>
  <ellipse cx="16" cy="9" rx="3.8" ry="5" fill="#9a6238" transform="rotate(-6 16 9)"/>
  <ellipse cx="24.5" cy="9" rx="3.8" ry="5" fill="#9a6238" transform="rotate(6 24.5 9)"/>
  <ellipse cx="31" cy="17" rx="3.6" ry="4.6" fill="#9a6238" transform="rotate(18 31 17)"/>
</svg>`,
  { size: 160 },
);

const STICKERS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
  <rect x="2" y="4" width="34" height="30" rx="7" fill="#d9472f" transform="rotate(-6 19 19)"/>
  <polygon points="19,10 22.5,18 31,18.5 24.5,24 26.5,32 19,27.5 11.5,32 13.5,24 7,18.5 15.5,18" fill="#fff0c8" transform="rotate(-6 19 19)"/>
  <circle cx="60" cy="19" r="16" fill="#1f9a93"/>
  <path d="M60 8 C52 14 52 26 60 31 C68 26 68 14 60 8Z" fill="#fff0c8"/>
  <rect x="86" y="5" width="30" height="26" rx="5" fill="#ffd23f" transform="rotate(5 101 18)"/>
  <path d="M92 26 L92 10 L108 15 L92 20" fill="#d9472f" transform="rotate(5 101 18)"/>
  <circle cx="22" cy="52" r="15" fill="#fff0c8" stroke="#8b5530" stroke-width="2.5"/>
  <path d="M22 62 C13 55 13 44 19 43 C21 43 22 45 22 46 C22 45 23 43 25 43 C31 44 31 55 22 62Z" fill="#d9472f"/>
  <rect x="44" y="40" width="36" height="24" rx="6" fill="#8bc34a" transform="rotate(-4 62 52)"/>
  <path d="M50 58 Q62 44 76 58" fill="none" stroke="#fff0c8" stroke-width="4" stroke-linecap="round" transform="rotate(-4 62 52)"/>
  <circle cx="100" cy="52" r="15" fill="#ff8f7a"/>
  <circle cx="100" cy="52" r="9" fill="#fff0c8"/><circle cx="100" cy="52" r="4" fill="#ff8f7a"/>
</svg>`,
  { size: 480 },
);

const PLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
  <rect x="1" y="1" width="58" height="28" rx="5" fill="#fff7d8" stroke="#2a2631" stroke-width="1.6"/>
  <rect x="4" y="4" width="52" height="7" rx="2" fill="#1f9a93"/>
  <text x="30" y="10" font-family="Arial, sans-serif" font-weight="700" font-size="6.5" text-anchor="middle" fill="#fff0c8">SAFARI TOURS</text>
  <text x="30" y="26" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="14.5" text-anchor="middle" fill="#2a2631">ROAR 7</text>
</svg>`,
  { size: 360 },
);

const BANNER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 20">
  <rect x="0" y="0" width="120" height="20" fill="#1f9a93"/>
  <text x="60" y="15.5" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="12.5" text-anchor="middle" fill="#fff0c8" letter-spacing="1">SAFARI TOURS</text>
</svg>`,
  { size: 480 },
);

const GLASS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 44">
  <polygon points="12,44 24,44 52,0 40,0" fill="#eafaff"/>
  <polygon points="30,44 36,44 64,0 58,0" fill="#eafaff"/>
  <polygon points="72,44 84,44 100,22 100,6 94,6" fill="#eafaff"/>
  <polygon points="0,44 5,44 0,52" fill="#eafaff"/>
  <rect x="0" y="0" width="100" height="2.2" fill="#bfe9f0"/><rect x="0" y="41.8" width="100" height="2.2" fill="#bfe9f0"/>
  <rect x="0" y="0" width="2.2" height="44" fill="#bfe9f0"/><rect x="97.8" y="0" width="2.2" height="44" fill="#bfe9f0"/>
</svg>`,
  { size: 400 },
);

const CRATE_LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
  <rect x="1" y="1" width="62" height="38" rx="6" fill="#fff0c8" stroke="#8b5530" stroke-width="2"/>
  <path d="M10 25 Q22 8 40 12 Q34 22 14 29Z" fill="#ffd23f" stroke="#c79a10" stroke-width="1.4"/>
  <path d="M40 12 L43 8" stroke="#6f8f3f" stroke-width="2.4" stroke-linecap="round"/>
  <text x="32" y="36" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="9.5" text-anchor="middle" fill="#d9472f">BANANAS</text>
</svg>`,
  { size: 320 },
);

const JERRY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50">
  <rect x="3" y="3" width="34" height="44" rx="5" fill="none" stroke="#566f2c" stroke-width="2.4"/>
  <line x1="6" y1="7" x2="34" y2="43" stroke="#566f2c" stroke-width="2.6"/><line x1="34" y1="7" x2="6" y2="43" stroke="#566f2c" stroke-width="2.6"/>
  <rect x="9" y="19" width="22" height="10" rx="3" fill="#e8f0cf"/>
  <text x="20" y="27.4" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="7.6" text-anchor="middle" fill="#2a2631">WATER</text>
</svg>`,
  { size: 240 },
);


// ---- helpers ----------------------------------------------------------------------------------------------------
function tr(g: THREE.BufferGeometry, p: V, r: V = [0, 0, 0], s: V = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...p),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D, r[1] * D, r[2] * D)),
    new THREE.Vector3(...s),
  );
  g.applyMatrix4(m);
  return g;
}

const rbox = (w: number, h: number, d: number, r = 0.02, seg = 1) =>
  seg < 2 ? new THREE.BoxGeometry(w, h, d) : new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));

function tubeGeo(a: V, c: V, r: number, sides = 8, r2 = r) {
  const A = new THREE.Vector3(...a);
  const C = new THREE.Vector3(...c);
  const d = C.clone().sub(A);
  const g = new THREE.CylinderGeometry(r2, r, d.length(), sides, 1);
  g.applyQuaternion(aim(d));
  const m = A.clone().add(C).multiplyScalar(0.5);
  return g.translate(m.x, m.y, m.z);
}


export default function build() {
  const b = createBuilder({ name: "safariJeep", paintSize: 1024 });

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.6, 0] });
  const WX = 0.84;
  const ZF = 1.18;
  const ZR = -1.12;
  const steer: Record<string, Joint> = {};
  const wheels: Record<string, Joint> = {};
  const doors: Record<string, Joint> = {};
  const wipers: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    steer[side] = b.joint(`steer${side}`, { parent: chassis, at: [s * WX, 0.46, ZF], dir: [0, 1, 0], role: "hinge" });
    wheels[`F${side}`] = b.joint(`wheelF${side}`, { parent: steer[side], at: [s * WX, 0.46, ZF], dir: [0, 0, 1], role: "hinge" });
    wheels[`R${side}`] = b.joint(`wheelR${side}`, { parent: chassis, at: [s * WX, 0.46, ZR], dir: [0, 0, 1], role: "hinge" });
    doors[side] = b.joint(`door${side}`, { parent: chassis, at: [s * 0.73, 0.7, 0.42], dir: [0, 0, -1], up: [-1, 0, 0], role: "hinge" });
    wipers[side] = b.joint(`wiper${side}`, {
      parent: chassis,
      at: [s * 0.2, 1.17, 0.5],
      dir: [-s * 0.9, 0.3, -0.08],
      role: "hinge",
    });
  }
  const hood = b.joint("hood", { parent: chassis, at: [0, 1.22, 0.66], dir: [0, 0, 1], role: "hinge" });
  const tailgate = b.joint("tailgate", { parent: chassis, at: [0, 0.56, -1.82], dir: [0, 1, 0], role: "hinge" });
  const spare = b.joint("spareSwing", { parent: chassis, at: [0.64, 0.84, -1.9], dir: [0, 0, -1], up: [-1, 0, 0], role: "hinge" });
  const wheelCol = b.joint("steeringWheel", { parent: chassis, at: [-0.36, 0.98, 0.06], dir: [0, 0.5, -0.87], role: "hinge" });

  // ---- batching: many small static pieces become one part per bone and colour ---------------------------------------
  const batches = new Map<string, { bone: Joint; color: Fill; geos: THREE.BufferGeometry[] }>();
  const put = (bone: Joint, color: Fill, g: THREE.BufferGeometry, flat = true) => {
    const ng = g.index ? g.toNonIndexed() : g;
    if (flat) ng.computeVertexNormals();
    const key = `${bone.name}|${String(color)}`;
    let item = batches.get(key);
    if (!item) {
      item = { bone, color, geos: [] };
      batches.set(key, item);
    }
    item.geos.push(ng);
  };
  const flush = () => {
    for (const { bone, color, geos } of batches.values()) {
      const merged = mergeGeometries(geos, false);
      if (merged) b.part(merged, color, { bone, at: [0, 0, 0] });
    }
  };
  const cyl = (bone: Joint, color: Fill, a: V, c: V, r: number, sides = 8, r2 = r) => put(bone, color, tubeGeo(a, c, r, sides, r2));
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, bone: Joint = chassis, up?: V, circle = false) =>
    b.part(circle ? new THREE.CircleGeometry(w / 2, 20) : new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });

  // ---- paints -----------------------------------------------------------------------------------------------------
  const mudded = (base: string, tone: string, amount = 0.9) =>
    paint((p) => {
      const c = mix(base, tone, noise(p, 0.55, 2) * 0.8);
      const low = smoothstep(0.7 + 0.2 * (noise(p, 0.22, 7) - 0.5), 0.38, p.y);
      const d = Math.min(Math.hypot(p.y - 0.5, p.z - ZF), Math.hypot(p.y - 0.5, p.z - ZR));
      const cell = cells(p, 0.07, 3);
      const speck = smoothstep(0.16 + 0.22 * cell.id, 0.08 + 0.2 * cell.id, cell.d1);
      const spray = smoothstep(1.05, 0.55, d) * speck;
      return mix(c, MUD, Math.max(low, spray * 0.85) * amount);
    });
  const bodyMud = mudded(BODY, BODY2);
  const flareMud = mudded(CREAM, CREAM2);
  const flarePaint = paint((p, n) => {
    const d = Math.min(Math.hypot(p.y - 0.5, p.z - ZF), Math.hypot(p.y - 0.5, p.z - ZR));
    return Math.abs(n.x) > 0.3 && d > 0.585 && d < 0.612 ? TEAL : flareMud;
  });
  const tealMottle = mottle(TEAL, TEAL2, { size: 0.3, seed: 4 });
  const panelPaint = paint((p, n) => (p.x * n.x < 0 && Math.abs(n.x) > 0.5 ? tealMottle : bodyMud));
  const hoodPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (n.y > 0.5 && ax > 0.07 && ax < 0.17) return CREAM;
    if (n.y > 0.5 && ax >= 0.17 && ax < 0.21) return TEAL;
    return bodyMud;
  });
  const fabric = stripes(TEAL, CREAM, { size: 0.085, axis: "x", width: 0.22, wobble: 0 });
  const checker = paint((p) => ((Math.floor(p.x / 0.05) + Math.floor(p.z / 0.05)) & 1 ? STEEL : "#6f7a82"));
  const wicker = paint((p) => ((Math.floor(p.x / 0.03) + Math.floor(p.y / 0.03) + Math.floor(p.z / 0.03)) & 1 ? WICKER : WICKER2));
  const woodGrain = grain(WOOD, WOOD2, { size: 0.05, axis: "x", seed: 3 });
  const matPaint = stripes("#4b4046", "#3a3036", { size: 0.05, axis: "x", width: 0.5, wobble: 0 });

  // ---- tyres & wheels -------------------------------------------------------------------------------------------
  const wheel = (bone: Joint, c: V, axis: V, k = 1, cover = false) => {
    const ax = new THREE.Vector3(...axis).normalize();
    const cc = new THREE.Vector3(...c);
    const radial = (p: THREE.Vector3) => {
      const d = p.clone().sub(cc);
      return d.sub(ax.clone().multiplyScalar(d.dot(ax))).length() / k;
    };
    const tyrePaint = paint((p, n) => {
      const face = Math.abs(n.dot(ax)) > 0.55;
      const r = radial(p);
      if (face && r > 0.345 && r < 0.385) return CREAM;
      if (face && r > 0.315 && r < 0.33) return RED;
      return mix(RUBBER, "#7a6048", 0.45 * smoothstep(0.45, 0.75, noise(p, 0.14, 5)));
    });
    const R = (v: number) => v * k;
    const tyre: OutlinePoint[] = [
      [R(0.27), -0.14],
      [R(0.38), -0.165],
      [R(0.44), -0.145],
      [R(0.465), -0.09],
      [R(0.465), 0.09],
      [R(0.44), 0.145],
      [R(0.38), 0.165],
      [R(0.27), 0.14],
    ];
    b.lathe(tyre, { at: c, axis, segments: 18, color: tyrePaint, bone, name: "tyre" });
    const rimPaint = paint((p, n) => {
      const r = radial(p);
      if (n.dot(ax) > 0.5) {
        if (r < 0.1) return CREAM;
        if (r > 0.205 && r < 0.235) return CREAM;
      }
      return TEAL;
    });
    const rim: OutlinePoint[] = [
      [0, -0.12],
      [R(0.27), -0.12],
      [R(0.275), 0.1],
      [R(0.15), 0.135],
      [0, 0.15],
    ];
    b.lathe(rim, { at: c, axis, segments: 16, color: rimPaint, bone, name: "rim" });
    // lugs, nuts, cap: built around local +Y, then turned to the axle
    const q = aim(ax);
    const place = (g: THREE.BufferGeometry) => {
      g.applyQuaternion(q);
      g.translate(cc.x, cc.y, cc.z);
      return g;
    };
    const N = 14;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < N; i++) {
        const a = ((i + row * 0.5) / N) * Math.PI * 2;
        const g = rbox(0.1, R(0.052), 0.13 * k, 0.012, 1);
        tr(g, [R(0.47), (row ? 1 : -1) * 0.058, 0], [0, -a / D, 0]);
        put(bone, LUG, place(g));
      }
    }
    if (!cover) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        put(bone, CHROME, place(tr(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), [Math.cos(a) * 0.13, 0.145, Math.sin(a) * 0.13])));
      }
      put(bone, CHROME, place(tr(new THREE.SphereGeometry(0.075, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), [0, 0.15, 0])));
    }
  };

  wheel(wheels.FL, [WX, 0.46, ZF], [1, 0, 0]);
  wheel(wheels.FR, [-WX, 0.46, ZF], [-1, 0, 0]);
  wheel(wheels.RL, [WX, 0.46, ZR], [1, 0, 0]);
  wheel(wheels.RR, [-WX, 0.46, ZR], [-1, 0, 0]);
  const SP: V = [0, 0.86, -2.04];
  wheel(spare, SP, [0, 0, -1], 0.92, true);
  // sun cover on the spare
  b.lathe(
    [
      [0, 0],
      [0.255, 0],
      [0.27, 0.03],
      [0.2, 0.06],
      [0, 0.07],
    ],
    { at: [SP[0], SP[1], SP[2] - 0.16], axis: [0, 0, -1], segments: 20, color: CREAM, bone: spare, name: "cover" },
  );
  decal(SUN, 0.5, 0.5, [SP[0], SP[1], SP[2] - 0.2335], [0, 0, -1], spare, [0, 1, 0], true);

  // steering knuckles, brake discs and calipers (front on the steering joints, rear on the axle)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [bone, z] of [[steer[side], ZF], [chassis, ZR]] as const) {
      put(bone, DARK, tr(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 8), [s * 0.6, 0.46, z], [0, 0, 90]));
      put(bone, STEEL, tr(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 12), [s * 0.69, 0.46, z], [0, 0, 90]));
      put(bone, RED, tr(rbox(0.06, 0.1, 0.09, 0.02, 1), [s * 0.69, 0.62, z - 0.05]));
    }
    cyl(steer[side], STEEL, [s * 0.6, 0.46, ZF + 0.06], [s * 0.3, 0.42, ZF + 0.3], 0.015, 6); // tie rod
  }

  // ---- fender flares, side panels, mud flaps ----------------------------------------------------------------
  const arcPts = (zc: number, R0: number, a0: number, a1: number, n: number): OutlinePoint[] =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = (a0 + ((a1 - a0) * i) / n) * D;
      return [zc + R0 * Math.cos(a), 0.5 + R0 * Math.sin(a)] as OutlinePoint;
    });
  const sideOutline = (z0: number, z1: number, y0: number, y1: number, zc: number, R0 = 0.59): OutlinePoint[] => {
    const aS = Math.asin((y0 - 0.5) / R0) / D;
    const pts: OutlinePoint[] = [
      [z0, y0],
      ...arcPts(zc, R0, 180 - aS, aS, 12),
      [z1, y0],
      [z1, y1],
      [z0, y1],
    ];
    return pts;
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const px = s * 0.7;
    b.extrude(sideOutline(-1.74, -0.46, 0.34, 1.3, ZR), { x: [0, 0, 1], at: [px, 0, 0], thickness: 0.07, bevel: 0.018, color: panelPaint, bone: chassis, name: `quarter${side}` });
    b.extrude(sideOutline(0.44, 1.82, 0.34, 1.14, ZF), { x: [0, 0, 1], at: [px, 0, 0], thickness: 0.07, bevel: 0.018, color: panelPaint, bone: chassis, name: `fenderPanel${side}` });
    for (const zc of [ZF, ZR]) {
      const outer = arcPts(zc, 0.64, -22, 202, 14);
      const inner = arcPts(zc, 0.555, 202, -22, 14);
      b.extrude([...outer, ...inner], { x: [0, 0, 1], at: [s * 0.82, 0, 0], thickness: 0.42, bevel: 0.05, color: flarePaint, bone: chassis, name: `flare${side}${zc > 0 ? "F" : "R"}` });
      // rivet ring on the flare lip
      for (let i = 0; i < 9; i++) {
        const a = (-8 + (i / 8) * 196) * D;
        put(chassis, CHROME, tr(new THREE.SphereGeometry(0.018, 5, 4), [s * 1.035, 0.5 + 0.6 * Math.sin(a), zc + 0.6 * Math.cos(a)]));
      }
    }
    // mud flap behind each rear wheel
    put(chassis, RUBBER, tr(rbox(0.34, 0.3, 0.04, 0.012, 1), [s * 0.82, 0.3, ZR - 0.62]));
    put(chassis, CREAM, tr(rbox(0.3, 0.05, 0.045, 0.01, 1), [s * 0.82, 0.36, ZR - 0.62]));
    // running board
    b.part(rbox(0.3, 0.05, 1.3, 0.018), checker, { bone: chassis, at: [s * 0.86, 0.4, -0.02], name: `step${side}` });
    for (const z of [-0.5, -0.02, 0.46]) cyl(chassis, DARK, [s * 0.72, 0.44, z], [s * 0.82, 0.38, z], 0.016, 6);
    put(chassis, DARK, tr(rbox(0.04, 0.012, 1.28, 0.004, 1), [s * 1.0, 0.405, -0.02]));
  }

  // body underpinnings
  const floorY = 0.59;
  put(chassis, DARK, tr(rbox(1.4, 0.06, 2.26, 0.02), [0, floorY, -0.62]));
  put(chassis, DARK, tr(rbox(1.4, 0.12, 0.2, 0.02), [0, 0.62, 0.52])); // toe board
  b.part(rbox(1.26, 0.014, 2.0, 0.006, 1), matPaint, { bone: chassis, at: [0, 0.628, -0.58], name: "floorMat" });
  for (const s of [1, -1]) {
    put(chassis, STEEL, tr(rbox(0.1, 0.12, 3.5, 0.02), [s * 0.36, 0.46, 0.05])); // frame rails
    cyl(chassis, DARK, [s * 0.66, 0.46, ZF], [s * 0.2, 0.46, ZF], 0.05, 8);
    cyl(chassis, DARK, [s * 0.66, 0.46, ZR], [s * 0.2, 0.46, ZR], 0.05, 8);
    // shock absorbers
    cyl(chassis, RED, [s * 0.5, 0.36, ZF + 0.08], [s * 0.55, 0.66, ZF + 0.06], 0.03, 6);
    cyl(chassis, RED, [s * 0.5, 0.36, ZR - 0.08], [s * 0.55, 0.66, ZR - 0.06], 0.03, 6);
    // leaf springs
    put(chassis, STEEL, tr(rbox(0.07, 0.04, 0.92, 0.012, 1), [s * 0.5, 0.44, ZF]));
    put(chassis, STEEL, tr(rbox(0.07, 0.04, 0.92, 0.012, 1), [s * 0.5, 0.44, ZR]));
  }
  put(chassis, STEEL, tr(new THREE.SphereGeometry(0.14, 8, 6), [0, 0.46, ZF], [0, 0, 0], [1, 0.9, 0.8]));
  put(chassis, STEEL, tr(new THREE.SphereGeometry(0.14, 8, 6), [0, 0.46, ZR], [0, 0, 0], [1, 0.9, 0.8]));
  cyl(chassis, DARK, [0, 0.46, ZF], [0, 0.46, ZR], 0.04, 8);
  for (const z of [-1.2, -0.4, 0.4, 1.2]) put(chassis, STEEL, tr(rbox(0.8, 0.07, 0.1, 0.01, 1), [0, 0.46, z]));
  // exhaust
  cyl(chassis, STEEL, [-0.5, 0.42, 0.8], [-0.5, 0.42, -1.6], 0.035, 8);
  put(chassis, STEEL, tr(new THREE.CapsuleGeometry(0.075, 0.4, 3, 8), [-0.5, 0.4, -1.35], [90, 0, 0]));
  cyl(chassis, CHROME, [-0.5, 0.4, -1.55], [-0.5, 0.32, -1.8], 0.04, 8);
  // skid plate + tow hooks
  put(chassis, STEEL, tr(rbox(0.9, 0.04, 0.5, 0.012, 1), [0, 0.36, 1.35]));

  // ---- doors ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const door = doors[side];
    const outline: OutlinePoint[] = [
      [0.0, 0.4],
      [0.78, 0.4],
      [0.85, 0.47],
      [0.86, 1.0],
      [0.8, 1.07],
      [0.0, 1.07],
    ];
    b.extrude(outline, { at: [s * 0.7, 0, 0.42], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, bevel: 0.02, color: panelPaint, bone: door, name: `door${side}` });
    // door details
    const ox = s * 0.74;
    put(door, CREAM, tr(rbox(0.012, 0.045, 0.78, 0.006, 1), [ox, 0.64, -0.43])); // belt stripe
    put(door, TEAL, tr(rbox(0.012, 0.025, 0.78, 0.006, 1), [ox, 0.585, -0.43]));
    put(door, CHROME, tr(rbox(0.05, 0.035, 0.17, 0.014, 1), [s * 0.77, 0.96, -0.62])); // handle
    put(door, CHROME, tr(rbox(0.02, 0.04, 0.05, 0.008, 1), [s * 0.745, 0.96, -0.52]));
    put(door, DARK, tr(rbox(0.014, 0.03, 0.04, 0.006, 1), [s * 0.741, 0.88, -0.62])); // lock
    for (const y of [0.55, 0.92]) put(door, STEEL, tr(rbox(0.02, 0.1, 0.1, 0.008, 1), [s * 0.745, y, 0.38])); // hinge plates
    put(door, RUBBER, tr(rbox(0.1, 0.03, 0.8, 0.01, 1), [s * 0.7, 1.085, -0.43])); // top rubber
    // inside: armrest, pocket, speaker
    put(door, TEAL2, tr(rbox(0.07, 0.07, 0.4, 0.025), [s * 0.655, 0.97, -0.34]));
    put(door, DARK, tr(rbox(0.05, 0.16, 0.34, 0.02), [s * 0.66, 0.62, -0.34]));
    put(door, CREAM, tr(rbox(0.012, 0.04, 0.3, 0.01, 1), [s * 0.636, 0.69, -0.34]));
    // window rail stub + mirror arm
    // roundel + paw prints on the outside
    decal(ROUNDEL, 0.27, 0.27, [s * 0.7425, 0.82, -0.22], [s, 0, 0], door, undefined, true);
    decal(PAW, 0.13, 0.13, [s * 0.7425, 0.5, -0.28], [s, 0, 0], door);
    decal(PAW, 0.1, 0.1, [s * 0.7425, 0.5, -0.5], [s, 0, 0], door, [0.3 * s, 1, 0]);
  }
  decal(STICKERS, 0.3, 0.175, [0.7425, 0.5, -0.06], [1, 0, 0], doors.L);
  // SAFARI banner on both quarters
  for (const s of [1, -1]) decal(BANNER, 0.78, 0.13, [s * 0.7375, 1.22, -1.12], [s, 0, 0], chassis);

  // ---- cowl, hood, nose --------------------------------------------------------------------------------------------
  b.part(rbox(1.42, 0.72, 0.26, 0.04, 2), bodyMud, { bone: chassis, at: [0, 0.78, 0.53], name: "cowl" });
  b.part(rbox(1.42, 0.26, 1.3, 0.09, 3), hoodPaint, { bone: hood, at: [0, 1.12, 1.29], name: "hood" });
  b.part(rbox(0.56, 0.06, 0.7, 0.025, 2), TEAL, { bone: hood, at: [0, 1.255, 1.15], name: "hoodBulge" });
  for (let i = 0; i < 5; i++) put(hood, CREAM, tr(rbox(0.36, 0.012, 0.02, 0.005, 1), [0, 1.29, 0.98 + i * 0.07 + 0.1]));
  for (const z of [0.95, 1.6]) {
    put(hood, BROWN, tr(rbox(1.34, 0.012, 0.1, 0.004, 1), [0, 1.253, z]));
    for (const s of [1, -1]) put(hood, BROWN, tr(rbox(0.012, 0.2, 0.1, 0.004, 1), [s * 0.715, 1.13, z]));
    put(hood, CHROME, tr(rbox(0.08, 0.016, 0.075, 0.01, 1), [0.3, 1.262, z]));
    put(hood, STEEL, tr(rbox(0.02, 0.018, 0.075, 0.006, 1), [0.3, 1.268, z]));
  }
  // front: grille panel, grille, headlights, turn lights
  b.part(rbox(1.42, 0.64, 0.12, 0.05, 3), bodyMud, { bone: chassis, at: [0, 0.76, 1.87], name: "nose" });
  for (let i = 0; i < 11; i++) {
    const x = -0.64 + (i / 10) * 1.28;
    put(chassis, CHROME, tr(new THREE.SphereGeometry(0.016, 5, 4), [x, 1.075, 1.925]));
    if (i % 10 === 0) for (let j = 0; j < 4; j++) put(chassis, CHROME, tr(new THREE.SphereGeometry(0.016, 5, 4), [x, 0.97 - j * 0.14, 1.925]));
  }
  decal(GRILLE, 0.62, 0.5, [0, 0.76, 1.9335], [0, 0, 1], chassis);
  for (const s of [1, -1]) {
    const hx = s * 0.53;
    put(chassis, CHROME, tr(new THREE.TorusGeometry(0.175, 0.032, 6, 16), [hx, 0.8, 1.945]));
    put(chassis, DARK, tr(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 14), [hx, 0.8, 1.92], [90, 0, 0]));
    glow(b.part(new THREE.SphereGeometry(0.15, 10, 8), LAMP, { bone: chassis, at: [hx, 0.8, 1.935], scale: [1, 1, 0.62], name: `headlight${s > 0 ? "L" : "R"}` }), 1.1);
    // eyelid brow
    put(chassis, BODY, tr(new THREE.TorusGeometry(0.2, 0.05, 5, 10, Math.PI), [hx, 0.8, 1.955], [0, 0, -s * 10]));
    glow(b.part(rbox(0.12, 0.07, 0.04, 0.02), AMBER, { bone: chassis, at: [s * 0.4, 0.5, 1.935], name: "turnLight" }), 0.9);
    // hood latch
    put(hood, CHROME, tr(rbox(0.05, 0.05, 0.03, 0.01, 1), [s * 0.52, 1.08, 1.945]));
  }
  // bumper with a cheerful upward smile
  const bumper = catmull([
    [-1.0, 0.7, 1.8],
    [-0.94, 0.5, 1.97],
    [-0.5, 0.44, 2.04],
    [0, 0.43, 2.06],
    [0.5, 0.44, 2.04],
    [0.94, 0.5, 1.97],
    [1.0, 0.7, 1.8],
  ]);
  b.sweep(bumper, 0.062, { color: CREAM, bone: chassis, sides: 8, caps: "round" });
  for (const s of [1, -1]) {
    cyl(chassis, STEEL, [s * 0.5, 0.5, 1.8], [s * 0.5, 0.45, 2.02], 0.025, 6);
    put(chassis, RED, tr(new THREE.TorusGeometry(0.045, 0.014, 5, 8), [s * 0.28, 0.4, 2.0], [90, 0, 0]));
    put(chassis, RED, tr(new THREE.SphereGeometry(0.04, 6, 4), [s * 0.94, 0.52, 1.97]));
  }
  decal(PLATE, 0.36, 0.18, [0, 0.58, 1.945], [0, 0, 1], chassis);
  // spotlights on the rack front bar
  for (const s of [1, -1]) {
    put(chassis, DARK, tr(new THREE.CylinderGeometry(0.075, 0.075, 0.11, 10), [s * 0.42, 2.0, 0.36], [90, 0, 0]));
    glow(b.part(new THREE.CircleGeometry(0.062, 10), LAMP, { bone: chassis, at: [s * 0.42, 2.0, 0.418], dir: [0, 0, 1], axis: "z", name: "spotlight" }), 1.1);
    cyl(chassis, STEEL, [s * 0.42, 1.92, 0.3], [s * 0.42, 1.98, 0.36], 0.015, 6);
  }

  // ---- rear: tailgate, lights, bumperettes, spare mount -------------------------------------------------------------
  b.part(rbox(1.42, 0.56, 0.09, 0.04, 2), bodyMud, { bone: tailgate, at: [0, 0.86, -1.8], name: "tailgate" });
  put(tailgate, CHROME, tr(rbox(0.1, 0.04, 0.03, 0.01, 1), [-0.0, 1.07, -1.855]));
  for (const s of [1, -1]) {
    put(tailgate, CHROME, tr(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 6), [s * 0.5, 0.6, -1.84], [0, 0, 90]));
    glow(b.part(rbox(0.1, 0.18, 0.05, 0.025), RED, { bone: tailgate, at: [s * 0.62, 0.98, -1.84], name: "tailLight" }), 0.8);
    glow(b.part(rbox(0.1, 0.06, 0.05, 0.02), AMBER, { bone: tailgate, at: [s * 0.62, 0.84, -1.84], name: "tailIndicator" }), 0.8);
    put(tailgate, CHROME, tr(rbox(0.1, 0.02, 0.05, 0.008, 1), [s * 0.62, 0.75, -1.84]));
    // bumperettes
    put(chassis, CREAM, tr(rbox(0.46, 0.1, 0.12, 0.04, 2), [s * 0.74, 0.42, -1.84]));
    put(chassis, STEEL, tr(rbox(0.4, 0.014, 0.1, 0.004, 1), [s * 0.74, 0.474, -1.84]));
  }
  // spare-wheel swing arm
  put(spare, CHROME, tr(new THREE.CylinderGeometry(0.04, 0.04, 0.46, 8), [0.64, 0.84, -1.9]));
  put(spare, STEEL, tr(rbox(0.1, 0.1, 0.06, 0.015, 1), [0.64, 0.84, -1.9]));
  cyl(spare, STEEL, [0.64, 0.84, -1.93], [0.0, 0.86, -1.96], 0.032, 8);
  put(spare, STEEL, tr(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 10), [0, 0.86, -1.95], [90, 0, 0]));
  cyl(chassis, STEEL, [0.64, 0.66, -1.82], [0.64, 1.05, -1.82], 0.035, 8);

  // ---- windshield, mirrors, snorkel, wipers ------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.sweep(polyline([[s * 0.72, 1.14, 0.52], [s * 0.72, 1.66, 0.36], [s * 0.76, 1.9, 0.28]]), 0.03, { color: CREAM, bone: chassis, sides: 8, caps: "round" });
    put(chassis, STEEL, tr(rbox(0.07, 0.07, 0.07, 0.015, 1), [s * 0.72, 1.14, 0.52]));
    // mirror
    cyl(chassis, CHROME, [s * 0.74, 1.32, 0.46], [s * 0.98, 1.4, 0.58], 0.014, 6);
    cyl(chassis, CHROME, [s * 0.74, 1.2, 0.5], [s * 0.98, 1.4, 0.58], 0.014, 6);
    put(chassis, CREAM, tr(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12), [s * 1.0, 1.4, 0.58], [90, 0, 0]));
    put(chassis, CHROME, tr(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 12), [s * 1.0, 1.4, 0.545], [90, 0, 0]));
  }
  cyl(chassis, CREAM, [-0.72, 1.66, 0.36], [0.72, 1.66, 0.36], 0.026, 8);
  cyl(chassis, CHROME, [-0.72, 1.145, 0.515], [0.72, 1.145, 0.515], 0.02, 8);
  cyl(chassis, STEEL, [0, 1.52, 0.4], [0, 1.46, 0.5], 0.01, 6); // mirror stalk
  put(chassis, DARK, tr(rbox(0.26, 0.07, 0.04, 0.015, 1), [0, 1.45, 0.5]));
  const ws = new THREE.Vector3(0, 1.4, 0.44);
  const wsN: V = [0, 0.294, 0.956];
  const wsUp: V = [0, 0.956, -0.294];
  decal(GLASS, 1.38, 0.55, ws.toArray() as V, wsN, chassis, wsUp);
  decal(GLASS, 1.38, 0.55, [ws.x, ws.y - 0.003, ws.z - 0.0013], [0, -0.294, -0.956], chassis, wsUp);
  // snorkel on the right
  b.sweep(polyline([[-0.8, 0.98, 0.66], [-0.82, 1.64, 0.52], [-0.82, 1.74, 0.62]]), 0.032, { color: DARK, bone: chassis, sides: 8, caps: "flat" });
  put(chassis, STEEL, tr(new THREE.CylinderGeometry(0.065, 0.04, 0.1, 8), [-0.82, 1.76, 0.67], [60, 0, 0]));
  for (const y of [1.1, 1.4]) put(chassis, STEEL, tr(rbox(0.06, 0.04, 0.05, 0.01, 1), [-0.77, y, 0.6]));
  // wipers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w = wipers[side];
    const base = new THREE.Vector3(s * 0.2, 1.18, 0.5);
    const tip = new THREE.Vector3(-s * 0.26, 1.35, 0.47);
    b.rod(base.toArray() as V, tip.toArray() as V, 0.01, { color: DARK, bone: w, sides: 6 });
    b.rod([base.x * 0.5 + tip.x * 0.5 - s * 0.01, 1.26, 0.485], [tip.x, 1.35, 0.47], 0.016, { color: DARK, bone: w, sides: 6 });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), CHROME, { bone: w, at: base.toArray() as V });
  }

  // ---- roll frame and roof rack ----------------------------------------------------------------------------------
  const DECK = 1.92;
  for (const s of [1, -1]) {
    cyl(chassis, CREAM, [s * 0.75, 1.3, -1.62], [s * 0.75, DECK, -1.62], 0.03, 8);
    cyl(chassis, CREAM, [s * 0.75, 1.3, -0.52], [s * 0.75, DECK, -0.52], 0.03, 8);
    cyl(chassis, CREAM, [s * 0.78, DECK, 0.3], [s * 0.78, DECK, -1.74], 0.032, 8); // side rails
    cyl(chassis, CREAM, [s * 0.78, 2.1, 0.3], [s * 0.78, 2.1, -1.74], 0.024, 8); // top handrail
    for (const z of [0.3, -0.52, -1.12, -1.74]) cyl(chassis, CREAM, [s * 0.78, DECK, z], [s * 0.78, 2.1, z], 0.022, 6);
    // diagonal braces
    cyl(chassis, CREAM, [s * 0.75, 1.55, -0.52], [s * 0.75, DECK, -1.0], 0.018, 6);
    cyl(chassis, CREAM, [s * 0.75, 1.55, -1.62], [s * 0.75, DECK, -1.1], 0.018, 6);
    // base feet
    put(chassis, STEEL, tr(rbox(0.1, 0.05, 0.1, 0.012, 1), [s * 0.75, 1.3, -1.62]));
    put(chassis, STEEL, tr(rbox(0.1, 0.05, 0.1, 0.012, 1), [s * 0.75, 1.3, -0.52]));
  }
  for (const z of [0.3, -0.52, -1.12, -1.74]) {
    cyl(chassis, CREAM, [-0.78, DECK, z], [0.78, DECK, z], 0.03, 8);
    if (z === 0.3 || z === -1.74) cyl(chassis, CREAM, [-0.78, 2.1, z], [0.78, 2.1, z], 0.024, 8);
  }
  for (const x of [-0.5, 0, 0.5]) put(chassis, WOOD2, tr(rbox(0.07, 0.05, 2.02, 0.012, 1), [x, DECK + 0.045, -0.72]));
  for (let i = 0; i < 17; i++) {
    put(chassis, i % 2 ? WOOD : "#d79a5a", tr(rbox(1.5, 0.03, 0.095, 0.01, 1), [0, DECK + 0.085, 0.24 - i * 0.12]));
  }

  // ---- luggage -----------------------------------------------------------------------------------------------------
  const LY = DECK + 0.1;
  // rolled striped awning along the left rail
  const awn = paint((p, n) => {
    const a = Math.atan2(p.y - (LY + 0.1), p.x - 0.55);
    const band = Math.floor((a / Math.PI) * 6 + 12) & 1;
    return Math.abs(n.z) > 0.8 ? CREAM2 : band ? CREAM : TEAL;
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 14), awn, { bone: chassis, at: [0.56, LY + 0.1, -0.72], dir: [0, 0, 1], name: "awning" });
  for (const z of [-0.1, -0.7, -1.3]) put(chassis, BROWN, tr(new THREE.TorusGeometry(0.102, 0.012, 4, 12), [0.56, LY + 0.1, z]));
  // tent bedroll
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 1.0, 12), OLIVE, { bone: chassis, at: [-0.05, LY + 0.15, 0.0], dir: [1, 0, 0], name: "bedroll" });
  for (const x of [-0.35, 0.25]) put(chassis, BROWN, tr(new THREE.TorusGeometry(0.153, 0.016, 4, 12), [x, LY + 0.15, 0.0], [0, 90, 0]));
  put(chassis, CREAM2, tr(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), [0.455, LY + 0.15, 0.0], [0, 0, 90]));
  put(chassis, CREAM2, tr(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), [-0.555, LY + 0.15, 0.0], [0, 0, 90]));
  // duffel bag
  const duffel = paint((p, n) => {
    if (Math.abs(p.x + 0.05) > 0.25 && Math.abs(p.x + 0.05) < 0.33 && Math.abs(n.x) < 0.7) return CREAM;
    return RED;
  });
  b.sweep(polyline([[-0.4, LY + 0.2, -0.62], [0.3, LY + 0.2, -0.62]]), 0.2, { color: duffel, bone: chassis, sides: 10, caps: "round", name: "duffel" });
  cyl(chassis, BROWN, [-0.2, LY + 0.4, -0.62], [0.1, LY + 0.4, -0.62], 0.014, 6);
  put(chassis, BROWN, tr(new THREE.TorusGeometry(0.07, 0.014, 4, 10, Math.PI), [-0.2, LY + 0.4, -0.62], [0, 0, 90]));
  put(chassis, BROWN, tr(new THREE.TorusGeometry(0.07, 0.014, 4, 10, Math.PI), [0.1, LY + 0.4, -0.62], [0, 0, -90]));
  put(chassis, CHROME, tr(rbox(0.5, 0.012, 0.025, 0.004, 1), [-0.05, LY + 0.4, -0.62]));
  put(chassis, RED, tr(rbox(0.12, 0.18, 0.12, 0.04), [-0.52, LY + 0.14, -0.62])); // side pocket
  // pith helmet resting on the duffel
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.19, 0.012],
      [0.12, 0.03],
      [0.115, 0.1],
      [0.06, 0.16],
      [0, 0.17],
    ],
    { at: [-0.12, LY + 0.38, -0.78], segments: 12, color: CREAM, bone: chassis, smoothing: 1, name: "pithHelmet" },
  );
  put(chassis, BROWN, tr(new THREE.CylinderGeometry(0.12, 0.125, 0.03, 12), [-0.12, LY + 0.42, -0.78]));
  put(chassis, RED, tr(new THREE.SphereGeometry(0.018, 5, 4), [-0.12, LY + 0.55, -0.78]));
  // banana crate
  b.part(rbox(0.5, 0.34, 0.42, 0.015), woodGrain, { bone: chassis, at: [-0.4, LY + 0.17, -1.2], name: "crate" });
  for (const y of [-0.1, 0.1]) {
    for (const sz of [1, -1]) put(chassis, WOOD2, tr(rbox(0.54, 0.035, 0.03, 0.01, 1), [-0.4, LY + 0.17 + y, -1.2 + sz * 0.215]));
  }
  for (const sx of [1, -1]) for (const sz of [1, -1]) put(chassis, WOOD2, tr(rbox(0.04, 0.36, 0.04, 0.01, 1), [-0.4 + sx * 0.25, LY + 0.17, -1.2 + sz * 0.21]));
  decal(CRATE_LABEL, 0.3, 0.19, [-0.4, LY + 0.17, -0.985], [0, 0, 1], chassis);
  decal(CRATE_LABEL, 0.3, 0.19, [-0.4, LY + 0.17, -1.415], [0, 0, -1], chassis);
  put(chassis, BROWN, tr(new THREE.TorusGeometry(0.16, 0.012, 4, 14), [-0.4, LY + 0.352, -1.2], [90, 0, 0], [1.2, 1, 0.9]));
  // two jerry cans
  const jerry: OutlinePoint[] = [
    [-0.18, 0],
    [0.18, 0],
    [0.18, 0.34],
    [0.1, 0.4],
    [-0.04, 0.4],
    [-0.18, 0.34],
  ];
  for (const [i, z] of [-1.0, -1.28].entries()) {
    const jx = 0.3;
    b.extrude(jerry, { at: [jx, LY, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.17, bevel: 0.03, smoothing: 1, color: i ? OLIVE : "#c9a43a", bone: chassis, name: "jerryCan" });
    put(chassis, STEEL, tr(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), [jx + 0.12, LY + 0.43, z]));
    put(chassis, RED, tr(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), [jx + 0.12, LY + 0.46, z]));
    put(chassis, DARK, tr(rbox(0.12, 0.03, 0.05, 0.01, 1), [jx - 0.04, LY + 0.41, z]));
    decal(JERRY, 0.24, 0.3, [jx, LY + 0.17, z + 0.0875], [0, 0, 1], chassis);
    decal(JERRY, 0.24, 0.3, [jx, LY + 0.17, z - 0.0875], [0, 0, -1], chassis);
  }
  // ratchet strap around jerry cans and rope across the crate
  put(chassis, RED, tr(rbox(0.44, 0.02, 0.5, 0.008, 1), [0.3, LY + 0.34, -1.14]));
  put(chassis, CREAM2, tr(rbox(0.014, 0.36, 0.016, 0.004, 1), [-0.52, LY + 0.17, -1.2]));
  // folding shovel strapped to the rack side
  cyl(chassis, WOOD2, [-0.7, DECK + 0.1, -1.7], [-0.7, DECK + 0.1, -0.5], 0.022, 6);
  put(chassis, STEEL, tr(rbox(0.14, 0.015, 0.2, 0.006, 1), [-0.7, DECK + 0.1, -0.4]));

  // ---- cabin: seats, dash, controls, cargo -----------------------------------------------------------------------
  const seat = (x: number, z: number, w: number, heads: number[]) => {
    put(chassis, DARK, tr(rbox(w - 0.14, 0.12, 0.4, 0.02, 1), [x, 0.68, z]));
    b.part(rbox(w, 0.16, 0.52, 0.06, 3), fabric, { bone: chassis, at: [x, 0.8, z], name: "seatCushion" });
    b.part(rbox(w, 0.62, 0.13, 0.06, 3), fabric, { bone: chassis, at: [x, 1.17, z - 0.27], rotation: [-8, 0, 0], name: "seatBack" });
    for (const hx of heads) {
      put(chassis, TEAL2, tr(rbox(0.26, 0.15, 0.1, 0.045, 2), [x + hx, 1.55, z - 0.31], [-8, 0, 0]));
      cyl(chassis, STEEL, [x + hx - 0.06, 1.46, z - 0.29], [x + hx - 0.06, 1.52, z - 0.3], 0.01, 5);
      cyl(chassis, STEEL, [x + hx + 0.06, 1.46, z - 0.29], [x + hx + 0.06, 1.52, z - 0.3], 0.01, 5);
    }
    put(chassis, CREAM, tr(rbox(w - 0.02, 0.012, 0.5, 0.01, 1), [x, 0.889, z]));
    for (const px of [-1, 1]) put(chassis, CREAM, tr(rbox(0.014, 0.012, 0.5, 0.01, 1), [x + px * (w / 2 - 0.04), 0.889, z]));
  };
  seat(0.36, -0.1, 0.54, [0]);
  seat(-0.36, -0.1, 0.54, [0]);
  seat(0, -1.12, 1.32, [-0.33, 0.33]);
  for (const [x, o] of [[0.36, 1], [-0.36, -1]] as const) {
    const sx = x + o * 0.2;
    cyl(chassis, DARK, [sx, 1.44, -0.34], [x - o * 0.2, 0.95, -0.2], 0.02, 4);
    cyl(chassis, DARK, [x - o * 0.22, 0.95, -0.2], [x + o * 0.26, 0.9, -0.3], 0.018, 4);
    put(chassis, CHROME, tr(rbox(0.07, 0.05, 0.03, 0.01, 1), [x - o * 0.2, 0.94, -0.2]));
    put(chassis, DARK, tr(rbox(0.05, 0.05, 0.05, 0.01, 1), [sx + o * 0.02, 1.48, -0.36]));
  }
  // fire extinguisher strapped beside the rear bench
  put(chassis, RED, tr(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), [0.6, 0.86, -1.52]));
  put(chassis, DARK, tr(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 6), [0.6, 1.03, -1.52]));
  put(chassis, DARK, tr(rbox(0.08, 0.02, 0.02, 0.005, 1), [0.62, 1.07, -1.52]));
  put(chassis, BROWN, tr(new THREE.TorusGeometry(0.052, 0.01, 4, 8), [0.6, 0.86, -1.52], [90, 0, 0]));
  put(chassis, TEAL2, tr(rbox(0.28, 0.14, 0.92, 0.04, 1), [0, 0.7, -0.02])); // tunnel
  cyl(chassis, CHROME, [0, 0.76, 0.18], [0, 1.02, 0.1], 0.012, 6); // gear stick
  put(chassis, RED, tr(new THREE.SphereGeometry(0.035, 6, 5), [0, 1.04, 0.1]));
  cyl(chassis, CHROME, [0.07, 0.76, -0.1], [0.07, 0.94, -0.18], 0.011, 6);
  put(chassis, DARK, tr(rbox(0.04, 0.03, 0.1, 0.01, 1), [0.07, 0.96, -0.2]));
  // dashboard
  b.part(rbox(1.3, 0.2, 0.3, 0.05, 2), mottle(TEAL2, "#1b8982", { size: 0.2, seed: 8 }), { bone: chassis, at: [0, 0.96, 0.34], name: "dash" });
  put(chassis, TEAL, tr(rbox(1.32, 0.03, 0.32, 0.012, 1), [0, 1.075, 0.34]));
  put(chassis, DARK, tr(rbox(0.36, 0.16, 0.12, 0.04, 2), [-0.36, 1.07, 0.27]));
  for (const x of [-0.44, -0.28]) decal(DIAL, 0.13, 0.13, [x, 1.07, 0.207], [0, 0, -1], chassis, undefined, true);
  put(chassis, DARK, tr(rbox(0.54, 0.15, 0.025, 0.012, 1), [0.32, 0.94, 0.185])); // glovebox
  put(chassis, CHROME, tr(rbox(0.06, 0.025, 0.02, 0.008, 1), [0.32, 0.98, 0.17]));
  b.sweep(polyline([[0.1, 1.07, 0.2], [0.1, 1.17, 0.2], [0.5, 1.17, 0.2], [0.5, 1.07, 0.2]]), 0.016, { color: CHROME, bone: chassis, sides: 6, caps: "round" });
  // radio + vents
  put(chassis, DARK, tr(rbox(0.22, 0.09, 0.03, 0.01, 1), [0, 0.98, 0.19]));
  for (const x of [-0.04, 0.04]) put(chassis, RED, tr(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6), [x, 0.98, 0.17], [90, 0, 0]));
  // steering wheel (on its own joint)
  const SWc: V = [-0.36, 0.98, 0.06];
  const swq = aim([0, 0.5, -0.87], [0, 1, 0], "z");
  const swPlace = (g: THREE.BufferGeometry) => {
    g.applyQuaternion(swq);
    g.translate(...SWc);
    return g;
  };
  put(wheelCol, BROWN, swPlace(new THREE.TorusGeometry(0.19, 0.024, 6, 16)));
  put(wheelCol, CHROME, swPlace(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8).rotateX(Math.PI / 2)));
  put(wheelCol, RED, swPlace(tr(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 8), [0, 0, -0.03], [90, 0, 0])));
  for (const a of [90, 210, 330]) {
    const r = a * D;
    put(wheelCol, CHROME, swPlace(tubeGeo([0, 0, 0], [Math.cos(r) * 0.18, Math.sin(r) * 0.18, 0], 0.012, 5)));
  }
  cyl(chassis, DARK, [SWc[0], 0.82, 0.34], [SWc[0], SWc[1] - 0.02, SWc[2] + 0.04], 0.03, 8);
  // little plush giraffe on the dash
  const giraffe = paint((p) => (noise(p, 0.035, 5) > 0.55 ? BROWN : "#f2c14e"));
  b.part(rbox(0.1, 0.07, 0.13, 0.025), giraffe, { bone: chassis, at: [0.0, 1.14, 0.3], name: "giraffeBody" });
  b.part(rbox(0.04, 0.12, 0.04, 0.015), giraffe, { bone: chassis, at: [0, 1.2, 0.35], name: "giraffeNeck" });
  b.part(rbox(0.06, 0.05, 0.07, 0.02), giraffe, { bone: chassis, at: [0, 1.27, 0.37], name: "giraffeHead" });
  for (const s of [1, -1]) {
    put(chassis, BROWN, tr(new THREE.SphereGeometry(0.012, 5, 4), [s * 0.022, 1.31, 0.36]));
    put(chassis, DARK, tr(new THREE.SphereGeometry(0.009, 5, 4), [s * 0.022, 1.28, 0.405]));
    for (const z of [0.07, -0.07]) put(chassis, "#f2c14e", tr(rbox(0.025, 0.05, 0.025, 0.01, 1), [s * 0.03, 1.08, 0.3 + z]));
  }
  put(chassis, DARK, tr(new THREE.SphereGeometry(0.011, 5, 4), [0, 1.265, 0.41]));
  // binoculars on the passenger seat
  put(chassis, DARK, tr(new THREE.CylinderGeometry(0.035, 0.03, 0.14, 8), [0.3, 0.92, -0.05], [90, 0, 0]));
  put(chassis, DARK, tr(new THREE.CylinderGeometry(0.035, 0.03, 0.14, 8), [0.38, 0.92, -0.05], [90, 0, 0]));
  put(chassis, BROWN, tr(rbox(0.1, 0.03, 0.05, 0.01, 1), [0.34, 0.92, -0.05]));
  // cargo behind the rear bench: picnic basket, thermos, spare can
  b.part(rbox(0.42, 0.2, 0.3, 0.03), wicker, { bone: chassis, at: [-0.25, 0.74, -1.6], name: "basket" });
  b.part(rbox(0.44, 0.06, 0.32, 0.025), CREAM, { bone: chassis, at: [-0.25, 0.87, -1.6], name: "basketLid" });
  put(chassis, BROWN, tr(new THREE.TorusGeometry(0.1, 0.012, 4, 10, Math.PI), [-0.25, 0.9, -1.6], [0, 0, 0]));
  put(chassis, RED, tr(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8), [0.15, 0.79, -1.6]));
  put(chassis, CREAM, tr(new THREE.CylinderGeometry(0.052, 0.045, 0.06, 8), [0.15, 0.96, -1.6]));
  put(chassis, STEEL, tr(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 8), [0.15, 0.7, -1.6]));

  // ---- antenna with a pennant (a real little chain so it can sway) ------------------------------------------------
  const ant = b.chain("antenna", catmull([[-0.78, 1.3, -1.58], [-0.81, 1.65, -1.6], [-0.84, 2.0, -1.62], [-0.86, 2.36, -1.62]]), { parent: chassis, count: 3 });
  b.sweep(ant, [0.016, 0.006], { color: CHROME, caps: "round" });
  const tip = ant.joints[ant.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.024, 6, 4), RED, { bone: tip, at: [-0.86, 2.38, -1.62] });
  b.extrude(
    [
      [0, 0],
      [0.5, 0.1, "sharp"],
      [0, 0.22],
    ],
    {
      at: [-0.86, 2.12, -1.62],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      color: paint((_p, _n, s) => (s[0] < 0.1 || Math.abs(s[1] - 0.11) < 0.03 * (1 - s[0] / 0.5) + 0.01 ? CREAM : RED)),
      bone: tip,
      name: "pennant",
    },
  );
  put(chassis, STEEL, tr(rbox(0.1, 0.06, 0.1, 0.015, 1), [-0.77, 1.3, -1.58]));

  // ---- story details: hanging lanterns, a daisy on the dash, a butterfly on the hood, grass tucked in the bumper ----
  for (const s of [1, -1]) {
    const lx = s * 0.9;
    const ly = 1.98;
    const lz = -1.12;
    cyl(chassis, STEEL, [s * 0.78, 2.1, lz], [lx, 2.1, lz], 0.012, 5);
    for (let i = 0; i < 3; i++) put(chassis, STEEL, tr(new THREE.TorusGeometry(0.014, 0.004, 4, 6), [lx, 2.075 - i * 0.022, lz], [0, i % 2 ? 0 : 90, 0]));
    put(chassis, DARK, tr(new THREE.CylinderGeometry(0.035, 0.06, 0.03, 8), [lx, ly + 0.085, lz]));
    put(chassis, DARK, tr(new THREE.CylinderGeometry(0.06, 0.05, 0.03, 8), [lx, ly - 0.075, lz]));
    put(chassis, DARK, tr(new THREE.TorusGeometry(0.03, 0.006, 4, 8, Math.PI), [lx, ly + 0.1, lz]));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      cyl(chassis, DARK, [lx + Math.cos(a) * 0.055, ly - 0.06, lz + Math.sin(a) * 0.055], [lx + Math.cos(a) * 0.04, ly + 0.07, lz + Math.sin(a) * 0.04], 0.006, 4);
    }
    glow(b.part(new THREE.CylinderGeometry(0.048, 0.055, 0.13, 8), AMBER, { bone: chassis, at: [lx, ly, lz], name: "lantern" }), 1.2);
  }
  // potted daisy
  const DPX = 0.56;
  const DPZ = 0.34;
  put(chassis, RED, tr(new THREE.CylinderGeometry(0.04, 0.03, 0.05, 8), [DPX, 1.1, DPZ]));
  put(chassis, CREAM, tr(new THREE.CylinderGeometry(0.042, 0.042, 0.01, 8), [DPX, 1.13, DPZ]));
  cyl(chassis, "#4f8f3a", [DPX, 1.12, DPZ], [DPX, 1.23, DPZ + 0.01], 0.006, 5);
  put(chassis, "#4f8f3a", tr(new THREE.SphereGeometry(0.025, 5, 4), [DPX + 0.025, 1.16, DPZ], [0, 0, 30], [1.6, 0.4, 0.8]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(chassis, CREAM, tr(new THREE.SphereGeometry(0.02, 5, 4), [DPX + Math.cos(a) * 0.03, 1.235 + Math.sin(a) * 0.03, DPZ + 0.013], [0, 0, a / D], [1.5, 0.7, 0.5]));
  }
  put(chassis, AMBER, tr(new THREE.SphereGeometry(0.018, 6, 4), [DPX, 1.235, DPZ + 0.02]));
  // butterfly resting on the hood
  const wingPaint = paint((_p, _n, s) => (Math.hypot(s[0] - 0.042, s[1] - 0.026) < 0.009 || Math.hypot(s[0] - 0.03, s[1] + 0.03) < 0.007 ? CREAM : TEAL));
  const BX = 0.42;
  const BZ = 1.38;
  for (const s of [1, -1]) {
    b.extrude([[0, 0.004], [0.03, 0.05], [0.075, 0.048], [0.08, 0.01], [0.012, -0.002]], { at: [BX, 1.2545, BZ], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.004, smoothing: 1, color: wingPaint, bone: hood, name: "butterflyWing" });
    b.extrude([[0, -0.002], [0.07, -0.01], [0.05, -0.06], [0.01, -0.04]], { at: [BX, 1.2545, BZ], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.004, smoothing: 1, color: AMBER, bone: hood, name: "butterflyWing" });
    cyl(hood, DARK, [BX + s * 0.004, 1.258, BZ + 0.03], [BX + s * 0.03, 1.285, BZ + 0.1], 0.002, 3);
  }
  put(hood, DARK, tr(new THREE.CapsuleGeometry(0.008, 0.07, 2, 5), [BX, 1.257, BZ - 0.005], [90, 0, 0]));
  // dried-grass tufts tucked into the bumper and the rack
  const GRASS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
  <path d="M18 60 C17 40 10 26 4 6 C14 20 22 38 23 60Z" fill="#9db646"/>
  <path d="M20 60 C21 36 24 20 30 4 C30 24 27 42 25 60Z" fill="#7a9a34"/>
  <path d="M16 60 C14 44 14 30 17 12 C20 30 22 44 22 60Z" fill="#b6c85a"/>
  <path d="M23 60 C26 46 31 34 38 24 C32 42 29 50 27 60Z" fill="#8fae3b"/>
  <path d="M15 60 C11 48 6 40 1 34 C8 42 14 50 19 60Z" fill="#7a9a34"/>
</svg>`,
    { size: 160 },
  );
  const tufts: V[] = [[-0.62, 0.49, 2.0], [-0.4, 0.5, 2.03], [0.42, 0.5, 2.03], [0.64, 0.49, 2.0], [-0.72, 2.0, -1.74], [0.66, 2.0, -1.74]];
  b.cards(tufts.map((p) => frame(p, [0, 1, 0])), GRASS, { size: [0.2, 0.3], lean: 25, bend: 20, flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(5), bone: chassis });

  flush();
  return b.root;
}
