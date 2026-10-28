import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, polyline, limb, paint, countershade, mix } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pyro Phoenix",
  description: "Cel-shaded flame phoenix with spread layered feather wings, streaming tail plumes and a glowing Pyro emblem.",
};

const STOPS = ["#a4161a", "#e85d04", "#faa307", "#ffe66d"];
const ramp = (t: number) => {
  const c = Math.min(Math.max(t, 0), 1) * 3;
  const i = Math.min(2, Math.floor(c));
  return mix(STOPS[i], STOPS[i + 1], c - i);
};
const flameRow = (shift: number) =>
  paint((p, n) => {
    const d = Math.hypot(Math.abs(p.x) - 0.2, p.z) / 1.7;
    const c = ramp(d + shift);
    const k = 0.9 + 0.1 * n.y;
    return [c[0] * k, c[1] * k, c[2] * k];
  });
const tailPaint = paint((p) => ramp((-p.z - 0.4) / 1.3));

const BODY = cel(countershade("#e8480c", "#ffc22e", { level: -0.15, soft: 0.4 }));
const HEADP = cel(countershade("#d9340a", "#ffb52a", { level: 0.0, soft: 0.5 }));
const GOLD = "#ffc233";
const BEAK = "#ffd166";
const LEG = "#e09a1a";
const DEEP = "#b3140f";

const EMBLEM = svg(
  `<svg viewBox="0 0 64 80"><path d="M32 4 C40 22 58 30 54 52 C52 66 42 76 32 76 C22 76 12 66 10 52 C8 40 18 36 20 24 C26 30 28 20 32 4Z" fill="#ff7a1a" stroke="#fff3a0" stroke-width="4"/><path d="M32 30 C38 42 46 46 43 58 C41 66 36 70 32 70 C28 70 23 66 22 58 C21 50 28 46 32 30Z" fill="#fff3a0"/></svg>`,
  { size: 128 },
);

function leaf(L: number, W: number): any[] {
  return [[0, 0], [L * 0.25, W * 0.8], [L * 0.65, W], [L, 0, "sharp"], [L * 0.65, -W], [L * 0.25, -W * 0.8]];
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.8, -0.3], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.8, -0.3], [0, 0.85, 0.05], [0, 1.0, 0.3]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.0, 0.3], [0, 1.25, 0.42], [0, 1.45, 0.5]]), {
    parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.45, 0.5], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.49, 0.6], aim: [0, 1.47, 0.8], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.8, -0.45], [0, 0.82, -0.75], [0, 0.85, -1.0]]), {
    parent: hips, names: ["tail1", "tail2"], role: "tail",
  });

  // body
  const bodyPath = catmull([[0, 0.8, -0.45], [0, 0.82, -0.1], [0, 0.95, 0.3], [0, 1.25, 0.42], [0, 1.45, 0.5]]);
  const body = b.sweep(bodyPath, [0.1, 0.2, 0.25, 0.17, 0.09, 0.08], { bone: [hips, spine, neck], color: BODY });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), HEADP, {
    bone: head, at: [0, 1.55, 0.56], scale: [0.105, 0.1, 0.115],
  });
  b.spike([0, 1.54, 0.62], [0, 1.5, 0.86], null, 0.055, { bone: head, color: BEAK });
  b.spike([0, 1.49, 0.62], [0, 1.47, 0.79], null, 0.04, { bone: jaw, color: "#f4a93a" });
  const EYE = animeEye({ iris: "#ff9d1c", blush: false });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 1.55, 0.56]).at(s * 52, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.06, 0.082], mirror: s > 0 });
    // cheek tufts
    b.sweep(bezier([s * 0.09, 1.52, 0.5], [s * 0.2, 1.55, 0.4], [s * 0.3, 1.48, 0.22]), [0.035, 0], {
      bone: head, color: GOLD, caps: "point",
    });
  }
  // crest
  const crest: [number[], number[], number[], string, boolean][] = [
    [[0, 1.62, 0.52], [0, 1.9, 0.5], [0, 2.0, 0.1], "#ffd23f", true],
    [[0.03, 1.62, 0.5], [0.12, 1.85, 0.4], [0.2, 1.95, 0.0], "#ff8a1c", false],
    [[-0.03, 1.62, 0.5], [-0.12, 1.85, 0.4], [-0.2, 1.95, 0.0], "#ff8a1c", false],
    [[0, 1.6, 0.46], [0, 1.75, 0.3], [0, 1.78, -0.1], DEEP, false],
  ];
  for (const [a, c, t, col, g] of crest) {
    const s = b.sweep(bezier(a, c, t), [0.04, 0], { bone: head, color: col, caps: "point" });
    if (g) glow(s, 1.2);
  }

  // neck ruff
  b.ring(neck.at(0.35), { count: 10, radius: 0.1, tilt: 45 }, (it) =>
    b.spike(it, it, 0.13, 0.035, { color: it.i % 2 ? GOLD : "#ff8a1c" }),
  );

  // chest emblem
  const chest = b.surface(body).around([0, 0.95, 0.2]).at(0, 5);
  if (chest) glow(b.decal(body, EMBLEM, { at: chest, dir: [0, 0.15, 1], size: [0.15, 0.19] }), 1);

  // wings
  const rows = [
    { n: 9, shift: 0, yo: 0, th: 0.012, f: (t: number) => 0.5 + 0.65 * t, t0: 0.3, t1: 1, drop: 0 },
    { n: 8, shift: -0.12, yo: 0.014, th: 0.012, f: (t: number) => 0.3 + 0.3 * t, t0: 0.1, t1: 0.98, drop: 5 },
    { n: 7, shift: -0.25, yo: 0.028, th: 0.012, f: (t: number) => 0.18 + 0.12 * t, t0: 0.05, t1: 0.95, drop: 10 },
  ];
  const rowPaints = rows.map((r) => flameRow(r.shift));
  for (const [s, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const pts = [[s * 0.2, 1.02, 0.15], [s * 0.75, 1.15, 0.1], [s * 1.25, 1.2, -0.05], [s * 1.7, 1.18, -0.2]];
    const arm = b.chain(`wing${side}`, polyline(pts), {
      parent: spine.joints[1], role: "wing",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingtip${side}`],
    });
    const path = polyline(pts);
    rows.forEach((r, ri) => {
      for (let i = 0; i < r.n; i++) {
        const t = r.t0 + ((r.t1 - r.t0) * i) / (r.n - 1);
        const a = ((15 + (1 - t) * 65 + r.drop) * Math.PI) / 180;
        const L = r.f(t);
        const dir = new THREE.Vector3(s * Math.cos(a), -0.06 - 0.02 * ri, -Math.sin(a)).normalize();
        const y = new THREE.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
        const o = path.at(t);
        b.extrude(leaf(L, L * 0.1), {
          at: [o.x, o.y + r.yo, o.z - 0.02], x: dir.toArray(), y: y.toArray(),
          thickness: r.th, color: rowPaints[ri], bone: arm.jointAt(t),
        });
      }
    });
    b.sweep(arm, [0.065, 0.03], { color: DEEP });
    for (const t of [0.35, 0.7]) {
      const c = arm.at(t);
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), GOLD, { bone: c.bone!, at: c.at, dir: c.tangent.toArray() });
    }
    // wing claw flame
    glow(b.spike(pts[3], [s, 0.25, 0.1], 0.3, 0.035, { bone: arm.tip ?? arm.joints[2], color: "#ffd23f" }), 1.2);
  }

  // tail plumes
  for (let i = -3; i <= 3; i++) {
    const ai = Math.abs(i);
    const tip = [i * 0.3, 0.14 + ai * 0.05, -1.7 - (3 - ai) * 0.18];
    b.sweep(bezier([0, 0.85, -0.5], [i * 0.05, 0.98, -0.95], [i * 0.15, 0.7, -1.3], tip), (t) => [0.075 * Math.sin(Math.PI * (0.15 + 0.85 * (1 - t) ** 0.8)) + 0.005, 0.007], {
      bone: tail.joints[i % 2 ? 0 : 1], color: tailPaint, caps: "point",
    });
  }
  for (const i of [-1, 1]) glow(b.sweep(bezier([0, 0.85, -0.5], [i * 0.1, 1.05, -0.9], [i * 0.2, 0.6, -1.2]), [0.02, 0], { bone: tail.joints[0], color: "#ffe66d", caps: "point" }), 1.3);

  // legs
  for (const [s, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const pts = limb([s * 0.13, 0.75, -0.02], [s * 0.15, 0.03, 0.12], [0.4, 0.4], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.05, 0.035], { color: LEG });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, { bone: hips, at: [s * 0.14, 0.72, -0.02], scale: [0.13, 0.15, 0.17] });
    const foot = leg.tip ?? leg.joints[1];
    for (const dx of [-0.07, 0, 0.07]) {
      b.spike([s * 0.15, 0.04, 0.12], [dx * 1.4, -0.03, 1], 0.17, 0.028, { bone: foot, color: BEAK });
    }
    b.spike([s * 0.15, 0.04, 0.12], [0, -0.03, -1], 0.12, 0.025, { bone: foot, color: BEAK });
  }

  void R; void INK;
  return b.root;
}
