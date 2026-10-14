```ts
import * as THREE from "three";
import { createBuilder, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Shore Crab",
  description:
    "A stylized shore crab with a mottled carapace, spiny rim, stalked eyes, two open claws and eight jointed walking legs, rigged and in a rest pose.",
};

const SHELL = "#d8502b";
const DARK = "#a83a22";
const PALE = "#f3d9b0";
const TIP = "#f0c27a";
const EYE = "#161616";

const ell = (rx: number, ry: number, rz: number, w = 12, h = 8) =>
  new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

export default function build() {
  const b = createBuilder({ name: "crab" });
  const body = b.joint("body", { at: [0, 0.075, 0], role: "spine" });

  const coat = mottle(SHELL, DARK, { size: 0.045, contrast: 0.8, seed: 3 });

  // Carapace
  b.part(ell(0.14, 0.045, 0.098, 14, 9), coat, { bone: body, at: [0, 0.078, 0], flat: true });
  // lower shell and plastron
  b.part(ell(0.125, 0.03, 0.09, 12, 6), DARK, { bone: body, at: [0, 0.052, 0], flat: true });
  b.part(ell(0.1, 0.012, 0.075, 10, 5), PALE, { bone: body, at: [0, 0.03, 0], flat: true });

  // Bumps on top
  for (const s of [1, -1]) {
    b.part(ell(0.032, 0.014, 0.025, 8, 5), TIP, { bone: body, at: [s * 0.04, 0.115, 0.02], flat: true });
    b.part(ell(0.025, 0.012, 0.03, 8, 5), TIP, { bone: body, at: [s * 0.055, 0.108, -0.045], flat: true });
  }
  b.part(ell(0.03, 0.013, 0.03, 8, 5), TIP, { bone: body, at: [0, 0.117, -0.02], flat: true });

  // Spiny rim
  for (let a = -100; a <= 100; a += 20) {
    const r = (a * Math.PI) / 180;
    const sx = Math.sin(r);
    const cz = Math.cos(r);
    b.part(new THREE.ConeGeometry(0.009, 0.032, 5), TIP, {
      bone: body,
      at: [0.135 * sx, 0.082, 0.093 * cz],
      dir: [sx, 0.35, cz],
      flat: true,
    });
  }
  // rear rim bumps
  for (let a = -50; a <= 50; a += 25) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.SphereGeometry(0.011, 6, 4), TIP, {
      bone: body,
      at: [0.1 * Math.sin(r), 0.075, -0.088 * Math.cos(r)],
    });
  }

  // Front brow
  b.part(ell(0.07, 0.01, 0.012, 8, 4), DARK, { bone: body, at: [0, 0.098, 0.09], flat: true });

  // Mouth: upper plate on body, lower jaw is a joint
  b.part(ell(0.04, 0.012, 0.02, 8, 4), DARK, { bone: body, at: [0, 0.052, 0.09], flat: true });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.04, 0.085], dir: [0, -0.1, 1], role: "jaw" });
  b.part(ell(0.032, 0.01, 0.022, 8, 4), TIP, { bone: jaw, at: [0, 0.04, 0.1], flat: true });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.006, 0.025, 5), PALE, {
      bone: jaw,
      at: [s * 0.016, 0.035, 0.115],
      dir: [s * 0.3, -0.2, 1],
    });

  // Abdomen flap
  const abd = b.joint("abdomen", { parent: body, at: [0, 0.04, 0.03], dir: [0, 0, -1], role: "hinge" });
  b.part(ell(0.04, 0.007, 0.055, 8, 4), TIP, { bone: abd, at: [0, 0.033, -0.03], flat: true });

  // Eyes
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base: [number, number, number] = [s * 0.045, 0.1, 0.085];
    const tip: [number, number, number] = [s * 0.058, 0.138, 0.105];
    const eye = b.joint(`eye${S}`, { parent: body, at: base, aim: tip });
    b.rod(base, tip, 0.007, { color: PALE, bone: eye, sides: 6 });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), EYE, { bone: eye, at: [tip[0], tip[1] + 0.006, tip[2] + 0.004] });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), "#ffffff", {
      bone: eye,
      at: [tip[0] + s * 0.004 * -1, tip[1] + 0.014, tip[2] + 0.014],
    });
  }

  // Walking legs
  const zs = [0.05, 0.005, -0.04, -0.075];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const hip: [number, number, number] = [s * 0.115, 0.07, z * 0.9];
      const knee: [number, number, number] = [s * 0.2, 0.15, z * 1.4 - 0.005 * i];
      const ankle: [number, number, number] = [s * 0.275, 0.085, z * 1.8 - 0.02 - 0.008 * i];
      const foot: [number, number, number] = [s * 0.31, 0.006, z * 2.0 - 0.03 - 0.012 * i];
      const leg = b.chain(`leg${S}${i + 1}`, [hip, knee, ankle, foot], {
        parent: body,
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`, `foot${S}${i + 1}`],
        role: "leg",
        contact: foot,
      });
      b.sweep(leg, [0.017, 0.015, 0.011, 0.005], {
        sides: 6,
        bands: [
          [0.65, SHELL],
          [1, TIP],
        ],
      });
      b.part(new THREE.ConeGeometry(0.008, 0.025, 5), DARK, {
        bone: leg.joints[1],
        at: [knee[0], knee[1] + 0.012, knee[2]],
        dir: [0, 1, 0],
      });
    });
  }

  // Claws
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.125, 0.085, 0.07];
    const el: [number, number, number] = [s * 0.205, 0.1, 0.12];
    const wr: [number, number, number] = [s * 0.2, 0.085, 0.205];
    const arm = b.chain(`arm${S}`, [sh, el, wr], {
      parent: body,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.024, 0.022, 0.02], { sides: 6, color: SHELL });
    b.part(new THREE.ConeGeometry(0.009, 0.03, 5), TIP, {
      bone: arm.joints[1],
      at: [el[0] + s * 0.01, el[1] + 0.02, el[2]],
      dir: [s * 0.4, 1, 0],
    });
    const hand = arm.tip!;
    const c: [number, number, number] = [s * 0.195, 0.085, 0.255];
    b.part(ell(0.042, 0.032, 0.06, 10, 7), coat, { bone: hand, at: c, flat: true });
    // fixed finger
    const fb: [number, number, number] = [c[0] - s * 0.004, c[1] - 0.012, c[2] + 0.04];
    b.spike(fb, [-s * 0.3, -0.05, 1], 0.1, 0.017, { color: TIP, bone: hand, sides: 6 });
    // movable finger, opened
    const mb: [number, number, number] = [c[0] - s * 0.004, c[1] + 0.014, c[2] + 0.04];
    const finger = b.joint(`pincer${S}`, { parent: hand, at: mb, dir: [s * 0.35, 0.45, 1], role: "jaw" });
    b.spike(mb, [s * 0.35, 0.45, 1], 0.095, 0.015, { color: TIP, bone: finger, sides: 6 });
    // teeth on fixed finger
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.005, 0.014, 4), PALE, {
        bone: hand,
        at: [fb[0] - s * (0.012 + 0.012 * k) - s * 0.008, fb[1] + 0.012, fb[2] + 0.025 + 0.02 * k],
        dir: [0, 1, 0],
      });
    }
  }

  return b.root;
}
```