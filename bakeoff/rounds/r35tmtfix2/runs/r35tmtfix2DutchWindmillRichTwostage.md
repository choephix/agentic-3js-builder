Cause: a helper restricted paintable colours to `string`, and the stage-two sign/garden code referenced palette names that were never declared in its scope.

```text
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, polyline, rng, paint, noise, smoothstep } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, catmull, polyline, rng, paint, noise, smoothstep } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
  bevel = 0,
) {
=======
  color: ColorInput,
  name: string,
  bevel = 0,
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
  segments = 10,
  dir?: [number, number, number],
) {
=======
  color: ColorInput,
  name: string,
  segments = 10,
  dir?: [number, number, number],
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: FRAME,
    name: "s26SideSignBoard",
=======
    color: PALETTE.FRAME,
    name: "s26SideSignBoard",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: WINDOW_GLOW,
    name: "s26SideSignInset",
=======
    color: PALETTE.WINDOW_GLOW,
    name: "s26SideSignInset",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: WOOD_DARK,
    name: "s26SignBorderBottom",
=======
    color: PALETTE.WOOD_DARK,
    name: "s26SignBorderBottom",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: WOOD_DARK,
    name: "s26SignBorderLower",
=======
    color: PALETTE.WOOD_DARK,
    name: "s26SignBorderLower",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: WOOD_DARK,
    name: "s26SignBorderTop",
=======
    color: PALETTE.WOOD_DARK,
    name: "s26SignBorderTop",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: WOOD_DARK,
    name: "s26SignBorderUpper",
=======
    color: PALETTE.WOOD_DARK,
    name: "s26SignBorderUpper",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: BRASS,
      name: "s26SignMillHub",
=======
      color: PALETTE.BRASS,
      name: "s26SignMillHub",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: WINDOW,
      name: `s26SignBladeRoot${i}`,
=======
      color: PALETTE.WINDOW,
      name: `s26SignBladeRoot${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: WINDOW,
      name: `s26SignBlade${i}`,
=======
      color: PALETTE.WINDOW,
      name: `s26SignBlade${i}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: ROOF_LIGHT,
      name: "s26SignHeartLobeA",
=======
      color: PALETTE.ROOF_LIGHT,
      name: "s26SignHeartLobeA",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: ROOF_LIGHT,
      name: "s26SignHeartLobeB",
=======
      color: PALETTE.ROOF_LIGHT,
      name: "s26SignHeartLobeB",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: ROOF_LIGHT,
      name: "s26SignHeartPoint",
=======
      color: PALETTE.ROOF_LIGHT,
      name: "s26SignHeartPoint",
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: BRASS, name: "s26SignTopPeg" },
=======
    { color: PALETTE.BRASS, name: "s26SignTopPeg" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      i % 3 === 0 ? STONE_LIGHT : STONE_DARK,
=======
      i % 3 === 0 ? PALETTE.STONE_LIGHT : PALETTE.STONE_DARK,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: LEAF,
=======
        color: PALETTE.LEAF,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: FLOWER,
=======
      color: PALETTE.FLOWER,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: BRASS,
=======
      color: PALETTE.BRASS,
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: LEAF,
=======
        color: PALETTE.LEAF,
>>>>>>> REPLACE
```