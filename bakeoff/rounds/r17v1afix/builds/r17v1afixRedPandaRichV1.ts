import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { cells, mix, noise, paint, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A red panda perched on a shrine boulder wrapped in a paper-streamer rope, tail raised high for balance: cel-shaded fur with zig-zag edges, anime eyes, gold bell and tassel collar, glowing dendro runes, leaves and fireflies.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface is a two-tone cel.
const RUST = "#f7843a";
const RUST_S = "#d9552f";
const RUST_D = "#c4421f";
const DEEP = cel("#6a3646", "#402243");
const CREAM = cel("#fff4de", "#f2cfb4");
const NOSE = cel("#3a2540", INK);
const GOLD = cel("#ffd96a", "#d89530");
const TEAL = cel("#33d4b8", "#1f8fa8");
const CLAW = cel("#fff0cf", "#e7c3a0");
const MOSS_L = "#b8ee6a";
const MOSS_M = "#82d95a";
const MOSS_D = "#4fae52";
const MOSS_RIM = "#3b8d4e";
const STONE_A = "#b4bfd3";
const STONE_B = "#9aa7c2";
const STONE_CRACK = "#6c7aa0";
const ROPE_L = cel("#f4e3b5", "#d7b98a");
const ROPE_D = cel("#c99d62", "#9b6c52");

/** A fat low-poly boulder: flat-topped dome with an irregular rim, flat base on y = 0. */
function boulder(rx: number, ry: number, rz: number, seed: number, rings = 7, segs = 16) {
  const pos: number[] = [0, ry * (1 + 0.02 * Math.sin(seed)), 0];
  const idx: number[] = [];
  for (let k = 1; k <= rings; k++) {
    const u = Math.sin((k / rings) * Math.PI * 0.5);
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const w = 1 + 0.07 * Math.sin(3 * a + seed) + 0.05 * Math.sin(5 * a + 2.3 * seed) + 0.03 * Math.sin(2 * a + 0.7 * seed);
      const h = k === rings ? 0 : ry * Math.pow(1 - Math.pow(u, 4), 0.55) * (1 + 0.035 * Math.sin(4 * a + seed + k));
      pos.push(rx * u * w * Math.sin(a), h, rz * u * w * Math.cos(a));
    }
  }
  const bottom = pos.length / 3;
  pos.push(0, 0, 0);
  const at = (k: number, i: number) => 1 + (k - 1) * segs + (i % segs);
  for (let i = 0; i < segs; i++) idx.push(0, at(1, i), at(1, i + 1));
  for (let k = 1; k < rings; k++)
    for (let i = 0; i < segs; i++) {
      idx.push(at(k, i), at(k + 1, i), at(k + 1, i + 1));
      idx.push(at(k, i), at(k + 1, i + 1), at(k, i + 1));
    }
  for (let i = 0; i < segs; i++) idx.push(bottom, at(rings, i + 1), at(rings, i));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Linear interpolation through evenly spaced keys, for hand-shaped radius profiles. */
const keyed = (keys: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};

// ---------------------------------------------------------------------------------------------------------------
// Textures
const GRASS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
  <path d="M3 48 Q6 26 2 9 Q11 25 11 48Z" fill="#4aa83f"/>
  <path d="M9 48 Q11 22 16 2 Q20 22 19 48Z" fill="#82d95a"/>
  <path d="M16 48 Q22 30 29 12 Q27 32 25 48Z" fill="#5cbf47"/>
  <path d="M12 48 Q13 30 15 16 Q17 32 17 48Z" fill="#c4f27a"/>
  <path d="M21 48 Q25 38 30 30 Q27 42 27 48Z" fill="#3f9a44"/>
</svg>`,
  { size: 128 },
);
const HANGING_MOSS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40">
  <path d="M0 40 H24 V30 Q22 14 20 3 Q17 18 15 24 Q13 8 11 1 Q9 16 8 24 Q5 12 3 5 Q2 20 0 30Z" fill="#5fbf4e"/>
  <path d="M0 40 H24 V36 Q18 30 12 33 Q6 30 0 36Z" fill="#8be05f"/>
</svg>`,
  { size: 96 },
);
const FLOWER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
  <rect x="11" y="0" width="2.4" height="19" fill="#4aa83f"/>
  <path d="M12 8 Q5 7 3 3 Q9 3 12 8Z" fill="#6ed05a"/>
  <g fill="#fffaf0">
    <ellipse cx="12" cy="25" rx="3.2" ry="6" /><ellipse cx="12" cy="25" rx="3.2" ry="6" transform="rotate(72 12 25)"/>
    <ellipse cx="12" cy="25" rx="3.2" ry="6" transform="rotate(144 12 25)"/><ellipse cx="12" cy="25" rx="3.2" ry="6" transform="rotate(216 12 25)"/>
    <ellipse cx="12" cy="25" rx="3.2" ry="6" transform="rotate(288 12 25)"/>
  </g>
  <circle cx="12" cy="25" r="3.4" fill="#ffc83a"/>
</svg>`,
  { size: 128 },
);
const SHIDE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
  <path d="M12 80 H28 V68 L37 60 L26 52 L37 44 L26 36 L37 28 L24 20 L30 6 L14 2 L12 14 L3 22 L14 30 L3 38 L14 46 L3 54 L12 64Z" fill="#fffdf5" stroke="#b9b2d6" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M12 52 L26 52 M12 36 L26 36 M13 20 L24 20" stroke="#cfc8e6" stroke-width="1.6" fill="none"/>
</svg>`,
  { size: 200 },
);
const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 40">
  <rect x="5" y="34" width="6" height="6" rx="1.5" fill="#ffd96a" stroke="#c98a24" stroke-width="1"/>
  <circle cx="8" cy="30" r="3.4" fill="#ffd96a" stroke="#c98a24" stroke-width="0.9"/>
  <path d="M5 28 L1 4 L5 8 L6 2 L8 8 L10 2 L11 8 L15 4 L11 28Z" fill="#33d4b8"/>
  <path d="M8 28 L8 10 M5.5 28 L3.5 12 M10.5 28 L12.5 12" stroke="#1f8fa8" stroke-width="1" fill="none"/>
  <rect x="4" y="22" width="8" height="2" fill="#ffd96a"/>
</svg>`,
  { size: 160 },
);
const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40">
  <path d="M3 40 L1 18 L7 26 L8 6 L12 0 L16 6 L17 26 L23 18 L21 40Z" fill="#ffffff"/>
  <path d="M12 40 L12 6" stroke="#d9d9d9" stroke-width="1.6"/>
</svg>`,
  { size: 96 },
);
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="92" fill="none" stroke="#ffd96a" stroke-width="5"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#ffd96a" stroke-width="2.5" stroke-dasharray="3 7"/>
  <circle cx="100" cy="100" r="62" fill="none" stroke="#c4ff6a" stroke-width="4"/>
  <g fill="#a6ff7a" stroke="#ffd96a" stroke-width="2.5" stroke-linejoin="round">
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(45 100 100)"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(90 100 100)"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(135 100 100)"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(180 100 100)"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(225 100 100)"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(270 100 100)"/>
    <path d="M100 100 Q112 74 100 40 Q88 74 100 100Z" transform="rotate(315 100 100)"/>
  </g>
  <path d="M100 82 L118 100 L100 118 L82 100Z" fill="#ffd96a" stroke="#fff3b0" stroke-width="2.5" stroke-linejoin="round"/>
  <g fill="#ffd96a">
    <path d="M100 4 L106 16 L100 28 L94 16Z"/>
    <path d="M100 196 L106 184 L100 172 L94 184Z"/>
    <path d="M4 100 L16 94 L28 100 L16 106Z"/>
    <path d="M196 100 L184 94 L172 100 L184 106Z"/>
  </g>
  <g fill="none" stroke="#c4ff6a" stroke-width="3" stroke-linecap="round">
    <path d="M30 72 Q40 50 62 40"/><path d="M170 72 Q160 50 138 40"/>
    <path d="M30 128 Q40 150 62 160"/><path d="M170 128 Q160 150 138 160"/>
  </g>
</svg>`,
  { size: 512 },
);
const RUNE_SMALL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffd96a" stroke-width="5"/>
  <path d="M50 14 Q66 36 50 86 Q34 36 50 14Z" fill="#a6ff7a" stroke="#ffd96a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M26 50 L50 40 L74 50 L50 60Z" fill="#ffd96a"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 2048 });
  const R = rng(7);

  // ===== Stone ============================================================================================
  const root = b.joint("root", { at: [0, 0, 0] });

  const stonePaint = cel(
    paint((p, n) => {
      const m = n.y * 0.85 + (noise(p, 0.14, 4) - 0.5) * 0.9 + (zigzag(p.x / 0.04 + p.z / 0.05) - 0.5) * 0.12;
      if (m > 0.52) {
        const t = noise(p, 0.07, 8);
        return t > 0.58 ? MOSS_L : t > 0.36 ? MOSS_M : MOSS_D;
      }
      if (m > 0.45) return MOSS_RIM;
      const c = cells(p, 0.2, 3);
      if (c.d2 - c.d1 < 0.06) return STONE_CRACK;
      return mix(STONE_A, STONE_B, noise(p, 0.1, 6) > 0.5 ? 0 : 1);
    }),
  );

  const stones: Array<[number, number, number, number, number, number, number]> = [
    // x, z, rx, ry, rz, seed, rings
    [0, 0, 0.31, 0.27, 0.4, 1, 7],
    [0.34, -0.3, 0.19, 0.15, 0.19, 2.4, 5],
    [-0.35, 0.3, 0.15, 0.1, 0.14, 3.7, 4],
    [-0.28, -0.34, 0.1, 0.07, 0.1, 5.1, 4],
    [0.3, 0.4, 0.08, 0.055, 0.08, 6.2, 4],
    [-0.1, 0.5, 0.06, 0.04, 0.06, 8.3, 3],
    [0.5, -0.05, 0.07, 0.045, 0.07, 9.6, 3],
    [0.12, -0.52, 0.07, 0.05, 0.07, 11.2, 3],
  ];
  const stoneParts = stones.map(([x, z, rx, ry, rz, seed, rings], i) =>
    b.part(boulder(rx, ry, rz, seed, rings, i < 2 ? 16 : 10).translate(x, 0, z), stonePaint, {
      bone: root,
      at: [0, 0, 0],
      flat: true,
      name: `stone${i}`,
    }),
  );
  const rock = b.surface(stoneParts[0]);
  const rockAll = b.surface(stoneParts);
  const groundAt = (x: number, z: number) => rock.ray([x, 2, z], [0, -1, 0])!.at.y;
  const Y0 = groundAt(0, 0);
  const Yb = Y0 + 0.17; // body centre height

  // ===== Skeleton =========================================================================================
  const hips = b.joint("hips", { parent: root, at: [0, Yb - 0.005, -0.17], aim: [0, Yb, -0.02], role: "spine" });
  const spine = b.chain("spine", catmull([[0, Yb - 0.005, -0.17], [0, Yb + 0.005, -0.02], [0, Yb + 0.01, 0.13]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const HB: [number, number, number] = [0, Yb + 0.05, 0.23];
  const neck = b.chain("neck", polyline([[0, Yb + 0.012, 0.13], HB]), { parent: chest, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[0], at: HB, dir: [0, 0, 1], role: "head" });
  const HC: [number, number, number] = [HB[0], HB[1] + 0.003, HB[2] + 0.06];
  const jaw = b.joint("jaw", { parent: head, at: [0, HC[1] - 0.03, HC[2] - 0.03], aim: [0, HC[1] - 0.034, HC[2] + 0.08], role: "jaw" });

  const tailPts = [
    [0, Yb - 0.02, -0.25],
    [0, Yb + 0.0, -0.37],
    [0, Yb + 0.08, -0.47],
    [0, Yb + 0.2, -0.51],
    [0, Yb + 0.32, -0.47],
    [0, Yb + 0.41, -0.39],
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" });

  // ===== Body =============================================================================================
  const COAT = cel(furEdge(RUST, DEEP, { level: -0.1, teeth: 0.3, period: 0.034, axis: [0, 1, 0] }));
  const rxK = keyed([0.07, 0.105, 0.108, 0.1, 0.085]);
  const ryK = keyed([0.075, 0.098, 0.102, 0.098, 0.085]);
  const bodyPath = catmull([[0, Yb - 0.02, -0.28], [0, Yb - 0.005, -0.17], [0, Yb + 0.005, -0.02], [0, Yb + 0.01, 0.13], [0, Yb + 0.03, 0.2]]);
  const body = b.sweep(bodyPath, (t) => [rxK(t), ryK(t)], { bone: [spine, hips], color: COAT, sides: 10, name: "body" });
  const neckTube = b.sweep(neck, [0.088, 0.082], { color: COAT, sides: 10, name: "neck" });
  void neckTube;

  // Haunches and shoulders: fat fluffy masses.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), cel(furEdge(RUST, DEEP, { level: -0.45, teeth: 0.3, period: 0.03 })), {
      bone: hips,
      at: [s * 0.083, Yb - 0.035, -0.19],
      scale: [0.056, 0.078, 0.1],
      name: "haunch",
    });
  }

  // Cheek-to-chest fur ruff cards and flank tufts on the body.
  const bodySkin = b.surface(body);
  const tuftTex = TUFT;
  b.cards(
    bodySkin.scatter(44, { rng: rng(21), minDist: 0.045, filter: (h) => h.n.y > -0.1 && h.at.z < 0.12 }),
    tuftTex,
    { size: [0.04, 0.055], lean: 62, bend: 25, vary: 0.25, spin: 14, rng: rng(5), color: RUST, name: "coatTufts" },
  );

  // ===== Tail =============================================================================================
  const ringBand = (s: readonly [number, number]) => Math.floor(s[0] * 10 + 0.3 * zigzag(s[1] / 36)) % 2 === 0;
  const TAILC = cel(
    paint((_p, _n, s) => {
      if (s[0] > 0.9 + 0.03 * zigzag(s[1] / 40)) return "#7a3a3f";
      return ringBand(s) ? RUST : RUST_D;
    }),
  );
  const tailR = keyed([0.045, 0.07, 0.085, 0.082, 0.062, 0.025]);
  const tailTube = b.sweep(tail, (t) => tailR(t), { color: TAILC, sides: 10, name: "tailTube" });
  const tailSkin = b.surface(tailTube);
  b.cards(
    tailSkin.scatter(56, { rng: rng(31), minDist: 0.04 }),
    tuftTex,
    { size: [0.04, 0.06], lean: 55, bend: 25, vary: 0.25, spin: 14, rng: rng(6), color: RUST, flow: [0, 0.2, 1], name: "tailTufts" },
  );
  // gold tail band
  {
    const tp = tail.at(0.52);
    b.part(new THREE.TorusGeometry(0.09, 0.0085, 5, 14), GOLD, { at: tp.at, dir: tp.tangent, axis: "z", name: "tailBand" });
    b.part(new THREE.OctahedronGeometry(0.014, 0), TEAL, { at: tp.at.clone().addScaledVector(tp.normal, 0.092), dir: tp.normal, name: "tailGem" });
  }

  // ===== Head =============================================================================================
  const FACE = cel(
    paint((p, _n) => {
      const qx = (p.x - HC[0]) / 0.086;
      const qy = (p.y - HC[1]) / 0.07;
      const qz = (p.z - HC[2]) / 0.078;
      const ax = Math.abs(qx);
      const tear =
        qz > 0.25 && qy < 0.05 && qy > -0.75 && Math.abs(ax - (0.45 + (0.05 - qy) * 0.22)) < 0.075 + 0.02 * zigzag(qy / 0.18);
      if (tear) return "#5b2c3c";
      const crown = qy > 0.18 + 0.12 * zigzag(qx / 0.28) || qz < -0.35 || (qy > -0.02 && ax < 0.1 && qz > 0.2);
      if (crown) return RUST;
      if (qy > 0.12 && ax > 0.28 && qz > 0.3 && qy < 0.34 + 0.06 * zigzag(qx / 0.3)) return "#fff4de";
      return "#fff4de";
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FACE, {
    bone: head,
    at: HC,
    scale: [0.086, 0.07, 0.078],
    name: "skull",
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: [HC[0], HC[1] - 0.02, HC[2] + 0.062],
    scale: [0.04, 0.03, 0.04],
    name: "muzzle",
  });
  const jawPart = b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: jaw,
    at: [HC[0], HC[1] - 0.042, HC[2] + 0.056],
    scale: [0.028, 0.013, 0.036],
    name: "jaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [HC[0], HC[1] - 0.0105, HC[2] + 0.1],
    scale: [0.015, 0.01, 0.011],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", { bone: head, at: [HC[0] + 0.004, HC[1] - 0.005, HC[2] + 0.108], name: "noseShine" });
  // mouth line from the nose down and out to the corners
  const mouthSkin = b.surface([muzzle, jawPart, skull]);
  for (const s of [1, -1]) {
    const pts = [
      [0, HC[1] - 0.02, HC[2] + 0.101],
      [0, HC[1] - 0.03, HC[2] + 0.1],
      [s * 0.012, HC[1] - 0.038, HC[2] + 0.096],
      [s * 0.027, HC[1] - 0.035, HC[2] + 0.082],
    ];
    b.sweep(mouthSkin.drape(polyline(pts), { lift: 0.0012 }), 0.0018, { color: INK, sides: 4, bone: head, name: "mouthLine" });
  }

  // eyes
  const EYE = animeEye({ iris: "#f0a21c", irisLight: "#ffe27a", irisDark: "#a8561a", blush: "#ff8f7a" });
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 36, 5)!;
    b.decal(skullSkin, EYE, { at: hit, dir: [s * 0.45, 0.05, 1], size: [0.047, 0.064], mirror: s > 0, name: "eye" });
  }

  // cheek tufts (cream spikes), forehead tuft, whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.spike(
        [HC[0] + s * (0.06 + i * 0.002), HC[1] - 0.006 - i * 0.015, HC[2] - 0.012 - i * 0.004],
        [s * 1, -0.18 - i * 0.12, -0.45 - i * 0.2],
        0.042 - i * 0.002,
        0.017 - i * 0.002,
        { color: CREAM, bone: head, sides: 5, name: "cheekTuft" },
      );
    }
    for (let i = 0; i < 3; i++) {
      b.spike(
        [HC[0] + s * 0.038, HC[1] - 0.024 - i * 0.005, HC[2] + 0.092],
        [HC[0] + s * (0.1 + i * 0.004), HC[1] - 0.012 - i * 0.022, HC[2] + 0.085 - i * 0.012],
        null,
        0.0018,
        { color: "#fffaf0", bone: head, sides: 3, name: "whisker" },
      );
    }
    // dark ruddy eyebrow stripe flick above each eye
    b.spike(
      [HC[0] + s * 0.032, HC[1] + 0.036, HC[2] + 0.058],
      [HC[0] + s * 0.062, HC[1] + 0.05, HC[2] + 0.04],
      null,
      0.006,
      { color: CREAM, bone: head, sides: 4, name: "brow" },
    );
  }
  for (let i = 0; i < 3; i++) {
    b.spike([HC[0] + (i - 1) * 0.016, HC[1] + 0.062, HC[2] + 0.03 - Math.abs(i - 1) * 0.008], [(i - 1) * 0.4, 0.8, 0.5], 0.032, 0.011, {
      color: cel(RUST),
      bone: head,
      sides: 5,
      name: "foretuft",
    });
  }

  // ears (separate joints, extruded rounded triangles with cream fluff inside)
  const earOutline: OutlinePoint[] = [
    [-0.036, 0],
    [0.036, 0],
    [0.04, 0.032],
    [0, 0.076],
    [-0.04, 0.032],
  ];
  for (const s of [1, -1]) {
    const earJoint = b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [HC[0] + s * 0.052, HC[1] + 0.052, HC[2] - 0.012],
      dir: [s * 0.5, 1, -0.2],
      role: "hinge",
    });
    const thick = new THREE.Vector3(1, 0, 0).cross(new THREE.Vector3(s * 0.5, 1, -0.2)).normalize();
    const earPaint = cel(
      paint((_p, n, s2) => {
        const d = n.dot(thick);
        if (d > 0.5) {
          const r = Math.hypot(s2[0] / 0.026, (s2[1] - 0.034) / 0.03);
          if (r < 0.85 + 0.25 * zigzag(s2[0] / 0.012)) return "#fff4de";
          return RUST;
        }
        if (s2[1] > 0.058) return "#7a3a3f";
        return d < -0.5 ? RUST : RUST_D;
      }),
    );
    b.extrude(earOutline, {
      at: [HC[0] + s * 0.052, HC[1] + 0.052, HC[2] - 0.012],
      x: [1, 0, 0],
      y: [s * 0.5, 1, -0.2],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 2,
      color: earPaint,
      bone: earJoint,
      name: "ear",
    });
    if (s > 0) {
      // gold ear ring with a tassel
      const ringAt: [number, number, number] = [HC[0] + 0.07, HC[1] + 0.056, HC[2] - 0.006];
      b.part(new THREE.TorusGeometry(0.011, 0.0028, 5, 10), GOLD, { bone: earJoint, at: ringAt, dir: [1, 0, 0], axis: "z", name: "earRing" });
      b.cards([frame([ringAt[0], ringAt[1] - 0.012, ringAt[2]], [0, 1, 0], [0, 0, 1])], TASSEL, {
        size: [0.016, 0.045],
        lean: 180,
        flow: [0, 0, 1],
        cross: true,
        bone: earJoint,
        name: "earTassel",
      });
    }
  }

  // dendro leaf sprout on the crown
  {
    const base = [HC[0], HC[1] + 0.064, HC[2] + 0.005];
    b.sweep(catmull([base, [0, base[1] + 0.02, base[2] + 0.004], [0.004, base[1] + 0.036, base[2] + 0.014]]), [0.004, 0.0028], {
      color: "#5fbf4e",
      bone: head,
      sides: 4,
      name: "sproutStem",
    });
    const leaf: OutlinePoint[] = [
      [0, 0],
      [0.012, 0.01],
      [0.013, 0.026],
      [0, 0.048, "sharp"],
      [-0.013, 0.026],
      [-0.012, 0.01],
    ];
    for (const s of [1, -1])
      glow(
        b.extrude(leaf, {
          at: [0.004, base[1] + 0.036, base[2] + 0.014],
          x: [1, 0, 0],
          y: [s * 0.8, 0.9, 0.3],
          thickness: 0.004,
          smoothing: 1,
          color: "#c6ff7a",
          bone: head,
          name: "sproutLeaf",
        }),
        1.1,
      );
  }

  // ===== Legs =============================================================================================
  const LEGDARK = cel(furEdge(RUST, DEEP, { by: "position", level: Yb - 0.045, teeth: 0.035, period: 0.026, along: [1, 0, 0] }));
  const legR = [0.05, 0.043, 0.036];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front leg: shoulder, elbow (back), paw
    const px = s * 0.15;
    const pz = 0.17;
    const pg = groundAt(px, pz);
    const sh: [number, number, number] = [s * 0.078, Yb - 0.02, 0.1];
    const pawT: [number, number, number] = [px, pg + 0.024, pz];
    const fl = limb(sh, pawT, [0.125, 0.125], [[s * 0.4, 0, -1]]);
    const fleg = b.chain(`legF${side}`, fl, { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `paw${side}`], role: "leg" });
    b.sweep(fleg, legR, { color: LEGDARK, sides: 8, name: "foreleg" });
    const paw = fleg.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), DEEP, { bone: paw, at: [px, pg + 0.017, pz + 0.01], scale: [0.034, 0.02, 0.04], name: "pawPad" });
    for (let i = 0; i < 4; i++) {
      const tx = px + s * (-(i - 1.5) * 0.0165);
      const tj = b.joint(`toeF${side}${i}`, {
        parent: paw,
        at: [tx, pg + 0.013, pz + 0.022],
        aim: [tx + s * (-(i - 1.5)) * 0.004, pg + 0.011, pz + 0.05],
        role: "digit",
      });
      b.capsule([tx, pg + 0.013, pz + 0.022], [tx + s * (-(i - 1.5)) * 0.004, pg + 0.012, pz + 0.045], 0.0105, { bone: tj, color: DEEP, sides: 6, name: "toe" });
      b.spike([tx + s * (-(i - 1.5)) * 0.004, pg + 0.011, pz + 0.05], [0, -0.15, 1], 0.014, 0.0048, { bone: tj, color: CLAW, sides: 4, name: "claw" });
    }
    // gold wrist band, elbow tuft
    const wp = fleg.at(0.8);
    b.part(new THREE.TorusGeometry(0.039, 0.0055, 5, 12), GOLD, { at: wp.at, dir: wp.tangent, axis: "z", name: "wristBand" });
    b.spike(fl[1].clone().add(new THREE.Vector3(s * 0.02, 0, -0.03)), [s * 0.4, 0.1, -1], 0.04, 0.016, { color: cel(RUST), bone: fleg.joints[1], sides: 5, name: "elbowTuft" });

    // hind leg: hip, knee (forward), ankle (heel), toe
    const hx = s * 0.12;
    const hz = -0.12;
    const hg = groundAt(hx, hz);
    const hp: [number, number, number] = [s * 0.083, Yb - 0.04, -0.19];
    const hl = limb(hp, [hx, hg + 0.022, hz], [0.11, 0.11, 0.08], [[s * 0.3, 0, 1]], { sole: [0, 0, 1] });
    const hleg = b.chain(`legH${side}`, hl, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
    });
    b.sweep(hleg, [0.05, 0.04, 0.03, 0.027], { color: LEGDARK, sides: 8, name: "hindleg" });
    const foot = hleg.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), DEEP, { bone: foot, at: [hx, hg + 0.019, hz + 0.004], scale: [0.032, 0.02, 0.036], name: "footPad" });
    for (let i = 0; i < 4; i++) {
      const tx = hx + s * (-(i - 1.5) * 0.0155);
      const tj = b.joint(`toeH${side}${i}`, {
        parent: foot,
        at: [tx, hg + 0.012, hz + 0.014],
        aim: [tx + s * (-(i - 1.5)) * 0.003, hg + 0.011, hz + 0.042],
        role: "digit",
      });
      b.capsule([tx, hg + 0.012, hz + 0.014], [tx + s * (-(i - 1.5)) * 0.003, hg + 0.011, hz + 0.036], 0.0098, { bone: tj, color: DEEP, sides: 6, name: "hindToe" });
      b.spike([tx + s * (-(i - 1.5)) * 0.003, hg + 0.011, hz + 0.042], [0, -0.15, 1], 0.012, 0.0045, { bone: tj, color: CLAW, sides: 4, name: "hindClaw" });
    }
  }

  // ===== Collar: teal cord, gold bell, gem, tassels ========================================================
  const collar = bodySkin.loop([0, Yb + 0.02, 0.165], { dir: [0, 0.12, 1], lift: 0.006 });
  b.sweep(collar, 0.0145, { color: TEAL, sides: 8, bone: chest, name: "collar" });
  b.sweep(bodySkin.loop([0, Yb + 0.015, 0.135], { dir: [0, 0.12, 1], lift: 0.004 }), 0.007, { color: GOLD, sides: 6, bone: chest, name: "collarTrim" });
  const front = bodySkin.around([0, Yb + 0.02, 0.165]).at(0, -22)!;
  const bellAt = front.at.clone().add(new THREE.Vector3(0, -0.012, 0.014));
  const bell = new THREE.SphereGeometry(0.02, 9, 7);
  b.part(bell, GOLD, { bone: chest, at: bellAt, name: "bell" });
  b.part(new THREE.TorusGeometry(0.0205, 0.0022, 4, 12), cel("#a56a1f"), { bone: chest, at: bellAt.clone().add(new THREE.Vector3(0, -0.004, 0)), dir: [0, 1, 0], axis: "z", name: "bellBand" });
  b.part(new THREE.SphereGeometry(0.004, 5, 4), cel("#a56a1f"), { bone: chest, at: bellAt.clone().add(new THREE.Vector3(0, -0.017, 0.015)), name: "bellHole" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.013, 0), "#5dffc9", { bone: chest, at: bellAt.clone().add(new THREE.Vector3(0, 0.026, 0.006)), name: "collarGem" }),
    1.3,
  );
  b.cards(
    [
      frame(bellAt.clone().add(new THREE.Vector3(-0.012, -0.012, 0)), [0, 1, 0], [0, 0, 1]),
      frame(bellAt.clone().add(new THREE.Vector3(0.012, -0.012, 0)), [0, 1, 0], [0, 0, 1]),
    ],
    TASSEL,
    { size: [0.018, 0.05], lean: 180, flow: [0, 0, 1], cross: true, bone: chest, name: "collarTassel" },
  );

  // ===== Stone dressing: rope, shide, runes ================================================================
  const ropeLoop = rock.loop([0, 0.19, 0], { lift: 0.006 });
  const ROPE = cel(paint((_p, _n, s) => (((((s[1] - s[0] * 15120) % 120) + 120) % 120 < 60) ? ROPE_L : ROPE_D)));
  b.sweep(ropeLoop, 0.017, { color: ROPE, sides: 8, bone: root, name: "rope" });
  const ropeFrames = [0.02, 0.12, 0.27, 0.4, 0.55, 0.68, 0.8, 0.93].map((t) => ropeLoop.at(t));
  b.cards(
    ropeFrames.map((pt) => frame([pt.x, pt.y - 0.012, pt.z], [0, 1, 0], [0, 0, 1])),
    SHIDE,
    { size: [0.05, 0.1], lean: 180, flow: [0, 0, 1], cross: true, bone: root, name: "shide" },
  );
  b.cards(
    [ropeLoop.at(0.0), ropeLoop.at(0.5)].map((pt) => frame([pt.x, pt.y - 0.012, pt.z], [0, 1, 0], [0, 0, 1])),
    TASSEL,
    { size: [0.04, 0.1], lean: 180, flow: [0, 0, 1], cross: true, bone: root, name: "ropeTassel" },
  );
  const frontHit = rock.around([0, 0.12, 0]).at(0, 3)!;
  glow(b.decal(rock, RUNE, { at: frontHit, dir: [0, 0, 1], size: [0.19, 0.19], bone: root, name: "runeFront" }), 1.2);
  const sideHit = rock.around([0, 0.12, 0]).at(90, 3)!;
  glow(b.decal(rock, RUNE_SMALL, { at: sideHit, dir: [1, 0, 0], size: [0.11, 0.11], bone: root, name: "runeSide" }), 1.1);
  const sideHit2 = rock.around([0, 0.12, 0]).at(-90, 3)!;
  glow(b.decal(rock, RUNE_SMALL, { at: sideHit2, dir: [-1, 0, 0], size: [0.11, 0.11], bone: root, name: "runeSide2" }), 1.1);

  // moss lumps, grass, flowers, hanging moss, mushrooms
  const avoid = (p: THREE.Vector3) => {
    for (const s of [1, -1]) {
      if (Math.hypot(p.x - s * 0.15, p.z - 0.17) < 0.075) return true;
      if (Math.hypot(p.x - s * 0.12, p.z + 0.1) < 0.085) return true;
    }
    return false;
  };
  const mossLump = new THREE.SphereGeometry(1, 7, 5);
  for (const h of rockAll.scatter(34, { rng: rng(41), minDist: 0.07, keepOut: avoid, filter: (hh) => hh.n.y > 0.35 })) {
    const sz = 0.02 + 0.025 * R();
    b.stick(mossLump, cel(R() > 0.5 ? MOSS_L : MOSS_M), h, { embed: 0.55, scale: [sz * 1.6, sz, sz * 1.6], bone: root, name: "mossLump" });
  }
  const grassHits = rockAll.scatter(70, { rng: rng(42), minDist: 0.045, keepOut: avoid, filter: (h) => h.n.y > 0.45 });
  b.cards(grassHits, GRASS, { size: [0.045, 0.06], vary: 0.4, spin: 180, rng: rng(43), cross: true, flow: [0, 0, 1], bone: root, name: "grass" });
  const flowerHits = rockAll.scatter(9, { rng: rng(44), minDist: 0.12, keepOut: avoid, filter: (h) => h.n.y > 0.7 });
  b.cards(flowerHits, FLOWER, { size: [0.04, 0.05], vary: 0.25, spin: 180, rng: rng(45), cross: true, flow: [0, 0, 1], bone: root, name: "flowers" });
  const dripHits = rockAll.scatter(34, { rng: rng(46), minDist: 0.06, filter: (h) => h.n.y > 0.1 && h.n.y < 0.62 && h.at.y > 0.07 });
  b.cards(
    dripHits.map((h) => frame(h.at, [0, 1, 0], [0, 0, 1])),
    HANGING_MOSS,
    { size: [0.04, 0.055], lean: 180, flow: [0, 0, 1], vary: 0.35, rng: rng(47), cross: true, bone: root, name: "hangingMoss" },
  );
  // mushrooms
  const CAP = cel(spots("#ff6f7a", "#fff4de", { size: 0.022, amount: 0.35, seed: 3 }));
  const STEM = cel("#fff0d4", "#e4c6a8");
  const mushrooms: Array<[number, number, number]> = [
    [-0.4, 0.22, 1],
    [-0.33, 0.37, 0.7],
    [0.38, -0.2, 0.85],
    [0.4, -0.37, 0.6],
  ];
  for (const [mx, mz, ms] of mushrooms) {
    const gy = rockAll.ray([mx, 2, mz], [0, -1, 0])?.at.y ?? 0.05;
    b.lathe(
      [
        [0, 0],
        [0.026 * ms, 0.002],
        [0.024 * ms, 0.014 * ms],
        [0.01 * ms, 0.028 * ms],
        [0, 0.03 * ms],
      ],
      { at: [mx, gy + 0.03 * ms - 0.002, mz], segments: 8, smoothing: 1, color: CAP, bone: root, name: "mushroomCap" },
    );
    b.capsule([mx, gy - 0.003, mz], [mx, gy + 0.034 * ms, mz], 0.007 * ms + 0.002, { color: STEM, sides: 6, bone: root, name: "mushroomStem" });
  }

  // ===== Dendro magic: floating leaves and fireflies ======================================================
  const driftLeaf: OutlinePoint[] = [
    [0, 0],
    [0.016, 0.012],
    [0.017, 0.032],
    [0, 0.06, "sharp"],
    [-0.017, 0.032],
    [-0.016, 0.012],
  ];
  const leafSpots: Array<[number, number, number]> = [
    [0.24, 0.8, -0.3],
    [-0.22, 0.72, -0.4],
    [0.3, 0.58, -0.05],
    [-0.3, 0.55, 0.12],
    [0.2, 0.68, 0.38],
    [-0.16, 0.7, 0.34],
    [0.42, 0.4, 0.2],
    [-0.45, 0.35, -0.1],
    [0.05, 0.9, -0.2],
  ];
  leafSpots.forEach((lp, i) => {
    const a = R() * Math.PI * 2;
    glow(
      b.extrude(driftLeaf, {
        at: lp,
        x: [Math.cos(a), 0.3 * (R() - 0.5), Math.sin(a)],
        y: [0.4 * (R() - 0.5), 1, 0.4 * (R() - 0.5)],
        thickness: 0.004,
        smoothing: 1,
        color: i % 3 === 0 ? "#ffe97a" : "#a6ff7a",
        bone: root,
        name: "driftLeaf",
      }),
      1.2,
    );
  });
  const flies: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.25 + 0.3 * R();
    flies.push(new THREE.SphereGeometry(0.006 + 0.003 * R(), 6, 4).translate(Math.sin(a) * rr, 0.35 + 0.5 * R(), Math.cos(a) * rr));
  }
  const fireflies = mergeGeometries(flies);
  if (fireflies) glow(b.part(fireflies, "#f2ff8a", { bone: root, at: [0, 0, 0], name: "fireflies" }), 1.6);

  return b.root;
}
