```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, patches, paint, offset } from "agentic-3js-builder";

export const meta = {
  name: "Giraffe",
  description: "Stylized rigged giraffe with patchwork coat, ossicones, mane, tufted tail and a hinged jaw.",
};

const CREAM = "#ecd39a";
const BROWN = "#a8631f";
const DARK = "#5b3416";
const HOOF = "#2a1c14";
const HEAD = "#d9a85c";
const MUZZLE = "#b98a62";
const EYE = "#111111";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "giraffe" });
  const coat = patches(CREAM, [BROWN, "#8f4f19"], { size: 0.42, gap: 0.05, seed: 5 });
  const legCoat = paint((p) => (p.y < 0.75 ? CREAM : coat));

  // Spine
  const hips = b.joint("hips", { at: [0, 2.75, -0.7], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 2.75, -0.7], [0, 2.85, -0.1], [0, 3.0, 0.5]]),
    { parent: hips, role: "spine", count: 3 },
  );
  const lastSpine = spine.joints[spine.joints.length - 1];
  b.sweep(spine, (t) => [0.28 + 0.04 * t, 0.4 + 0.08 * t], {
    color: coat,
    shift: [0, -0.08],
  });

  // Neck
  const neck = b.chain(
    "neck",
    catmull([[0, 3.0, 0.5], [0, 3.6, 0.85], [0, 4.2, 1.2], [0, 4.65, 1.45]]),
    { parent: lastSpine, role: "neck", count: 4 },
  );
  const neckTube = b.sweep(neck, [0.27, 0.13], { color: coat });
  b.along(neckTube, 14, (at) =>
    b.stick(new THREE.BoxGeometry(0.035, 0.12, 0.08), DARK, at, { embed: 0.3 }),
  );

  // Head
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.at(1).at,
    dir: [0, -0.25, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.05, -0.08]),
    aim: head.local([0, 0.5, -0.1]),
    role: "jaw",
  });
  b.frustumBox(head.local([0, -0.08, 0]), head.local([0, 0.2, 0]), [0.28, 0.3], [0.2, 0.22], {
    bone: head,
    color: HEAD,
  });
  b.frustumBox(head.local([0, 0.18, 0]), head.local([0, 0.52, 0]), [0.2, 0.2], [0.16, 0.14], {
    bone: head,
    color: MUZZLE,
  });
  b.frustumBox(head.local([0, 0.1, -0.11]), head.local([0, 0.5, -0.11]), [0.14, 0.07], [0.12, 0.06], {
    bone: jaw,
    color: MUZZLE,
  });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), DARK, {
    bone: head,
    at: head.local([0, 0.52, 0.0]),
    scale: [1.3, 0.8, 1],
  });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.04, 6, 4), EYE, {
      bone: head,
      at: head.local([s * 0.14, 0.12, 0.07]),
    });
    // ears
    b.part(new THREE.SphereGeometry(0.08, 6, 4), BROWN, {
      bone: head,
      at: head.local([s * 0.26, 0.0, 0.07]),
      scale: [2, 0.45, 1],
      rotation: [0, 0, s * 20],
    });
    // ossicones
    const base = head.local([s * 0.07, 0.02, 0.15]);
    const d = new THREE.Vector3(s * 0.12, 1, -0.2).normalize();
    b.spike(base, [d.x, d.y, d.z], 0.32, 0.035, { bone: head, color: HEAD, caps: "flat" });
    const tip = offset(base, [d.x, d.y, d.z], 0.33);
    b.part(new THREE.SphereGeometry(0.058, 6, 4), DARK, { bone: head, at: tip });
  }

  // Legs
  const mk = (name: string, parent: any, hip: number[], foot: number[], bend: number[], s: number) => {
    const pts = limb(hip, foot, [1.25, 1.25], [bend]);
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`${name}${side}`, pts, {
      parent,
      role: "leg",
      names: [`${name}Hip${side}`, `${name}Knee${side}`, `${name}Foot${side}`],
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, [0.17, 0.1, 0.075], { color: legCoat });
    const tipJ = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.085, 0.11, 0.14, 6), HOOF, {
      bone: tipJ,
      at: [foot[0], 0.07, foot[2]],
    });
  };
  for (const s of [1, -1]) {
    mk("front", lastSpine, [s * 0.25, 2.5, 0.5], [s * 0.25, 0.14, 0.55], [0, 0, 1], s);
    mk("hind", hips, [s * 0.25, 2.5, -0.65], [s * 0.25, 0.14, -0.7], [0, 0, -1], s);
  }

  // Tail
  const tail = b.chain(
    "tail",
    catmull([[0, 2.75, -1.0], [0, 2.5, -1.2], [0, 1.9, -1.3], [0, 1.4, -1.3]]),
    { parent: hips, role: "tail", count: 3 },
  );
  b.sweep(tail, [0.055, 0.03], { color: coat });
  b.spike([0, 1.45, -1.3], [0, -1, 0], 0.3, 0.07, {
    bone: tail.joints[tail.joints.length - 1],
    color: DARK,
    caps: "flat",
  });

  return b.root;
}
```