import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Green Frog",
  description: "A rigged, stylized sitting frog built from primitives, with jointed legs, toes, eyes and a separate lower jaw.",
};

export default function build() {
  const b = createBuilder({ name: "frog" });
  type V = [number, number, number];

  const GREEN = "#4f9a3a", DARK = "#2e6b2a", LIGHT = "#b9d97a", BELLY = "#e9efc4";
  const GOLD = "#e8b923", BLACK = "#111111", PINK = "#d9707a";

  const hips = b.joint("hips", { at: [0, 0.034, -0.04], role: "spine" } as any);
  const chest = b.joint("chest", { at: [0, 0.036, 0.02], parent: hips, role: "spine" } as any);
  const head = b.joint("head", { at: [0, 0.042, 0.045], parent: chest, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, 0.035, 0.04], parent: head, role: "jaw" } as any);

  const ell = (r: V, color: string, at: V, bone: any) => {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(r[0], r[1], r[2]);
    return b.part(g, color, { at, bone } as any);
  };
  const seg = (a: V, c: V, r: number, color: string, bone: any, flat = 1) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const g = new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 3, 7);
    if (flat !== 1) g.scale(1, 1, flat);
    return b.part(g, color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
      bone,
    } as any);
  };

  // body
  ell([0.045, 0.03, 0.062], GREEN, [0, 0.034, -0.012], hips);
  ell([0.036, 0.018, 0.05], BELLY, [0, 0.022, -0.005], hips);
  ell([0.04, 0.022, 0.03], GREEN, [0, 0.036, 0.02], chest);
  // back spots and stripe
  const spots: [number, number, number, number][] = [
    [-0.02, 0.061, -0.03, 0.009], [0.022, 0.06, -0.04, 0.01], [0.0, 0.063, -0.01, 0.008],
    [-0.03, 0.052, -0.005, 0.007], [0.03, 0.053, -0.01, 0.007], [0.0, 0.058, -0.06, 0.008],
    [-0.012, 0.062, 0.015, 0.006], [0.014, 0.062, 0.012, 0.006],
  ];
  for (const [x, y, z, r] of spots) ell([r, r * 0.35, r], DARK, [x, y, z], hips);
  // light dorsolateral ridges
  for (const s of [-1, 1]) seg([0.03 * s, 0.056, 0.01], [0.034 * s, 0.05, -0.07], 0.003, LIGHT, hips);

  // head
  ell([0.037, 0.014, 0.04], GREEN, [0, 0.045, 0.062], head);
  ell([0.03, 0.01, 0.03], GREEN, [0, 0.05, 0.05], head);
  ell([0.033, 0.007, 0.034], LIGHT, [0, 0.033, 0.062], jaw);
  ell([0.02, 0.006, 0.02], PINK, [0, 0.036, 0.062], jaw);
  // throat
  ell([0.022, 0.012, 0.022], BELLY, [0, 0.028, 0.045], jaw);
  // nostrils
  for (const s of [-1, 1]) {
    ell([0.003, 0.002, 0.003], BLACK, [0.008 * s, 0.054, 0.098], head);
    // eyes
    ell([0.014, 0.014, 0.014], GREEN, [0.027 * s, 0.062, 0.05], head);
    ell([0.011, 0.011, 0.011], GOLD, [0.028 * s, 0.065, 0.056], head);
    ell([0.0085, 0.003, 0.0035], BLACK, [0.029 * s, 0.067, 0.0635], head);
    // tympanum
    ell([0.008, 0.008, 0.002], LIGHT, [0.04 * s, 0.045, 0.03], head);
  }

  // limbs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    // hind leg
    const hip = b.joint("hip" + n, { at: [0.034 * s, 0.032, -0.045], parent: hips, role: "leg" } as any);
    const knee = b.joint("knee" + n, { at: [0.06 * s, 0.024, 0.005], parent: hip, role: "leg" } as any);
    const ankle = b.joint("ankle" + n, { at: [0.052 * s, 0.014, -0.065], parent: knee, role: "leg" } as any);
    const ball = b.joint("foot" + n, { at: [0.058 * s, 0.006, -0.025], parent: ankle, role: "leg" } as any);
    ell([0.016, 0.016, 0.016], GREEN, [0.034 * s, 0.032, -0.045], hip);
    seg([0.034 * s, 0.032, -0.045], [0.06 * s, 0.024, 0.005], 0.014, GREEN, hip, 0.9);
    seg([0.06 * s, 0.024, 0.005], [0.052 * s, 0.014, -0.065], 0.0095, GREEN, knee);
    seg([0.052 * s, 0.014, -0.065], [0.058 * s, 0.006, -0.025], 0.005, LIGHT, ankle);
    ell([0.006, 0.006, 0.006], DARK, [0.06 * s, 0.024, 0.005], knee);
    for (let i = 0; i < 4; i++) {
      const tx = 0.058 + (i - 1.5) * 0.013;
      const tj = b.joint(`toe${i + 1}${n}`, { at: [0.058 * s, 0.006, -0.025], parent: ball, role: "digit" } as any);
      const tip: V = [(0.058 + (i - 1.5) * 0.016) * s, 0.004, 0.012 + (i === 1 || i === 2 ? 0.006 : 0)];
      seg([tx * s * 0 + 0.058 * s, 0.006, -0.025], tip, 0.0042, GREEN, tj, 0.8);
      ell([0.0045, 0.0035, 0.0045], LIGHT, [tip[0], 0.0045, tip[2]], tj);
    }
    // webbing
    const web = new THREE.CylinderGeometry(0.03, 0.03, 0.0015, 3, 1);
    web.scale(1, 1, 1.3);
    b.part(web, DARK, { at: [0.058 * s, 0.003, -0.002], bone: ball } as any);

    // front leg
    const sh = b.joint("shoulder" + n, { at: [0.032 * s, 0.032, 0.03], parent: chest, role: "arm" } as any);
    const el = b.joint("elbow" + n, { at: [0.042 * s, 0.017, 0.042], parent: sh, role: "arm" } as any);
    const wr = b.joint("wrist" + n, { at: [0.04 * s, 0.006, 0.07], parent: el, role: "arm" } as any);
    seg([0.032 * s, 0.032, 0.03], [0.042 * s, 0.017, 0.042], 0.0095, GREEN, sh);
    seg([0.042 * s, 0.017, 0.042], [0.04 * s, 0.006, 0.07], 0.0075, GREEN, el);
    for (let i = 0; i < 4; i++) {
      const tj = b.joint(`finger${i + 1}${n}`, { at: [0.04 * s, 0.006, 0.07], parent: wr, role: "digit" } as any);
      const tip: V = [(0.04 + (i - 1.5) * 0.011) * s, 0.0035, 0.092];
      seg([0.04 * s, 0.006, 0.07], tip, 0.0035, GREEN, tj, 0.8);
      ell([0.004, 0.003, 0.004], LIGHT, [tip[0], 0.004, tip[2]], tj);
    }
  }

  return b.root;
}
