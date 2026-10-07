```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "green-sea-turtle",
  description:
    "A gliding green sea turtle with a heart-shaped olive and caramel shell, pale belly plate, cream-edged head, flippers spread wide, and a remora riding beneath.",
};

const C = {
  olive: "#5f6f2b",
  oliveLight: "#8c9a3f",
  caramel: "#c08a48",
  caramelDark: "#9a6a34",
  brown: "#3b2a17",
  belly: "#efe0a0",
  skin: "#6f8f3a",
  skinDark: "#4f6b2a",
  cream: "#f3e6c4",
  eyeDark: "#141210",
  fish: "#3d4a52",
  fishBelly: "#d9dde0",
  fishFin: "#2f3a40",
};

// Shell ellipsoid: centre and semi-axes in metres.
const SH = { cx: 0, cy: 0.36, cz: 0, ax: 0.42, ay: 0.14, az: 0.52 };

// Point and outward normal on the shell ellipsoid.
// theta: angle from the top (0 = crest), phi: azimuth from +Z.
function shellPoint(theta: number, phi: number) {
  const x = SH.ax * Math.sin(theta) * Math.sin(phi);
  const y = SH.cy + SH.ay * Math.cos(theta);
  const z = SH.az * Math.sin(theta) * Math.cos(phi);
  const nx = (x - SH.cx) / (SH.ax * SH.ax);
  const ny = (y - SH.cy) / (SH.ay * SH.ay);
  const nz = (z - SH.cz) / (SH.az * SH.az);
  const len = Math.hypot(nx, ny, nz);
  const n = [nx / len, ny / len, nz / len];
  return { p: [x, y, z], n };
}

function lift(p: number[], n: number[], d: number): number[] {
  return [p[0] + n[0] * d, p[1] + n[1] * d, p[2] + n[2] * d];
}

export default function build() {
  const b = createBuilder({ name: "green-sea-turtle" });
  const rand = rng(11);

  // ---- Skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const neck = b.joint("neck", { at: [0, 0.33, 0.5], parent: hips });
  const jaw = b.joint("jaw", { at: [0, 0.32, 0.84], parent: neck });
  const shoulderL = b.joint("shoulderL", { at: [0.22, 0.31, 0.26], parent: hips });
  const shoulderR = b.joint("shoulderR", { at: [-0.22, 0.31, 0.26], parent: hips });
  const hipL = b.joint("hipL", { at: [0.2, 0.27, -0.35], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.2, 0.27, -0.35], parent: hips });
  const tail1 = b.joint("tail1", { at: [0, 0.3, -0.48], parent: hips });

  // ---- Helpers ----------------------------------------------------------
  const pill = (
    a: number[],
    c: number[],
    r: number,
    color: string,
    bone: any,
    sx = 1,
    sz = 1,
  ) => {
    const d = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = Math.max(d - 2 * r, 0.01);
    const geo = new THREE.CapsuleGeometry(r, len, 4, 10);
    geo.scale(sx, 1, sz);
    return b.part(geo, color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      aim: c,
      bone,
    });
  };

  const sphere = (
    p: number[],
    r: number,
    s: number[],
    color: string,
    bone: any,
  ) => {
    const geo = new THREE.SphereGeometry(r, 16, 10);
    geo.scale(s[0], s[1], s[2]);
    return b.part(geo, color, { at: p, bone });
  };

  // A scute: a dark brown outline plate under a coloured plate.
  const scute = (
    theta: number,
    phi: number,
    sx: number,
    sz: number,
    color: string,
  ) => {
    const { p, n } = shellPoint(theta, phi);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const outline = box.clone();
    outline.scale(sx * 1.12, 0.012, sz * 1.12);
    b.part(outline, C.brown, { at: lift(p, n, 0.004), dir: n, bone: hips });
    const top = box.clone();
    top.scale(sx, 0.016, sz);
    b.part(top, color, { at: lift(p, n, 0.012), dir: n, bone: hips });
  };

  // ---- Shell -------------------------------------------------------------
  // Main carapace dome.
  sphere([SH.cx, SH.cy, SH.cz], 1, [SH.ax, SH.ay, SH.az], C.olive, hips);
  // Heart shape: broad front lobes, tapering rear.
  sphere([0.2, 0.34, 0.36], 0.24, [1, 0.55, 1], C.olive, hips);
  sphere([-0.2, 0.34, 0.36], 0.24, [1, 0.55, 1], C.olive, hips);
  sphere([0, 0.33, -0.3], 0.22, [0.8, 0.45, 0.8], C.olive, hips);

  // Central row of caramel scutes.
  const centrals = [0.18, 0.55, 0.95, 1.3];
  centrals.forEach((t, i) => {
    scute(t, 0, 0.2 - i * 0.012, 0.14 - i * 0.004, C.caramel);
  });

  // Costal scutes, alternating caramel and light olive.
  const costalPhis = [0.45, 1.1, 1.75, 2.4];
  costalPhis.forEach((ph, i) => {
    [0.5, 1.05].forEach((t, j) => {
      [1, -1].forEach((side) => {
        const col = (i + j) % 2 === 0 ? C.caramel : C.oliveLight;
        scute(t, side * ph, 0.13, 0.14, col);
      });
    });
  });

  // Marginal scutes around the rim, a little darker.
  const marginals = [0.2, 0.7, 1.25, 1.8, 2.35, 2.9];
  marginals.forEach((ph, i) => {
    [1, -1].forEach((side) => {
      const col = rand() < 0.5 ? C.caramelDark : C.caramel;
      scute(1.42, side * ph, 0.1, 0.1, col);
    });
  });

  // Pale yellow plastron under the shell.
  sphere([0, 0.26, 0.0], 1, [0.36, 0.06, 0.46], C.belly, hips);

  // ---- Neck and head -----------------------------------------------------
  pill([0, 0.33, 0.4], [0, 0.36, 0.66], 0.075, C.skin, neck, 1, 1);
  sphere([0, 0.37, 0.74], 0.13, [0.84, 0.8, 1.05], C.skin, neck);
  // Cream-edged scales along the cheeks and crown.
  [-1, 1].forEach((s) => {
    sphere([s * 0.1, 0.33, 0.74], 0.03, [0.8, 0.8, 1.2], C.cream, neck);
    sphere([s * 0.07, 0.46, 0.7], 0.022, [1, 0.6, 1], C.cream, neck);
  });
  sphere([0, 0.46, 0.66], 0.03, [1, 0.6, 1.2], C.skinDark, neck);

  // Dark wise eyes with cream rims.
  [-1, 1].forEach((s) => {
    sphere([s * 0.085, 0.41, 0.8], 0.034, [1, 1, 0.6], C.cream, neck);
    sphere([s * 0.085, 0.41, 0.83], 0.022, [1, 1, 1], C.eyeDark, neck);
  });

  // Gentle beak: olive upper beak, cream lower jaw.
  const beakGeo = new THREE.ConeGeometry(0.06, 0.13, 8, 1);
  beakGeo.rotateX(Math.PI / 2);
  b.part(beakGeo, C.skinDark, { at: [0, 0.36, 0.9], bone: neck });
  const lowerJaw = new THREE.BoxGeometry(0.1, 0.035, 0.14);
  lowerJaw.translate(0, -0.005, 0.02);
  b.part(lowerJaw, C.cream, { at: [0, 0.3, 0.84], bone: jaw });

  // ---- Flippers ----------------------------------------------------------
  // Front flippers, spread wide.
  [1, -1].forEach((s) => {
    const sh = s === 1 ? shoulderL : shoulderR;
    pill([s * 0.22, 0.31, 0.26], [s * 0.55, 0.31, 0.14], 0.08, C.skin, sh, 1, 1);
    pill([s * 0.55, 0.31, 0.14], [s * 1.05, 0.3, -0.12], 0.13, C.skin, sh, 0.4, 1);
    // Cream trailing edge on the blade.
    pill([s * 0.6, 0.305, 0.06], [s * 1.0, 0.3, -0.1], 0.03, C.cream, sh, 1, 1);
  });

  // Short rear flippers.
  [1, -1].forEach((s) => {
    const hp = s === 1 ? hipL : hipR;
    pill([s * 0.2, 0.27, -0.35], [s * 0.42, 0.26, -0.62], 0.08, C.skin, hp, 0.6, 1);
    pill([s * 0.42, 0.26, -0.62], [s * 0.5, 0.255, -0.7], 0.07, C.skinDark, hp, 0.5, 1);
  });

  // Tail stub.
  pill([0, 0.3, -0.48], [0, 0.28, -0.66], 0.04, C.skin, tail1, 1, 1);

  // ---- Remora riding under the shell ---------------------------------------
  // Body.
  pill([0, 0.14, 0.3], [0, 0.13, -0.35], 0.045, C.fish, hips, 0.9, 1.1);
  // Pale underside.
  sphere([0, 0.115, 0.0], 0.03, [1.2, 0.5, 6], C.fishBelly, hips);
  // Head and sucker disc on top.
  sphere([0, 0.14, 0.3], 0.05, [1, 0.9, 1], C.fish, hips);
  const sucker = new THREE.BoxGeometry(0.11, 0.012, 0.06);
  b.part(sucker, C.fishFin, { at: [0, 0.2, 0.3], bone: hips });
  [-0.02, 0, 0.02].forEach((z) => {
    const slat = new THREE.BoxGeometry(0.1, 0.01, 0.006);
    b.part(slat, C.cream, { at: [0, 0.207, 0.3 + z * 2], bone: hips });
  });
  // Dorsal fin and tail fin.
  const dorsal = new THREE.BoxGeometry(0.01, 0.05, 0.22);
  b.part(dorsal, C.fishFin, { at: [0, 0.19, -0.05], bone: hips });
  const tailFin = new THREE.BoxGeometry(0.2, 0.01, 0.12);
  b.part(tailFin, C.fishFin, { at: [0, 0.14, -0.43], bone: hips });
  // Little eye.
  sphere([0.035, 0.155, 0.33], 0.012, [1, 1, 1], C.eyeDark, hips);
  sphere([-0.035, 0.155, 0.33], 0.012, [1, 1, 1], C.eyeDark, hips);

  return b.root;
}
```