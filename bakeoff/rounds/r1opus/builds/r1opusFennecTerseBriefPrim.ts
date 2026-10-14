import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox in a rest pose: huge faceted ears with pink inner ears and white fur tufts, dark almond eyes with tear streaks, a separate upper and lower jaw, a sandy saddle over a cream belly, slender legs with furry paws and a bushy faceted tail with a dark tip.",
};

type T3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "fennecFox" });

  // ---------- palette ----------
  const SAND = "#E6BC82";
  const SADDLE = "#CF9A5C";
  const CREAM = "#F7E8CF";
  const WHITE = "#FFF8EC";
  const PINK = "#E7A39A";
  const DARK = "#2B1C15";
  const BROWN = "#9A6338";
  const NOSE = "#1B1414";
  const SHINE = "#FFFFFF";
  const CLAW = "#4A3A30";

  const V = (p: T3) => new THREE.Vector3(p[0], p[1], p[2]);

  // ellipsoid part; the scale's Y follows `dir` when given
  const oval = (
    at: T3,
    radii: T3,
    color: string,
    bone: any,
    dir?: T3,
    seg: [number, number] = [9, 7],
  ) => {
    const g = new THREE.SphereGeometry(1, seg[0], seg[1]);
    const opts: any = { at, scale: radii, bone };
    if (dir) opts.dir = dir;
    return b.part(g, color, opts);
  };

  // tapered cylinder from a to c
  const rod = (a: T3, c: T3, r0: number, r1: number, color: string, bone: any, seg = 7) => {
    const A = V(a);
    const B = V(c);
    const len = A.distanceTo(B);
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    return b.part(g, color, {
      at: A.clone().add(B).multiplyScalar(0.5),
      dir: B.clone().sub(A),
      bone,
    });
  };

  // cone with its base at `base`, pointing along dir
  const cone = (
    base: T3,
    dir: T3,
    len: number,
    r: number,
    color: string,
    bone: any,
    seg = 5,
    scale?: T3,
  ) => {
    const d = V(dir).normalize();
    const c = V(base).add(d.clone().multiplyScalar(len / 2));
    const g = new THREE.ConeGeometry(r, len, seg);
    const opts: any = { at: c, dir: d, bone };
    if (scale) opts.scale = scale;
    return b.part(g, color, opts);
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.17, -0.08] });
  const spine1 = b.joint("spine1", { at: [0, 0.178, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.185, 0.08], parent: spine1 });
  const neck = b.joint("neck", { at: [0, 0.212, 0.12], parent: chest });
  const head = b.joint("head", { at: [0, 0.255, 0.155], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.243, 0.19], parent: head });
  const earL = b.joint("earL", { at: [0.03, 0.292, 0.152], parent: head });
  const earR = b.joint("earR", { at: [-0.03, 0.292, 0.152], parent: head });

  const tailPts: T3[] = [
    [0, 0.182, -0.17],
    [0, 0.172, -0.23],
    [0, 0.163, -0.29],
    [0, 0.158, -0.35],
    [0, 0.158, -0.405],
  ];
  const tails: any[] = [];
  tailPts.forEach((p, i) => {
    tails.push(b.joint(`tail${i + 1}`, { at: p, parent: i === 0 ? hips : tails[i - 1] }));
  });

  // ---------- torso ----------
  oval([0, 0.176, -0.01], [0.07, 0.068, 0.13], SAND, spine1);
  oval([0, 0.19, -0.025], [0.06, 0.06, 0.112], SADDLE, spine1); // darker saddle peeking over the back
  oval([0, 0.156, 0.0], [0.058, 0.054, 0.108], CREAM, spine1); // pale belly underneath
  oval([0, 0.18, -0.09], [0.064, 0.064, 0.06], SAND, hips); // rump
  oval([0, 0.185, 0.07], [0.058, 0.065, 0.06], SAND, chest);
  oval([0, 0.172, 0.105], [0.042, 0.055, 0.036], WHITE, chest); // chest bib
  oval([0, 0.218, 0.122], [0.038, 0.048, 0.042], SAND, neck, [0, 1, 0.6]);
  oval([0, 0.205, 0.14], [0.03, 0.04, 0.025], WHITE, neck, [0, 1, 0.5]); // throat
  // ruff tufts at the neck
  for (const s of [1, -1]) {
    cone([s * 0.03, 0.215, 0.12], [s * 0.8, -0.3, -0.5], 0.03, 0.012, CREAM, neck, 4);
    cone([s * 0.034, 0.2, 0.11], [s * 0.7, -0.6, -0.4], 0.026, 0.011, CREAM, neck, 4);
  }

  // ---------- head ----------
  oval([0, 0.265, 0.165], [0.052, 0.045, 0.048], SAND, head);
  oval([0, 0.282, 0.16], [0.042, 0.03, 0.04], SADDLE, head); // crown
  // cheek fluff
  for (const s of [1, -1]) {
    oval([s * 0.036, 0.25, 0.18], [0.024, 0.02, 0.024], WHITE, head);
    cone([s * 0.05, 0.25, 0.17], [s, -0.35, -0.4], 0.028, 0.012, WHITE, head, 4);
    cone([s * 0.045, 0.24, 0.165], [s * 0.7, -0.7, -0.3], 0.024, 0.01, WHITE, head, 4);
  }
  // upper muzzle (head) and lower jaw
  cone([0, 0.254, 0.195], [0, -0.08, 1], 0.062, 0.024, CREAM, head, 6, [1, 1, 0.72]);
  cone([0, 0.262, 0.19], [0, -0.2, 1], 0.05, 0.016, SAND, head, 5, [1, 1, 0.6]); // muzzle bridge
  oval([0, 0.253, 0.255], [0.009, 0.007, 0.007], NOSE, head, undefined, [7, 5]);
  oval([0.003, 0.256, 0.26], [0.0025, 0.0018, 0.0015], SHINE, head, undefined, [5, 4]);
  cone([0, 0.238, 0.19], [0, -0.2, 1], 0.05, 0.015, WHITE, jaw, 5, [1, 1, 0.6]);
  rod([0, 0.244, 0.205], [0, 0.243, 0.24], 0.0015, 0.0012, DARK, jaw, 4); // lip line

  // eyes, highlights, tear streaks, brows, whiskers
  for (const s of [1, -1]) {
    oval([s * 0.025, 0.274, 0.202], [0.012, 0.009, 0.006], WHITE, head, undefined, [8, 6]); // pale eye ring
    oval([s * 0.025, 0.274, 0.205], [0.0105, 0.0078, 0.006], DARK, head, undefined, [8, 6]);
    oval([s * 0.022, 0.278, 0.2105], [0.0028, 0.0028, 0.0015], SHINE, head, undefined, [5, 4]);
    oval([s * 0.016, 0.262, 0.214], [0.0035, 0.012, 0.003], BROWN, head, [s * 0.4, 1, 0.3]);
    oval([s * 0.026, 0.287, 0.198], [0.009, 0.003, 0.004], WHITE, head, [s, 0.2, 0]); // brow
    for (let k = 0; k < 3; k++) {
      const st: T3 = [s * 0.013, 0.249 - k * 0.003, 0.238];
      const d = V([s, 0.15 - k * 0.15, 0.25 - k * 0.1]).normalize();
      const en = V(st).add(d.multiplyScalar(0.06));
      rod(st, [en.x, en.y, en.z], 0.0009, 0.0004, DARK, head, 3);
    }
  }

  // ---------- ears ----------
  for (const [s, ej] of [
    [1, earL],
    [-1, earR],
  ] as [number, any][]) {
    const dir: T3 = [s * 0.5, 1, -0.12];
    const base: T3 = [s * 0.03, 0.288, 0.152];
    cone(base, dir, 0.135, 0.043, SAND, ej, 4, [1, 1, 0.4]);
    cone([base[0], base[1] + 0.003, base[2] + 0.009], dir, 0.118, 0.034, PINK, ej, 4, [1, 1, 0.3]);
    cone([base[0] - s * 0.002, base[1] + 0.06, base[2] + 0.011], dir, 0.06, 0.007, DARK, ej, 4, [1, 1, 0.3]); // dark tip shading
    // white fur tufts inside the ear
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * 0.009;
      cone(
        [base[0] + off * 0.9, base[1] + 0.004 - Math.abs(off) * 0.3, base[2] + 0.014],
        [s * 0.4 + off * 8, 1, 0.12],
        0.045 - Math.abs(off),
        0.005,
        WHITE,
        ej,
        3,
      );
    }
    // ear rim fluff
    cone([base[0] + s * 0.02, base[1] - 0.005, base[2] - 0.004], [s, 0.6, -0.2], 0.03, 0.01, SADDLE, ej, 4);
  }

  // ---------- legs ----------
  for (const [s, sfx] of [
    [1, "L"],
    [-1, "R"],
  ] as [number, string][]) {
    const x = s * 0.043;
    // front leg
    const sh = b.joint(`shoulder${sfx}`, { at: [x, 0.16, 0.08], parent: chest });
    const el = b.joint(`elbow${sfx}`, { at: [x, 0.09, 0.074], parent: sh });
    const wr = b.joint(`wrist${sfx}`, { at: [x, 0.03, 0.084], parent: el });
    const pw = b.joint(`paw${sfx}`, { at: [x, 0.012, 0.1], parent: wr });
    oval([x, 0.15, 0.08], [0.026, 0.045, 0.032], SAND, sh);
    rod([x, 0.15, 0.08], [x, 0.09, 0.074], 0.019, 0.013, SAND, sh);
    oval([x, 0.09, 0.074], [0.013, 0.014, 0.013], SAND, el, undefined, [7, 5]);
    rod([x, 0.09, 0.074], [x, 0.03, 0.084], 0.012, 0.01, CREAM, el);
    oval([x, 0.03, 0.084], [0.011, 0.012, 0.011], CREAM, wr, undefined, [7, 5]);
    // hind leg
    const hp = b.joint(`hip${sfx}`, { at: [s * 0.047, 0.16, -0.1], parent: hips });
    const kn = b.joint(`knee${sfx}`, { at: [s * 0.05, 0.1, -0.07], parent: hp });
    const hk = b.joint(`hock${sfx}`, { at: [s * 0.05, 0.048, -0.122], parent: kn });
    const ft = b.joint(`foot${sfx}`, { at: [s * 0.05, 0.012, -0.105], parent: hk });
    const hx = s * 0.05;
    oval([s * 0.05, 0.14, -0.09], [0.032, 0.05, 0.046], SAND, hp, [0, 1, 0.3]);
    rod([hx, 0.12, -0.085], [hx, 0.1, -0.07], 0.022, 0.016, SAND, hp);
    oval([hx, 0.1, -0.07], [0.016, 0.016, 0.016], SAND, kn, undefined, [7, 5]);
    rod([hx, 0.1, -0.07], [hx, 0.048, -0.122], 0.015, 0.01, SAND, kn);
    oval([hx, 0.048, -0.122], [0.011, 0.012, 0.012], CREAM, hk, undefined, [7, 5]);
    rod([hx, 0.048, -0.122], [hx, 0.016, -0.112], 0.01, 0.01, CREAM, hk);

    // paws with toes and claws
    for (const [px, pz, bone] of [
      [x, 0.1, pw],
      [hx, -0.105, ft],
    ] as [number, number, any][]) {
      oval([px, 0.011, pz], [0.014, 0.011, 0.02], CREAM, bone, undefined, [8, 6]);
      for (let k = -1; k <= 1; k++) {
        const tx = px + k * 0.008;
        const tz = pz + 0.017 - Math.abs(k) * 0.003;
        oval([tx, 0.007, tz], [0.0055, 0.0065, 0.0065], WHITE, bone, undefined, [6, 4]);
        cone([tx, 0.005, tz + 0.005], [0, -0.3, 1], 0.006, 0.0018, CLAW, bone, 4);
      }
    }
  }

  // ---------- tail ----------
  const tailR = [0.03, 0.042, 0.048, 0.044];
  for (let i = 0; i < 4; i++) {
    const a = V(tailPts[i]);
    const c = V(tailPts[i + 1]);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    const d = c.clone().sub(a);
    const r = tailR[i];
    oval([mid.x, mid.y, mid.z], [r, d.length() * 0.75, r * 0.95], i === 3 ? SADDLE : SAND, tails[i], [d.x, d.y, d.z]);
    // fluffy tufts around the tail
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * Math.PI * 2 + i * 0.6;
      const out = new THREE.Vector3(Math.cos(ang), Math.sin(ang) * 0.9, 0);
      const base = mid.clone().add(out.clone().multiplyScalar(r * 0.7));
      const dir = out.clone().multiplyScalar(0.6).add(new THREE.Vector3(0, -0.05, -1));
      cone([base.x, base.y, base.z], [dir.x, dir.y, dir.z], r * 1.1, r * 0.35, i === 3 ? SADDLE : SAND, tails[i], 4);
    }
  }
  // black tip
  const tipBase = V(tailPts[4]);
  oval([tipBase.x, tipBase.y, tipBase.z - 0.012], [0.034, 0.032, 0.04], DARK, tails[4]);
  cone([tipBase.x, tipBase.y, tipBase.z - 0.03], [0, 0.02, -1], 0.04, 0.026, DARK, tails[4], 5);
  // pale underside stripe on the tail base
  oval([0, 0.158, -0.205], [0.022, 0.016, 0.04], CREAM, tails[0], [0, -0.15, -1]);

  return b.root;
}
