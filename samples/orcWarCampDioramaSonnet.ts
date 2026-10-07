// Orc war camp diorama, Blizzard/Warcraft style: chunky timber hut, tusk totems, clan banners, a cauldron fire.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, DEG, rng } from "../src/math";
import { catmull } from "../src/path";
import { mix, mottle, grain, noise, paint, resolve, smoothstep } from "../src/paint";
import type { ColorInput, Paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Orc War Camp",
  description:
    "A diorama of a fortified orc war camp: a hide-roofed timber hut with tusk horns and lit slit windows, a carved tusk totem and a skull totem, two clan banners, a cauldron over a stone-ringed fire, a war drum, weapon rack, palisade and camp clutter.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

const G = 0.2; // top of the earth base: every object stands here
const K = 0.88; // scene scale applied to everything stood on the base
const FIRE: V = [0.45 * K, G, 0.6 * K];

const C = {
  dirt: "#7b5a3a",
  dirt2: "#5d4229",
  dirtD: "#3d2a1a",
  ash: "#2b2623",
  grass: "#8d8b3f",
  grass2: "#aaa650",
  wL: "#aa7540",
  wM: "#7b4e2b",
  wD: "#4e301b",
  wK: "#2b1a10",
  hideL: "#dcb67f",
  hide: "#bb8d58",
  hideD: "#85593a",
  fur: "#3d2c23",
  furL: "#6c4b39",
  red: "#b8261f",
  redD: "#7c1713",
  redL: "#e4502e",
  ironL: "#9aa0ab",
  iron: "#5a5e69",
  ironD: "#2e3039",
  rust: "#8c4b2b",
  bone: "#ece1c4",
  boneD: "#b9a982",
  stoneL: "#a8a295",
  stone: "#86817b",
  stoneD: "#5e5a54",
  stoneK: "#3f3c39",
  rope: "#c9a76e",
  ropeD: "#8f7242",
  fire1: "#fff2ae",
  fire2: "#ffc233",
  fire3: "#ff7a1c",
  fire4: "#e03d17",
  green: "#628f38",
  greenD: "#3e6a26",
  brew: "#92e03e",
  black: "#1a1618",
  white: "#f4efe2",
  gold: "#d1a13a",
  amber: "#ffb43c",
};

export default function build() {
  const b = createBuilder({ name: "orcWarCamp", paintSize: 2048 });
  const root = b.joint("camp", { at: [0, 0, 0] });
  const rand = rng(41);

  // ------------------------------------------------------------------------------------------------------------
  // Transform stack and part collector. Everything is baked into model space and merged per object/bone/colour.
  let T = new THREE.Matrix4();
  const tv = new THREE.Vector3();
  const W = (x: number, y: number, z: number): V => {
    tv.set(x, y, z).applyMatrix4(T);
    return [tv.x, tv.y, tv.z];
  };
  const Dv = (x: number, y: number, z: number): V => {
    tv.set(x, y, z).transformDirection(T);
    return [tv.x, tv.y, tv.z];
  };
  let S = K; // current uniform scale, for sweep radii
  const area = (at: V, rot: V | number, fn: () => void, s = 1) => {
    const old = T;
    const oldS = S;
    const r: V = typeof rot === "number" ? [0, rot, 0] : rot;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, "YXZ"));
    T = old
      .clone()
      .multiply(new THREE.Matrix4().compose(new THREE.Vector3(...at), q, new THREE.Vector3(s, s, s)));
    S = oldS * s;
    fn();
    T = old;
    S = oldS;
  };

  let grp = "camp";
  let bone: Joint = root;
  const setGroup = (name: string, joint: Joint = root) => {
    grp = name;
    bone = joint;
  };

  type Bucket = { geos: THREE.BufferGeometry[]; color: Col; bone: Joint; name: string; glow: number };
  const buckets = new Map<string, Bucket>();
  type PutOpts = { smooth?: boolean; glow?: number };

  const putM = (geo: THREE.BufferGeometry, color: Col, m: THREE.Matrix4, o: PutOpts = {}) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(T, m));
    for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
    if (!o.smooth) g.computeVertexNormals();
    g.clearGroups();
    const key = `${grp}|${bone.name}|${String(color)}|${o.glow ?? 0}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { geos: [], color, bone, name: `${grp}.${buckets.size}`, glow: o.glow ?? 0 };
      buckets.set(key, bucket);
    }
    bucket.geos.push(g);
  };

  const mat = (at: V, rot: V = [0, 0, 0], scale: number | V = 1) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
      typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale),
    );
  const put = (geo: THREE.BufferGeometry, color: Col, at: V, rot: V = [0, 0, 0], scale: number | V = 1, o?: PutOpts) =>
    putM(geo, color, mat(at, rot, scale), o);

  const box = (w: number, h: number, d: number, color: Col, at: V, rot?: V, o?: PutOpts) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, rot, 1, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, rot?: V, o?: PutOpts) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg, 1), color, at, rot, 1, o);
  const cone = (r: number, h: number, seg: number, color: Col, at: V, rot?: V, o?: PutOpts) =>
    put(new THREE.ConeGeometry(r, h, seg, 1), color, at, rot, 1, o);
  const ball = (r: number, color: Col, at: V, scale: number | V = 1, o?: PutOpts, detail = 1) =>
    put(new THREE.IcosahedronGeometry(r, detail), color, at, [0, 0, 0], scale, o);
  const tube = (a: V, c: V, r0: number, r1: number, color: Col, seg = 6, o?: PutOpts) => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...c);
    const d = vb.clone().sub(va);
    const m = new THREE.Matrix4().compose(
      va.clone().add(vb).multiplyScalar(0.5),
      aim(d),
      new THREE.Vector3(1, 1, 1),
    );
    putM(new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1), color, m, o);
  };
  const shapeG = (pts: [number, number][], depth: number, bevel = 0) => {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 1,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const poly = (pts: [number, number][], depth: number, color: Col, at: V, rot?: V, bevel = 0, o?: PutOpts) =>
    put(shapeG(pts, depth, bevel), color, at, rot, 1, o);

  const rockG = () => {
    const g = new THREE.IcosahedronGeometry(1, 0);
    const pos = g.getAttribute("position");
    const f = new Map<string, number>();
    for (let i = 0; i < pos.count; i++) {
      const k = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      let s = f.get(k);
      if (s === undefined) f.set(k, (s = 0.74 + rand() * 0.46));
      pos.setXYZ(i, pos.getX(i) * s, pos.getY(i) * s, pos.getZ(i) * s);
    }
    return g;
  };
  const rock = (at: V, sx: number, sy: number, sz: number, color: Col, yaw = rand() * 360) =>
    put(rockG(), color, at, [0, yaw, 0], [sx, sy, sz]);

  const sw = (
    pts: V[],
    radius: number | [number, number] | ((t: number) => number),
    color: Col,
    o: { sides?: number; caps?: "round" | "flat" | "point" | "none"; glow?: number; name?: string } = {},
  ) => {
    const r =
      typeof radius === "number" ? radius * S : Array.isArray(radius) ? ([radius[0] * S, radius[1] * S] as [number, number]) : radius;
    const s = b.sweep(catmull(pts.map((p) => W(...p))), r, {
      color,
      bone,
      sides: o.sides ?? 6,
      caps: o.caps ?? "round",
      group: grp,
      name: o.name,
    });
    if (o.glow) glow(s, o.glow);
    return s;
  };

  const tex = (geo: THREE.BufferGeometry, texture: THREE.Texture, m: THREE.Matrix4, glowing = 0, name?: string) => {
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(T, m));
    const p = b.part(geo, "#ffffff", { bone, at: [0, 0, 0], texture, group: grp, name });
    if (glowing) glow(p, glowing);
    return p;
  };
  const decal = (texture: THREE.Texture, w: number, h: number, at: V, rot: V = [0, 0, 0], glowing = 0) =>
    tex(new THREE.PlaneGeometry(w, h), texture, mat(at, rot), glowing);

  // ------------------------------------------------------------------------------------------------------------
  // Hand-painted surface library: every colour goes through `hp`, which paints in contact shadow near the ground,
  // sky light on top faces, cool underside shadow, brush noise, firelight near the fire and soot at its edge.
  const hp = (c: ColorInput): Paint =>
    paint((p, n) => {
      const [r0, g0, b0] = resolve(c, p, n);
      const h = p.y - G;
      const k =
        (0.66 + 0.34 * smoothstep(0, 0.32, h)) *
        (1 + 0.14 * smoothstep(0.2, 1, n.y) - 0.2 * smoothstep(0.2, -0.9, n.y)) *
        (0.94 + 0.12 * noise(p, 0.07, 9));
      let r = r0 * k;
      let g = g0 * k;
      let bl = b0 * k * (0.95 + 0.07 * smoothstep(0.3, -0.8, n.y));
      const dx = FIRE[0] - p.x;
      const dy = FIRE[1] + 0.12 - p.y;
      const dz = FIRE[2] - p.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < 1.2) {
        const facing = Math.max(0, (n.x * dx + n.y * dy + n.z * dz) / d);
        const w = (1 - smoothstep(0.15, 1.2, d)) * (0.18 + 0.82 * facing) * 0.6;
        r += (1.0 - r) * w;
        g += (0.6 - g) * w;
        bl += (0.2 - bl) * w;
        const dd = Math.hypot(dx, dz);
        if (dd < 0.52 && h < 0.5) {
          const s = (1 - smoothstep(0.2, 0.52, dd)) * (1 - smoothstep(0.08, 0.5, h)) * 0.55;
          r += (0.07 - r) * s;
          g += (0.06 - g) * s;
          bl += (0.055 - bl) * s;
        }
      }
      return [Math.min(r, 1), Math.min(g, 1), Math.min(bl, 1)];
    });

  const woodA = hp(grain(C.wM, C.wD, { size: 0.03, axis: "y", seed: 1 }));
  const woodB = hp(grain(C.wL, C.wM, { size: 0.03, axis: "y", seed: 2 }));
  const woodC = hp(grain(C.wD, C.wK, { size: 0.03, axis: "y", seed: 3 }));
  const woodX = hp(grain(C.wM, C.wD, { size: 0.03, axis: "x", seed: 4 }));
  const woodZ = hp(grain(C.wM, C.wD, { size: 0.03, axis: "z", seed: 5 }));
  const woodLX = hp(grain(C.wL, C.wM, { size: 0.03, axis: "x", seed: 6 }));
  const woodLZ = hp(grain(C.wL, C.wM, { size: 0.03, axis: "z", seed: 7 }));
  const plankSet = [woodB, woodA, woodB, woodC, woodA];
  const palisadeSet = [
    hp(grain("#7a6650", "#4a3b2d", { size: 0.03, axis: "y", seed: 61 })),
    hp(grain("#6b5846", "#3f3228", { size: 0.03, axis: "y", seed: 62 })),
    hp(grain("#8a735a", "#54443a", { size: 0.03, axis: "y", seed: 63 })),
  ];
  const hideP = hp(mottle(C.hide, C.hideD, { size: 0.12, contrast: 1.1, seed: 11 }));
  const hideLP = hp(mottle(C.hideL, C.hide, { size: 0.1, seed: 12 }));
  const hideDP = hp(mottle(C.hideD, C.fur, { size: 0.1, seed: 13 }));
  const roofA = hp(mottle("#b3814e", "#6b4a2d", { size: 0.14, contrast: 1.25, seed: 51 }));
  const roofB = hp(mottle("#d9bc88", "#9a7048", { size: 0.12, contrast: 1.15, seed: 52 }));
  const roofC = hp(mottle("#86593a", "#4c3322", { size: 0.12, contrast: 1.25, seed: 53 }));
  const furP = hp(mottle(C.fur, C.furL, { size: 0.05, contrast: 1.2, seed: 14 }));
  const redP = hp(mottle(C.red, C.redD, { size: 0.09, seed: 15 }));
  const ironP = hp(mottle(C.iron, C.ironD, { size: 0.05, contrast: 1.2, seed: 16 }));
  const ironLP = hp(mottle(C.ironL, C.iron, { size: 0.04, seed: 17 }));
  const boneP = hp(mottle(C.bone, C.boneD, { size: 0.045, seed: 18 }));
  const rockP = hp(mottle(C.stone, C.stoneD, { size: 0.16, contrast: 1.3, seed: 19 }));
  const rockLP = hp(mottle(C.stoneL, C.stone, { size: 0.12, seed: 20 }));
  const rockDP = hp(mottle(C.stoneD, C.stoneK, { size: 0.14, seed: 21 }));
  const ropeP = hp(grain(C.rope, C.ropeD, { size: 0.012, axis: "x", seed: 22 }));
  const greenP = hp(mottle(C.green, C.greenD, { size: 0.07, seed: 23 }));
  const blackP = hp(mottle("#4b4352", "#2b2630", { size: 0.06, seed: 24 }));
  const sackP = hp(mottle("#c9ab76", "#a88a58", { size: 0.06, seed: 25 }));

  // ------------------------------------------------------------------------------------------------------------
  // Textures
  const star = (n: number, ro: number, ri: number) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i * Math.PI) / n - Math.PI / 2;
      const r = i % 2 ? ri : ro;
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join(" ");

  const bannerRed = svg(
    `<svg viewBox="0 0 200 400"><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6382a"/><stop offset="0.55" stop-color="#b3221b"/><stop offset="1" stop-color="#7e1410"/></linearGradient></defs>
<path d="M0 0H200V352L150 400L100 338L50 400L0 352Z" fill="url(#c)"/>
<path d="M0 0H200V16H0Z" fill="#5a0f0c"/>
<path d="M10 24H190V340L150 382L100 322L50 382L10 340Z" fill="none" stroke="#2a0e0c" stroke-width="6"/>
<path d="M19 30H181V334L150 366L100 308L50 366L19 334Z" fill="none" stroke="#e7c35c" stroke-width="3.5" stroke-dasharray="10 7"/>
<g transform="translate(100 140)"><polygon points="${star(12, 66, 49)}" fill="#1b1517" stroke="#e7c35c" stroke-width="4"/>
<circle r="44" fill="#8f1914" stroke="#2a0e0c" stroke-width="5"/>
<path d="M-32 -26C-38 14 -16 36 0 36C16 36 38 14 32 -26C24 6 13 21 0 21C-13 21 -24 6 -32 -26Z" fill="#efe4c6" stroke="#3a2a1a" stroke-width="3.5"/>
<path d="M-27 -10L-6 -3L-11 9Z" fill="#1a1416"/><path d="M27 -10L6 -3L11 9Z" fill="#1a1416"/>
<path d="M0 3L-5 15H5Z" fill="#1a1416"/></g>
<g stroke="#1a1416" stroke-width="9" stroke-linecap="round"><path d="M62 240L84 318"/><path d="M92 236L114 314"/><path d="M122 240L144 318"/></g>
<g stroke="#e8d9a8" stroke-width="3" stroke-linecap="round"><path d="M64 242L85 316"/><path d="M94 238L115 312"/><path d="M124 242L145 316"/></g>
</svg>`,
    { size: 512 },
  );

  const bannerDark = svg(
    `<svg viewBox="0 0 160 360"><defs><linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#352d31"/><stop offset="1" stop-color="#1c1719"/></linearGradient></defs>
<path d="M0 0H160V300L120 360L80 296L40 360L0 300Z" fill="url(#d)"/>
<path d="M8 10H152V294L120 336L80 282L40 336L8 294Z" fill="none" stroke="#e8dcb8" stroke-width="3.5" stroke-dasharray="9 6"/>
<g fill="#f1e8cc" stroke="#2a2326" stroke-width="2"><path d="M8 0L20 30L32 0Z"/><path d="M36 0L48 30L60 0Z"/><path d="M64 0L76 30L88 0Z"/><path d="M92 0L104 30L116 0Z"/><path d="M120 0L132 30L144 0Z"/></g>
<g stroke="#1a1214" stroke-width="22" stroke-linecap="round"><path d="M48 80L104 226"/><path d="M86 70L142 216"/></g>
<g stroke="#d33a24" stroke-width="15" stroke-linecap="round"><path d="M46 78L102 224"/><path d="M84 68L140 214"/><path d="M14 98L62 224"/></g>
<g stroke="#ffb066" stroke-width="3.5" stroke-linecap="round"><path d="M42 76L96 218"/><path d="M80 66L134 208"/></g>
<g transform="translate(80 270)"><circle r="15" fill="#efe4c6" stroke="#1a1214" stroke-width="3"/><path d="M-9 -3L-2 0L-5 5Z" fill="#1a1214"/><path d="M9 -3L2 0L5 5Z" fill="#1a1214"/></g>
</svg>`,
    { size: 512 },
  );

  const orcFace = svg(
    `<svg viewBox="0 0 100 100"><path d="M6 30L47 42L47 51L6 41Z" fill="#1b1a12"/><path d="M94 30L53 42L53 51L94 41Z" fill="#1b1a12"/>
<ellipse cx="27" cy="52" rx="13" ry="6.5" fill="#241810"/><ellipse cx="73" cy="52" rx="13" ry="6.5" fill="#241810"/>
<path d="M43 46L57 46L63 68L37 68Z" fill="#4c7a2e" stroke="#1e3a12" stroke-width="3"/><ellipse cx="43" cy="66" rx="4" ry="2.6" fill="#15240c"/><ellipse cx="57" cy="66" rx="4" ry="2.6" fill="#15240c"/>
<path d="M12 74Q50 84 88 74L86 88Q50 98 14 88Z" fill="#2a0f0c" stroke="#150806" stroke-width="2.5"/>
<path d="M20 90L25 60L35 90Z" fill="#f1e8c8" stroke="#6b5a3a" stroke-width="2.5"/><path d="M80 90L75 60L65 90Z" fill="#f1e8c8" stroke="#6b5a3a" stroke-width="2.5"/>
<g stroke="#c9291d" stroke-width="5" stroke-linecap="round"><path d="M8 58L26 70"/><path d="M92 58L74 70"/><path d="M6 66L20 78"/><path d="M94 66L80 78"/></g>
<path d="M30 14L50 4L70 14L50 24Z" fill="#c9291d" stroke="#5a0f0c" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const boarFace = svg(
    `<svg viewBox="0 0 100 100"><path d="M8 34L46 44L46 52L8 44Z" fill="#1b1410"/><path d="M92 34L54 44L54 52L92 44Z" fill="#1b1410"/>
<ellipse cx="50" cy="72" rx="26" ry="19" fill="#d79a78" stroke="#4a2418" stroke-width="4"/>
<ellipse cx="40" cy="72" rx="5.5" ry="8" fill="#3a1a12"/><ellipse cx="60" cy="72" rx="5.5" ry="8" fill="#3a1a12"/>
<path d="M25 86Q50 96 75 86" fill="none" stroke="#3a1a12" stroke-width="4"/>
<g stroke="#f1e8c8" stroke-width="5" stroke-linecap="round"><path d="M16 56L34 62"/><path d="M84 56L66 62"/></g>
<g stroke="#1b1410" stroke-width="5" stroke-linecap="round"><path d="M48 14L50 34"/><path d="M38 18L42 36"/><path d="M62 18L58 36"/></g></svg>`,
    { size: 256 },
  );
  const ravenEye = svg(
    `<svg viewBox="0 0 100 100"><path d="M6 50Q30 30 50 44Q40 66 6 62Z" fill="#f4efe2" stroke="#1a1618" stroke-width="4"/><path d="M94 50Q70 30 50 44Q60 66 94 62Z" fill="#f4efe2" stroke="#1a1618" stroke-width="4"/><path d="M14 54L38 50L34 58Z" fill="#1a1618"/><path d="M86 54L62 50L66 58Z" fill="#1a1618"/></svg>`,
    { size: 128 },
  );
  const drumRune = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#d6b27c"/><circle cx="50" cy="50" r="44" fill="none" stroke="#7a1713" stroke-width="5"/><circle cx="50" cy="50" r="35" fill="none" stroke="#2a1a10" stroke-width="3" stroke-dasharray="7 5"/>
<polygon points="${star(8, 30, 20).replace(/(-?[\d.]+),(-?[\d.]+)/g, (_m, x, y) => `${+x + 50},${+y + 50}`)}" fill="#a81f19" stroke="#2a0e0c" stroke-width="3"/>
<circle cx="50" cy="50" r="12" fill="#1a1618"/><path d="M42 46L58 46L50 60Z" fill="#efe4c6"/></svg>`,
    { size: 256 },
  );
  const shieldEmblem = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#8a5a30"/><path d="M50 50L50 2A48 48 0 0 1 98 50Z" fill="#b8261f"/><path d="M50 50L50 98A48 48 0 0 1 2 50Z" fill="#b8261f"/><path d="M50 50L98 50A48 48 0 0 1 50 98Z" fill="#1d1a1c"/><path d="M50 50L2 50A48 48 0 0 1 50 2Z" fill="#1d1a1c"/><circle cx="50" cy="50" r="47" fill="none" stroke="#3a2412" stroke-width="4"/></svg>`,
    { size: 192 },
  );
  const hideSign = svg(
    `<svg viewBox="0 0 100 120"><path d="M6 8L50 0L94 8L100 40L92 70L98 104L50 120L8 106L2 70L8 38Z" fill="#d1a76e" stroke="#6a4424" stroke-width="4"/>
<path d="M14 16L50 10L86 16L90 40L84 70L88 98L50 110L16 98L12 70L18 40Z" fill="none" stroke="#6a4424" stroke-width="2.5" stroke-dasharray="6 5"/>
<g stroke="#7d1511" stroke-width="10" stroke-linecap="round"><path d="M28 24L44 94"/><path d="M48 22L64 92"/><path d="M68 24L82 90"/></g>
<g stroke="#d9442b" stroke-width="4" stroke-linecap="round"><path d="M27 26L42 90"/><path d="M47 24L62 88"/><path d="M67 26L80 86"/></g></svg>`,
    { size: 256 },
  );
  const grassTex = svg(
    `<svg viewBox="0 0 64 64"><path d="M6 64L10 14L16 64Z" fill="#8a8a36"/><path d="M14 64L26 4L24 64Z" fill="#a8a64e"/><path d="M22 64L38 18L32 64Z" fill="#7a7c30"/><path d="M30 64L50 8L38 64Z" fill="#b4ae58"/><path d="M38 64L58 22L46 64Z" fill="#8a8a36"/><path d="M44 64L52 30L50 64Z" fill="#a8a64e"/></svg>`,
    { size: 128 },
  );
  const tuft = svg(
    `<svg viewBox="0 0 32 32"><path d="M2 32L6 6L10 32Z" fill="#9a9a3e"/><path d="M9 32L17 1L16 32Z" fill="#b8b45a"/><path d="M16 32L28 9L22 32Z" fill="#82843a"/></svg>`,
    { size: 64 },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Shared prop builders (all in the current local space)
  const skull = (at: V, s: number, yaw: number, kind: "orc" | "horned" | "small" = "orc", pitch = 0) => {
    area(
      at,
      [pitch, yaw, 0],
      () => {
        ball(0.5, boneP, [0, 0.52, 0], [1, 0.88, 1.1], undefined, 1);
        box(0.62, 0.12, 0.4, boneP, [0, 0.66, 0.34]); // brow ridge
        box(0.5, 0.22, 0.5, boneP, [0, 0.12, 0.42], [-4, 0, 0]); // upper jaw
        box(0.46, 0.13, 0.5, boneP, [0, -0.1, 0.34], [-6, 0, 0]); // lower jaw
        for (const s2 of [1, -1]) {
          ball(0.14, C.black, [s2 * 0.2, 0.46, 0.5], [1, 1.05, 0.7], undefined, 0); // eye socket
          ball(0.04, C.fire3, [s2 * 0.2, 0.46, 0.57], 1, { glow: 0 }, 0);
        }
        cone(0.07, 0.16, 3, C.black, [0, 0.24, 0.66], [180, 0, 0]); // nose hole
        for (let i = -3; i <= 3; i++) box(0.055, 0.09, 0.05, C.bone, [i * 0.065, 0.0, 0.66]);
        for (let i = -2; i <= 2; i++) box(0.055, 0.08, 0.05, C.bone, [i * 0.07, -0.01, 0.6], [0, 0, 0]);
        if (kind === "orc") {
          for (const s2 of [1, -1]) {
            tube([s2 * 0.22, -0.05, 0.66], [s2 * 0.3, 0.24, 0.8], 0.06, 0.012, C.bone, 5);
          }
          box(0.12, 0.2, 0.1, boneP, [0, 0.9, 0.16], [30, 0, 0]); // sagittal crest
        } else if (kind === "horned") {
          for (const s2 of [1, -1]) {
            tube([s2 * 0.42, 0.72, 0.0], [s2 * 0.78, 0.82, -0.05], 0.1, 0.07, boneP, 6);
            tube([s2 * 0.78, 0.82, -0.05], [s2 * 0.98, 1.2, 0.05], 0.07, 0.015, boneP, 6);
          }
        }
      },
      s,
    );
  };

  const torch = (x: number, z: number, h: number, yaw = 0) => {
    area([x, 0, z], yaw, () => {
      setGroup("torch");
      tube([0, -0.02, 0], [0, h, 0], 0.03, 0.026, woodA, 6);
      cyl(0.075, 0.045, 0.1, 7, ironP, [0, h + 0.04, 0]);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cone(0.014, 0.06, 4, ironLP, [Math.cos(a) * 0.075, h + 0.11, Math.sin(a) * 0.075]);
      }
      cyl(0.082, 0.082, 0.02, 7, C.ironD, [0, h + 0.075, 0]);
      cyl(0.04, 0.04, 0.05, 6, ropeP, [0, h - 0.3, 0]);
      cyl(0.04, 0.04, 0.05, 6, ropeP, [0, h - 0.45, 0]);
      const fl = (p: V, tip: V, r: number, color: string, g: number) =>
        sw([p, [p[0] * 0.4 + tip[0] * 0.6 + 0.01, (p[1] + tip[1]) / 2, p[2] * 0.4 + tip[2] * 0.6], tip], [r, 0.002], color, {
          sides: 5,
          caps: "point",
          glow: g,
        });
      fl([0, h + 0.09, 0], [0.02, h + 0.32, 0.01], 0.055, C.fire3, 1.3);
      fl([0.03, h + 0.09, 0.01], [0.06, h + 0.26, 0.02], 0.04, C.fire2, 1.4);
      fl([-0.03, h + 0.09, -0.01], [-0.05, h + 0.24, 0], 0.04, C.fire2, 1.4);
      fl([0, h + 0.09, 0], [0.0, h + 0.22, 0.01], 0.03, C.fire1, 1.5);
    });
  };

  const crossedBones = (at: V, yaw: number, len: number) => {
    area(at, [0, yaw, 0], () => {
      for (const s2 of [1, -1]) {
        const a: V = [-s2 * len, -len * 0.25, 0];
        const c: V = [s2 * len, len * 0.25, 0];
        tube(a, c, 0.025, 0.025, boneP, 6);
        for (const e of [a, c]) for (const dz of [0.02, -0.02]) ball(0.03, boneP, [e[0], e[1], dz], 1, undefined, 0);
      }
    });
  };

  const cloth = (w: number, h: number, amp: number, phase: number) => {
    const g = new THREE.PlaneGeometry(w, h, 5, 10);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const k = (h / 2 - y) / h;
      pos.setZ(i, amp * k * Math.sin(k * 5.2 + phase + x * 4.5));
      pos.setX(i, x * (1 - 0.05 * k));
    }
    g.computeVertexNormals();
    return g;
  };
  const backFace = (g: THREE.BufferGeometry, dz: number) => {
    const c = g.clone();
    const idx = c.getIndex()!;
    for (let i = 0; i < idx.count; i += 3) {
      const t = idx.getX(i + 1);
      idx.setX(i + 1, idx.getX(i + 2));
      idx.setX(i + 2, t);
    }
    const uv = c.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    const nrm = c.getAttribute("normal");
    for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, -nrm.getX(i), -nrm.getY(i), -nrm.getZ(i));
    c.translate(0, 0, dz);
    return c;
  };

  // ------------------------------------------------------------------------------------------------------------
  // 1. Earth base
  setGroup("base");
  const RB = 1.5;
  const outline: [number, number][] = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const r = RB * (0.97 + 0.035 * Math.sin(a * 3 + 1) + 0.025 * Math.sin(a * 5) + (rand() - 0.5) * 0.04);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  const groundMottle = mottle(C.dirt, C.dirt2, { size: 0.2, contrast: 1.2, seed: 3 });
  const groundP = paint((p, n) => {
    if (n.y < 0.55) {
      const lip = smoothstep(G - 0.055, G - 0.02, p.y);
      return mix(mix(C.stoneD, C.dirt2, smoothstep(0.07, 0.13, p.y)), C.dirtD, lip * 0.6);
    }
    let c = resolve(groundMottle, p, n);
    const rr = Math.hypot(p.x, p.z);
    const g = noise(p, 0.38, 5) + smoothstep(0.85, 1.4, rr) * 0.3;
    c = mix(c, noise(p, 0.05, 8) > 0.5 ? C.grass : C.grass2, smoothstep(0.55, 0.72, g) * 0.9);
    const d = Math.hypot(p.x - FIRE[0], p.z - FIRE[2]);
    const ax = -0.4 * K;
    const az = 0.32 * K;
    const sx = FIRE[0] - ax;
    const sz = FIRE[2] - az;
    const u = Math.min(Math.max(((p.x - ax) * sx + (p.z - az) * sz) / (sx * sx + sz * sz), 0), 1);
    const pd = Math.hypot(p.x - (ax + sx * u), p.z - (az + sz * u));
    c = mix(c, [0.31, 0.22, 0.14], (1 - smoothstep(0.05, 0.14, pd)) * 0.8);
    c = mix(c, [0.9, 0.5, 0.2], (1 - smoothstep(0.3, 1.0, d)) * 0.2);
    c = mix(c, C.ash, (1 - smoothstep(0.22, 0.52, d)) * 0.88);
    c = mix(c, [0.16, 0.12, 0.09], (1 - smoothstep(0.3, 0.75, d)) * 0.35 * noise(p, 0.1, 2));
    const ao = 1 - 0.18 * smoothstep(RB - 0.22, RB, rr);
    return [c[0] * ao, c[1] * ao, c[2] * ao];
  });
  const baseG = shapeG(outline, 0.12);
  baseG.translate(0, 0, 0.06);
  baseG.rotateX(-Math.PI / 2);
  put(baseG, groundP, [0, 0.08, 0]);
  const plinthG = shapeG(outline.map(([x, y]) => [x * 0.94, y * 0.94] as [number, number]), 0.08);
  plinthG.translate(0, 0, 0.04);
  plinthG.rotateX(-Math.PI / 2);
  put(plinthG, rockDP, [0, 0, 0]);
  // rim rocks
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rand() * 0.1;
    const r = RB * 0.99 + rand() * 0.04;
    const s = 0.075 + rand() * 0.06;
    rock([Math.cos(a) * r, 0.1 + s * 0.35, Math.sin(a) * r], s * 1.2, s * 0.9, s * 1.1, rand() > 0.55 ? rockP : rockLP);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    const r = RB * 0.97;
    const s = 0.05 + rand() * 0.03;
    rock([Math.cos(a) * r, G + s * 0.25, Math.sin(a) * r], s * 1.3, s * 0.8, s, rockLP);
  }
  T = new THREE.Matrix4().makeTranslation(0, G, 0).multiply(new THREE.Matrix4().makeScale(K, K, K));

  // pebbles and dust scatter
  setGroup("pebbles");
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (RB - 0.12);
    const s = 0.012 + rand() * 0.018;
    rock([Math.cos(a) * r, s * 0.2, Math.sin(a) * r], s * 1.4, s * 0.7, s, rand() > 0.5 ? rockP : rockDP);
  }
  // stepping stones door -> fire
  for (const [x, z, s] of [
    [-0.42, 0.3, 0.1],
    [-0.28, 0.4, 0.09],
    [-0.12, 0.47, 0.085],
    [0.03, 0.53, 0.08],
  ] as [number, number, number][]) {
    rock([x, 0.005, z], s * 1.3, s * 0.18, s, rockLP);
  }

  // ------------------------------------------------------------------------------------------------------------
  // 2. Palisade at the back
  setGroup("palisade");
  {
    const N = 27;
    const R = 1.52;
    const stakes: { at: V; top: V; inner: V; h: number }[] = [];
    for (let k = 0; k < N; k++) {
      const th = (102 + (k / (N - 1)) * 158) * DEG;
      const r = R + (rand() - 0.5) * 0.05;
      const h = 0.5 + rand() * 0.34 + (k % 5 === 2 ? 0.1 : 0);
      const rad = 0.068 + rand() * 0.016;
      const x = Math.sin(th) * r;
      const z = Math.cos(th) * r;
      const lean: V = [(rand() - 0.5) * 6, 0, (rand() - 0.5) * 6];
      const paintK = palisadeSet[k % 3];
      area([x, -0.03, z], [lean[0], th / DEG + 90, lean[2]], () => {
        cyl(rad * 0.94, rad, h, 7, paintK, [0, h / 2, 0]);
        cone(rad * 0.94, 0.17, 7, palisadeSet[(k + 1) % 3], [0, h + 0.085, 0]);
        // charred tip band
        cyl(rad * 0.97, rad * 0.97, 0.03, 7, C.wK, [0, h - 0.015, 0]);
        if (k % 3 === 1) cyl(rad * 1.12, rad * 1.12, 0.04, 7, ropeP, [0, h * 0.62, 0]);
      });
      stakes.push({ at: [x, 0, z], top: [x, h, z], inner: [Math.sin(th) * (r - 0.1), 0, Math.cos(th) * (r - 0.1)], h });
    }
    for (let k = 0; k < N - 1; k++) {
      for (const y of [0.14, 0.36]) {
        const a = stakes[k].inner;
        const c = stakes[k + 1].inner;
        tube([a[0], y, a[2]], [c[0], y + 0.015, c[2]], 0.026, 0.026, woodC, 5);
      }
    }
    for (const k of [3, 9, 15, 21]) {
      const s = stakes[k];
      area([s.at[0], s.h + 0.17, s.at[2]], Math.atan2(s.at[0], s.at[2]) / DEG, () => skull([0, 0, 0], 0.17, 0, k % 2 ? "orc" : "small"), 1);
    }
    // pennants on a few stakes
    for (const k of [6, 13, 19]) {
      const s = stakes[k];
      const th = Math.atan2(s.at[0], s.at[2]) / DEG;
      area([s.at[0], s.h - 0.2, s.at[2]], th, () => {
        poly([[0, 0], [0.2, -0.05], [0.14, -0.1], [0.2, -0.16], [0, -0.16]], 0.012, k === 13 ? C.black : C.red, [-0.0, 0, 0.1], [0, 90, 0]);
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // 3. Hut
  const HW = 0.57;
  const HD = 0.45;
  const WH = 0.78;
  const RH = 1.34;
  const OV = 0.14;
  const hutYaw = 12;
  const hutAt: V = [-0.55, 0, -0.5];
  const doorTop: V = [0, 0.7, HD + 0.075];
  let doorHinge!: Joint;
  area(hutAt, hutYaw, () => {
    doorHinge = b.joint("doorFlap", {
      parent: root,
      at: W(...doorTop),
      dir: [0, -1, 0],
      up: Dv(0, 0, 1),
      role: "hinge",
    });
    setGroup("hut.frame");
    // stone footing
    for (let i = 0; i < 40; i++) {
      const u = i / 40;
      const per = 2 * (2 * HW + 2 * HD);
      let d = u * per;
      let x: number;
      let z: number;
      if (d < 2 * HW) { x = -HW + d; z = HD; }
      else if ((d -= 2 * HW) < 2 * HD) { x = HW; z = HD - d; }
      else if ((d -= 2 * HD) < 2 * HW) { x = HW - d; z = -HD; }
      else { d -= 2 * HW; x = -HW; z = -HD + d; }
      if (z > HD - 0.01 && Math.abs(x) < 0.3) continue;
      const s = 0.07 + rand() * 0.035;
      rock([x * 1.02 + (rand() - 0.5) * 0.02, s * 0.4, z * 1.02 + (rand() - 0.5) * 0.02], s * 1.5, s * 0.85, s * 1.2, rand() > 0.5 ? rockP : rockLP);
    }
    // corner posts
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        tube([sx * (HW + 0.005), 0, sz * (HD + 0.005)], [sx * (HW + 0.005), 1.0, sz * (HD + 0.005)], 0.062, 0.055, woodB, 7);
        cone(0.058, 0.13, 7, boneP, [sx * (HW + 0.005), 1.06, sz * (HD + 0.005)]);
        cyl(0.07, 0.07, 0.04, 7, ropeP, [sx * (HW + 0.005), 0.5, sz * (HD + 0.005)]);
        cyl(0.07, 0.07, 0.04, 7, ropeP, [sx * (HW + 0.005), 0.86, sz * (HD + 0.005)]);
      }
    // planks
    const planks = (name: string, axis: "x" | "z", len: number, pos: number, skip?: (u: number) => boolean) => {
      setGroup(name);
      const n = Math.round(len / 0.1);
      const w = len / n;
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + (i + 0.5) * w;
        if (skip?.(u)) continue;
        const h = WH - 0.08 + (rand() - 0.5) * 0.06;
        const pk = plankSet[Math.floor(rand() * plankSet.length)];
        const jit = (rand() - 0.5) * 0.012;
        if (axis === "x") box(w * 0.94, h, 0.06, pk, [u, 0.08 + h / 2, pos + jit], [0, 0, (rand() - 0.5) * 2]);
        else box(0.06, h, w * 0.94, pk, [pos + jit, 0.08 + h / 2, u], [0, 0, (rand() - 0.5) * 2]);
      }
    };
    planks("hut.front", "x", 2 * HW - 0.1, HD, (u) => Math.abs(u) < 0.25);
    planks("hut.back", "x", 2 * HW - 0.1, -HD);
    planks("hut.left", "z", 2 * HD - 0.1, HW);
    planks("hut.right", "z", 2 * HD - 0.1, -HW);
    // bands + studs
    setGroup("hut.trim");
    for (const y of [0.24, 0.56]) {
      for (const sz of [1, -1]) {
        for (const [x0, x1] of sz > 0 ? [[-HW, -0.25], [0.25, HW]] : [[-HW, HW]])
          box(x1 - x0, 0.026, 0.016, ropeP, [(x0 + x1) / 2, y, sz * (HD + 0.036)]);
      }
      for (const sx of [1, -1]) box(0.016, 0.026, 2 * HD, ropeP, [sx * (HW + 0.036), y, 0]);
    }
    for (const y of [0.24, 0.56])
      for (let i = 0; i < 9; i++) {
        const x = -HW + 0.08 + i * 0.125;
        if (Math.abs(x) < 0.3) continue;
        ball(0.016, ironLP, [x, y, HD + 0.046], 1, undefined, 0);
        ball(0.016, ironLP, [x, y, -HD - 0.046], 1, undefined, 0);
      }
    // door frame
    setGroup("hut.door");
    for (const sx of [1, -1]) {
      tube([sx * 0.255, 0, HD + 0.02], [sx * 0.255, 0.74, HD + 0.02], 0.04, 0.04, woodB, 6);
      box(0.03, 0.62, 0.06, woodC, [sx * 0.235, 0.35, HD - 0.02]);
      for (let i = 0; i < 4; i++) ball(0.014, ironLP, [sx * 0.255, 0.12 + i * 0.17, HD + 0.06], 1, undefined, 0);
    }
    box(0.62, 0.075, 0.09, woodB, [0, 0.755, HD + 0.02]);
    box(0.64, 0.025, 0.1, ironP, [0, 0.8, HD + 0.02]);
    box(0.5, 0.66, 0.05, C.black, [0, 0.36, HD - 0.1]); // dark interior
    box(0.44, 0.012, 0.3, redP, [0, 0.005, HD - 0.02]); // rug
    // flap on the hinge
    setGroup("hut.flap", doorHinge);
    box(0.52, 0.62, 0.028, hideP, [0, 0.7 - 0.33, HD + 0.085]);
    box(0.52, 0.035, 0.034, hideDP, [0, 0.7 - 0.02, HD + 0.088]);
    for (const dx of [-0.2, -0.07, 0.07, 0.2]) {
      cyl(0.012, 0.012, 0.05, 5, boneP, [dx, 0.7 - 0.04, HD + 0.115], [90, 0, 0]);
    }
    tube([-0.22, 0.7 - 0.17, HD + 0.102], [0.22, 0.7 - 0.17, HD + 0.102], 0.008, 0.008, ropeP, 4);
    tube([-0.22, 0.7 - 0.42, HD + 0.102], [0.22, 0.7 - 0.42, HD + 0.102], 0.008, 0.008, ropeP, 4);
    for (let i = 0; i < 6; i++) {
      const x = -0.2 + i * 0.08;
      tube([x, 0.7 - 0.17, HD + 0.102], [x + 0.04, 0.7 - 0.42, HD + 0.102], 0.006, 0.006, ropeP, 4);
    }
    poly(
      [[-0.02, 0], [0.02, 0], [0.03, -0.1], [0, -0.14], [-0.03, -0.1]],
      0.01,
      C.red,
      [0.14, 0.7 - 0.47, HD + 0.1],
    );
    decal(hideSign, 0.2, 0.24, [0, 0.7 - 0.31, HD + 0.103]);
    ring3(0, 0.7 - 0.55, HD + 0.112);

    function ring3(x: number, y: number, z: number) {
      put(new THREE.TorusGeometry(0.03, 0.007, 4, 8), ironLP, [x, y, z]);
    }

    // steps
    setGroup("hut.steps");
    box(0.56, 0.05, 0.2, rockLP, [0, 0.0, HD + 0.16]);
    box(0.44, 0.045, 0.14, rockP, [0, 0.0, HD + 0.3]);
    for (const sx of [1, -1]) rock([sx * 0.3, 0.02, HD + 0.24], 0.07, 0.045, 0.06, rockP);

    // gable infill planks
    setGroup("hut.gable");
    const roofY = (x: number) => RH - 0.04 - ((RH - WH) / (HW + OV)) * 0.95 * Math.abs(x) - 0.02;
    for (const sz of [1, -1]) {
      const n = 11;
      for (let i = 0; i < n; i++) {
        const x = -HW + 0.055 + i * ((2 * HW - 0.11) / (n - 1));
        const top = roofY(x);
        const h = top - WH + 0.04;
        if (h < 0.05) continue;
        box(0.108, h, 0.055, plankSet[i % 5], [x, WH - 0.04 + h / 2, sz * (HD + 0.0)], [0, 0, (rand() - 0.5) * 2]);
      }
      box(2 * HW + 0.1, 0.05, 0.08, woodC, [0, WH - 0.04, sz * (HD + 0.03)]);
    }

    // roof
    setGroup("hut.roof");
    const dy = RH - WH + 0.02;
    const dx = HW + OV;
    const slopeLen = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx) / DEG;
    const nz = 3;
    const rd = 2 * (HD + OV);
    for (const s2 of [1, -1]) {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < nz; c++) {
          const u = (r + 0.5) / 2;
          const along = (r + 0.5) * (slopeLen / 2);
          const px = s2 * dx * (1 - u);
          const py = WH - 0.02 + dy * u;
          const off = r === 1 ? 0.012 : 0;
          const nx = Math.sin(ang * DEG) * s2;
          const ny = Math.cos(ang * DEG);
          const pk = [roofA, roofB, roofC][(r * 2 + c + (s2 > 0 ? 0 : 1)) % 3];
          void along;
          box(slopeLen / 2 + 0.03, 0.05, rd / nz + 0.02, pk, [px + nx * (0.03 + off), py + ny * (0.03 + off), -rd / 2 + (c + 0.5) * (rd / nz)], [0, 0, -s2 * ang]);
        }
      }
      // stitched seams
      for (let c = 1; c < nz; c++) {
        const z = -rd / 2 + c * (rd / nz);
        tube([s2 * dx, WH - 0.02 + 0.07, z], [0, RH + 0.07, z], 0.008, 0.008, ropeP, 4);
        const nSt = 10;
        for (let i = 0; i < nSt; i++) {
          const u = (i + 0.5) / nSt;
          const px2 = s2 * dx * (1 - u);
          const py2 = WH - 0.02 + dy * u + 0.075;
          box(0.012, 0.012, 0.05, ropeP, [px2, py2, z], [0, 0, -s2 * ang]);
        }
      }
      // eave fascia
      box(0.05, 0.05, rd + 0.04, woodC, [s2 * (dx + 0.01), WH - 0.03, 0], [0, 0, -s2 * ang]);
      for (let i = 0; i < 13; i++) {
        const z = -rd / 2 + (i + 0.5) * (rd / 13);
        cone(0.03, 0.1, 4, i % 2 ? furP : hideDP, [s2 * (dx + 0.03), WH - 0.1, z], [180, 0, 0]);
      }
      // purlin ends poking out front/back
      for (const u of [0.22, 0.52, 0.82]) {
        const px = s2 * dx * (1 - u);
        const py = WH - 0.02 + dy * u - 0.01;
        tube([px, py, -HD - OV - 0.09], [px, py, HD + OV + 0.1], 0.026, 0.026, woodB, 6);
        cyl(0.02, 0.02, 0.012, 6, C.wL, [px, py, HD + OV + 0.105], [90, 0, 0]);
      }
    }
    // ridge
    tube([0, RH + 0.04, -HD - OV - 0.1], [0, RH + 0.04, HD + OV + 0.12], 0.05, 0.05, woodB, 7);
    box(0.16, 0.04, rd + 0.1, furP, [0, RH + 0.03, 0]);
    for (let i = 0; i < 7; i++) cone(0.026, 0.12, 5, boneP, [0, RH + 0.12, -HD - OV + 0.1 + i * 0.17]);
    // tusk horns at the ridge front
    for (const s2 of [1, -1]) {
      sw(
        [
          [s2 * 0.03, RH + 0.04, HD + OV + 0.04],
          [s2 * 0.15, RH + 0.06, HD + OV + 0.17],
          [s2 * 0.27, RH + 0.22, HD + OV + 0.2],
          [s2 * 0.3, RH + 0.45, HD + OV + 0.14],
        ],
        [0.05, 0.005],
        boneP,
        { sides: 6, caps: "point" },
      );
      cyl(0.06, 0.06, 0.04, 7, ironP, [s2 * 0.06, RH + 0.045, HD + OV + 0.07], [90, s2 * 20, 0]);
      // back horns, shorter
      sw(
        [
          [s2 * 0.03, RH + 0.04, -HD - OV - 0.04],
          [s2 * 0.12, RH + 0.08, -HD - OV - 0.14],
          [s2 * 0.2, RH + 0.26, -HD - OV - 0.14],
        ],
        [0.04, 0.005],
        boneP,
        { sides: 6, caps: "point" },
      );
    }
    // skull + crossed bones over the door
    setGroup("hut.skull");
    crossedBones([0, 0.98, HD + 0.06], 0, 0.13);
    skull([0, 0.88, HD + 0.075], 0.21, 0, "horned");
    skull([0, 1.08, -HD - 0.075], 0.15, 180, "small");
    decal(hideSign, 0.2, 0.24, [0, 0.9, -HD - 0.05], [0, 180, 0]);
    // iron plate with studs on the gable
    setGroup("hut.trim");
    for (const sx of [1, -1]) {
      poly([[0, 0], [0.1, 0.05], [0.1, 0.16], [0, 0.2], [-0.02, 0.1]], 0.014, ironP, [sx * 0.34, 0.82, HD + 0.04], [0, sx > 0 ? 0 : 180, 0], 0.004);
    }
    // pelt on the front wall (left of the door)
    setGroup("hut.pelt");
    const pelt: [number, number][] = [
      [-0.04, 0], [0.05, 0.02], [0.1, -0.05], [0.12, -0.18], [0.09, -0.3], [0.1, -0.4], [0.05, -0.38], [0.04, -0.26],
      [0, -0.3], [-0.05, -0.26], [-0.06, -0.4], [-0.11, -0.4], [-0.1, -0.3], [-0.12, -0.18], [-0.1, -0.05],
    ];
    poly(pelt, 0.012, furP, [-0.4, 0.72, HD + 0.06], [0, 0, 0], 0.003);
    poly(pelt, 0.012, hideDP, [HW + 0.05, 0.72, -0.22], [0, 90, 0], 0.003);
    poly(pelt, 0.012, furP, [-HW - 0.05, 0.72, 0.22], [0, -90, 0], 0.003);
    for (const [px, pz, ry] of [[HW + 0.05, -0.22, 90], [-HW - 0.05, 0.22, -90]] as [number, number, number][])
      tube([px, 0.74, pz - 0.1 * Math.sign(ry)], [px, 0.74, pz + 0.1 * Math.sign(ry)], 0.012, 0.012, woodC, 5);
    tube([-0.5, 0.74, HD + 0.062], [-0.3, 0.74, HD + 0.062], 0.012, 0.012, woodC, 5);
    // window slits (lit)
    setGroup("hut.windows");
    for (const [wx, wy, wz, ry] of [
      [HW + 0.03, 0.5, 0.05, 90],
      [-HW - 0.03, 0.5, -0.1, -90],
      [0.4, 0.5, HD + 0.03, 0],
    ] as [number, number, number, number][]) {
      area([wx, wy, wz], ry, () => {
        box(0.2, 0.26, 0.03, C.ironD, [0, 0, 0]);
        box(0.15, 0.2, 0.02, C.amber, [0, 0, 0.012], [0, 0, 0], { glow: 1.2 });
        for (const bx of [-0.05, 0.0, 0.05]) box(0.014, 0.2, 0.026, C.ironD, [bx, 0, 0.02]);
        box(0.2, 0.014, 0.026, C.ironD, [0, 0, 0.02]);
        box(0.24, 0.025, 0.05, woodC, [0, 0.14, 0.01]);
        cone(0.02, 0.08, 4, boneP, [0.1, 0.2, 0.02]);
        cone(0.02, 0.08, 4, boneP, [-0.1, 0.2, 0.02]);
      });
    }
    // hanging trophies under the front eave
    setGroup("hut.trophies");
    for (const sx of [1, -1]) {
      const x0 = sx * 0.62;
      tube([x0, WH - 0.05, HD + OV - 0.04], [x0, 0.5, HD + OV - 0.04], 0.006, 0.006, ropeP, 4);
      skull([x0, 0.43, HD + OV - 0.04], 0.07, sx * 20, "small");
      for (let i = 0; i < 3; i++) tube([x0, 0.66 - i * 0.05, HD + OV - 0.04], [x0 + 0.045 * (i % 2 ? 1 : -1), 0.63 - i * 0.05, HD + OV - 0.04], 0.01, 0.007, boneP, 4);
    }
  });
  // door opens a little (pose after the flap is built)
  b.pose(doorHinge, { axis: [1, 0, 0], deg: -22 });

  // torches by the hut steps
  torch(-0.98, 0.2, 0.92);
  torch(1.35, 0.3, 0.82);

  // ------------------------------------------------------------------------------------------------------------
  // 4. Big tusk totem
  area([1.15, 0, -0.5], -24, () => {
    setGroup("totem");
    // stone footing
    box(0.56, 0.1, 0.56, rockDP, [0, 0.05, 0], [0, 8, 0]);
    box(0.44, 0.09, 0.44, rockP, [0, 0.14, 0], [0, -6, 0]);
    for (const [x, z, s] of [[0.28, 0.2, 0.1], [-0.27, 0.22, 0.09], [0.1, -0.3, 0.11], [-0.24, -0.2, 0.08]] as [number, number, number][])
      rock([x, s * 0.35, z], s * 1.2, s, s, rockLP);
    const y0 = 0.18;
    tube([0, y0, 0], [0, 2.12, 0], 0.12, 0.11, woodA, 8);
    // --- boar block
    const blk = (y: number, h: number, w: number, color: Col) => {
      box(w, h, w * 0.92, color, [0, y + h / 2, 0]);
      box(w + 0.03, 0.035, w * 0.92 + 0.03, woodC, [0, y + 0.0, 0]);
      box(w + 0.03, 0.035, w * 0.92 + 0.03, woodC, [0, y + h, 0]);
    };
    blk(y0, 0.46, 0.36, hp(mottle("#8a3a26", "#5e2418", { size: 0.06, seed: 31 })));
    box(0.2, 0.16, 0.16, hp(mottle("#d79a78", "#b87a5a", { size: 0.05, seed: 32 })), [0, y0 + 0.15, 0.24]);
    decal(boarFace, 0.32, 0.32, [0, y0 + 0.27, 0.173]);
    for (const s2 of [1, -1]) {
      sw(
        [
          [s2 * 0.07, y0 + 0.1, 0.3],
          [s2 * 0.16, y0 + 0.08, 0.34],
          [s2 * 0.24, y0 + 0.2, 0.32],
          [s2 * 0.26, y0 + 0.36, 0.26],
        ],
        [0.032, 0.004],
        boneP,
        { sides: 5, caps: "point" },
      );
      cone(0.07, 0.15, 4, redP, [s2 * 0.19, y0 + 0.5, 0.0], [0, 0, -s2 * 20]); // ears
      ball(0.026, C.amber, [s2 * 0.1, y0 + 0.31, 0.19], 1, { glow: 1.6 }, 0);
    }
    // --- orc face block
    const y1 = y0 + 0.5;
    blk(y1, 0.5, 0.38, greenP);
    decal(orcFace, 0.34, 0.34, [0, y1 + 0.2, 0.178]);
    box(0.4, 0.07, 0.1, greenP, [0, y1 + 0.34, 0.16], [-10, 0, 0]);
    for (const s2 of [1, -1]) {
      ball(0.03, C.amber, [s2 * 0.09, y1 + 0.27, 0.2], [1.3, 0.7, 0.8], { glow: 1.8 }, 0);
      tube([s2 * 0.19, y1 + 0.23, 0.02], [s2 * 0.3, y1 + 0.2, 0.0], 0.04, 0.03, greenP, 5); // ears
      cone(0.05, 0.12, 4, greenP, [s2 * 0.33, y1 + 0.2, -0.01], [0, 0, -s2 * 90]);
      for (let i = 0; i < 3; i++) ball(0.016, C.gold, [s2 * 0.3, y1 + 0.13 - i * 0.03, 0.03], 1, undefined, 0);
    }
    // feather headdress behind/above the orc face
    const feather = (len: number, w: number): [number, number][] => [
      [0, 0], [w * 0.8, len * 0.2], [w, len * 0.55], [w * 0.55, len * 0.9], [0, len], [-w * 0.55, len * 0.9], [-w, len * 0.55], [-w * 0.8, len * 0.2],
    ];
    for (let k = 0; k < 9; k++) {
      const a = -70 + k * 17.5;
      const col = [C.red, C.white, C.black, C.red, C.white][k % 5];
      area([0, y1 + 0.5, -0.04], [0, 0, a], () => poly(feather(0.3 - Math.abs(a) * 0.0012, 0.04), 0.008, col, [0, 0.0, 0.0 + (k % 2) * 0.012], undefined, 0.002));
    }
    // --- wings block
    const y2 = y1 + 0.54;
    blk(y2, 0.3, 0.3, hp(mottle("#2e2528", "#1a1618", { size: 0.05, seed: 33 })));
    for (const s2 of [1, -1]) {
      const rows: [number, number, number, Col][] = [
        [0.16, 0.05, 5, C.red],
        [0.27, 0.055, 5, C.white],
        [0.4, 0.06, 5, C.black],
        [0.52, 0.06, 5, C.red],
      ];
      rows.forEach(([len, w, n, col], ri) => {
        for (let k = 0; k < n; k++) {
          const phi = (-6 - k * (68 / (n - 1)) - ri * 2) * DEG;
          const psi = Math.atan2(Math.sin(phi), s2 * Math.cos(phi));
          area([s2 * 0.12, y2 + 0.22 - ri * 0.003, 0.055 + ri * 0.011], [0, 0, psi / DEG - 90], () =>
            poly(feather(len, w), 0.008, ri % 2 ? col : col, [0, 0, 0], undefined, 0.002),
          );
        }
      });
      // wing bone arm
      tube([s2 * 0.1, y2 + 0.24, 0.04], [s2 * 0.5, y2 + 0.25, 0.04], 0.026, 0.02, woodC, 5);
      ball(0.03, boneP, [s2 * 0.52, y2 + 0.25, 0.04], 1, undefined, 0);
    }
    // --- raven head block
    const y3 = y2 + 0.34;
    blk(y3, 0.34, 0.3, blackP);
    decal(ravenEye, 0.3, 0.2, [0, y3 + 0.22, 0.14]);
    sw(
      [
        [0, y3 + 0.2, 0.14],
        [0, y3 + 0.2, 0.3],
        [0, y3 + 0.14, 0.4],
        [0, y3 + 0.05, 0.42],
      ],
      [0.075, 0.008],
      hp(mottle("#e0b348", "#b88a2c", { size: 0.04, seed: 34 })),
      { sides: 5, caps: "point" },
    );
    for (const s2 of [1, -1]) {
      ball(0.025, C.amber, [s2 * 0.09, y3 + 0.24, 0.17], 1, { glow: 1.8 }, 0);
      sw([[s2 * 0.1, y3 + 0.34, 0], [s2 * 0.22, y3 + 0.52, -0.03], [s2 * 0.32, y3 + 0.66, 0.02]], [0.04, 0.006], boneP, { sides: 5, caps: "point" });
    }
    cone(0.05, 0.4, 5, ironLP, [0, y3 + 0.54, 0]);
    cyl(0.07, 0.07, 0.03, 6, ropeP, [0, y3 + 0.36, 0]);
    // rope + spiked bands between blocks
    for (const y of [y0 + 0.48, y1 + 0.52, y2 + 0.32]) {
      cyl(0.145, 0.145, 0.04, 8, ropeP, [0, y, 0]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        cone(0.022, 0.1, 4, ironP, [Math.sin(a) * 0.19, y + 0.005, Math.cos(a) * 0.19], [Math.cos(a) * 90, 0, -Math.sin(a) * 90]);
      }
    }
    // hanging skulls/bones on chains from wings
    for (const s2 of [1, -1]) {
      tube([s2 * 0.38, y2 + 0.24, 0.07], [s2 * 0.38, y2 - 0.02, 0.07], 0.007, 0.007, C.ironD, 4);
      skull([s2 * 0.38, y2 - 0.1, 0.08], 0.1, s2 * 15, "small");
    }
    // war-paint banner strip hanging from the front
    setGroup("totem.cloth");
    poly([[0, 0], [0.18, 0], [0.18, -0.34], [0.09, -0.26], [0, -0.34]], 0.01, redP, [-0.09, y0 + 0.86, 0.2], undefined, 0.002);
  }, 0.85);

  // ------------------------------------------------------------------------------------------------------------
  // 5. Skull totem
  area([-1.05, 0, 1.0], 22, () => {
    setGroup("skullTotem");
    for (const [x, z, s] of [[0.12, 0.1, 0.1], [-0.12, 0.08, 0.09], [0.0, -0.14, 0.1], [-0.1, -0.1, 0.07], [0.15, -0.08, 0.07]] as [number, number, number][])
      rock([x, s * 0.4, z], s * 1.3, s, s * 1.1, rand() > 0.5 ? rockP : rockLP);
    tube([0, 0, 0], [0, 1.08, 0], 0.052, 0.042, woodC, 6);
    for (const s2 of [1, -1]) {
      tube([s2 * 0.2, 0.0, -0.05], [s2 * 0.02, 0.32, 0], 0.025, 0.02, woodA, 5);
    }
    cyl(0.06, 0.06, 0.05, 6, ropeP, [0, 0.32, 0]);
    // stacked skulls
    skull([0, 0.36, 0.0], 0.15, 0, "orc", -4);
    skull([0, 0.6, 0.0], 0.13, 8, "orc", -4);
    skull([0, 0.92, 0.0], 0.2, 0, "horned", -4);
    cyl(0.06, 0.06, 0.04, 6, ropeP, [0, 0.85, 0]);
    // cross bar with chimes
    tube([-0.3, 0.74, 0], [0.3, 0.74, 0], 0.02, 0.02, woodA, 5);
    for (const s2 of [1, -1]) {
      ball(0.028, boneP, [s2 * 0.31, 0.74, 0], 1, undefined, 0);
      for (let i = 0; i < 3; i++) {
        const x = s2 * (0.12 + i * 0.09);
        const len = 0.14 + ((i * 7) % 3) * 0.04;
        tube([x, 0.73, 0.02], [x, 0.73 - len, 0.02], 0.004, 0.004, ropeP, 4);
        tube([x, 0.73 - len, 0.02], [x + 0.005, 0.73 - len - 0.09, 0.02], 0.014, 0.01, boneP, 5);
      }
      poly([[0, 0], [0.025, -0.04], [0.03, -0.14], [0, -0.22], [-0.03, -0.14], [-0.025, -0.04]], 0.006, s2 > 0 ? C.red : C.black, [s2 * 0.26, 0.74, 0.03], undefined, 0);
    }
    // feathers at top
    for (const s2 of [1, -1])
      poly([[0, 0], [0.02, 0.08], [0.025, 0.22], [0, 0.32], [-0.025, 0.22], [-0.02, 0.08]], 0.006, s2 > 0 ? C.red : C.white, [s2 * 0.08, 1.12, -0.05], [0, 0, -s2 * 22]);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 6. Clan banners (cloth hangs on hinge joints)
  const banner = (
    name: string,
    at: V,
    yaw: number,
    H: number,
    texture: THREE.Texture,
    w: number,
    h: number,
    barLen: number,
    phase: number,
  ) => {
    const hinge = b.joint(name, { parent: root, at: W(at[0], at[1] + H - 0.12, at[2]), dir: [0, -1, 0], up: [0, 0, 1], role: "hinge" });
    area(at, yaw, () => {
      setGroup(name + "Pole");
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + rand();
        const s = 0.07 + rand() * 0.04;
        rock([Math.cos(a) * 0.1, s * 0.4, Math.sin(a) * 0.1], s * 1.3, s * 1.1, s, rand() > 0.5 ? rockP : rockLP);
      }
      tube([0, 0, 0], [0, H, 0], 0.036, 0.03, woodA, 7);
      cyl(0.045, 0.045, 0.05, 7, ropeP, [0, 0.22, 0]);
      cyl(0.042, 0.042, 0.05, 7, ropeP, [0, H - 0.5, 0]);
      // spearhead
      cyl(0.045, 0.045, 0.08, 7, ironP, [0, H + 0.02, 0]);
      poly([[0, 0], [0.055, 0.06], [0.04, 0.2], [0, 0.3], [-0.04, 0.2], [-0.055, 0.06]], 0.016, ironLP, [0, H + 0.04, 0], undefined, 0.003);
      for (const s2 of [1, -1]) {
        sw([[s2 * 0.03, H - 0.03, 0], [s2 * 0.12, H - 0.04, 0.02], [s2 * 0.2, H + 0.06, 0.02], [s2 * 0.2, H + 0.18, 0.0]], [0.022, 0.004], boneP, { sides: 5, caps: "point" });
      }
      // crossbar
      const by = H - 0.12;
      tube([-barLen / 2, by, 0], [barLen / 2, by, 0], 0.022, 0.022, woodB, 6);
      for (const s2 of [1, -1]) {
        cone(0.03, 0.12, 5, ironP, [s2 * (barLen / 2 + 0.05), by, 0], [0, 0, -s2 * 90]);
        cyl(0.034, 0.034, 0.03, 6, ropeP, [s2 * (barLen / 2 - 0.03), by, 0], [0, 0, 90]);
        // hanging bone tassels
        tube([s2 * (barLen / 2 - 0.03), by, 0.0], [s2 * (barLen / 2 - 0.03), by - 0.12, 0.0], 0.004, 0.004, ropeP, 4);
        skull([s2 * (barLen / 2 - 0.03), by - 0.15, 0.0], 0.05, 0, "small");
      }
      cyl(0.04, 0.04, 0.05, 7, ropeP, [0, by, 0]);
      // loops tying cloth to the bar
      for (let i = 0; i < 5; i++) {
        const x = (i / 4 - 0.5) * (w - 0.05);
        cyl(0.012, 0.012, 0.04, 5, ropeP, [x, by - 0.02, 0.0]);
      }
      // the cloth, front and back, on the hinge
      setGroup(name + "Cloth", hinge);
      const g = cloth(w, h, 0.05, phase);
      tex(g.clone(), texture, mat([0, by - h / 2 - 0.01, 0.004]), 0, name + ".front");
      tex(backFace(g, -0.008), texture, mat([0, by - h / 2 - 0.01, 0]), 0, name + ".back");
    });
    return hinge;
  };
  const bannerA = banner("bannerA", [-1.35, 0, 0.35], 25, 1.72, bannerRed, 0.42, 0.84, 0.56, 0.4);
  const bannerB = banner("bannerB", [0.14, 0, 0.15], -12, 1.42, bannerDark, 0.34, 0.74, 0.46, 1.6);

  // ------------------------------------------------------------------------------------------------------------
  // 7. Campfire with cauldron
  area([FIRE[0], 0, FIRE[2]], 0, () => {
    setGroup("fire");
    // ash bed + stone ring
    cyl(0.33, 0.35, 0.02, 10, C.ash, [0, 0.01, 0]);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.2;
      const s = 0.085 + rand() * 0.03;
      rock([Math.cos(a) * 0.36, s * 0.45, Math.sin(a) * 0.36], s * 1.3, s * 0.95, s * 1.1, rand() > 0.4 ? rockP : rockDP);
    }
    // logs: teepee of charred sticks and two crossed logs
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      tube([Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3], [Math.cos(a) * 0.05, 0.28 + (i % 3) * 0.04, Math.sin(a) * 0.05], 0.04, 0.03, woodC, 6);
    }
    tube([-0.27, 0.05, 0.1], [0.27, 0.07, -0.08], 0.05, 0.05, woodX, 7);
    tube([0.1, 0.05, 0.27], [-0.08, 0.07, -0.27], 0.045, 0.045, woodZ, 7);
    // embers on the bed
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.25;
      ball(0.018 + rand() * 0.012, i % 2 ? C.fire3 : C.fire4, [Math.cos(a) * r, 0.04, Math.sin(a) * r], [1.3, 0.6, 1], { glow: 1.2 }, 0);
    }
    // flames: tongues licking up round the pot
    const tongue = (a: number, r: number, h: number, w: number, color: string, g: number, lean: number) => {
      const p0: V = [Math.cos(a) * r, 0.06, Math.sin(a) * r];
      const p1: V = [Math.cos(a) * (r + lean * 0.4), 0.06 + h * 0.5, Math.sin(a) * (r + lean * 0.4)];
      const p2: V = [Math.cos(a + 0.2) * (r + lean), 0.06 + h, Math.sin(a + 0.2) * (r + lean)];
      sw([p0, p1, p2], [w, 0.003], color, { sides: 5, caps: "point", glow: g });
    };
    for (let i = 0; i < 8; i++) tongue((i / 8) * Math.PI * 2 + 0.1, 0.2, 0.34 + (i % 3) * 0.08, 0.06, C.fire3, 1.3, 0.03);
    for (let i = 0; i < 7; i++) tongue((i / 7) * Math.PI * 2 + 0.5, 0.17, 0.3 + (i % 2) * 0.1, 0.05, C.fire2, 1.4, 0.02);
    for (let i = 0; i < 6; i++) tongue((i / 6) * Math.PI * 2 + 0.2, 0.13, 0.24 + (i % 2) * 0.06, 0.04, C.fire1, 1.5, 0.01);
    // sparks
    for (let i = 0; i < 8; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.1 + rand() * 0.25;
      put(new THREE.OctahedronGeometry(0.012 + rand() * 0.01, 0), C.fire1, [Math.cos(a) * r, 0.6 + rand() * 0.5, Math.sin(a) * r], [rand() * 90, rand() * 90, 0], 1, { glow: 1.6 });
    }
    // tripod
    setGroup("tripod");
    const apex: V = [0, 1.0, 0];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      tube([Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5], [Math.cos(a) * 0.04, apex[1] + 0.08, Math.sin(a) * 0.04], 0.034, 0.024, woodA, 6);
      cyl(0.036, 0.036, 0.04, 6, ropeP, [Math.cos(a) * 0.1, 0.9, Math.sin(a) * 0.1]);
    }
    cyl(0.06, 0.06, 0.07, 6, ropeP, [0, apex[1] + 0.05, 0]);
    // hook + chain
    for (let i = 0; i < 7; i++)
      put(new THREE.TorusGeometry(0.02, 0.0065, 4, 6), i % 2 ? ironP : ironLP, [0, apex[1] - 0.02 - i * 0.04, 0], [0, i % 2 ? 0 : 90, 0]);
    // cauldron
    setGroup("cauldron");
    const potY = 0.6;
    const potPts = [
      [0.0, -0.17], [0.1, -0.17], [0.2, -0.12], [0.255, -0.03], [0.255, 0.06], [0.22, 0.14], [0.2, 0.15], [0.19, 0.12], [0.0, 0.12],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    put(new THREE.LatheGeometry(potPts, 9), ironP, [0, potY, 0]);
    put(new THREE.TorusGeometry(0.215, 0.022, 4, 9), ironLP, [0, potY + 0.15, 0], [90, 0, 0]);
    cyl(0.195, 0.195, 0.012, 9, C.brew, [0, potY + 0.11, 0], undefined, { glow: 1.2 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(0.025, C.brew, [Math.cos(a) * 0.1 + 0.01, potY + 0.135, Math.sin(a) * 0.12], [1, 0.7, 1], { glow: 1.5 }, 0);
    }
    for (const yy of [-0.02, 0.07]) put(new THREE.TorusGeometry(0.256 - Math.abs(yy) * 0.02, 0.012, 4, 9), C.ironD, [0, potY + yy, 0], [90, 0, 0]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      tube([Math.cos(a) * 0.12, potY - 0.16, Math.sin(a) * 0.12], [Math.cos(a) * 0.15, potY - 0.22, Math.sin(a) * 0.15], 0.02, 0.016, ironP, 5);
    }
    // bail handle
    put(new THREE.TorusGeometry(0.2, 0.01, 4, 9, Math.PI), ironLP, [0, potY + 0.14, 0], [0, 0, 0]);
    // ladle leaning on the pot
    tube([0.28, 0.2, 0.18], [0.14, potY + 0.2, 0.0], 0.012, 0.012, woodB, 5);
    cyl(0.04, 0.03, 0.03, 7, ironP, [0.13, potY + 0.2, 0.0], [20, 0, 0]);
    // skewers with meat on stones
    setGroup("skewers");
    for (const [a, h] of [[0.6, 0.4], [1.0, 0.36]] as [number, number][]) {
      const x = Math.cos(a) * 0.56;
      const z = Math.sin(a) * 0.56 + 0.2;
      tube([x, 0, z], [x - 0.12, h, z - 0.1], 0.01, 0.007, woodB, 4);
      for (let k = 0; k < 3; k++) {
        const t = 0.35 + k * 0.2;
        ball(0.04 - k * 0.004, hp(mottle("#9a4a2e", "#6a2c1c", { size: 0.03, seed: 41 })), [x - 0.12 * t, h * t, z - 0.1 * t], [1, 0.85, 1], undefined, 0);
      }
    }
  });

  // log seats around the fire
  setGroup("seats");
  for (const [x, z, yaw, len] of [
    [1.0, 0.95, -35, 0.6],
    [0.5, 1.32, 10, 0.55],
  ] as [number, number, number, number][]) {
    area([x, 0, z], yaw, () => {
      tube([-len / 2, 0.09, 0], [len / 2, 0.09, 0], 0.09, 0.09, woodX, 7);
      cyl(0.08, 0.08, 0.012, 7, C.wL, [len / 2 + 0.005, 0.09, 0], [0, 0, 90]);
      cyl(0.08, 0.08, 0.012, 7, C.wL, [-len / 2 - 0.005, 0.09, 0], [0, 0, 90]);
      rock([len / 2 - 0.05, 0.02, 0.06], 0.05, 0.03, 0.05, rockP);
      rock([-len / 2 + 0.05, 0.02, -0.06], 0.05, 0.03, 0.05, rockP);
      // hide cushion
      box(0.22, 0.03, 0.14, hideLP, [0.08, 0.195, 0.0], [0, 8, 0]);
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // 8. War drum
  area([-0.1, 0, 1.32], 30, () => {
    setGroup("drum");
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.3;
      tube([Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], [Math.cos(a) * 0.14, 0.32, Math.sin(a) * 0.14], 0.026, 0.02, woodA, 5);
      cyl(0.03, 0.03, 0.04, 5, ropeP, [Math.cos(a) * 0.2, 0.17, Math.sin(a) * 0.2]);
    }
    area([0, 0.4, 0], [-20, 0, 0], () => {
      const body = [[0, -0.16], [0.17, -0.16], [0.2, -0.08], [0.215, 0], [0.2, 0.08], [0.17, 0.16], [0, 0.16]].map(([x, y]) => new THREE.Vector2(x, y));
      put(new THREE.LatheGeometry(body, 10), woodB, [0, 0, 0]);
      for (const y of [0.165, -0.165]) {
        cyl(0.2, 0.2, 0.014, 10, hideLP, [0, y + (y > 0 ? 0.005 : -0.005), 0]);
        cyl(0.205, 0.205, 0.03, 10, C.ironD, [0, y * 0.97, 0]);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          ball(0.013, ironLP, [Math.cos(a) * 0.208, y * 0.96 + (y > 0 ? 0.016 : -0.016), Math.sin(a) * 0.208], 1, undefined, 0);
        }
      }
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const a2 = a + Math.PI / 10;
        tube([Math.cos(a) * 0.19, 0.15, Math.sin(a) * 0.19], [Math.cos(a2) * 0.19, -0.15, Math.sin(a2) * 0.19], 0.006, 0.006, ropeP, 4);
        tube([Math.cos(a2) * 0.19, -0.15, Math.sin(a2) * 0.19], [Math.cos(a + Math.PI / 5) * 0.19, 0.15, Math.sin(a + Math.PI / 5) * 0.19], 0.006, 0.006, ropeP, 4);
      }
      // painted war bands around the belly
      cyl(0.218, 0.218, 0.05, 10, redP, [0, 0, 0]);
      cyl(0.222, 0.222, 0.012, 10, C.gold, [0, 0.032, 0]);
      cyl(0.222, 0.222, 0.012, 10, C.gold, [0, -0.032, 0]);
      decal(drumRune, 0.4, 0.4, [0, 0.185, 0], [-90, 0, 0]);
    });
    // mallets
    tube([0.28, 0.025, 0.18], [0.5, 0.025, 0.28], 0.014, 0.014, boneP, 5);
    ball(0.04, hideP, [0.5, 0.04, 0.28], 1, undefined, 0);
    tube([0.25, 0.025, 0.28], [0.44, 0.025, 0.4], 0.014, 0.014, boneP, 5);
    ball(0.04, hideP, [0.44, 0.04, 0.4], 1, undefined, 0);
  }, 0.9);

  // ------------------------------------------------------------------------------------------------------------
  // 9. Weapon rack with axes, maul, spears and a shield
  const axeHead = (big: number): [number, number][] => [
    [0, 0.035 * big],
    [0.06 * big, 0.11 * big],
    [0.15 * big, 0.15 * big],
    [0.17 * big, 0.0],
    [0.15 * big, -0.15 * big],
    [0.06 * big, -0.11 * big],
    [0, -0.035 * big],
  ];
  area([0.45, 0, -1.22], 0, () => {
    setGroup("rack");
    for (const s2 of [1, -1]) {
      tube([s2 * 0.3, 0, 0], [s2 * 0.3, 0.94, 0], 0.04, 0.036, woodA, 6);
      cone(0.042, 0.08, 6, woodC, [s2 * 0.3, 0.97, 0]);
      tube([s2 * 0.3, 0.0, -0.15], [s2 * 0.3, 0.0, 0.15], 0.04, 0.04, woodC, 6);
      cyl(0.052, 0.052, 0.04, 6, ropeP, [s2 * 0.3, 0.3, 0]);
    }
    for (const y of [0.34, 0.74]) {
      tube([-0.34, y, 0.0], [0.34, y, 0.0], 0.026, 0.026, woodB, 6);
      for (const s2 of [1, -1]) cyl(0.036, 0.036, 0.02, 6, ropeP, [s2 * 0.3, y, 0]);
    }
    // axes, hung on the top bar
    const axe = (x: number, z: number, lean: number, len: number, yaw: number) => {
      area([x, 0.12, z], [lean, yaw, 0], () => {
        tube([0, 0, 0], [0, len, 0], 0.016, 0.014, woodB, 5);
        cyl(0.02, 0.02, 0.05, 5, C.ironD, [0, len + 0.0, 0]);
        poly(axeHead(1.1), 0.02, ironLP, [0, len - 0.06, 0], [90, 0, 90], 0.004);
        tube([0, len - 0.06, 0.0], [0, len + 0.02, 0.0], 0.026, 0.026, ironP, 6);
        cone(0.014, 0.08, 4, ironLP, [0, len + 0.07, 0]);
        for (let k = 0; k < 4; k++) cyl(0.018, 0.018, 0.02, 5, ropeP, [0, 0.08 + k * 0.03, 0]);
      });
    };
    axe(-0.2, 0.07, -4, 0.68, 20);
    axe(-0.08, 0.07, -3, 0.62, -30);
    axe(0.06, 0.07, -4, 0.7, 10);
    // maul
    area([0.19, 0.12, 0.07], [-4, 0, 0], () => {
      tube([0, 0, 0], [0, 0.72, 0], 0.017, 0.016, woodB, 5);
      box(0.1, 0.1, 0.2, ironP, [0, 0.72, 0], [0, 0, 0]);
      box(0.12, 0.03, 0.22, C.ironD, [0, 0.78, 0]);
      box(0.12, 0.03, 0.22, C.ironD, [0, 0.66, 0]);
      cone(0.03, 0.08, 5, ironLP, [0, 0.82, 0]);
    });
    // spears leaning behind the rack
    for (const [x, lean] of [[-0.34, 8], [0.36, -8]] as [number, number][])
      area([x, 0, -0.09], [0, 0, lean], () => {
        tube([0, 0, 0], [0, 1.3, 0], 0.018, 0.015, woodA, 5);
        poly([[0, 0], [0.04, 0.06], [0.03, 0.16], [0, 0.26], [-0.03, 0.16], [-0.04, 0.06]], 0.014, ironLP, [0, 1.28, 0], undefined, 0.002);
        cyl(0.03, 0.03, 0.03, 5, redP, [0, 1.25, 0]);
        poly([[0, 0], [0.1, -0.03], [0.14, -0.1], [0.04, -0.12], [0, -0.1]], 0.006, C.red, [0, 1.22, 0.02], [0, 0, 0]);
      });
    // shield leaning on the rack
    area([-0.02, 0.0, 0.2], [-18, 0, 0], () => {
      cyl(0.17, 0.17, 0.035, 10, woodB, [0, 0.2, 0], [90, 0, 0]);
      cyl(0.185, 0.185, 0.02, 10, ironP, [0, 0.2, -0.0], [90, 0, 0]);
      decal(shieldEmblem, 0.31, 0.31, [0, 0.2, 0.0185]);
      put(new THREE.SphereGeometry(0.05, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), ironLP, [0, 0.2, 0.02], [90, 0, 0]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cone(0.014, 0.05, 4, ironLP, [Math.cos(a) * 0.13, 0.2 + Math.sin(a) * 0.13, 0.04], [90, 0, 0]);
      }
    });
  });

  // ------------------------------------------------------------------------------------------------------------
  // 10. Barrels, crates, sacks near the hut
  area([-0.65, 0, 0.98], -15, () => {
    setGroup("barrels");
    const barrel = (x: number, z: number, open: boolean) => {
      const staves = [[0, 0], [0.115, 0], [0.145, 0.07], [0.155, 0.15], [0.145, 0.23], [0.12, 0.3]].map(([r, y]) => new THREE.Vector2(r, y));
      put(new THREE.LatheGeometry(staves, 9), woodA, [x, 0, z]);
      if (open) {
        cyl(0.115, 0.115, 0.012, 9, C.brew, [x, 0.26, z], undefined, { glow: 1.1 });
        cyl(0.126, 0.126, 0.02, 9, woodC, [x, 0.3, z]);
        tube([x - 0.04, 0.2, z + 0.02], [x + 0.09, 0.46, z - 0.02], 0.012, 0.012, woodB, 5);
      } else {
        cyl(0.12, 0.12, 0.02, 9, woodLZ, [x, 0.305, z]);
        for (const d of [-0.05, 0.05]) box(0.004, 0.006, 0.22, C.wD, [x + d, 0.318, z]);
      }
      for (const [y, r] of [[0.05, 0.13], [0.13, 0.158], [0.23, 0.15]] as [number, number][]) cyl(r, r, 0.03, 9, ironP, [x, y, z]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ball(0.01, ironLP, [x + Math.cos(a) * 0.162, 0.13, z + Math.sin(a) * 0.162], 1, undefined, 0);
      }
    };
    barrel(0, 0, false);
    barrel(0.28, 0.06, true);
    // crate stack and sacks
    setGroup("crates");
    const crate = (x: number, y: number, z: number, s: number, yaw: number) => {
      area([x, y, z], yaw, () => {
        box(s, s, s, woodLX, [0, s / 2, 0]);
        for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.03, s + 0.01, 0.03, woodC, [sx * s * 0.5, s / 2, sz * s * 0.5]);
        for (const sy of [0.035, s - 0.035]) box(s + 0.02, 0.03, s + 0.02, woodC, [0, sy, 0]);
        for (const sz of [1, -1]) {
          tube([-s * 0.45, 0.05, sz * (s / 2 + 0.012)], [s * 0.45, s - 0.05, sz * (s / 2 + 0.012)], 0.012, 0.012, woodC, 4);
          for (const sx of [1, -1]) ball(0.012, ironLP, [sx * s * 0.45, s - 0.05, sz * (s / 2 + 0.02)], 1, undefined, 0);
        }
        for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.05, 0.05, 0.05, ironP, [sx * (s / 2 - 0.02), s - 0.01, sz * (s / 2 - 0.02)]);
      });
    };
    crate(-0.3, 0, 0.0, 0.24, 10);
    crate(-0.3, 0.24, 0.0, 0.17, 32);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 11. Firewood stack, chopping stump and axe
  area([0.62, 0, -0.56], -8, () => {
    setGroup("firewood");
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 4 - (row > 1 ? 1 : 0); i++) {
        const x = -0.15 + i * 0.1 + (row % 2) * 0.05;
        const y = 0.045 + row * 0.085;
        tube([x, y, -0.12], [x, y, 0.12], 0.045, 0.045, i % 2 ? woodZ : woodLZ, 6);
        cyl(0.04, 0.04, 0.01, 6, C.wL, [x, y, 0.123], [90, 0, 0]);
      }
    tube([-0.2, 0.0, 0.14], [-0.2, 0.28, 0.14], 0.016, 0.016, woodC, 4);
    const sack = (x: number, z: number, s: number) => {
      ball(s, sackP, [x, s * 0.75, z], [1, 1.1, 0.95], undefined, 1);
      cone(s * 0.35, s * 0.5, 5, sackP, [x, s * 1.75, z]);
      cyl(s * 0.3, s * 0.3, 0.02, 6, ropeP, [x, s * 1.45, z]);
    };
    sack(0.26, 0.1, 0.09);
    sack(0.3, 0.26, 0.075);
  });
  area([1.0, 0, 0.28], 20, () => {
    setGroup("stump");
    cyl(0.15, 0.17, 0.26, 8, woodA, [0, 0.13, 0]);
    cyl(0.145, 0.145, 0.014, 8, C.wL, [0, 0.265, 0]);
    for (const r of [0.04, 0.085, 0.12]) put(new THREE.TorusGeometry(r, 0.004, 3, 10), C.wM, [0, 0.274, 0], [90, 0, 0]);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6;
      tube([Math.cos(a) * 0.14, 0.0, Math.sin(a) * 0.14], [Math.cos(a) * 0.24, 0.0, Math.sin(a) * 0.24], 0.03, 0.012, woodC, 4);
    }
    // cleaver axe stuck in the stump
    area([0.02, 0.27, 0.0], [8, 0, 16], () => {
      tube([0, 0, 0], [0, 0.46, 0], 0.017, 0.015, woodB, 5);
      poly(axeHead(1.4), 0.024, ironLP, [0.0, 0.14, 0], [0, 90, 0], 0.004);
      box(0.04, 0.11, 0.04, ironP, [0, 0.12, 0]);
      for (let k = 0; k < 4; k++) cyl(0.02, 0.02, 0.02, 5, ropeP, [0, 0.3 + k * 0.035, 0]);
    });
    // wood chips
    for (let i = 0; i < 5; i++) box(0.04, 0.012, 0.02, C.wL, [0.2 + rand() * 0.12, 0.006, -0.25 + rand() * 0.5], [0, rand() * 180, 0]);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 11b. Hide drying rack
  area([-1.3, 0, -0.16], 78, () => {
    setGroup("hideRack");
    for (const s2 of [1, -1]) {
      tube([s2 * 0.3, -0.02, 0.04], [s2 * 0.3, 0.92, 0.04], 0.03, 0.026, woodA, 6);
      tube([s2 * 0.3, -0.02, -0.26], [s2 * 0.3, 0.88, 0.0], 0.026, 0.022, woodC, 5);
      cone(0.032, 0.07, 6, boneP, [s2 * 0.3, 0.96, 0.04]);
      cyl(0.04, 0.04, 0.04, 6, ropeP, [s2 * 0.3, 0.5, 0.04]);
    }
    tube([-0.34, 0.86, 0.04], [0.34, 0.86, 0.04], 0.022, 0.022, woodB, 6);
    tube([-0.34, 0.12, 0.04], [0.34, 0.12, 0.04], 0.022, 0.022, woodB, 6);
    const hide: [number, number][] = [
      [-0.22, 0.2], [-0.11, 0.16], [0, 0.19], [0.12, 0.15], [0.22, 0.22], [0.25, 0.4], [0.21, 0.55], [0.24, 0.72],
      [0.15, 0.8], [0.05, 0.75], [-0.05, 0.81], [-0.16, 0.76], [-0.24, 0.7], [-0.2, 0.5], [-0.25, 0.35],
    ];
    poly(hide, 0.012, hideLP, [0, 0, 0.04], undefined, 0.003);
    for (const [hx, hy] of hide) {
      const bx = Math.sign(hx) * 0.3;
      const by = hy > 0.5 ? 0.86 : hy < 0.3 ? 0.12 : hy;
      if (Math.abs(hx) < 0.27) tube([hx, hy, 0.05], [Math.abs(hx) > 0.2 ? bx : hx, by, 0.045], 0.004, 0.004, ropeP, 3);
    }
    for (const [a, c] of [[[-0.12, 0.3], [0.1, 0.62]], [[0.0, 0.28], [0.18, 0.5]], [[-0.15, 0.6], [0.02, 0.7]]] as [number, number][][])
      tube([a[0], a[1], 0.05], [c[0], c[1], 0.05], 0.014, 0.014, C.red, 4);
    for (let i = 0; i < 3; i++) rock([Math.cos(i * 2.1) * 0.08, 0.02, Math.sin(i * 2.1) * 0.08 - 0.16], 0.04, 0.03, 0.04, rockP);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 12. Bones, ribs, trophies on the ground
  setGroup("bones");
  const femur = (x: number, z: number, yaw: number, len: number) => {
    area([x, 0.025, z], yaw, () => {
      tube([-len / 2, 0, 0], [len / 2, 0, 0], 0.012, 0.012, boneP, 5);
      for (const s2 of [1, -1]) for (const dz of [0.01, -0.01]) ball(0.017, boneP, [s2 * len / 2, 0, dz], 1, undefined, 0);
    });
  };
  femur(0.9, 0.78, 50, 0.22);
  femur(0.03, 0.74, -20, 0.18);
  femur(-0.35, 0.82, 80, 0.2);
  for (let i = 0; i < 5; i++) {
    area([-0.55 + i * 0.045, 0.0, 0.66], [0, 20, 0], () => {
      put(new THREE.TorusGeometry(0.09 - Math.abs(i - 2) * 0.01, 0.01, 4, 8, Math.PI), boneP, [0, 0, 0], [0, 0, 0]);
    });
  }
  skull([0.95, 0.03, 0.9], 0.1, -60, "orc", 0);
  skull([-0.3, 0.03, 0.62], 0.08, 150, "small", 0);
  skull([1.2, 0.03, 0.3], 0.1, -110, "orc", 0);
  // skull pikes
  for (const [x, z, h, yaw] of [[-0.75, 0.4, 0.95, 10], [0.95, 0.45, 0.7, 30]] as [number, number, number, number][]) {
    area([x, 0, z], yaw, () => {
      tube([0, -0.02, 0], [0.01, h, 0], 0.016, 0.012, woodA, 5);
      cone(0.016, 0.1, 5, ironLP, [0.01, h + 0.14, 0]);
      skull([0.01, h - 0.06, 0.0], 0.12, 0, "orc", -8);
      for (let i = 0; i < 3; i++) cyl(0.022, 0.022, 0.02, 5, ropeP, [0, 0.08 + i * 0.05, 0]);
      for (let i = 0; i < 3; i++) rock([Math.cos(i * 2) * 0.05, 0.015, Math.sin(i * 2) * 0.05], 0.03, 0.025, 0.03, rockP);
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // 13. Grass tufts (cards)
  const keepOut: [number, number, number][] = [
    [-0.55, -0.5, 0.85], [1.15, -0.5, 0.35], [0.45, 0.6, 0.55], [0.45, -1.22, 0.4], [-0.1, 1.32, 0.35], [-0.65, 0.98, 0.5], [-1.05, 1.0, 0.25],
    [-1.35, 0.35, 0.2], [0.14, 0.15, 0.2], [0.62, -0.56, 0.3], [1.0, 0.28, 0.25], [1.0, 0.95, 0.35], [0.5, 1.32, 0.3], [-0.4, 0.35, 0.2], [-0.75, 0.4, 0.15], [0.95, 0.45, 0.15], [-0.98, 0.2, 0.12], [1.35, 0.3, 0.12],
  ];
  const tuftPts: V[] = [];
  let guard = 0;
  while (tuftPts.length < 70 && guard++ < 2000) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (RB - 0.1);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (keepOut.some(([kx, kz, kr]) => Math.hypot(x - kx * K, z - kz * K) < kr * K)) continue;
    tuftPts.push([x, G, z]);
  }
  b.cards(
    tuftPts.map((p) => frame(p, [0, 1, 0])),
    [grassTex, tuft],
    { size: [0.1, 0.12], lean: 10, flow: [0, -0.3, 1], vary: 0.4, spin: 180, cross: true, rng: rand, bone: root, group: "grass" },
  );
  const tuftPts2: V[] = [];
  for (let i = 0; i < 20; i++) {
    const a = rand() * Math.PI * 2;
    const x = Math.cos(a) * (RB - 0.2 + rand() * 0.1);
    const z = Math.sin(a) * (RB - 0.2 + rand() * 0.1);
    tuftPts2.push([x, G, z]);
  }
  b.cards(
    tuftPts2.map((p) => frame(p, [0, 1, 0])),
    grassTex,
    { size: [0.12, 0.16], lean: 6, flow: [0, -0.3, 1], vary: 0.3, spin: 180, cross: true, rng: rand, bone: root, group: "grass" },
  );

  // ------------------------------------------------------------------------------------------------------------
  // flush merged parts
  for (const bk of buckets.values()) {
    const merged = bk.geos.length > 1 ? mergeGeometries(bk.geos, false) : bk.geos[0];
    if (!merged) throw new Error(`merge failed for ${bk.name}`);
    const p = b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], name: bk.name });
    if (bk.glow) glow(p, bk.glow);
  }
  void bannerA;
  void bannerB;

  return b.root;
}
