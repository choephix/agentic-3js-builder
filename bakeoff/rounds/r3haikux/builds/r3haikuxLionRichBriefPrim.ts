import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

type V = [number, number, number];

const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, c: V): number => a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => scl(a, 1 / len(a));
const mid = (a: V, c: V): V => scl(add(a, c), 0.5);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Cubic Bezier samples, used as a smooth path for the neck tube. */
function bezier(p0: V, p1: V, p2: V, p3: V, n: number): V[] {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    out.push([0, 1, 2].map((k) => w[0] * p0[k] + w[1] * p1[k] + w[2] * p2[k] + w[3] * p3[k]) as V);
  }
  return out;
}

// Palette (flat colours)
const tawny = "#c58a3d";
const brow = "#8e5a2a";
const cream = "#f2e2b6";
const earInner = "#e9bf86";
const amber = "#e7a232";
const pupil = "#120a05";
const glint = "#fff6dc";
const black = "#1a1210";
const mouth = "#2a170e";
const scar = "#c97b68";
const grey = "#d2c9b5";
const claw = "#efe4c8";
const chocolate = "#3b2314";
// mane: golden blond at the face -> dark chocolate at the rim
const MANE = ["#ecc35e", "#dca94e", "#bd8238", "#8a5628", "#5c3a20", chocolate];

export const meta = {
  name: "Old Lion",
  description: "A proud, old maned lion resting in sphinx pose with his head held high.",
};

export default function build() {
  const b = createBuilder({ name: "old-lion" });
  type J = ReturnType<typeof b.joint>;
  const rand = rng(1907);
  const jit = (k: number) => (rand() * 2 - 1) * k;

  // ---- primitive helpers: every piece goes through b.part ----
  const ball = (at: V, r: V, color: string, bone: J) =>
    b.part(new THREE.SphereGeometry(1, 14, 10).scale(r[0], r[1], r[2]), color, { at, bone });

  const strut = (a: V, c: V, r: number, color: string, bone: J) => {
    const d = sub(c, a);
    b.part(new THREE.CapsuleGeometry(r, Math.max(0.01, len(d) - 2 * r), 4, 8), color, {
      at: mid(a, c),
      bone,
      dir: unit(d),
    });
  };

  const cone = (base: V, dir: V, L: number, r: number, color: string, bone: J, sides = 5) => {
    const d = unit(dir);
    b.part(new THREE.ConeGeometry(r, L, sides, 1), color, {
      at: add(base, scl(d, L / 2)),
      bone,
      dir: d,
    });
  };

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.5, -0.6] });
  const waist = b.joint("waist", { at: [0, 0.52, -0.08], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.56, 0.36], parent: waist });
  const neck = b.joint("neck", { at: [0, 0.8, 0.64], parent: chest });
  const head = b.joint("head", { at: [0, 1.06, 0.9], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.97, 0.94], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.6, -0.86], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.44, -1.13], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0.1, 0.2, -1.36], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0.3, 0.07, -1.5], parent: tail3 });

  // ---- torso ----
  ball([0, 0.5, -0.66], [0.3, 0.3, 0.28], tawny, hips); // rump
  ball([0, 0.52, -0.08], [0.29, 0.3, 0.3], tawny, waist); // barrel
  ball([0, 0.56, 0.36], [0.3, 0.31, 0.3], tawny, chest); // chest
  ball([0, 0.3, 0.02], [0.25, 0.12, 0.44], cream, waist); // cream underbelly
  ball([0, 0.44, 0.5], [0.2, 0.18, 0.18], cream, chest); // cream chest bib

  // ---- neck: one smooth tube from the chest up into the head ----
  b.sweep(
    bezier([0, 0.6, 0.46], [0, 0.84, 0.6], [0, 0.92, 0.7], [0, 0.98, 0.84], 8),
    0.17,
    { color: tawny, bone: neck },
  );

  // ---- tail: three tapering segments on joints, dark tuft at the tip ----
  strut([0, 0.6, -0.86], [0, 0.44, -1.13], 0.07, tawny, tail1);
  strut([0, 0.44, -1.13], [0.1, 0.2, -1.36], 0.055, tawny, tail2);
  strut([0.1, 0.2, -1.36], [0.3, 0.07, -1.5], 0.045, tawny, tail3);
  const T: V = [0.31, 0.075, -1.53];
  ball(T, [0.07, 0.08, 0.07], chocolate, tail4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const d = unit([Math.cos(a) * 0.9, 0.25, -0.5 + Math.sin(a) * 0.5]);
    cone(add(T, scl(d, 0.04)), d, 0.1, 0.03, chocolate, tail4, 4);
  }

  // ---- legs, mirrored: L = +X (model's left), R = -X ----
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    // foreleg: elbow tucked low, forearm flat ahead, big padded paw
    const sh = b.joint("shoulder" + k, { at: P(0.2, 0.5, 0.32), parent: chest });
    const el = b.joint("elbow" + k, { at: P(0.2, 0.1, 0.44), parent: sh });
    const wr = b.joint("wrist" + k, { at: P(0.2, 0.05, 0.8), parent: el });
    strut(P(0.2, 0.5, 0.32), P(0.2, 0.1, 0.44), 0.09, tawny, sh);
    strut(P(0.2, 0.1, 0.44), P(0.2, 0.05, 0.8), 0.068, tawny, el);
    ball(P(0.2, 0.045, 0.9), [0.11, 0.05, 0.13], tawny, wr);
    for (const o of [-0.06, -0.02, 0.02, 0.06]) {
      ball(P(0.2 + o, 0.036, 1.0), [0.03, 0.03, 0.03], cream, wr);
      cone(P(0.2 + o, 0.04, 1.02), [0, -0.15, 1], 0.035, 0.009, claw, wr, 4);
    }

    // hind leg folded under the haunch: thigh, knee forward, hock behind, foot flat ahead
    const hp = b.joint("hip" + k, { at: P(0.22, 0.46, -0.66), parent: hips });
    const kn = b.joint("knee" + k, { at: P(0.24, 0.2, -0.5), parent: hp });
    const hk = b.joint("hock" + k, { at: P(0.2, 0.09, -0.84), parent: kn });
    const ft = b.joint("foot" + k, { at: P(0.2, 0.04, -0.52), parent: hk });
    ball(P(0.24, 0.36, -0.6), [0.16, 0.19, 0.22], tawny, hp);
    strut(P(0.24, 0.2, -0.5), P(0.2, 0.09, -0.84), 0.065, tawny, kn);
    ball(P(0.2, 0.075, -0.84), [0.07, 0.07, 0.07], tawny, hk);
    ball(P(0.2, 0.045, -0.62), [0.09, 0.045, 0.12], tawny, ft);
    for (const o of [-0.06, -0.02, 0.02, 0.06]) {
      ball(P(0.2 + o, 0.036, -0.5), [0.03, 0.03, 0.03], cream, ft);
      cone(P(0.2 + o, 0.04, -0.48), [0, -0.15, 1], 0.035, 0.009, claw, ft, 4);
    }
  }

  // ---- head ----
  ball([0, 1.07, 0.88], [0.15, 0.15, 0.16], tawny, head); // skull
  ball([0, 1.01, 1.09], [0.1, 0.085, 0.12], cream, head); // muzzle
  ball([0, 1.065, 1.2], [0.07, 0.042, 0.035], black, head); // broad black nose
  ball([0, 1.17, 1.01], [0.13, 0.03, 0.035], brow, head); // brow ridge
  ball([0, 0.93, 1.13], [0.05, 0.012, 0.06], mouth, head); // mouth seam
  strut([0.085, 1.195, 1.04], [0.125, 1.145, 1.02], 0.008, scar, head); // scar through one brow
  for (const s of [1, -1]) {
    const x = s * 0.072;
    ball([x, 1.135, 1.025], [0.034, 0.03, 0.022], amber, head); // amber eye
    ball([x, 1.135, 1.045], [0.016, 0.02, 0.01], pupil, head);
    ball([x + s * 0.008, 1.146, 1.053], [0.006, 0.006, 0.005], glint, head);
    ball([s * 0.075, 1.02, 1.16], [0.013, 0.013, 0.013], black, head); // whisker dot
    ball([s * 0.1, 1.23, 0.84], [0.05, 0.05, 0.025], tawny, head); // ear
    ball([s * 0.1, 1.23, 0.855], [0.03, 0.03, 0.012], earInner, head);
  }

  // ---- lower jaw, hinged at the jaw joint, with a grey old-lion beard ----
  ball([0, 0.955, 1.08], [0.07, 0.04, 0.1], cream, jaw);
  for (const x of [-0.03, 0, 0.03]) {
    cone([x, 0.92, 1.14], [0, -1, 0.1], 0.06, 0.018, grey, jaw, 4);
  }

  // ---- mane: two shells of shaggy tufts, golden at the face, chocolate at the rim ----
  const H: V = [0, 1.06, 0.9];
  const earDirs = [unit([0.1, 0.17, -0.06]), unit([-0.1, 0.17, -0.06])];
  const RINGS = [55, 67, 80, 94, 108, 122, 137, 152];
  for (let layer = 0; layer < 2; layer++) {
    const R = layer === 0 ? 0.165 : 0.2;
    const tuftLen = layer === 0 ? 0.15 : 0.19;
    for (const deg of RINGS) {
      const phi = (deg * Math.PI) / 180;
      const sp = Math.sin(phi);
      const cp = Math.cos(phi);
      const n = Math.max(6, Math.round((2 * Math.PI * R * sp) / 0.065));
      const t = (deg - 55) / 97; // 0 at the face, 1 at the back of the mane
      for (let k = 0; k < n; k++) {
        const th = ((k + layer * 0.5) / n) * Math.PI * 2 + jit(0.12);
        const N: V = [sp * Math.cos(th), sp * Math.sin(th), cp];
        if (deg < 90 && N[1] < -0.35) continue; // keep the chin free for the beard
        if (earDirs.some((e) => dot(N, e) > 0.93)) continue; // keep the ears clear
        const base = add(H, scl(N, R + jit(0.012)));
        const dir = unit([N[0] + jit(0.12), N[1] - 0.03 + jit(0.12), N[2] - 0.32 + jit(0.12)]);
        const L = tuftLen * (0.85 + rand() * 0.3);
        const idx = clamp(Math.round(t * 5 + layer * 0.7 + jit(0.6)), 0, 5);
        cone(base, dir, L, 0.042, MANE[idx], head, 5);
      }
    }
  }

  return b.root;
}
