```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  grain,
  limb,
  noise,
  offset,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "forest-spirit",
  description: "A small forest spirit, part deer and part mossy river stone, with a pale wooden mask and glowing green eyes.",
};

const STONE = "#7b8187";
const STONE_LIGHT = "#a3a9ae";
const STONE_DARK = "#565b62";
const MOSS = "#5e9b3a";
const MOSS_DARK = "#3c6e2e";
const WOOD = "#8c6b47";
const WOOD_PALE = "#eadcbc";
const WOOD_GRAIN = "#c9b48e";
const HOOF = "#3a2c22";
const WHITE = "#f7f4ea";
const EYE = "#86ff6e";
const FIREFLY = "#e8ff7a";

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Skeleton: hips, spine, neck, head
  const hips = b.joint("hips", { at: [0, 1.0, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.4],
      [0, 1.03, -0.12],
      [0, 1.02, 0.12],
      [0, 1.0, 0.32],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.3],
      [0, 1.2, 0.4],
      [0, 1.36, 0.5],
    ]),
    { parent: chest, count: 2, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.5, 0.56],
    aim: [0, 1.62, 0.66],
    role: "head",
  });

  // Mossy stone body and neck
  const bodyCol = paint((p, n) => (n.y + 0.4 * noise(p, 0.18, 4) > 0.5 ? MOSS : STONE));
  const body = b.sweep(spine, (t: number) => 0.12 + 0.1 * Math.sin(Math.PI * (0.15 + 0.7 * t)), {
    color: bodyCol,
  });
  b.sweep(neck, (t: number) => 0.09 - 0.02 * t, { color: bodyCol });

  // Tail: a little moss tuft
  b.part(new THREE.IcosahedronGeometry(0.08, 0), MOSS, { bone: hips, at: [0, 1.06, -0.62] });

  // Stone skull under a pale wooden mask
  const skull = b.part(new THREE.DodecahedronGeometry(0.15, 0), STONE_DARK, {
    bone: head,
    at: [0, 1.5, 0.56],
  });
  b.stick(new THREE.IcosahedronGeometry(0.05, 0), MOSS, b.surface(skull).nearest([0, 1.65, 0.56]), { embed: 0.5 });

  const maskOutline: [number, number][] = [
    [0, -0.16],
    [0.08, -0.12],
    [0.1, 0.02],
    [0.07, 0.12],
    [0, 0.16],
    [-0.07, 0.12],
    [-0.1, 0.02],
    [-0.08, -0.12],
  ];
  const maskPaint = grain(WOOD_PALE, WOOD_GRAIN, { size: 0.02, axis: "y" });
  b.extrude(maskOutline, {
    at: [0, 1.5, 0.715],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 1,
    color: maskPaint,
    bone: head,
  });

  // Glowing green eyes set into the mask
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.028, 8, 6), EYE, { bone: head, at: [s * 0.05, 1.53, 0.735] });
  }

  // Antlers with tines, white flowers and leaves
  const leafTex = svg(
    `<svg viewBox="0 0 20 32"><path d="M10 1 C19 10 18 22 10 31 C2 22 1 10 10 1Z" fill="#6fb24a"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1]) {
    const sn = s > 0 ? "L" : "R";
    const hit = b.surface(skull).nearest([s * 0.08, 1.64, 0.56]);
    const pts = [hit.at, v(s * 0.12, 1.8, 0.5), v(s * 0.2, 1.98, 0.44), v(s * 0.23, 2.16, 0.42)];
    const antler = b.sprout(`antler${sn}`, hit, pts, [0.024, 0.009], { color: WOOD });

    const a = antler.sweep.at(0.5);
    b.sprout(`tineA${sn}`, a, offset(a, [s * 0.5, 1, 0.25], 0.13), [0.012, 0.004], { color: WOOD, count: 0 });
    const c = antler.sweep.at(0.8);
    b.sprout(`tineB${sn}`, c, offset(c, [s * 0.2, 1, 0.1], 0.11), [0.01, 0.004], { color: WOOD, count: 0 });

    b.along(
      antler.sweep,
      7,
      (at) => {
        b.stick(new THREE.SphereGeometry(0.014, 5, 4), WHITE, at, { embed: 0.2 });
      },
      { from: 0.2, to: 0.95 },
    );

    const leaves = b.along(antler.sweep, 4, () => {}, { from: 0.35, to: 0.9 });
    b.cards(leaves, leafTex, { size: [0.05, 0.08], lean: 50, bend: 25, flow: [s * 0.4, 1, 0.2] });
  }

  // Slender wooden legs ending in hooves
  const addLeg = (
    name: string,
    parent: typeof chest,
    hip: [number, number, number],
    foot: [number, number, number],
    lengths: [number, number],
    bend: [number, number, number],
  ) => {
    const pts = limb(hip, foot, lengths, [bend]);
    const leg = b.chain(`leg${name}`, pts, {
      parent,
      names: [`hip${name}`, `knee${name}`, `ankle${name}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.042 - 0.014 * t, { color: WOOD });
    const ankle = leg.joints[leg.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.036, 0.042, 0.05, 6), HOOF, {
      bone: ankle,
      at: [foot[0], 0.025, foot[2]],
    });
  };
  for (const s of [1, -1]) {
    const sn = s > 0 ? "L" : "R";
    addLeg(`F${sn}`, chest, [s * 0.13, 0.92, 0.3], [s * 0.13, 0.03, 0.36], [0.48, 0.46], [0, 0, 1]);
    addLeg(`H${sn}`, hips, [s * 0.12, 0.95, -0.36], [s * 0.12, 0.03, -0.44], [0.5, 0.48], [0, 0, -1]);
  }

  // River stones and moss tufts scattered over the body
  const bodySurf = b.surface(body);
  for (const h of bodySurf.scatter(14, { rng: rng(7), minDist: 0.12, filter: (h) => h.n.y < 0.6 })) {
    b.stick(new THREE.DodecahedronGeometry(0.035, 0), STONE_LIGHT, h, { embed: 0.45 });
  }
  for (const h of bodySurf.scatter(14, { rng: rng(11), minDist: 0.12, filter: (h) => h.n.y > 0.4 })) {
    b.stick(new THREE.IcosahedronGeometry(0.075, 0), MOSS, h, { embed: 0.55 });
  }

  // Fireflies circling the head
  const rings = [
    b.ring(frame([0, 1.5, 0.56], [0, 1, 0]), { count: 5, radius: 0.42 }).items,
    b.ring(frame([0, 1.85, 0.5], [0, 1, 0]), { count: 3, radius: 0.28, fromDeg: 30, toDeg: 330 }).items,
  ];
  for (const ring of rings) {
    for (const item of ring) {
      b.part(new THREE.SphereGeometry(0.02, 5, 4), FIREFLY, { at: item });
    }
  }

  return b.root;
}
```