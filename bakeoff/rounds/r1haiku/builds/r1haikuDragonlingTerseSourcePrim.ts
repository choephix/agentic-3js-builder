import * as THREE from "three";
import { countershade, createBuilder, gradient, spots } from "../../../../src/index";

export const meta = {
  name: "Baby dragon",
  description:
    "A green hatchling dragon with a spotted back, pale belly, horns, a spiked tail and leathery wings half open.",
};

export default function babyDragon() {
  const b = createBuilder({ name: "baby-dragon", detail: 1, paintSize: 1024 });

  // Paints: a green back with darker rosettes, fading to a cream belly; wings shade from wine to orange.
  const body = spots(countershade("#3e8e4b", "#e8d58a", { level: 0, soft: 0.3 }), ["#1d5a2c", "#2f7a3d"], {
    size: 0.07,
    amount: 0.3,
    rosette: true,
  });
  const wing = gradient("#7d2a2f", "#d9822b", [0.1, 0.45, 0], [0.6, 0.35, -0.2]);
  const horn = "#eadfb4";
  const gold = "#d9a441";

  // Skeleton: root at the hips, a spine running forward to the chest, a tail behind, and a neck ending in the head.
  b.joint("root", { at: [0, 0.34, -0.02], role: "spine" });

  b.chain("spine", [[0, 0.32, -0.25], [0, 0.33, -0.08], [0, 0.38, 0.08], [0, 0.44, 0.2]], {
    parent: "root",
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const girth = (t: number): [number, number] => {
    const k = Math.sin(Math.PI * (0.1 + 0.8 * Math.min(1, Math.max(0, t))));
    return [0.05 + 0.085 * k, 0.055 + 0.075 * k];
  };
  b.sweep(b.chain === undefined ? [] : (b as any).ctx.joints.get("spine1") && (b as any).ctx.joints.get("spine1") && undefined as never, girth, {});
  return b.root;
}
