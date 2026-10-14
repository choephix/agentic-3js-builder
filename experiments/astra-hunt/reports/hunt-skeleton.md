# Skeleton bug hunt

### SKELETON-1: A second parentless joint is silently parented instead of rejected
- Severity: P1 (documented skeleton invariant is not enforced; malformed rigs are accepted with a misleading hierarchy)
- Repro: `scratch/hunt-skeleton/hunt-skeleton-roots.ts` — `npx tsx scratch/hunt-skeleton/hunt-skeleton-roots.ts`; the first block creates `root`, then `b.joint("second", { at: [0.2, 1, 0] })` without `parent`.
- Expected: `docs/api.md:75` requires “Exactly one root joint (the first `joint` without `parent`); a second one throws”; `docs/api.md:163` says an omitted parent is only for the first root.
- Actual: Output was `SECOND_ROOT_RESULT root [ 'root', 'second' ]`: the second call succeeds and `second.parent.name === "root"`. The caller receives two joints rather than an error.
- Cause: `src/skeleton.ts:65` sets `parent` to `null` only when `options.parent` is omitted *and* `ctx.rootJoint` is absent; once a root exists it falls through to `boneFor(...)`, which resolves the nearest existing joint. There is no explicit second-root check.
- Fix: if `options.parent === undefined && ctx.rootJoint` exists, throw the documented second-root error before resolving the fallback parent; retain nearest-joint fallback only for explicitly parented/at-derived cases.

Known friction confirmed (still present): the documented `Role` union/guide has `spine neck head jaw hinge tail leg arm wing digit tentacle fan` but no `pelvis` or `foot`; callers must encode pelvis/root as `spine` and feet as chain tips (`docs/STATUS.md:163`, `docs/api.md:165`).

Known friction confirmed (still present): `Chain.tip` remains typed `Joint | null` even when a names array has exactly spans+1 entries and the runtime always creates the tip (`docs/STATUS.md:189`, `src/skeleton.ts:200`, `src/skeleton.ts:304-313`).

## Covered
- Chain naming/counts: a 3-point path produced two span joints plus a third named tip for `names.length === spans + 1`; parents were `root → hipL → kneeL`; `ts` was `[0, 0.5, 1]`. A one-name-per-span array and invalid name count both behaved as documented (`scratch/hunt-skeleton/hunt-skeleton-roots.ts`, `hunt-skeleton-names.ts`).
- `chain.at(t)` exposed `.at`, `.bone`, `.t`, `.tangent`, `.normal`, `.binormal`; at the middle joint `weightsAt(0.5)` blended the adjacent span joints 0.5/0.5, while endpoints were rigid. Mirrored chains at ±X recorded `L`/`R` sides (`hunt-skeleton-roots.ts`).
- Duplicate joint names, malformed names, and malformed chain name counts threw immediately (`hunt-skeleton-names.ts`).
- The rig answer key contained role, side, default and explicit contacts, and jaw hinge data; default contact moved from `[1,2,0]` to `[-1,0,0]` after posing, explicit contact did the same, the leg side changed to `C` as its joints crossed the mid-plane, and the jaw hinge remained the current world axis (`hunt-skeleton-rig.ts`, `hunt-skeleton-contact.ts`).
- A root-only rig assembled successfully with one joint and no harness errors when it had one mesh; 160 joints were accepted and 161 produced the harness error `161 joints exceeds the 160 limit` (`hunt-skeleton-root-only.ts`, `hunt-skeleton-limits.ts`).
- Bone orientation/roll checks for forward/down/up/left/right directions and a 90° chain twist matched the documented +Y-along-bone and transported normal convention (`hunt-skeleton-orientation.ts`).
- A two-joint mirrored fan/ring answer key updated its pivot axis from `[0,1,0]` to `[-1,0,0]` after a 90° root pose, and grouped item counts stayed `2,2` (`hunt-skeleton-ring.ts`).
