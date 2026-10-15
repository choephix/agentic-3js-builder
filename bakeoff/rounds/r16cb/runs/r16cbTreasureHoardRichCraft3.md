```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint, mix, noise, smoothstep, scales, spots, mottle, catmull, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A stylized, hextech-flavoured dragon hoard: an open ironbound chest with a glowing crystal, a jewelled crown, gold goblets (one spilled), coin stacks, faceted gems and a sloping pile of coins.",
};

const D = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// A local frame: place points and directions relative to a tilted origin.
class Loc {
  o: THREE.Vector3;
  q: THREE.Quaternion;
  constructor(o: THREE.Vector3, rot: number[] = [0, 0, 0]) {
    this.o = o;
    this.q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D, "XYZ"));
  }
  p(x: number, y: number, z: number) {
    return V(x, y, z).applyQuaternion(this.q).add(this.o);
  }
  d(x: number, y: number, z: number) {
    return V(x, y, z).applyQuaternion(this.q);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

const metalPaint = (shadow: string, midc: string, hi: string, seed: number) =>
  paint((p, n) => {
    const t = n.y * 0.75 + n.z * 0.25 + n.x * 0.1;
    const w = noise(p, 0.05, seed);
    let c = mix(shadow, midc, smoothstep(-0.7, 0.35, t));
    c = mix(c, hi, smoothstep(0.35, 0.95, t) * 0.85);
    c = mix(c, shadow, 0.22 * smoothstep(0.55, 0.85, w));
    return c;
  });

const GOLD = metalPaint("#8a3a1c", "#f0a81e", "#fff2a8", 1);
const GOLD_OLD = metalPaint("#5a2212", "#c4681a", "#ffd25a", 2);
const SILVER = metalPaint("#34448a", "#9fb2d8", "#f6f9ff", 3);

const woodPaint = (seed: number, plank: "x" | "y") =>
  paint((p, n) => {
    const g = noise(V(p.x * 0.25, p.y, p.z * 0.25), 0.05, seed);
    const u = plank === "y" ? p.y / 0.095 : (p.x + 0.35) / 0.1;
    const f = u - Math.floor(u);
    let c = mix("#4a2412", "#a8642e", 0.2 + 0.7 * g);
    if (f < 0.06) c = mix(c, "#22100a", 0.85);
    else if (f < 0.12) c = mix(c, "#d08a4a", 0.25);
    const lit = smoothstep(-0.3, 0.9, n.y * 0.6 + n.z * 0.4 + n.x * 0.1);
    c = mix(mix(c, "#2a1038", 0.4), c, 0.5 + 0.5 * lit);
    return mix(c, "#1c0c08", 0.5 * smoothstep(0.14, 0.0, p.y));
  });

const COINS = scales(["#f6b93a", "#e8982a", "#ffd45e", "#f0a830", "#d98420"], "#7a3a10", { size: 0.055, width: 0.18, seed: 4 });
const PILE = paint((p, n) => {
  const c = COINS.at(p, n);
  const lit = smoothstep(-0.4, 0.95, n.y);
  let out = mix("#7a2e1e", c, 0.45 + 0.55 * lit);
  out = mix(out, "#fff3b0", 0.28 * smoothstep(0.75, 1, n.y));
  return mix(out, "#3a1608", 0.55 * smoothstep(0.12, 0, p.y));
});

const ERMINE = spots("#fbf5e6", "#231a26", { size: 0.04, amount: 0.35, seed: 5 });
const VELVET = mottle("#b0163a", "#5c0a2a", { size: 0.04, seed: 6 });

const gemPaint = (base: string, deep: string, lite: string) =>
  paint((_p, n) => {
    const az = Math.atan2(n.x, n.z);
    const f = 0.5 + 0.5 * Math.sin(az * 4 + 0.6);
    const up = smoothstep(-0.3, 1, n.y);
    let c = mix(deep, base, 0.35 + 0.65 * up);
    c = mix(c, lite, 0.35 * f * up + 0.55 * smoothstep(0.92, 1, n.y));
    return c;
  });

const GEMS = {
  ruby: gemPaint("#e0203c", "#6a0a2a", "#ff9aa8"),
  sapphire: gemPaint("#2f62ff", "#0c1a78", "#a8c4ff"),
  emerald: gemPaint("#1fcf6a", "#06502c", "#a8ffcc"),
  amethyst: gemPaint("#a845ff", "#3c0f7a", "#e4b4ff"),
  topaz: gemPaint("#ffb21e", "#9a4a08", "#fff0a0"),
  aqua: gemPaint("#35e6e0", "#0a5a7a", "#c8fffa"),
  rose: gemPaint("#ff5fa8", "#8a1450", "#ffc4e0"),
};
type GemKey = keyof typeof GEMS;
const GEM_KEYS = Object.keys(GEMS) as GemKey[];

// ---------------------------------------------------------------------------------------------------------------
// Textures

function coinSvg(hi: string, mid: string, lo: string) {
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.36" cy="0.3" r="0.9"><stop offset="0" stop-color="${hi}"/><stop offset="0.6" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient></defs>
      <rect width="100" height="100" fill="${mid}"/>
      <circle cx="50" cy="50" r="50" fill="url(#g)"/>
      <circle cx="50" cy="50" r="45" fill="none" stroke="${lo}" stroke-width="4"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="${hi}" stroke-width="2" stroke-dasharray="3 3.4"/>
      <path d="M50 22 L73 36 L73 64 L50 78 L27 64 L27 36 Z" fill="${mid}" stroke="${lo}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 32 L60 50 L50 68 L40 50 Z" fill="${hi}" stroke="${lo}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M18 34 Q30 14 52 10" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
}
const COIN_G = coinSvg("#fff2a0", "#f2b02a", "#8a4210");
const COIN_S = coinSvg("#ffffff", "#aab8d8", "#4a5888");

const SPARK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0Z" fill="#fff6b8"/>
    <path d="M50 20 L57 43 L80 50 L57 57 L50 80 L43 57 L20 50 L43 43Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const hexPts = (r: number, rot = 0) =>
  [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (i * 60 + rot) * D;
      return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`;
    })
    .join(" ");
function runeSvg() {
  let ticks = "";
  let dots = "";
  for (let i = 0; i < 24; i++) {
    const a = i * 15 * D;
    const r0 = 43.5;
    const r1 = i % 2 ? 46 : 48.5;
    ticks += `<line x1="${(50 + r0 * Math.sin(a)).toFixed(1)}" y1="${(50 - r0 * Math.cos(a)).toFixed(1)}" x2="${(50 + r1 * Math.sin(a)).toFixed(1)}" y2="${(50 - r1 * Math.cos(a)).toFixed(1)}"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D;
    dots += `<circle cx="${(50 + 38 * Math.sin(a)).toFixed(1)}" cy="${(50 - 38 * Math.cos(a)).toFixed(1)}" r="2.6" fill="#9ff8ff" stroke="none"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#5ff2ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="50" r="41"/>
        <polygon points="${hexPts(31)}"/>
        <polygon points="${hexPts(19, 30)}"/>
        ${ticks}
      </g>${dots}
    </svg>`,
    { size: 512 },
  );
}
const RUNE = runeSvg();

const hexPlaque = (inner: string, extra: string) =>
  svg(
    `<svg viewBox="0 0 80 92" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="0.55" stop-color="#e8a020"/><stop offset="1" stop-color="#9a4a10"/></linearGradient>
        <linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${inner}"/><stop offset="1" stop-color="#0c1448"/></linearGradient>
      </defs>
      <polygon points="40,2 78,24 78,68 40,90 2,68 2,24" fill="url(#gd)" stroke="#5a2410" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="40,12 68,28 68,64 40,80 12,64 12,28" fill="url(#bl)" stroke="#5a2410" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="40" cy="6" r="2.6" fill="#fff2a0"/><circle cx="74" cy="26" r="2.4" fill="#fff2a0"/><circle cx="74" cy="66" r="2.4" fill="#fff2a0"/>
      <circle cx="40" cy="86" r="2.6" fill="#fff2a0"/><circle cx="6" cy="66" r="2.4" fill="#fff2a0"/><circle cx="6" cy="26" r="2.4" fill="#fff2a0"/>
      ${extra}
    </svg>`,
    { size: 256 },
  );
const LOCK = hexPlaque(
  "#3a6aff",
  `<circle cx="40" cy="40" r="9.5" fill="#0a0a1c" stroke="#ffd860" stroke-width="2"/>
   <path d="M35 46 L45 46 L48 66 L32 66 Z" fill="#0a0a1c" stroke="#ffd860" stroke-width="2" stroke-linejoin="round"/>`,
);
const EMBLEM = hexPlaque(
  "#3f86ff",
  `<path d="M40 22 L56 60 L48 60 L40 40 L32 60 L24 60 Z" fill="#ffe680" stroke="#5a2410" stroke-width="2" stroke-linejoin="round"/>
   <path d="M24 66 L56 66" stroke="#ffe680" stroke-width="3" stroke-linecap="round"/>
   <circle cx="40" cy="30" r="3.4" fill="#bff8ff"/>`,
);
const ORN = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 30 C20 4 46 8 50 30 C52 46 34 50 33 38 C32 29 43 28 44 35"/>
      <path d="M94 30 C80 56 54 52 50 30 C48 14 66 10 67 22 C68 31 57 32 56 25"/>
    </g>
    <g fill="#ffffff">
      <circle cx="50" cy="30" r="4"/>
      <path d="M18 14 Q24 2 34 6 Q30 16 18 14Z"/><path d="M82 46 Q76 58 66 54 Q70 44 82 46Z"/>
    </g>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasure_hoard" });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const rand = rng(7);

  const put = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) => b.part(geo, color, { bone: root, at, ...o });
  const pts = (o: any[], s: number): any => o.map((q) => (q.length === 3 ? [q[0] * s, q[1] * s, q[2]] : [q[0] * s, q[1] * s]));
  const coinGeo = (r = 0.04) => new THREE.CylinderGeometry(r, r, 0.01, 12);

  function hemi(seg: number, rings: number, lump: number, phase: number) {
    const g = new THREE.SphereGeometry(1, seg, rings, 0, Math.PI * 2, 0, Math.PI / 2);
    if (lump) {
      const pos = g.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (y > 0.001) {
          const f = 1 + lump * Math.sin(x * 9.1 + z * 7.3 + y * 3 + phase) * Math.cos(z * 8.7 - x * 5.1 + 1.3 + phase);
          pos.setXYZ(i, x * f, y * f, z * f);
        }
      }
    }
    return g;
  }

  // ---- the pile --------------------------------------------------------------------------------------------
  const HEAPS: number[][] = [
    [0.0, 0.25, 1.0, 0.2, 0.55],
    [0.62, 0.12, 0.34, 0.3, 0.34],
    [-0.55, 0.3, 0.4, 0.24, 0.36],
    [0.0, -0.12, 0.55, 0.18, 0.3],
    [-0.32, 0.68, 0.38, 0.1, 0.22],
    [0.42, 0.72, 0.55, 0.1, 0.28],
    [0.8, -0.3, 0.3, 0.22, 0.28],
    [-0.8, -0.3, 0.3, 0.22, 0.28],
  ];
  const heapParts = HEAPS.map(([cx, cz, rx, ry, rz], i) =>
    put(hemi(12, 5, 0.1, i * 1.7), PILE, V(cx, 0, cz), { scale: [rx, ry, rz], flat: true }),
  );
  const ground = b.surface(heapParts);
  const gy = (x: number, z: number) => ground.ray([x, 3, z], [0, -1, 0])?.at.y ?? 0;

  // ---- gems ------------------------------------------------------------------------------------------------
  const GEM_OUT = [
    [0, 0],
    [1, 0.5],
    [1, 0.6],
    [0.55, 0.9],
    [0, 0.9],
  ];
  function gem(at: THREE.Vector3, axis: THREE.Vector3, size: number, color: any, spin = 0, bone: any = root) {
    const a = axis.clone().normalize();
    const origin = at.clone().addScaledVector(a, -0.45 * size);
    const outline: any = GEM_OUT.map(([x, y]) => [x * size, y * size, "sharp"]);
    return b.lathe(outline, { at: origin, axis: [a.x, a.y, a.z], segments: 8, spin, color, bone });
  }
  function gemOn(skin: ReturnType<typeof b.surface>, x: number, z: number, key: GemKey, size: number, tilt = 0.7) {
    const h = skin.ray([x, 3, z], [0, -1, 0]);
    if (!h) return;
    const a = new THREE.Vector3().copy(h.n).add(V((rand() - 0.5) * tilt, 0, (rand() - 0.5) * tilt)).normalize();
    gem(new THREE.Vector3().copy(h.at), a, size, GEMS[key], rand() * 45);
  }

  // ---- chest -----------------------------------------------------------------------------------------------
  const CW = 0.7, CH = 0.4, CD = 0.42, CZ = -0.38;
  const ZF = CZ + CD / 2;
  const ZB = CZ - CD / 2;
  const lid = b.joint("lid", { parent: root, at: [0, CH, ZB], dir: [0, 0, 1], role: "hinge" });
  const onLid = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) => b.part(geo, color, { bone: lid, at, ...o });

  const WOOD_BODY = woodPaint(3, "y");
  const WOOD_LID = woodPaint(4, "x");
  put(new THREE.BoxGeometry(CW, CH, CD), WOOD_BODY, V(0, CH / 2, CZ));
  // gold in the chest
  const dome = put(hemi(12, 5, 0.1, 9), PILE, V(0, CH - 0.01, CZ), { scale: [0.3, 0.13, 0.185], flat: true });
  const domeSkin = b.surface(dome);
  // rim trim
  put(new THREE.BoxGeometry(CW + 0.04, 0.05, 0.04), GOLD_OLD, V(0, CH - 0.01, ZF));
  put(new THREE.BoxGeometry(CW + 0.04, 0.05, 0.04), GOLD_OLD, V(0, CH - 0.01, ZB));
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.04, 0.05, CD), GOLD_OLD, V(s * CW / 2, CH - 0.01, CZ));
    for (const zz of [ZF, ZB]) put(new THREE.BoxGeometry(0.07, CH + 0.02, 0.07), GOLD_OLD, V(s * (CW / 2 - 0.005), CH / 2, zz));
    // front straps and rivets
    put(new THREE.BoxGeometry(0.075, CH, 0.016), GOLD_OLD, V(s * 0.25, CH / 2, ZF + 0.004));
    for (const ry of [0.12, 0.2, 0.28, 0.36]) put(new THREE.SphereGeometry(0.0125, 6, 4), GOLD, V(s * 0.25, ry, ZF + 0.012));
    // side emblem
    put(new THREE.PlaneGeometry(0.2, 0.23), "#ffffff", V(s * (CW / 2 + 0.004), 0.27, CZ), { texture: EMBLEM, dir: [s, 0, 0], axis: "z" });
    // side straps
    put(new THREE.BoxGeometry(0.014, CH, 0.06), GOLD_OLD, V(s * (CW / 2 + 0.002), CH / 2, CZ + 0.16));
    put(new THREE.BoxGeometry(0.014, CH, 0.06), GOLD_OLD, V(s * (CW / 2 + 0.002), CH / 2, CZ - 0.16));
    // filigree panels
    for (const py of [0.335, 0.245])
      put(new THREE.PlaneGeometry(0.115, 0.069), "#f6b82c", V(s * 0.14, py, ZF + 0.003), { texture: ORN, dir: [0, 0, 1], axis: "z" });
    // hinges
    onLid(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), GOLD, V(s * 0.2, CH, ZB - 0.008), { rotation: [0, 0, 90] });
    onLid(new THREE.BoxGeometry(0.09, 0.012, 0.12), GOLD_OLD, V(s * 0.2, CH + 0.1, ZB - 0.02), { rotation: [0, 0, 0] });
  }
  // lock plate, glowing keyhole gem
  put(new THREE.PlaneGeometry(0.13, 0.15), "#ffffff", V(0, 0.27, ZF + 0.022), { texture: LOCK, dir: [0, 0, 1], axis: "z" });

  // lid vault
  const arch: any[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = i * 22.5 * D;
    arch.push([0.21 * Math.cos(a), 0.19 * Math.sin(a)]);
  }
  b.extrude(arch as any, { at: [0, CH, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: CW, bevel: 0.008, color: WOOD_LID, bone: lid });
  onLid(new THREE.BoxGeometry(CW - 0.08, 0.012, CD - 0.06), VELVET, V(0, CH - 0.004, CZ));
  const archPath = (x: number) => {
    const q: number[][] = [];
    for (let i = 0; i <= 8; i++) {
      const a = i * 22.5 * D;
      q.push([x, CH + 0.2 * Math.sin(a), CZ + 0.22 * Math.cos(a)]);
    }
    return q;
  };
  for (const s of [1, -1]) {
    b.sweep(catmull(archPath(s * 0.25)), () => [0.04, 0.01], { section: "box", caps: "flat", color: GOLD_OLD, bone: lid });
    b.sweep(catmull(archPath(s * 0.345)), () => [0.014, 0.012], { section: "box", caps: "flat", color: GOLD, bone: lid });
    for (const a of [20, 55, 90, 125, 160]) {
      const r = a * D;
      onLid(new THREE.SphereGeometry(0.014, 6, 4), GOLD, V(s * 0.25, CH + 0.212 * Math.sin(r), CZ + 0.232 * Math.cos(r)));
    }
  }
  onLid(new THREE.BoxGeometry(CW + 0.04, 0.045, 0.03), GOLD_OLD, V(0, CH + 0.025, ZF + 0.004));
  onLid(new THREE.BoxGeometry(CW + 0.04, 0.045, 0.03), GOLD_OLD, V(0, CH + 0.025, ZB - 0.004));
  b.extrude(
    [[-0.045, 0], [0.045, 0], [0.045, -0.12], [0, -0.16, "sharp"], [-0.045, -0.12]] as any,
    { at: [0, CH + 0.09, ZF + 0.012], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: GOLD, bone: lid },
  );
  onLid(new THREE.SphereGeometry(0.016, 6, 4), "#e0203c", V(0, CH + 0.06, ZF + 0.026));

  // coins and gems inside the chest
  const placeCoin = (h: any, big = false) => {
    const r = rand();
    const tilt = r < 0.55 ? 0.15 : 0.9;
    const dir = new THREE.Vector3().copy(h.n).add(V(rand() - 0.5, rand() - 0.3, rand() - 0.5).multiplyScalar(tilt)).normalize();
    b.stick(coinGeo(big ? 0.05 : 0.04), "#ffffff", frame(new THREE.Vector3().copy(h.at), dir), {
      texture: rand() < 0.82 ? COIN_G : COIN_S,
      spin: rand() * 360,
      embed: tilt > 0.5 ? 0 : 0.6,
      scale: 0.85 + 0.3 * rand(),
      bone: root,
    });
  };
  for (const h of domeSkin.scatter(24, { rng: rng(31), minDist: 0.065, filter: (hh: any) => hh.n.y > 0.3 })) placeCoin(h);
  const inChest: [number, number, GemKey, number][] = [
    [-0.17, -0.31, "ruby", 0.05],
    [0.19, -0.27, "sapphire", 0.045],
    [0.06, -0.18, "emerald", 0.04],
    [-0.23, -0.46, "topaz", 0.04],
    [0.23, -0.47, "amethyst", 0.045],
  ];
  for (const [x, z, k, s] of inChest) gemOn(domeSkin, x, z, k, s);

  // hextech crystal cluster
  function crystal(at: THREE.Vector3, axis: THREE.Vector3, size: number, color: string, strength: number) {
    const a = axis.clone().normalize();
    const prof: any = [[0, 0], [0.5, 0.2], [0.52, 1.2], [0.25, 1.7], [0, 1.9]].map(([x, y]) => [x * size, y * size, "sharp"]);
    return glow(b.lathe(prof, { at, axis: [a.x, a.y, a.z], segments: 6, color, bone: root }), strength);
  }
  const cBase = V(0, CH + 0.1, -0.42);
  put(
    b.lathe(
      [[0, 0], [0.1, 0], [0.11, 0.02], [0.07, 0.045], [0, 0.045]].map(([x, y]) => [x, y, "sharp"]) as any,
      { at: cBase.clone().add(V(0, -0.02, 0)), axis: [0, 1, 0], segments: 6, color: GOLD, bone: root },
    ).mesh.geometry.clone(), GOLD, V(0, -100, 0)).mesh.visible = false;
  crystal(cBase, V(0, 1, 0.05), 0.085, "#3fdcff", 1.1);
  crystal(cBase.clone().add(V(0.05, 0, 0.0)), V(0.55, 1, 0.1), 0.05, "#9af4ff", 1.0);
  crystal(cBase.clone().add(V(-0.05, 0, 0.02)), V(-0.6, 1, 0.1), 0.055, "#1a9bff", 1.0);
  crystal(cBase.clone().add(V(0.0, 0, 0.05)), V(0.1, 0.9, 0.7), 0.045, "#6fe8ff", 1.0);
  glow(
    put(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", V(0, 0.67, -0.5), { texture: RUNE, dir: [0, 0.12, 1], axis: "z" }),
    1.3,
  );

  // ---- goblets ---------------------------------------------------------------------------------------------
  const GOBLET = [
    [0, 0], [0.085, 0], [0.085, 0.012], [0.06, 0.025], [0.028, 0.05], [0.028, 0.095], [0.052, 0.112], [0.052, 0.125],
    [0.028, 0.14], [0.028, 0.16], [0.05, 0.185], [0.088, 0.245], [0.098, 0.3], [0.09, 0.3], [0.078, 0.262],
    [0.055, 0.228], [0, 0.215],
  ];
  function goblet(L: Loc, g: number, metalP: any, trimP: any, gemKeys: GemKey[], filled: boolean) {
    const axis = L.d(0, 1, 0);
    const prof: any = GOBLET.map(([x, y]) => [x * g, y * g]);
    b.lathe(prof, { at: L.o, axis, segments: 10, color: metalP, bone: root });
    const ringProf = (r0: number, r1: number, y0: number, y1: number): any =>
      [[r0 * g, y0 * g, "sharp"], [r1 * g, y0 * g, "sharp"], [r1 * g, y1 * g, "sharp"], [r0 * g, y1 * g, "sharp"]];
    b.lathe(ringProf(0.086, 0.104, 0.285, 0.306), { at: L.o, axis, segments: 10, color: trimP, bone: root });
    b.lathe(ringProf(0.065, 0.093, 0.0, 0.015), { at: L.o, axis, segments: 10, color: trimP, bone: root });
    b.lathe(ringProf(0.05, 0.062, 0.1, 0.128), { at: L.o, axis, segments: 8, color: trimP, bone: root });
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * D;
      const r = 0.062 * g;
      gem(L.p(r * Math.sin(a), 0.205 * g, r * Math.cos(a)), L.d(Math.sin(a), 0.3, Math.cos(a)), 0.024 * g, GEMS[gemKeys[i % gemKeys.length]], i * 20);
    }
    if (filled) {
      put(hemi(10, 4, 0.1, g), PILE, L.p(0, 0.27 * g, 0), { scale: [0.076 * g, 0.075 * g, 0.076 * g], dir: axis, flat: true });
      gem(L.p(0.02 * g, 0.33 * g, 0.015 * g), L.d(0.3, 1, 0.2), 0.03 * g, GEMS.ruby, 10);
      gem(L.p(-0.025 * g, 0.325 * g, -0.01 * g), L.d(-0.3, 1, 0.1), 0.026 * g, GEMS.sapphire, 5);
    }
  }
  // upright gold goblet on the right
  goblet(new Loc(V(0.62, gy(0.62, 0.12) - 0.02, 0.12), [0, 20, 0]), 1.2, GOLD, GOLD_OLD, ["ruby", "emerald", "sapphire"], true);
  // silver chalice at the back right
  goblet(new Loc(V(0.8, gy(0.8, -0.3) - 0.02, -0.3), [3, -30, -3]), 1.0, SILVER, GOLD_OLD, ["sapphire", "aqua", "amethyst"], true);
  // tipped gold goblet spilling its hoard
  const yaw = -20;
  const TL = new Loc(V(0.05, gy(0.25, 0.8) + 0.1, 0.74), [0, yaw, -80]);
  goblet(TL, 1.2, GOLD, GOLD_OLD, ["topaz", "ruby", "amethyst"], false);
  const mouth = TL.p(0, 0.3 * 1.2, 0);
  const sd = V(0.97, 0, 0.12).normalize();
  const perp = V(-sd.z, 0, sd.x);
  for (let i = 0; i < 13; i++) {
    const t = 0.05 + i * 0.045;
    const lat = (rand() - 0.5) * (0.05 + 0.012 * i);
    const pos = mouth.clone().addScaledVector(sd, t).addScaledVector(perp, lat);
    const y = Math.max(gy(pos.x, pos.z), 0) + 0.007 + (i < 3 ? 0.05 - i * 0.02 : 0);
    put(coinGeo(0.04), "#ffffff", V(pos.x, y, pos.z), {
      texture: rand() < 0.8 ? COIN_G : COIN_S,
      rotation: [(rand() - 0.5) * 40, rand() * 360, (rand() - 0.5) * 40],
    });
  }
  const spillKeys: GemKey[] = ["ruby", "emerald", "topaz", "aqua"];
  for (let i = 0; i < 4; i++) {
    const pos = mouth.clone().addScaledVector(sd, 0.1 + i * 0.12).addScaledVector(perp, (rand() - 0.5) * 0.12);
    gem(V(pos.x, Math.max(gy(pos.x, pos.z), 0) + 0.03, pos.z), V((rand() - 0.5) * 0.8, 1, (rand() - 0.5) * 0.8), 0.032, GEMS[spillKeys[i]], rand() * 40);
  }

  // ---- crown -----------------------------------------------------------------------------------------------
  const k = 1.4;
  const CL = new Loc(V(-0.55, 0, 0.36), [-9, 28, 9]);
  CL.o.y = gy(-0.55, 0.36) + 0.035;
  const caxis = CL.d(0, 1, 0);
  const crownRing = (prof: number[][], color: any, seg = 12) =>
    b.lathe(prof.map(([x, y]) => [x * k, y * k, "sharp"]) as any, { at: CL.o, axis: caxis, segments: seg, color, bone: root });
  crownRing([[0.122, -0.035], [0.15, -0.035], [0.16, -0.008], [0.152, 0.026], [0.122, 0.026]], ERMINE);
  crownRing([[0.126, 0.022], [0.15, 0.022], [0.174, 0.102], [0.15, 0.102]], GOLD);
  crownRing([[0.146, 0.014], [0.158, 0.014], [0.162, 0.034], [0.148, 0.034]], GOLD_OLD);
  crownRing([[0.15, 0.092], [0.182, 0.092], [0.182, 0.114], [0.154, 0.114]], GOLD_OLD);
  put(hemi(10, 4, 0.03, 2), VELVET, CL.p(0, 0.07 * k, 0), { scale: [0.14 * k, 0.12 * k, 0.14 * k], dir: caxis });
  put(new THREE.SphereGeometry(0.024 * k, 8, 6), GOLD, CL.p(0, 0.192 * k, 0));
  const TALL = [[-0.042, 0], [0.042, 0], [0.034, 0.05], [0.014, 0.078], [0.024, 0.108], [0, 0.13, "sharp"], [-0.024, 0.108], [-0.014, 0.078], [-0.034, 0.05]];
  const SMALL = [[-0.032, 0], [0.032, 0], [0.024, 0.03], [0, 0.06, "sharp"], [-0.024, 0.03]];
  const gemRota: GemKey[] = ["sapphire", "ruby", "emerald", "amethyst", "topaz", "aqua"];
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const r = 0.17 * k;
    // tall point with pearl
    b.extrude(pts(TALL, k), { at: CL.p(r * s, 0.085 * k, r * c), x: CL.d(c, 0, -s), y: caxis, thickness: 0.022 * k, bevel: 0.004, color: GOLD, bone: root });
    put(new THREE.SphereGeometry(0.018 * k, 8, 6), "#f6f0e2", CL.p(r * s, 0.225 * k, r * c));
    // small point between
    const a2 = (i * 60 + 30) * D;
    const s2 = Math.sin(a2);
    const c2 = Math.cos(a2);
    b.extrude(pts(SMALL, k), { at: CL.p(r * s2, 0.088 * k, r * c2), x: CL.d(c2, 0, -s2), y: caxis, thickness: 0.02 * k, bevel: 0.003, color: GOLD, bone: root });
    const rg = 0.158 * k;
    if (i === 0) {
      // the hextech centrepiece
      b.lathe(
        [[0.054 * k, 0, "sharp"], [0.075 * k, 0, "sharp"], [0.075 * k, 0.022 * k, "sharp"], [0.054 * k, 0.022 * k, "sharp"]] as any,
        { at: CL.p(rg * s, 0.056 * k, rg * c), axis: CL.d(s, 0.3, c), segments: 6, color: GOLD_OLD, bone: root },
      );
      glow(gem(CL.p(rg * s, 0.056 * k, rg * c), CL.d(s, 0.3, c), 0.05 * k, "#4fe6ff"), 1.2);
    } else {
      gem(CL.p(rg * s, 0.056 * k, rg * c), CL.d(s, 0.3, c), 0.03 * k, GEMS[gemRota[i]], i * 15);
    }
    gem(CL.p(rg * s2, 0.052 * k, rg * c2), CL.d(s2, 0.3, c2), 0.02 * k, GEMS[gemRota[(i + 3) % 6]], i * 9);
  }

  // ---- coin stacks, scattered coins and gems --------------------------------------------------------------
  function stack(x: number, z: number, n: number, tex: THREE.Texture) {
    const y0 = gy(x, z) - 0.006;
    for (let i = 0; i < n; i++)
      put(new THREE.CylinderGeometry(0.042, 0.042, 0.011, 12), "#ffffff", V(x + (rand() - 0.5) * 0.01, y0 + 0.0055 + i * 0.0115, z + (rand() - 0.5) * 0.01), {
        texture: tex,
        rotation: [0, rand() * 360, 0],
      });
  }
  stack(-0.42, 0.74, 8, COIN_G);
  stack(-0.3, 0.8, 5, COIN_S);
  stack(-0.2, 0.68, 3, COIN_G);
  stack(0.0, 0.52, 4, COIN_G);

  const keepClear = [
    [-0.55, 0.36, 0.26],
    [0.62, 0.12, 0.14],
    [0.8, -0.3, 0.12],
    [0.3, 0.8, 0.3],
    [-0.38, 0.75, 0.12],
    [0.0, 0.52, 0.06],
  ];
  const coinHits = ground.scatter(140, {
    rng: rng(21),
    minDist: 0.07,
    filter: (h: any) =>
      h.n.y > 0.25 &&
      !(Math.abs(h.at.x) < 0.4 && h.at.z < -0.1 && h.at.y < 0.5) &&
      !keepClear.some(([x, z, r]) => Math.hypot(h.at.x - x, h.at.z - z) < r),
  });
  for (const h of coinHits) placeCoin(h);

  const gemList: [number, number, GemKey, number][] = [
    [0.05, 0.5, "ruby", 0.075],
    [-0.15, 0.42, "sapphire", 0.06],
    [0.28, 0.42, "emerald", 0.065],
    [-0.9, 0.1, "amethyst", 0.06],
    [0.95, 0.2, "topaz", 0.055],
    [-0.7, -0.3, "ruby", 0.09],
    [-0.88, -0.22, "sapphire", 0.07],
    [-0.78, -0.42, "emerald", 0.06],
    [0.95, -0.25, "aqua", 0.06],
    [0.7, -0.42, "rose", 0.05],
    [0.75, 0.55, "amethyst", 0.06],
    [-0.58, 0.64, "ruby", 0.05],
    [0.0, 0.62, "topaz", 0.045],
  ];
  for (const [x, z, kk, s] of gemList) gemOn(ground, x, z, kk, s);
  const smallGems = ground.scatter(14, {
    rng: rng(55),
    minDist: 0.12,
    filter: (h: any) =>
      h.n.y > 0.4 &&
      !(Math.abs(h.at.x) < 0.4 && h.at.z < -0.1 && h.at.y < 0.5) &&
      !keepClear.some(([x, z, r]) => Math.hypot(h.at.x - x, h.at.z - z) < r),
  });
  smallGems.forEach((h: any, i: number) => {
    const a = new THREE.Vector3().copy(h.n).add(V(rand() - 0.5, 0, rand() - 0.5)).normalize();
    gem(new THREE.Vector3().copy(h.at), a, 0.028 + rand() * 0.012, GEMS[GEM_KEYS[i % GEM_KEYS.length]], rand() * 45);
  });

  // ---- sparkles ---------------------------------------------------------------------------------------------
  const sparks: [number[], number][] = [
    [[-0.55, 0.62, 0.62], 0.14],
    [[0.0, 0.84, -0.4], 0.16],
    [[0.05, 0.62, 0.55], 0.12],
    [[0.63, 0.5, 0.2], 0.12],
    [[-0.7, 0.36, -0.3], 0.12],
    [[0.34, 0.38, -0.2], 0.1],
    [[0.05, 0.3, 0.8], 0.1],
    [[0.95, 0.3, -0.25], 0.1],
  ];
  for (const [at, s] of sparks)
    glow(put(new THREE.PlaneGeometry(s, s), "#ffffff", V(at[0], at[1], at[2]), { texture: SPARK, dir: [0, 0.25, 1], axis: "z" }), 1);

  // open the chest
  b.pose(lid, { axis: [1, 0, 0], deg: -112 });

  return b.root;
}
```