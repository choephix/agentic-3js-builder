import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, grain, mix, mottle, noise, paint, smoothstep, spots } from "../src/paint";
import type { ColorInput } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Garden Gnome Patch",
  description:
    "A storybook garden corner: three gnomes (one peeking out of a flowerpot), a mossy birdbath with a bluebird and rubber duck, a mint watering can, terracotta pots, a flower wheelbarrow, a veg plot, a picket fence with a swinging gate and bunting, a gnome-door tree stump and a hanging sign.",
  style: "whimsical",
  commit: "88fc1f0",
};

type V = [number, number, number];
const DEG = Math.PI / 180;
const G = 0.12; // ground level on the turf base

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours; paints below are free)
const C = {
  stone1: "#bdb8a8",
  stone2: "#a9a899",
  stone3: "#d2cbb6",
  stone4: "#97988c",
  moss: "#78a850",
  wood1: "#c98e55",
  wood2: "#a96b3c",
  wood3: "#7b4b2b",
  woodDark: "#4f2f1c",
  white: "#fffaf0",
  cream: "#f3ead2",
  stem: "#3f8a38",
  leaf: "#58a845",
  leafDark: "#2f7433",
  leafLight: "#8fd36a",
  red: "#e8403f",
  pink: "#ff8fb2",
  hotPink: "#f4558f",
  yellow: "#ffd23f",
  gold: "#f6c542",
  orange: "#ff962e",
  purple: "#8c5cd0",
  violet: "#5b3b9c",
  blue: "#4aa0e6",
  navy: "#2f5fae",
  sky: "#9bd8f5",
  water: "#8fd7ef",
  skin: "#ffc9a8",
  nose: "#ff9a86",
  cheek: "#ff8d94",
  ink: "#2b1a2e",
  beard: "#fdfaf2",
  boot: "#6b3f2a",
  belt: "#4a2c1f",
  mint: "#6fd0b8",
  mintDark: "#3fae93",
  steel: "#c3d0d8",
  iron: "#4a4650",
  soil: "#6b4429",
  soilDark: "#4d301d",
  carrot: "#ff8a24",
  cabbage: "#8fcf6a",
  cabbage2: "#b9e58e",
  tire: "#3b3633",
  glass: "#ffd36b",
  barrow: "#d9524a",
  barrow2: "#f3d9a8",
  bird: "#4c9be0",
  birdBelly: "#ffe6c0",
  beak: "#ff9d2e",
  duck: "#ffe14a",
  shell: "#e9a45b",
  snail: "#d7c7a2",
  bark: "#8a5a3a",
  petalW: "#ffffff",
  mush: "#e8403f",
  mushCream: "#f5ecd2",
  mushBrown: "#b37a4a",
};

// ---------------------------------------------------------------------------------------------------------------
// Textures
const LEAF = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 63 C3 49 1 22 20 2 C39 22 37 49 20 63Z" fill="#5db04a" stroke="#2f7a34" stroke-width="2.6"/><path d="M20 62 L20 9" stroke="#9fdd78" stroke-width="3" fill="none"/><path d="M20 46 L9 35 M20 37 L31 26 M20 29 L10 20 M20 22 L28 15" stroke="#9fdd78" stroke-width="2.4" fill="none"/></svg>`,
  { size: 128 },
);
const LEAF_LIGHT = svg(
  `<svg viewBox="0 0 48 56"><path d="M24 55 C6 52 0 38 6 28 C2 20 10 10 16 12 C16 4 30 2 33 10 C42 8 48 20 42 28 C48 40 40 52 24 55Z" fill="#b9e58e" stroke="#6fae48" stroke-width="2.6"/><path d="M24 54 L24 14 M24 42 L12 30 M24 36 L36 24 M24 28 L15 18" stroke="#e5f8c4" stroke-width="2.6" fill="none"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 64 48"><path d="M8 48 C8 30 10 16 4 4 C16 14 20 30 22 48Z" fill="#4f9e3b"/><path d="M20 48 C22 28 26 14 28 0 C36 14 36 30 36 48Z" fill="#6cc050"/><path d="M34 48 C38 30 46 18 58 8 C54 24 50 36 48 48Z" fill="#58a845"/><path d="M46 48 C50 38 56 30 62 24 C60 36 58 44 58 48Z" fill="#7ad25a"/></svg>`,
  { size: 128 },
);
const flowerSvg = (petal: string, edge: string, centre: string) =>
  svg(
    `<svg viewBox="0 0 40 64"><path d="M20 63 C20 50 20 40 20 28" stroke="#3f8a38" stroke-width="3.4" fill="none"/><path d="M20 52 C12 50 8 44 6 40 C14 40 18 44 20 48Z M20 46 C28 44 32 38 34 34 C26 34 22 38 20 42Z" fill="#58a845"/><g fill="${petal}" stroke="${edge}" stroke-width="1.4"><ellipse cx="20" cy="12" rx="4.4" ry="8"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(45 20 20)"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(90 20 20)"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(135 20 20)"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(180 20 20)"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(225 20 20)"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(270 20 20)"/><ellipse cx="20" cy="12" rx="4.4" ry="8" transform="rotate(315 20 20)"/></g><circle cx="20" cy="20" r="5.6" fill="${centre}" stroke="#c98a14" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
const DAISY = flowerSvg("#ffffff", "#d9d2c0", "#ffcf2e");
const BUTTERCUP = flowerSvg("#ffe14a", "#e0a81c", "#ff9a2e");
const COSMOS = flowerSvg("#ff8fb2", "#d9608c", "#ffe14a");
const CARROTTOP = svg(
  `<svg viewBox="0 0 48 64"><g stroke="#3f9a3a" stroke-width="3.2" fill="none"><path d="M24 63 C24 44 22 24 14 4"/><path d="M24 63 C26 44 30 26 36 6"/><path d="M24 63 C24 46 24 30 24 2"/></g><g fill="#58b043"><ellipse cx="17" cy="20" rx="3" ry="6" transform="rotate(-25 17 20)"/><ellipse cx="12" cy="10" rx="2.6" ry="5.5" transform="rotate(-20 12 10)"/><ellipse cx="31" cy="22" rx="3" ry="6" transform="rotate(25 31 22)"/><ellipse cx="35" cy="12" rx="2.6" ry="5.5" transform="rotate(20 35 12)"/><ellipse cx="22" cy="34" rx="3" ry="5" transform="rotate(-20 22 34)"/><ellipse cx="26" cy="38" rx="3" ry="5" transform="rotate(20 26 38)"/><ellipse cx="24" cy="12" rx="3" ry="6"/></g></svg>`,
  { size: 128 },
);
const FLAG = (fill: string, trim: string, dot: string) =>
  svg(
    `<svg viewBox="0 0 40 44"><path d="M2 2 L38 2 L20 42Z" transform="translate(0 44) scale(1 -1)" fill="${fill}" stroke="${trim}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="20" cy="30" r="3.4" fill="${dot}"/><circle cx="12" cy="36" r="2.2" fill="${dot}"/><circle cx="28" cy="36" r="2.2" fill="${dot}"/></svg>`,
    { size: 96 },
  );
const FLAGS = [
  FLAG("#ff6b6b", "#b43a3a", "#fff2c4"),
  FLAG("#ffd23f", "#c99a14", "#ff6b6b"),
  FLAG("#5bc0f0", "#2e84b8", "#ffffff"),
  FLAG("#ff9fc4", "#c9608a", "#fff2c4"),
  FLAG("#8fd36a", "#4f9a3a", "#ffffff"),
];
let seeds = "";
for (let i = 1; i <= 170; i++) {
  const r = 3.1 * Math.sqrt(i);
  const a = i * 2.39996;
  const x = 50 + r * Math.cos(a);
  const y = 50 + r * Math.sin(a);
  seeds += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + r * 0.045).toFixed(2)}" fill="${i % 3 === 0 ? "#8a5a22" : "#2f1a0c"}" stroke="#c99a3a" stroke-width="0.7"/>`;
}
const SEEDS = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#4a2a12"/><circle cx="50" cy="50" r="44" fill="#6a3d18"/>${seeds}</svg>`,
  { size: 256 },
);
const PLANKS = svg(
  `<svg viewBox="0 0 160 60"><rect width="160" height="60" fill="#c98f58"/><rect y="0" width="160" height="19" fill="#d19a62"/><rect y="20" width="160" height="19" fill="#c28650"/><rect y="40" width="160" height="20" fill="#cf9760"/><path d="M0 19.5 H160 M0 39.5 H160" stroke="#6a3f22" stroke-width="2"/><g stroke="#a9693a" stroke-width="1.2" fill="none"><path d="M6 6 C40 4 70 9 110 6 S150 5 158 7"/><path d="M4 13 C30 12 60 15 96 12 S140 13 158 14"/><path d="M8 26 C44 24 74 28 112 26 S146 25 158 27"/><path d="M4 33 C34 32 62 35 100 32 S142 33 158 34"/><path d="M6 46 C40 44 70 49 108 46 S148 45 158 47"/><path d="M4 54 C32 53 66 56 98 53 S140 54 158 55"/></g><g fill="#5b3a22"><circle cx="6" cy="10" r="2"/><circle cx="154" cy="10" r="2"/><circle cx="6" cy="30" r="2"/><circle cx="154" cy="30" r="2"/><circle cx="6" cy="50" r="2"/><circle cx="154" cy="50" r="2"/></g><ellipse cx="80" cy="30" rx="6" ry="3" fill="#b27a48" stroke="#8a5530" stroke-width="1.2"/></svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 200 84"><rect x="3" y="3" width="194" height="78" rx="14" fill="#d9a066" stroke="#6a3f22" stroke-width="5"/><path d="M12 22 C60 18 120 26 188 20 M12 62 C70 66 130 58 188 64" stroke="#c28650" stroke-width="3" fill="none"/><text x="100" y="37" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="25" fill="#fff4d6" stroke="#6a3f22" stroke-width="1.2">Gnome Sweet</text><text x="100" y="66" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="25" fill="#fff4d6" stroke="#6a3f22" stroke-width="1.2">Gnome</text><g transform="translate(160 56)"><circle r="4" fill="#ff6b8a"/><circle cx="0" cy="-6" r="3" fill="#ffe14a"/><circle cx="6" cy="2" r="3" fill="#ffe14a"/><circle cx="-6" cy="2" r="3" fill="#ffe14a"/></g><circle cx="16" cy="42" r="3.4" fill="#4f2f1c"/><circle cx="184" cy="42" r="3.4" fill="#4f2f1c"/></svg>`,
  { size: 512 },
);
const LABEL = (art: string) =>
  svg(
    `<svg viewBox="0 0 40 56"><path d="M4 56 V12 L20 2 L36 12 V56Z" fill="#fff4dc" stroke="#7b4b2b" stroke-width="3" stroke-linejoin="round"/>${art}</svg>`,
    { size: 128 },
  );
const LABEL_CARROT = LABEL(
  `<path d="M20 48 L13 22 Q20 17 27 22Z" fill="#ff8a24" stroke="#c9601a" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 20 C16 12 14 12 12 10 M20 20 C20 12 20 10 20 8 M20 20 C24 12 26 12 28 10" stroke="#3f9a3a" stroke-width="3" fill="none"/>`,
);
const LABEL_CABBAGE = LABEL(
  `<circle cx="20" cy="32" r="12" fill="#9fdc74" stroke="#4f9a3a" stroke-width="2"/><path d="M20 22 C14 28 14 36 20 42 M20 22 C26 28 26 36 20 42" stroke="#4f9a3a" stroke-width="2" fill="none"/>`,
);
const LABEL_RADISH = LABEL(
  `<path d="M20 48 C10 40 10 28 20 24 C30 28 30 40 20 48Z" fill="#f2557f" stroke="#a82a55" stroke-width="2"/><path d="M20 24 C16 16 14 14 12 12 M20 24 C20 16 20 14 20 10 M20 24 C24 16 26 14 28 12" stroke="#3f9a3a" stroke-width="3" fill="none"/>`,
);
const CAN_STICKER = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fffaf0" stroke="#f4558f" stroke-width="4"/><g fill="#ff8fb2" stroke="#d9608c" stroke-width="1.4"><ellipse cx="32" cy="16" rx="6" ry="9"/><ellipse cx="32" cy="16" rx="6" ry="9" transform="rotate(72 32 32)"/><ellipse cx="32" cy="16" rx="6" ry="9" transform="rotate(144 32 32)"/><ellipse cx="32" cy="16" rx="6" ry="9" transform="rotate(216 32 32)"/><ellipse cx="32" cy="16" rx="6" ry="9" transform="rotate(288 32 32)"/></g><circle cx="32" cy="32" r="7" fill="#ffd23f" stroke="#c98a14" stroke-width="1.6"/></svg>`,
  { size: 128 },
);
const PACKET = svg(
  `<svg viewBox="0 0 32 44"><path d="M3 4 H29 V42 H3Z" fill="#fff4dc" stroke="#7b4b2b" stroke-width="2.4"/><path d="M3 4 H29 V12 H3Z" fill="#ff6b6b"/><circle cx="16" cy="28" r="7" fill="#ffd23f" stroke="#c98a14" stroke-width="1.6"/><circle cx="16" cy="28" r="2.6" fill="#8a5a22"/></svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gardenGnomePatch", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);

  // ---- local frame machinery -------------------------------------------------------------------------------
  let cur = new THREE.Matrix4();
  let curS = 1;
  let curBone: Joint = root;
  const v3 = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
  const ONE = new THREE.Vector3(1, 1, 1);
  const lm = (pos: V, rot: V = [0, 0, 0]) =>
    new THREE.Matrix4().compose(
      v3(pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      ONE,
    );
  const within = (pos: V, yaw: number, s: number, fn: () => void) => {
    const prev = cur;
    const prevS = curS;
    cur = prev
      .clone()
      .multiply(
        new THREE.Matrix4().compose(
          v3(pos),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * DEG),
          new THREE.Vector3(s, s, s),
        ),
      );
    curS = prevS * s;
    fn();
    cur = prev;
    curS = prevS;
  };
  const withMatrix = (m: THREE.Matrix4, fn: () => void) => {
    const prev = cur;
    cur = prev.clone().multiply(m);
    fn();
    cur = prev;
  };
  const onBone = (j: Joint, fn: () => void) => {
    const prev = curBone;
    curBone = j;
    fn();
    curBone = prev;
  };
  const W = (p: V) => v3(p).applyMatrix4(cur);
  const WD = (d: V) => v3(d).transformDirection(cur);

  type Fill = ColorInput;
  const bag = new Map<string, { bone: Joint; color: Fill; geos: THREE.BufferGeometry[] }>();
  const put = (color: Fill, g: THREE.BufferGeometry, local: THREE.Matrix4) => {
    g.applyMatrix4(local);
    g.applyMatrix4(cur);
    const key = `${curBone.name}|${String(color)}`;
    let e = bag.get(key);
    if (!e) {
      e = { bone: curBone, color, geos: [] };
      bag.set(key, e);
    }
    e.geos.push(g.index ? g.toNonIndexed() : g);
  };
  const solo = (g: THREE.BufferGeometry, color: Fill, local: THREE.Matrix4, opts: { texture?: THREE.Texture; name?: string } = {}) => {
    g.applyMatrix4(local);
    g.applyMatrix4(cur);
    return b.part(g, color as string, { bone: curBone, at: [0, 0, 0], texture: opts.texture, name: opts.name });
  };

  // primitives, in the current local frame
  const ell = (c: Fill, pos: V, r: V, rot?: V, seg: [number, number] = [9, 6]) => {
    const g = new THREE.SphereGeometry(1, seg[0], seg[1]);
    g.scale(r[0], r[1], r[2]);
    put(c, g, lm(pos, rot));
  };
  const ball = (c: Fill, pos: V, r: number, seg: [number, number] = [8, 6]) => ell(c, pos, [r, r, r], undefined, seg);
  const cyl = (c: Fill, pos: V, rTop: number, rBot: number, h: number, sides = 8, rot?: V) =>
    put(c, new THREE.CylinderGeometry(rTop, rBot, h, sides, 1), lm(pos, rot));
  const cone = (c: Fill, pos: V, r: number, h: number, sides = 8, rot?: V) =>
    put(c, new THREE.ConeGeometry(r, h, sides, 1), lm(pos, rot));
  const box = (c: Fill, pos: V, size: V, rot?: V) => put(c, new THREE.BoxGeometry(size[0], size[1], size[2]), lm(pos, rot));
  const torus = (c: Fill, pos: V, R: number, r: number, rot?: V, rs = 5, ts = 14) =>
    put(c, new THREE.TorusGeometry(R, r, rs, ts), lm(pos, rot));
  const rodG = (c: Fill, a: V, bb: V, r0: number, r1 = r0, sides = 6) => {
    const A = v3(a);
    const B = v3(bb);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), sides, 1);
    put(c, g, new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), aim(d), ONE));
  };
  const lerpV = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  // foliage cards, gathered by kind and placed at the end
  type Spot = Frame;
  const cardSets = {
    leaf: [] as Spot[],
    bigLeaf: [] as Spot[],
    blade: [] as Spot[],
    leafSmall: [] as Spot[],
    lettuce: [] as Spot[],
    carrot: [] as Spot[],
    tuft: [] as Spot[],
    daisy: [] as Spot[],
    buttercup: [] as Spot[],
    cosmos: [] as Spot[],
  };
  const card = (kind: keyof typeof cardSets, pos: V, dir: V) => cardSets[kind].push(frame(W(pos), WD(dir)));
  const leafRing = (kind: "leaf" | "leafSmall" | "lettuce", pos: V, n: number, up: number, phase = 0) => {
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * Math.PI * 2;
      card(kind, pos, [Math.sin(a), up, Math.cos(a)]);
    }
  };

  // ==============================================================================================================
  // TURF BASE
  const pathPts: V[] = [
    [0.1, 0, 1.12],
    [0.08, 0, 0.88],
    [0.02, 0, 0.62],
    [0.12, 0, 0.42],
    [0.22, 0, 0.22],
  ];
  const pathCurve = catmull(pathPts);
  const pathSamples: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const q = pathCurve.at(i / 60);
    pathSamples.push([q.x, q.z]);
  }
  const pathDist = (x: number, z: number) => {
    let d = 9;
    for (const [px, pz] of pathSamples) d = Math.min(d, Math.hypot(px - x, pz - z));
    return d;
  };
  const PLOT = { x: -0.85, z: 0.55, rx: 0.42, rz: 0.26 };
  const edgeR = (a: number) => 1 + 0.045 * Math.sin(3 * a + 1) + 0.03 * Math.sin(5 * a + 0.4);
  const edgePt = (a: number, k = 1): [number, number] => [Math.cos(a) * 1.65 * edgeR(a) * k, Math.sin(a) * 1.15 * edgeR(a) * k];
  const outline: [number, number][] = [];
  for (let i = 0; i < 26; i++) outline.push(edgePt((i / 26) * Math.PI * 2));
  const turf = paint((p, n) => {
    if (n.y < 0.5) {
      const nz = noise(p, 0.05, 5);
      if (p.y > G - 0.028) return mix("#6fb04a", "#5a9a40", nz);
      const stone = cells(p, 0.07, 3);
      if (stone.d1 < 0.24) return mix("#a9a08a", "#8f8874", stone.id);
      return mix("#7a4f30", "#5e3b24", smoothstep(0.03, 0.1, G - p.y) * 0.8 + nz * 0.3);
    }
    const nz = noise(p, 0.22, 3);
    const pd = pathDist(p.x, p.z) + (noise(p, 0.05, 8) - 0.5) * 0.05;
    const plotD = Math.hypot((p.x - PLOT.x) / PLOT.rx, (p.z - PLOT.z) / PLOT.rz);
    if (plotD < 1) {
      const row = Math.sin((p.z - PLOT.z) * 62) * 0.5 + 0.5;
      return mix("#6a4228", "#4d301d", row * 0.7 + noise(p, 0.04, 2) * 0.3);
    }
    if (pd < 0.125) {
      const c = cells(p, 0.045, 4);
      if (c.d1 < 0.3) return mix("#e8d9b0", "#cdbb8c", c.id);
      return mix("#d7b983", "#c6a46d", noise(p, 0.07, 6));
    }
    if (pd < 0.16) return mix("#5f9f3f", "#4f8f38", nz);
    const speck = cells(p, 0.04, 9);
    let g = mix("#7fc659", "#a2dc6a", smoothstep(0.3, 0.75, nz));
    if (speck.d1 < 0.16) g = mix(g, "#c8ee86", 0.6);
    else if (speck.d1 > 0.9) g = mix(g, "#5ea046", 0.5);
    return g;
  });
  const turfPart = b.extrude(outline, {
    at: [0, G / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: G,
    bevel: 0.03,
    smoothing: 1,
    color: turf,
    bone: root,
    name: "turf",
  });

  // stone edging around the bed
  {
    const stoneC = [C.stone1, C.stone2, C.stone3, C.stone4];
    const N = 62;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + 0.02;
      const [x, z] = edgePt(a, 1.025);
      const s = 0.07 + rand() * 0.04;
      ell(stoneC[Math.floor(rand() * 4)], [x, G - 0.03, z], [s * 1.25, s * 0.8, s], [0, -a / DEG + rand() * 30, 0], [8, 5]);
    }
  }
  // stepping stones along the path
  {
    const stoneC = [C.stone3, C.stone1, C.stone2];
    const N = 9;
    for (let i = 0; i < N; i++) {
      const t = 0.04 + (i / (N - 1)) * 0.86;
      const q = pathCurve.at(t);
      const r = 0.075 + rand() * 0.02;
      const g = new THREE.CylinderGeometry(r, r * 1.08, 0.03, 8, 1);
      g.scale(1.15, 1, 0.9);
      put(stoneC[i % 3], g, lm([q.x + (rand() - 0.5) * 0.04, G + 0.004, q.z], [0, rand() * 90, 0]));
      ball(C.moss, [q.x + 0.05, G + 0.016, q.z + 0.03], 0.012);
    }
  }

  // ==============================================================================================================
  // FENCE with gate, lantern post and bunting
  const FZ = -0.78;
  const gateJoint = b.joint("gateHinge", { parent: root, at: [0.62, G, FZ], dir: [0, 1, 0], role: "hinge" });
  const fenceWhite = paint((p, n) => {
    const nz = noise(p, 0.05, 4);
    const grime = smoothstep(G + 0.12, G, p.y) * (0.5 + nz * 0.6);
    const base = mix("#fffaf0", "#f1e6c8", nz * 0.5 + (n.z < 0.3 ? 0.12 : 0));
    return mix(base, "#b9c48a", Math.min(1, grime));
  });
  const picketShape = (w: number, h: number, pointed: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, h);
    s.lineTo(0, h + pointed);
    s.lineTo(-w / 2, h);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.016, bevelEnabled: false });
  };
  const fenceXs: number[] = [];
  for (let x = -1.0; x <= 1.04; x += 0.118) if (x < 0.17 || x > 0.64) fenceXs.push(x);
  for (const x of fenceXs) {
    const h = 0.4 + rand() * 0.05;
    put(fenceWhite, picketShape(0.082, h, 0.04), lm([x, G - 0.005, FZ], [0, 0, (rand() - 0.5) * 2]));
  }
  // posts and rails
  const postXs = [-1.06, -0.42, 0.2, 0.62, 1.06];
  for (const x of postXs) {
    put(C.cream, new THREE.BoxGeometry(0.07, 0.62, 0.07), lm([x, G + 0.3, FZ - 0.03]));
    ball(C.cream, [x, G + 0.64, FZ - 0.03], 0.048, [8, 6]);
  }
  for (const [y, c] of [[0.16, C.cream], [0.37, C.cream]] as [number, string][]) {
    for (let k = 0; k < postXs.length - 1; k++) {
      const x0 = postXs[k];
      const x1 = postXs[k + 1];
      if (x0 === 0.19) continue;
      box(c, [(x0 + x1) / 2, G + y, FZ - 0.025], [x1 - x0, 0.045, 0.02]);
    }
  }
  // gate (hinged at x = 0.64, swings from there)
  onBone(gateJoint, () => {
    const gx = [0.56, 0.48, 0.4, 0.32, 0.24];
    gx.forEach((x, i) => {
      const h = 0.34 + 0.07 * Math.sin((i / 4) * Math.PI) + 0.02;
      put(fenceWhite, picketShape(0.072, h, 0.04), lm([x, G + 0.01, FZ + 0.005]));
    });
    box(C.cream, [0.42, G + 0.1, FZ - 0.012], [0.4, 0.04, 0.02]);
    box(C.cream, [0.42, G + 0.3, FZ - 0.012], [0.4, 0.04, 0.02]);
    rodG(C.cream, [0.62, G + 0.1, FZ - 0.012], [0.24, G + 0.31, FZ - 0.012], 0.014);
    ball(C.iron, [0.235, G + 0.2, FZ + 0.02], 0.014);
    box(C.iron, [0.62, G + 0.12, FZ - 0.002], [0.1, 0.022, 0.012]);
    box(C.iron, [0.62, G + 0.3, FZ - 0.002], [0.1, 0.022, 0.012]);
  });
  // lantern on the gate post
  {
    box(C.iron, [0.62, G + 0.695, FZ - 0.03], [0.1, 0.014, 0.1]);
    cone(C.iron, [0.62, G + 0.815, FZ - 0.03], 0.065, 0.06, 4, [0, 45, 0]);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) box(C.iron, [0.62 + sx * 0.04, G + 0.75, FZ - 0.03 + sz * 0.04], [0.01, 0.1, 0.01]);
    glow(solo(new THREE.BoxGeometry(0.07, 0.085, 0.07), C.glass, lm([0.62, G + 0.752, FZ - 0.03]), { name: "fenceLantern" }), 1);
    ball(C.iron, [0.62, G + 0.86, FZ - 0.03], 0.014);
  }

  // bunting from the first post to the middle post
  {
    const a = new THREE.Vector3(-1.06, G + 0.64, FZ - 0.03);
    const c = new THREE.Vector3(-0.42, G + 0.64, FZ - 0.03);
    const pts: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push([a.x + (c.x - a.x) * t, a.y - 0.12 * Math.sin(t * Math.PI) - 0.015, a.z + 0.03 * Math.sin(t * Math.PI)]);
    }
    b.sweep(catmull(pts), 0.007, { color: C.wood3, bone: root, caps: "round", sides: 5, name: "buntingString" });
    const flagFrames: Spot[] = [];
    for (let i = 1; i < 8; i++) {
      const q = pts[i];
      flagFrames.push(frame([q[0], q[1] - 0.004, q[2] + 0.005], [0, 1, 0]));
    }
    b.cards(flagFrames, FLAGS, { size: [0.085, 0.095], lean: 180, flow: [0, 0, 1], rng: rng(5), bone: root, sink: 0 });
  }

  // ==============================================================================================================
  // BIRDBATH
  const BBX = -0.12;
  const BBZ = -0.3;
  within([BBX, G, BBZ], 0, 1, () => {
    const stone = paint((p, n) => {
      const nz = noise(p, 0.05, 2);
      const h = p.y - G;
      const mossy = smoothstep(0.34, 0.02, h - (noise(p, 0.1, 7) - 0.5) * 0.25) * (n.y > 0.2 ? 1 : 0.8);
      let c = mix(mix("#c9c3b2", "#b3ae9d", nz), C.moss, Math.min(1, mossy));
      const c2 = cells(p, 0.09, 1);
      if (c2.d2 - c2.d1 < 0.04 && h > 0.04) c = mix(c, "#8f8a7a", 0.5);
      return c;
    });
    b.lathe(
      [
        [0, 0],
        [0.21, 0],
        [0.22, 0.03],
        [0.19, 0.07],
        [0.12, 0.1],
        [0.085, 0.15],
        [0.1, 0.19],
        [0.07, 0.25],
        [0.055, 0.34],
        [0.07, 0.42],
        [0.105, 0.47],
        [0.2, 0.51],
        [0.3, 0.58],
        [0.335, 0.65],
        [0.34, 0.69],
        [0.3, 0.695],
        [0.29, 0.67],
        [0.22, 0.62],
        [0.12, 0.595],
        [0, 0.59],
      ],
      { at: W([0, 0, 0]), segments: 16, color: stone, bone: root, name: "birdbath" },
    );
    // water + rim beads + carved bands
    cyl(C.water, [0, 0.652, 0], 0.285, 0.265, 0.01, 16);
    torus(C.white, [0, 0.659, 0], 0.2, 0.004, [90, 0, 0], 4, 22);
    torus(C.white, [0, 0.659, 0], 0.255, 0.004, [90, 0, 0], 4, 24);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ball(C.stone3, [Math.sin(a) * 0.337, 0.692, Math.cos(a) * 0.337], 0.024, [6, 4]);
    }
    torus(C.stone2, [0, 0.31, 0], 0.07, 0.016, [90, 0, 0], 5, 12);
    torus(C.stone2, [0, 0.12, 0], 0.115, 0.014, [90, 0, 0], 5, 14);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ball(C.stone3, [Math.sin(a) * 0.19, 0.082, Math.cos(a) * 0.19], 0.02, [6, 4]);
    }
    // ivy spiral round the stem
    const vine: V[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const y = 0.06 + t * 0.4;
      const rr = (y < 0.15 ? 0.15 - y * 0.35 : y < 0.34 ? 0.09 - (y - 0.15) * 0.18 : 0.06 + (y - 0.34) * 0.5) + 0.016;
      const a = t * Math.PI * 2 * 2.2 + 0.6;
      vine.push([Math.sin(a) * rr, y, Math.cos(a) * rr]);
    }
    b.sweep(catmull(vine.map(W)), 0.008, { color: C.leafDark, bone: root, sides: 5, caps: "round", name: "ivy" });
    vine.forEach((q, i) => {
      if (i % 2 === 0 && i > 1) card("leafSmall", q, [q[0], 0.35, q[2]]);
    });
    // lily pad + petals on the water
    ell(C.leaf, [-0.12, 0.664, 0.1], [0.06, 0.005, 0.055], [0, 20, 0], [8, 3]);
    ball(C.pink, [-0.12, 0.676, 0.1], 0.016, [6, 4]);
    ball(C.yellow, [-0.12, 0.69, 0.1], 0.007, [5, 3]);
    for (let i = 0; i < 4; i++) ell(C.pink, [0.11 + i * 0.03, 0.661, -0.12 + i * 0.015], [0.016, 0.003, 0.009], [0, i * 50, 0], [6, 3]);
    // rubber duck floating
    within([0.04, 0.655, 0.07], -35, 1, () => {
      ell(C.duck, [0, 0.026, 0], [0.04, 0.03, 0.05]);
      ball(C.duck, [0, 0.066, 0.034], 0.028);
      ell(C.beak, [0, 0.062, 0.066], [0.02, 0.009, 0.016]);
      ell(C.duck, [0, 0.032, -0.05], [0.014, 0.018, 0.02], [-30, 0, 0], [6, 4]);
      for (const s of [-1, 1]) {
        ball(C.ink, [s * 0.014, 0.075, 0.056], 0.005, [5, 4]);
        ell(C.duck, [s * 0.038, 0.03, -0.005], [0.01, 0.018, 0.03], [0, 0, s * -20], [6, 4]);
      }
      torus("#d6f3fb", [0, 0.004, 0], 0.07, 0.004, [90, 0, 0], 4, 18);
    });
    // bluebird on the rim
    within([0.0, 0.69, -0.33], 160, 1, () => {
      ell(C.bird, [0, 0.055, 0], [0.05, 0.05, 0.07], [-12, 0, 0]);
      ell(C.birdBelly, [0, 0.042, 0.024], [0.04, 0.04, 0.05], [-12, 0, 0]);
      ball(C.bird, [0.006, 0.12, 0.05], 0.036);
      cone(C.beak, [0.006, 0.115, 0.098], 0.012, 0.034, 5, [90, 0, 0]);
      for (const s of [-1, 1]) {
        ball(C.ink, [s * 0.024 + 0.006, 0.128, 0.074], 0.0072, [5, 4]);
        ell(C.navy, [s * 0.047, 0.065, -0.008], [0.014, 0.036, 0.055], [-14, 0, s * 12]);
        cyl(C.beak, [s * 0.016, 0.01, 0.004], 0.0045, 0.0045, 0.03, 4);
      }
      ell(C.navy, [0, 0.045, -0.095], [0.018, 0.01, 0.06], [-8, 0, 0], [6, 4]);
      ell(C.hotPink, [0.006, 0.152, 0.044], [0.014, 0.014, 0.014], undefined, [5, 4]);
    });
  });

  // ==============================================================================================================
  // GNOMES
  type GnomeSpec = {
    hat: Fill;
    band: string;
    pom: string;
    coat: Fill;
    trim: string;
    pants: string;
    mitt: string;
    handR: V;
    handL: V;
    tip: V;
    beardEnd?: number;
    peek?: boolean;
    cheeks?: string;
  };
  const gnome = (o: GnomeSpec) => {
    const S = curS;
    // body
    if (!o.peek) {
      for (const sx of [-1, 1]) {
        ell(C.boot, [sx * 0.075, 0.04, 0.05], [0.06, 0.044, 0.1]);
        ball(C.boot, [sx * 0.075, 0.056, 0.135], 0.03, [6, 4]);
        cyl(C.belt, [sx * 0.075, 0.09, 0.015], 0.048, 0.05, 0.03, 8);
        rodG(o.pants, [sx * 0.07, 0.08, 0.012], [sx * 0.07, 0.17, 0.0], 0.046);
      }
      b.lathe(
        [
          [0, 0.09],
          [0.175, 0.09],
          [0.19, 0.11],
          [0.178, 0.2],
          [0.166, 0.27],
          [0.15, 0.34],
          [0.115, 0.41],
          [0.05, 0.44],
          [0, 0.445],
        ].map(([x, y]) => [x * S, y * S] as [number, number]),
        { at: W([0, 0, 0]), segments: 14, color: o.coat as string, bone: curBone, name: "gnomeCoat" },
      );
      torus(o.trim, [0, 0.104, 0], 0.186, 0.018, [90, 0, 0], 5, 14);
      torus(C.belt, [0, 0.215, 0], 0.178, 0.015, [90, 0, 0], 5, 16);
      box(C.gold, [0, 0.215, 0.182], [0.062, 0.05, 0.014]);
      box(C.belt, [0, 0.215, 0.19], [0.036, 0.026, 0.01]);
      [0.3, 0.345, 0.39].forEach((y, i) => ball(C.gold, [0, y, 0.162 - i * 0.02], 0.012, [6, 4]));
      // patch with stitches on the belly
      const pa = 30 * DEG;
      const pr = 0.178;
      box(o.trim, [Math.sin(pa) * pr, 0.15, Math.cos(pa) * pr], [0.07, 0.07, 0.01], [0, 30, 6]);
      for (const [dx, dy] of [[-0.03, -0.03], [0.03, -0.03], [-0.03, 0.03], [0.03, 0.03], [0, -0.034], [0, 0.034]])
        ball(C.cream, [Math.sin(pa) * (pr + 0.006) + dx * Math.cos(pa), 0.15 + dy, Math.cos(pa) * (pr + 0.006) - dx * Math.sin(pa)], 0.004, [4, 3]);
      // arms
      for (const sx of [-1, 1]) {
        const hand = sx < 0 ? o.handR : o.handL;
        const sh: V = [sx * 0.155, 0.375, 0.0];
        const el: V = [(sh[0] + hand[0]) / 2 + sx * 0.035, (sh[1] + hand[1]) / 2 - 0.03, (sh[2] + hand[2]) / 2 - 0.04];
        ball(o.coat, sh, 0.056, [8, 6]);
        rodG(o.coat, sh, el, 0.046, 0.042, 7);
        ball(o.coat, el, 0.043, [6, 5]);
        rodG(o.coat, el, hand, 0.042, 0.038, 7);
        rodG(o.trim, lerpV(el, hand, 0.66), lerpV(el, hand, 0.82), 0.045, 0.045, 7);
        ball(o.mitt, hand, 0.047, [8, 6]);
        ball(o.mitt, [hand[0] - sx * 0.04, hand[1] + 0.022, hand[2] + 0.014], 0.021, [6, 4]);
      }
    } else {
      for (const sx of [-1, 1]) {
        const hand = sx < 0 ? o.handR : o.handL;
        rodG(o.coat, [sx * 0.12, 0.3, 0.0], hand, 0.04, 0.036, 7);
        ball(o.mitt, hand, 0.047, [8, 6]);
        for (let k = -1; k <= 1; k++) ball(o.mitt, [hand[0] + k * 0.02, hand[1] + 0.012, hand[2] + 0.04], 0.015, [5, 4]);
      }
    }
    // head
    ell(C.skin, [0, 0.465, 0.05], [0.097, 0.09, 0.09], undefined, [10, 7]);
    for (const sx of [-1, 1]) {
      ell(C.skin, [sx * 0.098, 0.46, 0.05], [0.014, 0.03, 0.021], undefined, [6, 4]);
      ball(C.ink, [sx * 0.04, 0.482, 0.13], 0.0155, [6, 5]);
      ball(C.white, [sx * 0.04 - 0.005, 0.489, 0.143], 0.0058, [4, 3]);
      ell(o.cheeks ?? C.cheek, [sx * 0.07, 0.447, 0.113], [0.025, 0.02, 0.012], [0, sx * 25, 0], [6, 4]);
      ell(C.beard, [sx * 0.045, 0.515, 0.122], [0.036, 0.016, 0.022], [8, sx * -12, sx * -14], [6, 4]);
      ell(C.beard, [sx * 0.056, 0.426, 0.152], [0.058, 0.027, 0.034], [0, 0, sx * -14], [7, 5]);
      ball(C.beard, [sx * 0.108, 0.44, 0.146], 0.024, [6, 4]);
      ell(C.beard, [sx * 0.092, 0.455, 0.03], [0.022, 0.045, 0.04], [0, 0, sx * -12], [6, 4]);
    }
    ell(C.nose, [0, 0.456, 0.165], [0.044, 0.039, 0.044], undefined, [8, 6]);
    ball(C.white, [-0.012, 0.47, 0.198], 0.008, [4, 3]);
    // beard
    const endY = o.beardEnd ?? 0.17;
    const bp: V[] = [
      [0, 0.43, 0.095],
      [0, (0.43 + endY) / 2 + 0.02, 0.165],
      [0, endY, 0.192],
    ];
    b.sweep(catmull(bp.map(W)), (t) => [(0.108 * Math.pow(1 - t, 0.6) + 0.012) * S, (0.062 * (1 - t) + 0.014) * S], {
      color: grain("#ffffff", "#e6dfca", { size: 0.012, axis: "y", seed: 3 }),
      bone: curBone,
      caps: { start: "none", end: "round" },
      sides: 9,
      name: "gnomeBeard",
    });
    // hat
    const hp: V[] = [
      [0, 0.535, 0.045],
      [0, 0.64, 0.04],
      [o.tip[0] * 0.3, 0.76, o.tip[2] * 0.3 + 0.0],
      [o.tip[0] * 0.7, o.tip[1] - 0.04, o.tip[2] * 0.7],
      o.tip,
    ];
    b.sweep(catmull(hp.map(W)), [0.112, 0.101, 0.078, 0.05, 0.026, 0.012].map((r) => r * S), {
      color: o.hat as string,
      bone: curBone,
      caps: { start: "none", end: "round" },
      sides: 10,
      name: "gnomeHat",
    });
    torus(o.band, [0, 0.532, 0.046], 0.112, 0.028, [92, 0, 0], 6, 16);
    ball(o.pom, o.tip, 0.034, [8, 6]);
    ball(C.white, [o.tip[0] + 0.01, o.tip[1] + 0.012, o.tip[2] + 0.02], 0.009, [4, 3]);
  };

  // --- Gnome A: red spotted hat, lantern in the right hand, waving with the left
  const hatRed = spots("#e8403f", "#fffaf0", { size: 0.06, amount: 0.3, seed: 2 });
  const coatBlue = mottle("#3f7fd6", "#4a8be2", { size: 0.05, contrast: 0.6, seed: 4 });
  within([0.26, G, 0.02], -12, 1, () => {
    gnome({
      hat: hatRed,
      band: C.cream,
      pom: C.white,
      coat: coatBlue,
      trim: C.gold,
      pants: C.bark,
      mitt: C.cream,
      handR: [-0.24, 0.215, 0.12],
      handL: [0.25, 0.5, 0.12],
      tip: [0.06, 0.88, -0.2],
    });
    // daisy tucked in the hat band
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ell(C.white, [0.07 + Math.sin(a) * 0.022, 0.552 + Math.cos(a) * 0.022, 0.148], [0.011, 0.016, 0.004], [0, 0, -a / DEG], [5, 3]);
    }
    ball(C.yellow, [0.07, 0.552, 0.15], 0.01, [5, 4]);
    // lantern
    const lx = -0.24;
    const lz = 0.12;
    torus(C.iron, [lx, 0.255, lz], 0.016, 0.004, [0, 90, 0], 4, 10);
    rodG(C.iron, [lx, 0.245, lz], [lx, 0.185, lz], 0.004, 0.004, 4);
    cone(C.iron, [lx, 0.176, lz], 0.036, 0.034, 6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      rodG(C.iron, [lx + Math.sin(a) * 0.03, 0.065, lz + Math.cos(a) * 0.03], [lx + Math.sin(a) * 0.026, 0.158, lz + Math.cos(a) * 0.026], 0.0042, 0.0042, 4);
    }
    cyl(C.iron, [lx, 0.056, lz], 0.034, 0.04, 0.02, 6);
    glow(solo(new THREE.CylinderGeometry(0.029, 0.033, 0.098, 6, 1), C.glass, lm([lx, 0.112, lz]), { name: "lanternGlass" }), 1.2);
    ball(C.orange, [lx, 0.11, lz], 0.014, [5, 4]);
  });

  // --- Gnome B: mossy green hat with spiral stripes, trowel in one hand, big carrot in the other
  const hatGreen = paint((_p, _n, s) => (((((s[1] - 540 * s[0]) % 90) + 90) % 90) < 34 ? "#ffd23f" : "#3fa655"));
  const coatMustard = mottle("#f2a93b", "#f6b64f", { size: 0.05, contrast: 0.6, seed: 6 });
  within([-0.55, G, 0.12], 30, 1, () => {
    gnome({
      hat: hatGreen,
      band: C.orange,
      pom: C.yellow,
      coat: coatMustard,
      trim: C.purple,
      pants: C.violet,
      mitt: C.cream,
      handR: [-0.23, 0.24, 0.14],
      handL: [0.2, 0.385, 0.17],
      tip: [-0.08, 0.86, -0.2],
      beardEnd: 0.2,
    });
    // trowel
    cyl(C.red, [-0.23, 0.265, 0.14], 0.016, 0.014, 0.1, 6);
    rodG(C.steel, [-0.23, 0.215, 0.14], [-0.23, 0.14, 0.14], 0.007, 0.007, 4);
    ell(C.steel, [-0.23, 0.075, 0.14], [0.034, 0.07, 0.007], [0, 0, 0], [6, 5]);
    // carrot
    cone(C.carrot, [0.2, 0.46, 0.2], 0.034, 0.2, 8, [165, 0, 0]);
    for (const y of [0.51, 0.47, 0.43]) torus(C.orange, [0.2, y, 0.2 - (y - 0.46) * 0.05], (0.034 * (y - 0.36)) / 0.2, 0.003, [90, 0, 0], 4, 10);
    card("carrot", [0.2, 0.555, 0.19], [0, 1, -0.1]);
    // daisy in the hat band
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ell(C.white, [-0.07 + Math.sin(a) * 0.022, 0.552 + Math.cos(a) * 0.022, 0.15], [0.011, 0.016, 0.004], [0, 0, -a / DEG], [5, 3]);
    }
    ball(C.orange, [-0.07, 0.552, 0.152], 0.01, [5, 4]);
  });

  // ==============================================================================================================
  // TERRACOTTA POTS
  const potPaint = (h: number, style: string, y0: number) =>
    paint((p, n, s) => {
      const hh = s[0];
      const nz = noise(p, 0.05, 11);
      let c: ColorInput = mix("#e0804e", "#cb6a3b", nz);
      if (hh > h * 0.86) c = mix("#ea935f", "#d97d4d", nz);
      if (n.y > 0.8 && hh > h - Math.min(0.06, h * 0.3) - 0.002) return mix("#5d3a22", "#46291a", noise(p, 0.03, 4));
      if (style === "band" && hh > h * 0.4 && hh < h * 0.66) {
        const wave = Math.sin((s[1] * 10 * DEG) % (Math.PI * 2)) * 0.012;
        if (Math.abs(hh - h * 0.53) < h * 0.1 + wave) c = hh > h * 0.55 + wave ? "#fff4dc" : "#ffd23f";
      }
      if (style === "dots" && hh < h * 0.84) {
        const d = cells(p, 0.07, 5);
        if (d.d1 < 0.28) c = "#fff4dc";
      }
      if (style === "stripes" && hh < h * 0.84) {
        if ((((s[1] / 22.5) % 2) + 2) % 2 < 1) c = mix(c, "#f4c58c", 0.85);
      }
      const base = smoothstep(0.05, 0.0, p.y - y0) * (0.3 + noise(p, 0.04, 3));
      return mix(c, "#6f8f45", Math.min(base, 0.7));
    });
  const pot = (pos: V, rTop: number, h: number, style: string, yaw = 0) =>
    within(pos, yaw, 1, () => {
      const rb = rTop * 0.62;
      const soilY = h - Math.min(0.06, h * 0.3);
      const wallX = rb + 0.008 + (rTop * 0.94 - rb - 0.008) * Math.min(1, Math.max(0, (soilY - 0.016) / (h * 0.86 - 0.016)));
      b.lathe(
        [
          [0, 0],
          [rb, 0],
          [rb + 0.008, 0.016],
          [rTop * 0.94, h * 0.86],
          [rTop * 1.1, h * 0.88],
          [rTop * 1.1, h],
          [rTop * 0.99, h],
          [Math.min(wallX - rTop * 0.12, rTop * 0.9), soilY],
          [0, soilY],
        ],
        { at: W([0, 0, 0]), segments: 14, color: potPaint(h, style, G), bone: root, name: "pot" },
      );
    });

  // --- Gnome C peeking out of a big striped pot
  pot([1.06, G, 0.48], 0.25, 0.4, "band", 20);
  within([1.06, G, 0.48], 20, 1, () => {
    within([0, 0.0, 0], 0, 0.9, () => {
      gnome({
        hat: spots("#4a98e8", "#ffe14a", { size: 0.05, amount: 0.3, seed: 9 }),
        band: C.yellow,
        pom: C.pink,
        coat: C.blue,
        trim: C.gold,
        pants: C.navy,
        mitt: C.cream,
        handR: [-0.2, 0.37, 0.13],
        handL: [0.2, 0.37, 0.13],
        tip: [0.12, 0.8, -0.18],
        beardEnd: 0.31,
        peek: true,
        cheeks: C.hotPink,
      });
    });
    // soil tops the pot at 0.34: a tuft of seedlings by the gnome
    card("leafSmall", [0.12, 0.36, 0.14], [0.4, 1, 0.5]);
    card("leafSmall", [-0.13, 0.36, 0.13], [-0.4, 1, 0.5]);
    // ladybug on the rim
    ell(C.red, [0.22, 0.425, 0.11], [0.02, 0.014, 0.024], [0, 40, 0]);
    ball(C.ink, [0.213, 0.425, 0.128], 0.01, [5, 4]);
    for (const [dx, dz] of [[-0.006, -0.004], [0.007, 0.004]]) ball(C.ink, [0.22 + dx, 0.438, 0.11 + dz], 0.0045, [4, 3]);
  });

  // --- Cluster of flower pots, front right
  pot([0.7, G, 0.7], 0.14, 0.25, "dots", -10);
  within([0.7, G, 0.7], -10, 1, () => {
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4;
      const r = 0.045 + 0.05 * Math.sqrt(i / 9);
      ball(i % 3 ? C.red : C.orange, [Math.sin(a) * r, 0.33 + (i % 3) * 0.02, Math.cos(a) * r], 0.034, [6, 5]);
      rodG(C.stem, [Math.sin(a) * r * 0.5, 0.2, Math.cos(a) * r * 0.5], [Math.sin(a) * r, 0.31, Math.cos(a) * r], 0.005, 0.005, 4);
    }
    leafRing("leaf", [0, 0.2, 0], 7, 0.5);
    card("cosmos", [0.0, 0.2, 0.0], [0.1, 1, 0.1]);
  });
  pot([0.42, G, 0.95], 0.11, 0.2, "stripes", 30);
  within([0.42, G, 0.95], 30, 1, () => {
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + 0.4;
      const r = 0.035;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      const top = 0.36 + (i % 2) * 0.05;
      rodG(C.stem, [x * 0.3, 0.16, z * 0.3], [x, top, z], 0.007, 0.006, 4);
      cyl(i % 2 ? C.pink : C.yellow, [x, top + 0.02, z], 0.026, 0.01, 0.045, 6);
      for (const s of [-1, 1]) cone(i % 2 ? C.pink : C.yellow, [x + s * 0.017, top + 0.052, z], 0.011, 0.03, 4);
      cone(i % 2 ? C.pink : C.yellow, [x, top + 0.056, z], 0.012, 0.034, 4);
    }
    leafRing("leaf", [0, 0.17, 0], 6, 0.9, 0.5);
  });
  // smiley cactus pot
  pot([1.4, G, 0.16], 0.1, 0.17, "plain", 0);
  within([1.4, G, 0.16], 0, 1, () => {
    for (const s of [-1, 1]) {
      ball(C.ink, [s * 0.036, 0.1, 0.092], 0.0095, [5, 4]);
      ball(C.white, [s * 0.036 - 0.002, 0.103, 0.1], 0.003, [3, 3]);
      ball(C.cheek, [s * 0.062, 0.078, 0.082], 0.014, [5, 4]);
    }
    put(C.ink, new THREE.TorusGeometry(0.026, 0.0045, 4, 10, Math.PI), lm([0, 0.084, 0.096], [0, 0, 180]));
    ell(C.leaf, [0, 0.27, 0], [0.06, 0.1, 0.06], undefined, [8, 6]);
    ell(C.leaf, [0.075, 0.27, 0], [0.026, 0.05, 0.026], undefined, [6, 5]);
    rodG(C.leaf, [0.04, 0.24, 0], [0.075, 0.24, 0], 0.024, 0.024, 6);
    ell(C.leaf, [-0.07, 0.3, 0.0], [0.024, 0.045, 0.024], undefined, [6, 5]);
    rodG(C.leaf, [-0.035, 0.28, 0], [-0.07, 0.28, 0], 0.022, 0.022, 6);
    for (let i = 0; i < 14; i++) {
      const a = i * 0.9;
      const y = 0.2 + (i % 5) * 0.04;
      cone(C.cream, [Math.sin(a) * 0.062, y, Math.cos(a) * 0.062], 0.004, 0.02, 3, [Math.cos(a) * 90, 0, -Math.sin(a) * 90]);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ell(C.hotPink, [Math.sin(a) * 0.02, 0.385, Math.cos(a) * 0.02], [0.011, 0.02, 0.011], [Math.cos(a) * 35, 0, -Math.sin(a) * 35], [5, 4]);
    }
    ball(C.yellow, [0, 0.39, 0], 0.009, [5, 4]);
    // butterfly perched on the pink bloom
    within([0.04, 0.4, 0.0], 25, 1, () => {
      for (const s of [-1, 1]) {
        ell(C.orange, [s * 0.026, 0.01, 0.008], [0.026, 0.004, 0.02], [0, s * 15, s * -35], [6, 3]);
        ell(C.yellow, [s * 0.02, 0.01, -0.016], [0.018, 0.004, 0.014], [0, s * -10, s * -30], [6, 3]);
        ball(C.ink, [s * 0.034, 0.014, 0.01], 0.004, [4, 3]);
      }
      ell(C.ink, [0, 0.01, 0], [0.004, 0.004, 0.022], undefined, [4, 3]);
    });
  });

  // ==============================================================================================================
  // WATERING CAN
  within([-0.26, G, 0.92], -108, 1, () => {
    const canPaint = paint((p, n, s) => {
      const h = s[0];
      if (n.y > 0.9 && h > 0.25) return "#2f9d84";
      if (h < 0.022 || (h > 0.052 && h < 0.062) || (h > 0.205 && h < 0.215)) return "#3fae93";
      const nz = noise(p, 0.08, 2);
      const d = cells(p, 0.052, 7);
      if (d.d1 < 0.27) return "#ffffff";
      return mix("#74d6bd", "#62c7ad", nz);
    });
    b.lathe(
      [
        [0, 0],
        [0.125, 0],
        [0.135, 0.015],
        [0.135, 0.25],
        [0.12, 0.27],
        [0.085, 0.275],
        [0.08, 0.3],
        [0.065, 0.3],
        [0.062, 0.265],
        [0, 0.265],
      ],
      { at: W([0, 0, 0]), segments: 16, color: canPaint, bone: root, name: "wateringCan" },
    );
    torus(C.mintDark, [0, 0.058, 0], 0.139, 0.009, [90, 0, 0], 4, 16);
    torus(C.mintDark, [0, 0.21, 0], 0.139, 0.009, [90, 0, 0], 4, 16);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ball(C.steel, [Math.sin(a) * 0.1385, 0.234, Math.cos(a) * 0.1385], 0.0045, [4, 3]);
      ball(C.steel, [Math.sin(a) * 0.1385, 0.036, Math.cos(a) * 0.1385], 0.0045, [4, 3]);
    }
    // spout and rose
    const spout: V[] = [
      [0, 0.06, 0.1],
      [0, 0.09, 0.2],
      [0, 0.17, 0.29],
      [0, 0.26, 0.36],
    ];
    b.sweep(catmull(spout.map(W)), [0.04, 0.028, 0.02], {
      color: C.mint,
      bone: root,
      caps: "none",
      sides: 8,
      name: "spout",
    });
    within([0, 0.26, 0.36], 0, 1, () => {
      cyl(C.mint, [0, 0.025, 0.02], 0.058, 0.026, 0.045, 12, [-55, 0, 0]);
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4;
        const r = 0.012 + 0.03 * Math.sqrt(i / 9);
        ball(C.mintDark, [Math.sin(a) * r, 0.026 + Math.cos(a) * r * 0.57 + 0.034, Math.cos(a) * r * 0.82 + 0.03], 0.0038, [4, 3]);
      }
    });
    // handles
    const rear: V[] = [
      [0, 0.04, -0.125],
      [0, 0.06, -0.24],
      [0, 0.17, -0.285],
      [0, 0.27, -0.2],
      [0, 0.25, -0.11],
    ];
    b.sweep(catmull(rear.map(W)), 0.016, { color: C.mintDark, bone: root, sides: 7, caps: "round", name: "canHandle" });
    const top: V[] = [
      [0, 0.255, 0.1],
      [0, 0.38, 0.06],
      [0, 0.42, -0.04],
      [0, 0.36, -0.115],
      [0, 0.26, -0.12],
    ];
    b.sweep(catmull(top.map(W)), 0.013, { color: C.mintDark, bone: root, sides: 7, caps: "round", name: "canArch" });
    for (const sx of [-1, 1]) texPlane(CAN_STICKER, [sx * 0.1405, 0.13, 0.0], [0.09, 0.09], [sx, 0, 0]);
    // a tiny ladybug on the filler neck
    ell(C.red, [0.0, 0.305, 0.0], [0.016, 0.011, 0.02], undefined, [6, 4]);
    ball(C.ink, [0.0, 0.31, 0.02], 0.007, [4, 3]);
  });

  // ==============================================================================================================
  // small plant and critter helpers
  const tulip = (pos: V, h: number, color: string) => {
    const top = pos[1] + h;
    rodG(C.stem, pos, [pos[0], top, pos[2]], 0.006, 0.005, 4);
    ell(color, [pos[0], top + 0.024, pos[2]], [0.023, 0.034, 0.023], undefined, [7, 5]);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.09 + h * 9;
      cone(color, [pos[0] + Math.sin(a) * 0.012, top + 0.056, pos[2] + Math.cos(a) * 0.012], 0.011, 0.03, 4);
    }
    card("blade", [pos[0], pos[1] + 0.004, pos[2]], [Math.sin(h * 50) * 0.6, 1, Math.cos(h * 50) * 0.6]);
  };
  const pansy = (pos: V, c1: string, c2: string) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      ell(i < 3 ? c1 : c2, [pos[0] + Math.sin(a) * 0.015, pos[1] + 0.03 + Math.cos(a) * 0.015, pos[2] + 0.004], [0.016, 0.016, 0.005], [-20, 0, 0], [6, 4]);
    }
    ball(C.ink, [pos[0], pos[1] + 0.03, pos[2] + 0.008], 0.007, [4, 3]);
    ball(C.yellow, [pos[0], pos[1] + 0.03, pos[2] + 0.011], 0.0045, [4, 3]);
    rodG(C.stem, pos, [pos[0], pos[1] + 0.028, pos[2]], 0.004, 0.004, 4);
    card("leafSmall", [pos[0], pos[1], pos[2]], [Math.sin(pos[0] * 90), 0.5, 1]);
  };
  const mush = (pos: V, r: number, h: number, cap: string, dot: string, tilt = 0) => {
    const [x, y, z] = pos;
    rodG(C.mushCream, [x, y - 0.004, z], [x, y + h, z], r * 0.46, r * 0.3, 6);
    const g = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(r, r * 0.72, r);
    put(cap, g, lm([x, y + h, z], [tilt, 0, 0]));
    put(C.mushCream, new THREE.CircleGeometry(r * 0.98, 10), lm([x, y + h, z], [90 + tilt, 0, 0]));
    for (let k = 0; k < 6; k++) {
      const th = 0.25 + (k % 3) * 0.38;
      const ph = k * 2.2 + x * 40;
      ball(dot, [x + r * Math.sin(th) * Math.cos(ph), y + h + r * 0.72 * Math.cos(th) * 0.96, z + r * Math.sin(th) * Math.sin(ph)], r * 0.15, [5, 4]);
    }
  };
  const snail = (pos: V, yaw: number) =>
    within(pos, yaw, 1, () => {
      ell(C.snail, [0, 0.011, 0], [0.016, 0.012, 0.05]);
      ball(C.snail, [0, 0.022, 0.05], 0.013, [6, 4]);
      for (const s of [-1, 1]) {
        rodG(C.snail, [s * 0.006, 0.03, 0.055], [s * 0.012, 0.052, 0.066], 0.0022, 0.0022, 4);
        ball(C.ink, [s * 0.012, 0.053, 0.067], 0.0034, [4, 3]);
        torus(C.mushBrown, [s * 0.0305, 0.042, -0.012], 0.019, 0.0045, [0, 90, 0], 4, 10);
        torus(C.mushBrown, [s * 0.0305, 0.042, -0.012], 0.009, 0.0045, [0, 90, 0], 4, 8);
      }
      ball(C.shell, [0, 0.042, -0.012], 0.03, [8, 6]);
    });

  // ==============================================================================================================
  // PLANTER BOX (back left)
  within([-0.82, G, -0.55], 8, 1, () => {
    const L = 0.8;
    const D = 0.3;
    const H = 0.27;
    for (const sz of [-1, 1])
      solo(new THREE.BoxGeometry(L, H, 0.026), "#ffffff", lm([0, H / 2, (sz * D) / 2]), { texture: PLANKS, name: "planterPlank" });
    for (const sx of [-1, 1])
      solo(new THREE.BoxGeometry(0.026, H, D), "#ffffff", lm([(sx * L) / 2, H / 2, 0]), { texture: PLANKS, name: "planterEnd" });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        box(C.wood3, [(sx * L) / 2, H / 2 + 0.01, (sz * D) / 2], [0.052, H + 0.02, 0.052]);
        ball(C.wood2, [(sx * L) / 2, H + 0.025, (sz * D) / 2], 0.03, [6, 4]);
      }
    for (const sz of [-1, 1]) box(C.wood2, [0, H + 0.002, (sz * D) / 2], [L - 0.04, 0.022, 0.05]);
    for (const sx of [-1, 1]) box(C.wood2, [(sx * L) / 2, H + 0.002, 0], [0.05, 0.022, D - 0.04]);
    for (const x of [-0.22, 0.22]) {
      box(C.iron, [x, H / 2, D / 2 + 0.016], [0.034, H * 0.82, 0.006]);
      for (const dy of [-0.09, 0.09]) ball(C.steel, [x, H / 2 + dy, D / 2 + 0.021], 0.006, [4, 3]);
    }
    box(C.soil, [0, H - 0.03, 0], [L - 0.04, 0.05, D - 0.04]);
    const top = H - 0.005;
    const cols = [C.red, C.pink, C.yellow, C.orange, C.hotPink, C.purple];
    for (let i = 0; i < 6; i++) tulip([-0.3 + i * 0.12, top, -0.065], 0.2 + rand() * 0.07, cols[i]);
    for (let i = 0; i < 6; i++) pansy([-0.3 + i * 0.12, top, 0.075], i % 2 ? C.purple : C.yellow, i % 2 ? C.violet : C.orange);
    card("daisy", [-0.34, top, 0.0], [0.1, 1, 0.1]);
    card("daisy", [0.0, top, 0.0], [0, 1, 0.1]);
    card("daisy", [0.36, top, 0.0], [-0.1, 1, 0.1]);
    for (const x of [-0.3, -0.05, 0.2, 0.34]) card("leaf", [x, top, D / 2 - 0.03], [0, 0.25, 1]);
    // plant stake with seed packet
    rodG(C.wood1, [0.0, top, 0.11], [0.0, top + 0.17, 0.11], 0.007, 0.006, 4);
    texPlane(PACKET, [0.0, top + 0.19, 0.116], [0.07, 0.095], [0, 0.1, 1]);
  });

  // ==============================================================================================================
  // WHEELBARROW with flowers (back right), hinged wheel
  within([1.0, G, -0.22], 80, 1, () => {
    const wheel = b.joint("wheel", { parent: root, at: W([0, 0.15, 0.4]), dir: WD([1, 0, 0]), role: "hinge" });
    const paintBody = paint((p, n) => {
      if (p.y > G + 0.395) return "#f7e8c6";
      const chip = cells(p, 0.07, 2);
      if (chip.d1 < 0.1 && n.y < 0.8) return "#e9a08a";
      return mix("#dd5a50", "#c8453d", noise(p, 0.06, 3));
    });
    solo(new THREE.BoxGeometry(0.3, 0.02, 0.58), paintBody, lm([0, 0.25, 0]), { name: "barrowBottom" });
    for (const sx of [-1, 1]) solo(new THREE.BoxGeometry(0.02, 0.21, 0.62), paintBody, lm([sx * 0.2, 0.34, 0], [0, 0, -sx * 28]), { name: "barrowSide" });
    solo(new THREE.BoxGeometry(0.46, 0.21, 0.02), paintBody, lm([0, 0.34, 0.3], [20, 0, 0]), { name: "barrowFront" });
    solo(new THREE.BoxGeometry(0.46, 0.21, 0.02), paintBody, lm([0, 0.34, -0.3], [-20, 0, 0]), { name: "barrowBack" });
    for (const sx of [-1, 1]) {
      rodG(C.wood2, [sx * 0.1, 0.26, 0.3], [sx * 0.2, 0.3, -0.58], 0.018, 0.018, 6);
      rodG(C.wood1, [sx * 0.2, 0.3, -0.44], [sx * 0.205, 0.305, -0.6], 0.027, 0.027, 7);
      rodG(C.wood2, [sx * 0.2, 0.29, -0.4], [sx * 0.22, -0.002, -0.46], 0.02, 0.017, 6);
      rodG(C.iron, [sx * 0.1, 0.26, 0.3], [sx * 0.075, 0.15, 0.4], 0.012, 0.012, 5);
      ball(C.iron, [sx * 0.22, 0.0, -0.46], 0.02, [5, 3]);
      for (const z of [-0.2, 0.15]) ball(C.steel, [sx * 0.235, 0.4, z], 0.007, [4, 3]);
    }
    rodG(C.wood2, [-0.21, 0.13, -0.45], [0.21, 0.13, -0.45], 0.012, 0.012, 5);
    rodG(C.iron, [-0.09, 0.15, 0.4], [0.09, 0.15, 0.4], 0.008, 0.008, 5);
    ell(C.soil, [0, 0.4, 0], [0.2, 0.06, 0.27]);
    // flowers in the tray
    const cols = [C.yellow, C.orange, C.red, C.pink, C.yellow, C.hotPink, C.orange];
    for (let i = 0; i < 7; i++) tulip([-0.12 + (i % 3) * 0.12, 0.43, -0.2 + Math.floor(i / 3) * 0.17], 0.18 + (i % 4) * 0.03, cols[i]);
    for (let i = 0; i < 4; i++) pansy([-0.13 + i * 0.09, 0.42, 0.24 - (i % 2) * 0.02], i % 2 ? C.purple : C.yellow, i % 2 ? C.violet : C.orange);
    card("cosmos", [0.1, 0.43, 0.04], [0.15, 1, 0]);
    card("cosmos", [-0.1, 0.43, 0.1], [-0.15, 1, 0.1]);
    card("daisy", [0.0, 0.43, -0.08], [0, 1, 0.12]);
    for (const [x, z] of [[-0.1, -0.12], [0.12, -0.14], [0.0, 0.14], [-0.14, 0.17], [0.14, 0.1]] as [number, number][]) {
      card("buttercup", [x, 0.43, z], [x, 1, 0.1]);
    }
    for (let i = 0; i < 5; i++) tulip([-0.15 + i * 0.075, 0.43, -0.02 + (i % 2) * 0.06], 0.15 + (i % 3) * 0.04, [C.pink, C.red, C.yellow, C.hotPink, C.orange][i]);
    for (const sx of [-1, 1]) {
      card("leaf", [sx * 0.23, 0.44, 0.22], [sx, 0.0, 0.7]);
      card("leaf", [sx * 0.23, 0.44, -0.05], [sx, 0.0, 0.0]);
    }
    for (const [x, z, dx] of [[0.2, 0.2, 1], [-0.2, 0.0, -1], [0.18, -0.2, 1], [0.0, 0.3, 0]] as [number, number, number][])
      card("leaf", [x * 0.9, 0.4, z], [dx, 0.1, dx === 0 ? 1 : 0]);
    onBone(wheel, () => {
      torus(C.tire, [0, 0.15, 0.4], 0.115, 0.032, [0, 90, 0], 6, 18);
      torus(C.barrow2, [0, 0.15, 0.4], 0.088, 0.008, [0, 90, 0], 4, 16);
      cyl(C.barrow2, [0, 0.15, 0.4], 0.032, 0.032, 0.07, 8, [0, 0, 90]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        rodG(C.barrow2, [0, 0.15, 0.4], [0, 0.15 + Math.cos(a) * 0.09, 0.4 + Math.sin(a) * 0.09], 0.007, 0.007, 4);
      }
      for (const s of [-1, 1]) ball(C.gold, [s * 0.038, 0.15, 0.4], 0.012, [5, 4]);
    });
  });

  // ==============================================================================================================
  // SUNFLOWERS (back right, behind the barrow)
  const sunflower = (x: number, z: number, h: number, yaw: number, bee: boolean) => {
    const pts: V[] = [
      [x, G - 0.01, z],
      [x + 0.01, G + h * 0.4, z + 0.01],
      [x - 0.01, G + h * 0.8, z + 0.05],
      [x, G + h, z + 0.15],
    ];
    b.sweep(catmull(pts), [0.03, 0.024, 0.02, 0.02], { color: C.stem, bone: root, sides: 7, caps: "round", name: "sunflowerStem" });
    for (const t of [0.22, 0.4, 0.58, 0.74]) {
      const q = catmull(pts).at(t);
      const a = t * 20 + yaw;
      card("bigLeaf", [q.x, q.y, q.z], [Math.sin(a), 0.2, Math.cos(a)]);
      card("bigLeaf", [q.x, q.y + 0.03, q.z], [-Math.sin(a), 0.2, -Math.cos(a)]);
    }
    const head = new THREE.Matrix4().compose(v3(pts[3]), aim([Math.sin(yaw * DEG) * 0.3, 0.12, 1], [0, 1, 0], "z"), ONE);
    withMatrix(head, () => {
      solo(new THREE.CircleGeometry(0.13, 22), "#ffffff", lm([0, 0, 0.0]), { texture: SEEDS, name: "sunflowerDisc" });
      ell(C.leafDark, [0, 0, -0.065], [0.14, 0.14, 0.045], undefined, [10, 5]);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2 + 0.2;
        ell(C.orange, [Math.sin(a) * 0.185, Math.cos(a) * 0.185, -0.012], [0.032, 0.075, 0.007], [0, 0, (-a) / DEG], [6, 4]);
      }
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        ell(C.yellow, [Math.sin(a) * 0.168, Math.cos(a) * 0.168, 0.0], [0.03, 0.07, 0.007], [0, 0, (-a) / DEG], [6, 4]);
      }
      if (bee) {
        within([0.04, -0.17, 0.035], 10, 1, () => {
          ell(C.yellow, [0, 0, 0], [0.024, 0.022, 0.032], [0, 0, 0], [7, 5]);
          ell(C.ink, [0, 0, -0.012], [0.0255, 0.0235, 0.008], [0, 0, 0], [7, 4]);
          ell(C.ink, [0, 0, 0.012], [0.0252, 0.0232, 0.007], [0, 0, 0], [7, 4]);
          ball(C.ink, [0, 0.002, 0.034], 0.012, [5, 4]);
          for (const s of [-1, 1]) {
            ell(C.petalW, [s * 0.026, 0.026, -0.004], [0.018, 0.005, 0.03], [0, 0, s * -30], [6, 3]);
            ball(C.white, [s * 0.008, 0.002, 0.041], 0.004, [4, 3]);
          }
          rodG(C.ink, [0, 0.0, -0.032], [0, -0.004, -0.05], 0.004, 0.0015, 4);
        });
      }
    });
  };
  sunflower(0.78, -0.62, 1.28, 12, false);
  sunflower(1.0, -0.66, 1.1, -18, true);
  sunflower(1.2, -0.52, 0.98, 25, false);

  // ==============================================================================================================
  // VEG PLOT (front left)
  within([PLOT.x, G, PLOT.z], 0, 1, () => {
    for (const dz of [-0.15, 0.0, 0.15]) ell(C.soilDark, [0, 0.008, dz], [0.38, 0.03, 0.055], undefined, [10, 4]);
    // cabbages
    for (const x of [-0.27, 0.0, 0.27]) {
      ell(C.cabbage, [x, 0.065, -0.15], [0.085, 0.07, 0.085], undefined, [9, 6]);
      ell(C.cabbage2, [x, 0.085, -0.15], [0.055, 0.045, 0.055], undefined, [8, 5]);
      leafRing("lettuce", [x, 0.03, -0.15], 6, 0.5, x * 9);
    }
    // carrots peeking out
    for (let i = 0; i < 6; i++) {
      const x = -0.3 + i * 0.12;
      ell(C.carrot, [x, 0.02, 0.0], [0.018, 0.012, 0.018], undefined, [6, 4]);
      card("carrot", [x, 0.022, 0.0], [Math.sin(i * 2), 1, Math.cos(i * 2)]);
    }
    // radishes and lettuces
    for (const x of [-0.3, -0.15, 0.3]) {
      ell(C.hotPink, [x, 0.024, 0.15], [0.022, 0.016, 0.022], undefined, [6, 4]);
      leafRing("leafSmall", [x, 0.03, 0.15], 4, 0.7, x * 7);
    }
    for (const x of [0.0, 0.15]) leafRing("lettuce", [x, 0.03, 0.15], 8, 0.45, x * 5);
    // stakes, string and seed packets
    for (const sx of [-1, 1]) {
      rodG(C.wood1, [sx * 0.43, -0.005, 0.0], [sx * 0.43, 0.26, 0.0], 0.008, 0.007, 5);
      ball(C.wood2, [sx * 0.43, 0.265, 0.0], 0.011, [5, 4]);
    }
    rodG(C.cream, [-0.43, 0.2, 0.0], [0.43, 0.2, 0.0], 0.0025, 0.0025, 3);
    for (const sx of [-1, 1]) texPlane(PACKET, [sx * 0.43, 0.3, 0.016], [0.07, 0.095], [0, 0.05, 1]);
    // row labels
    const labs: [number, THREE.Texture][] = [[-0.28, LABEL_CABBAGE], [0.0, LABEL_CARROT], [0.28, LABEL_RADISH]];
    for (const [x, tex] of labs) {
      rodG(C.wood1, [x, -0.005, 0.255], [x, 0.1, 0.255], 0.006, 0.006, 4);
      texPlane(tex, [x, 0.14, 0.26], [0.075, 0.105], [0, 0.35, 1]);
    }
    snail([0.4, 0.0, 0.2], -60);
    // pinwheel on a stick
    rodG(C.wood1, [-0.34, -0.005, -0.25], [-0.34, 0.36, -0.25], 0.005, 0.004, 4);
    within([-0.34, 0.37, -0.24], 20, 1, () => {
      const vane = [C.red, C.yellow, C.blue, C.leaf];
      const tri = new THREE.Shape();
      tri.moveTo(0, 0);
      tri.lineTo(0.075, 0);
      tri.lineTo(0.03, 0.065);
      tri.closePath();
      for (let k = 0; k < 4; k++) put(vane[k], new THREE.ExtrudeGeometry(tri, { depth: 0.004, bevelEnabled: false }), lm([0, 0, 0.002 * k], [0, 0, k * 90]));
      ball(C.gold, [0, 0, 0.012], 0.011, [5, 4]);
    });
  });
  snail([-0.07, G + 0.03, 0.66], 80);

  // ==============================================================================================================
  // TREE STUMP with a gnome door (left)
  within([-1.2, G, -0.08], 28, 1, () => {
    const c0 = W([0, 0, 0]);
    const barkFine = grain("#8a5a3a", "#6b4128", { size: 0.018, axis: "y", seed: 2 });
    const bark = paint((p, n) => {
      if (n.y > 0.85) {
        const d = Math.hypot(p.x - c0.x, p.z - c0.z);
        const ring = Math.sin(d * 95 + noise(p, 0.1, 3) * 3);
        return ring > 0.55 ? "#b88a54" : mix("#e5c48d", "#d6b278", noise(p, 0.05, 2));
      }
      return p.y - G < 0.05 && noise(p, 0.07, 4) > 0.45 ? C.moss : barkFine;
    });
    b.lathe(
      [
        [0, 0],
        [0.26, 0],
        [0.225, 0.035],
        [0.195, 0.1],
        [0.185, 0.22],
        [0.205, 0.29],
        [0.19, 0.315],
        [0, 0.315],
      ],
      { at: W([0, 0, 0]), segments: 12, color: bark, bone: root, name: "stump" },
    );
    const arch = (w: number, h: number): [number, number][] => [[-w, 0], [w, 0], [w, h * 0.62], [w * 0.75, h * 0.86], [0, h], [-w * 0.75, h * 0.86], [-w, h * 0.62]];
    b.extrude(arch(0.066, 0.2), {
      at: W([0, 0.045, 0.2]),
      x: WD([1, 0, 0]),
      y: [0, 1, 0],
      thickness: 0.03,
      smoothing: 1,
      color: C.stone2,
      bone: root,
      name: "doorFrame",
    });
    b.extrude(arch(0.052, 0.18), {
      at: W([0, 0.045, 0.205]),
      x: WD([1, 0, 0]),
      y: [0, 1, 0],
      thickness: 0.03,
      smoothing: 1,
      color: paint((_p, _n, s) => {
        const seam = Math.abs((((s[0] + 0.052) % 0.026) + 0.026) % 0.026 - 0.013) > 0.0115;
        return seam ? mix("#d19a62", "#bb8350", 0.5) : "#6a3f22";
      }),
      bone: root,
      name: "gnomeDoor",
    });
    glow(solo(new THREE.CircleGeometry(0.019, 10), C.glass, lm([0, 0.19, 0.2215]), { name: "doorWindow" }), 1);
    torus(C.woodDark, [0, 0.19, 0.222], 0.021, 0.004, undefined, 4, 10);
    ball(C.gold, [0.032, 0.11, 0.223], 0.007, [5, 4]);
    for (const dy of [0.08, 0.17]) box(C.iron, [-0.0, 0.045 + dy, 0.222], [0.1, 0.012, 0.004]);
    // stepping stones, welcome mat, tiny lamp
    cyl(C.stone3, [0, 0.01, 0.31], 0.06, 0.065, 0.02, 7);
    cyl(C.stone1, [0.03, 0.01, 0.4], 0.045, 0.05, 0.02, 7);
    box(C.red, [0, 0.022, 0.285], [0.07, 0.006, 0.04]);
    rodG(C.iron, [0.1, 0.0, 0.26], [0.1, 0.17, 0.26], 0.004, 0.004, 4);
    glow(solo(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6), C.glass, lm([0.1, 0.19, 0.26]), { name: "stumpLamp" }), 1);
    cone(C.iron, [0.1, 0.215, 0.26], 0.02, 0.02, 6);
    // ivy and moss on the left side
    for (const [y, a] of [[0.1, 1.9], [0.17, 2.3], [0.24, 1.7], [0.3, 2.5]] as [number, number][])
      card("leafSmall", [Math.sin(a) * 0.19, y, Math.cos(a) * 0.19], [Math.sin(a), 0.4, Math.cos(a)]);
    // mini pot on top of the stump
    pot([-0.02, 0.31, -0.08], 0.06, 0.085, "dots", 10);
    within([-0.02, 0.31, -0.08], 10, 1, () => {
      for (let i = 0; i < 5; i++) {
        const a = i * 1.26;
        ball(i % 2 ? C.purple : C.violet, [Math.sin(a) * 0.025, 0.1 + (i % 2) * 0.01, Math.cos(a) * 0.025], 0.02, [6, 4]);
      }
      leafRing("leafSmall", [0, 0.07, 0], 4, 0.8);
    });
    mush([0.2, 0.0, 0.2], 0.04, 0.05, C.mush, C.mushCream, -8);
    mush([0.26, 0.0, 0.1], 0.026, 0.035, C.orange, C.mushCream, 6);
    mush([-0.22, 0.0, 0.2], 0.033, 0.045, C.mushBrown, C.mushCream, 5);
  });

  // ==============================================================================================================
  // SIGNPOST with a swinging sign (far left)
  within([-1.4, G, 0.3], 22, 1, () => {
    const swing = b.joint("signHinge", { parent: root, at: W([0.3, 0.84, 0]), dir: WD([1, 0, 0]), role: "hinge" });
    cyl(C.wood2, [0, 0.45, 0], 0.036, 0.046, 0.9, 7);
    ball(C.wood3, [0, 0.915, 0], 0.05, [7, 5]);
    rodG(C.wood2, [0, 0.84, 0], [0.62, 0.84, 0], 0.022, 0.022, 6);
    rodG(C.wood2, [0.02, 0.7, 0], [0.22, 0.84, 0], 0.016, 0.016, 5);
    ball(C.wood3, [0.63, 0.84, 0], 0.026, [6, 4]);
    // hanging flower basket at the arm tip
    for (const a of [0.4, 2.5, 4.6]) rodG(C.iron, [0.63, 0.84, 0], [0.63 + Math.sin(a) * 0.055, 0.72, Math.cos(a) * 0.055], 0.0025, 0.0025, 3);
    {
      const g = new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      g.scale(0.065, 0.045, 0.065);
      put(C.wood1, g, lm([0.63, 0.72, 0]));
      torus(C.wood3, [0.63, 0.72, 0], 0.065, 0.006, [90, 0, 0], 4, 12);
      ell(C.soil, [0.63, 0.719, 0], [0.058, 0.01, 0.058], undefined, [8, 3]);
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4;
        ball([C.pink, C.yellow, C.hotPink][i % 3], [0.63 + Math.sin(a) * 0.03, 0.74 + (i % 2) * 0.012, Math.cos(a) * 0.03], 0.017, [6, 4]);
      }
      card("leafSmall", [0.63 + 0.05, 0.725, 0], [1, -0.3, 0]);
      card("leafSmall", [0.63 - 0.05, 0.725, 0], [-1, -0.3, 0]);
      card("leafSmall", [0.63, 0.725, 0.05], [0, -0.3, 1]);
    }
    for (let i = 0; i < 8; i++) ball(C.wood3, [0.0 + Math.sin(i) * 0.046, 0.06 + i * 0.012, Math.cos(i) * 0.046], 0.012, [4, 3]);
    onBone(swing, () => {
      for (const x of [0.12, 0.48]) {
        rodG(C.iron, [x, 0.84, 0.0], [x, 0.74, 0.0], 0.004, 0.004, 4);
        torus(C.iron, [x, 0.84, 0.0], 0.012, 0.0035, [0, 90, 0], 3, 8);
      }
      solo(new THREE.BoxGeometry(0.46, 0.2, 0.028), "#ffffff", lm([0.3, 0.64, 0.0]), { texture: SIGN, name: "signBoard" });
      for (const x of [0.12, 0.48]) ball(C.gold, [x, 0.74, 0.0], 0.008, [4, 3]);
    });
    // flowers at the post foot
    for (let i = 0; i < 4; i++) tulip([Math.sin(i * 1.7) * 0.09 + 0.02, 0.0, 0.07 + Math.cos(i * 1.7) * 0.05], 0.14 + i * 0.02, [C.yellow, C.pink, C.red, C.orange][i]);
    mush([-0.1, 0.0, 0.12], 0.032, 0.04, C.mush, C.mushCream, 6);
  });

  // ==============================================================================================================
  // CLIMBING ROSES on the fence, spade, pebbles, mushrooms by the bath
  {
    const vine: V[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      vine.push([-1.0 + t * 0.52, G + 0.12 + 0.28 * Math.sin(t * 5) * 0.5 + t * 0.12, FZ + 0.035]);
    }
    b.sweep(catmull(vine), 0.008, { color: C.leafDark, bone: root, sides: 5, caps: "round", name: "roseVine" });
    vine.forEach((q, i) => {
      card("leafSmall", q, [Math.sin(i * 2.1) * 0.8, 0.3, 0.9]);
      if (i % 2 === 1) {
        ball(C.red, [q[0], q[1] + 0.012, q[2] + 0.025], 0.03, [7, 5]);
        ball(C.barrow, [q[0], q[1] + 0.016, q[2] + 0.047], 0.017, [5, 4]);
        ball(C.hotPink, [q[0], q[1] + 0.018, q[2] + 0.057], 0.009, [4, 3]);
      }
    });
  }
  // spade leaning on the fence
  {
    const lean = new THREE.Matrix4().compose(v3([-0.3, G, FZ + 0.12]), new THREE.Quaternion().setFromEuler(new THREE.Euler(-12 * DEG, 0, 0)), ONE);
    withMatrix(lean, () => {
      rodG(C.wood1, [0, 0.38, 0], [0, 0.78, 0], 0.014, 0.014, 6);
      box(C.wood1, [0, 0.8, 0], [0.09, 0.022, 0.026]);
      ball(C.wood1, [0.045, 0.8, 0], 0.016, [4, 3]);
      ball(C.wood1, [-0.045, 0.8, 0], 0.016, [4, 3]);
      box(C.steel, [0, 0.37, 0], [0.025, 0.06, 0.01]);
      ell(C.steel, [0, 0.2, 0], [0.075, 0.18, 0.008], undefined, [8, 5]);
      ell(C.steel, [0, 0.17, 0.004], [0.04, 0.12, 0.004], undefined, [6, 4]);
    });
  }
  mush([0.22, G, -0.52], 0.045, 0.06, C.mush, C.mushCream, -6);
  mush([0.3, G, -0.45], 0.03, 0.04, C.mush, C.mushCream, 8);
  mush([0.17, G, -0.46], 0.022, 0.03, C.orange, C.mushCream, 0);
  mush([-0.52, G, -0.16], 0.04, 0.05, C.mushBrown, C.mushCream, 4);
  // pebbles and little stones
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * 0.95;
    const [ex, ez] = edgePt(a, rr);
    if (pathDist(ex, ez) < 0.2) continue;
    const s = 0.012 + rand() * 0.012;
    ell([C.stone1, C.stone2, C.stone3][i % 3], [ex, G + 0.002, ez], [s * 1.3, s * 0.7, s], [0, rand() * 90, 0], [6, 4]);
  }

  // ==============================================================================================================
  // GRASS TUFTS, LAWN FLOWERS
  const OBS: [number, number, number][] = [
    [BBX, BBZ, 0.42],
    [0.26, 0.02, 0.26],
    [-0.55, 0.12, 0.26],
    [1.06, 0.48, 0.32],
    [0.7, 0.7, 0.18],
    [0.42, 0.95, 0.15],
    [1.4, 0.16, 0.14],
    [-0.26, 0.92, 0.2],
    [-1.2, -0.08, 0.28],
    [-1.4, 0.3, 0.12],
    [-1.0, -0.55, 0.22],
    [-0.65, -0.55, 0.22],
    [1.0, -0.2, 0.36],
    [1.28, -0.4, 0.16],
    [0.78, -0.6, 0.1],
    [1.0, -0.64, 0.1],
    [1.2, -0.52, 0.1],
    [0.7, -0.15, 0.2],
  ];
  const free = (x: number, z: number, pad: number) => {
    if (z < FZ + 0.08) return false;
    if (pathDist(x, z) < 0.15 + pad) return false;
    if (Math.hypot((x - PLOT.x) / (PLOT.rx + 0.05), (z - PLOT.z) / (PLOT.rz + 0.05)) < 1) return false;
    return OBS.every(([ox, oz, r]) => Math.hypot(x - ox, z - oz) > r + pad);
  };
  const lawn = b.surface(turfPart);
  for (const h of lawn.scatter(380, { rng: rng(21), minDist: 0.075, filter: (h) => h.n.y > 0.9 && free(h.at.x, h.at.z, 0.02) }))
    card("tuft", [h.at.x, h.at.y, h.at.z], [0, 1, 0]);
  const flowerKinds = ["daisy", "daisy", "buttercup", "cosmos", "buttercup", "daisy"] as const;
  lawn
    .scatter(46, { rng: rng(33), minDist: 0.2, filter: (h) => h.n.y > 0.9 && free(h.at.x, h.at.z, 0.05) })
    .forEach((h, i) => card(flowerKinds[i % flowerKinds.length], [h.at.x, h.at.y, h.at.z], [(rand() - 0.5) * 0.3, 1, (rand() - 0.5) * 0.3]));

  // ==============================================================================================================
  // flush merged geometry and card sets
  for (const e of bag.values()) {
    const merged = mergeGeometries(e.geos);
    if (!merged) throw new Error("merge failed");
    b.part(merged, e.color as string, { bone: e.bone, at: [0, 0, 0], name: `m_${e.bone.name}_${String(e.color).replace("#", "")}` });
  }
  const up: [number, number, number] = [0, 1, 0];
  const front: [number, number, number] = [0, 0, 1];
  const common = { bone: root, rng: rng(77) };
  b.cards(cardSets.leaf, LEAF, { ...common, size: [0.11, 0.15], lean: 28, bend: -25, flow: up, vary: 0.25 });
  b.cards(cardSets.bigLeaf, LEAF, { ...common, size: [0.2, 0.26], lean: 35, bend: -30, flow: up, vary: 0.2 });
  b.cards(cardSets.leafSmall, LEAF, { ...common, size: [0.065, 0.085], lean: 25, bend: -20, flow: up, vary: 0.25 });
  b.cards(cardSets.lettuce, LEAF_LIGHT, { ...common, size: [0.12, 0.11], lean: 35, bend: -25, flow: up, vary: 0.2 });
  b.cards(cardSets.blade, LEAF, { ...common, size: [0.04, 0.16], lean: 18, bend: -25, flow: up, cross: true, vary: 0.2 });
  b.cards(cardSets.carrot, CARROTTOP, { ...common, size: [0.1, 0.14], lean: 8, flow: front, cross: true, vary: 0.2 });
  b.cards(cardSets.tuft, TUFT, { ...common, size: [0.1, 0.09], lean: 0, flow: front, cross: true, vary: 0.35, spin: 180 });
  b.cards(cardSets.daisy, DAISY, { ...common, size: [0.09, 0.145], lean: 0, flow: front, cross: true, vary: 0.15 });
  b.cards(cardSets.buttercup, BUTTERCUP, { ...common, size: [0.09, 0.145], lean: 0, flow: front, cross: true, vary: 0.15 });
  b.cards(cardSets.cosmos, COSMOS, { ...common, size: [0.1, 0.16], lean: 0, flow: front, cross: true, vary: 0.15 });

  // ==============================================================================================================
  // helper for textured planes (needs `solo`)
  function texPlane(tex: THREE.Texture, pos: V, size: [number, number], normal: V, up: V = [0, 1, 0]) {
    const z = v3(normal).normalize();
    const y0 = v3(up);
    const x = new THREE.Vector3().crossVectors(y0, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x);
    const m = new THREE.Matrix4().makeBasis(x, y, z).setPosition(v3(pos));
    return solo(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", m, { texture: tex, name: "decal" });
  }

  return b.root;
}
