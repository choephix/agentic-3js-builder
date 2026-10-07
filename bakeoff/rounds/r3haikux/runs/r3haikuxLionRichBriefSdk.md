```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion resting in a sphinx pose with his head held high: a shaggy mane fading from golden blond at the face to dark chocolate at the edges, a tawny body with a cream belly and muzzle, amber eyes, a broad black nose, a scarred brow and a long tail ending in a dark tuft.",
};

const TAWNY = "#b8773a";
const LEG = "#a46832";
const CREAM = "#eedcae";
const SKULL = "#e6b766";
const BROW = "#a6692d";
const RIM = "#5a3418";
const AMBER = "#f2a922";
const PUPIL = "#120c08";
const NOSE = "#1b1411";
const SCAR = "#7a2e22";
const TUFT_A = "#2c190d";
const TUFT_B = "#3e2513";
// golden blond at the face -> dark chocolate at the edges
const MANE = ["#f2c773", "#e2aa5a", "#c98b45", "#a86c35", "#7c4a27", "#4e2d17"];

const DEG = Math.PI / 180;
const SKULL_C = new THREE.Vector3(0, 1.37, 0.95);
const FACE = new THREE.Vector3(0, 0.12, 1).normalize();

/** Matrix taking local +Y onto `dir` (orients cones and bars). */
function basisFor(dir: THREE.Vector3): THREE.Matrix4 {
  const y = dir.clone().normalize();
  const ref = Math.abs(y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

function angleFromFace(p: THREE.Vector3): number {
  const d = p.clone().sub(SKULL_C).normalize();
  return Math.acos(THREE.MathUtils.clamp(d.dot(FACE), -1, 1));
}

export default function build() {
  const b = createBuilder({ name: "old-lion" });
  const rnd = rng(31);

  // ---------- helpers ----------
  const blob = (c: number[], r: number[], color: string, seg = 12, rings = 9) => {
    const g = new THREE.SphereGeometry(1, seg, rings);
    g.scale(r[0], r[1], r[2]);
    b.part(g, color, { at: c });
  };

  const spike = (base: THREE.Vector3, dir: THREE.Vector3, len: number, radius: number, color: string) => {
    const d = dir.clone().normalize();
    const g = new THREE.ConeGeometry(radius, len, 6, 1);
    g.applyMatrix4(basisFor(d));
    const m = base.clone().addScaledVector(d, len / 2);
    b.part(g, color, { at: [m.x, m.y, m.z] });
  };

  const bar = (a: THREE.Vector3, c: THREE.Vector3, radius: number, color: string) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(radius, radius, d.length(), 5);
    g.applyMatrix4(basisFor(d));
    const m = a.clone().add(c).multiplyScalar(0.5);
    b.part(g, color, { at: [m.x, m.y, m.z] });
  };

  const maneColour = (th: number) => {
    const m = THREE.MathUtils.clamp((th - 0.9) / 1.3 + (rnd() - 0.5) * 0.15, 0, 0.999);
    return MANE[Math.floor(m * MANE.length)];
  };

  // points on the muzzle ellipsoid (slightly proud), for whisker pads
  const muzzlePt = (az: number, el: number, s: number): number[] => {
    const a = az * DEG;
    const e = el * DEG;
    return [
      s * 0.116 * Math.cos(e) * Math.sin(a),
      1.31 + 0.09 * Math.sin(e),
      1.08 + 0.137 * Math.cos(e) * Math.cos(a),
    ];
  };

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.52, -0.84] });

  const spine = b.chain(
    "spine",
    [[0, 0.46, -1.0], [0, 0.5, -0.72], [0, 0.56, -0.38], [0, 0.64, -0.06], [0, 0.74, 0.18], [0, 0.86, 0.34]],
    { role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [[0, 0.86, 0.34], [0, 0.98, 0.5], [0, 1.1, 0.66], [0, 1.2, 0.8]],
    { role: "neck" },
  );
  b.chain("head", [[0, 1.2, 0.8], [0, 1.34, 1.1]], { role: "head" });
  b.chain("jaw", [[0, 1.16, 0.84], [0, 1.16, 1.12]], { role: "jaw" });
  const tail = b.chain(
    "tail",
    [[0, 0.44, -1.02], [0, 0.3, -1.36], [0.02, 0.14, -1.66], [0.15, 0.07, -1.87], [0.36, 0.07, -1.93]],
    { role: "tail" },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fore = b.chain(
      `fore${side}`,
      [[s * 0.2, 0.78, 0.22], [s * 0.22, 0.34, 0.14], [s * 0.22, 0.08, 0.6]],
      { role: "leg" },
    );
    const hind = b.chain(
      `hind${side}`,
      [[s * 0.22, 0.46, -0.9], [s * 0.27, 0.2, -0.55], [s * 0.25, 0.08, -0.32]],
      { role: "leg" },
    );
    b.sweep(fore, 0.095, { color: LEG });
    b.sweep(hind, 0.1, { color: LEG });
  }

  b.sweep(spine, 0.25, { color: TAWNY });
  b.sweep(neck, 0.19, { color: TAWNY });
  b.sweep(tail, 0.055, { color: TAWNY });

  // ---------- torso ----------
  blob([0, 0.44, -0.86], [0.34, 0.34, 0.4], TAWNY);      // haunch
  blob([0, 0.68, 0.2], [0.27, 0.27, 0.28], TAWNY);       // chest
  blob([0, 0.3, -0.3], [0.21, 0.12, 0.42], CREAM);       // pale belly
  blob([0, 0.66, 0.44], [0.15, 0.2, 0.12], CREAM);       // chest bib

  for (const s of [1, -1]) {
    blob([s * 0.2, 0.5, -0.82], [0.16, 0.24, 0.27], LEG); // thigh
    blob([s * 0.2, 0.7, 0.22], [0.14, 0.2, 0.2], LEG);    // shoulder

    // big padded front paw, cream toe beans
    blob([s * 0.22, 0.065, 0.67], [0.115, 0.07, 0.135], LEG);
    for (const dx of [-0.05, 0, 0.05]) {
      blob([s * 0.22 + dx, 0.05, 0.8], [0.036, 0.03, 0.036], CREAM, 8, 6);
    }

    // big padded hind paw, cream toe beans
    blob([s * 0.25, 0.065, -0.24], [0.115, 0.07, 0.13], LEG);
    for (const dx of [-0.05, 0, 0.05]) {
      blob([s * 0.25 + dx, 0.05, -0.105], [0.036, 0.03, 0.036], CREAM, 8, 6);
    }
  }

  // ---------- head ----------
  blob([0, 1.37, 0.95], [0.19, 0.19, 0.21], SKULL, 14, 10);  // golden skull
  blob([0, 1.31, 1.08], [0.11, 0.085, 0.13], CREAM, 12, 9);  // cream muzzle
  blob([0, 1.37, 1.2], [0.072, 0.042, 0.036], NOSE, 10, 7);  // broad black nose
  blob([0, 1.27, 1.18], [0.03, 0.007, 0.012], NOSE, 6, 4);   // mouth line
  blob([0, 1.19, 1.1], [0.07, 0.045, 0.09], CREAM, 10, 7);   // lower jaw / chin
  blob([0, 1.0, 0.6], [0.12, 0.16, 0.14], CREAM, 10, 7);     // throat

  for (const s of [1, -1]) {
    blob([s * 0.075, 1.44, 1.13], [0.05, 0.03, 0.04], BROW, 8, 6);      // brow ridge
    blob([s * 0.08, 1.4, 1.135], [0.04, 0.04, 0.03], RIM, 8, 6);        // eye rim
    blob([s * 0.08, 1.4, 1.15], [0.034, 0.034, 0.034], AMBER, 10, 8);   // amber eye
    blob([s * 0.08, 1.4, 1.18], [0.015, 0.015, 0.009], PUPIL, 8, 6);    // pupil

    for (const [az, el] of [[38, 4], [52, -8], [30, -14]]) {
      blob(muzzlePt(az, el, s), [0.011, 0.011, 0.009], NOSE, 6, 4);     // whisker pads
    }
  }

  // scar cutting across the model's right (-X) brow
  bar(
    new THREE.Vector3(-0.118, 1.478, 1.115),
    new THREE.Vector3(-0.058, 1.425, 1.148),
    0.0065,
    SCAR,
  );

  // ---------- mane ----------
  // head shell: a Fibonacci sphere of tufts round the skull, kept clear of the face
  for (let i = 0; i < 300; i++) {
    const y = 1 - (2 * (i + 0.5)) / 300;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * 2.39996323;
    const d = new THREE.Vector3(Math.cos(phi) * rr, y, Math.sin(phi) * rr);
    const th = Math.acos(THREE.MathUtils.clamp(d.dot(FACE), -1, 1));

    if (th < 0.85) continue;                 // keep the face clear
    if (d.z > 0.55 && d.y > -0.3) continue;  // forehead
    if (d.z > 0.2 && d.y < -0.15) continue;  // cheeks, muzzle and chin
    if (d.y < -0.35) continue;               // under the neck

    const base = SKULL_C.clone().addScaledVector(d, 0.185);
    const out = d.clone().add(new THREE.Vector3(0, -0.15, -0.55)); // mane sweeps back
    spike(base, out, 0.13 + rnd() * 0.07, 0.035 + rnd() * 0.006, maneColour(th));

    if (i % 2 === 0) {
      // outer, darker layer for fullness
      const outer = SKULL_C.clone().addScaledVector(d, 0.245);
      spike(outer, out, 0.11 + rnd() * 0.04, 0.03, maneColour(th + 0.3));
    }
  }

  // neck rings: mane falling down the back of the neck, throat kept clear
  const X = new THREE.Vector3(1, 0, 0);
  const W = new THREE.Vector3(0, 0.8, -0.6);
  for (const c of [[0, 0.96, 0.48], [0, 1.06, 0.6], [0, 1.16, 0.72]] as number[][]) {
    const K = 18;
    for (let k = 0; k < K; k++) {
      const a = ((k + rnd() * 0.6) / K) * Math.PI * 2;
      const radial = X.clone().multiplyScalar(Math.cos(a)).addScaledVector(W, Math.sin(a));
      if (radial.z > 0.15) continue;
      const base = new THREE.Vector3(c[0], c[1], c[2]).addScaledVector(radial, 0.18);
      const dir = radial.clone().multiplyScalar(0.7).add(new THREE.Vector3(0, -0.25, -0.7));
      spike(base, dir, 0.16 + rnd() * 0.06, 0.036, maneColour(angleFromFace(base)));
    }
  }

  // ---------- tail tuft ----------
  const TC = [0.38, 0.09, -1.95];
  blob(TC, [0.1, 0.095, 0.1], TUFT_A, 10, 7);
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + rnd() * 0.4;
    const e = rnd() * 0.9 - 0.25;
    const d = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
    const base = new THREE.Vector3(TC[0], TC[1], TC[2]).addScaledVector(d, 0.05);
    spike(base, d, 0.11 + rnd() * 0.05, 0.03, k % 2 ? TUFT_B : TUFT_A);
  }

  return b.root;
}
```