import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng, vec } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { grain, mix, mottle, paint, patches, resolve, scales, smoothstep } from "../../../../src/paint";
import type { ColorInput, Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { INK, KEY_LIGHT, shadowOf, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A glowing treasure hoard on a rune dais: open iron-gold chest with quilted lining, spiked crown, four goblets, coin heaps and stacks, gem clusters, a spilled purse and a hextech-style crystal cradle.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#ffc42e";
const GOLD_HI = "#fff0a0";
const GOLD_DEEP = "#e8861a";
const GOLD_DARK = "#8f3d12";
const WOOD_A = "#4d3d9a";
const WOOD_B = "#352a72";
const WOOD_SEAM = "#1c1445";
const VELVET = "#cf1650";
const VELVET_DARK = "#7c0c36";
const NAVY = "#202a6b";
const STONE = "#3a3060";
const CYAN = "#34e4ff";
const CYAN_HI = "#b4fbff";
const CYAN_DEEP = "#1b8bf0";
const PEARL = "#fff3f8";
const SILVER = "#dbe6ff";
const GEM_COLORS = ["#ff2a5a", "#19d67a", "#2f7bff", "#b44dff", "#ffb21a", "#35e6ff"];

// Two-tone-plus-highlight cel paint: lit highlight, mid, hue-shifted shadow, against the toon kit's key light.
const KEY = vec(KEY_LIGHT).normalize();
const toon = (c: ColorInput, hi = 0.28): Paint =>
  paint((p, n) => {
    const d = n.dot(KEY);
    const col = resolve(c, p, n);
    if (d > 0.6) return mix(col, "#ffffff", hi);
    if (d > 0.08) return col;
    return shadowOf(col);
  });

// Darkens whatever is near the floor, a painted ambient occlusion.
const grounded = (c: ColorInput): Paint =>
  paint((p, n) => mix(resolve(c, p, n), "#1a1030", 0.6 * (1 - smoothstep(0.065, 0.17, p.y))));

const GOLD_P = toon(GOLD);
const GOLD_HI_P = toon(GOLD_HI, 0.15);
const GOLD_DEEP_P = toon(GOLD_DEEP);

class Xf {
  constructor(
    readonly pos: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}
  p(v: readonly number[]) {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q).add(this.pos);
  }
  d(v: readonly number[]) {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q);
  }
}
const xf = (pos: readonly number[], yaw = 0, pitch = 0, roll = 0) =>
  new Xf(
    new THREE.Vector3(pos[0], pos[1], pos[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, roll * DEG, "YXZ")),
  );

const merge = (geos: THREE.BufferGeometry[]) => (geos.length ? mergeGeometries(geos) : null);

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  const R = rng(11);
  const root = b.joint("hoard", { at: [0, 0.03, 0], dir: [0, 1, 0] });
  const B = { bone: root };

  const DAIS_TOP = 0.06;

  // ----------------------------------------------------------------------------------------------------------
  // Dais with rune ring
  const dais = b.lathe(
    [
      [0, 0],
      [1.3, 0],
      [1.3, 0.03],
      [1.25, 0.04],
      [1.25, DAIS_TOP],
      [0, DAIS_TOP],
    ],
    {
      ...B,
      at: [0, 0, 0],
      segments: 16,
      color: toon(patches(STONE, ["#4a3d7a", "#2f2752", "#43376d", "#372c5f"], { size: 0.2, gap: 0.07, seed: 4 }), 0.18),
      name: "dais",
    },
  );
  const glyphs = [
    "M0 -10 L0 10 M-6 -4 L6 4",
    "M-6 -10 L6 10 M6 -10 L-6 10",
    "M0 -10 L7 0 L0 10 L-7 0 Z",
    "M-6 -10 L-6 10 M-6 0 L6 -8 M-6 0 L6 8",
    "M0 -10 L0 10 M-7 -6 L0 -1 L7 -6",
    "M-7 10 L0 -10 L7 10 M-4 3 L4 3",
  ];
  let runeMarks = "";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * 360;
    runeMarks += `<g transform="rotate(${a} 256 256) translate(0 34)"><path d="${glyphs[i % glyphs.length]}" stroke="${CYAN}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    const m = a + 360 / 56;
    runeMarks += `<g transform="rotate(${m} 256 256) translate(0 34)"><path d="M0 -6 L4 0 L0 6 L-4 0 Z" fill="#ffd34d"/></g>`;
  }
  const RUNES = svg(
    `<svg viewBox="0 0 512 512">
    <circle cx="256" cy="256" r="251" fill="none" stroke="${CYAN}" stroke-width="5"/>
    <circle cx="256" cy="256" r="240" fill="none" stroke="${CYAN_DEEP}" stroke-width="3"/>
    <circle cx="256" cy="256" r="203" fill="none" stroke="${CYAN}" stroke-width="4"/>
    <circle cx="256" cy="256" r="194" fill="none" stroke="#ffd34d" stroke-width="3.4" stroke-dasharray="11 7"/>
    ${runeMarks}
  </svg>`,
    { size: 1024 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.5, 2.5), "#ffffff", {
      ...B,
      at: [0, DAIS_TOP + 0.003, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNES,
      name: "runeRing",
    }),
    1,
  );
  // Gold rune-stone pillars with cyan shards round the rim
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(a) * 1.18;
    const z = Math.cos(a) * 1.18;
    b.part(new THREE.CylinderGeometry(0.052, 0.062, 0.07, 6), GOLD_DEEP_P, { ...B, at: [x, DAIS_TOP + 0.03, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.042, 0.048, 0.015, 6), GOLD_HI_P, { ...B, at: [x, DAIS_TOP + 0.0675, z], flat: true });
    glow(
      b.part(new THREE.ConeGeometry(0.03, 0.11, 6), CYAN, {
        ...B,
        at: [x, DAIS_TOP + 0.135, z],
        dir: [Math.sin(a) * 0.15, 1, Math.cos(a) * 0.15],
        flat: true,
      }),
      1.2,
    );
    glow(
      b.part(new THREE.ConeGeometry(0.018, 0.07, 6), CYAN_HI, {
        ...B,
        at: [x * 1.02, DAIS_TOP + 0.07 + 0.015, z * 1.02],
        dir: [Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5],
        flat: true,
      }),
      1.2,
    );
  }

  // ----------------------------------------------------------------------------------------------------------
  // Coin mounds
  const COIN_PILE = toon(
    grounded(scales([GOLD, "#f5a623", "#ffd84d", "#e8962a"], GOLD_DARK, { size: 0.075, width: 0.22, seed: 3 })),
    0.22,
  );
  const MOUNDS: number[][] = [
    [0.2, 0.36, 0.62, 0.25, 0.6],
    [-0.5, 0.3, 0.52, 0.2, 0.5],
    [0.78, -0.05, 0.46, 0.2, 0.42],
    [-0.85, -0.15, 0.42, 0.17, 0.4],
    [0.1, -0.02, 0.6, 0.13, 0.5],
    [0.62, 0.62, 0.38, 0.13, 0.36],
    [-0.2, 0.74, 0.38, 0.1, 0.34],
    [-0.58, -0.56, 0.46, 0.15, 0.4],
    [0.9, 0.5, 0.3, 0.1, 0.3],
  ];
  const mounds = MOUNDS.map(([mx, mz, rx, ry, rz], i) =>
    b.part(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), COIN_PILE, {
      ...B,
      at: [mx, 0.052, mz],
      scale: [rx, ry, rz],
      rotation: [0, i * 47, 0],
      flat: true,
      name: `mound${i}`,
    }),
  );
  const ground = b.surface([dais, ...mounds]);
  const heightAt = (x: number, z: number) => ground.ray([x, 3, z], [0, -1, 0])?.at.y ?? DAIS_TOP;

  // ----------------------------------------------------------------------------------------------------------
  // Loose coins and gems (merged per tone)
  const COIN_TONES = [GOLD, "#f5a623", "#ffdc5c", SILVER];
  const COIN_FACE = ["#ffe27a", "#ffc94d", "#fff3a8", "#f4f8ff"];
  const coinRimGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.009, 7, 1);
  const coinTopGeo = new THREE.CircleGeometry(0.024, 7).rotateX(-Math.PI / 2).translate(0, 0.0052, 0);
  const coinBotGeo = new THREE.CircleGeometry(0.024, 7).rotateX(Math.PI / 2).translate(0, -0.0052, 0);
  const rims: THREE.BufferGeometry[][] = COIN_TONES.map(() => []);
  const faces: THREE.BufferGeometry[][] = COIN_TONES.map(() => []);
  const mat = new THREE.Matrix4();
  const spinQ = new THREE.Quaternion();
  const UP = new THREE.Vector3(0, 1, 0);
  const addCoin = (pos: THREE.Vector3, nrm: THREE.Vector3, tone: number, withFaces = true, spin = R() * 6.28) => {
    const q = aim(nrm.clone().normalize()).multiply(spinQ.setFromAxisAngle(UP, spin));
    mat.compose(pos, q, new THREE.Vector3(1, 1, 1));
    rims[tone].push(coinRimGeo.clone().applyMatrix4(mat));
    if (withFaces) {
      faces[tone].push(coinTopGeo.clone().applyMatrix4(mat));
      faces[tone].push(coinBotGeo.clone().applyMatrix4(mat));
    }
  };
  const pickTone = () => {
    const r = R();
    return r < 0.45 ? 0 : r < 0.72 ? 1 : r < 0.9 ? 2 : 3;
  };
  const tilted = (n: THREE.Vector3, amt: number) =>
    n
      .clone()
      .add(new THREE.Vector3((R() - 0.5) * 2 * amt, (R() - 0.3) * amt, (R() - 0.5) * 2 * amt))
      .normalize();

  // Chest placement (needed to keep coins out of it)
  const W = 0.8;
  const D = 0.48;
  const T = 0.04;
  const Y0 = 0.085;
  const H = 0.34;
  const TOP = Y0 + H;
  const C = xf([-0.22, 0, -0.3], 16);
  const ex = C.d([1, 0, 0]);
  const ez = C.d([0, 0, 1]);
  const loc = (p: THREE.Vector3) => {
    const dx = p.x - C.pos.x;
    const dz = p.z - C.pos.z;
    return { u: dx * ex.x + dz * ex.z, w: dx * ez.x + dz * ez.z };
  };

  for (const hit of b.surface(mounds).scatter(230, {
    rng: R,
    minDist: 0.052,
    filter: (h) => {
      if (h.at.y < 0.075 || h.n.y < 0.15) return false;
      const { u, w } = loc(h.at);
      return !(Math.abs(u) < W / 2 + 0.07 && Math.abs(w) < D / 2 + 0.07);
    },
  })) {
    const upright = R() < 0.18;
    const n = tilted(hit.n, upright ? 1.8 : 0.45);
    addCoin(hit.at.clone().addScaledVector(hit.n, 0.0), n, pickTone());
  }
  // Coins spilled on the dais
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.9 + R() * 0.3;
    addCoin(new THREE.Vector3(Math.sin(a) * r, DAIS_TOP + 0.005, Math.cos(a) * r), tilted(UP, 0.12), pickTone());
  }
  // Coin stacks
  const stack = (x: number, z: number, count: number) => {
    const y = heightAt(x, z) - 0.004;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Vector3(x + (R() - 0.5) * 0.008, y + 0.0045 + i * 0.0095, z + (R() - 0.5) * 0.008);
      addCoin(p, UP, i % 5 === 3 ? 3 : i % 3 === 0 ? 1 : 0, i === count - 1);
    }
  };
  stack(0.48, 0.8, 13);
  stack(0.6, 0.72, 8);
  stack(0.4, 0.7, 5);
  stack(-0.98, 0.12, 10);
  stack(-0.88, 0.3, 6);

  // Gems
  const gemGeo = (r: number, h: number, seg = 8) =>
    new THREE.LatheGeometry(
      [new THREE.Vector2(0, -0.7 * h), new THREE.Vector2(r, 0), new THREE.Vector2(0.62 * r, 0.3 * h), new THREE.Vector2(0, 0.3 * h)],
      seg,
    );
  const prismGeo = (r: number, len: number) => {
    const body = new THREE.CylinderGeometry(r * 0.85, r, len, 6, 1);
    const tip = new THREE.ConeGeometry(r * 0.85, len * 0.35, 6, 1).translate(0, len * 0.675, 0);
    return mergeGeometries([body, tip])!;
  };
  const gemBuckets: THREE.BufferGeometry[][] = GEM_COLORS.map(() => []);
  const addGem = (pos: THREE.Vector3, nrm: THREE.Vector3, size: number, color: number, prism = false) => {
    const q = aim(nrm.clone().normalize()).multiply(spinQ.setFromAxisAngle(UP, R() * 6.28));
    mat.compose(pos, q, new THREE.Vector3(1, 1, 1));
    const g = prism ? prismGeo(size * 0.55, size * 1.7) : gemGeo(size, size * (1.1 + R() * 0.7), 8);
    gemBuckets[color].push(g.applyMatrix4(mat));
  };
  const cluster = (cx: number, cz: number, count: number, spread: number, bias: number[]) => {
    for (let i = 0; i < count; i++) {
      const a = R() * Math.PI * 2;
      const r = Math.sqrt(R()) * spread;
      const x = cx + Math.sin(a) * r;
      const z = cz + Math.cos(a) * r;
      const size = 0.022 + R() * 0.03;
      const color = bias[Math.floor(R() * bias.length)];
      const n = tilted(UP, 1.6);
      addGem(new THREE.Vector3(x, heightAt(x, z) + size * 0.4, z), n, size, color, R() < 0.3);
    }
  };
  cluster(-0.76, 0.5, 11, 0.2, [0, 1, 4, 2]);
  cluster(0.62, 0.06, 9, 0.2, [2, 3, 5]);
  cluster(0.02, 0.26, 7, 0.14, [4, 0, 1]);
  cluster(-0.62, -0.02, 8, 0.17, [3, 5, 0]);
  cluster(0.94, 0.45, 6, 0.14, [1, 4, 5]);
  cluster(-0.42, 0.88, 6, 0.15, [0, 2, 3]);

  // ----------------------------------------------------------------------------------------------------------
  // Chest
  const cbox = (w: number, h: number, d: number, c: number[], color: string | Paint, bone: typeof root = root, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: C.p(c), quat: C.q, name });

  const grainP = grain(WOOD_A, WOOD_B, { size: 0.012, axis: [ex.x, 0, ex.z], seed: 2 });
  const quilt = (a: number, v: number) => {
    const qa = a / 0.09;
    const qb = v / 0.09;
    const fa = Math.abs(qa - Math.round(qa));
    const fb = Math.abs(qb - Math.round(qb));
    if (fa < 0.16 && fb < 0.16) return GOLD;
    if (fa < 0.06 || fb < 0.06) return VELVET_DARK;
    return VELVET;
  };
  const LINING = paint((p, n) => {
    const { u, w } = loc(p);
    if (Math.abs(n.y) > 0.7) return quilt(u + w, u - w);
    const h = Math.abs(n.x * ez.x + n.z * ez.z) > 0.5 ? u : w;
    return quilt(h + p.y, h - p.y);
  });
  const bodyPaint = toon(
    paint((p) => {
      const { u, w } = loc(p);
      if (Math.abs(u) <= W / 2 - T + 0.002 && Math.abs(w) <= D / 2 - T + 0.002 && p.y > Y0 + 0.03) return LINING;
      const f = ((p.y - Y0) / 0.085) % 1;
      return f < 0.07 ? WOOD_SEAM : grainP;
    }),
    0.15,
  );
  cbox(W, H, T, [0, Y0 + H / 2, D / 2 - T / 2], bodyPaint, root, "chestFront");
  cbox(W, H, T, [0, Y0 + H / 2, -D / 2 + T / 2], bodyPaint, root, "chestBack");
  for (const s of [1, -1]) cbox(T, H, D - 2 * T, [s * (W / 2 - T / 2), Y0 + H / 2, 0], bodyPaint, root, "chestSide");
  cbox(W - 2 * T, 0.05, D - 2 * T, [0, Y0 + 0.025, 0], bodyPaint, root, "chestFloor");

  // Gold trims
  cbox(W + 0.05, 0.05, D + 0.05, [0, Y0 + 0.012, 0], GOLD_P, root, "baseTrim");
  for (const s of [1, -1]) {
    cbox(W + 0.04, 0.045, 0.07, [0, TOP - 0.0125, s * (D / 2 - 0.012)], GOLD_P, root, "rimTrimFB");
    cbox(0.07, 0.045, D + 0.04, [s * (W / 2 - 0.012), TOP - 0.0125, 0], GOLD_P, root, "rimTrimSide");
  }
  const studPts: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    for (const sx of [1, -1]) {
      cbox(0.085, H - 0.03, 0.016, [sx * 0.26, Y0 + H / 2 + 0.005, s * (D / 2 + 0.008)], GOLD_P, root, "strap");
      for (let k = 0; k < 4; k++) studPts.push(C.p([sx * 0.26, Y0 + 0.08 + k * 0.07, s * (D / 2 + 0.018)]));
    }
    for (let k = -4; k <= 4; k++) if (Math.abs(k) > 0 || s < 0) studPts.push(C.p([k * 0.085, Y0 + 0.012, s * (D / 2 + 0.028)]));
    for (const sx of [1, -1]) {
      // corner brackets, feet and spikes
      cbox(0.014, H - 0.02, 0.09, [sx * (W / 2 + 0.007), Y0 + H / 2, s * (D / 2 - 0.045)], GOLD_P, root, "bracketA");
      cbox(0.09, H - 0.02, 0.014, [sx * (W / 2 - 0.045), Y0 + H / 2, s * (D / 2 + 0.007)], GOLD_P, root, "bracketB");
      cbox(0.09, 0.05, 0.09, [sx * (W / 2 - 0.01), 0.056 + 0.0, s * (D / 2 - 0.01)], GOLD_DEEP_P, root, "foot");
      b.part(new THREE.ConeGeometry(0.036, 0.1, 4), GOLD_P, {
        ...B,
        at: C.p([sx * (W / 2 + 0.005), TOP + 0.045, s * (D / 2 + 0.005)]),
        dir: C.d([sx * 0.4, 1, s * 0.4]),
        flat: true,
        name: "cornerSpike",
      });
      for (let k = 0; k < 3; k++) studPts.push(C.p([sx * (W / 2 + 0.016), Y0 + 0.08 + k * 0.09, s * (D / 2 - 0.045)]));
    }
  }
  b.part(merge(studPts.map((p) => new THREE.SphereGeometry(0.0125, 6, 4).translate(p.x, p.y, p.z)))!, GOLD_HI_P, {
    ...B,
    at: [0, 0, 0],
    name: "chestStuds",
  });

  // Lock plate
  const shield: OutlinePoint[] = [
    [-0.085, 0.07],
    [0.085, 0.07],
    [0.095, 0.0],
    [0, -0.13, "sharp"],
    [-0.095, 0.0],
  ];
  const shieldIn: OutlinePoint[] = shield.map((p) => [p[0] * 0.7, p[1] * 0.7 + (p[1] > 0 ? 0.006 : 0.01)] as OutlinePoint);
  b.extrude(shield, {
    ...B,
    at: C.p([0, TOP - 0.05, D / 2 + 0.002]),
    x: C.d([1, 0, 0]),
    thickness: 0.022,
    bevel: 0.005,
    smoothing: 1,
    color: GOLD_P,
    name: "lockPlate",
  });
  b.extrude(shieldIn, {
    ...B,
    at: C.p([0, TOP - 0.05, D / 2 + 0.012]),
    x: C.d([1, 0, 0]),
    thickness: 0.02,
    bevel: 0.004,
    smoothing: 1,
    color: toon(NAVY),
    name: "lockInset",
  });
  glow(
    b.lathe(
      [
        [0, -0.004],
        [0.034, 0.012],
        [0.022, 0.034],
        [0, 0.034],
      ],
      { ...B, at: C.p([0, TOP - 0.042, D / 2 + 0.022]), axis: C.d([0, 0, 1]), segments: 8, color: CYAN, name: "lockGem" },
    ),
    1.3,
  );
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 8), INK, {
    ...B,
    at: C.p([0, TOP - 0.125, D / 2 + 0.024]),
    dir: C.d([0, 0, 1]),
    name: "keyhole",
  });
  b.part(new THREE.BoxGeometry(0.008, 0.032, 0.012), INK, { ...B, at: C.p([0, TOP - 0.15, D / 2 + 0.024]), quat: C.q, name: "keyslit" });

  // Lid, hinged at the back
  const lid = b.joint("lid", { parent: root, at: C.p([0, TOP, -D / 2]), dir: C.d([0, 0, 1]), role: "hinge" });
  const LB = { bone: lid };
  const UL = D / 2 + 0.015;
  const HL = 0.17;
  const arch = (ul: number, hl: number, n = 8) =>
    Array.from({ length: n + 1 }, (_, k) => {
      const a = (Math.PI * k) / n;
      return [ul * Math.cos(a), hl * Math.sin(a)] as OutlinePoint;
    });
  const lidPaint = toon(
    paint((p, n) => {
      if (n.y < -0.7) return LINING;
      const { w } = loc(p);
      const ang = Math.atan2(p.y - TOP, w);
      const f = (ang / (Math.PI / 7)) % 1;
      return Math.abs(f) < 0.05 ? WOOD_SEAM : grainP;
    }),
    0.15,
  );
  b.extrude(arch(UL, HL), {
    ...LB,
    at: C.p([0, TOP, 0]),
    x: C.d([0, 0, 1]),
    thickness: W + 0.02,
    color: lidPaint,
    name: "lidArch",
  });
  for (const s of [1, -1]) {
    // end plates
    b.extrude(arch(UL + 0.014, HL + 0.014), {
      ...LB,
      at: C.p([s * (W / 2 + 0.021), TOP, 0]),
      x: C.d([0, 0, 1]),
      thickness: 0.024,
      bevel: 0.005,
      color: GOLD_P,
      name: "lidEndPlate",
    });
    b.extrude(arch(UL * 0.72, HL * 0.7), {
      ...LB,
      at: C.p([s * (W / 2 + 0.032), TOP + 0.012, 0]),
      x: C.d([0, 0, 1]),
      thickness: 0.012,
      color: toon(NAVY),
      name: "lidEndInset",
    });
    glow(
      b.lathe(
        [
          [0, -0.004],
          [0.03, 0.01],
          [0.019, 0.03],
          [0, 0.03],
        ],
        { ...LB, at: C.p([s * (W / 2 + 0.036), TOP + 0.06, 0]), axis: C.d([s, 0, 0]), segments: 6, color: CYAN, name: "lidEndGem" },
      ),
      1.2,
    );
    // bands over the lid
    const bandPath = catmull(
      Array.from({ length: 11 }, (_, k) => {
        const a = (Math.PI * k) / 10;
        return C.p([s * 0.26, TOP + (HL + 0.008) * Math.sin(a), (UL + 0.008) * Math.cos(a)]);
      }),
    );
    b.sweep(bandPath, () => [0.042, 0.009], { ...LB, section: "box", color: GOLD_P, name: "lidBand" });
    b.spike(C.p([s * 0.26, TOP + HL + 0.0, 0]), C.d([0, 1, 0]), 0.075, 0.02, { ...LB, color: GOLD_P, sides: 6, name: "lidSpike" });
  }
  // lid crest gem
  b.lathe(
    [
      [0, -0.012],
      [0.05, 0],
      [0.03, 0.04],
      [0, 0.04],
    ],
    { ...LB, at: C.p([0, TOP + HL - 0.004, 0]), axis: C.d([0, 1, 0]), segments: 8, color: toon(GEM_COLORS[0], 0.5), name: "lidGem" },
  );
  b.ring(frame(C.p([0, TOP + HL + 0.0, 0]), C.d([0, 1, 0])), { count: 6, radius: 0.052 }, (it) =>
    b.stick(new THREE.ConeGeometry(0.014, 0.05, 4), GOLD_P, it, { bone: lid, embed: 0.2, flow: ez }),
  );
  // lid hinge barrels
  for (const sx of [1, -1, 0]) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), GOLD_DEEP_P, { ...LB, at: C.p([sx * 0.26, TOP + 0.0, -D / 2 - 0.012]), dir: C.d([1, 0, 0]), name: "hinge" });
  b.pose(lid, { axis: C.d([1, 0, 0]), deg: -105 });

  // Gold inside the chest
  const chestGold = b.part(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), COIN_PILE, {
    ...B,
    at: C.p([0, TOP - 0.06, 0]),
    quat: C.q,
    scale: [W / 2 - T - 0.01, 0.14, D / 2 - T - 0.01],
    flat: true,
    name: "chestGold",
  });
  for (const hit of b.surface(chestGold).scatter(60, { rng: R, minDist: 0.05, filter: (h) => h.n.y > 0.2 && h.at.y > TOP - 0.05 })) {
    addCoin(hit.at.clone(), tilted(hit.n, 0.7), pickTone());
  }
  // coins draped over the front rim
  for (let i = 0; i < 5; i++) {
    const x = -0.28 + i * 0.13 + (R() - 0.5) * 0.04;
    addCoin(C.p([x, TOP + 0.035, D / 2 - 0.02]), C.d([0, 0.5, 0.85]), pickTone());
  }
  addGem(C.p([0.12, TOP + 0.075, 0.0]), UP, 0.05, 2);
  addGem(C.p([-0.14, TOP + 0.07, 0.04]), tilted(UP, 0.5), 0.045, 1);
  addGem(C.p([0.0, TOP + 0.09, -0.06]), tilted(UP, 0.4), 0.055, 3, true);
  addGem(C.p([-0.26, TOP + 0.045, 0.08]), tilted(UP, 0.6), 0.04, 4);

  // chain with pearl strand and ruby pendant, over the front rim
  const chain = catmull([
    C.p([0.12, TOP + 0.08, 0.05]),
    C.p([0.17, TOP + 0.03, D / 2 + 0.005]),
    C.p([0.2, TOP - 0.12, D / 2 + 0.045]),
    C.p([0.27, Y0 - 0.0, D / 2 + 0.11]),
    C.p([0.4, 0.0, D / 2 + 0.2]),
  ]);
  b.sweep(chain, 0.007, { ...B, color: GOLD_P, sides: 5, name: "chain" });
  const pearlGeos: THREE.BufferGeometry[] = [];
  for (let i = 1; i < 18; i++) {
    const p = chain.at(i / 18);
    const pp = new THREE.Vector3(p.x, p.y, p.z);
    pearlGeos.push(new THREE.SphereGeometry(0.0135, 6, 4).translate(pp.x + 0.02, pp.y + 0.01, pp.z));
  }
  b.part(merge(pearlGeos)!, toon(PEARL, 0.1), { ...B, at: [0, 0, 0], name: "pearls" });
  const endP = chain.at(1);
  b.lathe(
    [
      [0, -0.03],
      [0.026, 0],
      [0.016, 0.02],
      [0, 0.02],
    ],
    {
      ...B,
      at: [endP.x, endP.y + 0.012, endP.z],
      axis: [0.2, 1, 0.3],
      segments: 8,
      color: toon(GEM_COLORS[0], 0.5),
      name: "pendant",
    },
  );
  b.part(new THREE.TorusGeometry(0.026, 0.005, 5, 10), GOLD_P, { ...B, at: [endP.x, endP.y + 0.012, endP.z], dir: [0.2, 1, 0.3], axis: "z", name: "pendantSetting" });

  // ----------------------------------------------------------------------------------------------------------
  // Crystal cluster with gold cradle
  const CB = new THREE.Vector3(0.58, DAIS_TOP, -0.62);
  const crystals = [
    [0, 0, 0.8, 0.07, 0.08, -0.05],
    [0.13, 0.1, 0.5, 0.055, 0.32, 0.2],
    [-0.14, 0.08, 0.43, 0.05, -0.3, 0.15],
    [0.1, -0.13, 0.54, 0.05, 0.15, -0.35],
    [-0.11, -0.1, 0.4, 0.045, -0.25, -0.3],
    [0.22, -0.03, 0.3, 0.04, 0.55, 0.0],
    [-0.22, -0.03, 0.27, 0.04, -0.6, 0.1],
  ];
  for (const [dx, dz, h, r, lx, lz] of crystals) {
    const d = new THREE.Vector3(lx, 1, lz).normalize();
    const base = new THREE.Vector3(CB.x + dx, CB.y - 0.01, CB.z + dz);
    const seg = (s0: number, s1: number, r0: number, r1: number, color: string, cone = false) => {
      const len = (s1 - s0) * h;
      const c = base.clone().addScaledVector(d, ((s0 + s1) / 2) * h);
      const geo = cone ? new THREE.ConeGeometry(r0, len, 6, 1) : new THREE.CylinderGeometry(r1, r0, len, 6, 1);
      glow(b.part(geo, color, { ...B, at: c, dir: d, flat: true, name: "crystal" }), 1.15);
    };
    seg(0, 0.32, r, r * 0.97, CYAN_DEEP);
    seg(0.32, 0.72, r * 0.97, r * 0.9, CYAN);
    seg(0.72, 1.0, r * 0.9, 0, CYAN_HI, true);
    // a bright facet sliver
    const side = new THREE.Vector3(d.z, 0, -d.x).normalize();
    const sc = base.clone().addScaledVector(d, h * 0.5).addScaledVector(side, r * 0.8);
    glow(b.part(new THREE.BoxGeometry(0.008, h * 0.28, r * 0.5), CYAN_HI, { ...B, at: sc, dir: d, flat: true, name: "crystalGlint" }), 1.2);
  }
  // cradle prongs
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const o = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const p0 = new THREE.Vector3(CB.x, 0, CB.z).addScaledVector(o, 0.26).setY(DAIS_TOP - 0.01);
    const p1 = new THREE.Vector3(CB.x, 0, CB.z).addScaledVector(o, 0.27).setY(0.3);
    const p2 = new THREE.Vector3(CB.x, 0, CB.z).addScaledVector(o, 0.1).setY(0.46);
    b.sweep(bezier(p0, p1, p2), [0.026, 0.007], { ...B, color: GOLD_P, sides: 5, caps: { start: "flat", end: "point" }, name: "prong" });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD_HI_P, { ...B, at: p0.clone().setY(DAIS_TOP + 0.02), name: "prongFoot" });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CYAN_HI, { ...B, at: p0.clone().lerp(p1, 0.55).setY(0.14).addScaledVector(o, 0.003), name: "prongGem" }), 1.2);
  }
  b.part(new THREE.CylinderGeometry(0.25, 0.3, 0.04, 8), toon(grounded("#5d4aa8")), { ...B, at: [CB.x, DAIS_TOP + 0.0, CB.z], flat: true, name: "crystalBase" });

  // ----------------------------------------------------------------------------------------------------------
  // Crown
  const KP = [0.34, heightAt(0.34, 0.4) + 0.012, 0.4];
  const K = xf(KP, 22, 12, -9);
  const KR = 0.11;
  const bandPaint = toon(
    paint((_p, _n, s) => {
      const z = zigzag((s[1] / 360) * 16);
      return s[0] > 0.022 && s[0] < 0.05 && Math.abs(s[0] - (0.026 + 0.02 * z)) < 0.0045 ? GOLD_DARK : GOLD;
    }),
  );
  b.lathe(
    [
      [0.095, 0],
      [0.112, 0],
      [0.112, 0.012],
      [0.106, 0.012],
      [0.106, 0.058],
      [0.115, 0.058],
      [0.115, 0.074],
      [0.097, 0.074],
    ],
    { ...B, at: K.p([0, 0, 0]), axis: K.d([0, 1, 0]), segments: 16, color: bandPaint, name: "crownBand" },
  );
  b.part(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), toon(VELVET), {
    ...B,
    at: K.p([0, 0.06, 0]),
    quat: K.q,
    scale: [0.098, 0.104, 0.098],
    flat: true,
    name: "crownVelvet",
  });
  const NS = 8;
  for (let i = 0; i < NS; i++) {
    const a = (i / NS) * Math.PI * 2;
    const o = [Math.sin(a), 0, Math.cos(a)];
    const t = [Math.cos(a), 0, -Math.sin(a)];
    const Hs = i % 2 === 0 ? 0.17 : 0.1;
    const spike: OutlinePoint[] = [
      [-0.03, 0],
      [0.03, 0],
      [0.021, Hs * 0.42],
      [0.008, Hs * 0.8],
      [0, Hs, "sharp"],
      [-0.008, Hs * 0.8],
      [-0.021, Hs * 0.42],
    ];
    const yDir = K.d([o[0] * 0.28, 1, o[2] * 0.28]);
    const base = K.p([o[0] * (KR - 0.004), 0.066, o[2] * (KR - 0.004)]);
    b.extrude(spike, {
      ...B,
      at: base,
      x: K.d(t),
      y: yDir,
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: GOLD_P,
      name: "crownSpike",
    });
    const tip = base.clone().addScaledVector(yDir.clone().normalize(), Hs + 0.004);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), toon(i % 2 === 0 ? GEM_COLORS[0] : PEARL, 0.4), { ...B, at: tip, name: "crownOrb" });
    // band gem
    b.lathe(
      [
        [0, -0.004],
        [0.019, 0.006],
        [0.012, 0.018],
        [0, 0.018],
      ],
      {
        ...B,
        at: K.p([o[0] * (KR + 0.003), 0.036, o[2] * (KR + 0.003)]),
        axis: K.d(o),
        segments: 8,
        color: toon(GEM_COLORS[i % 2 === 0 ? 2 : 1], 0.5),
        name: "crownGem",
      },
    );
    // inlaid gem in spike
    if (i % 2 === 0) {
      b.part(new THREE.OctahedronGeometry(0.014), toon(GEM_COLORS[4], 0.5), {
        ...B,
        at: base.clone().addScaledVector(yDir.clone().normalize(), 0.06).addScaledVector(K.d(o), 0.007),
        flat: true,
        name: "spikeGem",
      });
    }
  }
  // arches
  const archA = catmull([K.p([-KR + 0.004, 0.072, 0]), K.p([-0.075, 0.138, 0]), K.p([0, 0.172, 0]), K.p([0.075, 0.138, 0]), K.p([KR - 0.004, 0.072, 0])]);
  const archB = catmull([K.p([0, 0.072, -KR + 0.004]), K.p([0, 0.138, -0.075]), K.p([0, 0.172, 0]), K.p([0, 0.138, 0.075]), K.p([0, 0.072, KR - 0.004])]);
  b.sweep(archA, 0.0095, { ...B, color: GOLD_P, sides: 6, name: "crownArch" });
  b.sweep(archB, 0.0095, { ...B, color: GOLD_P, sides: 6, name: "crownArch" });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), toon(GEM_COLORS[0], 0.5), { ...B, at: K.p([0, 0.19, 0]), name: "crownTopOrb" });
  b.spike(K.p([0, 0.205, 0]), K.d([0, 1, 0]), 0.06, 0.012, { ...B, color: GOLD_P, sides: 6, name: "crownFinial" });
  const crownPearls: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const p = K.p([Math.sin(a) * (KR + 0.006), 0.006, Math.cos(a) * (KR + 0.006)]);
    crownPearls.push(new THREE.SphereGeometry(0.0085, 5, 4).translate(p.x, p.y, p.z));
  }
  b.part(merge(crownPearls)!, toon(PEARL, 0.1), { ...B, at: [0, 0, 0], name: "crownPearls" });

  // ----------------------------------------------------------------------------------------------------------
  // Goblets
  const gobletOutline = (kind: number): OutlinePoint[] =>
    kind === 0
      ? [
          [0, 0],
          [0.056, 0],
          [0.058, 0.008],
          [0.046, 0.016],
          [0.03, 0.026],
          [0.014, 0.05],
          [0.013, 0.1],
          [0.026, 0.11],
          [0.029, 0.125],
          [0.026, 0.14],
          [0.013, 0.15],
          [0.013, 0.17],
          [0.03, 0.176],
          [0.052, 0.2],
          [0.06, 0.24],
          [0.058, 0.285],
          [0.063, 0.298],
          [0.054, 0.298],
          [0.052, 0.285],
          [0.054, 0.24],
          [0.046, 0.205],
          [0, 0.185],
        ]
      : kind === 1
        ? [
            [0, 0],
            [0.07, 0],
            [0.07, 0.01],
            [0.04, 0.02],
            [0.012, 0.04],
            [0.011, 0.13],
            [0.02, 0.15],
            [0.02, 0.17],
            [0.03, 0.18],
            [0.056, 0.215],
            [0.074, 0.27],
            [0.078, 0.315],
            [0.071, 0.315],
            [0.069, 0.27],
            [0.051, 0.22],
            [0, 0.19],
          ]
        : [
            [0, 0],
            [0.05, 0],
            [0.05, 0.01],
            [0.028, 0.02],
            [0.02, 0.05],
            [0.034, 0.06],
            [0.07, 0.085],
            [0.082, 0.13],
            [0.078, 0.16],
            [0.086, 0.17],
            [0.075, 0.17],
            [0.07, 0.16],
            [0.074, 0.13],
            [0.062, 0.09],
            [0, 0.075],
          ];
  const ornament = (y0: number, y1: number, n: number, bg: string, fg: string) =>
    toon(
      paint((_p, _n, s) => {
        if (s[0] < y0 || s[0] > y1) return bg;
        const v = (s[0] - y0) / (y1 - y0);
        const z = zigzag((s[1] / 360) * n);
        return Math.abs(v - (0.25 + 0.5 * z)) < 0.14 ? fg : bg;
      }),
    );
  const GOBLET_GOLD = ornament(0.205, 0.265, 14, GOLD, GOLD_DARK);
  const GOBLET_SILVER = toon(
    paint((_p, _n, s) => (s[0] > 0.2 && s[0] < 0.215 ? CYAN_DEEP : grain(SILVER, "#a9bcea", { size: 0.01, seed: 5 }))),
    0.2,
  );
  const GOBLET_CUP = ornament(0.08, 0.12, 10, GOLD, GOLD_DARK);
  const goblet = (g: Xf, kind: number, paintC: string | Paint, name: string) => {
    b.lathe(gobletOutline(kind), { ...B, at: g.p([0, 0, 0]), axis: g.d([0, 1, 0]), segments: 14, color: paintC, name });
  };
  const band = (g: Xf, r: number, y: number, tube: number, color: string | Paint) =>
    b.lathe(
      [
        [r - tube, y - tube],
        [r + tube, y - tube * 0.6],
        [r + tube, y + tube * 0.6],
        [r - tube, y + tube],
      ],
      { ...B, at: g.p([0, 0, 0]), axis: g.d([0, 1, 0]), segments: 14, color, name: "gobletBand" },
    );
  const studRing = (g: Xf, y: number, r: number, count: number, geo: THREE.BufferGeometry, color: string | Paint) =>
    b.ring(frame(g.p([0, y, 0]), g.d([0, 1, 0])), { count, radius: r }, (it) => b.stick(geo, color, it, { bone: root, embed: 0.3 }));

  // A: tall gold chalice heaped with coins
  const gaX = -0.7;
  const gaZ = 0.22;
  const GA = xf([gaX, heightAt(gaX, gaZ) - 0.012, gaZ], 25, -6, 5);
  goblet(GA, 0, GOBLET_GOLD, "chaliceGold");
  band(GA, 0.063, 0.292, 0.007, GOLD_HI_P);
  band(GA, 0.052, 0.012, 0.007, GOLD_HI_P);
  band(GA, 0.028, 0.125, 0.005, GOLD_HI_P);
  studRing(GA, 0.225, 0.059, 6, gemGeo(0.014, 0.022, 6), toon(GEM_COLORS[0], 0.5));
  studRing(GA, 0.125, 0.027, 5, new THREE.SphereGeometry(0.01, 5, 4), toon(GEM_COLORS[5], 0.5));
  b.part(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), COIN_PILE, {
    ...B,
    at: GA.p([0, 0.28, 0]),
    quat: GA.q,
    scale: [0.058, 0.045, 0.058],
    flat: true,
    name: "chaliceCoins",
  });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = i === 6 ? 0.0 : 0.032;
    addCoin(GA.p([Math.sin(a) * r, 0.314 - (i === 6 ? 0 : 0.012), Math.cos(a) * r]), GA.d([Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5]), pickTone());
  }

  // B: tall silver tulip goblet, glowing cyan potion
  const gbX = 0.9;
  const gbZ = 0.1;
  const GB = xf([gbX, heightAt(gbX, gbZ) - 0.012, gbZ], -35, -5, -7);
  goblet(GB, 1, GOBLET_SILVER, "goletSilver");
  band(GB, 0.0745, 0.312, 0.007, GOLD_P);
  band(GB, 0.07, 0.012, 0.007, GOLD_P);
  band(GB, 0.022, 0.16, 0.006, GOLD_P);
  studRing(GB, 0.24, 0.07, 6, new THREE.OctahedronGeometry(0.014).scale(1, 1.4, 1), toon(GEM_COLORS[2], 0.5));
  glow(b.part(new THREE.CylinderGeometry(0.068, 0.06, 0.012, 12), "#5af7d9", { ...B, at: GB.p([0, 0.282, 0]), quat: GB.q, name: "potion" }), 1.2);
  for (let i = 0; i < 4; i++) {
    glow(b.part(new THREE.SphereGeometry(0.008 + i * 0.002, 5, 4), CYAN_HI, { ...B, at: GB.p([Math.sin(i * 1.9) * 0.03, 0.31 + i * 0.045, Math.cos(i * 1.9) * 0.03]), name: "potionBubble" }), 1.3);
  }

  // C: squat jewelled cup with swept handles
  const gcX = 0.02;
  const gcZ = 0.66;
  const GC = xf([gcX, heightAt(gcX, gcZ) - 0.01, gcZ], 10, 4, 4);
  goblet(GC, 2, GOBLET_CUP, "cupGold");
  band(GC, 0.082, 0.17, 0.006, GOLD_HI_P);
  band(GC, 0.045, 0.012, 0.007, GOLD_HI_P);
  for (const s of [1, -1]) {
    b.sweep(catmull([GC.p([s * 0.078, 0.14, 0]), GC.p([s * 0.125, 0.15, 0]), GC.p([s * 0.135, 0.105, 0]), GC.p([s * 0.092, 0.07, 0])]), 0.0075, {
      ...B,
      color: GOLD_P,
      sides: 6,
      name: "cupHandle",
    });
  }
  studRing(GC, 0.1, 0.081, 8, new THREE.OctahedronGeometry(0.013), toon(GEM_COLORS[1], 0.5));
  // gem heap in C
  for (let i = 0; i < 9; i++) {
    const a = i * 2.1;
    const r = i < 8 ? 0.035 * Math.sqrt((i + 1) / 8) : 0;
    addGem(GC.p([Math.sin(a) * r, 0.158 + (i === 8 ? 0.02 : 0.0), Math.cos(a) * r]), tilted(UP, 1.2), 0.026, [0, 4, 2, 3, 1, 5][i % 6], i % 3 === 0);
  }

  // D: tipped goblet spilling coins
  const gdX = -0.34;
  const gdZ = 0.74;
  const GD = xf([gdX, heightAt(gdX, gdZ) + 0.062, gdZ], -30, 90, 0);
  goblet(GD, 0, toon(ornament(0.205, 0.265, 14, "#e9b24a", "#6b2e12")), "gobletTipped");
  band(GD, 0.063, 0.292, 0.007, GOLD_HI_P);
  band(GD, 0.052, 0.012, 0.007, GOLD_HI_P);
  studRing(GD, 0.225, 0.059, 6, gemGeo(0.014, 0.022, 6), toon(GEM_COLORS[3], 0.5));
  const mouth = GD.p([0, 0.3, 0]);
  const outDir = GD.d([0, 1, 0]);
  const outFlat = new THREE.Vector3(outDir.x, 0, outDir.z).normalize();
  for (let i = 0; i < 26; i++) {
    const dist = 0.05 + (i / 26) * 0.5 + R() * 0.05;
    const lat = (R() - 0.5) * (0.04 + dist * 0.55);
    const side = new THREE.Vector3(outFlat.z, 0, -outFlat.x);
    const p = mouth.clone().addScaledVector(outFlat, dist).addScaledVector(side, lat);
    const gy = heightAt(p.x, p.z);
    p.y = i < 3 ? mouth.y - 0.03 - i * 0.025 : gy + 0.006 + (R() < 0.2 ? 0.01 : 0);
    addCoin(p, i < 3 ? GD.d([0.6, 0.3, 0.3]) : tilted(UP, 0.3), pickTone());
  }

  // ----------------------------------------------------------------------------------------------------------
  // Purse sack with spilled coins
  const sX = -0.95;
  const sZ = -0.46;
  const SK = xf([sX, heightAt(sX, sZ) - 0.006, sZ], 28, 14, 0);
  const sack = b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.19, 0.07],
      [0.205, 0.14],
      [0.15, 0.225],
      [0.075, 0.27],
      [0.052, 0.3],
      [0.055, 0.32],
      [0.1, 0.38],
      [0.125, 0.43],
      [0.09, 0.425],
      [0.06, 0.36],
      [0, 0.34],
    ],
    {
      ...B,
      at: SK.p([0, 0, 0]),
      axis: SK.d([0, 1, 0]),
      segments: 10,
      smoothing: 1,
      color: toon(grounded(mottle("#7b3fb8", "#9c5fd8", { size: 0.05, seed: 8 })), 0.2),
      name: "purse",
    },
  );
  const EMB = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#ffc42e" stroke="#8f3d12" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#8f3d12" stroke-width="2.4"/><path d="M32 10 L37 26 L54 26 L40 36 L45 52 L32 42 L19 52 L24 36 L10 26 L27 26 Z" fill="#fff0a0" stroke="#8f3d12" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
  const sackSkin = b.surface(sack);
  const embHit = sackSkin.around(SK.p([0, 0.14, 0])).at(28, 8);
  if (embHit) b.decal(sackSkin, EMB, { at: embHit, size: [0.11, 0.11], name: "purseEmblem" });
  b.lathe(
    [
      [0.045, 0.296],
      [0.068, 0.296],
      [0.07, 0.322],
      [0.05, 0.328],
    ],
    { ...B, at: SK.p([0, 0, 0]), axis: SK.d([0, 1, 0]), segments: 10, color: GOLD_P, name: "purseTie" },
  );
  for (const s of [1, -1])
    b.sweep(catmull([SK.p([s * 0.02, 0.31, 0.055]), SK.p([s * 0.07, 0.29, 0.1]), SK.p([s * 0.09, 0.23, 0.115])]), [0.01, 0.004], { ...B, color: GOLD_P, sides: 5, name: "purseTassel" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_HI_P, { ...B, at: SK.p([0.09, 0.22, 0.115]), name: "tasselBead" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_HI_P, { ...B, at: SK.p([-0.09, 0.22, 0.115]), name: "tasselBead" });
  b.part(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), COIN_PILE, { ...B, at: SK.p([0, 0.375, 0]), quat: SK.q, scale: [0.085, 0.05, 0.085], flat: true, name: "purseGold" });
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const r = i === 8 ? 0 : 0.05;
    addCoin(SK.p([Math.sin(a) * r, 0.405 - (i === 8 ? 0 : 0.012), Math.cos(a) * r]), SK.d([Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4]), pickTone());
  }
  const sOut = SK.d([0, 1, 0]);
  const sFlat = new THREE.Vector3(sOut.x, 0, sOut.z).normalize();
  const sSide = new THREE.Vector3(sFlat.z, 0, -sFlat.x);
  for (let i = 0; i < 18; i++) {
    const dist = 0.18 + (i / 18) * 0.42 + R() * 0.05;
    const p = new THREE.Vector3(sX, 0, sZ).addScaledVector(sFlat, dist).addScaledVector(sSide, (R() - 0.5) * (0.06 + dist * 0.4));
    p.y = heightAt(p.x, p.z) + 0.006;
    addCoin(p, tilted(UP, 0.35), pickTone());
  }

  // Rings with gems lying on the coins
  const ringSpots = [
    [0.18, 0.62],
    [-0.62, 0.74],
    [0.74, 0.34],
  ];
  const ringTori: THREE.BufferGeometry[] = [];
  ringSpots.forEach(([x, z], i) => {
    const n = tilted(UP, 0.35);
    const p = new THREE.Vector3(x, heightAt(x, z) + 0.014, z);
    mat.compose(p, aim(n), new THREE.Vector3(1, 1, 1));
    ringTori.push(new THREE.TorusGeometry(0.024, 0.005, 5, 10).rotateX(Math.PI / 2).applyMatrix4(mat));
    addGem(p.clone().addScaledVector(n, 0.014).add(new THREE.Vector3(0.0, 0, 0.0)), n, 0.016, [0, 2, 1][i]);
  });
  b.part(merge(ringTori)!, GOLD_P, { ...B, at: [0, 0, 0], name: "rings" });

  // ----------------------------------------------------------------------------------------------------------
  // Feature gems: two-tone glowing stones on the coins
  const bigGem = (x: number, z: number, r: number, h: number, hi: string, lo: string, tiltN: THREE.Vector3) => {
    const p = new THREE.Vector3(x, heightAt(x, z) + h * 0.62, z);
    const crown = b.lathe(
      [
        [0, 0],
        [r, 0],
        [0.6 * r, 0.3 * h],
        [0, 0.3 * h],
      ],
      { ...B, at: p, axis: tiltN, segments: 6, color: hi, name: "bigGemCrown" },
    );
    const pav = b.lathe(
      [
        [0, -0.7 * h],
        [r, 0],
        [0, 0],
      ],
      { ...B, at: p, axis: tiltN, segments: 6, color: lo, name: "bigGemPavilion" },
    );
    glow(crown, 1.1);
    glow(pav, 1.0);
  };
  bigGem(0.66, 0.54, 0.075, 0.16, "#ff6f8f", "#d4103d", V(0.2, 1, 0.1));
  bigGem(-0.52, 0.52, 0.065, 0.14, "#78a8ff", "#1f52e0", V(-0.25, 1, 0.15));
  bigGem(0.12, 0.1, 0.05, 0.11, "#7fffc0", "#0fae62", V(0.05, 1, -0.3));

  // ----------------------------------------------------------------------------------------------------------
  // Flush merged parts
  rims.forEach((g, i) => {
    const m = merge(g);
    if (m) b.part(m, toon(COIN_TONES[i], 0.25), { ...B, at: [0, 0, 0], flat: true, name: `coinRim${i}` });
  });
  faces.forEach((g, i) => {
    const m = merge(g);
    if (m) b.part(m, toon(COIN_FACE[i], 0.15), { ...B, at: [0, 0, 0], flat: true, name: `coinFace${i}` });
  });
  gemBuckets.forEach((g, i) => {
    const m = merge(g);
    if (m) b.part(m, toon(GEM_COLORS[i], 0.5), { ...B, at: [0, 0, 0], flat: true, name: `gems${i}` });
  });

  // ----------------------------------------------------------------------------------------------------------
  // Sparkles
  const STAR = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 0 C34 20 44 30 64 32 C44 34 34 44 32 64 C30 44 20 34 0 32 C20 30 30 20 32 0Z" fill="#fff4b8"/><circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const sparkle = (p: number[], size: number) => {
    glow(
      b.cards([frame([p[0], p[1] - size / 2, p[2]], [0, 1, 0])], STAR, {
        ...B,
        size: [size, size],
        lean: 0,
        flow: [0, 0, 1],
        cross: true,
        sink: 0,
      }),
      1.4,
    );
  };
  sparkle([-0.22, 0.62, -0.1], 0.12);
  sparkle([-0.4, 0.9, -0.5], 0.08);
  sparkle([0.1, 0.8, -0.35], 0.06);
  sparkle([0.34, 0.5, 0.4], 0.07);
  sparkle([0.5, 0.95, -0.55], 0.1);
  sparkle([-0.72, 0.48, 0.25], 0.07);
  sparkle([0.88, 0.5, 0.1], 0.06);
  sparkle([-0.5, 0.35, 0.55], 0.05);
  sparkle([0.18, 0.4, 0.8], 0.05);
  sparkle([-0.9, 0.62, -0.5], 0.06);
  sparkle([0.76, 0.28, -0.2], 0.05);
  // flat sparkles lying on the gold, seen from above
  const flats = [
    [0.1, 0.3, 0.1],
    [-0.5, 0.26, 0.42],
    [0.68, 0.22, 0.6],
    [0.5, 0.26, 0.2],
    [-0.1, 0.17, 0.82],
  ];
  glow(
    b.cards(
      flats.map((p) => frame([p[0], p[1], p[2]], [0, 1, 0])),
      STAR,
      { ...B, size: 0.09, lean: 90, flow: [0, 0, -1], mirror: true, sink: 0 },
    ),
    1.4,
  );

  return b.root;
}

function V(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}
