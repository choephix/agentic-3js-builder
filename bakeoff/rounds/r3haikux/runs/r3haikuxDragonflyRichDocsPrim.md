```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, noise, paint, polyline } from "agentic-3js-builder";

export const meta = {
  name: "emperor-dragonfly",
  description:
    "An emperor dragonfly hovering over a pond: electric-blue abdomen with black markings, apple-green thorax, turquoise compound eyes and four veined glassy wings.",
};

// Palette
const BLUE = "#1c7cff";
const PALE = "#a9d6ff";
const BLACK = "#0c0e12";
const GREEN = "#8fcf3f";
const TURQ = "#21c9b8";
const TURQ_LIGHT = "#72ecdc";
const TURQ_DEEP = "#0b7a76";
const GLASS = "#e6f6ff";
const SHEEN = "#f3dc9e";
const VEIN = "#2e261c";
const STIGMA = "#5a3a1c";
const LEG = "#17191f";
const WATER = "#1d5b5f";
const RIPPLE = "#8fd6d2";
const PAD = "#5fa93d";

const Y0 = 0.22; // hover height of the thorax above the pond (pond surface is y = 0)

const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

// Wing outlines in metres: x runs out along the span, y runs forward along the chord.
const FORE: [number, number][] = [
  [0.0, 0.003],
  [0.012, 0.0043],
  [0.026, 0.0046],
  [0.038, 0.0037],
  [0.046, 0.001],
  [0.041, -0.0014],
  [0.026, -0.0027],
  [0.012, -0.0027],
  [0.0, -0.0016],
];
const HIND: [number, number][] = [
  [0.0, 0.0056],
  [0.014, 0.0074],
  [0.028, 0.0064],
  [0.04, 0.0034],
  [0.045, 0.0004],
  [0.037, -0.004],
  [0.022, -0.0053],
  [0.008, -0.0046],
  [0.0, -0.002],
];

// Paints
const thoraxPaint = paint((p, n) => {
  const dy = p.y - Y0;
  if (Math.abs(n.x) > 0.4) {
    if (Math.abs(dy - 0.001 + 0.8 * p.z) < 0.0013) return BLACK;
    if (Math.abs(dy + 0.0045 + 0.8 * p.z) < 0.001) return BLACK;
  }
  return GREEN;
});

const eyePaint = paint((p, n) => {
  if (n.z < -0.75) return TURQ_DEEP;
  const c = cells(p, 0.0042, 11);
  if (c.d2 - c.d1 < 0.0004) return TURQ_DEEP; // facet seams
  return noise(p, 0.02, 4) > 0.55 ? TURQ_LIGHT : TURQ;
});

const abdomenPaint = paint((_p, _n, s) => {
  const [t, deg] = s;
  const side = Math.abs(wrap(deg)); // 0 = top of the abdomen, 180 = underside
  if (t > 0.93) return BLACK; // dark tip
  if (side > 150) return PALE; // pale underside
  if (side < 20 && t > 0.03) return BLACK; // dorsal stripe
  if (t > 0.2 && (t * 9) % 1 < 0.16) return BLACK; // segment bands
  return BLUE;
});

const wingSkin = paint((_p, _n, s) => {
  const [x, y] = s;
  if (x > 0.032 && x < 0.04 && y > 0.0024 && y < 0.0032) return STIGMA; // pterostigma
  if (Math.abs(y - 0.003) < 0.00018 || Math.abs(y + 0.0012) < 0.00018) return VEIN; // longitudinal veins
  const v = new THREE.Vector3(x, y, 0);
  const c = cells(v, 0.0028, 5);
  if (c.d2 - c.d1 < 0.0004) return VEIN; // the fine net
  return noise(v, 0.012, 9) > 0.58 ? SHEEN : GLASS; // faint golden sheen patches
});

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });

  // ---- skeleton ------------------------------------------------------
  const thorax = b.joint("thorax", { at: [0, Y0, 0], dir: [0, 0, 1], role: "spine" });
  const H: [number, number, number] = [0, Y0 + 0.002, 0.024];
  const head = b.joint("head", { parent: thorax, at: H, dir: [0, 0, 1], role: "head" });

  // Abdomen: a long slim chain from the rear of the thorax, drooping a little toward the tip.
  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, Y0 + 0.0005, -0.01],
      [0, Y0 - 0.0005, -0.022],
      [0, Y0 - 0.0018, -0.04],
      [0, Y0 - 0.0028, -0.058],
      [0, Y0 - 0.0035, -0.07],
    ]),
    { parent: thorax, role: "tail", count: 6 },
  );

  // ---- wings: flat, wide, held out to each side ---------------------
  const WINGS = [
    { id: "FL", side: 1, at: [0.002, Y0 + 0.0085, 0.004], outline: FORE },
    { id: "FR", side: -1, at: [-0.002, Y0 + 0.0085, 0.004], outline: FORE },
    { id: "HL", side: 1, at: [0.002, Y0 + 0.0085, -0.006], outline: HIND },
    { id: "HR", side: -1, at: [-0.002, Y0 + 0.0085, -0.006], outline: HIND },
  ];
  for (const w of WINGS) {
    const joint = b.joint(`wing${w.id}`, { parent: thorax, at: w.at, role: "wing" });
    b.extrude(w.outline, {
      at: w.at,
      x: [w.side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0007,
      bevel: 0.00025,
      smoothing: 2,
      color: wingSkin,
      bone: joint,
      name: `wing${w.id}`,
    });
  }

  // ---- thorax: a squat apple-green ellipsoid -------------------------
  const thoraxGeo = new THREE.SphereGeometry(1, 14, 10).scale(0.0105, 0.0095, 0.0135);
  b.part(thoraxGeo, thoraxPaint, { bone: thorax, at: [0, Y0, 0], flat: true, name: "thorax" });

  // ---- head: two huge turquoise eyes meeting over the top ------------
  b.part(new THREE.SphereGeometry(0.017, 18, 12), eyePaint, { bone: head, at: H, name: "eyes" });
  for (const o of [
    [0, 0.0152, 0.0056],
    [0.0042, 0.0145, 0.0048],
    [-0.0042, 0.0145, 0.0048],
  ]) {
    b.part(new THREE.SphereGeometry(0.0024, 8, 6), BLACK, {
      bone: head,
      at: [H[0] + o[0], H[1] + o[1], H[2] + o[2]],
      name: "ocellus",
    });
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.0035, H[1] + 0.013, H[2] + 0.01], [s * 0.45, 0.5, 1], 0.0105, 0.001, {
      color: BLACK,
      bone: head,
      name: "antenna",
    });
  }

  // ---- abdomen: blue, black dorsal line and segment bands -------------
  b.sweep(abdomen, [0.003, 0.0042, 0.0046, 0.004, 0.0034, 0.0028, 0.0022], {
    color: abdomenPaint,
    name: "abdomen",
  });
  const tip = abdomen.joints[abdomen.joints.length - 1];
  for (const s of [1, -1]) {
    b.spike([s * 0.0016, Y0 - 0.0035, -0.07], [s * 0.35, -0.12, -1], 0.012, 0.0012, {
      color: BLACK,
      bone: tip,
      name: "cercus",
    });
  }

  // ---- legs: six thin black legs tucked under the body ---------------
  const leg = (side: number, id: string, pts: number[][]) => {
    const chain = b.chain(`leg${id}`, polyline(pts.map(([x, y, z]) => [side * x, y, z])), {
      parent: thorax,
      role: "leg",
      names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
    });
    b.sweep(chain, [0.0017, 0.0014, 0.001, 0.0007], { color: LEG, name: `leg${id}` });
  };
  const FRONT = [
    [0.0055, Y0 - 0.0045, 0.004],
    [0.0125, Y0 - 0.0115, 0.0175],
    [0.0095, Y0 - 0.017, 0.0315],
    [0.0035, Y0 - 0.0135, 0.044],
  ];
  const MID = [
    [0.006, Y0 - 0.0055, -0.002],
    [0.0175, Y0 - 0.0125, -0.0035],
    [0.0185, Y0 - 0.0185, -0.0125],
    [0.008, Y0 - 0.0195, -0.017],
  ];
  const HINDLEG = [
    [0.0055, Y0 - 0.006, -0.012],
    [0.017, Y0 - 0.013, -0.0145],
    [0.015, Y0 - 0.019, -0.0235],
    [0.006, Y0 - 0.0195, -0.0265],
  ];
  leg(1, "FL", FRONT);
  leg(-1, "FR", FRONT);
  leg(1, "ML", MID);
  leg(-1, "MR", MID);
  leg(1, "HL", HINDLEG);
  leg(-1, "HR", HINDLEG);

  // ---- pond below the hovering insect (scenery) ----------------------
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.002, 40), WATER, {
    bone: thorax,
    at: [0, -0.001, 0],
    name: "pond",
  });
  for (const r of [0.05, 0.085]) {
    b.part(new THREE.TorusGeometry(r, 0.0009, 6, 48), RIPPLE, {
      bone: thorax,
      at: [0, 0.0004, 0],
      rotation: [90, 0, 0],
      name: "ripple",
    });
  }
  const pad = (r: number) => new THREE.CylinderGeometry(r, r, 0.0016, 16, 1, false, 0.5, Math.PI * 2 - 0.6);
  b.part(pad(0.02), PAD, { bone: thorax, at: [0.05, 0.0018, -0.035], rotation: [0, 40, 0], name: "pad" });
  b.part(pad(0.016), PAD, { bone: thorax, at: [-0.06, 0.0018, 0.045], rotation: [0, -70, 0], name: "pad" });

  return b.root;
}
```