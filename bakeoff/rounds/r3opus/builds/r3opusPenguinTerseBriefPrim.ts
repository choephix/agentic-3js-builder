import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "King Penguin",
  description:
    "A stylized low-poly king penguin in a rigging rest pose, with its flippers spread wide. It has a slate back, a silver mantle, a white belly with feather flecks, a golden chest blush, orange ear patches, a split beak with a hinged jaw, and webbed feet.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "kingPenguin" });
  const rand = rng(7);

  // ---------- palette ----------
  const C = {
    black: "#1a1f27",
    slate: "#2b3440",
    mantle: "#6b7b8e",
    white: "#f6f3ec",
    fleck: "#d9dee6",
    gold: "#ffc94a",
    orange: "#ff9a2e",
    ear: "#ff8a1f",
    beak: "#20242c",
    mandible: "#ff7a3d",
    foot: "#3a3f4a",
    claw: "#15181d",
    iris: "#4a2e1c",
    pupil: "#08090b",
    shine: "#ffffff",
  };

  // ---------- helpers ----------
  const ell = (r: V, w = 10, h = 8) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(r[0], r[1], r[2]);
    return g;
  };
  // cone whose tip points +Z
  const coneZ = (radius: number, height: number, seg = 6) => {
    const g = new THREE.ConeGeometry(radius, height, seg);
    g.rotateX(Math.PI / 2);
    return g;
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.joint("spine", { at: [0, 0.36, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.5, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.58, 0], parent: chest });
  const head = b.joint("head", { at: [0, 0.64, 0.01], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.655, 0.09], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.13, -0.07], parent: hips });
  b.joint("tail2", { at: [0, 0.1, -0.15], parent: tail1 });

  const side = (s: number, n: string) => {
    const L = s > 0 ? "L" : "R";
    const shoulder = b.joint(`shoulder${L}`, { at: [0.12 * s, 0.5, 0], parent: chest });
    const elbow = b.joint(`elbow${L}`, { at: [0.21 * s, 0.49, 0], parent: shoulder });
    b.joint(`flipperTip${L}`, { at: [0.315 * s, 0.47, 0], parent: elbow });
    const hip = b.joint(`hip${L}`, { at: [0.06 * s, 0.17, 0.02], parent: hips });
    const ankle = b.joint(`ankle${L}`, { at: [0.065 * s, 0.035, 0.045], parent: hip });
    b.joint(`toe${L}`, { at: [0.065 * s, 0.012, 0.125], parent: ankle });
    return { shoulder, elbow, hip, ankle, n };
  };
  const sides = [side(1, "L"), side(-1, "R")];

  // ---------- body ----------
  // core slate egg
  b.part(ell([0.15, 0.26, 0.14], 12, 10), C.slate, { at: [0, 0.33, 0], bone: spine });
  // silver mantle on the back (black rim shows at the sides)
  b.part(ell([0.138, 0.235, 0.122], 12, 10), C.mantle, { at: [0, 0.36, -0.035], bone: chest });
  // white belly bulging forward
  b.part(ell([0.13, 0.23, 0.12], 12, 10), C.white, { at: [0, 0.32, 0.03], bone: spine });
  // golden chest blush
  b.part(ell([0.085, 0.065, 0.04], 10, 6), C.gold, { at: [0, 0.525, 0.07], bone: chest });
  b.part(ell([0.055, 0.04, 0.03], 8, 6), C.orange, { at: [0, 0.56, 0.072], bone: chest });

  // belly feather flecks in staggered rows
  const bc: V = [0, 0.32, 0.03];
  const br: V = [0.13, 0.23, 0.12];
  for (let row = 0; row < 7; row++) {
    const phi = -0.75 + row * 0.2;
    const cols = 5 + (row % 2);
    for (let c = 0; c < cols; c++) {
      const th = -0.55 + (c + (row % 2 ? 0 : 0.5)) * (1.1 / 5) + (rand() - 0.5) * 0.05;
      const p: V = [
        bc[0] + br[0] * Math.cos(phi) * Math.sin(th) * 0.995,
        bc[1] + br[1] * Math.sin(phi) * 0.995,
        bc[2] + br[2] * Math.cos(phi) * Math.cos(th) * 0.995,
      ];
      b.part(ell([0.007, 0.006, 0.007], 6, 4), C.fleck, {
        at: p,
        bone: p[1] > 0.43 ? chest : p[1] > 0.28 ? spine : hips,
      });
    }
  }

  // ---------- head ----------
  const hc: V = [0, 0.66, 0.01];
  b.part(ell([0.1, 0.1, 0.1], 10, 8), C.black, { at: hc, bone: head });
  // crown bump for character
  b.part(ell([0.07, 0.04, 0.07], 8, 6), C.black, { at: [0, 0.73, -0.005], bone: head });

  // upper beak (long, slightly hooked)
  const upper = coneZ(0.022, 0.1, 6);
  upper.scale(1, 0.7, 1);
  b.part(upper, C.beak, { at: [0, 0.672, 0.135], bone: head });
  const hook = coneZ(0.008, 0.025, 5);
  hook.rotateX(0.5);
  b.part(hook, C.beak, { at: [0, 0.668, 0.183], bone: head });
  // lower mandible on the jaw (orange plate)
  const lower = coneZ(0.017, 0.085, 6);
  lower.scale(1, 0.6, 1);
  b.part(lower, C.mandible, { at: [0, 0.655, 0.128], bone: jaw });

  for (const s of [1, -1]) {
    // orange stripe on the beak sides
    b.part(new THREE.BoxGeometry(0.006, 0.008, 0.045), C.mandible, {
      at: [0.0155 * s, 0.664, 0.118],
      bone: jaw,
    });

    // eyes
    const d = new THREE.Vector3(0.55 * s, 0.25, 0.8).normalize();
    const ep = (r: number): V => [hc[0] + d.x * r, hc[1] + d.y * r, hc[2] + d.z * r];
    b.part(ell([0.017, 0.017, 0.017], 8, 6), C.slate, { at: ep(0.092), bone: head });
    b.part(ell([0.013, 0.013, 0.013], 8, 6), C.iris, { at: ep(0.098), bone: head });
    b.part(ell([0.008, 0.008, 0.008], 6, 4), C.pupil, { at: ep(0.105), bone: head });
    const hl = ep(0.11);
    b.part(ell([0.0035, 0.0035, 0.0035], 5, 4), C.shine, {
      at: [hl[0] + 0.004 * s, hl[1] + 0.005, hl[2]],
      bone: head,
    });

    // orange ear patches and the stripe that runs down to the chest
    b.part(ell([0.014, 0.042, 0.026], 8, 6), C.ear, { at: [0.086 * s, 0.645, -0.015], bone: head });
    const a = new THREE.Vector3(0.088 * s, 0.61, 0.0);
    const z = new THREE.Vector3(0.055 * s, 0.545, 0.07);
    for (let i = 0; i < 4; i++) {
      const p = a.clone().lerp(z, i / 3);
      const r = 0.017 - i * 0.002;
      b.part(ell([r, r * 1.3, r], 6, 5), C.orange, {
        at: [p.x, p.y, p.z],
        bone: i < 2 ? neck : chest,
      });
    }
  }

  // ---------- flippers (spread in rest pose) ----------
  for (const sd of sides) {
    const s = sd.n === "L" ? 1 : -1;
    // upper flipper
    b.part(ell([0.065, 0.036, 0.014], 10, 6), C.slate, { at: [0.165 * s, 0.495, 0], bone: sd.shoulder });
    b.part(ell([0.055, 0.026, 0.009], 8, 6), C.white, { at: [0.168 * s, 0.493, 0.007], bone: sd.shoulder });
    // forearm/tip
    b.part(ell([0.062, 0.028, 0.012], 10, 6), C.slate, { at: [0.262 * s, 0.479, 0], bone: sd.elbow });
    b.part(ell([0.05, 0.019, 0.008], 8, 6), C.white, { at: [0.258 * s, 0.479, 0.006], bone: sd.elbow });
    // leading edge accent
    b.part(ell([0.09, 0.006, 0.006], 8, 4), C.black, { at: [0.215 * s, 0.522, 0.004], bone: sd.shoulder });
  }

  // ---------- legs & feet ----------
  for (const sd of sides) {
    const s = sd.n === "L" ? 1 : -1;
    const leg = new THREE.CylinderGeometry(0.02, 0.024, 0.14, 6);
    b.part(leg, C.foot, { at: [0.062 * s, 0.1, 0.032], bone: sd.hip });
    // ankle knuckle
    b.part(ell([0.026, 0.02, 0.026], 6, 5), C.foot, { at: [0.065 * s, 0.035, 0.045], bone: sd.ankle });
    // foot pad
    b.part(new THREE.BoxGeometry(0.056, 0.022, 0.06), C.foot, { at: [0.065 * s, 0.011, 0.07], bone: sd.ankle });
    // three webbed toes + claws
    for (const k of [-1, 0, 1]) {
      const ang = k * 0.38 * s;
      const toe = coneZ(0.012, 0.06, 5);
      toe.scale(1, 0.55, 1);
      toe.rotateY(ang);
      const tx = 0.065 * s + Math.sin(ang) * 0.03 + k * 0.012 * s;
      const tz = 0.11 + Math.cos(ang) * 0.01;
      b.part(toe, C.foot, { at: [tx, 0.008, tz], bone: sd.ankle });
      const claw = coneZ(0.005, 0.016, 4);
      claw.rotateY(ang);
      b.part(claw, C.claw, {
        at: [tx + Math.sin(ang) * 0.034, 0.006, tz + Math.cos(ang) * 0.034],
        bone: sd.ankle,
      });
    }
    // web between toes
    b.part(new THREE.BoxGeometry(0.06, 0.006, 0.03), C.foot, { at: [0.065 * s, 0.004, 0.11], bone: sd.ankle });
  }

  // ---------- tail ----------
  const tail = new THREE.ConeGeometry(0.035, 0.08, 4);
  tail.rotateX(-Math.PI / 2 - 0.45);
  tail.scale(1.3, 0.5, 1);
  b.part(tail, C.black, { at: [0, 0.115, -0.105], bone: tail1 });

  return b.root;
}
