# Arm C: contour

## Result

|               | Lifeguard                                                | Sprinter          |
| ------------- | -------------------------------------------------------- | ----------------- |
| slug          | `lifeguardContour`                                       | `sprinterContour` |
| final tag     | `v03` (same code as `v02`, re-rendered after formatting) | `v02`             |
| parts         | 87                                                       | 80                |
| triangles     | 14 180                                                   | 11 514            |
| joints        | 55                                                       | 55                |
| colours       | 14                                                       | 14                |
| height        | 1.858 m                                                  | 1.699 m           |
| report issues | 0                                                        | 0                 |

Both use the full required skeleton (`hips`, `spine`/`spine1`/`spine2`, `neck`, `head`, `jaw`, `shoulderL/R`, `upperArm`, `lowerArm`, `hand`, five digits × 3, `upLeg`, `leg`, `foot`, `toe`) plus `eyeL`/`eyeR`. Rest pose is an A-pose with palms down and slightly forward.

## Toolkit

Contoured sections: `contour(shape)` in `src/experimental/contour.ts` (documented in the module's doc comment). It is a `radius` for `b.sweep` / `b.sprout`: instead of scaling a circle, each ring is a polygon drawn from four reaches from the path (`front` = +ry, `back` = −ry, `right` = +rx, `left` = −rx; `side` sets both) and a `round` value (superellipse: 1 ellipse, 0.5 soft box, 0.2 box with softened corners, up to 2 lens/diamond). Every key is a number, an evenly spaced number list, `[t, value]` pairs or a function of source t. Pairs are interpolated with a monotone cubic (no overshoot, so a shelf stays a shelf) and put a ring at every keyed t. Options: `sides` (multiple of 4, default 12; two vertices straddle each axis so the flat faces sit exactly on the reaches), `smooth`, and `mirror` (swaps left/right for the mirror-image chain of a pair, because left and right chains built the same way have opposite binormals).

Everything a sweep does works with it (checked on smooth and rigid skin, ranged `from`/`to`, `extend`, point/flat/round caps, bands, colour functions, ranged sectors, `sweep.at`/`line`/`curve`, `surface`, and both flex shots).

Limits: reaches are measured along the section axes (front is the ring normal, so the `up` of the chain/path decides which way it faces); the section is star-shaped around the path, so it cannot draw a valley (two pecs separated by a groove are two sweeps); one `round` per ring; keep reaches above zero except at a point-capped tip; a round end cap adds its largest reach beyond the last ring, so domes are built by shrinking the reaches to a tiny last ring and using a flat cap.

Changes to existing `src/` files (only `src/sweep.ts`, all additive; existing samples verified byte-identical in every vertex/index/skin attribute, 63 of 63):

- `Radius` also accepts a `Contour` (new exported interface: `sides`, `smooth`, `reach(t)`, `keys(t)`, `knots`, `polygon(t, sides)`).
- A ring carries an optional polygon (`poly`, `key`); `sectionPoint`, ring building, sector edges, cap domes (kept inside the continuing tube) and `surfacePoint` read it through a new `polygonOf`; ring selection also compares the contour's `keys`, and keyed `knots` are mandatory rings.
- Smooth-shaded contour normals for surface queries come from vertex normals along the hit face.

## Process

Toolkit proof: `samples/contourTest.ts` (deleted), 1 snapshot: torso with chest shelf, a leg chain with different front/back reaches, a foot, a skull with a ranged sector; flex shots bent cleanly, so the subjects started right away.

Lifeguard

- `v01`: first full render. Whole torso from crotch to jaw as one sweep (pelvis, waist shelf for the trunks' band, ribs, chest, trapezius slope, neck) skinned to `[hips, spine chain, neck, head]`; pec lenses; chain sweeps for legs (hem of the trunks as a shelf between two keys) and arms (upper arm, forearm and palm in one continuous mesh, pronated with `twist`); a heel-to-toe foot sweep with five toe sweeps; finger chains with nail sectors; skull, jaw, hair (hairline as a shelf), nose (zinc as a sector), lips, ears, eyes, glasses draped on the hair, whistle cord draped on the body. No report issues.
- `v02`: whistle put on the sternum (it had landed on a pec, standing up), narrower white side stripe on the trunks.
- `v03`: same code, formatted with prettier (last snapshot is of the final file).

Sprinter

- `v01`: the lifeguard's file taken through a script that scales every length by 0.915 (tables, joint and path points), then hand-edited: crop top and briefs as colour bands and a hem shelf, bust sweeps instead of pecs, narrower shoulders and wider hips in the torso table, shoes as the foot section with a sole sector and five spikes, an svg race bib, a high ponytail (contoured sweep), no glasses/whistle/zinc. No report issues.
- `v02`: nose and its neighbours scaled down (features I had not scaled were too large on the smaller head), then formatted.

## Friction

- Left/right of a chain flips between the two sides of a body (binormal `T × N`); I added `mirror` after seeing the second leg come out backwards. Which way `front` faces depends on the chain's `up`, which has to be set at chain creation.
- Everything is keyed in t, but anatomy is measured in metres of height. I wrote `column(c0, c1, rows, i)` in each sample to turn `[y, front, back, side…]` rows into t-keys; that helper belongs in the toolkit (keys by world coordinate along a straight path).
- A round end cap adds the largest reach beyond the last ring (my first skulls had a topknot). I wrote a `dome()` helper for the quarter-circle rows.
- Eyes, glasses, whistle and drapes were placed by hand with rays and nearest-point queries on the built sweeps; that worked well. Circle and sphere sunk inside a contour needed manual depth choices.
- The sprinter was made by scaling code, not by parametrising it; a `scale` on the builder (or a body-table type) would have made both subjects one function.
- Without a free preview the loop would have been too slow: I ran the showcase viewer on my own port from `scratch/contour/view/` for close-ups and bend tests, and used snapshots only for the final checks.
- Time: the round's hour ran out before the faces were refined; the hands, feet and face are the least polished.

## Verdict

Best: torso (waist taper, chest, shoulder slope into the neck, in one continuous mesh with no seams), legs (thigh, knee, calf, ankle in one sweep with quads and calf mass, and the hem shelf), forearm-to-palm (one mesh that pronates and flattens into the hand), and the foot (heel, arch, instep, ball, toe box from one section). The clothes came out cheaper than as shells: trunks, briefs, crop top and shoes are colours and small shelves in the body sections.

Worst: the face (a horizontal-slice skull cannot make eye sockets, cheeks or a philtrum, so the eyes, nose and lips read as stuck on; the nose is too long in profile), the pecs/bust (separate lens sweeps, no groove between them), the fingers (thin tubes; only nails and a knuckle key), and the sprinter's proportions (a scaled man with a wider hip table; thighs read heavy).

How much it helped: a large win for limbs, torso and feet, where the section is the anatomy and one continuous smooth-skinned mesh bends cleanly in both flex shots; a modest win for the head; none for anything that is not a tube (ears, bib, hair tie, glasses, whistle, spikes).
