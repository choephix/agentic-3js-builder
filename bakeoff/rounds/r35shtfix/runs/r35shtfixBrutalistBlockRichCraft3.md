The module declares its own `Fill` type as `ColorInput`, but `b.part` and `b.rod` expect the SDK's `Fill`; the local alias is a different type, so I use the SDK's `Fill` (exported from the same module) instead.

<<<<<<< SEARCH
import type { ColorInput } from "agentic-3js-builder";
=======
import type { Fill } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
type Fill = ColorInput;
interface Bucket {
=======
interface Bucket {
>>>>>>> REPLACE