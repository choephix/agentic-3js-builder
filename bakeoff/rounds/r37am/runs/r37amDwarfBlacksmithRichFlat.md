```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description:
    "A stout Warcraft-inspired dwarf blacksmith with a huge braided beard, horned helmet, leather apron, hammer, anvil, forge, and glowing coals.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const SKIN = cel("#c9784a", "#733b32");
  const SKIN_LIGHT = cel("#e19a63", "#8b4b3c");
  const BEARD = cel("#5a2f22", "#24151a");
  const BEARD_TIP = cel("#9a5631", "#48231e");
  const HAIR = cel("#301b1c", "#160f15");
  const CLOTH = cel("#3a2931", "#18151d");
  const APRON = cel("#70462f", "#35231f");
  const LEATHER = cel("#9a5a32", "#482b25");
  const BRASS = cel("#d59635", "#70431f");
  const GOLD = cel("#f0bf54", "#946126");
  const STEEL = cel("#74808a", "#303942");
  const STEEL_DARK = cel("#3c4650", "#1b222b");
  const IRON = cel("#34343b", "#17181e");
  const WOOD = cel("#6e3c25", "#321c1b");
  const COAL = "#1c1720";
  const FIRE = "#ff7a24";
  const FIRE_YELLOW = "#ffd05a";
  const EYE = animeEye({ iris: "#56c6d5", irisLight: "#b4ffff", brow: true });

  const box = (
    size: [number, number, number],
    color: any,
    at: any,
    bone?: any,
    name?: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      scale,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: any,
    at: any,
    bone?: any,
    scale?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: any,
    at: any,
    dir: any = [0, 1, 0],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      dir,
      bone,
      name,
      flat: true,
    });

  // -----------------------------------------------------------------------------------------------
  // Skeleton first: squat spine, hinged jaw, planted legs, broad working arms.
  // -----------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.68, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.67, 0],
      [0, 0.88, 0.01],
      [0, 1.06, 0.02],
    ],
    { parent: hips, names: ["pelvis", "chest", "shoulders"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.06, 0.02],
      [0, 1.18, 0.04],
      [0, 1.27, 0.08],
    ],
    { parent: spine.tip, names: ["neck", "neck2", "head"], role: "neck" },
  );

  const head = neck.tip;
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.205, 0.18],
    dir: [0, -0.14, 1],
    role: "jaw",
    group: "face",
  });

  const legL = b.chain(
    "legL",
    [
      [0.18, 0.67, 0],
      [0.20, 0.40, 0.025],
      [0.22, 0.15, 0.10],
      [0.22, 0.08, 0.18],
    ],
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.22, 0, 0.18] },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.18, 0.67, 0],
      [-0.20, 0.40, 0.025],
      [-0.22, 0.15, 0.10],
      [-0.22, 0.08, 0.18],
    ],
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.22, 0, 0.18] },
  );

  const armL = b.chain(
    "armL",
    [
      [0.29, 1.02, 0.02],
      [0.43, 0.91, 0.10],
      [0.58, 0.76, 0.18],
      [0.52, 0.69, 0.24],
    ],
    { parent: spine.tip, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );

  const armR = b.chain(
    "armR",
    [
      [-0.29, 1.02, 0.02],
      [-0.43, 0.92, 0.11],
      [-0.46, 0.79, 0.25],
      [-0.37, 0.84, 0.33],
    ],
    { parent: spine.tip, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  // -----------------------------------------------------------------------------------------------
  // Body and clothing.
  // -----------------------------------------------------------------------------------------------

  const torso = b.sweep(spine, (t) => 0.245 - t * 0.025, {
    color: CLOTH,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "broad wool torso",
  });

  b.sweep(spine, (t) => 0.22 - t * 0.015, {
    color: furEdge(CLOTH, APRON, {
      axis: [0, 0, 1],
      by: "normal",
      level: 0.18,
      teeth: 0.22,
      period: 0.06,
    }),
    from: 0.12,
    to: 0.92,
    sides: 8,
    caps: "none",
    name: "front tunic",
  });

  b.sweep(legL, [0.115, 0.09], { color: CLOTH, sides: 7, name: "left trouser" });
  b.sweep(legR, [0.115, 0.09], { color: CLOTH, sides: 7, name: "right trouser" });

  b.sweep(legL.path.slice(0.55, 1), [0.105, 0.075], {
    color: LEATHER,
    sides: 7,
    name: "left boot",
  });
  b.sweep(legR.path.slice(0.55, 1), [0.105, 0.075], {
    color: LEATHER,
    sides: 7,
    name: "right boot",
  });

  box([0.20, 0.065, 0.32], LEATHER, [0.22, 0.065, 0.19], legL.tip, "left boot sole");
  box([0.20, 0.065, 0.32], LEATHER, [-0.22, 0.065, 0.19], legR.tip, "right boot sole");

  // Buckled belt and large apron.
  const belt = b.surface(torso).loop(spine.at(0.28), { lift: 0.012 });
  b.sweep(belt, 0.024, { color: LEATHER, sides: 8, name: "heavy belt" });
  box([0.18, 0.18, 0.035], BRASS, [0, 0.70, 0.245], hips, "belt buckle");
  box([0.10, 0.075, 0.012], GOLD, [0, 0.70, 0.267], hips, "buckle inset");

  const apron = b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0.16, 0.32],
      [0.11, 0.49],
      [-0.11, 0.49],
      [-0.16, 0.32],
    ],
    {
      at: [0, 0.72, 0.235],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.012,
      color: APRON,
      bone: hips,
      name: "apron",
    },
  );
  b.sweep(
    [
      [0, 0.75, 0.258],
      [0, 1.16, 0.258],
    ],
    0.012,
    { color: LEATHER, bone: hips, name: "apron neck strap" },
  );
  for (const x of [-0.13, 0.13]) {
    cylinder(0.018, 0.018, BRASS, [x, 1.02, 0.274], [0, 0, 1], hips, "apron rivet");
    cylinder(0.018, 0.018, BRASS, [x, 0.82, 0.274], [0, 0, 1], hips, "apron rivet");
  }

  // -----------------------------------------------------------------------------------------------
  // Arms, gloves, and working hands.
  // -----------------------------------------------------------------------------------------------

  b.sweep(armL, (t) => (t < 0.45 ? 0.095 : 0.075), {
    color: LEATHER,
    sides: 7,
    name: "left leather sleeve",
  });
  b.sweep(armR, (t) => (t < 0.45 ? 0.095 : 0.072), {
    color: LEATHER,
    sides: 7,
    name: "right leather sleeve",
  });

  sphere(0.085, SKIN_LIGHT, armL.tip.at, armL.tip.bone, [1.05, 0.85, 1.1], "left hand");
  sphere(0.08, SKIN_LIGHT, armR.tip.at, armR.tip.bone, [1.05, 0.85, 1.1], "right hand");

  for (const s of [-1, 1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    for (let i = 0; i < 3; i++) {
      const p = hand.local([s * (0.035 + i * 0.027), -0.025, 0.07]);
      b.spike(p, [0, 0.15, 0.95], 0.055, 0.015, {
        color: SKIN_LIGHT,
        bone: hand.bone,
        name: "thick finger",
      });
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Head, ears, nose, eyes, brows, and hinged lower jaw.
  // -----------------------------------------------------------------------------------------------

  sphere(0.215, SKIN, head.at, head, [1.0, 1.02, 0.92], "dwarf head");
  sphere(0.145, SKIN_LIGHT, [0, 1.195, 0.218], head, [1.12, 0.72, 0.66], "muzzle");

  for (const s of [-1, 1]) {
    sphere(0.075, SKIN_LIGHT, [s * 0.205, 1.285, 0.055], head, [0.55, 1, 0.7], "round ear");
    sphere(0.043, SKIN, [s * 0.217, 1.285, 0.08], head, [0.55, 1, 0.7], "ear inner");
  }

  sphere(0.052, SKIN_LIGHT, [0, 1.235, 0.398], head, [0.9, 0.78, 0.75], "big nose");
  sphere(0.018, INK, [-0.022, 1.243, 0.435], head, undefined, "nose nostril");
  sphere(0.018, INK, [0.022, 1.243, 0.435], head, undefined, "nose nostril");

  const faceSurface = b.surface(head);
  for (const s of [-1, 1]) {
    const eyeHit = faceSurface.around(head.at).at(s * 34, 7);
    if (eyeHit) {
      b.decal(faceSurface, EYE, {
        at: eyeHit,
        size: [0.085, 0.105],
        lift: 0.004,
        mirror: s > 0,
        name: s > 0 ? "left anime eye" : "right anime eye",
      });
    }
  }

  // Brows are broad, expressive iron-dark wedges above the eyes.
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.075, 1.365, 0.245],
      [s * 0.145, 1.382, 0.225],
      0.018,
      HAIR,
      { bone: head, name: "heavy brow" },
    );
  }

  // Separate lower jaw, beard root, and visible mouth opening.
  sphere(0.135, SKIN, [0, 1.165, 0.20], jaw, [1.05, 0.55, 0.8], "lower jaw");
  box([0.105, 0.024, 0.018], INK, [0, 1.196, 0.398], jaw, "mouth opening");
  b.pose(jaw, { axis: [1, 0, 0], deg: -7 });

  // -----------------------------------------------------------------------------------------------
  // Signature beard: large silhouette, cheek flares, moustache, braids and beads.
  // -----------------------------------------------------------------------------------------------

  b.sweep(
    [
      [0, 1.27, 0.26],
      [0, 1.16, 0.31],
      [0, 1.03, 0.30],
      [0, 0.91, 0.22],
    ],
    [0.17, 0.055],
    { color: BEARD, bone: head, sides: 8, name: "hero beard" },
  );

  for (const s of [-1, 1]) {
    b.sweep(
      [
        [s * 0.12, 1.29, 0.19],
        [s * 0.19, 1.20, 0.23],
        [s * 0.18, 1.08, 0.25],
      ],
      [0.075, 0.035],
      { color: BEARD_TIP, bone: head, sides: 7, name: "cheek beard flare" },
    );

    b.spike([s * 0.055, 1.245, 0.41], [s * 0.18, -0.02, 0.08], null, 0.034, {
      color: BEARD_TIP,
      bone: head,
      name: "moustache curl",
    });

    const braid = b.chain(
      `braid${s > 0 ? "L" : "R"}`,
      [
        [s * 0.095, 1.13, 0.29],
        [s * 0.13, 1.02, 0.28],
        [s * 0.11, 0.91, 0.25],
        [s * 0.075, 0.81, 0.20],
      ],
      {
        parent: head,
        names: [`braidRoot${s > 0 ? "L" : "R"}`, `braidMid${s > 0 ? "L" : "R"}`, `braidTip${s > 0 ? "L" : "R"}`, `beardTie${s > 0 ? "L" : "R"}`],
        role: "digit",
      },
    );
    b.sweep(braid, [0.032, 0.014], {
      color: BEARD_TIP,
      sides: 7,
      name: "braided beard",
    });
    for (let i = 0; i < 3; i++) {
      const p = braid.at(0.2 + i * 0.27).at;
      sphere(0.022, GOLD, p, braid.at(0.2 + i * 0.27).bone, [1, 0.7, 1], "braid bead");
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Helmet: broad skullcap, brow band, cheek guards, brass horns and crest.
  // -----------------------------------------------------------------------------------------------

  sphere(0.235, STEEL_DARK, [0, 1.39, 0.025], head, [1.08, 0.55, 1.02], "iron helmet dome");
  box([0.48, 0.065, 0.07], STEEL, [0, 1.315, 0.205], head, "helmet brow band");
  box([0.055, 0.22, 0.15], STEEL, [0.21, 1.20, 0.08], head, "helmet cheek guard");
  box([0.055, 0.22, 0.15], STEEL, [-0.21, 1.20, 0.08], head, "helmet cheek guard");
  box([0.12, 0.12, 0.025], BRASS, [0, 1.48, 0.246], head, "helmet badge");
  box([0.028, 0.075, 0.035], GOLD, [0, 1.49, 0.265], head, "helmet badge stripe");

  for (const s of [-1, 1]) {
    b.spike([s * 0.17, 1.47, 0.03], [s * 0.28, 0.13, -0.02], 0.20, 0.045, {
      color: BRASS,
      bone: head,
      name: "helmet horn",
    });
    sphere(0.028, GOLD, [s * 0.17, 1.40, 0.23], head, undefined, "helmet rivet");
  }

  // -----------------------------------------------------------------------------------------------
  // Hammer held above the anvil.
  // -----------------------------------------------------------------------------------------------

  const hammerHandleTop: [number, number, number] = [-0.49, 1.20, 0.42];
  b.rod(armR.tip.at, hammerHandleTop, 0.026, WOOD, {
    bone: armR.tip.bone,
    caps: "flat",
    name: "hammer wooden handle",
  });
  box([0.25, 0.14, 0.17], STEEL_DARK, [-0.49, 1.25, 0.43], armR.tip.bone, "hammer head");
  box([0.07, 0.17, 0.20], STEEL, [-0.49, 1.25, 0.43], armR.tip.bone, "hammer face");
  box([0.07, 0.13, 0.20], STEEL, [-0.61, 1.25, 0.43], armR.tip.bone, "hammer peen");
  cylinder(0.032, 0.035, BRASS, [-0.49, 1.18, 0.43], [0, 1, 0], armR.tip.bone, "hammer collar");

  // -----------------------------------------------------------------------------------------------
  // Anvil, deliberately chunky and slightly to the dwarf's left.
  // -----------------------------------------------------------------------------------------------

  const anvilX = 0.48;
  box([0.34, 0.12, 0.28], IRON, [anvilX, 0.49, 0.25], undefined, "anvil waist");
  b.frustumBox(
    [anvilX, 0.55, 0.25],
    [anvilX, 0.78, 0.25],
    [0.24, 0.18],
    [0.34, 0.22],
    { color: IRON, caps: "flat", name: "anvil body" },
  );
  box([0.48, 0.09, 0.31], STEEL_DARK, [anvilX, 0.80, 0.25], undefined, "anvil face");
  box([0.15, 0.06, 0.29], STEEL, [anvilX, 0.875, 0.25], undefined, "anvil polished face");
  b.spike([anvilX + 0.20, 0.84, 0.25], [0.27, 0.02, 0.25], null, 0.075, {
    color: STEEL_DARK,
    name: "anvil horn",
  });
  for (const x of [anvilX - 0.18, anvilX + 0.18]) {
    for (const z of [0.14, 0.36]) sphere(0.022, STEEL, [x, 0.86, z], undefined, undefined, "anvil rivet");
  }

  // A few bright impact sparks floating just above the face.
  const sparks = [
    [0.37, 0.99, 0.30],
    [0.55, 1.04, 0.25],
    [0.66, 0.96, 0.34],
    [0.43, 1.08, 0.22],
  ] as const;
  for (let i = 0; i < sparks.length; i++) {
    const p = sparks[i];
    const spark = b.spike(p, [i % 2 ? -0.3 : 0.2, 0.8, i % 3 ? 0.2 : -0.1], 0.07 + i * 0.008, 0.009, {
      color: i % 2 ? FIRE_YELLOW : FIRE,
      name: "hot spark",
    });
    glow(spark, 2);
  }

  // -----------------------------------------------------------------------------------------------
  // Compact forge behind the anvil: stone blocks, grate, coals and a glowing fire bowl.
  // -----------------------------------------------------------------------------------------------

  const forgeX = 0.82;
  box([0.42, 0.38, 0.34], IRON, [forgeX, 0.22, -0.20], undefined, "forge masonry");
  box([0.46, 0.08, 0.38], STEEL_DARK, [forgeX, 0.43, -0.20], undefined, "forge rim");
  box([0.30, 0.05, 0.25], COAL, [forgeX, 0.485, -0.20], undefined, "coal bed");

  for (const p of [
    [0.73, 0.515, -0.27],
    [0.83, 0.52, -0.16],
    [0.92, 0.515, -0.23],
    [0.78, 0.535, -0.20],
  ] as const) {
    const ember = sphere(0.034, FIRE, p, undefined, [1, 0.55, 1], "glowing coal");
    glow(ember, 2.4);
  }

  const flame = b.spike([forgeX, 0.52, -0.20], [0, 1, 0], 0.24, 0.09, {
    color: FIRE,
    name: "forge flame",
  });
  glow(flame, 2.5);
  const flameCore = b.spike([forgeX, 0.53, -0.20], [0.04, 1, 0.02], 0.14, 0.045, {
    color: FIRE_YELLOW,
    name: "flame core",
  });
  glow(flameCore, 3);

  // Bellows handle and simple side support.
  box([0.07, 0.44, 0.08], WOOD, [0.61, 0.29, -0.22], undefined, "forge side post");
  b.rod([0.61, 0.43, -0.22], [0.51, 0.70, -0.22], 0.018, WOOD, {
    name: "bellows handle",
  });

  // -----------------------------------------------------------------------------------------------
  // Final small accents: shoulder studs, apron tools, beard highlights, boot buckles.
  // -----------------------------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    sphere(0.035, BRASS, [s * 0.31, 1.03, 0.12], spine.tip, undefined, "shoulder stud");
    box([0.055, 0.10, 0.025], BRASS, [s * 0.12, 0.76, 0.29], hips, "apron pocket trim");
  }

  b.rod([0.15, 0.75, 0.28], [0.22, 0.61, 0.29], 0.012, STEEL, {
    bone: hips,
    name: "tongs on apron",
  });
  sphere(0.018, BRASS, [0.185, 0.70, 0.29], hips, undefined, "tongs rivet");

  for (const s of [-1, 1]) {
    box([0.08, 0.055, 0.025], BRASS, [s * 0.22, 0.12, 0.345], undefined, "boot buckle");
    b.spike([s * 0.04, 1.08, 0.34], [s * 0.11, -0.15, 0.04], 0.10, 0.018, {
      color: BEARD_TIP,
      bone: head,
      name: "beard highlight tuft",
    });
  }

  // A few deterministic leather grain studs, kept sparse and readable.
  const random = rng(41);
  for (let i = 0; i < 6; i++) {
    const x = -0.14 + random() * 0.28;
    const y = 0.80 + random() * 0.23;
    sphere(0.009, GOLD, [x, y, 0.286], hips, undefined, "apron stitch");
  }

  return b.root;
}
```