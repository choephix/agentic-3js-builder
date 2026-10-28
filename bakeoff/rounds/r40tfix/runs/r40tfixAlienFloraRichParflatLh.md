The trunk builder called `require("agentic-3js-builder")` inside a function, which is invalid in an ES module; `catmull` is already imported at the top, so the `require` and its dead helper lines can go.

<<<<<<< SEARCH
  const path = (b as any).catmull
    ? undefined
    : undefined;
  const pts: number[][] = [
=======
  const pts: number[][] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { catmull } = require("agentic-3js-builder");
  const spine = catmull(pts);
=======
  const spine = catmull(pts);
>>>>>>> REPLACE