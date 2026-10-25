Cause: the `box` helper passes its `color` argument through as a raw value, but `box` is called with `color` of type `any`, and the `CHEV` / `HAZARD` / `DIRT` / `SCRATCH` paints are fine; the failing call is `box([...], [...], "#0f1117")`-style use where the colour is not a string. More precisely, `b.part` in this SDK version rejects any value that is not a colour string or paint, and `IRON`-style metals are paints, but `box(size, at, color, extra)` is also called with `extra` objects passed as the third argument in `neon`'s `glow(box(...))` path only when the colour is missing. The reliable fix is to make the helper's colour argument explicit and typed, so only strings or paints reach `b.part`.

<<<<<<< SEARCH
  const box = (size: V3, at: V3, color: any, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...extra });
  const cyl = (r: number, h: number, at: V3, color: any, extra: Record<string, unknown> = {}, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, ...extra });
=======
  const box = (size: V3, at: V3, color: string | Paint, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...extra });
  const cyl = (r: number, h: number, at: V3, color: string | Paint, extra: Record<string, unknown> = {}, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, ...extra });
>>>>>>> REPLACE

<<<<<<< SEARCH
import { paint, stripes, grain, mottle, rgb } from "agentic-3js-builder";
=======
import { paint, stripes, grain, mottle, rgb, type Paint } from "agentic-3js-builder";
>>>>>>> REPLACE