The helpers `bx`, `cyl` and `sph` are typed with `ColorInput`, but `b.part` expects `Fill`, which is the SDK's narrower colour type. Importing `Fill` and using it in the three helper signatures and in `frust` fixes all four lines.

<<<<<<< SEARCH
import type { ColorInput } from "agentic-3js-builder";
=======
import type { Fill } from "agentic-3js-builder";
type ColorInput = Fill;
>>>>>>> REPLACE