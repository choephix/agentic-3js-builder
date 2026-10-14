# Texture/decal bug hunt

### TEXDECAL-1: Warm-grey SVGs silently bypass the documented tint
- Severity: P1 (wrong textured output on a plausible drawing)
- Repro: `scratch/hunt-texdecal/hunt-texdecal-tint.ts` — `npx tsx scratch/hunt-texdecal/hunt-texdecal-tint.ts`; it reports `#8a8888 { coloured: false, material: 'ff0000' }` versus `#908080 { coloured: true, material: 'ffffff' }`.
- Expected: `docs/api.md:459` and `docs/conventions.md:153` say drawings only in greys are tinted by the part's `color`; a warm grey should therefore be treated as a grey drawing and multiplied by the requested tint.
- Actual: SVG fill `#8a8888` (R/G/B differ by only 2/255) sets `texture.userData.coloured === false`, so a red part keeps material colour `#ff0000` rather than treating the image as coloured; `#908080` (difference 16/255) flips to `coloured === true` and forces material tint to `#ffffff`. The boundary is an undocumented channel spread of about 0.03, not “grey vs coloured”.
- Cause: `src/texture.ts:94-114` (`inColour`) returns true only when `max(rgb)-min(rgb) > 0.03`; `src/parts.ts:88` then suppresses tint for any texture marked coloured.
- Fix: classify near-greys with a documented/perceptual tolerance appropriate to raster quantisation (or classify only clearly chromatic colours), and add a regression around warm greys such as `#8a8888`.

### TEXDECAL-2: Missed decal rays collapse grid cells into zero-area slivers
- Severity: P1 (silent wrong geometry for a normal decal extending past a target edge)
- Repro: `scratch/hunt-texdecal/hunt-texdecal-decal.ts` — `npx tsx scratch/hunt-texdecal/hunt-texdecal-decal.ts`; the `ray-miss` record is `vertices: 15`, x columns `[-0.01, 0.115, 0.24, 0.25, 0.25]` repeated over 3 rows, `triangles: 16`, `minTriangleArea: 0`, `maxTriangleArea: 0.01250000037`.
- Expected: `docs/api.md:498` promises a grid projected onto the surface; a drawing partly outside a finite target should be clipped/omitted at the boundary (or at minimum not emit degenerate triangles).
- Actual: A 0.5 m square plane, decal centre x=0.24, size 0.5 m and segments 4×2 produces rays whose rightmost 2 columns miss. The fallback snaps each miss to `surface.nearest()`, producing duplicate x=0.25 vertices and zero-area triangles, i.e. stretched/vanishing slivers while retaining UVs for the full drawing.
- Cause: `src/decal.ts:94-95` replaces every missed `skin.ray(...)` with `skin.nearest(flat)`; `src/decal.ts:99-103` always indexes every grid cell without removing cells with misses. The comments at `104-117` only raise cells over modest normal turns and do not handle missed rays.
- Fix: retain hit/miss state, clip or drop cells whose corners miss (with UV clipping if desired), rather than substituting nearest points and triangulating duplicate vertices.

### TEXDECAL-3: Decals are always smooth-shaded across sharp target edges
- Severity: P1 (wrong visible shading on ordinary low-poly textured parts)
- Repro: `scratch/hunt-texdecal/hunt-texdecal-shading.ts` — `npx tsx scratch/hunt-texdecal/hunt-texdecal-shading.ts`; a decal across a BoxGeometry front/right edge has a shared edge vertex normal `[0.893886, 0, 0.448294]`, neither the front face `[0,0,1]` nor side face `[1,0,0]`.
- Expected: the SDK's stated low-poly convention (`docs/api.md:612`) preserves facets; `docs/api.md:199` exposes `flat: true` for part/stick, and a decal over a faceted box should not invent a rounded highlight across its 90° edge.
- Actual: `b.decal` calls `meshFromWorld(..., true, ...)`, sharing grid vertices and computing interpolated normals. A decal crossing a sharp BoxGeometry edge gets blended normals (the measured corner normal above), so lighting smooths the edge even though the target is faceted. There is no decal `flat` option.
- Cause: `src/decal.ts:123-130` hard-codes the `smooth` argument true; `src/context.ts:335-338` documents that this path computes shared smooth normals.
- Fix: add a decal shading option (defaulting according to target/low-poly policy) or split/flat-shade vertices where adjacent hit normals turn sharply; document the choice.

### TEXDECAL-4: Unmarked coloured Texture inputs are treated as tintable greys
- Severity: P1 (documented coloured texture is silently multiplied by the part colour)
- Repro: `scratch/hunt-texdecal/hunt-texdecal-rawtexture.ts` — `npx tsx scratch/hunt-texdecal/hunt-texdecal-rawtexture.ts`; a raw 1×1 red `DataTexture` reports `userDataColoured: undefined`, `blueMaterial: '0000ff'`, `blueAtlasRGBA: [0,0,0,255]`, while `whiteAtlasRGBA: [255,0,0,255]`.
- Expected: `docs/api.md:459` / `docs/conventions.md:153` say a coloured drawing shows its own colours, and `#ffffff` is the identity tint. `PartOptions.texture` is typed as any three.js `Texture`, not only `svg()` output.
- Actual: A valid raw red `DataTexture` has no `userData.coloured` marker, so `src/parts.ts:88` leaves the requested blue material as the tint. The atlas multiplies red × blue to black (`[0,0,0,255]`) instead of preserving red; only the white tint is identity.
- Cause: `src/parts.ts:88` relies exclusively on optional `texture.userData.coloured`, which only `svg()` sets; `harness/atlas.ts:78-83` always applies the material tint to texture pixels.
- Fix: define/document an explicit coloured-texture marker or inspect/require texture colour metadata for all accepted Texture inputs, then force coloured textures to `#ffffff` (while retaining explicit tinting for greys).

## Covered
- `svg()` validation and sizing: valid `viewBox` SVGs returned 8-pixel textures in Node, and the 8..2048 clamp/aspect logic was exercised by the repro; malformed/no-size markup follows the documented throw path.
- SVG identity/atlas behavior: two separate `svg()` calls with identical markup produce distinct UUIDs, but `buildAtlas` byte-deduplicated them (`packed: 1`, same tile `{x:40,y:8,w:16,h:16}`), so the suspected “new tile per helper call” is not reproduced for identical raster bytes. Reusing one texture remains preferable for object/source metadata overhead.
- Decal `dir` convention: planes tested with outward `dir` `[0,0,1]`, `[0,0,-1]`, `[1,0,0]`, and `[-1,0,0]` produced matching decal normals, confirming rays travel inward while the returned sheet faces outward.
- `at` offset on a slanted plane: a 45° plane with `at` moved 0.25 m outward produced all decal vertices at the plane plus the requested 1.5 mm lift (`distance along normal` min/max `0.001500001..0.001500006`); no offset bug reproduced.
- Posed/skinned target: a small 0.1 m decal on a smooth skinned sweep stayed 1.5 mm from the posed surface before and after a 35° joint pose (`beforeMaxDistance = afterMaxDistance = 0.001499996`, skin bones `arm0, arm1`).
- Texture options on `sweep`, `loft`, `extrude`, and `lathe`: source option types contain no `texture`, matching `docs/api.md:422` (these SDK shapes use Paint) and `docs/api.md:459` (texture is on `part`/`stick`); no docs/code mismatch found.
- Ordinary `#808080`/`#888888` SVGs are classified grey and tint correctly; strongly chromatic `#ff0000` is classified coloured and remains as drawn.
