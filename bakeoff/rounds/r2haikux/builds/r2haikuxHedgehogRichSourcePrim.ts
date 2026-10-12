import * as THREE from "three";
import { createBuilder, mottle, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Autumn hedgehog",
  description:
    "A plump hedgehog on an autumn evening walk: a dome of chestnut spines with cream tips, a soft fawn face and a twitchy pointed snout, and a red maple leaf stuck on its back.",
};

const SPINE_SHADES = ["#7a3f23", "#8c4b29", "#a05a31"];
const SPINE_TIP = "#f3e6c8";
const BODY = "#4a2d1e";
const LEG = "#4a3024";
const SNOUT = "#dfb985";
const JAW = "#d1a06c";
const EAR = "#c4875a";
const EAR_INNER = "#f0a3a6";
const PAW = "#f2a1ad";
const EYE = "#120c09";
const SHINE = "#ffffff";
const NOSE = "#1a1311";
const STEM = "#6a3c1e";

const UP = new THREE.Vector3(0, 1, 0);
const BACK = new THREE.Vector3(0, 0, -1);
const ONE = new THREE.Vector3(1, 1, 1);

// Maple leaf outline, unit size: stem at the bottom, the tall lobe at the top, side lobes in pairs.
const MAPLE: Array<[number, number]> = [
  [0, -0.6],
  [0.07, -0.38],
  [0.36, -0.46],
  [0.22, -0.2],
  [0.6, -0.14],
  [0.38, 0.06],
  [0.46, 0.3],
  [0.14, 0.22],
  [0, 0.66],
  [-0.14, 0.22],
  [-0.46, 0.3],
  [-0.38, 0.06],
  [-0.6, -0.14],
  [-0.22, -0.2],
  [-0.36, -0.46],
  [-0.07, -0.38],
];

/** Several geometries as one non-indexed geometry, in the space they already sit in. */
function merge(list: THREE.BufferGeometry[]) {
  const flat = list.map((g) => g.toNonIndexed());
  const count = flat.reduce((sum, g) => sum + g.getAttribute("position").count, 0);
  const out = new Float32Array(count * 3);
  let offset = 0;
  for (const g of flat) {
    const array = g.getAttribute("position").array as Float32Array;
    out.set(array, offset);
    offset += array.length;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  return geometry;
}

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", detail: 1, paintSize: 1024 });

  const FACE = mottle("#d9ab72", "#ecd0a2", { size: 0.05, contrast: 0.8 });
  const LEAF = paint((_p, _n, s) => {
    if (Math.abs(s[0]) < 0.0032 && s[1] > -0.03 && s[1] < 0.04) return "#f2c66d";
    return s[1] > 0 ? "#b5271a" : "#d4422a";
  });

  // Skeleton: the body is the root; head and jaw hang from it; four short legs carry it.
  const body = b.joint("body", { at: [0, 0.1, 0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.072, 0.15], role: "jaw" });

  const legs: Array<[string, number[][], string[]]> = [
    [
      "legFL",
      [
        [0.05, 0.085, 0.045],
        [0.053, 0.046, 0.052],
        [0.054, 0.02, 0.062],
      ],
      ["shoulderL", "elbowL", "wristL"],
    ],
    [
      "legFR",
      [
        [-0.05, 0.085, 0.045],
        [-0.053, 0.046, 0.052],
        [-0.054, 0.02, 0.062],
      ],
      ["shoulderR", "elbowR", "wristR"],
    ],
    [
      "legHL",
      [
        [0.056, 0.088, -0.05],
        [0.06, 0.045, -0.058],
        [0.061, 0.02, -0.05],
      ],
      ["hipL", "kneeL", "ankleL"],
    ],
    [
      "legHR",
      [
        [-0.056, 0.088, -0.05],
        [-0.06, 0.045, -0.058],
        [-0.061, 0.02, -0.05],
      ],
      ["hipR", "kneeR", "ankleR"],
    ],
  ];
  for (const [name, points, names] of legs) {
    b.sweep(b.chain(name, points, { parent: body, names, role: "leg" }), 0.0165, { color: LEG });
  }

  // Body: a squat plump dome, dark skin under the spines.
  const bodyPart = b.part(new THREE.SphereGeometry(1, 20, 14), BODY, {
    at: [0, 0.1, 0],
    scale: [0.072, 0.062, 0.088],
    bone: body,
    name: "body",
  });

  // Face: fawn head with a tapering snout, nose, eyes, ears and a jaw that can open.
  b.part(new THREE.SphereGeometry(1, 20, 14), FACE, {
    at: [0, 0.1, 0.12],
    scale: [0.058, 0.054, 0.061],
    bone: head,
    name: "face",
  });
  b.rod([0, 0.098, 0.13], [0, 0.089, 0.216], [0.032, 0.011], { color: SNOUT, bone: head, name: "snout" });
  b.part(new THREE.SphereGeometry(1, 12, 9), NOSE, {
    at: [0, 0.089, 0.219],
    scale: [0.0135, 0.0115, 0.0125],
    bone: head,
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), SHINE, {
    at: [0.0045, 0.0975, 0.2265],
    scale: 0.0028,
    bone: head,
    name: "nose.glint",
  });
  b.rod([0, 0.072, 0.15], [0, 0.075, 0.205], [0.016, 0.0065], { color: JAW, bone: jaw, name: "jaw.lower" });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 9), EYE, {
      at: [0.0415 * s, 0.109, 0.1615],
      scale: 0.011,
      bone: head,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), SHINE, {
      at: [0.0474 * s, 0.1138, 0.1674],
      scale: 0.0032,
      bone: head,
      name: "eye.glint",
    });
  }

  for (const s of [1, -1]) {
    const at = [0.0423 * s, 0.1338, 0.1031];
    const dir = [0.769 * s, 0.615, -0.308];
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.004, 12), EAR, { at, dir, bone: head, name: "ear" });
    b.part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.0045, 10), EAR_INNER, {
      at: [0.044 * s, 0.1352, 0.1025],
      dir,
      bone: head,
      name: "ear.inner",
    });
  }

  // Little pink paws with three toes each.
  const paw = (x: number, z: number, bone: string) => {
    b.part(new THREE.SphereGeometry(1, 14, 10), PAW, {
      at: [x, 0.013, z],
      scale: [0.021, 0.013, 0.025],
      bone,
      name: "paw",
    });
    for (const dx of [-0.0085, 0, 0.0085]) {
      b.part(new THREE.SphereGeometry(1, 8, 6), PAW, {
        at: [x + dx, 0.0062, z + 0.019],
        scale: 0.0068,
        bone,
        name: "toe",
      });
    }
  };
  paw(0.054, 0.07, "wristL");
  paw(-0.054, 0.07, "wristR");
  paw(0.061, -0.04, "ankleL");
  paw(-0.061, -0.04, "ankleR");

  // Spines: a few hundred cones scattered over the back and flanks, leaning back, with cream tips.
  const hits = b.surface(bodyPart).scatter(210, {
    rng: rng(7),
    minDist: 0.0118,
    filter: (hit) => hit.at.y > 0.09 && hit.at.z < 0.045,
  });
  const spin = rng(11);
  const R = 0.0042;
  const shafts: THREE.BufferGeometry[][] = SPINE_SHADES.map(() => []);
  const tips: THREE.BufferGeometry[] = [];
  for (const hit of hits) {
    const normal = hit.n;
    const dir = normal
      .addScaledVector(BACK, 0.4 + 0.3 * spin())
      .add(new THREE.Vector3((spin() - 0.5) * 0.3, (spin() - 0.5) * 0.3, (spin() - 0.5) * 0.3))
      .normalize();
    const len = 0.026 + 0.012 * spin();
    const shade = Math.floor(spin() * SPINE_SHADES.length);
    const align = new THREE.Quaternion().setFromUnitVectors(UP, dir);
    const roll = new THREE.Quaternion().setFromAxisAngle(UP, spin() * Math.PI * 2);
    const base = hit.at.addScaledVector(dir, -0.005);
    const m = new THREE.Matrix4().compose(base, align.multiply(roll), ONE);
    shafts[shade].push(
      new THREE.CylinderGeometry(0.3 * R, R, 0.7 * len, 5, 1, false).translate(0, 0.35 * len, 0).applyMatrix4(m),
    );
    tips.push(new THREE.ConeGeometry(0.3 * R, 0.3 * len, 5, 1, false).translate(0, 0.85 * len, 0).applyMatrix4(m));
  }
  SPINE_SHADES.forEach((shade, i) => {
    if (shafts[i].length) b.part(merge(shafts[i]), shade, { at: [0, 0, 0], bone: body, flat: true, name: "spines" });
  });
  if (tips.length) b.part(merge(tips), SPINE_TIP, { at: [0, 0, 0], bone: body, flat: true, name: "spine.tips" });

  // The maple leaf, perched on the spines on the back, its stem pushed down among them.
  const n = new THREE.Vector3(0.2, 0.974, -0.1).normalize();
  const perch = new THREE.Vector3(0.0166, 0.1597, -0.0124); // a point on the dome under the leaf
  const S = 0.075;
  const tilt = new THREE.Vector3(0.25, 0, -1);
  const up = tilt.clone().addScaledVector(n, -tilt.dot(n)).normalize();
  const across = new THREE.Vector3().crossVectors(up, n).normalize();
  const leaf = b.extrude(
    MAPLE.map(([x, y]) => [x * S, y * S]),
    {
      name: "maple leaf",
      color: LEAF,
      at: perch.clone().addScaledVector(n, 0.03).toArray(),
      x: across.toArray(),
      y: up.toArray(),
      thickness: 0.0045,
      bevel: 0.0015,
      bone: "body",
    },
  );
  const stemTop = leaf.local([0, -0.6 * S, 0]);
  b.rod(stemTop, stemTop.clone().addScaledVector(n, -0.08), 0.0026, {
    color: STEM,
    bone: "body",
    name: "leaf.stem",
  });

  // A twitch: the snout up a little, the mouth just ajar.
  b.pose(head, { axis: [1, 0, 0], deg: -7 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
