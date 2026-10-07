import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Sea turtle",
  description: "Stylized green sea turtle with a scuted shell, paddle flippers and a jointed beak, rigged in a rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });

  const skin = "#7f9150";
  const skinDark = "#566a35";
  const cream = "#e8dba5";
  const shellC = "#5a4727";
  const scuteC = "#8b6b34";
  const rimC = "#3d3220";

  // ---- skeleton ----
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" } as any);
  const neck = b.joint("neck", { at: [0, 0.24, 0.45], parent: body, role: "neck" } as any);
  const head = b.joint("head", { at: [0, 0.26, 0.63], parent: neck, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, 0.225, 0.7], parent: head, role: "jaw" } as any);
  const tail1 = b.joint("tail1", { at: [0, 0.15, -0.5], parent: body, role: "tail" } as any);
  const tail2 = b.joint("tail2", { at: [0, 0.14, -0.6], parent: tail1, role: "tail" } as any);

  const ell = (rx: number, ry: number, rz: number, seg = 10, h = 7) =>
    new THREE.SphereGeometry(1, seg, h).scale(rx, ry, rz);

  // ---- shell ----
  const cy = 0.2, rx = 0.4, ry = 0.2, rz = 0.52;
  b.part(ell(rx, ry, rz, 16, 10), shellC, { at: [0, cy, 0], bone: body });
  b.part(ell(0.34, 0.11, 0.47, 14, 8), cream, { at: [0, 0.11, 0], bone: body });

  // scutes seated on the carapace
  const surfY = (x: number, z: number) => {
    const t = 1 - (x / rx) ** 2 - (z / rz) ** 2;
    return t > 0 ? cy + ry * Math.sqrt(t) : cy;
  };
  const scute = (x: number, z: number, r: number) => {
    const y = surfY(x, z);
    const n = new THREE.Vector3(x / rx ** 2, (y - cy) / ry ** 2, z / rz ** 2).normalize();
    const g = new THREE.CylinderGeometry(r * 0.88, r, 0.03, 6);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    g.applyQuaternion(q);
    b.part(g, scuteC, {
      at: [x + n.x * 0.004, y + n.y * 0.004, z + n.z * 0.004],
      bone: body,
    });
  };
  [0.33, 0.17, 0.0, -0.17, -0.33].forEach((z) => scute(0, z, 0.088));
  [0.22, 0.07, -0.08, -0.23].forEach((z) => {
    scute(0.21, z, 0.085);
    scute(-0.21, z, 0.085);
  });
  // marginal scutes
  const N = 26;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    if (Math.abs(Math.sin(a)) < 0.2 && Math.cos(a) > 0.75) continue; // neck gap
    b.part(ell(0.045, 0.03, 0.045, 6, 4), i % 2 ? rimC : "#4d3f27", {
      at: [Math.sin(a) * rx * 0.97, 0.16, Math.cos(a) * rz * 0.97],
      bone: body,
    });
  }

  // ---- neck & head ----
  b.part(ell(0.08, 0.07, 0.14, 8, 6), skin, { at: [0, 0.24, 0.5], bone: neck });
  b.part(ell(0.095, 0.08, 0.12, 10, 8), skin, { at: [0, 0.265, 0.65], bone: head });
  b.part(ell(0.06, 0.04, 0.07, 8, 6), skin, { at: [0, 0.25, 0.745], bone: head }); // upper beak
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.03), "#c9a24a", { at: [0, 0.228, 0.795], bone: head });
  b.part(ell(0.052, 0.018, 0.075, 8, 5), cream, { at: [0, 0.218, 0.74], bone: jaw }); // lower jaw
  b.part(ell(0.07, 0.02, 0.05, 8, 5), skinDark, { at: [0, 0.31, 0.64], bone: head }); // brow ridge
  for (const s of [1, -1]) {
    b.part(ell(0.022, 0.025, 0.025, 6, 5), "#ffffff", { at: [s * 0.083, 0.28, 0.69], bone: head });
    b.part(ell(0.014, 0.018, 0.014, 6, 5), "#15120d", { at: [s * 0.099, 0.28, 0.696], bone: head });
    b.part(ell(0.012, 0.01, 0.012, 5, 4), skinDark, { at: [s * 0.036, 0.285, 0.77], bone: head }); // nostril
  }
  // head scale spots
  [[0.04, 0.325, 0.6], [-0.04, 0.325, 0.6], [0, 0.33, 0.66], [0.06, 0.31, 0.7], [-0.06, 0.31, 0.7]].forEach((p) =>
    b.part(ell(0.02, 0.008, 0.02, 6, 4), "#a7b36a", { at: p as [number, number, number], bone: head }),
  );

  // ---- tail ----
  b.part(ell(0.045, 0.04, 0.09, 7, 5), skin, { at: [0, 0.15, -0.52], bone: tail1 });
  b.part(ell(0.03, 0.028, 0.08, 7, 5), skin, { at: [0, 0.14, -0.63], bone: tail2 });

  // ---- flippers ----
  for (const s of [1, -1]) {
    const sf = s > 0 ? "L" : "R";
    // front
    const sh = b.joint("shoulder" + sf, { at: [s * 0.3, 0.17, 0.27], parent: body, role: "arm" } as any);
    const el = b.joint("flipperTip" + sf, { at: [s * 0.62, 0.15, 0.1], parent: sh, role: "arm" } as any);
    const g1 = ell(0.2, 0.032, 0.095, 9, 6).rotateY(s * 0.5);
    b.part(g1, skin, { at: [s * 0.44, 0.165, 0.2], bone: sh });
    const g2 = ell(0.22, 0.022, 0.07, 9, 6).rotateY(s * 0.5);
    b.part(g2, skin, { at: [s * 0.74, 0.14, 0.04], bone: el });
    b.part(ell(0.1, 0.018, 0.035, 7, 5), skinDark, { at: [s * 0.9, 0.135, -0.02], bone: el });
    for (let k = 0; k < 3; k++)
      b.part(ell(0.035, 0.008, 0.03, 6, 4), cream, {
        at: [s * (0.5 + k * 0.14), 0.2 - k * 0.012, 0.16 - k * 0.07],
        bone: k ? el : sh,
      });
    // rear
    const hip = b.joint("hip" + sf, { at: [s * 0.2, 0.12, -0.38], parent: body, role: "leg" } as any);
    const rf = b.joint("rearTip" + sf, { at: [s * 0.34, 0.1, -0.58], parent: hip, role: "leg" } as any);
    b.part(ell(0.1, 0.025, 0.07, 8, 5).rotateY(s * -0.9), skin, { at: [s * 0.27, 0.115, -0.47], bone: hip });
    b.part(ell(0.09, 0.018, 0.05, 8, 5).rotateY(s * -0.9), skinDark, { at: [s * 0.36, 0.1, -0.6], bone: rf });
  }

  return b.root;
}
