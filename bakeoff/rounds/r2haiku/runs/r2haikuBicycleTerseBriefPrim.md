```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];

const RED = "#8a2a22";
const CREAM = "#ecdcb8";
const CHROME = "#c8ccd2";
const BLACK = "#1e1e1e";
const LEATHER = "#6b4a2b";
const BRASS = "#c9a14a";
const GLASS = "#f2e6a0";

export const meta = {
  name: "vintage-bicycle",
  description: "A 1950s roadster: red diamond frame, cream lugs, chrome drop bars, brass chainring and headlamp, leather saddle, full fenders.",
};

export default function build() {
  const b = createBuilder({ name: "vintage-bicycle" });

  // Skeleton: root frame plus the parts that move on a real bike.
  const frame = b.joint("frame", { at: [0, 0, 0] });
  const rear = b.joint("rear", { at: [0, 0.335, -0.5], parent: frame });
  const front = b.joint("front", { at: [0, 0.335, 0.5], parent: frame });
  const steer = b.joint("steer", { at: [0, 0.84, 0.4], parent: frame });

  // Key points in model space (metres).
  const BB: V = [0, 0.27, -0.05];
  const seatLug: V = [0, 0.8, -0.2];
  const headTop: V = [0, 0.97, 0.38];
  const headBot: V = [0, 0.84, 0.4];
  const rearAxle: V = [0, 0.335, -0.5];
  const frontAxle: V = [0, 0.335, 0.5];

  // A straight tube between two points, aimed along its length.
  function seg(a: V, c: V, r: number, color: string, bone: any) {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const L = d.length();
    const geo = new THREE.CylinderGeometry(r, r, L, 6, 1);
    const mid = A.clone().add(B).multiplyScalar(0.5);
    b.part(geo, color, {
      at: [mid.x, mid.y, mid.z],
      dir: [d.x / L, d.y / L, d.z / L],
      bone,
    });
  }

  // A round lug or joint ball.
  function lug(p: V, r: number, color: string, bone: any) {
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at: p, bone });
  }

  // A wheel: chunky tyre, chrome rim, hub, 32 laced spokes, and a full fender.
  function wheel(c: V, bone: any) {
    const tire = new THREE.TorusGeometry(0.3, 0.035, 8, 36);
    tire.rotateY(Math.PI / 2);
    b.part(tire, BLACK, { at: c, bone });

    const rim = new THREE.TorusGeometry(0.3, 0.012, 6, 36);
    rim.rotateY(Math.PI / 2);
    b.part(rim, CHROME, { at: c, bone });

    const hub = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8);
    hub.rotateZ(Math.PI / 2);
    b.part(hub, CHROME, { at: c, bone });

    for (let i = 0; i < 16; i++) {
      const t = (i * Math.PI * 2) / 16;
      const s = i % 2 ? -0.025 : 0.025;
      const hubPt: V = [c[0] + s, c[1], c[2]];
      const rimPt: V = [c[0] + s, c[1] + 0.3 * Math.cos(t), c[2] + 0.3 * Math.sin(t)];
      seg(hubPt, rimPt, 0.006, CHROME, bone);
    }

    // Full fenders, two thin arcs over the tyre.
    const arc = Math.PI * 0.7;
    for (const s of [-0.045, 0.045]) {
      const f = new THREE.TorusGeometry(0.37, 0.012, 6, 24, arc);
      f.rotateZ(Math.PI / 2 - arc / 2);
      f.rotateY(Math.PI / 2);
      b.part(f, CHROME, { at: [c[0] + s, c[1], c[2]], bone });
    }
  }

  wheel(rearAxle, rear);
  wheel(frontAxle, front);

  // Rear cog and chainring.
  const cog = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16);
  cog.rotateZ(Math.PI / 2);
  b.part(cog, CHROME, { at: [0.035, 0.335, -0.5], bone: rear });

  const ring = new THREE.CylinderGeometry(0.09, 0.09, 0.008, 20);
  ring.rotateZ(Math.PI / 2);
  b.part(ring, BRASS, { at: [0.06, BB[1], BB[2]], bone: frame });

  // Frame: red diamond tubes with cream lugs at each joint.
  const T = 0.022;
  seg(BB, seatLug, T, RED, frame); // seat tube
  seg(seatLug, headTop, T, RED, frame); // top tube
  seg(BB, headBot, T, RED, frame); // down tube
  seg(headBot, headTop, 0.03, CREAM, steer); // head tube

  for (const s of [-1, 1]) {
    // Chainstays: bottom bracket to rear axle.
    seg([s * 0.02, BB[1], BB[2]], [s * 0.045, rearAxle[1], rearAxle[2]], 0.014, RED, frame);
    // Seat stays: seat lug to rear axle.
    seg([s * 0.02, seatLug[1], seatLug[2]], [s * 0.045, rearAxle[1], rearAxle[2]], 0.012, RED, frame);
    // Fork blades: crown to front axle.
    seg([s * 0.04, 0.84, 0.4], [s * 0.045, frontAxle[1], frontAxle[2]], 0.014, RED, steer);
    // Crank arms pivot at the bottom bracket.
    lug([s * 0.02, BB[1], BB[2]], 0.02, CREAM, frame);
  }

  lug(BB, 0.035, CREAM, frame);
  lug(seatLug, 0.03, CREAM, frame);
  lug(headTop, 0.03, CREAM, steer);
  lug(headBot, 0.03, CREAM, steer);

  // Cranks and pedals, set at opposite angles.
  const cr = 0.17;
  const a = Math.PI / 4;
  const p1: V = [0.08, BB[1] + cr * Math.cos(a), BB[2] + cr * Math.sin(a)];
  const p2: V = [-0.08, BB[1] - cr * Math.cos(a), BB[2] - cr * Math.sin(a)];
  seg([0.07, BB[1], BB[2]], p1, 0.012, CHROME, frame);
  seg([-0.07, BB[1], BB[2]], p2, 0.012, CHROME, frame);
  for (const p of [p1, p2]) {
    const pedal = new THREE.BoxGeometry(0.1, 0.02, 0.06);
    b.part(pedal, BLACK, { at: p, bone: frame });
  }

  // Seat post and leather saddle.
  const seatTop: V = [0, 0.93, -0.27];
  seg(seatLug, seatTop, 0.016, CHROME, frame);
  const saddle = new THREE.SphereGeometry(1, 14, 8);
  saddle.scale(0.11, 0.035, 0.2);
  b.part(saddle, LEATHER, { at: [0, 0.95, -0.27], bone: frame });

  // Stem and chrome drop bars on the steering joint.
  seg(headTop, [0, 1.04, 0.34], 0.02, CHROME, steer);
  for (const s of [-1, 1]) {
    const path: V[] = [
      [0, 1.04, 0.34],
      [s * 0.12, 1.05, 0.3],
      [s * 0.21, 1.04, 0.26],
      [s * 0.22, 0.98, 0.3],
      [s * 0.2, 0.93, 0.36],
    ];
    for (let i = 0; i < path.length - 1; i++) {
      seg(path[i], path[i + 1], 0.014, CHROME, steer);
    }
    // Leather grip wrap on the top of each bar.
    seg([s * 0.12, 1.05, 0.3], [s * 0.2, 1.04, 0.27], 0.02, LEATHER, steer);
  }

  // Brass bell on the right bar.
  const bell = new THREE.SphereGeometry(1, 12, 8);
  bell.scale(0.035, 0.03, 0.035);
  b.part(bell, BRASS, { at: [0.12, 1.08, 0.3], bone: steer });

  // Brass headlamp on the fork crown with a glass lens.
  const lampBody = new THREE.CylinderGeometry(0.05, 0.05, 0.07, 12);
  lampBody.rotateX(Math.PI / 2);
  b.part(lampBody, BRASS, { at: [0, 0.92, 0.46], bone: steer });
  const lens = new THREE.SphereGeometry(1, 12, 8);
  lens.scale(0.04, 0.04, 0.015);
  b.part(lens, GLASS, { at: [0, 0.92, 0.5], bone: steer });

  // Cream head badge.
  const badge = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 14);
  badge.rotateX(Math.PI / 2);
  b.part(badge, CREAM, { at: [0, 0.9, 0.44], bone: steer });

  return b.root;
}
```