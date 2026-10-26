The `rod` helper's `color` parameter was typed `ColorInput`, but `b.rod` expects `Fill`. `chain().joints` is a `readonly Joint[]`, so the `wings` record must hold `readonly Joint[]`.

<<<<<<< SEARCH
import type { Joint, ColorInput } from "agentic-3js-builder";
=======
import type { Joint, Fill } from "agentic-3js-builder";
type ColorInput = Fill;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const wings: Record<string, Joint[]> = {};
=======
  const wings: Record<string, readonly Joint[]> = {};
>>>>>>> REPLACE