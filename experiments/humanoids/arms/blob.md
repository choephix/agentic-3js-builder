# Arm D: blob

Your toolkit is the SDK in `docs/api.md` plus blended volumes, which you build first, then use for both subjects: a body part made of several simple ingredients merged into one closed mesh with smooth, sculpted junctions, as at the armpit, the shoulder, the hip and the neck.

## Blended volumes

- Lives in `src/experimental/blob.ts`; samples import it from `../src/experimental/blob`.
- A blob is a list of ingredients (spheres, ellipsoids, capsules and tapered capsules, rounded boxes, and tubes along a Path or Chain), each adding volume or carving it away, merged with a blend width in meters.
- It is meshed into one closed mesh at a chosen cell size, in the low-poly look: facets are fine, triangles spread evenly, within the triangle budget.
- Each ingredient belongs to bones: a joint, or a chain along its length. A vertex's skin weights come from how much each ingredient contributes to the surface there, so the blend between shoulder and arm bends with both bones.
- Positions, directions and paths are ordinary SDK inputs (Points, Directions, Frames, Paths). Colours, paints and surface queries work on blobs as on other parts.
- The API reads like the rest of `docs/api.md`: few names, few options. A doc comment at the top of the module documents it in `docs/api.md` style; your samples use only what it documents.
- Changes to existing `src/` files only where blobs need them, strictly additive (every existing sample builds exactly as before). Another builder may be editing the same file: re-read before each edit.

## Order of work

1. Build blended volumes. Prove them on a throwaway `samples/blobTest.ts`: up to 3 snapshots, outside the subject budget. Delete that file once the subjects start.
2. Build both subjects with them. Keep improving the toolkit while you build them, and record each change in your notes.
