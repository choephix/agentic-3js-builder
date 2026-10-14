```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, patches, rng } from "agentic-3js-builder";

export const meta = {
  name: "Green Sea Turtle",
  description:
    "A green sea turtle in a neutral swimming rest pose: heart-shaped olive and caramel shell with brown scute lines, pale belly plate, cream-edged head scales, long spread front flippers, short rear flippers, jointed jaw, and a remora riding under the shell.",
};

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });

  const BROWN = "#4a3219";
  const OLIVE = "#76803a";
  const CARAMEL = "#b8802f";
  const CREAM = "#efe3b0";
  const BELLY = "#ecd98a";
  const SKIN = "#6d7a38";
  const DARK = "#17110a";
  const BEAK = "#d6bd72";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.2, -0.3], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.3],
      [0, 0.22, 0],
      [0, 0.23, 0.4],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.23, 0.4],
      [0, 0.25, 0.62],
      [0, 0.27, 0.8],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.27, 0.8], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.25, 0.83],
    aim: [0, 0.25, 0.95],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.3],
      [0, 0.19, -0.5],
      [0, 0.17, -0.68],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- shell ----------
  const shellPaint = patches(BROWN, [OLIVE, CARAMEL, OLIVE], { size: 0.17 });
  const carapace = b.loft(
    [
      { at: [0, 0.21, -0.5], w: 0.1, h: 0.08 },
      { at: [0, 0.23, -0.35], w: 0.45, h: 0.18 },
      { at: [0, 0.24, -0.1], w: 0.8, h: 0.24 },
      { at: [0, 0.24, 0.15], w: 0.86, h: 0.25 },
      { at: [0, 0.235, 0.35], w: 0.64, h: 0.2 },
      { at: [0, 0.225, 0.47], w: 0.34, h: 0.12 },
    ],
    { bone: hips, color: shellPaint },
  );
  b.loft(
    [
      { at: [0, 0.13, -0.42], w: 0.1, h: 0.06 },
      { at: [0, 0.13, -0.25], w: 0.5, h: 0.1 },
      { at: [0, 0.13, 0], w: 0.66, h: 0.11 },
      { at: [0, 0.13, 0.25], w: 0.56, h: 0.1 },
      { at: [0, 0.13, 0.42], w: 0.26, h: 0.07 },
    ],
    { bone: hips, color: patches("#b99b4c", BELLY, { size: 0.15 }) },
  );

  // rim line, dorsal ridge and scute bosses
  try {
    const rim = b.surface(carapace).loop([0, 0.23, 0], { dir: [0, 1, 0], lift: 0.004 });
    b.sweep(rim, 0.014, { color: BROWN, bone: hips, sides: 6 });
  } catch (e) {
    /* rim optional */
  }
  try {
    b.sweep(carapace.line(0, 0.004), 0.011, { color: BROWN, bone: hips, sides: 6 });
  } catch (e) {
    /* ridge optional */
  }
  const skin = b.surface(carapace);
  for (const hit of skin.scatter(16, { rng: rng(11), minDist: 0.17, filter: (h) => h.n.y > 0.6 })) {
    b.stick(new THREE.SphereGeometry(0.04, 6, 4), CARAMEL, hit, { embed: 0.7, scale: [1, 0.35, 1], bone: hips });
  }

  // ---------- neck, head, tail ----------
  const headPaint = patches(CREAM, [OLIVE, SKIN, "#7f8a3e"], { size: 0.05 });
  b.sweep(neck, [0.07, 0.062], { color: patches(CREAM, [SKIN, OLIVE], { size: 0.06 }), caps: "none" });
  b.part(new THREE.SphereGeometry(0.1, 10, 8), headPaint, {
    bone: head,
    at: [0, 0.275, 0.83],
    scale: [0.95, 0.8, 1.15],
  });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), BEAK, {
    bone: head,
    at: [0, 0.26, 0.92],
    scale: [1.05, 0.5, 1.1],
  });
  b.part(new THREE.ConeGeometry(0.016, 0.035, 5), BEAK, {
    bone: head,
    at: [0, 0.243, 0.968],
    dir: [0, -1, 0.1],
  });
  b.part(new THREE.SphereGeometry(0.052, 8, 6), "#c4a95f", {
    bone: jaw,
    at: [0, 0.232, 0.9],
    scale: [0.95, 0.4, 1.1],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), DARK, { bone: head, at: [s * 0.078, 0.298, 0.875] });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { bone: head, at: [s * 0.092, 0.308, 0.893] });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#5a6727", {
      bone: head,
      at: [s * 0.075, 0.322, 0.865],
      scale: [1.1, 0.45, 1.5],
    });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK, { bone: head, at: [s * 0.016, 0.272, 0.968] });
  }
  b.sweep(tail, [0.045, 0.01], { color: SKIN, caps: "point" });

  // ---------- flippers ----------
  const flipPaint = patches(CREAM, [SKIN, OLIVE, "#85903f"], { size: 0.07 });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `flipperF${side}`,
      catmull([
        [s * 0.3, 0.18, 0.22],
        [s * 0.75, 0.15, 0.1],
        [s * 1.3, 0.1, -0.15],
      ]),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(front, (t) => [0.105 * (1 - t) + 0.016, 0.03 * (1 - t) + 0.007], { color: flipPaint });
    b.spike(front.at(1).at, [s * 0.5, -0.1, -0.5], 0.05, 0.012, { color: "#3a2c18" });

    const rear = b.chain(
      `flipperR${side}`,
      catmull([
        [s * 0.22, 0.17, -0.28],
        [s * 0.38, 0.15, -0.42],
        [s * 0.58, 0.12, -0.64],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(rear, (t) => [0.07 * (1 - t) + 0.014, 0.024 * (1 - t) + 0.006], { color: flipPaint });
  }

  // ---------- remora ----------
  const rpath = catmull([
    [0, 0.048, -0.25],
    [0, 0.048, -0.1],
    [0, 0.048, 0.12],
  ]);
  b.sweep(rpath, [0.014, 0.032, 0.043, 0.04, 0.03], {
    bone: hips,
    color: countershade("#5f656c", "#dcdfd8", { level: 0 }),
    sides: 8,
  });
  b.part(new THREE.BoxGeometry(0.075, 0.012, 0.18), "#34383d", { bone: hips, at: [0, 0.093, -0.02] });
  b.extrude(
    [
      [0, 0],
      [0.07, 0.065],
      [0.05, 0],
      [0.07, -0.065],
    ],
    { at: [0, 0.048, -0.25], x: [0, 0, -1], thickness: 0.008, color: "#4e5359", bone: hips },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 5, 4), DARK, { bone: hips, at: [s * 0.03, 0.06, 0.08] });
    b.extrude(
      [
        [0, 0],
        [0.05, -0.02],
        [0.015, -0.045],
      ],
      { at: [s * 0.036, 0.04, -0.02], x: [0, 0, -1], y: [s * 0.6, 0.3, 0], thickness: 0.006, color: "#6c7279", bone: hips },
    );
  }

  return b.root;
}
```