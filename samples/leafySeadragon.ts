import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { OutlinePoint } from "../src/outline";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Leafy Seadragon",
  description: "An 80 cm olive-and-gold leafy seadragon suspended above a slate reef: articulated ringed body, curling tail, tubular snout, small hinged jaw, veined leafy lobes and gauzy fins.",
  builtBy: "GPT-6 Astra",
};

const GOLD = "#b6aa45";
const PALE = "#e0cb76";
const OLIVE = "#6c7938";
const LEAF = "#a9ad43";
const INK = "#182b2b";
const ROCK = "#435665";
const KELP = "#346b61";

// A broad ragged lance rather than a botanical oval: leafy seadragon appendages are lobed camouflage, not fins.
const leafOutline: OutlinePoint[] = [
  [0, 0], [0.1, 0.25], [0.32, 0.38], [0.18, 0.48], [0.34, 0.65],
  [0.19, 0.73], [0.13, 0.9], [0, 1, "sharp"], [-0.12, 0.84],
  [-0.28, 0.74], [-0.19, 0.58], [-0.3, 0.44], [-0.1, 0.28],
];

export default function build() {
  const b = createBuilder({ name: "leafySeadragon", detail: 0.7 });
  const random = rng(711);
  const pedestal = b.joint("reefRoot", { at: [0, 0, 0], group: "reef" });
  const hips = b.joint("hips", { parent: pedestal, at: [0, 0.38, -0.1], role: "spine", group: "body" });
  const bodyPath = catmull([
    hips, [0, 0.405, -0.03], [0, 0.44, 0.04], [0, 0.515, 0.075],
    [0, 0.58, 0.11], [0, 0.59, 0.17],
  ]);
  const spine = b.chain("body", bodyPath, {
    parent: hips, count: 5, names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine", group: "body",
  });
  const tailPath = catmull([
    hips, [0, 0.33, -0.2], [0, 0.245, -0.3], [0, 0.22, -0.365],
    [0, 0.26, -0.4], [0, 0.31, -0.375], [0, 0.31, -0.33],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 8, role: "tail", group: "tail" });
  const head = b.joint("head", { parent: spine.joints[4], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head", group: "head" });
  const H = b.region({ at: head, bone: head });
  const snout = b.joint("snout", { parent: head, at: H.p([0, -0.008, 0.038]), dir: [0, -0.12, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: snout, at: H.p([0, -0.034, 0.125]), dir: [0, -0.12, 1], role: "jaw", group: "head" });

  const curve = tailPath.slice(1, 0).concat(bodyPath);
  const split = tailPath.length / curve.length;
  const ringPaint = paint((_p, _n, s) => {
    const ring = (s[0] * 31) % 1;
    if (ring < 0.11) return OLIVE;
    if (ring < 0.22) return PALE;
    return Math.abs(s[1]) < 70 ? GOLD : "#bbaa55";
  });
  const body = b.sweep(curve, (t) => {
    if (t < split) return 0.003 + 0.025 * Math.pow(t / split, 1.35);
    const q = (t - split) / (1 - split);
    return 0.028 + Math.sin(q * Math.PI * 1.4) * 0.012;
  }, {
    bone: [tail, hips, spine], color: ringPaint, sides: 8, smooth: false,
    caps: "round", group: "body", name: "armoredRingedBody",
  });

  b.loft([
    { at: H.p([0, 0, -0.013]), w: 0.049, h: 0.054 },
    { at: H.p([0, 0.004, 0.025]), w: 0.061, h: 0.062 },
    { at: H.p([0, -0.01, 0.052]), w: 0.027, h: 0.033 },
  ], { bone: head, color: GOLD, sides: 8, smooth: false, name: "angularSkull", group: "head" });
  b.sweep([snout, H.p([0, -0.025, 0.172])], [0.0125, 0.009], {
    bone: snout, color: PALE, sides: 8, smooth: false, caps: "flat", name: "tubularSnout", group: "head",
  });
  b.sweep([jaw, H.p([0, -0.039, 0.173])], [0.0065, 0.005], {
    bone: jaw, color: GOLD, sides: 6, caps: "round", name: "smallLowerJaw", group: "head",
  });
  b.part(new THREE.CircleGeometry(0.0065, 8), INK, {
    bone: snout, at: H.p([0, -0.025, 0.1725]), dir: [0, -0.12, 1], axis: "z", name: "mouthOpening", group: "head",
  });
  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";
    const eye = b.part(new THREE.SphereGeometry(1, 8, 6), PALE, {
      bone: head, at: H.p([s * 0.027, 0.015, 0.026]), scale: [0.011, 0.013, 0.013], name: `eyeSocket${side}`, group: "head",
    });
    const eyeSurface = b.surface(eye).around(eye.at).at(s * 75, 8)!;
    b.stick(new THREE.SphereGeometry(0.0085, 8, 6), INK, eyeSurface, { embed: 0.45, name: `eye${side}`, group: "head" });
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), "#f4ecd2", {
      bone: head, at: H.p([s * 0.04, 0.019, 0.033]), name: `eyeGlint${side}`, group: "head",
    });
  }

  // Surface points carry the exact chain weights. All stalks, blades and veins ride their owning vertebra.
  const leafPaint = paint((_p, _n, uv) => {
    const x = uv[0], y = uv[1];
    if (Math.abs(x) < 0.0013) return PALE;
    if (Math.abs((y - Math.abs(x) * 0.8) % 0.016) < 0.0016) return OLIVE;
    return x > 0 ? LEAF : GOLD;
  });
  const growLeaf = (root: Frame, dir: THREE.Vector3, length: number, label: string) => {
    const d = dir.clone().normalize();
    const stemLength = length * 0.33;
    const base = root.at;
    const stalkEnd = base.clone().addScaledVector(d, stemLength);
    b.sweep(bezier(root, base.clone().addScaledVector(d, stemLength * 0.5), stalkEnd), [0.0038, 0.0022], {
      bone: root.bone ?? hips,
      color: OLIVE,
      sides: 5,
      caps: "flat",
      name: `${label}Stem`,
      group: "leaves",
    });
    const across = new THREE.Vector3(0.35, 0, 1).cross(d).normalize();
    const bladeLength = length * 0.75;
    const blade: OutlinePoint[] = leafOutline.map(([x, y, sharp]) =>
      sharp ? [x * bladeLength, y * bladeLength, sharp] : [x * bladeLength, y * bladeLength],
    );
    b.extrude(blade, {
      at: stalkEnd,
      x: across,
      y: d,
      thickness: 0.0025,
      smoothing: 0,
      color: leafPaint,
      bone: root.bone ?? hips,
      name: `${label}Blade`,
      group: "leaves",
    });
  };
  // Dorsal and ventral sprigs alternate, leaving the gold central silhouette readable in the side view.
  for (let i = 0; i < 12; i++) {
    const t = 0.18 + i * 0.067;
    for (const s of [-1, 1]) {
      const angle = s * (i % 2 ? 125 : 48);
      const hit = body.at(t, angle);
      const direction = hit.n.clone().add(new THREE.Vector3(s * 0.25, i % 2 ? -0.3 : 0.3, -0.3));
      const length = (0.07 + 0.055 * Math.sin(t * Math.PI)) * (0.85 + 0.2 * random());
      growLeaf(frame(hit, direction), direction, length, `leaf${i + 1}${s > 0 ? "L" : "R"}`);
    }
  }
  for (const s of [-1, 1]) {
    const crown = frame(head.moved([s * 0.014, -0.002, 0.028]), [s * 0.35, 1, -0.2]);
    growLeaf(crown, new THREE.Vector3(s * 0.35, 1, -0.2), 0.13, `crown${s > 0 ? "L" : "R"}`);
  }

  // Open gauze pixels and bright fin rays preserve the transparent-looking silhouette in the baked atlas.
  const finTexture = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><pattern id="mesh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#b4d5b9"/></pattern></defs>
    <path d="M50 98 L8 48 Q0 20 15 13 Q50 -6 85 13 Q100 20 92 48 Z" fill="url(#mesh)" stroke="#dfedce" stroke-width="2"/>
    <g stroke="#b5d5b6" stroke-width="1.7" fill="none"><path d="M50 98 L12 30 M50 98 L25 15 M50 98 L40 8 M50 98 L55 7 M50 98 L70 11 M50 98 L85 24 M50 98 L93 42"/></g>
  </svg>`, { size: 256 });
  for (const s of [-1, 1]) {
    const on = body.at(split + (1 - split) * 0.38, s * 90);
    b.cards([frame(on, [s * 0.6, 0.7, -0.2])], finTexture, {
      size: [0.065, 0.08], flow: [0, 0, 1], sink: 0.05, name: `pectoralFin${s > 0 ? "L" : "R"}`, group: "fins",
    });
  }
  const dorsal = body.at(split * 0.92, 0);
  b.cards([frame(dorsal, [0, 1, -0.3])], finTexture, { size: [0.085, 0.067], flow: [1, 0, 0], sink: 0.1, name: "dorsalFin", group: "fins" });

  // A modest slate reef grounds the floating creature; a curved kelp-coloured support nestles beneath its belly.
  b.part(new THREE.CylinderGeometry(0.18, 0.205, 0.055, 9), ROCK, {
    bone: pedestal, at: [0, 0.0275, -0.07], scale: [1, 1, 1.4], name: "slateReef", group: "reef",
  });
  b.part(new THREE.DodecahedronGeometry(1, 0), "#71818a", {
    bone: pedestal, at: [-0.055, 0.077, -0.13], scale: [0.12, 0.064, 0.15], name: "reefCrown", group: "reef",
  });
  b.sweep(bezier([0, 0.09, -0.09], [0.018, 0.25, -0.15], hips), [0.014, 0.009], {
    bone: pedestal, color: KELP, sides: 6, name: "kelpDisplaySupport", group: "reef",
  });
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI * 2 / 6;
    const p = new THREE.Vector3(Math.cos(angle) * 0.14, 0.055, -0.07 + Math.sin(angle) * 0.18);
    const dir = new THREE.Vector3(Math.cos(angle) * 0.3, 1, Math.sin(angle) * 0.25);
    const end = p.clone().addScaledVector(dir, 0.12 + (i % 3) * 0.04);
    const weed = b.sweep(bezier(p, p.clone().lerp(end, 0.5).add(new THREE.Vector3(0.023, 0, 0)), end), [0.007, 0.001], {
      bone: pedestal, color: KELP, sides: 5, name: `kelp${i}`, group: "reef",
    });
    for (const s of [-1, 1]) {
      const blade = weed.at(0.48, s * 90);
      b.extrude([[0, 0], [0.018, 0.024], [0.007, 0.062, "sharp"], [-0.008, 0.029]], {
        at: blade, x: [0, 0, 1], y: [s * 0.7, 1, 0], thickness: 0.002, color: "#4c8971", bone: pedestal, name: `kelpBlade${i}${s}`, group: "reef",
      });
    }
  }
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4;
    b.part(new THREE.DodecahedronGeometry(0.016 + random() * 0.006, 0), i % 2 ? "#819995" : "#596e75", {
      bone: pedestal, at: [Math.cos(a) * 0.13, 0.059, -0.07 + Math.sin(a) * 0.18], scale: [1, 0.6, 1], name: `reefPebble${i}`, group: "reef",
    });
  }
  return b.root;
}
