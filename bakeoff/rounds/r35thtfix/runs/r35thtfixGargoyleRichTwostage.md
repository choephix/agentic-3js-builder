```ts
// Causes: the helper annotations were narrower than the SDK's ColorInput/OutlinePoint types, unsupported `flat` options were passed to `extrude`, and `count: 4` prevented the spine chain from creating its named tip joint.

<<<<<<< SEARCH
import { type Builder, countershade, createBuilder, catmull, grain, limb, mix, mottle, noise, paint, resolve } from "agentic-3js-builder";
=======
import {
  type Builder,
  type ColorInput,
  countershade,
  createBuilder,
  catmull,
  grain,
  limb,
  mix,
  mottle,
  noise,
  paint,
  resolve,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
function sphere(
  b: Builder,
  color: string,
=======
function sphere(
  b: Builder,
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
function box(
  b: Builder,
  color: string,
=======
function box(
  b: Builder,
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
function stonePlate(
  b: Builder,
  color: string,
=======
function stonePlate(
  b: Builder,
  color: ColorInput,
>>>>>>> REPLACE

<<<<<<< SEARCH
    count: 4,
  });
=======
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [-0.07 - i * 0.004, 0],
=======
    [
      [-0.07 - i * 0.004, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const finials = [
=======
    const finials: Array<[number, number] | [number, number, "sharp"]> = [
>>>>>>> REPLACE

<<<<<<< SEARCH
    const slitOutline: [number, number][] = [
=======
    const slitOutline: Array<[number, number] | [number, number, "sharp"]> = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fangs = [
=======
  const fangs = [
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22UpperLid${sideName}`,
=======
        name: `s22UpperLid${sideName}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22LowerLid${sideName}`,
=======
        name: `s22LowerLid${sideName}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22InsetEye${sideName}`,
=======
        name: `s22InsetEye${sideName}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22InnerEyeWedge${sideName}`,
=======
        name: `s22InnerEyeWedge${sideName}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22StonePupil${sideName}`,
=======
        name: `s22StonePupil${sideName}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22EyeRecess${sideName}`,
=======
        name: `s22EyeRecess${sideName}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
        flat: true,
        name: `s22OuterEyeCrease${sideName}`,
=======
        name: `s22OuterEyeCrease${sideName}`,
>>>>>>> REPLACE
```