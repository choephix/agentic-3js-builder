import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon",
  description: "A striped hot-air balloon standing on its wicker basket, with a burner and rigging ropes.",
};

const CREAM = "#f3e6c8";
const RED = "#c8102e";
const NAVY = "#1b2a4a";
const YELLOW = "#f2b632";
const WOOD = "#7a4a24";
const WICKER_A = "#9a6a3a";
const WICKER_B = "#c8995b";
const ROPE = "#3b2a1a";
const STEEL = "#5a5f66";

// Vertical gores (eight of 45°) with navy seams, a navy skirt and a yellow band round the middle.
const envelopePaint = paint((p, n, s) => {
  const [y, deg] = s;
  if (y < 3.6) return NAVY;
  if (y > 10.2 && y < 10.8) return YELLOW;
  const gore = Math.floor(deg / 45);
  const f = (deg % 45) / 45;
  if (f < 0.03 || f > 0.97) return NAVY;
  return gore % 2 ? RED : CREAM;
});

// Woven wicker: horizontal bands of two browns.
const wicker = paint((p, n, s) => {
  const band = Math.floor(p.y / 0.11);
  return band % 2 ? WICKER_A : WICKER_B;
});

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  // Envelope: a teardrop turned round the vertical axis, closed at both ends, 20 m tall.
  b.lathe(
    [
      [0, 20.2, "sharp"],
      [1.6, 19.6],
      [3.1, 18.0],
      [4.4, 15.8],
      [5.2, 12.8],
      [5.4, 9.6],
      [4.8, 6.5],
      [3.6, 4.2],
      [2.3, 2.7],
      [0, 2.6, "sharp"],
    ],
    { at: [0, 0, 0], color: envelopePaint, segments: 16, smoothing: 2, name: "envelope" },
  );

  // Basket: a four-sided wicker box standing on the ground, corners at 45°.
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.78, 1.1],
      [0, 1.1],
    ],
    { at: [0, 0, 0], color: wicker, segments: 4, spin: 45, name: "basket" },
  );

  // Rim along the top of the basket.
  b.lathe(
    [
      [0, 1.1],
      [0.84, 1.1],
      [0.84, 1.2],
      [0, 1.2],
    ],
    { at: [0, 0, 0], color: WOOD, segments: 4, spin: 45, name: "rim" },
  );

  // Burner: a steel stack rising from the basket into the mouth of the envelope.
  b.rod([0, 1.2, 0], [0, 2.5, 0], 0.16, { color: STEEL, name: "burner" });
  b.rod([0, 2.3, 0], [0, 2.5, 0], 0.26, { color: "#8c8f94", caps: "flat", name: "burner.nozzle" });

  // Rigging: three ropes from each basket corner up to the mouth of the envelope.
  for (let k = 0; k < 4; k++) {
    const corner = ((45 + 90 * k) * Math.PI) / 180;
    const top = [0.78 * Math.sin(corner), 1.2, 0.78 * Math.cos(corner)] as const;
    for (const offset of [-18, 0, 18]) {
      const theta = corner + (offset * Math.PI) / 180;
      const mouth = [2.2 * Math.sin(theta), 2.6, 2.2 * Math.cos(theta)] as const;
      b.rod(top, mouth, 0.018, { color: ROPE, name: "rope" });
    }
  }

  return b.root;
}
