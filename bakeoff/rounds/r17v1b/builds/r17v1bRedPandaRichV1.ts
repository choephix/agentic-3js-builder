import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda with a gold-trimmed dendro charm collar, balancing on a mossy boulder with a glowing seal, mushrooms and drifting leaf sparkles.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: bright, clean anime colours, every painted tone cel-shaded with a hue-shifted shadow.

const RUST_C = "#ec5a2a";
const AMBER_C = "#f78d3a";
const CHEST_C = "#5d2c36";
const CREAM_C = "#fff2d8";
const TAIL_B_C = "#f6a65a";
const PAW_C = "#2f1a2a";
const MOSS_C = "#86d64f";
const MOSS_D = "#3f9a52";
const STONE_C = "#b3bec4";
const STONE_D = "#8d9cb4";

const RUST = cel(RUST_C);
const CREAM = cel(CREAM_C, "#f3cbb0");
const CHEST = cel(CHEST_C, "#3d1b2e");
const PAW = cel(PAW_C, "#1d1020");
const NOSE = cel("#3b2150", "#1d1020");
const GOLD = "#f4c95a";
const GOLD_D = "#b9812e";
const JADE = "#5be3a0";
const LEAF = "#74d05a";
const CLAW = "#fff6e6";

const ST = 0.22; // top of the stone: where the paws stand

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

type V3t = [number, number, number];

function tg(g: THREE.BufferGeometry, at: V3t, opts: { s?: V3t; rot?: V3t } = {}) {
  const [rx, ry, rz] = opts.rot ?? [0, 0, 0];
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...at),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * THREE.MathUtils.DEG2RAD, ry * THREE.MathUtils.DEG2RAD, rz * THREE.MathUtils.DEG2RAD)),
    new THREE.Vector3(...(opts.s ?? [1, 1, 1])),
  );
  return g.applyMatrix4(m);
}

const ball = (seg: number, rows: number) => new THREE.SphereGeometry(1, seg, rows);

/** A lumpy boulder: a lathe profile jittered by noise, flat plateau on top. */
function boulder(rx: number, rz: number, h: number, seed: number) {
  const prof = [
    [0, 0],
    [0.82, 0],
    [0.97, 0.1],
    [1.0, 0.35],
    [0.95, 0.62],
    [0.85, 0.84],
    [0.7, 0.95],
    [0.55, 1.0],
    [0, 1.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(prof, 16);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const side = v.y > 0.02 && v.y < 0.99;
    const q = new THREE.Vector3(v.x * 3, v.y * 3, v.z * 3);
    const k = side ? 1 + (noise(q, 1.1, seed) - 0.5) * 0.3 : 1;
    pos.setXYZ(i, v.x * rx * k, v.y * h + (side ? (noise(q, 0.9, seed + 3) - 0.5) * 0.03 * v.y : 0), v.z * rz * k);
  }
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "redPandaSonnet", paintSize: 2048 });
  const R = rng(11);

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, ST + 0.2, -0.2], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, ST + 0.2, -0.2],
      [0, ST + 0.205, -0.07],
      [0, ST + 0.215, 0.06],
      [0, ST + 0.22, 0.19],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, ST + 0.22, 0.19],
      [0, ST + 0.25, 0.26],
      [0, ST + 0.272, 0.325],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, ST + 0.272, 0.325], dir: [0, 0, 1], role: "head" });
  const HC = head.local({ forward: 0.05, up: 0.012 });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HC.y - 0.042, HC.z - 0.005],
    aim: [0, HC.y - 0.05, HC.z + 0.07],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, ST + 0.21, -0.24],
      [0, ST + 0.215, -0.4],
      [0, ST + 0.26, -0.55],
      [0, ST + 0.36, -0.66],
      [0, ST + 0.46, -0.7],
      [0, ST + 0.55, -0.66],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // ---- Stone --------------------------------------------------------------------------------------------------
  const stoneCoat = cel(
    paint((p, n) => {
      const ragged = (noise(p, 0.12, 5) - 0.5) * 0.9;
      const drip = (noise(new THREE.Vector3(p.x * 4, 0, p.z * 4), 0.4, 9) - 0.4) * 0.9;
      if (n.y + ragged > 0.32 || (n.y > -0.2 && p.y > 0.13 + drip * 0.1 && n.y + ragged * 0.5 > 0.05 + drip))
        return noise(p, 0.07, 3) > 0.62 ? MOSS_C : "#79c847";
      const c = cells(p, 0.17, 2);
      if (c.d2 - c.d1 < 0.07) return "#6c7a92";
      return mottle(STONE_C, "#c5ccd0", { size: 0.1, seed: 4 });
    }),
    undefined,
  );
  const stone = b.part(boulder(0.34, 0.46, ST, 21), stoneCoat, { bone: root, at: [0, 0, -0.02], flat: true, name: "stone" });
  const stoneSkin = b.surface(stone);

  // moss pillows on the rim of the plateau, drips and tufts
  const pillowGeo: THREE.BufferGeometry[] = [];
  const rimHits = stoneSkin.scatter(36, { rng: rng(5), minDist: 0.09, filter: (h) => h.n.y > 0.35 && Math.hypot(h.at.x / 0.34, (h.at.z + 0.02) / 0.46) > 0.55 });
  for (const h of rimHits) {
    const rr = 0.035 + R() * 0.03;
    pillowGeo.push(tg(ball(6, 4), [h.at.x, h.at.y + 0.002, h.at.z], { s: [rr * 1.3, rr * 0.55, rr] }));
  }
  b.part(mergeGeometries(pillowGeo), cel(MOSS_C, MOSS_D), { bone: root, at: [0, 0, 0], flat: true, name: "mossPillows" });

  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48">
      <path d="M8 48 C9 34 6 22 2 10 C10 18 15 32 17 48Z" fill="#4faa4e" stroke="#2c6b3a" stroke-width="1.2"/>
      <path d="M24 48 C26 32 30 20 38 8 C36 24 33 36 31 48Z" fill="#5fbb52" stroke="#2c6b3a" stroke-width="1.2"/>
      <path d="M14 48 C14 32 17 16 21 2 C25 16 26 34 26 48Z" fill="#8be25a" stroke="#2c6b3a" stroke-width="1.2"/>
    </svg>`,
    { size: 160 },
  );
  const tuftHits = stoneSkin.scatter(70, { rng: rng(8), minDist: 0.06, filter: (h) => h.n.y > 0.55 && Math.hypot(h.at.x / 0.34, (h.at.z + 0.02) / 0.46) > 0.6 });
  b.cards(tuftHits, tuft, { size: [0.04, 0.05], lean: 20, flow: [0, 0, 1], vary: 0.4, rng: rng(3), spin: 180, cross: true, bone: root });

  // glowing dendro seal laid flat under the paws
  const SEAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="94" fill="none" stroke="#f4c95a" stroke-width="3"/>
      <circle cx="100" cy="100" r="86" fill="none" stroke="#5be3a0" stroke-width="2"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#f4c95a" stroke-width="2.4" stroke-dasharray="10 6"/>
      ${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45} 100 100)"><path d="M100 18 C108 32 108 44 100 56 C92 44 92 32 100 18Z" fill="#5be3a0" stroke="#f4c95a" stroke-width="2"/><circle cx="100" cy="68" r="3" fill="#f4c95a"/></g>`).join("")}
      <path d="M100 52 L108 92 L148 100 L108 108 L100 148 L92 108 L52 100 L92 92Z" fill="none" stroke="#5be3a0" stroke-width="2.4"/>
      <circle cx="100" cy="100" r="10" fill="none" stroke="#f4c95a" stroke-width="2.4"/>
    </svg>`,
    { size: 512 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: root,
      at: [0, ST + 0.004, 0.0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: SEAL,
      name: "seal",
    }),
    0.9,
  );

  // pebbles, mushrooms and sprouts at the foot of the stone
  const pebbles: [number, number, number, number][] = [
    [0.4, 0.3, 0.07, 0.04],
    [-0.42, 0.2, 0.09, 0.05],
    [0.46, -0.2, 0.06, 0.035],
    [-0.38, -0.34, 0.08, 0.045],
    [0.12, 0.52, 0.06, 0.035],
    [-0.2, 0.5, 0.05, 0.03],
  ];
  pebbles.forEach(([x, z, w, h], i) => {
    b.part(tg(ball(7, 5), [0, 0, 0], { s: [w, h, w * 0.8] }), cel(i % 2 ? STONE_C : "#a5b0be", STONE_D), {
      bone: root,
      at: [x, h * 0.55, z],
      rotation: [0, i * 47, 0],
      flat: true,
      name: `pebble${i}`,
    });
    b.part(tg(ball(6, 4), [0, 0, 0], { s: [w * 0.9, h * 0.35, w * 0.7] }), cel(MOSS_C, MOSS_D), {
      bone: root,
      at: [x, h * 1.0, z],
      rotation: [0, i * 47, 0],
      flat: true,
      name: `pebbleMoss${i}`,
    });
  });
  const floorTufts = [
    [0.36, 0.42], [-0.3, 0.42], [0.5, 0.05], [-0.5, -0.1], [0.3, -0.5], [-0.24, -0.5], [0.0, 0.58], [0.52, 0.34], [-0.52, 0.34], [0.1, -0.62],
  ].map(([x, z]) => frame([x, 0, z], [0, 1, 0]));
  b.cards(floorTufts, tuft, { size: [0.07, 0.08], lean: 10, flow: [0, 0, 1], vary: 0.4, rng: rng(12), spin: 180, cross: true, bone: root });

  const capPaint = cel(furEdge("#ff9a5a", "#f1521f", { by: "position", level: 0.02, teeth: 0.01, period: 0.02, along: [1, 0, 0] }));
  const SHROOMS: [number, number, number][] = [
    [0.44, 0.08, 1],
    [0.52, -0.02, 0.7],
    [-0.4, 0.38, 0.85],
  ];
  SHROOMS.forEach(([x, z, k], i) => {
    const base = new THREE.Vector3(x, 0, z);
    b.rod(base.clone().add(new THREE.Vector3(0, -0.002, 0)), base.clone().add(new THREE.Vector3(0, 0.045 * k, 0)), [0.012 * k, 0.009 * k], { color: CREAM, bone: root, sides: 6, name: `stalk${i}` });
    b.lathe(
      [
        [0, 0],
        [0.034 * k, 0.002],
        [0.036 * k, 0.012 * k],
        [0.026 * k, 0.03 * k],
        [0.01 * k, 0.04 * k],
        [0, 0.042 * k],
      ],
      { at: [x, 0.04 * k, z], bone: root, segments: 9, color: capPaint, name: `cap${i}` },
    );
    for (let j = 0; j < 4; j++) {
      const a = j * 1.57 + i;
      b.part(ball(5, 4), CLAW, {
        bone: root,
        at: [x + Math.cos(a) * 0.02 * k, 0.04 * k + 0.027 * k + 0.003, z + Math.sin(a) * 0.02 * k],
        scale: [0.006 * k, 0.003 * k, 0.006 * k],
        name: `spot${i}${j}`,
      });
    }
  });

  // little sprout with two leaves, growing out of a crack in the stone
  const leafOutline: [number, number][] = [
    [0, 0],
    [0.014, 0.012],
    [0.016, 0.034],
    [0, 0.06],
    [-0.016, 0.034],
    [-0.014, 0.012],
  ];
  b.sweep(catmull([[-0.3, 0.07, 0.3], [-0.3, 0.11, 0.3], [-0.29, 0.14, 0.3]]), [0.006, 0.004], { color: MOSS_D, bone: root, name: "sproutStem" });
  for (const s of [1, -1]) {
    b.extrude(leafOutline, {
      at: [-0.29, 0.14, 0.3],
      x: [Math.cos(0.8) * s, 0, 0],
      y: [Math.sin(0.8) * s * 0.8, Math.cos(0.8) * 0.9, 0.2],
      thickness: 0.004,
      smoothing: 1,
      color: cel(LEAF, "#3fa65a"),
      bone: root,
      name: s > 0 ? "sproutLeafL" : "sproutLeafR",
    });
  }

  // ---- Panda body ---------------------------------------------------------------------------------------------
  const flank = furEdge(AMBER_C, CHEST_C, { level: -0.55, teeth: 0.22, period: 0.034, along: [0, 0, 1] });
  const coat = cel(furEdge(RUST_C, flank, { level: 0.3, teeth: 0.22, period: 0.034, along: [0, 0, 1] }));
  const body = b.sweep(spine, [0.068, 0.082, 0.088, 0.085, 0.076], { color: coat, name: "body" });
  const neckSweep = b.sweep(neck, [0.074, 0.066], { color: cel(furEdge(RUST_C, CREAM_C, { level: -0.35, teeth: 0.25, period: 0.03, along: [1, 0, 0] })), name: "neck" });

  // chest bib + belly fluff tufts
  const bellySkin = b.surface(body);
  const tufts = bellySkin.scatter(26, { rng: rng(21), minDist: 0.07, filter: (h) => h.n.y > -0.7 && h.n.y < 0.15 });
  for (const h of tufts) b.stick(new THREE.ConeGeometry(0.016, 0.05, 5), cel(AMBER_C), h, { embed: 0.15, flow: [0, 0, -1] });

  // tail with ringed bands
  const tailRings = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.9 + 0.025 * zigzag(s[1] / 60)) return "#3d1e30";
      const x = t * 8.5 + 0.22 * zigzag(s[1] / 70);
      if (Math.abs(x - Math.round(x)) < 0.035) return "#8a3a2e";
      return Math.floor(x) % 2 === 0 ? RUST_C : TAIL_B_C;
    }),
  );
  const tailSweep = b.sweep(tail, [0.05, 0.068, 0.088, 0.09, 0.072, 0.034], { color: tailRings, name: "tail" });
  b.along(tailSweep, 9, (at) => {
    b.spike(at, at, 0.04, 0.02, { color: cel(RUST_C), sides: 5 });
  });

  // ---- Legs ---------------------------------------------------------------------------------------------------
  const legPaint = cel(
    paint((p) => (p.y < ST + 0.07 ? "#3a1f2d" : CHEST_C)),
  );
  const pawGeoToes: THREE.BufferGeometry[][] = [];
  const pawGeoClaws: THREE.BufferGeometry[][] = [];
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front legs
    const fpts = limb([s * 0.072, ST + 0.2, 0.14], [s * 0.092, ST + 0.032, 0.175], [0.1, 0.09], [0, 0, -1]);
    const front = b.chain(`front${side}`, fpts, { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "leg" });
    legs[`front${side}`] = front;
    b.sweep(front, [0.04, 0.03, 0.027], { color: legPaint, name: `legF${side}` });
    // hind legs
    const hpts = limb([s * 0.076, ST + 0.2, -0.2], [s * 0.098, ST + 0.032, -0.2], [0.11, 0.1], [0, 0, 1]);
    const hind = b.chain(`hind${side}`, hpts, { parent: hips, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" });
    legs[`hind${side}`] = hind;
    b.sweep(hind, [0.052, 0.036, 0.029], { color: legPaint, name: `legH${side}` });
    b.part(ball(10, 7), cel(CHEST_C), { bone: hind.joints[0], at: [s * 0.088, ST + 0.2, -0.2], scale: [0.062, 0.075, 0.082], name: `haunch${side}` });
    b.part(ball(10, 7), cel(RUST_C), { bone: hind.joints[0], at: [s * 0.094, ST + 0.225, -0.2], scale: [0.056, 0.07, 0.085], name: `haunchFur${side}` });
  }
  for (const key of Object.keys(legs)) {
    const leg = legs[key];
    const tip = leg.tip!;
    const P = tip.at;
    const px = P.x;
    const pz = P.z + 0.008;
    b.part(ball(9, 6), PAW, { bone: tip, at: [px, ST + 0.017, pz], scale: [0.034, 0.02, 0.042], name: `paw.${key}` });
    const toes: THREE.BufferGeometry[] = [];
    const claws: THREE.BufferGeometry[] = [];
    [-0.024, -0.008, 0.008, 0.024].forEach((o, i) => {
      const zf = i === 1 || i === 2 ? 0.037 : 0.031;
      toes.push(tg(ball(6, 4), [px + o, ST + 0.011, pz + zf], { s: [0.0105, 0.009, 0.012] }));
      claws.push(tg(new THREE.ConeGeometry(0.0038, 0.014, 5), [px + o, ST + 0.008, pz + zf + 0.016], { rot: [82, 0, 0] }));
    });
    pawGeoToes.push(toes);
    pawGeoClaws.push(claws);
    b.part(mergeGeometries(toes), PAW, { bone: tip, at: [0, 0, 0], name: `toes.${key}` });
    b.part(mergeGeometries(claws), CLAW, { bone: tip, at: [0, 0, 0], name: `claws.${key}` });
    // ankle tufts
    b.stick(new THREE.ConeGeometry(0.014, 0.045, 5), cel(CHEST_C), b.surface(leg.joints[1]).nearest([px, ST + 0.08, pz - 0.02]), { embed: 0.2 });
  }

  // ---- Head ---------------------------------------------------------------------------------------------------
  const faceCoat = cel(
    paint((p) => {
      const qx = p.x - HC.x;
      const qy = p.y - HC.y;
      const qz = p.z - HC.z;
      const ax = Math.abs(qx);
      // dark tear marks running from the eye to the mouth corner
      const u = (-qy - 0.004) / 0.038;
      if (qz > 0.025 && u > 0 && u < 1 && Math.abs(ax - (0.032 + 0.014 * u)) < 0.0055 * (1 - 0.55 * u)) return "#9a3326";
      // cream cheeks, zig-zag edged
      if (qy < -0.008 + 0.016 * zigzag((ax + qz * 0.4) / 0.032)) return CREAM_C;
      // darker rust circle over the brow
      if (qy > 0.0 && qz > 0.03 && Math.hypot(ax - 0.035, qy - 0.02) < 0.016) return "#d9481f";
      return RUST_C;
    }),
  );
  const skull = b.part(ball(14, 10), faceCoat, { bone: head, at: [HC.x, HC.y, HC.z], scale: [0.088, 0.073, 0.078], name: "skull" });
  const SN: V3t = [0, HC.y - 0.024, HC.z + 0.066];
  const snout = b.part(ball(10, 7), CREAM, { bone: head, at: SN, scale: [0.039, 0.031, 0.04], name: "snout" });
  b.part(ball(7, 5), NOSE, { bone: head, at: [0, SN[1] + 0.008, SN[2] + 0.035], scale: [0.017, 0.011, 0.012], name: "nose" });
  b.part(ball(5, 4), "#fff7f0", { bone: head, at: [-0.004, SN[1] + 0.012, SN[2] + 0.043], scale: [0.004, 0.0025, 0.002], name: "noseShine" });
  b.part(ball(10, 6), CREAM, { bone: jaw, at: [0, HC.y - 0.065, HC.z + 0.05], scale: [0.03, 0.015, 0.034], name: "chin" });
  // mouth line draped over the snout
  const snoutSkin = b.surface([snout]);
  for (const s of [1, -1]) {
    const rough = [
      [0, SN[1] - 0.001, SN[2] + 0.045],
      [0, SN[1] - 0.012, SN[2] + 0.04],
      [s * 0.012, SN[1] - 0.018, SN[2] + 0.034],
      [s * 0.026, SN[1] - 0.016, SN[2] + 0.022],
    ];
    b.sweep(snoutSkin.drape(catmull(rough), { lift: 0.0012 }), 0.0013, { color: INK, caps: "round", bone: head, sides: 4, name: s > 0 ? "mouthL" : "mouthR" });
  }

  // eyes: big anime eyes decalled on the skull
  const EYE = animeEye({ iris: "#2fc9a0", irisLight: "#b5ffd9", irisDark: "#1a5f6e", brow: false, blush: "#ff8f7a" });
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 31, 5)!;
    b.decal(skullSkin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0, bone: head, name: s > 0 ? "eyeL" : "eyeR" });
    // cream brow spot above each eye
    const brow = skullSkin.around(HC).at(s * 29, 33)!;
    b.stick(new THREE.SphereGeometry(0.012, 8, 6).scale(1.5, 0.55, 1), CREAM, brow, { embed: 0.3, spin: s * 20, bone: head });
  }

  // cheek ruff: cream fur spikes sweeping out and back
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const hit = skullSkin.around(HC).at(s * (70 + i * 7), -22 + (i % 2) * 8)!;
      b.stick(new THREE.ConeGeometry(0.014, 0.05 + (i % 2) * 0.012, 5), CREAM, hit, { embed: 0.2, flow: [0, -0.3, -1], bone: head });
    }
  }

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJ = b.joint(`ear${side}`, {
      parent: head,
      at: head.local({ left: s * 0.056, up: 0.055, back: 0.0 }),
      aim: head.local({ left: s * 0.07, up: 0.12, back: -0.01 }),
      role: "hinge",
    });
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, 0, -s * 0.5, "ZXY"));
    const ex = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const ey = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const outline: [number, number][] = [
      [-0.038, 0],
      [-0.042, 0.03],
      [-0.024, 0.062],
      [0, 0.074],
      [0.024, 0.062],
      [0.042, 0.03],
      [0.038, 0],
    ];
    const ear = b.extrude(outline, {
      at: earJ.at,
      x: ex.toArray() as V3t,
      y: ey.toArray() as V3t,
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: cel(
        paint((_p, _n, st) => (st[1] > 0.058 ? "#5a2230" : RUST_C)),
      ),
      bone: earJ,
      name: `ear${side}`,
    });
    const inner: [number, number][] = [
      [-0.026, 0.004],
      [-0.028, 0.028],
      [-0.014, 0.05],
      [0, 0.058],
      [0.014, 0.05],
      [0.028, 0.028],
      [0.026, 0.004],
    ];
    b.extrude(inner, {
      at: ear.local([0, 0, 0.0075]),
      x: ex.toArray() as V3t,
      y: ey.toArray() as V3t,
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: cream2(),
      bone: earJ,
      name: `earInner${side}`,
    });
    for (let i = 0; i < 3; i++) {
      b.spike(ear.local([-0.014 + i * 0.014, 0.008, 0.012]), ey.toArray() as V3t, 0.026, 0.007, { color: cel(CREAM_C, "#f3cbb0"), sides: 4, bone: earJ });
    }
  }

  // whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.22;
      const base = [s * 0.034, SN[1] - 0.004 - i * 0.003, SN[2] + 0.025];
      const tip = [s * (0.1 + 0.01 * (1 - Math.abs(i - 1))), SN[1] + 0.005 + a * 0.12, SN[2] - 0.0 + a * 0.12];
      b.sweep(catmull([base, [s * 0.065, base[1] + a * 0.045 + 0.004, base[2] - 0.005], tip]), [0.0016, 0.0006], { color: "#fffaf0", bone: head, sides: 3, name: `whisker${s}${i}` });
    }
  }

  // ---- Collar with a dendro charm ------------------------------------------------------------------------------
  const collarMid = neck.at(0.35);
  for (const [t, r, col, nm] of [
    [0.35, 0.013, "#3fb88f", "collar"],
    [0.18, 0.0055, GOLD, "collarTrimA"],
    [0.52, 0.0055, GOLD, "collarTrimB"],
  ] as [number, number, string, string][]) {
    const ring = b.ring(neck.at(t), { count: 10, radius: 0.074 + (t < 0.4 ? 0 : -0.003) });
    b.sweep(catmull(ring.items, { closed: true }), r, { color: col, bone: neck.joints[0], name: nm, sides: 6 });
  }
  const chest = b.surface(body).ray([0, ST + 0.22, 0.5], [0, 0, -1]);
  if (!chest) throw new Error("no chest hit");
  const pend = chest.at.clone().add(new THREE.Vector3(0, -0.01, 0.003));
  void collarMid;
  const frameOutline: [number, number, "sharp"?][] = [
    [0, 0.034, "sharp"],
    [0.02, 0.01],
    [0.017, -0.012],
    [0, -0.03, "sharp"],
    [-0.017, -0.012],
    [-0.02, 0.01],
  ];
  b.extrude(frameOutline as [number, number][], {
    at: [pend.x, pend.y, pend.z],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.01,
    bevel: 0.0025,
    smoothing: 1,
    color: GOLD,
    bone: spine.joints[2],
    name: "pendantFrame",
  });
  glow(
    b.extrude(
      [
        [0, 0.02, "sharp"],
        [0.011, 0.003],
        [0, -0.018, "sharp"],
        [-0.011, 0.003],
      ] as [number, number][],
      { at: [pend.x, pend.y - 0.002, pend.z + 0.0055], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, bevel: 0.0015, smoothing: 0, color: JADE, bone: spine.joints[2], name: "pendantGem" },
    ),
    1.2,
  );
  b.part(ball(6, 4), GOLD, { bone: spine.joints[2], at: [pend.x, pend.y + 0.036, pend.z + 0.002], scale: [0.007, 0.007, 0.006], name: "pendantLoop" });
  const TASSEL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64">
      <rect x="10" y="0" width="4" height="10" fill="#f4c95a" stroke="#b9812e" stroke-width="1"/>
      <path d="M4 10 L20 10 L22 62 L16 52 L12 64 L8 52 L2 62Z" fill="#3fb88f" stroke="#1a5f6e" stroke-width="1.4"/>
      <path d="M12 12 L12 56" stroke="#8ef0c4" stroke-width="2"/>
      <rect x="3" y="12" width="18" height="3" fill="#f4c95a"/>
    </svg>`,
    { size: 128 },
  );
  b.cards(
    [frame([pend.x - 0.008, pend.y - 0.026, pend.z + 0.006], [0, 1, 0]), frame([pend.x + 0.008, pend.y - 0.026, pend.z + 0.006], [0, 1, 0])],
    TASSEL,
    { size: [0.016, 0.042], lean: 180, flow: [0, 0, 1], bone: spine.joints[2] },
  );

  // bell gold bead rings on the tail
  const tailRim = b.ring(tail.at(0.78), { count: 10, radius: 0.092 });
  b.sweep(catmull(tailRim.items, { closed: true }), 0.006, { color: GOLD, bone: tail.joints[3], name: "tailRing", sides: 6 });

  // ---- Floating dendro sparkles ---------------------------------------------------------------------------------
  const star = (s: number): [number, number, "sharp"][] => [
    [0, 0.03 * s, "sharp"],
    [0.0065 * s, 0.0065 * s, "sharp"],
    [0.02 * s, 0, "sharp"],
    [0.0065 * s, -0.0065 * s, "sharp"],
    [0, -0.03 * s, "sharp"],
    [-0.0065 * s, -0.0065 * s, "sharp"],
    [-0.02 * s, 0, "sharp"],
    [-0.0065 * s, 0.0065 * s, "sharp"],
  ];
  const sparks: [number, number, number, number, number][] = [
    [0.24, 0.66, 0.1, 1.2, 0],
    [-0.26, 0.74, -0.25, 1.0, 40],
    [0.2, 0.8, -0.38, 0.8, 70],
    [-0.2, 0.6, 0.3, 0.8, 20],
    [0.0, 0.84, 0.18, 0.7, 10],
    [-0.1, 0.72, -0.52, 0.6, 55],
  ];
  sparks.forEach(([x, y, z, s, a], i) => {
    const ca = Math.cos((a * Math.PI) / 180);
    const sa = Math.sin((a * Math.PI) / 180);
    glow(
      b.extrude(star(s), { at: [x, y, z], x: [ca, sa, 0], y: [-sa, ca, 0], thickness: 0.006, bevel: 0.0015, color: i % 2 ? "#d9ffa8" : "#aaf5cf", bone: root, name: `spark${i}` }),
      1.4,
    );
  });
  const floatLeaf = (s: number): [number, number][] => [
    [0, 0],
    [0.014 * s, 0.012 * s],
    [0.017 * s, 0.032 * s],
    [0, 0.06 * s],
    [-0.017 * s, 0.032 * s],
    [-0.014 * s, 0.012 * s],
  ];
  const leaves: [number, number, number, number, number][] = [
    [0.3, 0.52, 0.2, 1.0, 30],
    [-0.3, 0.56, -0.1, 0.9, -50],
    [0.14, 0.62, -0.5, 0.8, 120],
    [-0.22, 0.46, 0.46, 0.8, 80],
  ];
  leaves.forEach(([x, y, z, s, a], i) => {
    const ca = Math.cos((a * Math.PI) / 180);
    const sa = Math.sin((a * Math.PI) / 180);
    const l = b.extrude(floatLeaf(s), { at: [x, y, z], x: [ca, 0.2, sa], y: [-sa * 0.4, 1, ca * 0.4], thickness: 0.004, smoothing: 1, color: cel(LEAF, "#3fa65a"), bone: root, name: `floatLeaf${i}` });
    b.rod(l.local([0, 0.004, 0]), l.local([0, 0.04 * s, 0.001]), 0.0012, { color: "#2f8a4a", bone: root, sides: 3, name: `leafVein${i}` });
  });

  return b.root;
}

function cream2() {
  return cel("#fff9ea", "#f6d8c6");
}
