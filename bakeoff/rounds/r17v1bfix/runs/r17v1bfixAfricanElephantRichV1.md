Cause: `mix()` and `.map()` return `[r, g, b]` arrays, which I cast to `string`, but `color` only takes a colour string or a paint. Four calls did this, and the first one to run, the girth-fold sweep, threw. Fix: add a helper that converts an Rgb to a hex string and use it in all four.

<<<<<<< SEARCH
const GLAND = "#3e3835";
=======
const GLAND = "#3e3835";

const css = (c: readonly number[]) =>
  "#" +
  c
    .map((v) =>
      Math.round(Math.min(Math.max(v, 0), 1) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(ring.slice(0.2, 0.8), 0.022, { color: SKIN_SHADE.map((v) => v * 0.9) as unknown as string, sides: 4, group: "body" });
=======
    b.sweep(ring.slice(0.2, 0.8), 0.022, { color: css(SKIN_SHADE.map((v) => v * 0.9)), sides: 4, group: "body" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    { bone: jaw, sides: 6, smooth: false, color: mix(SKIN_BELLY, PINK, 0.35) as unknown as string, name: "lowerJaw", group: "head" },
=======
    { bone: jaw, sides: 6, smooth: false, color: css(mix(SKIN_BELLY, PINK, 0.35)), name: "lowerJaw", group: "head" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: mix(SKIN_MID, PINK, 0.4) as unknown as string,
=======
    color: css(mix(SKIN_MID, PINK, 0.4)),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep([[s * 0.28, 2.25, 1.9], [s * 0.32, 2.1, 2.1]], 0.13, { bone: head, color: mix(SKIN_MID, PINK, 0.25) as unknown as string, sides: 7, smooth: false, caps: "round", group: `tusk${L}` });
=======
    b.sweep([[s * 0.28, 2.25, 1.9], [s * 0.32, 2.1, 2.1]], 0.13, { bone: head, color: css(mix(SKIN_MID, PINK, 0.25)), sides: 7, smooth: false, caps: "round", group: `tusk${L}` });
>>>>>>> REPLACE