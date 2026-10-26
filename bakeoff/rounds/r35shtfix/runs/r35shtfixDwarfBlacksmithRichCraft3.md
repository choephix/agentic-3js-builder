The `Col` alias is `ColorInput`, which includes `Paint`, but the `b.sweep`/`b.part` color slots here expect `Fill`, which `Col` doesn't match. Aliasing `Col` to `Fill` fixes it.

<<<<<<< SEARCH
import type { Joint, ColorInput } from "agentic-3js-builder";
=======
import type { Joint, Fill } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
type Col = ColorInput;
=======
type Col = Fill;
>>>>>>> REPLACE