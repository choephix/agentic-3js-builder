import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  smoothstep,
  noise,
  countershade,
  mottle,
  gradient,
  polyline,
  catmull,
  rng,
  Paint,
} from "../../../../src/index";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old male lion resting sphinx-style with his head held high: a huge shaggy mane fading from golden blond to dark chocolate, tawny body with cream belly and muzzle, amber eyes, broad black nose, a scarred brow, big padded paws and a dark-tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const R = rng(11);

  // ---------- palette & paints ----------
  const TAWNY = "#c98f48";
  const TAWNY2 = "#b67a38";
  const CREAM = "#f0dcb0";
  const GOLD = "#f2c862";
  const MID = "#b5732f";
  const CHOC = "#3d2314";
  const DARK = "#2b1a10";
  const BLACK = "#16100d";

  const bodyPaint = countershade(mottle(TAWNY, TAWNY2, { size: 0.35, seed: 2, contrast: 0.7 }), CREAM, {
    level: -0.35,
    soft: 0.3,
  });
  const tailPaint = gradient(bodyPaint, "#6a4426", [0.45, 0.05, -1.58], [0.8, 0.06, -1.5]);
  const F = v(0, 0.9, 0.92);
  const manePaint = paint((p) => {
    const d = p.distanceTo(F) + (noise(p, 0.07, 3) - 0.5) * 0.16;
    const t = smoothstep(0.17, 0.55, d);
    return t < 0.5 ? mix(GOLD, MID, t * 2) : mix(MID, CHOC, (t - 0.5) * 2);
  });
  const facePaint = paint((p, n) => {
    const low = smoothstep(0.92, 0.86, p.y) * smoothstep(0.0, 0.5, n.z);
    return mix(mix("#cf9550", "#b97e3c", noise(p, 0.05, 9) * 0.6), CREAM, low);
  });

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.38, -0.75], dir: [0, 0, 1] });
  const spine = b.chain("spine", polyline([[0, 0.38, -0.45], [0, 0.4, 0.0], [0, 0.48, 0.42]]), {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", polyline([[0, 0.52, 0.45], [0, 0.68, 0.6], [0, 0.84, 0.76]]), {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { parent: "neck2", at: [0, 0.9, 0.8], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.84, 0.9], aim: [0, 0.81, 1.05], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.38, -0.92],
      [0.05, 0.22, -1.12],
      [0.15, 0.07, -1.35],
      [0.38, 0.05, -1.55],
      [0.62, 0.05, -1.6],
      [0.8, 0.07, -1.5],
    ]),
    { parent: "hips", role: "tail" },
  );

  // ---------- helpers ----------
  const sph = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);
  const blob = (
    at: number[] | THREE.Vector3,
    scale: number[],
    color: string | Paint,
    bone: string,
    extra: Record<string, unknown> = {},
  ) => b.part(sph(), color, { at, scale, bone, ...extra });
  const cone = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string | Paint, bone: string) => {
    const d = dir.clone().normalize();
    b.part(new THREE.ConeGeometry(r, len, 6, 1), color, {
      at: base.clone().addScaledVector(d, len / 2),
      dir: d,
      bone,
      flat: true,
    });
  };

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.33, -0.95], w: 0.36, h: 0.4 },
      { at: [0, 0.36, -0.75], w: 0.58, h: 0.62 },
      { at: [0, 0.36, -0.4], w: 0.6, h: 0.66 },
      { at: [0, 0.35, 0.0], w: 0.56, h: 0.64 },
      { at: [0, 0.42, 0.35], w: 0.58, h: 0.74 },
      { at: [0, 0.52, 0.6], w: 0.44, h: 0.56 },
    ],
    { color: bodyPaint, bone: ["hips", spine, "chest"], sides: 14 },
  );
  b.sweep(neck, [0.17, 0.15], { color: bodyPaint });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front legs stretched forward on the ground
    const arm = b.chain(
      "arm" + side,
      polyline([
        [s * 0.2, 0.42, 0.42],
        [s * 0.21, 0.12, 0.38],
        [s * 0.21, 0.075, 0.82],
        [s * 0.21, 0.05, 0.98],
      ]),
      { parent: "chest", names: ["shoulder" + side, "elbow" + side, "wrist" + side, "paw" + side], role: "leg" },
    );
    b.sweep(arm, [0.1, 0.085, 0.07, 0.062, 0.056, 0.05], { color: bodyPaint });
    blob([s * 0.2, 0.5, 0.4], [0.1, 0.17, 0.15], bodyPaint, "shoulder" + side);
    cone(v(s * 0.215, 0.12, 0.36), v(s * 0.2, 0.1, -1), 0.08, 0.03, DARK, "elbow" + side); // elbow tuft
    // big padded front paw
    blob([s * 0.21, 0.05, 0.92], [0.078, 0.05, 0.1], "#d6a96e", "wrist" + side);
    [-0.045, -0.015, 0.015, 0.045].forEach((dx, k) => {
      blob([s * 0.21 + dx, 0.034, 1.005 - Math.abs(dx) * 0.5], [0.026, 0.028, 0.03], "#e3c08e", "wrist" + side);
      if (k < 3)
        b.part(new THREE.BoxGeometry(0.004, 0.012, 0.035), "#6b4528", {
          at: [s * 0.21 + dx + 0.015, 0.06, 1.0],
          bone: "wrist" + side,
        });
    });

    // hind legs tucked along the flank
    const leg = b.chain(
      "leg" + side,
      polyline([
        [s * 0.24, 0.4, -0.55],
        [s * 0.36, 0.2, -0.26],
        [s * 0.38, 0.085, -0.74],
        [s * 0.42, 0.05, -0.36],
      ]),
      { parent: "hips", names: ["hip" + side, "knee" + side, "hock" + side, "foot" + side], role: "leg" },
    );
    b.sweep(leg, [0.11, 0.085, 0.07, 0.06, 0.055, 0.05], { color: bodyPaint });
    blob([s * 0.25, 0.34, -0.55], [0.13, 0.2, 0.25], bodyPaint, "hip" + side);
    blob([s * 0.42, 0.045, -0.42], [0.066, 0.045, 0.1], "#d6a96e", "hock" + side);
    [-0.035, -0.012, 0.012, 0.035].forEach((dx) =>
      blob([s * 0.42 + dx, 0.03, -0.34 - Math.abs(dx) * 0.4], [0.022, 0.024, 0.026], "#e3c08e", "hock" + side),
    );
  }

  // ---------- tail ----------
  b.sweep(tail, [0.055, 0.045, 0.038, 0.034, 0.032, 0.03], { color: tailPaint });
  const end = tail.at(1);
  const tan = end.tangent.clone().normalize();
  const tailBone = tail.joints[tail.joints.length - 1].name;
  b.part(sph(8, 6), DARK, { at: end.at.clone().addScaledVector(tan, 0.05), dir: tan, scale: [0.055, 0.1, 0.055], bone: tailBone });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const side = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
    const d = tan.clone().addScaledVector(side, Math.cos(a) * 0.45).add(v(0, Math.sin(a) * 0.25 + 0.1, 0));
    cone(end.at.clone().addScaledVector(tan, 0.08), d, 0.09, 0.022, i % 2 ? DARK : "#4a2c18", tailBone);
  }

  // ---------- mane ----------
  const maneMass = blob([0, 0.78, 0.58], [0.3, 0.33, 0.28], manePaint, "neck2");
  blob([0, 0.5, 0.62], [0.24, 0.26, 0.2], manePaint, "neck1");

  const ring = (cy: number, cz: number, rad: number, n: number, len: number, r: number, tilt: number, bone: string, from = -180, to = 180) => {
    for (let i = 0; i < n; i++) {
      const a = (from + ((to - from) * (i + 0.5)) / n + (R() - 0.5) * 10) * (Math.PI / 180);
      const radial = v(Math.sin(a), Math.cos(a), 0);
      const t = (tilt + (R() - 0.5) * 12) * (Math.PI / 180);
      const dir = radial.clone().multiplyScalar(Math.cos(t)).add(v(0, -0.15, -Math.sin(t)));
      const base = v(0, cy, cz).addScaledVector(radial, rad).addScaledVector(dir.clone().normalize(), -0.04);
      cone(base, dir, len * (0.85 + R() * 0.35), r * (0.85 + R() * 0.3), manePaint, bone);
    }
  };
  ring(0.9, 0.8, 0.16, 14, 0.18, 0.055, 25, "head");
  ring(0.86, 0.7, 0.22, 16, 0.27, 0.075, 42, "neck2");
  ring(0.82, 0.56, 0.26, 18, 0.31, 0.085, 60, "neck2");
  ring(0.72, 0.4, 0.24, 12, 0.28, 0.08, 72, "neck1", -115, 115);
  for (let i = 0; i < 7; i++) {
    const x = -0.15 + (0.3 * i) / 6;
    cone(v(x, 0.42 + R() * 0.15, 0.7), v(x * 0.8, -1, 0.35), 0.22 + R() * 0.08, 0.06, manePaint, "neck1");
  }
  const shag = b.surface(maneMass).scatter(36, {
    rng: rng(7),
    minDist: 0.07,
    filter: (h) => h.n.z < 0.45 && h.at.y > 0.5,
  });
  for (const h of shag) b.stick(new THREE.ConeGeometry(0.055, 0.2, 5, 1), manePaint, h, { embed: 0.3, flat: true });

  // ---------- head ----------
  const H = "head";
  blob([0, 0.93, 0.84], [0.17, 0.15, 0.16], facePaint, H, { flat: false });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.12), "#c48a46", { at: [0, 1.0, 0.92], rotation: [20, 0, 0], bone: H });
  for (const s of [1, -1]) blob([s * 0.1, 0.88, 0.93], [0.07, 0.06, 0.07], facePaint, H);
  // muzzle
  blob([0, 0.87, 1.0], [0.095, 0.065, 0.09], CREAM, H);
  b.part(new THREE.BoxGeometry(0.075, 0.05, 0.15), "#c99350", { at: [0, 0.955, 1.0], rotation: [25, 0, 0], bone: H });
  b.part(new THREE.BoxGeometry(0.09, 0.04, 0.045), BLACK, { at: [0, 0.912, 1.095], bone: H, flat: true });
  b.part(new THREE.BoxGeometry(0.03, 0.022, 0.03), BLACK, { at: [0, 0.89, 1.098], bone: H });
  b.part(new THREE.BoxGeometry(0.085, 0.008, 0.03), "#2a1810", { at: [0, 0.826, 1.06], bone: H });
  for (const s of [1, -1]) {
    const pad = v(s * 0.042, 0.86, 1.06);
    blob(pad, [0.045, 0.042, 0.045], "#f5e6c4", H);
    for (let k = 0; k < 3; k++) {
      for (let j = 0; j < 2; j++) {
        const d = v(s * (0.5 + j * 0.2), 0.15 - k * 0.15, 0.8).normalize();
        b.part(sph(5, 4), "#4a3020", { at: pad.clone().addScaledVector(d, 0.044), scale: 0.005, bone: H });
      }
      const wd = v(s, 0.12 - k * 0.12, 0.35).normalize();
      const len = 0.17 - k * 0.02;
      b.part(new THREE.CylinderGeometry(0.0008, 0.0022, len, 3), "#fbf7ec", {
        at: pad.clone().addScaledVector(wd, 0.03 + len / 2),
        dir: wd,
        bone: H,
      });
    }
    // eyes
    const eye = v(s * 0.065, 0.955, 0.977);
    b.part(sph(), "#1e120a", { at: eye.clone().add(v(0, 0, -0.005)), scale: [0.028, 0.022, 0.022], bone: H });
    blob(eye, [0.022, 0.02, 0.022], "#e89b1a", H);
    blob(eye.clone().add(v(0, 0, 0.017)), [0.009, 0.01, 0.008], BLACK, H);
    blob(eye.clone().add(v(s * 0.006, 0.008, 0.021)), [0.004, 0.004, 0.003], "#ffffff", H);
    blob([s * 0.066, 0.928, 0.968], [0.03, 0.012, 0.02], "#f7ead0", H);
    b.part(new THREE.BoxGeometry(0.072, 0.02, 0.03), "#a96f33", {
      at: [s * 0.068, 0.985, 0.985],
      rotation: [0, 0, -s * 10],
      bone: H,
    });
    // ears
    const ear = v(s * 0.115, 1.045, 0.86);
    blob(ear.clone().add(v(0, 0, -0.008)), [0.05, 0.05, 0.016], DARK, H);
    blob(ear, [0.048, 0.05, 0.02], "#c08544", H);
    blob(ear.clone().add(v(0, -0.004, 0.012)), [0.03, 0.033, 0.01], CREAM, H);
  }
  // the scar across his right eyebrow
  b.part(new THREE.BoxGeometry(0.011, 0.09, 0.014), "#e2a49a", { at: [-0.07, 0.988, 1.0], rotation: [0, 0, 30], bone: H });
  b.part(new THREE.BoxGeometry(0.004, 0.08, 0.012), "#7a3f2c", { at: [-0.062, 0.99, 1.0], rotation: [0, 0, 30], bone: H });
  b.part(new THREE.BoxGeometry(0.009, 0.03, 0.01), "#e2a49a", { at: [-0.088, 0.935, 0.982], rotation: [0, 0, 30], bone: H });

  // lower jaw
  blob([0, 0.81, 1.0], [0.065, 0.032, 0.075], CREAM, "jaw");
  cone(v(0, 0.79, 1.0), v(0, -1, 0.3), 0.05, 0.02, "#e8d0a0", "jaw");

  return b.root;
}
