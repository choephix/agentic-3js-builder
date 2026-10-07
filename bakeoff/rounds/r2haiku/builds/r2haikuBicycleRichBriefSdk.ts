import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Dutch city bicycle",
  description:
    "Vintage mint-green Dutch city bicycle with cream grips, a silver bell, a leather saddle on springs, chrome mudguards, a chain guard, whitewall tyres, and a wicker basket of sunflowers and a baguette.",
};

const MINT = "#9fdcc4";
const CHROME = "#cdd5de";
const CREAM = "#f4ecd8";
const TYRE = "#262626";
const WHITE = "#f6f2e4";
const LEATHER = "#7b4a26";
const BRASS = "#c9a24a";
const WICKER = "#c99b5c";
const WICKER_DARK = "#8c5a2c";
const YELLOW = "#f5b800";
const BROWN = "#4a2a12";
const LEAF = "#4f8a3c";
const BAGUETTE = "#d6a25c";
const DARK = "#2e2e2e";

export default function build() {
  const b = createBuilder({ name: "dutch-city-bicycle" });

  // ---- Skeleton -----------------------------------------------------------
  // Model units are metres. Bike faces +Z, left is +X, wheels rest on y = 0.
  const frame = b.joint("frame", { at: [0, 0, 0] });
  const wheelF = b.joint("wheelF", { at: [0, 0.36, 0.52], parent: frame });
  const wheelR = b.joint("wheelR", { at: [0, 0.36, -0.52], parent: frame });
  const steer = b.joint("steer", { at: [0, 0.98, 0.43], parent: frame });

  // Helpers -------------------------------------------------------------------
  const mir = (pts: number[][]) => pts.map(([x, y, z]) => [-x, y, z]);

  const tube = (pts: number[][], r: number, color: string, bone: any) =>
    b.sweep(pts, r, { color, bone });

  // Mirrored pair of tubes (left and right).
  const pair = (pts: number[][], r: number, color: string, bone: any) => {
    tube(pts, r, color, bone);
    tube(mir(pts), r, color, bone);
  };

  // Open-cylinder band lying in the YZ plane around the X axis.
  // Angles follow y = R sin(t), z = R cos(t).
  const band = (
    center: number[],
    R: number,
    width: number,
    start: number,
    len: number,
    color: string,
    bone: any,
  ) => {
    const g = new THREE.CylinderGeometry(R, R, width, 28, 1, true, start, len);
    g.rotateZ(Math.PI / 2);
    b.part(g, color, { at: center, bone });
  };

  // ---- Frame ----------------------------------------------------------------
  // Dutch step-over frame in mint green.
  tube([[0, 0.3, 0], [0, 0.84, -0.24]], 0.024, MINT, frame); // seat tube
  tube([[0, 0.84, -0.24], [0, 0.92, 0.42]], 0.02, MINT, frame); // top tube
  tube([[0, 0.3, 0], [0, 0.86, 0.42]], 0.026, MINT, frame); // down tube
  tube([[0, 0.86, 0.42], [0, 1.0, 0.44]], 0.03, MINT, frame); // head tube
  pair([[0, 0.84, -0.24], [0.065, 0.36, -0.52]], 0.014, MINT, frame); // seat stays
  pair([[0.05, 0.3, 0], [0.065, 0.36, -0.52]], 0.013, MINT, frame); // chain stays
  pair([[0.03, 0.84, 0.42], [0.065, 0.36, 0.52]], 0.014, MINT, steer); // fork blades

  // Crank arms and pedals.
  tube([[0.075, 0.3, 0], [0.075, 0.16, 0.04]], 0.012, CHROME, frame);
  tube([[-0.075, 0.3, 0], [-0.075, 0.44, -0.04]], 0.012, CHROME, frame);
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.07), DARK, { at: [0.075, 0.15, 0.04], bone: frame });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.07), DARK, { at: [-0.075, 0.45, -0.04], bone: frame });

  // Chainring, rear sprocket and chain.
  const ring = new THREE.CylinderGeometry(0.09, 0.09, 0.008, 20);
  ring.rotateZ(Math.PI / 2);
  b.part(ring, CHROME, { at: [0.05, 0.3, 0], bone: frame });
  const sprocket = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 12);
  sprocket.rotateZ(Math.PI / 2);
  b.part(sprocket, CHROME, { at: [0.05, 0.36, -0.52], bone: frame });
  tube([[0.05, 0.39, 0], [0.05, 0.395, -0.52]], 0.006, DARK, frame);
  tube([[0.05, 0.21, 0], [0.05, 0.325, -0.52]], 0.006, DARK, frame);

  // Chain guard: a curved cover over the chainring, on the left side.
  band([0.07, 0.3, 0], 0.13, 0.02, 1.47, 1.9, MINT, frame);

  // Saddle: brown leather on coil springs and a chrome post.
  tube([[0, 0.82, -0.24], [0, 0.97, -0.24]], 0.015, CHROME, frame);
  const saddleG = new THREE.SphereGeometry(0.14, 14, 10);
  saddleG.scale(0.6, 0.35, 1);
  b.part(saddleG, LEATHER, { at: [0, 0.99, -0.24], bone: frame });
  for (const y of [0.9, 0.918, 0.936]) {
    const spring = new THREE.TorusGeometry(0.03, 0.006, 6, 12);
    spring.rotateX(Math.PI / 2);
    b.part(spring, BRASS, { at: [0, y, -0.24], bone: frame });
  }

  // ---- Handlebars and bell -------------------------------------------------
  tube([[0, 1.0, 0.44], [0, 1.1, 0.38]], 0.018, CHROME, steer); // stem
  tube(
    [
      [0.27, 1.2, 0.2],
      [0.22, 1.14, 0.31],
      [0.1, 1.11, 0.37],
      [0, 1.1, 0.38],
      [-0.1, 1.11, 0.37],
      [-0.22, 1.14, 0.31],
      [-0.27, 1.2, 0.2],
    ],
    0.012,
    CHROME,
    steer,
  );
  // Cream grips on each bar end.
  tube([[0.27, 1.2, 0.2], [0.27, 1.2, 0.02]], 0.022, CREAM, steer);
  tube([[-0.27, 1.2, 0.2], [-0.27, 1.2, 0.02]], 0.022, CREAM, steer);
  // Silver bell on the right bar (negative X).
  const bellG = new THREE.SphereGeometry(0.03, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(bellG, CHROME, { at: [-0.1, 1.125, 0.37], bone: steer });

  // ---- Wheels ----------------------------------------------------------------
  const wheel = (joint: any, hub: number[]) => {
    const tyre = new THREE.TorusGeometry(0.31, 0.045, 10, 28);
    tyre.rotateY(Math.PI / 2);
    b.part(tyre, TYRE, { at: hub, bone: joint });

    // Whitewall bands on both sidewalls.
    for (const s of [-0.036, 0.036]) {
      const ww = new THREE.TorusGeometry(0.31, 0.024, 6, 28);
      ww.rotateY(Math.PI / 2);
      ww.translate(s, 0, 0);
      b.part(ww, WHITE, { at: hub, bone: joint });
    }

    // Hub.
    const hubG = new THREE.CylinderGeometry(0.022, 0.022, 0.15, 10);
    hubG.rotateZ(Math.PI / 2);
    b.part(hubG, CHROME, { at: hub, bone: joint });

    // Spokes, staggered left and right.
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI * 2) / 16;
      const g = new THREE.CylinderGeometry(0.0025, 0.0025, 0.27, 3, 1);
      g.translate(0, 0.135, 0);
      g.rotateX(a);
      g.translate(k % 2 ? -0.02 : 0.02, 0, 0);
      b.part(g, CHROME, { at: hub, bone: joint });
    }
  };
  wheel(wheelF, [0, 0.36, 0.52]);
  wheel(wheelR, [0, 0.36, -0.52]);

  // Chrome mudguards over both wheels.
  band([0, 0.36, 0.52], 0.4, 0.09, -0.33, 3.8, CHROME, wheelF);
  band([0, 0.36, -0.52], 0.4, 0.09, -0.33, 3.8, CHROME, wheelR);

  // ---- Wicker basket ---------------------------------------------------------
  // Tapered square basket, wider at the top.
  const basketG = new THREE.CylinderGeometry(0.198, 0.14, 0.2, 4, 1, false);
  basketG.rotateY(Math.PI / 4);
  basketG.scale(1, 1, 0.72);
  b.part(basketG, WICKER, { at: [0, 0.94, 0.7], bone: steer });

  // Woven rims: top and a mid band.
  const rim = (y: number, hx: number, hz: number, color: string) => {
    tube(
      [
        [hx, y, 0.7 + hz],
        [-hx, y, 0.7 + hz],
        [-hx, y, 0.7 - hz],
        [hx, y, 0.7 - hz],
        [hx, y, 0.7 + hz],
      ],
      0.01,
      color,
      steer,
    );
  };
  rim(1.04, 0.14, 0.1, WICKER_DARK);
  rim(0.94, 0.1197, 0.086, WICKER_DARK);

  // Basket brackets from the steerer.
  pair([[0.04, 0.98, 0.44], [0.12, 0.9, 0.6]], 0.01, CHROME, steer);

  // ---- Sunflowers --------------------------------------------------------------
  const sunflower = (x: number, y: number, z: number) => {
    const back = new THREE.CylinderGeometry(0.07, 0.07, 0.012, 18);
    back.rotateX(Math.PI / 2);
    b.part(back, YELLOW, { at: [x, y, z - 0.004], bone: steer });

    const petals = new THREE.TorusGeometry(0.06, 0.02, 5, 16);
    b.part(petals, YELLOW, { at: [x, y, z + 0.004], bone: steer });

    const centre = new THREE.CylinderGeometry(0.036, 0.036, 0.018, 14);
    centre.rotateX(Math.PI / 2);
    b.part(centre, BROWN, { at: [x, y, z + 0.01], bone: steer });
  };

  const heads: [number, number, number][] = [
    [-0.08, 1.2, 0.7],
    [0.0, 1.25, 0.72],
    [0.08, 1.18, 0.7],
    [0.03, 1.12, 0.78],
  ];
  for (const [hx, hy, hz] of heads) {
    // Stem from inside the basket, bending to the back of the head.
    const bx = hx * 0.5;
    const bz = 0.7;
    tube(
      [
        [bx, 0.98, bz],
        [(bx + hx) / 2, (0.98 + hy) / 2, (bz + hz) / 2],
        [hx, hy - 0.03, hz - 0.01],
      ],
      0.007,
      LEAF,
      steer,
    );
    sunflower(hx, hy, hz);
  }

  // ---- Baguette ----------------------------------------------------------------
  const baguetteG = new THREE.CapsuleGeometry(0.026, 0.36, 4, 8);
  baguetteG.rotateX(Math.PI / 2);
  baguetteG.rotateY(-0.35);
  b.part(baguetteG, BAGUETTE, { at: [0.02, 1.07, 0.7], bone: steer });

  return b.root;
}
