Cause: the helper parameters were typed as `ColorInput` instead of the SDK’s `Fill`, the rod overload received an incompatible color type, and `HULL_LIGHT` was referenced without being defined.

```ts
<<<<<<< SEARCH
import * as THREE from "three";
import { type Builder, cells, createBuilder, mix, noise, paint, type ColorInput, type Rgb, svg } from "agentic-3js-builder";
=======
import * as THREE from "three";
import { type Builder, cells, createBuilder, mix, noise, paint, type ColorInput, type Fill, type Rgb, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
export const PANEL_LIGHT = "#b3b39b";
=======
export const PANEL_LIGHT = "#b3b39b";
export const HULL_LIGHT = "#9da393";
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  name?: string,
  group = "galley",
) {
=======
  color: Fill,
  name?: string,
  group = "galley",
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  name?: string,
  segments = 8,
  group = "galley",
) {
=======
  color: Fill,
  name?: string,
  segments = 8,
  group = "galley",
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  name?: string,
  group = "galley",
) {
=======
  color: Fill,
  name?: string,
  group = "galley",
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const options = name
    ? {
        color,
        name,
        group,
=======
  const options = name
    ? {
        color: color as Fill,
        name,
        group,
>>>>>>> REPLACE
```