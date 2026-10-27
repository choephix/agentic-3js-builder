```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { cel, animeEye, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A colorful Slavic folk-art diorama of Baba Yaga's crooked log hut, perched on two expressive chicken legs with a witchy roof, glowing windows, carved trim, and a tiny crooked fence.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = cel("#8a4b25", "#4b2419");
  const WOOD_LIGHT = cel("#bd7438", "#71331f");
  const WOOD_DARK = cel("#4e291e", "#25171a");
  const ROOF = cel("#49375f", "#241d3c");
  const ROOF_EDGE = cel("#775b8f", "#392b59");
  const STRAW = cel("#b58c3e", "#675026");
  const LEG = cel("#d98b42", "#824628");
  const LEG_DARK = cel("#9a572d", "#4f2d25");
  const BEAK = "#d86632";
  const EYE_WHITE = "#fff3c4";
  const EYE_GLOW = "#ffd44a";
  const WINDOW = "#ffb42e";
  const WINDOW_DARK = "#6e3021";
  const METAL = "#5b6672";
  const IRON = "#2a2228";
  const MOSS = "#527244";
  const RED = "#a83235";
  const CREAM = "#ead39b";

  // ------------------------------------------------------------------------------------------
  // Skeleton first: the hut is carried by a central root and two readable chicken-leg chains.
  // ------------------------------------------------------------------------------------------

  const root = b.joint("hutRoot", {
    at: [0, 0.18, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const legL = b.chain(
    "legL",
    [
      [0.39, 0.82, 0.03],
      [0.48, 0.52, 0.06],
      [0.36, 0.23, 0.1],
      [0.34, 0.105, 0.13],
    ],
    {
      parent: root,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.34, 0, 0.13],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.39, 0.82, 0.03],
      [-0.48, 0.52, -0.02],
      [-0.34, 0.23, -0.02],
      [-0.34, 0.105, -0.01],
    ],
    {
      parent: root,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.34, 0, -0.01],
    },
  );

  const bodyCenter: [number, number, number] = [0, 1.12, 0];
  const bodyBone = root;

  // ------------------------------------------------------------------------------------------
  // Utility helpers.
  // ------------------------------------------------------------------------------------------

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    name = "box",
    bone: any = bodyBone,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
      name,
      group: "hut",
    });
  }

  function cylinder(
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    name = "cylinder",
    bone: any = bodyBone,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius * 0.94, height, 8), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
      group: "hut",
    });
  }

  function sphere(
    radius: number,
    at: [number, number, number],
    color: any,
    name = "sphere",
    bone: any = bodyBone,
  ) {
    return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      bone,
      flat: true,
      name,
      group: "detail",
    });
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    name = "rod",
    bone: any = bodyBone,
  ) {
    return b.rod(a, c, radius, { color, bone, name, group: "detail", section: { ngon: 6 } });
  }

  function spike(
    base: [number, number, number],
    tip: [number, number, number],
    radius: number,
    color: any,
    name = "spike",
    bone: any = bodyBone,
  ) {
    return b.spike(base, tip, null, radius, { color, bone, name, group: "detail" });
  }

  // ------------------------------------------------------------------------------------------
  // Two chunky chicken legs, with knees, knobby joints, ankles, and splayed toes.
  // ------------------------------------------------------------------------------------------

  b.sweep(legL, [0.105, 0.075], {
    color: LEG,
    bone: legL,
    section: { ngon: 6 },
    name: "legL.skin",
    group: "legs",
  });
  b.sweep(legR, [0.105, 0.075], {
    color: LEG,
    bone: legR,
    section: { ngon: 6 },
    name: "legR.skin",
    group: "legs",
  });

  for (const [s, leg, zoff] of [
    [1, legL, 0.1],
    [-1, legR, -0.01],
  ] as const) {
    sphere(0.125, [s * 0.48, 0.52, zoff], LEG_DARK, "knee", leg.joints[1]);
    sphere(0.095, [s * 0.36, 0.23, zoff], LEG_DARK, "ankle", leg.joints[2]);

    // Three unmistakable chicken toes on each foot.
    const foot: [number, number, number] = [s * 0.34, 0.095, zoff + 0.01];
    spike(foot, [s * 0.58, 0.035, zoff + 0.16], 0.045, LEG, "toe.forward", leg.tip);
    spike(foot, [s * 0.51, 0.035, zoff - 0.12], 0.043, LEG, "toe.back", leg.tip);
    spike(foot, [s * 0.27, 0.035, zoff + 0.29], 0.04, LEG, "toe.outer", leg.tip);
    sphere(0.065, foot, LEG_DARK, "foot.knuckle", leg.tip);
  }

  // Small blue-gray bands make the legs feel like carved puppet limbs.
  for (const s of [1, -1]) {
    rod(
      [s * 0.425, 0.39, s > 0 ? 0.05 : -0.015],
      [s * 0.405, 0.34, s > 0 ? 0.055 : -0.01],
      0.115,
      MOSS,
      "mossy.knee.band",
      s > 0 ? legL.joints[1] : legR.joints[1],
    );
  }

  // ------------------------------------------------------------------------------------------
  // Crooked log cabin body. The slightly offset upper block gives folk-art asymmetry.
  // ------------------------------------------------------------------------------------------

  box([1.38, 0.82, 1.18], [0, 1.20, 0], WOOD, undefined, "main.log.house");
  box([1.28, 0.18, 1.12], [0.04, 1.67, -0.01], WOOD_LIGHT, [0, 0, -2], "upper.log");
  box([1.44, 0.12, 1.2], [-0.03, 0.78, 0.01], WOOD_DARK, [0, 0, 1], "bottom.log");

  // Horizontal log courses on both side walls.
  for (const x of [-0.715, 0.715]) {
    for (let i = 0; i < 4; i++) {
      rod(
        [x, 0.91 + i * 0.22, -0.53],
        [x, 0.91 + i * 0.22, 0.54],
        0.055,
        i % 2 ? WOOD_LIGHT : WOOD_DARK,
        "side.log",
      );
    }
  }

  // Projecting log ends on the front and back, with dark circular cut ends.
  for (const y of [0.88, 1.10, 1.32, 1.54]) {
    for (const x of [-0.77, 0.77]) {
      cylinder(0.064, 0.11, [x, y, 0.58], WOOD_LIGHT, [1, 0, 0], "front.log.end");
      cylinder(0.044, 0.113, [x, y, 0.642], WOOD_DARK, [0, 0, 1], "front.log.ring");
    }
  }

  // Moss tufts along the lower roofline and wall.
  for (const x of [-0.58, -0.3, 0.02, 0.34, 0.6]) {
    spike([x, 1.67, 0.55], [x + 0.025, 1.77, 0.55], 0.045, MOSS, "moss.roofline");
  }

  // ------------------------------------------------------------------------------------------
  // Gabled roof: two thick, faceted slabs meeting at a crooked ridge.
  // ------------------------------------------------------------------------------------------

  box([0.91, 0.11, 1.36], [-0.43, 1.91, 0], ROOF, [0, 0, -32], "roof.left");
  box([0.91, 0.11, 1.36], [0.43, 1.91, 0], ROOF_EDGE, [0, 0, 32], "roof.right");

  // Bright ridge cap and decorative carved finial.
  rod([-0.02, 2.25, -0.67], [0.02, 2.25, 0.68], 0.065, STRAW, "ridge.cap");
  cylinder(0.075, 0.18, [0.02, 2.34, 0.5], RED, [0, 1, 0], "ridge.finial");
  spike([0.02, 2.43, 0.5], [0.02, 2.66, 0.5], 0.055, STRAW, "ridge.spike");

  // Chimney with a bent smoke cap.
  box([0.22, 0.34, 0.24], [-0.22, 2.15, -0.18], WOOD_DARK, [0, 0, -4], "chimney");
  box([0.3, 0.08, 0.3], [-0.22, 2.34, -0.18], ROOF_EDGE, [0, 0, 4], "chimney.cap");
  const smoke = b.sweep(
    [
      [-0.22, 2.39, -0.18],
      [-0.18, 2.55, -0.18],
      [-0.28, 2.7, -0.16],
      [-0.2, 2.82, -0.13],
    ],
    [0.065, 0.03],
    {
      color: "#8b7891",
      bone: root,
      section: { ngon: 6 },
      caps: "round",
      name: "crooked.smoke",
      group: "smoke",
    },
  );
  sphere(0.06, [-0.2, 2.84, -0.13], "#a992a1", "smoke.puff");
  sphere(0.045, [-0.11, 2.76, -0.13], "#a992a1", "smoke.puff");

  // ------------------------------------------------------------------------------------------
  // Front face: oversized glowing window, crooked door, shutters, and folk ornament.
  // ------------------------------------------------------------------------------------------

  // Door frame and door.
  box([0.39, 0.68, 0.07], [-0.42, 1.13, 0.615], WOOD_DARK, [0, 0, -3], "door.frame");
  box([0.29, 0.58, 0.075], [-0.42, 1.10, 0.66], RED, [0, 0, -3], "door");
  box([0.21, 0.09, 0.018], [-0.42, 1.28, 0.708], WOOD_LIGHT, [0, 0, -3], "door.crossbar");
  box([0.21, 0.09, 0.018], [-0.42, 1.02, 0.708], WOOD_LIGHT, [0, 0, 3], "door.crossbar");
  sphere(0.035, [-0.31, 1.1, 0.72], STRAW, "door.handle");

  // Window recess.
  box([0.56, 0.47, 0.07], [0.35, 1.32, 0.62], WINDOW_DARK, [0, 0, 2], "window.frame");
  box([0.45, 0.36, 0.08], [0.35, 1.32, 0.675], WINDOW, [0, 0, 2], "window.glow");
  box([0.045, 0.39, 0.025], [0.35, 1.32, 0.73], WINDOW_DARK, undefined, "window.mullion.vertical");
  box([0.49, 0.045, 0.025], [0.35, 1.32, 0.73], WINDOW_DARK, undefined, "window.mullion.horizontal");

  // Window shutters with carved red diamonds.
  box([0.16, 0.5, 0.08], [0.03, 1.32, 0.62], WOOD_LIGHT, [0, 0, -4], "shutter.left");
  box([0.16, 0.5, 0.08], [0.67, 1.32, 0.62], WOOD_LIGHT, [0, 0, 4], "shutter.right");
  for (const x of [0.03, 0.67]) {
    b.extrude(
      [
        [0, -0.08],
        [0.07, 0],
        [0, 0.08],
        [-0.07, 0],
      ],
      {
        at: [x, 1.32, 0.675],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.018,
        color: RED,
        bone: root,
        name: "shutter.diamond",
        group: "ornament",
      },
    );
  }

  // Carved sunburst above the door.
  cylinder(0.14, 0.025, [-0.42, 1.62, 0.7], STRAW, [0, 0, 1], "sun medallion");
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    spike(
      [-0.42, 1.62, 0.72],
      [-0.42 + Math.sin(a) * 0.22, 1.62 + Math.cos(a) * 0.22, 0.72],
      0.018,
      STRAW,
      "sun.ray",
    );
  }

  // ------------------------------------------------------------------------------------------
  // A tiny crooked fence, kept subordinate to the hut but grounding the diorama.
  // ------------------------------------------------------------------------------------------

  for (const x of [-0.95, -0.7, 0.85, 1.08]) {
    const lean = x < 0 ? -0.06 : 0.05;
    rod([x, 0.02, 0.78], [x + lean, 0.5, 0.78], 0.035, WOOD_DARK, "fence.post");
    spike([x + lean, 0.44, 0.78], [x + lean, 0.61, 0.78], 0.04, WOOD_LIGHT, "fence.point");
  }
  rod([-1.02, 0.27, 0.78], [-0.66, 0.31, 0.78], 0.028, WOOD_LIGHT, "fence.rail");
  rod([0.8, 0.25, 0.78], [1.14, 0.3, 0.78], 0.028, WOOD_LIGHT, "fence.rail");

  // A couple of folk-art mushrooms at the feet.
  for (const [x, z, s] of [
    [-0.92, 0.18, 1],
    [0.92, 0.24, 0.82],
    [0.72, -0.36, 0.65],
  ] as const) {
    cylinder(0.026 * s, 0.12 * s, [x, 0.06 * s, z], CREAM, [0, 1, 0], "mushroom.stem");
    sphere(0.105 * s, [x, 0.135 * s, z], RED, "mushroom.cap");
    sphere(0.018 * s, [x - 0.035 * s, 0.18 * s, z + 0.045 * s], CREAM, "mushroom.spot");
    sphere(0.015 * s, [x + 0.04 * s, 0.17 * s, z - 0.025 * s], CREAM, "mushroom.spot");
  }

  // ------------------------------------------------------------------------------------------
  // Characterful chicken heads beneath the house: simple beaks and bright eyes peeking sideways.
  // ------------------------------------------------------------------------------------------

  for (const [s, z] of [
    [1, 0.13],
    [-1, -0.01],
  ] as const) {
    const head = sphere(0.14, [s * 0.35, 0.77, z + 0.02], LEG, "chicken.head", root);
    // Beak points outward and slightly forward.
    spike(
      [s * 0.45, 0.78, z + 0.08],
      [s * 0.62, 0.77, z + 0.14],
      0.055,
      BEAK,
      "chicken.beak",
      root,
    );
    sphere(0.038, [s * 0.39, 0.84, z + 0.105], EYE_WHITE, "chicken.eye", root);
    sphere(0.018, [s * 0.405, 0.845, z + 0.125], IRON, "chicken.pupil", root);
    // Red comb.
    for (let j = 0; j < 3; j++) {
      sphere(0.043, [s * (0.31 + j * 0.045), 0.91, z + 0.02], RED, "chicken.comb", root);
    }
    // Wattle.
    sphere(0.04, [s * 0.45, 0.69, z + 0.1], RED, "chicken.wattle", root);
  }

  // ------------------------------------------------------------------------------------------
  // Folk-art finishing: hanging charms, iron nails, roof stripes, and a magical window glow.
  // ------------------------------------------------------------------------------------------

  for (const z of [-0.42, -0.12, 0.18, 0.48]) {
    sphere(0.022, [0.75, 1.08, z], METAL, "iron.nail");
    sphere(0.022, [-0.75, 1.48, z], METAL, "iron.nail");
  }

  for (const z of [-0.48, -0.18, 0.12, 0.42]) {
    box([0.045, 0.07, 0.04], [-0.46, 2.0, z], STRAW, [0, 0, -32], "roof.tile");
    box([0.045, 0.07, 0.04], [0.46, 2.0, z], STRAW, [0, 0, 32], "roof.tile");
  }

  // Tiny hanging horseshoe charm under the eave.
  rod([0.64, 1.82, 0.67], [0.64, 1.61, 0.67], 0.012, IRON, "charm.string");
  b.part(new THREE.TorusGeometry(0.075, 0.018, 5, 10, Math.PI * 1.55), IRON, {
    at: [0.64, 1.56, 0.67],
    dir: [0, 0, 1],
    bone: root,
    flat: true,
    name: "horseshoe.charm",
    group: "ornament",
  });

  // The window is deliberately a separate bright part, reading as warm candlelight.
  const windowGlow = b.part(new THREE.BoxGeometry(0.36, 0.28, 0.018), EYE_GLOW, {
    at: [0.35, 1.32, 0.724],
    bone: root,
    name: "candlelit.window",
    group: "glow",
  });
  for (const p of [windowGlow]) {
    const mesh = p.mesh;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissive = new THREE.Color(EYE_GLOW);
    material.emissiveIntensity = 0.7;
  }

  // Warm eyes in the window: two tiny black silhouettes suggest a witch watching from inside.
  sphere(0.028, [0.27, 1.35, 0.741], IRON, "window.eye");
  sphere(0.028, [0.43, 1.35, 0.741], IRON, "window.eye");
  rod([0.23, 1.29, 0.74], [0.47, 1.29, 0.74], 0.012, IRON, "window.shadow");

  // A final garland of berries below the front eave.
  for (let i = 0; i < 7; i++) {
    const x = -0.62 + i * 0.2;
    sphere(0.027, [x, 1.73 + (i % 2) * 0.025, 0.67], i % 2 ? RED : STRAW, "berry");
  }

  return b.root;
}
```