A textured gear in `gearTrain` requires a tint colour string (such as `TINT.gilt`), but was passed a `Paint` instance (`GILT`).

## Edits

<<<<<<< SEARCH
import {
  coil,
  gaugeTexture,
  gearGeometry,
  gearTrain,
  metal,
  panelled,
} from "agentic-3js-builder/kits/clockwork";
=======
import {
  coil,
  gaugeTexture,
  gearGeometry,
  gearTrain,
  metal,
  panelled,
  TINT,
} from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE

<<<<<<< SEARCH
      { teeth: 16, on: 1, shift: -0.015, color: GILT, texture: true },
=======
      { teeth: 16, on: 1, shift: -0.015, color: TINT.gilt, texture: true },
>>>>>>> REPLACE