```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  paint,
  stripes,
  scales,
  countershade,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description:
    "A stylized emperor dragonfly perched with its wings spread flat. It has a striped green thorax, a segmented sky-blue abdomen, faceted gem eyes, spiny legs and stained-glass wings.",
};

// work in centimetres, convert to metres
const K = 0.01;
const v = (x: number, y: number, z: number): number[] => [x * K, y * K, z * K];

// palette
const BLACK = "#141a22";
const THORAX = "#62c23a";
const THORAX_PALE = "#d4e86a";
const ABD = "#2f9fe6";
const ABD_BRIGHT = "#8ae8ff";
const BELLY = "#18527e";
const FACE = "#dbe85c";
const LIP = "#c7cf48";
const LABIUM = "#b5a844";
const LEG = "#1f232b";
const COXA = "#4a5a2a";
const HILITE = "#f4fbff";
const OCELLUS = "#f6cf5e";

function makeRand(seed: number): () => number {
  const R = rng(seed) as unknown as any;
  return typeof R === "function" ? () => R() : () => R.next();
}

function wingSvg(broad: boolean, seed: number): string {
  const rand = makeRand(seed);
  const outline = broad
    ? "M 22 200 C 4 196, 2 160, 4 120 C 6 60, 14 10, 30 4 C 42 0, 46 20, 46 60 C 46 120, 42 180, 31 200 Z"
    : "M 26 200 C 14 190, 8 150, 9 100 C 10 50, 16 8, 30 4 C 42 1, 45 20, 45 60 C 45 120, 41 180, 32 200 Z";
  const tints = ["#9fe3ff", "#c9b8ff", "#b8ffd9", "#fff2a8", "#ffd0f0", "#a8f0ff"];
  let cells = "";
  let cross = "";
  let y = 196;
  while (y > 4) {
    const h = 5 + rand() * 5;
    const top = y - h;
    // stained-glass tint band, split into a few cells
    let x = 0;
    while (x < 48) {
      const w = 6 + rand() * 10;
      cells += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(
        1,
      )}" fill="${tints[Math.floor(rand() * tints.length)]}" opacity="${(0.18 + rand() * 0.32).toFixed(2)}"/>`;
      x += w;
    }
    const x0 = 2 + rand() * 8;
    cross += `<path d="M ${x0.toFixed(1)} ${top.toFixed(1)} L 47 ${(top + (rand() - 0.5) * 4).toFixed(1)}"/>`;
    // a short slanted vein for a net-like texture
    const sx = 8 + rand() * 30;
    cross += `<path d="M ${sx.toFixed(1)} ${top.toFixed(1)} L ${(sx + (rand() - 0.5) * 8).toFixed(1)} ${(
      top + h
    ).toFixed(1)}"/>`;
    y = top;
  }
  const longs = [
    "M 32 199 Q 45 100 41 6",
    "M 30 199 Q 40 100 36 8",
    "M 28 199 Q 33 110 30 10",
    "M 26 199 Q 24 110 22 14",
    "M 25 199 Q 15 120 12 40",
    ...(broad ? ["M 23 199 Q 6 170 6 120", "M 24 199 Q 10 185 4 165"] : []),
  ]
    .map((d) => `<path d="${d}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 200">
<defs>
 <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#f0a83e"/>
  <stop offset="0.16" stop-color="#e6f2d8"/>
  <stop offset="0.6" stop-color="#cfeeff"/>
  <stop offset="1" stop-color="#e2d2ff"/>
 </linearGradient>
 <clipPath id="c"><path d="${outline}"/></clipPath>
</defs>
<g clip-path="url(#c)">
 <rect x="0" y="0" width="48" height="200" fill="url(#g)"/>
 ${cells}
 <g fill="none" stroke="#2a3a4a" stroke-width="1.2" stroke-linecap="round">${cross}</g>
 <g fill="none" stroke="#18222e" stroke-width="2" stroke-linecap="round">${longs}</g>
 <rect x="36.5" y="16" width="10" height="13" fill="#5a1e14"/>
</g>
<path d="${outline}" fill="none" stroke="#18222e" stroke-width="2.4"/>
<circle cx="43" cy="98" r="2" fill="#18222e"/>
</svg>`;
}

export default function build() {
  const b = createBuilder({ name: "dragonfly", paintSize: 1024 });

  // ---------- paints ----------
  const thoraxPaint = countershade(
    stripes(THORAX, BLACK, { size: 0.0045, axis: [0, -0.6, 1], width: 0.25, wobble: 0.2, seed: 3 }),
    THORAX_PALE,
    { level: -0.5 },
  );

  const abdPaint = paint((_p, _n, s) => {
    const t = s[0];
    let deg = ((s[1] % 360) + 360) % 360;
    const d = Math.min(deg, 360 - deg);
    const seg = t * 10;
    const u = seg - Math.floor(seg);
    if (t > 0.93) return BLACK;
    if (t > 0.04 && u > 0.87) return BLACK; // segment rings
    if (d < 13) return BLACK; // dorsal line
    if (seg > 2 && d < 55 && u > 0.3 && u < 0.72) return ABD_BRIGHT; // paired dorsal spots
    if (d > 145) return BELLY;
    if (d > 110 && u < 0.5) return BLACK; // lateral dashes
    return ABD;
  });

  const eyeTop = scales(["#1f86b8", "#2a9cc8", "#1a6fa0"], "#0b2b40", { size: 0.0013, seed: 5 });
  const eyeLow = scales(["#45c7c9", "#5fd6c2", "#39b0c0"], "#0d3a48", { size: 0.0013, seed: 6 });
  const eyePaint = paint((_p, n) => (n.y > 0.25 ? eyeTop : eyeLow));

  // ---------- skeleton & thorax ----------
  const thorax = b.joint("thorax", { at: v(0, 1.25, 1.8), dir: [0, 0, 1], role: "spine" });

  b.loft(
    [
      { at: v(0, 1.35, 2.85), w: 0.95 * K, h: 1.0 * K },
      { at: v(0, 1.3, 2.25), w: 1.35 * K, h: 1.5 * K },
      { at: v(0, 1.25, 1.45), w: 1.3 * K, h: 1.5 * K },
      { at: v(0, 1.2, 0.75), w: 0.85 * K, h: 0.95 * K },
    ],
    { bone: thorax, color: thoraxPaint, name: "thorax" },
  );
  // dorsal carina
  b.capsule(v(0, 1.99, 2.55), v(0, 1.96, 1.05), 0.06 * K, { color: BLACK, bone: thorax, name: "carina" });

  // ---------- abdomen ----------
  const abdPath = catmull([v(0, 1.2, 0.9), v(0, 1.18, -0.6), v(0, 1.12, -2.4), v(0, 1.08, -4.3), v(0, 1.14, -6.3)]);
  const abd = b.chain("abdomen", abdPath, {
    parent: thorax,
    count: 8,
    names: (i: number) => `abdomen${i + 1}`,
    role: "tail",
  });
  const abdR = [0.42, 0.36, 0.22, 0.2, 0.21, 0.22, 0.22, 0.21, 0.2, 0.21, 0.23].map((r) => r * K);
  b.sweep(abd, abdR, { color: abdPaint, sides: 8, name: "abdomen" });

  const tipP = abdPath.at(1);
  const lastAbd = abd.joints[abd.joints.length - 1];
  for (const s of [1, -1]) {
    b.spike(
      new THREE.Vector3(tipP.x + s * 0.08 * K, tipP.y + 0.02 * K, tipP.z + 0.05 * K),
      [s * 0.25, 0.12, -1],
      0.55 * K,
      0.07 * K,
      { color: BLACK, bone: lastAbd, name: s > 0 ? "cercusL" : "cercusR" },
    );
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: thorax, at: v(0, 1.45, 3.05), dir: [0, 0, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.38 * K, 8, 6), BLACK, { bone: head, at: v(0, 1.4, 2.85), name: "neck" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const center = head.local({ left: s * 0.3 * K, up: 0.15 * K, forward: 0.05 * K });
    const eye = b.part(new THREE.IcosahedronGeometry(0.56 * K, 2), eyePaint, {
      bone: head,
      at: center,
      flat: true,
      name: `eye${side}`,
    });
    const eyeSurf = b.surface(eye);
    const h1 = eyeSurf.around(center).at(s * 40, 38);
    if (h1) b.stick(new THREE.IcosahedronGeometry(0.1 * K, 0), HILITE, h1, { embed: 0.5, bone: head });
    const h2 = eyeSurf.around(center).at(s * 60, 20);
    if (h2) b.stick(new THREE.IcosahedronGeometry(0.05 * K, 0), HILITE, h2, { embed: 0.5, bone: head });

    // antennae
    b.spike(head.local({ left: s * 0.12 * K, up: 0.22 * K, forward: 0.5 * K }), [s * 0.3, 0.6, 1], 0.38 * K, 0.025 * K, {
      color: BLACK,
      bone: head,
      name: `antenna${side}`,
    });
  }

  // frons (face) with a dark T-mark
  b.part(new THREE.BoxGeometry(0.78 * K, 0.5 * K, 0.42 * K), FACE, {
    bone: head,
    at: head.local({ forward: 0.4 * K, down: 0.12 * K }),
    flat: true,
    name: "frons",
  });
  b.part(new THREE.BoxGeometry(0.5 * K, 0.08 * K, 0.12 * K), BLACK, {
    bone: head,
    at: head.local({ forward: 0.58 * K, up: 0.13 * K }),
    name: "tmark",
  });
  b.part(new THREE.BoxGeometry(0.1 * K, 0.22 * K, 0.08 * K), BLACK, {
    bone: head,
    at: head.local({ forward: 0.6 * K, up: 0.02 * K }),
    name: "tmarkStem",
  });
  // ocelli
  for (const [x, f] of [
    [0, 0.42],
    [0.13, 0.32],
    [-0.13, 0.32],
  ]) {
    b.part(new THREE.SphereGeometry(0.07 * K, 6, 4), OCELLUS, {
      bone: head,
      at: head.local({ left: x * K, up: 0.42 * K, forward: f * K }),
    });
  }
  // upper lip (labrum)
  b.part(new THREE.BoxGeometry(0.58 * K, 0.18 * K, 0.26 * K), LIP, {
    bone: head,
    at: head.local({ forward: 0.5 * K, down: 0.42 * K }),
    flat: true,
    name: "labrum",
  });

  // lower jaw (labium) and mandibles
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.3 * K, down: 0.5 * K }),
    dir: [0, -0.5, 1],
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.62 * K, 0.36 * K, 0.14 * K), LABIUM, {
    bone: jaw,
    at: jaw.local({ forward: 0.16 * K }),
    dir: [0, -0.5, 1],
    flat: true,
    name: "labium",
  });
  for (const s of [1, -1]) {
    b.spike(jaw.local({ left: s * 0.2 * K, forward: 0.12 * K, up: 0.12 * K }), [-s * 0.6, -0.2, 1], 0.3 * K, 0.07 * K, {
      color: BLACK,
      bone: jaw,
      name: s > 0 ? "mandibleL" : "mandibleR",
    });
  }

  // ---------- legs ----------
  const footR = 0.045 * K;
  const legDefs = [
    { k: "F", root: [0.22, 0.65, 2.55], foot: [1.5, 3.7], sole: [0.5, -0.15, 0.85], len: [0.85, 1.0, 0.45] },
    { k: "M", root: [0.26, 0.6, 2.05], foot: [2.1, 2.2], sole: [0.95, -0.15, 0.2], len: [1.05, 1.15, 0.5] },
    { k: "H", root: [0.26, 0.6, 1.55], foot: [2.0, 0.2], sole: [0.75, -0.15, -0.6], len: [1.2, 1.3, 0.55] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const d of legDefs) {
      const root = v(s * d.root[0], d.root[1], d.root[2]);
      const target = [s * d.foot[0] * K, footR, d.foot[1] * K];
      const sole = [s * d.sole[0], d.sole[1], d.sole[2]];
      const pts = limb(
        root,
        target,
        d.len.map((l) => l * K),
        [[s * 0.3, 1, 0]],
        { sole },
      );
      const tag = `${d.k}${side}`;
      const leg = b.chain(`leg${tag}`, pts, {
        parent: thorax,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `foot${tag}`],
        role: "leg",
      });
      const legSweep = b.sweep(leg, [0.1, 0.08, 0.06, 0.045].map((r) => r * K), {
        sides: 6,
        bands: [
          [0.12, COXA],
          [1, LEG],
        ],
        name: `leg${tag}`,
      });
      // spines along the underside of femur and tibia
      for (let i = 0; i < 7; i++) {
        const p = legSweep.at(0.2 + i * 0.09, 180);
        b.spike(p, p, 0.17 * K, 0.02 * K, { color: LEG });
      }
      // tarsal claws
      const tip = pts[pts.length - 1];
      for (const c of [-1, 1]) {
        b.spike(tip, [sole[0] + c * 0.25, -0.9, sole[2] + c * 0.25], 0.09 * K, 0.02 * K, {
          color: BLACK,
          bone: leg.tip ?? undefined,
        });
      }
    }
  }

  // ---------- wings ----------
  const foreTex = svg(wingSvg(false, 11), { size: 512 });
  const hindTex = svg(wingSvg(true, 23), { size: 512 });
  const wingDefs = [
    { k: "F", y: 1.9, z: 2.05, flowZ: 0.16, tex: foreTex, size: [1.15, 4.9] },
    { k: "H", y: 1.8, z: 1.25, flowZ: -0.22, tex: hindTex, size: [1.4, 4.6] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const w of wingDefs) {
      const wj = b.joint(`wing${w.k}${side}`, {
        parent: thorax,
        at: v(s * 0.3, w.y, w.z),
        dir: [s, 0, w.flowZ],
        role: "wing",
      });
      b.part(new THREE.BoxGeometry(0.3 * K, 0.12 * K, 0.42 * K), BLACK, {
        bone: wj,
        at: wj.at,
        flat: true,
        name: `wingBase${w.k}${side}`,
      });
      b.cards([frame(wj.at, [0, 1, 0])], w.tex, {
        size: [w.size[0] * K, w.size[1] * K],
        lean: 90,
        flow: [s, 0, w.flowZ],
        mirror: s > 0,
        sink: 0.03,
        bone: wj,
        name: `wing${w.k}${side}`,
      });
    }
  }

  return b.root;
}
```