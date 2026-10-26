import * as THREE from "three";
import { createBuilder, catmull, bezier, svg, rng } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from primary-colour Bauhaus geometry.",
};

const RED = "#d62820";
const BLUE = "#1d4fa8";
const YELLOW = "#f2c200";
const BLACK = "#16161a";
const CREAM = "#f3ead3";
const BARK = "#6b4a2b";
const BARK2 = "#4d3420";

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.2, -0.01], role: "spine" });
  const spineC = b.chain("spine", catmull([[0, 0.2, -0.01], [0, 0.23, 0.04], [0, 0.27, 0.07]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.joint("neck", { parent: spineC.joints[1], at: [0, 0.27, 0.07], dir: [0, 0.6, 0.8], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.3, 0.09], dir: [0, 0, 1], role: "head" });
  const jawU = b.joint("jawUpper", { parent: head, at: [0, 0.305, 0.13], dir: [0, 0, 1], role: "jaw" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.298, 0.125], dir: [0, 0, 1], role: "jaw" });
  void jawU;

  const tailC = b.chain("tail", catmull([[0, 0.19, -0.08], [0, 0.17, -0.17], [0, 0.15, -0.26]]), {
    parent: hips, names: ["tail1", "tail2"], role: "tail",
  });

  // Body: a blue ellipsoid built from a sweep
  b.sweep(catmull([[0, 0.19, -0.1], [0, 0.21, -0.02], [0, 0.26, 0.07]]), [0.045, 0.07, 0.055, 0.02] as any, {
    color: BLUE, bone: [hips, spineC.joints[0], spineC.joints[1]] as any, sides: 6,
  } as any);
  // belly: red sphere low front
  b.part(new THREE.SphereGeometry(0.06, 7, 5), RED, {
    bone: spineC.joints[0], at: [0, 0.19, 0.035], scale: [0.95, 0.9, 1.05], flat: true,
  });
  // yellow chest triangle motif
  b.part(new THREE.ConeGeometry(0.03, 0.05, 3), YELLOW, {
    bone: spineC.joints[1], at: [0, 0.22, 0.085], dir: [0, -0.3, 1], flat: true,
  });

  // Head: a clean sphere + cream disc
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BLUE, { bone: head, at: [0, 0.31, 0.1], flat: true });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 12), YELLOW, {
    bone: head, at: [0, 0.325, 0.108], dir: [0, 0.3, 1], flat: true,
  });

  // Eyes
  const eyeTex = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${CREAM}" stroke="${BLACK}" stroke-width="3"/><circle cx="22" cy="20" r="9" fill="${BLACK}"/><circle cx="25" cy="16" r="3" fill="#fff"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.015, 14), "#ffffff", {
      bone: head, at: [s * 0.036, 0.317, 0.125], dir: [s * 0.8, 0.1, 0.6], axis: "z", texture: eyeTex,
    });
  }

  // Beak: upper and lower cones, red/black
  b.part(new THREE.ConeGeometry(0.016, 0.06, 4), RED, {
    bone: jawU, at: [0, 0.308, 0.17], dir: [0, 0, 1], flat: true, scale: [1, 1, 0.6],
  });
  b.part(new THREE.ConeGeometry(0.012, 0.045, 4), BLACK, {
    bone: jaw, at: [0, 0.296, 0.16], dir: [0, 0, 1], flat: true, scale: [1, 1, 0.5],
  });

  // Crest: three flat primary triangles
  [[RED, -0.015], [YELLOW, 0], [BLUE, 0.015]].forEach(([c, x], i) => {
    b.part(new THREE.ConeGeometry(0.012, 0.05 + i % 2 * 0.015, 3), c as string, {
      bone: head, at: [x as number, 0.35, 0.085], dir: [0, 1, -0.5], flat: true,
    });
  });

  // Wings: extruded triangles
  for (const s of [1, -1]) {
    b.extrude([[0, 0.04], [0.14, 0.02, "sharp"], [0.02, -0.05, "sharp"], [-0.05, -0.02]] as any, {
      at: [s * 0.058, 0.23, 0.02], x: [0, 0.0, -1], y: [s * 0.3, 1, 0], thickness: 0.012,
      color: s > 0 ? RED : YELLOW, bone: spineC.joints[1],
    });
    b.part(new THREE.CircleGeometry(0.015, 3), BLACK, {
      bone: spineC.joints[1], at: [s * 0.068, 0.235, -0.03], dir: [s, 0, 0], axis: "z", flat: true,
    });
  }

  // Tail: three feather bars
  [[-0.03, BLUE], [0, RED], [0.03, YELLOW]].forEach(([x, c], i) => {
    b.extrude([[0, 0], [0.02, 0], [0.012, -0.17, "sharp"], [0.0, -0.17, "sharp"]] as any, {
      at: [(x as number) - 0.01, 0.2, -0.1], x: [1, 0, 0], y: [i * 0.0 - (x as number) * 2, 0.15, -1],
      thickness: 0.008, color: c as string, bone: tailC.joints[0],
    });
  });

  // Branch
  const r = rng(5);
  const branch = catmull([[-0.35, 0.1, 0.0], [-0.1, 0.085, 0.0], [0.12, 0.09, 0.0], [0.38, 0.14, 0.0]]);
  b.sweep(branch, [0.022, 0.014] as any, { color: BARK, bone: hips, sides: 6 } as any);
  // twig and cut end
  b.sweep(bezier([0.2, 0.11, 0], [0.26, 0.19, 0], [0.3, 0.24, 0.02]), [0.008, 0.003] as any, {
    color: BARK2, bone: hips, sides: 5,
  } as any);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 3), RED, { bone: hips, at: [0.3, 0.245, 0.02], flat: true });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), BLUE, { bone: hips, at: [-0.33, 0.1, 0], flat: true });
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.TorusGeometry(0.022, 0.003, 4, 6), BARK2, {
      bone: hips, at: [-0.25 + i * 0.12 + r() * 0.02, 0.09 - i * 0.002, 0], dir: [1, 0, 0],
    });
  }

  // Legs and toes gripping the branch
  for (const s of [1, -1]) {
    const x = s * 0.03;
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, [[x, 0.17, -0.01], [x, 0.125, 0.0], [x, 0.108, 0.0]] as any, {
      parent: hips, names: [`hip${s > 0 ? "L" : "R"}`, `knee${s > 0 ? "L" : "R"}`, `foot${s > 0 ? "L" : "R"}`], role: "leg",
    });
    b.sweep(leg, 0.007 as any, { color: YELLOW, sides: 5 } as any);
    for (const [dz, i] of [[0.045, 0], [0.03, 1], [-0.04, 2]] as [number, number][]) {
      b.rod([x, 0.108, 0.0], [x + (i === 1 ? s * 0.012 : 0), 0.1, dz], 0.005, YELLOW, { bone: leg.tip ?? leg.joints[1], sides: 5 } as any);
    }
  }

  // Bauhaus ground-line decor on wings: stripes handled by colours above
  return b.root;
}
