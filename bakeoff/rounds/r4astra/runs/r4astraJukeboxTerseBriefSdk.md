```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Orbit 45 Jukebox",
  description:
    "A full-size, Art Deco jukebox in mahogany, petrol-blue enamel, cherry red and warm brass, with an amber horseshoe surround, visible record, printed song selections and a detailed cathedral speaker grille."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Orbit 45 Jukebox" });
  const chassis = b.joint("chassis", { at: [0, 0, 0] });
  const random = rng(45015);

  const C = {
    wood: "#633026",
    woodLight: "#874333",
    woodDark: "#391f1b",
    red: "#a3372b",
    redDark: "#682a27",
    gold: "#c69a54",
    goldDark: "#805b35",
    goldLight: "#edcf8d",
    chrome: "#becfcb",
    chromeLight: "#edf1dd",
    teal: "#205458",
    tealLight: "#377073",
    glass: "#152e34",
    black: "#131c20",
    groove: "#304044",
    mesh: "#46594f",
    amber: "#efb448",
    amberLight: "#ffe09a",
    glow: "#fff1c1",
    ivory: "#f7e8c5",
    paper: "#e8d8ae",
    ink: "#364748",
    rubber: "#202020"
  };

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: number[] = [0, 0, 0]
  ) {
    return b.part(geometry, color, { at, bone: chassis });
  }

  function box(
    x: number, y: number, z: number,
    w: number, h: number, d: number, color: string
  ) {
    return part(new THREE.BoxGeometry(w, h, d), color, [x, y, z]);
  }

  function extruded(shape: THREE.Shape, depth: number) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 4
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  function roundedShape(w: number, h: number, radius: number) {
    const r = Math.min(radius, w / 2, h / 2);
    const x = -w / 2, y = -h / 2;
    const s = new THREE.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    s.closePath();
    return s;
  }

  function plate(
    x: number, y: number, z: number,
    w: number, h: number, d: number, r: number, color: string
  ) {
    return part(extruded(roundedShape(w, h, r), d), color, [x, y, z]);
  }

  function archShape(r: number, spring: number, bottom: number) {
    const s = new THREE.Shape();
    s.moveTo(-r, bottom);
    s.lineTo(-r, spring);
    for (let i = 0; i <= 36; i++) {
      const a = Math.PI - i * Math.PI / 36;
      s.lineTo(r * Math.cos(a), spring + r * Math.sin(a));
    }
    s.lineTo(r, bottom);
    s.closePath();
    return s;
  }

  function arch(
    r: number, spring: number, bottom: number,
    z: number, depth: number, color: string
  ) {
    return part(extruded(archShape(r, spring, bottom), depth), color, [0, 0, z]);
  }

  function archBand(
    outer: number, inner: number, spring: number, bottom: number,
    z: number, depth: number, color: string
  ) {
    const s = new THREE.Shape();
    s.moveTo(-outer, bottom);
    s.lineTo(-outer, spring);
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI - Math.PI * i / 40;
      s.lineTo(outer * Math.cos(a), spring + outer * Math.sin(a));
    }
    s.lineTo(outer, bottom);
    s.lineTo(inner, bottom);
    s.lineTo(inner, spring);
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI * i / 40;
      s.lineTo(inner * Math.cos(a), spring + inner * Math.sin(a));
    }
    s.lineTo(-inner, bottom);
    s.closePath();
    return part(extruded(s, depth), color, [0, 0, z]);
  }

  function segment(
    x1: number, y1: number, x2: number, y2: number,
    z: number, width: number, depth: number, color: string
  ) {
    const dx = x2 - x1, dy = y2 - y1;
    const g = new THREE.BoxGeometry(Math.hypot(dx, dy), width, depth);
    g.rotateZ(Math.atan2(dy, dx));
    return part(g, color, [(x1 + x2) / 2, (y1 + y2) / 2, z]);
  }

  function disk(
    x: number, y: number, z: number,
    r: number, depth: number, color: string, sides = 32
  ) {
    const g = new THREE.CylinderGeometry(r, r, depth, sides, 1);
    g.rotateX(Math.PI / 2);
    return part(g, color, [x, y, z]);
  }

  function ring(
    x: number, y: number, z: number,
    radius: number, tube: number, color: string, segments = 40
  ) {
    return part(
      new THREE.TorusGeometry(radius, tube, 5, segments),
      color, [x, y, z]
    );
  }

  function screw(x: number, y: number, z: number, radius = 0.004) {
    disk(x, y, z, radius, 0.003, C.chrome, 10);
    const a = random() * Math.PI;
    segment(
      x - Math.cos(a) * radius * 0.65,
      y - Math.sin(a) * radius * 0.65,
      x + Math.cos(a) * radius * 0.65,
      y + Math.sin(a) * radius * 0.65,
      z + 0.002, radius * 0.22, 0.001, C.ink
    );
  }

  // A small geometric signwriter's alphabet: real raised strokes, not a font dependency.
  const letters: Record<string, number[][][]> = {
    O: [[[0.18, 0], [0.82, 0], [1, 0.2], [1, 0.8], [0.82, 1], [0.18, 1], [0, 0.8], [0, 0.2], [0.18, 0]]],
    R: [[[0, 0], [0, 1], [0.75, 1], [1, 0.8], [1, 0.64], [0.75, 0.5], [0, 0.5]], [[0.48, 0.5], [1, 0]]],
    B: [[[0, 0], [0, 1], [0.72, 1], [1, 0.83], [1, 0.67], [0.72, 0.51], [0, 0.51]], [[0.72, 0.51], [1, 0.34], [1, 0.17], [0.72, 0], [0, 0]]],
    I: [[[0, 1], [1, 1]], [[0.5, 1], [0.5, 0]], [[0, 0], [1, 0]]],
    T: [[[0, 1], [1, 1]], [[0.5, 1], [0.5, 0]]],
    S: [[[1, 0.9], [0.8, 1], [0.2, 1], [0, 0.8], [0, 0.62], [0.2, 0.5], [0.8, 0.5], [1, 0.35], [1, 0.2], [0.8, 0], [0.2, 0], [0, 0.1]]],
    E: [[[1, 1], [0, 1], [0, 0], [1, 0]], [[0, 0.5], [0.8, 0.5]]],
    H: [[[0, 0], [0, 1]], [[1, 0], [1, 1]], [[0, 0.5], [1, 0.5]]],
    F: [[[0, 0], [0, 1], [1, 1]], [[0, 0.5], [0.8, 0.5]]],
    "-": [[[0, 0.5], [1, 0.5]]],
    "0": [[[0.2, 0], [0.8, 0], [1, 0.2], [1, 0.8], [0.8, 1], [0.2, 1], [0, 0.8], [0, 0.2], [0.2, 0]]],
    "1": [[[0.1, 0.75], [0.55, 1], [0.55, 0]], [[0.15, 0], [0.95, 0]]],
    "2": [[[0, 0.8], [0.2, 1], [0.8, 1], [1, 0.8], [1, 0.65], [0, 0], [1, 0]]],
    "3": [[[0, 1], [0.8, 1], [1, 0.8], [0.65, 0.5], [1, 0.25], [0.8, 0], [0, 0]], [[0.3, 0.5], [0.65, 0.5]]],
    "4": [[[0.8, 0], [0.8, 1]], [[0.65, 1], [0, 0.35], [1, 0.35]]],
    "5": [[[1, 1], [0, 1], [0, 0.55], [0.8, 0.55], [1, 0.35], [1, 0.18], [0.8, 0], [0, 0]]],
    "6": [[[0.9, 1], [0.25, 1], [0, 0.7], [0, 0.2], [0.2, 0], [0.8, 0], [1, 0.2], [1, 0.45], [0.8, 0.6], [0, 0.6]]],
    "7": [[[0, 1], [1, 1], [0.3, 0]]],
    "8": [[[0.2, 0.5], [0, 0.7], [0, 0.85], [0.2, 1], [0.8, 1], [1, 0.85], [1, 0.7], [0.8, 0.5], [0.2, 0.5], [0, 0.3], [0, 0.15], [0.2, 0], [0.8, 0], [1, 0.15], [1, 0.3], [0.8, 0.5]]],
    "9": [[[1, 0.4], [0.2, 0.4], [0, 0.6], [0, 0.8], [0.2, 1], [0.8, 1], [1, 0.8], [1, 0.2], [0.8, 0], [0.1, 0]]]
  };

  function text(
    word: string, cx: number, cy: number, z: number,
    height: number, color: string, thickness = height * 0.095
  ) {
    const w = height * 0.59;
    const advance = w * 1.42;
    const total = (word.length - 1) * advance + w;
    for (let i = 0; i < word.length; i++) {
      const glyph = letters[word[i]];
      if (!glyph) continue;
      const left = cx - total / 2 + i * advance;
      for (const path of glyph) {
        for (let j = 1; j < path.length; j++) {
          segment(
            left + path[j - 1][0] * w, cy + (path[j - 1][1] - 0.5) * height,
            left + path[j][0] * w, cy + (path[j][1] - 0.5) * height,
            z, thickness, 0.0016, color
          );
        }
      }
    }
  }

  // The weight-bearing cabinet, stepped plinth, and four rubber feet.
  for (const x of [-0.40, 0.40]) {
    for (const z of [-0.225, 0.255]) {
      box(x, 0.026, z, 0.13, 0.052, 0.13, C.rubber);
    }
  }
  box(0, 0.078, 0.025, 1.085, 0.096, 0.685, C.woodDark);
  box(0, 0.127, 0.025, 1.045, 0.040, 0.650, C.woodLight);
  box(0, 0.148, 0.025, 1.015, 0.023, 0.625, C.goldDark);

  arch(0.513, 1.155, 0.139, -0.013, 0.550, C.wood);
  arch(0.496, 1.155, 0.150, -0.294, 0.035, C.woodDark);
  archBand(0.518, 0.505, 1.155, 0.14, -0.268, 0.019, C.woodLight);
  archBand(0.520, 0.510, 1.155, 0.14, 0.204, 0.020, C.woodDark);
  archBand(0.524, 0.508, 1.155, 0.14, 0.266, 0.032, C.goldDark);

  // Side inlays remain fully modeled for three-quarter and rear views.
  for (const side of [-1, 1]) {
    const sidePlate = (
      width: number, height: number, depth: number,
      radius: number, x: number, y: number, z: number, color: string
    ) => {
      const g = extruded(roundedShape(width, height, radius), depth);
      g.rotateY(side * Math.PI / 2);
      part(g, color, [side * x, y, z]);
    };
    sidePlate(0.444, 0.929, 0.012, 0.052, 0.516, 0.652, -0.019, C.goldDark);
    sidePlate(0.420, 0.903, 0.015, 0.048, 0.523, 0.652, -0.019, C.woodDark);
    sidePlate(0.378, 0.861, 0.015, 0.039, 0.531, 0.652, -0.019, C.teal);

    for (let j = 0; j < 5; j++) {
      const dz = (j - 2) * 0.058;
      box(side * 0.541, 0.636, -0.019 + dz, 0.005, 0.57 - Math.abs(j - 2) * 0.07, 0.006, C.goldDark);
    }
    for (let j = 0; j < 3; j++) {
      box(side * 0.545, 0.842 + j * 0.025, -0.019, 0.010, 0.009, 0.245 - j * 0.045, C.gold);
      box(side * 0.545, 0.420 - j * 0.025, -0.019, 0.010, 0.009, 0.245 - j * 0.045, C.gold);
    }
    const jewel = new THREE.BoxGeometry(0.009, 0.055, 0.055);
    jewel.rotateX(Math.PI / 4);
    part(jewel, C.goldLight, [side * 0.548, 0.632, -0.019]);
    for (let j = 0; j < 7; j++) {
      box(
        side * 0.515, 0.66, -0.247 + j * 0.011,
        0.003, 0.73 + random() * 0.10, 0.0015,
        j % 2 ? C.woodLight : C.woodDark
      );
    }
  }

  // Front enamel field and the layered cherry / brass horseshoe.
  arch(0.502, 1.155, 0.149, 0.282, 0.032, C.redDark);
  arch(0.396, 1.155, 0.154, 0.309, 0.027, C.teal);
  archBand(0.514, 0.494, 1.155, 0.153, 0.304, 0.035, C.gold);
  archBand(0.494, 0.399, 1.155, 0.160, 0.319, 0.027, C.red);
  archBand(0.493, 0.484, 1.155, 0.160, 0.340, 0.015, C.goldLight);
  archBand(0.407, 0.391, 1.155, 0.169, 0.342, 0.020, C.gold);
  archBand(0.391, 0.378, 1.155, 0.174, 0.338, 0.012, C.ivory);

  function horseshoe(radius: number, z: number) {
    const pts: number[][] = [[-radius, 0.19, z], [-radius, 1.155, z]];
    for (let i = 1; i <= 40; i++) {
      const a = Math.PI - i * Math.PI / 40;
      pts.push([radius * Math.cos(a), 1.155 + radius * Math.sin(a), z]);
    }
    pts.push([radius, 0.19, z]);
    return pts;
  }

  b.sweep(horseshoe(0.447, 0.341), 0.032, { color: C.amber });
  b.sweep(horseshoe(0.445, 0.367), 0.011, { color: C.amberLight });
  b.sweep(horseshoe(0.434, 0.365), 0.0045, { color: C.glow });

  // Metal partitions wrap all the way around the curved amber moulding.
  for (let i = 0; i <= 12; i++) {
    const a = i * Math.PI / 12;
    const g = new THREE.TorusGeometry(0.033, 0.0033, 4, 12);
    g.rotateX(Math.PI / 2);
    g.rotateZ(a);
    part(g, C.gold, [0.447 * Math.cos(a), 1.155 + 0.447 * Math.sin(a), 0.341]);
  }
  for (const side of [-1, 1]) {
    for (const y of [0.29, 0.41, 0.53, 0.65, 0.89, 1.015]) {
      const g = new THREE.TorusGeometry(0.033, 0.0025, 4, 12);
      g.rotateX(Math.PI / 2);
      part(g, C.gold, [side * 0.447, y, 0.341]);
    }
    for (const y of [0.199, 0.768, 1.116]) {
      plate(side * 0.447, y, 0.361, 0.103, 0.043, 0.043, 0.008, C.goldDark);
      plate(side * 0.447, y, 0.385, 0.099, 0.032, 0.015, 0.006, C.redDark);
      box(side * 0.447, y - 0.017, 0.395, 0.097, 0.006, 0.007, C.goldLight);
      box(side * 0.447, y + 0.017, 0.395, 0.097, 0.006, 0.007, C.goldLight);
    }
  }

  // Curved viewing window, turntable and mechanical tonearm.
  arch(0.363, 1.143, 0.982, 0.338, 0.017, C.gold);
  arch(0.347, 1.143, 0.997, 0.350, 0.014, C.glass);
  archBand(0.350, 0.344, 1.143, 0.999, 0.362, 0.006, C.chrome);

  for (const side of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      segment(
        side * (0.198 + j * 0.027), 1.237,
        side * (0.159 + j * 0.032), 1.370 - j * 0.020,
        0.367, 0.007, 0.005, j % 2 ? C.goldDark : C.tealLight
      );
    }
  }

  disk(0, 1.328, 0.368, 0.119, 0.020, C.goldDark, 48);
  disk(0, 1.328, 0.381, 0.113, 0.012, C.chrome, 48);
  disk(0, 1.328, 0.390, 0.107, 0.009, C.black, 48);
  for (const r of [0.099, 0.091, 0.081, 0.070, 0.057]) {
    ring(0, 1.328, 0.396, r, 0.0009, C.groove, 48);
  }
  disk(0, 1.328, 0.398, 0.042, 0.005, C.red, 32);
  ring(0, 1.328, 0.402, 0.038, 0.0014, C.goldLight, 32);
  text("45", 0, 1.337, 0.403, 0.018, C.ivory, 0.0018);
  box(0, 1.309, 0.403, 0.023, 0.002, 0.001, C.goldLight);
  disk(0, 1.328, 0.408, 0.004, 0.012, C.chromeLight, 12);

  disk(0.232, 1.270, 0.374, 0.022, 0.018, C.goldDark, 16);
  disk(0.232, 1.270, 0.388, 0.013, 0.014, C.chrome, 12);
  segment(0.232, 1.270, 0.213, 1.371, 0.393, 0.011, 0.012, C.chrome);
  segment(0.213, 1.371, 0.105, 1.347, 0.399, 0.011, 0.012, C.chromeLight);
  segment(0.105, 1.347, 0.076, 1.320, 0.404, 0.010, 0.012, C.chrome);
  const cartridge = new THREE.BoxGeometry(0.027, 0.013, 0.017);
  cartridge.rotateZ(-0.52);
  part(cartridge, C.redDark, [0.073, 1.319, 0.415]);
  for (let j = 0; j < 3; j++) {
    box(-0.246, 1.279 + j * 0.016, 0.376, 0.064 - j * 0.012, 0.005, 0.005, C.chrome);
  }

  // Winged enamel manufacturer's badge.
  for (let i = 0; i < 3; i++) {
    plate(0, 1.445 + i * 0.017, 0.396, 0.362 - i * 0.035, 0.008, 0.012, 0.003, C.gold);
  }
  plate(0, 1.462, 0.408, 0.276, 0.078, 0.018, 0.022, C.goldLight);
  plate(0, 1.462, 0.420, 0.259, 0.061, 0.011, 0.016, C.redDark);
  text("ORBIT", 0, 1.463, 0.428, 0.044, C.ivory, 0.0038);
  disk(-0.113, 1.462, 0.429, 0.003, 0.002, C.gold, 8);
  disk(0.113, 1.462, 0.429, 0.003, 0.002, C.gold, 8);

  // Two banks of individual paper title strips, with printed indices and tiny text.
  plate(0, 1.103, 0.370, 0.639, 0.228, 0.017, 0.009, C.goldDark);
  plate(0, 1.103, 0.381, 0.622, 0.213, 0.009, 0.006, C.black);
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 5; row++) {
      const x = side * 0.158, y = 1.188 - row * 0.042;
      plate(x, y, 0.391, 0.293, 0.034, 0.009, 0.003, C.gold);
      plate(x, y, 0.397, 0.281, 0.028, 0.004, 0.001, row % 2 ? C.paper : C.ivory);
      const left = x - 0.140;
      box(left + 0.021, y, 0.401, 0.029, 0.024, 0.002, C.redDark);
      const n = side < 0 ? row + 1 : (row + 6) % 10;
      text(String(n), left + 0.021, y, 0.403, 0.014, C.ivory, 0.0012);

      const tx = left + 0.044;
      let cursor = tx;
      const firstLengths = [0.042, 0.034, 0.046];
      for (let k = 0; k < 3; k++) {
        const len = firstLengths[k] * (0.80 + random() * 0.30);
        box(cursor + len / 2, y + 0.005, 0.401, len, 0.0023, 0.001, C.ink);
        cursor += len + 0.008;
      }
      box(tx + 0.055, y - 0.005, 0.401, 0.11 + random() * 0.044, 0.0014, 0.001, C.goldDark);
      box(x + 0.128, y, 0.402, 0.003, 0.023, 0.002, C.goldDark);
    }
  }
  box(0, 1.103, 0.406, 0.010, 0.219, 0.010, C.chrome);
  for (const x of [-0.308, 0.308]) {
    screw(x, 1.201, 0.406, 0.003);
    screw(x, 1.005, 0.406, 0.003);
  }

  // Projecting selector rail, ivory keys, coin slot and red reject button.
  plate(0, 0.920, 0.361, 0.811, 0.113, 0.083, 0.023, C.goldDark);
  plate(0, 0.925, 0.406, 0.802, 0.098, 0.024, 0.017, C.chrome);
  plate(0, 0.925, 0.422, 0.774, 0.075, 0.018, 0.011, C.teal);
  plate(0, 0.917, 0.435, 0.582, 0.058, 0.009, 0.007, C.black);
  for (let i = 0; i < 10; i++) {
    const x = (i - 4.5) * 0.055;
    plate(x, 0.916, 0.442, 0.046, 0.046, 0.019, 0.006, C.goldDark);
    plate(x, 0.920, 0.452, 0.042, 0.039, 0.012, 0.004, C.ivory);
    box(x, 0.904, 0.459, 0.033, 0.003, 0.002, C.paper);
    text(String((i + 1) % 10), x, 0.922, 0.460, 0.016, C.ink, 0.00145);
  }
  disk(-0.342, 0.923, 0.438, 0.023, 0.018, C.gold, 20);
  disk(-0.342, 0.923, 0.452, 0.017, 0.019, C.red, 16);
  disk(-0.347, 0.929, 0.463, 0.004, 0.002, C.goldLight, 8);
  plate(0.341, 0.925, 0.440, 0.057, 0.057, 0.014, 0.006, C.goldLight);
  box(0.341, 0.922, 0.450, 0.036, 0.006, 0.004, C.black);
  text("25", 0.341, 0.940, 0.450, 0.010, C.ink, 0.0011);
  box(0, 0.970, 0.409, 0.691, 0.006, 0.010, C.goldLight);
  plate(0, 0.852, 0.342, 0.258, 0.034, 0.013, 0.009, C.redDark);
  text("STEREO", 0, 0.852, 0.351, 0.017, C.goldLight, 0.0016);

  // Cathedral-shaped lower speaker with a fine, clipped diamond weave.
  arch(0.325, 0.511, 0.211, 0.335, 0.032, C.goldDark);
  arch(0.314, 0.511, 0.222, 0.358, 0.019, C.goldLight);
  arch(0.300, 0.511, 0.235, 0.371, 0.013, C.black);
  const clothR = 0.296;
  function insideCloth(x: number, y: number) {
    if (y < 0.239 || y > 0.511 + clothR) return false;
    const extent = y <= 0.511
      ? clothR
      : Math.sqrt(Math.max(0, clothR * clothR - (y - 0.511) ** 2));
    return Math.abs(x) <= extent - 0.003;
  }
  for (const slope of [-0.76, 0.76]) {
    for (let k = -28; k <= 28; k++) {
      const intercept = k * 0.026;
      let first: number[] | null = null;
      let last: number[] | null = null;
      for (let j = 0; j <= 230; j++) {
        const y = 0.239 + j * (0.567 / 230);
        const x = intercept + slope * (y - 0.239);
        if (insideCloth(x, y)) {
          if (!first) first = [x, y];
          last = [x, y];
        }
      }
      if (first && last && last[1] - first[1] > 0.007) {
        segment(first[0], first[1], last[0], last[1], 0.381, 0.00165, 0.002, C.mesh);
      }
    }
  }

  for (let i = -5; i <= 5; i++) {
    const x = i * 0.052;
    const bottom = 0.246;
    const top = 0.511 + Math.sqrt(0.298 ** 2 - x * x) - 0.010;
    box(x, (bottom + top) / 2, 0.395, 0.013, top - bottom, 0.022, C.gold);
    box(x - 0.0028, (bottom + top) / 2, 0.408, 0.0035, top - bottom, 0.005, C.goldLight);
  }
  for (const y of [0.336, 0.476]) {
    segment(-0.290, y + 0.115, 0, y, 0.417, 0.023, 0.018, C.goldDark);
    segment(0, y, 0.290, y + 0.115, 0.417, 0.023, 0.018, C.goldDark);
    segment(-0.290, y + 0.119, 0, y + 0.004, 0.430, 0.011, 0.009, C.chrome);
    segment(0, y + 0.004, 0.290, y + 0.119, 0.430, 0.011, 0.009, C.chrome);
  }
  box(0, 0.244, 0.408, 0.585, 0.020, 0.030, C.gold);
  box(0, 0.247, 0.426, 0.564, 0.004, 0.006, C.goldLight);

  // Winged 45-rpm medallion, standing proud of the grille.
  for (let i = 0; i < 3; i++) {
    plate(0, 0.713 - i * 0.015, 0.423, 0.226 - i * 0.031, 0.008, 0.013, 0.003, C.goldLight);
  }
  disk(0, 0.703, 0.428, 0.047, 0.026, C.goldDark, 24);
  disk(0, 0.703, 0.445, 0.040, 0.012, C.goldLight, 24);
  disk(0, 0.703, 0.454, 0.034, 0.009, C.redDark, 24);
  text("45", 0, 0.704, 0.460, 0.028, C.ivory, 0.0021);

  // Narrow utility panels nest between the speaker and light columns.
  for (const side of [-1, 1]) {
    plate(side * 0.351, 0.472, 0.341, 0.044, 0.237, 0.019, 0.012, C.goldDark);
    plate(side * 0.351, 0.472, 0.354, 0.033, 0.219, 0.010, 0.008, C.chrome);
    screw(side * 0.351, 0.568, 0.362, 0.0035);
    screw(side * 0.351, 0.375, 0.362, 0.0035);
  }
  plate(0.351, 0.438, 0.363, 0.026, 0.064, 0.007, 0.005, C.black);
  box(0.351, 0.408, 0.375, 0.032, 0.009, 0.025, C.chrome);
  box(0.351, 0.508, 0.364, 0.022, 0.004, 0.006, C.black);
  for (let i = 0; i < 3; i++) {
    plate(-0.361 + i * 0.010, 0.469, 0.363, 0.004, 0.117, 0.004, 0.002, C.black);
  }

  // Ribbed kick plate.
  plate(0, 0.169, 0.342, 0.850, 0.043, 0.035, 0.009, C.goldDark);
  plate(0, 0.172, 0.364, 0.817, 0.030, 0.013, 0.006, C.chrome);
  for (const y of [0.166, 0.176]) {
    box(0, y, 0.373, 0.778, 0.0025, 0.004, C.ink);
  }
  plate(0, 0.171, 0.378, 0.120, 0.032, 0.010, 0.006, C.redDark);
  text("HI-FI", 0, 0.171, 0.385, 0.014, C.ivory, 0.0013);

  // Rear access hatch, louvers and carry recess complete the cabinet.
  plate(0, 0.631, -0.317, 0.722, 0.865, 0.022, 0.025, C.woodLight);
  plate(0, 0.631, -0.332, 0.679, 0.823, 0.012, 0.018, C.woodDark);
  for (let i = 0; i < 7; i++) {
    box(0, 0.750 + i * 0.032, -0.342, 0.446, 0.013, 0.010, C.black);
    box(0, 0.758 + i * 0.032, -0.349, 0.452, 0.005, 0.016, C.woodLight);
  }
  plate(0, 0.390, -0.343, 0.174, 0.088, 0.005, 0.003, C.goldDark);
  for (let i = 0; i < 4; i++) {
    box(0, 0.366 + i * 0.015, -0.347, 0.118 - (i % 2) * 0.021, 0.003, 0.003, C.paper);
  }
  for (const x of [-0.316, 0.316]) {
    for (const y of [0.251, 1.009]) {
      disk(x, y, -0.343, 0.005, 0.006, C.gold, 10);
    }
  }
  plate(0, 1.280, -0.313, 0.247, 0.063, 0.019, 0.014, C.goldDark);
  plate(0, 1.280, -0.326, 0.211, 0.035, 0.011, 0.010, C.black);
  box(0, 1.292, -0.341, 0.177, 0.012, 0.031, C.woodLight);

  return b.root;
}
```