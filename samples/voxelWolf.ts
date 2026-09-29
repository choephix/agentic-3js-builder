import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { pixelTexture, skinBox, skinLayout } from "../kits/pixel";
import type { BoxFace } from "../kits/pixel";

export const meta = {
  name: "Voxel Wolf",
  description: "A Minecraft-style blocky grey timber wolf with a pixel skin, ruff, red collar and tag.",
  builtBy: "GPT-6 Astra",
};

type V3 = [number, number, number];

const TEXEL = 0.02;
const GREY = ["#59626a", "#69747c", "#77838a", "#879198"];
const DARK = ["#303a43", "#3c4851", "#46535c"];
const PALE = ["#b8bec0", "#cbd0ce", "#d9dad4"];
const RED = ["#8d2630", "#b9363b", "#d14a46"];
const METAL = ["#b47d35", "#d6a34a", "#f0c76b"];
const BLACK = "#1b2024";

type BoxName =
  | "torso"
  | "ruff"
  | "head"
  | "muzzle"
  | "jaw"
  | "leg"
  | "paw"
  | "tailBase"
  | "tailMid"
  | "tailTip"
  | "ear"
  | "collar"
  | "tag";

const layout = skinLayout(
  {
    torso: [16, 10, 24],
    ruff: [18, 12, 12],
    head: [12, 10, 12],
    muzzle: [10, 6, 8],
    jaw: [10, 3, 8],
    leg: [4, 12, 4],
    paw: [5, 3, 6],
    tailBase: [7, 6, 8],
    tailMid: [6, 5, 8],
    tailTip: [4, 4, 7],
    ear: [4, 6, 3],
    collar: [16, 2, 2],
    tag: [3, 4, 1],
  },
  128,
);

const sheet = pixelTexture(layout.size[0], layout.size[1], (g) => {
  const faces = ["px", "nx", "py", "ny", "pz", "nz"] as const;
  const shade = (name: BoxName, face: BoxFace, x: number, y: number): string => {
    if (name === "collar") return RED[(x + y) % RED.length];
    if (name === "tag") return METAL[(x + y * 2) % METAL.length];
    if (name === "muzzle" || name === "jaw") return PALE[(x + y + (face === "py" ? 1 : 0)) % PALE.length];
    if (name === "paw") return PALE[(x * 2 + y) % PALE.length];
    if (name === "ear") return face === "pz" || face === "ny" ? DARK[(x + y) % DARK.length] : GREY[(x + y) % GREY.length];
    if (name === "tailTip") return DARK[(x + y * 2) % DARK.length];
    if (name === "tailBase" || name === "tailMid") return face === "py" || face === "nz" ? DARK[(x + y) % DARK.length] : GREY[(x + y) % GREY.length];
    if (name === "ruff") return face === "py" || face === "nz" ? DARK[(x + y) % DARK.length] : GREY[(x + y) % GREY.length];
    if (name === "torso") {
      if (face === "ny") return PALE[(x + y) % PALE.length];
      if (face === "py" || face === "nz" || face === "px" || face === "nx") return DARK[(x + y) % DARK.length];
      return GREY[(x + y) % GREY.length];
    }
    if (name === "head") {
      if (face === "py" || face === "nz") return DARK[(x + y) % DARK.length];
      if (face === "ny") return PALE[(x + y) % PALE.length];
      return GREY[(x + y) % GREY.length];
    }
    if (name === "leg") return face === "py" || face === "nz" ? DARK[(x + y) % DARK.length] : GREY[(x + y) % GREY.length];
    return GREY[(x + y) % GREY.length];
  };

  for (const name of Object.keys(layout.faces) as BoxName[]) {
    const boxFaces = layout.faces[name];
    for (const face of faces) {
      const rect = boxFaces[face];
      g.fill((x, y, _size, _height) => shade(name, face, x, y), rect);
    }
  }

  const stamp = (name: BoxName, face: BoxFace, ox: number, oy: number, rows: string[], palette: Record<string, string>) => {
    const rect = layout.faces[name][face];
    g.stamp(rect[0] + ox, rect[1] + oy, rows, palette);
  };
  stamp("head", "pz", 1, 2, [".k....k.", "kkkkkkkk"], { k: BLACK });
  stamp("head", "pz", 2, 5, [".k....k."], { k: "#4b3330" });
  stamp("muzzle", "pz", 2, 0, [".nnnnnn.", "nnnnnnnn"], { n: BLACK });
  stamp("jaw", "pz", 2, 1, [".mmmmmm."], { m: BLACK });
  stamp("ear", "pz", 1, 1, [".pp.", "pppp"], { p: "#9b5964" });
  stamp("collar", "pz", 2, 0, ["rrrrrrrrrrrr"], { r: "#ef5a50" });
  stamp("tag", "pz", 1, 1, [".g.", "ggg"], { g: "#ffe083" });
});

const boxFaces = layout.faces;
type Bone = Joint;

export default function build() {
  const b = createBuilder({ name: "voxelWolf", paintSize: 1024 });
  const hips = b.joint("hips", { at: [0, 0.46, -0.03], dir: [0, 0, 1], role: "spine", group: "body" });
  const body = b.joint("body", { parent: hips, at: [0, 0.5, 0.03], dir: [0, 0, 1], role: "spine", group: "body" });
  const neckBase = b.joint("neckBase", { parent: body, at: [0, 0.58, 0.27], dir: [0, 0.4, 1], role: "neck", group: "neck" });
  const neckTop = b.joint("neckTop", { parent: neckBase, at: [0, 0.68, 0.31], dir: [0, 0.5, 1], role: "neck", group: "neck" });
  const head = b.joint("head", { parent: neckTop, at: [0, 0.78, 0.37], dir: [0, 0.15, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.715, 0.48], aim: [0, 0.705, 0.58], role: "jaw", group: "head" });

  const box = (name: BoxName, _size: readonly [number, number, number], at: V3, bone: Bone, group: string, rotation?: V3) =>
    b.part(skinBox(sheet, boxFaces[name], TEXEL), "#ffffff", {
      bone,
      at,
      texture: sheet,
      group,
      ...(rotation ? { rotation } : {}),
    });

  box("torso", [16, 10, 24], [0, 0.47, -0.01], body, "body");
  box("ruff", [18, 12, 12], [0, 0.64, 0.24], neckBase, "neck");
  box("head", [12, 10, 12], [0, 0.79, 0.37], head, "head");
  box("muzzle", [10, 6, 8], [0, 0.75, 0.50], head, "head");
  box("jaw", [10, 3, 8], [0, 0.705, 0.505], jaw, "head");

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.09, 0.875, 0.35],
      dir: [s * 0.18, 0.8, -0.05],
      role: "hinge",
      group: "head",
    });
    box("ear", [4, 6, 3], [s * 0.09, 0.905, 0.35], ear, "head", [0, s * 10, s * -8]);
  }

  box("collar", [16, 2, 2], [0, 0.69, 0.38], neckTop, "collar");
  box("tag", [3, 4, 1], [0, 0.64, 0.415], neckTop, "collar");

  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const id = front ? "F" : "H";
    const z = front ? 0.18 : -0.20;
    const kneeZ = front ? 0.22 : -0.12;
    const ankleZ = front ? 0.24 : -0.23;
    const parent = front ? body : hips;
    const chain = b.chain(`leg${id}${side}`, [
      [s * 0.14, 0.40, z],
      [s * 0.15, 0.24, kneeZ],
      [s * 0.15, 0.12, ankleZ],
      [s * 0.15, 0.03, front ? 0.275 : -0.17],
    ], {
      parent,
      names: [`hip${id}${side}`, `knee${id}${side}`, `ankle${id}${side}`],
      role: "leg",
      group: `leg${id}${side}`,
      contact: [s * 0.15, 0, front ? 0.28 : -0.17],
    });
    const upperBone = chain.joints[0];
    const lowerBone = chain.joints[1];
    const pawBone = chain.joints[2];
    box("leg", [4, 8, 4], [s * 0.145, 0.32, (z + kneeZ) / 2], upperBone, `leg${id}${side}`);
    box("leg", [4, 6, 4], [s * 0.15, 0.18, (kneeZ + ankleZ) / 2], lowerBone, `leg${id}${side}`);
    box("paw", [5, 3, 6], [s * 0.15, 0.03, front ? 0.275 : -0.17], pawBone, `leg${id}${side}`);
  };

  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  const tail = b.chain("tail", [[0, 0.49, -0.25], [0, 0.51, -0.42], [0, 0.56, -0.58], [0, 0.63, -0.72]], {
    parent: body,
    names: ["tailBase", "tailMid", "tailTip"],
    role: "tail",
    group: "tail",
  });
  box("tailBase", [7, 6, 8], [0, 0.50, -0.33], tail.joints[0], "tail");
  box("tailMid", [6, 5, 8], [0, 0.535, -0.50], tail.joints[1], "tail", [-12, 0, 0]);
  box("tailTip", [4, 4, 7], [0, 0.60, -0.65], tail.joints[2], "tail", [-20, 0, 0]);

  return b.root;
}
