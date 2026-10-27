```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  paint,
} from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "dwarf-blacksmith-at-anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a braided beard, horned helmet, leather apron, hammer, and a broad anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const SKIN = cel("#c98255", "#713b35");
  const SKIN_LIGHT = cel("#e2a06c", "#8d4c3b");
  const HAIR = cel("#30211e", "#130f16");
  const BEARD = furEdge(HAIR, "#5b3730", {
    by: "position",
    axis: [0, 1, 0],
    level: 0.85,
    teeth: 0.08,
    period: 0.055,
    along: [1, 0, 0],
  });
  const RED = cel("#b73527", "#551a24");
  const TUNIC = cel("#31506a", "#17273d");
  const LEATHER = cel("#704225", "#321d1b");
  const LEATHER_LIGHT = cel("#a46332", "#4b2921");
  const IRON = cel("#555761", "#20232e");
  const IRON_DARK = cel("#292b35", "#10131b");
  const STEEL = cel("#8b9098", "#3c414e");
  const GOLD = cel("#e2a83f", "#71431e");
  const BRASS = cel("#c67b2d", "#63351b");
  const ANVIL_TOP = cel("#777b83", "#292e3b");
  const FIRE = "#ff762d";
  const FIRE_YELLOW = "#ffd35a";
  const WHITE = "#fff1d0";

  const d = (geo: THREE.BufferGeometry, color: any, at: THREE.Vector3 | [number, number, number], bone?: any, extra: any = {}) =>
    b.part(geo, color, { at, bone, ...extra });

  const sphere = (r: number, color: any, at: any, bone?: any, scale?: [number, number, number]) =>
    d(new THREE.SphereGeometry(r, 10, 7), color, at, bone, scale ? { scale } : {});

  const box = (w: number, h: number, z: number, color: any, at: any, bone?: any, bevel = 0) =>
    d(new THREE.BoxGeometry(w, h, z), color, at, bone, bevel ? { bevel } : {});

  const cyl = (r: number, h: number, color: any, at: any, bone?: any, radial = 8) =>
    d(new THREE.CylinderGeometry(r, r, h, radial), color, at, bone);

  const cone = (r: number, h: number, color: any, at: any, dir: any, bone?: any) =>
    d(new THREE.ConeGeometry(r, h, 8), color, at, bone, { dir });

  // Skeleton first: broad, sturdy dwarf proportions.
  const hips = b.joint("hips", { at: [0, 0.78, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, 0],
      [0, 0.94, 0],
      [0, 1.10, 0.01],
      [0, 1.22, 0.02],
    ]),
    { parent: hips, names: ["pelvis", "waist", "chest", "shoulders"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.20, 0.02],
      [0, 1.32, 0.02],
      [0, 1.40, 0.03],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.40, 0.03], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.33, 0.12],
    dir: [0, 0.15, 1],
    role: "jaw",
    group: "face",
  });

  const footL = [0.22, 0.12, 0.05] as [number, number, number];
  const footR = [-0.22, 0.12, 0.05] as [number, number, number];
  const legLPoints = limb([0.25, 0.78, 0], footL, [0.29, 0.28, 0.22], [[0, 0, 1], [0, 0, -1]], { sole: [0, 0, 1] });
  const legRPoints = limb([-0.25, 0.78, 0], footR, [0.29, 0.28, 0.22], [[0, 0, 1], [0, 0, -1]], { sole: [0, 0, 1] });
  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: footL,
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: footR,
  });

  const armLPoints = limb([0.30, 1.17, 0.02], [0.42, 0.86, 0.25], [0.25, 0.23, 0.25], [[0, 0, 1], [0, 0, 1]], { sole: [0, 0, 1] });
  const armRPoints = limb([-0.30, 1.17, 0.02], [-0.40, 0.91, 0.30], [0.25, 0.23, 0.25], [[0, 0, 1], [0, 0, 1]], { sole: [0, 0, 1] });
  const armL = b.chain("armL", armLPoints, {
    parent: spine.tip,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", armRPoints, {
    parent: spine.tip,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  // Torso: barrel chest and compact pelvis.
  const coat = b.sweep(spine, (t) => 0.25 - t * 0.055, {
    color: TUNIC,
    sides: 8,
    section: "box",
    caps: "round",
    name: "barrelTunic",
    group: "body",
  });
  box(0.42, 0.25, 0.30, LEATHER, [0, 0.76, 0.01], hips);
  box(0.57, 0.08, 0.34, GOLD, [0, 0.88, 0.04], hips);
  for (const s of [-1, 1]) {
    cyl(0.025, 0.10, GOLD, [s * 0.16, 0.88, 0.19], hips, 8);
    sphere(0.035, GOLD, [s * 0.16, 0.88, 0.235], hips);
  }

  // Legs, boots, knees and metal toe caps.
  b.sweep(legL, [0.105, 0.075], { color: TUNIC, section: "box", sides: 6, name: "legL" });
  b.sweep(legR, [0.105, 0.075], { color: TUNIC, section: "box", sides: 6, name: "legR" });
  for (const [s, p] of [[1, footL], [-1, footR]] as const) {
    box(0.19, 0.25, 0.31, LEATHER, [p[0], 0.20, 0.00], s === 1 ? legL.tip : legR.tip);
    box(0.17, 0.07, 0.33, LEATHER_LIGHT, [p[0], 0.105, 0.055], s === 1 ? legL.tip : legR.tip);
    box(0.17, 0.035, 0.10, STEEL, [p[0], 0.13, 0.19], s === 1 ? legL.tip : legR.tip);
    sphere(0.045, GOLD, [p[0] + s * 0.065, 0.29, 0.10], s === 1 ? legL.joints[1] : legR.joints[1]);
  }

  // Arms and large mitten-like hands.
  b.sweep(armL, [0.095, 0.065], { color: TUNIC, section: "box", name: "armL" });
  b.sweep(armR, [0.095, 0.065], { color: TUNIC, section: "box", name: "armR" });
  for (const [s, hand, chain] of [[1, armL.tip.at, armL], [-1, armR.tip.at, armR]] as const) {
    sphere(0.105, SKIN_LIGHT, hand, chain.tip, [1.0, 0.82, 1.18]);
    cyl(0.105, 0.055, LEATHER, [hand[0], hand[1] + 0.015, hand[2]], chain.tip, 8);
    for (let i = 0; i < 3; i++) {
      sphere(0.027, SKIN, [hand[0] + (i - 1) * 0.047, hand[1] - 0.05, hand[2] + 0.065], chain.tip);
    }
  }

  // Head and face, settled before helmet and hair.
  const skull = sphere(0.255, SKIN, [0, 1.48, 0.055], head, [1.03, 1.04, 0.90]);
  const skullSurface = b.surface(skull);
  const eyeTex = animeEye({ iris: "#48b9d1", irisLight: "#b8f5ff", blush: "#bd5c58", size: 256 });

  for (const s of [-1, 1]) {
    const eyeAt = new THREE.Vector3(s * 0.105, 1.515, 0.245);
    sphere(0.048, INK, eyeAt, head, [1, 0.82, 0.48]);
    sphere(0.031, "#8de9ed", [s * 0.105, 1.515, 0.274], head, [1, 1, 0.25]);
    sphere(0.012, WHITE, [s * 0.092, 1.532, 0.286], head);
    const hit = skullSurface.around([0, 1.48, 0.055]).at(s * 38, 4);
    if (hit) b.decal(skullSurface, eyeTex, { at: hit, size: [0.095, 0.12], mirror: s > 0, lift: 0.003 });
  }

  // Nose, brows, ears and open lower jaw.
  sphere(0.082, SKIN_LIGHT, [0, 1.43, 0.285], head, [1.0, 0.85, 0.8]);
  box(0.14, 0.025, 0.035, HAIR, [0, 1.565, 0.238], head);
  for (const s of [-1, 1]) {
    sphere(0.10, SKIN, [s * 0.245, 1.48, 0.04], head, [0.55, 1.0, 0.75]);
    sphere(0.075, SKIN_LIGHT, [s * 0.255, 1.49, 0.105], head, [0.55, 1.0, 0.55]);
  }
  const jawSweep = b.sweep(
    polyline([
      [0, 1.34, 0.15],
      [0, 1.28, 0.19],
      [0, 1.27, 0.10],
    ]),
    [0.14, 0.09],
    { bone: jaw, color: SKIN, section: "box", name: "lowerJaw" },
  );
  box(0.16, 0.025, 0.025, INK, [0, 1.355, 0.274], jaw);

  // Signature beard: broad mass, moustache, cheek ruffs, braids.
  b.sweep(
    catmull([
      [0, 1.43, 0.21],
      [0, 1.34, 0.25],
      [0, 1.18, 0.19],
      [0, 1.02, 0.10],
    ]),
    (t) => 0.15 - t * 0.105,
    { bone: head, color: BEARD, section: "box", sides: 7, name: "heroicBeard" },
  );
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.06, 1.445, 0.255],
        [s * 0.15, 1.405, 0.255],
        [s * 0.20, 1.32, 0.21],
      ]),
      [0.065, 0.032],
      { bone: head, color: BEARD, sides: 7, name: `moustache${s}` },
    );
    b.sweep(
      catmull([
        [s * 0.19, 1.40, 0.11],
        [s * 0.25, 1.30, 0.10],
        [s * 0.22, 1.20, 0.07],
      ]),
      [0.07, 0.025],
      { bone: head, color: HAIR, sides: 7, name: `cheekRuff${s}` },
    );
    const braid = b.sweep(
      catmull([
        [s * 0.06, 1.23, 0.20],
        [s * 0.10, 1.08, 0.16],
        [s * 0.12, 0.91, 0.12],
      ]),
      [0.045, 0.018],
      { bone: head, color: BEARD, sides: 6, name: `braid${s}` },
    );
    for (let i = 0; i < 4; i++) {
      const p = braid.at(0.20 + i * 0.20);
      sphere(0.052, i % 2 ? GOLD : BEARD, p.at, p.bone);
    }
  }

  // Helmet: iron bowl, nose guard, side wings and gold crest.
  const helmet = b.lathe(
    [
      [0, 0],
      [0.20, 0],
      [0.245, 0.035],
      [0.235, 0.14],
      [0.17, 0.23],
      [0, 0.25],
    ],
    { at: [0, 1.51, 0.02], bone: head, color: IRON, segments: 10, name: "helmetBowl" },
  );
  box(0.31, 0.045, 0.42, IRON_DARK, [0, 1.60, 0.015], head);
  box(0.045, 0.20, 0.30, STEEL, [0, 1.48, 0.27], head);
  for (const s of [-1, 1]) {
    const wing = b.extrude(
      [
        [0, 0],
        [0.16, 0.05],
        [0.22, 0.15],
        [0.11, 0.22],
        [0.02, 0.15],
      ],
      { at: [s * 0.18, 1.54, 0.01], x: [s, 0, 0], thickness: 0.035, bevel: 0.008, color: STEEL, bone: head },
    );
    sphere(0.025, GOLD, wing.local([0.10, 0.11, 0.025]), head);
  }
  cone(0.07, 0.21, RED, [0, 1.78, 0.015], [0, 1, 0], head);
  cyl(0.055, 0.025, GOLD, [0, 1.67, 0.015], head);
  for (const s of [-1, 1]) {
    cyl(0.018, 0.22, GOLD, [s * 0.13, 1.61, 0.08], head, 6);
  }

  // Apron and shoulder straps, laid over the body.
  box(0.36, 0.44, 0.035, LEATHER_LIGHT, [0, 0.92, 0.225], spine.joints[1]);
  box(0.40, 0.045, 0.05, GOLD, [0, 1.13, 0.245], spine.joints[2]);
  for (const s of [-1, 1]) {
    b.rod([s * 0.20, 1.17, 0.21], [s * 0.11, 0.78, 0.24], 0.025, { color: LEATHER, bone: spine.joints[2] });
    sphere(0.025, GOLD, [s * 0.19, 1.16, 0.245], spine.joints[2]);
  }
  for (let i = 0; i < 5; i++) {
    sphere(0.022, GOLD, [(i - 2) * 0.075, 0.98, 0.25], spine.joints[1]);
  }

  // Left hand holds the hammer, right hand rests near the work.
  const hammerGrip = new THREE.Vector3(0.42, 0.86, 0.28);
  cyl(0.027, 0.48, LEATHER_LIGHT, [0.49, 1.05, 0.31], armL.tip, 8);
  box(0.20, 0.13, 0.15, STEEL, [0.49, 1.29, 0.31], armL.tip);
  box(0.26, 0.08, 0.19, STEEL, [0.49, 1.24, 0.31], armL.tip);
  sphere(0.045, GOLD, [0.49, 1.12, 0.31], armL.tip);

  // Anvil, the named prop: chunky base, waist, face plate and horn.
  box(0.50, 0.14, 0.28, IRON_DARK, [0, 0.43, 0.38]);
  box(0.28, 0.35, 0.20, IRON, [0, 0.25, 0.38]);
  box(0.40, 0.10, 0.27, ANVIL_TOP, [0, 0.54, 0.38]);
  box(0.46, 0.045, 0.30, STEEL, [0, 0.615, 0.38]);
  cone(0.13, 0.38, STEEL, [0, 0.615, 0.60], [0, 0, 1]);
  box(0.08, 0.055, 0.22, IRON_DARK, [0, 0.62, 0.23]);
  for (const s of [-1, 1]) {
    box(0.12, 0.08, 0.22, IRON, [s * 0.20, 0.17, 0.38]);
    sphere(0.025, GOLD, [s * 0.16, 0.35, 0.50]);
  }

  // A few readable anvil details: hardy hole, rim bolts, glowing hot billet.
  cyl(0.047, 0.012, IRON_DARK, [0, 0.646, 0.40], undefined, 6);
  for (const s of [-1, 1]) {
    cyl(0.024, 0.018, GOLD, [s * 0.17, 0.645, 0.30], undefined, 8);
    cyl(0.024, 0.018, GOLD, [s * 0.17, 0.645, 0.47], undefined, 8);
  }
  const billet = box(0.06, 0.035, 0.17, FIRE, [0.06, 0.665, 0.40]);
  glow(billet, 1.8);
  const billetTip = box(0.052, 0.018, 0.09, FIRE_YELLOW, [0.06, 0.693, 0.40]);
  glow(billetTip, 2.4);

  // Sparks and hot rivets are small but add the blacksmith story.
  const spark = (x: number, y: number, z: number, r = 0.012) => {
    const p = sphere(r, FIRE_YELLOW, [x, y, z]);
    glow(p, 2.2);
  };
  spark(-0.10, 0.78, 0.43);
  spark(0.13, 0.84, 0.41);
  spark(0.04, 0.91, 0.39, 0.009);
  spark(-0.15, 0.70, 0.45, 0.008);
  spark(0.18, 0.75, 0.44, 0.009);

  // Small leather tool loops and shoulder studs.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.19, 1.08, 0.245],
        [s * 0.23, 0.98, 0.26],
        [s * 0.20, 0.89, 0.26],
      ]),
      0.014,
      { color: LEATHER, bone: spine.joints[1], sides: 6, name: `toolLoop${s}` },
    );
    sphere(0.025, GOLD, [s * 0.27, 1.17, 0.19], spine.joints[2]);
  }

  // Add a compact engraved emblem to the apron as a dark/gold primitive badge.
  cyl(0.055, 0.018, GOLD, [0, 1.02, 0.255], spine.joints[1], 8);
  box(0.012, 0.070, 0.020, INK, [0, 1.02, 0.268], spine.joints[1]);
  box(0.070, 0.012, 0.020, INK, [0, 1.02, 0.268], spine.joints[1]);

  return b.root;
}
```