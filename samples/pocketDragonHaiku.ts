import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { bezier, catmull } from "../src/path";
import { gradient, paint, spots } from "../src/paint";

export const meta = {
  name: "Pocket Dragon",
  description:
    "A tiny, chubby pocket dragon sitting up: mint-green body with a cream belly, big sleepy-cute eyes, gold horns and spikes, a coral sash, a pink flower, and small coral wings folded on its back.",
  style: "whimsical",
  commit: "b816db2",
};

const MINT = "#5fcba8";
const MINT_DEEP = "#2f9d86";
const MINT_LIGHT = "#9aeccf";
const CREAM = "#fff1cc";
const PINK = "#ff8fae";
const GOLD = "#f8bc45";
const CLAW = "#fff8e6";
const WING = "#ff9a86";
const WING_DEEP = "#e8674a";
const INK = "#2a1f4a";
const WHITE = "#ffffff";
const MOUTH = "#8a2d4c";
const NOSTRIL = "#23705f";

const ball = (w = 18, h = 12) => new THREE.SphereGeometry(1, w, h);

export default function build() {
  const b = createBuilder({ name: "pocketDragon" });

  // Mint scales with darker dots on the back; an oval cream belly and a cream underside.
  const scales = spots(MINT, MINT_LIGHT, { size: 0.035, amount: 0.3, seed: 4 });
  const bodyPaint = paint((p, n) => {
    const belly = (p.x / 0.07) ** 2 + ((p.y - 0.08) / 0.075) ** 2 < 1 && n.z > 0.3;
    return belly || n.y < -0.35 ? CREAM : scales;
  });

  // Skeleton: hips on the floor, a spine chain up to the head, the sitting legs, arms, wings and tail.
  const hips = b.joint("hips", { at: [0, 0.035, 0], role: "spine" });
  const spine = b.chain(
    "torso",
    [
      [0, 0.035, 0],
      [0, 0.085, 0],
      [0, 0.13, 0.004],
      [0, 0.175, 0.014],
    ],
    { parent: hips, names: ["spine", "chest", "neck"], role: "spine" },
  );
  const neck = spine.joints[2];
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: neck, at: [0, 0.175, 0.02], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ up: -0.04 }), dir: [0, 0.2, 1], role: "jaw" });

  // Body: a chubby pear, widest at the belly, sitting flat on the floor.
  const body = b.loft(
    [
      { at: [0, 0.035, -0.005], w: 0.13, h: 0.07 },
      { at: [0, 0.085, 0], w: 0.165, h: 0.13 },
      { at: [0, 0.13, 0.004], w: 0.145, h: 0.115 },
      { at: [0, 0.172, 0.012], w: 0.1, h: 0.085 },
    ],
    { bone: [hips, spine], color: bodyPaint, sides: 14, caps: { start: "flat", end: "round" }, name: "body" },
  );

  // A coral sash round the belly with a gold buckle at the front, and a little navel above it.
  const sash = b.surface(body).loop(chest, { lift: 0.003 });
  b.sweep(sash, 0.0045, { color: WING_DEEP, name: "sash" });
  b.stick(new THREE.BoxGeometry(0.016, 0.014, 0.006), GOLD, b.surface(body).nearest([0, 0.09, 0.08]), {
    embed: 0.2,
    name: "buckle",
  });
  b.stick(new THREE.SphereGeometry(0.0045, 8, 6), MINT_DEEP, b.surface(body).nearest([0, 0.06, 0.07]), {
    embed: 0.4,
    name: "navel",
  });

  // Head: a big round skull, a stubby snout, a hinged lower jaw, large eyes and rosy cheeks.
  b.part(ball(), MINT, { bone: head, scale: [0.07, 0.062, 0.064], name: "skull" });
  const snout = b.part(ball(), MINT, {
    bone: head,
    at: head.local({ forward: 0.05, up: -0.02 }),
    scale: [0.034, 0.026, 0.032],
    name: "snout",
  });
  b.part(ball(), CREAM, {
    bone: jaw,
    at: jaw.local({ forward: 0.035, up: -0.006 }),
    scale: [0.03, 0.012, 0.04],
    name: "jawLower",
  });
  const smile = b.surface(snout).drape(
    catmull([
      head.local({ left: 0.024, up: -0.03, forward: 0.075 }),
      head.local({ left: 0, up: -0.036, forward: 0.085 }),
      head.local({ left: -0.024, up: -0.03, forward: 0.075 }),
    ]),
    { lift: 0.002 },
  );
  b.sweep(smile, 0.0025, { color: MOUTH, name: "mouth" });
  b.part(ball(8, 6), NOSTRIL, {
    bone: head,
    at: head.local({ left: 0.012, up: -0.012, forward: 0.08 }),
    scale: 0.0035,
    name: "nostrilL",
  });
  b.part(ball(8, 6), NOSTRIL, {
    bone: head,
    at: head.local({ left: -0.012, up: -0.012, forward: 0.08 }),
    scale: 0.0035,
    name: "nostrilR",
  });

  // A pink flower tucked on the top of the head.
  const flower = head.moved({ left: 0, up: 0.06, forward: 0.02 });
  b.ring(flower, { count: 5, radius: 0.011 }, (petal) =>
    b.part(ball(8, 6), PINK, { at: petal, scale: [0.008, 0.005, 0.008] }),
  );
  b.part(ball(8, 6), GOLD, { bone: head, at: flower, scale: 0.006, name: "flowerCentre" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eyes: a white ball, a dark pupil on its front and a tiny highlight.
    b.part(ball(10, 7), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.03, up: 0.012, forward: 0.05 }),
      scale: 0.02,
      name: `eyeWhite${side}`,
    });
    b.part(ball(8, 6), INK, {
      bone: head,
      at: head.local({ left: s * 0.03, up: 0.012, forward: 0.062 }),
      scale: 0.012,
      name: `pupil${side}`,
    });
    b.part(ball(6, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.036, up: 0.02, forward: 0.07 }),
      scale: 0.004,
      name: `shine${side}`,
    });

    // Cheeks, with a few freckles on each.
    b.part(ball(), PINK, {
      bone: head,
      at: head.local({ left: s * 0.05, up: -0.012, forward: 0.04 }),
      scale: [0.016, 0.012, 0.007],
      name: `cheek${side}`,
    });
    for (const [dx, dy, dz] of [
      [0.044, -0.008, 0.05],
      [0.058, -0.018, 0.046],
    ])
      b.part(ball(6, 4), "#e0607a", {
        bone: head,
        at: head.local({ left: s * dx, up: dy, forward: dz }),
        scale: 0.0028,
        name: `freckle${side}${dx}`,
      });

    // Little fin ears out to the side of the head, with a pink inner fin in front of each.
    b.extrude(
      [
        [0, 0.012],
        [0.02, 0.03],
        [0.058, 0.036, "sharp"],
        [0.035, 0],
        [0, -0.012],
      ],
      {
        at: head.local({ left: s * 0.05, up: 0.02, forward: -0.012 }),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.002,
        color: MINT_DEEP,
        bone: head,
        name: `ear${side}`,
      },
    );
    b.extrude(
      [
        [0, 0.008],
        [0.014, 0.022],
        [0.04, 0.028, "sharp"],
        [0.024, 0],
        [0, -0.008],
      ],
      {
        at: head.local({ left: s * 0.05, up: 0.02, forward: -0.004 }),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        bevel: 0.001,
        color: PINK,
        bone: head,
        name: `earInner${side}`,
      },
    );

    // Curly gold horns that sweep back from the top of the skull, tipped in cream.
    b.sweep(
      bezier(
        head.local({ left: s * 0.04, up: 0.04, forward: -0.004 }),
        head.local({ left: s * 0.06, up: 0.078, forward: -0.01 }),
        head.local({ left: s * 0.088, up: 0.09, forward: -0.045 }),
      ),
      [0.011, 0.003],
      {
        bone: head,
        color: GOLD,
        bands: [
          [0.7, GOLD],
          [1, CLAW],
        ],
        caps: { start: "round", end: "point" },
        name: `horn${side}`,
      },
    );

    // Legs: a plump thigh folded forward, a flat oval foot with toe bumps and three claws.
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.065, 0.048, 0],
        [s * 0.085, 0.036, 0.07],
        [s * 0.07, 0.026, 0.125],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.034, 0.028], { color: MINT, name: `thigh${side}` });
    const ankle = leg.joints[2];
    b.part(ball(), MINT, {
      bone: ankle,
      at: [s * 0.07, 0.024, 0.145],
      scale: [0.042, 0.024, 0.05],
      name: `foot${side}`,
    });
    for (const dx of [-0.016, 0, 0.016]) {
      b.part(ball(8, 6), MINT, {
        bone: ankle,
        at: [s * 0.07 + dx, 0.02, 0.19],
        scale: 0.012,
        name: `toe${side}${dx}`,
      });
      b.spike([s * 0.07 + dx, 0.018, 0.2], [0, -0.15, 1], 0.016, 0.0045, {
        bone: ankle,
        color: CLAW,
        name: `toeClaw${side}${dx}`,
      });
    }

    // Arms: short stubby arms resting on the belly, with a round paw and three claws.
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.07, 0.135, 0],
        [s * 0.1, 0.1, 0.025],
        [s * 0.072, 0.085, 0.065],
      ],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, [0.02, 0.016], { color: MINT, name: `arm${side}` });
    const hand = arm.joints[2];
    b.part(ball(), MINT, {
      bone: hand,
      at: [s * 0.072, 0.082, 0.07],
      scale: 0.024,
      name: `paw${side}`,
    });
    for (const dx of [-0.008, 0, 0.008])
      b.spike([s * 0.072 + dx, 0.08, 0.092], [0, -0.1, 1], 0.014, 0.004, {
        bone: hand,
        color: CLAW,
        name: `handClaw${side}${dx}`,
      });

    // Wings: small folded coral membranes with scalloped edges, pinned to the shoulders. The root
    // is deeper coral and the tips lighter.
    const wingRoot = [s * 0.04, 0.12, -0.04] as const;
    const wing = b.joint(`wing${side}`, {
      parent: chest,
      at: wingRoot,
      dir: [s * 0.6, 0.4, -0.7],
      role: "wing",
    });
    b.extrude(
      [
        [0, 0.0525],
        [0.0375, 0.0825],
        [0.0825, 0.079, "sharp"],
        [0.1125, 0.0375, "sharp"],
        [0.094, 0.026],
        [0.105, 0.004, "sharp"],
        [0.075, 0],
        [0.064, -0.015, "sharp"],
        [0.041, -0.0075],
        [0.026, -0.03, "sharp"],
        [0, -0.0225],
      ],
      {
        at: wingRoot,
        x: [s * 0.8, 0, -0.6],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.0015,
        color: gradient(WING_DEEP, WING, wingRoot, [s * 0.1, 0.19, -0.1]),
        bone: wing,
        name: `wing${side}`,
      },
    );
    for (const [u, v] of [
      [0.1125, 0.0375],
      [0.105, 0.004],
      [0.064, -0.015],
    ])
      b.rod([s * 0.04, 0.14, -0.04], [s * 0.04 + s * 0.8 * u, 0.12 + v, -0.04 - 0.6 * u], 0.0025, {
        bone: wing,
        color: WING_DEEP,
        name: `spar${side}${u}`,
      });
  }

  // Dorsal spikes: rays dropped onto the top of the back, gold and pink in turn.
  const back = b.surface(body);
  for (let i = 0; i < 6; i++) {
    const z = -0.01 - i * 0.011;
    const hit = back.ray([0, 1, z], [0, -1, 0]);
    if (hit) b.stick(new THREE.ConeGeometry(0.011, 0.04, 8), i % 2 ? PINK : GOLD, hit, { embed: 0.25, name: `spike${i}` });
  }

  // Tail: out behind, curling round to the right, with a coral band and a gold spade.
  const tail = b.chain(
    "tail",
    [
      [0, 0.035, -0.01],
      [0, 0.028, -0.08],
      [-0.03, 0.022, -0.13],
      [-0.08, 0.022, -0.13],
      [-0.11, 0.026, -0.09],
    ],
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.024, 0.008], {
    bands: [
      [0.8, MINT],
      [0.88, WING_DEEP],
      [1, MINT],
    ],
    name: "tail",
  });
  b.extrude(
    [
      [0, 0],
      [0.012, 0.016],
      [0.026, 0],
      [0.012, -0.02],
    ],
    {
      at: [-0.11, 0.026, -0.09],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      color: GOLD,
      bone: tail.joints[3],
      name: "tailSpade",
    },
  );

  return b.root;
}
