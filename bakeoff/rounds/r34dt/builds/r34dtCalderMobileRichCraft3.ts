import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description:
    "A balanced hanging mobile in the spirit of Alexander Calder: black wire arms, nested counterweights, and flat primary-colour organic shapes.",
};

type V = [number, number, number];
type Outline = [number, number, ("sharp" | undefined)?][];
type Shape = { shape: string; size: number; color: string; wl?: number; yaw?: number };
type Node = { wire: number; bar: number; yaw: number; pa: number; tilt?: number; a: Shape | Node; b: Shape | Node };

const WIRE = "#16161a";
const RED = "#d8281e";
const BLUE = "#1f4fb0";
const YELLOW = "#f2c21b";
const WHITE = "#f4f1e8";
const BLACK = "#0e0e12";

function outline(kind: string): Outline {
  const out: Outline = [];
  switch (kind) {
    case "leaf":
      return [[0, 0], [0.3, -0.25], [0.36, -0.6], [0, -1, "sharp"], [-0.3, -0.55], [-0.3, -0.25]];
    case "disc":
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        out.push([Math.sin(a) * 0.5, -0.5 + Math.cos(a) * 0.5]);
      }
      return out;
    case "oval":
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        out.push([Math.sin(a) * 0.32, -0.5 + Math.cos(a) * 0.5]);
      }
      return out;
    case "kidney":
      return [[0, -0.05], [0.4, -0.1], [0.55, -0.4], [0.3, -0.62], [0.05, -0.45], [-0.2, -0.62], [-0.5, -0.45], [-0.4, -0.15]];
    case "triangle":
      return [[0, 0], [0.55, -0.9, "sharp"], [-0.5, -0.8, "sharp"]];
    case "crescent": {
      for (let i = 0; i <= 8; i++) {
        const a = (-70 + (i / 8) * 280) * (Math.PI / 180);
        out.push([Math.sin(a) * 0.5, -0.5 + Math.cos(a) * 0.5]);
      }
      for (let i = 8; i >= 0; i--) {
        const a = (-60 + (i / 8) * 260) * (Math.PI / 180);
        out.push([Math.sin(a) * 0.3 + 0.12, -0.5 + Math.cos(a) * 0.32]);
      }
      return out;
    }
    default:
      return outline("disc");
  }
}

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const cmds: ((dy: number) => void)[] = [];
  let minY = Infinity;

  const rod = (p: V, q: V, r: number, color: string) =>
    cmds.push((dy) => b.rod([p[0], p[1] + dy, p[2]], [q[0], q[1] + dy, q[2]], r, { color, sides: 6 } as any));
  const ball = (p: V, r: number, color: string) =>
    cmds.push((dy) => b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [p[0], p[1] + dy, p[2]] }));

  function shape(top: V, s: Shape) {
    const wl = s.wl ?? 0.3;
    const hp: V = [top[0], top[1] - wl, top[2]];
    rod(top, hp, 0.0035, WIRE);
    ball(hp, 0.008, WIRE);
    const yaw = s.yaw ?? 0.5;
    const ol = outline(s.shape).map(([x, y, f]) => (f ? [x * s.size, y * s.size, f] : [x * s.size, y * s.size])) as any;
    minY = Math.min(minY, hp[1] - s.size * (s.shape === "triangle" ? 0.9 : 1));
    cmds.push((dy) => {
      b.extrude(ol, {
        at: [hp[0], hp[1] + dy, hp[2]],
        x: [Math.cos(yaw), 0, -Math.sin(yaw)],
        thickness: 0.01,
        bevel: 0.002,
        color: s.color,
      });
      // small white-or-black accent dot on larger shapes
    });
    if (s.size > 0.25 && s.shape !== "disc") {
      const dot = s.color === BLACK ? WHITE : BLACK;
      cmds.push((dy) => {
        const nx = Math.sin(yaw);
        const nz = Math.cos(yaw);
        b.part(new THREE.CylinderGeometry(s.size * 0.07, s.size * 0.07, 0.004, 10), dot, {
          at: [hp[0] + nx * 0.007, hp[1] + dy - s.size * 0.4, hp[2] + nz * 0.007],
          dir: [nx, 0, nz],
        });
      });
    }
  }

  function node(top: V, n: Node) {
    const c: V = [top[0], top[1] - n.wire, top[2]];
    rod(top, c, 0.004, WIRE);
    const d: V = [Math.cos(n.yaw), n.tilt ?? 0.03, -Math.sin(n.yaw)];
    const la: V = [c[0] - d[0] * n.bar * n.pa, c[1] - d[1] * n.bar * n.pa, c[2] - d[2] * n.bar * n.pa];
    const lb: V = [c[0] + d[0] * n.bar * (1 - n.pa), c[1] + d[1] * n.bar * (1 - n.pa), c[2] + d[2] * n.bar * (1 - n.pa)];
    rod(la, lb, 0.0065, WIRE);
    ball(c, 0.011, WIRE);
    ball(la, 0.008, WIRE);
    ball(lb, 0.008, WIRE);
    for (const [end, item] of [[la, n.a], [lb, n.b]] as [V, Shape | Node][]) {
      if ("shape" in item) shape(end, item);
      else node(end, item);
    }
  }

  const tree: Node = {
    wire: 0.45,
    bar: 1.5,
    yaw: 0.3,
    pa: 0.4,
    a: {
      wire: 0.45,
      bar: 1.0,
      yaw: -0.8,
      pa: 0.55,
      a: { shape: "leaf", size: 0.5, color: RED, wl: 0.4, yaw: 0.2 },
      b: {
        wire: 0.3,
        bar: 0.6,
        yaw: 1.2,
        pa: 0.5,
        a: { shape: "disc", size: 0.22, color: BLACK, wl: 0.35 },
        b: { shape: "crescent", size: 0.32, color: YELLOW, wl: 0.25, yaw: 1.0 },
      },
    },
    b: {
      wire: 0.35,
      bar: 0.9,
      yaw: 0.9,
      pa: 0.4,
      a: {
        wire: 0.3,
        bar: 0.5,
        yaw: -0.4,
        pa: 0.5,
        a: { shape: "kidney", size: 0.34, color: BLUE, wl: 0.3, yaw: 0.8 },
        b: { shape: "disc", size: 0.16, color: WHITE, wl: 0.45 },
      },
      b: { shape: "triangle", size: 0.4, color: RED, wl: 0.5, yaw: -0.6 },
    },
  };

  const hookY = 2.7;
  node([0, hookY - 0.12, 0], tree);
  // hook & ceiling cap
  rod([0, hookY - 0.12, 0], [0, hookY, 0], 0.004, WIRE);
  cmds.push((dy) => {
    b.part(new THREE.TorusGeometry(0.03, 0.005, 6, 12), WIRE, { at: [0, hookY + dy + 0.03, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), BLACK, { at: [0, hookY + dy + 0.075, 0] });
  });

  const dy = -minY - 0.01;
  for (const c of cmds) c(dy);
  return b.root;
}
