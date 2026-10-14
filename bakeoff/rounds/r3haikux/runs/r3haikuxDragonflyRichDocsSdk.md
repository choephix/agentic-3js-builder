```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, noise, paint, polyline } from "agentic-3js-builder";

export const meta = {
  name: "emperor-dragonfly",
  description:
    "An emperor dragonfly hovering with its four glassy wings held flat, an electric-blue abdomen with black dorsal markings, an apple-green thorax and huge turquoise eyes. Six thin legs are tucked under the body.",
};

// Palette
const APPLE = "#9ccf3f";
const APPLE_PALE = "#dcec98";
const APPLE_DARK = "#22361a";
const BLUE = "#1f6cff";
const BLUE_LIGHT = "#4fb8ff";
const BLACK = "#16171b";
const HEAD = "#17302f";
const TURQ = "#23c4b4";
const TURQ_LIGHT = "#a2f5e6";
const TURQ_DARK = "#0b7d78";
const WING = "#e7d9ab";
const SHEEN = "#fff0bd";
const AMBER = "#c9b275";
const VEIN = "#3b2c17";
const PTERO = "#2a1c0e";

// Leading-edge chord height at span u, interpolated from the wing's lead points.
function leadAt(lead: number[][], u: number): number {
  for (let i = 0; i < lead.length - 1; i++) {
    const [u0, v0] = lead[i];
    const [u1, v1] = lead[i + 1];
    if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
  }
  return lead[lead.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });

  // ---------- Paints ----------

  // Wing membrane: pale golden glass, a fine Voronoi net of dark veins,
  // a dark costa along the leading edge and a pterostigma near the tip.
  const wingPaint = (lead: number[][], ptero: boolean) =>
    paint((_p, _n, s) => {
      const u = s[0];
      const v = s[1];
      const le = leadAt(lead, u);
      if (ptero && u > 0.043 && u < 0.052 && v < le - 0.0008 && v > le - 0.0021) return PTERO;
      if (v > le - 0.0011) return VEIN;
      const c = cells(new THREE.Vector3(u, v, 0), 0.0026);
      if (c.d2 - c.d1 < 0.0003) return VEIN;
      const g = noise(new THREE.Vector3(u, v, 0), 0.02);
      return g > 0.62 ? SHEEN : g < 0.36 ? AMBER : WING;
    });

  // Eyes: turquoise with a honeycomb of ommatidia and a glossy top.
  const eyeSkin = paint((_p, n, s) => {
    const c = cells(new THREE.Vector3(s[0] * 0.0816, s[1] * 0.0408, 0), 0.0019);
    if (c.d2 - c.d1 < 0.00028) return TURQ_DARK;
    if (n.y > 0.55) return TURQ_LIGHT;
    if (n.z < -0.25) return TURQ_DARK;
    return TURQ;
  });

  // Thorax: apple green, paler underneath, with dark shoulder stripes on the sides.
  const thoraxPaint = paint((_p, _n, s) => {
    const dn = ((s[1] % 360) + 360) % 360;
    const side = Math.abs(dn - 90) < 14 || Math.abs(dn - 270) < 14;
    if (side && s[0] > 0.18 && s[0] < 0.7) return APPLE_DARK;
    return dn > 110 && dn < 250 ? APPLE_PALE : APPLE;
  });

  // Abdomen: electric blue, a black dorsal line, black dashes per segment, lighter belly.
  const abdomenPaint = paint((_p, _n, s) => {
    const dn = ((s[1] % 360) + 360) % 360;
    const near = Math.min(dn, 360 - dn); // 0 = top of the tube, 180 = underside
    const seg = s[0] * 8;
    const f = seg - Math.floor(seg);
    if (near < 13) return BLACK;
    if (near < 30 && f > 0.35 && f < 0.85) return BLACK;
    return near > 115 ? BLUE_LIGHT : BLUE;
  });

  // ---------- Skeleton ----------

  const thorax = b.joint("thorax", { at: [0, 0.302, 0], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.304, 0.022], aim: [0, 0.304, 0.06], role: "head" });

  // Wing roots sit on top of the thorax and aim sideways, so the wings lie flat.
  const wingFL = b.joint("wingFL", { parent: thorax, at: [0.004, 0.315, 0], aim: [0.07, 0.315, 0], role: "wing" });
  const wingFR = b.joint("wingFR", { parent: thorax, at: [-0.004, 0.315, 0], aim: [-0.07, 0.315, 0], role: "wing" });
  const wingHL = b.joint("wingHL", { parent: thorax, at: [0.004, 0.315, -0.011], aim: [0.07, 0.315, -0.011], role: "wing" });
  const wingHR = b.joint("wingHR", { parent: thorax, at: [-0.004, 0.315, -0.011], aim: [-0.07, 0.315, -0.011], role: "wing" });

  // Abdomen: a long, slim chain that trails back from the thorax.
  const abdomenPath = catmull([
    [0, 0.3, -0.008],
    [0, 0.299, -0.022],
    [0, 0.2975, -0.04],
    [0, 0.296, -0.058],
    [0, 0.2945, -0.074],
  ]);
  const abdomen = b.chain("abdomen", abdomenPath, {
    parent: thorax,
    count: 7,
    names: ["abd1", "abd2", "abd3", "abd4", "abd5", "abd6", "abd7"],
    role: "tail",
  });

  // ---------- Body ----------

  // Thorax: a stout loft, three stations front to back.
  b.loft(
    [
      { at: [0, 0.303, 0.01], w: 0.016, h: 0.019 },
      { at: [0, 0.302, -0.001], w: 0.021, h: 0.024 },
      { at: [0, 0.3, -0.013], w: 0.015, h: 0.018 },
    ],
    { bone: thorax, color: thoraxPaint },
  );

  // Abdomen: tapered tube, fat at the root and a slight club at the tip.
  b.sweep(abdomen, (t: number) => 0.0034 + 0.004 * Math.exp(-10 * t) + 0.0008 * Math.max(0, t - 0.8) * 5, {
    color: abdomenPaint,
  });

  // Cerci: two small black claspers at the tip.
  const tail = abdomen.at(1);
  for (const s of [1, -1]) b.spike(tail, [s * 0.35, -0.12, -1], 0.01, 0.0013, { color: BLACK });

  // ---------- Head and eyes ----------

  b.part(new THREE.SphereGeometry(0.0095, 12, 8), HEAD, { bone: head, at: [0, 0.302, 0.016] });
  for (const s of [1, -1]) {
    // Main eye, stretched forward a little.
    b.part(new THREE.SphereGeometry(0.0132, 16, 10), eyeSkin, {
      bone: head,
      at: [s * 0.0076, 0.305, 0.022],
      scale: [0.92, 1, 1.18],
    });
    // Rear lobe that wraps the eye round the side of the head.
    b.part(new THREE.SphereGeometry(0.01, 12, 8), eyeSkin, {
      bone: head,
      at: [s * 0.0105, 0.3, 0.012],
      scale: [0.8, 1, 1.3],
    });
  }

  // ---------- Wings ----------

  // Forewing outline in (span, chord) metres, root at the origin.
  const forewing = [
    [0.003, 0.0055],
    [0.016, 0.0068],
    [0.03, 0.0068],
    [0.044, 0.0056],
    [0.054, 0.0034],
    [0.057, 0.0002],
    [0.054, -0.003],
    [0.044, -0.0047],
    [0.028, -0.0052],
    [0.012, -0.0045],
    [0.003, -0.0032],
  ];
  const foreLead = [
    [0.003, 0.0055],
    [0.016, 0.0068],
    [0.03, 0.0068],
    [0.044, 0.0056],
    [0.054, 0.0034],
  ];

  // Hindwing: broader and rounder at the base.
  const hindwing = [
    [0.003, 0.0058],
    [0.016, 0.008],
    [0.032, 0.0084],
    [0.046, 0.0072],
    [0.053, 0.0042],
    [0.054, 0.0005],
    [0.05, -0.0035],
    [0.04, -0.0065],
    [0.026, -0.0077],
    [0.012, -0.0068],
    [0.003, -0.004],
  ];
  const hindLead = [
    [0.003, 0.0058],
    [0.016, 0.008],
    [0.032, 0.0084],
    [0.046, 0.0072],
    [0.053, 0.0042],
  ];

  const wingSpec = [
    { joint: wingFL, s: 1, at: [0, 0.315, 0], outline: forewing, lead: foreLead, ptero: true, name: "forewingL" },
    { joint: wingFR, s: -1, at: [0, 0.315, 0], outline: forewing, lead: foreLead, ptero: true, name: "forewingR" },
    { joint: wingHL, s: 1, at: [0, 0.315, -0.011], outline: hindwing, lead: hindLead, ptero: false, name: "hindwingL" },
    { joint: wingHR, s: -1, at: [0, 0.315, -0.011], outline: hindwing, lead: hindLead, ptero: false, name: "hindwingR" },
  ];
  for (const w of wingSpec) {
    b.extrude(w.outline, {
      at: w.at,
      x: [w.s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0007,
      smoothing: 2,
      color: wingPaint(w.lead, w.ptero),
      bone: w.joint,
      name: w.name,
    });
  }

  // ---------- Legs (three pairs, tucked under the body) ----------

  const legDefs = [
    {
      k: "F",
      pts: [
        [0.0065, 0.2915, 0.012],
        [0.0165, 0.284, 0.026],
        [0.0085, 0.276, 0.046],
        [0.003, 0.271, 0.06],
      ],
    },
    {
      k: "M",
      pts: [
        [0.0075, 0.2905, 0.0],
        [0.0215, 0.2815, 0.0035],
        [0.014, 0.274, 0.017],
        [0.0065, 0.2705, 0.029],
      ],
    },
    {
      k: "H",
      pts: [
        [0.007, 0.2895, -0.012],
        [0.02, 0.2825, -0.022],
        [0.0115, 0.274, -0.036],
        [0.0055, 0.2705, -0.047],
      ],
    },
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const leg of legDefs) {
      const path = polyline(leg.pts.map(([x, y, z]) => [s * x, y, z]));
      const chain = b.chain(`leg${leg.k}${side}`, path, {
        parent: thorax,
        names: [`hip${leg.k}${side}`, `knee${leg.k}${side}`, `ankle${leg.k}${side}`, `foot${leg.k}${side}`],
        role: "leg",
      });
      b.sweep(chain, (t: number) => 0.0017 - 0.0007 * t, { color: BLACK });
      if (chain.tip) b.spike(chain.tip, chain.tip, 0.003, 0.0007, { color: BLACK });
    }
  }

  return b.root;
}
```