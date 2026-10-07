```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

// Palette
const BLUE = "#17243f"; // glossy blue-black back and head
const WHITE = "#f2f5f7"; // crisp white belly
const GOLD = "#e6ad2e"; // warm golden ear and neck patch
const BEAK = "#2b2b30"; // dark beak
const PINK = "#ff7e9a"; // orange-pink beak stripe
const BLACK = "#121214"; // feet and eyes
const CHICK = "#a3a9b1"; // fluffy grey chick
const CHICK_DARK = "#7d848d";

export const meta = {
  name: "emperor-penguin-parent",
  description:
    "Adult emperor penguin with a grey chick peeking out from between its feet.",
};

// A sphere geometry squashed to an ellipsoid.
function ellipsoid(r: number, sx: number, sy: number, sz: number, seg = 14) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(8, seg - 4));
  g.scale(sx, sy, sz);
  return g;
}

// Flat webbed foot: an outline extruded to a thin slab lying on the ground.
// Heel sits at the origin, toes point toward +Z (the model's front).
function footGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.06, 0.03);
  s.lineTo(0.06, 0.03);
  s.lineTo(0.1, -0.03);
  s.lineTo(0.035, -0.13);
  s.lineTo(0.0, -0.1);
  s.lineTo(-0.035, -0.13);
  s.lineTo(-0.1, -0.03);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.025,
    bevelEnabled: false,
  });
  // Shape y becomes -z (toes forward), extrusion becomes +y (thickness up).
  g.rotateX(-Math.PI / 2);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "emperor-penguin-parent" });
  const r = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.12, 0] });
  const chest = b.joint("chest", { at: [0, 0.6, 0.01], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.88, 0.03], parent: chest });
  const head = b.joint("head", { at: [0, 1.0, 0.02], parent: neck });
  const shoulderL = b.joint("shoulderL", { at: [0.18, 0.78, 0.0], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.18, 0.78, 0.0], parent: chest });
  const hipL = b.joint("hipL", { at: [0.11, 0.1, 0.04], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.11, 0.1, 0.04], parent: hips });

  // ---- Body: blue back, white belly, golden neck patch --------------------
  b.part(ellipsoid(0.2, 1.0, 2.25, 0.8, 16), BLUE, {
    at: [0, 0.58, -0.01],
    bone: chest,
  });
  b.part(ellipsoid(0.12, 1.0, 1.9, 0.75, 12), WHITE, {
    at: [0, 0.56, 0.1],
    bone: chest,
  });
  // Golden patch at the side of the neck
  b.part(ellipsoid(0.06, 0.7, 1.0, 1.0, 10), GOLD, {
    at: [0.13, 0.84, 0.05],
    bone: neck,
  });

  // Small raised tail tuft at the rear base
  b.part(ellipsoid(0.07, 1.0, 0.6, 0.8, 8), BLUE, {
    at: [0, 0.26, -0.13],
    bone: hips,
  });

  // ---- Head ---------------------------------------------------------------
  b.part(ellipsoid(0.12, 1.0, 1.0, 1.0, 14), BLUE, {
    at: [0, 1.0, 0.02],
    bone: head,
  });
  // Golden ear patch, bulging from the side of the head
  b.part(ellipsoid(0.06, 0.55, 1.0, 0.9, 10), GOLD, {
    at: [0.1, 0.98, -0.01],
    bone: head,
  });
  // Dark eyes
  b.part(new THREE.SphereGeometry(0.012, 8, 6), BLACK, {
    at: [0.06, 1.03, 0.11],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), BLACK, {
    at: [-0.06, 1.03, 0.11],
    bone: head,
  });

  // ---- Beak: long slender cone with an orange-pink stripe ------------------
  b.spike([0, 1.02, 0.1], [0, -0.16, 1], 0.22, 0.034).forEach?.(() => {});
  b.spike([0, 1.058, 0.11], [0, -0.1, 1], 0.12, 0.012);

  // ---- Flippers: stubby, held slightly out --------------------------------
  const flipperGeo = (outward: number) => {
    const g = ellipsoid(0.1, 0.5, 2.0, 1.0, 10);
    g.rotateZ(outward);
    return g;
  };
  b.part(flipperGeo(0.35), BLUE, {
    at: [0.25, 0.66, -0.01],
    bone: shoulderL,
  });
  b.part(flipperGeo(-0.35), BLUE, {
    at: [-0.25, 0.66, -0.01],
    bone: shoulderR,
  });

  // ---- Big black feet -----------------------------------------------------
  b.part(footGeometry(), BLACK, { at: [0.11, 0.0, 0.04], bone: hipL });
  b.part(footGeometry(), BLACK, { at: [-0.11, 0.0, 0.04], bone: hipR });

  // ---- Chick peeking out from between the feet ----------------------------
  const chickAt: [number, number, number] = [0, 0.09, 0.17];
  b.part(ellipsoid(0.08, 1.0, 0.95, 1.0, 12), CHICK, {
    at: chickAt,
    bone: hips,
  });
  // Fluffy tufts around the chick's body and head
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r() * 0.5;
    const rad = 0.07 + r() * 0.02;
    const tuft = 0.035 + r() * 0.015;
    b.part(new THREE.SphereGeometry(tuft, 6, 5), i % 2 ? CHICK_DARK : CHICK, {
      at: [
        Math.cos(a) * rad * 0.9,
        0.09 + Math.sin(a) * rad * 0.5,
        0.17 + Math.sin(a) * rad * 0.4,
      ],
      bone: hips,
    });
  }
  // Chick head
  b.part(ellipsoid(0.06, 1.0, 1.0, 1.0, 10), CHICK, {
    at: [0, 0.19, 0.2],
    bone: hips,
  });
  // Chick eyes and tiny beak
  b.part(new THREE.SphereGeometry(0.008, 6, 5), BLACK, {
    at: [0.03, 0.2, 0.25],
    bone: hips,
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 5), BLACK, {
    at: [-0.03, 0.2, 0.25],
    bone: hips,
  });
  b.spike([0, 0.18, 0.25], [0, -0.1, 1], 0.05, 0.01);

  return b.root;
}
```