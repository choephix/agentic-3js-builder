import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  patches,
  smoothstep,
  countershade,
} from "../../../../src/index";

export const meta = {
  name: "Dragonfly",
  description:
    "A perched blue-and-green darner dragonfly with four veined wings, huge compound eyes, a banded abdomen and six jointed legs, rigged with jaw, wing hinges and a segmented tail.",
};

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---------- skeleton ----------
  const thorax = b.joint("thorax", { at: [0, 0.019, 0.005] });
  b.joint("neck", { parent: thorax, at: [0, 0.02, 0.02], dir: [0, 0, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.021, 0.025], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.0185, 0.032], dir: [0, 0, 1], role: "jaw" });

  // ---------- thorax ----------
  const thoraxPaint = paint((p, n) => {
    const green = "#8cc63a";
    const dark = "#2a2b14";
    const k = (p.z + p.y * 0.6) / 0.006;
    const f = k - Math.floor(k);
    const stripe = smoothstep(0.3, 0.2, f) * smoothstep(0.1, 0.35, Math.abs(p.x) + 0.002);
    const top = smoothstep(0.5, 0.85, n.y);
    const side = mix(green, dark, stripe);
    return mix(side, "#3a2a18", top);
  });
  b.part(new THREE.SphereGeometry(1, 9, 7), thoraxPaint, {
    at: [0, 0.019, 0.005],
    scale: [0.0085, 0.0095, 0.0145],
    bone: "thorax",
    flat: true,
    name: "thoraxShell",
  });

  // ---------- abdomen ----------
  const abdomen = b.chain(
    "abdomen",
    [
      [0, 0.0195, -0.008],
      [0, 0.0205, -0.02],
      [0, 0.0215, -0.035],
      [0, 0.0215, -0.05],
      [0, 0.0205, -0.066],
    ],
    { parent: thorax, count: 6, role: "tail" },
  );
  const abdomenPaint = paint((p, n) => {
    const base = mix("#2f78d6", "#9fcf5a", smoothstep(-0.028, -0.012, p.z));
    const k = -p.z / 0.0072;
    const f = k - Math.floor(k);
    const ring = smoothstep(0.22, 0.12, f);
    const dorsal = smoothstep(0.55, 0.85, n.y) * smoothstep(-0.062, -0.03, p.z) * 0.9;
    const withRing = mix(base, "#15213a", ring);
    return mix(withRing, "#1a2b50", dorsal);
  });
  b.sweep(abdomen, {
    radius: [0.0052, 0.0036, 0.0028, 0.0027, 0.0026, 0.0021],
    color: abdominalPaintFix(abdomenPaint),
    sides: 6,
    caps: { start: "round", end: "round" },
    name: "abdomen",
  });
  function abdominalPaintFix<T>(x: T) {
    return x;
  }
  const tip = abdomen.at(1).at;
  for (const sx of [1, -1]) {
    b.spike(tip, [sx * 0.25, 0, -1], 0.0045, 0.0009, {
      color: "#1b1b22",
      bone: "abdomen6",
      sides: 4,
      name: sx > 0 ? "cercusL" : "cercusR",
    });
  }

  // ---------- head ----------
  const eyePaint = countershade("#2a86d8", "#38a578", { level: 0.15, soft: 0.45 });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#3d8f3a", {
    at: [0, 0.0205, 0.0285],
    scale: [0.0065, 0.0062, 0.0055],
    bone: "head",
    flat: true,
    name: "headCapsule",
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 9, 7), eyePaint, {
      at: [sx * 0.0058, 0.0225, 0.029],
      scale: [0.0058, 0.0072, 0.0072],
      bone: "head",
      flat: true,
      name: sx > 0 ? "eyeL" : "eyeR",
    });
    // dark pupil-like facet spot
    b.part(new THREE.SphereGeometry(1, 6, 4), "#10243a", {
      at: [sx * 0.0098, 0.0232, 0.0325],
      scale: [0.0015, 0.0022, 0.0022],
      bone: "head",
      flat: true,
    });
    b.rod([sx * 0.0022, 0.0265, 0.0345], [sx * 0.0028, 0.0295, 0.0372], [0.0003, 0.0002], {
      color: "#222",
      bone: "head",
      sides: 4,
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), "#c9e86a", {
    at: [0, 0.0212, 0.0352],
    scale: [0.0048, 0.0042, 0.0032],
    bone: "head",
    flat: true,
    name: "frons",
  });
  b.part(new THREE.BoxGeometry(0.0062, 0.0014, 0.0032), "#e8f0a0", {
    at: [0, 0.0182, 0.0368],
    bone: "head",
    name: "labrum",
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.0012, 0.0032, 4), "#3a2a18", {
      at: [sx * 0.0028, 0.0178, 0.0345],
      rotation: [90, 0, sx * 12],
      bone: "head",
      flat: true,
    });
  }
  b.part(new THREE.BoxGeometry(0.0058, 0.0012, 0.0045), "#b9d85a", {
    at: [0, 0.0167, 0.0345],
    bone: "jaw",
    name: "labium",
  });

  // ---------- legs ----------
  const legSets: Array<[string, number, number, number, number, number]> = [
    // tag, zStart, dz1, dz2, zFoot, kneeLift
    ["F", 0.012, 0.006, 0.011, 0.016, 0.0145],
    ["M", 0.005, 0.0, 0.002, 0.004, 0.0135],
    ["H", -0.002, -0.006, -0.011, -0.015, 0.0145],
  ];
  for (const [tag, zs, dz1, dz2, zf, kl] of legSets) {
    for (const sx of [1, -1]) {
      const s = sx > 0 ? "L" : "R";
      const k = tag + s;
      const chain = b.chain(
        `leg${k}`,
        [
          [sx * 0.004, 0.0125, zs],
          [sx * 0.012, kl, zs + dz1],
          [sx * 0.0155, 0.007, zs + dz2],
          [sx * 0.0145, 0.0005, zf],
        ],
        {
          parent: thorax,
          names: [`hip${k}`, `knee${k}`, `ankle${k}`, `foot${k}`],
          role: "leg",
        },
      );
      b.sweep(chain, {
        radius: [0.0013, 0.0009, 0.0006, 0.0005],
        color: "#2b2118",
        sides: 5,
        name: `leg${k}`,
      });
    }
  }

  // ---------- wings ----------
  const veins = patches("#4f5e50", "#dcf0f2", { size: 0.0028, gap: 0.14, seed: 3 });
  const wingPaint = paint((p, n, s) => {
    const x = s[0];
    const y = s[1];
    if (x > 0.0325 && x < 0.0365 && y > 0.0025) return "#4a2e14";
    const c = veins.at(p, n);
    const amber = smoothstep(0.009, 0.002, x);
    return mix(c, "#d9a441", amber * 0.8);
  });
  const foreOutline: Array<[number, number]> = [
    [0, 0.002], [0.01, 0.0045], [0.025, 0.005], [0.037, 0.0035], [0.0415, 0.001],
    [0.04, -0.0035], [0.03, -0.0055], [0.018, -0.0055], [0.008, -0.004], [0, -0.002],
  ];
  const hindOutline: Array<[number, number]> = [
    [0, 0.003], [0.01, 0.005], [0.025, 0.0055], [0.037, 0.0035], [0.0405, 0.0],
    [0.037, -0.0045], [0.028, -0.0075], [0.016, -0.009], [0.006, -0.0085], [0, -0.005],
  ];
  for (const sx of [1, -1]) {
    const s = sx > 0 ? "L" : "R";
    for (const [tag, z, outline, sweepZ] of [
      ["F", 0.009, foreOutline, 0.12],
      ["H", -0.002, hindOutline, -0.15],
    ] as const) {
      const joint = b.joint(`wing${tag}${s}`, {
        parent: thorax,
        at: [sx * 0.004, 0.0262, z],
        dir: [sx, 0, sweepZ],
        role: "hinge",
      });
      b.extrude(outline, {
        color: wingPaint,
        at: joint,
        x: [sx, 0, sweepZ],
        y: [0, 0, 1],
        thickness: 0.0004,
        smoothing: 1,
        bone: joint,
        name: `wing${tag}${s}`,
      });
      // leading-edge vein
      b.rod([sx * 0.004, 0.0262, z + 0.0018], [sx * 0.04, 0.0262, z + 0.0035 + sweepZ * 0.0], [0.0004, 0.00025], {
        color: "#3b3326",
        bone: joint,
        sides: 4,
      });
    }
  }

  return b.root;
}
