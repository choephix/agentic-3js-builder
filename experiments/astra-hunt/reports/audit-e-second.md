# Audit group e — second look

## mantisShrimp — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] All six orange walking-leg chains are detached from the abdomen/thorax at their hip roots, with 17–22 mm gaps — evidence: `v03-side.png` and `v03-flex-a.png` show the thin walking legs hanging below the pale underside instead of emerging from it; `npm run preview -- mantisShrimp --gap sweep.legs abdomen` measures a 22.4 mm closest-point gap (`[0.036, 0.081, 0.068]` to `[0.023, 0.098, 0.062]`), and current report-only lists the six leg clusters 17–22 mm from the abdomen — cause: `samples/mantisShrimp.ts:454-460` hard-codes hip roots at `y = 0.078` and `x = ±0.040`, while `:468-472` sweeps each chain without burying/overlapping the thorax — fix: derive each hip root from the thorax/abdomen surface (or extend/bury the first leg segment) so every leg overlaps the body with no visible gap.

Samples I agree are clean on second look: leafTanuki, leafySeadragon, lifeguardBlob, lifeguardContour, lifeguardControl, lifeguardSculpt, lighthouseCove, littleLich, mantaRay, mochiCatBaker, moose, mossStoneGolem, mushroomGolemBoss, mushroomVillage, neonScorpion.

Existing first-pass findings confirmed but not repeated as new defects: lizardfolkHunter, marginaliaSnailKnight, mimicHermitCrab.
