import * as THREE from "three";
import { createBuilder, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Red-eyed tree frog on a leaf",
  description:
    "A startled red-eyed tree frog clinging to a broad green leaf: lime skin, blue and cream flank bars, orange toes with sticky pads, cream belly and huge ruby eyes with slit pupils. Rigged with spine, jaw, eyes, arms, legs and toes.",
};

const LIME = "#5fd13a";
const DARKLIME = "#3fa82c";
const CREAM = "#f4efd2";
const BLUE = "#3a6fd8";
const ORANGE = "#ff8a1c";
const PAD = "#ffa43a";
const RED = "#c8102e";

export default function build() {
  const b = createBuilder({ name: "redEyedTreeFrog" });
  const SP = new THREE.SphereGeometry(1, 10, 7);
  const add = (a: number[], d: number[], k: number) => a.map((v, i) => v + d[i] * k);

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.019, -0.026],
      [0, 0.02, -0.004],
      [0, 0.0225, 0.02],
    ],
    { parent: root, names: ["pelvis", "chest", "neck"], role: "spine" },
  );
  const [pelvis, chest, neck] = spine.joints;
  const head = b.joint("head", { parent: neck, at: [0, 0.0255, 0.03], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0225, 0.032], dir: [0, 0, 1], role: "jaw" });
  const eyeC: Record<number, number[]> = { 1: [0.0122, 0.0355, 0.0395], [-1]: [-0.0122, 0.0355, 0.0395] };
  const eyeJ: Record<number, any> = {
    1: b.joint("eyeL", { parent: head, at: eyeC[1], dir: [0.5, 0.05, 0.86], role: "hinge" }),
    [-1]: b.joint("eyeR", { parent: head, at: eyeC[-1], dir: [-0.5, 0.05, 0.86], role: "hinge" }),
  };

  // ---------- leaf ----------
  const LEAF = mottle("#2f8f3c", "#3da64a", { size: 0.03, seed: 4 });
  b.extrude(
    [
      [0, -0.1], [0.022, -0.07], [0.05, -0.03], [0.062, 0.02], [0.05, 0.07], [0.02, 0.11],
      [0, 0.135], [-0.02, 0.11], [-0.05, 0.07], [-0.062, 0.02], [-0.05, -0.03], [-0.022, -0.07],
    ],
    { color: LEAF, at: [0, 0.0015, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.003, smoothing: 2, bone: root, name: "leaf" },
  );
  b.capsule([0, 0.0028, -0.095], [0, 0.0028, -0.15], 0.0027, { color: "#2a7a33", bone: root });
  b.part(new THREE.BoxGeometry(0.002, 0.0012, 0.22), "#8fd16a", { at: [0, 0.0031, 0.015], bone: root });
  for (let k = 0; k < 8; k++) {
    const z = -0.075 + k * 0.024;
    const w = 0.062 * Math.sqrt(Math.max(0.05, 1 - ((z - 0.01) / 0.125) ** 2));
    const a = (55 * Math.PI) / 180;
    const len = (0.85 * w) / Math.sin(a);
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.0013, 0.001, len), "#7cc45c", {
        at: [s * 0.5 * len * Math.sin(a), 0.0031, z + 0.5 * len * Math.cos(a)],
        rotation: [0, s * 55, 0],
        bone: root,
      });
  }
  for (const [x, z, r] of [[-0.03, 0.055, 0.0042], [0.04, -0.06, 0.003]])
    b.part(SP, "#cfeef7", { at: [x, 0.0032, z], scale: [r, r * 0.6, r], bone: root });

  // ---------- body ----------
  const SKIN = countershade(mottle(LIME, DARKLIME, { size: 0.012, seed: 2, contrast: 0.8 }), CREAM, {
    level: -0.25,
    soft: 0.22,
  });
  const C = [0, 0.0195, -0.002];
  const R = [0.0185, 0.0145, 0.03];
  b.part(SP, SKIN, { at: C, scale: R, bone: chest, name: "body" });
  // head
  b.part(SP, SKIN, { at: [0, 0.0265, 0.0355], scale: [0.0165, 0.0105, 0.0165], bone: head, name: "headUpper" });
  b.part(SP, SKIN, { at: [0, 0.0215, 0.0405], scale: [0.0125, 0.0045, 0.0125], bone: jaw, name: "jawLower" });
  // nostrils & ear drums
  for (const s of [1, -1]) {
    b.part(SP, "#1f4a1a", { at: [s * 0.004, 0.0298, 0.0513], scale: 0.0009, bone: head });
    b.part(SP, "#9be07a", { at: [s * 0.0152, 0.0262, 0.0275], scale: [0.0012, 0.0035, 0.0035], bone: head });
  }

  // flank stripes
  const flank = (s: number, dy: number, z: number) => {
    const t = 1 - (dy / R[1]) ** 2 - ((z - C[2]) / R[2]) ** 2;
    return s * (R[0] * Math.sqrt(Math.max(t, 0.02)) - 0.0003);
  };
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const z = -0.022 + i * 0.0055;
      b.part(SP, CREAM, { at: [flank(s, -0.0058, z), C[1] - 0.0058, z], scale: [0.0016, 0.0022, 0.0042], bone: chest });
    }
    for (const z of [-0.02, -0.01, 0.0]) {
      b.part(SP, BLUE, { at: [flank(s, 0, z), C[1], z], scale: [0.0017, 0.0045, 0.0021], bone: chest });
    }
    for (const z of [-0.015, -0.005]) {
      b.part(SP, CREAM, { at: [flank(s, 0.0005, z), C[1] + 0.0005, z], scale: [0.0015, 0.0038, 0.0012], bone: chest });
    }
  }

  // ---------- eyes ----------
  const capGeo = new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, 0.5);
  const lidGeo = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, 0.95);
  const pupilGeo = new THREE.BoxGeometry(0.0015, 0.01, 0.001);
  for (const s of [1, -1]) {
    const c = eyeC[s];
    const j = eyeJ[s];
    const d = new THREE.Vector3(s * 0.5, 0.05, 0.86).normalize().toArray();
    b.part(SP, RED, { at: c, scale: 0.0085, bone: j, name: "eyeball" });
    b.part(capGeo, "#ff6a1f", { at: c, dir: d, scale: 0.0087, bone: j });
    b.part(pupilGeo, "#0a0a0a", { at: add(c, d, 0.0087), dir: d, axis: "z", up: [0, 1, 0], bone: j });
    b.part(SP, "#ffffff", { at: add(c, new THREE.Vector3(s * 0.25, 0.6, 0.76).normalize().toArray(), 0.0084), scale: 0.0010, bone: j });
    b.part(lidGeo, LIME, { at: c, scale: 0.0089, bone: j, name: "lid" });
  }

  // ---------- limbs ----------
  const toes = (
    parent: any, base: number[], s: number, suf: string, tag: string,
    count: number, spread: number, len: number, off: number, r: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const ang = ((i - (count - 1) / 2) * spread * Math.PI) / 180 + off;
      const tip = [base[0] + s * Math.sin(ang) * len, 0.0045, base[2] + Math.cos(ang) * len];
      const nm = `toe${tag}${i + 1}${suf}`;
      const ch = b.chain(nm, [[base[0], 0.0048, base[2]], tip], { parent, names: [nm, nm + "Tip"], role: "digit" });
      b.capsule([base[0], 0.0048, base[2]], tip, [r, r * 0.8], { color: ORANGE, bone: ch.joints[0] });
      b.part(SP, PAD, { at: tip, scale: [0.0034, 0.0018, 0.0034], bone: ch.joints[1], name: `pad${tag}${i + 1}${suf}` });
    }
  };
  const limb = (kind: "arm" | "leg", s: number, pts: number[][], radii: number[], parentJ: any) => {
    const suf = s > 0 ? "L" : "R";
    const p = pts.map((q) => [q[0] * s, q[1], q[2]]);
    const names =
      kind === "arm"
        ? [`shoulder${suf}`, `elbow${suf}`, `wrist${suf}`, `hand${suf}`]
        : [`hip${suf}`, `knee${suf}`, `ankle${suf}`, `foot${suf}`];
    const ch = b.chain(`${kind}${suf}`, p, { parent: parentJ, names, role: kind });
    for (let i = 0; i < 3; i++)
      b.capsule(p[i], p[i + 1], [radii[i], radii[i + 1]], { color: i === 2 ? ORANGE : LIME, bone: ch.joints[i] });
    return { ch, p, suf };
  };

  for (const s of [1, -1]) {
    const arm = limb(
      "arm", s,
      [[0.016, 0.0185, 0.021], [0.0285, 0.0115, 0.013], [0.03, 0.007, 0.0295], [0.031, 0.005, 0.0365]],
      [0.005, 0.0036, 0.003, 0.0028], chest,
    );
    toes(arm.ch.tip, arm.p[3], s, arm.suf, "F", 4, 22, 0.01, 0.1, 0.0015);

    const leg = limb(
      "leg", s,
      [[0.017, 0.0165, -0.02], [0.035, 0.0115, -0.003], [0.027, 0.0075, -0.034], [0.0385, 0.005, -0.0185]],
      [0.0085, 0.0055, 0.0042, 0.003], pelvis,
    );
    toes(leg.ch.tip, leg.p[3], s, leg.suf, "H", 5, 24, 0.013, 0.2, 0.0016);
    // blue thigh patch + cream stripe
    b.part(SP, BLUE, { at: [s * 0.0325, 0.0145, -0.0115], scale: [0.0016, 0.004, 0.0055], rotation: [0, 47 * s, 0], bone: leg.ch.joints[0] });
    b.part(SP, CREAM, { at: [s * 0.0318, 0.0172, -0.0115], scale: [0.0013, 0.0014, 0.006], rotation: [0, 47 * s, 0], bone: leg.ch.joints[0] });
  }

  return b.root;
}
