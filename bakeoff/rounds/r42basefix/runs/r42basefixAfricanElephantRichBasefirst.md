`catmull` is a standalone SDK export, not a method on `Builder`, so the three call sites need the import and a direct call.

<<<<<<< SEARCH
import { type Builder, createBuilder, frame } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, frame, catmull } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const curve = b.catmull ? b.catmull(path) : null;
  const trunk = b.chain("trunk", curve ?? path, { parent: "head", count: 8, role: "tail" });
=======
  const curve = catmull(path);
  const trunk = b.chain("trunk", curve, { parent: "head", count: 8, role: "tail" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const path = b.catmull ? (b as any).catmull(pts) : pts;
=======
    const path = catmull(pts);
>>>>>>> REPLACE