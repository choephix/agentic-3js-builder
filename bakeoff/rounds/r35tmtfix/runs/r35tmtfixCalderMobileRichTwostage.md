Cause: the helper parameters were narrowed to `string` instead of the SDK’s `ColorInput`, and the blue crescent outline doubles back and self-intersects.

<<<<<<< SEARCH
import { type Builder, createBuilder, paint } from "agentic-3js-builder";
=======
import { type Builder, type ColorInput, createBuilder, paint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
) {
=======
  color: ColorInput,
  name: string,
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
  x: [number, number, number] = [1, 0, 0],
=======
  color: ColorInput,
  name: string,
  x: [number, number, number] = [1, 0, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [-0.10, 0.18],
      [0.02, 0.25],
      [0.16, 0.19],
      [0.23, 0.08],
      [0.19, 0.08],
      [0.09, 0.14],
      [-0.03, 0.15],
      [-0.15, 0.08],
      [-0.20, -0.01],
      [-0.16, -0.02],
      [-0.05, 0.06],
      [0.07, 0.08],
      [0.16, 0.04],
      [0.20, -0.01],
      [0.17, 0.14],
      [0.05, 0.19],
    ],
=======
    [
      [-0.10, 0.18],
      [0.02, 0.25],
      [0.16, 0.19],
      [0.23, 0.08],
      [0.17, 0.02],
      [0.09, 0.14],
      [-0.03, 0.15],
      [-0.15, 0.08],
      [-0.20, -0.01],
      [-0.14, -0.04],
      [-0.05, 0.06],
      [0.07, 0.08],
      [0.15, 0.04],
      [0.12, 0.00],
      [0.17, 0.14],
      [0.05, 0.19],
    ],
>>>>>>> REPLACE