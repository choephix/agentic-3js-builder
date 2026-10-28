```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, paint, noise, mix, smoothstep, svg, rng } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description: "A cel-shaded, Genshin-style red panda standing on a mossy stone with an arched, ringed tail for balance.",
};

const ST = 0.2; // stone top height
const RED = cel("#e0602c");
const RED_L = cel("#f08a3c");
const CREAM = cel("#fff1d6", "#e8c9a6");
const DARK = cel("#3b1e17", "#25110f");

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });
  const R = rng(5);
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 0, 1] });
  const hips = b.joint("hips", { parent: base, at: [0, ST + 0.26, -0.15], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, ST + 0.27, 0.12], dir: [0, 0.2, 1], role: "spine" });
  const head = b.joint("head", { parent: chest, at: [0, ST + 0.37, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, ST + 0.335, 0.33], aim: [0, ST + 0.33, 0.42], role: "jaw" });

  // --- mossy stone
  const stonePaint = paint((p, n) => {
    const rock = mix("#7d7a80", "#a9a5a8", noise(p, 0.12, 3));
    const moss = smoothstep(0.35, 0.75, n.y + (noise(p, 0.08, 7) - 0.5) * 0.6);
    const m = mix("#4d8a2e", "#9bd04a", noise(p, 0.05, 9));
    return mix(rock, m, moss);
  });
  b.part(new THREE.CylinderGeometry(0.4, 0.5, ST, 9), stonePaint, { bone: base, at: [0, ST / 2, 0], name: "stone" });
  b.part(new THREE.CylinderGeometry(0.3, 0.4, 0.08, 7), stonePaint, { bone: base, at: [0.05, ST - 0.01, -0.04], name: "stoneCap" });
  for (let i = 0; i < 14; i++) {
    const a = R() * 6.28, d = 0.12 + R() * 0.3;
    b.part(new THREE.SphereGeometry(0.03 + R() * 0.03, 5, 4), i % 3 ? "#6fae38" : "#a8d85a", {
      bone: base, at: [Math.cos(a) * d, ST + 0.005, Math.sin(a) * d], scale: [1, 0.5, 1],
    });
  }
  for (const [x, z] of [[0.35, 0.2], [-0.3, -0.25], [0.1, 0.42]] as const)
    b.part(new THREE.SphereGeometry(0.05, 5, 4), "#5c9a33", { bone: base, at: [x, 0.17, z], scale: [1, 0.7, 1] });

  // --- body
  const bodyPaint = paint((p, n) => (n.y < -0.25 ? DARK : n.y > 0.6 && noise(p, 0.06, 2) > 0.62 ? RED_L : RED));
  b.part(new THREE.SphereGeometry(1, 10, 8), bodyPaint, { bone: hips, at: [0, ST + 0.26, -0.03], scale: [0.14, 0.13, 0.26], name: "torso" });
  b.part(new THREE.SphereGeometry(1, 8, 6), RED, { bone: chest, at: [0, ST + 0.27, 0.13], scale: [0.14, 0.13, 0.13], name: "shoulders" });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: chest, at: [0, ST + 0.33, 0.22], scale: [0.08, 0.06, 0.08], name: "bib" });

  // --- legs
  const sock = paint((p, n) => (p.y < ST + 0.13 ? DARK : n.y < -0.3 ? DARK : RED));
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const legs: [string, THREE.Object3D | typeof hips, number[][]][] = [
      ["F", chest, [[s * 0.1, ST + 0.24, 0.17], [s * 0.115, ST + 0.12, 0.2], [s * 0.115, ST + 0.02, 0.22]]],
      ["H", hips, [[s * 0.1, ST + 0.22, -0.17], [s * 0.125, ST + 0.11, -0.12], [s * 0.115, ST + 0.02, -0.1]]],
    ];
    for (const [t, parent, pts] of legs) {
      const c = b.chain(`leg${t}${k}`, polyline(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2]))), {
        parent: parent as any, names: [`${t === "F" ? "shoulder" : "hip"}${k}`, `${t === "F" ? "elbow" : "knee"}${k}`, `paw${t}${k}`],
        role: "leg", contact: [pts[2][0], ST, pts[2][2]],
      });
      b.sweep(c, [0.06, 0.045, 0.04], { color: sock, sides: 7, name: `leg${t}${k}` });
      const tip = pts[2];
      b.part(new THREE.SphereGeometry(1, 7, 5), DARK, { bone: c.tip ?? c.joints[2], at: [tip[0], ST + 0.022, tip[2] + 0.025], scale: [0.05, 0.03, 0.065], name: "paw" });
      for (const o of [-0.02, 0, 0.02])
        b.part(new THREE.SphereGeometry(0.009, 4, 3), "#f5ead0", { bone: c.tip ?? c.joints[2], at: [tip[0] + o, ST + 0.012, tip[2] + 0.085] });
    }
  }

  // --- head
  const H = [0, ST + 0.37, 0.3] as const;
  const headPaint = paint((p, n) => (n.y < -0.5 ? CREAM : RED));
  b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, { bone: head, at: [...H], scale: [0.125, 0.1, 0.1], name: "skull" });
  // cheek ruffs
  for (const s of [1, -1])
    for (const [dy, dz, sc] of [[-0.02, 0.0, 1], [-0.045, 0.01, 0.8]] as const)
      b.part(new THREE.ConeGeometry(0.04 * sc, 0.07 * sc, 5), CREAM, { bone: head, at: [s * 0.125, H[1] + dy, H[2] + dz], dir: [s, -0.2, 0.2], name: "ruff" });
  // muzzle, nose, mouth
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [0, H[1] - 0.025, H[2] + 0.085], scale: [0.055, 0.04, 0.05], name: "muzzle" });
  b.part(new THREE.SphereGeometry(0.015, 6, 5), INK, { bone: head, at: [0, H[1] - 0.005, H[2] + 0.132], scale: [1.3, 0.9, 1], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 7, 5), CREAM, { bone: jaw, at: [0, ST + 0.325, 0.38], scale: [0.04, 0.018, 0.05], name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.004, 0.02, 0.004), INK, { bone: head, at: [0, H[1] - 0.03, H[2] + 0.13] });
  // eyes (drawn)
  const EYE = svg(
    `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="26" ry="28" fill="#22112f"/><ellipse cx="32" cy="36" rx="20" ry="23" fill="#c9701d"/><ellipse cx="32" cy="42" rx="18" ry="14" fill="#f2b84a"/><ellipse cx="32" cy="38" rx="9" ry="14" fill="#22112f"/><ellipse cx="24" cy="26" rx="7" ry="8" fill="#fff"/><circle cx="41" cy="46" r="3.5" fill="#fff"/></svg>`,
    { size: 192 },
  );
  const PATCH = svg(
    `<svg viewBox="0 0 64 64"><path d="M6 8 Q32 0 56 14 Q50 40 34 60 Q16 40 6 8Z" fill="#fff1d6"/><path d="M22 30 Q28 46 30 58" stroke="#7a2e18" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.06, 0.07), "#ffffff", { bone: head, at: [s * 0.062, H[1] - 0.0, H[2] + 0.075], dir: [s * 0.55, 0, 1], axis: "z", texture: PATCH, name: "eyePatch" });
    b.part(new THREE.PlaneGeometry(0.042, 0.048), "#ffffff", { bone: head, at: [s * 0.05, H[1] + 0.012, H[2] + 0.087], dir: [s * 0.45, 0, 1], axis: "z", texture: EYE, name: "eye" });
    // brow tufts
    b.part(new THREE.ConeGeometry(0.012, 0.035, 4), CREAM, { bone: head, at: [s * 0.05, H[1] + 0.045, H[2] + 0.07], dir: [s * 0.3, 1, 0.5] });
    // ears: round red outer, cream rim inside
    const eb = b.joint(`ear${s > 0 ? "L" : "R"}`, { parent: head, at: [s * 0.08, H[1] + 0.07, H[2] - 0.01], dir: [s * 0.6, 1, 0], role: "hinge" });
    b.part(new THREE.SphereGeometry(1, 8, 6), RED, { bone: eb, at: [s * 0.09, H[1] + 0.09, H[2] - 0.02], scale: [0.05, 0.055, 0.025], dir: [s * 0.4, 0.4, 1], name: "ear" });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: eb, at: [s * 0.093, H[1] + 0.092, H[2] - 0.0], scale: [0.04, 0.045, 0.012], dir: [s * 0.4, 0.4, 1], name: "earInner" });
    b.part(new THREE.ConeGeometry(0.014, 0.03, 4), CREAM, { bone: eb, at: [s * 0.1, H[1] + 0.13, H[2] - 0.02], dir: [s * 0.3, 1, 0] });
  }

  // --- tail: arched up for balance, ringed
  const tailPts = catmull([
    [0, ST + 0.28, -0.26], [0, ST + 0.3, -0.45], [0, ST + 0.38, -0.62], [0, ST + 0.52, -0.72], [0, ST + 0.68, -0.7],
  ]);
  const tail = b.chain("tail", tailPts, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  const ringP = paint((p, n, s) => {
    if (s[0] > 0.9) return DARK;
    const band = Math.floor(s[0] * 10) % 2;
    return band ? DARK : n.y > 0.5 ? RED_L : RED;
  });
  b.sweep(tail, [0.045, 0.075, 0.085, 0.075, 0.05], { color: ringP, sides: 8, caps: "round", name: "tailTube" });
  // cream tail tip tufts
  b.part(new THREE.SphereGeometry(0.04, 6, 5), CREAM, { bone: tail.joints[3], at: [0, ST + 0.72, -0.69], scale: [1, 1.1, 1], name: "tailTip" });

  b.pose(jaw, { axis: [1, 0, 0], deg: 4 });
  return b.root;
}
```