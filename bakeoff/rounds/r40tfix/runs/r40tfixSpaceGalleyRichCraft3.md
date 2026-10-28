The helper colour type `ColorInput` (which includes `Rgb` tuples) is wider than the SDK's `Fill`, so I changed the helpers' `Col` alias to `Fill`, imported from the SDK.

<<<<<<< SEARCH
import type { ColorInput } from "agentic-3js-builder";
=======
import type { Fill } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
type Col = ColorInput;
=======
type Col = Fill;
>>>>>>> REPLACE