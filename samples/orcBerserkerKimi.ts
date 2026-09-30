import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame, line, type Spot } from "../src/frame";
import { limb } from "../src/ik";
import { lerp, rng } from "../src/math";
import { noise, paint } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Orc Berserker · Kimi",
  description:
    "A hulking green-skinned orc berserker about 2.1 m tall: heavy brow, small glowing eyes, pointed ears, a separate lower jaw with upward tusks, a topknot with braids, red war paint. Bare muscular torso with leather belts, a bandolier, a fur loincloth, studded bracers and a spiked shoulder guard; a two-handed axe held in one hand. Humanoid rest pose with arms held out from the body.",
};

export default function build() {
  const b = createBuilder({ name: "orcBerserkerKimi" });

  // ---------------------------------------------------------------------------
  // Palette
  // ---------------------------------------------------------------------------
  const SKIN = "#4a7034";
  const SKIN_D = "#2e4a20";
  const SKIN_L = "#6a9448";
  const WAR_RED = "#a3131f";
  const WAR_WHITE = "#e8e4d8";
  const TUSK = "#f2e6c4";
  const MOUTH = "#401a18";
  const HAIR = "#17120e";
  const LEATHER_D = "#33200f";
  const LEATHER_M = "#4d3018";
  const LEATHER_L = "#6b4526";
  const FUR = "#3d2a18";
  const FUR_TIP = "#63452a";
  const IRON = "#3f4753";
  const IRON_D = "#23272e";
  const IRON_EDGE = "#aeb6c2";
  const BRONZE = "#c07a1e";
  const WOOD = "#3c2812";
  const EYE = "#ffd23e";

  // Anatomical shading shared by every skin part
  const shade = (_p: THREE.Vector3, n: THREE.Vector3) =>
    n.y < -0.35 ? SKIN_D : n.y > 0.55 ? SKIN_L : SKIN;

  // Skin with tribal war paint: a red band across brow and eyes, three claw
  // slashes over the right chest with a white accent cut.
  const skinPaint = paint((p, n) => {
    if (p.y > 1.85 && p.y < 1.9 && p.z > 0.16) return WAR_RED;
    if (p.z > 0.1 && p.y > 1.18 && p.y < 1.62) {
      const d = p.x * 0.85 + (p.y - 1.4) * 1.15;
      if (Math.abs(d + 0.02) < 0.018 || Math.abs(d - 0.09) < 0.015 || Math.abs(d - 0.19) < 0.012)
        return WAR_RED;
      if (Math.abs(d - 0.145) < 0.006) return WAR_WHITE;
    }
    return shade(p, n);
  });

  // Upper arms carry a red painted band keyed to the tube's own t.
  const armPaint = paint((p, n, s) => (s[0] > 0.34 && s[0] < 0.48 ? WAR_RED : shade(p, n)));

  // Two-tone rough fur
  const furPaint = paint((p) => (noise(p, 0.07) > 0.5 ? FUR_TIP : FUR));

  // ---------------------------------------------------------------------------
  // Skeleton (2.1 m humanoid, broad heavy warrior)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.06, 0], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    [
      [0, 1.06, 0],
      [0, 1.24, 0.01],
      [0, 1.46, 0.03],
      [0, 1.64, 0.02],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      [0, 1.64, 0.02],
      [0, 1.72, 0.06],
      [0, 1.79, 0.09],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "head" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.79, 0.09],
    aim: [0, 1.96, 0.17],
    role: "head",
    group: "head",
  });

  // Separate lower jaw so the mouth can open
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.775, 0.13],
    aim: [0, 1.7, 0.3],
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------------------
  // Torso: pelvis + V-taper ribcage, then muscle masses
  // ---------------------------------------------------------------------------
  const pelvisLoft = b.loft(
    [
      { at: [0, 0.95, -0.02], w: 0.36, h: 0.27 },
      { at: [0, 1.06, -0.01], w: 0.4, h: 0.29 },
      { at: [0, 1.17, 0.0], w: 0.39, h: 0.28 },
    ],
    { bone: [hips, spine.joints[0]], color: skinPaint, group: "torso" },
  );

  const chestLoft = b.loft(
    [
      { at: [0, 1.17, 0.0], w: 0.39, h: 0.28 },
      { at: [0, 1.32, 0.02], w: 0.48, h: 0.32 },
      { at: [0, 1.48, 0.03], w: 0.58, h: 0.36 },
      { at: [0, 1.62, 0.02], w: 0.52, h: 0.34 },
    ],
    { bone: [hips, spine.joints[0], spine.joints[1], chest], color: skinPaint, group: "torso" },
  );

  for (const s of [1, -1]) {
    // Pecs
    const pecGeo = new THREE.SphereGeometry(0.125, 8, 6);
    pecGeo.scale(1.15, 0.8, 0.62);
    b.part(pecGeo, skinPaint, {
      bone: chest,
      at: [s * 0.145, 1.495, 0.19],
      dir: [s * 0.2, 0.1, 1],
      group: "torso",
    });
    b.part(new THREE.SphereGeometry(0.013, 5, 4), SKIN_D, {
      bone: chest,
      at: [s * 0.15, 1.465, 0.26],
      group: "torso",
    });

    // Six-pack
    for (let row = 0; row < 3; row++) {
      const abGeo = new THREE.SphereGeometry(0.052, 6, 4);
      abGeo.scale(1.15, 0.7, 0.45);
      b.part(abGeo, skinPaint, {
        bone: spine.joints[row === 0 ? 1 : 0],
        at: [s * 0.072, 1.36 - row * 0.07, 0.175 - row * 0.014],
        group: "torso",
      });
    }

    // Lats and traps
    const latGeo = new THREE.SphereGeometry(0.13, 6, 6);
    latGeo.scale(0.75, 1.25, 0.55);
    b.part(latGeo, skinPaint, {
      bone: chest,
      at: [s * 0.24, 1.46, -0.06],
      dir: [s * 0.5, 0.8, -0.3],
      group: "torso",
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.13, 0.22, 6), skinPaint, {
      bone: chest,
      at: [s * 0.16, 1.635, 0.0],
      dir: [s * 0.45, 0.8, -0.1],
      group: "torso",
    });
  }

  b.sweep(neck, [0.14, 0.13, 0.115], { color: skinPaint, group: "head" });

  // ---------------------------------------------------------------------------
  // Head: heavy brow, small glowing eyes, pointed ears, snout, separate jaw
  // ---------------------------------------------------------------------------
  const skullGeo = new THREE.SphereGeometry(0.145, 12, 9);
  skullGeo.scale(1.0, 1.08, 1.05);
  b.part(skullGeo, skinPaint, { bone: head, at: [0, 1.9, 0.1], group: "head" });

  // Heavy jutting brow
  b.part(new THREE.BoxGeometry(0.24, 0.05, 0.1), skinPaint, {
    bone: head,
    at: [0, 1.9, 0.225],
    rotation: [12, 0, 0],
    group: "head",
  });

  for (const s of [1, -1]) {
    // Cheekbones
    const cheekGeo = new THREE.SphereGeometry(0.06, 6, 6);
    cheekGeo.scale(1.2, 0.8, 0.85);
    b.part(cheekGeo, skinPaint, { bone: head, at: [s * 0.105, 1.815, 0.185], group: "head" });

    // Small deep-set glowing eyes under the brow
    b.part(new THREE.SphereGeometry(0.026, 6, 5), MOUTH, {
      bone: head,
      at: [s * 0.068, 1.874, 0.248],
      group: "head",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.02, 6, 5), EYE, {
        bone: head,
        at: [s * 0.068, 1.874, 0.278],
        group: "head",
      }),
      2.0,
    );

    // Pointed ears sweeping out, up and back
    b.sweep(
      catmull([
        [s * 0.135, 1.875, 0.07],
        [s * 0.225, 1.915, 0.01],
        [s * 0.305, 1.985, -0.05],
      ]),
      [0.034, 0.02, 0.003],
      { bone: head, caps: "point", color: skinPaint, group: "head" },
    );
    // Bronze ear ring on the left ear
    if (s === 1)
      b.part(new THREE.TorusGeometry(0.018, 0.004, 4, 10), BRONZE, {
        bone: head,
        at: [0.265, 1.94, -0.02],
        rotation: [0, 40, 0],
        group: "head",
      });
  }

  // Broad flat snout and nostrils
  b.part(new THREE.BoxGeometry(0.085, 0.06, 0.085), skinPaint, {
    bone: head,
    at: [0, 1.815, 0.248],
    rotation: [-8, 0, 0],
    group: "head",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.012, 5, 4), MOUTH, {
      bone: head,
      at: [s * 0.026, 1.792, 0.283],
      group: "head",
    });

  // Upper lip, dark mouth interior, downward upper fangs
  b.part(new THREE.BoxGeometry(0.16, 0.04, 0.085), skinPaint, {
    bone: head,
    at: [0, 1.772, 0.235],
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.016, 0.05), MOUTH, {
    bone: head,
    at: [0, 1.752, 0.262],
    group: "head",
  });
  for (const s of [1, -1])
    b.spike([s * 0.034, 1.752, 0.258], [0, -1, 0.1], 0.032, 0.01, {
      bone: head,
      color: TUSK,
      group: "head",
    });

  // Lower jaw: main mass, jutting chin, big upward tusks and incisors
  b.part(new THREE.BoxGeometry(0.18, 0.055, 0.13), skinPaint, {
    bone: jaw,
    at: [0, 1.722, 0.21],
    group: "jaw",
  });
  const chinGeo = new THREE.SphereGeometry(0.07, 6, 6);
  chinGeo.scale(1.15, 0.65, 1.0);
  b.part(chinGeo, skinPaint, { bone: jaw, at: [0, 1.7, 0.25], group: "jaw" });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.062, 1.755, 0.265],
        [s * 0.078, 1.845, 0.285],
        [s * 0.088, 1.925, 0.255],
      ]),
      [0.021, 0.013, 0.002],
      { bone: jaw, caps: "point", color: TUSK, group: "jaw" },
    );
    b.sweep(
      catmull([
        [s * 0.03, 1.755, 0.27],
        [s * 0.036, 1.805, 0.28],
      ]),
      [0.012, 0.002],
      { bone: jaw, caps: "point", color: TUSK, group: "jaw" },
    );
  }

  // ---------------------------------------------------------------------------
  // Topknot and braids
  // ---------------------------------------------------------------------------
  const hairCap = new THREE.SphereGeometry(0.125, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.42);
  b.part(hairCap, HAIR, { bone: head, at: [0, 1.945, 0.085], rotation: [-18, 0, 0], group: "head" });
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.04, 6), BRONZE, {
    bone: head,
    at: [0, 2.03, 0.04],
    rotation: [-20, 0, 0],
    group: "head",
  });
  b.sweep(
    catmull([
      [0, 2.03, 0.04],
      [0, 2.065, 0.0],
      [0.02, 2.03, -0.12],
      [0, 1.93, -0.24],
      [-0.02, 1.78, -0.3],
    ]),
    [0.04, 0.048, 0.033, 0.017, 0.004],
    { bone: head, caps: "point", color: HAIR, group: "head" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.085, 1.97, 0.03],
        [s * 0.125, 1.89, -0.04],
        [s * 0.13, 1.77, -0.07],
        [s * 0.11, 1.63, -0.05],
      ]),
      [0.019, 0.016, 0.012, 0.005],
      { bone: head, caps: "point", color: HAIR, group: "head" },
    );
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.02, 5), BRONZE, {
      bone: head,
      at: [s * 0.13, 1.77, -0.07],
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // Legs: IK-planted, bare muscular legs and bare feet with toes and claws
  // ---------------------------------------------------------------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hipAt: [number, number, number] = [s * 0.2, 1.0, -0.01];
    const ankleAt: [number, number, number] = [s * 0.24, 0.15, 0.0];
    const legPts = limb(hipAt, ankleAt, [0.45, 0.45], [[0, 0, 1]]);
    const footBall: [number, number, number] = [s * 0.25, 0.075, 0.13];
    const toeTip: [number, number, number] = [s * 0.25, 0.045, 0.24];

    const leg = b.chain(`leg${side}`, [...legPts, footBall, toeTip], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.25, 0, 0.15],
      group: `leg${side}`,
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const toeJ = leg.joints[4];

    // Thigh and calf
    b.sweep([legPts[0], legPts[1]], [0.165, 0.175, 0.135], {
      bone: [hipJ, kneeJ],
      color: skinPaint,
      group: `leg${side}`,
    });
    const calf = b.sweep([legPts[1], legPts[2]], [0.13, 0.14, 0.1], {
      bone: [kneeJ, ankleJ],
      color: skinPaint,
      group: `leg${side}`,
    });

    // Leather calf strap seated on the skin
    const strapLoop = b
      .surface(calf)
      .loop(frame(lerp(legPts[1], legPts[2], 0.55), lerp(legPts[2], legPts[1], 0.55)), {
        lift: 0.004,
      });
    b.sweep(strapLoop, 0.014, { color: LEATHER_M, group: `leg${side}` });

    // Bare foot
    b.loft(
      [
        { at: [s * 0.24, 0.15, 0.0], w: 0.15, h: 0.15 },
        { at: [s * 0.25, 0.1, 0.06], w: 0.16, h: 0.12 },
        { at: [s * 0.25, 0.07, 0.16], w: 0.15, h: 0.1 },
        { at: [s * 0.25, 0.045, 0.24], w: 0.12, h: 0.07 },
      ],
      { bone: [ankleJ, leg.joints[3], toeJ], color: skinPaint, group: `leg${side}` },
    );

    // Three toes with claws
    const toeNames = ["big", "mid", "pinky"];
    for (let k = 0; k < 3; k++) {
      const bx = s * 0.25 + (k - 1) * 0.05;
      const tx = s * 0.25 + (k - 1) * 0.065;
      const toe = b.chain(
        `${toeNames[k]}Toe${side}`,
        [
          [bx, 0.04, 0.24],
          [tx, 0.022, 0.35],
        ],
        { parent: toeJ, names: [`${toeNames[k]}Toe${side}`], role: "digit", group: `leg${side}` },
      );
      b.sweep(toe, [0.026, 0.018], { color: skinPaint, group: `leg${side}` });
      b.spike([tx, 0.022, 0.35], [0, -0.25, 1], 0.045, 0.011, {
        bone: toe.joints[0],
        color: TUSK,
        group: `leg${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Belts, bandolier, fur loincloth
  // ---------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 1.03, 0.0], w: 0.42, h: 0.31 },
      { at: [0, 1.09, 0.01], w: 0.43, h: 0.32 },
      { at: [0, 1.15, 0.01], w: 0.41, h: 0.3 },
    ],
    { bone: [hips, spine.joints[0]], color: LEATHER_D, group: "torso" },
  );
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.045), BRONZE, {
    bone: hips,
    at: [0, 1.09, 0.2],
    group: "torso",
  });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), IRON, {
    bone: hips,
    at: [0, 1.09, 0.235],
    group: "torso",
  });
  // Trophy skulls hanging off the belt
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 6, 5), TUSK, {
      bone: hips,
      at: [s * 0.17, 1.0, 0.16],
      group: "torso",
    });
    b.part(new THREE.BoxGeometry(0.04, 0.025, 0.035), TUSK, {
      bone: hips,
      at: [s * 0.17, 0.965, 0.165],
      group: "torso",
    });
    for (const e of [1, -1])
      b.part(new THREE.SphereGeometry(0.008, 5, 4), MOUTH, {
        bone: hips,
        at: [s * 0.17 + e * 0.013, 1.004, 0.19],
        group: "torso",
      });
  }

  // Bandolier draped over the chest from the right shoulder to the left hip
  const bandolierRough = catmull(
    [
      [-0.26, 1.64, 0.1],
      [-0.13, 1.5, 0.23],
      [0.04, 1.32, 0.23],
      [0.22, 1.12, 0.16],
      [0.21, 1.08, -0.12],
      [0.05, 1.26, -0.2],
      [-0.14, 1.46, -0.18],
    ],
    { closed: true },
  );
  const bandolier = b.surface([chestLoft, pelvisLoft]).drape(bandolierRough, { lift: 0.012 });
  b.sweep(bandolier, () => [0.038, 0.013], {
    bone: [chest, spine.joints[1], spine.joints[0]],
    color: LEATHER_L,
    section: "box",
    group: "torso",
  });
  b.along(
    bandolier,
    3,
    (at) =>
      b.part(new THREE.BoxGeometry(0.06, 0.08, 0.05), LEATHER_D, {
        bone: chest,
        at: at.at,
        group: "torso",
      }),
    { from: 0.08, to: 0.4 },
  );

  // Fur loincloth: thin front and back flaps with a ragged card fringe
  b.sweep(
    catmull([
      [0, 1.11, 0.18],
      [0, 0.93, 0.19],
      [0, 0.77, 0.175],
      [0, 0.62, 0.16],
    ]),
    (t) => [0.16 - 0.06 * t, 0.024],
    { bone: [hips, spine.joints[0]], color: furPaint, section: "box", caps: "flat", group: "torso" },
  );
  b.sweep(
    catmull([
      [0, 1.1, -0.175],
      [0, 0.92, -0.18],
      [0, 0.77, -0.17],
      [0, 0.64, -0.155],
    ]),
    (t) => [0.17 - 0.06 * t, 0.024],
    { bone: [hips, spine.joints[0]], color: furPaint, section: "box", caps: "flat", group: "torso" },
  );
  const furTuft = svg(
    `<svg viewBox="0 0 24 40"><path d="M0 0 H24 V20 L19 26 L21 38 L14 27 L12 39 L8 26 L3 33 L0 22 Z" fill="#4a3524"/><path d="M4 0 H20 V16 L16 24 L17 33 L12 22 L9 30 L6 20 L4 26 Z" fill="#63452a"/></svg>`,
    { size: 64 },
  );
  const fringe: Spot[] = [];
  for (let i = 0; i < 6; i++) {
    const x = -0.09 + i * 0.036;
    fringe.push(frame([x, 0.615, 0.16], [0, -1, 0.12]));
    fringe.push(frame([x, 0.635, -0.155], [0, -1, -0.12]));
  }
  b.cards(fringe, furTuft, { size: [0.05, 0.11], vary: 0.35, rng: rng(11), color: FUR });

  // ---------------------------------------------------------------------------
  // Arms: held out from the body; bracers, pauldron, hands and digits
  // ---------------------------------------------------------------------------
  let wristR: Joint | null = null;

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulderAt: [number, number, number] = [s * 0.31, 1.585, 0.02];
    const elbowAt: [number, number, number] = [s * 0.6, 1.345, 0.06];
    const wristAt: [number, number, number] = [s * 0.86, 1.13, 0.11];

    const arm = b.chain(`arm${side}`, [shoulderAt, elbowAt, wristAt], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    const shoulderJ = arm.joints[0];
    const elbowJ = arm.joints[1];
    const wristJ = arm.joints[2];
    if (side === "R") wristR = wristJ;

    // Deltoid cap, upper arm (with war-paint band), forearm
    const deltGeo = new THREE.SphereGeometry(0.135, 8, 6);
    deltGeo.scale(1.05, 1.15, 1.05);
    b.part(deltGeo, skinPaint, { bone: shoulderJ, at: [s * 0.335, 1.615, 0.02], group: `arm${side}` });
    b.sweep([shoulderAt, elbowAt], [0.135, 0.15, 0.115], {
      bone: [shoulderJ, elbowJ],
      color: armPaint,
      group: `arm${side}`,
    });
    b.sweep([elbowAt, wristAt], [0.115, 0.125, 0.09], {
      bone: [elbowJ, wristJ],
      color: skinPaint,
      group: `arm${side}`,
    });

    // Studded leather bracer
    const bracerAt = lerp(elbowAt, wristAt, 0.45);
    const bracerDir = lerp(elbowAt, wristAt, 0.9).sub(lerp(elbowAt, wristAt, 0.1));
    b.part(new THREE.CylinderGeometry(0.135, 0.152, 0.26, 8), LEATHER_D, {
      bone: elbowJ,
      at: bracerAt,
      dir: bracerDir,
      group: `arm${side}`,
    });
    b.ring(line(lerp(elbowAt, wristAt, 0.3), lerp(elbowAt, wristAt, 0.6)), { count: 8, radius: 0.15 }, (stud) =>
      b.stick(new THREE.SphereGeometry(0.016, 5, 4), BRONZE, stud),
    );

    // Spiked shoulder guard on the left, leather cop on the right
    if (side === "L") {
      b.part(new THREE.SphereGeometry(0.23, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.52), IRON_D, {
        bone: shoulderJ,
        at: [0.37, 1.7, 0.02],
        rotation: [-12, 0, -38],
        group: "armL",
      });
      b.part(new THREE.TorusGeometry(0.226, 0.022, 4, 12), BRONZE, {
        bone: shoulderJ,
        at: [0.37, 1.66, 0.02],
        rotation: [-12, 0, -38],
        group: "armL",
      });
      for (const d of [
        [0.2, 0.85, 0.15],
        [0.65, 0.6, -0.2],
        [0.55, 0.35, 0.55],
        [-0.15, 0.85, -0.35],
      ])
        b.spike([0.37 + d[0] * 0.18, 1.7 + d[1] * 0.18, 0.02 + d[2] * 0.18], d, 0.15, 0.032, {
          bone: shoulderJ,
          color: IRON_EDGE,
          group: "armL",
        });
    } else {
      b.part(new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.45), LEATHER_M, {
        bone: shoulderJ,
        at: [-0.35, 1.64, 0.02],
        rotation: [-10, 0, 32],
        group: "armR",
      });
      for (const d of [
        [-0.45, 1.7, 0.06],
        [-0.42, 1.72, -0.06],
        [-0.47, 1.63, 0.0],
      ])
        b.part(new THREE.SphereGeometry(0.014, 5, 4), BRONZE, { bone: shoulderJ, at: d, group: "armR" });
    }

    // -------------------------------------------------------------------------
    // Hands and digits
    // -------------------------------------------------------------------------
    if (side === "L") {
      // Open hand, fingers extended and spread
      const handDir = new THREE.Vector3(
        wristAt[0] - elbowAt[0],
        wristAt[1] - elbowAt[1],
        wristAt[2] - elbowAt[2],
      ).normalize();
      const palmC = new THREE.Vector3(...wristAt).addScaledVector(handDir, 0.09);
      const spread = new THREE.Vector3().crossVectors(handDir, new THREE.Vector3(0, 0, 1)).normalize();
      const palmFace = new THREE.Vector3().crossVectors(spread, handDir).normalize();
      b.part(new THREE.BoxGeometry(0.14, 0.11, 0.06), skinPaint, {
        bone: wristJ,
        at: palmC,
        dir: handDir,
        up: [0, 0, 1],
        group: "armL",
      });
      const fingerNames = ["index", "middle", "ring", "pinky"];
      for (let k = 0; k < 4; k++) {
        const off = (k - 1.5) * 0.034;
        const base = palmC.clone().addScaledVector(spread, off).addScaledVector(handDir, 0.05);
        const fdir = handDir
          .clone()
          .addScaledVector(spread, off * 3.5)
          .addScaledVector(palmFace, 0.15)
          .normalize();
        const mid = base.clone().addScaledVector(fdir, 0.055);
        const tip = base.clone().addScaledVector(fdir, 0.115).addScaledVector(palmFace, 0.01);
        b.sweep(
          b.chain(`finger${fingerNames[k]}L`, [base, mid, tip], {
            parent: wristJ,
            names: [`${fingerNames[k]}1L`, `${fingerNames[k]}2L`, `${fingerNames[k]}3L`],
            role: "digit",
            group: "armL",
          }),
          [0.017, 0.014, 0.009],
          { caps: "point", color: skinPaint, group: "armL" },
        );
      }
      const tBase = palmC.clone().addScaledVector(palmFace, 0.035).addScaledVector(spread, -0.045);
      const tDir = palmFace
        .clone()
        .addScaledVector(handDir, 0.4)
        .addScaledVector(spread, -0.3)
        .normalize();
      b.sweep(
        b.chain(
          "fingerThumbL",
          [tBase, tBase.clone().addScaledVector(tDir, 0.05), tBase.clone().addScaledVector(tDir, 0.1)],
          {
            parent: wristJ,
            names: ["thumb1L", "thumb2L", "thumb3L"],
            role: "digit",
            group: "armL",
          },
        ),
        [0.018, 0.015, 0.009],
        { caps: "point", color: skinPaint, group: "armL" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Two-handed greataxe gripped in the right fist
  // ---------------------------------------------------------------------------
  const axeBone = wristR ?? chest;
  const shaftButt: [number, number, number] = [-1.02, 0.3, 0.0];
  const shaftTop: [number, number, number] = [-0.72, 1.88, 0.19];
  const shaftDir = new THREE.Vector3(
    shaftTop[0] - shaftButt[0],
    shaftTop[1] - shaftButt[1],
    shaftTop[2] - shaftButt[2],
  ).normalize();
  const gripAt: [number, number, number] = [-0.862, 1.13, 0.1];

  b.sweep(catmull([shaftButt, gripAt, shaftTop]), 0.032, {
    bone: axeBone,
    color: WOOD,
    section: { ngon: 8 },
    caps: "flat",
    group: "axe",
  });
  // Leather grip wrap where the fist closes
  b.sweep(
    catmull([
      [-0.887, 1.0, 0.083],
      gripAt,
      [-0.837, 1.26, 0.117],
    ]),
    0.042,
    { bone: axeBone, color: LEATHER_L, group: "axe" },
  );
  // Iron butt spike
  b.spike(shaftButt, [-0.185, -0.976, -0.117], 0.13, 0.03, { bone: axeBone, color: IRON, group: "axe" });
  // Head collar, iron band and top thrusting spike
  const collarAt: [number, number, number] = [-0.75, 1.72, 0.171];
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), IRON_D, {
    bone: axeBone,
    at: collarAt,
    dir: shaftDir,
    group: "axe",
  });
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.035, 8), IRON, {
    bone: axeBone,
    at: [-0.795, 1.55, 0.144],
    dir: shaftDir,
    group: "axe",
  });
  b.spike(shaftTop, shaftDir, 0.22, 0.042, { bone: axeBone, color: IRON_EDGE, group: "axe" });

  // Double bit: front bearded cleaver, back armor-piercing hook
  b.extrude(
    [
      [0, 0.09, "sharp"],
      [0.15, 0.14],
      [0.3, 0.3, "sharp"],
      [0.3, 0.14],
      [0.33, 0.02, "sharp"],
      [0.3, -0.1],
      [0.35, -0.26, "sharp"],
      [0.14, -0.15],
      [0, -0.09, "sharp"],
    ] as const,
    {
      at: collarAt,
      x: [0, -0.12, 0.99],
      y: [0.185, 0.976, 0.117],
      thickness: [0.05, 0.012],
      bevel: 0.008,
      color: IRON_EDGE,
      bone: axeBone,
      group: "axe",
    },
  );
  b.extrude(
    [
      [0, 0.07, "sharp"],
      [-0.12, 0.09],
      [-0.26, 0.15, "sharp"],
      [-0.22, 0.0],
      [-0.28, -0.12, "sharp"],
      [-0.1, -0.06],
      [0, -0.06, "sharp"],
    ] as const,
    {
      at: collarAt,
      x: [0, 0.12, -0.99],
      y: [0.185, 0.976, 0.117],
      thickness: [0.045, 0.01],
      bevel: 0.006,
      color: IRON_D,
      bone: axeBone,
      group: "axe",
    },
  );
  b.part(new THREE.SphereGeometry(0.045, 6, 5), BRONZE, {
    bone: axeBone,
    at: [-0.795, 1.72, 0.171],
    group: "axe",
  });

  // Right fist wrapped around the shaft
  const grip = frame(gripAt, [0.185, 0.976, 0.117], [1, 0, 0]);
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.075), skinPaint, {
    frame: grip.moved([0, -0.02, -0.048]),
    bone: axeBone,
    group: "armR",
  });
  const fingerNamesR = ["index", "middle", "ring", "pinky"];
  for (let k = 0; k < 4; k++) {
    const yk = 0.02 - k * 0.034;
    b.sweep(
      b.chain(
        `finger${fingerNamesR[k]}R`,
        [
          grip.local([0.0, yk, -0.058]),
          grip.local([0.055, yk, -0.02]),
          grip.local([0.048, yk, 0.04]),
          grip.local([-0.005, yk, 0.055]),
        ],
        {
          parent: axeBone,
          names: [`${fingerNamesR[k]}1R`, `${fingerNamesR[k]}2R`, `${fingerNamesR[k]}3R`],
          role: "digit",
          group: "armR",
        },
      ),
      [0.019, 0.016, 0.013, 0.009],
      { caps: "point", color: skinPaint, group: "armR" },
    );
  }
  b.sweep(
    b.chain(
      "fingerThumbR",
      [grip.local([0.0, 0.058, -0.045]), grip.local([0.048, 0.035, 0.005]), grip.local([0.012, 0.015, 0.05])],
      { parent: axeBone, names: ["thumb1R", "thumb2R"], role: "digit", group: "armR" },
    ),
    [0.018, 0.015, 0.009],
    { caps: "point", color: skinPaint, group: "armR" },
  );

  return b.root;
}
