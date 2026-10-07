```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  scales,
  stripes,
  mottle,
  countershade,
  paint,
  interpolate,
} from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description:
    "Nine-banded armadillo: domed plated shell with ridged middle bands, pointed snout with a hinged jaw, tall ears, stubby clawed legs and a long ringed tail, all rigged.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "armadillo" });

  // ---------- paints ----------
  const SHELL_A = "#8d7b66";
  const SHELL_B = "#7a6955";
  const EDGE = "#4d4034";
  const scalePaint = scales([SHELL_A, SHELL_B, "#9a8872"], EDGE, { size: 0.022, width: 0.18, seed: 3 });
  const bandPaint = stripes("#9a8872", "#54463a", { size: 0.0178, axis: "z", width: 0.3, wobble: 0.02 });
  const shellPaint = paint((p) => (p.z > -0.125 && p.z < 0.05 ? bandPaint : scalePaint));
  const skinPaint = mottle("#d1ae96", "#c29a82", { size: 0.03, seed: 2 });
  const bodyPaint = countershade(shellPaint, skinPaint, { level: -0.25, soft: 0.15 });
  const headPaint = countershade(scalePaint, skinPaint, { level: -0.1, soft: 0.2 });
  const tailPaint = scales([SHELL_A, SHELL_B], EDGE, { size: 0.018, width: 0.2, seed: 5 });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.17, -0.05], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.17, -0.22],
      [0, 0.18, -0.05],
      [0, 0.18, 0.1],
      [0, 0.17, 0.22],
    ]),
    { parent: "root", names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  b.joint("head", { parent: "spine3", at: [0, 0.17, 0.2], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.14, 0.25], dir: [0, 0, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.04, 0.21, 0.215], dir: [0.3, 1, 0] });
  b.joint("earR", { parent: "head", at: [-0.04, 0.21, 0.215], dir: [-0.3, 1, 0] });

  // ---------- body ----------
  const st = [
    { z: -0.27, w: 0.08, h: 0.1, y: 0.15 },
    { z: -0.2, w: 0.19, h: 0.2, y: 0.17 },
    { z: -0.05, w: 0.22, h: 0.23, y: 0.18 },
    { z: 0.08, w: 0.22, h: 0.23, y: 0.18 },
    { z: 0.17, w: 0.17, h: 0.19, y: 0.17 },
    { z: 0.22, w: 0.1, h: 0.12, y: 0.165 },
  ];
  b.loft(
    st.map((s) => ({ at: [0, s.y, s.z] as [number, number, number], w: s.w, h: s.h })),
    { color: bodyPaint, bone: spine, name: "shell" },
  );

  // raised ridges on the movable bands
  const zs = st.map((s) => s.z);
  for (let i = 0; i < 9; i++) {
    const z = -0.115 + i * 0.0178;
    const hw = interpolate(zs, st.map((s) => s.w / 2), z);
    const hh = interpolate(zs, st.map((s) => s.h / 2), z);
    const cy = interpolate(zs, st.map((s) => s.y), z);
    const pts: [number, number, number][] = [];
    for (let k = 0; k <= 12; k++) {
      const a = ((-15 + (210 * k) / 12) * Math.PI) / 180;
      pts.push([hw * 1.0 * Math.cos(a), cy + hh * 1.0 * Math.sin(a), z]);
    }
    b.sweep(catmull(pts), { radius: 0.007, color: "#6a5a49", sides: 5, bone: "spine2", name: `ridge${i + 1}` });
  }

  // ---------- head ----------
  b.loft(
    [
      { at: [0, 0.17, 0.2], w: 0.1, h: 0.09 },
      { at: [0, 0.17, 0.25], w: 0.095, h: 0.085 },
      { at: [0, 0.16, 0.3], w: 0.06, h: 0.06 },
      { at: [0, 0.15, 0.35], w: 0.035, h: 0.035 },
      { at: [0, 0.145, 0.375], w: 0.02, h: 0.02 },
    ],
    { color: headPaint, bone: "head", name: "snout" },
  );
  b.loft(
    [
      { at: [0, 0.128, 0.26], w: 0.05, h: 0.026 },
      { at: [0, 0.126, 0.3], w: 0.04, h: 0.022 },
      { at: [0, 0.128, 0.335], w: 0.022, h: 0.016 },
    ],
    { color: "#d6a592", bone: "jaw", name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.014, 6, 5), "#c9737a", { at: [0, 0.15, 0.376], bone: "head", name: "nose" });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 5), "#15110f", { at: [sx * 0.044, 0.19, 0.255], bone: "head" });
    const j = sx > 0 ? "earL" : "earR";
    b.part(new THREE.SphereGeometry(0.03, 6, 5), "#a89078", {
      at: [sx * 0.045, 0.235, 0.215],
      rotation: [0, 0, -sx * 18],
      scale: [0.4, 1.5, 0.75],
      bone: j,
      name: "ear",
    });
    b.part(new THREE.SphereGeometry(0.022, 5, 4), "#d9a090", {
      at: [sx * 0.045, 0.232, 0.225],
      rotation: [0, 0, -sx * 18],
      scale: [0.3, 1.4, 0.5],
      bone: j,
      name: "earInner",
    });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.15, -0.23],
      [0, 0.13, -0.31],
      [0, 0.1, -0.4],
      [0, 0.07, -0.48],
      [0, 0.035, -0.55],
    ]),
    { parent: "root", role: "tail" },
  );
  b.sweep(tail, { radius: [0.05, 0.04, 0.03, 0.018, 0.006], color: tailPaint, name: "tailBody" });

  // ---------- legs ----------
  for (const sx of [1, -1]) {
    const s = sx > 0 ? "L" : "R";
    const front = b.chain(
      `arm${s}`,
      polyline([
        [sx * 0.1, 0.12, 0.13],
        [sx * 0.11, 0.075, 0.125],
        [sx * 0.11, 0.035, 0.15],
        [sx * 0.11, 0.02, 0.19],
      ]),
      { parent: "spine3", names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `hand${s}`], role: "arm" },
    );
    b.sweep(front, { radius: [0.036, 0.028, 0.022, 0.02], color: skinPaint, name: `foreleg${s}` });
    for (const dx of [-0.016, 0, 0.016]) {
      b.spike(
        [sx * 0.11 + dx, 0.02, 0.2],
        [sx * 0.11 + dx * 1.5, 0.006, 0.255],
        null,
        0.0065,
        { color: "#efe3c8", bone: `hand${s}`, sides: 5 },
      );
    }
    const hind = b.chain(
      `leg${s}`,
      polyline([
        [sx * 0.09, 0.12, -0.13],
        [sx * 0.1, 0.075, -0.165],
        [sx * 0.1, 0.035, -0.14],
        [sx * 0.1, 0.02, -0.09],
      ]),
      { parent: "spine1", names: [`hip${s}`, `knee${s}`, `ankle${s}`, `toe${s}`], role: "leg" },
    );
    b.sweep(hind, { radius: [0.038, 0.03, 0.023, 0.02], color: skinPaint, name: `hindleg${s}` });
    for (const dx of [-0.014, 0, 0.014]) {
      b.spike(
        [sx * 0.1 + dx, 0.02, -0.085],
        [sx * 0.1 + dx * 1.4, 0.006, -0.045],
        null,
        0.0055,
        { color: "#efe3c8", bone: `toe${s}`, sides: 5 },
      );
    }
  }

  return b.root;
}
```