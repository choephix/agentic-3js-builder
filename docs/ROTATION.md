# Wrong-way rotations: diagnosis and research

Stefan's observation (2026-10-27): across almost every model-built subject, with and without the SDK, some details face the wrong way. Spikes point inward, diagonal "V" details are mirrored, pitched roofs come out as a V instead of a Λ, tread blocks on a wheel tilt inconsistently. Some things are always right, others wrong.

Full research, with links: `research/rotation-papers.md` (studies and benchmarks), `research/rotation-practice.md` (how tools and agent skills handle it), `research/rotation-conventions.md` (conventions per tool, from official docs).

## Our case: the r33pfmd2 truck wheel

`bakeoff/rounds/r33pfmd2/builds/r33pfmd2Truck2077RichParflat.ts:254-263` places 8 stripe boxes around the hub at angle `a`, position `[y, z] = [cos a, sin a] × 0.5`, and orients each with `rotation: [90 − a, 0, 0]` (XYZ degrees). The right value is `[a, 0, 0]`: in three.js a positive X rotation turns +Y toward +Z. With the wrong sign and offset, each stripe is off from pointing out of the hub by `|90° − 2a|`: radial at 45° and 135°, sideways at 0°, 90° and 180°, diagonal between (checked with three.js `Euler`). The same formula orients the tread blocks, centre ribs, sidewall stripes, rim spokes and two more rings (lines 237, 245, 260, 273, 312, 335): one slip, copied six times.

`dir: [0, cos a, sin a]` (or `b.ring` about the axle) would have taken position and orientation from the same numbers.

Usage in recent rounds: 73 of r24's 123 builds use Euler `rotation` (171 `rotation: [...]` calls, against 863 `dir:`/`aim:` uses); r34dt 26/40 and 24/40; r33pfmd2 17/19.

## Why it happens

- **Rotation is done by arithmetic with no feedback.** The sign of an Euler angle is the right-hand rule applied correctly every time. Nothing checks it before render.
- **Conventions differ in the training data.** three.js and glTF are right-handed, Y-up; Blender and OpenSCAD are Z-up; Unity is left-handed; CSS is screen-down and clockwise. Euler order differs (three.js and Blender XYZ, Unity extrinsic ZXY, Godot YXZ), and so do units (three.js radians; the SDK and OpenSCAD degrees) and which axis a cylinder runs along (Y in three.js, Z in Blender). Sources: `research/rotation-conventions.md`.
- **Models measurably can't tell clockwise from counter-clockwise.** RotBench: GPT-4o called 52 of 300 clockwise image rotations correctly, and 90° vs 270° confusion survived captions, depth maps and chain of thought. 3DSRBench: GPT-4o 21.6% on object orientation questions against humans' 97.7%. These are vision benchmarks, not code; no paper counts sign or mirror errors in generated 3D code.
- **"Sometimes right":** a wrong sign is only visible when the object isn't symmetric under it. A box turned 180° looks the same; a roof, spike, chevron or single diagonal doesn't. [INFERENCE: geometry, not a measured result.]
- **Mirrored pairs** add a second sign: the position flips with `s = ±1`, and the angle may or may not need to. img2threejs's agent skill states it as a rule: a left/right pair is a reflection, never a rotation.

## Fixes, by strength of evidence

1. **Render-and-check loops (strongest measured result, not orientation-specific).** SceneCraft (Blender code): constraint score 88.9 with a render plus vision-critique loop, 26.1 without it. BlenderGym: more verifier calls improve edits. Both use several views; one front view hides mirrored details (img2threejs requires a turntable).
2. **Relations and directions instead of angles.** SceneCraft without its relation graph: 3.2. The APIs that hold up across tools (three.js `lookAt`/`setFromUnitVectors`, Unity `LookRotation`, Godot `look_at`, Blender `to_track_quat`, BOSL2 anchors and `orient=`, CadQuery workplanes) all take a direction plus an up, or two endpoints. This SDK already has `dir`/`aim`/`up`, `b.ring`, `b.spike(base, dir)`, `rod(a, b)`, `slab(points)`.
3. **Explicit frames and axes in the prompt.** SpatialPIN, giving the model explicit axes and poses, took GPT-4o from 69.0% to 87.3% on orientation questions (vision, not code).
4. **Worked examples plus reasoning.** 3D-PreMise: GPT-4 Blender-code pass rate 7.0% → 17.5% with a one-shot example and chain of thought. Plain chain of thought alone is mixed (RotBench; perspective-taking study).
5. **"Be careful with rotation" in the prompt.** No evidence found that it helps.

## Open options for this SDK (Stefan's call)

- In `docs/api.md`/`docs/conventions.md`: orient parts with `dir`/`aim`/`ring`; build slanted shapes (roofs, chevrons) from points; take a ring item's direction from the same expression as its position.
- In `src/`: drop or narrow `rotation` on `b.part` (an API change).
- In the harness: a view check that names the intended relation ("roof ridge above the eaves", "spike tip away from the body"); the turntable shots already exist.

## Search terms

LLM spatial reasoning; mental rotation; perspective-taking; object-centric orientation; clockwise vs counter-clockwise (90°/270°) confusion; handedness / chirality; Euler angle order; look-at / aim constraint; LLM CAD code generation (CadQuery, OpenSCAD, Blender Python); SceneCraft; img2threejs.
