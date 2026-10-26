```ts
// Cause: `cel` is exported by the toon kit, not the core SDK, and the outline tuples use an optional third element instead of the SDK's accepted two- or three-element union.

<<<<<<< SEARCH
  cel,
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
const BRICK_MORTAR = cel("#efc28d", "#aa725d");
=======
const BRICK_MORTAR = paint((_p, n) => (n.y > 0.1 ? "#efc28d" : "#aa725d"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const BRICK_MAIN = cel("#c9684c", "#833d3b");
=======
const BRICK_MAIN = paint((_p, n) => (n.y > 0.1 ? "#c9684c" : "#833d3b"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const BRICK_ALT = cel("#df7a51", "#994a40");
=======
const BRICK_ALT = paint((_p, n) => (n.y > 0.1 ? "#df7a51" : "#994a40"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const STONE = cel(mottle("#b8b4a0", "#777a73", { size: 0.18, contrast: 1.4, seed: 14 }), "#62625e");
=======
const STONE = mottle("#b8b4a0", "#777a73", { size: 0.18, contrast: 1.4, seed: 14 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const STONE_LIGHT = cel("#d9cfaa", "#898071");
=======
const STONE_LIGHT = paint((_p, n) => (n.y > 0.1 ? "#d9cfaa" : "#898071"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const WOOD_DARK = cel("#563329", "#2e2026");
=======
const WOOD_DARK = paint((_p, n) => (n.y > 0.1 ? "#563329" : "#2e2026"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const WOOD = cel(grain("#7a472d", "#b8753e", { size: 0.075, axis: "y", seed: 8 }), "#472b2b");
=======
const WOOD = grain("#7a472d", "#b8753e", { size: 0.075, axis: "y", seed: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const WOOD_LIGHT = cel(grain("#9b5a31", "#d4944d", { size: 0.065, axis: "y", seed: 12 }), "#5c3430");
=======
const WOOD_LIGHT = grain("#9b5a31", "#d4944d", { size: 0.065, axis: "y", seed: 12 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const WOOD_EDGE = cel("#3d2729", "#241c25");
=======
const WOOD_EDGE = paint((_p, n) => (n.y > 0.1 ? "#3d2729" : "#241c25"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const ROOF = cel(mottle("#315d5c", "#183b43", { size: 0.16, contrast: 1.25, seed: 22 }), "#142d37");
=======
const ROOF = mottle("#315d5c", "#183b43", { size: 0.16, contrast: 1.25, seed: 22 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const ROOF_TRIM = cel("#5c8880", "#294c52");
=======
const ROOF_TRIM = paint((_p, n) => (n.y > 0.1 ? "#5c8880" : "#294c52"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const ROOF_DARK = cel("#214448", "#122a32");
=======
const ROOF_DARK = paint((_p, n) => (n.y > 0.1 ? "#214448" : "#122a32"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const CREAM = cel("#f6dfae", "#bd8665");
=======
const CREAM = paint((_p, n) => (n.y > 0.1 ? "#f6dfae" : "#bd8665"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const CANVAS = cel("#f5e7bd", "#c89d77");
=======
const CANVAS = paint((_p, n) => (n.y > 0.1 ? "#f5e7bd" : "#c89d77"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const RED = cel("#e75b48", "#9b303c");
=======
const RED = paint((_p, n) => (n.y > 0.1 ? "#e75b48" : "#9b303c"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const GOLD = cel("#f2c65b", "#a86b3d");
=======
const GOLD = paint((_p, n) => (n.y > 0.1 ? "#f2c65b" : "#a86b3d"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const LEAF = cel("#76ad62", "#3f704e");
=======
const LEAF = paint((_p, n) => (n.y > 0.1 ? "#76ad62" : "#3f704e"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const FLOWER_PINK = cel("#f18ca2", "#aa4c68");
=======
const FLOWER_PINK = paint((_p, n) => (n.y > 0.1 ? "#f18ca2" : "#aa4c68"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const FLOWER_YELLOW = cel("#f8cf58", "#b17b3a");
=======
const FLOWER_YELLOW = paint((_p, n) => (n.y > 0.1 ? "#f8cf58" : "#b17b3a"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const FLOWER_BLUE = cel("#70b9d0", "#3c718a");
=======
const FLOWER_BLUE = paint((_p, n) => (n.y > 0.1 ? "#70b9d0" : "#3c718a"));
>>>>>>> REPLACE

<<<<<<< SEARCH
const SAIL_WOOD = cel(grain("#75412d", "#b66f3c", { size: 0.08, axis: "y", seed: 51 }), "#3d292a");
=======
const SAIL_WOOD = grain("#75412d", "#b66f3c", { size: 0.08, axis: "y", seed: 51 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const doorOutline: [number, number, "sharp"?][] = [
=======
  const doorOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [-0.12, 0],
=======
    [
      [-0.12, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(
    [
=======
  b.extrude(
    [
>>>>>>> REPLACE
```