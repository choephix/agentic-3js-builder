# Arm B: sculpt

Your toolkit is the SDK in `README.md` plus a sculpting layer you build first, then use for both subjects: block the body out with sweeps and parts, then reshape the built meshes with brushes, the way an artist sculpts from a blockout.

## The sculpting layer

- Lives in `src/experimental/sculpt.ts`; samples import it from `../src/experimental/sculpt`.
- Brushes act on built meshes (sweeps, lofts, parts): flatten toward a plane, push or pull a region along a direction, inflate or deflate along the surface normal, crease along a path, smooth. Mirrored across x = 0 by default.
- Brush positions, directions, planes and paths are ordinary SDK inputs: Points, Directions, Frames and Paths, so joints, hits, `sweep.at(t)`, `chain.at(t)` and made-up points all work. Sizes are in meters and falloff is smooth.
- Vertices keep their skin weights, so sculpted skin bends with the skeleton. Where a brush needs more vertices than the mesh has, the layer adds them locally, with weights interpolated from their neighbours.
- Brushes apply in code order and the result is deterministic. Surface queries made after a brush see the sculpted shape.
- The API reads like the rest of `README.md`: few names, few options. A doc comment at the top of the module documents it in README style; your samples use only what it documents.
- Changes to existing `src/` files only where the layer needs them, strictly additive (every existing sample builds exactly as before). Another builder may be editing the same file: re-read before each edit.

## Order of work

1. Build the layer. Prove it on a throwaway `samples/sculptTest.ts`: up to 3 snapshots, outside the subject budget. Delete that file once the subjects start.
2. Build both subjects with it. Keep improving the layer while you build them, and record each change in your notes.
