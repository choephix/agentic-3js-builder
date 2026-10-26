import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description: "A hanging abstract mobile of balanced wire arms and flat painted shapes, in the manner of Alexander Calder.",
};

const BLACK = "#16161a";
const RED = "#d72820";
const BLUE = "#1f4fb0";
const YELLOW = "#f2c318";
const WHITE = "#f3efe6";
const WIRE = "#2a2a2e";

type V = [number, number, number];
type Rod = { a: V; b: V; r: number; c: string };
type Shp = { p: V; kind: number; s: number; c: string; yaw: number };

function outline(kind: number): [number, number][] {
  const o: [number, number][] = [];
  if (kind === 0) {
    for (let i = 0; i < 14; i++) o.push([Math.cos((i / 14) * 6.2832), Math.sin((i / 14) * 6.2832)]);
  } else if (kind === 1) {
    return [[0, -1], [0.6, -0.3], [0.5, 0.5], [0, 1], [-0.5, 0.5], [-0.6, -0.3]];
  } else if (kind === 2) {
    return [[-1, -0.7], [1, -0.5], [0.1, 0.9]];
  } else if (kind === 3) {
    for (let i = 0; i <= 8; i++) {
      const a = (-110 + (i / 8) * 220) * (Math.PI / 180);
      o.push([Math.cos(a), Math.sin(a)]);
    }
    for (let i = 0; i <= 8; i++) {
      const a = (110 - (i / 8) * 220) * (Math.PI / 180);
      o.push([Math.cos(a) * 0.75 - 0.4, Math.sin(a) * 0.75]);
    }
  } else {
    for (let i = 0; i < 14; i++) o.push([Math.cos((i / 14) * 6.2832) * 1.6, Math.sin((i / 14) * 6.2832) * 0.6]);
  }
  return o;
}

export default function build() {
  const b = createBuilder({ name: "calder_mobile" });
  const r = rng(11);
  const rods: Rod[] = [];
  const shapes: Shp[] = [];
  const palette = [RED, BLACK, BLUE, YELLOW, WHITE, BLACK, RED];
  let ci = 0;
  let minY = 0;

  const rod = (a: V, c: V, rad = 0.004) => {
    rods.push({ a, b: c, r: rad, c: WIRE });
    minY = Math.min(minY, a[1], c[1]);
  };

  // Hang from a point: either a shape or a sub-arm.
  function hang(top: V, depth: number, scale: number, yaw: number) {
    const drop = (0.18 + r() * 0.12) * (1 + depth * 0.15) * 1.0;
    const bot: V = [top[0], top[1] - drop, top[2]];
    rod(top, bot);
    if (depth <= 0) {
      const s = (0.1 + r() * 0.08) * (scale * 1.6 + 0.4);
      const kind = Math.floor(r() * 5);
      const p: V = [bot[0], bot[1] - s * 0.9, bot[2]];
      shapes.push({ p, kind, s, c: palette[ci++ % palette.length], yaw: r() * 3 });
      minY = Math.min(minY, p[1] - s);
      return;
    }
    arm(bot, depth, scale, yaw);
  }

  function arm(c: V, depth: number, scale: number, yaw: number) {
    const L = 0.9 * scale;
    const d: V = [Math.cos(yaw), 0, -Math.sin(yaw)];
    const ratio = 0.35 + r() * 0.12;
    const e1: V = [c[0] + d[0] * L * ratio, c[1], c[2] + d[2] * L * ratio];
    const e2: V = [c[0] - d[0] * L * (1 - ratio), c[1], c[2] - d[2] * L * (1 - ratio)];
    rod(e1, e2, 0.006);
    // small loops at the ends
    rods.push({ a: [e1[0], e1[1] + 0.012, e1[2]], b: e1, r: 0.006, c: WIRE });
    hang(e1, depth - 1, scale * 0.7, yaw + 1.2);
    hang(e2, depth - 1 - (r() < 0.4 ? 1 : 0), scale * 0.7, yaw - 1.0);
  }

  const topY = 0;
  const hookEnd: V = [0, topY - 0.45, 0];
  rod([0, topY, 0], hookEnd, 0.005);
  arm(hookEnd, 3, 1.5, 0.3);

  const dy = -minY;
  const sh = (p: V): V => [p[0], p[1] + dy, p[2]];
  for (const q of rods) b.rod(sh(q.a), sh(q.b), q.r, q.c, { sides: 5 } as any);
  for (const s of shapes) {
    const x: V = [Math.cos(s.yaw), 0, -Math.sin(s.yaw)];
    b.extrude(
      outline(s.kind).map((p) => [p[0] * s.s, p[1] * s.s] as [number, number]),
      { at: sh(s.p), x, thickness: 0.012, smoothing: s.kind === 1 ? 1 : 0, color: s.c },
    );
  }
  // ceiling hook ring
  const top = sh([0, topY, 0]);
  b.part(new THREE.TorusGeometry(0.035, 0.006, 5, 12), WIRE, { at: [top[0], top[1] + 0.035, 0], rotation: [0, 90, 0] });
  return b.root;
}
