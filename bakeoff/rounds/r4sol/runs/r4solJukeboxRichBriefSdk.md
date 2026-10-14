```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Starlight 45",
  description:
    "A jewel-toned 1950s diner jukebox with illuminated horseshoe tubes, polished chrome, a glass record-changing cabinet, eighteen song selections, and an Art Deco starburst speaker."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Starlight45" });
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    burgundy: "#601f2d",
    walnut: "#93432e",
    darkWood: "#35212a",
    chrome: "#bccbd2",
    brightChrome: "#edf3f4",
    darkChrome: "#607780",
    brass: "#c79749",
    gold: "#ebcc88",
    ivory: "#fff0cc",
    paper: "#f6e9c9",
    ink: "#24333a",
    mutedInk: "#7c7360",
    tealDark: "#17464b",
    speaker: "#102e34",
    black: "#10181e",
    vinyl: "#242a30",
    red: "#ee4936",
    amber: "#ffb637",
    teal: "#26c9bf",
    redLabel: "#c94336",
    amberHighlight: "#ffe9ac",
    redHighlight: "#ffb59a",
    tealHighlight: "#affff0",
    glass: "#a3e4de",
    reflection: "#ecfffa"
  };

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: number[] = [0, 0, 0],
    dir?: number[]
  ) {
    return b.part(geometry, color, {
      at,
      bone: cabinet,
      ...(dir ? { dir } : {})
    });
  }

  function box(w: number, h: number, d: number, color: string, at: number[]) {
    return part(new THREE.BoxGeometry(w, h, d), color, at);
  }

  function rod(a: number[], z: number[], radius: number, color: string, sides = 10) {
    const delta = z.map((v, i) => v - a[i]);
    const length = Math.hypot(...delta);
    return part(
      new THREE.CylinderGeometry(radius, radius, length, sides, 1),
      color,
      a.map((v, i) => (v + z[i]) / 2),
      delta
    );
  }

  function disk(
    radius: number,
    depth: number,
    color: string,
    at: number[],
    facing: number[] = [0, 0, 1],
    segments = 32
  ) {
    return part(
      new THREE.CylinderGeometry(radius, radius, depth, segments, 1),
      color,
      at,
      facing
    );
  }

  function roundedOutline(w: number, h: number, r: number): THREE.Shape {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function extrusion(shape: THREE.Shape, depth: number, bevel = 0) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      curveSegments: 4,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  function plate(
    w: number,
    h: number,
    radius: number,
    depth: number,
    color: string,
    at: number[],
    bevel = 0
  ) {
    return part(extrusion(roundedOutline(w, h, radius), depth, bevel), color, at);
  }

  function roundedFrame(
    w: number,
    h: number,
    r: number,
    thickness: number,
    depth: number,
    color: string,
    at: number[]
  ) {
    const shape = roundedOutline(w, h, r);
    shape.holes.push(
      roundedOutline(w - thickness * 2, h - thickness * 2, Math.max(0.003, r - thickness))
    );
    return part(extrusion(shape, depth, 0.001), color, at);
  }

  function polygonGeometry(points: number[][], depth: number, bevel = 0) {
    const s = new THREE.Shape();
    s.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
    s.closePath();
    return extrusion(s, depth, bevel);
  }

  function archShape(radius: number, centerY: number, bottom: number) {
    const shape = new THREE.Shape();
    shape.moveTo(-radius, bottom);
    shape.lineTo(radius, bottom);
    shape.lineTo(radius, centerY);
    shape.absarc(0, centerY, radius, 0, Math.PI, false);
    shape.lineTo(-radius, bottom);
    shape.closePath();
    return shape;
  }

  function archPath(radius: number, z: number, bottom = 0.151, centerY = 1.057) {
    const points: number[][] = [[radius, bottom, z], [radius, centerY, z]];
    for (let i = 1; i <= 32; i++) {
      const a = (i / 32) * Math.PI;
      points.push([Math.cos(a) * radius, centerY + Math.sin(a) * radius, z]);
    }
    points.push([-radius, bottom, z]);
    return points;
  }

  function screw(x: number, y: number, z: number, size = 0.005) {
    disk(size, 0.003, C.brightChrome, [x, y, z], [0, 0, 1], 10);
    box(size * 1.35, 0.0011, 0.0008, C.darkChrome, [x, y, z + 0.002]);
  }

  // Small, actual geometric lettering rather than placeholder title-card marks.
  const alphabet: Record<string, string[]> = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"]
  };

  function textGeometry(message: string, height: number, maxWidth = Infinity) {
    const chars = message.toUpperCase();
    const unit = Math.min(height / 7, maxWidth / Math.max(1, chars.length * 6 - 1));
    const width = (chars.length * 6 - 1) * unit;
    const positions: number[] = [];
    function quad(x: number, y: number, w: number, h: number) {
      positions.push(
        x, y, 0, x + w, y, 0, x + w, y + h, 0,
        x, y, 0, x + w, y + h, 0, x, y + h, 0
      );
    }
    for (let i = 0; i < chars.length; i++) {
      const glyph = alphabet[chars[i]] || alphabet[" "];
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (glyph[row][col] === "1") {
            quad(
              -width / 2 + (i * 6 + col) * unit,
              unit * 3.5 - (row + 1) * unit,
              unit * 0.91,
              unit * 0.91
            );
          }
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  function text(message: string, height: number, color: string, at: number[], maxWidth = Infinity) {
    return part(textGeometry(message, height, maxWidth), color, at);
  }

  function star(radius: number, inner: number, points: number, depth: number) {
    const vertices: number[][] = [];
    for (let i = 0; i < points * 2; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / points;
      const r = i % 2 === 0 ? radius : inner;
      vertices.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return polygonGeometry(vertices, depth, 0.0008);
  }

  // Cabinet and grounded chrome bumper.
  for (const x of [-0.414, 0.414]) {
    for (const z of [-0.239, 0.239]) {
      disk(0.046, 0.028, C.black, [x, 0.014, z], [0, 1, 0], 12);
    }
  }
  plate(1.115, 0.091, 0.023, 0.672, C.darkWood, [0, 0.075, -0.018], 0.008);
  plate(1.132, 0.047, 0.014, 0.696, C.chrome, [0, 0.061, -0.018], 0.004);
  plate(1.077, 0.030, 0.010, 0.678, C.burgundy, [0, 0.111, -0.018], 0.003);
  box(0.965, 0.008, 0.010, C.brightChrome, [0, 0.095, 0.328]);
  for (const y of [0.051, 0.063, 0.075]) {
    box(0.82, 0.003, 0.003, C.darkChrome, [0, y, 0.334]);
  }
  plate(0.134, 0.025, 0.005, 0.009, C.brass, [0, 0.059, 0.344]);
  text("MODEL 45", 0.0074, C.ink, [0, 0.059, 0.35]);

  part(extrusion(archShape(0.535, 1.057, 0.108), 0.604, 0.010), C.burgundy, [0, 0, -0.019]);
  part(extrusion(archShape(0.499, 1.057, 0.139), 0.021, 0.002), C.ivory, [0, 0, 0.297]);

  b.sweep(archPath(0.531, 0.314, 0.126), 0.017, { color: C.chrome });
  b.sweep(archPath(0.510, -0.332, 0.135), 0.011, { color: C.chrome });

  // Three continuous illuminated horseshoe bands, in chromed channels.
  const tubes = [
    { radius: 0.491, color: C.amber, highlight: C.amberHighlight },
    { radius: 0.445, color: C.red, highlight: C.redHighlight },
    { radius: 0.399, color: C.teal, highlight: C.tealHighlight }
  ];

  for (const tube of tubes) {
    b.sweep(archPath(tube.radius, 0.326), 0.027, { color: C.chrome });
    b.sweep(archPath(tube.radius, 0.349), 0.019, { color: tube.color });
    b.sweep(archPath(tube.radius, 0.368), 0.0028, { color: tube.highlight });

    for (const side of [-1, 1]) {
      for (const y of [0.198, 0.426, 0.639, 0.993]) {
        part(
          new THREE.CylinderGeometry(0.0215, 0.0215, 0.009, 12),
          C.brightChrome,
          [side * tube.radius, y, 0.349]
        );
      }
    }
    for (const degrees of [30, 60, 90, 120, 150]) {
      const angle = (degrees * Math.PI) / 180;
      part(
        new THREE.CylinderGeometry(0.0215, 0.0215, 0.008, 12),
        C.chrome,
        [Math.cos(angle) * tube.radius, 1.057 + Math.sin(angle) * tube.radius, 0.349],
        [-Math.sin(angle), Math.cos(angle), 0]
      );
    }
  }

  for (const side of [-1, 1]) {
    plate(0.161, 0.053, 0.011, 0.034, C.chrome, [side * 0.447, 0.164, 0.35], 0.002);
    box(0.133, 0.006, 0.004, C.darkChrome, [side * 0.447, 0.161, 0.371]);
    box(0.133, 0.004, 0.004, C.brightChrome, [side * 0.447, 0.177, 0.373]);
  }

  // Fluted walnut side cheeks with polished Art Deco escutcheons.
  for (const side of [-1, 1]) {
    box(0.014, 0.819, 0.442, C.walnut, [side * 0.539, 0. sixty ?? 0.66, -0.017]);
  }

  return finish();

  function finish(): THREE.Object3D {
    // Side details are built in model space; the flat shapes face outward.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        rod(
          [side * 0.551, 0.244, -0.208 + i * 0.075],
          [side * 0.551, 0.983, -0.208 + i * 0.075],
          0.0035,
          i % 2 === 0 ? C.brass : C.darkWood,
          6
        );
      }
      const surround = extrusion(roundedOutline(0.235, 0.526, 0.074), 0.012, 0.002);
      surround.rotateY(side * Math.PI / 2);
      part(surround, C.chrome, [side * 0.558, 0.684, -0.026]);

      const inset = extrusion(roundedOutline(0.206, 0.493, 0.061), 0.008);
      inset.rotateY(side * Math.PI / 2);
      part(inset, C.tealDark, [side * 0.567, 0.684, -0.026]);

      const crest = star(0.038, 0.014, 4, 0.005);
      crest.rotateY(side * Math.PI / 2);
      part(crest, C.gold, [side * 0.574, 0.823, -0.026]);

      const sideLettering = textGeometry("HI FI", 0.021, 0.153);
      sideLettering.rotateY(side * Math.PI / 2);
      part(sideLettering, C.ivory, [side * 0.575, 0.742, -0.026]);

      for (let i = 0; i < 4; i++) {
        rod(
          [side * 0.576, 0.625 - i * 0.030, -0.106 + i * 0.010],
          [side * 0.576, 0.625 - i * 0.030, 0.054 - i * 0.010],
          0.0045,
          C.chrome,
          8
        );
      }
    }

    // Recessed record-changing compartment.
    part(extrusion(archShape(0.361, 1.057, 0.966), 0.014), C.darkChrome, [0, 0, 0.030]);
    part(extrusion(archShape(0.347, 1.057, 0.977), 0.010), C.ivory, [0, 0, 0.043]);
    text("45 RPM", 0.017, C.brass, [0, 1.366, 0.055], 0.118);

    for (const x of [-0.289, 0.289]) {
      rod([x, 0.991, 0.096], [x, 1.205, 0.096], 0.008, C.brass);
      disk(0.015, 0.010, C.gold, [x, 1.209, 0.097], [0, 1, 0], 12);
      part(new THREE.SphereGeometry(0.011, 8, 6), C.amberHighlight, [x, 1.225, 0.098]);
    }

    box(0.622, 0.014, 0.253, C.darkChrome, [0, 0.983, 0.167]);
    box(0.575, 0.008, 0.209, C.chrome, [0, 0.994, 0.167]);
    disk(0.150, 0.017, C.brass, [-0.117, 1.008, 0.164], [0, 1, 0]);
    disk(0.141, 0.007, C.chrome, [-0.117, 1.020, 0.164], [0, 1, 0]);

    // A genuine, separated stack of seven small 45-rpm records.
    for (let i = 0; i < 7; i++) {
      const y = 1.029 + i * 0.010;
      disk(0.133, 0.0065, i % 2 === 0 ? C.black : C.vinyl, [-0.117, y, 0.164], [0, 1, 0]);
      disk(0.035, 0.001, i % 2 === 0 ? C.redLabel : C.gold, [-0.117, y + 0.0038, 0.164], [0, 1, 0], 20);
    }
    rod([-0.117, 1.012, 0.164], [-0.117, 1.142, 0.164], 0.0065, C.chrome);
    disk(0.011, 0.010, C.brightChrome, [-0.117, 1.138, 0.164], [0, 1, 0], 10);

    // One record lifted into the viewing dome by the mechanical picker.
    const recordCenter = [-0.080, 1.229, 0.204];
    disk(0.141, 0.006, C.black, recordCenter, [0, 0, 1], 40);
    disk(0.044, 0.0025, C.redLabel, [-0.080, 1.229, 0.209], [0, 0, 1], 28);
    for (const radius of [0.060, 0.082, 0.105, 0.129]) {
      part(
        new THREE.TorusGeometry(radius, 0.0009, 4, 40),
        C.vinyl,
        [-0.080, 1.229, 0.208]
      );
    }
    text("45", 0.020, C.ivory, [-0.080, 1.241, 0.211], 0.041);
    text("RPM", 0.008, C.gold, [-0.080, 1.218, 0.211], 0.030);
    disk(0.0055, 0.005, C.brightChrome, [-0.080, 1.229, 0.213], [0, 0, 1], 10);

    // Motor, articulated chrome links, brass pivots, and the gripping fork.
    plate(0.074, 0.078, 0.008, 0.083, C.tealDark, [0.234, 1.049, 0.149], 0.002);
    disk(0.027, 0.019, C.brass, [0.232, 1.057, 0.199], [0, 0, 1], 16);
    disk(0.016, 0.022, C.chrome, [0.232, 1.057, 0.209], [0, 0, 1], 12);
    rod([0.220, 1.014, 0.147], [0.220, 1.242, 0.147], 0.0115, C.chrome);
    rod([0.252, 1.073, 0.149], [0.252, 1.212, 0.149], 0.0055, C.brass);
    disk(0.025, 0.030, C.darkChrome, [0.220, 1.238, 0.158], [0, 0, 1], 16);
    disk(0.016, 0.006, C.gold, [0.220, 1.238, 0.177], [0, 0, 1], 12);
    rod([0.220, 1.238, 0.181], [0.111, 1.288, 0.205], 0.010, C.chrome);
    rod([0.218, 1.217, 0.172], [0.111, 1.272, 0.196], 0.005, C.darkChrome);
    disk(0.014, 0.011, C.brass, [0.110, 1.284, 0.207], [0, 0, 1], 12);
    rod([0.109, 1.286, 0.208], [0.031, 1.326, 0.212], 0.008, C.brightChrome);
    b.sweep(
      [[0.042, 1.318, 0.210], [0.027, 1.337, 0.213], [0.005, 1.337, 0.214], [-0.008, 1.319, 0.214]],
      0.005,
      { color: C.brass }
    );
    disk(0.007, 0.009, C.darkChrome, [-0.008, 1.320, 0.213], [0, 0, 1], 8);
    b.sweep(
      [[0.267, 1.077, 0.137], [0.282, 1.128, 0.129], [0.263, 1.189, 0.134], [0.229, 1.220, 0.140]],
      0.003,
      { color: C.black }
    );

    // Bowed transparent glass, retaining the unmistakable domed outline.
    const windowRadius = 0.352;
    const windowBottom = 0.967;
    const boundary: number[][] = [
      [-windowRadius, windowBottom],
      [windowRadius, windowBottom],
      [windowRadius, 1.057]
    ];
    for (let i = 1; i <= 28; i++) {
      const angle = (i * Math.PI) / 28;
      boundary.push([
        Math.cos(angle) * windowRadius,
        1.057 + Math.sin(angle) * windowRadius
      ]);
    }
    const glassPositions: number[] = [0, 1.168, 0.398];
    const glassIndices: number[] = [];
    const count = boundary.length;
    for (let ring = 1; ring <= 4; ring++) {
      const scale = ring / 4;
      for (const p of boundary) {
        glassPositions.push(
          p[0] * scale,
          1.168 + (p[1] - 1.168) * scale,
          0.354 + 0.044 * (1 - scale * scale)
        );
      }
    }
    for (let i = 0; i < count; i++) {
      glassIndices.push(0, 1 + i, 1 + ((i + 1) % count));
    }
    for (let ring = 0; ring < 3; ring++) {
      const a = 1 + ring * count;
      const z = a + count;
      for (let i = 0; i < count; i++) {
        const j = (i + 1) % count;
        glassIndices.push(a + i, z + i, z + j, a + i, z + j, a + j);
      }
    }
    const glassGeometry = new THREE.BufferGeometry();
    glassGeometry.setAttribute("position", new THREE.Float32BufferAttribute(glassPositions, 3));
    glassGeometry.setIndex(glassIndices);
    glassGeometry.computeVertexNormals();
    part(glassGeometry, C.glass);

    b.sweep(archPath(0.357, 0.355, 0.966), 0.011, { color: C.chrome });
    rod([-0.354, 0.966, 0.355], [0.354, 0.966, 0.355], 0.010, C.chrome);
    b.sweep(
      [[-0.282, 1.141, 0.374], [-0.262, 1.225, 0.381], [-0.211, 1.303, 0.379], [-0.144, 1.355, 0.373], [-0.081, 1.382, 0.365]],
      0.005,
      { color: C.reflection }
    );
    b.sweep(
      [[-0.245, 1.257, 0.385], [-0.210, 1.307, 0.385], [-0.167, 1.342, 0.380]],
      0.0018,
      { color: C.reflection }
    );
    screw(-0.340, 0.986, 0.366);
    screw(0.340, 0.986, 0.366);

    // Branded chrome eyebrow separating the glass and selection keyboard.
    plate(0.716, 0.035, 0.009, 0.025, C.chrome, [0, 0.954, 0.359], 0.0015);
    plate(0.274, 0.025, 0.005, 0.007, C.tealDark, [0, 0.954, 0.376]);
    text("STARLIGHT", 0.015, C.gold, [0, 0.954, 0.381], 0.233);
    for (const x of [-0.246, 0.246]) {
      part(star(0.011, 0.003, 4, 0.003), C.brass, [x, 0.954, 0.377]);
    }

    // Three banks of six chrome selection keys and fully lettered title cards.
    plate(0.738, 0.258, 0.025, 0.025, C.chrome, [0, 0.807, 0.335], 0.002);
    plate(0.711, 0.236, 0.015, 0.010, C.brass, [0, 0.807, 0.354]);
    plate(0.695, 0.222, 0.009, 0.007, C.tealDark, [0, 0.807, 0.363]);

    const selections = [
      ["BLUE MOON", "THE MARCELS"],
      ["PEGGY SUE", "BUDDY HOLLY"],
      ["TEQUILA", "THE CHAMPS"],
      ["ONLY YOU", "THE PLATTERS"],
      ["TUTTI", "LITTLE RICH"],
      ["LOVE ME", "ELVIS"],
      ["LA BAMBA", "R VALENS"],
      ["DREAM", "EVERLY BROS"],
      ["JAILHOUSE", "ELVIS"],
      ["STARDUST", "NAT KING"],
      ["MACK", "BOBBY DARIN"],
      ["LONESOME", "HANK W"],
      ["SWEET SIX", "CHUCK BERRY"],
      ["EARTH ANGEL", "PENGUINS"],
      ["ROCK", "BILL HALEY"],
      ["SUMMERTIME", "SAM COOKE"],
      ["SANDMAN", "CHORDETTES"],
      ["GOOD GOLLY", "LITTLE RICH"]
    ];

    for (let row = 0; row < 3; row++) {
      const cardY = 0.900 - row * 0.076;
      for (let column = 0; column < 6; column++) {
        const x = (column - 2.5) * 0.112;
        const index = row * 6 + column;
        const code = `${String.fromCharCode(65 + row)}${column + 1}`;

        plate(0.104, 0.031, 0.0025, 0.004, C.gold, [x, cardY, 0.373]);
        plate(0.097, 0.0255, 0.001, 0.002, C.paper, [x, cardY, 0.376]);
        text(selections[index][0], 0.0092, C.ink, [x, cardY + 0.0047, 0.378], 0.089);
        text(selections[index][1], 0.0060, C.mutedInk, [x, cardY - 0.0070, 0.378], 0.085);

        const keyY = cardY - 0.030;
        plate(0.077, 0.0195, 0.006, 0.018, C.chrome, [x, keyY, 0.382], 0.0015);
        box(0.061, 0.003, 0.0015, C.brightChrome, [x, keyY + 0.0057, 0.393]);
        plate(0.034, 0.0115, 0.002, 0.002, C.ivory, [x, keyY, 0.394]);
        text(code, 0.0077, C.ink, [x, keyY, 0.396], 0.026);
        disk(0.0033, 0.002, row === 1 ? C.redLabel : C.tealDark, [x + 0.027, keyY, 0.395], [0, 0, 1], 8);
      }
      if (row < 2) {
        box(0.673, 0.002, 0.004, C.gold, [0, cardY - 0.047, 0.371]);
      }
    }
    for (const x of [-0.350, 0.350]) {
      screw(x, 0.919, 0.354, 0.004);
      screw(x, 0.695, 0.354, 0.004);
    }

    // Coin entry, return button, and a separate dark return chute.
    plate(0.087, 0.159, 0.013, 0.028, C.chrome, [0.446, 0.798, 0.383], 0.002);
    plate(0.069, 0.138, 0.008, 0.004, C.gold, [0.446, 0.798, 0.401]);
    text("25", 0.018, C.ink, [0.446, 0.850, 0.405], 0.040);
    text("CENTS", 0.0065, C.ink, [0.446, 0.833, 0.405], 0.051);
    plate(0.056, 0.014, 0.003, 0.005, C.darkChrome, [0.446, 0.812, 0.405]);
    box(0.043, 0.0046, 0.002, C.black, [0.446, 0.812, 0.409]);
    text("PUSH", 0.006, C.ink, [0.446, 0.786, 0.405], 0.034);
    disk(0.0185, 0.011, C.chrome, [0.446, 0.759, 0.407], [0, 0, 1], 16);
    disk(0.0127, 0.010, C.redLabel, [0.446, 0.759, 0.416], [0, 0, 1], 16);
    screw(0.414, 0.868, 0.404, 0.003);
    screw(0.478, 0.727, 0.404, 0.003);

    plate(0.082, 0.080, 0.013, 0.027, C.chrome, [0.446, 0.651, 0.376], 0.002);
    plate(0.059, 0.040, 0.007, 0.003, C.black, [0.446, 0.651, 0.393]);
    box(0.066, 0.010, 0.030, C.chrome, [0.446, 0.631, 0.403]);
    text("RETURN", 0.006, C.ink, [0.446, 0.679, 0.394], 0.052);

    // Matching left-hand crest, keeping the composition balanced.
    plate(0.084, 0.152, 0.019, 0.024, C.chrome, [-0.446, 0.798, 0.383], 0.002);
    plate(0.065, 0.130, 0.013, 0.004, C.tealDark, [-0.446, 0.798, 0.400]);
    part(star(0.021, 0.006, 4, 0.004), C.gold, [-0.446, 0.835, 0.405]);
    text("HI", 0.017, C.ivory, [-0.446, 0.794, 0.405], 0.041);
    text("FI", 0.017, C.ivory, [-0.446, 0.770, 0.405], 0.041);
    text("STEREO", 0.006, C.gold, [-0.446, 0.742, 0.405], 0.051);

    // Speaker: dark recessed cloth, fine golden lattice, and sculptural rays.
    plate(0.726, 0.463, 0.079, 0.022, C.darkChrome, [0, 0.426, 0.322]);
    plate(0.689, 0.425, 0.062, 0.006, C.speaker, [0, 0.426, 0.338]);
    roundedFrame(0.739, 0.472, 0.084, 0.015, 0.015, C.chrome, [0, 0.426, 0.349]);
    roundedFrame(0.705, 0.438, 0.067, 0.005, 0.009, C.gold, [0, 0.426, 0.355]);

    function inSpeaker(x: number, y: number) {
      const hx = 0.339;
      const hy = 0.207;
      const r = 0.060;
      const qx = Math.max(0, Math.abs(x) - (hx - r));
      const qy = Math.max(0, Math.abs(y) - (hy - r));
      return Math.abs(x) <= hx && Math.abs(y) <= hy && qx * qx + qy * qy <= r * r;
    }

    const lattice: number[] = [];
    for (const slope of [-0.78, 0.78]) {
      for (let offset = -0.49; offset <= 0.49; offset += 0.015) {
        let first: number[] | undefined;
        let last: number[] | undefined;
        for (let k = 0; k <= 228; k++) {
          const x = -0.342 + k * 0.003;
          const y = slope * x + offset;
          if (inSpeaker(x, y)) {
            if (!first) first = [x, y];
            last = [x, y];
          }
        }
        if (!first || !last) continue;
        const dx = last[0] - first[0];
        const dy = last[1] - first[1];
        const length = Math.hypot(dx, dy);
        if (length < 0.004) continue;
        const nx = (-dy / length) * 0.0007;
        const ny = (dx / length) * 0.0007;
        const p = [
          [first[0] + nx, first[1] + ny + 0.426, 0.348],
          [first[0] - nx, first[1] - ny + 0.426, 0.348],
          [last[0] - nx, last[1] - ny + 0.426, 0.348],
          [last[0] + nx, last[1] + ny + 0.426, 0.348]
        ];
        for (const i of [0, 1, 2, 0, 2, 3]) lattice.push(...p[i]);
      }
    }
    const latticeGeometry = new THREE.BufferGeometry();
    latticeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lattice, 3));
    latticeGeometry.computeVertexNormals();
    part(latticeGeometry, C.brass);

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const vx = -uy;
      const vy = ux;
      const reach = 1 / Math.sqrt((ux / 0.326) ** 2 + (uy / 0.193) ** 2);
      const end = reach * (i % 2 === 0 ? 0.99 : 0.93);
      const ray = (width: number) => [
        [ux * 0.042 + vx * width, 0.426 + uy * 0.042 + vy * width],
        [ux * (end * 0.57) + vx * width * 0.62, 0.426 + uy * (end * 0.57) + vy * width * 0.62],
        [ux * end, 0.426 + uy * end],
        [ux * (end * 0.57) - vx * width * 0.62, 0.426 + uy * (end * 0.57) - vy * width * 0.62],
        [ux * 0.042 - vx * width, 0.426 + uy * 0.042 - vy * width]
      ];
      part(polygonGeometry(ray(0.0135), 0.005, 0.001), C.darkChrome, [0, 0, 0.361]);
      part(polygonGeometry(ray(0.0085), 0.006, 0.001), C.brightChrome, [0, 0, 0.367]);
    }
    disk(0.051, 0.011, C.chrome, [0, 0.426, 0.371], [0, 0, 1], 24);
    disk(0.041, 0.005, C.brass, [0, 0.426, 0.379], [0, 0, 1], 24);
    disk(0.034, 0.005, C.tealDark, [0, 0.426, 0.383], [0, 0, 1], 24);
    part(star(0.027, 0.0095, 4, 0.004), C.ivory, [0, 0.426, 0.389]);
    disk(0.005, 0.004, C.redLabel, [0, 0.426, 0.393], [0, 0, 1], 10);

    // Small front serial plate and upper horseshoe jewel.
    plate(0.168, 0.023, 0.005, 0.009, C.chrome, [0, 0.178, 0.354]);
    text("HIGH FIDELITY", 0.008, C.ink, [0, 0.178, 0.360], 0.147);
    part(
      polygonGeometry([[0, 0.025], [0.037, 0], [0, -0.025], [-0.037, 0]], 0.009, 0.001),
      C.chrome,
      [0, 1.561, 0.368]
    );
    part(star(0.014, 0.004, 4, 0.004), C.redLabel, [0, 1.561, 0.376]);

    // Finished back: removable panel, ventilation slots and identification.
    part(extrusion(archShape(0.467, 1.057, 0.160), 0.012), C.darkWood, [0, 0, -0.331]);
    plate(0.424, 0.321, 0.018, 0.006, C.walnut, [0, 0.654, -0.344]);
    for (let i = 0; i < 11; i++) {
      plate(0.331, 0.007, 0.003, 0.005, C.black, [0, 0.520 + i * 0.026, -0.351]);
    }
    plate(0.226, 0.073, 0.006, 0.005, C.brass, [0, 0.379, -0.346]);
    const backName = textGeometry("STARLIGHT 45", 0.014, 0.198);
    backName.rotateY(Math.PI);
    part(backName, C.ink, [0, 0.391, -0.350]);
    const backSerial = textGeometry("SERIAL 1957-018", 0.008, 0.198);
    backSerial.rotateY(Math.PI);
    part(backSerial, C.ink, [0, 0.366, -0.350]);
    for (const x of [-0.426, 0.426]) {
      for (const y of [0.218, 0.893]) {
        disk(0.005, 0.003, C.chrome, [x, y, -0.345], [0, 0, -1], 10);
      }
    }

    // The builder shares these materials throughout the cabinet.
    const metalColors = new Map<string, [number, number]>([
      [C.chrome, [0.90, 0.21]],
      [C.brightChrome, [0.88, 0.17]],
      [C.darkChrome, [0.82, 0.29]],
      [C.brass, [0.76, 0.29]],
      [C.gold, [0.66, 0.26]]
    ]);
    const emissiveColors = new Map<string, number>([
      [C.red, 0.55],
      [C.amber, 0.62],
      [C.teal, 0.48],
      [C.amberHighlight, 0.40],
      [C.redHighlight, 0.35],
      [C.tealHighlight, 0.35]
    ]);
    const visited = new Set<THREE.Material>();
    b.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial) || visited.has(material)) continue;
        visited.add(material);
        const color = `#${material.color.getHexString()}`;
        const metal = metalColors.get(color);
        if (metal) {
          material.metalness = metal[0];
          material.roughness = metal[1];
        }
        if (color === C.burgundy || color === C.walnut) {
          material.roughness = 0.33;
          material.metalness = 0.12;
        }
        if (color === C.black || color === C.vinyl) {
          material.roughness = 0.30;
          material.metalness = 0.18;
        }
        const glow = emissiveColors.get(color);
        if (glow !== undefined) {
          material.emissive.copy(material.color);
          material.emissiveIntensity = glow;
          material.roughness = 0.24;
          material.metalness = 0.06;
        }
        if (color === C.glass) {
          material.transparent = true;
          material.opacity = 0.14;
          material.depthWrite = false;
          material.side = THREE.DoubleSide;
          material.roughness = 0.10;
          material.metalness = 0.08;
        }
        if (color === C.reflection) {
          material.transparent = true;
          material.opacity = 0.48;
          material.depthWrite = false;
          material.roughness = 0.15;
          material.emissive.copy(material.color);
          material.emissiveIntensity = 0.22;
        }
        material.needsUpdate = true;
      }
    });

    return b.root;
  }
}
```