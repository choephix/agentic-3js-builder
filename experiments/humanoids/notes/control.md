# Control arm notes

## Result

| | Lifeguard | Sprinter |
| --- | --- | --- |
| slug | `lifeguardControl` | `sprinterControl` |
| final tag | `v03` (report: 0 errors, 0 warnings) | `v02` (report: 0 errors, 0 warnings) |
| parts | 167 | 161 |
| triangles | 16008 | 15596 |
| joints | 53 | 57 (adds `ponytail1`–`ponytail4`) |
| flat colours | 15 | 17 (+1 texture: the race bib drawing) |
| height | 1.862 m (hair tufts included; body about 1.85) | 1.729 m (ponytail top; head crown about 1.70) |

Both samples were formatted with prettier after the last snapshot (whitespace only).

## Toolkit

The SDK as documented in `README.md`, unchanged: `createBuilder`, `joint`, `chain`, `sweep` (radius `(t) => [rx, ry]`, `shift`, `bone: [joints and chains]`, `bands`, `sectors`), `part`, `stick`, `surface().ray/drape`, `extrude`, `spike`, `capsule`, paint-free flat colours, and `svg()` for the bib. No `src/` file was changed.

How the body is built: every anatomical volume is one of three things.

1. A smooth-skinned sweep whose section is an ellipse driven by height/`t` keys (torso from crotch to neck base on `[hips, spine chain, neck]`; neck; each leg on its 2-joint chain; each arm plus palm on a 3-joint chain with a `twist` ramp that turns the biceps-forward roll into a palm-down hand; fingers and thumb on 3-joint chains; ponytail on a 4-joint chain). A 30-line monotone-spline helper turns key tables into the radius/shift functions.
2. Muscle bellies (pecs, abs, lats, scapulae, calves, biceps, triceps, kneecaps, bust cups) as squashed spheres `stick`ed onto the skin with `surface().ray(...)`, so they take the skin's blended weights and bend with it.
3. Rigid parts on one bone: deltoids, ellipsoid eyes, lids, ears (`extrude`), lips, nose, hair cap, glasses, shoe pieces.

Clothing is the same sweep again, a centimetre out, on the same bones so it bends with the skin. Limits met: `sweep` sections are only ellipses/boxes/ngons, so anything that is not a rounded oval (pecs, abs, calves, cheekbones) is an overlay; fine anatomy such as tendon lines needs paint or overlays. `at()` on a sweep uses a world-up clock that flips arbitrarily on vertical tubes, so `ray`-based placement was used instead. Working helpers in the sample: `spline`, `lump`, `onSkin`, `basis`.

## Process

Free previews: I wrote throwaway scripts in `scratch/control/` (a node dump of world triangles with an emulation of linear-blend flexing, plus a numpy rasteriser) so most iteration happened without spending snaps.

Lifeguard
- `v01`: first full build: torso, legs, arms, hands with five fingers, feet with toes, head, trunks, whistle, glasses, zinc stripe. Showed the skull cap poking above the hair, flat-looking arms, thin calves.
- `v02`: skull top lowered, thicker arms with biceps/triceps/forearm bellies, thicker legs, calf heads, nose/eyes/lips resized, hair tufts, trunks loosened over the thigh muscles.
- `v03`: skull top cut under the hair, clavicle and neck tendons made subtle, zinc stripe changed to a round strip, feet lifted so the lowest point is y = 0. Final.

Sprinter
- `v01`: forked from the lifeguard structure with new female numbers (narrow waist, wider hips, lean limbs, smaller hands and face), crop top with cups and straps, curved race bib (svg drawing on a partial cylinder), briefs, socks, spike shoes with plate and pins, ponytail chain. Report warning: lowest point y = -0.009 (a toe-box radius was a circle, not an ellipse).
- `v02`: toe box radius fixed, shoe raised, spike pins reach y = 0. Final, no warnings.

## Friction

- No way to see the model except the snap: I wrote a software renderer and a flex emulator to iterate. That cost most of the time.
- Chain `up` plus `twist` for a pronated hand needed a computed angle; verified only by nails ending up on the back of the hand.
- `sweep.at(t, deg)` orientation is ambiguous on vertical tubes; ray hits on a `surface` worked instead.
- Round caps extend by the section radius, which silently made a head 2.5 cm taller and a toe box dip through the floor. Only the report caught the latter.
- Wrote by hand: monotone key-table interpolation, ellipsoid overlay helper, all finger/toe layout, the hand frame (palm normal, thumb side), face features, ponytail.
- Wanted from the SDK: a section that is not an ellipse (superellipse/custom polygon per key), a mirror helper for L/R, per-part preview without the GPU snap, cap length control.

## Verdict

- Best: torso and abdomen (ellipse sweep plus stuck muscle bellies reads as a fit body from every angle and flexes cleanly), hands (five fingers, spread, thumb apart, nails), arms, the head's overall structure (separate jaw, closed mouth).
- Weakest: faces (assembled from tubes and spheres, mask-like, narrow), feet-to-leg proportion and thin calves on the lifeguard, muscle overlays that look like pebbles up close, the sprinter's arms and abs being heavier than her frame, small skin patches poking through the lifeguard's trunks at the back.
- The toolkit helped most with skinning: sweeps on chains bend without cracks, and `stick` overlays inherit blended weights. It helped least for organic surface shape: every non-oval form is a hand-placed lump.
