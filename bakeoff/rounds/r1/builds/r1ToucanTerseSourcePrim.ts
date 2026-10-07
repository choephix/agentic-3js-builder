import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Toucan",
  description:
    "A keel-billed toucan standing upright: black body, cream bib, blue eye skin, a big painted bill with a hinged lower jaw, folded wings, a tail and zygodactyl feet. Fully rigged.",
};

const BLACK = "#16161c";
const CREAM = "#ffe9a0";
const RED = "#d8262b";
const BLUE = "#43a8dc";
const FOOT = "#5f8fb8";

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---- skeleton ----
  b.joint("root", { at: [0, 0.24, -0.04], dir: [0, 1, 0.3] });
  b.chain(
    "spine",
    [
      [0, 0.24, -0.04],
      [0, 0.32, 0.0],
      [0, 0.38, 0.05],
    ],
    { parent: "root", names: ["spine1", "spine2", "neck1"], role: "spine" },
  );
  b.joint("head", { parent: "neck1", at: [0, 0.43, 0.08], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.405, 0.1], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    [
      [0, 0.2, -0.09],
      [0, 0.14, -0.15],
      [0, 0.08, -0.22],
      [0, 0.03, -0.3],
    ],
    { parent: "root", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  const sph = (
    at: number[],
    scale: number[],
    color: any,
    bone: string,
    rotation: number[] = [0, 0, 0],
    seg = 10,
  ) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3)), color, {
      at,
      scale,
      rotation,
      bone,
      flat: true,
    });

  // ---- body ----
  sph([0, 0.265, -0.015], [0.088, 0.135, 0.088], BLACK, "spine1", [28, 0, 0], 12);
  sph([0, 0.3, 0.045], [0.074, 0.098, 0.058], CREAM, "spine2", [28, 0, 0], 12); // bib
  sph([0, 0.385, 0.05], [0.052, 0.058, 0.05], CREAM, "neck1", [20, 0, 0]);
  sph([0, 0.2, -0.105], [0.04, 0.035, 0.035], "#fff6d0", "root"); // rump
  sph([0, 0.155, -0.085], [0.05, 0.04, 0.045], RED, "root", [-30, 0, 0]); // undertail coverts

  // ---- head ----
  sph([0, 0.435, 0.08], [0.048, 0.05, 0.056], BLACK, "head", [0, 0, 0], 12);
  sph([0, 0.41, 0.095], [0.044, 0.04, 0.04], CREAM, "head");
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    sph([s * 0.04, 0.443, 0.108], [0.012, 0.028, 0.028], BLUE, "head", [0, 0, 0], 10);
    sph([s * 0.049, 0.443, 0.112], [0.006, 0.013, 0.013], BLACK, "head");
    sph([s * 0.054, 0.447, 0.116], [0.003, 0.005, 0.005], "#ffffff", "head");
    sph([s * 0.028, 0.452, 0.152], [0.006, 0.006, 0.01], "#3a2a10", "head"); // nostril
    void S;
  }

  // ---- beak ----
  const upperPaint = paint((p, n) => {
    if (p.z < 0.118) return BLACK;
    if (p.z < 0.128) return "#2a2a20";
    if (p.z > 0.29) return "#e5481d";
    if (n.y > 0.55) return p.z > 0.2 ? "#b8d43a" : "#7fc241";
    if (n.y < -0.5) return "#e9a000";
    return p.z > 0.22 ? "#f08a10" : "#f6bd10";
  });
  const lowerPaint = paint((p) => {
    if (p.z < 0.118) return BLACK;
    if (p.z > 0.285) return "#e5481d";
    return p.z > 0.2 ? "#ee8a14" : "#f0a812";
  });
  b.loft(
    [
      { at: [0, 0.44, 0.1], w: 0.062, h: 0.075 },
      { at: [0, 0.437, 0.18], w: 0.06, h: 0.072 },
      { at: [0, 0.425, 0.25], w: 0.04, h: 0.05 },
      { at: [0, 0.4, 0.31], w: 0.012, h: 0.016 },
    ],
    { color: upperPaint, bone: "head", sides: 8, caps: { start: "flat", end: "round" }, name: "upperBeak" },
  );
  b.loft(
    [
      { at: [0, 0.397, 0.1], w: 0.052, h: 0.032 },
      { at: [0, 0.39, 0.2], w: 0.046, h: 0.03 },
      { at: [0, 0.382, 0.275], w: 0.026, h: 0.02 },
      { at: [0, 0.376, 0.3], w: 0.01, h: 0.012 },
    ],
    { color: lowerPaint, bone: "jaw", sides: 8, caps: { start: "flat", end: "round" }, name: "lowerBeak" },
  );

  // ---- tail ----
  b.sweep(tail, (t) => [0.03 + 0.02 * t, 0.011], {
    color: BLACK,
    caps: { start: "none", end: "round" },
    sides: 8,
  });

  // ---- wings and legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      [
        [s * 0.098, 0.33, -0.005],
        [s * 0.1, 0.27, -0.05],
        [s * 0.1, 0.2, -0.1],
        [s * 0.092, 0.08, -0.19],
      ],
      { parent: "spine2", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingTip${S}`], role: "wing" },
    );
    b.sweep(wing, (t) => [0.014, 0.02 + 0.04 * (1 - t) * (0.6 + t)], {
      color: "#1e1e27",
      caps: "round",
      sides: 8,
    });

    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.045, 0.18, 0.0],
        [s * 0.048, 0.105, 0.025],
        [s * 0.045, 0.045, -0.005],
      ],
      { parent: "root", names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.045, 0, 0.0] },
    );
    b.sweep(leg, 0.013, { color: FOOT, caps: "round", sides: 6 });
    sph([s * 0.05, 0.18, 0.0], [0.04, 0.045, 0.045], BLACK, `hip${S}`); // thigh feathers

    const toes: Array<[string, number, number]> = [
      ["F1", 0.02, 0.06],
      ["F2", -0.02, 0.06],
      ["B1", 0.016, -0.055],
      ["B2", -0.016, -0.055],
    ];
    for (const [id, dx, dz] of toes) {
      const base: number[] = [s * 0.045, 0.012, 0.0];
      const end: number[] = [s * 0.045 + dx, 0.008, dz];
      const j = b.joint(`toe${id}${S}`, { parent: `ankle${S}`, at: base, aim: end, role: "digit" });
      b.capsule(base, end, 0.008, { color: FOOT, bone: j, sides: 6 });
      b.part(new THREE.ConeGeometry(0.006, 0.02, 5), "#222228", {
        at: [end[0] + dx * 0.2, 0.008, dz + Math.sign(dz) * 0.012],
        rotation: [Math.sign(dz) * 90, 0, 0],
        bone: j,
      });
    }
  }

  return b.root;
}
