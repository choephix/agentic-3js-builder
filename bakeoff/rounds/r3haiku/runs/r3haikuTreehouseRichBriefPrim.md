```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse Diorama",
  description:
    "A thick old oak with a red-roofed cabin in its branches, a rope ladder, a swing, a pennant, a lantern, mushrooms and a bicycle on a grassy round base.",
};

type V = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;

// ---------- small vector helpers ----------
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const lerp3 = (a: V, b: V, t: number): V => add(a, mul(sub(b, a), t));
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / len(a));
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// Flat-shaded custom solid from triangles. With a hint (interior point) the
// winding is fixed so faces point outward; without one, winding is kept as given.
function solid(tris: V[][], hint: V | null): THREE.BufferGeometry {
  const pos: number[] = [];
  for (const [p0, p1, p2] of tris) {
    let q1 = p1;
    let q2 = p2;
    if (hint) {
      const n = cross(sub(p1, p0), sub(p2, p0));
      const c = mul(add(add(p0, p1), p2), 1 / 3);
      if (dot(n, sub(c, hint)) < 0) {
        q1 = p2;
        q2 = p1;
      }
    }
    pos.push(...p0, ...q1, ...q2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// Re-centre a custom geometry on its bounding box and return that centre.
function centred(g: THREE.BufferGeometry): V {
  g.computeBoundingBox();
  const c = new THREE.Vector3();
  g.boundingBox!.getCenter(c);
  g.translate(-c.x, -c.y, -c.z);
  return [c.x, c.y, c.z];
}

// A cylinder running from a to c (rA at a, rC at c).
function rod(b: Builder, a: V, c: V, rA: number, rC: number, color: string, seg = 8) {
  const d = sub(c, a);
  const L = len(d);
  const geo = new THREE.CylinderGeometry(rC, rA, L, seg);
  b.part(geo, color, { at: lerp3(a, c, 0.5), dir: mul(d, 1 / L) });
}

function box(b: Builder, size: V, at: V, color: string) {
  b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at });
}

function mushroom(b: Builder, x: number, z: number, s: number) {
  const base = 0.6;
  b.part(new THREE.CylinderGeometry(0.07 * s, 0.09 * s, 0.25 * s, 8), "#f5efe0", {
    at: [x, base + 0.125 * s, z],
  });
  const capY = base + 0.25 * s;
  b.part(new THREE.SphereGeometry(0.22 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#e53935", {
    at: [x, capY, z],
  });
  const spots: V[] = [
    [0.5, 0.8, 0.3],
    [-0.7, 0.6, -0.2],
    [0.1, 0.7, -0.7],
  ];
  for (const s0 of spots) {
    const u = norm(s0 as V);
    const p = add([x, capY, z], mul(u, 0.2 * s));
    b.part(new THREE.SphereGeometry(0.045 * s, 6, 4), "#fff8e1", { at: p });
  }
}

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("base", { at: [0, 0, 0] });

  // Palette
  const bark = "#6b4a2b";
  const wood = "#d9b27c";
  const cream = "#ead9ab";
  const roofRed = "#b8322a";
  const deckWood = "#a0703f";
  const doorBrown = "#6b4226";
  const frameBrown = "#5a3a1f";
  const glass = "#bfe6ff";
  const leafDark = "#2f6334";
  const leafMid = "#3f7d3a";
  const leafLight = "#5c9a45";
  const leafBright = "#7cb342";
  const grass = "#7cb342";
  const earth = "#7a5230";
  const stone = "#8d8d8d";
  const rope = "#c8b48a";
  const rung = "#8d6e63";
  const flagRed = "#e53935";
  const pole = "#eeeeee";
  const lanternGlow = "#ffd54f";
  const postDark = "#4e342e";
  const mushStem = "#f5efe0";
  const bikeFrame = "#2e7dd1";
  const tire = "#222222";
  const hub = "#bbbbbb";

  // ---------- round base ----------
  b.part(new THREE.CylinderGeometry(7, 6.8, 0.5, 40), earth, { at: [0, 0.25, 0] });
  b.part(new THREE.CylinderGeometry(6.92, 6.92, 0.1, 40), grass, { at: [0, 0.55, 0] });
  // little grass tufts and flowers around the rim
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const r = 5.4 + (i % 3) * 0.6;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const col = i % 4 === 0 ? "#f48fb1" : i % 2 === 0 ? leafBright : leafLight;
    b.part(new THREE.ConeGeometry(0.14, 0.26, 5), col, { at: [x, 0.6 + 0.13, z] });
  }

  // ---------- trunk, flare and branches ----------
  rod(b, [0, 0.6, 0], [0, 0.9, 0], 0.98, 0.7, bark, 9);
  rod(b, [0, 0.6, 0], [0, 5.8, 0], 0.7, 0.45, bark, 9);
  rod(b, [0, 4.9, 0], [1.0, 5.6, 0.4], 0.28, 0.14, bark); // deck support
  rod(b, [0, 5.2, -0.2], [-3.4, 6.2, -0.6], 0.22, 0.1, bark); // swing branch
  rod(b, [0.1, 5.5, -0.3], [3.2, 7.8, -1.0], 0.22, 0.08, bark);
  rod(b, [0, 5.6, 0], [-2.2, 8.0, -1.2], 0.22, 0.08, bark);
  rod(b, [0, 5.6, 0], [0.3, 9.2, -0.5], 0.4, 0.15, bark);
  rod(b, [0.2, 7.0, -0.5], [1.6, 9.8, -2.0], 0.18, 0.07, bark);
  rod(b, [0, 3.0, 0], [-1.8, 3.9, -1.4], 0.3, 0.12, bark);

  // ---------- crown ----------
  const crown: [V, number, string][] = [
    [[-2.8, 8.4, -0.6], 1.6, leafDark],
    [[-1.5, 10.0, -1.4], 1.7, leafMid],
    [[0.6, 10.6, -1.8], 1.6, leafLight],
    [[2.6, 9.6, -1.9], 1.5, leafMid],
    [[3.4, 8.1, -0.6], 1.5, leafDark],
    [[3.1, 7.3, 1.3], 1.3, leafMid],
    [[-3.2, 7.0, 1.2], 1.3, leafLight],
    [[-0.6, 10.9, 0.6], 1.3, leafBright],
    [[-1.8, 6.8, -2.9], 1.3, leafDark],
    [[1.5, 7.6, -3.0], 1.3, leafMid],
    [[0.0, 8.8, -2.6], 1.4, leafLight],
    [[-3.6, 9.2, -1.8], 1.2, leafBright],
    [[4.2, 9.0, -0.2], 1.1, leafLight],
  ];
  for (const [p, r, c] of crown) {
    b.part(new THREE.IcosahedronGeometry(r, 0), c, { at: p });
  }

  // ---------- cabin ----------
  const cx = 1.0;
  const cz = 0.4;
  const wallY = 6.85;
  const eave = 7.85;

  // deck
  box(b, [3.2, 0.2, 2.8], [cx, 5.75, cz], deckWood);

  // walls
  box(b, [2.6, 2.0, 2.2], [cx, wallY, cz], wood);

  // gable roof (ridge runs along Z)
  const W = 1.5;
  const D = 1.25;
  const h = 1.4;
  const A: V = [cx - W, eave, cz - D];
  const B: V = [cx + W, eave, cz - D];
  const C: V = [cx + W, eave, cz + D];
  const Dd: V = [cx - W, eave, cz + D];
  const R1: V = [cx, eave + h, cz - D];
  const R2: V = [cx, eave + h, cz + D];
  const roofHint: V = [cx, eave + 0.4 * h, cz];

  const slopes = solid(
    [
      [A, Dd, R2],
      [A, R2, R1],
      [B, R1, R2],
      [B, R2, C],
    ],
    roofHint,
  );
  b.part(slopes, roofRed, { at: centred(slopes) });

  const gables = solid(
    [
      [Dd, C, R2],
      [A, R1, B],
    ],
    roofHint,
  );
  b.part(gables, cream, { at: centred(gables) });

  // round attic window on the front gable
  b.part(new THREE.TorusGeometry(0.3, 0.05, 8, 16), frameBrown, { at: [cx, 8.5, cz + D + 0.02] });
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 14), glass, {
    at: [cx, 8.5, cz + D + 0.01],
    dir: [0, 0, 1],
  });

  // door, front window and side window
  box(b, [0.7, 1.5, 0.06], [cx, 6.6, cz + 1.1 + 0.04], doorBrown);
  box(b, [0.72, 0.72, 0.03], [cx - 0.7, 6.9, cz + 1.1 + 0.005], frameBrown);
  box(b, [0.6, 0.6, 0.04], [cx - 0.7, 6.9, cz + 1.1 + 0.02], glass);
  box(b, [0.03, 0.72, 0.72], [cx + 1.3 + 0.005, 6.9, cz], frameBrown);
  box(b, [0.04, 0.6, 0.6], [cx + 1.3 + 0.02, 6.9, cz], glass);

  // chimney
  box(b, [0.36, 1.0, 0.36], [cx + 0.7, 8.85, cz - 0.5], stone);
  box(b, [0.44, 0.08, 0.44], [cx + 0.7, 9.36, cz - 0.5], "#6e6e6e");

  // pennant on a pole at the ridge
  rod(b, [cx, 9.2, cz], [cx, 10.6, cz], 0.04, 0.04, pole, 6);
  const top: V = [cx, 10.5, cz];
  const bot: V = [cx, 10.05, cz];
  const tip: V = [cx + 0.85, 10.28, cz];
  const flagTris: V[][] = [
    [top, bot, tip],
    [top, tip, bot],
  ];
  const flag = solid(flagTris, null);
  b.part(flag, flagRed, { at: centred(flag) });

  // lantern on a post beside the door
  rod(b, [1.85, 5.85, 1.55], [1.85, 6.75, 1.55], 0.05, 0.05, postDark, 6);
  box(b, [0.3, 0.36, 0.3], [1.85, 6.95, 1.55], lanternGlow);
  b.part(new THREE.ConeGeometry(0.2, 0.18, 4), postDark, { at: [1.85, 7.22, 1.55] });

  // ---------- rope ladder hanging from the deck front ----------
  const lx0 = -0.45;
  const lx1 = 0.05;
  const lz = 1.9;
  rod(b, [lx0, 5.65, lz], [lx0, 0.8, lz], 0.03, 0.03, rope, 6);
  rod(b, [lx1, 5.65, lz], [lx1, 0.8, lz], 0.03, 0.03, rope, 6);
  for (let y = 5.2; y > 1.0; y -= 0.45) {
    rod(b, [lx0, y, lz], [lx1, y, lz], 0.03, 0.03, rung, 6);
  }

  // ---------- swing hanging from the left branch ----------
  const sw0: V = [0, 5.2, -0.2];
  const sw1: V = [-3.4, 6.2, -0.6];
  const attach = (x: number): V => lerp3(sw0, sw1, x / -3.4);
  const seatY = 3.7;
  const seatZ = -0.45;
  for (const x of [-2.0, -2.6]) {
    rod(b, attach(x), [x, seatY + 0.03, seatZ], 0.025, 0.025, rope, 6);
  }
  box(b, [0.66, 0.07, 0.32], [-2.3, seatY, seatZ], "#c48a4a");

  // ---------- mushrooms at the foot of the tree ----------
  mushroom(b, -1.6, 1.9, 1.0);
  mushroom(b, -1.3, 2.4, 0.7);
  mushroom(b, -2.0, 2.2, 0.75);

  // ---------- bicycle leaning at the foot of the tree ----------
  const bx = 1.8;
  const hubY = 0.96; // wheel centre height (wheel radius 0.36 sits on the grass)
  const R: V = [bx, hubY, 2.45];
  const F: V = [bx, hubY, 3.55];
  const BB: V = [bx, 0.98, 3.0];
  const S: V = [bx, 1.55, 2.8];
  const H: V = [bx, 1.5, 3.35];
  rod(b, R, BB, 0.035, 0.035, bikeFrame, 6); // chainstay
  rod(b, BB, S, 0.035, 0.035, bikeFrame, 6); // seat tube
  rod(b, S, H, 0.035, 0.035, bikeFrame, 6); // top tube
  rod(b, BB, H, 0.04, 0.04, bikeFrame, 6); // down tube
  rod(b, S, R, 0.03, 0.03, bikeFrame, 6); // seat stay
  rod(b, H, F, 0.035, 0.035, bikeFrame, 6); // fork
  rod(b, H, [bx, 1.8, 3.25], 0.03, 0.03, bikeFrame, 6); // stem and bars
  box(b, [0.22, 0.06, 0.3], [bx, 1.6, 2.78], tire); // saddle
  for (const w of [R, F]) {
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 14), tire, { at: w, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), hub, { at: w, dir: [1, 0, 0] });
  }

  return b.root;
}
```