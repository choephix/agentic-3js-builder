import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { paint } from "../src/paint";

export const meta = {
  name: "Samurai Warrior",
  builtBy: "GPT-6 Astra",
  description:
    "A compact samurai in full lamellar armour: indigo and vermilion lames, laced sode, kabuto and menpo, twin swords, and a family banner rising behind the shoulders.",
};

const INK = "#111827";
const INDIGO = "#263b67";
const INDIGO_DARK = "#182846";
const LACQUER = "#8f2534";
const RED = "#bf4351";
const GOLD = "#c89b3c";
const GOLD_LIGHT = "#e1bd63";
const SASH = "#40243d";
const GRIP = "#2b1715";
const BLADE = "#d7e2e8";
const BANNER = "#2e4868";
const BANNER_LIGHT = "#d0a04a";

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

type Pt = [number, number] | [number, number, "sharp"];

const stripedCloth = paint((_p, n, s) => {
  const stripe = Math.floor((s[1] + 0.5) * 9) % 2;
  const light = 0.5 + 0.25 * n.y;
  return stripe === 0 ? (light > 0.5 ? "#d9b37c" : "#aa815d") : "#704b4e";
});

const lacquerPaint = paint((_p, n, s) => {
  const edge = Math.abs(s[1] - 0.5) > 0.43;
  return edge || n.y > 0.65 ? RED : LACQUER;
});

function outlinePlate(width: number, height: number): Pt[] {
  return [
    [-width * 0.5, height * 0.5, "sharp"],
    [width * 0.5, height * 0.5, "sharp"],
    [width * 0.46, -height * 0.2],
    [width * 0.25, -height * 0.5, "sharp"],
    [0, -height * 0.43],
    [-width * 0.25, -height * 0.5, "sharp"],
    [-width * 0.46, -height * 0.2],
  ];
}

export default function build() {
  const b = createBuilder({ name: "samuraiWarrior", paintSize: 1024 });

  // -----------------------------------------------------------------------------------------------
  // Skeleton: a readable neutral puppet pose, with the first joint of every limb off the mid-plane.
  const hips = b.joint("hips", { at: [0, 0.94, 0], role: "spine", group: "torso" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.97, 0],
      [0, 1.12, 0.015],
      [0, 1.3, 0.035],
      [0, 1.48, 0.04],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const [spine1, spine2, chest] = spine.joints;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.48, 0.04], aim: [0, 1.58, 0.06], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.58, 0.06], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.57, 0.12], aim: [0, 1.53, 0.22], role: "jaw", group: "head" });

  const legs = SIDES.map(([s, side]) =>
    b.chain(
      `leg${side}`,
      [
        [s * 0.16, 0.92, 0],
        [s * 0.18, 0.57, 0.02],
        [s * 0.18, 0.19, 0.025],
        [s * 0.18, 0.08, 0.12],
        [s * 0.18, 0.045, 0.27],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        role: "leg",
        contact: [s * 0.18, 0, 0.2],
        group: `leg${side}`,
      },
    ),
  );

  const arms = SIDES.map(([s, side]) => {
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.14, 1.43, 0.025],
      aim: [s * 0.36, 1.41, 0],
      role: "arm",
      group: `arm${side}`,
    });
    const chain = b.chain(
      `arm${side}`,
      [
        [s * 0.36, 1.41, 0],
        [s * 0.64, 1.2, -0.015],
        [s * 0.86, 1.04, 0.04],
        [s * 1.0, 1.0, 0.12],
      ],
      {
        parent: clavicle,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        group: `arm${side}`,
      },
    );
    return { s, side, clavicle, chain, shoulder: chain.joints[0], elbow: chain.joints[1], wrist: chain.joints[2] };
  });

  // -----------------------------------------------------------------------------------------------
  // Torso and under-armour fabric.
  b.loft(
    [
      { at: [0, 0.92, 0], w: 0.38, h: 0.24 },
      { at: [0, 1.08, 0.015], w: 0.44, h: 0.26 },
      { at: [0, 1.27, 0.03], w: 0.52, h: 0.31 },
      { at: [0, 1.44, 0.035], w: 0.66, h: 0.34 },
      { at: [0, 1.51, 0.04], w: 0.38, h: 0.25 },
    ],
    { bone: [hips, spine], color: stripedCloth, sides: 8, group: "under armour", name: "fabric torso" },
  );

  // Lamellar chest rows, each row offset a little so the scalloped lower edges remain visible.
  for (let i = 0; i < 4; i++) {
    const y = 1.16 + i * 0.075;
    const w = 0.43 + i * 0.045;
    b.frustumBox([0, y + 0.018, 0.11], [0, y - 0.026, 0.14], [w, 0.13], [w * 0.94, 0.11], {
      bone: i < 2 ? spine1 : spine2,
      color: i % 2 ? lacquerPaint : INDIGO,
      group: "lamellar torso",
      name: `chest lame ${i + 1}`,
    });
    b.rod([0, y - 0.035, 0.205], [0, y - 0.035, 0.22], 0.009, { bone: i < 2 ? spine1 : spine2, color: GOLD, sides: 6, group: "lamellar trim" });
  }
  b.part(new THREE.BoxGeometry(0.52, 0.055, 0.08), GOLD, { bone: hips, at: [0, 1.08, 0.19], group: "lamellar trim", name: "waist rim" });
  b.part(new THREE.BoxGeometry(0.54, 0.09, 0.08), SASH, { bone: hips, at: [0, 1.02, 0.09], group: "sash", name: "obi" });
  b.part(new THREE.BoxGeometry(0.22, 0.11, 0.035), GOLD, { bone: hips, at: [0, 1.03, 0.145], group: "sash", name: "obi clasp" });

  // -----------------------------------------------------------------------------------------------
  // Layered kusazuri skirt: four rows around the hips, with visible red laces.
  const skirtPlate = outlinePlate(0.16, 0.27);
  for (const [s] of SIDES) {
    for (let row = 0; row < 3; row++) {
      const y = 0.99 - row * 0.075;
      const spread = 0.22 + row * 0.015;
      for (let k = 0; k < 5; k++) {
        const angle = -0.82 + k * 0.41;
        const x = s * Math.sin(angle) * spread;
        const z = Math.cos(angle) * 0.19 + 0.03;
        b.extrude(skirtPlate, {
          at: [x, y, z],
          x: [Math.cos(angle), 0, -s * Math.sin(angle)],
          y: [-s * Math.sin(angle) * 0.18, 1, -Math.cos(angle) * 0.18],
          thickness: 0.018,
          bevel: 0.004,
          bone: hips,
          color: row % 2 ? INDIGO : lacquerPaint,
          group: "kusazuri skirt",
          name: `skirt plate ${s > 0 ? "L" : "R"}-${row}-${k}`,
        });
        b.rod([x - s * 0.026, y + 0.085, z + 0.015], [x + s * 0.026, y + 0.085, z + 0.015], 0.006, { bone: hips, color: GOLD_LIGHT, sides: 5, group: "skirt lacing" });
      }
    }
  }
  // Front apron plates make the silhouette unmistakably Japanese without hiding the sash.
  for (let i = 0; i < 3; i++) {
    b.extrude(outlinePlate(0.2 - i * 0.01, 0.28), {
      at: [0, 0.98 - i * 0.074, 0.205],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.004,
      bone: hips,
      color: i % 2 ? INDIGO : lacquerPaint,
      group: "front kusazuri",
    });
  }

  // -----------------------------------------------------------------------------------------------
  // Legs: padded sleeves under lamellar thigh, knee guards, shin plates and split-toe sabatons.
  for (const [i, [s, side]] of SIDES.entries()) {
    const [hip, knee, ankle, toe] = legs[i].joints;
    const group = `leg${side}`;
    b.sweep(legs[i], (t) => 0.07 - t * 0.028, { from: 0, to: legs[i].ts[2], color: SASH, sides: 7, group, caps: "round" });
    b.frustumBox([s * 0.16, 0.89, 0.015], [s * 0.18, 0.62, 0.04], [0.2, 0.23], [0.18, 0.2], { bone: hip, color: INDIGO, group, name: "thigh plate" });
    b.part(new THREE.SphereGeometry(0.105, 8, 5), GOLD, { bone: knee, at: [s * 0.18, 0.57, 0.1], scale: [1.05, 0.82, 0.8], group, name: "knee guard" });
    b.frustumBox([s * 0.18, 0.52, 0.03], [s * 0.18, 0.2, 0.055], [0.18, 0.21], [0.15, 0.18], { bone: knee, color: lacquerPaint, group, name: "suneate" });
    b.rod([s * 0.18, 0.48, 0.16], [s * 0.18, 0.24, 0.16], 0.009, { bone: knee, color: GOLD, sides: 5, group });
    b.frustumBox([s * 0.18, 0.07, -0.1], [s * 0.18, 0.07, 0.14], [0.17, 0.13], [0.2, 0.12], { bone: ankle, color: INDIGO_DARK, group, name: "foot armour" });
    b.frustumBox([s * 0.18, 0.07, 0.14], [s * 0.18, 0.045, 0.3], [0.19, 0.12], [0.13, 0.09], { bone: toe, color: lacquerPaint, group, name: "toe plate" });
  }

  // -----------------------------------------------------------------------------------------------
  // Arms, laced sode shoulder guards, forearm splints and simple armoured hands.
  for (const { s, side, shoulder, elbow, wrist, chain } of arms) {
    const group = `arm${side}`;
    b.sweep(chain, [0.075, 0.062, 0.05], { from: 0, to: 0.82, color: SASH, sides: 7, group, caps: "round" });
    b.frustumBox([s * 0.36, 1.41, 0], [s * 0.64, 1.2, -0.01], [0.15, 0.17], [0.13, 0.15], { bone: shoulder, color: INDIGO, group, name: "upper arm plate" });
    b.part(new THREE.SphereGeometry(0.09, 8, 5), GOLD, { bone: elbow, at: [s * 0.64, 1.2, 0.02], scale: [1.0, 0.9, 0.82], group, name: "elbow cop" });
    b.frustumBox([s * 0.64, 1.18, -0.01], [s * 0.86, 1.04, 0.04], [0.13, 0.15], [0.16, 0.16], { bone: elbow, color: lacquerPaint, group, name: "kote forearm" });
    b.part(new THREE.BoxGeometry(0.16, 0.1, 0.11), INDIGO_DARK, { bone: wrist, at: [s * 0.97, 1.0, 0.1], group, name: "gauntlet" });
    for (let finger = -1; finger <= 1; finger++) {
      b.rod([s * 1.01, 0.99 + finger * 0.022, 0.15], [s * 1.06, 0.98 + finger * 0.024, 0.2], 0.011, { bone: wrist, color: INDIGO, sides: 5, group, name: `finger ${finger}` });
    }
    b.spike([s * 0.98, 1.04, 0.08], [s * 0.3, 0.1, 0.6], 0.08, 0.018, { bone: wrist, color: GOLD, group });

    // Four overlapping sode plates hang from each shoulder; narrow red cords cross their faces.
    for (let plate = 0; plate < 4; plate++) {
      const x = s * (0.39 + plate * 0.065);
      const y = 1.47 - plate * 0.055;
      const w = 0.29 - plate * 0.018;
      const h = 0.22 - plate * 0.012;
      b.extrude(outlinePlate(w, h), {
        at: [x, y, 0.035],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.006,
        bone: shoulder,
        color: plate % 2 ? lacquerPaint : INDIGO,
        group: "sode",
        name: `sode ${side} ${plate + 1}`,
      });
      b.rod([x - w * 0.35, y + 0.03, 0.06], [x + w * 0.3, y - 0.04, 0.06], 0.006, { bone: shoulder, color: GOLD_LIGHT, sides: 5, group: "sode lacing" });
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Kabuto: faceted bowl, broad shikoro brim, raised front crest, and separate menpo + jaw.
  b.lathe(
    [
      [0, -0.12],
      [0.17, -0.12],
      [0.21, -0.07],
      [0.2, 0.05],
      [0.15, 0.14],
      [0.08, 0.19],
      [0, 0.2],
    ],
    { at: [0, 1.56, 0.03], axis: [0, 1, 0], segments: 10, bone: head, color: INDIGO_DARK, group: "kabuto", name: "kabuto bowl" },
  );
  b.lathe(
    [[0.12, -0.02], [0.3, -0.01], [0.33, 0.025], [0.23, 0.05], [0.12, 0.045]],
    { at: [0, 1.57, 0.03], axis: [0, 1, 0], segments: 10, bone: head, color: LACQUER, group: "kabuto", name: "kabuto brim" },
  );
  const CREST: Pt[] = [[-0.06, -0.02], [-0.09, 0.1], [-0.045, 0.15, "sharp"], [0, 0.21, "sharp"], [0.045, 0.15, "sharp"], [0.09, 0.1], [0.06, -0.02]];
  b.extrude(CREST, { at: [0, 1.63, -0.015], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.006, bone: head, color: GOLD, group: "kabuto", name: "maedate crest" });
  for (const s of [-1, 1]) {
    b.rod([s * 0.115, 1.62, 0.02], [s * 0.16, 1.53, 0.06], 0.009, { bone: head, color: GOLD_LIGHT, sides: 5, group: "kabuto lacing" });
  }

  const MENPO: Pt[] = [
    [-0.14, 0.06],
    [-0.17, 0.0],
    [-0.13, -0.1],
    [-0.08, -0.16],
    [0, -0.19, "sharp"],
    [0.08, -0.16],
    [0.13, -0.1],
    [0.17, 0],
    [0.14, 0.06],
    [0, 0.1, "sharp"],
  ];
  b.extrude(MENPO, { at: [0, 1.61, 0.205], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.055, bevel: 0.009, bone: head, color: lacquerPaint, group: "menpo", name: "menpo mask" });
  b.part(new THREE.BoxGeometry(0.035, 0.09, 0.035), GOLD, { bone: head, at: [0, 1.64, 0.245], group: "menpo", name: "nose ridge" });
  for (const s of [-1, 1]) {
    b.rod([s * 0.07, 1.625, 0.245], [s * 0.13, 1.61, 0.245], 0.006, { bone: head, color: INK, sides: 5, group: "menpo", name: "eye slit" });
  }
  b.part(new THREE.BoxGeometry(0.19, 0.07, 0.06), INDIGO_DARK, { bone: jaw, at: [0, 1.52, 0.175], group: "menpo", name: "separate jaw" });
  for (let i = -2; i <= 2; i++) b.rod([i * 0.03, 1.52, 0.21], [i * 0.03, 1.47, 0.21], 0.004, { bone: jaw, color: GOLD, sides: 4, group: "menpo grille" });

  // -----------------------------------------------------------------------------------------------
  // Twin swords at the sash: lacquered saya, braided handles, guards, and exposed bright blades.
  const sword = (s: number, long: boolean) => {
    const base = [s * (long ? 0.24 : 0.31), 1.03, -0.035] as [number, number, number];
    const sayaEnd = [s * (long ? 0.39 : 0.4), 1.045, long ? 0.39 : 0.27] as [number, number, number];
    const tip = [s * (long ? 0.53 : 0.5), 1.06, long ? 0.76 : 0.54] as [number, number, number];
    const gripEnd = [s * (long ? 0.18 : 0.25), 1.025, -0.18] as [number, number, number];
    const group = long ? "katana" : "wakizashi";
    b.rod(base, sayaEnd, 0.026, { bone: hips, color: long ? INDIGO_DARK : LACQUER, sides: 7, group, name: "saya" });
    b.rod(gripEnd, base, 0.018, { bone: hips, color: GRIP, sides: 6, group, name: "tsuka" });
    b.part(new THREE.TorusGeometry(0.045, 0.009, 5, 8), GOLD, { bone: hips, at: base, rotation: [90, 0, 0], group, name: "tsuba" });
    b.sweep([base, tip], [0.014, 0], { bone: hips, color: BLADE, sides: 4, caps: { start: "flat", end: "point" }, group, name: "blade" });
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const x = gripEnd[0] * (1 - t) + base[0] * t;
      const z = gripEnd[2] * (1 - t) + base[2] * t;
      b.rod([x - s * 0.018, 1.025, z], [x + s * 0.018, 1.025, z], 0.004, { bone: hips, color: GOLD_LIGHT, sides: 4, group, name: "grip wrap" });
    }
  };
  sword(1, true);
  sword(-1, false);

  // -----------------------------------------------------------------------------------------------
  // Rear sashimono banner: a black-iron pole, swallow-tail flag, crest disk, and hanging ties.
  b.rod([-0.39, 1.02, -0.25], [-0.39, 1.85, -0.25], 0.014, { bone: chest, color: INK, sides: 6, group: "banner", name: "banner pole" });
  b.part(new THREE.SphereGeometry(0.028, 7, 5), GOLD, { bone: chest, at: [-0.39, 1.86, -0.25], group: "banner", name: "pole cap" });
  const FLAG: Pt[] = [[0, 0], [0.48, 0.02], [0.39, -0.12], [0.48, -0.23], [0.0, -0.3]];
  b.extrude(FLAG, { at: [-0.39, 1.77, -0.25], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.002, bone: chest, color: BANNER, group: "banner", name: "sashimono flag" });
  b.rod([-0.34, 1.69, -0.265], [0.02, 1.71, -0.265], 0.007, { bone: chest, color: BANNER_LIGHT, sides: 5, group: "banner", name: "flag tie" });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.012, 8), BANNER_LIGHT, { bone: chest, at: [-0.16, 1.63, -0.27], rotation: [90, 0, 0], group: "banner", name: "mon crest" });
  for (const x of [-0.28, -0.2, -0.12]) {
    b.sweep([[x, 1.62, -0.27], [x, 1.5, -0.27]], [0.009, 0.003], { bone: chest, color: BANNER_LIGHT, sides: 5, caps: { start: "flat", end: "point" }, group: "banner ties" });
  }

  return b.root;
}
