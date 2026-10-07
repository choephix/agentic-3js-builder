import * as THREE from "three";
import { catmull, cells, createBuilder, mix, paint, smoothstep } from "../../../../src/index";
import type { OutlineInput } from "../../../../src/index";

export const meta = {
  name: "Garden snail",
  description: "A garden snail with a striped spiral shell, a pebbly grey-green body, eye stalks and a ladybird on top.",
};

const CARAMEL = "#b86f2e";
const CHOCOLATE = "#4a2817";
const CREAM = "#f3e4c2";

/** Shell silhouette: a lathe around the shell's axis, from the base (y = 0) up to the apex. */
const SHELL: OutlineInput = [
  [0, 0, "sharp"],
  [0.02, 0.004],
  [0.038, 0.016],
  [0.047, 0.036],
  [0.046, 0.058],
  [0.036, 0.078],
  [0.018, 0.092],
  [0, 0.1, "sharp"],
];

/** Caramel, chocolate and cream bands that wind round the shell in a spiral (height and angle both drive them). */
const shellPaint = paint((_p, _n, s) => {
  const x = (((s[0] * 22 + s[1] / 360) % 1) + 1) % 1;
  if (x < 0.42) return CARAMEL;
  if (x < 0.5) return CHOCOLATE;
  if (x < 0.74) return CREAM;
  if (x < 0.82) return CHOCOLATE;
  return CARAMEL;
});

/** Soft grey-green skin with small pebbles and a wet sheen on the top. */
const bodyPaint = paint((p, n) => {
  const pebble = cells(p, 0.007, 5);
  const dark = smoothstep(0.15, 0.45, pebble.d1);
  const base = mix("#a4b39c", "#687a64", pebble.id);
  const shaded = mix(base, "#3d4a3b", dark * 0.5);
  return mix(shaded, "#f0f8ec", smoothstep(0.55, 0.95, n.y) * 0.4);
});

export default function snail() {
  const b = createBuilder({ name: "snail", paintSize: 2048 });

  // Skeleton: a root, then a spine that runs from the tail to the head.
  b.joint("root", { at: [0, 0.02, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.012, -0.07],
      [0, 0.017, -0.02],
      [0, 0.022, 0.02],
      [0, 0.03, 0.06],
    ]),
    { parent: "root", role: "spine", names: ["back", "mid", "neck", "head"] },
  );

  // Soft body: thin at the tail, fuller under the shell, rounded head.
  b.sweep(spine, (t) => 0.007 + 0.014 * Math.sin((Math.min(t, 1) * Math.PI) / 2), {
    color: bodyPaint,
    name: "body",
  });

  // Shell: a lathed spiral dome tilted up and back, seated on the back of the body.
  const shell = b.lathe(SHELL, {
    color: shellPaint,
    name: "shell",
    at: [0, 0.025, -0.025],
    axis: [0, 1, -0.35],
    segments: 18,
    smoothing: 1,
    bone: "back",
  });

  // Ladybird: a red dome stuck on the top of the shell, with black spots.
  const hit = b.surface(shell).nearest([0, 0.135, -0.065]);
  const dome = new THREE.SphereGeometry(0.012, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const ladybird = b.stick(dome, "#c9261c", hit, { name: "ladybird", embed: 0.25 });

  const dot = new THREE.SphereGeometry(0.0028, 8, 6);
  const SPOTS: Array<[number, number]> = [
    [0.5, 0.3],
    [0.5, 2.0],
    [0.5, 3.7],
    [0.5, 5.3],
    [1.0, 1.2],
    [1.0, 4.6],
    [0.95, 3.0],
  ];
  const R = 0.0125;
  for (const [theta, phi] of SPOTS) {
    const p: [number, number, number] = [
      R * Math.sin(theta) * Math.cos(phi),
      R * Math.cos(theta),
      R * Math.sin(theta) * Math.sin(phi),
    ];
    b.part(dot, "#151515", { frame: ladybird, at: ladybird.local(p), name: "ladybirdSpot" });
  }
  b.part(new THREE.SphereGeometry(0.0045, 10, 8), "#151515", {
    frame: ladybird,
    at: ladybird.local([0, 0.0008, 0.0112]),
    name: "ladybirdHead",
  });

  // Eye stalks and feelers, mirrored left (+X) and right (-X).
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const stalk = b.chain(
      `stalk${side}`,
      catmull([
        [0.01 * s, 0.042, 0.058],
        [0.015 * s, 0.072, 0.066],
        [0.021 * s, 0.1, 0.072],
      ]),
      { parent: "head", role: "tentacle", names: [`stalk${side}1`, `stalk${side}2`, `eye${side}`] },
    );
    b.sweep(stalk, (t) => 0.0055 - 0.0022 * t, { color: bodyPaint, name: `stalk${side}` });
    b.part(new THREE.SphereGeometry(0.0085, 14, 10), "#141414", { bone: stalk, name: `eye${side}` });
    b.part(new THREE.SphereGeometry(0.0026, 8, 6), "#ffffff", {
      bone: stalk,
      at: stalk.tip!.local({ forward: 0.0065, up: 0.004 }),
      name: `glint${side}`,
    });

    const feeler = b.chain(
      `feeler${side}`,
      catmull([
        [0.006 * s, 0.034, 0.072],
        [0.011 * s, 0.05, 0.09],
      ]),
      { parent: "head", role: "tentacle", names: [`feeler${side}1`, `feeler${side}Tip`] },
    );
    b.sweep(feeler, (t) => 0.0034 - 0.0016 * t, { color: bodyPaint, name: `feeler${side}` });
  }

  return b.root;
}
