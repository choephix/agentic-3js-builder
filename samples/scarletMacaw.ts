import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { catmull, polyline } from "../src/path";
import { cel, furEdge, animeEye, INK } from "../kits/toon";
import { glow } from "../kits/glow";

const RED = cel("#e73536", "#a51f40");
const RED_DARK = cel("#b51f35", "#681b45");
const YELLOW = cel("#ffd447", "#d88928");
const BLUE = cel("#2d8be8", "#2452a4");
const BLUE_DARK = cel("#184b9f", "#182b70");
const WHITE = cel("#fff5e6", "#d9c5d8");
const BLACK = cel("#25243a", "#111329");
const IVORY = cel("#f4d7ad", "#b98174");
const GOLD = cel("#f6b52f", "#9d4c2a");
const CYAN = "#5be7ff";

const COAT = furEdge(RED, RED_DARK, { level: -0.18, teeth: 0.08, period: 0.08, ink: INK, inkWidth: 0.025 });
const WING_COAT = furEdge(BLUE, BLUE_DARK, { level: -0.05, teeth: 0.04, period: 0.065, ink: INK, inkWidth: 0.018 });

export const meta = {
  name: "Scarlet Macaw",
  description: "A scarlet macaw with broad open wings, layered flight feathers, expressive cel-shaded eyes, and jewel-like Genshin-inspired accents.",
  style: "Genshin Impact",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "scarletMacaw", detail: 1, paintSize: 1024 });

  // Skeleton first: grounded hips, articulated torso, head, tail, wings, legs and digits.
  const hips = b.joint("hips", { at: [0, 0.78, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, 0],
      [0, 0.98, 0.01],
      [0, 1.2, 0.05],
      [0, 1.4, 0.11],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "chest", "neckBase"], role: "spine", count: 3 },
  );
  const head = b.joint("head", { parent: spine.tip!, at: [0, 1.57, 0.17], dir: [0, 0.12, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.52, 0.25], dir: [0, -0.08, 1], role: "jaw", group: "head" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.84, -0.05],
      [0, 0.67, -0.34],
      [0, 0.54, -0.72],
      [0, 0.46, -1.08],
      [0, 0.42, -1.34],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailFan", "tailTip", "tailEnd"], role: "tail", count: 4 },
  );

  const wingChains: { side: number; chain: Chain }[] = [];
  for (const side of [1, -1]) {
    const wing = b.chain(
      side > 0 ? "wingL" : "wingR",
      catmull([
        [side * 0.19, 1.28, 0.04],
        [side * 0.43, 1.39, 0.06],
        [side * 0.7, 1.47, 0.1],
        [side * 0.93, 1.36, 0.08],
      ]),
      {
        parent: spine.joints[2],
        names: side > 0 ? ["shoulderL", "elbowL", "wristL", "wingTipL"] : ["shoulderR", "elbowR", "wristR", "wingTipR"],
        role: "wing",
        count: 3,
      },
    );
    wingChains.push({ side, chain: wing });
  }

  const legChains: { side: number; chain: Chain }[] = [];
  for (const side of [1, -1]) {
    const legPoints = [
      [side * 0.115, 0.82, 0.01],
      [side * 0.14, 0.58, 0.04],
      [side * 0.15, 0.29, 0.09],
      [side * 0.15, 0.12, 0.18],
    ] as number[][];
    const leg = b.chain(
      side > 0 ? "legL" : "legR",
      legPoints,
      {
        parent: hips,
        names: side > 0 ? ["hipL", "kneeL", "ankleL", "footL"] : ["hipR", "kneeR", "ankleR", "footR"],
        role: "leg",
        count: 3,
      },
    );
    legChains.push({ side, chain: leg });
    const ankle = leg.at(0.78).at;
    const foot = leg.tip!.at;
    const toeData = [
      { name: "toeA", tip: [side * 0.2, 0.035, 0.37] },
      { name: "toeB", tip: [side * 0.1, 0.03, 0.42] },
      { name: "toeC", tip: [side * 0.2, 0.035, -0.03] },
      { name: "toeD", tip: [side * 0.1, 0.03, -0.08] },
    ];
    for (const td of toeData) {
      const prefix = `${td.name}${side > 0 ? "L" : "R"}`;
      const toe = b.chain(prefix, [ankle, foot, td.tip], {
        parent: leg.tip!,
        names: [`${prefix}Base`, `${prefix}Tip`],
        role: "digit",
        count: 2,
      });
      b.sweep(toe, [0.024, 0.011], { color: BLACK, section: { ngon: 6 }, caps: "round", name: prefix });
    }
  }

  // Main low-poly masses with saturated cel shading.
  const body = b.sweep(spine, (t) => 0.19 - t * 0.055, {
    color: COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "scarletBody",
  });
  b.part(new THREE.SphereGeometry(0.24, 12, 9), COAT, {
    bone: spine.joints[2],
    at: [0, 1.16, 0.1],
    scale: [0.9, 1.14, 0.95],
    name: "breast",
  });
  const headPart = b.part(new THREE.SphereGeometry(0.19, 14, 10), COAT, {
    bone: head,
    at: [0, 1.59, 0.2],
    scale: [0.95, 1.06, 0.92],
    name: "headMass",
  });
  b.part(new THREE.SphereGeometry(0.135, 12, 8), WHITE, {
    bone: head,
    at: [0, 1.545, 0.315],
    scale: [1.05, 0.95, 0.55],
    name: "whiteCheek",
  });

  // White cheek eye decals and dark lashes make the expression read at distance.
  const eyeTexture = animeEye({ iris: "#4edbff", irisLight: "#d9ffff", irisDark: "#1765c9", brow: true, blush: "#ff7187", size: 256 });
  const headSurface = b.surface(headPart);
  for (const side of [1, -1]) {
    const hit = headSurface.around(headPart.at).at(side * 42, 5);
    if (hit) {
      b.decal(headPart, eyeTexture, {
        at: hit,
        size: [0.085, 0.11],
        dir: [side * 0.28, 0.02, 0.96],
        mirror: side > 0,
        lift: 0.003,
        name: side > 0 ? "eyeL" : "eyeR",
      });
    }
  }

  // Layered hooked beak, separated into upper and lower jaw for posing.
  b.lathe(
    [
      [0, 0],
      [0.105, 0.01],
      [0.12, 0.065],
      [0.105, 0.13],
      [0.07, 0.18],
      [0.025, 0.205],
      [0, 0.205],
    ],
    { at: head.local({ forward: 0.16, up: 0.015 }), axis: [0, 0, 1], segments: 10, smoothing: 1, color: BLACK, bone: head, name: "upperBeak" },
  );
  b.lathe(
    [
      [0, 0],
      [0.085, 0.01],
      [0.095, 0.055],
      [0.055, 0.09],
      [0.02, 0.1],
      [0, 0.1],
    ],
    { at: jaw.local({ forward: 0.16, up: -0.015 }), axis: [0, 0, 1], segments: 9, smoothing: 1, color: IVORY, bone: jaw, name: "lowerBeak" },
  );
  b.sweep(polyline([[0, 1.5, 0.36], [0, 1.495, 0.39], [0, 1.49, 0.4]]), 0.008, { color: INK, bone: jaw, caps: "round", name: "beakSeam" });

  // Neck ruff and cheek feathers: simple primitives with a zig-zag painted edge.
  const ruff = b.surface(body).around([0, 1.26, 0.05]).at(0, 70);
  if (ruff) {
    b.stick(new THREE.ConeGeometry(0.21, 0.24, 8), furEdge(YELLOW, RED_DARK, { level: -0.12, teeth: 0.08, period: 0.12 }), ruff, { embed: 0.32, name: "goldNeckRuff" });
  }
  for (const side of [1, -1]) {
    const crest = b.extrude(
      [[0, 0], [0.06, 0.1], [0.015, 0.23], [-0.065, 0.17], [-0.085, 0.04]],
      { at: head.local({ left: side * 0.08, up: 0.08, back: 0.02 }), x: [0, 0, -1], y: [side * 0.25, 0.97, 0], thickness: 0.018, bevel: 0.006, smoothing: 1, color: RED, bone: head, name: side > 0 ? "crestL" : "crestR" },
    );
    b.part(new THREE.SphereGeometry(0.018, 7, 5), GOLD, { at: crest.local([0.005, 0.15, 0.012]), bone: head, name: side > 0 ? "crestGemL" : "crestGemR" });
  }

  // Legs are charcoal, with warm gold anklets and four separated zygodactyl toes.
  for (const { side, chain: leg } of legChains) {
    b.sweep(leg, [0.055, 0.04], { color: BLACK, section: { ngon: 6 }, caps: "round", name: side > 0 ? "legL" : "legR" });
    b.along(leg, 3, (at) => b.part(new THREE.CylinderGeometry(0.063, 0.063, 0.018, 8), GOLD, { frame: at, name: side > 0 ? "ankletL" : "ankletR" }));
  }
  for (const { side, chain: wing } of wingChains) {
    b.sweep(wing, (t) => 0.115 - t * 0.07, {
      color: WING_COAT,
      section: { ngon: 6 },
      caps: "round",
      name: side > 0 ? "wingArmL" : "wingArmR",
    });
    // Red shoulder cover and a bright gold wing bar.
    b.sweep(polyline([
      [side * 0.2, 1.29, 0.06],
      [side * 0.45, 1.39, 0.08],
      [side * 0.63, 1.44, 0.1],
    ]), [0.14, 0.075], { color: RED, bone: wing.joints[0], section: { ngon: 6 }, caps: "round", name: side > 0 ? "wingShoulderL" : "wingShoulderR" });
    const bar = b.sweep(polyline([
      [side * 0.34, 1.36, 0.15],
      [side * 0.56, 1.43, 0.18],
      [side * 0.75, 1.43, 0.14],
    ]), 0.018, { color: YELLOW, bone: wing.joints[1], caps: "round", name: side > 0 ? "goldWingBarL" : "goldWingBarR" });
    b.along(bar, 4, (at) => b.part(new THREE.SphereGeometry(0.021, 7, 5), GOLD, { frame: at, name: side > 0 ? "wingRivetL" : "wingRivetR" }));

    // Primary feathers: each has a small digit bone and a broad, tapered plated silhouette.
    const base = wing.tip!.at;
    const feathers = [
      { dx: 0.28, dy: -0.06, dz: -0.04, len: 0.52, w: 0.13 },
      { dx: 0.18, dy: -0.02, dz: -0.1, len: 0.6, w: 0.14 },
      { dx: 0.08, dy: 0.01, dz: -0.14, len: 0.64, w: 0.15 },
      { dx: -0.04, dy: 0.05, dz: -0.16, len: 0.59, w: 0.14 },
      { dx: -0.15, dy: 0.08, dz: -0.12, len: 0.5, w: 0.12 },
    ];
    feathers.forEach((f, i) => {
      const root: [number, number, number] = [base.x + side * f.dx, base.y + f.dy, base.z + f.dz];
      const tip: [number, number, number] = [root[0] + side * f.len, root[1] - 0.17 + i * 0.012, root[2] - 0.08 - i * 0.025];
      const featherName = `${side > 0 ? "primaryL" : "primaryR"}${i + 1}`;
      const digit = b.chain(`${featherName}Bone`, [root, tip], { parent: wing.tip!, names: [`${featherName}Base`, `${featherName}Tip`], role: "digit", count: 2 });
      b.sweep(digit, [0.035, 0.009], { color: BLUE_DARK, section: { ngon: 5 }, caps: "point", name: featherName });
      const dx = tip[0] - root[0];
      const dy = tip[1] - root[1];
      const dz = tip[2] - root[2];
      const length = Math.hypot(dx, dy, dz);
      const xDir: [number, number, number] = [dx / length, dy / length, dz / length];
      const plate = b.extrude(
        [[0, 0], [length * 0.84, -0.015], [length, 0.03], [length * 0.82, f.w], [length * 0.22, f.w * 0.92], [0, f.w * 0.45]],
        { at: root, x: xDir, y: [0, 1, 0], thickness: [0.025, 0.012], bevel: 0.008, smoothing: 1, color: side > 0 ? BLUE : BLUE_DARK, bone: digit.joints[0], name: `${featherName}Plate` },
      );
      // Scarlet coverts sit at each feather root, plus a turquoise jewel on the outermost quill.
      b.stick(new THREE.SphereGeometry(0.048, 8, 6), RED, digit.joints[0], { embed: 0.2, name: `${featherName}Covert` });
      if (i === 2) glow(b.part(new THREE.OctahedronGeometry(0.026, 0), CYAN, { at: plate.local([length * 0.22, f.w * 0.6, 0.02]), bone: digit.joints[0]!, name: `${featherName}Gem` }), 1.5);
    });
  }

  // Tail fan: red central shaft with alternating blue and scarlet long blades.
  b.sweep(tail, [0.105, 0.018], { color: RED_DARK, section: { ngon: 7 }, caps: "point", name: "tailShaft" });
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const start = tail.at(0.38 + i * 0.08).at;
      const tip: [number, number, number] = [side * (0.08 + i * 0.045), 0.24 + i * 0.05, -1.64 - i * 0.12];
      const path = catmull([start, [tip[0] * 0.7, tip[1] + 0.03, tip[2] + 0.25], tip]);
      const feather = b.sweep(path, [0.045 - i * 0.006, 0.006], { color: i === 0 ? RED : BLUE_DARK, section: { ngon: 5 }, caps: "point", bone: tail.joints[Math.min(2, i + 1)], name: `${side > 0 ? "tailL" : "tailR"}${i + 1}` });
      const dx = tip[0] - start.x;
      const dy = tip[1] - start.y;
      const dz = tip[2] - start.z;
      const len = Math.hypot(dx, dy, dz);
      b.extrude(
        [[0, 0], [len * 0.86, -0.02], [len, 0.02], [len * 0.82, 0.1], [len * 0.2, 0.1], [0, 0.04]],
        { at: start, x: [dx / len, dy / len, dz / len], y: [0, 1, 0], thickness: [0.018, 0.006], bevel: 0.006, smoothing: 1, color: i === 1 ? BLUE : RED, bone: tail.joints[Math.min(2, i + 1)]!, name: `${side > 0 ? "tailBladeL" : "tailBladeR"}${i + 1}` },
      );
      b.along(feather, 3, (at) => b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { frame: at, name: `${side > 0 ? "tailRivetL" : "tailRivetR"}${i + 1}` }));
    }
  }

  // Tiny gold talon tips and a chest jewel provide the ornate, elemental-fantasy finish.
  for (const side of [1, -1]) {
    for (const z of [0.37, 0.42, -0.03, -0.08]) {
      b.spike([side * 0.15, 0.025, z], [0, -0.8, side * 0.45], 0.045, 0.012, { color: GOLD, name: `talon${side > 0 ? "L" : "R"}` });
    }
  }
  const chestGem = b.part(new THREE.OctahedronGeometry(0.045, 0), CYAN, { bone: spine.joints[2], at: [0, 1.25, 0.27], name: "chestGem" });
  glow(chestGem, 1.4);

  return b.root;
}
