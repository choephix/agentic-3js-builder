The module uses `INK_CORE` for the leg toe beans but never defines it, so the build stops at the first reference. I'll define it next to the other palette colours as the kit's `INK`.

<<<<<<< SEARCH
const NOSE = "#241526";
=======
const NOSE = "#241526";
const INK_CORE = INK;
>>>>>>> REPLACE