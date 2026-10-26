import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  limb,
  paint,
  mottle,
  countershade,
  noise,
  cells,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A winged stone gargoyle crouched on a mossy cathedral ledge, carved in a gothic style.",
};

// ---------- palette ----------
function stone(seed: number, moss: number) {
  const base = mottle("#9a968e", "#7b7871", { size: 0.1, seed });
  const lit = paint((p, n) => {
    const c = cells(p, 0.22, seed + 3);
    if (c.d2 - c.d1 < 0.012 && noise(p, 0.1, seed + 4) > 0.55) return "#3f3c38";
    const m = noise(p, 0.07, seed + 5) * 0.6 + noise(p, 0.02, seed + 6) * 0.4;
    if (n.y > 0.45 && m > 1 - moss) return noise(p, 0.03, seed + 7) > 0.5 ? "#6e8a4b" : "#58733b";
    return base;
  });
  const shade = mottle("#6c6962", "#57544e", { size: 0.1, seed });
  return countershade(lit, shade, { level: -0.15, soft: 0.45 });
}
const STONE = stone(2, 0.3);
const WING = stone(7, 0.2);
const LEDGE = stone(11, 0.45);
const DARK = "#1b1917";
const CLAW = "#4d4a45";
const EMBER = "#ff7a2a";

const quatrefoil = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="#ffffff" stroke-width="5">
  <circle cx="67" cy="50" r="17"/><circle cx="33" cy="50" r="17"/><circle cx="50" cy="67" r="17"/><circle cx="50" cy="33" r="17"/>
  <rect x="38" y="38" width="24" height="24" transform="rotate(45 50 50)"/></g>
  <rect x="3" y="3" width="94" height="94" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = () => new THREE.SphereGeometry(1, 10, 8);

  // ---------- ledge ----------
  const LT = 0.25;
  b.part(box(1.3, 0.17, 1.3), LEDGE, { at: [0, 0.085, -0.05] });
  b.part(box(1.42, 0.08, 1.42), LEDGE, { at: [0, 0.21, -0.05] });
  for (let i = -6; i <= 6; i++) b.part(box(0.05, 0.04, 0.03), LEDGE, { at: [i * 0.1, 0.15, 0.615] });
  for (const x of [-0.4, 0, 0.4])
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#3d3a36", {
      at: [x, 0.075, 0.602],
      dir: [0, 0, 1],
      axis: "z",
      texture: quatrefoil,
    });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.46, -0.22] });
  const spine = b.chain("spine", catmull([[0, 0.46, -0.22], [0, 0.58, -0.02], [0, 0.7, 0.18]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2", "chest"],
  });
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([[0, 0.7, 0.18], [0, 0.84, 0.3], [0, 0.9, 0.4]]), {
    parent: chest,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.at(1).at,
    dir: [0, -0.12, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.09 }),
    aim: head.local({ forward: 0.3, down: 0.1 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(spine, (t) => [0.18 + 0.03 * t, 0.15 + 0.03 * t], { color: STONE });
  b.sweep(neck, [0.11, 0.085], { color: STONE });
  b.part(ball(), STONE, { bone: chest, at: [0, 0.72, 0.12], scale: [0.24, 0.2, 0.22] });
  b.part(ball(), STONE, { bone: hips, at: [0, 0.46, -0.24], scale: [0.2, 0.16, 0.2] });
  b.along(body, 5, (at) => b.spike(at, at, 0.09, 0.03, { color: STONE }));
  // chest ribs
  for (let i = 0; i < 3; i++)
    b.part(box(0.3 - i * 0.03, 0.018, 0.03), "#85827a", { bone: chest, at: [0, 0.64 + i * 0.045, 0.3 - i * 0.01] });

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([[0, 0.44, -0.34], [0, 0.36, -0.55], [0.2, 0.32, -0.7], [0.36, 0.31, -0.52]]),
    { parent: hips, role: "tail", count: 5 },
  );
  b.sweep(tail, [0.07, 0.025], { color: STONE });
  const tt = tail.at(1);
  b.spike(tt, tt, 0.12, 0.045, { color: STONE });
  b.along(tail, 4, (at) => b.spike(at, at, 0.05, 0.02, { color: STONE }));

  // ---------- head ----------
  b.part(box(0.28, 0.2, 0.26), STONE, { bone: head, at: head.local({ forward: 0.08 }) });
  b.frustumBox(head.local({ forward: 0.17, up: -0.02 }), head.local({ forward: 0.36, up: -0.03 }), [0.2, 0.1], [0.15, 0.08], {
    bone: head,
    color: STONE,
  });
  b.part(box(0.07, 0.04, 0.07), STONE, { bone: head, at: head.local({ forward: 0.34, up: 0.02 }) }); // nose bump
  b.frustumBox(jaw.at, jaw.local({ forward: 0.28 }), [0.17, 0.05], [0.11, 0.04], { bone: jaw, color: STONE });
  b.spike(jaw.local({ forward: 0.27 }), [0, -0.3, 1], 0.07, 0.025, { bone: jaw, color: STONE }); // chin spike
  for (const s of [1, -1]) {
    // eyes
    b.part(ball(), DARK, { bone: head, at: head.local({ left: s * 0.075, forward: 0.2, up: 0.045 }), scale: [0.04, 0.035, 0.03] });
    glow(
      b.part(new THREE.SphereGeometry(0.02, 6, 4), EMBER, {
        bone: head,
        at: head.local({ left: s * 0.075, forward: 0.225, up: 0.045 }),
      }),
      1.6,
    );
    // brow
    b.part(box(0.12, 0.035, 0.07), STONE, {
      bone: head,
      at: head.local({ left: s * 0.07, forward: 0.2, up: 0.09 }),
      rotation: [0, 0, -s * 22],
    });
    // nostrils
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, { bone: head, at: head.local({ left: s * 0.03, forward: 0.375, up: 0.0 }) });
    // horns
    b.sweep(
      bezier(
        head.local({ left: s * 0.09, forward: 0.04, up: 0.09 }),
        head.local({ left: s * 0.16, forward: -0.02, up: 0.2 }),
        head.local({ left: s * 0.15, forward: -0.12, up: 0.24 }),
        head.local({ left: s * 0.1, forward: -0.2, up: 0.2 }),
      ),
      [0.042, 0.004],
      { bone: head, color: STONE, caps: { start: "flat", end: "point" }, sides: 6 },
    );
    // ears
    b.extrude([[0, -0.04], [0.11, 0.11], [0, 0.06]], {
      at: head.local({ left: s * 0.14, forward: 0.05, up: 0.0 }),
      x: [s, 0, 0],
      thickness: 0.018,
      color: STONE,
      bone: head,
    });
    // cheek spikes
    b.spike(head.local({ left: s * 0.14, forward: 0.17, up: -0.04 }), [s, -0.2, 0.3], 0.07, 0.02, { bone: head, color: STONE });
    // fangs
    b.spike(head.local({ left: s * 0.065, forward: 0.35, up: -0.07 }), [0, -1, 0], 0.06, 0.013, { bone: head, color: "#d8d2c4" });
    b.spike(jaw.local({ left: s * 0.045, forward: 0.2, up: 0.01 }), [0, 1, 0.1], 0.055, 0.012, { bone: jaw, color: "#d8d2c4" });
    for (let i = 0; i < 3; i++) {
      b.spike(head.local({ left: s * 0.07, forward: 0.2 + i * 0.045, up: -0.07 }), [0, -1, 0], 0.025, 0.009, { bone: head, color: "#c9c3b4" });
      b.spike(jaw.local({ left: s * 0.06, forward: 0.08 + i * 0.045, up: 0.01 }), [0, 1, 0], 0.022, 0.008, { bone: jaw, color: "#c9c3b4" });
    }
  }
  // central crest
  for (let i = 0; i < 3; i++)
    b.spike(head.local({ forward: 0.0 + i * 0.07, up: 0.1 }), [0, 1, -0.2], 0.06 - i * 0.012, 0.025, { bone: head, color: STONE });

  // ---------- limbs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // hind legs
    const hipPt: [number, number, number] = [s * 0.2, 0.46, -0.2];
    const pts = limb(hipPt, [s * 0.24, 0.285, 0.02], [0.26, 0.26], [[0, 0.3, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, role: "leg", names: [`hip${S}`, `knee${S}`, `ankle${S}`] });
    b.sweep(leg, (t) => 0.1 - 0.05 * t, { color: STONE });
    b.part(ball(), STONE, { bone: leg.joints[0], at: hipPt, scale: [0.11, 0.16, 0.18] });
    b.spike(pts[1], [s * 0.6, 0.5, 0.2], 0.07, 0.025, { bone: leg.joints[1], color: STONE });
    const ankle = leg.joints[leg.joints.length - 1];
    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [s * 0.24 + i * 0.04, 0.285, 0.04];
      const tip: [number, number, number] = [s * 0.24 + i * 0.05, 0.285, 0.14];
      b.capsule(base, tip, 0.022, { bone: ankle, color: STONE });
      b.spike(tip, [0, -0.35, 1], 0.055, 0.017, { bone: ankle, color: CLAW });
    }

    // arms
    const sh: [number, number, number] = [s * 0.21, 0.7, 0.2];
    const ap = limb(sh, [s * 0.25, 0.285, 0.46], [0.28, 0.28], [[s * 0.6, 0.6, -0.3]]);
    const arm = b.chain(`arm${S}`, ap, { parent: chest, role: "arm", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`] });
    b.sweep(arm, (t) => 0.08 - 0.03 * t, { color: STONE });
    b.part(ball(), STONE, { bone: arm.joints[0], at: sh, scale: [0.11, 0.11, 0.12] });
    b.spike(ap[1], [s * 0.9, 0.3, -0.4], 0.07, 0.025, { bone: arm.joints[1], color: STONE });
    const wrist = arm.joints[arm.joints.length - 1];
    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [s * 0.25 + i * 0.04, 0.285, 0.48];
      const tip: [number, number, number] = [s * 0.25 + i * 0.05, 0.285, 0.58];
      b.capsule(base, tip, 0.02, { bone: wrist, color: STONE });
      b.spike(tip, [0, -0.35, 1], 0.05, 0.016, { bone: wrist, color: CLAW });
    }

    // wings
    const R = [s * 0.14, 0.72, 0.0];
    const wing = b.chain(
      `wing${S}`,
      polyline([R, [R[0] + s * 0.27, R[1] + 0.3, -0.12], [R[0] + s * 0.5, R[1] + 0.45, -0.22]]),
      { parent: chest, role: "wing", names: [`wingRoot${S}`, `wingWrist${S}`, `wingTip${S}`] },
    );
    const W = 0.65;
    const outline = [
      [0, 0], [0.02, 0.3], [0.12, 0.6], [0.3, 0.82], [0.38, 0.55], [0.52, 0.72],
      [0.56, 0.42], [0.72, 0.5], [0.62, 0.2], [0.4, 0.08], [0.2, -0.02],
    ].map(([x, y]) => [x * W * 1.2, y * W] as [number, number]);
    const wp = b.extrude(outline, {
      at: R,
      x: [s * 0.85, 0.15, -0.45],
      y: [-s * 0.25, 1, 0.1],
      thickness: 0.02,
      color: WING,
      bone: wing.joints[0],
    });
    for (const [u, v] of [[0.3, 0.82], [0.52, 0.72], [0.72, 0.5], [0.62, 0.2]])
      b.rod(wp.local([0, 0, 0]), wp.local([u * W * 1.2, v * W, 0]), 0.014, { bone: wing.joints[0], color: STONE });
    b.rod(wp.local([0, 0, 0]), wp.local([0.12 * W * 1.2, 0.6 * W, 0]), 0.022, { bone: wing.joints[0], color: STONE });
  }

  // open the mouth a little for the rain spout
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  void LT;
  return b.root;
}
