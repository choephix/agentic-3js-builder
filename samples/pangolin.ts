import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { countershade, paint } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Ground Pangolin",
  description:
    "A 90 cm ground pangolin in a four-footed rest pose: overlapping ridged chestnut keratin shields, a broad plated tail, cream belly, digging claws, hinged jaw and a long articulated pink tongue.",
  builtBy: "GPT-6 Astra",
};

const BROWN = "#68432d";
const SEAM = "#493023";
const CREAM = "#d6bd94";
const SKIN = "#ad8960";
const IVORY = "#e9d7b3";
const BLACK = "#201813";
const PINK = "#ce7880";
const bodyPaint = countershade(SEAM, CREAM, { level: -0.1, soft: 0.13 });
const platePaints = ["#8c603b", "#9d7047", "#795135", "#a2764c"].map((color) =>
  paint((_p, _n, uv) => {
    // Longitudinal keratin grooves and a worn light tip, painted rather than modelled.
    if (uv[1] > 0.91) return "#bf9565";
    if (uv[1] > 0.15 && Math.abs((uv[0] * 7) % 1 - 0.5) < 0.045) return BROWN;
    return color;
  }),
);

/** Six-sided shingle with a low central ridge; +Z is its pointed, overlapping edge. */
function shieldGeometry() {
  const rim = [
    [-0.36, -0.48], [-0.5, -0.1], [-0.36, 0.24],
    [0, 0.57], [0.36, 0.24], [0.5, -0.1], [0.36, -0.48],
  ];
  const positions: number[] = [];
  const uv: number[] = [];
  const emit = (x: number, y: number, z: number) => {
    positions.push(x, y, z);
    uv.push(x + 0.5, (z + 0.48) / 1.05);
  };
  for (let i = 0; i < rim.length; i++) {
    const a = rim[i];
    const c = rim[(i + 1) % rim.length];
    emit(0, 0.12, 0.01);
    emit(a[0], 0, a[1]);
    emit(c[0], 0, c[1]);
    emit(0, -0.025, 0);
    emit(c[0], 0, c[1]);
    emit(a[0], 0, a[1]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  return geometry;
}

export default function build() {
  const b = createBuilder({ name: "pangolin", paintSize: 1024 });
  const stations = [
    { at: [0, 0.064, -0.52], w: 0.014, h: 0.018 },
    { at: [0, 0.079, -0.45], w: 0.062, h: 0.037 },
    { at: [0, 0.106, -0.35], w: 0.117, h: 0.059 },
    { at: [0, 0.146, -0.25], w: 0.165, h: 0.105 },
    { at: [0, 0.195, -0.15], w: 0.207, h: 0.176 },
    { at: [0, 0.207, -0.05], w: 0.232, h: 0.203 },
    { at: [0, 0.213, 0.055], w: 0.207, h: 0.191 },
    { at: [0, 0.211, 0.14], w: 0.138, h: 0.126 },
    { at: [0, 0.199, 0.18], w: 0.103, h: 0.094 },
  ] as const;
  const bodyPath = catmull(stations.map((s) => s.at));
  const hipsT = bodyPath.knots[4];
  const hips = b.joint("hips", { at: stations[4].at, dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", bodyPath.slice(hipsT, 1), {
    parent: hips, count: 3, names: ["spine1", "chest", "neck"], role: "spine",
  });
  const tail = b.chain("tail", bodyPath.slice(hipsT, 0), { parent: hips, count: 5, role: "tail" });
  const head = b.joint("head", { parent: spine.joints[2], at: stations[8].at, dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.172, 0.214], dir: [0, -0.19, 1], role: "jaw" });
  const tongue = b.chain("tongue", catmull([
    [0, 0.157, 0.291], [0, 0.145, 0.353], [0, 0.134, 0.414], [0, 0.143, 0.465],
  ]), { parent: jaw, count: 3, role: "tentacle", group: "tongue" });

  type Foot = { chain: Chain; digits: Chain[]; front: boolean; side: number; end: THREE.Vector3 };
  const feet: Foot[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.108 : -0.137;
      const path = [
        [s * 0.077, 0.203, z],
        [s * 0.121, 0.104, z - (front ? 0.028 : 0.023)],
        [s * 0.128, 0.035, z + 0.01],
        [s * 0.128, 0.025, z + 0.049],
      ] as const;
      const chain = b.chain(`${front ? "foreleg" : "hindleg"}${side}`, path, {
        parent: front ? spine.joints[1] : hips,
        names: front ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg", contact: [s * 0.128, 0, z + 0.03], group: "legs",
      });
      const end = new THREE.Vector3(...path[3]);
      const digits: Chain[] = [];
      for (let d = -1; d <= 1; d++) {
        const length = (front ? 0.054 : 0.027) * (d === 0 ? 1.12 : 0.9);
        const base = end.clone().add(new THREE.Vector3(d * 0.02, -0.002, -0.008));
        digits.push(b.chain(`${front ? "finger" : "toe"}${side}${d + 2}`, [
          base,
          base.clone().add(new THREE.Vector3(d * 0.003, -0.002, length * 0.52)),
          base.clone().add(new THREE.Vector3(d * 0.006, -0.013, length)),
        ], { parent: chain.joints[2], count: 1, role: "digit", group: "claws" }));
      }
      feet.push({ chain, digits, front, side: s, end });
    }
  }

  // One continuous low-poly hide from the flattened tail tip into the shoulders.
  const body = b.loft(stations, { bone: [tail, hips, spine], color: bodyPaint, sides: 10, caps: "round", group: "body", name: "continuousHide" });
  const upper = b.loft([
    { at: [0, 0.2, 0.165], w: 0.107, h: 0.092 },
    { at: [0, 0.198, 0.22], w: 0.119, h: 0.084 },
    { at: [0, 0.178, 0.286], w: 0.071, h: 0.052 },
    { at: [0, 0.158, 0.357], w: 0.027, h: 0.024 },
  ], { bone: head, color: countershade(BROWN, CREAM, { level: -0.05, soft: 0.15 }), sides: 8, group: "head", name: "pointedUpperJaw" });
  b.loft([
    { at: [0, 0.165, 0.214], w: 0.075, h: 0.027 },
    { at: [0, 0.139, 0.291], w: 0.045, h: 0.022 },
    { at: [0, 0.138, 0.346], w: 0.021, h: 0.012 },
  ], { bone: jaw, color: CREAM, sectors: [[-65, 65, "#71423b"]], sides: 6, group: "jaw", name: "hingedLowerJaw" });
  b.sweep(tongue, (t) => [0.006 * (1 - t * 0.45), 0.0033 * (1 - t * 0.6)], {
    color: PINK, sides: 6, caps: "round", group: "tongue", name: "longTongue",
  });
  b.part(new THREE.IcosahedronGeometry(1, 0), BLACK, { bone: head, at: [0, 0.158, 0.365], scale: [0.015, 0.01, 0.008], group: "head", name: "nose" });
  const face = b.surface(upper);
  for (const s of [1, -1]) {
    const hit = face.around([0, 0.199, 0.226]).at(s * 80, 12);
    if (hit) {
      const eye = b.stick(new THREE.SphereGeometry(0.0085, 8, 5), BLACK, hit, { embed: 0.25, group: "head", name: `eye${s > 0 ? "L" : "R"}` });
      b.stick(new THREE.SphereGeometry(0.0021, 4, 3), IVORY, eye.moved([0.001, 0.007, 0.002]), { embed: 0.3, group: "head", name: "eyeGlint" });
    }
  }

  // Ordered, staggered rows of broad shingles make the real overlapping silhouette.
  const shield = shieldGeometry();
  const scalesOn = (tube: Sweep, t: number, width: number, length: number, columns: number, span: number, row: number, bone?: Joint) => {
    for (let j = 0; j < columns; j++) {
      const angle = -span + (2 * span * (j + (row % 2) * 0.22)) / (columns - 1);
      const point = tube.at(t, angle);
      b.stick(shield, platePaints[(row * 3 + j) % platePaints.length], point, {
        embed: 0.16, flow: [0, 0, -1], scale: [width, width, length], bone,
        group: "scales", name: "keratinShield",
      });
    }
  };
  // Rump to shoulders; each new row lies over the roots of the preceding row.
  for (let row = 0; row < 12; row++) {
    const z = -0.192 + row * 0.03;
    const t = bodyPath.closestT([0, 0.2, z]);
    const width = z > 0.1 ? 0.042 : 0.056;
    scalesOn(body, t, width, 0.065, 10, 111, row);
  }
  for (let row = 0; row < 11; row++) {
    const z = -0.5 + row * 0.027;
    const t = bodyPath.closestT([0, 0.1, z]);
    const taper = (z + 0.52) / 0.34;
    scalesOn(body, t, 0.015 + taper * 0.035, 0.033 + taper * 0.029, 5, 105, row);
  }
  for (let row = 0; row < 6; row++) {
    const t = 0.06 + row * 0.14;
    scalesOn(upper, t, 0.032 * (1 - t * 0.6), 0.038 * (1 - t * 0.45), 5, row < 2 ? 100 : 48, row, head);
  }

  for (const foot of feet) {
    const leg = b.sweep(foot.chain, [foot.front ? 0.037 : 0.043, 0.025, 0.022], {
      color: countershade(SKIN, CREAM, { soft: 0.25 }), sides: 8, group: "legs", name: "powerfulLeg",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
      bone: foot.chain.joints[2], at: foot.end.clone().add(new THREE.Vector3(0, 0, -0.016)),
      scale: [0.039, 0.025, 0.045], group: "feet", name: "groundedPalm",
    });
    for (const digit of foot.digits) b.sweep(digit, [0.009, 0.007, 0], {
      color: IVORY, sides: 5, caps: { start: "round", end: "point" }, group: "claws", name: "diggingClaw",
    });
    for (let row = 0; row < 3; row++) {
      const hit = leg.at(0.16 + row * 0.19, foot.side > 0 ? -85 : 85);
      b.stick(shield, platePaints[row], hit, { embed: 0.18, flow: [0, -1, 0], scale: [0.038, 0.03, 0.047], group: "scales", name: "limbShield" });
    }
  }
  return b.root;
}
