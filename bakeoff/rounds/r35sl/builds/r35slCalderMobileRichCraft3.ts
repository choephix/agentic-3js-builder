import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description: "A balanced hanging mobile of black wire arms and flat primary-colour organic shapes, in the style of Alexander Calder.",
};

const BLACK = "#16161a";
const RED = "#d8261c";
const BLUE = "#1f4fb0";
const YELLOW = "#f2c418";
const WHITE = "#f4f0e6";

type Pt = [number, number] | [number, number, "sharp"];
const arcPts = (n: number, a0: number, a1: number, cx = 0, cy = -1, rx = 1, ry = 1): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });

// Every outline hangs from its top at the origin and is 2 units tall.
const OUTLINES: Record<string, Pt[]> = {
  disc: arcPts(14, 0, 360 - 360 / 14),
  ellipse: arcPts(14, 0, 360 - 360 / 14, 0, -1, 0.6, 1),
  half: [[-1, 0, "sharp"], ...arcPts(9, 190, 350, 0, 0, 1, 1).map(([x, y]) => [x, y * 2] as Pt), [1, 0, "sharp"]].reverse() as Pt[],
  leaf: [[0, 0, "sharp"], [0.5, -0.6], [0.4, -1.4], [0, -2, "sharp"], [-0.4, -1.4], [-0.5, -0.6]],
  tri: [[0, 0, "sharp"], [-0.9, -2, "sharp"], [0.9, -1.7, "sharp"]],
};

type Leaf = { shape: string; color: string; s: number };
type Bar = { a: number; b: number; theta: number; drop: [number, number]; kids: [Leaf | Bar, Leaf | Bar] };
const isBar = (k: Leaf | Bar): k is Bar => "kids" in k;

const SPEC: Bar = {
  a: 0.5, b: 0.26, theta: 10, drop: [0.2, 0.34],
  kids: [
    {
      a: 0.22, b: 0.24, theta: 60, drop: [0.26, 0.2],
      kids: [{ shape: "disc", color: RED, s: 0.12 }, { shape: "leaf", color: BLACK, s: 0.1 }],
    },
    {
      a: 0.2, b: 0.32, theta: -40, drop: [0.3, 0.14],
      kids: [
        { shape: "ellipse", color: BLUE, s: 0.1 },
        {
          a: 0.13, b: 0.13, theta: 90, drop: [0.16, 0.2],
          kids: [{ shape: "disc", color: YELLOW, s: 0.07 }, { shape: "half", color: WHITE, s: 0.09 }],
        },
      ],
    },
  ],
};

function make(dry: boolean, topY: number, shift: number) {
  const b = createBuilder({ name: "mobile" });
  let minY = Infinity;
  let idx = 0;

  const wire = (p: THREE.Vector3, q: THREE.Vector3, r = 0.0025) => {
    if (!dry) b.rod(p.toArray(), q.toArray(), r, BLACK);
  };
  const bead = (p: THREE.Vector3, r: number, c = BLACK) => {
    if (!dry) b.part(new THREE.SphereGeometry(r, 6, 4), c, { at: p.toArray() });
  };

  function leaf(l: Leaf, top: THREE.Vector3) {
    minY = Math.min(minY, top.y - 2 * l.s);
    if (dry) return;
    const phi = ((idx++ * 55 + 20) * Math.PI) / 180;
    const pts = OUTLINES[l.shape].map((p) => [p[0] * l.s, p[1] * l.s, ...(p[2] ? [p[2]] : [])] as Pt);
    b.extrude(pts, {
      at: top.toArray(),
      x: [Math.cos(phi), 0, Math.sin(phi)],
      y: [-Math.sin(phi) * 0.12, 1, Math.cos(phi) * 0.12],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: l.color,
    });
    bead(top, 0.007);
  }

  function bar(s: Bar, top: THREE.Vector3) {
    const t = (s.theta * Math.PI) / 180;
    const d = new THREE.Vector3(Math.cos(t), 0, Math.sin(t));
    const ends = [top.clone().addScaledVector(d, -s.a), top.clone().addScaledVector(d, s.b)];
    wire(ends[0], ends[1], 0.005);
    bead(top, 0.011);
    ends.forEach((e, i) => {
      const q = e.clone().add(new THREE.Vector3(0, -s.drop[i], 0));
      bead(e, 0.008);
      wire(e, q);
      const k = s.kids[i];
      if (isBar(k)) bar(k, q);
      else leaf(k, q);
    });
  }

  const top = new THREE.Vector3(0, topY + shift, 0);
  bar(SPEC, top);
  if (!dry) {
    // suspension wire, hook ring and ceiling plate
    const hook = top.clone().add(new THREE.Vector3(0, 0.35, 0));
    wire(top, hook, 0.003);
    b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), BLACK, { at: hook.toArray(), rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 10), BLACK, { at: hook.clone().add(new THREE.Vector3(0, 0.03, 0)).toArray() });
  }
  return { b, minY };
}

export default function build() {
  const dry = make(true, 1.6, 0);
  const shift = -dry.minY;
  return make(false, 1.6, shift).b.root;
}
