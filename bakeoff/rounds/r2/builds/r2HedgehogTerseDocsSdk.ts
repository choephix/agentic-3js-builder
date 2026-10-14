import * as THREE from "three";
import { createBuilder, rng, limb, catmull, bezier } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description: "A stylized rigged hedgehog with a spiny coat of scattered cones, tan face, jaw, ears and four legs.",
};

const BELLY = "#e3cfa6";
const SKIN = "#4a3626";
const FACE = "#cfa97a";
const DARK = "#1a1411";
const PAW = "#b58a5e";
const SPINES = ["#3b2a1e", "#8a6a45", "#d8c8a0", "#5a432c"];

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const R = rng(11);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.078, -0.11], dir: [0, 0, 1], role: "spine" });
  const spinePath = catmull([
    [0, 0.078, -0.11],
    [0, 0.08, -0.04],
    [0, 0.08, 0.02],
    [0, 0.075, 0.07],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, count: 3, role: "spine" });
  const spineEnd = spine.at(1).at;
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.07, 0.06], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.045, 0.08], aim: [0, 0.04, 0.15], role: "jaw" });
  void spineEnd;

  // body
  const body = b.sweep(spine, (t) => {
    const k = Math.sin(Math.PI * (0.12 + 0.76 * t));
    return [0.04 + 0.05 * k, 0.035 + 0.042 * k];
  }, {
    color: SKIN,
    sectors: [[125, 235, BELLY]],
    sides: 10,
  });

  // head
  b.sweep(bezier([0, 0.07, 0.06], [0, 0.068, 0.11], [0, 0.05, 0.17]), [0.046, 0.012], {
    bone: head,
    color: FACE,
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(0.014, 6, 5), DARK, { bone: head, at: [0, 0.05, 0.176] });
  b.rod([0, 0.04, 0.09], [0, 0.037, 0.15], [0.02, 0.008], { bone: jaw, color: FACE, sides: 6 });
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.011, 6, 5), DARK, {
      bone: head,
      at: [s * 0.028, 0.082, 0.1],
    });
    b.part(new THREE.SphereGeometry(0.003, 4, 3), "#ffffff", {
      bone: head,
      at: [s * 0.031, 0.087, 0.108],
    });
    void eye;
    b.part(new THREE.SphereGeometry(0.018, 6, 5), PAW, {
      bone: head,
      at: [s * 0.04, 0.1, 0.07],
      scale: [0.5, 1, 1],
    });
  }

  // tail stub
  b.spike([0, 0.07, -0.15], [0, -0.1, -1], 0.03, 0.013, { bone: hips, color: SKIN });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [tag, z, parent] of [
      ["F", 0.04, spine.joints[2]],
      ["H", -0.07, spine.joints[0]],
    ] as const) {
      const hip: [number, number, number] = [s * 0.045, 0.05, z];
      const pts = limb(hip, [s * 0.05, 0.012, z + 0.008], [0.04, 0.04], [[0, 0, 1]]);
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `paw${tag}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.017, 0.011], { color: PAW, sides: 6 });
      const tip = leg.tip!;
      b.part(new THREE.SphereGeometry(0.016, 6, 4), PAW, {
        bone: tip,
        at: [s * 0.05, 0.01, z + 0.018],
        scale: [0.9, 0.55, 1.4],
      });
      for (const dx of [-0.008, 0, 0.008]) {
        b.spike([s * 0.05 + dx, 0.007, z + 0.03], [0, 0, 1], 0.012, 0.004, { bone: tip, color: DARK });
      }
    }
  }

  // spiny coat
  const skin = b.surface(body);
  const hits = skin.scatter(340, {
    rng: R,
    minDist: 0.015,
    filter: (h) => h.n.y > -0.15 && h.at.z < 0.065 && h.at.z > -0.125,
  });
  const cone = new THREE.ConeGeometry(0.0075, 0.05, 5);
  for (const h of hits) {
    const c = SPINES[Math.floor(R() * SPINES.length)];
    b.stick(cone, c, h, { embed: 0.3, spin: R() * 360 });
  }

  return b.root;
}
