import * as THREE from "three";
import { createBuilder, paint, mix, noise, spiral } from "../../../../src/index";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "A wind-up brass and copper terrier: riveted body plates, gears turning in its chest windows, a butterfly winding key, coil-spring legs and tail, floppy leather ears, green glass-lens eyes, red collar with a brass tag.",
};

type V = [number, number, number];

const BRASS = "#d9a53c";
const BRASS_D = "#a67722";
const COPPER = "#c76a3c";
const COPPER_D = "#8c4424";
const GOLD = "#f2cd6a";
const DARK = "#2a1c12";
const RED = "#b3202a";
const LEATHER = "#6d4022";
const GLASS = "#63e39a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "clockworkTerrier" });
  const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r0: number, r1: number, h: number, s = 8) => new THREE.CylinderGeometry(r0, r1, h, s);
  const tor = (R: number, r: number, t = 5, s = 12) => new THREE.TorusGeometry(R, r, t, s);

  const circle = (n: number, r: number): [number, number][] =>
    Array.from({ length: n }, (_, i) => [Math.cos((i * 2 * Math.PI) / n) * r, Math.sin((i * 2 * Math.PI) / n) * r]);
  const gearOutline = (n: number, ro: number, ri: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n;
      const w = Math.PI / n;
      for (const [da, r] of [[-0.5, ri], [-0.28, ro], [0.28, ro], [0.5, ri]] as const)
        pts.push([Math.cos(a + da * w) * r, Math.sin(a + da * w) * r]);
    }
    return pts;
  };

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 0.27, -0.2], dir: [0, 0, 1] });
  const spine = b.chain("spine", [[0, 0.27, -0.2], [0, 0.28, 0], [0, 0.3, 0.16]], {
    parent: "pelvis", role: "spine", names: ["spine1", "spine2"],
  });
  const neck = b.chain("neck", [[0, 0.3, 0.15], [0, 0.37, 0.205], [0, 0.43, 0.25]], {
    parent: "spine2", role: "neck", names: ["neck1", "neck2"],
  });
  b.joint("head", { parent: "neck2", at: [0, 0.43, 0.25], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.4, 0.31], dir: [0, 0, 1], role: "jaw" });
  b.joint("key", { parent: "spine1", at: [0, 0.39, -0.03], dir: [0, 1, 0], role: "hinge" });

  // ---------- body ----------
  const bodyPaint = paint((p, n) => {
    const f = (p.z + 0.26) / 0.11;
    const k = Math.floor(f);
    const fr = f - k;
    const even = ((k % 2) + 2) % 2 === 0;
    let c = mix(even ? BRASS : COPPER, even ? "#f0c660" : "#e48c55", 0.55 * noise(p, 0.05, 3));
    if (Math.min(fr, 1 - fr) < 0.05) c = mix(c, DARK, 0.5);
    if (n.y > 0.7) c = mix(c, GOLD, 0.25);
    if (n.y < -0.4) c = mix(c, COPPER_D, 0.6);
    return c;
  });
  const body = b.loft(
    [
      { at: [0, 0.27, -0.25], w: 0.1, h: 0.12 },
      { at: [0, 0.275, -0.15], w: 0.16, h: 0.18 },
      { at: [0, 0.285, -0.02], w: 0.18, h: 0.21 },
      { at: [0, 0.295, 0.1], w: 0.175, h: 0.22 },
      { at: [0, 0.3, 0.19], w: 0.14, h: 0.19 },
    ],
    { color: bodyPaint, bone: spine, sides: 10 },
  );

  // seam bands + rivets
  const surf = b.surface(body);
  for (const z of [-0.15, -0.04, 0.07]) {
    const centre = new THREE.Vector3(0, 0.285, z);
    const path = surf.loop([0, 0.285, z], { dir: [0, 0, 1], lift: 0.002 });
    b.sweep(path, { radius: 0.0065, color: COPPER_D, sides: 4 });
    b.along(path, 12, (pt) => {
      const out = pt.at.clone().sub(centre).normalize();
      b.part(sph(0.0085, 6, 4), GOLD, { at: pt.at, dir: out, bone: z < 0 ? "spine1" : "spine2" });
    });
  }

  // chest windows with gears
  for (const s of [1, -1]) {
    b.extrude(circle(12, 0.075), {
      color: DARK, at: [s * 0.083, 0.275, -0.01], x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.02, bevel: 0.004, bone: "spine1", name: `window${s > 0 ? "L" : "R"}`,
    });
    const gears: Array<[number, number, number, number, string]> = [
      [-0.025, 0.285, 0.036, 12, BRASS],
      [0.03, 0.26, 0.026, 9, COPPER],
      [-0.06, 0.245, 0.02, 7, GOLD],
    ];
    gears.forEach(([z, y, r, n, col], i) => {
      b.extrude(gearOutline(n, r, r * 0.8), {
        color: col, at: [s * 0.095, y, z], x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.012, bone: "spine1", rotate: undefined as never,
      } as never);
      b.part(cyl(0.007, 0.007, 0.02, 6), DARK, { at: [s * 0.096, y, z], dir: [s, 0, 0], bone: "spine1" });
      void i;
    });
  }

  // ---------- winding key ----------
  b.extrude(gearOutline(14, 0.05, 0.04), {
    color: BRASS_D, at: [0, 0.391, -0.03], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, bone: "key",
  });
  b.part(cyl(0.022, 0.026, 0.012, 8), COPPER, { at: [0, 0.394, -0.03], bone: "key" });
  b.part(cyl(0.007, 0.007, 0.05, 6), GOLD, { at: [0, 0.41, -0.03], bone: "key" });
  b.extrude(
    [
      [0.006, -0.015], [0.03, -0.015], [0.047, 0.0], [0.05, 0.02], [0.04, 0.036], [0.022, 0.036], [0.006, 0.018],
      [-0.006, 0.018], [-0.022, 0.036], [-0.04, 0.036], [-0.05, 0.02], [-0.047, 0.0], [-0.03, -0.015], [-0.006, -0.015],
    ],
    { color: GOLD, at: [0, 0.43, -0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.0025, bone: "key", smoothing: 1 },
  );
  for (const s of [1, -1])
    b.part(cyl(0.011, 0.011, 0.018, 8), DARK, { at: [s * 0.03, 0.442, -0.03], dir: [0, 0, 1], bone: "key" });

  // ---------- neck, collar, tag ----------
  b.sweep(neck, { radius: [0.068, 0.056], color: BRASS, sides: 8 });
  const np = neck.at(0.45);
  b.part(tor(0.066, 0.012, 5, 12), RED, { at: np.at, dir: np.tangent, axis: "z", bone: "neck1" });
  const T = np.tangent;
  const front = new THREE.Vector3(0, -T.z, T.y).normalize();
  const tagAt = np.at.clone().addScaledVector(front, 0.08).add(new THREE.Vector3(0, -0.018, 0));
  b.part(tor(0.007, 0.0025, 4, 8), GOLD, { at: np.at.clone().addScaledVector(front, 0.076), dir: front, axis: "z", bone: "neck1" });
  b.part(cyl(0.024, 0.024, 0.005, 10), GOLD, { at: tagAt, dir: front, bone: "neck1" });
  b.part(cyl(0.011, 0.011, 0.007, 5), DARK, { at: tagAt.clone().addScaledVector(front, 0.001), dir: front, bone: "neck1" });

  // ---------- head ----------
  b.part(sph(1, 8, 6), BRASS, { at: [0, 0.455, 0.27], scale: [0.075, 0.07, 0.08], flat: true, bone: "head" });
  b.frustumBox([0, 0.44, 0.31], [0, 0.435, 0.435], [0.085, 0.065], [0.06, 0.045], { color: BRASS, bone: "head" });
  b.frustumBox([0, 0.393, 0.315], [0, 0.39, 0.42], [0.07, 0.032], [0.05, 0.026], { color: COPPER, bone: "jaw" });
  b.part(sph(0.02, 7, 5), DARK, { at: [0, 0.44, 0.438], scale: [1.1, 0.8, 0.9], bone: "head" });
  for (let i = -2; i <= 2; i++)
    b.spike([i * 0.012, 0.38, 0.4 - Math.abs(i) * 0.012], [0, -0.9, 0.3], 0.045, { radius: 0.007, color: BRASS_D, bone: "jaw" });
  b.extrude(gearOutline(10, 0.022, 0.017), {
    color: GOLD, at: [0, 0.521, 0.262], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.008, bone: "head",
  });
  b.part(cyl(0.006, 0.006, 0.014, 6), DARK, { at: [0, 0.523, 0.262], bone: "head" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // eyes
    b.part(sph(0.02, 8, 6), GLASS, { at: [s * 0.042, 0.47, 0.335], scale: [1, 1, 0.7], bone: "head", name: `lens${side}` });
    b.part(sph(0.009, 6, 4), DARK, { at: [s * 0.042, 0.47, 0.347], bone: "head" });
    b.part(sph(0.004, 5, 4), "#ffffff", { at: [s * 0.038, 0.476, 0.352], bone: "head" });
    b.part(tor(0.021, 0.0055, 5, 10), GOLD, { at: [s * 0.042, 0.47, 0.334], dir: [s * 0.25, 0, 1], axis: "z", bone: "head" });
    b.part(new THREE.BoxGeometry(0.04, 0.01, 0.016), COPPER, {
      at: [s * 0.042, 0.497, 0.325], rotation: [0, 0, s * 10], bone: "head",
    });
    // ears
    const ear = b.chain(`ear${side}`, [[s * 0.055, 0.5, 0.255], [s * 0.085, 0.475, 0.25], [s * 0.105, 0.425, 0.245]], {
      parent: "head", up: [s, 0, 0], names: [`ear${side}1`, `ear${side}2`],
    });
    b.sweep(ear, {
      radius: (t: number) => [0.02 + 0.016 * Math.sin(Math.PI * t), 0.005] as const,
      color: LEATHER, sides: 6,
    });
    b.part(sph(0.009, 6, 4), GOLD, { at: [s * 0.062, 0.495, 0.252], bone: `ear${side}1` });
  }

  // ---------- legs ----------
  const spring = (a: V, c: V, r: number, turns: number, wire: number, color: string, bone: any, r1?: number) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const dir = C.clone().sub(A);
    const len = dir.length();
    dir.normalize();
    const perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0));
    if (perp.lengthSq() < 1e-6) perp.set(0, 0, 1);
    perp.normalize();
    const path = spiral(A, A.clone().addScaledVector(perp, r), dir, { turns, pitch: len / turns, r1 });
    return b.sweep(path, { radius: wire, color, sides: 5, bone });
  };

  const leg = (S: number, frontLeg: boolean) => {
    const side = S > 0 ? "L" : "R";
    const pts: V[] = frontLeg
      ? [[S * 0.075, 0.25, 0.125], [S * 0.082, 0.16, 0.14], [S * 0.08, 0.085, 0.125], [S * 0.078, 0.03, 0.13]]
      : [[S * 0.085, 0.25, -0.19], [S * 0.09, 0.15, -0.14], [S * 0.083, 0.09, -0.215], [S * 0.083, 0.03, -0.2]];
    const names = frontLeg
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`]
      : [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`];
    b.chain(frontLeg ? `legF${side}` : `legH${side}`, pts, {
      parent: frontLeg ? "spine2" : "pelvis", role: "leg", names,
    });
    const [A, B, C, D] = pts;
    b.capsule(A, B, { radius: frontLeg ? [0.026, 0.02] : [0.034, 0.022], color: COPPER, bone: names[0] });
    b.part(sph(0.025, 7, 5), GOLD, { at: B, flat: true, bone: names[1] });
    spring(B, C, 0.018, 5, 0.004, COPPER_D, names[1]);
    b.rod(B, C, { radius: 0.006, color: BRASS_D, bone: names[1] });
    b.part(sph(0.02, 7, 5), GOLD, { at: C, flat: true, bone: names[2] });
    b.capsule(C, D, { radius: 0.014, color: BRASS, bone: names[2] });
    b.part(sph(1, 8, 6), COPPER_D, { at: [D[0], 0.02, D[2] + 0.022], scale: [0.03, 0.02, 0.042], flat: true, bone: names[3] });
    for (const dx of [-0.014, 0, 0.014])
      b.part(sph(0.01, 6, 4), GOLD, { at: [D[0] + dx, 0.016, D[2] + 0.06], bone: names[3] });
    // joint plate
    const px = frontLeg ? S * 0.088 : S * 0.08;
    const pz = frontLeg ? 0.125 : -0.19;
    b.part(cyl(0.045, 0.045, 0.012, 10), COPPER, { at: [px, 0.25, pz], dir: [S, 0, 0], bone: names[0] });
    b.part(tor(0.045, 0.007, 4, 12), BRASS, { at: [px, 0.25, pz], dir: [S, 0, 0], axis: "z", bone: names[0] });
    b.part(sph(0.012, 6, 4), GOLD, { at: [px + S * 0.007, 0.25, pz], bone: names[0] });
  };
  for (const S of [1, -1]) {
    leg(S, true);
    leg(S, false);
  }

  // ---------- spring tail ----------
  const base: V = [0, 0.3, -0.235];
  const tip: V = [0, 0.47, -0.31];
  const lerp3 = (t: number): V => [0, base[1] + (tip[1] - base[1]) * t, base[2] + (tip[2] - base[2]) * t];
  const tail = b.chain("tail", [base, lerp3(0.33), lerp3(0.66), tip], { parent: "pelvis", role: "tail" });
  b.part(sph(0.03, 7, 5), COPPER, { at: base, flat: true, bone: "tail1" });
  spring(base, tip, 0.022, 6, 0.005, BRASS, tail, 0.01);
  b.part(sph(0.014, 7, 5), GOLD, { at: tip, flat: true, bone: "tail3" });

  return b.root;
}
