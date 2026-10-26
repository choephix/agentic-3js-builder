import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A mossy gothic stone gargoyle crouched on a carved cathedral ledge, wings folded, jaw hinged open.",
};

const DARK = "#3a3936";
const HORN = "#6e6a62";
const CLAW = "#2f2e2b";
const WINGC = "#5a5752";
const AMBER = "#ffb030";

// Weathered stone: warm and cool grey drift, dark water streaks, moss on upward faces.
const STONE = paint((p, n) => {
  let c = mix("#77746e", "#a8a49a", noise(p, 0.14, 3));
  if (noise(p, 0.05, 8) > 0.68) c = mix(c, "#45443f", 0.5);
  c = mix(c, "#5f7a3c", smoothstep(0.5, 0.85, n.y) * smoothstep(0.45, 0.65, noise(p, 0.09, 5)));
  const ao = 0.78 + 0.22 * smoothstep(-0.9, 0.5, n.y);
  return [c[0] * ao, c[1] * ao, c[2] * ao];
});
const LEDGE = paint((p, n) => {
  let c = mix("#8a867e", "#b3aea2", noise(p, 0.2, 11));
  if (Math.abs(n.y) < 0.5 && (Math.abs((p.y * 100) % 15) < 0.7 || Math.abs((p.x * 100 + 7) % 30) < 0.7)) c = mix(c, "#4a4844", 0.6);
  c = mix(c, "#5f7a3c", smoothstep(0.6, 0.9, n.y) * smoothstep(0.4, 0.6, noise(p, 0.1, 6)));
  return c;
});

const QUATREFOIL = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke="#2e2d2b" stroke-width="6" stroke-linejoin="round">
      <circle cx="50" cy="30" r="19"/><circle cx="50" cy="70" r="19"/>
      <circle cx="30" cy="50" r="19"/><circle cx="70" cy="50" r="19"/>
      <rect x="6" y="6" width="88" height="88" rx="10"/>
    </g>
    <circle cx="50" cy="50" r="6" fill="#2e2d2b"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const sphere = new THREE.SphereGeometry(1, 8, 6);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.6, -0.25], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.6, -0.25], [0, 0.7, 0], [0, 0.88, 0.22]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const chestJ = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.88, 0.22], [0, 1.0, 0.3], [0, 1.1, 0.4]]), {
    parent: chestJ,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 0.4], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 0.55], aim: [0, 1.02, 0.8], role: "jaw" });

  // ---------- ledge ----------
  b.part(new THREE.BoxGeometry(1.1, 0.3, 1.0), LEDGE, { bone: hips, at: [0, 0.15, 0.05], flat: true });
  b.part(new THREE.BoxGeometry(1.2, 0.04, 1.1), LEDGE, { bone: hips, at: [0, 0.3, 0.05], flat: true });
  b.part(new THREE.BoxGeometry(1.0, 0.04, 0.9), LEDGE, { bone: hips, at: [0, 0.02, 0.05], flat: true });
  for (const x of [-0.35, 0, 0.35])
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      bone: hips, at: [x, 0.14, 0.553], dir: [0, 0, 1], axis: "z", texture: QUATREFOIL,
    });

  // ---------- body ----------
  const body = b.sweep(spine, [0.2, 0.19, 0.24], { color: STONE, sides: 8 });
  b.along(body, 5, (at) => b.spike(at, at, 0.09, 0.032, { color: STONE }));
  b.part(sphere, STONE, { bone: chestJ, at: [0, 0.84, 0.16], scale: [0.27, 0.24, 0.27], flat: true });
  b.sweep(neck, [0.13, 0.1], { color: STONE, sides: 8 });

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(0.32, 0.26, 0.3), STONE, { bone: head, at: [0, 1.14, 0.46], flat: true });
  b.part(new THREE.BoxGeometry(0.36, 0.06, 0.12), STONE, { bone: head, at: [0, 1.25, 0.56], rotation: [-12, 0, 0], flat: true });
  b.frustumBox([0, 1.11, 0.55], [0, 1.1, 0.82], [0.24, 0.12], [0.18, 0.1], { bone: head, color: STONE });
  b.frustumBox([0, 1.03, 0.55], [0, 1.0, 0.8], [0.2, 0.06], [0.14, 0.05], { bone: jaw, color: STONE });
  b.part(new THREE.BoxGeometry(0.15, 0.02, 0.2), "#1c1b1a", { bone: jaw, at: [0, 1.04, 0.68] });
  for (const s of [1, -1]) {
    b.part(sphere, "#1c1b1a", { bone: head, at: [s * 0.09, 1.17, 0.6], scale: [0.05, 0.04, 0.03], flat: true });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), AMBER, { bone: head, at: [s * 0.09, 1.17, 0.615] }), 1.6);
    b.part(sphere, DARK, { bone: head, at: [s * 0.05, 1.13, 0.815], scale: [0.015, 0.012, 0.012] });
    b.spike([s * 0.07, 1.075, 0.78], [0, -1, 0.1], 0.07, 0.016, { bone: head, color: "#d8d2c0" });
    b.spike([s * 0.06, 1.05, 0.76], [0, 1, 0.1], 0.06, 0.014, { bone: jaw, color: "#d8d2c0" });
    b.spike([s * 0.1, 1.26, 0.42], [0, 0, 0], 0, 0, { bone: head, color: HORN }).mesh.visible = false;
    b.sweep(bezier([s * 0.1, 1.26, 0.42], [s * 0.2, 1.42, 0.36], [s * 0.2, 1.5, 0.14]), [0.05, 0], {
      bone: head, color: HORN, sides: 6, caps: { start: "flat", end: "point" },
    });
    b.spike([s * 0.16, 1.2, 0.45], [s * 0.8, 0.6, -0.25], 0.15, 0.04, { bone: head, color: STONE, sides: 5 });
  }
  b.spike([0, 1.0, 0.7], [0, -1, 0.3], 0.1, 0.03, { bone: jaw, color: HORN, sides: 5 });

  // ---------- legs, arms, wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // hind leg
    b.part(sphere, STONE, { bone: hips, at: [s * 0.22, 0.58, -0.3], scale: [0.15, 0.2, 0.2], flat: true });
    const foot = [s * 0.22, 0.36, -0.02];
    const hind = limb([s * 0.2, 0.62, -0.32], foot, [0.3, 0.3], [[0, 1, 0.5]]);
    const leg = b.chain(`leg${S}`, hind, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.095, 0.055], { color: STONE, sides: 7 });
    b.part(sphere, STONE, { bone: leg.tip ?? leg.joints[1], at: foot, scale: [0.07, 0.05, 0.1], flat: true });
    for (const k of [-1, 0, 1]) b.spike([s * 0.22 + k * 0.05, 0.36, 0.05], [k * 0.2, -0.15, 1], 0.1, 0.025, { color: CLAW, sides: 5, bone: leg.tip ?? leg.joints[1] });

    // foreleg
    b.part(sphere, STONE, { bone: chestJ, at: [s * 0.25, 0.88, 0.18], scale: [0.13, 0.14, 0.14], flat: true });
    const hand = [s * 0.24, 0.38, 0.46];
    const fore = limb([s * 0.24, 0.88, 0.18], hand, [0.3, 0.3], [[s * 0.5, 0.5, -0.6]]);
    const arm = b.chain(`arm${S}`, fore, { parent: chestJ, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.085, 0.05], { color: STONE, sides: 7 });
    const wr = arm.tip ?? arm.joints[1];
    b.part(sphere, STONE, { bone: wr, at: hand, scale: [0.07, 0.05, 0.09], flat: true });
    for (const k of [-1, 0, 1]) b.spike([s * 0.24 + k * 0.045, 0.38, 0.53], [k * 0.25, -0.15, 1], 0.11, 0.022, { color: CLAW, sides: 5, bone: wr });

    // wing: arm bone with a membrane to a trailing edge
    const wp = [[s * 0.2, 0.95, 0.05], [s * 0.42, 1.3, -0.1], [s * 0.5, 1.25, -0.5], [s * 0.75, 1.0, -0.85]];
    const wing = b.chain(`wing${S}`, wp, { parent: chestJ, names: [`wing${S}1`, `wing${S}2`, `wing${S}3`, `wingTip${S}`], role: "wing" });
    b.sweep(wing, [0.05, 0.02], { color: STONE, sides: 6 });
    const trail = [[s * 0.15, 0.8, -0.1], [s * 0.3, 0.9, -0.35], [s * 0.45, 0.9, -0.6], [s * 0.65, 0.95, -0.85]];
    b.membrane(wing, trail, { color: WINGC, thickness: 0.02, scallop: 0.15, bone: chestJ });
    b.rod([s * 0.5, 1.25, -0.5], trail[1], 0.016, { color: STONE, bone: chestJ });
    b.rod([s * 0.5, 1.25, -0.5], trail[2], 0.016, { color: STONE, bone: chestJ });
    b.spike([s * 0.42, 1.3, -0.1], [s * 0.3, 1, 0.2], 0.12, 0.03, { color: CLAW, bone: chestJ, sides: 5 });
  }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 0.58, -0.4], [0, 0.5, -0.7], [0.15, 0.42, -0.95], [0.3, 0.4, -1.0], [0.4, 0.46, -0.9]]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail",
  });
  b.sweep(tail, [0.1, 0.035], { color: STONE, sides: 7 });
  const te = tail.at(1);
  b.spike(te, te, 0.14, 0.055, { color: HORN, sides: 5 });

  // open the mouth a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });
  return b.root;
}
