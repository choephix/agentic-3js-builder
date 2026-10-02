# Audit group c — second look

## feltPlushSloth — latest v07; current: typecheck clean, report-only same (63 parts, 11,464 triangles, 44 joints, bounds 1.102 × 1.422 × 0.822 m; 0 issues)
- Verdict: minor
- [P1] Eye-button embellishments are visibly skewed/flattened across the eye patches instead of sharing the patch surface normal — evidence: `~/tmp/public/nilo/agentic-3js-builder/snaps/feltPlushSloth/B/snaps/v07-head.png` shows the eye patch/button stacks with a narrow sideways thread/button sliver rather than concentric surface-facing accents — cause: `samples/feltPlushSloth.ts:210-229` feeds `patch.moved(...)` into `b.stick` for the shank/button/lid details, while `src/frame.ts:51-53` passes `quat.invert()` as the moved frame quaternion and derives its facing from that inverted quaternion — fix: preserve the original quaternion in `Frame.moved()` and use a clone only for the facing conversion, then rerender the eye details and confirm both stacks stay normal to the skull.

## SDK patterns
- `Frame.moved()` orientation corruption is visible in this sample's eye details; the affected calls are `patch.moved()` at `samples/feltPlushSloth.ts:215,218` (shared cause `src/frame.ts:51-53`).

Agreed clean (second-look sheets, head close-ups, and flex/skeleton shots; no additional defects): curiosityJackalope, cyberpunkNoodleStall, delftWindmillDiorama, dieselpunkWarElephant, dosBasilisk, dreadKnight, dromedaryCaravan, eggshellDragonling, flowerHedgehog, flyingFox, gameboyFrog, gingerbreadGolem, giraffe, goldenPheasant, graffitiSkateRat. Prior first-pass findings reconfirmed, not repeated here: emperorPenguin, gbcSlimeKing, giantAnteater.
