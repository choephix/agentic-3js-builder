# Audit group j

## vikingLongship — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, and both flex shots were inspected; the dragon prow's separate upper/lower jaw and teeth read clearly, the hull/clinker rows, six oars per side, sail, rigging, and beach props are attached/intentional, and the apparent 48 mm `sweep.hull.55` loose-detector hit is the separate driftwood/shingle beach dressing rather than a visibly detached ship part. Counts: 225 parts, 10,814 triangles, 17 joints, 3 × 2.111 × 4 m.

## voxelWolf — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Tail tip block is visibly detached — evidence: `v03-sheet.jpg` side/three-quarter views show a gap at the tail tip, and report-only measures `box.tail.3` 12 mm from `tail` — cause: tail boxes are authored as independent pieces at `samples/voxelWolf.ts:176-184` — fix: place tail tip flush with tailMid or overlap the adjacent boxes by at least the voxel seam width.
- [P0] Neck block is rigid on `neckBase` while the child neck joint moves — evidence: report-only stiff-part check identifies `box.neck` 100% on `neckBase` while `neckTop` pivots; the flex-a/flex-b panels show the neck/head articulation riding through the block — cause: neck box placement/bone assignments at `samples/voxelWolf.ts:108-125` — fix: bind the neck volume to the neck chain (or split it across `neckBase`/`neckTop`) so it follows the child joint in flex poses.

## wanderingMerchant — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, and both flex shots were inspected; the five-finger hands, separate lower jaw, planted feet, staff/lantern, and pack-frame contents are attached/readable, and the pack hangings are intentionally suspended rather than accidental body detachment. Counts: 400 parts, 10,788 triangles, 54 joints, 1.231 × 2.663 × 1.627 m.

## warthogAstra — latest v13; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Several facial wart spheres float away from the head — evidence: head close-up visibly shows detached cheek/brow spheres; current report-only lists four loose head clusters (`sphere.head.3` gap 14 mm, `sphere.head.8` 13 mm, `sphere.head.12` 11 mm, `sphere.head.7` 10 mm) — cause: wart parts are placed as independent head spheres at `samples/warthogAstra.ts:121-143` — fix: seat each wart on a `surface(head)` hit (or increase its embed/offset toward the skull) until the measured gaps are gone.

## warthogGemini — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] The front legs are classified as arms in the rig answer key — evidence: v03 report rig lists `frontLeg_L`/`frontLeg_R` with `role: "arm"` (and `shoulder_L`/`shoulder_R` as arms), although the front limbs visibly end in hooves in the front/three-quarter/side shots — cause: `samples/warthogGemini.ts:354-367` sets both the shoulder and front leg chain roles to `arm` — fix: set these quadruped front-limb joints/chains to `role: "leg"` while retaining the visible shoulder names.
- Clean visually: head close-up shows cheek/snout warts, both upper/lower tusk pairs, and a separate lower jaw; flex-a/flex-b keep the tail/mane and four legs attached. Counts: 70 parts, 2,760 triangles, 31 joints, 0.506 × 1.237 × 1.861 m.

## warthogKimi — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, and flex-a/flex-b were inspected; the four planted legs and paired hooves are present, the separate jaw seam and upper/lower tusks read in the close-up, facial warts/eyes/ears are attached, and the mane and upright tuft follow the tail/spine. Counts: 35 parts, 2,408 triangles, 29 joints, 0.470 × 0.945 × 1.741 m.

## warthogOx — latest v02; current: typecheck clean, report-only same
- Verdict: minor
- [P1] Ears read as oversized circular discs rather than warthog ears — evidence: v02 head close-up and front/three-quarter sheet show two broad round plates dominating the top of the head, unlike the intended small leaf-shaped ears — cause: ear extrudes use the very broad outline/orientation at `samples/warthogOx.ts:171-189` — fix: use a narrower pointed leaf outline and seat/rotate it against the skull so the ear silhouette is triangular and smaller.

## warthogSonnet — latest v03; current: typecheck clean, report-only differs: triangles 5,980 → 5,842
- Verdict: clean
- Clean: v03 front, three-quarter, side, head close-up, and flex-a/flex-b were inspected, plus the current preview; four planted legs with split hooves, two upper/lower tusk pairs, the separate jaw, cheek/snout/brow warts, ears, mane, and tufted tail all read correctly and stay attached. The current 5,842-triangle preview is within budget and has no sunk parts; the count-only drift is tessellation, not a visible defect.

## witchCottageDiorama — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Roof assembly visibly floats above the cottage, with a stray ochre roof block suspended in the gap — evidence: `v03-front.png` shows the entire gold roof separated from the wall top and a discrete gold cuboid hanging left of the chimney; report-only also lists 16 loose body clusters, largest gap 270 mm — cause: roof boxes/ridge and front thatch pieces are independently placed at `samples/witchCottageDiorama.ts:157-164` — fix: lower/resize the roof pieces to overlap the wall/eaves and attach the stray cuboid to the roof assembly (or remove that accidental fragment while keeping the roof design).

## wyvern — latest v03; current: typecheck clean, report-only differs: triangles 7,280 → 4,656; size y 2.302 → 2.305
- Verdict: clean
- Clean: v03 front, three-quarter, side, head close-up, and flex-a/flex-b were inspected, plus the current three-quarter/front preview; the four bird legs are planted, both wings have complete finger membranes, the jaw is separate, the eye/crest hinge details are attached, and the continuous neck/tail skin remains connected in the flex shots. Current preview bounds sink only 3.5 mm, within the 2% allowance; the count drift is tessellation only and no current report issue is present.

## SDK patterns
- None established from this batch; the two current report count drifts (warthogSonnet and wyvern) were inspected in current previews and did not produce a shared visible SDK fault.
