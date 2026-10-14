```ts
import * as THREE from "three";
import { createBuilder, grain, mottle, noise, paint } from "agentic-3js-builder";

export const meta = {
  name: "Stag beetle on a mossy log",
  description:
    "A proud chestnut stag beetle with glossy wing cases, branched antler jaws, elbowed feathery antennae and spiny legs gripping a mossy log, with a dewdrop on one antler.",
};

const LOG_R = 0.06;
const BODY_Y = 0.134;
const CHITIN = "#151210";
const WING = "#9a5424";
const JAW = "#7d3322";
const LEG = "#1d1915";
const ANTENNA = "#4a2c1a";
const FEATHER = "#c49a45";
const DEW = "#b6ecff";

/** Height of the log's top surface at lateral offset x. */
const surfaceY = (x: number) => LOG_R + Math.sqrt(Math.max(0, LOG_R * LOG_R - x * x));

export default function stagBeetle() {
  const b = createBuilder({ name: "stag-beetle", detail: 1, paintSize: 1024 });

  // Paints: mossy bark for the log and moss clumps.
  const moss = mottle("#3f7a2a", "#86b444", { size: 0.012, contrast: 1.2, seed: 3 });
  const bark = grain("#5b3d24", "#33210f", { size: 0.01, axis: "z", seed: 5 });
  const logPaint = paint((p, n) => (n.y + 0.4 * (noise(p, 0.03, 9) - 0.5) > 0.35 ? moss : bark));

  // Skeleton: the log is the root, the beetle body rides on it.
  b.joint("log", { at: [0, 0, 0] });
  b.joint("body", { parent: "log", at: [0, BODY_Y, 0] });
  b.joint("head", { parent: "body", at: [0, 0.14, 0.035] });

  // The log, lying along z and resting on the floor.
  b.sweep(
    [
      [0, LOG_R, -0.16],
      [0, LOG_R, 0.16],
    ],
    (t: number) => LOG_R + 0.002 * Math.sin(t * 6),
    { color: logPaint, bone: "log", caps: "flat", name: "log" },
  );

  // Moss clumps on the log's top and flanks.
  const clumps: Array<[number, number]> = [
    [-0.035, -0.09],
    [0.04, -0.06],
    [-0.02, 0.07],
    [0.03, 0.11],
    [-0.05, 0.02],
    [0.05, 0.09],
  ];
  for (const [x, z] of clumps)
    b.part(new THREE.SphereGeometry(0.022, b.segments(10), b.segments(6)), moss, {
      at: [x, surfaceY(x) - 0.002, z],
      bone: "log",
      scale: [1, 0.5, 1.1],
      name: "moss",
    });

  // Black pronotum (thorax).
  b.loft(
    [
      { at: [0, BODY_Y + 0.002, 0.014], w: 0.03, h: 0.024 },
      { at: [0, BODY_Y + 0.004, 0.0], w: 0.042, h: 0.03 },
      { at: [0, BODY_Y + 0.002, -0.012], w: 0.03, h: 0.026 },
    ],
    { color: CHITIN, bone: "body", name: "thorax" },
  );

  // Glossy chestnut wing cases over the abdomen.
  b.loft(
    [
      { at: [0, BODY_Y, 0.0], w: 0.03, h: 0.03 },
      { at: [0, BODY_Y + 0.002, -0.022], w: 0.046, h: 0.038 },
      { at: [0, BODY_Y + 0.001, -0.048], w: 0.044, h: 0.034 },
      { at: [0, BODY_Y - 0.006, -0.074], w: 0.022, h: 0.024 },
    ],
    { color: WING, bone: "body", name: "elytra", group: "elytra" },
  );

  // Black head.
  b.part(new THREE.SphereGeometry(0.017, b.segments(12), b.segments(9)), CHITIN, {
    at: [0, 0.14, 0.036],
    bone: "head",
    scale: [1.05, 0.9, 1.2],
    name: "head",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0045, b.segments(8), b.segments(6)), "#2a2420", {
      at: [s * 0.013, 0.146, 0.044],
      bone: "head",
      name: "eye",
    });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Antler jaw: a curved beam with two branching tines.
    const jaw = b.chain(
      `jaw${L}`,
      [
        [s * 0.008, 0.136, 0.046],
        [s * 0.016, 0.139, 0.07],
        [s * 0.03, 0.142, 0.09],
        [s * 0.036, 0.137, 0.108],
      ],
      { parent: "head", names: [`jaw${L}1`, `jaw${L}2`, `jaw${L}3`], role: "jaw" },
    );
    b.sweep(jaw, (t: number) => 0.0052 - 0.0026 * t, { color: JAW, name: `mandible${L}` });
    b.rod(jaw.at(0.45), [s * 0.034, 0.152, 0.116], 0.0024, { color: JAW, bone: `jaw${L}2`, name: `tine${L}` });
    b.rod(jaw.at(0.3), [s * 0.012, 0.156, 0.082], 0.002, { color: JAW, bone: `jaw${L}1`, name: `tine${L}` });

    // The dewdrop clings to the tip of the left antler.
    if (s > 0)
      b.part(new THREE.SphereGeometry(0.0045, b.segments(10), b.segments(8)), DEW, {
        at: [0.034, 0.1555, 0.116],
        bone: "jawL2",
        group: "dew",
        name: "dew",
      });

    // Elbowed antenna with a feathery club.
    const ant = b.chain(
      `ant${L}`,
      [
        [s * 0.008, 0.15, 0.046],
        [s * 0.016, 0.162, 0.056],
        [s * 0.03, 0.158, 0.07],
        [s * 0.036, 0.146, 0.1],
      ],
      { parent: "head", names: [`ant${L}1`, `ant${L}2`, `ant${L}3`] },
    );
    b.sweep(ant, (t: number) => 0.0032 - 0.0016 * t, { color: ANTENNA, name: `antenna${L}` });
    const tip = [s * 0.036, 0.146, 0.1];
    const fan = [
      [0.012, 0.006, 0.006],
      [0.014, 0, 0.01],
      [0.012, -0.006, 0.008],
      [0.008, 0.005, 0.014],
      [0.006, -0.004, 0.015],
    ];
    for (const d of fan)
      b.rod(tip, [tip[0] + s * d[0], tip[1] + d[1], tip[2] + d[2]], 0.001, {
        color: FEATHER,
        bone: `ant${L}3`,
        name: "feather",
      });
  }

  // Six spiny legs gripping the bark: front, middle and hind pairs.
  const pairs: Array<[string, number, number]> = [
    ["f", 0.024, 0],
    ["m", -0.004, 0.003],
    ["h", -0.03, 0.006],
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (const [p, z, spread] of pairs) {
      const name = `${p}${L}`;
      const x = 0.05 + spread;
      const leg = b.chain(
        `leg${name}`,
        [
          [s * 0.012, BODY_Y - 0.004, z],
          [s * (0.03 + spread), 0.126, z + 0.006],
          [s * (0.042 + spread), 0.11, z + 0.002],
          [s * x, surfaceY(x) + 0.002, z - 0.004],
        ],
        { parent: "body", names: [`${name}1`, `${name}2`, `${name}3`], role: "leg" },
      );
      b.sweep(leg, (t: number) => 0.0042 - 0.0022 * t, { color: LEG, name: `leg${name}` });
      b.spike(leg.at(0.3), [s * 0.5, 0.6, -0.3], 0.006, 0.0012, { color: LEG, name: "spine" });
      b.spike(leg.at(0.62), [s * 0.6, 0.2, 0.5], 0.005, 0.001, { color: LEG, name: "spine" });
      b.rod(leg.at(1), [s * (x + 0.004), surfaceY(x) - 0.004, z - 0.006], 0.0011, {
        color: LEG,
        name: "claw",
      });
    }
  }

  // Materials: the wing cases and the dew catch the light like polished surfaces.
  const root = b.root;
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (mesh.userData.group === "elytra") {
      material.roughness = 0.14;
      material.metalness = 0.3;
    } else if (mesh.userData.group === "dew") {
      material.roughness = 0.04;
      material.metalness = 0;
    }
  });
  return root;
}
```