LLM-written 3D code usually fails orientation at the convention boundary: local-vs-world axes, model-front-vs-camera-forward, transform order, and Euler signs/units ([Three.js](https://github.com/mrdoob/three.js/issues/13753), [OpenSCAD](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations)).
The strongest practical fix is to make orientation relational (aim at a target, align an axis/vector, attach anchors, or place a workplane) instead of asking the model to derive several angles ([Three.js](https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js#L452-L493), [BOSL2](https://github.com/BelfrySCAD/BOSL2/blob/master/attachments.scad), [CadQuery](https://cadquery.readthedocs.io/en/latest/workplane.html)).
The strongest documented feedback loop is SceneCraft: relational constraints + Blender render + GPT-V critique + code revision; it reports constraint score 88.9 vs 5.6 for BlenderGPT and a 38.4-point staged ablation drop (64.5→26.1) when the inner loop is removed ([paper](https://arxiv.org/html/2403.01248v1#S3.SS1)).
The strongest open-source skill evidence is img2threejs: explicit chirality rules, direction/anchor language, deterministic multi-angle gates, and vision review; it says front-only review let defects pass and requires turntables ([skill](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md)).
These tools catch different problems: visual review catches semantic “faces the wrong way,” while CAD/mesh validators catch topology, normals, manifoldness, and geometry facts; neither replaces an explicit coordinate convention ([img2threejs](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md), [OCCT](https://dev.opencascade.org/doc/refman/html/class_b_rep_check___shell.html), [Blender](https://docs.blender.org/api/current/bpy.ops.mesh.html#bpy.ops.mesh.normals_make_consistent)).

# Findings

## 1. What actually goes wrong

### 1.1 The same word “forward” names different local axes

Three.js’s implementation is unusually explicit about the split: `Object3D.lookAt()` “Rotates the object to face a point in world space,” while its source calls out that non-uniformly-scaled parents are unsupported. The implementation passes `(target, position, up)` for regular objects and `(position, target, up)` for cameras/lights, so regular objects and cameras use opposite look-at matrix conventions. Source: [three.js Object3D.js](https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L698-L730).

The Three.js maintainer’s answer to a real “camera attached backwards” issue says: “`Object3D.lookat( vector )` orients an object so the object's _positive_-z axis points in the direction of `vector`. Cameras are the exception.” It adds: “`Camera.lookat( vector )` orients the camera so the camera's _negative_-z axis points in the direction of `vector`.” This is practitioner evidence from the project’s own issue tracker, not an inference. Source: [three.js issue #13753](https://github.com/mrdoob/three.js/issues/13753).

Godot exposes the convention mismatch as an API parameter rather than leaving it to the caller: `Node3D.look_at(target, up, use_model_front)` has `use_model_front`; the docs say `false` uses local `-Z` as forward, while `true` uses local `+Z` as model front. Godot also states that target and up cannot be collinear because roll is undefined. Source: [Godot Node3D docs](https://docs.godotengine.org/en/stable/classes/class_node3d.html#class-node3d-method-look-at).

Blender exposes the equivalent operation as `Vector.to_track_quat(track, up)`, documented as returning “a quaternion rotation from the vector and the track and up axis,” with an explicit track-axis string. Source: [Blender mathutils API](https://docs.blender.org/api/current/mathutils.html#mathutils.Vector.to_track_quat).

**What this fixes:** an imported mesh pointing backward after `lookAt`, camera rigs facing away, or a model whose “front” is not the primitive/object’s assumed axis.

**Evidence status:** API documentation and a real three.js issue demonstrate the cause and workaround; no claim that any one API eliminates all asset-axis mistakes.

### 1.2 Transform order and pivot semantics produce “wrong rotation” that is not just a sign error

OpenSCAD’s manual says transformations affect child nodes and that cascading transformations are evaluated right-to-left. It gives the concrete contrast: `translate(...) rotate(...) cube(...)` rotates first and then translates, while `rotate(...) translate(...) cube(...)` moves first and then rotates around the origin, causing the object to travel along an arc. Source: [OpenSCAD User Manual—Transformations](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#Basic_concept).

The same manual specifies Euler order and the right-hand rule: for `rotate([a,b,c])`, `a` rotates +Y toward +Z around +X, `b` rotates +Z toward +X around +Y, and `c` rotates +X toward +Y around +Z. Source: [OpenSCAD rotate and rotation-rule sections](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#rotate).

CadQuery’s official skill prompt treats local workplanes as the safety boundary. It says: “After `.workplane()`, coordinates are **local** to that plane, not global.” It also gives `cq.Plane(origin=(...), normal=(...))` for arbitrary planes and `.transformed(... rotate=(...))` for local offsets. Source: [jmwright/cadquery-llm-skill `SKILL.md`](https://raw.githubusercontent.com/jmwright/cadquery-llm-skill/main/SKILL.md).

**What this fixes:** parts orbiting around world origin instead of rotating in place; holes/extrusions appearing on the wrong side of a face; a roof or chevron being mirrored because a local plane was silently treated as world coordinates.

**Evidence status:** official manual/API semantics plus a real CadQuery maintainer discussion showing users inspect `mywp.plane.zDir` to recover the actual normal. Source: [CadQuery discussion #1522](https://github.com/CadQuery/cadquery/discussions/1522). The link demonstrates a debugging technique, not a benchmark.

## 2. Prompt rules people actually put in agent skills

These are verbatim excerpts from real, versioned open-source skill/prompt files. They are not recommendations invented for this report.

### 2.1 img2threejs: explicit chirality, measured signs, and multi-view gates

The project’s always-loaded agent skill has this exact rule:

> “Every `-l`/`-r` pair is a MIRROR, not a rotation — hard at spec time (`validate_chirality`).”

It then gives the convention and failure mode:

> “A left/right pair is a **reflection**, never a rotation: negate the lateral axis and nothing else, `(x, y, z) → (-x, y, z)`. With `forward: +Z`, Y up and a right-handed frame, the character’s own left is **+X**.”

It adds the normal/winding correction:

> “Reflecting also inverts triangle winding — flip it back on the mirrored side or `flatShading` lights the limb as though lit from behind.”

Source: [img2threejs `SKILL.md`, “Left and right”](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md).

The companion animation prompt warns against copying signs between coordinate systems:

> “The sign table in Step 5 in particular must be re-derived for your own axes; copying it is how a gait ends up playing backwards.”

It requires a forward-kinematics check:

> “**Verify the signs by forward kinematics, never by eye.** Reversed signs play the gait backwards, and because the pose stays symmetric it is not obvious — it just reads as moonwalking.”

Source: [img2threejs GLB character animation prompt](https://raw.githubusercontent.com/img2threejs/img2threejs/main/docs/GLB_CHARACTER_ANIMATION_PROMPT.md).

For render feedback, the skill says:

> “A non-planar form must hold from ≥2 angles (`diagnose_render_multi_angle.py`).”

And it gives a concrete failure observation:

> “Silhouette IoU reads ~11% of figure cells: a model with its face deleted scored the same 0.8803 as the finished face.”

It therefore requires turntable captures and deterministic gates before AI vision, rather than trusting a single screenshot. Source: [img2threejs `SKILL.md`, gates section](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md).

**What this fixes:** mirrored left/right parts that preserve appearance in a frontal view; animation signs that produce a symmetric but backwards gait; false passes where silhouette similarity hides missing or misoriented internal parts.

**Evidence status:** the repository reports measured defects and hard-gate behavior in its own contracts; this is strong engineering evidence for the pipeline’s design, but not an independent controlled study.

### 2.2 CadQuery LLM skill: local-frame rules instead of angle arithmetic

The real CadQuery agent skill says:

> “A workplane is a local 2D coordinate system. Most geometry is created relative to it.”

Its operational rule is:

> “After `.workplane()`, coordinates are **local** to that plane, not global.”

For ambiguous frame placement it says:

> “Arbitrary origin and normal — must use `cq.Plane`, not keyword args on Workplane.”

For stability it says:

> “`centerOption` controls what ‘center’ means … Always set it explicitly when position matters.”

Source: [CadQuery LLM Skill](https://raw.githubusercontent.com/jmwright/cadquery-llm-skill/main/SKILL.md).

**What this fixes:** wrong-side extrusions, face holes in the wrong orientation, and geometry that is rotated 90°/180° because a face-local frame was mistaken for world XYZ.

**Evidence status:** prompt rule backed by CadQuery’s official workplane model; the skill itself does not publish a before/after orientation benchmark.

### 2.3 A prompt rule that generalizes across engines

The repeated pattern in these real skills is not “memorize one correct Euler sign.” It is: declare the frame, derive a direction from geometry, use a native aim/track/plane operation, then verify from multiple views. **[INFERENCE]** This is the common abstraction visible across img2threejs, CadQuery, Blender’s `to_track_quat`, Godot’s `use_model_front`, and Three.js’s look-at/quaternion APIs.

## 3. Angle-free or angle-reduced placement APIs

### 3.1 Three.js: target points, direction vectors, and endpoint alignment

Three.js’s `Object3D.lookAt` takes a target point in world space and uses the object’s `up` vector to resolve the remaining roll. Source: [Object3D source](https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L698-L730).

For a part that needs to align an axis to a direction, `Quaternion.setFromUnitVectors(vFrom, vTo)` is a direct primitive. Its source says:

> “Sets this quaternion to the rotation required to rotate the direction vector `vFrom` to the direction vector `vTo`.”

It explicitly assumes normalized direction vectors and handles opposite vectors as a special case. Source: [Three.js Quaternion source](https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js#L452-L493).

**Technique:** define a rod/cylinder/cone in a canonical local axis, compute `dir = b - a`, use `setFromUnitVectors(canonicalAxis, normalize(dir))`, and place at `(a+b)/2`; or use `lookAt` on a helper when a target point and up direction are meaningful.

**What this fixes:** the truck-wheel style error where a model manually guesses `90 - a` rather than deriving orientation from the same radial/tangent vector used for placement; rods, spikes, rails, and pipes with arbitrary endpoints.

**Evidence status:** API-level evidence; the source proves the method’s contract, not that an LLM will choose it without prompting.

### 3.2 Blender: `to_track_quat` and Track To constraints

Blender’s `Vector.to_track_quat(track, up)` makes the track axis and up axis explicit, avoiding manual `atan2`/Euler composition. Source: [Blender API](https://docs.blender.org/api/current/mathutils.html#mathutils.Vector.to_track_quat).

For animated targets, Blender’s Track To constraint is the relational equivalent: a source object tracks a target while the chosen track/up axes define the frame. The API’s constraint docs are indexed under [Blender Track To constraint](https://docs.blender.org/api/current/bpy.types.Constraint.html).

**Technique:** compute `direction = target - source`; assign `direction.to_track_quat('-Z', 'Y')` for a camera/light or the mesh’s documented forward/up axes; use a Track To constraint when the target moves.

**What this fixes:** camera/model forward-axis confusion and gimbal-prone hand-written Euler trigonometry.

**Evidence status:** official API contract; no orientation-specific LLM benchmark found in the inspected sources.

### 3.3 Godot: `look_at` with an explicit model-front switch

Godot’s `look_at` API takes `target`, `up`, and `use_model_front`. The docs explicitly distinguish camera forward (`-Z`) from model front (`+Z`) and reject an up vector that is zero or collinear with the look direction. Source: [Godot Node3D look_at](https://docs.godotengine.org/en/stable/classes/class_node3d.html#class-node3d-method-look-at).

**Technique:** use `look_at(target, Vector3.UP, true)` for assets whose front is +Z; use `false` for camera-style -Z forward; do not silently add a 180° patch when the API can state the semantic front.

**What this fixes:** imported Blender/glTF characters that turn their backs to a target; undefined roll when looking parallel to up.

**Evidence status:** official API design explicitly encodes the asset-vs-camera distinction; no end-to-end agent success metric found.

### 3.4 CadQuery: planes, selected faces, and workplane-relative operations

CadQuery’s official documentation says workplanes “have a center point and a local coordinate system,” and that CadQuery transforms 2D points from workplane coordinates to world coordinates. Source: [CadQuery workplanes](https://cadquery.readthedocs.io/en/latest/workplane.html).

**Technique:** place a feature on the selected face (`faces(">Z").workplane()`), or construct `cq.Plane(origin, xDir, normal)` explicitly for an angled frame. Use face/edge selectors and tags rather than recomputing Euler offsets.

**What this fixes:** face-relative holes, bosses, and extrusions that have the right dimensions but the wrong side/orientation.

**Evidence status:** official design documentation and an LLM-specific skill; no controlled orientation benchmark.

### 3.5 OpenSCAD/BOSL2: semantic anchors and `orient=` instead of raw Euler vectors

Core OpenSCAD has `translate` and `rotate`, but its manual makes transform nesting and right-hand rule explicit. Source: [OpenSCAD transformations](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations).

BOSL2 adds a higher-level attachment DSL. Its source defines:

> “an anchor is a place on an object that you can align the object to, or attach other objects to using `attach()` or `position()`.”

It defines orientation as:

> “Orientation is rotating an object so that its top is pointed toward a given vector direction.”

And it specifies the operation order:

> “An object is first be translated to its anchor position, then spun, then oriented.”

Source: [BOSL2 `attachments.scad`](https://github.com/BelfrySCAD/BOSL2/blob/master/attachments.scad).

**Technique:** declare anchors on parts and attach child anchors to parent anchors; use `orient=UP/DOWN/FRONT/...` or direction vectors. Keep raw rotations only for intentional spin around the oriented axis.

**What this fixes:** guessed offsets for “on top of,” “flush to,” “attached to,” and “pointing along”; pivot mistakes when repeated parts are mirrored or mounted.

**Evidence status:** concrete open-source DSL design and implementation comments; no published LLM success rate.

## 4. Relational and constraint-based layout

### 4.1 SceneCraft: scene graph → constraints → render → VLM critique → code revision

SceneCraft is a primary research source specifically about LLMs writing Blender code. Its abstract describes converting text into Blender-executable Python, building a scene graph of spatial relationships, translating relations into numerical constraints, rendering, and iteratively refining with a vision-language model. Source: [SceneCraft arXiv paper](https://arxiv.org/html/2403.01248v1).

The paper’s layout section says a layout matrix contains position, scale, and orientation. The planner uses relations such as proximity, alignment, and parallelism; a solver optimizes layout matrices instead of asking the LLM to directly guess every matrix. Source: [SceneCraft §2.2](https://arxiv.org/html/2403.01248v1#S2.SS2).

A particularly relevant documented correction is Figure 4 and the surrounding text: the first parallelism implementation considered only positions; GPT-V identified that orientation similarity must also be scored, and the library learner retained that change. Source: [SceneCraft Figure 4 / §2.4](https://arxiv.org/html/2403.01248v1#S2.SS4).

**What this fixes:** assets that are in the right row or near the right object but face sideways/backwards; “parallel by position” but not parallel by visual front; object arrangements that satisfy coordinates while violating the text’s functional relation.

**Evidence status:** strongest quantitative evidence in this survey. On 40 synthetic queries (20 used to build the library, 20 held out), the paper reports SceneCraft constraint score **88.9** vs BlenderGPT **5.6**; removing the inner loop drops the score to **26.1**, a **38.4-point** decrease from 64.5 in the staged ablation table. It also reports CLIP similarity **69.8** vs **24.7**. These are the paper’s exact reported numbers, not recomputed values. Source: [SceneCraft experiments and Table 1](https://arxiv.org/html/2403.01248v1#S3.SS1).

The paper’s human comparison reports SceneCraft win rates of **83.6%** for composition/constraint agreement versus **11.4%** for BlenderGPT, over 22 responses. Source: [SceneCraft Table 2](https://arxiv.org/html/2403.01248v1#S3.SS1).

**Caveat:** the paper’s metrics evaluate scene-constraint satisfaction, not a dedicated “Euler sign error” benchmark. **[INFERENCE]** The orientation correction is direct evidence that relational scoring helps the class of errors Stefan describes, but it does not prove every spike/roof/wheel error will be caught.

### 4.2 img2threejs: anchors, chirality, and hard gates around a vision loop

img2threejs describes itself as code-only procedural Three.js reconstruction with a staged pipeline and “an AI-vision self-correction loop.” It requires each pass to be rendered and compared, then inserts deterministic gates before AI vision. Source: [img2threejs `SKILL.md`](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md).

Its relevant relational rules include measured pivots/sockets/action anchors in the spec, exact one-parent attachment for props, geodesic/capsule binding for joints, and explicit left/right reflection rather than 180° rotation. The character prompt says: “Props must anchor to exactly one parent bone (e.g., hand bone, not split between pelvis and hand).” Source: [GLB character animation prompt](https://raw.githubusercontent.com/img2threejs/img2threejs/main/docs/GLB_CHARACTER_ANIMATION_PROMPT.md).

**What this fixes:** accessories that drift or follow the wrong body part, bilateral parts that are visually plausible but chirally wrong, and motion that looks correct in a rest pose but reverses during animation.

**Evidence status:** repository contracts include measured failure examples and explicit gate commands; no published aggregate precision/recall for the gates.

## 5. Render-and-critique feedback loops: useful, but view-dependent

### 5.1 Multi-view is not optional for 3D orientation

SceneCraft’s inner loop renders Blender scenes and sends the image plus description to GPT-V, which identifies unsatisfied semantic relations and revises constraints/scripts. Source: [SceneCraft §2.3](https://arxiv.org/html/2403.01248v1#S2.SS3).

img2threejs explicitly rejects a single review viewpoint for non-planar forms and requires at least two meaningful orbit views. Its contract gives a concrete reason: a front-only silhouette/IoU gate can pass an object with a missing face; it reports the face-deleted model and finished face both scoring **0.8803** on that metric. Source: [img2threejs gates](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md).

OpenSCAD MCP is a practical tool implementation with live base64 PNG feedback and named isometric/front/back/left/right/top/bottom views. Source: [openscad-mcp README](https://github.com/jabberjabberjabber/openscad-mcp). Its README documents the visual loop and camera coverage but does not report an orientation-error detection rate.

**What this fixes:** mirrored chevrons or roofs that look plausible from one camera, radial/tangential tread blocks that only reveal their error off-axis, and front/back mistakes hidden by symmetry.

**Evidence status:** SceneCraft has quantitative end-to-end evidence; img2threejs has explicit gate rationale and measured examples; OpenSCAD MCP has a concrete multi-view mechanism but no reported benchmark.

### 5.2 What vision review catches poorly

A single 2D image can make depth direction, roll, and foreshortening ambiguous. **[INFERENCE]** This follows from projection: without an axis gizmo, shadows, or another view, a part tilted toward the camera can resemble a shorter part or a part tilted away. The practical response in the sources is not to trust the VLM’s intuition alone: use multiple views, semantic markers/anchors, and deterministic geometry checks before the VLM.

A review prompt should therefore name the intended relation (“spike tip aims away from hub,” “roof ridge is above eaves,” “stripe’s long axis is tangent to ring”) and show a frame/axis marker. This is a recommendation derived from the documented scene-graph and multi-angle designs, not a quoted external rule. **[INFERENCE]**

## 6. Automatic orientation/geometry validation

### 6.1 Normals and winding

Blender provides two useful deterministic primitives. `Mesh.validate()` validates geometry and returns true when invalid geometry was corrected/removed. `bpy.ops.mesh.normals_make_consistent(inside=False)` makes face and vertex normals point outside or inside the mesh. Sources: [Blender Mesh.validate](https://docs.blender.org/api/current/bpy.types.Mesh.html#bpy.types.Mesh.validate) and [Blender normals_make_consistent](https://docs.blender.org/api/current/bpy.ops.mesh.html#bpy.ops.mesh.normals_make_consistent).

These checks catch flipped triangle winding and invalid geometry, but they cannot know whether a semantically meaningful spike points toward the intended target. **[INFERENCE]**

Open CASCADE has a topology-level validator: `BRepCheck_Shell::Orientation()` checks whether oriented shell faces are correctly oriented, while `Closed()` checks that oriented faces form a closed shell. Source: [OCCT BRepCheck_Shell](https://dev.opencascade.org/doc/refman/html/class_b_rep_check___shell.html).

**What this fixes:** normals pointing inward after mirroring, inconsistent face orientation, non-orientable or open shells that make booleans/solids unreliable.

**Evidence status:** official API contracts; these are automatic checks with deterministic outputs, but they validate shell orientation—not semantic object-facing intent.

### 6.2 Symmetry and chirality checks

img2threejs’s `validate_chirality` and `medial_lateral_bias` intentionally separate two failures: a rotation mistaken for a reflection, and a pair that is wrong the same way on both sides. Its prompt states that both are needed because a pair wrong symmetrically can pass a mirror test. Source: [img2threejs gates and left/right contract](https://raw.githubusercontent.com/img2threejs/img2threejs/main/SKILL.md).

**What this fixes:** two right hands, mirrored left/right details with identical appearance from the front, and reflection-induced normal inversion.

**Evidence status:** project-reported measured defects and gate contracts; no independent benchmark.

### 6.3 Physical and manifold checks in AI-CAD products

AgentSCAD’s README states its architecture principle: “LLMs write code; deterministic tools govern geometry facts.” It reports deterministic checks for manifoldness, minimum wall thickness, outer bounds, and hole connectivity after OpenSCAD renders/export. Source: [AgentSCAD README](https://github.com/Kevoyuan/AgentSCAD).

These checks are useful guardrails for printability and topology, but the README does not claim they detect a roof’s semantic pitch or a wheel stripe’s tangential-vs-radial direction. **[INFERENCE]**

## 7. Practitioner/project issue evidence (labelled)

- **Project issue (Three.js):** [#13753](https://github.com/mrdoob/three.js/issues/13753) records a camera attached to a parent appearing backwards. The maintainer explains the +Z regular-object / -Z camera convention and confirms the 180° local rotation workaround. This is first-party project discussion.
- **Project issue (Three.js):** [#27104](https://github.com/mrdoob/three.js/issues/27104) records a camera snap when the look direction becomes parallel to the up direction. The maintainer says orientation is under-determined in that case. This directly supports guarding the aim/up singularity.
- **Maintainer discussion (CadQuery):** [#1522](https://github.com/CadQuery/cadquery/discussions/1522) shows a user asking for a workplane normal and the maintainer answering to inspect `mywp.plane.zDir`; explicit frame introspection is the practical fix.
- **Practitioner thread (OpenSCAD, Reddit):** [r/openscad “noob question 3”](https://www.reddit.com/r/openscad/comments/td0f8s/noob_question_3_is_there_a_way_to_change_or/) discusses transform nesting and changing orientation. Treat this as anecdotal practitioner evidence only; the official OpenSCAD manual is the authoritative source for the semantics.

## 8. Practical recipe for the agentic Three.js case

1. **Declare one frame in the prompt/spec:** `+Y up`, right-handed, and the model’s semantic forward axis (for example `+Z`). Also state whether “left” is +X or -X for the object.
2. **Give every primitive a canonical axis:** cylinder/cone axis, box long axis, roof ridge direction, stripe long axis. Do not let the model infer it from a screenshot.
3. **Prefer relation constructors:** `aim/face/track`, `setFromUnitVectors`, endpoint-based rod/cylinder placement, ring/tangent helpers, anchors, or a local workplane. Use Euler angles only for a named local spin/pitch and keep units explicit.
4. **Keep position and orientation derived from the same vector:** for a ring detail, derive both point and tangent/radial direction from `a`; never compute position from `a` and rotation from an unrelated `90-a` shortcut.
5. **For bilateral geometry, mirror coordinates, do not rotate 180°:** then reverse winding/repair normals and run a chirality check.
6. **Render at least front/right/top or a 4-view turntable:** include axes/grid and semantic markers when orientation matters. A single beauty render is not enough evidence.
7. **Run deterministic checks first:** normal/winding, mesh validity, manifoldness, attachment constraints, chirality/symmetry, self-intersection, and endpoint/axis dot-product checks. Then ask a vision model to critique semantic relations.
8. **Make the reviewer output a relation-level patch:** name object, intended direction, observed direction, axis/frame, and exact correction; avoid “rotate it a bit.”
9. **Record evidence and stop conditions:** preserve the render, view list, deterministic reports, and reviewer decision; do not call a symmetric or front-only pass “done.”

**Why this is likely to help Stefan’s failure:** the known wheel bug is exactly a decoupled position/orientation derivation. Direction/endpoint constructors and an explicit tangent/radial invariant remove the need for mental angle arithmetic. This sentence is an application to Stefan’s example, marked as an inference from the APIs and documented pipeline behavior.

# Search terms that worked

- `SceneCraft LLM Blender GPT-V orientation constraint score`
- `img2threejs SKILL.md chirality turntable gate`
- `three.js issue camera attached backwards parent lookAt positive z negative z`
- `three.js quaternion setFromUnitVectors endpoint alignment`
- `Blender mathutils Vector.to_track_quat track up`
- `Godot Node3D look_at use_model_front`
- `CadQuery LLM skill workplane local coordinate system`
- `BOSL2 attachments anchor orient direction vector`
- `OpenSCAD transformations right-to-left rotate translate`
- `OpenSCAD MCP live visual feedback multiple camera views`
- `Open Cascade BRepCheck_Shell Orientation Closed`
- `Blender mesh normals_make_consistent validate geometry`

# Sources

## Primary docs and source code

1. Three.js `Object3D.lookAt` implementation: https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L698-L730
2. Three.js `Quaternion.setFromUnitVectors`: https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js#L452-L493
3. Blender `Vector.to_track_quat`: https://docs.blender.org/api/current/mathutils.html#mathutils.Vector.to_track_quat
4. Blender `Mesh.validate`: https://docs.blender.org/api/current/bpy.types.Mesh.html#bpy.types.Mesh.validate
5. Blender `normals_make_consistent`: https://docs.blender.org/api/current/bpy.ops.mesh.html#bpy.ops.mesh.normals_make_consistent
6. Godot `Node3D.look_at`: https://docs.godotengine.org/en/stable/classes/class_node3d.html#class-node3d-method-look-at
7. Unity `Transform.LookAt`: https://docs.unity3d.com/ScriptReference/Transform.LookAt.html
8. Unity `Quaternion.FromToRotation`: https://docs.unity3d.com/ScriptReference/Quaternion.FromToRotation.html
9. OpenSCAD User Manual transformations: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations
10. CadQuery workplanes: https://cadquery.readthedocs.io/en/latest/workplane.html
11. Open CASCADE `BRepCheck_Shell`: https://dev.opencascade.org/doc/refman/html/class_b_rep_check___shell.html
12. BOSL2 attachment/orientation source: https://github.com/BelfrySCAD/BOSL2/blob/master/attachments.scad

## Open-source agent/tool prompts and implementations

13. img2threejs agent skill: https://github.com/img2threejs/img2threejs/blob/main/SKILL.md
14. img2threejs GLB character animation prompt: https://github.com/img2threejs/img2threejs/blob/main/docs/GLB_CHARACTER_ANIMATION_PROMPT.md
15. CadQuery LLM skill: https://github.com/jmwright/cadquery-llm-skill/blob/main/SKILL.md
16. OpenSCAD MCP README: https://github.com/jabberjabberjabber/openscad-mcp
17. AgentSCAD README: https://github.com/Kevoyuan/AgentSCAD
18. SceneCraft paper: https://arxiv.org/html/2403.01248v1

## First-party issue/discussion evidence

19. Three.js issue #13753 (camera parent lookAt convention): https://github.com/mrdoob/three.js/issues/13753
20. Three.js issue #27104 (look direction parallel to up): https://github.com/mrdoob/three.js/issues/27104
21. CadQuery discussion #1522 (inspect workplane `zDir`): https://github.com/CadQuery/cadquery/discussions/1522

## Practitioner evidence (labelled anecdotal)

22. Reddit r/openscad transform/orientation thread: https://www.reddit.com/r/openscad/comments/td0f8s/noob_question_3_is_there_a_way_to_change_or/
