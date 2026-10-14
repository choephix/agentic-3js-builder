import * as THREE from "three";
import { createBuilder, catmull, frame } from "../../../../src/index";

export const meta = {
  name: "Moon Jellyfish",
  description:
    "A glowing, translucent pale-blue moon jellyfish drifting upward, with four pink horseshoe gonads, a frill of rim tentacles and four ruffled pearly-lilac oral arms.",
};

const BELL = "#a9d6f2";
const RIM = "#7fb6e8";
const GLOW = "#e8fbff";
const PINK = "#ff8fb8";
const PINK2 = "#ff6fa3";
const WHITE = "#f4eefa";
const LILAC = "#b9a0e6";
const TENT = "#cfe6fb";

export default function build() {
  const b = createBuilder({ name: "moonJelly" });
  const Y0 = 0.95;
  const root = b.joint("root", { at: [0, Y0, 0], dir: [0, 1, 0] });
  const bell = b.joint("bell", { parent: root, at: [0, Y0, 0], dir: [0, 1, 0], role: "spine" });

  // Bell shell: a double-walled dome
  b.lathe(
    [
      [0, 0.31],
      [0.2, 0.28],
      [0.34, 0.18],
      [0.4, 0.05],
      [0.39, 0.0],
      [0.36, 0.0],
      [0.35, 0.05],
      [0.3, 0.15],
      [0.17, 0.23],
      [0, 0.25],
    ],
    { at: [0, Y0, 0], bone: bell, color: BELL, segments: 16 },
  );

  // Scalloped rim
  b.part(new THREE.TorusGeometry(0.385, 0.02, 5, 24).rotateX(Math.PI / 2), RIM, {
    at: [0, Y0 + 0.01, 0],
    bone: bell,
    flat: true,
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.SphereGeometry(0.05, 6, 4).scale(1, 0.5, 1), RIM, {
      at: [Math.cos(a) * 0.385, Y0 + 0.005, Math.sin(a) * 0.385],
      bone: bell,
      flat: true,
    });
  }

  // Inner glow core
  b.part(new THREE.SphereGeometry(0.2, 10, 6).scale(1, 0.55, 1), GLOW, {
    at: [0, Y0 + 0.12, 0],
    bone: bell,
    flat: true,
  });

  // Four pink horseshoes
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const yaw = -a + Math.PI * 0.9;
    const g = new THREE.TorusGeometry(0.075, 0.02, 6, 12, Math.PI * 1.65).rotateX(-Math.PI / 2).rotateY(yaw);
    b.part(g, k % 2 ? PINK2 : PINK, {
      at: [Math.cos(a) * 0.14, Y0 + 0.14, Math.sin(a) * 0.14],
      bone: bell,
      flat: true,
    });
  }

  // Manubrium
  b.sweep(
    [
      [0, Y0 + 0.04, 0],
      [0, Y0 - 0.1, 0],
    ],
    [0.06, 0.04],
    { bone: bell, color: LILAC, section: { ngon: 4 }, caps: "flat" },
  );

  // Rim tentacle fringe
  b.ring(
    frame([0, Y0, 0], [0, 1, 0]),
    { count: 64, radius: 0.385, joints: 8, name: "rimTent", parent: bell, role: "fan" },
    (item) => b.spike(item, [0, -1, 0], 0.15, 0.006, { color: TENT, sides: 4 }),
  );

  // Oral arms
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4 + Math.PI / 4;
    const pts: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const r = 0.07 + 0.045 * Math.sin(i * 1.3 + k);
      const ang = a + 0.25 * Math.sin(i * 0.9 + k * 2);
      pts.push([Math.cos(ang) * r, Y0 - 0.05 - i * 0.175, Math.sin(ang) * r]);
    }
    const arm = b.chain(`arm${k}`, catmull(pts), { parent: bell, count: 5, role: "tentacle" });
    b.sweep(
      arm,
      (t) => [0.04 * (1 - 0.5 * t) * (1 + 0.35 * Math.sin(t * 50 + k)), 0.012],
      {
        bands: [
          [0.6, WHITE],
          [1, LILAC],
        ],
        caps: "round",
        sides: 8,
      },
    );
  }

  const out = b.root;
  // Glow and translucency (best-effort)
  try {
    out.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats as THREE.MeshStandardMaterial[]) {
        const hex = "#" + mat.color.getHexString();
        if (hex === BELL || hex === RIM || hex === TENT) {
          mat.transparent = true;
          mat.opacity = 0.62;
          mat.emissive = mat.color.clone();
          mat.emissiveIntensity = 0.35;
        } else if (hex === GLOW || hex === PINK || hex === PINK2) {
          mat.emissive = mat.color.clone();
          mat.emissiveIntensity = 0.7;
        } else if (hex === WHITE || hex === LILAC) {
          mat.emissive = mat.color.clone();
          mat.emissiveIntensity = 0.2;
        }
      }
    });
  } catch {
    /* materials may be baked */
  }
  return out;
}
