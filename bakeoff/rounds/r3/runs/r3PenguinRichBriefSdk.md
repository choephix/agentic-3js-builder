```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Penguin with Chick",
  description:
    "Proud emperor penguin with a glossy blue-black back, white belly, golden neck and ear patches, a long pink-striped beak and big black feet, with a fluffy grey chick peeking out between its feet.",
};

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.joint("spine", { at: [0, 0.6, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.86, 0.02], parent: spine });
  const head = b.joint("head", { at: [0, 1.0, 0.04], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.97, 0.12], parent: head });
  const flipperL = b.joint("flipperL", { at: [0.21, 0.8, 0], parent: spine });
  const flipperR = b.joint("flipperR", { at: [-0.21, 0.8, 0], parent: spine });
  const footL = b.joint("footL", { at: [0.1, 0.04, 0.05], parent: hips });
  const footR = b.joint("footR", { at: [-0.1, 0.04, 0.05], parent: hips });
  const tail = b.joint("tail1", { at: [0, 0.2, -0.17], parent: hips });
  const chick = b.joint("chickBody", { at: [0, 0.17, 0.2], parent: hips });
  const chickHead = b.joint("chickHead", { at: [0, 0.3, 0.22], parent: chick });

  const DARK = "#141b2c";
  const SHEEN = "#27355a";
  const WHITE = "#f6f6f2";
  const GOLD = "#f2b632";
  const GOLD2 = "#f7d05a";
  const BLACK = "#0b0b0e";
  const PINK = "#f08658";

  const ell = (color: string, bone: any, at: number[], s: number[], seg = 12) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3));
    g.scale(s[0], s[1], s[2]);
    return b.part(g, color, { at, bone });
  };

  // ---------- body ----------
  ell(DARK, spine, [0, 0.5, 0], [0.24, 0.42, 0.22], 16);
  ell(SHEEN, spine, [0, 0.62, -0.05], [0.2, 0.28, 0.16], 12); // glossy back sheen
  ell(WHITE, spine, [0, 0.48, 0.04], [0.22, 0.39, 0.22], 16); // belly
  ell(GOLD, spine, [0, 0.86, 0.035], [0.14, 0.12, 0.125], 12); // golden chest collar
  ell(GOLD2, spine, [0, 0.8, 0.07], [0.09, 0.09, 0.1], 10);

  // neck
  const nk = new THREE.CylinderGeometry(0.07, 0.095, 0.2, 10);
  b.part(nk, DARK, { at: [0, 0.93, 0.03], bone: neck });
  ell(GOLD, neck, [0.065, 0.92, 0.04], [0.035, 0.09, 0.06], 8);
  ell(GOLD, neck, [-0.065, 0.92, 0.04], [0.035, 0.09, 0.06], 8);

  // ---------- head ----------
  ell(DARK, head, [0, 1.0, 0.04], [0.095, 0.1, 0.115], 14);
  ell(GOLD, head, [0.083, 1.0, 0.03], [0.022, 0.05, 0.05], 8); // ear patches
  ell(GOLD, head, [-0.083, 1.0, 0.03], [0.022, 0.05, 0.05], 8);
  ell(GOLD2, head, [0.088, 0.995, 0.03], [0.014, 0.034, 0.034], 8);
  ell(GOLD2, head, [-0.088, 0.995, 0.03], [0.014, 0.034, 0.034], 8);
  for (const s of [1, -1]) {
    ell(BLACK, head, [0.073 * s, 1.03, 0.1], [0.02, 0.02, 0.02], 8);
    ell(WHITE, head, [0.083 * s, 1.038, 0.108], [0.006, 0.006, 0.006], 5);
  }

  // beak
  const upper = new THREE.ConeGeometry(0.03, 0.23, 8);
  upper.scale(0.85, 1, 0.8);
  upper.translate(0, 0.115, 0);
  upper.rotateX(Math.PI / 2 + 0.14);
  b.part(upper, "#2b2a31", { at: [0, 0.995, 0.12], bone: head });
  for (const s of [1, -1]) {
    const st = new THREE.ConeGeometry(0.009, 0.2, 5);
    st.translate(0, 0.1, 0);
    st.rotateX(Math.PI / 2 + 0.15);
    b.part(st, PINK, { at: [0.022 * s, 0.985, 0.125], bone: head });
  }
  const lower = new THREE.ConeGeometry(0.022, 0.18, 8);
  lower.scale(1, 1, 0.6);
  lower.translate(0, 0.09, 0);
  lower.rotateX(Math.PI / 2 + 0.1);
  b.part(lower, PINK, { at: [0, 0.968, 0.12], bone: jaw });

  // ---------- flippers ----------
  for (const [j, s] of [[flipperL, 1], [flipperR, -1]] as [any, number][]) {
    const f = new THREE.SphereGeometry(1, 10, 7);
    f.scale(0.03, 0.22, 0.09);
    f.translate(0, -0.18, 0);
    f.rotateZ(0.4 * s);
    b.part(f, DARK, { at: [0.21 * s, 0.8, 0], bone: j });
    const u = new THREE.SphereGeometry(1, 8, 6);
    u.scale(0.022, 0.18, 0.07);
    u.translate(-0.0 * s, -0.17, 0.018);
    u.rotateZ(0.4 * s);
    b.part(u, WHITE, { at: [0.21 * s - 0.008 * s, 0.8, 0], bone: j });
  }

  // ---------- tail ----------
  const tl = new THREE.ConeGeometry(0.07, 0.2, 6);
  tl.translate(0, 0.1, 0);
  tl.scale(1, 1, 0.5);
  tl.rotateX(-Math.PI / 2 - 0.5);
  b.part(tl, DARK, { at: [0, 0.2, -0.15], bone: tail });

  // ---------- feet ----------
  for (const [j, s] of [[footL, 1], [footR, -1]] as [any, number][]) {
    ell(BLACK, j, [0.1 * s, 0.03, 0.07], [0.065, 0.03, 0.12], 10);
    for (const k of [-1, 0, 1]) {
      ell(BLACK, j, [(0.1 + k * 0.04) * s, 0.025, 0.175], [0.022, 0.022, 0.04], 6);
    }
    ell("#3a3a40", j, [0.1 * s, 0.018, 0.2], [0.045, 0.008, 0.02], 5);
  }

  // ---------- chick ----------
  ell("#9a9ea8", chick, [0, 0.17, 0.17], [0.12, 0.15, 0.11], 12);
  ell("#c2c6cf", chick, [0, 0.14, 0.23], [0.08, 0.1, 0.05], 10);
  for (const [x, y, z] of [[0.06, 0.22, 0.2], [-0.06, 0.2, 0.21], [0.0, 0.29, 0.16], [0.04, 0.1, 0.25], [-0.05, 0.11, 0.24]]) {
    ell("#adb1ba", chick, [x, y, z], [0.035, 0.035, 0.035], 6);
  }
  ell("#8f939d", chickHead, [0, 0.3, 0.22], [0.08, 0.08, 0.08], 12);
  ell("#e9ebef", chickHead, [0, 0.3, 0.255], [0.058, 0.06, 0.04], 10); // pale face
  ell("#aeb2bb", chickHead, [0, 0.375, 0.21], [0.035, 0.03, 0.035], 6); // head tuft
  for (const s of [1, -1]) {
    ell(BLACK, chickHead, [0.032 * s, 0.315, 0.285], [0.014, 0.014, 0.014], 6);
  }
  const cb = new THREE.ConeGeometry(0.018, 0.05, 6);
  cb.translate(0, 0.025, 0);
  cb.rotateX(Math.PI / 2 + 0.2);
  b.part(cb, "#25252b", { at: [0, 0.295, 0.285], bone: chickHead });

  return b.root;
}
```