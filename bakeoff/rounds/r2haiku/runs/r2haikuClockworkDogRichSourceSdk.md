```ts
import * as THREE from "three";
import { createBuilder, mottle, spiral } from "agentic-3js-builder";

export const meta = {
  name: "Clockwork terrier",
  description:
    "A wind-up clockwork terrier in polished brass and copper: riveted body plates, gears in the chest, a winding key, springy jointed legs, floppy leather ears, green glass lens eyes, a coiled spring tail and a red collar with a brass tag.",
};

const BRASS = mottle("#d8ad52", "#a67a2e", { size: 0.12, seed: 3, contrast: 1.2 });
const BRASS_TAG = "#e3b955";
const COPPER = "#b87333";
const LEATHER = "#5b3a24";
const COLLAR = "#a8201f";
const GLASS = "#7fe3ae";
const DARK = "#1d1a17";

export default function clockworkTerrier() {
  const b = createBuilder({ name: "clockwork-terrier", detail: 1, paintSize: 1024 });

  // Skeleton: hips, a spine running forward, a neck to the head, four jointed legs and a coiled tail.
  b.joint("hips", { at: [0, 0.2, -0.14] });
  const spine = b.chain("spine", [[0, 0.2, -0.14], [0, 0.21, 0.02], [0, 0.21, 0.16]], {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", [[0, 0.21, 0.16], [0, 0.31, 0.2], [0, 0.37, 0.25]], {
    parent: "chest",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });

  // Body: a smooth brass loft that bends with the spine.
  const body = b.loft(
    [
      { at: [0, 0.2, -0.2], w: 0.12, h: 0.14 },
      { at: [0, 0.21, -0.07], w: 0.17, h: 0.17 },
      { at: [0, 0.21, 0.05], w: 0.18, h: 0.18 },
      { at: [0, 0.2, 0.16], w: 0.17, h: 0.19 },
    ],
    { name: "body", color: BRASS, bone: [hipsJoint(b), spine] },
  );

  // Neck and head.
  b.sweep(neck, { radius: [0.06, 0.05], color: BRASS, name: "neck" });
  b.loft(
    [
      { at: [0, 0.38, 0.25], w: 0.11, h: 0.11 },
      { at: [0, 0.39, 0.31], w: 0.1, h: 0.1 },
      { at: [0, 0.37, 0.37], w: 0.07, h: 0.068 },
      { at: [0, 0.365, 0.42], w: 0.045, h: 0.045 },
    ],
    { name: "head", color: BRASS, bone: "head" },
  );

  // Floppy leather ears hanging from the top of the head.
  for (const s of [1, -1]) {
    const x = s * 0.046;
    b.slab(
      [
        [x, 0.43, 0.2],
        [x, 0.445, 0.25],
        [x, 0.4, 0.31],
        [x, 0.31, 0.3],
        [x, 0.29, 0.25],
        [x, 0.36, 0.2],
      ],
      { color: LEATHER, thickness: 0.008, bone: "head", name: s > 0 ? "earL" : "earR" },
    );
  }

  // Glass-lens eyes with brass bezels, and a dark nose.
  for (const s of [1, -1]) {
    const x = s * 0.05;
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), GLASS, {
      bone: "head",
      at: [x, 0.39, 0.3],
      name: "eye",
    });
    b.part(new THREE.TorusGeometry(0.023, 0.005, b.segments(6), b.segments(14)), BRASS_TAG, {
      bone: "head",
      at: [x * 1.01, 0.39, 0.3],
      rotation: [0, 90, 0],
      name: "bezel",
    });
  }
  b.part(new THREE.SphereGeometry(0.016, b.segments(8), b.segments(6)), DARK, {
    bone: "head",
    at: [0, 0.365, 0.43],
    name: "nose",
  });

  // Winding key on the back: a shaft with a flat loop on top.
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.05, b.segments(8)), "#c8963e", {
    bone: "spine2",
    at: [0, 0.31, -0.07],
    name: "keyShaft",
  });
  b.part(new THREE.TorusGeometry(0.024, 0.005, b.segments(6), b.segments(16)), "#c8963e", {
    bone: "spine2",
    at: [0, 0.34, -0.07],
    rotation: [90, 0, 0],
    name: "keyLoop",
  });

  // Chest gears: each a disc with a ring of teeth, seated on the chest's front face.
  const skin = b.surface(body);
  const gear = (p: number[], teeth: number, r: number) => {
    const hit = skin.nearest(p);
    b.stick(new THREE.CylinderGeometry(r, r, 0.008, b.segments(14)), BRASS, hit, { embed: 0.3, name: "gear" });
    b.ring(hit, { count: teeth, radius: r + 0.002 }, (item) => {
      b.stick(new THREE.BoxGeometry(0.008, 0.012, 0.008), COPPER, item, { embed: 0.4, name: "tooth" });
    });
  };
  gear([-0.03, 0.19, 0.5], 10, 0.024);
  gear([0.03, 0.23, 0.5], 9, 0.02);

  // Riveted side plates, each with four rivets at its corners.
  const rivet = (p: number[]) =>
    b.stick(new THREE.SphereGeometry(0.0075, b.segments(6), b.segments(4)), COPPER, skin.nearest(p), {
      embed: 0.3,
      name: "rivet",
    });
  for (const zc of [-0.1, 0.02, 0.12]) {
    for (const s of [1, -1]) {
      b.stick(new THREE.BoxGeometry(0.09, 0.005, 0.1), COPPER, skin.nearest([s * 0.5, 0.21, zc]), {
        embed: 0.4,
        name: "plate",
      });
      for (const dz of [-0.04, 0.04]) for (const dy of [-0.045, 0.045]) rivet([s * 0.5, 0.21 + dy, zc + dz]);
    }
  }

  // Legs: a front and a hind pair on each side, each a three-span springy chain with paws.
  const limb = (kind: "front" | "hind", s: "L" | "R", x: number) => {
    const front = kind === "front";
    const pts = front
      ? [[x, 0.22, 0.1], [x, 0.12, 0.12], [x, 0.05, 0.1], [x, 0, 0.14]]
      : [[x, 0.22, -0.1], [x, 0.12, -0.14], [x, 0.05, -0.2], [x, 0, -0.16]];
    const names = front
      ? [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `paw${s}`]
      : [`hip${s}`, `knee${s}`, `hock${s}`, `toe${s}`];
    const chain = b.chain(`${kind}Leg${s}`, pts, { parent: front ? "spine2" : "hips", names, role: "leg" });
    b.sweep(chain, { radius: [0.017, 0.011], color: COPPER, name: `${kind}Leg${s}` });
    b.part(new THREE.BoxGeometry(0.03, 0.014, 0.045), BRASS_TAG, {
      bone: names[3],
      at: [x, 0.007, front ? 0.15 : -0.17],
      name: "paw",
    });
  };
  limb("front", "L", 0.065);
  limb("front", "R", -0.065);
  limb("hind", "L", 0.07);
  limb("hind", "R", -0.07);

  // Tail: a coiled spring rising from the rump.
  const coil = spiral([0, 0.22, -0.2], [0.035, 0.22, -0.2], [0, 1, -0.6], {
    turns: 2.5,
    r1: 0.02,
    pitch: 0.05,
  });
  const tail = b.chain("tail", coil, { parent: "hips", count: 4, role: "tail" });
  b.sweep(tail, { radius: [0.012, 0.009], color: COPPER, name: "tail" });

  // Red collar with a brass tag hanging under the throat.
  b.part(new THREE.TorusGeometry(0.06, 0.009, b.segments(8), b.segments(18)), COLLAR, {
    bone: "neck1",
    at: [0, 0.27, 0.185],
    rotation: [-68, 0, 0],
    name: "collar",
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.003, b.segments(12)), BRASS_TAG, {
    bone: "neck1",
    at: [0, 0.222, 0.25],
    rotation: [90, 0, 0],
    name: "tag",
  });

  return b.root;
}

/** The hips joint, looked up by name so the body loft can bend across it. */
function hipsJoint(b: ReturnType<typeof createBuilder>) {
  return "hips";
}
```