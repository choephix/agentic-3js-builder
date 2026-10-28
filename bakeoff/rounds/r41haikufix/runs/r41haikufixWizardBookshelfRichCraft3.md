The cause: `grain()` returns a `Paint`, not a function, so calling it fails, and `box()` was typed to accept only a string or texture, so it rejects paints. The `b.part ?` check is always true.

<<<<<<< SEARCH
import { createBuilder, grain, paint, rng, svg } from "agentic-3js-builder";
=======
import { createBuilder, grain, rng, svg, type Paint } from "agentic-3js-builder";
>>>>>>> REPLACE
<<<<<<< SEARCH
  const woodSide = paint((p, n) => grain(OAK_LIGHT, OAK_DARK, { size: 0.05, axis: "y", seed: 3 })(p, n));
=======
  const woodSide = grain(OAK_LIGHT, OAK_DARK, { size: 0.05, axis: "y", seed: 3 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string | THREE.Texture, tex?: THREE.Texture) =>
    b.part(
      new THREE.BoxGeometry(w, h, d),
      typeof color === "string" ? color : "#ffffff",
      tex ? { at: [x, y, z], flat: true, texture: tex } : { at: [x, y, z], flat: true },
    );
=======
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string | Paint, tex?: THREE.Texture) =>
    b.part(
      new THREE.BoxGeometry(w, h, d),
      color,
      tex ? { at: [x, y, z], flat: true, texture: tex } : { at: [x, y, z], flat: true },
    );
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part ? new THREE.BoxGeometry(0.2, 0.02, 0.02) : new THREE.BoxGeometry(0.2, 0.02, 0.02),
=======
    new THREE.BoxGeometry(0.2, 0.02, 0.02),
>>>>>>> REPLACE