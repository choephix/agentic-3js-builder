# Sample audit

You audit a batch of samples in agentic-3js-builder (`/home/cx/noodlespace/agentic-3js-builder`): primitive-built, skeleton-rigged three.js models in `samples/<slug>.ts`, each built by a language model from `GUIDE.md`. The deliverable is a defect list per sample that a later agent can fix from without re-investigating. Every sample stays in the library; you are listing what to fix, never recommending removal.

## Read first

- `GUIDE.md`: the contract every sample meets (real size, stands on y = 0, rest pose, separate upper and lower jaw, named joints and chain roles, limits) and the art direction.
- `docs/conventions.md`, and `docs/api.md` as needed to judge whether a fault is the sample's or the SDK's.

## Per sample

1. Latest render: `~/tmp/public/nilo/agentic-3js-builder/snaps/<slug>/<B|A>/snaps/` (B rigged, A plain objects). The latest tag is the highest `vNN…` prefix (check file times when tags are irregular). Look at `<tag>-sheet.jpg` and the single shots that matter (`three-quarter`, `side`, `head`, `flex-a`, `flex-b`, `skeleton`, `skeleton-side`), and read `<tag>-report.json`.
2. Current state: the SDK changed after many renders. Run `npm run typecheck -- <slug>` and `npm run snap -- <slug> --report-only` on the current code and compare with the latest report (issues, parts, triangles, joints, bounds). If the counts or bounds differ, or the report-only run shows something the render can't, take `npm run preview -- <slug> --shot` to see the current model. Full `snap` renders are off limits (one shared GPU).
3. Read the sample's source where a defect needs a cause.

## What to look for

- Contract faults: floating or detached parts (hooves off legs, crowns above heads), sinking below or hovering above the floor, missing or fused jaw, wrong limb count, wrong scale, a pose that isn't a neutral rest pose, parts inside-out, z-fighting, hairline cracks, typecheck errors, report issues.
- Rig faults: joints outside the mesh or in the wrong place, chains missing `role`, unrecognisable joint names, parts riding the wrong bone (visible in `bones` and the flex shots: tearing, stretching, rigid pieces that should bend), held items not on their own bone.
- Readability: features the subject needs that are missing or wrong (anatomy, the subject's signature details), clearly broken textures, decals or paints.
- Budget: triangles over 60k, parts over 1000, fine meshes the report lists.

## Rules

- Read-only: no edits to any file in the repo, no git commands that change state. Other agents work in this checkout at the same time. Scratch files, if you need any, go under `scratch/audit-<group>/`.
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- Only report what you saw or measured. Give each defect the view or measurement that shows it.

## Calibration

An empty report issue list and unchanged counts say nothing about how the model looks. A first pass marked nesYeti clean: its sheet shows a yeti standing on four legs (front and hind hips) where the subject is bipedal, with the face block riding high on the head. That is the kind of fault this audit exists to catch. Open every sample's sheet and the close-up shots as images and look: count limbs, find the jaw, check each part sits on what it belongs to, compare the anatomy with the real subject. A clean verdict names what you looked at and why it holds up.

## Report

Your report file is `scratch/astra-reports/audit-<group>.md`. Create it at the start and append each sample as soon as it is done, so nothing is lost if your session ends early. Each sample:

```
## <slug> — latest <tag>; current: typecheck <clean|N errors>, report-only <same|differs: …>
- Verdict: clean | minor | needs fix | broken
- [P0|P1|P2] <defect> — evidence: <shot path or measurement> — cause: <sample line or SDK area> — fix: <concrete change>
```

P0: breaks the contract or rig (detached, floating, missing jaw, typecheck error, report issue). P1: clearly visible flaw. P2: polish. A clean sample gets one line. Where several samples share a fault caused by the SDK, say so in a closing `## SDK patterns` section.

## Final reply

The report path, the verdict counts, and the worst five defects, one line each.
