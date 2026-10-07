```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];

// ---- palette (flat colours) -------------------------------------------------
const STEEL = "#bcc6cf";
const STEEL_MID = "#808b97";
const STEEL_DARK = "#48505a";
const GOLD = "#d8a72f";
const CRIMSON = "#a8192d";
const CRIMSON_DEEP = "#6b1322";
const LEATHER = "#5b3b23";
const BLACK = "#15171c";
const BLADE = "#e4eaf1";

export const meta = {
  name: "Armoured Knight",
  description:
    "Stylised plate-armoured knight in a great helm with a crimson plume, gold-trimmed breastplate and cuisses, crimson tabard and cape, a heater shield and a longsword planted point-down.",
};

// ---- vector helpers ---------------------------------------------------------
const lerp3 = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const mid3 = (a: V, c: V): V => lerp3(a, c, 0.5);
const dist3 = (a: V, c: V) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);

// ---- flat outlines, centred on their local origin, facing +Z ----------------
function heaterShape(w: number, h: number, k = 1) {
  const hw = (w / 2) * k;
  const hh = (h / 2) * k;
  const s = new THREE.Shape();
  s.moveTo(-hw, hh);
  s.lineTo(hw, hh);
  s.lineTo(hw, hh * 0.24);
  s.quadraticCurveTo(hw, -hh * 0.64, 0, -hh);
  s.quadraticCurveTo(-hw, -hh * 0.64, -hw, hh * 0.24);
  s.closePath();
  return s;
}

function tabardShape(k = 1) {
  const s = new THREE.Shape();
  s.moveTo(-0.15 * k, 0.32 * k);
  s.lineTo(0.15 * k, 0.32 * k);
  s.lineTo(0.19 * k, -0.3 * k);
  s.lineTo(0, -0.22 * k);
  s.lineTo(-0.19 * k, -0.3 * k);
  s.closePath();
  return s;
}

function capeShape(k = 1) {
  const s = new THREE.Shape();
  s.moveTo(-0.22 * k, 0.42 * k);
  s.lineTo(0.22 * k, 0.42 * k);
  s.lineTo(0.25 * k, -0.2 * k);
  s.lineTo(0.27 * k, -0.44 * k);
  s.lineTo(0, -0.36 * k);
  s.lineTo(-0.27 * k, -0.44 * k);
  s.lineTo(-0.25 * k, -0.2 * k);
  s.closePath();
  return s;
}

// sweeps out along +X; it is turned later so it trails backwards off the helm
function plumeShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.07, 0);
  s.bezierCurveTo(-0.05, 0.12, 0.06, 0.2, 0.22, 0.24);
  s.bezierCurveTo(0.14, 0.17, 0.1, 0.1, 0.07, 0);
  s.closePath();
  return s;
}

export default function build() {
  const b = createBuilder({ name: "armoured-knight" });

  // ---- skeleton (rest pose: arms out, legs apart) ----------------------------
  const J: Record<string, ReturnType<typeof b.joint>> = {};
  const joint = (name: string, at: V, parent?: string) => {
    J[name] = parent ? b.joint(name, { at, parent: J[parent] }) : b.joint(name, { at });
  };

  joint("hips", [0, 0.98, 0]);
  joint("spine", [0, 1.14, 0], "hips");
  joint("chest", [0, 1.32, 0], "spine");
  joint("neck", [0, 1.5, 0], "chest");
  joint("head", [0, 1.64, 0], "neck");
  for (const s of [1, -1]) {
    const t = s > 0 ? "L" : "R";
    joint(`shoulder${t}`, [0.2 * s, 1.42, 0], "chest");
    joint(`elbow${t}`, [0.32 * s, 1.14, 0.02], `shoulder${t}`);
    joint(`wrist${t}`, [0.38 * s, 0.9, 0.08], `elbow${t}`);
    joint(`hip${t}`, [0.1 * s, 0.96, 0], "hips");
    joint(`knee${t}`, [0.12 * s, 0.52, 0.03], `hip${t}`);
    joint(`ankle${t}`, [0.12 * s, 0.1, 0], `knee${t}`);
  }

  // ---- helpers ----------------------------------------------------------------
  const put = (geo: THREE.BufferGeometry, color: string, at: V, aim?: V) =>
    aim ? b.part({ geo, color, at, aim }) : b.part({ geo, color, at });

  const box = (at: V, size: V, color: string) =>
    put(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at);

  const ball = (at: V, r: number, color: string, w = 8, h = 6) =>
    put(new THREE.SphereGeometry(r, w, h), color, at);

  // a vertical drum, optionally squashed front-to-back by depthScale
  const drum = (
    at: V,
    rTop: number,
    rBot: number,
    h: number,
    depthScale: number,
    color: string,
    n = 8,
  ) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, n);
    g.scale(1, 1, depthScale);
    put(g, color, at);
  };

  // a tube from A to B: radius rA at A, rB at B
  const strut = (A: V, B: V, rA: number, rB: number, color: string, n = 8) =>
    put(new THREE.CylinderGeometry(rB, rA, dist3(A, B), n), color, mid3(A, B), B);

  // a flat ring lying in the horizontal plane
  const ring = (at: V, R: number, tube: number, color: string) => {
    const g = new THREE.TorusGeometry(R, tube, 6, 16);
    g.rotateX(Math.PI / 2);
    put(g, color, at);
  };

  // a flat outline with thickness, centred on `at`, facing +Z
  const slab = (shape: THREE.Shape, depth: number, color: string, at: V) => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 6,
    });
    g.translate(0, 0, -depth / 2);
    put(g, color, at);
  };

  // ---- head: great helm, visor, nasal guard and crimson plume -----------------
  put(new THREE.CylinderGeometry(0.13, 0.14, 0.28, 12), STEEL, [0, 1.66, 0]);
  ring([0, 1.775, 0], 0.127, 0.01, GOLD);
  ring([0, 1.535, 0], 0.14, 0.01, GOLD);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ball([0.14 * Math.sin(a), 1.535, 0.14 * Math.cos(a)], 0.011, GOLD, 6, 4);
  }
  for (const s of [1, -1]) box([0.058 * s, 1.67, 0.126], [0.075, 0.03, 0.03], BLACK);
  box([0, 1.66, 0.14], [0.026, 0.14, 0.022], STEEL_MID);

  const crest = new THREE.ExtrudeGeometry(plumeShape(), {
    depth: 0.035,
    bevelEnabled: false,
    curveSegments: 6,
  });
  crest.translate(0, 0, -0.0175);
  crest.rotateY(Math.PI / 2);
  put(crest, CRIMSON, [0, 1.78, 0]);
  drum([0, 1.79, 0], 0.05, 0.055, 0.035, 1, GOLD);

  // ---- neck, torso and waist ---------------------------------------------------
  drum([0, 1.48, 0], 0.115, 0.13, 0.08, 1, STEEL_MID); // gorget
  drum([0, 1.33, 0], 0.2, 0.185, 0.28, 0.74, STEEL); // breastplate
  for (const s of [1, -1]) {
    for (const y of [1.22, 1.3, 1.38]) ball([0.195 * s, y, 0], 0.011, GOLD, 6, 4);
  }
  drum([0, 1.12, 0], 0.175, 0.185, 0.16, 0.74, STEEL); // waist plate
  drum([0, 1.02, 0], 0.19, 0.19, 0.04, 0.76, LEATHER); // belt
  box([0, 1.02, 0.148], [0.05, 0.04, 0.02], GOLD); // buckle
  drum([0, 0.92, 0], 0.185, 0.2, 0.16, 0.74, STEEL_MID); // fauld
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ball([0.19 * Math.sin(a), 0.93, 0.14 * Math.cos(a)], 0.011, GOLD, 6, 4);
  }

  // ---- crimson tabard with gold cross, and the cape ----------------------------
  slab(tabardShape(1.07), 0.012, GOLD, [0, 1.07, 0.146]);
  slab(tabardShape(1), 0.02, CRIMSON, [0, 1.07, 0.16]);
  box([0, 1.12, 0.175], [0.045, 0.22, 0.012], GOLD);
  box([0, 1.17, 0.175], [0.15, 0.045, 0.012], GOLD);
  slab(capeShape(1.05), 0.01, GOLD, [0, 1.0, -0.185]);
  slab(capeShape(1), 0.016, CRIMSON_DEEP, [0, 1.0, -0.172]);

  // ---- pauldrons, arms and gauntlets -------------------------------------------
  for (const s of [1, -1]) {
    const shoulder: V = [0.2 * s, 1.42, 0];
    const elbow: V = [0.32 * s, 1.14, 0.02];
    const wrist: V = [0.38 * s, 0.9, 0.08];

    // pauldron: squashed dome with a gold rim, crimson band and a stud
    const dome = new THREE.SphereGeometry(0.13, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    dome.scale(1, 0.72, 1);
    put(dome, STEEL, [0.21 * s, 1.44, 0]);
    ring([0.21 * s, 1.44, 0], 0.13, 0.011, GOLD);
    ring([0.21 * s, 1.48, 0], 0.112, 0.012, CRIMSON);
    ball([0.21 * s, 1.535, 0], 0.018, GOLD, 6, 4);

    strut(shoulder, elbow, 0.062, 0.05, STEEL); // upper arm
    ball(elbow, 0.058, STEEL, 8, 6); // elbow cop
    strut(elbow, wrist, 0.05, 0.04, STEEL_MID); // vambrace
    strut(lerp3(elbow, wrist, 0.8), wrist, 0.05, 0.058, STEEL_DARK); // cuff
    box([0.38 * s, 0.84, 0.09], [0.075, 0.11, 0.065], STEEL_DARK); // gauntlet
  }

  // ---- legs: cuisses, knee cops, greaves and sabatons --------------------------
  for (const s of [1, -1]) {
    const hip: V = [0.1 * s, 0.96, 0];
    const knee: V = [0.12 * s, 0.52, 0.03];

    strut(hip, knee, 0.095, 0.08, STEEL_MID); // cuisse
    for (const t of [0.3, 0.6]) {
      const p = lerp3(hip, knee, t);
      ball([p[0], p[1], p[2] + 0.09], 0.012, GOLD, 6, 4); // cuisse studs
    }
    ball(knee, 0.085, STEEL, 8, 6); // knee cop
    ball([knee[0], knee[1], knee[2] + 0.075], 0.02, GOLD, 6, 4); // knee boss
    strut([0.12 * s, 0.5, 0.03], [0.12 * s, 0.12, 0], 0.074, 0.058, STEEL); // greave
    box([0.12 * s, 0.013, 0.09], [0.12, 0.026, 0.32], BLACK); // sole
    box([0.12 * s, 0.076, 0.085], [0.12, 0.1, 0.28], STEEL_DARK); // sabaton
    box([0.12 * s, 0.03, -0.075], [0.04, 0.02, 0.02], GOLD); // heel spur
  }

  // ---- heater shield held on the left arm --------------------------------------
  const shieldAt: V = [0.34, 0.99, 0.21];
  slab(heaterShape(0.4, 0.56, 1.08), 0.02, GOLD, [0.34, 0.99, 0.19]); // gold rim
  slab(heaterShape(0.4, 0.56), 0.03, CRIMSON, shieldAt); // field
  box([0.34, 0.99, 0.23], [0.05, 0.4, 0.012], GOLD); // cross, upright
  box([0.34, 1.07, 0.23], [0.26, 0.05, 0.012], GOLD); // cross, arm
  ball([0.34, 0.99, 0.235], 0.035, GOLD, 8, 6); // boss

  // ---- longsword planted point-down in the right hand --------------------------
  const C: V = [-0.4, 0.8, 0.1]; // crossguard centre
  const dr = [-0.05, -1, 0.22];
  const dl = Math.hypot(dr[0], dr[1], dr[2]);
  const dir: V = [dr[0] / dl, dr[1] / dl, dr[2] / dl];
  const reach = C[1] / -dir[1]; // distance from guard down to the floor
  const tip: V = [C[0] + dir[0] * reach, 0, C[2] + dir[2] * reach];
  const pommel: V = [
    C[0] - dir[0] * 0.14,
    C[1] - dir[1] * 0.14,
    C[2] - dir[2] * 0.14,
  ];
  const bladeFrom: V = [
    C[0] + dir[0] * 0.02,
    C[1] + dir[1] * 0.02,
    C[2] + dir[2] * 0.02,
  ];

  strut(pommel, C, 0.017, 0.017, LEATHER, 6); // grip
  ball(pommel, 0.026, GOLD, 6, 4); // pommel
  box(C, [0.2, 0.03, 0.05], GOLD); // crossguard
  for (const s of [1, -1]) ball([C[0] + 0.1 * s, C[1], C[2]], 0.02, GOLD, 6, 4);
  strut(bladeFrom, tip, 0.02, 0.004, BLADE, 4); // blade

  return b.root;
}
```