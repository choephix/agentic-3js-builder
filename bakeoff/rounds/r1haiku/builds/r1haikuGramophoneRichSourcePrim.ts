import * as THREE from "three";
import { cells, createBuilder, grain, mottle, paint } from "../../../../src/index";

export const meta = {
  name: "Antique gramophone",
  description: "A wind-up gramophone on a walnut cabinet with inlaid flowers, a morning-glory brass horn, a black record with a red label, a silver tonearm, a side crank and claw feet.",
};

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", detail: 1, paintSize: 1024 });
  b.joint("body", { at: [0, 0, 0] });

  // Materials: walnut with pale inlaid flowers on the top, and brass with a warm green patina.
  const walnut = grain("#4a2e1b", "#6e4628", { size: 0.03, axis: "x", seed: 4 });
  const inlay = paint((p, n) => {
    if (n.y < 0.5) return walnut;
    const c = cells(p, 0.07, 9);
    if (c.d1 < 0.2) return "#efe3c4";
    if (c.d2 - c.d1 < 0.04) return "#c9b088";
    return walnut;
  });
  const brass = mottle("#c8943c", "#6e9a78", { size: 0.07, contrast: 0.7 });
  const silver = "#c9cdd3";
  const black = "#121212";
  const red = "#b8282d";

  // Cabinet: a walnut box on a raised base, its top carrying the inlaid pattern.
  b.part(new THREE.BoxGeometry(0.46, 0.33, 0.4), inlay, { at: [0, 0.225, 0], bone: "body", name: "cabinet" });

  // Claw feet: a brass ball under each corner, with a tapered claw reaching the floor.
  for (const [x, z] of [
    [-0.19, 0.15],
    [0.19, 0.15],
    [-0.19, -0.15],
    [0.19, -0.15],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.022, b.segments(10), b.segments(7)), brass, {
      at: [x, 0.04, z],
      bone: "body",
      name: "foot.ball",
    });
    b.part(new THREE.ConeGeometry(0.02, 0.04, b.segments(6)), brass, {
      at: [x, 0.02, z],
      rotation: [180, 0, 0],
      bone: "body",
      name: "foot.claw",
    });
  }

  // Turntable: brass plate and rim, black record, red label, spindle.
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.008, b.segments(48)), brass, {
    at: [0, 0.392, 0],
    bone: "body",
    name: "turntable",
  });
  b.part(new THREE.TorusGeometry(0.18, 0.006, b.segments(8), b.segments(48)), brass, {
    at: [0, 0.396, 0],
    rotation: [90, 0, 0],
    bone: "body",
    name: "turntable.rim",
  });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.008, b.segments(48)), black, {
    at: [0, 0.4, 0],
    bone: "body",
    name: "record",
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.008, b.segments(32)), red, {
    at: [0, 0.408, 0],
    bone: "body",
    name: "record.label",
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.03, b.segments(8)), brass, {
    at: [0, 0.42, 0],
    bone: "body",
    name: "spindle",
  });

  // Morning-glory horn: a thin brass shell spun around its axis, flaring from a narrow throat to a wide mouth.
  const throat = [0, 0.42, -0.1] as const;
  const profile: number[][] = [];
  const outer: number[][] = [];
  const inner: number[][] = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const r = 0.025 + 0.36 * Math.pow(t, 2.6);
    const y = 0.62 * t;
    outer.push([r, y]);
    inner.unshift([Math.max(r - 0.01, 0.012), y]);
  }
  profile.push(...outer, ...inner);
  b.lathe(profile, {
    color: brass,
    at: throat,
    axis: [0, 0.62, 0.78],
    segments: 24,
    name: "horn",
  });
  // Sound box where the horn meets the cabinet.
  b.part(new THREE.SphereGeometry(0.04, b.segments(14), b.segments(10)), brass, {
    at: [0, 0.4, -0.1],
    bone: "body",
    name: "soundbox",
  });

  // Tonearm: a pivot post, an S-curved arm over the record edge, and a dark headshell.
  b.capsule([0.22, 0.39, -0.12], [0.22, 0.45, -0.12], 0.014, { color: silver, name: "tonearm.pivot" });
  b.capsule([0.22, 0.45, -0.12], [0.14, 0.44, 0.02], [0.008, 0.006], { color: silver, name: "tonearm" });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.05), "#2a2a2a", {
    at: [0.135, 0.42, 0.025],
    rotation: [0, -30, 0],
    bone: "body",
    name: "headshell",
  });

  // Wind-up crank on the right side: a boss, a handle and a wooden knob.
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, b.segments(16)), brass, {
    at: [-0.236, 0.2, 0.1],
    rotation: [0, 0, 90],
    bone: "body",
    name: "crank.boss",
  });
  b.capsule([-0.25, 0.2, 0.1], [-0.31, 0.25, 0.1], 0.008, { color: brass, name: "crank.handle" });
  b.part(new THREE.SphereGeometry(0.02, b.segments(12), b.segments(8)), walnut, {
    at: [-0.32, 0.26, 0.1],
    bone: "body",
    name: "crank.knob",
  });

  return b.root;
}
