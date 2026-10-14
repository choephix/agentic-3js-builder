import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Red-eyed tree frog on leaf",
  description: "Lime-green tree frog with ruby eyes, blue and cream flanks and orange sticky toes, clinging to a leaf.",
};

export default function build() {
  const b = createBuilder({ name: "treefrog" });
  const R = rng(7);

  const GREEN = "#7ed321", DGREEN = "#5aa615", CREAM = "#f6efd0", BLUE = "#3b6fd8",
    ORANGE = "#ff8a1c", RED = "#d8102a", BLACK = "#0b0b0b", LEAF = "#3f8f2e", LEAF2 = "#2f7424", STEM = "#6a4a2a";

  // Leaf (scenery) : root-level skeleton
  const root = b.joint("root", { at: [0, 0.0, 0] });
  const body = b.joint("body", { at: [0, 0.062, -0.005], parent: root });
  const spine = b.joint("spine", { at: [0, 0.07, 0.03], parent: body });
  const neck = b.joint("neck", { at: [0, 0.075, 0.05], parent: spine });
  const head = b.joint("head", { at: [0, 0.075, 0.06], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.068, 0.1], parent: head });

  // leaf: big tilted blade
  b.part(new THREE.BoxGeometry(0.34, 0.012, 0.5), LEAF, { at: [0, 0.006, -0.02], bone: root });
  b.part(new THREE.BoxGeometry(0.02, 0.016, 0.5), LEAF2, { at: [0, 0.011, -0.02], bone: root });
  for (let i = 0; i < 4; i++) {
    for (const s of [-1, 1]) {
      const v = b.part(new THREE.BoxGeometry(0.15, 0.004, 0.012), LEAF2, { at: [s * 0.08, 0.013, -0.16 + i * 0.1], bone: root });
      v.rotation.y = s * 0.5;
    }
  }
  // leaf tip and stem
  b.part(new THREE.ConeGeometry(0.17, 0.12, 4), LEAF, { at: [0, 0.006, 0.29], bone: root }).rotation.set(Math.PI / 2, 0, Math.PI / 4);
  b.part(new THREE.CylinderGeometry(0.008, 0.01, 0.2, 6), STEM, { at: [0, 0.0, -0.3], bone: root }).rotation.x = Math.PI / 2;

  // torso
  const torso = b.part(new THREE.SphereGeometry(0.075, 10, 8), GREEN, { at: [0, 0.07, -0.01], bone: body });
  torso.scale.set(1, 0.75, 1.35);
  const belly = b.part(new THREE.SphereGeometry(0.07, 10, 8), CREAM, { at: [0, 0.052, 0.0], bone: body });
  belly.scale.set(0.98, 0.65, 1.3);
  // rump
  const rump = b.part(new THREE.SphereGeometry(0.065, 8, 6), GREEN, { at: [0, 0.065, -0.07], bone: body });
  rump.scale.set(1.15, 0.8, 1);
  // flank stripes
  for (const s of [-1, 1]) {
    const bl = b.part(new THREE.BoxGeometry(0.01, 0.018, 0.12), BLUE, { at: [s * 0.072, 0.062, -0.02], bone: body });
    bl.rotation.z = s * -0.25;
    const cr = b.part(new THREE.BoxGeometry(0.01, 0.012, 0.12), CREAM, { at: [s * 0.075, 0.08, -0.02], bone: body });
    cr.rotation.z = s * -0.25;
    const cr2 = b.part(new THREE.BoxGeometry(0.01, 0.01, 0.1), CREAM, { at: [s * 0.07, 0.046, -0.02], bone: body });
    cr2.rotation.z = s * -0.2;
  }
  // back darker patches
  for (let i = 0; i < 5; i++) {
    const p = b.part(new THREE.SphereGeometry(0.014, 6, 4), DGREEN, { at: [(R() - 0.5) * 0.08, 0.108 - Math.abs(i - 2) * 0.004, -0.06 + i * 0.015], bone: body });
    p.scale.set(1, 0.4, 1);
  }

  // head
  const skull = b.part(new THREE.SphereGeometry(0.06, 10, 8), GREEN, { at: [0, 0.088, 0.075], bone: head });
  skull.scale.set(1.1, 0.8, 1);
  const upper = b.part(new THREE.BoxGeometry(0.1, 0.022, 0.07), GREEN, { at: [0, 0.075, 0.115], bone: head });
  const snout = b.part(new THREE.SphereGeometry(0.04, 8, 6), GREEN, { at: [0, 0.078, 0.125], bone: head });
  snout.scale.set(1.2, 0.55, 0.8);
  const lower = b.part(new THREE.BoxGeometry(0.092, 0.014, 0.07), CREAM, { at: [0, 0.058, 0.11], bone: jaw });
  b.part(new THREE.BoxGeometry(0.094, 0.004, 0.072), DGREEN, { at: [0, 0.067, 0.11], bone: jaw });
  // nostrils
  for (const s of [-1, 1]) b.part(new THREE.SphereGeometry(0.004, 5, 4), BLACK, { at: [s * 0.015, 0.088, 0.152], bone: head });
  // throat
  const throat = b.part(new THREE.SphereGeometry(0.04, 8, 6), CREAM, { at: [0, 0.05, 0.09], bone: jaw });
  throat.scale.set(1, 0.6, 1);

  // eyes
  for (const s of [-1, 1]) {
    const eyeJ = b.joint(s > 0 ? "eyeL" : "eyeR", { at: [s * 0.05, 0.12, 0.09], parent: head });
    b.part(new THREE.SphereGeometry(0.036, 12, 10), RED, { at: [s * 0.05, 0.12, 0.09], bone: eyeJ });
    // orange ring
    b.part(new THREE.SphereGeometry(0.038, 8, 6, 0, Math.PI * 2, 0, 0.5), "#ff5a1a", { at: [s * 0.05, 0.12, 0.09], bone: eyeJ });
    // pupil slit
    const p = b.part(new THREE.BoxGeometry(0.007, 0.05, 0.006), BLACK, { at: [s * 0.062, 0.12, 0.122], bone: eyeJ });
    p.rotation.y = s * 0.35;
    // highlight
    b.part(new THREE.SphereGeometry(0.005, 5, 4), "#ffffff", { at: [s * 0.055, 0.133, 0.12], bone: eyeJ });
    // lid
    const lid = b.part(new THREE.SphereGeometry(0.038, 8, 5, 0, Math.PI * 2, 0, 0.9), DGREEN, { at: [s * 0.05, 0.123, 0.088], bone: eyeJ });
    lid.scale.set(1, 0.9, 1);
    lid.position.y += 0.002;
  }

  // limbs
  function toe(bone: THREE.Object3D, x: number, y: number, z: number, ang: number, len: number) {
    const t = b.part(new THREE.CylinderGeometry(0.005, 0.006, len, 5), ORANGE, { at: [x, y, z], bone });
    t.rotation.set(Math.PI / 2, 0, 0);
    t.rotation.order = "YXZ";
    t.rotation.y = ang;
    t.position.set(x + Math.sin(ang) * len * 0.5, y, z + Math.cos(ang) * len * 0.5);
    const pad = b.part(new THREE.SphereGeometry(0.012, 8, 6), ORANGE, { at: [x + Math.sin(ang) * len, y, z + Math.cos(ang) * len], bone });
    pad.scale.set(1, 0.45, 1);
    const pad2 = b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.002, 8), "#ffc26b", { at: [x + Math.sin(ang) * len, y + 0.006, z + Math.cos(ang) * len], bone });
  }

  for (const s of [-1, 1]) {
    const n = s > 0 ? "L" : "R";
    // front leg
    const shoulder = b.joint("shoulder" + n, { at: [s * 0.06, 0.07, 0.03], parent: spine });
    const elbow = b.joint("elbow" + n, { at: [s * 0.095, 0.05, 0.05], parent: shoulder });
    const wrist = b.joint("wrist" + n, { at: [s * 0.1, 0.014, 0.085], parent: elbow });
    b.rod([s * 0.06, 0.07, 0.03], [s * 0.095, 0.05, 0.05], 0.014, GREEN);
    b.rod([s * 0.095, 0.05, 0.05], [s * 0.1, 0.016, 0.085], 0.011, GREEN);
    b.part(new THREE.SphereGeometry(0.014, 6, 5), GREEN, { at: [s * 0.095, 0.05, 0.05], bone: elbow });
    const hand = b.part(new THREE.BoxGeometry(0.03, 0.01, 0.025), GREEN, { at: [s * 0.1, 0.01, 0.092], bone: wrist });
    for (let i = 0; i < 4; i++) {
      const ang = (i - 1.5) * 0.4;
      toe(wrist, s * 0.1 + (i - 1.5) * 0.008, 0.01, 0.1, ang, 0.03);
    }
    // hind leg
    const hip = b.joint("hip" + n, { at: [s * 0.065, 0.06, -0.06], parent: body });
    const knee = b.joint("knee" + n, { at: [s * 0.12, 0.075, -0.0], parent: hip });
    const ankle = b.joint("ankle" + n, { at: [s * 0.14, 0.03, -0.1], parent: knee });
    const foot = b.joint("foot" + n, { at: [s * 0.14, 0.012, -0.08], parent: ankle });
    const thigh = b.part(new THREE.SphereGeometry(0.04, 8, 6), GREEN, { at: [s * 0.09, 0.065, -0.05], bone: hip });
    thigh.scale.set(0.7, 0.9, 1.4);
    b.part(new THREE.SphereGeometry(0.018, 6, 5), GREEN, { at: [s * 0.12, 0.075, -0.0], bone: knee });
    b.rod([s * 0.12, 0.075, -0.0], [s * 0.14, 0.03, -0.1], 0.014, GREEN);
    b.part(new THREE.SphereGeometry(0.012, 6, 5), GREEN, { at: [s * 0.14, 0.03, -0.1], bone: ankle });
    b.rod([s * 0.14, 0.03, -0.1], [s * 0.14, 0.014, -0.06], 0.009, GREEN);
    b.part(new THREE.BoxGeometry(0.03, 0.01, 0.04), GREEN, { at: [s * 0.14, 0.014, -0.045], bone: foot });
    // thigh stripe
    const st = b.part(new THREE.BoxGeometry(0.006, 0.012, 0.08), BLUE, { at: [s * 0.125, 0.07, -0.05], bone: hip });
    st.rotation.z = s * -0.3;
    for (let i = 0; i < 4; i++) {
      const ang = (i - 1.5) * 0.4;
      toe(foot, s * 0.14 + (i - 1.5) * 0.008, 0.01, -0.03, ang, 0.035);
    }
  }

  return b.root;
}
