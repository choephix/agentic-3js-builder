```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "elephant",
  description:
    "A stylised African elephant on a rigged primitive skeleton, wearing a red and gold caparison, with ivory tusks, a curled trunk and a tufted tail.",
};

type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

// Palette
const SKIN = "#8a909a";
const SKIN_DEEP = "#646a74";
const EAR = "#9ca2ac";
const IVORY = "#f3ebd2";
const TOENAIL = "#ece4cf";
const TRUNK = "#7d838d";
const TRUNK_TIP = "#c98b92";
const EYE = "#1d1f24";
const SHINE = "#f7f3e8";
const TUFT = "#3f3934";
const BLANKET = "#a8242c";
const GOLD = "#d9a441";
const RUBY = "#b5202b";

// Baked primitives, sized in metres. The builder places and rigs them.
function ellipsoid(rx: number, ry: number, rz: number, seg = 14) {
  return new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)).scale(rx, ry, rz);
}
function ball(r: number, seg = 10) {
  return new THREE.SphereGeometry(r, seg, Math.round(seg * 0.8));
}
function column(rTop: number, rBottom: number, h: number, seg = 10) {
  return new THREE.CylinderGeometry(rTop, rBottom, h, seg);
}

// The caparison: a dome over the back whose open rim sits at y ≈ 2.45.
const CAP = { x: 0, y: 2.2, z: -0.2, rx: 0.9, ry: 1.0, rz: 1.45 };
const RIM_X = 0.872; // dome rim radii for a cut at 0.42π
const RIM_Z = 1.404;
const RIM_Y = 2.449;

function capTop(x: number, z: number) {
  const k = 1 - (x / CAP.rx) ** 2 - ((z - CAP.z) / CAP.rz) ** 2;
  return CAP.y + Math.sqrt(Math.max(0, k)) * CAP.ry;
}

// One leg: thigh or upper arm column, shin column, knee and ankle bands,
// a foot pad and toenails on the front of the pad.
function leg(
  b: Builder,
  x: number,
  z: number,
  j: { top: Joint; mid: Joint; low: Joint },
  thick: number,
  toes: number,
) {
  const rMid = thick * 0.74;
  const rLow = thick * 0.55;
  const rPad = thick * 0.77;

  b.part(column(thick, rMid, 1.25), SKIN, { at: [x, 1.725, z], bone: j.top });
  b.part(column(rMid, rLow, 0.85), SKIN, { at: [x, 0.675, z], bone: j.mid });
  b.part(column(thick * 0.86, thick * 0.86, 0.1), SKIN_DEEP, { at: [x, 1.1, z], bone: j.mid });
  b.part(column(rLow * 1.1, rLow * 1.1, 0.08), SKIN_DEEP, { at: [x, 0.27, z], bone: j.low });
  b.part(column(rPad * 0.94, rPad * 1.06, 0.25, 12), SKIN_DEEP, { at: [x, 0.125, z], bone: j.low });

  for (let i = 0; i < toes; i++) {
    const dx = (i - (toes - 1) / 2) * 0.12;
    const zf = z + Math.sqrt(rPad * rPad - dx * dx) - 0.03;
    b.part(ball(0.065, 8), TOENAIL, { at: [x + dx, 0.12, zf], bone: j.low });
  }
}

export default function build() {
  const b = createBuilder({ name: "elephant" });

  // ---- Skeleton ---------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.2, -0.9] });
  const chest = b.joint("chest", { at: [0, 2.3, 0.9], parent: hips });
  const head = b.joint("head", { at: [0, 2.8, 1.95], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 2.27, 2.25], parent: head });

  const trunk = b.chain(
    "trunk",
    [
      [0, 2.4, 2.45],
      [0, 2.27, 2.8],
      [0, 1.97, 3.02],
      [0, 1.6, 3.08],
      [0, 1.2, 3.02],
      [0, 0.86, 2.9],
      [0, 0.6, 2.74],
      [0, 0.66, 2.58],
    ],
    { role: "tentacle", parent: head },
  );

  const tail = b.chain(
    "tail",
    [
      [0, 2.45, -1.55],
      [0, 2.25, -1.9],
      [0, 1.85, -2.08],
      [0, 1.4, -2.12],
      [0, 1.0, -2.06],
      [0, 0.8, -1.96],
    ],
    { role: "tail", parent: hips },
  );

  // ---- Body ------------------------------------------------------------
  b.part(ellipsoid(0.8, 0.85, 1.45), SKIN, { at: [0, 2.2, -0.2], bone: hips });
  b.part(ellipsoid(0.72, 0.8, 0.6), SKIN, { at: [0, 2.1, 1.1], bone: chest });
  b.part(ellipsoid(0.62, 0.66, 0.5), SKIN, { at: [0, 2.75, 1.35], bone: chest }); // neck

  // Caparison: red dome, gold rim, a grid of gold studs and hanging tassels.
  const cap = new THREE.SphereGeometry(1, 22, 8, 0, Math.PI * 2, 0, Math.PI * 0.42).scale(
    CAP.rx,
    CAP.ry,
    CAP.rz,
  );
  b.part(cap, BLANKET, { at: [CAP.x, CAP.y, CAP.z], bone: hips });

  const trim = new THREE.TorusGeometry(1, 0.045, 6, 40)
    .rotateX(Math.PI / 2)
    .scale(RIM_X, 1, RIM_Z);
  b.part(trim, GOLD, { at: [0, RIM_Y, CAP.z], bone: hips });

  for (const x of [-0.45, 0, 0.45]) {
    for (const z of [-0.9, -0.2, 0.5]) {
      b.part(ball(0.06, 8), GOLD, { at: [x, capTop(x, z), z], bone: hips });
    }
  }

  for (const deg of [0, 35, 145, 180, 215, 325]) {
    const a = (deg * Math.PI) / 180;
    b.part(ellipsoid(0.035, 0.09, 0.035, 8), GOLD, {
      at: [RIM_X * Math.cos(a), 2.3, CAP.z + RIM_Z * Math.sin(a)],
      bone: hips,
    });
  }

  // ---- Head ------------------------------------------------------------
  b.part(ellipsoid(0.6, 0.66, 0.62), SKIN, { at: [0, 2.82, 2.0], bone: head }); // skull
  b.part(ellipsoid(0.48, 0.3, 0.45), SKIN, { at: [0, 3.18, 1.85], bone: head }); // brow dome
  b.part(ellipsoid(0.5, 0.42, 0.52), SKIN, { at: [0, 2.48, 2.22], bone: head }); // lip and cheek
  b.part(ellipsoid(0.4, 0.2, 0.42), SKIN_DEEP, { at: [0, 2.2, 2.3], bone: jaw }); // lower jaw
  b.part(ellipsoid(0.2, 0.22, 0.07, 10), GOLD, { at: [0, 3.08, 2.52], bone: head }); // frontlet
  b.part(ball(0.05, 8), RUBY, { at: [0, 3.08, 2.6], bone: head }); // gem

  // ---- Trunk and tail ----------------------------------------------------
  b.sweep(trunk, 0.19, { color: TRUNK });
  b.part(ellipsoid(0.27, 0.27, 0.25), TRUNK, { at: trunk.at(0) });
  b.part(ball(0.19, 10), TRUNK_TIP, { at: trunk.at(1) });

  b.sweep(tail, 0.04, { color: SKIN_DEEP });
  b.part(ellipsoid(0.1, 0.17, 0.1, 8), TUFT, { at: tail.at(1) });

  // ---- Paired parts: ears, eyes, tusks, legs ------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = 0.5 * s;

    // Ear: a flared flap hung from a joint on the side of the head.
    const ear = b.joint(`ear${side}`, { at: [s * 0.56, 2.85, 1.65], parent: head });
    b.part(ellipsoid(0.045, 0.62, 0.5, 12).rotateZ(s * 0.3), EAR, {
      at: [s * 0.56, 2.85, 1.65],
      bone: ear,
    });

    // Eye: dark bead with a small shine.
    b.part(ball(0.06, 10), EYE, { at: [s * 0.58, 2.96, 2.27], bone: head });
    b.part(ball(0.018, 6), SHINE, { at: [s * 0.61, 2.99, 2.33], bone: head });

    // Tusk: ivory, sweeping out and up from the lip.
    b.sweep(
      [
        [s * 0.22, 2.3, 2.2],
        [s * 0.3, 2.27, 2.5],
        [s * 0.42, 2.2, 2.72],
        [s * 0.55, 2.14, 2.84],
        [s * 0.64, 2.22, 2.8],
      ],
      0.05,
      { color: IVORY, bone: head },
    );

    // Front leg: shoulder, elbow, wrist.
    const shoulder = b.joint(`shoulder${side}`, { at: [x, 2.25, 1.0], parent: chest });
    const elbow = b.joint(`elbow${side}`, { at: [x, 1.1, 1.0], parent: shoulder });
    const wrist = b.joint(`wrist${side}`, { at: [x, 0.25, 1.0], parent: elbow });
    leg(b, x, 1.0, { top: shoulder, mid: elbow, low: wrist }, 0.42, 4);

    // Hind leg: hip, knee, ankle.
    const hip = b.joint(`hip${side}`, { at: [x, 2.25, -1.0], parent: hips });
    const knee = b.joint(`knee${side}`, { at: [x, 1.1, -1.0], parent: hip });
    const ankle = b.joint(`ankle${side}`, { at: [x, 0.25, -1.0], parent: knee });
    leg(b, x, -1.0, { top: hip, mid: knee, low: ankle }, 0.46, 3);
  }

  return b.root;
}
```