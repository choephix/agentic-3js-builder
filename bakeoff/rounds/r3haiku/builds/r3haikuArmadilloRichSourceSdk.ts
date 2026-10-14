import * as THREE from "three";
import { createBuilder, polyline, rng, stripes, svg } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description: "A trotting nine-banded armadillo with a banded shell, pointed snout, tall ears, clawed feet, a tapering armoured tail and pale hairs between the bands.",
};

export default function build() {
  const b = createBuilder({ name: "nine-banded armadillo", paintSize: 1024 });

  // Colours. The shell is a dusty pinkish-tan with darker bands running round the body.
  const shell = stripes("#c6a495", "#8e6a5b", { size: 0.045, axis: "z", width: 0.42, wobble: 0.35, seed: 3 });
  const tailPaint = stripes("#c6a495", "#7d5b4d", { size: 0.03, axis: "z", width: 0.5, wobble: 0.3, seed: 7 });
  const skin = "#b38e7c";
  const earColor = "#cfa797";
  const claw = "#eee2cc";
  const dark = "#16100e";

  // Skeleton: hips, a spine, a chest tip, a head with a hinged jaw.
  b.joint("hips", { at: [0, 0.2, -0.04], role: "spine" });
  b.chain("spine", polyline([[0, 0.2, -0.04], [0, 0.2, 0.07], [0, 0.2, 0.18]]), {
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.joint("head", { parent: "chest", at: [0, 0.24, 0.22], aim: [0, 0.24, 0.5], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.215, 0.3], dir: [0, 0, 1], role: "jaw" });

  // Body shell: a loft of stations, bending smoothly over the spine.
  const body = b.loft(
    [
      { at: [0, 0.2, -0.1], w: 0.16, h: 0.14 },
      { at: [0, 0.205, 0.02], w: 0.2, h: 0.17 },
      { at: [0, 0.2, 0.14], w: 0.18, h: 0.15 },
      { at: [0, 0.2, 0.22], w: 0.11, h: 0.12 },
    ],
    { color: shell, bone: ["hips", "spine1", "spine2", "chest"], name: "shell" },
  );

  // Head: a tapering, pointed snout.
  const head = b.loft(
    [
      { at: [0, 0.24, 0.27], w: 0.1, h: 0.1 },
      { at: [0, 0.235, 0.37], w: 0.085, h: 0.085 },
      { at: [0, 0.23, 0.46], w: 0.05, h: 0.045 },
      { at: [0, 0.225, 0.53], w: 0.02, h: 0.02 },
    ],
    { color: skin, bone: "head", name: "head" },
  );

  // Lower jaw.
  b.loft(
    [
      { at: [0, 0.218, 0.3], w: 0.06, h: 0.035 },
      { at: [0, 0.21, 0.4], w: 0.045, h: 0.025 },
      { at: [0, 0.205, 0.47], w: 0.02, h: 0.012 },
    ],
    { color: skin, bone: "jaw", name: "jaw" },
  );

  // Nose tip.
  b.part(new THREE.SphereGeometry(0.012, b.segments(8), b.segments(6)), "#4a3a34", {
    at: [0, 0.225, 0.535],
    bone: "head",
    name: "nose",
  });

  // Small beady eyes set in the sides of the head.
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, b.segments(8), b.segments(6)), dark, {
      at: [s * 0.046, 0.243, 0.3],
      bone: "head",
      name: "eye",
    });

  // Tall leathery ears, flat in the side plane.
  const EAR: number[][] = [
    [-0.03, 0],
    [0.03, 0],
    [0.035, 0.06],
    [0.025, 0.11],
    [0, 0.13],
    [-0.025, 0.1],
    [-0.035, 0.05],
  ];
  for (const s of [1, -1])
    b.extrude(EAR, {
      color: earColor,
      at: [s * 0.026, 0.262, 0.31],
      thickness: 0.008,
      bevel: 0.003,
      bone: "head",
      name: "ear",
    });

  // Four legs in a trot: front-left and hind-right forward, the others back, the front-right paw lifted.
  const legs = [
    { p: "fl", x: 0.065, z: 0.12, reach: 0.09, lift: 0 },
    { p: "fr", x: -0.065, z: 0.12, reach: -0.03, lift: 0.03 },
    { p: "hl", x: 0.065, z: -0.04, reach: -0.05, lift: 0.02 },
    { p: "hr", x: -0.065, z: -0.04, reach: 0.07, lift: 0 },
  ];
  for (const { p, x, z, reach, lift } of legs) {
    const toe: [number, number, number] = [x, 0.014 + lift, z + reach];
    const leg = b.chain(
      `leg_${p}`,
      polyline([
        [x, 0.2, z],
        [x, 0.11 + lift * 0.5, z + reach * 0.35],
        [x, 0.045 + lift, z + reach * 0.8],
        toe,
      ]),
      { names: [`${p}Up`, `${p}Low`, `${p}Paw`, `${p}Toe`], role: "leg" },
    );
    b.sweep(leg, [0.032, 0.026, 0.02, 0.017], { color: skin, name: `leg_${p}` });
    // Three claws at the toe, pointing forward and down.
    for (const dx of [-0.008, 0, 0.008])
      b.spike(
        [x + dx, toe[1], toe[2]],
        [x + dx * 1.5, toe[1] - 0.012, toe[2] + 0.03],
        null,
        0.0045,
        { color: claw, bone: `${p}Toe`, name: "claw" },
      );
  }

  // Long armoured tail, banded, tapering to a point.
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.19, -0.1],
      [0, 0.17, -0.22],
      [0, 0.15, -0.36],
      [0, 0.13, -0.52],
    ]),
    { names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, (t: number) => [0.05 * (1 - t) + 0.007 * t, 0.042 * (1 - t) + 0.006 * t] as const, {
    color: tailPaint,
    caps: { end: "point" },
    name: "tail",
  });

  // Coarse pale hairs poking out of the shell between the bands.
  const hairTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 48"><path d="M6 48 Q4 26 7 2" stroke="#fbf5ea" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface([body, head]).scatter(110, {
    rng: rng(5),
    minDist: 0.012,
    filter: (h) => h.n.y > -0.1,
  });
  b.cards(hits, hairTexture, {
    size: [0.01, 0.045],
    lean: 25,
    bend: 20,
    vary: 0.3,
    spin: 40,
    rng: rng(9),
    color: "#f5eddc",
    sink: 0.25,
    name: "hair",
  });

  return b.root;
}
