import * as THREE from "three";
import { createBuilder, mottle, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging kinetic mobile in the manner of Alexander Calder: black wire arms balanced in tiers, hung from a ceiling plate and carrying painted sheet-metal shapes in red, yellow, blue, black and white.",
};

const WIRE = "#17171a";
const RED = "#d3281f";
const YEL = "#f1bf2b";
const BLUE = "#1f4ea6";
const BLACK = "#151517";
const WHITE = "#efeadc";

type Pt = [number, number] | [number, number, "sharp"];
type ShapeKind = "disc" | "leaf" | "crescent" | "kidney" | "tri";
type Leaf = { k: ShapeKind; c: string; w: number; h: number; drop: number; yaw?: number; flat?: boolean };
type Arm = { len: number; t: number; yaw: number; drop: number; l: Leaf | Arm; r: Leaf | Arm };

// ---- outlines (origin at the hang point) ----
function ellipse(w: number, h: number, n = 16): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([Math.cos(a) * w / 2, Math.sin(a) * h / 2]);
  }
  return out;
}
function kidney(w: number, h: number, n = 20): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let d = a - Math.PI / 2;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    const r = 1 - 0.38 * Math.exp(-(d * d) / 0.35);
    out.push([Math.cos(a) * r * w / 2, Math.sin(a) * r * h / 2]);
  }
  return out;
}
function crescent(w: number, h: number): Pt[] {
  const out: Pt[] = [];
  const R = 0.5;
  for (let i = 0; i <= 12; i++) {
    const a = ((-130 + (260 * i) / 12) * Math.PI) / 180;
    out.push([R * Math.cos(a) * w, R * Math.sin(a) * h]);
  }
  const c = 0.5 * R;
  const r = 1.376 * R;
  for (let i = 1; i < 8; i++) {
    const a = ((146 + (68 * i) / 8) * Math.PI) / 180;
    out.push([(c + r * Math.cos(a)) * w, r * Math.sin(a) * h]);
  }
  return out;
}
function leafShape(w: number, h: number): Pt[] {
  return [
    [0, 0, "sharp"],
    [w * 0.5, -h * 0.3],
    [w * 0.36, -h * 0.75],
    [0, -h, "sharp"],
    [-w * 0.36, -h * 0.75],
    [-w * 0.5, -h * 0.3],
  ];
}
function triShape(w: number, h: number): Pt[] {
  return [
    [0, 0, "sharp"],
    [w / 2, -h, "sharp"],
    [-w / 2, -h, "sharp"],
  ];
}

// ---- the mobile's design ----
const DESIGN: Arm = {
  len: 1.55, t: 0.42, yaw: 20, drop: 0.4,
  l: { k: "crescent", c: RED, w: 0.46, h: 0.5, drop: 0.5, yaw: 20 },
  r: {
    len: 1.05, t: 0.4, yaw: -35, drop: 0.25,
    l: {
      len: 0.55, t: 0.5, yaw: 70, drop: 0.35,
      l: { k: "disc", c: YEL, w: 0.2, h: 0.2, drop: 0.25, yaw: 40, flat: true },
      r: { k: "leaf", c: BLUE, w: 0.2, h: 0.36, drop: 0.45, yaw: 10 },
    },
    r: {
      len: 0.75, t: 0.6, yaw: 12, drop: 0.5,
      l: { k: "kidney", c: BLACK, w: 0.3, h: 0.3, drop: 0.3, yaw: 60, flat: true },
      r: {
        len: 0.4, t: 0.5, yaw: -50, drop: 0.2,
        l: { k: "disc", c: WHITE, w: 0.13, h: 0.13, drop: 0.2, yaw: 0 },
        r: { k: "tri", c: RED, w: 0.14, h: 0.2, drop: 0.28, yaw: 30 },
      },
    },
  },
};

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const R = rng(5);
  const CEIL = 2.4;

  const bead = (p: THREE.Vector3, r = 0.011) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), WIRE, { at: p });
  const string = (a: THREE.Vector3, c: THREE.Vector3) => b.rod(a, c, 0.0035, WIRE, { sides: 5 });

  function addShape(top: THREE.Vector3, L: Leaf) {
    const yaw = ((L.yaw ?? 0) * Math.PI) / 180;
    const d = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
    const base = L.k === "disc" ? ellipse(L.w, L.h)
      : L.k === "kidney" ? kidney(L.w, L.h)
      : L.k === "crescent" ? crescent(L.w, L.h)
      : L.k === "leaf" ? leafShape(L.w, L.h)
      : triShape(L.w, L.h);
    const symmetricCentre = L.k === "disc" || L.k === "kidney" || L.k === "crescent";
    // hang from top edge for vertical shapes; centred for flat ones
    let at: THREE.Vector3;
    let outline = base;
    let y: [number, number, number];
    if (L.flat) {
      at = top.clone().add(new THREE.Vector3(0, -L.drop, 0));
      y = [-Math.sin(yaw), 0, Math.cos(yaw)];
    } else {
      const maxY = Math.max(...base.map((p) => p[1]));
      outline = base.map((p) => (p.length === 3 ? [p[0], p[1] - maxY, "sharp"] : [p[0], p[1] - maxY])) as Pt[];
      at = top.clone().add(new THREE.Vector3(0, -L.drop, 0));
      y = [0, 1, 0];
    }
    void symmetricCentre;
    string(top, at);
    bead(top);
    const paintC = mottle(L.c, new THREE.Color(L.c).multiplyScalar(0.88).getStyle(), {
      size: 0.08, seed: Math.floor(R() * 90),
    });
    b.extrude(outline as any, {
      at, x: [d.x, d.y, d.z], y, thickness: 0.006, bevel: 0.0015,
      smoothing: L.k === "leaf" ? 2 : 0, color: paintC,
    });
    // small eyelet where the wire meets the plate
    b.part(new THREE.TorusGeometry(0.009, 0.0025, 4, 8), WIRE, {
      at: at.clone().add(new THREE.Vector3(0, L.flat ? 0.004 : 0.004, 0)),
      rotation: [90, 0, 0],
    });
  }

  function addArm(top: THREE.Vector3, A: Arm) {
    const P = top.clone().add(new THREE.Vector3(0, -A.drop, 0));
    string(top, P);
    bead(top);
    const yaw = (A.yaw * Math.PI) / 180;
    const d = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
    const E1 = P.clone().addScaledVector(d, -A.len * A.t);
    const E2 = P.clone().addScaledVector(d, A.len * (1 - A.t));
    b.rod(E1, E2, 0.0055, WIRE, { sides: 6 });
    // pivot loop and end loops
    b.part(new THREE.TorusGeometry(0.014, 0.003, 4, 10), WIRE, { at: P.clone().add(new THREE.Vector3(0, 0.01, 0)), rotation: [0, -A.yaw, 0] });
    bead(P, 0.012);
    bead(E1, 0.009);
    bead(E2, 0.009);
    for (const [E, child] of [[E1, A.l], [E2, A.r]] as const) {
      if ("len" in child) addArm(E, child);
      else addShape(E, child);
    }
  }

  // ceiling plate and hook
  b.lathe(
    [[0, 0], [0.08, 0], [0.08, 0.012], [0.03, 0.02], [0, 0.02]],
    { at: [0, CEIL, 0], color: WIRE, segments: 10 },
  );
  b.part(new THREE.TorusGeometry(0.02, 0.004, 4, 10), WIRE, { at: [0, CEIL - 0.02, 0], rotation: [90, 0, 0] });

  addArm(new THREE.Vector3(0, CEIL - 0.02, 0), DESIGN);

  return b.root;
}
