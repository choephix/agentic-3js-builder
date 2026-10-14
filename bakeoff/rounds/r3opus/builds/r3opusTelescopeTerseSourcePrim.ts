import * as THREE from "three";
import { createBuilder, grain, paint, svg, DEG } from "../../../../src/index";

export const meta = {
  name: "Brass Refractor Telescope",
  description:
    "A classic 90mm refractor on a wooden field tripod: navy lacquered tube with gold pinstripes and a gilt nameplate, brass fittings, dew shield, finder scope, star diagonal and an accessory tray holding eyepieces. Rigged with an azimuth mount and a pitch hinge for the tube.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // Palette
  const BRASS = "#c9a227";
  const BRASS_DK = "#8f6d17";
  const ENAMEL = "#1c1c24";
  const NAVY = "#1f2f5c";
  const LENS = "#173a6e";
  const LENS_HI = "#7fa8dc";
  const RUBBER = "#2b2b2b";
  const WOOD = grain("#b0703a", "#7a4a22", { size: 0.006, axis: "y" });
  const WOOD_DK = grain("#7d4b24", "#56311a", { size: 0.005, axis: "y" });
  const TUBE = paint((p, n, s) => {
    const t = s[0];
    const stripe = (a: number) => t > a && t < a + 0.012;
    return stripe(0.07) || stripe(0.1) || stripe(0.89) || stripe(0.92) ? "#e2bf55" : NAVY;
  });

  // Skeleton
  b.joint("base", { at: [0, 0, 0] });
  b.joint("mount", { parent: "base", at: [0, 1.06, 0], dir: [0, 1, 0] });
  const tilt = 25 * DEG;
  const d = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt));
  const upv = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt));
  const X = new THREE.Vector3(1, 0, 0);
  const pivot = new THREE.Vector3(0, 1.25, 0);
  b.joint("tube", { parent: "mount", at: pivot, dir: d, role: "hinge" });

  const P = (s: number, u = 0, x = 0) =>
    pivot.clone().addScaledVector(d, s).addScaledVector(upv, u).addScaledVector(X, x);
  const cyl = (r0: number, r1: number, h: number, seg = 12) => new THREE.CylinderGeometry(r0, r1, h, seg);

  // ---------------- Tripod ----------------
  // head
  b.part(cyl(0.11, 0.12, 0.05, 12), WOOD_DK, { at: [0, 1.025, 0], bone: "base" });
  b.part(cyl(0.122, 0.122, 0.012, 12), BRASS, { at: [0, 1.0, 0], bone: "base" });
  b.part(cyl(0.112, 0.112, 0.01, 12), BRASS, { at: [0, 1.052, 0], bone: "base" });

  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);
  for (let k = 0; k < 3; k++) {
    const a = k * 120 * DEG;
    const rad = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tang = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const top = rad.clone().multiplyScalar(0.09).setY(1.0);
    const foot = rad.clone().multiplyScalar(0.5).setY(0.05);
    const len = top.distanceTo(foot);
    // upper section
    const u1 = lerpV(top, foot, 0.58);
    b.part(new THREE.BoxGeometry(0.05, top.distanceTo(u1), 0.028), WOOD, {
      at: lerpV(top, u1, 0.5), aim: u1, up: rad, bone: "base",
    });
    // lower sliding section
    const l0 = lerpV(top, foot, 0.5);
    b.part(new THREE.BoxGeometry(0.034, l0.distanceTo(foot), 0.02), WOOD_DK, {
      at: lerpV(l0, foot, 0.5), aim: foot, up: rad, bone: "base",
    });
    // brass clamp + wing screw
    const c = lerpV(top, foot, 0.56);
    b.part(new THREE.BoxGeometry(0.062, 0.05, 0.04), BRASS, { at: c, aim: foot, up: rad, bone: "base" });
    b.part(cyl(0.012, 0.012, 0.03, 8), BRASS_DK, {
      at: c.clone().addScaledVector(rad, 0.03), dir: rad, bone: "base",
    });
    // hinge bolt at the head
    b.part(cyl(0.009, 0.009, 0.075, 8), BRASS, {
      at: top.clone().add(new THREE.Vector3(0, 0.01, 0)), dir: tang, bone: "base",
    });
    // ferrule + spike foot
    b.part(cyl(0.022, 0.02, 0.03, 8), BRASS, { at: foot.clone().setY(0.06), bone: "base" });
    b.part(new THREE.ConeGeometry(0.019, 0.045, 6), BRASS_DK, {
      at: foot.clone().setY(0.0225), rotation: [180, 0, 0], bone: "base",
    });
    void len;
    // spreader arm
    const y = 0.42;
    const tt = (1.0 - y) / (1.0 - 0.05);
    const legR = 0.09 + 0.41 * tt;
    b.rod(rad.clone().multiplyScalar(0.2).setY(y), rad.clone().multiplyScalar(legR - 0.01).setY(y), 0.006, {
      color: BRASS, bone: "base", sides: 6,
    });
  }
  // accessory tray
  b.part(cyl(0.22, 0.22, 0.018, 3), WOOD, { at: [0, 0.42, 0], bone: "base", flat: true });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 12), BRASS, { at: [0, 0.432, 0], rotation: [90, 0, 0], bone: "base" });
  for (let k = 0; k < 3; k++) {
    const a = (60 + k * 120) * DEG;
    const at = new THREE.Vector3(Math.sin(a) * 0.08, 0.454, Math.cos(a) * 0.08);
    const h = 0.04 + k * 0.01;
    at.y = 0.429 + h / 2;
    b.part(cyl(0.016, 0.016, h, 10), ENAMEL, { at, bone: "base" });
    b.part(cyl(0.018, 0.018, 0.01, 10), BRASS, { at: at.clone().setY(0.429 + h + 0.005), bone: "base" });
  }

  // ---------------- Mount (yaw) ----------------
  b.part(cyl(0.065, 0.07, 0.016, 14), BRASS, { at: [0, 1.065, 0], bone: "mount" });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.07), ENAMEL, { at: [0, 1.083, 0], bone: "mount" });
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.016, 0.17, 0.07), ENAMEL, { at: [sx * 0.09, 1.17, 0], bone: "mount" });
    b.part(cyl(0.035, 0.035, 0.016, 12), ENAMEL, { at: [sx * 0.09, 1.25, 0], dir: [1, 0, 0], bone: "mount" });
    b.part(cyl(0.02, 0.02, 0.02, 10), BRASS, { at: [sx * 0.09, 1.25, 0], dir: [1, 0, 0], bone: "mount" });
  }
  // azimuth lock knob
  b.part(cyl(0.012, 0.012, 0.05, 8), BRASS, { at: [0, 1.083, 0.06], dir: [0, 0, 1], bone: "mount" });
  b.part(new THREE.SphereGeometry(0.016, 8, 6), ENAMEL, { at: [0, 1.083, 0.09], bone: "mount" });

  // ---------------- Optical tube (pitch) ----------------
  const main = b.rod(P(-0.5), P(0.6), 0.055, { color: TUBE, bone: "tube", sides: 16 });
  // brass bands
  for (const s of [-0.49, 0.585]) b.part(cyl(0.059, 0.059, 0.03, 16), BRASS, { at: P(s), dir: d, bone: "tube" });
  // tube ring clamp + trunnions
  b.part(new THREE.TorusGeometry(0.06, 0.009, 6, 20), BRASS, { at: P(0), dir: d, axis: "z", bone: "tube" });
  b.part(cyl(0.012, 0.012, 0.17, 8), BRASS_DK, { at: P(0), dir: X, bone: "tube" });
  for (const sx of [1, -1])
    b.part(cyl(0.024, 0.024, 0.014, 10), BRASS, { at: P(0, 0, sx * 0.108), dir: X, bone: "tube" });

  // objective cell, lens and dew shield
  b.part(cyl(0.064, 0.064, 0.025, 16), BRASS, { at: P(0.61), dir: d, bone: "tube" });
  b.part(cyl(0.058, 0.058, 0.01, 16), LENS, { at: P(0.625), dir: d, bone: "tube" });
  b.part(cyl(0.018, 0.018, 0.004, 10), LENS_HI, { at: P(0.631, 0.022, 0.016), dir: d, bone: "tube" });
  b.part(cyl(0.007, 0.007, 0.004, 8), LENS_HI, { at: P(0.631, -0.012, -0.024), dir: d, bone: "tube" });
  b.lathe(
    [[0.062, 0], [0.069, 0], [0.069, 0.23], [0.062, 0.23]],
    { color: NAVY, at: P(0.6), axis: d, bone: "tube", segments: 16 },
  );
  b.lathe(
    [[0.0605, 0.02], [0.0618, 0.02], [0.0618, 0.229], [0.0605, 0.229]],
    { color: "#0b0b10", at: P(0.6), axis: d, bone: "tube", segments: 16 },
  );
  b.part(new THREE.TorusGeometry(0.0655, 0.0055, 6, 20), BRASS, { at: P(0.83), dir: d, axis: "z", bone: "tube" });

  // focuser, diagonal, eyepiece
  b.part(cyl(0.042, 0.048, 0.06, 14), BRASS_DK, { at: P(-0.53), dir: d, bone: "tube" });
  b.part(cyl(0.026, 0.026, 0.1, 12), BRASS, { at: P(-0.6), dir: d, bone: "tube" });
  b.part(cyl(0.03, 0.03, 0.012, 12), BRASS_DK, { at: P(-0.645), dir: d, bone: "tube" });
  b.part(new THREE.BoxGeometry(0.046, 0.046, 0.046), ENAMEL, { at: P(-0.68), dir: d, bone: "tube" });
  b.part(cyl(0.02, 0.02, 0.012, 12), BRASS, { at: P(-0.68, 0.03), dir: upv, bone: "tube" });
  b.part(cyl(0.017, 0.017, 0.06, 12), ENAMEL, { at: P(-0.68, 0.065), dir: upv, bone: "tube" });
  b.part(cyl(0.022, 0.019, 0.022, 12), RUBBER, { at: P(-0.68, 0.104), dir: upv, bone: "tube" });
  // focus knobs and shaft
  b.part(cyl(0.005, 0.005, 0.12, 6), BRASS_DK, { at: P(-0.535, -0.05), dir: X, bone: "tube" });
  for (const sx of [1, -1])
    b.part(cyl(0.017, 0.017, 0.016, 10), BRASS, { at: P(-0.535, -0.05, sx * 0.064), dir: X, bone: "tube" });

  // finder scope
  for (const s of [-0.16, 0.06]) {
    b.part(cyl(0.007, 0.007, 0.045, 6), BRASS, { at: P(s, 0.075), dir: upv, bone: "tube" });
    b.part(new THREE.TorusGeometry(0.022, 0.004, 5, 12), BRASS, { at: P(s, 0.105), dir: d, axis: "z", bone: "tube" });
  }
  b.rod(P(-0.27, 0.105), P(0.13, 0.105), 0.018, { color: NAVY, bone: "tube", sides: 10 });
  b.part(cyl(0.022, 0.022, 0.02, 10), BRASS, { at: P(0.13, 0.105), dir: d, bone: "tube" });
  b.part(cyl(0.017, 0.017, 0.004, 10), LENS, { at: P(0.141, 0.105), dir: d, bone: "tube" });
  b.part(cyl(0.012, 0.012, 0.03, 8), ENAMEL, { at: P(-0.285, 0.105), dir: d, bone: "tube" });

  // slow-motion control cable
  const cableTop = P(-0.38, -0.055, 0.03);
  const cableEnd = cableTop.clone().add(new THREE.Vector3(0.02, -0.2, -0.02));
  b.rod(cableTop, cableEnd, 0.005, { color: BRASS_DK, bone: "tube", sides: 6 });
  b.part(cyl(0.016, 0.016, 0.03, 10), ENAMEL, { at: cableEnd, bone: "tube" });

  // nameplate decal on the left side of the tube
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100">
      <rect x="4" y="4" width="512" height="92" rx="14" fill="none" stroke="#e8c55a" stroke-width="5"/>
      <rect x="14" y="14" width="492" height="72" rx="9" fill="none" stroke="#e8c55a" stroke-width="2"/>
      <text x="260" y="56" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="bold" fill="#f0cf63" letter-spacing="6">&#9733; STELLARIS &#9733;</text>
      <text x="260" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#e8c55a" letter-spacing="4">90 mm · f/13 · ACHROMAT</text>
    </svg>`,
    { size: 512 },
  );
  b.decal(main, label, { at: P(0.15, 0, 0.056), dir: [1, 0, 0], up: upv, size: [0.26, 0.05], bone: "tube" });

  return b.root;
}
