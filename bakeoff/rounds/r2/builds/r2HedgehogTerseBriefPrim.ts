import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description: "Stylized hedgehog with spiky quill coat, snout, ears, legs and a rigged jaw.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const R = rng(7);

  const skin = "#d9b48a";
  const skinDark = "#a67c52";
  const quillA = "#5b4332";
  const quillB = "#8a6a48";
  const quillC = "#2f241b";
  const nose = "#1a1210";

  // Skeleton (faces +Z)
  const root = b.joint("root", { at: [0, 0.1, 0] });
  const spine1 = b.joint("spine1", { at: [0, 0.12, -0.02], parent: root });
  const spine2 = b.joint("spine2", { at: [0, 0.13, 0.1], parent: spine1 });
  const neck = b.joint("neck", { at: [0, 0.12, 0.2], parent: spine2 });
  const head = b.joint("head", { at: [0, 0.11, 0.26], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.06, 0.32], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.1, -0.2], parent: root });

  const legs: Record<string, any> = {};
  const legDefs: [string, number, number][] = [
    ["FL", 0.09, 0.14], ["FR", -0.09, 0.14], ["BL", 0.09, -0.1], ["BR", -0.09, -0.1],
  ];
  for (const [n, x, z] of legDefs) {
    const hip = b.joint("hip" + n, { at: [x, 0.08, z], parent: root });
    const knee = b.joint("knee" + n, { at: [x, 0.04, z + 0.01], parent: hip });
    const foot = b.joint("foot" + n, { at: [x, 0.012, z + 0.03], parent: knee });
    legs[n] = { hip, knee, foot };
  }

  // Body: belly/skin ellipsoid
  b.part(new THREE.SphereGeometry(0.15, 10, 8), skin, {
    at: [0, 0.14, 0.0], bone: spine1, scale: [0.9, 0.8, 1.35],
  } as any);
  // Front face mass
  b.part(new THREE.SphereGeometry(0.1, 9, 7), skin, {
    at: [0, 0.12, 0.2], bone: head, scale: [0.9, 0.85, 1.1],
  } as any);
  // Snout cone pointing +Z
  b.part(new THREE.ConeGeometry(0.06, 0.2, 8), skin, {
    at: [0, 0.095, 0.37], bone: head, aim: [0, 0.095, 0.5],
  } as any);
  b.part(new THREE.SphereGeometry(0.022, 8, 6), nose, { at: [0, 0.095, 0.47], bone: head });

  // Lower jaw
  b.part(new THREE.BoxGeometry(0.07, 0.02, 0.13), skinDark, { at: [0, 0.055, 0.38], bone: jaw });

  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), "#0a0a0a", { at: [s * 0.055, 0.15, 0.31], bone: head });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), "#ffffff", { at: [s * 0.058, 0.157, 0.328], bone: head });
    // ears
    b.part(new THREE.SphereGeometry(0.03, 7, 5), skinDark, {
      at: [s * 0.085, 0.19, 0.22], bone: head, scale: [0.6, 1, 0.8],
    } as any);
    // cheek blush
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#e79a8a", { at: [s * 0.065, 0.1, 0.36], bone: head });
  }
  // brow stripe
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.05), skinDark, { at: [0, 0.2, 0.26], bone: head });

  // Legs
  for (const n in legs) {
    const L = legs[n];
    b.capsule(L.hip, L.knee, 0.022, skinDark);
    b.capsule(L.knee, L.foot, 0.018, skinDark);
    const p = L.foot.position ? L.foot : L.foot;
    const fx = legDefs.find((d) => d[0] === n)!;
    b.part(new THREE.BoxGeometry(0.05, 0.026, 0.07), skinDark, {
      at: [fx[1], 0.013, fx[2] + 0.055], bone: L.foot,
    });
    for (const t of [-1, 0, 1]) {
      b.part(new THREE.BoxGeometry(0.008, 0.01, 0.02), "#3a2a20", {
        at: [fx[1] + t * 0.015, 0.008, fx[2] + 0.095], bone: L.foot,
      });
    }
  }

  // Tail nub
  b.part(new THREE.ConeGeometry(0.025, 0.07, 6), skinDark, {
    at: [0, 0.09, -0.24], bone: tail1, aim: [0, 0.07, -0.4],
  } as any);

  // Quill coat: dome of spikes over back
  const colors = [quillA, quillB, quillC, quillA];
  const count = 230;
  for (let i = 0; i < count; i++) {
    // sample the upper-back hemisphere, avoid the face
    const az = R() * Math.PI * 2;
    const el = Math.acos(1 - R() * 0.95); // 0 = top
    let x = Math.sin(el) * Math.cos(az);
    let y = Math.cos(el);
    let z = Math.sin(el) * Math.sin(az);
    // ellipsoid body radii
    const rx = 0.15 * 0.9, ry = 0.15 * 0.8 + 0.02, rz = 0.15 * 1.35;
    // skip front face region
    if (z > 0.72 && y < 0.8) continue;
    if (y < 0.12) continue;
    const base: [number, number, number] = [x * rx, 0.14 + y * ry, z * rz];
    const dir = new THREE.Vector3(x / 0.9, y / 0.8, z / 1.35).normalize();
    // quills sweep backward
    dir.add(new THREE.Vector3(0, 0.05, -0.55)).normalize();
    const len = 0.09 + R() * 0.05;
    const tip: [number, number, number] = [
      base[0] + dir.x * len, base[1] + dir.y * len, base[2] + dir.z * len,
    ];
    const q = new THREE.ConeGeometry(0.013, len, 4);
    b.part(q, colors[i % colors.length], {
      at: [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2],
      aim: tip,
      bone: i % 5 === 0 ? spine2 : spine1,
    } as any);
  }
  // Fringe of quills over forehead
  for (let i = 0; i < 9; i++) {
    const a = (i / 8 - 0.5) * 2.2;
    const base = [Math.sin(a) * 0.1, 0.21, 0.2 + Math.cos(a) * 0.04];
    const tip = [base[0] * 1.3, 0.26, base[2] - 0.02];
    b.part(new THREE.ConeGeometry(0.012, 0.06, 4), i % 2 ? quillB : quillA, {
      at: [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2],
      aim: tip, bone: head,
    } as any);
  }

  return b.root;
}
