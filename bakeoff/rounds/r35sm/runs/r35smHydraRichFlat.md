```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, limb, scales } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hydra of the Broken Chains",
  description:
    "Five-headed Norse-brutal hydra: scarred scale hide, bone spikes, rusted iron neck shackles, glowing runes, axe-slash wounds and ember eyes.",
};

const V = THREE.Vector3;
const SC = "#38443d";
const SC2 = "#2a342f";
const BELLY = "#8f8062";
const BONE = "#cfc3a0";
const BONE_D = "#8c8163";
const IRON = "#34363c";
const RUST = "#80401f";
const LAVA = "#ff5a1c";
const EYE = "#ffc933";
const MOUTH = "#5c141a";
const TEETH = "#ece4cc";
const DARK = "#121414";

const HIDE = scales("#3a463f", "#171c19", { size: 0.11 });

export default function build() {
  const b = createBuilder({ name: "hydra" });

  // ---------- skeleton: body ----------
  const hips = b.joint("hips", { at: [0, 1.3, -1.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, -1.2],
      [0, 1.4, -0.3],
      [0, 1.5, 0.6],
      [0, 1.6, 1.4],
    ]),
    { parent: hips, count: 4, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];

  const prof = (t: number) => 0.45 + 0.3 * Math.sin(Math.PI * (0.15 + 0.7 * t));
  const body = b.sweep(spine, (t) => [prof(t), prof(t) * 0.92], {
    color: HIDE,
    sectors: [[125, 235, BELLY]],
  });

  // dorsal bone blades
  let bi = 0;
  b.along(body, 8, (at) => {
    const k = bi++;
    b.spike(at, at, 0.22 + 0.1 * Math.sin((k / 7) * Math.PI), 0.08, { color: BONE });
  });

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3, -1.2],
      [0, 1.25, -2.2],
      [0, 1.0, -3.2],
      [0, 0.6, -4.2],
      [0, 0.35, -5.0],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );
  const tailS = b.sweep(tail, [0.55, 0.34, 0.2, 0.1, 0.04], {
    color: HIDE,
    sectors: [[125, 235, BELLY]],
  });
  b.along(tailS, 6, (at) => b.spike(at, at, 0.2, 0.06, { color: BONE }));
  b.spike([0, 0.35, -5.0], [0, 0.1, -1], 0.35, 0.07, { color: BONE, bone: tail.joints[tail.joints.length - 1] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const legs = [
      { n: "H", root: [s * 0.62, 1.2, -1.15], foot: [s * 0.85, 0.14, -1.2], len: [0.75, 0.7, 0.4], par: hips,
        bends: [[0, 0, 1], [0, 0, -1]] },
      { n: "F", root: [s * 0.62, 1.3, 1.0], foot: [s * 0.92, 0.14, 1.25], len: [0.7, 0.68, 0.4], par: chest,
        bends: [[0, 0, -1], [0, 0, 1]] },
    ];
    for (const L of legs) {
      const pts = limb(L.root, L.foot, L.len, L.bends);
      const leg = b.chain(`leg${L.n}${side}`, pts, {
        parent: L.par,
        names: [`hip${L.n}${side}`, `knee${L.n}${side}`, `ankle${L.n}${side}`, `foot${L.n}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.24, 0.2, 0.12, 0.1], { color: SC });
      const tip = leg.joints[leg.joints.length - 1];
      const fx = L.foot[0];
      const fz = L.foot[2];
      b.part(new THREE.BoxGeometry(0.34, 0.14, 0.42), SC2, { bone: tip, at: [fx, 0.07, fz + 0.1] });
      for (const cx of [-0.11, 0, 0.11])
        b.spike([fx + cx, 0.1, fz + 0.3], [0, -0.15, 1], 0.26, 0.05, { color: BONE, bone: tip });
      // knee spike
      b.spike(leg.joints[1].at, [s, 0.3, L.n === "H" ? 0.2 : -0.4], 0.24, 0.06, { color: BONE, bone: leg.joints[1] });
      // iron cuff
      const cp = leg.at(0.62);
      b.part(new THREE.TorusGeometry(0.15, 0.03, 6, 10), IRON, { at: cp.at, dir: cp.tangent, axis: "z", bone: cp.bone });
    }
    // shoulder pauldron spikes
    b.spike([s * 0.7, 1.95, 0.9], [s * 0.6, 1, 0.1], 0.4, 0.1, { color: BONE_D, bone: chest });
    b.spike([s * 0.68, 1.9, 0.5], [s * 0.7, 0.9, -0.2], 0.3, 0.08, { color: BONE_D, bone: chest });
  }

  // ---------- glowing wounds and runes ----------
  const skin = b.surface(body);
  const C = [0, 1.45, 0.2];
  for (const s of [1, -1]) {
    for (const az of [72, 88, 104]) {
      const h = skin.around(C).at(s * az, 12);
      if (h) glow(b.stick(new THREE.BoxGeometry(0.035, 0.03, 0.6), LAVA, h, { embed: 0.5, spin: s * 35 }), 1.6);
    }
    const r = skin.around(C).at(s * 80, 48);
    if (r) {
      glow(b.stick(new THREE.BoxGeometry(0.035, 0.03, 0.34), EYE, r, { embed: 0.5 }), 1.4);
      for (const k of [1, -1])
        glow(b.stick(new THREE.BoxGeometry(0.03, 0.03, 0.17), EYE, r.moved([k * 0.06, 0, 0.07]), { embed: 0.5, spin: k * 45 }), 1.4);
    }
    const t = skin.around([0, 1.3, -1.2]).at(s * 90, 20);
    if (t) {
      glow(b.stick(new THREE.BoxGeometry(0.035, 0.03, 0.3), EYE, t, { embed: 0.5, spin: 90 }), 1.4);
      for (const k of [1, -1])
        glow(b.stick(new THREE.BoxGeometry(0.03, 0.03, 0.15), EYE, t.moved([0.0, 0, k * 0.08]), { embed: 0.5, spin: 40 * k }), 1.4);
    }
  }

  // ---------- five necks and heads ----------
  for (let i = 0; i < 5; i++) {
    const a = i - 2;
    const aa = Math.abs(a);
    const hgt = (2 - aa) * 0.4;
    const p0 = [a * 0.25, 1.7, 1.0];
    const p1 = [a * 0.55, 2.5, 1.5];
    const p2 = [a * 0.95, 3.1 + hgt * 0.6, 2.2];
    const p3 = [a * 1.3, 3.3 + hgt, 2.9 + (aa === 2 ? 0 : 0.2)];
    const neck = b.chain(`neck${i}`, catmull([p0, p1, p2, p3]), { parent: chest, count: 3, role: "neck" });
    const nS = b.sweep(neck, [0.3, 0.21, 0.17, 0.17], { color: HIDE, sectors: [[125, 235, BELLY]] });
    b.along(nS, 5, (at) => b.spike(at, at, 0.15, 0.045, { color: BONE }));

    // iron shackle with glowing ring
    const bp = neck.at(0.42);
    b.part(new THREE.TorusGeometry(0.23, 0.04, 6, 12), IRON, { at: bp.at, dir: bp.tangent, axis: "z", bone: bp.bone });
    const gp = neck.at(0.5);
    glow(b.part(new THREE.TorusGeometry(0.2, 0.018, 5, 12), LAVA, { at: gp.at, dir: gp.tangent, axis: "z", bone: gp.bone }), 1.5);
    if (aa === 2 || a === 0) {
      for (let k = 0; k < 4; k++) {
        const at = new V(bp.at.x, bp.at.y - 0.27 - k * 0.09, bp.at.z + 0.02);
        b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), k % 2 ? IRON : RUST, {
          at, dir: k % 2 ? [1, 0, 0] : [0, 0, 1], axis: "z", bone: bp.bone,
        });
      }
    }

    // ---- head ----
    const base = new V(...p3);
    const fw = new V(a * 0.3, -0.3, 1).normalize();
    const up = new V(0, 1, 0).addScaledVector(fw, -fw.y).normalize();
    const sc = a === 0 ? 1.3 : aa === 1 ? 1.05 : 0.9;
    const P = (f: number, u: number, x = 0) =>
      base.clone().addScaledVector(fw, f * sc).addScaledVector(up, u * sc).add(new V(x * sc, 0, 0));
    const neckEnd = neck.joints[neck.joints.length - 1];
    const head = b.joint(`head${i}`, { parent: neckEnd, at: base, dir: fw, role: "head" });
    const jaw = b.joint(`jaw${i}`, { parent: head, at: P(0.0, -0.17), dir: fw, role: "jaw" });

    b.frustumBox(P(-0.12, 0), P(0.36, 0), [0.36 * sc, 0.32 * sc], [0.3 * sc, 0.26 * sc], { bone: head, color: SC });
    b.frustumBox(P(0.34, -0.01), P(0.8, -0.04), [0.28 * sc, 0.22 * sc], [0.17 * sc, 0.13 * sc], { bone: head, color: SC2 });
    b.frustumBox(P(0.14, -0.06), P(0.7, -0.08), [0.22 * sc, 0.05 * sc], [0.12 * sc, 0.04 * sc], { bone: head, color: MOUTH });
    b.frustumBox(P(0.0, -0.19), P(0.74, -0.17), [0.28 * sc, 0.09 * sc], [0.13 * sc, 0.06 * sc], { bone: jaw, color: SC });
    b.spike(P(0.5, -0.21), [0, -0.7, 0.5], 0.2 * sc, 0.04 * sc, { bone: jaw, color: BONE });
    b.spike(P(0.25, -0.22), [0, -0.8, -0.2], 0.16 * sc, 0.035 * sc, { bone: jaw, color: BONE });

    for (const s of [1, -1]) {
      // teeth
      for (let k = 0; k < 6; k++) {
        const x = s * (0.11 - k * 0.012);
        b.spike(P(0.3 + k * 0.09, -0.11, x), [0, -1, 0], 0.11 * sc, 0.026 * sc, { bone: head, color: TEETH });
        b.spike(P(0.12 + k * 0.1, -0.15, x * 0.9), [0, 1, 0], 0.1 * sc, 0.024 * sc, { bone: jaw, color: TEETH });
      }
      // horns
      b.sweep(bezier(P(0.02, 0.14, s * 0.12), P(-0.2, 0.4, s * 0.3), P(-0.65 * (a === 0 ? 1.2 : 1), 0.36, s * 0.45)), [0.065 * sc, 0], {
        bone: head, color: BONE, caps: { end: "point" },
      });
      // cheek spikes
      b.spike(P(0.0, -0.02, s * 0.18), [s * 0.8, 0.1, -0.8], 0.28 * sc, 0.05 * sc, { bone: head, color: BONE_D });
      // brow
      b.frustumBox(P(0.14, 0.17, s * 0.15), P(0.42, 0.14, s * 0.12), [0.08 * sc, 0.05 * sc], [0.06 * sc, 0.05 * sc], { bone: head, color: DARK });
      // nostril
      b.part(new THREE.SphereGeometry(0.025 * sc, 5, 4), DARK, { bone: head, at: P(0.76, 0.03, s * 0.05) });
      // eyes
      const eyeP = P(0.28, 0.1, s * 0.15);
      const scarred = i === 4 && s === 1;
      if (scarred) {
        b.part(new THREE.SphereGeometry(0.045 * sc, 6, 5), "#4a4a40", { bone: head, at: eyeP });
        b.part(new THREE.BoxGeometry(0.03 * sc, 0.03 * sc, 0.2 * sc), BONE, { bone: head, at: eyeP.clone().add(new V(0.04 * sc, 0, 0)), rotation: [0, 0, 40] });
      } else {
        glow(b.part(new THREE.SphereGeometry(0.048 * sc, 6, 5), EYE, { bone: head, at: eyeP }), 2);
        b.part(new THREE.BoxGeometry(0.012 * sc, 0.06 * sc, 0.012 * sc), DARK, {
          bone: head, at: eyeP.clone().addScaledVector(fw, 0.04 * sc).add(new V(s * 0.014 * sc, 0, 0)),
        });
      }
    }
    // crest on skull
    for (let k = 0; k < 3; k++)
      b.spike(P(0.15 - k * 0.12, 0.15), [0, 1, -0.5], (0.16 - k * 0.02) * sc, 0.04 * sc, { bone: head, color: BONE });

    b.pose(jaw, { axis: [1, 0, 0], deg: a === 0 ? 16 : 10 });
  }

  return b.root;
}
```