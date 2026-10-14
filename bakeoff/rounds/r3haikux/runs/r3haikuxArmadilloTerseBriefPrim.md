```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

type V3 = [number, number, number];
interface Piece {
  geo: THREE.BufferGeometry;
  at: V3;
}

export const meta = {
  name: "Armadillo",
  description:
    "A nine-banded armadillo in rest pose: domed scute shields, a banded middle, a ringed tail, big front claws.",
};

const C = {
  shield: "#9c6442",
  scute: "#e6b884",
  skin: "#b98158",
  band: "#6a4229",
  belly: "#f0dcbc",
  leg: "#8a5837",
  claw: "#f6eedb",
  snout: "#d9a987",
  jaw: "#c48f6d",
  nose: "#b8615c",
  ear: "#84543a",
  earIn: "#e9a392",
  white: "#fdf6ea",
  pupil: "#1c1411",
};

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const mid = (a: V3, b: V3): V3 => mul(add(a, b), 0.5);
const len = (v: V3) => Math.hypot(v[0], v[1], v[2]);
const unit = (v: V3): V3 => mul(v, 1 / len(v));

// Rotation taking the geometry's +Y onto direction d.
function alongY(d: V3): THREE.Matrix4 {
  const y = new THREE.Vector3(...unit(d));
  const ref =
    Math.abs(y.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return new THREE.Matrix4().makeBasis(x, y, z);
}

// Tapered cylinder from a to c (radius rA at a, rB at c); rB = 0 gives a cone.
function tube(a: V3, c: V3, rA: number, rB: number, seg = 10): Piece {
  const geo = new THREE.CylinderGeometry(rB, rA, len(sub(c, a)), seg, 1);
  geo.applyMatrix4(alongY(sub(c, a)));
  return { geo, at: mid(a, c) };
}

// Capsule limb between two points.
function strut(a: V3, c: V3, r: number): Piece {
  const geo = new THREE.CapsuleGeometry(
    r,
    Math.max(0.002, len(sub(c, a)) - 2 * r),
    3,
    10,
  );
  geo.applyMatrix4(alongY(sub(c, a)));
  return { geo, at: mid(a, c) };
}

// Ellipsoid from a unit sphere.
function blob(c: V3, r: V3, seg = 12): Piece {
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  geo.scale(r[0], r[1], r[2]);
  return { geo, at: c };
}

// Thin elliptical band wrapping a body section, axis along Z.
function hoop(c: V3, rx: number, ry: number, h: number): Piece {
  const geo = new THREE.CylinderGeometry(1, 1, h, 20, 1);
  geo.rotateX(Math.PI / 2);
  geo.scale(rx, ry, 1);
  return { geo, at: c };
}

export default function build() {
  const b = createBuilder({ name: "armadillo" });
  type Bone = ReturnType<typeof b.joint>;

  const put = (p: Piece, color: string, bone: Bone) =>
    b.part(p.geo, color, { at: p.at, bone });

  // Hex scute plates stuck on an ellipsoid shell. rows: [polar angle, count].
  const scutes = (c: V3, r: V3, rows: [number, number][], tile: number) => {
    rows.forEach(([th, n], ri) => {
      for (let k = 0; k < n; k++) {
        const phi = ((k + 0.5 * (ri % 2)) / n) * Math.PI * 2;
        const ex = r[0] * Math.sin(th) * Math.cos(phi);
        const ey = r[1] * Math.cos(th);
        const ez = r[2] * Math.sin(th) * Math.sin(phi);
        const normal = unit([
          ex / (r[0] * r[0]),
          ey / (r[1] * r[1]),
          ez / (r[2] * r[2]),
        ]);
        const at: V3 = [c[0] + ex, c[1] + ey, c[2] + ez];
        b.stick(
          new THREE.CylinderGeometry(tile * 0.86, tile, tile * 0.55, 6),
          C.scute,
          frame(at, normal),
        );
      }
    });
  };

  // Skeleton: spine, neck, head and jaw.
  const hips = b.joint("hips", { at: [0, 0.13, -0.12] });
  const chest = b.joint("chest", { at: [0, 0.14, 0.12], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.16, 0.2], parent: chest });
  const head = b.joint("head", { at: [0, 0.19, 0.22], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.142, 0.22], parent: head });

  // Shell: domed front and rump shields, a flexible banded middle, a cream belly.
  const FS: V3 = [0, 0.14, 0.12];
  const FR: V3 = [0.095, 0.068, 0.085];
  const RS: V3 = [0, 0.13, -0.15];
  const RR: V3 = [0.09, 0.062, 0.08];
  const CS: V3 = [0, 0.14, -0.02];
  const CR: V3 = [0.088, 0.068, 0.15];

  put(blob([0, 0.105, -0.02], [0.076, 0.045, 0.15], 14), C.belly, chest);
  put(blob(CS, CR, 14), C.skin, chest);
  for (const z of [-0.066, -0.05, -0.034, -0.018, -0.002, 0.014, 0.03]) {
    const s = Math.sqrt(Math.max(0, 1 - ((z - CS[2]) / CR[2]) ** 2));
    put(
      hoop([0, CS[1], z], CR[0] * s + 0.006, CR[1] * s + 0.005, 0.011),
      C.band,
      chest,
    );
  }
  put(blob(FS, FR, 16), C.shield, chest);
  put(blob(RS, RR, 16), C.shield, hips);
  scutes(FS, FR, [[0, 1], [0.42, 6], [0.8, 10], [1.1, 13]], 0.011);
  scutes(RS, RR, [[0, 1], [0.42, 5], [0.8, 9], [1.1, 11]], 0.01);

  // Neck bridge, head shield, long tapered snout, nose, lower jaw.
  put(blob([0, 0.15, 0.16], [0.075, 0.06, 0.07], 12), C.shield, neck);
  put(blob([0, 0.19, 0.22], [0.06, 0.042, 0.07], 14), C.shield, head);
  put(tube([0, 0.165, 0.25], [0, 0.158, 0.36], 0.04, 0.02, 12), C.snout, head);
  put(blob([0, 0.158, 0.365], [0.02, 0.018, 0.02], 12), C.nose, head);
  put(tube([0, 0.142, 0.22], [0, 0.138, 0.34], 0.03, 0.012, 10), C.jaw, jaw);

  // Eyes and ears, each side.
  for (const s of [1, -1]) {
    const X = (v: number) => s * v;
    put(blob([X(0.052), 0.2, 0.235], [0.012, 0.012, 0.012], 10), C.white, head);
    put(blob([X(0.06), 0.2, 0.238], [0.0068, 0.0068, 0.0068], 8), C.pupil, head);
    put(blob([X(0.036), 0.245, 0.19], [0.007, 0.028, 0.024], 10), C.ear, head);
    put(blob([X(0.0445), 0.24, 0.19], [0.003, 0.02, 0.017], 8), C.earIn, head);
  }

  // Tail: tapering run of joints with banded rings.
  const TP: V3[] = [
    [0, 0.13, -0.2],
    [0, 0.125, -0.25],
    [0, 0.118, -0.3],
    [0, 0.108, -0.35],
    [0, 0.097, -0.39],
    [0, 0.087, -0.43],
    [0, 0.08, -0.46],
  ];
  const TR = [0.032, 0.029, 0.025, 0.021, 0.017, 0.013, 0];
  const tailJ: Bone[] = [];
  let prev: Bone = hips;
  TP.forEach((p, i) => {
    const j = b.joint(`tail${i + 1}`, { at: p, parent: prev });
    tailJ.push(j);
    prev = j;
  });
  for (let i = 0; i < 6; i++) {
    put(tube(TP[i], TP[i + 1], TR[i], TR[i + 1], 10), C.shield, tailJ[i]);
    if (i > 0) {
      const d = unit(sub(TP[i + 1], TP[i - 1]));
      put(
        tube(
          sub(TP[i], mul(d, 0.006)),
          add(TP[i], mul(d, 0.006)),
          TR[i] + 0.004,
          TR[i] + 0.004,
          12,
        ),
        C.band,
        tailJ[i],
      );
    }
  }

  // Legs: stout front legs with four long claws, shorter hind legs with three claws.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const X = (v: number) => s * v;

    const pSh: V3 = [X(0.07), 0.125, 0.12];
    const pEl: V3 = [X(0.085), 0.07, 0.14];
    const pWr: V3 = [X(0.09), 0.03, 0.17];
    const pHp: V3 = [X(0.065), 0.125, -0.13];
    const pKn: V3 = [X(0.082), 0.07, -0.12];
    const pAn: V3 = [X(0.08), 0.03, -0.1];

    const sh = b.joint(`shoulder${side}`, { at: pSh, parent: chest });
    const el = b.joint(`elbow${side}`, { at: pEl, parent: sh });
    const wr = b.joint(`wrist${side}`, { at: pWr, parent: el });
    const hp = b.joint(`hip${side}`, { at: pHp, parent: hips });
    const kn = b.joint(`knee${side}`, { at: pKn, parent: hp });
    const an = b.joint(`ankle${side}`, { at: pAn, parent: kn });

    put(strut(pSh, pEl, 0.027), C.leg, sh);
    put(strut(pEl, pWr, 0.021), C.leg, el);
    put(blob([X(0.09), 0.02, 0.18], [0.028, 0.02, 0.032], 12), C.leg, wr);
    for (const dx of [-0.022, -0.0073, 0.0073, 0.022]) {
      const base: V3 = [X(0.09) + dx, 0.02, 0.2];
      put(
        tube(base, add(base, mul(unit([0, -0.4, 0.92]), 0.045)), 0.0075, 0, 6),
        C.claw,
        wr,
      );
    }

    put(strut(pHp, pKn, 0.03), C.leg, hp);
    put(strut(pKn, pAn, 0.024), C.leg, kn);
    put(blob([X(0.08), 0.02, -0.095], [0.028, 0.02, 0.04], 12), C.leg, an);
    for (const dx of [-0.012, 0, 0.012]) {
      const base: V3 = [X(0.08) + dx, 0.02, -0.068];
      put(
        tube(base, add(base, mul(unit([0, -0.35, 0.94]), 0.03)), 0.005, 0, 6),
        C.claw,
        an,
      );
    }
  }

  return b.root;
}
```