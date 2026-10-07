import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Great horned owl",
  description:
    "A great horned owl perched on a gnarled branch: barred bark-brown and buff plumage, a pale throat bib, tall ear tufts, a tawny facial disc rimmed in black, huge orange eyes, a hooked grey beak and black talons gripping the wood.",
};

type V3 = [number, number, number];

const BARK = "#5b4430";
const BARK_DARK = "#3a2b1e";
const LICHEN = "#8d9a55";
const BROWN = "#6f5235";
const BROWN_DARK = "#4a3523";
const BUFF = "#c7a676";
const CREAM = "#eadcc0";
const TAWNY = "#c27a3c";
const BAR = "#2e2119";
const BLACK = "#14100d";
const EYE = "#f29a1f";
const BEAK = "#6c7076";
const BEAK_DARK = "#4b4f55";

const sph = (r: number, w = 14, h = 10) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, len: number, seg = 7) =>
  new THREE.CylinderGeometry(rt, rb, len, seg);
const cone = (r: number, len: number, seg = 6) => new THREE.ConeGeometry(r, len, seg);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const tor = (r: number, t: number) => new THREE.TorusGeometry(r, t, 8, 20);

export default function build() {
  const b = createBuilder({ name: "great-horned-owl" });
  type J = ReturnType<typeof b.joint>;
  type Opts = Record<string, unknown>;

  const put = (
    g: THREE.BufferGeometry,
    c: string,
    at: V3,
    bone: J,
    o: Opts = {},
  ) => b.part(g, c, { at, bone, ...o } as never);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.5, -0.02] });
  const chest = b.joint("chest", { at: [0, 0.6, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.7, 0.05], parent: chest });
  const head = b.joint("head", { at: [0, 0.77, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.735, 0.11], parent: head });
  const tail = b.joint("tail", { at: [0, 0.5, -0.1], parent: hips });

  const legs: { hip: J; ankle: J; wing: J; tip: J; s: number }[] = [];
  for (const [s, n] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ax = s * 0.07;
    const hip = b.joint(`hip${n}`, { at: [ax, 0.5, 0.03], parent: hips });
    const ankle = b.joint(`ankle${n}`, { at: [ax, 0.43, 0.04], parent: hip });
    const wing = b.joint(`wing${n}`, { at: [s * 0.12, 0.68, 0], parent: chest });
    const tip = b.joint(`wingTip${n}`, { at: [s * 0.13, 0.5, -0.1], parent: wing });
    legs.push({ hip, ankle, wing, tip, s });
  }

  // ---------- branch and trunk (scenery, gnarled) ----------
  put(cyl(0.095, 0.125, 0.4, 7), BARK, [-0.55, 0.2, 0], hips);
  put(sph(0.04, 8, 6), BARK_DARK, [-0.6, 0.15, 0.08], hips, { scale: [1, 1.3, 0.9] });
  put(cyl(0.055, 0.065, 0.95, 7), BARK, [-0.025, 0.36, 0], hips, { dir: [1, 0, 0] });
  put(sph(0.03, 8, 6), BARK_DARK, [0.25, 0.39, 0.02], hips, { scale: [1, 0.8, 1] });
  put(cyl(0.018, 0.012, 0.16, 5), BARK, [0.3, 0.48, 0.04], hips, { dir: [0.5, 1, 0.15] });
  put(cyl(0.02, 0.012, 0.13, 5), BARK, [-0.3, 0.42, -0.05], hips, { dir: [-0.4, 1, -0.3] });
  put(sph(0.018, 8, 6), LICHEN, [0.12, 0.412, 0.035], hips, { scale: [1, 0.35, 1] });
  put(sph(0.018, 8, 6), LICHEN, [-0.14, 0.41, -0.04], hips, { scale: [1, 0.35, 1] });
  put(sph(0.016, 8, 6), LICHEN, [0.42, 0.405, -0.04], hips, { scale: [1, 0.35, 1] });

  // ---------- body ----------
  put(sph(0.13), BROWN, [0, 0.6, 0], chest, { scale: [1, 1.15, 0.92] });
  put(sph(0.1), BUFF, [0, 0.6, 0.05], chest, { scale: [1, 1.2, 0.7] });
  put(sph(0.075), CREAM, [0, 0.69, 0.11], neck, { scale: [1, 0.65, 0.4] });
  for (const y of [0.52, 0.56, 0.6, 0.64]) {
    for (const x of [-0.05, 0, 0.05]) {
      put(sph(0.02, 8, 6), BAR, [x, y, 0.13], chest, { scale: [1.8, 0.25, 0.4] });
    }
  }
  // mottling on back and flanks
  put(sph(0.03), BUFF, [0.07, 0.6, -0.115], chest, { scale: [0.8, 1.4, 0.5] });
  put(sph(0.028), BARK, [-0.08, 0.63, -0.11], chest, { scale: [0.9, 1.2, 0.5] });
  put(sph(0.03), BUFF, [0.04, 0.5, -0.1], hips, { scale: [1, 1.3, 0.5] });
  put(sph(0.026), BARK_DARK, [-0.05, 0.55, -0.11], chest, { scale: [0.9, 1.4, 0.5] });

  // tail feathers
  put(box(0.11, 0.26, 0.02), BROWN, [0, 0.44, -0.17], tail, { dir: [0, -0.5, -0.85] });
  put(box(0.08, 0.24, 0.018), BROWN_DARK, [0.03, 0.43, -0.16], tail, { dir: [0.05, -0.5, -0.85] });
  put(box(0.09, 0.012, 0.022), BAR, [0, 0.4, -0.2], tail, { dir: [0, -0.5, -0.85] });

  // ---------- head ----------
  put(sph(0.1, 16, 12), BROWN, [0, 0.77, 0.03], head, { scale: [1, 1, 0.95] });
  put(sph(0.085, 16, 12), TAWNY, [0, 0.765, 0.115], head, { scale: [1, 0.95, 0.25] });
  put(tor(0.085, 0.011), BLACK, [0, 0.765, 0.128], head);
  for (const s of [1, -1]) {
    const ex = s * 0.036;
    put(sph(0.042, 14, 10), EYE, [ex, 0.78, 0.13], head);
    put(sph(0.02, 10, 8), BLACK, [ex, 0.78, 0.168], head);
    put(tor(0.04, 0.008), BLACK, [ex, 0.78, 0.155], head);
    // ear tufts
    put(cone(0.03, 0.14, 6), BARK_DARK, [s * 0.05, 0.85, 0.0], head, {
      dir: [s * 0.3, 1, -0.1],
    });
    put(cone(0.02, 0.09, 6), BROWN_DARK, [s * 0.045, 0.83, 0.02], head, {
      dir: [s * 0.2, 1, 0],
    });
  }
  // beak: upper hooked beak on the head, lower mandible on the jaw
  put(cone(0.024, 0.07, 6), BEAK, [0, 0.745, 0.15], head, { dir: [0, -0.45, 0.9] });
  put(sph(0.012, 8, 6), BEAK_DARK, [0, 0.728, 0.18], head);
  put(cone(0.016, 0.045, 6), BEAK_DARK, [0, 0.72, 0.14], jaw, { dir: [0, -0.25, 1] });

  // ---------- legs, feet, wings ----------
  for (const { hip, ankle, wing, tip, s } of legs) {
    const ax = s * 0.07;
    // feathered trousers and tarsus
    put(sph(0.05, 10, 8), BUFF, [ax, 0.5, 0.03], hip, { scale: [1, 0.9, 1] });
    put(cyl(0.03, 0.026, 0.06, 6), BUFF, [ax, 0.46, 0.035], ankle, { dir: [0, -1, 0.15] });
    put(tor(0.02, 0.005), BAR, [ax, 0.47, 0.04], ankle);
    // toes and talons gripping the bark
    for (const dx of [-0.022, 0, 0.022]) {
      put(cyl(0.011, 0.011, 0.05, 5), BLACK, [ax + dx, 0.422, 0.06], ankle, { dir: [0, 0, 1] });
      b.spike([ax + dx, 0.42, 0.085], [0, -1, 0.4], 0.035, 0.011);
    }
    // folded wing
    put(sph(0.045, 12, 10), BROWN, [s * 0.135, 0.62, -0.02], wing, { scale: [1, 2.9, 1.9] });
    for (const y of [0.58, 0.62, 0.66]) {
      put(sph(0.02, 8, 6), BAR, [s * 0.16, y, -0.03], wing, { scale: [0.6, 0.25, 1.2] });
    }
    put(sph(0.022), BUFF, [s * 0.15, 0.6, -0.06], wing, { scale: [0.6, 1.6, 0.4] });
    put(sph(0.02), BARK, [s * 0.14, 0.65, -0.09], wing, { scale: [0.6, 1.4, 0.4] });
    for (let i = 0; i < 3; i++) {
      const z = -0.09 - i * 0.04;
      put(box(0.05, 0.22, 0.012), i === 1 ? BROWN : BROWN_DARK, [s * (0.13 + i * 0.01), 0.45 + i * 0.01, z], tip, {
        dir: [0, -1, -0.2],
      });
      put(box(0.03, 0.01, 0.014), BAR, [s * (0.13 + i * 0.01), 0.5 - i * 0.02, z + 0.01], tip, {
        dir: [0, -1, -0.2],
      });
    }
  }

  return b.root;
}
