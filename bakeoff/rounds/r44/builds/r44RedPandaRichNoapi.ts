import * as THREE from "three";
import { createBuilder, catmull, limb, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description: "A cel-shaded, Genshin-style red panda standing on a mossy stone, with a ringed tail raised for balance, cream-rimmed ears and cheek ruffs, and a small glowing crystal.",
};

const RUST = "#d9602a", RUST_SH = "#a63f2e", DARK = "#2e1a1c", DARK_SH = "#1b1018";
const CREAM = "#fff1d6", CREAM_SH = "#e7c3a6", RING = "#f0a05a", RING_SH = "#bf6a45";
const STONE = "#8d9096", STONE_SH = "#5d6275", MOSS = "#6fb04a", MOSS_SH = "#3f7a46";
const LIGHT = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const cel = (lit: string, sh: string) => paint((_p, n) => (n.dot(LIGHT) > 0.1 ? lit : sh));

const coat = paint((p, n) => {
  const lit = n.dot(LIGHT) > 0.1;
  if (n.y < -0.25 || p.y < 0.2) return lit ? DARK : DARK_SH;
  return lit ? RUST : RUST_SH;
});
const darkPaint = cel(DARK, DARK_SH);
const creamPaint = cel(CREAM, CREAM_SH);
const tailPaint = paint((_p, n, s) => {
  const lit = n.dot(LIGHT) > 0.1;
  if (s[0] > 0.9) return lit ? DARK : DARK_SH;
  const band = Math.floor(s[0] * 20) % 2 === 0;
  return band ? (lit ? RUST : RUST_SH) : lit ? RING : RING_SH;
});
const stonePaint = paint((p, n) => {
  const lit = n.dot(LIGHT) > 0.1;
  const m = n.y + (noise(p, 0.12, 3) - 0.5) * 0.9;
  if (m > 0.35) return lit ? MOSS : MOSS_SH;
  return lit ? STONE : STONE_SH;
});

const EYE = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="42" rx="26" ry="34" fill="#1b1018"/>
  <ellipse cx="32" cy="46" rx="20" ry="28" fill="#f2a22a"/>
  <ellipse cx="32" cy="30" rx="22" ry="14" fill="#a8541e"/>
  <ellipse cx="32" cy="48" rx="9" ry="16" fill="#1b1018"/>
  <ellipse cx="24" cy="32" rx="7" ry="9" fill="#fff"/>
  <circle cx="41" cy="58" r="4" fill="#fff"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });
  const S = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // skeleton
  const stone = b.joint("stone", { at: [0, 0, 0], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: stone, at: [0, 0.3, -0.12], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.31, 0.1], dir: [0, 0, 1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.33, 0.17], dir: [0, 0.2, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.36, 0.23], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.325, 0.33], aim: [0, 0.315, 0.43], role: "jaw" });

  // stone
  b.part(new THREE.CylinderGeometry(0.3, 0.37, 0.14, 9), stonePaint, { bone: stone, at: [0, 0.07, 0], flat: true, name: "stone" });
  const lumps: [number, number, number, number][] = [[0.18, 0.15, 0.1, 0.07], [-0.22, 0.14, 0.12, 0.06], [0.05, 0.15, -0.26, 0.07], [-0.15, 0.145, -0.18, 0.05], [0.26, 0.14, -0.1, 0.05]];
  for (const [x, y, z, r] of lumps) b.part(S(r, 6, 4), cel(MOSS, MOSS_SH), { bone: stone, at: [x, y, z], scale: [1, 0.5, 1], flat: true, name: "mossLump" });
  glow(b.part(new THREE.ConeGeometry(0.03, 0.12, 5), "#7fe8ff", { bone: stone, at: [-0.27, 0.19, 0.2], dir: [-0.2, 1, 0.1], name: "crystal" }), 1.4);
  glow(b.part(new THREE.ConeGeometry(0.02, 0.07, 5), "#b4f4ff", { bone: stone, at: [-0.22, 0.17, 0.25], dir: [0.3, 1, 0.2], name: "crystal2" }), 1.4);

  // body
  b.part(S(1, 12, 8), coat, { bone: hips, at: [0, 0.3, -0.02], scale: [0.13, 0.12, 0.27], name: "torso" });
  b.part(S(1, 10, 8), coat, { bone: chest, at: [0, 0.32, 0.12], scale: [0.12, 0.115, 0.14], name: "shoulders" });
  b.part(S(1, 10, 6), coat, { bone: neck, at: [0, 0.34, 0.2], scale: [0.09, 0.08, 0.08], name: "neckMass" });
  b.part(S(1, 8, 6), creamPaint, { bone: chest, at: [0, 0.285, 0.2], scale: [0.07, 0.05, 0.05], name: "bib" });

  // head
  const C = new THREE.Vector3(0, 0.37, 0.3);
  const R = [0.115, 0.1, 0.1];
  b.part(S(1, 14, 10), coat, { bone: head, at: C.toArray(), scale: R, name: "skull" });
  b.part(S(1, 10, 8), creamPaint, { bone: head, at: [0, 0.35, 0.385], scale: [0.055, 0.04, 0.045], name: "muzzle" });
  b.part(S(0.02, 6, 5), darkPaint, { bone: head, at: [0, 0.368, 0.428], scale: [1.3, 0.9, 0.9], name: "nose" });
  b.part(S(1, 8, 6), creamPaint, { bone: jaw, at: [0, 0.322, 0.375], scale: [0.04, 0.02, 0.05], name: "lowerJaw" });
  b.part(S(1, 6, 4), "#5a1a24", { bone: head, at: [0, 0.334, 0.375], scale: [0.03, 0.006, 0.04], name: "mouth" });
  b.part(new THREE.CapsuleGeometry(0.004, 0.025, 3, 5), darkPaint, { bone: head, at: [0, 0.34, 0.425], name: "philtrum" });

  const onHead = (d: THREE.Vector3, lift: number) => {
    const u = d.clone().normalize();
    const k = 1 / Math.sqrt((u.x / R[0]) ** 2 + (u.y / R[1]) ** 2 + (u.z / R[2]) ** 2);
    return { at: C.clone().addScaledVector(u, k + lift), n: u };
  };
  for (const s of [1, -1]) {
    const e = onHead(new THREE.Vector3(s * 0.5, 0.15, 0.85), 0.004);
    b.part(new THREE.PlaneGeometry(0.044, 0.056), "#ffffff", { bone: head, at: e.at.toArray(), dir: [s * 0.45, 0.1, 0.9], axis: "z", texture: EYE, name: "eye" });
    // tear marks
    const t = onHead(new THREE.Vector3(s * 0.62, -0.18, 0.76), 0.004);
    b.part(new THREE.CapsuleGeometry(0.006, 0.045, 3, 5), cel("#f1b27a", "#c97e58"), { bone: head, at: t.at.toArray(), dir: [s * 0.2, 1, 0.1], name: "tear" });
    // ears
    const ec = C.clone().add(new THREE.Vector3(s * 0.085, 0.085, -0.015));
    b.part(S(1, 8, 6), coat, { bone: head, at: ec.toArray(), scale: [0.05, 0.055, 0.025], rotation: [0, 0, s * -20], name: "ear" });
    b.part(S(1, 8, 6), creamPaint, { bone: head, at: [ec.x + s * 0.004, ec.y + 0.002, ec.z + 0.012], scale: [0.04, 0.045, 0.014], rotation: [0, 0, s * -20], name: "earRim" });
    b.part(S(1, 8, 6), darkPaint, { bone: head, at: [ec.x + s * 0.004, ec.y, ec.z + 0.02], scale: [0.026, 0.03, 0.008], rotation: [0, 0, s * -20], name: "earIn" });
    // cheek ruffs
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.ConeGeometry(0.03 - i * 0.003, 0.075, 5), creamPaint, {
        bone: head,
        at: [s * (0.1 + i * 0.004), 0.37 - i * 0.015, 0.31 + i * 0.012],
        dir: [s * 1, -0.35 - i * 0.2, 0.15],
        name: "ruff",
      });
    }
    // brow dots
    b.part(S(0.011, 5, 4), creamPaint, { bone: head, at: onHead(new THREE.Vector3(s * 0.4, 0.55, 0.75), 0.002).at.toArray(), name: "brow" });
  }
  // forehead crest
  b.part(S(1, 8, 6), cel(RING, RING_SH), { bone: head, at: [0, 0.455, 0.3], scale: [0.045, 0.012, 0.06], name: "crown" });

  // legs
  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const z = front ? 0.17 : -0.2;
    const x = s * (front ? 0.095 : 0.1);
    const root: [number, number, number] = [x, 0.27, z];
    const foot: [number, number, number] = [x, 0.17, z + 0.04];
    const pts = limb(root, foot, [0.08, 0.08], [0, 0, front ? -1 : 1]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const ch = b.chain(`leg${front ? "F" : "H"}${side}`, pts, { parent: front ? chest : hips, names, role: "leg", contact: [x, 0.14, z + 0.04] });
    b.sweep(ch, [0.05, 0.04, 0.032], { color: darkPaint, sides: 7, caps: "round", name: `legTube${side}` });
    b.part(S(1, 8, 6), darkPaint, { bone: ch.tip!, at: [x, 0.155, z + 0.07], scale: [0.04, 0.025, 0.06], name: "paw" });
    for (const k of [-1, 0, 1]) b.part(S(0.011, 5, 4), "#efe6d4", { bone: ch.tip!, at: [x + k * 0.017, 0.15, z + 0.125], name: "claw" });
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // tail: raised, ringed, balancing
  const tail = b.chain("tail", catmull([[0, 0.33, -0.25], [0, 0.35, -0.4], [0, 0.45, -0.52], [0, 0.6, -0.55], [0, 0.72, -0.5]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });
  b.sweep(tail, [0.05, 0.075, 0.08, 0.07, 0.035], { color: tailPaint, sides: 8, caps: "round", name: "tailTube" });

  // pose: stand balanced, head slightly up
  b.pose(neck, { axis: [1, 0, 0], deg: -5 });
  return b.root;
}
