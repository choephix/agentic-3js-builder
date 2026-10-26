The `plate` helper types `fill` as `ColorInput`, but `b.extrude` takes a `Fill` for `color`, so the parameter type has to be `Fill`.

<<<<<<< SEARCH
import type { ColorInput, DirectionInput, Joint, OutlinePoint, PointInput, Rgb } from "agentic-3js-builder";
=======
import type { DirectionInput, Fill, Joint, OutlinePoint, PointInput, Rgb } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    fill: ColorInput,
=======
    fill: Fill,
>>>>>>> REPLACE