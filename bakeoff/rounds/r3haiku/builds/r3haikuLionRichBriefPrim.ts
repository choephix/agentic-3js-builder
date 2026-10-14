import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description:
    "A proud old lion standing tall with his head held high: a shaggy mane fading from golden blond at the face to dark chocolate at the edges, tawny body, cream belly and muzzle, amber eyes, broad black nose, a scar through one eyebrow, big padded paws and a tail ending in a dark tuft.",
};

const TAWNY = "#c58a45";
const TAWNY_DARK = "#a86f36";
const CREAM = "#f2e0b4";
const BLACK = "#1a1210";
const AMBER = "#f0a020";
const PUPIL = "#1d1008";
const SCAR = "#b5645a";
const BROW = "#8a5a2a";
const TUFT = "#3b2112";
const MANE = ["#f3c962", "#e3a545", "#c27e35", "#8e5220", "#5a3118"];

export default function build() {
  const b = createBuilder({ name: "lion" });
  const r = rng(42);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, -0.55] });
  const chest = b.joint("chest", { at: [0, 1.15, 0.5], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.3, 0.75], parent: chest });
  const head = b.joint("head", { at: [0, 1.5, 1.0], parent: neck });
  const shoulderL = b.joint("shoulderL", { at: [0.22, 1.0, 0.5], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.22, 1.0, 0.5], parent: chest });
  const hindL = b.joint("hindL", { at: [0.22, 0.98, -0.6], parent: hips });
  const hindR = b.joint("hindR", { at: [-0.22, 0.98, -0.6], parent: hips });

  // ---------- helpers ----------
  // A capsule between two points, aligned along the segment.
  const seg = (bone: any, a: number[], c: number[], rad: number, color: string) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const L = A.distanceTo(B);
    const mid = A.clone().add(B).multiplyScalar(0.5);
    const dir = B.clone().sub(A).normalize();
    b.part(
      new THREE.CapsuleGeometry(rad, Math.max(0.01, L - 2 * rad), 4, 10),
      color,
      { at: [mid.x, mid.y, mid.z], dir: [dir.x, dir.y, dir.z], bone: bone },
    );
  };

  const sphere = (bone: any, at: number[], rad: number, color: string, seg = 12) => {
    b.part(new THREE.SphereGeometry(rad, seg, Math.max(6, seg - 4)), color, { at, bone });
  };

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  // ---------- body ----------
  // chest and hindquarters
  seg(chest, [0, 1.1, 0.0], [0, 1.12, 0.5], 0.36, TAWNY);
  seg(hips, [0, 1.08, -0.5], [0, 1.1, 0.0], 0.36, TAWNY);
  sphere(chest, [0, 1.14, 0.55], 0.4, TAWNY, 14);
  sphere(hips, [0, 1.08, -0.55], 0.4, TAWNY, 14);

  // cream belly and chest bib
  seg(hips, [0, 0.95, -0.35], [0, 0.95, 0.35], 0.3, CREAM);
  sphere(chest, [0, 1.0, 0.66], 0.28, CREAM, 12);

  // ---------- neck ----------
  b.sweep(
    [
      [0, 1.3, 0.7],
      [0, 1.42, 0.9],
      [0, 1.5, 0.98],
    ],
    0.2,
    { color: TAWNY },
  );

  // ---------- legs ----------
  const legs: Array<{ bone: any; x: number; upper: number[][]; paw: number[] }> = [
    { bone: shoulderL, x: 0.22, upper: [[0.22, 1.0, 0.5], [0.22, 0.22, 0.6]], paw: [0.22, 0.15, 0.66] },
    { bone: shoulderR, x: -0.22, upper: [[-0.22, 1.0, 0.5], [-0.22, 0.22, 0.6]], paw: [-0.22, 0.15, 0.66] },
  ];
  for (const L of legs) {
    seg(L.bone, L.upper[0], L.upper[1], 0.11, TAWNY);
    sphere(L.bone, L.paw, 0.15, TAWNY_DARK, 12);
    for (const dx of [-0.06, 0, 0.06]) {
      sphere(L.bone, [L.paw[0] + dx, 0.05, L.paw[2] + 0.13], 0.035, BLACK, 6);
    }
  }

  // hind legs: big thigh, long shin, padded paw
  const hinds: Array<{ bone: any; x: number }> = [
    { bone: hindL, x: 0.22 },
    { bone: hindR, x: -0.22 },
  ];
  for (const H of hinds) {
    sphere(H.bone, [H.x, 1.0, -0.6], 0.27, TAWNY, 12);
    seg(H.bone, [H.x, 0.95, -0.62], [H.x * 0.9, 0.2, -0.72], 0.12, TAWNY);
    sphere(H.bone, [H.x * 0.9, 0.15, -0.78], 0.15, TAWNY_DARK, 12);
    for (const dx of [-0.06, 0, 0.06]) {
      sphere(H.bone, [H.x * 0.9 + dx, 0.05, -0.91], 0.035, BLACK, 6);
    }
  }

  // ---------- head ----------
  sphere(head, [0, 1.5, 1.0], 0.27, TAWNY, 16);
  // ears
  sphere(head, [0.2, 1.74, 0.98], 0.07, TAWNY_DARK, 10);
  sphere(head, [-0.2, 1.74, 0.98], 0.07, TAWNY_DARK, 10);
  // muzzle and chin
  sphere(head, [0, 1.43, 1.3], 0.13, CREAM, 12);
  sphere(head, [0, 1.42, 1.37], 0.1, CREAM, 10);
  sphere(head, [0, 1.33, 1.27], 0.1, CREAM, 10);
  // broad black nose
  b.part(new THREE.BoxGeometry(0.13, 0.085, 0.07), BLACK, { at: [0, 1.5, 1.45], bone: head });
  // mouth line
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.02), BLACK, { at: [0, 1.37, 1.39], bone: head });

  // brows
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.08), BROW, { at: [0.1, 1.62, 1.22], bone: head });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.08), BROW, { at: [-0.1, 1.62, 1.22], bone: head });

  // scar across the right eyebrow (lion's right, -X)
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.1, 6), SCAR, {
    at: [-0.1, 1.645, 1.27],
    dir: [0.5, -0.45, 0.2],
    bone: head,
  });

  // amber eyes with dark pupils
  for (const x of [0.1, -0.1]) {
    sphere(head, [x, 1.555, 1.27], 0.045, AMBER, 12);
    sphere(head, [x, 1.555, 1.31], 0.022, PUPIL, 8);
  }

  // ---------- mane ----------
  const HX = 0;
  const HY = 1.5;
  const HZ = 1.0;

  const randomDir = (): number[] => {
    const y = r() * 2 - 1;
    const th = r() * Math.PI * 2;
    const s = Math.sqrt(1 - y * y);
    return [s * Math.cos(th), y, s * Math.sin(th)];
  };

  const strand = (n: number[], len: number, rad: number, base: number) => {
    // golden at the face (+Z), chocolate toward the edges
    const t = clamp((0.75 - n[2]) / 1.5, 0, 1);
    const idx = clamp(Math.round(t * 4 + (r() - 0.5) * 1.2), 0, 4);
    const d = base + len / 2;
    b.part(new THREE.ConeGeometry(rad, len, 5), MANE[idx], {
      at: [HX + n[0] * d, HY + n[1] * d, HZ + n[2] * d],
      dir: n,
      bone: head,
    });
  };

  // outer layer: long strands
  let placed = 0;
  let tries = 0;
  while (placed < 110 && tries < 2000) {
    tries++;
    const n = randomDir();
    if (n[2] > 0.75) continue; // keep the face clear
    strand(n, 0.32 + r() * 0.1, 0.07, 0.2);
    placed++;
  }
  // inner layer: shorter, denser strands for a shaggy look
  placed = 0;
  tries = 0;
  while (placed < 90 && tries < 2000) {
    tries++;
    const n = randomDir();
    if (n[2] > 0.7) continue;
    strand(n, 0.2 + r() * 0.06, 0.06, 0.16);
    placed++;
  }

  // ---------- tail ----------
  const tailPts = [
    [0, 1.05, -0.95],
    [0, 1.02, -1.4],
    [0, 0.8, -1.8],
    [0, 0.45, -2.0],
    [0, 0.2, -2.12],
  ];
  b.chain("tail", tailPts);
  b.sweep(tailPts, 0.06, { color: TAWNY });

  // dark tuft at the tip
  const tip = [0, 0.2, -2.12];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.3;
    const dx = Math.cos(a) * 0.45;
    const dy = -0.5 + r() * 0.2;
    const dz = -0.7 + Math.sin(a) * 0.3;
    const m = Math.hypot(dx, dy, dz);
    const dir = [dx / m, dy / m, dz / m];
    const len = 0.22 + r() * 0.06;
    b.part(new THREE.ConeGeometry(0.06, len, 5), i % 2 ? TUFT : "#4a2c16", {
      at: [
        tip[0] + dir[0] * (len / 2),
        tip[1] + dir[1] * (len / 2),
        tip[2] + dir[2] * (len / 2),
      ],
      dir,
    });
  }

  return b.root;
}
