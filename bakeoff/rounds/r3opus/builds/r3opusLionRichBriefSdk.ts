import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old male lion standing in a neutral rest pose with his head held high. A huge shaggy mane fades from golden blond at the face to dark chocolate at the edges. He has a tawny body, cream belly and muzzle, amber eyes, a broad black nose, a scar across his right eyebrow, big padded paws and a long tail ending in a dark tuft.",
};

type V = number[];
const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const midp = (a: V, c: V): V => scl(add(a, c), 0.5);

function mulberry(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build() {
  const b = createBuilder({ name: "old_lion" });

  const R: any = rng(1987);
  const rand: () => number =
    typeof R === "function"
      ? () => R()
      : R && typeof R.next === "function"
        ? () => R.next()
        : R && typeof R.float === "function"
          ? () => R.float()
          : mulberry(1987);
  const jit = (s: number) => (rand() - 0.5) * 2 * s;

  // ---------- palette ----------
  const TAWNY = "#c98f48";
  const TAWNY_D = "#a8723a";
  const TAWNY_L = "#ddb06c";
  const CREAM = "#f1dfb6";
  const CREAM_L = "#f8ecd2";
  const NOSE = "#1c1512";
  const AMBER = "#e8961a";
  const PUPIL = "#120a06";
  const HIGHLIGHT = "#fff8e6";
  const EYE_RIM = "#2a1a10";
  const SCAR = "#e0a090";
  const SCAR_D = "#7e3e32";
  const CLAW = "#ece2c8";
  const PAD = "#3a2a26";
  const TOOTH = "#f3ecd8";
  const MOUTH = "#3b1a16";
  const WHISKER = "#f7f1e3";
  const TUFT = "#2e1a10";
  const EAR_BACK = "#3a2416";
  const MANE = ["#f2c85e", "#e2a846", "#c8853a", "#9c5d2b", "#72401f", "#4c2915", "#38200f"];

  const setRole = (j: any, role: string) => {
    if (j && j.userData) j.userData.role = role;
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, -0.6] });
  setRole(hips, "spine");
  const spine = b.joint("spine", { at: [0, 1.02, -0.12], parent: hips });
  setRole(spine, "spine");
  const chest = b.joint("chest", { at: [0, 1.08, 0.38], parent: spine });
  setRole(chest, "spine");
  const neck = b.joint("neck", { at: [0, 1.3, 0.72], parent: chest });
  setRole(neck, "neck");
  const head = b.joint("head", { at: [0, 1.62, 0.98], parent: neck });
  setRole(head, "head");
  const jaw = b.joint("jaw", { at: [0, 1.53, 1.08], parent: head });
  setRole(jaw, "jaw");

  type Leg = { a: any; b: any; c: any; d: any; pts: V[] };
  const legs: { front: Leg; hind: Leg; s: number }[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fp: V[] = [
      [s * 0.22, 1.02, 0.45],
      [s * 0.235, 0.6, 0.42],
      [s * 0.235, 0.17, 0.48],
      [s * 0.235, 0.08, 0.55],
    ];
    const sh = b.joint("shoulder" + L, { at: fp[0], parent: chest });
    const el = b.joint("elbow" + L, { at: fp[1], parent: sh });
    const wr = b.joint("wrist" + L, { at: fp[2], parent: el });
    const pw = b.joint("paw" + L, { at: fp[3], parent: wr });
    [sh, el, wr, pw].forEach((j) => setRole(j, "leg"));

    const hp: V[] = [
      [s * 0.21, 0.98, -0.62],
      [s * 0.235, 0.6, -0.42],
      [s * 0.23, 0.27, -0.74],
      [s * 0.23, 0.07, -0.64],
    ];
    const hi = b.joint("hip" + L, { at: hp[0], parent: hips });
    const kn = b.joint("knee" + L, { at: hp[1], parent: hi });
    const ho = b.joint("hock" + L, { at: hp[2], parent: kn });
    const ft = b.joint("foot" + L, { at: hp[3], parent: ho });
    [hi, kn, ho, ft].forEach((j) => setRole(j, "leg"));

    legs.push({
      s,
      front: { a: sh, b: el, c: wr, d: pw, pts: fp },
      hind: { a: hi, b: kn, c: ho, d: ft, pts: hp },
    });
  }

  const T: V[] = [
    [0, 1.03, -0.9],
    [0, 0.92, -1.12],
    [0, 0.77, -1.34],
    [0, 0.63, -1.56],
    [0, 0.55, -1.78],
    [0, 0.53, -1.98],
    [0, 0.58, -2.14],
  ];
  const tailJ: any[] = [];
  T.forEach((p, i) => {
    const j = b.joint("tail" + i, { at: p, parent: i === 0 ? hips : tailJ[i - 1] });
    setRole(j, "tail");
    tailJ.push(j);
  });

  // ---------- helpers ----------
  const blob = (color: string, at: V, s: V, bone: any, dir?: V, detail = 1) =>
    b.part(new THREE.IcosahedronGeometry(1, detail), color, dir ? { at, scale: s, bone, dir } : { at, scale: s, bone });
  const ball = (color: string, at: V, r: number, bone: any, detail = 1) =>
    b.part(new THREE.IcosahedronGeometry(r, detail), color, { at, bone });
  const seg = (color: string, a: V, c: V, r0: number, r1: number, bone: any, sides = 7) => {
    const d = sub(c, a);
    b.part(new THREE.CylinderGeometry(r1, r0, len(d), sides), color, { at: midp(a, c), dir: norm(d), bone });
  };
  const cone = (color: string, base: V, dir: V, L: number, r: number, bone: any, sides = 5) => {
    const d = norm(dir);
    b.part(new THREE.ConeGeometry(r, L, sides), color, { at: add(base, scl(d, L * 0.5)), dir: d, bone });
  };

  // ---------- body ----------
  blob(TAWNY, [0, 1.03, 0.38], [0.31, 0.35, 0.42], chest);
  blob(TAWNY, [0, 0.99, -0.12], [0.28, 0.29, 0.46], spine);
  blob(TAWNY, [0, 1.0, -0.6], [0.28, 0.31, 0.36], hips);
  blob(TAWNY_D, [0, 1.16, -0.2], [0.15, 0.13, 0.55], spine);
  blob(CREAM, [0, 0.8, -0.05], [0.21, 0.13, 0.52], spine);
  blob(CREAM, [0, 0.82, 0.32], [0.2, 0.14, 0.3], chest);
  for (const s of [1, -1]) {
    blob(TAWNY_L, [s * 0.2, 1.18, 0.34], [0.11, 0.14, 0.18], chest);
    blob(TAWNY_L, [s * 0.18, 1.12, -0.62], [0.12, 0.15, 0.2], hips);
  }
  // belly fringe: dark shaggy fur hanging under the belly
  for (let i = 0; i < 16; i++) {
    const z = 0.38 - i * 0.05;
    const x = jit(0.12);
    const c = i % 3 === 0 ? MANE[5] : MANE[4];
    cone(c, [x, 0.73 + jit(0.02), z], [jit(0.2), -1, -0.25], 0.11 + rand() * 0.06, 0.035, i < 7 ? chest : spine, 4);
  }

  // ---------- legs ----------
  for (const { s, front, hind } of legs) {
    const fp = front.pts;
    const hp = hind.pts;
    // front leg
    const ua = add(fp[0], [0, 0.04, 0]);
    blob(TAWNY, midp(ua, fp[1]), [0.125, len(sub(fp[1], ua)) * 0.6, 0.16], front.a, norm(sub(fp[1], ua)));
    seg(TAWNY, fp[1], fp[2], 0.088, 0.07, front.b);
    ball(TAWNY, fp[1], 0.088, front.b);
    ball(TAWNY_L, fp[2], 0.074, front.c);
    cone(MANE[5], add(fp[1], [0, 0.02, -0.06]), [0, -0.6, -1], 0.09, 0.03, front.b, 4);
    // hind leg
    const ha = add(hp[0], [0, 0.04, 0]);
    blob(TAWNY, midp(ha, hp[1]), [0.145, len(sub(hp[1], ha)) * 0.62, 0.21], hind.a, norm(sub(hp[1], ha)));
    seg(TAWNY, hp[1], hp[2], 0.085, 0.062, hind.b);
    ball(TAWNY, hp[1], 0.085, hind.b);
    ball(TAWNY_L, hp[2], 0.064, hind.c);
    seg(TAWNY, hp[2], add(hp[3], [0, 0.02, 0]), 0.062, 0.058, hind.c);

    // big padded paws
    const paws: { z: number; bone: any; big: number }[] = [
      { z: 0.58, bone: front.d, big: 1.0 },
      { z: -0.58, bone: hind.d, big: 0.9 },
    ];
    for (const p of paws) {
      const x = s * 0.235;
      const k = p.big;
      blob(TAWNY, [x, 0.075 * k, p.z], [0.115 * k, 0.075 * k, 0.14 * k], p.bone);
      blob(TAWNY_L, [x, 0.11 * k, p.z - 0.02], [0.095 * k, 0.05 * k, 0.1 * k], p.bone);
      blob(PAD, [x, 0.022, p.z - 0.08 * k], [0.06 * k, 0.024, 0.045 * k], p.bone);
      const offs = [-0.072, -0.024, 0.024, 0.072];
      offs.forEach((o, i) => {
        const tz = p.z + 0.095 * k - (i === 0 || i === 3 ? 0.012 : 0);
        const tp: V = [x + o * k, 0.045 * k, tz];
        blob(TAWNY, tp, [0.044 * k, 0.045 * k, 0.05 * k], p.bone);
        blob(CREAM, add(tp, [0, 0.022 * k, 0.012]), [0.022 * k, 0.014 * k, 0.026 * k], p.bone);
        cone(CLAW, add(tp, [0, -0.012, 0.042 * k]), [0, -0.45, 1], 0.026, 0.008, p.bone, 4);
      });
    }
  }

  // ---------- tail ----------
  for (let i = 0; i < T.length - 1; i++) {
    const r0 = 0.058 - i * 0.0045;
    const r1 = 0.058 - (i + 1) * 0.0045;
    seg(i % 2 ? TAWNY : TAWNY_L, T[i], T[i + 1], r0, r1, tailJ[i], 7);
    ball(TAWNY, T[i + 1], r1 * 1.02, tailJ[i + 1]);
  }
  {
    const end = T[T.length - 1];
    const d = norm(sub(end, T[T.length - 2]));
    const last = tailJ[tailJ.length - 1];
    blob(TUFT, add(end, scl(d, 0.07)), [0.06, 0.1, 0.06], last, d);
    for (let i = 0; i < 9; i++) {
      const dd = norm(add(d, [jit(0.7), jit(0.7), jit(0.3)]));
      cone(i % 3 === 0 ? MANE[5] : TUFT, add(end, scl(d, 0.03)), dd, 0.15 + rand() * 0.05, 0.035, last, 4);
    }
  }

  // ---------- head ----------
  blob(TAWNY, [0, 1.68, 1.0], [0.2, 0.19, 0.21], head);
  blob(TAWNY_D, [0, 1.745, 1.15], [0.16, 0.035, 0.06], head);
  blob(TAWNY_D, [0, 1.665, 1.22], [0.066, 0.05, 0.11], head);
  for (const s of [1, -1]) blob(TAWNY, [s * 0.11, 1.6, 1.12], [0.08, 0.085, 0.08], head);
  blob(CREAM, [0, 1.57, 1.2], [0.11, 0.075, 0.12], head);
  blob(CREAM_L, [0, 1.63, 1.27], [0.05, 0.03, 0.06], head);
  for (const s of [1, -1]) {
    const pad: V = [s * 0.048, 1.555, 1.27];
    ball(CREAM_L, pad, 0.052, head);
    // whisker spots
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const d = norm([s * (0.35 + 0.22 * c), -0.25 + 0.2 * r, 0.9]);
        ball(TAWNY_D, add(pad, scl(d, 0.051)), 0.0055, head, 0);
      }
    // whiskers
    for (let j = 0; j < 4; j++) {
      const base: V = [s * 0.085, 1.535 + j * 0.013, 1.285];
      const d = norm([s, 0.2 - j * 0.12, 0.3]);
      b.part(new THREE.CylinderGeometry(0.0012, 0.0022, 0.22, 3), WHISKER, {
        at: add(base, scl(d, 0.11)),
        dir: d,
        bone: head,
      });
    }
  }
  // nose
  blob(NOSE, [0, 1.613, 1.315], [0.058, 0.032, 0.03], head);
  blob(NOSE, [0, 1.632, 1.3], [0.045, 0.02, 0.03], head);
  b.part(new THREE.BoxGeometry(0.006, 0.05, 0.006), NOSE, { at: [0, 1.56, 1.318], bone: head });
  blob(MOUTH, [0, 1.506, 1.24], [0.09, 0.008, 0.07], head);
  // upper canines
  for (const s of [1, -1]) {
    const g = new THREE.ConeGeometry(0.01, 0.04, 4);
    g.rotateX(Math.PI);
    b.part(g, TOOTH, { at: [s * 0.034, 1.497, 1.285], bone: head });
  }

  // eyes
  for (const s of [1, -1]) {
    const eye: V = [s * 0.085, 1.705, 1.17];
    const ed = norm([s * 0.3, 0.05, 1]);
    b.part(new THREE.IcosahedronGeometry(0.03, 2), AMBER, { at: eye, bone: head });
    ball(PUPIL, add(eye, scl(ed, 0.021)), 0.013, head, 2);
    ball(HIGHLIGHT, add(eye, scl(norm(add(ed, [-s * 0.25, 0.35, 0])), 0.03)), 0.0055, head, 1);
    const rim = new THREE.TorusGeometry(0.03, 0.006, 4, 12);
    rim.rotateY(s * 0.3);
    b.part(rim, EYE_RIM, { at: add(eye, scl(ed, 0.008)), bone: head });
    blob(TAWNY_D, add(eye, [0, 0.02, 0.004]), [0.038, 0.016, 0.032], head);
    blob(CREAM_L, [s * 0.088, 1.676, 1.182], [0.034, 0.011, 0.02], head);
    blob(EYE_RIM, [s * 0.058, 1.672, 1.2], [0.005, 0.02, 0.005], head, [s * 0.2, 1, 0.1], 0);
  }

  // scar across the right eyebrow (-X)
  {
    const sp: V[] = [
      [-0.138, 1.795, 1.12],
      [-0.105, 1.758, 1.198],
      [-0.075, 1.722, 1.212],
      [-0.05, 1.668, 1.205],
    ];
    for (let i = 0; i < sp.length - 1; i++) {
      const a = sp[i];
      const c = sp[i + 1];
      const d = sub(c, a);
      b.part(new THREE.BoxGeometry(0.02, len(d) + 0.01, 0.008), SCAR_D, { at: midp(a, c), dir: norm(d), bone: head });
      b.part(new THREE.BoxGeometry(0.011, len(d) + 0.012, 0.008), SCAR, {
        at: add(midp(a, c), [0, 0, 0.004]),
        dir: norm(d),
        bone: head,
      });
    }
    // two cross-nicks on the scar
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.006), SCAR, { at: [-0.12, 1.778, 1.17], bone: head });
    b.part(new THREE.BoxGeometry(0.026, 0.006, 0.006), SCAR, { at: [-0.06, 1.69, 1.212], bone: head });
  }

  // ears
  for (const s of [1, -1]) {
    const back = new THREE.CylinderGeometry(0.058, 0.058, 0.02, 9);
    back.rotateX(Math.PI / 2);
    back.rotateZ(-s * 0.35);
    b.part(back, EAR_BACK, { at: [s * 0.15, 1.85, 0.99], bone: head });
    const front = new THREE.CylinderGeometry(0.052, 0.052, 0.02, 9);
    front.rotateX(Math.PI / 2);
    front.rotateZ(-s * 0.35);
    b.part(front, TAWNY, { at: [s * 0.15, 1.85, 1.0], bone: head });
    const inner = new THREE.CylinderGeometry(0.032, 0.032, 0.012, 8);
    inner.rotateX(Math.PI / 2);
    b.part(inner, CREAM, { at: [s * 0.148, 1.845, 1.012], bone: head });
  }

  // lower jaw
  blob(CREAM, [0, 1.477, 1.17], [0.08, 0.04, 0.1], jaw);
  blob(MOUTH, [0, 1.5, 1.15], [0.07, 0.015, 0.08], jaw);
  for (const s of [1, -1]) b.part(new THREE.ConeGeometry(0.008, 0.03, 4), TOOTH, { at: [s * 0.03, 1.51, 1.24], bone: jaw });
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.025;
    cone(i % 2 ? CREAM : MANE[0], [x, 1.45, 1.15 - Math.abs(x) * 0.5], [x * 2, -1, 0.2], 0.08, 0.022, jaw, 4);
  }

  // ---------- mane ----------
  // dark volume behind the tufts so the mane reads full from any angle
  blob(MANE[4], [0, 1.55, 0.74], [0.46, 0.5, 0.3], neck);
  blob(MANE[5], [0, 1.32, 0.52], [0.38, 0.42, 0.4], neck);
  blob(MANE[3], [0, 1.08, 0.7], [0.24, 0.32, 0.18], chest);

  // concentric rings around the face: golden inside, chocolate at the edges
  for (let k = 0; k < 6; k++) {
    const count = 12 + k * 4;
    const rb = 0.19 + k * 0.06;
    const z = 0.99 - k * 0.075;
    const L = 0.15 + k * 0.04;
    const rad = 0.055 + k * 0.009;
    for (let i = 0; i < count; i++) {
      const th = ((i + (k % 2) * 0.5) / count) * Math.PI * 2 + jit(0.1);
      const cx = Math.cos(th);
      const sy = Math.sin(th);
      const base: V = [cx * rb * 1.05, 1.6 + sy * rb * 1.12, z + jit(0.02)];
      const d = norm([cx + jit(0.15), sy * 0.9 - 0.25 - (sy < 0 ? 0.35 : 0) + jit(0.15), -(0.3 + 0.1 * k) + jit(0.1)]);
      const ci = Math.min(MANE.length - 1, Math.max(0, k + (rand() < 0.2 ? 1 : 0) - (rand() < 0.12 ? 1 : 0)));
      cone(MANE[ci], base, d, L * (0.85 + rand() * 0.3), rad, k < 3 ? head : neck, 5);
    }
  }
  // forelock on the crown
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.04;
    cone(i % 2 ? MANE[0] : MANE[1], [x, 1.82, 1.0 - Math.abs(x) * 0.3], [x * 2.5, 1, -0.7], 0.16, 0.04, head, 5);
  }
  // shaggy scatter over the neck, shoulders and back of the mane
  const blobs: { c: V; s: V }[] = [
    { c: [0, 1.55, 0.74], s: [0.46, 0.5, 0.3] },
    { c: [0, 1.32, 0.52], s: [0.38, 0.42, 0.4] },
  ];
  let placed = 0;
  let tries = 0;
  while (placed < 80 && tries < 1000) {
    tries++;
    const bl = blobs[placed % 2];
    const n = norm([jit(1), jit(1), jit(1)]);
    if (n[2] > 0.45 || n[1] < -0.35) continue;
    const p = add(bl.c, [n[0] * bl.s[0] * 0.95, n[1] * bl.s[1] * 0.95, n[2] * bl.s[2] * 0.95]);
    const d = norm(add(n, [jit(0.2), -0.35, -0.25]));
    const ci = 3 + Math.floor(rand() * 4);
    cone(MANE[Math.min(ci, MANE.length - 1)], p, d, 0.17 + rand() * 0.1, 0.07 + rand() * 0.02, neck, 5);
    placed++;
  }
  // chest bib hanging between the forelegs
  for (let i = 0; i < 16; i++) {
    const x = jit(0.2);
    const y = 0.86 + rand() * 0.34;
    const p: V = [x, y, 0.82 - Math.abs(x) * 0.4 + jit(0.02)];
    const ci = y > 1.05 ? 3 : 4 + Math.floor(rand() * 2);
    cone(MANE[ci], p, [x * 0.8 + jit(0.15), -1, 0.3], 0.15 + rand() * 0.07, 0.05, chest, 5);
  }

  return b.root;
}
