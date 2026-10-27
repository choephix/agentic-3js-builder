import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description: "A stylized Slavic folk-art diorama of Baba Yaga's crooked wooden hut, perched on four chicken legs.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = "#754126";
  const WOOD_LIGHT = "#a96838";
  const WOOD_DARK = "#402218";
  const ROOF = "#542d27";
  const ROOF_LIGHT = "#8d4b35";
  const STRAW = "#c8994d";
  const CREAM = "#ead59a";
  const RED = "#b7352e";
  const BLUE = "#315c78";
  const TEAL = "#397c72";
  const BLACK = "#21191a";
  const GOLD = "#d6a347";
  const IRON = "#363039";
  const GROUND = "#5d5038";
  const MOSS = "#596b39";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone?: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    bone?: any,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 0.94, height, radial), color, {
      at,
      bone,
      flat: true,
    });

  // Small mossy diorama plinth.
  box([2.7, 0.12, 2.25], GROUND, [0, 0.02, 0]);
  box([2.55, 0.045, 2.1], MOSS, [0, 0.105, 0]);

  // A single root joint gives the hut a clear rig root.
  const root = b.joint("hutRoot", { at: [0, 0.12, 0], role: "spine" });

  // Body: chunky, slightly crooked log cabin.
  box([1.52, 1.02, 1.12], WOOD, [0, 1.72, 0], root);
  box([1.42, 0.83, 1.04], WOOD_LIGHT, [0, 1.75, 0.015], root, [0, 0, -0.035]);

  // Horizontal log courses, visibly layered around the cabin.
  for (let i = 0; i < 5; i++) {
    const y = 1.31 + i * 0.21;
    b.rod([-0.79, y, 0.56], [0.79, y, 0.56], 0.075, WOOD_DARK, { bone: root, section: { ngon: 6 } });
    b.rod([-0.79, y, -0.56], [0.79, y, -0.56], 0.075, WOOD_DARK, { bone: root, section: { ngon: 6 } });
    b.rod([0.76, y, -0.51], [0.76, y, 0.51], 0.075, WOOD_DARK, { bone: root, section: { ngon: 6 } });
    b.rod([-0.76, y, -0.51], [-0.76, y, 0.51], 0.075, WOOD_DARK, { bone: root, section: { ngon: 6 } });
  }

  // Corner pegs and round log ends.
  for (const x of [-0.79, 0.79]) {
    for (const z of [-0.57, 0.57]) {
      for (let i = 0; i < 5; i++) {
        cylinder(0.082, 0.035, WOOD_LIGHT, [x, 1.34 + i * 0.21, z], root, 8);
      }
    }
  }

  // Roof and its broad painted gable trim.
  const roof = b.part(new THREE.ConeGeometry(1.08, 0.72, 5), ROOF, {
    at: [0, 2.65, 0],
    bone: root,
    flat: true,
  });
  box([1.88, 0.08, 0.12], ROOF_LIGHT, [0, 2.32, 0.575], root, [0, 0, 0.02]);
  box([1.88, 0.08, 0.12], ROOF_LIGHT, [0, 2.32, -0.575], root, [0, 0, -0.02]);

  // Roof ridge and crooked chimney.
  b.rod([-0.72, 3.01, 0], [0.72, 3.01, 0], 0.055, WOOD_DARK, { bone: root });
  box([0.24, 0.34, 0.24], WOOD_DARK, [0.45, 3.0, -0.08], root, [0, 0, -0.08]);
  box([0.32, 0.07, 0.32], ROOF_LIGHT, [0.43, 3.19, -0.08], root, [0, 0, -0.08]);

  // Front door, framed in contrasting folk-art blue.
  box([0.43, 0.68, 0.045], BLUE, [0, 1.55, 0.586], root);
  box([0.33, 0.57, 0.05], WOOD_DARK, [0, 1.53, 0.616], root);
  box([0.12, 0.05, 0.018], GOLD, [0, 1.77, 0.65], root);
  cylinder(0.025, 0.045, GOLD, [0.12, 1.52, 0.65], root, 8);

  // Door ornament: red sun and blue chevrons.
  cylinder(0.105, 0.018, RED, [0, 1.77, 0.65], root, 12);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.rod(
      [Math.sin(a) * 0.105, 1.77 + Math.cos(a) * 0.105, 0.665],
      [Math.sin(a) * 0.14, 1.77 + Math.cos(a) * 0.14, 0.665],
      0.012,
      GOLD,
      { bone: root },
    );
  }

  // Windows with flower-like trim, one on each visible side.
  const window = (x: number, z: number, side: "front" | "side") => {
    if (side === "front") {
      box([0.34, 0.31, 0.035], CREAM, [x, 1.9, z], root);
      box([0.29, 0.25, 0.045], TEAL, [x, 1.9, z + 0.025], root);
      box([0.025, 0.27, 0.052], GOLD, [x, 1.9, z + 0.05], root);
      box([0.31, 0.025, 0.052], GOLD, [x, 1.9, z + 0.05], root);
      box([0.39, 0.045, 0.07], RED, [x, 2.08, z + 0.03], root);
      box([0.39, 0.045, 0.07], RED, [x, 1.72, z + 0.03], root);
    } else {
      box([0.035, 0.31, 0.34], CREAM, [x, 1.9, z], root);
      box([0.045, 0.25, 0.29], TEAL, [x + 0.025, 1.9, z], root);
      box([0.052, 0.27, 0.025], GOLD, [x + 0.05, 1.9, z], root);
      box([0.052, 0.025, 0.31], GOLD, [x + 0.05, 1.9, z], root);
      box([0.07, 0.045, 0.39], RED, [x + 0.03, 2.08, z], root);
      box([0.07, 0.045, 0.39], RED, [x + 0.03, 1.72, z], root);
    }
  };
  window(-0.48, 0.585, "front");
  window(0.79, 0.08, "side");

  // Four articulated chicken legs, with bent knees and recognizable feet.
  const legData = [
    { s: 1, z: 0.37, name: "legFL", foot: [0.38, 0.18, 0.48] as [number, number, number] },
    { s: -1, z: 0.37, name: "legFR", foot: [-0.38, 0.18, 0.48] as [number, number, number] },
    { s: 1, z: -0.37, name: "legBL", foot: [0.42, 0.18, -0.46] as [number, number, number] },
    { s: -1, z: -0.37, name: "legBR", foot: [-0.42, 0.18, -0.46] as [number, number, number] },
  ];

  for (const d of legData) {
    const x = d.s * 0.54;
    const path = catmull([
      [x, 1.3, d.z],
      [d.s * 0.58, 0.83, d.z + (d.z > 0 ? 0.04 : -0.04)],
      [d.s * 0.42, 0.48, d.z + (d.z > 0 ? 0.08 : -0.08)],
      d.foot,
    ]);
    const chain = b.chain(d.name, path, {
      parent: root,
      count: 3,
      names: [`${d.name}_hip`, `${d.name}_knee`, `${d.name}_ankle`],
      role: "leg",
      contact: d.foot,
    });
    b.sweep(chain, (t) => 0.105 - t * 0.045, {
      color: STRAW,
      section: { ngon: 6 },
      caps: "round",
    });

    // Knobby knees and ankle cuffs.
    cylinder(0.12, 0.07, RED, [d.s * 0.57, 0.78, d.z + (d.z > 0 ? 0.04 : -0.04)], root, 8);
    cylinder(0.075, 0.08, RED, [d.foot[0], 0.34, d.foot[2]], root, 8);

    // Three splayed toes per foot.
    const toeBase: [number, number, number] = [d.foot[0], 0.19, d.foot[2]];
    for (const [dx, dz] of [[0.16, 0.04], [-0.16, 0.04], [0, -0.16]]) {
      b.rod(toeBase, [toeBase[0] + dx, 0.14, toeBase[2] + dz], 0.028, STRAW, {
        bone: chain.joints[chain.joints.length - 1],
        section: { ngon: 5 },
      });
      b.spike([toeBase[0] + dx, 0.14, toeBase[2] + dz], [0, -1, 0], 0.065, 0.024, {
        color: BLACK,
        bone: chain.joints[chain.joints.length - 1],
      });
    }
  }

  // Hanging carved talismans beneath the front eaves.
  for (const x of [-0.57, 0.57]) {
    b.rod([x, 2.35, 0.59], [x, 2.08, 0.59], 0.014, BLACK, { bone: root });
    b.part(new THREE.ConeGeometry(0.09, 0.19, 5), RED, {
      at: [x, 2.0, 0.59],
      bone: root,
      flat: true,
    });
    cylinder(0.035, 0.025, GOLD, [x, 1.91, 0.59], root, 8);
  }

  // A few stylized mushrooms and stones give the plinth a folk-tale diorama finish.
  for (const [x, z, c] of [
    [-1.03, 0.74, RED],
    [1.02, -0.72, TEAL],
    [-1.04, -0.55, GOLD],
  ] as [number, number, string][]) {
    b.rod([x, 0.13, z], [x, 0.27, z], 0.025, CREAM, { bone: root });
    b.part(new THREE.ConeGeometry(0.12, 0.075, 8), c, {
      at: [x, 0.3, z],
      bone: root,
      flat: true,
    });
  }

  // Little iron horseshoe on the rear wall, a strong Baba-Yaga silhouette detail.
  b.part(new THREE.TorusGeometry(0.13, 0.025, 5, 10, Math.PI * 1.55), IRON, {
    at: [0, 1.7, -0.59],
    bone: root,
    rotation: [Math.PI / 2, 0, Math.PI],
    flat: true,
  });

  return b.root;
}
