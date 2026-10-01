import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { paint, scales } from "../src/paint";
import { metal } from "../kits/clockwork";
import { glow } from "../kits/glow";

// Art Nouveau Dragonfly — a giant jewelled dragonfly (1.2 m wingspan),
// hovering with its lowest point 0.4 m above the floor.
export const meta = {
  name: "Art Nouveau Dragonfly",
  description:
    "A giant jewelled dragonfly in Art Nouveau style: gold filigree body, plique-a-jour enamel wings, opal and moonstone cabochons, whiplash antennae.",
};

const GOLD = "#c9a227";
const GOLD_DK = "#8a6d1f";
const BRONZE = "#6e4f2a";
const LEG_DK = "#4a3520";
const OPAL = "#e9f2ea";
const MOON = "#cfd6e4";
const VIOLET = "#7b5fc4";
const TURQ = "#46c2b0";
const LEAF = "#2e7d46";
const AMBER = "#e8a13a";

const GILT = metal("gilt", { tarnish: 0.25, polish: 0.6 });
const BRONZE_P = metal("bronze", { tarnish: 0.3, polish: 0.4 });

// Plique-a-jour enamel: deep green at the wing root flowing through
// turquoise into violet at the tip, with fine gold veining and borders.
// Membrane s = [along 0..1 root->tip, across 0..1 leading->trailing].
const enamel = paint((_p, _n, s) => {
  const t = s[0];
  const a = s[1];
  // green -> turquoise -> violet gradient along the wing
  let r: number;
  let g: number;
  let b: number;
  if (t < 0.45) {
    const k = t / 0.45;
    r = 0.18 + (0.27 - 0.18) * k;
    g = 0.49 + (0.76 - 0.49) * k;
    b = 0.27 + (0.69 - 0.27) * k;
  } else {
    const k = (t - 0.45) / 0.55;
    r = 0.27 + (0.48 - 0.27) * k;
    g = 0.76 + (0.37 - 0.76) * k;
    b = 0.69 + (0.77 - 0.69) * k;
  }
  // darken toward the trailing edge for depth
  const shade = 1 - 0.15 * a;
  // fine secondary veins fanning across the wing
  const v = (((t * 9 - a * 1.4) % 1) + 1) % 1;
  if (v < 0.05) return [0.79, 0.64, 0.15];
  // amber border on the leading edge, violet edge on the trailing rim
  if (a < 0.045) return [0.91, 0.63, 0.23];
  if (a > 0.94) return [0.3, 0.19, 0.5];
  return [r * shade, g * shade, b * shade];
});

// Compound-eye facets: pale opal cells outlined in gold.
const eyePaint = scales(OPAL, GOLD_DK, { size: 0.009 });

function lerp3(a: number[], b: number[], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export default function build() {
  const b = createBuilder({ name: "artNouveauDragonfly" });

  // ---- thorax (root) ----
  const thorax = b.joint("thorax", { at: [0, 0.58, 0.1], role: "spine" });
  const thoraxPath = catmull([
    [0, 0.572, -0.01],
    [0, 0.585, 0.08],
    [0, 0.59, 0.17],
    [0, 0.585, 0.24],
  ]);
  const thoraxTube = b.sweep(thoraxPath, (t) => 0.046 - 0.01 * t, {
    bone: thorax,
    color: GILT,
  });

  // Gold filigree collars ringed round the thorax, set with jewels.
  const skin = b.surface(thoraxTube);
  const jewelCols = [VIOLET, TURQ, OPAL, MOON];
  [0.07, 0.17].forEach((z, ci) => {
    const collar = skin.loop(frame([0, 0.585, z], [0, 0, 1]), { lift: 0.004 });
    b.sweep(collar, 0.0035, { bone: thorax, color: GOLD });
    const seats = b.along(collar, 10, () => {});
    seats.forEach((at, i) => {
      b.stick(new THREE.OctahedronGeometry(0.008), jewelCols[(i + ci * 2) % 4], at, {
        embed: 0.35,
      });
    });
  });
  // Whiplash scrolls: paired gold curls rising behind the wing roots.
  for (const sx of [1, -1]) {
    const scroll = bezier(
      [sx * 0.04, 0.63, 0.1],
      [sx * 0.1, 0.68, 0.02],
      [sx * 0.09, 0.71, -0.06],
      [sx * 0.045, 0.685, -0.09],
    );
    b.sweep(scroll, [0.003, 0.0006], { bone: thorax, color: GILT });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), TURQ, { bone: thorax, at: scroll.at(1) });
  }
  // Opal cabochons down the thorax back.
  [0.03, 0.1, 0.17].forEach((z, i) => {
    const hit = skin.nearest([0, 0.66, z]);
    if (hit) b.stick(new THREE.SphereGeometry(0.013, 10, 7), i % 2 ? MOON : OPAL, hit, { embed: 0.45 });
  });

  // ---- head, eyes, mouthpart ----
  const head = b.joint("head", {
    parent: thorax,
    at: [0, 0.6, 0.28],
    dir: [0, 0.05, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.052, 12, 8), GILT, { bone: head, at: [0, 0.6, 0.28] });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 8, 6), eyePaint, {
      bone: head,
      at: [sx * 0.052, 0.618, 0.3],
      flat: true,
    });
  }
  // Three amber ocelli on the crown.
  for (const [ox, oz] of [
    [0, 0.315],
    [0.014, 0.3],
    [-0.014, 0.3],
  ] as const) {
    glow(b.part(new THREE.SphereGeometry(0.007, 6, 4), AMBER, { bone: head, at: [ox, 0.648, oz] }), 0.8);
  }
  // Forehead moonstone.
  b.part(new THREE.SphereGeometry(0.012, 8, 6), MOON, { bone: head, at: [0, 0.635, 0.315] });
  // Filigree brow band across the face between the eyes.
  b.sweep(bezier([0.045, 0.63, 0.322], [0, 0.645, 0.335], [-0.045, 0.63, 0.322]), 0.003, { bone: head, color: GOLD });
  // Labium (lower mouthpart) on its own jaw joint.
  const labium = b.joint("labium", {
    parent: head,
    at: [0, 0.562, 0.3],
    dir: [0, -0.7, 0.7],
    role: "jaw",
  });
  b.sweep(
    polyline([
      [0, 0.562, 0.3],
      [0, 0.544, 0.316],
      [0, 0.534, 0.306],
    ]),
    [0.009, 0.002],
    {
      bone: labium,
      color: BRONZE_P,
      bands: [
        [0.55, BRONZE_P],
        [1, GOLD],
      ],
    },
  );
  for (const sx of [1, -1]) {
    b.spike([sx * 0.008, 0.538, 0.308], [sx * 0.02, -0.4, 0.5], 0.03, 0.004, {
      bone: labium,
      color: BRONZE,
    });
  }
  // Maxillary palps: small paired feelers flanking the labium.
  for (const sx of [1, -1]) {
    b.sweep(
      polyline([
        [sx * 0.02, 0.565, 0.315],
        [sx * 0.032, 0.548, 0.325],
        [sx * 0.036, 0.538, 0.318],
      ]),
      [0.0035, 0.001],
      { bone: labium, color: BRONZE_P },
    );
  }

  // Whiplash antennae curling forward, gold with bead tips.
  for (const sx of [1, -1]) {
    const x = sx * 0.025;
    const curl = bezier(
      [x, 0.642, 0.3],
      [x + sx * 0.07, 0.68, 0.36],
      [x + sx * 0.05, 0.73, 0.44],
      [x - sx * 0.02, 0.7, 0.47],
    );
    b.sweep(curl, [0.0022, 0.0005], { bone: head, color: GILT });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), GOLD, { bone: head, at: curl.at(1) });
  }

  // ---- abdomen: segmented, gem-inlaid, curving gently down ----
  const abdPath = catmull([
    [0, 0.575, 0.0],
    [0, 0.56, -0.18],
    [0, 0.535, -0.36],
    [0, 0.515, -0.52],
    [0, 0.52, -0.66],
  ]);
  const abdomen = b.chain("abdomen", abdPath, {
    parent: thorax,
    names: ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "abdomen5"],
    role: "tail",
  });
  const abdTube = b.sweep(abdomen, (t) => 0.024 * (1 - t) + 0.005, {
    color: GILT,
    bands: [
      [0.13, LEAF],
      [0.21, GILT],
      [0.36, LEAF],
      [0.44, GILT],
      [0.59, LEAF],
      [0.67, GILT],
      [0.82, LEAF],
      [0.9, GILT],
      [1, GOLD],
    ],
  });
  // Gem cabochons down the dorsal line.
  const gemCols = [OPAL, VIOLET, MOON, TURQ, OPAL];
  gemCols.forEach((c, i) => {
    const t = 0.12 + i * 0.16;
    b.stick(new THREE.SphereGeometry(0.0115, 10, 7), c, abdTube.at(t, 0), { embed: 0.4 });
  });
  // Gold bead rings between segments.
  [0.22, 0.5, 0.78].forEach((t) => {
    const ring = b.surface(abdTube).loop(abdomen.jointAt(t), { lift: 0.003 });
    b.sweep(ring, 0.0028, { bone: abdomen.jointAt(t), color: GOLD });
  });
  // Sting tip flourish with a whiplash curl.
  b.spike(abdPath.at(1), [0, 0.35, -1], 0.05, 0.007, { bone: abdomen.tip ?? undefined, color: GOLD });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), VIOLET, {
    bone: abdomen.tip ?? undefined,
    at: [0, 0.537, -0.705],
  });

  const nodus = paint((_p, _n, st) => {
    const band = st[0] > 0.42 && st[0] < 0.47 && st[1] < 0.12 ? 1 : 0;
    return band ? [0.95, 0.68, 0.25] : [0.79, 0.64, 0.15];
  });

  // ---- wings: two pairs, veined enamel membranes in rest spread ----
  interface WingDef {
    key: string;
    base: number[];
    mid: number[];
    tip: number[];
    trailBase: number[];
    trailCtrl: number[];
  }
  const wings: WingDef[] = [
    {
      key: "FL",
      base: [0.045, 0.625, 0.15],
      mid: [0.32, 0.65, 0.1],
      tip: [0.6, 0.66, 0.0],
      trailBase: [0.03, 0.615, 0.05],
      trailCtrl: [0.3, 0.63, -0.045],
    },
    {
      key: "HL",
      base: [0.045, 0.61, 0.07],
      mid: [0.3, 0.635, -0.02],
      tip: [0.58, 0.64, -0.13],
      trailBase: [0.03, 0.6, -0.02],
      trailCtrl: [0.29, 0.61, -0.15],
    },
  ];
  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";
    for (const w of wings) {
      const mx = (p: number[]) => [-side * 0 + side * p[0] * (side > 0 ? 1 : -1), p[1], p[2]];
      void mx;
      const sx = (p: number[]) => [side * p[0], p[1], p[2]];
      const lead = b.chain(`wing${w.key}${S}`, catmull([sx(w.base), sx(w.mid), sx(w.tip)]), {
        parent: thorax,
        names: [`wing${w.key}${S}Base`, `wing${w.key}${S}Mid`, `wing${w.key}${S}Tip`],
        role: "wing",
      });
      const tipL = sx(w.tip);
      const tipT = [tipL[0] * 0.975, tipL[1] - 0.004, tipL[2] + 0.016];
      const trail = bezier(sx(w.trailBase), sx(w.trailCtrl), tipT);
      b.membrane(lead, trail, { color: enamel, thickness: 0.0015, scallop: 0.05 });
      // Gold costa along the leading edge, amber nodus bars on forewings.
      b.sweep(lead, 0.0038, { color: w.key === "FL" ? nodus : GILT });
      // Fan veins from leading edge to trailing edge.
      for (const t of [0.22, 0.45, 0.68, 0.88]) {
        const a = lead.at(t);
        const bp = trail.at(t);
        const tip = Array.isArray(bp) ? bp : [bp.x, bp.y, bp.z];
        b.rod([a.at.x, a.at.y, a.at.z], tip as number[], [0.0016, 0.0004], { color: GOLD_DK });
      }
      // Lattice: rungs between neighbouring fan veins at two depths.
      for (const f of [0.3, 0.62, 0.88]) {
        for (const t of [0.22, 0.45, 0.68]) {
          const a = lead.at(t);
          const c = lead.at(t + 0.23);
          const ta = trail.at(t);
          const tb = trail.at(t + 0.23);
          b.rod(
            [a.at.x + (ta.x - a.at.x) * f, a.at.y + (ta.y - a.at.y) * f, a.at.z + (ta.z - a.at.z) * f],
            [c.at.x + (tb.x - c.at.x) * f, c.at.y + (tb.y - c.at.y) * f, c.at.z + (tb.z - c.at.z) * f],
            [0.0009, 0.0004],
            { color: GOLD },
          );
        }
      }
      // Tegula: gold bead at the wing root.
      const root = lead.at(0.03);
      b.part(new THREE.SphereGeometry(0.012, 8, 6), GOLD, {
        bone: root.bone,
        at: [root.at.x, root.at.y, root.at.z],
      });
    }
  }

  // ---- six thin legs tucked under the thorax, feet lowest at y = 0.41 ----
  const legDefs = [
    { key: "1", root: [0.028, 0.568, 0.2], foot: [0.03, 0.408, 0.26] },
    { key: "2", root: [0.03, 0.562, 0.12], foot: [0.055, 0.408, 0.12] },
    { key: "3", root: [0.028, 0.562, 0.04], foot: [0.045, 0.408, -0.01] },
  ];
  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";
    for (const d of legDefs) {
      const root: [number, number, number] = [side * d.root[0], d.root[1], d.root[2]];
      const foot: [number, number, number] = [side * d.foot[0], d.foot[1], d.foot[2]];
      const pts = limb(root, foot, [0.085, 0.1], [[side, 0.45, 0.05]]);
      const last = pts[pts.length - 1];
      if (last.distanceTo(new THREE.Vector3(...foot)) > 1e-3) throw new Error("leg too short");
      const chain = b.chain(`leg${S}${d.key}`, pts, {
        parent: thorax,
        names: [`hip${S}${d.key}`, `knee${S}${d.key}`, `foot${S}${d.key}`],
        role: "leg",
      });
      b.sweep(chain, [0.0042, 0.0018], { color: metal("bronze", { tarnish: 0.5, polish: 0.3 }) });
      b.part(new THREE.SphereGeometry(0.006, 6, 4), LEG_DK, { bone: chain.tip ?? undefined, at: foot });
    }
  }

  // Palette check helper (keeps lerp3 used for future blends).
  void lerp3;

  return b.root;
}
