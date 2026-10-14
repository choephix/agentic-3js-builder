```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

type V3 = [number, number, number];

export const meta = {
  name: "Lighthouse on a Tiny Island",
  description:
    "A red-and-white banded lighthouse with a railed gallery and a yellow lantern, a keeper's cottage with a blue door, and a rocky islet in a turquoise sea.",
};

// Palette: one shared material per colour.
const CREAM = "#f4efe4";
const RED = "#d4452f";
const CHAR = "#2b2f36";
const STONE = "#8d949d";
const ROCK = "#7b828c";
const ROCK_LT = "#a7aeb7";
const SAND = "#e8d59e";
const GRASS = "#6fb34f";
const GRASS_DK = "#4c923f";
const LAMP = "#ffd23f";
const GLASS = "#bfeeff";
const BLUE = "#2b5d8a";
const SEA = "#2f8fc2";
const FOAM = "#e9f6ff";

const Y_AXIS: V3 = [0, 1, 0];
const Z_AXIS: V3 = [0, 0, 1];

const SEA_Y = -0.02; // sea surface
const ISLE_Y = -0.12; // islet underside, sunk a little under the sea floor
const PLINTH_Y = 1.1; // plinth bottom, buried in the turf
const TOWER_Y = 1.5; // tower rises from the plinth top
const DECK_Y = 11.5; // tower top, gallery deck
const SLOPE = 0.07; // tower tapers 7 cm per metre of height

// Tower radius at height y.
const rAt = (y: number) => 2.1 - SLOPE * (y - TOWER_Y);

const unit = (v: number[]): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

// Geometry is authored with its base at local y = 0, growing up +Y, so it
// stands on the frame it is stuck to.
const lathe = (profile: [number, number][], seg: number) =>
  new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const cyl = (rTop: number, rBot: number, h: number, seg: number) =>
  new THREE.CylinderGeometry(rTop, rBot, h, seg).translate(0, h / 2, 0);
const block = (w: number, h: number, d: number) =>
  new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
// Thin plate: thickness along the facing axis (Y), width on X, height on Z.
const plate = (w: number, t: number, h: number) =>
  new THREE.BoxGeometry(w, t, h).translate(0, t / 2, 0);

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  b.joint("base", { at: [0, 0, 0] });

  // Stand a piece upright on a point.
  const up = (geo: THREE.BufferGeometry, color: string, p: V3) =>
    b.stick(geo, color, frame(p, Y_AXIS, Z_AXIS));

  // Stand a plate on a wall facing +Z, with height running up.
  const front = (geo: THREE.BufferGeometry, color: string, p: V3) =>
    b.stick(geo, color, frame(p, Z_AXIS, Y_AXIS));

  // A round porthole sitting out from the tapered tower.
  const porthole = (theta: number, y: number) => {
    const r = rAt(y) - 0.03;
    const p: V3 = [r * Math.sin(theta), y, r * Math.cos(theta)];
    const on = frame(p, unit([Math.sin(theta), SLOPE, Math.cos(theta)]));
    b.stick(cyl(0.26, 0.26, 0.09, 12), CHAR, on);
    b.stick(cyl(0.19, 0.19, 0.12, 12), GLASS, on);
  };

  // ---- Sea, islet and beach ----
  up(lathe([[0, 0], [9, 0], [9, 0.1], [0, 0.1]], 16), SEA, [0, ISLE_Y, 0]);
  up(lathe([[6.3, 0], [6.85, 0], [7.05, 0.03], [6.8, 0.05], [6.3, 0.05]], 16), FOAM, [0, SEA_Y, 0]);
  up(lathe([[0, 0], [6.0, 0], [6.4, 0.3], [6.45, 0.65], [6.1, 0.95], [5.3, 1.12], [0, 1.16]], 14), ROCK, [0, ISLE_Y, 0]);
  up(lathe([[5.6, 0], [6.3, 0], [6.42, 0.12], [6.2, 0.24], [5.6, 0.24]], 14), SAND, [0, ISLE_Y, 0]);
  up(lathe([[0, 0], [6.0, 0], [6.0, 0.1], [5.7, 0.26], [4.8, 0.38], [2.6, 0.44], [0, 0.46]], 14), GRASS, [0, 0.82, 0]);

  // Coastal boulders, faceted, half-sunk at the waterline.
  const boulder = (x: number, z: number, s: number, color: string) =>
    up(new THREE.DodecahedronGeometry(s, 0).translate(0, 0.734 * s, 0), color, [x, 0.05, z]);
  boulder(2.81, -5.25, 0.85, STONE);
  boulder(-4.27, -4.22, 0.7, ROCK);
  boulder(-5.44, 2.77, 0.5, ROCK_LT);
  boulder(4.78, 3.79, 0.42, STONE);

  // Scrub bushes on the turf.
  const bush = (x: number, y: number, z: number, r: number, color: string) =>
    up(new THREE.IcosahedronGeometry(r, 0).translate(0, 0.7 * r, 0), color, [x, y, z]);
  bush(2.9, 1.2, 1.6, 0.5, GRASS);
  bush(-1.5, 1.3, 3.5, 0.55, GRASS_DK);
  bush(1.1, 1.28, -3.2, 0.4, GRASS);
  bush(3.7, 1.16, -2.6, 0.45, GRASS_DK);
  bush(-3.2, 1.2, -3.4, 0.6, GRASS_DK);

  // ---- Plinth and steps ----
  up(lathe([[0, 0], [2.5, 0], [2.56, 0.22], [2.3, 0.45], [0, 0.45]], 16), STONE, [0, PLINTH_Y, 0]);
  up(block(1.2, 0.2, 0.7), STONE, [0, 1.15, 2.85]);
  up(block(1.0, 0.2, 0.4), STONE, [0, 1.35, 2.55]);

  // ---- Tower: five 2 m bands, charcoal cornices at the joins ----
  const bands: [number, number, string][] = [
    [TOWER_Y, 3.5, CREAM],
    [3.5, 5.5, RED],
    [5.5, 7.5, CREAM],
    [7.5, 9.5, RED],
    [9.5, DECK_Y, CREAM],
  ];
  for (const [y0, y1, color] of bands) {
    const h = y1 - y0;
    up(lathe([[0, 0], [rAt(y0), 0], [rAt(y1), h], [0, h]], 16), color, [0, y0, 0]);
  }
  for (const yc of [3.5, 5.5, 7.5, 9.5]) {
    const R = rAt(yc);
    up(lathe([[0, 0], [R + 0.1, 0], [R + 0.17, 0.11], [R + 0.1, 0.22], [0, 0.22]], 16), CHAR, [0, yc - 0.11, 0]);
  }

  // Blue door on the front, portholes on the white bands.
  const doorY = 2.125;
  front(plate(0.62, 0.12, 1.25), BLUE, [0, doorY, rAt(doorY) - 0.03]);
  const windows: [number, number][] = [
    [2.95, 1.0],
    [6.5, 0.62],
    [10.5, 0.62],
  ];
  for (const [y, th] of windows) {
    porthole(th, y);
    porthole(-th, y);
  }

  // ---- Gallery and railing ----
  up(lathe([[0, 0], [2.2, 0], [2.2, 0.22], [0, 0.22]], 16), CHAR, [0, DECK_Y, 0]);
  const DECK_TOP = DECK_Y + 0.22;
  for (let k = 0; k < 16; k++) {
    const t = (k / 16) * Math.PI * 2;
    up(cyl(0.035, 0.035, 0.95, 5), CHAR, [2.0 * Math.sin(t), DECK_TOP, 2.0 * Math.cos(t)]);
  }
  up(new THREE.TorusGeometry(2.0, 0.045, 5, 32).rotateX(Math.PI / 2), CHAR, [0, DECK_TOP + 0.95, 0]);

  // ---- Lantern room: a yellow octagonal lamp inside charcoal mullions ----
  const LANTERN_Y = DECK_TOP + 0.16;
  up(cyl(1.08, 1.08, 0.16, 8), CHAR, [0, DECK_TOP, 0]);
  up(cyl(0.92, 0.92, 1.9, 8), LAMP, [0, LANTERN_Y, 0]);
  for (let k = 0; k < 8; k++) {
    const t = (k / 8) * Math.PI * 2;
    up(cyl(0.06, 0.06, 1.9, 4), CHAR, [0.93 * Math.sin(t), LANTERN_Y, 0.93 * Math.cos(t)]);
  }
  up(cyl(1.0, 1.0, 0.14, 8), CHAR, [0, LANTERN_Y + 1.9, 0]);
  up(new THREE.ConeGeometry(1.2, 0.9, 8).translate(0, 0.45, 0), CHAR, [0, LANTERN_Y + 2.04, 0]);
  up(new THREE.SphereGeometry(0.14, 10, 8).translate(0, 0.14, 0), RED, [0, LANTERN_Y + 2.94, 0]);

  // ---- Keeper's cottage, set back on the islet ----
  const cx = -3.9;
  const cz = -0.6;
  const cb = 1.1;
  up(block(2.1, 1.9, 2.0), CREAM, [cx, cb, cz]);

  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.35, 0);
  roofShape.lineTo(1.35, 0);
  roofShape.lineTo(0, 0.95);
  roofShape.closePath();
  up(
    new THREE.ExtrudeGeometry(roofShape, { depth: 2.4, bevelEnabled: false }).translate(0, 0, -1.2),
    RED,
    [cx, cb + 1.9, cz],
  );
  up(block(0.36, 1.1, 0.36), STONE, [cx + 0.55, 3.1, cz - 0.5]);

  front(plate(0.5, 0.12, 1.3), BLUE, [cx, 1.85, cz + 0.99]);
  for (const dx of [-0.75, 0.75]) {
    front(plate(0.56, 0.1, 0.56), CHAR, [cx + dx, 2.2, cz + 0.99]);
    front(plate(0.44, 0.12, 0.44), GLASS, [cx + dx, 2.2, cz + 0.99]);
  }

  return b.root;
}
```