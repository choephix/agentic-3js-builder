# Blob arm notes

## Result

|           | Lifeguard (Blob)                      | Sprinter (Blob)                       |
| --------- | ------------------------------------- | ------------------------------------- |
| slug      | `lifeguardBlob`                       | `sprinterBlob`                        |
| final tag | `v05`                                 | `v03`                                 |
| parts     | 46                                    | 49                                    |
| triangles | 48,212                                | 50,432                                |
| joints    | 53                                    | 57                                    |
| colours   | 11 flat (plus 1 paint atlas, 2048 px) | 10 flat (plus 1 paint atlas, 4096 px) |
| height    | 1.857 m (hair top), 1.504 m wide      | 1.709 m, 1.339 m wide                 |

Report issues: none on either final snapshot. Lifeguard tags: v01–v05 (5 of 6); sprinter: v01–v03. Toolkit proof: `samples/blobTest.ts`, 3 snapshots (`blobTest` v01–v03), file deleted afterwards.

Parts, lifeguard: `body` (torso, neck, arms, legs, one blob), `handL/R`, `footL/R` (with five toes), `head`, `jaw`, `hair`, `trunks`, plus eyes, irises, pupils, lips, nails, toenails, sunglasses (rims, lenses, temples, bridge), cord, whistle.
Parts, sprinter: `body`, `handL/R`, `head`, `jaw`, `hair`, `ponytail` (chain-skinned), `top`, `briefs`, `bib`, `shoeL/R` with 8 spikes each side, straps, hair tie, eyes, lips, nails.

## Toolkit

`src/experimental/blob.ts` (new file, documented in its module doc comment). No existing `src/` file was changed.

A blob is a list of ingredients merged into ONE closed, skinned mesh:

- Ingredients: `sphere`, `ellipsoid` (radii `[rx, ry, rz]`, `dir`/`up` orient it like `part`), `capsule` (optionally tapered), `box` (rounded), `tube` (along a Path or a Chain, radius number / keyed array / function), `plane` (a half-space, for carving). Modifiers: `carve(x, opts?)` subtracts, `grow(x, d)` inflates by `d` metres (garments, thin layers). Every ingredient takes `{ bone?, blend? }`.
- `blob(b, ingredients, { color, blend?, cell?, spread?, bone?, smooth?, name?, group? })` returns a `Part` (a Frame with `mesh`), so `b.surface(blob)`, sticking, draping and paints work on it.
- How it works: the ingredients fold, in list order, into a signed distance field with polynomial smooth-min (solids) and smooth-max (carves); the blend width is per blob or per ingredient. The field is sampled on a `cell`-metre grid (only inside each ingredient's bounds) and meshed with naive surface nets. Vertices are projected onto the exact surface, then relaxed twice (mean of neighbours, back onto the surface) so triangles are even; normals come from the field gradient (`smooth: false` gives flat facets).
- Skinning: at each vertex the fold also mixes the ingredients' bone weights by the same factor the smooth-min gave each ingredient, so junctions carry both bones. A Chain bone shares an ingredient along the chain (`chain.weightsAt` of the nearest point). Then the weights are diffused over the mesh graph by `spread` metres (default 2 × blend) so joints bend over a stretch of skin, and the top 4 bones are kept.
- Limits: features thinner than ~2 cells vanish (fingers need cell 6 mm); creases and edges are rounded (no sharp features), cut edges are ragged unless the carve's `blend` is ≥ 10 mm; one uniform `cell` per blob, so fine parts (hands, feet, head) are separate blobs that intersect the body (visible seams at wrist, ankle, jaw); triangle count is area / cell², with no decimation of flat areas; a blob's surface coordinates for paints are `[0, 0]` (paint by position).
- It reaches the builder's private context with `b["ctx"]`.

## Process

Lifeguard:

- v01 (after the toolkit): whole figure first look. Body, hands, feet, head, jaw, hair, sunglasses, whistle, trunks. Report: 68,932 triangles (over budget), so cells were coarsened afterwards.
- v02: cells raised (body 20 mm, trunks 16, head 9), fingers spread apart with a 3 mm blend, nails and toenails added, bigger eyes and lids, lips as flattened ellipsoids, sunglasses got white rims.
- v03: brows painted on the actual face (ray hits from `b.surface(head)`) instead of buried capsules; trunk hem/waist carves blended wider to stop ragged cut edges. Flex A showed the waistband and side stripes (rigid sweeps) left behind by the moving leg.
- v04: waistband, hem and side stripes moved into a paint on the trunks so they skin with the cloth. Trunks became `grow(lowerBody, 8 mm)` with two carves.
- v05: same shape, file formatted; final snapshot of the final file.

Sprinter (three renders, plus free `--report-only` runs and a scratch software renderer for shape work):

- v01: first full build. Report clean, 50k triangles. Bib first meshed at 12k triangles (a whole slab of the chest); cut with a back plane afterwards.
- v02: upper lip and chin pulled back.
- v03: upper lip brought forward again (it had been buried in v02).

## Friction

- The builder keeps its context private; blobs needed it (`b["ctx"]`). An extension hook on `Builder` would be cleaner.
- I had to write a scratch renderer (`scratch/blob/`: dump to JSON, numpy rasteriser) to iterate on shape without spending snapshots; it can't show paints or skinning.
- Face work was the hardest: placing eyes, lips and brows needs the built surface; ray hits (`surface.ray`) solved that, and paints for zinc stripe, brows and bib digits worked well on blobs.
- Hand-written: all anatomy numbers, finger and toe geometry, hand frames, digits bitmap font for the bib, the ponytail chain. Both samples repeat the hand code because each sample is one file.
- Wanted from the SDK: a way to combine blobs of different `cell` sizes without seams, adaptive resolution/decimation, sharp edges (dual contouring), a Chain-aware `sweep.line`-like way to lay strips on blob surfaces that skin with them (rigid sweeps left the stripes behind, so I used paints), and mesh-graph weight smoothing as a SDK feature for ordinary sweeps.

## Verdict

Best: torso and limbs. Chest, pecs, abs, armpits, shoulders, hips, glutes and the crotch come out as one continuous sculpted surface with smooth junctions that plain sweeps do not give, and they bend without cracks in both flex shots (chain-weighted tubes plus diffusion at knees, elbows, shoulders). Hands came out well too: five separated fingers, thumb apart, nails, per-phalanx joints. Garments as grown and cut body volumes (trunks, briefs, crop top, the thin bib) fit exactly and deform with the body.

Worst: the face. Lips, brows, eyelids and the nose are below the grid's resolution at head cell 8–9 mm, so they read as blobs (sausage-like lips, heavy jaw and chin, seam at the jaw), and the head is slightly small on the lifeguard. Feet (lifeguard): toes are stubby bumps. Seams where hands, feet and head blobs meet the body are visible as ragged intersection lines.

Help from the toolkit: large for body-part shapes (chest, shoulders, hips, thighs, calves, hand form) and for skinning quality; modest for fine facial detail and thin features, which needed paints and separate small parts. Building each subject took a fraction of the effort a sweep-only body would need for the same anatomy, at the cost of triangle budget (48–50k of 60k) and many small blobs at different cell sizes.
