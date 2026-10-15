The root joint must be created with `b.joint` before geometry parts can be attached to the builder.

## Edits

<<<<<<< SEARCH
import {
  aim,
  bezier,
  catmull,
  countershade,
  createBuilder,
  gradient,
  mottle,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";
=======
import {
  aim,
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  gradient,
  mid,
  mottle,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // 1. STAGED ENVIRONMENT: THE CHURNING OCEAN VORTEX & WRECKAGE
  // ---------------------------------------------------------------------------
=======
  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY (Root & Spine must exist before parts are placed)
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.42, 0], dir: [0, 1, 0] });
  const spine1 = b.joint("spine1", { parent: root, at: [0, 0.85, 0.02], dir: [0, 1, 0.1], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.08], dir: [0, 1, 0.15], role: "spine" });
  const head = b.joint("head", { parent: spine2, at: [0, 1.85, 0.18], dir: [0, 0.95, 0.25], role: "head" });
  const mantleApex = b.joint("mantleApex", {
    parent: head,
    at: [0, 2.75, -0.15],
    dir: [0, 0.8, -0.4],
    role: "head",
  });
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 1.55, 0.42],
    dir: [0, 0.2, 0.98],
    role: "jaw",
  });
  const jawLower = b.joint("jawLower", {
    parent: head,
    at: [0, 1.38, 0.38],
    dir: [0, -0.35, 0.92],
    role: "jaw",
  });
  const siphonL = b.joint("siphonL", { parent: spine2, at: [0.42, 1.25, -0.05], dir: [0.6, -0.2, -0.75] });
  const siphonR = b.joint("siphonR", { parent: spine2, at: [-0.42, 1.25, -0.05], dir: [-0.6, -0.2, -0.75] });

  // ---------------------------------------------------------------------------
  // 1. STAGED ENVIRONMENT: THE CHURNING OCEAN VORTEX & WRECKAGE
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(
    splashFrames.map((pt) => {
      const normal = pt.clone().setY(0).normalize();
      return {
        at: pt,
        axis: new THREE.Vector3(0, 1, 0),
        quat: aim(new THREE.Vector3(0, 1, 0), normal),
        weights: [],
        bone: null,
        local: (p: any) => pt.clone().add(p),
        dir: (v: any) => v,
        moved: (p: any) => p,
      } as any;
    }),
    foamSwirlTex,
=======
  b.cards(
    splashFrames.map((pt) => frame(pt, [0, 1, 0])),
    foamSwirlTex,
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // 2. SKELETON HIERARCHY
  // ---------------------------------------------------------------------------

  // Single root joint rising from ocean center
  const root = b.joint("root", { at: [0, 0.42, 0], dir: [0, 1, 0] });

  // Spine rising through torso and neck
  const spine1 = b.joint("spine1", { parent: root, at: [0, 0.85, 0.02], dir: [0, 1, 0.1], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.08], dir: [0, 1, 0.15], role: "spine" });

  // Head / Mantle Core
  const head = b.joint("head", { parent: spine2, at: [0, 1.85, 0.18], dir: [0, 0.95, 0.25], role: "head" });

  // Top of the towering mantle
  const mantleApex = b.joint("mantleApex", {
    parent: head,
    at: [0, 2.75, -0.15],
    dir: [0, 0.8, -0.4],
    role: "head",
  });

  // Jaw structure (Beak & Mandibles)
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 1.55, 0.42],
    dir: [0, 0.2, 0.98],
    role: "jaw",
  });
  const jawLower = b.joint("jawLower", {
    parent: head,
    at: [0, 1.38, 0.38],
    dir: [0, -0.35, 0.92],
    role: "jaw",
  });

  // Left & Right Siphons (Hydro-propulsion exhausts)
  const siphonL = b.joint("siphonL", { parent: spine2, at: [0.42, 1.25, -0.05], dir: [0.6, -0.2, -0.75] });
  const siphonR = b.joint("siphonR", { parent: spine2, at: [-0.42, 1.25, -0.05], dir: [-0.6, -0.2, -0.75] });
=======
>>>>>>> REPLACE