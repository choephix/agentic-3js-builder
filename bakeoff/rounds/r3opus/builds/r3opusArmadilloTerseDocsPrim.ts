import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, scales, mottle } from "../../../../src/index";

export const meta = {
  name: "Armadillo",
  description:
    "A stylized nine-banded armadillo: domed, faceted carapace with scaled shields, nine ridged bands and a beaded skirt, long ringed tail, cone snout with an opening jaw, big leaf ears and digging claws. Rigged in a neutral rest pose.",
};

// palette
const SHELL = "#b98a5e";
const SHELL_LIGHT = "#d9b183";
const SHELL_DARK = "#8a5f3d";
const SHELL_EDGE = "#5e3d27";
const BAND_A = "#a8774d";
const BAND_B = "#c4976a";
const BELLY = "#e6b9a6";
const SKIN = "#c99886";
const HEAD_SKIN = "#d0a28c";
const LEG = "#9c7560";
const CLAW = "#3a2a22";
const DARK = "#1a1210";
const NOSE = "#7a4a44";
const EAR_IN = "#b06a60";
const WHITE = "#fff6ea";

function key(ks: number[], t: number): number {
  const x = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
  const i = Math.min(Math.floor(x), ks.length - 2);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return ks[i] * (1 - u) + ks[i + 1] * u;
}
function clockDist(deg: number): number {
  const a = ((deg % 360) + 360) % 360;
  return Math.min(a, 360 - a);
}

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---------- skeleton: body ----------
  const body = catmull([
    [0, 0.14, -0.24],
    [0, 0.155, -0.12],
    [0, 0.165, 0.0],
    [0, 0.15, 0.12],
    [0, 0.14, 0.2],
  ]);
  const hips = b.joint("hips", { at: [0, 0.155, -0.12], role: "spine" });
  const rootT = body.closestT(hips.at);
  const front = b.chain("spine", body.slice(rootT, 1), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const back = b.chain("sacrum", body.slice(rootT, 0), { parent: hips, count: 1, names: ["sacrum"], role: "spine" });

  const tailPath = catmull([
    [0, 0.14, -0.24],
    [0, 0.115, -0.36],
    [0, 0.075, -0.48],
    [0, 0.045, -0.6],
  ]);
  const tail = b.chain("tail", tailPath, { parent: back, count: 5, role: "tail" });

  const head = b.joint("head", { parent: front, at: [0, 0.16, 0.2], dir: [0, -0.4, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.02, -0.025]),
    aim: head.local([0, 0.14, -0.03]),
    role: "jaw",
  });

  // ---------- carapace ----------
  const BAND0 = 0.34;
  const BAND1 = 0.6;
  const shield = scales([SHELL, SHELL_LIGHT], SHELL_EDGE, { size: 0.022, seed: 3 });
  const belly = mottle(BELLY, SKIN, { size: 0.04, seed: 2 });
  const shellPaint = paint((_p, _n, s) => {
    const d = clockDist(s[1]);
    if (d > 112) return belly;
    if (d > 104) return SHELL_DARK;
    const t = s[0];
    if (t > BAND0 && t < BAND1) {
      const k = ((t - BAND0) / (BAND1 - BAND0)) * 9;
      const f = k - Math.floor(k);
      if (f < 0.16) return SHELL_EDGE;
      // little triangular scute pattern inside each band
      const tri = Math.abs(((d / 7) % 2) - 1);
      if (f > 0.75 && tri < 0.35) return SHELL_LIGHT;
      return Math.floor(k) % 2 ? BAND_A : BAND_B;
    }
    return shield;
  });

  const RX = [0.085, 0.125, 0.135, 0.12, 0.075];
  const RY = [0.08, 0.112, 0.12, 0.105, 0.065];
  const shell = b.sweep(body, (t: number) => [key(RX, t), key(RY, t)], {
    bone: [back, hips, front],
    shift: [0, 0.01],
    sides: 14,
    color: shellPaint,
    name: "shell",
  });

  // skirt rims with beads
  for (const ang of [110, 250]) {
    const rim = shell.line(ang, 0.003).slice(0.04, 0.96);
    b.sweep(rim, 0.007, { bone: [back, hips, front], color: SHELL_EDGE, sides: 6, name: "rim" });
    b.along(rim, 26, (at) => {
      b.part(new THREE.SphereGeometry(0.008, 6, 4), SHELL_DARK, { at, flat: true, scale: [1, 1.4, 1], name: "skirtBead" });
    });
  }

  // band ridges
  const degs: number[] = [];
  for (let i = 0; i <= 12; i++) degs.push(-104 + (208 * i) / 12);
  for (let k = 0; k <= 9; k++) {
    const t = BAND0 + (k * (BAND1 - BAND0)) / 9;
    const pts = degs.map((d) => shell.at(t, d, 0.003));
    b.sweep(catmull(pts), 0.0055, { color: SHELL_EDGE, sides: 6, name: "bandRidge" });
  }

  // raised tubercles on the shields
  const zA = body.at(BAND0).z;
  const zB = body.at(BAND1).z;
  const skin = b.surface(shell);
  const studs = skin.scatter(150, {
    rng: rng(5),
    minDist: 0.022,
    filter: (h) => h.n.y > 0.12 && (h.at.z < zA - 0.012 || h.at.z > zB + 0.012) && h.at.z < 0.27,
  });
  for (const hit of studs)
    b.stick(new THREE.CylinderGeometry(0.008, 0.011, 0.007, 6), SHELL_LIGHT, hit, { embed: 0.45, flat: true, name: "stud" });

  // ---------- tail ----------
  const tailScale = scales(SHELL, SHELL_EDGE, { size: 0.012, seed: 9 });
  const tailPaint = paint((_p, _n, s) => {
    const k = s[0] * 16;
    const f = k - Math.floor(k);
    if (f < 0.18) return SHELL_EDGE;
    return Math.floor(k) % 2 ? tailScale : SHELL_LIGHT;
  });
  b.sweep(tail, [0.038, 0.007], { color: tailPaint, sides: 8, name: "tail" });

  // ---------- head ----------
  const headShield = scales([SHELL, SHELL_LIGHT], SHELL_EDGE, { size: 0.014, seed: 4 });
  const headPaint = paint((_p, _n, s) => (clockDist(s[1]) < 62 && s[0] < 0.8 ? headShield : HEAD_SKIN));
  b.sweep([head.local([0, -0.01, 0.005]), head.local([0, 0.15, -0.004])], (t: number) => [0.05 - 0.039 * t, 0.044 - 0.033 * t], {
    bone: head,
    color: headPaint,
    sides: 10,
    name: "snout",
  });
  b.sweep([jaw.at, jaw.local([0, 0.11, 0])], [0.022, 0.008], { bone: jaw, color: HEAD_SKIN, sides: 8, name: "jawTube" });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), NOSE, { bone: head, at: head.local([0, 0.153, 0.0]), flat: true, name: "nose" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), DARK, { bone: head, at: head.local([s * 0.005, 0.163, 0.002]), name: "nostril" });
  }

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // eyes (local +X is the model's right, so left = -x)
    const eyeP = head.local([-s * 0.033, 0.06, 0.018]);
    b.part(new THREE.SphereGeometry(0.009, 8, 6), DARK, { bone: head, at: eyeP, name: `eye${side}` });
    const hl = new THREE.Vector3(s * 0.4, 0.6, 0.7).normalize().multiplyScalar(0.0075).add(eyeP);
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), WHITE, { bone: head, at: hl, name: `eyeShine${side}` });

    // ears
    const earBase = head.local([-s * 0.028, 0.0, 0.03]);
    const earDir: [number, number, number] = [s * 0.45, 1, 0];
    const ear = b.joint(`ear${side}`, { parent: head, at: earBase, dir: earDir });
    b.extrude(
      [
        [-0.014, 0],
        [0.012, 0],
        [0.024, 0.03],
        [0.014, 0.062, "sharp"],
        [-0.006, 0.046],
        [-0.018, 0.015],
      ],
      { at: earBase, x: [0, 0, -1], y: earDir, thickness: 0.005, bevel: 0.0015, smoothing: 1, color: SKIN, bone: ear, name: `ear${side}` },
    );
    b.extrude(
      [
        [-0.008, 0.008],
        [0.008, 0.008],
        [0.016, 0.028],
        [0.01, 0.048, "sharp"],
        [-0.003, 0.036],
        [-0.011, 0.016],
      ],
      { at: earBase, x: [0, 0, -1], y: earDir, thickness: 0.008, smoothing: 1, color: EAR_IN, bone: ear, name: `earIn${side}` },
    );
  }

  // ---------- legs ----------
  const legPaint = scales(LEG, SHELL_EDGE, { size: 0.012, seed: 11 });
  const legs = [
    { pre: "F", z: 0.12, fz: 0.145, bend: [0, 0, -1], parent: front.joints[2], claws: 4, clawLen: 0.03, names: ["shoulder", "elbow", "wrist"] },
    { pre: "H", z: -0.1, fz: -0.085, bend: [0, 0, 1], parent: hips, claws: 5, clawLen: 0.018, names: ["hip", "knee", "ankle"] },
  ];
  for (const L of legs) {
    for (const [s, side] of [
      [1, "L"],
      [-1, "R"],
    ] as const) {
      const root: [number, number, number] = [s * 0.072, 0.12, L.z];
      const foot: [number, number, number] = [s * 0.088, 0.02, L.fz];
      const pts = limb(root, foot, [0.062, 0.062], [L.bend as [number, number, number]]);
      const chain = b.chain(`leg${L.pre}${side}`, pts, {
        parent: L.parent,
        names: L.names.map((n) => `${n}${L.pre}${side}`),
        role: "leg",
        contact: [foot[0], 0, foot[2] + 0.01],
      });
      b.sweep(chain, [0.024, 0.016], { color: legPaint, sides: 8, name: `leg${L.pre}${side}` });
      const tip = chain.tip ?? chain.joints[chain.joints.length - 1];
      const F = pts[pts.length - 1];
      b.part(new THREE.SphereGeometry(0.02, 8, 5), LEG, {
        bone: tip,
        at: [F.x, 0.01, F.z + 0.008],
        scale: [1, 0.5, 1.3],
        flat: true,
        name: `foot${L.pre}${side}`,
      });
      for (let c = 0; c < L.claws; c++) {
        const u = L.claws === 1 ? 0 : c / (L.claws - 1) - 0.5;
        const dx = u * 0.026;
        b.spike([F.x + dx, 0.011, F.z + 0.02], [dx * 2.5, -0.33, 1], L.clawLen, 0.0042, {
          bone: tip,
          color: CLAW,
          sides: 5,
          name: `claw${L.pre}${side}`,
        });
      }
    }
  }

  return b.root;
}
