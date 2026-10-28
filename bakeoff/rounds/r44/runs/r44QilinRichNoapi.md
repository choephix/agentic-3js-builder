```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, bezier, svg, paint, scales, mix, smoothstep, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin",
  description: "A jade-scaled qilin: dragon head, branching antlers, golden hooves, cloud mane and a flame tail, in a high-fantasy anime style.",
};

const JADE = ["#2fb58c", "#27a07f", "#3cc79a", "#238f74"];
const JADE_EDGE = "#0f4f45";
const BELLY = "#f6e6b8";
const GOLD = "#f2b93a";
const GOLD_D = "#a8741a";
const ANTLER = "#f1dcae";
const ANTLER_T = "#ffb347";
const CREAM = "#fff3d6";

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 1024 });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const A = (x: THREE.Vector3) => x.toArray() as [number, number, number];

  // paints
  const scalePaint = scales(JADE, JADE_EDGE, { size: 0.07, width: 0.14, seed: 3 });
  const coat = paint((p, n) => {
    let c = mix(BELLY, "#ffffff", 0);
    const sc = scalePaint.at(p, n);
    c = mix(BELLY, sc, smoothstep(-0.55, -0.1, n.y));
    c = mix(c, "#7fe8c0", smoothstep(0.6, 1, n.y) * 0.25 * noise(p, 0.1, 2));
    return c;
  });

  // skeleton
  const hips = b.joint("hips", { at: [0, 1.0, -0.5] });
  const spine = b.chain("spine", catmull([[0, 1.0, -0.5], [0, 1.02, -0.1], [0, 1.08, 0.3], [0, 1.12, 0.5]]), {
    parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"],
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 1.25, 0.5], [0, 1.5, 0.68], [0, 1.72, 0.85]]), {
    parent: chest, role: "neck", names: ["neck1", "neck2"],
  });
  const D = v(0, -0.25, 0.97).normalize();
  const U = v(0, 0.97, 0.25).normalize();
  const P0 = neck.at(1).at.clone();
  const hp = (f: number, u: number, x = 0) => P0.clone().addScaledVector(D, f).addScaledVector(U, u).add(v(x, 0, 0));
  const head = b.joint("head", { parent: neck.joints[1], at: P0, dir: A(D), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.12, -0.1), aim: hp(0.5, -0.12), role: "jaw" });

  const body = b.loft(
    [
      { at: [0, 1.0, -0.8], w: 0.38, h: 0.4 },
      { at: [0, 1.0, -0.5], w: 0.52, h: 0.52 },
      { at: [0, 1.02, -0.1], w: 0.5, h: 0.5 },
      { at: [0, 1.08, 0.3], w: 0.6, h: 0.6 },
      { at: [0, 1.15, 0.55], w: 0.5, h: 0.52 },
    ],
    { bone: [hips, spine], color: coat, sides: 10, smooth: false, name: "body" },
  );
  const neckTube = b.sweep(neck, (t) => [0.2 - 0.09 * t, 0.22 - 0.1 * t], { color: coat, sides: 8, smooth: false, name: "neck" });

  // head
  const st = (f: number, u: number, w: number, h: number) => ({ at: hp(f, u), w, h });
  const skull = b.loft([st(-0.08, 0, 0.2, 0.22), st(0.08, -0.02, 0.24, 0.26), st(0.26, -0.05, 0.19, 0.18), st(0.42, -0.07, 0.17, 0.14), st(0.52, -0.08, 0.18, 0.13)], {
    bone: head, color: coat, sides: 8, smooth: false, name: "skull",
  });
  b.loft([st(0.1, -0.16, 0.14, 0.08), st(0.3, -0.16, 0.12, 0.07), st(0.5, -0.14, 0.12, 0.06)], {
    bone: jaw, color: BELLY, sides: 6, smooth: false, name: "jawBody",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.018, 0), "#2a1a1a", { bone: head, at: hp(0.52, -0.06, s * 0.05), scale: [1, 0.7, 1], flat: true });
    // whiskers
    b.sweep(catmull([hp(0.45, -0.1, s * 0.08), hp(0.5, -0.2, s * 0.25), hp(0.35, -0.42, s * 0.35), hp(0.2, -0.6, s * 0.3)]), [0.01, 0.002], {
      bone: head, color: GOLD, sides: 4, caps: "point", name: "whisker",
    });
    // fangs
    b.spike(hp(0.46, -0.13, s * 0.07), [0, -1, 0], 0.05, 0.014, { bone: head, color: CREAM, sides: 4 });
    // ears
    b.spike(hp(0.0, 0.13, s * 0.11), [s * 0.8, 0.5, -0.5], 0.17, 0.045, { bone: head, color: coat, sides: 4, smooth: false });
  }
  const eye = svg(
    `<svg viewBox="0 0 64 48"><path d="M3 30 Q32 -4 61 24 Q32 50 3 30Z" fill="#1a1230"/><circle cx="34" cy="26" r="15" fill="#ffb02e"/><circle cx="34" cy="28" r="9" fill="#c85a10"/><ellipse cx="34" cy="27" rx="4" ry="11" fill="#1a1230"/><circle cx="27" cy="20" r="5.5" fill="#fff"/><circle cx="41" cy="34" r="2.5" fill="#ffe8b0"/><path d="M2 30 Q30 -8 62 22" stroke="#1a1230" stroke-width="5" fill="none"/></svg>`,
    { size: 192 },
  );
  for (const s of [1, -1])
    b.decal(skull, eye, { at: hp(0.2, 0.0, s * 0.11), dir: [s * 0.9, 0.15, 0.4], up: A(U), size: [0.12, 0.09], mirror: s < 0, name: s > 0 ? "eyeL" : "eyeR" });
  // brow gem
  glow(b.part(new THREE.OctahedronGeometry(0.035, 0), "#ff5a3c", { bone: head, at: hp(0.2, 0.15), flat: true, name: "browGem" }), 1.4);
  b.part(new THREE.OctahedronGeometry(0.05, 0), GOLD, { bone: head, at: hp(0.2, 0.15), scale: [1, 1, 0.5], flat: true });

  // antlers
  for (const s of [1, -1]) {
    const base = hp(0.0, 0.14, s * 0.07);
    const main = [base, base.clone().add(v(s * 0.08, 0.22, -0.1)), base.clone().add(v(s * 0.14, 0.5, -0.12)), base.clone().add(v(s * 0.1, 0.78, -0.2))];
    b.sweep(catmull(main), [0.04, 0.012], { bone: head, color: ANTLER, sides: 6, caps: "point", name: "antler" });
    const tines: [number, number, number, number][] = [[1, 0.3, 0.1, 0.18], [2, 0.55, 0.14, 0.2], [3, 0.8, 0.12, 0.18]];
    for (const [i, h, dx, dz] of tines) {
      const o = base.clone().add(v(s * (0.06 + 0.03 * i), h * 0.9, -0.1 - 0.03 * i));
      const tip = o.clone().add(v(s * dx * 1.6, 0.2, dz * 0.8));
      b.sweep(catmull([o, o.clone().lerp(tip, 0.5).add(v(0, 0.05, 0.06)), tip]), [0.022, 0.004], {
        bone: head, color: i === 3 ? ANTLER_T : ANTLER, sides: 5, caps: "point", name: "tine",
      });
    }
  }

  // cloud mane
  const cloud = svg(
    `<svg viewBox="0 0 80 100"><path d="M10 100 C0 80 6 62 20 62 C14 44 34 34 44 46 C50 26 76 34 70 54 C84 62 74 84 64 100Z" fill="#e8fff6" stroke="#2fb58c" stroke-width="3"/><path d="M26 98 C22 82 30 74 38 78 C40 66 56 66 56 78 C64 80 62 92 58 98Z" fill="#9be8cf"/><path d="M30 60 C34 54 42 54 44 60" stroke="#2fb58c" stroke-width="2.5" fill="none"/></svg>`,
    { size: 192 },
  );
  const manePts = [] as ReturnType<typeof neckTube.at>[];
  for (let i = 0; i < 9; i++) manePts.push(neckTube.at(0.04 + i * 0.11, i % 2 ? 22 : -22));
  b.cards(manePts, cloud, { size: [0.2, 0.28], lean: 55, bend: 20, flow: [0, -0.3, -1], vary: 0.2, rng: rng(2), cross: true });
  const back = [] as ReturnType<typeof body.at>[];
  for (let i = 0; i < 7; i++) back.push(body.at(0.3 + i * 0.1, 0));
  b.cards(back, cloud, { size: [0.14, 0.2], lean: 60, bend: 15, flow: [0, -0.3, -1], rng: rng(3) });

  // legs
  const legR = [0.1, 0.085, 0.065, 0.045, 0.04, 0.04];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.42 : -0.55;
      const pts = limb([s * 0.22, 1.0, z], [s * 0.2, 0.1, z + 0.05], [0.32, 0.36, 0.3, 0.14], front
        ? [[0, 0, -1], [0, 0, 1], [0, 0, -1]]
        : [[0, 0, 1], [0, 0, -1], [0, 0, 1]]);
      const c = b.chain(`leg${front ? "F" : "H"}${k}`, pts, {
        parent: front ? chest : hips, role: "leg", contact: [s * 0.2, 0, z + 0.05],
        names: front ? [`shoulder${k}`, `elbow${k}`, `knee${k}`, `fetlock${k}`, `hoof${k}`] : [`hip${k}`, `stifle${k}`, `hock${k}`, `fetlockH${k}`, `hoofH${k}`],
      });
      b.sweep(c, (t) => [legR[Math.min(5, Math.floor(t * 5))] ?? 0.04, legR[Math.min(5, Math.floor(t * 5))] ?? 0.04], { color: coat, sides: 6, smooth: false });
      const j0 = c.joints[0];
      b.part(new THREE.IcosahedronGeometry(0.15, 1), coat, { bone: j0, at: j0.at.clone().add(v(0, -0.06, 0)), scale: [0.8, 1.2, 1.1], flat: true });
      const tip = c.tip as THREE.Object3D & { at: THREE.Vector3 };
      b.part(new THREE.CylinderGeometry(0.052, 0.07, 0.1, 6), GOLD, { bone: c.tip as never, at: [s * 0.2, 0.05, z + 0.06], flat: true, name: "hoof" });
      b.part(new THREE.CylinderGeometry(0.048, 0.054, 0.025, 6), GOLD_D, { bone: c.tip as never, at: [s * 0.2, 0.108, z + 0.056], flat: true });
      void tip;
      // flame fetlock
      b.ring(c.joints[3], { count: 5, radius: 0.04, tilt: 65 }, (it) => b.spike(it, it, 0.13, 0.03, { color: "#ffb347", sides: 4, smooth: false }));
    }
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 1.05, -0.8], [0, 1.1, -1.1], [0, 1.0, -1.4], [0, 0.8, -1.6]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"],
  });
  b.sweep(tail, [0.07, 0.03], { color: coat, sides: 6, smooth: false, name: "tailTube" });
  const flame = svg(
    `<svg viewBox="0 0 60 100"><path d="M30 0 C46 30 60 50 52 76 C48 92 36 100 30 100 C22 100 8 92 6 74 C4 50 22 38 30 0Z" fill="#ff7a2a"/><path d="M30 28 C42 52 48 64 42 80 C38 92 32 96 30 96 C24 96 16 90 16 76 C16 58 26 50 30 28Z" fill="#ffc94a"/><path d="M30 56 C36 70 38 80 30 90 C22 80 24 68 30 56Z" fill="#fff4b0"/></svg>`,
    { size: 160 },
  );
  glow(b.cards([frame(tail.at(1), [0, 1, -0.2]), frame(tail.at(0.9), [0, 1, 0])], flame, { size: [0.22, 0.4], lean: 40, flow: [0, -0.3, -1], cross: true, vary: 0.2, rng: rng(5) }) as never, 1);

  // chest ornament
  b.sweep(b.surface(neckTube).loop(neck.at(0.1), { lift: 0.012 }), 0.018, { color: GOLD, sides: 4, bone: neck.joints[0], name: "collar" });

  return b.root;
}
```