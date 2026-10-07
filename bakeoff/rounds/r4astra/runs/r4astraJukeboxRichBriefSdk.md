```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Stardust 57",
  description:
    "A jewel-toned 1950s diner jukebox with illuminated ruby, amber and teal arches, a glass-enclosed record changer, miniature song cards, chrome pushbuttons and a starburst speaker grille."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Stardust 57" });
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    wood: "#49252a",
    wine: "#702c35",
    darkWine: "#351c26",
    side: "#592c31",
    black: "#121c24",
    vinyl: "#161c25",
    vinylEdge: "#303a44",
    chrome: "#b8cbd0",
    bright: "#edf4ed",
    steel: "#647d89",
    gold: "#dcb36b",
    brass: "#98784a",
    grille: "#655d4e",
    cream: "#fff0c9",
    paper: "#eee3bf",
    ink: "#29464a",
    tealPanel: "#23585c",
    red: "#f44539",
    amber: "#ffc14b",
    teal: "#39c7bd",
    redCore: "#ffc4a0",
    amberCore: "#fff3b2",
    tealCore: "#c4fff0",
    glass: "#94dbe3",
    reflection: "#e1fcff",
    rubber: "#202329"
  };

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: number[] = [0, 0, 0]
  ) {
    return b.part(geometry, color, { at, bone: cabinet });
  }

  function box(
    x: number, y: number, z: number,
    w: number, h: number, d: number, color: string
  ) {
    return part(new THREE.BoxGeometry(w, h, d), color, [x, y, z]);
  }

  function cylinder(
    x: number, y: number, z: number,
    r: number, h: number, color: string,
    axis: "X" | "Y" | "Z" = "Y", segments = 24
  ) {
    const g = new THREE.CylinderGeometry(r, r, h, segments, 1);
    if (axis === "Z") g.rotateX(Math.PI / 2);
    if (axis === "X") g.rotateZ(Math.PI / 2);
    return part(g, color, [x, y, z]);
  }

  function rod(a: number[], c: number[], radius: number, color: string, sides = 8) {
    const v = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    return b.part(
      new THREE.CylinderGeometry(radius, radius, v.length(), sides, 1),
      color,
      {
        at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
        dir: v,
        bone: cabinet
      }
    );
  }

  function torus(
    x: number, y: number, z: number,
    r: number, tube: number, color: string,
    axis: "Y" | "Z" = "Z", segments = 32
  ) {
    const g = new THREE.TorusGeometry(r, tube, 5, segments);
    if (axis === "Y") g.rotateX(Math.PI / 2);
    return part(g, color, [x, y, z]);
  }

  function polygon(points: number[][]) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    return shape;
  }

  function plaque(points: number[][], z: number, depth: number, color: string) {
    return part(
      new THREE.ExtrudeGeometry(polygon(points), {
        depth, bevelEnabled: false, curveSegments: 1
      }),
      color, [0, 0, z]
    );
  }

  function archPoints(r: number, bottom: number, spring: number) {
    const p = [[-r, bottom], [r, bottom], [r, spring]];
    for (let i = 1; i <= 40; i++) {
      const a = (i / 40) * Math.PI;
      p.push([Math.cos(a) * r, spring + Math.sin(a) * r]);
    }
    return p;
  }

  function arched(
    r: number, bottom: number, spring: number,
    z: number, depth: number, color: string,
    hole?: { r: number; bottom: number; spring: number },
    bevel = 0
  ) {
    const shape = polygon(archPoints(r, bottom, spring));
    if (hole) {
      const points = archPoints(hole.r, hole.bottom, hole.spring)
        .reverse().map(p => new THREE.Vector2(p[0], p[1]));
      const cut = new THREE.Path(points);
      cut.closePath();
      shape.holes.push(cut);
    }
    return part(new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1,
      curveSegments: 1
    }), color, [0, 0, z]);
  }

  function uPath(r: number, bottom: number, spring: number, z: number) {
    const p: number[][] = [[-r, bottom, z], [-r, spring, z]];
    for (let i = 1; i <= 40; i++) {
      const a = Math.PI * (1 - i / 40);
      p.push([Math.cos(a) * r, spring + Math.sin(a) * r, z]);
    }
    p.push([r, bottom, z]);
    return p;
  }

  function screw(x: number, y: number, z: number, r = 0.006) {
    cylinder(x, y, z, r, 0.003, C.bright, "Z", 10);
    box(x, y, z + 0.0021, r * 1.23, 0.0013, 0.0008, C.steel);
  }

  // Tiny lettering is actual geometry: single-colour, seven-row signwriter's type.
  const glyphs: Record<string, string[]> = {
    A: ["01110","10001","10001","11111","10001","10001","10001"],
    B: ["11110","10001","10001","11110","10001","10001","11110"],
    C: ["01111","10000","10000","10000","10000","10000","01111"],
    D: ["11110","10001","10001","10001","10001","10001","11110"],
    E: ["11111","10000","10000","11110","10000","10000","11111"],
    F: ["11111","10000","10000","11110","10000","10000","10000"],
    G: ["01111","10000","10000","10111","10001","10001","01111"],
    H: ["10001","10001","10001","11111","10001","10001","10001"],
    I: ["11111","00100","00100","00100","00100","00100","11111"],
    J: ["00111","00010","00010","00010","10010","10010","01100"],
    K: ["10001","10010","10100","11000","10100","10010","10001"],
    L: ["10000","10000","10000","10000","10000","10000","11111"],
    M: ["10001","11011","10101","10101","10001","10001","10001"],
    N: ["10001","11001","11001","10101","10011","10011","10001"],
    O: ["01110","10001","10001","10001","10001","10001","01110"],
    P: ["11110","10001","10001","11110","10000","10000","10000"],
    Q: ["01110","10001","10001","10001","10101","10010","01101"],
    R: ["11110","10001","10001","11110","10100","10010","10001"],
    S: ["01111","10000","10000","01110","00001","00001","11110"],
    T: ["11111","00100","00100","00100","00100","00100","00100"],
    U: ["10001","10001","10001","10001","10001","10001","01110"],
    V: ["10001","10001","10001","10001","10001","01010","00100"],
    W: ["10001","10001","10001","10101","10101","10101","01010"],
    X: ["10001","10001","01010","00100","01010","10001","10001"],
    Y: ["10001","10001","01010","00100","00100","00100","00100"],
    Z: ["11111","00001","00010","00100","01000","10000","11111"],
    "0": ["01110","10001","10011","10101","11001","10001","01110"],
    "1": ["00100","01100","00100","00100","00100","00100","01110"],
    "2": ["01110","10001","00001","00010","00100","01000","11111"],
    "3": ["11110","00001","00001","01110","00001","00001","11110"],
    "4": ["00010","00110","01010","10010","11111","00010","00010"],
    "5": ["11111","10000","10000","11110","00001","00001","11110"],
    "6": ["01110","10000","10000","11110","10001","10001","01110"],
    "7": ["11111","00001","00010","00100","01000","01000","01000"],
    "8": ["01110","10001","10001","01110","10001","10001","01110"],
    "9": ["01110","10001","10001","01111","00001","00001","01110"],
    "-": ["00000","00000","00000","11111","00000","00000","00000"],
    ".": ["00000","00000","00000","00000","00000","00110","00110"],
    " ": ["00000","00000","00000","00000","00000","00000","00000"]
  };

  function text(
    value: string, x: number, y: number, z: number,
    height: number, color: string, width?: number
  ) {
    const py = height / 7;
    const px = width ? width / (value.length * 6 - 1) : py;
    const total = (value.length * 6 - 1) * px;
    const verts: number[] = [];
    for (let k = 0; k < value.length; k++) {
      const glyph = glyphs[value[k]] || glyphs[" "];
      for (let row = 0; row < 7; row++) {
        let col = 0;
        while (col < 5) {
          if (glyph[row][col] !== "1") { col++; continue; }
          const start = col;
          while (col < 5 && glyph[row][col] === "1") col++;
          const x0 = -total / 2 + (k * 6 + start) * px;
          const x1 = -total / 2 + (k * 6 + col) * px;
          const y0 = height / 2 - (row + 1) * py;
          const y1 = height / 2 - row * py;
          verts.push(x0,y0,0, x1,y0,0, x1,y1,0, x0,y0,0, x1,y1,0, x0,y1,0);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.computeVertexNormals();
    return part(g, color, [x, y, z]);
  }

  // Rubber feet, a substantial skirt, and the rounded wooden cabinet.
  for (const x of [-0.42, 0.42])
    for (const z of [-0.22, 0.22])
      box(x, 0.015, z, 0.12, 0.03, 0.105, C.rubber);

  box(0, 0.073, -0.012, 1.065, 0.105, 0.662, C.darkWine);
  box(0, 0.113, -0.005, 1.054, 0.021, 0.646, C.chrome);
  box(0, 0.04, -0.01, 1.073, 0.013, 0.665, C.steel);
  box(0, 0.076, 0.324, 1.026, 0.039, 0.015, C.wine);
  box(0, 0.097, 0.334, 1.026, 0.005, 0.008, C.bright);

  const opening = { r: 0.329, bottom: 0.962, spring: 1.10 };
  arched(0.515, 0.115, 1.10, -0.289, 0.558, C.wood, opening, 0.006);
  arched(0.515, 0.118, 1.10, -0.314, 0.022, C.darkWine);
  arched(0.506, 0.127, 1.10, 0.272, 0.02, C.wine, opening);
  b.sweep(uPath(0.505, 0.136, 1.10, 0.296), 0.006, { color: C.bright });
  b.sweep(uPath(0.512, 0.138, 1.10, -0.297), 0.005, { color: C.brass });

  // Side cheeks have inset lacquer panels, pinstriping, cooling slots and hardware.
  for (const s of [-1, 1]) {
    box(s * 0.518, 0.619, -0.024, 0.01, 0.887, 0.443, C.darkWine);
    box(s * 0.524, 0.619, -0.024, 0.008, 0.84, 0.393, C.side);
    for (const z of [-0.227, 0.179])
      box(s * 0.53, 0.619, z, 0.009, 0.878, 0.006, C.gold);
    for (const y of [0.182, 1.055])
      box(s * 0.53, y, -0.024, 0.009, 0.006, 0.412, C.gold);
    for (let i = 0; i < 7; i++) {
      const y = 0.54 + i * 0.042;
      box(s * 0.531, y, -0.035, 0.009, 0.014, 0.256, C.darkWine);
      box(s * 0.537, y - 0.006, -0.035, 0.007, 0.003, 0.251, C.brass);
    }
    for (const y of [0.255, 0.291, 0.327])
      box(s * 0.537, y, -0.024, 0.008, 0.009, 0.334, C.chrome);
    for (const y of [0.21, 1.023])
      for (const z of [-0.197, 0.15])
        cylinder(s * 0.536, y, z, 0.006, 0.006, C.chrome, "X", 10);
  }

  // Three concentric luminous horseshoes. Metal channels and pale cores give
  // the light a round, glass-tube character even without a bloom post-process.
  const tubes = [
    { r: 0.469, t: 0.023, color: C.red, core: C.redCore },
    { r: 0.423, t: 0.022, color: C.amber, core: C.amberCore },
    { r: 0.378, t: 0.020, color: C.teal, core: C.tealCore }
  ];
  for (const tube of tubes) {
    b.sweep(uPath(tube.r, 0.158, 1.10, 0.307), tube.t + 0.005, { color: C.chrome });
    b.sweep(uPath(tube.r, 0.158, 1.10, 0.332), tube.t, { color: tube.color });
    b.sweep(uPath(tube.r - 0.004, 0.165, 1.10, 0.332 + tube.t - 0.001),
      0.0034, { color: tube.core });

    for (const s of [-1, 1]) {
      cylinder(s * tube.r, 0.158, 0.331, tube.t + 0.005, 0.035, C.chrome);
      cylinder(s * tube.r, 0.18, 0.331, tube.t + 0.002, 0.009, C.gold);
      for (let i = 0; i < 7; i++)
        torus(s * tube.r, 0.245 + i * 0.121, 0.332,
          tube.t + 0.0008, 0.0022, C.gold, "Y", 12);
    }

    for (let i = 1; i <= 5; i++) {
      const a = i * Math.PI / 6;
      const g = new THREE.TorusGeometry(tube.t + 0.0008, 0.0022, 4, 12);
      g.rotateX(Math.PI / 2);
      g.rotateZ(a);
      part(g, C.gold, [
        tube.r * Math.cos(a), 1.10 + tube.r * Math.sin(a), 0.332
      ]);
    }
  }

  // Window frame and a genuinely recessed mechanism compartment.
  arched(0.34, 0.954, 1.10, 0.302, 0.064, C.chrome,
    { r: 0.317, bottom: 0.974, spring: 1.10 });
  arched(0.319, 0.972, 1.10, 0.367, 0.013, C.gold,
    { r: 0.311, bottom: 0.98, spring: 1.10 });
  arched(0.328, 0.964, 1.10, -0.235, 0.016, C.black);
  arched(0.285, 0.988, 1.10, -0.212, 0.009, C.tealPanel);

  // Rear ribs, feet and changer chassis are visible through the glass.
  for (const x of [-0.247, 0.247]) {
    box(x, 1.123, -0.092, 0.021, 0.255, 0.055, C.steel);
    box(x, 1.123, -0.06, 0.007, 0.252, 0.011, C.bright);
    screw(x, 1.222, -0.05, 0.006);
  }
  box(0, 0.998, 0.042, 0.568, 0.029, 0.402, C.steel);
  box(0, 1.017, 0.215, 0.547, 0.014, 0.046, C.chrome);
  for (const x of [-0.218, 0.218]) {
    cylinder(x, 1.027, 0.145, 0.014, 0.03, C.brass);
    box(x, 1.034, 0.148, 0.031, 0.01, 0.036, C.gold);
  }

  // Eight thin, separate records, a turntable, labels, grooves and spindle.
  const recordX = -0.035, recordZ = 0.076;
  cylinder(recordX, 1.032, recordZ, 0.212, 0.018, C.chrome, "Y", 40);
  cylinder(recordX, 1.044, recordZ, 0.205, 0.008, C.brass, "Y", 40);
  for (let i = 0; i < 8; i++) {
    const y = 1.055 + i * 0.011;
    cylinder(recordX, y, recordZ, 0.198, 0.008, i % 2 ? C.vinyl : C.vinylEdge, "Y", 40);
    cylinder(recordX, y + 0.0041, recordZ, 0.191, 0.0012, C.vinyl, "Y", 40);
  }
  const recordTop = 1.137;
  for (const radius of [0.084, 0.106, 0.13, 0.157, 0.182])
    torus(recordX, recordTop, recordZ, radius, 0.0009, C.vinylEdge, "Y", 40);
  cylinder(recordX, recordTop + 0.001, recordZ, 0.06, 0.002, C.paper, "Y", 32);
  cylinder(recordX, recordTop + 0.0025, recordZ, 0.041, 0.0015, C.red, "Y", 24);
  torus(recordX, recordTop + 0.0035, recordZ, 0.046, 0.0012, C.gold, "Y", 24);
  cylinder(recordX, 1.114, recordZ, 0.008, 0.148, C.bright, "Y", 12);
  cylinder(recordX, 1.189, recordZ, 0.011, 0.008, C.gold, "Y", 12);

  // Articulated record-changer arm with its round gearbox and forked pickup.
  cylinder(0.215, 1.064, 0.06, 0.034, 0.05, C.brass, "Y", 16);
  cylinder(0.215, 1.174, 0.06, 0.016, 0.198, C.chrome, "Y", 12);
  cylinder(0.215, 1.268, 0.066, 0.027, 0.041, C.chrome, "Z", 16);
  cylinder(0.215, 1.268, 0.091, 0.017, 0.011, C.gold, "Z", 12);
  screw(0.215, 1.268, 0.099, 0.007);
  rod([0.215, 1.273, 0.064], [0.139, 1.306, 0.112], 0.017, C.chrome);
  rod([0.139, 1.306, 0.112], [-0.072, 1.251, 0.214], 0.015, C.chrome);
  rod([0.13, 1.311, 0.128], [-0.073, 1.259, 0.229], 0.004, C.bright);
  box(-0.072, 1.24, 0.22, 0.054, 0.036, 0.046, C.darkWine);
  box(-0.072, 1.258, 0.222, 0.061, 0.009, 0.05, C.chrome);
  for (const x of [-0.091, -0.053]) {
    rod([x, 1.227, 0.225], [x, 1.17, 0.241], 0.004, C.gold);
    rod([x, 1.17, 0.241], [x, 1.163, 0.224], 0.004, C.gold);
  }
  // A small slotted record guide beside the stack.
  box(-0.258, 1.108, 0.081, 0.018, 0.135, 0.034, C.gold);
  for (let i = 0; i < 6; i++)
    box(-0.258, 1.065 + i * 0.018, 0.101, 0.024, 0.005, 0.007, C.black);

  box(0, 1.358, -0.082, 0.163, 0.038, 0.015, C.darkWine);
  box(0, 1.38, -0.075, 0.175, 0.004, 0.012, C.gold);
  text("HI - FI", 0, 1.359, -0.072, 0.018, C.cream, 0.127);

  // A lightly bulged, arch-shaped glass pane; the changer remains readable.
  {
    const positions: number[] = [], indices: number[] = [];
    const rows = 22, cols = 24;
    const bottom = 0.981, radius = 0.31, spring = 1.10, top = spring + radius;
    for (let iy = 0; iy <= rows; iy++) {
      const t = iy / rows;
      const y = bottom + t * (top - bottom);
      const half = y <= spring ? radius :
        Math.sqrt(Math.max(0, radius * radius - (y - spring) ** 2));
      for (let ix = 0; ix <= cols; ix++) {
        const u = ix / cols * 2 - 1;
        const x = u * half;
        const z = 0.38 + 0.025 * (1 - u * u) * Math.sin(t * Math.PI);
        positions.push(x, y, z);
      }
    }
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const a = iy * (cols + 1) + ix, c = a + cols + 1;
        indices.push(a, a + 1, c + 1, a, c + 1, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    part(g, C.glass);
  }
  plaque([[-0.263,1.153],[-0.254,1.217],[-0.224,1.26],
    [-0.199,1.279],[-0.227,1.241],[-0.25,1.185]],
    0.407, 0.0005, C.reflection);
  plaque([[-0.236,1.153],[-0.223,1.21],[-0.214,1.225],[-0.226,1.169]],
    0.408, 0.0005, C.reflection);
  for (const x of [-0.326, 0.326]) screw(x, 1.006, 0.378, 0.005);

  // Cast-chrome selection console, enamel header, paper labels and pushbuttons.
  box(0, 0.803, 0.324, 0.669, 0.291, 0.056, C.chrome);
  box(0, 0.802, 0.358, 0.641, 0.268, 0.018, C.tealPanel);
  box(0, 0.916, 0.374, 0.63, 0.049, 0.017, C.darkWine);
  box(0, 0.889, 0.382, 0.631, 0.004, 0.01, C.gold);
  text("STARDUST", -0.075, 0.916, 0.385, 0.024, C.cream, 0.333);

  // A clearly recessed coin mouth and a tiny denomination engraving.
  box(0.249, 0.917, 0.39, 0.119, 0.037, 0.019, C.chrome);
  box(0.255, 0.923, 0.401, 0.062, 0.010, 0.003, C.steel);
  box(0.255, 0.924, 0.403, 0.054, 0.0045, 0.002, C.black);
  box(0.255, 0.918, 0.405, 0.062, 0.003, 0.005, C.bright);
  text("25C", 0.251, 0.906, 0.402, 0.0065, C.ink);
  screw(0.198, 0.917, 0.403, 0.003);
  screw(0.300, 0.917, 0.403, 0.003);

  const songs = [
    ["BLUE MOON", "THE MARCELS"],
    ["MACK THE KNIFE", "BOBBY DARIN"],
    ["EARTH ANGEL", "THE PENGUINS"],
    ["ONLY YOU", "THE PLATTERS"],
    ["PEGGY SUE", "BUDDY HOLLY"],
    ["JAILHOUSE ROCK", "ELVIS PRESLEY"],
    ["DREAM LOVER", "BOBBY DARIN"],
    ["LOVE LETTERS", "KITTY KALLEN"],
    ["AT THE HOP", "DANNY AND JUNIORS"],
    ["SWEET SIXTEEN", "CHUCK BERRY"],
    ["MISTY", "JOHNNY MATHIS"],
    ["GOODNIGHT", "THE SPANIELS"]
  ];
  for (let row = 0; row < 4; row++) {
    const y = 0.856 - row * 0.052;
    for (let col = 0; col < 3; col++) {
      const i = row * 3 + col;
      const x = (col - 1) * 0.214;
      box(x - 0.026, y, 0.376, 0.146, 0.044, 0.013, C.gold);
      box(x - 0.026, y, 0.384, 0.136, 0.037, 0.004, C.paper);
      box(x - 0.026, y - 0.001, 0.387, 0.124, 0.0012, 0.001, C.wine);
      text(songs[i][0], x - 0.026, y + 0.009, 0.388, 0.0071, C.ink);
      text(songs[i][1], x - 0.026, y - 0.010, 0.388, 0.0053, C.wine);

      box(x + 0.074, y, 0.383, 0.039, 0.043, 0.025, C.steel);
      box(x + 0.074, y + 0.001, 0.398, 0.034, 0.036, 0.019, C.chrome);
      box(x + 0.074, y + 0.005, 0.409, 0.026, 0.024, 0.006, C.cream);
      box(x + 0.074, y - 0.014, 0.408, 0.028, 0.003, 0.004, C.bright);
      text(String(i + 1), x + 0.074, y + 0.005, 0.413, 0.009, C.ink);
    }
  }
  for (const x of [-0.319, 0.319])
    for (const y of [0.675, 0.933]) screw(x, y, 0.379, 0.0045);

  // Speaker recess and the fine woven mesh behind the large, emphatic sunburst.
  const surround = [
    [-0.328,0.158],[0.328,0.158],[0.328,0.598],
    [0.298,0.637],[-0.298,0.637],[-0.328,0.598]
  ];
  const inset = [
    [-0.307,0.178],[0.307,0.178],[0.307,0.592],
    [0.28,0.616],[-0.28,0.616],[-0.307,0.592]
  ];
  plaque(surround, 0.293, 0.038, C.chrome);
  plaque(inset, 0.331, 0.009, C.black);
  for (let i = 0; i < 27; i++) {
    const x = -0.293 + i * (0.586 / 26);
    const top = Math.abs(x) > 0.277 ? 0.59 : 0.607;
    box(x, (0.188 + top) / 2, 0.344, 0.0028, top - 0.188, 0.003, C.grille);
  }
  for (let i = 0; i < 20; i++) {
    const y = 0.187 + i * 0.0217;
    box(0, y, 0.346, y > 0.592 ? 0.548 : 0.60, 0.0022, 0.003, C.brass);
  }

  const hubY = 0.397;
  for (let i = 0; i < 20; i++) {
    const a = i * Math.PI * 2 / 20;
    const dx = Math.cos(a), dy = Math.sin(a);
    const reach = 1 / Math.sqrt((dx / 0.296) ** 2 + (dy / 0.204) ** 2);
    const inner = 0.047, widest = inner + (reach - inner) * 0.48;
    const width = i % 2 === 0 ? 0.011 : 0.006;
    const points = [
      [dx * inner, hubY + dy * inner],
      [dx * widest - dy * width, hubY + dy * widest + dx * width],
      [dx * reach, hubY + dy * reach],
      [dx * widest + dy * width, hubY + dy * widest - dx * width]
    ];
    plaque(points, 0.354, 0.009, i % 2 === 0 ? C.bright : C.gold);
  }

  cylinder(0, hubY, 0.367, 0.06, 0.018, C.chrome, "Z", 32);
  torus(0, hubY, 0.379, 0.051, 0.004, C.gold);
  cylinder(0, hubY, 0.379, 0.044, 0.01, C.wine, "Z", 24);
  plaque([
    [0,hubY+0.039],[0.009,hubY+0.009],[0.036,hubY],
    [0.009,hubY-0.009],[0,hubY-0.039],[-0.009,hubY-0.009],
    [-0.036,hubY],[-0.009,hubY+0.009]
  ], 0.387, 0.004, C.cream);
  cylinder(0, hubY, 0.394, 0.006, 0.005, C.gold, "Z", 12);

  box(0, 0.166, 0.345, 0.633, 0.009, 0.011, C.bright);
  box(0, 0.627, 0.345, 0.581, 0.007, 0.01, C.gold);
  for (const x of [-0.318, 0.318])
    for (const y of [0.186, 0.59]) screw(x, y, 0.337, 0.004);

  // Small manufacturer badge on the kickplate.
  box(0, 0.074, 0.337, 0.177, 0.028, 0.008, C.gold);
  box(0, 0.074, 0.342, 0.166, 0.02, 0.003, C.darkWine);
  text("SELECT-O-MATIC", 0, 0.074, 0.345, 0.008, C.cream, 0.15);

  // Material adjustments preserve the builder's shared-per-colour materials.
  const metalColors = new Set([C.chrome, C.bright, C.steel, C.gold, C.brass]);
  const glowColors = new Set([C.red, C.amber, C.teal]);
  const coreColors = new Set([C.redCore, C.amberCore, C.tealCore]);
  b.root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const color = "#" + material.color.getHexString();
      if (metalColors.has(color)) {
        material.metalness = 0.68;
        material.roughness = 0.24;
      } else if (glowColors.has(color)) {
        material.metalness = 0.12;
        material.roughness = 0.24;
        material.emissive.copy(material.color);
        material.emissiveIntensity = 0.48;
      } else if (coreColors.has(color)) {
        material.roughness = 0.22;
        material.emissive.copy(material.color);
        material.emissiveIntensity = 0.75;
      } else if (color === C.glass) {
        material.transparent = true;
        material.opacity = 0.12;
        material.depthWrite = false;
        material.roughness = 0.12;
        material.metalness = 0.14;
        material.side = THREE.DoubleSide;
        object.renderOrder = 2;
      } else if (color === C.reflection) {
        material.transparent = true;
        material.opacity = 0.36;
        material.depthWrite = false;
        material.roughness = 0.2;
        material.emissive.set(C.reflection);
        material.emissiveIntensity = 0.15;
        object.renderOrder = 3;
      } else if ([C.wood, C.wine, C.darkWine, C.side].includes(color)) {
        material.roughness = 0.32;
        material.metalness = 0.08;
      } else if (color === C.vinyl || color === C.vinylEdge) {
        material.roughness = 0.29;
        material.metalness = 0.15;
      }
    }
  });

  return b.root;
}
```