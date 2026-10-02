import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import { rng } from "../src/math";

export const meta = {
  name: "Galápagos Giant Tortoise",
  description: "An ancient, faceted island giant with a deeply domed growth-ringed carapace, elephantine armored legs, a wrinkled reaching neck, and a horn beak.",
  style: "low-poly",
  commit: "e503085",
};

const shellDark = "#35362c";
const shellEdge = "#776e52";
const skin = "#716e59";
const skinShade = "#514f42";
const skinLight = "#95907a";
const horn = "#b6ac8c";
const black = "#191c19";

export default function build() {
  const b = createBuilder({ name: "galapagosTortoise", paintSize: 1024 });
  const random = rng(613);
  // The carapace is fused to the spine; only neck, limbs, digits and tail flex.
  const pelvis = b.joint("pelvis", { at: [0, 0.39, -0.25], role: "spine" });
  const spine = b.joint("spine", { parent: pelvis, at: [0, 0.43, 0.08], dir: [0, 0, 1], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.41, 0.36], [0, 0.42, 0.53], [0, 0.53, 0.68], [0, 0.63, 0.80]]), {
    parent: spine, names: ["neckBase", "neckMid", "neckUpper", "neckTip"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[3], at: neck.at(1), dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ down: 0.035, forward: 0.025 }), dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", [[0, 0.30, -0.52], [0, 0.23, -0.65], [0, 0.17, -0.77]], {
    parent: pelvis, names: ["tailBase", "tailMid", "tailTip"], role: "tail",
  });
  const legs: { chain: Chain; front: boolean; side: number; label: string }[] = [];
  const toes: Chain[] = [];
  for (const front of [true, false]) {
    for (const side of [1, -1]) {
      const label = `${front ? "Front" : "Hind"}${side > 0 ? "L" : "R"}`;
      const z = front ? 0.29 : -0.34;
      const points = front
        ? [[side * 0.28, 0.38, z], [side * 0.41, 0.24, z + 0.055], [side * 0.43, 0.10, z + 0.12]]
        : [[side * 0.29, 0.34, z], [side * 0.39, 0.22, z - 0.015], [side * 0.40, 0.10, z - 0.08]];
      const chain = b.chain(`leg${label}`, points, {
        parent: front ? spine : pelvis,
        names: [front ? `shoulder${label}` : `hip${label}`, front ? `elbow${label}` : `knee${label}`, `foot${label}`],
        role: "leg", contact: [points[2][0], 0, points[2][2]],
      });
      legs.push({ chain, front, side, label });
      const foot = chain.joints[2];
      for (let i = 0; i < (front ? 5 : 4); i++) {
        const count = front ? 5 : 4;
        const x = (i - (count - 1) / 2) * 0.036;
        toes.push(b.chain(`toe${label}${i + 1}`, [
          foot.local({ left: x, forward: 0.060, down: 0.05 }),
          foot.local({ left: x * 1.15, forward: 0.12 - Math.abs(x) * 0.3, down: 0.07 }),
        ], { parent: foot, names: [`toe${label}${i + 1}`, `claw${label}${i + 1}`], role: "digit" }));
      }
    }
  }

  // Crisp polygonal scute boundaries, with nested dry growth rings in each plate.
  const centers: number[][] = [];
  for (let i = 0; i < 5; i++) centers.push([0, -0.52 + i * 0.25]);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) centers.push([s * 0.33, -0.40 + i * 0.27]);
  for (let i = 0; i < 22; i++) {
    const a = i * Math.PI * 2 / 22;
    centers.push([0.55 * Math.sin(a), 0.74 * Math.cos(a)]);
  }
  const shellPaint = paint((p) => {
    const x = p.x;
    const z = p.z + 0.05;
    let d1 = Infinity;
    let d2 = Infinity;
    let id = 0;
    for (let i = 0; i < centers.length; i++) {
      const c = centers[i];
      const d = (x - c[0]) ** 2 + ((z - c[1]) * 0.82) ** 2;
      if (d < d1) { d2 = d1; d1 = d; id = i; } else if (d < d2) d2 = d;
    }
    const edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 0.012) return "#242920";
    if (edge < 0.023) return "#8c8467";
    const ring = Math.floor(edge / 0.025);
    const ringEdge = edge % 0.025;
    if (ringEdge < 0.004 && ring > 0 && ring < 6) return "#565541";
    return ["#6f7055", "#77755a", "#62664e", "#858066", "#72735a"][id % 5];
  });
  const shell = b.part(new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), shellPaint, {
    bone: spine, at: [0, 0.34, -0.05], scale: [0.47, 0.44, 0.65], flat: true, name: "domedCarapace",
  });
  const shellSurface = b.surface(shell);
  b.part(new THREE.SphereGeometry(1, 12, 4), shellDark, {
    bone: spine, at: [0, 0.31, -0.05], scale: [0.45, 0.12, 0.63], flat: true, name: "shellBridge",
  });
  b.part(new THREE.SphereGeometry(1, 12, 4), "#9d9477", {
    bone: spine, at: [0, 0.235, -0.05], scale: [0.365, 0.045, 0.53], flat: true, name: "plastron",
  });
  // Marginal scutes provide a scalloped overhanging lip all the way around the shell.
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const z = -0.05 + Math.cos(a) * 0.635;
    const x = Math.sin(a) * 0.46;
    b.part(new THREE.BoxGeometry(0.112, 0.046, 0.065), i % 3 ? shellEdge : "#93856a", {
      bone: spine, at: [x, 0.345, z], rotation: [0, a * 180 / Math.PI, 0], flat: true, name: `marginalScute${i}`,
    });
  }
  for (let i = 0; i < 5; i++) {
    const z = -0.47 + i * 0.21;
    const hit = shellSurface.ray([0, 1, z], [0, -1, 0]);
    if (hit) b.stick(new THREE.CylinderGeometry(0.027, 0.038, 0.008, 6), shellEdge, hit, { name: `vertebralGrowthCenter${i}`, embed: 0.7, flat: true });
  }
  const wrinkle = paint((_p, _n, s) => {
    const line = (s[0] * 22 + 0.15 * Math.sin(s[1] * Math.PI / 90)) % 1;
    return line < 0.17 ? skinShade : line < 0.30 ? skinLight : skin;
  });
  const neckSkin = b.sweep(neck, (t) => [0.103 - 0.039 * t, 0.095 - 0.032 * t], {
    color: wrinkle, section: { ngon: 8 }, caps: "round", name: "wrinkledNeck",
  });
  for (let i = 0; i < 9; i++) {
    const at = neckSkin.at(0.15 + i * 0.075, 175);
    b.stick(new THREE.SphereGeometry(1, 6, 3), skinShade, at, { scale: [0.066 - i * 0.002, 0.010, 0.015], name: `throatFold${i}`, flat: true });
  }
  for (const leg of legs) {
    const legSkin = b.sweep(leg.chain, (t) => [0.105 - t * 0.017, 0.112 - t * 0.015], {
      section: { ngon: 7 }, color: skinShade, caps: "round", name: `legSkin${leg.label}`,
    });
    const foot = leg.chain.joints[2];
    const pad = b.part(new THREE.CylinderGeometry(0.085, 0.103, 0.125, 7), skin, {
      bone: foot, at: foot.local({ down: 0.0375, forward: 0.018 }), flat: true, name: `footPad${leg.label}`,
    });
    const hits = b.surface([legSkin, pad]).scatter(36, {
      rng: random, minDist: 0.027, filter: (h) => h.at.y > 0.055 && (leg.front ? h.n.z > -0.25 : h.n.x * leg.side > -0.3),
    });
    for (let i = 0; i < hits.length; i++) {
      const r = 0.019 + random() * 0.012;
      b.stick(new THREE.CylinderGeometry(r * 0.72, r, 0.017, 5), i % 4 ? skinLight : skin, hits[i], {
        embed: 0.55, flat: true, name: `armorScale${leg.label}${i}`,
      });
    }
  }
  for (const toe of toes) {
    b.sweep(toe, [0.021, 0.014], { color: skin, section: { ngon: 5 }, name: toe.joints[0].name });
    const tip = toe.joints[1];
    b.spike(tip, tip, 0.035, 0.017, { color: horn, sides: 5, smooth: false, name: tip.name });
  }
  const tailSkin = b.sweep(tail, [0.07, 0.035, 0.002], { color: skin, section: { ngon: 6 }, caps: "flat", name: "taperedTail" });
  for (let i = 0; i < 8; i++) {
    b.stick(new THREE.CylinderGeometry(0.009, 0.014, 0.006, 5), skinLight, tailSkin.at(0.15 + i * 0.10), { flat: true, name: `tailScale${i}` });
  }

  const skull = b.part(new THREE.SphereGeometry(1, 10, 6), skin, {
    bone: head, at: head.local({ forward: 0.055, up: 0.010 }), scale: [0.085, 0.08, 0.12], flat: true, name: "angularHead",
  });
  b.part(new THREE.SphereGeometry(1, 8, 4), skinLight, {
    bone: head, at: head.local({ forward: 0.132, down: 0.006 }), scale: [0.064, 0.043, 0.057], flat: true, name: "nasalBridge",
  });
  b.extrude([[0, 0.025], [0.06, 0.025], [0.085, 0.008], [0.079, -0.018], [0.061, -0.004], [0, -0.006]], {
    at: head.local({ forward: 0.100, down: 0.024 }), bone: head, thickness: 0.108, bevel: 0.004, detail: 0.4, color: horn, name: "hookedUpperBeak",
  });
  b.part(new THREE.SphereGeometry(1, 8, 4), skinLight, {
    bone: jaw, at: jaw.local({ forward: 0.071, down: 0.010 }), scale: [0.058, 0.030, 0.095], flat: true, name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 8, 4), black, {
    bone: jaw, at: jaw.local({ forward: 0.086, up: 0.012 }), scale: [0.050, 0.004, 0.074], flat: true, name: "mouthLine",
  });
  const skullSurface = b.surface(skull);
  for (const side of [-1, 1]) {
    const eyeHit = skullSurface.around(skull.at).at(side * 66, 16);
    if (!eyeHit) continue;
    b.stick(new THREE.SphereGeometry(1, 8, 4), skinShade, eyeHit, { scale: [0.032, 0.011, 0.026], flat: true, name: `eyeSocket${side > 0 ? "L" : "R"}` });
    const eye = b.stick(new THREE.SphereGeometry(0.019, 8, 5), "#795d31", eyeHit, { embed: 0.15, flat: true, name: `eye${side > 0 ? "L" : "R"}` });
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), black, eye.moved([0, 0.016, 0]), { embed: 0.4, flat: true, name: `pupil${side > 0 ? "L" : "R"}` });
    b.stick(new THREE.SphereGeometry(0.0035, 4, 3), "#eee4c8", eye.moved([0.004, 0.024, 0.004]), { name: `eyeGlint${side > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(0.007, 5, 3), black, {
      bone: head, at: head.local({ left: side * 0.033, forward: 0.174, up: 0.014 }), flat: true, name: `nostril${side > 0 ? "L" : "R"}`,
    });
  }
  for (const hit of skullSurface.scatter(24, { rng: random, minDist: 0.017, filter: (h) => h.n.y > 0.35 })) {
    b.stick(new THREE.CylinderGeometry(0.009, 0.013, 0.004, 5), skinLight, hit, { flat: true, embed: 0.6, name: "headScale" });
  }
  // Plastral sutures are plain dark inset lines, visible on the low angle.
  for (const z of [-0.37, -0.16, 0.07, 0.27]) {
    b.rod([-0.23, 0.195, z], [0.23, 0.195, z], 0.004, { bone: spine, color: shellDark, sides: 4, name: "plastronSuture" });
  }
  return b.root;
}
