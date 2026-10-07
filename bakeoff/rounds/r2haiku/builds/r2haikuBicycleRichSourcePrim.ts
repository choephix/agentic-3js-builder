import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { arc, catmull, createBuilder, spiral, stripes } from "../../../../src/index";

export const meta = {
  name: "Vintage Dutch city bicycle",
  description:
    "Mint green step-through city bike with tall upright bars, cream grips, a silver bell, a leather saddle on springs, chrome mudguards, a chain guard, whitewall tyres and a wicker basket of sunflowers and a baguette.",
};

const MINT = "#a6dcc2";
const CHROME = "#d3d8de";
const CREAM = "#f3ead3";
const LEATHER = "#6b4226";
const TYRE = "#1f1f1f";
const WHITE = "#f7f4ea";
const SUN = "#f5b70a";
const SUN_CENTRE = "#4a2a12";
const LEAF = "#5f9b4a";
const BREAD = "#d29a52";
const BLACK = "#2a2a2a";
const SPRING = "#a8adb3";
const WICKER = stripes("#c09256", "#8f6a3a", { size: 0.03, axis: "y", width: 0.45, wobble: 0.3 });

export default function bicycle() {
  const b = createBuilder({ name: "bicycle", detail: 1, paintSize: 1024 });
  b.joint("frame", { at: [0, 0, 0] });

  // Mirror a stay across the mid-plane: p and q carry the positive x offset.
  const pair = (p: number[], q: number[], r: number, color: string) => {
    for (const s of [-1, 1]) b.rod([s * p[0], p[1], p[2]], [s * q[0], q[1], q[2]], r, { color });
  };

  // ---- Wheels (axle at y = 0.33; wheel plane is YZ) -------------------------------------------
  const wheel = (z: number) => {
    const y = 0.33;
    const at: [number, number, number] = [0, y, z];
    b.part(new TorusGeometry(0.3, 0.035, 10, 28), TYRE, { at, rotation: [0, 90, 0] });
    for (const s of [-1, 1])
      b.part(new TorusGeometry(0.285, 0.009, 6, 28), WHITE, { at: [s * 0.03, y, z], rotation: [0, 90, 0] });
    b.part(new TorusGeometry(0.27, 0.012, 6, 28), CHROME, { at, rotation: [0, 90, 0] });
    b.rod([-0.05, y, z], [0.05, y, z], 0.014, CHROME);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const lace = a + 0.5;
      b.rod(
        [0, y + 0.03 * Math.cos(a), z + 0.03 * Math.sin(a)],
        [0, y + 0.27 * Math.cos(lace), z + 0.27 * Math.sin(lace)],
        0.0018,
        CHROME,
      );
    }
    // Chrome mudguard over the wheel, from the rear point over the top to the front.
    b.sweep(arc(at, [0, y, z - 0.36], [1, 0, 0], 150), 0.015, { color: CHROME });
  };
  wheel(-0.52);
  wheel(0.52);

  // ---- Frame ---------------------------------------------------------------------------------
  b.rod([0, 0.92, 0.4], [0, 0.84, -0.2], 0.017, MINT); // top tube
  b.rod([0, 0.8, 0.44], [0, 0.28, 0], 0.02, MINT); // down tube
  b.rod([0, 0.28, 0], [0, 0.86, -0.2], 0.018, MINT); // seat tube
  b.rod([0, 0.8, 0.42], [0, 0.94, 0.4], 0.024, MINT); // head tube
  b.rod([-0.06, 0.28, 0], [0.06, 0.28, 0], 0.03, CHROME); // bottom bracket
  pair([0.05, 0.28, 0], [0.05, 0.33, -0.52], 0.012, MINT); // chainstays
  pair([0.04, 0.84, -0.2], [0.05, 0.33, -0.52], 0.011, MINT); // seat stays
  pair([0.05, 0.8, 0.44], [0.05, 0.33, 0.52], 0.013, CHROME); // fork legs
  b.rod([-0.06, 0.8, 0.44], [0.06, 0.8, 0.44], 0.018, MINT); // fork crown

  // Chain guard: half a cylinder over the drive side, covering the chainring.
  b.part(new CylinderGeometry(0.1, 0.1, 0.035, 24, 1, true, 0, Math.PI), MINT, {
    at: [-0.085, 0.28, 0],
    rotation: [0, 0, 90],
  });

  // Crank arms and pedals.
  b.rod([-0.12, 0.28, 0], [-0.12, 0.12, 0.04], 0.012, CHROME);
  b.part(new BoxGeometry(0.1, 0.02, 0.09), BLACK, { at: [-0.12, 0.12, 0.04] });
  b.rod([0.12, 0.28, 0], [0.12, 0.44, -0.04], 0.012, CHROME);
  b.part(new BoxGeometry(0.1, 0.02, 0.09), BLACK, { at: [0.12, 0.44, -0.04] });

  // ---- Saddle on springs -----------------------------------------------------------------------
  b.rod([0, 0.84, -0.2], [0, 0.88, -0.23], 0.014, CHROME);
  b.sweep(spiral([0, 0.88, -0.23], [0.035, 0.88, -0.23], [0, 1, 0], { turns: 4, pitch: 0.01 }), 0.004, {
    color: SPRING,
  });
  b.part(new SphereGeometry(0.1, 16, 10), LEATHER, { at: [0, 0.94, -0.23], scale: [0.7, 0.3, 1.4] });

  // ---- Upright handlebars, grips, bell, lamp ---------------------------------------------------
  b.rod([0, 0.92, 0.4], [0, 1.03, 0.36], 0.017, CHROME);
  b.sweep(
    catmull([
      [-0.27, 1.1, 0.15],
      [-0.2, 1.07, 0.3],
      [0, 1.03, 0.36],
      [0.2, 1.07, 0.3],
      [0.27, 1.1, 0.15],
    ]),
    0.012,
    { color: CHROME },
  );
  for (const s of [-1, 1]) b.rod([s * 0.27, 1.1, 0.15], [s * 0.275, 1.12, 0.03], 0.017, CREAM);
  b.part(new SphereGeometry(0.03, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), CHROME, { at: [-0.1, 1.06, 0.33] });
  b.part(new CylinderGeometry(0.035, 0.035, 0.05, 12), CHROME, { at: [0, 0.78, 0.58], rotation: [90, 0, 0] });

  // ---- Wicker basket with sunflowers and a baguette --------------------------------------------
  b.part(new BoxGeometry(0.26, 0.16, 0.22), WICKER, { at: [0, 0.92, 0.66] });
  const ring = (y: number) => {
    const xs = [-0.13, 0.13];
    const zs = [0.55, 0.77];
    for (const x of xs) for (const z of zs) b.rod([x, 0.84, z], [x, 1.0, z], 0.008, MINT);
    b.rod([-0.13, y, 0.55], [0.13, y, 0.55], 0.009, MINT);
    b.rod([-0.13, y, 0.77], [0.13, y, 0.77], 0.009, MINT);
    b.rod([-0.13, y, 0.55], [-0.13, y, 0.77], 0.009, MINT);
    b.rod([0.13, y, 0.55], [0.13, y, 0.77], 0.009, MINT);
  };
  ring(1.0);
  ring(0.84);
  b.rod([0, 0.86, 0.42], [0, 0.84, 0.56], 0.012, CHROME);
  b.rod([0, 1.03, 0.36], [0, 1.0, 0.66], 0.01, CHROME);

  const sunflower = (base: number[], head: number[]) => {
    b.rod(base, head, 0.006, LEAF);
    b.part(new SphereGeometry(0.065, 14, 8), SUN, { at: head, scale: [1, 1, 0.22] });
    b.part(new SphereGeometry(0.03, 10, 6), SUN_CENTRE, {
      at: [head[0], head[1], head[2] + 0.012],
      scale: [1, 1, 0.4],
    });
  };
  sunflower([-0.07, 0.9, 0.64], [-0.08, 1.16, 0.62]);
  sunflower([0.0, 0.9, 0.66], [0.01, 1.2, 0.66]);
  sunflower([0.07, 0.9, 0.62], [0.09, 1.13, 0.6]);
  b.part(new SphereGeometry(0.03, 8, 6), LEAF, { at: [-0.04, 1.02, 0.63], scale: [1.8, 0.3, 0.6] });

  b.rod([-0.12, 0.96, 0.6], [0.1, 1.07, 0.72], [0.022, 0.018], BREAD);

  return b.root;
}
