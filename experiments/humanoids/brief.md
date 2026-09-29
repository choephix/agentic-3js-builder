# Humanoid round

Four builders get the same two subjects at the same time. Each works with a different toolkit, described in its own arm file. This round judges the shapes of the body parts: every part reads as the anatomy it is (chest, shoulders, arms, hands, abdomen, hips, legs, feet, head and face), from every angle and in both flex shots.

`GUIDE.md` is the sample contract, the model conventions and the snapshot loop; `README.md` is the API. Read both in full. Where this brief and `GUIDE.md` differ, this brief wins.

## Subjects

`<Arm>` is your arm's name with a capital first letter (`Control`, `Sculpt`, `Contour`, `Blob`).

1. `samples/lifeguard<Arm>.ts`: a beach lifeguard, an athletic man about 1.85 m tall. Shirtless, red swim trunks, barefoot, a whistle on a cord round his neck, sunglasses pushed up on his head, a stripe of white zinc sunscreen on his nose. Stylized game-character look with believable anatomy: he reads as a fit adult man.
2. `samples/sprinter<Arm>.ts`: a sprinter, an athletic woman about 1.70 m tall. Crop top and running briefs, running spikes, a race bib on the top, hair in a high ponytail. Stylized game-character look with believable anatomy: she reads as a fit adult woman.

`meta.name` is the subject's name followed by the arm in brackets, e.g. `Lifeguard (Sculpt)`.

## Humanoid requirements

- Rest pose: an A-pose. Arms out and down about 45° from horizontal, clear of the torso, palms facing down and slightly forward; legs straight, feet about hip-width apart, toes forward; fingers extended and slightly spread, the thumb apart from them; mouth closed, built as a separate jaw.
- Skeleton with standard humanoid names: `hips`, `spine`, `spine1`, `spine2`, `neck`, `head`, `jaw`, and per side `shoulderL` (clavicle), `upperArmL`, `lowerArmL`, `handL`, `thumb1L`–`thumb3L`, `index1L`–`index3L`, `middle1L`–`middle3L`, `ring1L`–`ring3L`, `pinky1L`–`pinky3L`, `upLegL`, `legL`, `footL`, `toeL` (and the same with `R`). More joints (ponytail, eyes) are welcome. Chains carry roles.
- The whole body is modelled, including hands with five fingers and feet with toes or a toe box.
- It bends like a body in both flex shots: no gaps, cracks or loose pieces at the joints.

## Budget

- At most 6 snapshots per subject (tags `v01` to `v06`). A snap that fails with a GPU, WebGL or context-loss error doesn't count: wait a minute and retry the same tag.
- `--report-only` runs are free.

## Working alongside the other builders

- Three other builders work in this repository at the same time. Write only your own files: your two samples, the files your arm file names, `experiments/humanoids/notes/<arm>.md`, and throwaway scripts under `scratch/<arm>/`.
- Git stays untouched: no staging, committing, stashing, checking out or resetting.
- `npm run typecheck` checks everyone's files. Errors in files that aren't yours are another builder's work in progress; yours must be clean.
- The browser on port 9333 is shared and already running; `snap` connects to it. It stays running: never start, stop or restart it.
- `README.md` and `GUIDE.md` stay as they are.

## Notes

Your deliverable besides the samples is `experiments/humanoids/notes/<arm>.md`, factual, with these sections:

- `## Result`: per subject, the slug, final tag, parts, triangles, joints, colours and height.
- `## Toolkit`: what your arm's toolkit is and how it works, its API, and its limits. Name every change to an existing `src/` file.
- `## Process`: per subject, what each snapshot changed and why.
- `## Friction`: what was hard, what you wrote by hand, and what you'd want from the SDK.
- `## Verdict`: which body parts came out best and worst, and how much the toolkit helped.

## Final reply

Per subject: slug, final tag, part, triangle, joint and colour counts, height. Then the path of your notes file.
