import * as THREE from "three";
import { createBuilder, paint, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Chopper",
  description: "Custom chopper motorbike in a clean Overwatch-style palette: white shell, navy shadow, orange stripe, cyan light strips.",
};

// Palette
const W = "#f2f4f7";
const NAVY = "#1f2a44";
const ORANGE = "#ff7a1a";
const CYAN = "#4ff3ff";
const BLACK = "#15171c";
const CHROME = "#c8d0dc";
const DARK = "#2a303d";
const WHITE_RIM = "#e9edf3";

// Scale constants
const WHEEL_F = 0.27; // front radius
const WHEEL_R = 0.32; // rear radius
const HEAD = { y: 0.98, z: 0.8 }; // steering head
const HUB_F = { y: WHEEL_F, z: 1.3 };
const HUB_R = { y: WHEEL_R, z: -0.9 };

// Shell paint: white upper, navy underside, an orange belt stripe along the flanks.
const shell = paint((p, n) => {
  if (Math.abs(p.y - 0.72) < 0.014 && Math.abs(n.x) > 0.5) return ORANGE;
  if (n.y > 0.6) return W;
  if (n.y < -0.25) return NAVY;
  return W;
});

// Emblem drawn on the tank flank: navy disc, orange chevron, white rim.
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#1f2a44"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" stroke-width="5"/>
    <path d="M24 44 L50 22 L76 44 L76 56 L50 34 L24 56 Z" fill="#ff7a1a"/>
    <path d="M24 66 L50 48 L76 66 L76 76 L50 58 L24 76 Z" fill="#ff7a1a"/>
  </svg>`,
  { size: 256 },
);

// Fender as a half ring around a wheel centre (outline in the z,y plane, absolute).
function fenderOutline(cz: number, cy: number, r0: number, r1: number): [number, number][] {
  const pts: [number, number][] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI;
    pts.push([cz + r1 * Math.cos(a), cy + r1 * Math.sin(a)]);
  }
  for (let i = n; i >= 0; i--) {
    const a = (i / n) * Math.PI;
    pts.push([cz + r0 * Math.cos(a), cy + r0 * Math.sin(a)]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // Skeleton: hips root, steering head with the front wheel, rear wheel.
  const hips = b.joint("hips", { at: [0, 0.45, 0] });
  const steer = b.joint("steer", { parent: hips, at: [0, HEAD.y, HEAD.z], dir: [0, 0.2, 1], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, HUB_F.y, HUB_F.z], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: hips, at: [0, HUB_R.y, HUB_R.z], dir: [1, 0, 0], role: "hinge" });

  // Tyres, rims and hubs.
  const wheel = (joint: THREE.Object3D | any, c: [number, number, number], r: number, w: number) => {
    b.part(new THREE.CylinderGeometry(r, r, w, 22), BLACK, { bone: joint, at: c, dir: [1, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(r * 0.64, r * 0.64, w + 0.012, 14), WHITE_RIM, {
      bone: joint,
      at: c,
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(r * 0.2, r * 0.2, w + 0.04, 8), ORANGE, { bone: joint, at: c, dir: [1, 0, 0] });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(w + 0.02, r * 0.5, 0.02), CHROME, {
        bone: joint,
        at: [c[0], c[1] + Math.cos(a) * r * 0.38, c[2] + Math.sin(a) * r * 0.38],
        dir: [1, 0, 0],
        flat: true,
      });
    }
  };
  wheel(wheelF, [0, HUB_F.y, HUB_F.z], WHEEL_F, 0.14);
  wheel(wheelR, [0, HUB_R.y, HUB_R.z], WHEEL_R, 0.22);

  // Fenders: arcs over each wheel.
  b.extrude(fenderOutline(HUB_F.z, HUB_F.y, WHEEL_F + 0.03, WHEEL_F + 0.1), {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.03,
    bone: steer,
    color: shell,
  });
  b.extrude(fenderOutline(HUB_R.z, HUB_R.y, WHEEL_R + 0.03, WHEEL_R + 0.09), {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.035,
    bone: hips,
    color: shell,
  });

  // Raked chopper forks and triple clamp on the steering head.
  for (const s of [1, -1]) {
    b.rod([s * 0.11, HEAD.y + 0.02, HEAD.z - 0.02], [s * 0.07, HUB_F.y, HUB_F.z], 0.024, CHROME, { bone: steer });
    b.rod([s * 0.09, HEAD.y - 0.1, HEAD.z - 0.02], [s * 0.07, HUB_F.y + 0.1, HUB_F.z], 0.016, CHROME, { bone: steer });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 14), DARK, { bone: steer, at: [0, HEAD.y - 0.02, HEAD.z - 0.01], dir: [1, 0, 0] });

  // Handlebars: high ape-hanger chopper bars with grips.
  for (const s of [1, -1]) {
    b.rod([s * 0.06, HEAD.y + 0.12, HEAD.z - 0.02], [s * 0.3, 1.2, 0.58], 0.018, CHROME, { bone: steer });
    b.rod([s * 0.3, 1.2, 0.58], [s * 0.34, 1.18, 0.52], 0.03, BLACK, { bone: steer });
    b.part(new THREE.CapsuleGeometry(0.012, 0.02, 3, 8), ORANGE, { bone: steer, at: [s * 0.3, 1.19, 0.56], dir: [1, 0, 0] });
  }
  b.rod([-0.3, 1.2, 0.58], [0.3, 1.2, 0.58], 0.014, CHROME, { bone: steer });

  // Headlamp: cyan glowing lens in a navy housing.
  b.part(new THREE.SphereGeometry(0.075, 12, 8), NAVY, { bone: steer, at: [0, HEAD.y + 0.04, HEAD.z + 0.08], dir: [0, 0, 1], axis: "z" });
  glow(
    b.part(new THREE.SphereGeometry(0.052, 12, 8), CYAN, {
      bone: steer,
      at: [0, HEAD.y + 0.04, HEAD.z + 0.12],
      dir: [0, 0, 1],
      axis: "z",
    }),
    1.6,
  );

  // Frame: a raked main spar, a down tube and a rear loop, in chrome.
  for (const s of [1, -1]) {
    b.rod([s * 0.06, 0.92, HEAD.z - 0.05], [s * 0.1, 0.4, 0.2], 0.03, shell, { bone: hips });
    b.rod([s * 0.1, 0.42, 0.22], [s * 0.1, 0.84, -0.5], 0.026, shell, { bone: hips });
    b.rod([s * 0.1, 0.84, -0.5], [s * 0.12, 0.44, -0.9], 0.024, CHROME, { bone: hips });
    b.rod([s * 0.1, 0.5, 0.2], [s * 0.12, 0.42, -0.82], 0.018, CHROME, { bone: hips });
  }
  b.rod([-0.12, 0.42, 0.2], [0.12, 0.42, 0.2], 0.03, CHROME, { bone: hips });

  // Engine: a dark block with chrome head cover and cooling fins.
  b.part(new THREE.BoxGeometry(0.26, 0.28, 0.38), DARK, { bone: hips, at: [0, 0.46, 0.04] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.26, 12), CHROME, {
    bone: hips,
    at: [0, 0.6, 0.06],
    dir: [0, 1, 0.2],
    flat: true,
  });
  for (let k = 0; k < 4; k++)
    b.part(new THREE.BoxGeometry(0.3, 0.02, 0.36), BLACK, { bone: hips, at: [0, 0.34 + k * 0.05, 0.04] });
  b.part(new THREE.SphereGeometry(0.07, 10, 8), CHROME, { bone: hips, at: [0.14, 0.5, 0.04] });

  // Tank: a bold lofted teardrop in the shell paint.
  b.loft(
    [
      { at: [0, 0.8, 0.38], w: 0.18, h: 0.12 },
      { at: [0, 0.86, 0.18], w: 0.3, h: 0.2 },
      { at: [0, 0.84, -0.06], w: 0.28, h: 0.18 },
      { at: [0, 0.76, -0.2], w: 0.18, h: 0.12 },
    ],
    { bone: hips, color: shell },
  );

  // Tank emblem on both flanks.
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      bone: hips,
      at: [s * 0.155, 0.86, 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });

  // Cyan light strips running along the tank.
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.008, 0.018, 0.42), CYAN, { bone: hips, at: [s * 0.16, 0.8, 0.08] }),
      1.2,
    );
  }

  // Seat: a long low pad on a navy base.
  b.loft(
    [
      { at: [0, 0.9, -0.14], w: 0.16, h: 0.05 },
      { at: [0, 0.94, -0.36], w: 0.18, h: 0.07 },
      { at: [0, 0.92, -0.55], w: 0.14, h: 0.05 },
    ],
    { bone: hips, color: NAVY },
  );
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.4), BLACK, { bone: hips, at: [0, 0.97, -0.36] });

  // Tail light.
  glow(b.part(new THREE.BoxGeometry(0.12, 0.04, 0.02), ORANGE, { bone: hips, at: [0, 0.6, -1.0] }), 1.1);

  // Exhaust: twin chrome pipes running back and out.
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.38, 0.08], [s * 0.13, 0.26, -0.8], 0.035, CHROME, { bone: hips });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 10), BLACK, {
      bone: hips,
      at: [s * 0.13, 0.26, -0.82],
      dir: [0, 0, 1],
    });
  }

  // Footpegs and kickstand.
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 0.3, 0.12], [s * 0.2, 0.3, 0.14], 0.016, CHROME, { bone: hips });
    b.rod([s * 0.12, 0.34, -0.2], [s * 0.2, 0.34, -0.2], 0.014, CHROME, { bone: hips });
  }
  b.rod([0.14, 0.42, -0.55], [0.2, 0.02, -0.7], 0.016, CHROME, { bone: hips });

  return b.root;
}
