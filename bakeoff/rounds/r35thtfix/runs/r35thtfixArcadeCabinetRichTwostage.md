Cause: several colour helpers infer mutable `string` values instead of SDK `Rgb` values, while the builder’s primitive and sweep overloads require `Fill`; the final `b.sweep` call also passes unsupported `bands`/`sides` options to that overload.

```ts
<<<<<<< SEARCH
export const BLACK = "#090817";
=======
import type { Fill, Rgb } from "agentic-3js-builder";

export const BLACK: Rgb = [0.035, 0.031, 0.09];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const INK = "#160d2d";
=======
export const INK: Rgb = [0.086, 0.051, 0.176];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const NAVY = "#121441";
=======
export const NAVY: Rgb = [0.071, 0.078, 0.255];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const PURPLE = "#30205f";
=======
export const PURPLE: Rgb = [0.188, 0.125, 0.373];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const VIOLET = "#6930a8";
=======
export const VIOLET: Rgb = [0.412, 0.188, 0.659];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const MAGENTA = "#ff237f";
=======
export const MAGENTA: Rgb = [1, 0.012, 0.498];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const PINK = "#ff62b5";
=======
export const PINK: Rgb = [1, 0.118, 0.71];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const CYAN = "#16e6ff";
=======
export const CYAN: Rgb = [0.008, 0.906, 1];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const BLUE = "#2679ff";
=======
export const BLUE: Rgb = [0.024, 0.475, 1];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const LILAC = "#a987ff";
=======
export const LILAC: Rgb = [0.663, 0.529, 1];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const SILVER = "#9da8cf";
=======
export const SILVER: Rgb = [0.365, 0.416, 0.686];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const CREAM = "#f6e7ce";
=======
export const CREAM: Rgb = [0.929, 0.804, 0.588];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const GOLD = "#ffbd42";
=======
export const GOLD: Rgb = [1, 0.471, 0.051];
>>>>>>> REPLACE

<<<<<<< SEARCH
export const RED = "#ff315c";
=======
export const RED: Rgb = [1, 0.031, 0.114];
>>>>>>> REPLACE

<<<<<<< SEARCH
function box(
  b: Builder,
  name: string,
  size: V3,
  at: V3,
  color: ColorInput,
  rotation?: Rot,
)
=======
function box(
  b: Builder,
  name: string,
  size: V3,
  at: V3,
  color: Fill,
  rotation?: Rot,
)
>>>>>>> REPLACE

<<<<<<< SEARCH
function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: V3,
  color: ColorInput,
  dir?: V3,
  segments = 10,
)
=======
function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: V3,
  color: Fill,
  dir?: V3,
  segments = 10,
)
>>>>>>> REPLACE

<<<<<<< SEARCH
function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: V3,
  color: ColorInput,
  segments = 8,
  rings = 5,
)
=======
function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: V3,
  color: Fill,
  segments = 8,
  rings = 5,
)
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
)
=======
  color: Fill,
)
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(powerCoil, 0.011, {
    color: BLACK,
    bands: [
      [0.22, VIOLET],
      [0.52, CYAN],
      [0.77, VIOLET],
    ],
    sides: 6,
    caps: "round",
    name: "s2PowerCable",
  });
=======
  b.sweep(powerCoil, 0.011, {
    color: BLACK,
    caps: "round",
    name: "s2PowerCable",
    section: { ngon: 6 },
  });
>>>>>>> REPLACE
```