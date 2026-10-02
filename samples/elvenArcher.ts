import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, bezier } from "../src/path";

import { cel, furEdge, animeEye, INK, inkLines } from "../kits/toon";

export const meta = {
  name: "Moonleaf Elven Archer",
  description: "A stylized high-fantasy anime elf ranger drawing a moonlit arrow, with flowing hair, leaf cloak, ornate bow and a traveler's quiver.",
  style: "high-fantasy anime",
  commit: "67d30d1",
};

const SKIN = cel("#d99a82", "#99586a");
const SKIN_HIGHLIGHT = cel("#f3b49a", "#ad6570");
const TUNIC = cel(furEdge("#3f6fa1", "#b7d6e8", { level: -0.2, teeth: 0.18, period: 0.035, along: [1, 0, 0], ink: INK }));
const SLEEVE = cel("#507db0", "#2a426f");
const PANTS = cel("#293654", "#141b35");
const CLOAK = cel(furEdge("#704a9d", "#bba2da", { level: -0.2, teeth: 0.12, period: 0.045, along: [1, 0, 0], ink: INK }));
const LEATHER = cel("#754630", "#3c2430");
const WOOD = cel("#9c602f", "#512d2b");
const HAIR = cel("#29314f", "#11172c");
const GOLD = cel("#f0c866", "#9d5a2f");
const SILVER = cel("#dce9f2", "#6f86a4");
const ARROW = cel("#e9ded0", "#8d7180");
const GLOW_BLUE = "#72d7ff";

export default function build() {
  const b = createBuilder({ name: "elvenArcher", detail: 1.05, paintSize: 1024 });

  // Skeleton first: a tall, elegant neutral stance with the bow arm extended and the draw arm folded.
  const hips = b.joint("hips", { at: [0, 0.94, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.94, 0],
      [0, 1.14, 0.005],
      [0, 1.37, 0.015],
    ]),
    { parent: hips, names: ["waist", "chest", "shoulderRoot"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.tip!.at,
      [0, 1.53, 0.03],
      [0, 1.64, 0.055],
    ]),
    { parent: spine.tip!, names: ["neck", "neckTop", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: neck.tip!.at, dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.025, -0.055]), aim: head.local([0, 0.19, -0.05]), role: "jaw", group: "head" });

  const armL = b.chain(
    "armL",
    catmull([
      [0.19, 1.37, 0.01],
      [0.43, 1.41, 0.035],
      [0.70, 1.43, 0.065],
      [0.87, 1.43, 0.075],
    ]),
    { parent: spine.tip!, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.19, 1.37, 0.01],
      [-0.42, 1.43, 0.08],
      [-0.33, 1.45, 0.28],
      [-0.15, 1.45, 0.39],
    ]),
    { parent: spine.tip!, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  const legL = b.chain(
    "legL",
    catmull([
      [0.14, 0.94, 0],
      [0.17, 0.58, 0.025],
      [0.18, 0.23, 0.04],
      [0.18, 0.07, 0.20],
    ]),
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.18, 0, 0.25] },
  );
  const legR = b.chain(
    "legR",
    catmull([
      [-0.14, 0.94, 0],
      [-0.17, 0.58, 0.025],
      [-0.18, 0.23, 0.04],
      [-0.18, 0.07, 0.20],
    ]),
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.18, 0, 0.25] },
  );

  // Torso and neck are continuous, lightly faceted tubes with cel-painted surfaces.
  const torso = b.sweep(spine, (t) => 0.19 - 0.035 * t, {
    color: TUNIC,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "tunicTorso",
  });
  b.sweep(neck, [0.105, 0.085], { color: SKIN, section: { ngon: 8 }, group: "body", name: "neckSkin" });

  b.extrude(
    [
      [-0.56, -0.38],
      [-0.42, -0.48],
      [0, -0.54],
      [0.42, -0.48],
      [0.56, -0.38],
      [0.50, 0.12],
      [0.37, 0.40],
      [0, 0.52],
      [-0.37, 0.40],
      [-0.50, 0.12],
    ],
    { at: [0, 1.28, -0.13], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.028, bevel: 0.008, smoothing: 1, color: CLOAK, bone: hips, group: "cloak", name: "leafCloak" },
  );
  // Pale embroidered hem and central seam.
  b.sweep(
    catmull([
      [-0.43, 0.81, -0.155],
      [-0.20, 0.76, -0.165],
      [0, 0.73, -0.17],
      [0.20, 0.76, -0.165],
      [0.43, 0.81, -0.155],
    ]),
    0.012,
    { color: GOLD, bone: hips, caps: "round", group: "cloak", name: "cloakHem" },
  );
  b.rod([0, 0.84, -0.17], [0, 1.73, -0.12], 0.008, { color: GOLD, bone: hips, group: "cloak", name: "cloakSeam" });

  const belt = b.surface(torso).loop(spine.joints[0], { lift: 0.012 });
  b.sweep(belt, 0.021, { color: LEATHER, group: "belt", name: "waistBelt" });
  b.part(new THREE.BoxGeometry(0.105, 0.12, 0.025), GOLD, { bone: hips, at: [0, 1.12, 0.19], group: "belt", name: "sunBuckle" });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), GLOW_BLUE, { bone: hips, at: [0, 1.12, 0.208], group: "belt", name: "buckleGem" });

  // Long legs, wrapped greaves, and pointed soft boots.
  b.sweep(legL, (t) => (t < 0.58 ? 0.085 : 0.073), { color: PANTS, section: { ngon: 7 }, group: "legs", name: "legLCloth" });
  b.sweep(legR, (t) => (t < 0.58 ? 0.085 : 0.073), { color: PANTS, section: { ngon: 7 }, group: "legs", name: "legRCloth" });
  b.sweep(catmull([[0.18, 0.27, 0.04], [0.18, 0.12, 0.06], [0.18, 0.07, 0.21]]), [0.095, 0.06], { color: LEATHER, bone: legL.joints[2], group: "boots", name: "bootL" });
  b.sweep(catmull([[-0.18, 0.27, 0.04], [-0.18, 0.12, 0.06], [-0.18, 0.07, 0.21]]), [0.095, 0.06], { color: LEATHER, bone: legR.joints[2], group: "boots", name: "bootR" });
  for (const s of [1, -1]) {
    const knee = s > 0 ? legL.joints[1] : legR.joints[1];
    b.part(new THREE.SphereGeometry(0.09, 8, 5), GOLD, { bone: knee, at: knee.at, scale: [0.9, 0.38, 0.65], group: "armor", name: s > 0 ? "kneeGuardL" : "kneeGuardR" });
  }

  // Sleeves, bracers, gloves, and articulated fingers.
  b.sweep(armL, (t) => 0.073 - 0.015 * t, { color: SLEEVE, section: { ngon: 7 }, group: "arms", name: "sleeveL" });
  b.sweep(armR, (t) => 0.073 - 0.015 * t, { color: SLEEVE, section: { ngon: 7 }, group: "arms", name: "sleeveR" });
  b.sweep(catmull([[0.63, 1.425, 0.055], [0.77, 1.43, 0.07]]), [0.082, 0.067], { color: LEATHER, bone: armL.joints[2], group: "arms", name: "bracerL" });
  b.sweep(catmull([[-0.29, 1.445, 0.30], [-0.17, 1.45, 0.38]]), [0.082, 0.067], { color: LEATHER, bone: armR.joints[2], group: "arms", name: "bracerR" });
  const handL = armL.tip!;
  const handR = armR.tip!;
  b.part(new THREE.SphereGeometry(0.073, 9, 7), SKIN_HIGHLIGHT, { bone: handL, at: handL.at, scale: [0.85, 0.7, 0.9], group: "hands", name: "handL" });
  b.part(new THREE.SphereGeometry(0.073, 9, 7), SKIN_HIGHLIGHT, { bone: handR, at: handR.at, scale: [0.85, 0.7, 0.9], group: "hands", name: "handR" });

  const fingerDirsL: number[][] = [[0.07, 0.02, 0.03], [0.055, 0.015, 0.075], [0.02, 0.01, 0.10]];
  const fingerDirsR: number[][] = [[-0.07, 0.02, 0.03], [-0.055, 0.015, 0.075], [-0.02, 0.01, 0.10]];
  for (const [side, hand, dirs] of [["L", handL, fingerDirsL], ["R", handR, fingerDirsR]] as const) {
    dirs.forEach((d, i) => {
      const tip: [number, number, number] = [hand.at.x + d[0], hand.at.y + d[1], hand.at.z + d[2]];
      b.chain(`finger${side}${i}`, [hand.at, tip], { parent: hand, names: [`finger${side}${i}`, `fingerTip${side}${i}`], role: "digit" });
      b.sweep([hand.at, tip], [0.018, 0.008], { color: SKIN_HIGHLIGHT, bone: hand, caps: "round", group: "hands", name: `finger${side}${i}Mesh` });
    });
  }

  // Head, pointed ears, nose, mouth and giant cel-shaded anime eyes.
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { bone: head, at: head.at, scale: [0.145, 0.155, 0.17], group: "head", name: "elfSkull" });
  const face = b.surface(skull);
  const eyeTex = animeEye({ iris: "#65d9d1", irisLight: "#d4fff5", irisDark: "#1f647e", blush: "#ef8b9d", size: 512 });
  for (const s of [1, -1]) {
    const eyeHit = face.around(head.at).at(s * 32, 7);
    if (eyeHit) b.decal(face, eyeTex, { at: eyeHit, size: [0.082, 0.108], mirror: s > 0, name: s > 0 ? "eyeL" : "eyeR", group: "face" });
  }
  b.sweep(bezier([0, 1.64, 0.19], [0.018, 1.62, 0.225], [0.015, 1.57, 0.22]), [0.012, 0.004], { color: SKIN_HIGHLIGHT, bone: head, caps: "point", group: "face", name: "nose" });
  b.sweep(catmull([[0, 1.565, 0.217], [0.035, 1.555, 0.222], [0.07, 1.56, 0.215]]), [0.008, 0.003], { color: INK, bone: jaw, caps: "point", group: "face", name: "smile" });
  b.part(new THREE.SphereGeometry(0.026, 8, 5), "#e86f83", { bone: jaw, at: [0, 1.56, 0.217], scale: [1.6, 0.45, 0.6], group: "face", name: "lowerLip" });

  const earOutline: [number, number, "sharp"][] = [[0, 0, "sharp"], [0.18, 0.045, "sharp"], [0.30, 0.17, "sharp"], [0.045, 0.12, "sharp"]];
  for (const s of [1, -1]) {
    b.extrude(earOutline, { at: head.local([s * 0.105, -0.015, 0.035]), x: [0, 0, 1], y: [s, 0, 0], thickness: 0.018, bevel: 0.003, color: SKIN, bone: head, group: "head", name: s > 0 ? "earL" : "earR" });
    b.sweep(catmull([[s * 0.13, 1.70, 0.07], [s * 0.25, 1.72, 0.10], [s * 0.33, 1.77, 0.16]]), [0.011, 0.003], { color: SKIN_HIGHLIGHT, bone: head, caps: "point", group: "head", name: s > 0 ? "earRidgeL" : "earRidgeR" });
  }

  // A fan of swept locks gives the head a readable anime silhouette from every angle.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.045 + i * 0.045);
      b.sweep(
        bezier(
          [x, 1.76 + i * 0.005, 0.02],
          [x + s * 0.04, 1.73 - i * 0.035, -0.06],
          [x + s * (0.10 + i * 0.025), 1.52 - i * 0.045, -0.12 - i * 0.02],
          [x + s * (0.13 + i * 0.03), 1.36 - i * 0.035, -0.10 - i * 0.025],
        ),
        [0.034 - i * 0.004, 0.008],
        { color: HAIR, bone: head, caps: { start: "round", end: "point" }, group: "hair", name: `${s > 0 ? "left" : "right"}HairLock${i}` },
      );
    }
  }
  b.sweep(catmull([[0, 1.78, -0.01], [0, 1.82, -0.12], [0, 1.70, -0.20], [0, 1.56, -0.22]]), [0.11, 0.035], { color: HAIR, bone: head, group: "hair", name: "backHairMass" });
  b.part(new THREE.SphereGeometry(0.055, 8, 5), GOLD, { bone: head, at: [0, 1.77, 0.01], scale: [1.5, 0.55, 0.55], group: "hair", name: "hairGem" });

  // Ornate bow, taut string, nocked arrow, and a leaf-shaped arrowhead.
  const bowPath = catmull([
    [0.89, 0.98, 0.08],
    [0.99, 1.18, 0.19],
    [1.03, 1.43, 0.23],
    [0.99, 1.68, 0.19],
    [0.89, 1.86, 0.08],
  ]);
  const bow = b.sweep(bowPath, [0.026, 0.014], { color: WOOD, bone: armL.tip!, caps: "round", group: "bow", name: "moonbow" });
  b.sweep(catmull([[0.89, 0.98, 0.08], [-0.15, 1.45, 0.40], [0.89, 1.86, 0.08]]), 0.007, { color: SILVER, bone: armR.tip!, caps: "round", group: "bow", name: "bowString" });
  for (const y of [1.07, 1.43, 1.77]) {
    b.ring(bow.at(Math.max(0, Math.min(1, (y - 0.98) / 0.88))), { count: 6, radius: 0.032, fromDeg: 0, toDeg: 300 }, (item) => b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { frame: item, group: "bow", name: `bowInlay${y}` }));
  }
  b.rod([-0.15, 1.45, 0.39], [-0.15, 1.45, 0.83], 0.009, { color: ARROW, bone: armR.tip!, group: "arrow", name: "arrowShaft" });
  b.spike([-0.15, 1.45, 0.83], [0, 0, 1], 0.105, 0.032, { color: SILVER, bone: armR.tip!, group: "arrow", name: "arrowHead" });
  b.extrude([[0, 0], [0.10, 0.025], [0.03, 0.13], [-0.03, 0.13], [-0.10, 0.025]], { at: [-0.15, 1.45, 0.37], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.002, color: CLOAK, bone: armR.tip!, group: "arrow", name: "arrowFletching" });

  // Quiver and three visible spare arrows over the cloak.
  b.sweep(catmull([[-0.30, 0.70, -0.16], [-0.35, 0.98, -0.17], [-0.44, 1.30, -0.16]]), [0.065, 0.045], { color: LEATHER, bone: hips, group: "quiver", name: "quiver" });
  b.sweep(catmull([[-0.30, 1.02, -0.16], [-0.08, 1.23, -0.10], [0.20, 1.36, -0.04]]), 0.014, { color: LEATHER, bone: hips, group: "quiver", name: "quiverStrap" });
  for (let i = 0; i < 3; i++) {
    const x = -0.44 + i * 0.028;
    b.rod([x, 1.26, -0.16], [x + 0.015, 1.57, -0.15], 0.006, { color: ARROW, bone: hips, group: "quiver", name: `spareArrow${i}` });
    b.spike([x + 0.015, 1.57, -0.15], [0, 1, 0], 0.055, 0.014, { color: GOLD, bone: hips, group: "quiver", name: `spareArrowhead${i}` });
  }

  // Small ornamental leaf charms and face markings.
  const leaf = b.extrude([[0, 0], [0.06, 0.04], [0.085, 0.12], [0, 0.18, "sharp"], [-0.085, 0.12], [-0.06, 0.04]], { at: [0.06, 1.26, 0.18], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.002, color: GOLD, bone: hips, group: "ornaments", name: "leafCharm" });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), GLOW_BLUE, { bone: hips, at: leaf.local([0, 0.09, 0.01]), group: "ornaments", name: "leafGem" });
  // Final costume pass: a raised collar, leaf pauldrons, and tiny cloak constellations break up the broad masses.
  b.sweep(
    catmull([
      [0, 1.51, 0.10],
      [0.10, 1.51, 0.04],
      [0, 1.51, -0.08],
      [-0.10, 1.51, 0.04],
    ], { closed: true }),
    0.018,
    { color: GOLD, bone: spine.tip!, caps: "none", group: "ornaments", name: "highCollar" },
  );
  const pauldron: [number, number, "sharp"][] = [[0, 0, "sharp"], [0.16, 0.03, "sharp"], [0.12, 0.14, "sharp"], [0.02, 0.18, "sharp"], [-0.07, 0.10, "sharp"]];
  for (const s of [1, -1]) {
    b.extrude(pauldron, { at: [s * 0.205, 1.39, 0.01], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.018, bevel: 0.004, color: GOLD, bone: spine.tip!, group: "armor", name: s > 0 ? "pauldronL" : "pauldronR" });
    b.part(new THREE.SphereGeometry(0.018, 7, 5), GLOW_BLUE, { bone: spine.tip!, at: [s * 0.22, 1.47, 0.035], group: "armor", name: s > 0 ? "pauldronGemL" : "pauldronGemR" });
  }
  for (const [x, y, r] of [[-0.24, 1.38, 0.018], [0.03, 1.27, 0.025], [0.25, 1.05, 0.015], [0.10, 0.92, 0.012]] as const) {
    b.part(new THREE.SphereGeometry(r, 7, 5), GOLD, { bone: hips, at: [x, y, -0.166], group: "cloak", name: `cloakStar${x}${y}` });
  }

  const facePaint = inkLines(SKIN, { levels: [0.4], axis: [0, 0, 1], width: 0.03, ink: "#7b3f6f" });
  b.part(new THREE.SphereGeometry(0.146, 14, 10), facePaint, { bone: head, at: head.at, scale: [0.98, 1.02, 1.02], group: "face", name: "facePaint" });

  return b.root;
}
