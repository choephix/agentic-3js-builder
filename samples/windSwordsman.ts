import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { bezier, catmull, polyline } from "../src/path";
import { cel, animeEye, furEdge, inkLines, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { svg } from "../src/texture";

const SKIN = cel("#f3bd99", "#ba6c63");
const COAT = cel("#1b8791", "#14546c");
const COAT_EDGE = furEdge(COAT, "#102e4a", { level: -0.18, teeth: 0.16, period: 0.045, along: [0, 0, 1], ink: INK, inkWidth: 0.025 });
const NAVY = cel("#22365d", "#141d3c");
const NAVY_EDGE = inkLines(NAVY, { levels: [-0.15, 0.55], axis: [0, 1, 0], width: 0.055 });
const CREAM = cel("#f5e6bf", "#c78d79");
const GOLD = cel("#e5b449", "#9b5a35");
const LEATHER = cel("#6f3f3b", "#3d2638");
const HAIR = cel("#24385e", "#141a35");
const BLADE = cel("#dcecf0", "#7897ae");
const INK_BLUE = "#152342";
const WIND = "#63eee2";
const WIND_DARK = "#217c9c";

const EYE = animeEye({ iris: "#57d9d8", irisLight: "#b9ffff", irisDark: "#176f9a", blush: "#e7769a" });
const WIND_MARK = svg(
  `<svg viewBox="0 0 128 128"><path d="M15 52 C43 20 101 27 102 54 C103 78 65 89 39 74 C20 63 27 42 51 41 C76 40 86 56 74 66 C66 73 51 70 48 61" fill="none" stroke="#63eee2" stroke-width="9" stroke-linecap="round"/><path d="M65 86 C79 98 102 97 111 82" fill="none" stroke="#f5e6bf" stroke-width="6" stroke-linecap="round"/></svg>`,
  { size: 256 },
);
const STREAMER = svg(
  `<svg viewBox="0 0 32 128"><path d="M4 0 L28 0 L22 31 L27 59 L14 86 L23 128 L6 128 L11 86 L3 60 L10 31 Z" fill="#63eee2"/><path d="M7 9 L21 9 L17 31 L21 58 L13 77 L17 111 L11 111 L13 80 L7 59 L13 31 Z" fill="#e6ffff" opacity=".8"/></svg>`,
  { size: 256 },
);

export const meta = {
  name: "Wandering Wind Swordsman",
  description: "A cel-shaded wandering wind swordsman with a broad travel hat, layered teal robes, ornate blade, and luminous wind ribbons.",
  style: "Genshin Impact",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "windSwordsman", detail: 1.25, paintSize: 1024 });

  // Skeleton first: a neutral, readable rest pose with every major articulation exposed.
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain("spine", [[0, 0.98, 0], [0, 1.27, 0], [0, 1.53, 0]], {
    parent: hips,
    names: ["spineBase", "chest"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", [[0, 1.53, 0], [0, 1.68, 0], [0, 1.76, 0]], {
    parent: chest,
    names: ["neck", "neckTip"],
    role: "neck",
  });
  const neckTip = neck.joints[1];
  const head = b.joint("head", { parent: neckTip, at: [0, 1.78, 0], dir: [0, 0.02, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.71, 0.035], dir: [0, -0.12, 1], role: "jaw", group: "head" });

  const armL = b.chain("armL", [[0.22, 1.49, 0], [0.42, 1.31, 0.015], [0.56, 1.13, 0.07], [0.59, 1.09, 0.13]], {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", [[-0.22, 1.49, 0], [-0.42, 1.31, 0.015], [-0.56, 1.13, 0.07], [-0.59, 1.09, 0.13]], {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });
  const legL = b.chain("legL", [[0.14, 0.98, 0], [0.17, 0.57, 0.025], [0.16, 0.17, 0], [0.16, 0.06, 0.12]], {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
  });
  const legR = b.chain("legR", [[-0.14, 0.98, 0], [-0.17, 0.57, 0.025], [-0.16, 0.17, 0], [-0.16, 0.06, 0.12]], {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
  });

  // Core silhouette: short heroic torso, folded collar, and a long split travel coat.
  const torso = b.sweep(spine, (t) => (t < 0.5 ? 0.2 : 0.16), {
    section: { ngon: 8 },
    color: COAT_EDGE,
    caps: "round",
    group: "body",
    name: "coatTorso",
  });
  b.part(new THREE.SphereGeometry(0.2, 10, 8), NAVY, {
    bone: hips,
    at: hips.at,
    scale: [1.08, 0.58, 0.86],
    name: "hipWrap",
    group: "body",
  });
  b.sweep(polyline([[0, 1.48, 0.01], [0, 1.59, 0.015], [0, 1.7, 0.01]]), 0.075, {
    color: CREAM,
    bone: chest,
    section: { ngon: 6 },
    name: "foldedCollar",
  });
  b.extrude(
    [[-0.12, 0], [0.12, 0], [0.105, 0.24], [0.035, 0.31, "sharp"], [-0.035, 0.31, "sharp"], [-0.105, 0.24]],
    { at: [0, 1.35, 0.175], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.008, smoothing: 1, color: CREAM, bone: chest, name: "chestBib", group: "clothes" },
  );
  b.decal(torso, WIND_MARK, { at: [0, 1.41, 0.178], dir: [0, 0, 1], size: [0.115, 0.115], lift: 0.004, name: "windCrest" });

  b.extrude(
    [[0, 0], [0.23, 0.02], [0.19, 0.38], [0.08, 0.62], [0, 0.55]],
    { at: [0.03, 0.88, -0.12], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.035, 0.012], bevel: 0.006, color: NAVY_EDGE, bone: hips, name: "coatTailL", group: "clothes" },
  );
  b.extrude(
    [[0, 0], [-0.23, 0.02], [-0.19, 0.38], [-0.08, 0.62], [0, 0.55]],
    { at: [-0.03, 0.88, -0.12], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.035, 0.012], bevel: 0.006, color: NAVY_EDGE, bone: hips, name: "coatTailR", group: "clothes" },
  );
  // Tiny hem plates make the split coat read from the rear as well.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.025, 0.026), GOLD, {
      bone: hips,
      at: [s * 0.13, 0.91, -0.145],
      rotation: [0, s * 8, s * 5],
      name: `coatHem${s > 0 ? "L" : "R"}`,
      group: "ornament",
    });
  }

  // Belt and sash, derived from the body surface so they follow future poses.
  const beltLoop = b.surface(torso).loop(spine.at(0.08), { lift: 0.014 });
  b.sweep(beltLoop, 0.025, { color: LEATHER, caps: "none", name: "leatherBelt", group: "clothes" });
  b.along(beltLoop, 12, (at) => b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at, name: "beltStud", group: "ornament" }));
  b.sweep(polyline([[0.17, 1.2, 0.12], [0.27, 1.05, 0.16], [0.18, 0.84, 0.13], [0.04, 0.7, 0.09]]), 0.018, {
    color: CREAM,
    bone: hips,
    caps: "round",
    name: "sashTail",
    group: "clothes",
  });
  b.along(polyline([[0.17, 1.2, 0.12], [0.27, 1.05, 0.16], [0.18, 0.84, 0.13]]), 5, (at) =>
    b.part(new THREE.SphereGeometry(0.023, 6, 4), GOLD, { at, bone: hips, name: "sashStud", group: "ornament" }),
  );

  // Arms: padded teal sleeves under faceted shoulder guards, plus articulated hands.
  for (const [s, arm] of [[1, armL], [-1, armR]] as const) {
    const hand = arm.tip!;
    b.sweep(arm, (t) => (t < 0.34 ? 0.105 : t < 0.7 ? 0.075 : 0.052), {
      section: { ngon: 8 },
      color: COAT,
      caps: "round",
      name: `sleeve${s > 0 ? "L" : "R"}`,
      group: "clothes",
    });
    b.part(new THREE.SphereGeometry(0.13, 8, 6), COAT_EDGE, {
      bone: arm.joints[0],
      at: arm.joints[0].at,
      scale: [1.2, 0.78, 1.02],
      name: `shoulderGuard${s > 0 ? "L" : "R"}`,
      group: "armor",
    });
    b.sweep(polyline([arm.joints[1].at, arm.joints[2].at]), [0.082, 0.065], {
      color: NAVY_EDGE,
      bone: arm.joints[1],
      section: { ngon: 6 },
      name: `forearmGuard${s > 0 ? "L" : "R"}`,
      group: "armor",
    });
    b.sweep(polyline([arm.joints[0].at, arm.joints[0].at.clone().add(new THREE.Vector3(0, 0.08, 0))]), 0.018, {
      color: GOLD,
      bone: arm.joints[0],
      caps: "round",
      name: `pauldronTrim${s > 0 ? "L" : "R"}`,
      group: "ornament",
    });
    b.part(new THREE.SphereGeometry(0.064, 8, 6), SKIN, {
      bone: hand,
      at: hand.at,
      scale: [0.82, 1.08, 0.82],
      name: `hand${s > 0 ? "L" : "R"}`,
      group: "body",
    });
    for (let i = 0; i < 3; i++) {
      const x = s * (0.02 + i * 0.018);
      b.spike([hand.at.x + x, hand.at.y - 0.02, hand.at.z + 0.04], [s * 0.04, -0.015, 0.03], 0.045, 0.009, {
        color: SKIN,
        bone: hand,
        name: `finger${s > 0 ? "L" : "R"}${i}`,
        group: "body",
      });
    }
  }

  // Trousers, wrapped shin guards, and sturdy traveller boots planted on y=0.
  for (const [s, leg] of [[1, legL], [-1, legR]] as const) {
    const foot = leg.tip!;
    b.sweep(leg, (t) => (t < 0.38 ? 0.12 : t < 0.75 ? 0.085 : 0.06), {
      section: { ngon: 7 },
      color: NAVY_EDGE,
      caps: "round",
      name: `trouser${s > 0 ? "L" : "R"}`,
      group: "clothes",
    });
    b.sweep(polyline([leg.joints[1].at, leg.joints[2].at]), [0.09, 0.065], {
      color: LEATHER,
      bone: leg.joints[1],
      section: { ngon: 6 },
      name: `shinWrap${s > 0 ? "L" : "R"}`,
      group: "armor",
    });
    b.part(new THREE.BoxGeometry(0.14, 0.075, 0.23), LEATHER, {
      bone: foot,
      at: foot.at,
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, s * 7, 0],
      name: `boot${s > 0 ? "L" : "R"}`,
      group: "clothes",
    });
    b.part(new THREE.BoxGeometry(0.13, 0.018, 0.24), GOLD, {
      bone: foot,
      at: [foot.at.x, foot.at.y + 0.025, foot.at.z + 0.01],
      name: `bootTrim${s > 0 ? "L" : "R"}`,
      group: "ornament",
    });
  }

  // Neck, face, jaw, anime eyes, and stylised hair silhouette.
  b.sweep(neck, [0.095, 0.075], { section: { ngon: 8 }, color: SKIN, name: "neckSkin", group: "body" });
  const skull = b.part(new THREE.SphereGeometry(0.145, 14, 10), SKIN, {
    bone: head,
    at: head.at,
    scale: [0.92, 1.06, 0.9],
    name: "face",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.105, 10, 8), SKIN, {
    bone: jaw,
    at: jaw.at,
    scale: [1.02, 0.45, 0.82],
    name: "jawShape",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), INK_BLUE, {
    bone: jaw,
    at: [0, 1.715, 0.125],
    scale: [1.2, 0.55, 0.65],
    name: "mouthLine",
    group: "head",
  });
  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    b.decal(faceSurface, EYE, {
      at: head.local({ left: s * 0.062, up: 0.035, forward: 0.125 }),
      dir: [0, 0, 1],
      size: [0.073, 0.092],
      mirror: s > 0,
      name: `eye${s > 0 ? "L" : "R"}`,
      group: "head",
    });
  }
  const hairSurface = b.surface(skull);
  for (const [azimuth, elevation] of [[-32, 34], [-12, 48], [12, 57], [34, 40], [180, 46]] as const) {
    const hit = hairSurface.around(head.at).at(azimuth, elevation);
    if (hit) b.stick(new THREE.ConeGeometry(0.065, 0.22, 6), HAIR, hit, { embed: 0.65, name: `hairSpike${azimuth}`, group: "head" });
  }
  // Broad hat: low-poly turned brim and crown, with a raised teal ribbon.
  b.lathe(
    [[0, 0], [0.22, 0], [0.29, 0.025], [0.31, 0.06], [0.15, 0.075], [0.125, 0.23], [0, 0.28]],
    { at: [0, 1.84, 0], bone: head, segments: 12, smoothing: 1, color: CREAM, name: "travelHat", group: "head" },
  );
  b.sweep(polyline([[0, 1.915, 0], [0, 1.985, 0]]), 0.132, { color: COAT, bone: head, section: { ngon: 8 }, name: "hatBand", group: "ornament" });
  b.sweep(polyline([[0, 1.985, 0.015], [0, 1.79, 0.1]]), [0.012, 0.006], { color: GOLD, bone: head, caps: "round", name: "hatTassel", group: "ornament" });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), WIND, { bone: head, at: [0, 1.79, 0.105], name: "tasselCharm", group: "ornament" });

  // Sheathed sword and exposed wind-bright blade, carried diagonally at the hip.
  const hilt = [0.32, 1.11, 0.07] as const;
  const bladeTip = [0.78, 1.62, 0.07] as const;
  const sheathTip = [0.72, 1.51, -0.015] as const;
  b.rod(hilt, sheathTip, 0.041, { color: LEATHER, bone: hips, name: "swordSheath", group: "weapon" });
  b.sweep(polyline([hilt, bladeTip]), [0.028, 0.006], {
    section: "box",
    color: BLADE,
    bone: hips,
    caps: "point",
    name: "windBlade",
    group: "weapon",
  });
  b.part(new THREE.CylinderGeometry(0.071, 0.071, 0.018, 8), GOLD, {
    bone: hips,
    at: hilt,
    dir: [1, 0, 0],
    axis: "y",
    name: "swordGuard",
    group: "weapon",
  });
  b.rod([0.29, 1.055, 0.07], hilt, 0.027, { color: NAVY, bone: hips, name: "swordGrip", group: "weapon" });
  b.along(polyline([[0.29, 1.055, 0.07], hilt]), 6, (at) =>
    b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 8), GOLD, { at, bone: hips, rotation: [0, 90, 0], name: "gripWrap", group: "weapon" }),
  );
  b.part(new THREE.SphereGeometry(0.038, 8, 6), GOLD, { bone: hips, at: [0.275, 1.045, 0.07], name: "pommel", group: "weapon" });

  // Wind ribbons orbit the silhouette and make the elemental theme readable at distance.
  const ribbonA = b.sweep(bezier([-0.2, 1.5, 0.2], [-0.42, 1.72, 0.3], [0.16, 1.93, 0.2], [0.36, 1.58, 0.18]), 0.011, {
    color: WIND,
    bone: chest,
    caps: "point",
    name: "windRibbonA",
    group: "element",
  });
  const ribbonB = b.sweep(catmull([[0.3, 1.2, 0.2], [0.45, 1.35, 0.28], [0.25, 1.55, 0.32], [-0.05, 1.44, 0.22]]), 0.008, {
    color: WIND_DARK,
    bone: chest,
    caps: "point",
    name: "windRibbonB",
    group: "element",
  });
  glow(ribbonA, 1.8);
  glow(ribbonB, 1.25);
  glow(b.part(new THREE.SphereGeometry(0.018, 8, 6), WIND, { bone: hips, at: [0.78, 1.62, 0.07], name: "bladeSpark", group: "element" }), 2);

  // Two translucent-looking cloth streamers from the belt, represented as double-sided cards.
  b.cards(
    [frame([0.13, 1.13, 0.09], [0, 1, 0]), frame([-0.1, 1.12, 0.08], [0, 1, 0])],
    STREAMER,
    { size: [0.07, 0.29], lean: 18, bend: 24, flow: [0.4, 0, -1], sink: 0.02, color: "#d8ffff", name: "windStreamer", group: "element" },
  );

  return b.root;
}
