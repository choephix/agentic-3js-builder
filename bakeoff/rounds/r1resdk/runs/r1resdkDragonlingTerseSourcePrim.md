```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby green baby dragon with big amber eyes, little horns, stubby wings, a spaded tail and a rigged jaw, neck, legs and tail.",
};

type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "babyDragon" });

  const GREEN = "#4caf50";
  const DARK = "#2f7d3f";
  const CREAM = "#f2d98c";
  const ORANGE = "#e8803a";
  const HORN = "#f4ecd0";
  const skin = countershade(mottle(GREEN, "#3f9a4c", { size: 0.06, seed: 3 }), CREAM, { level: -0.25, soft: 0.25 });

  const sph = new THREE.SphereGeometry(1, 10, 7);
  const ell = (at: V, r: V, color: any, bone?: string, extra: any = {}) =>
    b.part(sph, color, { at, scale: r, bone, ...extra });
  const cone = (base: V, dir: V, r: number, len: number, color: string, bone?: string, scale?: V) => {
    const d = new THREE.Vector3(...dir).normalize();
    const c = new THREE.Vector3(...base).addScaledVector(d, len / 2);
    return b.part(new THREE.ConeGeometry(r, len, 6), color, { at: c, dir: d, bone, scale });
  };

  // ---- skeleton: spine
  b.joint("hips", { at: [0, 0.3, -0.1], dir: [0, 0, 1], role: "spine" });
  b.joint("spine1", { parent: "hips", at: [0, 0.3, 0.08], dir: [0, 0, 1], role: "spine" });

  // body
  ell([0, 0.28, -0.09], [0.15, 0.14, 0.17], skin, "hips");
  ell([0, 0.3, 0.07], [0.14, 0.14, 0.15], skin, "spine1");

  // neck
  const neck = b.chain("neck", catmull([[0, 0.36, 0.14], [0, 0.43, 0.2], [0, 0.49, 0.25]]), {
    parent: "spine1",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  b.sweep(neck, [0.075, 0.062, 0.058], { color: skin });

  // head
  ell([0, 0.52, 0.3], [0.11, 0.1, 0.11], skin, "head");
  ell([0, 0.5, 0.4], [0.06, 0.045, 0.07], skin, "head");
  b.joint("jaw", { parent: "head", at: [0, 0.465, 0.33], dir: [0, 0, 1], role: "jaw" });
  ell([0, 0.452, 0.395], [0.055, 0.022, 0.075], skin, "jaw");
  b.part(new THREE.BoxGeometry(0.035, 0.008, 0.06), "#e8788a", { at: [0, 0.465, 0.395], bone: "jaw" });
  for (const s of [1, -1]) {
    // eyes
    ell([0.062 * s, 0.55, 0.385], [0.034, 0.034, 0.034], "#fffbe8", "head");
    ell([0.068 * s, 0.552, 0.405], [0.024, 0.024, 0.024], "#f2a413", "head");
    ell([0.071 * s, 0.553, 0.423], [0.006, 0.016, 0.008], "#1a1208", "head");
    // brows, nostrils
    ell([0.065 * s, 0.595, 0.365], [0.04, 0.014, 0.03], DARK, "head");
    ell([0.02 * s, 0.52, 0.462], [0.009, 0.009, 0.009], "#234d2b", "head");
    // teeth
    for (const z of [0.42, 0.45]) {
      cone([0.034 * s, 0.472, z], [0, -1, 0], 0.007, 0.02, "#ffffff", "head");
    }
    cone([0.028 * s, 0.462, 0.43], [0, 1, 0], 0.006, 0.016, "#ffffff", "jaw");
    // horns
    cone([0.05 * s, 0.6, 0.26], [0.3 * s, 0.6, -0.8], 0.022, 0.12, HORN, "head");
    cone([0.095 * s, 0.57, 0.3], [1 * s, 0.5, -0.1], 0.012, 0.05, HORN, "head");
    // ear frills
    cone([0.1 * s, 0.53, 0.25], [1 * s, 0.25, -0.6], 0.045, 0.1, ORANGE, "head", [1, 1, 0.3]);
  }

  // ---- tail
  const tailPts: V[] = [[0, 0.27, -0.18], [0, 0.22, -0.34], [0, 0.14, -0.5], [0, 0.1, -0.64], [0, 0.14, -0.76]];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, {
    parent: "hips",
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });
  const tr = (t: number) => 0.06 * (1 - t) + 0.014;
  b.sweep(tail, (t) => tr(t), { color: skin });
  cone([0, 0.14, -0.755], [0, 0.25, -1], 0.04, 0.09, ORANGE, "tail5", [1.9, 1, 0.35]);
  for (let i = 1; i <= 8; i++) {
    const t = i / 10;
    const p = tailPath.at(t);
    cone([0, p.y + tr(t) * 0.7, p.z], [0, 1, -0.4], 0.016 * (1 - t) + 0.008, 0.045 * (1 - t) + 0.02, ORANGE);
  }

  // back and neck spikes
  const back: Array<[number, number]> = [[0.2, 0.42], [0.12, 0.45], [0.04, 0.44], [-0.04, 0.43], [-0.12, 0.42], [-0.19, 0.39]];
  back.forEach(([z, y], i) => cone([0, y - 0.015, z], [0, 1, -0.35], 0.02 - i * 0.001, 0.055 - i * 0.003, ORANGE));

  // ---- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fl = b.chain(
      "armF" + S,
      [[0.12 * s, 0.2, 0.1], [0.14 * s, 0.11, 0.12], [0.13 * s, 0.035, 0.1]],
      { parent: "spine1", names: ["shoulder" + S, "elbow" + S, "wrist" + S], role: "leg" },
    );
    b.sweep(fl, [0.05, 0.04, 0.032], { color: skin });
    ell([0.12 * s, 0.22, 0.09], [0.065, 0.075, 0.07], skin, "shoulder" + S);
    // back
    const bl = b.chain(
      "legH" + S,
      [[0.13 * s, 0.2, -0.12], [0.15 * s, 0.11, -0.09], [0.13 * s, 0.035, -0.12]],
      { parent: "hips", names: ["hip" + S, "knee" + S, "ankle" + S], role: "leg" },
    );
    b.sweep(bl, [0.06, 0.045, 0.034], { color: skin });
    ell([0.13 * s, 0.21, -0.12], [0.08, 0.09, 0.085], skin, "hip" + S);

    for (const [z, bone] of [[0.1, "wrist" + S], [-0.12, "ankle" + S]] as Array<[number, string]>) {
      b.part(new THREE.BoxGeometry(0.09, 0.036, 0.11), skin, { at: [0.13 * s, 0.018, z + 0.035], bone });
      for (const dx of [-0.03, 0, 0.03])
        cone([(0.13 + dx) * (s > 0 ? 1 : 1) * 1 + (s < 0 ? 2 * dx * 0 : 0), 0.02, z + 0.085], [0, -0.2, 1], 0.011, 0.04, HORN, bone);
    }

    // ---- wings
    const wp: V[] = [[0.1 * s, 0.42, 0.02], [0.25 * s, 0.55, -0.08], [0.4 * s, 0.6, -0.2]];
    const wing = b.chain("wing" + S, wp, { parent: "spine1", names: ["wingA" + S, "wingB" + S], role: "wing" });
    b.sweep(wing, [0.02, 0.013, 0.008], { color: DARK });
    const edge: V[] = [[0.09 * s, 0.36, -0.1], [0.24 * s, 0.42, -0.3], [0.4 * s, 0.6, -0.2]];
    b.membrane(wing, edge, { color: ORANGE, thickness: 0.004, scallop: 0.1 });
    b.rod([0.25 * s, 0.55, -0.08], [0.24 * s, 0.42, -0.3], 0.007, { color: DARK, bone: "wingB" + S });
    cone([0.4 * s, 0.6, -0.2], [0.6 * s, 0.4, -0.6], 0.012, 0.045, HORN, "wingB" + S);
  }

  return b.root;
}
```