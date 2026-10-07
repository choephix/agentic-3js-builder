import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Diner Jukebox",
  description:
    "A 1950s diner jukebox: a tall charcoal arch of glowing red, amber and teal tubes over a domed record window with a picking arm, a starburst speaker, two rows of chrome selection buttons with title cards, and a coin slot.",
};

type V = [number, number, number];

const PI = Math.PI;

// Palette: one shared material per colour string.
const CHROME = "#d9dfe6";
const RED = "#b5202c";
const CREAM = "#f1e6cd";
const CARD = "#fbf7ee";
const CHARCOAL = "#22303a";
const TEAL_TRIM = "#1fa89a";
const TUBE_RED = "#ff3346";
const TUBE_AMBER = "#ffb12a";
const TUBE_TEAL = "#17e6cc";
const GOLD = "#e9b44c";
const DARK = "#141216";
const VINYL = "#17171c";
const LABEL_RED = "#d8452f";
const LABEL_TEAL = "#2fb7a8";
const LABEL_AMBER = "#e89a1c";
const INK = "#2a2420";
const GLASS = "#c6f4f8";

// Materials that get a glow, chrome or glass treatment after building.
const GLOW = new Set(["ff3346", "ffb12a", "17e6cc"]);
const CHROME_HEX = "d9dfe6";
const GLASS_HEX = "c6f4f8";

// Key dimensions in metres.
const HALF_W = 0.31; // cabinet half-width
const MID_FRONT = 0.22; // front face of the cream window section
const ARCH_BASE = 1.1; // where the arch starts
const ARCH_CENTRE = 1.31; // centre of the arch's round top
const SPK_Y = 0.27; // speaker centre height

// Points along a cubic bezier, n + 1 samples.
function cubic(p0: V, p1: V, p2: V, p3: V, n: number): V[] {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const w0 = u * u * u;
    const w1 = 3 * u * u * t;
    const w2 = 3 * u * t * t;
    const w3 = t * t * t;
    out.push([
      w0 * p0[0] + w1 * p1[0] + w2 * p2[0] + w3 * p3[0],
      w0 * p0[1] + w1 * p1[1] + w2 * p2[1] + w3 * p3[1],
      w0 * p0[2] + w1 * p1[2] + w2 * p2[2] + w3 * p3[2],
    ]);
  }
  return out;
}

// An arch path: up the left leg, over a half circle of radius r, down the right leg.
function archPath(r: number, yBase: number, yArc: number, z: number, n: number): V[] {
  const pts: V[] = [
    [-r, yBase, z],
    [-r, yArc, z],
  ];
  for (let i = 1; i < n; i++) {
    const a = PI - (i / n) * PI;
    pts.push([r * Math.cos(a), yArc + r * Math.sin(a), z]);
  }
  pts.push([r, yArc, z], [r, yBase, z]);
  return pts;
}

// Glow the tubes and tune chrome and glass. Materials are shared per colour,
// so this changes every part of that colour at once.
function tuneMaterials(root: THREE.Object3D) {
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const m = o.material;
    if (!(m instanceof THREE.MeshStandardMaterial)) return;
    const hex = m.color.getHexString(THREE.SRGBColorSpace);
    if (GLOW.has(hex)) {
      m.emissive.copy(m.color);
      m.emissiveIntensity = 0.85;
    } else if (hex === CHROME_HEX) {
      m.metalness = 0.5;
      m.roughness = 0.28;
    } else if (hex === GLASS_HEX) {
      m.transparent = true;
      m.opacity = 0.32;
      m.depthWrite = false;
      m.roughness = 0.05;
    }
  });
}

export default function build() {
  const b = createBuilder({ name: "jukebox" });
  b.joint("cabinet", { at: [0, 0, 0] });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, seg: number, alongZ = false) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    return alongZ ? g.rotateX(PI / 2) : g;
  };

  // ---- base and body ----
  b.part(box(0.66, 0.06, 0.54), CHROME, { at: [0, 0.03, 0] }); // chrome plinth
  b.part(box(0.62, 0.68, 0.5), RED, { at: [0, 0.4, 0] }); // red lower body
  for (const s of [-1, 1]) {
    b.part(box(0.012, 0.66, 0.012), CHROME, { at: [s * 0.305, 0.4, 0.252] }); // corner strips
    b.part(box(0.006, 0.04, 0.4), TEAL_TRIM, { at: [s * 0.313, 0.3, 0] }); // side teal stripe
    b.part(box(0.006, 0.008, 0.4), CHROME, { at: [s * 0.313, 0.33, 0] }); // side pinstripe
  }
  b.part(box(0.64, 0.024, 0.52), CHROME, { at: [0, 0.74, 0] }); // chrome ledge
  b.part(box(0.62, 0.36, 0.44), CREAM, { at: [0, 0.92, 0] }); // cream window section
  for (const s of [-1, 1]) {
    b.part(box(0.012, 0.36, 0.012), CHROME, { at: [s * 0.305, 0.92, 0.218] });
  }
  b.part(box(0.64, 0.024, 0.46), CHROME, { at: [0, ARCH_BASE, 0] }); // chrome ledge under arch

  // ---- charcoal arch with glowing tubes ----
  const shape = new THREE.Shape();
  shape.moveTo(-HALF_W, ARCH_BASE);
  shape.lineTo(-HALF_W, ARCH_CENTRE);
  shape.absarc(0, ARCH_CENTRE, HALF_W, PI, 0, true);
  shape.lineTo(HALF_W, ARCH_BASE);
  shape.lineTo(-HALF_W, ARCH_BASE);
  const archGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.48,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 24,
  }).translate(0, 0, -0.48);
  b.part(archGeo, CHARCOAL, { at: [0, 0, MID_FRONT] });

  // Chrome outline along the arch edge.
  b.sweep(archPath(HALF_W + 0.004, ARCH_BASE, ARCH_CENTRE, 0.236, 30), 0.009, {
    color: CHROME,
  });

  // Three nested glowing tubes: red outside, amber, teal inside.
  const TUBE_Z = 0.245;
  const tubes: [number, string][] = [
    [0.262, TUBE_RED],
    [0.232, TUBE_AMBER],
    [0.202, TUBE_TEAL],
  ];
  for (const [r, c] of tubes) {
    b.sweep(archPath(r, 1.14, ARCH_CENTRE, TUBE_Z, 26), 0.011, { color: c });
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.015, 12, 8), CHROME, { at: [s * r, 1.14, TUBE_Z] });
    }
  }

  // Chrome finial on top of the arch.
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.03, 16), CHROME, { at: [0, 1.64, -0.02] });
  b.part(new THREE.SphereGeometry(0.028, 14, 10), CHROME, { at: [0, 1.672, -0.02] });

  // ---- domed record window ----
  b.part(box(0.42, 0.3, 0.012), DARK, { at: [0, 0.92, 0.226] }); // dark well
  b.part(box(0.46, 0.022, 0.022), CHROME, { at: [0, 1.078, 0.236] }); // frame top
  b.part(box(0.46, 0.022, 0.022), CHROME, { at: [0, 0.762, 0.236] }); // frame bottom
  for (const s of [-1, 1]) {
    b.part(box(0.022, 0.33, 0.022), CHROME, { at: [s * 0.216, 0.92, 0.236] });
    b.part(cyl(0.005, 0.27, 8), CHROME, { at: [s * 0.092, 0.92, 0.245] }); // record rack rods
  }

  // Shingled stack of records, the top one largest in front.
  const records = [
    { y: 0.875, z: 0.242, c: LABEL_RED },
    { y: 0.895, z: 0.25, c: LABEL_TEAL },
    { y: 0.915, z: 0.258, c: LABEL_AMBER },
    { y: 0.935, z: 0.266, c: LABEL_RED },
    { y: 0.955, z: 0.274, c: LABEL_TEAL },
  ];
  for (const r of records) {
    b.part(cyl(0.075, 0.006, 28, true), VINYL, { at: [0, r.y, r.z] });
    b.part(cyl(0.026, 0.006, 18, true), r.c, { at: [0, r.y, r.z + 0.006] });
  }

  // Glass dome over the window.
  const dome = new THREE.SphereGeometry(1, 28, 16).scale(0.2, 0.16, 0.08);
  b.part(dome, GLASS, { at: [0, 0.92, 0.236] });

  // ---- record-picking arm ----
  const PIVOT: V = [0.24, 0.865, 0.25];
  const GRIP: V = [0.09, 0.975, 0.285];
  b.part(box(0.05, 0.06, 0.012), CHROME, { at: [0.24, 0.865, 0.236] }); // mount plate
  b.part(cyl(0.02, 0.03, 16, true), CHROME, { at: PIVOT }); // pivot boss
  b.sweep(cubic(PIVOT, [0.21, 0.95, 0.27], [0.17, 1.0, 0.285], GRIP, 18), 0.008, {
    color: CHROME,
  });
  b.part(box(0.03, 0.03, 0.022), CHROME, { at: GRIP }); // gripper head

  // ---- starburst speaker ----
  b.part(cyl(0.13, 0.01, 32, true), DARK, { at: [0, SPK_Y, 0.256] });
  b.part(new THREE.TorusGeometry(0.138, 0.011, 8, 40), CHROME, { at: [0, SPK_Y, 0.262] });
  const RAYS = 24;
  for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * PI * 2;
    const ray = box(0.011, 0.1, 0.006).rotateZ(a - PI / 2);
    b.part(ray, i % 2 === 0 ? GOLD : CHROME, {
      at: [0.07 * Math.cos(a), SPK_Y + 0.07 * Math.sin(a), 0.266],
    });
  }
  b.part(new THREE.SphereGeometry(0.028, 14, 10), CHROME, { at: [0, SPK_Y, 0.268] });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * PI * 2 + PI / 8;
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), CHROME, {
      at: [0.16 * Math.cos(a), SPK_Y + 0.16 * Math.sin(a), 0.256],
    });
  }

  // ---- selection panel: two rows of five title cards and chrome buttons ----
  b.part(box(0.56, 0.21, 0.012), CREAM, { at: [0, 0.615, 0.256] });
  const COLS = [-0.2, -0.1, 0, 0.1, 0.2];
  const ROWS = [
    { btn: 0.65, card: 0.695 },
    { btn: 0.545, card: 0.59 },
  ];
  const JEWELS = [LABEL_RED, LABEL_TEAL, LABEL_AMBER];
  ROWS.forEach((row, r) => {
    COLS.forEach((x, c) => {
      const jewel = JEWELS[(c + r) % 3];
      // Title card: cream face, coloured edge band, two ink lines.
      b.part(box(0.08, 0.03, 0.005), CARD, { at: [x, row.card, 0.2645] });
      b.part(box(0.008, 0.03, 0.002), jewel, { at: [x - 0.036, row.card, 0.2685] });
      b.part(box(0.05, 0.004, 0.002), INK, { at: [x + 0.004, row.card + 0.006, 0.2685] });
      b.part(box(0.034, 0.004, 0.002), INK, { at: [x - 0.004, row.card - 0.006, 0.2685] });
      // Chrome button with a coloured jewel.
      b.part(cyl(0.016, 0.02, 18, true), CHROME, { at: [x, row.btn, 0.268] });
      b.part(new THREE.TorusGeometry(0.019, 0.003, 6, 18), CHROME, { at: [x, row.btn, 0.279] });
      b.part(cyl(0.008, 0.006, 12, true), jewel, { at: [x, row.btn, 0.2815] });
    });
  });

  // ---- coin slot and coin return ----
  b.part(box(0.07, 0.1, 0.008), CHROME, { at: [0.22, 0.42, 0.258] });
  b.part(box(0.012, 0.045, 0.006), DARK, { at: [0.22, 0.44, 0.2655] });
  b.part(cyl(0.012, 0.016, 14, true), LABEL_RED, { at: [0.22, 0.38, 0.266] });

  tuneMaterials(b.root);
  return b.root;
}
