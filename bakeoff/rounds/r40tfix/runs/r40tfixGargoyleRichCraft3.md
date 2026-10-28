Cause: `ell` and `claw` typed their colour as `ColorInput`, but `b.part` and `b.spike` take `Fill`.

<<<<<<< SEARCH
import type { Joint, ColorInput } from "agentic-3js-builder";
=======
import type { Joint, Fill } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const ell = (at: V, r: V, color: ColorInput, bone: Joint, seg: [number, number] = [8, 6]) =>
=======
  const ell = (at: V, r: V, color: Fill, bone: Joint, seg: [number, number] = [8, 6]) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const claw = (base: V, dir: V, len: number, r: number, bone: Joint, color: ColorInput = HORN) =>
=======
  const claw = (base: V, dir: V, len: number, r: number, bone: Joint, color: Fill = HORN) =>
>>>>>>> REPLACE