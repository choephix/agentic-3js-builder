# Arm B: sculpt

## Result

|           | Lifeguard                                                                                                                    | Sprinter                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| slug      | `lifeguardSculpt`                                                                                                            | `sprinterSculpt`                                                       |
| final tag | `v01`                                                                                                                        | `v01`                                                                  |
| parts     | 89                                                                                                                           | 72                                                                     |
| triangles | 38,960                                                                                                                       | 37,308                                                                 |
| joints    | 53                                                                                                                           | 57                                                                     |
| colours   | 15 flat (skin, nails, eye white, iris, pupil, lips, brow, hair, trunks red, trim white, lanyard, whistle, frame, lens, zinc) | 13 flat + 1 texture (the bib, "247")                                   |
| height    | 1.869 m with hair (body 1.85 m)                                                                                              | 1.684 m with ponytail base clear of the top (about 1.70 m as designed) |
| report    | 0 errors, 0 warnings                                                                                                         | 0 errors, 0 warnings                                                   |

The sprinter was made by transforming the lifeguard's source (all coordinates scaled by 0.905, then by hand: narrower shoulders, wider hips, softer muscle amounts, bust, crop top, briefs, spikes, bib, ponytail chain, no zinc / whistle / sunglasses), so it inherits the lifeguard's weaknesses.

Both samples have the required skeleton (`hips`, `spine`, `spine1`, `spine2`, `neck`, `head`, `jaw`, clavicle, arm, hand, 15 finger joints per hand, leg, foot, toe), chains with roles, a separate jaw, eyes as separate parts, and hands with five fingers and nails. The lifeguard's feet have five toes with nails; the sprinter's feet are spiked shoes with a toe box (the `toe` joint carries no mesh).

## Toolkit

`src/experimental/sculpt.ts`: `sculpt(b, { mirror? })` returns `sc` with five brushes that reshape already-built meshes (sweeps, lofts, `Part`s, joints' meshes, raw meshes). The module doc comment documents it in `docs/api.md` style.

- `sc.push(t, { at | path, dir, amount, radius })`, `sc.flatten(t, { at | path, dir, radius, strength?, side? })`, `sc.inflate(t, { at | path, amount, radius })`, `sc.crease(t, { path, depth, radius })`, `sc.smooth(t, { at | path, radius, strength?, passes? })`. Common options: `core` (full-strength share of the radius), `mirror` (default true, across x = 0), `edge` (longest triangle edge left in the region).
- `at` is any Point (joint, hit, `sweep.at(t)`, literal), `path` any Path (point array, `catmull`, chain, `sweep.line`); a path is a stroke, so one call sculpts a muscle. `dir` is any Direction. `radius`, `amount`, `depth` are a number, `[a, b]`, keyed numbers or `(t) => number` along the stroke.
- How it works: one pass reads every target mesh into a shared welded vertex table (welded by position, so meshes that share a boundary, such as colour bands, move together), splits long edges inside the region (regular 1/2/3-edge splits, every mesh agreeing on each shared edge, so no T-junctions or cracks), displaces vertices from the pre-brush shape, recomputes normals (75° crease angle, across meshes; faceted meshes stay faceted), and writes the mesh back. New vertices take the mean skin weights of their edge ends, so the skin still bends with the skeleton, and rigid meshes stay rigid. A brush and its mirror blend into one (weight is the max, displacement is the weighted mean), so a brush across the centre line never doubles.
- Limits: painted, textured and card meshes can't be sculpted (throws); refinement is edge splitting only (no collapse), so triangles accumulate where many brushes overlap (thin creases are the most expensive); shading is recomputed per sculpted mesh, so a sculpted mesh next to an unsculpted one can show a faint shading step; `sweep.at(t)` keeps answering with the as-built tube (`b.surface(...)` queries see the sculpted shape); meshes are re-skinned after each brush.
- Changes to existing `src/` files, both additive: `src/builder.ts`: `Builder.ctx` went from `private readonly` to `readonly` (the layer needs the context). `src/context.ts`: `skinMesh` now replaces a mesh's earlier skin closure when called again (a `WeakMap<Mesh, () => void>`), so re-skinning a sculpted mesh doesn't leave the stale closure in `ctx.skins`. No existing sample changes (single-call meshes behave exactly as before).

## Process

`--report-only` runs and a scratch preview page (throwaway bundle of the sample rendered in a separate headless browser, under `scratch/sculpt/`) did the iteration; only the two final renders went through `snap`. The layer proof used one `sculptTest` render (deleted afterwards).

Layer changes made while building the subjects: default `edge` and refinement threshold (edges only split beyond 1.5 × `edge`; first version overshot and doubled triangle counts, torso 26k → 7k), crease default edge two thirds of its radius, `core` and `flatten.side` (needed for the foot sole), `Builder.ctx`, and re-skinning in `skinMesh`.

Lifeguard: v01 is the only render. Before it, in preview: blockout of the body with sweeps (legs and arms as one tube each over their chain, torso as a loft over `[hips, spine]`, palm as a flat loft on the hand bone, fingers as chains, feet as tubes with toes) → torso brushes (pectorals, abs with creases, obliques, back, glutes) → limb brushes (quads, hamstrings, calf, shin, deltoid, biceps, triceps, forearm) → head (first as lofts: lamp-shade shape and a jaw hidden by the neck, so replaced with two ellipsoid parts, cranium and jaw, then sculpted: brow, sockets, nose, cheeks, chin) → eyes, lips, brows, ears, hair on a tilted loft (high hairline in front, low behind), sunglasses, whistle on a draped lanyard → trunks (first a separate shell, which z-fought and left crotch gaps; replaced by a colour function on the torso and leg tubes plus draped hem and waist rings).

Sprinter: v01 only. Scaled copy of the lifeguard; crop top and briefs as colour ranges on the torso and leg tubes, straps draped on the sculpted body, textured bib stuck on the chest, ponytail chain with a hair tie, spiked shoes (sole flattened up 1 cm, cones underneath).

## Friction

- Wrote by hand: the whole layer (about 600 lines), the ellipsoid head, and every stroke position. `front()/back()/side()` helpers shoot rays at the torso and `on(tube, t, dir)` picks the surface point of a tube facing a direction; the SDK has neither `sweep.at` by facing direction nor a surface-point-by-view helper, so strokes need those.
- Triangle cost is the main pain: each brush splits and never merges, so 40+ overlapping brushes reach 20k triangles on the body. The SDK would need edge collapse or a remesh after a batch of brushes.
- Thin features (ab lines, creases) are only as good as the vertex spacing: a crease not passing through vertices comes out shallow or as dots. Bolder depths and wider radii read better than thin ones.
- Loft/sweep caps extend by the largest radius, so heads built from vertical lofts come out too tall or bulleted; a scaled `SphereGeometry` part sculpts far better. A `sweep` with a `contour`-like section or an ellipsoid primitive would help.
- Sweep radius keys are source `t`, and changing a chain's length (moving the hand out of the arm tube) silently shifts every brush that used `t`; I rescaled by hand. Hits or named surface points would avoid this.
- The regexp scaling used to make the sprinter mangled some non-coordinate numbers (joint name arrays, calls with expressions); an SDK-level "build at scale" or a units factor would make body variants cheap. Parametric proportions are the real fix: a `humanoid(spec)` would have been better than two hand-built copies.
- What I'd want from the SDK: a garment helper (offset shell of a region of an existing tube), a mirror helper, and `Surface.drape` that smooths the path so lanyards and rims don't jitter over facets.

## Verdict

- Best: torso and limbs. Chest, abdomen, back, glutes, thighs, calves, deltoids and forearms read as the anatomy they are from every angle, follow the skeleton in both flex shots with no cracks, and one stroke per muscle was quick. The skin colour-range trunks, hems and waistband came out clean once garments stopped being separate shells. Hands (flat palm loft plus chained fingers with nails, brushes for thenar, knuckles) and the lifeguard's feet (arch, heel, five toes) are recognisable; the spiked shoes are simple.
- Worst: the face and the sprinter's female shape. The face is a sculpted ellipsoid: nose, brow and lips read, but the jaw is a separate lump that looks too deep at some angles, the eyes stare, the lip tubes are a bit duck-like, and the hair is a helmet with a few grooves. The sprinter keeps the lifeguard's male limb muscularity and long neck, its chest is flat under the crop top, and thumbs are stiff sticks on both subjects.
- How much the toolkit helped: a lot for muscle volume and fine surface detail on already-blocked-out tubes (impossible to get from sweeps alone), and the mirrored strokes halved the work. It didn't help where the blockout was wrong (head proportions, garments, the female silhouette), and the triangle cost of many brushes is the main thing to fix.
