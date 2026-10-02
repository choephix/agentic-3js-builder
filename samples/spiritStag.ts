import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { cel, furEdge, animeEye, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { catmull, polyline } from "../src/path";
import { rng } from "../src/math";
export const meta = {
  name: "Luminous Crystalbough Stag",
  description: "A serene forest spirit stag with midnight-violet fur, living cyan runes, and branching crystal antlers.",
  style: "Genshin Impact",
  commit: "07503e3",
};

const COAT = cel(
  furEdge("#3f4d9a", "#1a2254", { level: -0.08, teeth: 0.12, period: 0.11, along: [0, 0, 1] }),
);
const COAT_DARK = cel("#29316e", "#12183d");
const BELLY = cel("#7961b7", "#33265f");
const MUZZLE = cel("#9b83c6", "#4d397d");
const GOLD = cel("#f5c85b", "#a7652e");
const GOLD_LIGHT = cel("#ffe6a0", "#bd7c35");
const HOOF = cel("#252348", "#0f1029");
const CRYSTAL = "#8df7ff";
const CRYSTAL_DEEP = "#3d9fe8";
const RUNE = "#67f6e8";
const NOSE = "#261936";

export default function build() {
  const b = createBuilder({ name: "spiritStag", detail: 1.25, paintSize: 1024 });
  const random = rng(1812);

  // Skeleton first: a single root, a flexible spine and neck, four articulated legs,
  // a tail, a jaw, and separate crystal antler/tine chains.
  const hips = b.joint("hips", { at: [0, 1.18, -0.24], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.18, -0.24],
      [0, 1.32, 0.05],
      [0, 1.4, 0.34],
      [0, 1.44, 0.56],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "chest", "shoulder"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.43, 0.52],
      [0, 1.63, 0.64],
      [0, 1.86, 0.68],
      [0, 2.04, 0.72],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neckMid", "neckTop", "neckEnd"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 2.08, 0.74], dir: [0, 0.18, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.16, -0.08]), dir: [0, 0.12, 1], role: "jaw", group: "head" });

  const legChains: Array<{ side: number; front: boolean; chain: Chain }> = [];
  for (const side of [1, -1]) {
    for (const front of [true, false]) {
      const prefix = `${front ? "front" : "rear"}${side > 0 ? "L" : "R"}`;
      const x = side * (front ? 0.24 : 0.27);
      const points = front
        ? [[x, 1.34, 0.36], [x * 1.22, 0.88, 0.46], [x * 1.08, 0.4, 0.59], [x, 0.07, 0.65]]
        : [[x, 1.2, -0.34], [x * 1.25, 0.82, -0.47], [x * 1.08, 0.36, -0.58], [x, 0.07, -0.64]];
      const chain = b.chain(prefix, polyline(points), {
        parent: hips,
        names: [`hip${prefix}`, `knee${prefix}`, `ankle${prefix}`, `hoof${prefix}`],
        role: "leg",
      });
      legChains.push({ side, front, chain });
    }
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.18, -0.43],
      [0, 1.05, -0.72],
      [0, 1.02, -0.99],
      [0.03, 1.16, -1.22],
      [0.1, 1.34, -1.34],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailEnd", "tailTip", "tailCrown"], role: "tail" },
  );

  const antlers: Array<{ side: number; chain: Chain }> = [];
  for (const side of [1, -1]) {
    const s = side;
    const base = [s * 0.13, 2.18, 0.74] as [number, number, number];
    const antler = b.chain(
      `antler${s > 0 ? "L" : "R"}`,
      catmull([
        base,
        [s * 0.2, 2.39, 0.75],
        [s * 0.32, 2.57, 0.79],
        [s * 0.38, 2.78, 0.73],
        [s * 0.4, 2.95, 0.61],
      ]),
      { parent: head, names: [`antlerRoot${s > 0 ? "L" : "R"}`, `antlerMid${s > 0 ? "L" : "R"}`, `antlerCrown${s > 0 ? "L" : "R"}`, `antlerTip${s > 0 ? "L" : "R"}`, `antlerPoint${s > 0 ? "L" : "R"}`], role: "fan" },
    );
    antlers.push({ side, chain: antler });

    const tines = [
      { at: 0.27, tip: [s * 0.49, 2.56, 0.86] as [number, number, number], length: 0.17 },
      { at: 0.45, tip: [s * 0.57, 2.72, 0.84] as [number, number, number], length: 0.2 },
      { at: 0.62, tip: [s * 0.57, 2.88, 0.7] as [number, number, number], length: 0.22 },
      { at: 0.74, tip: [s * 0.48, 2.99, 0.49] as [number, number, number], length: 0.2 },
    ];
    for (let i = 0; i < tines.length; i++) {
      const tine = b.sprout(
        `tine${s > 0 ? "L" : "R"}${i}`,
        antler.at(tines[i].at),
        tines[i].tip,
        [0.038, 0.008],
        { count: 0, role: "fan", color: CRYSTAL, caps: { end: "point" }, name: `crystalTine${s > 0 ? "L" : "R"}${i}` },
      );
      glow(tine.sweep, 1.9);
      glow(b.spike(tines[i].tip, [0, 1, 0], tines[i].length, 0.025, { color: CRYSTAL_DEEP, caps: "point", name: `tineShard${s > 0 ? "L" : "R"}${i}` }), 2.2);
    }
  }

  // Main masses: faceted but soft, with a warm belly edge and sculpted muzzle.
  const body = b.sweep(spine, (t) => 0.31 + 0.09 * Math.sin(Math.PI * t), {
    color: COAT,
    section: { ngon: 8 },
    sides: 8,
    sectors: [[118, 242, BELLY]],
    name: "bodyCoat",
  });
  const bodySurface = b.surface(body);
  for (let i = 0; i < 16; i++) {
    const hit = bodySurface.scatter(1, { rng: random, minDist: 0.1, filter: (candidate) => candidate.n.y > -0.2 })[0];
    if (hit) {
      const sigil = b.stick(new THREE.OctahedronGeometry(0.022, 0), CRYSTAL_DEEP, hit, { embed: 0.55, name: `bodySigil${i}` });
      glow(sigil, 1.15);
    }
  }
  const neckTube = b.sweep(neck, (t) => 0.22 - 0.035 * t, {
    color: COAT,
    section: { ngon: 8 },
    sectors: [[120, 240, BELLY]],
    name: "neckCoat",
  });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: head.local([0, 0.02, 0.01]),
    scale: [0.235, 0.255, 0.27],
    flat: true,
    name: "skull",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), MUZZLE, {
    bone: head,
    at: head.local([0, 0.2, -0.035]),
    scale: [0.16, 0.18, 0.14],
    flat: true,
    name: "muzzle",
    group: "head",
  });
  b.sweep(
    catmull([jaw.at, jaw.local([0, 0.12, 0]), jaw.local([0, 0.23, 0.015])]),
    [0.1, 0.07],
    { bone: jaw, color: MUZZLE, section: { ngon: 6 }, caps: "round", name: "lowerJaw", group: "head" },
  );
  b.part(new THREE.SphereGeometry(0.055, 8, 6), NOSE, { bone: head, at: head.local([0, 0.34, -0.03]), flat: true, name: "nose", group: "head" });
  for (const side of [1, -1]) {
    const ear = b.extrude(
      [[0, 0], [0.12, 0.035], [0.075, 0.18], [0.015, 0.12]],
      {
        at: head.local([side * 0.15, -0.02, 0.12]),
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: COAT_DARK,
        bone: head,
        name: `ear${side > 0 ? "L" : "R"}`,
        group: "head",
      },
    );
    b.extrude(
      [[0.018, 0.03], [0.085, 0.045], [0.06, 0.13], [0.025, 0.1]],
      {
        at: ear.local([0, 0, 0.02]),
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: GOLD,
        bone: head,
        name: `earInner${side > 0 ? "L" : "R"}`,
        group: "head",
      },
    );
  }
  const browGem = b.part(new THREE.OctahedronGeometry(0.045, 0), CRYSTAL, {
    bone: head,
    at: head.local([0, 0.09, 0.17]),
    flat: true,
    name: "foreheadGem",
    group: "head",
  });
  glow(browGem, 2);

  for (const { side, chain } of antlers) {
    const sweep = b.sweep(chain, [0.07, 0.02], {
      color: CRYSTAL_DEEP,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: `crystalAntler${side > 0 ? "L" : "R"}`,
    });
    glow(sweep, 1.8);
  }

  for (const { side, front, chain } of legChains) {
    b.sweep(chain, (t) => 0.105 - 0.035 * t, {
      color: COAT_DARK,
      section: { ngon: 6 },
      bands: [[0.68, COAT], [0.9, HOOF]],
      name: `${front ? "front" : "rear"}Leg${side > 0 ? "L" : "R"}`,
    });
    const hoofJoint = chain.tip!;
    b.part(new THREE.BoxGeometry(0.13, 0.085, 0.2), HOOF, {
      bone: hoofJoint,
      at: hoofJoint.at,
      scale: [1, 1, 1],
      flat: true,
      name: `hoof${front ? "F" : "R"}${side > 0 ? "L" : "R"}`,
    });
    // Split hooves and two small crystal-blue dewclaws make the feet readable.
    for (const toeSide of [-1, 1]) {
      const toe = b.chain(
        `toe${front ? "F" : "R"}${side > 0 ? "L" : "R"}${toeSide > 0 ? "A" : "B"}`,
        polyline([hoofJoint.at, [hoofJoint.at.x + toeSide * side * 0.045, 0.02, hoofJoint.at.z + 0.06]]),
        { parent: hoofJoint, role: "digit", names: [`toeBase${front ? "F" : "R"}${side > 0 ? "L" : "R"}${toeSide > 0 ? "A" : "B"}`, `toeTip${front ? "F" : "R"}${side > 0 ? "L" : "R"}${toeSide > 0 ? "A" : "B"}`] },
      );
      b.sweep(toe, [0.034, 0.012], { color: HOOF, section: { ngon: 5 }, caps: "round", name: `toe${front ? "F" : "R"}${side > 0 ? "L" : "R"}${toeSide > 0 ? "A" : "B"}Mesh` });
    }
  }

  const tailSweep = b.sweep(tail, (t) => 0.14 - 0.11 * t, {
    color: COAT_DARK,
    section: { ngon: 7 },
    bands: [[0.72, COAT], [0.9, CRYSTAL_DEEP]],
    caps: { end: "point" },
    name: "tailFur",
  });
  for (let i = 0; i < 6; i++) {
    const at = tailSweep.at(0.45 + i * 0.08, 0, 0.005);
    b.spike(at, at, 0.09 - i * 0.008, 0.025, { color: COAT_DARK, caps: "point", name: `tailTuft${i}` });
  }

  // Eyes are large anime-style spirit gems, mirrored across the face.
  const eyeTexture = animeEye({ iris: "#71fff0", irisLight: "#e4ffdc", irisDark: "#1d5eb4", ink: INK, blush: "#d978d6", size: 512 });
  const faceSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const hit = faceSurface.around(skull.at).at(side * 39, 7);
    if (hit) b.decal(faceSurface, eyeTexture, { at: hit, size: [0.095, 0.12], mirror: side > 0, name: `spiritEye${side > 0 ? "L" : "R"}` });
  }

  // Gold regalia and cyan spirit runes distinguish this from an ordinary deer.
  const collarLoop = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collarLoop, 0.018, { color: GOLD, section: { ngon: 6 }, caps: "none", name: "goldNeckCollar" });
  b.along(collarLoop, 8, (at) => b.part(new THREE.SphereGeometry(0.025, 7, 5), GOLD_LIGHT, { at, flat: true, name: "collarJewel" }));

  const shoulderRune = b.rod([0.22, 1.48, 0.56], [0.22, 1.2, 0.82], 0.018, { color: RUNE, name: "shoulderRuneL" });
  const shoulderRuneR = b.rod([-0.22, 1.48, 0.56], [-0.22, 1.2, 0.82], 0.018, { color: RUNE, name: "shoulderRuneR" });
  glow(shoulderRune, 1.6);
  glow(shoulderRuneR, 1.6);
  for (const side of [1, -1]) {
    const runePoints: Array<[number, number, number]> = [
      [side * 0.31, 1.61, 0.3],
      [side * 0.32, 1.47, 0.34],
      [side * 0.27, 1.38, 0.45],
    ];
    const rune = b.sweep(polyline(runePoints), 0.012, { color: RUNE, section: { ngon: 5 }, caps: "round", name: `flankRune${side > 0 ? "L" : "R"}` });
    glow(rune, 1.5);
    for (let i = 0; i < runePoints.length; i++) {
      const shard = b.spike(runePoints[i], [0, 1, 0], 0.035 + random() * 0.02, 0.012, { color: CRYSTAL, caps: "point", name: `runeFacet${side > 0 ? "L" : "R"}${i}` });
      glow(shard, 1.4);
    }
  }

  // A mane of faceted violet crystals follows the spine and makes the silhouette lively.
  const manePoints = [
    [0, 1.55, 0.48],
    [0, 1.72, 0.58],
    [0, 1.9, 0.66],
    [0, 2.08, 0.7],
  ] as Array<[number, number, number]>;
  for (let i = 0; i < manePoints.length; i++) {
    const shard = b.spike(manePoints[i], [0, 1, 0], 0.11 + i * 0.018, 0.045, { color: CRYSTAL_DEEP, caps: "point", name: `maneCrystal${i}` });
    glow(shard, 1.7);
  }

  // Brow ornaments and a luminous chest pendant.
  for (const side of [1, -1]) {
    b.sweep(
      polyline([head.local([side * 0.08, 0.12, 0.1]), head.local([side * 0.19, 0.17, 0.1])]),
      [0.014, 0.006],
      { bone: head, color: GOLD, section: { ngon: 5 }, caps: "point", name: `browGold${side > 0 ? "L" : "R"}` },
    );
  }
  const pendant = b.part(new THREE.OctahedronGeometry(0.09, 1), CRYSTAL, { bone: spine.tip!, at: [0, 1.22, 0.63], flat: true, name: "chestPendant" });
  glow(pendant, 2.4);

  return b.root;
}
