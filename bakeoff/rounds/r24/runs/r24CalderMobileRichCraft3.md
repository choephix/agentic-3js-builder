```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging kinetic mobile in the manner of Alexander Calder: black wire arms balanced one under another, hung from a hook, carrying painted sheet-metal leaves, crescents, discs and balls in red, yellow, blue, black and white.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const RED = "#d4281e";
const BLACK = "#18181b";
const YELLOW = "#f1b51d";
const BLUE = "#1e4ba3";
const WHITE = "#f1ede2";
const WIRE = "#222226";
type Fill = string | Paint;

/** Matte painted sheet metal: slow tone drift, brush streaks, and chipped paint showing grey primer. */
function sheet(hex: string, seed: number): Paint {
  const lo = mix(hex, "#000000", 0.16);
  const hi = mix(hex, "#ffffff", 0.07);
  const q = new THREE.Vector3();
  return paint((p, n) => {
    let c = mix(lo, hi, smoothstep(0.3, 0.7, noise(p, 0.16, seed)));
    q.set(p.x * 5, p.y, p.z * 5);
    c = mix(c, lo, 0.35 * smoothstep(0.5, 0.8, noise(q, 0.05, seed + 3)));
    const chip = smoothstep(0.74, 0.77, noise(p, 0.035, seed + 7));
    c = mix(c, "#4a4a52", 0.8 * chip);
    const l = 0.9 + 0.1 * n.y;
    return [c[0] * l, c[1] * l, c[2] * l];
  });
}

const RED_S = sheet(RED, 1);
const BLACK_S = sheet(BLACK, 2);
const YELLOW_S = sheet(YELLOW, 3);
const BLUE_S = sheet(BLUE, 4);
const WHITE_S = sheet(WHITE, 5);
const mod2 = (k: number) => ((k % 2) + 2) % 2;

/** Concentric target rings on a disc whose top attach point is the outline origin. */
function ringPaint(r: number, a: Paint, c: Paint): Paint {
  return paint((_p, _n, s) => (mod2(Math.floor(Math.hypot(s[0], s[1] + r) / (r / 4.5))) === 0 ? a : c));
}
/** Diagonal bands in outline space. */
function bandPaint(a: Paint, c: Paint, width: number): Paint {
  return paint((_p, _n, s) => (mod2(Math.floor((s[0] * 0.8 + s[1]) / width)) === 0 ? a : c));
}

// ---------------------------------------------------------------------------------------------------------------
// Sheet-metal outlines, origin at the attach point on the top edge, drawn counter-clockwise

type Pt = [number, number] | [number, number, "sharp"];
type ShapeName = "disc" | "oval" | "leaf" | "blob" | "crescent" | "triangle" | "wedge";

const sc = (pts: Pt[], s: number): Pt[] =>
  pts.map((p) => (p.length === 3 ? ([p[0] * s, p[1] * s, "sharp"] as Pt) : ([p[0] * s, p[1] * s] as Pt)));

const OUT: Record<ShapeName, (s: number) => Pt[]> = {
  disc: (s) => {
    const pts: Pt[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      pts.push([-Math.sin(a), Math.cos(a) - 1]);
    }
    return sc(pts, s);
  },
  oval: (s) => {
    const pts: Pt[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      pts.push([-0.62 * Math.sin(a), Math.cos(a) - 1]);
    }
    return sc(pts, s);
  },
  leaf: (s) =>
    sc(
      [
        [0, 0, "sharp"],
        [-0.3, -0.25],
        [-0.46, -0.65],
        [-0.38, -1.1],
        [-0.18, -1.55],
        [0, -1.9, "sharp"],
        [0.22, -1.5],
        [0.44, -1.05],
        [0.5, -0.6],
        [0.3, -0.22],
      ],
      s,
    ),
  blob: (s) => {
    const pts: Pt[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const r = 0.7 + 0.18 * Math.sin(2 * a + 0.6) + 0.12 * Math.sin(3 * a + 2);
      pts.push([-r * Math.sin(a), -0.9 + r * Math.cos(a)]);
    }
    return sc(pts, s);
  },
  crescent: (s) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 11; i++) {
      const f = (40 + (280 * i) / 11) * DEG;
      pts.push([Math.cos(f), -1 + Math.sin(f)]);
    }
    for (const a of [260, 220, 180, 140, 100]) pts.push([0.45 + 0.716 * Math.cos(a * DEG), -1 + 0.716 * Math.sin(a * DEG)]);
    return sc(pts, s);
  },
  triangle: (s) =>
    sc(
      [
        [0, 0, "sharp"],
        [-0.55, -1.2, "sharp"],
        [0.75, -1.4, "sharp"],
      ],
      s,
    ),
  wedge: (s) =>
    sc(
      [
        [-0.2, 0, "sharp"],
        [-0.1, -1.7, "sharp"],
        [0.5, -1.6, "sharp"],
        [0.2, 0, "sharp"],
      ],
      s,
    ),
};
const SMOOTH: Record<ShapeName, number> = {
  disc: 0,
  oval: 0,
  leaf: 1,
  blob: 0,
  crescent: 0,
  triangle: 0,
  wedge: 0,
};

// ---------------------------------------------------------------------------------------------------------------
// The mobile as data: each node hangs `drop` meters below the wire end that carries it

interface Inlay {
  size: number;
  u: number;
  v: number;
  color: Fill;
}
interface BaseSpec {
  name: string;
  drop: number;
}
interface ArmSpec extends BaseSpec {
  kind: "arm";
  az: number; // degrees from +X toward +Z
  a: number; // length of the + side
  b: number; // length of the - side
  tilt: number; // degrees, raises the + side
  sway: number; // sideways bend of the wire, m
  A: NodeSpec;
  B: NodeSpec;
}
interface LeafSpec extends BaseSpec {
  kind: "leaf";
  shape: ShapeName;
  size: number;
  yaw: number;
  tilt: number;
  color: Fill;
  inlay?: Inlay;
}
interface BallSpec extends BaseSpec {
  kind: "ball";
  r: number;
  color: Fill;
}
type NodeSpec = ArmSpec | LeafSpec | BallSpec;

const TREE: ArmSpec = {
  kind: "arm",
  name: "armA",
  drop: 0.35,
  az: 15,
  a: 0.8,
  b: 0.7,
  tilt: 3,
  sway: 0.03,
  A: {
    kind: "arm",
    name: "armC",
    drop: 0.35,
    az: 70,
    a: 0.55,
    b: 0.6,
    tilt: 5,
    sway: 0.025,
    A: {
      kind: "leaf",
      name: "blueOval",
      drop: 0.5,
      shape: "oval",
      size: 0.24,
      yaw: -25,
      tilt: 6,
      color: BLUE_S,
      inlay: { size: 0.045, u: 0, v: -0.24, color: YELLOW_S },
    },
    B: {
      kind: "arm",
      name: "armE",
      drop: 0.4,
      az: 160,
      a: 0.45,
      b: 0.5,
      tilt: -3,
      sway: 0.03,
      A: {
        kind: "leaf",
        name: "targetDisc",
        drop: 0.5,
        shape: "disc",
        size: 0.2,
        yaw: 35,
        tilt: 0,
        color: ringPaint(0.2, WHITE_S, RED_S),
      },
      B: {
        kind: "arm",
        name: "armF",
        drop: 0.35,
        az: 70,
        a: 0.3,
        b: 0.35,
        tilt: 4,
        sway: 0.02,
        A: {
          kind: "leaf",
          name: "blackTriangle",
          drop: 0.4,
          shape: "triangle",
          size: 0.3,
          yaw: 8,
          tilt: -5,
          color: BLACK_S,
          inlay: { size: 0.045, u: 0.02, v: -0.26, color: RED_S },
        },
        B: {
          kind: "arm",
          name: "armG",
          drop: 0.3,
          az: 10,
          a: 0.2,
          b: 0.25,
          tilt: 0,
          sway: 0.015,
          A: {
            kind: "leaf",
            name: "stripedBlob",
            drop: 0.2,
            shape: "blob",
            size: 0.17,
            yaw: -15,
            tilt: 4,
            color: bandPaint(YELLOW_S, BLACK_S, 0.045),
          },
          B: { kind: "ball", name: "whiteBall", drop: 0.2, r: 0.05, color: WHITE_S },
        },
      },
    },
  },
  B: {
    kind: "arm",
    name: "armB",
    drop: 0.5,
    az: 100,
    a: 0.35,
    b: 0.5,
    tilt: -4,
    sway: 0.025,
    A: {
      kind: "leaf",
      name: "redLeaf",
      drop: 0.45,
      shape: "leaf",
      size: 0.26,
      yaw: 20,
      tilt: 8,
      color: RED_S,
      inlay: { size: 0.03, u: 0, v: -0.3, color: BLACK_S },
    },
    B: {
      kind: "arm",
      name: "armD",
      drop: 0.45,
      az: 30,
      a: 0.25,
      b: 0.3,
      tilt: 0,
      sway: 0.02,
      A: {
        kind: "leaf",
        name: "yellowMoon",
        drop: 0.3,
        shape: "crescent",
        size: 0.17,
        yaw: -40,
        tilt: 0,
        color: YELLOW_S,
      },
      B: { kind: "ball", name: "blackBall", drop: 0.28, r: 0.07, color: BLACK_S },
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "calder_mobile" });
  const OX = -0.2;
  const TH = 0.007;

  const eyelet = (r: number) => new THREE.TorusGeometry(r, 0.0022, 5, 10);

  // Hook at the top and the ring the first wire hangs from.
  const hookPt = V(OX, 2.75, 0);
  const hook = b.joint("hook", { at: hookPt });
  b.part(new THREE.TorusGeometry(0.035, 0.0035, 5, 14), WIRE, {
    bone: hook,
    at: V(OX, 2.785, 0),
    dir: [0, 0, 1],
    axis: "z",
    flat: true,
  });
  b.sweep(
    catmull([
      V(OX, 2.8, 0),
      V(OX, 2.93, 0),
      V(OX + 0.02, 3.0, 0),
      V(OX + 0.075, 3.02, 0),
      V(OX + 0.12, 2.97, 0),
      V(OX + 0.115, 2.92, 0),
    ]),
    0.0055,
    { bone: hook, color: WIRE, sides: 6 },
  );

  function hang(node: NodeSpec, from: THREE.Vector3, parent: Joint) {
    const top = from.clone().add(V(0, -node.drop, 0));
    const joint = b.joint(node.name, { parent, at: top });
    const lift = node.kind === "arm" ? 0.028 : node.kind === "ball" ? 0.012 : 0.014;
    const end = top.clone().add(V(0, lift, 0));

    // Hanging wire with a slight hand-bent kink.
    b.sweep(
      catmull([
        from,
        from.clone().lerp(end, 0.33).add(V(0.005, 0, 0.003)),
        from.clone().lerp(end, 0.66).add(V(-0.005, 0, -0.003)),
        end,
      ]),
      0.0026,
      { bone: joint, color: WIRE, sides: 5 },
    );

    if (node.kind === "arm") {
      const az = node.az * DEG;
      const d = V(Math.cos(az), 0, Math.sin(az));
      const s = V(-Math.sin(az), 0, Math.cos(az));
      const tl = Math.sin(node.tilt * DEG);
      const endA = top.clone().addScaledVector(d, node.a).add(V(0, node.a * tl, 0));
      const endB = top.clone().addScaledVector(d, -node.b).add(V(0, -node.b * tl, 0));
      const mA = top.clone().lerp(endA, 0.5).addScaledVector(s, node.sway);
      const mB = top.clone().lerp(endB, 0.5).addScaledVector(s, -node.sway * 0.7);
      b.sweep(catmull([endB, mB, top, mA, endA]), 0.0042, { bone: joint, color: WIRE, sides: 6 });
      // loop at the pivot that the support wire joins
      b.part(new THREE.TorusGeometry(0.014, 0.0025, 5, 10), WIRE, {
        bone: joint,
        at: top.clone().add(V(0, 0.014, 0)),
        dir: d,
        axis: "z",
        flat: true,
      });
      for (const [e, out, child] of [
        [endA, d.clone(), node.A],
        [endB, d.clone().negate(), node.B],
      ] as const) {
        const c = e.clone().addScaledVector(out, 0.011);
        b.part(eyelet(0.011), WIRE, { bone: joint, at: c, dir: s, axis: "z", flat: true });
        hang(child, c.clone().add(V(0, -0.011, 0)), joint);
      }
    } else if (node.kind === "leaf") {
      const yaw = node.yaw * DEG;
      const X = V(Math.cos(yaw), 0, -Math.sin(yaw));
      const Y = V(0, 1, 0).applyAxisAngle(X, node.tilt * DEG);
      const N = X.clone().cross(Y).normalize();
      const part = b.extrude(OUT[node.shape](node.size), {
        at: top,
        x: X,
        y: Y,
        thickness: TH,
        bevel: 0.0015,
        smoothing: SMOOTH[node.shape],
        color: node.color,
        bone: joint,
      });
      b.part(eyelet(0.008), WIRE, {
        bone: joint,
        at: top.clone().addScaledVector(Y, 0.005),
        dir: N,
        axis: "z",
        flat: true,
      });
      if (node.inlay) {
        const i = node.inlay;
        for (const sg of [1, -1])
          b.extrude(OUT.disc(i.size), {
            at: part.local([i.u, i.v + i.size, sg * (TH / 2 + 0.002)]),
            x: X,
            y: Y,
            thickness: 0.004,
            color: i.color,
            bone: joint,
          });
      }
    } else {
      b.part(new THREE.SphereGeometry(node.r, 12, 8), node.color, {
        bone: joint,
        at: top.clone().add(V(0, -node.r, 0)),
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.009, 0.012, 0.012, 8), WIRE, {
        bone: joint,
        at: top.clone().add(V(0, 0.002, 0)),
        flat: true,
      });
    }
  }

  hang(TREE, hookPt, hook);
  return b.root;
}
```