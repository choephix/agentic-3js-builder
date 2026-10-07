```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull, paint, scales, mix, smoothstep, noise } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description:
    "A stylized nine-banded armadillo: domed scapular and pelvic shields joined by nine shingled bands, scaly ringed tail, tall ears, digging claws, rigged in a neutral rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo", paintSize: 1024 });
  const Yc = 0.13;

  // ---------- palette & paints ----------
  const SHELL = ["#c9a77f", "#b8956c", "#d6b78e"];
  const EDGE = "#5b4532";
  const DARK = "#4a3626";
  const shellPaint = scales(SHELL, EDGE, { size: 0.016, width: 0.14, seed: 3 });
  const headShieldPaint = scales(["#c4a07a", "#d2b088"], EDGE, { size: 0.009, width: 0.16, seed: 8 });
  const skinPaint = paint((p) => mix("#e8c3b0", "#d6a490", noise(p, 0.03, 2)));
  const legPaint = scales(["#8a7262", "#7b6455", "#95806e"], "#4d3d33", { size: 0.009, width: 0.15, seed: 5 });
  const headPaint = paint((p, n) => {
    const t = smoothstep(0.15, 0.5, n.y) * smoothstep(0.34, 0.3, p.z);
    return mix(skinPaint.at(p, n), headShieldPaint.at(p, n), t);
  });
  const tailPaint = paint((p, n, s) => {
    const ring = (s[0] * 15) % 1;
    const d = smoothstep(0.72, 0.95, ring);
    const hi = smoothstep(0.25, 0.0, ring) * 0.25;
    return mix(mix(shellPaint.at(p, n), "#e3c79f", hi), DARK, d * 0.8);
  });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, Yc, -0.1], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", polyline([[0, Yc, -0.1], [0, Yc + 0.005, 0.0], [0, Yc, 0.1]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.chain("neck", polyline([[0, Yc, 0.1], [0, 0.15, 0.19]]), {
    parent: "chest",
    names: ["neck", "head"],
    role: "neck",
  });
  b.joint("jaw", { parent: "head", at: [0, 0.128, 0.205], aim: [0, 0.122, 0.32], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([[0, 0.12, -0.19], [0, 0.1, -0.3], [0, 0.075, -0.41], [0, 0.055, -0.52]]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---------- body core ----------
  b.loft(
    [
      { at: [0, 0.125, -0.2], w: 0.14, h: 0.1 },
      { at: [0, 0.13, -0.08], w: 0.24, h: 0.17 },
      { at: [0, 0.13, 0.06], w: 0.23, h: 0.16 },
      { at: [0, 0.135, 0.17], w: 0.13, h: 0.11 },
    ],
    { color: skinPaint, bone: [spine], name: "belly" },
  );

  // ---------- carapace ----------
  const bead = new THREE.IcosahedronGeometry(0.0075, 0);
  const domeRim = (center: number[], sc: number[], phiStart: number, bone: string) => {
    const th = 0.6 * Math.PI;
    for (let k = 0; k <= 10; k++) {
      const phi = phiStart + (Math.PI * k) / 10;
      const x = -Math.cos(phi) * Math.sin(th) * sc[0] * 1.01;
      const y = Math.cos(th) * sc[1];
      const z = Math.sin(phi) * Math.sin(th) * sc[2] * 1.01;
      b.part(bead, k % 2 ? "#9c7b58" : "#8a6a4a", {
        at: [center[0] + x, center[1] + y, center[2] + z],
        bone,
        flat: true,
        rotation: [k * 23, k * 41, 0],
      });
    }
  };
  // pelvic shield
  const pelC = [0, Yc, -0.08];
  const pelS = [0.14, 0.125, 0.135];
  b.part(new THREE.SphereGeometry(1, 10, 6, Math.PI, Math.PI, 0, 0.6 * Math.PI), shellPaint, {
    at: pelC,
    scale: pelS,
    bone: "spine1",
    name: "pelvicShield",
  });
  domeRim(pelC, pelS, Math.PI, "spine1");
  // scapular shield
  const scaC = [0, Yc, 0.07];
  const scaS = [0.135, 0.118, 0.11];
  b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI, 0, 0.6 * Math.PI), shellPaint, {
    at: scaC,
    scale: scaS,
    bone: "chest",
    name: "scapularShield",
  });
  domeRim(scaC, scaS, 0, "chest");

  // nine shingled bands
  const nBands = 9;
  const z0 = -0.08;
  const z1 = 0.07;
  const w = (z1 - z0) / nBands;
  const half = (102 * Math.PI) / 180;
  for (let i = 0; i < nBands; i++) {
    const zi = z0 + w * (i + 0.5);
    const f = (i + 0.5) / nBands;
    const rx = pelS[0] + (scaS[0] - pelS[0]) * f + 0.006;
    const ry = pelS[1] + (scaS[1] - pelS[1]) * f + 0.006;
    const L = w * 1.3;
    const bandPaint = paint((p, n) => {
      const g = (p.z - (zi - L / 2)) / L; // 0 rear edge, 1 front edge
      const base = shellPaint.at(p, n);
      const dark = smoothstep(0.3, 0.0, g);
      const lite = smoothstep(0.75, 1.0, g) * 0.35;
      return mix(mix(base, "#e6cba4", lite), DARK, dark * 0.75);
    });
    const bone = zi < 0 ? "spine1" : "spine2";
    b.part(new THREE.CylinderGeometry(0.97, 1.04, 1, 14, 1, true, Math.PI - half, 2 * half), bandPaint, {
      at: [0, Yc, zi],
      rotation: [90, 0, 0],
      scale: [rx, L, ry],
      bone,
      name: `band${i + 1}`,
    });
    for (const s of [1, -1]) {
      const th = Math.PI - s * half;
      b.part(bead, i % 2 ? "#9c7b58" : "#8a6a4a", {
        at: [Math.sin(th) * rx * 1.04, Yc - Math.cos(th) * ry * 1.04, zi - L * 0.3],
        bone,
        flat: true,
        rotation: [i * 31, i * 17, 0],
      });
    }
  }

  // ---------- tail ----------
  b.sweep(tail, { radius: (t: number) => 0.036 * (1 - t) + 0.006, color: tailPaint, name: "tail" });

  // ---------- head ----------
  b.loft(
    [
      { at: [0, 0.155, 0.185], w: 0.085, h: 0.085 },
      { at: [0, 0.15, 0.25], w: 0.065, h: 0.06 },
      { at: [0, 0.14, 0.31], w: 0.035, h: 0.035 },
      { at: [0, 0.136, 0.34], w: 0.022, h: 0.022 },
    ],
    { color: headPaint, bone: "head", name: "skull" },
  );
  b.part(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, 0.4 * Math.PI), headShieldPaint, {
    at: [0, 0.165, 0.235],
    scale: [0.036, 0.03, 0.075],
    bone: "head",
    name: "headShield",
  });
  b.loft(
    [
      { at: [0, 0.128, 0.2], w: 0.055, h: 0.03 },
      { at: [0, 0.126, 0.27], w: 0.035, h: 0.02 },
      { at: [0, 0.128, 0.325], w: 0.016, h: 0.012 },
    ],
    { color: "#d9a996", bone: "jaw", name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.012, 8, 6), "#4a302c", { at: [0, 0.137, 0.348], bone: "head", name: "nose" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0025, 5, 4), "#1a1210", { at: [0.005 * s, 0.14, 0.359], bone: "head" });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), "#14100e", { at: [0.031 * s, 0.16, 0.24], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0026, 5, 4), "#ffffff", { at: [0.037 * s, 0.165, 0.246], bone: "head" });
    // eyelid
    b.part(new THREE.TorusGeometry(0.0095, 0.002, 4, 10), "#8a6650", {
      at: [0.032 * s, 0.16, 0.24],
      dir: [s, 0, 0.2],
      axis: "z",
      bone: "head",
    });
  }

  // ears
  const earOutline: Array<[number, number]> = [
    [-0.017, 0],
    [0.017, 0],
    [0.023, 0.03],
    [0.013, 0.056],
    [0, 0.068],
    [-0.013, 0.056],
    [-0.023, 0.03],
  ];
  const innerOutline = earOutline.map(([x, y]) => [x * 0.65, 0.008 + y * 0.78] as [number, number]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const xDir = s > 0 ? [0.9, 0.1, -0.4] : [0.9, 0.1, 0.4];
    const yDir = [0.35 * s, 1, s > 0 ? -0.1 : 0.1];
    const base = [0.028 * s, 0.18, 0.2];
    const ear = b.joint(`ear${side}`, { parent: "head", at: base, dir: yDir, role: "hinge" });
    const outer = b.extrude(earOutline, {
      at: base,
      x: xDir,
      y: yDir,
      thickness: [0.006, 0.003],
      color: "#9c7f6c",
      smoothing: 1,
      bone: ear,
      name: `earOuter${side}`,
    });
    const nrm = outer.dir([0, 0, 1]).normalize();
    b.extrude(innerOutline, {
      at: [base[0] + nrm.x * 0.003, base[1] + nrm.y * 0.003, base[2] + nrm.z * 0.003],
      x: xDir,
      y: yDir,
      thickness: 0.002,
      color: "#d99a8c",
      smoothing: 1,
      bone: ear,
      name: `earInner${side}`,
    });
  }

  // ---------- legs ----------
  const CLAW = "#3a2c22";
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const front = b.chain(
      `arm${side}`,
      polyline([
        [0.075 * s, 0.12, 0.1],
        [0.09 * s, 0.07, 0.115],
        [0.095 * s, 0.03, 0.12],
        [0.097 * s, 0.012, 0.15],
      ]),
      {
        parent: "chest",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "leg",
        contact: [0.097 * s, 0, 0.14],
      },
    );
    b.sweep(front, { radius: (t: number) => 0.028 - 0.016 * t, color: legPaint, to: 0.75, name: `foreleg${side}` });
    b.part(new THREE.SphereGeometry(1, 10, 6), legPaint, {
      at: [0.096 * s, 0.012, 0.135],
      scale: [0.022, 0.012, 0.03],
      bone: `wrist${side}`,
      name: `forefoot${side}`,
    });
    const fl = [0.014, 0.028, 0.026, 0.016];
    const fx = [-0.013, -0.0045, 0.0045, 0.013];
    fl.forEach((len, k) =>
      b.spike([0.096 * s + fx[k] * s, 0.014, 0.158], [fx[k] * s * 4, -0.35, 1], len, 0.0045, {
        color: CLAW,
        bone: `wrist${side}`,
        sides: 5,
      }),
    );
    // hind
    const hind = b.chain(
      `leg${side}`,
      polyline([
        [0.08 * s, 0.12, -0.12],
        [0.095 * s, 0.07, -0.1],
        [0.1 * s, 0.03, -0.13],
        [0.1 * s, 0.012, -0.085],
      ]),
      {
        parent: "hips",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
        contact: [0.1 * s, 0, -0.1],
      },
    );
    b.sweep(hind, { radius: (t: number) => 0.032 - 0.018 * t, color: legPaint, to: 0.62, name: `hindleg${side}` });
    b.part(new THREE.SphereGeometry(1, 10, 6), legPaint, {
      at: [0.1 * s, 0.012, -0.105],
      scale: [0.024, 0.012, 0.04],
      bone: `ankle${side}`,
      name: `hindfoot${side}`,
    });
    for (let k = 0; k < 5; k++) {
      const dx = (k - 2) * 0.008;
      b.spike([0.1 * s + dx * s, 0.012, -0.07], [dx * s * 3, -0.3, 1], k === 2 ? 0.017 : 0.012, 0.0038, {
        color: CLAW,
        bone: `ankle${side}`,
        sides: 5,
      });
    }
  }

  // open shells and ears show their insides in the paint colour too
  b.ctx.paintMaterial().side = THREE.DoubleSide;
  return b.root;
}
```