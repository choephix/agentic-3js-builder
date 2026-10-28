The helpers typed their colour as `Opt["color"]`, but `color` is a positional argument of `b.part`, not a field of its options, so the property doesn't exist. Typing those parameters as `ColorInput` fixes all four lines.

<<<<<<< SEARCH
import { catmull, createBuilder, frame, grain, mix, noise, paint, stripes, svg } from "agentic-3js-builder";
=======
import { catmull, createBuilder, frame, grain, mix, noise, paint, stripes, svg } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const put = (g: THREE.BufferGeometry, color: Opt["color"], at: V, o: Partial<Opt> = {}) =>
=======
  const put = (g: THREE.BufferGeometry, color: ColorInput, at: V, o: Partial<Opt> = {}) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const box = (w: number, h: number, d: number, color: Opt["color"], at: V, o: Partial<Opt> = {}) =>
=======
  const box = (w: number, h: number, d: number, color: ColorInput, at: V, o: Partial<Opt> = {}) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const sphere = (r: number, color: Opt["color"], at: V, scale?: V) =>
=======
  const sphere = (r: number, color: ColorInput, at: V, scale?: V) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const lathe = (outline: Pt[], color: Opt["color"], at: V, segments = 10) =>
=======
  const lathe = (outline: Pt[], color: ColorInput, at: V, segments = 10) =>
>>>>>>> REPLACE