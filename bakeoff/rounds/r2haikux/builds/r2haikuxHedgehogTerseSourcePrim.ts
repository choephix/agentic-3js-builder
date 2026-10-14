import * as THREE from "three";
import { countershade, createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description:
    "A stylised hedgehog on four short legs: a back bristling with banded quills, a cream face and belly, a dark crown, pink ears and a jaw that opens.",
};

// Palette: a chocolate coat, cream face and belly, banded quills, dark legs and small features.
const COAT = "#4a2b1a";
const BELLY = "#efdfbd";
const LEG = "#3a2416";
const EYE = "#150d08";
const SHINE = "#ffffff";
const NOSE = "#1e120b";
const MOUTH = "#2e1b10";
const EAR = "#c98a74";
const QUILL_LIGHT: readonly [string, string, string] = ["#f4e9d2", "#5b3820", "#f4e9d2"];
const QUILL_COPPER: readonly [string, string, string] = ["#ecc793", "#a35229", "#ecc793"];

/** Three colour bands along a quill: pale base, dark middle, pale tip. */
const banded = (c: readonly [string, string, string]) => [[0.34, c[0]], [0.7, c[1]], [1, c[2]]] as const;

/** Body half-width and half-height at source t: fattest mid-body, rounded at both ends. */
const bulge = (t: number) => Math.sin(Math.PI * (0.1 + 0.8 * Math.min(Math.max(t, 0), 1)));
const bodyRadius = (t: number): [number, number] => [0.03 + 0.022 * bulge(t), 0.028 + 0.016 * bulge(t)];

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", detail: 1, paintSize: 2048 });
  const random = rng(7);

  // Skeleton: hips (root), a spine chain (spine1, spine2, neck), head, lower jaw, tail stub, four legs.
  b.joint("hips", { at: [0, 0.08, -0.06] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.08, -0.06],
      [0, 0.08, -0.01],
      [0, 0.08, 0.04],
    ],
    { parent: "hips", names: ["spine1", "spine2", "neck"], role: "spine" },
  );
  b.joint("head", { parent: "neck", at: [0, 0.09, 0.085], aim: [0, 0.095, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.0715, 0.112], aim: [0, 0.0655, 0.168], role: "jaw" });
  const tail = b.joint("tail", { parent: "hips", at: [0, 0.082, -0.088], dir: [0, 0, -1], role: "tail" });

  // Body: one tube along the spine chain, dark on top and cream underneath.
  const body = b.sweep(spine, bodyRadius, {
    sides: 10,
    color: countershade(COAT, BELLY, { level: -0.25, soft: 0.3 }),
    group: "body",
  });

  // Legs: a short tube along each leg chain, with a flattened paw on each foot.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hind = b.chain(
      `hind${side}`,
      [
        [s * 0.034, 0.068, -0.05],
        [s * 0.04, 0.03, -0.042],
        [s * 0.04, 0.01, -0.035],
      ],
      {
        parent: "hips",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.04, 0, -0.035],
      },
    );
    const fore = b.chain(
      `fore${side}`,
      [
        [s * 0.036, 0.068, 0.02],
        [s * 0.04, 0.03, 0.03],
        [s * 0.04, 0.01, 0.045],
      ],
      {
        parent: "spine2",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "leg",
        contact: [s * 0.04, 0, 0.045],
      },
    );
    for (const leg of [hind, fore]) {
      b.sweep(leg, [0.0145, 0.0115, 0.009], { color: LEG, group: "leg" });
      b.part(new THREE.SphereGeometry(0.0165, b.segments(8), b.segments(6)), LEG, {
        at: leg.joints[2],
        scale: [1.2, 0.62, 1.3],
        group: "paw",
      });
    }
  }

  // Head: a painted sphere, dark crown and cream face, with a tapered snout and a small dark nose.
  const skull = b.part(
    new THREE.SphereGeometry(0.04, b.segments(14), b.segments(10)),
    countershade(COAT, BELLY, { level: 0.45, soft: 0.3 }),
    { at: [0, 0.09, 0.085], bone: "head", group: "head" },
  );
  b.capsule([0, 0.088, 0.122], [0, 0.077, 0.176], [0.022, 0.0075], { color: BELLY, bone: "head", group: "head" });
  b.part(new THREE.SphereGeometry(0.0095, 12, 9), NOSE, {
    at: [0, 0.0775, 0.1775],
    bone: "head",
    scale: [1.3, 0.85, 0.9],
    group: "head",
  });

  // Lower jaw on its own joint, so the mouth can open.
  b.capsule(jaw, [0, 0.0655, 0.168], [0.0095, 0.0055], { color: MOUTH, bone: "jaw", group: "jaw" });

  // Eyes with a catch-light, and rounded ears, mirrored either side.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0075, 10, 8), EYE, {
      at: [s * 0.023, 0.109, 0.1124],
      bone: "head",
      group: "eye",
    });
    b.part(new THREE.SphereGeometry(0.0025, 6, 5), SHINE, {
      at: [s * 0.0268, 0.1122, 0.117],
      bone: "head",
      group: "eye",
    });
    b.part(new THREE.SphereGeometry(0.0135, 10, 8), EAR, {
      at: [s * 0.0303, 0.116, 0.0915],
      bone: "head",
      scale: [0.42, 1, 1],
      group: "ear",
    });
  }

  // Tail: a small stub at the rump.
  b.capsule(tail, [0, 0.08, -0.1], [0.0068, 0.0045], { color: COAT, bone: "tail", group: "tail" });

  // Quills: scattered over the back and flanks, leaning back, banded in two palettes.
  for (const hit of b.surface(body).scatter(230, {
    rng: random,
    minDist: 0.0095,
    filter: (h) => h.n.y > -0.25 && h.at.z > -0.088 && h.at.z < 0.02,
  })) {
    const dir = hit.n.add(new THREE.Vector3((random() - 0.5) * 0.3, 0, -(0.5 + 0.3 * random()))).normalize();
    const length = 0.026 + 0.014 * random();
    const palette = random() < 0.22 ? QUILL_COPPER : QUILL_LIGHT;
    b.spike(hit.moved([0, -0.0025, 0]), dir, length, 0.0038, {
      sides: 6,
      bands: banded(palette),
      group: "quills",
    });
  }

  // A few short quills on the crown, pointing forward.
  for (const hit of b.surface(skull).scatter(10, {
    rng: random,
    minDist: 0.016,
    filter: (h) => h.n.y > 0.7,
  })) {
    const dir = hit.n.add(new THREE.Vector3(0, 0, 0.35)).normalize();
    b.spike(hit.moved([0, -0.002, 0]), dir, 0.014, 0.0026, {
      sides: 6,
      bands: banded(QUILL_LIGHT),
      group: "crown",
    });
  }

  return b.root;
}
