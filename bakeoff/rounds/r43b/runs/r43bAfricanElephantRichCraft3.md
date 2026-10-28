```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, mottle, paint, mix, noise, smoothstep, catmull, polyline } from "agentic-3js-builder";

export const meta = {
  name: "African bush elephant",
  description: "Low-poly adult African bush elephant: rigged spine, four legs, trunk chain, flappy ears, tusks, jaw and tail.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const R = rng(5);

  // ---------- paints ----------
  const BASE = mottle("#8e8b89", "#777472", { size: 0.55, seed: 3 });
  const SKIN = paint((p, n) => {
    let c = BASE.at(p, n);
    c = mix(c, "#a58a6c", smoothstep(1.3, 0.05, p.y) * 0.75);
    c = mix(c, "#5e5b5a", smoothstep(0.0, -0.9, n.y) * 0.5);
    c = mix(c, "#a9a5a1", smoothstep(0.55, 1, n.y) * 0.35);
    const w = noise(p, 0.09, 7);
    if (w < 0.3) c = mix(c, "#57544f", 0.55);
    return c;
  });
  const TRUNK = paint((p, n, s) => {
    let c = SKIN.at(p, n);
    const ring = Math.sin(s[0] * 95);
    if (ring > 0.55) c = mix(c, "#57534f", 0.6);
    if (n.y < -0.4 && s[0] > 0.2) c = mix(c, "#9a7f78", 0.45);
    return c;
  });
  const EAR = paint((p, n, s) => {
    let c = SKIN.at(p, n);
    const v = Math.abs(Math.sin(s[1] * 38 + s[0] * 9));
    if (s[0] > 0.1) c = mix(c, "#a8827c", 0.35);
    if (v < 0.07) c = mix(c, "#5a504d", 0.5);
    return c;
  });
  const IVORY = "#ece2c8";
  const NAIL = "#d6cdbb";
  const DARK = "#2a2523";
  const EYE = "#1b1412";
  const LID = "#5d5552";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 2.15, -1.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 2.15, -1.1], [0, 2.2, -0.3], [0, 2.25, 0.5], [0, 2.25, 1.2]]),
    { parent: hips, count: 4, role: "spine" },
  );
  const chest = spine.joints[3];
  const head = b.joint("head", { parent: chest, at: [0, 2.3, 1.6], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.85, 2.05], aim: [0, 1.75, 2.6], role: "jaw" });

  // body
  b.sweep(spine, (t) => {
    const k = Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.05));
    return [0.6 + 0.26 * k, 0.86 + 0.2 * k];
  }, { color: SKIN, sides: 10 });
  // shoulder and rump humps
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: chest, at: [s * 0.45, 2.9, 0.95], scale: [0.5, 0.45, 0.6] });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: hips, at: [s * 0.5, 2.85, -1.2], scale: [0.5, 0.5, 0.55] });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: [0, 2.3, 2.0], scale: [0.58, 0.65, 0.62] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [s * 0.24, 2.85, 1.85], scale: [0.33, 0.3, 0.33] });
    b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { bone: head, at: [s * 0.45, 2.1, 2.0], scale: [0.2, 0.28, 0.3] });
    // eyes
    const ex = s * 0.5;
    b.part(new THREE.SphereGeometry(0.075, 8, 6), LID, { bone: head, at: [ex, 2.4, 2.26] });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), EYE, { bone: head, at: [s * 0.54, 2.4, 2.3] });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#ffffff", { bone: head, at: [s * 0.565, 2.43, 2.33] });
    // brow
    b.rod([s * 0.38, 2.5, 2.3], [s * 0.58, 2.48, 2.12], 0.035, SKIN, { bone: head });
    // ear
    const ear = b.joint(s > 0 ? "earL" : "earR", {
      parent: head, at: [s * 0.52, 2.72, 1.75], dir: [s, 0.1, -0.3], role: "hinge",
    });
    b.extrude(
      [[0, 0.42], [0.4, 0.55], [0.85, 0.35], [1.0, -0.2], [0.85, -0.85], [0.5, -1.15, "sharp"], [0.18, -0.75], [0, -0.2]],
      { at: [s * 0.52, 2.75, 1.75], x: [s, 0, -0.45], y: [0, 1, 0], thickness: 0.05, smoothing: 1, color: EAR, bone: ear },
    );
  }
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: jaw, at: [0, 1.78, 2.3], scale: [0.3, 0.13, 0.4] });

  // ---------- trunk ----------
  const trunk = b.chain(
    "trunk",
    catmull([[0, 2.05, 2.4], [0, 1.55, 2.78], [0, 1.0, 2.95], [0, 0.5, 2.98], [0, 0.22, 3.25]]),
    { parent: head, role: "tentacle" },
  );
  b.sweep(trunk, (t) => 0.31 * (1 - t) + 0.075, { color: TRUNK, sides: 8 });
  for (const s of [1, -1]) b.spike([s * 0.025, 0.22, 3.3], [0, 0.1, 1], 0.1, 0.035, { color: SKIN, bone: trunk.joints[3] });

  // ---------- tusks ----------
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.4, 1.95, 2.3], [s * 0.46, 1.6, 2.75], [s * 0.5, 1.3, 3.3], [s * 0.48, 1.4, 3.9]]),
      [0.1, 0.018],
      { color: IVORY, bone: head, sides: 7, caps: { end: "point" } },
    );
    b.part(new THREE.CylinderGeometry(0.115, 0.125, 0.12, 8), "#6e6560", {
      bone: head, at: [s * 0.4, 1.93, 2.32], rotation: [-25, 0, 0],
    });
  }

  // ---------- legs ----------
  const legSpec: [string, number, number, number, THREE.Object3D | any][] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legSpec.push([`F${side}`, s * 0.6, 1.7, 1.0, chest]);
    legSpec.push([`H${side}`, s * 0.6, 1.7, -1.0, hips]);
  }
  for (const [tag, x, y, z, parent] of legSpec) {
    const pts = limb([x, y, z], [x, 0.2, z], [0.75, 0.8], [[0, 0, 1]]);
    const leg = b.chain(`leg${tag}`, pts, {
      parent, names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`], role: "leg",
    });
    b.sweep(leg, [0.31, 0.25], { color: SKIN, sides: 8 });
    b.part(new THREE.SphereGeometry(0.29, 8, 6), SKIN, { bone: leg.joints[1], at: [x, pts[1].y, pts[1].z + 0.04] });
    const ankle = leg.tip!;
    b.part(new THREE.CylinderGeometry(0.3, 0.33, 0.22, 10), SKIN, { bone: ankle, at: [x, 0.1, z] });
    for (const a of [-52, -17, 17, 52]) {
      const r = (a * Math.PI) / 180;
      const dx = Math.sin(r), dz = Math.cos(r);
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.06), NAIL, {
        bone: ankle, at: [x + dx * 0.32, 0.09, z + dz * 0.32], dir: [dx, 0, dz], axis: "z",
      });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([[0, 2.5, -1.8], [0, 2.1, -2.05], [0, 1.5, -2.1], [0, 0.85, -2.1]]),
    { parent: hips, count: 3, role: "tail" },
  );
  b.sweep(tail, [0.08, 0.03], { color: SKIN, sides: 6 });
  b.ring(frame([0, 0.85, -2.1], [0, -1, 0]), { count: 7, radius: 0.02, tilt: 20 }, (it) =>
    b.spike(it, it, 0.24, 0.014, { color: DARK, bone: tail.joints[2] }),
  );
  void R;
  return b.root;
}
```