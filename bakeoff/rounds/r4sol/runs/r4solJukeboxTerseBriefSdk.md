```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Starlight Jukebox",
  description:
    "An Art Deco diner jukebox with amber illuminated arches, turquoise accents, a visible vinyl record, individual song cards and ivory selection keys, and a brass sunburst speaker grille."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Starlight Jukebox" });
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    wood: "#482631",
    woodEdge: "#271b25",
    wine: "#732d3b",
    sideWood: "#81433f",
    woodLight: "#aa6550",
    brass: "#bd883c",
    gold: "#e4b759",
    goldLight: "#f5d58e",
    chrome: "#b9d0cb",
    chromeLight: "#e3ede3",
    chromeDark: "#5c797b",
    amber: "#f6aa38",
    orange: "#d77229",
    honey: "#ffcf68",
    glowCream: "#fff1b0",
    teal: "#267c7b",
    tealDark: "#174c55",
    aqua: "#68d6c3",
    red: "#c74d43",
    darkRed: "#792b39",
    glass: "#142c36",
    black: "#111a20",
    vinyl: "#19232c",
    groove: "#37474d",
    cloth: "#293738",
    paper: "#f8edce",
    paperAlt: "#e9dfba",
    ink: "#35403d"
  };

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number
  ) {
    return b.part(geometry, color, { at: [x, y, z], bone: cabinet });
  }

  function box(
    w: number, h: number, d: number,
    x: number, y: number, z: number, color: string
  ) {
    return part(new THREE.BoxGeometry(w, h, d), color, x, y, z);
  }

  function polygon(
    points: number[][],
    depth: number,
    color: string,
    z: number,
    bevel = 0
  ) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1]);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1
    });
    g.translate(0, 0, -depth / 2);
    return part(g, color, 0, 0, z);
  }

  function roundedBox(
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    color: string, r = 0.006, bevel = 0.0015
  ) {
    r = Math.min(r, w / 3, h / 3);
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: d,
      steps: 1,
      curveSegments: 2,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1
    });
    g.translate(0, 0, -d / 2);
    return part(g, color, x, y, z);
  }

  function disc(
    r: number, d: number,
    x: number, y: number, z: number,
    color: string, segments = 32
  ) {
    const g = new THREE.CylinderGeometry(r, r, d, segments);
    g.rotateX(Math.PI / 2);
    return part(g, color, x, y, z);
  }

  function ring(
    r: number, tube: number,
    x: number, y: number, z: number,
    color: string, segments = 40
  ) {
    return part(
      new THREE.TorusGeometry(r, tube, 4, segments),
      color, x, y, z
    );
  }

  function rod(
    x1: number, y1: number, x2: number, y2: number,
    radius: number, z: number, color: string, sides = 6
  ) {
    const dx = x2 - x1, dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length < 0.000001) return;
    const g = new THREE.CylinderGeometry(radius, radius, length, sides);
    g.rotateZ(-Math.atan2(dx, dy));
    return part(g, color, (x1 + x2) / 2, (y1 + y2) / 2, z);
  }

  const spring = 1.065;

  function archOutline(radius: number, bottom: number, springY = spring) {
    const pts: number[][] = [[-radius, bottom], [-radius, springY]];
    for (let i = 1; i <= 32; i++) {
      const a = Math.PI - Math.PI * i / 32;
      pts.push([Math.cos(a) * radius, springY + Math.sin(a) * radius]);
    }
    pts.push([radius, bottom]);
    return pts;
  }

  function archBand(
    outside: number, inside: number, bottom: number,
    depth: number, z: number, color: string,
    bevel = 0
  ) {
    const pts = archOutline(outside, bottom);
    pts.push([inside, bottom], [inside, spring]);
    for (let i = 1; i <= 32; i++) {
      const a = Math.PI * i / 32;
      pts.push([Math.cos(a) * inside, spring + Math.sin(a) * inside]);
    }
    pts.push([-inside, bottom]);
    return polygon(pts, depth, color, z, bevel);
  }

  // Small planar, geometric lettering: these are painted-looking strokes,
  // not external fonts or browser-dependent textures.
  const glyph: Record<string, string> = {
    A: "0,0 2,6 4,0|0.9,2.4 3.1,2.4",
    B: "0,0 0,6 2.8,6 4,5 4,4 2.8,3 0,3|2.8,3 4,2 4,1 2.8,0 0,0",
    C: "4,5.4 3.1,6 1,6 0,5 0,1 1,0 3.1,0 4,0.6",
    D: "0,0 0,6 2.5,6 4,4.8 4,1.2 2.5,0 0,0",
    E: "4,6 0,6 0,0 4,0|0,3 3.3,3",
    F: "0,0 0,6 4,6|0,3 3.3,3",
    G: "4,5.4 3.1,6 1,6 0,5 0,1 1,0 4,0 4,2.8 2.3,2.8",
    H: "0,0 0,6|4,0 4,6|0,3 4,3",
    I: "0.6,6 3.4,6|2,6 2,0|0.6,0 3.4,0",
    J: "0,1 1,0 3,0 4,1 4,6|1.5,6 4,6",
    K: "0,0 0,6|4,6 0,2.6 4,0",
    L: "0,6 0,0 4,0",
    M: "0,0 0,6 2,3.2 4,6 4,0",
    N: "0,0 0,6 4,0 4,6",
    O: "1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0",
    P: "0,0 0,6 3,6 4,5 4,4 3,3 0,3",
    Q: "1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0|2.5,1.6 4.4,-0.4",
    R: "0,0 0,6 3,6 4,5 4,4 3,3 0,3|2.1,3 4,0",
    S: "4,5.5 3,6 1,6 0,5 0,4 1,3 3,3 4,2 4,1 3,0 1,0 0,0.5",
    T: "0,6 4,6|2,6 2,0",
    U: "0,6 0,1 1,0 3,0 4,1 4,6",
    V: "0,6 2,0 4,6",
    W: "0,6 0.7,0 2,3 3.3,0 4,6",
    X: "0,6 4,0|4,6 0,0",
    Y: "0,6 2,3 4,6|2,3 2,0",
    Z: "0,6 4,6 0,0 4,0",
    "0": "1,0 0,1 0,5 1,6 3,6 4,5 4,1 3,0 1,0|0.7,1 3.3,5",
    "1": "0.8,4.7 2,6 2,0|0.5,0 3.5,0",
    "2": "0,5 1,6 3,6 4,5 4,4 0,0 4,0",
    "3": "0,6 4,6 2.2,3.2 4,2 4,1 3,0 0,0",
    "4": "3.2,0 3.2,6 0,2 4,2",
    "5": "4,6 0,6 0,3.2 3,3.2 4,2.3 4,1 3,0 0,0",
    "6": "4,6 1,6 0,5 0,1 1,0 3,0 4,1 4,2.5 3,3.4 0,3.4",
    "7": "0,6 4,6 1.2,0",
    "8": "1,3 0,4 0,5 1,6 3,6 4,5 4,4 3,3 1,3 0,2 0,1 1,0 3,0 4,1 4,2 3,3",
    "9": "4,2.6 1,2.6 0,3.5 0,5 1,6 3,6 4,5 4,1 3,0 0,0",
    "-": "0.5,3 3.5,3",
    ".": "1.8,0 2.2,0"
  };

  function text(
    str: string, height: number, color: string,
    x: number, y: number, z: number,
    targetWidth?: number, backwards = false
  ) {
    const charWidth = height * 0.60;
    const gap = height * 0.20;
    const advances = [...str].map(ch =>
      ch === " " ? height * 0.40 : charWidth + gap
    );
    const total = advances.reduce((a, v) => a + v, 0) - gap;
    const sx = targetWidth !== undefined ? targetWidth / total : 1;
    const vertices: number[] = [];
    let cursor = -total / 2;
    const thickness = height * 0.085;

    for (let k = 0; k < str.length; k++) {
      const paths = glyph[str[k]];
      if (paths) {
        for (const path of paths.split("|")) {
          const coords = path.split(" ").map(token => token.split(",").map(Number));
          for (let j = 1; j < coords.length; j++) {
            const p = coords[j - 1], q = coords[j];
            const px = cursor + p[0] / 4 * charWidth;
            const py = p[1] / 6 * height - height / 2;
            const qx = cursor + q[0] / 4 * charWidth;
            const qy = q[1] / 6 * height - height / 2;
            const len = Math.hypot(qx - px, qy - py);
            if (len < 1e-9) continue;
            const nx = -(qy - py) / len * thickness / 2;
            const ny = (qx - px) / len * thickness / 2;
            const a = [(px + nx) * sx, py + ny, 0];
            const bb = [(px - nx) * sx, py - ny, 0];
            const c = [(qx - nx) * sx, qy - ny, 0];
            const d = [(qx + nx) * sx, qy + ny, 0];
            vertices.push(...a, ...bb, ...c, ...a, ...c, ...d);
          }
        }
      }
      cursor += advances[k];
    }
    if (!vertices.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    if (backwards) g.rotateY(Math.PI);
    part(g, color, x, y, z);
  }

  function screw(x: number, y: number, z: number, rear = false) {
    disc(0.0039, 0.0025, x, y, z, C.chrome, 10);
    rod(
      x - 0.0018, y - 0.0012, x + 0.0018, y + 0.0012,
      0.00055, z + (rear ? -0.0018 : 0.0018), C.chromeDark
    );
  }

  function diamond(
    x: number, y: number, rx: number, ry: number,
    z: number, color: string
  ) {
    polygon([[x, y + ry], [x + rx, y], [x, y - ry], [x - rx, y]],
      0.003, color, z);
  }

  // Four little feet meet the floor; a substantial stepped plinth sits on them.
  for (const x of [-0.35, 0.35]) {
    for (const z of [-0.235, 0.235]) {
      box(0.115, 0.036, 0.105, x, 0.018, z, C.black);
    }
  }
  roundedBox(0.990, 0.080, 0.665, 0, 0.078, 0, C.woodEdge, 0.022, 0.004);
  roundedBox(0.966, 0.045, 0.641, 0, 0.126, 0, C.wine, 0.014, 0.003);
  box(0.943, 0.010, 0.014, 0, 0.117, 0.326, C.gold);
  box(0.932, 0.009, 0.014, 0, 0.056, 0.338, C.chromeDark);
  box(0.865, 0.024, 0.012, 0, 0.081, 0.338, C.black);
  box(0.785, 0.004, 0.006, 0, 0.079, 0.346, C.chrome);

  // The simple, deep arched cabinet is the dominant silhouette.
  polygon(archOutline(0.463, 0.130), 0.550, C.wood, -0.006, 0.008);
  archBand(0.472, 0.440, 0.150, 0.044, 0.278, C.woodEdge, 0.003);
  archBand(0.456, 0.440, 0.170, 0.034, 0.311, C.brass, 0.0015);
  archBand(0.447, 0.439, 0.176, 0.015, 0.336, C.goldLight);

  // A smoky recessed front remains visible between the layered trim.
  polygon(archOutline(0.321, 0.162), 0.052, C.glass, 0.315);
  archBand(0.338, 0.320, 0.176, 0.025, 0.350, C.tealDark);
  archBand(0.331, 0.320, 0.182, 0.012, 0.370, C.aqua);
  archBand(0.320, 0.307, 0.180, 0.018, 0.372, C.chrome);

  // Warm fluted plastic pilasters continue into the illuminated crown.
  archBand(0.439, 0.340, 0.192, 0.070, 0.340, C.orange);
  archBand(0.428, 0.349, 0.199, 0.034, 0.372, C.amber);
  archBand(0.429, 0.418, 0.201, 0.013, 0.389, C.glowCream);
  archBand(0.407, 0.389, 0.202, 0.012, 0.389, C.honey);
  archBand(0.380, 0.374, 0.205, 0.010, 0.391, C.glowCream);
  archBand(0.351, 0.340, 0.194, 0.018, 0.384, C.gold);
  archBand(0.344, 0.337, 0.194, 0.009, 0.398, C.chromeLight);

  // Radial seams deliberately retain the faceted, primitive-made character.
  for (let i = 1; i < 24; i++) {
    const a = Math.PI * i / 24;
    rod(
      Math.cos(a) * 0.354, spring + Math.sin(a) * 0.354,
      Math.cos(a) * 0.416, spring + Math.sin(a) * 0.416,
      0.0011, 0.397, i % 3 === 0 ? C.goldLight : C.orange
    );
  }
  for (const s of [-1, 1]) {
    for (const r of [0.360, 0.387, 0.411]) {
      box(0.0028, 0.804, 0.009, s * r, 0.653, 0.396, C.goldLight);
    }
    for (const y of [0.282, 0.550, 0.804, 1.063]) {
      roundedBox(0.096, 0.015, 0.019, s * 0.388, y, 0.397, C.brass, 0.004, 0.001);
      box(0.095, 0.0035, 0.009, s * 0.388, y + 0.005, 0.409, C.goldLight);
    }

    // Turquoise foot cuffs, with tiered chrome-and-brass ornament.
    roundedBox(0.119, 0.146, 0.040, s * 0.390, 0.231, 0.378, C.brass, 0.009);
    roundedBox(0.103, 0.128, 0.030, s * 0.390, 0.231, 0.402, C.teal, 0.007);
    box(0.108, 0.009, 0.015, s * 0.390, 0.169, 0.423, C.chrome);
    box(0.108, 0.009, 0.015, s * 0.390, 0.294, 0.423, C.gold);
    for (let i = 0; i < 3; i++) {
      const x = s * 0.390 + (i - 1) * 0.023;
      roundedBox(0.009, 0.077 - Math.abs(i - 1) * 0.014, 0.011,
        x, 0.232, 0.424, C.goldLight, 0.003, 0.001);
    }
    diamond(s * 0.390, 0.232, 0.007, 0.013, 0.434, C.chromeLight);
  }

  // A winged crest perched on the warm arch.
  roundedBox(0.082, 0.038, 0.017, 0, 1.474, 0.401, C.brass, 0.012);
  roundedBox(0.069, 0.027, 0.010, 0, 1.474, 0.414, C.teal, 0.008, 0.001);
  diamond(0, 1.474, 0.011, 0.012, 0.423, C.glowCream);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      polygon([
        [s * 0.044, 1.484 - i * 0.009],
        [s * (0.094 - i * 0.011), 1.482 - i * 0.008],
        [s * (0.081 - i * 0.011), 1.477 - i * 0.008],
        [s * 0.044, 1.479 - i * 0.009]
      ], 0.007, C.goldLight, 0.412);
    }
  }

  // The little upper viewing window: Art Deco rays, vinyl, and a tonearm.
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI * (0.08 + i * 0.84 / 12);
    rod(
      0, 1.088,
      Math.cos(a) * 0.296, spring + Math.sin(a) * 0.296,
      0.0018, 0.348, i % 2 === 0 ? C.brass : C.chromeDark
    );
  }
  disc(0.124, 0.012, 0, 1.226, 0.360, C.black, 40);
  disc(0.119, 0.009, 0, 1.226, 0.370, C.vinyl, 40);
  for (const r of [0.048, 0.059, 0.070, 0.081, 0.092, 0.103, 0.112]) {
    ring(r, 0.00075, 0, 1.226, 0.376, C.groove, 48);
  }
  disc(0.037, 0.0035, 0, 1.226, 0.379, C.red, 32);
  ring(0.032, 0.0008, 0, 1.226, 0.382, C.goldLight, 32);
  text("45", 0.014, C.paper, 0, 1.236, 0.3825);
  text("RPM", 0.006, C.paper, 0, 1.214, 0.3825);
  disc(0.0055, 0.005, 0, 1.226, 0.384, C.chromeLight, 12);
  disc(0.0022, 0.0055, 0, 1.226, 0.388, C.black, 8);
  disc(0.017, 0.012, 0.233, 1.267, 0.367, C.brass, 16);
  disc(0.0105, 0.008, 0.233, 1.267, 0.379, C.chrome, 12);
  rod(0.233, 1.267, 0.195, 1.202, 0.0053, 0.387, C.chrome);
  rod(0.195, 1.202, 0.083, 1.181, 0.0053, 0.387, C.chrome);
  rod(0.230, 1.262, 0.193, 1.200, 0.0012, 0.393, C.chromeLight);
  roundedBox(0.029, 0.013, 0.011, 0.079, 1.181, 0.394, C.paper, 0.002);
  box(0.004, 0.009, 0.005, 0.070, 1.174, 0.398, C.black);
  screw(0.233, 1.267, 0.386);

  // Menu surround and ten individual paper title cards.
  roundedBox(0.593, 0.221, 0.030, 0, 0.973, 0.374, C.black, 0.011);
  roundedBox(0.580, 0.211, 0.028, 0, 0.973, 0.396, C.brass, 0.009);
  roundedBox(0.561, 0.194, 0.016, 0, 0.973, 0.416, C.paperAlt, 0.005, 0.001);
  box(0.543, 0.023, 0.004, 0, 1.053, 0.429, C.darkRed);
  text("SELECT YOUR FAVORITE", 0.0095, C.paper, 0, 1.053, 0.432);
  box(0.003, 0.162, 0.005, 0, 0.958, 0.432, C.brass);

  const songs = [
    ["MOONLIGHT", "THE BLUE NOTES"],
    ["BLUE SKIES", "ELLA AND THE BAND"],
    ["STARDUST", "THE SATELLITES"],
    ["SWEET SONG", "RUBY AND THE ROCKETS"],
    ["GOOD TIMES", "THE DAYDREAMERS"],
    ["NIGHT TRAIN", "THE ALL STARS"],
    ["HEARTBEAT", "THE VELVET TRIO"],
    ["SUMMER LOVE", "THE SUNSETTERS"],
    ["ALL SHOOK UP", "THE KINGSMEN"],
    ["DREAM A LITTLE", "THE MIDNIGHT FIVE"]
  ];

  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 5; row++) {
      const index = col * 5 + row;
      const cx = col === 0 ? -0.139 : 0.139;
      const cy = 1.025 - row * 0.0345;
      box(0.267, 0.029, 0.003, cx, cy, 0.431,
        row % 2 === 0 ? C.paper : C.paperAlt);
      box(0.024, 0.025, 0.003, cx - 0.119, cy, 0.434, C.teal);
      text(`${String.fromCharCode(65 + row)}${col + 1}`,
        0.0075, C.paper, cx - 0.119, cy, 0.436);
      text(songs[index][0], 0.0094, C.ink, cx + 0.009, cy + 0.005, 0.4345);
      text(songs[index][1], 0.0052, C.chromeDark, cx + 0.009, cy - 0.007, 0.4345);
      box(0.265, 0.001, 0.002, cx, cy - 0.015, 0.435, C.brass);
    }
  }
  for (const x of [-0.282, 0.282]) {
    screw(x, 1.069, 0.414);
    screw(x, 0.876, 0.414);
  }

  // A complete row of proud ivory pushbuttons.
  roundedBox(0.559, 0.065, 0.033, 0, 0.819, 0.381, C.tealDark, 0.009);
  box(0.548, 0.0045, 0.008, 0, 0.790, 0.405, C.chrome);
  const keyLabels = ["A", "B", "C", "D", "E", "1", "2", "3", "4", "5"];
  for (let i = 0; i < 10; i++) {
    const x = -0.2295 + i * 0.051;
    roundedBox(0.047, 0.043, 0.017, x, 0.822, 0.405, C.brass, 0.003, 0.001);
    roundedBox(0.039, 0.035, 0.021, x, 0.824, 0.421, C.paper, 0.003, 0.001);
    box(0.032, 0.003, 0.002, x, 0.810, 0.433, C.paperAlt);
    text(keyLabels[i], 0.012, C.ink, x, 0.825, 0.4335);
  }
  for (const x of [-0.281, 0.281]) {
    disc(0.018, 0.013, x, 0.821, 0.406, C.chrome, 16);
    disc(0.012, 0.011, x, 0.821, 0.419, C.red, 12);
    disc(0.004, 0.0015, x - 0.002, 0.825, 0.426, C.goldLight, 8);
  }

  // Cherry-red manufacturer plaque with geometric lettering and wing motifs.
  roundedBox(0.570, 0.077, 0.022, 0, 0.743, 0.381, C.brass, 0.008);
  roundedBox(0.551, 0.061, 0.014, 0, 0.743, 0.401, C.darkRed, 0.006, 0.001);
  text("STARLIGHT", 0.031, C.goldLight, 0, 0.751, 0.411, 0.333);
  text("HIGH FIDELITY", 0.008, C.paper, 0, 0.725, 0.411, 0.153);
  for (const s of [-1, 1]) {
    diamond(s * 0.221, 0.752, 0.011, 0.017, 0.413, C.goldLight);
    for (let i = 0; i < 3; i++) {
      box(0.027 - i * 0.004, 0.0022, 0.003,
        s * 0.245, 0.759 - i * 0.008, 0.412, C.gold);
    }
  }

  // A broad, six-sided speaker recess, dense woven lattice, and bold fan ribs.
  const grille: number[][] = [
    [-0.247, 0.181], [0.247, 0.181],
    [0.282, 0.635], [0.251, 0.682],
    [-0.251, 0.682], [-0.282, 0.635]
  ];
  polygon(grille, 0.028, C.brass, 0.350, 0.003);
  const clothShape: number[][] = [
    [-0.232, 0.194], [0.232, 0.194],
    [0.267, 0.630], [0.242, 0.666],
    [-0.242, 0.666], [-0.267, 0.630]
  ];
  polygon(clothShape, 0.013, C.black, 0.366);
  polygon(clothShape, 0.003, C.cloth, 0.375);

  function clipLine(px: number, py: number, dx: number, dy: number) {
    const intersections: number[] = [];
    for (let i = 0; i < clothShape.length; i++) {
      const a = clothShape[i], bb = clothShape[(i + 1) % clothShape.length];
      const ex = bb[0] - a[0], ey = bb[1] - a[1];
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const ax = a[0] - px, ay = a[1] - py;
      const t = (ax * ey - ay * ex) / den;
      const u = (ax * dy - ay * dx) / den;
      if (u >= -0.00001 && u <= 1.00001) intersections.push(t);
    }
    if (intersections.length < 2) return;
    intersections.sort((a, bb) => a - bb);
    const t1 = intersections[0], t2 = intersections[intersections.length - 1];
    if (t2 - t1 < 0.0001) return;
    rod(px + t1 * dx, py + t1 * dy, px + t2 * dx, py + t2 * dy,
      0.00095, 0.381, C.chromeDark, 4);
  }

  for (let i = -15; i <= 15; i++) {
    clipLine(i * 0.033, 0.430, 0.72, 1);
    clipLine(i * 0.033, 0.430, -0.72, 1);
  }
  for (let i = 0; i < grille.length; i++) {
    const a = grille[i], bb = grille[(i + 1) % grille.length];
    rod(a[0], a[1], bb[0], bb[1], 0.006, 0.387, C.gold, 8);
  }

  for (let i = -6; i <= 6; i++) {
    const x = i * 0.0395;
    rod(0, 0.217, x, 0.658, i === 0 ? 0.006 : 0.0042,
      0.395, i % 2 === 0 ? C.goldLight : C.gold, 6);
  }
  rod(-0.229, 0.213, -0.260, 0.624, 0.0033, 0.397, C.chrome);
  rod(0.229, 0.213, 0.260, 0.624, 0.0033, 0.397, C.chrome);

  // A central musical medallion anchors the speaker's sunburst.
  disc(0.053, 0.015, 0, 0.273, 0.405, C.brass, 24);
  ring(0.047, 0.003, 0, 0.273, 0.416, C.chrome, 32);
  disc(0.041, 0.005, 0, 0.273, 0.418, C.teal, 24);
  disc(0.033, 0.003, 0, 0.273, 0.422, C.darkRed, 24);
  disc(0.010, 0.003, -0.009, 0.264, 0.426, C.paper, 12);
  rod(-0.001, 0.263, -0.001, 0.293, 0.0028, 0.427, C.paper);
  polygon([[-0.003, 0.294], [0.016, 0.288], [0.016, 0.278], [-0.003, 0.284]],
    0.003, C.paper, 0.427);
  diamond(0, 0.197, 0.023, 0.011, 0.406, C.chromeLight);
  for (const x of [-0.237, 0.237]) {
    screw(x, 0.204, 0.396);
    screw(x * 1.08, 0.620, 0.396);
  }

  // Coin entry and matching small left-side hi-fi badge.
  roundedBox(0.058, 0.075, 0.021, 0.386, 0.427, 0.403, C.brass, 0.004);
  roundedBox(0.048, 0.064, 0.010, 0.386, 0.427, 0.419, C.chrome, 0.003, 0.001);
  text("25C", 0.009, C.ink, 0.386, 0.447, 0.426);
  box(0.031, 0.006, 0.003, 0.386, 0.429, 0.426, C.black);
  box(0.027, 0.002, 0.003, 0.386, 0.426, 0.429, C.chromeLight);
  box(0.033, 0.011, 0.006, 0.386, 0.407, 0.426, C.chromeDark);
  box(0.037, 0.004, 0.010, 0.386, 0.401, 0.430, C.chromeLight);
  roundedBox(0.052, 0.071, 0.021, -0.386, 0.427, 0.403, C.brass, 0.004);
  roundedBox(0.042, 0.060, 0.010, -0.386, 0.427, 0.419, C.tealDark, 0.003, 0.001);
  text("HI", 0.013, C.goldLight, -0.386, 0.440, 0.426);
  text("FI", 0.013, C.goldLight, -0.386, 0.414, 0.426);
  box(0.026, 0.0018, 0.003, -0.386, 0.427, 0.426, C.chrome);

  // Side panels: warm wood, inset vents, brass pinstripes, and exposed screws.
  for (const s of [-1, 1]) {
    box(0.008, 0.782, 0.450, s * 0.466, 0.636, -0.005, C.woodEdge);
    box(0.010, 0.748, 0.418, s * 0.472, 0.636, -0.005, C.sideWood);
    box(0.006, 0.711, 0.004, s * 0.479, 0.636, -0.200, C.brass);
    box(0.006, 0.711, 0.004, s * 0.479, 0.636, 0.190, C.brass);
    box(0.006, 0.004, 0.390, s * 0.479, 0.985, -0.005, C.gold);
    box(0.006, 0.004, 0.390, s * 0.479, 0.287, -0.005, C.gold);
    box(0.012, 0.254, 0.286, s * 0.480, 0.650, -0.021, C.wood);
    for (let i = 0; i < 9; i++) {
      const y = 0.548 + i * 0.0255;
      box(0.005, 0.009, 0.243, s * 0.488, y, -0.021, C.woodEdge);
      box(0.004, 0.002, 0.239, s * 0.491, y - 0.005, -0.021, C.woodLight);
    }
    for (const y of [0.309, 0.963]) {
      for (const z of [-0.180, 0.170]) {
        const g = new THREE.CylinderGeometry(0.004, 0.004, 0.003, 10);
        g.rotateZ(Math.PI / 2);
        part(g, C.brass, s * 0.481, y, z);
      }
    }
    box(0.008, 0.054, 0.148, s * 0.481, 0.386, -0.020, C.brass);
    box(0.009, 0.043, 0.136, s * 0.487, 0.386, -0.020, C.woodEdge);
    for (let i = 0; i < 5; i++) {
      box(0.004, 0.022, 0.004, s * 0.493, 0.386, -0.068 + i * 0.024, C.gold);
    }
  }

  // The back is a finished service cabinet, not an empty shell.
  polygon(archOutline(0.402, 0.177, 1.052), 0.013, C.woodEdge, -0.289);
  polygon(archOutline(0.391, 0.187, 1.052), 0.010, C.sideWood, -0.302);
  box(0.700, 0.006, 0.005, 0, 0.458, -0.310, C.woodEdge);
  roundedBox(0.479, 0.208, 0.008, 0, 0.838, -0.311, C.woodEdge, 0.008, 0.001);
  for (let i = 0; i < 10; i++) {
    box(0.438, 0.006, 0.005, 0, 0.753 + i * 0.0185, -0.318, C.black);
    box(0.438, 0.002, 0.004, 0, 0.750 + i * 0.0185, -0.321, C.woodLight);
  }
  for (const x of [-0.366, 0.366]) {
    for (const y of [0.219, 0.493, 1.010]) screw(x, y, -0.314, true);
  }
  for (const y of [0.540, 0.979]) {
    box(0.024, 0.065, 0.012, -0.385, y, -0.314, C.brass);
    box(0.008, 0.060, 0.016, -0.376, y, -0.320, C.chromeDark);
  }
  roundedBox(0.218, 0.088, 0.008, 0, 0.349, -0.316, C.brass, 0.003, 0.001);
  roundedBox(0.199, 0.070, 0.006, 0, 0.349, -0.324, C.black, 0.002, 0.0005);
  text("STARLIGHT", 0.013, C.paper, 0, 0.365, -0.328, undefined, true);
  text("MODEL 45", 0.008, C.gold, 0, 0.344, -0.328, undefined, true);
  text("HIGH FIDELITY SOUND", 0.0055, C.paper, 0, 0.329, -0.328, undefined, true);
  disc(0.012, 0.010, 0.280, 0.285, -0.318, C.chromeDark, 12);
  disc(0.005, 0.013, 0.280, 0.285, -0.325, C.black, 8);

  // Preserve the SDK's shared materials while distinguishing metal, wood,
  // smoked glass, paper, and softly self-lit colored plastic.
  const metals = new Set([C.brass, C.gold, C.goldLight, C.chrome, C.chromeLight, C.chromeDark]);
  const luminous = new Set([C.amber, C.honey, C.glowCream, C.aqua]);

  b.root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const color = `#${material.color.getHexString()}`;
      material.flatShading = true;
      if (metals.has(color)) {
        material.metalness = 0.65;
        material.roughness = color === C.chromeLight ? 0.24 : 0.34;
      } else if (luminous.has(color)) {
        material.metalness = 0.06;
        material.roughness = 0.35;
        material.emissive.copy(material.color);
        material.emissiveIntensity = color === C.glowCream ? 0.34 : 0.20;
      } else if (color === C.glass || color === C.vinyl) {
        material.metalness = 0.25;
        material.roughness = 0.25;
      } else if (color === C.wood || color === C.sideWood || color === C.wine) {
        material.roughness = 0.53;
      }
      material.needsUpdate = true;
    }
  });

  return b.root;
}
```