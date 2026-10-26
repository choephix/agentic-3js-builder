Cause: the module mixes palette properties with bare identifiers, references a nonexistent `PAINT_MAGENTA`, and types helper colours as `string` even though the SDK permits `Paint`.

```text
<<<<<<< SEARCH
import { type Builder, createBuilder, paint, rng, spots, stripes, frame } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, paint, rng, spots, stripes, frame } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  if (Math.sin(along * 72 + across * 25) > 0.62) return PALETTE.PAINT_MAGENTA;
=======
  if (Math.sin(along * 72 + across * 25) > 0.62) return PALETTE.PAINT_PINK;
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
=======
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_GREEN,
      ridge: PAINT_PINK,
=======
      band: PALETTE.PAINT_GREEN,
      ridge: PALETTE.PAINT_PINK,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_PINK,
      ridge: PAINT_GREEN,
=======
      band: PALETTE.PAINT_PINK,
      ridge: PALETTE.PAINT_GREEN,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_PINK,
      ridge: PAINT_GREEN,
=======
      band: PALETTE.PAINT_PINK,
      ridge: PALETTE.PAINT_GREEN,
>>>>>>> REPLACE

<<<<<<< SEARCH
      band: PAINT_GREEN,
      ridge: PAINT_PINK,
=======
      band: PALETTE.PAINT_GREEN,
      ridge: PALETTE.PAINT_PINK,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: PAINT_CREAM,
=======
          color: PALETTE.PAINT_CREAM,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: WOOD_RED,
=======
          color: PALETTE.WOOD_RED,
>>>>>>> REPLACE

<<<<<<< SEARCH
          color: PAINT_CREAM,
=======
          color: PALETTE.PAINT_CREAM,
>>>>>>> REPLACE

<<<<<<< SEARCH
        b.part(loopGeo(charm.radius * 0.72, 0.006), PAINT_GREEN, {
=======
        b.part(loopGeo(charm.radius * 0.72, 0.006), PALETTE.PAINT_GREEN, {
>>>>>>> REPLACE

<<<<<<< SEARCH
        WOOD_RED,
=======
        PALETTE.WOOD_RED,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(beadGeo(0.018), PAINT_CREAM, {
=======
      b.part(beadGeo(0.018), PALETTE.PAINT_CREAM, {
>>>>>>> REPLACE
```