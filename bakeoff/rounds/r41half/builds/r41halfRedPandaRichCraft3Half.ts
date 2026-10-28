import * as THREE from "three";
import { createBuilder, limb, catmull, rng } from "../../../../src/index";
import { paint, mottle, stripes, mix, noise, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red panda on a mossy stone",
  description: "Cel-shaded, Genshin-style red panda standing on a mossy stone with a glowing rune, in a rigged rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "redpanda" });
  const G = 0.16; // stone top height

  const ORANGE = "#e9772b";
  const CREAM = "#fff1d8";
  const DARK = "#3b2330";
  const RED = "#d8403a";
  const GOLD = "#f4c84a";

  // ---------- paints ----------
  const coat = cel(furEdge(ORANGE, DARK, { level: -0.35, teeth: 0.25, period: 0.035, ink: INK }));
  const headPaint = cel(ORANGE);
  const creamP = cel(CREAM, "#f1cfa6");
  const darkP = cel(DARK, "#241520");
  const tailP = cel(stripes(ORANGE, "#b04a1e", { size: 0.075, axis: "z", width: 0.45, wobble: 0.1 }));
  const MOSS = "#6fae3c";
  const stonePaint = paint((p, n) => {
    const m = noise(p, 0.12, 4);
    const moss = n.y > 0.5 || (n.y > 0.1 && m > 0.55) ? mix("#5c9a32", "#8bcc4c", m) : null;
    if (moss) return moss;
    return mix("#7c7d8c", "#a5a6b4", smoothstep(0.3, 0.8, noise(p, 0.1, 9)) * (0.6 + 0.4 * n.y));
  });

  // ---------- stone ----------
  const stone = b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.16, 7), stonePaint, {
    at: [0, 0.08, 0],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.2, 0.25, 0.05, 6), stonePaint, {
    at: [0.0, 0.025, 0.0],
    rotation: [0, 12, 0],
    flat: true,
  });
  b.part(new THREE.DodecahedronGeometry(0.07, 0), stonePaint, { at: [0.33, 0.04, 0.12], scale: [1, 0.7, 1], flat: true });
  b.part(new THREE.DodecahedronGeometry(0.05, 0), stonePaint, { at: [-0.34, 0.03, -0.1], scale: [1, 0.7, 1], flat: true });
  // moss lumps
  const sr = rng(5);
  for (let i = 0; i < 9; i++) {
    const a = sr() * Math.PI * 2;
    const rr = 0.2 + sr() * 0.08;
    b.part(new THREE.IcosahedronGeometry(0.02 + sr() * 0.015, 0), paint(() => mix("#5c9a32", "#9ad657", sr())), {
      at: [Math.sin(a) * rr, G + 0.005, Math.cos(a) * rr],
      scale: [1.3, 0.6, 1.3],
      flat: true,
    });
  }
  // glowing rune
  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="#9dff9a" stroke-width="4"/>
     <path d="M32 12 L32 52 M18 26 L32 38 L46 26 M22 46 L42 46" stroke="#caffc4" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  glow(
    b.decal(b.surface(stone), RUNE, { at: [0.2, G, -0.12], dir: [0, 1, 0], up: [0, 0, 1], size: [0.09, 0.09] }),
    1.2,
  );
  // glowing mushrooms
  for (const [x, z, h] of [[-0.2, 0.15, 0.04], [-0.14, 0.2, 0.028]]) {
    b.part(new THREE.CylinderGeometry(0.006, 0.008, h, 5), "#f4f0dc", { at: [x, G + h / 2, z] });
    glow(b.part(new THREE.SphereGeometry(0.02, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#7ef0d8", { at: [x, G + h, z] }), 1.4);
  }

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, G + 0.2, -0.14], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, G + 0.2, -0.14],
      [0, G + 0.22, 0.0],
      [0, G + 0.24, 0.14],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  b.sweep(spine, [0.085, 0.1, 0.092], { color: coat });
  // belly cream patch
  b.part(new THREE.SphereGeometry(1, 8, 6), creamP, { bone: spine.joints[1], at: [0, G + 0.155, 0.04], scale: [0.065, 0.04, 0.1] });

  const neck = b.joint("neck", { parent: chest, at: [0, G + 0.25, 0.15], aim: [0, G + 0.3, 0.21], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, G + 0.29, 0.2], dir: [0, 0.05, 1], role: "head" });
  b.capsule([0, G + 0.24, 0.12], [0, G + 0.29, 0.2], 0.07, { bone: neck, color: coat });
  const jaw = b.joint("jaw", { parent: head, at: [0, G + 0.285, 0.235], dir: [0, 0, 1], role: "jaw" });

  // ---------- head ----------
  const hc: [number, number, number] = [0, G + 0.31, 0.25];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, { bone: head, at: hc, scale: [0.1, 0.082, 0.088] });
  b.part(new THREE.SphereGeometry(1, 8, 6), creamP, { bone: head, at: [0, hc[1] - 0.02, hc[2] + 0.075], scale: [0.042, 0.032, 0.045] });
  b.part(new THREE.SphereGeometry(1, 6, 4), darkP, { bone: head, at: [0, hc[1] - 0.008, hc[2] + 0.118], scale: [0.015, 0.011, 0.011] });
  b.part(new THREE.SphereGeometry(1, 8, 5), creamP, { bone: jaw, at: [0, hc[1] - 0.048, hc[2] + 0.055], scale: [0.032, 0.014, 0.045] });
  b.part(new THREE.SphereGeometry(1, 6, 4), creamP, { bone: head, at: [0, hc[1] + 0.045, hc[2] + 0.055], scale: [0.02, 0.025, 0.02] });
  const EYE = animeEye({ iris: "#c9772a", irisLight: "#ffd27a", blush: "#ff9a8a", brow: false, size: 256 });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(hc).at(s * 33, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.04, 0.055], mirror: s > 0, bone: head });
    // dark tear streak below eye
    b.part(new THREE.SphereGeometry(1, 6, 4), darkP, { bone: head, at: [s * 0.058, hc[1] - 0.035, hc[2] + 0.06], scale: [0.006, 0.02, 0.008], rotation: [0, 0, s * -20] });
    // cheek ruffs
    b.part(new THREE.ConeGeometry(0.032, 0.075, 5), creamP, { bone: head, at: [s * 0.1, hc[1] - 0.025, hc[2] + 0.0], dir: [s * 0.9, -0.25, -0.2] });
    b.part(new THREE.ConeGeometry(0.026, 0.06, 5), creamP, { bone: head, at: [s * 0.09, hc[1] - 0.04, hc[2] + 0.03], dir: [s * 0.8, -0.5, 0.1] });
    // ears
    const ec: [number, number, number] = [s * 0.07, hc[1] + 0.068, hc[2] - 0.015];
    b.part(new THREE.SphereGeometry(1, 10, 6), headPaint, { bone: head, at: ec, scale: [0.036, 0.04, 0.014], rotation: [0, s * 25, s * -22] });
    b.part(new THREE.SphereGeometry(1, 10, 6), creamP, { bone: head, at: [ec[0], ec[1] - 0.003, ec[2] + 0.01], scale: [0.027, 0.031, 0.008], rotation: [0, s * 25, s * -22] });
    // brow dots
    b.part(new THREE.SphereGeometry(1, 6, 4), creamP, { bone: head, at: [s * 0.04, hc[1] + 0.05, hc[2] + 0.055], scale: [0.012, 0.008, 0.008] });
  }

  // collar with bell
  b.part(new THREE.TorusGeometry(0.068, 0.012, 6, 14), RED, { bone: neck, at: [0, G + 0.27, 0.17], dir: [0, 0.4, 1], axis: "z" });
  glow(b.part(new THREE.SphereGeometry(0.016, 8, 6), GOLD, { bone: neck, at: [0, G + 0.225, 0.215] }), 0.7);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.13 : -0.15;
      const root: [number, number, number] = [s * 0.07, G + 0.2, z];
      const foot: [number, number, number] = [s * 0.078, G + 0.03, z + (front ? 0.04 : 0.02)];
      const pts = limb(root, foot, [0.11, 0.11], [[0, 0, front ? -1 : 1]]);
      const tag = front ? "F" : "H";
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent: front ? chest : hips,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.045, 0.032], { color: darkP });
      const paw = leg.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 6), darkP, { bone: paw, at: [foot[0], G + 0.022, foot[2] + 0.012], scale: [0.036, 0.024, 0.048] });
      for (let k = -1; k <= 1; k++)
        b.part(new THREE.SphereGeometry(0.009, 5, 4), "#1b0f18", { bone: paw, at: [foot[0] + k * 0.014, G + 0.018, foot[2] + 0.055] });
      if (!front) b.part(new THREE.SphereGeometry(1, 8, 6), coat, { bone: hips, at: [s * 0.085, G + 0.19, z], scale: [0.045, 0.07, 0.07] });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, G + 0.21, -0.2],
      [0, G + 0.26, -0.4],
      [0, G + 0.25, -0.6],
      [0, G + 0.18, -0.78],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.055, 0.085, 0.08, 0.045], { color: tailP, sides: 8 });
  b.part(new THREE.SphereGeometry(1, 8, 6), cel("#7a3418"), { bone: tail.tip!, at: [0, G + 0.17, -0.81], scale: [0.045, 0.045, 0.05] });

  return b.root;
}
