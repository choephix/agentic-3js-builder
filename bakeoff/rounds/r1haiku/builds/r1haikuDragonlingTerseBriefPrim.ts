import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

type V = [number, number, number];

const C = {
  body: "#5fae62",
  back: "#3f8a4e",
  belly: "#ece39a",
  horn: "#f3e3b5",
  spike: "#e8a13a",
  wing: "#e0708f",
  wingRib: "#b9466e",
  eyeWhite: "#fff3c4",
  eye: "#ffd23f",
  pupil: "#1b1b22",
  nose: "#2f6b3c",
};

const mid = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const mirrorX = (p: V): V => [-p[0], p[1], p[2]];

export const meta = {
  name: "Baby Dragon",
  description: "A chubby green baby dragon in a rest pose, with pink wing membranes, a rigged neck, jaw and tail.",
};

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });
  const rand = rng(11);

  // ---------- helpers ----------

  // Ellipsoid (unit sphere scaled) centred at c.
  const ball = (c: V, s: V, color: string) => {
    b.part({
      geometry: new THREE.SphereGeometry(1, 12, 10),
      color,
      at: c,
      scale: s,
    });
  };

  // Box centred at c with full size s.
  const block = (c: V, s: V, color: string) => {
    b.part({
      geometry: new THREE.BoxGeometry(1, 1, 1),
      color,
      at: c,
      scale: s,
    });
  };

  // Tapered cylinder from a (radius ra) to c (radius rc).
  const rod = (a: V, c: V, ra: number, rc: number, color: string, sides = 8) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const L = Math.hypot(d[0], d[1], d[2]);
    b.part({
      geometry: new THREE.CylinderGeometry(rc, ra, L, sides),
      color,
      at: mid(a, c),
      aim: c,
    });
  };

  // Pointed cone from base along the tip direction.
  const cone = (base: V, tip: V, r: number, color: string) => {
    rod(base, tip, r, 0.004, color, 6);
  };

  // Flat wing membrane between two edges, plus visible ribs.
  const wing = (s: number) => {
    const sh: V = [s * 0.09, 0.45, -0.02];
    const wr: V = [s * 0.27, 0.6, -0.05];
    const tip: V = [s * 0.42, 0.52, -0.16];
    const knuckle: V = [s * 0.34, 0.45, -0.22];
    const bodyTop: V = [s * 0.07, 0.36, -0.1];
    const trailMid: V = [s * 0.2, 0.34, -0.2];
    const trailEnd: V = [s * 0.34, 0.41, -0.24];

    b.membrane([sh, wr, tip], [bodyTop, trailMid, trailEnd, tip], { color: C.wing });

    rod(sh, wr, 0.022, 0.016, C.wingRib);
    rod(wr, tip, 0.018, 0.01, C.wingRib);
    rod(wr, knuckle, 0.014, 0.008, C.wingRib);
    rod(knuckle, trailEnd, 0.01, 0.006, C.wingRib);
  };

  // ---------- skeleton ----------

  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const chest = b.joint("chest", { at: [0, 0.38, 0.12], parent: hips });
  const neck1 = b.joint("neck1", { at: [0, 0.46, 0.22], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 0.52, 0.3], parent: neck1 });
  const head = b.joint("head", { at: [0, 0.58, 0.38], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 0.55, 0.44], parent: head });

  const t1 = b.joint("tail1", { at: [0, 0.3, -0.1], parent: hips });
  const t2 = b.joint("tail2", { at: [0, 0.27, -0.22], parent: t1 });
  const t3 = b.joint("tail3", { at: [0, 0.23, -0.34], parent: t2 });
  const t4 = b.joint("tail4", { at: [0, 0.2, -0.45], parent: t3 });

  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;

    const shoulder = b.joint(`shoulder${side}`, { at: [s * 0.11, 0.36, 0.1], parent: chest });
    const elbow = b.joint(`elbow${side}`, { at: [s * 0.13, 0.2, 0.1], parent: shoulder });
    b.joint(`wrist${side}`, { at: [s * 0.13, 0.06, 0.13], parent: elbow });

    const hip = b.joint(`hip${side}`, { at: [s * 0.12, 0.3, -0.04], parent: hips });
    const knee = b.joint(`knee${side}`, { at: [s * 0.13, 0.15, 0.02], parent: hip });
    b.joint(`ankle${side}`, { at: [s * 0.12, 0.04, -0.01], parent: knee });

    const wingShoulder = b.joint(`wingShoulder${side}`, { at: [s * 0.09, 0.45, -0.02], parent: chest });
    const wingWrist = b.joint(`wingWrist${side}`, { at: [s * 0.27, 0.6, -0.05], parent: wingShoulder });
    b.joint(`wingTip${side}`, { at: [s * 0.42, 0.52, -0.16], parent: wingWrist });
  }

  // ---------- torso ----------

  // Chubby round body with a lighter belly.
  ball([0, 0.33, 0.02], [0.14, 0.13, 0.17], C.body);
  ball([0, 0.29, 0.07], [0.095, 0.085, 0.12], C.belly);
  // Darker back plate for countershading.
  ball([0, 0.43, -0.02], [0.095, 0.05, 0.13], C.back);

  // Dorsal spikes along the back, shrinking toward the tail.
  for (let i = 0; i < 7; i++) {
    const z = -0.13 + i * 0.05;
    const top = 0.33 + 0.13 * Math.sqrt(Math.max(0, 1 - ((z - 0.02) / 0.18) ** 2));
    const h = 0.05 + rand() * 0.02 - i * 0.004;
    cone([0, top - 0.01, z], [0, top + h, z - 0.012], 0.018, C.spike);
  }

  // ---------- neck and head ----------

  rod([0, 0.4, 0.14], [0, 0.46, 0.22], 0.06, 0.05, C.body);
  rod([0, 0.46, 0.22], [0, 0.52, 0.3], 0.05, 0.045, C.body);
  rod([0, 0.52, 0.3], [0, 0.57, 0.36], 0.045, 0.04, C.body);

  // Skull: rounded, with a chubby cheek.
  ball([0, 0.6, 0.41], [0.11, 0.1, 0.11], C.body);
  ball([0, 0.58, 0.44], [0.08, 0.07, 0.08], C.belly);

  // Upper snout (part of the upper jaw region of the head).
  block([0, 0.6, 0.52], [0.09, 0.07, 0.12], C.body);
  // Nostrils.
  ball([-0.02, 0.625, 0.575], [0.007, 0.006, 0.006], C.nose);
  ball([0.02, 0.625, 0.575], [0.007, 0.006, 0.006], C.nose);

  // Lower jaw, rigged to the jaw joint.
  block([0, 0.55, 0.48], [0.07, 0.03, 0.13], C.belly);

  // Eyes with a bright iris and a dark pupil, set into the skull.
  for (const s of [1, -1]) {
    ball([s * 0.07, 0.635, 0.45], [0.026, 0.028, 0.02], C.eyeWhite);
    ball([s * 0.075, 0.637, 0.466], [0.016, 0.018, 0.01], C.eye);
    ball([s * 0.078, 0.637, 0.474], [0.008, 0.009, 0.005], C.pupil);
  }

  // Swept-back horns and brow ridges.
  for (const s of [1, -1]) {
    rod([s * 0.06, 0.68, 0.38], [s * 0.1, 0.77, 0.33], 0.02, 0.006, C.horn, 7);
    rod([s * 0.07, 0.65, 0.42], [s * 0.095, 0.66, 0.4], 0.012, 0.008, C.back, 6);
  }

  // ---------- wings ----------

  wing(1);
  wing(-1);

  // ---------- legs ----------

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";

    // Front leg: shoulder ball, arm, forearm, and a stubby paw.
    ball([s * 0.11, 0.36, 0.1], [0.04, 0.04, 0.04], C.body);
    rod([s * 0.11, 0.36, 0.1], [s * 0.13, 0.2, 0.1], 0.04, 0.03, C.body);
    rod([s * 0.13, 0.2, 0.1], [s * 0.13, 0.06, 0.13], 0.03, 0.024, C.body);
    block([s * 0.13, 0.035, 0.15], [0.07, 0.05, 0.08], C.belly);
    for (const dx of [-0.02, 0, 0.02]) {
      cone([s * 0.13 + dx, 0.04, 0.19], [s * 0.13 + dx * 1.2, 0.03, 0.215], 0.009, C.claw);
    }

    // Hind leg: big thigh ball, shin, and a larger foot.
    ball([s * 0.12, 0.27, -0.03], [0.06, 0.06, 0.06], C.body);
    rod([s * 0.13, 0.15, 0.02], [s * 0.12, 0.04, -0.01], 0.034, 0.026, C.body);
    ball([s * 0.13, 0.15, 0.02], [0.034, 0.034, 0.034], C.body);
    block([s * 0.12, 0.03, 0.05], [0.09, 0.06, 0.13], C.belly);
    for (const dx of [-0.025, 0, 0.025]) {
      cone([s * 0.12 + dx, 0.035, 0.115], [s * 0.12 + dx * 1.2, 0.025, 0.14], 0.01, C.claw);
    }
    void side;
  }

  // ---------- tail ----------

  rod([0, 0.3, -0.1], [0, 0.27, -0.22], 0.06, 0.05, C.body);
  rod([0, 0.27, -0.22], [0, 0.23, -0.34], 0.05, 0.035, C.body);
  rod([0, 0.23, -0.34], [0, 0.2, -0.45], 0.035, 0.025, C.body);
  rod([0, 0.2, -0.45], [0, 0.19, -0.56], 0.025, 0.018, C.back);
  // Spade-shaped tail tip.
  b.part({
    geometry: new THREE.SphereGeometry(1, 10, 8),
    color: C.spike,
    at: [0, 0.19, -0.64],
    scale: [0.045, 0.05, 0.012],
  });
  cone([0, 0.19, -0.6], [0, 0.19, -0.7], 0.012, C.spike);

  return b.root;
}
