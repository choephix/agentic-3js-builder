import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "Toco toucan",
  description: "A stylised toco toucan in a rest pose: black body, white throat, oversized orange beak with a black tip, blue eye ring, and a red-tipped tail.",
};

const BLACK = "#16161b";
const WHITE = "#f6f4ef";
const ORANGE = "#ff8a1f";
const YELLOW = "#ffc628";
const RED = "#d8262e";
const BLUE = "#2f6fd8";
const PUPIL = "#0b0b0d";
const LEG = "#6b7079";

// Plain three.js geometry for the simple pieces.
const ell = (rx: number, ry: number, rz: number) =>
  new THREE.SphereGeometry(1, 20, 14).scale(rx, ry, rz);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const ring = (r: number, t: number) => new THREE.TorusGeometry(r, t, 8, 20);
const ball = (r: number) => new THREE.SphereGeometry(r, 12, 10);

// Frames for stuck-on details: facing +Z, placed at a model-space point.
const fr = (p: [number, number, number]) => frame(p, [0, 0, 1]);

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---- Skeleton ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const chest = b.joint("chest", { at: [0, 0.3, 0.03], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.07], parent: chest });
  const head = b.joint("head", { at: [0, 0.44, 0.08], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.425, 0.11], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.25, -0.08], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.23, -0.22], parent: tail1 });

  const wingL = b.joint("wingL", { at: [0.07, 0.31, 0.0], parent: chest });
  const wingR = b.joint("wingR", { at: [-0.07, 0.31, 0.0], parent: chest });

  const hipL = b.joint("hipL", { at: [0.05, 0.19, 0.0], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.05, 0.1, 0.02], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.05, 0.02, 0.0], parent: kneeL });

  const hipR = b.joint("hipR", { at: [-0.05, 0.19, 0.0], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.05, 0.1, 0.02], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.05, 0.02, 0.0], parent: kneeR });

  // ---- Body ----------------------------------------------------------------
  // Black torso, slightly egg-shaped, carried forward.
  b.stick(ell(0.085, 0.1, 0.12), BLACK, fr([0, 0.27, 0.0]));
  // White chest bib on the front of the torso.
  b.stick(ell(0.06, 0.07, 0.05), WHITE, fr([0, 0.29, 0.085]));
  // Head: a black dome with a rounded forehead.
  b.stick(ell(0.07, 0.07, 0.075), BLACK, fr([0, 0.44, 0.08]));
  // White throat patch under the head.
  b.stick(ell(0.045, 0.04, 0.04), WHITE, fr([0, 0.4, 0.105]));

  // ---- Face ----------------------------------------------------------------
  for (const s of [1, -1]) {
    const x = s * 0.04;
    b.stick(ring(0.02, 0.007), BLUE, fr([x, 0.445, 0.125]));
    b.stick(ball(0.016), WHITE, fr([x, 0.445, 0.128]));
    b.stick(ball(0.008), PUPIL, fr([x, 0.445, 0.14]));
  }

  // ---- Beak (upper mandible, rides the head) --------------------------------
  b.spike([0, 0.47, 0.105], [0, 0.45, 0.27], null, 0.04, ORANGE);
  // Lighter ridge along the top of the upper mandible.
  b.spike([0, 0.478, 0.12], [0, 0.468, 0.2], null, 0.02, YELLOW);
  // Black tip on the upper mandible.
  b.spike([0, 0.458, 0.22], [0, 0.446, 0.28], null, 0.028, BLACK);

  // ---- Beak (lower mandible, rides the jaw so it can open) -------------------
  b.spike(jaw, [0, 0.415, 0.23], null, 0.032, YELLOW);
  b.spike([0, 0.418, 0.2], [0, 0.41, 0.24], null, 0.026, BLACK);

  // ---- Wings (folded, along the sides) ---------------------------------------
  for (const s of [1, -1]) {
    const x = s * 0.09;
    b.stick(ell(0.02, 0.075, 0.13), BLACK, fr([x, 0.27, -0.03]));
  }

  // ---- Tail ------------------------------------------------------------------
  b.stick(box(0.08, 0.012, 0.16), BLACK, fr([0, 0.235, -0.165]));
  b.stick(box(0.08, 0.012, 0.06), RED, fr([0, 0.228, -0.27]));

  // ---- Legs and feet -----------------------------------------------------------
  for (const s of [1, -1]) {
    const hip = s === 1 ? hipL : hipR;
    const knee = s === 1 ? kneeL : kneeR;
    const ankle = s === 1 ? ankleL : ankleR;
    const x = s * 0.05;

    b.rod(hip, knee, 0.013, LEG);
    b.rod(knee, ankle, 0.011, LEG);

    // Zygodactyl foot: two toes forward, two back.
    b.spike(ankle, [x + s * 0.005, 0.005, 0.07], null, 0.009, LEG);
    b.spike(ankle, [x + s * 0.04, 0.005, 0.045], null, 0.008, LEG);
    b.spike(ankle, [x - s * 0.01, 0.005, -0.03], null, 0.008, LEG);
    b.spike(ankle, [x + s * 0.012, 0.005, -0.025], null, 0.008, LEG);
  }

  return b.root;
}
