```ts
import * as THREE from "three";
import { createBuilder, catmull, svg, rng } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "A life-size emperor dragonfly (Anax imperator) hovering 30 cm above the water. It has an electric-blue abdomen with a jagged black dorsal stripe, an apple-green thorax, faceted turquoise wraparound eyes, and four glassy gold-sheened wings with a fine net of dark veins. The six legs are tucked under the body.",
};

const H = 0.3; // hover height of the thorax

// ---------- wing profile (shared by geometry and vein drawing) ----------
type W = (u: number) => number;
const tipF = (u: number) => (u < 0.75 ? 1 : Math.sqrt(Math.max(0, 1 - ((u - 0.75) / 0.25) ** 2)));
const profile = (w: W) => ({
  lead: (u: number) => 0.02 + w(u) * (1 - tipF(u)) * 0.45,
  trail: (u: number) => 0.02 + w(u) * (0.45 + 0.55 * tipF(u)),
});
const smooth = (x: number) => {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * (3 - 2 * t);
};
const FORE: W = (u) => 0.36 + 0.56 * smooth(u / 0.45);
const HIND: W = (u) => 0.88 - 0.3 * u;

function outline(w: W) {
  const { lead, trail } = profile(w);
  const N = 36;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) pts.push([i / N, lead(i / N)]);
  for (let i = N - 1; i >= 0; i--) pts.push([i / N, trail(i / N)]);
  return pts;
}

function wingGeometry(w: W, span: number, chord: number, sweepZ: number, side: number) {
  const shape = new THREE.Shape(outline(w).map(([u, v]) => new THREE.Vector2(u, v)));
  const geo = new THREE.ShapeGeometry(shape);
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i);
    const v = pos.getY(i);
    pos.setXYZ(i, side * u * span, 0.001 * u * u, -v * chord + u * sweepZ);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}

function wingSvg(w: W, seed: number) {
  const r = rng(seed);
  const { lead, trail } = profile(w);
  const P = (u: number, v: number) => `${(u * 400).toFixed(2)},${(100 - v * 100).toFixed(2)}`;
  const vv = (u: number, f: number) => lead(u) + f * (trail(u) - lead(u));
  const fr = [0, 0.1, 0.22, 0.38, 0.55, 0.72, 0.86];
  const lines: string[] = [];
  const line = (a: string, b: string) => {
    const [x1, y1] = a.split(",");
    const [x2, y2] = b.split(",");
    lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
  };
  const longs: string[] = [];
  for (const f of fr.slice(1)) {
    const p: string[] = [];
    for (let u = 0.005; u <= 0.975; u += 0.02) p.push(P(u, vv(u, f)));
    longs.push(`<polyline points="${p.join(" ")}"/>`);
  }
  for (let g = 0; g < fr.length - 1; g++) {
    let u = 0.04 + r() * 0.02;
    while (u < 0.93) {
      const u2 = u + (r() - 0.5) * 0.012;
      line(P(u, vv(u, fr[g])), P(u2, vv(u2, fr[g + 1])));
      u += 0.016 + r() * 0.016 + (g < 2 ? 0.008 : 0);
    }
  }
  let u = 0.05;
  while (u < 0.9) {
    const um = u + 0.012 + r() * 0.008;
    const u2 = um + 0.012 + r() * 0.008;
    line(P(u, vv(u, 0.86)), P(um, vv(um, 0.94)));
    line(P(um, vv(um, 0.94)), P(u2, vv(u2, 0.86)));
    const ue = um + (r() - 0.5) * 0.01;
    line(P(um, vv(um, 0.94)), P(ue, vv(ue, 1)));
    u = u2;
  }
  const costa: string[] = [];
  for (let k = 0; k <= 0.97; k += 0.02) costa.push(P(k, vv(k, 0.025)));
  const edge = outline(w)
    .map(([a, b]) => P(a, b))
    .join(" ");
  const base = [P(0, lead(0)), P(0.035, lead(0.035)), P(0.035, trail(0.035)), P(0, trail(0))].join(" ");
  const stigma = [P(0.8, vv(0.8, 0.02)), P(0.868, vv(0.868, 0.02)), P(0.868, vv(0.868, 0.15)), P(0.8, vv(0.8, 0.15))].join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
<polygon points="${base}" fill="#2e2010"/>
<g fill="none" stroke="#20170c" stroke-linecap="round" stroke-linejoin="round">
<g stroke-width="0.9">${lines.join("")}</g>
<g stroke-width="1.05">${longs.join("")}</g>
<polyline points="${costa.join(" ")}" stroke-width="2.2"/>
<polygon points="${edge}" stroke-width="1.4"/>
<line x1="${(0.42 * 400).toFixed(1)}" y1="${(100 - vv(0.42, 0) * 100).toFixed(1)}" x2="${(0.42 * 400).toFixed(1)}" y2="${(100 - vv(0.42, 0.22) * 100).toFixed(1)}" stroke-width="1.8"/>
</g>
<polygon points="${stigma}" fill="#b07a22" stroke="#1b140b" stroke-width="1"/>
</svg>`;
}

function eyeSvg() {
  const s = 2.2;
  const h = s * Math.sqrt(3);
  const f = (x: number) => x.toFixed(3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#1259b0"/><stop offset="0.3" stop-color="#1aa9d8"/>
<stop offset="0.62" stop-color="#36dcc8"/><stop offset="1" stop-color="#a8ecae"/>
</linearGradient>
<pattern id="hx" width="${f(3 * s)}" height="${f(h)}" patternUnits="userSpaceOnUse">
<path d="M0,${f(h / 2)} L${f(s / 2)},0 L${f(1.5 * s)},0 L${f(2 * s)},${f(h / 2)} L${f(1.5 * s)},${f(h)} L${f(s / 2)},${f(h)} Z M${f(2 * s)},${f(h / 2)} L${f(3 * s)},${f(h / 2)}" fill="none" stroke="#08405a" stroke-width="0.5" stroke-opacity="0.8"/>
</pattern>
</defs>
<rect width="360" height="180" fill="url(#g)"/>
<rect width="360" height="180" fill="url(#hx)"/>
<ellipse cx="85" cy="52" rx="26" ry="14" fill="#ffffff" fill-opacity="0.22"/>
<ellipse cx="270" cy="95" rx="40" ry="60" fill="#06304a" fill-opacity="0.35"/>
</svg>`;
}

function thoraxSvg() {
  // Suture lines on the +X flank (u≈0.5) and mirrored to the -X flank (x' = 180 - x, wrapped).
  const flank = [
    [
      [160, 35],
      [172, 80],
      [190, 150],
    ],
    [
      [140, 45],
      [150, 95],
      [165, 160],
    ],
    [
      [200, 40],
      [208, 90],
      [218, 140],
    ],
  ];
  const paths: string[] = [];
  const width = [2.6, 1.4, 1.2];
  flank.forEach((pts, i) => {
    for (const map of [(x: number) => x, (x: number) => 180 - x, (x: number) => 540 - x]) {
      const p = pts.map(([x, y]) => `${map(x)},${y}`);
      paths.push(`<path d="M${p[0]} Q${p[1]} ${p[2]}" fill="none" stroke="#1a2a0c" stroke-width="${width[i]}" stroke-linecap="round"/>`);
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#4f9a26"/><stop offset="0.35" stop-color="#7fd03a"/>
<stop offset="0.75" stop-color="#a8e04c"/><stop offset="1" stop-color="#d6ec7a"/></linearGradient></defs>
<rect width="360" height="180" fill="url(#g)"/>
<rect x="240" y="0" width="60" height="40" fill="#3d6a1c" fill-opacity="0.6"/>
${paths.join("\n")}
</svg>`;
}

function abdomenSvg(cum: number[], zOf: (t: number) => number, zTop: number, h: number) {
  const Hd = 530;
  const c = 16;
  const y = (z: number) => ((zTop - z) / h) * Hd;
  const prof: Array<[number, number]> = [
    [0, 2.2],
    [0.12, 2.6],
    [0.5, 3.2],
    [0.58, 7.5],
    [0.66, 5],
    [0.78, 10.5],
    [0.9, 12.5],
    [1, 13],
  ];
  const shapes: string[] = [];
  for (let k = 0; k < 10; k++) {
    const y0 = y(zOf(cum[k]));
    const y1 = y(zOf(cum[k + 1]));
    const L = y1 - y0;
    const sc = k < 2 ? 0.55 : k >= 8 ? 1.15 : 1;
    const right = prof.map(([f, w]) => `${(c + w * sc).toFixed(2)},${(y0 + f * L).toFixed(2)}`);
    const left = [...prof].reverse().map(([f, w]) => `${(c - w * sc).toFixed(2)},${(y0 + f * L).toFixed(2)}`);
    shapes.push(`<polygon points="${[...right, ...left].join(" ")}"/>`);
    shapes.push(`<rect x="0" y="${(y1 - 1.8).toFixed(2)}" width="32" height="1.8"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 ${Hd}"><g fill="#05080e">${shapes.join("")}</g>
<rect x="15.2" y="0" width="1.6" height="${Hd}" fill="#05080e"/></svg>`;
}

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });

  const cache = new Map<string, THREE.Material>();
  const gloss = (mesh: THREE.Mesh, rough: number, metal = 0.1) => {
    const src = mesh.material as THREE.MeshStandardMaterial;
    const key = `${src.uuid}|${rough}|${metal}`;
    let m = cache.get(key);
    if (!m) {
      const c = src.clone();
      c.roughness = rough;
      c.metalness = metal;
      cache.set(key, c);
      m = c;
    }
    mesh.material = m;
  };

  // ---------------- skeleton core ----------------
  b.joint("thorax", { at: [0, H + 0.001, 0.018], dir: [0, 0, 1], role: "spine" });
  b.joint("neck", { parent: "thorax", at: [0, H + 0.0015, 0.0245], dir: [0, 0, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, H + 0.0025, 0.0285], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, H - 0.0006, 0.0305], dir: [0, -0.3, 1], role: "jaw" });

  // ---------------- thorax ----------------
  const thoraxTex = svg(thoraxSvg(), { size: 512 });
  const th = b.part(new THREE.SphereGeometry(1, 16, 12), "#ffffff", {
    at: [0, H + 0.001, 0.018],
    rotation: [18, 0, 0],
    scale: [0.0048, 0.0062, 0.0064],
    texture: thoraxTex,
    bone: "thorax",
    name: "thorax",
  });
  gloss(th.mesh, 0.42, 0.05);
  // prothorax collar
  const collar = b.part(new THREE.SphereGeometry(0.0026, 10, 8), "#5b8f2a", {
    at: [0, H + 0.0012, 0.0238],
    scale: [1.2, 0.9, 0.7],
    bone: "thorax",
  });
  gloss(collar.mesh, 0.5);

  // ---------------- head ----------------
  b.capsule([0, H + 0.0015, 0.0242], [0, H + 0.0022, 0.0272], 0.0012, { color: "#33481c", bone: "neck", sides: 8 });
  const eyeTex = svg(eyeSvg(), { size: 1024 });
  for (const s of [1, -1]) {
    const e = b.part(new THREE.SphereGeometry(0.0044, 20, 14), "#ffffff", {
      at: [s * 0.0024, H + 0.0038, 0.0298],
      rotation: [0, s > 0 ? 0 : 180, 0],
      texture: eyeTex,
      bone: "head",
      name: s > 0 ? "eyeL" : "eyeR",
    });
    gloss(e.mesh, 0.15, 0.2);
  }
  b.part(new THREE.SphereGeometry(0.0026, 10, 8), "#2b2a18", { at: [0, H + 0.0022, 0.0272], bone: "head" });
  const frons = b.part(new THREE.SphereGeometry(0.0028, 12, 9), "#c4e052", {
    at: [0, H + 0.0012, 0.0335],
    scale: [1.25, 0.95, 0.8],
    bone: "head",
    name: "frons",
  });
  gloss(frons.mesh, 0.35);
  b.part(new THREE.BoxGeometry(0.0032, 0.0005, 0.0008), "#14180a", {
    at: [0, H + 0.0034, 0.0347],
    rotation: [-35, 0, 0],
    bone: "head",
  });
  // upper jaw (labrum) and mandibles on the head, lower jaw (labium) on the jaw joint
  b.part(new THREE.BoxGeometry(0.0036, 0.0012, 0.0012), "#e2e86e", {
    at: [0, H - 0.0006, 0.0352],
    rotation: [-10, 0, 0],
    bone: "head",
    name: "upperJaw",
  });
  for (const s of [1, -1])
    b.spike([s * 0.0011, H - 0.0010, 0.0348], [-s * 0.4, -0.6, 0.6], 0.0012, 0.00045, {
      color: "#2a2410",
      bone: "head",
      sides: 5,
    });
  b.part(new THREE.BoxGeometry(0.0042, 0.0009, 0.0032), "#c9bc5c", {
    at: [0, H - 0.0016, 0.0326],
    rotation: [-15, 0, 0],
    bone: "jaw",
    name: "lowerJaw",
  });
  for (const s of [1, -1])
    b.rod([s * 0.0008, H + 0.0034, 0.0336], [s * 0.0017, H + 0.0052, 0.0362], [0.00014, 0.00006], {
      color: "#111111",
      bone: "head",
      sides: 4,
    });
  for (const s of [-1, 0, 1])
    b.part(new THREE.SphereGeometry(0.00035, 6, 5), "#f4e9a0", {
      at: [s * 0.0007, H + 0.0049 - Math.abs(s) * 0.0002, 0.0318 - Math.abs(s) * 0.0006],
      bone: "head",
    });

  // ---------------- abdomen ----------------
  const z0 = 0.013;
  const z1 = -0.044;
  const abdPath = catmull([
    [0, H + 0.0002, z0],
    [0, H - 0.0002, -0.004],
    [0, H - 0.001, -0.024],
    [0, H - 0.0024, z1],
  ]);
  const abd = b.chain("abdomen", abdPath, { parent: "thorax", count: 6, role: "tail" });
  const RK: Array<[number, number]> = [
    [0, 0.0027],
    [0.05, 0.0036],
    [0.11, 0.0031],
    [0.19, 0.0019],
    [0.5, 0.002],
    [0.88, 0.0022],
    [0.97, 0.0019],
    [1, 0.0013],
  ];
  const radAt = (t: number) => {
    for (let i = 0; i < RK.length - 1; i++)
      if (t <= RK[i + 1][0]) {
        const f = smooth((t - RK[i][0]) / (RK[i + 1][0] - RK[i][0]));
        return RK[i][1] + (RK[i + 1][1] - RK[i][1]) * f;
      }
    return RK[RK.length - 1][1];
  };
  const rel = [0.05, 0.08, 0.11, 0.115, 0.115, 0.115, 0.115, 0.1, 0.07, 0.06];
  const total = rel.reduce((a, x) => a + x, 0);
  const cum = [0];
  rel.forEach((x) => cum.push(cum[cum.length - 1] + x / total));
  const DARK = "#0a1622";
  const bands: Array<[number, string]> = [];
  for (let k = 0; k < 10; k++) {
    const col = k < 2 ? "#36b8bc" : "#1a8dff";
    if (k < 9) {
      bands.push([cum[k + 1] - 0.007, col]);
      bands.push([cum[k + 1], DARK]);
    } else bands.push([1, col]);
  }
  const abdSweep = b.sweep(abd, (t: number) => [radAt(t), radAt(t) * 1.1] as [number, number], {
    bands,
    sectors: [[130, 230, "#0c5aa8"]],
    sides: 10,
  });
  abdSweep.meshes.forEach((m) => gloss(m, 0.28, 0.18));

  const zTop = 0.012;
  const zBot = -0.0445;
  const hDecal = zTop - zBot;
  const zOf = (t: number) => z0 + t * (z1 - z0);
  const abdTex = svg(abdomenSvg(cum, zOf, zTop, hDecal), { size: 1024 });
  const dec = b.decal(abdSweep, abdTex, {
    at: [0, H, (zTop + zBot) / 2],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.0032, hDecal],
    segments: [4, 72],
    lift: 0.00006,
    name: "abdomenMarkings",
  });
  gloss(dec.mesh, 0.3, 0.1);

  // anal appendages
  for (const s of [1, -1])
    b.spike([s * 0.0005, H - 0.0024, z1 + 0.0006], [s * 0.25, -0.12, -1], 0.0028, 0.0003, {
      color: "#111111",
      bone: "abdomen6",
      sides: 5,
    });
  b.spike([0, H - 0.0030, z1 + 0.0004], [0, -0.3, -1], 0.0014, 0.00025, { color: "#111111", bone: "abdomen6", sides: 4 });

  // ---------------- wings ----------------
  const membraneMat = new THREE.MeshPhysicalMaterial({
    color: "#f2dc8e",
    transparent: true,
    opacity: 0.24,
    roughness: 0.1,
    metalness: 0.0,
    iridescence: 0.9,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [200, 520],
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const foreTex = svg(wingSvg(FORE, 21), { size: 1024 });
  const hindTex = svg(wingSvg(HIND, 37), { size: 1024 });
  const veinMats = new Map<THREE.Texture, THREE.Material>();
  const wings = [
    { name: "wingFL", side: 1, fore: true },
    { name: "wingFR", side: -1, fore: true },
    { name: "wingHL", side: 1, fore: false },
    { name: "wingHR", side: -1, fore: false },
  ];
  for (const w of wings) {
    const root: [number, number, number] = w.fore
      ? [w.side * 0.0026, H + 0.0062, 0.0205]
      : [w.side * 0.0026, H + 0.0056, 0.0138];
    b.joint(w.name, { parent: "thorax", at: root, dir: [w.side, 0, 0], role: "wing" });
    b.part(new THREE.SphereGeometry(0.0008, 8, 6), "#2b2a16", { at: root, bone: w.name });
    const geo = w.fore
      ? wingGeometry(FORE, 0.048, 0.011, 0.004, w.side)
      : wingGeometry(HIND, 0.046, 0.015, -0.002, w.side);
    const mem = b.part(geo, "#f2dc8e", { at: root, bone: w.name, name: `${w.name}Membrane` });
    mem.mesh.material = membraneMat;
    mem.mesh.renderOrder = 2;
    const tex = w.fore ? foreTex : hindTex;
    const vein = b.part(geo, "#ffffff", {
      at: [root[0], root[1] + 0.00006, root[2]],
      bone: w.name,
      texture: tex,
      name: `${w.name}Veins`,
    });
    let vm = veinMats.get(tex);
    if (!vm) {
      const c = (vein.mesh.material as THREE.MeshStandardMaterial).clone();
      c.side = THREE.DoubleSide;
      c.roughness = 0.35;
      veinMats.set(tex, c);
      vm = c;
    }
    vein.mesh.material = vm;
  }

  // ---------------- legs (tucked forward under the thorax) ----------------
  const pairs = [
    { n: "F", z: 0.021, y: H - 0.0034, k: 0.85 },
    { n: "M", z: 0.018, y: H - 0.0040, k: 1.0 },
    { n: "H", z: 0.015, y: H - 0.0042, k: 1.2 },
  ];
  for (const p of pairs)
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const k = p.k;
      const root = new THREE.Vector3(s * 0.0016, p.y, p.z);
      const knee = root.clone().add(new THREE.Vector3(s * 0.0028 * k, -0.003 * k, 0.0022 * k));
      const ankle = knee.clone().add(new THREE.Vector3(s * 0.0008 * k, -0.0034 * k, 0.0016 * k));
      const foot = ankle.clone().add(new THREE.Vector3(s * 0.0004 * k, -0.0006 * k, 0.0026 * k));
      const leg = b.chain(`leg${p.n}${S}`, [root, knee, ankle, foot], {
        parent: "thorax",
        names: [`hip${p.n}${S}`, `knee${p.n}${S}`, `ankle${p.n}${S}`, `foot${p.n}${S}`],
        role: "leg",
      });
      const sw = b.sweep(leg, (t: number) => 0.00042 - 0.0002 * t, { color: "#131313", sides: 6 });
      sw.meshes.forEach((m) => gloss(m, 0.4, 0.1));
      for (const t of [0.42, 0.52, 0.62, 0.72]) {
        const pt = leg.at(t);
        b.spike(pt.at, [-s * 0.4, -0.5, -0.6], 0.0009, 0.00007, {
          color: "#1c1c1c",
          bone: leg.jointAt(t),
          sides: 3,
        });
      }
      for (const c of [1, -1])
        b.spike(foot, [c * 0.3, -0.8, 0.5], 0.0006, 0.00008, { color: "#2a2a2a", bone: `foot${p.n}${S}`, sides: 3 });
    }

  return b.root;
}
```