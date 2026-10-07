import * as THREE from "three";
import { createBuilder, arc, catmull } from "../../../../src/index";

export const meta = {
  name: "Vintage bicycle",
  description: "A 1950s roadster: maroon lugged frame, chrome fork and drop bars, cream-tan leather saddle, brass lugs and bell, black whitewall-style tyres on spoked wheels.",
};

const FRAME = "#7b2d26";
const CHROME = "#c9ced3";
const TYRE = "#1d1d1d";
const LEATHER = "#4a2f1d";
const BRASS = "#c9a24a";
const DARK = "#262626";
const CHAIN = "#8d939a";
const GRIP = "#2a2a2a";
const FENDER = "#1f1f1f";

export default function build() {
  const b = createBuilder({ name: "vintage_bicycle" });
  b.joint("frame", { at: [0, 0.355, 0] });

  // Key points (metres, model space)
  const BB = [0, 0.28, -0.02];
  const headTop = [0, 0.98, 0.4];
  const headBot = [0, 0.82, 0.4];
  const seatTop = [0, 0.86, -0.2];
  const REAR = [0, 0.355, -0.5];
  const FRONT = [0, 0.355, 0.5];

  // ---- Frame -------------------------------------------------------------
  b.capsule(BB, seatTop, 0.019, { color: FRAME }); // seat tube
  b.capsule(seatTop, [0, 0.94, 0.4], 0.017, { color: FRAME }); // top tube
  b.capsule(headBot, BB, 0.02, { color: FRAME }); // down tube
  b.capsule(headTop, headBot, 0.024, { color: FRAME }); // head tube
  b.capsule([-0.04, 0.28, -0.02], [0.04, 0.28, -0.02], 0.024, { color: FRAME }); // bottom bracket shell
  for (const s of [1, -1]) {
    b.capsule([s * 0.03, 0.28, -0.02], [s * 0.05, 0.355, -0.5], 0.011, { color: FRAME }); // chainstay
    b.capsule([s * 0.015, 0.84, -0.2], [s * 0.05, 0.355, -0.5], 0.01, { color: FRAME }); // seatstay
  }

  // Lugs in brass at each joint: the lugged-frame detail
  for (const p of [headTop, headBot, BB, seatTop]) {
    b.part(new THREE.SphereGeometry(0.026, 8, 6), BRASS, { at: p });
  }

  // ---- Fork and steering -------------------------------------------------
  b.capsule([-0.07, 0.82, 0.4], [0.07, 0.82, 0.4], 0.016, { color: CHROME }); // crown
  for (const s of [1, -1]) {
    b.capsule([s * 0.06, 0.8, 0.41], [s * 0.05, 0.355, 0.5], 0.013, { color: CHROME }); // fork blade
  }
  b.capsule(headTop, [0, 1.02, 0.44], 0.02, { color: CHROME }); // stem

  // Drop handlebar
  const bar = catmull(
    [
      [-0.2, 0.92, 0.6],
      [-0.19, 0.98, 0.5],
      [-0.1, 1.02, 0.45],
      [0, 1.02, 0.44],
      [0.1, 1.02, 0.45],
      [0.19, 0.98, 0.5],
      [0.2, 0.92, 0.6],
    ],
  );
  b.sweep(bar, 0.011, { color: CHROME });
  for (const s of [1, -1]) {
    b.capsule([s * 0.19, 0.98, 0.5], [s * 0.2, 0.92, 0.6], 0.014, { color: GRIP }); // bar tape
  }

  // Bell on the right-hand bar, and the headlamp on the fork crown
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.035, 0.012],
      [0.02, 0.026],
      [0, 0.03],
    ],
    { at: [0.07, 1.03, 0.44], axis: [0, 1, 0], color: BRASS },
  );
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), CHROME, {
    at: [0, 0.87, 0.5],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.04, 10, 8), "#f2e7b0", {
    at: [0, 0.87, 0.555],
    scale: [1, 1, 0.5],
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BRASS, {
    at: [0, 0.92, 0.43],
    scale: [1.4, 1.2, 0.5],
  });

  // ---- Saddle and seat post ----------------------------------------------
  b.capsule(seatTop, [0, 0.94, -0.22], 0.013, { color: CHROME });
  b.part(new THREE.SphereGeometry(0.1, 12, 8), LEATHER, {
    at: [0, 0.96, -0.24],
    scale: [0.6, 0.3, 1.35],
  });

  // ---- Drivetrain --------------------------------------------------------
  // Chainring and rear sprocket, both on the drive side
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.006, 24), CHROME, {
    at: [0.045, BB[1], BB[2]],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 20), CHROME, {
    at: [0.04, REAR[1], REAR[2]],
    rotation: [0, 0, 90],
  });

  // Chain loop
  const chain = catmull(
    [
      [0.042, 0.38, -0.02],
      [0.042, 0.385, -0.25],
      [0.042, 0.39, -0.5],
      [0.042, 0.355, -0.535],
      [0.042, 0.32, -0.5],
      [0.042, 0.25, -0.3],
      [0.042, 0.18, -0.02],
      [0.042, 0.28, 0.08],
    ],
    { closed: true },
  );
  b.sweep(chain, 0.005, { color: CHAIN });

  // Cranks and pedals
  for (const s of [1, -1]) {
    const endY = s > 0 ? 0.11 : 0.45;
    const end = [s * 0.07, endY, -0.02];
    b.capsule([s * 0.07, BB[1], BB[2]], end, 0.011, { color: CHROME });
    b.part(new THREE.BoxGeometry(0.1, 0.015, 0.09), DARK, {
      at: [s * 0.085, endY, -0.02],
    });
  }

  // ---- Wheels ------------------------------------------------------------
  const wheel = (c: number[]) => {
    // Tyre: torus in the wheel plane (axis along X)
    b.part(new THREE.TorusGeometry(0.335, 0.022, 8, 32), TYRE, {
      at: c,
      rotation: [0, 90, 0],
    });
    // Hub
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), CHROME, {
      at: c,
      rotation: [0, 0, 90],
    });
    // Sixteen spokes, flanged alternately left and right of the hub
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const flange = k % 2 ? 0.025 : -0.025;
      const hub = [flange, c[1], c[2]];
      const rim = [0, c[1] + 0.3 * Math.cos(a), c[2] + 0.3 * Math.sin(a)];
      b.rod(hub, rim, 0.0025, { color: CHROME });
    }
  };
  wheel(REAR);
  wheel(FRONT);

  // Full-coverage mudguards, swept over each wheel
  const fenderR = 0.4;
  const frontFrom = [0, FRONT[1] + fenderR * Math.cos(Math.PI / 9), FRONT[2] - fenderR * Math.sin(Math.PI / 9)];
  b.sweep(arc(FRONT, frontFrom, [1, 0, 0], 70), 0.011, { color: FENDER });
  const rearFrom = [0, REAR[1] + fenderR * Math.cos(Math.PI / 4), REAR[2] + fenderR * Math.sin(Math.PI / 4)];
  b.sweep(arc(REAR, rearFrom, [1, 0, 0], -70), 0.011, { color: FENDER });

  // Kickstand on the chainstay, resting on the floor
  b.capsule([0.047, 0.33, -0.42], [0.05, 0.007, -0.3], 0.007, { color: CHROME });

  return b.root;
}
