import * as THREE from "three";
import { createBuilder, catmull, limb, rng, svg, paint, spots, stripes, countershade } from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Oaxacan Alebrije Jaguar-Eagle",
  description: "A fantastical alebrije carved-wood jaguar with an eagle's wings, painted in vivid Oaxacan patterns.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const ORANGE = cel("#e85b28", "#8e241e");
  const GOLD = cel("#f5b52e", "#bd641c");
  const TURQUOISE = cel("#12b8ad", "#075f73");
  const MAGENTA = cel("#d72b78", "#72134f");
  const PURPLE = cel("#67359b", "#30205c");
  const GREEN = cel("#5caf45", "#205e37");
  const CREAM = cel("#ffe8a3", "#c98a52");
  const WHITE = "#fff4ce";
  const DARK = INK;
  const WOOD = spots(
    furEdge(ORANGE, GOLD, {
      by: "normal",
      level: -0.18,
      teeth: 0.22,
      period: 0.075,
      along: [0, 0, 1],
      ink: "#56212b",
      inkWidth: 0.025,
    }),
    [MAGENTA, TURQUOISE, PURPLE],
    { size: 0.18, amount: 0.35, rosette: true, seed: 22 },
  );
  const BELLY = countershade(WOOD, CREAM, { level: -0.15, soft: 0.22 });

  // One root skeleton, with clearly named chains for the creature lab.
  const hips = b.joint("hips", { at: [0, 0.72, -0.05], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.48],
      [0, 0.82, -0.15],
      [0, 0.9, 0.22],
      [0, 0.98, 0.5],
    ]),
    { parent: hips, names: ["pelvis", "torso", "chest", "withers"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.48],
      [0, 1.12, 0.67],
      [0, 1.3, 0.78],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.34, 0.78], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.27, 0.9], dir: [0, -0.2, 1], role: "jaw", group: "head" });

  const body = b.sweep(spine, (t) => 0.25 - 0.035 * t, {
    bone: [spine.joints[0], spine.joints[1], spine.joints[2], spine.joints[3]],
    color: BELLY,
    section: { ngon: 8 },
    sides: 8,
    name: "paintedJaguarBody",
    group: "body",
    sectors: [[120, 240, CREAM]],
  });
  b.sweep(neck, [0.19, 0.14], { bone: neck, color: WOOD, sides: 8, group: "body" });

  // Head, muzzle, nose, and a hinged lower jaw.
  const skull = b.part(new THREE.SphereGeometry(0.25, 12, 8), WOOD, {
    bone: head,
    at: [0, 1.34, 0.83],
    scale: [1.0, 0.88, 1.12],
    name: "largePaintedSkull",
    group: "head",
  });
  const muzzle = b.part(new THREE.SphereGeometry(0.16, 10, 6), CREAM, {
    bone: jaw,
    at: [0, 1.25, 1.02],
    scale: [1.25, 0.62, 0.85],
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 5), DARK, {
    bone: jaw,
    at: [0, 1.29, 1.15],
    scale: [1.15, 0.7, 0.6],
    group: "face",
  });
  b.sweep(catmull([[0, 1.27, 1.1], [0, 1.2, 1.18], [0, 1.16, 1.12]]), [0.018, 0.008], {
    bone: jaw,
    color: MAGENTA,
    caps: "round",
    group: "face",
  });

  const eyeTexture = animeEye({ iris: "#19d8c5", blush: "#ed477e", size: 256 });
  const eyeSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const h = eyeSurface.around([0, 1.34, 0.83]).at(s * 38, 7)!;
    b.decal(skull, eyeTexture, {
      at: h,
      size: [0.105, 0.14],
      mirror: s > 0,
      lift: 0.006,
      group: "face",
    });
    b.part(new THREE.ConeGeometry(0.014, 0.09, 6), DARK, {
      bone: head,
      at: [s * 0.12, 1.47, 0.88],
      dir: [s * 0.2, 0.15, 1],
      group: "face",
    });
  }

  // Rounded jaguar ears with bright inner painted wood.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.12, 8, 5), WOOD, {
      bone: head,
      at: [s * 0.19, 1.49, 0.72],
      scale: [1, 1.18, 0.48],
      group: "ears",
    });
    b.part(new THREE.ConeGeometry(0.065, 0.025, 6), MAGENTA, {
      bone: head,
      at: [s * 0.19, 1.49, 0.765],
      dir: [0, 0, 1],
      group: "ears",
    });
  }

  // Four sturdy carved legs, paws planted at y=0.13.
  const footTargets = [
    [0.2, 0.13, 0.28],
    [-0.2, 0.13, 0.28],
    [0.22, 0.13, -0.34],
    [-0.22, 0.13, -0.34],
  ] as const;
  const roots = [
    [0.16, 0.78, 0.28],
    [-0.16, 0.78, 0.28],
    [0.17, 0.7, -0.28],
    [-0.17, 0.7, -0.28],
  ] as const;
  for (let i = 0; i < 4; i++) {
    const s = roots[i][0] > 0 ? "L" : "R";
    const pts = limb(roots[i], footTargets[i], [0.3, 0.27], [[0, 0, i < 2 ? 1 : -1]]);
    const leg = b.chain(`leg${i < 2 ? "F" : "H"}${s}`, pts, {
      parent: spine.joints[i < 2 ? 2 : 0],
      names: [`hip${s}${i}`, `knee${s}${i}`, `paw${s}${i}`],
      role: "leg",
      contact: footTargets[i],
    });
    b.sweep(leg, [0.095, 0.065], {
      bone: leg,
      color: WOOD,
      sides: 7,
      section: { ngon: 7 },
      group: "legs",
    });
    b.part(new THREE.SphereGeometry(0.105, 8, 5), CREAM, {
      bone: leg.tip,
      at: footTargets[i],
      scale: [1.15, 0.5, 1.3],
      group: "paws",
    });
    for (let t = -1; t <= 1; t++) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), MAGENTA, {
        bone: leg.tip,
        at: [footTargets[i][0] + t * 0.035, 0.115, footTargets[i][2] + 0.045],
        group: "pawMarks",
      });
    }
  }

  // Long curling tail with painted bands and a flamboyant tassel.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.7, -0.45],
      [0, 0.65, -0.85],
      [0.08, 0.72, -1.18],
      [0.22, 0.88, -1.42],
      [0.42, 1.02, -1.55],
    ]),
    { parent: hips, names: ["tail0", "tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.105 * (1 - t) + 0.025, {
    bone: tail,
    color: stripes(WOOD, [TURQUOISE, MAGENTA, CREAM], { size: 0.13, width: 0.38, seed: 8 }),
    sides: 7,
    caps: "point",
    group: "tail",
  });
  for (const t of [0.55, 0.7, 0.85, 0.97]) {
    const p = tail.at(t);
    b.spike(p, p, 0.13 * (1 - t) + 0.035, 0.025, { color: GOLD, group: "tailOrnaments" });
  }

  // Eagle wings: articulated roots, broad stepped feathers, and membranes.
  for (const s of [-1, 1]) {
    const wingRoot = b.joint(`wing${s > 0 ? "L" : "R"}`, {
      parent: spine.joints[2],
      at: [s * 0.2, 1.04, 0.25],
      dir: [s * 0.65, 0.28, -0.08],
      role: "wing",
      group: "wings",
    });
    const wing = b.chain(
      `wingChain${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.2, 1.04, 0.25],
        [s * 0.5, 1.28, 0.12],
        [s * 0.82, 1.5, -0.02],
        [s * 1.08, 1.42, -0.2],
      ]),
      { parent: wingRoot, names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`, `wingTip${s > 0 ? "L" : "R"}`], role: "wing" },
    );
    b.sweep(wing, [0.1, 0.045], { bone: wing, color: TURQUOISE, sides: 6, group: "wings" });
    const feather = b.extrude(
      [[0, 0], [0.23, 0.02], [0.52, 0.08], [0.72, 0.22], [0.35, 0.2], [0.05, 0.1]],
      {
        at: wing.at(0.65).at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.008,
        color: MAGENTA,
        bone: wing.joints[1],
        group: "flightFeathers",
      },
    );
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), GOLD, wing.at(0.5), { group: "wingDetails" });
    b.membrane(wing, [wing.at(0.18).at, wing.at(0.45).at, [s * 1.08, 1.18, -0.25]], {
      color: GOLD,
      thickness: 0.014,
      rows: 3,
      cols: 5,
      group: "wingMembrane",
    });
    for (let i = 0; i < 4; i++) {
      const f = wing.at(0.58 + i * 0.1);
      b.spike(f, [s * 0.35, 0.35, -0.9], 0.42 - i * 0.055, 0.026, {
        color: CREAM,
        group: "flightFeathers",
      });
    }
  }

  // Painted crest and ornamental chest diamonds.
  b.extrude(
    [[0, 0], [0.08, 0.18], [0.18, 0.31], [0.1, 0.4], [0, 0.27], [-0.1, 0.4], [-0.18, 0.31], [-0.08, 0.18]],
    { at: [0, 1.42, 0.63], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.01, color: PURPLE, bone: head, group: "crest" },
  );
  b.part(new THREE.SphereGeometry(0.04, 7, 5), GOLD, { bone: head, at: [0, 1.18, 0.68], group: "jewels" });

  return b.root;
}
