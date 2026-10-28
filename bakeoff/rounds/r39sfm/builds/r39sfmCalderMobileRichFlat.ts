import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging mobile in the manner of Alexander Calder: black wire arms balanced in tiers, carrying flat organic discs, leaves, crescents and stars in red, yellow, blue, black and white.",
};

const RED = "#d62828";
const BLACK = "#151515";
const YELLOW = "#f6b60a";
const BLUE = "#1d4e9e";
const WHITE = "#f1eee4";
const WIRE = "#262626";

type OL = [number, number] | [number, number, "sharp"];
type Kind = "disc" | "leaf" | "crescent" | "kidney" | "tri" | "star";
type Shape = { shape: Kind; rx: number; ry: number; color: string; dot?: string };
type Arm = { arm: true; left: number; right: number; tilt: number; rotY: number; l: Hang; r: Hang };
type Hang = { wire: number; to: Shape | Arm };

const S = (shape: Kind, rx: number, ry: number, color: string, dot?: string): Shape => ({ shape, rx, ry, color, dot });
const H = (wire: number, to: Shape | Arm): Hang => ({ wire, to });
const A = (left: number, right: number, tilt: number, rotY: number, l: Hang, r: Hang): Arm => ({
  arm: true,
  left,
  right,
  tilt,
  rotY,
  l,
  r,
});

function ellipse(rx: number, ry: number, n = 16): OL[] {
  const o: OL[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    o.push([rx * Math.cos(a), ry * Math.sin(a)]);
  }
  return o;
}

function outline(k: Kind, rx: number, ry: number): OL[] {
  switch (k) {
    case "disc":
      return ellipse(rx, ry, 16);
    case "leaf":
      return [
        [0, -ry, "sharp"],
        [rx, -ry * 0.1],
        [0, ry, "sharp"],
        [-rx * 0.75, ry * 0.05],
      ];
    case "tri":
      return [
        [-rx, -ry * 0.8],
        [rx, -ry * 0.55],
        [rx * 0.1, ry],
      ];
    case "kidney": {
      const o: OL[] = [];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const dent = 0.5 * Math.pow(Math.max(0, Math.sin(a)), 6);
        o.push([rx * Math.cos(a), ry * Math.sin(a) * (1 - dent)]);
      }
      return o;
    }
    case "crescent": {
      const o: OL[] = [];
      const n = 10;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI / 2 + (i / n) * Math.PI;
        o.push([rx * Math.cos(a), ry * Math.sin(a)]);
      }
      for (let i = 0; i <= n; i++) {
        const a = (3 * Math.PI) / 2 - (i / n) * Math.PI;
        o.push([0.4 * rx + 0.7 * rx * Math.cos(a), 0.85 * ry * Math.sin(a)]);
      }
      return o;
    }
    case "star": {
      const o: OL[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const f = i % 2 ? 0.42 : 1;
        o.push([rx * f * Math.cos(a), ry * f * Math.sin(a), "sharp"]);
      }
      return o;
    }
  }
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "calder_mobile" });
  let dry = true;
  let minY = 0;
  const off = new THREE.Vector3();
  const P = (x: number, y: number, z: number): [number, number, number] => [x + off.x, y + off.y, z + off.z];

  const wire = (a: THREE.Vector3, c: THREE.Vector3, r = 0.0035) => {
    if (dry) return;
    b.rod(P(a.x, a.y, a.z), P(c.x, c.y, c.z), r, WIRE);
  };
  const loop = (p: THREE.Vector3, r = 0.009) => {
    if (dry) return;
    b.part(new THREE.TorusGeometry(r, 0.0025, 5, 10), WIRE, { at: P(p.x, p.y, p.z) });
  };

  function drawShape(s: Shape, top: THREE.Vector3, rotY: number) {
    const cy = top.y - s.ry - 0.012;
    minY = Math.min(minY, cy - s.ry);
    if (dry) return;
    const c = Math.cos(rotY);
    const sn = Math.sin(rotY);
    const x: [number, number, number] = [c, 0, -sn];
    const n = [sn, 0, c];
    const ctr = new THREE.Vector3(top.x, cy, top.z);
    // short tab from the wire into the shape
    b.rod(P(top.x, top.y, top.z), P(top.x, cy + s.ry * 0.6, top.z), 0.003, WIRE);
    loop(new THREE.Vector3(top.x, top.y - 0.006, top.z), 0.006);
    b.extrude(outline(s.shape, s.rx, s.ry), {
      at: P(ctr.x, ctr.y, ctr.z),
      x,
      thickness: 0.006,
      smoothing: s.shape === "disc" || s.shape === "crescent" || s.shape === "star" ? 0 : s.shape === "kidney" ? 0 : 2,
      color: s.color,
    });
    if (s.dot) {
      const d = s.shape === "star" ? 0.3 : 0.45;
      b.extrude(ellipse(s.rx * d, s.ry * d, 12), {
        at: P(ctr.x + n[0] * 0.005, ctr.y, ctr.z + n[2] * 0.005),
        x,
        thickness: 0.005,
        color: s.dot,
      });
      b.extrude(ellipse(s.rx * d, s.ry * d, 12), {
        at: P(ctr.x - n[0] * 0.005, ctr.y, ctr.z - n[2] * 0.005),
        x,
        thickness: 0.005,
        color: s.dot,
      });
    }
  }

  function hang(h: Hang, from: THREE.Vector3, rotY: number) {
    const end = new THREE.Vector3(from.x, from.y - h.wire, from.z);
    wire(from, end, 0.0025);
    if ("arm" in h.to) place(h.to, end);
    else drawShape(h.to, end, rotY);
  }

  function place(a: Arm, pivot: THREE.Vector3) {
    const t = (a.tilt * Math.PI) / 180;
    const ry = (a.rotY * Math.PI) / 180;
    const d = new THREE.Vector3(Math.cos(t) * Math.cos(ry), Math.sin(t), -Math.cos(t) * Math.sin(ry));
    const L = pivot.clone().addScaledVector(d, -a.left);
    const R = pivot.clone().addScaledVector(d, a.right);
    wire(L, R, 0.004);
    loop(pivot, 0.011);
    loop(L, 0.007);
    loop(R, 0.007);
    if (!dry) {
      b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { at: P(L.x, L.y, L.z) });
      b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { at: P(R.x, R.y, R.z) });
    }
    hang(a.l, L, ry + 0.5);
    hang(a.r, R, ry - 0.6);
  }

  const tree: Arm = A(
    0.55,
    0.8,
    4,
    0,
    H(
      0.28,
      A(
        0.3,
        0.42,
        -6,
        40,
        H(0.32, S("disc", 0.12, 0.12, RED, WHITE)),
        H(
          0.2,
          A(
            0.2,
            0.24,
            7,
            -30,
            H(0.2, S("leaf", 0.07, 0.15, BLACK)),
            H(0.38, S("crescent", 0.1, 0.12, YELLOW)),
          ),
        ),
      ),
    ),
    H(
      0.32,
      A(
        0.48,
        0.32,
        5,
        -50,
        H(0.45, S("leaf", 0.13, 0.22, BLUE, WHITE)),
        H(
          0.16,
          A(
            0.22,
            0.2,
            -9,
            70,
            H(0.26, S("disc", 0.07, 0.07, WHITE, BLACK)),
            H(0.48, S("star", 0.1, 0.1, RED)),
          ),
        ),
      ),
    ),
  );

  const run = () => {
    const pivot = new THREE.Vector3(0, -0.38, 0);
    const hook = new THREE.Vector3(0, -0.02, 0);
    wire(hook, pivot, 0.0035);
    loop(new THREE.Vector3(0, 0.012, 0), 0.03);
    place(tree, pivot);
  };

  run();
  off.y = -minY;
  dry = false;
  run();
  return b.root;
}
