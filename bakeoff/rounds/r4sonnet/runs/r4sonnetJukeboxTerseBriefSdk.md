```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Jukebox",
  description:
    "1940s-style arch-top jukebox: walnut cabinet, rainbow bubble-tube arch with gold beads, a sunburst record window with a spinning vinyl record, tonearm and fanned waiting records, a keypad and coin console, and a chrome-ringed speaker grille.",
};

type V3 = [number, number, number];
const PI = Math.PI;

// ---------------------------------------------------------------- palette
const K = {
  walnut: "#6b3a20",
  walnutDark: "#3f2112",
  walnutLight: "#9a5a30",
  backing: "#24120c",
  chrome: "#dfe6ec",
  chromeDark: "#9aa6b0",
  steel: "#4f5a64",
  gold: "#e3b04b",
  goldDark: "#a8782a",
  cream: "#f0e2bd",
  red: "#d63a35",
  redCloth: "#6e1f2a",
  redDeep: "#45121b",
  navy: "#233246",
  black: "#14141a",
  vinyl: "#23232d",
  slot: "#07070a",
  sunDeep: "#8a2e14",
  halo: "#e0701f",
  sunA: "#ffb12b",
  sunB: "#ffd96a",
  white: "#f4fdff",
  green: "#2fa86a",
  blueLabel: "#2f7fd6",
  purpleLabel: "#8f5bd1",
};
const NEON = [
  "#ffd24a",
  "#ff8a2a",
  "#ff4a4a",
  "#ff5fa2",
  "#9a6bff",
  "#3fb8ff",
  "#4fe6e0",
  "#5fdc7a",
  "#b6e84a",
  "#ffd24a",
];

// ---------------------------------------------------------------- helpers
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// faceted, group-free geometry: the low-poly look
function prep(g: THREE.BufferGeometry) {
  const out = g.index ? g.toNonIndexed() : g;
  out.clearGroups();
  out.computeVertexNormals();
  return out;
}

// arch outline in the XY plane: straight sides, semicircular top centred at (0, yc)
function archPath(p: THREE.Path, w: number, y0: number, yc: number) {
  p.moveTo(-w, y0);
  p.lineTo(w, y0);
  p.lineTo(w, yc);
  p.absarc(0, yc, w, 0, PI, false);
  return p;
}
function archSolid(w: number, y0: number, yc: number, depth: number, z0: number, seg = 6) {
  const s = new THREE.Shape();
  archPath(s, w, y0, yc);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: seg });
  g.translate(0, 0, z0);
  return g;
}
function archFrame(
  wOut: number,
  wIn: number,
  y0Out: number,
  y0In: number,
  yc: number,
  depth: number,
  z0: number,
  seg = 6,
) {
  const s = new THREE.Shape();
  archPath(s, wOut, y0Out, yc);
  const hole = new THREE.Path();
  archPath(hole, wIn, y0In, yc);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: seg });
  g.translate(0, 0, z0);
  return g;
}
function starShape(rO: number, rI: number, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? rO : rI;
    const a = PI / 2 + (i * PI) / n;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
}
// cylinder whose axis is Z (top toward +Z)
function cylZ(r: number, h: number, seg = 12, rTop = r) {
  const g = new THREE.CylinderGeometry(rTop, r, h, seg);
  g.rotateX(PI / 2);
  return g;
}
// cylinder whose axis is X
function cylX(r: number, h: number, seg = 12) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  g.rotateZ(-PI / 2);
  return g;
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jukebox" });
  const rand = seeded(1948);

  // ------------------------------------------------------------ skeleton
  const root = b.joint("base", { at: [0, 0, 0] });
  type Jt = typeof root;
  const RC: V3 = [0, 1.1, 0.325]; // record centre
  const AP: V3 = [0.215, 0.84, 0.352]; // tonearm pivot
  const record = b.joint("record", { parent: root, at: RC, dir: [0, 0, 1] });
  const tonearm = b.joint("tonearm", { parent: root, at: AP, dir: [0, 0, 1] });
  const coinButton = b.joint("coinButton", {
    parent: root,
    at: [0.125, 0.595, 0.345],
    dir: [0, 0, 1],
  });

  const put = (geo: THREE.BufferGeometry, color: string, at: V3 = [0, 0, 0], bone: Jt = root) =>
    b.part(prep(geo), color, { at, bone });
  const boxAt = (color: string, at: V3, size: V3, bone?: Jt) =>
    put(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, bone);
  // rod between two points in the XY plane at depth z
  const rodXY = (
    a: [number, number],
    c: [number, number],
    r: number,
    z: number,
    color: string,
    o: { seg?: number; open?: boolean; bone?: Jt; rTop?: number } = {},
  ) => {
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const len = Math.hypot(dx, dy);
    const g = new THREE.CylinderGeometry(o.rTop ?? r, r, len, o.seg ?? 8, 1, o.open ?? false);
    g.rotateZ(Math.atan2(-dx, dy));
    return put(g, color, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, z], o.bone);
  };

  // ------------------------------------------------------------ plinth
  boxAt(K.walnutDark, [0, 0.025, 0], [0.92, 0.05, 0.62]);
  boxAt(K.walnut, [0, 0.075, 0], [0.95, 0.05, 0.65]);
  boxAt(K.chrome, [0, 0.102, 0], [0.96, 0.008, 0.66]);
  boxAt(K.gold, [0, 0.075, 0.3265], [0.8, 0.012, 0.003]);
  for (const s of [-1, 1]) boxAt(K.gold, [s * 0.4765, 0.075, 0], [0.003, 0.012, 0.5]);

  // ------------------------------------------------------------ cabinet
  put(archSolid(0.45, 0.08, 1.1, 0.6, -0.3), K.walnut);
  // gold wrap-around stripes over the arch and down both sides
  put(archFrame(0.458, 0.446, 0.12, 0.14, 1.1, 0.014, 0.183), K.gold);
  put(archFrame(0.458, 0.446, 0.12, 0.14, 1.1, 0.014, -0.197), K.gold);
  // crest cap with ball finials
  put(cylZ(0.014, 0.62, 6), K.gold, [0, 1.553, 0]);
  for (const z of [-0.31, 0.31]) put(new THREE.SphereGeometry(0.028, 8, 6), K.gold, [0, 1.55, z]);

  // side inlay panels with rosettes
  for (const s of [-1, 1]) {
    boxAt(K.walnutLight, [s * 0.452, 0.58, 0], [0.008, 0.72, 0.34]);
    boxAt(K.gold, [s * 0.4565, 0.94, 0], [0.006, 0.008, 0.35]);
    boxAt(K.gold, [s * 0.4565, 0.22, 0], [0.006, 0.008, 0.35]);
    for (const z of [-0.172, 0.172]) boxAt(K.gold, [s * 0.4565, 0.58, z], [0.006, 0.72, 0.008]);
    put(cylX(0.055, 0.012, 8), K.gold, [s * 0.458, 0.58, 0]);
    put(cylX(0.036, 0.016, 8), K.red, [s * 0.459, 0.58, 0]);
    put(cylX(0.016, 0.02, 6), K.gold, [s * 0.46, 0.58, 0]);
  }

  // back vents and plate
  for (let i = 0; i < 8; i++) boxAt(K.slot, [0, 0.45 + i * 0.06, -0.3015], [0.34, 0.014, 0.003]);
  boxAt(K.gold, [0, 0.3, -0.3015], [0.2, 0.05, 0.003]);

  // ------------------------------------------------------------ front frames
  put(archFrame(0.44, 0.4, 0.1, 0.12, 1.1, 0.04, 0.3), K.chrome); // outer chrome
  put(archFrame(0.4, 0.33, 0.12, 0.14, 1.1, 0.006, 0.3), K.backing); // neon backing
  put(archFrame(0.33, 0.31, 0.12, 0.14, 1.1, 0.05, 0.3), K.chrome); // inner chrome

  // ------------------------------------------------------------ rainbow bubble-tube arch
  const R = 0.365;
  const YB = 0.16;
  const YC = 1.1;
  const ZN = 0.318;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 4; i++) pts.push([-R, YB + ((YC - YB) * i) / 4]);
  for (let k = 1; k <= 11; k++) {
    const th = PI - (k * PI) / 12;
    pts.push([R * Math.cos(th), YC + R * Math.sin(th)]);
  }
  for (let i = 0; i <= 4; i++) pts.push([R, YC - ((YC - YB) * i) / 4]);
  for (let j = 0; j < pts.length - 1; j++) {
    const color = NEON[Math.min(NEON.length - 1, Math.floor(Math.abs(j - 9.5)))];
    rodXY(pts[j], pts[j + 1], 0.034, ZN, color, { open: true, seg: 8 });
  }
  for (const p of pts) put(new THREE.SphereGeometry(0.041, 8, 6), K.gold, [p[0], p[1], ZN]);
  // rising bubbles on the side columns
  for (const s of [-1, 1]) {
    for (let n = 0; n < 16; n++) {
      const y = YB + 0.03 + rand() * (YC - YB - 0.06);
      const rr = 0.005 + rand() * 0.007;
      const x = s * R + (rand() - 0.5) * 0.035;
      put(new THREE.SphereGeometry(rr, 5, 4), K.white, [x, y, ZN + 0.03]);
    }
  }

  // ------------------------------------------------------------ record window
  put(archSolid(0.3, 0.71, 1.1, 0.012, 0.3), K.sunDeep); // back wall
  put(archFrame(0.31, 0.285, 0.69, 0.72, 1.1, 0.045, 0.3), K.gold); // bezel
  // sunburst
  for (let i = 0; i < 16; i++) {
    const a0 = (i * PI * 2) / 16;
    const a1 = ((i + 1) * PI * 2) / 16;
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.3 * Math.cos(a0), 0.3 * Math.sin(a0));
    s.lineTo(0.3 * Math.cos(a1), 0.3 * Math.sin(a1));
    put(new THREE.ShapeGeometry(s), i % 2 ? K.sunA : K.sunB, [0, 1.1, 0.313]);
  }
  put(cylZ(0.172, 0.002, 20), K.halo, [0, 1.1, 0.3145]);
  // star emblem
  put(
    new THREE.ExtrudeGeometry(starShape(0.04, 0.017), { depth: 0.003, bevelEnabled: false }),
    K.gold,
    [0, 1.335, 0.314],
  );
  put(
    new THREE.ExtrudeGeometry(starShape(0.031, 0.013), { depth: 0.003, bevelEnabled: false }),
    K.red,
    [0, 1.335, 0.317],
  );

  // fan of waiting records standing behind the lower bezel
  const waitingLabels = [K.red, K.blueLabel, K.gold, K.green, K.purpleLabel];
  for (let i = 0; i < 5; i++) {
    const phi = ((-60 + 30 * i) * PI) / 180;
    const cx = -Math.sin(phi) * 0.08;
    const cy = 0.73 + Math.cos(phi) * 0.08;
    const z = 0.318 + i * 0.003;
    put(cylZ(0.072, 0.004, 16), K.black, [cx, cy, z]);
    put(cylZ(0.052, 0.0046, 16), K.vinyl, [cx, cy, z]);
    put(cylZ(0.027, 0.0054, 10), waitingLabels[i], [cx, cy, z]);
    put(cylZ(0.004, 0.0062, 6), K.slot, [cx, cy, z]);
  }

  // the playing record (spins about Z on the "record" joint)
  const disc = (r: number, h: number, seg: number, color: string) => {
    const g = cylZ(r, h, seg);
    g.translate(0, 0, -0.004 + h / 2);
    return put(g, color, RC, record);
  };
  disc(0.14, 0.008, 22, K.black);
  disc(0.122, 0.0088, 22, K.vinyl);
  disc(0.104, 0.0096, 22, K.black);
  disc(0.086, 0.0104, 22, K.vinyl);
  disc(0.066, 0.0108, 22, K.black);
  disc(0.052, 0.0122, 16, K.red);
  disc(0.036, 0.013, 16, K.cream);
  disc(0.0125, 0.016, 8, K.chrome);
  disc(0.004, 0.022, 6, K.steel);
  for (let k = 0; k < 3; k++) {
    const a = 0.4 + k * 2.1;
    const g = cylZ(0.006, 0.0136, 6);
    g.translate(0, 0, -0.004 + 0.0068);
    put(g, K.gold, [RC[0] + 0.045 * Math.cos(a), RC[1] + 0.045 * Math.sin(a), RC[2]], record);
  }

  // tonearm (pivots about Z on the "tonearm" joint)
  const T: [number, number] = [0.105, 1.062];
  const ux = T[0] - AP[0];
  const uy = T[1] - AP[1];
  const L = Math.hypot(ux, uy);
  const dx = ux / L;
  const dy = uy / L;
  const along = (s: number): [number, number] => [AP[0] + dx * s, AP[1] + dy * s];
  put(cylZ(0.032, 0.028, 10), K.chrome, [AP[0], AP[1], 0.352], tonearm);
  put(cylZ(0.016, 0.006, 8), K.gold, [AP[0], AP[1], 0.369], tonearm);
  rodXY([AP[0], AP[1]], T, 0.0065, 0.357, K.chromeDark, { bone: tonearm, seg: 6 });
  rodXY(along(-0.078), along(-0.015), 0.019, 0.352, K.steel, { bone: tonearm, seg: 8 });
  rodXY(along(L - 0.035), along(L + 0.012), 0.011, 0.357, K.black, {
    bone: tonearm,
    seg: 6,
    rTop: 0.008,
  });
  const nd = along(L + 0.006);
  put(new THREE.BoxGeometry(0.004, 0.004, 0.024), K.gold, [nd[0], nd[1], 0.342], tonearm);

  // ------------------------------------------------------------ console
  boxAt(K.navy, [0, 0.595, 0.315], [0.62, 0.19, 0.03]);
  boxAt(K.chrome, [0, 0.5, 0.3175], [0.62, 0.02, 0.035]);
  // selector keypad
  boxAt(K.goldDark, [-0.135, 0.5975, 0.332], [0.31, 0.125, 0.004]);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const x = -0.27 + c * 0.037;
      const y = r === 0 ? 0.625 : 0.57;
      boxAt((r + c) % 2 ? K.red : K.cream, [x, y, 0.34], [0.028, 0.028, 0.012]);
      boxAt(K.cream, [x, y + 0.022, 0.3355], [0.026, 0.008, 0.002]);
    }
  }
  // coin unit
  boxAt(K.chrome, [0.185, 0.595, 0.334], [0.17, 0.15, 0.008]);
  boxAt(K.gold, [0.185, 0.64, 0.341], [0.075, 0.022, 0.006]);
  boxAt(K.slot, [0.185, 0.64, 0.3445], [0.05, 0.006, 0.002]);
  boxAt(K.steel, [0.185, 0.545, 0.341], [0.07, 0.034, 0.006]);
  boxAt(K.slot, [0.185, 0.545, 0.3445], [0.055, 0.022, 0.002]);
  put(cylZ(0.02, 0.006, 10), K.gold, [0.125, 0.595, 0.341]);
  put(cylZ(0.014, 0.012, 10), K.red, [0.125, 0.595, 0.345], coinButton);
  put(cylZ(0.02, 0.006, 10), K.gold, [0.245, 0.595, 0.341]);
  put(cylZ(0.014, 0.012, 10), K.green, [0.245, 0.595, 0.345]);
  // now-playing lamp
  put(cylZ(0.02, 0.006, 10), K.gold, [0.06, 0.595, 0.335]);
  put(new THREE.SphereGeometry(0.014, 8, 6), K.red, [0.06, 0.595, 0.34]);

  // ------------------------------------------------------------ speaker grille
  boxAt(K.redCloth, [0, 0.315, 0.306], [0.62, 0.35, 0.012]);
  put(cylZ(0.17, 0.004, 18), K.redDeep, [0, 0.315, 0.314]);
  const ringCols = [K.gold, K.chrome, K.gold, K.chrome];
  [0.04, 0.08, 0.12, 0.155].forEach((rr, i) =>
    put(new THREE.TorusGeometry(rr, 0.0055, 4, 20), ringCols[i], [0, 0.315, 0.318]),
  );
  {
    const dome = new THREE.SphereGeometry(0.03, 10, 5, 0, PI * 2, 0, PI / 2);
    dome.rotateX(PI / 2);
    put(dome, K.gold, [0, 0.315, 0.314]);
  }
  for (const s of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      boxAt(K.chrome, [s * 0.235, 0.215 + k * 0.05, 0.319], [0.11, 0.012, 0.014]);
    }
  }

  return b.root;
}
```