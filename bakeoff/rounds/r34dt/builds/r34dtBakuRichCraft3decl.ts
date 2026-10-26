import * as THREE from "three";
import { createBuilder, rng, catmull, paint, noise, mix, smoothstep, svg, countershade, stripes, patches } from "../../../../src/index";
import { limb } from "../../../../src/index";

export const meta = { name: "Baku", description: "Dream-eating tapir spirit in ukiyo-e woodblock style, with a waves-and-clouds painted hide, tusks, and swirling dream smoke." };

const INK = "#1b2340", INDIGO = "#2a4a7c", PALE = "#efe3c4", VERM = "#c8402e", GOLD = "#d9a23a", PAPER = "#f4e9cf", TEAL = "#3f8f8a";

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(7);

  // woodblock-style hide: indigo with pale belly, wave-line bands
  const hide = paint((p, n) => {
    const wave = Math.sin(p.z * 22 + Math.sin(p.y * 14) * 1.5);
    const base = n.y < -0.25 ? PALE : INDIGO;
    if (n.y >= -0.25 && Math.abs(wave) > 0.93) return mix(base, "#5f86bd", 0.7);
    const nz = noise(p, 0.05, 3);
    return mix(base, n.y < -0.25 ? "#d8c8a0" : "#1f3a68", nz * 0.5);
  });
  const mane = stripes(INK, VERM, { size: 0.06, axis: "y", width: 0.3 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.95, -0.55], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.95, -0.55], [0, 1.0, -0.1], [0, 1.05, 0.35]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] });
  const neck = b.chain("neck", catmull([[0, 1.05, 0.35], [0, 1.2, 0.6], [0, 1.28, 0.85]]), { parent: spine.joints[2], role: "neck", names: ["neck1", "neck2", "neck3"] });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.28, 0.85], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.2, 0.95], dir: [0, -0.1, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.95, -0.55], [0, 0.95, -0.8], [0, 1.0, -1.0]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body
  const bodyPath = catmull([[0, 0.95, -0.9], [0, 0.95, -0.55], [0, 1.0, -0.1], [0, 1.05, 0.35], [0, 1.2, 0.6]]);
  b.sweep(bodyPath, [0.2, 0.3, 0.33, 0.28, 0.2], { bone: [tail, hips, spine, neck], color: hide, sides: 8 });
  b.sweep(neck, [0.2, 0.17, 0.16], { color: hide });
  // belly pad
  b.part(new THREE.SphereGeometry(0.28, 8, 6), PALE, { bone: spine.joints[1], at: [0, 0.78, -0.1], scale: [1, 0.55, 1.5] });

  // head: broad skull + long drooping tapir snout
  b.part(new THREE.SphereGeometry(0.2, 10, 8), hide, { bone: head, at: [0, 1.28, 0.9], scale: [1, 1.05, 1.2] });
  b.sweep(catmull([[0, 1.25, 1.0], [0, 1.2, 1.2], [0, 1.1, 1.38]]), [0.15, 0.115, 0.1], { bone: head, color: INDIGO, sides: 8 });
  // trunk-tip nose & nostrils
  b.part(new THREE.SphereGeometry(0.1, 8, 6), INDIGO, { bone: head, at: [0, 1.08, 1.4], scale: [1.1, 0.8, 1.1] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.02, 6, 4), INK, { bone: head, at: [s * 0.045, 1.07, 1.49] });
  // lower jaw
  b.sweep(catmull([[0, 1.1, 1.0], [0, 1.07, 1.2], [0, 1.03, 1.32]]), [0.1, 0.08, 0.06], { bone: jaw, color: PALE, sides: 8 });
  // tusks
  for (const s of [1, -1]) {
    b.spike([s * 0.07, 1.1, 1.27], [s * 0.02, 1, 0.5], 0.14, 0.022, { bone: jaw, color: "#fff7e0" });
  }

  // eyes: ukiyo-e drawn
  const eyeTex = svg(`<svg viewBox="0 0 64 40"><path d="M2 22 Q32 -4 62 22 Q32 40 2 22Z" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><circle cx="34" cy="21" r="10" fill="${VERM}" stroke="${INK}" stroke-width="3"/><circle cx="34" cy="21" r="4" fill="${INK}"/><circle cx="37" cy="17" r="2" fill="#fff"/><path d="M4 16 Q32 -10 60 16" stroke="${INK}" stroke-width="5" fill="none"/></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.15, 0.094), "#ffffff", { bone: head, at: [s * 0.15, 1.35, 1.0], dir: [s * 0.8, 0.05, 0.6], axis: "z", texture: eyeTex });

  // ears
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.07, 8, 6), INDIGO, { bone: head, at: [s * 0.14, 1.5, 0.82], scale: [0.7, 1.2, 0.5] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), PALE, { bone: head, at: [s * 0.14, 1.5, 0.85], scale: [0.6, 1, 0.4] });
  }

  // horns + flame mane (baku have lion-like manes)
  for (const s of [1, -1])
    b.spike([s * 0.08, 1.45, 0.85], [s * 0.3, 1, -0.2], 0.28, 0.03, { bone: head, color: GOLD });
  const bladeGeo = new THREE.ConeGeometry(0.06, 0.26, 4);
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const c = neck.at(0.05 + t * 0.9);
    for (const s of [1, -1]) {
      b.part(bladeGeo, i % 2 ? VERM : mane, { bone: neck.jointAt(t), at: [s * 0.13, c.at.y + 0.17, c.at.z - 0.04], rotation: [-30, 0, s * 40 ] });
    }
  }
  for (let i = 0; i < 5; i++) b.part(bladeGeo, i % 2 ? VERM : INK, { bone: spine.joints[1], at: [0, 1.28 - i * 0.02, 0.3 - i * 0.2], rotation: [-100, 0, 0], scale: 0.8 });

  // chest emblem (cloud roundel)
  const emblem = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><path d="M12 38 q6 -14 14 -4 q6 -12 14 -2 q10 -6 12 6 z" fill="${TEAL}" stroke="${INK}" stroke-width="2.5"/><path d="M10 48 q10 -6 20 0 t24 0" fill="none" stroke="${INDIGO}" stroke-width="3"/></svg>`, { size: 128 });
  b.part(new THREE.CircleGeometry(0.1, 16), "#ffffff", { bone: spine.joints[2], at: [0, 0.95, 0.66], dir: [0, 0, 1], axis: "z", texture: emblem });

  // legs
  const legs: [number, number, string][] = [[1, 0.3, "F"], [-1, 0.3, "F"], [1, -0.6, "H"], [-1, -0.6, "H"]];
  for (const [s, z, k] of legs) {
    const par = k === "F" ? spine.joints[2] : hips;
    const hipP: [number, number, number] = [s * 0.2, 0.85, z];
    const pts = limb(hipP, [s * 0.2, 0.06, z + (k === "H" ? 0.05 : 0.02)], [0.4, 0.4], [[0, 0, k === "H" ? -1 : 1]]);
    const leg = b.chain(`leg${k}${s > 0 ? "L" : "R"}`, pts, { parent: par, role: "leg", names: [`hip${k}${s > 0 ? "L" : "R"}`, `knee${k}${s > 0 ? "L" : "R"}`, `foot${k}${s > 0 ? "L" : "R"}`] });
    b.sweep(leg, [0.1, 0.07, 0.06], { color: hide });
    b.part(new THREE.CylinderGeometry(0.085, 0.095, 0.08, 8), PALE, { bone: leg.tip!, at: [s * 0.2, 0.08, z + 0.03] });
    // hooves/toes
    for (const t of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.03, 6, 4), INK, { bone: leg.tip!, at: [s * 0.2 + t * 0.045, 0.03, z + 0.1], scale: [1, 0.8, 1.2] });
    // cloud-scroll anklet
    b.part(new THREE.TorusGeometry(0.075, 0.015, 5, 10), GOLD, { bone: leg.tip!, at: [s * 0.2, 0.15, z + 0.02], rotation: [90, 0, 0] });
  }

  // tail tuft
  b.sweep(tail, [0.07, 0.04, 0.03], { color: INDIGO });
  for (let i = 0; i < 5; i++) b.part(bladeGeo, i % 2 ? VERM : GOLD, { bone: tail.joints[2], at: [(i - 2) * 0.03, 1.0, -1.06], rotation: [-110, 0, (i - 2) * 25], scale: 0.7 });

  // dream-smoke curls (glowing swirls) drifting from the nose
  const smokeTex = svg(`<svg viewBox="0 0 64 64"><path d="M8 50 C8 20 40 30 36 44 C34 54 22 48 26 40 C28 36 34 40 32 42" fill="none" stroke="${PAPER}" stroke-width="6" stroke-linecap="round"/><path d="M8 50 C8 20 40 30 36 44" fill="none" stroke="${TEAL}" stroke-width="2"/></svg>`, { size: 128 });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: head, at: [i * 0.03 - 0.03, 1.02 + i * 0.1, 1.55 + i * 0.1], dir: [0, 0, 1], axis: "z", texture: smokeTex, rotation: [0, 0, R() * 40] });

  return b.root;
}
